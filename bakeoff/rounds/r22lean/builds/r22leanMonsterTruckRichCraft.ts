import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { cellPaint, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "A pixel-art monster truck: 1.7 m tyres with chevron treads, bead-lock rims, coil-over shocks and a four-link chassis under a flame-painted blue pickup body with a blown engine, roll hoop, light bar and nitro bottles.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------- palette ----------
const CHROME = "#c8d0da";
const STEEL = "#3c424c";
const IRON = "#23262d";
const BLACK = "#14141a";
const YELLOW = "#f2c418";
const RED = "#e0402a";
const GOLD = "#c9951c";
const BLUE = ["#102a70", "#1a46a6", "#2565d0", "#4a8eee", "#86bcff"];
const FLAME_Y = "#ffe45a";
const FLAME_O = "#ff9a1c";
const FLAME_R = "#e8401c";
const FLAME_EDGE = "#8a1a0a";
const GLASS = ["#0d2a3a", "#1b5a78", "#3d95b8", "#9fe0f0"];
const SILVER = ["#5b6470", "#8a929c", "#b7bfc9", "#e6ebf0"];
const MUD_A = "#6b4a2b";
const MUD_B = "#4e341c";

const tri = (x: number) => Math.abs((((x % 1) + 1) % 1) - 0.5) * 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---------- paints ----------
function bodyFn(c: Cell): string {
  const { x, y, z } = c.at;
  const n = c.n;
  if (y < 1.85) {
    const prob = Math.min(0.75, (1.85 - y) * 2.2) * (0.5 + noise(c.at, 0.25, 4));
    if (c.random(5) < prob) return c.random(6) < 0.5 ? MUD_A : MUD_B;
  }
  if (y < 1.62) return "#15151b";
  if (n.y > 0.8 && y > 2.2) {
    const ax = Math.abs(x);
    if (ax < 0.1) return "#ffd21a";
    if (ax < 0.15) return "#0e1230";
  }
  if (Math.abs(n.x) > 0.6 && y < 2.15) {
    const yy = y - 1.55;
    const p = z * 1.3 + yy * 0.8;
    const k = (1 - tri(p)) * 0.62 - yy;
    if (k > 0) {
      if (k < 0.035) return FLAME_EDGE;
      return k > 0.34 ? FLAME_Y : k > 0.16 ? FLAME_O : FLAME_R;
    }
  }
  const v = 0.55 + 0.28 * n.y + 0.08 * n.z + (noise(c.at, 0.4, 2) - 0.5) * 0.25;
  return c.pick(BLUE, clamp01(v));
}

function cabFn(c: Cell): string {
  const { x, y, z } = c.at;
  const n = c.n;
  const side = Math.abs(n.x) > 0.6;
  let glass = false;
  if (side) {
    const zl = 0.8 - (y - 2.45) * 0.54 - 0.1;
    glass = y > 2.55 && y < 3.03 && z > -0.46 && z < zl && Math.abs(z - 0.02) > 0.035;
    if (!glass && y > 2.17 && Math.abs(z - 0.02) < 0.025) return "#0e1636";
  } else if (n.z > 0.25 && n.y > 0.25) {
    glass = y > 2.5 && y < 3.05 && Math.abs(x) < 0.8;
  } else if (n.z < -0.3) {
    glass = y > 2.58 && y < 3.02 && Math.abs(x) < 0.72;
  }
  if (!glass) return bodyFn(c);
  const diag = (c.u + c.v) % 8;
  const v = diag >= 0 && diag < 2 ? 0.9 : 0.25 + 0.15 * c.random(1) + 0.1 * (y - 2.5);
  return c.pick(GLASS, clamp01(v));
}

const BODY = cellPaint(0.05, bodyFn, { dither: true });
const CAB = cellPaint(0.05, cabFn, { dither: true });

function tyrePaint(cx: number, cy: number, cz: number): Paint {
  return cellPaint(0.04, (c) => {
    const dx = c.at.x - cx;
    const dy = c.at.y - cy;
    const dz = c.at.z - cz;
    const r = Math.hypot(dy, dz);
    const a = Math.atan2(dy, dz) / (2 * Math.PI) + 0.5;
    const ax = Math.abs(c.n.x);
    if (dy < -0.3 && r > 0.55 && c.random(9) < (-dy - 0.3) * 1.5) return c.random(3) < 0.5 ? MUD_A : MUD_B;
    if (ax > 0.6) {
      if (r < 0.14) return c.pick(["#7a5a12", GOLD, YELLOW], 0.45 + 0.4 * c.random(2));
      if (r < 0.2) return "#202228";
      if (r < 0.44) {
        if (((a * 5) % 1) > 0.72) return "#0d0e12";
        return c.pick(SILVER, clamp01(0.75 - (r - 0.2) * 1.4 + (c.random(1) - 0.5) * 0.2));
      }
      if (r < 0.5) return "#303640";
      if (r < 0.78) {
        if (r > 0.62 && r < 0.66) return ((a * 40) % 1) < 0.7 ? "#e8c020" : "#17171d";
        if (r > 0.5 && r < 0.58 && c.random(2) < 0.55 && ((a * 30) % 1) < 0.6) return "#9aa0aa";
        return c.pick(["#0e0e12", "#17171d", "#22222a"], 0.3 + 0.5 * c.random(4));
      }
      return ((a * 28) % 1) < 0.5 ? "#2b2b33" : "#101014";
    }
    if (r < 0.52) return c.pick(SILVER, 0.3 + 0.5 * c.random(1));
    const phase = a * 28 + Math.abs(dx) * 5;
    const lug = ((phase % 1) + 1) % 1 < 0.5;
    if (lug) return c.pick(["#22222a", "#2e2e36", "#3a3a44"], 0.3 + 0.6 * c.random(7));
    return c.pick(["#08080b", "#101014"], c.random(8));
  });
}

// ---------- pixel textures ----------
const GRILLE = pixelTexture(24, 8, (g) => {
  g.fill((x, y) => (y === 0 || y === 7 ? "#aeb6c0" : x % 3 === 0 ? "#7e8792" : "#0c0c10"));
});
const DIAMOND = pixelTexture(8, 8, (g) => {
  g.fill((x, y) => {
    const a = (x + y) % 4;
    const d = (((x - y) % 4) + 4) % 4;
    return a === 0 && d === 0 ? "#c4cbd4" : a === 0 || d === 0 ? "#7d8691" : "#4e5560";
  });
});
const HEADLIGHT = pixelArt([".yyyy.", "ywwwwy", "ywwwwy", "ywwwwy", "ywwwwy", ".yyyy."], { y: "#ffd84a", w: "#fffbe0" });
const SKULL = pixelArt(
  [
    "...wwwww...",
    ".wwwwwwwww.",
    "wwwwwwwwwww",
    "wwkkwwwkkww",
    "wkkkkwkkkkw",
    "wwkkwwwkkww",
    "wwwwwkwwwww",
    ".wwwwwwwww.",
    "..wkwkwkw..",
    "...wwwww...",
  ],
  { w: "#f4f1e0", k: "#10101a" },
);
const PLATE = pixelTexture(12, 6, (g) => {
  g.fill((x, y) => (x === 0 || x === 11 || y === 0 || y === 5 ? "#202030" : y === 1 ? RED : "#f4f4f0"));
  g.stamp(3, 3, ["k.kk.k"], { k: "#202030" });
});
const CHECK = pixelTexture(8, 6, (g) => {
  g.fill((x, y) => (((x >> 1) + (y >> 1)) % 2 ? "#f4f4f4" : RED));
});
const TAILLIGHT = pixelArt(["rrrrrr", "rwrrwr", "rrrrrr", "oooooo"], { r: "#ff3a2a", w: "#ffb0a0", o: "#ff9a1c" });

// ---------- build ----------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "monsterTruck" });

  const box = (w: number, h: number, d: number, color: string | Paint, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cylX = (r: number, len: number, color: string | Paint, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: [0, 0, 90] });
  const cylZ = (r: number, len: number, color: string | Paint, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: [90, 0, 0] });
  const cylY = (r: number, len: number, color: string | Paint, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z] });
  const decal = (tex: THREE.Texture, w: number, h: number, pos: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: pos, dir, axis: "z", texture: tex });

  const TY_R = 0.85;
  const TY_Y = 0.845;
  const WX = 1.6;
  const AXLE_Z = 1.55;

  // ===== wheels =====
  for (const s of [1, -1]) {
    for (const sa of [1, -1]) {
      const cx = s * WX;
      const cz = sa * AXLE_Z;
      const P = tyrePaint(cx, TY_Y, cz);
      b.part(new THREE.CylinderGeometry(TY_R, TY_R, 0.85, 24, 1), P, { at: [cx, TY_Y, cz], rotation: [0, 0, 90] });
      // shoulder rings so the tyre bulges
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 16, 1), P, { at: [cx, TY_Y, cz], rotation: [0, 0, 90] });
      // bead-lock bolts, both faces
      for (const f of [1, -1]) {
        const gs: THREE.BufferGeometry[] = [];
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          gs.push(
            new THREE.BoxGeometry(0.04, 0.05, 0.05).translate(
              cx + f * 0.465,
              TY_Y + Math.sin(a) * 0.47,
              cz + Math.cos(a) * 0.47,
            ),
          );
        }
        b.part(mergeGeometries(gs)!, CHROME, { at: [0, 0, 0] });
        const lug: THREE.BufferGeometry[] = [];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          lug.push(
            new THREE.BoxGeometry(0.05, 0.045, 0.045).translate(
              cx + f * 0.48,
              TY_Y + Math.sin(a) * 0.08,
              cz + Math.cos(a) * 0.08,
            ),
          );
        }
        b.part(mergeGeometries(lug)!, "#f4f1e0", { at: [0, 0, 0] });
        cylX(0.13, 0.05, GOLD, cx + f * 0.475, TY_Y, cz, 8);
      }
    }
  }

  // ===== chassis =====
  for (const s of [1, -1]) {
    box(0.2, 0.26, 4.5, IRON, s * 0.55, 1.25, 0);
    box(0.06, 0.2, 4.5, "#3a3f49", s * 0.66, 1.25, 0);
    for (const z of [-1.8, -0.4, 0.8, 1.9]) box(0.3, 0.16, 0.3, BLACK, s * 0.55, 1.47, z);
  }
  for (const z of [-2.0, -0.8, 0.2, 1.2, 2.0]) box(1.1, 0.2, 0.16, IRON, 0, 1.22, z);
  box(1.0, 0.06, 1.9, STEEL, 0, 1.06, 0.1); // skid plate
  box(0.5, 0.35, 0.6, "#4a505b", 0, 1.0, 0); // transfer case
  b.rod([0, 0.95, -1.4], [0, 0.95, 1.4], 0.06, BLACK, { sides: 8 });
  for (const z of [-0.75, 0.75]) box(0.12, 0.12, 0.1, CHROME, 0, 0.95, z);

  for (const sa of [1, -1]) {
    const za = sa * AXLE_Z;
    b.rod([-1.0, 0.85, za], [1.0, 0.85, za], 0.1, "#3c424c", { sides: 8 });
    b.rod([-1.4, 0.85, za], [1.4, 0.85, za], 0.07, STEEL, { sides: 8 });
    box(0.5, 0.5, 0.5, "#3c424c", 0, 0.85, za);
    cylZ(0.24, 0.18, "#8a929c", 0, 0.85, za + sa * 0.32, 12);
    const bg: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      bg.push(new THREE.BoxGeometry(0.045, 0.045, 0.03).translate(Math.cos(a) * 0.19, 0.85 + Math.sin(a) * 0.19, za + sa * 0.415));
    }
    b.part(mergeGeometries(bg)!, CHROME, { at: [0, 0, 0] });
    // panhard / steering link
    b.rod([-1.0, 0.62, za + sa * 0.3], [1.0, 0.62, za + sa * 0.3], 0.04, GOLD, { sides: 6 });

    for (const s of [1, -1]) {
      // portal hub housing
      box(0.3, 0.38, 0.46, "#4a505b", s * 1.02, 0.85, za);
      box(0.06, 0.3, 0.38, YELLOW, s * 1.2, 0.85, za);
      // links
      b.rod([s * 0.7, 0.8, za], [s * 0.6, 1.1, za - sa * 1.0], 0.05, STEEL, { sides: 6 });
      b.rod([s * 0.3, 1.02, za], [s * 0.45, 1.3, za - sa * 0.8], 0.045, STEEL, { sides: 6 });
      // coil-over shock
      const sx = s * 1.09;
      const sz = za - sa * 0.5;
      b.rod([s * 1.0, 0.85, za], [sx, 0.93, sz], 0.045, STEEL, { sides: 6 });
      b.rod([sx, 0.95, sz], [sx, 1.3, sz], 0.07, YELLOW, { sides: 8 });
      b.rod([sx, 1.3, sz], [sx, 1.95, sz], 0.035, CHROME, { sides: 6 });
      const rings: THREE.BufferGeometry[] = [];
      for (let y = 1.0; y < 1.88; y += 0.07) rings.push(new THREE.CylinderGeometry(0.085, 0.085, 0.035, 8).translate(sx, y, sz));
      b.part(mergeGeometries(rings)!, RED, { at: [0, 0, 0] });
      box(0.16, 0.07, 0.16, YELLOW, sx, 1.99, sz);
      box(0.16, 0.07, 0.16, BLACK, sx, 0.92, sz);
      // reservoir
      cylY(0.045, 0.3, YELLOW, s * 1.0, 1.55, sz + sa * 0.14, 6);
    }
  }

  // ===== body =====
  b.part(new THREE.BoxGeometry(2.0, 0.6, 4.6), BODY, { at: [0, 1.85, 0] });
  b.part(new THREE.BoxGeometry(1.9, 0.3, 1.5), BODY, { at: [0, 2.3, 1.55] });
  b.extrude(
    [
      [-0.6, 2.15],
      [0.8, 2.15],
      [0.8, 2.45],
      [0.45, 3.1],
      [-0.45, 3.1],
      [-0.6, 2.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.8, color: CAB },
  );
  // roof visor
  b.part(new THREE.BoxGeometry(1.8, 0.04, 0.3), "#0e1636", { at: [0, 3.1, 0.55], rotation: [20, 0, 0] });
  // bed
  b.part(tileBox([1.8, 0.06, 1.7], DIAMOND, 0.05), "#ffffff", { texture: DIAMOND, at: [0, 2.18, -1.45] });
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.45, 1.75), BODY, { at: [s * 0.95, 2.375, -1.425] });
    box(0.14, 0.05, 1.79, "#0e1636", s * 0.95, 2.62, -1.425);
    for (let z = -2.2; z < -0.6; z += 0.15) rivets.push(new THREE.BoxGeometry(0.02, 0.03, 0.03).translate(s * 1.005, 2.5, z));
    decal(SKULL, 0.44, 0.4, [s * 1.006, 2.38, -1.45], [s, 0, 0]);
  }
  b.part(mergeGeometries(rivets)!, CHROME, { at: [0, 0, 0] });
  b.part(new THREE.BoxGeometry(1.8, 0.42, 0.08), BODY, { at: [0, 2.37, -2.26] });
  box(0.3, 0.05, 0.04, CHROME, 0, 2.5, -2.32);
  box(1.9, 0.05, 0.1, "#0e1636", 0, 2.6, -2.26);

  // hood details: blower + scoop
  cylZ(0.22, 0.85, CHROME, 0, 2.62, 1.45, 10);
  box(0.62, 0.1, 0.5, "#8a929c", 0, 2.52, 1.45);
  cylZ(0.2, 0.05, GOLD, 0, 2.62, 1.9, 10);
  for (const z of [1.15, 1.3, 1.45, 1.6, 1.75]) box(0.5, 0.04, 0.03, "#5b6470", 0, 2.86, z);
  box(0.56, 0.26, 0.62, BLACK, 0, 2.98, 1.4);
  decal(GRILLE, 0.5, 0.2, [0, 2.98, 1.711], [0, 0, 1]);
  // injector stacks
  for (const s of [1, -1]) for (const z of [1.1, 1.45, 1.8]) cylY(0.05, 0.1, CHROME, s * 0.33, 2.78, z, 8);
  // hood pins
  for (const s of [1, -1]) for (const z of [2.2, 0.95]) cylY(0.025, 0.05, CHROME, s * 0.8, 2.47, z, 6);

  // front end
  decal(GRILLE, 1.24, 0.34, [0, 1.93, 2.305], [0, 0, 1]);
  for (const s of [1, -1]) {
    box(0.34, 0.4, 0.03, "#2a2e36", s * 0.84, 1.93, 2.31);
    glow(decal(HEADLIGHT, 0.28, 0.34, [s * 0.84, 1.93, 2.332], [0, 0, 1]), 1.4);
    glow(box(0.2, 0.12, 0.02, "#ffb347", s * 0.5, 1.67, 2.505), 1.2);
  }
  b.part(tileBox([2.1, 0.22, 0.2], DIAMOND, 0.05), "#ffffff", { texture: DIAMOND, at: [0, 1.67, 2.4] });
  b.part(tileBox([2.1, 0.22, 0.2], DIAMOND, 0.05), "#ffffff", { texture: DIAMOND, at: [0, 1.67, -2.4] });
  const brv: THREE.BufferGeometry[] = [];
  for (let x = -0.95; x < 1.0; x += 0.19) {
    brv.push(new THREE.BoxGeometry(0.03, 0.03, 0.03).translate(x, 1.74, 2.505));
    brv.push(new THREE.BoxGeometry(0.03, 0.03, 0.03).translate(x, 1.74, -2.505));
  }
  b.part(mergeGeometries(brv)!, CHROME, { at: [0, 0, 0] });
  for (const s of [1, -1]) box(0.14, 0.1, 0.14, RED, s * 0.8, 1.58, 2.5);

  // rear end
  for (const s of [1, -1]) {
    box(0.34, 0.26, 0.03, "#2a2e36", s * 0.8, 1.9, -2.31);
    glow(decal(TAILLIGHT, 0.3, 0.22, [s * 0.8, 1.9, -2.332], [0, 0, -1]), 1);
  }
  decal(PLATE, 0.42, 0.21, [0, 1.95, -2.304], [0, 0, -1]);
  for (const s of [1, -1]) box(0.14, 0.1, 0.14, RED, s * 0.8, 1.58, -2.5);

  // cab details
  for (const s of [1, -1]) {
    box(0.03, 0.04, 0.16, CHROME, s * 0.915, 2.42, -0.22);
    b.rod([s * 0.9, 2.85, 0.5], [s * 1.12, 2.9, 0.55], 0.015, CHROME, { sides: 6 });
    box(0.06, 0.22, 0.14, BLACK, s * 1.15, 2.9, 0.55);
  }
  // light bar
  box(1.5, 0.14, 0.16, BLACK, 0, 3.2, 0.2);
  box(0.1, 0.1, 0.1, STEEL, -0.55, 3.12, 0.2);
  box(0.1, 0.1, 0.1, STEEL, 0.55, 3.12, 0.2);
  for (let i = 0; i < 6; i++) glow(box(0.2, 0.1, 0.02, "#fff2a0", -0.625 + i * 0.25, 3.2, 0.29), 1.5);

  // exhaust stacks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.5, 2.2, -0.72],
        [s * 0.5, 3.0, -0.72],
        [s * 0.58, 3.42, -0.72],
      ]),
      [0.08, 0.07],
      CHROME,
      { sides: 8 },
    );
    cylY(0.1, 0.06, GOLD, s * 0.5, 2.55, -0.72, 8);
    cylY(0.1, 0.06, GOLD, s * 0.5, 2.9, -0.72, 8);
  }

  // roll hoop and braces
  b.sweep(
    [
      [-0.8, 2.2, -1.0],
      [-0.8, 2.85, -1.0],
      [0.8, 2.85, -1.0],
      [0.8, 2.2, -1.0],
    ],
    0.04,
    CHROME,
    { sides: 6 },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 2.85, -1.0], [s * 0.8, 2.75, -0.62], 0.03, CHROME, { sides: 6 });
    box(0.14, 0.04, 0.14, STEEL, s * 0.8, 2.22, -1.0);
  }

  // nitro bottles
  for (const s of [1, -1]) {
    b.capsule([s * 0.35, 2.38, -1.95], [s * 0.35, 2.38, -1.15], 0.15, s > 0 ? RED : "#3a78d0", { sides: 8 });
    cylZ(0.155, 0.08, YELLOW, s * 0.35, 2.38, -1.4, 8);
    cylZ(0.155, 0.08, YELLOW, s * 0.35, 2.38, -1.7, 8);
    cylZ(0.04, 0.1, CHROME, s * 0.35, 2.38, -1.0, 6);
    box(0.5, 0.03, 0.05, BLACK, s * 0.35, 2.55, -1.55);
  }

  // antenna and flag
  b.rod([0.88, 2.62, -1.9], [0.88, 3.75, -1.9], 0.012, CHROME, { sides: 4 });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [0.88, 3.77, -1.9] });
  decal(CHECK, 0.35, 0.26, [0.884, 3.6, -2.08], [1, 0, 0]);
  decal(CHECK, 0.35, 0.26, [0.876, 3.6, -2.08], [-1, 0, 0]);

  return b.root;
}
