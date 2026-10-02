import { CubicBezierCurve3, Vector3 } from "three";
import { bezier } from "../../../../src/path";
const controls=[new Vector3(0,0,0),new Vector3(100,1000,0),new Vector3(-100,-1000,0),new Vector3(0,0,0)];
const curve=new CubicBezierCurve3(...controls); const p=bezier(...controls);
const n=2_000_000, cum=[0]; let total=0, prev=curve.getPoint(0);
for(let i=1;i<=n;i++){const q=curve.getPoint(i/n);total+=q.distanceTo(prev);cum.push(total);prev=q;}
let max=0, mt=0; for(let j=0;j<=100;j++){const t=j/100,w=t*total;let i=1;while(i<n&&cum[i]<w)i++;const u=((i-1)+(w-cum[i-1])/(cum[i]-cum[i-1]))/n;const exact=curve.getPoint(u);const err=p.at(t).distanceTo(exact);if(err>max){max=err;mt=t;} }
console.log({pathLength:p.length,trueLength:total,relativeLengthError:p.length/total-1,maxPositionError:max,t:mt,got:p.at(mt).toArray(),exact:curve.getPoint((()=>{const w=mt*total;let i=1;while(i<n&&cum[i]<w)i++;return ((i-1)+(w-cum[i-1])/(cum[i]-cum[i-1]))/n})()).toArray()});
