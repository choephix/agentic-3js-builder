import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { svg } from "../../../../src/texture";
const b=createBuilder({name:"limit"}); b.joint("root",{at:[0,0,0]});
const a=svg('<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="#aaa"/></svg>');
const c=svg('<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="#bbb"/></svg>');
const frames=Array.from({length:1001},(_,i)=>frame([i*.001,0,0],[0,1,0]));
const meshes=b.cards(frames,[a,c],{size:.01,rng:()=>0.7});
console.log({frames:frames.length,meshes:meshes.length,triangles:meshes.reduce((n,m)=>n+(m.geometry.index?.count??0)/3,0),partsBeforeRoot:meshes.length});
