import { readFileSync, writeFileSync } from 'node:fs';
import { makeCloudflareConfig } from './cloudflare-config.mjs';

const input = JSON.parse(readFileSync('deploy-config.local.json', 'utf8'));
const base = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const config = makeCloudflareConfig(base, input);
writeFileSync('wrangler.local.json', JSON.stringify(config, null, 2) + '\n');
console.log('Validated wrangler.local.json generated. ADMIN_EMAIL must be set separately with wrangler secret put.');
console.log('Admin answer access: ' + config.vars.ADMIN_ACCESS_ENABLED);
