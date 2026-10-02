import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { catmull } from '../../../../src/path';
import type { Chain } from '../../../../src/skeleton';
import type { Sweep } from '../../../../src/sweep';
import type { Part } from '../../../../src/parts';

type Sprout = { chain: Chain | null; sweep: Sweep };
const b=createBuilder({name:'octo',detail:1});
const root=b.joint('mantleRoot',{at:[0,.65,0],dir:[0,1,0],role:'spine'});
const mantlePath=catmull([[0,.65,0],[0,.95,0],[0,1.3,0]] as [number,number,number][]);
const mantleChain=b.chain('mantle',mantlePath,{parent:root,count:3,names:['mantle1','mantle2','mantle3','mantleTip']});
const mantle=b.sweep(mantleChain,.48,{color:'#7954a7',caps:'round',section:'circle'});
const skin=b.surface(mantle);
const tentacles: Sprout[]=[]; const suckers: Part[]=[]; let hitCount=0;
for(let i=0;i<8;i++) {
 const az=i*45; const hit=skin.around([0,.95,0]).at(az,-20); if(!hit) throw new Error('missing hit '+i); hitCount++;
 const a=az*Math.PI/180; const x=Math.sin(a), z=Math.cos(a);
 const path=catmull([hit, [x*.7,.4,z*.7], [x*1.1,.1,z*1.1]] as [number,number,number][]);
 const t=b.sprout('tentacle'+i,hit,path,.075,{count:8,names:Array.from({length:9},(_,k)=>`t${i}_${k+1}`),role:'tentacle',color:'#c27ad9',twist:(u)=>u*90});
 tentacles.push(t);
 b.along(t.sweep,7,(at)=>{ suckers.push(b.stick(new THREE.SphereGeometry(.035,6,4),'#f4d9eb',at,{embed:.25, name:`sucker${i}_${at.t.toFixed(3)}`})); });
}
const beforeBox=new THREE.Box3(); const beforeMeshes: THREE.Mesh[]=[]; b.root.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh; beforeMeshes.push(m); beforeBox.expandByObject(m,true);}});
const beforeTriangles=beforeMeshes.reduce((sum,m)=>sum+(m.geometry.index?.count??m.geometry.getAttribute('position').count)/3,0);
const suckerBefore=suckers.slice(0,7).map(s=>new THREE.Box3().setFromObject(s.mesh,true).getCenter(new THREE.Vector3()));
console.log('counts',{rootChildren:b.root.children.length,joints:tentacles.reduce((s,t)=>s+(t.chain?.joints.length ?? 0),1)+mantleChain.joints.length,hitCount,suckers:suckers.length,parts:beforeMeshes.length,triangles:beforeTriangles});
console.log('before',{min:beforeBox.min.toArray(),max:beforeBox.max.toArray()});
const target=tentacles[0].chain!.joints[6]; b.pose(target,{axis:[0,1,0],deg:55});
const afterBox=new THREE.Box3(); const afterMeshes: THREE.Mesh[]=[]; b.root.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh; afterMeshes.push(m); afterBox.expandByObject(m,true);}});
const suckerAfter=suckers.slice(0,7).map(s=>new THREE.Box3().setFromObject(s.mesh,true).getCenter(new THREE.Vector3()));
const sample=tentacles[0].sweep.at(.8,0);
let finite=true; for(const m of afterMeshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++)for(const v of [p.getX(i),p.getY(i),p.getZ(i)])finite&&=Number.isFinite(v);}
console.log('after',{min:afterBox.min.toArray(),max:afterBox.max.toArray(),posedTarget:target.at.toArray(),suckerMotion:suckerAfter.map((p,i)=>p.clone().sub(suckerBefore[i]).toArray()),posedSweep:sample.at.toArray(),bone:sample.bone?.name,weights:sample.weights.map(([j,w])=>[j.name,w]),finite});
