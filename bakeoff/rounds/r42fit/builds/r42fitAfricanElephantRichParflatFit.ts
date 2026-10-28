import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame, catmull } from "../../../../src/index";

export const meta = {
  "name": "African Bush Elephant",
  "description": "A stylized low-poly adult African bush elephant in a neutral rest pose, with big fan ears, long trunk, curved tusks, pillar legs and a rigged spine, tail and jaw."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#7d7a78",
  skinDark: "#5f5c5b",
  skinLight: "#9a958f",
  dust: "#a68f72",
  earInner: "#a88b85",
  earVein: "#6e5551",
  ivory: "#efe4c8",
  ivoryShade: "#cdbf9d",
  nail: "#d8cdb4",
  eye: "#1b1412",
  eyeShine: "#ffffff",
  mouth: "#b46a64",
  tuft: "#2f2a28",
};
const M = {
  headBase: [0, 2.45, 2.3] as [number, number, number],
  faceFront: [0, 2.3, 3.55] as [number, number, number],
  trunkRoot: [0, 1.95, 3.55] as [number, number, number],
  earRootL: [0.7, 2.75, 2.05] as [number, number, number],
  earRootR: [-0.7, 2.75, 2.05] as [number, number, number],
  tuskRootL: [0.38, 1.95, 3.4] as [number, number, number],
  tuskRootR: [-0.38, 1.95, 3.4] as [number, number, number],
  hipFL: [0.8, 1.6, 1.7] as [number, number, number],
  hipFR: [-0.8, 1.6, 1.7] as [number, number, number],
  hipBL: [0.8, 1.7, -1.7] as [number, number, number],
  hipBR: [-0.8, 1.7, -1.7] as [number, number, number],
  tailRoot: [0, 2.4, -3.05] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // body
  (() => {
function buildBody({ b, J, P }: any) {
  const R = rng(5);
  const bones = [J.hips, J.spine1, J.spine2, J.neck];

  const st = [
    { at: [0, 2.2, -2.85], w: 1.4, h: 1.4 },
    { at: [0, 2.25, -2.3], w: 2.0, h: 1.7 },
    { at: [0, 2.25, -1.2], w: 2.4, h: 1.75 },
    { at: [0, 2.25, 0.0], w: 2.5, h: 1.75 },
    { at: [0, 2.3, 1.0], w: 2.4, h: 1.7 },
    { at: [0, 2.4, 1.7], w: 1.7, h: 1.45 },
    { at: [0, 2.45, 2.05], w: 1.3, h: 1.3 },
  ];
  b.loft(st, { bone: bones, color: P.skin, sides: 8, caps: "flat" });

  b.loft(
    [
      { at: [0, 1.6, -2.2], w: 1.6, h: 0.4 },
      { at: [0, 1.6, -1.2], w: 1.9, h: 0.4 },
      { at: [0, 1.6, 0.0], w: 2.0, h: 0.4 },
      { at: [0, 1.6, 1.0], w: 1.9, h: 0.4 },
    ],
    { bone: bones, color: P.skinLight, sides: 8, caps: "flat" },
  );

  b.loft(
    [
      { at: [0, 3.05, -2.0], w: 0.9, h: 0.2 },
      { at: [0, 3.05, -0.6], w: 1.2, h: 0.2 },
      { at: [0, 3.05, 0.9], w: 1.2, h: 0.2 },
      { at: [0, 3.0, 1.7], w: 0.9, h: 0.2 },
    ],
    { bone: bones, color: P.dust, sides: 6, caps: "flat" },
  );

  for (const s of [1, -1]) {
    const sp = (x: number, y: number, z: number, r: number, bone: any, c: string) =>
      b.part(new THREE.IcosahedronGeometry(r, 1), c, { bone, at: [x, y, z], scale: [0.8, 1.1, 1] });
    sp(s * 0.95, 2.1, 1.7, 0.4, J.spine2, P.skin);
    sp(s * 0.95, 2.2, -1.7, 0.4, J.hips, P.skin);
    sp(s * 0.9, 1.75, 1.7, 0.4, J.spine2, P.skinLight);
    sp(s * 0.9, 1.75, -1.7, 0.4, J.hips, P.skinLight);

    for (let i = 0; i < 6; i++) {
      const z = -2 + i * 0.7;
      b.part(new THREE.BoxGeometry(0.06, 0.9 + R() * 0.3, 0.08), P.skinDark, {
        bone: z > 0.9 ? J.spine2 : z > -0.4 ? J.spine1 : J.hips,
        at: [s * 1.22, 2.2, z],
        rotation: [0, 0, s * 5],
      });
    }
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.IcosahedronGeometry(0.22 + R() * 0.1, 0), P.dust, {
        bone: J.spine1,
        at: [s * (1.05 + R() * 0.05), 1.7 + R() * 0.5, -1 + i * 1.1],
        scale: [0.35, 1, 1],
      });
    }
  }

  for (let i = 0; i < 3; i++) {
    b.part(new THREE.TorusGeometry(0.6 - i * 0.03, 0.04, 4, 8), P.skinDark, {
      bone: J.neck,
      at: [0, 2.45, 1.5 + i * 0.15],
    });
  }
}
    return buildBody;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const R = rng(11);
  const legs = [
    { k: "FL", s: 1, front: true },
    { k: "FR", s: -1, front: true },
    { k: "BL", s: 1, front: false },
    { k: "BR", s: -1, front: false },
  ];
  for (const L of legs) {
    const hip = J["hip" + L.k], knee = J["knee" + L.k], foot = J["foot" + L.k];
    const x = L.s * 0.75;
    const z = L.front ? 1.7 : -1.7;
    const rTop = L.front ? 0.38 : 0.36;
    const rMid = L.front ? 0.34 : 0.32;
    const rLow = L.front ? 0.32 : 0.3;
    const hipP = M["hip" + L.k];
    const kneeY = L.front ? 0.85 : 0.9;
    const top: [number, number, number] = [x, hipP[1] + 0.05, z];
    const kn: [number, number, number] = [x, kneeY, z];
    const ank: [number, number, number] = [x, 0.2, z];
    // upper leg
    b.sweep([top, kn], [rTop, rMid], { bone: hip, color: P.skin, sides: 8, caps: "flat" });
    // lower leg lighter
    b.sweep([kn, ank], [rMid, rLow], { bone: knee, color: P.skinLight, sides: 8, caps: "flat" });
    // knee bulge
    b.part(new THREE.SphereGeometry(rMid * 1.08, 8, 6), P.skin, { bone: knee, at: kn, scale: [1, 0.8, 1] });
    // wrinkle rings
    const ring = (y: number, r: number, bone: any, h = 0.05) =>
      b.part(new THREE.CylinderGeometry(r, r, h, 8), P.skinDark, { bone, at: [x, y, z] });
    ring(kneeY + 0.12, rMid + 0.03, knee);
    ring(kneeY - 0.1, rMid + 0.025, knee);
    ring(kneeY - 0.3, rMid + 0.01, knee, 0.04);
    ring(0.42, rLow + 0.02, foot);
    ring(0.34, rLow + 0.015, foot, 0.04);
    ring(1.15, rTop - 0.04, hip, 0.05);
    // dust at the feet
    b.part(new THREE.CylinderGeometry(rLow + 0.03, rLow + 0.07, 0.14, 8), P.dust, { bone: foot, at: [x, 0.2, z] });
    // foot pad
    const fr = rLow + 0.08;
    b.part(new THREE.CylinderGeometry(fr, fr + 0.03, 0.14, 8), P.skinDark, { bone: foot, at: [x, 0.07, z] });
    // nails on front rim
    const n = L.front ? 5 : 4;
    for (let i = 0; i < n; i++) {
      const a = (-0.5 + (n === 1 ? 0 : i / (n - 1))) * 1.7 + (R() - 0.5) * 0.05;
      const nx = x + Math.sin(a) * (fr + 0.01);
      const nz = z + Math.cos(a) * (fr + 0.01);
      b.part(new THREE.ConeGeometry(0.06, 0.12, 4), P.nail, {
        bone: foot,
        at: [nx, 0.08, nz],
        dir: [Math.sin(a), 0.1, Math.cos(a)],
        scale: [1, 1, 0.6],
      });
    }
    // muscle bulge at thigh
    b.part(new THREE.SphereGeometry(rTop * 0.95, 8, 6), P.skin, { bone: hip, at: [x, hipP[1] - 0.1, z], scale: [1, 1, 1] });
  }
}
    return buildLegs;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: any) {
  const head = J.head, jaw = J.jaw;
  const R = rng(5);
  const sph = (rx: number, ry: number, rz: number, color: string, at: number[], bone: any, seg = 8) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, { bone, at, scale: [rx, ry, rz], flat: true });
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true });

  // skull
  sph(0.72, 0.7, 0.85, P.skin, [0, 2.65, 2.9], head);
  // domed forehead
  sph(0.6, 0.4, 0.6, P.skin, [0, 3.0, 3.0], head);
  // dust cap
  sph(0.5, 0.16, 0.55, P.dust, [0, 3.22, 3.0], head, 6);
  // lower face taper
  b.frustumBox([0, 2.35, 3.0], [0, 2.1, 3.55], [1.0, 0.9], [0.6, 0.6], { bone: head, color: P.skin });
  // cheeks
  for (const s of [1, -1]) {
    sph(0.22, 0.4, 0.45, P.skinLight, [s * 0.58, 2.3, 3.0], head, 6);
    // temple bulges and glands
    sph(0.18, 0.2, 0.22, P.skin, [s * 0.66, 2.95, 3.1], head, 6);
    sph(0.05, 0.1, 0.1, P.skinDark, [s * 0.8, 2.9, 3.1], head, 5);
    // brow ridge
    box(0.34, 0.09, 0.3, P.skinDark, [s * 0.5, 3.0, 3.45], head, [-15, s * 10, 0]);
    // eye
    sph(0.07, 0.07, 0.07, P.eye, [s * 0.66, 2.85, 3.38], head, 6);
    sph(0.02, 0.02, 0.02, P.eyeShine, [s * 0.7, 2.88, 3.43], head, 4);
    // upper lid
    box(0.2, 0.04, 0.16, P.skinDark, [s * 0.64, 2.94, 3.38], head, [0, s * 20, s * 10]);
    // cheek wrinkles
    for (let i = 0; i < 3; i++)
      box(0.04, 0.03, 0.35 - i * 0.06, P.skinDark, [s * (0.78 - i * 0.02), 2.4 - i * 0.12, 3.0], head, [0, 0, s * 8]);
  }
  // forehead wrinkles
  for (let i = 0; i < 3; i++)
    box(0.7 - i * 0.12, 0.03, 0.05, P.skinDark, [0, 3.2 - i * 0.12, 3.4 + i * 0.0], head, [-30, 0, 0]);
  // dust patches
  for (let i = 0; i < 4; i++)
    sph(0.12, 0.04, 0.12, P.dust, [(R() - 0.5) * 0.9, 3.15 + R() * 0.1, 2.5 + R() * 0.5], head, 5);

  // trunk root collar
  b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.12, 8), P.skinDark, { bone: head, at: [0, 2.0, 3.55], rotation: [-75, 0, 0], flat: true });

  // jaw
  b.frustumBox([0, 1.9, 3.0], [0, 1.85, 3.5], [0.8, 0.22], [0.5, 0.2], { bone: jaw, color: P.skin });
  box(0.6, 0.06, 0.45, P.mouth, [0, 2.02, 3.3], jaw);
  sph(0.22, 0.12, 0.15, P.skinLight, [0, 1.85, 3.55], jaw, 6);
  for (const s of [1, -1]) box(0.08, 0.1, 0.4, P.skinDark, [s * 0.38, 1.98, 3.3], jaw);

  // tusks
  for (const s of [1, -1]) {
    const base = [s * 0.38, 1.95, 3.4];
    const path = [base, [s * 0.5, 1.78, 3.6], [s * 0.6, 1.66, 3.85], [s * 0.6, 1.64, 4.05], [s * 0.55, 1.72, 4.2]];
    b.sweep(path, [0.08, 0.012], {
      bone: head, color: P.ivory, sides: 7, caps: { start: "flat", end: "point" },
      sectors: [[110, 250, P.ivoryShade, 0.3, 1]],
    });
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.1, 8), P.skinDark, { bone: head, at: [s * 0.4, 1.9, 3.45], rotation: [-40, 0, s * 12], flat: true });
  }
}
    return buildHead;
  })(),
  // trunk
  (() => {
function buildTrunk({ b, J, P, M }: any) {
  const r = rng(11);
  const path = catmull([
    [0, 1.95, 3.55],
    [0, 1.5, 3.8],
    [0, 0.95, 3.9],
    [0, 0.5, 4.0],
    [0, 0.36, 4.12],
  ]);
  const bones = [J.trunk1, J.trunk2, J.trunk3, J.trunk4];
  const rad = (t: number) => 0.27 - 0.17 * t;
  const tube = b.sweep(path, (t: number) => rad(t), {
    bone: bones,
    color: P.skin,
    section: { ngon: 8 },
    caps: "round",
    sectors: [[125, 235, P.skinLight]],
  });

  // wrinkle rings
  const N = 17;
  for (let i = 0; i < N; i++) {
    const t = 0.05 + (0.88 * i) / (N - 1);
    const pt = path.at(t);
    const tg = path.tangentAt(t);
    const rr = rad(t) * 1.04;
    const col = i % 3 === 0 ? P.skinDark : P.skinDark;
    b.part(new THREE.TorusGeometry(rr, 0.011 + 0.004 * (1 - t), 4, 8), col, {
      at: pt,
      dir: tg,
      axis: "z",
      bone: bones[Math.min(3, Math.floor(t * 4))],
    });
  }
  // a few lighter fold ridges between
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.14 + r() * 0.03;
    const s = tube.at(t, 90);
    b.stick(new THREE.SphereGeometry(0.035, 5, 4), P.skinLight, s, { embed: 0.5 });
  }

  // tip
  const tipP = path.at(1);
  const tg = path.tangentAt(1);
  const tipEnd: [number, number, number] = [tipP.x, tipP.y, tipP.z];
  // mouth coloured lip pad on the end
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.04, 8), P.mouth, {
    at: [0, tipEnd[1] - 0.075, tipEnd[2] + 0.015],
    dir: tg,
    bone: J.trunk4,
  });
  // finger lips: top (front) and bottom (back)
  b.spike([0, tipEnd[1] - 0.04, tipEnd[2] + 0.07], [0.0, -0.35, 0.9], 0.13, 0.04, {
    color: P.skin,
    bone: J.trunk4,
  });
  b.spike([0, tipEnd[1] - 0.05, tipEnd[2] - 0.05], [0, -0.9, -0.1], 0.1, 0.035, {
    color: P.skinDark,
    bone: J.trunk4,
  });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.eye, {
      at: [s * 0.04, tipEnd[1] - 0.1, tipEnd[2] + 0.04],
      bone: J.trunk4,
    });
  }
}
    return buildTrunk;
  })(),
  // ears
  (() => {
function buildEars({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const SU = 0.5, SV = 0.8;
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.earL : J.earR;
    const root = M[s > 0 ? "earRootL" : "earRootR"];
    const ox = root[0], oy = root[1], oz = root[2];
    const outline: any[] = [
      [0, 0.15, "sharp"],
      [0.1, 0.35],
      [0.55, 0.45],
      [1.05, 0.35],
      [1.5, 0.1],
      [1.62, -0.35],
      [1.4, -0.95],
      [1.0, -1.45],
      [0.6, -1.78],
      [0.4, -1.9],
      [0.28, -1.6],
      [0.1, -1.0],
      [0, -0.4],
    ];
    const at: [number, number, number] = [ox + s * 0.1, oy, oz];
    const X: [number, number, number] = [0, 0, -1];
    const Y: [number, number, number] = [s * 0.25, 1, 0];
    const mk = (col: string, th: number, shift: number, scale = 1) => {
      const o = outline.map((p) => (p.length === 3 ? [p[0] * scale * SU, p[1] * scale * SV, "sharp"] : [p[0] * scale * SU, p[1] * scale * SV]));
      return b.extrude(o, {
        at: [at[0] + s * shift, at[1], at[2]],
        x: X,
        y: Y,
        thickness: th,
        bevel: 0.01,
        smoothing: 1,
        color: col,
        bone,
      });
    };
    mk(P.skin, 0.07, 0);
    mk(P.earInner, 0.02, s * 0.04, 0.9);
    b.capsule([ox, oy + 0.05, oz], [ox + s * 0.3, oy - 0.05, oz - 0.3], 0.14, P.skinDark, { bone });
    const rim = [
      [0.05, 0.2],
      [0.5, 0.45],
      [1.05, 0.36],
      [1.5, 0.11],
      [1.62, -0.35],
    ];
    const pts = rim.map(([u, v]) => [at[0] + s * 0.02, at[1] + v * SV, at[2] - u * SU] as [number, number, number]);
    b.sweep(pts, [0.06, 0.04], { color: P.skinDark, bone, sides: 6 });
    const fx = at[0] + s * 0.09;
    const origin: [number, number, number] = [fx, oy + 0.05, oz - 0.05];
    const tips = [
      [0.55, 0.38], [1.0, 0.3], [1.4, 0.05], [1.5, -0.4], [1.25, -0.95], [0.9, -1.4], [0.5, -1.7], [0.3, -1.1],
    ];
    for (const [u0, v0] of tips) {
      const u = u0 * SU, v = v0 * SV;
      const tip: [number, number, number] = [fx, oy + v, oz - u];
      const m: [number, number, number] = [fx, oy + v * 0.5 + 0.02, oz - u * 0.5 + (R() - 0.5) * 0.03];
      b.sweep([origin, m, tip], [0.025, 0.008], { color: P.earVein, bone, sides: 5 });
      const bp: [number, number, number] = [fx, oy + v * 0.75, oz - u * 0.75];
      const bt: [number, number, number] = [fx, oy + v * 0.75 - 0.14, oz - u * 0.75 - 0.1];
      b.rod(bp, bt, [0.012, 0.005], P.earVein, { bone, sides: 5 });
    }
    for (let i = 0; i < 5; i++) {
      const u = (0.4 + R() * 0.9) * SU, v = (-0.2 - R() * 1.0) * SV;
      b.part(new THREE.CylinderGeometry(0.08 + R() * 0.05, 0.1, 0.02, 6), P.dust, {
        bone,
        at: [at[0] - s * 0.045, oy + v, oz - u],
        dir: [s, 0, 0],
      });
    }
    b.part(new THREE.ConeGeometry(0.08, 0.2, 6), P.skinDark, {
      bone,
      at: [at[0], oy - 1.4, oz - 0.25],
      dir: [0, -1, -0.15],
    });
  }
}
    return buildEars;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const root = M.tailRoot;
  const pts: number[][] = [
    root,
    [0, 2.15, -3.2],
    [0, 1.7, -3.36],
    [0, 1.3, -3.4],
  ];
  const path = catmull(pts);
  const tail = b.sweep(path, [0.09, 0.03], {
    color: P.skin,
    bone: [J.tail1, J.tail2, J.tail3],
    sides: 8,
    caps: "round",
  });

  // ring marks along the tail
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.14;
    const p = tail.at(t);
    const rad = 0.09 + (0.03 - 0.09) * t + 0.012;
    b.stick(new THREE.CylinderGeometry(rad, rad, 0.018, 8), P.skinDark, p, { embed: 0.5 });
  }

  // tuft
  const tip = path.at(1);
  const tuftBone = J.tail3;
  b.part(new THREE.SphereGeometry(0.04, 6, 4), P.tuft, { bone: tuftBone, at: [0, tip.y - 0.02, tip.z] });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const spread = 0.16 + r() * 0.06;
    const len = 0.28 + r() * 0.1;
    const base = [0, tip.y, tip.z];
    const dir = [Math.sin(a) * spread * 2, -1, Math.cos(a) * spread * 2];
    b.spike(base, dir, len, 0.022, { color: P.tuft, bone: tuftBone, sides: 5 });
  }

  // rump details: anal fold, wrinkles, dust (on the body, riding hips)
  b.part(new THREE.BoxGeometry(0.22, 0.34, 0.06), P.skinDark, {
    bone: J.hips,
    at: [0, 2.12, -3.04],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.34, 0.06), P.skinDark, {
      bone: J.hips,
      at: [s * 0.2, 2.1, -3.03],
      rotation: [0, 0, s * 12],
    });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.skinDark, {
      bone: J.hips,
      at: [s * 0.2, 2.0, -3.0],
      scale: [0.4, 1, 0.8],
    });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.18, 2.48, -3.0],
      scale: [1.2, 0.4, 0.9],
    });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.1, 2.52, -3.05],
      scale: [1.2, 0.4, 0.8],
    });
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bushElephant" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,2.2,-1.6], dir: [0,0,1], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,2.3,-0.4], dir: [0,0,1], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["spine1"], at: [0,2.5,0.9], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["spine2"], at: [0,2.55,1.8], dir: [0,0,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,2.45,2.3], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.85,3], dir: [0,0,1], role: "jaw" });
  J["trunk1"] = b.joint("trunk1", { parent: J["head"], at: [0,1.95,3.55], dir: [0,-0.3,1], role: "tentacle" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0,1.5,3.8], dir: [0,-1,0.2], role: "tentacle" });
  J["trunk3"] = b.joint("trunk3", { parent: J["trunk2"], at: [0,0.95,3.9], dir: [0,-1,0.2], role: "tentacle" });
  J["trunk4"] = b.joint("trunk4", { parent: J["trunk3"], at: [0,0.5,4], dir: [0,-1,0.3], role: "tentacle" });
  J["earL"] = b.joint("earL", { parent: J["head"], at: [0.7,2.75,2.05], dir: [1,0,-0.2], role: "hinge" });
  J["earR"] = b.joint("earR", { parent: J["head"], at: [-0.7,2.75,2.05], dir: [-1,0,-0.2], role: "hinge" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,2.4,-3.05], dir: [0,-0.5,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.9,-3.3], dir: [0,-1,-0.2], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.3,-3.4], dir: [0,-1,0], role: "tail" });
  J["hipFL"] = b.joint("hipFL", { parent: J["spine2"], at: [0.8,1.6,1.7], dir: [0,-1,0], role: "leg" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [0.8,0.85,1.75], dir: [0,-1,0], role: "leg" });
  J["footFL"] = b.joint("footFL", { parent: J["kneeFL"], at: [0.8,0.15,1.8], dir: [0,0,1], role: "leg" });
  J["hipFR"] = b.joint("hipFR", { parent: J["spine2"], at: [-0.8,1.6,1.7], dir: [0,-1,0], role: "leg" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-0.8,0.85,1.75], dir: [0,-1,0], role: "leg" });
  J["footFR"] = b.joint("footFR", { parent: J["kneeFR"], at: [-0.8,0.15,1.8], dir: [0,0,1], role: "leg" });
  J["hipBL"] = b.joint("hipBL", { parent: J["hips"], at: [0.8,1.7,-1.7], dir: [0,-1,0], role: "leg" });
  J["kneeBL"] = b.joint("kneeBL", { parent: J["hipBL"], at: [0.8,0.9,-1.6], dir: [0,-1,0], role: "leg" });
  J["footBL"] = b.joint("footBL", { parent: J["kneeBL"], at: [0.8,0.15,-1.7], dir: [0,0,1], role: "leg" });
  J["hipBR"] = b.joint("hipBR", { parent: J["hips"], at: [-0.8,1.7,-1.7], dir: [0,-1,0], role: "leg" });
  J["kneeBR"] = b.joint("kneeBR", { parent: J["hipBR"], at: [-0.8,0.9,-1.6], dir: [0,-1,0], role: "leg" });
  J["footBR"] = b.joint("footBR", { parent: J["kneeBR"], at: [-0.8,0.15,-1.7], dir: [0,0,1], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
