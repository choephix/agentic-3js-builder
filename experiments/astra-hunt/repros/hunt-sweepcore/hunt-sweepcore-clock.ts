import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { polyline, spiral } from '../../../../src/path';
function check(label:string, path:any){const b=createBuilder({name:'clock'});b.joint('r',{at:[0,0,0]});const sw=b.sweep(path,.1,{color:'#fff'});const up=new THREE.Vector3(0,1,0);const out=[];for(let i=0;i<=20;i++){const t=i/20;const center=path.at(t);const q=sw.at(t,0);const radial=q.at.clone().sub(center).normalize();const projected=up.clone().addScaledVector(q.tangent,-up.dot(q.tangent));if(projected.lengthSq()>1e-8)projected.normalize();out.push({t:+t.toFixed(2),dot:+radial.dot(projected).toFixed(3),p:q.at.toArray().map(x=>+x.toFixed(3))});}console.log(label,out);}
check('vertical',[[0,0,0],[0,2,0]]);
check('u-turn',polyline([[0,0,0],[0,1,0],[1,2,0],[2,1,0],[2,0,0]]));
check('coil',spiral([0,0,0],[1,0,0],[0,1,0],{turns:1,pitch:.2}));
