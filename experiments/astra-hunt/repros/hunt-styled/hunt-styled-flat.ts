import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { svg } from "../../../../src/texture";
const DRAW = svg('<svg viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" fill="#ffffff"/></svg>', { size: 32 });
function uniqueNormals(mesh: THREE.Mesh) { const a=mesh.geometry.getAttribute("normal"); const out=new Set<string>(); for(let i=0;i<a.count;i++) out.add([a.getX(i),a.getY(i),a.getZ(i)].map(v=>v.toFixed(3)).join(",")); return {vertices:a.count, unique:out.size, indexed:Boolean(mesh.geometry.index)}; }
export default function build() {
  const b=createBuilder({name:"styled-flat",detail:1}); const root=b.joint("root",{at:[0,0,0]});
  const part=b.part(new THREE.BoxGeometry(.2,.2,.2),"#f00",{bone:root,at:[-.4,.2,0],flat:true});
  const sweep=b.sweep([[0,.1,0],[0,.3,0]],.1,{color:"#0f0",smooth:false,caps:"flat",bone:root});
  const extrude=b.extrude([[-.1,0],[.1,0],[.1,.2],[-.1,.2]],{at:[.4,.1,0],thickness:.1,color:"#00f",bone:root});
  const lathe=b.lathe([[.1,0],[.1,.2],[0,.2],[0,0]],{at:[.7,.1,0],segments:8,color:"#ff0",bone:root});
  const target=b.part(new THREE.BoxGeometry(.3,.3,.3),"#888",{bone:root,at:[1,.2,0]});
  const decal=b.decal(target,DRAW,{at:[1,.2,.15],dir:[0,0,1],size:[.15,.15],segments:2});
  const cards=b.cards([frame([1.4,.2,0],[0,1,0])],DRAW,{size:.1});
  for(const [n,p] of [["part",part.mesh],["sweep",sweep.meshes[0]], ["extrude",extrude.mesh],["lathe",lathe.mesh],["decal",decal.mesh]] as const) console.log(n,uniqueNormals(p));
  console.log("cards",uniqueNormals(cards[0]));
  return b.root;
}
