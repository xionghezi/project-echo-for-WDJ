import { isSurveyOwner } from '@/lib/admin';
import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { responses } from '@/db/schema';
import { desc, eq, ne } from 'drizzle-orm';
import { VERSION } from '@/lib/survey';
import { exportCsv } from '@/lib/export';
import { privateHeaders } from '@/lib/request-guard';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const headers=privateHeaders;
 if(!await isSurveyOwner(req.headers,env))return Response.json({error:'仅问卷发起者可以查看结果。'},{status:403,headers});
 try{
  const url=new URL(req.url);const legacy=url.searchParams.get('scope')==='prelaunch';
  const rows=await getDb().select().from(responses).where(legacy?ne(responses.version,VERSION):eq(responses.version,VERSION)).orderBy(desc(responses.createdAt));
  if(url.searchParams.get('format')!=='csv')return Response.json({version:VERSION,scope:legacy?'prelaunch':'live',count:rows.length,routes:{reported:rows.filter(r=>r.route==='reported').length,unreported:rows.filter(r=>r.route==='unreported').length,none:rows.filter(r=>r.route==='none').length}},{headers});
  return new Response(exportCsv(rows),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="student-voice-${legacy?'prelaunch':'official'}.csv"`}});
 }catch{return Response.json({error:'暂时无法读取答卷，请稍后重试。'},{status:503,headers})}
}
