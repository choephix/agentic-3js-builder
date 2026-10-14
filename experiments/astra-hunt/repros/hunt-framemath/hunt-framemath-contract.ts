import {Vector3} from 'three'; import {aim} from '../../../../src/math'; import {frame} from '../../../../src/frame';
const cases:[number[],number[]][]=[[[0,0,1],[0,1,0]],[[0,0,1],[0,-1,0]],[[0,1,0],[0,0,1]],[[0,1,0],[0,0,-1]],[[1,0,0],[0,1,0]],[[-1,0,0],[0,1,0]],[[0,-1,0],[0,1,0]]];
for(const [d,u] of cases){const q=aim(d,u);const y=new Vector3(0,1,0).applyQuaternion(q),z=new Vector3(0,0,1).applyQuaternion(q);console.log('d/up',d,u,'y',y.toArray(),'z',z.toArray(),'zdotup',z.dot(new Vector3(...u)))}
for(const d of [[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]]){const f=frame([0,0,0],d);const m=f.moved({forward:.3,up:.05,left:.1});console.log('words',d,m.at.toArray(),f.local({forward:.3,up:.05,left:.1}).toArray());}
