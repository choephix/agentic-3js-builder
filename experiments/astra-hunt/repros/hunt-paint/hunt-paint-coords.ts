import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { paint } from "../../../../src/paint";

const capSamples: Array<{p:THREE.Vector3,s:[number,number]}> = [];
const capPaint = paint((p,_n,s) => { capSamples.push({p:p.clone(),s:[s[0],s[1]]}); return "#fff"; });
const b = createBuilder({name:"coords",paintSize:512});
b.joint("root", {at:[0,0,0]});
b.sweep([[0,0,0],[0,0,1]],0.2,{caps:"round",color:capPaint});
b.root;
const cap = capSamples.filter(x=>x.p.z < -1e-5 || x.p.z > 1.00001);
console.log("round cap samples", {all:capSamples.length,cap:cap.length,body:capSamples.length-cap.length,minZ:Math.min(...capSamples.map(x=>x.p.z)),maxZ:Math.max(...capSamples.map(x=>x.p.z)),capT:[...new Set(cap.map(x=>x.s[0]))].slice(0,20),capTCount:new Set(cap.map(x=>x.s[0])).size});

const extSamples: Array<{p:THREE.Vector3,n:THREE.Vector3,s:[number,number]}> = [];
const extPaint = paint((p,n,s) => { extSamples.push({p:p.clone(),n:n.clone(),s:[s[0],s[1]]}); return "#fff"; });
const b2 = createBuilder({name:"extrude",paintSize:512});
b2.joint("root", {at:[0,0,0]});
b2.extrude([[0,0],[1,0],[1,1],[0,1]], {at:[0,0,0],thickness:0.2,color:extPaint});
b2.root;
const face = extSamples.filter(x=>Math.abs(Math.abs(x.n.z)-1)<0.1);
const wall = extSamples.filter(x=>Math.abs(x.n.z)<0.5);
const range=(xs:number[])=>xs.reduce(([lo,hi],x)=>[Math.min(lo,x),Math.max(hi,x)],[Infinity,-Infinity]);
console.log("extrude coords", {all:extSamples.length,face:face.length,wall:wall.length,faceS:face.slice(0,3).map(x=>x.s),wallS:wall.slice(0,3).map(x=>x.s),wallYRange:range(wall.map(x=>x.s[1]))});
