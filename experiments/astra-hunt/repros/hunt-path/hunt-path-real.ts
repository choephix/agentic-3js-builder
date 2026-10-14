import { arc, bezier, catmull, Path, polyline, spiral } from "../../../../src/path";
import { Vector3 } from "three";
function report(name:string, p:Path) {
  const samples=Array.from({length:11},(_,i)=>p.at(i/10));
  console.log(name,{length:p.length,knots:p.knots,finite:samples.every(v=>v.toArray().every(Number.isFinite)),samples:samples.map(v=>v.toArray())});
}
report("catmull-collinear-uniform",catmull([[0,0,0],[1,0,0],[2,0,0],[3,0,0]]));
report("catmull-collinear-uneven",catmull([[0,0,0],[1,0,0],[10,0,0],[11,0,0]]));
report("catmull-collinear-tension",catmull([[0,0,0],[1,0,0],[10,0,0],[11,0,0]],{tension:0.5}));
report("catmull-closed-square",catmull([[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]],{closed:true}));
report("polyline-closed-square",polyline([[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]],{closed:true}));
report("bezier-degenerate-line",bezier([0,0,0],[1,0,0],[2,0,0],[3,0,0]));
report("arc-half",arc([0,0,0],[1,0,0],[0,1,0],180));
report("arc-negative",arc([0,0,0],[1,0,0],[0,1,0],-180));
report("spiral-mirror",spiral([0,0,0],[1,0,0],[0,1,0],{turns:1.15,r1:.1,pitch:.5}));

const c=catmull([[0,0,0],[0,1,0],[1,1,0],[1,0,0]]); const q=new Vector3(.5,.5,0); console.log("closest",c.closestT(q),c.at(c.closestT(q)).toArray(),c.at(.5).toArray());
