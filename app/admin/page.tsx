import { headers } from 'next/headers';
import { env } from 'cloudflare:workers';
import { requireChatGPTUser } from '../chatgpt-auth';
import { isSurveyOwner } from '@/lib/admin';
import AdminDashboard from './AdminDashboard';
export const dynamic='force-dynamic';
export default async function Admin(){
 await requireChatGPTUser('/admin');
 if(!isSurveyOwner(await headers(),env.ADMIN_EMAIL))return <main className="done-wrap"><section className="done-card"><h1>仅限问卷发起者</h1><p>当前登录账号没有查看答卷的权限。</p><a className="primary" href="/">返回问卷首页</a></section></main>;
 return <AdminDashboard/>;
}
