import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';
function v(a: THREE.BufferAttribute, i:number) { return new THREE.Vector3(a.getX(i),a.getY(i),a.getZ(i)); }
function check(label:string, sw:Sweep) {
 let good=0,bad=0,zero=0;
 for(const mesh of sw.meshes){const p=mesh.geometry.getAttribute('position');const n=mesh.geometry.getAttribute('normal');const idx=mesh.geometry.getIndex();const count=idx?idx.count:p.count;for(let i=0;i<count;i+=3){const ids=[idx?idx.getX(i):i,idx?idx.getX(i+1):i+1,idx?idx.getX(i+2):i+2];const nn=v(n,ids[0]).add(v(n,ids[1])).add(v(n,ids[2])); const c=v(p,ids[0]).add(v(p,ids[1])).add(v(p,ids[2])).multiplyScalar(1/3);const t=sw.at(Math.min(1,Math.max(0,(c.z+1e-12)/2)));const dot=nn.dot(t.n);if(dot>0.01)good++; else if(dot<-0.01)bad++; else zero++;}}
 console.log(label,{good,bad,zero});
}
const b=createBuilder({name:'n'});b.joint('root',{at:[0,0,0]});
check('straight',b.sweep([[0,0,0],[0,0,2]],.1,{color:'#fff'}));
check('vertical',b.sweep([[0,0,0],[0,2,0]],.1,{color:'#fff'}));
check('bend',b.sweep([[0,0,0],[0,0,1],[1,0,1]],.1,{color:'#fff'}));
check('closed',b.sweep([[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]],.1,{color:'#fff'}));
