// Monster truck: a flame-painted blue pickup on four giant chevron-tread tyres, pixel art.
// Hard square texels everywhere: cellPaint body/tyres/rims, pixel-texture glass, grille, lights and decals.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { aim } from "../../../../src/math";
import { polyline } from "../../../../src/path";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import { cellPaint, pixelArt, pixelTexture } from "../../../../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description:
    "A flame-painted blue pickup lifted on giant chevron-tread tyres, coil-over shocks, four-link axles, roll cage, light bar, exhaust stacks and a helmeted driver, in chunky pixel art.",
  style: "pixel art",
  commit: "88fc1f0",
};

type V = [number, number, number];

const TX = 1.35; // tyre centre x
const WY = 0.86; // tyre centre height
const TIRE_R = 0.84;
const AXLE_F = 1.5;
const AXLE_R = -1.5;
const TEXEL = 0.04;

// Flat colours (the shared palette)
const DARK = "#14141a";
const DARK2 = "#1c1c26";
const BLACK = "#0b0b10";
const STEEL = "#8a91a1";
const CHROME = "#d6dbe6";
const LINK = "#1f48e0";
const SPRING_A = "#1636b8";
const SPRING_B = "#2f63ff";
const LUG = "#2e2e38";
const RED = "#d62a1f";
const WHITE = "#f2f2f2";
const SUIT = "#e8e8f0";
const SKIN = "#e0a878";
const NAVY = "#0c1450";
const FIRE = "#ff8a14";
const FIRE2 = "#ffd61e";

const hash = (k: number) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------------------------------------------------------
// Paints

const BLUE_RAMP = ["#0c1670", "#14289e", "#1d3fd2", "#3463f2", "#6f95ff"];
const MUD = ["#2c2018", "#4a3626", "#6a4e34"];
const SILVER = ["#5b6170", "#8a91a1", "#c4cad6", "#eef1f7"];

// Blue body with swept-back flame tongues on the flanks and mud splashed on the lower panels.
const BODY = cellPaint(
  TEXEL,
  (c) => {
    const { y, z } = c.at;
    const side = Math.abs(c.n.x) > 0.6;
    const v = y - 1.88;
    if (side) {
      if (Math.abs(z - 0.93) < 0.02 || Math.abs(z + 0.32) < 0.02) return "#08104a";
      if (y < 1.92) return "#070d3a";
      if (v >= 0 && v < 0.74) {
        const env = Math.min(Math.max((z + 1.6) / 3.7, 0), 1);
        if (env > 0.03) {
          const ph = (z + 0.9 * v) * 3.3;
          const k = Math.floor(ph);
          const tooth = 1 - Math.abs(ph - k - 0.5) * 2;
          const H = Math.min(0.7, env * (0.1 + 0.62 * (0.5 + hash(k)) * tooth));
          if (v < H * 0.42) return FIRE2;
          if (v < H * 0.72) return FIRE;
          if (v < H) return "#d8281c";
          if (v < H + 0.045) return "#0a1766";
        }
      }
    }
    if (y < 2.05 && c.random(5) < (2.05 - y) * 1.2) return c.pick(MUD, c.random(6));
    const shade = 0.5 + 0.3 * Math.max(c.n.y, -0.2) + (c.random(2) - 0.5) * 0.12;
    return c.pick(BLUE_RAMP, shade);
  },
  { dither: true },
);

const METAL = cellPaint(0.03, (c) => c.pick(SILVER, 0.45 + 0.3 * c.n.y + (c.random(1) - 0.5) * 0.25));
const FRAME = cellPaint(0.03, (c) =>
  c.pick(["#0e0e14", "#1c1c26", "#2b2d3a"], 0.4 + 0.3 * c.n.y + (c.random(2) - 0.5) * 0.4),
);
const SEAT = cellPaint(0.03, (c) =>
  c.pick(["#1a1c28", "#2a2e44", "#3a4062"], 0.4 + 0.3 * c.n.y + 0.3 * (c.random(3) - 0.5)),
);
const BEDFLOOR = cellPaint(0.04, (c) => (c.axis === 1 && c.u % 2 === 0 ? "#2a2a33" : "#1b1b22"));

const tirePaint = (cy: number, cz: number) =>
  cellPaint(0.03, (c) => {
    if (c.at.y < 0.5 && c.random(7) < (0.5 - c.at.y) * 0.9) return c.pick(MUD, c.random(8));
    const d = Math.hypot(c.at.y - cy, c.at.z - cz);
    if (Math.abs(c.n.x) > 0.55) {
      if (d > 0.62 && d < 0.7) {
        const k = Math.floor(Math.atan2(c.at.z - cz, c.at.y - cy) * 9);
        if (k % 2 === 0 && hash(k) > 0.3) return "#d6d6de";
      }
      if (d < 0.46) return "#0d0d12";
      if (d > 0.76) return c.pick(["#0c0c10", "#16161c"], c.random(1));
      return c.pick(["#0e0e13", "#1b1b22", "#25252e"], 0.2 + c.random(3) * 0.5 + (d > 0.72 ? 0.2 : 0));
    }
    return c.pick(["#0a0a0d", "#121217", "#1c1c23"], 0.1 + 0.7 * c.random(4));
  });

const rimPaint = (cy: number, cz: number) =>
  cellPaint(0.02, (c) => {
    const dy = c.at.y - cy;
    const dz = c.at.z - cz;
    const d = Math.hypot(dy, dz);
    const lit = 0.5 + 0.35 * (dy / Math.max(d, 0.04)) + (c.random(2) - 0.5) * 0.15;
    if (d < 0.17) return c.pick(["#0e2a9a", "#1a44e0", "#3f6dff"], lit);
    if (d < 0.21) return "#0a0a10";
    if (d < 0.355) return c.pick(SILVER, lit);
    if (d < 0.435) {
      const t = ((Math.atan2(dz, dy) + Math.PI) / (2 * Math.PI)) * 16;
      const fr = t - Math.floor(t);
      if (fr > 0.3 && fr < 0.7 && d > 0.375 && d < 0.415) return "#2a2d36";
      return c.pick(["#9aa1b0", "#e8ecf4"], lit);
    }
    return "#14141a";
  });

// ---------------------------------------------------------------------------------------------------------------
// Textures

const HEADTEX = pixelArt(
  [
    "kkkkkkkkkk",
    "kcyyyyyyck",
    "kywwwwwwyk",
    "kywwwwwwyk",
    "kywwwwwwyk",
    "kywwwwwwyk",
    "kcyyyyyyck",
    "kkkkkkkkkk",
  ],
  { k: "#1a1a22", c: "#aab4d8", y: "#fff3b0", w: "#ffffff" },
);
const BARLIGHT = pixelArt(
  ["kkkkkkkk", "kyyyyyyk", "kywwwwyk", "kywwwwyk", "kywwwwyk", "kywwwwyk", "kyyyyyyk", "kkkkkkkk"],
  { k: "#15151c", y: "#cfd8ff", w: "#ffffff" },
);
const AMBER = pixelArt(["kkkkkkkkkk", "kaaaaaaaak", "kaooooooak", "kkkkkkkkkk"], {
  k: "#1a1a22",
  a: "#ffc24a",
  o: "#ff8a14",
});
const TAIL = pixelArt(["kkkkkkkkkk", "krrrrrrrrk", "krddddddrk", "kkkkkkkkkk"], {
  k: "#1a1a22",
  r: "#ff3a2a",
  d: "#b01410",
});
const GRILLE = pixelTexture(36, 14, (g) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return "#c4cad6";
    if (x % 9 === 0) return "#8e95a5";
    if (y % 3 === 1) return "#6d7484";
    if (y % 3 === 2) return "#2a2d38";
    return "#14151c";
  });
  g.stamp(16, 5, ["rrrr", "rwwr", "rrrr"], { r: "#c01818", w: "#f2f2f2" });
});
const VENT = pixelTexture(12, 4, (g) => {
  g.fill((x, y) => (y % 2 === 0 ? "#08080c" : x % 3 === 0 ? "#3a3d48" : "#14141a"));
});
const BUMPER = pixelTexture(40, 6, (g) => {
  g.fill(() => "#0a0a10", [3, 1, 12, 4]);
  g.fill(() => "#0a0a10", [25, 1, 12, 4]);
  g.fill((x) => (x % 3 === 0 ? "#2a2d38" : undefined), [3, 1, 12, 4]);
  g.fill((x) => (x % 3 === 0 ? "#2a2d38" : undefined), [25, 1, 12, 4]);
  g.fill(() => "#f2f2f2", [17, 1, 6, 4]);
  g.fill((x) => (x % 2 === 0 ? "#1a1a22" : undefined), [18, 2, 4, 2]);
});
const PLATE = pixelTexture(12, 6, (g) => {
  g.fill((x, y, w, h) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#1a2a8a" : "#f2f2f2"));
  g.fill((x) => (x % 2 === 0 ? "#1a1a22" : undefined), [2, 2, 8, 2]);
});
const EMBLEM = pixelArt(
  [
    "......rrrr..",
    ".....ryyyr..",
    "....ryyyr...",
    "...ryyyyyrr.",
    "..ryyyyyyyr.",
    ".rrrrryyyr..",
    "....ryyyr...",
    "...ryyyr....",
    "..ryyr......",
    ".rrr........",
  ],
  { r: "#c01818", y: "#ffd61e" },
);
const DOORNUM = pixelTexture(14, 16, (g) => {
  g.fill((x, y) => {
    const d = Math.hypot(x - 6.5, y - 7.5);
    if (d > 7) return undefined;
    return d > 5.6 ? "#ffd61e" : "#0b1255";
  });
  g.stamp(4, 4, ["######", "....##", "...##.", "..##..", "..##..", "..##..", "..##.."], { "#": "#ffffff" });
});
const FLAG = pixelTexture(8, 6, (g) => {
  g.fill((x, y) => ((x + y) % 2 ? "#f2f2f2" : "#101014"));
});
const glassTex = (w: number, h: number) =>
  pixelTexture(w, h, (g) => {
    g.fill((x, y) => {
      const d = (x + y) % 11;
      if (d === 3 || d === 4) return "#d8f0ff";
      if (d === 8) return "#8cc2ee";
      return undefined;
    });
  });
const SIDEGLASS = glassTex(24, 13);
const FRONTGLASS = glassTex(30, 13);
const REARGLASS = glassTex(40, 8);

// ---------------------------------------------------------------------------------------------------------------

const TIRE_PROFILE: Array<[number, number]> = [
  [0.4, -0.5],
  [0.52, -0.52],
  [0.7, -0.5],
  [0.8, -0.42],
  [0.84, -0.3],
  [0.84, 0.3],
  [0.8, 0.42],
  [0.7, 0.5],
  [0.52, 0.52],
  [0.4, 0.5],
];

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });

  // ----- skeleton
  const chassis = b.joint("chassis", { at: [0, 1.7, 0] });
  const hood = b.joint("hood", { parent: chassis, at: [0, 2.6, 0.95], dir: [1, 0, 0], role: "hinge" });
  const tailgate = b.joint("tailgate", { parent: chassis, at: [0, 1.95, -2.32], dir: [1, 0, 0], role: "hinge" });
  const doorOf = new Map<number, Joint>();
  for (const s of [1, -1])
    doorOf.set(
      s,
      b.joint(s > 0 ? "doorL" : "doorR", {
        parent: chassis,
        at: [s * 0.97, 2.2, 0.93],
        dir: [0, 1, 0],
        role: "hinge",
      }),
    );
  const wheels: { s: number; z: number; wb: Joint }[] = [];
  for (const [az, tag] of [
    [AXLE_F, "F"],
    [AXLE_R, "R"],
  ] as const)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      let parent: Joint = chassis;
      if (tag === "F")
        parent = b.joint(`steer${side}`, {
          parent: chassis,
          at: [s * TX, WY + 0.35, az],
          dir: [0, 1, 0],
          role: "hinge",
        });
      const wb = b.joint(`wheel${tag}${side}`, { parent, at: [s * TX, WY, az], dir: [s, 0, 0], role: "hinge" });
      wheels.push({ s, z: az, wb });
    }

  // ----- merge buckets: one part per colour and bone
  const groups = new Map<string, { color: string; bone: Joint; geos: THREE.BufferGeometry[] }>();
  const put = (color: string, bone: Joint, geo: THREE.BufferGeometry, at: readonly number[] = [0, 0, 0], dir?: readonly number[]) => {
    if (dir) geo.applyQuaternion(aim(dir));
    geo.translate(at[0], at[1], at[2]);
    const key = `${color}|${bone.name}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { color, bone, geos: [] }));
    g.geos.push(geo);
  };
  const putBox = (color: string, bone: Joint, size: V, at: V) =>
    put(color, bone, new THREE.BoxGeometry(size[0], size[1], size[2]), at);
  const putTube = (color: string, bone: Joint, a: V, c: V, r: number, sides = 8) => {
    const d: V = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    put(color, bone, new THREE.CylinderGeometry(r, r, len, sides), [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], d);
  };
  const putCyl = (color: string, bone: Joint, r: number, h: number, at: V, dir: V, sides = 10) =>
    put(color, bone, new THREE.CylinderGeometry(r, r, h, sides), at, dir);
  const mixV = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  const bp = (size: V, color: string | Paint, at: V, bone: Joint = chassis) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, bone: Joint, up: V = [0, 1, 0], strength = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });
    if (strength) glow(p, strength);
    return p;
  };

  // ----- tyres, rims, hubs
  for (const { s, z, wb } of wheels) {
    const cx = s * TX;
    b.lathe(TIRE_PROFILE, { at: [cx, WY, z], axis: [1, 0, 0], segments: 24, bone: wb, color: tirePaint(WY, z) });
    const n = 18;
    for (let i = 0; i < n; i++) {
      const th = ((i + 0.5) / n) * Math.PI * 2;
      for (const sx of [1, -1]) {
        const g = new THREE.BoxGeometry(0.3, 0.09, 0.16);
        g.rotateY(sx * 0.55);
        g.translate(sx * 0.15, TIRE_R, 0);
        g.rotateX(th);
        put(LUG, wb, g, [cx, WY, z]);
        const k = new THREE.BoxGeometry(0.12, 0.1, 0.14);
        k.translate(sx * 0.43, 0.79, 0);
        k.rotateX(th + Math.PI / n);
        put(LUG, wb, k, [cx, WY, z]);
      }
    }
    const rim = rimPaint(WY, z);
    for (const side of [1, -1])
      b.part(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 24), rim, {
        bone: wb,
        at: [cx + s * side * 0.38, WY, z],
        dir: [1, 0, 0],
      });
    const ox = cx + s * 0.4;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      putBox(STEEL, wb, [0.05, 0.045, 0.045], [ox, WY + 0.395 * Math.cos(a), z + 0.395 * Math.sin(a)]);
    }
    putCyl("#1a44e0", wb, 0.17, 0.1, [ox + s * 0.03, WY, z], [1, 0, 0], 12);
    putCyl(CHROME, wb, 0.08, 0.05, [ox + s * 0.09, WY, z], [1, 0, 0], 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      putBox(CHROME, wb, [0.05, 0.04, 0.04], [ox + s * 0.085, WY + 0.125 * Math.cos(a), z + 0.125 * Math.sin(a)]);
    }
    putTube(STEEL, wb, [cx - s * 0.5, WY, z], [cx + s * 0.38, WY, z], 0.07, 8);
  }

  // ----- axles, links, shocks
  const shock = (lo: V, hi: V) => {
    const d: V = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const n = 10;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      put(i % 2 ? SPRING_B : SPRING_A, chassis, new THREE.CylinderGeometry(0.1, 0.1, (len / n) * 0.62, 8), mixV(lo, hi, t), d);
    }
    putTube(CHROME, chassis, lo, hi, 0.035, 6);
    putTube(DARK, chassis, lo, mixV(lo, hi, 0.3), 0.065, 8);
    putBox(STEEL, chassis, [0.14, 0.05, 0.14], [lo[0], lo[1] - 0.03, lo[2]]);
    putBox(STEEL, chassis, [0.14, 0.05, 0.14], [hi[0], hi[1] + 0.03, hi[2]]);
  };
  for (const [az, f] of [
    [AXLE_F, 1],
    [AXLE_R, -1],
  ] as const) {
    putTube(DARK2, chassis, [-0.8, WY, az], [0.8, WY, az], 0.1, 8);
    putTube(STEEL, chassis, [-0.8, WY, az], [-0.55, WY, az], 0.13, 8);
    putTube(STEEL, chassis, [0.8, WY, az], [0.55, WY, az], 0.13, 8);
    const pumpkin = new THREE.SphereGeometry(0.22, 10, 7);
    pumpkin.scale(1, 1, 0.85);
    put("#505868", chassis, pumpkin, [0, WY, az]);
    putCyl(STEEL, chassis, 0.1, 0.22, [0, WY, az + f * 0.2], [0, 0, 1], 8);
    for (const s of [1, -1]) {
      putTube(LINK, chassis, [s * 0.45, WY + 0.04, az], [s * 0.4, 1.5, az - f * 1.0], 0.05, 6);
      putTube(LINK, chassis, [s * 0.25, WY + 0.26, az], [s * 0.3, 1.62, az - f * 0.7], 0.045, 6);
      putBox(STEEL, chassis, [0.12, 0.12, 0.12], [s * 0.45, WY + 0.04, az]);
      for (const zo of [-0.3, 0.3]) shock([s * 0.64, 1.0, az + zo], [s * 0.5, 1.74, az + zo]);
    }
    if (f > 0) {
      putTube(STEEL, chassis, [-0.78, WY + 0.05, az + 0.3], [0.78, WY + 0.05, az + 0.3], 0.035, 6);
      putTube(STEEL, chassis, [0.4, WY + 0.05, az + 0.3], [0.4, 1.3, az - 0.3], 0.04, 6);
    }
  }
  // driveline and underbody
  putBox("#2b2d3a", chassis, [0.5, 0.4, 0.9], [0, 1.4, 0.0]);
  putTube(STEEL, chassis, [0, 1.15, 1.3], [0, 1.25, 0.45], 0.06, 8);
  putTube(STEEL, chassis, [0, 1.2, -0.45], [0, 1.0, -1.3], 0.06, 8);
  putBox(DARK, chassis, [0.14, 0.14, 0.14], [0, 1.15, 0.45]);
  putBox("#3a3d48", chassis, [0.62, 0.3, 0.7], [0, 1.5, -0.95]);
  for (const zc of [-2.0, -1.0, 0.4, 1.0, 2.0]) putBox(DARK2, chassis, [0.9, 0.12, 0.14], [0, 1.68, zc]);
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.14, 0.18, 4.7), FRAME, { bone: chassis, at: [s * 0.4, 1.71, 0.05] });
  b.part(new THREE.BoxGeometry(1.9, 0.06, 4.5), FRAME, { bone: chassis, at: [0, 1.82, 0.0] });

  // ----- nose, hood
  bp([1.96, 0.7, 1.27], BODY, [0, 2.2, 1.565]);
  bp([1.84, 0.07, 1.25], BODY, [0, 2.585, 1.56], hood);
  bp([0.62, 0.17, 0.6], BODY, [0, 2.705, 1.45], hood);
  bp([0.5, 0.06, 0.4], METAL, [0, 2.8, 1.45], hood);
  plane(VENT, 0.5, 0.12, [0, 2.7, 1.754], [0, 0, 1], hood);
  for (const s of [1, -1]) putBox(DARK, hood, [0.05, 0.03, 0.2], [s * 0.82, 2.628, 1.1]);

  // grille, headlights, signals
  putBox(CHROME, chassis, [1.14, 0.5, 0.04], [0, 2.3, 2.2]);
  plane(GRILLE, 1.08, 0.42, [0, 2.3, 2.225], [0, 0, 1], chassis);
  for (const s of [1, -1]) {
    putBox(CHROME, chassis, [0.36, 0.3, 0.04], [s * 0.78, 2.4, 2.2]);
    plane(HEADTEX, 0.3, 0.24, [s * 0.78, 2.4, 2.225], [0, 0, 1], chassis, [0, 1, 0], 1.2);
    putBox(CHROME, chassis, [0.34, 0.16, 0.04], [s * 0.78, 2.17, 2.2]);
    plane(AMBER, 0.3, 0.12, [s * 0.78, 2.17, 2.225], [0, 0, 1], chassis, [0, 1, 0], 1);
  }

  // bumper, push bar, hooks
  bp([2.1, 0.22, 0.22], METAL, [0, 1.97, 2.3]);
  plane(BUMPER, 1.9, 0.19, [0, 1.97, 2.413], [0, 0, 1], chassis);
  for (const s of [1, -1]) {
    putBox(RED, chassis, [0.12, 0.08, 0.16], [s * 0.35, 1.92, 2.48]);
    putTube(DARK, chassis, [s * 0.55, 1.95, 2.42], [s * 0.55, 2.5, 2.42], 0.03, 6);
    putTube(DARK, chassis, [s * 0.55, 2.5, 2.42], [s * 0.55, 2.55, 2.2], 0.03, 6);
  }
  putTube(DARK, chassis, [-0.55, 2.45, 2.42], [0.55, 2.45, 2.42], 0.03, 6);

  // ----- cab
  b.part(new THREE.BoxGeometry(1.96, 1.05, 0.07), BODY, { bone: chassis, at: [0, 2.375, -0.355] });
  b.part(new THREE.BoxGeometry(1.84, 0.09, 1.1), BODY, { bone: chassis, at: [0, 3.33, 0.2] });
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 2.6, 0.95], [s * 0.86, 3.3, 0.68], 0.05, BODY, { sides: 4, bone: chassis });
    bp([0.1, 0.45, 0.1], BODY, [s * 0.9, 3.08, -0.34]);
    bp([0.06, 0.06, 1.1], BODY, [s * 0.9, 3.28, 0.2]);
    plane(SIDEGLASS, 1.18, 0.63, [s * 0.9, 2.935, 0.29], [s, 0, 0], chassis);
  }
  plane(FRONTGLASS, 1.74, 0.73, [0, 2.955, 0.81], [0, 0.3, 0.67], chassis, [0, 0.67, -0.3]);
  plane(REARGLASS, 1.7, 0.35, [0, 3.08, -0.378], [0, 0, -1], chassis);

  // interior
  b.part(new THREE.BoxGeometry(1.9, 0.1, 1.3), FRAME, { bone: chassis, at: [0, 1.9, 0.3] });
  b.part(new THREE.BoxGeometry(1.8, 0.4, 0.35), FRAME, { bone: chassis, at: [0, 2.45, 0.78] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.16, 0.52), SEAT, { bone: chassis, at: [s * 0.42, 2.1, 0.22] });
    b.part(new THREE.BoxGeometry(0.5, 0.62, 0.12), SEAT, { bone: chassis, at: [s * 0.42, 2.5, -0.04] });
  }
  putBox(SUIT, chassis, [0.4, 0.5, 0.22], [0.42, 2.44, 0.12]);
  putBox(SKIN, chassis, [0.2, 0.2, 0.2], [0.42, 2.8, 0.15]);
  putBox(RED, chassis, [0.28, 0.26, 0.28], [0.42, 2.9, 0.14]);
  putBox(WHITE, chassis, [0.06, 0.26, 0.29], [0.42, 2.9, 0.14]);
  putBox(BLACK, chassis, [0.22, 0.09, 0.03], [0.42, 2.86, 0.29]);
  putTube(SUIT, chassis, [0.22, 2.6, 0.12], [0.32, 2.62, 0.5], 0.05, 6);
  putTube(SUIT, chassis, [0.62, 2.6, 0.12], [0.52, 2.62, 0.5], 0.05, 6);
  const wheel = new THREE.TorusGeometry(0.15, 0.025, 5, 10);
  wheel.rotateX(0.52);
  put(BLACK, chassis, wheel, [0.42, 2.62, 0.5]);
  putTube(DARK, chassis, [0.42, 2.45, 0.68], [0.42, 2.62, 0.5], 0.03, 6);

  // roll cage behind the cab
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        [s * 0.84, 1.95, -0.55],
        [s * 0.84, 3.45, -0.55],
        [s * 0.8, 3.42, -0.15],
      ]),
      0.045,
      DARK,
      { sides: 6, bone: chassis },
    );
    b.rod([s * 0.84, 3.4, -0.55], [s * 0.84, 2.7, -1.25], 0.04, DARK, { sides: 6, bone: chassis });
  }
  b.rod([-0.84, 3.45, -0.55], [0.84, 3.45, -0.55], 0.04, DARK, { sides: 6, bone: chassis });
  b.rod([-0.84, 2.9, -0.55], [0.84, 2.9, -0.55], 0.035, DARK, { sides: 6, bone: chassis });

  // light bar
  putBox(BLACK, chassis, [1.5, 0.06, 0.14], [0, 3.41, 0.5]);
  for (const s of [1, -1]) putBox(BLACK, chassis, [0.06, 0.1, 0.1], [s * 0.7, 3.4, 0.5]);
  for (const x of [-0.54, -0.18, 0.18, 0.54]) {
    putBox(BLACK, chassis, [0.3, 0.24, 0.14], [x, 3.54, 0.5]);
    plane(BARLIGHT, 0.26, 0.2, [x, 3.54, 0.573], [0, 0, 1], chassis, [0, 1, 0], 1.2);
  }

  // doors
  for (const s of [1, -1]) {
    const door = doorOf.get(s)!;
    bp([0.07, 0.75, 1.25], BODY, [s * 0.945, 2.225, 0.305], door);
    putBox(CHROME, door, [0.05, 0.035, 1.2], [s * 0.96, 2.615, 0.305]);
    putBox(CHROME, door, [0.04, 0.04, 0.2], [s * 0.995, 2.45, -0.05]);
    plane(DOORNUM, 0.4, 0.457, [s * 0.985, 2.2, 0.42], [s, 0, 0], door);
    putTube(STEEL, door, [s * 0.98, 2.62, 0.85], [s * 1.1, 2.8, 0.85], 0.02, 6);
    putBox(CHROME, door, [0.07, 0.26, 0.17], [s * 1.14, 2.9, 0.85]);
    putBox("#9cc4ff", door, [0.05, 0.2, 0.012], [s * 1.14, 2.9, 0.762]);
  }

  // ----- bed
  b.part(new THREE.BoxGeometry(1.8, 0.08, 1.97), BEDFLOOR, { bone: chassis, at: [0, 1.9, -1.35] });
  for (const s of [1, -1]) {
    bp([0.1, 0.85, 1.97], BODY, [s * 0.93, 2.275, -1.35]);
    putBox(NAVY, chassis, [0.14, 0.06, 1.97], [s * 0.93, 2.72, -1.35]);
    for (const z of [-0.8, -1.6]) putBox(CHROME, chassis, [0.05, 0.05, 0.1], [s * 0.86, 2.66, z]);
  }
  bp([1.76, 0.7, 0.07], BODY, [0, 2.3, -2.3], tailgate);
  putBox(NAVY, tailgate, [1.76, 0.05, 0.1], [0, 2.67, -2.3]);
  plane(EMBLEM, 0.5, 0.42, [0, 2.4, -2.341], [0, 0, -1], tailgate);
  plane(PLATE, 0.36, 0.18, [0, 2.07, -2.341], [0, 0, -1], tailgate);
  for (const s of [1, -1]) plane(TAIL, 0.3, 0.12, [s * 0.72, 2.5, -2.341], [0, 0, -1], tailgate, [0, 1, 0], 1);
  bp([2.0, 0.2, 0.14], METAL, [0, 1.9, -2.42]);

  // bed dressing: exhaust stacks, nitro bottles, cooler, chain, flag
  for (const s of [1, -1]) {
    putTube(CHROME, chassis, [s * 0.45, 1.96, -0.7], [s * 0.45, 3.2, -0.7], 0.07, 8);
    putCyl(CHROME, chassis, 0.11, 0.14, [s * 0.45, 3.27, -0.7], [0, 1, 0], 8);
    glow(b.spike([s * 0.45, 3.3, -0.7], [0, 1, 0], 0.45, 0.075, FIRE, { bone: chassis }), 1.3);
    glow(b.spike([s * 0.45, 3.3, -0.7], [0, 1, 0], 0.3, 0.04, FIRE2, { bone: chassis }), 1.5);
    putCyl("#d9dde6", chassis, 0.1, 0.5, [s * 0.55, 2.22, -1.2], [0, 1, 0], 8);
    putCyl(RED, chassis, 0.06, 0.1, [s * 0.55, 2.52, -1.2], [0, 1, 0], 8);
    putBox(RED, chassis, [0.03, 0.12, 0.06], [s * 0.55, 2.58, -1.2]);
  }
  putBox(RED, chassis, [0.6, 0.3, 0.4], [0, 2.09, -1.85]);
  putBox(WHITE, chassis, [0.62, 0.05, 0.42], [0, 2.27, -1.85]);
  const chain = new THREE.TorusGeometry(0.16, 0.03, 4, 8);
  chain.rotateX(Math.PI / 2);
  put(STEEL, chassis, chain, [-0.5, 1.98, -1.85]);
  putTube(CHROME, chassis, [0.88, 1.95, -2.25], [0.88, 3.4, -2.25], 0.02, 6);
  plane(FLAG, 0.6, 0.42, [0.884, 3.2, -2.55], [1, 0, 0], chassis);
  plane(FLAG, 0.6, 0.42, [0.876, 3.2, -2.55], [-1, 0, 0], chassis);

  // ----- flush merged buckets
  for (const g of groups.values()) {
    const merged = mergeGeometries(g.geos);
    if (!merged) throw new Error(`monsterTruck: cannot merge ${g.color} on ${g.bone.name}`);
    b.part(merged, g.color, { bone: g.bone, at: [0, 0, 0], flat: true });
  }

  return b.root;
}
