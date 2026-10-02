import { Vector3 } from 'three';
import { aim, offset, lerp, mid, rng } from '../../../../src/math';
import { frame, line } from '../../../../src/frame';

const dirs = { '+X':[1,0,0], '-X':[-1,0,0], '+Y':[0,1,0], '-Y':[0,-1,0], '+Z':[0,0,1], '-Z':[0,0,-1] } as const;
for (const [name,d] of Object.entries(dirs)) {
  for (const axis of ['x','y','z'] as const) {
    const q=aim(d, undefined, axis); const x=new Vector3(1,0,0).applyQuaternion(q), y=new Vector3(0,1,0).applyQuaternion(q), z=new Vector3(0,0,1).applyQuaternion(q);
    console.log('aim',name,axis,'x',x.toArray().map(v=>+v.toFixed(5)),'y',y.toArray().map(v=>+v.toFixed(5)),'z',z.toArray().map(v=>+v.toFixed(5)));
  }
}
for (const [name,d] of Object.entries(dirs)) {
  const f=frame([1,2,3], d); console.log('frame',name,'axis',f.axis.toArray(),'local',f.local([1,2,3]).toArray(),'words',f.local({right:1,left:2,up:3,down:1,forward:4,back:1}).toArray());
}
for(const up of [[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0,1e-12,0],[0,0,0]]) {
  try {const q=aim([0,1,0],up); console.log('up',up,'z',new Vector3(0,0,1).applyQuaternion(q).toArray())} catch(e){console.log('up',up,'ERR',String(e))}
}
for(const d of [[0,0,0],[0,0,1e-16]]) {try {console.log('zero',d,aim(d).toArray())} catch(e){console.log('zero',d,'ERR',String(e))}}
try {console.log('offsetzero',offset([1,2,3],[0,0,0],2).toArray())}catch(e){console.log('offsetzero ERR',String(e))}
console.log('linezero',line([1,2,3],[1,2,3]).axis.toArray(),line([1,2,3],[1,2,3]).length);
console.log('lerp',lerp([0,0,0],[1,2,3],2).toArray(),'mid',mid([0,0,0],[1,2,3]).toArray());
for(const seed of [0,1,-1,123]) {const r=rng(seed); console.log('rng',seed,[r(),r(),r(),r()]);}
