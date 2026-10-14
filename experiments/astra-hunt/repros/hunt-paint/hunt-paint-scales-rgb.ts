import { Vector3 } from "three";
import { scales } from "../../../../src/paint";
const one=scales([1,0,0],"#000000",{size:0.1});
let scalar=0,bad=0,total=0;
for(let x=-.5;x<.5;x+=.01) for(let y=-.5;y<.5;y+=.01){
 const out=one.at(new Vector3(x,y,.2),new Vector3(0,1,0)); total++;
 if(typeof out!=="object") scalar++; else if(out.some(v=>!Number.isFinite(v))) bad++;
}
console.log({total,scalar,bad});
