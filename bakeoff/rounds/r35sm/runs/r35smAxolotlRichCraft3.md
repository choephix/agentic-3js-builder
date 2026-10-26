```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, countershade, mottle, paint, spots, svg } from "agentic-3js-builder";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chibi axolotl with a big round head, a wide smile, stubby legs, a finned tail and frilly pink gills.",
};

const SKIN = countershade(
  spots(mottle("#f7bccb", "#f2a8bb", { size: 0.06, seed: 3 }), "#e88fa8", { size: 0.022, amount: 0.22, seed: 5 }),
  "#fde3e7",
  { level: -0.25 },
);
const GILL = "#e8437a";
const FROND_A = "#ff6f9f";
const FROND_B = "#f0558a";
const TIP = "#ffb3cc";
const TOE = "#f2a3b6";

const FACE = svg(
  `<svg viewBox="0 0 100 60">
  <path d="M18 24 Q50 56 82 24" stroke="#8a2f4a" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <path d="M18 24 l-4 -5 M82 24 l4 -5" stroke="#8a2f4a" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="45" cy="9" rx="2.2" ry="1.6" fill="#b5566f"/>
  <ellipse cx="55" cy="9" rx="2.2" ry="1.6" fill="#b5566f"/>
  <path d="M40 40 Q50 48 60 40 Q50 34 40 40Z" fill="#f08aa5" opacity="0.8"/>
</svg>`,
  { size: 256 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="29" fill="#1a1020"/>
  <circle cx="32" cy="32" r="29" fill="none" stroke="#3a2a48" stroke-width="3"/>
  <ellipse cx="22" cy="21" rx="9" ry="10" fill="#ffffff"/>
  <circle cx="42" cy="43" r="5" fill="#ffffff"/>
  <circle cx="45" cy="30" r="2.5" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 64 40">
  <defs><radialGradient id="g"><stop offset="0" stop-color="#ff5f8f" stop-opacity="0.85"/><stop offset="1" stop-color="#ff5f8f" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="32" cy="20" rx="30" ry="18" fill="url(#g)"/>
  <path d="M18 14 l4 10 M30 12 l4 10 M42 14 l4 10" stroke="#e03c70" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>
</svg>`,
  { size: 128 },
);

const FIN = paint((_p, _n, s) => {
  const y = Math.abs(s[1]);
  return y > 0.022 ? "#f0618f" : y > 0.015 ? "#f78fb0" : "#f9a7c0";
});

export default function build() {
  const b = createBuilder({ name: "axolotl" });

  // ---------- skeleton
  const hips = b.joint("hips", { at: [0, 0.05, -0.02], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.05, -0.02],
      [0, 0.055, 0.04],
      [0, 0.06, 0.09],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.06, 0.09], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.04, 0.08], aim: [0, 0.04, 0.17], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.05, -0.02],
      [0, 0.05, -0.1],
      [0, 0.05, -0.18],
      [0, 0.055, -0.25],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- body and tail
  b.sweep(
    catmull([
      [0, 0.05, -0.1],
      [0, 0.05, -0.02],
      [0, 0.055, 0.05],
      [0, 0.06, 0.09],
    ]),
    (t) => [0.03 + 0.016 * Math.sin(Math.PI * Math.min(1, t * 1.2)), 0.03 + 0.012 * Math.sin(Math.PI * Math.min(1, t * 1.2))],
    { bone: [tail, hips, spine], color: SKIN },
  );
  b.sweep(tail, (t) => [0.026 - 0.02 * t, 0.03 - 0.02 * t], { color: SKIN });
  b.extrude(
    [
      [0, 0.02],
      [0.05, 0.032],
      [0.12, 0.031],
      [0.19, 0.014],
      [0.215, 0.002],
      [0.19, -0.012],
      [0.12, -0.029],
      [0.05, -0.031],
      [0, -0.02],
    ],
    { at: [0, 0.05, -0.05], x: [0, 0, -1], thickness: 0.004, smoothing: 1, color: FIN, bone: tail.joints[1] },
  );

  // ---------- head
  const HC: [number, number, number] = [0, 0.06, 0.1];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    bone: head,
    at: HC,
    scale: [0.075, 0.056, 0.075],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#fcd5dc", {
    bone: jaw,
    at: [0, 0.036, 0.135],
    scale: [0.055, 0.016, 0.045],
  });
  b.decal(skull, FACE, { at: [0, 0.047, 0.175], dir: [0, 0, 1], size: [0.1, 0.06], bone: head });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = skin.around(HC).at(s * 32, 28);
    if (eye) b.decal(skull, EYE, { at: eye, size: [0.046, 0.046], lift: 0.002, bone: head });
    const cheek = skin.around(HC).at(s * 58, -8);
    if (cheek) b.decal(skull, BLUSH, { at: cheek, size: [0.04, 0.026], lift: 0.002, bone: head });
    // brow bumps
    b.part(new THREE.SphereGeometry(1, 8, 5), "#f4aebf", {
      bone: head,
      at: [s * 0.043, 0.098, 0.136],
      scale: [0.02, 0.01, 0.016],
    });
  }

  // ---------- gills
  const V = THREE.Vector3;
  const gill = (root: number[], ctrl: number[], tip: number[], fl: number) => {
    const path = bezier(root, ctrl, tip);
    b.sweep(path, [0.0065, 0.0028], { bone: head, color: GILL, sides: 5 });
    const ref = new V(0, 0, 1);
    for (let i = 0; i < 7; i++) {
      const t = 0.2 + (0.8 * i) / 6;
      const p = new V().copy(path.at(t));
      const T = new V().copy(path.tangentAt(t)).normalize();
      let p1 = T.clone().cross(ref);
      if (p1.length() < 0.2) p1 = T.clone().cross(new V(0, 1, 0));
      p1.normalize();
      const p2 = T.clone().cross(p1).normalize();
      for (const k of [1, -1]) {
        for (const [pp, w] of [
          [p1, 0],
          [p2, 1],
        ] as [THREE.Vector3, number][]) {
          const dir = T.clone().multiplyScalar(0.45).addScaledVector(pp, k * 0.9).normalize();
          b.spike(p, dir, fl * (1 - 0.35 * t) * (w ? 0.8 : 1), 0.0032, {
            bone: head,
            color: (i + w) % 2 ? FROND_A : FROND_B,
            sides: 4,
          });
        }
      }
    }
    b.part(new THREE.SphereGeometry(0.0062, 6, 4), TIP, { bone: head, at: tip });
  };
  for (const s of [1, -1]) {
    gill([s * 0.055, 0.075, 0.06], [s * 0.09, 0.115, 0.05], [s * 0.13, 0.15, 0.0], 0.034);
    gill([s * 0.065, 0.065, 0.055], [s * 0.12, 0.085, 0.05], [s * 0.18, 0.1, 0.02], 0.036);
    gill([s * 0.06, 0.055, 0.055], [s * 0.1, 0.045, 0.05], [s * 0.155, 0.035, 0.015], 0.032);
  }

  // ---------- legs
  const legs: [string, number, number[][], boolean][] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    legs.push([
      `FL${L}`,
      s,
      [
        [s * 0.05, 0.04, 0.03],
        [s * 0.078, 0.027, 0.04],
        [s * 0.092, 0.012, 0.055],
      ],
      true,
    ]);
    legs.push([
      `HL${L}`,
      s,
      [
        [s * 0.05, 0.04, -0.07],
        [s * 0.085, 0.028, -0.085],
        [s * 0.1, 0.012, -0.075],
      ],
      false,
    ]);
  }
  for (const [nm, s, pts, front] of legs) {
    const leg = b.chain(`leg${nm}`, catmull(pts), {
      parent: front ? spine.joints[0] : hips,
      names: [`hip${nm}`, `knee${nm}`, `foot${nm}`],
      role: "leg",
    });
    b.sweep(leg, [0.015, 0.011], { color: SKIN });
    const foot = pts[2];
    const bone = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), "#f6b1c1", {
      bone,
      at: [foot[0], 0.009, foot[2]],
      scale: [0.016, 0.009, 0.02],
    });
    for (let k = -1; k <= 1; k++) {
      const a = k * 0.5;
      const d = new V(s * (Math.sin(a) + 0.35), 0, (front ? 1 : -1) * Math.cos(a)).normalize();
      const base = new V(foot[0], 0.008, foot[2]);
      const tip = base.clone().addScaledVector(d, 0.026);
      b.capsule(base, tip, 0.0045, { bone, color: TOE, sides: 5 });
    }
  }

  return b.root;
}
```