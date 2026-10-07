import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { cells, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Wendigo",
  description:
    "A gaunt, 3.6 m (antlers included) skull-faced beast of the winter forest: ribcage cage around a teal spirit-flame, gold-ringed antlers hung with tassels, frost-tipped fur ruff, tattered sigil pelt, gold greaves, long clawed hands and digitigrade legs.",
  style: "high-fantasy anime dark fantasy",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ashen violet-grey skin, ivory bone, blackened-to-bleached antlers, plum cloth, tarnished gold, one teal glow.

const SKIN_LIT = mottle("#948f9f", "#827d92", { size: 0.16, seed: 3 });
const SKIN_SHD = mottle("#43395e", "#382f54", { size: 0.16, seed: 3 });
const SKIN_BASE = cel(SKIN_LIT, SKIN_SHD);
const SKIN_CRACK = cel("#5f5672", "#2e2644");
const SKIN = paint((p) => {
  const c = cells(p, 0.12, 11);
  return c.id > 0.7 && c.d2 - c.d1 < 0.05 ? SKIN_CRACK : SKIN_BASE;
});
const DARK_BASE = cel(mottle("#6a6377", "#5b546a", { size: 0.12, seed: 8 }), mottle("#31294a", "#292242", { size: 0.12, seed: 8 }));
const DARK_CRACK = cel("#2c2540", "#171227");
const SKIN_D = paint((p) => {
  const c = cells(p, 0.1, 17);
  return c.id > 0.65 && c.d2 - c.d1 < 0.05 ? DARK_CRACK : DARK_BASE;
});
const FLESH_CAVITY = cel("#3a2c4c", "#1f1630");
const TENDON = cel("#5c5072", "#2a2242");
const LIMB = paint((p, n, s) => {
  const a = (((s[1] + 12 * Math.sin(s[0] * 14)) % 90) + 90) % 90;
  if (Math.abs(a - 45) < 2.4 && s[0] > 0.08 && s[0] < 0.92) return TENDON;
  return SKIN.at(p, n);
});
const BONE = cel(mottle("#f3ecd8", "#e3d7bb", { size: 0.08, seed: 5 }), mottle("#a99dba", "#9b8fae", { size: 0.08, seed: 5 }));
const BONE_STAIN = cel("#cdb488", "#8a7292");
const CRACK = cel("#6a5560", "#3a2a48");
const SKULL = paint((p, n) => {
  const c = cells(p, 0.075, 21);
  if (c.id > 0.4 && c.d2 - c.d1 < 0.05) return CRACK;
  return n.y < -0.3 || p.y < 2.4 ? BONE_STAIN : BONE;
});
const CLAW = cel("#f7f1de", "#a99bb0");
const GOLD = cel("#f3c65e", "#9a5a30");
const GOLD_DARK = cel("#b8883a", "#5e3a33");
const AN_BASE = cel("#5c4a48", "#2f2438");
const AN_MID = cel("#b8a381", "#6c5a70");
const AN_TIP = cel("#f2e9d0", "#a798b0");
const AN_RIDGE = cel("#4a3b3d", "#241a2e");
const FUR = cel("#35304c", "#1b1830");
const CLOTH = cel("#52305f", "#2b1943");
const CLOTH_DARK = cel("#3a2148", "#1d1030");
const CLOTH_GOLD = cel("#d9ac4e", "#8a4f34");
const MOUTH = "#2a1226";
const SOCKET = "#120a1c";
const ICE = "#c4f0fa";
const TEAL = "#59f2e0";
const TEAL_HOT = "#d2fffa";
const LEATHER = cel("#5b3a30", "#2e1d2c");

function interp(keys: readonly (readonly [number, number])[], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, r0] = keys[i - 1];
      const [t1, r1] = keys[i];
      return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 64 C0 42 6 22 13 2 C18 22 22 42 20 64 Z" fill="#241f38"/>
  <path d="M12 64 C10 44 16 26 24 6 C27 28 31 46 29 64 Z" fill="#332c4f"/>
  <path d="M7 64 C7 50 12 36 17 18 C22 36 24 50 22 64 Z" fill="#473f69"/>
  <path d="M13 2 C12 8 11.5 12 10.5 16 C13 14 15 14 17 17 C16 11 14.5 6 13 2 Z" fill="#c4e6f0"/>
  <path d="M24 6 C23.5 12 23 15 22 19 C24 17.5 26 17.5 28 20 C27 14 25.5 10 24 6 Z" fill="#b2d8e6"/>
  </svg>`,
  { size: 128 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 24 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="66" r="5" fill="none" stroke="#f3c65e" stroke-width="2.4"/>
  <rect x="9" y="52" width="6" height="8" rx="2" fill="#d9ac4e"/>
  <rect x="10.6" y="30" width="2.8" height="23" fill="#1d8f98"/>
  <path d="M7 31 L17 31 L19 24 L5 24 Z" fill="#f3c65e"/>
  <path d="M5 24 L19 24 L21 16 L3 16 Z" fill="#1d8f98"/>
  <path d="M5 16 L7 3 M9.5 16 L10 1 M14.5 16 L14 1 M19 16 L17 3" stroke="#3fe0d0" stroke-width="2.4" fill="none"/>
  <path d="M3 16 L3 8 M21 16 L21 8" stroke="#7a4aa0" stroke-width="2.4" fill="none"/>
  </svg>`,
  { size: 192 },
);
const RIBBON = svg(
  `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 96 L20 96 L21 70 L19 50 L22 30 L17 10 L14 2 L12 12 L9 3 L6 22 L3 40 L5 62 L3 80 Z" fill="#52305f"/>
  <path d="M4 96 L20 96 L20.5 88 L3.5 88 Z" fill="#d9ac4e"/>
  <path d="M12 86 L12 20" stroke="#3a2148" stroke-width="3" fill="none"/>
  <path d="M7 80 L7 50 M17 78 L17 40" stroke="#1d8f98" stroke-width="2.4" fill="none"/>
  </svg>`,
  { size: 288 },
);
const FLAME = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 64 C3 57 4 36 15 28 C13 20 18 10 22 1 C25 14 36 22 35 39 C37 53 31 62 20 64 Z" fill="#23c9de"/>
  <path d="M20 62 C9 57 10 40 17 33 C16 26 19 18 22 10 C24 20 31 27 30 40 C31 52 27 60 20 62 Z" fill="#5eeee0"/>
  <path d="M20 58 C14 54 15 44 19 39 C19 34 21 29 22 24 C23 31 27 36 26 44 C27 52 24 57 20 58 Z" fill="#c8fff7"/>
  </svg>`,
  { size: 192 },
);
const RUNES = svg(
  `<svg viewBox="0 0 30 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#6ff5e6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 4 L15 20 M8 9 L15 14 L22 9 M9 20 L15 26 L21 20"/>
  <circle cx="15" cy="38" r="5"/><path d="M15 28 L15 33 M15 43 L15 50 M9 46 L21 46"/>
  <path d="M7 56 L15 66 L23 56 M15 66 L15 80 M8 74 L22 74"/>
  <path d="M8 86 L15 92 L22 86 M15 82 L15 92"/>
  </svg>`,
  { size: 288 },
);
const BROW_MARK = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#6ff5e6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 2 L20 58"/>
  <path d="M20 8 L12 18 L20 28 L28 18 Z"/>
  <path d="M6 14 L12 18 M34 14 L28 18 M4 24 L14 24 M26 24 L36 24"/>
  <path d="M10 36 L20 44 L30 36 M12 46 L20 52 L28 46"/>
  <circle cx="8" cy="34" r="1.2" fill="#6ff5e6"/><circle cx="32" cy="34" r="1.2" fill="#6ff5e6"/>
  </svg>`,
  { size: 240 },
);
const SIGIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#6ff5e6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="32" cy="32" r="29"/><circle cx="32" cy="32" r="23" stroke-dasharray="3 3"/>
  <path d="M32 3 L32 61 M6 18 L58 46 M58 18 L6 46"/>
  <path d="M32 12 L44 32 L32 52 L20 32 Z"/>
  <circle cx="32" cy="32" r="5"/>
  <path d="M32 7 L28 3 M32 7 L36 3"/>
  </svg>`,
  { size: 256 },
);
const SOCKET_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 3 L30 9 L35 14 M54 14 L47 17 L49 24 M61 34 L53 34 L50 40 M50 56 L45 49 L38 53 M20 60 L22 52 L15 49 M4 40 L12 38 L12 30 M8 14 L16 19 L19 12" stroke="#6a5560" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 7 C48 7 58 20 58 32 C58 46 46 58 32 58 C17 58 6 46 6 32 C6 18 17 7 32 7 Z" fill="#120a1c"/>
  <path d="M32 11 C45 11 54 21 54 32 C54 44 44 54 32 54" stroke="#2a1838" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 192 },
);
const EYE_TEX = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 24 C14 6 40 2 62 12 C48 14 40 30 28 34 C18 38 8 32 2 24 Z" fill="#17b9c6"/>
  <path d="M8 24 C18 11 38 8 54 13 C44 17 38 28 28 30 C19 32 12 28 8 24 Z" fill="#5eeee0"/>
  <path d="M20 22 C26 15 38 14 46 16 C40 20 36 26 28 27 C24 27 21 25 20 22 Z" fill="#d2fffa"/>
  <path d="M33 13 L36 28 L31 28 Z" fill="#0b3a42"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "wendigo", paintSize: 2048 });
  const rand = rng(7);

  // ----- Skeleton core -------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.28, -0.06], role: "spine" });
  const spinePts = [
    [0, 1.28, -0.06],
    [0, 1.55, -0.03],
    [0, 1.82, 0.05],
    [0, 2.06, 0.15],
    [0, 2.2, 0.21],
  ];
  const spinePath = catmull(spinePts);
  const spine = b.chain("spine", spinePath, { parent: hips, count: 4, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" });
  const cz = (y: number) => spinePath.at(spinePath.closestT([0, y, 0])).z;

  const neckPath = catmull([
    [0, 2.2, 0.21],
    [0, 2.35, 0.3],
    [0, 2.5, 0.43],
  ]);
  const neck = b.chain("neck", neckPath, { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: neckPath.at(1), dir: [0, -0.2, 1], role: "head" });
  const K = 1.25; // the skull is oversized for the stylised read
  const hp = (l: number, u: number, f: number) => head.local({ left: l * K, up: u * K, forward: f * K });
  const hv = (l: number, u: number, f: number) => head.local({ left: l * K, up: u * K, forward: f * K }).sub(head.at);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.05, 0.04), aim: hp(0, -0.1, 0.5), role: "jaw" });

  // ----- Torso ---------------------------------------------------------------------------------------------------
  const torso = b.sweep(
    spine,
    (t) => [
      interp(
        [
          [0, 0.17],
          [0.2, 0.13],
          [0.5, 0.125],
          [0.8, 0.125],
          [1, 0.11],
        ],
        t,
      ),
      interp(
        [
          [0, 0.12],
          [0.2, 0.095],
          [0.5, 0.1],
          [0.8, 0.1],
          [1, 0.09],
        ],
        t,
      ),
    ],
    {
      color: paint((p) => {
        const k = Math.min(Math.max((p.y - 1.5) / 0.15, 0), 1);
        return k > 0.5 ? FLESH_CAVITY : SKIN;
      }),
      name: "torso",
    },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN_D, { bone: hips, at: [0, 1.25, -0.07], scale: [0.2, 0.13, 0.15], name: "pelvis" });
  for (const s of [1, -1]) {
    b.capsule([s * 0.1, 1.44, -0.12], [s * 0.25, 1.34, 0.06], 0.022, { bone: hips, color: BONE, sides: 6 });
  }

  // Ribcage: curved ribs from the spine round to a sternum; the lower four float.
  const ribYs = [2.04, 1.97, 1.9, 1.83, 1.76, 1.69, 1.62];
  ribYs.forEach((y0, i) => {
    const a = 0.235 + 0.08 * Math.sin((Math.PI * (y0 - 1.5)) / 0.7);
    const d = 0.19;
    const zc = cz(y0);
    const end = i < 4 ? 12 : 42;
    for (const s of [1, -1]) {
      const pts: number[][] = [];
      const steps = 6;
      for (let k = 0; k <= steps; k++) {
        const al = ((165 + (end - 165) * (k / steps)) * Math.PI) / 180;
        pts.push([s * a * Math.sin(al), y0 - 0.09 * ((Math.cos(al) + 1) / 2), zc + d * Math.cos(al)]);
      }
      b.sweep(catmull(pts), [0.02, 0.013], { bone: spine.nearestJoint(pts[0]), color: BONE, sides: 6, name: `rib${i}${s > 0 ? "L" : "R"}` });
    }
  });
  b.rod([0, 2.07, cz(2.04) + 0.185], [0, 1.74, cz(1.74) + 0.15], [0.026, 0.018], { bone: spine.joints[2], color: BONE, sides: 6, name: "sternum" });
  // Spirit flame in the cage
  const heartC: [number, number, number] = [0, 1.9, cz(1.9) + 0.07];
  glow(b.part(new THREE.IcosahedronGeometry(0.075, 1), TEAL, { bone: spine.joints[2], at: heartC, name: "heart" }), 1.6);
  glow(b.part(new THREE.IcosahedronGeometry(0.04, 0), TEAL_HOT, { bone: spine.joints[2], at: heartC, name: "heartCore" }), 2);
  glow(
    b.cards(
      [frame(heartC, [0, 1, 0]), frame([0.04, 1.9, heartC[2] - 0.03], [0.2, 1, 0.1]), frame([-0.04, 1.9, heartC[2] - 0.02], [-0.2, 1, 0.1])],
      FLAME,
      { size: [0.1, 0.19], lean: 0, flow: [0, 0, 1], cross: true, bone: spine.joints[2] },
    ),
    1.6,
  );

  // Back: vertebrae
  b.along(torso, 11, (at) => b.spike(at, at, 0.13, 0.024, { color: BONE, sides: 5 }));
  b.along(neck, 4, (at) => b.spike(at, at, 0.06, 0.018, { color: BONE, sides: 5 }));

  // Neck
  b.sweep(neck, [0.09, 0.066], { color: SKIN, name: "neck" });

  // ----- Head: skull ---------------------------------------------------------------------------------------------
  const C = hp(0, 0.03, 0.1);
  const cranium = b.part(new THREE.SphereGeometry(1, 14, 10), SKULL, { bone: head, at: C, scale: [0.1 * K, 0.115 * K, 0.15 * K], name: "cranium" });
  const A = hp(0, 0.0, 0.14);
  const B2 = hp(0, -0.07, 0.58);
  const snoutR = (u: number): [number, number] => [(0.072 - 0.03 * u) * K, (0.082 - 0.045 * u) * K];
  const snout = b.sweep([A, B2], (t) => snoutR(t), { bone: head, color: SKULL, caps: { start: "none", end: "round" }, sides: 10, name: "snout" });
  const snoutPt = (u: number) => A.clone().lerp(B2, u);
  // the underside of the snout at u, in unscaled head units (so hp() can take it back)
  const snoutBottomUp = (u: number) => (snoutPt(u).y - head.at.y - snoutR(u)[1] * 0.92) / K;
  const skullSkin = b.surface([cranium, snout]);
  for (const s of [1, -1]) {
    b.sweep(catmull([hp(s * 0.034, 0.078, 0.215), hp(s * 0.07, 0.092, 0.185), hp(s * 0.098, 0.11, 0.12)]), [0.02 * K, 0.016 * K], { bone: head, color: BONE, sides: 6, name: `brow${s}` });
    b.sweep(catmull([hp(s * 0.075, -0.015, 0.2), hp(s * 0.1, -0.03, 0.1), hp(s * 0.085, -0.055, 0.02)]), [0.014 * K, 0.018 * K], { bone: head, color: BONE, sides: 6, name: `cheek${s}` });
    // eye socket: dark decal, glowing slit eye on top, bone rim
    const out = new THREE.Vector3(s * 0.8, 0.1, 0.6).normalize();
    const probe = hp(s * 0.078, 0.025, 0.15);
    const hit = skullSkin.ray(probe.clone().addScaledVector(out, 0.3), out.clone().negate());
    if (hit) {
      b.decal(skullSkin, SOCKET_TEX, { at: hit, dir: hit.n, size: [0.092 * K, 0.092 * K], mirror: s > 0 });
      glow(b.decal(skullSkin, EYE_TEX, { at: hit, dir: hit.n, size: [0.062 * K, 0.039 * K], roll: s * -12, mirror: s > 0, lift: 0.004 }), 2);
      b.part(new THREE.TorusGeometry(0.043 * K, 0.01 * K, 5, 12), BONE, { bone: head, at: hit.moved([0, 0.002, 0]).at, dir: hit.n, axis: "z", name: `orbit${s}` });
    }
    b.part(new THREE.SphereGeometry(1, 6, 4), SOCKET, { bone: head, at: hp(s * 0.022, -0.075, 0.585), scale: [0.012 * K, 0.016 * K, 0.014 * K], name: `nostril${s}` });
    b.rod(hp(s * 0.085, -0.055, 0.02), hp(s * 0.072, -0.06, 0.045), 0.02 * K, { bone: head, color: BONE, sides: 6 });
  }
  const foreHit = skullSkin.ray(hp(0, 0.5, 0.1), [0, -1, 0]);
  if (foreHit) glow(b.decal(skullSkin, BROW_MARK, { at: foreHit, dir: foreHit.n, size: [0.085 * K, 0.13 * K], up: [0, 0, -1], lift: 0.003 }), 1.5);
  b.sweep([hp(0, 0.1, 0.2), hp(0, 0.045, 0.4), hp(0, -0.01, 0.57)], [0.016 * K, 0.012 * K], { bone: head, color: BONE, sides: 6, name: "bridge" });
  b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { bone: head, at: hp(0, -0.065, 0.575), scale: [0.05 * K, 0.035 * K, 0.04 * K], name: "noseCap" });
  // gum line, palate, upper teeth
  for (const s of [1, -1]) {
    b.sweep([hp(s * 0.05, snoutBottomUp(0.3) - 0.005, 0.28), hp(s * 0.035, snoutBottomUp(0.95) - 0.005, 0.56)], 0.012 * K, { bone: head, color: MOUTH, sides: 5, name: `gumU${s}` });
  }
  b.part(new THREE.BoxGeometry(0.07 * K, 0.01 * K, 0.28 * K), MOUTH, { bone: head, at: hp(0, snoutBottomUp(0.6) - 0.012, 0.4), name: "palate" });
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const u = 0.35 + i * 0.075;
      const f = 0.14 + 0.44 * u;
      const rx = snoutR(u)[0] / K;
      const big = i === 6;
      const len = (big ? 0.1 : 0.026 + 0.008 * Math.sin(i)) * K;
      const base = hp(s * rx * 0.74, snoutBottomUp(u) + 0.004, f);
      if (big) {
        b.sweep(bezier(base, base.clone().add(new THREE.Vector3(0, -0.045 * K, 0.02 * K)), base.clone().add(new THREE.Vector3(0, -len, 0.045 * K))), [0.017 * K, 0], { bone: head, color: CLAW, sides: 6, caps: "point" });
      } else {
        b.spike(base, [0, -1, 0.1], len, 0.011 * K, { bone: head, color: CLAW, sides: 5 });
      }
    }
  }

  // ----- Lower jaw -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const ramus = [hp(s * 0.074, -0.04, 0.04), hp(s * 0.066, -0.093, 0.14), hp(s * 0.046, -0.107, 0.3), hp(s * 0.03, -0.1, 0.5)];
    b.sweep(catmull(ramus), [0.03 * K, 0.016 * K], { bone: jaw, color: SKULL, sides: 7, name: `ramus${s}` });
    b.rod(hp(s * 0.08, -0.04, 0.045), hp(s * 0.083, 0.0, 0.07), 0.016 * K, { bone: jaw, color: BONE, sides: 6 });
    for (let i = 0; i < 7; i++) {
      const f = 0.21 + i * 0.05;
      const k = Math.min((f - 0.14) / 0.36, 1);
      const base = hp(s * (0.058 - 0.024 * k), -0.098 - 0.01 * k + 0.012, f);
      if (i === 6) b.spike(base, [0, 1, 0.35], 0.075 * K, 0.015 * K, { bone: jaw, color: CLAW, sides: 6 });
      else b.spike(base, [0, 1, 0.05], 0.022 * K, 0.01 * K, { bone: jaw, color: CLAW, sides: 5 });
    }
  }
  b.capsule(hp(-0.032, -0.1, 0.5), hp(0.032, -0.1, 0.5), 0.017 * K, { bone: jaw, color: SKULL, sides: 6, name: "chin" });
  b.part(new THREE.BoxGeometry(0.1 * K, 0.008 * K, 0.3 * K), MOUTH, { bone: jaw, at: hp(0, -0.093, 0.31), name: "floorMouth" });
  b.sweep([hp(0, -0.085, 0.18), hp(0, -0.09, 0.4), hp(0, -0.075, 0.57)], [0.022 * K, 0.008 * K], { bone: jaw, color: cel("#6d2c52", "#3a1844"), sides: 6, caps: "round", name: "tongue" });

  // ----- Ears with gold hoops ------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${sd}`, { parent: head, at: hp(s * 0.095, 0.07, 0.0), dir: [s * 0.8, 0.15, -0.5], role: "hinge" });
    const outline: [number, number, "sharp"?][] = [
      [0, 0.03],
      [0.1, 0.06],
      [0.2, 0.045],
      [0.31, -0.02, "sharp"],
      [0.27, -0.045],
      [0.25, -0.06, "sharp"],
      [0.18, -0.045],
      [0.1, -0.05],
      [0, -0.03],
    ];
    const scaled = outline.map(([x, y, sharp]) => (sharp ? ([x * K, y * K, sharp] as [number, number, "sharp"]) : ([x * K, y * K] as [number, number])));
    const ex = [s * 0.75, -0.12, -0.65];
    const ey = [0, 1, 0.15];
    b.extrude(scaled, { at: hp(s * 0.095, 0.07, 0.0), x: ex, y: ey, thickness: 0.009 * K, bevel: 0.002, smoothing: 1, color: SKIN_D, bone: ear, name: `ear${sd}` });
    b.extrude(
      [
        [0.03 * K, 0.012 * K],
        [0.12 * K, 0.03 * K],
        [0.22 * K, 0.012 * K],
        [0.24 * K, -0.015 * K],
        [0.12 * K, -0.028 * K],
        [0.03 * K, -0.012 * K],
      ],
      { at: hp(s * 0.095, 0.07, 0.0), x: ex, y: ey, thickness: 0.013 * K, bevel: 0.002, smoothing: 1, color: cel("#4a2f63", "#2a1840"), bone: ear, name: `earIn${sd}` },
    );
    // gold hoops through the ear rim
    for (const [u, r] of [
      [0.17, 0.02],
      [0.24, 0.016],
    ]) {
      const exN = new THREE.Vector3(ex[0], ex[1], ex[2]).normalize();
      const base = hp(s * 0.095, 0.07, 0.0).clone().addScaledVector(exN, u * K).add(new THREE.Vector3(0, -0.05 * K, 0));
      b.part(new THREE.TorusGeometry(r * K, 0.0045 * K, 4, 10), GOLD, { bone: ear, at: base, dir: exN, axis: "z", name: `earHoop${sd}` });
    }
  }

  // ----- Gold circlet across the brow ---------------------------------------------------------------------------
  {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      pts.push(hp(Math.sin(a) * 0.106, 0.098 + 0.012 * Math.cos(a), 0.1 + Math.cos(a) * 0.145));
    }
    b.sweep(catmull(pts, { closed: true }), 0.012 * K, { bone: head, color: GOLD, sides: 6, name: "circlet" });
    glow(b.part(new THREE.OctahedronGeometry(0.03 * K, 0), TEAL, { bone: head, at: hp(0, 0.108, 0.255), scale: [0.8, 1.5, 0.8], name: "circletGem" }), 1.8);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014 * K, 6, 5), GOLD, { bone: head, at: hp(s * 0.075, 0.105, 0.225), name: "circletStud" });
  }

  // ----- Antlers -------------------------------------------------------------------------------------------------
  const antlerPaint = paint((p, _n, s) => {
    const k = s[0] + 0.06 * zigzag(p.x * 5 + p.y * 3) - 0.03;
    const ridge = Math.floor((s[1] + 360) / 22) % 3 === 0;
    if (k > 0.82) return AN_TIP;
    if (k > 0.5) return ridge ? AN_MID : AN_TIP;
    if (k > 0.25) return ridge ? AN_BASE : AN_MID;
    return ridge ? AN_RIDGE : AN_BASE;
  });
  const goldRings: { at: THREE.Vector3; dir: THREE.Vector3; r: number }[] = [];
  const tasselFrames: Frame[] = [];
  const ribbonFrames: Frame[] = [];
  const flameFrames: Frame[] = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const P = (l: number, u: number, f: number) => hp(s * l, u, f);
    const beam = b.sweep(
      catmull([P(0.05, 0.1, 0.0), P(0.13, 0.17, -0.09), P(0.27, 0.25, -0.17), P(0.42, 0.34, -0.15), P(0.52, 0.47, -0.05), P(0.54, 0.6, 0.09), P(0.45, 0.7, 0.24)]),
      [0.062 * K, 0.02 * K],
      { bone: head, color: antlerPaint, sides: 7, caps: { start: "none", end: "point" }, name: `beam${sd}` },
    );
    b.part(new THREE.IcosahedronGeometry(1, 0), AN_RIDGE, { bone: head, at: P(0.06, 0.1, 0.0), scale: [0.08 * K, 0.06 * K, 0.08 * K], name: `burr${sd}` });
    // a tine curls from the beam: out along its offset, then bending toward its tip
    const tine = (t: number, off: [number, number, number], r: number) => {
      const base = beam.at(t).at;
      const tip = base.clone().add(hv(s * off[0], off[1], off[2]));
      const ctrl = base.clone().add(hv(s * off[0] * 0.75, off[1] * 0.2, off[2] * 0.8));
      b.sweep(bezier(base, ctrl, tip), [r * K, 0.004 * K], { bone: head, color: antlerPaint, sides: 6, caps: "point", name: `tine${sd}${t}` });
      return { base, tip };
    };
    const twig = (from: THREE.Vector3, to: THREE.Vector3, off: [number, number, number], r: number) => {
      const m = from.clone().lerp(to, 0.55);
      const o = hv(s * off[0], off[1], off[2]);
      b.sweep(bezier(m, m.clone().add(o.clone().multiplyScalar(0.5)), m.clone().add(o)), [r * K, 0.003 * K], { bone: head, color: antlerPaint, sides: 5, caps: "point" });
    };
    const brow = tine(0.09, [0.02, 0.2, 0.38], 0.034);
    twig(brow.base, brow.tip, [0.0, 0.16, 0.05], 0.02);
    const t2 = tine(0.2, [0.12, 0.24, 0.2], 0.03);
    twig(t2.base, t2.tip, [0.05, 0.14, 0.02], 0.018);
    const t3 = tine(0.36, [0.16, 0.28, 0.0], 0.03);
    twig(t3.base, t3.tip, [0.08, 0.12, 0.08], 0.018);
    const t4 = tine(0.54, [0.1, 0.28, 0.14], 0.026);
    twig(t4.base, t4.tip, [0.06, 0.1, 0.1], 0.015);
    tine(0.72, [-0.06, 0.24, 0.2], 0.022);
    const end = beam.at(1).at;
    flameFrames.push(frame(end.clone().add(new THREE.Vector3(0, 0.02, 0)), [0, 1, 0]));
    for (const o of [
      [-0.12, 0.1, 0.1],
      [0.08, 0.16, 0.06],
      [-0.04, 0.0, 0.22],
    ]) {
      const v = hv(s * o[0], o[1], o[2]);
      b.sweep(bezier(end, end.clone().add(v.clone().multiplyScalar(0.6)), end.clone().add(v)), [0.018 * K, 0.003 * K], { bone: head, color: antlerPaint, sides: 5, caps: "point" });
    }
    for (const t of [0.07, 0.3, 0.52]) {
      const at = beam.at(t);
      goldRings.push({ at: at.at.clone(), dir: at.tangent.clone(), r: at.radius });
    }
    const down = new THREE.Vector3(0, -1, 0);
    for (const [t, list] of [
      [0.3, tasselFrames],
      [0.07, tasselFrames],
      [0.52, ribbonFrames],
    ] as const) {
      const at = beam.at(t);
      list.push(frame(at.at.clone().addScaledVector(down, at.radius * 0.9), [0, 1, 0]));
    }
  }
  for (const r of goldRings) {
    b.part(new THREE.TorusGeometry(r.r + 0.004, 0.012 * K, 5, 12), GOLD, { bone: head, at: r.at, dir: r.dir, axis: "z", name: "goldRing" });
  }
  b.cards(tasselFrames, TASSEL, { size: [0.05, 0.22], lean: 180, flow: [0, 0, 1], bone: head, cross: true });
  b.cards(ribbonFrames, RIBBON, { size: [0.055, 0.42], lean: 180, flow: [0, 0, 1], bone: head, cross: true });
  glow(b.cards(flameFrames, FLAME, { size: [0.09, 0.2], lean: 0, flow: [0, 0, 1], bone: head, cross: true }), 1.6);

  // ----- Fur ruff, mane, collar ---------------------------------------------------------------------------------
  const ruffPts: number[][] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    ruffPts.push([Math.sin(a) * 0.36, 2.17 + 0.03 * Math.cos(a * 2), 0.12 + Math.cos(a) * 0.23]);
  }
  const ruff = b.sweep(catmull(ruffPts, { closed: true }), 0.095, { bone: spine.joints[3], color: FUR, name: "ruff" });
  const ruffSkin = b.surface(ruff);
  const ruffHits = ruffSkin.scatter(150, { rng: rng(2), minDist: 0.035, filter: (h) => h.n.y > -0.2 });
  b.cards(ruffHits, TUFT, { size: [0.075, 0.18], lean: 55, bend: 28, flow: [0, -1, 0.05], vary: 0.3, rng: rng(3), bone: spine.joints[3] });
  // mane down the back of the neck
  const neckSkin = b.surface(b.sweep(neck, [0.095, 0.07], { color: SKIN, name: "neckFur" }));
  const maneHits = neckSkin.scatter(36, { rng: rng(4), minDist: 0.03, filter: (h) => h.n.z < 0.3 });
  b.cards(maneHits, TUFT, { size: [0.06, 0.2], lean: 70, bend: 30, flow: [0, -1, -0.5], vary: 0.3, rng: rng(5) });

  // gold torc with teal gem
  {
    const ring = b.ring(neck.at(0.12), { count: 12, radius: 0.115, fromDeg: 25, toDeg: 335 });
    b.sweep(catmull(ring.items), 0.013, { color: GOLD, sides: 6, name: "torc" });
    const gemAt = neck.at(0.12).at.clone().add(new THREE.Vector3(0, -0.02, 0.1));
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0), TEAL, { bone: neck.joints[0], at: gemAt, scale: [1, 1.4, 1], name: "torcGem" }), 1.8);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.02, 6, 5), GOLD, { bone: neck.joints[0], at: [s * 0.065, 2.23, 0.31], name: "torcBall" });
  }
  // shoulder spurs and bead chain across the chest
  for (const s of [1, -1]) {
    b.spike([s * 0.36, 2.22, 0.1], [s * 0.7, 0.55, -0.15], 0.34, 0.05, { bone: spine.joints[3], color: BONE, sides: 6, name: "shoulderSpur" });
    b.part(new THREE.TorusGeometry(0.053, 0.012, 5, 10), GOLD, { bone: spine.joints[3], at: [s * 0.4, 2.27, 0.09], dir: [s * 0.7, 0.55, -0.15], axis: "z", name: "spurRing" });
    b.spike([s * 0.44, 2.15, 0.0], [s * 0.6, 0.15, -0.7], 0.24, 0.04, { bone: spine.joints[3], color: BONE, sides: 6 });
    b.sweep(catmull([[s * 0.12, 2.12, 0.26], [s * 0.07, 2.0, 0.31], [0, 1.96, 0.325]]), 0.008, { bone: spine.joints[3], color: GOLD_DARK, sides: 5 });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.035, 0), TEAL, { bone: spine.joints[2], at: [0, 1.93, 0.335], scale: [0.9, 1.5, 0.9], name: "chestGem" }), 1.8);

  // ----- Arms and hands ------------------------------------------------------------------------------------------
  const armSweeps: Record<string, Sweep> = {};
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const S = [s * 0.4, 2.06, 0.1];
    const E = [s * 0.68, 1.42, -0.02];
    const W = [s * 0.88, 0.88, 0.16];
    const arm = b.chain(`arm${sd}`, polyline([S, E, W]), { parent: spine.joints[3], names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`], role: "arm" });
    const wristJ = arm.joints[2];
    armSweeps[sd] = b.sweep(
      arm,
      (t) =>
        interp(
          [
            [0, 0.085],
            [0.3, 0.066],
            [0.5, 0.056],
            [0.55, 0.06],
            [0.85, 0.048],
            [1, 0.045],
          ],
          t,
        ),
      { color: LIMB, name: `arm${sd}` },
    );
    // shoulder ball and clavicle
    b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN, { bone: spine.joints[3], at: S, name: `shoulderBall${sd}` });
    b.rod([s * 0.03, 2.2, 0.25], [s * 0.4, 2.12, 0.1], 0.026, { bone: spine.joints[3], color: BONE, sides: 6 });
    // elbow spur
    b.spike(E, [s * 0.55, 0.25, -0.8], 0.17, 0.034, { bone: arm.joints[1], color: BONE, sides: 6, name: `elbowSpur${sd}` });
    b.part(new THREE.SphereGeometry(0.056, 8, 6), SKIN_D, { bone: arm.joints[1], at: E, name: `elbow${sd}` });
    // gold cuffs
    const cuff = (t: number, half: number, rr: number) => {
      const c = arm.at(t);
      const rIn = rr - 0.006;
      b.lathe(
        [
          [rIn, -half],
          [rr, -half * 0.8],
          [rr + 0.012, -half * 0.35],
          [rr + 0.012, half * 0.35],
          [rr, half * 0.8],
          [rIn, half],
        ],
        { at: c.at, axis: c.tangent, segments: 12, color: GOLD, bone: c.bone, name: `cuff${sd}` },
      );
    };
    cuff(0.93, 0.03, 0.058);
    cuff(0.84, 0.014, 0.056);
    cuff(0.58, 0.02, 0.066);
    const askin = b.surface(armSweeps[sd]);
    const armTufts = askin.scatter(70, { rng: rng(40 + (s > 0 ? 1 : 2)), minDist: 0.04, filter: (h) => (h.at.y > 1.28 && h.at.y < 1.52) || (h.at.y > 0.93 && h.at.y < 1.06) });
    b.cards(armTufts, TUFT, { size: [0.055, 0.14], lean: 60, bend: 25, flow: [0, -1, 0], vary: 0.3, rng: rng(42) });
    // hand
    const d = new THREE.Vector3(s * 0.1, -0.28, 0.08).normalize();
    const Wv = new THREE.Vector3(...W);
    const K0 = Wv.clone().addScaledVector(d, 0.24);
    b.sweep([Wv, K0], (t) => [0.048 + 0.022 * t, 0.03 - 0.008 * t], { bone: wristJ, color: SKIN_D, sides: 8, name: `palm${sd}` });
    const names = ["index", "middle", "ring", "pinky"];
    const flen = [0.9, 1.0, 0.95, 0.75];
    for (let i = 0; i < 4; i++) {
      const ox = -s * (1.5 - i) * 0.042;
      const p0 = K0.clone().add(new THREE.Vector3(ox, 0, 0));
      const pts = [p0];
      let last = d.clone();
      for (let k = 0; k < 3; k++) {
        const dir = d.clone().add(new THREE.Vector3(ox * 4 * (1 - 0.3 * k), 0, 0.3 * (k + 0.3) * (k + 0.3) * 0.9)).normalize();
        last = dir;
        pts.push(pts[k].clone().addScaledVector(dir, [0.21, 0.19, 0.16][k] * flen[i]));
      }
      const fc = b.chain(`${names[i]}${sd}`, polyline(pts), { parent: wristJ, names: [1, 2, 3].map((k) => `${names[i]}${k}${sd}`), role: "digit" });
      b.sweep(fc, (t) => 0.03 * (1 - 0.45 * t) + 0.005, { color: SKIN_D, sides: 6, name: `finger${names[i]}${sd}` });
      b.part(new THREE.SphereGeometry(0.03, 6, 5), SKIN, { bone: fc.joints[0], at: p0, name: `knuckle${sd}` });
      if (i === 1 || i === 2) {
        const m = p0.clone().lerp(pts[1], 0.55);
        const seg = pts[1].clone().sub(p0).normalize();
        const rr = 0.03 * (1 - 0.45 * 0.2) + 0.006;
        b.lathe(
          [
            [rr - 0.005, -0.012],
            [rr + 0.006, -0.008],
            [rr + 0.008, 0],
            [rr + 0.006, 0.008],
            [rr - 0.005, 0.012],
          ],
          { at: m, axis: seg, segments: 8, color: GOLD, bone: fc.joints[0], name: `fingerRing${sd}` },
        );
      }
      const tip = pts[3];
      b.sweep(bezier(tip, tip.clone().addScaledVector(last, 0.08), tip.clone().addScaledVector(last, 0.13).add(new THREE.Vector3(0, 0, 0.08))), [0.016, 0], {
        bone: fc.joints[2],
        color: CLAW,
        sides: 6,
        caps: "point",
        name: `claw${names[i]}${sd}`,
      });
    }
    // thumb
    {
      const p0 = Wv.clone().addScaledVector(d, 0.09).add(new THREE.Vector3(-s * 0.04, 0, 0.03));
      const dir0 = new THREE.Vector3(-s * 0.5, -0.6, 0.55).normalize();
      const dir1 = new THREE.Vector3(-s * 0.35, -0.5, 0.75).normalize();
      const p1 = p0.clone().addScaledVector(dir0, 0.13);
      const p2 = p1.clone().addScaledVector(dir1, 0.11);
      const tc = b.chain(`thumb${sd}`, polyline([p0, p1, p2]), { parent: wristJ, names: [`thumb1${sd}`, `thumb2${sd}`], role: "digit" });
      b.sweep(tc, (t) => 0.026 * (1 - 0.4 * t) + 0.004, { color: SKIN_D, sides: 6, name: `thumb${sd}` });
      b.sweep(bezier(p2, p2.clone().addScaledVector(dir1, 0.06), p2.clone().addScaledVector(dir1, 0.09).add(new THREE.Vector3(0, 0, 0.06))), [0.014, 0], {
        bone: tc.joints[1],
        color: CLAW,
        sides: 6,
        caps: "point",
        name: `thumbClaw${sd}`,
      });
    }
  }

  // ----- Legs ----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.2, 1.25, -0.04],
      [s * 0.22, 0.78, 0.2],
      [s * 0.2, 0.4, -0.08],
      [s * 0.2, 0.06, 0.22],
      [s * 0.2, 0.03, 0.44],
    ];
    const leg = b.chain(`leg${sd}`, polyline(pts), { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `ball${sd}`, `toe${sd}`], role: "leg", contact: [s * 0.2, 0, 0.4] });
    const ts = leg.ts;
    const legSweep = b.sweep(
      leg,
      (t) =>
        interp(
          [
            [0, 0.115],
            [ts[1] * 0.5, 0.095],
            [ts[1], 0.07],
            [ts[2] * 0.7, 0.056],
            [ts[2], 0.05],
            [ts[3] * 0.97, 0.034],
            [1, 0.03],
          ],
          t,
        ),
      { color: LIMB, name: `leg${sd}` },
    );
    // knee cap, heel spur
    b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN_D, { bone: leg.joints[1], at: pts[1], name: `knee${sd}` });
    b.spike(pts[1], [s * 0.1, 0.1, 1], 0.14, 0.03, { bone: leg.joints[1], color: BONE, sides: 6, name: `kneeSpur${sd}` });
    b.spike(pts[2], [0, 0.35, -1], 0.17, 0.028, { bone: leg.joints[2], color: BONE, sides: 6, name: `heelSpur${sd}` });
    b.part(new THREE.SphereGeometry(0.048, 6, 5), SKIN_D, { bone: leg.joints[2], at: pts[2], name: `hock${sd}` });
    // gold anklet
    {
      const c = leg.at(0.66);
      b.lathe(
        [
          [0.036, -0.02],
          [0.05, -0.015],
          [0.055, 0],
          [0.05, 0.015],
          [0.036, 0.02],
        ],
        { at: c.at, axis: c.tangent, segments: 10, color: GOLD, bone: c.bone, name: `anklet${sd}` },
      );
    }
    // gold greave on the shin, riveted
    {
      const k1 = new THREE.Vector3(...pts[1]);
      const k2 = new THREE.Vector3(...pts[2]);
      const dv = k2.clone().sub(k1).normalize();
      const nv = dv.clone().cross(new THREE.Vector3(1, 0, 0)).normalize();
      const ga = k1.clone().addScaledVector(dv, 0.09).addScaledVector(nv, 0.082);
      const gb = k2.clone().addScaledVector(dv, -0.07).addScaledVector(nv, 0.064);
      b.sweep([ga, gb], (t) => [0.058 - 0.016 * t, 0.015], { bone: leg.joints[1], color: GOLD, caps: "flat", sides: 10, name: `greave${sd}` });
      b.sweep([ga.clone().addScaledVector(nv, 0.008), gb.clone().addScaledVector(nv, 0.008)], 0.007, { bone: leg.joints[1], color: GOLD_DARK, sides: 5, name: `greaveRidge${sd}` });
      for (let k = 0; k < 4; k++) {
        for (const e of [-1, 1]) {
          const c = ga.clone().lerp(gb, 0.12 + k * 0.25).addScaledVector(nv, 0.012).add(new THREE.Vector3(e * (0.04 - 0.01 * k), 0, 0));
          b.part(new THREE.SphereGeometry(0.008, 5, 4), GOLD_DARK, { bone: leg.joints[1], at: c, name: `greaveRivet${sd}` });
        }
      }
      glow(b.part(new THREE.OctahedronGeometry(0.018, 0), TEAL, { bone: leg.joints[1], at: ga.clone().lerp(gb, 0.5).addScaledVector(nv, 0.02), scale: [0.8, 1.4, 0.8], name: `greaveGem${sd}` }), 1.5);
    }
    glow(
      b.decal(legSweep, RUNES, {
        at: [pts[0][0] + s * 0.14, 1.0, 0.09],
        dir: [s, 0, 0.25],
        size: [0.07, 0.24],
        up: [0, 1, 0],
        lift: 0.003,
      }),
      1.4,
    );
    // toes
    const ball = new THREE.Vector3(...pts[3]);
    const toes: { name: string; pts: THREE.Vector3[] }[] = [
      { name: "toeIn", pts: [ball.clone().add(new THREE.Vector3(-s * 0.02, 0, 0)), ball.clone().add(new THREE.Vector3(-s * 0.075, -0.005, 0.16))] },
      { name: "toeOut", pts: [ball.clone().add(new THREE.Vector3(s * 0.02, 0, 0)), ball.clone().add(new THREE.Vector3(s * 0.075, -0.005, 0.16))] },
    ];
    for (const t of toes) {
      const tc = b.chain(`${t.name}${sd}`, polyline(t.pts), { parent: leg.joints[3], names: [`${t.name}${sd}`], role: "digit" });
      b.sweep(tc, [0.03, 0.02], { color: SKIN_D, sides: 6, name: `${t.name}${sd}` });
      const dir = t.pts[1].clone().sub(t.pts[0]).normalize();
      b.sweep(bezier(t.pts[1], t.pts[1].clone().addScaledVector(dir, 0.05), t.pts[1].clone().addScaledVector(dir, 0.09).add(new THREE.Vector3(0, -0.012, 0))), [0.016, 0], {
        bone: tc.joints[0],
        color: CLAW,
        sides: 6,
        caps: "point",
        name: `toeClaw${t.name}${sd}`,
      });
    }
    // centre toe claw
    {
      const tipP = new THREE.Vector3(...pts[4]);
      b.sweep(bezier(tipP, tipP.clone().add(new THREE.Vector3(0, 0, 0.05)), tipP.clone().add(new THREE.Vector3(0, -0.005, 0.1))), [0.017, 0], { bone: leg.joints[4], color: CLAW, sides: 6, caps: "point", name: `toeClawC${sd}` });
    }
    b.part(new THREE.SphereGeometry(0.032, 6, 5), SKIN, { bone: leg.joints[3], at: pts[3], name: `ball${sd}` });
    // fur tufts at knee and hock
    const lskin = b.surface(legSweep);
    const tufts = lskin.scatter(40, { rng: rng(30 + (s > 0 ? 1 : 2)), minDist: 0.04, filter: (h) => (h.at.y > 0.7 && h.at.y < 0.9) || (h.at.y > 0.28 && h.at.y < 0.45) });
    b.cards(tufts, TUFT, { size: [0.05, 0.12], lean: 60, bend: 25, flow: [0, -1, 0], vary: 0.3, rng: rng(32) });
  }

  // ----- Tail ----------------------------------------------------------------------------------------------------
  {
    const tailPath = catmull([
      [0, 1.2, -0.12],
      [0, 0.95, -0.4],
      [0, 0.6, -0.62],
      [0, 0.32, -0.85],
      [0, 0.26, -1.1],
    ]);
    const tail = b.chain("tail", tailPath, { parent: hips, count: 4, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
    const ts = b.sweep(tail, [0.055, 0.012], { color: SKIN_D, name: "tail" });
    b.along(ts, 5, (at) => b.spike(at, at, 0.05, 0.016, { color: BONE, sides: 5 }));
    const tip = tail.at(1);
    b.cards([frame(tip.at, [0, 0.3, -1]), frame(tip.at.clone().add(new THREE.Vector3(0.02, 0.02, 0.03)), [0.4, 0.5, -1]), frame(tip.at.clone().add(new THREE.Vector3(-0.02, 0.02, 0.03)), [-0.4, 0.5, -1])], TUFT, {
      size: [0.1, 0.28],
      lean: 20,
      flow: [0, -1, -0.3],
      cross: true,
      bone: tail.joints[3],
    });
  }

  // ----- Belt, loincloth, pelt cape ------------------------------------------------------------------------------
  const tSkin = b.surface(torso);
  const beltY = 1.4;
  const beltLoop = tSkin.loop([0, beltY, -0.05], { dir: [0, 1, 0], lift: 0.018 });
  b.sweep(beltLoop, 0.022, { color: LEATHER, name: "belt" });
  b.along(tSkin.loop([0, beltY, -0.05], { dir: [0, 1, 0], lift: 0.04 }), 12, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: at.at, bone: hips }));
  const frontHit = tSkin.ray([0, beltY, 1], [0, 0, -1]);
  const backHit = tSkin.ray([0, beltY, -1], [0, 0, 1]);
  const fz = (frontHit ? frontHit.at.z : 0.07) + 0.04;
  const bz = (backHit ? backHit.at.z : -0.2) - 0.04;
  glow(b.part(new THREE.OctahedronGeometry(0.032, 0), TEAL, { bone: hips, at: [0, beltY, fz], scale: [1, 1.3, 0.7], name: "buckleGem" }), 1.6);
  b.lathe(
    [
      [0, -0.001],
      [0.055, 0],
      [0.06, 0.008],
      [0.05, 0.014],
      [0, 0.016],
    ],
    { at: [0, beltY, fz - 0.012], axis: [0, 0, 1], segments: 8, color: GOLD, bone: hips, name: "buckle" },
  );
  const clothPaint = (topY: number) =>
    paint((_p, _n, s) => {
      const y = s[1] - topY;
      if (y > -0.04) return CLOTH_GOLD;
      if (y > -0.055) return CLOTH_DARK;
      return Math.floor(s[0] * 28) % 3 === 0 ? CLOTH_DARK : CLOTH;
    });
  const tatter = (halfW: number, len: number, seedv: number) => {
    const r = rng(seedv);
    const pts: [number, number, "sharp"?][] = [[-halfW, 0], [halfW, 0]];
    const n = 5;
    for (let i = 0; i <= n; i++) {
      const x = halfW - (2 * halfW * i) / n;
      pts.push([x * 0.96, -len * (0.75 + 0.25 * r()) - (i % 2 ? 0.07 : 0), "sharp"]);
      if (i < n) pts.push([x - halfW / n, -len * (0.5 + 0.2 * r()), "sharp"]);
    }
    return pts;
  };
  // front tabard
  b.extrude(tatter(0.1, 0.55, 3).map((q) => q) as never, { at: [0, beltY, fz + 0.01], x: [-1, 0, 0], y: [0, 1, 0.08], thickness: 0.014, bevel: 0.003, color: clothPaint(0), bone: hips, name: "tabard" });
  // hip tatters left / right
  for (const s of [1, -1]) {
    b.extrude(tatter(0.07, 0.42, 9 + s) as never, { at: [s * 0.2, beltY - 0.02, 0.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: clothPaint(0), bone: hips, name: "hipTatter" });
  }
  // rear flap
  b.extrude(tatter(0.17, 0.62, 5) as never, { at: [0, beltY, bz - 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.003, color: clothPaint(0), bone: hips, name: "rearFlap" });
  // belt charms: small skulls on cords
  for (const s of [1, -1]) {
    const bx = s * 0.15;
    const bzz = (frontHit ? frontHit.at.z : 0.05) - 0.02;
    b.sweep([[bx, beltY - 0.01, bzz + 0.02], [bx * 1.1, beltY - 0.1, bzz + 0.03]], 0.006, { bone: hips, color: LEATHER, sides: 4 });
    b.part(new THREE.SphereGeometry(0.036, 7, 5), BONE, { bone: hips, at: [bx * 1.1, beltY - 0.14, bzz + 0.04], scale: [1, 1.05, 1.1], name: "charmSkull" });
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.025), BONE, { bone: hips, at: [bx * 1.1, beltY - 0.178, bzz + 0.06] });
    for (const e of [-1, 1]) b.part(new THREE.SphereGeometry(0.009, 5, 4), SOCKET, { bone: hips, at: [bx * 1.1 + e * 0.013, beltY - 0.135, bzz + 0.072] });
  }
  // pelt cape: two tattered panels hanging from the shoulders, following the slope of the back
  const capeBack = tSkin.ray([0, 2.1, -1], [0, 0, 1]);
  const capeTopZ = (capeBack ? capeBack.at.z : -0.02) - 0.06;
  const capeSlope = 0.24;
  const capeZ = (y: number) => capeTopZ - capeSlope * (2.16 - y);
  const capePaint = paint((_p, _n, s) => {
    if (s[1] > -0.05) return CLOTH_GOLD;
    if (s[1] > -0.07) return CLOTH_DARK;
    const stripe = Math.floor((s[0] + 1) * 22 + Math.sin(s[1] * 9) * 1.2) % 4;
    return stripe === 0 ? FUR : stripe === 2 ? CLOTH_DARK : CLOTH;
  });
  const capes = [1, -1].map((s) =>
    b.extrude(
      [
        [0, 0],
        [0.3, 0.02],
        [0.36, -0.28],
        [0.34, -0.6],
        [0.4, -0.86, "sharp"],
        [0.31, -0.78],
        [0.28, -1.05, "sharp"],
        [0.2, -0.8],
        [0.15, -1.15, "sharp"],
        [0.1, -0.86],
        [0.04, -1.0, "sharp"],
        [0, -0.5],
      ],
      { at: [0, 2.16, capeTopZ], x: [s, 0, 0], y: [0, 1, capeSlope], thickness: 0.02, bevel: 0.004, color: capePaint, bone: spine.joints[2], name: "cape" },
    ),
  );
  glow(b.decal(capes, SIGIL, { at: [0, 1.82, capeZ(1.82) - 0.01], dir: [0, 0, -1], size: [0.32, 0.32], up: [0, 1, 0], lift: 0.004 }), 1.4);
  const capeSkin = b.surface(capes);
  const capeTufts = capeSkin.scatter(110, { rng: rng(55), minDist: 0.045, filter: (h) => h.at.y < 1.55 && h.n.z < -0.5 });
  b.cards(capeTufts, TUFT, { size: [0.065, 0.15], lean: 70, flow: [0, -1, -0.2], vary: 0.3, rng: rng(56), bone: spine.joints[2] });
  // frost crystals on shoulders, elbows, knees, skull
  const crystal = (base: THREE.Vector3 | number[], dir: number[], len: number, bone: Joint) =>
    b.spike(base, dir, len, 0.012 + len * 0.1, { color: ICE, sides: 5, bone });
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const base = [s * (0.22 + rand() * 0.2), 2.2 + rand() * 0.04, 0.0 + rand() * 0.22];
      crystal(base, [s * (rand() * 0.6), 1, rand() * 0.6 - 0.3], 0.08 + rand() * 0.12, spine.joints[3]);
    }
    for (let i = 0; i < 3; i++) crystal([s * 0.6, 1.4, -0.05 + i * 0.04], [s * 0.9, 0.4 + i * 0.3, -0.5], 0.06 + rand() * 0.06, spine.joints[3]);
  }
  for (let i = 0; i < 5; i++) crystal(hp(0.03 * (i - 2), 0.14, -0.04 + i * 0.01), [0, 1, -0.3 + i * 0.1], 0.07 + rand() * 0.06, head);
  // icicles hanging from the chin and ruff
  for (let k = 0; k < 7; k++) {
    const x = (k - 3) * 0.018;
    crystal(hp(x, -0.115, 0.3 + (k % 3) * 0.07 + 0.05), [0, -1, 0.1], 0.04 + 0.05 * Math.abs(Math.sin(k * 1.7)), jaw);
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    crystal([Math.sin(a) * 0.3, 2.1, 0.12 + Math.cos(a) * 0.2], [Math.sin(a) * 0.3, -1, 0.1], 0.07 + 0.04 * Math.abs(Math.cos(a * 3)), spine.joints[3]);
  }

  // ----- Rune decals ---------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const arm = armSweeps[sd];
    const fa = arm.at(0.72, s > 0 ? 80 : -80);
    glow(b.decal(arm, RUNES, { at: fa.at, dir: [s * 0.9, 0.1, 0.4], size: [0.08, 0.26], up: [0, 1, 0], lift: 0.003 }), 1.6);
  }

  // ----- Final rest pose: jaw slightly open, ears out -----------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  return b.root;
}
