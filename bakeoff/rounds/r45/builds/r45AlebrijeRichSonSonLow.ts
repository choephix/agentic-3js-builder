import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, bezier, offset } from "../../../../src/index";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A Oaxacan alebrije of carved painted wood: a jaguar's body and legs with an eagle's hooked-beak head, crest and spread wings, covered in dot-flower, zigzag and rosette patterns in bright enamel colours."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  jaguarOrange: "#f28a1a",
  jaguarYellow: "#ffd23f",
  bellyCream: "#fff1c9",
  ink: "#1c1326",
  magenta: "#d4207a",
  pink: "#ff7fb5",
  turquoise: "#12b5b0",
  deepTeal: "#0c6e75",
  cobalt: "#2650c8",
  skyBlue: "#4fa9e8",
  leafGreen: "#35a64f",
  lime: "#a8da34",
  red: "#e0372b",
  purple: "#7b3db3",
  white: "#fff8e8",
  beakGold: "#f7c21f",
  beakDark: "#b8741a",
  woodBrown: "#8b5a2e",
  claw: "#f4ead2",
  eyeGlow: "#ffe45c",
};
const M = {
  hipsCenter: [0, 0.95, -0.6] as [number, number, number],
  chestCenter: [0, 1, 0.4] as [number, number, number],
  neckBase: [0, 1.08, 0.75] as [number, number, number],
  neckTop: [0, 1.5, 1.08] as [number, number, number],
  headCenter: [0, 1.62, 1.2] as [number, number, number],
  jawHinge: [0, 1.5, 1.12] as [number, number, number],
  beakTip: [0, 1.45, 1.78] as [number, number, number],
  crestRoot: [0, 1.9, 1.05] as [number, number, number],
  wingRootL: [0.32, 1.22, 0.4] as [number, number, number],
  wingRootR: [-0.32, 1.22, 0.4] as [number, number, number],
  tailRoot: [0, 0.97, -0.95] as [number, number, number],
  tailFan: [0, 1.3, -2] as [number, number, number],
  hipFL: [0.3, 0.88, 0.55] as [number, number, number],
  hipFR: [-0.3, 0.88, 0.55] as [number, number, number],
  hipHL: [0.32, 0.9, -0.7] as [number, number, number],
  hipHR: [-0.32, 0.9, -0.7] as [number, number, number],
  pawFloorFL: [0.3, 0, 0.8] as [number, number, number],
  pawFloorHL: [0.32, 0, -0.65] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const hips = J.hips, spine1 = J.spine1, chest = J.chest, neck1 = J.neck1, neck2 = J.neck2;

  // Torso loft
  const torso = b.loft(
    [
      { at: [0, 0.97, -1.0], w: 0.6, h: 0.54 },
      { at: [0, 0.98, -0.6], w: 0.7, h: 0.66 },
      { at: [0, 1.0, -0.1], w: 0.74, h: 0.7 },
      { at: [0, 1.02, 0.4], w: 0.78, h: 0.74 },
      { at: [0, 1.02, 0.85], w: 0.76, h: 0.76 },
    ],
    {
      bone: [hips, spine1, chest],
      color: P.jaguarOrange,
      sectors: [[110, 250, P.bellyCream]],
    },
  );

  // Neck
  const neckPath = catmull([
    [0, 1.08, 0.75],
    [0, 1.3, 0.95],
    [0, 1.5, 1.08],
  ]);
  const neck = b.sweep(neckPath, [0.27, 0.22], {
    bone: [chest, neck1, neck2],
    color: P.jaguarOrange,
    sectors: [[120, 240, P.bellyCream]],
  });

  const skin = b.surface(torso);
  const dot = (r: number) => new THREE.SphereGeometry(r, 6, 4);
  const disc = (r: number, h = 0.012) => new THREE.CylinderGeometry(r, r, h, 8);

  // Rosettes
  const centers = [P.magenta, P.turquoise, P.jaguarYellow];
  const hits = skin.scatter(52, {
    rng: rng(5),
    minDist: 0.17,
    filter: (h) => h.n.y > -0.15,
  });
  hits.forEach((h, i) => {
    b.stick(disc(0.06), P.ink, h, { embed: 0.3 });
    b.stick(disc(0.036, 0.016), P.jaguarOrange, h, { embed: 0.2 });
    b.stick(disc(0.022, 0.02), centers[i % 3], h, { embed: 0.1 });
  });

  // Dorsal diamonds
  const dg = new THREE.OctahedronGeometry(0.05);
  for (let i = 0; i < 14; i++) {
    const z = -0.9 + i * 0.13;
    const h = skin.ray([0, 2, z], [0, -1, 0]);
    if (h) b.stick(dg, i % 2 ? P.magenta : P.cobalt, h, { embed: 0.3, scale: [1, 0.5, 1.4] });
  }

  // Girth dot rows and flank zigzag
  for (const z of [-0.5, 0.05, 0.55]) {
    const loop = skin.loop([0, 1, z], { dir: [0, 0, 1], lift: 0.005 });
    b.along(loop, 22, (at) => b.stick(dot(0.017), P.white, at, { embed: 0.2 }));
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 12; i++) {
      const z = -0.8 + i * 0.12;
      const h = skin.ray([s * 2, 0.95, z], [-s, 0, 0]);
      if (h) b.stick(new THREE.ConeGeometry(0.04, 0.08, 4), i % 2 ? P.turquoise : P.ink, h, { embed: 0.2 });
    }
    // dot flowers on shoulder & haunch
    for (const z of [0.5, -0.6]) {
      const h = skin.ray([s * 2, 1.15, z], [-s, 0, 0]);
      if (!h) continue;
      b.stick(disc(0.11, 0.01), P.ink, h, { embed: 0.3 });
      b.ring(h, { count: 6, radius: 0.07 }, (it) => b.stick(dot(0.028), i6(z, P), it, { embed: 0.3 }));
      b.stick(dot(0.04), P.jaguarYellow, h, { embed: 0.3 });
    }
    // swirl tattoo
    const sw = b.sweep(
      catmull([
        [s * 0.4, 1.05, 0.2],
        [s * 0.42, 1.12, 0.12],
        [s * 0.43, 1.06, 0.06],
        [s * 0.42, 1.0, 0.1],
      ]),
      0.008,
      { color: P.ink, bone: spine1 },
    );
  }

  // Chest bib of feather scales
  const rows = [P.purple, P.pink, P.turquoise];
  const leaf = new THREE.SphereGeometry(0.075, 6, 4);
  for (let r = 0; r < 3; r++) {
    const n = 5 - (r === 2 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.11;
      const y = 1.1 - r * 0.07 + 0.02;
      const h = skin.ray([x, y, 2], [0, 0, -1]) ?? skin.nearest([x, y, 0.85]);
      b.stick(leaf, rows[r], h, { embed: 0.35, scale: [1, 1.2, 0.5] });
      b.stick(dot(0.014), P.white, h, { embed: 0.1 });
    }
  }

  // Neck collar dots and throat dots
  const nsk = b.surface(neck);
  b.along(nsk.loop(neckPath.at(0.5), { lift: 0.004 }), 14, (at) =>
    b.stick(dot(0.016), P.jaguarYellow, at, { embed: 0.2 }),
  );
  for (let i = 0; i < 4; i++) {
    const h = nsk.nearest([0.2, 1.2 + i * 0.07, 0.9 + i * 0.05]);
    b.stick(disc(0.04), P.ink, h, { embed: 0.3 });
    b.stick(disc(0.025, 0.016), i % 2 ? P.magenta : P.cobalt, h, { embed: 0.2 });
    const h2 = nsk.nearest([-0.2, 1.2 + i * 0.07, 0.9 + i * 0.05]);
    b.stick(disc(0.04), P.ink, h2, { embed: 0.3 });
    b.stick(disc(0.025, 0.016), i % 2 ? P.turquoise : P.magenta, h2, { embed: 0.2 });
  }
}

function i6(z: number, P: Record<string, string>) {
  return z > 0 ? P.pink : P.white;
}
    return buildBody;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw;
  const r = rng(11);
  const HC = M.headCenter;
  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: head, at, flat: true, ...o });
  const disc = (rad: number, th: number, seg = 10) => new THREE.CylinderGeometry(rad, rad, th, seg);

  // skull
  put(sph(1, 10, 8), P.jaguarYellow, HC, { scale: [0.33, 0.3, 0.38] });
  // cheek masks
  for (const s of [1, -1]) {
    put(sph(1, 8, 6), P.bellyCream, [s * 0.22, 1.58, 1.28], { scale: [0.12, 0.17, 0.2] });
    put(sph(1, 8, 6), P.jaguarOrange, [s * 0.25, 1.68, 1.18], { scale: [0.1, 0.14, 0.2] });
    // eyes (facing sideways/forward)
    const d = [s * 0.7, 0.05, 0.7];
    const ep: number[] = [s * 0.2, 1.72, 1.3];
    const st = (rad: number, c: string, off: number) =>
      put(disc(rad, 0.02), c, [ep[0] + s * off, ep[1], ep[2] + off * 0.6], { dir: d });
    st(0.115, P.ink, 0.0);
    st(0.095, P.white, 0.012);
    st(0.075, P.eyeGlow, 0.024);
    st(0.04, P.ink, 0.036);
    put(sph(0.016, 5, 4), P.white, [ep[0] + s * 0.05, ep[1] + 0.03, ep[2] + 0.06]);
    // brow ridge
    put(new THREE.BoxGeometry(0.12, 0.05, 0.2), P.ink, [s * 0.2, 1.85, 1.28], { rotation: [0, 0, s * -20] });
    for (let i = 0; i < 3; i++)
      put(sph(0.014, 5, 4), P.white, [s * (0.2 + i * 0.012), 1.885 - i * 0.003, 1.2 + i * 0.07]);
    // cheek dot garland
    for (let i = 0; i < 5; i++)
      put(sph(0.015, 5, 4), i % 2 ? P.white : P.jaguarYellow, [s * (0.29 - i * 0.005), 1.52 + i * 0.02, 1.15 + i * 0.05]);
    // ear tufts
    for (let i = 0; i < 3; i++)
      put(new THREE.ConeGeometry(0.04, 0.2, 5), [P.magenta, P.turquoise, P.cobalt][i], [s * (0.2 + i * 0.03), 1.9 + i * 0.01, 1.02 - i * 0.04], { rotation: [-30 - i * 8, 0, s * -(15 + i * 12)] });
  }

  // upper beak
  put(new THREE.BoxGeometry(0.3, 0.2, 0.2), P.beakGold, [0, 1.56, 1.45], { scale: [1, 1, 1] });
  put(new THREE.ConeGeometry(0.15, 0.4, 6), P.beakGold, [0, 1.52, 1.6], { rotation: [90, 0, 0] });
  put(new THREE.ConeGeometry(0.085, 0.2, 6), P.beakGold, [0, 1.47, 1.72], { rotation: [120, 0, 0] });
  put(new THREE.ConeGeometry(0.03, 0.1, 5), P.beakDark, [0, 1.43, 1.78], { rotation: [150, 0, 0] });
  // ridge
  put(new THREE.BoxGeometry(0.03, 0.03, 0.34), P.beakDark, [0, 1.66, 1.56], { rotation: [12, 0, 0] });
  // nostrils
  for (const s of [1, -1]) {
    put(sph(0.022, 5, 4), P.ink, [s * 0.07, 1.62, 1.56]);
    // beak stripe bands
    put(new THREE.BoxGeometry(0.012, 0.03, 0.05), P.turquoise, [s * 0.145, 1.55, 1.52]);
    put(new THREE.BoxGeometry(0.012, 0.03, 0.05), P.magenta, [s * 0.12, 1.53, 1.63]);
    for (let i = 0; i < 4; i++) put(sph(0.012, 4, 3), i % 2 ? P.white : P.beakGold, [s * (0.14 - i * 0.012), 1.6 - i * 0.025, 1.4 + i * 0.07]);
  }
  // cere dots
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI;
    put(sph(0.017, 5, 4), i % 2 ? P.pink : P.white, [Math.cos(a) * 0.14, 1.64 + Math.sin(a) * 0.06 - 0.02, 1.42]);
  }

  // lower beak on jaw
  const jp = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => b.part(g, c, { bone: jaw, at, flat: true, ...o });
  jp(new THREE.BoxGeometry(0.24, 0.07, 0.3), P.beakDark, [0, 1.42, 1.45]);
  jp(new THREE.ConeGeometry(0.12, 0.3, 6), P.beakGold, [0, 1.42, 1.58], { rotation: [90, 0, 0], scale: [1, 1, 0.45] });
  jp(new THREE.BoxGeometry(0.2, 0.012, 0.28), P.red, [0, 1.462, 1.45]);
  jp(new THREE.BoxGeometry(0.22, 0.012, 0.04), P.bellyCream, [0, 1.466, 1.6]);
  for (let i = 0; i < 4; i++) jp(sph(0.012, 4, 3), P.white, [0.1 - i * 0.002, 1.4, 1.38 + i * 0.07]);

  // crest
  const cols = [P.magenta, P.turquoise, P.cobalt, P.lime, P.jaguarYellow];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = (i - 4) / 4;
    const h = 0.32 - Math.abs(t) * 0.1 + 0.02;
    const ol = [[0, 0], [0.06, 0.06], [0.06, h * 0.7], [0, h, "sharp"], [-0.06, h * 0.7], [-0.06, 0.06]] as any;
    const sh = [[0, 0.01], [0.045, 0.07], [0.045, h * 0.68], [0, h - 0.025, "sharp"], [-0.045, h * 0.68], [-0.045, 0.07]] as any;
    const at = [t * 0.2, 1.88 - Math.abs(t) * 0.07, 1.05 - Math.abs(t) * 0.02];
    const y = [t * 0.5, 1, -0.55 - Math.abs(t) * 0.1];
    b.extrude(ol, { at, x: [1, 0, 0], y, thickness: 0.02, color: P.ink, bone: head, smoothing: 1 });
    const at2 = [at[0], at[1], at[2] + 0.014];
    b.extrude(sh, { at: at2, x: [1, 0, 0], y, thickness: 0.02, color: cols[i % 5], bone: head, smoothing: 1 });
    const d = new THREE.Vector3(...y).normalize();
    for (let k = 1; k < 4; k++) {
      const q = (h * k) / 4;
      put(sph(0.011, 4, 3), P.white, [at2[0] + d.x * q, at2[1] + d.y * q, at2[2] + d.z * q + 0.015]);
    }
    put(sph(0.02, 5, 4), P.white, [at2[0] + d.x * (h - 0.04), at2[1] + d.y * (h - 0.04), at2[2] + d.z * (h - 0.04) + 0.015]);
  }

  // neck ruff
  const rc = [P.turquoise, P.cobalt, P.pink, P.white];
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + ring * 0.31;
      const rad = 0.27 + ring * 0.04;
      const pos = [Math.sin(a) * rad, 1.5 + Math.cos(a) * rad, 1.0 - ring * 0.06];
      const out = new THREE.Vector3(Math.sin(a), Math.cos(a), -0.8).normalize();
      put(new THREE.ConeGeometry(0.06, 0.24, 5), rc[(i + ring) % 4], pos, { dir: out.toArray(), scale: [1, 1, 0.5] });
      put(sph(0.017, 4, 3), P.white, [pos[0] + out.x * 0.12, pos[1] + out.y * 0.12, pos[2] + out.z * 0.12 + 0.03]);
    }
  }
  r();
}
    return buildHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const seq = [P.magenta, P.jaguarOrange, P.jaguarYellow, P.lime, P.turquoise, P.cobalt, P.purple];
  const dotG = new THREE.SphereGeometry(0.02, 6, 4);

  const feather = (
    bone: any, at: number[], dir: number[], len: number, wid: number, col: string, tipCol: string,
  ) => {
    const d = new THREE.Vector3(...dir).normalize();
    // outline feather behind
    const ol = (w: number, l: number) => [
      [0, 0], [w * 0.5, l * 0.25], [w * 0.55, l * 0.7], [0, l], [-w * 0.55, l * 0.7], [-w * 0.5, l * 0.25],
    ] as any;
    const side = new THREE.Vector3(0, 1, 0).cross(d).normalize(); // outline x axis lies flat
    b.extrude(ol(wid * 1.18, len * 1.04), {
      at: [at[0], at[1] - 0.012, at[2]], x: side.toArray() as any, y: d.toArray() as any,
      thickness: 0.016, color: P.ink, bone, smoothing: 1,
    });
    const f = b.extrude(ol(wid, len), {
      at, x: side.toArray() as any, y: d.toArray() as any,
      thickness: 0.02, color: col, bone, smoothing: 1,
    });
    const up = new THREE.Vector3(0, 1, 0);
    const p = (u: number, v: number, h = 0.014) =>
      new THREE.Vector3(...at).addScaledVector(side, u).addScaledVector(d, v).addScaledVector(up, h);
    // quill
    b.rod(p(0, len * 0.05, 0.014), p(0, len * 0.92, 0.014), 0.007, P.white, { bone });
    // dots down the vane
    for (let i = 1; i <= 4; i++) {
      for (const s of [-1, 1])
        b.part(dotG, P.white, { bone, at: p(s * wid * 0.22, len * (0.12 + i * 0.17), 0.012), scale: [0.7, 0.7, 0.7] });
    }
    // tip band
    b.part(new THREE.SphereGeometry(0.05, 6, 4), tipCol, { bone, at: p(0, len * 0.86, 0.014), scale: [wid * 3, 0.5, 1.2] });
    return f;
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root = J["wingRoot" + S], elbow = J["wingElbow" + S], wrist = J["wingWrist" + S], tip = J["wingTip" + S];
    const pts = [
      [s * 0.32, 1.22, 0.4], [s * 0.95, 1.35, 0.3], [s * 1.45, 1.42, 0.1], [s * 1.8, 1.55, -0.1],
    ];
    const arm = b.sweep(b.catmull ? (b as any).catmull(pts) : pts, [0.16, 0.08], {
      bone: [root, elbow, wrist, tip], color: P.jaguarOrange,
    });
    // rosettes + leading edge dots
    for (const [t, ang] of [[0.2, 0], [0.4, 40], [0.55, -40], [0.75, 0], [0.9, 30]] as number[][]) {
      const h = arm.at(t, ang);
      b.stick(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 8), P.ink, h, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 8), seq[Math.floor(R() * 7) % 7], h, { embed: 0.3 });
    }
    for (let i = 0; i < 9; i++) {
      const h = arm.at(0.1 + i * 0.1, s * 70);
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.white, h, { embed: 0.3 });
    }
    // wrist zigzag
    for (let i = 0; i < 6; i++) {
      const h = arm.at(0.58 + (i % 3) * 0.03, -90 + i * 36);
      b.stick(new THREE.ConeGeometry(0.03, 0.06, 4), i % 2 ? P.turquoise : P.ink, h, { embed: 0.2 });
    }
    // shoulder dot flower
    const sh = arm.at(0.06, 0);
    b.stick(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 10), P.ink, sh, { embed: 0.5 });
    b.ring(sh, { count: 6, radius: 0.065 }, (it: any) =>
      b.stick(new THREE.SphereGeometry(0.03, 6, 4), P.pink, it, { embed: 0.3 }));
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), P.jaguarYellow, sh, { embed: 0.2 });

    // coverts
    const cov = [P.cobalt, P.turquoise, P.magenta];
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 6; i++) {
        const t = 0.1 + i * 0.15;
        const x = s * (0.4 + t * 1.35);
        const z = 0.3 - t * 0.4 - row * 0.12 - 0.1;
        feather(i < 3 ? elbow : wrist, [x, 1.36 + t * 0.15 - row * 0.02, z], [s * 0.25, -0.03, -1], 0.3, 0.14,
          cov[(i + row) % 3], P.white);
      }
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x = s * (0.55 + t * 1.2);
      feather(t < 0.5 ? elbow : wrist, [x, 1.34 + t * 0.15, 0.15 - t * 0.3], [s * (0.1 + t * 0.2), -0.05, -1], 0.5, 0.15,
        seq[(i + 2) % 7], P.ink);
    }
    // secondaries
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const x = s * (0.45 + t * 0.85);
      feather(t < 0.5 ? root : elbow, [x, 1.3 + t * 0.1, 0.1 - t * 0.2], [s * (0.05 + t * 0.1), -0.06, -1], 0.55 + (1 - t) * 0.2, 0.17,
        seq[i % 7], seq[(i + 3) % 7]);
    }
    // primaries
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const x = s * (1.4 + t * 0.4);
      feather(t < 0.5 ? wrist : tip, [x, 1.4 + t * 0.12, 0.08 - t * 0.2], [s * (0.2 + t * 0.55), -0.07, -1], 0.8 + t * 0.2, 0.16,
        seq[(i + 1) % 7], seq[(i + 4) % 7]);
    }
  }
}
    return buildWings;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  const leg = (s: number, front: boolean) => {
    const sfx = (front ? "F" : "H") + (s > 0 ? "L" : "R");
    const hip = J["hip" + sfx], knee = J["knee" + sfx], ankle = J["ankle" + sfx], toe = J["toe" + sfx];
    const x = s * (front ? 0.3 : 0.32);
    const hipY = front ? 0.88 : 0.9;
    const kz = front ? 0.6 : -0.5, az = front ? 0.65 : -0.85, ky = front ? 0.5 : 0.55, ay = front ? 0.2 : 0.25;
    const hz = front ? 0.55 : -0.7;
    const hp: [number, number, number] = [x, hipY, hz];
    const kp: [number, number, number] = [x, ky, kz];
    const ap: [number, number, number] = [x, ay, az];
    const pz = front ? 0.72 : -0.7;
    // upper leg
    b.capsule(hp, kp, front ? [0.14, 0.11] : [0.17, 0.11], P.jaguarOrange, { bone: hip, sides: 8 });
    b.capsule(kp, ap, front ? [0.11, 0.09] : [0.09, 0.08], P.jaguarOrange, { bone: knee, sides: 8 });
    // heavy thigh for hind legs
    if (!front) {
      b.part(sph(1, 10, 8), P.jaguarOrange, { bone: hip, at: [x, 0.85, -0.68], scale: [0.2, 0.28, 0.28] });
      b.part(sph(0.05), P.ink, { bone: hip, at: [x + s * 0.2, 0.9, -0.75] });
      b.part(sph(0.05), P.magenta, { bone: hip, at: [x + s * 0.2, 0.9, -0.75], scale: [0.4, 0.6, 0.6] });
    }
    // lower leg foot link
    b.capsule(ap, [x, 0.1, pz - 0.05], 0.08, P.jaguarYellow, { bone: ankle, sides: 8 });
    // cream inner side
    b.capsule([x - s * 0.08, ky + 0.05, kz], [x - s * 0.07, ay + 0.05, az], 0.04, P.bellyCream, { bone: knee, sides: 6 });
    // paw
    const paw = b.part(sph(1, 10, 8), P.jaguarYellow, { bone: toe, at: [x, 0.09, pz + 0.06], scale: [0.11, 0.09, 0.16] });
    b.part(sph(1, 8, 4), P.bellyCream, { bone: toe, at: [x, 0.02, pz + 0.06], scale: [0.1, 0.03, 0.15] });
    b.part(sph(0.04, 6, 4), P.pink, { bone: toe, at: [x, 0.0, pz + 0.05], scale: [1, 0.3, 1] });
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.05;
      const tz = pz + 0.2 - Math.abs(i - 1.5) * 0.02;
      b.part(sph(0.032, 6, 5), P.jaguarYellow, { bone: toe, at: [tx, 0.07, tz] });
      b.part(new THREE.ConeGeometry(0.014, 0.07, 5), P.claw, { bone: toe, at: [tx, 0.05, tz + 0.05], dir: [0, -0.5, 1] });
    }
    // cuffs with dots
    const cuffs: [number, string][] = [[0.34, P.cobalt], [0.28, P.magenta], [0.22, P.cobalt]];
    cuffs.forEach(([t, c]) => {
      const y = ay + t * 0.4 - 0.05;
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 8), c, { bone: ankle, at: [x, y, az + 0.01] });
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(sph(0.012, 5, 4), P.white, { bone: ankle, at: [x + Math.cos(a) * 0.098, ay + 0.11, az + 0.01 + Math.sin(a) * 0.098] });
    }
    // zigzag at ankle
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.025, 0.05, 3), i % 2 ? P.turquoise : P.ink, { bone: ankle, at: [x + Math.cos(a) * 0.09, ay + 0.03, az + Math.sin(a) * 0.09] });
    }
    // rosettes and dot-flower on upper leg
    const ox = x + s * (front ? 0.13 : 0.2);
    for (let i = 0; i < 3; i++) {
      const p: [number, number, number] = [ox, hipY - 0.15 - i * 0.12 + R() * 0.03, hz + (i % 2) * 0.04 + (front ? 0.02 : -0.05)];
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), P.ink, { bone: hip, at: p, dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 6), i % 2 ? P.turquoise : P.magenta, { bone: hip, at: p, dir: [s, 0, 0] });
    }
    const fc: [number, number, number] = [ox + s * 0.01, hipY - 0.02, hz];
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 10), P.ink, { bone: hip, at: fc, dir: [s, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(sph(0.018, 5, 4), P.white, { bone: hip, at: [fc[0] + s * 0.01, fc[1] + Math.cos(a) * 0.04, fc[2] + Math.sin(a) * 0.04] });
    }
    b.part(sph(0.02, 5, 4), P.jaguarYellow, { bone: hip, at: [fc[0] + s * 0.012, fc[1], fc[2]] });
    // feather tuft pointing back
    const tc = [P.turquoise, P.magenta, P.white];
    const ty = front ? ay + 0.15 : ay + 0.1;
    const tz0 = front ? az - 0.08 : az - 0.08;
    tc.forEach((c, i) => {
      b.part(new THREE.ConeGeometry(0.025, 0.2, 4), c, {
        bone: front ? ankle : ankle,
        at: [x + (i - 1) * 0.04, ty - Math.abs(i - 1) * 0.02, tz0 - 0.08],
        dir: [(i - 1) * 0.2, -0.1, -1],
      });
    });
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const bones = [J.tail1, J.tail2, J.tail3, J.tail4];
  const path = catmull([[0, 0.97, -0.95], [0, 0.92, -1.35], [0, 0.95, -1.7], [0, 1.3, -1.95]]);
  const tube = b.sweep(path, [0.15, 0.07], {
    bone: bones,
    color: P.jaguarOrange,
    sectors: [[125, 235, P.bellyCream]],
    sides: 8,
  });

  // bands: alternating ink / cobalt / magenta rings
  const cols = [P.ink, P.cobalt, P.ink, P.magenta];
  for (let i = 0; i < 8; i++) {
    const t = 0.12 + i * 0.1;
    const at = tube.at(t, 0);
    const ring = b.ring(frame(at.at, at.tangent), { count: 1, radius: 0 });
    void ring;
    const r = at.radius;
    b.part(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.025, 8, 1, true), cols[i % 4], {
      at: path.at(t), dir: path.tangentAt(t), bone: bones[Math.min(3, Math.floor(t * 4))],
    });
  }

  // dot rows on top and sides
  for (const ang of [0, 70, -70]) {
    for (let i = 0; i < 12; i++) {
      const t = 0.05 + i * 0.075;
      const h = tube.at(t + 0.03, ang);
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), i % 2 ? P.white : P.jaguarYellow, h, { embed: 0.3 });
    }
  }

  // rosettes at base
  for (const [t, a] of [[0.1, 40], [0.1, -40], [0.25, 50], [0.25, -50], [0.4, 0]] as [number, number][]) {
    const h = tube.at(t + 0.035, a);
    b.stick(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), P.ink, h, { embed: 0.4 });
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 8), P.turquoise, h, { embed: 0.3 });
  }

  // dot-flower at rump join
  const fc = tube.at(0.03, 0);
  b.stick(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 10), P.ink, fc, { embed: 0.4 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.pink, fc.moved([Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05]), { embed: 0.3 });
  }
  b.stick(new THREE.SphereGeometry(0.025, 6, 4), P.jaguarYellow, fc, { embed: 0.2 });

  // feather helper
  const leaf = (len: number, w: number): [number, number][] => [
    [0, 0], [w * 0.5, len * 0.35], [w * 0.4, len * 0.8], [0, len, ] as any, [-w * 0.4, len * 0.8], [-w * 0.5, len * 0.35],
  ].map((p) => [p[0], p[1]] as [number, number]);
  const base = path.at(1);
  const fan = [P.purple, P.lime, P.cobalt, P.magenta, P.turquoise, P.beakGold, P.red];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const k = (i - 3) / 3;
    const len = 0.7 - Math.abs(k) * 0.16;
    const tilt = k * 0.7;
    const up: [number, number, number] = [Math.sin(tilt) * 0.9, 0.55, -0.55];
    const dir = new THREE.Vector3(...up).normalize();
    const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0);
    const mk = (l: number, w: number, c: string, lift: number, th: number) =>
      b.extrude(leaf(l, w), {
        at: offset(base, dir, 0.0 + lift) as any, x: side.toArray() as any, y: dir.toArray() as any,
        thickness: th, color: c, bone: J.tail4, smoothing: 1,
      });
    mk(len + 0.05, 0.27, P.ink, -0.02, 0.02);
    mk(len, 0.22, fan[i], 0, 0.03);
    const tip = offset(base, dir, len * 0.9);
    const quillEnd = offset(base, dir, len * 0.85);
    b.rod(offset(base, dir, 0.05), quillEnd, 0.007, P.white, { bone: J.tail4 });
    for (let d = 1; d < 5; d++) {
      const p = offset(base, dir, d * len * 0.16 + 0.05);
      for (const s of [-1, 1]) b.part(new THREE.SphereGeometry(0.014, 5, 4), P.white, { at: [p.x + s * 0.05, p.y, p.z + 0.02], bone: J.tail4 });
    }
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), P.ink, { at: tip, dir: [0, 0.3, -1], axis: "y", bone: J.tail4 });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), P.white, { at: tip, bone: J.tail4 });
    b.part(new THREE.SphereGeometry(0.028, 6, 4), fan[(i + 3) % n], { at: tip, bone: J.tail4 });
  }

  // ruff of 6 short feathers
  const rc = [P.turquoise, P.magenta, P.white];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const d = new THREE.Vector3(Math.cos(a) * 0.5, Math.sin(a) * 0.5, -0.7).normalize();
    b.spike(offset(base, [0, 0, 0], 0), d.toArray() as any, 0.2, 0.04, { color: rc[i % 3], bone: J.tail4 });
  }

  // rump flame crest
  const fl = [P.pink, P.jaguarYellow, P.jaguarOrange, P.jaguarYellow, P.pink];
  for (let i = 0; i < 5; i++) {
    const z = -0.9 + i * 0.04;
    b.spike([0, 1.27 + (i % 2) * 0.02, z], [0, 1, -0.6], 0.17 - Math.abs(i - 2) * 0.02, 0.035, { color: fl[i], bone: J.tail1 });
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.95,-0.6], dir: [0,0,1], role: "spine", group: "body" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,0.97,-0.1], dir: [0,0.05,1], role: "spine", group: "body" });
  J["chest"] = b.joint("chest", { parent: J["spine1"], at: [0,1,0.4], dir: [0,0.15,1], role: "spine", group: "body" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.08,0.75], dir: [0,0.6,0.5], role: "neck", group: "body" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.3,0.95], dir: [0,0.6,0.35], role: "neck", group: "body" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.5,1.08], dir: [0,0,1], role: "head", group: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.5,1.12], dir: [0,0,1], role: "jaw", group: "head" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.97,-0.95], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.92,-1.35], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.95,-1.7], dir: [0,0.4,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,1.15,-1.95], dir: [0,0.8,-0.5], role: "tail", group: "tail" });
  J["wingRootL"] = b.joint("wingRootL", { parent: J["chest"], at: [0.32,1.22,0.4], dir: [1,0.1,0], role: "wing", group: "wings" });
  J["wingElbowL"] = b.joint("wingElbowL", { parent: J["wingRootL"], at: [0.95,1.35,0.3], dir: [1,0.15,-0.1], role: "wing", group: "wings" });
  J["wingWristL"] = b.joint("wingWristL", { parent: J["wingElbowL"], at: [1.45,1.42,0.1], dir: [1,0.15,-0.2], role: "wing", group: "wings" });
  J["wingTipL"] = b.joint("wingTipL", { parent: J["wingWristL"], at: [1.8,1.55,-0.1], dir: [1,0.2,-0.2], role: "wing", group: "wings" });
  J["wingRootR"] = b.joint("wingRootR", { parent: J["chest"], at: [-0.32,1.22,0.4], dir: [-1,0.1,0], role: "wing", group: "wings" });
  J["wingElbowR"] = b.joint("wingElbowR", { parent: J["wingRootR"], at: [-0.95,1.35,0.3], dir: [-1,0.15,-0.1], role: "wing", group: "wings" });
  J["wingWristR"] = b.joint("wingWristR", { parent: J["wingElbowR"], at: [-1.45,1.42,0.1], dir: [-1,0.15,-0.2], role: "wing", group: "wings" });
  J["wingTipR"] = b.joint("wingTipR", { parent: J["wingWristR"], at: [-1.8,1.55,-0.1], dir: [-1,0.2,-0.2], role: "wing", group: "wings" });
  J["hipFL"] = b.joint("hipFL", { parent: J["chest"], at: [0.3,0.88,0.55], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [0.3,0.5,0.6], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleFL"] = b.joint("ankleFL", { parent: J["kneeFL"], at: [0.3,0.2,0.65], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["toeFL"] = b.joint("toeFL", { parent: J["ankleFL"], at: [0.3,0.07,0.72], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipFR"] = b.joint("hipFR", { parent: J["chest"], at: [-0.3,0.88,0.55], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-0.3,0.5,0.6], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleFR"] = b.joint("ankleFR", { parent: J["kneeFR"], at: [-0.3,0.2,0.65], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["toeFR"] = b.joint("toeFR", { parent: J["ankleFR"], at: [-0.3,0.07,0.72], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipHL"] = b.joint("hipHL", { parent: J["hips"], at: [0.32,0.9,-0.7], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["kneeHL"] = b.joint("kneeHL", { parent: J["hipHL"], at: [0.32,0.55,-0.5], dir: [0,-1,-0.5], role: "leg", group: "legs" });
  J["ankleHL"] = b.joint("ankleHL", { parent: J["kneeHL"], at: [0.32,0.25,-0.85], dir: [0,-1,0.5], role: "leg", group: "legs" });
  J["toeHL"] = b.joint("toeHL", { parent: J["ankleHL"], at: [0.32,0.07,-0.72], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipHR"] = b.joint("hipHR", { parent: J["hips"], at: [-0.32,0.9,-0.7], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["kneeHR"] = b.joint("kneeHR", { parent: J["hipHR"], at: [-0.32,0.55,-0.5], dir: [0,-1,-0.5], role: "leg", group: "legs" });
  J["ankleHR"] = b.joint("ankleHR", { parent: J["kneeHR"], at: [-0.32,0.25,-0.85], dir: [0,-1,0.5], role: "leg", group: "legs" });
  J["toeHR"] = b.joint("toeHR", { parent: J["ankleHR"], at: [-0.32,0.07,-0.72], dir: [0,0,1], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
