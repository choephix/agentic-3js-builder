import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { noise, smoothstep } from "../src/paint";
import { cellPaint, pixelArt, pixelTexture, stepped } from "../kits/pixel";
import type { Cell } from "../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A pixel-art koala sitting astride a eucalyptus perch, hugging a leafy limb with both hands; trunk, bracket fungus, peeling bark and a log-slice base.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palettes (ramps run dark to light)
const FUR = ["#2f323b", "#464a57", "#626674", "#7f8391", "#9fa3b0", "#c0c3cd", "#dfe1e7"];
const CREAM = ["#8f8271", "#ac9f8b", "#c8bba5", "#e0d5be", "#f1e9d6", "#fbf6ea"];
const RUMP = ["#3f372f", "#554a3f", "#6e6154", "#8a7c6d", "#a89a89"];
const SKIN = ["#121016", "#201e29", "#33313f", "#4a485b", "#66647a"];
const NOSE = ["#08070b", "#15141b", "#25242e", "#3b3a49", "#6c6b82"];
const BARK = ["#4a3a32", "#66554a", "#85715f", "#a39078", "#c0ae93", "#d8cab0"];
const REDBARK = ["#6b3a2c", "#8a5238", "#a86a46", "#c4875a"];
const MOSS = ["#2b4a2a", "#3e6636", "#5a8a45"];
const WOOD = ["#4b2f1e", "#66401f", "#82552b", "#a06c38", "#bd8a4e", "#d6a869"];
const WOODBARK = ["#2f2018", "#45301f", "#5e4229", "#7a5836"];
const TWIG = ["#5a3a30", "#74483a", "#8e5e48", "#a8785a"];
const CLAW = "#eadfbe";
const MOUTH = "#2a1218";
const BRASS = "#d4a63c";

const TEX = 0.015; // fur texel
const FINE = 0.0075; // small parts
const BIG = 0.02; // wood and bark

/** Deterministic integer hash in [0, 1). */
function h2(a: number, b: number, seed = 0) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Fur value 0..1 for a cell: lit from above, cloudy, with short strand flecks. */
function furValue(c: Cell, base: number, seed: number) {
  let v = base + 0.2 * c.n.y + 0.55 * (noise(c.at, 0.07, seed) - 0.5);
  const k = Math.floor(c.v / 2);
  if (h2(c.u, k, seed + 5) < 0.13) v += 0.22;
  else if (h2(c.u, k, seed + 9) < 0.1) v -= 0.2;
  return v;
}

const BODY = cellPaint(
  TEX,
  (c) => {
    const p = c.at;
    const v = furValue(c, 0.5, 3);
    const d = Math.hypot(p.x / 0.105, (p.y - 0.66) / 0.19);
    if (c.n.z > 0.2 && d < 0.95 + 0.5 * (c.threshold - 0.5) + 0.3 * (noise(p, 0.05, 9) - 0.5)) {
      return c.pick(CREAM, 0.62 + 0.4 * (1 - d) + 0.3 * (noise(p, 0.04, 5) - 0.5) + (h2(c.u, c.v >> 1, 4) < 0.12 ? 0.2 : 0));
    }
    if (p.y < 0.58 && c.n.z < 0.35) {
      const w = 0.5 + 0.3 * (noise(p, 0.06, 6) - 0.5) + 0.2 * c.n.y + (h2(c.u, c.v, 2) < 0.07 ? 0.4 : 0);
      return c.pick(RUMP, w);
    }
    return c.pick(FUR, v);
  },
  { dither: true },
);

const LIMBFUR = cellPaint(TEX, (c) => c.pick(FUR, furValue(c, 0.42, 11)), { dither: true });
const LEGFUR = cellPaint(
  TEX,
  (c) => (c.n.x * (c.at.x < 0 ? -1 : 1) < -0.3 ? c.pick(CREAM, 0.35 + 0.3 * (noise(c.at, 0.06, 4) - 0.5) + 0.2 * c.n.y) : c.pick(FUR, furValue(c, 0.4, 13))),
  { dither: true },
);
const HEADFUR = cellPaint(
  TEX,
  (c) => {
    const p = c.at;
    const lower = p.y < 0.885 + 0.04 * (noise(p, 0.06, 2) - 0.5);
    const cheek = Math.abs(p.x) > 0.07 && p.y < 0.935 && c.n.z > -0.2;
    if (lower || cheek) {
      const w = 0.5 + 0.2 * (noise(p, 0.04, 8) - 0.5) + (h2(c.u, c.v >> 1, 7) < 0.14 ? 0.2 : 0) - (cheek && !lower ? 0.08 : 0);
      return c.pick(CREAM, w);
    }
    return c.pick(FUR, furValue(c, 0.5, 21) - (p.y > 0.97 ? 0.08 : 0));
  },
  { dither: true },
);
const MUZZLE = cellPaint(
  FINE * 2,
  (c) => {
    if (c.random(5) < 0.07 && c.n.z > 0.3) return c.pick(SKIN, 0.3);
    return c.pick(CREAM, 0.55 + 0.25 * (noise(c.at, 0.03, 8) - 0.5) + 0.1 * c.n.y);
  },
  { dither: true },
);
const JAWP = cellPaint(FINE * 2, (c) => c.pick(CREAM, 0.62 + 0.25 * (noise(c.at, 0.03, 4) - 0.5) - 0.1 * (c.n.y < -0.3 ? 1 : 0)), { dither: true });
const NOSEP = cellPaint(
  FINE,
  (c) => {
    const top = c.n.y > 0.45 ? 1 : 0;
    if (top && c.at.z > 0.19 && c.random(3) < 0.55) return NOSE[4];
    if (c.n.z > 0.5 && Math.abs(c.at.x) > 0.01 && c.at.y < 0.887 && c.at.y > 0.878) return NOSE[0];
    return c.pick(NOSE, 0.35 + 0.25 * c.n.y + 0.3 * (noise(c.at, 0.02, 1) - 0.5));
  },
  { dither: true },
);
const SKINP = cellPaint(FINE, (c) => c.pick(SKIN, 0.4 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.02, 3) - 0.5) + (c.random(2) < 0.1 ? 0.25 : 0)), { dither: true });
const PADP = cellPaint(FINE, (c) => c.pick(SKIN, 0.18 + 0.25 * (noise(c.at, 0.02, 6) - 0.5) + (c.n.y > 0.2 ? 0.25 : 0)), { dither: true });

const EAROUT = (fv: THREE.Vector3, ec: number) =>
  cellPaint(
    ec,
    (c) => {
      const [sx, sy] = c.s;
      const d = Math.hypot(sx / (3.2 * ec), (sy - 4 * ec) / (3.2 * ec));
      const face = Math.abs(c.n.dot(fv)) > 0.5 ? (c.n.dot(fv) > 0 ? 1 : 0) : -1;
      if (face === 1) {
        if (d < 0.95 + 0.2 * (c.threshold - 0.5)) return c.pick(CREAM, 0.75 + 0.3 * (1 - d) + (h2(c.u, c.v, 3) < 0.2 ? 0.2 : 0));
        return c.pick(FUR, 0.18 + 0.2 * (noise(c.at, 0.04, 2) - 0.5) + (h2(c.u, c.v, 4) < 0.2 ? 0.2 : 0));
      }
      if (face === -1) return c.pick(FUR, 0.12 + 0.2 * (noise(c.at, 0.04, 2) - 0.5));
      return c.pick(FUR, 0.38 + 0.4 * (noise(c.at, 0.04, 5) - 0.5));
    },
    { dither: true },
  );

// Bark: smooth gum with creamy-grey streaks, salmon fresh bark patches and moss near the base.
const barkPaint = (seed: number, mossBelow: number) =>
  cellPaint(
    BIG,
    (c) => {
      const p = c.at;
      const streak = h2(c.u, 0, seed);
      const q = new THREE.Vector3(p.x * 2.2, p.y * 0.35, p.z * 2.2);
      const n1 = noise(q, 0.1, seed);
      const fresh = noise(new THREE.Vector3(p.x * 1.4, p.y * 0.5, p.z * 1.4), 0.2, seed + 4);
      if (p.y < mossBelow + 0.12 * (noise(p, 0.06, 7) - 0.5) && n1 > 0.42) return c.pick(MOSS, 0.25 + 0.7 * n1 + 0.25 * c.n.y);
      if (fresh > 0.62) return c.pick(REDBARK, 0.2 + 0.7 * n1 + 0.2 * c.n.y + (streak < 0.2 ? 0.2 : 0));
      let v = 0.4 + 0.5 * n1 + 0.15 * c.n.y + (streak - 0.5) * 0.25;
      if (h2(c.u, Math.floor(c.v / 3), seed + 1) < 0.07) v -= 0.3;
      return c.pick(BARK, v);
    },
    { dither: true },
  );
const TRUNKP = barkPaint(3, 0.2);
const PERCHP = barkPaint(8, 0.0);
const LIMBP = barkPaint(14, -1);
const TWIGP = cellPaint(FINE * 1.6, (c) => c.pick(TWIG, 0.4 + 0.5 * (noise(c.at, 0.04, 2) - 0.5) + 0.25 * c.n.y + (c.random(1) < 0.12 ? 0.25 : 0)), { dither: true });

const BASETOP = cellPaint(
  BIG,
  (c) => {
    const [cx, cz] = [0, 0.03];
    if (c.n.y > 0.5) {
      const dx = c.at.x - cx;
      const dz = c.at.z - cz;
      const d = Math.hypot(dx + 0.02 * Math.sin(Math.atan2(dz, dx) * 3), dz) + 0.012 * (noise(c.at, 0.08, 1) - 0.5);
      const ring = Math.floor(d / 0.03);
      let v = 0.55 + 0.18 * (ring % 3 === 0 ? -1 : ring % 3 === 1 ? 0.4 : 1) + 0.12 * (noise(c.at, 0.05, 3) - 0.5);
      if (d < 0.025) v = 0.2;
      const a = Math.atan2(dz, dx);
      if (d > 0.08 && h2(Math.floor(a * 7.5), 1, 5) < 0.2 && Math.abs((a * 7.5) % 1) < 0.12 + d * 0.15 && d < 0.37) v = 0.04;
      return c.pick(WOOD, v);
    }
    const a = Math.atan2(c.at.z - 0.03, c.at.x);
    const bandv = h2(Math.floor(a * 18), 0, 2);
    return c.pick(WOODBARK, 0.25 + 0.6 * bandv + 0.25 * (h2(Math.floor(a * 18), c.v, 4) - 0.5));
  },
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures
const FLUFF = pixelArt(["..W..", "..W..", ".WWW.", ".WwW.", "WWwWW", "WwwwW", "gwwwg"], { W: "#ffffff", w: "#dcdcdc", g: "#b0b0b0" });
const EYE = pixelArt([".kkk.", "kkkkk", "kwkkk", "kkkkk", ".kkk."], { k: "#0c0b11", w: "#ffffff" });
const TUFT_PAL = { W: "#ffffff", w: "#e6e6e6", g: "#bdbdbd" };
const TUFT2 = pixelArt(["...W...", "..WW...", "..WwW..", ".WWwW..", ".WwwWW.", "WWwwwWW", "gwwwwwg"], TUFT_PAL);

/** A leaf drawn on a pixel grid: base at the bottom, curving to one side, with a pale vein. */
function leafTex(w: number, h: number, bend: number, pal: readonly string[], vein: string) {
  return pixelTexture(w, h, (g) => {
    for (let y = 0; y < h; y++) {
      const u = (h - 1 - y) / (h - 1);
      const hw = ((w - 1) / 2) * Math.sin(Math.PI * Math.pow(u, 0.7)) * 0.98 + (u > 0.02 ? 0.3 : 0);
      const cx = (w - 1) / 2 + bend * u * u;
      for (let x = 0; x < w; x++) {
        const dx = Math.abs(x - cx);
        if (dx > hw + 0.01) continue;
        let col = pal[2];
        if (dx > hw - 0.9 && hw > 1) col = pal[0];
        else if (dx < 0.6) col = vein;
        else if ((x + y) % 5 === 0) col = pal[3];
        else if (x < cx) col = pal[2];
        else col = pal[1];
        g.set(x, y, col);
      }
    }
    g.set(Math.round((w - 1) / 2 + 0), h - 1, "#7a5a3a");
  });
}
const LEAF_A = leafTex(7, 26, 2, ["#2f5f55", "#4a8574", "#5f9c88", "#86bda2"], "#b4d8bd");
const LEAF_B = leafTex(6, 22, -2, ["#2c5a58", "#45806f", "#5a9684", "#7fb89b"], "#a9d2b6");
const LEAF_C = leafTex(7, 28, 3, ["#365f4d", "#548a62", "#6aa273", "#92c58c"], "#c1e3b0");
const DISC = pixelTexture(12, 12, (g) => {
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const d = Math.hypot(x - 5.5, y - 6);
      if (d > 5.6) continue;
      let col = d > 4.5 ? "#6d95a6" : (x + y) % 6 === 0 ? "#b9d4de" : x < 6 ? "#9bbdcb" : "#86aebd";
      if (Math.abs(x - 5.5) < 0.6 && y > 1) col = "#d6e8ee";
      g.set(x, y, col);
    }
  g.set(5, 11, "#6a5a40");
  g.set(6, 11, "#6a5a40");
});
const STRIP = pixelTexture(5, 16, (g) => {
  for (let y = 0; y < 16; y++) {
    const hw = 1.2 + 1.4 * Math.sin((Math.PI * (15 - y)) / 17 + 0.3);
    for (let x = 0; x < 5; x++) {
      const dx = Math.abs(x - 2 - 0.15 * y * 0.2);
      if (dx > hw) continue;
      g.set(x, y, dx > hw - 0.9 ? "#7b5a3c" : x < 2 ? "#d8b890" : "#c49a6c");
    }
  }
});
const MOSSCARD = pixelArt(["..G.G..", ".GgGgG.", "GgGGgGG", "GGgGGgG"], { G: "#3e6636", g: "#5a8a45" });
const PLAQUE = pixelTexture(24, 8, (g) => {
  g.fill((x, y) => (x === 0 || y === 0 || x === 23 || y === 7 ? "#8a6a1e" : (x + y) % 9 === 0 ? "#f0cf70" : "#d4a63c"));
  g.stamp(2, 2, ["..g...g.......", ".ggg.ggg.....", "gg.g.g.g.....", ".ggg.ggg.....", "..g...g......"], { g: "#5a3a10" });
  g.stamp(12, 2, ["kkk.k.k.kkk", "k...k.k.k..", "kk..kk..kk.", "k...k.k.k..", "kkk.k.k.kkk"], { k: "#5a3a10" });
});
const SHELF_TOP = cellPaint(FINE * 2, (c) => {
  const d = Math.hypot(c.at.x, c.at.z) * 0 + (c.v + c.u) * 0;
  return c.pick(["#7a3a14", "#b4621f", "#d98a34", "#f0b45a", "#f6dc9c"], 0.35 + 0.35 * c.n.y + 0.2 * (h2(c.u + d, c.v, 1) - 0.5) + (Math.abs(c.n.y) > 0.5 && Math.floor(c.v / 1) % 3 === 0 ? -0.15 : 0));
}, { dither: true });

// ---------------------------------------------------------------------------------------------------------------
const ramp = (keys: number[]) => (t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
};

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const R = rng(11);

  // ===== Skeleton =====
  const hips = b.joint("hips", { at: [0, 0.5, -0.01], dir: [0, 1, 0], role: "spine" });
  const stand = b.joint("stand", { parent: hips, at: [0, 0.04, 0.03], dir: [0, 1, 0] });

  const P = [
    [0, 0.5, -0.01],
    [0, 0.62, 0.0],
    [0, 0.74, 0.03],
    [0, 0.835, 0.06],
  ];
  const spine = b.chain("spine", catmull(P.slice(0, 3)), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const neckCh = b.chain("neckC", catmull(P.slice(2)), { parent: spine.joints[1], names: ["neck"], role: "neck" });
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: neckCh.joints[0], at: P[3], dir: [0, 0.05, 1], role: "head" });

  // ===== Torso =====
  const rx = ramp([0.17, 0.175, 0.15, 0.125, 0.1]);
  const ry = ramp([0.14, 0.15, 0.14, 0.12, 0.1]);
  const torso = b.sweep(catmull(P), (t) => [rx(t), ry(t)], {
    bone: [hips, spine, neckCh],
    color: BODY,
    caps: { start: "flat", end: "flat" },
    sides: 12,
    name: "torso",
  });
  void torso;
  b.part(new THREE.SphereGeometry(1, 12, 8), BODY, { bone: hips, at: [0, 0.5, -0.015], scale: [0.175, 0.105, 0.155], name: "rump" });
  b.part(new THREE.SphereGeometry(1, 12, 8), BODY, { bone: spine.joints[0], at: [0, 0.6, 0.05], scale: [0.125, 0.15, 0.115], name: "belly" });
  b.part(new THREE.SphereGeometry(1, 8, 6), RUMP[2] as string, { bone: hips, at: [0, 0.43, -0.16], scale: 0.035, name: "tailNub" });

  // ===== Head =====
  const C = [0, 0.905, 0.065];
  const hc = (x: number, y: number, z: number): [number, number, number] => [C[0] + x, C[1] + y, C[2] + z];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADFUR, { bone: head, at: C, scale: [0.118, 0.1, 0.105], name: "skull" });
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE, { bone: head, at: hc(0, -0.03, 0.085), scale: [0.06, 0.04, 0.055], name: "muzzle" });
  void muzzle;
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSEP, { bone: head, at: hc(0, -0.02, 0.135), scale: [0.038, 0.026, 0.026], name: "nose" });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 8, 6), HEADFUR, { bone: head, at: hc(s * 0.08, -0.04, 0.03), scale: [0.05, 0.045, 0.05], name: "cheek" });
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, { bone: head, at: hc(0, -0.067, 0.085), scale: [0.05, 0.01, 0.052], name: "mouthInner" });
  const jaw = b.joint("jaw", { parent: head, at: hc(0, -0.065, 0.02), aim: hc(0, -0.08, 0.14), role: "jaw" });
  b.part(new THREE.SphereGeometry(1, 10, 6), JAWP, { bone: jaw, at: hc(0, -0.083, 0.08), scale: [0.05, 0.02, 0.052], name: "jawLower" });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: hc(s * 0.056, 0.02, 0.085), dir: [s * 0.28, 0, 1], size: [0.034, 0.034], bone: head, name: "eye" });
    // pale brow spots above the eyes
    b.part(new THREE.BoxGeometry(0.03, 0.008, 0.008), CREAM[3], { bone: head, at: hc(s * 0.057, 0.052, 0.082), rotation: [0, 0, s * -12], name: "brow" });
  }

  // Ears: stepped round blobs, white fluff inside
  const EC = 0.0155;
  const EAR = stepped(
    [
      [-2, 2],
      [-3, 3],
      [-4, 4],
      [-4, 4],
      [-4, 4],
      [-4, 4],
      [-3, 3],
      [-2, 2],
    ],
    EC,
    { rows: true },
  );
  const ears: Record<string, ReturnType<typeof b.extrude>> = {};
  for (const s of [1, -1]) {
    const fv = new THREE.Vector3(s * 0.34, 0, 0.94);
    ears[s > 0 ? "L" : "R"] = b.extrude(EAR, {
      at: hc(s * 0.1, 0.0, -0.02),
      x: [s * 0.94, 0, -0.34],
      y: [0, 1, 0],
      thickness: 0.032,
      color: EAROUT(fv, EC),
      bone: head,
      name: `ear${s > 0 ? "L" : "R"}`,
    });
  }
  // fur tufts: ear rims, cheeks, chin, brow
  for (const s of [1, -1]) {
    const ear = ears[s > 0 ? "L" : "R"];
    const fv = new THREE.Vector3(s * 0.34, 0, 0.94);
    const rim = b.surface(ear).scatter(26, { rng: rng(30 + s), minDist: 0.03, filter: (h) => Math.abs(h.n.dot(fv)) < 0.4 });
    b.cards(rim, FLUFF, { size: [0.034, 0.044], lean: 35, flow: [0, 1, 0.4], vary: 0.25, rng: R, color: "#f4f4f6", bone: head });
  }
  const faceHits = b.surface(skull).scatter(70, { rng: rng(41), minDist: 0.035, filter: (h) => h.at.y < 0.9 && h.n.z > -0.1 && h.n.y < 0.5 });
  b.cards(faceHits, TUFT2, { size: [0.035, 0.04], lean: 60, flow: [0, -0.6, -0.7], vary: 0.25, rng: R, color: CREAM[4], bone: head });
  const crownHits = b.surface(skull).scatter(40, { rng: rng(42), minDist: 0.04, filter: (h) => h.n.y > 0.5 });
  b.cards(crownHits, FLUFF, { size: [0.03, 0.035], lean: 65, flow: [0, -0.2, -1], vary: 0.3, rng: R, color: FUR[3], bone: head });

  // ===== Hind legs =====
  const perchY = (z: number) => 0.355 + 0.03 * (z + 0.25) / 0.65;
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const foot: [number, number, number] = [s * 0.075, 0.38, 0.205];
    const pts = limb([s * 0.13, 0.5, -0.01], foot, [0.15, 0.14], [s, 0.3, 0.3]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    legs[S] = leg;
    b.sweep(leg, [0.078, 0.058, 0.042], { color: LEGFUR, sides: 10, name: `legTube${S}` });
    const ankle = leg.tip as NonNullable<typeof leg.tip>;
    // foot pad + sole
    b.part(new THREE.SphereGeometry(1, 10, 8), PADP, { bone: ankle, at: [foot[0], foot[1] - 0.002, foot[2]], scale: [0.03, 0.028, 0.046], name: `foot${S}` });
    // toes wrapping over the perch (x–y plane at each z), toe 1 curls beneath
    const axisY = perchY(foot[2]);
    const rp = 0.043 + 0.009;
    const arcAt = (z: number, deg: number, rad = rp): [number, number, number] => [s * rad * Math.sin((deg * Math.PI) / 180), perchY(z) + rad * Math.cos((deg * Math.PI) / 180), z];
    const zs = [-0.027, -0.009, 0.009, 0.027].map((d) => foot[2] + d + (s < 0 ? 0.009 : 0));
    zs.forEach((z, k) => {
      const path = catmull([arcAt(z, 105, 0.055), arcAt(z, 62), arcAt(z, 24), arcAt(z, -8), arcAt(z, -34)]);
      const tc = b.chain(`toe${S}${k + 2}`, path, { parent: ankle, names: [`toe${S}${k + 2}a`, `toe${S}${k + 2}b`], count: 2, role: "digit" });
      b.sweep(tc, [0.0105, 0.008], { color: SKINP, sides: 6, name: `toeTube${S}` });
      b.spike(tc.at(1), tc.at(1), 0.024, 0.006, { color: CLAW, sides: 5 });
    });
    const hz = foot[2] - 0.045;
    const hpath = catmull([arcAt(hz, 112, 0.056), arcAt(hz, 150, 0.05), arcAt(hz, 185, 0.05), arcAt(hz, 215, 0.05)]);
    const hc2 = b.chain(`hallux${S}`, hpath, { parent: ankle, names: [`hallux${S}a`, `hallux${S}b`], count: 2, role: "digit" });
    b.sweep(hc2, [0.0125, 0.01], { color: SKINP, sides: 6, name: `halluxTube${S}` });
    void axisY;
  }

  // ===== Gripped limb path (also built as wood below) =====
  const LIMB = catmull([
    [0, 0.385, 0.37],
    [0, 0.55, 0.31],
    [0, 0.72, 0.28],
    [0, 0.95, 0.33],
    [-0.02, 1.2, 0.34],
    [-0.05, 1.5, 0.31],
  ]);
  const limbR = ramp([0.033, 0.027, 0.02, 0.014, 0.008]);
  const limbAt = (y: number) => {
    let t = LIMB.closestT([0, y, 0.3]);
    for (let i = 0; i < 3; i++) t = LIMB.closestT([0, y, LIMB.at(t).z]);
    return { p: LIMB.at(t), r: limbR(t) };
  };

  // ===== Arms =====
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hy = s > 0 ? 0.77 : 0.685;
    const { p: c0, r: lr } = limbAt(hy);
    const R0 = lr + 0.0095;
    const palm: [number, number, number] = [c0.x + s * 0.05, hy, c0.z - 0.012];
    const pts = limb([s * 0.145, 0.755, 0.03], palm, [0.15, 0.14], [s, -0.6, -0.2]);
    const arm = b.chain(`arm${S}`, pts, { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.062, 0.046, 0.036], { color: LIMBFUR, sides: 10, name: `armTube${S}` });
    const wrist = arm.tip as NonNullable<typeof arm.tip>;
    b.part(new THREE.SphereGeometry(1, 10, 8), SKINP, { bone: wrist, at: palm, scale: [0.026, 0.034, 0.03], name: `palm${S}` });
    // fur cuff over the wrist
    b.part(new THREE.SphereGeometry(1, 8, 6), LIMBFUR, { bone: wrist, at: [palm[0] + s * 0.018, hy, palm[2] - 0.004], scale: [0.034, 0.04, 0.036], name: `cuff${S}` });
    const at = (deg: number, dy: number, rad = R0): [number, number, number] => [
      c0.x + rad * s * Math.sin((deg * Math.PI) / 180),
      hy + dy,
      c0.z + rad * Math.cos((deg * Math.PI) / 180),
    ];
    // three fingers curl over the front of the limb, two thumbs hook round the back
    [-0.017, 0, 0.017].forEach((dy, k) => {
      const path = catmull([at(100, dy), at(58, dy), at(18, dy), at(-24, dy), at(-62 - k * 4, dy)]);
      const fc = b.chain(`finger${S}${k + 3}`, path, { parent: wrist, names: [`finger${S}${k + 3}a`, `finger${S}${k + 3}b`], count: 2, role: "digit" });
      b.sweep(fc, [0.0092, 0.0072], { color: SKINP, sides: 6, name: `fingerTube${S}` });
      b.spike(fc.at(1), fc.at(1), 0.024, 0.0062, { color: CLAW, sides: 5 });
    });
    [-0.009, 0.011].forEach((dy, k) => {
      const path = catmull([at(98, dy), at(128, dy), at(162, dy), at(196, dy)]);
      const tc = b.chain(`thumb${S}${k + 1}`, path, { parent: wrist, names: [`thumb${S}${k + 1}a`, `thumb${S}${k + 1}b`], count: 2, role: "digit" });
      b.sweep(tc, [0.0092, 0.0078], { color: SKINP, sides: 6, name: `thumbTube${S}` });
      b.spike(tc.at(1), tc.at(1), 0.02, 0.0058, { color: CLAW, sides: 5 });
    });
  }

  // ===== Chest fluff =====
  const chestHits = b.surface(torso).scatter(140, { rng: rng(51), minDist: 0.03, filter: (h) => h.n.z > 0.3 && h.at.y > 0.52 });
  b.cards(chestHits, FLUFF, { size: [0.042, 0.05], lean: 55, flow: [0, -1, -0.2], vary: 0.25, rng: R, color: BODY });
  const bodyHits = b.surface(torso).scatter(120, { rng: rng(52), minDist: 0.035, filter: (h) => h.n.z < 0.1 });
  b.cards(bodyHits, TUFT2, { size: [0.042, 0.05], lean: 60, flow: [0, -1, -0.3], vary: 0.25, rng: R, color: BODY });

  // ===== Stand: base, trunk, perch, gripped limb, twigs =====
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.4, 0.012, "sharp"],
      [0.4, 0.062, "sharp"],
      [0.385, 0.078, "sharp"],
      [0, 0.078],
    ],
    { at: [0, 0, 0.03], segments: 20, color: BASETOP, bone: stand, name: "baseLog" },
  );
  b.part(new THREE.BoxGeometry(0.15, 0.04, 0.012), "#ffffff", { bone: stand, at: [0, 0.042, 0.03 + 0.4 + 0.003], texture: PLAQUE, name: "plaque" });
  for (const x of [-0.068, 0.068]) b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS, { bone: stand, at: [x, 0.042, 0.437], name: "plaqueScrew" });

  const TRUNK = catmull([
    [0, 0.05, -0.25],
    [0, 0.4, -0.255],
    [-0.01, 0.8, -0.27],
    [-0.03, 1.2, -0.28],
    [-0.06, 1.62, -0.25],
  ]);
  const trunk = b.sweep(TRUNK, ramp([0.105, 0.075, 0.068, 0.057, 0.04, 0.026]), { bone: stand, color: TRUNKP, sides: 9, caps: { start: "flat", end: "point" }, name: "trunk" });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    b.spike([Math.sin(a) * 0.05, 0.1, -0.25 + Math.cos(a) * 0.05], [Math.sin(a) * 0.9, -0.35, Math.cos(a) * 0.9], 0.2, 0.035, { bone: stand, color: TRUNKP, sides: 6, name: "root" });
  }

  const PERCH = catmull([
    [0, 0.355, -0.25],
    [0, 0.36, -0.05],
    [0, 0.37, 0.2],
    [0, 0.385, 0.4],
  ]);
  const perch = b.sweep(PERCH, [0.052, 0.04], { bone: stand, color: PERCHP, sides: 9, caps: { start: "none", end: "flat" }, name: "perch" });
  // growth ring on the cut end of the perch
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 10), WOOD[4], { bone: stand, at: [0, 0.385, 0.402], dir: [0, 0, 1], name: "perchCut" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 8), WOOD[2], { bone: stand, at: [0, 0.385, 0.404], dir: [0, 0, 1], name: "perchCutPith" });

  const limbTube = b.sweep(LIMB, ramp([0.033, 0.027, 0.02, 0.014, 0.008, 0.005]), { bone: stand, color: LIMBP, sides: 8, caps: { start: "none", end: "point" }, name: "limb" });

  // knots and stubs
  b.part(new THREE.SphereGeometry(0.03, 7, 5), PERCHP, { bone: stand, at: [0.03, 0.42, -0.03], scale: [1, 0.6, 1], name: "knot" });
  b.part(new THREE.SphereGeometry(0.022, 7, 5), TRUNKP, { bone: stand, at: [0.045, 0.62, -0.245], scale: [1, 1, 0.6], name: "knotTrunk" });
  b.spike([0.06, 0.52, -0.22], [1, 0.5, 0.25], 0.13, 0.016, { bone: stand, color: TWIGP, sides: 5, name: "stub" });
  b.spike([-0.06, 0.95, -0.27], [-1, 0.6, 0.1], 0.1, 0.014, { bone: stand, color: TWIGP, sides: 5, name: "stub" });

  // twigs with leaves
  const tOff: [number, [number, number, number][]][] = [
    [0.55, [[0.18, 0.1, 0.04], [0.38, 0.18, 0.1], [0.56, 0.18, 0.18]]],
    [0.62, [[-0.2, 0.12, 0.0], [-0.4, 0.22, 0.06], [-0.6, 0.24, 0.14]]],
    [0.78, [[0.14, 0.14, 0.05], [0.28, 0.34, 0.12], [0.36, 0.52, 0.2]]],
    [0.84, [[-0.14, 0.15, 0.03], [-0.26, 0.32, 0.08], [-0.34, 0.5, 0.16]]],
    [0.96, [[0.0, 0.14, 0.05], [0.06, 0.3, 0.1], [0.04, 0.46, 0.2]]],
    [0.4, [[0.2, 0.05, -0.04], [0.4, 0.08, -0.08], [0.56, 0.0, -0.08]]],
    [0.3, [[-0.18, 0.06, -0.03], [-0.34, 0.1, -0.06], [-0.5, 0.04, -0.04]]],
  ];
  const leafTargets: ReturnType<typeof b.sweep>[] = [];
  const mkTwig = (start: THREE.Vector3, offs: [number, number, number][], r0: number) => {
    const pts = [start.toArray(), ...offs.map((o) => [start.x + o[0], start.y + o[1], start.z + o[2]])];
    const sw = b.sweep(catmull(pts), [r0, 0.004], { bone: stand, color: TWIGP, sides: 5, caps: { end: "point" }, name: "twig" });
    leafTargets.push(sw);
    return sw;
  };
  tOff.forEach(([t, offs]) => {
    const st = TRUNK.at(t).clone();
    mkTwig(st, offs, 0.022);
  });
  // twigs from the gripped limb, one leafy sprig up front by the koala's face
  mkTwig(LIMB.at(0.62).clone(), [[0.1, 0.1, 0.1], [0.2, 0.15, 0.22], [0.26, 0.16, 0.34]], 0.012);
  mkTwig(LIMB.at(0.78).clone(), [[-0.1, 0.1, 0.0], [-0.22, 0.2, 0.06], [-0.3, 0.3, 0.1]], 0.01);
  mkTwig(LIMB.at(0.92).clone(), [[0.08, 0.1, -0.02], [0.16, 0.2, 0.0], [0.2, 0.32, 0.04]], 0.008);
  const leafSets = [
    { tex: LEAF_A, n: 0.35 },
    { tex: LEAF_B, n: 0.3 },
    { tex: LEAF_C, n: 0.25 },
  ];
  void leafSets;
  const lr = rng(77);
  leafTargets.forEach((sw, i) => {
    const hits = b.surface(sw).scatter(14, { rng: rng(100 + i), minDist: 0.04, filter: (h) => h.n.y > -0.4 });
    b.cards(hits, [LEAF_A, LEAF_B, LEAF_C], { size: [0.05, 0.18], lean: 55, bend: 28, flow: [0, -1, 0.15], vary: 0.25, rng: lr, bone: stand });
  });
  // the limb's own crown of leaves and juvenile silver discs
  const crown = b.surface(limbTube).scatter(26, { rng: rng(210), minDist: 0.05, filter: (h) => h.at.y > 1.0 });
  b.cards(crown, [LEAF_A, LEAF_B, LEAF_C, DISC], { size: [0.055, 0.19], lean: 50, bend: 24, flow: [0, -1, 0.1], vary: 0.25, rng: lr, bone: stand });
  const trunkTop = b.surface(trunk).scatter(18, { rng: rng(215), minDist: 0.06, filter: (h) => h.at.y > 1.3 });
  b.cards(trunkTop, [LEAF_A, LEAF_C, DISC], { size: [0.055, 0.19], lean: 45, bend: 24, flow: [0, -1, 0.1], vary: 0.25, rng: lr, bone: stand });
  // silver discs lower on the stand where juvenile growth shoots out
  const lowerDiscs = b.surface(trunk).scatter(5, { rng: rng(217), minDist: 0.1, filter: (h) => h.at.y > 0.8 && h.at.y < 1.3 && h.n.z > 0 });
  b.cards(lowerDiscs, DISC, { size: [0.1, 0.1], lean: 70, bend: 20, flow: [0, -1, 0.6], vary: 0.2, rng: lr, bone: stand });

  // gum nuts
  const nutGeo = new THREE.SphereGeometry(0.014, 6, 4);
  const nuts: THREE.BufferGeometry[] = [];
  leafTargets.slice(0, 4).forEach((sw) => {
    const q = sw.at(0.85, 180);
    for (let i = 0; i < 3; i++) nuts.push(nutGeo.clone().translate(q.at.x + 0.014 * (i - 1), q.at.y - 0.02 - 0.008 * (i % 2), q.at.z + 0.01 * (i === 1 ? 1 : 0)));
  });
  if (nuts.length) {
    const merged = new THREE.BufferGeometry();
    void merged;
  }
  void nuts;

  // peeling bark strips along the trunk and the perch
  const barkHits = b.surface(trunk).scatter(22, { rng: rng(230), minDist: 0.1, filter: (h) => h.at.y > 0.5 && h.at.y < 1.4 && h.n.z > -0.4 });
  b.cards(barkHits, STRIP, { size: [0.035, 0.13], lean: 38, bend: 22, flow: [0, -1, 0], vary: 0.3, rng: lr, bone: stand });
  const mossHits = b.surface(trunk).scatter(12, { rng: rng(232), minDist: 0.06, filter: (h) => h.at.y < 0.4 });
  b.cards(mossHits, MOSSCARD, { size: [0.05, 0.035], lean: 60, flow: [0, -1, 0.2], vary: 0.25, rng: lr, bone: stand });
  const perchBark = b.surface(perch).scatter(9, { rng: rng(234), minDist: 0.07, filter: (h) => h.n.y > 0.1 && h.at.z < 0.15 });
  b.cards(perchBark, STRIP, { size: [0.03, 0.09], lean: 80, bend: 10, flow: [0, 0, -1], vary: 0.3, rng: lr, bone: stand });

  // bracket fungi on the trunk
  for (const [y, a, sc] of [
    [0.3, 1.1, 1],
    [0.46, 2.1, 0.75],
    [0.62, -0.9, 0.9],
  ] as const) {
    const r = 0.068;
    const x = Math.sin(a) * (r + 0.0);
    const z = -0.255 + Math.cos(a) * r;
    b.part(new THREE.CylinderGeometry(0.06 * sc, 0.06 * sc, 0.016 * sc, 9, 1, false, 0, Math.PI), SHELF_TOP, {
      bone: stand,
      at: [x, y, z],
      rotation: [0, (a * 180) / Math.PI + 90, 0],
      name: "fungus",
    });
  }

  // fallen leaves, gum nuts and pebbles on the base
  const floor = [
    [0.22, 0.082, 0.3],
    [-0.26, 0.082, 0.2],
    [0.28, 0.082, -0.1],
    [-0.2, 0.082, -0.18],
    [0.08, 0.082, 0.34],
    [-0.1, 0.082, 0.36],
  ];
  floor.forEach((p, i) => {
    b.cards([frame(p, [0, 1, 0])], [LEAF_A, LEAF_C][i % 2], { size: [0.05, 0.17], lean: 90, flow: [Math.sin(i * 2), 0, Math.cos(i * 2)], mirror: true, bone: stand });
  });
  for (const [x, z] of [
    [0.12, 0.2],
    [-0.3, -0.05],
    [0.3, 0.12],
  ]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), WOODBARK[3], { bone: stand, at: [x, 0.09, z], scale: [1, 0.8, 1], name: "gumnut" });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.008, 6), WOODBARK[1], { bone: stand, at: [x, 0.1, z], name: "gumnutCap" });
  }
  for (const [x, z, r] of [
    [0.34, 0.2, 0.03],
    [-0.32, 0.12, 0.022],
    [-0.12, -0.3, 0.026],
  ])
    b.part(new THREE.DodecahedronGeometry(r, 0), "#7d8088", { bone: stand, at: [x, 0.08 + r * 0.4, z], scale: [1, 0.6, 1], name: "pebble" });

  void smoothstep;
  return b.root;
}
