import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, grain, mottle, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A palm-shaded oasis with a turquoise pool and little waterfall, two striped bedouin tents, a standing and a resting camel, a campfire and trade goods on a chunky sand island.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type Fillc = string | Paint;

const G = 0.1; // sand surface height
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// Palette
const SAND = "#e6b765";
const SAND_D = "#cf9a4d";
const SAND_L = "#f1cf85";
const ROCK = "#a89a8b";
const ROCK_D = "#857867";
const WATER = "#2fc4cf";
const WATER_L = "#8aeee8";
const WATER_D = "#1c9fb4";
const FOAM = "#e6fbfb";
const PALM_G = "#3f9e3a";
const PALM_G2 = "#62bd47";
const TRUNK = "#8a5a33";
const TRUNK_D = "#5c3a20";
const DATE = "#e08a1e";
const DATE_D = "#a85a14";
const RED = "#b8312e";
const RED_D = "#8a2220";
const BLUE = "#3a5aa6";
const BLUE_D = "#2a4080";
const CREAM = "#f0e0b8";
const GOLD = "#e8b830";
const WOOD = "#7a4e2c";
const WOOD_D = "#4f3018";
const CAMEL = "#c8935a";
const CAMEL_L = "#e3bd8a";
const CAMEL_D = "#8a5c32";
const DARK = "#2e2420";
const CLAY = "#c46a3c";
const CLAY_D = "#8a4426";
const AGAVE = "#4fa36a";
const AGAVE_D = "#2f7a50";
const GRASS = "#d6b84a";
const GRASS_D = "#a88a30";
const CUSH1 = "#d85a3a";
const CUSH2 = "#3a8a8a";
const FIRE = "#ffb030";
const FIRE2 = "#ff6020";
const COAL = "#3a3330";
const ROPE = "#b08a58";
const LEATHER = "#7a4a28";
const INTERIOR = "#3a1f1a";

const frondOutline = (k0: number, k1: number, L: number, W: number): OutlinePoint[] => {
  const K = 16;
  const up: OutlinePoint[] = [];
  const lo: OutlinePoint[] = [];
  for (let k = k0; k <= k1; k++) {
    const u = k / K;
    const x = (u - k0 / K) * L;
    if (k === K) {
      up.push([x, 0, "sharp"]);
      continue;
    }
    const hw = Math.max(0.006, W * Math.sin(Math.PI * Math.pow(u, 0.8)) * (k % 2 === 0 ? 1 : 0.55));
    if (k % 2 === 0) {
      up.push([x, hw, "sharp"]);
      lo.push([x, -hw, "sharp"]);
    } else {
      up.push([x, hw]);
      lo.push([x, -hw]);
    }
  }
  return [...up, ...lo.reverse()];
};

const diamondStrip = (bg: string, border: string, fg: string) => {
  let d = "";
  for (let k = 0; k < 8; k++) {
    const cx = 6 + 12 * k;
    d += `<polygon points="${cx},1.8 ${cx + 4.5},6 ${cx},10.2 ${cx - 4.5},6" fill="${fg}"/>`;
    d += `<rect x="${cx - 1}" y="5" width="2" height="2" fill="${bg}"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 12"><rect width="96" height="12" fill="${bg}"/><rect width="96" height="1.4" fill="${border}"/><rect y="10.6" width="96" height="1.4" fill="${border}"/>${d}</svg>`,
    { size: 192 },
  );
};

const blanketTex = () => {
  let d = "";
  for (let k = 0; k < 5; k++) {
    const cx = 4 + 8 * k;
    d += `<polygon points="${cx},8 ${cx + 3.5},12 ${cx},16 ${cx - 3.5},12" fill="#f0e0b8"/><polygon points="${cx},10 ${cx + 1.6},12 ${cx},14 ${cx - 1.6},12" fill="#2a4080"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24"><rect width="40" height="24" fill="#b8312e"/><rect y="5" width="40" height="2" fill="#2a4080"/><rect y="17" width="40" height="2" fill="#2a4080"/><rect y="21" width="40" height="3" fill="#e8b830"/>${d}</svg>`,
    { size: 160 },
  );
};

const rugTex = (field: string, border: string, accent: string, light: string) => {
  let d = "";
  for (let k = 0; k < 6; k++) {
    d += `<rect x="${5 + k * 9}" y="3" width="4" height="4" fill="${light}"/><rect x="${5 + k * 9}" y="33" width="4" height="4" fill="${light}"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="${border}"/><rect x="2" y="2" width="56" height="36" fill="${accent}"/><rect x="9" y="9" width="42" height="22" fill="${field}"/><polygon points="30,10 46,20 30,30 14,20" fill="${border}"/><polygon points="30,14 40,20 30,26 20,20" fill="${light}"/><polygon points="30,17 34,20 30,23 26,20" fill="${accent}"/>${d}</svg>`,
    { size: 192 },
  );
};

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  const root = b.joint("base", { at: [0, 0, 0] });
  const rand = rng(11);

  const P = (geo: THREE.BufferGeometry, color: Fillc, at: number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, flat: true, ...o, at });
  const box = (w: number, h: number, d: number, color: Fillc, at: number[], o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fillc, at: number[], o: PartOptions = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const sph = (r: number, color: Fillc, at: number[], o: PartOptions = {}, ws = 7, hs = 5) =>
    P(new THREE.SphereGeometry(r, ws, hs), color, at, o);
  const rod = (a: number[], c: number[], r: number, color: Fillc, o: SweepOptions = {}) =>
    b.rod(a, c, r, color, { bone: root, sides: 5, ...o });
  const spk = (base: number[], dir: number[], len: number, r: number, color: Fillc) =>
    b.spike(base, dir, len, r, color, { bone: root, sides: 4 });
  const frame = (ox: number, oz: number, yaw: number) => (x: number, y: number, z: number): number[] => {
    const s = Math.sin(rad(yaw));
    const c = Math.cos(rad(yaw));
    return [ox + x * c + z * s, y, oz - x * s + z * c];
  };

  // ---------------------------------------------------------------- island
  const outline: OutlinePoint[] = [];
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 1 + 0.07 * Math.sin(3 * a + 1) + 0.05 * Math.sin(5 * a + 2) + (rand() - 0.5) * 0.06;
    outline.push([1.4 * r * Math.sin(a), -1.2 * r * Math.cos(a)]);
  }
  const sandTop = mottle(SAND, "#dba95a", { size: 0.22, seed: 3 });
  const sandSide = stripes(SAND_D, "#b9823c", { size: 0.03, axis: "y", wobble: 0.3, width: 0.5 });
  b.extrude(outline, {
    at: [0, 0.05, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.1,
    color: paint((_p, n) => (n.y > 0.5 ? sandTop : sandSide)),
    bone: root,
    name: "island",
  });

  // dunes and ripple marks
  const dunes: Array<[number, number, number, number]> = [
    [-0.3, 0.2, 0.3, 1.5],
    [0.2, 0.35, 0.25, 1.3],
    [-1.0, 0.65, 0.28, 1.4],
    [0.2, 0.95, 0.22, 1.5],
    [1.0, -0.55, 0.26, 1.2],
  ];
  for (const [x, z, r, sx] of dunes) sph(r, SAND_L, [x, G - 0.045, z], { scale: [sx, 0.22, 1] }, 8, 5);
  const ripples: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.BoxGeometry(0.1 + rand() * 0.06, 0.003, 0.01);
    g.rotateY(rand() * 0.6 - 0.3);
    g.translate(-0.7 + rand() * 1.4, G + 0.001, 0.15 + rand() * 0.85);
    ripples.push(g);
  }
  P(mergeGeometries(ripples), SAND_D, [0, 0, 0], { name: "ripples" });

  // ---------------------------------------------------------------- rocks
  const rockPaint = countershade(mottle("#a99b8a", "#948672", { size: 0.12, seed: 5 }), "#7a6d5e", { level: -0.1 });
  const rock = (x: number, z: number, r: number, sy: number, ry: number, color: Fillc = rockPaint) =>
    P(new THREE.DodecahedronGeometry(r, 0), color, [x, G + r * sy * 0.6, z], {
      scale: [1, sy, 0.85],
      rotation: [ry * 0.3, ry, ry * 0.2],
    });

  // cliff and waterfall
  rock(-0.14, -0.58, 0.15, 1.3, 20);
  rock(0.14, -0.6, 0.17, 1.5, 75);
  rock(-0.02, -0.62, 0.15, 1.9, 40);
  rock(-0.3, -0.5, 0.1, 1.1, 10);
  rock(0.3, -0.5, 0.11, 1.0, 55);
  rock(0.0, -0.58, 0.1, 2.6, 5, "#8f8272");
  box(0.1, 0.26, 0.014, WATER_L, [0.0, G + 0.16, -0.44], { rotation: [6, 0, 0] });
  box(0.012, 0.25, 0.017, FOAM, [-0.025, G + 0.16, -0.443], { rotation: [6, 0, 0] });
  box(0.01, 0.2, 0.017, FOAM, [0.03, G + 0.15, -0.443], { rotation: [6, 0, 0] });
  for (const [x, z, r] of [
    [-0.05, -0.38, 0.035],
    [0.03, -0.37, 0.04],
    [0.08, -0.39, 0.03],
    [-0.1, -0.4, 0.03],
  ] as const)
    sph(r, FOAM, [x, G + 0.03, z], { scale: [1.2, 0.7, 1] }, 6, 4);

  // pool
  const px = 0;
  const pz = -0.08;
  cyl(0.4, 0.42, 0.012, 12, "#c99448", [px, G + 0.006, pz], { scale: [1.15, 1, 0.9] });
  cyl(0.35, 0.35, 0.02, 12, WATER, [px, G + 0.012, pz], { scale: [1.15, 1, 0.9], name: "water" });
  cyl(0.22, 0.22, 0.004, 10, WATER_D, [px, G + 0.0235, pz], { scale: [1.15, 1, 0.9] });
  for (const [r, y] of [
    [0.26, 0.0255],
    [0.15, 0.0265],
  ] as const) {
    P(new THREE.TorusGeometry(r, 0.004, 3, 14), WATER_L, [px + 0.02, G + y, pz + 0.02], {
      rotation: [90, 0, 0],
      scale: [1.15, 0.9, 1],
    });
  }
  // lily pads
  for (const [x, z] of [
    [0.17, 0.05],
    [0.23, 0.0],
    [-0.2, 0.12],
  ] as const) {
    cyl(0.03, 0.03, 0.004, 6, PALM_G2, [x, G + 0.026, z]);
    sph(0.009, "#f5a6c0", [x + 0.008, G + 0.032, z + 0.004], {}, 5, 3);
  }
  // pool rim rocks
  const rimRocks: Array<[number, number, number]> = [
    [-0.55, -0.08, 0.06],
    [-0.5, 0.1, 0.045],
    [-0.38, 0.22, 0.05],
    [-0.2, 0.3, 0.04],
    [0.22, 0.3, 0.05],
    [0.4, 0.2, 0.06],
    [0.52, 0.04, 0.05],
    [0.55, -0.18, 0.06],
    [-0.5, -0.28, 0.07],
  ];
  rimRocks.forEach(([x, z, r], i) => rock(x, z, r, 0.8 + (i % 3) * 0.2, i * 37));
  rock(0.25, 0.1, 0.035, 0.7, 12); // stepping stones in the water
  rock(-0.28, 0.0, 0.03, 0.7, 62);

  // boulders around the island
  rock(-1.05, 0.55, 0.14, 1.1, 12);
  rock(-0.9, 0.8, 0.1, 1.2, 70);
  rock(-1.18, 0.78, 0.08, 1.0, 130);
  rock(-0.78, 0.55, 0.08, 1.0, 30);
  rock(1.08, 0.7, 0.11, 0.9, 50);
  rock(-0.4, 0.9, 0.07, 0.8, 90);
  rock(0.1, 0.95, 0.09, 0.8, 100);
  rock(-1.2, -0.1, 0.07, 0.9, 40);
  rock(1.25, 0.15, 0.06, 0.9, 140);
  const pebbles: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.DodecahedronGeometry(0.014 + rand() * 0.012, 0);
    g.translate(-1.0 + rand() * 2.0, G + 0.008, -0.2 + rand() * 1.1);
    pebbles.push(g);
  }
  P(mergeGeometries(pebbles), ROCK_D, [0, 0, 0], { name: "pebbles" });

  // ---------------------------------------------------------------- palms
  const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number) => {
    const r = rng(seed);
    const top = [x + lx, G + h, z + lz];
    const trunkPts = [
      [x, G - 0.01, z],
      [x + lx * 0.12, G + h * 0.35, z + lz * 0.12],
      [x + lx * 0.5, G + h * 0.7, z + lz * 0.5],
      top,
    ];
    const bark = stripes(TRUNK, TRUNK_D, { size: 0.04, axis: "y", width: 0.5, wobble: 0.15, seed });
    b.sweep(catmull(trunkPts), [0.05, 0.026], {
      color: bark,
      bone: root,
      section: { ngon: 7 },
      caps: "flat",
      name: `trunk${seed}`,
    });
    cyl(0.04, 0.068, 0.07, 7, TRUNK_D, [x, G + 0.02, z]);
    sph(0.05, TRUNK_D, top, {}, 6, 4);
    for (let i = 0; i < 9; i++) {
      const yaw = i * 40 + r() * 12;
      const upright = i % 3 === 0;
      const e1 = upright ? 62 : 18 + r() * 12;
      const e2 = upright ? 10 : -38 - r() * 10;
      const L = upright ? 0.5 : 0.62 + r() * 0.1;
      const col = i % 2 ? PALM_G : PALM_G2;
      const d1 = new THREE.Vector3(
        Math.cos(rad(e1)) * Math.sin(rad(yaw)),
        Math.sin(rad(e1)),
        Math.cos(rad(e1)) * Math.cos(rad(yaw)),
      );
      const d2 = new THREE.Vector3(
        Math.cos(rad(e2)) * Math.sin(rad(yaw)),
        Math.sin(rad(e2)),
        Math.cos(rad(e2)) * Math.cos(rad(yaw)),
      );
      const o1 = new THREE.Vector3(top[0], top[1], top[2]);
      const o2 = o1.clone().addScaledVector(d1, (L * 9) / 16);
      const segs: Array<[THREE.Vector3, THREE.Vector3, number, number]> = [
        [o1, d1, 0, 9],
        [o2, d2, 9, 16],
      ];
      for (const [o, d, k0, k1] of segs) {
        const w = new THREE.Vector3(0, 1, 0).cross(d).normalize();
        b.extrude(frondOutline(k0, k1, L, 0.075), {
          at: o.toArray(),
          x: d.toArray(),
          y: w.toArray(),
          thickness: 0.006,
          color: col,
          bone: root,
        });
      }
    }
    // date bunches
    const dates: THREE.BufferGeometry[] = [];
    for (let c = 0; c < 2; c++) {
      const a = c * Math.PI + r() * 1.5;
      const cx = top[0] + Math.cos(a) * 0.05;
      const cy = top[1] - 0.07;
      const cz = top[2] + Math.sin(a) * 0.05;
      rod([top[0], top[1] - 0.02, top[2]], [cx, cy + 0.02, cz], 0.006, DATE_D, { sides: 4 });
      for (let j = 0; j < 7; j++) {
        const g = new THREE.SphereGeometry(0.014, 5, 4);
        g.translate(cx + (r() - 0.5) * 0.04, cy - j * 0.007, cz + (r() - 0.5) * 0.04);
        dates.push(g);
      }
    }
    P(mergeGeometries(dates), DATE, [0, 0, 0], { name: `dates${seed}` });
  };
  palm(-0.22, -0.78, 1.15, -0.1, 0.05, 21);
  palm(0.1, -0.84, 1.32, 0.05, 0.0, 22);
  palm(0.45, -0.66, 1.0, 0.16, 0.06, 23);

  // ---------------------------------------------------------------- plants
  const agave = (x: number, z: number, s: number) => {
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + x * 3;
      const out = 0.5 + (i % 2) * 0.5;
      spk([x, G - 0.005, z], [Math.cos(a) * out, 1, Math.sin(a) * out], 0.14 * s, 0.02 * s, i % 2 ? AGAVE : AGAVE_D);
    }
    spk([x, G - 0.005, z], [0, 1, 0], 0.15 * s, 0.015 * s, AGAVE);
  };
  const tuft = (x: number, z: number, s: number) => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + z * 5;
      spk([x, G - 0.005, z], [Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6], 0.09 * s, 0.006 * s, i % 2 ? GRASS : GRASS_D);
    }
  };
  for (const [x, z, s] of [
    [-0.42, -0.22, 1.0],
    [0.4, -0.26, 1.1],
    [-0.35, -0.42, 0.9],
    [0.58, 0.28, 0.8],
    [-0.6, 0.45, 1.0],
    [-1.1, 0.3, 0.9],
    [0.15, 0.5, 0.7],
    [0.3, -0.5, 0.9],
  ] as const)
    agave(x, z, s);
  for (const [x, z, s] of [
    [-0.65, 0.2, 1.0],
    [0.62, -0.05, 1.1],
    [1.05, 0.4, 1.0],
    [-0.25, 0.55, 0.9],
    [1.2, -0.3, 1.0],
    [-0.5, 0.95, 1.0],
    [0.7, 0.95, 0.9],
    [-1.25, 0.1, 0.9],
  ] as const)
    tuft(x, z, s);

  // ---------------------------------------------------------------- props
  const pot = (x: number, z: number, s: number) => {
    const o: OutlinePoint[] = [
      [0, 0],
      [0.03 * s, 0],
      [0.052 * s, 0.035 * s],
      [0.055 * s, 0.07 * s],
      [0.045 * s, 0.105 * s],
      [0.026 * s, 0.125 * s],
      [0.034 * s, 0.142 * s],
      [0, 0.135 * s],
    ];
    const pp = paint((_p, _n, c) => {
      const y = c[0] / s;
      if (y > 0.05 && y < 0.062) return CREAM;
      if (y > 0.08 && y < 0.09) return CLAY_D;
      return CLAY;
    });
    b.lathe(o, { at: [x, G, z], segments: 8, color: pp, bone: root, name: "pot" });
    b.lathe(
      [
        [0.03 * s, 0.138 * s],
        [0.04 * s, 0.145 * s],
        [0.0, 0.146 * s],
      ],
      { at: [x, G, z], segments: 8, color: CLAY_D, bone: root },
    );
  };
  const chest = (x: number, y: number, z: number, yaw: number, s: number) => {
    const T = frame(x, z, yaw);
    const o = { rotation: [0, yaw, 0] };
    box(0.09 * s, 0.05 * s, 0.06 * s, grain(WOOD, WOOD_D, { size: 0.01, axis: "x" }), T(0, y + 0.025 * s, 0), o);
    box(0.094 * s, 0.022 * s, 0.064 * s, WOOD_D, T(0, y + 0.061 * s, 0), o);
    for (const sx of [-1, 1]) box(0.01 * s, 0.075 * s, 0.066 * s, DARK, T(sx * 0.027 * s, y + 0.036 * s, 0), o);
    box(0.014 * s, 0.016 * s, 0.006 * s, GOLD, T(0, y + 0.046 * s, 0.033 * s), o);
  };
  const basket = (x: number, z: number) => {
    cyl(0.04, 0.032, 0.07, 8, stripes(ROPE, "#8a6a3a", { size: 0.012, axis: "y", wobble: 0.1 }), [x, G + 0.035, z]);
    P(new THREE.TorusGeometry(0.04, 0.005, 3, 8), "#8a6a3a", [x, G + 0.07, z], { rotation: [90, 0, 0] });
  };
  const stool = (x: number, z: number, yaw: number) => {
    const T = frame(x, z, yaw);
    box(0.07, 0.012, 0.07, WOOD, T(0, G + 0.075, 0), { rotation: [0, yaw, 0] });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) rod(T(sx * 0.027, G, sz * 0.027), T(sx * 0.03, G + 0.072, sz * 0.03), 0.006, WOOD_D);
    rod(T(-0.028, G + 0.03, 0), T(0.028, G + 0.03, 0), 0.004, WOOD_D);
  };

  // ---------------------------------------------------------------- tents
  const tent = (
    ox: number,
    oz: number,
    yaw: number,
    main: string,
    dark: string,
    trim: THREE.Texture,
    rug: THREE.Texture,
    rugOut: THREE.Texture,
    cushA: string,
    cushB: string,
    id: string,
  ) => {
    const T = frame(ox, oz, yaw);
    const W = 0.27;
    const D = 0.26;
    const WH = 0.19;
    const RH = 0.42;
    const base = G;
    const ang = Math.atan2(RH - WH, W);
    const slopeLen = Math.hypot(W, RH - WH) + 0.03;
    const fab = stripes(main, dark, { size: 0.05, axis: "x", width: 0.18, wobble: 0.2 });
    const cx = Math.cos(rad(yaw));
    const sx = Math.sin(rad(yaw));
    const xdir = [cx, 0, -sx];
    for (const s of [1, -1]) {
      box(slopeLen, 0.012, D * 2 + 0.06, fab, T((s * W) / 2, base + (WH + RH) / 2, 0), {
        rotation: [0, yaw, -s * deg(ang)],
      });
      for (const f of [1, -1])
        box(slopeLen - 0.01, 0.045, 0.006, "#ffffff", T((s * W) / 2, base + (WH + RH) / 2 - 0.004, f * (D + 0.034)), {
          rotation: [0, yaw, -s * deg(ang)],
          texture: trim,
        });
      box(0.008, WH, D * 2, fab, T(s * W, base + WH / 2, 0), { rotation: [0, yaw, 0] });
    }
    box(W * 2, WH, 0.008, fab, T(0, base + WH / 2, -D), { rotation: [0, yaw, 0] });
    b.extrude(
      [
        [-W, 0],
        [W, 0],
        [0, RH - WH],
      ],
      { at: T(0, base + WH, -D), x: xdir, thickness: 0.008, color: dark, bone: root },
    );
    b.extrude(
      [
        [-W, -WH],
        [W, -WH],
        [W, 0],
        [0, RH - WH],
        [-W, 0],
      ],
      { at: T(0, base + WH, D), x: xdir, thickness: 0.006, color: INTERIOR, bone: root },
    );
    // curtains on hinges, tied back
    for (const s of [1, -1]) {
      const hinge = b.joint(`flap${id}${s > 0 ? "L" : "R"}`, {
        parent: root,
        at: T(s * W, base + WH, D + 0.008),
        dir: [0, -1, 0],
        role: "hinge",
      });
      box(0.11, WH, 0.008, fab, T(s * (W - 0.055), base + WH / 2, D + 0.008), { rotation: [0, yaw, 0], bone: hinge });
      box(0.11, 0.03, 0.01, "#ffffff", T(s * (W - 0.055), base + WH - 0.02, D + 0.012), {
        rotation: [0, yaw, 0],
        bone: hinge,
        texture: trim,
      });
      box(0.012, 0.012, 0.012, GOLD, T(s * (W - 0.1), base + 0.09, D + 0.014), { rotation: [0, yaw, 0], bone: hinge });
    }
    // ridge beam, centre poles and finials
    rod(T(0, base + RH + 0.005, -D - 0.03), T(0, base + RH + 0.005, D + 0.03), 0.007, WOOD);
    for (const f of [1, -1]) {
      rod(T(0, base, f * (D + 0.02)), T(0, base + RH + 0.015, f * (D + 0.02)), 0.007, WOOD_D);
      sph(0.016, GOLD, T(0, base + RH + 0.03, f * (D + 0.02)), {}, 6, 4);
    }
    // outer slanted poles with guy ropes
    for (const s of [1, -1])
      for (const f of [1, -1]) {
        const topP = T(s * (W + 0.005), base + WH + 0.04, f * (D + 0.05));
        rod(T(s * (W + 0.07), base, f * (D + 0.1)), topP, 0.007, WOOD);
        sph(0.013, GOLD, topP, {}, 6, 4);
        spk(topP, [0, -1, 0], 0.05, 0.007, s * f > 0 ? RED : BLUE);
        const stake = T(s * (W + 0.2), base + 0.008, f * (D + 0.28));
        rod(topP, stake, 0.0025, ROPE, { sides: 3 });
        cyl(0.006, 0.006, 0.04, 4, WOOD_D, [stake[0], base + 0.015, stake[2]]);
      }
    // interior
    box(0.34, 0.006, 0.3, "#ffffff", T(0, base + 0.003, 0), { rotation: [0, yaw, 0], texture: rug });
    box(0.1, 0.05, 0.07, cushA, T(-0.1, base + 0.03, -0.17), { rotation: [0, yaw + 8, 0] });
    box(0.09, 0.045, 0.07, cushB, T(0.02, base + 0.028, -0.18), { rotation: [0, yaw - 6, 0] });
    box(0.07, 0.04, 0.06, cushA, T(0.13, base + 0.026, -0.16), { rotation: [0, yaw + 20, 0] });
    chest(...(T(-0.19, 0, -0.05).filter((_, i) => i !== 1) as [number, number]).slice(0, 1), base + 0.003, T(-0.19, 0, -0.05)[2], yaw, 0.9);
    rod(T(0, base + RH, D - 0.08), T(0, base + 0.335, D - 0.08), 0.002, ROPE, { sides: 3 });
    glow(box(0.026, 0.04, 0.026, FIRE, T(0, base + 0.31, D - 0.08), { rotation: [0, yaw, 0] }), 1.4);
    P(new THREE.ConeGeometry(0.02, 0.015, 4), GOLD, T(0, base + 0.337, D - 0.08));
    // rug outside
    box(0.3, 0.006, 0.22, "#ffffff", T(0.03, base + 0.003, D + 0.3), { rotation: [0, yaw + 5, 0], texture: rugOut });
  };

  const trimRed = diamondStrip(CREAM, RED_D, RED);
  const trimBlue = diamondStrip(CREAM, BLUE_D, BLUE);
  const rugA = rugTex("#b8312e", "#f0e0b8", "#2a4080", "#e8b830");
  const rugB = rugTex("#3a5aa6", "#f0e0b8", "#b8312e", "#e8b830");
  const rugC = rugTex("#d9822b", "#2a4080", "#8a2220", "#f0e0b8");
  const blanket = blanketTex();

  tent(-0.9, -0.12, 35, RED, RED_D, trimRed, rugA, rugC, CUSH1, CUSH2, "Red");
  tent(0.9, -0.22, -35, BLUE, BLUE_D, trimBlue, rugB, rugA, CUSH2, CUSH1, "Blue");

  // goods by the red tent
  chest(-1.18, G, 0.3, 80, 1.0);
  chest(-1.17, G + 0.06, 0.27, 70, 0.8);
  pot(-0.96, 0.32, 1.2);
  pot(-1.05, 0.12, 0.8);
  box(0.03, 0.03, 0.03, "#ffffff", [-0.5, G + 0.2, 0.0], { texture: trimRed }); // hanging sign-bead
  // goods by the blue tent
  chest(1.2, G, 0.1, 70, 1.0);
  chest(1.2, G + 0.06, 0.1, 100, 0.85);
  pot(1.15, 0.28, 1.3);
  pot(1.05, 0.38, 0.7);
  basket(1.22, 0.28);

  // ---------------------------------------------------------------- camels
  const coat = countershade(mottle(CAMEL, "#bb8450", { size: 0.12, seed: 9 }), CAMEL_L, { level: -0.15, soft: 0.3 });
  const camel = (ox: number, oz: number, yaw: number, sit: boolean, accA: string, accB: string) => {
    const T = frame(ox, oz, yaw);
    const by = G + (sit ? 0.14 : 0.275);
    const rot = { rotation: [0, yaw, 0] };
    b.loft(
      [
        { at: T(0, by, -0.21), w: 0.1, h: 0.12 },
        { at: T(0, by + 0.005, -0.1), w: 0.13, h: 0.15 },
        { at: T(0, by + 0.005, 0.06), w: 0.13, h: 0.15 },
        { at: T(0, by, 0.19), w: 0.11, h: 0.15 },
      ],
      { color: coat, bone: root, sides: 8, name: `body${yaw}` },
    );
    sph(0.055, coat, T(0, by + 0.105, -0.04), { ...rot, scale: [1, 1.2, 1.4] }, 7, 5);
    // neck and head
    b.sweep(catmull([T(0, by + 0.03, 0.17), T(0, by + 0.12, 0.25), T(0, by + 0.22, 0.285), T(0, by + 0.285, 0.32)]), [0.042, 0.025], {
      color: coat,
      bone: root,
      sides: 7,
      name: `neck${yaw}`,
    });
    sph(0.036, coat, T(0, by + 0.3, 0.335), { ...rot, scale: [0.9, 0.9, 1.3] });
    sph(0.028, CAMEL_L, T(0, by + 0.285, 0.405), { ...rot, scale: [0.9, 0.8, 1.35] });
    sph(0.01, DARK, T(0, by + 0.288, 0.44), {}, 5, 3);
    for (const s of [1, -1]) {
      sph(0.007, DARK, T(s * 0.025, by + 0.317, 0.36), {}, 5, 3);
      sph(0.016, coat, T(s * 0.027, by + 0.325, 0.355), { ...rot, scale: [1, 0.6, 1.3] }, 5, 3);
      sph(0.004, DARK, T(s * 0.008, by + 0.29, 0.437), {}, 4, 3);
      spk(T(s * 0.026, by + 0.33, 0.31), [s * 0.4, 1, -0.3], 0.035, 0.011, CAMEL_D);
      rod(T(s * 0.03, by + 0.295, 0.39), T(s * 0.033, by + 0.318, 0.325), 0.003, accA, { sides: 3 });
    }
    P(new THREE.TorusGeometry(0.029, 0.0035, 4, 8), accA, T(0, by + 0.285, 0.39), rot);
    spk(T(0, by + 0.26, 0.37), [0, -1, 0.2], 0.03, 0.01, CAMEL_D);
    if (!sit)
      b.sweep(catmull([T(0, by + 0.275, 0.42), T(0, by + 0.19, 0.5), T(0.03, G + 0.1, 0.52), T(0.06, G + 0.012, 0.5)]), 0.003, {
        color: ROPE,
        bone: root,
        sides: 4,
      });
    // tail
    b.sweep(catmull([T(0, by + 0.04, -0.22), T(0, by - 0.01, -0.27), T(0, by - 0.09, -0.275)]), [0.012, 0.007], {
      color: coat,
      bone: root,
      sides: 5,
    });
    sph(0.014, CAMEL_D, T(0, by - 0.1, -0.275), { scale: [1, 1.5, 1] }, 5, 4);
    // legs
    for (const s of [1, -1]) {
      if (!sit) {
        b.sweep([T(s * 0.05, by - 0.04, 0.14), T(s * 0.052, by - 0.14, 0.15), T(s * 0.052, G + 0.02, 0.145)], [0.03, 0.014], {
          color: coat,
          bone: root,
          sides: 6,
        });
        b.sweep(
          [T(s * 0.055, by - 0.03, -0.15), T(s * 0.057, by - 0.12, -0.12), T(s * 0.055, G + 0.1, -0.18), T(s * 0.055, G + 0.02, -0.16)],
          [0.032, 0.014],
          { color: coat, bone: root, sides: 6 },
        );
        sph(0.021, CAMEL_D, T(s * 0.053, by - 0.14, 0.158), {}, 5, 4);
        cyl(0.018, 0.024, 0.02, 6, CAMEL_D, T(s * 0.052, G + 0.01, 0.148), rot);
        cyl(0.018, 0.024, 0.02, 6, CAMEL_D, T(s * 0.055, G + 0.01, -0.16), rot);
      } else {
        b.sweep([T(s * 0.06, by - 0.05, 0.14), T(s * 0.07, G + 0.03, 0.12), T(s * 0.07, G + 0.025, 0.28)], [0.03, 0.016], {
          color: coat,
          bone: root,
          sides: 6,
        });
        b.sweep([T(s * 0.065, by - 0.03, -0.12), T(s * 0.082, G + 0.03, -0.2), T(s * 0.076, G + 0.026, -0.03)], [0.034, 0.016], {
          color: coat,
          bone: root,
          sides: 6,
        });
        sph(0.021, CAMEL_D, T(s * 0.07, G + 0.027, 0.285), { ...rot, scale: [1, 0.8, 1.2] }, 5, 4);
      }
    }
    // saddle blanket, bags, bedroll, tassels
    box(0.15, 0.012, 0.17, "#ffffff", T(0, by + 0.078, -0.04), { ...rot, texture: blanket });
    for (const s of [1, -1]) {
      box(0.008, 0.11, 0.17, "#ffffff", T(s * 0.07, by + 0.025, -0.04), { ...rot, texture: blanket });
      box(0.03, 0.07, 0.09, LEATHER, T(s * 0.095, by + 0.0, -0.04), rot);
      box(0.032, 0.012, 0.092, WOOD_D, T(s * 0.095, by + 0.03, -0.04), rot);
      box(0.006, 0.01, 0.01, GOLD, T(s * 0.113, by + 0.02, -0.04), rot);
      for (let k = 0; k < 5; k++)
        spk(T(s * 0.074, by - 0.03, -0.11 + k * 0.035), [0, -1, 0], 0.04, 0.007, k % 2 ? accA : accB);
    }
    cyl(0.025, 0.025, 0.15, 8, "#d8c8a8", T(0, by + 0.2, -0.04), { rotation: [0, yaw, 90] });
    for (const sx2 of [-1, 1]) cyl(0.027, 0.027, 0.012, 8, accA, T(sx2 * 0.045, by + 0.2, -0.04), { rotation: [0, yaw, 90] });
    // saddle strap round the girth
    box(0.136, 0.012, 0.014, accA, T(0, by + 0.0, 0.065), { rotation: [0, yaw, 0], flat: false });
  };
  camel(0.82, 0.42, -70, false, RED, BLUE);
  camel(-0.3, 0.62, 70, true, BLUE, RED);

  // ---------------------------------------------------------------- campfire
  const fx = 0.38;
  const fz = 0.78;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.DodecahedronGeometry(0.022, 0), i % 2 ? COAL : ROCK_D, [fx + Math.cos(a) * 0.065, G + 0.014, fz + Math.sin(a) * 0.065], {
      scale: [1, 0.8, 1],
      rotation: [0, i * 40, 0],
    });
  }
  rod([fx - 0.04, G + 0.016, fz - 0.02], [fx + 0.04, G + 0.02, fz + 0.02], 0.01, WOOD_D);
  rod([fx - 0.03, G + 0.022, fz + 0.03], [fx + 0.03, G + 0.026, fz - 0.03], 0.01, WOOD);
  glow(P(new THREE.ConeGeometry(0.034, 0.09, 5), FIRE2, [fx, G + 0.07, fz], { name: "flameOuter" }), 1.3);
  glow(P(new THREE.ConeGeometry(0.02, 0.07, 5), FIRE, [fx, G + 0.065, fz], { name: "flameInner" }), 1.6);
  const apex = [fx, G + 0.3, fz];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    rod([fx + Math.cos(a) * 0.14, G, fz + Math.sin(a) * 0.14], apex, 0.007, WOOD_D);
  }
  sph(0.011, DARK, apex, {}, 5, 4);
  rod(apex, [fx, G + 0.2, fz], 0.002, DARK, { sides: 3 });
  sph(0.045, COAL, [fx, G + 0.17, fz], { scale: [1, 0.85, 1] }, 8, 5);
  P(new THREE.TorusGeometry(0.036, 0.005, 3, 8), DARK, [fx, G + 0.195, fz], { rotation: [90, 0, 0] });
  stool(0.58, 0.88, 30);
  basket(0.72, 0.8);

  // ---------------------------------------------------------------- hanging bead above stool uses glow lantern
  rod([0.58, G, 0.88], [0.58, G + 0.001, 0.88], 0.001, WOOD_D, { sides: 3 });

  return b.root;
}
