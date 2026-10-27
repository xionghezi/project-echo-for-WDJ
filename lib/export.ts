import { QUESTIONS, label } from './survey';
import {csvCell} from './csv';

export function exportCsv(rows:{id:string;createdAt:string;version:string;route:string;duration:number;answers:string}[]){
 const data=[['编号','提交时间（UTC）','问卷版本','经历类型','用时（秒）',...QUESTIONS.map(q=>q.title)],...rows.map(r=>{const a=JSON.parse(r.answers);return [r.id,r.createdAt,r.version,r.route,r.duration,...QUESTIONS.map(q=>label(q,a[q.id]))]})];
 return '\ufeff'+data.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
