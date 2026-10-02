import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { svg } from "../../../../src/texture";
const b=createBuilder({name:"textures"}); b.joint("root",{at:[0,0,0]});
const a=svg('<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="#aaa"/></svg>');
const c=svg('<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="#bbb"/></svg>');
let k=0; const meshes=b.cards([frame([0,0,0],[0,1,0]),frame([1,0,0],[0,1,0])],[a,c],{size:.1,rng:()=>k++%2 ? .9 : .1});
console.log({meshes:meshes.length,triangles:meshes.map(m=>(m.geometry.index?.count??0)/3),materials:meshes.map(m=>{const map=(m.material as THREE.MeshStandardMaterial).map; return map===a?"a":map===c?"c":"other"})});
