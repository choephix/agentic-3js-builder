import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { spiral } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";
import type { PixelGrid } from "../../../../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description:
    "A pixel-art monster truck: a flame-painted red pickup body perched on four giant lugged tyres, with coil-over shocks, roll cage, light bar and exhaust stacks. Wheels, steering, doors, hood and tailgate are hinged.",
  style: "pixel art",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

const INK = "#14141c";
const STEEL = "#8e98a8";
const CHROME = "#d6dde8";
const CHROME_D = "#6a7484";
const RAIL = "#262633";
const SPRING = "#ffd23a";
const ORANGE = "#ff8a1f";

const snap = (c: string) => snapColor(c, 32);
const REDS = ["#3a0912", "#6b0f1e", "#a3152a", "#d6263a", "#ff5a50"].map(snap);
const FLAME = ["#ff4a10", "#ff9a1f", "#ffe45c"].map(snap);
const RUBBER = ["#08080c", "#121218", "#1d1d26", "#2c2c38"].map(snap);
const MUD = ["#3b2c1c", "#5a4630", "#7a6240"].map(snap);
const GLASS = ["#0d1a2e", "#1b3558", "#2f5a8a", "#5d90c0"].map(snap);

// Body paint in 5 cm cells: red pickup with a racing stripe, dark skirts and backswept flames along the flanks.
const bodyPaint = cellPaint(
  0.05,
  (c) => {
    const { x, y, z } = c.at;
    if (c.axis === 1 && y > 2.2 && Math.abs(x) < 0.15) return Math.abs(x) < 0.09 ? "#f4f0e6" : INK;
    if (y < 1.58 && c.axis !== 1) return "#2b2c3a";
    if (c.axis === 0 && z > -1.0) {
      const d = 2.3 - z;
      if (d >= 0 && d < 3.9) {
        const saw = (d * 1.9) % 1;
        const top = 1.6 + (1.05 - 0.24 * d) * (1 - saw * 0.9);
        if (y < top) {
          const f = (y - 1.55) / (top - 1.55);
          return f < 0.3 ? FLAME[2] : f < 0.62 ? FLAME[1] : FLAME[0];
        }
      }
    }
    const v = 0.45 + (0.3 * (y - 1.5)) / 1.3 + 0.2 * c.n.y + 0.14 * (noise(c.at, 0.5, 3) - 0.5);
    return c.pick(REDS, v);
  },
  { dither: true },
);

// Tyre paint: dithered rubber, red sidewall ring, white dashed lettering band and mud near the ground.
const tirePaint = (cy: number, cz: number) =>
  cellPaint(
    0.03,
    (c) => {
      const { y, z } = c.at;
      if (y < 0.4 && c.random(3) < (0.4 - y) * 1.8) return c.pick(MUD, 0.3 + 0.6 * c.random(4));
      if (c.axis === 0) {
        const dy = y - cy;
        const dz = z - cz;
        const r = Math.hypot(dy, dz);
        if (r > 0.54 && r < 0.59) return "#d6263a";
        if (r > 0.65 && r < 0.72) {
          const seg = Math.floor((Math.atan2(dz, dy) + Math.PI) * 7);
          if (seg % 3 !== 0 && c.random(5 + (seg % 5)) > 0.2) return "#e8e8ee";
        }
      }
      return c.pick(RUBBER, noise(c.at, 0.12, 2) * 0.8 + 0.08 * c.random(1));
    },
    { dither: true },
  );

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const glassFill = (g: PixelGrid, hi: number) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return INK;
    const base = 0.15 + 0.6 * (1 - y / h);
    const streak = (x * 2 + y * 3) % hi < 2 && y > 1 ? 0.35 : 0;
    return pick(GLASS, base + streak, bayer(x, y));
  });
};
const HELMET_F = [".rrrr.", "rrrrrr", "rkkkkr", "rrrrrr", "kkkkkk", "kkkkkk"];
const HELMET_S = [".rrrr.", "rrsrrr", "rrvvvv", "rrrrrr", "kkkkkk", "kkkkkk"];
const WINDSHIELD = pixelTexture(32, 12, (g) => {
  glassFill(g, 13);
  g.stamp(5, 5, HELMET_F, { r: "#2f6fe0", k: "#0a0a10" });
  g.stamp(21, 5, HELMET_F, { r: "#e0302a", k: "#0a0a10" });
});
const sideGlass = (hx: number, helmet: string) =>
  pixelTexture(20, 10, (g) => {
    glassFill(g, 11);
    g.stamp(hx, 3, HELMET_S, { r: helmet, s: "#ffffff", v: "#0a0a10", k: "#0a0a10" });
  });
const SIDE_L = sideGlass(6, "#e0302a");
const SIDE_R = sideGlass(8, "#2f6fe0");
const REAR_GLASS = pixelTexture(20, 8, (g) => glassFill(g, 9));

const GRILLE = pixelTexture(20, 8, (g) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return CHROME_D;
    if (y === 3 || y === 4) return CHROME;
    return x % 2 === 0 ? "#c0c8d6" : "#161821";
  });
  g.stamp(9, 3, ["rr", "rr"], { r: "#d6263a" });
});

const D1 = [".k.", "kk.", ".k.", ".k.", "kkk"];
const D3 = ["kkk", "..k", ".kk", "..k", "kkk"];
const ROUNDEL = pixelTexture(14, 10, (g) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return INK;
    return y === 1 || y === h - 2 || x === 1 || x === w - 2 ? "#ff9a1f" : "#ffe45c";
  });
  for (const [cx, cy] of [
    [0, 0],
    [13, 0],
    [0, 9],
    [13, 9],
  ])
    g.set(cx, cy, "");
  g.stamp(3, 2, D1, { k: INK });
  g.stamp(8, 2, D3, { k: INK });
});
const PLATE = pixelTexture(19, 7, (g) => {
  g.fill((x, y, w, h) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#2a3a8a" : "#f4f4ee"));
  [D1, D3, D3, D1].forEach((d, i) => g.stamp(2 + i * 4, 1, d, { k: "#1a1a22" }));
});
const SKULL = pixelArt(
  [
    "..kkkkkkkk..",
    ".kwwwwwwwwk.",
    "kwwwwwwwwwwk",
    "kwwkkwwkkwwk",
    "kwkkkwwkkkwk",
    "kwwkkwwkkwwk",
    "kwwwwkkwwwwk",
    ".kwwwwwwwwk.",
    "..kwkwkwkwk.",
    "..kwkwkwkwk.",
    "...kkkkkkk..",
  ],
  { k: INK, w: "#f2f0e0" },
);
const RIB = pixelTexture(16, 12, (g) => g.fill((_x, y) => (y % 4 === 0 ? "#14141a" : y % 4 === 1 ? "#3a3d48" : "#2a2c36")));

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const root = b.joint("chassis", { at: [0, 1.3, 0] });

  const box = (size: P3, at: P3, color: string | Paint, bone: Joint = root) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at });
  const cyl = (r0: number, r1: number, h: number, seg: number, at: P3, dir: P3, color: string | Paint, bone: Joint = root) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, dir });
  const lamp = (size: P3, at: P3, color: string, strength: number, bone: Joint = root) =>
    glow(box(size, at, color, bone), strength);
  const decal = (
    w: number,
    h: number,
    tex: THREE.Texture,
    at: P3,
    dir: P3,
    up: P3 = [0, 1, 0],
    bone: Joint = root,
  ) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, up, axis: "z", texture: tex });
  const merged = (geos: THREE.BufferGeometry[], color: string | Paint, bone: Joint = root) =>
    b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  const boxG = (w: number, h: number, d: number, x: number, y: number, z: number) =>
    new THREE.BoxGeometry(w, h, d).translate(x, y, z);

  // -------------------------------------------------------------------------------------------------------------
  // Hinged panels
  const hoodJ = b.joint("hood", { parent: root, at: [0, 2.3, 0.6], dir: [0, 0, 1], role: "hinge" });
  const tailJ = b.joint("tailgate", { parent: root, at: [0, 2.0, -2.2], dir: [0, 0, -1], role: "hinge" });
  const doorL = b.joint("doorL", { parent: root, at: [0.95, 2.4, 0.28], dir: [0, 1, 0], role: "hinge" });
  const doorR = b.joint("doorR", { parent: root, at: [-0.95, 2.4, 0.28], dir: [0, 1, 0], role: "hinge" });

  // -------------------------------------------------------------------------------------------------------------
  // Wheels
  const R = 0.87;
  const wheels = [
    ["FL", 1, 1.6],
    ["FR", -1, 1.6],
    ["RL", 1, -1.6],
    ["RR", -1, -1.6],
  ] as const;
  for (const [name, sx, z] of wheels) {
    const hub: P3 = [sx * 1.5, R, z];
    const steer =
      z > 0 ? b.joint(`steer${name}`, { parent: root, at: hub, dir: [0, 1, 0], role: "hinge" }) : null;
    const wj = b.joint(`wheel${name}`, { parent: steer ?? root, at: hub, dir: [0, 0, 1], role: "hinge" });
    const paintT = tirePaint(hub[1], hub[2]);
    b.part(new THREE.CylinderGeometry(0.8, 0.8, 0.85, 16), paintT, { bone: wj, at: hub, dir: [1, 0, 0] });

    // Tread lugs: two staggered rows of chunky blocks.
    const lugs: THREE.BufferGeometry[] = [];
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 18; i++) {
        const th = ((i + row * 0.5) / 18) * Math.PI * 2;
        lugs.push(
          new THREE.BoxGeometry(0.38, 0.13, 0.2)
            .translate(row ? 0.22 : -0.22, 0.81, 0)
            .rotateX(th)
            .translate(hub[0], hub[1], hub[2]),
        );
      }
    merged(lugs, paintT, wj);

    // Rim discs, dish, hub cap and lug nuts on both faces.
    const nuts: THREE.BufferGeometry[] = [];
    for (const s2 of [1, -1]) {
      const hx = hub[0] + s2 * 0.435;
      cyl(0.5, 0.5, 0.05, 12, [hx, R, z], [1, 0, 0], "#b8c2d0", wj);
      cyl(0.36, 0.36, 0.04, 12, [hub[0] + s2 * 0.465, R, z], [1, 0, 0], "#2c3340", wj);
      cyl(0.16, 0.16, 0.08, 8, [hub[0] + s2 * 0.5, R, z], [1, 0, 0], "#e8eef6", wj);
      for (let i = 0; i < 8; i++)
        nuts.push(
          new THREE.BoxGeometry(0.05, 0.06, 0.06)
            .translate(s2 * 0.49, 0.27, 0)
            .rotateX((i / 8) * Math.PI * 2)
            .translate(hub[0], hub[1], hub[2]),
        );
      for (let i = 0; i < 12; i++)
        nuts.push(
          new THREE.BoxGeometry(0.04, 0.05, 0.05)
            .translate(s2 * 0.462, 0.43, 0)
            .rotateX(((i + 0.5) / 12) * Math.PI * 2)
            .translate(hub[0], hub[1], hub[2]),
        );
    }
    merged(nuts, CHROME, wj);
    if (steer) box([0.22, 0.34, 0.22], [sx * 1.05, R, z], "#3a4150", steer);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Axles, links, coil-over shocks
  for (const z of [1.6, -1.6]) {
    const inward = z > 0 ? -1 : 1;
    b.rod([-1.35, R, z], [1.35, R, z], 0.11, STEEL, { bone: root });
    b.part(new THREE.SphereGeometry(0.26, 8, 6), "#59606f", { bone: root, at: [0, R, z], scale: [1, 0.9, 0.85] });
    box([0.5, 0.08, 0.34], [0, R - 0.18, z], "#3a4150");
    for (const sx of [1, -1]) {
      b.rod([sx * 0.4, 0.8, z], [sx * 0.45, 1.25, z + inward * 0.9], 0.04, "#3a4150", { bone: root });
      const x = sx * 0.78;
      box([0.14, 0.1, 0.14], [x, 0.99, z], "#3a4150");
      b.rod([x, 0.99, z], [x, 1.46, z], 0.045, CHROME, { bone: root });
      cyl(0.07, 0.07, 0.22, 8, [x + sx * 0.1, 1.2, z], [0, 1, 0], "#c0482a");
      b.sweep(spiral([x, 0.99, z], [x + 0.11, 0.99, z], [0, 1, 0], { turns: 5, pitch: 0.095 }), 0.028, SPRING, {
        bone: root,
        sides: 4,
      });
    }
  }
  // Drivetrain and frame
  b.rod([0, 0.95, -1.6], [0, 0.95, 1.6], 0.05, "#3a4150", { bone: root });
  box([0.7, 0.4, 0.8], [0, 1.0, 0.2], "#59606f");
  for (const sx of [1, -1]) box([0.16, 0.24, 4.3], [sx * 0.5, 1.27, 0], RAIL);
  for (const z of [-2.0, -0.7, 0.7, 2.0]) box([1.0, 0.12, 0.14], [0, 1.2, z], RAIL);
  cyl(0.24, 0.24, 0.9, 10, [0, 1.15, -1.1], [0, 0, 1], "#59606f");
  box([1.9, 0.12, 4.4], [0, 1.45, 0.05], "#1e1e28");
  // Side pipes
  for (const sx of [1, -1]) {
    b.rod([sx * 1.0, 1.6, -0.7], [sx * 1.0, 1.6, 0.7], 0.055, CHROME, { bone: root });
    for (const z of [-0.5, 0, 0.5]) box([0.04, 0.12, 0.05], [sx * 1.0, 1.66, z], CHROME_D);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Body
  box([2.0, 0.5, 4.5], [0, 1.75, 0.05], bodyPaint);
  b.extrude(
    [
      [-1.0, 2.0],
      [0.7, 2.0],
      [0.3, 2.8],
      [-0.95, 2.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, color: bodyPaint, bone: root, name: "cab" },
  );
  box([1.7, 0.05, 0.28], [0, 2.82, 0.42], INK); // sun visor
  decal(1.7, 0.62, WINDSHIELD, [0, 2.4, 0.5 + 0.009], [0, 0.447, 0.894], [0, 0.894, -0.447]);
  decal(1.6, 0.5, REAR_GLASS, [0, 2.42, -0.99 - 0.015], [0, 0, -1]);

  // Hood
  box([1.96, 0.3, 1.75], [0, 2.15, 1.425], bodyPaint, hoodJ);
  box([0.64, 0.24, 0.8], [0, 2.42, 1.15], bodyPaint, hoodJ);
  box([0.5, 0.14, 0.02], [0, 2.42, 1.56], INK, hoodJ);
  box([0.36, 0.1, 0.02], [0, 2.42, 1.565], "#59606f", hoodJ);
  decal(0.5, 0.46, SKULL, [0, 2.307, 1.9], [0, 1, 0], [0, 0, -1], hoodJ);
  const hoodBits: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (let i = 0; i < 5; i++) hoodBits.push(boxG(0.3, 0.02, 0.04, sx * 0.62, 2.303, 0.85 + i * 0.12));
  merged(hoodBits, INK, hoodJ);
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = -6; i <= 6; i++) rivets.push(boxG(0.04, 0.04, 0.03, i * 0.15, 2.15, 2.315));
  merged(rivets, CHROME, hoodJ);

  // Front end
  decal(1.0, 0.34, GRILLE, [0, 1.82, 2.305], [0, 0, 1]);
  for (const sx of [1, -1]) {
    box([0.38, 0.34, 0.03], [sx * 0.74, 1.82, 2.315], CHROME_D);
    lamp([0.3, 0.26, 0.03], [sx * 0.74, 1.82, 2.33], "#fff6c0", 1.3);
    lamp([0.12, 0.08, 0.03], [sx * 0.5, 1.6, 2.5], "#ffb020", 1);
    box([0.1, 0.1, 0.12], [sx * 0.3, 1.58, 2.5], "#d6263a"); // tow hooks
  }
  box([1.9, 0.22, 0.2], [0, 1.62, 2.4], CHROME_D);
  box([1.8, 0.05, 0.22], [0, 1.74, 2.4], CHROME);
  for (const sx of [1, -1]) b.rod([sx * 0.3, 1.62, 2.45], [sx * 0.3, 2.12, 2.4], 0.045, CHROME, { bone: root });
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = -4; i <= 4; i++) bolts.push(boxG(0.04, 0.04, 0.03, i * 0.2, 1.62, 2.51));
  merged(bolts, "#2a2e3a");

  // Exhaust stacks with flames
  for (const sx of [1, -1]) {
    const base: P3 = [sx * 0.55, 2.3, 0.85];
    const tip: P3 = [sx * 0.6, 3.0, 0.8];
    b.rod(base, tip, 0.065, CHROME, { bone: root });
    cyl(0.095, 0.095, 0.06, 8, [tip[0], tip[1] - 0.04, tip[2]], [0, 1, 0], CHROME_D);
    glow(b.spike(tip, [0, 1, 0], 0.38, 0.075, ORANGE, { bone: root, sides: 6 }), 1.2);
    glow(b.spike(tip, [0, 1, 0], 0.22, 0.04, "#ffe45c", { bone: root, sides: 6 }), 1.4);
  }

  // Roof light bar
  box([1.6, 0.16, 0.14], [0, 2.92, 0.1], INK);
  for (const sx of [1, -1]) box([0.08, 0.1, 0.1], [sx * 0.6, 2.84, 0.1], INK);
  for (let i = 0; i < 6; i++) lamp([0.2, 0.11, 0.02], [-0.65 + i * 0.26, 2.92, 0.18], "#fff6c0", 1.2);

  // Doors
  for (const sx of [1, -1]) {
    const dj = sx > 0 ? doorL : doorR;
    const cz = -0.285;
    box([0.046, 0.78, 1.15], [sx * 0.9725, 2.4, cz], INK, dj);
    box([0.05, 0.76, 1.13], [sx * 0.975, 2.4, cz], bodyPaint, dj);
    decal(0.85, 0.42, sx > 0 ? SIDE_L : SIDE_R, [sx * 1.0035, 2.5, -0.3], [sx, 0, 0], [0, 1, 0], dj);
    box([0.03, 0.04, 0.16], [sx * 1.015, 2.3, -0.7], CHROME, dj);
    b.rod([sx * 1.0, 2.62, 0.25], [sx * 1.17, 2.66, 0.3], 0.02, INK, { bone: dj });
    box([0.05, 0.2, 0.14], [sx * 1.19, 2.66, 0.32], "#2a2e3a", dj);
    box([0.04, 0.17, 0.01], [sx * 1.19, 2.66, 0.245], "#9fc4e8", dj);
    // flank decals and markers
    decal(0.56, 0.4, ROUNDEL, [sx * 1.0055, 1.75, -0.1], [sx, 0, 0]);
    for (const z of [1.9, 1.2, -0.6, -1.3, -1.9]) lamp([0.02, 0.05, 0.12], [sx * 1.005, 1.95, z], "#ffb020", 1);
  }

  // Bed
  b.part(tileBox([1.78, 0.03, 1.2], RIB, 0.04), "#ffffff", { bone: root, at: [0, 2.015, -1.6], texture: RIB });
  for (const sx of [1, -1]) {
    box([0.09, 0.45, 1.22], [sx * 0.905, 2.225, -1.56], bodyPaint);
    box([0.11, 0.04, 1.24], [sx * 0.905, 2.47, -1.56], CHROME_D);
  }
  const railBolts: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1]) for (let i = 0; i < 6; i++) railBolts.push(boxG(0.05, 0.03, 0.04, sx * 0.905, 2.5, -0.98 - i * 0.22));
  merged(railBolts, CHROME);
  box([1.78, 0.45, 0.06], [0, 2.225, -2.23], bodyPaint, tailJ);
  box([0.5, 0.06, 0.03], [0, 2.3, -2.27], CHROME_D, tailJ);
  for (const sx of [1, -1]) {
    lamp([0.24, 0.16, 0.03], [sx * 0.7, 2.2, -2.275], "#ff2a2a", 1.1, tailJ);
    box([0.1, 0.06, 0.03], [sx * 0.25, 2.1, -2.275], "#e8eef6", tailJ);
  }
  box([1.9, 0.2, 0.22], [0, 1.62, -2.33], CHROME_D);
  box([0.16, 0.12, 0.2], [0, 1.52, -2.5], "#3a4150");
  cyl(0.05, 0.05, 0.1, 8, [0, 1.5, -2.6], [0, 1, 0], STEEL);
  decal(0.34, 0.14, PLATE, [0, 1.64, -2.446], [0, 0, -1]);
  for (const sx of [1, -1]) lamp([0.1, 0.07, 0.03], [sx * 0.75, 1.62, -2.45], "#ff2a2a", 1);

  // Cargo
  box([0.14, 0.4, 0.3], [0.55, 2.23, -1.25], "#c8281e");
  cyl(0.04, 0.04, 0.06, 8, [0.55, 2.46, -1.15], [0, 1, 0], SPRING);
  box([0.16, 0.05, 0.12], [0.55, 2.45, -1.32], "#8c1a12");
  box([0.5, 0.22, 0.3], [-0.5, 2.13, -1.25], "#d8c23a");
  box([0.52, 0.04, 0.32], [-0.5, 2.25, -1.25], "#2a2e3a");
  box([0.1, 0.06, 0.03], [-0.5, 2.18, -1.4], CHROME);
  cyl(0.26, 0.26, 0.14, 10, [-0.4, 2.09, -1.85], [0, 1, 0], "#1a1a22");
  cyl(0.12, 0.12, 0.16, 8, [-0.4, 2.09, -1.85], [0, 1, 0], "#b8c2d0");

  // Roll cage
  for (const z of [-1.35, -2.05]) {
    b.sweep(
      [
        [0.88, 2.3, z],
        [0.88, 2.95, z],
        [-0.88, 2.95, z],
        [-0.88, 2.3, z],
      ],
      0.035,
      RAIL,
      { bone: root, sides: 6 },
    );
  }
  for (const sx of [1, -1]) b.rod([sx * 0.88, 2.95, -1.35], [sx * 0.88, 2.95, -2.05], 0.035, RAIL, { bone: root, sides: 6 });
  b.rod([0.88, 2.3, -1.35], [-0.88, 2.95, -1.35], 0.025, RAIL, { bone: root, sides: 6 });
  for (const sx of [1, -1]) for (const z of [-1.35, -2.05]) box([0.1, 0.05, 0.1], [sx * 0.88, 2.5, z], CHROME_D);

  // Antenna and pennant
  b.rod([0.85, 2.47, -1.05], [0.85, 3.4, -1.1], 0.012, INK, { bone: root, sides: 4 });
  b.extrude(
    [
      [0, 0],
      [0.32, 0.07],
      [0, 0.14],
    ],
    { at: [0.85, 3.25, -1.1], x: [0, 0, -1], thickness: 0.012, color: SPRING, bone: root },
  );

  return b.root;
}
