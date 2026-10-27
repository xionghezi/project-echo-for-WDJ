import { env } from 'cloudflare:workers';
import { verifyAdminIdentity } from '@/lib/admin';
import { privateHeaders } from '@/lib/request-guard';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const authenticatedAdmin=await verifyAdminIdentity(req.headers,env);
 return Response.json({authenticatedAdmin,canManage:env.ADMIN_ACCESS_ENABLED==='true'&&authenticatedAdmin},{headers:privateHeaders});
}
