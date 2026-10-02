import { Vector3 } from 'three';
import { frame } from '../../../../src/frame';
for (const d of [[0,1,0],[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[1,1,1]]) {
  const f=frame([0,0,0],d);
  const m=f.moved([1,0,0]);
  console.log('dir',d,'f.axis',f.axis.toArray(),'m.axis',m.axis.toArray(),'m.at',m.at.toArray(),'dot',f.axis.dot(m.axis));
}
