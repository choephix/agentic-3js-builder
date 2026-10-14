import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";

const p = new THREE.Vector3();
const n = new THREE.Vector3(0,1,0);
const child = paint((_p,_n,s) => s[0] < 0.5 ? "#ff0000" : "#0000ff");
const outer = paint((_p,_n,s) => child);
const direct = paint((_p,_n,s) => child.at(_p,_n,s));
console.log("nested no-explicit-s", outer.at(p,n,[0.25,12]), outer.at(p,n,[0.75,12]));
console.log("nested explicit-s", direct.at(p,n,[0.25,12]), direct.at(p,n,[0.75,12]));

const b = createBuilder({name:"seam", detail:1, paintSize:512});
b.joint("root", {at:[0,0,0]});
const path = catmull([
  [0,0,-0.25], [0,0,0], [0,0,0.25], [0,0.5,0.5], [0,1,0.5], [0,1.5,0.25], [0,1.5,0],
]);
const seen: Array<[number,number]> = [];
const pattern = paint((_p,_n,s) => { seen.push([s[0], s[1]]); return s[1] < 10 || s[1] > 350 ? "#f00" : "#00f"; });
const sweep = b.sweep(path, 0.08, { color: pattern, caps:"round" });
const root = b.root;
const deg = seen.map(([,d]) => d);
const bins = Array.from({length:36},()=>0);
for(const d of deg) bins[Math.min(35, Math.floor(d/10))]++;
console.log("bake angle samples", {count:deg.length,min:Math.min(...deg),max:Math.max(...deg),bins,meshCount:sweep.meshes.length,children:root.children.length});
console.log("sweep endpoints", sweep.at(0,0).at.toArray(), sweep.at(1,0).at.toArray());
