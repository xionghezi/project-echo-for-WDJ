export function makeCloudflareConfig(base, input) {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(input.workerName || '')) throw new Error('Set workerName.');
  if (!/^[0-9a-f]{32}$/i.test(input.accountId || '')) throw new Error('Set your Cloudflare accountId.');
  const id = input.databaseId || '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
      /^0{8}-0{4}-[04]0{3}-[08]0{3}-0{12}$/i.test(id)) throw new Error('Set your real D1 databaseId; placeholder IDs are forbidden.');
  if (!/^[a-zA-Z0-9_-]+$/.test(input.databaseName || '')) throw new Error('Set databaseName.');
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(input.hostname || '') ||
      /(?:workers\.dev|chatgpt\.site)$/i.test(input.hostname)) throw new Error('Set a custom hostname in your Cloudflare zone.');
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(input.accessTeamDomain || '')) throw new Error('Set accessTeamDomain without a trailing slash.');
  if (!/^[a-f0-9]{64}$/i.test(input.accessAudience || '')) throw new Error('Set the Access application AUD tag.');
  if (typeof input.adminAccessEnabled !== 'boolean') throw new Error('adminAccessEnabled must be boolean.');
  return {
    ...base, name: input.workerName, account_id: input.accountId,
    routes: [{ pattern: input.hostname.toLowerCase(), custom_domain: true }],
    workers_dev: false, preview_urls: false,
    vars: {
      ADMIN_ACCESS_ENABLED: String(input.adminAccessEnabled),
      ACCESS_TEAM_DOMAIN: input.accessTeamDomain,
      ACCESS_AUD: input.accessAudience,
    },
    d1_databases: [{
      binding: 'DB', database_name: input.databaseName,
      database_id: input.databaseId, migrations_dir: 'drizzle',
    }],
  };
}
