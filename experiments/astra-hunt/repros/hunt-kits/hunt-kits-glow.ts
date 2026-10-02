import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { glow } from '../../../../kits/glow';
import { paint } from '../../../../src/paint';
const mat=new THREE.MeshStandardMaterial({color:'#336699'}); const plain=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat); console.log('plain before',mat.emissive.getHexString(),mat.emissiveIntensity); const ret=glow(plain,2); console.log('plain ret',ret===plain,plain.material instanceof THREE.MeshStandardMaterial,(plain.material as THREE.MeshStandardMaterial).emissive.getHexString(),(plain.material as THREE.MeshStandardMaterial).emissiveIntensity,mat.emissive.getHexString());
const b=createBuilder({name:'rig'}); const root=b.joint('root',{at:[0,1,0]}); const p=b.part(new THREE.BoxGeometry(1,1,1),'#ff0000',{bone:root,at:[0,1,0]}); const same=glow(p); console.log('part',same===p,p.mesh.material instanceof THREE.MeshStandardMaterial,(p.mesh.material as THREE.MeshStandardMaterial).emissive.getHexString()); const p2=b.part(new THREE.BoxGeometry(1,1,1),'#ff0000',{bone:root,at:[1,1,0]}); glow(p2); console.log('shared',p.mesh.material===p2.mesh.material,p.mesh.material===p2.mesh.material);
const pp=b.part(new THREE.BoxGeometry(1,1,1),paint(()=> '#fff'),{bone:root,at:[0,0,0]}); try{glow(pp)}catch(e){console.log('paint err',String(e));}
try{glow([])}catch(e){console.log('empty list',String(e));}
const arr=[plain]; glow(arr,3); console.log('array',arr[0].material instanceof THREE.MeshStandardMaterial,(arr[0].material as THREE.MeshStandardMaterial).emissiveIntensity);
