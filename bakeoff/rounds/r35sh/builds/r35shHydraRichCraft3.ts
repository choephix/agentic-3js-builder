import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  aim,
  offset,
  paint,
  mix,
  noise,
  smoothstep,
  scales,
  svg,
} from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hydra of Lerna",
  description:
    "God of War style five-headed hydra: scarred, ash-grey swamp hide, tarnished bronze plate and shackles, broken spears and swords, glowing ember eyes, runic seals and cracks.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours; paints and textures below carry the surfaces)
const INK = "#0d0a09";
const BONE = "#cdbf9c";
const BONE_DK = "#6d5f48";
const HORN_ROOT = "#27211c";
const HORN_MID = "#5f5244";
const TOOTH = "#d8cdab";
const GUM = "#4a1612";
const TONGUE = "#85302a";
const CLAW = "#18140f";
const LEATHER = "#46321f";
const WOOD = "#5a4230";
const WOOD_LT = "#9c8460";
const BRONZE_FLAT = "#7d5b2b";
const IRON_FLAT = "#4a4b53";
const STEEL = "#8c93a0";
const TOE = "#29332d";
const BROW = "#38413a";
const NOSE = "#1b1614";

type Pt = [number, number] | [number, number, "sharp"];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const lerpKeys = (keys: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};
// piecewise-linear [t, rx, ry] profile for elliptical tubes
const prof =
  (keys: number[][], k = 1) =>
  (t: number): [number, number] => {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const c = keys[i + 1];
      if (t <= c[0] || i === keys.length - 2) {
        const u = Math.min(Math.max((t - a[0]) / (c[0] - a[0]), 0), 1);
        return [(a[1] + (c[1] - a[1]) * u) * k, (a[2] + (c[2] - a[2]) * u) * k];
      }
    }
    return [keys[0][1] * k, keys[0][2] * k];
  };
const perp = (d: THREE.Vector3) =>
  d.clone().cross(Math.abs(d.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0)).normalize();

const bladeOutline = (w: number, l: number): Pt[] => [
  [-w, -0.1],
  [w, -0.1],
  [w * 0.85, l * 0.3],
  [w * 0.3, l * 0.78],
  [0, l, "sharp"],
  [-w * 0.3, l * 0.7],
  [-w * 0.8, l * 0.28],
];

// ---------------------------------------------------------------------------------------------------------------
// Paints
function hidePaint(seed: number, ash: string) {
  const sc = scales(["#2b3731", "#26312c", "#34413a", "#1f2926"], "#0a0e0c", { size: 0.1, width: 0.16, seed });
  return paint((p, n) => {
    let c: readonly [number, number, number] = sc.at(p, n);
    c = mix(c, ash, 0.5 * smoothstep(0.5, 0.85, noise(p, 0.6, seed + 3)) * smoothstep(0.05, 0.8, n.y));
    c = mix(c, "#46512f", 0.4 * smoothstep(0.62, 0.9, noise(p, 0.32, seed + 9)) * smoothstep(0.5, 0.95, n.y));
    c = mix(c, "#a3b0a6", 0.1 * smoothstep(0.3, 1, n.y));
    c = mix(c, Math.sin(p.z * 28) > 0.15 ? "#8f8565" : "#716849", 0.92 * smoothstep(-0.15, -0.6, n.y));
    c = mix(c, "#15110e", 0.7 * smoothstep(0.55, 0.0, p.y));
    return c;
  });
}
function neckPaint(seed: number, ash: string) {
  const sc = scales(["#2d3a33", "#28342e", "#36443b", "#212b27"], "#0a0e0c", { size: 0.09, width: 0.16, seed });
  return paint((p, n, s) => {
    let c: readonly [number, number, number] = sc.at(p, n);
    c = mix(c, ash, 0.5 * smoothstep(0.5, 0.85, noise(p, 0.6, seed + 3)) * smoothstep(0.05, 0.8, n.y));
    c = mix(c, "#46512f", 0.35 * smoothstep(0.62, 0.9, noise(p, 0.32, seed + 9)) * smoothstep(0.5, 0.95, n.y));
    c = mix(c, "#a3b0a6", 0.1 * smoothstep(0.3, 1, n.y));
    const deg = ((s[1] % 360) + 360) % 360;
    const throat = smoothstep(80, 50, Math.abs(deg - 180));
    c = mix(c, Math.sin(s[0] * 110) > 0.1 ? "#9a8f6c" : "#766d52", throat * 0.95);
    return c;
  });
}
const BLADE_PAINT = paint((_p, _n, s) => mix("#14110e", "#c2b28c", smoothstep(0.0, 0.45, s[1])));
const BRONZE = metal("bronze", { tarnish: 0.55, verdigris: 0.5, polish: 0.1 });
const BRONZE_PLATE = panelled(BRONZE, { size: 0.14, rivets: 0.04 });

// ---------------------------------------------------------------------------------------------------------------
// Textures
const glyphLayers = (d: string, tf: string) =>
  `<g transform="${tf}" fill="none" stroke-linecap="round" stroke-linejoin="round">
     <path d="${d}" stroke="#5e1706" stroke-width="8"/>
     <path d="${d}" stroke="#ff7a1a" stroke-width="5"/>
     <path d="${d}" stroke="#ffd98a" stroke-width="1.6"/></g>`;

function eyeTex(i0: string, i1: string, i2: string, pupil: string) {
  const shape = "M3 22 Q38 2 97 42 Q72 62 38 56 Q10 48 3 22Z";
  return svg(
    `<svg viewBox="0 0 100 64">
      <defs>
        <radialGradient id="g" cx="0.5" cy="0.55" r="0.65">
          <stop offset="0" stop-color="${i0}"/><stop offset="0.55" stop-color="${i1}"/><stop offset="1" stop-color="${i2}"/>
        </radialGradient>
        <clipPath id="e"><path d="${shape}"/></clipPath>
      </defs>
      <path d="${shape}" fill="#0c0807"/>
      <g clip-path="url(#e)">
        <rect x="0" y="0" width="100" height="64" fill="url(#g)"/>
        <ellipse cx="52" cy="36" rx="5" ry="26" fill="${pupil}"/>
        <path d="M0 0 H100 V26 Q60 14 0 32Z" fill="#0c0807" opacity="0.85"/>
      </g>
      <path d="M3 22 Q38 2 97 42" stroke="#0c0807" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="${shape}" fill="none" stroke="#0c0807" stroke-width="3"/>
      <ellipse cx="42" cy="32" rx="4" ry="3" fill="#fff6d8" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );
}

const RUNES = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#5e1706" stroke-width="8"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ff7a1a" stroke-width="4.5"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="#ff7a1a" stroke-width="3" stroke-dasharray="6 5"/>
    ${glyphLayers("M-5 10 V-10 M-5 -2 L6 -10 M-5 4 L6 -4", "translate(50 24)")}
    ${glyphLayers("M-4 10 V-10 M-4 -6 L6 0 L-4 6", "translate(76 50)")}
    ${glyphLayers("M0 10 V-10 M0 -2 L-8 -10 M0 -2 L8 -10", "translate(50 76)")}
    ${glyphLayers("M5 -10 L-5 -2 L5 3 L-5 10", "translate(24 50)")}
    ${glyphLayers("M0 -8 L8 0 L0 8 L-8 0Z", "translate(50 50)")}
  </svg>`,
  { size: 256 },
);

const slash = (d: string) => `
  <path d="${d}" stroke="#1b0805" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="${d}" stroke="#8a2208" stroke-width="6.5" fill="none" stroke-linecap="round"/>
  <path d="${d}" stroke="#ff7a1a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="${d}" stroke="#ffd27a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
const SCAR = svg(
  `<svg viewBox="0 0 64 96">
    ${slash("M10 6 Q16 48 24 90")}${slash("M28 4 Q34 48 42 92")}${slash("M46 8 Q52 50 58 88")}
    <path d="M4 30 L24 22 M22 56 L42 48 M40 74 L60 68" stroke="#cdbf9c" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const crack = (d: string) => `
  <path d="${d}" stroke="#220a05" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${d}" stroke="#ff6a14" stroke-width="4.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${d}" stroke="#ffd27a" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
const CRACK = svg(
  `<svg viewBox="0 0 128 64">
    ${crack("M4 34 L22 28 L34 38 L52 30 L66 40 L88 26 L104 34 L124 22")}
    ${crack("M34 38 L30 54 L40 62")}${crack("M66 40 L72 56")}${crack("M88 26 L92 10")}${crack("M52 30 L50 14 L58 4")}
  </svg>`,
  { size: 256 },
);

const SPIKECARD = svg(
  `<svg viewBox="0 0 32 64">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#120f0d"/><stop offset="0.55" stop-color="#4d4235"/><stop offset="1" stop-color="#d6c7a0"/>
    </linearGradient></defs>
    <path d="M3 64 Q9 30 16 0 Q23 30 29 64Z" fill="url(#g)" stroke="#0c0a09" stroke-width="1.6"/>
    <path d="M16 60 V12" stroke="#0c0a09" stroke-width="1.2" opacity="0.6"/>
  </svg>`,
  { size: 128 },
);

const RAG = svg(
  `<svg viewBox="0 0 40 64">
    <defs><linearGradient id="r" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#8a1c16"/><stop offset="1" stop-color="#4b0e0c"/>
    </linearGradient></defs>
    <path d="M3 64 H37 V24 L31 4 L25 22 L19 6 L13 24 L7 10 L3 26Z" fill="url(#r)" stroke="#1d0807" stroke-width="1.5"/>
    <rect x="3" y="53" width="34" height="7" fill="#c9a14a"/>
    <path d="M3 56.5 H37" stroke="#6b4a14" stroke-width="1.2" stroke-dasharray="3 2"/>
    <path d="M12 50 V24 M22 50 V22 M30 50 V28" stroke="#2c0908" stroke-width="1.3" opacity="0.5"/>
  </svg>`,
  { size: 128 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="49" fill="#5a431f"/>
    <circle cx="50" cy="50" r="42" fill="#7d5d2a" stroke="#2a1d0c" stroke-width="2"/>
    <circle cx="50" cy="50" r="34" fill="#4a1512"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#c9a14a" stroke-width="3"/>
    <circle cx="50" cy="50" r="45.5" fill="none" stroke="#2a1d0c" stroke-width="3" stroke-dasharray="5 4"/>
    <path d="M50 20 L72 74 H62 L50 44 L38 74 H28Z" fill="#d9b85c" stroke="#2a1d0c" stroke-width="2"/>
    <path d="M18 28 L56 84 L62 78 L30 22Z" fill="#1a1208" opacity="0.75"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "hydra", paintSize: 2048 });

  const EYE_AMBER = eyeTex("#fff2b0", "#ffa51e", "#c2380a", "#120806");
  const EYE_RED = eyeTex("#ffd2a0", "#ff4a1a", "#7a0e08", "#120505");
  const EYE_BLIND = eyeTex("#f4f8f8", "#b8c8cc", "#6f858c", "#4b5d63");

  const HIDE_BODY = hidePaint(5, "#7d8a82");
  const HIDE_LEG = hidePaint(5, "#7d8a82");
  const HEAD_HIDE = hidePaint(21, "#7b887f");
  const TAIL_HIDE = hidePaint(5, "#7d8a82");

  // -------------------------------------------------------------------------------------------------------------
  // helpers that need the builder
  const blade = (
    at: any,
    wideDir: THREE.Vector3,
    upDir: THREE.Vector3,
    w: number,
    l: number,
    th: number,
    bone?: any,
  ) => {
    const o: any = { at, x: wideDir, y: upDir, thickness: th, color: BLADE_PAINT, bevel: th * 0.25 };
    if (bone) o.bone = bone;
    return b.extrude(bladeOutline(w, l), o);
  };
  // a plate standing on a tube point, leaning along (th > 0) or against the tube direction
  const leanBlade = (at: any, th: number, w: number, l: number, thick: number) => {
    const t: THREE.Vector3 = at.tangent;
    const n: THREE.Vector3 = at.n;
    const y = n.clone().multiplyScalar(Math.cos(th)).addScaledVector(t, Math.sin(th));
    const x = t.clone().multiplyScalar(Math.cos(th)).addScaledVector(n, -Math.sin(th));
    return blade(at, x, y, w, l, thick);
  };

  const spear = (hit: any, dirIn: THREE.Vector3, len: number) => {
    const bone = hit.bone;
    const d = dirIn.clone().normalize();
    b.rod(offset(hit.at, d, -0.25), offset(hit.at, d, len), 0.032, { color: WOOD, bone });
    b.spike(offset(hit.at, d, len), d, 0.14, 0.032, { color: WOOD_LT, bone });
    b.rod(offset(hit.at, d, 0.18), offset(hit.at, d, 0.3), 0.048, { color: LEATHER, bone });
    b.rod(offset(hit.at, d, len * 0.55), offset(hit.at, d, len * 0.55 + 0.07), 0.05, { color: BRONZE_FLAT, bone });
    b.cards([frame(offset(hit.at, d, len * 0.82), [0, 1, 0])], RAG, {
      size: [0.2, 0.5],
      lean: 180,
      flow: [0, 0, 1],
      bone,
    });
  };

  const SWORD_BLADE: Pt[] = [
    [-0.075, 0],
    [0.075, 0],
    [0.07, 0.22],
    [0, 0.34, "sharp"],
  ];
  const sword = (hit: any, dirIn: THREE.Vector3) => {
    const bone = hit.bone;
    const d = dirIn.clone().normalize();
    const side = perp(d);
    const g = offset(hit.at, d, 0.14);
    b.extrude(SWORD_BLADE, { at: g, x: side, y: d.clone().negate(), thickness: 0.03, color: STEEL, bone });
    b.rod(offset(g, side, -0.22), offset(g, side, 0.22), 0.032, { color: BRONZE_FLAT, bone });
    b.rod(g, offset(g, d, 0.34), 0.03, { color: LEATHER, bone });
    b.part(new THREE.SphereGeometry(0.05, 6, 5), BRONZE_FLAT, { bone, at: offset(g, d, 0.38) });
  };

  const DOME: any = [
    [0, 0],
    [0.55, 0],
    [0.58, 0.06],
    [0.5, 0.2],
    [0.3, 0.33],
    [0.1, 0.4],
    [0, 0.41],
  ];
  const pauldron = (hit: any) => {
    b.lathe(DOME, {
      at: offset(hit.at, hit.n, -0.1),
      axis: hit.n,
      bone: hit.bone,
      segments: 10,
      color: BRONZE_PLATE,
    });
    b.spike(offset(hit.at, hit.n, 0.28), hit.n, 0.38, 0.09, { color: BRONZE_FLAT, bone: hit.bone });
  };

  const SHIELD: any = [
    [0, 0],
    [0.58, 0],
    [0.58, 0.09],
    [0.5, 0.09],
    [0.48, 0.06],
    [0, 0.06],
  ];
  const shield = (hit: any) => {
    const n = hit.n.clone().add(V(0, 0.25, 0)).normalize();
    const c = offset(hit.at, n, -0.02);
    b.lathe(SHIELD, { at: c, axis: n, bone: hit.bone, segments: 12, color: BRONZE_PLATE });
    b.part(new THREE.CircleGeometry(0.47, 14), "#ffffff", {
      bone: hit.bone,
      at: offset(c, n, 0.066),
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      texture: EMBLEM,
    });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips, spine, tail
  const hips = b.joint("hips", { at: [0, 1.9, -1.5], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.9, -1.5],
      [0, 2.0, -0.6],
      [0, 2.1, 0.3],
      [0, 2.15, 1.0],
      [0, 2.1, 1.55],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const chest = spine.joints[3];

  const torso = b.sweep(
    spine,
    prof([
      [0, 0.7, 0.6],
      [0.25, 0.92, 0.78],
      [0.55, 1.02, 0.86],
      [0.85, 0.98, 0.84],
      [1, 0.7, 0.6],
    ]),
    { color: HIDE_BODY, sides: 10, shift: [0, -0.08] },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.9, -1.5],
      [0, 1.85, -2.5],
      [0, 1.55, -3.5],
      [0, 1.1, -4.4],
      [0, 0.7, -5.2],
      [0.25, 0.4, -5.9],
      [0.7, 0.2, -6.4],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"], role: "tail" },
  );
  const tailSw = b.sweep(tail, [0.62, 0.52, 0.4, 0.3, 0.2, 0.12, 0.07], {
    color: TAIL_HIDE,
    sides: 8,
    caps: "point",
  });

  // dorsal plates: torso and tail
  let bi = 0;
  b.along(
    torso,
    6,
    (at: any) => {
      const k = bi++;
      leanBlade(at, -0.45, 0.2 - 0.015 * k, 0.55 - 0.04 * k, 0.05);
    },
    { from: 0.03, to: 0.62 },
  );
  let ti = 0;
  b.along(
    tailSw,
    10,
    (at: any) => {
      const k = ti++;
      leanBlade(at, 0.5, 0.17 - 0.012 * k, 0.5 - 0.04 * k, 0.045);
    },
    { from: 0.04, to: 0.9 },
  );
  // mace of barbs at the tail tip
  b.ring(tail.at(0.97), { count: 6, radius: 0.08 }, (it: any) =>
    b.spike(it, it, 0.34, 0.06, { color: BONE }),
  );
  b.spike(tail.at(1), tail.at(1), 0.6, 0.09, { color: BONE });

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const paw = (foot: any, fp: number[], s: number, big: number) => {
    const fx = fp[0];
    const fz = fp[2];
    b.part(new THREE.SphereGeometry(0.3 * big, 8, 6), HIDE_LEG, {
      bone: foot,
      at: [fx, 0.18 * big, fz + 0.14],
      scale: [1.0, 0.6, 1.3],
    });
    for (const j of [-1, 0, 1]) {
      const base = V(fx + j * 0.13, 0.11 * big, fz + 0.3);
      const tip = V(fx + j * 0.3 + s * 0.04, 0.1 * big, fz + 0.72 - Math.abs(j) * 0.08);
      b.capsule(base, tip, 0.1 * big, { bone: foot, color: TOE });
      b.spike(tip, V(j * 0.2, -0.45, 1).normalize(), 0.3 * big, 0.065 * big, { bone: foot, color: CLAW });
    }
    b.spike(V(fx, 0.5, fz - 0.15), V(0, -0.3, -1).normalize(), 0.28, 0.05, { bone: foot, color: CLAW });
  };

  const FR = [0.52, 0.42, 0.32, 0.27];
  const HR = [0.62, 0.5, 0.34, 0.27, 0.24];
  const fore: Record<string, any> = {};

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front leg
    const sh = [s * 0.85, 1.95, 1.0];
    const fp = [s * 1.2, 0.22, 1.55];
    const fpts = limb(sh, fp, [1.0, 1.0], [0, 0, -1]);
    const arm = b.chain(`foreLeg${L}`, fpts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "leg",
      contact: [fp[0], 0, fp[2]],
    });
    fore[L] = arm;
    b.sweep(arm, FR, { color: HIDE_LEG, sides: 8 });
    b.part(new THREE.SphereGeometry(0.62, 8, 6), HIDE_BODY, {
      bone: arm.joints[0],
      at: sh,
      scale: [0.85, 1.0, 1.0],
    });
    paw(arm.tip, fp, s, 1.0);

    // hind leg
    const hp = [s * 0.9, 1.9, -1.2];
    const ap = [s * 1.25, 0.24, -1.15];
    const hpts = limb(hp, ap, [0.95, 0.95, 0.6], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`hindLeg${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `ankle${L}`],
      role: "leg",
      contact: [ap[0], 0, ap[2]],
    });
    b.sweep(leg, HR, { color: HIDE_LEG, sides: 8 });
    b.part(new THREE.SphereGeometry(0.72, 8, 6), HIDE_BODY, {
      bone: leg.joints[0],
      at: hp,
      scale: [0.85, 1.0, 1.05],
    });
    paw(leg.tip, ap, s, 1.15);
    // knee spike
    b.spike(leg.at(0.33), leg.at(0.33), 0.32, 0.08, { color: BONE_DK });
  }

  // shoulder pauldrons and a hoplon shield, spears and swords: this beast has fought armies
  const bodySurf = b.surface(torso);
  for (const s of [1, -1]) pauldron(bodySurf.nearest([s * 1.5, 2.1, 1.0]));
  shield(bodySurf.nearest([1.3, 2.55, -0.9]));
  spear(bodySurf.nearest([0.35, 2.9, -0.35]), V(0.25, 1, -0.5), 1.1);
  spear(bodySurf.nearest([-0.8, 2.75, -0.1]), V(-0.5, 1, -0.3), 0.95);
  spear(bodySurf.nearest([0.2, 2.3, -3.3]), V(0.3, 1, -0.2), 0.8);
  sword(bodySurf.nearest([-1.4, 2.2, -0.9]), V(-1, 0.45, -0.2));

  // glowing marks on the hide
  for (const [t, deg] of [
    [0.42, 90],
    [0.42, 270],
  ]) {
    const pt: any = torso.at(t, deg);
    glow(b.decal(torso, RUNES, { at: pt, dir: pt.n, size: [1.0, 1.0] }), 1.2);
  }
  for (const [t, deg, w, h] of [
    [0.72, 125, 0.5, 0.75],
    [0.22, 235, 0.5, 0.75],
    [0.6, 300, 0.45, 0.68],
  ]) {
    const pt: any = torso.at(t, deg);
    glow(b.decal(torso, SCAR, { at: pt, dir: pt.n, size: [w, h] }), 1.1);
  }
  for (const [t, deg] of [
    [0.3, 18],
    [0.52, 342],
  ]) {
    const pt: any = torso.at(t, deg);
    glow(b.decal(torso, CRACK, { at: pt, dir: pt.n, up: [0, 0, 1], size: [0.9, 0.45] }), 1.2);
  }
  {
    const pt: any = tailSw.at(0.3, 35);
    glow(b.decal(tailSw, CRACK, { at: pt, dir: pt.n, up: [0, 0, -1], size: [0.7, 0.35] }), 1.2);
  }

  // shackle on the right foreleg with a trailing broken chain
  {
    const armR = fore.R;
    const cp: any = armR.at(0.8);
    const r = lerpKeys(FR, 0.8);
    b.lathe(
      [
        [r * 1.0, -0.12],
        [r * 1.12 + 0.07, -0.12],
        [r * 1.12 + 0.09, 0],
        [r * 1.12 + 0.07, 0.12],
        [r * 1.0, 0.12],
      ],
      { at: cp, axis: cp.tangent, bone: cp.bone, segments: 10, color: BRONZE_PLATE },
    );
    const c0 = cp.at as THREE.Vector3;
    b.part(new THREE.TorusGeometry(0.07, 0.025, 5, 8), IRON_FLAT, {
      bone: cp.bone,
      at: V(c0.x - r - 0.14, c0.y, c0.z),
      dir: [1, 0, 0],
      axis: "z",
    });
    const linkA = new THREE.TorusGeometry(0.07, 0.02, 5, 8).scale(1, 1.4, 1);
    const linkB = linkA.clone().rotateY(Math.PI / 2);
    const pts = [
      V(c0.x - r - 0.3, c0.y - 0.05, c0.z + 0.05),
      V(c0.x - r - 0.5, 0.14, c0.z + 0.35),
      V(c0.x - r - 0.85, 0.1, c0.z + 0.9),
      V(c0.x - r - 1.35, 0.1, c0.z + 1.2),
      V(c0.x - r - 1.95, 0.1, c0.z + 1.1),
    ];
    let li = 0;
    b.along(catmull(pts), 9, (at: any) => {
      b.part((li++ % 2 ? linkB : linkA).clone(), IRON_FLAT, { frame: at, bone: armR.tip });
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Heads
  function buildHead(c: any, head: any) {
    const hs: number = c.hs;
    const P = (x: number, y: number, z: number) => head.local([x * hs, y * hs, z * hs]);
    const D = (x: number, y: number, z: number): THREE.Vector3 => head.dir([x, y, z]);
    const fwd = D(0, 1, 0);
    const upv = D(0, 0, 1);

    // skull + snout
    const skullP = catmull([P(0, -0.25, 0), P(0, 0.25, 0.03), P(0, 0.7, 0), P(0, 1.15, -0.04)]);
    const skull = b.sweep(
      skullP,
      prof(
        [
          [0, 0.27, 0.26],
          [0.25, 0.31, 0.29],
          [0.5, 0.25, 0.2],
          [0.8, 0.2, 0.145],
          [1, 0.19, 0.13],
        ],
        hs,
      ),
      { bone: head, color: HEAD_HIDE, sides: 8 },
    );
    const sk = b.surface(skull);
    const hitAt = (x: number, y: number, z: number) => sk.nearest(P(x, y, z));

    // lower jaw on its own joint
    const jaw = b.joint(`jaw${c.lab}`, { parent: head, at: P(0, 0, -0.22), aim: P(0, 1.0, -0.22), role: "jaw" });
    b.sweep(
      catmull([P(0, 0.0, -0.24), P(0, 0.5, -0.27), P(0, 0.95, -0.22), P(0, 1.1, -0.19)]),
      prof(
        [
          [0, 0.2, 0.08],
          [0.4, 0.19, 0.08],
          [0.8, 0.14, 0.06],
          [1, 0.12, 0.055],
        ],
        hs,
      ),
      { bone: jaw, color: HEAD_HIDE, sides: 8 },
    );
    b.sweep(catmull([P(0, 0.1, -0.17), P(0, 0.6, -0.18), P(0, 0.95, -0.17)]), [0.07 * hs, 0.04 * hs], {
      bone: jaw,
      color: TONGUE,
      sides: 6,
    });
    // chin barbels
    for (const m of [1, -1]) {
      b.spike(P(m * 0.07, 0.85, -0.3), P(m * 0.12, 0.7, -0.68), null, 0.04 * hs, { bone: jaw, color: BONE_DK });
    }
    b.spike(P(0, 0.62, -0.33), P(0, 0.55, -0.75), null, 0.05 * hs, { bone: jaw, color: BONE_DK });

    // teeth, merged per bone
    const tooth = (x: number, y: number, z: number, d: number[], len: number, r: number) => {
      const g = new THREE.ConeGeometry(r * hs, len * hs, 5, 1);
      g.translate(0, (len * hs) / 2, 0);
      g.applyQuaternion(aim(V(d[0], d[1], d[2]).normalize()));
      g.translate(x * hs, y * hs, z * hs);
      return g;
    };
    const upper: THREE.BufferGeometry[] = [];
    const lower: THREE.BufferGeometry[] = [];
    for (const m of [1, -1]) {
      for (let j = 0; j < 5; j++) {
        const fang = j === 2;
        upper.push(
          tooth(m * (0.2 - 0.028 * j), 0.32 + 0.16 * j, -0.15 + 0.01 * j, [m * 0.08, 0.15, -1], fang ? 0.3 : 0.13, fang ? 0.042 : 0.03),
        );
        lower.push(tooth(m * (0.13 - 0.012 * j), 0.3 + 0.15 * j, -0.2, [-m * 0.03, -0.1, 1], 0.1 + 0.015 * j, 0.027));
      }
      lower.push(tooth(m * 0.215, 1.0, -0.2, [m * 0.25, 0.35, 1], 0.32, 0.045));
    }
    b.part(mergeGeometries(upper)!, TOOTH, { bone: head, frame: head, flat: true });
    b.part(mergeGeometries(lower)!, TOOTH, { bone: jaw, frame: head, flat: true });

    // eyes, brows, nose, lip line
    for (const m of [1, -1]) {
      const eh: any = hitAt(m * 0.27, 0.4, 0.07);
      const dirv = eh.n.clone().addScaledVector(fwd, 0.7).normalize();
      const blindEye = c.blind && m < 0;
      glow(
        b.decal(skull, blindEye ? EYE_BLIND : c.eye, {
          at: eh,
          dir: dirv,
          up: upv,
          size: [0.27 * hs, 0.17 * hs],
          mirror: m < 0,
          segments: 8,
        }),
        blindEye ? 0.5 : 1.3,
      );
      const bp = [
        [m * 0.3, 0.2, 0.24],
        [m * 0.2, 0.42, 0.28],
        [m * 0.08, 0.64, 0.21],
      ].map((q) => hitAt(q[0], q[1], q[2]).at);
      b.sweep(catmull(bp), [0.075 * hs, 0.04 * hs], {
        bone: head,
        color: BROW,
        sides: 6,
        caps: { start: "round", end: "point" },
      });
      b.part(new THREE.SphereGeometry(0.035 * hs, 5, 4), NOSE, { bone: head, at: hitAt(m * 0.085, 1.1, 0.06).at });
      b.rod(P(m * 0.2, 0.15, -0.2), P(m * 0.17, 1.05, -0.15), 0.022 * hs, { bone: head, color: GUM });
      // cheek spikes
      for (let j = 0; j < 3; j++) {
        const base = hitAt(m * 0.27, 0.3 - 0.13 * j, -0.12).at;
        b.spike(base, P(m * (0.5 + 0.06 * j), 0.0 - 0.14 * j, -0.12 - 0.1 * j), null, 0.045 * hs, {
          bone: head,
          color: BONE_DK,
        });
      }
    }
    b.sweep(
      catmull([hitAt(0, 0.15, 0.3).at, hitAt(0, 0.5, 0.22).at, hitAt(0, 0.85, 0.16).at, hitAt(0, 1.08, 0.1).at]),
      [0.06 * hs, 0.03 * hs],
      { bone: head, color: BONE_DK, sides: 6 },
    );

    // horns
    const horn = (pts: any[], r: number) =>
      b.sweep(catmull(pts), [r * hs, 0], {
        bone: head,
        color: HORN_ROOT,
        bands: [
          [0.3, HORN_ROOT],
          [0.65, HORN_MID],
          [1, BONE],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
      });
    for (const m of [1, -1]) {
      if (c.horn === "crown") {
        horn([hitAt(m * 0.16, 0.05, 0.27).at, P(m * 0.32, -0.25, 0.62), P(m * 0.46, -0.75, 0.78), P(m * 0.4, -1.3, 0.55)], 0.1);
        horn([hitAt(m * 0.2, 0.3, 0.25).at, P(m * 0.34, 0.15, 0.5), P(m * 0.4, -0.1, 0.72)], 0.06);
      } else if (c.horn === "ram") {
        horn([hitAt(m * 0.2, 0.05, 0.2).at, P(m * 0.45, -0.1, 0.32), P(m * 0.68, 0.05, 0.12), P(m * 0.62, 0.3, -0.12), P(m * 0.46, 0.38, -0.14)], 0.1);
      } else if (c.horn === "spike") {
        for (let j = 0; j < 3; j++) {
          b.spike(
            hitAt(m * (0.2 + 0.04 * j), 0.1 + 0.15 * j, 0.22 - 0.08 * j).at,
            P(m * (0.45 + 0.15 * j), -0.3 + 0.2 * j, 0.55 - 0.22 * j),
            null,
            0.065 * hs,
            { bone: head, color: BONE_DK },
          );
        }
      } else if (c.horn === "swept") {
        horn([hitAt(m * 0.15, 0.1, 0.28).at, P(m * 0.25, -0.3, 0.65), P(m * 0.3, -0.95, 0.95), P(m * 0.28, -1.5, 1.0)], 0.08);
        horn([hitAt(m * 0.22, 0.3, 0.24).at, P(m * 0.36, 0.0, 0.5), P(m * 0.42, -0.35, 0.62)], 0.05);
      } else if (c.horn === "broken") {
        if (m > 0) {
          horn([hitAt(m * 0.2, 0.05, 0.2).at, P(m * 0.45, -0.1, 0.32), P(m * 0.68, 0.05, 0.12), P(m * 0.62, 0.3, -0.12), P(m * 0.46, 0.38, -0.14)], 0.1);
        } else {
          const base = hitAt(m * 0.2, 0.05, 0.2).at;
          const stubEnd = P(m * 0.3, -0.05, 0.5);
          b.sweep(catmull([base, P(m * 0.25, 0.0, 0.36), stubEnd]), [0.1 * hs, 0.085 * hs], {
            bone: head,
            color: HORN_MID,
            caps: { start: "flat", end: "flat" },
            sides: 6,
          });
          b.part(new THREE.CylinderGeometry(0.1 * hs, 0.125 * hs, 0.12 * hs, 6), BRONZE_PLATE, {
            bone: head,
            at: stubEnd,
            dir: stubEnd.clone().sub(base).normalize(),
          });
        }
      }
    }

    // frill of plates behind the skull
    [-72, -36, 0, 36, 72].forEach((a) => {
      const ra = (a * Math.PI) / 180;
      const rad = D(1, 0, 0).multiplyScalar(Math.sin(ra)).addScaledVector(upv, Math.cos(ra));
      const tang = D(1, 0, 0).multiplyScalar(Math.cos(ra)).addScaledVector(upv, -Math.sin(ra));
      const yv = rad.clone().multiplyScalar(0.82).addScaledVector(fwd, -0.55).normalize();
      blade(P(Math.sin(ra) * 0.2, -0.12, Math.cos(ra) * 0.2), tang, yv, 0.12 * hs, (0.62 - Math.abs(a) * 0.004) * hs, 0.035, head);
    });

    // scarring
    if (c.scar) {
      const m = c.blind ? -1 : 1;
      const sh: any = hitAt(m * 0.2, 0.36, 0.2);
      const dv = sh.n.clone().addScaledVector(fwd, 0.4).normalize();
      glow(b.decal(skull, SCAR, { at: sh, dir: dv, up: upv, size: [0.3 * hs, 0.45 * hs], segments: 8 }), 1.0);
    }

    return jaw;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Necks and heads
  const HEADS = [
    { lab: "R2", k: -2, H: 3.9, F: 1.5, hs: 0.92, eye: EYE_RED, horn: "ram", open: 8, collar: false, scar: false, blind: false, seed: 31 },
    { lab: "R1", k: -1, H: 4.5, F: 2.0, hs: 1.04, eye: EYE_AMBER, horn: "spike", open: 20, collar: true, scar: false, blind: false, seed: 32 },
    { lab: "C", k: 0, H: 5.1, F: 2.2, hs: 1.2, eye: EYE_AMBER, horn: "crown", open: 30, collar: true, scar: true, blind: false, seed: 33 },
    { lab: "L1", k: 1, H: 4.4, F: 2.0, hs: 1.04, eye: EYE_RED, horn: "swept", open: 14, collar: true, scar: false, blind: false, seed: 34 },
    { lab: "L2", k: 2, H: 3.8, F: 1.4, hs: 0.9, eye: EYE_RED, horn: "broken", open: 10, collar: false, scar: true, blind: true, seed: 35 },
  ];

  HEADS.forEach((c, hi) => {
    const k = c.k;
    const hs = c.hs;
    const bx = k * 0.42;
    const z0 = 1.15 - Math.abs(k) * 0.12;
    const y0 = 2.2;
    const lat = k * 1.2;
    const pts: THREE.Vector3[] = [];
    for (const u of [0, 0.22, 0.45, 0.68, 0.88]) {
      pts.push(
        V(
          bx + lat * Math.pow(u, 1.5),
          y0 + (c.H - y0) * (1 - Math.pow(1 - u, 1.7)),
          z0 + c.F * Math.pow(u, 2.3) - 0.3 * Math.sin(u * Math.PI),
        ),
      );
    }
    const hd = V(k * 0.1, -0.22, 1).normalize();
    const end = pts[4].clone().addScaledVector(hd, 0.55 * hs);
    pts.push(end);

    const neck = b.chain(`neck${c.lab}`, catmull(pts), {
      parent: chest,
      names: [1, 2, 3, 4, 5].map((i) => `neck${c.lab}_${i}`),
      role: "neck",
    });
    const NR = [0.44, 0.37, 0.32, 0.29, 0.27 * hs];
    const sw = b.sweep(neck, NR, { color: neckPaint(40 + hi, "#7b887f"), sides: 8 });

    const head = b.joint(`head${c.lab}`, { parent: neck, at: end, dir: hd, role: "head" });

    // bronze bands
    const band = (t: number, w: number) => {
      const p: any = neck.at(t);
      const r = lerpKeys(NR, t);
      b.lathe(
        [
          [r * 1.0, -w],
          [r * 1.12 + 0.05, -w],
          [r * 1.12 + 0.07, 0],
          [r * 1.12 + 0.05, w],
          [r * 1.0, w],
        ],
        { at: p, axis: p.tangent, bone: p.bone, segments: 10, color: BRONZE_PLATE },
      );
    };
    band(0.22, 0.1);
    band(0.58, 0.08);
    if (c.collar) {
      band(0.9, 0.09);
      const p: any = neck.at(0.9);
      const rr = lerpKeys(NR, 0.9) * 1.12 + 0.07;
      b.ring(p, { count: 9, radius: rr }, (it: any) => b.spike(it, it, 0.2, 0.045, { color: IRON_FLAT }));
    }

    // spine crest along the back of the neck
    let si = 0;
    b.along(
      sw,
      7,
      (at: any) => {
        const j = si++;
        b.spike(at, at, 0.2 - 0.014 * j, 0.055, { color: BONE_DK });
      },
      { from: 0.16, to: 0.86 },
    );

    // ember cracks on the neck sides
    for (const deg of [95, 265]) {
      const pt: any = sw.at(0.3, deg);
      glow(b.decal(sw, CRACK, { at: pt, dir: pt.n, size: [0.6, 0.3] }), 1.1);
    }

    // shaggy bone-spines
    const hits = b.surface(sw).scatter(22, {
      rng: rng(40 + hi),
      minDist: 0.25,
      filter: (h: any) => h.n.y > 0.1,
    });
    b.cards(hits, SPIKECARD, {
      size: [0.1, 0.26],
      lean: 35,
      bend: 20,
      vary: 0.3,
      rng: rng(60 + hi),
      flow: [0, -0.2, -1],
    });

    const jaw = buildHead(c, head);
    b.pose(jaw, { axis: [1, 0, 0], deg: c.open });

    // weapons stuck in the necks
    if (c.lab === "C") spear(b.surface(sw).nearest(neck.at(0.22).at), V(0.5, 0.8, -0.3), 0.9);
    if (c.lab === "L1") sword(b.surface(sw).nearest(neck.at(0.3).at), V(1, 0.4, 0.1));
  });

  return b.root;
}
