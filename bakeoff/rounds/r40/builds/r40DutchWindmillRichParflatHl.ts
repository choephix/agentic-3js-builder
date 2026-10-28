import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Dutch Windmill (Animal Crossing)",
  "description": "A chunky, pastel, storybook Dutch tower windmill with a gallery deck, a teal shingled cap, four striped cloth sails and a tail pole, built in an Animal Crossing toy-diorama style."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  plinthStone: "#bdb5a6",
  plinthDark: "#918a7c",
  wallCream: "#f4e7c6",
  wallShade: "#e2cf9f",
  brick: "#cf6a4e",
  brickDark: "#a8503f",
  woodLight: "#dcab6e",
  woodWarm: "#b57b48",
  woodDark: "#7d4f2d",
  trimWhite: "#fff9ea",
  doorTeal: "#4fa3a5",
  roofTeal: "#5eb09a",
  roofTealDark: "#3f8878",
  sailCloth: "#fff3d8",
  sailStripe: "#ec7a5e",
  glass: "#92d6ea",
  glowWarm: "#ffd56b",
  iron: "#4d4a57",
  gold: "#f3c551",
  tulipRed: "#f0566a",
  tulipYellow: "#ffd84a",
  leaf: "#58a853",
  sack: "#dcc79b",
};
const M = {
  groundCenter: [0, 0, 0] as [number, number, number],
  plinthTop: [0, 1, 0] as [number, number, number],
  doorCenter: [0, 0, 3.05] as [number, number, number],
  galleryDeck: [0, 2.4, 0] as [number, number, number],
  galleryStairTop: [4.3, 2.4, -1.2] as [number, number, number],
  galleryStairBottom: [4.3, 0, 3.6] as [number, number, number],
  towerTop: [0, 8.6, 0] as [number, number, number],
  capRing: [0, 8.6, 0] as [number, number, number],
  shaftBase: [0, 9.6, 2.6] as [number, number, number],
  hub: [0, 9.6, 4] as [number, number, number],
  tailRoot: [0, 9, -2.55] as [number, number, number],
  tailFoot: [0, 0.35, -6.6] as [number, number, number],
  capstan: [1.2, 0, -6.4] as [number, number, number],
  lanternHook: [1.3, 2.2, 3.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // tower
  (() => {
function buildTower({ b, J, P, M }: any) {
  const bone = J.base;
  const R = rng(5);
  const K = 1 / 0.924;
  const ap = (y: number) => 3.0 - 0.1118 * (y - 1);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);
  const oct = (r0: number, r1: number, h: number, c: string, y: number) =>
    put(new THREE.CylinderGeometry(r1 * K, r0 * K, h, 8), c, [0, y + h / 2, 0], { rotation: [0, 22.5, 0] });

  // plinth
  oct(3.3, 3.3, 0.8, P.plinthStone, 0);
  oct(3.3, 3.0, 0.2, P.plinthDark, 0.8);
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    box(0.3, 0.2, 0.08, P.trimWhite, [Math.sin(a) * 3.31 * 0.95, 0.2 + R() * 0.5, Math.cos(a) * 3.31 * 0.95], { rotation: [0, a * 57.3, 0] });
  }
  // walls in stacked frusta
  const segs = [[1, 4.6, P.wallCream], [4.6, 4.9, P.brick], [4.9, 7.9, P.wallCream]] as any[];
  for (const [y0, y1, c] of segs) oct(ap(y0), ap(y1), y1 - y0, c, y0);
  // brick course lines
  put(new THREE.CylinderGeometry(ap(4.9) * K * 1.01, ap(4.6) * K * 1.01, 0.04, 8), P.brickDark, [0, 4.75, 0], { rotation: [0, 22.5, 0] });
  // cornice
  oct(ap(7.9) + 0.3, ap(8.6) + 0.25, 0.7, P.brick, 7.9);
  oct(ap(7.9) + 0.32, ap(7.9) + 0.32, 0.08, P.brickDark, 7.82);
  oct(ap(8.6) + 0.1, ap(8.6) + 0.1, 0.1, P.trimWhite, 8.5);
  // plaster lines
  for (let y = 1.9; y < 7.8; y += 0.9)
    if (y < 4.5 || y > 5) oct(ap(y) + 0.02, ap(y) + 0.02, 0.04, P.wallShade, y);
  // pilasters
  for (let i = 0; i < 8; i++) {
    const yaw = (i * 45 + 22.5) * Math.PI / 180;
    const ym = 4.8, r = ap(ym) * K + 0.05;
    put(new THREE.BoxGeometry(0.3, 7.6, 0.3), P.trimWhite, [Math.sin(yaw) * r, 4.8, Math.cos(yaw) * r], { rotation: [0, yaw * 57.3, 0] });
  }
  // brick blocks
  for (let i = 0; i < 8; i++) {
    const yaw = i * 45 * Math.PI / 180;
    for (let k = -1; k <= 1; k++) {
      const r = ap(4.75) + 0.05;
      const lx = k * 0.8;
      const px = Math.sin(yaw) * r + Math.cos(yaw) * lx, pz = Math.cos(yaw) * r - Math.sin(yaw) * lx;
      box(0.3, 0.14, 0.06, P.brickDark, [px, 4.75, pz], { rotation: [0, yaw * 57.3, 0] });
    }
  }

  // on-face placement: yaw deg, height, local x, outward offset
  const face = (yawDeg: number, y: number, lx: number, out: number) => {
    const yaw = yawDeg * Math.PI / 180, r = ap(y) + out;
    return { at: [Math.sin(yaw) * r + Math.cos(yaw) * lx, y, Math.cos(yaw) * r - Math.sin(yaw) * lx], rot: [0, yawDeg, 0] };
  };
  const onFace = (g: THREE.BufferGeometry, c: string, yaw: number, y: number, lx: number, out: number, o: any = {}) => {
    const f = face(yaw, y, lx, out);
    return put(g, c, f.at, { rotation: f.rot, ...o });
  };
  const disc = (r: number, d: number, seg = 14) => new THREE.CylinderGeometry(r, r, d, seg).rotateX(Math.PI / 2);

  // door porch
  box(1.7, 2.15, 0.6, P.trimWhite, [0, 1.075, 3.2]);
  box(1.7 * 0.8, 0.5, 0.04, P.trimWhite, [0, 2.2 - 0.07, 3.2]);
  box(1.1, 1.5, 0.06, P.doorTeal, [0, 0.75, 3.52]);
  put(disc(0.55, 0.06), P.doorTeal, [0, 1.5, 3.52]);
  for (let i = -2; i <= 2; i++) box(0.03, 1.95, 0.02, P.woodDark, [i * 0.2, 0.9, 3.56]);
  put(new THREE.SphereGeometry(0.07, 8, 6), P.gold, [0.35, 0.9, 3.6]);
  put(disc(0.2, 0.05), P.glass, [0, 1.95, 3.55]);
  put(new THREE.TorusGeometry(0.2, 0.04, 6, 14), P.woodLight, [0, 1.95, 3.55]);
  // tulip emblem helper
  const tulip = (yaw: number, y: number, lx: number, out: number, s: number, col: string) => {
    onFace(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.35 * s, 5), P.leaf, yaw, y - 0.1 * s, lx, out);
    for (const k of [-1, 0, 1]) onFace(new THREE.SphereGeometry(0.09 * s, 6, 5), col, yaw, y + 0.12 * s + (k === 0 ? 0.04 * s : 0), lx + k * 0.07 * s, out + 0.02);
    for (const k of [-1, 1]) onFace(new THREE.SphereGeometry(0.08 * s, 5, 4), P.leaf, yaw, y - 0.1 * s, lx + k * 0.1 * s, out, { scale: [1, 0.4, 0.5] });
  };
  put(new THREE.BoxGeometry(0.5, 0.02, 0.02), P.trimWhite, [0, 0, 0], { scale: [0, 0, 0] });
  tulip(0, 2.0, 0.0, 0.0, 0.0001, P.tulipRed);
  const emblem = () => {
    box(0.55, 0.01, 0.01, P.trimWhite, [0, 0, 0], { scale: [0, 0, 0] });
    for (const k of [-1, 0, 1]) put(new THREE.SphereGeometry(0.09, 6, 5), P.tulipRed, [k * 0.07, 2.02, 3.53]);
    for (const k of [-1, 1]) put(new THREE.SphereGeometry(0.08, 5, 4), P.leaf, [k * 0.12, 1.85, 3.53], { scale: [1, 0.4, 0.5] });
  };
  emblem();

  // windows
  const win = (yaw: number, y: number, round = false) => {
    const wallAp = ap(y);
    onFace(new THREE.BoxGeometry(0.85, 0.9, 0.14), P.trimWhite, yaw, y, 0, 0.0);
    onFace(disc(0.425, 0.14), P.trimWhite, yaw, y + 0.45, 0, 0);
    onFace(new THREE.BoxGeometry(0.62, 0.8, 0.06), P.glowWarm, yaw, y, 0, 0.08);
    onFace(disc(0.31, 0.06), P.glowWarm, yaw, y + 0.4, 0, 0.08);
    onFace(new THREE.BoxGeometry(0.05, 1.1, 0.05), P.trimWhite, yaw, y + 0.1, 0, 0.12);
    onFace(new THREE.BoxGeometry(0.6, 0.05, 0.05), P.trimWhite, yaw, y + 0.1, 0, 0.12);
    for (const s of [-1, 1]) onFace(new THREE.BoxGeometry(0.4, 1.0, 0.08), P.doorTeal, yaw, y + 0.1, s * 0.75, 0.04);
    onFace(new THREE.BoxGeometry(1.1, 0.12, 0.35), P.woodLight, yaw, y - 0.5, 0, 0.15);
    onFace(new THREE.CylinderGeometry(0.07, 0.05, 0.1, 6), P.tulipRed, yaw, y - 0.39, 0, 0.2);
    void wallAp; void round;
  };
  for (const [yw, y] of [[0, 5.7], [45, 5.7], [-45, 5.7], [90, 4.3], [-90, 4.3], [135, 6.9], [-135, 6.9], [180, 5.7]] as any[]) win(yw, y);
  for (const yw of [0, 180]) {
    onFace(disc(0.26, 0.1, 12), P.trimWhite, yw, 7.3, 0, 0.0);
    onFace(disc(0.19, 0.1, 12), P.glass, yw, 7.3, 0, 0.05);
  }
  // tulip pots on the near-door yaw
  tulip(0, 3.9, 0, 0.25, 1.0, P.tulipYellow);
  return;
}
    return buildTower;
  })(),
  // gallery
  (() => {
function buildGallery({ b, J, P, M }: any) {
  const bone = J.base;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], rotY = 0, rotX = 0, rotZ = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, {
      bone,
      at,
      rotation: [rotX, rotY, rotZ],
    });
  const ball = (r: number, c: string, at: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at });
  const cyl = (r: number, h: number, c: string, at: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at });

  // Octagon helpers: face i has yaw i*45deg, direction (sin, cos)
  const faceDir = (i: number) => {
    const a = (i * Math.PI) / 4;
    return [Math.sin(a), Math.cos(a)];
  };
  const cornerAt = (i: number, ap: number) => {
    const a = ((i + 0.5) * Math.PI) / 4;
    return [(Math.sin(a) * ap) / 0.924, (Math.cos(a) * ap) / 0.924];
  };

  // Deck slab
  const deckGeo = (ap: number, y0: number, y1: number) =>
    b.lathe(
      [
        [0, y0],
        [ap / 0.924, y0],
        [ap / 0.924, y1],
        [0, y1],
      ],
      { at: [0, 0, 0], segments: 8, spin: 22.5, bone, color: P.woodWarm },
    );
  deckGeo(3.7, 2.2, 2.5);
  // fascia rim board
  for (let i = 0; i < 8; i++) {
    const [dx, dz] = faceDir(i);
    box(2.85, 0.22, 0.12, P.woodDark, [dx * 3.72, 2.3, dz * 3.72], (i * 45 * Math.PI) / 180 * (180 / Math.PI));
    box(2.7, 0.08, 0.12, P.woodLight, [dx * 3.74, 2.44, dz * 3.74], i * 45);
  }
  // plank seams
  for (let k = -3; k <= 3; k++) {
    const half = Math.sqrt(Math.max(0.1, 3.9 * 3.9 - 0)) ;
    const len = 2 * Math.min(3.6, 3.7 / 0.924 * 0.92 - Math.abs(k) * 0.35);
    box(0.04, 0.02, Math.min(len, 6.8), P.woodDark, [k * 0.9, 2.51, 0]);
  }

  // corbels
  for (let i = 0; i < 8; i++) {
    const [dx, dz] = faceDir(i);
    const ap = 3.0 - 0.1118 * (2.2 - 1);
    const r = (ap + 3.55) / 2;
    b.part(new THREE.BoxGeometry(0.4, 0.16, 0.8), P.woodLight, {
      bone,
      at: [dx * (ap + 0.35), 2.0, dz * (ap + 0.35)],
      rotation: [0, i * 45, 0],
    });
    box(0.4, 0.35, 0.16, P.woodLight, [dx * (ap + 0.12), 1.95, dz * (ap + 0.12)], i * 45);
    box(0.3, 0.12, 0.75, P.woodDark, [dx * r, 2.12, dz * r], i * 45);
  }

  // Railing, gap on +X side (faces 2, with corners near 1.5..2.5)
  const inGap = (x: number, z: number) => x > 2.5 && Math.abs(z) < 1.9;
  const ap = 3.55;
  const posts: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const c = cornerAt(i, ap);
    posts.push(c);
    const [dx, dz] = faceDir(i);
    const m = [dx * ap, dz * ap];
    posts.push(m);
  }
  for (const [x, z] of posts) {
    if (inGap(x, z)) continue;
    box(0.2, 1.0, 0.2, P.woodLight, [x, 3.0, z]);
    ball(0.15, P.gold, [x, 3.62, z]);
  }
  for (let i = 0; i < 8; i++) {
    const [dx, dz] = faceDir(i);
    const cx = dx * ap, cz = dz * ap;
    const side = 2 * ap * Math.tan(Math.PI / 8);
    if (inGap(cx, cz)) continue;
    box(side, 0.14, 0.14, P.woodLight, [cx, 3.45, cz], i * 45);
    box(side, 0.1, 0.1, P.trimWhite, [cx, 3.0, cz], i * 45);
    for (let k = -1; k <= 1; k += 2) box(0.07, 0.8, 0.07, P.woodLight, [cx + -dz * k * side * 0.25, 3.0, cz + dx * k * side * 0.25]);
  }

  // Stairs +X side, ground at z 3.6 up to z -1.2 at y 2.4
  const sx = 4.3;
  for (let i = 0; i < 8; i++) {
    const z = 3.3 - i * 0.6;
    const y = 0.3 * (i + 1);
    box(1.4, 0.12, 0.62, P.woodWarm, [sx, y - 0.06, z]);
    box(1.4, 0.3, 0.06, P.woodLight, [sx, y - 0.17, z + 0.3]);
  }
  const len = Math.hypot(4.8, 2.4);
  const ang = Math.atan2(2.4, 4.8);
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.3, len), P.woodDark, {
      bone,
      at: [sx + s * 0.65, 1.1, 1.2],
      rotation: [(ang * 180) / Math.PI, 0, 0],
    });
  }
  // landing
  box(1.5, 0.2, 2.6, P.woodWarm, [sx, 2.3, -1.5]);
  box(1.5, 0.1, 0.1, P.woodDark, [sx, 2.18, -2.75]);
  for (let k = 0; k < 4; k++) box(1.45, 0.02, 0.04, P.woodDark, [sx, 2.41, -0.5 - k * 0.6]);
  // handrail outer side x = 5.0
  const rx = 5.0;
  for (let i = 0; i <= 8; i++) {
    const z = 3.3 - i * 0.6;
    if (i % 2 === 0) box(0.1, 1.0, 0.1, P.woodLight, [rx, 0.3 * (i + 1) + 0.4, z]);
  }
  b.part(new THREE.BoxGeometry(0.12, 0.12, len), P.woodLight, {
    bone,
    at: [rx, 1.85, 1.2],
    rotation: [(ang * 180) / Math.PI, 0, 0],
  });
  box(0.1, 1.0, 0.1, P.woodLight, [rx, 2.9, -2.6]);
  box(0.12, 0.12, 1.0, P.woodLight, [rx, 3.35, -2.1]);
  box(0.1, 0.1, 1.0, P.trimWhite, [rx, 2.95, -2.1]);
  ball(0.12, P.gold, [rx, 3.5, -2.6]);

  // hanging tulip board at landing
  box(0.7, 0.8, 0.06, P.trimWhite, [rx - 0.02, 2.95, -0.9], 90);
  box(0.06, 0.04, 0.04, P.woodDark, [rx, 3.4, -0.9]);
  const tx = rx + 0.05;
  for (const dz of [-0.12, 0, 0.12]) ball(0.09, P.tulipRed, [tx, 3.05, -0.9 + dz]);
  box(0.04, 0.3, 0.04, P.leaf, [tx, 2.8, -0.9]);
  box(0.04, 0.12, 0.2, P.leaf, [tx, 2.75, -0.8]);
  box(0.04, 0.12, 0.2, P.leaf, [tx, 2.75, -1.0]);

  // lantern hooks
  for (const [x, z] of [[1.3, 3.5], [-1.3, 3.5], [0, -3.5]]) {
    box(0.08, 0.3, 0.08, P.iron, [x, 2.05, z]);
    box(0.08, 0.08, 0.3, P.iron, [x, 1.9, z + 0.1]);
    ball(0.07, P.iron, [x, 1.9, z + 0.25]);
  }
  // rope coils on railing
  for (const [x, z, yaw] of [[-2.5, 2.5, 45], [2.0, -2.6, 150]] as number[][]) {
    const d = Math.PI * yaw / 180;
    b.part(new THREE.TorusGeometry(0.22, 0.06, 6, 12), P.woodLight, {
      bone,
      at: [x, 3.05, z],
      rotation: [0, yaw + 90, 0],
    });
    b.part(new THREE.TorusGeometry(0.17, 0.05, 6, 12), P.woodLight, {
      bone,
      at: [x, 3.05, z],
      rotation: [0, yaw + 90, 0],
    });
  }
  return;
}
    return buildGallery;
  })(),
  // cap
  (() => {
function buildCap({ b, J, P, M }: Ctx) {
  const bone = J.cap;
  const R0 = 2.6;
  const Y0 = 8.6;

  const part = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });

  // rim ring: woodDark base + trimWhite band
  b.lathe([[0, 0], [2.7, 0], [2.7, 0.14], [0, 0.14]], { at: [0, Y0, 0], bone, segments: 16, color: P.woodDark });
  b.lathe([[0, 0], [2.68, 0], [2.68, 0.16], [0, 0.16]], { at: [0, Y0 + 0.14, 0], bone, segments: 16, color: P.trimWhite });
  b.lathe([[0, 0], [2.62, 0], [2.62, 0.04], [0, 0.04]], { at: [0, Y0 + 0.3, 0], bone, segments: 16, color: P.woodDark });

  // onion dome profile
  const prof: [number, number][] = [
    [0, 0.3], [2.6, 0.3], [2.62, 0.75], [2.4, 1.3], [1.9, 1.85], [1.3, 2.4], [0.7, 2.8], [0.25, 3.0], [0, 3.05],
  ];
  const domeR = (h: number) => {
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, h0] = prof[i], [r1, h1] = prof[i + 1];
      if (h >= h0 && h <= h1) return r0 + ((r1 - r0) * (h - h0)) / (h1 - h0 || 1);
    }
    return 0;
  };
  b.lathe(prof.map(([r, h]) => [r, h] as [number, number]), {
    at: [0, Y0, 0], bone, segments: 16, color: P.roofTeal,
  });

  // shingle bands
  for (let i = 0; i < 6; i++) {
    const h = 0.55 + i * 0.4;
    const r = domeR(h) + 0.04;
    const col = i % 2 ? P.roofTeal : P.roofTealDark;
    const n = Math.max(6, Math.round(16 * (r / 2.6)) );
    b.lathe([[r - 0.1, 0], [r + 0.05, -0.05], [r + 0.08, 0.1], [r - 0.1, 0.2]], {
      at: [0, Y0 + h, 0], bone, segments: 16, color: col,
    });
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (i % 2) * 0.2;
      part(new THREE.SphereGeometry(0.17 * (r / 2.6) + 0.06, 6, 4), col, [Math.sin(a) * (r + 0.02), Y0 + h - 0.03, Math.cos(a) * (r + 0.02)], { scale: [1, 0.55, 0.6], dir: [Math.sin(a), 0, Math.cos(a)], axis: "z" });
    }
  }

  // peak ring + acorn finial + vane
  const top = Y0 + 3.05;
  part(new THREE.CylinderGeometry(0.28, 0.34, 0.12, 10), P.gold, [0, top - 0.1, 0]);
  part(new THREE.SphereGeometry(0.22, 8, 6), P.gold, [0, top + 0.12, 0], { scale: [1, 1.2, 1] });
  part(new THREE.ConeGeometry(0.1, 0.18, 8), P.gold, [0, top + 0.4, 0]);
  b.rod([0, top + 0.3, 0], [0, top + 0.85, 0], 0.025, { bone, color: P.iron });
  part(new THREE.ConeGeometry(0.1, 0.5, 4), P.gold, [0, top + 0.7, 0.3], { dir: [0, 0, 1] });
  part(new THREE.BoxGeometry(0.03, 0.03, 0.7), P.iron, [0, top + 0.7, 0]);
  part(new THREE.BoxGeometry(0.04, 0.22, 0.2), P.gold, [0, top + 0.72, -0.4]);
  part(new THREE.SphereGeometry(0.06, 6, 4), P.tulipRed, [0, top + 0.78, -0.4]);

  // nose housing
  part(new THREE.BoxGeometry(1.7, 1.5, 1.2), P.woodWarm, [0, 9.55, 2.1]);
  part(new THREE.CylinderGeometry(0.85, 0.85, 1.2, 12), P.woodLight, [0, 9.6, 2.6], { rotation: [90, 0, 0], scale: [1, 1, 0.9] });
  part(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 12), P.trimWhite, [0, 9.6, 3.2], { rotation: [90, 0, 0] });
  part(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 10), P.woodDark, [0, 9.6, 3.27], { rotation: [90, 0, 0] });

  // dormers
  for (const s of [1, -1]) {
    const a = (s * 70 * Math.PI) / 180;
    const h = 1.0;
    const r = domeR(h);
    const d = [Math.sin(a), 0, Math.cos(a)];
    const at = [d[0] * (r + 0.05), Y0 + h + 0.35, d[2] * (r + 0.05)];
    part(new THREE.BoxGeometry(0.8, 0.8, 0.4), P.trimWhite, at, { dir: d, axis: "z" });
    part(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 10, 1, false, 0, Math.PI), P.trimWhite, [at[0], at[1] + 0.4, at[2]], { dir: d, axis: "z", rotation: [0, 0, 0] });
    const ga = [d[0] * 0.22, 0, d[2] * 0.22];
    part(new THREE.BoxGeometry(0.55, 0.6, 0.1), P.glowWarm, [at[0] + ga[0], at[1] - 0.02, at[2] + ga[2]], { dir: d, axis: "z" });
    part(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 10), P.glowWarm, [at[0] + ga[0], at[1] + 0.28, at[2] + ga[2]], { rotation: [90, 0, 0], dir: d, axis: "z" });
    part(new THREE.ConeGeometry(0.58, 0.4, 4), P.roofTealDark, [at[0], at[1] + 0.75, at[2]], { rotation: [0, s * 70 + 45, 0] });
  }

  // back hatch
  part(new THREE.BoxGeometry(0.7, 0.6, 0.15), P.woodDark, [0, Y0 + 1.1, -domeR(1.1) - 0.03]);
  part(new THREE.BoxGeometry(0.55, 0.45, 0.06), P.woodLight, [0, Y0 + 1.1, -domeR(1.1) - 0.1]);
  part(new THREE.SphereGeometry(0.05, 6, 4), P.gold, [0, Y0 + 1.1, -domeR(1.1) - 0.14]);

  // tail root beam stub + bracket
  part(new THREE.BoxGeometry(0.5, 0.45, 1.0), P.woodDark, [0, 9.0, -2.3]);
  part(new THREE.BoxGeometry(0.62, 0.55, 0.12), P.iron, [0, 9.0, -2.0]);
  part(new THREE.BoxGeometry(0.62, 0.12, 0.5), P.iron, [0, 9.28, -2.3]);

  // tulip emblems on rim boards
  const cols = [P.tulipRed, P.tulipYellow, P.tulipRed];
  [-110, 110, 180].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const d = [Math.sin(a), 0, Math.cos(a)];
    const c = [d[0] * 2.72, Y0 + 0.22, d[2] * 2.72];
    part(new THREE.BoxGeometry(0.5, 0.3, 0.06), P.trimWhite, c, { dir: d, axis: "z" });
    const f = [d[0] * 0.04, 0, d[2] * 0.04];
    part(new THREE.SphereGeometry(0.07, 6, 4), cols[i], [c[0] + f[0], c[1] + 0.04, c[2] + f[2]]);
    part(new THREE.BoxGeometry(0.02, 0.1, 0.02), P.leaf, [c[0] + f[0], c[1] - 0.06, c[2] + f[2]]);
  });
}
    return buildCap;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.sailHub;
  const HUB = M.hub;
  const hx = HUB[0], hy = HUB[1], hz = HUB[2];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 12) => new THREE.CylinderGeometry(r, r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // axle along +Z from z 2.6 to hub
  put(cyl(0.16, 1.5, 10), P.woodDark, [hx, hy, 3.35], { dir: [0, 0, 1] });
  // gold collar
  put(cyl(0.26, 0.18, 12), P.gold, [hx, hy, 3.3], { dir: [0, 0, 1] });
  // hub disc, rim, bolts
  put(cyl(0.5, 0.5, 16), P.woodWarm, [hx, hy, 4.1], { dir: [0, 0, 1] });
  put(new THREE.TorusGeometry(0.5, 0.06, 6, 16), P.trimWhite, [hx, hy, 4.36]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(new THREE.SphereGeometry(0.05, 6, 4), P.iron, [hx + Math.cos(a) * 0.38, hy + Math.sin(a) * 0.38, 4.38]);
  }
  // spinner
  put(new THREE.ConeGeometry(0.42, 0.55, 12), P.tulipRed, [hx, hy, 4.58], { dir: [0, 0, 1] });
  put(new THREE.SphereGeometry(0.1, 8, 6), P.gold, [hx, hy, 4.92]);

  const R = rng(5);
  for (let k = 0; k < 4; k++) {
    const ang = (45 + 90 * k) * Math.PI / 180;
    // direction from up, clockwise-ish: dx = sin, dy = cos
    const ux = Math.sin(ang), uy = Math.cos(ang);
    const px = -uy, py = ux; // perpendicular (lattice side)
    const rot = -ang;
    const P3 = (r: number, s: number, z: number) => [hx + ux * r + px * s, hy + uy * r + py * s, z];
    const bar = (r0: number, r1: number, s: number, w: number, d: number, z: number, c: string) =>
      put(box(w, r1 - r0, d), c, P3((r0 + r1) / 2, s, z), { rotation: [0, 0, rot * 180 / Math.PI] });
    const cross = (r: number, s0: number, s1: number, h: number, d: number, z: number, c: string) =>
      put(box(s1 - s0, h, d), c, P3(r, (s0 + s1) / 2, z), { rotation: [0, 0, rot * 180 / Math.PI] });

    // stock + highlight
    bar(0, 5.2, 0, 0.2, 0.2, 4.1, P.woodWarm);
    bar(0.3, 5.1, 0, 0.06, 0.04, 4.22, P.woodLight);
    // iron tip cap
    put(box(0.26, 0.2, 0.26), P.iron, P3(5.25, 0, 4.1), { rotation: [0, 0, rot * 180 / Math.PI] });
    // outer rail
    bar(1.0, 5.2, 1.3, 0.12, 0.14, 4.15, P.woodLight);
    // battens (7)
    for (let i = 0; i < 7; i++) {
      const r = 1.0 + (i * 4.2) / 6;
      cross(r, 0, 1.3, 0.12, 0.14, 4.15, P.woodLight);
    }
    cross(5.2, 0, 1.3, 0.14, 0.14, 4.15, P.woodLight);
    // cloth in 6 cells, stripes on alternate
    const cells = 6;
    for (let i = 0; i < cells; i++) {
      const r0 = 1.2 + (i * 3.9) / cells + 0.04, r1 = 1.2 + ((i + 1) * 3.9) / cells - 0.04;
      const stripe = i % 2 === 1;
      put(box(1.1, r1 - r0, 0.05), P.sailCloth, P3((r0 + r1) / 2, 0.7, 4.15), { rotation: [0, 0, rot * 180 / Math.PI] });
      if (stripe)
        put(box(1.12, (r1 - r0) * 0.35, 0.05), P.sailStripe, P3((r0 + r1) / 2, 0.7, 4.185), { rotation: [0, 0, rot * 180 / Math.PI] });
    }
    // tulip motif near root (cell 0)
    const rr = 1.8, ss = 0.7, zz = 4.19;
    const rd = rot * 180 / Math.PI;
    put(cyl(0.025, 0.4, 5), P.leaf, P3(rr, ss, zz), { rotation: [0, 0, rd] });
    put(new THREE.SphereGeometry(0.13, 6, 5), P.tulipRed, P3(rr + 0.25, ss, zz + 0.02));
    put(new THREE.ConeGeometry(0.09, 0.3, 4), P.leaf, P3(rr - 0.05, ss + 0.15, zz), { rotation: [0, 0, rd - 50] });
    put(new THREE.ConeGeometry(0.09, 0.3, 4), P.leaf, P3(rr - 0.05, ss - 0.15, zz), { rotation: [0, 0, rd + 50] });
  }
}
    return buildSails;
  })(),
  // tailPole
  (() => {
function buildTailPole({ b, J, P, M }: any) {
  const bone = J.cap;
  const R = rng(5);
  const top = new THREE.Vector3(...(M.tailRoot as [number, number, number]));
  const foot = new THREE.Vector3(...(M.tailFoot as [number, number, number]));
  const dir = foot.clone().sub(top);
  const len = dir.length();
  const at = (t: number, x = 0) => [x, top.y + dir.y * t, top.z + dir.z * t] as [number, number, number];

  // rails
  for (const s of [1, -1]) {
    b.rod(at(0, s * 0.22), at(1, s * 0.22), 0.12, P.woodWarm, { bone, sides: 6 });
    // foot cap
    b.part(new THREE.SphereGeometry(0.13, 6, 4), P.woodDark, { bone, at: at(1, s * 0.22) });
  }
  // rungs
  const n = Math.floor(len / 0.7);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    b.rod(at(t, -0.22), at(t, 0.22), 0.06, P.woodLight, { bone, sides: 6 });
  }
  // top yoke and bracket
  b.part(new THREE.BoxGeometry(0.8, 0.3, 0.3), P.woodDark, { bone, at: [0, top.y, top.z + 0.05] });
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.38), P.iron, { bone, at: [0, top.y + 0.2, top.z + 0.05] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.gold, { bone, at: [s * 0.35, top.y + 0.27, top.z + 0.05] });

  // brace
  b.rod(at(0.45, -0.22), at(0.75, 0.22), 0.07, P.woodDark, { bone, sides: 6 });
  b.rod(at(0.45, 0.22), at(0.75, -0.22), 0.07, P.woodDark, { bone, sides: 6 });

  // rope coil hanging
  const cp = at(0.62, 0);
  b.part(new THREE.TorusGeometry(0.2, 0.05, 6, 12), P.woodLight, { bone, at: [0, cp[1] - 0.1, cp[2] + 0.02], rotation: [0, 90, 0] });
  b.part(new THREE.TorusGeometry(0.16, 0.05, 6, 12), P.woodLight, { bone, at: [0, cp[1] - 0.1, cp[2] + 0.02], rotation: [0, 90, 0] });

  // stakes with iron rings
  for (const s of [1, -1]) {
    const sx = s * 0.75;
    b.rod([sx, 0.5, -6.45], [sx, -0.02, -6.65], 0.09, P.woodDark, { bone, sides: 6 });
    b.part(new THREE.TorusGeometry(0.1, 0.025, 5, 10), P.iron, { bone, at: [sx, 0.5, -6.4], rotation: [90, 0, 0] });
    b.rod([s * 0.22, 0.35, -6.6], [sx, 0.5, -6.45], 0.03, P.iron, { bone });
  }

  // capstan
  const c = M.capstan as [number, number, number];
  b.part(new THREE.CylinderGeometry(0.42, 0.48, 0.14, 10), P.plinthStone, { bone, at: [c[0], 0.07, c[2]] });
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 1.1, 10), P.woodWarm, { bone, at: [c[0], 0.65, c[2]] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12), P.woodLight, { bone, at: [c[0], 1.25, c[2]] });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    const ex = c[0] + Math.cos(a) * 0.65, ez = c[2] + Math.sin(a) * 0.65;
    b.rod([c[0], 0.95, c[2]], [ex, 0.95, ez], 0.05, P.woodLight, { bone, sides: 6 });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), P.woodLight, { bone, at: [ex, 0.95, ez] });
  }
  // rope winding and run toward pole foot
  for (let i = 0; i < 3; i++)
    b.part(new THREE.TorusGeometry(0.22, 0.04, 5, 10), P.woodLight, { bone, at: [c[0], 0.4 + i * 0.12, c[2]], rotation: [90, 0, 0] });
  b.rod([c[0] - 0.22, 0.5, c[2]], [0.3, 0.3, -6.6], 0.04, P.woodLight, { bone });

  // plate with tulip
  const px = c[0], pz = c[2] + 0.22;
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.02), P.trimWhite, { bone, at: [px, 0.65, pz] });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), P.tulipRed, { bone, at: [px, 0.69, pz + 0.02] });
  b.part(new THREE.BoxGeometry(0.015, 0.09, 0.01), P.leaf, { bone, at: [px, 0.6, pz + 0.02] });

  // weathered stones
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + R() * 0.3;
    const r = 0.65 + R() * 0.2;
    const sz = 0.1 + R() * 0.08;
    b.part(new THREE.DodecahedronGeometry(sz, 0), P.plinthDark, { bone, at: [c[0] + Math.cos(a) * r, sz * 0.7, c[2] + Math.sin(a) * r] });
  }
}
    return buildTailPole;
  })(),
  // doorYard
  (() => {
function buildDoorYard({ b, J, P, M }: any) {
  const bone = J.base;
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z] });
  const ball = (rad: number, c: string, x: number, y: number, z: number, sy = 1) =>
    b.part(new THREE.SphereGeometry(rad, 8, 6), c, { bone, at: [x, y, z], scale: [1, sy, 1] });

  const tulip = (x: number, y: number, z: number, h: number, c: string) => {
    cyl(0.015, 0.015, h, P.leaf, x, y + h / 2, z, 5);
    ball(0.065, c, x, y + h + 0.03, z, 1.2);
    b.part(new THREE.ConeGeometry(0.05, 0.08, 5), c, { bone, at: [x, y + h + 0.1, z] });
    box(0.1, 0.02, 0.04, P.leaf, x + 0.05, y + h * 0.4, z, 0.5);
  };

  // flagstone path
  for (let i = 0; i < 6; i++) {
    const z = 3.2 + i * 0.28;
    const w = 0.5 + r() * 0.3;
    b.part(new THREE.CylinderGeometry(w, w, 0.06, 7), i % 2 ? P.plinthStone : P.plinthDark, {
      bone, at: [(r() - 0.5) * 0.3, 0.03, z], scale: [1, 1, 0.5],
    });
  }
  // doormat
  box(1.0, 0.05, 0.6, P.woodWarm, 0, 0.07, 3.75);
  box(0.9, 0.055, 0.08, P.sailStripe, 0, 0.075, 3.75);

  // planters
  for (const s of [-1, 1]) {
    const x = s * 2.0;
    box(0.9, 0.7, 0.5, P.woodLight, x, 0.35, 3.5);
    box(0.92, 0.08, 0.52, P.woodDark, x, 0.15, 3.5);
    box(0.92, 0.08, 0.52, P.woodDark, x, 0.55, 3.5);
    box(0.8, 0.05, 0.4, "#6b4a2e", x, 0.7, 3.5);
    for (let i = 0; i < 6; i++)
      tulip(x - 0.34 + i * 0.136, 0.72, 3.5 + (i % 2 ? 0.08 : -0.08), 0.35 + r() * 0.2, i % 2 ? P.tulipRed : P.tulipYellow);
    // fenced bed on outer side
    const bx = s * 3.0;
    for (let i = 0; i < 4; i++) {
      box(0.06, 0.35, 0.06, P.trimWhite, bx - 0.3 + i * 0.2, 0.18, 4.35);
      ball(0.05, P.trimWhite, bx - 0.3 + i * 0.2, 0.37, 4.35);
    }
    box(0.8, 0.05, 0.05, P.trimWhite, bx, 0.28, 4.35);
    for (let i = 0; i < 3; i++) tulip(bx - 0.25 + i * 0.25, 0.02, 4.1, 0.25 + r() * 0.1, i % 2 ? P.tulipYellow : P.tulipRed);
  }

  // barrels
  for (const [x, z] of [[-2.7, 3.8], [-2.4, 4.3]]) {
    cyl(0.3, 0.26, 0.7, P.woodWarm, x, 0.35, z, 12);
    for (const y of [0.15, 0.55]) cyl(0.31, 0.31, 0.04, P.iron, x, y, z, 12);
    cyl(0.27, 0.27, 0.02, P.woodLight, x, 0.7, z, 12);
  }
  // sacks
  const sacks: [number, number, number][] = [[2.6, 3.7, 0], [3.1, 3.7, 0], [2.85, 3.75, 1]];
  for (const [x, z, up] of sacks) {
    const y = up ? 0.7 : 0.3;
    ball(0.3, P.sack, x, y, z, 1.0);
    cyl(0.07, 0.1, 0.12, P.sack, x, y + 0.3, z, 6);
    cyl(0.085, 0.085, 0.03, P.sailStripe, x, y + 0.26, z, 6);
    box(0.14, 0.14, 0.02, P.brick, x, y, z + 0.29);
  }
  box(0.4, 0.35, 0.4, P.woodLight, 2.0, 0.18, 4.3, 0.3);
  box(0.42, 0.04, 0.05, P.woodDark, 2.0, 0.2, 4.5, 0.3);

  // lantern
  const [lx, ly, lz] = M.lanternHook;
  box(0.05, 0.05, 0.5, P.iron, lx, ly - 0.05, lz - 0.2);
  cyl(0.01, 0.01, 0.3, P.iron, lx, ly - 0.2, lz);
  cyl(0.08, 0.14, 0.08, P.gold, lx, ly - 0.38, lz, 8);
  const body = b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.26, 8), P.glowWarm, { bone, at: [lx, ly - 0.55, lz] });
  try { const mat = body.mesh.material; mat.emissive?.set(P.glowWarm); mat.emissiveIntensity = 1.2; } catch (e) {}
  ball(0.04, P.tulipRed, lx, ly - 0.55, lz + 0.13);
  cyl(0.1, 0.12, 0.05, P.gold, lx, ly - 0.7, lz, 8);

  // signboard
  const sx = -1.5, sz = 4.1;
  box(0.1, 1.2, 0.1, P.woodDark, sx, 0.6, sz);
  box(0.9, 0.55, 0.08, P.woodLight, sx, 1.1, sz + 0.06);
  box(0.76, 0.42, 0.03, P.trimWhite, sx, 1.1, sz + 0.12);
  tulip(sx - 0.12, 0.98, sz + 0.15, 0.1, P.tulipRed);
  for (let i = 0; i < 3; i++) box(0.22 - i * 0.04, 0.03, 0.01, P.woodDark, sx + 0.2, 1.2 - i * 0.07, sz + 0.14);

  // bench
  box(0.9, 0.08, 0.35, P.woodLight, 1.35, 0.4, 3.2 + 0.1);
  box(0.9, 0.3, 0.05, P.woodLight, 1.35, 0.65, 3.05);
  for (const dx of [-0.38, 0.38]) box(0.07, 0.4, 0.3, P.woodDark, 1.35 + dx, 0.2, 3.3);

  // pebbles and tufts
  for (let i = 0; i < 6; i++)
    ball(0.05 + r() * 0.04, i % 2 ? P.plinthStone : P.plinthDark, -1.2 + r() * 2.4 + (i > 3 ? 1.5 : 0), 0.03, 4.3 + r() * 0.25, 0.6);
  for (let i = 0; i < 4; i++) {
    const gx = -3.2 + i * 2.1;
    for (let k = 0; k < 3; k++)
      b.part(new THREE.ConeGeometry(0.03, 0.2, 4), P.leaf, { bone, at: [gx + k * 0.05, 0.1, 4.5], rotation: [0, 0, (k - 1) * 20] });
  }
}
    return buildDoorYard;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dutchWindmill" });
  const J: Record<string, Joint> = {};
  J["base"] = b.joint("base", { at: [0,0,0], dir: [0,1,0], role: "spine" });
  J["cap"] = b.joint("cap", { parent: J["base"], at: [0,8.6,0], dir: [0,1,0], role: "hinge", group: "cap" });
  J["sailHub"] = b.joint("sailHub", { parent: J["cap"], at: [0,9.6,4], dir: [0,0,1], role: "hinge", group: "sails" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
