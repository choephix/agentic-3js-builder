import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { cells, mottle, noise, paint, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda balancing on a moss-capped boulder: tail arched high, Dendro-green anime eyes, a teal scarf with a gold medallion and tassel, a glowing sprout on its crown, runic gold inlay and drifting spore sparkles.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (every surface colour is a two-tone cel)
const RUST = "#f26a1c";
const RUST_L = "#ffb25c";
const CREAM = "#fff3dc";
const CHOC = "#4a2523";
const NOSE = "#2a1722";
const TONGUE = "#ff8b9c";
const MOUTH = "#8a2c3c";
const CLAW = "#eadcc4";
const GOLD = "#ffc94a";
const GOLD_D = "#c98a1c";
const TEAL = "#27c1b0";
const JADE = "#59f2a2";
const STONE = "#8f9bb6";
const STONE_L = "#b9c3da";
const STONE_D = "#4f5a7a";
const MOSS = "#7ed13f";
const MOSS_L = "#b4ee59";
const MOSS_D = "#3f9c3c";

const TOP = 0.24; // the stone's top surface
const P = (x: number, h: number, z: number) => [x, TOP + h, z];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M3 64 Q9 28 16 0 Q23 28 29 64Z" fill="#ffffff"/><path d="M16 0 Q23 28 29 64 L17 64 Q19 30 16 0Z" fill="#c2c2c2"/></svg>`,
  { size: 96 },
);
const GRASS = svg(
  `<svg viewBox="0 0 48 48">
    <path d="M6 48 Q8 24 4 6 Q16 20 16 48Z" fill="#4fae3c"/><path d="M6 48 Q8 24 4 6 Q8 22 8 48Z" fill="#3b8f36"/>
    <path d="M17 48 Q18 20 24 0 Q30 20 31 48Z" fill="#8fe04a"/><path d="M24 0 Q30 20 31 48 L25 48 Q26 20 24 0Z" fill="#5fbb3e"/>
    <path d="M32 48 Q36 22 44 8 Q44 28 42 48Z" fill="#6cc944"/><path d="M44 8 Q44 28 42 48 L38 48 Q42 28 44 8Z" fill="#46a33a"/>
  </svg>`,
  { size: 96 },
);
const SPARK = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 Q35 29 64 32 Q35 35 32 64 Q29 35 0 32 Q29 29 32 0Z" fill="#b8ffd6"/><path d="M32 14 Q34 30 50 32 Q34 34 32 50 Q30 34 14 32 Q30 30 32 14Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SPARK_GOLD = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 Q35 29 64 32 Q35 35 32 64 Q29 35 0 32 Q29 29 32 0Z" fill="#ffd24f"/><path d="M32 14 Q34 30 50 32 Q34 34 32 50 Q30 34 14 32 Q30 30 32 14Z" fill="#fff6c8"/></svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 32 48">
    <path d="M16 48 Q15 34 16 20" stroke="#3b9a3a" stroke-width="3" fill="none"/>
    <path d="M16 38 Q8 36 5 30 Q13 30 16 36Z" fill="#59b83e"/>
    <g fill="#fffaf0" stroke="#f3b6c6" stroke-width="1"><circle cx="16" cy="6" r="5.4"/><circle cx="24" cy="12" r="5.4"/><circle cx="21" cy="21" r="5.4"/><circle cx="11" cy="21" r="5.4"/><circle cx="8" cy="12" r="5.4"/></g>
    <circle cx="16" cy="14" r="4.2" fill="#ffc94a"/><circle cx="15" cy="13" r="1.4" fill="#fff3b0"/>
  </svg>`,
  { size: 128 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 24 48">
    <rect x="3" y="0" width="18" height="6" rx="3" fill="#c98a1c"/>
    <g stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M5 5 Q3 26 5 46" stroke="#27c1b0"/><path d="M9 5 Q8 28 9 47" stroke="#ffc94a"/><path d="M12 5 L12 48" stroke="#27c1b0"/>
      <path d="M15 5 Q16 28 15 47" stroke="#ffc94a"/><path d="M19 5 Q21 26 19 46" stroke="#27c1b0"/>
    </g>
  </svg>`,
  { size: 96 },
);
const RUNE = svg(
  `<svg viewBox="0 0 100 100" fill="none" stroke="#7dffb4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="45" stroke-width="3"/><circle cx="50" cy="50" r="37" stroke-width="1.6" stroke-dasharray="3 5"/>
    <path d="M50 20 Q70 40 50 78 Q30 40 50 20Z" stroke-width="3"/>
    <path d="M50 32 L50 74 M50 52 Q61 46 63 40 M50 60 Q39 55 37 49" stroke-width="2.4"/>
    <path d="M50 4 L50 11 M50 89 L50 96 M4 50 L11 50 M89 50 L96 50" stroke-width="3"/>
    <path d="M18 18 L23 23 M82 18 L77 23 M18 82 L23 77 M82 82 L77 77" stroke-width="2.4"/>
  </svg>`,
  { size: 384 },
);
const FACE = svg(
  `<svg viewBox="0 0 100 60">
    <g fill="#b9471b"><path d="M13 44 Q9 52 11 60 Q18 54 22 46Z"/><path d="M87 44 Q91 52 89 60 Q82 54 78 46Z"/></g>
    <g fill="#fffaf0"><ellipse cx="24" cy="7" rx="7" ry="3.4" transform="rotate(-12 24 7)"/><ellipse cx="76" cy="7" rx="7" ry="3.4" transform="rotate(12 76 7)"/></g>
    <g fill="#7a3a28"><circle cx="40" cy="52" r="1.2"/><circle cx="44" cy="55" r="1.2"/><circle cx="36" cy="55" r="1.2"/><circle cx="60" cy="52" r="1.2"/><circle cx="56" cy="55" r="1.2"/><circle cx="64" cy="55" r="1.2"/></g>
  </svg>`,
  { size: 384 },
);
const MEDAL = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="31" fill="#ffc94a"/><circle cx="32" cy="32" r="26" fill="#27c1b0"/>
    <g fill="#ffc94a"><path d="M32 7 Q36 17 32 21 Q28 17 32 7Z"/><path d="M32 57 Q36 47 32 43 Q28 47 32 57Z"/><path d="M7 32 Q17 28 21 32 Q17 36 7 32Z"/><path d="M57 32 Q47 28 43 32 Q47 36 57 32Z"/></g>
    <g stroke="#ffe9a0" stroke-width="2" fill="none"><circle cx="32" cy="32" r="18"/><path d="M15 15 L21 21 M49 15 L43 21 M15 49 L21 43 M49 49 L43 43"/></g>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Cel paints
const STONE_P = mottle(STONE, STONE_L, { size: 0.12, seed: 2 });
const MOSS_P = mottle(MOSS, MOSS_L, { size: 0.05, seed: 5 });
const ROCK = cel(
  paint((p, n) => {
    const cr = cells(p, 0.17, 7);
    const moss = n.y + 0.8 * (noise(p, 0.09, 4) - 0.5) + 2.2 * (p.y - TOP * 0.55);
    if (moss > 0.55) return MOSS_P;
    return cr.d2 - cr.d1 < 0.016 ? STONE_D : STONE_P;
  }),
);
const MOSS_C = cel(MOSS_P);

const COAT = cel(furEdge(RUST, CHOC, { level: -0.3, teeth: 0.22, period: 0.03, ink: "#8a2a12" }));
const LEG = cel(furEdge(RUST, CHOC, { by: "position", level: TOP + 0.1, teeth: 0.03, period: 0.026, along: [1, 0, 1] }));
const PAW = cel(CHOC);
const TAIL = cel(
  paint((_p, _n, s) => {
    if (s[0] > 0.93) return CHOC;
    const ring = Math.floor(s[0] * 10 + 0.25 * zigzag(s[1] / 70));
    return ring % 2 === 0 ? RUST : RUST_L;
  }),
);
const CREAM_C = cel(CREAM, "#f0cfa6");
const GOLD_C = cel(GOLD, GOLD_D);
const TEAL_C = cel(TEAL);
const EAR_OUT = cel(furEdge(RUST, CHOC, { by: "position", axis: [0, 1, 0], level: TOP + 0.34, teeth: 0.0, period: 0.02 }));

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const rand = rng(11);

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: P(0, 0.2, -0.2), dir: [0, 0, 1], role: "spine", group: "body" });
  const spine = b.chain("spine", catmull([P(0, 0.2, -0.2), P(0, 0.21, -0.06), P(0, 0.225, 0.07), P(0, 0.24, 0.17)]), {
    parent: hips,
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", catmull([P(0, 0.24, 0.17), P(0, 0.265, 0.225), P(0, 0.285, 0.27)]), {
    parent: spine,
    role: "neck",
    group: "body",
  });
  const head = b.joint("head", { parent: neck, at: neck.at(1).at, dir: [0, -0.04, 1], role: "head", group: "head" });
  const tailPath = catmull([
    P(0, 0.2, -0.27),
    P(0, 0.21, -0.38),
    P(0, 0.26, -0.48),
    P(0, 0.36, -0.52),
    P(0, 0.45, -0.46),
    P(0, 0.49, -0.37),
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail", group: "tail" });

  // ------------------------------------------------------------------------------------------------------------
  // Stone
  const stone = b.loft(
    [
      { at: [0, 0, 0], w: 0.44, h: 0.68 },
      { at: [0, 0.05, 0], w: 0.58, h: 0.84 },
      { at: [0, 0.12, 0], w: 0.6, h: 0.88 },
      { at: [0, 0.19, 0], w: 0.52, h: 0.78 },
      { at: [0, 0.23, 0], w: 0.43, h: 0.68 },
      { at: [0, TOP, 0], w: 0.4, h: 0.64 },
    ],
    { bone: hips, color: ROCK, caps: "flat", sides: 10, smooth: false, name: "stone", group: "stone" },
  );
  const stoneSkin = b.surface(stone);
  const lumps: [number, number, number, number, number, number, number][] = [
    [0.31, 0.0, 0.2, 0.1, 0.075, 0.12, 0.3],
    [-0.31, 0.0, 0.1, 0.11, 0.07, 0.1, -0.2],
    [-0.27, 0.0, -0.3, 0.12, 0.08, 0.1, 0.5],
    [0.24, 0.0, -0.33, 0.09, 0.06, 0.1, 0.1],
    [0.1, 0.0, 0.42, 0.1, 0.06, 0.08, 0.2],
    [-0.16, 0.0, 0.4, 0.08, 0.055, 0.08, -0.4],
    [0.38, 0.0, -0.08, 0.07, 0.05, 0.07, 0.8],
    [-0.38, 0.0, -0.12, 0.06, 0.045, 0.06, 0.0],
  ];
  for (const [x, , z, sx, sy, sz, rot] of lumps)
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, {
      bone: hips,
      at: [x, sy * 0.82, z],
      scale: [sx, sy, sz],
      rotation: [0, rot * 60, 0],
      flat: true,
      group: "stone",
    });
  // gold inlay ring with studs and glowing rune
  const inlay = stoneSkin.loop([0, 0.055, 0], { lift: 0.004 });
  b.sweep(inlay, 0.006, { color: GOLD_C, bone: hips, group: "stone", sides: 6 });
  b.along(inlay, 18, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD_C, { at, bone: hips, scale: [1, 1, 0.8] }));
  const inlay2 = stoneSkin.loop([0, 0.195, 0], { lift: 0.003 });
  b.sweep(inlay2, 0.004, { color: GOLD_C, bone: hips, group: "stone", sides: 6 });
  glow(
    b.decal(stoneSkin, RUNE, {
      at: [0, 0.12, 0.45],
      dir: [0, 0, 1],
      size: [0.17, 0.17],
      segments: 14,
      lift: 0.003,
      bone: hips,
      name: "rune",
    }),
    1.2,
  );
  // moss pillows on the rim
  const pillows = 11;
  for (let i = 0; i < pillows; i++) {
    const a = (i / pillows) * Math.PI * 2 + 0.2;
    const x = Math.sin(a) * 0.2;
    const z = Math.cos(a) * 0.32;
    const sc = 0.04 + rand() * 0.03;
    b.part(new THREE.SphereGeometry(1, 7, 5), MOSS_C, {
      bone: hips,
      at: [x * 1.02, TOP - 0.012 + rand() * 0.006, z * 1.02],
      scale: [sc * 1.6, sc * 0.75, sc * 1.6],
      rotation: [0, rand() * 360, 0],
      group: "stone",
    });
  }
  // mushrooms at the foot of the stone
  for (const [mx, mz, mh, mr] of [
    [0.34, 0.16, 0.06, 1],
    [0.4, 0.22, 0.04, 0.7],
    [0.36, 0.28, 0.03, 0.55],
  ] as const) {
    b.sweep(polyline([[mx, 0, mz], [mx + 0.004, mh, mz]]), [0.009 * mr, 0.007 * mr], {
      color: CREAM_C,
      bone: hips,
      sides: 6,
      caps: "flat",
      group: "stone",
    });
    b.lathe(
      [
        [0, 0],
        [0.038 * mr, 0],
        [0.044 * mr, 0.008 * mr],
        [0.036 * mr, 0.022 * mr],
        [0.018 * mr, 0.033 * mr],
        [0, 0.036 * mr],
      ],
      {
        at: [mx + 0.004, mh - 0.004, mz],
        color: cel(spots(JADE, CREAM, { size: 0.02 * mr, amount: 0.45, seed: 3 })),
        bone: hips,
        segments: 9,
        group: "stone",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------------------
  // Body
  const body = b.loft(
    [
      { at: P(0, 0.2, -0.29), w: 0.13, h: 0.13 },
      { at: P(0, 0.2, -0.2), w: 0.2, h: 0.17 },
      { at: P(0, 0.21, -0.06), w: 0.215, h: 0.19 },
      { at: P(0, 0.225, 0.07), w: 0.215, h: 0.19 },
      { at: P(0, 0.24, 0.17), w: 0.19, h: 0.17 },
      { at: P(0, 0.265, 0.225), w: 0.14, h: 0.13 },
      { at: P(0, 0.285, 0.27), w: 0.11, h: 0.11 },
    ],
    { bone: [hips, spine, neck], color: COAT, name: "body", group: "body" },
  );
  const bodySkin = b.surface(body);

  // ------------------------------------------------------------------------------------------------------------
  // Tail
  const tailTube = b.sweep(tail, [0.04, 0.058, 0.074, 0.07, 0.055, 0.03], { color: TAIL, name: "tailTube", group: "tail" });
  const tailHits = b.surface(tailTube).scatter(70, { rng: rng(5), minDist: 0.045 });
  b.cards(tailHits, TUFT, {
    size: [0.04, 0.07],
    lean: 62,
    bend: 25,
    vary: 0.25,
    rng: rng(6),
    color: RUST,
    flow: (h) => tailPath.tangentAt(tailPath.closestT(h.at)),
  });

  // ------------------------------------------------------------------------------------------------------------
  // Legs
  const sides = [1, -1] as const;
  const legData: { side: string; foot: THREE.Vector3[] }[] = [];
  for (const s of sides) {
    const L = s > 0 ? "L" : "R";
    // hind
    const hindPts = limb(P(s * 0.085, 0.2, -0.2), P(s * 0.115, 0.023, -0.13), [0.11, 0.1, 0.05], [[0, 0, 1]], {
      sole: [0, 0, 1],
    });
    const hind = b.chain(`legH${L}`, hindPts, {
      parent: hips,
      names: [`hipH${L}`, `kneeH${L}`, `ankleH${L}`, `footH${L}`],
      role: "leg",
      group: "legs",
      contact: [s * 0.115, TOP, -0.14],
    });
    b.sweep(hind, [0.058, 0.045, 0.034, 0.031], { color: LEG, name: `legH${L}`, group: "legs" });
    // fore
    const forePts = limb(P(s * 0.095, 0.225, 0.11), P(s * 0.125, 0.023, 0.23), [0.125, 0.105, 0.05], [[0, 0, -1]], {
      sole: [0, 0, 1],
    });
    const fore = b.chain(`legF${L}`, forePts, {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `handF${L}`],
      role: "arm",
      group: "legs",
    });
    b.sweep(fore, [0.052, 0.04, 0.032, 0.03], { color: LEG, name: `legF${L}`, group: "legs" });
    legData.push({ side: `H${L}`, foot: [hind.tip!.at, hind.joints[2].at] });
    legData.push({ side: `F${L}`, foot: [fore.tip!.at, fore.joints[2].at] });
    for (const [chain, tag] of [
      [hind, `H${L}`],
      [fore, `F${L}`],
    ] as const) {
      const tip = chain.tip!;
      const heel = chain.joints[2];
      const ball = tip.at;
      // paw
      b.part(new THREE.SphereGeometry(1, 8, 6), PAW, {
        bone: heel,
        at: [ball.x, TOP + 0.021, ball.z - 0.028],
        scale: [0.037, 0.024, 0.052],
        name: `paw${tag}`,
        group: "legs",
      });
      // fluffy cuff
      b.cards(
        [0, 1, 2, 3, 4].map((i) => frame([ball.x + (i - 2) * 0.012, TOP + 0.034, ball.z - 0.05], [0, 1, 0])),
        TUFT,
        { size: [0.022, 0.03], lean: 100, flow: [0, 0, -1], color: CHOC, bone: heel },
      );
      // toes + claws
      for (let i = 0; i < 4; i++) {
        const dx = (i - 1.5) * 0.0165;
        const base = new THREE.Vector3(ball.x + dx, TOP + 0.014, ball.z + 0.008);
        const toeTip = new THREE.Vector3(ball.x + dx * 1.35, TOP + 0.011, ball.z + 0.042 - Math.abs(i - 1.5) * 0.005);
        const toe = b.joint(`toe${i + 1}${tag}`, { parent: tip, at: base, aim: toeTip, role: "digit", group: "legs" });
        b.capsule(base, toeTip, [0.0115, 0.01], PAW, { bone: toe, sides: 6, group: "legs" });
        b.spike(toeTip, offset(toeTip, [dx * 2, -0.25, 1], 0.012).sub(toeTip), 1, 0.004, {
          color: CLAW,
          bone: toe,
          sides: 5,
          group: "legs",
        });
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Head
  const HC = head.local({ forward: 0.072, up: 0.012 });
  const skullPaint = cel(
    paint((p) => {
      const dy = p.y - HC.y;
      const edge = 0.01 + 0.012 * zigzag(Math.abs(p.x) / 0.016);
      const front = p.z > HC.z - 0.04 + 0.012 * zigzag(dy / 0.018);
      return dy < edge && front ? CREAM : RUST;
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), skullPaint, {
    bone: head,
    at: HC,
    scale: [0.09, 0.073, 0.08],
    name: "skull",
    group: "head",
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 12, 8), CREAM_C, {
    bone: head,
    at: head.local({ forward: 0.133, up: -0.026 }),
    scale: [0.038, 0.029, 0.04],
    name: "muzzle",
    group: "head",
  });
  for (const s of sides) {
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM_C, {
      bone: head,
      at: head.local({ left: s * 0.07, forward: 0.07, up: -0.026 }),
      scale: [0.035, 0.032, 0.05],
      group: "head",
    });
    // cheek ruff
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.35;
      const from = head.local({ left: s * 0.095, forward: 0.065 + a * 0.02, up: -0.02 - i * 0.002 });
      b.spike(from, head.dir([-s * 1, -0.45 - a * 0.5, -0.4 + i * 0.05]), 0.05 - Math.abs(a) * 0.015, 0.016, {
        color: CREAM_C,
        bone: head,
        sides: 5,
        group: "head",
      });
    }
  }
  // nose, bridge, mouth
  b.part(new THREE.SphereGeometry(1, 8, 6), cel(NOSE, INK), {
    bone: head,
    at: head.local({ forward: 0.171, up: -0.014 }),
    scale: [0.0165, 0.012, 0.012],
    name: "nose",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#ffffff", {
    bone: head,
    at: head.local({ forward: 0.172, up: -0.006, left: 0.005 }),
    scale: [0.004, 0.003, 0.003],
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.09, up: -0.04 }),
    aim: head.local({ forward: 0.17, up: -0.046 }),
    role: "jaw",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM_C, {
    bone: jaw,
    at: head.local({ forward: 0.138, up: -0.048 }),
    scale: [0.03, 0.015, 0.038],
    name: "lowerJaw",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), cel(MOUTH), {
    bone: jaw,
    at: head.local({ forward: 0.138, up: -0.041 }),
    scale: [0.025, 0.007, 0.032],
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), cel(TONGUE), {
    bone: jaw,
    at: head.local({ forward: 0.143, up: -0.04 }),
    scale: [0.014, 0.006, 0.022],
    group: "head",
  });
  for (const s of sides) {
    b.spike(head.local({ left: s * 0.012, forward: 0.158, up: -0.043 }), [0, -1, 0], 0.012, 0.0045, {
      color: "#ffffff",
      bone: head,
      sides: 5,
      caps: { start: "flat", end: "point" },
      group: "head",
    });
    b.spike(head.local({ left: s * 0.011, forward: 0.155, up: -0.057 }), [0, 1, 0], 0.011, 0.004, {
      color: "#ffffff",
      bone: jaw,
      sides: 5,
      group: "head",
    });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod(
        head.local({ left: s * 0.032, forward: 0.15, up: -0.022 - k * 0.006 }),
        head.local({ left: s * (0.1 + k * 0.006), forward: 0.1, up: -0.03 - k * 0.022 }),
        0.0012,
        CREAM,
        { bone: head, sides: 4, group: "head" },
      );
  }
  // eyes + face marks (decals)
  const skin = b.surface(skull);
  const faceSkin = b.surface([skull, muzzle]);
  b.decal(faceSkin, FACE, {
    at: head.local({ forward: 0.15, up: 0.0 }),
    dir: [0, 0, 1],
    size: [0.17, 0.102],
    segments: 20,
    lift: 0.0015,
    name: "faceMarks",
  });
  const EYE = animeEye({ iris: "#3fe0a2", blush: "#ff9a86", brow: false, size: 384 });
  for (const s of sides) {
    const hit = skin.around(HC).at(s * 37, 2);
    if (hit)
      b.decal(skin, EYE, { at: hit, size: [0.046, 0.063], mirror: s > 0, lift: 0.003, segments: 14, name: `eye${s > 0 ? "L" : "R"}` });
  }
  // ears
  const EAR_OUTLINE: [number, number][] = [
    [-0.04, 0],
    [0.04, 0],
    [0.043, 0.032],
    [0, 0.08],
    [-0.043, 0.032],
  ];
  const EAR_IN: [number, number][] = [
    [-0.027, 0.004],
    [0.027, 0.004],
    [0.03, 0.028],
    [0, 0.062],
    [-0.03, 0.028],
  ];
  for (const s of sides) {
    const L = s > 0 ? "L" : "R";
    const earBase = head.local({ left: s * 0.056, forward: 0.045, up: 0.052 });
    const ear = b.joint(`ear${L}`, {
      parent: head,
      at: earBase,
      dir: [s * 0.55, 1, 0.1],
      role: "hinge",
      group: "head",
    });
    const outer = b.extrude(EAR_OUTLINE, {
      at: earBase,
      x: [1, 0, 0],
      y: [s * 0.55, 1, 0.1],
      thickness: 0.018,
      bevel: 0.005,
      smoothing: 1,
      color: EAR_OUT,
      bone: ear,
      name: `ear${L}`,
      group: "head",
    });
    b.extrude(EAR_IN, {
      at: outer.local([0, 0.001, 0.0075]),
      x: [1, 0, 0],
      y: [s * 0.55, 1, 0.1],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: CREAM_C,
      bone: ear,
      group: "head",
    });
    // inner fluff and a white rim tuft
    b.cards(
      [-0.016, -0.005, 0.006, 0.017].map((u) => frame(outer.local([u, 0.008, 0.012]), outer.dir([0, 0, 1]))),
      TUFT,
      { size: [0.016, 0.03], lean: 70, flow: outer.dir([0, 1, 0]), color: "#fffaf0", bone: ear },
    );
    if (s > 0) {
      // gold ear ring with a jade drop
      const ringAt = outer.local([0.036, 0.012, 0]);
      b.part(new THREE.TorusGeometry(0.013, 0.0024, 5, 14), GOLD_C, {
        bone: ear,
        at: ringAt,
        rotation: [0, 90, 20],
        group: "head",
      });
      b.part(new THREE.SphereGeometry(0.008, 6, 5), cel(JADE), {
        bone: ear,
        at: outer.local([0.04, -0.012, 0]),
        scale: [0.8, 1.35, 0.8],
        group: "head",
      });
    }
  }
  // glowing dendro sprout on the crown
  const crown = head.local({ forward: 0.06, up: 0.081 });
  b.sweep(bezier(crown, offset(crown, [0.1, 1, 0], 0.025), offset(crown, [0, 1, 0.1], 0.05)), [0.0035, 0.0025], {
    color: cel(MOSS_D),
    bone: head,
    sides: 5,
    group: "head",
  });
  const sproutTop = offset(crown, [0, 1, 0.1], 0.05);
  const LEAF: [number, number][] = [
    [0, 0],
    [0.014, 0.008],
    [0.026, 0.026],
    [0.012, 0.046],
    [-0.004, 0.036],
  ];
  for (const s of sides)
    glow(
      b.extrude(LEAF, {
        at: sproutTop,
        x: [s, 0.1, 0],
        y: [s * 0.6, 0.8, 0.25],
        thickness: 0.004,
        smoothing: 2,
        color: JADE,
        bone: head,
        group: "head",
      }),
    );

  // ------------------------------------------------------------------------------------------------------------
  // Scarf, medallion, tassel
  const neckPt = neck.at(0.35);
  const scarf = bodySkin.loop(neckPt, { lift: 0.012 });
  b.sweep(scarf, 0.02, { color: TEAL_C, bone: neck, name: "scarf", group: "trim" });
  for (const dt of [-0.055, 0.055]) {
    const trim = bodySkin.loop(neck.at(0.35 + dt), { lift: 0.02 });
    b.sweep(trim, 0.0045, { color: GOLD_C, bone: neck, sides: 6, group: "trim" });
  }
  const front = scarf.at(scarf.closestT(offset(neckPt.at, [0, -0.4, 1], 0.08)));
  const medalC = offset(front, [0, -1, 0.25], 0.034);
  const medalDir = [0, -0.12, 1];
  b.part(new THREE.CircleGeometry(0.024, 18), "#ffffff", {
    bone: neck,
    at: offset(medalC, medalDir, 0.0125),
    dir: medalDir,
    axis: "z",
    texture: MEDAL,
    group: "trim",
  });
  b.lathe(
    [
      [0, 0],
      [0.027, 0],
      [0.029, 0.004],
      [0.027, 0.009],
      [0.02, 0.0115],
      [0, 0.0115],
    ],
    { at: offset(medalC, medalDir, -0.003), axis: medalDir, color: GOLD_C, bone: neck, segments: 14, group: "trim" },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.0075, 6, 5), JADE, {
      bone: neck,
      at: offset(medalC, medalDir, 0.0135),
      group: "trim",
    }),
  );
  const tasselTop = offset(medalC, [0, -1, 0], 0.03);
  b.part(new THREE.SphereGeometry(0.007, 6, 5), GOLD_C, { bone: neck, at: tasselTop, group: "trim" });
  b.cards([frame(offset(tasselTop, [0, -1, 0], 0.003), [0, 1, 0])], TASSEL, {
    size: [0.034, 0.075],
    lean: 180,
    flow: [0, 0, 1],
    cross: true,
    bone: neck,
  });

  // ------------------------------------------------------------------------------------------------------------
  // Fur on body
  const bodyHits = bodySkin.scatter(180, { rng: rng(21), minDist: 0.034, filter: (h) => h.n.y > -0.35 });
  b.cards(bodyHits, TUFT, { size: [0.036, 0.055], lean: 72, bend: 20, vary: 0.25, rng: rng(22), color: COAT, flow: [0, -0.2, -1] });
  const chestHits = bodySkin.scatter(40, {
    rng: rng(23),
    minDist: 0.03,
    filter: (h) => h.at.z > 0.12 && h.n.y < 0.25 && h.n.y > -0.4,
  });
  b.cards(chestHits, TUFT, { size: [0.03, 0.05], lean: 70, vary: 0.2, rng: rng(24), color: CHOC, flow: [0, -0.5, -1] });

  // ------------------------------------------------------------------------------------------------------------
  // Moss tufts, flowers, grass
  const mossHits = stoneSkin.scatter(80, {
    rng: rng(31),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.15 && (Math.abs(h.at.x) > 0.17 || h.at.z > 0.29 || h.at.z < -0.26 || h.at.y < TOP - 0.03),
  });
  b.cards(mossHits, GRASS, { size: [0.07, 0.06], vary: 0.3, rng: rng(32), cross: true, spin: 180, bone: hips });
  const flowerHits = stoneSkin.scatter(7, {
    rng: rng(41),
    minDist: 0.14,
    filter: (h) => h.n.y > 0.5 && (Math.abs(h.at.x) > 0.17 || h.at.z > 0.3 || h.at.z < -0.28),
  });
  b.cards(flowerHits, FLOWER, { size: [0.045, 0.07], vary: 0.2, rng: rng(42), cross: true, bone: hips });
  const groundFrames: THREE.Vector3[] = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + rand() * 0.2;
    const rr = 1 + rand() * 0.14;
    groundFrames.push(new THREE.Vector3(Math.sin(a) * 0.31 * rr, 0, Math.cos(a) * 0.46 * rr));
  }
  b.cards(
    groundFrames.map((p) => frame(p, [0, 1, 0])),
    GRASS,
    { size: [0.09, 0.075], vary: 0.3, rng: rng(51), cross: true, spin: 180, bone: hips },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Spore sparkles
  const sparkPts: number[][] = [
    [0.28, 0.5, 0.2],
    [-0.3, 0.52, 0.12],
    [0.2, 0.74, -0.2],
    [-0.22, 0.7, 0.28],
    [0.36, 0.34, -0.2],
    [-0.35, 0.42, -0.25],
    [0.12, 0.84, 0.15],
    [-0.12, 0.8, -0.05],
    [0.3, 0.78, 0.05],
    [-0.04, 0.58, 0.5],
    [0.2, 0.46, 0.42],
    [-0.28, 0.3, 0.38],
    [0.38, 0.6, -0.32],
    [-0.4, 0.62, -0.1],
  ];
  const sparkFrames = sparkPts.map((p) => frame(p, [0, 1, 0]));
  glow(
    b.cards(sparkFrames.filter((_, i) => i % 2 === 0), SPARK, {
      size: 0.05,
      lean: 0,
      cross: true,
      vary: 0.4,
      rng: rng(61),
      flow: [0.3, 0, 1],
      sink: 0,
      bone: hips,
    }),
    1.4,
  );
  glow(
    b.cards(sparkFrames.filter((_, i) => i % 2 === 1), SPARK_GOLD, {
      size: 0.045,
      cross: true,
      vary: 0.4,
      rng: rng(62),
      flow: [0.3, 0, 1],
      sink: 0,
      bone: hips,
    }),
    1.4,
  );

  // rest pose: a slightly parted jaw
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  void legData;
  return b.root;
}
