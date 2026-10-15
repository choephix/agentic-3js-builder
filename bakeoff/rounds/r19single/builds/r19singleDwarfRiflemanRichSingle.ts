// Dwarf Rifleman: a chunky Warcraft-style dwarf gunner with a braided copper beard, a quilted blue tunic, steel
// pauldrons with gold ribs, and a flared brass-banded blunderbuss held at the hip. About 1.4 m tall with helmet.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { grain, mix, noise, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A heroic, hand-painted dwarf gunner: braided copper beard with gold rings, curled moustache, steel helmet with goggles, gold-ribbed pauldrons, quilted blue tunic, red tabard, bandolier, powder horn, hatchet, rucksack and a flared brass blunderbuss.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });

  // ------------------------------------------------------------------ small helpers
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r: number, h: number, s = 8) => new THREE.ConeGeometry(r, h, s);
  const tor = (R: number, r: number, s = 14, t = 6) => new THREE.TorusGeometry(R, r, t, s);
  const put = (
    geo: THREE.BufferGeometry,
    color: Col,
    bone: Joint,
    at: THREE.Vector3 | readonly number[],
    o: PartOptions = {},
  ) => b.part(geo, color, { bone, at, ...o });

  // ------------------------------------------------------------------ palette
  const SKIN = "#e2a37b";
  const SKIN_HI = "#f6c29c";
  const SKIN_LO = "#b9684c";
  const BEARD = "#c8561c";
  const BEARD_HI = "#f4983a";
  const BEARD_LO = "#862f10";
  const BLUE = "#2d5fb5";
  const BLUE_HI = "#5f90e6";
  const BLUE_LO = "#1a3478";
  const GOLD = "#f2c035";
  const GOLD_HI = "#fff1a6";
  const GOLD_LO = "#a8741c";
  const STEEL = "#9aa8ba";
  const STEEL_HI = "#e6eef8";
  const STEEL_LO = "#4a566b";
  const LEATH = "#8c5628";
  const LEATH_HI = "#bd7d42";
  const LEATH_LO = "#4e2d16";
  const RED = "#c2352b";
  const CREAM = "#eadcb0";
  const DARK = "#1c1822";
  const BRASS = "#d9a23c";
  const PANTS = "#7b5b3a";

  // ------------------------------------------------------------------ paints (hand-painted light and shade)
  const lit = (base: string, hi: string, lo: string, size = 0, seed = 1): Paint =>
    paint((p, n) => {
      const k = n.y;
      let c = k >= 0 ? mix(base, hi, Math.min(1, k * 0.85)) : mix(base, lo, Math.min(1, -k * 0.85));
      if (size > 0) {
        const g = noise(p, size, seed) - 0.5;
        c = mix(c, g > 0 ? hi : lo, Math.min(1, Math.abs(g) * 0.8));
      }
      return c;
    });
  const strands = (base: string, hi: string, lo: string, seed: number): Paint =>
    paint((p, n) => {
      const q = new THREE.Vector3(p.x, p.y * 0.12, p.z);
      const v = noise(q, 0.02, seed);
      let c = v > 0.5 ? mix(base, hi, (v - 0.5) * 2.4) : mix(base, lo, (0.5 - v) * 2.4);
      const k = n.y * 0.3;
      c = k >= 0 ? mix(c, hi, k) : mix(c, lo, -k);
      return c;
    });
  const quilt = (base: Paint, seam: string): Paint =>
    paint((p) => {
      const near = (v: number) => Math.abs(v - Math.round(v)) < 0.05;
      return near((p.x + p.y) / 0.08) || near((p.x - p.y) / 0.08) ? seam : base;
    });

  const SKINP = lit(SKIN, SKIN_HI, SKIN_LO, 0.05, 2);
  const FLUSHP = lit("#dd7a5c", "#f29a7c", "#a8503c", 0.04, 9);
  const BEARDP = strands(BEARD, BEARD_HI, BEARD_LO, 11);
  const STRAND2 = strands("#a8420f", "#e87d25", "#6e260a", 12);
  const STRAND3 = strands("#d9692a", "#ffb04a", "#963514", 13);
  const BLUEP = lit(BLUE, BLUE_HI, BLUE_LO, 0.06, 3);
  const TUNIC = quilt(BLUEP, "#173072");
  const STEELP = lit(STEEL, STEEL_HI, STEEL_LO, 0.045, 4);
  const GOLDP = lit(GOLD, GOLD_HI, GOLD_LO);
  const LEATHP = lit(LEATH, LEATH_HI, LEATH_LO, 0.03, 5);
  const LEATH2 = lit("#5e3a1c", "#8a5a30", "#34200f", 0.03, 6);
  const PANTSP = lit(PANTS, "#a47e50", "#4a3420", 0.04, 7);
  const CREAMP = lit(CREAM, "#fff7da", "#b6a272");
  const HORNTIP = lit("#4a3424", "#7a5a40", "#2a1c12");
  const WOODP = grain("#c48a4c", "#7a4a22", { size: 0.012, axis: [0, 0.57, 0.82] });
  const REDP = lit(RED, "#e5594a", "#7e1c1c");
  const BEDROLL = stripes("#b8432f", "#e8d6a2", { size: 0.07, axis: "x", width: 0.45, wobble: 0.2 });

  const BARRELP = paint((_p, _n, s) => {
    const h = s[0];
    const band = (a: number) => Math.abs(h - a) < 0.012;
    if (band(0.06) || band(0.2) || band(0.34) || h > 0.57) return GOLDP;
    if (h > 0.37 && (((s[1] / 22.5) % 1) + 1) % 1 < 0.08) return GOLD_LO;
    return STEELP;
  });
  const HELMP = paint((_p, _n, s) => (s[0] < 0.024 ? GOLDP : STEELP));
  const PAULD = paint((_p, _n, s) => {
    if (s[1] < 0.1) return GOLDP;
    if (Math.abs(((s[0] * 8) % 1) - 0.5) < 0.04) return GOLDP;
    return STEELP;
  });

  // ------------------------------------------------------------------ textures
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const pt = (r: number, da: number) =>
      `${(50 + Math.cos(a + da) * r).toFixed(1)},${(52 + Math.sin(a + da) * r).toFixed(1)}`;
    return `<polygon points="${pt(19, -0.2)} ${pt(35, 0)} ${pt(19, 0.2)}" fill="#f2c035"/>`;
  }).join("");
  const TABARD = svg(
    `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8443f"/><stop offset="1" stop-color="#86171f"/></linearGradient></defs>
      <path d="M2 0 H98 V122 L74 140 L50 124 L26 140 L2 122 Z" fill="url(#g)"/>
      <path d="M7 5 H93 V118 L74 133 L50 118 L26 133 L7 118 Z" fill="none" stroke="#f2c035" stroke-width="4" stroke-linejoin="round"/>
      <path d="M12 11 H88 V114 L74 126 L50 112 L26 126 L12 114 Z" fill="none" stroke="#ffe08a" stroke-width="1.2" stroke-dasharray="3 3"/>
      ${rays}
      <circle cx="50" cy="52" r="19" fill="#f2c035" stroke="#a8741c" stroke-width="2"/>
      <polygon points="32,68 50,34 68,68" fill="#7a1520" stroke="#4a0c14" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="50,34 44,45 50,42 56,45" fill="#fff3d8"/>
      <circle cx="30" cy="100" r="4" fill="#f2c035"/><circle cx="50" cy="104" r="4" fill="#f2c035"/><circle cx="70" cy="100" r="4" fill="#f2c035"/>
    </svg>`,
    { size: 256 },
  );
  const CLOTHBACK = svg(
    `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b43a36"/><stop offset="1" stop-color="#6e1219"/></linearGradient></defs>
      <path d="M2 0 H98 V122 L74 140 L50 124 L26 140 L2 122 Z" fill="url(#g)"/>
      <path d="M7 5 H93 V118 L74 133 L50 118 L26 133 L7 118 Z" fill="none" stroke="#d9a23c" stroke-width="3.5" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );
  const BADGE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#7a4a10"/>
      <circle cx="32" cy="32" r="26" fill="#f2c035"/>
      <circle cx="32" cy="32" r="19" fill="#c2352b" stroke="#a8741c" stroke-width="2"/>
      <polygon points="32,12 38,26 53,26 41,35 46,50 32,41 18,50 23,35 11,26 26,26" fill="#ffe08a"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------ torso envelope (for strap placement)
  // [y, half width, half depth, centre z]
  const TORSO = [
    [0.5, 0.19, 0.15, 0.0],
    [0.6, 0.215, 0.18, 0.02],
    [0.75, 0.225, 0.18, 0.033],
    [0.88, 0.25, 0.16, 0.041],
    [0.96, 0.21, 0.13, 0.047],
    [1.0, 0.12, 0.1, 0.05],
  ];
  const lerpKeys = (keys: number[][], x: number): number[] => {
    if (x <= keys[0][0]) return keys[0].slice(1);
    for (let i = 1; i < keys.length; i++) {
      if (x <= keys[i][0]) {
        const a = keys[i - 1];
        const c = keys[i];
        const f = (x - a[0]) / (c[0] - a[0]);
        return a.slice(1).map((v, j) => v + (c[j + 1] - v) * f);
      }
    }
    return keys[keys.length - 1].slice(1);
  };
  const torsoRadius = (t: number): [number, number] => {
    const k = lerpKeys(TORSO, 0.5 + 0.5 * t);
    return [k[0], k[1]];
  };
  const onTorso = (x: number, y: number, lift: number): number[] => {
    const [rx, ry, zc] = lerpKeys(TORSO, y);
    const q = Math.min(0.96, Math.abs(x) / (rx + lift));
    return [x, y, zc + (ry + lift) * Math.sqrt(1 - q * q)];
  };

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, 0],
      [0, 0.68, 0.025],
      [0, 0.87, 0.04],
      [0, 1.0, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const [spine1, spine2, chest] = spine.joints;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0.05], aim: [0, 1.08, 0.07], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.08, 0.07], aim: [0, 1.2, 0.08], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.11, 0.07], aim: [0, 1.07, 0.2], role: "jaw" });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.11, 0.5, 0], [s * 0.115, 0.1, 0.01], [0.22, 0.21], [[0, 0, 1]]);
    const chain = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    return { s, pts, chain, knee: chain.joints[1], ankle: chain.joints[2] };
  });

  const arms = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.28, 0.93, 0];
    const pts =
      s > 0
        ? limb(sh, [0.42, 0.43, 0.07], [0.27, 0.26], [[0.4, 0, -1]])
        : limb(sh, [-0.3, 0.74, 0.22], [0.23, 0.25], [[-0.5, -0.4, -1]]);
    const chain = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    return { s, pts, chain, elbow: chain.joints[1], wrist: chain.joints[2] };
  });
  const armL = arms[0];
  const armR = arms[1];

  // ------------------------------------------------------------------ torso, pelvis, legs
  b.sweep(spine, torsoRadius, { color: TUNIC, name: "torso" });
  put(ball(1, 12, 8), PANTSP, hips, [0, 0.46, 0], { scale: [0.19, 0.14, 0.155] });

  for (const leg of legs) {
    const { s } = leg;
    b.sweep(leg.chain, [0.115, 0.1, 0.092, 0.088], { color: PANTSP });
    const bx = s * 0.118;
    // boot: shaft, turned cuff, straps, buckles, foot, sole, heel, steel toe cap
    put(cyl(0.115, 0.105, 0.2, 12), LEATHP, leg.ankle, [bx, 0.2, 0.0]);
    put(cyl(0.126, 0.126, 0.04, 12), LEATH2, leg.ankle, [bx, 0.295, 0.0]);
    put(cyl(0.12, 0.12, 0.022, 12), LEATH2, leg.ankle, [bx, 0.185, 0.0]);
    put(cyl(0.12, 0.12, 0.022, 12), LEATH2, leg.ankle, [bx, 0.235, 0.0]);
    put(box(0.034, 0.03, 0.014), GOLD, leg.ankle, [bx, 0.185, 0.122]);
    put(box(0.034, 0.03, 0.014), GOLD, leg.ankle, [bx, 0.235, 0.124]);
    put(ball(0.1, 10, 8), LEATHP, leg.ankle, [bx, 0.075, 0.075], { scale: [1.0, 0.72, 1.5] });
    put(box(0.2, 0.035, 0.36), DARK, leg.ankle, [bx, 0.0175, 0.07]);
    put(box(0.15, 0.05, 0.07), LEATH2, leg.ankle, [bx, 0.045, -0.04]);
    put(ball(0.065, 8, 6), STEELP, leg.ankle, [bx, 0.062, 0.165], { scale: [1.1, 0.75, 1.05] });
    put(cyl(0.012, 0.012, 0.02, 6), GOLD, leg.ankle, [bx, 0.1, 0.225], { dir: [0, 1, 0.3] });
    // knee guard
    const k = leg.pts[1];
    put(ball(0.07, 9, 6), STEELP, leg.knee, [k.x, k.y + 0.01, k.z + 0.082], { scale: [1, 1, 0.55] });
    put(tor(0.056, 0.008, 12, 5), GOLD, leg.knee, [k.x, k.y + 0.01, k.z + 0.082], { dir: [0, 0.1, 1], axis: "z" });
    put(ball(0.012, 6, 4), GOLD, leg.knee, [k.x, k.y + 0.01, k.z + 0.118]);
  }

  // ------------------------------------------------------------------ belt, tabard, hip kit
  const BZ = 0.0155;
  put(cyl(0.232, 0.232, 0.07, 18), LEATHP, spine1, [0, 0.575, BZ], { scale: [1, 1, 0.82] });
  put(cyl(0.235, 0.235, 0.01, 18), GOLD, spine1, [0, 0.61, BZ], { scale: [1, 1, 0.82] });
  put(cyl(0.235, 0.235, 0.01, 18), GOLD, spine1, [0, 0.54, BZ], { scale: [1, 1, 0.82] });
  for (let i = 0; i < 9; i++) {
    if (i === 4) continue;
    const a = ((-70 + 17.5 * i) * Math.PI) / 180;
    put(ball(0.01, 6, 4), GOLD, spine1, [0.238 * Math.sin(a), 0.575, BZ + 0.196 * Math.cos(a)]);
  }
  put(box(0.09, 0.08, 0.02), GOLD, spine1, [0, 0.575, 0.2275]);
  put(new THREE.CircleGeometry(0.032, 16), "#ffffff", spine1, [0, 0.575, 0.2385], { texture: BADGE, dir: [0, 0, 1], axis: "z" });

  put(new THREE.PlaneGeometry(0.21, 0.29), "#ffffff", spine1, [0, 0.425, 0.168], {
    texture: TABARD,
    dir: [0, -0.25, 1],
    axis: "z",
  });
  put(new THREE.PlaneGeometry(0.21, 0.29), "#ffffff", spine1, [0, 0.425, -0.172], {
    texture: CLOTHBACK,
    dir: [0, -0.25, -1],
    axis: "z",
  });

  // right rear pouch
  put(box(0.1, 0.11, 0.06), LEATHP, spine1, [-0.14, 0.49, -0.2]);
  put(box(0.104, 0.035, 0.068), LEATH2, spine1, [-0.14, 0.55, -0.2]);
  put(box(0.025, 0.03, 0.01), GOLD, spine1, [-0.14, 0.53, -0.238]);
  put(box(0.03, 0.06, 0.02), LEATH2, spine1, [-0.14, 0.57, -0.17]);

  // hatchet on the left hip
  put(box(0.03, 0.075, 0.022), LEATH2, spine1, [0.238, 0.552, 0.05]);
  b.rod([0.255, 0.6, 0.05], [0.255, 0.235, 0.05], 0.014, WOODP, { bone: hips });
  put(ball(0.02, 6, 4), GOLD, hips, [0.255, 0.605, 0.05]);
  b.extrude(
    [
      [-0.02, 0.04],
      [0.06, 0.075],
      [0.095, 0.0, "sharp"],
      [0.06, -0.075],
      [-0.02, -0.04],
    ],
    { at: [0.255, 0.3, 0.05], x: [0, 0, 1], thickness: 0.018, bevel: 0.004, color: STEELP, bone: hips },
  );
  put(cyl(0.02, 0.02, 0.04, 8), GOLD, hips, [0.255, 0.3, 0.035], { dir: [1, 0, 0] });

  // powder horn hanging from the bandolier's end
  const horn = b.sweep(
    catmull([
      [0.17, 0.62, 0.18],
      [0.205, 0.56, 0.19],
      [0.225, 0.5, 0.17],
      [0.215, 0.44, 0.15],
    ]),
    [0.034, 0.03, 0.02, 0.007],
    { bands: [[0.6, CREAMP], [1, HORNTIP]], bone: spine1, caps: { start: "flat", end: "point" } },
  );
  put(tor(0.034, 0.009, 12, 5), BRASS, spine1, horn.at(0.0).at, { dir: [0.4, 0.8, -0.1], axis: "z" });
  put(cyl(0.032, 0.036, 0.016, 10), BRASS, spine1, [0.168, 0.63, 0.178], { dir: [0.4, 0.8, -0.1] });
  put(ball(0.012, 6, 4), GOLD, spine1, [0.175, 0.645, 0.18]);

  // ------------------------------------------------------------------ chest: plate, gorget, bandolier
  put(ball(1, 14, 10), STEELP, chest, [0, 0.83, 0.12], { scale: [0.205, 0.15, 0.11] });
  put(tor(0.115, 0.03, 14, 6), STEELP, chest, [0, 1.0, 0.05], { dir: [0, 1, 0], axis: "z" });
  put(tor(0.12, 0.009, 14, 5), GOLD, chest, [0, 1.025, 0.05], { dir: [0, 1, 0], axis: "z" });
  put(cyl(0.085, 0.095, 0.12, 10), SKINP, neck, [0, 1.04, 0.06]);

  const strapPts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    strapPts.push(onTorso(-0.15 + 0.34 * u, 0.97 - 0.39 * u, 0.012));
  }
  b.sweep(catmull(strapPts), (): [number, number] => [0.032, 0.012], {
    section: "box",
    color: LEATHP,
    bone: chest,
    caps: "flat",
  });
  for (let i = 1; i <= 7; i++) {
    const u = i / 8;
    const p = onTorso(-0.15 + 0.34 * u, 0.97 - 0.39 * u, 0.034);
    put(cyl(0.0145, 0.0145, 0.055, 6), REDP, chest, p);
    put(cyl(0.016, 0.016, 0.014, 6), BRASS, chest, [p[0], p[1] - 0.03, p[2]]);
    put(ball(0.012, 6, 4), "#3b2a24", chest, [p[0], p[1] + 0.03, p[2]]);
  }
  put(box(0.05, 0.04, 0.014), GOLD, chest, onTorso(-0.15, 0.975, 0.03));

  // ------------------------------------------------------------------ pauldrons
  for (const s of [1, -1]) {
    const axis = v3(s * 0.4226, 0.906, 0);
    const C = v3(s * 0.3, 0.96, 0);
    put(new THREE.SphereGeometry(0.155, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), PAULD, chest, C, { dir: axis });
    put(tor(0.153, 0.011, 18, 6), GOLD, chest, C.clone().addScaledVector(axis, -0.024), { dir: axis, axis: "z" });
    const apex = C.clone().addScaledVector(axis, 0.155);
    put(cone(0.04, 0.14, 8), STEELP, chest, apex.clone().addScaledVector(axis, 0.05), { dir: axis });
    put(tor(0.04, 0.01, 10, 5), GOLD, chest, apex.clone().addScaledVector(axis, -0.01), { dir: axis, axis: "z" });
    put(cyl(0.14, 0.15, 0.04, 14), STEELP, chest, C.clone().addScaledVector(axis, -0.045), { dir: axis });
    put(cyl(0.125, 0.135, 0.04, 14), STEELP, chest, C.clone().addScaledVector(axis, -0.088), { dir: axis });
    put(tor(0.143, 0.008, 16, 5), GOLD, chest, C.clone().addScaledVector(axis, -0.065), { dir: axis, axis: "z" });
    put(tor(0.128, 0.008, 16, 5), GOLD, chest, C.clone().addScaledVector(axis, -0.108), { dir: axis, axis: "z" });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const side = v3(0, 0, 1).cross(axis).normalize();
      const up2 = axis.clone().cross(side).normalize();
      const rivet = C.clone()
        .addScaledVector(axis, -0.03)
        .addScaledVector(side, Math.cos(a) * 0.152)
        .addScaledVector(up2, Math.sin(a) * 0.152);
      put(ball(0.009, 5, 4), GOLD, chest, rivet);
    }
  }

  // ------------------------------------------------------------------ arms
  for (const arm of arms) {
    const { s } = arm;
    const E = arm.pts[1];
    const W = arm.pts[2];
    b.sweep(arm.chain, [0.088, 0.082, 0.075, 0.07], {
      bands: [
        [0.5, TUNIC],
        [1, SKINP],
      ],
    });
    const fore = W.clone().sub(E);
    const mid = E.clone().addScaledVector(fore, 0.72);
    put(cyl(0.083, 0.088, 0.12, 10), LEATHP, arm.elbow, mid, { dir: fore });
    put(cyl(0.09, 0.09, 0.014, 10), GOLD, arm.elbow, E.clone().addScaledVector(fore, 0.62), { dir: fore });
    put(cyl(0.09, 0.09, 0.014, 10), GOLD, arm.elbow, E.clone().addScaledVector(fore, 0.82), { dir: fore });
    for (let k = 0; k < 3; k++) {
      const p = E.clone().addScaledVector(fore, 0.66 + 0.07 * k);
      put(ball(0.009, 5, 4), GOLD, arm.elbow, [p.x + s * 0.088, p.y, p.z]);
    }
    // elbow guard
    put(ball(0.066, 8, 6), STEELP, arm.elbow, [E.x + s * 0.02, E.y, E.z - 0.03]);
    put(ball(0.012, 6, 4), GOLD, arm.elbow, [E.x + s * 0.045, E.y, E.z - 0.075]);
    // gold sleeve cuff at the elbow
    put(cyl(0.092, 0.092, 0.018, 10), GOLD, arm.elbow, E.clone().addScaledVector(fore, 0.04), { dir: fore });
  }

  // left hand: open, relaxed, with separated fingers and thumb
  const dirL = armL.pts[2].clone().sub(armL.pts[1]).normalize();
  const palmL = armL.pts[2].clone().addScaledVector(dirL, 0.065);
  const knuckleL = palmL.clone().addScaledVector(dirL, 0.06);
  const fingersL = b.joint("fingersL", {
    parent: armL.wrist,
    at: knuckleL,
    aim: knuckleL.clone().addScaledVector(dirL, 0.1),
    role: "digit",
  });
  const baseT = palmL.clone().add(v3(-0.02, 0, 0.04)).addScaledVector(dirL, 0.015);
  const thumbL = b.joint("thumbL", {
    parent: armL.wrist,
    at: baseT,
    aim: baseT.clone().addScaledVector(dirL, 0.04).add(v3(0, 0, 0.03)),
    role: "digit",
  });
  put(box(0.11, 0.12, 0.07), SKINP, armL.wrist, palmL, { dir: dirL });
  const lenF = [0.9, 1.0, 1.0, 0.8];
  for (let i = 0; i < 4; i++) {
    const xo = (i - 1.5) * 0.026;
    const base = knuckleL.clone().add(v3(xo, 0, 0));
    const m = base.clone().addScaledVector(dirL, 0.04 * lenF[i]).add(v3(0, 0, 0.008));
    const t = base.clone().addScaledVector(dirL, 0.075 * lenF[i]).add(v3(0, 0, 0.032));
    b.sweep([base, m, t], [0.017, 0.014, 0.01], { color: SKINP, bone: fingersL });
  }
  const tm = baseT.clone().addScaledVector(dirL, 0.04).add(v3(0, 0, 0.026));
  const tt = tm.clone().addScaledVector(dirL, 0.032).add(v3(0, 0, 0.012));
  b.sweep([baseT, tm, tt], [0.02, 0.017, 0.012], { color: SKINP, bone: thumbL });

  // ------------------------------------------------------------------ blunderbuss (right hand)
  const G = v3(0.08, 0.57, 0.82).normalize();
  const GU = v3(0, G.z, -G.y).normalize();
  const GR = new THREE.Vector3().crossVectors(G, GU);
  const H = v3(-0.3, 0.745, 0.27);
  const gp = (a: number, s: number, u: number) =>
    H.clone().addScaledVector(GR, a).addScaledVector(G, s).addScaledVector(GU, u);
  const gun = b.joint("blunderbuss", { parent: armR.wrist, at: H, aim: gp(0, 0.3, 0) });
  const gput = (geo: THREE.BufferGeometry, color: Col, a: number, s: number, u: number, o: PartOptions = {}) =>
    put(geo, color, gun, gp(a, s, u), { dir: G, ...o });

  // stock
  b.frustumBox(gp(0, -0.31, -0.03), gp(0, -0.16, -0.012), [0.052, 0.135], [0.05, 0.095], { color: WOODP, bone: gun });
  b.frustumBox(gp(0, -0.16, -0.012), gp(0, 0.03, 0.005), [0.05, 0.095], [0.046, 0.06], { color: WOODP, bone: gun });
  gput(box(0.058, 0.016, 0.145), BRASS, 0, -0.318, -0.03);
  gput(box(0.012, 0.11, 0.05), GOLD_LO, 0.027, -0.2, 0.012);
  gput(ball(0.01, 5, 4), GOLD, 0.034, -0.24, 0.015);
  gput(ball(0.01, 5, 4), GOLD, 0.034, -0.16, 0.012);
  // barrel and flared bell
  const barrel: Array<[number, number]> = [
    [0, 0],
    [0.042, 0],
    [0.044, 0.02],
    [0.04, 0.04],
    [0.036, 0.07],
    [0.036, 0.32],
    [0.04, 0.36],
    [0.052, 0.42],
    [0.07, 0.48],
    [0.09, 0.54],
    [0.1, 0.575],
    [0.1, 0.585],
    [0, 0.585],
  ];
  b.lathe(barrel, { at: gp(0, -0.03, 0.05), axis: G, color: BARRELP, bone: gun, segments: 12 });
  gput(cyl(0.084, 0.04, 0.1, 12), "#14101a", 0, 0.507, 0.05);
  gput(tor(0.094, 0.009, 16, 5), GOLD, 0, 0.553, 0.05, { axis: "z" });
  gput(tor(0.074, 0.008, 14, 5), BRASS, 0, 0.45, 0.05, { axis: "z" });
  gput(tor(0.04, 0.007, 10, 5), BRASS, 0, 0.0, 0.05, { axis: "z" });
  // fore-stock, ramrod, pipes
  b.frustumBox(gp(0, 0.03, 0.0), gp(0, 0.26, 0.005), [0.07, 0.05], [0.062, 0.042], { color: WOODP, bone: gun });
  gput(box(0.074, 0.016, 0.055), BRASS, 0, 0.268, 0.005);
  b.rod(gp(0, 0.0, -0.037), gp(0, 0.42, -0.037), 0.008, WOODP, { bone: gun });
  gput(cyl(0.01, 0.01, 0.02, 6), BRASS, 0, 0.425, -0.037);
  gput(box(0.022, 0.018, 0.02), BRASS, 0, 0.1, -0.03);
  gput(box(0.022, 0.018, 0.02), BRASS, 0, 0.22, -0.03);
  // lock: plates, hammer, pan, screws, trigger guard
  for (const a of [0.028, -0.028]) {
    gput(box(0.008, 0.11, 0.05), STEELP, a, 0.06, 0.02);
    gput(ball(0.008, 5, 4), GOLD, a * 1.2, 0.03, 0.03);
    gput(ball(0.008, 5, 4), GOLD, a * 1.2, 0.09, 0.012);
  }
  b.sweep([gp(0, 0.07, 0.035), gp(0, 0.045, 0.07), gp(0, 0.04, 0.1), gp(0, 0.065, 0.11)], [0.011, 0.009, 0.01, 0.007], {
    color: STEELP,
    bone: gun,
  });
  gput(box(0.02, 0.045, 0.02), BRASS, 0.034, 0.1, 0.03);
  b.sweep(
    catmull([gp(0, -0.07, -0.02), gp(0, -0.075, -0.07), gp(0, -0.01, -0.085), gp(0, 0.035, -0.05), gp(0, 0.045, -0.015)]),
    0.008,
    { color: BRASS, bone: gun },
  );
  b.rod(gp(0, -0.01, -0.02), gp(0, -0.025, -0.055), 0.006, STEELP, { bone: gun });
  // sling loop
  b.sweep(catmull([gp(0, -0.2, -0.07), gp(0, -0.1, -0.2), gp(0, 0.1, -0.22), gp(0, 0.2, -0.06)]), 0.012, {
    color: LEATHP,
    bone: gun,
  });
  gput(tor(0.014, 0.004, 8, 4), BRASS, 0, -0.2, -0.065);
  gput(tor(0.014, 0.004, 8, 4), BRASS, 0, 0.2, -0.062);

  // right hand: gloved fist round the wrist of the stock, knuckles, thumb
  const fingersR = b.joint("fingersR", { parent: armR.wrist, at: gp(0.05, -0.065, 0), aim: gp(0.05, 0.015, 0), role: "digit" });
  const thumbR = b.joint("thumbR", { parent: armR.wrist, at: gp(0.035, -0.015, 0.03), aim: gp(0.01, 0.03, 0.04), role: "digit" });
  gput(cyl(0.058, 0.058, 0.1, 10), SKINP, 0, -0.03, 0);
  for (let k = 0; k < 4; k++) {
    put(ball(0.0235, 7, 5), SKINP, fingersR, gp(0.055, -0.07 + 0.027 * k, -0.005));
  }
  b.sweep([gp(0.035, -0.015, 0.03), gp(0.02, 0.012, 0.045), gp(0.0, 0.035, 0.045)], [0.021, 0.018, 0.014], {
    color: SKINP,
    bone: thumbR,
  });

  // ------------------------------------------------------------------ head
  put(ball(1, 16, 12), SKINP, head, [0, 1.15, 0.09], { scale: [0.15, 0.14, 0.145] });
  put(ball(1, 12, 8), SKINP, jaw, [0, 1.075, 0.14], { scale: [0.125, 0.08, 0.11] });
  put(ball(1, 12, 8), BEARDP, head, [0, 1.13, -0.01], { scale: [0.16, 0.12, 0.14] });
  // nose
  b.capsule([0, 1.17, 0.235], [0, 1.125, 0.27], 0.028, { color: SKINP, bone: head });
  put(ball(0.042, 8, 6), FLUSHP, head, [0, 1.115, 0.268], { scale: [1.05, 0.9, 1] });
  for (const s of [1, -1]) {
    // cheeks, brows, eyes, ears, moustache, sideburns
    put(ball(0.055, 8, 6), FLUSHP, head, [s * 0.085, 1.12, 0.195], { scale: [1, 0.9, 0.85] });
    b.sweep(
      [
        [s * 0.115, 1.215, 0.16],
        [s * 0.07, 1.215, 0.215],
        [s * 0.012, 1.2, 0.238],
      ],
      [0.026, 0.03, 0.026],
      { color: BEARDP, bone: head },
    );
    put(ball(0.021, 8, 6), "#f4efe0", head, [s * 0.058, 1.165, 0.212]);
    put(ball(0.0125, 6, 4), "#3a86b8", head, [s * 0.058, 1.165, 0.228]);
    put(ball(0.0065, 6, 4), "#10121a", head, [s * 0.058, 1.165, 0.236]);
    put(ball(0.004, 4, 3), "#ffffff", head, [s * 0.053, 1.171, 0.2385]);
    put(ball(1, 8, 6), SKINP, head, [s * 0.15, 1.15, 0.06], { scale: [0.018, 0.05, 0.04] });
    put(cone(0.02, 0.05, 6), SKINP, head, [s * 0.152, 1.2, 0.058], { dir: [s * 0.2, 1, 0] });
    put(tor(0.02, 0.005, 10, 4), GOLD, head, [s * 0.154, 1.11, 0.06], { dir: [s, 0, 0], axis: "z" });
    b.sweep(
      [
        [s * 0.145, 1.16, 0.1],
        [s * 0.14, 1.1, 0.16],
        [s * 0.125, 1.04, 0.2],
      ],
      [0.04, 0.046, 0.04],
      { color: BEARDP, bone: head },
    );
    b.sweep(
      [
        [0, 1.072, 0.255],
        [s * 0.05, 1.066, 0.265],
        [s * 0.105, 1.045, 0.25],
        [s * 0.14, 1.03, 0.215],
        [s * 0.165, 1.05, 0.185],
      ],
      [0.034, 0.032, 0.027, 0.019, 0.006],
      { color: BEARDP, bone: head },
    );
  }

  // ------------------------------------------------------------------ helmet and goggles
  const helm: Array<[number, number]> = [
    [0, 0],
    [0.17, 0],
    [0.172, 0.02],
    [0.165, 0.05],
    [0.15, 0.09],
    [0.12, 0.125],
    [0.07, 0.145],
    [0, 0.15],
  ];
  b.lathe(helm, { at: [0, 1.215, 0.075], bone: head, color: HELMP, segments: 16 });
  b.sweep(
    catmull([
      [0, 1.293, 0.235],
      [0, 1.363, 0.175],
      [0, 1.377, 0.075],
      [0, 1.363, -0.025],
      [0, 1.285, -0.09],
    ]),
    (): [number, number] => [0.012, 0.015],
    { section: "box", color: GOLDP, bone: head },
  );
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    put(ball(0.009, 5, 4), GOLD, head, [0.172 * Math.sin(a), 1.225, 0.075 + 0.172 * Math.cos(a)]);
  }
  put(tor(0.168, 0.012, 18, 5), LEATH2, head, [0, 1.262, 0.075], { dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) {
    const pos = v3(s * 0.065, 1.318, 0.2);
    const nrm = v3(s * 0.3, 0.55, 0.8).normalize();
    put(cyl(0.038, 0.04, 0.035, 12), BRASS, head, pos, { dir: nrm });
    put(tor(0.037, 0.009, 12, 5), GOLD, head, pos.clone().addScaledVector(nrm, 0.018), { dir: nrm, axis: "z" });
    glow(
      put(new THREE.CircleGeometry(0.031, 12), "#9fefff", head, pos.clone().addScaledVector(nrm, 0.019), {
        dir: nrm,
        axis: "z",
      }),
      0.7,
    );
    put(cone(0.016, 0.03, 6), STEELP, head, [s * 0.172, 1.235, 0.075], { dir: [s, 0.2, 0] });
  }

  // ------------------------------------------------------------------ beard, moustache, braids
  const stations = [
    { at: [0, 1.085, 0.16], w: 0.25, h: 0.16 },
    { at: [0, 1.0, 0.215], w: 0.33, h: 0.14 },
    { at: [0, 0.9, 0.235], w: 0.34, h: 0.12 },
    { at: [0, 0.8, 0.23], w: 0.26, h: 0.1 },
    { at: [0, 0.72, 0.215], w: 0.12, h: 0.07 },
    { at: [0, 0.665, 0.2], w: 0.03, h: 0.03 },
  ];
  const beard = b.chain("beard", catmull(stations.map((st) => st.at)), {
    parent: jaw,
    names: ["beard1", "beard2", "beard3", "beard4", "beard5"],
  });
  b.loft(stations, { bone: beard, color: BEARDP, name: "beard" });
  put(tor(0.034, 0.01, 12, 5), GOLD, beard.joints[3], [0, 0.77, 0.275], { dir: [0, 0, 1], axis: "z" });
  put(ball(0.013, 6, 4), RED, beard.joints[3], [0, 0.745, 0.28]);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const centre = [
      [s * 0.11, 0.96, 0.28],
      [s * 0.12, 0.86, 0.29],
      [s * 0.122, 0.76, 0.265],
      [s * 0.118, 0.66, 0.235],
      [s * 0.112, 0.58, 0.22],
    ];
    const cp = catmull(centre);
    const braid = b.chain(`braid${side}`, cp, {
      parent: jaw,
      names: [`braid${side}1`, `braid${side}2`, `braid${side}3`, `braid${side}4`],
      role: "tail",
    });
    const strandCols = [BEARDP, STRAND2, STRAND3];
    for (let k = 0; k < 3; k++) {
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 24; j++) {
        const u = j / 24;
        const c = cp.at(u);
        const rr = 0.014 * (1 - 0.5 * u);
        const phi = (k / 3) * Math.PI * 2 + u * 4 * Math.PI * 2;
        pts.push(v3(c.x + rr * Math.cos(phi), c.y, c.z + rr * Math.sin(phi)));
      }
      b.sweep(catmull(pts), [0.0145, 0.014, 0.01, 0.005], { color: strandCols[k], bone: braid });
    }
    for (const u of [0.0, 0.5, 0.92]) {
      const c = cp.at(u);
      const tan = cp.tangentAt(u);
      const bone = braid.joints[u < 0.3 ? 0 : u < 0.7 ? 1 : 3];
      put(tor(0.031 - 0.008 * u, 0.008, 10, 5), GOLD, bone, c, { dir: tan, axis: "z" });
    }
    const tip = cp.at(1);
    put(cone(0.026, 0.06, 7), BEARDP, braid.joints[3], [tip.x, tip.y - 0.03, tip.z], { dir: [0, -1, 0] });
    put(ball(0.014, 6, 4), RED, braid.joints[3], [tip.x, tip.y + 0.01, tip.z + 0.02]);
  }

  // ------------------------------------------------------------------ rucksack
  put(box(0.3, 0.34, 0.14), LEATHP, spine2, [0, 0.8, -0.18]);
  put(box(0.31, 0.04, 0.16), LEATH2, spine2, [0, 0.965, -0.18]);
  put(cyl(0.075, 0.075, 0.38, 12), BEDROLL, spine2, [0, 1.025, -0.2], { dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    put(cyl(0.078, 0.078, 0.03, 12), LEATH2, spine2, [s * 0.1, 1.025, -0.2], { dir: [1, 0, 0] });
    put(box(0.06, 0.16, 0.12), LEATHP, spine2, [s * 0.18, 0.72, -0.18]);
    put(box(0.035, 0.3, 0.012), LEATH2, spine2, [s * 0.07, 0.8, -0.252]);
    put(box(0.04, 0.035, 0.012), GOLD, spine2, [s * 0.07, 0.88, -0.258]);
  }
  put(cyl(0.035, 0.03, 0.06, 10), STEELP, spine2, [-0.195, 0.89, -0.22]);
  put(tor(0.02, 0.004, 8, 4), BRASS, spine2, [-0.195, 0.925, -0.22], { dir: [0, 0, 1], axis: "z" });

  return b.root;
}
