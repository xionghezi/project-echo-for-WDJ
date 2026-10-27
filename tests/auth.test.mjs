import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT, createLocalJWKSet, exportJWK } from 'jose';
import { createAdminVerifier, isSurveyOwner } from '../lib/admin.ts';
import { guardRequest } from '../lib/request-guard.ts';

const config = {
  ACCESS_TEAM_DOMAIN: 'https://echo-test.cloudflareaccess.com',
  ACCESS_AUD: 'test-audience',
  ADMIN_EMAIL: 'owner@example.test',
  ADMIN_ACCESS_ENABLED: 'true',
};
const keys = await generateKeyPair('RS256');
const publicJwk = { ...await exportJWK(keys.publicKey), kid: 'test-key' };
const verifier = createAdminVerifier(() => createLocalJWKSet({ keys: [publicJwk] }));
async function signed(patch = {}, privateKey = keys.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ iss: config.ACCESS_TEAM_DOMAIN, aud: config.ACCESS_AUD, sub: 'test-owner',
    email: config.ADMIN_EMAIL, type: 'app', iat: now, exp: now + 300, ...patch })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(privateKey);
}
const headers = token => new Headers({ 'cf-access-jwt-assertion': token });

test('valid signed Access application token authorizes only the configured owner', async () => {
  assert.equal(await verifier(headers(await signed()), config), true);
  assert.equal(await verifier(headers(await signed({email:'OWNER@example.test'})), config), true);
  assert.equal(await verifier(headers(await signed({email:'visitor@example.test'})), config), false);
});
test('unsigned identity headers and malformed tokens cannot authorize', async () => {
  const forged = new Headers({'oai-authenticated-user-id':'owner','oai-authenticated-user-email':config.ADMIN_EMAIL,
    'cf-access-authenticated-user-email':config.ADMIN_EMAIL});
  assert.equal(await verifier(forged, config), false);
  for (const token of ['invalid', 'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im93bmVyQGV4YW1wbGUudGVzdCJ9.']) {
    assert.equal(await verifier(headers(token), config), false);
  }
});
test('wrong issuer, audience, expired/future times and missing claims fail closed', async () => {
  const now = Math.floor(Date.now()/1000);
  for (const patch of [{iss:'https://other.cloudflareaccess.com'},{aud:'other'},{exp:now-1},
    {nbf:now+300},{iat:now+300},{exp:undefined},{iat:undefined},{sub:undefined},{email:undefined},
    {type:'service'}, {sub:''}]) {
    assert.equal(await verifier(headers(await signed(patch)), config), false, JSON.stringify(patch));
  }
});
test('invalid signatures and unknown signing keys are rejected', async () => {
  const other = await generateKeyPair('RS256');
  assert.equal(await verifier(headers(await signed({},other.privateKey)),config),false);
  const unknown = createAdminVerifier(() => createLocalJWKSet({keys:[{...publicJwk,kid:'different'}]}));
  assert.equal(await unknown(headers(await signed()),config),false);
});
test('missing configuration and unavailable JWKS deny access', async () => {
  const token = headers(await signed());
  for (const key of ['ACCESS_TEAM_DOMAIN','ACCESS_AUD','ADMIN_EMAIL']) {
    assert.equal(await verifier(token,{...config,[key]:undefined}),false);
  }
  const unavailable = createAdminVerifier(() => {throw new Error('offline')});
  assert.equal(await unavailable(token,config),false);
  assert.equal(await verifier(token,{...config,ACCESS_TEAM_DOMAIN:'https://attacker.test'}),false);
});
test('answer access stays disabled by default even with an identity assertion', async () => {
  assert.equal(await isSurveyOwner(headers(await signed()),{}),false);
  assert.equal(await isSurveyOwner(headers(await signed()),{...config,ADMIN_ACCESS_ENABLED:'false'}),false);
});
test('Worker denies every protected variant before invoking application or database', async () => {
  for (const path of ['/admin','/admin/','/admin.rsc','/%61dmin','/api/export',
    '/api/export?format=csv','/api/export?scope=prelaunch','/api/export/']) {
    let called=false;
    const response=await guardRequest(new Request('https://echo.test'+path),{},async()=>false,()=>{
      called=true;return new Response('private');
    });
    assert.equal(response.status,403,path);assert.equal(called,false);
    assert.equal(response.headers.get('cache-control'),'private, no-store');
  }
});
test('Worker strips legacy headers, preserves public submission, and disables private caching', async () => {
  let observed;
  const next=req=>{observed=req;return new Response('ok')};
  const request=new Request('https://echo.test/api/responses',{method:'POST',body:'{}',
    headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'spoof'}});
  assert.equal((await guardRequest(request,{},async()=>false,next)).status,200);
  assert.equal(observed.headers.has('oai-authenticated-user-id'),false);
  assert.equal(await observed.text(),'{}');
  const admin=await guardRequest(new Request('https://echo.test/admin'),config,async()=>true,next);
  assert.equal(admin.headers.get('cache-control'),'private, no-store');
});
