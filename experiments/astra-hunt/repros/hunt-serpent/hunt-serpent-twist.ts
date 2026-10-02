import { createBuilder } from '../../../../src/builder'; import { spiral } from '../../../../src/path'; import * as THREE from 'three';
for (const twist of [0,90,180,360,540,720]) {
 const b=createBuilder({name:`t${twist}`,detail:1}); b.joint('root',{at:[0,.1,0]}); const p=spiral([0,.1,0],[.75,.1,0],[0,1,0],{turns:1,r1:.75,pitch:0}); const s=b.sweep(p,.1,{twist,color:'#0a0'}); b.root;
 const rows=[0,.0625,.125,.1875,.25,.3125,.375,.5,.625,.75,.875,1].map(t=>{const d=s.at(t,0),u=s.at(t,180); return [t, +d.at.y.toFixed(6), +u.at.y.toFixed(6), +d.n.y.toFixed(5), +u.n.y.toFixed(5)]});
 console.log('twist',twist,rows);
}
