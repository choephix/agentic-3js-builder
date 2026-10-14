import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
const b=createBuilder({name:"overlap"}); const j=b.joint("root",{at:[0,0,0]});
const a=b.part(new THREE.SphereGeometry(1,16,10),"#999",{bone:j,at:[0,0,0],name:"outer"});
const c=b.part(new THREE.SphereGeometry(.55,16,10),"#f00",{bone:j,at:[.3,0,0],name:"inner"});
const s=b.surface([a,c]);
for(const [o,d] of [[[0,0,3],[0,0,-1]],[[.3,0,3],[0,0,-1]],[[0,0,0],[1,0,0]]] as const){const h=s.ray(o,d);console.log("overlap ray",{o,d,mesh:h?.mesh.name,at:h?.at.toArray().map(v=>+v.toFixed(4))??null});}
console.log("overlap nearest",s.nearest([.3,0,0]).mesh.name,s.nearest([.3,0,0]).at.toArray().map(v=>+v.toFixed(4)));
const hits=s.scatter(100,{rng:rng(42)}); console.log("overlap scatter",{count:hits.length,meshes:[...new Set(hits.map(h=>h.mesh.name))]});
