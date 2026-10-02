import * as THREE from 'three'; import { createBuilder } from '../../../../src/builder'; import { spiral } from '../../../../src/path';
const b=createBuilder({name:'x',detail:1}); b.joint('root',{at:[0,.1,0]}); const p=spiral([0,.1,0],[.75,.1,0],[0,1,0],{turns:1,r1:.75,pitch:0}); const c=b.chain('c',p,{count:16,twist:540}); const s=b.sweep(c,.1,{color:'#0a0'}); b.root;
let min=Infinity; let best:any; for(const m of s.meshes){const a=m.geometry.getAttribute('position');for(let i=0;i<a.count;i++){const q=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);if(q.y<min){min=q.y;best={m:m.name,i,local:new THREE.Vector3().fromBufferAttribute(a,i).toArray(),world:q.toArray()}}}}
console.log({min,best,meshBones:s.meshes[0].userData.skinBones});
for(const t of [0,.0625,.125,.25,.5,.75,1]) { const f=s.at(t,180); const q=s.at(t,0); console.log(t,{center:q.at.toArray(),under:f.at.toArray(),n:f.n.toArray(),T:f.tangent.toArray()}); }
