import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';
const b=createBuilder({name:'zero-mid',detail:1}); b.joint('root',{at:[0,0,0]}); const s=b.loft([{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:0,h:0},{at:[0,0,2],w:1,h:1}] satisfies Station[],{color:'#fff'});
const p=s.meshes[0].geometry.getAttribute('position'); const rows=[];for(let i=0;i<p.count;i++){if(p.getZ(i)>.5&&p.getZ(i)<1.5)rows.push([+p.getZ(i).toFixed(6),+Math.hypot(p.getX(i),p.getY(i)).toFixed(6)]);} console.log(rows);
