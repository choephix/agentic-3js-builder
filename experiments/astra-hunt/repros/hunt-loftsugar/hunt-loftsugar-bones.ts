import { Builder, createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';
import type { Joint } from '../../../../src/skeleton';
import { Vector3 } from 'three';

function worldBounds(s: Sweep) {
 const root = s.meshes[0].parent?.parent ?? s.meshes[0].parent;
 const box = {min:new Vector3(Infinity,Infinity,Infinity),max:new Vector3(-Infinity,-Infinity,-Infinity)};
 root?.updateMatrixWorld(true);
 for (const m of s.meshes) { const p=m.geometry.getAttribute('position'); for(let i=0;i<p.count;i++) { const v=new Vector3(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(m.matrixWorld); box.min.min(v); box.max.max(v); } }
 return {min:box.min.toArray(),max:box.max.toArray()};
}
function run(label:string, make:(b:Builder, root:Joint, child:Joint)=>Sweep) {
 const b=createBuilder({name:label,detail:1}); const root=b.joint('root',{at:[0,0,0],aim:[0,0,1]}); const child=b.joint('child',{parent:root,at:[0,0,1],aim:[0,0,2]});
 try {const s=make(b,root,child); console.log(label,'bind',worldBounds(s)); b.pose(child,{axis:[1,0,0],deg:90}); console.log(label,'posed',worldBounds(s));} catch(e){console.log(label,'THREW',String(e));}
}
run('rod-first-child', b=>b.rod([0,0,1],[0,0,2],0.1,{color:'#fff'}));
run('rod-literal-first', b=>b.rod([0,0,0], [0,0,1], 0.1,{color:'#fff'}));
run('capsule-child', b=>b.capsule([0,0,1],[0,0,2],0.1,{color:'#fff'}));
run('loft-child', b=>b.loft([{at:[0,0,1],w:.2,h:.2},{at:[0,0,2],w:.2,h:.2}],{color:'#fff'}));
