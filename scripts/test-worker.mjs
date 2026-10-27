import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, realpathSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const state=mkdtempSync(join(tmpdir(),'echo-workers-test-'));
const env={...process.env,WRANGLER_SEND_METRICS:'false',
  WRANGLER_LOG_PATH:resolve('.wrangler/logs'),XDG_CONFIG_HOME:resolve('.wrangler/xdg')};
const cli='node_modules/wrangler/bin/wrangler.js';
const probe=createServer();
await new Promise(done=>probe.listen(0,'127.0.0.1',done));
const port=probe.address().port;
await new Promise(done=>probe.close(done));
const baseUrl='http://127.0.0.1:'+port;
const testConfig=JSON.parse(readFileSync('dist/server/wrangler.json','utf8'));
testConfig.main=resolve('dist/server/index.js');
testConfig.assets={...testConfig.assets,directory:resolve('dist/client')};
testConfig.vars={ADMIN_ACCESS_ENABLED:'false'};
testConfig.routes=[];
for(const database of testConfig.d1_databases)database.migrations_dir=resolve('drizzle');
mkdirSync('.wrangler',{recursive:true});
const testConfigPath=resolve('.wrangler/integration-config.json');
writeFileSync(testConfigPath,JSON.stringify(testConfig,null,2));
function run(args){
  const result=spawnSync(process.execPath,args,{env,encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stdout+'\n'+result.stderr);
}
let server;
try{
  // The integration suite never selects remote D1 or uses a real account.
  run([cli,'d1','migrations','apply','DB','--local','--config',testConfigPath,'--persist-to',state]);
  let logs='';
  server=spawn(process.execPath,[cli,'dev','--config',testConfigPath,'--local',
    '--persist-to',state,'--ip','127.0.0.1','--port',String(port),'--inspector-port','0'],{env,stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',data=>logs+=data);server.stderr.on('data',data=>logs+=data);
  let ready=false;
  for(let attempt=0;attempt<120;attempt++){
    if(server.exitCode!==null)throw new Error(logs);
    try{const response=await fetch(baseUrl+'/api/health',{signal:AbortSignal.timeout(500)});
      if(response.ok){ready=true;break}}catch{}
    await new Promise(done=>setTimeout(done,250));
  }
  if(!ready)throw new Error('Local Worker did not become healthy. '+logs);
  const tests=spawn(process.execPath,['--experimental-strip-types','--test','tests/worker.integration.mjs'],
    {env:{...env,ECHO_TEST_URL:baseUrl},stdio:'inherit'});
  process.exitCode=await new Promise((done,reject)=>{tests.on('error',reject);tests.on('exit',code=>done(code??1))});
  if(process.exitCode)console.error(logs.slice(-5000));
}finally{
  if(server && server.exitCode===null){
    const closed=new Promise(done=>server.once('exit',done));
    server.kill();await closed;
  }
  // Only delete the unique temporary directory created above, after checking its boundary.
  const target=realpathSync(state), parent=realpathSync(tmpdir());
  if(!target.toLowerCase().startsWith((parent+sep).toLowerCase()) ||
    !target.split(sep).at(-1).startsWith('echo-workers-test-'))throw new Error('Unsafe cleanup path.');
  for(let attempt=0;attempt<10;attempt++){
    try{rmSync(target,{recursive:true,force:true});break}catch(error){
      if(attempt===9)throw error;
      await new Promise(done=>setTimeout(done,200));
    }
  }
}
