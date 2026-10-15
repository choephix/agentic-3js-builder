// Ancient Treant: a walking tree guardian in a chunky, hand-painted Blizzard/Warcraft style. Oversized shoulders,
// hands and head, plated painted bark with moss and warm top-light, bronze trims with rivets, glowing amber runes,
// a heart-ember in the chest, a leafy antler crown and mushrooms growing on the shoulders.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { Frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mix, mottle, noise, paint, patches, resolve, smoothstep, spots } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { Sweep } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: plated mossy bark, oversized hands and shoulders, bronze bands, a glowing amber heart and runes, mushrooms and a leafy antler crown.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette
const BARK_DARK = "#2e1c10";
const BARK = "#5e3d20";
const BARK_MID = "#7a5230";
const BARK_LIGHT = "#a0713c";
const BARK_WARM = "#c0884a";
const MOSS = "#58922c";
const MOSS_DARK = "#2f5e1d";
const AMBER = "#ffb52e";
const AMBER_HOT = "#fff0b0";
const CLAW = "#2b1a10";
const BONE = "#e6d9b8";
const BRONZE = "#b9792e";
const GOLD = "#e2b040";
const MUSH_RED = "#c7362b";
const MUSH_CREAM = "#f2e6c4";
const MUSH_BRACKET = "#c9762f";
const VINE = "#3f7a24";
const MOUTH = "#1a0d08";
const SOCKET = "#160b06";
const ROPE = "#8a6a3a";

// Painted wood: patchy plated bark with dark cracks, vertical streaks, moss on upward faces and near the ground,
// a warm painted highlight on top and a dark shadow underneath.
const woodPaint = (seed: number, plate: number, mossAmt: number, lowMoss = true) => {
  const plates = patches(BARK_DARK, [BARK, BARK_MID, BARK_LIGHT], { size: plate, gap: 0.1, seed });
  const streak = grain(BARK_DARK, BARK_MID, { size: 0.02, seed: seed + 1 });
  const moss = mottle(MOSS_DARK, MOSS, { size: 0.09, seed: seed + 2 });
  return paint((p, n) => {
    let c = mix(resolve(plates, p, n), resolve(streak, p, n), 0.3);
    const m = noise(p, 0.5, seed + 3) + 0.35 * n.y;
    let w = smoothstep(0.78 - mossAmt, 0.95 - mossAmt, m);
    if (lowMoss) w = Math.max(w, smoothstep(0.55, 0.12, p.y) * smoothstep(0.35, 0.55, noise(p, 0.18, seed + 4)));
    c = mix(c, resolve(moss, p, n), w);
    c = mix(c, "#ffdca0", 0.22 * Math.max(n.y, 0) * (1 - w * 0.5));
    return mix(c, "#150a05", 0.4 * Math.max(-n.y, 0));
  });
};

export default function build() {
  const b = createBuilder({ name: "ancientTreant" });
  const R = rng(2024);
  const seedOf = () => Math.floor(R() * 1e6) + 1;
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  const TRUNKP = woodPaint(11, 0.22, 0.12);
  const LIMBP = woodPaint(23, 0.16, 0.1);
  const LEGP = woodPaint(37, 0.2, 0.1);
  const HEADP = woodPaint(51, 0.12, 0.06, false);
  const CROWNP = woodPaint(61, 0.1, 0.08, false);
  const ROOTP = woodPaint(71, 0.14, 0.05);

  // Textures
  const leafSvg = (a: string, bb: string, vein: string, edge: string) =>
    svg(
      `<svg viewBox="0 0 64 96"><path d="M32 95 C4 72 2 34 32 2 C62 34 60 72 32 95Z" fill="${a}"/><path d="M32 95 C18 74 14 40 32 6 C50 40 46 74 32 95Z" fill="${bb}"/><path d="M32 94 L32 10 M32 72 L17 54 M32 72 L47 54 M32 50 L19 32 M32 50 L45 32" stroke="${vein}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M32 95 C4 72 2 34 32 2 C62 34 60 72 32 95Z" fill="none" stroke="${edge}" stroke-width="2.5"/></svg>`,
      { size: 128 },
    );
  const LEAVES = [
    leafSvg("#5fa82a", "#7fc83a", "#2f6a1c", "#2f5e18"),
    leafSvg("#4c9626", "#6cb834", "#285e18", "#26541a"),
    leafSvg("#8cc43a", "#b4dc4a", "#4a7a1c", "#4a7a20"),
  ];
  const AUTUMN = [
    leafSvg("#e0822a", "#f2b23c", "#8a3c12", "#8a3c12"),
    leafSvg("#c8501f", "#e8842c", "#7a2a10", "#7a2a10"),
  ];
  const CROWN_TEX = [LEAVES[0], LEAVES[1], LEAVES[2], LEAVES[0], AUTUMN[0], AUTUMN[1]];
  const VINE_TEX = [LEAVES[1], LEAVES[2]];
  const TUFT = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 48 C20 30 12 18 6 4 C16 14 24 28 28 48Z" fill="#4f8a28"/><path d="M26 48 C26 30 28 14 34 2 C36 18 34 34 34 48Z" fill="#66a834"/><path d="M20 48 C22 34 22 20 20 6 C26 18 30 34 30 48Z" fill="#7cc03c"/><path d="M30 48 C34 36 40 26 46 14 C44 30 40 40 38 48Z" fill="#58922c"/><path d="M10 48 C10 38 6 30 2 22 C10 28 16 38 18 48Z" fill="#3f7a24"/></svg>`,
    { size: 128 },
  );
  const MOSSHANG = svg(
    `<svg viewBox="0 0 48 72"><path d="M16 72 C14 50 8 30 12 4 C16 28 22 50 22 72Z" fill="#4f8a2a"/><path d="M26 72 C26 48 28 24 32 2 C36 26 36 50 36 72Z" fill="#6cb034"/><path d="M38 72 C40 52 44 34 42 8 C46 34 52 52 46 72Z" fill="#3f7a24"/><path d="M8 72 C8 58 4 48 4 36 C10 50 14 60 14 72Z" fill="#7cc03c"/></svg>`,
    { size: 128 },
  );
  const glyphPaths = [
    "M0 -4 V4 M0 -1 L3 -3.5 M0 2 L-3 -0.5",
    "M-3.5 -3.5 H3.5 M0 -3.5 V4 M-2.5 1 H2.5",
    "M-3.5 4 L0 -4 L3.5 4 M-2 1.5 H2",
    "M-3.5 -2.5 H3.5 M-3.5 2.5 H3.5 M0 -4 V4",
  ];
  const glyphs = Array.from(
    { length: 12 },
    (_, i) =>
      `<path transform="rotate(${i * 30} 50 50) translate(50 12)" d="${glyphPaths[i % 4]}" stroke-width="2.2"/>`,
  ).join("");
  const RUNERING = svg(
    `<svg viewBox="0 0 100 100"><g fill="none" stroke="#ffb52e" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="46" stroke-width="2.6"/><circle cx="50" cy="50" r="33" stroke-width="2"/>${glyphs}</g></svg>`,
    { size: 512 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#ffb52e" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="28" stroke-width="3"/><path d="M32 12 V52 M32 26 L46 14 M32 40 L18 28" stroke-width="4"/></g></svg>`,
    { size: 128 },
  );

  // Helpers
  const clump = (at: THREE.Vector3, dir: number[], n: number, size: number, tex: THREE.Texture[]) => {
    const items = b.ring(frame(at, dir), { count: n, radius: 0.04, tilt: 50 }).items;
    b.cards(items, tex, {
      size: [size * 0.7, size],
      lean: 25,
      bend: 20,
      flow: dir,
      vary: 0.25,
      spin: 25,
      rng: rng(seedOf()),
    });
  };
  const leafOn = (sw: Sweep, t0: number, t1: number, count: number, w: number, h: number, tex: THREE.Texture[]) => {
    const frames: Frame[] = [];
    for (let i = 0; i < count; i++) {
      const t = t0 + ((t1 - t0) * (i + R() * 0.8)) / count;
      frames.push(sw.at(Math.min(t, 0.999), R() * 360));
    }
    b.cards(frames, tex, {
      size: [w, h],
      lean: 50,
      bend: 25,
      flow: [0, 0.6, 0.2],
      vary: 0.3,
      spin: 30,
      rng: rng(seedOf()),
    });
  };
  const twigOn = (f: Frame, dir: THREE.Vector3, len: number, r: number, leaf: number, tex: THREE.Texture[]) => {
    b.spike(f, dir, len, r, BARK_MID);
    clump(f.at.clone().addScaledVector(dir, len), dir.toArray(), 6, leaf, tex);
  };
  const hang = (pts: Frame[], w: number, h: number) =>
    b.cards(
      pts.map((f) => frame(f, [0, 1, 0])),
      MOSSHANG,
      { size: [w, h], lean: 180, flow: [0, 0, 1], vary: 0.3, spin: 20, rng: rng(seedOf()) },
    );
  const mushroom = (on: Frame, h: number, r: number, seed: number) => {
    const tip = offset(on.at, on.axis, h);
    b.rod(on, tip, [r * 0.5, r * 0.38], MUSH_CREAM);
    b.lathe(
      [
        [0, 0.5 * r],
        [0.55 * r, 0.42 * r],
        [1.0 * r, 0.1 * r],
        [1.08 * r, -0.06 * r],
        [0.5 * r, -0.12 * r],
        [0, -0.1 * r],
      ],
      {
        at: on.moved(tip),
        axis: on.axis,
        segments: 8,
        color: spots(MUSH_RED, MUSH_CREAM, { size: r * 0.9, amount: 0.5, seed }),
      },
    );
  };
  const shelf = (on: Frame, r: number) =>
    b.stick(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), MUSH_BRACKET, on, {
      embed: 0.3,
      scale: [r, r * 0.45, r],
    });
  const branch = (name: string, pts: number[][], radii: number[], parent: Joint) => {
    const ch = b.chain(name, catmull(pts), { parent, names: [`${name}a`, `${name}b`] });
    const sw = b.sweep(ch, radii, { color: CROWNP });
    leafOn(sw, 0.35, 1, 14, 0.24, 0.34, CROWN_TEX);
    const last = new THREE.Vector3().fromArray(pts[2]);
    const d = last.clone().sub(new THREE.Vector3().fromArray(pts[1])).normalize();
    clump(last, d.toArray(), 9, 0.3, CROWN_TEX);
    for (const t of [0.4, 0.62, 0.8]) {
      const f = sw.at(t, 60 + R() * 240);
      const dir = f.axis.clone().multiplyScalar(0.8).addScaledVector(d, 0.6).normalize();
      twigOn(f, dir, 0.35, 0.03, 0.2, CROWN_TEX);
    }
    return sw;
  };

  // ---- Skeleton: spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 1.75, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.75, 0],
      [0, 2.2, 0.02],
      [0, 2.7, 0.07],
      [0, 3.25, 0.15],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.2, 0.12],
      [0, 3.46, 0.27],
      [0, 3.72, 0.44],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 3.72, 0.44], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.62, 0.62], aim: [0, 3.56, 1.0], role: "jaw" });

  // ---- Torso
  const torso = b.loft(
    [
      { at: [0, 1.55, 0.0], w: 0.9, h: 0.72 },
      { at: [0, 1.95, 0.0], w: 1.05, h: 0.86 },
      { at: [0, 2.5, 0.05], w: 1.4, h: 0.98 },
      { at: [0, 3.0, 0.12], w: 1.95, h: 1.08 },
      { at: [0, 3.3, 0.17], w: 1.25, h: 0.85 },
      { at: [0, 3.48, 0.2], w: 0.8, h: 0.7 },
    ],
    { bone: [hips, spine], color: TRUNKP },
  );
  const skin = b.surface(torso);
  const burlColors = [BARK_LIGHT, BARK_MID, BARK_WARM];
  skin
    .scatter(16, { rng: rng(5), minDist: 0.28, filter: (h) => h.n.y > -0.4 && h.at.y > 1.8 })
    .forEach((h) => {
      b.stick(new THREE.SphereGeometry(0.1 + R() * 0.07, 6, 4), burlColors[Math.floor(R() * 3)], h, {
        embed: 0.45,
        scale: [1, 0.6, 1],
      });
    });
  // Back ridges and thorns
  b.sweep(torso.line(0, 0.01), [0.05, 0.07, 0.06, 0.04], { bone: [hips, spine], color: BARK_LIGHT });
  for (const a of [-32, 32])
    b.sweep(torso.line(a, 0.0), [0.04, 0.05, 0.04, 0.03], { bone: [hips, spine], color: BARK_MID });
  for (let i = 0; i < 8; i++) {
    const f = torso.at(0.14 + i * 0.1, 0);
    b.spike(f, f, 0.16 + 0.06 * Math.sin(i * 0.9) + 0.02 * i * (i < 5 ? 1 : -1), 0.065, BARK_LIGHT);
  }
  // Trapezius roots from neck to shoulders
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 3.5, 0.12],
        [s * 0.55, 3.46, 0.1],
        [s * 1.05, 3.22, 0.02],
      ]),
      [0.17, 0.15, 0.13],
      { bone: chest, color: LIMBP },
    );
  }
  // Belt of rope, bronze buckle
  const beltPath = skin.loop(hips, { lift: 0.03 });
  b.sweep(beltPath, 0.06, { color: ROPE });
  const bh = skin.nearest([0, 1.78, 1]);
  b.stick(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10), BRONZE, bh, { embed: 0.4 });
  glow(b.stick(new THREE.OctahedronGeometry(0.06), AMBER, bh, { embed: 0.1 }), 1.4);
  b.along(skin.loop(hips, { lift: 0.07 }), 10, (at) => {
    b.part(sph(5, 4), GOLD, { at, scale: 0.03 });
  });
  // Vine sash with leaves
  const sash = b.sweep(
    skin.drape(
      catmull([
        [-0.8, 3.2, 0.1],
        [-0.65, 2.85, 0.5],
        [-0.4, 2.4, 0.58],
        [0, 2.1, 0.5],
        [0.45, 1.95, 0.45],
        [0.8, 1.85, 0.2],
      ]),
      { lift: 0.03 },
    ),
    0.05,
    { bone: [hips, spine], color: VINE },
  );
  leafOn(sash, 0.05, 0.95, 9, 0.12, 0.18, VINE_TEX);
  // Heart ember in the chest
  b.part(sph(10, 8), SOCKET, { bone: spine.joints[1], at: [0, 2.62, 0.5], scale: [0.3, 0.34, 0.1] });
  glow(b.part(new THREE.IcosahedronGeometry(0.15, 0), AMBER, { bone: spine.joints[1], at: [0, 2.62, 0.62], flat: true }), 1.6);
  b.part(new THREE.TorusGeometry(0.3, 0.05, 6, 12), BARK_LIGHT, { bone: spine.joints[1], at: [0, 2.62, 0.56] });
  b.part(new THREE.TorusGeometry(0.22, 0.025, 5, 12), BRONZE, { bone: spine.joints[1], at: [0, 2.62, 0.6] });
  glow(b.decal(torso, RUNERING, { at: [0, 2.62, 0.55], dir: [0, 0, 1], size: [0.95, 0.95], segments: 14 }), 1.2);
  // Neck
  b.sweep(neck, [0.45, 0.4, 0.36], { color: TRUNKP });
  const neckSw = b.sweep(neck, [0.0, 0.0, 0.0], { color: TRUNKP, from: 0.0, to: 0.01 });
  void neckSw;

  // ---- Head
  const skull = b.part(sph(12, 9), HEADP, { bone: head, at: [0, 4.0, 0.46], scale: [0.5, 0.46, 0.5] });
  b.frustumBox([0, 3.95, 0.55], [0, 3.84, 0.96], [0.7, 0.5], [0.5, 0.3], { bone: head, color: HEADP });
  b.spike([0, 3.93, 0.9], [0, 3.78, 1.22], null, 0.11, { bone: head, color: HEADP });
  b.part(new THREE.BoxGeometry(0.44, 0.1, 0.3), MOUTH, { bone: head, at: [0, 3.67, 0.78] });
  for (const x of [-0.17, -0.06, 0.06, 0.17])
    b.spike([x, 3.71, 0.93], [0, -1, 0], 0.1, 0.035, { bone: head, color: BONE });
  // Lower jaw
  b.frustumBox([0, 3.58, 0.66], [0, 3.52, 1.0], [0.6, 0.14], [0.42, 0.16], { bone: jaw, color: HEADP });
  b.part(sph(8, 6), HEADP, { bone: jaw, at: [0, 3.5, 1.0], scale: [0.2, 0.14, 0.14] });
  for (const s of [1, -1]) {
    b.part(sph(8, 6), HEADP, { bone: jaw, at: [s * 0.3, 3.55, 0.72], scale: [0.14, 0.12, 0.2] });
    b.spike([s * 0.15, 3.62, 0.98], [s * 0.1, 1, 0.3], 0.2, 0.045, { bone: jaw, color: BONE });
  }
  // Beard of roots and moss
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.07;
    const beard = b.sweep(
      catmull([
        [x, 3.52, 0.92],
        [x * 1.4, 3.2, 1.0],
        [x * 2.0, 2.8, 1.05],
      ]),
      [0.065, 0.045, 0.012],
      { bone: jaw, color: ROOTP },
    );
    hang([beard.at(0.45, 180), beard.at(0.75, 180)], 0.1, 0.22);
  }
  // Brow, cheeks, eyes, ears
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.46, 4.22, 0.6],
        [s * 0.28, 4.28, 0.85],
        [s * 0.04, 4.17, 0.94],
      ]),
      [0.095, 0.08, 0.065],
      { bone: head, color: HEADP },
    );
    b.part(sph(7, 5), HEADP, { bone: head, at: [s * 0.38, 3.86, 0.68], scale: [0.14, 0.13, 0.15] });
    b.part(sph(8, 6), SOCKET, { bone: head, at: [s * 0.22, 4.1, 0.85], scale: [0.13, 0.1, 0.08], rotation: [0, 0, s * 20] });
    glow(
      b.part(sph(8, 6), AMBER, {
        bone: head,
        at: [s * 0.22, 4.1, 0.9],
        scale: [0.085, 0.045, 0.04],
        rotation: [0, 0, s * 20],
      }),
      1.6,
    );
    glow(b.part(sph(5, 4), AMBER_HOT, { bone: head, at: [s * 0.22, 4.1, 0.93], scale: 0.02 }), 2);
    b.spike([s * 0.46, 4.02, 0.36], [s * 0.95, 4.3, 0.12], null, 0.1, { bone: head, color: HEADP });
    clump(new THREE.Vector3(s * 0.95, 4.3, 0.12), [s, 0.4, -0.2], 5, 0.18, VINE_TEX);
  }
  // Bronze circlet with an amber gem
  const circlet = b.sweep(b.surface(skull).loop([0, 4.36, 0.46], { lift: 0.02 }), 0.028, { bone: head, color: BRONZE });
  void circlet;
  b.along(b.surface(skull).loop([0, 4.36, 0.46], { lift: 0.05 }), 8, (at) => {
    b.part(sph(5, 4), GOLD, { at, scale: 0.03 });
  });
  const gh = b.surface(skull).nearest([0, 4.4, 1.0]);
  glow(b.stick(new THREE.OctahedronGeometry(0.06), AMBER, gh, { embed: 0.1 }), 1.4);

  // ---- Crown of branches
  const crownDefs: Array<{ k: string; pts: (s: number) => number[][]; r: number[] }> = [
    {
      k: "A",
      pts: (s) => [
        [s * 0.2, 4.32, 0.35],
        [s * 0.5, 4.62, 0.3],
        [s * 0.85, 4.85, 0.18],
      ],
      r: [0.09, 0.07, 0.03],
    },
    {
      k: "B",
      pts: (s) => [
        [s * 0.3, 4.25, 0.28],
        [s * 0.75, 4.42, 0.12],
        [s * 1.3, 4.55, -0.05],
      ],
      r: [0.09, 0.07, 0.03],
    },
    {
      k: "C",
      pts: (s) => [
        [s * 0.15, 4.3, 0.15],
        [s * 0.25, 4.65, -0.12],
        [s * 0.5, 4.9, -0.3],
      ],
      r: [0.09, 0.07, 0.03],
    },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const def of crownDefs) branch(`crown${def.k}${S}`, def.pts(s), def.r, head);
  }
  branch(
    "crownD",
    [
      [0, 4.3, 0.28],
      [0, 4.65, 0.22],
      [0, 4.95, 0.15],
    ],
    [0.1, 0.075, 0.03],
    head,
  );
  // Back branches
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    branch(
      `back${S}`,
      [
        [s * 0.6, 3.25, -0.25],
        [s * 1.0, 3.85, -0.55],
        [s * 1.45, 4.35, -0.5],
      ],
      [0.14, 0.1, 0.05],
      spine.joints[2],
    );
  }

  // ---- Limbs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Leg
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.45, 1.7, 0.02],
        [s * 0.5, 0.95, 0.18],
        [s * 0.55, 0.34, 0.14],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const legSw = b.sweep(leg, [0.34, 0.31, 0.27, 0.24], { color: LEGP });
    for (const a of [-55, 0, 55])
      b.sweep(legSw.line(a, 0), [0.05, 0.045, 0.035, 0.03], { bone: leg, color: BARK_MID });
    b.part(sph(8, 6), BARK_LIGHT, { bone: knee, at: [s * 0.5, 0.95, 0.46], scale: [0.2, 0.2, 0.16] });
    shelf(b.surface(legSw).nearest([s * 0.9, 0.7, 0.3]), 0.12);
    const anklePath = b.surface(legSw).loop(leg.at(0.8), { lift: 0.02 });
    b.sweep(anklePath, 0.035, { color: BRONZE });
    b.along(anklePath, 8, (at) => {
      b.part(sph(5, 4), GOLD, { at, scale: 0.04 });
    });
    const thighHit = b.surface(legSw).nearest(leg.at(0.25).at.clone().add(new THREE.Vector3(0, 0, 0.6)));
    glow(b.decal(legSw, GLYPH, { at: thighHit, size: [0.24, 0.24] }), 1.2);
    hang([legSw.at(0.3, 90), legSw.at(0.4, -90), legSw.at(0.55, 90), legSw.at(0.62, -90)], 0.12, 0.26);
    // Foot: pad, three root toes with claws, a heel root
    b.part(sph(10, 6), ROOTP, { bone: ankle, at: [s * 0.56, 0.15, 0.3], scale: [0.36, 0.16, 0.5] });
    [-0.26, 0, 0.26].forEach((o, i) => {
      const k = i === 1 ? 1.15 : 1;
      const toe = b.chain(
        `toe${i}${S}`,
        catmull([
          [s * (0.56 + o * 0.3), 0.27, 0.3],
          [s * (0.56 + o * 0.9), 0.14, 0.72],
          [s * (0.56 + o * 1.5), 0.07, 1.12],
        ]),
        { parent: ankle, names: [`toe${i}${S}a`, `toe${i}${S}b`], role: "digit" },
      );
      b.sweep(toe, [0.12 * k, 0.085 * k, 0.05], { color: ROOTP });
      b.spike(toe.at(1), toe.at(1), 0.12, 0.045, CLAW);
    });
    const heel = b.chain(
      `heel${S}`,
      catmull([
        [s * 0.56, 0.3, 0.1],
        [s * 0.56, 0.16, -0.25],
        [s * 0.56, 0.07, -0.58],
      ]),
      { parent: ankle, names: [`heel${S}a`, `heel${S}b`] },
    );
    b.sweep(heel, [0.14, 0.1, 0.05], { color: ROOTP });
    // Ground tufts around the foot
    const tufts: Frame[] = [];
    for (let i = 0; i < 10; i++)
      tufts.push(frame([s * 0.56 + (R() - 0.5) * 1.1, 0.03, 0.1 + (R() - 0.5) * 1.6], [0, 1, 0]));
    b.cards(tufts, TUFT, { size: [0.14, 0.18], cross: true, vary: 0.35, spin: 40, rng: rng(seedOf()), bone: ankle });

    // Arm
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 1.1, 3.0, 0.05],
        [s * 1.7, 2.3, 0.2],
        [s * 2.05, 1.6, 0.5],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    const wrist = arm.joints[2];
    const armSw = b.sweep(arm, [0.3, 0.27, 0.22, 0.19], { color: LIMBP });
    for (const a of [-40, 40]) b.sweep(armSw.line(a, 0), [0.05, 0.045, 0.035, 0.03], { bone: arm, color: BARK_MID });
    b.part(sph(8, 6), BARK_LIGHT, { bone: arm.joints[1], at: [s * 1.7, 2.3, 0.2 + 0.0], scale: [0.3, 0.3, 0.3] });
    // Shoulder burl with mushrooms, moss and twigs
    const burl = b.part(sph(10, 8), LIMBP, { bone: arm.joints[0], at: [s * 1.1, 3.12, 0.0], scale: [0.44, 0.38, 0.44] });
    const sh = b
      .surface(burl)
      .scatter(14, { rng: rng(s > 0 ? 41 : 42), minDist: 0.12, filter: (h) => h.n.y > 0.25 });
    sh.slice(0, 3).forEach((h, i) => mushroom(h, 0.1 + 0.05 * i, 0.045 + 0.01 * i, i + (s > 0 ? 1 : 7)));
    sh.slice(3, 6).forEach((h) => twigOn(h, h.axis.clone(), 0.35, 0.04, 0.2, CROWN_TEX));
    if (sh.length > 6)
      b.cards(sh.slice(6), TUFT, { size: [0.16, 0.15], lean: 15, cross: true, vary: 0.3, rng: rng(seedOf()) });
    shelf(b.surface(armSw).nearest(arm.at(0.45).at.clone().add(new THREE.Vector3(s * 0.6, 0.1, 0))), 0.1);
    // Spiral vine with leaves
    const vp: THREE.Vector3[] = [];
    for (let k = 0; k <= 18; k++) {
      const t = 0.08 + (0.8 * k) / 18;
      const cp = arm.at(t);
      const a = k * 0.9;
      const rad = 0.33 - 0.12 * t;
      vp.push(
        cp.at
          .clone()
          .addScaledVector(cp.normal, Math.cos(a) * rad)
          .addScaledVector(cp.binormal, Math.sin(a) * rad),
      );
    }
    const vine = b.sweep(catmull(vp), 0.028, { bone: arm, color: VINE });
    leafOn(vine, 0.05, 0.95, 10, 0.1, 0.15, VINE_TEX);
    hang([armSw.at(0.3, 180), armSw.at(0.45, 180), armSw.at(0.6, 180), armSw.at(0.75, 180)], 0.12, 0.3);
    // Bronze wrist bands with rivets
    const band = b.surface(armSw).loop(arm.at(0.9), { lift: 0.02 });
    b.sweep(band, 0.035, { color: BRONZE });
    b.along(band, 8, (at) => {
      b.part(sph(5, 4), GOLD, { at, scale: 0.035 });
    });
    b.sweep(b.surface(armSw).loop(arm.at(0.8), { lift: 0.015 }), 0.022, { color: BRONZE });
    // Rune on the forearm
    const foreHit = b.surface(armSw).nearest(arm.at(0.65).at.clone().add(new THREE.Vector3(0, 0, 0.5)));
    glow(b.decal(armSw, GLYPH, { at: foreHit, size: [0.2, 0.2] }), 1.2);

    // Hand: palm, four fingers and a thumb with claws
    b.part(sph(10, 8), LIMBP, { bone: wrist, at: [s * 2.12, 1.42, 0.5], scale: [0.34, 0.22, 0.2] });
    const offs = [-0.2, -0.07, 0.07, 0.2];
    const lens = [0.8, 1.0, 0.92, 0.72];
    offs.forEach((o, k) => {
      const L = lens[k];
      const finger = b.chain(
        `finger${k}${S}`,
        catmull([
          [s * 2.12 + s * o, 1.3, 0.5],
          [s * 2.12 + s * o * 1.7, 1.3 - 0.34 * L, 0.58],
          [s * 2.12 + s * o * 2.3, 1.3 - 0.66 * L, 0.74],
        ]),
        { parent: wrist, names: [`finger${k}${S}a`, `finger${k}${S}b`], role: "digit" },
      );
      b.sweep(finger, [0.08, 0.06, 0.036], { color: LIMBP });
      b.spike(finger.at(1), finger.at(1), 0.14, 0.035, CLAW);
      b.part(sph(6, 4), BARK_LIGHT, { bone: wrist, at: [s * 2.12 + s * o * 1.1, 1.28, 0.54], scale: 0.07 });
    });
    const thumb = b.chain(
      `thumb${S}`,
      catmull([
        [s * 1.92, 1.42, 0.62],
        [s * 1.72, 1.17, 0.78],
        [s * 1.64, 0.97, 1.0],
      ]),
      { parent: wrist, names: [`thumb${S}a`, `thumb${S}b`], role: "digit" },
    );
    b.sweep(thumb, [0.085, 0.06, 0.04], { color: LIMBP });
    b.spike(thumb.at(1), thumb.at(1), 0.14, 0.04, CLAW);
  }

  return b.root;
}
