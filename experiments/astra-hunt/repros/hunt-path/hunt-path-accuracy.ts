import { Vector3 } from "three";
import { bezier, catmull, arc } from "../../../../src/path";
function qPoint(a:Vector3,b:Vector3,c:Vector3,t:number) { return a.clone().multiplyScalar((1-t)**2).addScaledVector(b,2*(1-t)*t).addScaledVector(c,t*t); }
function exactQuadratic(a:Vector3,b:Vector3,c:Vector3, target:number) {
  const n=2_000_000; let total=0; const cum=[0]; let prev=qPoint(a,b,c,0);
  for(let i=1;i<=n;i++){ const p=qPoint(a,b,c,i/n); total+=p.distanceTo(prev); cum.push(total); prev=p; }
  const want=target*total; let i=1; while(i<n&&cum[i]<want)i++; const f=(want-cum[i-1])/(cum[i]-cum[i-1]); return qPoint(a,b,c,((i-1)+f)/n);
}
for(const controls of [
  [[0,0,0],[0,100,0],[1,0,0]],
  [[0,0,0],[100,100,0],[0,1,0]],
  [[0,0,0],[0,1000,0],[1,0,0]],
] as const) {
  const [a,b,c]=controls.map((x)=>new Vector3(...x)); const p=bezier(a,b,c); let max=0,mt=0;
  for(const t of Array.from({length:101},(_,i)=>i/100)){const err=p.at(t).distanceTo(exactQuadratic(a,b,c,t));if(err>max){max=err;mt=t;}}
  console.log("quadratic",controls[1][1],{length:p.length,maxErr:max,t:mt,got:p.at(mt).toArray(),exact:exactQuadratic(a,b,c,mt).toArray()});
}
const a=arc([0,0,0],[1,0,0],[0,1,0],360); console.log("arc360",{length:a.length, expected:2*Math.PI, rel:(a.length/(2*Math.PI)-1), mid:a.at(.5).toArray()});
const c=catmull([[0,0,0],[0,100,0],[1,0,0]]); console.log("catmull",{length:c.length,at:c.at(.5).toArray(),tangent:c.tangentAt(.5).toArray()});
