import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";
const b = createBuilder({ name: "weight-wing", detail: 1 });
const root = b.joint("root", { at: [0, 1, 0] });
const a = b.chain("fingerA", [[0, 1, 0], [1, 1, 0]], { parent: root, names: ["aBase", "aTip"], role: "digit" });
const c = b.chain("fingerB", [[0, 1, 0], [1, 0, 0]], { parent: root, names: ["bBase", "bTip"], role: "digit" });
b.membrane(a, c, { thickness: 0.01, rows: 3, cols: 5, color: "#f66", name: "m" });
const obj=b.root; let m: THREE.Mesh|undefined; obj.traverse(o=>{if((o as THREE.Mesh).isMesh)m=o as THREE.Mesh});
if (!m) throw new Error("mesh missing");
const p=m.geometry.getAttribute("position"), w=m.geometry.getAttribute("skinWeight");
console.log("attrs",p.count,w?.count,m.userData.skinBones);
const sums = new Map<string, number>();
for(let i=0;i<(w?.count??0);i++){let s=0;for(let k=0;k<4;k++)s+=w!.getComponent(k,i);const q=s.toFixed(6);sums.set(q,(sums.get(q)??0)+1);}
console.log("sums", [...sums]);
for(let i=0;i<20;i++) console.log(i,[w?.getX(i),w?.getY(i),w?.getZ(i),w?.getW(i)]);
