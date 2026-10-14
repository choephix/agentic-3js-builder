import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';
const b=createBuilder({name:'zero-mid',detail:1}); b.joint('root',{at:[0,0,0]}); const s=b.loft([{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:0,h:0},{at:[0,0,2],w:1,h:1}] satisfies Station[],{color:'#fff'});
const p=s.meshes[0].geometry.getAttribute('position'); for(const z of [.8,.9,1,1.1,1.2]) {let max=0,count=0;for(let i=0;i<p.count;i++){if(Math.abs(p.getZ(i)-z)<.03){max=Math.max(max,Math.hypot(p.getX(i),p.getY(i)));count++;}} console.log('z',z,{count,max,query:s.at((z/2),0).radius});}
