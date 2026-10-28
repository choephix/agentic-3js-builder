import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, bezier } from "../../../../src/index";
import { glow as glowKit } from "../../../../kits/glow";
const glow = glowKit;

export const meta = {
  "name": "Solar Phoenix",
  "description": "A Genshin-style phoenix with flame plumage, wings fully spread, perched on a small gilded rock-free stand of its own talons, glowing in layered gold, orange and crimson."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  crimson: "#c4261e",
  red: "#e8452a",
  orange: "#ff8a25",
  amber: "#ffb62e",
  gold: "#ffd95a",
  paleGold: "#fff0a8",
  cream: "#fff3d0",
  ink: "#2a1420",
  beak: "#f0b030",
  beakDark: "#b8741c",
  talon: "#5a3a24",
  trimGold: "#e6b43a",
  eyeIris: "#ff7a18",
  white: "#ffffff",
  ember: "#ff5a1a",
  flameCore: "#fff6c8",
};
const M = {
  hip: [0, 1.05, -0.2] as [number, number, number],
  chest: [0, 1.2, 0.35] as [number, number, number],
  neckBase: [0, 1.45, 0.65] as [number, number, number],
  headCentre: [0, 1.95, 1.05] as [number, number, number],
  shoulderL: [0.32, 1.45, 0.2] as [number, number, number],
  shoulderR: [-0.32, 1.45, 0.2] as [number, number, number],
  tailRoot: [0, 1.1, -0.75] as [number, number, number],
  footL: [0.3, 0, 0.1] as [number, number, number],
  footR: [-0.3, 0, 0.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  // Body loft: tail-side hip -> chest -> neck -> head base
  const stations = [
    { at: [0, 1.05, -0.75], w: 0.5, h: 0.5 },
    { at: [0, 1.05, -0.3], w: 1.1, h: 0.95 },
    { at: [0, 1.2, 0.3], w: 1.2, h: 1.05 },
    { at: [0, 1.4, 0.62], w: 0.8, h: 0.75 },
    { at: [0, 1.65, 0.8], w: 0.42, h: 0.42 },
    { at: [0, 1.88, 0.98], w: 0.34, h: 0.34 },
  ];
  const body = b.loft(stations as any, {
    bone: [J.body, J.chest, J.neck1, J.neck2],
    color: P.orange,
    sides: 10,
  } as any);
  // crimson back strip
  const back = b.loft(
    stations.map((s) => ({ at: [0, s.at[1] + s.h * 0.36, s.at[2]], w: s.w * 0.55, h: s.h * 0.35 })) as any,
    { bone: [J.body, J.chest, J.neck1, J.neck2], color: P.crimson, sides: 6 } as any,
  );
  // cream belly / chest
  const belly = b.loft(
    [
      { at: [0, 0.8, -0.35], w: 0.7, h: 0.4 },
      { at: [0, 0.92, 0.15], w: 0.85, h: 0.45 },
      { at: [0, 1.15, 0.55], w: 0.7, h: 0.45 },
      { at: [0, 1.5, 0.78], w: 0.3, h: 0.25 },
    ] as any,
    { bone: [J.body, J.chest, J.neck1], color: P.cream, sides: 8 } as any,
  );
  // chest feather rows
  const rows = [
    { y: 1.0, z: 0.55, n: 5, w: 0.5 },
    { y: 1.18, z: 0.72, n: 5, w: 0.42 },
    { y: 1.36, z: 0.82, n: 4, w: 0.32 },
    { y: 1.54, z: 0.9, n: 3, w: 0.2 },
  ];
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const x = (i - (r.n - 1) / 2) * (r.w / Math.max(1, r.n - 1));
      const col = (i + ri) % 2 ? P.gold : P.paleGold;
      b.part(new THREE.ConeGeometry(0.075, 0.2, 4), col, {
        bone: ri < 2 ? J.chest : J.neck1,
        at: [x, r.y, r.z],
        dir: [x * 0.6, -0.8, 0.6],
        flat: true,
      } as any);
    }
  });
  // belly side trim feathers
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.ConeGeometry(0.08, 0.26, 4), i % 2 ? P.amber : P.red, {
        bone: J.body,
        at: [s * 0.52, 0.9 + (R() - 0.5) * 0.05, -0.55 + i * 0.22],
        dir: [s * 0.5, -1, -0.4],
        flat: true,
      } as any);
    }
  // collar ruff
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const px = Math.sin(a) * 0.36;
    const pz = 0.66 + Math.cos(a) * 0.3 * 0.9;
    b.part(new THREE.ConeGeometry(0.07, 0.3, 4), i % 2 ? P.amber : P.orange, {
      bone: J.neck1,
      at: [px, 1.52, pz],
      dir: [Math.sin(a) * 0.9, -0.5, Math.cos(a) * 0.9],
      flat: true,
    } as any);
  }
  // waist trim band
  b.part(new THREE.TorusGeometry(0.55, 0.035, 5, 14), P.trimGold, {
    bone: J.body,
    at: [0, 1.02, -0.45],
    dir: [0, 0, 1],
    axis: "z",
    scale: [1, 0.9, 1],
  } as any);
  // chest gem
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), P.trimGold, {
    bone: J.chest,
    at: [0, 1.22, 0.86],
    dir: [0, 0.2, 1],
  } as any);
  const gem = b.part(new THREE.OctahedronGeometry(0.09), P.gold, {
    bone: J.chest,
    at: [0, 1.22, 0.9],
    dir: [0, 0.2, 1],
  } as any);
  try {
    (gem.mesh.material as any).emissive?.set(P.gold);
  } catch (e) {}
  void body; void back; void belly; void frame;
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const C = [0, 1.95, 1.05];
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // Skull, cream face, brow
  b.part(sph(1, 12, 10), P.orange, { bone: head, at: C, scale: [0.3, 0.27, 0.33] });
  b.part(sph(1, 10, 8), P.amber, { bone: head, at: [0, 1.98, 1.0], scale: [0.26, 0.2, 0.26] });
  b.part(sph(1, 10, 8), P.cream, { bone: head, at: [0, 1.88, 1.2], scale: [0.2, 0.12, 0.17] });

  // Upper beak: hooked
  b.part(new THREE.ConeGeometry(0.13, 0.36, 6), P.beak, { bone: head, at: [0, 1.93, 1.42], dir: [0, -0.05, 1] });
  b.part(new THREE.ConeGeometry(0.06, 0.16, 6), P.beakDark, { bone: head, at: [0, 1.86, 1.62], dir: [0, -1, 0.5] });
  b.part(new THREE.BoxGeometry(0.02, 0.012, 0.2), P.beakDark, { bone: head, at: [0, 1.87, 1.4] });

  // Lower jaw
  b.part(new THREE.ConeGeometry(0.1, 0.3, 6), P.beakDark, { bone: jaw, at: [0, 1.84, 1.36], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.07, 0.24, 6), P.beak, { bone: jaw, at: [0, 1.845, 1.37], dir: [0, 0, 1] });

  for (const s of [1, -1]) {
    // Nostrils
    b.part(sph(0.016, 6, 4), P.ink, { bone: head, at: [s * 0.045, 1.96, 1.38] });

    // Eye: outline, iris, pupil, highlights
    const ex = s * 0.19, ey = 2.0, ez = 1.13;
    const out = [s * 0.85, 0.1, 0.5];
    b.part(sph(1, 10, 8), P.ink, { bone: head, at: [ex, ey, ez], scale: [0.04, 0.095, 0.085], dir: out });
    b.part(sph(1, 10, 8), P.eyeIris, { bone: head, at: [ex + s * 0.012, ey - 0.005, ez + 0.012], scale: [0.04, 0.075, 0.068] });
    b.part(sph(1, 8, 6), P.ink, { bone: head, at: [ex + s * 0.03, ey - 0.005, ez + 0.02], scale: [0.025, 0.05, 0.035] });
    b.part(sph(0.018, 6, 4), P.white, { bone: head, at: [ex + s * 0.045, ey + 0.035, ez + 0.04] });
    b.part(sph(0.01, 6, 4), P.white, { bone: head, at: [ex + s * 0.045, ey - 0.03, ez - 0.01] });

    // Brow stroke
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.2), P.ink, { bone: head, at: [s * 0.2, 2.115, 1.15], rotation: [-8, s * -10, s * -18] });

    // Cheek ruff blades
    for (let i = 0; i < 4; i++) {
      const col = [P.orange, P.amber, P.gold, P.red][i];
      b.part(new THREE.ConeGeometry(0.06 - i * 0.007, 0.24, 5), col, {
        bone: head,
        at: [s * (0.26 + i * 0.02), 1.9 - i * 0.04, 1.0 - i * 0.07],
        dir: [s * 0.6, -0.5 - i * 0.1, -0.8],
      });
    }
    b.part(new THREE.ConeGeometry(0.05, 0.2, 5), P.cream, { bone: head, at: [s * 0.24, 1.82, 1.06], dir: [s * 0.5, -0.8, 0.1] });
  }

  // Crest of 5 plumes sweeping back and up
  const plumes = [
    { x: 0, len: 0.6, up: 0.75, w: 0.07 },
    { x: 0.1, len: 0.5, up: 0.55, w: 0.06 },
    { x: -0.1, len: 0.5, up: 0.55, w: 0.06 },
    { x: 0.18, len: 0.38, up: 0.35, w: 0.05 },
    { x: -0.18, len: 0.38, up: 0.35, w: 0.05 },
  ];
  for (const p of plumes) {
    const base = new THREE.Vector3(p.x, 2.15, 0.95);
    const dir = new THREE.Vector3(p.x * 1.2, p.up, -0.9).normalize();
    const seg = [P.crimson, P.orange, P.amber, P.gold];
    let cur = base.clone();
    const L = p.len / 4;
    for (let i = 0; i < 4; i++) {
      const d = dir.clone();
      d.y -= i * 0.12;
      d.normalize();
      const r0 = p.w * (1 - i * 0.2);
      b.part(new THREE.ConeGeometry(r0, L * 1.5, 6), seg[i], {
        bone: head,
        at: [cur.x + d.x * L * 0.5, cur.y + d.y * L * 0.5, cur.z + d.z * L * 0.5],
        dir: [-d.x, -d.y, -d.z],
      });
      cur.addScaledVector(d, L);
    }
    b.part(sph(p.w * 0.45, 6, 4), P.flameCore, { bone: head, at: [cur.x, cur.y, cur.z] });
  }

  // Forehead circlet bead + band
  b.part(new THREE.TorusGeometry(0.2, 0.012, 5, 14, Math.PI), P.trimGold, { bone: head, at: [0, 2.07, 1.08], rotation: [75, 0, 0] });
  b.part(sph(0.035, 8, 6), P.gold, { bone: head, at: [0, 2.12, 1.25] });
  b.part(sph(0.018, 6, 4), P.flameCore, { bone: head, at: [0, 2.13, 1.27] });
}
    return buildHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: any) {
  const R = rng(11);
  const G = (x: any, s = 1) => { try { return (glow as any)(x, s); } catch { return x; } };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side], el = J["elbow" + side], wr = J["wrist" + side];
    const P0 = [s * 0.32, 1.45, 0.2], P1 = [s * 1.2, 1.55, 0], P2 = [s * 2.0, 1.6, -0.2];
    // arm tube
    b.rod(P0, P1, [0.15, 0.12], P.crimson, { bone: sh });
    b.rod(P1, P2, [0.12, 0.09], P.crimson, { bone: el });
    b.capsule(P0, P0, 0.17, P.red, { bone: sh });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8), P.trimGold, { bone: wr, at: [s * 1.95, 1.6, -0.19], dir: [s, 0, -0.1] });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.gold, { bone: wr, at: [s * 2.05, 1.6, -0.21] });
    G(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.flameCore, { bone: wr, at: [s * 2.1, 1.65, -0.2] }), 1.5);

    // blade: leaf outline along local x, with rib and tip
    const blade = (root: number[], ang: number, len: number, w: number, col: string, tip: string, bone: any, tilt: number) => {
      const out: any = [[0, 0], [len * 0.3, w], [len * 0.7, w * 0.8], [len, 0, "sharp"], [len * 0.7, -w * 0.8], [len * 0.3, -w]];
      const dx = Math.cos(ang) * s, dz = -Math.sin(ang);
      const x: [number, number, number] = [dx, tilt, dz];
      b.extrude(out, { at: root, x, y: [0, 1, 0], thickness: 0.025, bevel: 0.006, smoothing: 1, color: col, bone });
      const tp = [root[0] + dx * len * 0.78, root[1] + tilt * len * 0.78 + 0.016, root[2] + dz * len * 0.78];
      const tl = [root[0] + dx * len, root[1] + tilt * len + 0.016, root[2] + dz * len];
      b.rod(root, tp, [0.012, 0.008], P.paleGold, { bone });
      G(b.spike(tp, tl, null, w * 0.5, { color: tip, bone }), 1.2);
    };
    // coverts
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const root = [s * (0.4 + t * 1.5), 1.62, 0.05 - t * 0.2];
      blade(root, -0.25 + t * 0.3 + (R() - 0.5) * 0.05, 0.45, 0.1, i % 2 ? P.crimson : P.red, P.orange, t > 0.5 ? el : sh, -0.02);
    }
    // secondaries
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const root = [s * (0.5 + t * 1.4), 1.55, -0.05 - t * 0.15];
      blade(root, 0.35 + t * 0.35, 0.85 + t * 0.2, 0.13, P.orange, P.amber, t > 0.5 ? el : sh, -0.05 - t * 0.02);
    }
    // primaries
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const root = [s * (1.9 + t * 0.15), 1.58, -0.2 - t * 0.05];
      const len = 0.95 - Math.abs(t - 0.15) * 0.3;
      blade(root, -0.1 + t * 0.95, len, 0.11, i % 2 ? P.amber : P.orange, P.flameCore, wr, -0.08 - t * 0.12);
      if (i % 2 === 0) b.part(new THREE.SphereGeometry(0.03, 5, 4), P.gold, { bone: wr, at: [root[0], 1.66, root[2]] });
    }
    // embers
    for (let i = 0; i < 3; i++)
      G(b.part(new THREE.SphereGeometry(0.035, 5, 4), P.ember, { bone: wr, at: [s * (2.5 + R() * 0.3), 1.4 + R() * 0.4, -0.6 - R() * 0.7] }), 1.5);
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: any) {
  const R = rng(11);
  const root = M.tailRoot;
  // fleshy base tube
  const base = b.chain("tailBase", catmull([[0, 1.1, -0.6], [0, 1.08, -0.95], [0, 1.0, -1.3]]), {
    parent: J.tail1, names: ["tailB1", "tailB2"], role: "tail",
  });
  b.sweep(base, [0.16, 0.09], { color: P.crimson, caps: "round" });
  // gold trim band
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 10), P.trimGold, {
    bone: J.tail1, at: [0, 1.09, -0.72], dir: [0, -0.05, -1],
  });
  const N = 7;
  for (let i = 0; i < N; i++) {
    const u = (i - 3) / 3; // -1..1
    const len = 1.5 - Math.abs(u) * 0.5; // centre longest
    const x1 = u * 0.75;
    const zEnd = -0.7 - len * (i === 3 ? 0.93 : 0.85);
    const yEnd = 0.12 + Math.abs(u) * 0.35 + R() * 0.08;
    const s: [number, number, number] = [u * 0.08, 1.1, -0.75];
    const m1: [number, number, number] = [x1 * 0.35, 1.12 - 0.05, -0.7 - len * 0.35];
    const m2: [number, number, number] = [x1 * 0.8, 0.7, -0.7 - len * 0.65];
    const e: [number, number, number] = [x1, yEnd, zEnd];
    const path = catmull([s, m1, m2, e]);
    const bone = i < 2 || i > 4 ? J.tail2 : J.tail1;
    b.sweep(path, (t: number) => 0.075 * (1 - t) + 0.012, {
      bone, sides: 6,
      bands: [[0.3, P.crimson], [0.65, P.orange], [0.88, P.gold], [1, P.flameCore]],
      caps: "round",
    });
    // glowing tip
    glowKit(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.flameCore, { bone: J.tail3, at: e }), 1.6);
    // rib highlight along the streamer
    b.sweep(path.slice(0.15, 0.8), (t: number) => 0.016 * (1 - t) + 0.006, {
      bone, sides: 5, color: P.amber, shift: [0, 0.05],
    });
  }
  // embers
  for (let k = 0; k < 6; k++) {
    const at: [number, number, number] = [(R() - 0.5) * 1.6, 0.25 + R() * 0.7, -1.7 - R() * 0.35];
    glowKit(b.part(new THREE.SphereGeometry(0.025 + R() * 0.02, 6, 4), P.ember, { bone: J.tail3, at }), 1.8);
  }
}
    return buildTail;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P }: any) {
  const R = rng(11);
  const toeR = 0.035;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = J["hip" + S], knee = J["knee" + S], ankle = J["ankle" + S];
    const x = 0.3 * s;
    // thigh puff
    b.part(new THREE.IcosahedronGeometry(0.2, 1), P.orange, { bone: hip, at: [x, 0.92, 0.02], scale: [1, 1.25, 1.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.14, 0), P.amber, { bone: hip, at: [x + 0.04 * s, 0.82, 0.08], scale: [1, 1.2, 1] , flat: true });
    // feather blades on thigh
    for (let i = 0; i < 4; i++) {
      b.spike([x + (i - 1.5) * 0.05, 0.84, -0.06], [0, -1, -0.25], 0.2, 0.04, { color: i % 2 ? P.amber : P.orange, bone: hip, sides: 5 });
    }
    // upper leg to knee, shank to ankle, metatarsus to foot
    b.rod([x, 0.78, 0.04], [x, 0.6, 0.12], 0.05, P.talon, { bone: hip });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), P.talon, { bone: knee, at: [x, 0.6, 0.12] });
    b.rod([x, 0.6, 0.12], [x, 0.25, 0.0], [0.045, 0.035], P.talon, { bone: knee });
    b.rod([x, 0.25, 0.0], [x, 0.045, 0.12], [0.035, 0.03], P.talon, { bone: ankle });
    // knee tufts
    for (let i = 0; i < 3; i++) {
      b.spike([x + (i - 1) * 0.04 * s, 0.62, 0.17], [(i - 1) * 0.3 * s, 0.4, 0.8], 0.14, 0.035, { color: i === 1 ? P.gold : P.amber, bone: knee, sides: 5 });
    }
    // trim bands
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.05, 8), P.trimGold, { bone: ankle, at: [x, 0.24, 0.0] });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 8), P.trimGold, { bone: ankle, at: [x, 0.17, 0.02] });
    // foot
    const fz = 0.12;
    b.part(new THREE.SphereGeometry(0.06, 6, 5), P.talon, { bone: ankle, at: [x, 0.06, fz], scale: [1, 0.8, 1.1] });
    const toes: [number, number][] = [[-0.12, 0.3], [0, 0.34], [0.12, 0.3], [0, -0.2]];
    toes.forEach(([dx, len], i) => {
      const dz = len > 0 ? len : -0.18;
      const dxx = dx * s;
      const a: [number, number, number] = [x, toeR, fz];
      const e: [number, number, number] = [x + dxx * 1.6, toeR, fz + (len > 0 ? len : -0.2)];
      b.rod(a, e, [toeR, toeR * 0.8], P.talon, { bone: ankle });
      b.part(new THREE.SphereGeometry(toeR * 1.1, 5, 4), P.talon, { bone: ankle, at: [(a[0] + e[0]) / 2, toeR, (a[2] + e[2]) / 2] });
      const dir = [e[0] - a[0], 0, e[2] - a[2]];
      const l = Math.hypot(dir[0], dir[2]);
      const d: [number, number, number] = [dir[0] / l, -0.25, dir[2] / l];
      b.spike(e, d, 0.11, 0.03, { color: P.ink, bone: ankle, sides: 6 });
      void R; void dz;
    });
  }
}
    return buildLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "solarPhoenix" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.05,-0.2], dir: [0,0.3,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["body"], at: [0,1.2,0.35], dir: [0,0.5,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.45,0.65], dir: [0,1,0.5], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.7,0.85], dir: [0,1,0.4], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.9,1], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.88,1.2], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,1.1,-0.75], dir: [0,0,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1,-1.3], dir: [0,-0.2,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.85,-1.8], dir: [0,-0.3,-1], role: "tail" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.32,1.45,0.2], dir: [1,0.1,0], role: "wing" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [1.2,1.55,0], dir: [1,0.05,-0.1], role: "wing" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [2,1.6,-0.2], dir: [1,0,-0.2], role: "wing" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.32,1.45,0.2], dir: [-1,0.1,0], role: "wing" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-1.2,1.55,0], dir: [-1,0.05,-0.1], role: "wing" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-2,1.6,-0.2], dir: [-1,0,-0.2], role: "wing" });
  J["hipL"] = b.joint("hipL", { parent: J["body"], at: [0.3,0.95,0], dir: [0,-1,0], role: "leg" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.3,0.6,0.12], dir: [0,-1,-0.2], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.3,0.25,0], dir: [0,-1,0.2], role: "leg" });
  J["hipR"] = b.joint("hipR", { parent: J["body"], at: [-0.3,0.95,0], dir: [0,-1,0], role: "leg" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.3,0.6,0.12], dir: [0,-1,-0.2], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.3,0.25,0], dir: [0,-1,0.2], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
