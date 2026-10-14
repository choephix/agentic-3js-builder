import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
function probe(segments:number) {
 const b=createBuilder({name:"impact"}); b.joint("root",{at:[0,0,0]}); const p=b.lathe([[0,0],[1,0],[1,1],[0,1]],{at:[0,0,0],color:"#fff",segments}); const n=p.mesh.geometry.getAttribute("normal"); let zero=0; for(let i=0;i<n.count;i++) if(new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i)).length()<1e-6) zero++; return {segments,triangles:(p.mesh.geometry.index?.count??p.mesh.geometry.getAttribute("position").count)/3,normals:n.count,zeroNormals:zero};
}
console.log(probe(6),probe(12));
