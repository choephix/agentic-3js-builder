import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import { cells, mix, paint, rgb, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Luna Moon Moth",
  description:
    "A giant, gentle luna moth, about two metres across, standing on fuzzy lilac legs with its mint wings raised in a shallow V. Big shiny anime eyes, a fluffy cream ruff, golden moon charms and four glowing moon-window eyespots.",
  style: "whimsical anime mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const CREAM = "#fff6e8";
const LILAC = "#b9a0f2";
const PLUM = "#4b2a7c";
const GOLD = "#ffc948";
const GOLD_SH = "#e8892c";
const PINK = "#ffc9e2";
const MINT = rgb("#c6f7d6");
const MINT_SH = rgb("#86d9bd");
const TEAL = rgb("#52d9c4");
const VEIN = rgb("#72d3a8");
const LEAD = rgb("#9068dd");
const LEAD_DK = rgb("#583aa8");
const FRINGE = rgb("#b79af5");
const GOLD_RGB = rgb(GOLD);

// ---------------------------------------------------------------- textures
const TUFT = svg(
  `<svg viewBox="0 0 32 40"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9c4dc"/><stop offset="0.45" stop-color="#fff0e6"/><stop offset="1" stop-color="#fffdf8"/></linearGradient></defs>
  <path d="M16 40 C4 37 1 25 5 13 C8 21 10 23 12 23 C10 14 12 6 16 0 C20 6 22 14 20 23 C22 23 24 21 27 13 C31 25 28 37 16 40Z" fill="url(#g)"/>
  <path d="M16 40 C8 38 6 33 7 29 C11 32 21 32 25 29 C26 33 24 38 16 40Z" fill="#d9b8ee" opacity="0.55"/></svg>`,
  { size: 96 },
);
const RUFF = svg(
  `<svg viewBox="0 0 32 44"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b79af0"/><stop offset="0.5" stop-color="#f3ecff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M16 44 C3 40 0 27 4 14 C7 22 9 25 11 25 C9 15 11 6 16 0 C21 6 23 15 21 25 C23 25 25 22 28 14 C32 27 29 40 16 44Z" fill="url(#g)"/></svg>`,
  { size: 96 },
);
const BARB = svg(
  `<svg viewBox="0 0 16 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff4ea"/><stop offset="1" stop-color="#b79af0"/></linearGradient></defs>
  <path d="M8 64 C1 46 3 16 8 0 C13 16 15 46 8 64Z" fill="url(#g)"/></svg>`,
  { size: 96 },
);
// Gold-and-violet tassel, drawn upside down: its cord is at the bottom edge, which is the root of a hanging card.
const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
  <rect x="10.5" y="52" width="3" height="12" fill="#ffc948"/>
  <circle cx="12" cy="50" r="4.6" fill="#ffc948"/>
  <path d="M7 47 C7 37 8 31 9 27 H15 C16 31 17 37 17 47 Z" fill="#9068dd"/>
  <rect x="6.4" y="41" width="11.2" height="3" fill="#ffc948"/>
  <rect x="8" y="27" width="8" height="3" fill="#ffc948"/>
  <g stroke="#ffc948" stroke-width="2.4" stroke-linecap="round"><path d="M9 27 L7.6 4"/><path d="M11 27 L10.4 2"/><path d="M13 27 L13.6 2"/><path d="M15 27 L16.4 4"/></g>
  <g stroke="#b79af5" stroke-width="2.4" stroke-linecap="round"><path d="M10 27 L9.2 10"/><path d="M14 27 L14.8 10"/></g>
  </svg>`,
  { size: 192 },
);
// Eyespot: a moon window ringed in gold and violet. Dark rings stay dark when it glows.
const EYESPOT = svg(
  `<svg viewBox="0 0 100 120">
  <ellipse cx="50" cy="60" rx="49" ry="59" fill="#3a1f66"/>
  <ellipse cx="50" cy="60" rx="43" ry="53" fill="#ffc948"/>
  <ellipse cx="50" cy="60" rx="38" ry="48" fill="#8a4fd6"/>
  <ellipse cx="50" cy="60" rx="32" ry="42" fill="#4f3cc4"/>
  <ellipse cx="50" cy="60" rx="27" ry="37" fill="#45e0d0"/>
  <ellipse cx="50" cy="60" rx="22" ry="31" fill="#1f1a63"/>
  <circle cx="50" cy="60" r="16" fill="#f4fffc"/>
  <circle cx="56" cy="55" r="14" fill="#1f1a63"/>
  <path d="M30 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#ffe27a"/>
  <path d="M69 82 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#ffe27a"/>
  <circle cx="68" cy="42" r="2.4" fill="#ffe27a"/><circle cx="36" cy="84" r="2.4" fill="#ffe27a"/>
  </svg>`,
  { size: 256 },
);
// Gold vine scroll laid on the wing roots.
const FILIGREE = svg(
  `<svg viewBox="0 0 100 100">
  <g fill="none" stroke="#ffc948" stroke-width="3.4" stroke-linecap="round">
  <path d="M6 92 C28 90 40 76 46 58 C52 40 66 30 86 28"/>
  <path d="M46 58 C36 54 30 44 36 36 C41 30 49 34 47 41"/>
  <path d="M64 36 C70 50 82 54 90 50 C95 46 91 39 85 42"/>
  <path d="M30 82 C20 74 18 62 26 58 C32 56 36 62 32 66"/>
  <path d="M62 66 C72 66 80 72 82 82 C82 88 76 90 74 85"/>
  <path d="M46 58 C52 66 58 66 62 66"/>
  </g>
  <g fill="#ffc948"><circle cx="86" cy="28" r="4.2"/><circle cx="47" cy="41" r="3.4"/><circle cx="85" cy="42" r="3.4"/><circle cx="32" cy="66" r="3.4"/><circle cx="74" cy="85" r="3.4"/><circle cx="6" cy="92" r="3.6"/></g>
  </svg>`,
  { size: 320 },
);
const EYE = animeEye({ iris: "#38d9c6", irisLight: "#c9fff0", irisDark: "#2a5fb8", blush: "#ff8fb8", size: 512 });

// ---------------------------------------------------------------- paints
const wingPaint = (o: { lead: number; teeth: number; hind: boolean }) =>
  cel(
    paint((p, _n, s) => {
      const [u, v] = s;
      const edge = 0.9 + 0.03 * zigzag(u * o.teeth);
      if (v > edge + 0.045) return PLUM_RGB;
      if (v > edge) return FRINGE;
      if (v > edge - 0.022) return GOLD_RGB;
      if (v < o.lead * 0.45) return LEAD_DK;
      if (v < o.lead) return LEAD;
      if (v < o.lead + 0.02) return GOLD_RGB;
      // gold dotted band inside the margin
      if (Math.abs(v - (edge - 0.07)) < 0.014 && (u * o.teeth * 1.6) % 1 < 0.45) return GOLD_RGB;
      const k = u * (o.hind ? 7 : 9) - Math.abs(v - 0.5) * 5.5;
      const centre = Math.abs(v - 0.5) < 0.012 && u > 0.04;
      if (centre || (u > 0.1 && Math.abs(k - Math.round(k)) < 0.045)) return VEIN;
      const sparkle = cells(p, 0.1, 3);
      if (sparkle.d1 < 0.055 && sparkle.id > 0.55 && v > o.lead + 0.05 && v < edge - 0.1) return GOLD_RGB;
      return mix(TEAL, mix(MINT, MINT_SH, smoothstep(0.55, 1, v) * 0.6), smoothstep(0.0, 0.4, u));
    }),
  );
const PLUM_RGB = rgb(PLUM);

export default function build() {
  const b = createBuilder({ name: "moonMoth", paintSize: 2048 });
  const rand = rng(11);

  // ---------------------------------------------------------------- skeleton: body
  const bodyPath = catmull([
    [0, 0.27, -0.86],
    [0, 0.31, -0.6],
    [0, 0.375, -0.32],
    [0, 0.42, -0.05],
    [0, 0.46, 0.12],
  ]);
  const core = b.joint("thorax", { at: [0, 0.43, -0.03], dir: [0, 0, 1], role: "spine" });
  const rootT = bodyPath.closestT(core.at);
  const abdomen = b.chain("abdomen", bodyPath.slice(rootT, 0), { parent: core, count: 4, role: "spine" });
  const neck = b.joint("neck", { parent: core, at: [0, 0.46, 0.1], aim: [0, 0.5, 0.24], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.5, 0.22], aim: [0, 0.51, 0.4], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.47, 0.33], aim: [0, 0.44, 0.4], role: "jaw" });

  const body = b.sweep(bodyPath, [0.024, 0.068, 0.106, 0.114, 0.12, 0.165, 0.165, 0.12], {
    bone: [abdomen, core, neck],
    sides: 10,
    color: cel(
      paint((_p, n, s) => {
        const t = s[0];
        const ring = t < 0.68 && (t * 14) % 1 < 0.13;
        const collar = t > 0.845 && t < 0.885;
        const collarLine = (t > 0.885 && t < 0.9) || (t > 0.832 && t < 0.845);
        if (collarLine) return GOLD;
        if (collar) return LEAD;
        if (ring) return LILAC;
        if (n.y < -0.35 + 0.18 * zigzag(t * 40)) return PINK;
        return CREAM;
      }),
    ),
  });
  const skinBody = b.surface(body);

  // ---------------------------------------------------------------- head
  const HEAD_C: [number, number, number] = [0, 0.51, 0.285];
  const skullPaint = cel(
    furEdge(CREAM, "#ffd9ea", { axis: [0, 1, 0], level: -0.5, teeth: 0.12, period: 0.03, along: [1, 0, 0] }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), skullPaint, {
    bone: head,
    at: HEAD_C,
    scale: [0.15, 0.13, 0.13],
    name: "skull",
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 33, 3)!;
    glow(b.decal(skin, EYE, { at: hit, size: [0.1, 0.137], mirror: s > 0, name: `eye${s > 0 ? "L" : "R"}` }), 0.9);
  }
  // cheek, crown and brow fluff
  const fluffHits = skin.scatter(46, {
    rng: rand,
    minDist: 0.045,
    filter: (h) => (Math.abs(h.n.x) > 0.62 && h.n.z < 0.45) || h.n.y > 0.72 || (h.n.y < -0.2 && h.n.z > -0.2),
  });
  b.cards(fluffHits, TUFT, { size: [0.055, 0.075], lean: 55, flow: [0, -0.3, -1], vary: 0.25, rng: rand, bend: 20 });

  // snout, jaw and curled proboscis
  b.part(new THREE.SphereGeometry(1, 10, 8), cel("#ffc7de"), {
    bone: head,
    at: [0, 0.465, 0.405],
    scale: [0.045, 0.03, 0.034],
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), cel("#f48cb4"), {
    bone: jaw,
    at: [0, 0.445, 0.385],
    scale: [0.04, 0.018, 0.036],
    name: "jawInside",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), cel("#fff0f6"), {
    bone: jaw,
    at: [0, 0.452, 0.385],
    scale: [0.044, 0.03, 0.04],
    name: "jawLip",
  });
  b.sweep(spiral([0, 0.43, 0.425], [0, 0.43, 0.452], [1, 0, 0], { turns: 1.3, r1: 0.008, pitch: 0 }), [0.007, 0.003], {
    bone: head,
    color: "#ff8fbd",
    sides: 5,
    name: "proboscis",
  });
  // forehead moon charm
  const crescent: Array<[number, number]> = [];
  for (let a = 160; a <= 380; a += 27.5) {
    crescent.push([0.036 * Math.cos((a * Math.PI) / 180), 0.036 * Math.sin((a * Math.PI) / 180)]);
  }
  for (let a = -14; a >= -166; a -= 38) {
    crescent.push([0.0335 * Math.cos((a * Math.PI) / 180), 0.018 + 0.0335 * Math.sin((a * Math.PI) / 180)]);
  }
  const brow = skin.around(HEAD_C).at(0, 50)!;
  b.extrude(crescent, {
    at: brow.moved([0, 0.002, 0]),
    x: [1, 0, 0],
    y: [0, 0.64, -0.77],
    thickness: 0.012,
    bevel: 0.003,
    detail: 0.34,
    color: cel(GOLD, GOLD_SH),
    bone: head,
    name: "foreheadMoon",
  });

  // ---------------------------------------------------------------- antennae (feathery combs)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.07, 0.64, 0.31],
      [s * 0.16, 0.81, 0.39],
      [s * 0.29, 0.97, 0.39],
      [s * 0.41, 1.08, 0.29],
    ]);
    const chain = b.chain(`antenna${side}`, path, {
      parent: head,
      names: [`antenna${side}1`, `antenna${side}2`, `antenna${side}3`, `antenna${side}Tip`],
      role: "tentacle",
    });
    const shaft = b.sweep(chain, [0.013, 0.004], { color: cel("#efe3ff"), sides: 6 });
    const groups: Array<[number, number, number]> = [
      [0.06, 0.4, 0.075],
      [0.4, 0.75, 0.06],
      [0.75, 0.98, 0.04],
    ];
    for (const [from, to, len] of groups) {
      const frames: Frame[] = [];
      b.along(shaft, Math.round((to - from) * 26), (at) => {
        for (const sign of [1, -1]) {
          const T = at.tangent.clone().normalize();
          const perp = new THREE.Vector3(T.y, -T.x, 0).normalize().multiplyScalar(sign);
          frames.push(frame(at, perp.multiplyScalar(0.85).add(T.clone().multiplyScalar(0.55)).normalize()));
        }
        return at;
      }, { from, to });
      b.cards(frames, BARB, { size: [0.022, len], flow: [0, 0, 1], lean: 0 });
    }
    // gold collar at the antenna root, with a tiny glowing bead on the tip
    b.part(new THREE.TorusGeometry(0.024, 0.0065, 5, 10), cel(GOLD, GOLD_SH), {
      bone: chain.joints[0],
      at: chain.at(0.04).at,
      dir: chain.at(0.04).tangent,
      axis: "z",
      name: `antennaRing${side}`,
    });
    glow(b.part(new THREE.IcosahedronGeometry(0.014, 0), "#ffe27a", { bone: chain.tip ?? chain.joints[2], at: path.at(1), flat: true }), 1);
  }

  // ---------------------------------------------------------------- legs
  const rows = [
    { key: "F", z: 0.07, hip: 0.085, foot: [0.2, 0.26] },
    { key: "M", z: -0.04, hip: 0.1, foot: [0.32, 0.01] },
    { key: "H", z: -0.13, hip: 0.09, foot: [0.24, -0.27] },
  ];
  const legMeshes: THREE.Mesh[] = [];
  const legPaint = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.9) return "#fff0f6";
      if ((t > 0.6 && t < 0.64) || (t > 0.3 && t < 0.34)) return GOLD;
      return t > 0.34 && t < 0.6 ? LILAC : CREAM;
    }),
  );
  for (const r of rows)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pts = limb(
        [s * r.hip, 0.315, r.z],
        [s * r.foot[0], 0.022, r.foot[1]],
        [0.15, 0.2, 0.12],
        [
          [s * 0.55, 1, 0.15 * (r.z > 0 ? 1 : -1)],
          [s * 0.8, 0.5, 0],
        ],
      );
      const leg = b.chain(`leg${r.key}${side}`, pts, {
        parent: core,
        names: [`hip${r.key}${side}`, `knee${r.key}${side}`, `ankle${r.key}${side}`, `foot${r.key}${side}`],
        role: "leg",
      });
      const tube = b.sweep(leg, [0.042, 0.018], { color: legPaint, sides: 6 });
      legMeshes.push(...tube.meshes);
      // gold anklet and a fluffy paw
      const ank = leg.at(0.62);
      b.part(new THREE.TorusGeometry(0.02, 0.0055, 5, 9), cel(GOLD, GOLD_SH), {
        bone: ank.bone,
        at: ank.at,
        dir: ank.tangent,
        axis: "z",
        name: `anklet${r.key}${side}`,
      });
      b.part(new THREE.SphereGeometry(1, 8, 6), cel("#fff0f6", LILAC), {
        bone: leg.tip ?? leg.joints[2],
        at: [s * r.foot[0], 0.021, r.foot[1] + 0.014],
        scale: [0.037, 0.023, 0.05],
        name: `paw${r.key}${side}`,
      });
      const claws = [-1, 0, 1].map((k) =>
        new THREE.ConeGeometry(0.0085, 0.04, 5)
          .rotateX(Math.PI / 2 + 0.45)
          .rotateY(k * 0.4)
          .translate(s * r.foot[0] + k * 0.017, 0.012, r.foot[1] + 0.058),
      );
      b.part(mergeGeometries(claws)!, cel(GOLD, GOLD_SH), {
        bone: leg.tip ?? leg.joints[2],
        at: [0, 0, 0],
        name: `claws${r.key}${side}`,
      });
    }
  b.cards(b.surface(legMeshes).scatter(170, { rng: rand, minDist: 0.034, filter: (h) => h.at.y > 0.06 }), TUFT, {
    size: [0.05, 0.07],
    lean: 70,
    flow: [0, -1, -0.2],
    vary: 0.25,
    rng: rand,
  });

  // ---------------------------------------------------------------- body fluff, ruff and charms
  const bodyHits = skinBody.scatter(560, {
    rng: rand,
    minDist: 0.042,
    filter: (h) => h.n.y > -0.75 && h.at.z > -0.78,
  });
  b.cards(bodyHits, TUFT, { size: [0.075, 0.11], lean: 62, flow: [0, -0.25, -1], vary: 0.3, rng: rand, bend: 20 });
  b.cards(
    skinBody.scatter(90, { rng: rand, minDist: 0.07, filter: (h) => h.n.y > 0.45 && h.at.z < -0.1 && h.at.z > -0.78 }),
    RUFF,
    { size: [0.085, 0.12], lean: 65, flow: [0, -0.2, -1], vary: 0.25, rng: rand, bend: 20 },
  );
  const ruff = b.ring(neck, { count: 13, radius: 0.12, fromDeg: -118, toDeg: 118 });
  b.cards(ruff.items, RUFF, { size: [0.09, 0.14], lean: 42, flow: [0, 0.1, 1], vary: 0.2, rng: rand, bend: 25 });
  const ruffLow = b.ring(neck, { count: 5, radius: 0.15, fromDeg: 135, toDeg: 225 });
  b.cards(ruffLow.items, RUFF, { size: [0.075, 0.1], lean: 55, flow: [0, -0.4, -1], vary: 0.2, rng: rand });

  // necklace of gold beads with a moon pendant
  const necklaceLoop = skinBody.loop(frame([0, 0.43, 0.075], [0, 0, 1]), { lift: 0.014 });
  b.sweep(necklaceLoop, 0.006, { color: cel(GOLD, GOLD_SH), sides: 5 });
  b.along(skinBody.loop(frame([0, 0.43, 0.075], [0, 0, 1]), { lift: 0.022 }), 22, (at) =>
    b.part(new THREE.IcosahedronGeometry(0.011, 0), "#ffe27a", { at, flat: true }),
  );
  const bottom = necklaceLoop.at(0.5);
  const pend = b.extrude(crescent, {
    at: [0, bottom.y - 0.05, bottom.z + 0.03],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.0035,
    detail: 0.34,
    color: cel(GOLD, GOLD_SH),
    bone: core,
    name: "pendant",
  });
  glow(b.part(new THREE.IcosahedronGeometry(0.014, 0), "#7ff5e4", { bone: core, at: pend.local([0, 0.014, 0.01]), flat: true }), 1);
  b.sweep(
    [
      [0, bottom.y, bottom.z + 0.012],
      [0, bottom.y - 0.012, bottom.z + 0.03],
    ],
    0.004,
    { bone: core, color: GOLD, sides: 4, name: "bail" },
  );

  // ---------------------------------------------------------------- wings
  // Wings rise from the shoulders in a V that flattens toward the tips, and lean back so the faces turn to the viewer.
  const th0 = (50 * Math.PI) / 180;
  const flatten = (24 * Math.PI) / 180;
  const lean = (16 * Math.PI) / 180;
  const place = (s: number, pts: Array<[number, number, number]>) =>
    pts.map(([x, yb, z]): [number, number, number] => {
      const d = x - 0.1;
      const dx = (Math.sin(th0) - Math.sin(th0 - flatten * d)) / flatten;
      const dy = yb + (Math.cos(th0 - flatten * d) - Math.cos(th0)) / flatten - 0.55;
      return [s * (0.1 + dx), 0.55 + dy * Math.cos(lean) - z * Math.sin(lean), dy * Math.sin(lean) + z * Math.cos(lean)];
    });
  const wingSamples: THREE.Vector3[] = [];
  const foreA: Array<[number, number, number]> = [
    [0.1, 0.56, 0.1],
    [0.4, 0.56, 0.075],
    [0.72, 0.575, 0.02],
    [1.06, 0.59, -0.16],
  ];
  const foreB: Array<[number, number, number]> = [
    [0.1, 0.56, 0.1],
    [0.14, 0.55, -0.3],
    [0.33, 0.55, -0.58],
    [0.62, 0.55, -0.64],
    [0.9, 0.55, -0.46],
    [1.06, 0.59, -0.16],
  ];
  const hindA: Array<[number, number, number]> = [
    [0.1, 0.53, -0.04],
    [0.36, 0.53, -0.1],
    [0.66, 0.53, -0.28],
    [0.72, 0.53, -0.58],
    [0.64, 0.53, -0.88],
    [0.6, 0.53, -1.1],
    [0.64, 0.53, -1.26],
    [0.57, 0.53, -1.42],
  ];
  const hindB: Array<[number, number, number]> = [
    [0.1, 0.53, -0.04],
    [0.14, 0.52, -0.5],
    [0.3, 0.52, -0.85],
    [0.46, 0.52, -1.05],
    [0.47, 0.52, -1.23],
    [0.57, 0.53, -1.42],
  ];
  const forePaint = wingPaint({ lead: 0.1, teeth: 16, hind: false });
  const hindPaint = wingPaint({ lead: 0.06, teeth: 14, hind: true });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    for (const kind of ["fore", "hind"] as const) {
      const A = place(s, kind === "fore" ? foreA : hindA);
      const B = place(s, kind === "fore" ? foreB : hindB);
      const count = kind === "fore" ? 3 : 4;
      const chain = b.chain(`${kind}wing${side}`, catmull(A), {
        parent: core,
        count,
        role: "wing",
        names: Array.from({ length: count }, (_, i) => `${kind}wing${side}${i + 1}`),
      });
      const edgeB = catmull(B);
      const cols = kind === "fore" ? 22 : 30;
      const wing = b.membrane(chain, edgeB, {
        bone: chain,
        thickness: 0.01,
        color: kind === "fore" ? forePaint : hindPaint,
        rows: 8,
        cols,
        name: `${kind}wingSkin${side}`,
      });
      for (let i = 0; i <= 14; i++)
        for (let j = 0; j <= 4; j++) wingSamples.push(chain.at(i / 14).at.clone().lerp(edgeB.at(i / 14), j / 4));
      const [u, v, size]: [number, number, [number, number]] =
        kind === "fore" ? [0.5, 0.52, [0.27, 0.32]] : [0.6, 0.55, [0.25, 0.3]];
      const c = chain.at(u).at.clone().lerp(edgeB.at(u), v);
      const target = b.surface(wing);
      const wingHit = target.nearest(c);
      const nrm = wingHit.n.y > 0 ? wingHit.n.clone() : wingHit.n.clone().negate();
      // Luminous underside: a thin flat-lilac sheet just below the painted wing, lit from within so the belly of the
      // wing never goes dark, with gold rims and violet veins on it.
      const sink = (pts: Array<[number, number, number]>, depth: number) =>
        pts.map(([x, y, z]): [number, number, number] => [x - nrm.x * depth, y - nrm.y * depth, z - nrm.z * depth]);
      const sheet = b.membrane(catmull(sink(A, 0.0115)), catmull(sink(B, 0.0115)), {
        bone: chain,
        thickness: 0.006,
        color: "#e6dcff",
        rows: 8,
        cols,
        name: `${kind}wingUnder${side}`,
      });
      for (const m of sheet) glow(m, 1);
      const sheetTarget = b.surface(sheet);
      for (const edge of [A, B])
        glow(b.sweep(catmull(sink(edge, 0.0125)), 0.0045, { bone: chain, color: GOLD, sides: 4, name: `${kind}Rim${side}` }), 1);
      for (const vv of [0.25, 0.5, 0.75]) {
        const pts = Array.from({ length: 9 }, (_, i): [number, number, number] => {
          const t = 0.04 + (0.92 * i) / 8;
          const p = chain.at(t).at.clone().lerp(edgeB.at(t), vv);
          return [p.x - nrm.x * 0.0125, p.y - nrm.y * 0.0125, p.z - nrm.z * 0.0125];
        });
        glow(b.sweep(catmull(pts), [0.005, 0.002], { bone: chain, color: "#a58ee6", sides: 4, name: `${kind}Vein${side}` }), 1);
      }
      for (const face of [1, -1]) {
        glow(
          b.decal(face > 0 ? target : sheetTarget, EYESPOT, {
            at: c,
            dir: nrm.clone().multiplyScalar(face),
            up: [0, 0, 1],
            size,
            mirror: face < 0,
            segments: 12,
            lift: 0.002,
            name: `${kind}Eyespot${side}${face > 0 ? "Top" : "Under"}`,
          }),
          1,
        );
      }
      for (const [fu, fv, fsize] of kind === "fore"
        ? ([
            [0.2, 0.5, 0.22],
            [0.84, 0.4, 0.12],
          ] as const)
        : ([[0.3, 0.45, 0.2]] as const))
        b.decal(target, FILIGREE, {
          at: chain.at(fu).at.clone().lerp(edgeB.at(fu), fv),
          dir: nrm,
          up: [0, 0, 1],
          size: [fsize, fsize],
          mirror: s < 0,
          segments: 12,
          lift: 0.002,
          name: `${kind}Filigree${side}${fu}`,
        });
      // gold clasp where the wing meets the body
      const root = chain.at(0.02).at;
      b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 8), cel(GOLD, GOLD_SH), {
        bone: chain.joints[0],
        at: root,
        dir: nrm,
        name: `${kind}Clasp${side}`,
      });
      b.part(new THREE.IcosahedronGeometry(0.02, 1), kind === "fore" ? "#ff7fb4" : "#4fe3d0", {
        bone: chain.joints[0],
        at: [root.x, root.y + 0.018, root.z],
        flat: true,
        name: `${kind}Gem${side}`,
      });
      if (kind === "hind") {
        const tip = chain.at(1).at;
        glow(
          b.part(new THREE.IcosahedronGeometry(0.036, 1), "#d9c4ff", {
            bone: chain.joints[count - 1],
            at: [tip.x, tip.y, tip.z],
            flat: true,
            name: `tailPearl${side}`,
          }),
          1,
        );
        b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), cel(GOLD, GOLD_SH), {
          bone: chain.joints[count - 1],
          at: [tip.x, tip.y, tip.z + 0.03],
          dir: [0, 0, 1],
          axis: "z",
          name: `tailCap${side}`,
        });
        b.cards([frame([tip.x, tip.y - 0.012, tip.z + 0.03], [0, 1, 0])], TASSEL, {
          size: [0.06, 0.2],
          lean: 180,
          flow: [0, 0, 1],
          cross: true,
          bone: chain.joints[count - 1],
        });
      }
    }
  }

  // ---------------------------------------------------------------- moon dust
  const sparkle = (r: number) => {
    const parts: THREE.BufferGeometry[] = [];
    for (const sc of [
      [0.4, 1.5, 0.4],
      [1.5, 0.4, 0.4],
    ]) parts.push(new THREE.OctahedronGeometry(r, 0).scale(sc[0], sc[1], sc[2]));
    return mergeGeometries(parts)!;
  };
  const golds: THREE.BufferGeometry[] = [];
  const mints: THREE.BufferGeometry[] = [];
  const pinks: THREE.BufferGeometry[] = [];
  let placed = 0;
  while (placed < 26) {
    const x = (rand() * 2 - 1) * 0.98;
    const y = 0.1 + rand() * 1.2;
    const z = -1.1 + rand() * 1.6;
    if (wingSamples.some((w) => w.distanceTo(new THREE.Vector3(x, y, z)) < 0.14)) continue;
    if (Math.abs(x) < 0.3 && y > 0.2 && y < 1.15 && z > -0.95 && z < 0.5) continue;
    const g = sparkle(0.014 + rand() * 0.016).rotateY(rand() * 3).translate(x, y, z);
    (placed % 3 === 0 ? golds : placed % 3 === 1 ? mints : pinks).push(g);
    placed++;
  }
  glow(b.part(mergeGeometries(golds)!, "#ffe27a", { bone: core, at: [0, 0, 0], name: "dustGold" }), 1);
  glow(b.part(mergeGeometries(mints)!, "#8ff5e6", { bone: core, at: [0, 0, 0], name: "dustMint" }), 1);
  glow(b.part(mergeGeometries(pinks)!, "#ffa8d2", { bone: core, at: [0, 0, 0], name: "dustPink" }), 1);

  return b.root;
}
