import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { noise } from "../src/paint";
import type { Chain } from "../src/skeleton";
import { bayer, cellPaint, pixelArt, snapColor } from "../kits/pixel";

export const meta = {
  name: "Greater Flamingo",
  description:
    "A storybook greater flamingo standing on both legs: bubblegum-pink pixel plumage, a big hooked bill, a big sparkly eye, a daisy tucked behind the ear, an ID band on one ankle and a lily pad at its feet.",
  style: "whimsical pixel-art mix",
  commit: "88fc1f0",
};

// One texel size per scale: 2 cm on the big masses, 1 cm on legs, head, bill and cards.
const T2 = 0.02;
const T1 = 0.01;

const snap = (c: string) => snapColor(c, 64);
const PINK = ["#a84a73", "#d6648a", "#f284a0", "#ff9fb6", "#ffbccb", "#ffd9e1"].map(snap);
const CORAL = ["#7a1f3b", "#b8304f", "#e0455f", "#ff6b76", "#ff9486"].map(snap);
const NIGHT = ["#0f0d1c", "#1b1830", "#2e2a52", "#443f7a"].map(snap);
const LEG = ["#7d2c55", "#b04070", "#d9578a", "#f278a2", "#ff9ab8"].map(snap);
const BILL_PALE = ["#c9a595", "#e6c6b2", "#f8e1cd", "#fff3e6"].map(snap);
const BILL_DARK = ["#0d0b14", "#1c1828", "#332c40"].map(snap);
const SKIN_PINK = ["#d6648a", "#ee7f9f", "#ff9fb6"].map(snap);
const GOLD = "#ffd23f";
const CREAM = "#fff4dc";
const BAND = "#ffcf33";
const BLUE = "#2e6bd6";

// ---- Textures -------------------------------------------------------------------------------
const FEATHER = pixelArt(
  ["..ww..", ".wwww.", "wwwwww", "wwllww", "wwllww", ".wllw.", ".wlmw.", "..mm.."],
  { w: "#ffffff", l: "#f1f1f1", m: "#dedede" },
);
const FLIGHT = pixelArt(
  [
    ".kkk.",
    "kkmkk",
    "kkmkk",
    "kkmkk",
    "kmmkk",
    "kkmkk",
    "kkmkk",
    "kkmkk",
    "kmmkk",
    "kkmkk",
    "kkmkk",
    "kkmkk",
    "rrmrr",
    "rrrrr",
    "rrrrr",
    "rrrrr",
  ],
  { k: "#1b1830", m: "#3a3566", r: "#e0455f" },
);
const COVERT = pixelArt(
  ["..rr..", ".rrrr.", "rrhhrr", "rrhhrr", "rrrrrr", ".rrrr.", ".rpbp.", "..pp.."],
  { r: "#ff6b76", h: "#ff9486", p: "#ffbccb", b: "#e0455f" },
);
const EYE = pixelArt(
  [
    "...pppp...",
    "..pppppp..",
    ".pyyyyyyp.",
    "pyykwkkyyp",
    "pyykkkkyyp",
    "pyykkkkyyp",
    "pyykkkkyyp",
    ".pyyyyyyp.",
    "..pppppp..",
    "...pppp...",
  ],
  { p: "#e0607f", k: "#17101c", y: GOLD, w: "#ffffff" },
);
const BLUSH = pixelArt(["..bbbb..", ".bbbbbb.", "..bbbb.."], { b: "#ff7aa0" });
const TUFT = pixelArt([".p.", "ppp", "ppp", "pPp"], { p: "#ffd9e1", P: "#ff9fb6" });
const LILY = pixelArt(
  [
    "....gggggg....",
    "..ggGGGGGGgg..",
    ".gGGGGGGGGGGg.",
    ".gGGGhhGGGGGg.",
    "gGGGGhGGGGGGGg",
    "gGGGGGGGGGGGGg",
    "gGGGGGGGGGGGGg",
    "gGGGGGGGGGGGGg",
    ".gGGGGGGGGGGg.",
    ".gGGGGGGGGGg..",
    "..ggGGGGgg....",
    "....gggg......",
  ],
  { g: "#1f6b45", G: "#2f8f55", h: "#4cb36a" },
);
const BUTTERFLY = pixelArt(
  ["yy...yy", "yyy.yyy", "yoyyyoy", ".yyayy.", "..y.y.."],
  { y: "#ffd23f", o: "#ff8a3a", a: "#17101c" },
);
const LOTUS = pixelArt(
  ["..p...p..", ".pPp.pPp.", "ppPPpPPpp", "pPPyyyPPp", ".PPyyyPP.", "..PPPPP.."],
  { p: "#ffd9e1", P: "#ff9fb6", y: GOLD },
);

// ---- Paints ---------------------------------------------------------------------------------
function plumage(ramp: string[], size: number, bias: number) {
  return cellPaint(
    size,
    (c) => {
      let v = bias + 0.2 * c.n.y + 0.2 * (noise(c.at, 0.16, 3) - 0.5);
      if ((c.v + ((c.u >> 1) & 1) * 2) % 4 === 0) v -= 0.14; // feather rows
      if (c.random(9) < 0.04) v += 0.2;
      return c.pick(ramp, v);
    },
    { dither: true },
  );
}
const BODY = plumage(PINK, T2, 0.74);
const FLUFF = plumage(PINK, T2, 0.86);
const NECK = cellPaint(
  T2,
  (c) => c.pick(PINK, 0.66 + 0.25 * c.n.y + 0.12 * (noise(c.at, 0.12, 4) - 0.5) - (c.v % 4 === 0 ? 0.1 : 0)),
  { dither: true },
);

export default function build() {
  const b = createBuilder({ name: "flamingo", paintSize: 2048 });

  // ======== Skeleton ========
  const pelvis = b.joint("pelvis", { at: [0, 0.8, -0.12], dir: [0, 0.2, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.12],
      [0, 0.84, 0.08],
      [0, 0.9, 0.26],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.12],
      [0, 0.79, -0.3],
      [0, 0.76, -0.46],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.24],
      [0, 0.97, 0.41],
      [0, 1.06, 0.46],
      [0, 1.15, 0.38],
      [0, 1.22, 0.28],
      [0, 1.29, 0.26],
      [0, 1.34, 0.31],
    ]),
    { parent: spine.tip ?? undefined, count: 7, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.at(1),
    dir: [0, -0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, down: 0.03 }),
    aim: head.local({ forward: 0.2, down: 0.04 }),
    role: "jaw",
    group: "head",
  });

  // ======== Body ========
  const bodyPath = catmull([
    [0, 0.82, -0.38],
    [0, 0.82, -0.18],
    [0, 0.84, 0.04],
    [0, 0.89, 0.22],
    [0, 0.93, 0.32],
  ]);
  const body = b.sweep(
    bodyPath,
    (t) => (t < 0.5 ? [0.05 + 0.22 * t, 0.07 + 0.24 * t] : [0.16 - 0.1 * (t - 0.5), 0.19 - 0.09 * (t - 0.5)]),
    { bone: [tail, pelvis, spine], color: BODY, sides: 10, caps: "round", shift: [0, -0.02], name: "body" },
  );
  const skin = b.surface(body);
  // plumage laid in overlapping rows of shingles, each row offset half a step from the one before
  const shingles = [];
  for (let row = 0; row < 13; row++) {
    const z = -0.34 + row * 0.054;
    const cy = 0.82 + ((z + 0.38) / 0.7) * 0.1;
    for (let i = 0; i < 18; i++) {
      const a = ((i + (row % 2) * 0.5) / 18) * 2 * Math.PI;
      if (Math.abs(a - Math.PI) < 0.5 && row % 2 === 0) continue;
      const hit = skin.ray([0, cy, z], [Math.sin(a), Math.cos(a), 0]);
      if (hit) shingles.push(hit);
    }
  }
  b.cards(shingles, FEATHER, { size: [0.07, 0.09], lean: 76, bend: 14, vary: 0.15, rng: rng(6), color: FLUFF, sink: 0.3 });
  // fluffy chest bib, tipped outward
  const bib = skin.scatter(40, { rng: rng(7), minDist: 0.05, filter: (h) => h.at.z > 0.2 && h.n.z > 0.3 && h.at.y > 0.72 });
  b.cards(bib, FEATHER, { size: [0.06, 0.08], lean: 58, bend: 22, vary: 0.2, rng: rng(8), color: FLUFF, sink: 0.3 });

  // tail fan
  const tailSweep = b.sweep(tail, [0.08, 0.02], { color: BODY, sides: 8, name: "tail" });
  const tailHits = [0.3, 0.55, 0.8].flatMap((t) => [-60, -20, 20, 60].map((deg) => tailSweep.at(t, deg)));
  b.cards(tailHits, FEATHER, { size: [0.07, 0.11], lean: 74, bend: 10, vary: 0.2, rng: rng(9), color: FLUFF });

  // ======== Neck and head ========
  b.sweep(neck, (t) => 0.058 - 0.028 * Math.min(1, t * 1.6), { color: NECK, sides: 8, name: "neck" });
  // soft ruffle at the neck base
  const ruff = b.ring(neck.at(0.08), { count: 9, radius: 0.06 });
  b.cards(ruff.items, FEATHER, { size: [0.06, 0.09], lean: 55, bend: 18, rng: rng(12), color: FLUFF, sink: 0.3 });

  const faceDir = new THREE.Vector3(0, -0.12, 1).normalize();
  const faceOrigin = head.at.clone();
  const HEADPAINT = cellPaint(
    T1,
    (c) => {
      const fwd = c.at.clone().sub(faceOrigin).dot(faceDir);
      if (fwd > 0.085) return c.pick(BILL_PALE, 0.6 + 0.3 * c.n.y);
      return c.pick(PINK, 0.6 + 0.2 * c.n.y + 0.14 * (noise(c.at, 0.05, 2) - 0.5));
    },
    { dither: true },
  );
  const skull = b.sweep([head.local({ back: 0.05 }), head.local({ forward: 0.07 })], [0.064, 0.058], {
    bone: head,
    color: HEADPAINT,
    sides: 10,
    name: "skull",
  });

  // big storybook eyes with pink lids, plus rosy cheeks
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.06, up: 0.02, forward: 0.05 }),
      dir: [s, 0.05, 0.25],
      size: [0.09, 0.09],
      mirror: s < 0,
      segments: 8,
    });
    b.decal(skull, BLUSH, {
      at: head.local({ left: s * 0.05, down: 0.035, forward: -0.01 }),
      dir: [s, -0.3, 0.3],
      size: [0.05, 0.02],
    });
  }

  // flirty lashes sweeping up and back from each eye
  for (const s of [1, -1])
    [0.0, 0.022, 0.044].forEach((fw, i) =>
      b.spike(head.local({ left: s * 0.056, up: 0.042 + i * 0.003, forward: fw }), [s * 0.5, 0.45, -0.6 + i * 0.15], 0.036 - i * 0.004, 0.006, {
        color: "#17101c",
        sides: 4,
        bone: head,
      }),
    );

  // bill: bent upper mandible and flat lower one, pale at the base and inky at the tip
  const BILL = cellPaint(
    T1,
    (c) => {
      const edge = c.s[0] + 0.08 * (bayer(c.u, c.v) - 0.5);
      if (edge > 0.52) return BILL_DARK[c.n.y > 0.6 ? 2 : c.n.y > -0.3 ? 1 : 0];
      return c.pick(BILL_PALE, 0.6 + 0.4 * c.n.y + 0.1 * (noise(c.at, 0.04, 3) - 0.5));
    },
    { dither: true },
  );
  b.sweep(
    bezier(
      head.local({ forward: 0.06, down: 0.005 }),
      head.local({ forward: 0.2, up: 0.01 }),
      head.local({ forward: 0.23, down: 0.055 }),
      head.local({ forward: 0.21, down: 0.12 }),
    ),
    (t) => [0.033 - 0.022 * t, 0.029 - 0.016 * t],
    { bone: head, color: BILL, section: "box", caps: { start: "flat", end: "point" }, name: "upperBill" },
  );
  b.sweep(
    bezier(
      head.local({ forward: 0.0, down: 0.034 }),
      head.local({ forward: 0.1, down: 0.042 }),
      head.local({ forward: 0.17, down: 0.058 }),
      head.local({ forward: 0.205, down: 0.092 }),
    ),
    (t) => [0.031 - 0.019 * t, 0.018 - 0.006 * t],
    { bone: jaw, color: BILL, section: "box", caps: { start: "flat", end: "round" }, name: "lowerBill" },
  );
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.004, 0.02), "#6a4a52", {
      bone: head,
      at: head.local({ left: s * 0.02, up: 0.03, forward: 0.1 }),
      dir: [0, 0.1, 1],
      axis: "z",
    });

  // pink crown tuft and a tucked-in daisy
  [0, 1, 2].forEach((i) => {
    const off = [0, 0.018, -0.018][i];
    b.cards([frame(head.local({ up: 0.05, back: 0.015 + i * 0.008, left: off }), [0, 1, -0.3])], TUFT, {
      size: [0.04, 0.055 - i * 0.01],
      lean: 25,
      flow: [0, 0, -1],
      cross: true,
      bone: head,
    });
  });
  const flowerDir: [number, number, number] = [0.7, 0.7, 0];
  b.ring(frame(head.local({ left: 0.05, up: 0.05, back: 0.02 }), flowerDir), { count: 6, radius: 0.017 }, (item) =>
    b.part(new THREE.BoxGeometry(0.017, 0.006, 0.017), CREAM, { frame: item, bone: head, at: item.at }),
  );
  b.part(new THREE.BoxGeometry(0.015, 0.01, 0.015), GOLD, { bone: head, at: head.local({ left: 0.055, up: 0.056, back: 0.02 }), dir: flowerDir });

  // ======== Wings ========
  const WING = cellPaint(
    T2,
    (c) => {
      const y = c.at.y;
      const scallop = ((c.u + c.v) & 1) * 0.012;
      if (y < 0.8 + scallop && c.at.z < -0.08) return c.pick(NIGHT, 0.4 + 0.4 * c.n.y);
      if (y < 0.85 + scallop) return c.pick(CORAL, 0.35 + 0.4 * c.n.y + 0.2 * (noise(c.at, 0.1, 1) - 0.5));
      return c.pick(PINK, 0.55 + 0.3 * c.n.y + 0.2 * (noise(c.at, 0.12, 5) - 0.5));
    },
    { dither: true },
  );
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const k = s > 0 ? 1 : 2;
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.12, 0.94, 0.1],
        [s * 0.15, 0.92, -0.06],
        [s * 0.175, 0.9, -0.22],
        [s * 0.18, 0.86, -0.47],
      ]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "wing" },
    );
    const panel = b.sweep(wing, (t) => [0.024, 0.075 + 0.045 * Math.sin(Math.min(1, t * 1.3) * Math.PI) - 0.03 * t], {
      color: WING,
      sides: 8,
      name: `wing${S}`,
      caps: "round",
    });
    // shingled coverts: rows of little coral and pink feathers lying back along the wing
    const cov = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65].flatMap((t) => [75, 105, 135].map((deg) => panel.at(t, s * deg)));
    b.cards(cov, COVERT, { size: [0.05, 0.07], lean: 80, bend: 8, vary: 0.15, rng: rng(20 + k), sink: 0.3 });
    b.cards(
      [0.2, 0.4, 0.6].flatMap((t) => [20, 50].map((deg) => panel.at(t, s * deg))),
      FEATHER,
      { size: [0.055, 0.08], lean: 80, bend: 10, vary: 0.15, rng: rng(24 + k), color: FLUFF, sink: 0.3 },
    );
    // flight feathers fanned along the trailing edge
    b.cards(
      [0.3, 0.4, 0.5, 0.6, 0.7, 0.78].map((t) => panel.at(t, s * 170)),
      FLIGHT,
      { size: [0.065, 0.15], lean: 82, bend: 6, vary: 0.1, rng: rng(30 + k), flow: [s * 0.12, -0.12, -1], sink: 0.1 },
    );
    b.cards(
      [0.84, 0.89, 0.94, 0.98].map((t, i) => panel.at(t, s * (150 - i * 10))),
      FLIGHT,
      { size: [0.065, 0.19], lean: 86, bend: 5, flow: [s * 0.22, -0.05, -1], vary: 0.08, rng: rng(40 + k), sink: 0.05 },
    );
  }

  // ======== Legs ========
  const NAIL = "#2b2233";
  const WEB = cellPaint(T1, (c) => c.pick(SKIN_PINK, 0.35 + 0.5 * c.n.y + (c.u % 3 === 0 ? -0.2 : 0)), { dither: true });
  const legs: Chain[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const side = s > 0 ? 1 : 2;
    const hip = [s * 0.09, 0.76, -0.07] as const;
    const foot = [s * 0.1, 0.03, 0.0] as const;
    const pts = limb(hip, foot, [0.12, 0.36, 0.36], [[0, 0, 1], [0, 0, -1]]);
    const ankleY = pts[2].y;
    const LEGPAINT = cellPaint(
      T1,
      (c) => {
        const flush = Math.max(0, 1 - Math.abs(c.at.y - ankleY) / 0.055); // the ankle glows redder
        if (flush > 0.3) return c.pick(CORAL, 0.3 + 0.45 * flush + 0.25 * c.n.y);
        let v = 0.55 + 0.25 * c.n.z + 0.2 * (noise(c.at, 0.05, 6) - 0.5);
        if (c.v % 4 === 0) v -= 0.18; // scutes
        return c.pick(LEG, v);
      },
      { dither: true },
    );
    const leg = b.chain(`leg${S}`, pts, {
      parent: pelvis,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [foot[0], 0, foot[2] + 0.1],
    });
    legs.push(leg);
    const legSweep = b.sweep(
      leg,
      (t) => (t < 0.14 ? 0.06 - 0.025 * (t / 0.14) : t < 0.57 ? 0.036 - 0.012 * ((t - 0.14) / 0.43) : 0.024 - 0.006 * ((t - 0.57) / 0.43)),
      { color: LEGPAINT, sides: 8, name: `leg${S}` },
    );
    // thigh feathers, a little skirt down the top of the tibia
    const thigh = b.surface(legSweep).scatter(30, { rng: rng(50 + side), minDist: 0.045, filter: (h) => h.at.y > 0.58 });
    b.cards(thigh, FEATHER, { size: [0.07, 0.1], lean: 72, bend: 14, vary: 0.2, rng: rng(60 + side), color: FLUFF, sink: 0.3 });
    // ankle knob, the joint that bends the "wrong" way
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(0.036, 7, 5), cellPaint(T1, (c) => c.pick(CORAL, 0.45 + 0.4 * c.n.y), { dither: true }), {
      bone: ankle,
      at: ankle.at,
    });
    // webbed toes
    const f = leg.tip;
    if (!f) throw new Error("leg tip missing");
    const toes: Chain[] = [];
    [-32, 0, 32].forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const len = i === 1 ? 0.19 : 0.15;
      const dx = s * Math.sin(a);
      const dz = Math.cos(a);
      const p0 = [foot[0], 0.013, foot[2] - 0.005];
      const toe = b.chain(
        `toe${i + 1}${S}`,
        [p0, [p0[0] + dx * len * 0.5, 0.012, p0[2] + dz * len * 0.5], [p0[0] + dx * len, 0.011, p0[2] + dz * len]],
        { parent: f, names: [`toe${i + 1}${S}a`, `toe${i + 1}${S}b`, `toe${i + 1}${S}tip`], role: "digit" },
      );
      toes.push(toe);
      b.sweep(toe, (t) => [0.0135 - 0.004 * t, 0.0105 - 0.002 * t], { color: LEGPAINT, sides: 6, caps: "round", name: `toe${i + 1}${S}` });
      if (toe.tip) b.spike(toe.tip, toe.tip, 0.03, 0.008, { color: NAIL, sides: 5 });
    });
    b.membrane(toes[0], toes[1], { color: WEB, thickness: 0.006, scallop: 0.18, rows: 2 });
    b.membrane(toes[1], toes[2], { color: WEB, thickness: 0.006, scallop: 0.18, rows: 2 });
    const hal = b.chain(`hallux${S}`, [[foot[0], 0.015, foot[2] - 0.008], [foot[0], 0.012, foot[2] - 0.05]], {
      parent: f,
      names: [`hallux${S}`, `hallux${S}Tip`],
      role: "digit",
    });
    b.sweep(hal, [0.011, 0.008], { color: LEGPAINT, sides: 6, name: `hallux${S}` });
  }

  // ID band on the right tarsus (a story detail)
  const tarsus = legs[1].at(0.82);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), BAND, { at: tarsus.at, dir: tarsus.tangent, name: "idBand" });
  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.01, 8), BLUE, {
    at: legs[1].at(0.8).at,
    dir: tarsus.tangent,
    name: "idBandStripe",
  });

  // lily pad with a lotus bud at its feet: flat pixel cards lit from above
  b.cards([frame([0.3, 0.003, 0.12], [0, 1, 0])], LILY, { size: 0.28, lean: 90, flow: [0, 0, 1], mirror: true, sink: 0, bone: pelvis });
  b.cards([frame([-0.26, 0.003, -0.02], [0, 1, 0])], LILY, { size: 0.22, lean: 90, flow: [1, 0, 0], mirror: true, sink: 0, bone: pelvis });
  b.cards([frame([0.33, 0.01, 0.12], [0, 1, 0])], LOTUS, { size: 0.09, lean: 0, cross: true, sink: 0, bone: pelvis });
  // a butterfly hovering over the lotus
  b.cards([frame([0.3, 0.19, 0.2], [0, 0, 1])], BUTTERFLY, { size: [0.1, 0.07], lean: 0, sink: 0, bone: pelvis });
  return b.root;
}

