import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // torii
  (() => {
function buildTorii(b: Builder) {
  const RED = "#d8321f", RED_D = "#a82416", BLACK = "#1c1a1f", GOLD = "#e8b94a";
  const ROPE = "#d9c48a", ROPE_D = "#a88f55", PAPER = "#fbf7ea", PAPER_S = "#d9d4c0";
  const Z = 1.7, TOP = 0.3;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: "root", at: [x, y, z], rotation: [0, 0, rz] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: "root", at: [x, y, z] });

  for (const s of [1, -1]) {
    const x = s * 1.0;
    cyl(0.17, 0.19, 0.3, BLACK, x, TOP + 0.15 - 0.005, Z);
    cyl(0.11, 0.135, 2.35, RED, x, TOP + 0.3 + 1.175 - 0.01, Z);
    cyl(0.125, 0.125, 0.05, GOLD, x, TOP + 0.62, Z);
    cyl(0.125, 0.125, 0.05, GOLD, x, 2.58, Z);
    cyl(0.13, 0.115, 0.06, BLACK, x, 2.64, Z);
  }
  // nuki tie beam
  box(2.55, 0.14, 0.12, RED, 0, 2.1, Z);
  for (const s of [1, -1]) box(0.08, 0.2, 0.16, RED_D, s * 1.28, 2.1, Z);
  // shimaki and kasagi
  box(2.7, 0.16, 0.2, RED, 0, 2.78, Z);
  box(2.7, 0.12, 0.3, BLACK, 0, 2.92, Z);
  box(3.0, 0.14, 0.4, BLACK, 0, 3.05, Z);
  for (const s of [1, -1]) {
    box(0.5, 0.12, 0.4, BLACK, s * 1.38, 3.1, Z, s * 0.22);
    box(0.5, 0.05, 0.3, GOLD, s * 1.38, 3.0, Z, s * 0.22);
  }
  // name plaque
  for (const f of [1, -1]) {
    box(0.4, 0.5, 0.03, GOLD, 0, 2.45, Z + f * 0.065);
    box(0.34, 0.44, 0.03, BLACK, 0, 2.45, Z + f * 0.075);
    for (let i = 0; i < 3; i++) box(0.2 - i * 0.03, 0.05, 0.03, GOLD, 0, 2.58 - i * 0.12, Z + f * 0.09);
  }
  box(0.06, 0.12, 0.1, RED_D, 0, 2.6, Z);
  // shimenawa rope sagging between pillars
  const N = 14;
  const pts: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = -0.86 + t * 1.72;
    pts.push([x, 1.9 - 0.14 * Math.sin(Math.PI * t), Z + 0.22]);
  }
  for (let i = 0; i < N; i++) {
    const a = pts[i], c = pts[i + 1];
    b.rod(a, c, 0.045, i % 2 ? ROPE : ROPE_D, { bone: "root" });
  }
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.1, ROPE_D, s * 0.9, 1.9, Z + 0.22, 8);
  // shide paper streamers
  for (let i = 1; i < N; i += 2) {
    const [x, y, z] = pts[i];
    for (let k = 0; k < 3; k++) {
      const yy = y - 0.12 - k * 0.12;
      const sx = k % 2 ? 0.06 : -0.06;
      box(0.14, 0.1, 0.01, k % 2 ? PAPER_S : PAPER, x + sx * 0.3, yy, z + 0.03);
    }
    box(0.02, 0.06, 0.02, ROPE_D, x, y - 0.04, z + 0.02);
  }
}
    return buildTorii;
  })(),
  // lanterns
  (() => {
function buildLanterns(b: Builder) {
  const STONE = "#9a9a90";
  const STONE_D = "#76766e";
  const STONE_L = "#b8b8ac";
  const MOSS = "#6f8f4a";
  const FIRE = "#ffb640";
  const FIRE_C = "#fff0a0";
  const PAPER = "#e8452f";
  const PAPER_D = "#a82a20";
  const GOLD = "#d8a838";
  const DARK = "#2a2018";

  const base = 0.3; // assumed platform top height
  const bone = "root";

  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], rotY = 0) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone, rotation: [0, rotY, 0] });
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone });

  // Stone toro lanterns
  for (const s of [1, -1]) {
    const x = s * 1.2;
    const z = 0.8;
    let y = base;
    // base plinth (hexagonal)
    cyl(0.17, 0.2, 0.08, 6, STONE_D, [x, y + 0.04, z]);
    y += 0.08;
    cyl(0.12, 0.15, 0.06, 6, STONE, [x, y + 0.03, z]);
    y += 0.06;
    // post
    cyl(0.06, 0.07, 0.4, 6, STONE_L, [x, y + 0.2, z]);
    // post rings
    cyl(0.085, 0.085, 0.035, 6, STONE, [x, y + 0.1, z]);
    cyl(0.085, 0.085, 0.035, 6, STONE, [x, y + 0.32, z]);
    y += 0.4;
    // moss at base
    cyl(0.13, 0.15, 0.025, 6, MOSS, [x, base + 0.14, z]);
    // seat slab
    cyl(0.16, 0.12, 0.05, 6, STONE_D, [x, y + 0.025, z]);
    y += 0.05;
    // fire box
    const fb = b.part(new THREE.BoxGeometry(0.17, 0.17, 0.17), STONE, { at: [x, y + 0.085, z], bone });
    void fb;
    // glowing windows on four sides
    const win: [number, number, number, number, number][] = [
      [0, 0.09, 0.1, 0.0, 0.075],
      [0, 0.09, -0.1, 0.0, 0.075],
    ];
    void win;
    for (const dz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.09, 0.1, 0.02), FIRE, { at: [x, y + 0.09, z + dz * 0.085], bone });
      b.part(new THREE.BoxGeometry(0.04, 0.05, 0.022), FIRE_C, { at: [x, y + 0.09, z + dz * 0.086], bone });
    }
    for (const dx of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.09), FIRE, { at: [x + dx * 0.085, y + 0.09, z], bone });
    }
    // corner pillars
    for (const cx of [1, -1])
      for (const cz of [1, -1]) box(0.025, 0.17, 0.025, STONE_D, [x + cx * 0.085, y + 0.085, z + cz * 0.085]);
    y += 0.17;
    // roof cap (wide hex frustum + upturned shape)
    cyl(0.1, 0.24, 0.07, 6, STONE_D, [x, y + 0.035, z]);
    y += 0.07;
    cyl(0.04, 0.12, 0.09, 6, STONE, [x, y + 0.045, z]);
    y += 0.09;
    // finial: jewel
    b.part(new THREE.SphereGeometry(0.045, 6, 5), STONE_L, { at: [x, y + 0.04, z], bone });
    b.part(new THREE.ConeGeometry(0.03, 0.08, 6), STONE_L, { at: [x, y + 0.11, z], bone });
    // fire glow core
    b.part(new THREE.SphereGeometry(0.04, 6, 4), FIRE_C, { at: [x, base + 0.64 + 0.0, z], bone });
  }

  // Hanging paper lanterns on eave front edge
  const eaveY = 1.85;
  const eaveZ = 1.1;
  const xs = [-1.2, -0.6, 0, 0.6, 1.2];
  xs.forEach((x, i) => {
    const len = 0.12 + (i % 2) * 0.06;
    const r = i === 2 ? 0.15 : 0.11;
    // cord
    b.rod([x, eaveY, eaveZ], [x, eaveY - len, eaveZ], 0.006, DARK, { bone });
    const cy = eaveY - len - r * 1.1;
    // top cap
    cyl(r * 0.5, r * 0.5, 0.025, 8, DARK, [x, cy + r * 1.1, eaveZ]);
    // body
    b.part(new THREE.SphereGeometry(r, 8, 6), i % 2 ? PAPER_D : PAPER, {
      at: [x, cy, eaveZ],
      bone,
      scale: [1, 1.2, 1],
    });
    // ribs
    cyl(r * 1.01, r * 1.01, 0.012, 8, PAPER_D, [x, cy, eaveZ]);
    // glowing band
    cyl(r * 1.0, r * 1.0, 0.03, 8, FIRE, [x, cy + r * 0.45, eaveZ]);
    // bottom cap
    cyl(r * 0.45, r * 0.45, 0.025, 8, DARK, [x, cy - r * 1.1, eaveZ]);
    // tassel
    b.rod([x, cy - r * 1.2, eaveZ], [x, cy - r * 1.2 - 0.1, eaveZ], 0.008, GOLD, { bone });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), GOLD, { at: [x, cy - r * 1.2 - 0.11, eaveZ], bone });
  });
  void frame;
}
    return buildLanterns;
  })(),
  // offerings
  (() => {
function buildOfferings(b: Builder) {
  const Y0 = 0.3;
  const WOOD = "#8a5a32", DARK = "#4a2c18", LIGHT = "#c28a52", RED = "#b8322a", GOLD = "#e8c050";
  const STONE = "#a9a59c", STONE_D = "#7c786f", WHITE = "#f4efe2", PAPER = "#f2e6c4";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: "root", at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: "root", at: [x, y, z] });
  const sph = (r: number, c: string, x: number, y: number, z: number, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone: "root", at: [x, y, z], scale: sc });

  // Donation box (centre, front)
  const dx = 0, dz = 0.95;
  box(0.56, 0.05, 0.4, DARK, dx, Y0 + 0.025, dz);
  box(0.5, 0.4, 0.34, WOOD, dx, Y0 + 0.25, dz);
  box(0.58, 0.05, 0.42, DARK, dx, Y0 + 0.475, dz);
  box(0.4, 0.03, 0.26, RED, dx, Y0 + 0.51, dz);
  for (let i = -2; i <= 2; i++) box(0.012, 0.3, 0.012, DARK, dx + i * 0.09, Y0 + 0.25, dz + 0.175);
  box(0.3, 0.012, 0.012, DARK, dx, Y0 + 0.4, dz + 0.176);
  box(0.3, 0.012, 0.012, DARK, dx, Y0 + 0.1, dz + 0.176);
  box(0.2, 0.025, 0.02, "#120a06", dx, Y0 + 0.46, dz + 0.1);
  box(0.3, 0.012, 0.012, DARK, dx, Y0 + 0.435, dz + 0.176);
  cyl(0.025, 0.025, 0.012, 10, GOLD, dx, Y0 + 0.53, dz + 0.04);
  box(0.12, 0.08, 0.01, PAPER, dx, Y0 + 0.31, dz + 0.176);
  box(0.03, 0.05, 0.012, RED, dx, Y0 + 0.31, dz + 0.18);

  // Sake barrel (left)
  const sx = -0.7, sz = 0.85;
  cyl(0.2, 0.2, 0.34, 12, LIGHT, sx, Y0 + 0.17, sz);
  cyl(0.215, 0.215, 0.03, 12, DARK, sx, Y0 + 0.08, sz);
  cyl(0.215, 0.215, 0.03, 12, DARK, sx, Y0 + 0.26, sz);
  cyl(0.18, 0.18, 0.01, 12, "#d9a868", sx, Y0 + 0.345, sz);
  box(0.16, 0.12, 0.01, WHITE, sx, Y0 + 0.17, sz + 0.205);
  box(0.08, 0.07, 0.012, RED, sx, Y0 + 0.17, sz + 0.21);
  box(0.4, 0.04, 0.4, DARK, sx, Y0 + 0.02, sz);

  // Offering tray with fruit and rice (right)
  const fx = 0.7, fz = 0.85;
  box(0.5, 0.06, 0.36, DARK, fx, Y0 + 0.03, fz);
  box(0.46, 0.03, 0.32, WOOD, fx, Y0 + 0.075, fz);
  const fruit: [number, number, string][] = [[-0.12, 0.05, "#d8452e"], [0.0, 0.07, "#e8892a"], [0.1, 0.04, "#d8452e"], [-0.04, -0.07, "#9ac040"]];
  for (const [ox, oz, c] of fruit) {
    sph(0.05, c, fx + ox, Y0 + 0.14, fz + oz);
    box(0.01, 0.025, 0.01, "#3a5a22", fx + ox, Y0 + 0.2, fz + oz);
  }
  for (const ox of [-0.12, 0.12]) {
    cyl(0.07, 0.04, 0.06, 10, WHITE, fx + ox, Y0 + 0.14, fz - 0.1);
    sph(0.065, WHITE, fx + ox, Y0 + 0.17, fz - 0.1, [1, 0.5, 1]);
  }

  // Coins scattered
  const cs: [number, number][] = [[-0.3, 1.2], [0.25, 1.22], [0.4, 1.12], [-0.15, 1.18], [0.05, 1.25]];
  for (const [x, z] of cs) {
    cyl(0.025, 0.025, 0.008, 10, GOLD, x, Y0 + 0.005, z);
    box(0.012, 0.009, 0.012, DARK, x, Y0 + 0.006, z);
  }

  // Ema plaques on a rack (right back)
  const ex = 1.05, ez = 0.45;
  box(0.05, 0.6, 0.05, DARK, ex - 0.28, Y0 + 0.3, ez);
  box(0.05, 0.6, 0.05, DARK, ex + 0.28, Y0 + 0.3, ez);
  box(0.7, 0.05, 0.07, DARK, ex, Y0 + 0.6, ez);
  box(0.74, 0.04, 0.1, RED, ex, Y0 + 0.65, ez);
  for (let i = 0; i < 4; i++) {
    const px = ex - 0.21 + i * 0.14;
    box(0.008, 0.1, 0.008, "#d8c8a0", px, Y0 + 0.53, ez + 0.02);
    box(0.11, 0.11, 0.015, LIGHT, px, Y0 + 0.44, ez + 0.02);
    box(0.11, 0.035, 0.016, DARK, px, Y0 + 0.487, ez + 0.02);
    box(0.05, 0.05, 0.017, i % 2 ? RED : "#3a6ab0", px, Y0 + 0.43, ez + 0.022);
  }

  // Fox statues flanking steps
  for (const s of [1, -1]) {
    const x = s * 1.15, z = 1.05;
    box(0.3, 0.1, 0.3, STONE_D, x, Y0 + 0.05, z);
    box(0.22, 0.06, 0.22, STONE, x, Y0 + 0.13, z);
    sph(0.12, STONE, x, Y0 + 0.28, z - 0.02, [0.9, 1.2, 0.9]);
    box(0.12, 0.1, 0.1, STONE, x, Y0 + 0.4, z + 0.02);
    sph(0.085, STONE, x, Y0 + 0.5, z + 0.04);
    b.part(new THREE.ConeGeometry(0.045, 0.1, 6), STONE, { bone: "root", at: [x, Y0 + 0.5, z + 0.1], dir: [0, 0, 1] });
    for (const e of [-1, 1]) {
      b.part(new THREE.ConeGeometry(0.035, 0.11, 4), STONE, { bone: "root", at: [x + e * 0.055, Y0 + 0.6, z + 0.03] });
      box(0.02, 0.02, 0.01, "#1a1a1a", x + e * 0.04, Y0 + 0.52, z + 0.115);
    }
    box(0.14, 0.03, 0.02, RED, x, Y0 + 0.42, z + 0.07);
    box(0.04, 0.05, 0.02, GOLD, x, Y0 + 0.38, z + 0.085);
    b.part(new THREE.ConeGeometry(0.07, 0.3, 6), STONE, { bone: "root", at: [x, Y0 + 0.2, z - 0.2], dir: [0, 0.4, -1] });
  }
}
    return buildOfferings;
  })(),
  // roofDetail
  (() => {
function buildRoofDetail(b: Builder) {
  const GOLD = "#e8b83a";
  const GOLD_D = "#b07f20";
  const TILE = "#3a4a5e";
  const TILE_L = "#566b84";
  const ROPE = "#c8392b";
  const RUNE = "#6fe3f0";
  const PLATE = "#2a2f44";
  const bone = "shrine";
  const P = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { bone, at, ...extra });

  const RY = 2.3; // ridge height (assumed)
  const EY = 1.72; // eave height (assumed)
  const HX = 1.2; // half ridge length
  const HZ = 0.8; // eave half depth

  // ridge tile line: stacked rounded caps
  P(new THREE.BoxGeometry(2 * HX, 0.08, 0.16), TILE_L, [0, RY + 0.04, 0]);
  P(new THREE.CylinderGeometry(0.07, 0.07, 2 * HX, 6), TILE, [0, RY + 0.1, 0], { rotation: [0, 0, 90] });
  P(new THREE.BoxGeometry(2 * HX, 0.03, 0.2), GOLD_D, [0, RY, 0]);

  // onigawara ends
  for (const s of [1, -1]) {
    const x = s * HX;
    P(new THREE.BoxGeometry(0.16, 0.2, 0.22), TILE, [x, RY + 0.14, 0]);
    P(new THREE.BoxGeometry(0.12, 0.05, 0.26), GOLD, [x, RY + 0.26, 0]);
    P(new THREE.ConeGeometry(0.09, 0.26, 5), TILE_L, [x + s * 0.06, RY + 0.35, 0], { rotation: [0, 0, -s * 20] });
    P(new THREE.SphereGeometry(0.05, 6, 4), GOLD, [x, RY + 0.2, 0.12]);
    P(new THREE.SphereGeometry(0.05, 6, 4), GOLD, [x, RY + 0.2, -0.12]);
  }

  // gold finial at centre
  P(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 8), GOLD_D, [0, RY + 0.2, 0]);
  P(new THREE.SphereGeometry(0.09, 8, 6), GOLD, [0, RY + 0.3, 0]);
  P(new THREE.ConeGeometry(0.05, 0.22, 8), GOLD, [0, RY + 0.5, 0]);
  P(new THREE.TorusGeometry(0.08, 0.012, 4, 10), GOLD_D, [0, RY + 0.36, 0], { rotation: [90, 0, 0] });

  // eave tip trim along front and back
  for (const s of [1, -1]) {
    const z = s * HZ;
    P(new THREE.BoxGeometry(2 * HX + 0.2, 0.05, 0.05), GOLD, [0, EY, z]);
    P(new THREE.BoxGeometry(2 * HX + 0.1, 0.07, 0.03), TILE, [0, EY + 0.06, z - s * 0.03]);
    for (let i = 0; i < 9; i++) {
      const x = -HX + (i * 2 * HX) / 8;
      P(new THREE.ConeGeometry(0.045, 0.1, 4), GOLD, [x, EY - 0.06, z], { rotation: [s * 180, 0, 0] });
    }
    // roof tile lines
    for (let i = 0; i < 7; i++) {
      const x = -HX + 0.2 + (i * (2 * HX - 0.4)) / 6;
      const y = (RY + EY) / 2 + 0.05;
      P(new THREE.BoxGeometry(0.03, 0.025, 0.62), TILE_L, [x, y, s * 0.4], { rotation: [-s * 36, 0, 0] });
    }
  }
  // eave corner flicks
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      P(new THREE.ConeGeometry(0.06, 0.2, 5), GOLD, [sx * (HX + 0.1), EY + 0.06, sz * HZ], {
        rotation: [sz * 70, 0, -sx * 70],
      });

  // hanging bell with rope under front eave
  const bz = HZ - 0.05;
  P(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 5), ROPE, [0, EY - 0.08, bz]);
  P(new THREE.SphereGeometry(0.035, 6, 4), ROPE, [0, EY - 0.16, bz]);
  P(new THREE.CylinderGeometry(0.04, 0.09, 0.12, 8), GOLD, [0, EY - 0.24, bz]);
  P(new THREE.CylinderGeometry(0.093, 0.093, 0.02, 8), GOLD_D, [0, EY - 0.31, bz]);
  P(new THREE.SphereGeometry(0.025, 6, 4), PLATE, [0, EY - 0.33, bz]);
  P(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 5), ROPE, [0, EY - 0.42, bz]);
  P(new THREE.BoxGeometry(0.03, 0.1, 0.012), ROPE, [0, EY - 0.54, bz]);

  // gable rune emblem plaque on front face
  const gz = 0.84;
  P(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 8), GOLD_D, [0, 2.0, gz], { rotation: [90, 0, 0] });
  P(new THREE.CylinderGeometry(0.14, 0.14, 0.035, 8), PLATE, [0, 2.0, gz + 0.004], { rotation: [90, 0, 0] });
  P(new THREE.BoxGeometry(0.03, 0.18, 0.02), RUNE, [0, 2.0, gz + 0.025]);
  P(new THREE.BoxGeometry(0.12, 0.03, 0.02), RUNE, [0, 2.04, gz + 0.025]);
  P(new THREE.BoxGeometry(0.03, 0.1, 0.02), RUNE, [0.05, 1.96, gz + 0.025], { rotation: [0, 0, 40] });
  P(new THREE.BoxGeometry(0.03, 0.1, 0.02), RUNE, [-0.05, 1.96, gz + 0.025], { rotation: [0, 0, -40] });
  P(new THREE.SphereGeometry(0.02, 6, 4), RUNE, [0, 2.15, gz + 0.025]);
}
    return buildRoofDetail;
  })(),
  // nature
  (() => {
function buildNature(b: Builder) {
  const BARK = "#5a3a2e";
  const BARK2 = "#7a5240";
  const P1 = "#ffc2d6";
  const P2 = "#ff9fc0";
  const P3 = "#ffe0ea";
  const MOSS = "#5f8f3a";
  const MOSS2 = "#7fb04a";
  const G1 = "#6fae45";
  const G2 = "#8cc85a";
  const G3 = "#4f8a38";
  const STONE = "#9a9aa0";
  const STONE2 = "#b4b2b0";

  // Sakura branch overhanging the back
  const main: number[][] = [
    [-1.9, 0.0, -1.7],
    [-1.8, 1.2, -1.6],
    [-1.4, 2.1, -1.5],
    [-0.6, 2.6, -1.35],
    [0.4, 2.7, -1.2],
    [1.2, 2.55, -1.0],
  ];
  b.sweep(main, [0.12, 0.03], { color: BARK, sides: 6, caps: "round" });
  b.sweep([[-1.9, 0.0, -1.7], [-1.95, 0.4, -1.65]], 0.15, { color: BARK2, sides: 6 });
  const twigs: number[][][] = [
    [[-0.6, 2.6, -1.35], [-0.5, 2.85, -1.1], [-0.3, 2.9, -0.85]],
    [[0.4, 2.7, -1.2], [0.7, 2.9, -1.0], [1.0, 2.85, -0.7]],
    [[-1.4, 2.1, -1.5], [-1.9, 2.4, -1.3], [-2.1, 2.6, -1.1]],
    [[1.2, 2.55, -1.0], [1.7, 2.45, -0.8], [2.0, 2.3, -0.6]],
    [[-1.0, 2.4, -1.45], [-1.0, 2.2, -1.0], [-0.9, 2.0, -0.7]],
  ];
  for (const t of twigs) b.sweep(t, [0.03, 0.01], { color: BARK, sides: 5, caps: "point" });

  // Blossom clusters
  const clusters: [number, number, number, number][] = [
    [-0.4, 2.85, -1.0, 0.3],
    [0.9, 2.85, -0.8, 0.32],
    [-2.0, 2.55, -1.2, 0.27],
    [1.9, 2.35, -0.65, 0.26],
    [-0.9, 2.1, -0.75, 0.24],
    [0.0, 2.85, -1.3, 0.3],
    [-1.4, 2.4, -1.4, 0.28],
    [0.5, 2.6, -1.0, 0.22],
  ];
  const cols = [P1, P2, P3];
  clusters.forEach(([x, y, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 0), cols[i % 3], { at: [x, y, z], flat: true });
    b.part(new THREE.IcosahedronGeometry(r * 0.6, 0), cols[(i + 1) % 3], {
      at: [x + r * 0.7, y - r * 0.3, z + r * 0.3],
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(r * 0.5, 0), cols[(i + 2) % 3], {
      at: [x - r * 0.6, y + r * 0.35, z - r * 0.1],
      flat: true,
    });
  });

  // Fallen petals
  const petal = new THREE.CircleGeometry(0.035, 5);
  for (let i = 0; i < 34; i++) {
    const a = i * 2.399;
    const rr = 0.35 + ((i * 37) % 100) / 100 * 1.6;
    const x = Math.max(-2.1, Math.min(2.1, Math.cos(a) * rr * 1.2));
    const z = Math.max(-1.9, Math.min(2.3, -0.2 + Math.sin(a) * rr));
    b.part(petal, cols[i % 3], {
      at: [x, 0.012 + (i % 3) * 0.001, z],
      dir: [0, 1, 0],
      axis: "z",
      up: [Math.cos(i), 0, Math.sin(i)],
    });
  }

  // Moss on stone: patches around platform edge/back
  const mossSpots: [number, number, number, number][] = [
    [-1.2, 0.04, -1.2, 0.2],
    [1.1, 0.04, -1.3, 0.18],
    [-1.3, 0.04, 1.1, 0.16],
    [1.3, 0.04, 1.0, 0.2],
    [0.2, 0.04, -1.75, 0.22],
    [-0.5, 0.04, 1.35, 0.12],
  ];
  mossSpots.forEach(([x, y, z, r], i) => {
    b.part(new THREE.SphereGeometry(r, 6, 3), i % 2 ? MOSS : MOSS2, { at: [x, y - 0.02, z], scale: [1, 0.25, 0.9] });
    b.part(new THREE.SphereGeometry(r * 0.5, 5, 3), i % 2 ? MOSS2 : MOSS, {
      at: [x + r * 0.6, y - 0.03, z + r * 0.3],
      scale: [1, 0.3, 1],
    });
  });

  // Grass tufts
  const blade = new THREE.ConeGeometry(0.025, 0.3, 4);
  const tuftAt: [number, number][] = [
    [-1.6, 1.4], [-1.2, 1.7], [-0.7, 1.9], [0.7, 1.95], [1.3, 1.7], [1.7, 1.3],
    [-1.8, 0.2], [1.85, 0.3], [-1.75, -0.8], [1.8, -0.7], [-1.3, -1.7], [1.5, -1.6],
    [-0.4, 2.1], [0.2, 2.2], [1.9, 1.9], [-1.95, 1.9],
  ];
  tuftAt.forEach(([x, z], i) => {
    for (let k = 0; k < 5; k++) {
      const a = k * 1.26 + i;
      const h = 0.8 + ((k * 7 + i * 3) % 5) * 0.12;
      b.part(blade, [G1, G2, G3][(i + k) % 3], {
        at: [x + Math.cos(a) * 0.05, 0.14 * h, z + Math.sin(a) * 0.05],
        rotation: [Math.sin(a) * 14, 0, -Math.cos(a) * 14],
        scale: [1, h, 1],
      });
    }
  });

  // Small stone path toward the front
  const stones: [number, number, number][] = [
    [0.05, 1.45, 0.24], [-0.1, 1.75, 0.2], [0.1, 2.05, 0.22], [-0.05, 2.3, 0.17],
  ];
  stones.forEach(([x, z, r], i) => {
    b.part(new THREE.CylinderGeometry(r, r * 1.08, 0.05, 7), i % 2 ? STONE : STONE2, { at: [x, 0.02, z], flat: true });
    b.part(new THREE.CylinderGeometry(r * 0.55, r * 0.6, 0.012, 6), i % 2 ? STONE2 : STONE, {
      at: [x, 0.048, z],
      flat: true,
    });
  });
}
    return buildNature;
  })(),
];

export const BASE_PARTS = [
  {
    id: "torii",
    builds: "Vermilion torii gate with two round pillars on black bases, kasagi and shimaki top beams, nuki tie beam, central name plaque, gold caps, and a hanging shimenawa rope with paper shide",
    box: [
      [-1.5, 0, 1.3],
      [1.5, 3.2, 2.1],
    ],
    attaches: "Stands on the stone platform front edge (top y=0.3, z from 1.3 to 2.1); pillar feet land on the platform top",
    joints: ["root"],
    floor: false,
    budget: 220,
  },
  {
    id: "lanterns",
    builds: "Pair of stone toro lanterns with base, post, glowing fire box, roof cap, finial, and a few hanging paper lanterns on the shrine eaves",
    box: [
      [-1.7, 0, 0.3],
      [1.7, 1.9, 1.2],
    ],
    attaches: "Platform top at x=+-1.2, z=0.8, and the eave beams of the shrine roof front edge",
    joints: ["root"],
    floor: false,
    budget: 200,
  },
  {
    id: "offerings",
    builds: "Offering table contents: wooden donation box with slats and coin slot, sake barrel, fruit, rice bowls, coins, paper charms (ema plaques), small fox statues flanking the steps",
    box: [
      [-1.4, 0.3, 0.2],
      [1.4, 1.2, 1.3],
    ],
    attaches: "Platform top surface y=0.3 in front of the shrine steps",
    joints: ["root"],
    floor: false,
    budget: 200,
  },
  {
    id: "roofDetail",
    builds: "Roof ornaments: ridge end ornaments (onigawara), gold finial, tile ridge lines, eave tips with gold trim, hanging bell with rope, and rune emblem plaque on the gable",
    box: [
      [-1.35, 1.5, -0.9],
      [1.35, 2.7, 0.9],
    ],
    attaches: "Top and edges of the shrine roof slab and ridge block",
    joints: ["shrine"],
    floor: false,
    budget: 150,
  },
  {
    id: "nature",
    builds: "Sakura branch overhanging the back, fallen petals, moss on stone, grass tufts at the platform edge and a small stone path",
    box: [
      [-2.2, 0, -2.0],
      [2.2, 3.0, 2.4],
    ],
    attaches: "Platform edges and rear of shrine; grass sits on y=0 ground around the platform",
    joints: ["root"],
    floor: true,
    budget: 130,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const shrine = b.joint("shrine", { parent: root, at: [0, 0.3, -0.2], dir: [0, 1, 0] });

  const STONE = "#9a9a94";
  const STONE_D = "#77777a";
  const WOOD = "#7a4a2c";
  const WOOD_D = "#4f2e1c";
  const WALL = "#efe3c8";
  const ROOF = "#2f3f5c";
  const ROOF_T = "#3f5478";
  const RED = "#c8321f";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, bone: any = root) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });

  // ground stone platform: two tiers
  box(3.2, 0.16, 2.6, STONE_D, 0, 0.08, 0.3);
  box(3.0, 0.14, 2.4, STONE, 0, 0.23, 0.3);

  // front steps
  box(1.0, 0.1, 0.3, STONE, 0, 0.05, 1.75);
  box(0.9, 0.1, 0.25, STONE, 0, 0.15, 1.6);

  // shrine body
  box(2.0, 0.2, 1.6, STONE_D, 0, 0.4, -0.2, shrine);
  box(1.7, 1.0, 1.3, WALL, 0, 1.0, -0.2, shrine);
  // corner posts
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.12, 1.1, 0.12), WOOD, { bone: shrine, at: [sx * 0.85, 1.0, -0.2 + sz * 0.65] });
  // door recess
  box(0.7, 0.8, 0.05, WOOD_D, 0, 0.95, 0.47, shrine);
  // lintel beam
  box(1.9, 0.12, 1.5, WOOD, 0, 1.56, -0.2, shrine);

  // roof: two tiers sloped
  b.part(new THREE.CylinderGeometry(0.9, 1.5, 0.3, 4, 1), ROOF, {
    bone: shrine,
    at: [0, 1.75, -0.2],
    rotation: [0, 45, 0],
    scale: [1, 1, 0.8],
  });
  b.part(new THREE.CylinderGeometry(0.15, 0.95, 0.3, 4, 1), ROOF_T, {
    bone: shrine,
    at: [0, 2.0, -0.2],
    rotation: [0, 45, 0],
    scale: [1, 1, 0.8],
  });
  box(0.9, 0.12, 0.2, ROOF, 0, 2.2, -0.2, shrine);

    for (const add of PARTS) add(b);
  return b.root;
}
