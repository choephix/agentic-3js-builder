import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { paint } from "../../../../src/paint";

const samples:Array<{p:THREE.Vector3,s:[number,number]}> = [];
const mark = paint((p,_n,s)=>{samples.push({p:p.clone(),s:[s[0],s[1]]}); return "#fff";});
const b=createBuilder({name:"clock",detail:0.5,paintSize:512});
b.joint("root",{at:[0,0,0]});
b.sweep([[0,0,0],[0,0,1]],0.2,{sides:8,caps:"none",color:mark});
b.root;
const circular=(a:number)=>((a%360)+360)%360;
const delta=(a:number,b:number)=>Math.abs(((a-b+180)%360+360)%360-180);
let maxErr=0, bad=0, seam=0, seamBad=0;
for(const {p,s} of samples){
  const radial=Math.hypot(p.x,p.y);
  if(radial<0.05) continue;
  const expected=circular(Math.atan2(-p.x,p.y)*180/Math.PI);
  const err=delta(s[1],expected);
  maxErr=Math.max(maxErr,err);
  if(err>20)bad++;
  if(s[1]<5 || s[1]>355){seam++; if(err>20)seamBad++;}
}
console.log({samples:samples.length,maxErr,bad,seam,seamBad});
console.log("worst", samples.map(x=>({x:x.p.x,y:x.p.y,s:x.s[1],e:circular(Math.atan2(-x.p.x,x.p.y)*180/Math.PI),d:delta(x.s[1],circular(Math.atan2(-x.p.x,x.p.y)*180/Math.PI))})).sort((a,b)=>b.d-a.d).slice(0,8));
