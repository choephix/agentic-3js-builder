```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, mix, noise, smoothstep, svg, offset } from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult African bush elephant: faceted barrel body, pillar legs with toenails, huge Africa-shaped ears with veins, ringed trunk, curved ivory tusks, bristled tail, dusty red-soil skin.",
};

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- palette
const C = {
  gray0: "#6d6966",
  gray2: "#a39e98",
  crease: "#47433f",
  dust: "#b8a07e",
  soil: "#9a6a48",
  belly: "#a3928b",
  shade: "#2a2630",
  ear0: "#8c8783",
  ear1: "#a59f9a",
  earVein: "#695f5c",
  earPink: "#b79b97",
  earRim: "#665f5b",
};
const IVORY = "#efe5cb";
const IVORY_BASE = "#9c8660";
const IVORY_TIP = "#cdbf9b";
const NAIL = "#cfc3a8";
const PAD = "#4a423e";
const BRISTLE = "#2a211d";
const NOSTRIL = "#7d6662";
const MOUTH = "#b57c7a";
const DARK = "#1c1412";

// ---------------------------------------------------------------- helpers
const keyed = (keys: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  const f = x - i;
  return keys[i] * (1 - f) + keys[i + 1] * f;
};

type Ridge = (p: THREE.Vector3, s: readonly [number, number]) => number;

/** Elephant hide: gray drift, wrinkle creases, dust on top, red soil near the ground, pale belly. */
function skinPaint(ridge: Ridge, seed: number) {
  return paint((p, n, s) => {
    const big = noise(p, 0.7, seed);
    let c = mix(C.gray0, C.gray2, smoothstep(0.2, 0.8, big));
    const fine = noise(p, 0.07, seed + 4);
    c = mix(c, C.gray0, 0.25 * smoothstep(0.55, 0.85, fine));
    c = mix(c, C.crease, 0.6 * smoothstep(0.8, 0.96, ridge(p, s)));
    c = mix(c, C.dust, 0.38 * smoothstep(0.3, 1, n.y) * smoothstep(0.3, 0.7, noise(p, 0.4, seed + 9)));
    c = mix(c, C.belly, 0.3 * smoothstep(-0.3, -0.9, n.y));
    const low = smoothstep(1.1, 0.1, p.y);
    c = mix(c, C.soil, 0.75 * low * (0.45 + 0.55 * noise(p, 0.18, seed + 11)));
    return mix(c, C.shade, 0.28 * (1 - smoothstep(-0.8, 0.5, n.y)));
  });
}

const ridgeBody: Ridge = (p) => 0.5 + 0.5 * Math.sin(p.y * 26 + 7 * noise(p, 0.6, 3));
const ridgeLeg: Ridge = (p) => 0.5 + 0.5 * Math.sin(p.y * 40 + 5 * noise(p, 0.4, 3));
const ridgeHead: Ridge = (p) => 0.5 + 0.5 * Math.sin(p.y * 32 + p.x * 6 + 6 * noise(p, 0.5, 3));
const TRUNK_FROM = 0.14;
const TRUNK_TO = 0.97;
const TRUNK_N = 16;
const TRUNK_STEP = (TRUNK_TO - TRUNK_FROM) / TRUNK_N;
const ridgeTrunk: Ridge = (p, s) =>
  0.5 + 0.5 * Math.cos((TAU * (s[0] - TRUNK_FROM)) / TRUNK_STEP + 1.2 * noise(p, 0.15, 3));

function earPaint(thick: THREE.Vector3) {
  return paint((p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return C.earRim;
    const ang = Math.atan2(s[1] - 0.15, s[0] + 0.1);
    const rad = Math.hypot(s[0] + 0.1, s[1] - 0.15);
    const vein = Math.sin(ang * 22 + rad * 3 + noise(p, 0.3, 4) * 3);
    let c = mix(C.ear0, C.ear1, smoothstep(0.3, 0.7, noise(p, 0.4, 6)));
    c = mix(c, C.earVein, 0.5 * smoothstep(0.85, 0.99, vein));
    c = mix(c, C.earPink, 0.4 * smoothstep(0.7, 0.0, s[0]));
    c = mix(c, C.dust, 0.25 * smoothstep(0.3, 1, noise(p, 0.5, 12)));
    c = mix(c, C.earRim, 0.6 * smoothstep(0.85, 1.15, rad));
    return c;
  });
}

// ---------------------------------------------------------------- textures
const eyeTexture = () =>
  svg(
    `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="a"><path d="M8 34 Q50 -2 92 34 Q50 62 8 34Z"/></clipPath></defs>
  <path d="M2 36 Q50 -14 98 36 Q50 70 2 36Z" fill="#574d48"/>
  <path d="M8 34 Q50 -2 92 34 Q50 62 8 34Z" fill="#e6d6b4"/>
  <g clip-path="url(#a)">
    <circle cx="50" cy="34" r="21" fill="#a8641c"/>
    <circle cx="50" cy="34" r="14" fill="#6b3a10"/>
    <circle cx="50" cy="34" r="8" fill="#140a06"/>
    <circle cx="43" cy="27" r="4.5" fill="#ffffff"/>
    <circle cx="57" cy="40" r="2" fill="#ffe9b0"/>
  </g>
  <path d="M8 34 Q50 -2 92 34" fill="none" stroke="#2a2220" stroke-width="5" stroke-linecap="round"/>
  <path d="M6 36 Q50 64 94 36" fill="none" stroke="#3b312e" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 20 l-6 -8 M34 12 l-3 -9 M50 9 l0 -9 M66 12 l3 -9 M80 20 l6 -8" stroke="#2a2220" stroke-width="3" stroke-linecap="round"/>
</svg>`,
    { size: 256 },
  );

const foldsArcs = () =>
  svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#524d4a" stroke-linecap="round">
    <path d="M10 20 Q62 2 112 24" stroke-width="3.6"/>
    <path d="M6 40 Q60 22 114 46" stroke-width="3"/>
    <path d="M14 60 Q62 44 108 66" stroke-width="3.4"/>
    <path d="M28 78 Q64 68 96 80" stroke-width="2.6"/>
    <path d="M30 12 Q38 22 34 32 M70 8 Q80 18 76 30" stroke-width="2"/>
  </g></svg>`,
    { size: 256 },
  );

const foldsVertical = () =>
  svg(
    `<svg viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#524d4a" stroke-linecap="round" stroke-width="3.2">
    <path d="M16 6 Q8 40 18 70 Q24 96 14 114"/>
    <path d="M38 2 Q32 36 40 64 Q46 90 38 116"/>
    <path d="M60 8 Q54 44 62 72 Q68 98 58 112"/>
    <path d="M78 20 Q72 50 80 78" stroke-width="2.4"/>
  </g></svg>`,
    { size: 256 },
  );

const faceFolds = () =>
  svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#4d4743" stroke-linecap="round">
    <path d="M8 50 Q40 68 94 38" stroke-width="4"/>
    <path d="M14 22 Q48 8 88 20" stroke-width="3"/>
    <path d="M10 34 Q48 20 92 32" stroke-width="2.8"/>
    <path d="M30 56 Q44 48 60 52" stroke-width="2.2"/>
  </g></svg>`,
    { size: 256 },
  );

const mudSplash = () =>
  svg(
    `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 50 L0 30 Q10 22 18 30 Q28 14 40 28 Q52 20 62 30 Q72 12 84 28 Q96 18 106 30 Q114 24 120 32 L120 50Z" fill="#7a573d"/>
  <g fill="#5f422f"><circle cx="30" cy="30" r="3"/><circle cx="64" cy="36" r="4"/><circle cx="92" cy="34" r="3"/><circle cx="12" cy="40" r="2.5"/></g>
  <g fill="#8d6a4d"><circle cx="46" cy="40" r="2"/><circle cx="78" cy="42" r="2.4"/></g></svg>`,
    { size: 256 },
  );

// ---------------------------------------------------------------- model
export default function build() {
  const b = createBuilder({ name: "africanBushElephant", paintSize: 2048 });
  type J = ReturnType<typeof b.joint>;
  type Outline = Parameters<typeof b.extrude>[0];
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  const SKIN_BODY = skinPaint(ridgeBody, 1);
  const SKIN_LEG = skinPaint(ridgeLeg, 1);
  const SKIN_HEAD = skinPaint(ridgeHead, 1);
  const SKIN_TRUNK = skinPaint(ridgeTrunk, 1);
  const SKIN_PLAIN = skinPaint(() => 0, 1);

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 2.3, -1.0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -1.0],
      [0, 2.25, -0.1],
      [0, 2.32, 0.7],
      [0, 2.4, 1.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.4, 1.3],
      [0, 2.55, 1.62],
      [0, 2.7, 1.95],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.7, 1.95], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.22, 1.95], aim: [0, 2.0, 2.5], role: "jaw" });

  const trunkPath = catmull([
    [0, 2.5, 2.45],
    [0, 2.05, 2.85],
    [0, 1.55, 3.1],
    [0, 1.05, 3.22],
    [0, 0.62, 3.28],
    [0, 0.3, 3.42],
    [0, 0.22, 3.68],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6"],
    role: "tentacle",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.7, -1.85],
      [0, 2.35, -2.3],
      [0, 1.8, -2.45],
      [0, 1.15, -2.43],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 2.3, -1.65], w: 1.15, h: 1.55 },
      { at: [0, 2.33, -1.2], w: 1.8, h: 2.0 },
      { at: [0, 2.3, -0.6], w: 1.92, h: 2.05 },
      { at: [0, 2.22, 0.1], w: 1.9, h: 2.0 },
      { at: [0, 2.3, 0.85], w: 1.86, h: 2.1 },
      { at: [0, 2.4, 1.4], w: 1.55, h: 1.95 },
      { at: [0, 2.5, 1.85], w: 1.0, h: 1.5 },
    ],
    { bone: spine, color: SKIN_BODY, sides: 10, smooth: false },
  );
  b.sweep(neck, 0.55, { color: SKIN_BODY, sides: 10, smooth: false });

  // muscular shoulder and hip bulges
  const bulges = [];
  for (const s of [1, -1]) {
    bulges.push(
      b.part(sph(), SKIN_BODY, { bone: spine.joints[2], at: [s * 0.7, 2.45, 0.85], scale: [0.36, 0.75, 0.62], flat: true }),
      b.part(sph(), SKIN_BODY, { bone: hips, at: [s * 0.78, 2.4, -1.25], scale: [0.4, 0.8, 0.72], flat: true }),
    );
  }

  // ------------------------------------------------------------ legs
  const legR = keyed([0.46, 0.38, 0.33, 0.32]);
  const makeLeg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const z = front ? 0.85 : -1.1;
    const fz = front ? 0.88 : -1.15;
    const rx = front ? 0.62 : 0.66;
    const root: [number, number, number] = [s * rx, 2.05, z];
    const foot: [number, number, number] = [s * (rx - 0.02), 0.32, fz];
    const pts = limb(root, foot, front ? [0.9, 0.86] : [0.92, 0.86], front ? [[0, 0, -1]] : [[0, 0, 1]]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const chain = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(chain, legR, { color: SKIN_LEG, sides: 8, smooth: false });
    const wrist = chain.joints[chain.joints.length - 1];

    // wrinkle folds around the lower leg
    b.along(
      chain,
      3,
      (at) =>
        b.part(new THREE.TorusGeometry(legR(at.t) * 1.04, 0.02, 4, 10), SKIN_PLAIN, {
          at,
          dir: at,
          axis: "z",
          flat: true,
        }),
      { from: 0.62, to: 0.92 },
    );

    // knee / elbow lump
    const mid = chain.joints[1];
    b.part(sph(), SKIN_LEG, {
      bone: mid,
      at: [mid.at.x, mid.at.y, mid.at.z + (front ? -0.16 : 0.16)],
      scale: [0.2, 0.22, 0.2],
      flat: true,
    });

    // foot: round pillar with dark pad and toenails
    b.part(new THREE.CylinderGeometry(0.3, 0.345, 0.36, 10), SKIN_LEG, {
      bone: wrist,
      at: [foot[0], 0.18, foot[2]],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 10), PAD, {
      bone: wrist,
      at: [foot[0], 0.03, foot[2]],
      flat: true,
    });
    const nn = front ? 5 : 4;
    for (let i = 0; i < nn; i++) {
      const a = (i - (nn - 1) / 2) * 24 * DEG;
      const dir: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
      b.part(new THREE.BoxGeometry(0.11, 0.1, 0.06), NAIL, {
        bone: wrist,
        at: [foot[0] + dir[0] * 0.33, 0.13, foot[2] + dir[2] * 0.33],
        dir,
        axis: "z",
        flat: true,
      });
    }
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  // ------------------------------------------------------------ head
  const HC: [number, number, number] = [0, 2.82, 2.05];
  const skull = b.part(sph(10, 8), SKIN_HEAD, { bone: head, at: HC, scale: [0.52, 0.62, 0.58], flat: true });
  const faceBulk = b.part(sph(10, 8), SKIN_HEAD, { bone: head, at: [0, 2.52, 2.3], scale: [0.38, 0.46, 0.36], flat: true });
  const headParts = [skull, faceBulk];
  const domes = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    domes.push(b.part(sph(), SKIN_HEAD, { bone: head, at: [s * 0.17, 3.3, 2.0], scale: [0.22, 0.2, 0.25], flat: true }));
    headParts.push(
      b.part(sph(), SKIN_HEAD, { bone: head, at: [s * 0.36, 2.55, 2.15], scale: [0.22, 0.26, 0.3], flat: true }),
    );
    // brow ridge
    b.capsule([s * 0.42, 3.03, 2.35], [s * 0.5, 3.0, 1.95], 0.055, { color: SKIN_HEAD, bone: head });

    // ears: Africa-shaped flaps hinged at the head
    const xd = new THREE.Vector3(s * 0.78, 0, -0.62);
    const yd = new THREE.Vector3(0, 1, 0);
    const thick = xd.clone().cross(yd).normalize();
    const root: [number, number, number] = [s * 0.46, 2.98, 1.98];
    const earJ: J = b.joint(`ear${side}`, { parent: head, at: root, dir: xd, role: "hinge" });
    const EAR: Outline = [
      [0, 0.6, "sharp"],
      [0.25, 0.78],
      [0.6, 0.8],
      [0.95, 0.62],
      [1.12, 0.3],
      [1.08, -0.1],
      [0.9, -0.5],
      [0.62, -0.9, "sharp"],
      [0.38, -0.6],
      [0.15, -0.28],
      [0, 0, "sharp"],
    ];
    b.extrude(EAR, {
      at: root,
      x: xd,
      y: yd,
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: earPaint(thick),
      bone: earJ,
    });

    // tusks
    const tuskPath = catmull([
      [s * 0.3, 2.35, 2.35],
      [s * 0.44, 1.85, 2.8],
      [s * 0.5, 1.5, 3.4],
      [s * 0.46, 1.5, 3.95],
      [s * 0.36, 1.7, 4.25],
    ]);
    b.sweep(tuskPath, [0.09, 0.012], {
      bone: head,
      sides: 8,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.22, IVORY_BASE],
        [0.92, IVORY],
        [1, IVORY_TIP],
      ],
    });
  }

  // lower jaw (separate so it can open)
  b.part(sph(), SKIN_HEAD, { bone: jaw, at: [0, 2.0, 2.2], scale: [0.3, 0.15, 0.34], flat: true });
  b.part(sph(), MOUTH, { bone: jaw, at: [0, 2.12, 2.24], scale: [0.2, 0.05, 0.24], flat: true });

  // ------------------------------------------------------------ trunk
  const trunkR = keyed([0.36, 0.3, 0.22, 0.15, 0.1]);
  b.sweep(trunk, trunkR, { color: SKIN_TRUNK, sides: 10, caps: { start: "round", end: "flat" } });
  b.along(
    trunk,
    TRUNK_N,
    (at) => {
      const r = trunkR(at.t);
      b.part(new THREE.TorusGeometry(r * 1.03, 0.012 + r * 0.07, 4, 10), SKIN_PLAIN, {
        at,
        dir: at,
        axis: "z",
        flat: true,
      });
    },
    { from: TRUNK_FROM, to: TRUNK_TO },
  );
  const tip = trunk.at(1);
  const trunkTipJ = trunk.joints[5];
  const nostrilBase = offset(tip.at, tip, 0.012);
  b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.024, 10), NOSTRIL, {
    bone: trunkTipJ,
    at: nostrilBase,
    dir: tip,
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.026, 6, 4), DARK, {
      bone: trunkTipJ,
      at: offset(offset(nostrilBase, tip, 0.012), tip.binormal, s * 0.034),
    });
  }

  // ------------------------------------------------------------ tail
  b.sweep(tail, [0.075, 0.03], { color: SKIN_PLAIN, sides: 6 });
  const tailEnd = tail.at(1);
  b.ring(tailEnd, { count: 12, radius: 0.03, tilt: 50 }, (it) => b.spike(it, it, 0.34, 0.014, { color: BRISTLE }));
  b.ring(tailEnd, { count: 8, radius: 0.05, tilt: 70 }, (it) => b.spike(it, it, 0.26, 0.012, { color: BRISTLE }));

  // ------------------------------------------------------------ face details
  const headSkin = b.surface([skull, faceBulk, ...domes]);
  const eye = eyeTexture();
  const folds = faceFolds();
  for (const s of [1, -1]) {
    const eyeHit = b.surface(skull).around(HC).at(s * 68, 6);
    if (eyeHit) b.decal(skull, eye, { at: eyeHit, size: [0.12, 0.077], mirror: s < 0 });
    const cheekHit = headSkin.around(HC).at(s * 50, -25);
    if (cheekHit) b.decal([skull, faceBulk], folds, { at: cheekHit, size: [0.36, 0.25], mirror: s < 0 });
    // temporal gland streak
    const gland = b.surface(skull).around(HC).at(s * 86, -6);
    if (gland) b.stick(sph(6, 4), "#4b3b36", gland, { scale: [0.018, 0.07, 0.04], embed: 0.3 });
  }

  // forehead bristles
  const crown = b.surface([skull, ...domes]);
  for (const hit of crown.scatter(18, { rng: rng(5), minDist: 0.1, filter: (h) => h.n.y > 0.4 && h.at.y > 3.2 }))
    b.stick(new THREE.ConeGeometry(0.014, 0.13, 4), BRISTLE, hit, { embed: 0.3 });

  // ------------------------------------------------------------ body surface detail
  const arcs = foldsArcs();
  const verts = foldsVertical();
  const mud = mudSplash();
  for (const s of [1, -1]) {
    b.decal([body, ...bulges], arcs, { at: [s * 1.05, 2.4, 0.85], dir: [s, 0, 0], size: [0.9, 0.68], mirror: s > 0 });
    b.decal([body, ...bulges], verts, { at: [s * 1.1, 2.3, -1.2], dir: [s, 0, 0], size: [0.7, 0.9], mirror: s > 0 });
    b.decal(body, mud, { at: [s * 0.92, 1.55, 0.1], dir: [s, 0, 0], size: [1.6, 0.67], mirror: s > 0 });
  }
  for (const hit of b.surface(body).scatter(40, { rng: rng(9), minDist: 0.3, filter: (h) => h.n.y > 0.5 }))
    b.stick(new THREE.ConeGeometry(0.012, 0.09, 4), BRISTLE, hit, { embed: 0.3 });

  return b.root;
}
```