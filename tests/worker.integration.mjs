import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, VERSION } from '../lib/survey.ts';
const base=process.env.ECHO_TEST_URL;
if(!base || !/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw new Error('Use pnpm test:integration.');
const submit=async(payload,extra={})=>{
  const response=await fetch(base+'/api/responses',{method:'POST',
    headers:{origin:base,'content-type':'application/json',...extra},body:typeof payload==='string'?payload:JSON.stringify(payload)});
  return new Response(await response.arrayBuffer(),response);
};
function payload(experience='none'){
  const answers={};
  for(const q of QUESTIONS)answers[q.id]=q.optional?'':q.max?[q.options[0].id]:q.options[0].id;
  answers.experience=experience;
  return {version:VERSION,mode:'live',consent:true,eligible:true,id:crypto.randomUUID(),answers,duration:30};
}
test('production Worker serves the original survey and a healthy local D1',async()=>{
  const response=await fetch(base);
  assert.equal(response.status,200);assert.match(await response.text(),/回音计划/);
  const health=await(await fetch(base+'/api/health')).json();
  assert.deepEqual(health,{ok:true,version:VERSION});
  const malformed=await submit('{"broken":');
  assert.equal(malformed.status,400,await malformed.text());
});
test('all three experiences persist, retry idempotently, and reject conflicting overwrites',async()=>{
  for(const experience of ['none','reported','unreported']){
    const p=payload(experience);
    const first=await submit(p);assert.equal(first.status,200);
    assert.deepEqual(await first.json(),{ok:true,id:p.id,alreadySubmitted:false});
    const retry=await submit(p);assert.equal((await retry.json()).alreadySubmitted,true);
    p.answers.note='synthetic conflict';
    assert.equal((await submit(p)).status,409);
  }
});
test('real API rejects preview, invalid answers, consent, origin, content type and request size',async()=>{
  for(const patch of [{mode:'preview'},{consent:false},{eligible:false},{version:'old'},{answers:{}},
    {answers:{...payload().answers,note:'x'.repeat(301)}}]){
    assert.equal((await submit({...payload(),...patch})).ok,false);
  }
  assert.equal((await submit(payload(),{origin:'https://attacker.test'})).status,403);
  assert.equal((await submit(payload(),{'content-type':'text/plain'})).status,415);
  assert.equal((await submit('x'.repeat(16001))).status,413);
  assert.equal((await fetch(base+'/api/responses')).status,405);
});
test('real Worker blocks management, RSC and both export scopes even with forged identity',async()=>{
  for(const path of ['/admin','/admin/','/admin.rsc','/%61dmin','/api/export','/api/export?format=csv',
    '/api/export?scope=prelaunch','/api/export?scope=prelaunch&format=csv']){
    const response=await fetch(base+path,{headers:{
      'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test',
      'cf-access-authenticated-user-email':'owner@example.test','cf-access-jwt-assertion':'forged'}});
    assert.equal(response.status,403,path);
    assert.equal(response.headers.get('cache-control'),'private, no-store');
    const body=await response.text();assert.doesNotMatch(body,/synthetic conflict|survey_responses/);
  }
  const session=await(await fetch(base+'/api/session')).json();
  assert.deepEqual(session,{authenticatedAdmin:false,canManage:false});
});
