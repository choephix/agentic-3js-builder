```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "A high-fantasy anime kitsune: white fox with red markings, golden bells, nine fanned tails tipped in blue spirit fire, and floating foxfire flames.",
};

const WHITE = "#fbf6ee";
const CREAM = "#efe3d0";
const RED = "#d8323a";
const INK = "#2a1630";
const GOLD = "#f2c24a";
const FIRE = "#6fd6ff";
const FIRE_D = "#3b6fe0";
const FIRE_L = "#d8f6ff";
const PINK = "#f2a3b4";

export default function build() {
  const b = createBuilder({ name: "kitsune", paintSize: 1024 });
  const R = rng(5);

  const coat = paint((p, n) => mix(mix(CREAM, WHITE, smoothstep(-0.5, 0.6, n.y)), "#e4d6ee", 0.25 * noise(p, 0.15, 3)));

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.25], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.25], [0, 0.54, 0.05], [0, 0.6, 0.3]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.6, 0.3], [0, 0.78, 0.42], [0, 0.9, 0.5]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.9, 0.5], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.87, 0.58], aim: [0, 0.85, 0.78], role: "jaw" });

  // body
  b.loft(
    [
      { at: [0, 0.5, -0.4], w: 0.22, h: 0.26 },
      { at: [0, 0.5, -0.2], w: 0.3, h: 0.32 },
      { at: [0, 0.54, 0.08], w: 0.3, h: 0.34 },
      { at: [0, 0.62, 0.3], w: 0.26, h: 0.3 },
    ],
    { bone: [hips, spine], color: coat, sides: 10 }
  );
  b.sweep(neck, [0.11, 0.09], { color: coat, sides: 8 });

  // head
  b.part(new THREE.SphereGeometry(0.15, 10, 8), coat, { bone: head, at: [0, 0.9, 0.52], scale: [1.15, 0.9, 1] });
  b.part(new THREE.ConeGeometry(0.075, 0.2, 8), coat, { bone: head, at: [0, 0.875, 0.68], dir: [0, 0.2, 1] });
  b.part(new THREE.ConeGeometry(0.06, 0.12, 8), coat, { bone: jaw, at: [0, 0.84, 0.66], dir: [0, 0.1, 1], scale: [1, 1, 0.6] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), INK, { bone: head, at: [0, 0.885, 0.79] });
  // cheek ruffs
  for (const s of [1, -1]) {
    b.spike([s * 0.12, 0.86, 0.5], [s * 1, -0.3, -0.2], 0.12, 0.05, { bone: head, color: WHITE, sides: 5 });
    b.spike([s * 0.11, 0.88, 0.5], [s * 1, 0.1, -0.1], 0.1, 0.04, { bone: head, color: CREAM, sides: 5 });
  }
  // eyes
  const eye = svg(`<svg viewBox="0 0 64 48"><path d="M3 30 Q32 -4 61 26 Q32 46 3 30Z" fill="${INK}"/><ellipse cx="34" cy="28" rx="15" ry="14" fill="#f2b21c"/><ellipse cx="34" cy="29" rx="5" ry="11" fill="${INK}"/><circle cx="28" cy="22" r="5" fill="#fff"/><path d="M4 30 L0 38" stroke="${RED}" stroke-width="4"/></svg>`, { size: 192 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.1, 0.075), "#ffffff", { bone: head, at: [s * 0.095, 0.93, 0.635], dir: [s * 0.45, 0, 1], axis: "z", texture: eye });
    // red face marks
    b.spike([s * 0.13, 0.9, 0.6], [s * 1, -0.2, 0.2], 0.04, 0.012, { bone: head, color: RED, sides: 4 });
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.08, 1.0, 0.48], dir: [s * 0.35, 1, -0.1], role: "hinge" });
    b.spike([s * 0.08, 1.0, 0.48], [s * 0.35, 1, -0.1], 0.2, 0.07, { bone: ear, color: WHITE, sides: 4 });
    b.spike([s * 0.08, 1.01, 0.5], [s * 0.35, 1, -0.1], 0.15, 0.04, { bone: ear, color: PINK, sides: 4 });
    b.spike([s * 0.095, 1.17, 0.46], [s * 0.35, 1, -0.1], 0.05, 0.02, { bone: ear, color: INK, sides: 4 });
  }
  // forehead mark
  b.part(new THREE.OctahedronGeometry(0.025, 0), RED, { bone: head, at: [0, 0.99, 0.62], scale: [0.7, 1.4, 0.4], flat: true });

  // legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.2 : -0.35;
      const pts = limb([s * 0.12, 0.5, z], [s * 0.12, 0.04, z + 0.02], [0.26, 0.24], [[0, 0, front ? -1 : 1]]);
      const nm = front ? ["shoulder", "elbow", "paw"] : ["hip", "knee", "foot"];
      const leg = b.chain(`leg${front ? "F" : "H"}${k}`, pts, { parent: front ? chest : hips, names: nm.map((n) => n + k), role: "leg", contact: [s * 0.12, 0, z] });
      b.sweep(leg, [0.065, 0.032], { color: (t) => (t > 0.7 ? INK : coat), sides: 6 });
      b.part(new THREE.SphereGeometry(0.05, 6, 4), INK, { bone: leg.tip!, at: [s * 0.12, 0.03, z + 0.04], scale: [1, 0.6, 1.4] });
    }
  }

  // collar with bell
  b.sweep(catmull([[0.1, 0.72, 0.34], [0, 0.7, 0.42], [-0.1, 0.72, 0.34], [0, 0.72, 0.28]], { closed: true }), 0.02, { bone: neck.joints[0], color: RED, sides: 5 });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), GOLD, { bone: neck.joints[0], at: [0, 0.66, 0.44] });

  // flame texture
  const flame = svg(`<svg viewBox="0 0 32 64"><path d="M16 0 Q30 26 26 46 Q22 62 16 64 Q8 62 6 46 Q4 28 16 0Z" fill="${FIRE_D}"/><path d="M16 14 Q25 32 22 48 Q19 60 16 62 Q11 58 10 46 Q9 32 16 14Z" fill="${FIRE}"/><path d="M16 32 Q21 44 18 56 Q16 60 14 56 Q11 44 16 32Z" fill="${FIRE_L}"/></svg>`, { size: 128 });

  // nine tails
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.56, -0.5], dir: [0, 0.3, -1], role: "tail" });
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 1.15; // fan angle
    const lift = 0.95 - Math.abs(i - 4) * 0.06;
    const base = new THREE.Vector3(0, 0.56, -0.5);
    const mid = new THREE.Vector3(Math.sin(a) * 0.35, 0.8 + lift * 0.25, -0.75 - Math.cos(a) * 0.1);
    const tip = new THREE.Vector3(Math.sin(a) * 0.85, 0.95 + lift * 0.55, -1.05 - Math.cos(a) * 0.15);
    const path = bezier(base, mid.clone().add(new THREE.Vector3(0, 0.15, 0)), tip);
    const t = b.chain(`tail${i + 1}_`, path, { parent: tailBase, names: [`tail${i + 1}a`, `tail${i + 1}b`], role: "tail" });
    b.sweep(t, (u) => [0.05 + 0.1 * Math.sin(Math.min(1, u * 1.4) * 2.2) , 0.05 + 0.08 * Math.sin(Math.min(1, u * 1.4) * 2.2)], {
      sides: 8,
      color: (u) => (u > 0.78 ? RED : WHITE),
      caps: "round",
    });
    const e = path.at(1);
    const d = path.tangentAt(1);
    b.cards([{ at: e, axis: d } as never].length ? [b.region({ at: e, bone: t.tip ?? t.joints[1] })] : [], flame, { size: [0.14, 0.26], lean: 0, flow: [0, 0, -1], cross: true, color: "#ffffff" });
  }

  // floating foxfire flames
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const at = new THREE.Vector3(Math.cos(a) * 0.9, 0.5 + R() * 0.8, Math.sin(a) * 0.9 - 0.3);
    const f = glow(b.part(new THREE.PlaneGeometry(0.16, 0.3), "#ffffff", { bone: hips, at: at.toArray(), dir: [Math.cos(a), 0, Math.sin(a)], axis: "z", texture: flame }), 1.4);
    b.part(new THREE.PlaneGeometry(0.16, 0.3), "#ffffff", { bone: hips, at: at.toArray(), dir: [-Math.sin(a), 0, Math.cos(a)], axis: "z", texture: flame });
    void f;
  }

  return b.root;
}
```