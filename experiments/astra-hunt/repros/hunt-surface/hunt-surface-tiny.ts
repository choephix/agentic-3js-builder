import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";

const b=createBuilder({name:"tiny"}); const j=b.joint("root",{at:[0,0,0]});
const g=new THREE.BufferGeometry();
g.setAttribute("position",new THREE.Float32BufferAttribute([0,0,0, 1e-2,0,0, 0,1e-2,0],3));
const p=b.part(g,"#999",{bone:j,at:[0,0,0],name:"tinytri"}); const s=b.surface(p);
for (const z of [-5e-10, -2e-9, -1e-8]) {
  const hit=s.ray([0.0025,0.0025,z],[0,0,1]);
  console.log("tiny ray",{z,hit:hit?.at.toArray() ?? null});
}
