import { createBuilder } from '../../../../src/builder';
import { polyline } from '../../../../src/path';
import { Vector3 } from 'three';
function v(p: Vector3) { return [Number(p.x.toFixed(5)),Number(p.y.toFixed(5)),Number(p.z.toFixed(5))]; }
const b=createBuilder({name:'pose'}); const root=b.joint('root',{at:[0,0,0],dir:[0,1,0]});
const ring=b.ring(root,{count:4,radius:.2,joints:2,name:'fan'}); console.log('ring before',ring.items.map((x)=>v(x.at))); b.pose(ring.joints[0],{axis:ring.joints[0].dir([1,0,0]),deg:45}); console.log('ring after',ring.items.map((x)=>v(x.at)));
const c=b.chain('chain',polyline([[0,0,0],[0,1,0],[0,2,1]]),{parent:root}); console.log('chain along before',b.along(c,2,(at)=>console.log(at.t,v(at.at)))); b.pose(c.joints[0],{axis:[1,0,0],deg:30}); console.log('chain along after',b.along(c,2,(at)=>console.log(at.t,v(at.at))).map((at)=>v(at.at)));
const s=b.sweep(polyline([[0,0,0],[0,1,0],[0,2,1]]),.05,{bone:root,color:'#f00'}); console.log('sweep along before',b.along(s,2,(at)=>console.log(at.t,v(at.at))).map((at)=>v(at.at))); b.pose(root,{axis:[0,0,1],deg:15}); console.log('sweep along after',b.along(s,2,(at)=>console.log(at.t,v(at.at))).map((at)=>v(at.at)));
