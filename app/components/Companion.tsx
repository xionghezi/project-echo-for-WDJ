export type Pose='thinking'|'listening'|'selected'|'writing'|'go'|'ready';
export default function Companion({pose,reaction=0}:{pose:Pose;reaction?:number}){
 const message=pose==='selected'?'收到你的选择':pose==='writing'?'我在认真听':pose==='go'?'松手，继续下一题':pose==='ready'?'再看一眼，就好啦':pose==='listening'?'按真实经历选就好':'慢慢来，我陪你';
 return <aside className={`companion pose-${pose}`} data-pose={pose} aria-label={`回音精灵：${message}`}>
  <div className="companion-speech" aria-live="polite">{message}<span>{pose==='selected'?'选好后，右滑继续 →':'每一种想法都值得听见'}</span></div>
  <svg className="companion-art" viewBox="0 0 180 180" aria-hidden="true">
   <ellipse className="mascot-shadow" cx="89" cy="168" rx="51" ry="6" fill="#d8e2c9"/>
   <g key={`${pose}-${reaction}`} className="mascot-body">
    <g className="mascot-feet" fill="#315b46"><path d="M59 148q-10 16-2 20h18q8-5 9-19Z"/><path d="M106 148q0 16 8 20h18q6-4-8-18Z"/></g>
    <g className="mascot-left-arm"><path d="M48 86q-29 0-28 22 2 13 15 5l18-14" fill="#6a9d6e" stroke="#315b46" strokeWidth="2"/></g>
    <g className="mascot-right-arm"><path d="M132 85q18-22 28-11 12 12-18 31" fill="#6a9d6e" stroke="#315b46" strokeWidth="2"/></g>
    <path d="M47 55q0-18 20-18h51q22 0 24 24l4 66q2 32-28 32H68q-29 0-29-29Z" fill="#7aa977" stroke="#315b46" strokeWidth="2"/>
    <path d="M50 57q1-13 17-13h50q14 0 19 15" fill="none" stroke="#9cc28e" strokeWidth="4" strokeLinecap="round"/>
    <g className="mascot-leaves" stroke="#315b46" strokeWidth="2"><path d="M72 39Q53 18 67 9q20 2 24 27" fill="#a6c27e"/><path d="M90 38q2-23 23-24 12 16-12 26" fill="#cbd68d"/></g>
    <g className="mascot-face"><rect x="50" y="66" width="87" height="69" rx="28" fill="#f5efcf"/>
     <g className="mascot-open-eyes" fill="#294d37"><ellipse cx="74" cy="94" rx="4" ry="6"/><ellipse cx="113" cy="94" rx="4" ry="6"/></g>
     <g className="mascot-happy-eyes" stroke="#294d37" strokeWidth="3" fill="none" strokeLinecap="round"><path d="M69 95q5-9 10 0M108 95q5-9 10 0"/></g>
     <path className="mascot-smile" d="M85 108q9 10 18-1" stroke="#294d37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
     <ellipse cx="62" cy="107" rx="7" ry="3.5" fill="#e8bc88"/><ellipse cx="125" cy="107" rx="7" ry="3.5" fill="#e8bc88"/>
    </g>
    <g className="mascot-letter"><rect x="82" y="131" width="58" height="35" rx="5" fill="#fffef9" stroke="#315b46" strokeWidth="1.5"/><path d="m88 137 23 15 23-15" fill="none" stroke="#315b46" strokeWidth="1.5"/></g>
    <g className="mascot-pencil" stroke="#315b46" strokeWidth="1.5"><path d="m122 114 7-3 17 25-7 4Z" fill="#e7c568"/><path d="m139 140 8 5-1-9Z" fill="#fff5d1"/></g>
   </g>
   <g className="mascot-sparkles" fill="#d6b448"><path d="m20 49 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m156 33 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>
  </svg>
 </aside>
}
