import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { catmull } from '../../../../src/path';
const run=(count:number)=>{
 const started=performance.now(); const b=createBuilder({name:`limit${count}`,detail:1});
 const root=b.joint('root',{at:[0,.7,0],dir:[0,1,0]});
 const mantle=b.chain('mantle',catmull([[0,.7,0],[0,1,0],[0,1.2,0]] as [number,number,number][]),{parent:root,count:3});
 b.sweep(mantle,.4,{color:'#639'});
 for(let i=0;i<8;i++){const a=i*Math.PI/4; const at=mantle.at(.8); const tip=[Math.sin(a)*1,.1,Math.cos(a)*1] as [number,number,number]; b.sprout(`tentacle${i}`,at,tip,.03,{count,color:'#936'});}
 const obj=b.root; let meshes=0,triangles=0; obj.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh; meshes++; triangles+=(m.geometry.index?.count??m.geometry.getAttribute('position').count)/3;}});
 console.log({count,joints:1+mantle.joints.length+8*count,meshes,triangles,ms:performance.now()-started});
};
run(19); run(20);
