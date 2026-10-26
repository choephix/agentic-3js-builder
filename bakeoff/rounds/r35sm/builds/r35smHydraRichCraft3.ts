import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  catmull,
  bezier,
  limb,
  countershade,
  mottle,
  scales,
  stripes,
  paint,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A scarred, war-torn five-headed hydra in a grim Norse-myth style: slate scales, bone horns, rune-bronze cuffs, a chained neck, glowing seals, and a frost axe, spear and broken sword buried in its hide.",
};

// ---------- palette ----------
const SC = ["#3b4a3d", "#34463f", "#43493a"];
const BELLY_A = "#b09a6e";
const BELLY_B = "#8a7650";
const BONE = "#d8c9a0";
const HORN = "#cdbb92";
const HORN_TIP = "#6e5c40";
const IVORY = "#e9dfc3";
const CLAW = "#2a2620";
const TONGUE = "#8a2a2a";
const BRONZE = "#b5813a";
const IRON = "#4a4d52";
const RED = "#8a1c14";
const WOOD = "#6b4a2b";
const FROST = "#8fc4de";
const DARK = "#161d19";

// ---------- paints ----------
const SCP = mottle(scales(SC, "#161d19", { size: 0.11, seed: 3 }), "#55634a", { size: 0.45, contrast: 0.8, seed: 5 });
const PLATES = stripes(BELLY_A, BELLY_B, { size: 0.07, axis: "y", width: 0.5, wobble: 0.1 });
const HIDE = countershade(SCP, mottle(BELLY_A, BELLY_B, { size: 0.15, seed: 9 }), { level: -0.35, soft: 0.25 });
const NECKP = paint((_p, n) => (n.z > 0.35 ? PLATES : SCP));
const FOOTP = mottle("#2a3029", "#1a1f1c", { size: 0.1 });

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 70 50"><defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.6" stop-color="#ff9a1f"/><stop offset="1" stop-color="#c0400a"/></radialGradient></defs>
  <path d="M2 28 Q35 -6 68 22 Q38 56 2 28Z" fill="url(#g)" stroke="#2a0e06" stroke-width="3"/>
  <ellipse cx="36" cy="26" rx="5" ry="17" fill="#120808"/></svg>`,
  { size: 128 },
);
const EYE_BLIND = svg(
  `<svg viewBox="0 0 70 50"><path d="M2 28 Q35 -6 68 22 Q38 56 2 28Z" fill="#cfd6c8" stroke="#2a2a22" stroke-width="3"/>
  <ellipse cx="36" cy="26" rx="5" ry="15" fill="#9aa59a"/>
  <path d="M16 2 L56 50" stroke="#7a1410" stroke-width="5" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const RUNEC = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#ff7a1a" stroke-width="3.5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#ffb040" stroke-width="1.5" stroke-dasharray="3 4"/>
  <path d="M50 14 L78 62 L22 62Z M50 86 L22 38 L78 38Z" fill="none" stroke="#ff9a2a" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M50 28 L50 72 M36 50 L64 50" stroke="#ffd070" stroke-width="3"/>
  <circle cx="50" cy="50" r="5" fill="#ffe090"/></svg>`,
  { size: 256 },
);
const bandGlyphs = (() => {
  let s = "";
  for (let i = 0; i < 8; i++) {
    const x = 12 + i * 24;
    const v = i % 4;
    s += `<path d="M${x} 6 L${x} 34 ${v === 0 ? `M${x} 8 L${x + 10} 16 L${x} 24` : v === 1 ? `M${x - 8} 12 L${x + 8} 28` : v === 2 ? `M${x} 8 L${x + 9} 14 L${x} 20 L${x + 9} 26` : `M${x - 8} 28 L${x} 14 L${x + 8} 28`}" fill="none" stroke="#3a2a14" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
})();
const RUNEB = svg(
  `<svg viewBox="0 0 200 40"><rect width="200" height="40" fill="#e0dcd0"/><rect y="0" width="200" height="3" fill="#6a5030"/><rect y="37" width="200" height="3" fill="#6a5030"/>${bandGlyphs}</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hydra", detail: 0.7 });
  const rand = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.5, -1.3] });
  const spine = b.chain("spine", catmull([[0, 1.5, -1.3], [0, 1.65, -0.3], [0, 1.85, 0.6], [0, 1.9, 1.1]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chestJ = spine.joints[2];

  // ---------- body ----------
  const body = b.sweep(spine, (t) => [0.7 + 0.25 * Math.sin(Math.PI * t) - 0.1 * t * t, 0.7 + 0.2 * Math.sin(Math.PI * t)], {
    color: HIDE,
  });
  b.along(body, 7, (at) => b.spike(at, at, 0.38 - 0.14 * at.t, 0.09, { color: BONE }));

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 1.5, -1.4], [0, 1.1, -2.4], [0, 0.65, -3.4], [0, 0.3, -4.4], [0, 0.14, -5.3]]), {
    parent: hips,
    count: 5,
    role: "tail",
  });
  const tailS = b.sweep(tail, (t) => 0.58 * (1 - t) + 0.04, { color: HIDE });
  b.along(tailS, 7, (at) => b.spike(at, at, 0.3 * (1 - at.t) + 0.08, 0.05 * (1 - at.t) + 0.025, { color: BONE }));
  const tailEnd = tail.at(1).at;
  b.extrude([[0, 0], [0.25, 0.17], [0.65, 0, "sharp"], [0.25, -0.12]], {
    at: [tailEnd.x, tailEnd.y + 0.02, tailEnd.z],
    x: [0, 0, -1],
    thickness: 0.05,
    bevel: 0.01,
    color: "#9a9a8e",
    bone: tail.joints[tail.joints.length - 1],
  });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fpts = limb([s * 0.8, 1.55, 0.7], [s * 0.95, 0.16, 0.95], [0.9, 0.9], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, fpts, { parent: chestJ, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.34, 0.16], { color: HIDE });
    b.spike(arm.joints[1], [0, -0.25, -1], 0.3, 0.07, { color: BONE });
    // hind
    const hpts = limb([s * 0.8, 1.45, -1.4], [s * 0.95, 0.16, -1.25], [0.85, 0.85], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, hpts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.36, 0.16], { color: HIDE });
    b.spike(leg.joints[1], [s * 0.4, 0.2, 1], 0.28, 0.07, { color: BONE });
    for (const [lg, fx, fz] of [[arm, 0.95, 0.95], [leg, 0.95, -1.25]] as const) {
      const x = s * fx;
      b.part(new THREE.BoxGeometry(0.4, 0.16, 0.46), FOOTP, { bone: lg.tip!, at: [x, 0.08, fz + 0.1] });
      for (const dx of [-0.13, 0, 0.13])
        b.spike([x + dx, 0.09, fz + 0.3], [dx * 0.6, -0.2, 1], 0.28, 0.05, { color: CLAW, bone: lg.tip! });
    }
  }

  // ---------- necks & heads ----------
  const tags: Record<number, string> = { [-2]: "R2", [-1]: "R1", 0: "C", 1: "L1", 2: "L2" };
  const jawPoses: [any, number][] = [];
  const neckSweeps: Record<number, any> = {};
  const neckChains: Record<number, any> = {};
  for (const i of [-2, -1, 0, 1, 2]) {
    const a = Math.abs(i);
    const tag = tags[i];
    const H = [5.2, 4.5, 3.9][a];
    const k = [1.4, 1.1, 0.9][a];
    const xb = i * 0.36;
    const path = catmull([
      [xb, 2.2, 0.45],
      [xb * 1.5, 2.9, 0.15],
      [i * 0.8, H * 0.65 + 0.3, 0.55 - a * 0.1],
      [i * 0.95, H, 1.0 - a * 0.1],
    ]);
    const neck = b.chain(`neck${tag}`, path, { parent: chestJ, count: 5, names: (j) => `neck${tag}${j + 1}`, role: "neck" });
    const nr = (t: number) => (0.27 + 0.03 * (2 - a)) * (1 - 0.38 * t);
    const ns = b.sweep(neck, nr, { color: NECKP });
    neckSweeps[i] = ns;
    neckChains[i] = neck;
    b.along(ns, 6, (at) => b.spike(at, at, 0.2, 0.05, { color: BONE }));

    // cuffs
    for (const t of a === 0 ? [0.4, 0.75] : [0.5]) {
      const p = neck.at(t);
      b.part(new THREE.CylinderGeometry(nr(t) + 0.04, nr(t) + 0.04, 0.14, 10), BRONZE, {
        bone: p.bone!,
        at: p.at,
        dir: p.tangent,
        texture: RUNEB,
      });
    }

    // head
    const tip = neck.at(1).at;
    const head = b.joint(`head${tag}`, { parent: neck, at: tip, dir: [i * 0.12, -0.45, 1], role: "head" });
    const L = (x: number, y: number, z: number) => head.local([x * k, y * k, z * k]);
    const up = head.dir([0, 0, 1]);
    const skull = b.frustumBox(L(0, -0.18, 0), L(0, 0.22, 0), [0.34 * k, 0.3 * k], [0.3 * k, 0.26 * k], { bone: head, color: SCP });
    b.frustumBox(L(0, 0.2, -0.02), L(0, 0.7, -0.04), [0.28 * k, 0.2 * k], [0.2 * k, 0.13 * k], { bone: head, color: SCP });
    // jaw
    const jaw = b.joint(`jaw${tag}`, { parent: head, at: L(0, -0.02, -0.1), aim: L(0, 0.6, -0.12), role: "jaw" });
    b.frustumBox(L(0, 0.0, -0.12), L(0, 0.66, -0.14), [0.26 * k, 0.07 * k], [0.17 * k, 0.05 * k], { bone: jaw, color: HIDE });
    b.frustumBox(L(0, 0.05, -0.1), L(0, 0.5, -0.11), [0.12 * k, 0.02 * k], [0.08 * k, 0.015 * k], { bone: jaw, color: TONGUE });
    // teeth
    for (let j = 0; j < 6; j++) {
      const y = 0.28 + j * 0.08;
      for (const s of [1, -1]) {
        const x = s * (0.125 - 0.012 * j);
        const fang = j === 1;
        b.spike(L(x, y, -0.075), head.dir([0, 0, -1]), (fang ? 0.19 : 0.09) * k, (fang ? 0.026 : 0.017) * k, { color: IVORY, bone: head });
        if (j < 5) b.spike(L(x * 0.95, y + 0.03, -0.085), up, 0.08 * k, 0.016 * k, { color: IVORY, bone: jaw });
      }
    }
    // eyes
    for (const s of [1, -1]) {
      const blind = i === 2 && s === 1;
      const eye = b.decal(skull, blind ? EYE_BLIND : EYE, {
        at: L(s * 0.14, 0.1, 0.06),
        dir: head.dir([s, 0.25, 0.2]),
        up,
        size: [0.13 * k, 0.095 * k],
        color: "#ffffff",
      });
      if (!blind) glow(eye, 1.3);
      b.rod(L(s * 0.04, 0.02, 0.16), L(s * 0.18, 0.18, 0.13), 0.04 * k, { bone: head, color: DARK });
      // horns
      b.sweep(bezier(L(s * 0.11, -0.02, 0.12), L(s * 0.24, -0.15, 0.36), L(s * 0.22, -0.55, 0.42)), [0.06 * k, 0], {
        bone: head,
        color: HORN,
        bands: [[0.65, HORN], [1, HORN_TIP]],
        sides: 6,
      });
      b.spike(L(s * 0.15, -0.05, -0.05), head.dir([s * 0.7, -0.6, -0.1]), 0.2 * k, 0.04 * k, { color: BONE, bone: head });
      b.part(new THREE.IcosahedronGeometry(0.018 * k, 0), CLAW, { bone: head, at: L(s * 0.05, 0.69, 0.0) });
    }
    // crest
    const cr = [[0, -0.03], [0, 0.02], [0.06, 0.2], [0.14, 0.05], [0.22, 0.3], [0.3, 0.04], [0.38, 0.2], [0.44, 0], [0.44, -0.03]];
    b.extrude(cr.map(([x, y]) => [x * k, y * k, "sharp"] as [number, number, "sharp"]), {
      at: L(0, -0.2, 0.13),
      x: head.dir([0, 1, 0]),
      y: up,
      thickness: 0.025 * k,
      color: BONE,
      bone: head,
    });
    // scar on the centre head
    if (i === 0) b.rod(L(0.2, 0.02, 0.16), L(-0.08, 0.3, 0.1), 0.012 * k, { bone: head, color: "#c9b99a" });
    jawPoses.push([jaw, [20, 12, 8][a]]);
  }

  // chain wound round the centre neck
  {
    const neck = neckChains[0];
    const pts: THREE.Vector3[] = [];
    for (let q = 0; q <= 30; q++) {
      const t = 0.12 + (0.6 * q) / 30;
      const cp = neck.at(t);
      const r = (0.33 * (1 - 0.38 * t)) + 0.04;
      const a = q * 0.55;
      pts.push(cp.at.clone().addScaledVector(cp.normal, Math.cos(a) * r).addScaledVector(cp.binormal, Math.sin(a) * r));
    }
    const g1 = new THREE.TorusGeometry(0.05, 0.014, 4, 8);
    const g2 = new THREE.TorusGeometry(0.05, 0.014, 4, 8).rotateY(Math.PI / 2);
    let c = 0;
    b.along(catmull(pts), 36, (at) => {
      b.part(c++ % 2 ? g1 : g2, IRON, { frame: at });
    });
  }

  // ---------- glowing seals ----------
  const surf = b.surface(body);
  const hit = surf.ray([0, 1.75, 4], [0, 0, -1]);
  if (hit) glow(b.decal(body, RUNEC, { at: hit, dir: [0, 0, 1], size: [0.9, 0.9], color: "#ffffff" }), 1.3);
  for (const s of [1, -1]) {
    const h = surf.ray([s * 3, 1.6, -0.3], [-s, 0, 0]);
    if (h) glow(b.decal(body, RUNEC, { at: h, dir: [s, 0, 0], size: [0.7, 0.7], color: "#ffffff" }), 1.2);
  }

  // ---------- embedded weapons ----------
  // spear in the back
  b.rod([0.3, 2.2, -0.6], [0.95, 3.9, -1.1], 0.035, { color: WOOD, bone: spine.joints[1] });
  b.spike([0.95, 3.9, -1.1], [0.65, 1.7, -0.5], 0.14, 0.035, { color: WOOD, bone: spine.joints[1] });
  b.sweep(bezier([0.9, 3.65, -1.08], [0.85, 3.4, -1.6], [0.95, 2.9, -1.9]), (t) => [0.09 * (1 - t * 0.6), 0.008], {
    section: "box",
    color: RED,
    bone: spine.joints[1],
  });
  b.rod([0.27, 2.1, -0.58], [0.36, 2.35, -0.64], 0.06, { color: RED, bone: spine.joints[1] });
  // frost axe in the right chest
  b.rod([-0.8, 2.3, 0.8], [-1.5, 3.0, 0.8], 0.04, { color: WOOD, bone: chestJ });
  glow(
    b.extrude([[0, 0], [0.2, 0.05], [0.3, 0.22], [0.2, 0.4], [0.05, 0.32], [0, 0.2]], {
      at: [-1.5, 2.62, 0.8],
      x: [0, 0, 1],
      y: [-0.7, 0.7, 0],
      thickness: 0.035,
      bevel: 0.008,
      smoothing: 1,
      color: FROST,
      bone: chestJ,
    }),
    0.5,
  );
  // broken sword in the left flank
  b.extrude([[0, -0.04], [0.8, -0.04], [0.95, 0, "sharp"], [0.8, 0.04], [0, 0.04]], {
    at: [0.85, 1.9, -0.4],
    x: [1, 0.35, 0],
    thickness: 0.02,
    color: "#a9a79a",
    bone: spine.joints[1],
  });
  b.rod([0.88, 1.9, -0.7], [0.88, 1.9, -0.1], 0.03, { color: BRONZE, bone: spine.joints[1] });
  b.rod([0.84, 1.88, -0.4], [0.84, 1.88, -0.1], 0.02, { color: BRONZE, bone: spine.joints[1] });
  void rand;

  // ---------- rest pose: open the jaws ----------
  for (const [jaw, deg] of jawPoses) b.pose(jaw, { axis: [1, 0, 0], deg });

  return b.root;
}
