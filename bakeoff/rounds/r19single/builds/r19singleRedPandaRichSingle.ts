// A red panda balancing on a mossy stone, in a Genshin Impact look: cel-shaded paints and zig-zag fur edges from
// kits/toon, big anime eyes, gold filigree (circlet, collar, cuffs, tassels) and dendro-green glow motifs (gems,
// glyph, luminous mushrooms, floating motes) from kits/glow.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { cells, gradient, mottle, noise, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Mossy Stone Red Panda",
  description:
    "A red panda balancing on a mossy boulder, tail arched high for balance: cel-shaded coat with zig-zag fur edges, big anime eyes, a gold filigree circlet, collar, cuffs and tassels, and dendro-green glowing gems, glyphs and mushrooms.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RUSSET = "#f0702c";
const RUSSET_LIGHT = "#fd9540";
const RUSSET_DEEP = "#b8431e";
const RING_A = "#f2762f";
const RING_B = "#b6401d";
const TAIL_TIP = "#5e2420";
const BELLY = "#5a2a2c";
const LEG_TOP = "#6a2f28";
const LEG_LOW = "#25141b";
const CREAM = "#fff3dc";
const CREAM_SH = "#f0c8a2";
const TEAL = "#2fc6b4";
const GOLD_L = "#ffd95c";
const GOLD_S = "#c68a2a";
const MOSS = "#6fbf4a";
const MOSS_L = "#a8e062";
const MOSS_D = "#3f8a44";
const STONE = "#98a2b6";
const STONE_L = "#c2cad8";
const CRACK = "#454d66";
const NOSE = "#2c1727";
const TEAR = "#6a2a22";
const IVORY = "#f4e9d0";
const GEM = "#53f0c8";
const STEM = "#4aa24a";

const GOLD = cel(GOLD_L, GOLD_S);
const TEALC = cel(TEAL);
const CREAMC = cel(CREAM, CREAM_SH);
const EARP = cel("#6a2a22");
const LEGP = cel(gradient(LEG_TOP, LEG_LOW, [0, 0.4, 0], [0, 0.24, 0]));
const BODYP = cel(
  furEdge(
    furEdge(RUSSET_LIGHT, RUSSET, { level: 0.55, teeth: 0.25, period: 0.032 }),
    BELLY,
    { level: -0.2, teeth: 0.3, period: 0.036 },
  ),
);
const TAILP = cel(
  paint((_p, _n, s) => {
    if (s[0] > 0.9) return TAIL_TIP;
    const k = Math.floor(s[0] * 11 + 0.5 * zigzag(s[1] / 72));
    return k % 2 === 0 ? RING_A : RING_B;
  }),
);
const STONEP = cel(
  paint((p, n) => {
    const top = n.y + (noise(p, 0.1, 5) - 0.5) * 1.1;
    if (top > 0.3) return noise(p, 0.035, 9) > 0.58 ? MOSS_L : MOSS;
    if (top > 0.12) return MOSS_D;
    const c = cells(p, 0.17, 3);
    if (c.d2 - c.d1 < 0.05) return CRACK;
    return noise(p, 0.06, 2) > 0.58 ? STONE_L : STONE;
  }),
);
const MOSSP = cel(mottle(MOSS_L, MOSS, { size: 0.05, seed: 7 }));
const TURFP = cel(mottle(MOSS, MOSS_D, { size: 0.12, seed: 4 }));
const BANDP = cel(
  paint((p) => {
    const a = Math.atan2(p.x, p.y - 0.43);
    const f = ((a / (Math.PI * 2)) * 30) % 1;
    return Math.abs(f) < 0.22 ? GOLD_L : TEAL;
  }),
);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const tuft = (base: string, tip: string, shade: string) =>
  svg(
    `<svg viewBox="0 0 32 64"><path d="M2 64 Q4 30 16 1 Q28 30 30 64 Z" fill="${base}"/><path d="M16 1 Q9 22 8 44 Q15 34 16 1 Z" fill="${shade}"/><path d="M16 1 Q11 14 10 26 L22 26 Q21 14 16 1 Z" fill="${tip}"/></svg>`,
    { size: 96 },
  );
const blades = (c1: string, c2: string, c3: string) =>
  svg(
    `<svg viewBox="0 0 48 64"><path d="M4 64 Q6 30 2 6 Q14 28 16 64Z" fill="${c1}"/><path d="M14 64 Q16 20 22 0 Q30 26 28 64Z" fill="${c2}"/><path d="M26 64 Q32 30 40 10 Q42 38 38 64Z" fill="${c1}"/><path d="M34 64 Q40 40 46 26 Q46 48 44 64Z" fill="${c3}"/></svg>`,
    { size: 128 },
  );
const TUFT_A = tuft(RUSSET, "#ffb15a", RUSSET_DEEP);
const TUFT_B = tuft(RUSSET_LIGHT, "#ffd08a", RUSSET);
const TUFT_BELLY = tuft(BELLY, "#7d3d36", "#3d1d2a");
const TUFT_RING = tuft(RING_B, "#e0702a", "#8a2d14");
const TUFT_CREAM = tuft(CREAM, "#ffffff", CREAM_SH);
const TUFT_LEG = tuft(LEG_LOW, "#5a2c2a", "#180c12");
const MOSS_TEX = blades(MOSS, MOSS_L, MOSS_D);
const MOSS_TEX2 = blades(MOSS_D, MOSS, MOSS_L);
const GRASS_TEX = blades("#58b84a", "#9fe35c", "#3a8f4a");
const RUNE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#9dffb8" stroke-width="3"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#9dffb8" stroke-width="2.4" stroke-dasharray="10 6"/>
    <path d="M50 20 Q72 38 50 80 Q28 38 50 20Z" fill="none" stroke="#9dffb8" stroke-width="3"/>
    <path d="M50 30 L50 74 M50 54 L63 43 M50 62 L37 51" fill="none" stroke="#9dffb8" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="4" fill="#d6ffe2"/>
    <circle cx="50" cy="8" r="3" fill="#d6ffe2"/><circle cx="50" cy="92" r="3" fill="#d6ffe2"/>
    <circle cx="8" cy="50" r="3" fill="#d6ffe2"/><circle cx="92" cy="50" r="3" fill="#d6ffe2"/>
  </svg>`,
  { size: 256 },
);

const LEAF: OutlinePoint[] = [
  [0, 0],
  [0.018, 0.014],
  [0.024, 0.04],
  [0, 0.07, "sharp"],
  [-0.024, 0.04],
  [-0.018, 0.014],
];
const EAR_OUT: OutlinePoint[] = [
  [-0.04, 0],
  [0.04, 0],
  [0.037, 0.04],
  [0, 0.082],
  [-0.037, 0.04],
];
const EAR_IN: OutlinePoint[] = [
  [-0.026, 0.004],
  [0.026, 0.004],
  [0.023, 0.036],
  [0, 0.066],
  [-0.023, 0.036],
];
const EAR_BAND: OutlinePoint[] = [
  [-0.039, 0.028],
  [0.039, 0.028],
  [0.039, 0.04],
  [-0.039, 0.04],
];

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const rand = rng(11);
  const root = b.joint("root", { at: [0, 0.12, 0] });
  type Leg = ReturnType<typeof b.chain>;

  // -------------------------------------------------------------------------------------------------------------
  // The mossy stone and its dressing
  const SC = { cy: 0.125, rx: 0.34, ry: 0.13, rz: 0.36 };
  const stoneY = (x: number, z: number) => {
    const q = 1 - (x / SC.rx) ** 2 - (z / SC.rz) ** 2;
    const u = Math.sqrt(Math.max(q, 0));
    return SC.cy + SC.ry * (u > 0.82 ? 0.82 + (u - 0.82) * 0.3 : u);
  };
  const rockGeo = new THREE.IcosahedronGeometry(1, 2);
  const rp = rockGeo.getAttribute("position");
  for (let i = 0; i < rp.count; i++) {
    let x = rp.getX(i);
    let y = rp.getY(i);
    let z = rp.getZ(i);
    const g = 1 + 0.05 * (Math.sin(4.1 * x + 1.3 * y) * Math.cos(3.7 * z + 0.5) + 0.5 * Math.sin(7 * y + 2 * x));
    x *= g;
    y *= g;
    z *= g;
    if (y > 0.82) y = 0.82 + (y - 0.82) * 0.3;
    if (y < -0.9) y = -1;
    rp.setXYZ(i, x, y, z);
  }
  rockGeo.computeVertexNormals();

  b.part(new THREE.IcosahedronGeometry(1, 2), TURFP, {
    at: [0, 0.008, 0],
    scale: [0.6, 0.02, 0.6],
    bone: root,
    flat: true,
    name: "turf",
  });
  const rock = b.part(rockGeo, STONEP, {
    at: [0, SC.cy, 0],
    scale: [SC.rx, SC.ry, SC.rz],
    bone: root,
    flat: true,
    name: "stone",
  });
  const rockSkin = b.surface(rock);

  // moss cushions on the rim
  for (const [a, f, sx, sz] of [
    [0.3, 0.82, 0.07, 0.06],
    [1.5, 0.8, 0.06, 0.05],
    [2.4, 0.84, 0.08, 0.065],
    [3.6, 0.8, 0.065, 0.055],
    [4.4, 0.82, 0.075, 0.06],
    [5.5, 0.8, 0.06, 0.05],
  ]) {
    const x = SC.rx * f * Math.cos(a);
    const z = SC.rz * f * Math.sin(a);
    b.part(new THREE.IcosahedronGeometry(1, 1), MOSSP, {
      at: [x, stoneY(x, z) + 0.004, z],
      scale: [sx, 0.032, sz],
      rotation: [0, a * 57, 0],
      bone: root,
      flat: true,
    });
  }

  // moss tufts and grass
  const mossHits = rockSkin.scatter(110, { rng: rand, minDist: 0.045, filter: (h) => h.n.y > 0.4 });
  b.cards(mossHits, [MOSS_TEX, MOSS_TEX2], {
    size: [0.05, 0.055],
    cross: true,
    vary: 0.35,
    spin: 180,
    rng: rand,
    bone: root,
    sink: 0.15,
  });
  const grassFrames = Array.from({ length: 46 }, () => {
    const a = rand() * Math.PI * 2;
    const r = 0.4 + rand() * 0.16;
    return frame([Math.cos(a) * r, 0.018, Math.sin(a) * r], [0, 1, 0]);
  });
  b.cards(grassFrames, GRASS_TEX, { size: [0.05, 0.09], cross: true, vary: 0.3, spin: 180, rng: rand, bone: root });

  // pebbles
  for (const [x, z, r, a] of [
    [0.4, 0.14, 0.05, 20],
    [-0.42, 0.08, 0.04, 70],
    [0.3, -0.38, 0.045, 110],
    [-0.28, -0.42, 0.055, 150],
    [0.1, 0.46, 0.035, 40],
    [-0.2, 0.44, 0.04, 95],
  ]) {
    b.part(new THREE.IcosahedronGeometry(1, 1), STONEP, {
      at: [x, 0.005 + r * 0.6, z],
      scale: [r, r * 0.6, r * 0.9],
      rotation: [0, a, 0],
      bone: root,
      flat: true,
    });
  }

  // luminous mushrooms
  const mushroom = (x: number, z: number, h: number, r: number) => {
    const y = stoneY(x, z) - 0.004;
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.5, h, 7), CREAMC, { at: [x, y + h / 2, z], bone: root });
    glow(
      b.part(new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#3ad4bd", {
        at: [x, y + h, z],
        scale: [r, r * 0.62, r],
        bone: root,
      }),
      1,
    );
    b.part(new THREE.CircleGeometry(r, 9), CREAMC, { at: [x, y + h - 0.001, z], rotation: [90, 0, 0], bone: root });
    for (let k = 0; k < 5; k++) {
      const a = k * 1.26 + 0.4;
      const th = k % 2 === 0 ? 0.85 : 0.5;
      glow(
        b.part(new THREE.SphereGeometry(r * 0.13, 5, 4), "#e6fff4", {
          at: [x + r * Math.sin(th) * Math.cos(a) * 0.98, y + h + r * 0.62 * Math.cos(th) * 0.98, z + r * Math.sin(th) * Math.sin(a) * 0.98],
          bone: root,
        }),
        1.2,
      );
    }
  };
  mushroom(0.25, 0.13, 0.05, 0.035);
  mushroom(0.3, 0.06, 0.035, 0.026);
  mushroom(-0.25, 0.16, 0.04, 0.03);

  // little flowers
  const flower = (x: number, z: number, h: number, petal: string) => {
    const y0 = stoneY(x, z) - 0.004;
    const top: [number, number, number] = [x + 0.008, y0 + h, z];
    b.rod([x, y0, z], top, 0.0022, STEM, { bone: root, sides: 5 });
    b.part(new THREE.SphereGeometry(1, 5, 3), STEM, {
      at: [x + 0.008, y0 + h * 0.45, z + 0.008],
      scale: [0.012, 0.0035, 0.006],
      rotation: [0, 40, 20],
      bone: root,
    });
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      b.part(new THREE.SphereGeometry(1, 6, 4), petal, {
        at: [top[0] + Math.cos(a) * 0.011, top[1], top[2] + Math.sin(a) * 0.011],
        scale: [0.012, 0.0045, 0.0065],
        rotation: [0, (-a * 180) / Math.PI, 0],
        bone: root,
      });
    }
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), GOLD, { at: [top[0], top[1] + 0.002, top[2]], bone: root });
  };
  flower(-0.21, -0.2, 0.06, "#ff9cc0");
  flower(-0.27, -0.1, 0.05, "#fff1b8");
  flower(0.22, -0.22, 0.055, "#b7a6ff");
  flower(0.28, -0.1, 0.045, "#ff9cc0");

  // glowing glyphs carved in the stone
  const g1 = rockSkin.around([0, 0.12, 0]).at(0, 4);
  if (g1) glow(b.decal(rockSkin, RUNE, { at: g1, size: [0.15, 0.15], name: "glyphFront" }));
  const g2 = rockSkin.around([0, 0.12, 0]).at(62, 6);
  if (g2) glow(b.decal(rockSkin, RUNE, { at: g2, size: [0.1, 0.1], name: "glyphSide" }), 0.9);

  // floating motes and leaves
  for (const [x, y, z, r] of [
    [-0.35, 0.55, 0.15, 0.011],
    [0.38, 0.5, 0.2, 0.009],
    [0.3, 0.78, -0.25, 0.012],
    [-0.3, 0.75, 0.0, 0.008],
    [0.05, 0.92, 0.2, 0.009],
    [0.42, 0.35, -0.1, 0.007],
    [-0.4, 0.35, 0.25, 0.008],
  ])
    glow(b.part(new THREE.SphereGeometry(r, 6, 4), "#b6ffcf", { at: [x, y, z], bone: root }), 1.3);
  const leafDirs: Array<[number[], number[], number[]]> = [
    [[0.32, 0.62, 0.18], [1, 0, 0], [0, 0.8, 0.6]],
    [[-0.34, 0.46, -0.1], [0, 0, 1], [0.6, 0.8, 0]],
    [[-0.1, 0.84, 0.28], [1, 0, 0], [0, 0.6, -0.8]],
    [[0.36, 0.4, 0.3], [0, 0, 1], [-0.7, 0.7, 0]],
  ];
  for (const [at, x, y] of leafDirs)
    glow(b.extrude(LEAF, { at, x, y, thickness: 0.003, smoothing: 1, color: "#9cf06c", bone: root }), 0.8);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: spine, head, jaw, ears, legs, tail
  const ground = (x: number, z: number) => stoneY(x, z) - 0.012;
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.405, -0.19],
      [0, 0.42, -0.07],
      [0, 0.43, 0.06],
      [0, 0.44, 0.17],
      [0, 0.465, 0.245],
    ]),
    { parent: root, names: ["hips", "spine", "chest", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[3], at: [0, 0.468, 0.245], aim: [0, 0.485, 0.34], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const HC = hp(0.07, 0.02);
  const jaw = b.joint("jaw", { parent: head, at: hp(0.1, -0.045), aim: hp(0.19, -0.046), role: "jaw" });

  const body = b.sweep(spine, [0.088, 0.086, 0.09, 0.09, 0.07], {
    color: BODYP,
    shift: [0, -0.01],
    name: "body",
  });

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.415, -0.23],
      [0, 0.44, -0.36],
      [0.01, 0.52, -0.5],
      [0.04, 0.66, -0.57],
      [0.06, 0.78, -0.55],
      [0.05, 0.86, -0.47],
    ]),
    { parent: spine.joints[0], count: 6, role: "tail" },
  );
  const tailSweep = b.sweep(tail, [0.05, 0.06, 0.068, 0.07, 0.06, 0.034], { color: TAILP, name: "tail" });

  // legs
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  const cuffs: Array<{ leg: Leg; sw: ReturnType<typeof b.sweep> }> = [];
  const paw = (leg: Leg, cx: number, z0: number, gy: number, wid: number, len: number) => {
    const cz = z0 + len * 0.55;
    b.part(new THREE.SphereGeometry(1, 9, 6), LEGP, {
      bone: leg,
      at: [cx, gy + 0.02, cz],
      scale: [wid, 0.021, len],
      name: "paw",
    });
    const tz = cz + len * 0.88;
    for (let i = 0; i < 4; i++) {
      const tx = cx + (i - 1.5) * wid * 0.42;
      b.part(new THREE.SphereGeometry(0.0105, 6, 4), LEGP, {
        bone: leg,
        at: [tx, gy + 0.011, tz],
        scale: [1, 0.85, 1.25],
      });
      b.spike([tx, gy + 0.009, tz + 0.009], [0, -0.3, 1], 0.017, 0.0042, IVORY, { bone: leg, sides: 5 });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front leg: elbow bends back
    const fx = s * 0.1;
    const gf = ground(fx, 0.2);
    const front = b.chain(
      `legF${side}`,
      limb([s * 0.07, 0.388, 0.15], [fx, gf + 0.045, 0.19], [0.09, 0.09], [0, 0, -1]),
      { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "leg" },
    );
    const fs = b.sweep(front, [0.052, 0.04, 0.032], { color: LEGP, name: `legF${side}` });
    paw(front, fx, 0.19, gf, 0.03, 0.042);
    legSweeps.push(fs);
    cuffs.push({ leg: front, sw: fs });
    // hind leg: knee forward, plantigrade foot
    const hx = s * 0.1;
    const gh = ground(hx, -0.2);
    const hind = b.chain(
      `legH${side}`,
      limb([s * 0.075, 0.39, -0.17], [hx, gh + 0.045, -0.2], [0.1, 0.1], [0, 0, 1]),
      { parent: spine.joints[0], names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    const hs = b.sweep(hind, [0.062, 0.042, 0.032], { color: LEGP, name: `legH${side}` });
    paw(hind, hx, -0.2, gh, 0.032, 0.062);
    legSweeps.push(hs);
    cuffs.push({ leg: hind, sw: hs });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const headPaint = cel(
    paint((p) => {
      const dx = Math.abs(p.x - HC.x);
      const dy = p.y - HC.y;
      const dz = p.z - HC.z;
      const zz = zigzag((dx + dz) / 0.02);
      const c = 0.05 + 0.4 * dy;
      if (dz > 0.03 && dy < 0 && dy > -0.06 && Math.abs(dx - c) < 0.0065) return TEAR;
      if (dz > 0.02 && ((dx - 0.05) / 0.013) ** 2 + ((dy - 0.047) / 0.009) ** 2 < 1) return CREAM;
      if (dz > -0.01 && dy < -0.012 + 0.012 * zz) return CREAM;
      if (dz > 0.06 && dx < 0.024 && dy < 0.04) return CREAM;
      if (dy > 0.035 && dx < 0.05) return RUSSET_LIGHT;
      return RUSSET;
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), headPaint, {
    bone: head,
    at: HC,
    scale: [0.1, 0.08, 0.09],
    name: "skull",
  });
  const skin = b.surface(skull);

  // muzzle, nose, lower jaw
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAMC, {
    bone: head,
    at: hp(0.165, -0.012),
    scale: [0.036, 0.03, 0.042],
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: hp(0.205, 0.004), scale: [0.016, 0.012, 0.012], name: "nose" });
  b.part(new THREE.SphereGeometry(0.003, 5, 4), "#ffffff", { bone: head, at: hp(0.209, 0.012, 0.006) });
  b.capsule(hp(0.105, -0.048), hp(0.185, -0.046), [0.027, 0.017], CREAMC, { bone: jaw, name: "lowerJaw" });
  b.rod(hp(0.207, 0.0), hp(0.2, -0.03), 0.0016, NOSE, { bone: head, sides: 4 });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([hp(0.199, -0.03), hp(0.195, -0.036, s * 0.012), hp(0.184, -0.037, s * 0.022), hp(0.168, -0.033, s * 0.03)]),
      0.0017,
      NOSE,
      { bone: head, sides: 4, caps: "round" },
    );
    for (const [f, u, l] of [
      [0.2022, -0.008, 0.016],
      [0.2009, -0.016, 0.018],
      [0.196, -0.012, 0.024],
    ])
      b.part(new THREE.SphereGeometry(0.0022, 4, 3), NOSE, { bone: head, at: hp(f, u, s * l) });
    for (let i = 0; i < 3; i++) {
      const a = hp(0.178, -0.012 - i * 0.004, s * 0.028);
      b.rod(a, offset(a, [s, 0.35 - 0.3 * i, 0.5 - 0.25 * i], 0.1), 0.0012, "#fff7e8", { bone: head, sides: 4 });
    }
  }

  // anime eyes
  const EYE = animeEye({ iris: "#ffae2b", brow: false });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 36, 8);
    if (hit)
      b.decal(skin, EYE, {
        at: hit,
        dir: [s * 0.3, 0, 1],
        size: [0.046, 0.06],
        mirror: s > 0,
        segments: 12,
        name: s > 0 ? "eyeL" : "eyeR",
      });
  }

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJ = b.joint(`ear${side}`, { parent: head, at: hp(0.062, 0.072, s * 0.06), dir: [s * 0.45, 1, 0.2] });
    const X = [1, -0.5 * s, 0];
    const Y = [0.5 * s, 1, 0.25];
    const ear = b.extrude(EAR_OUT, {
      at: hp(0.062, 0.072, s * 0.06),
      x: X,
      y: Y,
      thickness: 0.024,
      bevel: 0.005,
      smoothing: 2,
      color: EARP,
      bone: earJ,
      name: `ear${side}`,
    });
    b.extrude(EAR_IN, {
      at: hp(0.075, 0.074, s * 0.06),
      x: X,
      y: Y,
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 2,
      color: CREAMC,
      bone: earJ,
      name: `earInner${side}`,
    });
    if (s > 0) {
      b.extrude(EAR_BAND, { at: hp(0.062, 0.072, s * 0.06), x: X, y: Y, thickness: 0.04, bevel: 0.003, color: GOLD, bone: earJ, name: "earBand" });
      glow(
        b.part(new THREE.OctahedronGeometry(0.007), GEM, {
          at: ear.local([0, 0.034, 0.021]),
          scale: [1, 1.3, 0.7],
          bone: earJ,
        }),
        1.4,
      );
      const start = ear.local([0.036, 0.03, 0]);
      const end = offset(start, [0.2, -1, 0.15], 0.07);
      b.rod(start, end, 0.0014, GOLD, { bone: earJ, sides: 4 });
      b.part(new THREE.SphereGeometry(0.005, 6, 4), GOLD, { at: offset(start, [0.2, -1, 0.15], 0.035), bone: earJ });
      b.spike(end, [0.05, -1, 0], 0.04, 0.009, TEALC, { bone: earJ });
    }
  }

  // circlet with gem and pendants
  const circlet = skin.loop(HC.clone().add(new THREE.Vector3(0, 0.05, 0)), { lift: 0.003 });
  b.sweep(circlet, 0.0055, GOLD, { name: "circlet" });
  const front = skin.around(HC).at(0, 38);
  if (front) {
    b.stick(new THREE.CylinderGeometry(0.014, 0.016, 0.006, 8), GOLD, front, { embed: 0.3 });
    glow(b.stick(new THREE.OctahedronGeometry(0.011), GEM, front.moved([0, 0.005, 0]), { embed: 0.1 }), 1.4);
  }
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 68, 40);
    if (hit) {
      const end = offset(hit, [0, -1, 0], 0.05);
      b.rod(hit, end, 0.0013, GOLD, { bone: head, sides: 4 });
      glow(b.part(new THREE.SphereGeometry(0.008, 6, 5), GEM, { at: offset(end, [0, -1, 0], 0.006), scale: [0.85, 1.3, 0.85], bone: head }), 1.3);
    }
    // cheek fluff spikes
    for (const [az, el] of [
      [82, -5],
      [80, -30],
      [70, 12],
    ]) {
      const ch = skin.around(HC).at(s * az, el);
      if (ch) b.spike(ch, [s, -0.2, -0.45], 0.05, 0.017, CREAMC, { bone: head });
    }
  }

  // head fur cards
  const crown = skin.scatter(18, { rng: rand, minDist: 0.022, filter: (h) => h.n.y > 0.55 && h.at.z > HC.z - 0.03 });
  b.cards(crown, [TUFT_B, TUFT_A], { size: [0.02, 0.035], lean: 50, flow: [0, -0.2, -1], vary: 0.3, rng: rand, bone: head });
  const cheeks = skin.scatter(26, {
    rng: rand,
    minDist: 0.018,
    filter: (h) => Math.abs(h.at.x - HC.x) > 0.055 && h.at.y < HC.y + 0.02 && h.at.z > HC.z - 0.01,
  });
  b.cards(cheeks, TUFT_CREAM, {
    size: [0.03, 0.05],
    lean: 40,
    flow: (f) => [Math.sign(f.at.x - HC.x), -0.15, -0.6],
    vary: 0.3,
    rng: rand,
    bone: head,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Fur cards on body, tail and legs
  const bodySkin = b.surface(body);
  b.cards(bodySkin.scatter(130, { rng: rand, minDist: 0.035, filter: (h) => h.n.y > -0.1 }), [TUFT_A, TUFT_B], {
    size: [0.03, 0.055],
    lean: 65,
    vary: 0.3,
    spin: 25,
    rng: rand,
  });
  b.cards(bodySkin.scatter(50, { rng: rand, minDist: 0.04, filter: (h) => h.n.y < -0.2 }), TUFT_BELLY, {
    size: [0.03, 0.05],
    lean: 60,
    vary: 0.3,
    rng: rand,
  });
  const tailPath = tail.path;
  b.cards(b.surface(tailSweep).scatter(120, { rng: rand, minDist: 0.035 }), [TUFT_A, TUFT_B, TUFT_RING], {
    size: [0.034, 0.06],
    lean: 62,
    bend: 25,
    vary: 0.3,
    spin: 25,
    rng: rand,
    flow: (f) => tailPath.tangentAt(tailPath.closestT(f.at)),
  });
  for (const sw of legSweeps)
    b.cards(b.surface(sw).scatter(10, { rng: rand, minDist: 0.03, filter: (h) => h.n.y > -0.4 }), TUFT_LEG, {
      size: [0.022, 0.04],
      lean: 55,
      vary: 0.3,
      rng: rand,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Gold filigree and cloth: collar, charm, waist band, cuffs, tail ring
  const neckPt = spine.at(0.78);
  b.sweep(bodySkin.loop(neckPt, { lift: 0.012 }), 0.017, TEALC, { name: "collar" });
  for (const t of [0.75, 0.81]) b.sweep(bodySkin.loop(spine.at(t), { lift: 0.014 }), 0.0042, GOLD, { name: "collarTrim" });
  const charm = bodySkin.around(neckPt.at).at(0, -30);
  if (charm) {
    b.stick(new THREE.CylinderGeometry(0.022, 0.022, 0.007, 8), GOLD, charm, { embed: 0.3 });
    glow(b.stick(new THREE.OctahedronGeometry(0.013), GEM, charm.moved([0, 0.004, 0]), { embed: 0.1 }), 1.4);
    const end = offset(charm, [0, -1, 0], 0.05);
    b.rod(charm, end, 0.0018, GOLD, { bone: spine.joints[3], sides: 4 });
    b.spike(end, [0, -1, 0], 0.04, 0.01, TEALC, { bone: spine.joints[3] });
  }
  b.sweep(bodySkin.loop(spine.at(0.4), { lift: 0.008 }), 0.017, BANDP, { name: "waistBand" });
  const bandTip = bodySkin.around(spine.at(0.4).at).at(90, -20);
  if (bandTip) {
    const end = offset(bandTip, [0, -1, 0], 0.045);
    b.rod(bandTip, end, 0.0015, GOLD, { bone: spine.joints[1], sides: 4 });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: end, bone: spine.joints[1] });
    b.spike(end, [0, -1, 0], 0.05, 0.011, TEALC, { bone: spine.joints[1] });
  }
  for (const { leg, sw } of cuffs)
    b.sweep(b.surface(sw).loop(leg.at(0.8), { lift: 0.002 }), 0.0048, GOLD, { name: "cuff" });
  b.sweep(b.surface(tailSweep).loop(tail.at(0.2), { lift: 0.004 }), 0.0075, GOLD, { name: "tailRing" });

  return b.root;
}
