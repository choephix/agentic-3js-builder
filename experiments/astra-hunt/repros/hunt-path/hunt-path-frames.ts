import { catmull, polyline } from "../../../../src/path";
for (const [name,p] of [
  ["catmull3d",catmull([[1,0,0],[0,1,1],[-1,0,0],[0,-1,-1]],{closed:true})],
  ["polyline3d",polyline([[1,0,0],[0,1,1],[-1,0,0],[0,-1,-1]],{closed:true})],
] as const) {
  const f=p.frames([0,1,0]); const n0=f.normalAt(0), n1=f.normalAt(1), t0=p.tangentAt(0),t1=p.tangentAt(1);
  console.log(name,{dot:n0.dot(n1),n0:n0.toArray(),n1:n1.toArray(),tdot:t0.dot(t1),t0:t0.toArray(),t1:t1.toArray()});
}
