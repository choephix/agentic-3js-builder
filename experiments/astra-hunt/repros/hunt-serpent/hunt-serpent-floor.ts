import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { spiral } from "../../../../src/path";
function minY(b:any, tube:any) {
 const root=b.root; let min=Infinity,max=-Infinity; let n=0;
 for(const m of tube.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++){const q=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);min=Math.min(min,q.y);max=Math.max(max,q.y);n++;}}
 console.log({min,max,n,triangles:tube.meshes.reduce((s:any,m:any)=>s+(m.geometry.index?.count??0)/3,0)});
}
for(const turns of [0.5,1,2.3]) for(const twist of [undefined,0,540]) {
 const b=createBuilder({name:`x${turns}-${twist}`,detail:1});
 b.joint('root',{at:[0,.1,0]});
 const p=spiral([0,.1,0],[.75,.1,0],[0,1,0],{turns,r1:.75,pitch:0});
 const c=b.chain('coil',p,{count:Math.max(4,Math.ceil(turns*16)),twist});
 const s=b.sweep(c,.1,{color:'#0a0'}); console.log('chain',turns,twist,c.joints.length); minY(b,s);
}
for(const turns of [0.5,1,2.3]) {
 const b=createBuilder({name:`p${turns}`,detail:1});
 b.joint('root',{at:[0,.1,0]});
 const p=spiral([0,.1,0],[.75,.1,0],[0,1,0],{turns,r1:.75,pitch:0});
 const s=b.sweep(p,.1,{color:'#0a0'}); console.log('path',turns); minY(b,s);
}
