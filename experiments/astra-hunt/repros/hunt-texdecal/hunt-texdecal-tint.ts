import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { svg } from '../../../../src/texture';
for (const fill of ['#8a8888','#908080']) {
  const b=createBuilder({name:'tint'});
  b.joint('root',{at:[0,0,0]});
  const texture=svg(`<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="${fill}"/></svg>`,{size:8});
  const part=b.part(new THREE.PlaneGeometry(.1,.1),'#ff0000',{at:[0,0,0],texture});
  const material=part.mesh.material as THREE.MeshStandardMaterial;
  console.log('warm-grey',{fill,coloured:Boolean(texture.userData.coloured),material:material.color.getHexString()});
}
