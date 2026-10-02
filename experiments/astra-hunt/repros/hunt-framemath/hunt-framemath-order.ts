import { Quaternion, Vector3 } from 'three';
const q=new Quaternion().setFromAxisAngle(new Vector3(1,0,0),Math.PI/2);
const axis=new Vector3(0,0,1);
function f(a:Vector3,b:Quaternion){console.log('arg q',b.toArray(),'a',a.toArray());}
f(axis.applyQuaternion(q.invert()),q);
console.log('q after',q.toArray(),'axis',axis.toArray());
