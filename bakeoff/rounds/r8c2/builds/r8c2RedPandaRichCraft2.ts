import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, noise, cells, svg, frame } from "../../../../src/index";
import { cel, furEdge, animeEye, INK, KEY_LIGHT, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda with anime eyes, a ringed bushy tail and a teal dendro scarf, balancing on a mossy runed boulder with glowing crystals, mushrooms and flowers.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and palette

const FL = 0.252; // top of the stone: where the paws stand
const BY = FL + 0.21; // height of the body axis
const BASE_H = 0.042;

const RUST = "#e5622b";
const RUST_LT = "#f58a3c";
const RUST_DK = "#b0451f";
const HEAD_RUST = "#ef7a33";
const BELLY = "#3f252c";
const PAW = "#4a2c34";
const TOE = "#5e3a44";
const CREAM = "#fff2da";
const CREAM_SH = "#f2c9a0";
const NOSE = "#2b1a22";
const TEAR = "#8a3420";
const TEAL = "#2bb8a8";
const TEAL_LT = "#3fd2bd";
const GOLD = "#f2c14e";
const MOSS = "#79cf44";

const KEY = new THREE.Vector3(...KEY_LIGHT).normalize();
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Toon palette
const C_BELLY = cel(BELLY);
const C_CREAM = cel(CREAM, CREAM_SH);
const C_RUST = cel(RUST);
const C_RUSTLT = cel(RUST_LT);
const C_PAW = cel(PAW);
const C_TOE = cel(TOE);
const C_TEAL = cel(TEAL);
const C_GOLD = cel(GOLD, "#c98f2a");
const C_MOSS = cel(MOSS);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = animeEye({ iris: "#38d6c4", irisLight: "#b9fff0" });

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cfcfcf"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M2 64 Q5 34 16 0 Q27 34 30 64 Z" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);

const BLADE = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 48 Q7 24 1 6 Q13 20 15 48Z" fill="#4c9a3a"/>
    <path d="M12 48 Q14 20 21 1 Q27 22 29 48Z" fill="#86dc4e"/>
    <path d="M26 48 Q31 28 39 12 Q36 34 37 48Z" fill="#5fb43e"/>
  </svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 46 Q1 30 16 2 Q31 30 16 46Z" fill="#58b848" stroke="#2c6e34" stroke-width="2.5"/>
    <path d="M16 44 V10" stroke="#2c6e34" stroke-width="2.2"/>
  </svg>`,
  { size: 128 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 56 V26" stroke="#3a9a3a" stroke-width="3.5"/>
    <g fill="#fff8fb" stroke="#e8a0c0" stroke-width="1.8">
      <ellipse cx="20" cy="10" rx="7" ry="9"/>
      <ellipse cx="10" cy="18" rx="7" ry="9" transform="rotate(-55 10 18)"/>
      <ellipse cx="30" cy="18" rx="7" ry="9" transform="rotate(55 30 18)"/>
    </g>
    <circle cx="20" cy="18" r="5" fill="#ffd34e"/>
  </svg>`,
  { size: 128 },
);

const RUNE = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#9dffb4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="50" r="35"/>
      <circle cx="100" cy="50" r="25" stroke-width="3"/>
      <path d="M100 22 Q122 42 100 78 Q78 42 100 22Z"/>
      <path d="M100 30 V70"/>
      <path d="M100 50 L112 42 M100 58 L88 50"/>
      <path d="M14 50 H56 M144 50 H186"/>
      <path d="M24 38 L34 50 L24 62 M176 38 L166 50 L176 62"/>
      <path d="M60 20 L72 28 M140 20 L128 28 M60 80 L72 72 M140 80 L128 72"/>
    </g>
  </svg>`,
  { size: 512 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#1d6f67" stroke="#f2c14e" stroke-width="5"/>
    <path d="M32 12 Q51 28 32 53 Q13 28 32 12Z" fill="#9af0a8" stroke="#f2c14e" stroke-width="2.5"/>
    <path d="M32 18 V48 M32 34 L40 28 M32 40 L24 34" stroke="#1d6f67" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Scenery paints

const stonePaint = paint((p, n) => {
  const lit = n.dot(KEY) > 0.1;
  const wob = (noise(p, 0.16, 4) - 0.5) * 0.9;
  const mossy = n.y + wob + (p.y - 0.12) * 1.6;
  if (mossy > 0.78) {
    const deep = noise(p, 0.05, 11) > 0.6;
    return lit ? (deep ? "#93d84e" : "#6dbb3d") : deep ? "#4f9a3c" : "#3e8a3a";
  }
  const c = cells(p, 0.22, 7);
  if (c.d2 - c.d1 < 0.07) return lit ? "#4b5666" : "#364050";
  const band = noise(p, 0.3, 2) > 0.55;
  return lit ? (band ? "#9aa6b4" : "#8895a6") : band ? "#68758a" : "#5c697e";
});

const baseCoat = paint((p, n) => {
  const lit = n.dot(KEY) > 0.1;
  if (n.y > 0.6) {
    const t = noise(p, 0.08, 3) > 0.55;
    return lit ? (t ? "#86d84a" : "#6cc23f") : t ? "#4f9d3c" : "#3f8a3a";
  }
  return lit ? "#8a5a3a" : "#5e3a2c";
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "red_panda_on_mossy_stone" });

  // =============================================================================================================
  // Skeleton

  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, BY, -0.22], dir: [0, 0.02, 1], role: "spine" });

  const spinePath = catmull([
    [0, BY, -0.22],
    [0, BY + 0.005, -0.1],
    [0, BY + 0.01, 0.02],
    [0, BY + 0.015, 0.12],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const neckEnd: [number, number, number] = [0, BY + 0.075, 0.235];
  const neckPath = catmull([[0, BY + 0.015, 0.12], [0, BY + 0.05, 0.18], neckEnd]);
  const neck = b.chain("neck", neckPath, { parent: chest, names: ["neck1", "neck2"], role: "neck" });

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neckEnd,
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: -0.035, forward: 0.05 }),
    aim: head.local({ up: -0.04, forward: 0.17 }),
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    [0, BY, -0.26],
    [0, BY - 0.015, -0.42],
    [0, BY - 0.01, -0.6],
    [0, BY + 0.03, -0.76],
    [0, BY + 0.1, -0.88],
    [0, BY + 0.18, -0.93],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  // =============================================================================================================
  // Base, stone and scenery

  b.lathe(
    [
      [0, 0],
      [0.66, 0],
      [0.7, 0.015],
      [0.68, BASE_H - 0.002],
      [0, BASE_H],
    ],
    { at: [0, 0, -0.04], segments: 12, bone: base, color: baseCoat, name: "ground" },
  );

  const stone = b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.5, 0.05],
      [0.52, 0.12],
      [0.47, 0.19],
      [0.4, 0.22],
      [0, 0.225],
    ],
    { at: [0, 0.03, 0.03], segments: 9, spin: 20, bone: base, color: stonePaint, name: "stone" },
  );
  const stoneSkin = b.surface(stone);
  const stoneR = (h: { at: THREE.Vector3 }) => Math.hypot(h.at.x, h.at.z - 0.03);

  // satellite rocks and pebbles
  const rocks: [number, number, number][] = [
    [0.56, 0.12, 0.1],
    [-0.54, -0.15, 0.09],
    [0.05, -0.58, 0.085],
    [-0.36, -0.42, 0.075],
    [0.12, 0.56, 0.06],
  ];
  rocks.forEach(([x, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(1, 0), stonePaint, {
      bone: base,
      at: [x, BASE_H + r * 0.28, z],
      scale: [r, r * 0.62, r * 0.9],
      rotation: [0, i * 47, 0],
      flat: true,
      name: `rock${i}`,
    });
  });
  const rp = rng(31);
  for (let i = 0; i < 9; i++) {
    const a = rp() * Math.PI * 2;
    const rad = 0.52 + rp() * 0.1;
    b.part(new THREE.IcosahedronGeometry(0.014 + rp() * 0.014, 0), stonePaint, {
      bone: base,
      at: [Math.sin(a) * rad, BASE_H, -0.04 + Math.cos(a) * rad],
      flat: true,
    });
  }

  // moss lumps on the stone
  for (const h of stoneSkin.scatter(12, {
    rng: rng(5),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.5 && stoneR(h) > 0.3 && stoneR(h) < 0.5,
  }))
    b.stick(new THREE.IcosahedronGeometry(0.024 + rp() * 0.016, 0), C_MOSS, h, { embed: 0.5, flat: true, bone: base });

  // grass on the stone
  b.cards(
    stoneSkin.scatter(48, {
      rng: rng(6),
      minDist: 0.05,
      filter: (h) => h.n.y > 0.6 && stoneR(h) > 0.3 && stoneR(h) < 0.5,
    }),
    BLADE,
    { size: [0.05, 0.075], bend: 20, cross: true, vary: 0.3, spin: 180, rng: rng(7), bone: base },
  );

  // grass and flowers on the ground
  const groundSkin = b.surface(b.root);
  void groundSkin;
  const baseSkinHits = (count: number, seed: number, filt: (x: number, z: number) => boolean) => {
    const out: { at: THREE.Vector3; n: THREE.Vector3 }[] = [];
    const rr = rng(seed);
    let tries = 0;
    while (out.length < count && tries++ < 600) {
      const a = rr() * Math.PI * 2;
      const rad = 0.54 + rr() * 0.12;
      const x = Math.sin(a) * rad;
      const z = -0.04 + Math.cos(a) * rad;
      if (filt(x, z)) out.push({ at: V(x, BASE_H, z), n: V(0, 1, 0) });
    }
    return out;
  };
  const groundFrames = (count: number, seed: number, filt: (x: number, z: number) => boolean) =>
    baseSkinHits(count, seed, filt).map((h) => frame(h.at, [0, 1, 0]));
  b.cards(
    groundFrames(24, 8, () => true),
    BLADE,
    { size: [0.06, 0.085], bend: 20, cross: true, vary: 0.35, spin: 180, rng: rng(9), bone: base },
  );
  b.cards(
    groundFrames(9, 10, (x, z) => x > 0.0 && z > 0.1),
    FLOWER,
    { size: [0.05, 0.07], cross: true, vary: 0.25, spin: 180, rng: rng(12), bone: base },
  );

  // hanging vines with leaves
  for (const ang of [52, -38]) {
    const a = (ang * Math.PI) / 180;
    const pt = (r: number, y: number): [number, number, number] => [Math.sin(a) * r, y, 0.03 + Math.cos(a) * r];
    const vinePath = catmull([pt(0.4, 0.254), pt(0.49, 0.224), pt(0.538, 0.15), pt(0.52, 0.085)]);
    b.sweep(vinePath, [0.008, 0.003], { color: "#2d7a3a", bone: base, sides: 5 });
    const items: any[] = [];
    b.along(vinePath, 8, (at) => {
      items.push(at);
    });
    b.cards(items, LEAF, { size: [0.04, 0.055], lean: 55, vary: 0.25, spin: 120, rng: rng(13 + ang), bone: base });
  }

  // glowing rune on the stone front
  glow(
    b.decal(stone, RUNE, {
      at: [0, 0.14, 0.03 + 0.5],
      dir: [0, 0, 1],
      size: [0.32, 0.16],
      segments: 18,
      lift: 0.004,
      bone: base,
      name: "rune",
    }),
    1.3,
  );

  // dendro crystal cluster, back left
  const crystal = (cx: number, cz: number, tx: number, tz: number, h: number, r: number) => {
    const c = V(cx, BASE_H - 0.004, cz);
    const d = V(tx, 1, tz).normalize();
    glow(
      b.part(new THREE.CylinderGeometry(r, r * 1.1, h, 6), "#3fcf88", {
        bone: base,
        at: c.clone().addScaledVector(d, h / 2),
        dir: d,
        flat: true,
      }),
      1.1,
    );
    glow(
      b.part(new THREE.ConeGeometry(r, r * 2, 6), "#a6ffd2", {
        bone: base,
        at: c.clone().addScaledVector(d, h + r),
        dir: d,
        flat: true,
      }),
      1.6,
    );
  };
  crystal(0.44, -0.3, 0.12, -0.1, 0.24, 0.04);
  crystal(0.5, -0.24, 0.45, 0.1, 0.14, 0.03);
  crystal(0.37, -0.36, -0.3, -0.3, 0.17, 0.028);
  crystal(0.52, -0.36, 0.3, -0.4, 0.1, 0.022);
  crystal(0.33, -0.27, -0.45, 0.15, 0.09, 0.02);
  // floating motes
  const moteR = rng(41);
  for (let i = 0; i < 7; i++) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.009 + moteR() * 0.007, 0), i % 2 ? "#c8ffd8" : "#7affb0", {
        bone: base,
        at: [0.36 + moteR() * 0.22, 0.2 + moteR() * 0.3, -0.42 + moteR() * 0.25],
        rotation: [moteR() * 90, moteR() * 90, 0],
        flat: true,
      }),
      1.8,
    );
  }

  // glowing mushrooms, front right
  const mushroom = (x: number, z: number, h: number, r: number) => {
    b.part(new THREE.CylinderGeometry(r * 0.2, r * 0.3, h, 6), "#f3e9d0", {
      bone: base,
      at: [x, BASE_H + h / 2 - 0.003, z],
    });
    const cap = glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 1.1, r * 0.14],
          [r * 0.8, r * 0.5],
          [r * 0.35, r * 0.82],
          [0, r * 0.92],
        ],
        { at: [x, BASE_H + h - 0.004, z], segments: 8, bone: base, color: "#59e6d2" },
      ),
      1.3,
    );
    for (const hit of b.surface(cap).scatter(4, { rng: rng(Math.floor(x * 100) + 3), minDist: r * 0.5, filter: (q) => q.n.y > 0.35 }))
      glow(b.stick(new THREE.SphereGeometry(r * 0.15, 5, 4), "#eafffb", hit, { embed: 0.3, bone: base }), 1.6);
  };
  mushroom(-0.46, 0.36, 0.05, 0.036);
  mushroom(-0.54, 0.24, 0.035, 0.026);
  mushroom(-0.4, 0.46, 0.03, 0.022);

  // a sweet flower with glowing heart, front left
  {
    const fx = 0.33;
    const fz = 0.46;
    const top = BASE_H + 0.09;
    b.sweep(
      catmull([
        [fx, BASE_H, fz],
        [fx + 0.01, BASE_H + 0.045, fz + 0.005],
        [fx + 0.012, top, fz + 0.008],
      ]),
      0.004,
      { color: "#3a9a3a", bone: base, sides: 5 },
    );
    const petal: [number, number, string?][] = [
      [0, 0],
      [0.012, 0.012],
      [0.028, 0.01],
      [0.037, 0],
      [0.028, -0.01],
      [0.012, -0.012],
    ];
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      b.extrude(petal as any, {
        at: [fx + 0.012, top, fz + 0.008],
        x: [c, 0.35, s],
        y: [-s, 0, c],
        thickness: 0.004,
        smoothing: 1,
        color: cel("#fff6fb", "#f3c3da"),
        bone: base,
      });
    }
    glow(b.part(new THREE.SphereGeometry(0.011, 6, 5), "#ffd34e", { bone: base, at: [fx + 0.012, top + 0.003, fz + 0.008] }), 1.6);
    b.extrude(
      [
        [0, 0],
        [0.02, 0.012],
        [0.045, 0],
        [0.02, -0.012],
      ],
      { at: [fx, BASE_H + 0.02, fz], x: [1, 0.5, 0.3], y: [-0.3, 0, 1], thickness: 0.003, smoothing: 1, color: "#4aa646", bone: base },
    );
  }

  // =============================================================================================================
  // Body

  const bodyCoat = cel(furEdge(RUST, BELLY, { level: -0.5, teeth: 0.3, period: 0.034 }));
  const body = b.sweep(spine, (t) => [0.094 + 0.02 * t, 0.092 + 0.016 * t], {
    color: bodyCoat,
    shift: [0, -0.01],
    name: "body",
  });
  const neckTube = b.sweep(neck, [0.078, 0.07], { color: bodyCoat, name: "neckTube" });

  // chunky haunches and shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), bodyCoat, {
      bone: hips,
      at: [s * 0.088, BY - 0.025, -0.2],
      scale: [0.072, 0.085, 0.1],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), bodyCoat, {
      bone: chest,
      at: [s * 0.09, BY - 0.02, 0.07],
      scale: [0.07, 0.08, 0.085],
    });
  }

  // back fur tufts
  b.cards(
    b.surface(body).scatter(40, { rng: rng(14), minDist: 0.055, filter: (h) => h.n.y > 0.3 }),
    TUFT,
    { size: [0.04, 0.05], lean: 80, bend: 20, vary: 0.3, rng: rng(15), color: "#f0803a" },
  );

  // =============================================================================================================
  // Legs

  const legCoat = cel(
    furEdge(RUST, BELLY, { by: "position", axis: [0, 1, 0], level: BY - 0.075, teeth: 0.03, period: 0.034, along: [0, 0, 1] }),
  );

  const makePaw = (tip: any, x: number, z: number) => {
    const c = V(x, FL + 0.022, z + 0.025);
    b.part(new THREE.SphereGeometry(1, 8, 6), C_PAW, { bone: tip, at: c, scale: [0.042, 0.027, 0.058] });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.016, 6, 5), C_TOE, {
        bone: tip,
        at: [c.x + k * 0.02, c.y - 0.005, c.z + 0.05 - Math.abs(k) * 0.007],
        scale: [1, 0.8, 1.15],
      });
    }
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // hind leg: knee forward
    const hipP: [number, number, number] = [s * 0.085, BY - 0.01, -0.2];
    const footH: [number, number, number] = [s * 0.095, FL + 0.036, -0.2];
    const hind = b.chain(`legHind${sd}`, limb(hipP, footH, [0.105, 0.105], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [footH[0], FL, footH[2] + 0.02],
    });
    const hindTube = b.sweep(hind, [0.054, 0.032], { color: legCoat, name: `hindLeg${sd}` });
    makePaw(hind.tip!, footH[0], footH[2]);
    b.cards(
      b.surface(hindTube).scatter(7, { rng: rng(50 + s), minDist: 0.04, filter: (h) => h.n.z < 0.3 }),
      TUFT,
      { size: [0.03, 0.05], lean: 66, vary: 0.25, rng: rng(51), color: "#5a3640" },
    );

    // front leg: elbow back
    const shP: [number, number, number] = [s * 0.09, BY - 0.01, 0.07];
    const footF: [number, number, number] = [s * 0.1, FL + 0.036, 0.13];
    const front = b.chain(`legFront${sd}`, limb(shP, footF, [0.105, 0.105], [[0, 0, -1]]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
      contact: [footF[0], FL, footF[2] + 0.02],
    });
    const frontTube = b.sweep(front, [0.048, 0.03], { color: legCoat, name: `frontLeg${sd}` });
    makePaw(front.tip!, footF[0], footF[2]);
    b.cards(
      b.surface(frontTube).scatter(7, { rng: rng(60 + s), minDist: 0.04, filter: (h) => h.n.z < 0.3 }),
      TUFT,
      { size: [0.03, 0.05], lean: 66, vary: 0.25, rng: rng(61), color: "#5a3640" },
    );
  }

  // =============================================================================================================
  // Tail: bushy, ringed

  const tailPaint = cel(
    paint((_p, _n, s) => (s[0] > 0.94 ? RUST_DK : Math.floor(s[0] * 12) % 2 ? "#c24f22" : "#ea7430")),
  );
  const tailTube = b.sweep(tail, (t) => 0.056 + 0.04 * Math.sin(Math.PI * Math.min(1, t * 1.12)), {
    color: tailPaint,
    name: "tailTube",
  });
  {
    const hits = b.surface(tailTube).scatter(64, { rng: rng(21), minDist: 0.045, filter: (h) => h.at.z < -0.3 });
    const ringOf = (h: { at: THREE.Vector3 }) => Math.floor(tailPath.closestT(h.at) * 12) % 2;
    const lightH = hits.filter((h) => ringOf(h) === 0);
    const darkH = hits.filter((h) => ringOf(h) === 1);
    b.cards(lightH, TUFT, { size: [0.045, 0.055], lean: 82, bend: 20, vary: 0.25, rng: rng(22), color: "#f07a30" });
    b.cards(darkH, TUFT, { size: [0.045, 0.055], lean: 82, bend: 20, vary: 0.25, rng: rng(23), color: "#b94a20" });
  }

  // =============================================================================================================
  // Head

  const HC = head.local({ up: 0.03, forward: 0.07 });

  const headCoat = cel(
    paint((p) => {
      const dx = Math.abs(p.x - HC.x);
      const dy = p.y - HC.y;
      const dz = p.z - HC.z;
      const tx = 0.066 - Math.max(0, -dy - 0.015) * 0.55;
      if (dz > 0.035 && dy < -0.012 && dy > -0.078 && Math.abs(dx - tx) < 0.007) return TEAR;
      const jag = 0.012 * zigzag(p.z / 0.024);
      if (dy < -0.028 + jag || (dz > 0.07 && dy < 0.03 && dx < 0.05)) return CREAM;
      if (dy > 0.03 && dx < 0.014 && dz > -0.02) return RUST_LT;
      return HEAD_RUST;
    }),
  );

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headCoat, {
    bone: head,
    at: HC,
    scale: [0.123, 0.099, 0.107],
    name: "skull",
  });
  const skin = b.surface(skull);

  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), C_CREAM, {
    bone: head,
    at: head.local({ up: -0.012, forward: 0.145 }),
    scale: [0.04, 0.036, 0.05],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), cel(NOSE, "#1a0f15"), {
    bone: head,
    at: head.local({ up: 0.006, forward: 0.19 }),
    scale: [0.017, 0.012, 0.012],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.003, 4, 3), "#ffffff", {
    bone: head,
    at: head.local({ up: 0.011, forward: 0.196, left: 0.005 }),
  });
  // lower jaw (moves with the jaw joint)
  b.part(new THREE.SphereGeometry(1, 10, 8), C_CREAM, {
    bone: jaw,
    at: head.local({ up: -0.045, forward: 0.14 }),
    scale: [0.034, 0.02, 0.045],
    name: "lowerJaw",
  });

  // mouth line
  const mz = b.surface(muzzle);
  for (const s of [1, -1]) {
    const mouth = catmull([
      head.local({ up: 0.0, forward: 0.2 }),
      head.local({ up: -0.02, forward: 0.196 }),
      head.local({ left: s * 0.018, up: -0.033, forward: 0.188 }),
      head.local({ left: s * 0.036, up: -0.032, forward: 0.168 }),
    ]);
    b.sweep(mz.drape(mouth, { lift: 0.002 }), 0.0022, { color: INK, sides: 5, bone: head });
  }

  // whiskers
  for (const s of [1, -1])
    for (const k of [-1, 0, 1]) {
      b.rod(
        head.local({ left: s * 0.032, up: -0.02, forward: 0.175 }),
        head.local({ left: s * 0.125, up: -0.02 + k * 0.022, forward: 0.13 }),
        0.0012,
        "#fff6e6",
        { bone: head, sides: 4 },
      );
    }

  // eyes: big anime decals
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 42, 4)!;
    b.decal(skin, EYE, {
      at: hit.at,
      dir: [s * 0.4, 0.05, 1],
      size: [0.052, 0.071],
      mirror: s > 0,
      segments: 12,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    // cream brow spot
    const brow = skin.around(HC).at(s * 40, 38)!;
    b.stick(new THREE.SphereGeometry(0.017, 6, 4).scale(1, 0.55, 1), C_CREAM, brow, { embed: 0.3 });
  }

  // ears: rust discs with cream inner fluff
  for (const s of [1, -1]) {
    const earAt = head.local({ left: s * 0.088, up: 0.108, forward: 0.045 });
    const d = V(s * 0.3, 0.35, 0.85).normalize();
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.018, 10), C_RUSTLT, { bone: head, at: earAt, dir: d, name: "ear" });
    b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.012, 10), C_CREAM, {
      bone: head,
      at: earAt.clone().addScaledVector(d, 0.008),
      dir: d,
    });

  }

  // cheek ruffs: jagged cream plates
  const CHEEK: [number, number, string?][] = [
    [0.05, 0.0],
    [0.04, 0.04],
    [0.0, 0.055],
    [-0.04, 0.045],
    [-0.075, 0.03, "sharp"],
    [-0.05, 0.012],
    [-0.09, -0.012, "sharp"],
    [-0.05, -0.02],
    [-0.07, -0.05, "sharp"],
    [-0.03, -0.045],
    [-0.03, -0.075, "sharp"],
    [0.0, -0.05],
    [0.03, -0.04],
  ];
  for (const s of [1, -1]) {
    b.extrude(CHEEK.map(([x, y, k]) => (k ? [x * 0.6, y * 0.6, k] : [x * 0.6, y * 0.6])) as any, {
      at: head.local({ left: s * 0.1, up: -0.01, forward: 0.05 }),
      x: [-s * 0.4, 0, 1],
      thickness: 0.014,
      bevel: 0.004,
      color: C_CREAM,
      bone: head,
      name: "cheekRuff",
    });
  }
  b.cards(
    skin.scatter(18, {
      rng: rng(71),
      minDist: 0.03,
      filter: (h) =>
        h.at.y < HC.y && h.at.y > HC.y - 0.06 && Math.abs(h.at.x - HC.x) > 0.06 && h.at.z < HC.z + 0.04,
    }),
    TUFT,
    { size: [0.03, 0.05], lean: 70, vary: 0.25, rng: rng(72), color: CREAM, flow: [0, -0.1, -1] },
  );

  // =============================================================================================================
  // Dendro scarf with leaf pendant

  const nk = neck.at(0.45);
  const nkSurf = b.surface(neckTube);
  const scarfCoat = cel(paint((_p, _n, s) => (Math.floor(s[0] * 28) % 2 ? TEAL : TEAL_LT)));
  b.sweep(nkSurf.loop(nk, { lift: 0.012 }), 0.026, { color: scarfCoat, name: "scarf" });
  for (const t of [0.3, 0.6]) b.sweep(nkSurf.loop(neck.at(t), { lift: 0.03 }), 0.0065, { color: C_GOLD, name: "scarfTrim" });

  const kh = nkSurf.around(nk.at).at(0, -40)!;
  b.stick(new THREE.SphereGeometry(0.028, 8, 6), C_TEAL, kh, { embed: 0.35 });
  const kp = V(kh.at.x, kh.at.y, kh.at.z);
  const hem = cel(paint((_p, _n, s) => (s[1] < -0.088 ? GOLD : TEAL)));
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.018, 0],
        [0.018, 0],
        [0.021, -0.1],
        [0.0, -0.082],
        [-0.021, -0.1],
      ],
      {
        at: [kp.x + s * 0.026, kp.y - 0.012, kp.z - 0.012],
        x: [1, 0, 0],
        y: [s * 0.15, 1, 0.25],
        thickness: 0.008,
        bevel: 0.002,
        color: hem,
        bone: chest,
        name: "scarfTail",
      },
    );
  }
  // pendant
  const pp = V(kp.x, kp.y - 0.056, kp.z - 0.03);
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 12), C_GOLD, { bone: chest, at: pp, dir: [0, 0, 1], name: "pendant" });
  glow(
    b.part(new THREE.CircleGeometry(0.024, 14), "#ffffff", {
      bone: chest,
      at: [pp.x, pp.y, pp.z + 0.0052],
      dir: [0, 0, 1],
      axis: "z",
      texture: EMBLEM,
      name: "emblem",
    }),
    0.9,
  );
  b.rod([kp.x, kp.y - 0.01, kp.z - 0.004], [pp.x, pp.y + 0.026, pp.z], 0.0025, GOLD, { bone: chest, sides: 4 });

  return b.root;
}
