import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { frame } from '../../../../src/frame';

function test(label:string, r:any) {
  const b=createBuilder({name:label});
  const root=b.joint('root',{at:[0,0,0]});
  const child=b.joint('child',{parent:root,at:[0,1,0],dir:[0,1,0]});
  const before=child.at.clone();
  try { b.pose('root',r); const a=child.at; console.log(label,'ok',before.toArray().map(x=>+x.toFixed(6)),a.toArray().map(x=>+x.toFixed(6)), 'axis',root.axis.toArray().map(x=>+x.toFixed(6))); }
  catch(e) { console.log(label,'ERR',e instanceof Error?e.message:e); }
}
test('quat',new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2));
test('axis',{axis:[0,0,1],deg:90});
test('dir',{dir:[1,0,0]});
test('aim',{aim:[1,0,0]});
test('about',{about:frame([0,0,0],[0,0,1]),deg:90});
const z=createBuilder({name:'twice'}); const r=z.joint('r',{at:[0,0,0]}); const c=z.joint('c',{parent:r,at:[0,1,0],dir:[0,1,0]}); z.pose(r,{axis:[0,0,1],deg:90}); const p1=c.at.clone(); z.pose(r,{axis:[0,0,1],deg:90}); console.log('twice',p1.toArray(),c.at.toArray(),r.axis.toArray());
