// Elven ranger archer: slender anime elf in an emerald tunic, teal half-cloak, brown leather and gold filigree,
// bow in the left fist and a quiver of fletched arrows on the back. High-fantasy anime: cel shading (kits/toon),
// big shiny eyes, long pointed ears, silver hair with a braid, ornate gold trim, a few glowing gems (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { gradient, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel } from "../../../../kits/toon";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A slender anime elf ranger in an emerald tunic, teal half-cloak, brown leather and gold filigree, holding an ornate longbow with a quiver of fletched arrows on her back.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette (every surface is a cel paint)
const GOLD_LIT = "#ffd45c";
const GOLD = cel(GOLD_LIT, "#d58a2e");
const SKIN = cel("#ffe3d2", "#f2aeb0");
const HAIR_BASE = gradient("#f8f6ff", "#cfd8ff", [0, 1.8, 0], [0, 0.85, 0]);
const HAIR = cel(HAIR_BASE, "#a6a2e0");
const TUNIC = cel("#25a46c", "#18686a");
const TUNIC_DK = cel("#1b7a56", "#134a55");
const CREAM = cel("#fff1d4", "#e7bfae");
const LEATHER = cel("#a9683a", "#6d3b36");
const LEATHER_DK = cel("#6e402c", "#43253a");
const PANTS = cel("#56644a", "#35444f");
const CAPE_OUT = cel("#1f8e92", "#165a7c");
const CAPE_IN = cel("#f4e6bf", "#d9b6a6");
const SOLE = cel("#4a2a2a", "#2c1a2c");

// ---------------------------------------------------------------- drawings
const VINE = svg(
  `<svg viewBox="0 0 60 120">
   <g fill="none" stroke="${GOLD_LIT}" stroke-width="2.6" stroke-linecap="round">
    <path d="M30 116 C30 96 22 84 30 68 C38 52 30 36 30 10"/>
    <path d="M30 88 C44 86 52 74 46 64 C42 58 34 62 38 68"/>
    <path d="M30 88 C16 86 8 74 14 64 C18 58 26 62 22 68"/>
    <path d="M30 54 C42 52 48 42 42 34"/>
    <path d="M30 54 C18 52 12 42 18 34"/>
   </g>
   <g fill="${GOLD_LIT}">
    <path d="M30 104 C18 102 10 92 12 84 C22 86 30 94 30 104Z"/>
    <path d="M30 104 C42 102 50 92 48 84 C38 86 30 94 30 104Z"/>
    <path d="M30 74 C24 70 20 62 22 56 C28 58 31 66 30 74Z"/>
    <path d="M30 74 C36 70 40 62 38 56 C32 58 29 66 30 74Z"/>
    <path d="M30 26 C20 24 18 12 30 2 C42 12 40 24 30 26Z"/>
    <circle cx="42" cy="32" r="3.2"/><circle cx="18" cy="32" r="3.2"/>
   </g>
  </svg>`,
  { size: 256 },
);
const FEATHER_A = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 63 C1 50 1 24 12 1 C23 24 23 50 12 63Z" fill="#27c9b4"/>
   <path d="M12 63 C8 48 7 26 12 1 C14 26 15 48 12 63Z" fill="#effffb"/>
   <path d="M12 62 L12 5" stroke="#1d6e6a" stroke-width="2.4"/></svg>`,
  { size: 128 },
);
const FEATHER_B = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 63 C1 50 1 24 12 1 C23 24 23 50 12 63Z" fill="#fff4dc"/>
   <path d="M12 63 C8 48 7 26 12 1 C14 26 15 48 12 63Z" fill="#ffd45c"/>
   <path d="M12 62 L12 5" stroke="#a9683a" stroke-width="2.4"/></svg>`,
  { size: 128 },
);
const MOUTH = svg(
  `<svg viewBox="0 0 60 24"><path d="M6 7 Q30 20 54 7" stroke="#b34a5c" stroke-width="4.5" fill="none" stroke-linecap="round"/>
   <path d="M22 16 Q30 20 38 16" stroke="#ff9eaa" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 192 },
);
const EYE = animeEye({ iris: "#ffb12e", irisLight: "#fff08a", blush: "#ff8fa8" });

type Vec = THREE.Vector3;

export default function build() {
  const b = createBuilder({ name: "elvenArcher" });
  const rand = rng(21);

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.97, 0] });
  const spine = b.chain("spine", catmull([[0, 0.99, 0], [0, 1.13, 0], [0, 1.3, 0.01], [0, 1.47, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 1.47, 0], [0, 1.56, 0.012], [0, 1.64, 0.03]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.64, 0.03], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.665, -0.015], aim: [0, 1.61, 0.07], role: "jaw" });

  // ================================================================ torso, neck, head
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.0, 0], w: 0.295, h: 0.195 },
      { at: [0, 1.13, 0], w: 0.235, h: 0.165 },
      { at: [0, 1.28, 0.005], w: 0.27, h: 0.185 },
      { at: [0, 1.42, 0.01], w: 0.31, h: 0.205 },
      { at: [0, 1.51, -0.005], w: 0.33, h: 0.17 },
      { at: [0, 1.55, -0.01], w: 0.2, h: 0.13 },
    ],
    {
      bone: [hips, spine],
      sides: 12,
      color: paint((p, n) => {
        const vx = Math.abs(p.x) - (p.y - 1.36) * 0.62;
        if (n.z > 0.1 && p.y > 1.36 && vx < 0) return Math.abs(vx) < 0.007 ? GOLD : CREAM;
        if (n.z > 0.1 && p.y > 1.36 && vx < 0.014) return GOLD;
        if (p.y < 1.06 && p.y > 0.965) return LEATHER_DK;
        if (Math.abs(p.x) > 0.1 && p.y < 1.3 && p.y > 1.06) return TUNIC_DK;
        return TUNIC;
      }),
    },
  );
  const skin = b.surface(torso);

  b.sweep(neck, [0.044, 0.037], { color: SKIN, sides: 8 });

  // head (upper skull) and lower jaw are two lofts; a hair cap, locks and a circlet sit on top
  const skull = b.loft(
    [
      { at: [0, 1.84, -0.005], w: 0.11, h: 0.12 },
      { at: [0, 1.82, -0.005], w: 0.16, h: 0.18 },
      { at: [0, 1.78, 0], w: 0.19, h: 0.205 },
      { at: [0, 1.72, 0.005], w: 0.195, h: 0.205 },
      { at: [0, 1.67, 0.015], w: 0.175, h: 0.185 },
      { at: [0, 1.632, 0.03], w: 0.13, h: 0.15 },
    ],
    { bone: head, sides: 14, caps: { start: "flat", end: "round" }, color: SKIN },
  );
  const jawLoft = b.loft(
    [
      { at: [0, 1.632, 0.03], w: 0.13, h: 0.15 },
      { at: [0, 1.612, 0.042], w: 0.09, h: 0.11 },
      { at: [0, 1.598, 0.052], w: 0.035, h: 0.05 },
    ],
    { bone: jaw, sides: 14, color: SKIN },
  );
  const face = b.surface([skull, jawLoft]);
  const faceCenter = v3(0, 1.7, 0.005);
  for (const s of [1, -1]) {
    const hit = face.around(faceCenter).at(s * 27, -5);
    if (hit) b.decal(face, EYE, { at: hit, dir: [s * 0.35, 0, 1], size: [0.056, 0.077], mirror: s > 0, lift: 0.002 });
  }
  b.decal(face, MOUTH, { at: [0, 1.628, 0.1], dir: [0, 0, 1], size: [0.046, 0.0185], lift: 0.0015 });
  b.part(new THREE.ConeGeometry(0.0085, 0.024, 5), SKIN, { bone: head, at: [0, 1.655, 0.104], dir: [0, -0.15, 1] });

  // ears (long, pointed, swept back) with inner colour and earrings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = v3(s * 0.093, 1.698, -0.002);
    const tip = v3(s * 0.212, 1.776, -0.066);
    b.joint(`ear${side}`, { parent: head, at: root, aim: tip, role: "hinge" });
    const E = tip.clone().sub(root).normalize();
    const N = v3(s, 0, 0.35).normalize();
    const Y = N.clone().cross(E).normalize();
    const outline: OutlinePoint[] = [[0, -0.012], [0.02, 0.03], [0.06, 0.034], [0.11, 0.016], [0.152, 0, "sharp"], [0.1, -0.02], [0.05, -0.034], [0.012, -0.032]];
    b.extrude(outline, { at: root, x: E, y: Y, thickness: 0.007, bevel: 0.002, smoothing: 1, color: SKIN, bone: head });
    const inner: OutlinePoint[] = [[0.012, -0.004], [0.03, 0.02], [0.065, 0.021], [0.1, 0.009], [0.125, 0, "sharp"], [0.09, -0.012], [0.05, -0.022], [0.022, -0.02]];
    b.extrude(inner, { at: root.clone().addScaledVector(N, 0.0045), x: E, y: Y, thickness: 0.003, color: cel("#ffb3b6", "#e88aa4"), bone: head });
    const lobe = root.clone().addScaledVector(E, 0.016).addScaledVector(Y, -0.034);
    b.part(new THREE.TorusGeometry(0.011, 0.0028, 5, 10), GOLD, { bone: head, at: lobe, dir: N, axis: "z" });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), GOLD, { bone: head, at: root.clone().addScaledVector(E, 0.07).addScaledVector(N, 0.004).addScaledVector(Y, 0.012) });
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, { bone: head, at: root.clone().addScaledVector(E, 0.095).addScaledVector(N, 0.004).addScaledVector(Y, 0.003) });
  }

  // hair: cap over the crown, side/back mass, fringe locks, framing locks, braid
  const hairPaint = paint((p, n) => {
    if (n.y > 0.38 && n.y < 0.62 && p.y > 1.8 && n.z > -0.3) return "#ffffff";
    return HAIR;
  });
  b.part(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, 1.5), hairPaint, { bone: head, at: [0, 1.762, -0.006], scale: [0.108, 0.104, 0.114] });
  b.part(
    new THREE.SphereGeometry(1, 16, 8, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 1.2, 1.15),
    HAIR,
    { bone: head, at: [0, 1.762, -0.008], scale: [0.109, 0.108, 0.116] },
  );
  // fringe locks over the forehead
  const fringe: Array<[number, number, number, number]> = [
    [0.0, 0.008, 1.718, 0.05],
    [0.03, 0.05, 1.742, 0.044],
    [-0.03, -0.044, 1.738, 0.046],
    [0.06, 0.09, 1.7, 0.04],
    [-0.06, -0.084, 1.7, 0.042],
    [0.085, 0.108, 1.675, 0.032],
    [-0.085, -0.104, 1.675, 0.032],
  ];
  for (const [x0, x1, yTip, w] of fringe) {
    const z0 = 0.095 * Math.sqrt(Math.max(0.2, 1 - (x0 / 0.105) ** 2));
    b.sweep(
      catmull([[x0 * 0.9, 1.832, z0 * 0.7], [x0 * 1.1, 1.8, z0 + 0.012], [(x0 + x1) / 2, 1.76, z0 + 0.016], [x1, yTip, z0 * 0.92 + 0.012]]),
      (t) => [w * 0.5 * (1 - 0.75 * t) + 0.003, 0.0045],
      { bone: head, color: HAIR, caps: { start: "flat", end: "point" }, sides: 5, up: [0, 0, 1] },
    );
  }
  // long side locks framing the face
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.1, 1.77, 0.05], [s * 0.112, 1.7, 0.04], [s * 0.1, 1.6, 0.05], [s * 0.095, 1.5, 0.075], [s * 0.1, 1.4, 0.09]]),
      (t) => [0.021 * (1 - 0.7 * t) + 0.002, 0.009],
      { bone: head, color: HAIR, caps: { start: "flat", end: "point" }, sides: 6 },
    );
    b.sweep(
      catmull([[s * 0.095, 1.74, -0.02], [s * 0.118, 1.66, -0.035], [s * 0.125, 1.56, -0.06], [s * 0.13, 1.47, -0.065], [s * 0.138, 1.36, -0.05]]),
      (t) => [0.026 * (1 - 0.7 * t) + 0.002, 0.012],
      { bone: head, color: HAIR, caps: { start: "flat", end: "point" }, sides: 6 },
    );
  }
  // back hair locks fanning down behind the neck
  for (const [x, len, w] of [[0.07, 1.34, 0.032], [-0.075, 1.3, 0.03], [0.03, 1.28, 0.034], [-0.035, 1.38, 0.032]] as const) {
    b.sweep(
      catmull([[x * 0.8, 1.74, -0.1], [x * 1.1, 1.62, -0.125], [x * 1.3, (1.62 + len) / 2, -0.14], [x * 1.5, len, -0.135]]),
      (t) => [w * (1 - 0.8 * t) + 0.002, 0.011],
      { bone: head, color: HAIR, caps: { start: "flat", end: "point" }, sides: 6 },
    );
  }
  // braid: a chain of joints running down the back
  const braidPts = catmull([[-0.012, 1.8, -0.1], [-0.02, 1.7, -0.175], [-0.02, 1.54, -0.2], [-0.02, 1.36, -0.185], [-0.02, 1.18, -0.17], [-0.02, 1.0, -0.16], [-0.02, 0.86, -0.15]]);
  const braid = b.chain("braid", braidPts, { parent: head, count: 6, role: "tail" });
  b.sweep(braid, (t) => 0.032 * (1 - 0.55 * t) + 0.004, {
    sides: 8,
    color: paint((p) => (Math.floor(p.y * 28) % 2 === 0 ? HAIR : cel("#dfe4ff", "#8f8fd2"))),
    caps: { start: "round", end: "round" },
  });
  b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), GOLD, { bone: head, at: [-0.015, 1.77, -0.12], dir: [0, -0.5, -1], axis: "z" });
  b.part(new THREE.SphereGeometry(0.017, 6, 5), GOLD, { bone: braid.joints[5], at: [-0.02, 0.855, -0.15], scale: [1, 1.4, 1] });
  b.cards([frame([-0.02, 0.86, -0.15], [0, 1, 0])], FEATHER_B, { size: [0.04, 0.09], lean: 180, flow: [0, 0, 1], bone: braid.joints[5] });

  // circlet over the hairline with a glowing leaf gem
  const hairSurf = b.surface(b.root);
  const circletPath = hairSurf.loop(v3(0, 1.795, 0), { dir: [0, 1, 0], lift: 0.004 });
  b.sweep(circletPath, { radius: 0.0035, color: GOLD, sides: 6, bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.0125, 0), "#52f2b0", { bone: head, at: [0, 1.797, 0.113], scale: [0.8, 1.5, 0.7] }), 1.5);
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone: head, at: [0.03, 1.795, 0.1] });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone: head, at: [-0.03, 1.795, 0.1] });

  // ================================================================ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = v3(s * 0.095, 0.95, 0);
    const ankleP = v3(s * 0.125, 0.115, 0.012);
    const pts = limb(hipP, ankleP, [0.45, 0.43], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.13, 0, 0.1],
    });
    const ankle = leg.tip as Joint;
    const radius = (t: number) => {
      const k = [0.088, 0.078, 0.066, 0.053, 0.056, 0.047, 0.041];
      const f = Math.min(t, 0.9999) * (k.length - 1);
      const i = Math.floor(f);
      return k[i] + (k[i + 1] - k[i]) * (f - i);
    };
    const lace = paint((p, n) => {
      const flowFront = n.z > 0.5 && Math.abs(p.x - s * 0.128) < 0.012 && p.y > 0.12 && p.y < 0.4;
      if (flowFront && (p.y * 46) % 1 < 0.45) return GOLD;
      return LEATHER;
    });
    b.sweep(leg, radius, {
      sides: 8,
      bands: [
        [0.5, PANTS],
        [0.545, LEATHER_DK],
        [1, lace],
      ],
    });
    b.sweep(leg, (t) => radius(t) + 0.008, { from: 0.525, to: 0.6, sides: 8, color: cel("#8a5434", "#573039") });
    b.sweep(leg, (t) => radius(t) + 0.011, { from: 0.575, to: 0.595, sides: 8, color: GOLD });
    b.sweep(leg, (t) => radius(t) + 0.006, { from: 0.9, to: 0.935, sides: 8, color: LEATHER_DK });
    // foot: boot with pointed toe
    const ball = v3(s * 0.135, 0.045, 0.115);
    const toe = v3(s * 0.14, 0.035, 0.19);
    const foot = b.chain(`foot${side}`, polyline([ball, toe]), { parent: ankle, names: [`ball${side}`] });
    b.sweep(polyline([[s * 0.126, 0.056, 0.0], [s * 0.134, 0.046, 0.1], [s * 0.14, 0.034, 0.188]]), (t) => [0.043 + 0.008 * Math.sin(t * 3) - 0.015 * t * t, 0.057 - 0.023 * t], {
      bone: [ankle, foot],
      sides: 8,
      color: LEATHER,
      sectors: [[120, 240, SOLE]],
      caps: { start: "round", end: "round" },
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: ankle, at: [s * 0.14, 0.05, 0.172] });
    // knee leaf guard
    const kn = pts[1];
    b.part(new THREE.SphereGeometry(0.038, 7, 5), cel("#8a5434", "#573039"), { bone: leg.joints[1], at: [kn.x, kn.y - 0.005, kn.z + 0.05], scale: [1, 1.1, 0.5] });
    b.part(new THREE.OctahedronGeometry(0.014, 0), "#52f2b0", { bone: leg.joints[1], at: [kn.x, kn.y - 0.005, kn.z + 0.071], scale: [0.8, 1.3, 0.6] });
  }

  // ================================================================ arms and hands
  const armLen = [0.3, 0.27];
  const handParts: Array<{ side: string; wrist: Joint }> = [];
  const arms: Record<string, { S: Vec; E: Vec; W: Vec; wrist: Joint; chain: ReturnType<typeof b.chain> }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S = v3(s * 0.19, 1.49, 0);
    const uDir = s > 0 ? v3(0.32, -0.9, 0.12) : v3(-0.5, -0.85, 0.0);
    const fDir = s > 0 ? v3(0.22, -0.38, 0.9) : v3(-0.42, -0.88, 0.12);
    const E = S.clone().addScaledVector(uDir.normalize(), armLen[0]);
    const W = E.clone().addScaledVector(fDir.normalize(), armLen[1]);
    const clav = b.joint(`clavicle${side}`, { parent: chest, at: [s * 0.05, 1.5, 0], aim: S });
    const arm = b.chain(`arm${side}`, polyline([S, E, W]), {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wrist = arm.tip as Joint;
    arms[side] = { S, E, W, wrist, chain: arm };
    handParts.push({ side, wrist });
    const lace = paint((_p, _n, st) => {
      const diag = (st[0] * 55 + st[1] / 45) % 1;
      if (st[0] > 0.665 && st[0] < 0.935 && diag < 0.16) return GOLD;
      return LEATHER;
    });
    b.sweep(arm, (t) => (t < 0.526 ? 0.054 - 0.016 * (t / 0.526) : 0.037 - 0.008 * ((t - 0.526) / 0.474)), {
      sides: 8,
      bands: [
        [0.49, TUNIC],
        [0.535, GOLD],
        [0.64, CREAM],
        [0.945, lace],
        [1, SKIN],
      ],
    });
    // bracer rims and a shoulder cuff
    b.sweep(arm, () => 0.036, { from: 0.642, to: 0.675, sides: 8, color: GOLD });
    b.sweep(arm, () => 0.0305, { from: 0.925, to: 0.955, sides: 8, color: GOLD });
    b.sweep(arm, () => 0.047, { from: 0.455, to: 0.5, sides: 8, color: TUNIC_DK });
    b.part(new THREE.SphereGeometry(0.052, 8, 6), TUNIC, { bone: arm.joints[0], at: [S.x, S.y - 0.002, S.z] });
  }

  function hand(side: string, wrist: Joint, W: Vec, dIn: Vec, pnIn: Vec, thumbIn: Vec, curl: number[], thumbCurl: number) {
    const d = dIn.clone().normalize();
    const pn = pnIn.clone().addScaledVector(d, -pnIn.dot(d)).normalize();
    const a = thumbIn.clone().addScaledVector(d, -thumbIn.dot(d)).addScaledVector(pn, -thumbIn.dot(pn)).normalize();
    b.frustumBox(W.clone().addScaledVector(d, 0.006), W.clone().addScaledVector(d, 0.092), [0.07, 0.03], [0.082, 0.026], {
      up: pn,
      color: SKIN,
      bone: wrist,
    });
    const names = ["index", "middle", "ring", "pinky"];
    const lens = [0.97, 1.05, 0.98, 0.82];
    for (let f = 0; f < 4; f++) {
      const K = W.clone().addScaledVector(d, 0.09).addScaledVector(a, 0.03 - f * 0.02);
      const pts = [K.clone()];
      const L = [0.037, 0.029, 0.024];
      for (let i = 0; i < 3; i++) {
        const phi = (curl[i] * Math.PI) / 180;
        const dir = d.clone().multiplyScalar(Math.cos(phi)).addScaledVector(pn, Math.sin(phi));
        pts.push(pts[i].clone().addScaledVector(dir, L[i] * lens[f]));
      }
      const ch = b.chain(`${names[f]}${side}`, polyline(pts), {
        parent: wrist,
        names: [1, 2, 3].map((i) => `${names[f]}${side}${i}`),
        role: "digit",
      });
      b.sweep(ch, [0.0098, 0.0072], { color: SKIN, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0062, 5, 4), cel("#ffd3c4", "#e9a4a6"), {
        bone: ch.tip ?? ch.joints[2],
        at: pts[3].clone().addScaledVector(pn, 0.003),
        scale: [1, 1.3, 1],
      });
    }
    const T = W.clone().addScaledVector(d, 0.028).addScaledVector(a, 0.044).addScaledVector(pn, -0.002);
    const d1 = d.clone().multiplyScalar(Math.cos(0.6)).addScaledVector(a, Math.sin(0.6)).addScaledVector(pn, 0.15).normalize();
    const tc = (thumbCurl * Math.PI) / 180;
    const d2 = d1.clone().multiplyScalar(Math.cos(tc)).addScaledVector(pn, Math.sin(tc)).normalize();
    const t1 = T.clone().addScaledVector(d1, 0.035);
    const t2 = t1.clone().addScaledVector(d2, 0.03);
    const th = b.chain(`thumb${side}`, polyline([T, t1, t2]), {
      parent: wrist,
      names: [`thumb${side}1`, `thumb${side}2`],
      role: "digit",
    });
    b.sweep(th, [0.0115, 0.0085], { color: SKIN, sides: 6 });
    return { d, pn, a };
  }

  const L = arms.L;
  const hL = hand("L", L.wrist, L.W, v3(0.12, 0, 1), v3(-0.99, 0, 0.12), v3(0, 1, 0), [45, 110, 170], 60);
  const R = arms.R;
  hand("R", R.wrist, R.W, v3(-0.3, -0.93, 0.1), v3(0.25, 0, 0.97), v3(-1, 0, 0.1), [12, 28, 45], 14);

  // ================================================================ bow (in the left fist)
  const G = L.W.clone().addScaledVector(hL.d, 0.094).addScaledVector(hL.pn, 0.03);
  {
    const pts: Array<[number, number]> = [
      [0.68, -0.115], [0.6, -0.15], [0.42, -0.105], [0.22, -0.04], [0.07, 0.0], [0, 0.003], [-0.07, 0.0],
      [-0.22, -0.04], [-0.42, -0.105], [-0.6, -0.15], [-0.68, -0.115],
    ];
    const path = catmull(pts.map(([y, z]) => [G.x, G.y + y, G.z + z]));
    const bowR = (t: number): [number, number] => {
      const u = Math.abs(t - 0.5) * 2;
      const lobe = 0.0075 * Math.exp(-(((u - 0.24) / 0.1) ** 2));
      return [0.013 * (1 - u) + 0.0055 * u + lobe, 0.0125 * (1 - u) + 0.0042 * u];
    };
    const wood = cel("#e8b370", "#b0644e");
    b.sweep(path, bowR, {
      bone: L.wrist,
      sides: 6,
      bands: [
        [0.045, GOLD],
        [0.11, wood],
        [0.2, cel("#c88a4c", "#8e4a47")],
        [0.43, wood],
        [0.47, GOLD],
        [0.53, LEATHER_DK],
        [0.57, GOLD],
        [0.8, wood],
        [0.89, cel("#c88a4c", "#8e4a47")],
        [0.955, wood],
        [1, GOLD],
      ],
      caps: { start: "round", end: "round" },
    });
    // grip wrap
    const wrap = paint((p) => (Math.floor(p.y * 90) % 2 === 0 ? LEATHER_DK : LEATHER));
    b.rod([G.x, G.y - 0.043, G.z], [G.x, G.y + 0.043, G.z], 0.0155, wrap, { bone: L.wrist, sides: 7 });
    const top = [G.x, G.y + 0.68, G.z - 0.115];
    const bot = [G.x, G.y - 0.68, G.z - 0.115];
    b.rod(top, bot, 0.0016, "#f6efde", { bone: L.wrist, sides: 4 });
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), GOLD, { bone: L.wrist, at: [G.x, G.y + 0.682, G.z - 0.113] });
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), GOLD, { bone: L.wrist, at: [G.x, G.y - 0.682, G.z - 0.113] });
    b.part(new THREE.SphereGeometry(0.0055, 5, 4), GOLD, { bone: L.wrist, at: [G.x, G.y + 0.095, G.z - 0.113] });
    // gold leaf fins on the riser and a glowing gem above the grip
    for (const dy of [1, -1]) {
      const leaf: OutlinePoint[] = [[0, 0], [0.012, 0.035], [0.008, 0.075], [0, 0.11, "sharp"], [-0.008, 0.075], [-0.012, 0.035]];
      b.extrude(leaf, { at: [G.x, G.y + dy * 0.047, G.z + 0.006], x: [0, dy, 0], y: [1, 0, 0], thickness: 0.006, bevel: 0.0015, color: GOLD, bone: L.wrist });
    }
    glow(b.part(new THREE.OctahedronGeometry(0.014, 0), "#52f2b0", { bone: L.wrist, at: [G.x, G.y + 0.057, G.z + 0.017], scale: [0.8, 1.4, 0.8] }), 1.5);
  }

  // ================================================================ tunic details
  // belt with buckle, pouch and leaf skirt panels
  const beltPath = skin.loop(v3(0, 1.0, 0), { dir: [0, 1, 0], lift: 0.004 });
  b.sweep(beltPath, (_t) => [0.008, 0.02], { section: "box", up: [0, 1, 0], color: LEATHER, bone: hips });
  const beltEdge = skin.loop(v3(0, 1.0, 0), { dir: [0, 1, 0], lift: 0.0075 });
  b.sweep(beltEdge, (_t) => [0.002, 0.0235], { section: "box", up: [0, 1, 0], color: GOLD, bone: hips });
  b.part(new THREE.BoxGeometry(0.05, 0.046, 0.012), GOLD, { bone: hips, at: [0, 1.0, 0.108] });
  glow(b.part(new THREE.OctahedronGeometry(0.013, 0), "#52f2b0", { bone: hips, at: [0, 1.0, 0.117], scale: [0.8, 1.4, 0.7] }), 1.5);
  // pouch
  {
    const h = skin.around(v3(0, 1.0, 0)).at(58, -8);
    if (h) {
      b.stick(new THREE.BoxGeometry(0.075, 0.085, 0.04), LEATHER_DK, h, { embed: 0.15, bone: hips });
      b.stick(new THREE.BoxGeometry(0.08, 0.034, 0.044), LEATHER, h.moved([0, 0.03, 0.015]), { embed: 0.1, bone: hips });
      b.stick(new THREE.SphereGeometry(0.008, 5, 4), GOLD, h.moved([0, 0.032, 0.032]), { embed: 0.2, bone: hips });
    }
  }
  const panelHem = (x: number): number => -0.36 + 1.25 * Math.abs(x);
  const panelPaint = paint((_p, _n, st) => {
    if (Math.abs(st[0]) > 0.054) return GOLD;
    if (st[1] < panelHem(st[0]) + 0.026) return GOLD;
    return TUNIC;
  });
  for (const s of [1, -1]) {
    const outline: OutlinePoint[] = [[-0.065, 0], [0.065, 0], [0.072, -0.12], [0.08, -0.26], [0, -0.36, "sharp"], [-0.08, -0.26], [-0.072, -0.12]];
    const panel = b.extrude(outline, { at: [s * 0.085, 0.99, 0.121], x: [1, 0, 0], y: [0, 1, -0.1], thickness: 0.012, bevel: 0.003, color: panelPaint, bone: hips });
    b.decal(panel, VINE, { at: panel.local([0, -0.16, 0.006]), dir: [0, 0.1, 1], size: [0.05, 0.1], lift: 0.002, bone: hips });
  }
  {
    const outline: OutlinePoint[] = [[-0.1, 0], [0.1, 0], [0.115, -0.15], [0.12, -0.28], [0.07, -0.33, "sharp"], [0.0, -0.27], [-0.07, -0.33, "sharp"], [-0.12, -0.28], [-0.115, -0.15]];
    b.extrude(outline, { at: [0, 0.99, -0.112], x: [1, 0, 0], y: [0, 1, 0.07], thickness: 0.012, bevel: 0.003, color: paint((_p, _n, st) => (Math.abs(st[0]) > 0.092 || st[1] < -0.3 + 1.1 * Math.abs(Math.abs(st[0]) - 0.07) - 0.0 ? GOLD : TUNIC_DK)), bone: hips });
  }
  // abdomen filigree and chest gem
  b.decal(skin, VINE, { at: [0, 1.15, 0.09], dir: [0, 0, 1], size: [0.06, 0.12], lift: 0.002, bone: spine.joints[0] });
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.008, 6), GOLD, { bone: chest, at: [0, 1.48, 0.088], dir: [0, 0.4, 1], axis: "y" });
  // collar ring
  const collar = catmull(
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [Math.sin(a) * 0.062, 1.535 + 0.01 * Math.cos(a), Math.cos(a) * 0.055 - 0.004];
    }),
    { closed: true },
  );
  b.sweep(collar, { radius: [0.014, 0.014], color: CREAM, sides: 6, bone: chest });
  b.sweep(collar, { radius: 0.0055, color: GOLD, sides: 6, bone: chest, shift: [0, 0] });

  // baldric (quiver strap) across the chest
  const baldric = skin.drape(
    catmull(
      [[-0.13, 1.5, 0.02], [-0.06, 1.38, 0.11], [0.03, 1.24, 0.105], [0.13, 1.1, 0.09], [0.17, 1.01, 0.0], [0.1, 1.05, -0.09], [0, 1.2, -0.1], [-0.1, 1.4, -0.09], [-0.15, 1.49, -0.02]],
      { closed: true },
    ),
    { lift: 0.01 },
  );
  b.sweep(baldric, (_t) => [0.019, 0.0055], { section: "box", color: LEATHER, bone: spine.joints[1], up: [0, 0, 1] });
  b.along(baldric, 7, (at) => b.part(new THREE.BoxGeometry(0.008, 0.008, 0.006), GOLD, { frame: at }));

  // ================================================================ pauldron on the left shoulder
  {
    const upper = L.E.clone().sub(L.S).normalize();
    const lathe: OutlinePoint[] = [[0, 0.085], [0.04, 0.078], [0.075, 0.052], [0.092, 0.015], [0.094, 0], [0, 0]];
    const plate = (r: number, at: Vec, axisDir: Vec, col: Paint) =>
      b.lathe(lathe.map(([x, y]) => [x * r, y * r] as OutlinePoint), {
        at,
        axis: axisDir,
        segments: 10,
        color: col,
        bone: arms.L.chain.joints[0],
      });
    const paintPlate = (base: Paint) =>
      paint((_p, _n, st) => {
        if (st[0] < 0.011) return GOLD;
        if (st[0] > 0.02 && Math.abs(((st[1] % 36) + 36) % 36 - 18) < 1.6) return GOLD;
        return base;
      });
    plate(1.0, L.S.clone().add(v3(0.002, 0.012, 0)), v3(0.55, 0.83, 0.02), paintPlate(LEATHER));
    plate(0.85, L.S.clone().addScaledVector(upper, 0.07).add(v3(0.01, 0.02, 0)), v3(0.85, 0.55, 0.02), paintPlate(LEATHER));
    plate(0.7, L.S.clone().addScaledVector(upper, 0.12).add(v3(0.018, 0.018, 0)), v3(0.95, 0.35, 0.02), paintPlate(LEATHER));
    glow(b.part(new THREE.OctahedronGeometry(0.016, 0), "#52f2b0", { bone: arms.L.chain.joints[0], at: [L.S.x + 0.045, L.S.y + 0.064, L.S.z], scale: [0.8, 1.4, 0.8] }), 1.5);
    b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), GOLD, { bone: arms.L.chain.joints[0], at: [L.S.x + 0.045, L.S.y + 0.064, L.S.z], dir: [0.55, 0.83, 0.02], axis: "z" });
  }

  // ================================================================ half cloak over the left shoulder
  {
    const capeTop = catmull([[0.3, 1.455, -0.075], [0.22, 1.545, -0.095], [0.14, 1.57, -0.12], [0.07, 1.555, -0.135]]);
    const capeHem = polyline([
      [0.5, 0.62, -0.14], [0.46, 0.38, -0.2], [0.4, 0.5, -0.27], [0.33, 0.3, -0.3], [0.26, 0.44, -0.34], [0.19, 0.28, -0.35], [0.11, 0.42, -0.34], [0.06, 0.3, -0.31],
    ]);
    const capePaint = paint((_p, n, st) => {
      if (n.z > 0.2) return CAPE_IN;
      if (st[1] > 0.93) return GOLD;
      if (st[1] > 0.88 && st[1] < 0.9) return GOLD;
      return CAPE_OUT;
    });
    b.membrane(capeTop, capeHem, { color: capePaint, thickness: 0.014, rows: 8, cols: 40, bone: spine.joints[1] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 6), GOLD, { bone: spine.joints[1], at: [0.14, 1.565, -0.11], dir: [0, 0.3, -1], axis: "y" });
    b.part(new THREE.SphereGeometry(0.052, 8, 6), CAPE_OUT, { bone: chest, at: [0.0, 1.53, -0.095], scale: [2.0, 0.55, 1.0] });
  }

  // ================================================================ quiver and arrows (right back)
  {
    const QB = v3(-0.175, 0.9, -0.2);
    const QT = v3(-0.115, 1.46, -0.2);
    const axis = QT.clone().sub(QB).normalize();
    const u = v3(1, 0, 0).addScaledVector(axis, -axis.x).normalize();
    const w = axis.clone().cross(u).normalize();
    const outline: OutlinePoint[] = [[0, 0], [0.04, 0], [0.054, 0.02], [0.061, 0.2], [0.066, 0.5], [0.073, 0.565], [0.065, 0.572], [0.056, 0.5], [0, 0.5]];
    const qPaint = paint((_p, _n, st) => {
      if (st[0] > 0.535 || st[0] < 0.028) return GOLD;
      if (Math.abs(st[0] - 0.25) < 0.008 || Math.abs(st[0] - 0.42) < 0.008) return GOLD;
      const cross = (st[0] * 60 + st[1] / 30) % 1;
      if (st[0] > 0.27 && st[0] < 0.41 && cross < 0.12) return LEATHER_DK;
      return LEATHER;
    });
    b.lathe(outline, { at: QB, axis, segments: 10, color: qPaint, bone: chest });
    const offsets: Array<[number, number]> = [[0, 0], [0.026, 0.008], [-0.026, 0.01], [0.014, -0.028], [-0.016, -0.026], [0.03, -0.014], [-0.03, -0.01]];
    offsets.forEach(([ox, oz], i) => {
      const base = QB.clone().addScaledVector(axis, 0.3).addScaledVector(u, ox).addScaledVector(w, oz);
      const fan = v3(ox * 0.8, 0, oz * 0.8);
      const dir = axis.clone().addScaledVector(fan, 1.0).normalize();
      const len = 0.52 + rand() * 0.06 + (i === 0 ? 0.04 : 0);
      const top = base.clone().addScaledVector(dir, len);
      b.rod(base, top, 0.0042, "#e6c07e", { bone: chest, sides: 5 });
      b.part(new THREE.SphereGeometry(0.0055, 5, 4), "#4a2c24", { bone: chest, at: top });
      b.cards([frame(top.clone().addScaledVector(dir, -0.105), dir)], i % 2 ? FEATHER_B : FEATHER_A, {
        size: [0.026, 0.085],
        cross: true,
        bone: chest,
        sink: 0,
      });
    });
    // strap loop at the rim
    b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 8), GOLD, { bone: chest, at: QT.clone().addScaledVector(u, -0.02).add(v3(0, 0.0, 0.065)), dir: [0, 0, 1], axis: "z" });
  }

  // ================================================================ dagger on the right hip
  {
    const P0 = v3(-0.185, 1.02, 0.01);
    const D = v3(-0.12, -0.92, -0.38).normalize();
    b.sweep(polyline([P0.clone().addScaledVector(D, -0.005), P0.clone().addScaledVector(D, 0.27)]), [0.021, 0.011], { color: LEATHER_DK, sides: 6, bone: hips, caps: { start: "flat", end: "round" } });
    b.sweep(polyline([P0.clone().addScaledVector(D, 0.0), P0.clone().addScaledVector(D, 0.035)]), 0.0235, { color: GOLD, sides: 6, bone: hips, caps: "flat" });
    b.sweep(polyline([P0.clone().addScaledVector(D, 0.2), P0.clone().addScaledVector(D, 0.225)]), 0.0155, { color: GOLD, sides: 6, bone: hips, caps: "flat" });
    b.sweep(polyline([P0.clone().addScaledVector(D, -0.005), P0.clone().addScaledVector(D, -0.095)]), 0.0095, { color: LEATHER, sides: 6, bone: hips, caps: "flat" });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { bone: hips, at: P0.clone().addScaledVector(D, -0.1) });
    b.rod(P0.clone().add(v3(0.04, 0.0, 0)), P0.clone().add(v3(-0.04, 0.0, 0)).addScaledVector(D, 0.0), 0.005, GOLD, { bone: hips, sides: 5 });
  }

  return b.root;
}
