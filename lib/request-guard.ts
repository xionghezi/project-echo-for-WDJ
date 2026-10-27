import type { AdminConfig } from './admin';

export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'Vary': 'Cookie, Cf-Access-Jwt-Assertion',
};

export async function guardRequest(
  request: Request,
  config: AdminConfig,
  authorize: (headers: Headers, config: AdminConfig) => Promise<boolean>,
  next: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const headers = new Headers(request.headers);
  let stripped = false;
  for (const name of [...headers.keys()]) {
    if (name.startsWith('oai-authenticated-user-')) { headers.delete(name); stripped = true; }
  }
  let path: string;
  try { path = decodeURIComponent(new URL(request.url).pathname); }
  catch { return new Response('Bad request', { status: 400 }); }
  // Also covers RSC requests, subpaths, trailing slashes and encoded segments.
  const protectedPath = path.startsWith('/admin') || path.startsWith('/api/export');
  const sessionPath = path.startsWith('/api/session');
  if (protectedPath && !(await authorize(headers, config))) {
    return Response.json({ error: '管理员访问未启用或身份未获授权。' },
      { status: 403, headers: privateHeaders });
  }
  const response = await next(stripped ? new Request(request, { headers }) : request);
  if (!protectedPath && !sessionPath) return response;
  const safeResponse = new Response(response.body, response);
  for (const [name, value] of Object.entries(privateHeaders)) safeResponse.headers.set(name, value);
  return safeResponse;
}
