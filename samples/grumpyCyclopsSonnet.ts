import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { lerp, offset, rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { grain, mix, mottle, paint, resolve, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import type { Fill } from "../src/context";
import type { Chain, Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import type { Frame } from "../src/frame";
import type { V3 } from "../src/math";

export const meta = {
  name: "Grumpy Cyclops",
  description:
    "A storybook cyclops, three metres of sulk: one big bloodshot eye under a furious V of brow, pouty lip with two crooked tusks, round belly, patched kilt, bone necklace and a studded club he leans on, with a very cheerful little bird sitting on it.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN = "#93c85a";
const SKIN_D = "#6aa044";
const SKIN_RIM = "#3f6b32";
const BELLY = "#dbe79c";
const BLUSH = "#f09a86";
const NOSE_C = "#f08b6a";
const LIP = "#b8586a";
const MOUTH = "#4a1f2e";
const TOOTH = "#f7edc9";
const NAIL = "#ead69f";
const EYEW = "#fbf3d8";
const HAIR = "#58386b";
const CLOTH = "#e0612e";
const CLOTH_D = "#a53d24";
const CLOTH_L = "#f3c35c";
const ROPE = "#cda35e";
const ROPE_D = "#9c7640";
const BONE = "#f1e8c8";
const GOLD = "#e9b83a";
const LEATHER = "#8a5a3a";
const LEATHER_D = "#5f3b25";
const WOOD = "#b07a40";
const WOOD_D = "#704522";
const WOOD_L = "#d09d5c";
const IRON = "#8d95a3";
const IRON_L = "#c3cad6";
const BIRD = "#ffd23f";
const BIRD_W = "#f0a91a";
const BEAK = "#f28a1e";
const INK = "#2a1a2e";
const GRASS = "#67b848";
const PLASTER = "#f3d2a8";
const SACK = "#d8c08a";
const MUSH = "#e0453a";

// Paints
const MOTTLE = mottle(SKIN, SKIN_D, { size: 0.3, contrast: 0.4, seed: 3 });
const SKIN_P = paint((p, n) => {
  const base = resolve(MOTTLE, p, n);
  // cream belly and chest
  const belly =
    smoothstep(0.1, 0.5, n.z) *
    smoothstep(0.62, 0.34, Math.abs(p.x)) *
    smoothstep(0.95, 1.25, p.y) *
    smoothstep(2.4, 2.15, p.y) *
    (p.z > 0.2 ? 1 : 0);
  let c = mix(base, BELLY, belly * 0.85);
  // pink cheeks
  for (const sx of [1, -1]) {
    const d = Math.hypot(p.x - sx * 0.3, (p.y - 2.52) * 1.2, (p.z - 0.45) * 0.6);
    c = mix(c, BLUSH, smoothstep(0.17, 0.05, d) * 0.85);
  }
  // red bulb nose
  const dn = Math.hypot(p.x, p.y - 2.55, (p.z - 0.72) * 0.9);
  c = mix(c, NOSE_C, smoothstep(0.2, 0.08, dn) * 0.95);
  // sun-warmed knees and elbows
  const dk = Math.min(
    Math.hypot(p.x - 0.33, p.y - 0.58, p.z - 0.3),
    Math.hypot(p.x + 0.33, p.y - 0.58, p.z - 0.3),
    Math.hypot(p.x - 1.1, p.y - 1.52, p.z + 0.1),
    Math.hypot(p.x + 1.1, p.y - 1.52, p.z + 0.12),
  );
  c = mix(c, NOSE_C, smoothstep(0.17, 0.03, dk) * 0.55);
  return c;
});

const CLUB_A: [number, number, number] = [0.19, 2.71, -0.09];
const CLUB_AXIS = new THREE.Vector3(...CLUB_A).normalize();
const WOOD_GRAIN = grain(WOOD, WOOD_D, { size: 0.05, axis: [CLUB_AXIS.x, CLUB_AXIS.y, CLUB_AXIS.z], seed: 4 });
const WOOD_HEAD = mottle(WOOD_L, WOOD, { size: 0.14, contrast: 0.55, seed: 9 });
const CLUB_TOP = [-1.08, 3.0, 0.57] as const;
const CLUB_P = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.53 && t < 0.62) {
    const k = (((s[1] / 30 + t * 240) % 2) + 2) % 2;
    return k < 1 ? ROPE : ROPE_D;
  }
  if (t > 0.62) return ((s[1] / 18) % 1 + 1) % 1 < 0.1 ? WOOD_D : WOOD_HEAD;
  return WOOD_GRAIN;
});
const KILT_BASE = mottle(CLOTH, CLOTH_D, { size: 0.22, contrast: 0.35, seed: 11 });
const KILT_P = paint((p, n, s) => {
  const seam = (((s[1] % 36) + 36) % 36) < 1.6;
  const stitch = Math.abs(s[0] - 1.2) < 0.012 && ((Math.floor(s[1] / 4) % 2) === 0);
  if (seam || stitch) return CLOTH_D;
  const hem = s[0] < 0.74 ? smoothstep(0.74, 0.66, s[0]) : 0;
  return mix(resolve(KILT_BASE, p, n), CLOTH_L, hem * 0.9);
});
const ROPE_P = paint((p) => {
  const a = Math.atan2(p.x, p.z) * 26;
  return Math.sin(a) > 0 ? ROPE : ROPE_D;
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 64 C14 48 6 44 8 30 C10 16 26 14 26 26 C26 34 16 34 17 27" stroke="#58386b" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15 60 C15 48 9 44 11 31 C12 22 20 19 23 24" stroke="#8a62a6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const STUBBLE = svg(
  `<svg viewBox="0 0 8 16" xmlns="http://www.w3.org/2000/svg"><path d="M1 16 L4 0 L7 16Z" fill="#3f6b32"/></svg>`,
  { size: 32 },
);

const FRECKLE = svg(
  `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" fill="#a8723a"/></svg>`,
  { size: 32 },
);

const GRASS_T = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 48 C8 30 6 16 2 6 C12 16 16 32 16 48Z" fill="#4d9a3a"/>
  <path d="M18 48 C20 28 24 12 26 0 C32 14 30 34 30 48Z" fill="#67b848"/>
  <path d="M32 48 C34 34 40 20 46 12 C46 28 44 38 44 48Z" fill="#4d9a3a"/>
</svg>`,
  { size: 128 },
);

const EYE_T = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#f6b21c"/><stop offset="0.55" stop-color="#e5801a"/><stop offset="1" stop-color="#9a4a14"/>
  </radialGradient></defs>
  <g stroke="#d9564a" stroke-width="2.2" fill="none" stroke-linecap="round">
    <path d="M6 64 C20 60 30 66 44 62"/><path d="M122 62 C108 68 98 60 84 66"/>
    <path d="M16 38 C28 44 34 50 42 52"/><path d="M112 40 C100 46 94 52 86 54"/>
    <path d="M14 92 C26 84 34 80 42 78"/><path d="M114 90 C102 84 94 80 86 78"/>
    <path d="M44 10 C48 20 52 26 54 34"/><path d="M84 12 C80 22 76 26 74 34"/>
  </g>
  <circle cx="64" cy="64" r="30" fill="url(#i)"/>
  <circle cx="64" cy="64" r="30" fill="none" stroke="#5a2a10" stroke-width="3"/>
  <g stroke="#f9d27a" stroke-width="1.6" opacity="0.7">
    <path d="M64 40 L64 50"/><path d="M64 78 L64 88"/><path d="M40 64 L50 64"/><path d="M78 64 L88 64"/>
    <path d="M47 47 L54 54"/><path d="M81 47 L74 54"/><path d="M47 81 L54 74"/><path d="M81 81 L74 74"/>
  </g>
  <circle cx="64" cy="64" r="9" fill="#1d1020"/>
  <circle cx="54" cy="52" r="6.5" fill="#ffffff"/>
  <circle cx="72" cy="74" r="3" fill="#ffffff" opacity="0.8"/>
</svg>`,
  { size: 256 },
);

const ANGER_T = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#e04a3d" stroke-width="6" stroke-linecap="round">
    <path d="M10 26 C22 26 26 22 26 10"/><path d="M54 26 C42 26 38 22 38 10"/>
    <path d="M10 38 C22 38 26 42 26 54"/><path d="M54 38 C42 38 38 42 38 54"/>
  </g>
</svg>`,
  { size: 192 },
);

const TALLY_T = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#3b2210" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M12 8 L10 56"/><path d="M24 8 L22 56"/><path d="M36 8 L34 56"/><path d="M48 8 L46 56"/>
    <path d="M4 44 L58 18"/>
  </g>
</svg>`,
  { size: 256 },
);

const SKULL_T = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#e9b83a"/>
  <circle cx="32" cy="32" r="30" fill="none" stroke="#a97a1c" stroke-width="3"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="#a97a1c" stroke-width="1.6"/>
  <path d="M18 30 C18 16 46 16 46 30 C46 36 42 38 42 44 L22 44 C22 38 18 36 18 30Z" fill="#f4ecd0"/>
  <ellipse cx="25.5" cy="30" rx="4.5" ry="5" fill="#2a1a2e"/><ellipse cx="38.5" cy="30" rx="4.5" ry="5" fill="#2a1a2e"/>
  <path d="M32 34 L29.5 39 L34.5 39Z" fill="#2a1a2e"/>
  <path d="M26 44 L26 40 M30 44 L30 41 M34 44 L34 41 M38 44 L38 40" stroke="#2a1a2e" stroke-width="1.6"/>
  <path d="M22 18 L42 17" stroke="#2a1a2e" stroke-width="2.4" stroke-linecap="round" transform="rotate(-8 32 18)"/>
</svg>`,
  { size: 192 },
);

const TAB_T = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0 L32 0 L32 28 L26 40 L16 30 L6 40 L0 28Z" fill="#c8532a"/>
  <path d="M2 2 L30 2 L30 27 L25.5 36 L16 27.5 L6.5 36 L2 27Z" fill="#e0612e"/>
  <path d="M5 4 L5 22 M27 4 L27 22" stroke="#a53d24" stroke-width="1.4" stroke-dasharray="3 2"/>
  <rect x="9" y="6" width="14" height="11" fill="#f3c35c"/>
  <path d="M9 6 L23 17 M23 6 L9 17" stroke="#a53d24" stroke-width="1.2"/>
</svg>`,
  { size: 128 },
);

const PATCH_T = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="42" height="42" rx="3" fill="#6bb6c9"/>
  <rect x="3" y="3" width="42" height="42" rx="3" fill="none" stroke="#2f7a8f" stroke-width="2.2" stroke-dasharray="4 3"/>
  <circle cx="24" cy="24" r="9" fill="#f6e08a"/><circle cx="24" cy="24" r="4" fill="#e0612e"/>
  <path d="M10 10 L16 16 M38 10 L32 16 M10 38 L16 32 M38 38 L32 32" stroke="#2f7a8f" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

const PLASTER_T = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="3" width="60" height="26" rx="12" fill="#f3d2a8"/>
  <rect x="22" y="3" width="20" height="26" fill="#f9e6c8"/>
  <g fill="#d9a878"><circle cx="9" cy="10" r="1.6"/><circle cx="9" cy="22" r="1.6"/><circle cx="15" cy="16" r="1.6"/>
  <circle cx="55" cy="10" r="1.6"/><circle cx="55" cy="22" r="1.6"/><circle cx="49" cy="16" r="1.6"/></g>
</svg>`,
  { size: 192 },
);

const DAISY_T = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="#ffffff" stroke="#d9d2c0" stroke-width="1.2">
    <ellipse cx="32" cy="12" rx="6" ry="11"/><ellipse cx="32" cy="52" rx="6" ry="11"/>
    <ellipse cx="12" cy="32" rx="11" ry="6"/><ellipse cx="52" cy="32" rx="11" ry="6"/>
    <ellipse cx="18" cy="18" rx="6" ry="11" transform="rotate(-45 18 18)"/>
    <ellipse cx="46" cy="18" rx="6" ry="11" transform="rotate(45 46 18)"/>
    <ellipse cx="18" cy="46" rx="6" ry="11" transform="rotate(45 18 46)"/>
    <ellipse cx="46" cy="46" rx="6" ry="11" transform="rotate(-45 46 46)"/>
  </g>
  <circle cx="32" cy="32" r="9" fill="#ffcf33"/><circle cx="32" cy="32" r="9" fill="none" stroke="#d9951a" stroke-width="2"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

type K3 = readonly (readonly [number, number, number])[];
/** Catmull-keyed [rx, ry] profile over t, keys as [t, rx, ry]. */
function keyed(keys: K3) {
  return (t: number): [number, number] => {
    let i = 1;
    while (i < keys.length - 1 && t > keys[i][0]) i++;
    const a = keys[i - 1];
    const c = keys[i];
    const u = Math.min(1, Math.max(0, (t - a[0]) / (c[0] - a[0])));
    const p0 = keys[Math.max(0, i - 2)];
    const p3 = keys[Math.min(keys.length - 1, i + 1)];
    const cr = (j: 1 | 2) => {
      const w = [p0[j], a[j], c[j], p3[j]];
      return (
        0.5 *
        (2 * w[1] +
          (-w[0] + w[2]) * u +
          (2 * w[0] - 5 * w[1] + 4 * w[2] - w[3]) * u * u +
          (-w[0] + 3 * w[1] - 3 * w[2] + w[3]) * u * u * u)
      );
    };
    return [cr(1), cr(2)];
  };
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "grumpyCyclops" });
  const R = rng(17);

  const sphere = (r: number, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);
  /** An ellipsoid part: unit sphere scaled to radii. */
  const ell = (
    bone: Joint,
    color: Fill,
    at: V3,
    r: readonly [number, number, number],
    o: { rotation?: [number, number, number]; w?: number; h?: number; name?: string } = {},
  ) =>
    b.part(sphere(1, o.w ?? 12, o.h ?? 8), color, {
      bone,
      at,
      scale: r,
      rotation: o.rotation,
      name: o.name,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton

  const hips = b.joint("hips", { at: [0, 1.2, 0], dir: [0, 1, 0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, 0],
      [0, 1.55, 0.08],
      [0, 1.95, 0.06],
      [0, 2.32, -0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.32, -0.04],
      [0, 2.62, 0.08],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  // The head is designed in a unit space and enlarged by HK about HC (big storybook head).
  const HK = 1.15;
  const HC = V(0, 2.4, 0.1);
  const hp = (x: number, y: number, z: number) => V(x * HK, HC.y + (y - HC.y) * HK, HC.z + (z - HC.z) * HK);
  const hs = (n: number) => n * HK;
  const hr = (x: number, y: number, z: number): [number, number, number] => [x * HK, y * HK, z * HK];
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 2.62, 0.08], dir: [0, 1, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 2.44, -0.04), aim: hp(0, 2.28, 0.4), role: "jaw" });
  const EYE = hp(0, 2.86, 0.36);
  const LID_UP = V(0, -0.139, 0.99).normalize();
  const LID_LO = V(0, 0.208, 0.978).normalize();
  const eyeJ = b.joint("eye", { parent: head, at: EYE, dir: [0, 0, 1] });
  const lidU = b.joint("lidUpper", { parent: head, at: EYE, dir: LID_UP, role: "hinge" });
  const lidL = b.joint("lidLower", { parent: head, at: EYE, dir: LID_LO, role: "hinge" });
  const earJ = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", { parent: head, at: hp(s * 0.46, 2.76, 0.0), dir: [s * 0.8, 0.2, -0.3], role: "hinge" }),
  );

  // Legs
  const legs: Record<string, Chain> = {};
  const feetAnkle: Record<string, THREE.Vector3> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ankle = V(s * 0.37, 0.27, -0.02);
    feetAnkle[side] = ankle;
    const pts = limb(V(s * 0.3, 1.08, 0), ankle, [0.46, 0.46], [0, 0, 1]);
    legs[side] = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.37, 0, 0.3],
    });
  }

  // Arms
  const armPts: Record<string, THREE.Vector3[]> = {
    L: [V(0.78, 2.12, 0), V(1.1, 1.52, -0.08), V(1.2, 0.98, 0.12)],
    R: [V(-0.78, 2.12, 0), V(-1.1, 1.55, -0.12), V(-1.34, 1.3, 0.42)],
  };
  const arms: Record<string, Chain> = {};
  for (const side of ["L", "R"]) {
    arms[side] = b.chain(`arm${side}`, polyline(armPts[side]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Torso, neck, limbs

  const torso = b.sweep(
    spine,
    keyed([
      [0, 0.5, 0.44],
      [0.2, 0.66, 0.6],
      [0.42, 0.74, 0.66],
      [0.7, 0.7, 0.5],
      [1, 0.46, 0.36],
    ]),
    { color: SKIN_P, sides: 14, shift: (t) => [0, -0.12 * Math.sin(Math.PI * t)], name: "torso" },
  );
  b.sweep(neck, [0.34, 0.32], { color: SKIN_P, sides: 10, name: "neckTube" });

  const legSweeps: Record<string, Sweep> = {};
  for (const side of ["L", "R"]) {
    legSweeps[side] = b.sweep(legs[side], [0.31, 0.27, 0.23, 0.2, 0.2], { color: SKIN_P, sides: 10, name: `legTube${side}` });
  }
  const armSweeps: Record<string, Sweep> = {};
  for (const side of ["L", "R"]) {
    armSweeps[side] = b.sweep(arms[side], [0.27, 0.23, 0.22, 0.26, 0.19], { color: SKIN_P, sides: 10, name: `armTube${side}` });
    const s = side === "L" ? 1 : -1;
    // shoulder deltoid ball
    ell(arms[side].joints[0], SKIN_P, [s * 0.8, 2.14, 0], [0.33, 0.3, 0.32], { name: `deltoid${side}` });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Feet and toes

  for (const side of ["L", "R"]) {
    const s = side === "L" ? 1 : -1;
    const ankleJ = legs[side].tip!;
    const a = feetAnkle[side];
    ell(ankleJ, SKIN_P, [a.x, 0.14, 0.2], [0.26, 0.14, 0.4], { name: `foot${side}` });
    ell(ankleJ, SKIN_P, [a.x, 0.17, -0.06], [0.22, 0.16, 0.2], { name: `heel${side}` });
    const radii = [0.082, 0.066, 0.06, 0.054, 0.048];
    for (let i = 0; i < 5; i++) {
      const x = a.x - s * (0.15 - 0.075 * i);
      const r = radii[i];
      const z0 = 0.46 + (i === 0 ? 0.0 : 0.02 * i);
      const len = i === 0 ? 0.2 : 0.16 - i * 0.01;
      const toe = b.chain(`toe${i + 1}${side}`, [V(x, r, z0), V(x, r * 0.95, z0 + len)], {
        parent: ankleJ,
        names: [`toe${i + 1}${side}`],
        role: "digit",
      });
      b.sweep(toe, [r, r * 0.9], { color: SKIN_P, sides: 8, name: `toeTube${i + 1}${side}` });
      // toenail
      ell(toe.joints[0], NAIL, [x, r * 1.55, z0 + len + r * 0.35], [r * 0.7, r * 0.22, r * 0.62], {
        rotation: [-10, 0, 0],
        w: 8,
        h: 5,
        name: `toenail${i + 1}${side}`,
      });
    }
  }
  // bandaged big toe on the right foot
  {
    const a = feetAnkle.R;
    const toeX = a.x + 0.15;
    for (const dz of [0.57, 0.66]) {
      b.part(new THREE.TorusGeometry(0.088, 0.02, 4, 10), PLASTER, {
        bone: legs.R.tip!,
        at: [toeX, 0.082, dz],
        dir: [0, 0, 1],
        axis: "z",
        name: "toeBandage",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head

  const skull = ell(head, SKIN_P, hp(0, 2.9, 0.08), hr(0.52, 0.55, 0.52), { w: 16, h: 12, name: "cranium" });
  const cheeks = [1, -1].map((s) => ell(head, SKIN_P, hp(s * 0.27, 2.5, 0.3), hr(0.25, 0.2, 0.27), { w: 12, h: 8, name: `cheek${s > 0 ? "L" : "R"}` }));
  const muzzle = ell(head, SKIN_P, hp(0, 2.5, 0.38), hr(0.3, 0.17, 0.24), { name: "muzzle" });
  const jawMain = ell(jaw, SKIN_P, hp(0, 2.22, 0.2), hr(0.38, 0.2, 0.34), { w: 14, h: 8, name: "jawMain" });
  const chin = ell(jaw, SKIN_P, hp(0, 2.17, 0.44), hr(0.2, 0.15, 0.15), { name: "chin" });
  // mouth interior seen when the jaw opens
  ell(head, MOUTH, hp(0, 2.4, 0.24), hr(0.3, 0.05, 0.22), { w: 10, h: 5, name: "mouthDark" });
  // big bulb nose with nostrils and a wart
  const nose = ell(head, SKIN_P, hp(0, 2.55, 0.68), hr(0.15, 0.13, 0.14), { w: 12, h: 8, name: "nose" });
  for (const s of [1, -1]) {
    ell(head, MOUTH, hp(s * 0.065, 2.49, 0.77), hr(0.032, 0.022, 0.03), { w: 6, h: 4, name: "nostril" });
    ell(head, SKIN_P, hp(s * 0.14, 2.57, 0.64), hr(0.08, 0.09, 0.07), { w: 8, h: 6, name: "nostrilWing" });
  }
  ell(head, "#b9dc7a", hp(-0.05, 2.63, 0.8), hr(0.03, 0.03, 0.03), { w: 6, h: 4, name: "noseWart" });
  ell(head, SKIN_RIM, hp(-0.05, 2.63, 0.83), hr(0.008, 0.008, 0.008), { w: 4, h: 3, name: "noseWartDot" });

  const headSurf = b.surface([skull, ...cheeks, muzzle, nose]);
  const lowerSurf = b.surface([jawMain, chin]);
  const faceSurf = b.surface([skull, ...cheeks, muzzle, jawMain, chin]);

  // Eye: ball, drawing, socket and two half-closed lids (each lid is the sphere outside a circle round its axis)
  const eyeR = hs(0.25);
  const eyeball = ell(eyeJ, EYEW, [EYE.x, EYE.y, EYE.z], [eyeR, eyeR, eyeR], { w: 14, h: 10, name: "eyeball" });
  b.decal(eyeball, EYE_T, { at: V(0, EYE.y, EYE.z + eyeR), dir: [0, 0, 1], size: [eyeR * 1.5, eyeR * 1.5], segments: 12, lift: 0.002, bone: eyeJ, name: "eyeDrawing" });
  for (const [joint, axis, upper, radius, deg, nm] of [
    [lidU, LID_UP, true, eyeR + 0.03, 34, "lidUpper"],
    [lidL, LID_LO, false, eyeR + 0.022, 30, "lidLower"],
  ] as const) {
    const theta = (deg * Math.PI) / 180;
    b.part(new THREE.SphereGeometry(radius, 16, 8, upper ? 0 : Math.PI, Math.PI, theta, (112 * Math.PI) / 180 - theta), SKIN_P, {
      bone: joint,
      at: EYE,
      dir: axis,
      up: [0, 1, 0],
      name: nm,
    });
    const rim = new THREE.TorusGeometry(radius * Math.sin(theta), hs(0.024), 4, 12, Math.PI);
    if (!upper) rim.rotateZ(Math.PI);
    b.part(rim, SKIN_RIM, {
      bone: joint,
      at: EYE.clone().addScaledVector(axis, radius * Math.cos(theta)),
      dir: axis,
      axis: "z",
      up: [0, 1, 0],
      name: `${nm}Rim`,
    });
  }
  // puffy socket ring where the lids meet the face
  b.part(new THREE.TorusGeometry(eyeR * 1.08, hs(0.05), 7, 20), SKIN_P, { bone: head, at: [0, EYE.y, EYE.z + 0.19], dir: [0, 0, 1], axis: "z", name: "socket" });
  // crow's feet
  for (const s of [1, -1]) {
    for (const dy of [-0.07, 0, 0.07]) {
      const rough = catmull([hp(s * 0.4, 2.86 + dy * 0.3, 0.34), hp(s * 0.46, 2.86 + dy, 0.24)]);
      b.sweep(headSurf.drape(rough, { lift: 0.004 }), hs(0.008), { bone: head, color: SKIN_RIM, sides: 4, name: "crowsFoot" });
    }
  }

  // Big V brow, bushy: outer ends high, inner ends low
  const browFrames: Frame[] = [];
  for (const s of [1, -1]) {
    const pts = catmull(
      [0, 0.09, 0.18, 0.27, 0.36].map((x) => {
        const p = hp(s * x, 3.05 + 0.2 * (x / 0.36), 0);
        const hit = headSurf.ray([p.x, p.y, 3], [0, 0, -1]);
        if (!hit) throw new Error(`brow misses the skull at x=${x}`);
        return offset(hit, hit, 0.03);
      }),
    );
    const brow = b.sweep(pts, [hs(0.065), hs(0.08), hs(0.05)], { bone: head, color: HAIR, sides: 7, caps: "round", name: "brow" });
    for (const f of b.along(brow, 7, (at) => at)) browFrames.push(f);
  }
  b.cards(browFrames, TUFT, { size: [0.09, 0.17], lean: 70, flow: [0, 0.6, 0.8], vary: 0.3, spin: 25, rng: R, bone: head, cross: true });

  // Frown, pouty lip, tusks, stubble
  const MOUTH_X = [-0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36];
  /** Points of the frown curve pressed onto the face front by a ray from ahead. */
  const onFace = (surf: typeof faceSurf, dy: number, lift: number) =>
    catmull(
      MOUTH_X.map((x) => {
        const p = hp(x, 2.36 - 0.12 * Math.pow(x / 0.36, 2) + dy, 0);
        const hit = surf.ray([p.x, p.y, 3], [0, 0, -1]);
        if (!hit) throw new Error(`mouth curve misses the face at x=${x}`);
        return offset(hit, hit, lift);
      }),
    );
  b.sweep(onFace(faceSurf, 0, 0.004), 0.016, { bone: head, color: MOUTH, sides: 5, name: "mouthLine" });
  b.sweep(onFace(lowerSurf, -0.05, 0.012), [0.014, hs(0.04), hs(0.046), hs(0.04), 0.014], { bone: jaw, color: LIP, sides: 7, name: "lowerLip" });
  for (const s of [1, -1]) {
    b.spike(hp(s * 0.16, 2.3, 0.5), [s * 0.05, 1, 0.7], hs(0.22), hs(0.052), { bone: jaw, color: TOOTH, caps: { start: "flat", end: "point" }, sides: 6, name: "tusk" });
  }
  // a crooked small tooth poking from the corner
  b.spike(hp(-0.3, 2.27, 0.38), [-0.25, 1, 0.5], hs(0.11), hs(0.035), { bone: jaw, color: TOOTH, caps: { start: "flat", end: "point" }, sides: 5, name: "toothSmall" });
  const stubble = lowerSurf.scatter(150, { rng: rng(5), minDist: 0.04, filter: (h) => h.n.z > -0.2 && h.n.y < 0.7 });
  b.cards(stubble, STUBBLE, { size: [0.016, 0.038], lean: 55, flow: [0, -1, 0.3], vary: 0.3, rng: rng(6), bone: jaw });
  const freckles = b.surface(cheeks).scatter(26, { rng: rng(12), minDist: 0.08, filter: (h) => h.n.z > 0.35 && h.at.y > 2.5 && h.at.y < 2.85 && Math.abs(h.at.x) > 0.18 });
  b.cards(freckles, FRECKLE, { size: 0.026, lean: 90, flow: [0, -1, 0], bone: head });

  // Ears
  const earOutline: [number, number][] = [
    [0, -0.14],
    [0.16, -0.24],
    [0.34, -0.2],
    [0.45, -0.02],
    [0.42, 0.17],
    [0.3, 0.3],
    [0.12, 0.26],
    [0, 0.14],
  ].map(([x, y]) => [x * HK, y * HK]);
  const earInner: [number, number][] = earOutline.map(([x, y]) => [x * 0.6 + 0.09, y * 0.6 + 0.01]);
  for (const [i, s] of [1, -1].entries()) {
    const x: [number, number, number] = [s * 0.85, 0, -0.5];
    const ear = b.extrude(earOutline, { at: hp(s * 0.44, 2.76, 0.0), x, y: [0, 1, 0], thickness: hs(0.07), bevel: 0.016, smoothing: 2, color: SKIN_P, bone: earJ[i], name: "ear" });
    b.extrude(earInner, { at: ear.local([0, 0, s * 0.024]), x, y: [0, 1, 0], thickness: 0.04, smoothing: 2, color: BLUSH, bone: earJ[i], name: "earInner" });
    const lobeDir = V(...x).normalize();
    b.part(new THREE.TorusGeometry(0.06, 0.013, 4, 10), GOLD, { bone: earJ[i], at: ear.local([0.18, -0.33, 0]), dir: lobeDir, axis: "z", name: "earring" });
    b.spike(ear.local([0.18, -0.39, 0]), [0, -1, 0], 0.1, 0.028, { bone: earJ[i], color: TOOTH, caps: { start: "flat", end: "point" }, sides: 5, name: "earringTooth" });
  }

  // Hair: a few short curls, tufts, and one long hair carrying a daisy
  const crown = b.surface(skull);
  const topHits = crown.scatter(22, { rng: rng(8), minDist: 0.14, filter: (h) => h.n.y > 0.55 });
  b.cards(topHits, TUFT, { size: [0.14, 0.25], lean: 40, flow: [0.3, 0.2, 0.5], vary: 0.3, rng: rng(9), cross: true, bone: head });
  const backHits = crown.scatter(18, { rng: rng(18), minDist: 0.13, filter: (h) => h.n.z < -0.25 && h.n.y > -0.25 });
  b.cards(backHits, TUFT, { size: [0.12, 0.22], lean: 55, flow: [0, -0.6, -1], vary: 0.3, rng: rng(19), cross: true, bone: head });
  {
    const hit = crown.around(skull.at).at(15, 78);
    if (hit) {
      const tip = offset(hit, [0.3, 1, 0.4], 0.26);
      b.sweep(bezier(hit, offset(hit, [0, 1, 0], 0.14), offset(hit, [0.5, 1, 0.5], 0.2), tip), [0.016, 0.01], { color: GRASS, sides: 5, caps: { start: "flat", end: "round" }, name: "daisyStem" });
      for (const [dir, nm] of [[[0.2, 0.55, 1], "daisyFront"], [[-0.2, -0.55, -1], "daisyBack"]] as const) {
        b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: head, at: offset(tip, [0.2, 0.55, 1], nm === "daisyFront" ? 0.012 : -0.012), dir, axis: "z", texture: DAISY_T, name: nm });
      }
    }
  }
  // anger vein on the forehead
  b.decal(skull, ANGER_T, { at: hp(0.4, 3.0, 0.2), dir: [0.8, 0.3, 0.45], size: [0.16, 0.16], segments: 8, bone: head, name: "angerMark" });
  // warts on the cheek
  for (const [x, y, z, r] of [
    [0.4, 2.46, 0.4, 0.04],
    [0.45, 2.6, 0.27, 0.028],
  ] as const) {
    b.stick(sphere(hs(r), 7, 5), "#b9dc7a", faceSurf.nearest(hp(x, y, z)), { embed: 0.35 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Belt, kilt, necklace, pouch

  const torsoSurf = b.surface(torso);
  const beltLoop = torsoSurf.loop([0, 1.3, 0.04], { lift: 0.025 });
  b.sweep(beltLoop, [0.05, 0.05], { color: ROPE_P, sides: 7, name: "belt" });
  const kilt = b.lathe(
    [
      [0.55, 1.36],
      [0.82, 0.66],
      [0.78, 0.63],
      [0.51, 1.28],
    ],
    { at: [0, 0, 0.02], axis: [0, 1, 0], segments: 20, color: KILT_P, bone: hips, name: "kilt" },
  );
  const tabs: Frame[] = [];
  const tabN = 20;
  for (let i = 0; i < tabN; i++) {
    const a = (i / tabN) * Math.PI * 2;
    tabs.push(frame([Math.sin(a) * 0.8, 0.68, Math.cos(a) * 0.8 + 0.02], [0, 1, 0], [0, 0, 1]));
  }
  b.cards(tabs, TAB_T, {
    size: [0.19, 0.26],
    lean: 180,
    flow: (f) => [f.at.x, 0, f.at.z - 0.02],
    vary: 0.1,
    rng: rng(21),
    bone: hips,
  });
  for (const [x, y, dz] of [[0.3, 1.0, 0.7], [-0.45, 0.88, 0.5], [-0.3, 0.95, -0.62], [0.42, 0.8, -0.58]] as const) {
    const hit = b.surface(kilt).nearest([x, y, dz]);
    b.decal(kilt, PATCH_T, { at: hit, size: [0.2, 0.2], segments: 6, bone: hips, roll: x > 0 ? 8 : -12, name: "patch" });
  }
  // buckle
  {
    const hit = torsoSurf.ray([0, 1.3, 1.4], [0, 0, -1]);
    if (hit) {
      b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
        bone: hips,
        at: offset(hit, [0, 0, 1], 0.058),
        dir: [0, 0, 1],
        axis: "z",
        texture: SKULL_T,
        name: "buckle",
      });
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 14), GOLD, { bone: hips, at: offset(hit, [0, 0, 1], 0.045), dir: [0, 0, 1], name: "buckleBack" });
    }
  }
  // big iron key on a ring hanging from the belt
  {
    const k = V(-0.3, 1.25, 0.57);
    b.part(new THREE.TorusGeometry(0.06, 0.012, 4, 10), IRON, { bone: hips, at: k, dir: [0, 0, 1], axis: "z", name: "keyRing" });
    b.part(new THREE.TorusGeometry(0.045, 0.014, 4, 8), IRON_L, { bone: hips, at: [k.x, k.y - 0.11, k.z + 0.025], dir: [0, 0, 1], axis: "z", name: "keyBow" });
    b.rod([k.x, k.y - 0.155, k.z + 0.025], [k.x, k.y - 0.5, k.z + 0.025], 0.014, { bone: hips, color: IRON_L, sides: 5, name: "keyShaft" });
    for (const [dy, w] of [[0.4, 0.06], [0.46, 0.045]] as const) {
      b.part(new THREE.BoxGeometry(w, 0.03, 0.025), IRON_L, { bone: hips, at: [k.x + w / 2 + 0.01, k.y - dy, k.z + 0.025], name: "keyTooth" });
    }
  }
  // pouch at the left hip
  {
    const hit = torsoSurf.ray([0.9, 1.3, 0.1], [-1, 0, 0]);
    if (hit) {
      const top = offset(hit, [1, -0.1, 0], 0.05);
      b.sweep(polyline([top, offset(top, [0.2, -1, 0.1], 0.05)]), 0.013, { bone: hips, color: LEATHER, sides: 4, name: "pouchStrap" });
      ell(hips, SACK, [top.x + 0.08, top.y - 0.2, top.z + 0.03], [0.12, 0.15, 0.1], { name: "pouch" });
      b.sweep(
        catmull([V(top.x - 0.02, top.y - 0.07, top.z + 0.03), V(top.x + 0.08, top.y - 0.05, top.z + 0.12), V(top.x + 0.17, top.y - 0.07, top.z + 0.03), V(top.x + 0.08, top.y - 0.05, top.z - 0.06)], { closed: true }),
        0.013,
        { bone: hips, color: LEATHER, sides: 4, name: "pouchDrawstring" },
      );
    }
  }
  // bone necklace
  {
    const rough = catmull(
      [
        V(0, 1.86, 0.72),
        V(0.36, 1.98, 0.55),
        V(0.62, 2.22, 0.1),
        V(0.34, 2.34, -0.36),
        V(0, 2.38, -0.44),
        V(-0.34, 2.34, -0.36),
        V(-0.62, 2.22, 0.1),
        V(-0.36, 1.98, 0.55),
      ],
      { closed: true },
    );
    const collar = b.surface(torso);
    const draped = collar.drape(rough, { lift: 0.03 });
    b.sweep(draped, 0.012, { color: LEATHER_D, sides: 4, name: "necklaceCord" });
    const beadFrames = b.along(draped, 13, (at) => at);
    const geom = new THREE.CapsuleGeometry(0.036, 0.06, 2, 5);
    for (const [i, f] of beadFrames.entries()) {
      b.stick(geom.clone(), i % 2 ? BONE : "#e0d4a6", f, { embed: 0.2, bone: chest, spin: i * 30 });
    }
    const pend = collar.ray([0, 2.0, 1.2], [0, 0.1, -1]);
    if (pend) {
      b.spike(offset(pend, [0, 0, 1], 0.045), [0, -1, 0.3], 0.2, 0.06, { bone: chest, color: TOOTH, caps: { start: "flat", end: "point" }, sides: 7, name: "pendantTooth" });
      b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GOLD, { bone: chest, at: offset(pend, [0, 0, 1], 0.05), dir: [0, 0, 1], axis: "z", name: "pendantRing" });
    }
  }
  // belly button and chest hair
  {
    const hit = torsoSurf.ray([0, 1.55, 1.6], [0, 0, -1]);
    if (hit) b.stick(new THREE.SphereGeometry(0.04, 7, 5), SKIN_RIM, hit, { embed: 0.5, bone: spine.joints[1] });
    const chestHits = torsoSurf.scatter(14, { rng: rng(31), minDist: 0.13, filter: (h) => h.n.z > 0.3 && h.at.y > 1.6 && h.at.y < 2.1 && Math.abs(h.at.x) < 0.5 });
    b.cards(chestHits, TUFT, { size: [0.08, 0.15], lean: 55, flow: [0, -1, 0.1], vary: 0.3, rng: rng(32), bone: chest });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Bandolier, back sack, spine curls

  {
    const strap = torsoSurf.drape(
      catmull(
        [V(0.5, 2.2, 0.05), V(0.4, 1.95, 0.45), V(0.12, 1.68, 0.72), V(-0.3, 1.5, 0.72), V(-0.6, 1.38, 0.4), V(-0.66, 1.4, -0.2), V(-0.42, 1.75, -0.55), V(0.08, 2.15, -0.5), V(0.45, 2.3, -0.2)],
        { closed: true },
      ),
      { lift: 0.03 },
    );
    b.sweep(strap, () => [0.075, 0.03], { color: LEATHER, sides: 8, name: "bandolier" });
    b.along(strap, 16, (f) => {
      b.stick(new THREE.SphereGeometry(0.026, 6, 4), GOLD, f, { embed: 0.2, bone: chest });
    });
    // stitched burlap sack on the back with a bone sticking out
    const sack = ell(chest, SACK, [-0.1, 1.55, -0.8], [0.36, 0.42, 0.3], { w: 12, h: 8, name: "sack" });
    ell(chest, SACK, [-0.1, 2.0, -0.8], [0.13, 0.12, 0.13], { w: 8, h: 6, name: "sackNeck" });
    b.part(new THREE.TorusGeometry(0.15, 0.02, 5, 12), ROPE, { bone: chest, at: [-0.1, 1.9, -0.8], dir: [0, 1, 0], axis: "z", name: "sackTie" });
    b.rod([-0.12, 1.98, -0.8], [-0.02, 2.28, -0.74], 0.025, { bone: chest, color: BONE, sides: 6, name: "sackBone" });
    for (const [dx, dz] of [[0.025, 0.0], [-0.025, 0.0]]) {
      ell(chest, BONE, [-0.02 + dx, 2.3, -0.74 + dz], [0.04, 0.04, 0.04], { w: 6, h: 4, name: "boneKnob" });
    }
    b.decal(sack, PATCH_T, { at: V(0.1, 1.55, -1.08), dir: [0.2, 0, -1], size: [0.24, 0.24], segments: 6, bone: chest, roll: 10, name: "sackPatch" });
    b.decal(sack, PATCH_T, { at: V(-0.28, 1.4, -1.0), dir: [-0.6, 0, -0.8], size: [0.14, 0.14], segments: 6, bone: chest, roll: -20, name: "sackPatch" });
    // curls down the spine
    const spineFrames: Frame[] = [];
    b.along(torso, 7, (at) => spineFrames.push(at), { from: 0.5, to: 0.98 });
    b.cards(spineFrames, TUFT, { size: [0.09, 0.17], lean: 55, flow: [0, 0.5, -1], vary: 0.3, rng: rng(61), bone: chest, cross: true });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Hands
  const handL = arms.L.tip!;
  const handR = arms.R.tip!;
  {
    // Left: relaxed open hand, fingers spread, thumb forward
    const W = armPts.L[2];
    ell(handL, SKIN_P, [W.x + 0.01, W.y - 0.14, W.z + 0.01], [0.105, 0.17, 0.15], { name: "palmL" });
    const fingers: [string, number, number, number][] = [
      ["index", 0.1, 0.34, 0.06],
      ["middle", 0.035, 0.37, 0.02],
      ["ring", -0.03, 0.33, -0.02],
      ["pinky", -0.09, 0.26, -0.06],
    ];
    for (const [nm, dz, len, splay] of fingers) {
      const B = V(W.x + 0.0, W.y - 0.27, W.z + dz);
      const pts = [B, V(B.x + 0.01, B.y - len * 0.5, B.z + 0.014 + splay * 0.4), V(B.x + 0.03, B.y - len, B.z + 0.03 + splay)];
      const f = b.chain(`${nm}L`, pts, { parent: handL, names: [`${nm}L1`, `${nm}L2`], role: "digit" });
      const r0 = nm === "pinky" ? 0.042 : 0.052;
      b.sweep(f, [r0, r0 * 0.78], { color: SKIN_P, sides: 8, name: `finger${nm}L` });
      const tip = pts[2];
      ell(f.joints[1], NAIL, [tip.x + 0.02, tip.y - 0.025, tip.z + r0 * 0.4], [0.026, 0.05, 0.03], { w: 6, h: 4, rotation: [-10, 0, 0], name: "fingernail" });
    }
    const T = [V(W.x - 0.02, W.y - 0.14, W.z + 0.13), V(W.x + 0.0, W.y - 0.27, W.z + 0.27), V(W.x + 0.04, W.y - 0.36, W.z + 0.37)];
    const th = b.chain("thumbL", T, { parent: handL, names: ["thumbL1", "thumbL2"], role: "digit" });
    b.sweep(th, [0.06, 0.047], { color: SKIN_P, sides: 8, name: "thumbTubeL" });
    ell(th.joints[1], NAIL, [T[2].x + 0.03, T[2].y - 0.02, T[2].z + 0.03], [0.026, 0.05, 0.03], { w: 6, h: 4, rotation: [-30, 0, 0], name: "thumbnail" });
  }

  // Club path and right fist
  const clubB = V(-1.27, 0.07, 0.66);
  const clubPts = [clubB, V(-1.25, 1.0, 0.65), V(-1.17, 1.95, 0.615), V(-1.08, 2.78, 0.57)];
  const clubPath = catmull(clubPts);
  const grip = clubPath.at(0.44);
  const C = grip.clone();
  {
    const P = V(C.x - 0.15, C.y, C.z - 0.09);
    ell(handR, SKIN_P, [P.x, P.y, P.z], [0.11, 0.21, 0.15], { name: "palmR" });
    const rho = 0.11;
    const ang = (deg: number, y: number) => V(C.x + rho * Math.cos((deg * Math.PI) / 180), y, C.z + rho * Math.sin((deg * Math.PI) / 180));
    const fingers: [string, number, number][] = [
      ["index", 0.145, 0.054],
      ["middle", 0.065, 0.056],
      ["ring", -0.015, 0.052],
      ["pinky", -0.09, 0.045],
    ];
    for (const [nm, dy, r0] of fingers) {
      const y = C.y + dy;
      const pts = [ang(205, y), ang(128, y), ang(52, y), ang(-22, y - 0.01)];
      const f = b.chain(`${nm}R`, catmull(pts), { parent: handR, count: 2, names: [`${nm}R1`, `${nm}R2`], role: "digit" });
      b.sweep(f, [r0, r0 * 0.8], { color: SKIN_P, sides: 8, name: `finger${nm}R` });
      const end = pts[3];
      ell(f.joints[1], NAIL, [end.x, end.y, end.z - 0.012], [0.038, 0.03, 0.028], { w: 7, h: 5, name: "fingernail" });
    }
    const ty = C.y + 0.25;
    const tpts = [V(C.x - 0.12, ty - 0.06, C.z - 0.1), ang(180, ty), ang(95, ty + 0.01), ang(30, ty)];
    const th = b.chain("thumbR", catmull(tpts), { parent: handR, count: 2, names: ["thumbR1", "thumbR2"], role: "digit" });
    b.sweep(th, [0.068, 0.052], { color: SKIN_P, sides: 8, name: "thumbTubeR" });
    ell(th.joints[1], NAIL, [tpts[3].x, tpts[3].y + 0.02, tpts[3].z - 0.01], [0.038, 0.03, 0.03], { w: 7, h: 5, name: "thumbnail" });
  }

  // leather anklets
  for (const side of ["L", "R"]) {
    const a = feetAnkle[side];
    const ls = b.surface(legSweeps[side]);
    b.sweep(ls.loop(V(a.x, 0.45, 0.0), { dir: [0, 1, 0], lift: 0.03 }), 0.055, { bone: legs[side].tip!, color: LEATHER, sides: 6, name: `anklet${side}` });
    b.along(ls.loop(V(a.x, 0.45, 0.0), { dir: [0, 1, 0], lift: 0.07 }), 8, (f) => {
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), IRON_L, f, { embed: 0.3, bone: legs[side].tip! });
    });
  }
  // Leather wrist cuffs
  for (const side of ["L", "R"]) {
    const pts = armPts[side];
    const at = lerp(pts[1], pts[2], 0.78);
    const dir = pts[2].clone().sub(pts[1]);
    const loop = b.surface(armSweeps[side]).loop(at, { dir, lift: 0.03 });
    b.sweep(loop, [0.06, 0.06], { color: LEATHER, sides: 6, name: `cuff${side}` });
    b.along(b.surface(armSweeps[side]).loop(at, { dir, lift: 0.075 }), 8, (f) => {
      b.stick(new THREE.SphereGeometry(0.022, 6, 4), IRON_L, f, { embed: 0.3 });
    });
  }
  // forearm and leg fuzz
  for (const side of ["L", "R"]) {
    const sweepT = armSweeps[side];
    const hits = b.surface(sweepT).scatter(12, { rng: rng(41 + (side === "L" ? 0 : 1)), minDist: 0.14, filter: (h) => h.n.y > -0.2 && h.at.y < 1.6 });
    b.cards(hits, TUFT, { size: [0.05, 0.09], lean: 60, flow: [0, -1, 0], vary: 0.3, rng: rng(43), bone: side === "L" ? handL : handR });
  }
  // band-aid plaster on the left knee
  {
    const legS = legSweeps.L;
    const hit = b.surface(legS).ray([0.33, 0.6, 1.2], [0, 0, -1]);
    if (hit) b.decal(legS, PLASTER_T, { at: hit, size: [0.22, 0.11], segments: 6, roll: 25, name: "plaster" });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Club

  const clubR = keyed([
    [0, 0.07, 0.07],
    [0.035, 0.08, 0.08],
    [0.15, 0.065, 0.065],
    [0.5, 0.068, 0.068],
    [0.54, 0.078, 0.078],
    [0.62, 0.09, 0.09],
    [0.68, 0.17, 0.17],
    [0.78, 0.26, 0.26],
    [0.87, 0.285, 0.285],
    [0.95, 0.27, 0.27],
    [1, 0.22, 0.22],
  ]);
  const club = b.sweep(clubPath, (t) => clubR(t), { bone: handR, color: CLUB_P, sides: 10, caps: "round", name: "club" });
  const clubSurf = b.surface(club);
  // iron studs
  for (const h of clubSurf.scatter(24, { rng: rng(51), minDist: 0.2, filter: (q) => q.at.y > 2.0 && q.at.y < 2.9 })) {
    b.stick(new THREE.ConeGeometry(0.03, 0.15, 6), IRON, h, { embed: 0.45, bone: handR });
    b.stick(new THREE.SphereGeometry(0.036, 6, 4), IRON_L, h, { embed: 0.0, bone: handR });
  }
  // iron hoops around the head
  for (const t of [0.72, 0.9]) {
    const loop = clubSurf.loop(clubPath.at(t), { dir: CLUB_AXIS, lift: 0.012 });
    b.sweep(loop, 0.028, { bone: handR, color: IRON, sides: 6, name: "clubHoop" });
    b.along(clubSurf.loop(clubPath.at(t), { dir: CLUB_AXIS, lift: 0.03 }), 9, (f) => {
      b.stick(new THREE.SphereGeometry(0.033, 6, 4), IRON_L, f, { embed: 0.2, bone: handR });
    });
  }
  // wood knots
  for (const h of clubSurf.scatter(5, { rng: rng(55), minDist: 0.3, filter: (q) => q.at.y > 2.0 && q.at.y < 2.8 && q.n.z > 0 })) {
    b.stick(new THREE.SphereGeometry(0.075, 7, 5), WOOD_D, h, { embed: 0.8, bone: handR });
  }
  // tally marks
  {
    const hit = clubSurf.ray([-1.1, 2.3, 1.5], [0, 0, -1]);
    if (hit) b.decal(club, TALLY_T, { at: hit, size: [0.17, 0.17], segments: 6, bone: handR, name: "tally" });
  }
  // ribbon tied under the club head
  {
    const at = clubPath.at(0.6);
    b.sweep(clubSurf.loop(at, { dir: CLUB_AXIS, lift: 0.018 }), 0.03, { bone: handR, color: CLOTH, sides: 5, name: "clubRibbon" });
    const hit = clubSurf.ray([at.x, at.y, 2], [0, 0, -1]);
    if (hit) {
      for (const [dx, name] of [[0.6, "ribbonTailA"], [-0.2, "ribbonTailB"]] as const) {
        const base = offset(hit, hit, 0.03);
        b.sweep(bezier(base, offset(base, [dx, -0.4, 1], 0.1), offset(base, [dx * 1.5, -1, 1], 0.22), offset(base, [dx * 1.6, -1.5, 0.8], 0.34)), (t) => [0.045 * (1 - t * 0.4), 0.008], {
          bone: handR,
          color: CLOTH,
          section: "box",
          caps: "flat",
          name,
        });
      }
    }
  }
  // dangling lanyard from the butt
  {
    const start = clubPts[0];
    b.sweep(catmull([V(start.x, 0.28, start.z - 0.02), V(start.x - 0.12, 0.26, start.z - 0.06), V(start.x - 0.12, 0.13, start.z - 0.05), V(start.x, 0.2, start.z)]), 0.012, { bone: handR, color: LEATHER, sides: 4, name: "lanyard" });
  }

  // little bird perched on the club
  {
    const top = V(...CLUB_TOP);
    const B0 = top.clone().add(V(0, 0.07, 0));
    ell(handR, BIRD, [B0.x, B0.y + 0.04, B0.z], [0.1, 0.095, 0.12], { w: 10, h: 7, name: "birdBody" });
    ell(handR, BIRD, [B0.x, B0.y + 0.16, B0.z + 0.04], [0.075, 0.07, 0.07], { w: 8, h: 6, name: "birdHead" });
    ell(handR, BIRD_W, [B0.x + 0.085, B0.y + 0.05, B0.z - 0.01], [0.025, 0.065, 0.09], { rotation: [0, 0, -15], w: 7, h: 5, name: "birdWing" });
    ell(handR, BIRD_W, [B0.x - 0.085, B0.y + 0.05, B0.z - 0.01], [0.025, 0.065, 0.09], { rotation: [0, 0, 15], w: 7, h: 5, name: "birdWing" });
    b.spike([B0.x, B0.y + 0.15, B0.z + 0.1], [0, -0.05, 1], 0.055, 0.022, { bone: handR, color: BEAK, sides: 6, name: "birdBeak" });
    b.extrude(
      [
        [0, 0],
        [0.1, 0.02],
        [0.16, 0.0],
        [0.14, -0.04],
        [0.02, -0.06],
      ],
      { at: [B0.x, B0.y + 0.04, B0.z - 0.1], x: [0, 0.4, -1], y: [0, 1, 0.3], thickness: 0.02, color: BIRD_W, bone: handR, name: "birdTail" },
    );
    for (const s of [1, -1]) {
      ell(handR, INK, [B0.x + s * 0.035, B0.y + 0.18, B0.z + 0.095], [0.014, 0.017, 0.012], { w: 5, h: 4, name: "birdEye" });
      ell(handR, "#ffffff", [B0.x + s * 0.038, B0.y + 0.187, B0.z + 0.104], [0.005, 0.006, 0.004], { w: 4, h: 3, name: "birdEyeGlint" });
      b.rod([B0.x + s * 0.04, top.y + 0.01, B0.z + 0.02], [B0.x + s * 0.04, top.y - 0.04, B0.z + 0.02], 0.008, { bone: handR, color: BEAK, sides: 4, name: "birdLeg" });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Ground tufts at the feet
  {
    const spots: [number, number][] = [
      [-0.65, 0.5],
      [0.7, 0.45],
      [-1.5, 0.45],
      [0.1, 0.8],
      [-1.0, 0.95],
    ];
    b.cards(
      spots.map(([x, z]) => frame([x, 0.0, z], [0, 1, 0])),
      GRASS_T,
      { size: [0.22, 0.22], lean: 0, flow: [0, 0, 1], cross: true, bone: hips },
    );
  }
  // little ground daisies
  for (const [x, z, h] of [
    [-0.8, 0.9, 0.2],
    [-1.75, 0.3, 0.16],
    [-0.2, 1.05, 0.18],
  ] as const) {
    const ank = legs.R.tip!;
    b.rod([x, 0, z], [x, h, z], 0.008, { bone: ank, color: GRASS, sides: 4, name: "daisyStemGround" });
    for (const [dir, nm] of [[[0, 0.4, 1], "groundDaisyFront"], [[0, -0.4, -1], "groundDaisyBack"]] as const) {
      b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", { bone: ank, at: [x, h + 0.01, z + (nm === "groundDaisyFront" ? 0.006 : -0.006)], dir, axis: "z", texture: DAISY_T, name: nm });
    }
  }
  // a pair of mushrooms by the left foot
  for (const [x, z, k] of [
    [0.78, 0.4, 1],
    [0.98, 0.18, 0.7],
  ] as const) {
    const ank = legs.L.tip!;
    b.part(new THREE.CylinderGeometry(0.035 * k, 0.045 * k, 0.12 * k, 7), TOOTH, { bone: ank, at: [x, 0.06 * k, z], name: "mushStem" });
    b.lathe(
      [
        [0, 0],
        [0.12 * k, 0],
        [0.13 * k, 0.03 * k],
        [0.09 * k, 0.08 * k],
        [0, 0.1 * k],
      ],
      { at: [x, 0.11 * k, z], segments: 9, color: MUSH, bone: ank, name: "mushCap" },
    );
    for (const [dx, dz, y] of [[0.05, 0.02, 0.085], [-0.05, 0.04, 0.08], [0.0, -0.06, 0.08], [-0.02, 0.07, 0.1]]) {
      ell(ank, TOOTH, [x + dx * k, 0.11 * k + y * k, z + dz * k], [0.02 * k, 0.008 * k, 0.02 * k], { w: 6, h: 4, name: "mushSpot" });
    }
  }

  return b.root;
}
