import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, long-armed swamp troll in hand-painted Warcraft style: mossy teal hide, curled ivory tusks, a flaming mohawk, a gator-skull pauldron, rib-bone shoulder spikes, a necklace of claws and a glowing skull fetish, a bone-studded belt with voodoo doll and femur club, and a skull totem lashed to his back.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (hand-painted: saturated mid-tones, lit tops, cool shadow undersides)

const SK_HI = "#8fc58c";
const SK_A = "#4f9470";
const SK_B = "#3a7a63";
const SK_SH = "#235046";
const SK_WART = "#2d5f4b";
const SK_BELLY = "#b6c887";
const MOSS = "#7f9d33";
const MOSS_D = "#4d6c24";
const MUD = "#5d4b2f";
const MUD_D = "#3b3020";

const BONE = "#e9dfbd";
const BONE_D = "#c1aa78";
const BONE_SH = "#8b7850";
const TEETH = "#f4ecd4";
const CLAW = "#3a2d22";
const LEATHER = "#6d4529";
const LEATHER_D = "#3c2415";
const LEATHER_L = "#93613a";
const CLOTH = "#8f2d24";
const GOLD = "#e3ad38";
const GOLD_D = "#a8731f";
const TURQ = "#2fb8a8";
const RED = "#c93a2b";
const WOOD = "#6e4c2b";
const WOOD_D = "#45301c";
const MOUTH = "#4a1520";
const TONGUE = "#c44b59";
const EYE = "#ffd23a";
const EYE_SOCKET = "#1b2b24";
const GEM = "#5dffae";
const INK = "#1c1a16";
const DOLL = "#d1bd8e";
const CREAM = "#f1e6c0";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const skin = paint((p, n) => {
  const ax = Math.abs(p.x);
  let c: Rgb = mix(SK_B, SK_A, noise(p, 0.45, 3));
  c = mix(c, SK_HI, 0.5 * smoothstep(0.15, 1, n.y) * (0.5 + noise(p, 0.1, 7)));
  c = mix(c, SK_SH, 0.7 * smoothstep(0.05, -0.85, n.y));
  const cl = cells(p, 0.12, 11);
  if (cl.id > 0.7) c = mix(c, SK_WART, 0.5 * smoothstep(0.55, 0.15, cl.d1));
  // pale belly and throat
  if (p.y > 0.95 && p.y < 1.8)
    c = mix(c, SK_BELLY, 0.75 * smoothstep(0.15, 0.55, n.z) * smoothstep(0.45, 0.28, ax) * smoothstep(1.8, 1.55, p.y));
  // painted ab and sternum creases
  if (n.z > 0.25 && ax < 0.3 && p.y > 1.1 && p.y < 1.62) {
    const row = (p.y - 1.14) / 0.12;
    if (ax < 0.007 || Math.abs(row - Math.round(row)) < 0.05) c = mix(c, SK_SH, 0.8);
  }
  // tribal chest ink: nested chevrons
  if (n.z > 0.2 && ax < 0.42 && p.y > 1.5 && p.y < 1.98) {
    const v = (p.y + 0.9 * ax) / 0.075;
    if (v - Math.floor(v) < 0.16 && ax > 0.03) c = mix(c, "#1f4a52", 0.85);
  }
  // moss growing on the high ground
  const topness = smoothstep(0.35, 0.8, n.y) * smoothstep(1.55, 1.8, p.y);
  if (topness > 0.1 && noise(p, 0.2, 5) > 0.55) c = mix(c, noise(p, 0.05, 2) > 0.5 ? MOSS : MOSS_D, 0.9 * topness);
  // swamp mud up the legs and feet
  const sm = smoothstep(0.46, 0.1, p.y + (noise(p, 0.08, 4) - 0.5) * 0.22);
  if (sm > 0) c = mix(c, noise(p, 0.06, 6) > 0.55 ? MUD : MUD_D, 0.85 * sm);
  // war paint: slanted cream and red bars on the cheeks
  if (p.y > 1.96 && p.y < 2.16 && p.z > 0.6 && p.z < 0.9 && ax > 0.06) {
    const u = p.y - 2.02 - 0.55 * (ax - 0.1);
    if (Math.abs(u) < 0.009) c = mix(c, CREAM, 0.95);
    else if (Math.abs(u + 0.03) < 0.007) c = mix(c, "#c93a2b", 0.95);
  }
  // white arm bands
  if (ax > 0.55 && p.y > 1.45 && p.y < 1.85) {
    const r = (p.y - 1.45) / 0.07;
    if (r - Math.floor(r) < 0.2) c = mix(c, CREAM, 0.9);
  }
  return c;
});

const hair = paint((_p, _n, s) => {
  let c: Rgb = mix("#6e1020", "#e8481f", smoothstep(0.05, 0.6, s[0]));
  c = mix(c, "#ffc040", smoothstep(0.55, 1, s[0]));
  return c;
});

const tusk = paint((p, _n, s) => {
  let c: Rgb = mix("#7a5a30", "#efe2b8", smoothstep(0, 0.4, s[0]));
  c = mix(c, "#fff8e0", 0.7 * smoothstep(0.7, 1, s[0]));
  if (Math.sin(s[0] * 64) > 0.92) c = mix(c, "#b79c62", 0.7);
  c = mix(c, "#c9a95e", 0.35 * noise(p, 0.03, 1) * (1 - s[0]));
  return c;
});

const bonePaint = paint((p, n) => {
  const c: Rgb = mix(BONE_D, BONE, noise(p, 0.05, 2));
  return mix(c, BONE_SH, 0.55 * smoothstep(0.1, -0.8, n.y));
});

const leather = paint((p, n) => {
  const c: Rgb = mix(LEATHER_D, LEATHER, noise(p, 0.03, 4));
  return mix(c, LEATHER_L, 0.4 * smoothstep(0.3, 1, n.y));
});

const wood = paint((p, n) => {
  const c: Rgb = mix(WOOD_D, WOOD, noise(p, 0.035, 8));
  return mix(c, "#8d6a40", 0.3 * smoothstep(0.3, 1, n.y));
});

const cloth = paint((p, n) => {
  const c: Rgb = mix("#6a1f1b", CLOTH, noise(p, 0.04, 6));
  return mix(c, "#c4503a", 0.3 * smoothstep(0.3, 1, n.y));
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const HAIR_TUFT = svg(
  `<svg viewBox="0 0 40 100">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#6e1020"/><stop offset="0.5" stop-color="#e5461f"/><stop offset="1" stop-color="#ffc040"/>
  </linearGradient></defs>
  <path d="M3 100 C1 60 7 30 14 3 C18 34 21 60 21 100Z" fill="url(#g)"/>
  <path d="M13 100 C13 60 18 24 28 0 C31 30 31 64 28 100Z" fill="url(#g)"/>
  <path d="M24 100 C26 70 31 46 38 22 C38 52 36 76 36 100Z" fill="url(#g)"/>
  <path d="M15 92 C15 62 17 32 23 10" stroke="#8d1c1c" stroke-width="2.4" fill="none"/>
</svg>`,
  { size: 128 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 40 120">
  <path d="M20 112 C0 96 -2 44 20 2 C42 44 40 96 20 112Z" fill="#1d9a8c"/>
  <path d="M20 2 C9 22 6 40 9 54 L31 54 C34 40 31 22 20 2Z" fill="#f2b134"/>
  <path d="M20 2 C14 14 12 24 12 30 L28 30 C28 24 26 14 20 2Z" fill="#d6402a"/>
  <path d="M20 118 L20 8" stroke="#f3e8c0" stroke-width="3"/>
  <path d="M20 50 L7 60 M20 66 L5 78 M20 82 L8 92 M20 50 L33 60 M20 66 L35 78 M20 82 L32 92" stroke="#0f6a60" stroke-width="2.2" fill="none"/>
</svg>`,
  { size: 192 },
);

const MOSS_TUFT = svg(
  `<svg viewBox="0 0 48 64">
  <path d="M4 64 C4 40 10 22 6 6 C16 22 18 44 20 64Z" fill="#5f8a2c"/>
  <path d="M14 64 C14 36 20 18 24 2 C30 20 32 42 30 64Z" fill="#7fa23a"/>
  <path d="M26 64 C28 40 34 26 44 10 C42 32 42 50 40 64Z" fill="#4f7324"/>
  <path d="M20 64 C20 48 24 34 28 20 C30 36 30 52 28 64Z" fill="#9dbb4a"/>
</svg>`,
  { size: 128 },
);

const HANG_MOSS = svg(
  `<svg viewBox="0 0 32 80">
  <path d="M10 80 C6 60 14 44 8 24 C6 14 10 6 12 0 C14 8 16 18 14 30 C12 46 18 62 16 80Z" fill="#7d9c4c"/>
  <path d="M18 80 C16 64 22 48 20 32 C19 20 22 10 25 2 C27 14 27 28 25 40 C23 56 28 66 26 80Z" fill="#5e7f38"/>
</svg>`,
  { size: 128 },
);

const LOIN = svg(
  `<svg viewBox="0 0 64 96">
  <g transform="rotate(180 32 48)">
    <path d="M4 0 H60 L62 70 L55 83 L50 72 L44 92 L36 76 L30 96 L24 78 L16 90 L10 72 L2 82 Z" fill="#8f2d24"/>
    <rect x="4" y="0" width="56" height="10" fill="#5a1c19"/>
    <rect x="4" y="10" width="56" height="3" fill="#e3ad38"/>
    <path d="M9 24 L32 56 L55 24" stroke="#e8b83c" stroke-width="4" fill="none"/>
    <path d="M15 24 L32 48 L49 24" stroke="#2fb8a8" stroke-width="4" fill="none"/>
    <circle cx="32" cy="30" r="7" fill="#e9dfbd"/>
    <circle cx="29.5" cy="29" r="2" fill="#1c1a16"/><circle cx="34.5" cy="29" r="2" fill="#1c1a16"/>
    <path d="M30 34 L34 34" stroke="#1c1a16" stroke-width="2"/>
    <path d="M8 66 L12 74 L16 66 M48 66 L52 74 L56 66" stroke="#e8b83c" stroke-width="3" fill="none"/>
    <path d="M6 16 V60 M58 16 V60" stroke="#c4503a" stroke-width="2.4" stroke-dasharray="3 3" fill="none"/>
  </g>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

type Piece = { g: THREE.BufferGeometry; p?: number[]; r?: number[]; s?: number[] };

const EAR: OutlinePoint[] = [
  [0, -0.04],
  [0.1, -0.065],
  [0.22, -0.03],
  [0.34, 0.015, "sharp"],
  [0.2, 0.045],
  [0.08, 0.07],
  [0, 0.05],
];

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const rand = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (seg = 10, h = 7) => new THREE.SphereGeometry(1, seg, h);

  // ---- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.15, -0.12], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.15, -0.12],
      [0, 1.42, -0.06],
      [0, 1.72, 0.12],
      [0, 1.94, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.94, 0.3],
      [0, 2.0, 0.4],
      [0, 2.05, 0.5],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.05, 0.5], dir: [0, -0.04, 1], role: "head" });
  const hp = (l: number, u: number, f: number) => V(l, 2.05 + u, 0.5 + f);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.08, 0.06), aim: hp(0, -0.15, 0.4), role: "jaw" });

  type Bone = typeof hips;
  const IDQ = new THREE.Quaternion();

  // ---- helpers -------------------------------------------------------------------------------------------------
  const pack = (pieces: Piece[], origin: THREE.Vector3, q: THREE.Quaternion) => {
    const base = new THREE.Matrix4().compose(origin, q, new THREE.Vector3(1, 1, 1));
    const out = pieces.map(({ g, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] }) => {
      const local = new THREE.Matrix4().compose(
        new THREE.Vector3(p[0], p[1], p[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG)),
        new THREE.Vector3(s[0], s[1], s[2]),
      );
      return g.applyMatrix4(base.clone().multiply(local));
    });
    return mergeGeometries(out)!;
  };
  const putPieces = (
    pieces: Piece[],
    origin: THREE.Vector3,
    q: THREE.Quaternion,
    color: string | typeof bonePaint,
    bone: Bone,
  ) => b.part(pack(pieces, origin, q), color, { bone, at: [0, 0, 0], flat: true });
  const beads = (pts: THREE.Vector3[], r: number, color: string, bone: Bone) =>
    b.part(
      mergeGeometries(pts.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p.x, p.y, p.z)))!,
      color,
      { bone, at: [0, 0, 0], flat: true },
    );
  const torus = (bone: Bone, at: THREE.Vector3, dir: THREE.Vector3, R: number, r: number, color: string) =>
    b.part(new THREE.TorusGeometry(R, r, 5, 12), color, { bone, at, dir, axis: "z", flat: true });

  // A small bone skull: cranium, snout, jaw, brow, sockets, teeth. Local +Z is the snout; `L` stretches the snout.
  const skull = (
    bone: Bone,
    c: THREE.Vector3,
    dir: number[],
    s: number,
    o: { L?: number; gem?: boolean; horns?: boolean } = {},
  ) => {
    const L = o.L ?? 1;
    const q = aim(dir, undefined, "z");
    const snoutZ = 0.05 + 0.17 * L;
    const pieces: Piece[] = [
      { g: sph(8, 6), p: [0, 0.09 * s, -0.1 * s], s: [0.3 * s, 0.28 * s, 0.32 * s] },
      { g: new THREE.BoxGeometry(0.2 * s, 0.15 * s, 0.34 * s * L), p: [0, -0.02 * s, snoutZ * s] },
      { g: new THREE.BoxGeometry(0.18 * s, 0.05 * s, 0.3 * s * L), p: [0, -0.115 * s, (0.05 + 0.13 * L) * s] },
      { g: new THREE.BoxGeometry(0.34 * s, 0.05 * s, 0.1 * s), p: [0, 0.2 * s, 0.02 * s], r: [-15, 0, 0] },
      { g: sph(6, 4), p: [0, 0.03 * s, (0.05 + 0.34 * L) * s], s: [0.07 * s, 0.05 * s, 0.05 * s] },
    ];
    if (o.horns)
      for (const sx of [1, -1])
        pieces.push({
          g: new THREE.ConeGeometry(0.05 * s, 0.3 * s, 5),
          p: [sx * 0.22 * s, 0.24 * s, -0.1 * s],
          r: [0, 0, -sx * 55],
        });
    putPieces(pieces, c, q, bonePaint, bone);
    const dark: Piece[] = [{ g: sph(6, 4), p: [0, 0.01 * s, (0.05 + 0.4 * L) * s], s: [0.04 * s, 0.025 * s, 0.025 * s] }];
    for (const sx of [1, -1]) dark.push({ g: sph(7, 5), p: [sx * 0.15 * s, 0.12 * s, 0.07 * s], s: [0.07 * s, 0.07 * s, 0.07 * s] });
    putPieces(dark, c, q, EYE_SOCKET, bone);
    const teeth: Piece[] = [];
    const cone = () => new THREE.ConeGeometry(0.018 * s, 0.06 * s, 4);
    const rows = Math.max(3, Math.round(4 * L));
    for (let i = 0; i < rows; i++)
      for (const sx of [1, -1]) {
        const z = (0.08 + (0.3 * L * (i + 0.5)) / rows) * s;
        teeth.push({ g: cone(), p: [sx * 0.095 * s, -0.12 * s, z], r: [180, 0, 0] });
        teeth.push({ g: cone(), p: [sx * 0.085 * s, -0.075 * s, z + 0.02 * s] });
      }
    putPieces(teeth, c, q, TEETH, bone);
    if (o.gem) {
      const gem: Piece[] = [];
      for (const sx of [1, -1]) gem.push({ g: sph(6, 4), p: [sx * 0.15 * s, 0.12 * s, 0.1 * s], s: [0.035 * s, 0.035 * s, 0.03 * s] });
      glow(putPieces(gem, c, q, GEM, bone), 1.6);
    }
  };

  // ---- torso ---------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 1.15, -0.14], w: 0.66, h: 0.52 },
      { at: [0, 1.38, 0.04], w: 0.72, h: 0.66 },
      { at: [0, 1.72, 0.12], w: 1.0, h: 0.82 },
      { at: [0, 1.94, 0.28], w: 0.92, h: 0.5 },
    ],
    { bone: [hips, spine], color: skin, sides: 10, name: "torso" },
  );
  const pecs = [1, -1].map((sx) =>
    b.part(sph(10, 7), skin, { bone: chest, at: [sx * 0.25, 1.78, 0.45], scale: [0.24, 0.19, 0.16] }),
  );
  const trap = b.part(sph(10, 7), skin, { bone: chest, at: [0, 1.98, 0.2], scale: [0.42, 0.2, 0.3], name: "trapezius" });
  b.sweep(neck, [0.18, 0.15], { color: skin, sides: 10, name: "neck" });
  const torsoSkin = b.surface([torso, trap, ...pecs]);

  // ---- legs ----------------------------------------------------------------------------------------------------
  for (const sx of [1, -1]) {
    const sd = sx > 0 ? "L" : "R";
    const pts = [V(sx * 0.3, 1.12, -0.1), V(sx * 0.35, 0.72, 0.26), V(sx * 0.33, 0.42, -0.02), V(sx * 0.32, 0.075, 0.34)];
    const leg = b.chain(`leg${sd}`, catmull(pts), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `ball${sd}`],
      role: "leg",
      contact: [sx * 0.32, 0, 0.45],
    });
    const knee = leg.joints[1];
    const hock = leg.joints[2];
    const ball = leg.joints[leg.joints.length - 1];
    const legTube = b.sweep(leg, [0.21, 0.2, 0.16, 0.145, 0.115, 0.095, 0.085], { color: skin, sides: 10, name: `leg${sd}` });
    b.part(sph(9, 6), skin, { bone: knee, at: [sx * 0.35, 0.74, 0.37], scale: [0.11, 0.12, 0.1] }); // kneecap
    b.part(sph(9, 6), skin, { bone: leg.joints[0], at: [sx * 0.3, 1.14, -0.1], scale: [0.23, 0.22, 0.24] }); // thigh root
    b.spike(V(sx * 0.33, 0.42, -0.07), [0, -0.25, -1], 0.14, 0.035, { color: CLAW, bone: hock, sides: 6 });
    // foot pad and toes
    b.part(sph(9, 6), skin, { bone: ball, at: [sx * 0.32, 0.075, 0.4], scale: [0.115, 0.075, 0.15], name: `pad${sd}` });
    const toes: Array<[string, number, number]> = [
      ["Mid", 0, 0.26],
      ["In", -sx * 0.38, 0.22],
      ["Out", sx * 0.38, 0.22],
    ];
    for (const [tn, bend, len] of toes) {
      const d = V(bend, 0, 1).normalize();
      const base = V(sx * 0.32, 0.064, 0.36).addScaledVector(d, 0.05);
      const p1 = base.clone().addScaledVector(d, len * 0.45);
      const p2 = base.clone().addScaledVector(d, len);
      p1.y = 0.062;
      p2.y = 0.056;
      const toe = b.chain(`toe${tn}${sd}`, catmull([base, p1, p2]), { parent: ball, role: "digit" });
      b.sweep(toe, [0.066, 0.05, 0.042], { color: skin, sides: 8 });
      const tipJ = toe.joints[toe.joints.length - 1];
      b.spike(p2, [d.x, -0.35, d.z], 0.1, 0.03, { color: CLAW, bone: tipJ, sides: 6 });
    }
    // dewclaw spur at the back of the foot
    // knee strap, shin bone ring, ankle ring
    const lskin = b.surface(legTube);
    const strap = lskin.loop(leg.at(0.42), { lift: 0.014 });
    b.sweep(strap, 0.024, { color: leather });
    const ankle = lskin.loop(leg.at(0.76), { lift: 0.012 });
    b.sweep(ankle, 0.02, { color: GOLD_D });
    beads(
      Array.from({ length: 8 }, (_, i) => ankle.at(i / 8).addScaledVector(V(0, 0.016, 0), 1)),
      0.022,
      BONE,
      hock,
    );
    const shin = lskin.loop(leg.at(0.55), { lift: 0.014 });
    b.sweep(shin, 0.02, { color: cloth });
  }

  // ---- arms and hands ------------------------------------------------------------------------------------------
  for (const sx of [1, -1]) {
    const sd = sx > 0 ? "L" : "R";
    const S = V(sx * 0.56, 1.92, 0.24);
    const E = V(sx * 0.88, 1.4, 0.3);
    const W = V(sx * 0.98, 0.9, 0.46);
    const arm = b.chain(`arm${sd}`, catmull([S, E, W]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const armTube = b.sweep(arm, [0.19, 0.165, 0.13, 0.145, 0.15, 0.115, 0.095], { color: skin, sides: 10, name: `arm${sd}` });
    b.part(sph(10, 7), skin, { bone: shoulder, at: S, scale: [0.22, 0.21, 0.22], name: `deltoid${sd}` });
    b.part(sph(9, 6), skin, { bone: elbow, at: [sx * 0.9, 1.4, 0.2], scale: [0.1, 0.1, 0.1] }); // elbow point

    // hand
    const D = W.clone().sub(E).normalize();
    b.part(sph(9, 7), skin, {
      bone: wrist,
      at: W.clone().addScaledVector(D, 0.1),
      dir: D,
      scale: [0.065, 0.12, 0.1],
      name: `palm${sd}`,
    });
    const base = W.clone().addScaledVector(D, 0.17);
    const fingers: Array<[string, number, number]> = [
      ["index", 0.058, 0.9],
      ["middle", 0.02, 1],
      ["ring", -0.02, 0.92],
      ["pinky", -0.056, 0.75],
    ];
    for (const [fn, zo, k] of fingers) {
      const p0 = base.clone().add(V(0, 0, zo));
      const p1 = p0.clone().addScaledVector(D, 0.085 * k);
      const p2 = p1.clone().addScaledVector(D, 0.07 * k).add(V(-sx * 0.02, 0, 0.004));
      const p3 = p2.clone().addScaledVector(D, 0.06 * k).add(V(-sx * 0.045, 0, 0.012));
      const f = b.chain(`${fn}${sd}`, catmull([p0, p1, p2, p3]), { parent: wrist, role: "digit" });
      b.sweep(f, [0.034, 0.03, 0.025, 0.019], { color: skin, sides: 6, detail: 0.7 });
      b.part(sph(6, 4), skin, { bone: f.joints[0], at: p0, scale: 0.036 });
      const tipJ = f.joints[f.joints.length - 1];
      b.spike(p3, [D.x - sx * 0.6, D.y, D.z + 0.2], 0.075, 0.018, { color: CLAW, bone: tipJ, sides: 5 });
    }
    {
      const t0 = W.clone().addScaledVector(D, 0.07).add(V(0, 0, 0.075));
      const t1 = t0.clone().add(V(-sx * 0.015, -0.04, 0.075));
      const t2 = t1.clone().add(V(-sx * 0.03, -0.05, 0.055));
      const th = b.chain(`thumb${sd}`, catmull([t0, t1, t2]), { parent: wrist, role: "digit" });
      b.sweep(th, [0.04, 0.034, 0.026], { color: skin, sides: 6, detail: 0.7 });
      b.spike(t2, [-sx * 0.3, -0.5, 0.8], 0.07, 0.02, { color: CLAW, bone: th.joints[th.joints.length - 1], sides: 5 });
    }

    // wraps, cuffs and bands on the arm
    const askin = b.surface(armTube);
    for (const [t, col, r] of [
      [0.66, cloth, 0.026],
      [0.72, cloth, 0.026],
      [0.78, leather, 0.024],
    ] as const) {
      b.sweep(askin.loop(arm.at(t), { lift: 0.014 }), r, { color: col });
    }
    const cuff = askin.loop(arm.at(0.9), { lift: 0.014 });
    b.sweep(cuff, 0.022, { color: GOLD_D });
    beads(
      Array.from({ length: 9 }, (_, i) => cuff.at(i / 9).add(V(0, 0.018, 0))),
      0.024,
      BONE,
      wrist,
    );
    const band = askin.loop(arm.at(0.24), { lift: 0.014 });
    b.sweep(band, 0.03, { color: leather });
    beads(
      Array.from({ length: 12 }, (_, i) => band.at(i / 12).add(V(0, 0.02, 0))),
      0.022,
      TURQ,
      shoulder,
    );

    if (sx < 0) {
      // right shoulder: gator-skull pauldron
      const sc = V(sx * 0.6, 2.18, 0.3);
      skull(shoulder, sc, [sx * 0.35, 0.28, 0.85], 0.62, { L: 1.7, gem: true });
      const ringPts = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return V(S.x + Math.cos(a) * 0.235, S.y + 0.05, S.z + Math.sin(a) * 0.235);
      });
      b.sweep(catmull(ringPts, { closed: true }), 0.022, { color: leather, bone: shoulder });
      for (const a of [0.9, 2.3, 4.0])
        beads([V(S.x + Math.cos(a) * 0.245, S.y + 0.05, S.z + Math.sin(a) * 0.245)], 0.03, GOLD, shoulder);
      // hanging moss off the skull
      b.cards(
        [V(-0.6, 2.05, 0.5), V(-0.5, 2.05, 0.52), V(-0.7, 2.06, 0.4), V(-0.4, 2.1, 0.3)].map((p) => frame(p, [0, 1, 0])),
        HANG_MOSS,
        { size: [0.08, 0.26], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: shoulder },
      );
    } else {
      // left shoulder: rib-bone spikes, feathers, wraps
      for (let k = 0; k < 3; k++) {
        const bs = S.clone().add(V(sx * (0.03 + 0.06 * k), 0.17, 0.08 - 0.07 * k));
        const tipP = bs.clone().add(V(sx * (0.12 + 0.05 * k), 0.22 + 0.07 * k, -0.1 - 0.05 * k));
        const ctrl = bs.clone().add(V(sx * 0.0, 0.18 + 0.03 * k, 0.04));
        b.sweep(bezier(bs, ctrl, tipP), [0.045, 0], {
          color: bonePaint,
          bone: shoulder,
          caps: { start: "flat", end: "point" },
          sides: 6,
        });
        torus(shoulder, bs.clone().add(V(0, 0.06, 0)), V(0, 1, 0), 0.04, 0.01, LEATHER_D);
        torus(shoulder, bs.clone().add(V(0, 0.1, 0)), V(0, 1, 0), 0.038, 0.01, GOLD_D);
      }
      const fb = S.clone().add(V(sx * 0.1, 0.2, 0.0));
      b.cards(
        [
          frame(fb, [0.5, 1, -0.2]),
          frame(fb, [0.9, 1, -0.5]),
          frame(fb, [0.2, 1, -0.6]),
          frame(fb, [1.3, 1, -0.1]),
        ],
        FEATHER,
        { size: [0.08, 0.34], lean: 12, flow: [0, 0, 1], vary: 0.15, rng: rand, bone: shoulder },
      );
      // mushrooms growing on the shoulder
      for (const [mx, mz, ms] of [
        [0.5, 0.06, 1],
        [0.42, -0.02, 0.7],
        [0.62, -0.04, 0.55],
      ] as const) {
        const baseP = V(mx, 2.08, mz + 0.18);
        b.part(new THREE.CylinderGeometry(0.014 * ms, 0.018 * ms, 0.07 * ms, 6), CREAM, {
          bone: shoulder,
          at: baseP.clone().add(V(0, 0.02 * ms, 0)),
          flat: true,
        });
        b.part(new THREE.SphereGeometry(0.045 * ms, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), RED, {
          bone: shoulder,
          at: baseP.clone().add(V(0, 0.06 * ms, 0)),
          flat: true,
        });
        beads(
          [V(0.012, 0.09, 0.02), V(-0.018, 0.085, -0.01), V(0.0, 0.098, -0.022)].map((o) =>
            baseP.clone().add(o.multiplyScalar(ms)),
          ),
          0.008 * ms,
          CREAM,
          shoulder,
        );
      }
    }
  }

  // ---- head ----------------------------------------------------------------------------------------------------
  const cranium = b.part(sph(12, 9), skin, { bone: head, at: hp(0, 0.08, 0.1), scale: [0.17, 0.16, 0.19], name: "cranium" });
  const muzzle = b.frustumBox(hp(0, -0.03, 0.2), hp(0, -0.04, 0.42), [0.28, 0.15], [0.24, 0.12], {
    color: skin,
    bone: head,
    name: "muzzle",
  });
  b.sweep(catmull([hp(0, 0.095, 0.26), hp(0, 0.09, 0.37), hp(0, 0.045, 0.46), hp(0, -0.01, 0.49)]), [0.05, 0.052, 0.04, 0.034], {
    color: skin,
    bone: head,
    sides: 8,
    name: "nose",
  });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.24), MOUTH, { bone: head, at: hp(0, -0.1, 0.28), name: "mouthDark" });
  for (const sx of [1, -1]) {
    // heavy brow, scowling
    b.capsule(hp(sx * 0.035, 0.105, 0.28), hp(sx * 0.17, 0.14, 0.17), 0.045, { color: skin, bone: head });
    // eye socket, glowing eye, slit pupil
    b.part(sph(8, 6), EYE_SOCKET, { bone: head, at: hp(sx * 0.088, 0.055, 0.272), scale: [0.043, 0.04, 0.034] });
    glow(b.part(sph(8, 6), EYE, { bone: head, at: hp(sx * 0.088, 0.055, 0.283), scale: [0.03, 0.028, 0.026] }), 1.5);
    b.part(sph(6, 4), INK, { bone: head, at: hp(sx * 0.088, 0.055, 0.307), scale: [0.006, 0.022, 0.005] });
    b.capsule(hp(sx * 0.05, 0.088, 0.295), hp(sx * 0.13, 0.065, 0.255), 0.016, { color: skin, bone: head });
    // cheekbone, nostril, jaw corner
    b.part(sph(8, 6), skin, { bone: head, at: hp(sx * 0.13, -0.02, 0.19), scale: 0.06 });
    b.part(sph(6, 4), INK, { bone: head, at: hp(sx * 0.026, -0.022, 0.488), scale: [0.012, 0.014, 0.01] });
    b.part(sph(8, 6), skin, { bone: jaw, at: hp(sx * 0.14, -0.13, 0.1), scale: 0.06 });
    // tusk
    const tp = bezier(hp(sx * 0.1, -0.14, 0.34), hp(sx * 0.18, -0.07, 0.42), hp(sx * 0.15, 0.1, 0.47));
    const tuskSweep = b.sweep(tp, [0.042, 0], { color: tusk, bone: jaw, caps: { start: "flat", end: "point" }, sides: 7, name: `tusk${sx > 0 ? "L" : "R"}` });
    const tpt = tuskSweep.at(0.58, 0);
    b.part(new THREE.TorusGeometry(0.026, 0.008, 5, 10), sx > 0 ? GOLD : BONE_SH, {
      bone: jaw,
      at: tpt.at,
      dir: tpt.tangent,
      axis: "z",
      flat: true,
    });
    // small upper canine
    b.spike(hp(sx * 0.07, -0.1, 0.4), [0, -1, 0.1], 0.05, 0.016, { color: TEETH, bone: head, sides: 5 });
    // ear with gold hoop
    const ex = V(sx * 0.5, 0.45, -0.75).normalize();
    b.extrude(EAR, { at: hp(sx * 0.15, 0.07, 0.05), x: ex.toArray(), thickness: 0.016, bevel: 0.004, color: skin, bone: head });
    torus(head, hp(sx * 0.17, 0.035, 0.03), V(sx, 0, 0), 0.032, 0.007, GOLD);
    torus(head, hp(sx * 0.18, 0.08, 0.01), V(sx, 0, 0), 0.02, 0.006, GOLD_D);
  }
  // nose ring
  torus(head, hp(0, -0.05, 0.475), V(1, 0, 0), 0.026, 0.006, GOLD);

  // lower jaw
  b.frustumBox(hp(0, -0.155, 0.1), hp(0, -0.17, 0.4), [0.3, 0.1], [0.2, 0.09], { color: skin, bone: jaw, name: "lowerJaw" });
  b.part(sph(9, 6), skin, { bone: jaw, at: hp(0, -0.175, 0.4), scale: [0.1, 0.06, 0.08], name: "chin" });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.2), TONGUE, { bone: jaw, at: hp(0, -0.115, 0.26) });
  {
    const lower: Piece[] = [];
    const upper: Piece[] = [];
    for (let i = 0; i < 5; i++)
      for (const sx of [1, -1]) {
        lower.push({ g: new THREE.ConeGeometry(0.014, 0.045, 4), p: [sx * (0.03 + 0.012 * i), -0.088, 0.18 + 0.05 * i] });
        upper.push({ g: new THREE.ConeGeometry(0.013, 0.04, 4), p: [sx * (0.04 + 0.012 * i), -0.115, 0.24 + 0.035 * i], r: [180, 0, 0] });
      }
    putPieces(lower, V(0, 2.05, 0.5), IDQ, TEETH, jaw);
    putPieces(upper, V(0, 2.05, 0.5), IDQ, TEETH, head);
  }
  // chin tendril with gold bead
  b.sweep(bezier(hp(0, -0.2, 0.4), hp(0, -0.3, 0.42), hp(0, -0.37, 0.38)), [0.028, 0.008], {
    color: skin,
    bone: jaw,
    caps: { start: "flat", end: "round" },
    sides: 6,
  });
  b.part(sph(6, 4), GOLD, { bone: jaw, at: hp(0, -0.375, 0.38), scale: 0.022 });

  // warts on the head
  {
    const hs = b.surface([cranium, muzzle]);
    for (const h of hs.scatter(9, { rng: rand, minDist: 0.07, filter: (x) => x.n.y > -0.2 }))
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), SK_WART, h, { embed: 0.4 });
  }

  // ---- mohawk --------------------------------------------------------------------------------------------------
  const crest = catmull([hp(0, 0.16, 0.29), hp(0, 0.235, 0.19), hp(0, 0.25, 0.04), hp(0, 0.205, -0.06), hp(0, 0.11, -0.1)]);
  b.sweep(crest, 0.03, { color: "#5a1219", bone: head, sides: 6, name: "scalpRidge" });
  const N = 12;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const base = crest.at(t);
    const len = 0.2 + 0.2 * Math.sin(Math.PI * (0.1 + 0.8 * t));
    const lean = 0.4 - 1.5 * t;
    const dirv = V(0, 1, lean).normalize();
    const tip = base.clone().addScaledVector(dirv, len);
    const mid = base.clone().addScaledVector(dirv, len * 0.55).add(V(0, 0, -0.05 - 0.04 * t));
    for (const [sxo, k] of [
      [0, 1],
      [0.032, 0.72],
      [-0.032, 0.72],
    ] as const) {
      const bb = base.clone().add(V(sxo, -Math.abs(sxo) * 0.6, 0));
      const tt = tip.clone().sub(base).multiplyScalar(k).add(bb).add(V(sxo * 0.8, 0, 0));
      const mm = mid.clone().sub(base).multiplyScalar(k).add(bb).add(V(sxo * 0.4, 0, 0));
      b.sweep(bezier(bb, mm, tt), [0.036 * k + 0.004, 0], {
        color: hair,
        bone: head,
        caps: { start: "flat", end: "point" },
        sides: 5,
        detail: 0.7,
      });
    }
    if (i === 2 || i === 6 || i === 9) {
      torus(head, base.clone().addScaledVector(dirv, 0.05), dirv, 0.045, 0.01, GOLD);
    }
  }
  b.cards(
    Array.from({ length: 16 }, (_, i) => frame(crest.at(i / 15).add(V(((i % 3) - 1) * 0.02, 0, 0)), [0, 1, 0])),
    HAIR_TUFT,
    { size: [0.07, 0.24], lean: 35, vary: 0.3, cross: true, rng: rand, bone: head },
  );
  // a few spikes continuing down the back
  for (let i = 0; i < 4; i++) {
    const sp = torso.at(0.55 + i * 0.12, 0);
    b.spike(sp, sp, 0.16 - i * 0.02, 0.03, { color: hair, bone: chest, sides: 5, detail: 0.7 });
  }

  // ---- necklace of claws and a skull fetish -------------------------------------------------------------------
  const necklace = torsoSkin.drape(
    catmull(
      [
        [0, 1.64, 0.6],
        [0.2, 1.84, 0.55],
        [0.26, 1.99, 0.38],
        [0, 2.07, 0.1],
        [-0.26, 1.99, 0.38],
        [-0.2, 1.84, 0.55],
      ],
      { closed: true },
    ),
    { lift: 0.02 },
  );
  b.sweep(necklace, 0.011, { color: LEATHER_D });
  const nb: THREE.Vector3[][] = [[], [], []];
  for (let i = 0; i < 44; i++) nb[i % 3].push(necklace.at(i / 44));
  beads(nb[0], 0.022, BONE, chest);
  beads(nb[1], 0.019, TURQ, chest);
  beads(nb[2], 0.02, RED, chest);
  for (const t of [0.05, 0.095, 0.905, 0.95]) {
    const pnt = necklace.at(t);
    b.spike(pnt.clone().add(V(0, 0, 0.01)), [0, -1, 0.25], 0.13, 0.02, { color: bonePaint, bone: chest, sides: 5 });
    torus(chest, pnt, V(0, 1, 0.3), 0.016, 0.005, GOLD);
  }
  {
    const pnt = necklace.at(0);
    b.rod(pnt, pnt.clone().add(V(0, -0.05, 0.02)), 0.008, { color: LEATHER_D, bone: chest, sides: 4 });
    skull(chest, pnt.clone().add(V(0, -0.12, 0.07)), [0, -0.25, 1], 0.2, { gem: true });
  }

  // ---- harness: bandolier, chest strap and belt ----------------------------------------------------------------
  const bandolier = torsoSkin.drape(
    catmull([
      [-0.3, 2.02, 0.28],
      [-0.12, 1.78, 0.62],
      [0.1, 1.52, 0.55],
      [0.36, 1.3, 0.4],
    ]),
    { lift: 0.02 },
  );
  b.sweep(bandolier, 0.03, { color: leather });
  beads(
    Array.from({ length: 9 }, (_, i) => bandolier.at(0.1 + (i / 8) * 0.8)),
    0.022,
    GOLD,
    chest,
  );
  {
    const claws: Piece[] = [];
    for (let i = 0; i < 6; i++) {
      const pp = bandolier.at(0.15 + i * 0.13);
      claws.push({ g: new THREE.ConeGeometry(0.02, 0.1, 5), p: [pp.x, pp.y - 0.06, pp.z + 0.02], r: [-10, 0, 0] });
    }
    putPieces(claws, V(0, 0, 0), IDQ, bonePaint, chest);
  }
  const strapLoop = torsoSkin.loop(V(0, 1.55, 0.1), { lift: 0.025 });
  b.sweep(strapLoop, 0.028, { color: leather });

  const beltLoop = b.surface(torso).loop(frame([0, 1.3, -0.02], [0, 1, 0.1]), { lift: 0.03 });
  b.sweep(beltLoop, (): [number, number] => [0.02, 0.055], { section: "box", color: leather, name: "belt" });
  const beltFront = beltLoop.at(beltLoop.closestT(V(0, 1.3, 0.8)));
  const beltBack = beltLoop.at(beltLoop.closestT(V(0, 1.3, -0.8)));
  const beltL = beltLoop.at(beltLoop.closestT(V(0.8, 1.3, 0.1)));
  const beltR = beltLoop.at(beltLoop.closestT(V(-0.8, 1.3, 0.1)));
  beads(
    Array.from({ length: 22 }, (_, i) => beltLoop.at(i / 22).add(V(0, 0.0, 0)).add(beltLoop.at(i / 22).sub(V(0, 1.3, -0.02)).setY(0).normalize().multiplyScalar(0.025))),
    0.016,
    GOLD,
    hips,
  );
  // skull buckle
  skull(hips, beltFront.clone().add(V(0, -0.01, 0.045)), [0, 0, 1], 0.2, {});
  // loincloth flaps and ragged skirt
  const front = beltFront.clone().add(V(0, 0.04, 0));
  b.cards([frame(front, [0, 1, 0])], LOIN, { size: [0.36, 0.5], lean: 180, flow: [0, 0, 1], bone: hips });
  b.cards([frame(beltBack.clone().add(V(0, 0.04, 0)), [0, 1, 0])], LOIN, { size: [0.4, 0.55], lean: 180, flow: [0, 0, -1], bone: hips });
  b.cards(
    [frame(beltL.clone().add(V(0, 0.03, 0)), [0, 1, 0]), frame(beltL.clone().add(V(0, 0.03, -0.12)), [0, 1, 0])],
    LOIN,
    { size: [0.2, 0.36], lean: 180, flow: [1, 0, 0], vary: 0.15, rng: rand, bone: hips, color: "#d9c9b0" },
  );
  b.cards(
    [frame(beltR.clone().add(V(0, 0.03, 0)), [0, 1, 0]), frame(beltR.clone().add(V(0, 0.03, -0.12)), [0, 1, 0])],
    LOIN,
    { size: [0.2, 0.36], lean: 180, flow: [-1, 0, 0], vary: 0.15, rng: rand, bone: hips, color: "#d9c9b0" },
  );
  b.cards(
    Array.from({ length: 10 }, (_, i) => frame(beltLoop.at(i / 10).add(V(0, 0.02, 0)), [0, 1, 0])),
    HANG_MOSS,
    { size: [0.09, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: hips },
  );

  // femur club on the right hip
  {
    const a = beltR.clone().add(V(-0.04, -0.03, 0.12));
    const e = V(-0.46, 0.86, 0.34);
    b.rod(a, e, [0.03, 0.036], { color: bonePaint, bone: hips, sides: 6 });
    b.part(sph(7, 5), bonePaint, { bone: hips, at: e, scale: [0.07, 0.07, 0.07], flat: true });
    b.part(sph(7, 5), bonePaint, { bone: hips, at: e.clone().add(V(-0.03, 0.02, 0.0)), scale: 0.055, flat: true });
    b.part(sph(7, 5), bonePaint, { bone: hips, at: a.clone().add(V(0, 0.01, 0)), scale: 0.045, flat: true });
    for (const k of [0.25, 0.45, 0.65]) {
      const pp = a.clone().lerp(e, k);
      b.spike(pp, [-1, 0.2, 0.3], 0.05, 0.014, { color: GOLD_D, bone: hips, sides: 4 });
      b.spike(pp, [0.2, 0.2, 1], 0.05, 0.014, { color: GOLD_D, bone: hips, sides: 4 });
    }
    torus(hips, a.clone().lerp(e, 0.12), e.clone().sub(a), 0.04, 0.012, LEATHER_D);
    torus(hips, a.clone().lerp(e, 0.8), e.clone().sub(a), 0.045, 0.012, LEATHER_D);
  }
  // voodoo doll on the left hip
  {
    const a = beltL.clone().add(V(0.04, -0.03, 0.1));
    const dp = V(0.42, 0.98, 0.3);
    b.rod(a, dp.clone().add(V(0, 0.08, 0)), 0.008, { color: LEATHER_D, bone: hips, sides: 4 });
    b.capsule(dp.clone().add(V(0, 0.03, 0)), dp.clone().add(V(0, -0.08, 0)), 0.045, { color: DOLL, bone: hips, sides: 7 });
    b.capsule(dp.clone().add(V(-0.07, 0.0, 0)), dp.clone().add(V(0.07, 0.0, 0)), 0.02, { color: DOLL, bone: hips, sides: 6 });
    b.part(sph(8, 6), DOLL, { bone: hips, at: dp.clone().add(V(0, 0.1, 0)), scale: 0.045 });
    for (const sx of [1, -1])
      b.part(sph(6, 4), INK, { bone: hips, at: dp.clone().add(V(sx * 0.018, 0.108, 0.04)), scale: 0.009 });
    b.rod(dp.clone().add(V(-0.025, 0.07, 0.04)), dp.clone().add(V(0.025, 0.085, 0.04)), 0.004, { color: INK, bone: hips, sides: 4 });
    b.rod(dp.clone().add(V(-0.03, 0.02, 0.043)), dp.clone().add(V(0.03, -0.04, 0.043)), 0.005, { color: RED, bone: hips, sides: 4 });
    b.rod(dp.clone().add(V(0.03, 0.02, 0.043)), dp.clone().add(V(-0.03, -0.04, 0.043)), 0.005, { color: RED, bone: hips, sides: 4 });
    for (const [px, py] of [
      [0.03, -0.03],
      [-0.03, 0.03],
    ]) {
      b.rod(dp.clone().add(V(px, py, 0.02)), dp.clone().add(V(px * 1.8, py + 0.03, 0.09)), 0.004, { color: BONE_SH, bone: hips, sides: 4 });
      b.part(sph(6, 4), RED, { bone: hips, at: dp.clone().add(V(px * 1.8, py + 0.03, 0.09)), scale: 0.01 });
    }
  }
  // pouch and tooth-string at the back
  {
    const pp = beltBack.clone().add(V(0.24, -0.1, 0));
    b.part(sph(8, 6), leather, { bone: hips, at: pp, scale: [0.07, 0.08, 0.06] });
    b.rod(pp.clone().add(V(0, 0.06, 0)), pp.clone().add(V(0, 0.09, 0)), 0.02, { color: LEATHER_D, bone: hips, sides: 6 });
    beads([pp.clone().add(V(0, 0.09, 0))], 0.02, GOLD, hips);
  }

  // ---- skull totem lashed to the back --------------------------------------------------------------------------
  {
    const B = V(0.06, 1.3, -0.38);
    const T = V(0.12, 2.5, -0.46);
    b.rod(B, T, [0.042, 0.032], { color: wood, bone: chest, sides: 6, name: "totemPole" });
    const P = (t: number) => B.clone().lerp(T, t);
    skull(chest, P(0.45).add(V(0, 0, 0.1)), [0, 0.15, 1], 0.22, { gem: true });
    skull(chest, P(0.7).add(V(0, 0, 0.09)), [-0.5, 0.1, 1], 0.18, { gem: true });
    skull(chest, P(0.92).add(V(0, 0, 0.08)), [0.4, 0.3, 1], 0.16, { gem: true, horns: true });
    // crossbar with hanging charms
    const cbc = P(0.57).add(V(0, 0, 0.0));
    b.rod(cbc.clone().add(V(-0.36, 0, 0)), cbc.clone().add(V(0.36, 0, 0)), 0.02, { color: wood, bone: chest, sides: 6 });
    for (const sx of [-1, 1]) {
      const pe = cbc.clone().add(V(sx * 0.36, 0, 0));
      b.part(sph(6, 4), bonePaint, { bone: chest, at: pe, scale: 0.03, flat: true });
      b.rod(pe, pe.clone().add(V(0, -0.2, 0)), 0.006, { color: LEATHER_D, bone: chest, sides: 4 });
      b.spike(pe.clone().add(V(0, -0.2, 0)), [0, -1, 0], 0.1, 0.022, { color: bonePaint, bone: chest, sides: 5 });
      const inner = cbc.clone().add(V(sx * 0.2, 0, 0));
      b.rod(inner, inner.clone().add(V(0, -0.14, 0)), 0.006, { color: LEATHER_D, bone: chest, sides: 4 });
      torus(chest, inner.clone().add(V(0, -0.16, 0)), V(0, 0, 1), 0.03, 0.01, GOLD);
    }
    b.cards(
      [-0.28, -0.1, 0.12, 0.3].map((x) => frame(cbc.clone().add(V(x, 0, 0)), [0, 1, 0])),
      FEATHER,
      { size: [0.07, 0.26], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: rand, bone: chest },
    );
    // feather crown
    b.cards(
      [
        frame(T, [-0.9, 1, -0.2]),
        frame(T, [-0.45, 1, -0.1]),
        frame(T, [0, 1, 0]),
        frame(T, [0.45, 1, -0.1]),
        frame(T, [0.9, 1, -0.2]),
      ],
      FEATHER,
      { size: [0.1, 0.34], lean: 0, flow: [0, 0, 1], vary: 0.12, rng: rand, bone: chest },
    );
    // lashings to the body
    for (const k of [0.08, 0.2]) {
      const ls = P(k);
      b.rod(ls.clone().add(V(0, 0, 0.03)), V(0, ls.y, -0.26), 0.014, { color: LEATHER, bone: chest, sides: 5 });
      torus(chest, ls, V(T.x - B.x, T.y - B.y, T.z - B.z), 0.05, 0.014, LEATHER_D);
    }
    // hanging moss on the pole
    b.cards(
      [0.3, 0.55, 0.8].map((k) => frame(P(k).add(V(0.03, 0, 0.0)), [0, 1, 0])),
      HANG_MOSS,
      { size: [0.1, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: rand, bone: chest },
    );
  }

  // ---- warts and moss on the high ground ---------------------------------------------------------------------
  {
    const body = b.surface([torso, trap, ...pecs]);
    for (const h of body.scatter(16, { rng: rand, minDist: 0.1, filter: (x) => x.n.y > -0.1 && x.at.y > 1.3 }))
      b.stick(new THREE.SphereGeometry(0.018, 6, 4), SK_WART, h, { embed: 0.4 });
    const tops = body.scatter(44, { rng: rand, minDist: 0.07, filter: (x) => x.n.y > 0.55 && x.at.y > 1.75 });
    b.cards(tops, MOSS_TUFT, { size: [0.08, 0.1], lean: 20, vary: 0.4, cross: true, rng: rand, bone: chest });
  }

  // ---- rest pose: jaw a little open ----------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
