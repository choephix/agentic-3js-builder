import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { paint, noise, mix, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult African bush elephant: faceted barrel body, huge fan ears, ridged trunk, curved ivory tusks, wrinkle-painted grey hide.",
  style: "low-poly",
  commit: "88fc1f0",
};

const SKIN = "#8a8683";
const SKIN_D = "#6d6965";
const SKIN_L = "#a29d98";
const DUST = "#b49a7c";
const EAR_IN = "#a98a84";
const IVORY = "#efe4c8";
const IVORY_D = "#cdbf9c";
const NAIL = "#d8cdb6";
const EYE = "#2a1c14";
const EYE_RING = "#5a4a40";
const BRISTLE = "#2f2b29";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "africanElephant", detail: 0.7 });
  const R = rng(11);

  // ---------- paints ----------
  const hide = paint((p, n) => {
    const base = mix(SKIN, SKIN_L, noise(p, 0.5, 3) * 0.7);
    const wr = noise(p.clone().multiply(new THREE.Vector3(3.5, 9, 3.5)), 0.09, 7);
    const wr2 = noise(p.clone().multiply(new THREE.Vector3(8, 2.5, 8)), 0.08, 9);
    const crease = Math.max(smoothstep(0.62, 0.7, wr), smoothstep(0.66, 0.72, wr2)) * 0.5;
    let c = mix(base, SKIN_D, crease);
    const dust = smoothstep(1.1, 0.1, p.y) * (0.45 + noise(p, 0.3, 21) * 0.5);
    c = mix(c, DUST, dust * 0.65);
    if (n.y < -0.4) c = mix(c, SKIN_D, 0.5);
    return c;
  });
  const hideFine = paint((p) => {
    const wr = noise(p.clone().multiply(new THREE.Vector3(5, 14, 5)), 0.06, 13);
    const c = mix(SKIN, SKIN_L, noise(p, 0.3, 5) * 0.6);
    const dust = smoothstep(0.9, 0.0, p.y) * 0.5;
    return mix(mix(c, SKIN_D, smoothstep(0.58, 0.68, wr) * 0.55), DUST, dust);
  });
  const earPaint = paint((p) => {
    const veins = noise(p, 0.18, 4);
    const edge = mix(SKIN_D, SKIN, 0.4 + veins * 0.4);
    return mix(edge, DUST, smoothstep(2.2, 1.2, p.y) * 0.4);
  });
  const trunkPaint = paint((p) => {
    const ring = Math.sin(p.y * 62 + p.z * 40) * 0.5 + 0.5;
    const c = mix(SKIN, SKIN_L, noise(p, 0.3, 8) * 0.6);
    return mix(c, SKIN_D, smoothstep(0.55, 0.9, ring) * 0.55);
  });

  // ---------- textures ----------
  const wrinkle = svg(
    `<svg viewBox="0 0 64 16"><path d="M2 8 Q16 2 32 8 T62 8" stroke="#4e4a47" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const bristle = svg(
    `<svg viewBox="0 0 16 48"><path d="M8 47 Q5 24 9 2" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
    { size: 96 },
  );

  // ---------- body ----------
  const spine = catmull(
    [
      [0, 2.32, 1.15],
      [0, 2.5, 0.5],
      [0, 2.55, -0.25],
      [0, 2.42, -1.0],
      [0, 2.2, -1.65],
    ],
    {},
  );
  const bodyR = [0.78, 0.9, 0.96, 0.92, 0.7];
  b.sweep(spine, {
    radius: (t) => {
      const k = t * 4;
      const i = Math.min(3, Math.floor(k));
      const ww = bodyR[i] + (bodyR[i + 1] - bodyR[i]) * (k - i);
      return [ww, ww * 1.12];
    },
    color: hide,
    sides: 10,
    caps: "round",
    detail: 1,
  });
  // belly bulge
  b.sweep(polyline([[0, 1.55, 0.7], [0, 1.45, 0], [0, 1.5, -0.8]]), [0.62, 0.7], {
    color: hide,
    sides: 8,
    caps: "round",
  });
  // shoulder / hip masses
  for (const s of [1, -1]) {
    b.capsule([s * 0.62, 2.3, 0.7], [s * 0.66, 1.4, 0.7], [0.5, 0.42], { color: hide, sides: 8 });
    b.capsule([s * 0.62, 2.2, -1.1], [s * 0.66, 1.35, -1.1], [0.52, 0.42], { color: hide, sides: 8 });
  }
  // back ridge / withers
  b.sweep(polyline([[0, 3.0, 0.8], [0, 3.08, 0.0], [0, 2.95, -1.0]]), [0.22, 0.3], {
    color: hide,
    sides: 6,
    caps: "round",
  });
  // scapular ridge bumps
  for (const s of [1, -1]) {
    b.capsule([s * 0.55, 2.95, 0.55], [s * 0.78, 2.55, 0.35], [0.14, 0.2], { color: SKIN_D, sides: 6 });
  }

  // ---------- legs ----------
  const legs: Array<{ x: number; z: number; r0: number; r1: number }> = [
    { x: 0.66, z: 0.72, r0: 0.42, r1: 0.33 },
    { x: -0.66, z: 0.72, r0: 0.42, r1: 0.33 },
    { x: 0.66, z: -1.12, r0: 0.44, r1: 0.35 },
    { x: -0.66, z: -1.12, r0: 0.44, r1: 0.35 },
  ];
  for (const l of legs) {
    b.frustumBox([l.x, 1.75, l.z], [l.x, 0.28, l.z], [l.r0 * 2, l.r0 * 2], [l.r1 * 2, l.r1 * 2], {
      color: hideFine,
      caps: "flat",
    });
    for (const y of [0.9, 0.55, 1.2]) {
      b.rod([l.x, y, l.z], [l.x, y + 0.04, l.z], [0.37 - (y < 0.8 ? 0.02 : 0), 0.37], {
        color: SKIN_D,
        sides: 8,
        caps: "flat",
      });
    }
    b.frustumBox([l.x, 0.3, l.z], [l.x, 0.0, l.z], [l.r1 * 2 + 0.06, l.r1 * 2 + 0.06], [l.r1 * 2 + 0.12, l.r1 * 2 + 0.12], {
      color: DUST,
      caps: "flat",
    });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.07), NAIL, {
        at: [l.x + i * 0.13, 0.07, l.z + l.r1 + 0.07],
        rotation: [-15, i * 12, 0],
      });
    }
  }

  // ---------- head ----------
  b.loft(
    [
      { at: [0, 2.5, 1.35], w: 1.0, h: 1.2 },
      { at: [0, 2.62, 1.75], w: 0.95, h: 1.3 },
      { at: [0, 2.7, 2.1], w: 0.78, h: 1.15 },
      { at: [0, 2.55, 2.45], w: 0.55, h: 0.8 },
    ],
    { color: hide, caps: "flat" },
  );
  // forehead dome
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.34, 0), SKIN_L, { at: [s * 0.2, 3.22, 1.92], scale: [1, 0.85, 1.1] });
  }
  b.part(new THREE.IcosahedronGeometry(0.3, 0), hide, { at: [0, 3.2, 1.7], scale: [1.2, 0.9, 1.1] });
  // cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.3, 0), hide, { at: [s * 0.4, 2.38, 2.15], scale: [0.8, 1, 1.1] });
  }
  // brow ridges
  for (const s of [1, -1]) {
    b.capsule([s * 0.28, 2.98, 2.3], [s * 0.5, 2.9, 2.0], [0.07, 0.09], { color: SKIN_D, sides: 6 });
  }

  // trunk
  const trunkPath = catmull(
    [
      [0, 2.45, 2.4],
      [0, 2.0, 2.65],
      [0, 1.4, 2.78],
      [0, 0.8, 2.78],
      [0, 0.38, 2.92],
      [0, 0.18, 3.25],
    ],
    {},
  );
  b.sweep(trunkPath, {
    radius: [0.3, 0.075],
    color: trunkPaint,
    sides: 8,
    caps: "flat",
  });
  // trunk ridge rings
  for (let i = 0; i < 16; i++) {
    const t = 0.1 + i * 0.054;
    const p = trunkPath.at(t);
    const tan = trunkPath.tangentAt(t);
    const r = 0.3 + (0.075 - 0.3) * t + 0.012;
    b.part(new THREE.TorusGeometry(r, 0.012, 3, 8), SKIN_D, { at: p, dir: tan, axis: "z" });
  }
  // trunk tip fingers
  b.spike([0, 0.2, 3.25], [0, 0.15, 3.4], null, 0.03, { color: SKIN_L, sides: 5, caps: "round" });
  b.capsule([0, 0.2, 3.22], [0, 0.17, 3.34], [0.05, 0.035], { color: SKIN_L, sides: 5 });
  b.capsule([0, 0.12, 3.22], [0, 0.1, 3.32], [0.04, 0.03], { color: SKIN_D, sides: 5 });
  // nostril
  b.part(new THREE.CircleGeometry(0.03, 5), "#3a3230", { at: [0, 0.13, 3.345], dir: [0, 0, 1], axis: "z" });

  // mouth + chin
  b.capsule([0.0, 2.1, 2.35], [0, 2.0, 2.4], [0.28, 0.2], { color: SKIN_D, sides: 7 });

  // ---------- tusks ----------
  for (const s of [1, -1]) {
    const tuskPath = catmull(
      [
        [s * 0.34, 2.28, 2.2],
        [s * 0.5, 1.9, 2.5],
        [s * 0.58, 1.5, 3.0],
        [s * 0.5, 1.28, 3.5],
        [s * 0.34, 1.35, 3.9],
        [s * 0.22, 1.6, 4.15],
      ],
      {},
    );
    b.sweep(tuskPath, {
      radius: [0.105, 0.025],
      color: (t) => (t > 0.8 ? IVORY_D : IVORY),
      sides: 7,
      caps: "point",
    });
    b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 7), SKIN_D, {
      at: [s * 0.34, 2.28, 2.2],
      dir: [s * 0.4, -0.5, 0.8],
      axis: "y",
    });
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.075, 0), EYE_RING, { at: [s * 0.48, 2.82, 2.14], scale: [0.8, 1, 1] });
    b.part(new THREE.IcosahedronGeometry(0.045, 0), EYE, { at: [s * 0.52, 2.82, 2.16] });
    b.part(new THREE.IcosahedronGeometry(0.014, 0), "#ffffff", { at: [s * 0.545, 2.85, 2.2] });
    b.spike([s * 0.5, 2.9, 2.17], [s * 0.4, 1, 0.5], 0.06, 0.008, { color: BRISTLE, sides: 4 });
  }

  // ---------- ears ----------
  const earOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0.0],
    [0.35, 0.3],
    [0.8, 0.45],
    [1.2, 0.25],
    [1.4, -0.3],
    [1.35, -0.95],
    [1.1, -1.5],
    [0.7, -1.7, "sharp"],
    [0.4, -1.35],
    [0.15, -0.8],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.55, 3.05, 1.35],
      x: [s * 0.55, 0, -0.85],
      y: [s * 0.05, 1, 0],
      thickness: [0.05, 0.03],
      bevel: 0.012,
      smoothing: 1,
      color: earPaint,
    });
    // inner-ear panel
    b.extrude(
      [
        [0.1, -0.1],
        [0.5, 0.05],
        [0.95, -0.2],
        [1.05, -0.8],
        [0.8, -1.3],
        [0.5, -1.1],
        [0.25, -0.6],
      ],
      {
        at: [s * 0.55, 3.05, 1.37],
        x: [s * 0.55, 0, -0.85],
        y: [s * 0.05, 1, 0],
        thickness: [0.02, 0.012],
        smoothing: 1,
        color: EAR_IN,
      },
    );
    // ear rim ridge
    b.sweep(
      polyline([
        [s * 0.6, 3.1, 1.3],
        [s * 1.05, 3.35, 0.95],
        [s * 1.5, 3.2, 0.55],
        [s * 1.75, 2.7, 0.2],
        [s * 1.7, 2.1, -0.15],
        [s * 1.45, 1.65, -0.55],
      ]),
      [0.05, 0.035],
      { color: SKIN_D, sides: 5, caps: "round" },
    );
  }

  // ---------- tail ----------
  const tailPath = catmull(
    [
      [0, 2.5, -1.95],
      [0, 2.2, -2.15],
      [0, 1.6, -2.22],
      [0, 0.95, -2.18],
    ],
    {},
  );
  b.sweep(tailPath, { radius: [0.1, 0.045], color: hide, sides: 6, caps: "round" });
  // tail tuft: cards hanging from the tail end (frames face up, lean 180)
  b.cards(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return frame([Math.cos(a) * 0.04, 1.0, -2.18 + Math.sin(a) * 0.04], [0, 1, 0]);
    }),
    bristle,
    { size: [0.05, 0.3], lean: 180, flow: [0, 0, 1], color: BRISTLE, cross: true },
  );

  // ---------- surface detail: wrinkle cards on body ----------
  const bodyS = b.surface(b.root);
  const wr = bodyS.scatter(110, {
    rng: R,
    minDist: 0.22,
    filter: (h) => h.n.y > -0.2 && h.at.y > 0.9 && h.at.z < 2.0,
  });
  b.cards(wr, wrinkle, { size: [0.28, 0.07], lean: 90, flow: [0, 0, 1], color: SKIN_D, vary: 0.35, spin: 25, rng: rng(5) });

  // bristles on top of head and forehead
  const headHits = b
    .surface(b.root)
    .scatter(40, { rng: rng(8), minDist: 0.08, filter: (h) => h.at.y > 3.1 && h.at.z > 1.4 && h.at.z < 2.2 });
  b.cards(headHits, bristle, { size: [0.03, 0.12], lean: 20, flow: [0, 0.2, -1], color: BRISTLE, vary: 0.3, rng: rng(9) });

  // chin hair
  b.cards(
    [-0.12, 0, 0.12].map((x) => frame([x, 1.95, 2.55], [0, 1, 0])),
    bristle,
    { size: [0.03, 0.14], lean: 180, flow: [0, 0, 1], color: BRISTLE },
  );

  return b.root;
}
