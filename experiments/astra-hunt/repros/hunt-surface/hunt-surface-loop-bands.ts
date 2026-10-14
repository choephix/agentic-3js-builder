import { createBuilder } from "../../../../src/builder";

const b=createBuilder({name:"bands"}); const j=b.joint("root",{at:[0,0,0]});
const tube=b.sweep([[0,-1,0],[0,1,0]],.5,{color:"#0f0",bands:[[.5,"#f00"],[1,"#00f"]],caps:"flat",name:"bandTube"});
const plain=b.sweep([[0,-1,0],[0,1,0]],.5,{color:"#0f0",caps:"flat",name:"plainTube"});
const plainSurface=b.surface(plain);
const plainLoop=plainSurface.loop([0.1,0,0],{dir:[1,0,0]});
console.log("plain loop",{closed:plainLoop.closed,length:+plainLoop.length.toFixed(5)});
const s=b.surface(tube);
console.log("band meshes",tube.meshes.map(m=>m.name),"surface",s.meshes.map(m=>m.name));
for(const x of [0,.01,.1]) { try { const l=s.loop([x,0,0],{dir:[1,0,0]}); console.log("band loop",x,{closed:l.closed,length:+l.length.toFixed(5),samples:[0,.25,.5,.75,1].map(t=>l.at(t).toArray().map(v=>+v.toFixed(4)))}); } catch(e:unknown) { console.log("band loop",x,"ERR",e instanceof Error?e.message:String(e)); } }
