```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  paint,
  grain,
  mix,
  noise,
  smoothstep,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Antique Gramophone",
  description:
    "Walnut cabinet with pale floral inlay, a morning-glory brass horn with green patina, a record on the turntable, a silver tonearm, a side crank and claw feet.",
};

function flower(cx: number, cy: number, s: number) {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += `<ellipse cx="${cx}" cy="${cy - 11 * s}" rx="${5 * s}" ry="${10 * s}" transform="rotate(${i * 60} ${cx} ${cy})" fill="#efe1b8" stroke="#c9b27a" stroke-width="1"/>`;
  }
  out += `<circle cx="${cx}" cy="${cy}" r="${4.5 * s}" fill="#d9b25c"/>`;
  return out;
}
function leaf(x: number, y: number, rot: number) {
  return `<ellipse cx="${x}" cy="${y}" rx="11" ry="4.5" transform="rotate(${rot} ${x} ${y})" fill="#cdbb87"/>`;
}
const inlaySvg = `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
<rect x="3" y="3" width="194" height="114" rx="8" fill="none" stroke="#e6d6a6" stroke-width="2.5"/>
<rect x="9" y="9" width="182" height="102" rx="5" fill="none" stroke="#c9b27a" stroke-width="1"/>
<path d="M20 60 C45 20 70 100 100 60 C130 20 155 100 180 60" fill="none" stroke="#d8c791" stroke-width="2.5"/>
${leaf(45, 38, -30)}${leaf(60, 82, 30)}${leaf(140, 38, 30)}${leaf(155, 82, -30)}${leaf(80, 30, 10)}${leaf(120, 90, 10)}
${flower(100, 60, 1.5)}${flower(38, 60, 0.8)}${flower(162, 60, 0.8)}${flower(70, 92, 0.5)}${flower(130, 28, 0.5)}
</svg>`;

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("turntable", { parent: root, at: [0, 0.36, 0.06], dir: [0, 1, 0] });
  b.joint("tonearm", { parent: root, at: [-0.18, 0.4, -0.04], dir: [0, 0, 1] });
  b.joint("crank", { parent: root, at: [0.22, 0.27, 0], dir: [1, 0, 0] });

  const wood = grain("#4b2b16", "#6d4223", { size: 0.02, axis: "x", seed: 3 });
  const woodDark = grain("#341d0e", "#4e2e17", { size: 0.015, axis: "y", seed: 5 });
  const TAU = Math.PI / 180;
  const brass = paint((p, n, s) => {
    const m = smoothstep(0.42, 0.66, noise(p, 0.06, 2));
    const base = mix("#c08d3a", "#5e9078", m * 0.85);
    const flute = smoothstep(0.7, 1, Math.cos(s[1] * 16 * TAU));
    return mix(base, "#e0b865", flute * 0.35 * (1 - m));
  });
  const brassFlat = paint((p) => mix("#b88a3a", "#6a9a80", smoothstep(0.45, 0.7, noise(p, 0.03, 8)) * 0.7));
  const silver = paint((p) => mix("#c9ccd0", "#8e949a", noise(p, 0.02, 4)));

  const box = (w: number, h: number, l: number, c: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, l), c, { at, ...opt });

  // Cabinet
  box(0.48, 0.03, 0.46, woodDark, [0, 0.075, 0]);
  const body = box(0.44, 0.24, 0.42, wood, [0, 0.21, 0]);
  box(0.48, 0.03, 0.46, woodDark, [0, 0.345, 0]);
  box(0.5, 0.008, 0.48, wood, [0, 0.364, 0]);
  const front = box(0.34, 0.18, 0.006, woodDark, [0, 0.21, 0.213]);
  const sideL = box(0.006, 0.18, 0.3, woodDark, [0.223, 0.21, 0]);
  const sideR = box(0.006, 0.18, 0.3, woodDark, [-0.223, 0.21, 0]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(0.03, 0.24, 0.03, woodDark, [sx * 0.215, 0.21, sz * 0.205]);
      b.part(new THREE.SphereGeometry(0.02, 8, 6), brassFlat, { at: [sx * 0.215, 0.335, sz * 0.205] });
      // claw foot
      box(0.06, 0.04, 0.06, woodDark, [sx * 0.2, 0.05, sz * 0.19]);
      const bc = new THREE.Vector3(sx * 0.2, 0.03, sz * 0.19);
      b.part(new THREE.SphereGeometry(0.03, 8, 6), brassFlat, { at: bc });
      for (const a of [-40, 0, 40]) {
        const out = new THREE.Vector3(sx, 0, sz).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), a * TAU);
        const dir = new THREE.Vector3(out.x, -0.7, out.z).normalize();
        b.spike(bc, dir, 0.055, 0.011, { color: brassFlat, sides: 5 });
      }
    }
  const tex = svg(inlaySvg, { size: 512 });
  b.decal([body, front], tex, { at: [0, 0.21, 0.216], dir: [0, 0, 1], size: [0.31, 0.17] });
  b.decal([body, sideL], tex, { at: [0.226, 0.21, 0], dir: [1, 0, 0], size: [0.28, 0.16], up: [0, 1, 0], mirror: true });
  b.decal([body, sideR], tex, { at: [-0.226, 0.21, 0], dir: [-1, 0, 0], size: [0.28, 0.16] });
  for (const x of [-0.07, 0.07]) b.part(new THREE.SphereGeometry(0.012, 8, 6), brassFlat, { at: [x, 0.28, 0.22] });

  // Turntable
  const felt = "#2f5a3a";
  b.part(new THREE.CylinderGeometry(0.148, 0.148, 0.012, 24), felt, { at: [0, 0.37, 0.06], bone: "turntable" });
  const grooves = paint((p) => {
    const r = Math.hypot(p.x, p.z - 0.06);
    return mix("#0c0c0e", "#26262b", 0.5 + 0.5 * Math.sin(r * 700));
  });
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.004, 32), grooves, { at: [0, 0.378, 0.06], bone: "turntable" });
  const label = paint((p) => {
    const r = Math.hypot(p.x, p.z - 0.06);
    return Math.abs(r - 0.034) < 0.002 || r < 0.006 ? "#e3bd5e" : "#a8191c";
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.0055, 24), label, { at: [0, 0.3805, 0.06], bone: "turntable" });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 8), silver, { at: [0, 0.388, 0.06], bone: "turntable" });

  // Tonearm
  b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.04, 12), brassFlat, { at: [-0.18, 0.38, -0.04], bone: "root" });
  const armPath = catmull([
    [-0.18, 0.4, -0.04],
    [-0.12, 0.408, 0.03],
    [-0.07, 0.395, 0.09],
  ]);
  b.sweep(armPath, 0.005, { color: silver, bone: "tonearm", sides: 8 });
  b.rod([-0.18, 0.4, -0.04], [-0.2, 0.4, -0.08], 0.004, { color: silver, bone: "tonearm" });
  b.part(new THREE.SphereGeometry(0.016, 8, 6), silver, { at: [-0.2, 0.4, -0.08], bone: "tonearm" });
  const armEnd = armPath.at(1);
  b.part(new THREE.BoxGeometry(0.014, 0.008, 0.03), silver, {
    at: armEnd.clone().add(new THREE.Vector3(0, -0.003, 0.008)),
    dir: armPath.tangentAt(1),
    axis: "z",
    bone: "tonearm",
  });
  b.part(new THREE.CylinderGeometry(0.0016, 0.0004, 0.012, 5), "#d8d8d8", {
    at: armEnd.clone().add(new THREE.Vector3(0, -0.012, 0.012)),
    bone: "tonearm",
  });

  // Crank
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 16), brassFlat, { at: [0.223, 0.27, 0], dir: [1, 0, 0], bone: "crank" });
  b.sweep(polyline([[0.22, 0.27, 0], [0.3, 0.27, 0], [0.3, 0.2, 0]]), 0.007, { color: silver, bone: "crank", sides: 8 });
  b.rod([0.3, 0.2, 0], [0.36, 0.2, 0], 0.012, { color: woodDark, bone: "crank", sides: 8 });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), brassFlat, { at: [0.36, 0.2, 0], bone: "crank" });

  // Horn
  b.lathe(
    [[0, 0], [0.05, 0], [0.05, 0.012], [0.036, 0.022], [0.03, 0.045], [0, 0.045]],
    { color: brassFlat, at: [0, 0.364, -0.12], segments: 14, bone: "root" },
  );
  const hornPath = catmull([
    [0, 0.375, -0.12],
    [0, 0.5, -0.145],
    [0, 0.62, -0.08],
    [0, 0.71, 0.06],
    [0, 0.82, 0.26],
  ]);
  const rad = (t: number) => 0.026 + 0.27 * Math.pow(t, 3.5) + 0.03 * t;
  b.sweep(hornPath, rad, { color: brass, bone: "root", sides: 16, caps: { start: "round", end: "none" }, detail: 1.5 });
  const end = hornPath.at(1);
  const tan = hornPath.tangentAt(1, true);
  b.part(new THREE.TorusGeometry(rad(1), 0.012, 6, 24), brassFlat, { at: end, dir: tan, axis: "z", bone: "root" });
  b.part(new THREE.CircleGeometry(0.26, 20), "#2a2418", {
    at: end.clone().addScaledVector(tan, -0.05),
    dir: tan,
    axis: "z",
    bone: "root",
  });
  // brace from horn to cabinet
  b.rod([0, 0.36, -0.2], [0, 0.55, -0.14], 0.01, { color: brassFlat, bone: "root", sides: 6 });

  return b.root;
}
```