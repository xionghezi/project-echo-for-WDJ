import { env } from 'cloudflare:workers';
import { isSurveyOwner } from '@/lib/admin';
export async function GET(req:Request){
 return Response.json({canManage:isSurveyOwner(req.headers,env.ADMIN_EMAIL)},{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
}
