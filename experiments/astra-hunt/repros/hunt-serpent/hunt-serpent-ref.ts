import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { spiral } from '../../../../src/path';
const b=createBuilder({name:'diag',detail:1}); b.joint('root',{at:[0,.1,0]}); const p=spiral([0,.1,0],[.75,.1,0],[0,1,0],{turns:1,r1:.75,pitch:0}); const twist=90; const frames=p.frames(undefined,twist); const s=b.sweep(p,.1,{twist,color:'#0a0'});
for(const t of [.125,.25,.375,.5,.625,.75,.875]) { const T=p.tangentAt(t); const N=frames.normalAt(t); const B=T.clone().cross(N); const up=new THREE.Vector3(0,1,0).sub(T.clone().multiplyScalar(T.y)).normalize(); const raw=Math.atan2(up.dot(N),up.dot(B)); const d=s.at(t,0),u=s.at(t,180); console.log(t,{T:T.toArray(),N:N.toArray(),B:B.toArray(),rawDeg:raw*180/Math.PI,topY:d.at.y,bottomY:u.at.y}); }
