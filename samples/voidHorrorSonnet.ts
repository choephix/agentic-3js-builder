import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, gradient, mottle, paint, scales } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { svg } from "../src/texture";
import type { Chain, Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";

export const meta = {
  name: "Void Horror",
  description:
    "A hulking carapaced void beast on four tentacle legs: one great glowing eye under a spiked brow, a split maw with bone teeth, huge armoured claws, arching dorsal tendrils and a stinger tail, lit by magenta void sigils.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------------
const VOID_DARK = "#1c0e36";
const VOID_MID = "#38207a";
const VOID_HI = "#6a45c8";
const VOID_EDGE = "#a77bff";
const CHITIN = ["#3a2282", "#5a38b8", "#7a52d8"];
const FLESH = "#6b2b95";
const FLESH_HI = "#8d3fb4";
const FLESH_DARK = "#3d1760";
const BELLY = "#d29be6";
const UNDER = "#8a4aa8";
const BONE = "#efe3c6";
const BONE_DARK = "#b8a57f";
const MAG = "#ff2fd6";
const MAG_DEEP = "#a1138a";

// ---- drawings ------------------------------------------------------------------------------------------------
// Great eye, drawn twice as wide as it looks (it wraps once round a sphere).
const streaks = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const x1 = 128 + Math.cos(a) * 14;
  const y1 = 64 + Math.sin(a) * 14;
  const x2 = 128 + Math.cos(a) * 33;
  const y2 = 64 + Math.sin(a) * 33;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#7d1670" stroke-width="1.7" opacity="0.7"/>`;
}).join("");
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
  <defs>
    <radialGradient id="iris" cx="128" cy="64" r="38" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff6b0"/><stop offset="0.4" stop-color="#ffc933"/>
      <stop offset="0.75" stop-color="#ff2fd6"/><stop offset="1" stop-color="#7a0f8c"/>
    </radialGradient>
    <radialGradient id="vig" cx="128" cy="64" r="66" gradientUnits="userSpaceOnUse">
      <stop offset="0.55" stop-color="#1a0630" stop-opacity="0"/><stop offset="1" stop-color="#1a0630" stop-opacity="0.92"/>
    </radialGradient>
  </defs>
  <rect width="256" height="128" fill="#f7dcff"/>
  <g fill="none" stroke="#c42fb4" stroke-width="1.7" stroke-linecap="round" opacity="0.8">
    <path d="M96 64 C84 56 76 46 70 30"/><path d="M92 68 C80 70 70 78 62 92"/><path d="M98 60 C90 46 92 36 88 22"/>
    <path d="M160 64 C172 56 180 46 186 30"/><path d="M164 68 C176 70 186 78 194 92"/><path d="M158 60 C166 46 164 36 168 22"/>
    <path d="M110 40 C104 30 104 22 100 12"/><path d="M146 88 C152 98 152 106 156 116"/>
  </g>
  <circle cx="128" cy="64" r="40" fill="#2a0a40"/>
  <circle cx="128" cy="64" r="37" fill="url(#iris)"/>
  ${streaks}
  <circle cx="128" cy="64" r="37" fill="none" stroke="#3a0a50" stroke-width="2.2"/>
  <ellipse cx="128" cy="64" rx="7" ry="29" fill="#10031c"/>
  <ellipse cx="128" cy="64" rx="3" ry="22" fill="#000000"/>
  <circle cx="114" cy="48" r="6" fill="#ffffff" opacity="0.95"/>
  <circle cx="142" cy="82" r="3" fill="#ffffff" opacity="0.8"/>
  <rect width="256" height="128" fill="url(#vig)"/>
</svg>`,
  { size: 768 },
);

// Void sigil for the carapace and flanks.
const spokes = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const p = (r: number) => `${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)}`;
  return i % 2 === 0
    ? `<path d="M${p(52)} L${p(70)}" stroke="#ff2fd6" stroke-width="2.4"/><path d="M${p(76)} L${p(92)}" stroke="#ffffff" stroke-width="2.4"/>`
    : `<path d="M${p(60)} L${p(84)}" stroke="#ff2fd6" stroke-width="2.4"/>`;
}).join("");
const SIGIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="95" stroke="#ff2fd6" stroke-width="3"/>
    <circle cx="100" cy="100" r="88" stroke="#ff2fd6" stroke-width="1.6" stroke-dasharray="6 5"/>
    <circle cx="100" cy="100" r="48" stroke="#ff2fd6" stroke-width="3"/>
    ${spokes}
    <path d="M100 52 L140 100 L100 148 L60 100 Z" stroke="#ffffff" stroke-width="2.6"/>
    <path d="M100 66 L126 100 L100 134 L74 100 Z" stroke="#ff2fd6" stroke-width="2.4"/>
    <path d="M30 100 L52 100 M148 100 L170 100 M100 30 L100 52 M100 148 L100 170" stroke="#ffffff" stroke-width="2.6"/>
  </g>
  <ellipse cx="100" cy="100" rx="9" ry="16" fill="#ffc933"/>
  <ellipse cx="100" cy="100" rx="3" ry="12" fill="#150a28"/>
</svg>`,
  { size: 512 },
);

// Crystal shard card.
const SHARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#5b1f9e"/><stop offset="0.55" stop-color="#d02fe0"/><stop offset="1" stop-color="#ffc0f5"/>
  </linearGradient></defs>
  <path d="M4 63 L10 22 L16 1 L23 24 L28 63 Z" fill="url(#g)"/>
  <path d="M16 1 L16 63" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.6"/>
  <path d="M10 22 L16 40 L23 24" fill="none" stroke="#2a0a4a" stroke-opacity="0.5" stroke-width="1.6"/>
</svg>`,
  { size: 128 },
);

// ---- helpers -------------------------------------------------------------------------------------------------
type Key = [number, number, number];
function keyed(keys: Key[], t: number): [number, number] {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k0 = keys[i - 1];
      const k1 = keys[i];
      const u = Math.min(1, Math.max(0, (t - k0[0]) / (k1[0] - k0[0])));
      const e = u * u * (3 - 2 * u);
      return [k0[1] + (k1[1] - k0[1]) * e, k0[2] + (k1[2] - k0[2]) * e];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
}

const BODY: Key[] = [
  [0, 0.26, 0.22],
  [0.08, 0.5, 0.46],
  [0.2, 0.63, 0.54],
  [0.42, 0.72, 0.62],
  [0.62, 0.72, 0.62],
  [0.8, 0.63, 0.55],
  [0.92, 0.52, 0.47],
  [1, 0.46, 0.42],
];

export default function build() {
  const b = createBuilder({ name: "voidHorror", paintSize: 2048 });
  const rnd = rng(11);

  // ---- skeleton: spine, body skin -------------------------------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 1.0, -0.85], role: "spine" });
  const bodyPath = catmull([
    [0, 1.02, -1.5],
    [0, 1.0, -0.85],
    [0, 1.25, -0.3],
    [0, 1.55, 0.15],
    [0, 1.8, 0.5],
    [0, 1.92, 0.78],
  ]);
  const rootT = bodyPath.closestT(pelvis.at);
  const spine = b.chain("spine", bodyPath.slice(rootT, 0.8), {
    parent: pelvis,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const abdomen = b.chain("abdomen", bodyPath.slice(rootT, 0), {
    parent: pelvis,
    count: 2,
    names: ["abdomen1", "abdomen2"],
    role: "spine",
  });
  const neckC = b.chain("neck", bodyPath.slice(0.8, 1), {
    parent: spine.joints[2],
    count: 1,
    names: ["neck"],
    role: "neck",
  });
  const E: [number, number, number] = [0, 2.0, 1.14];
  const head = b.joint("head", { parent: neckC.joints[0], at: bodyPath.at(1), aim: [0, 1.95, 1.6], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.46, 0.85], aim: [0, 1.22, 1.42], role: "jaw" });
  const lidU = b.joint("lidU", { parent: head, at: E, aim: [0, 2.6, E[2]], role: "hinge" });
  const lidL = b.joint("lidL", { parent: head, at: E, aim: [0, 1.4, E[2]], role: "hinge" });

  const bodyBones = [abdomen, pelvis, spine, neckC];
  const fleshSkin = countershade(mottle(FLESH, FLESH_HI, { size: 0.22, seed: 3 }), BELLY, { level: -0.25, soft: 0.5 });
  const body = b.sweep(bodyPath, (t) => keyed(BODY, t), {
    bone: bodyBones,
    sides: 8,
    color: fleshSkin,
  });

  // carapace bands, flared at the back edge so each one laps over the next
  const plates: Sweep[] = [];
  const PLATE_A = (i: number) => 0.17 + i * 0.115;
  const PLATE_B = (i: number) => PLATE_A(i) + 0.15;
  for (let i = 0; i < 6; i++) {
    const a = PLATE_A(i);
    const bb = PLATE_B(i);
    const base = countershade(mottle("#4b2ba8", "#8a62f0", { size: 0.34, seed: i + 1, contrast: 1.1 }), VOID_DARK, {
      level: -0.65,
      soft: 0.45,
    });
    const col = paint((_p, _n, s) => {
      const u = (s[0] - a) / (bb - a);
      if (u > 0.94) return MAG;
      if (u > 0.84) return BONE;
      if (u > 0.8) return VOID_DARK;
      if (u < 0.05) return VOID_DARK;
      return base;
    });
    plates.push(
      b.sweep(
        bodyPath,
        (t) => {
          const u = (t - a) / (bb - a);
          const [rx, ry] = keyed(BODY, t);
          const k = 1.07 + 0.1 * u;
          return [rx * k, ry * k];
        },
        {
          from: a,
          to: bb,
          bone: bodyBones,
          caps: "flat",
          sides: 8,
          shift: (t) => [0, 0.03 + 0.05 * ((t - a) / (bb - a))],
          color: col,
          sectors: [[105, 255, UNDER]],
        },
      ),
    );
  }
  const skin = b.surface(plates);
  // dorsal spikes: one tall on the midline, two smaller on each flank
  plates.forEach((pl, i) => {
    const t = PLATE_A(i) + 0.62 * (PLATE_B(i) - PLATE_A(i));
    const sz = 1 - Math.abs(i - 2.2) * 0.12;
    b.stick(new THREE.ConeGeometry(0.075 * sz, 0.36 * sz, 6), BONE, pl.at(t, 0), { embed: 0.15 });
    for (const s of [1, -1]) {
      b.stick(new THREE.ConeGeometry(0.05 * sz, 0.2 * sz, 6), BONE, pl.at(t, s * 48), { embed: 0.15 });
      b.stick(new THREE.ConeGeometry(0.035 * sz, 0.13 * sz, 5), BONE_DARK, pl.at(t, s * 78), { embed: 0.15 });
    }
  });
  // glowing seams drawn over the carapace
  const seam = (pts: number[][], r: number) =>
    glow(b.sweep(skin.drape(catmull(pts), { lift: 0.012 }), r, { color: MAG, sides: 5, caps: "round", bone: spine.joints[1] }));
  seam(
    [
      [0, 2.5, -1.15],
      [0, 2.5, -0.7],
      [0, 2.5, -0.2],
      [0, 2.5, 0.25],
    ],
    0.02,
  );
  for (const s of [1, -1]) {
    seam(
      [
        [s * 0.28, 2.4, -1.05],
        [s * 0.42, 2.3, -0.7],
        [s * 0.3, 2.4, -0.45],
        [s * 0.48, 2.25, -0.15],
        [s * 0.4, 2.3, 0.2],
      ],
      0.011,
    );
    seam(
      [
        [s * 0.6, 1.9, -1.0],
        [s * 0.7, 1.75, -0.7],
        [s * 0.62, 1.7, -0.35],
        [s * 0.74, 1.6, 0.0],
        [s * 0.66, 1.65, 0.3],
      ],
      0.01,
    );
  }
  // sigils: one on the back (seen from above), one per flank
  const back = skin.ray([0, 3, -0.45], [0, -1, 0]);
  if (back)
    glow(
      b.decal(skin, SIGIL, {
        at: back.at,
        dir: [0, 1, 0],
        up: [0, 0, 1],
        size: [1.1, 1.1],
        segments: 16,
        lift: 0.02,
        bone: spine.joints[1],
      }),
    );
  for (const s of [1, -1]) {
    const flank = b.surface(body).ray([s * 3, 1.25, -0.5], [-s, 0, 0]);
    if (flank)
      glow(
        b.decal(body, SIGIL, {
          at: flank.at,
          dir: [s, 0, 0],
          size: [0.5, 0.5],
          segments: 12,
          lift: 0.01,
          mirror: s > 0,
          bone: spine.joints[1],
        }),
      );
  }

  // ---- generic tentacle -----------------------------------------------------------------------------------------
  const ringed = (base: ColorInput, len: number) =>
    paint((_p, _n, s) => (((s[0] * len) / 0.17) % 1 < 0.13 ? FLESH_DARK : base));
  const skinFor = (seed: number, len: number) =>
    ringed(countershade(mottle(FLESH, FLESH_HI, { size: 0.15, seed }), BELLY, { level: -0.3, soft: 0.5 }), len);
  const tentacle = (
    name: string,
    pts: number[][],
    parent: Joint,
    o: { count: number; r0: number; r1: number; seed: number },
  ) => {
    const path = catmull(pts);
    const ch = b.chain(name, path, { parent, count: o.count, role: "tentacle" });
    const rad = (t: number) => o.r0 * Math.pow(1 - t, 1.15) + o.r1;
    const sw = b.sweep(ch, rad, { sides: 8, color: skinFor(o.seed, path.length), caps: { start: "round", end: "point" } });
    return { ch, sw, rad, path };
  };
  const sleeve = (t: { ch: Chain; rad: (t: number) => number }, to: number, seed: number) => {
    const col = scales(CHITIN, VOID_DARK, { size: 0.12, width: 0.16, seed });
    b.sweep(t.ch, (x) => t.rad(x) * 1.2 + 0.015, {
      from: 0,
      to,
      sides: 8,
      caps: "flat",
      color: col,
    });
    const cp = t.ch.at(to);
    b.part(new THREE.TorusGeometry(t.rad(to) * 1.2 + 0.015, 0.032, 5, 10), BONE, { frame: cp, dir: cp.tangent, axis: "z" });
  };
  const spikeRow = (sw: Sweep, n: number, ang: number, len: number, rr: number, from: number, to: number, color = BONE) => {
    for (let i = 0; i < n; i++) {
      const t = from + ((to - from) * (i + 0.5)) / n;
      const k = 1 - t;
      b.stick(new THREE.ConeGeometry(rr * (0.4 + 0.6 * k) + 0.008, len * (0.35 + 0.65 * k), 6), color, sw.at(t, ang), {
        embed: 0.15,
      });
    }
  };

  // ---- four tentacle legs ---------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const front = tentacle(
      `legF${S}`,
      [
        [s * 0.5, 1.05, 0.1],
        [s * 1.05, 0.98, 0.3],
        [s * 1.5, 0.66, 0.6],
        [s * 1.8, 0.22, 0.85],
        [s * 2.15, 0.09, 1.1],
        [s * 2.35, 0.06, 1.4],
        [s * 2.2, 0.045, 1.72],
      ],
      spine.joints[0],
      { count: 6, r0: 0.21, r1: 0.04, seed: 20 + (s > 0 ? 0 : 1) },
    );
    sleeve(front, 0.4, 30);
    spikeRow(front.sw, 6, 0, 0.17, 0.05, 0.08, 0.72);
    spikeRow(front.sw, 4, s * 55, 0.1, 0.035, 0.12, 0.6, BONE_DARK);
    const rear = tentacle(
      `legR${S}`,
      [
        [s * 0.55, 1.0, -0.85],
        [s * 1.1, 0.92, -0.95],
        [s * 1.55, 0.62, -1.2],
        [s * 1.85, 0.22, -1.45],
        [s * 2.15, 0.09, -1.75],
        [s * 2.25, 0.06, -2.1],
        [s * 2.0, 0.045, -2.4],
      ],
      pelvis,
      { count: 6, r0: 0.22, r1: 0.04, seed: 24 + (s > 0 ? 0 : 1) },
    );
    sleeve(rear, 0.4, 34);
    spikeRow(rear.sw, 6, 0, 0.17, 0.05, 0.08, 0.72);
    spikeRow(rear.sw, 4, s * 55, 0.1, 0.035, 0.12, 0.6, BONE_DARK);
    for (const leg of [front, rear]) {
      const hits = [0.5, 0.58, 0.66, 0.74].map((t) => leg.sw.at(t, 0));
      glow(b.cards(hits, SHARD, { size: [0.05, 0.14], lean: 20, flow: [0, 0, -1], vary: 0.2, rng: rnd }));
      glow(
        b.sweep(leg.sw.line(s * 32, 0.012).slice(0.3, 0.95), 0.011, {
          color: MAG,
          sides: 4,
          caps: "round",
          bone: leg.ch,
        }),
      );
      const toe = leg.ch.at(1);
      glow(b.part(new THREE.IcosahedronGeometry(0.055, 0), MAG, { bone: toe.bone as Joint, at: toe.at, flat: true }), 1.4);
    }
  }

  // ---- arms and claws -------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.75, 1.95, 0.35],
        [s * 1.25, 1.85, 0.6],
        [s * 1.7, 1.55, 0.8],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    const armSw = b.sweep(arm, [0.22, 0.21, 0.2, 0.15], {
      sides: 8,
      color: ringed(countershade(mottle(FLESH, FLESH_HI, { size: 0.15, seed: 8 }), BELLY, { level: -0.3, soft: 0.5 }), 1.2),
      caps: { start: "round", end: "flat" },
    });
    spikeRow(armSw, 3, 0, 0.14, 0.045, 0.58, 0.9);
    spikeRow(armSw, 2, s * 60, 0.09, 0.03, 0.6, 0.85, BONE_DARK);
    // forearm bracer, upper-arm cuff
    b.sweep(arm, 0.215, {
      from: 0.52,
      to: 0.92,
      section: { ngon: 6 },
      caps: "flat",
      color: scales(CHITIN, VOID_DARK, { size: 0.1, width: 0.16, seed: 40 }),
    });
    b.sweep(arm, (t) => 0.23 + 0.03 * Math.sin(t * 20), { from: 0.12, to: 0.3, caps: "flat", sides: 8, color: VOID_MID });
    for (const t of [0.52, 0.92]) {
      const cp = arm.at(t);
      glow(b.part(new THREE.TorusGeometry(0.22, 0.03, 5, 10), MAG, { frame: cp, dir: cp.tangent, axis: "z" }));
    }
    // pauldron
    const sh = arm.joints[0];
    b.part(new THREE.SphereGeometry(1, 8, 6), scales(CHITIN, VOID_DARK, { size: 0.15, seed: 50 }), {
      bone: sh,
      at: [s * 0.9, 2.1, 0.32],
      scale: [0.4, 0.3, 0.42],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.31, 0.04, 5, 12), VOID_EDGE, {
      bone: sh,
      at: [s * 0.9, 2.12, 0.32],
      rotation: [90, 0, 0],
      scale: [1.15, 1.2, 1],
    });
    b.spike([s * 0.9, 2.3, 0.28], [s * 0.35, 1, -0.25], 0.62, 0.11, { color: BONE, bone: sh, sides: 6 });
    b.spike([s * 1.15, 2.15, 0.3], [s * 1, 0.45, -0.1], 0.46, 0.09, { color: BONE, bone: sh, sides: 6 });
    b.spike([s * 0.95, 2.1, 0.62], [s * 0.2, 0.35, 1], 0.4, 0.08, { color: BONE_DARK, bone: sh, sides: 6 });
    glow(b.part(new THREE.OctahedronGeometry(0.055), MAG, { bone: sh, at: [s * 1.02, 2.3, 0.4] }));
    const studs = Array.from({ length: 12 }, (_, i) => {
      const ang = (i / 12) * Math.PI * 2;
      return new THREE.SphereGeometry(0.03, 5, 4).translate(s * 0.9 + Math.cos(ang) * 0.357, 2.158, 0.32 + Math.sin(ang) * 0.372);
    });
    b.part(mergeGeometries(studs), BONE, { bone: sh, at: [0, 0, 0] });
    // elbow horn
    b.spike(arm.joints[1], [s * 0.3, 0.45, -1], 0.42, 0.09, { color: BONE, bone: arm.joints[1], sides: 6 });
    // hand: palm and four clawed fingers
    const hand = arm.tip as Joint;
    b.part(new THREE.SphereGeometry(1, 10, 8), scales(CHITIN, VOID_DARK, { size: 0.12, seed: 55 }), {
      bone: hand,
      at: [s * 1.95, 1.5, 0.86],
      scale: [0.32, 0.25, 0.29],
      flat: true,
    });
    const fingers = [
      { dz: -0.2, dy: 0.05, k: 1 },
      { dz: 0.0, dy: 0.09, k: 1.12 },
      { dz: 0.2, dy: 0.05, k: 1 },
      { dz: -0.32, dy: -0.12, k: 0.7 },
    ];
    fingers.forEach((f, i) => {
      const fin = tentacle(
        `finger${S}${i + 1}`,
        [
          [s * 1.92, 1.5 + f.dy, 0.86 + f.dz * 0.6],
          [s * (1.92 + 0.32 * f.k), 1.52 + f.dy, 0.9 + f.dz * 1.2],
          [s * (1.92 + 0.6 * f.k), 1.43 + f.dy, 1.02 + f.dz * 1.5 + 0.06],
          [s * (1.92 + 0.72 * f.k), 1.2 + f.dy, 1.26 + f.dz * 1.5 + 0.1],
        ],
        hand,
        { count: 3, r0: 0.075 * f.k, r1: 0.022, seed: 60 + i },
      );
      const tip = fin.ch.at(1);
      b.spike(tip, tip, 0.2 * f.k, 0.036, { color: BONE, sides: 6 });
      spikeRow(fin.sw, 2, 0, 0.07, 0.03, 0.25, 0.7, BONE_DARK);
    });
  }

  // ---- dorsal tendrils with glowing bulbs -----------------------------------------------------------------------
  const dorsalDefs = [
    {
      n: "A",
      pts: (s: number) => [
        [s * 0.35, 1.7, -0.6],
        [s * 0.5, 2.55, -0.95],
        [s * 0.85, 2.95, -0.9],
        [s * 1.2, 3.05, -0.5],
        [s * 1.45, 2.85, -0.05],
        [s * 1.45, 2.55, 0.25],
      ],
    },
    {
      n: "B",
      pts: (s: number) => [
        [s * 0.7, 1.7, -0.7],
        [s * 1.2, 2.4, -1.15],
        [s * 1.75, 2.5, -1.0],
        [s * 2.15, 2.25, -0.6],
        [s * 2.2, 1.95, -0.2],
      ],
    },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const d of dorsalDefs) {
      const pts = d.pts(s);
      const dt = tentacle(`dorsal${d.n}${S}`, pts, spine.joints[0], {
        count: 5,
        r0: d.n === "A" ? 0.17 : 0.14,
        r1: 0.035,
        seed: 70 + (d.n === "A" ? 0 : 3),
      });
      sleeve(dt, 0.3, 80);
      // collar at the root
      const root = pts[0];
      b.part(new THREE.CylinderGeometry(0.2, 0.28, 0.2, 8), VOID_MID, {
        bone: spine.joints[0],
        at: [root[0], root[1] + 0.08, root[2]],
        flat: true,
      });
      glow(
        b.part(new THREE.TorusGeometry(0.22, 0.025, 4, 12), MAG, {
          bone: spine.joints[0],
          at: [root[0], root[1] + 0.16, root[2]],
          rotation: [90, 0, 0],
        }),
      );
      // suckers on the inner (belly) side, shards on the outer
      for (let i = 0; i < 7; i++) {
        const t = 0.32 + i * 0.09;
        const k = 1 - t;
        b.stick(new THREE.CylinderGeometry(0.04 * (0.5 + k), 0.04 * (0.5 + k), 0.03, 7), BELLY, dt.sw.at(t, 180), { embed: 0.5 });
      }
      spikeRow(dt.sw, 5, 0, 0.16, 0.045, 0.3, 0.85);
      const tip = dt.ch.at(1);
      glow(b.part(new THREE.IcosahedronGeometry(0.09, 0), MAG, { bone: tip.bone as Joint, at: tip.at, flat: true }), 1.5);
      b.ring(frame(tip.at, tip.tangent), { count: 5, radius: 0.09, tilt: 40 }, (it) =>
        b.spike(it, it, 0.14, 0.022, { color: BONE, sides: 4, bone: tip.bone as Joint }),
      );
      glow(
        b.cards(
          [0.45, 0.6, 0.75].map((t) => dt.sw.at(t, s * 90)),
          SHARD,
          { size: [0.05, 0.15], lean: 25, flow: [0, 0, -1], vary: 0.2, rng: rnd },
        ),
      );
    }
  }

  // ---- tail with plates and stinger -----------------------------------------------------------------------------
  const tailPts = [
    [0, 1.02, -1.25],
    [0, 0.88, -1.85],
    [0, 0.52, -2.45],
    [0, 0.3, -3.05],
    [0, 0.5, -3.55],
    [0, 0.98, -3.75],
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: abdomen.joints[1], count: 8, role: "tail" });
  const tailRad = (t: number) => 0.25 * Math.pow(1 - t, 1.1) + 0.04;
  const tailSw = b.sweep(tail, tailRad, {
    sides: 8,
    color: skinFor(90, tailPath.length),
    caps: { start: "round", end: "point" },
  });
  for (let i = 0; i < 5; i++) {
    const a = 0.04 + i * 0.13;
    const bb = a + 0.17;
    b.sweep(tail, (t) => tailRad(t) * (1.12 + 0.14 * ((t - a) / (bb - a))) + 0.01, {
      from: a,
      to: bb,
      sides: 8,
      caps: "flat",
      color: paint((_p, _n, s) => ((s[0] - a) / (bb - a) > 0.9 ? MAG_DEEP : scales(CHITIN, VOID_DARK, { size: 0.1, seed: i + 100 }))),
    });
  }
  spikeRow(tailSw, 7, 0, 0.2, 0.06, 0.06, 0.84);
  glow(
    b.cards(
      [0.2, 0.3, 0.4, 0.5, 0.6].map((t) => tailSw.at(t, 0)),
      SHARD,
      { size: [0.05, 0.16], lean: 30, flow: [0, 0, -1], vary: 0.2, rng: rnd },
    ),
  );
  const tailEnd = tail.at(1);
  glow(b.part(new THREE.IcosahedronGeometry(0.1, 0), MAG, { frame: tailEnd, at: tailEnd.at, flat: true }), 1.5);
  b.spike(tailEnd, tailEnd, 0.6, 0.12, { color: gradient(BONE_DARK, BONE, tailEnd.at, [0, 1.5, -3.95]), sides: 6 });
  for (const s of [1, -1])
    b.sweep(
      bezier(tailEnd.at, [s * 0.2, tailEnd.at.y + 0.2, tailEnd.at.z - 0.15], [s * 0.3, tailEnd.at.y + 0.1, tailEnd.at.z + 0.1]),
      [0.07, 0.005],
      { color: BONE, sides: 5, caps: { start: "round", end: "point" }, bone: tailEnd.bone as Joint },
    );

  // ---- head ---------------------------------------------------------------------------------------------------
  const HC = (n: number) => scales(CHITIN, VOID_DARK, { size: 0.16, width: 0.16, seed: n });
  const EYE_R = 0.43;
  b.part(new THREE.SphereGeometry(1, 12, 9), HC(200), { bone: head, at: [0, 1.98, 0.7], scale: [0.74, 0.66, 0.7], flat: true });
  // cheek plates
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.32, -0.22],
        [0.34, -0.3],
        [0.62, -0.02, "sharp"],
        [0.3, 0.3],
        [-0.3, 0.26],
      ],
      { x: [0, 0, 1], at: [s * 0.64, 1.88, 0.8], thickness: 0.12, bevel: 0.03, color: HC(210), bone: head, smoothing: 1 },
    );
    b.spike([s * 0.72, 1.95, 0.72], [s * 1, 0.1, -0.2], 0.4, 0.08, { color: BONE_DARK, bone: head, sides: 6 });
  }
  // horn crown
  for (let k = -2; k <= 2; k++) {
    const ak = Math.abs(k);
    const base: [number, number, number] = [k * 0.2, 2.5 - ak * 0.08, 0.55 - ak * 0.05];
    const ctrl: [number, number, number] = [k * 0.38, 3.0 - ak * 0.12, 0.3];
    const tipP: [number, number, number] = [k * 0.55, 3.18 - ak * 0.25, -0.25 - ak * 0.03];
    b.sweep(bezier(base, ctrl, tipP), [0.1, 0.006], {
      bone: head,
      sides: 6,
      caps: { start: "round", end: "point" },
      color: gradient(VOID_MID, BONE, base, tipP),
    });
  }
  // forehead void crystals
  [
    { x: 0, h: 0.5, tilt: 0 },
    { x: 0.16, h: 0.34, tilt: -22 },
    { x: -0.16, h: 0.34, tilt: 22 },
  ].forEach((c) => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.1), MAG, {
        bone: head,
        at: [c.x, 2.58 + c.h * 0.2, 0.98],
        scale: [0.8, c.h / 0.2, 0.8],
        rotation: [0, 0, c.tilt],
        flat: true,
      }),
      1.3,
    );
  });
  // eye: socket ring, eyeball, lids, brow plates
  glow(b.part(new THREE.SphereGeometry(EYE_R, 18, 14), "#ffffff", { bone: head, at: E, rotation: [8, -90, 0], texture: EYE }));
  b.part(new THREE.TorusGeometry(EYE_R + 0.06, 0.08, 5, 14), VOID_MID, { bone: head, at: [E[0], E[1], E[2] - 0.02], flat: true });
  glow(b.part(new THREE.TorusGeometry(EYE_R + 0.03, 0.018, 4, 18), MAG, { bone: head, at: [E[0], E[1], E[2] + 0.06] }));
  b.ring(frame([E[0], E[1], E[2] - 0.2], [0, 0, 1]), { count: 10, radius: EYE_R + 0.1, tilt: 32 }, (it) =>
    b.spike(it, it, 0.26, 0.055, { color: BONE, bone: head, sides: 5 }),
  );
  b.part(new THREE.SphereGeometry(EYE_R + 0.035, 14, 6, 0, Math.PI * 2, 0, 1.12), VOID_HI, { bone: lidU, at: E, flat: true });
  b.part(new THREE.SphereGeometry(EYE_R + 0.035, 14, 6, 0, Math.PI * 2, Math.PI - 0.9, 0.9), VOID_HI, {
    bone: lidL,
    at: E,
    flat: true,
  });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.0, 0.0],
        [0.2, 0.1],
        [0.52, 0.32, "sharp"],
        [0.42, 0.38],
        [0.18, 0.26],
        [0.0, 0.14],
      ],
      { at: [0, 2.3, 1.38], x: [s, 0, 0], thickness: 0.1, bevel: 0.025, color: BONE_DARK, bone: head, smoothing: 1 },
    );
  }
  // mouth: upper lip on the head, lower jaw on the jaw bone, glowing throat between
  glow(b.part(new THREE.SphereGeometry(1, 8, 6), MAG_DEEP, { bone: head, at: [0, 1.18, 1.0], scale: [0.38, 0.17, 0.3] }), 0.9);
  const lipPts = (y: number) => [
    [-0.46, y + 0.17, 0.82],
    [-0.42, y + 0.03, 1.12],
    [0, y - 0.03, 1.42],
    [0.42, y + 0.03, 1.12],
    [0.46, y + 0.17, 0.82],
  ];
  const upper = b.sweep(catmull(lipPts(1.42)), [0.11, 0.15, 0.17, 0.15, 0.11], { bone: head, sides: 6, color: HC(230) });
  const lower = b.sweep(catmull(lipPts(0.95)), [0.1, 0.13, 0.16, 0.13, 0.1], {
    bone: jaw,
    sides: 6,
    color: HC(231),
  });
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    const sz = 0.7 + 0.5 * Math.sin(t * Math.PI);
    b.stick(new THREE.ConeGeometry(0.04 * sz, 0.22 * sz, 5), BONE, upper.at(t, 180), { embed: 0.1 });
    b.stick(new THREE.ConeGeometry(0.04 * sz, 0.2 * sz, 5), BONE, lower.at(t, 0), { embed: 0.1 });
  }
  b.spike([0, 0.9, 1.42], [0, -0.5, 1], 0.4, 0.09, { color: BONE, bone: jaw, sides: 6 });
  // mandibles: curved pincers either side of the mouth
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const mand = b.chain(
      `mandible${S}`,
      catmull([
        [s * 0.55, 1.62, 0.85],
        [s * 0.88, 1.5, 1.15],
        [s * 0.78, 1.34, 1.52],
        [s * 0.4, 1.25, 1.8],
      ]),
      { parent: head, count: 3, role: "jaw" },
    );
    const mSw = b.sweep(mand, [0.11, 0.075, 0.012], {
      sides: 6,
      caps: { start: "round", end: "point" },
      color: gradient(VOID_HI, BONE, [s * 0.6, 1.6, 1], [s * 0.4, 1.25, 1.8]),
    });
    for (let i = 0; i < 4; i++) {
      const t = 0.35 + i * 0.16;
      b.stick(new THREE.ConeGeometry(0.025, 0.1, 4), BONE_DARK, mSw.at(t, -s * 90), { embed: 0.1 });
    }
  }
  // chin feelers
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    [0, 1].forEach((i) => {
      const f = tentacle(
        `feeler${S}${i + 1}`,
        [
          [s * (0.32 + i * 0.1), 1.1, 1.0 + i * 0.12],
          [s * (0.55 + i * 0.15), 0.9, 1.22 + i * 0.1],
          [s * (0.7 + i * 0.15), 0.62, 1.4 + i * 0.1],
          [s * (0.62 + i * 0.12), 0.34, 1.6 + i * 0.1],
        ],
        jaw,
        { count: 3, r0: 0.055, r1: 0.014, seed: 120 + i },
      );
      glow(b.part(new THREE.OctahedronGeometry(0.04), MAG, { bone: f.ch.joints[2], at: f.path.at(1) }));
    });
  }

  return b.root;
}
