import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  bezier,
  svg,
  paint,
  mix,
  noise,
  smoothstep,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant, low-poly: faceted barrel body, pillar legs with toenails, huge Africa-shaped ears with veins, curved ivory tusks, ringed trunk, wrinkle decals, bristle tail tuft and a rigged rest pose.",
};

type V3t = [number, number, number];

// ---------------------------------------------------------------- palette
const DARK = "#2e2925";
const NAIL = "#cfc2a6";
const PINK = "#a98b80";
const CREASE_COL = "#4a423d";
const BRISTLE_COL = "#34291f";

// ---------------------------------------------------------------- paints
const hide = paint((p, n) => {
  const big = noise(p, 0.9, 3);
  let c = mix("#6f6962", "#8e857a", big);
  const crease = Math.abs(noise(p, 0.16, 8) - 0.5);
  c = mix(c, "#463f3a", 0.75 * smoothstep(0.03, 0.01, crease));
  const crease2 = Math.abs(noise(p, 0.07, 11) - 0.5);
  c = mix(c, "#4c4540", 0.4 * smoothstep(0.025, 0.008, crease2));
  // dust on upward faces
  c = mix(c, "#b3a07e", 0.5 * smoothstep(0.2, 0.95, n.y) * smoothstep(0.35, 0.7, noise(p, 0.35, 5)));
  // mud near the feet
  c = mix(c, "#7c5d42", 0.75 * smoothstep(1.0, 0.25, p.y) * (0.6 + 0.4 * noise(p, 0.12, 2)));
  // darker belly / underside
  c = mix(c, "#4f4a46", 0.45 * smoothstep(0.0, -0.9, n.y));
  return c;
});

const trunkHide = paint((p, n, s) => {
  let c = hide.at(p, n);
  const ring = Math.sin(s[0] * Math.PI * 2 * 15);
  c = mix(c, "#4a423d", 0.65 * smoothstep(0.55, 0.9, ring));
  c = mix(c, "#b79a8f", 0.6 * smoothstep(0.82, 1.0, s[0]));
  c = mix(c, "#b79a8f", 0.25 * smoothstep(-0.2, -0.9, n.y));
  return c;
});

const earHide = paint((p, n) => {
  let c = hide.at(p, n);
  c = mix(c, "#a88f86", 0.45 * smoothstep(0.2, 0.9, noise(p, 0.3, 21)));
  const vein = Math.abs(noise(p, 0.22, 31) - 0.5);
  c = mix(c, "#6b524e", 0.5 * smoothstep(0.025, 0.008, vein));
  return c;
});

const tuskPaint = paint((p, _n, s) => {
  let c = mix("#e6dab4", "#f6efd8", noise(p, 0.2, 3));
  c = mix(c, "#9c7e56", 0.7 * smoothstep(0.3, 0.0, s[0]));
  c = mix(c, "#c9b98f", 0.45 * smoothstep(0.88, 1.0, s[0]));
  const streak = Math.abs(noise(p, 0.05, 4) - 0.5);
  c = mix(c, "#b9a77c", 0.35 * smoothstep(0.03, 0.01, streak));
  return c;
});

// ---------------------------------------------------------------- ear outline
function earOutline(): OutlinePoint[] {
  return [
    [0, 0.5],
    [0.35, 0.58],
    [0.8, 0.55],
    [1.3, 0.38],
    [1.52, -0.05],
    [1.42, -0.62],
    [1.1, -1.08],
    [0.78, -1.45, "sharp"],
    [0.5, -1.0],
    [0.25, -0.6],
    [0, -0.3],
  ];
}

export default function build() {
  const b = createBuilder({ name: "african_bush_elephant", paintSize: 2048 });

  // ------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 24 Q30 -6 58 24 Q30 42 2 24Z" fill="#54483f"/>
      <path d="M7 24 Q30 3 53 24 Q30 38 7 24Z" fill="#241a14"/>
      <ellipse cx="30" cy="23" rx="12" ry="10" fill="#6e3f17"/>
      <ellipse cx="30" cy="23" rx="8" ry="7" fill="#a56a24"/>
      <circle cx="30" cy="23" r="4.4" fill="#0a0605"/>
      <circle cx="25.5" cy="18.5" r="2.6" fill="#ffffff"/>
      <circle cx="34.5" cy="27" r="1.2" fill="#ffe9b8"/>
      <path d="M5 21 Q30 -1 55 21" stroke="#1d1511" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M12 14 L8 8 M20 10 L18 3 M30 9 L30 2 M40 10 L43 3 M48 14 L53 8" stroke="#1d1511" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const WRINKLE = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#463f3a" stroke-width="2.6" fill="none" stroke-linecap="round">
        <path d="M4 10 Q50 -2 96 10"/>
        <path d="M8 24 Q50 12 92 24"/>
        <path d="M4 38 Q50 26 96 38"/>
        <path d="M12 52 Q50 42 88 52"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const EARVEIN = svg(
    `<svg viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 42 Q20 30 40 34 Q70 30 84 50 Q72 80 40 82 Q14 70 0 58Z" fill="#c4a095" fill-opacity="0.85"/>
      <g stroke="#7b5753" stroke-width="2.8" fill="none" stroke-linecap="round">
        <path d="M0 50 Q30 48 80 52"/>
        <path d="M16 49 Q30 30 55 14"/>
        <path d="M30 48 Q40 66 52 94"/>
        <path d="M45 50 Q60 36 74 22"/>
        <path d="M44 50 Q56 66 66 84"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const BRISTLE = svg(
    `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 Q8 34 2 6 Q13 30 13 64Z" fill="#2f251d"/>
      <path d="M17 64 Q18 28 20 0 Q28 28 27 64Z" fill="#3a2e24"/>
      <path d="M30 64 Q34 36 44 10 Q42 40 39 64Z" fill="#2f251d"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 2.5, -1.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.6, -0.9],
      [0, 2.8, -0.2],
      [0, 2.95, 0.5],
      [0, 2.95, 1.0],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.95, 1.0],
      [0, 2.9, 1.5],
      [0, 2.8, 1.95],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.8, 1.95], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.15, 2.05], aim: [0, 2.0, 2.8], role: "jaw" });

  // ------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 2.15, -2.1], w: 1.25, h: 1.65 },
      { at: [0, 2.2, -1.2], w: 1.8, h: 1.9 },
      { at: [0, 2.18, 0.0], w: 1.95, h: 1.98 },
      { at: [0, 2.22, 1.0], w: 1.8, h: 1.95 },
      { at: [0, 2.2, 1.5], w: 1.4, h: 1.7 },
    ],
    { bone: [hips, spine, neck], color: hide, sides: 12, smooth: false },
  );
  const skin = b.surface(body);

  // spine ridge
  for (let i = 0; i < 8; i++) {
    const h = skin.ray([0, 6, -1.8 + i * 0.4], [0, -1, 0]);
    if (h) b.stick(new THREE.ConeGeometry(0.09, 0.14, 5), hide, h, { embed: 0.45, flat: true });
  }
  // hip bones
  for (const s of [1, -1]) {
    const h = skin.ray([s * 0.5, 6, -1.55], [0, -1, 0]);
    if (h) b.stick(new THREE.SphereGeometry(0.2, 7, 5), hide, h, { embed: 0.4, scale: [1, 0.6, 1], flat: true });
  }

  // body folds draped on the skin
  for (const s of [1, -1]) {
    const f1 = skin.drape(
      catmull([
        [s * 0.2, 3.05, 0.45],
        [s * 0.75, 2.85, 0.45],
        [s * 0.98, 2.35, 0.5],
        [s * 0.9, 1.75, 0.55],
      ]),
      { lift: 0.012 },
    );
    b.sweep(f1, 0.016, { color: CREASE_COL });
    const f2 = skin.drape(
      catmull([
        [s * 0.2, 3.0, -0.7],
        [s * 0.7, 2.9, -0.7],
        [s * 0.95, 2.4, -0.65],
        [s * 0.85, 1.8, -0.6],
      ]),
      { lift: 0.012 },
    );
    b.sweep(f2, 0.016, { color: CREASE_COL });
  }
  // flank wrinkle decals
  for (const s of [1, -1]) {
    for (const [z, y] of [
      [-1.3, 2.75],
      [-0.4, 2.6],
      [0.4, 2.7],
      [-0.1, 1.95],
    ]) {
      const h = skin.ray([s * 4, y, z], [-s, 0, 0]);
      if (h) b.decal(skin, WRINKLE, { at: h, size: [0.9, 0.55] });
    }
  }
  // sparse coarse hair on the back
  b.cards(
    skin.scatter(70, { rng: rng(11), minDist: 0.25, filter: (h) => h.n.y > 0.45 }),
    BRISTLE,
    { size: [0.05, 0.14], lean: 55, bend: 20, vary: 0.3, rng: rng(12), color: BRISTLE_COL },
  );

  // ------------------------------------------------------------ legs
  const makeLeg = (s: number, front: boolean) => {
    const S = s > 0 ? "L" : "R";
    const pts: V3t[] = front
      ? [
          [s * 0.62, 2.1, 1.15],
          [s * 0.6, 1.15, 1.1],
          [s * 0.6, 0.27, 1.2],
        ]
      : [
          [s * 0.64, 2.05, -1.35],
          [s * 0.6, 1.1, -1.1],
          [s * 0.6, 0.27, -1.3],
        ];
    const names = front ? [`shoulder${S}`, `elbow${S}`, `hand${S}`] : [`hip${S}`, `knee${S}`, `foot${S}`];
    const end = pts[2];
    const chain = b.chain(`leg${front ? "F" : "H"}${S}`, catmull(pts), {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [end[0], 0, end[2]],
    });
    const R0 = front ? 0.44 : 0.48;
    const legR = (t: number) => R0 - (R0 - 0.31) * t;
    const tube = b.sweep(chain, legR, { color: hide, sides: 10, smooth: false });

    // shoulder / thigh mass
    b.part(new THREE.SphereGeometry(1, 10, 7), hide, {
      bone: chain.joints[0],
      at: [s * 0.74, front ? 2.2 : 2.15, pts[0][2]],
      scale: front ? [0.42, 0.72, 0.58] : [0.44, 0.72, 0.62],
      flat: true,
    });

    // ankle folds
    b.along(
      chain,
      3,
      (at) =>
        b.part(new THREE.TorusGeometry(legR(at.t) * 1.04, 0.02, 4, 10), hide, {
          at: at.at,
          bone: at.bone,
          dir: at.tangent,
          axis: "z",
          flat: true,
        }),
      { from: 0.5, to: 0.95 },
    );

    // foot
    const foot = chain.joints[2];
    const fx = end[0];
    const fz = end[2] + 0.03;
    b.part(new THREE.CylinderGeometry(0.33, 0.36, 0.32, 10), hide, { bone: foot, at: [fx, 0.16, fz], flat: true });
    const angles = front ? [-48, -16, 16, 48] : [-34, 0, 34];
    for (const a of angles) {
      const r = a * (Math.PI / 180);
      b.part(new THREE.BoxGeometry(0.1, 0.14, 0.09), NAIL, {
        bone: foot,
        at: [fx + Math.sin(r) * 0.35, 0.1, fz + Math.cos(r) * 0.35],
        dir: [Math.sin(r), 0, Math.cos(r)],
        axis: "z",
      });
    }

    // wrinkles / knee
    const yy = front ? 0.75 : 1.08;
    const hit = b.surface(tube).ray([end[0], yy, 3], [0, 0, -1]);
    if (hit) {
      b.decal(tube, WRINKLE, { at: hit, size: [0.42, 0.3] });
      if (!front) b.stick(new THREE.SphereGeometry(0.2, 8, 6), hide, hit, { embed: 0.55, scale: [1.1, 0.55, 1.1], flat: true });
    }
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  // ------------------------------------------------------------ head
  const HEAD_C: V3t = [0, 2.6, 2.35];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), hide, {
    bone: head,
    at: HEAD_C,
    scale: [0.52, 0.68, 0.62],
    flat: true,
  });
  const skullSkin = b.surface(skull);

  // forehead dome, trunk root and cheeks
  b.part(new THREE.SphereGeometry(1, 10, 7), hide, { bone: head, at: [0, 2.95, 2.4], scale: [0.4, 0.38, 0.42], flat: true });
  b.part(new THREE.SphereGeometry(1, 10, 7), hide, { bone: head, at: [0, 2.5, 2.8], scale: [0.36, 0.45, 0.4], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, { bone: head, at: [s * 0.38, 2.25, 2.55], scale: [0.28, 0.28, 0.35], flat: true });
  }

  // eyes, brows, temporal glands
  for (const s of [1, -1]) {
    const eyeHit = skullSkin.around(HEAD_C).at(s * 72, -4);
    if (eyeHit) b.decal(skullSkin, EYE, { at: eyeHit, size: [0.13, 0.09], mirror: s > 0 });
    const brow = skullSkin.around(HEAD_C).at(s * 62, 26);
    if (brow) b.stick(new THREE.SphereGeometry(0.1, 8, 5), hide, brow, { embed: 0.35, scale: [1.1, 0.5, 1.5], flat: true });
    const gland = skullSkin.around(HEAD_C).at(s * 100, -2);
    if (gland) b.stick(new THREE.SphereGeometry(0.04, 6, 4), "#2e2824", gland, { embed: 0.5, scale: [1, 1.6, 1] });
  }
  const forehead = skullSkin.around(HEAD_C).at(0, 50);
  if (forehead) b.decal(skullSkin, WRINKLE, { at: forehead, size: [0.5, 0.3] });
  b.cards(
    skullSkin.scatter(24, { rng: rng(5), minDist: 0.12, filter: (h) => h.n.y > 0.55 }),
    BRISTLE,
    { size: [0.06, 0.16], lean: 40, bend: 20, vary: 0.3, rng: rng(6), color: BRISTLE_COL },
  );

  // lower jaw
  b.frustumBox([0, 2.02, 2.12], [0, 1.96, 2.8], [0.62, 0.3], [0.36, 0.2], { bone: jaw, color: hide });
  b.part(new THREE.SphereGeometry(1, 8, 6), PINK, { bone: jaw, at: [0, 1.98, 2.82], scale: [0.17, 0.09, 0.12], flat: true });

  // ------------------------------------------------------------ trunk
  const trunkPath = catmull([
    [0, 2.45, 2.65],
    [0, 1.85, 3.05],
    [0, 1.2, 3.25],
    [0, 0.65, 3.2],
    [0, 0.35, 3.4],
    [0, 0.4, 3.7],
  ]);
  const trunkR = (t: number) => 0.3 - 0.2 * Math.pow(t, 0.85);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 6, role: "tentacle" });
  b.sweep(trunk, trunkR, { color: trunkHide, sides: 10, smooth: false });
  b.along(
    trunk,
    12,
    (at) =>
      b.part(new THREE.TorusGeometry(trunkR(at.t) * 1.06, 0.022, 4, 10), hide, {
        at: at.at,
        bone: at.bone,
        dir: at.tangent,
        axis: "z",
        flat: true,
      }),
    { from: 0.08, to: 0.95 },
  );
  const tipJ = trunk.joints[trunk.joints.length - 1];
  const E = trunkPath.at(1);
  const T = trunkPath.tangentAt(1);
  b.spike(offset(E, [0, 1, 0], 0.04), [0, 0.35, 1], 0.16, 0.05, { color: PINK, bone: tipJ });
  b.spike(offset(E, [0, -1, 0], 0.04), [0, -0.1, 1], 0.09, 0.04, { color: PINK, bone: tipJ });
  for (const s of [1, -1]) {
    const P = offset(E, T, 0.105).add(new THREE.Vector3(s * 0.03, 0, 0));
    b.part(new THREE.CircleGeometry(0.035, 6), DARK, { bone: tipJ, at: P, dir: T, axis: "z" });
  }

  // ------------------------------------------------------------ tusks
  for (const s of [1, -1]) {
    const tuskPath = bezier(
      [s * 0.3, 2.28, 2.6],
      [s * 0.4, 1.95, 3.0],
      [s * 0.45, 1.6, 3.5],
      [s * 0.35, 1.75, 4.15],
    );
    b.sweep(tuskPath, [0.085, 0.012], {
      bone: head,
      color: tuskPaint,
      caps: { start: "flat", end: "point" },
      sides: 8,
    });
    b.part(new THREE.CylinderGeometry(0.095, 0.105, 0.11, 8), "#8d786a", {
      bone: head,
      at: tuskPath.at(0.14),
      dir: tuskPath.tangentAt(0.14),
    });
  }

  // ------------------------------------------------------------ ears
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root = new THREE.Vector3(s * 0.42, 2.95, 2.12);
    const ex = new THREE.Vector3(s * 0.68, 0, -0.73).normalize();
    const earJ = b.joint(`ear${S}`, { parent: head, at: root, dir: ex, role: "hinge" });
    const ear = b.extrude(earOutline(), {
      at: root,
      x: ex,
      y: [0, 1, 0],
      thickness: [0.03, 0.07],
      bevel: 0.01,
      smoothing: 1,
      color: earHide,
      bone: earJ,
    });
    void ear;
    const centre = root.clone().addScaledVector(ex, 0.75).add(new THREE.Vector3(0, -0.35, 0));
    b.decal(ear, EARVEIN, {
      at: centre,
      dir: [s * 0.73, 0, 0.68],
      size: [0.9, 1.0],
      mirror: s < 0,
      segments: 12,
    });
  }

  // ------------------------------------------------------------ tail
  const rump = skin.ray([0, 2.7, -6], [0, 0, 1]);
  if (rump) {
    const R = rump.at;
    const P = (dy: number, dz: number): V3t => [R.x, R.y + dy, R.z + dz];
    const tailPts = [P(-0.1, -0.25), P(-0.55, -0.4), P(-1.0, -0.42), P(-1.45, -0.38)];
    b.sprout("tail", rump, catmull(tailPts), [0.1, 0.035], { count: 4, role: "tail", color: hide });
    const tipPt = new THREE.Vector3(...tailPts[3]);
    b.part(new THREE.SphereGeometry(0.06, 6, 5), DARK, { at: tipPt, scale: [1, 1.2, 1] });
    const tuft = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return frame(tipPt, [Math.cos(a) * 0.6, -1, Math.sin(a) * 0.6]);
    });
    b.cards(tuft, BRISTLE, {
      size: [0.07, 0.3],
      lean: 10,
      bend: 15,
      cross: true,
      vary: 0.3,
      spin: 15,
      rng: rng(21),
      color: BRISTLE_COL,
    });
  }

  return b.root;
}
