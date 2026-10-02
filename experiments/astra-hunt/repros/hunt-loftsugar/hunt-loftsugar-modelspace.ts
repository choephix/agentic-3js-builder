import { Builder, createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';
import { Vector3 } from 'three';
function bounds(s:Sweep){const root=s.meshes[0].parent?.parent??s.meshes[0].parent;root?.updateMatrixWorld(true);const mn=new Vector3(Infinity,Infinity,Infinity),mx=new Vector3(-Infinity,-Infinity,-Infinity);for(const m of s.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++){const v=new Vector3(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(m.matrixWorld);mn.min(v);mx.max(v);}}return {min:mn.toArray(),max:mx.toArray()};}
const makes: Record<string,(b:Builder)=>Sweep> = {rod: b=>b.rod([0,0,0],[0,0,1],.1,{color:'#fff'}), loft:b=>b.loft([{at:[0,0,0],w:.2,h:.2},{at:[0,0,1],w:.2,h:.2}],{color:'#fff'})};
for(const [label,make] of Object.entries(makes)){const b=createBuilder({name:label});b.joint('root',{at:[5,0,0]});try{console.log(label,bounds(make(b)));}catch(e){console.log(label,'THREW',String(e));}}
