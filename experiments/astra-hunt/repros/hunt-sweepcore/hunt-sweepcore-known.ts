import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
function stats(label:string, sw:{meshes:THREE.Mesh[]}) { let tris=0, verts=0; for(const m of sw.meshes){const p=m.geometry.getAttribute('position');const i=m.geometry.getIndex();verts+=p.count;tris+=(i?.count ?? p.count)/3;} console.log(label,{meshes:sw.meshes.length,verts,tris}); }
const b=createBuilder({name:'known'}); b.joint('root',{at:[0,0,0]});
const bent=[[0,0,0],[0,0,1],[1,0,1]] as const;
const sectors=b.sweep(bent,.08,{color:'#ffffff',sectors:[[-12,12,'#000000']]}); stats('narrow-sector-bend',sectors);
const box=b.sweep(bent,.2,{color:'#ffffff',section:'box',skin:'rigid'}); stats('rigid-box-sharp-corner',box);
for(const m of box.meshes){const p=m.geometry.getAttribute('position'); let corner=0;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);if(Math.abs(x)<.01&&Math.abs(z-1)<.01)corner++;}console.log('box-corner-vertices',corner);}
