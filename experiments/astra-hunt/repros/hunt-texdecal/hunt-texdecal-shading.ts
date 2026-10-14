import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
const b = createBuilder({name:'decalEdge'});
b.joint('root',{at:[0,0,0]});
const box = b.part(new THREE.BoxGeometry(1,1,1), '#888888', {at:[0,0,0]});
const texture = new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);
const decal = b.decal(box, texture, {at:[0.3536,0,0.3536], dir:[1,0,1], size:[1.4,0.5], segments:[8,2]});
b.root.updateMatrixWorld(true);
const pos=decal.mesh.geometry.getAttribute('position');
const normal=decal.mesh.geometry.getAttribute('normal');
for (let i=0;i<pos.count;i++) {
  const p = new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(decal.mesh.matrixWorld);
  if (p.x > .501 && p.z > .499 && p.y < -.2) {
    const n = new THREE.Vector3().fromBufferAttribute(normal,i).applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(decal.mesh.matrixWorld));
    console.log('edge-normal',{vertex:i,position:p.toArray().map(x=>+x.toFixed(6)),normal:n.toArray().map(x=>+x.toFixed(6))});
  }
}
