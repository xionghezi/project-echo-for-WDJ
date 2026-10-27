import { getDb } from '@/db';
import { responses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { validateSubmission, VERSION } from '@/lib/survey';
const noStore={'Cache-Control':'no-store'};
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'请求来源不匹配，请刷新页面后重试。'},{status:403,headers:noStore});
 if(!req.headers.get('content-type')?.includes('application/json'))return Response.json({error:'不支持的提交格式。'},{status:415,headers:noStore});
 if(Number(req.headers.get('content-length')||0)>16000)return Response.json({error:'内容过长。'},{status:413,headers:noStore});
 let payload:unknown;
 try{const raw=await req.text();if(raw.length>16000)return Response.json({error:'内容过长。'},{status:413,headers:noStore});payload=JSON.parse(raw)}catch{return Response.json({error:'提交格式无效，请刷新页面后重试。'},{status:400,headers:noStore})}
 const parsed=validateSubmission(payload);
 if('error' in parsed)return Response.json({error:parsed.error},{status:parsed.status,headers:noStore});
 try{
  const a=parsed.answers;const serialized=JSON.stringify(a);const db=getDb();
  const inserted=await db.insert(responses).values({id:parsed.id,createdAt:new Date().toISOString(),version:VERSION,route:String(a.experience),answers:serialized,duration:parsed.duration}).onConflictDoNothing().returning({id:responses.id});
  if(!inserted.length){
   const prior=await db.select({answers:responses.answers,version:responses.version}).from(responses).where(eq(responses.id,parsed.id)).limit(1);
   if(!prior.length||prior[0].version!==VERSION||prior[0].answers!==serialized)return Response.json({error:'这个答卷编号已经提交过其他内容，未覆盖原答卷。请勿重复提交。'},{status:409,headers:noStore});
  }
  return Response.json({ok:true,id:parsed.id,alreadySubmitted:!inserted.length},{headers:noStore});
 }catch{return Response.json({error:'暂时无法保存。答案仍保留在本机，请稍后重试。'},{status:503,headers:noStore})}
}
