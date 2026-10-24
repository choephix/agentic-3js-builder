```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  resolve,
  svg,
} from "agentic-3js-builder";
import type { Rgb, ColorInput, Joint } from "agentic-3js-builder";
import { cel, furEdge } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Mothman on the Girder",
  description:
    "A hunched, red-eyed mothman with huge patterned wings and plumose antennae, crouched on a riveted bridge girder. 1950s pulp sci-fi cover styling: bold cel-shaded fur, sunset rim light, glowing eyes and a lurid warning plate.",
};

type OP = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Palette (pulp: slate purple, hot orange, lurid red, cream)
const ORANGE = "#ff8a2a";
const DARK = "#1d1426";
const CLAW = "#ddd2b6";
const TOOTH = "#f4ecd6";
const ANT = "#e69a3c";
const ANT_LIGHT = "#ffd58a";

const rim = (base: ColorInput, amt = 0.3) =>
  paint((p, n) => mix(resolve(base, p, n), ORANGE, amt * smoothstep(0.5, 0.95, n.y)));

const furBase = paint((p) => {
  const t = noise(p, 0.1, 3);
  const c = mix("#4d4f78", "#2f3053", smoothstep(0.3, 0.7, t));
  return mix(c, "#8386b0", 0.35 * smoothstep(0.55, 0.8, noise(p, 0.04, 5)));
});
const FUR = rim(cel(furBase));
const CREAMC = rim(cel("#e6dbbb", "#bba98c"));
const SKIN = rim(cel("#4c486c"), 0.2);
const BROW = cel("#17101f", "#0c0712");

// Girder steel: teal-grey with rust, sunset sheen on top, and claw scratches where the feet grip.
const STEEL = paint((p, n) => {
  const t = noise(p, 0.2, 21);
  let c: Rgb = mix("#58737d", "#3d5560", t);
  const rust = smoothstep(0.55, 0.8, noise(p, 0.09, 22));
  c = mix(c, "#9a5530", 0.8 * rust * (0.4 + 0.6 * (1 - Math.max(n.y, 0))));
  const dx = Math.abs(Math.abs(p.x) - 0.22);
  if (n.y > 0.7 && dx < 0.09 && p.z > -0.05) {
    const k = p.x * 70 + noise(p, 0.05, 7) * 4;
    if (Math.abs((k - Math.floor(k)) - 0.5) < 0.07) c = mix(c, "#dfe4e6", 0.75);
  }
  return mix(c, "#f0a860", 0.3 * smoothstep(0.6, 0.95, n.y));
});
const WEB = panelled(STEEL, { size: 0.5, aspect: 0.9, rivets: 0.07, seam: "#1b2328" });

// Wing paint reads the extrude's outline coordinates (meters from the wing root).
function wingPaint(eyes: [number, number, number][], seed: number) {
  return paint((p, _n, s) => {
    const x = s[0];
    const y = s[1];
    const r = Math.hypot(x, y * 0.85);
    const ang = Math.atan2(y, x);
    const rb = r + 0.05 * Math.sin(ang * 26 + seed);
    let c: Rgb = mix("#4a1c3a", "#7a2e44", noise(p, 0.3, seed));
    c = mix(c, "#4d4f78", smoothstep(0.62, 0.3, r));
    if (Math.abs(rb - 0.95) < 0.035) c = mix(c, "#f2c14e", 0.9);
    c = mix(c, "#ff8f2e", smoothstep(1.42, 1.38, rb) * smoothstep(1.22, 1.26, rb));
    if (Math.abs(rb - 1.53) < 0.03) c = mix(c, "#f4e6c0", 0.95);
    if (rb > 1.6) c = mix(c, "#1d0e22", 0.95);
    const k = (ang * 18) / Math.PI;
    if (r > 0.35 && Math.abs(k - Math.floor(k) - 0.5) < 0.035) c = mix(c, "#1d0e22", 0.65);
    for (const [ex, ey, er] of eyes) {
      const d = Math.hypot(x - ex, y - ey);
      if (d < er * 1.28) c = "#14091a" as unknown as Rgb && mix("#14091a", "#14091a", 0);
      if (d < er * 1.05) c = mix("#ffd84a", "#ffd84a", 0);
      if (d < er * 0.74) c = mix("#e0261c", "#e0261c", 0);
      if (d < er * 0.4) c = mix("#14091a", "#14091a", 0);
      if (Math.hypot(x - ex + er * 0.15, y - ey + er * 0.15) < er * 0.12) c = mix("#ffffff", "#ffffff", 0);
    }
    return c;
  });
}

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7a7a7a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M1 64 Q5 30 16 0 Q27 30 31 64Z" fill="url(#g)"/>
  </svg>`,
  { size: 96 },
);

const EYE = svg(
  `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="e" cx="0.38" cy="0.35" r="0.75"><stop offset="0" stop-color="#ff9a6a"/><stop offset="0.45" stop-color="#ff3a22"/><stop offset="1" stop-color="#8a0012"/></radialGradient></defs>
    <ellipse cx="50" cy="65" rx="48" ry="63" fill="url(#e)"/>
    <g stroke="#9a0014" stroke-width="1.8" fill="none" opacity="0.7">
      <ellipse cx="50" cy="65" rx="36" ry="48"/><ellipse cx="50" cy="65" rx="22" ry="30"/><ellipse cx="50" cy="65" rx="9" ry="12"/>
      <path d="M50 2V128 M2 65H98 M16 20 L84 110 M84 20 L16 110 M30 8 L70 122 M70 8 L30 122 M8 40 L92 90 M92 40 L8 90"/>
    </g>
    <ellipse cx="34" cy="38" rx="13" ry="19" fill="#ffffff" opacity="0.92" transform="rotate(20 34 38)"/>
    <ellipse cx="70" cy="96" rx="5" ry="7" fill="#ffd0b0" opacity="0.85"/>
    <ellipse cx="50" cy="65" rx="48" ry="63" fill="none" stroke="#5a000c" stroke-width="3.5"/>
  </svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="394" height="94" rx="8" fill="#c4281c" stroke="#ffe36a" stroke-width="5"/>
    <path d="M12 12 H388" stroke="#ffe36a" stroke-width="1.5" stroke-dasharray="6 5"/>
    <text x="200" y="30" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="#ffe9a8">* POINT PLEASANT BRIDGE CO. *</text>
    <text x="200" y="76" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-weight="900" font-size="46" fill="#ffe36a" stroke="#1d1426" stroke-width="3" paint-order="stroke">MOTHMAN!</text>
    <text x="200" y="92" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#ffe9a8">SEE IT ON THE GIRDER - TONIGHT ONLY</text>
  </svg>`,
  { size: 512 },
);

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "mothman", paintSize: 2048 });
  const Y0 = 0.62; // top of the girder's upper flange
  const root = b.joint("root", { at: [0, 0, 0] });

  // =============================================================================================================
  // GIRDER
  const L = 4.0;
  const webH = Y0 - 0.1;
  b.part(new THREE.BoxGeometry(L, 0.05, 0.42), STEEL, { bone: root, at: [0, 0.025, 0] });
  b.part(new THREE.BoxGeometry(L, 0.05, 0.42), STEEL, { bone: root, at: [0, Y0 - 0.025, 0] });
  b.part(new THREE.BoxGeometry(L, webH, 0.05), WEB, { bone: root, at: [0, 0.05 + webH / 2, 0] });
  for (const e of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, Y0, 0.44), STEEL, { bone: root, at: [e * (L / 2 + 0.02), Y0 / 2, 0] });
    for (const x of [0.95, 1.45]) {
      for (const z of [1, -1])
        b.part(new THREE.BoxGeometry(0.04, webH, 0.08), STEEL, { bone: root, at: [e * x, 0.05 + webH / 2, z * 0.065] });
    }
    // splice plates across the flange
    b.part(new THREE.BoxGeometry(0.3, 0.014, 0.3), STEEL, { bone: root, at: [e * 0.7, Y0 + 0.007, 0] });
  }
  const rivets: [number, number, number][] = [];
  for (let x = -1.9; x <= 1.91; x += 0.12) for (const z of [-0.15, 0.15]) rivets.push([x, Y0 + 0.002, z]);
  for (const e of [1, -1]) {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) rivets.push([e * 0.7 - 0.09 + i * 0.09, Y0 + 0.014, -0.09 + j * 0.09]);
    for (const x of [0.95, 1.45])
      for (const z of [1, -1]) for (let k = 0; k < 4; k++) rivets.push([e * x + 0.021 * 0, 0.12 + k * 0.11, z * 0.105]);
  }
  const rivetGeo = mergeGeometries(
    rivets.map(([x, y, z]) => new THREE.SphereGeometry(0.016, 6, 4).translate(x, y, z)),
  ) as THREE.BufferGeometry;
  b.part(rivetGeo, "#b78f4a", { bone: root, at: [0, 0, 0] });
  b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", {
    bone: root,
    at: [0, 0.33, 0.0275],
    dir: [0, 0, 1],
    axis: "z",
    texture: LABEL,
  });

  // =============================================================================================================
  // SKELETON: hips, spine, neck, head
  const P0 = V(0, Y0 + 0.86, -0.24);
  const P1 = V(0, Y0 + 1.1, -0.14);
  const P2 = V(0, Y0 + 1.38, 0.0);
  const P3 = V(0, Y0 + 1.58, 0.12);
  const hips = b.joint("hips", { parent: root, at: P0, dir: [0, 1, 0.4], role: "spine" });
  const spine = b.chain("spine", catmull([P0, P1, P2, P3]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const torso = b.loft(
    [
      { at: P0, w: 0.38, h: 0.34 },
      { at: P1, w: 0.44, h: 0.38 },
      { at: P2, w: 0.68, h: 0.46 },
      { at: P3, w: 0.58, h: 0.34 },
      { at: V(0, Y0 + 1.66, 0.16), w: 0.36, h: 0.26 },
    ],
    {
      bone: spine,
      color: furEdge(CREAMC, FUR, { axis: [0, 0, 1], level: 0.05, teeth: 0.3, period: 0.05, along: [1, 0, 0] }),
    },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), FUR, { bone: hips, at: P0.clone().add(V(0, -0.04, -0.03)), scale: [0.2, 0.17, 0.2] });

  // neck and head
  const N2 = V(0, Y0 + 1.78, 0.26);
  const neck = b.chain("neck", catmull([P3, V(0, Y0 + 1.7, 0.18), N2]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.sweep(neck, [0.16, 0.1], { color: FUR });
  const head = b.joint("head", { parent: neck.joints[1], at: N2, dir: [0, 0.1, 1], role: "head" });
  const hl = (forward: number, up: number, left = 0) => head.local({ forward, up, left });

  b.part(new THREE.SphereGeometry(1, 10, 8), FUR, { bone: head, at: hl(0.07, 0.06), scale: [0.125, 0.12, 0.135] });

  // glowing compound eyes
  for (const s of [1, -1]) {
    const c = hl(0.1, 0.075, s * 0.1);
    const eye = b.part(new THREE.SphereGeometry(1, 12, 9), "#ff2418", {
      bone: head,
      at: c,
      scale: [0.07, 0.1, 0.085],
      rotation: [0, 0, -s * 12],
    });
    glow(eye, 1.3);
    const hit = b.surface(eye).around(c).at(s * 38, 4);
    if (hit) {
      const d = b.decal(eye, EYE, { at: hit, up: [0, 1, 0], size: [0.12, 0.155], segments: 10, lift: 0.002 });
      glow(d, 1.4);
    }
    // heavy angry brow
    b.capsule(hl(0.11, 0.185, s * 0.2), hl(0.18, 0.155, s * 0.03), 0.022, { bone: head, color: BROW });
  }

  // mouth parts: separate upper snout and lower jaw
  const jaw = b.joint("jaw", { parent: head, at: hl(0.12, -0.06), aim: hl(0.28, -0.07), role: "jaw" });
  b.frustumBox(hl(0.1, 0.0), hl(0.25, -0.03), [0.12, 0.1], [0.08, 0.06], { bone: head, color: SKIN });
  b.frustumBox(hl(0.1, -0.075), hl(0.23, -0.09), [0.1, 0.04], [0.06, 0.03], { bone: jaw, color: SKIN });
  for (const s of [1, -1])
    for (const f of [0.15, 0.2]) b.spike(hl(f, -0.062, s * 0.025), [0, 1, 0], 0.03, 0.008, { bone: jaw, color: TOOTH });

  // plumose antennae
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = catmull([
      head.local({ up: 0.15, left: s * 0.05, forward: 0.0 }),
      head.local({ up: 0.38, left: s * 0.17, forward: -0.04 }),
      head.local({ up: 0.54, left: s * 0.4, forward: -0.14 }),
    ]);
    const ant = b.chain(`antenna${side}`, path, {
      parent: head,
      names: [`antenna${side}1`, `antenna${side}2`],
      role: "tentacle",
    });
    b.sweep(ant, [0.02, 0.007], { color: ANT, sides: 5 });
    for (let i = 1; i <= 9; i++) {
      const t = i / 10;
      const pt = path.at(t);
      const tg = path.tangentAt(t);
      const len = 0.13 * (1 - 0.65 * t);
      const bone = ant.joints[t < 0.5 ? 0 : 1];
      for (const k of [1, -1]) {
        const lat = i % 2 ? V(0, 0, k) : V(k, 0, 0);
        const dir = lat.multiplyScalar(0.85).add(tg.clone().multiplyScalar(0.5)).normalize();
        b.spike(pt, dir, len, 0.008, { bone, color: i % 2 ? ANT_LIGHT : ANT });
      }
    }
  }

  // neck ruff and chest tufts
  const ruff = b.ring(neck.at(0.9), { count: 14, radius: 0.13 });
  b.cards(ruff.items, TUFT, { size: [0.07, 0.13], lean: 70, vary: 0.2, rng: rng(2), color: CREAMC });
  const chestHits = b
    .surface(torso)
    .scatter(200, { rng: rng(5), minDist: 0.045, filter: (h) => h.n.z > 0.2 && h.at.y > Y0 + 1.2 });
  b.cards(chestHits, TUFT, { size: [0.05, 0.1], lean: 55, bend: 25, vary: 0.3, rng: rng(6), color: CREAMC });
  const backHits = b
    .surface(torso)
    .scatter(140, { rng: rng(7), minDist: 0.05, filter: (h) => h.n.z < 0.2 && h.n.y > -0.3 });
  b.cards(backHits, TUFT, { size: [0.05, 0.1], lean: 60, bend: 20, vary: 0.3, rng: rng(8), color: FUR });

  // shoulder mantle
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { bone: chest, at: [s * 0.3, Y0 + 1.58, 0.04], scale: [0.17, 0.15, 0.17] });

  // moth abdomen / tail
  const tail = b.chain("tail", catmull([V(0, Y0 + 0.8, -0.3), V(0, Y0 + 0.7, -0.5), V(0, Y0 + 0.5, -0.72)]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });
  const abd = paint((_p, _n, s) => (Math.floor(s[0] * 8) & 1 ? FUR : CREAMC));
  b.sweep(tail, [0.11, 0.03], { color: abd, sides: 8 });

  // =============================================================================================================
  // LEGS (digitigrade) with gripping toes
  function digit(name: string, parent: Joint, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, r: number, color: ColorInput, claw: number) {
    const ch = b.chain(name, polyline([p0, p1, p2]), { parent, names: [`${name}a`, `${name}b`], role: "digit" });
    b.sweep(ch, [r, r * 0.55], { color, sides: 5 });
    const d = p2.clone().sub(p1).normalize();
    b.spike(p2, d, claw, r * 0.6, { bone: ch.joints[1], color: CLAW });
    return ch;
  }

  const legPts: Record<string, THREE.Vector3[]> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.2, Y0 + 0.84, -0.2], [s * 0.23, Y0 + 0.034, 0.1], [0.42, 0.42, 0.3], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    legPts[side] = pts;
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ball${side}`],
      contact: [s * 0.23, Y0, 0.15],
    });
    const legSweep = b.sweep(leg, [0.105, 0.085, 0.065, 0.045, 0.032], { color: FUR });
    const tufts = b.surface(legSweep).scatter(36, { rng: rng(20 + s), minDist: 0.045, filter: (h) => h.n.y > -0.2 });
    b.cards(tufts, TUFT, { size: [0.04, 0.085], lean: 60, bend: 20, vary: 0.3, rng: rng(30 + s), color: FUR });
    b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { bone: leg.joints[1], at: pts[1], scale: [0.09, 0.09, 0.09] });

    const B = pts[3];
    const ballJoint = leg.tip ?? leg.joints[2];
    [-30, 0, 30].forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const dir = V(Math.sin(a), 0, Math.cos(a));
      const mid = B.clone().addScaledVector(dir, 0.1).add(V(0, -0.004, 0));
      const tip = mid.clone().addScaledVector(dir, 0.075).add(V(0, -0.034, 0));
      digit(`toe${side}${i + 1}`, ballJoint, B.clone(), mid, tip, 0.028, SKIN, 0.06);
    });
    digit(`toe${side}4`, ballJoint, B.clone(), B.clone().add(V(0, -0.006, -0.09)), B.clone().add(V(0, -0.03, -0.15)), 0.026, SKIN, 0.05);
  }

  // =============================================================================================================
  // ARMS: hands rest on the knees
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const kn = legPts[side][1];
    const sh = V(s * 0.34, Y0 + 1.5, 0.04);
    const hand = V(kn.x + s * 0.14, kn.y + 0.1, kn.z + 0.02);
    const pts = limb(sh, hand, [0.52, 0.5], [[s, 0, -0.5]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    b.sweep(arm, [0.085, 0.065, 0.045], { color: FUR });
    b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { bone: arm.joints[1], at: pts[1], scale: [0.065, 0.065, 0.065] });
    const W = pts[2];
    const wristJoint = arm.tip ?? arm.joints[1];
    const F = V(0, -0.25, 1).normalize();
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
      bone: wristJoint,
      at: W.clone().addScaledVector(F, 0.04),
      scale: [0.055, 0.035, 0.065],
    });
    const offs = [s * 0.045, s * 0.015, -s * 0.015, -s * 0.045];
    const lens = [0.1, 0.115, 0.105, 0.08];
    offs.forEach((o, i) => {
      const thumb = i === 3;
      const d = thumb ? V(-s * 0.55, -0.2, 0.8).normalize() : F.clone();
      const p0 = W.clone().add(V(o, 0, 0)).addScaledVector(F, 0.05);
      const p1 = p0.clone().addScaledVector(d, lens[i] * 0.55);
      const p2 = p1.clone().addScaledVector(d, lens[i] * 0.5).add(V(0, -0.03, 0));
      digit(`finger${side}${i + 1}`, wristJoint, p0, p1, p2, 0.017, SKIN, 0.05);
    });
  }

  // =============================================================================================================
  // WINGS (spread in a V, forewing + hindwing, painted eyespots)
  const FORE: OP[] = [
    [0, 0], [0.5, -0.04], [1.0, -0.03], [1.45, 0.05], [1.88, 0.24, "sharp"], [1.8, 0.5], [1.72, 0.64],
    [1.62, 0.6], [1.58, 0.84], [1.4, 0.97], [1.28, 0.88], [1.1, 1.04], [0.8, 1.0], [0.45, 0.95], [0.12, 0.72], [0, 0.4],
  ];
  const HIND: OP[] = [
    [0, 0.55], [0.6, 0.68], [1.2, 0.86], [1.5, 1.1], [1.58, 1.38], [1.45, 1.62], [1.3, 2.05, "sharp"], [1.1, 1.75],
    [0.62, 1.62], [0.32, 1.3], [0, 1.0],
  ];
  const foreFill = wingPaint([[1.1, 0.5, 0.2]], 3);
  const hindFill = wingPaint([[0.9, 1.15, 0.2]], 5);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const WR = V(s * 0.26, Y0 + 1.52, -0.14);
    const xd = V(s * 0.93, 0.36, -0.1).normalize();
    const back = V(0, 0, -1);
    const yd = back.clone().sub(xd.clone().multiplyScalar(back.dot(xd))).normalize();
    const U = xd.clone().cross(yd);
    if (U.y < 0) U.negate();
    const wp = (u: number, v: number) => WR.clone().addScaledVector(xd, u).addScaledVector(yd, v);

    const wing = b.chain(`wing${side}`, catmull([wp(0, 0.05), wp(0.5, 0.0), wp(1.1, 0.0), wp(1.8, 0.2)]), {
      parent: chest,
      names: [`wing${side}1`, `wing${side}2`, `wing${side}3`],
      role: "wing",
    });
    const spar = b.sweep(wing, [0.055, 0.012], { color: FUR });
    const fuzz = b.surface(spar).scatter(30, { rng: rng(40 + s), minDist: 0.06, filter: (h) => h.n.y > -0.2 });
    b.cards(fuzz, TUFT, { size: [0.05, 0.11], lean: 70, bend: 20, vary: 0.3, rng: rng(50 + s), color: FUR });

    b.extrude(HIND, {
      at: WR.clone().addScaledVector(U, -0.016),
      x: xd,
      y: yd,
      thickness: 0.012,
      color: hindFill,
      bone: wing.joints[0],
    });
    b.extrude(FORE, { at: WR, x: xd, y: yd, thickness: 0.012, color: foreFill, bone: wing.joints[1] });
  }

  return b.root;
}
```