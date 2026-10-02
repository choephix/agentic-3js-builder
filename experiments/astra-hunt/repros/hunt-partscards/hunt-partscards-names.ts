import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
function run(extra: boolean) {
 const b=createBuilder({name:"n"}); const root=b.joint("root",{at:[0,0,0]}); const head=b.joint("head",{parent:root,at:[0,1,0]});
 if(extra) b.part(new THREE.BoxGeometry(),"#abc",{bone:head,group:"other"});
 b.part(new THREE.BoxGeometry(),"#abc",{bone:head});
 if(extra) b.part(new THREE.BoxGeometry(),"#abc",{bone:head,group:"other"});
 b.part(new THREE.BoxGeometry(),"#abc",{bone:head});
 b.part(new THREE.BoxGeometry(),"#abc",{bone:head,group:"other"});
 b.root; const a:string[]=[]; b.root.traverse(o=>{if((o as THREE.Mesh).isMesh)a.push(o.name)}); return a;
}
console.log(run(false)); console.log(run(true));
