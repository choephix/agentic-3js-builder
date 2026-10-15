// Monster truck in pixel art: red flame-painted pickup body on a tall chassis, 1.8 m tyres, shocks and links.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description:
    "Pixel-art monster truck: flame-painted red pickup body on a tall chassis with huge lugged tyres, coil-over shocks, link bars, roll hoop, light bars, chrome stacks and a skull emblem.",
  style: "pixel art",
  commit: "88fc1f0",
};

type Col = string | Paint;

const R = 0.91; // wheel centre height (tyre outer radius)

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const REDS = ["#4a0a10", "#7a1016", "#a91a1c", "#d12a1e", "#ee5428", "#ff8744"].map((c) => snapColor(c, 32));
const BODY = cellPaint(
  0.05,
  (c) => {
    const y = c.at.y;
    if (y < 1.985) return "#15151b";
    if (c.n.y > 0.6 && Math.abs(c.at.x) < 0.13) return "#f2c230";
    if (c.n.y > 0.6 && Math.abs(c.at.x) < 0.19) return "#15151b";
    const v = 0.5 + 0.3 * c.n.y + 0.1 * (c.random(3) - 0.5) - 0.25 * Math.max(0, 2.2 - y);
    return c.pick(REDS, v);
  },
  { dither: true },
);
const CHROME = ["#6c7080", "#9aa0b0", "#c9ccd4", "#eceef2"];
const CHROMEP = cellPaint(
  0.04,
  (c) => c.pick(CHROME, 0.5 + 0.3 * c.n.y + (c.random(1) - 0.5) * 0.2),
  { dither: true },
);
const STEEL = cellPaint(
  0.04,
  (c) => c.pick(["#1c1d24", "#2c2e38", "#434654", "#5c6072"], 0.4 + 0.25 * c.n.y + (c.random(1) - 0.5) * 0.25),
  { dither: true },
);
const YEL = cellPaint(
  0.04,
  (c) => c.pick(["#a86b0a", "#d9971a", "#f2c230", "#ffe066"], 0.5 + 0.3 * c.n.y + (c.random(2) - 0.5) * 0.2),
  { dither: true },
);
const RUBBER = ["#101015", "#1a1a21", "#24242d"];
const TYRE = cellPaint(0.045, (c) => c.pick(RUBBER, 0.25 + 0.5 * c.random(2)));

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const GLASS = ["#173a5c", "#25679a", "#4aa6d6", "#a8e6ff"];

function glassTex(w: number, h: number, flip: boolean, slant: number, pillar: number) {
  return pixelTexture(w, h, (g) => {
    g.fill((x, y) => {
      const xx = flip ? w - 1 - x : x;
      const lo = Math.round(slant * (1 - y / (h - 1)));
      if (xx < lo) return "";
      if (xx === lo || y === 0 || y === h - 1 || xx === w - 1 || xx === pillar) return "#14141a";
      const v = 0.3 + 0.4 * (1 - y / (h - 1)) + ((xx + y) % 9 < 2 ? 0.3 : 0);
      return pick(GLASS, v, bayer(x, y));
    });
  });
}

function flameTex(flip: boolean) {
  return pixelTexture(40, 11, (g) => {
    g.fill((x, y) => {
      const xx = flip ? 39 - x : x;
      const yy = 10 - y;
      const amp = 9 * (1 - xx / 46) + 1;
      const h = 2 + amp * ((xx % 10) / 9);
      if (yy >= h) return "";
      if (yy >= h - 1) return "#7a1010";
      const rel = yy / h;
      return rel < 0.3 ? "#fff3a0" : rel < 0.62 ? "#ffc42e" : "#f07a1a";
    });
  });
}

const SKULL = pixelArt(
  [
    "....kkkkkkkk....",
    "..kkwwwwwwwwkk..",
    ".kwwwwwwwwwwwwk.",
    "kwwwwwwwwwwwwwwk",
    "kwwkkkkwwkkkkwwk",
    "kwwkkkkwwkkkkwwk",
    "kwwwkkwwwwkkwwwk",
    "kwwwwwwkkwwwwwwk",
    ".kwwwwwkkwwwwwk.",
    "..kwwwwwwwwwwk..",
    "...kwwkwwkwwk...",
    "...kwwkwwkwwk...",
    "....kwwwwwwk....",
    "....kkkkkkkk....",
  ],
  { k: "#0d0d12", w: "#f0e8d0" },
);

const GRILLE = pixelTexture(24, 12, (g) => {
  g.fill((x, y) => {
    if (x === 0 || y === 0 || x === 23 || y === 11) return pick(CHROME, 0.7);
    if (x % 3 === 1) return pick(CHROME, 0.4 + 0.5 * (1 - y / 11), bayer(x, y));
    return "#0b0b0f";
  });
  g.stamp(10, 4, [".yy.", "yyyy", "yyyy", ".yy."], { y: "#f2c230" });
});

const PLATE = pixelTexture(18, 7, (g) => {
  g.fill(() => "#f4efe0");
  g.fill((x, y) => (x === 0 || y === 0 || x === 17 || y === 6 ? "#1b3a8a" : undefined));
  g.stamp(3, 1, ["###.###.###", "..#.#.#.#.#", ".#..#.#.#.#", ".#..#.#.#.#", ".#..###.###"], { "#": "#14141a" });
});

const LINER = pixelTexture(32, 32, (g) => {
  g.fill((x, y) =>
    x % 4 === 0 ? "#0d0d11" : pick(["#17171d", "#20202a", "#2b2b37"], 0.35 + 0.4 * ((y % 8) / 8), bayer(x, y)),
  );
});

function hash(x: number, y: number) {
  return (Math.imul(x + 11, 73856093) ^ Math.imul(y + 7, 19349663)) >>> 0;
}

const TYRE_FACE = pixelTexture(40, 40, (g) => {
  g.fill((x, y) => {
    const dx = x - 19.5;
    const dy = y - 19.5;
    const d = Math.hypot(dx, dy);
    if (d > 19.6) return "";
    const frac = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
    const idx = Math.floor(frac * 40);
    let col: string;
    if (d > 17.2) col = idx % 2 === 0 ? "#2f2f3a" : "#16161c";
    else if (d > 16.2) col = "#101015";
    else if (d > 12.6) {
      const i72 = Math.floor(frac * 72);
      const text = d > 13.8 && d < 15.4 && i72 % 4 !== 3 && hash(i72, 3) % 3 !== 0;
      col = text ? "#e9e6da" : pick(["#1a1a22", "#25252f", "#30303c"], 0.45 - 0.2 * (dy / 20), bayer(x, y));
    } else if (d > 11.4) col = "#f2c230";
    else if (d > 10.3) col = "#101015";
    else if (d > 8.4) {
      const k = frac * 16;
      const bolt = Math.abs(k - Math.round(k)) < 0.15 && d > 9 && d < 9.8;
      col = bolt ? "#2a2c35" : pick(CHROME, 0.5 - 0.4 * (dy / 10), bayer(x, y));
    } else if (d > 3.2) {
      const k = frac * 5;
      const f = k - Math.floor(k);
      col =
        f < 0.18 || f > 0.82
          ? pick(CHROME, 0.55 - 0.3 * (dy / 8), bayer(x, y))
          : pick(["#2a2c35", "#3c4050", "#5a6072"], 0.4 + 0.3 * (dy / 8), bayer(x, y));
    } else col = d < 1.2 ? "#d6301f" : pick(CHROME, 0.6 - 0.3 * (dy / 3), bayer(x, y));
    // mud splatter on the lower part of the wall
    if (y > 26 && d > 10.3 && hash(x, y) % 100 < ((y - 26) / 14) * 55) {
      return ["#4a3220", "#6b4a2a", "#8a643a"][hash(y, x) % 3];
    }
    return col;
  });
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 1.3, 0] });

  const bx = (
    w: number,
    h: number,
    d: number,
    color: Col,
    x: number,
    y: number,
    z: number,
    bone: Joint = chassis,
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });
  const cyl = (
    r: number,
    h: number,
    color: Col,
    at: number[],
    dir: number[],
    bone: Joint = chassis,
    seg = 8,
  ) => b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });
  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: number[],
    dir: number[],
    bone: Joint = chassis,
    up?: number[],
  ) => b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });

  // ---- Frame rails, crossmembers, drivetrain
  for (const s of [1, -1]) bx(0.14, 0.22, 4.8, STEEL, s * 0.55, 1.25, 0.1);
  for (const z of [-2.1, -0.9, 0.3, 1.0, 2.2]) bx(1.2, 0.12, 0.12, STEEL, 0, 1.25, z);
  bx(0.5, 0.3, 0.6, STEEL, 0, 1.05, 0);
  b.rod([0, 0.95, 1.35], [0, 1.05, -1.35], 0.05, STEEL, { bone: chassis, sides: 6 });
  bx(1.7, 0.12, 0.3, STEEL, 0, 1.5, 2.35);
  bx(1.6, 0.1, 0.4, STEEL, 0, 1.5, -2.1);

  // ---- Axles
  for (const cz of [1.6, -1.6]) {
    b.rod([-1.025, 0.91, cz], [1.025, 0.91, cz], 0.1, STEEL, { bone: chassis, sides: 8 });
    b.part(new THREE.SphereGeometry(0.27, 8, 6), YEL, { bone: chassis, at: [0, 0.93, cz] });
    const q = cz > 0 ? 1 : -1;
    cyl(0.2, 0.08, YEL, [0, 0.93, cz + q * 0.24], [0, 0, 1]);
    const bolts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      bolts.push(
        new THREE.BoxGeometry(0.04, 0.04, 0.03).translate(
          0.15 * Math.cos(a),
          0.93 + 0.15 * Math.sin(a),
          cz + q * 0.29,
        ),
      );
    }
    b.part(mergeGeometries(bolts)!, "#15151b", { bone: chassis, at: [0, 0, 0] });
    // link bars
    for (const s of [1, -1]) {
      b.rod([s * 0.7, 0.78, cz], [s * 0.55, 1.18, cz - q * 1.1], 0.04, STEEL, { bone: chassis, sides: 6 });
      b.rod([s * 0.2, 1.17, cz], [s * 0.5, 1.3, cz - q * 0.9], 0.035, STEEL, { bone: chassis, sides: 6 });
    }
    // shocks, towers, posts, springs
    const rings: THREE.BufferGeometry[] = [];
    for (const s of [1, -1]) {
      b.rod([s * 0.8, 1.0, cz], [s * 0.8, 1.45, cz], 0.06, YEL, { bone: chassis, sides: 6 });
      b.rod([s * 0.8, 1.42, cz], [s * 0.8, 1.85, cz], 0.035, CHROMEP, { bone: chassis, sides: 6 });
      bx(0.2, 0.08, 0.3, STEEL, s * 0.8, 1.83, cz);
      bx(0.16, 0.08, 0.16, STEEL, s * 0.8, 0.98, cz);
      bx(0.12, 0.45, 0.12, STEEL, s * 0.65, 1.58, cz);
      for (let i = 0; i < 7; i++) {
        const t = new THREE.TorusGeometry(0.085, 0.018, 4, 8);
        t.rotateX(Math.PI / 2);
        t.translate(s * 0.8, 1.12 + ((i + 0.5) / 7) * 0.6, cz);
        rings.push(t);
      }
    }
    b.part(mergeGeometries(rings)!, "#d6301f", { bone: chassis, at: [0, 0, 0] });
  }
  // tie rod
  b.rod([-0.9, 0.8, 1.82], [0.9, 0.8, 1.82], 0.03, STEEL, { bone: chassis, sides: 6 });

  // ---- Wheels
  const lugGeo = (cx: number, cz: number) => {
    const gs: THREE.BufferGeometry[] = [];
    const N = 14;
    for (const row of [-1, 1])
      for (let i = 0; i < N; i++) {
        const a = ((i + (row > 0 ? 0.5 : 0)) / N) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.36, 0.13, 0.28);
        g.applyMatrix4(
          new THREE.Matrix4()
            .makeTranslation(cx, R, cz)
            .multiply(new THREE.Matrix4().makeRotationX(a))
            .multiply(new THREE.Matrix4().makeTranslation(row * 0.19, 0.84, 0)),
        );
        gs.push(g);
      }
    return mergeGeometries(gs)!;
  };
  const nutGeo = (cx: number, cz: number, side: number) => {
    const gs: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 5; k++) {
      const a = ((k * 72 + 36) * Math.PI) / 180;
      const g = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6);
      g.rotateZ(Math.PI / 2);
      g.translate(cx + side * 0.39, R + 0.2 * Math.cos(a), cz + 0.2 * Math.sin(a));
      gs.push(g);
    }
    return mergeGeometries(gs)!;
  };
  const wheel = (name: string, parent: Joint, side: number, cz: number) => {
    const cx = side * 1.4;
    const w = b.joint(name, { parent, at: [cx, R, cz], dir: [side, 0, 0], role: "hinge" });
    b.part(new THREE.CylinderGeometry(0.8, 0.8, 0.74, 18), TYRE, { bone: w, at: [cx, R, cz], dir: [1, 0, 0] });
    b.part(lugGeo(cx, cz), "#241d16", { bone: w, at: [0, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.752, 16), CHROMEP, { bone: w, at: [cx, R, cz], dir: [1, 0, 0] });
    decal(TYRE_FACE, 1.6, 1.6, [cx + side * 0.381, R, cz], [side, 0, 0], w);
    b.part(nutGeo(cx, cz, side), "#e9ecf2", { bone: w, at: [0, 0, 0] });
    return w;
  };
  const steerL = b.joint("steerL", { parent: chassis, at: [1.4, R, 1.6], dir: [0, 1, 0], role: "hinge" });
  const steerR = b.joint("steerR", { parent: chassis, at: [-1.4, R, 1.6], dir: [0, 1, 0], role: "hinge" });
  wheel("wheelFL", steerL, 1, 1.6);
  wheel("wheelFR", steerR, -1, 1.6);
  wheel("wheelRL", chassis, 1, -1.6);
  wheel("wheelRR", chassis, -1, -1.6);

  // ---- Body shell (side profile extruded across the width)
  b.extrude(
    [
      [-0.7, 1.9],
      [2.5, 1.9],
      [2.5, 2.4],
      [0.85, 2.45],
      [0.4, 3.1],
      [-0.55, 3.1],
      [-0.7, 2.55],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, color: BODY, bone: chassis, name: "bodyShell" },
  );

  // windows
  for (const s of [1, -1]) {
    decal(glassTex(24, 8, s < 0, 6, 13), 1.26, 0.44, [s * 0.958, 2.82, 0.11], [s, 0, 0]);
  }
  const wsN = [0, 0.587, 0.809];
  decal(glassTex(32, 12, false, 0, -1), 1.7, 0.64, [0, 2.775 + wsN[1] * 0.012, 0.625 + wsN[2] * 0.012], wsN);
  decal(glassTex(24, 8, false, 0, -1), 1.3, 0.43, [0, 2.828, -0.6366], [0, 0.263, -0.965]);

  // hood: flames, skull, blower, stacks
  for (const s of [1, -1]) decal(flameTex(s < 0), 1.5, 0.42, [s * 0.975, 2.19, 1.72], [s, 0, 0]);
  decal(SKULL, 0.6, 0.525, [0, 2.416, 2.2], [0, 1, 0], chassis, [0, 0, 1]);
  bx(0.62, 0.3, 0.75, CHROMEP, 0, 2.58, 1.55);
  for (const z of [1.35, 1.75]) bx(0.66, 0.32, 0.07, YEL, 0, 2.58, z);
  for (const x of [-0.16, 0.16])
    for (const z of [1.33, 1.77]) {
      cyl(0.08, 0.25, CHROMEP, [x, 2.83, z], [0, 1, 0], chassis, 8);
      cyl(0.065, 0.012, "#0b0b0f", [x, 2.962, z], [0, 1, 0], chassis, 8);
    }

  // grille, headlights, bumper, guard
  bx(0.8, 0.4, 0.05, "#0b0b0f", 0, 2.2, 2.525);
  decal(GRILLE, 0.76, 0.38, [0, 2.2, 2.556], [0, 0, 1]);
  for (const s of [1, -1]) {
    bx(0.4, 0.28, 0.04, CHROMEP, s * 0.7, 2.2, 2.52);
    glow(bx(0.32, 0.2, 0.05, "#fff1b0", s * 0.7, 2.2, 2.545), 1.4);
    glow(bx(0.16, 0.1, 0.05, "#ffb347", s * 0.88, 2.05, 2.52), 1.2);
    glow(bx(0.16, 0.12, 0.05, "#fff1b0", s * 0.8, 1.72, 2.745), 1.4);
    bx(0.12, 0.1, 0.08, "#d6301f", s * 0.45, 1.72, 2.76);
  }
  bx(2.0, 0.22, 0.2, CHROMEP, 0, 1.72, 2.62);
  for (const x of [-0.6, -0.3, 0, 0.3, 0.6])
    b.rod([x, 1.72, 2.72], [x, 2.3, 2.74], 0.03, CHROMEP, { bone: chassis, sides: 6 });
  b.rod([-0.62, 2.3, 2.74], [0.62, 2.3, 2.74], 0.035, CHROMEP, { bone: chassis, sides: 6 });

  // fenders, mud flaps, steps, mirrors
  for (const s of [1, -1]) {
    for (const cz of [1.6, -1.6]) {
      bx(0.8, 0.1, 1.4, BODY, s * 1.35, 1.92, cz);
      bx(0.82, 0.03, 1.42, "#15151b", s * 1.35, 1.865, cz);
    }
    bx(0.5, 0.45, 0.03, "#15151b", s * 1.4, 1.66, -2.6);
    bx(0.5, 0.06, 0.035, "#f2c230", s * 1.4, 1.5, -2.6);
    bx(0.14, 0.05, 1.1, STEEL, s * 1.02, 1.68, 0);
    b.rod([s * 0.96, 2.75, 0.55], [s * 1.22, 2.82, 0.7], 0.02, "#15151b", { bone: chassis, sides: 4 });
    bx(0.05, 0.24, 0.18, "#15151b", s * 1.25, 2.82, 0.72);
    bx(0.04, 0.2, 0.012, CHROMEP, s * 1.25, 2.82, 0.628);
  }

  // roof: visor, light bar, antenna
  bx(1.9, 0.05, 0.2, "#15151b", 0, 3.13, 0.5);
  bx(1.4, 0.08, 0.2, "#15151b", 0, 3.14, 0.15);
  for (let i = 0; i < 5; i++) glow(bx(0.2, 0.14, 0.08, "#fff1b0", -0.56 + i * 0.28, 3.22, 0.26), 1.3);
  b.rod([-0.8, 3.1, -0.35], [-0.8, 3.75, -0.4], 0.012, "#15151b", { bone: chassis, sides: 4 });
  b.extrude(
    [
      [0, 0],
      [0.25, 0.07],
      [0, 0.14],
    ],
    { at: [-0.8, 3.58, -0.4], x: [0, 0, -1], thickness: 0.01, color: "#f07a1a", bone: chassis },
  );

  // ---- Bed
  b.part(tileBox([1.7, 0.12, 1.5], LINER, 0.05), "#ffffff", {
    bone: chassis,
    at: [0, 2.04, -1.45],
    texture: LINER,
  });
  for (const s of [1, -1]) {
    bx(0.1, 0.4, 1.6, BODY, s * 0.9, 2.26, -1.5);
    glow(bx(0.12, 0.3, 0.05, "#ff2a2a", s * 0.9, 2.26, -2.325), 1.2);
    // exhaust stacks
    const x = s * 0.6;
    b.rod([x, 2.05, -0.82], [x, 3.2, -0.82], 0.065, CHROMEP, { bone: chassis, sides: 8 });
    b.rod([x, 3.2, -0.82], [x, 3.42, -0.82], [0.065, 0.1], CHROMEP, { bone: chassis, sides: 8 });
    for (const y of [2.3, 2.7, 3.0]) cyl(0.085, 0.05, "#15151b", [x, y, -0.82], [0, 1, 0]);
  }
  bx(1.7, 0.4, 0.1, BODY, 0, 2.26, -0.75);
  // roll hoop and lights
  b.sweep(
    polyline([
      [-0.78, 2.1, -1.0],
      [-0.78, 2.95, -1.0],
      [0.78, 2.95, -1.0],
      [0.78, 2.1, -1.0],
    ]),
    0.04,
    { color: CHROMEP, bone: chassis, sides: 6 },
  );
  b.rod([-0.78, 2.1, -1.0], [0.78, 2.95, -1.0], 0.03, CHROMEP, { bone: chassis, sides: 6 });
  for (const s of [1, -1]) b.rod([s * 0.78, 2.95, -1.0], [s * 0.78, 3.0, -0.6], 0.035, CHROMEP, { bone: chassis, sides: 6 });
  for (const x of [-0.45, -0.15, 0.15, 0.45]) {
    cyl(0.09, 0.12, "#15151b", [x, 3.05, -0.97], [0, 0, 1]);
    glow(cyl(0.07, 0.04, "#fff1b0", [x, 3.05, -0.9], [0, 0, 1]), 1.3);
  }

  // rear bumper, hitch
  bx(2.0, 0.2, 0.2, CHROMEP, 0, 1.8, -2.42);
  b.part(new THREE.SphereGeometry(0.06, 6, 4), CHROMEP, { bone: chassis, at: [0, 1.95, -2.62] });
  b.rod([0, 1.8, -2.5], [0, 1.95, -2.62], 0.035, STEEL, { bone: chassis, sides: 6 });

  // ---- Tailgate
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 2.08, -2.25], dir: [0, 0, -1], role: "hinge" });
  bx(1.7, 0.4, 0.1, BODY, 0, 2.28, -2.25, gate);
  decal(PLATE, 0.36, 0.14, [0, 2.2, -2.307], [0, 0, -1], gate);
  bx(0.4, 0.05, 0.03, "#15151b", 0, 2.42, -2.31, gate);

  // ---- Doors
  for (const s of [1, -1]) {
    const door = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: chassis,
      at: [s * 0.96, 2.2, 0.75],
      dir: [0, 1, 0],
      role: "hinge",
    });
    bx(0.02, 0.6, 1.3, BODY, s * 0.96, 2.2, 0.1, door);
    bx(0.04, 0.05, 0.22, CHROMEP, s * 0.985, 2.4, -0.3, door);
    decal(SKULL, 0.6, 0.525, [s * 0.975, 2.18, 0.2], [s, 0, 0], door);
    bx(0.012, 0.6, 0.014, "#15151b", s * 0.972, 2.2, 0.76);
    bx(0.012, 0.6, 0.014, "#15151b", s * 0.972, 2.2, -0.56);
  }

  return b.root;
}
