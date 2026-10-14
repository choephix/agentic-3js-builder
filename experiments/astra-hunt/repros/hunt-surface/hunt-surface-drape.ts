import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";

const b=createBuilder({name:"drape"}); const j=b.joint("root",{at:[0,0,0]});
const p=b.part(new THREE.TorusGeometry(1,.24,12,64,Math.PI*1.5),"#999",{bone:j,at:[0,0,0],name:"tucked"});
const s=b.surface(p);
for (const points of [
  [[-1,0,0],[0,0,0],[1,0,0]],
  [[-1.2,0,0],[0,0,0],[1.2,0,0]],
  [[-1,0.1,0],[0,-.1,0],[1,0.1,0]],
] as const) {
 const src=polyline(points); const d=s.drape(src,{lift:0});
 let max=0, mt=0; let prev=d.at(0);
 for(let i=1;i<=200;i++){const t=i/200;const q=d.at(t); const dist=q.distanceTo(prev);if(dist>max){max=dist;mt=t;}prev=q;}
 console.log("drape route",points,{length:+d.length.toFixed(5),maxStep:+max.toFixed(5),maxAt:mt,samples:[0,.125,.25,.375,.5,.625,.75,.875,1].map(t=>d.at(t).toArray().map(v=>+v.toFixed(4)))});
}
