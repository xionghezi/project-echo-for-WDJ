export type GestureAxis = 'pending' | 'horizontal' | 'vertical';
export function lockAxis(axis:GestureAxis, dx:number, dy:number):GestureAxis {
  if(axis!=='pending') return axis;
  if(Math.max(Math.abs(dx),Math.abs(dy))<10) return 'pending';
  return Math.abs(dx)>Math.abs(dy)*1.3?'horizontal':'vertical';
}
export function shouldAdvance(axis:GestureAxis,dx:number,dy:number){
  return axis==='horizontal' && dx>=76 && Math.abs(dy)<dx*.75;
}
