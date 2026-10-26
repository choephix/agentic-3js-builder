import * as THREE from "three";
import { type Builder, createBuilder, rng, catmull, bezier, spiral, paint, mix, noise } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pandoran Lumen Bloom",
  description:
    "Bioluminescent alien plant in the Avatar style: a tall indigo trunk with glowing rings, two tiers of drooping veined fronds, a magenta bell flower with glowing stamens, root bulbs and helicoradian spirals.",
};

export const REQUESTS = [
  {
    id: "bellStamens",
    kind: "add",
    part: "bell",
    what: "Dense cluster of fine glowing filaments rising from the bell's centre, each tipped with a small MAG or CYAN bead, plus a soft ring of tiny pollen dots on the inner rim.",
    at: [0, 1.75, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.3, 0.3, 0.3],
  },
  {
    id: "bellPetalTrim",
    kind: "add",
    part: "bell",
    what: "Eight small curled petal lips around the bell rim in BELL_IN, with a thin glowing CYAN edge line on each.",
    at: [0, 1.9, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 0.15, 0.5],
  },
  {
    id: "trunkBarkRidges",
    kind: "add",
    part: "trunk",
    what: "Vertical raised bark ridges and small knobbly nodes on the trunk in TRUNK_LIGHT, leaving the glow rings visible.",
    at: [0, 0.8, 0.12],
    normal: [0, 0, 1],
    bone: null,
    room: [0.35, 1.2, 0.2],
  },
  {
    id: "frondHangingTendrils",
    kind: "add",
    part: "frondLower",
    what: "Thin tendrils hanging from the tips of the lower fronds, each with three glowing GLOW_GREEN beads of falling size.",
    at: [1.35, 0.95, 0],
    normal: [0, -1, 0],
    bone: null,
    room: [0.4, 0.7, 0.4],
  },
  {
    id: "frondSideLobes",
    kind: "add",
    part: "frondUpper",
    what: "Small serrated side lobes along the edges of the upper fronds, graduating in size, in FROND_A with FROND_B tips.",
    at: [0.6, 1.95, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 0.2, 0.5],
  },
  {
    id: "rootBulbs",
    kind: "add",
    part: "root",
    what: "Clusters of small translucent glowing bulbs and little fungal caps along the roots near the ground, in CYAN and GLOW_GREEN.",
    at: [0.5, 0.05, 0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.15, 0.6],
  },
  {
    id: "spiralSeedPods",
    kind: "add",
    part: "helix",
    what: "Tiny feathery seed filaments fanning from the tip of each helicoradian spiral, in pale PINK_WHITE, each ending with a glow dot.",
    at: [0.9, 0.2, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.3, 0.3, 0.3],
  },
  {
    id: "baseMoss",
    kind: "add",
    part: "trunk",
    what: "Low glowing moss and small leaf sprouts hugging the trunk base where roots meet, in GLOW_GREEN and ROOT tones.",
    at: [0, 0.1, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.2, 0.6],
  },
  {
    id: "trunkBands",
    kind: "texture",
    part: "trunk",
    what: "Layered bioluminescent pattern: flowing wavy lines of CYAN and faint MAG running up the trunk like Pandoran veins, with fine speckles, on a TRUNK to TRUNK_LIGHT gradient.",
  },
  {
    id: "frondVeins",
    kind: "texture",
    part: "frondUpper",
    what: "Branching leaf veins glowing CYAN from the midrib outward, with FROND_A to FROND_B gradient toward the tips and tiny light freckles.",
  },
  {
    id: "bellGradient",
    kind: "texture",
    part: "bell",
    what: "Soft radial gradient from BELL_IN at the rim to BELL at the base, with thin MAG streaks running up the petal walls.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

// Palette
export const TRUNK = "#2a2a5e";
export const TRUNK_LIGHT = "#3f4f98";
export const FROND_A = "#1f7f86";
export const FROND_B = "#7a3fb0";
export const CYAN = "#3ff2ff";
export const MAG = "#ff4fd8";
export const GLOW_GREEN = "#7dffb0";
export const ROOT = "#241f4a";
export const BELL = "#a24bd6";
export const BELL_IN = "#ff9be8";
export const PINK_WHITE = "#ffe6f7";

const pt = (r: number, y: number, a: number): [number, number, number] => [Math.cos(a) * r, y, Math.sin(a) * r];

const hexRgb = (h: string): [number, number, number] => {
  const c = new THREE.Color(h);
  return [c.r, c.g, c.b];
};
const trunkPaint = paint((p, n, s) => {
  const h = Math.min(Math.max(p.y / 1.6, 0), 1);
  let c = mix(TRUNK, TRUNK_LIGHT, h * 0.7 + noise(p, 0.12, 3) * 0.3);
  const ang = s[1] * (Math.PI / 180);
  const w1 = Math.sin(ang * 3 + s[0] * 14 + Math.sin(s[0] * 30) * 0.8);
  const w2 = Math.sin(ang * 2 - s[0] * 9 + 2);
  if (Math.abs(w1) < 0.07) c = mix(c, CYAN, 0.95);
  else if (Math.abs(w1) < 0.16) c = mix(c, CYAN, 0.3);
  if (Math.abs(w2) < 0.05) c = mix(c, MAG, 0.55);
  if (noise(p, 0.02, 8) > 0.74) c = mix(c, GLOW_GREEN, 0.8);
  return c;
});
const frondPaint = paint((p, n, s) => {
  const t = s[0];
  let c = mix(FROND_A, FROND_B, Math.min(Math.max((t - 0.2) / 0.7, 0), 1));
  const ang = s[1];
  const d = Math.min(Math.abs(ang), Math.abs(ang - 180), Math.abs(ang + 180));
  const side = Math.abs(((ang + 360) % 180) - 90);
  const rib = n.y > 0.2 && (Math.abs(((ang + 540) % 360) - 180) > 168 || d < 8) && t < 0.97;
  const branch = Math.abs(((t * 22 + side / 40) % 1) - 0.5) < 0.07 && side < 70 && n.y > 0;
  if (rib) c = mix(c, CYAN, 0.95);
  else if (branch) c = mix(c, CYAN, 0.75);
  if (noise(p, 0.025, 5) > 0.76) c = mix(c, PINK_WHITE, 0.7);
  return c;
});
const bellPaint = paint((p, n, s) => {
  const t = Math.min(Math.max(s[0] / 0.31, 0), 1);
  let c = mix(BELL, BELL_IN, t * t);
  const streak = Math.abs(Math.sin(s[1] * (Math.PI / 180) * 5));
  if (streak < 0.12 && t > 0.1 && t < 0.97) c = mix(c, MAG, 0.85);
  return c;
});

export default function build() {
  const b = createBuilder({ name: "lumenBloom" });
  const R = rng(11);
  const orb = (p: number[], r: number, color: string, s = 1.2) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p as [number, number, number] }), s);

  // Trunk
  const rad = (t: number) => 0.2 - 0.14 * t + 0.02 * Math.sin(t * 9);
  const trunkPath = catmull([
    [0, 0, 0],
    [0.05, 0.5, 0.03],
    [-0.04, 1.1, -0.02],
    [0, 1.62, 0.03],
  ]);
  const trunk = b.sweep(trunkPath, rad, { color: trunkPaint, caps: { start: "flat", end: "round" }, sides: 10, name: "trunk" });

  // Glow rings
  for (let i = 1; i <= 6; i++) {
    const t = i / 7.4;
    const p = trunkPath.at(t);
    const d = trunkPath.tangentAt(t);
    glow(
      b.part(new THREE.TorusGeometry(rad(t) + 0.004, 0.011, 5, 14), i % 2 ? CYAN : GLOW_GREEN, {
        at: [p.x, p.y, p.z],
        dir: [d.x, d.y, d.z],
        axis: "z",
      }),
      1.3,
    );
  }
  // Glowing trunk spots
  const hits = b.surface(trunk).scatter(28, { rng: R, minDist: 0.09, filter: (h) => h.at.y > 0.15 });
  for (const h of hits) glow(b.stick(new THREE.SphereGeometry(0.018, 6, 4), R() > 0.5 ? CYAN : MAG, h, { embed: 0.4 }), 1.3);

  // Roots
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const len = 0.6 + R() * 0.25;
    const path = bezier(pt(0.05, 0.25, a), pt(len * 0.35, 0.28, a + 0.1), pt(len * 0.7, 0.2, a - 0.15), pt(len, 0.022, a));
    b.sweep(path, [0.09, 0.022], { color: ROOT, caps: { start: "none", end: "round" }, sides: 8, name: "root" });
    orb(pt(len * 0.62, 0.05, a + 0.05), 0.03 + R() * 0.02, i % 2 ? CYAN : GLOW_GREEN, 1.2);
  }

  // Fronds: two tiers
  const frond = (ring: number, y0: number, a: number, p1: number[], p2: number[], p3: number[], w: number, name: string, c1: string, c2: string) => {
    const path = bezier(pt(0.04, y0, a), p1 as any, p2 as any, p3 as any);
    b.sweep(path, (t) => [0.015 + w * Math.sin(Math.PI * Math.min(1, t * 1.04)), 0.012], {
      color: name === "frondUpper" ? frondPaint : (t: number) => (t < 0.55 ? c1 : c2),
      caps: { end: "point" },
      sides: 6,
      name,
    });
    const vein = bezier(
      pt(0.04, y0 + 0.016, a),
      [p1[0], p1[1] + 0.016, p1[2]],
      [p2[0], p2[1] + 0.016, p2[2]],
      [p3[0], p3[1] + 0.016, p3[2]],
    );
    glow(b.sweep(vein.slice(0.1, 0.95), [0.009, 0.004], { color: CYAN, sides: 4, name: "vein" }), 1.2);
    orb(p3, 0.028, ring % 2 ? MAG : CYAN, 1.5);
  };
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    frond(i, 1.52, a, pt(0.35, 2.0, a), pt(0.8, 2.05, a + 0.05), pt(1.1, 1.55, a + 0.1), 0.1, "frondUpper", FROND_A, FROND_B);
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.45;
    frond(i, 1.15, a, pt(0.5, 1.5, a), pt(1.0, 1.45, a - 0.05), pt(1.35, 0.95, a - 0.1), 0.13, "frondLower", FROND_B, FROND_A);
  }

  // Bell flower
  (
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.12, 0.1],
        [0.2, 0.26],
        [0.23, 0.31],
        [0.19, 0.3],
        [0.1, 0.16],
        [0.05, 0.06],
        [0, 0.05],
      ],
      { at: [0, 1.6, 0.03], color: bellPaint, segments: 10, name: "bell" },
    )
  );
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.012],
      [0, 0.012],
    ],
    { at: [0, 1.905, 0.03], color: BELL_IN, segments: 10, name: "bellRim" },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const top = [Math.cos(a) * 0.09, 2.08 + (i % 2) * 0.08, 0.03 + Math.sin(a) * 0.09];
    b.sweep([[0, 1.7, 0.03], [Math.cos(a) * 0.04, 1.9, 0.03 + Math.sin(a) * 0.04], top], 0.008, { color: BELL_IN, sides: 5, name: "stamen" });
    orb(top, 0.026, i % 2 ? MAG : CYAN, 1.6);
  }
  orb([0, 1.82, 0.03], 0.07, GLOW_GREEN, 1.5);

  // Helicoradian spirals
  for (let i = 0; i < 4; i++) {
    const a = 0.8 + i * 1.5;
    const c = pt(0.95 + R() * 0.25, 0.012, a);
    const from = [c[0] + 0.05, 0.012, c[2]];
    const path = spiral(c, from, [0, 1, 0], { turns: 2.2, r1: 0.012, pitch: 0.09 });
    b.sweep(path, [0.014, 0.006], { color: PINK_WHITE, sides: 5, name: "helix" });
    const e = path.at(1);
    orb([e.x, e.y + 0.01, e.z], 0.016, MAG, 1.5);
  }

  // Ground glow bulbs
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28;
    const r = 0.5 + R() * 1.0;
    const s = 0.025 + R() * 0.03;
    orb(pt(r, s * 0.9, a), s, R() > 0.5 ? GLOW_GREEN : CYAN, 1.1);
  }
  // Floating spores
  for (let i = 0; i < 8; i++) orb(pt(0.3 + R() * 1.0, 0.7 + R() * 1.6, R() * 6.28), 0.014, GLOW_GREEN, 1.6);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addBellStamens(b: Builder) {
  const R = rng(2024);
  const cx = 0, cz = 0.03;
  const baseY = 1.78;

  // Dense cluster of fine filaments rising from the bell centre
  const count = 22;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + R() * 0.3;
    const ring = i % 3; // three tiers: inner tall, middle, outer short
    const r0 = 0.015 + ring * 0.025 + R() * 0.01;
    const h = 0.26 - ring * 0.05 + R() * 0.07;
    const lean = 0.05 + ring * 0.05 + R() * 0.04;
    const x0 = cx + Math.cos(a) * r0;
    const z0 = cz + Math.sin(a) * r0;
    const mid: [number, number, number] = [
      x0 + Math.cos(a) * lean * 0.4,
      baseY + h * 0.55,
      z0 + Math.sin(a) * lean * 0.4,
    ];
    const tip: [number, number, number] = [
      x0 + Math.cos(a) * lean,
      baseY + h,
      z0 + Math.sin(a) * lean,
    ];
    const path = catmull([[x0, baseY - 0.02, z0], mid, tip]);
    b.sweep(path, [0.005, 0.0025], {
      color: i % 2 ? BELL_IN : PINK_WHITE,
      sides: 4,
      caps: { start: "none", end: "round" },
      name: "s21filament",
    });
    // glowing bead at the tip
    const bead = glow(
      b.part(new THREE.SphereGeometry(0.014 + R() * 0.008, 6, 4), i % 2 ? MAG : CYAN, { at: tip }),
      1.7,
    );
    void bead;
    // tiny secondary dot partway along a few filaments
    if (i % 4 === 0) {
      glow(
        b.part(new THREE.SphereGeometry(0.008, 5, 4), GLOW_GREEN, { at: mid }),
        1.5,
      );
    }
  }

  // Ring of pollen dots on the inner rim
  const dots = 24;
  const rimY = 1.9 + 0.012;
  for (let i = 0; i < dots; i++) {
    const a = (i / dots) * Math.PI * 2;
    const r = 0.19 + (i % 2) * 0.02;
    glow(
      b.part(new THREE.SphereGeometry(0.0085, 5, 4), i % 3 === 0 ? CYAN : PINK_WHITE, {
        at: [cx + Math.cos(a) * r, rimY + 0.004, cz + Math.sin(a) * r],
      }),
      1.4,
    );
  }

  // Soft central pistil collar
  glow(
    b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.03, 8), MAG, { at: [cx, baseY + 0.01, cz] }),
    0.9,
  );
}
    return addBellStamens;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBellPetalTrim(b: Builder) {
  const R = rng(77);
  const cx = 0, cy = 1.9, cz = 0.03; // rim centre (bell lathe at z 0.03, rim radius ~0.22)
  const N = 8;
  const RIM_R = 0.215;
  const DARK_PINK = "#d56ac0";

  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + Math.PI / N;
    const ca = Math.cos(a), sa = Math.sin(a);
    const jitter = 0.9 + R() * 0.2;
    const P = (r: number, y: number, side = 0): [number, number, number] => {
      const aa = a + side;
      return [cx + Math.cos(aa) * r, cy + y, cz + Math.sin(aa) * r];
    };

    // curled petal lip: root on rim, arcs outward and curls up/inward at the tip
    const lip = bezier(
      P(RIM_R - 0.01, 0.004),
      P(RIM_R + 0.05 * jitter, 0.01),
      P(RIM_R + 0.085 * jitter, 0.04),
      P(RIM_R + 0.07 * jitter, 0.095 * jitter),
    );
    b.sweep(lip, (t) => [0.034 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.12)) + 0.008, 0.007], {
      color: BELL_IN,
      caps: { start: "flat", end: "round" },
      sides: 6,
      name: "bellLip",
    });

    // glowing cyan edge line running along the lip's upper edge
    const edge = bezier(
      P(RIM_R - 0.005, 0.014),
      P(RIM_R + 0.05 * jitter, 0.022),
      P(RIM_R + 0.088 * jitter, 0.052),
      P(RIM_R + 0.072 * jitter, 0.105 * jitter),
    );
    glow(
      b.sweep(edge, [0.0045, 0.0025], { color: CYAN, caps: { end: "round" }, sides: 4, name: "bellLipEdge" }),
      1.4,
    );

    // tiny glowing bead at the curl tip
    const tip = edge.at(1);
    glow(
      b.part(new THREE.SphereGeometry(0.009, 6, 4), CYAN, { at: [tip.x, tip.y + 0.006, tip.z] }),
      1.6,
    );

    // small supporting rib on the outside of the bell under each lip
    const rib = bezier(
      P(RIM_R - 0.005, -0.005),
      P(RIM_R - 0.02, -0.05),
      P(RIM_R - 0.06, -0.1),
      P(RIM_R - 0.1, -0.14),
    );
    b.sweep(rib, [0.008, 0.002], { color: DARK_PINK, caps: { end: "point" }, sides: 4, name: "bellRib" });

    // pollen dots between lips on the inner rim
    const mid = a + Math.PI / N;
    for (let k = 0; k < 2; k++) {
      const r = 0.17 - k * 0.03;
      glow(
        b.part(new THREE.SphereGeometry(0.006, 5, 4), k ? GLOW_GREEN : PINK_WHITE, {
          at: [cx + Math.cos(mid) * r, cy + 0.016, cz + Math.sin(mid) * r],
        }),
        1.3,
      );
    }
  }

  // thin glowing ring tracing the rim edge
  glow(
    b.part(new THREE.TorusGeometry(RIM_R, 0.004, 4, 32), CYAN, {
      at: [cx, cy + 0.014, cz],
      dir: [0, 1, 0],
      axis: "z",
    }),
    1.1,
  );
}
    return addBellPetalTrim;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addTrunkBarkRidgesAndTendrils(b: Builder) {
  const R = rng(231);
  const pt = (r: number, y: number, a: number): [number, number, number] => [Math.cos(a) * r, y, Math.sin(a) * r];

  // ---- Trunk bark ridges: vertical raised ribs wrapping the trunk ----
  const trunkCenter = (y: number): [number, number, number] => {
    // follows stage 1 trunk path loosely
    const t = Math.min(1, y / 1.62);
    return [0.05 * Math.sin(t * 3.1) * (1 - t * 0.5), y, 0.03 * Math.sin(t * 5)];
  };
  const trunkR = (y: number) => {
    const t = Math.min(1, y / 1.62);
    return 0.2 - 0.14 * t + 0.02 * Math.sin(t * 9);
  };
  const ridgeCount = 9;
  for (let i = 0; i < ridgeCount; i++) {
    const a = (i / ridgeCount) * Math.PI * 2 + R() * 0.2;
    const y0 = 0.1 + R() * 0.2;
    const y1 = 1.0 + R() * 0.4;
    const pts: [number, number, number][] = [];
    for (let k = 0; k <= 5; k++) {
      const y = y0 + ((y1 - y0) * k) / 5;
      const c = trunkCenter(y);
      const aa = a + Math.sin(k * 0.9 + i) * 0.1;
      const r = trunkR(y) + 0.008;
      pts.push([c[0] + Math.cos(aa) * r, y, c[2] + Math.sin(aa) * r]);
    }
    b.sweep(catmull(pts), (t) => 0.014 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.03)) + 0.004, {
      color: TRUNK_LIGHT,
      sides: 5,
      caps: { start: "round", end: "round" },
      name: "s23ridge",
    });
  }
  // Knobbly nodes
  for (let i = 0; i < 16; i++) {
    const y = 0.15 + R() * 1.25;
    const a = R() * Math.PI * 2;
    const c = trunkCenter(y);
    const r = trunkR(y) + 0.004;
    const s = 0.016 + R() * 0.014;
    const p: [number, number, number] = [c[0] + Math.cos(a) * r, y, c[2] + Math.sin(a) * r];
    b.part(new THREE.IcosahedronGeometry(s, 0), i % 3 ? TRUNK_LIGHT : TRUNK, {
      at: p,
      dir: [Math.cos(a), 0, Math.sin(a)],
      scale: [1, 0.8, 1],
      flat: true,
      name: "s23node",
    });
  }

  // ---- Hanging tendrils at tips of lower fronds ----
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.45 - 0.1;
    const tip = pt(1.35, 0.95, a);
    for (let j = 0; j < 2; j++) {
      const off = (j - 0.5) * 0.06;
      const x0 = tip[0] + Math.cos(a + 1.57) * off;
      const z0 = tip[2] + Math.sin(a + 1.57) * off;
      const len = 0.38 + R() * 0.25;
      const path = bezier(
        [x0, tip[1] - 0.02, z0],
        [x0 + Math.cos(a) * 0.03, tip[1] - len * 0.35, z0 + Math.sin(a) * 0.03],
        [x0 - Math.cos(a) * 0.02, tip[1] - len * 0.7, z0 - Math.sin(a) * 0.02],
        [x0, tip[1] - len, z0],
      );
      b.sweep(path, [0.007, 0.003], { color: FROND_A, sides: 4, caps: { end: "round" }, name: "s23tendril" });
      const sizes = [0.024, 0.017, 0.011];
      [0.45, 0.72, 0.97].forEach((t, k) => {
        const p = path.at(t);
        glow(
          b.part(new THREE.SphereGeometry(sizes[k], 7, 5), GLOW_GREEN, { at: [p.x, p.y - sizes[k] * 0.6, p.z], name: "s23bead" }),
          1.5,
        );
      });
    }
  }
}
    return addTrunkBarkRidgesAndTendrils;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addFrondSideLobes(b: Builder) {
  const R = rng(241);
  const pt = (r: number, y: number, a: number): [number, number, number] => [Math.cos(a) * r, y, Math.sin(a) * r];
  const TIPC = "#a8e8d8";
  const LOBE_DARK = "#5a2f8c";

  // Serrated lobes along both edges of each upper frond, mirroring stage 1's frond curve.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const path = bezier(pt(0.04, 1.52, a), pt(0.35, 2.0, a), pt(0.8, 2.05, a + 0.05), pt(1.1, 1.55, a + 0.1));
    const count = 9;
    for (let k = 0; k < count; k++) {
      const t = 0.14 + (k / (count - 1)) * 0.72;
      const p = path.at(t);
      const tg = path.tangentAt(t);
      // width of the frond at t (matches stage 1's profile)
      const w = 0.015 + 0.1 * Math.sin(Math.PI * Math.min(1, t * 1.04));
      // side direction in horizontal plane, perpendicular to tangent
      const side = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      // graduating size: bigger mid-frond, small at ends
      const size = 0.05 + 0.06 * Math.sin(Math.PI * t);
      for (const s of [1, -1]) {
        const base = new THREE.Vector3(p.x, p.y, p.z).addScaledVector(side, s * w * 0.85);
        const dir = side
          .clone()
          .multiplyScalar(s)
          .addScaledVector(tg, 0.55)
          .addScaledVector(new THREE.Vector3(0, 1, 0), -0.15)
          .normalize();
        const len = size * (0.85 + R() * 0.3);
        const col = t > 0.55 ? FROND_B : FROND_A;
        b.spike(base, dir, len, 0.016 + size * 0.12, { color: col, sides: 4, name: "lobe" });
        // small dark serration notch behind each lobe
        if (k % 2 === 0) {
          const b2 = base.clone().addScaledVector(tg, -0.035);
          b.spike(b2, dir, len * 0.55, 0.011, { color: LOBE_DARK, sides: 4, name: "lobeS" });
        }
      }
    }
    // tip tuft: three tiny pale spikes fanning at the frond end
    const end = path.at(0.97);
    const et = path.tangentAt(0.97);
    for (let j = -1; j <= 1; j++) {
      const d = new THREE.Vector3(et.x, et.y, et.z).add(new THREE.Vector3(-et.z, 0.1, et.x).multiplyScalar(j * 0.45)).normalize();
      b.spike([end.x, end.y, end.z], d, 0.07, 0.01, { color: TIPC, sides: 4, name: "lobeTip" });
    }
  }
}
    return addFrondSideLobes;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addRootBulbs(b: any) {
  const R = rng(251);
  const CAP_DARK = "#1b8f9a";
  const STEM = "#b9ffe0";
  const cols = [CYAN, GLOW_GREEN];
  const centers: [number, number][] = [
    [0.5, 0.3],
    [0.2, 0.62],
    [0.62, -0.1],
    [-0.3, 0.55],
    [-0.55, 0.1],
    [-0.15, -0.55],
    [0.3, -0.5],
  ];

  const bulb = (x: number, z: number, r: number, c: string) => {
    const y = r * 0.8;
    glow(b.part(new THREE.SphereGeometry(r, 7, 5), c, { at: [x, y, z] }), 1.3);
    b.part(new THREE.SphereGeometry(r * 0.45, 6, 4), PINK_WHITE, { at: [x - r * 0.25, y + r * 0.35, z + r * 0.3] });
  };

  const fungus = (x: number, z: number, h: number, c: string) => {
    b.part(new THREE.CylinderGeometry(h * 0.1, h * 0.14, h, 6), STEM, { at: [x, h / 2, z] });
    const cap = b.part(new THREE.SphereGeometry(h * 0.42, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP_DARK, {
      at: [x, h * 0.95, z],
      scale: [1, 0.7, 1],
    });
    glow(
      b.part(new THREE.TorusGeometry(h * 0.38, h * 0.045, 4, 9), c, {
        at: [x, h * 0.98, z],
        dir: [0, 1, 0],
        axis: "z",
      }),
      1.5,
    );
    glow(b.part(new THREE.SphereGeometry(h * 0.1, 5, 4), c, { at: [x, h * 1.22, z] }), 1.6);
    return cap;
  };

  centers.forEach(([cx, cz], k) => {
    const n = 3 + Math.floor(R() * 2);
    for (let i = 0; i < n; i++) {
      const a = R() * 6.28;
      const d = 0.03 + R() * 0.1;
      const x = cx + Math.cos(a) * d;
      const z = cz + Math.sin(a) * d;
      const c = cols[(k + i) % 2];
      if (i % 3 === 2) fungus(x, z, 0.05 + R() * 0.04, c);
      else bulb(x, z, 0.018 + R() * 0.022, c);
    }
    // small tendril connecting cluster to root tone
    b.part(new THREE.CylinderGeometry(0.006, 0.01, 0.05, 5), ROOT, { at: [cx, 0.02, cz] });
  });
}
    return addRootBulbs;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSpiralSeedPods(b: Builder) {
  const R = rng(26);
  const PALE = PINK_WHITE;
  const MOSS_DK = "#1a5a4a";

  // Seed filaments fanning from each helicoradian spiral tip.
  // Spiral centres follow stage 1: radius 0.95..1.2 at angles 0.8 + i*1.5, y ~0.012.
  // Find spiral tip points by locating the pink-white helix meshes' surface via nearest queries.
  const skin = b.surface(b.root);
  for (let i = 0; i < 4; i++) {
    const a = 0.8 + i * 1.5;
    const guess = [Math.cos(a) * 1.07, 0.2, Math.sin(a) * 1.07];
    const hit = skin.nearest(guess);
    const base = hit.at;
    const cnt = 6;
    for (let k = 0; k < cnt; k++) {
      const f = (k / (cnt - 1) - 0.5) * 2; // -1..1
      const ang = a + f * 0.9 + (R() - 0.5) * 0.2;
      const len = 0.1 + R() * 0.06;
      const p0: [number, number, number] = [base.x, base.y + 0.01, base.z];
      const p1: [number, number, number] = [base.x + Math.cos(ang) * len * 0.4, base.y + len * 0.7, base.z + Math.sin(ang) * len * 0.4];
      const p2: [number, number, number] = [base.x + Math.cos(ang) * len, base.y + len * 0.95, base.z + Math.sin(ang) * len];
      b.sweep(bezier(p0, p1, p2), [0.004, 0.0015], { color: PALE, sides: 4, caps: { end: "point" }, name: "seedFil" });
      glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), k % 2 ? CYAN : MAG, { at: p2 }), 1.6);
    }
    // small feathery tuft cap
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), PALE, { at: [base.x, base.y + 0.012, base.z] }), 0.8);
  }

  // Base moss and sprouts around the trunk base.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.3;
    const r = 0.17 + R() * 0.09;
    const s = 0.035 + R() * 0.035;
    const c: [number, number, number] = [Math.cos(a) * r, s * 0.4, Math.sin(a) * r];
    const col = i % 3 === 0 ? ROOT : i % 3 === 1 ? MOSS_DK : GLOW_GREEN;
    const m = b.part(new THREE.IcosahedronGeometry(s, 0), col, { at: c, scale: [1, 0.55, 1], flat: true });
    if (col === GLOW_GREEN) glow(m, 0.7);
  }
  // Leaf sprouts: curved blades with glowing tips.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const r = 0.2 + R() * 0.06;
    const h = 0.12 + R() * 0.1;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const p0: [number, number, number] = [dx * r, 0.01, dz * r];
    const p1: [number, number, number] = [dx * (r + 0.03), h * 0.6, dz * (r + 0.03)];
    const p2: [number, number, number] = [dx * (r + 0.09), h, dz * (r + 0.09)];
    b.sweep(bezier(p0, p1, p2), [0.014, 0.002], { color: i % 2 ? GLOW_GREEN : MOSS_DK, sides: 4, caps: { end: "point" }, name: "sprout" });
    glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), CYAN, { at: p2 }), 1.5);
  }
  // Little glowing bead cluster
  for (let i = 0; i < 5; i++) {
    const a = R() * 6.28;
    glow(b.part(new THREE.SphereGeometry(0.012 + R() * 0.008, 6, 4), CYAN, { at: [Math.cos(a) * 0.26, 0.02, Math.sin(a) * 0.26] }), 1.3);
  }
}
    return addSpiralSeedPods;
  })(),
);
