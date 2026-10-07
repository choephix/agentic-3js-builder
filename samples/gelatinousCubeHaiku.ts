import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { glow } from "../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped } from "../kits/pixel";

export const meta = {
  name: "Gelatinous Cube",
  description:
    "A three-metre gelatinous cube in dithered see-through gel, pseudopods reaching onto the floor, and a hoard it has swallowed: coins, gems, a sword, a skull, a shield and a chest.",
  style: "pixel art",
  commit: "b816db2",
};

// Palettes, dark to light.
const GEL = ["#0c3b3e", "#14575c", "#1f7a78", "#2f9d93", "#49bba6", "#7ad9bd", "#c4f5e0"];
const GEL_DEEP = ["#071f24", "#0c3338", "#144a4e", "#1f6d6c", "#2f8f85", "#4cb3a0"];
const GOLD = ["#6b4a0c", "#9a6e14", "#c9961c", "#e9be3a", "#fff1a0"];
const RED = ["#3a0410", "#6e0c1c", "#a81c2c", "#d63a46", "#ff8a8a"];
const BLUE = ["#0c1a4a", "#18308a", "#2650c0", "#4f84e6", "#a8d2ff"];
const GREEN = ["#06301c", "#0f5a34", "#1d8a4e", "#3cc070", "#a6f0bc"];
const AMBER = ["#4a1a00", "#8a3a06", "#c4600e", "#ef9a2a", "#ffd27a"];
const STEEL = ["#2a2f36", "#4a525c", "#7a8592", "#b4bfc9", "#eef4f8"];
const WOOD = ["#2a170b", "#4a2a14", "#6e4220", "#8f5e2e", "#b07c44"];
const LEATHER = ["#1e0d06", "#3d1e0e", "#5e3018", "#7d4424"];
const BONE = ["#6f6250", "#9c8e76", "#c9bc9e", "#ece2c8", "#fffaf0"];
const GLASS = ["#5d8fb0", "#8bbcd8", "#b9dcee", "#e8f8ff"];
const POTION = ["#3a0410", "#7a0c1c", "#b01c2c", "#e8505a"];
const PAPER = ["#8a7a52", "#b8a676", "#e0d2a4", "#f6ecc8"];
const SEAL = ["#4a0610", "#8a1020", "#c42a36"];

// Two texel sizes: 5 cm for the gel and its pseudopods, 2.5 cm for the loot (half of it).
const TEXEL = 0.05;
const FINE = 0.025;

// A gel face: colour bands from light at the top to dark at the base, a diagonal gloss, and a see-through centre.
// Each pixel is cut away (a hole) where the Bayer pattern falls under the local density, which is `dense` at the
// centre of the face and falls to nothing at its rim, so the loot shows through the middle and the edges stay solid.
// Rims are solid; drips and bubbles are painted over the holes.
function gelFace(seed: number, ramp: readonly string[], n: number, dense: number, rim: boolean) {
  const R = rng(seed);
  const c = (n - 1) / 2;
  const hash = (x: number, y: number) => {
    const h = Math.sin(x * 127.1 + y * 311.7 + seed * 19.19) * 43758.5453;
    return h - Math.floor(h);
  };
  // Smooth value noise in [0, 1): the blobs the holes gather in.
  const vnoise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = (x - xi) ** 2 * (3 - 2 * (x - xi));
    const v = (y - yi) ** 2 * (3 - 2 * (y - yi));
    const a = hash(xi, yi);
    const b2 = hash(xi + 1, yi);
    const c2 = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b2 - a) * u + (c2 - a) * v + (a - b2 - c2 + d) * u * v;
  };
  const top = ramp[ramp.length - 1];
  const dark = ramp[0];
  const mid = ramp[1];
  const solid = ramp[Math.floor(ramp.length / 2)];
  const drips = Array.from({ length: 6 }, () => ({ x: 3 + Math.floor(R() * (n - 6)), h: 2 + Math.floor(R() * 7) }));
  const bubbles = Array.from({ length: 3 }, () => ({
    x: 8 + Math.floor(R() * (n - 16)),
    y: 8 + Math.floor(R() * (n - 22)),
  }));
  return pixelTexture(n, n, (g) => {
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const edge = Math.min(x, n - 1 - x, y, n - 1 - y);
        if (rim && edge < 2) {
          g.set(x, y, y < 2 ? top : edge === 0 ? dark : mid);
          continue;
        }
        // Bands: the light falls from the top, in clean horizontal steps.
        const shade = 0.82 - 0.6 * (y / (n - 1));
        g.set(x, y, pick(ramp, shade, 0.5));
        // Holes: density from the centre outward.
        const r = Math.max(Math.abs(x - c) / c, Math.abs(y - c) / c);
        const density = dense * Math.max(0, 1 - r) ** 0.5;
        if (vnoise(x / 5, y / 5) + (bayer(x, y) - 0.5) * 0.16 < density) g.set(x, y, "");
        // Gloss: a diagonal streak in the upper left.
        if (Math.abs(x + 0.8 * y - 0.3 * n) < 1.2 && x < 0.55 * n && y < 0.5 * n && edge >= 2) g.set(x, y, top);
      }
    // Ooze pooling up from the bottom edge.
    for (const d of drips)
      for (let y = n - d.h; y < n; y++)
        for (let x = d.x - 1; x <= d.x + 1; x++) if (x >= 0 && x < n) g.set(x, y, solid);
    // Bubbles: a light ring with one highlight pixel.
    for (const bu of bubbles)
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const d = Math.hypot(dx, dy);
          if (Math.abs(d - 3) < 0.6) g.set(bu.x + dx, bu.y + dy, top);
          if (dx === -1 && dy === -1) g.set(bu.x + dx, bu.y + dy, "#ffffff");
        }
  });
}

const gelOuter = Array.from({ length: 6 }, (_, i) => gelFace(10 + i, GEL, 60, 0.62, true));
const gelInner = gelFace(77, GEL, 54, 0, false);

const BUBBLE = pixelArt([".ccc.", "ch..c", "c...c", "c...c", ".ccc."], { c: "#e6fff6", h: "#ffffff" });

// Paints. Cells are square in metres, so every surface shows hard texels.
const gelPaint = cellPaint(
  TEXEL,
  (c) => c.pick(GEL, 0.22 + 0.5 * c.n.y + 0.12 * c.n.z + 0.18 * (c.random(3) - 0.5)),
  { dither: true },
);
const puddlePaint = cellPaint(TEXEL, (c) => c.pick(GEL_DEEP, 0.3 + 0.45 * c.n.y + 0.2 * (c.random(5) - 0.5)), {
  dither: true,
});
const goldPaint = cellPaint(FINE, (c) => c.pick(GOLD, 0.4 + 0.35 * c.n.y + 0.3 * (c.random(2) - 0.5)), { dither: true });
const steelPaint = cellPaint(FINE, (c) => c.pick(STEEL, 0.35 + 0.35 * c.n.y + 0.25 * (c.random(4) - 0.5)), {
  dither: true,
});
const leatherPaint = cellPaint(FINE, (c) => c.pick(LEATHER, 0.4 + 0.3 * c.random(6)), { dither: true });
const paperPaint = cellPaint(FINE, (c) => c.pick(PAPER, 0.4 + 0.4 * c.random(7) + 0.1 * c.n.y), { dither: true });
const sealPaint = cellPaint(FINE, (c) => c.pick(SEAL, 0.4 + 0.5 * c.random(11)), { dither: true });
const bonePaint = cellPaint(FINE, (c) => c.pick(BONE, 0.45 + 0.35 * c.n.y + 0.2 * (c.random(8) - 0.5)), {
  dither: true,
});
const woodPaint = cellPaint(FINE, (c) => c.pick(WOOD, 0.35 + 0.4 * c.random(Math.floor(c.at.y / 0.075))), {
  dither: true,
});
const gemPaint = (ramp: readonly string[], seed: number) =>
  cellPaint(FINE, (c) => c.pick(ramp, 0.3 + 0.4 * (c.n.y + 1) / 2 + 0.3 * c.random(seed)), { dither: true });

const skullPaint = cellPaint(
  FINE,
  (c) => {
    const x = c.at.x - 0.6;
    const y = c.at.y - 1.7;
    const z = c.at.z - 0.25;
    const socketDist = Math.min(Math.hypot(x - 0.045, y - 0.02, z - 0.095), Math.hypot(x + 0.045, y - 0.02, z - 0.095));
    if (z > 0.04 && socketDist < 0.03) return "#14100c";
    if (z > 0.05 && Math.abs(x) < 0.012 && y < -0.01 && y > -0.045) return "#14100c";
    return c.pick(BONE, 0.5 + 0.3 * c.n.y + 0.25 * (c.random(12) - 0.5));
  },
  { dither: true },
);

const SHIELD_AT = [0.4, 1.95, 0.25];
const shieldPaint = cellPaint(FINE, (c) => {
  const dx = c.at.x - SHIELD_AT[0];
  const dy = c.at.y - (SHIELD_AT[1] + 0.16);
  if (Math.abs(dx) + Math.abs(dy) < 0.045) return "#f4f0d8";
  return dx < 0 ? c.pick(RED, 0.5 + 0.25 * c.random(9)) : c.pick(GOLD, 0.5 + 0.25 * c.random(9));
});

// Helpers.
const place = (g: THREE.BufferGeometry, p: number[], rx = 0, ry = 0, rz = 0) => {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(p[0], p[1], p[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(1, 1, 1),
  );
  return g.clone().applyMatrix4(m);
};
const merged = (parts: THREE.BufferGeometry[]) => {
  const g = mergeGeometries(parts);
  if (!g) throw new Error("gelatinousCube: geometries do not merge");
  return g;
};

export default function build() {
  const b = createBuilder({ name: "gelatinousCube" });
  const core = b.joint("core", { at: [0, 1.5, 0], role: "spine" });

  // Pseudopods: the gel reaches out of the base onto the floor. Each has a root inside the cube, a bend through the
  // face and a flattened tip on the ground. Joints are named per span, the last one is the tip. The bulge gives the
  // tube the wobble of a jelly rather than a bone.
  const pods: [string, number[][], number, number][] = [
    [
      "podFL",
      [
        [0.45, 0.5, 0.9],
        [0.75, 0.55, 1.5],
        [1.05, 0.2, 1.95],
        [1.22, 0.12, 2.35],
      ],
      0.24,
      0.12,
    ],
    [
      "podFR",
      [
        [-0.5, 0.5, 0.8],
        [-0.8, 0.5, 1.5],
        [-1.1, 0.2, 1.9],
        [-1.3, 0.12, 2.25],
      ],
      0.24,
      0.12,
    ],
    [
      "podBL",
      [
        [0.5, 0.45, -0.8],
        [0.9, 0.45, -1.5],
        [1.4, 0.2, -1.85],
        [1.75, 0.12, -2.0],
      ],
      0.22,
      0.11,
    ],
    [
      "podRS",
      [
        [-0.85, 0.5, 0.0],
        [-1.5, 0.6, 0.1],
        [-2.0, 0.22, 0.25],
        [-2.25, 0.12, 0.3],
      ],
      0.22,
      0.11,
    ],
  ];
  for (const [name, pts, r0, r1] of pods) {
    const chain = b.chain(name, catmull(pts), {
      parent: core,
      names: [`${name}1`, `${name}2`, `${name}3`, `${name}Tip`],
      role: "tentacle",
    });
    b.sweep(chain, (t) => (r0 + (r1 - r0) * t) * (1 + 0.16 * Math.sin(t * Math.PI * 3)), { color: gelPaint });
  }

  // The cube: six outer skins that face out and six inner skins that face in, 15 cm inside. Each outer face is
  // see-through through its centre, so the inner skin and the loot show through.
  const up = [0, 1, 0];
  const outer = [
    { at: [0, 1.5, 1.5], dir: [0, 0, 1], up },
    { at: [0, 1.5, -1.5], dir: [0, 0, -1], up },
    { at: [1.5, 1.5, 0], dir: [1, 0, 0], up },
    { at: [-1.5, 1.5, 0], dir: [-1, 0, 0], up },
    { at: [0, 3, 0], dir: [0, 1, 0], up: [0, 0, -1] },
    { at: [0, 0, 0], dir: [0, -1, 0], up: [0, 0, 1] },
  ];
  outer.forEach((f, i) =>
    b.part(new THREE.PlaneGeometry(3, 3), "#ffffff", {
      texture: gelOuter[i],
      bone: core,
      at: f.at,
      dir: f.dir,
      up: f.up,
      axis: "z",
    }),
  );
  const inner = [
    { at: [0, 1.5, 1.35], dir: [0, 0, -1], up },
    { at: [0, 1.5, -1.35], dir: [0, 0, 1], up },
    { at: [1.35, 1.5, 0], dir: [-1, 0, 0], up },
    { at: [-1.35, 1.5, 0], dir: [1, 0, 0], up },
    { at: [0, 2.85, 0], dir: [0, -1, 0], up: [0, 0, 1] },
    { at: [0, 0.15, 0], dir: [0, 1, 0], up: [0, 0, -1] },
  ];
  for (const f of inner)
    b.part(new THREE.PlaneGeometry(2.7, 2.7), "#ffffff", {
      texture: gelInner,
      bone: core,
      at: f.at,
      dir: f.dir,
      up: f.up,
      axis: "z",
    });

  // Air bubbles suspended in the gel: double-sided cards.
  const BR = rng(41);
  const bubbleAt: number[][] = [];
  for (let i = 0; i < 10; i++) bubbleAt.push([(BR() - 0.5) * 2.1, 0.5 + BR() * 2.1, (BR() - 0.5) * 2.1]);
  b.cards(
    bubbleAt.map((p) => frame([p[0], p[1] - 0.065, p[2]], [0, 1, 0], [0, 0, 1])),
    BUBBLE,
    { size: 0.1, lean: 0, flow: [0, 0, 1], bone: core },
  );

  // The puddle the cube has spread across the floor, and the drops that fell from its base.
  b.lathe(
    [
      [0, 0],
      [2.1, 0],
      [2.1, 0.012],
      [1.9, 0.03],
      [1.4, 0.045],
      [0.8, 0.055],
      [0, 0.06],
    ],
    { at: [0, 0, 0], bone: core, smoothing: 1, segments: 24, color: puddlePaint },
  );
  const DR = rng(55);
  for (let i = 0; i < 7; i++) {
    const a = DR() * Math.PI * 2;
    const rad = 1.5 + DR() * 0.8;
    const r = 0.05 + DR() * 0.06;
    b.part(new THREE.SphereGeometry(r, 8, 6), gelPaint, {
      bone: core,
      at: [Math.cos(a) * rad, r * 0.6, Math.sin(a) * rad],
    });
  }

  // Coins: a heap of 110 floating inside the cube, plus a few spilled on the floor, each set merged into one part.
  const coin = new THREE.CylinderGeometry(0.08, 0.08, 0.016, 10);
  const CR = rng(21);
  const pile: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 110; i++) {
    const a = CR() * Math.PI * 2;
    const rad = Math.sqrt(CR()) * 0.5;
    const x = -0.35 + Math.cos(a) * rad;
    const z = -0.25 + Math.sin(a) * rad;
    const y = 0.92 + 0.3 * (1 - rad / 0.5) + CR() * 0.1;
    pile.push(place(coin, [x, y, z], (CR() - 0.5) * 0.5, CR() * Math.PI * 2, (CR() - 0.5) * 0.5));
  }
  b.part(merged(pile), goldPaint, { bone: core, at: [0, 0, 0] });
  const FR = rng(31);
  const spill: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = FR() * Math.PI * 2;
    const rad = 1.2 + FR() * 0.5;
    spill.push(
      place(coin, [Math.cos(a) * rad, 0.06, Math.sin(a) * rad], (FR() - 0.5) * 0.15, FR() * Math.PI, (FR() - 0.5) * 0.15),
    );
  }
  b.part(merged(spill), goldPaint, { bone: core, at: [0, 0, 0] });

  // Gems, each its own faceted octahedron.
  const gem = (p: number[], r: number, ramp: readonly string[], seed: number) => {
    const g = new THREE.OctahedronGeometry(r, 0).scale(1, 1.3, 1).rotateZ(seed * 0.4).rotateX(seed * 0.3);
    b.part(g, gemPaint(ramp, seed), { bone: core, at: p });
  };
  gem([-0.05, 0.62, 0.55], 0.1, RED, 1);
  gem([-0.2, 1.42, 0.7], 0.11, BLUE, 2);
  gem([0.85, 1.25, -0.35], 0.115, GREEN, 3);
  gem([0.6, 1.05, -0.9], 0.095, AMBER, 4);
  // The soul gem, a flat violet that glows.
  const soul = b.part(new THREE.IcosahedronGeometry(0.12, 0), "#b889ff", { bone: core, at: [0.3, 2.6, 0.05] });
  glow(soul, 1.6);

  // Sword: a pommel, a leather grip, a gold guard and a steel blade, lying across the upper back of the cube.
  const sp = [-0.7, 2.2, -0.2];
  const sd = new THREE.Vector3(0.65, -0.1, -0.75).normalize();
  const along = (t: number) => [sp[0] + sd.x * t, sp[1] + sd.y * t, sp[2] + sd.z * t];
  const sdir = [sd.x, sd.y, sd.z];
  b.part(new THREE.SphereGeometry(0.04, 8, 6), goldPaint, { bone: core, at: along(0.04) });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8), leatherPaint, {
    bone: core,
    at: along(0.115),
    dir: sdir,
  });
  b.part(new THREE.BoxGeometry(0.22, 0.034, 0.04), goldPaint, { bone: core, at: along(0.2), dir: sdir });
  b.part(new THREE.BoxGeometry(0.06, 0.78, 0.014), steelPaint, { bone: core, at: along(0.615), dir: sdir });

  // Shield: a heater shield stepped in pixel rows, extruded, quartered red and gold with a star.
  const shieldRows = [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8];
  const shieldOutline = stepped(
    shieldRows.map((h) => [-h, h] as [number, number]),
    FINE,
    { rows: true },
  );
  b.extrude(shieldOutline, {
    at: SHIELD_AT,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.006,
    color: shieldPaint,
    bone: core,
  });

  // A potion flask, red at its base and corked.
  const VIAL = [-0.62, 1.2, 0.45];
  const vialPaint = cellPaint(
    FINE,
    (c) =>
      c.at.y < VIAL[1] + 0.1
        ? c.pick(POTION, 0.45 + 0.3 * c.random(14))
        : c.pick(GLASS, 0.3 + 0.5 * c.n.y + 0.2 * (c.random(13) - 0.5)),
    { dither: true },
  );
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.05, 0.03],
      [0.05, 0.1],
      [0.024, 0.13],
      [0.024, 0.17],
      [0, 0.17],
    ],
    { at: VIAL, bone: core, smoothing: 1, color: vialPaint },
  );
  b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.03, 8), leatherPaint, {
    bone: core,
    at: [VIAL[0], VIAL[1] + 0.185, VIAL[2]],
  });

  // Helmet, a steel dome with a gold brim.
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.14, 0.012],
      [0.13, 0.06],
      [0.1, 0.14],
      [0.05, 0.19],
      [0, 0.2],
    ],
    { at: [0.9, 0.5, -0.55], bone: core, smoothing: 1, color: steelPaint },
  );
  b.part(new THREE.TorusGeometry(0.135, 0.012, 6, 14).rotateX(Math.PI / 2), goldPaint, {
    bone: core,
    at: [0.9, 0.512, -0.55],
  });

  // Chest: wood box with a gold banding and a lock.
  const chest = [-0.45, 0.42, -0.6];
  b.part(new THREE.BoxGeometry(0.5, 0.24, 0.3), woodPaint, { bone: core, at: chest });
  b.part(new THREE.BoxGeometry(0.5, 0.08, 0.3), woodPaint, { bone: core, at: [chest[0], 0.58, chest[2]] });
  for (const x of [-0.16, 0.16])
    b.part(new THREE.BoxGeometry(0.03, 0.33, 0.32), goldPaint, { bone: core, at: [chest[0] + x, 0.46, chest[2]] });
  b.part(new THREE.BoxGeometry(0.06, 0.07, 0.015), goldPaint, {
    bone: core,
    at: [chest[0], 0.5, chest[2] + 0.157],
  });

  // Skull: a bone sphere with sockets and nose painted in, and a jaw.
  const SK = [0.6, 1.7, 0.25];
  b.part(new THREE.SphereGeometry(0.11, 12, 9), skullPaint, { bone: core, at: SK });
  b.part(new THREE.BoxGeometry(0.11, 0.045, 0.09), bonePaint, {
    bone: core,
    at: [SK[0], 1.6, SK[2] + 0.02],
  });

  // A femur-like bone, with knobs at both ends.
  b.capsule([0.05, 0.25, -0.5], [0.4, 0.25, -0.3], 0.022, { color: bonePaint, bone: core });
  for (const p of [
    [0.05, 0.25, -0.5],
    [0.4, 0.25, -0.3],
  ])
    b.part(new THREE.SphereGeometry(0.034, 8, 6), bonePaint, { bone: core, at: p });

  // A scroll with a seal, and a gold ring.
  const SC = [0.72, 1.02, 0.55];
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.2, 8), paperPaint, {
    bone: core,
    at: SC,
    dir: [0.5, 0.05, 1],
  });
  b.part(new THREE.SphereGeometry(0.032, 8, 6), sealPaint, { bone: core, at: [SC[0] + 0.05, SC[1], SC[2] + 0.1] });
  b.part(new THREE.TorusGeometry(0.036, 0.009, 6, 12).rotateX(1.1), goldPaint, {
    bone: core,
    at: [0.1, 1.2, 0.85],
  });

  return b.root;
}
