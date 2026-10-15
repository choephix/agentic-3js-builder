import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { svg } from "../../../../src/texture";
import { noise } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, snapColor, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Branch Stand",
  description:
    "A pixel-art koala hugging a eucalyptus trunk stand: big fluffy ears, a huge black nose, grey fur with a cream chest, clasping paws, with gum leaves and bark on a wooden base.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.016;

// palette
const FUR = ["#3b3f48", "#555b66", "#6f7682", "#8b929c", "#a9afb8"].map((c) => snapColor(c, 64));
const CREAM = ["#9a948a", "#bdb7aa", "#dcd6c8", "#efeadc"].map((c) => snapColor(c, 64));
const BARK = ["#3d2c22", "#58412f", "#765941", "#97785a", "#b99a76"].map((c) => snapColor(c, 64));
const LEAF = ["#1c3a2a", "#2a5a3a", "#3f7e4a", "#6aa65a", "#a1cf7a"].map((c) => snapColor(c, 64));
const WOOD = ["#4a3020", "#6a4630", "#8a6040", "#a67c52"].map((c) => snapColor(c, 64));
const NOSE = "#14121a";
const CLAW = "#e8e0cc";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const R = rng(7);

  // ---------- paints ----------
  const furPaint = cellPaint(
    TEXEL,
    (c) => {
      const v = 0.45 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.08, 3) - 0.5) + 0.12 * (c.random(1) - 0.5);
      return c.pick(FUR, v);
    },
    { dither: true },
  );
  const creamPaint = cellPaint(
    TEXEL,
    (c) => c.pick(CREAM, 0.55 + 0.3 * c.n.y + 0.6 * (noise(c.at, 0.06, 5) - 0.5) + 0.2 * (c.random(2) - 0.5)),
    { dither: true },
  );
  const barkPaint = cellPaint(
    TEXEL,
    (c) => {
      const streak = noise(new THREE.Vector3(c.at.x * 6, c.at.y * 0.8, c.at.z * 6), 0.12, 4);
      const v = 0.25 + 0.55 * streak + 0.2 * (c.random(3) - 0.5) + 0.12 * c.n.y;
      if (c.random(9) < 0.04) return BARK[0];
      return c.pick(BARK, v);
    },
    { dither: true },
  );
  const darkFur = cellPaint(TEXEL, (c) => c.pick(FUR, 0.1 + 0.25 * c.n.y + 0.25 * c.random(6)), { dither: true });

  // ---------- pixel textures ----------
  const PLANK = pixelTexture(32, 24, (g) => {
    g.fill((x, y) => (y % 8 === 0 ? WOOD[0] : pick(WOOD, 0.45 + 0.3 * Math.sin(x * 0.4 + y) + 0.25 * R(), bayer(x, y))));
    g.stamp(4, 3, ["n"], { n: WOOD[0] });
    g.stamp(26, 14, ["n"], { n: WOOD[0] });
  });
  const LEAFTEX = pixelArt(
    [
      "......ddd.......",
      ".....dllld......",
      "....dllmlld.....",
      "...dllmmllld....",
      "..dlllmmlllld...",
      "..dllmllmllld...",
      ".dlllmllmlllld..",
      ".dllmlllmllld...",
      ".dllmllmllld....",
      "..dlmlllmld.....",
      "..dlmllmld......",
      "...dmllld.......",
      "....dmld........",
      ".....md.........",
      ".....m..........",
      ".....m..........",
    ],
    { d: LEAF[0], l: LEAF[2], m: LEAF[4] },
  );
  const LEAFTEX2 = pixelArt(
    [
      "..........dd....",
      ".........dlld...",
      "........dlmld...",
      ".......dllmld...",
      "......dllmlld...",
      ".....dllmlld....",
      "....dllmlld.....",
      "...dllmlld......",
      "..dllmlld.......",
      "..dlmlld........",
      ".dlmlld.........",
      ".dmlld..........",
      ".dmld...........",
      ".md.............",
      "m...............",
      "m...............",
    ],
    { d: LEAF[1], l: LEAF[3], m: LEAF[4] },
  );
  const FURTUFT = pixelArt(["..a.a.", ".abaab", ".abbab", "abbbab", "abbbbb", "bbbbbb"], { a: FUR[3], b: FUR[2] });
  const CREAMTUFT = pixelArt(["..a.a.", ".abaab", ".abbab", "abbbab", "abbbbb", "bbbbbb"], { a: CREAM[3], b: CREAM[2] });
  const EARTUFT = pixelArt(
    ["...w...", "..www..", ".wwcww.", ".wwcww.", "wwwcwww", "wwcccww", "wwwwwww"],
    { w: CREAM[3], c: CREAM[1] },
  );
  const EYE = pixelArt(["kkkk", "kwgk", "kggk", "kkkk"], { k: "#0b0a10", w: "#ffffff", g: "#3b2a1c" });
  const BLOSSOM = pixelArt([".r.r.", "rryrr", ".yyy.", "rryrr", ".r.r."], { r: "#e8586a", y: "#f6d46a" });
  const NUT = svg(
    `<svg viewBox="0 0 8 8"><rect x="2" y="0" width="4" height="1" fill="#6aa65a"/><rect x="1" y="1" width="6" height="5" fill="#4f8a3e"/><rect x="2" y="6" width="4" height="1" fill="#2a5a3a"/><rect x="2" y="2" width="2" height="1" fill="#a1cf7a"/></svg>`,
    { size: 16, pixelated: true },
  );

  // ---------- skin sheet for head/body boxes ----------
  const layout = skinLayout({ head: [14, 11, 11], snout: [5, 6, 3], ear: [5, 5, 2], torso: [14, 18, 11], belly: [10, 13, 3] }, 96);
  const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    const fur = (rect: readonly [number, number, number, number], ramp: string[], base: number) =>
      g.fill((x, y, _w, h) => pick(ramp, base - (y / h) * 0.2 + 0.25 * (R() - 0.5), bayer(x, y)), rect);
    for (const rect of Object.values(layout.faces.head)) fur(rect, FUR, 0.62);
    for (const rect of Object.values(layout.faces.snout)) fur(rect, FUR, 0.55);
    for (const rect of Object.values(layout.faces.ear)) fur(rect, FUR, 0.55);
    for (const rect of Object.values(layout.faces.torso)) fur(rect, FUR, 0.55);
    for (const rect of Object.values(layout.faces.belly)) fur(rect, CREAM, 0.7);
    // head front: eye shadow patches, cream cheek tufts
    const hf = layout.faces.head.pz;
    for (const ox of [1, 9]) g.stamp(hf[0] + ox, hf[1] + 3, ["kk.", "kkk"], { k: FUR[0] });
    g.fill((x, y) => (x < 2 || x > 11 ? pick(CREAM, 0.55 + 0.3 * R(), bayer(x, y)) : undefined), [hf[0], hf[1] + 6, hf[2], 5]);
    g.fill((x, y) => (x < 3 || x > 10 ? pick(CREAM, 0.7, bayer(x, y)) : undefined), [hf[0], hf[1] + 8, hf[2], 3]);
    // ear front: cream inner
    const ef = layout.faces.ear.pz;
    g.fill((x, y) => (x > 0 && x < 4 && y > 0 && y < 4 ? pick(CREAM, 0.9 - y * 0.1, bayer(x, y)) : undefined), ef);
    // snout front
    const sf = layout.faces.snout.pz;
    g.fill((x, y) => (y > 3 ? pick(CREAM, 0.6, bayer(x, y)) : undefined), sf);
    // torso front: cream chest
    const tf = layout.faces.torso.pz;
    g.fill(
      (x, y, w, h) => (x > 2 && x < w - 3 && y > 1 ? pick(CREAM, 0.75 - (y / h) * 0.2 + 0.2 * (R() - 0.5), bayer(x, y)) : undefined),
      tf,
    );
    const tb = layout.faces.torso.nz;
    g.fill(() => (R() < 0.08 ? FUR[1] : undefined), tb);
  });

  // ---------- STAND: wooden base ----------
  const baseTop = 0.09;
  b.part(tileBox([0.74, baseTop, 0.62], PLANK, TEXEL, { rand: R, step: [1, 8] }), "#ffffff", { at: [0, baseTop / 2, 0], texture: PLANK });
  b.part(tileBox([0.78, 0.03, 0.66], PLANK, TEXEL), "#ffffff", { at: [0, 0.015, 0], texture: PLANK });
  // corner studs
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), WOOD[0], { at: [sx * 0.34, baseTop + 0.01, sz * 0.27] });
      b.part(new THREE.BoxGeometry(0.02, 0.012, 0.02), "#c8b078", { at: [sx * 0.34, baseTop + 0.036, sz * 0.27] });
    }
  // moss tufts on base
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 0.66,
      z = (R() - 0.5) * 0.54;
    if (Math.abs(x) < 0.12 && Math.abs(z) < 0.12) continue;
    b.part(new THREE.BoxGeometry(0.03 + R() * 0.03, 0.02 + R() * 0.02, 0.03 + R() * 0.03), LEAF[1 + (i % 3)], {
      at: [x, baseTop + 0.01, z],
    });
  }

  // ---------- eucalyptus trunk ----------
  const trunkR = 0.075;
  const trunkTop = 1.12;
  const trunkPath = catmull(
    [
      [0, baseTop - 0.02, -0.02],
      [0.005, 0.4, -0.015],
      [-0.01, 0.8, -0.025],
      [0.0, trunkTop, -0.03],
    ],
    { tension: 0.5 },
  );
  const trunk = b.sweep(trunkPath, [trunkR + 0.01, trunkR - 0.012], { color: barkPaint, section: { ngon: 8 }, caps: "flat" });
  // root flare
  b.sweep(
    polyline([
      [0, baseTop - 0.02, -0.02],
      [0, baseTop + 0.07, -0.02],
    ]),
    [0.13, trunkR + 0.012],
    { color: barkPaint, section: { ngon: 8 }, caps: "flat" },
  );
  // bark peel strips (eucalyptus shedding) in lighter tones
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + R() * 0.8;
    const ang = (R() * 360) | 0;
    const hit = trunk.at(t, ang);
    b.stick(new THREE.BoxGeometry(0.03 + R() * 0.025, 0.13 + R() * 0.12, 0.012), BARK[3 + (i % 2)], hit.moved([0, 0.002, 0]));
  }
  // knots / scars
  for (let i = 0; i < 6; i++) {
    const hit = trunk.at(0.1 + R() * 0.85, 40 + R() * 280);
    b.stick(new THREE.BoxGeometry(0.03, 0.03, 0.012), BARK[0], hit);
  }
  // top stub
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.1), BARK[1], { at: [0, trunkTop + 0.015, -0.03] });

  // ---------- side branches with leaves ----------
  const branches: Array<[number[], number[]]> = [
    [[0.0, 0.95, -0.05], [-0.28, 1.12, -0.12]],
    [[0.0, 0.75, -0.05], [0.3, 0.98, -0.1]],
    [[0.0, 1.08, -0.04], [0.14, 1.28, -0.12]],
    [[0.0, 0.48, -0.06], [-0.25, 0.62, -0.18]],
  ];
  const leafFrames: Array<ReturnType<typeof frame>> = [];
  for (const [a, tip] of branches) {
    const p = catmull([a, [(a[0] + tip[0]) / 2, (a[1] + tip[1]) / 2 + 0.03, (a[2] + tip[2]) / 2], tip], {});
    b.sweep(p, [0.022, 0.009], { color: barkPaint, section: { ngon: 6 }, caps: "point" });
    for (let i = 0; i < 9; i++) {
      const t = 0.25 + i * 0.09;
      const q = p.at(t);
      for (const s of [1, -1]) leafFrames.push(frame([q.x, q.y, q.z], [s * 0.8, 0.5, (R() - 0.3) * 0.8]));
    }
    const q = p.at(1);
    leafFrames.push(frame([q.x, q.y, q.z], [tip[0] - a[0], 0.4, tip[2] - a[2]]));
  }
  b.cards(leafFrames, [LEAFTEX, LEAFTEX2, LEAFTEX], {
    size: [0.11, 0.15],
    lean: 55,
    bend: 20,
    vary: 0.3,
    spin: 25,
    rng: rng(11),
    flow: [0, -0.5, 0.2],
    cross: false,
  });
  // a couple of blossoms
  for (const [x, y, z] of [
    [-0.22, 1.12, -0.1],
    [0.27, 1.0, -0.08],
    [0.12, 1.27, -0.1],
  ])
    b.part(new THREE.PlaneGeometry(0.04, 0.04), "#ffffff", { at: [x, y, z + 0.04], texture: BLOSSOM, dir: [0, 0, 1], axis: "z" });
  // gumnuts on branch tips
  for (const [x, y, z] of [
    [-0.27, 1.1, -0.12],
    [0.29, 0.97, -0.1],
    [-0.24, 0.6, -0.18],
  ])
    b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), "#ffffff", { at: [x, y - 0.03, z], texture: NUT });

  // ---------- KOALA ----------
  const cy = 0.58; // pelvis height
  const bz = 0.1; // body centre z (in front of trunk)
  const TORSO = layout.faces.torso;
  // Torso: plump, leaning against trunk
  b.part(skinBox(SHEET, TORSO, TEXEL * 1.45), "#ffffff", { texture: SHEET, at: [0, cy + 0.15, bz + 0.03], rotation: [-6, 0, 0] });
  // fluffy rump
  b.part(new THREE.BoxGeometry(0.2, 0.15, 0.17), furPaint, { at: [0, cy - 0.03, bz] });
  b.part(new THREE.BoxGeometry(0.17, 0.08, 0.1), creamPaint, { at: [0, cy - 0.08, bz + 0.05] });
  // seat tufts
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.07, 0.07, 0.12), furPaint, { at: [s * 0.1, cy - 0.06, bz - 0.01] });
  // belly bulge
  b.part(skinBox(SHEET, layout.faces.belly, TEXEL * 1.8), "#ffffff", { texture: SHEET, at: [0, cy + 0.07, bz + 0.12] });
  // shoulders
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.09, 0.11), furPaint, { at: [s * 0.14, cy + 0.27, bz + 0.03] });

  // Head
  const hy = cy + 0.42;
  const hz = bz + 0.07;
  b.part(skinBox(SHEET, layout.faces.head, TEXEL * 1.95), "#ffffff", { texture: SHEET, at: [0, hy, hz] });
  // fluffy cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.07, 0.08), creamPaint, { at: [s * 0.14, hy - 0.04, hz + 0.01] });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.05), creamPaint, { at: [s * 0.17, hy - 0.05, hz - 0.01] });
  }
  // brow ridge / forehead tuft
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.06), furPaint, { at: [0, hy + 0.115, hz + 0.05] });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.05), FUR[3], { at: [0, hy + 0.15, hz] });
  // snout / muzzle
  b.part(new THREE.BoxGeometry(0.1, 0.075, 0.06), creamPaint, { at: [0, hy - 0.04, hz + 0.145] });
  // big nose
  b.part(new THREE.BoxGeometry(0.095, 0.075, 0.05), NOSE, { at: [0, hy, hz + 0.19] });
  b.part(new THREE.BoxGeometry(0.075, 0.015, 0.012), "#3a3646", { at: [0, hy + 0.025, hz + 0.218] });
  b.part(new THREE.BoxGeometry(0.02, 0.025, 0.012), "#3a3646", { at: [-0.025, hy, hz + 0.218] });
  b.part(new THREE.BoxGeometry(0.02, 0.025, 0.012), "#3a3646", { at: [0.025, hy, hz + 0.218] });
  // mouth
  b.part(new THREE.BoxGeometry(0.05, 0.008, 0.01), "#2a2028", { at: [0, hy - 0.058, hz + 0.178] });
  b.part(new THREE.BoxGeometry(0.014, 0.025, 0.01), "#2a2028", { at: [0, hy - 0.045, hz + 0.178] });
  // eyes: tiny black pixel eyes with highlight
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ffffff", { at: [s * 0.065, hy + 0.045, hz + 0.1085], texture: EYE, dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.BoxGeometry(0.045, 0.012, 0.01), FUR[0], { at: [s * 0.065, hy + 0.075, hz + 0.108] });
  }

  // Ears: big round fluffy, with cream fringe
  for (const s of [1, -1]) {
    const ex = s * 0.155;
    const ey = hy + 0.1;
    const ez = hz - 0.01;
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.045), furPaint, { at: [ex, ey, ez], rotation: [0, s * 18, s * -12] });
    b.part(new THREE.BoxGeometry(0.13, 0.12, 0.035), darkFur, { at: [ex + s * 0.005, ey, ez - 0.012], rotation: [0, s * 18, s * -12] });
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      at: [ex - s * 0.004, ey - 0.005, ez + 0.027],
      rotation: [0, s * 18, s * -12],
      texture: EARTUFT,
    });
    // fringe tufts
    b.part(new THREE.BoxGeometry(0.035, 0.03, 0.03), CREAM[3], { at: [ex + s * 0.045, ey + 0.045, ez + 0.01] });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), CREAM[2], { at: [ex + s * 0.058, ey - 0.005, ez + 0.01] });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), CREAM[2], { at: [ex + s * 0.04, ey - 0.05, ez + 0.01] });
  }

  // ---------- arms hugging the trunk ----------
  for (const s of [1, -1]) {
    const sh = [s * 0.17, cy + 0.27, bz + 0.03];
    const el = [s * 0.2, cy + 0.2, bz + 0.1];
    const wr = [s * 0.1, cy + 0.34, bz];
    b.sweep(catmull([sh, el, wr], {}), [0.055, 0.04], { color: furPaint, section: { ngon: 6 }, caps: "round" });
    // forearm tuft
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.06), furPaint, { at: [s * 0.185, cy + 0.2, bz + 0.1] });
    // paw wrapping trunk: palm block + fingers
    const px = s * 0.075;
    const py = cy + 0.36;
    const pz = 0.02;
    b.part(new THREE.BoxGeometry(0.07, 0.06, 0.08), darkFur, { at: [px, py, pz + 0.01] });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.075, 0.018, 0.022), darkFur, { at: [s * 0.08, py - 0.02 + i * 0.02, pz - 0.035] });
      b.part(new THREE.BoxGeometry(0.02, 0.016, 0.014), CLAW, { at: [s * 0.1, py - 0.02 + i * 0.02, pz - 0.055] });
    }
    // fingertips visible at front
    for (let i = 0; i < 3; i++) b.part(new THREE.BoxGeometry(0.018, 0.02, 0.014), CLAW, { at: [px + (i - 1) * 0.02 * s, py + 0.035, pz + 0.045] });
  }

  // ---------- legs: thighs bent, feet gripping trunk ----------
  for (const s of [1, -1]) {
    const hip = [s * 0.12, cy - 0.03, bz - 0.01];
    const knee = [s * 0.2, cy - 0.04, bz + 0.12];
    const ankle = [s * 0.11, cy - 0.17, 0.03];
    b.sweep(catmull([hip, knee, ankle], {}), [0.075, 0.045], { color: furPaint, section: { ngon: 6 }, caps: "round" });
    // thigh fluff
    b.part(new THREE.BoxGeometry(0.09, 0.08, 0.1), furPaint, { at: [s * 0.18, cy - 0.04, bz + 0.07] });
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.05), CREAM[1], { at: [s * 0.2, cy - 0.06, bz + 0.15] });
    // foot: sole against trunk
    b.part(new THREE.BoxGeometry(0.08, 0.06, 0.09), darkFur, { at: [s * 0.085, cy - 0.185, 0.035] });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.07), darkFur, { at: [s * 0.13, cy - 0.185, 0] });
    // toes + claws around trunk
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.02, 0.025, 0.05), darkFur, { at: [s * (0.09 + i * 0.012), cy - 0.225, 0.07], rotation: [20, 0, 0] });
      b.part(new THREE.BoxGeometry(0.016, 0.014, 0.014), CLAW, { at: [s * (0.09 + i * 0.012), cy - 0.255, 0.085] });
    }
  }

  // ---------- fur cards for fluffy silhouette ----------
  const rr = rng(21);
  const frames: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 70; i++) {
    const ang = (rr() - 0.5) * Math.PI * 1.7; // front half
    const y = cy + 0.03 + rr() * 0.3;
    const rx = 0.095,
      rz = 0.075;
    frames.push(frame([Math.sin(ang) * rx, y, bz + 0.03 + Math.cos(ang) * rz], [Math.sin(ang), 0.1, Math.cos(ang)]));
  }
  b.cards(frames, FURTUFT, { size: [0.04, 0.05], lean: 70, flow: [0, -1, 0], rng: rng(5), vary: 0.3, cross: true });
  const cframes: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 24; i++) {
    const x = (rr() - 0.5) * 0.12;
    const y = cy + 0.08 + rr() * 0.22;
    cframes.push(frame([x, y, bz + 0.1], [0, 0.2, 1]));
  }
  b.cards(cframes, CREAMTUFT, { size: [0.035, 0.04], lean: 70, flow: [0, -1, 0], rng: rng(6), vary: 0.3, cross: true });
  // head fur fluff around crown
  const hframes: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 26; i++) {
    const ang = rr() * Math.PI * 2;
    const y = hy - 0.05 + rr() * 0.17;
    hframes.push(frame([Math.sin(ang) * 0.13, y, hz + Math.cos(ang) * 0.11], [Math.sin(ang), 0.15, Math.cos(ang)]));
  }
  b.cards(hframes, FURTUFT, { size: [0.035, 0.045], lean: 65, flow: [0, -1, 0], rng: rng(8), vary: 0.3, cross: true });

  // ---------- tiny details: fallen leaves and a stepped bark chip on the base ----------
  b.part(new THREE.BoxGeometry(0.1, 0.008, 0.06), "#ffffff", { at: [0.2, baseTop + 0.005, 0.18], rotation: [0, 30, 0], texture: LEAFTEX });
  b.part(new THREE.BoxGeometry(0.07, 0.008, 0.05), "#ffffff", { at: [-0.22, baseTop + 0.005, 0.16], rotation: [0, -40, 0], texture: LEAFTEX2 });
  const CHIP = stepped(
    [
      [0, 2],
      [0, 3],
      [1, 3],
      [1, 2],
    ],
    TEXEL,
  );
  b.extrude(CHIP, { at: [-0.12, baseTop + 0.002, 0.22], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.012, color: barkPaint });

  return b.root;
}
