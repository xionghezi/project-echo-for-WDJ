export type Answer = string | string[];
export type Answers = Record<string, Answer>;
export type Option = { id: string; label: string; detail?: string; exclusive?: boolean };
export type Question = { id:string; phase:number; title:string; help:string; options?:Option[]; max?:number; optional?:boolean; flow?:boolean };
const o=(id:string,label:string,detail?:string,exclusive?:boolean):Option=>({id,label,detail,exclusive});
export const QUESTIONS:Question[]=[
{id:'awareness',phase:0,title:'遇到问题时，你知道可以向谁反映吗？',help:'请按填写前的了解程度选择。这里的“问题”指学习、生活或学院管理方面的诉求。',options:[o('none','不太清楚','不知道从哪里开始'),o('some','知道一些渠道','但不清楚不同问题应该找谁'),o('clear','比较清楚','知道找谁，也知道如何联系'),o('unsure','暂时无法判断')]},
{id:'luojia',phase:0,title:'你对「珞珈直通车」有多了解？',help:'请选择填写这份问卷之前的情况。没听说过也完全没关系。',options:[o('never','之前没听说过'),o('heard','听说过，但不知道怎么使用'),o('know','知道怎么使用，但还没用过'),o('used','曾经使用过')]},
{id:'experience',phase:1,title:'入学以来，你有过哪种经历？',help:'请选择最接近的一项。后面的题目不会自动跳过；没有对应经历时可选“不适用”。只向朋友吐槽、不希望对方转达，不算反馈。',options:[o('reported','提出过诉求或建议','包括请班委、老师等代为转达'),o('unreported','有过诉求，但没有反馈','想到过，但最后没有提出'),o('none','暂时没有需要反馈的诉求')]},
{id:'channel',phase:1,title:'最近一次，你通过谁或什么渠道反馈？',help:'没有反馈经历，请选“不适用”。如用过多个渠道，以最近一次最先使用的渠道为准。',options:[o('na','不适用：没有反馈经历'),o('advisor','辅导员或学院老师'),o('representative','班委、学生会等学生代表'),o('teacher','任课教师'),o('luojia','珞珈直通车'),o('other','其他渠道'),o('unsure','记不清 / 不方便说明')]},
{id:'response',phase:1,title:'最近一次反馈，目前到哪一步了？',help:'没有反馈经历，请选“不适用”。收到回复和问题解决是两回事，请按实际状态选择。',options:[o('na','不适用：没有反馈经历'),o('no_reply','还没收到任何回应'),o('received','已确认收到，尚无后续说明'),o('processing','已说明正在处理或已转交'),o('resolved','已解决，或已落实改进'),o('explained','未解决，但已解释原因或限制'),o('unsure','不清楚 / 不方便说明')]},
{id:'first_reply',phase:1,title:'第一次收到回应，大约等了多久？',help:'没有反馈经历，请选“不适用”。回应包括“已收到”“已转交”等确认消息。',options:[o('na','不适用：没有反馈经历'),o('day','当天'),o('three','1—3 个工作日'),o('week','4—7 个工作日'),o('longer','超过 7 个工作日'),o('waiting','至今未收到回应'),o('unsure','记不清 / 不方便说明')]},
{id:'visibility',phase:1,title:'等待过程中，你能了解处理进展吗？',help:'没有反馈经历，请选“不适用”。若当场解决，可选“不需要跟进”。',options:[o('na','不适用：没有反馈经历'),o('proactive','能，会收到主动更新'),o('ask','能，但需要自己询问'),o('unclear','不清楚向谁查询'),o('unavailable','询问后仍不了解进展'),o('instant','已当场解决，不需要跟进'),o('unsure','记不清 / 不方便说明')]},
{id:'barrier',phase:1,title:'如果有诉求却没有反馈，主要原因是什么？',help:'如果你没有这类经历，请选“不适用”。最多选 2 项，不需要解释具体事件。',max:2,options:[o('na','不适用：没有这类经历',undefined,true),o('channel','不知道找谁或怎么反馈'),o('minor','问题不大，或后来自己解决了'),o('time','步骤麻烦 / 没有时间'),o('effect','不确定反馈有没有用'),o('privacy','担心隐私或人际影响'),o('other','其他原因'),o('unsure','记不清 / 不方便说明',undefined,true)]},
{id:'improvements',phase:2,title:'以下环节，你最希望优先完善哪些？',help:'最多选 3 项。这些是待讨论的建议，可衔接现有渠道；并非学校已承诺的办理流程。',max:3,flow:true,options:[o('guide','入口指引','不同问题找谁、从哪里提交'),o('receipt','收件确认','知道诉求是否被收到'),o('owner','对接说明','知道由谁处理或转交给谁'),o('progress','进展更新','了解当前状态和预计下一步'),o('reason','结果解释','说明结果，或暂时无法解决的原因'),o('none','现有安排已足够',undefined,true),o('unsure','暂时无法判断',undefined,true)]},
{id:'public_info',phase:2,title:'关于共性问题，你希望看到哪些公开信息？',help:'最多选 3 项。只讨论去除身份信息后的汇总，不公开个人投诉原文。',max:3,options:[o('faq','常见问题与已有答复'),o('status','共性问题的处理进展'),o('rules','负责部门与办理规则'),o('changes','已采纳建议及具体改进'),o('limits','暂未解决的原因与后续安排'),o('none','暂无公开信息需求',undefined,true),o('unsure','暂时无法判断',undefined,true)]},
{id:'privacy',phase:2,title:'共性问题公开时，你更倾向哪种方式？',help:'例如“某课程安排如何调整”的汇总。姓名、学号、联系方式均不应出现在公开内容中。',options:[o('summary','去除身份细节后，汇总公开'),o('consent','即使汇总，也先征求反馈者同意'),o('private','只向反馈者回复，不公开汇总'),o('unsure','暂时没有偏好')]},
{id:'notification',phase:2,title:'你更愿意在哪里看到共性问题的更新？',help:'选择一个主要方式；这是对信息发布方式的偏好，不会订阅消息。',options:[o('group','班级 / 年级群的定期简报'),o('page','一个可以随时查询的固定页面'),o('official','学院公众号或官方网站'),o('representative','通过班委 / 学生代表转达'),o('none','不需要主动推送 / 没有偏好')]},
{id:'note',phase:2,title:'还有什么想补充的吗？',help:'可以写一个例子，或一个小建议。请勿填写姓名、学号、联系方式或可识别他人的细节。',optional:true}
];
export function route(_a:Answers):Question[]{return QUESTIONS}
export function valid(q:Question,a:Answer|undefined){if(q.optional)return a===undefined||(typeof a==='string'&&a.length<=300);if(q.max){if(!Array.isArray(a)||a.length<1||a.length>q.max||new Set(a).size!==a.length)return false;return a.every(x=>q.options?.some(o=>o.id===x))&&!(a.length>1&&a.some(x=>q.options?.find(o=>o.id===x)?.exclusive))}return typeof a==='string'&&!!q.options?.some(o=>o.id===a)}
export function cleanAnswers(a:Answers):Answers{return Object.fromEntries(route(a).filter(q=>a[q.id]!==undefined).map(q=>[q.id,a[q.id]]))}
export function label(q:Question,a:Answer|undefined){if(q.optional)return typeof a==='string'?a:'';return (Array.isArray(a)?a:[a]).map(v=>q.options?.find(o=>o.id===v)?.label||'').join('；')}
export const VERSION='2026-10-27.release1';

export function firstInvalid(a:Answers):number{return QUESTIONS.findIndex(q=>!valid(q,a[q.id]))}
export function validateSubmission(b:unknown):{error:string;status:number}|{answers:Answers;id:string;duration:number}{
 if(!b||typeof b!=='object'||Array.isArray(b))return {error:'提交内容不完整。',status:400};
 const x=b as Record<string,unknown>;
 if(x.version!==VERSION)return {error:'问卷版本已更新，请刷新页面后重新填写。',status:409};
 if(x.consent!==true||x.eligible!==true||x.mode!=='live'||typeof x.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x.id)||!x.answers||typeof x.answers!=='object'||Array.isArray(x.answers))return {error:'填写信息不完整，请返回检查。',status:400};
 const answers=cleanAnswers(x.answers as Answers);
 const invalid=firstInvalid(answers);
 if(invalid>=0)return {error:`第 ${invalid+1} 题尚未完成或选项无效，请返回检查。`,status:400};
 return {answers,id:x.id,duration:typeof x.duration==='number'&&Number.isFinite(x.duration)?Math.max(0,Math.min(86400,Math.round(x.duration))):0};
}
