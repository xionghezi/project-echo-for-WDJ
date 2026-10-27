import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { localState } from './local-state.mjs';
const command=process.argv[2];
const config=existsSync('wrangler.local.json')?'wrangler.local.json':'wrangler.jsonc';
const args=command==='migrate'
  ? ['d1','migrations','apply','DB','--local','--config',config,'--persist-to',localState]
  : command==='start'
    ? ['dev','--config','dist/server/wrangler.json','--local','--persist-to',localState,'--ip','127.0.0.1','--inspector-port','0']
    : null;
if(!args)throw new Error('Expected migrate or start.');
const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js',...args],{stdio:'inherit',env:process.env});
child.on('error',error=>{console.error(error);process.exitCode=1});
child.on('exit',code=>{process.exitCode=code??1});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
