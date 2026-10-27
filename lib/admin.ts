import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export type AdminConfig = {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_EMAIL?: string;
  ADMIN_ACCESS_ENABLED?: string;
};

const keySets = new Map<string, JWTVerifyGetKey>();
function remoteKeys(issuer: string): JWTVerifyGetKey {
  let keys = keySets.get(issuer);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), { timeoutDuration: 5000 });
    keySets.set(issuer, keys);
  }
  return keys;
}

// Tests supply generated public keys; application callers use the default verifier.
export function createAdminVerifier(resolveKeys = remoteKeys) {
  return async (headers: Headers, config: AdminConfig): Promise<boolean> => {
    const { ACCESS_TEAM_DOMAIN: issuer, ACCESS_AUD: audience, ADMIN_EMAIL: owner } = config;
    const token = headers.get('cf-access-jwt-assertion');
    if (!issuer || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) ||
        !audience?.trim() || !owner?.trim() || !token || token.length > 16384) return false;
    try {
      const { payload } = await jwtVerify(token, resolveKeys(issuer), {
        issuer, audience, algorithms: ['RS256'],
        requiredClaims: ['exp', 'iat', 'sub', 'email', 'type'],
      });
      return payload.type === 'app' && typeof payload.sub === 'string' && !!payload.sub &&
        typeof payload.iat === 'number' && payload.iat <= Date.now() / 1000 &&
        typeof payload.email === 'string' &&
        payload.email.trim().toLowerCase() === owner.trim().toLowerCase();
    } catch {
      // Missing keys, outages, malformed or invalid tokens always deny access.
      return false;
    }
  };
}

export const verifyAdminIdentity = createAdminVerifier();
export async function isSurveyOwner(headers: Headers, config: AdminConfig): Promise<boolean> {
  return config.ADMIN_ACCESS_ENABLED === 'true' && await verifyAdminIdentity(headers, config);
}
