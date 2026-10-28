import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Whimsical Desert Oasis",
  "description": "A low-poly diorama of a desert oasis: a turquoise pond ringed by palms and reeds, striped nomad tents, and sandy dunes with camels resting and standing nearby."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  sand: "#f0cf8a",
  sandLight: "#f8e2a8",
  sandDark: "#d9ad62",
  dune: "#e8be76",
  water: "#35c9d6",
  waterDeep: "#1f9fb8",
  stone: "#a89478",
  stoneDark: "#7d6a56",
  palmTrunk: "#9b6a3c",
  palmTrunkDark: "#744b28",
  palmLeaf: "#3fae4f",
  palmLeafDark: "#27823c",
  coconut: "#5a3a1e",
  reed: "#7cc04a",
  tentRed: "#d9453b",
  tentCream: "#fff0cf",
  tentBlue: "#2f6fc4",
  tentPole: "#6b4423",
  rug: "#8e2f5a",
  rugGold: "#f2b630",
  camelFur: "#c68f52",
  camelLight: "#e2b97c",
  camelDark: "#6b4528",
  fire: "#ff9a1f",
  fireCore: "#ffd84a",
  ink: "#2a1a12",
};
const M = {
  groundTop: [0, 0.15, 0] as [number, number, number],
  pondCenter: [0.3, 0.15, 0.2] as [number, number, number],
  tentLeft: [-1.9, 0.15, -1.7] as [number, number, number],
  tentRight: [1.7, 0.15, -2] as [number, number, number],
  campfire: [-0.1, 0.15, -1.1] as [number, number, number],
  camelStand: [1.9, 0.15, 1.6] as [number, number, number],
  camelLie: [-1.9, 0.15, 1.5] as [number, number, number],
  camelCalf: [-0.6, 0.15, 2.2] as [number, number, number],
  palmA: [-0.6, 0.15, 0.9] as [number, number, number],
  palmB: [1.5, 0.15, 0.9] as [number, number, number],
  palmC: [1.2, 0.15, -0.7] as [number, number, number],
  palmD: [-0.5, 0.15, -0.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // terrain
  (() => {
function buildTerrain({ b, J, P, M }: any) {
  const R = rng(11);
  const TOP = 0.15;
  const put = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { at, flat: true, ...extra });

  // Island base: lower dark band, upper sand slab (top at y=0.15)
  put(new THREE.CylinderGeometry(2.95, 2.8, 0.07, 12), P.sandDark, [0, 0.035, 0]);
  put(new THREE.CylinderGeometry(3.0, 2.95, 0.08, 12), P.stoneDark, [0, 0.11, 0]);
  put(new THREE.CylinderGeometry(2.97, 3.0, 0.02, 12), P.sand, [0, 0.14, 0]);
  put(new THREE.CylinderGeometry(2.9, 2.97, 0.02, 12), P.sandLight, [0, 0.15, 0]);
  // rim band stripes
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    put(new THREE.BoxGeometry(0.5, 0.05, 0.03), i % 2 ? P.sandDark : P.dune,
      [Math.sin(a) * 2.99, 0.09, Math.cos(a) * 2.99], { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // Dunes
  const dunes: [number, number, number, number, number][] = [
    [-2.1, -0.4, 0.9, 0.28, 0], [2.3, -0.5, 0.8, 0.24, 1], [0.2, -2.5, 1.0, 0.3, 2],
    [-2.4, 0.4, 0.6, 0.18, 3], [2.5, 0.8, 0.6, 0.2, 4], [0.9, 2.5, 0.8, 0.2, 5],
    [-1.5, -2.5, 0.7, 0.2, 6], [-1.2, 2.6, 0.55, 0.15, 7],
  ];
  for (const [x, z, r, h, i] of dunes) {
    put(new THREE.SphereGeometry(1, 7, 4), i % 2 ? P.dune : P.sandLight, [x, TOP + 0.02, z], { scale: [r, h * 0.8, r * 0.8], rotation: [0, i * 40, 0] });
    put(new THREE.SphereGeometry(1, 6, 3), P.sandDark, [x + r * 0.2, TOP + h * 0.55, z], { scale: [r * 0.35, h * 0.15, r * 0.3] });
  }
  put(new THREE.ConeGeometry(0.6, 0.3, 6), P.dune, [-0.3, TOP + 0.15, -2.2], { scale: [1.4, 1, 0.8] });

  // Pond
  const [px, , pz] = M.pondCenter;
  put(new THREE.CylinderGeometry(1.25, 1.3, 0.03, 14), P.sandDark, [px, TOP + 0.005, pz]);
  put(new THREE.CylinderGeometry(1.1, 1.1, 0.04, 14), P.water, [px, TOP + 0.02, pz]);
  put(new THREE.CylinderGeometry(0.7, 0.7, 0.04, 12), P.waterDeep, [px, TOP + 0.035, pz]);
  put(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), P.water, [px - 0.1, TOP + 0.045, pz + 0.05], { scale: [1, 1, 0.8] });

  // Lily pads
  for (const [dx, dz, s] of [[0.5, 0.3, 0.14], [-0.4, -0.5, 0.12], [0.2, -0.65, 0.1], [-0.6, 0.35, 0.11]] as number[][]) {
    put(new THREE.CylinderGeometry(s, s, 0.012, 7), P.palmLeaf, [px + dx, TOP + 0.05, pz + dz]);
    put(new THREE.CylinderGeometry(s * 0.35, s * 0.35, 0.014, 5), P.palmLeafDark, [px + dx + s * 0.4, TOP + 0.052, pz + dz]);
  }
  put(new THREE.SphereGeometry(0.03, 5, 3), "#ff8fb8", [px + 0.5, TOP + 0.07, pz + 0.3]);

  // Stone ring
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R() * 0.1;
    const rr = 1.17 + R() * 0.1;
    const s = 0.08 + R() * 0.07;
    put(new THREE.IcosahedronGeometry(s, 0), i % 3 ? P.stone : P.stoneDark,
      [px + Math.cos(a) * rr, TOP + s * 0.3, pz + Math.sin(a) * rr],
      { scale: [1.2, 0.7, 1], rotation: [R() * 40, R() * 360, R() * 40] });
  }

  // Reeds
  const clumps: number[][] = [[0.3, 1.3, 0], [1.4, 0.7, 0.5], [-0.8, 0.6, 1], [1.3, 1.05, 1.5], [-0.7, -0.5, 2]];
  for (const [cx, cz, k] of clumps) {
    const bx = cx + (k < 1 ? 0 : 0);
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2;
      const h = 0.18 + R() * 0.12;
      const x = bx + Math.cos(a) * 0.07, z = cz + Math.sin(a) * 0.07 + (k < 0.2 ? 0.2 : 0);
      put(new THREE.ConeGeometry(0.02, h, 4), j % 2 ? P.reed : P.palmLeaf, [x, TOP + h / 2, z],
        { rotation: [Math.sin(a) * 12, 0, -Math.cos(a) * 12] });
    }
    put(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 5), P.palmTrunkDark, [bx, TOP + 0.11, cz + (k < 0.2 ? 0.2 : 0)]);
    put(new THREE.SphereGeometry(0.035, 5, 4), P.coconut, [bx, TOP + 0.24, cz + (k < 0.2 ? 0.2 : 0)], { scale: [1, 2.2, 1] });
  }

  // Pebbles
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2, rr = 1.6 + R() * 1.2;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (Math.hypot(x - px, z - pz) < 1.4) continue;
    const s = 0.025 + R() * 0.04;
    put(new THREE.DodecahedronGeometry(s, 0), R() > 0.5 ? P.stone : P.stoneDark, [x, TOP + s * 0.3, z], { rotation: [R() * 90, R() * 360, 0] });
  }

  // Dry grass tufts
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2, rr = 1.8 + R() * 1.0;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (Math.hypot(x - px, z - pz) < 1.5) continue;
    for (let j = 0; j < 3; j++) {
      put(new THREE.ConeGeometry(0.018, 0.16 + R() * 0.08, 4), j ? P.sandDark : P.palmTrunk,
        [x + (j - 1) * 0.03, TOP + 0.08, z], { rotation: [0, 0, (j - 1) * 22] });
    }
  }
}
    return buildTerrain;
  })(),
  // palms
  (() => {
function buildPalms({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const seg = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, col: string, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r0, a.distanceTo(c), sides, 1), col, {
      at: a.clone().add(c).multiplyScalar(0.5),
      dir: c.clone().sub(a).normalize(),
      flat: true,
    });
  const sph = (p: THREE.Vector3, r: number, col: string, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, scale: sc, flat: true });

  const palms = [
    { m: M.palmA, h: 2.4, lean: [0.35, 0.1], leaves: 9, extra: "bird" },
    { m: M.palmB, h: 2.1, lean: [-0.3, 0.2], leaves: 8, extra: "" },
    { m: M.palmC, h: 2.3, lean: [-0.2, -0.3], leaves: 8, extra: "" },
    { m: M.palmD, h: 1.65, lean: [0.25, -0.2], leaves: 7, extra: "lantern" },
  ];

  palms.forEach((pm, pi) => {
    const base = V(pm.m[0], pm.m[1], pm.m[2]);
    const n = 7;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push(V(base.x + pm.lean[0] * t * t * 0.9, base.y + pm.h * t, base.z + pm.lean[1] * t * t * 0.9));
    }
    for (let i = 0; i < n; i++) {
      const r0 = 0.12 * (1 - (i / n) * 0.45);
      const r1 = 0.12 * (1 - ((i + 1) / n) * 0.45);
      seg(pts[i], pts[i + 1], r0, r1, i % 2 ? P.palmTrunkDark : P.palmTrunk);
      if (i > 0) {
        b.part(new THREE.TorusGeometry(r0 + 0.005, 0.013, 4, 8), P.palmTrunkDark, {
          at: pts[i], dir: pts[i + 1].clone().sub(pts[i - 1]).normalize(), axis: "z",
        });
      }
    }
    const top = pts[n].clone();
    sph(top.clone().add(V(0, 0.05, 0)), 0.15, P.palmTrunkDark, [1, 0.8, 1]);
    // leaves
    for (let k = 0; k < pm.leaves; k++) {
      const a = (k / pm.leaves) * Math.PI * 2 + R() * 0.3;
      const dx = Math.sin(a), dz = Math.cos(a) * 0.55;
      const L = 0.7 + R() * 0.15;
      const w = 0.16;
      const outline: [number, number][] = [
        [0, 0], [L * 0.3, w * 0.9], [L * 0.7, w * 0.6], [L, -0.12, ], [L * 0.7, -w * 0.3], [L * 0.3, -w * 0.5],
      ] as any;
      const o = outline.map((q) => [q[0], q[1] + 0.0] as [number, number]);
      const at = top.clone().add(V(0, 0.12, 0));
      const x = V(dx, -0.35, dz).normalize();
      b.extrude(o, { at, x: [x.x, x.y, x.z], y: [0, 1, 0], thickness: 0.015, smoothing: 1,
        color: k % 2 ? P.palmLeaf : P.palmLeafDark });
      const tip = at.clone().add(x.clone().multiplyScalar(L));
      const mid = at.clone().add(x.clone().multiplyScalar(L * 0.5)).add(V(0, 0.02, 0));
      seg(at, mid, 0.012, 0.01, P.palmLeafDark, 4);
      seg(mid, tip, 0.01, 0.004, P.palmLeafDark, 4);
    }
    // coconuts
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + pi;
      sph(top.clone().add(V(Math.sin(a) * 0.13, -0.1 - (k % 2) * 0.04, Math.cos(a) * 0.13)), 0.065, P.coconut);
    }
    // dates
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + 0.5;
      sph(top.clone().add(V(Math.sin(a) * 0.2, -0.2, Math.cos(a) * 0.2)), 0.03, P.rugGold, [1, 1.5, 1]);
    }
    if (pm.extra === "bird") {
      const bp = top.clone().add(V(0.45, -0.28, 0.1));
      sph(bp, 0.07, P.tentBlue, [1, 0.8, 1.4]);
      sph(bp.clone().add(V(0, 0.07, 0.09)), 0.045, P.tentBlue);
      b.part(new THREE.ConeGeometry(0.02, 0.06, 4), P.rugGold, { at: bp.clone().add(V(0, 0.07, 0.15)), dir: [0, 0, 1] });
      b.part(new THREE.ConeGeometry(0.03, 0.12, 4), P.tentRed, { at: bp.clone().add(V(0, 0, -0.12)), dir: [0, 0, -1] });
      sph(bp.clone().add(V(0.035, 0.09, 0.12)), 0.01, P.ink);
      sph(bp.clone().add(V(-0.035, 0.09, 0.12)), 0.01, P.ink);
    }
    if (pm.extra === "lantern") {
      const hp = top.clone().add(V(0.3, -0.35, 0.15));
      seg(top.clone().add(V(0.1, -0.08, 0.05)), hp.clone().add(V(0, 0.12, 0)), 0.006, 0.006, P.ink, 4);
      b.part(new THREE.BoxGeometry(0.09, 0.12, 0.09), P.fireCore, { at: hp, flat: true });
      b.part(new THREE.ConeGeometry(0.07, 0.06, 4), P.tentRed, { at: hp.clone().add(V(0, 0.09, 0)), flat: true });
      b.part(new THREE.BoxGeometry(0.1, 0.02, 0.1), P.ink, { at: hp.clone().add(V(0, -0.07, 0)) });
    }
  });
}
    return buildPalms;
  })(),
  // tents
  (() => {
function buildTents({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, rotation: rot, flat: true });
  const cone = (r: number, h: number, seg: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.ConeGeometry(r, h, seg), c, { at, rotation: rot, flat: true });
  const sph = (r: number, c: string, at: number[], sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), c, { at, scale: sc, flat: true });

  const tent = (m: number[], main: string, rotY: number, tilt: number) => {
    const [cx, cy, cz] = m;
    const rot = rotY;
    const rp = (x: number, z: number) => [cx + x * Math.cos(rot) + z * Math.sin(rot), cz - x * Math.sin(rot) + z * Math.cos(rot)];
    // floor
    const fl = rp(0, 0);
    cyl(0.85, 0.9, 0.04, 8, P.sandDark, [fl[0], cy + 0.02, fl[1]]);
    // canopy: 8 wedge stripes as cone slices (thetaLength)
    const H = 1.45, Rr = 0.95;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const g = new THREE.ConeGeometry(Rr, H, 1, 1, true, (i / n) * Math.PI * 2, (Math.PI * 2) / n);
      g.translate(0, H / 2, 0);
      const col = i % 2 ? P.tentCream : main;
      const m2 = new THREE.Mesh(g);
      const gg = g.clone();
      gg.rotateY(rot);
      // double-sided via a second inverted-winding copy
      b.part(gg, col, { at: [cx, cy + tilt * 0, cz], flat: true });
      const g2 = new THREE.ConeGeometry(Rr * 0.985, H * 0.985, 1, 1, true, (i / n) * Math.PI * 2, (Math.PI * 2) / n);
      g2.translate(0, H / 2, 0);
      g2.rotateY(rot);
      const idx = g2.index!;
      for (let k = 0; k < idx.count; k += 3) {
        const t = idx.getX(k + 1);
        idx.setX(k + 1, idx.getX(k + 2));
        idx.setX(k + 2, t);
      }
      b.part(g2, col, { at: [cx, cy, cz], flat: true });
      void m2;
    }
    // scalloped trim at the hem
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rot;
      sph(0.09, i % 2 ? P.rugGold : P.tentCream, [cx + Math.sin(a) * Rr * 0.99, cy + 0.07, cz + Math.cos(a) * Rr * 0.99], [1, 0.8, 0.5]);
    }
    // door: dark interior + flaps tied open
    const d = rp(0, Rr * 0.7);
    const door = b.part(new THREE.ConeGeometry(0.34, 0.8, 3), P.ink, { at: [d[0], cy + 0.4, d[1]], rotation: [0, (rot * 180) / Math.PI, 0], flat: true });
    void door;
    for (const s of [1, -1]) {
      const f = rp(s * 0.3, Rr * 0.72);
      box(0.1, 0.78, 0.04, main, [f[0], cy + 0.4, f[1]], [0, (rot * 180) / Math.PI, s * -12]);
      const t = rp(s * 0.33, Rr * 0.74);
      sph(0.035, P.rugGold, [t[0], cy + 0.35, t[1]]);
    }
    // pole + finial
    cyl(0.02, 0.025, 0.3, 6, P.tentPole, [cx, cy + H + 0.1, cz]);
    sph(0.06, P.rugGold, [cx, cy + H + 0.28, cz]);
    cone(0.05, 0.12, 6, P.rugGold, [cx, cy + H + 0.38, cz]);
    // guy ropes and pegs
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rot + Math.PI / 4;
      const bx = cx + Math.sin(a) * 1.05, bz = cz + Math.cos(a) * 1.05;
      b.rod([cx + Math.sin(a) * 0.3, cy + H * 0.7, cz + Math.cos(a) * 0.3], [bx, cy + 0.05, bz], 0.008, P.tentPole);
      cone(0.025, 0.12, 5, P.tentPole, [bx, cy + 0.04, bz], [180, 0, 0]);
    }
    // rug in front
    const r = rp(0, 1.05);
    const deg = (rot * 180) / Math.PI;
    b.part(new THREE.BoxGeometry(0.9, 0.025, 0.6), P.rugGold, { at: [r[0], cy + 0.013, r[1]], rotation: [0, deg, 0] });
    b.part(new THREE.BoxGeometry(0.8, 0.03, 0.5), P.rug, { at: [r[0], cy + 0.018, r[1]], rotation: [0, deg, 0] });
    for (let i = -1; i <= 1; i++) {
      const q = rp(i * 0.22, 1.05);
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.034, 4), P.rugGold, { at: [q[0], cy + 0.02, q[1]], rotation: [0, deg + 45, 0] });
    }
    // cushions
    const c1 = rp(-0.2, 1.0), c2 = rp(0.25, 1.1);
    sph(0.13, main, [c1[0], cy + 0.09, c1[1]], [1, 0.5, 0.8]);
    sph(0.12, P.tentCream, [c2[0], cy + 0.08, c2[1]], [1, 0.5, 0.8]);
  };
  tent(M.tentLeft, P.tentRed, 0.3, 0);
  tent(M.tentRight, P.tentBlue, -0.4, 0);

  // clay pot and crate
  const [lx, ly, lz] = M.tentLeft;
  const px = lx + 1.15, pz = lz + 0.5;
  sph(0.15, "#b86a3c", [px, ly + 0.17, pz], [1, 1.1, 1]);
  cyl(0.09, 0.08, 0.06, 8, "#b86a3c", [px, ly + 0.34, pz]);
  cyl(0.1, 0.1, 0.02, 8, P.rugGold, [px, ly + 0.27, pz]);
  box(0.3, 0.26, 0.3, P.tentPole, [lx + 1.3, ly + 0.13, lz - 0.2], [0, 20, 0]);
  box(0.32, 0.03, 0.32, P.palmTrunkDark, [lx + 1.3, ly + 0.27, lz - 0.2], [0, 20, 0]);

  // bunting between tents
  const A = [M.tentLeft[0] + 0.3, 1.6, M.tentLeft[2] + 0.2];
  const B = [M.tentRight[0] - 0.3, 1.5, M.tentRight[2] + 0.2];
  const cols = [P.tentRed, P.rugGold, P.tentBlue, P.tentCream];
  const pts: number[][] = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - Math.sin(Math.PI * t) * 0.35, A[2] + (B[2] - A[2]) * t]);
  }
  for (let i = 0; i < N; i++) b.rod(pts[i], pts[i + 1], 0.008, P.tentPole);
  for (let i = 1; i < N; i++)
    cone(0.07, 0.18, 3, cols[i % 4], [pts[i][0], pts[i][1] - 0.09, pts[i][2]], [180, 0, 0]);

  // campfire
  const [fx, fy, fz] = M.campfire;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    sph(0.075, i % 2 ? P.stone : P.stoneDark, [fx + Math.cos(a) * 0.3, fy + 0.05, fz + Math.sin(a) * 0.3], [1, 0.7, 1]);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    cyl(0.035, 0.035, 0.4, 6, P.palmTrunkDark, [fx + Math.cos(a) * 0.1, fy + 0.1, fz + Math.sin(a) * 0.1], [Math.sin(a) * 65, 0, -Math.cos(a) * 65]);
  }
  glow(cone(0.17, 0.5, 6, P.fire, [fx, fy + 0.35, fz]), 1.4);
  glow(cone(0.1, 0.38, 6, P.fireCore, [fx + 0.02, fy + 0.3, fz]), 1.6);
  glow(cone(0.07, 0.3, 5, P.fire, [fx + 0.14, fy + 0.22, fz + 0.05], [0, 0, -15]), 1.3);
  glow(cone(0.06, 0.28, 5, P.fire, [fx - 0.13, fy + 0.2, fz - 0.04], [0, 0, 15]), 1.3);
  for (let i = 0; i < 3; i++) glow(sph(0.015, P.fireCore, [fx + (R() - 0.5) * 0.3, fy + 0.7 + R() * 0.2, fz + (R() - 0.5) * 0.3]), 1.5);
  void frame;
}
    return buildTents;
  })(),
  // camels
  (() => {
function buildCamels({ b, P, M }: any) {
  const R = rng(5);
  const FUR = P.camelFur, LIGHT = P.camelLight, DARK = P.camelDark, INK = P.ink;
  const RUG = P.rug, GOLD = P.rugGold;
  const Y = M.groundTop[1];

  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot, flat: true });
  const ball = (r: number, c: string, at: number[], sc: number[] = [1, 1, 1], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at, scale: sc, rotation: rot, flat: true });
  const cyl = (r0: number, r1: number, h: number, c: string, at: number[], rot: number[] = [0, 0, 0], seg = 7) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), c, { at, rotation: rot, flat: true });
  const rodp = (a: number[], c2: number[], r: number, c: string) => b.rod(a, c2, r, c, { sides: 6 });

  // Generic camel, local frame: +Z forward, origin on ground under the body centre.
  // opts: s scale, yaw degrees, lying
  function camel(ox: number, oz: number, s: number, yaw: number, lying: boolean, calf: boolean) {
    const a = yaw * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const T = (x: number, y: number, z: number) => [ox + (x * ca + z * sa) * s, Y + y * s, oz + (-x * sa + z * ca) * s];
    const rotY = (rx = 0, ry = 0, rz = 0) => [rx, yaw + ry, rz];
    const bodyY = lying ? 0.4 : 0.95;
    // body barrel
    const body = box(0.62, 0.55, 1.25, FUR, T(0, bodyY, 0), rotY());
    body.scale.set(s, s, s);
    const belly = box(0.5, 0.16, 1.0, LIGHT, T(0, bodyY - 0.26, 0), rotY());
    belly.scale.set(s, s, s);
    const rump = ball(0.34, FUR, T(0, bodyY, -0.6), [s * 0.9, s, s * 0.8], rotY());
    const chest = ball(0.34, FUR, T(0, bodyY + 0.02, 0.6), [s * 0.9, s, s * 0.8], rotY());
    // humps
    for (const z of [-0.22, 0.28]) {
      ball(0.26, FUR, T(0, bodyY + 0.42, z), [s * 0.95, s * 1.1, s * 1], rotY());
      ball(0.1, DARK, T(0, bodyY + 0.64, z), [s, s * 0.6, s], rotY());
    }
    // neck: stacked segments curving up
    const segs = 6;
    let hx = 0, hy = 0, hz = 0;
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1);
      const y = bodyY + 0.2 + t * 0.7 * (lying ? 1.0 : 1.05);
      const z = 0.65 + Math.sin(t * 1.8) * 0.3;
      const r = 0.14 - t * 0.03;
      ball(r * 1.15, i % 2 ? FUR : LIGHT, T(0, y, z), [s, s * 1.2, s], rotY(-20 + t * 30));
      ball(0.07, DARK, T(0, y + 0.05, z - 0.1), [s * 0.5, s, s * 1.2], rotY()); // mane
      hx = 0; hy = y; hz = z;
    }
    // head
    const hs = calf ? 1.3 : 1;
    const hp = T(0, hy + 0.06, hz + 0.12);
    const head = ball(0.17 * hs, FUR, hp, [s, s * 0.9, s * 1.2], rotY(10));
    const muz = ball(0.12 * hs, LIGHT, T(0, hy - 0.02, hz + 0.34 * hs), [s, s * 0.85, s * 1.15], rotY(10));
    ball(0.05 * hs, LIGHT, T(0, hy - 0.1, hz + 0.34 * hs), [s * 1.4, s * 0.5, s * 1.6], rotY()); // lower lip
    for (const sx of [1, -1]) {
      ball(0.025 * hs, INK, T(sx * 0.07, hy + 0.12 * hs, hz + 0.3 * hs), [s, s, s]); // nostril
      ball(0.03 * hs, INK, T(sx * 0.12 * hs, hy + 0.1, hz + 0.1), [s, s, s]); // eye
      ball(0.012, "#ffffff", T(sx * 0.14 * hs, hy + 0.12, hz + 0.12), [s, s, s]);
      ball(0.06, FUR, T(sx * 0.1 * hs, hy + 0.26 * hs, hz - 0.02), [s * 0.6, s * 1.2, s * 0.6], rotY(0, 0, sx * 20)); // ear
      for (let k = 0; k < 3; k++)
        rodp(T(sx * 0.13 * hs, hy + 0.14 + k * 0.012, hz + 0.1 + k * 0.01),
          T(sx * 0.17 * hs, hy + 0.2 + k * 0.025, hz + 0.1 + k * 0.012), 0.004, INK); // lashes
    }
    // bridle
    const bz = hz + 0.22 * hs;
    b.part(new THREE.TorusGeometry(0.115 * hs, 0.01, 4, 8), GOLD, { at: T(0, hy + 0.0, bz), rotation: rotY(10), scale: [s, s, s] });
    // legs
    const legs: number[][] = [[0.24, 0.5], [-0.24, 0.5], [0.24, -0.5], [-0.24, -0.5]];
    for (const [lx, lz] of legs) {
      if (lying) {
        box(0.16, 0.14, 0.55, FUR, T(lx * 1.15, 0.12, lz * 0.8 + 0.2), rotY()).scale.set(s, s, s);
        ball(0.09, DARK, T(lx * 1.15, 0.1, lz * 0.8 + 0.5), [s * 1.1, s * 0.7, s * 1.3]);
        ball(0.09, FUR, T(lx * 1.15, 0.2, lz * 0.8 - 0.05), [s, s, s]);
      } else {
        const top = T(lx, bodyY - 0.2, lz), knee = T(lx, 0.5, lz + (lz > 0 ? 0.04 : -0.05)), foot = T(lx, 0.08, lz);
        rodp(top, knee, 0.075 * s, FUR);
        ball(0.07, DARK, knee, [s, s, s]);
        rodp(knee, foot, 0.055 * s, FUR);
        cyl(0.07 * s, 0.075 * s, 0.07 * s, DARK, foot);
      }
    }
    // tail
    const tb = T(0, bodyY + 0.12, -0.72), tt = T(0, bodyY - 0.3, -0.84);
    rodp(tb, tt, 0.025 * s, DARK);
    ball(0.07, DARK, tt, [s * 0.8, s * 1.5, s * 0.8]);
    return { T, bodyY, rotY };
  }

  // Standing camel (faces toward pond: -X,-Z => yaw about -135)
  camel(M.camelStand[0], M.camelStand[2], 0.78, -125, false, false);
  // Lying camel
  const L = camel(M.camelLie[0], M.camelLie[2], 0.95, 50, true, false);
  // saddle blanket on lying camel
  const bl = box(0.7, 0.05, 0.6, RUG, L.T(0, L.bodyY + 0.3, 0.02), L.rotY(0, 0, 0));
  bl.scale.set(0.95, 0.95, 0.95);
  for (const z of [-0.29, 0.3]) {
    box(0.72, 0.055, 0.04, GOLD, L.T(0, L.bodyY + 0.3, z * 1.0), L.rotY()).scale.set(0.95, 0.95, 0.95);
  }
  for (const sx of [-1, 1])
    for (let k = 0; k < 4; k++) {
      const p = L.T(sx * 0.36, L.bodyY + 0.2, -0.25 + k * 0.17);
      ball(0.03, GOLD, p, [1, 1.6, 1]);
    }
  box(0.04, 0.5, 0.05, GOLD, L.T(0.0, L.bodyY + 0.0, 0.02), L.rotY()).scale.set(0.95, 0.95, 0.95); // strap
  // saddle straps on standing camel are handled by bridle; calf
  camel(M.camelCalf[0], M.camelCalf[2], 0.55, 20, false, true);
  // bell on calf
  const cp = [M.camelCalf[0] + 0.1, Y + 0.7, M.camelCalf[2] + 0.4];
  ball(0.04, GOLD, cp);
  ball(0.012, INK, [cp[0], cp[1] - 0.03, cp[2]]);
  // small pebbles/hoofprints
  for (let i = 0; i < 4; i++)
    ball(0.04, P.sandDark, [M.camelStand[0] - 0.6 + R() * 0.3 - i * 0.2, Y + 0.01, M.camelStand[2] - 0.6 - i * 0.15], [1.4, 0.3, 1]);
}
    return buildCamels;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
