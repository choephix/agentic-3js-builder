import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";

function dump(label: string, x: any) {
  if (x === null) console.log(label, "null");
  else if (x?.at) console.log(label, { at: x.at.toArray().map((v:number)=>+v.toFixed(6)), n: x.n?.toArray().map((v:number)=>+v.toFixed(6)), mesh: x.mesh?.name, bone: x.bone?.name });
  else console.log(label, x);
}

// Ray misses and sphere hits.
{
  const b = createBuilder({name:"ray"}); const j=b.joint("root", {at:[0,0,0]});
  const p=b.part(new THREE.SphereGeometry(1, 12, 8), "#f00", {bone:j, at:[0,0,0], name:"sphere"});
  const s=b.surface(p);
  dump("ray away", s.ray([0,0,3], [0,1,0]));
  dump("ray inward", s.ray([0,0,3], [0,0,-1]));
  dump("ray zero", s.ray([0,0,3], [0,0,0]));
  dump("nearest far", s.nearest([0,0,3]));
}

// Smooth-skinned chain and joint-target surface.
{
  const b = createBuilder({name:"smooth"}); const root=b.joint("root", {at:[0,0,0]});
  const chain=b.chain("arm", [[0,0,0],[0,1,0],[1,2,0]], {parent:root, count:3, names:["a","b","c"]});
  const sw=b.sweep(chain, 0.2, {name:"smoothTube", caps:"flat", color:"#999"});
  console.log("smooth meshes", sw.meshes.map(m=>m.name), "joint maps", chain.joints.map(j=>b.ctx.meshes.get(j)?.map(m=>m.name) ?? []));
  try { console.log("surface joint", b.surface(chain.joints[1])); } catch (e:any) { console.log("surface joint error", e.message); }
  const surf=b.surface(sw); dump("smooth before", surf.nearest([0,1,0]));
  b.pose(chain.joints[1], {axis:[0,0,1], deg:45});
  dump("smooth after pose", surf.nearest([0,1,0]));
}

// Stick bbox differences.
{
  const b=createBuilder({name:"stick"}); const j=b.joint("root",{at:[0,0,0]});
  const body=b.part(new THREE.SphereGeometry(0.5,8,4),"#888",{bone:j,at:[0,0,0]});
  const s=b.surface(body); const hit=s.nearest([0,0.5,0]);
  const short=new THREE.BoxGeometry(0.1,0.1,0.1); const tall=new THREE.BoxGeometry(0.1,0.4,0.1);
  const a=b.stick(short,"#f00",hit,{name:"short",embed:0.2}); const c=b.stick(tall,"#0f0",hit,{name:"tall",embed:0.2});
  console.log("stick hit",hit.at.toArray(),"short origin",a.at.toArray(),"tall origin",c.at.toArray(),"minmax",short.boundingBox?.min.toArray(),tall.boundingBox?.min.toArray());
}

// Drape on tucked concave U-like path/body (nearest can choose wrong belly edge).
{
  const b=createBuilder({name:"drape"}); const j=b.joint("root",{at:[0,0,0]});
  const geom=new THREE.TorusGeometry(1,0.24,8,32,Math.PI*1.5); // open C/U, axis Y
  const p=b.part(geom,"#999",{bone:j,at:[0,0,0],name:"body"}); const s=b.surface(p);
  const path=polyline([[-1,0,0],[0,-1.05,0],[1,0,0]]);
  const d=s.drape(path,{lift:0.01});
  console.log("drape", {length:+d.length.toFixed(6), pts:[0,.25,.5,.75,1].map(t=>d.at(t).toArray().map(v=>+v.toFixed(4)))});
}

// Loop cross sections and misses.
{
  const b=createBuilder({name:"loop"}); const j=b.joint("root",{at:[0,0,0]});
  const p=b.part(new THREE.CylinderGeometry(1,1,2,8,1,false),"#999",{bone:j,at:[0,0,0],name:"cyl"}); const s=b.surface(p);
  for (const [label, on, opts] of [["middle", [0,0,0], {}], ["off",[0,3,0],{}], ["vertical",[0,0,0],{dir:[0,1,0]}]] as any) {
    try { const l=s.loop(on,opts); console.log("loop",label,{closed:l.closed,length:+l.length.toFixed(6),pts:l.knots.length,at0:l.at(0).toArray().map((v:number)=>+v.toFixed(5))}); }
    catch(e:any){console.log("loop",label,"ERR",e.message)}
  }
}
