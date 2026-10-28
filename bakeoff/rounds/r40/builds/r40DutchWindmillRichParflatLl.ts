import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Dutch Windmill",
  "description": "A chunky Animal Crossing style Dutch windmill with a stone base, tapered brick tower, thatched cap, four lattice sails and a little gallery with a door, windows and a tail pole."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  stone: "#b9b2a3",
  stoneDark: "#8f887a",
  plaster: "#f6ecd2",
  plasterShade: "#e3d3ad",
  brick: "#d9835f",
  wood: "#9a6a3f",
  woodDark: "#6b4528",
  woodLight: "#c99a62",
  roof: "#c4553f",
  roofDark: "#9c3f30",
  thatch: "#e0b85a",
  cloth: "#fff8e8",
  glass: "#8fd3e8",
  lanternGlow: "#ffd777",
  grass: "#8fcf6b",
  grassDark: "#6fb552",
  flowerPink: "#ff9fb8",
  flowerYellow: "#ffe35a",
  flowerWhite: "#ffffff",
  iron: "#4a4650",
  path: "#e8d4a8",
};
const M = {
  plinthTop: [0, 0.45, 0] as [number, number, number],
  towerBase: [0, 0.45, 0] as [number, number, number],
  galleryDeck: [0, 1.3, 0] as [number, number, number],
  towerTop: [0, 3.3, 0] as [number, number, number],
  capBase: [0, 3.3, 0] as [number, number, number],
  axleFront: [0, 3.7, 1.1] as [number, number, number],
  hub: [0, 3.7, 1.5] as [number, number, number],
  tailPoleRoot: [0, 3.6, -1] as [number, number, number],
  doorCenter: [0, 0.45, 1.25] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // base
  (() => {
function buildBase({ b, P }: any) {
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, ...o });

  // Octagonal stone plinth with a darker band
  part(new THREE.CylinderGeometry(2.0, 2.15, 0.34, 8), P.stone, [0, 0.17, 0], { flat: true });
  part(new THREE.CylinderGeometry(2.17, 2.17, 0.08, 8), P.stoneDark, [0, 0.12, 0], { flat: true });
  part(new THREE.CylinderGeometry(1.9, 2.0, 0.16, 8), P.stoneDark, [0, 0.42, 0], { flat: true });

  // Grass pad (wide, low, rounded)
  part(new THREE.CylinderGeometry(2.1, 2.2, 0.1, 12), P.grass, [0, 0.05, 0], { flat: true });
  part(new THREE.CylinderGeometry(1.75, 1.85, 0.06, 8), P.grass, [0, 0.48, 0], { flat: true });

  // Grass tufts around the pad
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2, r = 1.9 + R() * 0.3;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (z > 1.5 && Math.abs(x) < 0.7) continue;
    part(new THREE.ConeGeometry(0.06, 0.2, 5), P.grassDark, [x, 0.17, z]);
  }

  // Curved path to the steps
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = 2.55 - t * 1.0;
    const x = Math.sin(t * 3) * 0.45 * (1 - t * 0.2);
    part(new THREE.CylinderGeometry(0.26, 0.28, 0.05, 8), P.path, [x, 0.13, z + 0.0], { flat: true });
  }

  // Three wooden steps meeting the door
  for (let i = 0; i < 3; i++) {
    const w = 1.1 - i * 0.08;
    part(new THREE.BoxGeometry(w, 0.1, 0.3), i % 2 ? P.woodLight : P.wood, [0, 0.12 + i * 0.1 + 0.03, 1.85 - i * 0.2 + 0.0]);
    part(new THREE.BoxGeometry(w + 0.06, 0.03, 0.04), P.woodDark, [0, 0.19 + i * 0.1, 1.99 - i * 0.2]);
  }
  part(new THREE.BoxGeometry(1.0, 0.1, 0.4), P.woodDark, [0, 0.46, 1.4]);

  // Flower bed on the left front
  part(new THREE.BoxGeometry(1.0, 0.14, 0.4), P.woodDark, [-1.25, 0.2, 1.75], { rotation: [0, 20, 0] });
  part(new THREE.BoxGeometry(0.9, 0.1, 0.3), P.grassDark, [-1.25, 0.26, 1.75], { rotation: [0, 20, 0] });
  const cols = [P.flowerPink, P.flowerYellow, P.flowerWhite];
  for (let i = 0; i < 9; i++) {
    const u = (i / 8 - 0.5) * 0.8;
    const a = (20 * Math.PI) / 180;
    const x = -1.25 + Math.cos(a) * u, z = 1.75 - Math.sin(a) * u + (R() - 0.5) * 0.1;
    part(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 4), P.grassDark, [x, 0.34, z]);
    part(new THREE.SphereGeometry(0.07, 6, 5), cols[i % 3], [x, 0.44, z]);
    part(new THREE.SphereGeometry(0.03, 5, 4), P.flowerYellow, [x, 0.5, z + 0.04]);
  }

  // Two round bushes
  for (const [x, z, s] of [[1.45, 1.6, 0.3], [1.1, 1.95, 0.2]]) {
    part(new THREE.IcosahedronGeometry(s, 1), P.grassDark, [x, 0.2 + s * 0.6, z], { flat: true });
    part(new THREE.IcosahedronGeometry(s * 0.45, 0), P.grass, [x + s * 0.2, 0.3 + s * 0.9, z + s * 0.4], { flat: true });
    part(new THREE.SphereGeometry(0.04, 5, 4), P.flowerPink, [x - s * 0.5, 0.3 + s * 0.7, z + s * 0.7]);
  }
}
    return buildBase;
  })(),
  // tower
  (() => {
function buildTower({ b, J, P, M }: Ctx) {
  const Y0 = 0.45, Y1 = 3.3;
  const R0 = 1.35, R1 = 0.95; // circumradius bottom/top
  const rAt = (y: number) => R0 + (R1 - R0) * ((y - Y0) / (Y1 - Y0));
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });

  // Main tapered octagonal body: lathe with 8 segments, rotated so a flat faces +Z
  const spin = 22.5;
  const body = (rb: number, rt: number, y0: number, y1: number, color: string) =>
    b.lathe([[0, y0], [rb, y0], [rt, y1], [0, y1]], { at: [0, 0, 0], segments: 8, spin, color });
  // plaster body
  body(R0, R1, Y0, Y1, P.plaster);
  // brick lower course
  const yb = 1.0;
  body(R0 + 0.03, rAt(yb) + 0.03, Y0, yb, P.brick);
  // brick rows detail
  for (let i = 0; i < 3; i++) {
    const y = Y0 + 0.17 + i * 0.17;
    body(rAt(y) + 0.045, rAt(y) + 0.045, y - 0.012, y + 0.012, P.plasterShade);
  }
  // trim bands
  for (const y of [1.0, 2.0, 3.15]) body(rAt(y) + 0.07, rAt(y) + 0.07, y - 0.05, y + 0.05, P.woodLight);

  // corner posts
  const apo = (r: number) => r * Math.cos(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    const a = (i * 45) * Math.PI / 180; // vertex angle (flat faces +Z => vertices at 22.5 offsets)
    const va = a + Math.PI / 8;
    const x0 = Math.sin(va) * R0, z0 = Math.cos(va) * R0;
    const x1 = Math.sin(va) * R1, z1 = Math.cos(va) * R1;
    b.rod([x0, Y0, z0], [x1, Y1, z1], 0.06, P.wood);
  }
  // shade panels on faces
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    if (i === 0) continue;
    const y = 2.15, r = apo(rAt(y)) + 0.03;
    part(new THREE.BoxGeometry(0.5, 0.7, 0.04), P.plasterShade, [Math.sin(a) * r, y, Math.cos(a) * r], { rotation: [0, a * 180 / Math.PI, 0] });
  }

  // gallery ring
  const gy = 1.3;
  b.lathe([[0, gy - 0.08], [1.8, gy - 0.08], [1.8, gy + 0.04], [0, gy + 0.04]], { at: [0, 0, 0], segments: 8, spin, color: P.wood });
  b.lathe([[1.8, gy - 0.1], [1.85, gy - 0.1], [1.85, gy + 0.06], [1.8, gy + 0.06]], { at: [0, 0, 0], segments: 8, spin, color: P.woodDark });
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8 + Math.PI / 16;
    const r = 1.68;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (Math.abs(x) < 0.5 && z > 0) continue;
    part(new THREE.CylinderGeometry(0.035, 0.04, 0.4, 6), P.woodLight, [x, gy + 0.24, z]);
    part(new THREE.SphereGeometry(0.055, 6, 4), P.woodLight, [x, gy + 0.46, z]);
  }
  b.lathe([[1.64, gy + 0.43], [1.72, gy + 0.43], [1.72, gy + 0.5], [1.64, gy + 0.5]], { at: [0, 0, 0], segments: 16, color: P.wood });

  // arched door at front, face apothem
  const zf = (y: number) => apo(rAt(y));
  const dz = zf(1.0) + 0.06;
  const door = (w: number, h: number, c: string, dzz: number) => {
    part(new THREE.BoxGeometry(w, h, 0.06), c, [0, 0.45 + h / 2, dzz]);
    part(new THREE.CylinderGeometry(w / 2, w / 2, 0.06, 12), c, [0, 0.45 + h, dzz], { rotation: [90, 0, 0] });
  };
  door(0.86, 0.95, P.woodDark, dz);
  door(0.7, 0.9, P.wood, dz + 0.035);
  for (const x of [-0.18, 0.18]) part(new THREE.BoxGeometry(0.02, 1.3, 0.02), P.woodDark, [x, 1.05, dz + 0.07]);
  part(new THREE.SphereGeometry(0.05, 8, 6), P.thatch, [0.22, 0.95, dz + 0.09]);
  part(new THREE.BoxGeometry(0.62, 0.05, 0.04), P.woodDark, [0, 0.95, dz + 0.075]);

  // hanging lantern
  const lz = dz + 0.35, lx = 0.8;
  part(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 5), P.iron, [lx, 1.35, lz - 0.1], { rotation: [0, 0, 0] });
  b.rod([lx, 1.3, dz + 0.06], [lx, 1.3, lz], 0.02, P.iron);
  part(new THREE.ConeGeometry(0.1, 0.08, 6), P.iron, [lx, 1.14, lz]);
  glow(part(new THREE.SphereGeometry(0.09, 8, 6), P.lanternGlow, [lx, 1.03, lz]), 1.5);
  part(new THREE.SphereGeometry(0.03, 5, 4), P.iron, [lx, 0.93, lz]);

  // round windows
  const win = (x: number, y: number, z: number, ang: number, r: number) => {
    const rot = { rotation: [90, ang, 0] };
    const g = (rad: number, th: number, c: string, off: number) => {
      const dx = Math.sin(ang * Math.PI / 180), dz2 = Math.cos(ang * Math.PI / 180);
      part(new THREE.CylinderGeometry(rad, rad, th, 12), c, [x + dx * off, y, z + dz2 * off], { dir: [dx, 0, dz2] });
    };
    g(r + 0.07, 0.07, P.woodDark, 0);
    g(r + 0.03, 0.09, P.wood, 0.01);
    g(r, 0.1, P.glass, 0.02);
    // cross bars
    const dx = Math.sin(ang * Math.PI / 180), dz2 = Math.cos(ang * Math.PI / 180);
    const q = [x + dx * 0.075, y, z + dz2 * 0.075];
    part(new THREE.BoxGeometry(r * 2, 0.04, 0.03), P.wood, q, { rotation: [0, ang, 0] });
    part(new THREE.BoxGeometry(0.04, r * 2, 0.03), P.wood, q, { rotation: [0, ang, 0] });
  };
  // above the door
  win(0, 2.2, zf(2.2) + 0.0, 0, 0.26);
  for (const s of [1, -1]) {
    for (const k of [2, 3]) {
      const ang = s * k * 45; // face normals at 90 and 135 etc
      const a = ang * Math.PI / 180;
      const y = k === 2 ? 1.9 : 2.5;
      const r = zf(y) - 0.0;
      win(Math.sin(a) * r, y, Math.cos(a) * r, ang, 0.22);
    }
  }
  // back hatch
  const hz = -zf(2.0);
  part(new THREE.BoxGeometry(0.5, 0.5, 0.08), P.woodDark, [0, 2.0, hz]);
  part(new THREE.BoxGeometry(0.4, 0.4, 0.1), P.wood, [0, 2.0, hz - 0.01]);
  part(new THREE.BoxGeometry(0.34, 0.02, 0.12), P.woodDark, [0, 2.0, hz - 0.02]);
  part(new THREE.SphereGeometry(0.035, 6, 4), P.thatch, [0, 1.92, hz - 0.08]);

  // window box + flower under front window? small sill
  part(new THREE.BoxGeometry(0.6, 0.06, 0.12), P.woodLight, [0, 1.88, zf(2.0) + 0.05]);

  // top collar under the cap
  b.lathe([[0, Y1 - 0.06], [rAt(Y1) + 0.1, Y1 - 0.06], [rAt(Y1) + 0.1, Y1 + 0.02], [0, Y1 + 0.02]], { at: [0, 0, 0], segments: 8, spin, color: P.woodDark });
}
    return buildTower;
  })(),
  // cap
  (() => {
function buildCap({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const [cx, cy, cz] = M.capBase;

  // Dome: lathe, roof coloured
  const dome: [number, number][] = [
    [0, 0], [1.45, 0], [1.5, 0.12], [1.42, 0.45], [1.15, 0.85], [0.7, 1.15], [0.3, 1.32], [0, 1.38],
  ];
  b.lathe(dome, { at: [cx, cy, cz], segments: 16, color: P.roof, smoothing: 1 });

  // Thatch band at the eaves
  b.lathe(
    [[1.38, 0.0], [1.56, 0.0], [1.56, 0.2], [1.48, 0.3], [1.38, 0.3]],
    { at: [cx, cy, cz], segments: 16, color: P.thatch },
  );
  // thatch bundle ends
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.roofDark, {
      at: [Math.sin(a) * 1.57, cy + 0.02, Math.cos(a) * 1.57],
    });
  }

  // Ridge ribs on dome (roofDark)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const pts = [0.3, 0.45, 0.8, 1.15].map((y, k) => {
      const r = [1.5, 1.42, 1.17, 0.72][k] + 0.03;
      return [Math.sin(a) * r, cy + y, Math.cos(a) * r] as [number, number, number];
    });
    b.sweep(pts, 0.045, { color: P.roofDark, caps: "round" });
  }

  // Finial
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.iron, { at: [0, cy + 1.4, 0] });
  b.part(new THREE.ConeGeometry(0.06, 0.4, 6), P.iron, { at: [0, cy + 1.62, 0] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.iron, { at: [0, cy + 1.85, 0] });

  // Front gable
  const gz = 1.2;
  b.extrude(
    [[-0.5, 0], [0.5, 0], [0.5, 0.35], [0, 0.85, "sharp"], [-0.5, 0.35]],
    { at: [0, cy + 0.4, gz], x: [1, 0, 0], thickness: 0.5, color: P.roof, bevel: 0.04 },
  );
  b.extrude(
    [[-0.58, 0.32], [0, 0.95, "sharp"], [0.58, 0.32], [0.5, 0.3], [0, 0.85], [-0.5, 0.3]],
    { at: [0, cy + 0.4, gz + 0.12], x: [1, 0, 0], thickness: 0.14, color: P.roofDark },
  );
  // round window
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12), P.woodLight, {
    at: [0, cy + 0.65, gz + 0.27], dir: [0, 0, 1],
  });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), P.glass, {
    at: [0, cy + 0.65, gz + 0.28], dir: [0, 0, 1],
  });
  b.part(new THREE.BoxGeometry(0.24, 0.025, 0.02), P.wood, { at: [0, cy + 0.65, gz + 0.33] });
  b.part(new THREE.BoxGeometry(0.025, 0.24, 0.02), P.wood, { at: [0, cy + 0.65, gz + 0.33] });

  // Windshaft
  const ay = M.axleFront[1];
  b.capsule([0, ay, 0.4], [0, ay, M.hub[2] - 0.1], 0.14, { color: P.wood });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10), P.woodDark, {
    at: [0, ay, M.axleFront[2]], dir: [0, 0, 1],
  });
  // hub boss
  b.part(new THREE.SphereGeometry(0.26, 10, 8), P.woodDark, { at: [0, ay, M.hub[2] - 0.05] });
  b.part(new THREE.SphereGeometry(0.12, 8, 6), P.woodLight, { at: [0, ay, M.hub[2] + 0.18] });

  // Tail pole
  const t0 = M.tailPoleRoot;
  const t1: [number, number, number] = [0, 0.75, -2.3];
  b.rod([t0[0], t0[1], t0[2]], t1, [0.09, 0.07], { color: P.wood });
  b.part(new THREE.SphereGeometry(0.11, 8, 6), P.woodDark, { at: t0 });
  // cross brace
  const f = 0.3;
  const bx = t0[2] + (t1[2] - t0[2]) * f, by = t0[1] + (t1[1] - t0[1]) * f;
  b.rod([-0.35, by + 0.02, bx + 0.02], [0.35, by + 0.02, bx + 0.02], 0.045, { color: P.woodLight });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), P.woodDark, { at: [0.37, by + 0.02, bx + 0.02] });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), P.woodDark, { at: [-0.37, by + 0.02, bx + 0.02] });
  // support strut
  b.rod([0, 3.4, -1.0], [0, by, bx], 0.04, { color: P.woodDark });

  // Lantern hanging on the tail pole
  const lf = 0.55;
  const lx = t0[2] + (t1[2] - t0[2]) * lf, ly = t0[1] + (t1[1] - t0[1]) * lf;
  b.rod([0, ly, lx], [0, ly - 0.18, lx], 0.015, { color: P.iron });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), P.iron, { at: [0, ly - 0.2, lx] });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), P.lanternGlow, { at: [0, ly - 0.32, lx] });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 8), P.iron, { at: [0, ly - 0.45, lx] });
  b.part(new THREE.ConeGeometry(0.1, 0.1, 8), P.iron, { at: [0, ly - 0.14, lx] });
}
    return buildCap;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P, M }: any) {
  const hub = new THREE.Vector3(...(M.hub as [number, number, number]));
  const rand = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // Place a part in the sail's local frame (u across, v along the sail), rotated by ang about Z.
  const place = (geo: THREE.BufferGeometry, color: string, ang: number, u: number, v: number, z: number, rz = 0) => {
    const c = Math.cos(ang), s = Math.sin(ang);
    const x = hub.x + u * c - v * s;
    const y = hub.y + u * s + v * c;
    return b.part(geo, color, { at: [x, y, hub.z + z], rotation: [0, 0, ((ang + rz) * 180) / Math.PI] });
  };

  const L = 2.1;
  const angles = [45, 135, 225, 315].map((d) => (d * Math.PI) / 180 - Math.PI / 2);
  angles.forEach((ang, i) => {
    const z = 0.08 + (i % 2) * 0.08; // stagger
    // stiles
    for (const sx of [-0.22, 0.22]) {
      place(box(0.08, L, 0.08), P.woodLight, ang, sx, 0.2 + L / 2 - 0.2, z);
    }
    // cross rungs
    for (let k = 0; k < 7; k++) {
      const v = 0.3 + k * 0.3;
      place(box(0.52, 0.05, 0.07), P.wood, ang, 0, v, z + 0.005);
    }
    // cloth slats on trailing half (u from 0 to 0.2)
    for (let k = 0; k < 6; k++) {
      const v = 0.45 + k * 0.28;
      place(box(0.17, 0.2, 0.025), P.cloth, ang, 0.115, v, z - 0.01);
    }
    // frame spine
    place(box(0.06, L - 0.2, 0.06), P.woodDark, ang, -0.22, 1.15, z + 0.03);
    // tip cap
    place(box(0.6, 0.1, 0.1), P.woodDark, ang, 0, L + 0.1, z);
    // bunting flags at tip
    for (let k = 0; k < 3; k++) {
      const flag = new THREE.ConeGeometry(0.06, 0.14, 3);
      const cols = [P.flowerPink, P.flowerYellow, P.glass];
      place(flag, cols[(k + i) % 3], ang, 0.3 + 0.1 * k * 0 - 0.0, L + 0.02 - k * 0.12, z + 0.02, 180 + rand() * 0).position;
      place(flag, cols[(k + i) % 3], ang, -0.33, L - k * 0.14 - 0.02, z + 0.02, 180);
    }
  });

  // hub cap
  const hubZ = 0.18;
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.16, 12), P.woodDark, {
    at: [hub.x, hub.y, hub.z + hubZ], dir: [0, 0, 1], axis: "y",
  });
  b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.1, 10), P.woodLight, {
    at: [hub.x, hub.y, hub.z + hubZ + 0.09], dir: [0, 0, 1], axis: "y",
  });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), P.woodDark, {
    at: [hub.x, hub.y, hub.z + hubZ + 0.15],
  });
}
    return buildSails;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dutchWindmill" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
