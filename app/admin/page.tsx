import { headers } from 'next/headers';
import { env } from 'cloudflare:workers';
import { isSurveyOwner } from '@/lib/admin';
import AdminDashboard from './AdminDashboard';
export const dynamic='force-dynamic';
export default async function Admin(){
 if(!await isSurveyOwner(new Headers(await headers()),env))return <main className="done-wrap"><section className="done-card"><h1>仅限问卷发起者</h1><p>管理员访问未启用或身份未获授权。</p><a className="primary" href="/">返回问卷首页</a></section></main>;
 return <AdminDashboard/>;
}
