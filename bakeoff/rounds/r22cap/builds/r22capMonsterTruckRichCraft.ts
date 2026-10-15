import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "Pixel-art monster truck with 1.7 m mud-caked lugged tyres, coil-over suspension, flame-painted blue body, racing stripes, roll bar, light bar and exhaust stacks.",
  style: "pixel art",
  commit: "88fc1f0",
};

type Col = string | Paint;

const TEXEL = 0.05;
const BY = 1.85; // underside of the body
const AXLE_Y = 0.84;

const NAVY = "#0a1650";
const RED = "#d8281e";
const ORG = "#ff8a1a";
const YEL = "#ffd23a";
const WHITE = "#f2f2ee";
const INK = "#14141a";
const CHROME = "#c9d3de";
const STEEL = "#6c7683";
const DARK = "#23262e";
const DARKER = "#15171c";
const BLUES = ["#0f2a78", "#1b46b8", "#2d6be0", "#63a0ff"];
const RUBBER = ["#0c0c10", "#17171d", "#24242c", "#34343e"];
const MUD = ["#2c1c10", "#4a2f18", "#6b4626", "#8a5e34"];
const FLAME = [RED, ORG, YEL];

const tri = (v: number) => Math.abs((((v % 2) + 2) % 2) - 1);

// ---------- paints ----------
const BODY = cellPaint(
  TEXEL,
  (c) => {
    const { x, y, z } = c.at;
    const n1 = noise(c.at, 0.3, 9);
    if (c.axis !== 1 && y < BY + 0.1 + 0.2 * n1) return c.pick(MUD, 0.25 + 0.55 * c.random(2));
    if (c.axis === 1 && Math.abs(x) < 0.15 && y > 2.4) return Math.abs(x) < 0.1 ? NAVY : WHITE;
    if (c.axis !== 1) {
      const u = c.axis === 2 ? x : z;
      const tip = BY + 0.3 + 0.35 * tri(u * 2.6) + 0.05 * noise(c.at, 0.2, 4);
      if (y < tip) return c.pick(FLAME, 1 - (y - BY) / (tip - BY));
    }
    return c.pick(BLUES, 0.45 + 0.35 * c.n.y + 0.12 * (noise(c.at, 0.25, 3) - 0.5));
  },
  { dither: true },
);

const tyrePaint = (cz: number) =>
  cellPaint(
    TEXEL,
    (c) => {
      const { x, y, z } = c.at;
      if (c.axis === 0 && Math.abs(x) > 0.9) {
        const dy = y - AXLE_Y;
        const dz = z - cz;
        const r = Math.hypot(dy, dz);
        if (r > 0.57 && r < 0.62) return Math.floor(Math.atan2(dz, dy) * 5) % 2 === 0 ? WHITE : "#c8c8c0";
        if (r > 0.68 && r < 0.72) return RED;
      }
      if (y < 0.5 && noise(c.at, 0.22, 6) + 0.25 * c.random(5) > 0.62) return c.pick(MUD, 0.2 + 0.7 * c.random(7));
      return c.pick(RUBBER, 0.3 + 0.45 * noise(c.at, 0.12, 3) + 0.15 * c.n.y);
    },
    { dither: true },
  );

const SPRING = cellPaint(0.04, (c) => (Math.floor(c.at.y / 0.045) % 2 === 0 ? YEL : "#c8901a"));

// ---------- textures ----------
const GRILLE = pixelTexture(18, 8, (g) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) return CHROME;
    return y % 2 === 0 ? "#3a3f4a" : DARKER;
  });
  g.stamp(8, 3, ["oo", "oo"], { o: ORG });
});

const SCOOP = pixelTexture(12, 3, (g) => {
  g.fill((x, y) => (x % 2 === 0 ? DARKER : y === 0 ? STEEL : "#2e323c"));
});

const SKULL = pixelArt(
  [
    "...wwwwww...",
    ".wwwwwwwwww.",
    ".wwwwwwwwww.",
    ".wkkwwwwkkw.",
    ".wkkwwwwkkw.",
    ".wwwwkkwwww.",
    "..wwwwwwww..",
    "..wkwkwkww..",
    "...wwwwww...",
  ],
  { w: WHITE, k: INK },
);

const PLATE = pixelTexture(13, 9, (g) => {
  g.fill((x, y, w, h) => (x === 0 || x === w - 1 || y === 0 || y === h - 1 ? ORG : WHITE));
  const eight = [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."];
  g.stamp(1, 1, eight, { "#": INK });
  g.stamp(7, 1, eight, { "#": INK });
});

const BEDSTRIPE = pixelTexture(31, 3, (g) => {
  g.fill((x, y) => ((x + y) % 6 < 3 ? YEL : ORG));
});

const CHECKER = pixelTexture(24, 2, (g) => {
  g.fill((x, y) => ((x + y) % 2 === 0 ? INK : WHITE));
});

const LICENSE = pixelArt(["bbbbbbbb", "bwbwwbwb", "bwwbbwwb", "bbbbbbbb"], { b: "#1b46b8", w: WHITE });

const LINER = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => (x % 4 === 0 || y % 4 === 0 ? "#15171c" : pick(["#23262e", "#2b2f38"], 0.5, bayer(x, y))));
});

const glass = (w: number, h: number) =>
  pixelTexture(w, h, (g) => {
    g.fill((x, y, gw, gh) => {
      if ((x * 2 + y * 3) % 17 < 2 && y > 1) return "#bfe4ff";
      if ((x * 2 + y * 3) % 17 === 5 && y > 1) return "#7fb6ea";
      return pick(["#0a1c3a", "#13305e", "#1f4a82", "#3a76b4"], 0.1 + 0.6 * (y / gh), bayer(x, y));
    });
  });

export default function build() {
  const b = createBuilder({ name: "monsterTruck" });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: Col) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (r: number, h: number, x: number, y: number, z: number, color: Col, sides = 8, rotation: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at: [x, y, z], rotation });
  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: [number, number, number],
    dir: [number, number, number],
    up?: [number, number, number],
  ) => {
    const opts: Record<string, unknown> = { at, dir, axis: "z", texture: tex };
    if (up) opts.up = up;
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", opts);
  };

  // ================= WHEELS =================
  const wheel = (sx: number, zc: number) => {
    const cx = sx * 1.45;
    const tp = tyrePaint(zc);
    cyl(0.78, 0.95, cx, AXLE_Y, zc, tp, 16, [0, 0, 90]);

    // tread blocks, world-space, merged into one part
    const lugs: THREE.BufferGeometry[] = [];
    const lug = (w: number, rad: number, tang: number, a: number, x: number) => {
      const g = new THREE.BoxGeometry(w, rad, tang);
      g.rotateX(Math.PI / 2 - a);
      g.translate(x, AXLE_Y + 0.79 * Math.sin(a), zc + 0.79 * Math.cos(a));
      lugs.push(g);
    };
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8;
      lug(0.5, 0.1, 0.2, a, cx);
      for (const t of [-1, 1]) lug(0.3, 0.1, 0.17, a + Math.PI / 16, cx + t * 0.31);
    }
    b.part(mergeGeometries(lugs), tp, { at: [0, 0, 0] });

    // rim, dish, cap on the outer face
    cyl(0.5, 0.05, cx + sx * 0.475, AXLE_Y, zc, YEL, 16, [0, 0, 90]);
    cyl(0.4, 0.05, cx + sx * 0.5, AXLE_Y, zc, "#2a2d36", 16, [0, 0, 90]);
    cyl(0.15, 0.1, cx + sx * 0.53, AXLE_Y, zc, CHROME, 8, [0, 0, 90]);
    const bolts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8;
      bolts.push(new THREE.BoxGeometry(0.05, 0.05, 0.05).translate(cx + sx * 0.5, AXLE_Y + 0.45 * Math.sin(a), zc + 0.45 * Math.cos(a)));
    }
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8;
      bolts.push(new THREE.BoxGeometry(0.06, 0.06, 0.06).translate(cx + sx * 0.55, AXLE_Y + 0.27 * Math.sin(a), zc + 0.27 * Math.cos(a)));
    }
    b.part(mergeGeometries(bolts), CHROME, { at: [0, 0, 0] });
  };

  for (const sx of [1, -1]) for (const zc of [1.7, -1.7]) wheel(sx, zc);

  // ================= AXLES & SUSPENSION =================
  for (const zc of [1.7, -1.7]) {
    b.rod([-1.0, AXLE_Y, zc], [1.0, AXLE_Y, zc], 0.09, STEEL, { sides: 8, caps: "flat" });
    box(0.5, 0.46, 0.5, 0, AXLE_Y + 0.02, zc, "#3a3f4a");
    cyl(0.2, 0.1, 0, AXLE_Y + 0.02, zc + Math.sign(zc) * 0.28, STEEL, 8, [90, 0, 0]);
    for (const s of [1, -1]) {
      box(0.28, 0.5, 0.28, s * 0.88, AXLE_Y + 0.05, zc, "#3a3f4a"); // portal hub
      box(0.1, 0.1, 0.1, s * 0.88, AXLE_Y + 0.35, zc, ORG);
      // coil-overs, V pair per wheel
      for (const dz of [-0.3, 0.3]) {
        const lo: [number, number, number] = [s * 0.85, 0.98, zc];
        const hi: [number, number, number] = [s * 0.7, 1.5, zc + dz];
        b.rod(lo, hi, 0.045, RED, { sides: 6, caps: "flat" });
        const m: [number, number, number] = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2 + 0.03, (lo[2] + hi[2]) / 2];
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.34, 8), SPRING, {
          at: m,
          dir: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]],
        });
        box(0.1, 0.06, 0.1, lo[0], lo[1] - 0.02, lo[2], CHROME);
        box(0.14, 0.4, 0.14, s * 0.7, 1.62, zc + dz, "#3a3f4a");
      }
      // four-link bars
      b.rod([s * 0.5, 0.78, zc], [s * 0.45, 1.3, zc - Math.sign(zc) * 1.0], 0.05, STEEL, { sides: 6, caps: "flat" });
      b.rod([s * 0.5, 1.0, zc], [s * 0.45, 1.3, zc - Math.sign(zc) * 0.8], 0.04, STEEL, { sides: 6, caps: "flat" });
    }
  }
  // steering tie rod, drive shafts, skid plate
  b.rod([-0.9, 0.62, 2.0], [0.9, 0.62, 2.0], 0.03, CHROME, { sides: 6, caps: "flat" });
  b.rod([0, 0.95, -1.4], [0, 0.95, 1.4], 0.07, STEEL, { sides: 6, caps: "flat" });
  box(0.9, 0.06, 1.3, 0, 1.13, 0, DARK);

  // ================= FRAME =================
  for (const s of [1, -1]) {
    box(0.16, 0.3, 4.9, s * 0.45, 1.4, 0, "#3a3f4a");
    box(0.05, 0.22, 4.7, s * 0.545, 1.4, 0, YEL); // painted rail stripe
    for (const z of [-2.2, -0.5, 0.9, 2.2]) box(0.14, 0.18, 0.14, s * 0.45, 1.64, z, ORG);
  }
  for (const z of [-2.2, -0.6, 0.5, 2.0]) box(1.0, 0.12, 0.1, 0, 1.4, z, "#3a3f4a");
  box(1.7, 0.12, 4.9, 0, 1.79, 0, DARK); // underbody pan

  // ================= BODY =================
  box(1.8, 0.65, 1.85, 0, BY + 0.325, 1.575, BODY); // hood
  box(1.8, 0.7, 1.6, 0, 2.2, -0.15, BODY); // cab lower
  box(1.62, 0.75, 1.2, 0, 2.925, -0.25, BODY); // greenhouse
  box(1.8, 0.08, 1.5, 0, 3.34, -0.25, BODY); // roof
  box(1.62, 0.08, 0.1, 0, 3.27, 0.4, DARKER); // sun visor
  // bed
  box(1.8, 0.1, 1.55, 0, 1.9, -1.725, DARK);
  b.part(tileBox([1.6, 0.04, 1.45], LINER, TEXEL), DARK, { at: [0, 1.97, -1.725] });
  for (const s of [1, -1]) {
    box(0.1, 0.65, 1.55, s * 0.85, 2.275, -1.725, BODY);
    box(0.14, 0.05, 1.55, s * 0.85, 2.625, -1.725, CHROME);
    decal(BEDSTRIPE, 1.55, 0.15, [s * 0.906, 2.4, -1.725], [s, 0, 0]);
  }
  box(1.8, 0.65, 0.1, 0, 2.275, -2.45, BODY); // tailgate
  box(1.8, 0.05, 0.14, 0, 2.625, -2.45, CHROME);
  decal(CHECKER, 1.2, 0.1, [0, 2.5, -2.506], [0, 0, -1]);
  decal(LICENSE, 0.32, 0.16, [0, 2.15, -2.506], [0, 0, -1]);
  box(1.9, 0.14, 0.12, 0, 1.95, -2.58, STEEL); // rear bumper
  for (const s of [1, -1]) {
    glow(box(0.26, 0.18, 0.04, s * 0.62, 2.33, -2.51, RED), 1.4);
    box(0.32, 0.24, 0.03, s * 0.62, 2.33, -2.5, DARKER);
    box(0.1, 0.1, 0.12, s * 0.75, 1.85, -2.66, RED); // tow hook
  }

  // front end
  box(1.8, 0.26, 0.14, 0, 1.98, 2.57, CHROME); // bumper
  box(0.4, 0.2, 0.25, 0, 1.98, 2.7, DARK); // winch
  box(0.1, 0.12, 0.04, 0, 1.98, 2.84, ORG);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) b.rod([x, 2.05, 2.6], [x, 2.45, 2.6], 0.03, CHROME, { sides: 6, caps: "flat" });
  b.rod([-0.7, 2.45, 2.6], [0.7, 2.45, 2.6], 0.035, CHROME, { sides: 6, caps: "flat" });
  decal(GRILLE, 0.9, 0.4, [0, 2.27, 2.504], [0, 0, 1]);
  for (const s of [1, -1]) {
    box(0.34, 0.28, 0.04, s * 0.68, 2.27, 2.51, CHROME);
    glow(box(0.26, 0.2, 0.04, s * 0.68, 2.27, 2.54, "#fff2a8"), 1.5);
    glow(box(0.18, 0.07, 0.04, s * 0.68, 2.08, 2.52, ORG), 1.2);
    box(0.06, 0.06, 0.06, s * 0.8, 2.55, 2.46, CHROME); // hood pins
  }
  // hood scoop + skull
  box(0.8, 0.2, 0.7, 0, 2.6, 1.7, BODY);
  decal(SCOOP, 0.6, 0.15, [0, 2.6, 2.056], [0, 0, 1]);
  decal(SKULL, 0.6, 0.45, [0, 2.506, 1.0], [0, 1, 0], [0, 0, 1]);

  // cab detail
  for (const s of [1, -1]) {
    decal(PLATE, 0.65, 0.45, [s * 0.906, 2.2, -0.2], [s, 0, 0]);
    // door seams + handle
    box(0.012, 0.66, 0.025, s * 0.903, 2.2, -0.6, DARKER);
    box(0.012, 0.66, 0.025, s * 0.903, 2.2, 0.2, DARKER);
    box(0.012, 0.025, 0.8, s * 0.903, 2.52, -0.2, DARKER);
    box(0.04, 0.04, 0.14, s * 0.915, 2.4, 0.1, CHROME);
    // rock slider
    box(0.12, 0.1, 1.5, s * 0.96, 1.78, -0.15, DARK);
    box(0.06, 0.08, 0.1, s * 0.9, 1.82, 0.4, STEEL);
    box(0.06, 0.08, 0.1, s * 0.9, 1.82, -0.7, STEEL);
    // mirror
    b.rod([s * 0.85, 2.9, 0.28], [s * 0.96, 2.9, 0.34], 0.015, CHROME, { sides: 4, caps: "flat" });
    box(0.07, 0.2, 0.12, s * 0.99, 2.9, 0.36, DARK);
    // side window
    decal(glass(20, 11), 1.0, 0.55, [s * 0.812, 2.95, -0.25], [s, 0, 0]);
    // exhaust stack
    box(0.1, 0.5, 0.1, s * 1.0, 2.05, -0.88, STEEL);
    b.rod([s * 1.0, 1.95, -0.88], [s * 1.0, 3.45, -0.88], 0.07, CHROME, { sides: 8, caps: "flat" });
    cyl(0.09, 0.06, s * 1.0, 3.46, -0.88, STEEL, 8);
    glow(b.spike([s * 1.0, 3.5, -0.88], [0, 1, 0], 0.32, 0.06, ORG, { sides: 6 }), 1.3);
    box(0.12, 0.08, 0.12, s * 1.0, 2.9, -0.88, STEEL);
    box(0.12, 0.08, 0.12, s * 1.0, 2.3, -0.88, STEEL);
  }
  decal(glass(30, 12), 1.5, 0.6, [0, 2.95, 0.352], [0, 0, 1]);
  decal(glass(24, 10), 1.2, 0.5, [0, 2.95, -0.852], [0, 0, -1]);

  // roof light bar
  box(1.4, 0.12, 0.12, 0, 3.47, 0.15, DARK);
  for (const x of [-0.14, 0, 0.14]) {
    box(0.03, 0.1, 0.1, x * 5 - 0.0, 3.4, 0.15, STEEL);
  }
  for (let i = 0; i < 5; i++) glow(box(0.2, 0.1, 0.04, -0.56 + i * 0.28, 3.47, 0.22, i % 2 === 0 ? "#fff2a8" : "#ffffff"), 1.5);

  // roll bar in the bed
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 1.97, -1.2], [s * 0.7, 3.05, -1.2], 0.045, STEEL, { sides: 6, caps: "flat" });
    b.rod([s * 0.7, 3.05, -1.2], [s * 0.7, 1.97, -2.1], 0.035, STEEL, { sides: 6, caps: "flat" });
    box(0.14, 0.04, 0.14, s * 0.7, 1.99, -1.2, ORG);
    box(0.14, 0.04, 0.14, s * 0.7, 1.99, -2.1, ORG);
  }
  b.rod([-0.7, 3.05, -1.2], [0.7, 3.05, -1.2], 0.045, STEEL, { sides: 6, caps: "flat" });
  b.rod([-0.7, 2.55, -1.2], [0.7, 2.55, -1.2], 0.03, STEEL, { sides: 6, caps: "flat" });
  for (const x of [-0.45, -0.15, 0.15, 0.45]) {
    box(0.16, 0.14, 0.12, x, 3.14, -1.2, DARK);
    glow(box(0.12, 0.1, 0.04, x, 3.14, -1.27, "#fff2a8"), 1.4);
  }
  // spare tyre-sized sub woofer box in bed
  box(0.6, 0.4, 0.5, 0, 2.2, -1.6, "#2e323c");
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), DARKER, { at: [0, 2.2, -1.34], rotation: [90, 0, 0] });

  // antenna with flag
  b.rod([0.78, 2.6, -2.35], [0.78, 3.7, -2.4], 0.012, STEEL, { sides: 4, caps: "flat" });
  box(0.2, 0.12, 0.012, 0.88, 3.64, -2.4, ORG);
  box(0.08, 0.08, 0.014, 0.9, 3.64, -2.4, RED);

  return b.root;
}
