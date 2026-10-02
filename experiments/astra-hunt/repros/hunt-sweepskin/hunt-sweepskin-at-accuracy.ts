import * as THREE from 'three';
import { catmull } from '../../../../src/path';
import { createBuilder } from '../../../../src/builder';
function closestTri(p:THREE.Vector3,a:THREE.Vector3,b:THREE.Vector3,c:THREE.Vector3){
 const out=new THREE.Vector3(); new THREE.Triangle(a,b,c).closestPointToPoint(p,out); return out.distanceTo(p);
}
const b=createBuilder({name:'acc',detail:1}); const root=b.joint('root',{at:[0,0,0]});
const path=catmull([[0,0,0],[.15,.25,.3],[.35,.3,.7],[.2,.4,1.1],[-.1,.3,1.5]]);
const s=b.sweep(path,.04,{bone:root,color:'#fff',sides:8});
const samples=[]; for(const t of [.17,.31,.43,.57,.68,.83]) for(const deg of [0,45,90,180]){
 const q=s.at(t,deg).at; let best=Infinity;
 for(const m of s.meshes){m.updateWorldMatrix(true,false); const pos=m.geometry.getAttribute('position'), idx=m.geometry.index!; for(let i=0;i<idx.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(pos,idx.getX(i)).applyMatrix4(m.matrixWorld),bb=new THREE.Vector3().fromBufferAttribute(pos,idx.getX(i+1)).applyMatrix4(m.matrixWorld),c=new THREE.Vector3().fromBufferAttribute(pos,idx.getX(i+2)).applyMatrix4(m.matrixWorld); best=Math.min(best,closestTri(q,a,bb,c));}}
 samples.push({t,deg,error:best});
}
console.log(JSON.stringify({max:Math.max(...samples.map(x=>x.error)), mean:samples.reduce((a,x)=>a+x.error,0)/samples.length, samples:samples.filter(x=>x.error>.005)}));
