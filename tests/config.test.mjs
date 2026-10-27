import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCloudflareConfig } from '../scripts/cloudflare-config.mjs';
const input={workerName:'echo-test',accountId:'a'.repeat(32),databaseName:'echo-test',
  databaseId:'12345678-1234-4234-8234-123456789abc',hostname:'echo.example.test',
  accessTeamDomain:'https://echo-test.cloudflareaccess.com',accessAudience:'b'.repeat(64),adminAccessEnabled:false};
test('deployment config requires a real supplied D1 ID and keeps DB binding',()=>{
  const config=makeCloudflareConfig({},input);
  assert.equal(config.d1_databases[0].binding,'DB');
  assert.equal(config.d1_databases[0].database_id,input.databaseId);
  assert.equal(config.workers_dev,false);assert.equal(config.preview_urls,false);
  assert.equal(config.vars.ADMIN_ACCESS_ENABLED,'false');
  for(const databaseId of ['', '00000000-0000-4000-8000-000000000000','00000000-0000-0000-0000-000000000000','placeholder']){
    assert.throws(()=>makeCloudflareConfig({},{...input,databaseId}));
  }
});
test('configuration rejects wrong accounts, domains, audience and untyped access switches',()=>{
  for(const patch of [{accountId:''},{hostname:'echo.workers.dev'},{hostname:'echo.chatgpt.site'},
    {accessAudience:''},{accessTeamDomain:'http://echo-test.cloudflareaccess.com'},{adminAccessEnabled:'true'}]){
    assert.throws(()=>makeCloudflareConfig({},{...input,...patch}));
  }
});
