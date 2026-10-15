import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { frame } from "../../../../src/frame";
import { mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda balancing on a moss-covered boulder, ringed tail raised for balance, gold anklet and collar, and dendro seed sprites drifting around it.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------- palette ----------
const RUST = cel("#d9561f", "#a8341f");
const RUSTLIGHT = cel("#f08a3a", "#c9532a");
const DARKLEG = cel("#3a2024", "#241218");
const CREAM = cel("#fff1d6", "#e8c9b0");
const CREAMTAIL = cel("#f6c58a", "#d9946a");
const NOSE = cel("#2a1a28", INK);
const STONE = cel("#9a9fa6", "#6c7288");
const STONEDARK = cel("#7c828c", "#565c74");
const MOSS = cel("#6fbf3f", "#3f8a3a");
const MOSSLIGHT = cel("#a6e05a", "#5fae48");
const GOLD = "#f2c14e";
const TEAL = "#2fd3b8";
const CORAL = "#e0415a";
const LEAFGLOW = "#9dffb0";
const CLAW = "#e9d9c4";

// ---------- textures ----------
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 2 C22 18 28 40 26 62 L6 62 C4 40 10 18 16 2Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);
const MOSSBLADE = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 1 C24 20 30 42 28 63 L4 63 C2 42 8 20 16 1Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);
const LEAF = svg(
  `<svg viewBox="0 0 48 64"><path d="M24 2 C44 18 46 44 24 62 C2 44 4 18 24 2Z" fill="#ffffff"/><path d="M24 8 L24 60" stroke="#c8f0b0" stroke-width="3" fill="none"/></svg>`,
  { size: 96 },
);
const SEEDGLOW = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#4fe08a" opacity="0.6"/><circle cx="32" cy="32" r="20" fill="#9dffb0"/><circle cx="32" cy="32" r="11" fill="#e9ffd9"/><path d="M32 2 L35 29 L62 32 L35 35 L32 62 L29 35 L2 32 L29 29Z" fill="#e9ffd9"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#7dffa8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="26"/><path d="M32 12 C44 22 44 42 32 52 C20 42 20 22 32 12Z"/><path d="M32 18 L32 48"/><path d="M32 32 L42 26 M32 38 L22 32"/></g></svg>`,
  { size: 192 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 64 24"><g fill="none" stroke="#fff2a8" stroke-width="3" stroke-linecap="round"><path d="M2 12 C10 2 18 2 24 12 C30 22 38 22 44 12 C50 2 58 2 62 12"/></g><circle cx="12" cy="12" r="3" fill="#fff2a8"/><circle cx="32" cy="12" r="3" fill="#fff2a8"/><circle cx="52" cy="12" r="3" fill="#fff2a8"/></svg>`,
  { size: 192 },
);
const EYE = animeEye({ iris: "#c2661a", irisLight: "#ffc25a", irisDark: "#5c2412", blush: false });

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda", detail: 1, paintSize: 2048 });
  const R = rng(11);

  // =====================================================
  // MOSSY STONE (top of moss at TOP)
  // =====================================================
  const stonePaint = paint((p, n) => {
    const m = noise(p, 0.07, 3) * 0.6 + noise(p, 0.025, 8) * 0.4;
    const moss = n.y > 0.35 - m * 0.55 + (p.y > 0.12 ? -0.1 : 0.12);
    if (moss) return m > 0.55 ? MOSSLIGHT : MOSS;
    return m > 0.5 ? STONE : STONEDARK;
  });

  b.part(new THREE.IcosahedronGeometry(1, 1), stonePaint, {
    at: [0, 0.095, -0.02],
    scale: [0.27, 0.115, 0.23],
    rotation: [0, 20, 0],
  });
  const lobes: Array<[number, number, number, number, number, number]> = [
    [0.16, 0.06, 0.1, 0.12, 0.07, 0.1],
    [-0.17, 0.065, 0.06, 0.13, 0.08, 0.1],
    [0.05, 0.055, -0.17, 0.15, 0.07, 0.09],
    [-0.1, 0.05, -0.14, 0.1, 0.06, 0.08],
    [0.02, 0.05, 0.19, 0.11, 0.06, 0.07],
    [0.2, 0.05, -0.08, 0.09, 0.06, 0.08],
  ];
  for (const [x, y, z, sx, sy, sz] of lobes) {
    b.part(new THREE.IcosahedronGeometry(1, 0), stonePaint, {
      at: [x, y, z],
      scale: [sx, sy, sz],
      rotation: [R() * 40, R() * 90, R() * 30],
    });
  }
  // pebbles around the base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    const r = 0.28 + R() * 0.05;
    const s = 0.018 + R() * 0.02;
    b.part(new THREE.IcosahedronGeometry(1, 0), stonePaint, {
      at: [Math.cos(a) * r, s * 0.6, Math.sin(a) * r * 0.85 - 0.02],
      scale: [s * 1.3, s, s * 1.1],
      rotation: [R() * 60, R() * 90, 0],
    });
  }
  // moss cap on top
  const mossCap = b.part(
    new THREE.IcosahedronGeometry(1, 1),
    cel(mottle("#6fbf3f", "#a6e05a", { size: 0.05, seed: 5, contrast: 0.9 })),
    { at: [0.0, 0.195, -0.02], scale: [0.2, 0.026, 0.17], rotation: [0, 10, 0] },
  );
  // moss pads on flanks
  const mossPads: Array<[number, number, number, number]> = [
    [-0.2, 0.13, 0.1, 0.05],
    [0.22, 0.11, -0.04, 0.045],
    [-0.1, 0.1, -0.2, 0.05],
    [0.12, 0.09, 0.2, 0.04],
    [0.0, 0.07, 0.24, 0.04],
  ];
  const padParts: THREE.BufferGeometry[] = [];
  void padParts;
  for (const [x, y, z, r] of mossPads) {
    b.part(
      new THREE.IcosahedronGeometry(1, 0),
      cel(mottle("#5fae48", "#a6e05a", { size: 0.03, seed: 9 })),
      { at: [x, y, z], scale: [r, r * 0.55, r], rotation: [R() * 30, R() * 90, 0] },
    );
  }
  // moss blade cards on the moss cap
  const capSurf = b.surface(mossCap);
  const mossHits = capSurf.scatter(160, { rng: rng(21), minDist: 0.02 });
  b.cards(mossHits, MOSSBLADE, {
    size: [0.016, 0.035],
    lean: 25,
    bend: 25,
    vary: 0.4,
    spin: 180,
    rng: rng(22),
    color: "#78c640",
    cross: true,
    detail: 0.6,
  });
  // moss blade cards hand-placed at the rim and flanks
  const rimFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rr = 0.2 + R() * 0.07;
    rimFrames.push(frame([Math.cos(a) * rr, 0.12 + R() * 0.05, Math.sin(a) * rr * 0.82 - 0.02], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5]));
  }
  b.cards(rimFrames, MOSSBLADE, {
    size: [0.018, 0.04],
    lean: 40,
    bend: 25,
    vary: 0.4,
    spin: 180,
    rng: rng(23),
    color: "#5fae48",
    cross: true,
    detail: 0.6,
  });
  // tiny flowers on the moss
  const flowerSpots: Array<[number, number]> = [
    [0.08, 0.05],
    [-0.1, -0.06],
    [0.12, -0.1],
    [-0.14, 0.04],
    [0.0, -0.12],
    [0.15, 0.08],
  ];
  for (const [x, z] of flowerSpots) {
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.016, 4), "#4f9a3a", { at: [x, 0.213, z] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#fff5c8", { at: [x, 0.225, z], scale: [1.3, 0.6, 1.3] });
    b.part(new THREE.SphereGeometry(0.004, 5, 4), GOLD, { at: [x, 0.228, z] });
  }
  // glowing rune plate on the stone front
  glow(
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      at: [0.0, 0.1, 0.245],
      dir: [0, 0.15, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.1,
  );

  // =====================================================
  // RED PANDA
  // =====================================================
  const TOP = 0.205; // standing height on the moss

  const bodyCoat = cel(furEdge(RUST, CREAMTAIL, { level: -0.35, teeth: 0.2, period: 0.026, ink: INK, inkWidth: 0.03 }));
  const LEG_FUR = furEdge(RUST, DARKLEG, {
    by: "position",
    axis: [0, 1, 0],
    level: TOP + 0.14,
    teeth: 0.03,
    period: 0.024,
    along: [1, 0, 0],
    ink: INK,
    inkWidth: 0.003,
  });

  // --- body ---
  const body = b.loft(
    [
      { at: [0, TOP + 0.16, -0.17], w: 0.12, h: 0.12 },
      { at: [0, TOP + 0.175, -0.07], w: 0.15, h: 0.15 },
      { at: [0, TOP + 0.18, 0.04], w: 0.145, h: 0.15 },
      { at: [0, TOP + 0.2, 0.12], w: 0.115, h: 0.125 },
    ],
    { color: bodyCoat, caps: "round" },
  );
  // chest / belly fluff
  b.part(
    new THREE.IcosahedronGeometry(1, 1),
    cel(furEdge(CREAMTAIL, RUST, { axis: [0, -1, 0], level: 0.1, teeth: 0.2, period: 0.02, along: [1, 0, 0] })),
    { at: [0, TOP + 0.12, 0.03], scale: [0.075, 0.05, 0.1] },
  );
  // back saddle (lighter rust)
  b.part(new THREE.IcosahedronGeometry(1, 1), RUSTLIGHT, {
    at: [0, TOP + 0.255, -0.04],
    scale: [0.09, 0.03, 0.13],
  });
  // rump
  b.part(new THREE.IcosahedronGeometry(1, 1), bodyCoat, {
    at: [0, TOP + 0.17, -0.18],
    scale: [0.11, 0.1, 0.09],
  });

  // --- hind legs ---
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(1, 1), bodyCoat, {
      at: [s * 0.085, TOP + 0.115, -0.15],
      scale: [0.055, 0.075, 0.09],
    });
    b.capsule([s * 0.085, TOP + 0.1, -0.15], [s * 0.08, TOP + 0.03, -0.1], [0.04, 0.03], { color: LEG_FUR });
    b.part(new THREE.IcosahedronGeometry(1, 1), DARKLEG, {
      at: [s * 0.08, TOP + 0.015, -0.07],
      scale: [0.032, 0.022, 0.06],
    });
    for (let t = -1; t <= 1; t++) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), DARKLEG, { at: [s * 0.08 + t * 0.017, TOP + 0.01, -0.012 + (t === 0 ? 0.008 : 0)] });
      b.spike([s * 0.08 + t * 0.017, TOP + 0.008, -0.005], [0, -0.2, 1], 0.014, 0.003, CLAW, { sides: 5 });
    }
  }
  // --- front legs: left (+x) planted, right (-x) raised for balance ---
  b.capsule([0.07, TOP + 0.13, 0.1], [0.075, TOP + 0.04, 0.16], [0.032, 0.026], { color: LEG_FUR });
  b.part(new THREE.IcosahedronGeometry(1, 1), DARKLEG, { at: [0.075, TOP + 0.015, 0.175], scale: [0.03, 0.02, 0.045] });
  for (let t = -1; t <= 1; t++) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), DARKLEG, { at: [0.075 + t * 0.014, TOP + 0.01, 0.215] });
    b.spike([0.075 + t * 0.014, TOP + 0.008, 0.22], [0, -0.15, 1], 0.012, 0.0025, CLAW, { sides: 5 });
  }
  b.capsule([-0.07, TOP + 0.15, 0.1], [-0.15, TOP + 0.2, 0.17], [0.032, 0.026], { color: LEG_FUR });
  b.part(new THREE.IcosahedronGeometry(1, 1), DARKLEG, {
    at: [-0.175, TOP + 0.215, 0.19],
    scale: [0.032, 0.028, 0.04],
    rotation: [-20, -30, 20],
  });
  for (let t = -1; t <= 1; t++) {
    b.spike([-0.185 + t * 0.003, TOP + 0.225 + t * 0.012, 0.215], [-0.5, 0.3, 1], 0.014, 0.0028, CLAW, { sides: 5 });
  }

  // gold anklet on planted left foreleg
  b.sweep(
    catmull(
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return [0.074 + Math.cos(a) * 0.033, TOP + 0.06, 0.15 + Math.sin(a) * 0.033];
      }),
      { closed: true },
    ),
    0.0042,
    GOLD,
    { sides: 5 },
  );
  glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), "#7dffa8", { at: [0.074, TOP + 0.055, 0.186] }), 1.2);
  for (let i = 0; i < 3; i++) {
    b.rod([0.1 + i * 0.006, TOP + 0.055, 0.15 + (i - 1) * 0.012], [0.104 + i * 0.006, TOP + 0.022 - i * 0.003, 0.15 + (i - 1) * 0.012], 0.0016, CORAL);
  }

  // --- neck & head ---
  const HEAD: [number, number, number] = [0, TOP + 0.31, 0.2];
  b.capsule([0, TOP + 0.2, 0.1], [0, TOP + 0.28, 0.17], [0.07, 0.065], { color: bodyCoat });
  const skull = b.part(
    new THREE.IcosahedronGeometry(1, 2),
    cel(
      furEdge(RUST, CREAM, {
        by: "position",
        axis: [0, 1, 0],
        level: HEAD[1] - 0.035,
        teeth: 0.014,
        period: 0.02,
        along: [1, 0, 0],
        ink: INK,
        inkWidth: 0.0025,
      }),
    ),
    { at: HEAD, scale: [0.098, 0.075, 0.082] },
  );
  // cheek fluff
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(1, 1), CREAM, {
      at: [s * 0.085, HEAD[1] - 0.025, HEAD[2] + 0.015],
      scale: [0.032, 0.036, 0.04],
      rotation: [0, s * 20, s * 20],
    });
    b.cards([frame([s * 0.1, HEAD[1] - 0.025, HEAD[2] + 0.01], [s, -0.2, 0.1])], TUFT, {
      size: [0.04, 0.045],
      lean: 40,
      flow: [s * 0.4, -1, 0.4],
      color: "#fff1d6",
      cross: true,
    });
  }
  // tufts on the skull via scatter on the skull surface
  const skullSurf = b.surface(skull);
  const skullHits = skullSurf.scatter(90, { rng: rng(41), minDist: 0.018 });
  b.cards(skullHits, TUFT, {
    size: [0.015, 0.025],
    lean: 55,
    flow: [0, -0.4, -1],
    bend: 15,
    vary: 0.3,
    rng: rng(42),
    color: "#e86f2a",
  });

  // muzzle
  b.part(new THREE.IcosahedronGeometry(1, 1), cel(inkLines(CREAM, { levels: [0.25], axis: [0, 0, 1] })), {
    at: [0, HEAD[1] - 0.022, HEAD[2] + 0.07],
    scale: [0.04, 0.032, 0.04],
  });
  b.part(new THREE.IcosahedronGeometry(1, 1), NOSE, { at: [0, HEAD[1] - 0.008, HEAD[2] + 0.108], scale: [0.017, 0.012, 0.012] });
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", { at: [0.005, HEAD[1] - 0.003, HEAD[2] + 0.118] });
  // mouth
  b.sweep(
    catmull([
      [0, HEAD[1] - 0.02, HEAD[2] + 0.115],
      [0, HEAD[1] - 0.034, HEAD[2] + 0.113],
      [0.012, HEAD[1] - 0.042, HEAD[2] + 0.1],
      [0.024, HEAD[1] - 0.04, HEAD[2] + 0.088],
    ]),
    0.0013,
    INK,
    { sides: 4, caps: "round" },
  );
  b.sweep(
    catmull([
      [0, HEAD[1] - 0.034, HEAD[2] + 0.113],
      [-0.012, HEAD[1] - 0.042, HEAD[2] + 0.1],
      [-0.024, HEAD[1] - 0.04, HEAD[2] + 0.088],
    ]),
    0.0013,
    INK,
    { sides: 4, caps: "round" },
  );
  b.part(new THREE.SphereGeometry(0.008, 6, 4), CORAL, { at: [0.004, HEAD[1] - 0.04, HEAD[2] + 0.1], scale: [1, 0.5, 1.2] });

  // tear-mark stripes under the eyes
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.035, HEAD[1] - 0.012, HEAD[2] + 0.07],
        [s * 0.05, HEAD[1] - 0.03, HEAD[2] + 0.062],
        [s * 0.062, HEAD[1] - 0.052, HEAD[2] + 0.045],
      ]),
      [0.0045, 0.002],
      "#8a2e1a",
      { sides: 4, caps: "round" },
    );
  }

  // eyes (decals)
  for (const s of [1, -1]) {
    const hit = skullSurf.around(HEAD).at(s * 30, 8);
    if (hit) {
      b.decal(skullSurf, EYE, { at: hit, size: [0.04, 0.054], mirror: s > 0 });
    }
  }

  // ears
  for (const s of [1, -1]) {
    const earOuter: Array<[number, number] | [number, number, "sharp"]> = [
      [-0.03, 0],
      [0.03, 0],
      [0.036, 0.034],
      [0.0, 0.058, "sharp"],
      [-0.034, 0.032],
    ];
    b.extrude(earOuter, {
      at: [s * 0.065, HEAD[1] + 0.055, HEAD[2] - 0.005],
      x: [s, 0, 0],
      y: [s * 0.35, 1, 0.25],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: RUST,
    });
    const earIn: Array<[number, number]> = [
      [-0.02, 0.004],
      [0.02, 0.004],
      [0.022, 0.025],
      [0.0, 0.044],
      [-0.022, 0.024],
    ];
    b.extrude(earIn, {
      at: [s * 0.065 + s * 0.002, HEAD[1] + 0.055, HEAD[2] + 0.002],
      x: [s, 0, 0],
      y: [s * 0.35, 1, 0.25],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: CREAM,
    });
  }

  // white brow spots
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#fff6e6", {
      at: [s * 0.04, HEAD[1] + 0.04, HEAD[2] + 0.062],
      scale: [1.2, 0.8, 0.6],
    });
  }
  // whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.sweep(
        catmull([
          [s * 0.03, HEAD[1] - 0.024 - i * 0.004, HEAD[2] + 0.09],
          [s * 0.07, HEAD[1] - 0.018 - i * 0.012, HEAD[2] + 0.105],
          [s * 0.105, HEAD[1] - 0.02 - i * 0.022, HEAD[2] + 0.098],
        ]),
        0.0007,
        "#fff9ea",
        { sides: 3, caps: "round" },
      );
    }
  }

  // gold chest clasp, on the body surface
  const chestHit = b.surface(body).around([0, TOP + 0.16, 0.1]).at(0, -20);
  if (chestHit) {
    b.stick(new THREE.SphereGeometry(0.014, 6, 5), GOLD, chestHit);
  }
  // gold collar ring
  b.sweep(
    catmull(
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return [Math.cos(a) * 0.072, TOP + 0.235 + Math.sin(a) * 0.008, 0.135 + Math.sin(a) * 0.065];
      }),
      { closed: true },
    ),
    0.0045,
    GOLD,
    { sides: 5 },
  );
  // leaf charm
  b.cards([frame([0, TOP + 0.226, 0.2], [0, 0.3, 1])], LEAF, {
    size: [0.03, 0.04],
    lean: 80,
    flow: [0, -1, 0.3],
    color: "#6fe08a",
  });
  glow(b.part(new THREE.OctahedronGeometry(0.012), "#9dffb0", { at: [0, TOP + 0.222, 0.205], scale: [0.7, 1.1, 0.5] }), 1.4);

  // teal ribbon ends at the collar
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0.0, TOP + 0.23, 0.2],
        [s * 0.03, TOP + 0.215, 0.215],
        [s * 0.05, TOP + 0.2, 0.2],
      ]),
      0.005,
      TEAL,
      { sides: 4 },
    );
  }

  // =====================================================
  // TAIL: long bushy, ringed, raised in an S-curve
  // =====================================================
  const tailPath = catmull([
    [0, TOP + 0.17, -0.25],
    [0.0, TOP + 0.2, -0.36],
    [-0.03, TOP + 0.3, -0.45],
    [-0.07, TOP + 0.44, -0.48],
    [-0.06, TOP + 0.56, -0.43],
    [-0.02, TOP + 0.62, -0.34],
  ]);
  const tailRadius = (t: number): number => 0.04 + 0.05 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.9) * (1 - t * 0.35);
  const tailPaint = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.94) return CREAMTAIL;
      return Math.floor(t * 14) % 2 === 0 ? RUST : CREAMTAIL;
    }),
  );
  b.sweep(tailPath, tailRadius, { color: tailPaint, sides: 8, caps: "round" });
  // dark tip
  b.part(new THREE.IcosahedronGeometry(1, 1), cel("#5a2a25", "#3c1a1c"), {
    at: tailPath.at(0.995),
    scale: [0.032, 0.036, 0.032],
  });
  // fur tufts around the tail
  const tailFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 40; i++) {
    const t = 0.1 + (i / 40) * 0.86;
    const pt = tailPath.at(t);
    const tan = tailPath.tangentAt(t);
    const a = i * 2.4;
    const rr = tailRadius(t) * 0.9;
    const nrm = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.3).cross(tan).normalize();
    const p = pt.clone().add(nrm.clone().multiplyScalar(rr));
    tailFrames.push(frame(p, nrm));
  }
  b.cards(tailFrames, TUFT, {
    size: [0.02, 0.035],
    lean: 60,
    flow: [0, 0.3, -1],
    bend: 20,
    vary: 0.3,
    rng: rng(51),
    color: "#f6b078",
  });

  // tail gold ring with tassels
  const tr = tailPath.at(0.22);
  b.sweep(
    catmull(
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return [tr.x + Math.cos(a) * 0.052, tr.y + Math.sin(a) * 0.052, tr.z];
      }),
      { closed: true },
    ),
    0.004,
    GOLD,
    { sides: 5 },
  );
  for (let i = 0; i < 3; i++) {
    const a = Math.PI * (1.2 + i * 0.3);
    b.rod(
      [tr.x + Math.cos(a) * 0.052, tr.y + Math.sin(a) * 0.052, tr.z],
      [tr.x + Math.cos(a) * 0.056, tr.y + Math.sin(a) * 0.056 - 0.04, tr.z],
      0.0022,
      CORAL,
    );
    b.part(new THREE.SphereGeometry(0.005, 5, 4), GOLD, {
      at: [tr.x + Math.cos(a) * 0.056, tr.y + Math.sin(a) * 0.056 - 0.045, tr.z],
    });
  }

  // =====================================================
  // DENDRO SEED SPRITES (glowing, floating)
  // =====================================================
  const seeds: Array<[number, number, number, number]> = [
    [0.22, 0.52, 0.16, 0.05],
    [-0.3, 0.6, 0.12, 0.04],
    [0.28, 0.38, -0.18, 0.04],
    [-0.24, 0.42, -0.3, 0.035],
    [0.12, 0.72, 0.0, 0.035],
    [-0.1, 0.8, -0.2, 0.03],
  ];
  for (const [x, y, z, sz] of seeds) {
    glow(
      b.part(new THREE.PlaneGeometry(sz * 2, sz * 2), "#ffffff", { at: [x, y, z], dir: [0.3, 0.2, 1], axis: "z", texture: SEEDGLOW }),
      1.3,
    );
    glow(
      b.part(new THREE.PlaneGeometry(sz * 2, sz * 2), "#ffffff", { at: [x, y, z], dir: [1, 0.2, -0.3], axis: "z", texture: SEEDGLOW }),
      1.3,
    );
  }
  // floating leaves
  const leafFrames = [
    frame([0.18, 0.62, 0.08], [0, 1, 0]),
    frame([-0.2, 0.7, 0.18], [0, 1, 0]),
    frame([0.0, 0.88, -0.08], [0, 1, 0]),
    frame([0.3, 0.5, -0.05], [0, 1, 0]),
    frame([-0.32, 0.45, -0.1], [0, 1, 0]),
  ];
  glow(
    b.cards(leafFrames, LEAF, {
      size: [0.03, 0.045],
      lean: 50,
      flow: (_f, i) => [Math.cos(i * 2), 0.2, Math.sin(i * 2)],
      color: LEAFGLOW,
      cross: true,
      rng: rng(61),
      spin: 60,
    }),
    1.0,
  );

  // gold filigree pieces lying on the moss
  b.cards([frame([0.1, TOP + 0.003, 0.0], [0, 1, 0]), frame([-0.12, TOP + 0.003, -0.08], [0, 1, 0])], FILIGREE, {
    size: [0.05, 0.02],
    lean: 90,
    flow: [1, 0, 0.3],
    mirror: true,
  });

  return b.root;
}
