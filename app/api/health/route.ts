import { getDb } from '@/db';
import { responses } from '@/db/schema';
import { VERSION } from '@/lib/survey';
export async function GET(){try{await getDb().select({id:responses.id}).from(responses).limit(1);return Response.json({ok:true,version:VERSION},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false},{status:503,headers:{'Cache-Control':'no-store'}})}}
