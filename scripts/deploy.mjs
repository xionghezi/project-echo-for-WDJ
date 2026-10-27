import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { makeCloudflareConfig } from './cloudflare-config.mjs';
const dryRun = process.argv.slice(2);
if (dryRun.some(arg => arg !== '--dry-run')) throw new Error('Only --dry-run is supported.');
const expected = makeCloudflareConfig(
  JSON.parse(readFileSync('wrangler.jsonc', 'utf8')),
  JSON.parse(readFileSync('deploy-config.local.json', 'utf8')),
);
const actual = JSON.parse(readFileSync('wrangler.local.json', 'utf8'));
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Run pnpm configure:cloudflare first.');
function run(path, args) {
  const result = spawnSync(process.execPath, [path, ...args], { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
// Rebuild so the binding, Worker name and access gate cannot come from stale output.
run('node_modules/vite/bin/vite.js', ['build']);
const built = JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8'));
if (built.name !== expected.name || built.account_id !== expected.account_id ||
    built.d1_databases?.[0]?.database_id !== expected.d1_databases[0].database_id ||
    built.vars?.ADMIN_ACCESS_ENABLED !== expected.vars.ADMIN_ACCESS_ENABLED ||
    built.workers_dev !== false || built.preview_urls !== false) throw new Error('Build configuration mismatch.');
run('node_modules/wrangler/bin/wrangler.js', ['deploy', '--config', 'dist/server/wrangler.json', ...dryRun]);
