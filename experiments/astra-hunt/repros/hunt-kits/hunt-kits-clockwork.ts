import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { gearSize, gearGeometry, gearTexture, gearTrain, metal, panelled, coil } from '../../../../kits/clockwork';
const cases: Array<{ teeth: number; module?: number; radius?: number; spokes?: number; bore?: number; holes?: number }> = [{teeth:8,module:.01},{teeth:8,radius:.04},{teeth:12,module:.01,spokes:4,bore:.005},{teeth:20,module:.01,holes:5}];
for(const s of cases){ const z=gearSize(s); console.log('size',s,z); const g=gearGeometry(s); console.log('geo',g.getAttribute('position').count,g.getAttribute('normal').count,g.boundingBox?.min,g.boundingBox?.max); }
const b=createBuilder({name:'x'}); const root=b.joint('root',{at:[0,1,0]});
for(const [label, gears] of [
 ['basic',[{teeth:20},{teeth:10,angle:70}]],
 ['compound',[{teeth:20},{teeth:10,angle:70},{teeth:30,on:1,shift:.03},{teeth:12,from:2,angle:-80}]],
] as const){ try {const t=gearTrain(b,{at:[0,1,0],axis:[0,1,0],module:.01,spin:label,bone:root,gears}); console.log('train',label,t.gears.map((g)=>({at:g.at.toArray(),ratio:g.ratio,phase:g.phase,joint:g.joint?.name}))); t.spin(20); console.log('spun');}catch(e){console.log('train err',label,String(e));}}
for(const params of [[0,0,0],[1,1,1]] as const){try{const p=panelled('#fff',{size:params[0],aspect:params[1],rivets:params[2]}); console.log('panel',params,p.at(new THREE.Vector3(),new THREE.Vector3(0,1,0)));}catch(e){console.log('panel err',params,String(e));}}
try { const c=coil([0,0,0],[0,1,0],.1,3); console.log('coil',c.length,c.at(0).toArray(),c.at(1).toArray()); }catch(e){console.log('coil err',String(e));}
