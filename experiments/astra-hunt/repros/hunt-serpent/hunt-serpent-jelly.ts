import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { catmull } from '../../../../src/path';
import type { Chain } from '../../../../src/skeleton';
import type { Sweep } from '../../../../src/sweep';
type Sprout = { chain: Chain | null; sweep: Sweep };
function collect(root: THREE.Object3D) { const ms: THREE.Mesh[]=[]; root.traverse(o=>{if((o as THREE.Mesh).isMesh)ms.push(o as THREE.Mesh)}); return ms; }
function stats(ms: THREE.Mesh[]) { const box=new THREE.Box3(); let tri=0; let finite=true; for(const m of ms){box.expandByObject(m,true); const p=m.geometry.getAttribute('position'); tri+=(m.geometry.index?.count??p.count)/3; for(let i=0;i<p.count;i++) finite&&=[p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite);} return {meshes:ms.length,triangles:tri,joints:undefined,finite,min:box.min.toArray(),max:box.max.toArray()}; }
const b=createBuilder({name:'jelly',detail:1});
const root=b.joint('root',{at:[0,.6,0],dir:[0,1,0],role:'spine'});
const mantlePath=catmull([[0,.6,0],[0,.9,0],[0,1.15,0]] as [number,number,number][]);
const mantleChain=b.chain('mantle',mantlePath,{parent:root,count:3,names:['m1','m2','m3','mTip']});
const mantle=b.sweep(mantleChain,.55,{color:'#536ac7',caps:'round'});
const sprouts: Sprout[]=[];
const ring=b.ring(mantleChain.at(1),{count:16,radius:.48,fromDeg:0,toDeg:360},(item)=>{
 const radial=item.outward.clone(); const tip=item.at.clone().addScaledVector(new THREE.Vector3(0,-1,0),.9).addScaledVector(radial,.15);
 const path=catmull([item, item.moved([0,-.35,0]), tip] as [THREE.Vector3,THREE.Vector3,THREE.Vector3][]);
 sprouts.push(b.sprout(`tentacle${item.i}`,item,path,.025,{count:8,names:Array.from({length:9},(_,k)=>`j${item.i}_${k}`),role:'tentacle',color:'#e7d1ff',twist:(t)=>t*180}));
});
const ms=collect(b.root);
console.log('ring',{items:ring.items.length,groupJoints:ring.joints.length,rootJoints:1+mantleChain.joints.length,joints:1+mantleChain.joints.length+sprouts.reduce((n,s)=>n+(s.chain?.joints.length??0),0),sprouts:sprouts.length,stats:stats(ms)});
console.log('tentacleNames',sprouts.map((s)=>s.chain?.joints.map(j=>j.name)));
for(const t of [0,.25,.5,.75,1]) {const p=sprouts[0].sweep.at(t,180); console.log('under',t,p.at.toArray(),p.n.toArray(),p.tangent.toArray());}
