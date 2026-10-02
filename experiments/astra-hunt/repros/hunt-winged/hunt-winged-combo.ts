import * as THREE from "three";
import type { Chain } from "../../../../src/skeleton";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { paint } from "../../../../src/paint";

const BODY = "#58402d";
const WING = "#7d4f5a";
const FEATHER = "#d29b45";
const MEMBRANE = paint((p, n, s) => {
  if (n.y > 0.2 && s[1] < 0.18) return "#e4a0b0";
  return p.y > 1.15 ? "#ad6b7a" : "#714552";
});

const b = createBuilder({ name: "winged-combo", detail: 0.65 });
const hips = b.joint("hips", { at: [0, 1, 0], role: "spine" });
const body = b.chain("body", catmull([[0, 1, 0], [0, 1.1, 0.35], [0, 1.2, 0.65]]), { parent: hips, names: ["body1", "body2", "bodyTip"], role: "spine" });
b.sweep(body, [0.20, 0.13], { color: MEMBRANE, group: "body" });
const head = b.joint("head", { parent: body.tip!, at: [0, 1.23, 0.76], dir: [0, 0.05, 1], role: "head" });
const jaw = b.joint("jaw", { parent: head, at: [0, 1.18, 0.91], dir: [0, -0.2, 1], role: "jaw" });
b.extrude([[0, 0], [0.16, 0.02], [0.2, -0.02], [0.0, -0.04]], { at: head, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, color: FEATHER, bone: head, name: "upperBeak", group: "beak" });
b.extrude([[0, 0], [0.15, 0], [0.17, -0.035], [0, -0.05]], { at: jaw, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.045, color: "#bf704b", bone: jaw, name: "lowerJaw", group: "beak" });

const wings: { side: number; arm: Chain; fingers: Chain[]; membranes: THREE.Mesh[] }[] = [];
for (const side of [1, -1]) {
  const arm = b.chain(`arm${side > 0 ? "L" : "R"}`, [[side * 0.13, 1.1, 0.2], [side * 0.42, 1.2, 0.15], [side * 0.70, 1.08, -0.02]], { parent: hips, names: [`elbow${side > 0 ? "L" : "R"}`, `wrist${side > 0 ? "L" : "R"}`, `hand${side > 0 ? "L" : "R"}`], role: "wing", group: `wing${side}` });
  b.sweep(arm, [0.065, 0.035], { color: BODY, group: `wing${side}` });
  const tips = [
    [side * 1.22, 1.00, -0.18],
    [side * 1.18, 0.84, -0.25],
    [side * 1.08, 0.68, -0.20],
  ] as [number, number, number][];
  const fingers = tips.map((tip, i) => b.chain(`finger${side > 0 ? "L" : "R"}${i}`, [arm.at(1), tip], { parent: arm.tip!, names: [`finger${side > 0 ? "L" : "R"}${i}Base`, `finger${side > 0 ? "L" : "R"}${i}`], role: "digit", group: `wing${side}` }));
  for (const f of fingers) b.sweep(f, [0.018, 0.006], { color: BODY, caps: { end: "point" }, group: `wing${side}` });
  const membranes: THREE.Mesh[] = [];
  for (let i = 0; i < fingers.length - 1; i++) membranes.push(b.membrane(fingers[i], fingers[i + 1], { thickness: 0.012, color: MEMBRANE, rows: 3, cols: 8, group: `wing${side}`, name: `membrane${side}-${i}` }));
  membranes.push(b.membrane(fingers[2], polyline([[side * 0.70, 1.08, -0.02], [side * 0.38, 0.95, 0.11], [side * 0.16, 0.94, 0.17]]), { thickness: 0.014, color: MEMBRANE, rows: 3, cols: 8, group: `wing${side}`, name: `bodyMembrane${side}` }));
  // feathers attached to arm chain points; each side is built by mirrored frame axes.
  for (let i = 1; i <= 3; i++) {
    const at = arm.at(i / 4);
    const x = at.dir([1, 0, 0]);
    const y = at.dir([0, 1, 0]);
    b.extrude([[0, 0], [0.045, 0.02], [0.11, 0.01], [0.15, -0.03], [0.08, -0.055], [0, -0.025]], { at, x, y, thickness: 0.008, color: FEATHER, bone: at.bone, name: `flight${side}-${i}`, group: `feathers${side}` });
  }
  wings.push({ side, arm, fingers, membranes });
}

// Tail fan: ring group joints and extruded fan blades.
const tail = b.chain("tail", [[0, 1.02, -0.05], [0, 0.94, -0.34]], { parent: hips, names: ["tailBase", "tailTip"], role: "tail" });
const fan = b.ring(tail.tip!, { count: 7, fromDeg: -70, toDeg: 70, radius: 0.04, joints: 3, name: "tailFan", parent: tail.tip!, role: "fan" });
fan.items.forEach((item, i) => b.extrude([[0, 0], [0.055, 0.02], [0.12, 0.01], [0.18, -0.06], [0, -0.035]], { at: item, x: item.dir([1, 0, 0]), y: item.axis, thickness: 0.006, color: FEATHER, bone: item.bone!, name: `tailFeather${i}`, group: "tailFan" }));

const root = b.root;
root.updateMatrixWorld(true);
const meshes: THREE.Mesh[] = [];
root.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
const worldPos = (mesh: THREE.Mesh) => {
  const p = mesh.geometry.getAttribute("position"); const out: number[] = []; const v = new THREE.Vector3();
  for (let i=0;i<p.count;i++) out.push(...v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).toArray());
  return out;
};
const areaStats = (mesh: THREE.Mesh) => {
  const p = mesh.geometry.getAttribute("position"); const idx = mesh.geometry.getIndex(); let deg=0, min=Infinity;
  const a=new THREE.Vector3(),bb=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
  for(let i=0;i<(idx?idx.count:p.count);i+=3){ const ids=idx?[idx.getX(i),idx.getX(i+1),idx.getX(i+2)]:[i,i+1,i+2]; a.fromBufferAttribute(p,ids[0]);bb.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]); const ar=ab.subVectors(bb,a).cross(ac.subVectors(c,a)).length(); min=Math.min(min,ar);if(ar<1e-10)deg++; }
  return { tris: (idx?idx.count:p.count)/3, deg, min };
};
console.log("meshes", meshes.map(m=>({name:m.name,group:m.userData.group,owner:m.userData.owner, skinBones:m.userData.skinBones, areas:areaStats(m)})));
for (const w of wings) {
  const mm = meshes.filter(m => String(m.userData.name ?? m.name).includes(`membrane${w.side}`) || m.name.includes(`membrane${w.side}`));
  console.log("wing", w.side, "membrane count", mm.length, mm.map(m=>({n:m.name,skin:m.geometry.getAttribute("skinWeight")?.count,bones:m.userData.skinBones,area:areaStats(m)})));
}
const left=meshes.filter(m=>m.name.includes("flight1-")); const right=meshes.filter(m=>m.name.includes("flight-1-"));
for(const lm of left){ const suffix=lm.name.match(/flight1-(\d+)/)?.[1]; const rm=right.find(m=>m.name===`flight-1-${suffix}`);if(!rm)continue;const a=worldPos(lm),bb=worldPos(rm);let md=0;for(let i=0;i<Math.min(a.length,bb.length);i+=3)md=Math.max(md,Math.abs(a[i]+bb[i]),Math.abs(a[i+1]-bb[i+1]),Math.abs(a[i+2]-bb[i+2]));console.log("mirror-rest",suffix,{vertices:a.length/3,other:bb.length/3,maxError:md});}
// pose elbow and fingers, inspect membrane farthest point movement and weights.
const mem = meshes.find(m=>m.name.includes("membrane1-0"))!;
const before = worldPos(mem);
const wi = mem.geometry.getAttribute("skinWeight");
let weighted=0; if(wi) for(let i=0;i<wi.count;i++){let sum=wi.getX(i)+wi.getY(i)+wi.getZ(i)+wi.getW(i);if(sum>0.99)weighted++;}
console.log("membrane weights", {vertices: mem.geometry.getAttribute("position").count, weighted, skinAttr: !!wi});
const feather = meshes.find((mesh) => mesh.name === "flight1-3");
if (!feather) throw new Error("feather missing");
const featherBefore = worldPos(feather);
b.pose(wings[0].arm.joints[1], { axis: [1,0,0], deg: 65 });
b.pose(wings[0].fingers[0].tip!, { axis: [1,0,0], deg: 55 });
root.updateMatrixWorld(true);
const after = worldPos(mem); let maxMove=0; for(let i=0;i<before.length;i+=3) maxMove=Math.max(maxMove,Math.hypot(after[i]-before[i],after[i+1]-before[i+1],after[i+2]-before[i+2]));
console.log("posed membrane", {maxMove, finite: after.every(Number.isFinite), area: areaStats(mem)});
const featherAfter = worldPos(feather); let featherMove=0; for(let i=0;i<featherBefore.length;i+=3) featherMove=Math.max(featherMove,Math.hypot(featherAfter[i]-featherBefore[i],featherAfter[i+1]-featherBefore[i+1],featherAfter[i+2]-featherBefore[i+2])); console.log("posed feather", {featherMove, finite: featherAfter.every(Number.isFinite), bone: feather.userData.skinBones});
// lower jaw follows its joint
const jawMesh=meshes.find(m=>m.name.includes("lowerJaw"))!; const jp=worldPos(jawMesh); b.pose(jaw,{axis:[1,0,0],deg:-35}); root.updateMatrixWorld(true); const jq=worldPos(jawMesh); let jmove=0;for(let i=0;i<jp.length;i+=3)jmove=Math.max(jmove,Math.hypot(jq[i]-jp[i],jq[i+1]-jp[i+1],jq[i+2]-jp[i+2]));console.log("jaw move",jmove);
