import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { contour } from '../../../../src/experimental/contour';
import { polyline } from '../../../../src/path';
const b=createBuilder({name:'contour-zero'});b.joint('root',{at:[0,0,0]});
const s=b.sweep(polyline([[0,0,0],[0,0,0.3]]),contour({front:0,back:0.05,side:0.05,sides:12}),{color:'#fff',caps:{start:'flat',end:'flat'}});
const g=s.meshes[0].geometry,n=g.getAttribute('normal'),p=g.getAttribute('position'),ix=g.index!;const zero:number[]=[];for(let i=0;i<n.count;i++){const l=Math.hypot(n.getX(i),n.getY(i),n.getZ(i));if(l<.1)zero.push(i)}let degenerate=0;for(let i=0;i<ix.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,ix.getX(i)),c=new THREE.Vector3().fromBufferAttribute(p,ix.getX(i+1)),d=new THREE.Vector3().fromBufferAttribute(p,ix.getX(i+2));if(c.clone().sub(a).cross(d.clone().sub(a)).lengthSq()<1e-16)degenerate++}console.log({vertices:p.count,triangles:ix.count/3,zeroCount:zero.length,zero,degenerate});
