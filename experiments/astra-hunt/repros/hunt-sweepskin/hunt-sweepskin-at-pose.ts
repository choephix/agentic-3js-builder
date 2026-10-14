import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';

const b = createBuilder({name:'at-pose', detail:1});
const hips = b.joint('hips', {at:[0,0,0]});
const chain = b.chain('leg', [[0,0,0],[0,1,0],[0,2,0]], {parent:hips, names:['leg1','leg2']});
const tube = b.sweep(chain, 0.2, {color:'#ffffff', sides:8});
const before = tube.at(0.75).at.clone();
b.pose('leg2', {axis:[0,0,1], deg:60});
const after = tube.at(0.75).at.clone();
const p = tube.meshes.flatMap(m => {
  const a=m.geometry.getAttribute('position'); const out=[] as THREE.Vector3[];
  m.updateWorldMatrix(true,false);
  for(let i=0;i<a.count;i++) out.push(new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld)); return out;
});
const nearest = Math.min(...p.map(v=>v.distanceTo(after)));
console.log(JSON.stringify({before:before.toArray(), after:after.toArray(), nearestMeshVertexDistance:nearest, meshCount:tube.meshes.length}));
