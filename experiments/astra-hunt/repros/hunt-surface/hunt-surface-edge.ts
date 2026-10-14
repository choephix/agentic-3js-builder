import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";

function msg(e: unknown) { return e instanceof Error ? e.message : String(e); }
// All-degenerate input: nearest() reaches hit(-1), despite surface() accepting a mesh target.
{
  const b=createBuilder({name:"degenerate"}); const j=b.joint("root",{at:[0,0,0]});
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 2,0,0],3));
  const p=b.part(g,"#999",{bone:j,at:[0,0,0],name:"flat"}); const s=b.surface(p);
  try { console.log("degenerate nearest",s.nearest([0,0,0])); } catch(e:unknown) { console.log("degenerate nearest ERROR",msg(e)); }
  try { console.log("degenerate ray",s.ray([0,0,1],[0,0,-1])); } catch(e:unknown) { console.log("degenerate ray ERROR",msg(e)); }
}
// Plane through exact radial vertices, x=0, to expose sign-zero handling.
{
  const b=createBuilder({name:"loopzero"}); const j=b.joint("root",{at:[0,0,0]});
  const p=b.part(new THREE.CylinderGeometry(1,1,2,8,1,false),"#999",{bone:j,at:[0,0,0],name:"cyl"}); const s=b.surface(p);
  for (const dir of [[1,0,0],[0,0,1],[1,1,0]]) {
    try { const l=s.loop([0,0,0],{dir}); console.log("loop dir",dir,{closed:l.closed,len:+l.length.toFixed(6),samples:[0,.25,.5,.75,1].map(t=>l.at(t).toArray().map(v=>+v.toFixed(4)))}); }
    catch(e:unknown){console.log("loop dir",dir,"ERROR",msg(e));}
  }
}
// Two disjoint spheres cut by one plane: selection of nearest/enclosing chain.
{
  const b=createBuilder({name:"twoloops"}); const j=b.joint("root",{at:[0,0,0]});
  const a=b.part(new THREE.SphereGeometry(.8,12,8),"#999",{bone:j,at:[-1.2,0,0],name:"a"});
  const c=b.part(new THREE.SphereGeometry(.3,12,8),"#999",{bone:j,at:[1.2,0,0],name:"c"}); const s=b.surface([a,c]);
  for(const at of [[-1.2,0,0],[0,0,0],[1.2,0,0]]) { try { const l=s.loop(at,{dir:[0,1,0]}); console.log("two loop",at,{at0:l.at(0).toArray().map(v=>+v.toFixed(4)),len:+l.length.toFixed(5)}); } catch(e:unknown){console.log("two loop",at,"ERROR",msg(e));} }
}
// zero-length drape path on normal surface.
{
  const b=createBuilder({name:"zerodrape"}); const j=b.joint("root",{at:[0,0,0]}); const p=b.part(new THREE.SphereGeometry(1,8,6),"#999",{bone:j,at:[0,0,0]}); const s=b.surface(p);
  try { const d=s.drape(polyline([[0,1,0],[0,1,0]])); console.log("zero drape",{len:d.length,at:d.at(.5).toArray()}); } catch(e:unknown){ console.log("zero drape ERROR",msg(e)); }
}
