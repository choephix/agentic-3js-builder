import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { spots, stripes } from "../../../../src/paint";
function build(){
 const b=createBuilder({name:"det",paintSize:512}); b.joint("root",{at:[0,0,0]});
 const coat=spots("#c87840",["#111111","#eeeeee"],{size:.11,seed:22});
 b.sweep([[0,0,0],[0,.4,.1],[0,.8,0]],.17,{color:coat,caps:"none"});
 b.sweep([[0,0,0],[.2,.4,0]],.05,{color:stripes("#fff","#000",{size:.08,axis:"z",seed:4}),caps:"none"});
 const root=b.root; const ms:THREE.Mesh[]=[]; root.traverse(o=>{if(o instanceof THREE.Mesh)ms.push(o)});
 const tex=(ms[0].material as THREE.MeshStandardMaterial).map as THREE.DataTexture;
 return new Uint8Array(tex.image.data as Uint8Array);
}
const a=build(),b=build(); let diff=0; for(let i=0;i<a.length;i++) if(a[i]!==b[i])diff++;
console.log({length:a.length,diff});
