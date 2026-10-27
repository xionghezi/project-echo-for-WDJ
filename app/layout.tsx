import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'回音计划 · 联合学院学生诉求调研',description:'花几分钟，聊聊诉求如何被听见。武汉大学杜伦大学联合学院学生提案调研。',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
