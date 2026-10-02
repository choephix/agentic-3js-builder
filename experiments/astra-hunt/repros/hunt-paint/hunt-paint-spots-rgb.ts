import { Vector3 } from "three";
import { spots } from "../../../../src/paint";
const one = spots("#ffffff", [1, 0, 0], { size: 0.1 });
let scalar=0, bad=0, red=0, total=0;
for(let x=-0.5;x<0.5;x+=0.01) for(let y=-0.5;y<0.5;y+=0.01) {
  const out=one.at(new Vector3(x,y,0.4), new Vector3(0,1,0)); total++;
  if(typeof out !== "object") { scalar++; continue; }
  if(out.some(v=>!Number.isFinite(v))) bad++;
  if(out[0] > 0.9 && out[1] < 0.1 && out[2] < 0.1) red++;
}
console.log({total,scalar,bad,red});
