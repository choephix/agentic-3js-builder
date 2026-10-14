```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, catmull } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Elephant Calf",
  description:
    "A gentle African elephant calf with dusty slate skin, big pink-flushed ears, a curling trunk, baby tusks, lashes and padded feet.",
};

const SLATE = "#767a82";
const LIGHT = "#8e9198";
const DUST = "#a98068";
const DARK = "#4b4e55";

// Slate skin with reddish dust (heavier low down), plus fine wrinkle creases.
function skinAt(p: THREE.Vector3, n: THREE.Vector3): Rgb {
  const base = mix(SLATE, LIGHT, noise(p, 0.2, 3));
  const dust = Math.min(1, Math.max(0, smoothstep(0.7, 0.0, p.y) * 0.75 + (noise(p, 0.25, 9) - 0.5) * 0.7 + 0.15));
  let c = mix(base, DUST, dust * 0.8);
  const w = Math.sin(p.y * 55 + p.z * 14 + noise(p, 0.1, 4) * 12);
  if (w > 0.72) c = mix(c, DARK, 0.3);
  if (n.y < -0.3) c = mix(c, LIGHT, 0.25);
  return c;
}
const skin = paint((p, n) => skinAt(p, n));
const earSkin = paint((p, n, s) => {
  const base = skinAt(p, n);
  const d = Math.hypot((s[0] - 0.22) / 0.27, (s[1] - 0.08) / 0.3);
  const amt = smoothstep(0.05, 0.5, n.z) * smoothstep(1.05, 0.45, d);
  let c = mix(base, "#d89a9c", amt * 0.85);
  const vein = Math.sin(Math.atan2(s[1] - 0.05, s[0] + 0.05) * 14 + noise(p, 0.1, 2) * 3);
  if (amt > 0.3 && vein > 0.85) c = mix(c, "#b97480", 0.35);
  return c;
});

export default function build() {
  const b = createBuilder({ name: "elephantCalf" });

  // ---- skeleton ----
  const pelvis = b.joint("pelvis", { at: [0, 0.72, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine1 = b.joint("spine1", { parent: pelvis, at: [0, 0.76, 0.1], dir: [0, 0, 1], role: "spine" });
  b.joint("neck", { parent: spine1, at: [0, 0.8, 0.42], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: "neck", at: [0, 0.84, 0.52], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.72, 0.58], dir: [0, 0, 1], role: "jaw" });

  const ball = (at: number[], sc: number[], color: any, bone: any, seg: [number, number] = [12, 8]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, scale: sc, bone });

  // ---- body ----
  ball([0, 0.72, -0.05], [0.3, 0.36, 0.58], skin, pelvis, [16, 10]);
  ball([0, 0.78, 0.22], [0.29, 0.34, 0.3], skin, spine1, [14, 10]);
  ball([0, 0.78, -0.55], [0.26, 0.28, 0.16], skin, pelvis);
  ball([0, 0.82, 0.44], [0.25, 0.27, 0.22], skin, "neck");

  // ---- head ----
  ball([0, 0.88, 0.62], [0.23, 0.25, 0.25], skin, head, [14, 10]);
  ball([0, 0.99, 0.6], [0.19, 0.17, 0.19], skin, head);
  ball([0, 0.78, 0.74], [0.12, 0.12, 0.1], skin, head);
  ball([0, 0.68, 0.7], [0.11, 0.05, 0.14], skin, jaw);

  // ---- eyes, lids, lashes ----
  for (const s of [1, -1]) {
    const E = [s * 0.207, 0.9, 0.7];
    ball(E, [0.03, 0.03, 0.03], "#3d2314", head, [8, 6]);
    ball([E[0] + s * 0.012, E[1] + 0.012, E[2] + 0.022], [0.009, 0.009, 0.009], "#ffffff", head, [5, 4]);
    ball([E[0] + s * 0.004, E[1] + 0.016, E[2] - 0.004], [0.036, 0.022, 0.036], skin, head, [8, 6]);
    for (let k = -2; k <= 2; k++) {
      const base = new THREE.Vector3(E[0] + s * 0.006, E[1] + 0.026, E[2] + k * 0.014);
      const tip = base.clone().add(new THREE.Vector3(s * 0.028, 0.026, k * 0.012 + 0.012));
      b.rod(base, tip, [0.004, 0.0015], { color: "#2a1d18", sides: 4, bone: head });
    }
  }

  // ---- ears ----
  const earOutline: Array<[number, number]> = [
    [0, 0.05], [0.06, 0.2], [0.16, 0.3], [0.3, 0.34], [0.42, 0.28], [0.46, 0.14],
    [0.43, 0.0], [0.36, -0.12], [0.26, -0.2], [0.16, -0.2], [0.07, -0.12], [0, -0.05],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const at: [number, number, number] = [0.17 * s, 0.98, 0.52];
    const ear = b.joint(`ear${S}`, { parent: head, at, dir: [0.8 * s, 0, -0.6], role: "hinge" });
    b.extrude(earOutline, {
      color: earSkin, at, x: [0.8 * s, 0, -0.6], y: [0, 1, 0],
      thickness: 0.022, bevel: 0.006, smoothing: 1, bone: ear, name: `ear${S}`,
    });
  }

  // ---- tusks ----
  for (const s of [1, -1])
    b.spike([0.095 * s, 0.73, 0.75], [0.13 * s, 0.67, 0.9], null, 0.028, { color: "#f0e8d2", bone: head, sides: 6 });

  // ---- trunk ----
  const trunkPath = catmull([
    [0, 0.78, 0.76], [0, 0.62, 0.84], [0, 0.44, 0.9], [0, 0.3, 0.99], [0, 0.22, 1.1], [0, 0.27, 1.22],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head, count: 6, role: "tentacle", names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6"],
  });
  b.sweep(trunk, [0.105, 0.09, 0.075, 0.06, 0.048, 0.04], { color: skin, sides: 10, caps: { start: "round", end: "round" } });
  for (let k = 1; k <= 11; k++) {
    const t = k / 12;
    const pt = trunk.at(t);
    b.part(new THREE.TorusGeometry((0.105 - 0.065 * t) * 1.03, 0.007, 4, 10), "#5f6369", {
      frame: pt, dir: pt.axis, axis: "z",
    });
  }
  const tipPt = trunk.at(1);
  b.part(new THREE.SphereGeometry(0.03, 7, 5), "#9a8683", { at: tipPt.local([0, 0.02, 0]), bone: "trunk6" });

  // ---- legs ----
  const leg = (names: string[], pts: number[][], parent: any, s: number) => {
    const chain = b.chain(names[0] + "Chain", catmull(pts.length === 2 ? pts : pts, { }), { parent, names, role: "leg" });
    return chain;
  };
  const legSpecs = [
    { n: ["shoulder", "elbow", "wrist"], parent: spine1, z: [0.22, 0.24, 0.25] },
    { n: ["hip", "knee", "ankle"], parent: pelvis, z: [-0.38, -0.33, -0.36] },
  ];
  for (const spec of legSpecs)
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const pts = [
        [0.18 * s, 0.62, spec.z[0]],
        [0.2 * s, 0.36, spec.z[1]],
        [0.2 * s, 0.1, spec.z[2]],
      ];
      const chain = b.chain(`${spec.n[0]}${S}Leg`, pts, {
        parent: spec.parent, names: spec.n.map((x) => x + S), role: "leg",
      });
      b.sweep(chain, [0.125, 0.1, 0.1], { color: skin, sides: 10, caps: { start: "round", end: "flat" } });
      ball([0.18 * s, 0.64, spec.z[0]], [0.15, 0.17, 0.17], skin, spec.n[0] + S);
      const tip = spec.n[2] + S;
      const fx = 0.2 * s;
      const fz = spec.z[2];
      b.part(new THREE.CylinderGeometry(0.108, 0.125, 0.1, 10), skin, { at: [fx, 0.05, fz], bone: tip });
      b.part(new THREE.TorusGeometry(0.115, 0.012, 4, 10), "#5f6369", { at: [fx, 0.085, fz], rotation: [90, 0, 0], bone: tip });
      for (let i = 0; i < 4; i++) {
        const a = (-0.5 + i / 3) * 0.95;
        b.part(new THREE.BoxGeometry(0.034, 0.04, 0.022), "#e8dfcf", {
          at: [fx + Math.sin(a) * 0.118, 0.045, fz + Math.cos(a) * 0.118],
          rotation: [0, (a * 180) / Math.PI, 0], bone: tip,
        });
      }
    }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([[0, 0.84, -0.6], [0, 0.7, -0.68], [0, 0.52, -0.7], [0, 0.4, -0.7]]),
    { parent: pelvis, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  b.sweep(tail, [0.035, 0.022, 0.016], { color: skin, sides: 6, caps: { start: "round", end: "round" } });
  const tp = tail.at(1).at;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const base = tp.clone().add(new THREE.Vector3(0, 0.01, 0));
    const end = tp.clone().add(new THREE.Vector3(Math.cos(a) * 0.035, -0.11 - (i % 2) * 0.03, Math.sin(a) * 0.035));
    b.rod(base, end, [0.009, 0.003], { color: "#35302e", sides: 4, bone: tail });
  }

  return b.root;
}
```