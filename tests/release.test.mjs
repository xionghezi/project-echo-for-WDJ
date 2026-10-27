import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,route,valid,cleanAnswers,firstInvalid,VERSION,validateSubmission} from '../lib/survey.ts';
import {csvCell} from '../lib/csv.ts';
function complete(experience='none'){
 const a={experience};
 for(const q of QUESTIONS)if(q.id!=='experience')a[q.id]=q.optional?'':q.max?[q.options[0].id]:q.options[0].id;
 return a;
}
const payload=()=>({version:VERSION,mode:'live',consent:true,eligible:true,id:crypto.randomUUID(),answers:complete(),duration:120});
test('every respondent sees the same 13 questions in the same order',()=>{
 const order=QUESTIONS.map(q=>q.id);
 assert.equal(order.length,13);assert.equal(QUESTIONS.filter(q=>q.optional).length,1);
 for(const experience of ['none','reported','unreported'])assert.deepEqual(route({experience}).map(q=>q.id),order);
 const a=complete('reported');a.channel='advisor';a.experience='none';assert.equal(cleanAnswers(a).channel,'advisor');
});
test('the non-applicable choice works without skipping a question',()=>{
 for(const id of ['channel','response','first_reply','visibility','barrier']){const q=QUESTIONS.find(q=>q.id===id);assert(valid(q,q.max?['na']:'na'))}
 const q=QUESTIONS.find(q=>q.id==='barrier');assert(!valid(q,['na','time']));
});
test('only complete, consented, current formal answers may be saved',()=>{
 assert.equal(firstInvalid(complete()),-1);assert(!('error' in validateSubmission(payload())));
 for(const patch of [{mode:'preview'},{consent:false},{eligible:false},{id:'made-up'},{answers:[]},{answers:{experience:'none'}},{version:'2026-10-27.v1'}])assert('error' in validateSubmission({...payload(),...patch}));
 const a=complete();a.note='x'.repeat(301);assert('error' in validateSubmission({...payload(),answers:a}));
});
test('review catches invalid earlier answers and multiple-choice abuse',()=>{
 const a=complete();delete a.luojia;assert.equal(firstInvalid(a),1);
 a.luojia='never';a.improvements=['guide','receipt','owner','progress'];assert('error' in validateSubmission({...payload(),answers:a}));
 a.improvements=['guide','guide'];assert('error' in validateSubmission({...payload(),answers:a}));
 a.improvements=['none','guide'];assert('error' in validateSubmission({...payload(),answers:a}));
 a.improvements=['made-up'];assert('error' in validateSubmission({...payload(),answers:a}));
});
test('CSV preserves text and neutralizes formula-like input',()=>{
 assert.equal(csvCell('hello, "world"'),'"hello, ""world"""');
 for(const x of ['=1+1','  =HYPERLINK("x")','+cmd','@SUM(A1)','-1','\t=1'])assert(csvCell(x).startsWith('"\''));
 assert.equal(csvCell('中文内容'),'"中文内容"');
});
