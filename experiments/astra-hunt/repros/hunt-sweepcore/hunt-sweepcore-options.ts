import { createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';
function bounds(sw:Sweep){const b={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};for(const m of sw.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++){for(let k=0;k<3;k++){const q=k===0?p.getX(i):k===1?p.getY(i):p.getZ(i);b.min[k]=Math.min(b.min[k],q);b.max[k]=Math.max(b.max[k],q);}}}return b;}
function info(label:string,sw:Sweep){let tris=0;for(const m of sw.meshes)tris+=(m.geometry.getIndex()?.count??0)/3;console.log(label,{meshes:sw.meshes.length,tris,bounds:bounds(sw)});}
const b=createBuilder({name:'opts'}); b.joint('r',{at:[0,0,0]});
const p=[[0,0,0],[0,0,1],[1,0,1]] as const;
info('smooth-box-bend',b.sweep(p,.2,{color:'#fff',section:'box'}));
info('rigid-box-bend',b.sweep(p,.2,{color:'#fff',section:'box',skin:'rigid'}));
info('round-ext',b.sweep([[0,0,0],[0,0,1]],.1,{color:'#fff',extend:[.2,.3]}));
info('flat-ext',b.sweep([[0,0,0],[0,0,1]],.1,{color:'#fff',caps:'flat',extend:[.2,.3]}));
info('shift',b.sweep(p,.1,{color:'#fff',shift:t=>[.02*t,-.03*t],twist:t=>360*t}));
for(const d of [.25,.5,1,2]){const sw=b.sweep(p,.1,{color:'#fff',detail:d});info('detail-'+d,sw);}
