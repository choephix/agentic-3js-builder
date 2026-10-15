// Nine-tailed kitsune: an elegant white spirit fox with crimson kumadori markings, gold ornaments, nine fanned tails
// tipped with foxfire, and hitodama orbs orbiting it. High-fantasy anime: cel-shaded paints (kits/toon), flat-colour
// ink, gold trims, glow-lit spirit flames (kits/glow).
import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/builder";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A tall white spirit fox with crimson kumadori face markings, gold forehead crest, collar and tail cuffs, a jade magatama necklace, flowing red hagoromo scarves and nine fanned tails that each end in a glowing foxfire flame, with hitodama orbs and sparks drifting around it.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#fff6e6";
const CREAM_SH = "#ddd0ee";
const PEACH = "#ffdcae";
const PEACH_SH = "#e9b9b4";
const RED = "#dc2a3c";
const RED_SH = "#a31a46";
const SOCK = "#a3213a";
const SOCK_SH = "#6f1646";
const DEEP = "#7a1630";
const GOLD = "#ffc83a";
const GOLD_PALE = "#ffe19a";
const JADE = "#3ad9b4";
const PLUM = "#3c2258";
const CLAW = "#f3e6d2";
const INNER = "#ffb3bd";
const FL_OUT = "#6c4dff";
const FL_MID = "#34c6ff";
const FL_CORE = "#e6fcff";
const SPARK = "#c9f6ff";
const GEM = "#3fdcff";

// Cel paints: lit + hard shadow tone, built from the same toothed edges so both tones keep one pattern.
const coatEdge = (a: string, c: string) => furEdge(a, c, { axis: [0, 1, 0], level: 0.5, teeth: 0.28, period: 0.05 });
const COAT_LIT = coatEdge(PEACH, CREAM);
const COAT_SH = coatEdge(PEACH_SH, CREAM_SH);
const COAT = cel(COAT_LIT, COAT_SH);
const WHITE = cel(CREAM, CREAM_SH);
const sockEdge = (above: Parameters<typeof furEdge>[0], below: string, level: number) =>
  furEdge(above, below, { by: "position", axis: [0, 1, 0], level, teeth: 0.06, period: 0.04, along: [0.7, 0, 0.7] });
const legPaint = (level: number) => cel(sockEdge(COAT_LIT, SOCK, level), sockEdge(COAT_SH, SOCK_SH, level));
const REDCEL = cel(RED);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TUFT_A = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C3 52 6 24 18 0 C28 24 30 50 16 64 Z" fill="#ffffff"/>
  <path d="M16 62 C11 48 12 28 18 8 C21 28 22 48 16 62 Z" fill="#dcdcdc"/></svg>`,
  { size: 128 },
);
const TUFT_B = svg(
  `<svg viewBox="0 0 32 64"><path d="M12 64 C0 48 6 22 26 0 C24 22 32 46 20 64 Z" fill="#ffffff"/>
  <path d="M15 60 C10 46 14 28 24 8 C22 28 24 46 17 60 Z" fill="#d6d6d6"/></svg>`,
  { size: 128 },
);
const FLAME_PATH = "M32 111 C8 111 2 84 14 62 C21 49 19 36 27 22 C31 14 33 7 41 0 C40 15 47 24 51 38 C60 60 62 111 32 111 Z";
const shrink = (k: number) => `translate(32 111) scale(${k}) translate(-32 -111)`;
const FLAME = svg(
  `<svg viewBox="0 0 64 112">
  <path d="M10 96 C0 76 4 58 12 44 C14 60 24 68 24 84 Z" fill="${FL_OUT}"/>
  <path d="M54 96 C64 78 62 62 56 50 C52 62 42 70 42 86 Z" fill="${FL_OUT}"/>
  <path d="${FLAME_PATH}" fill="${FL_OUT}"/>
  <path d="${FLAME_PATH}" fill="${FL_MID}" transform="${shrink(0.72)}"/>
  <path d="${FLAME_PATH}" fill="${FL_CORE}" transform="${shrink(0.42)}"/>
  </svg>`,
  { size: 192 },
);
const STAR = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 0 L19.5 12.5 L32 16 L19.5 19.5 L16 32 L12.5 19.5 L0 16 L12.5 12.5 Z" fill="${SPARK}"/></svg>`,
  { size: 64 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 24 64"><rect x="9" y="52" width="6" height="12" rx="3" fill="${GOLD}"/>
  <path d="M4 52 L8 12 L12 4 L16 12 L20 52 Z" fill="${RED}"/>
  <path d="M8 52 L11 14 L12 8 L13 14 L16 52 Z" fill="#ff6a78"/>
  <rect x="7" y="0" width="10" height="9" rx="3" fill="${GOLD}"/></svg>`,
  { size: 96 },
);
const SWIRL = svg(
  `<svg viewBox="0 0 200 120">
  <path d="M20 84 C34 38 92 30 112 62 C126 86 98 106 82 90 C70 78 82 62 96 66" fill="none" stroke="${RED}" stroke-width="9" stroke-linecap="round"/>
  <path d="M112 62 C140 20 188 40 184 72 C181 94 156 98 150 82" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round"/>
  <path d="M14 98 C40 112 70 112 90 104" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  <path d="M120 100 C140 108 160 106 176 96" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="20" cy="84" r="6" fill="${GOLD}"/><circle cx="96" cy="66" r="5" fill="${GOLD}"/>
  <circle cx="150" cy="82" r="5" fill="${GOLD}"/><circle cx="64" cy="42" r="3.5" fill="${GOLD}"/>
  <circle cx="166" cy="40" r="3.5" fill="${GOLD}"/>
  <path d="M60 12 C70 24 66 32 60 36 C54 32 50 24 60 12 Z" fill="${RED}"/>
  <path d="M138 8 C148 20 144 28 138 32 C132 28 128 20 138 8 Z" fill="${RED}"/>
  </svg>`,
  { size: 640 },
);
const HIP_SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M50 50 C50 38 64 36 68 48 C72 64 52 76 38 66 C22 54 30 28 52 22 C74 16 90 36 86 58" fill="none" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="6" fill="${GOLD}"/><circle cx="86" cy="58" r="5" fill="${GOLD}"/>
  <path d="M10 74 C20 90 40 94 58 90" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);
const FACE = svg(
  `<svg viewBox="0 0 200 160">
  <path d="M100 4 L113 30 L100 60 L87 30 Z" fill="${RED}"/>
  <path d="M100 17 L106 31 L100 46 L94 31 Z" fill="${GOLD}"/>
  <path d="M97 62 L103 62 L101.4 112 L98.6 112 Z" fill="${RED}"/>
  <path d="M24 60 C10 68 3 84 5 106 C13 92 24 82 40 76 Z" fill="${RED}"/>
  <path d="M176 60 C190 68 197 84 195 106 C187 92 176 82 160 76 Z" fill="${RED}"/>
  <path d="M26 84 C20 92 18 100 20 108 C26 100 32 94 40 90 Z" fill="${RED}"/>
  <path d="M174 84 C180 92 182 100 180 108 C174 100 168 94 160 90 Z" fill="${RED}"/>
  <circle cx="58" cy="26" r="5" fill="${RED}"/><circle cx="142" cy="26" r="5" fill="${RED}"/>
  <circle cx="68" cy="20" r="3.4" fill="${GOLD}"/><circle cx="132" cy="20" r="3.4" fill="${GOLD}"/>
  </svg>`,
  { size: 512 },
);
const EYE = animeEye({ iris: "#ffb21c", irisLight: "#fff0a0", blush: "#ff8aa8" });

// ---------------------------------------------------------------------------------------------------------------
type Pt = [number, number, number];
const ramp = (keys: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const rnd = rng(11);
  const side = (s: number) => (s > 0 ? "L" : "R");

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.74, -0.4], dir: [0, 0.02, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.74, -0.4],
      [0, 0.75, -0.1],
      [0, 0.75, 0.12],
      [0, 0.77, 0.32],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.26],
      [0, 0.92, 0.38],
      [0, 1.03, 0.5],
      [0, 1.09, 0.58],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1).at, dir: [0, -0.18, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.055 }),
    aim: head.local({ forward: 0.28, down: 0.075 }),
    role: "jaw",
  });
  const foxfire = b.joint("foxfire", { parent: hips, at: [0, 0.9, 0], dir: [0, 1, 0] });

  // ------------------------------------------------------------------------------------------------ body
  const bodyRx = ramp([0.1, 0.115, 0.1, 0.125, 0.11]);
  const bodyRy = ramp([0.12, 0.145, 0.125, 0.16, 0.14]);
  const body = b.sweep(spine, (t) => [bodyRx(t), bodyRy(t)], { color: COAT, sides: 10 });
  const neckSweep = b.sweep(neck, [0.1, 0.082, 0.066], { color: WHITE, sides: 8 });

  // Haunch and shoulder masses
  const haunches = [1, -1].map((s) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hips,
      at: [s * 0.115, 0.67, -0.32],
      scale: [0.075, 0.15, 0.16],
    }),
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, {
      bone: chest,
      at: [s * 0.1, 0.66, 0.27],
      scale: [0.07, 0.13, 0.12],
    });

  // ------------------------------------------------------------------------------------------------ legs
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  const legChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const L = side(s);
    const front = limb(
      [s * 0.1, 0.66, 0.27],
      [s * 0.1, 0.036, 0.4],
      [0.3, 0.28, 0.12, 0.1],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const fl = b.chain("legF" + L, catmull(front), {
      parent: chest,
      names: ["shoulder" + L, "elbow" + L, "wrist" + L, "ball" + L, "toe" + L],
      role: "leg",
      contact: [s * 0.1, 0, 0.36],
    });
    legChains["F" + L] = fl;
    legSweeps.push(b.sweep(fl, [0.07, 0.046, 0.034, 0.03, 0.036], { color: legPaint(0.27), sides: 8 }));

    const hind = limb(
      [s * 0.11, 0.68, -0.3],
      [s * 0.11, 0.036, -0.38],
      [0.3, 0.3, 0.22, 0.1],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const hl = b.chain("legH" + L, catmull(hind), {
      parent: hips,
      names: ["hipH" + L, "kneeH" + L, "hockH" + L, "ballH" + L, "toeH" + L],
      role: "leg",
      contact: [s * 0.11, 0, -0.42],
    });
    legChains["H" + L] = hl;
    legSweeps.push(b.sweep(hl, [0.095, 0.05, 0.036, 0.03, 0.036], { color: legPaint(0.3), sides: 8 }));

    // Claws and gold bangles
    for (const fl2 of [fl, hl]) {
      const tip = fl2.at(1).at;
      for (const dx of [-0.016, 0, 0.016])
        b.spike([tip.x + dx, tip.y - 0.004, tip.z + 0.02], [0, -0.25, 1], 0.045, 0.01, {
          color: CLAW,
          bone: fl2.joints[fl2.joints.length - 1],
          sides: 5,
        });
    }
    for (const [lc, t, w] of [
      [fl, 0.6, 0.011],
      [hl, 0.74, 0.011],
    ] as const) {
      const r = 0.036;
      const ring = b.ring(lc.at(t), { count: 8, radius: r + 0.004 });
      b.sweep(catmull(ring.items, { closed: true }), w, { color: GOLD, sides: 5 });
    }
  }

  // ------------------------------------------------------------------------------------------------ head
  const HC = head.local({ forward: 0.07, up: 0.005 });
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), WHITE, {
    bone: head,
    at: HC,
    scale: [0.095, 0.085, 0.1],
  });
  const muzzle = b.sweep(
    polyline([head.local({ forward: 0.1, down: 0.02 }), head.local({ forward: 0.3, down: 0.043 })]),
    (t) => [0.05 - 0.028 * t, 0.044 - 0.026 * t],
    { bone: head, color: WHITE, sides: 8 },
  );
  const lower = b.sweep(
    polyline([jaw.at, head.local({ forward: 0.28, down: 0.075 })]),
    (t) => [0.036 - 0.02 * t, 0.026 - 0.012 * t],
    { bone: jaw, color: WHITE, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), PLUM, {
    bone: head,
    at: head.local({ forward: 0.318, down: 0.036 }),
    scale: [0.026, 0.02, 0.022],
  });
  // Mouth lines, fangs, tongue
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        head.local({ left: s * 0.036, forward: 0.28, down: 0.06 }),
        head.local({ left: s * 0.05, forward: 0.2, down: 0.066 }),
        head.local({ left: s * 0.062, forward: 0.12, down: 0.06 }),
      ]),
      0.0035,
      { bone: head, color: INK, sides: 4 },
    );
    b.spike(head.local({ left: s * 0.03, forward: 0.2, down: 0.052 }), [0, -1, 0.1], 0.03, 0.009, {
      color: "#ffffff",
      bone: head,
      sides: 5,
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), INNER, {
    bone: jaw,
    at: head.local({ forward: 0.2, down: 0.066 }),
    scale: [0.02, 0.008, 0.045],
  });

  // Face markings and eyes
  const faceSkin = b.surface([skull, muzzle]);
  b.decal(faceSkin, FACE, {
    at: head.local({ forward: 0.14, up: 0.0 }),
    dir: [0, 0.05, 1],
    size: [0.2, 0.16],
    segments: 16,
    lift: 0.0015,
  });
  const eyeSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = eyeSkin.around(HC).at(s * 40, 2)!;
    b.decal(eyeSkin, EYE, { at: hit, size: [0.058, 0.08], mirror: s > 0, lift: 0.004 });
  }

  // Ears
  const earOutline: OutlinePoint[] = [
    [-0.07, 0],
    [-0.075, 0.07],
    [-0.035, 0.17],
    [0.0, 0.26, "sharp"],
    [0.038, 0.17],
    [0.076, 0.07],
    [0.07, 0],
  ];
  const earPaint = cel(
    paint((_p, n, s) => {
      const w = 0.05 * (1 - s[1] / 0.2);
      if (s[1] > 0.17) return RED;
      if (n.z > 0.35 && s[1] > 0.025 && Math.abs(s[0]) < w) return INNER;
      return CREAM;
    }),
  );
  for (const s of [1, -1]) {
    const base = head.local({ forward: 0.0, up: 0.07, left: s * 0.07 });
    const ear = b.joint("ear" + side(s), {
      parent: head,
      at: base,
      dir: [s * 0.3, 1, -0.25],
      role: "hinge",
    });
    const e = b.extrude(earOutline, {
      at: base,
      x: [s, -0.3, 0],
      y: [s * 0.3, 1, -0.25],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: earPaint,
      bone: ear,
    });
    // inner-ear tufts
    for (const [u, v, k] of [
      [-0.018, 0.045, 0.7],
      [0.0, 0.07, 1],
      [0.02, 0.045, 0.7],
    ] as const)
      b.spike(e.local([u, v, 0.012]), e.dir([0, 0.45, 1]), 0.06 * k, 0.012, { color: WHITE, bone: ear, sides: 5 });
    // gold cuff with tassel
    const cuff = e.local([0.068, 0.07, 0]);
    b.part(new THREE.TorusGeometry(0.02, 0.0055, 5, 10), GOLD, { bone: ear, at: cuff, dir: e.dir([0, 1, 0]), axis: "z" });
    b.cards([frame(offset3(cuff, 0, -0.02, 0), [0, 1, 0])], TASSEL, {
      size: [0.025, 0.08],
      lean: 180,
      flow: [0, 0, 1],
      bone: ear,
    });
  }

  // Cheek tufts
  for (const s of [1, -1])
    for (const [az, el, dz] of [
      [78, 6, 0.08],
      [86, -14, 0.1],
      [92, -32, 0.1],
    ] as const) {
      const hit = eyeSkin.around(HC).at(s * az, el)!;
      const p0 = hit.at;
      b.sweep(
        bezier(p0, [p0.x + s * 0.04, p0.y - 0.005, p0.z - 0.03], [p0.x + s * 0.07, p0.y - 0.03, p0.z - dz]),
        [0.034, 0],
        { bone: head, color: WHITE, caps: { end: "point" }, sides: 6 },
      );
    }

  // Whiskers
  for (const s of [1, -1])
    for (const [dn, spread] of [
      [0.022, 0.03],
      [0.036, 0.0],
      [0.05, -0.03],
    ] as const) {
      const a = head.local({ left: s * 0.042, forward: 0.2, down: dn });
      const m = head.local({ left: s * 0.12, forward: 0.16, down: dn - spread * 0.5 });
      const e = head.local({ left: s * 0.2, forward: 0.07, down: dn - spread * 2 + 0.01 });
      b.sweep(bezier(a, m, e), [0.0035, 0.001], { bone: head, color: GOLD_PALE, caps: { end: "point" }, sides: 4 });
    }

  // Gold forehead crest with a spirit gem
  const crestHit = eyeSkin.around(HC).at(0, 50)!;
  {
    const xAxis = new THREE.Vector3(1, 0, 0);
    const yAxis = crestHit.n.clone().cross(xAxis).normalize();
    const crestPts: OutlinePoint[] = [
      [0, -0.025],
      [0.022, -0.005],
      [0.048, 0.03, "sharp"],
      [0.012, 0.018],
      [0, 0.05, "sharp"],
      [-0.012, 0.018],
      [-0.048, 0.03, "sharp"],
      [-0.022, -0.005],
    ];
    const crest = b.extrude(crestPts, {
      at: crestHit.at.clone().addScaledVector(crestHit.n, 0.004),
      x: [1, 0, 0],
      y: yAxis,
      thickness: 0.012,
      bevel: 0.003,
      color: GOLD,
      bone: head,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.0125, 8, 6), GEM, {
        bone: head,
        at: crest.local([0, 0.002, 0.012]),
      }),
      1.2,
    );
  }

  // ------------------------------------------------------------------------------------------------ neck dress
  const throatSkin = b.surface(neckSweep);
  const collarLoop = throatSkin.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collarLoop, 0.014, { color: GOLD, bone: neck.joints[1], sides: 6 });
  const beadLoop = throatSkin.loop(neck.joints[1], { lift: 0.03 });
  b.sweep(beadLoop, 0.006, { color: DEEP, bone: neck.joints[1], sides: 4 });
  b.along(beadLoop, 16, (at) => b.part(new THREE.SphereGeometry(0.014, 6, 5), JADE, { at, bone: neck.joints[1] }));
  const throat = collarLoop.at(0.5);
  // Bell and magatama pendant
  const pend = (x: number, y: number, z: number): Pt => [throat.x + x, throat.y + y, throat.z + z];
  b.rod(pend(0, 0, 0.0), pend(0, -0.05, 0.03), 0.004, { color: GOLD, bone: neck.joints[1], sides: 4 });
  b.part(new THREE.SphereGeometry(0.028, 10, 8), GOLD, { bone: neck.joints[1], at: pend(0, -0.075, 0.04) });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.004), INK, { bone: neck.joints[1], at: pend(0, -0.085, 0.066) });
  b.sweep(bezier(pend(0.0, -0.01, 0.02), pend(0.04, -0.09, 0.07), pend(-0.01, -0.14, 0.07)), [0.02, 0.005], {
    bone: neck.joints[1],
    color: JADE,
    caps: { end: "point" },
    sides: 6,
  });
  for (const dx of [-0.045, 0.045])
    b.cards([frame(pend(dx, -0.02, 0.02), [0, 1, 0])], TASSEL, {
      size: [0.035, 0.11],
      lean: 180,
      flow: [0, 0, 1],
      bone: neck.joints[1],
    });

  // Fur ruff: neck, chest, belly, legs, haunches
  const bodySkin = b.surface([body, neckSweep]);
  const ruff = bodySkin.scatter(150, {
    rng: rnd,
    minDist: 0.04,
    filter: (h) => h.at.z > 0.18 && h.at.y > 0.6 && h.n.y < 0.6,
  });
  b.cards(ruff, [TUFT_A, TUFT_B], { size: [0.07, 0.13], lean: 55, bend: 20, vary: 0.25, spin: 20, rng: rng(5), color: WHITE });
  const belly = body
    ? b.surface(body).scatter(70, { rng: rnd, minDist: 0.07, filter: (h) => h.n.y < -0.2 })
    : [];
  b.cards(belly, [TUFT_A, TUFT_B], { size: [0.06, 0.1], lean: 70, bend: 15, vary: 0.2, rng: rng(6), color: WHITE });
  const back = b.surface(body).scatter(60, { rng: rnd, minDist: 0.07, filter: (h) => h.n.y > 0.5 });
  b.cards(back, [TUFT_A, TUFT_B], { size: [0.05, 0.1], lean: 75, bend: 10, vary: 0.2, rng: rng(7), color: COAT });
  for (const key of Object.keys(legChains)) {
    const sw = legSweeps[["FL", "HL", "FR", "HR"].indexOf(key)];
    if (!sw) continue;
    const hits = b.surface(sw).scatter(18, {
      rng: rnd,
      minDist: 0.04,
      filter: (h) => h.n.z < -0.3 && h.at.y > 0.2,
    });
    b.cards(hits, [TUFT_A, TUFT_B], { size: [0.05, 0.09], lean: 70, bend: 15, vary: 0.2, rng: rng(8), color: WHITE });
  }

  // Swirl markings on the flanks and haunches
  for (const s of [1, -1]) {
    b.decal(b.surface(body), SWIRL, {
      at: [s * 0.14, 0.78, 0.0],
      dir: [s, 0, 0],
      size: [0.46, 0.276],
      segments: 18,
      mirror: s < 0,
      lift: 0.002,
    });
    b.decal(b.surface([body, haunches[s > 0 ? 0 : 1]]), HIP_SWIRL, {
      at: [s * 0.18, 0.7, -0.32],
      dir: [s, 0, 0],
      size: [0.2, 0.2],
      segments: 12,
      mirror: s < 0,
      lift: 0.002,
    });
  }

  // ------------------------------------------------------------------------------------------------ scarves
  for (const s of [1, -1]) {
    const pts: Pt[] = [
      [s * 0.1, 0.9, 0.3],
      [s * 0.26, 1.0, 0.14],
      [s * 0.42, 0.98, -0.08],
      [s * 0.55, 1.12, -0.3],
      [s * 0.62, 1.24, -0.56],
      [s * 0.52, 1.28, -0.8],
    ];
    const sc = b.chain("scarf" + side(s), catmull(pts), { parent: neck.joints[0], count: 5, role: "tentacle" });
    b.sweep(sc, (t) => [0.05 * (1 - 0.25 * t), 0.004], {
      section: "box",
      color: paint((_p, _n, st) => (st[0] * 22) % 1 < 0.1 || st[0] > 0.94 ? GOLD : RED),
    });
  }

  // ------------------------------------------------------------------------------------------------ tails
  const tailFlames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const a = u * 80 * DEG;
    const L = 1.0 + 0.2 * (1 - Math.abs(u)) + (i % 2 ? 0.04 : -0.02);
    const bdir = new THREE.Vector3(Math.sin(a) * 0.9, 0.25 * Math.cos(a) + 0.12, -0.75).normalize();
    const tdir = new THREE.Vector3(Math.sin(a) * 0.5, 0.9, -0.15).normalize();
    const P0 = new THREE.Vector3(u * 0.05, 0.74, -0.44 - (i % 2) * 0.04);
    const P3 = P0.clone().addScaledVector(bdir, L * 0.55).addScaledVector(tdir, L * 0.5);
    const path = bezier(
      P0,
      P0.clone().addScaledVector(bdir, L * 0.4),
      P3.clone().addScaledVector(tdir, -L * 0.4),
      P3,
    );
    const names = [1, 2, 3, 4, 5].map((k) => `tail${i + 1}_${k}`);
    const tail = b.chain(`tail${i + 1}`, path, { parent: hips, names, role: "tail" });
    const k = 1 - 0.12 * Math.abs(u);
    const radii = [0.04, 0.075, 0.095, 0.092, 0.07, 0.04].map((r) => r * k);

    const T = path.tangentAt(0.8);
    const lvl = path.at(0.78).dot(T);
    const perp = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 1, 0)).normalize();
    const tipEdge = (a1: string, c: string | typeof COAT_LIT) =>
      furEdge(a1, c, { by: "position", axis: T, level: lvl, teeth: 0.06, period: 0.045, along: perp });
    const tailPaint = cel(tipEdge(RED, COAT_LIT), tipEdge(RED_SH, COAT_SH));
    const sw = b.sweep(tail, radii, { color: tailPaint, sides: 8 });

    for (const [t, w] of [
      [0.2, 0.016],
      [0.72, 0.01],
    ] as const) {
      const ring = b.ring(tail.at(t), { count: 8, radius: sw.at(t).radius + 0.006 });
      b.sweep(catmull(ring.items, { closed: true }), w, { color: GOLD, sides: 5 });
    }

    const hits = b.surface(sw).scatter(34, { rng: rnd, minDist: 0.06 });
    b.cards(hits, [TUFT_A, TUFT_B], {
      size: [0.06, 0.14],
      lean: 55,
      bend: 20,
      vary: 0.25,
      spin: 15,
      rng: rng(20 + i),
      color: tailPaint,
      flow: (f) => path.tangentAt(path.closestT(f.at)),
    });

    // Foxfire at the tip: a 3D tongue under the flame cards
    const tipBone = tail.joints[tail.joints.length - 1];
    const end = path.at(1);
    const dir = path.tangentAt(1).clone().multiplyScalar(0.6).add(new THREE.Vector3(0, 0.8, 0)).normalize();
    const fl0 = end.clone().addScaledVector(dir, -0.03);
    glow(
      b.sweep(
        bezier(
          fl0,
          fl0.clone().addScaledVector(dir, 0.12).add(new THREE.Vector3(0.02, 0, 0)),
          fl0.clone().addScaledVector(dir, 0.22).add(new THREE.Vector3(-0.015, 0, 0)),
        ),
        [0.03, 0.04, 0.025, 0.006],
        { bone: tipBone, color: FL_MID, caps: { end: "point" }, sides: 6 },
      ),
      1,
    );
    tailFlames.push(frame(tail.at(1), dir));
  }
  glow(
    b.cards(tailFlames, FLAME, {
      size: [0.17, 0.32],
      cross: true,
      bend: 18,
      flow: [1, 0, 0.3],
      vary: 0.12,
      rng: rng(31),
      sink: 0.12,
    }),
    1,
  );

  // ------------------------------------------------------------------------------------------------ hitodama orbs
  const orbFrames: ReturnType<typeof frame>[] = [];
  const orbs: [number, number, number, number][] = [
    [0.85, 0.45, 0.6, 1],
    [-0.85, 0.5, 0.55, 1],
    [0.95, 1.05, 0.1, 0.85],
    [-0.95, 1.0, 0.05, 0.85],
    [0.55, 1.35, 0.85, 0.7],
    [-0.55, 1.4, 0.8, 0.7],
  ];
  for (const [x, y, z, k] of orbs) {
    glow(
      b.part(new THREE.SphereGeometry(0.06 * k, 8, 6), FL_CORE, { bone: foxfire, at: [x, y, z] }),
      1,
    );
    orbFrames.push(frame([x, y + 0.03 * k, z], [0, 1, 0]));
    // thin trail ribbon curling down from each orb
    glow(
      b.sweep(
        bezier([x, y - 0.04 * k, z], [x + 0.06, y - 0.2, z - 0.05], [x - 0.03, y - 0.34 * k, z + 0.05]),
        [0.02 * k, 0.003],
        { bone: foxfire, color: FL_MID, caps: { end: "point" }, sides: 5 },
      ),
      1,
    );
  }
  glow(
    b.cards(orbFrames, FLAME, {
      size: [0.2, 0.36],
      cross: true,
      bend: 20,
      flow: [1, 0, 0.3],
      rng: rng(41),
      vary: 0.15,
      bone: foxfire,
    }),
    1,
  );

  // Drifting sparks
  const sparkFrames: ReturnType<typeof frame>[] = [];
  const sr = rng(77);
  while (sparkFrames.length < 46) {
    const p: Pt = [(sr() - 0.5) * 2.3, 0.25 + sr() * 1.6, -1.3 + sr() * 2.3];
    if (Math.abs(p[0]) < 0.45 && p[2] > -0.65 && p[2] < 0.5 && p[1] < 1.2) continue;
    if (Math.abs(p[0]) < 0.3 && p[2] > 0.5 && p[1] < 1.4) continue;
    sparkFrames.push(frame(p, [sr() - 0.5, 1, sr() - 0.5]));
  }
  glow(
    b.cards(sparkFrames, STAR, { size: [0.04, 0.04], vary: 0.5, spin: 45, rng: rng(9), cross: true, bone: foxfire }),
    1,
  );
  void REDCEL;
  void lower;

  return b.root;
}

function offset3(p: THREE.Vector3, x: number, y: number, z: number): Pt {
  return [p.x + x, p.y + y, p.z + z];
}
