import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';
function p(a: THREE.BufferAttribute,i:number){return new THREE.Vector3(a.getX(i),a.getY(i),a.getZ(i));}
function check(label:string,sw:Sweep,axis:'z'|'y'|'x'){let good=0,bad=0;for(const m of sw.meshes){const pa=m.geometry.getAttribute('position'), no=m.geometry.getAttribute('normal'), ix=m.geometry.getIndex();const count=ix?ix.count:pa.count;for(let i=0;i<count;i+=3){const ids=[ix?ix.getX(i):i,ix?ix.getX(i+1):i+1,ix?ix.getX(i+2):i+2];const c=p(pa,ids[0]).add(p(pa,ids[1])).add(p(pa,ids[2])).multiplyScalar(1/3);let radial=axis==='z'?new THREE.Vector3(c.x,c.y,0):axis==='y'?new THREE.Vector3(c.x,0,c.z):new THREE.Vector3(0,c.y,c.z); const n=p(no,ids[0]).add(p(no,ids[1])).add(p(no,ids[2]));if(n.dot(radial)>0)good++;else bad++;}}console.log(label,{good,bad});}
const b=createBuilder();b.joint('r',{at:[0,0,0]});check('forward',b.sweep([[0,0,0],[0,0,2]],.1,{color:'#fff'}),'z');check('up',b.sweep([[0,0,0],[0,2,0]],.1,{color:'#fff'}),'y');check('x',b.sweep([[0,0,0],[2,0,0]],.1,{color:'#fff'}),'x');
