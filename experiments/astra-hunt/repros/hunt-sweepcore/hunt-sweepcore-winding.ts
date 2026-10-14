import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { polyline, catmull, arc, spiral } from '../../../../src/path';
import type { Sweep } from '../../../../src/sweep';

function xyz(p: THREE.BufferAttribute, i: number) { return new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)); }
function winding(label: string, sw: Sweep, center: THREE.Vector3) {
  let total=0, good=0, bad=0, area=0;
  for (const m of sw.meshes) {
    const p=m.geometry.getAttribute('position'); const idx=m.geometry.getIndex();
    const count=idx ? idx.count : p.count;
    for(let i=0;i<count;i+=3){
      const ia=idx?idx.getX(i):i, ib=idx?idx.getX(i+1):i+1, ic=idx?idx.getX(i+2):i+2;
      const a=xyz(p,ia), b=xyz(p,ib), c=xyz(p,ic);
      const n=b.clone().sub(a).cross(c.clone().sub(a));
      const q=a.clone().add(b).add(c).multiplyScalar(1/3).sub(center);
      const ar=n.length()/2; area+=ar; total++;
      if(n.dot(q)>1e-9)good++; else if(n.dot(q)<-1e-9)bad++;
    }
  }
  console.log(label,{total,good,bad,area, frames:[0,.25,.5,.75,1].map(t=>{const p=sw.at(t); return [t,p.at.toArray(),p.n.toArray(),p.tangent.toArray()]})});
}
const b=createBuilder({name:'w',detail:1}); b.joint('root',{at:[0,0,0]});
winding('forward',b.sweep([[0,0,0],[0,0,2]],.1,{color:'#fff'}),new THREE.Vector3(0,0,1));
winding('up',b.sweep([[0,0,0],[0,2,0]],.1,{color:'#fff'}),new THREE.Vector3(0,1,0));
winding('down',b.sweep([[0,2,0],[0,0,0]],.1,{color:'#fff'}),new THREE.Vector3(0,1,0));
winding('side',b.sweep([[0,0,0],[2,0,0]],.1,{color:'#fff'}),new THREE.Vector3(1,0,0));
winding('turn',b.sweep([[0,0,0],[0,0,1],[1,0,1],[1,0,2]],.1,{color:'#fff'}),new THREE.Vector3(.5,0,1));
winding('spiral',b.sweep(spiral([0,0,0],[1,0,0],[0,1,0],{turns:1,pitch:.2}),.1,{color:'#fff'}),new THREE.Vector3(0,0,0));
winding('closed',b.sweep(polyline([[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]],{closed:true}),.1,{color:'#fff'}),new THREE.Vector3(0,0,0));
