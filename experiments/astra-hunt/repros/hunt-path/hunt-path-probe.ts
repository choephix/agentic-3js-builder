import { Vector3 } from "three";
import { arc, bezier, catmull, polyline, spiral } from "../../../../src/path";

interface ProbePath {
  readonly length: number;
  readonly knots: readonly number[];
  readonly closed: boolean;
  at(t: number): Vector3;
  tangentAt(t: number): Vector3;
}

const show = (name: string, fn: () => ProbePath) => {
  try {
    const p = fn();
    console.log(name, "OK", { length:p.length, knots:p.knots, closed:p.closed, at0:p.at(0).toArray(), atHalf:p.at(.5).toArray(), at1:p.at(1).toArray(), tanHalf:p.tangentAt(.5).toArray() });
  } catch (e) { console.log(name, "ERR", String(e)); }
};
show("polyline-open-2", () => polyline([[0,0,0],[1,0,0]]));
show("polyline-closed-2", () => polyline([[0,0,0],[1,0,0]], {closed:true}));
show("polyline-closed-3", () => polyline([[0,0,0],[1,0,0],[1,1,0]], {closed:true}));
show("polyline-duplicate", () => polyline([[0,0,0],[0,0,0],[1,0,0]]));
show("catmull-duplicate", () => catmull([[0,0,0],[0,0,0],[1,0,0],[2,0,0]]));
show("catmull-closed-2", () => catmull([[0,0,0],[1,0,0]], {closed:true}));
show("arc-zero", () => arc([0,0,0],[1,0,0],[0,1,0],0));
show("spiral-zero", () => spiral([0,0,0],[1,0,0],[0,1,0],{turns:0}));
show("spiral-r1-zero", () => spiral([0,0,0],[1,0,0],[0,1,0],{turns:1,r1:0}));
const base = polyline([[0,0,0],[1,0,0],[1,1,0]]);
const zero = base.slice(.5, .5);
console.log("slice-zero", { length: zero.length, knots: zero.knots, at: zero.at(.5).toArray(), tangent: zero.tangentAt(.5).toArray(), closest: zero.closestT([0,0,0]) });


const p = bezier([0,0,0],[0,10,0],[10,10,0]);
console.log("bezier", p.length, p.knots);
for (const t of [0,.1,.25,.5,.75,.9,1]) console.log("b", t, p.at(t).toArray());

// brute force arc length on exact quadratic Bezier
const q0=new Vector3(0,0,0), q1=new Vector3(0,10,0), q2=new Vector3(10,10,0);
const evalQ=(u:number)=>q0.clone().multiplyScalar((1-u)**2).addScaledVector(q1,2*(1-u)*u).addScaledVector(q2,u*u);
const N=100000; const ss=[0]; for(let i=1;i<=N;i++) ss.push(ss[i-1]+evalQ(i/N).distanceTo(evalQ((i-1)/N)));
const total=ss[N];
for (const target of [.1,.25,.5,.75,.9]) { const want=target*total; let i=1; while(i<N&&ss[i]<want)i++; const f=(want-ss[i-1])/(ss[i]-ss[i-1]); const u=((i-1)+f)/N; const exact=evalQ(u); const got=p.at(target); console.log("arcErr",target,{u,exact:exact.toArray(),got:got.toArray(),err:got.distanceTo(exact)}); }

// closest on path with point values
for(const x of [-1,0,.5,1,3]) console.log("closest",x,p.closestT([x,5,0]));
