// Red panda balancing on a mossy stone, Genshin Impact style: cel-shaded coat with zig-zag fur edges, big anime eyes,
// ornate gold trim (collar, pendant, tassels, bangles, ear charms, forehead leaf crest) and Dendro-green glow motifs
// (gems, flowers, runes on the stone).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mottle, noise, paint, patches } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dendro Balance Red Panda",
  description:
    "A red panda standing poised on a moss-capped, rune-carved boulder, its fluffy ringed tail raised for balance. Cel-shaded anime coat, gold filigree collar with tassel, Dendro glow gems and flowers.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// Palette
const RUST = "#f2793a";
const RUST_LIGHT = "#ffa05a";
const RUST_DEEP = "#d9532b";
const CREAM = "#fff4dc";
const CREAM_SH = "#f3d2a6";
const PLUM = "#4b2d55";
const PLUM_DARK = "#33203f";
const TAIL_TIP = "#5a3560";
const GOLD = "#f4c24d";
const GOLD_SH = "#c98a2a";
const TEAL = "#2bd4c4";
const LEAF = "#a7f04e";
const LEAF_DEEP = "#4fae3c";
const MOSS_A = "#5fc04e";
const MOSS_B = "#3f9d4b";
const MOSS_L = "#a6e060";
const STONE = "#9c97b8";
const STONE_A = "#8a85a8";
const STONE_B = "#aaa5c6";
const STONE_LINE = "#6c6789";
const STONE_CRACK = "#4d4668";
const CLAW = "#f3e6cf";
const WHISKER = "#fffaf0";

// Moss cap outer profile (radius, height), used to plant paws and flowers on it.
const MOSS_TOP: Array<[number, number]> = [
  [0, 0.34],
  [0.14, 0.335],
  [0.26, 0.315],
  [0.35, 0.255],
];
const mossY = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  for (let i = 0; i < MOSS_TOP.length - 1; i++) {
    const [r0, y0] = MOSS_TOP[i];
    const [r1, y1] = MOSS_TOP[i + 1];
    if (r <= r1) return y0 + ((y1 - y0) * Math.max(0, r - r0)) / (r1 - r0);
  }
  return MOSS_TOP[MOSS_TOP.length - 1][1];
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Head ellipsoid
const HC = V(0, 0.615, 0.385);
const HS = [0.105, 0.088, 0.095];
const headPoint = (az: number, el: number, lift = 0) => {
  const a = az * DEG;
  const e = el * DEG;
  const dx = Math.cos(e) * Math.sin(a) * HS[0];
  const dy = Math.sin(e) * HS[1];
  const dz = Math.cos(e) * Math.cos(a) * HS[2];
  const n = V(dx / (HS[0] * HS[0]), dy / (HS[1] * HS[1]), dz / (HS[2] * HS[2])).normalize();
  return V(HC.x + dx + n.x * lift, HC.y + dy + n.y * lift, HC.z + dz + n.z * lift);
};

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const R = rng(11);
  const SIDES = [1, -1] as const;
  const sfxOf = (s: number) => (s > 0 ? "L" : "R");

  // ---------------------------------------------------------------- textures
  const tuft = (main: string, shade: string) =>
    svg(
      `<svg viewBox="0 0 32 64"><path d="M16 1 C25 20 31 44 27 63 L5 63 C1 44 7 20 16 1 Z" fill="${main}"/><path d="M16 1 C25 20 31 44 27 63 L17 63 Z" fill="${shade}"/></svg>`,
      { size: 128 },
    );
  const TUFT_RUST = tuft(RUST, RUST_DEEP);
  const TUFT_LIGHT = tuft(RUST_LIGHT, RUST);
  const TUFT_DEEP = tuft(RUST_DEEP, "#b03a22");
  const TUFT_CREAM = tuft(CREAM, CREAM_SH);
  const TUFT_PLUM = tuft(PLUM, PLUM_DARK);
  const TUFT_TIP = tuft(TAIL_TIP, PLUM_DARK);
  const GRASS = svg(
    `<svg viewBox="0 0 48 64">
      <path d="M6 63 C4 42 8 22 14 5 C21 24 22 46 20 63 Z" fill="${MOSS_A}"/>
      <path d="M14 5 C21 24 22 46 20 63 L13 63 Z" fill="${MOSS_B}"/>
      <path d="M17 63 C17 40 22 20 27 1 C34 22 34 46 31 63 Z" fill="${MOSS_L}"/>
      <path d="M27 1 C34 22 34 46 31 63 L25 63 Z" fill="${MOSS_A}"/>
      <path d="M28 63 C30 46 34 30 42 14 C45 32 43 48 39 63 Z" fill="${MOSS_A}"/>
      <path d="M42 14 C45 32 43 48 39 63 L34 63 Z" fill="${MOSS_B}"/>
    </svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 64">
      <rect x="8" y="0" width="8" height="9" rx="3" fill="${GOLD}"/>
      <rect x="8" y="5" width="8" height="4" fill="${GOLD_SH}"/>
      <path d="M12 9 L1 62 L23 62 Z" fill="${TEAL}"/>
      <path d="M12 9 L23 62 L13 62 Z" fill="#289eb2"/>
      <path d="M12 9 L7 62 M12 9 L12 62 M12 9 L17 62" stroke="#a6f4ea" stroke-width="1.5" fill="none"/>
      <rect x="2" y="54" width="20" height="3" fill="${GOLD}"/>
    </svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="none" stroke="${LEAF}" stroke-width="3.2"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke="${LEAF}" stroke-width="1.8" stroke-dasharray="3 5"/>
      <path d="M50 20 C69 34 69 62 50 80 C31 62 31 34 50 20 Z" fill="none" stroke="${LEAF}" stroke-width="3"/>
      <path d="M50 24 L50 78" stroke="${LEAF}" stroke-width="2.6" fill="none"/>
      <path d="M50 38 L39 30 M50 50 L37 41 M50 62 L40 54 M50 38 L61 30 M50 50 L63 41 M50 62 L60 54" stroke="${LEAF}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="50" cy="8" r="3.6" fill="${LEAF}"/><circle cx="50" cy="92" r="3.6" fill="${LEAF}"/>
      <circle cx="8" cy="50" r="3.6" fill="${LEAF}"/><circle cx="92" cy="50" r="3.6" fill="${LEAF}"/>
      <path d="M20 20 l6 6 M80 20 l-6 6 M20 80 l6 -6 M80 80 l-6 -6" stroke="${LEAF}" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const EYE = animeEye({ iris: TEAL });

  // ---------------------------------------------------------------- paints
  const RUST_MOTTLE = mottle(RUST, RUST_LIGHT, { size: 0.14, seed: 3, contrast: 0.7 });
  const MOSS_MOTTLE = mottle(MOSS_A, MOSS_B, { size: 0.07, seed: 2, contrast: 0.8 });
  const MOSS_TOP_MOTTLE = mottle(MOSS_L, MOSS_A, { size: 0.09, seed: 6, contrast: 0.9 });
  const ROCK = patches(STONE_LINE, [STONE, STONE_A, STONE_B], { size: 0.13, gap: 0.07, seed: 5 });

  const C_RUST = cel(RUST_MOTTLE);
  const C_CREAM = cel(CREAM, CREAM_SH);
  const C_PLUM = cel(PLUM, PLUM_DARK);
  const C_PAW = cel(PLUM_DARK, "#22112f");
  const C_GOLD = cel(GOLD, GOLD_SH);
  const C_MOSS = cel(MOSS_TOP_MOTTLE);

  const coat = cel(
    paint((p, n) => {
      if (n.y < -0.16 + 0.22 * zigzag(p.z / 0.035)) return PLUM;
      if (n.y > 0.5 && Math.abs(p.x) < 0.01 + 0.02 * zigzag(p.z / 0.06)) return RUST_DEEP;
      return RUST_MOTTLE;
    }),
  );
  const neckPaint = cel(paint((p, n) => (n.y < -0.2 + 0.2 * zigzag(p.x / 0.03) ? CREAM : RUST_MOTTLE)));
  const legPaint = cel(paint((p) => (p.y > 0.43 + 0.025 * zigzag((p.z + p.x * 0.5) / 0.04) ? RUST_MOTTLE : PLUM)));
  const tailPaint = cel(
    paint((_p, _n, s) => {
      if (s[0] > 0.93) return TAIL_TIP;
      const k = Math.floor(s[0] * 9 + 0.25 * (zigzag(s[1] / 50) - 0.5));
      return ((k % 2) + 2) % 2 === 0 ? RUST : RUST_DEEP;
    }),
  );
  const headPaint = cel(
    paint((p) => {
      const x = p.x;
      const y = p.y - HC.y;
      const z = p.z - HC.z;
      const ax = Math.abs(x);
      if (z > 0.02 && y < 0 && y > -0.045 && Math.abs(ax - (0.052 + -y * 0.5)) < 0.0055) return RUST_DEEP;
      if (z > 0.015 && y < -0.01 + 0.012 * zigzag(x / 0.022)) return CREAM;
      if (z > 0.02 && y > 0.045 && y < 0.066 && ax > 0.028 && ax < 0.075) return CREAM;
      if (y > 0.04 && ax < 0.012 + 0.01 * zigzag(z / 0.03)) return RUST_LIGHT;
      return RUST_MOTTLE;
    }),
  );
  const stonePaint = cel(
    paint((p, n) => {
      const wob = noise(p, 0.1, 7);
      if (n.y * 0.9 + (wob - 0.5) * 0.9 + (p.y - 0.12) * 1.8 > 0.6) return MOSS_MOTTLE;
      const c = cells(p, 0.2, 9);
      if (c.d2 - c.d1 < 0.05) return STONE_CRACK;
      return ROCK;
    }),
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.49, -0.23], aim: [0, 0.5, -0.14], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.14],
      [0, 0.515, -0.03],
      [0, 0.52, 0.08],
      [0, 0.51, 0.18],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.52, 0.16],
      [0, 0.56, 0.235],
      [0, 0.6, 0.3],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.6, 0.3], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.57, 0.4], aim: [0, 0.55, 0.48], role: "jaw" });

  const tailPts = [
    [0, 0.5, -0.2],
    [0, 0.5, -0.36],
    [0.04, 0.57, -0.5],
    [0.05, 0.7, -0.55],
    [0.02, 0.82, -0.48],
    [-0.04, 0.88, -0.38],
  ];
  const tail = b.chain("tail", catmull(tailPts), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  const FOOT = mossY(0.088, 0.21) - 0.003;
  const legs: Record<string, { chain: ReturnType<typeof b.chain>; pts: number[][]; front: boolean; s: number }> = {};
  for (const s of SIDES) {
    const sfx = sfxOf(s);
    const frontPts = [
      [s * 0.088, 0.465, 0.14],
      [s * 0.094, 0.405, 0.12],
      [s * 0.084, FOOT + 0.048, 0.18],
      [s * 0.084, FOOT + 0.016, 0.228],
    ];
    legs[`F${sfx}`] = {
      chain: b.chain(`legF${sfx}`, catmull(frontPts), {
        parent: spine.joints[2],
        names: [`shoulder${sfx}`, `elbow${sfx}`, `wrist${sfx}`, `paw${sfx}`],
        role: "leg",
        contact: [s * 0.084, FOOT, 0.21],
      }),
      pts: frontPts,
      front: true,
      s,
    };
    const hindPts = [
      [s * 0.09, 0.465, -0.2],
      [s * 0.096, 0.4, -0.145],
      [s * 0.086, FOOT + 0.045, -0.235],
      [s * 0.086, FOOT + 0.016, -0.172],
    ];
    legs[`H${sfx}`] = {
      chain: b.chain(`legH${sfx}`, catmull(hindPts), {
        parent: hips,
        names: [`hip${sfx}`, `knee${sfx}`, `ankle${sfx}`, `foot${sfx}`],
        role: "leg",
        contact: [s * 0.086, FOOT, -0.2],
      }),
      pts: hindPts,
      front: false,
      s,
    };
  }

  // ---------------------------------------------------------------- the mossy stone
  const STONE_PROFILE: OutlinePoint[] = [
    [0, -0.01],
    [0.28, -0.01],
    [0.35, 0.04],
    [0.38, 0.13],
    [0.35, 0.22],
    [0.3, 0.285],
    [0.22, 0.31],
    [0, 0.315],
  ];
  const stone = b.lathe(STONE_PROFILE, { at: [0, 0, 0], bone: hips, segments: 12, color: stonePaint, name: "stone" });
  const MOSS_PROFILE: OutlinePoint[] = [
    [0, 0.34],
    [0.14, 0.335],
    [0.26, 0.315],
    [0.35, 0.255],
    [0.37, 0.2],
    [0.33, 0.21],
    [0.28, 0.27],
    [0.2, 0.3],
    [0, 0.3],
  ];
  const mossCap = b.lathe(MOSS_PROFILE, { at: [0, 0, 0], bone: hips, segments: 12, color: C_MOSS, name: "mossCap" });

  // Boulders hugging the base, each with its own moss cushion.
  const boulders: Array<[number, number, number, number, number]> = [
    [45, 0.37, 0.1, 0.07, 0.09],
    [135, 0.36, 0.09, 0.065, 0.08],
    [180, 0.34, 0.11, 0.075, 0.09],
    [235, 0.37, 0.085, 0.06, 0.075],
    [315, 0.36, 0.1, 0.07, 0.085],
  ];
  boulders.forEach(([deg, rad, sx, sy, sz], i) => {
    const a = deg * DEG;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    b.part(new THREE.SphereGeometry(1, 7, 5), stonePaint, {
      bone: hips,
      at: [x, sy - 0.01, z],
      scale: [sx, sy, sz],
      rotation: [0, deg + i * 20, 0],
      flat: true,
      name: `boulder${i}`,
    });
    b.part(new THREE.SphereGeometry(1, 7, 4), C_MOSS, {
      bone: hips,
      at: [x, 2 * sy - 0.018, z],
      scale: [sx * 0.85, 0.028, sz * 0.85],
      rotation: [0, deg, 0],
      flat: true,
      name: `boulderMoss${i}`,
    });
  });

  // Dendro runes carved into the stone, glowing.
  glow(b.decal(stone, RUNE, { at: [0, 0.12, 0.4], dir: [0, 0, 1], size: [0.2, 0.2], segments: 14, lift: 0.004, name: "runeFront" }), 1.3);
  for (const s of SIDES)
    glow(
      b.decal(stone, RUNE, {
        at: [s * 0.4, 0.12, 0],
        dir: [s, 0, 0],
        size: [0.17, 0.17],
        segments: 14,
        lift: 0.004,
        mirror: s < 0,
        name: `rune${sfxOf(s)}`,
      }),
      1.3,
    );

  // Grass on the moss, and vines hanging over the rim.
  const mossSkin = b.surface(mossCap);
  const mossHits = mossSkin.scatter(240, { rng: R, minDist: 0.028, filter: (h) => h.n.y > 0.4 });
  b.cards(mossHits, GRASS, {
    size: [0.034, 0.05],
    lean: 14,
    vary: 0.4,
    spin: 180,
    rng: R,
    flow: (_f, i) => [Math.cos(i * 2.399), 0, Math.sin(i * 2.399)],
  });
  const vineAngles: number[] = [];
  const vineFrames = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + R() * 0.15;
    vineAngles.push(a);
    return frame([Math.sin(a) * 0.345, 0.252 + R() * 0.01, Math.cos(a) * 0.345], [0, 1, 0]);
  });
  b.cards(vineFrames, GRASS, {
    size: [0.035, 0.085],
    lean: 180,
    vary: 0.4,
    rng: R,
    bone: hips,
    flow: (_f, i) => [Math.sin(vineAngles[i]), 0, Math.cos(vineAngles[i])],
  });

  // Glowing Dendro flowers.
  const flower = (x: number, z: number, k: number) => {
    const y = mossY(x, z);
    const h = 0.05 * k;
    b.rod([x, y - 0.004, z], [x, y + h, z], 0.0026, LEAF_DEEP, { bone: hips, sides: 4 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const rad = V(Math.cos(a), 0, Math.sin(a));
      const pos = V(x + rad.x * 0.014 * k, y + h + 0.003 * k, z + rad.z * 0.014 * k);
      glow(
        b.part(new THREE.SphereGeometry(1, 6, 4), LEAF, {
          bone: hips,
          at: pos,
          dir: rad.clone().add(V(0, 0.45, 0)),
          axis: "z",
          scale: [0.0085 * k, 0.0035 * k, 0.017 * k],
        }),
        1.2,
      );
    }
    glow(b.part(new THREE.SphereGeometry(1, 6, 4), "#fff3a0", { bone: hips, at: [x, y + h + 0.004 * k, z], scale: 0.0075 * k }), 1.3);
  };
  flower(0.23, 0.02, 1.1);
  flower(-0.2, 0.12, 0.9);
  flower(0.16, -0.28, 1);
  flower(-0.17, -0.12, 0.85);

  // ---------------------------------------------------------------- body
  b.loft(
    [
      { at: [0, 0.485, -0.29], w: 0.13, h: 0.12 },
      { at: [0, 0.49, -0.22], w: 0.2, h: 0.18 },
      { at: [0, 0.5, -0.12], w: 0.22, h: 0.19 },
      { at: [0, 0.515, 0.0], w: 0.21, h: 0.185 },
      { at: [0, 0.52, 0.1], w: 0.21, h: 0.18 },
      { at: [0, 0.515, 0.19], w: 0.19, h: 0.17 },
      { at: [0, 0.52, 0.24], w: 0.12, h: 0.13 },
    ],
    { bone: [hips, spine], color: coat, name: "body" },
  );
  const bodySkin = b.surface(b.root.getObjectByName("body") ?? b.root);
  void bodySkin;
  const neckSweep = b.sweep(neck, [0.082, 0.078, 0.074], { color: neckPaint, name: "neck" });

  // Body fluff cards: rust on the back, plum under the belly.
  const bodySurf = b.surface(neckSweep.meshes.length ? b.root : b.root);
  void bodySurf;

  // ---------------------------------------------------------------- legs and paws
  for (const key of Object.keys(legs)) {
    const { chain, pts, front, s } = legs[key];
    const sfx = sfxOf(s);
    b.sweep(chain, front ? [0.05, 0.04, 0.031, 0.029] : [0.055, 0.04, 0.03, 0.03], { color: legPaint, name: `leg${key}` });
    const tip = chain.joints[chain.joints.length - 1];
    const top = chain.joints[0];
    const toe = pts[3];
    const wrist = pts[2];
    // Muscular shoulder / haunch.
    if (front) {
      b.part(new THREE.SphereGeometry(1, 10, 8), C_RUST, {
        bone: top,
        at: [s * 0.09, 0.455, 0.14],
        scale: [0.058, 0.07, 0.07],
        name: `shoulder${sfx}`,
      });
    } else {
      b.part(new THREE.SphereGeometry(1, 10, 8), C_RUST, {
        bone: top,
        at: [s * 0.092, 0.45, -0.2],
        scale: [0.062, 0.076, 0.078],
        name: `haunch${sfx}`,
      });
    }
    // Paw mitt.
    const pawZ = front ? (wrist[2] + toe[2]) / 2 + 0.012 : (wrist[2] + toe[2]) / 2 - 0.012;
    const pawRz = front ? 0.05 : 0.06;
    const pawY = FOOT + 0.017;
    b.part(new THREE.SphereGeometry(1, 10, 7), C_PAW, {
      bone: tip,
      at: [toe[0], pawY, pawZ],
      scale: [front ? 0.034 : 0.036, 0.021, pawRz],
      name: `pawMitt${key}`,
    });
    // Toes and claws.
    const frontZ = pawZ + pawRz - 0.006;
    for (let i = -1; i <= 1; i++) {
      const tx = toe[0] + i * 0.016;
      b.part(new THREE.SphereGeometry(1, 6, 5), C_PAW, {
        bone: tip,
        at: [tx, pawY - 0.001, frontZ],
        scale: [0.0115, 0.0115, 0.012],
      });
      b.spike([tx, pawY - 0.004, frontZ + 0.008], [0, -0.15, 1], 0.022, 0.0042, CLAW, { bone: tip, sides: 5 });
    }
    if (front) {
      // Gold bangle on each foreleg.
      const w = V(wrist[0], wrist[1], wrist[2]);
      const e = V(pts[1][0], pts[1][1], pts[1][2]);
      const axis = e.clone().sub(w);
      const pos = w.clone().addScaledVector(axis, 0.28);
      b.part(new THREE.TorusGeometry(0.036, 0.0075, 5, 14), C_GOLD, {
        bone: chain.joints[2],
        at: pos,
        dir: axis,
        axis: "z",
        name: `bangle${sfx}`,
      });
      b.part(new THREE.OctahedronGeometry(1), LEAF, {
        bone: chain.joints[2],
        at: [pos.x + s * 0.031, pos.y, pos.z + 0.018],
        scale: [0.007, 0.011, 0.007],
        name: `bangleGem${sfx}`,
      });
    }
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    bone: head,
    at: HC,
    scale: HS,
    name: "skull",
  });
  // Cheek ruffs.
  for (const s of SIDES) {
    const cheek = b.part(new THREE.SphereGeometry(1, 10, 8), C_CREAM, {
      bone: head,
      at: [s * 0.078, 0.585, 0.385],
      scale: [0.05, 0.045, 0.05],
      name: `cheek${sfxOf(s)}`,
    });
    const hits = b.surface(cheek).scatter(16, { rng: R, minDist: 0.016, filter: (h) => Math.abs(h.n.x) > 0.3 || h.n.y < -0.2 });
    b.cards(hits, TUFT_CREAM, {
      size: [0.026, 0.05],
      lean: 62,
      flow: [s * 0.8, -0.1, -0.6],
      vary: 0.25,
      rng: R,
      bone: head,
    });
  }
  // Crown tufts between the ears.
  b.cards(b.surface(skull).scatter(16, { rng: R, minDist: 0.022, filter: (h) => h.n.y > 0.65 }), TUFT_LIGHT, {
    size: [0.024, 0.042],
    lean: 40,
    vary: 0.25,
    rng: R,
    bone: head,
  });

  // Muzzle, nose, mouth, chin.
  b.part(new THREE.SphereGeometry(1, 10, 8), C_CREAM, { bone: head, at: [0, 0.578, 0.455], scale: [0.042, 0.032, 0.046], name: "muzzle" });
  b.part(new THREE.SphereGeometry(1, 10, 7), C_CREAM, { bone: jaw, at: [0, 0.552, 0.447], scale: [0.034, 0.018, 0.04], name: "chin" });
  b.part(new THREE.SphereGeometry(1, 8, 6), C_PAW, { bone: head, at: [0, 0.587, 0.499], scale: [0.016, 0.012, 0.013], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#ffffff", { bone: head, at: [0.004, 0.593, 0.504], scale: 0.0045, name: "noseGlint" });
  b.rod([0, 0.577, 0.4995], [0, 0.564, 0.497], 0.0028, INK, { bone: head, sides: 4 });
  for (const s of SIDES) {
    b.rod([0, 0.564, 0.497], [s * 0.012, 0.556, 0.492], 0.0028, INK, { bone: head, sides: 4 });
    b.rod([s * 0.012, 0.556, 0.492], [s * 0.026, 0.554, 0.476], 0.0028, INK, { bone: head, sides: 4 });
    // Whiskers.
    [0.02, 0, -0.02].forEach((dy, i) => {
      b.rod([s * 0.04, 0.574 + i * 0.002, 0.47], [s * 0.125, 0.574 + dy + 0.005, 0.485 + i * 0.006], 0.0016, WHISKER, {
        bone: head,
        sides: 3,
      });
    });
  }

  // Anime eyes.
  const skin = b.surface(skull);
  for (const s of SIDES) {
    const hit = skin.around(HC).at(s * 40, 10);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0, name: `eye${sfxOf(s)}` });
  }

  // Ears with cream insides, fluffy rims and gold charms.
  for (const s of SIDES) {
    const sfx = sfxOf(s);
    const base = V(s * 0.074, 0.69, 0.345);
    const fz = V(s * 0.5, 0.42, 0.7).normalize();
    const fx = V(0, 1, 0).cross(fz).normalize();
    const fy = fz.clone().cross(fx);
    b.part(new THREE.SphereGeometry(1, 10, 7), C_RUST, {
      bone: head,
      at: base,
      dir: fz,
      axis: "z",
      scale: [0.047, 0.054, 0.022],
      name: `ear${sfx}`,
    });
    b.part(new THREE.SphereGeometry(1, 10, 7), C_CREAM, {
      bone: head,
      at: base.clone().addScaledVector(fz, 0.014),
      dir: fz,
      axis: "z",
      scale: [0.032, 0.039, 0.012],
      name: `earInner${sfx}`,
    });
    const rim = [20, 45, 70, 95, 120, 145, 165].map((deg) => {
      const a = deg * DEG;
      const pos = base
        .clone()
        .addScaledVector(fx, Math.cos(a) * 0.042)
        .addScaledVector(fy, Math.sin(a) * 0.05)
        .addScaledVector(fz, 0.012);
      const out = fx
        .clone()
        .multiplyScalar(Math.cos(a))
        .addScaledVector(fy, Math.sin(a))
        .addScaledVector(fz, 0.5);
      return frame(pos, out);
    });
    b.cards(rim, TUFT_CREAM, { size: [0.017, 0.032], lean: 0, flow: fz, bone: head });
    // Gold bead at the ear tip with a teal tassel.
    const tipPos = base.clone().addScaledVector(fy, 0.052).addScaledVector(fz, 0.008);
    b.part(new THREE.SphereGeometry(1, 8, 6), C_GOLD, { bone: head, at: tipPos, scale: 0.0095, name: `earBead${sfx}` });
    b.cards([frame(tipPos.clone().add(V(0, -0.004, 0.004)), [0, 1, 0])], TASSEL, {
      size: [0.018, 0.05],
      lean: 180,
      flow: [0, 0, 1],
      bone: head,
    });
  }

  // Forehead leaf crest with a Dendro gem.
  const crest: OutlinePoint[] = [
    [0, 0],
    [0.022, 0.008],
    [0.034, 0.028],
    [0.02, 0.026],
    [0.012, 0.044],
    [0, 0.062],
    [-0.012, 0.044],
    [-0.02, 0.026],
    [-0.034, 0.028],
    [-0.022, 0.008],
  ];
  const crestAt = headPoint(0, 52, 0.002);
  b.extrude(crest, {
    at: crestAt,
    x: [1, 0, 0],
    y: [0, 0.55, -0.83],
    thickness: 0.006,
    bevel: 0.0015,
    color: C_GOLD,
    bone: head,
    name: "crest",
  });
  const gemAt = headPoint(0, 49, 0.007);
  glow(
    b.part(new THREE.OctahedronGeometry(1), LEAF, {
      bone: head,
      at: gemAt,
      scale: [0.0085, 0.0125, 0.0075],
      name: "crestGem",
    }),
    1.4,
  );

  // ---------------------------------------------------------------- neck fluff, collar, pendant
  const neckHits = b.surface(neckSweep).scatter(44, {
    rng: R,
    minDist: 0.017,
    filter: (h) => h.n.y < 0.45 && (Math.abs(h.n.x) > 0.3 || h.n.y > -0.3),
  });
  b.cards(neckHits, TUFT_CREAM, { size: [0.026, 0.048], lean: 60, vary: 0.25, rng: R, bone: neck.joints[0] });

  const np = neck.at(0.5);
  const nt = np.tangent.clone().normalize();
  b.part(new THREE.TorusGeometry(0.088, 0.0095, 5, 16), C_GOLD, {
    bone: neck.joints[0],
    at: np.at,
    dir: nt,
    axis: "z",
    name: "collar",
  });
  const down = V(0, -1, 0).addScaledVector(nt, nt.y).normalize();
  const pend = np.at.clone().addScaledVector(down, 0.1);
  b.part(new THREE.OctahedronGeometry(1), C_GOLD, {
    bone: neck.joints[0],
    at: pend,
    scale: [0.018, 0.026, 0.012],
    name: "pendant",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(1), LEAF, {
      bone: neck.joints[0],
      at: pend.clone().add(V(0, 0, 0.005)),
      scale: [0.011, 0.018, 0.012],
      name: "pendantGem",
    }),
    1.4,
  );
  b.cards([frame(pend.clone().add(V(0, -0.022, 0.004)), [0, 1, 0])], TASSEL, {
    size: [0.03, 0.075],
    lean: 180,
    flow: [0, 0, 1],
    bone: neck.joints[0],
  });

  // ---------------------------------------------------------------- body fluff
  const bodyMeshSurf = b.surface(b.root.children.length ? b.root : b.root);
  void bodyMeshSurf;

  // ---------------------------------------------------------------- tail
  const tailSweep = b.sweep(tail, [0.05, 0.07, 0.085, 0.085, 0.075, 0.045], { color: tailPaint, name: "tailTube" });
  const tuftRust: ReturnType<typeof frame>[] = [];
  const tuftDeep: ReturnType<typeof frame>[] = [];
  const tuftTip: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 110; i++) {
    const t = 0.18 + R() * 0.79;
    const ang = (R() * 2 - 1) * 170;
    const f = tailSweep.at(t, ang);
    if (t > 0.93) tuftTip.push(f);
    else if (Math.floor(t * 9) % 2 === 0) tuftRust.push(f);
    else tuftDeep.push(f);
  }
  for (const [list, tex] of [
    [tuftRust, TUFT_RUST],
    [tuftDeep, TUFT_DEEP],
    [tuftTip, TUFT_TIP],
  ] as const) {
    if (!list.length) continue;
    b.cards(list, tex, {
      size: [0.034, 0.07],
      lean: 55,
      bend: 20,
      vary: 0.3,
      rng: R,
      flow: (f) => f.dir([0, 0, 1]),
    });
  }
  // Gold band with a hanging tassel on the tail.
  const tp = tail.at(0.14);
  b.part(new THREE.TorusGeometry(0.067, 0.0075, 5, 14), C_GOLD, {
    bone: tail.joints[0],
    at: tp.at,
    dir: tp.tangent,
    axis: "z",
    name: "tailBand",
  });
  b.cards([frame(tp.at.clone().add(V(0, -0.066, 0)), [0, 1, 0])], TASSEL, {
    size: [0.03, 0.075],
    lean: 180,
    flow: [1, 0, 0],
    bone: tail.joints[0],
  });
  glow(
    b.part(new THREE.SphereGeometry(1, 8, 6), LEAF, {
      bone: tail.joints[0],
      at: tp.at.clone().add(V(0, -0.071, 0)),
      scale: 0.009,
      name: "tailBead",
    }),
    1.3,
  );

  // Body fluff: rust on the back, plum under the belly.
  const bodyParts = b.surface(b.root.getObjectByName("body") ?? b.root);
  const backHits = bodyParts.scatter(130, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.2 && h.at.y > 0.42 && h.at.z > -0.3 && h.at.z < 0.2 });
  b.cards(backHits, TUFT_RUST, { size: [0.032, 0.055], lean: 70, vary: 0.3, rng: R });
  const bellyHits = bodyParts.scatter(60, { rng: R, minDist: 0.035, filter: (h) => h.n.y < -0.35 && h.at.y > 0.38 });
  b.cards(bellyHits, TUFT_PLUM, { size: [0.03, 0.05], lean: 70, vary: 0.3, rng: R });

  return b.root;
}
