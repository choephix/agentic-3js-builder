// Wandering wind swordsman, Genshin Impact style: cel-shaded white-and-navy travelling coat with teal anemo trims,
// gold filigree, a long wind-caught scarf, a straw hat on his back and a glowing wind blade held low in his right hand.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { lerp, rng } from "../src/math";
import { arc, bezier, catmull, polyline, spiral } from "../src/path";
import { limb } from "../src/ik";
import { paint } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { animeEye, cel } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Wandering Wind Swordsman",
  description:
    "A cel-shaded anemo swordsman in a white travelling coat with teal and gold trims, a wind-blown scarf, a straw hat slung on his back and a glowing wind blade held low at his side.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const WHITE = cel("#f7f3e8", "#b7c6dc");
const TEAL = cel("#3ed6bd", "#2a86b4");
const TEAL_D = cel("#1f929c", "#1a5a8c");
const NAVY = cel("#26365f", "#171f48");
const NAVY_L = cel("#3d5683", "#262f66");
const GOLD = cel("#f6c552", "#b9742c");
const LEATHER = cel("#7c4e33", "#4a2b33");
const SKIN = cel("#ffe0c6", "#f2b3a2");
const HAIR = cel("#2d4272", "#1a2250");
const HAIR_TIP = cel("#8ff2da", "#42b0c6");
const STRAW = cel("#e6c378", "#b5834c");
const STRAW_D = cel("#c99a56", "#8f5f3e");
const WHITE2 = cel("#e9f1ef", "#a9bcd6");
const CLOTH = paint((p, _n, _s) => {
  const u = p.x + p.z * 0.9;
  return (Math.floor(u * 34 + p.y * 34) + Math.floor(u * 34 - p.y * 34)) % 2 === 0 ? WHITE : WHITE2;
});
const LIP = "#d9707a";
const MINT = "#b9fff1"; // glowing wind
const MINT_D = "#4fe6c8";
const IRIS = "#3fe0c4";

type Pt = [number, number, number];
const prof = (keys: [number, number][]) => (t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, r0] = keys[i - 1];
      const [t1, r1] = keys[i];
      return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ringPts = (c: Pt, rx: number, rz: number, n = 10, tilt = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [c[0] + Math.sin(a) * rx, c[1] + Math.cos(a) * tilt, c[2] + Math.cos(a) * rz];
  });

// ---------------------------------------------------------------- drawings
const EYE = animeEye({ iris: IRIS, irisLight: "#c8fff0", irisDark: "#1b6ea8", blush: "#ff8fa0" });

const FEATHER = svg(
  `<svg viewBox="0 0 40 100"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#1f929c"/><stop offset="0.45" stop-color="#3ed6bd"/><stop offset="1" stop-color="#f7f3e8"/></linearGradient></defs>
  <path d="M20 99 C3 80 1 38 20 1 C39 38 37 80 20 99Z" fill="url(#g)" stroke="#f6c552" stroke-width="4"/>
  <path d="M20 94 L20 14" stroke="#1a5a8c" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 70 L8 56 M20 56 L10 42 M20 42 L12 30 M20 70 L32 56 M20 56 L30 42 M20 42 L28 30" stroke="#1a5a8c" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>
  </svg>`,
  { size: 192 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 160 24"><g fill="none" stroke="#f6c552" stroke-width="2.2" stroke-linecap="round">
  <path d="M0 12 H160" stroke-width="1.6"/>
  ${Array.from({ length: 8 }, (_, i) => {
    const x = 10 + i * 20;
    return `<path d="M${x - 8} 12 C${x - 8} 2 ${x + 4} 2 ${x + 4} 9 C${x + 4} 14 ${x - 2} 14 ${x - 2} 10"/><path d="M${x + 2} 12 C${x + 2} 22 ${x + 14} 22 ${x + 14} 15 C${x + 14} 10 ${x + 8} 10 ${x + 8} 14"/>`;
  }).join("")}
  </g></svg>`,
  { size: 640 },
);

const GUST = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1f2a52" stroke="#f6c552" stroke-width="4"/>
  <g fill="none" stroke="#7ff3d8" stroke-width="4.4" stroke-linecap="round">
  <path d="M32 32 C32 24 42 22 44 30 C46 40 32 46 22 40 C14 34 18 20 30 16 C40 13 50 18 52 26"/>
  <path d="M14 46 C20 52 30 54 38 51" stroke="#f6c552" stroke-width="3"/><path d="M12 24 C14 18 20 14 26 12" stroke="#f6c552" stroke-width="3"/></g></svg>`,
  { size: 192 },
);

const SWIRL_SIDE = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#f6c552" stroke-width="3" stroke-linecap="round">
  <circle cx="32" cy="32" r="28" stroke-width="2"/>
  <path d="M32 32 C32 26 38 25 39 30 C40 36 31 38 27 34 C22 29 26 21 33 20 C41 19 46 25 45 32"/>
  <path d="M10 32 C12 20 22 12 32 10 M54 32 C52 44 42 52 32 54"/></g></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "windSwordsman" });

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.96, 0], role: "spine", group: "torso" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.96, 0],
      [0, 1.1, 0],
      [0, 1.26, 0.01],
      [0, 1.42, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.43, 0], aim: [0, 1.545, 0.015], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.545, 0.015], aim: [0, 1.7, 0.03], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.585, -0.02], aim: [0, 1.56, 0.06], role: "jaw", group: "head" });

  // ================================================================ legs
  const legs: Record<string, Chain> = {};
  const toes: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.09, 0.93, 0], [s * 0.1, 0.1, -0.005], [0.43, 0.41], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.04],
      group: "legs",
    });
    legs[L] = leg;
    toes[L] = b.joint(`toe${L}`, { parent: leg.tip ?? leg.joints[2], at: [s * 0.1, 0.045, 0.1], aim: [s * 0.1, 0.035, 0.2], role: "hinge", group: "legs" });
  }

  // ================================================================ arms
  const arms: Record<string, Chain> = {};
  const armPts: Record<string, Pt[]> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shoulder: Pt = [s * 0.19, 1.385, 0];
    const lm = limb(shoulder, [s * 0.465, 0.95, 0.075], [0.29, 0.26], [0, 0, -1]);
    const pts: Pt[] = [[s * 0.045, 1.4, 0], ...lm.map((p) => [p.x, p.y, p.z] as Pt)];
    armPts[L] = pts;
    arms[L] = b.chain(`arm${L}`, polyline(pts), {
      parent: chest,
      names: [`clav${L}`, `shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
      group: "arms",
    });
  }

  // ================================================================ torso
  const torsoPaint = paint((p, _n, _s) => {
    const front = p.z > 0.0;
    const open = Math.max(0, (p.y - 1.1) / 0.33) * 0.1;
    if (front && p.y > 1.1 && Math.abs(p.x) < open) return NAVY;
    if (p.y > 1.35 && Math.abs(p.x) > 0.075) return TEAL;
    if (p.y < 1.03) return NAVY;
    if (front && p.y > 1.1 && Math.abs(p.x) < open + 0.008) return GOLD;
    return CLOTH;
  });
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.28, h: 0.19 },
      { at: [0, 0.98, 0], w: 0.31, h: 0.2 },
      { at: [0, 1.1, 0.005], w: 0.27, h: 0.18 },
      { at: [0, 1.26, 0.01], w: 0.33, h: 0.21 },
      { at: [0, 1.37, 0.0], w: 0.35, h: 0.2 },
      { at: [0, 1.44, -0.005], w: 0.15, h: 0.14 },
    ],
    { bone: [spine, hips], color: torsoPaint, sides: 12, group: "torso" },
  );
  const skin = b.surface(torso);

  // navy collar and lapels
  b.sweep(catmull(ringPts([0, 1.465, 0], 0.075, 0.07, 10), { closed: true }), [0.012, 0.028], {
    section: "box", bone: neck, color: NAVY, sides: 10, name: "collar",
  });
  b.sweep(catmull(ringPts([0, 1.488, 0], 0.07, 0.066, 10), { closed: true }), [0.006, 0.01], {
    section: "box", bone: neck, color: GOLD, name: "collarTrim",
  });
  for (const s of [1, -1]) {
    const lap = skin.drape(
      catmull([
        [s * 0.085, 1.43, 0.06],
        [s * 0.06, 1.36, 0.1],
        [s * 0.03, 1.25, 0.115],
        [s * 0.003, 1.13, 0.115],
      ]),
      { lift: 0.008 },
    );
    b.sweep(lap, [0.012, 0.006], { section: "box", color: GOLD, name: "lapel" });
    // gold coat buttons
  }
  for (let i = 0; i < 4; i++) {
    const hit = skin.ray([0, 1.4 - i * 0.06, 0.5], [0, 0, -1]);
    if (hit) b.stick(new THREE.SphereGeometry(0.01, 6, 4), GOLD, hit, { embed: 0.3, name: "button" });
  }

  // belt / sash
  const beltPath = skin.loop([0, 1.065, 0], { lift: 0.012 });
  b.sweep(beltPath, [0.014, 0.055], { section: "box", color: paint((_p, _n, s) => (Math.abs(((s[0] * 40) % 1) - 0.5) < 0.04 ? GOLD : NAVY_L)), name: "sash" });
  b.sweep(skin.loop([0, 1.115, 0], { lift: 0.012 }), [0.01, 0.01], { color: GOLD, name: "sashTrimU" });
  b.sweep(skin.loop([0, 1.015, 0], { lift: 0.012 }), [0.01, 0.01], { color: GOLD, name: "sashTrimD" });
  b.along(skin.loop([0, 1.065, 0], { lift: 0.034 }), 26, (at) => b.part(new THREE.SphereGeometry(0.0072, 5, 4), GOLD, { at, name: "sashStud" }));
  // buckle
  const buckle = b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.048, 0.008],
      [0.04, 0.016],
      [0, 0.016],
    ],
    { at: [0, 1.065, 0.115], axis: [0, 0.05, 1], bone: hips, color: GOLD, segments: 8, name: "buckle" },
  );
  b.part(new THREE.CircleGeometry(0.036, 16), "#ffffff", { at: [0, 1.065, 0.1325], dir: [0, 0, 1], axis: "z", texture: GUST, bone: hips, name: "buckleEmblem" });
  void buckle;

  // coat tails on chains hanging from the hips
  const tailPaint = (tealBand: boolean) =>
    paint((_p, _n, s) => (s[0] > 0.955 ? GOLD : s[0] > 0.9 ? (tealBand ? TEAL : NAVY_L) : s[0] > 0.885 ? GOLD : CLOTH));
  const tailsUp = (s: number): [number, number, number] => [s, 0, 0];
  type Tail = { name: string; pts: Pt[]; up?: [number, number, number]; w: [number, number]; dir: [number, number, number] };
  const tails: Tail[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    tails.push(
      { name: `frontTail${L}`, w: [0.08, 0.072], dir: [0, 0, 1], pts: [[s * 0.085, 1.04, 0.104], [s * 0.09, 0.9, 0.128], [s * 0.1, 0.74, 0.14], [s * 0.115, 0.6, 0.136]] },
      { name: `sideTail${L}`, w: [0.075, 0.07], dir: [s, 0, 0], up: tailsUp(s), pts: [[s * 0.15, 1.035, 0.0], [s * 0.19, 0.9, 0.0], [s * 0.21, 0.75, -0.01], [s * 0.225, 0.62, -0.045]] },
      { name: `backTail${L}`, w: [0.075, 0.068], dir: [0, 0, -1], pts: [[s * 0.07, 1.035, -0.105], [s * 0.09, 0.88, -0.13], [s * 0.115, 0.68, -0.16], [s * 0.14, 0.5, -0.22]] },
    );
  }
  for (const t of tails) {
    const ch = b.chain(t.name, catmull(t.pts), { parent: hips, up: t.up, count: 3, group: "coat" });
    const sw = b.sweep(ch, (u) => [t.w[0] + (t.w[1] - t.w[0]) * u, 0.011], { section: "box", color: tailPaint(t.name.includes("front")), name: t.name });
    const pt = sw.at(0.8, 0);
    b.decal(sw, FILIGREE, { at: pt.at, dir: t.dir, size: [0.13, 0.02], segments: 8, name: `${t.name}Fil` });
    if (t.name.includes("front")) b.decal(sw, SWIRL_SIDE, { at: sw.at(0.5, 0).at, dir: t.dir, size: [0.07, 0.07], segments: 6, name: `${t.name}Swirl` });
  }
  // sash knot and tassel ties on the left hip
  const knotAt: Pt = [0.15, 1.06, 0.075];
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NAVY_L, { at: knotAt, bone: hips, scale: [1, 0.9, 0.8], name: "sashKnot" });
  const tie = b.chain("sashTie", catmull([[0.16, 1.05, 0.08], [0.2, 0.92, 0.1], [0.23, 0.78, 0.09], [0.24, 0.68, 0.07]]), { parent: hips, count: 3, group: "coat" });
  b.sweep(tie, prof([[0, 0.014], [0.7, 0.012], [1, 0.008]]), { section: "box", color: tailPaint(true), name: "sashTieTail" });
  b.sweep(tie, [0.007, 0.001], { color: GOLD, from: 0.92, to: 1, extend: 0.0, name: "tieTip" });
  const tasselEnd = tie.at(1).at;
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), MINT_D, { at: [tasselEnd.x, tasselEnd.y - 0.02, tasselEnd.z], bone: tie.joints[2], name: "tieBead" }), 1);

  // ================================================================ neck, scarf
  b.sweep(catmull([[0, 1.42, 0], [0, 1.5, 0.012], [0, 1.56, 0.02]]), 0.043, { bone: neck, color: SKIN, name: "neck" });
  const scarfWrap = paint((p, _n, _s) => (Math.abs(((p.x * 1.2 + p.z) * 22) % 1) < 0.1 ? GOLD : TEAL));
  b.sweep(catmull(ringPts([0, 1.435, 0], 0.084, 0.082, 10, 0.008), { closed: true }), 0.03, { bone: neck, color: scarfWrap, sides: 8, name: "scarfLow" });
  b.sweep(catmull(ringPts([0, 1.47, -0.002], 0.077, 0.075, 10, -0.008), { closed: true }), 0.026, { bone: neck, color: TEAL, sides: 8, name: "scarfHigh" });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), TEAL_D, { at: [0.06, 1.44, 0.075], bone: neck, scale: [1, 0.85, 0.9], name: "scarfKnot" });
  const scarfPaint = paint((p, _n, s) => {
    if (s[0] > 0.96) return GOLD;
    if (s[0] > 0.9) return WHITE;
    return Math.abs(Math.sin((p.y + p.z) * 16)) < 0.1 ? GOLD : TEAL;
  });
  const scarfA = b.chain(
    "scarfA",
    catmull([[0.07, 1.43, -0.06], [0.16, 1.31, -0.19], [0.27, 1.14, -0.31], [0.34, 0.95, -0.4], [0.3, 0.77, -0.52], [0.2, 0.64, -0.68], [0.08, 0.6, -0.84]]),
    { parent: chest, count: 6, twist: 160, role: "tail", group: "scarf" },
  );
  b.sweep(scarfA, (t) => [0.048 + 0.012 * t, 0.008], { section: "box", color: scarfPaint, name: "scarfTailA", caps: "flat" });
  const scarfB = b.chain(
    "scarfB",
    catmull([[-0.06, 1.43, -0.07], [-0.13, 1.28, -0.2], [-0.2, 1.1, -0.3], [-0.23, 0.92, -0.38], [-0.17, 0.82, -0.5], [-0.12, 0.74, -0.6]]),
    { parent: chest, count: 5, twist: -120, role: "tail", group: "scarf" },
  );
  b.sweep(scarfB, (t) => [0.04 + 0.01 * t, 0.008], { section: "box", color: scarfPaint, name: "scarfTailB", caps: "flat" });

  // ================================================================ head
  const skullC: Pt = [0, 1.635, 0.005];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { bone: head, at: skullC, scale: [0.098, 0.105, 0.105], name: "skull" });
  const face = b.loft(
    [
      { at: [0, 1.625, 0.026], w: 0.17, h: 0.17 },
      { at: [0, 1.595, 0.032], w: 0.166, h: 0.16 },
      { at: [0, 1.572, 0.036], w: 0.15, h: 0.148 },
    ],
    { bone: head, color: SKIN, sides: 12, caps: { start: "flat", end: "round" }, name: "cheeks" },
  );
  const chin = b.loft(
    [
      { at: [0, 1.583, 0.034], w: 0.152, h: 0.15 },
      { at: [0, 1.553, 0.04], w: 0.125, h: 0.13 },
      { at: [0, 1.53, 0.052], w: 0.075, h: 0.095 },
      { at: [0, 1.517, 0.062], w: 0.036, h: 0.05 },
    ],
    { bone: jaw, color: SKIN, sides: 12, name: "chin" },
  );
  const faceSurf = b.surface([skull, face, chin]);
  for (const s of [1, -1]) {
    const hit = faceSurf.around(V(0, 1.62, 0.0)).at(s * 29, -8);
    if (hit) b.decal(faceSurf, EYE, { at: hit, dir: [s * 0.18, 0, 1], size: [0.066, 0.09], mirror: s > 0, segments: 12, name: `eye${s > 0 ? "L" : "R"}` });
  }
  // nose and mouth
  b.part(new THREE.ConeGeometry(0.011, 0.028, 5), SKIN, { at: [0, 1.598, 0.121], dir: [0, -0.35, 1], name: "nose" });
  const mouthHit = faceSurf.ray([0, 1.552, 0.5], [0, 0, -1]);
  if (mouthHit) {
    const mp = faceSurf.drape(catmull([[-0.022, 1.553, 0.1], [-0.008, 1.548, 0.108], [0.008, 1.549, 0.108], [0.022, 1.555, 0.1]]), { lift: 0.0015 });
    b.sweep(mp, 0.0028, { color: LIP, bone: head, sides: 4, name: "mouth" });
  }
  // ears with earring
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.03, -0.005], [-0.012, -0.03], [0.008, -0.026], [0.02, 0.0], [0.014, 0.03], [-0.004, 0.052, "sharp"], [-0.03, 0.02]],
      { at: [s * 0.096, 1.612, 0.0], x: [0, 0, 1], y: [s * 0.3, 1, 0], thickness: 0.012, bevel: 0.003, color: SKIN, bone: head, name: `ear${s > 0 ? "L" : "R"}` },
    );
  }
  b.part(new THREE.TorusGeometry(0.014, 0.0035, 5, 10), GOLD, { at: [0.098, 1.585, 0.0], dir: [1, 0, 0], axis: "z", bone: head, name: "earring" });
  glow(b.part(new THREE.OctahedronGeometry(0.011), MINT_D, { at: [0.099, 1.565, 0.0], bone: head, scale: [0.8, 1.6, 0.8], name: "earringGem" }), 1);
  b.cards([frame([0.099, 1.555, 0.0], [0, 1, 0])], FEATHER, { size: [0.022, 0.07], lean: 180, flow: [0, 0, 1], bone: head, sink: 0, name: "earFeather" });

  // ================================================================ hair
  const capC = V(0, 1.645, -0.01);
  const cap = b.part(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.555), paintCap(), {
    bone: head,
    at: capC,
    rotation: [-25, 0, 0],
    scale: [0.113, 0.113, 0.117],
    name: "hairCap",
  });
  function paintCap() {
    return paint((p, _n, _s) => (p.y < 1.585 + 0.03 * Math.sin(p.x * 40) && p.z < 0.0 ? HAIR_TIP : HAIR));
  }
  const capSurf = b.surface(cap);
  const HAIR_LOCK = paint((_p, _n, s) => (s[0] > 0.68 ? HAIR_TIP : s[0] > 0.6 ? TEAL : HAIR));
  const hairAt = (az: number, el: number) => capSurf.around(capC).at(az, el);
  const lockDefs: [number, number, Pt, number, number][] = [
    // bangs
    [-50, 40, [-0.098, 1.628, 0.088], 0.03, 0.022],
    [-34, 52, [-0.07, 1.64, 0.118], 0.035, 0.025],
    [-12, 58, [-0.03, 1.625, 0.128], 0.045, 0.028],
    [10, 58, [0.022, 1.64, 0.128], 0.04, 0.026],
    [30, 52, [0.07, 1.648, 0.119], 0.035, 0.025],
    [48, 40, [0.1, 1.63, 0.09], 0.03, 0.022],
    // long side locks
    [76, 8, [0.112, 1.49, 0.07], 0.025, 0.03],
    [-76, 8, [-0.112, 1.49, 0.07], 0.025, 0.03],
    [68, 22, [0.098, 1.46, 0.09], 0.02, 0.022],
    [-68, 22, [-0.098, 1.46, 0.09], 0.02, 0.022],
    // nape and back
    [150, -4, [0.07, 1.44, -0.105], 0.03, 0.032],
    [-150, -4, [-0.07, 1.44, -0.105], 0.03, 0.032],
    [178, -8, [0.02, 1.4, -0.12], 0.03, 0.03],
    [-178, -8, [-0.02, 1.4, -0.12], 0.03, 0.03],
    [128, -2, [0.112, 1.49, -0.06], 0.03, 0.03],
    [-128, -2, [-0.112, 1.49, -0.06], 0.03, 0.03],
    [165, 30, [0.1, 1.5, -0.14], 0.035, 0.03],
    [-165, 30, [-0.1, 1.5, -0.14], 0.035, 0.03],
    // crown flicks
    [160, 55, [0.07, 1.67, -0.18], 0.035, 0.024],
    [-160, 55, [-0.07, 1.67, -0.18], 0.035, 0.024],
    [110, 62, [0.14, 1.67, -0.08], 0.035, 0.024],
    [-110, 62, [-0.14, 1.67, -0.08], 0.035, 0.024],
    // inner fringe strands
    [-22, 50, [-0.045, 1.612, 0.126], 0.03, 0.014],
    [2, 52, [0.0, 1.605, 0.13], 0.03, 0.014],
    [18, 50, [0.045, 1.615, 0.126], 0.03, 0.014],
    [38, 45, [0.085, 1.605, 0.108], 0.03, 0.014],
    [-42, 45, [-0.085, 1.61, 0.108], 0.03, 0.014],
    // cowlick
    [20, 80, [0.04, 1.8, 0.1], 0.07, 0.016],
  ];
  lockDefs.forEach(([az, el, tip, lift, r], i) => {
    const hit = hairAt(az, el);
    if (!hit) return;
    const ctrl = lerp(hit, tip, 0.5).addScaledVector(hit.n, lift);
    b.sprout(`lock${i}`, hit, bezier(hit, ctrl, tip), [r, 0.003], { count: 0, color: HAIR_LOCK, caps: { end: "point" }, sides: 6, group: "hair" });
  });
  // ponytail
  const tieHit = hairAt(180, 28)!;
  const pony = b.sprout(
    "ponytail",
    tieHit,
    catmull([tieHit, [0, 1.68, -0.2], [0.0, 1.58, -0.27], [0.03, 1.42, -0.31], [0.05, 1.26, -0.3], [0.04, 1.12, -0.26]]),
    [0.04, 0.005],
    { count: 4, role: "tail", color: HAIR_LOCK, caps: { end: "point" }, sides: 8, group: "hair" },
  );
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sp = b.chain(
      `ponyStrand${L}`,
      catmull([[s * 0.01, 1.69, -0.14], [s * 0.05, 1.62, -0.3], [s * 0.1, 1.46, -0.37], [s * 0.13, 1.3, -0.34]]),
      { parent: head, count: 3, role: "tail", group: "hair" },
    );
    b.sweep(sp, [0.03, 0.004], { color: HAIR_LOCK, caps: { end: "point" }, sides: 6, name: `ponyStrand${L}` });
  }
  const ponyBase = pony.chain?.joints[0];
  b.part(new THREE.TorusGeometry(0.036, 0.009, 5, 10), GOLD, { at: tieHit.moved([0, 0.05, 0]), dir: [0, 0.7, -1], axis: "z", bone: ponyBase ?? head, name: "hairTie" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), TEAL, { at: tieHit.moved([0.03, 0.05, 0]), bone: head, name: "hairTieBead" });
  // hairpin with tassel at the right temple
  b.rod([-0.09, 1.7, 0.03], [-0.115, 1.665, 0.04], 0.005, { bone: head, color: GOLD, name: "hairpin" });
  glow(b.part(new THREE.OctahedronGeometry(0.014), MINT_D, { at: [-0.118, 1.66, 0.042], bone: head, scale: [1, 1.3, 1], name: "hairpinGem" }), 1);
  b.cards([frame([-0.118, 1.648, 0.042], [0, 1, 0])], FEATHER, { size: [0.03, 0.1], lean: 180, flow: [0, 0, 1], bone: head, sink: 0, name: "hairpinFeather" });

  // ================================================================ legs: trousers, boots
  const PANTS = NAVY;
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = legs[L];
    b.sweep(leg, prof([[0, 0.088], [0.25, 0.082], [0.5, 0.066], [0.66, 0.07]]), { from: 0, to: 0.66, color: PANTS, sides: 10, caps: { start: "round", end: "flat" }, name: `trousers${L}` });
    b.sweep(leg, prof([[0.6, 0.057], [0.66, 0.057], [0.8, 0.05], [1, 0.046]]), { from: 0.6, to: 1, color: paint((p, _n, _s) => (p.y < 0.22 && p.y > 0.2 ? GOLD : NAVY_L)), sides: 10, caps: { start: "flat", end: "round" }, name: `boot${L}` });
    b.sweep(leg, prof([[0.6, 0.066], [1, 0.066]]), { from: 0.6, to: 0.645, color: GOLD, sides: 10, caps: "flat", name: `bootCuff${L}` });
    b.sweep(leg, prof([[0.72, 0.056], [1, 0.056]]), { from: 0.72, to: 0.745, color: LEATHER, sides: 10, caps: "flat", name: `bootStrapA${L}` });
    b.sweep(leg, prof([[0.84, 0.052], [1, 0.052]]), { from: 0.84, to: 0.865, color: LEATHER, sides: 10, caps: "flat", name: `bootStrapB${L}` });
    for (const t of [0.73, 0.85]) {
      const bp = leg.at(t);
      b.part(new THREE.BoxGeometry(0.012, 0.022, 0.022), GOLD, { at: [bp.at.x + s * 0.05, bp.at.y, bp.at.z + 0.018], bone: bp.bone ?? undefined, name: `bootBuckle${L}` });
    }
    // knee guard
    const kc = leg.at(0.5);
    b.part(new THREE.SphereGeometry(0.05, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45), GOLD, { at: [kc.at.x, kc.at.y + 0.005, kc.at.z + 0.045], dir: [0, 0.4, 1], bone: kc.bone ?? undefined, scale: [0.9, 1, 0.5], name: `kneeGuard${L}` });
    // feet
    const bootP = paint((p, _n, _s) => (p.y < 0.02 ? LEATHER : p.z > 0.15 ? GOLD : NAVY_L));
    b.loft(
      [
        { at: [s * 0.1, 0.066, -0.06], w: 0.09, h: 0.132 },
        { at: [s * 0.1, 0.05, 0.025], w: 0.098, h: 0.1 },
        { at: [s * 0.1, 0.039, 0.095], w: 0.098, h: 0.078 },
      ],
      { bone: legs[L].tip ?? legs[L].joints[2], color: bootP, sides: 10, name: `foot${L}` },
    );
    b.loft(
      [
        { at: [s * 0.1, 0.039, 0.09], w: 0.098, h: 0.078 },
        { at: [s * 0.1, 0.032, 0.16], w: 0.082, h: 0.064 },
        { at: [s * 0.1, 0.0235, 0.225], w: 0.05, h: 0.047 },
      ],
      { bone: toes[L], color: bootP, sides: 10, name: `toe${L}` },
    );
    // gold wing flares at the ankle
    for (const o of [1, -1]) {
      b.extrude([[0, 0], [0.075, 0.03], [0.14, 0.1, "sharp"], [0.09, 0.09], [0.03, 0.075], [-0.045, 0.045]], {
        at: [s * (0.1 + o * 0.053), 0.1, -0.035], x: [0, 0, -1], y: [o * 0.35, 1, 0], thickness: 0.008, bevel: 0.002, color: GOLD, bone: legs[L].tip ?? legs[L].joints[2], name: `ankleWing${L}${o > 0 ? "a" : "b"}`,
      });
    }
  }

  // ================================================================ arms: sleeves, bracers, pauldrons, hands
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, prof([[0, 0.058], [0.23, 0.06], [0.45, 0.05], [0.63, 0.044], [0.85, 0.04], [1, 0.036]]), { color: NAVY, sides: 9, name: `underSleeve${L}` });
    const sleeve = b.sweep(arm, prof([[0.1, 0.07], [0.3, 0.076], [0.52, 0.082]]), { from: 0.1, to: 0.52, color: paint((_p, _n, st) => (st[0] > 0.5 || st[0] < 0.17 ? TEAL : CLOTH)), sides: 10, caps: { start: "round", end: "flat" }, name: `sleeve${L}` });
    b.sweep(arm, prof([[0.5, 0.085], [0.53, 0.085]]), { from: 0.5, to: 0.535, color: GOLD, sides: 10, caps: "flat", name: `sleeveTrim${L}` });
    for (const deg of [0, 90, 180, 270]) {
      const sp = sleeve.at(0.41, deg);
      b.decal(sleeve, FILIGREE, { at: sp.at, dir: sp.n.toArray() as Pt, size: [0.095, 0.015], segments: 6, name: `sleeveFil${L}${deg}` });
    }
    // bracer
    b.sweep(arm, prof([[0.78, 0.047], [0.97, 0.04]]), { from: 0.78, to: 0.97, color: paint((_p, _n, st) => (st[0] < 0.8 || st[0] > 0.95 ? GOLD : LEATHER)), sides: 9, caps: "flat", name: `bracer${L}` });
    for (const t of [0.83, 0.88, 0.93]) b.sweep(arm, 0.043 - (t - 0.8) * 0.05, { from: t, to: t + 0.012, color: NAVY_L, sides: 9, caps: "flat", name: `bracerStrap${L}` });
  }

  // left pauldron: layered anemo feathers
  {
    const [c0, c1] = [armPts.L[1], armPts.L[2]];
    const dir = V(c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]).normalize();
    const cl = arms.L.joints[0];
    for (let k = 0; k < 3; k++) {
      const p0 = V(c0[0], c0[1], c0[2]).addScaledVector(dir, 0.0 + k * 0.04);
      const ringL = b.ring(frame(p0, dir), { count: 9 - k, radius: 0.07 + k * 0.012 }, () => undefined);
      b.cards(ringL.items, FEATHER, { size: [0.07 - k * 0.006, 0.13 - k * 0.012], lean: 62 - k * 5, bend: 14, flow: dir, bone: cl, vary: 0.12, rng: rng(20 + k), sink: 0.05, name: `featherEpaulet${k}` });
    }
    b.sweep(catmull(ringPts([c0[0], c0[1] + 0.01, c0[2]], 0.082, 0.082, 10), { closed: true }), 0.007, { bone: cl, color: GOLD, sides: 5, name: "pauldronRingL" });
  }
  // right pauldron: layered gold plates
  {
    const [c0, c1] = [armPts.R[1], armPts.R[2]];
    const dir = V(c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]).normalize();
    const cl = arms.R.joints[0];
    const cols = [GOLD, TEAL, WHITE];
    for (let k = 0; k < 3; k++) {
      const pk = V(c0[0], c0[1], c0[2]).addScaledVector(dir, 0.0 + k * 0.045).add(V(0, 0.02 - k * 0.012, 0));
      b.part(new THREE.SphereGeometry(0.1 - k * 0.006, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.42), cols[k], { at: pk, dir: [dir.x, dir.y + 1.4, dir.z], bone: cl, scale: [1, 0.55, 1], name: `plateR${k}` });
    }
    b.sweep(catmull(ringPts([c0[0], c0[1] + 0.02, c0[2]], 0.095, 0.095, 10), { closed: true }), 0.006, { bone: cl, color: GOLD, sides: 5, name: "pauldronRingR" });
    // gold strap rivets
    b.along(catmull(ringPts([c0[0], c0[1] + 0.03, c0[2]], 0.088, 0.088, 8), { closed: true }), 8, (at) => b.part(new THREE.SphereGeometry(0.008, 5, 4), GOLD, { at, bone: cl, name: "plateRivet" }));
  }

  // ---- left hand: open, relaxed
  {
    const pts = armPts.L;
    const wrist = V(...pts[3]);
    const f = wrist.clone().sub(V(...pts[2])).normalize();
    const wj = arms.L.tip ?? arms.L.joints[3];
    const palmC = wrist.clone().addScaledVector(f, 0.05);
    b.part(new THREE.BoxGeometry(0.04, 0.085, 0.085), SKIN, { at: palmC, dir: f.toArray() as Pt, bone: wj, scale: [1, 1, 1], name: "palmL" });
    const spread = V(0, 0, 1);
    const inward = V(-1, 0, 0);
    const defs: [number, number, number, number][] = [
      [0.03, 0.062, 0.7, 0.5], // index
      [0.01, 0.07, 0.4, 0.55],
      [-0.011, 0.065, 0.1, 0.55],
      [-0.03, 0.052, -0.3, 0.6],
    ];
    defs.forEach(([z, len, splay, curl], i) => {
      const base = palmC.clone().addScaledVector(f, 0.042).addScaledVector(spread, z);
      const dir = f.clone().addScaledVector(spread, splay * 0.18).addScaledVector(inward, curl * 0.12).normalize();
      const p1 = base.clone().addScaledVector(dir, len * 0.5);
      const dir2 = dir.clone().addScaledVector(inward, curl * 0.3).normalize();
      const p2 = p1.clone().addScaledVector(dir2, len * 0.5);
      const ch = b.chain(`fingerL${i + 1}`, catmull([base, p1, p2]), { parent: wj, count: 2, role: "digit", group: "handL" });
      b.sweep(ch, [0.0105, 0.008], { color: SKIN, sides: 6, name: `fingerL${i + 1}` });
    });
    const tb = palmC.clone().addScaledVector(spread, 0.04).addScaledVector(f, 0.0);
    const td = f.clone().addScaledVector(spread, 0.8).addScaledVector(inward, 0.2).normalize();
    const t1 = tb.clone().addScaledVector(td, 0.03);
    const t2 = t1.clone().addScaledVector(td.clone().addScaledVector(f, 0.3).normalize(), 0.032);
    const th = b.chain("thumbL", catmull([tb, t1, t2]), { parent: wj, count: 2, role: "digit", group: "handL" });
    b.sweep(th, [0.0125, 0.0095], { color: SKIN, sides: 6, name: "thumbL" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), SKIN, { at: wrist.clone().addScaledVector(f, 0.01), bone: wj, scale: [0.85, 1, 0.9], name: "wristL" });
  }

  // ---- right hand gripping the wind blade
  const swordDir = V(-0.22, -0.28, 0.93).normalize();
  {
    const pts = armPts.R;
    const wrist = V(...pts[3]);
    const f = wrist.clone().sub(V(...pts[2])).normalize();
    const wj = arms.R.tip ?? arms.R.joints[3];
    const d = swordDir;
    const H = wrist.clone().addScaledVector(f, 0.055);
    const ein = V(1, 0, 0).addScaledVector(d, -d.x).normalize();
    const eup = new THREE.Vector3().crossVectors(d, ein).normalize();
    const eout = ein.clone().negate();
    const sword = b.joint("sword", { parent: wj, at: H.toArray() as Pt, dir: d.toArray() as Pt, group: "sword" });
    // palm and knuckles
    b.part(new THREE.SphereGeometry(0.036, 8, 6), SKIN, { at: H.clone().addScaledVector(eup, 0.015).addScaledVector(ein, 0.008), bone: wj, scale: [1, 1, 1], name: "palmR" });
    b.capsule(wrist.clone().addScaledVector(f, -0.01), H.clone().addScaledVector(eup, 0.01), 0.032, { bone: wj, color: SKIN, sides: 8, name: "wristR" });
    const R0 = 0.0245;
    const gripA = [0.034, 0.011, -0.011, -0.033];
    gripA.forEach((a, i) => {
      const c = H.clone().addScaledVector(d, a);
      const from = c.clone().addScaledVector(eup, R0 * 0.8).addScaledVector(eout, R0 * 0.6);
      const path = arc(c, from, d, 215);
      const ch = b.chain(`fingerR${i + 1}`, path, { parent: wj, count: 2, role: "digit", group: "handR" });
      b.sweep(ch, [0.0105, 0.0075], { color: SKIN, sides: 6, name: `fingerR${i + 1}` });
    });
    const tc = H.clone().addScaledVector(d, 0.045);
    const tfrom = tc.clone().addScaledVector(ein, R0).addScaledVector(eup, 0.003);
    const tpath = arc(tc, tfrom, d, 95);
    const thR = b.chain("thumbR", tpath, { parent: wj, count: 2, role: "digit", group: "handR" });
    b.sweep(thR, [0.0125, 0.0095], { color: SKIN, sides: 6, name: "thumbR" });

    // ----- the blade
    const guardP = H.clone().addScaledVector(d, 0.1);
    const wdir = V(0, 1, 0).addScaledVector(d, -d.y).normalize();
    const side = new THREE.Vector3().crossVectors(d, wdir).normalize(); // thickness axis (sideways)
    const blade = b.extrude(
      [[0, -0.025], [0.5, -0.029], [0.74, -0.026], [0.87, -0.008, "sharp"], [0.9, 0.004, "sharp"], [0.72, 0.027], [0.0, 0.025]],
      { at: guardP.clone().addScaledVector(d, 0.012), x: d.toArray() as Pt, y: wdir.toArray() as Pt, thickness: [0.009, 0.006], bevel: 0.0025, color: cel("#eaf6f4", "#9cb8d8"), bone: sword, name: "blade" },
    );
    void blade;
    glow(
      b.extrude(
        [[0.03, -0.008], [0.5, -0.0075], [0.8, -0.001], [0.5, 0.0075], [0.03, 0.008]],
        { at: guardP.clone().addScaledVector(d, 0.012), x: d.toArray() as Pt, y: wdir.clone().add(side.clone().multiplyScalar(0)).toArray() as Pt, thickness: 0.0116, color: MINT_D, bone: sword, name: "bladeGlow" },
      ),
      1.2,
    );
    // gold ricasso and edge line
    b.extrude(
      [[0, -0.029], [0.06, -0.03], [0.075, -0.012], [0.075, 0.012], [0.06, 0.03], [0, 0.029]],
      { at: guardP.clone().addScaledVector(d, 0.012), x: d.toArray() as Pt, y: wdir.toArray() as Pt, thickness: 0.0125, bevel: 0.002, color: GOLD, bone: sword, name: "ricasso" },
    );
    // guard: winged
    const gOut: OutlinePoint[] = [
      [-0.125, 0.035, "sharp"], [-0.1, 0.012], [-0.06, 0.02], [-0.03, 0.03], [0.03, 0.03], [0.06, 0.02], [0.1, 0.012],
      [0.125, 0.035, "sharp"], [0.125, -0.002], [0.07, -0.016], [0, -0.012], [-0.07, -0.016], [-0.125, -0.002],
    ];
    b.extrude(gOut, { at: guardP, x: side.toArray() as Pt, y: d.toArray() as Pt, thickness: 0.02, bevel: 0.004, color: GOLD, bone: sword, name: "guard" });
    glow(b.part(new THREE.OctahedronGeometry(0.018), MINT_D, { at: guardP.clone().addScaledVector(d, 0.005), bone: sword, scale: [1, 1, 1.3], dir: d.toArray() as Pt, name: "guardGem" }), 1.2);
    // grip, pommel
    const gripEnd = H.clone().addScaledVector(d, -0.1);
    b.rod(gripEnd, guardP, 0.0165, { bone: sword, color: paint((_p, _n, s) => ((Math.floor(s[0] * 14) + Math.floor(s[1] / 40)) % 2 ? NAVY : NAVY_L)), sides: 8, name: "grip" });
    b.lathe(
      [[0, 0], [0.026, 0.002], [0.03, 0.012], [0.024, 0.026], [0.012, 0.034], [0, 0.036]],
      { at: gripEnd.clone().addScaledVector(d, -0.036), axis: d.clone().negate().toArray() as Pt, bone: sword, color: GOLD, segments: 8, name: "pommel" },
    );
    b.part(new THREE.SphereGeometry(0.016, 6, 4), TEAL, { at: gripEnd.clone().addScaledVector(d, -0.045), bone: sword, name: "pommelBead" });
    // tassel
    const P0 = gripEnd.clone().addScaledVector(d, -0.04);
    const tas = b.chain(
      "swordTassel",
      catmull([P0, [P0.x + 0.02, P0.y - 0.08, P0.z - 0.02], [P0.x + 0.03, P0.y - 0.19, P0.z - 0.03], [P0.x + 0.03, P0.y - 0.29, P0.z - 0.02]]),
      { parent: sword, count: 3, group: "sword" },
    );
    b.sweep(tas, prof([[0, 0.006], [0.45, 0.007], [0.55, 0.022], [0.75, 0.024], [1, 0.012]]), { color: paint((_p, _n, s) => (s[0] > 0.5 ? TEAL : GOLD)), sides: 6, caps: { end: "point" }, name: "tasselBody" });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), MINT_D, { at: tas.at(0.5).at, bone: tas.joints[1], name: "tasselBead" }), 1);
    // wind ribbons spiralling round the blade
    [0, 1].forEach((k) => {
      const c = guardP.clone().addScaledVector(d, 0.14 + k * 0.22);
      const start = c.clone().addScaledVector(eup, 0.07 - k * 0.01);
      const sp = spiral(c, start, d, { turns: 1.4 + k * 0.2, r1: 0.014, pitch: 0.2 });
      glow(b.sweep(sp, [0.008, 0.0012], { bone: sword, color: k ? MINT_D : MINT, sides: 4, caps: { end: "point" }, name: `windRibbon${k}` }), 1);
    });
    const tip = guardP.clone().addScaledVector(d, 0.92);
    glow(b.sweep(catmull([tip, [tip.x - 0.04, tip.y - 0.01, tip.z + 0.05], [tip.x - 0.07, tip.y + 0.03, tip.z + 0.09], [tip.x - 0.05, tip.y + 0.08, tip.z + 0.11]]), [0.007, 0.0012], { bone: sword, color: MINT, sides: 5, caps: { end: "point" }, name: "windTip" }), 1);
    const LEAF = svg(
      `<svg viewBox="0 0 40 80"><path d="M20 78 C2 56 4 22 20 2 C36 22 38 56 20 78Z" fill="#8ff7de" stroke="#e8fffa" stroke-width="4"/><path d="M20 74 L20 14" stroke="#2fc9b0" stroke-width="3.4" stroke-linecap="round"/></svg>`,
      { size: 128 },
    );
    const leaves = Array.from({ length: 9 }, (_, i) => {
      const a = i * 2.4;
      const off = eup.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a)).multiplyScalar(0.075 + 0.02 * (i % 3));
      const pos = guardP.clone().addScaledVector(d, 0.08 + i * 0.095).add(off);
      return frame(pos.toArray() as Pt, off.clone().normalize().toArray() as Pt);
    });
    glow(b.cards(leaves, LEAF, { size: [0.035, 0.065], lean: 55, bend: 20, flow: d.toArray() as Pt, bone: sword, vary: 0.2, rng: rng(5), sink: 0, cross: true, name: "windLeaves" }), 1.2);
  }

  // ================================================================ scabbard on the left hip
  {
    const M = V(0.205, 1.03, 0.085);
    const D = V(0.17, -0.72, -0.66).normalize();
    const T = M.clone().addScaledVector(D, 0.9);
    const sheath = b.joint("scabbard", { parent: hips, at: M.toArray() as Pt, dir: D.toArray() as Pt, group: "scabbard" });
    const scabbardBody = b.frustumBox(M, T, [0.062, 0.028], [0.046, 0.022], { bone: sheath, color: paint((_p, _n, s) => (Math.abs(((s[0] * 18) % 1) - 0.5) < 0.03 ? GOLD : NAVY)), name: "scabbard" });
    const sfeat = (t: number, w: number, h: number, col: typeof GOLD, nm: string) =>
      b.frustumBox(M.clone().addScaledVector(D, 0.9 * (t - 0.012)), M.clone().addScaledVector(D, 0.9 * (t + 0.012)), [w, h], [w, h], { bone: sheath, color: col, name: nm });
    sfeat(0.03, 0.07, 0.036, GOLD, "scabbardMouth");
    sfeat(0.3, 0.066, 0.032, GOLD, "scabbardBandA");
    sfeat(0.62, 0.058, 0.03, GOLD, "scabbardBandB");
    b.spike(T.clone().addScaledVector(D, -0.05), D, 0.09, 0.026, { bone: sheath, color: GOLD, name: "scabbardChape" });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), MINT_D, { at: M.clone().addScaledVector(D, 0.2).add(V(0.0, 0, 0.0)), bone: sheath, name: "scabbardGem" }), 1);
    b.cards([frame(M.clone().add(V(0.035, -0.02, 0.055)).toArray() as Pt, [0, 1, 0])], FEATHER, { size: [0.03, 0.11], lean: 180, flow: [0, 0, 1], bone: sheath, sink: 0, name: "scabbardTassel" });
    b.part(new THREE.SphereGeometry(0.013, 6, 4), TEAL, { at: M.clone().add(V(0.035, -0.015, 0.055)).toArray() as Pt, bone: sheath, name: "scabbardTasselBead" });
    b.decal(b.surface(scabbardBody), SWIRL_SIDE, { at: M.clone().addScaledVector(D, 0.45).add(V(0.03, 0, 0)), dir: [1, 0.15, 0.2], size: [0.04, 0.04], name: "scabbardSwirl" });
    // hanging strap
    b.sweep(catmull([[0.19, 1.07, 0.1], [0.2, 1.02, 0.1], M.toArray() as Pt]), 0.01, { bone: hips, color: LEATHER, name: "hanger" });
  }

  // ================================================================ straw hat on the back, strap, pouch, gourd
  {
    const HC = V(0.0, 1.2, -0.135);
    const axis = V(0, 0.28, -1).normalize();
    const hatPaint = paint((p, _n, _s) => {
      const rel = p.clone().sub(HC);
      const along = rel.dot(axis);
      const r = rel.clone().addScaledVector(axis, -along).length();
      if (r > 0.188) return TEAL_D;
      if (r > 0.18) return GOLD;
      const ring = Math.floor(r / 0.013);
      const ang = Math.floor((Math.atan2(rel.x, rel.y - 0.0) * 10) / Math.PI);
      return (ring + ang) % 2 ? STRAW : STRAW_D;
    });
    b.lathe(
      [[0, 0.1], [0.06, 0.088], [0.13, 0.052], [0.2, 0.0], [0.2, -0.007], [0.125, 0.043], [0.06, 0.08], [0, 0.092]],
      { at: HC.toArray() as Pt, axis: axis.toArray() as Pt, bone: chest, color: hatPaint, segments: 16, name: "strawHat" },
    );
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: HC.clone().addScaledVector(axis, 0.1).toArray() as Pt, bone: chest, name: "hatKnob" });
    for (const x of [-0.12, 0, 0.12]) {
      const hy = 1.01 + Math.abs(x) * 0.28;
      b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD, { at: [x, hy, -0.19], bone: chest, name: "hatBead" });
      b.cards([frame([x, hy, -0.19], [0, 1, 0])], FEATHER, { size: [0.032, 0.095], lean: 180, flow: [0, 0, 1], bone: chest, sink: 0, name: "hatTassel" });
    }
    // chin cord looping over to the chest
    b.sweep(
      skin.drape(
        catmull(
          [[-0.125, 1.405, -0.01], [-0.1, 1.33, 0.09], [-0.03, 1.25, 0.118], [0.07, 1.17, 0.11], [0.17, 1.12, 0.04], [0.14, 1.19, -0.09], [0.04, 1.3, -0.1], [-0.08, 1.4, -0.07]],
          { closed: true },
        ),
        { lift: 0.01 },
      ),
      [0.011, 0.007],
      { section: "box", color: LEATHER, name: "hatStrap" },
    );
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), GOLD, { at: [-0.04, 1.27, 0.128], dir: [0, 0.2, 1], bone: chest, name: "strapBuckle" });
    b.decal(skin, GUST, { at: [0.06, 1.355, 0.1], dir: [0, 0, 1], size: [0.055, 0.055], name: "chestEmblem" });
    b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 10), GOLD, { at: [0.06, 1.355, 0.112], dir: [0, 0, 1], axis: "z", bone: chest, name: "emblemRing" });
  }
  // pouch and gourd on the right hip
  {
    const pouch = b.part(new THREE.SphereGeometry(1, 8, 6), LEATHER, { at: [-0.215, 0.99, 0.045], scale: [0.045, 0.06, 0.04], bone: hips, name: "pouch" });
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), cel("#946040", "#5c3a37"), { at: [-0.215, 1.02, 0.045], scale: [0.048, 0.03, 0.043], bone: hips, name: "pouchFlap" });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: [-0.215, 0.99, 0.087], bone: hips, name: "pouchClasp" });
    void pouch;
    b.sweep(catmull([[-0.19, 1.07, 0.05], [-0.21, 1.04, 0.05], [-0.215, 1.02, 0.046]]), 0.008, { bone: hips, color: LEATHER, name: "pouchStrap" });
    // gourd flask on a cord
    const gc = V(-0.15, 0.93, -0.1);
    b.lathe([[0, 0], [0.03, 0.004], [0.044, 0.028], [0.038, 0.058], [0.02, 0.07], [0.022, 0.09], [0.012, 0.105], [0, 0.107]], {
      at: gc.toArray() as Pt, bone: hips, color: paint((_p, _n, s) => (s[0] > 0.066 ? LEATHER : cel("#4fbf9c", "#2a7f9c"))), segments: 8, axis: [0, 1, 0], name: "gourd",
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.02, 6), GOLD, { at: gc.clone().add(V(0, 0.115, 0)).toArray() as Pt, bone: hips, name: "gourdCork" });
    b.sweep(catmull([[-0.1, 1.07, -0.09], [-0.14, 1.04, -0.1], gc.clone().add(V(0, 0.115, 0)).toArray() as Pt]), 0.006, { bone: hips, color: LEATHER, name: "gourdCord" });
  }

  // wind charm hanging from the belt: ring, jade bead, feather tassel
  {
    const charm = b.chain("charm", catmull([[0.09, 1.06, 0.13], [0.1, 1.0, 0.156], [0.105, 0.94, 0.166]]), { parent: hips, count: 2, group: "coat" });
    b.sweep(charm, 0.004, { color: GOLD, caps: "round", sides: 5, name: "charmCord" });
    b.part(new THREE.TorusGeometry(0.018, 0.004, 5, 10), GOLD, { at: [0.09, 1.07, 0.128], dir: [0.2, 0, 1], axis: "z", bone: hips, name: "charmRing" });
    glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), MINT_D, { at: [0.1, 1.0, 0.157], bone: charm.joints[0], scale: [1, 1.1, 1], name: "charmJade" }), 1);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [0.104, 0.955, 0.165], bone: charm.joints[1], name: "charmCap" });
    b.cards([frame([0.105, 0.945, 0.166], [0, 1, 0])], FEATHER, { size: [0.028, 0.09], lean: 180, flow: [0, 0, 1], bone: charm.joints[1], sink: 0, name: "charmFeather" });
  }
  // glowing wind wisps trailing the scarf tips
  {
    const tipA = scarfA.at(1).at;
    glow(b.sweep(catmull([tipA, [tipA.x + 0.05, tipA.y + 0.03, tipA.z - 0.08], [tipA.x + 0.02, tipA.y + 0.1, tipA.z - 0.16], [tipA.x - 0.06, tipA.y + 0.12, tipA.z - 0.2]]), [0.007, 0.001], { bone: scarfA.joints[5], color: MINT, sides: 5, caps: { end: "point" }, name: "scarfWisp" }), 1);
    const tipB = scarfB.at(1).at;
    glow(b.sweep(catmull([tipB, [tipB.x - 0.04, tipB.y + 0.02, tipB.z - 0.08], [tipB.x - 0.03, tipB.y + 0.08, tipB.z - 0.15]]), [0.006, 0.001], { bone: scarfB.joints[4], color: MINT_D, sides: 5, caps: { end: "point" }, name: "scarfWispB" }), 1);
  }
  for (const sc of [scarfA, scarfB]) {
    const j = sc.joints[sc.joints.length - 1];
    const e = sc.at(1).at;
    b.cards(
      [-1, 0, 1].map((k) => frame([e.x + k * 0.03, e.y - 0.005, e.z - 0.01], [0, 1, 0])),
      FEATHER,
      { size: [0.03, 0.09], lean: 180, flow: [0, 0, 1], bone: j, sink: 0, name: "scarfFringe" },
    );
  }

  return b.root;
}
