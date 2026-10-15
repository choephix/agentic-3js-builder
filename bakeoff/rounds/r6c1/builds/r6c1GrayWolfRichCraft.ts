import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  mix,
  noise,
  cells,
  smoothstep,
  paint,
  catmull,
  limb,
  svg,
  scales,
  grain,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frostwolf Sentinel",
  description:
    "A gray wolf standing alert on a snowy rune-carved stone plinth, painted with Frostwolf-clan war paint, wearing a fang-and-ice collar, beside a glowing waystone, a clan banner, frost crystals and a snowy pine.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and palette
const G = 0.12; // plinth top: the wolf is modelled on y = 0 and lifted by G
const P = (x: number, y: number, z: number): [number, number, number] => [x, y + G, z];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SIDES: [number, string][] = [
  [1, "L"],
  [-1, "R"],
];

const INK = "#17141c";
const FUR_D = "#34363f";
const FUR_M = "#767983";
const FUR_L = "#b6b8be";
const CREAM = "#e6e0cc";
const TAN = "#9a8a6e";
const NOSE = "#121016";
const BONE = "#ece5d0";
const CLAW = "#e2dac3";
const FROST = "#58c4ee";
const ICE = "#8fe6ff";
const LEATHER = "#6a3f26";
const WOOD = "#5a3b22";

const tmp = new THREE.Vector3();
const shade = (c: readonly number[], n: THREE.Vector3): [number, number, number] => {
  const k = 0.78 + 0.3 * (n.y * 0.5 + 0.5);
  return [Math.min(1, c[0] * k * (1 + 0.05 * n.y)), Math.min(1, c[1] * k), Math.min(1, c[2] * k * (1 - 0.05 * n.y))];
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const coat = paint((p, n) => {
  const gy = p.y - G;
  tmp.set(p.x * 3.2, p.y * 1.1, p.z * 0.8);
  const streak = noise(tmp, 0.07, 5);
  const cloud = noise(p, 0.18, 11);
  let c = mix(FUR_M, FUR_L, smoothstep(0.3, 0.8, cloud) * 0.55 + streak * 0.35);
  const saddle = smoothstep(0.15, 0.7, n.y) * smoothstep(0.17, 0.08, Math.abs(p.x) + (cloud - 0.5) * 0.1);
  c = mix(c, FUR_D, saddle * 0.85);
  c = mix(c, "#6f6d66", smoothstep(0.55, 0.15, gy) * 0.5);
  c = mix(c, CREAM, smoothstep(0.0, -0.55, n.y) * 0.9);
  c = mix(c, CREAM, smoothstep(0.25, 0.65, n.z) * smoothstep(0.98, 0.8, gy) * smoothstep(0.32, 0.45, p.z) * 0.9);
  // Frostwolf war-paint bands on the forelegs
  if (p.z > 0.3 && p.z < 0.66 && ((gy > 0.3 && gy < 0.34) || (gy > 0.4 && gy < 0.43))) c = mix(c, FROST, 0.92);
  return shade(c, n);
});

const headPaint = paint((p, n) => {
  let c: readonly number[] = coat.at(p, n);
  const side = Math.abs(p.x);
  c = mix(c as any, "#d2cab4", smoothstep(0.98, 1.1, p.z) * 0.8);
  c = mix(c as any, FUR_D, smoothstep(0.5, 0.9, n.y) * smoothstep(0.05, 0.02, side) * smoothstep(0.95, 1.05, p.z) * 0.75);
  c = mix(c as any, FUR_D, smoothstep(0.5, 0.9, n.y) * smoothstep(1.0, 0.9, p.z) * 0.4);
  c = mix(c as any, CREAM, smoothstep(0.08, 0.1, side) * smoothstep(0.3, -0.1, n.y) * smoothstep(0.8, 0.86, p.z) * smoothstep(1.04, 0.98, p.z) * 0.8);
  const dEye = Math.hypot(side - 0.085, p.y - (1.205 + G), p.z - 0.97);
  c = mix(c as any, FUR_D, smoothstep(0.05, 0.03, dEye) * 0.85);
  // war paint slashes on the cheek
  const cheek = side > 0.07 && Math.abs(n.x) > 0.3 && p.z > 0.8 && p.z < 0.99 && p.y < 1.2 + G;
  if (cheek) {
    const f = (p.z - 0.8 + Math.abs(p.y - (1.13 + G)) * 1.6) * 34;
    if (f - Math.floor(f) < 0.34) c = mix(c as any, FROST, 0.92);
  }
  // whisker dots
  if (p.z > 1.04 && p.z < 1.2 && side > 0.025 && cells(p, 0.028, 4).d1 < 0.12) c = mix(c as any, INK, 0.85);
  if (p.z > 1.235) c = NOSE as any;
  return c as any;
});

const jawPaint = paint((p, n) => mix(coat.at(p, n), CREAM, 0.78));
const tailPaint = paint((p, n, s) => {
  let c: readonly number[] = coat.at(p, n);
  c = mix(c as any, FUR_D, smoothstep(0.55, 0.85, s[0]) * 0.8);
  c = mix(c as any, "#14131a", smoothstep(0.88, 0.97, s[0]));
  return c as any;
});
const earPaint = paint((p, n) => shade(mix(FUR_D, FUR_M, noise(p, 0.05, 2)), n));
const PAWP = paint((p, n) => shade(mix("#4c4d58", "#2f2f38", noise(p, 0.05, 3)), n));

const maneGrey = paint((p, n, s) => {
  const t = smoothstep(0, 0.22, s[1]);
  const c = mix(mix(FUR_M, FUR_L, t), "#d6d8dc", smoothstep(0.6, 1, t));
  return shade(c, n);
});
const maneCream = paint((p, n, s) => {
  const t = smoothstep(0, 0.2, s[1]);
  return shade(mix("#a39b86", "#f6f0de", t), n);
});

const STONE = scales(["#6c6e7a", "#5b5d69", "#7b7d88"], "#2a2a33", { size: 0.2, width: 0.16, seed: 4 });
const SNOWP = paint((p, n) => {
  const c = mix("#cfe0f2", "#ffffff", smoothstep(0.3, 0.7, noise(p, 0.3, 8)));
  const k = 0.88 + 0.12 * n.y;
  return [c[0] * k, c[1] * k, Math.min(1, c[2] * (0.98 + 0.04 * n.y))];
});
const OBEL = paint((p, n) => {
  let c = mix(mix("#5f616d", "#8a8c98", noise(p, 0.18, 2)), "#383941", smoothstep(0.55, 0.8, noise(p, 0.07, 9)) * 0.6);
  c = mix(c, "#f2f7ff", smoothstep(0.55, 0.9, n.y) * 0.95);
  return shade(c, n);
});
const PINEP = paint((p, n) => shade(mix("#2c5a40", "#1f4231", noise(p, 0.08, 6)), n));
const WOODP = grain("#6d4b2e", "#3d2915", { size: 0.02, axis: "y" });
const IRON = "#3a3c48";

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="i" cx="0.5" cy="0.5" r="0.55"><stop offset="0" stop-color="#ffe98a"/><stop offset="0.55" stop-color="#f2a71b"/><stop offset="1" stop-color="#9a4e0c"/></radialGradient>
    <clipPath id="a"><path d="M4 15 Q30 -1 61 25 Q32 38 4 15Z"/></clipPath>
  </defs>
  <path d="M4 15 Q30 -1 61 25 Q32 38 4 15Z" fill="#c9861a"/>
  <g clip-path="url(#a)">
    <circle cx="34" cy="20" r="15" fill="url(#i)"/>
    <circle cx="34" cy="20" r="6.2" fill="#0b0a10"/>
    <rect x="0" y="0" width="64" height="10" fill="#000" opacity="0.28"/>
  </g>
  <circle cx="30" cy="15" r="3" fill="#ffffff"/>
  <circle cx="38.5" cy="25" r="1.4" fill="#ffffff" opacity="0.8"/>
  <path d="M2 14 Q30 -3 62 25" fill="none" stroke="#14111a" stroke-width="5" stroke-linecap="round"/>
  <path d="M5 16 Q32 37 60 26" fill="none" stroke="#14111a" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M3 14 L0 9" stroke="#14111a" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const tuftSvg = (a: string, m: string, c: string) =>
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${m}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
  <path d="M3 64 Q6 30 16 1 Q26 30 29 64Z" fill="url(#g)" stroke="#202128" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M16 60 L16 10 M9 60 Q11 38 14 20 M23 60 Q21 38 18 20" stroke="#202128" stroke-opacity="0.45" stroke-width="1.2" fill="none"/>
</svg>`;
const TUFT_G = svg(tuftSvg("#34363f", "#787b85", "#c9ccd0"), { size: 128 });
const TUFT_C = svg(tuftSvg("#9d957f", "#d9d2bd", "#fffaf0"), { size: 128 });

const glyphs = [
  "M-4 -91 L0 -79 L4 -91 M0 -91 L0 -79",
  "M-4 -80 L-4 -91 L4 -80 L4 -91",
  "M0 -92 L0 -78 M-4 -88 L4 -84",
  "M-4 -91 L4 -91 L-4 -79 L4 -79",
  "M-3 -92 L3 -86 L-3 -80 M3 -92 L3 -80",
  "M-4 -80 L0 -92 L4 -80 M-3 -85 L3 -85",
  "M0 -92 L0 -79 M-4 -92 L0 -86 L4 -92",
  "M-4 -92 L-4 -80 M4 -92 L4 -80 M-4 -86 L4 -86",
];
const RUNE_RING = svg(
  `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle r="96" fill="none" stroke="#2aa8e8" stroke-opacity="0.35" stroke-width="6"/>
  <circle r="96" fill="none" stroke="#9af0ff" stroke-width="2.2"/>
  <circle r="74" fill="none" stroke="#9af0ff" stroke-width="2.2"/>
  <circle r="72" fill="none" stroke="#2aa8e8" stroke-opacity="0.35" stroke-width="5"/>
  ${glyphs
    .map(
      (g, i) =>
        `<g transform="rotate(${i * 45})"><path d="${g}" stroke="#2aa8e8" stroke-opacity="0.4" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${g}" stroke="#c4f6ff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    )
    .join("")}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<g transform="rotate(${i * 45 + 22.5})"><path d="M0 -88 L3 -85 L0 -82 L-3 -85Z" fill="#9af0ff"/></g>`).join("")}
</svg>`,
  { size: 512 },
);

const RUNE_STONE = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  ${[0, 1, 2, 3]
    .map(
      (i) =>
        `<g transform="translate(20 ${14 + i * 24}) scale(1.5)"><circle r="7.5" fill="none" stroke="#2aa8e8" stroke-opacity="0.5" stroke-width="2.5"/><circle r="7.5" fill="none" stroke="#bff4ff" stroke-width="1.1"/><path d="${glyphs[i * 2].replace(/-(\d+)/g, (m) => m)}" transform="translate(0 85) scale(0.7)" stroke="#d6f8ff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    )
    .join("")}
  <path d="M20 2 L20 98" stroke="#2aa8e8" stroke-opacity="0.5" stroke-width="1.2"/>
</svg>`,
  { size: 256 },
);

const BANNER = svg(
  `<svg viewBox="0 0 60 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 0 L58 0 L58 84 L30 70 L2 84Z" fill="#244d86" stroke="#d8ecff" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M7 5 L53 5 L53 76 L30 64 L7 76Z" fill="none" stroke="#7fb4e8" stroke-width="1.2"/>
  <path d="M14 14 L26 27 L34 27 L46 14 L44 36 L37 53 L30 61 L23 53 L16 36Z" fill="#f4f8ff" stroke="#0e2646" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M21 35 L27 38 L21 40Z M39 35 L33 38 L39 40Z" fill="#0e2646"/>
  <path d="M28 55 L32 55 L30 59Z" fill="#0e2646"/>
  <path d="M30 27 L30 33" stroke="#0e2646" stroke-width="1.4"/>
  <circle cx="30" cy="12" r="2" fill="#8fe6ff"/>
</svg>`,
  { size: 256 },
);

const GRASS = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 48 Q8 24 3 6 Q13 22 13 48Z" fill="#b8a05a"/>
  <path d="M13 48 Q14 20 15 2 Q21 22 22 48Z" fill="#8a9a52"/>
  <path d="M20 48 Q24 26 31 8 Q31 28 28 48Z" fill="#c8b268"/>
  <path d="M27 48 Q32 32 38 22 Q35 36 34 48Z" fill="#7c8a4a"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "frostwolf" });

  // Helpers -----------------------------------------------------------------------------------------------------
  const tuftOutline = (len: number, wid: number): any => [
    [-wid / 2, 0],
    [wid / 2, 0],
    [wid * 0.34, len * 0.55],
    [0, len, "sharp"],
    [-wid * 0.4, len * 0.5],
  ];
  const tuft = (at: any, up: THREE.Vector3, nrm: THREE.Vector3, len: number, wid: number, color: any, bone?: any, thick = 0.012) => {
    const u = up.clone().normalize();
    let side = new THREE.Vector3().crossVectors(u, nrm);
    if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
    side.normalize();
    const o: any = { at, x: side, y: u, thickness: thick, bevel: thick * 0.25, smoothing: 1, color };
    if (bone) o.bone = bone;
    return b.extrude(tuftOutline(len, wid), o);
  };

  // Skeleton ----------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: P(0, 0.8, -0.3), role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([P(0, 0.8, -0.3), P(0, 0.84, 0.0), P(0, 0.91, 0.3), P(0, 0.98, 0.52)]),
    { parent: hips, role: "spine" },
  );
  const chestJ = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([P(0, 0.98, 0.52), P(0, 1.06, 0.64), P(0, 1.15, 0.78)]), {
    parent: chestJ,
    role: "neck",
  });
  const neckJ = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckJ, at: P(0, 1.15, 0.78), dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 1.07, 0.88), aim: P(0, 1.04, 1.2), role: "jaw" });
  const baseJ = b.joint("base", { parent: hips, at: [0, 0, 0.1] });
  const tail = b.chain(
    "tail",
    catmull([P(0, 0.84, -0.5), P(0, 0.76, -0.72), P(0, 0.58, -0.88), P(0, 0.36, -0.97)]),
    { parent: hips, count: 4, role: "tail" },
  );

  // Body ---------------------------------------------------------------------------------------------------------
  const bodyLoft = b.loft(
    [
      { at: P(0, 0.8, -0.52), w: 0.22, h: 0.26 },
      { at: P(0, 0.8, -0.3), w: 0.3, h: 0.32 },
      { at: P(0, 0.76, -0.05), w: 0.27, h: 0.3 },
      { at: P(0, 0.82, 0.2), w: 0.32, h: 0.4 },
      { at: P(0, 0.88, 0.42), w: 0.38, h: 0.46 },
      { at: P(0, 0.92, 0.58), w: 0.32, h: 0.38 },
    ],
    { bone: [hips, spine], color: coat },
  );
  const neckTube = b.sweep(neck, [0.14, 0.108], { color: coat });
  const tailTube = b.sweep(tail, [0.055, 0.092, 0.105, 0.08, 0.02], { color: tailPaint, caps: "point" });

  // Head ---------------------------------------------------------------------------------------------------------
  const headLoft = b.loft(
    [
      { at: P(0, 1.18, 0.72), w: 0.22, h: 0.24 },
      { at: P(0, 1.185, 0.86), w: 0.26, h: 0.26 },
      { at: P(0, 1.16, 0.99), w: 0.17, h: 0.17 },
      { at: P(0, 1.135, 1.12), w: 0.12, h: 0.115 },
      { at: P(0, 1.12, 1.22), w: 0.09, h: 0.085 },
    ],
    { bone: head, color: headPaint },
  );
  b.sweep(catmull([P(0, 1.05, 0.84), P(0, 1.035, 1.03), P(0, 1.04, 1.2)]), (t) => [0.056 - 0.026 * t, 0.04 - 0.012 * t], {
    bone: jaw,
    color: jawPaint,
  });
  // nose, highlights
  b.part(new THREE.SphereGeometry(0.032, 8, 6), NOSE, { bone: head, at: P(0, 1.123, 1.25), scale: [1.1, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { bone: head, at: P(-0.01, 1.14, 1.268) });
  // fangs
  for (const [s] of SIDES) {
    b.spike(P(s * 0.043, 1.088, 1.15), [0, -1, 0.12], 0.05, 0.013, BONE, { bone: head, section: { ngon: 5 } });
    b.spike(P(s * 0.02, 1.052, 1.185), [0, 1, 0.1], 0.026, 0.008, BONE, { bone: jaw, section: { ngon: 5 } });
  }
  // chin tuft
  tuft(P(0, 1.0, 1.0), V(0, -0.8, -0.5), V(0, -1, 0), 0.08, 0.05, maneCream, jaw);

  // eyes, brows, lips
  const hs = b.surface(headLoft);
  for (const [s] of SIDES) {
    const hit = hs.nearest(P(s * 0.082, 1.205, 0.965));
    glow(
      b.decal(headLoft, EYE, { at: hit, dir: [s * 0.55, 0.2, 0.8], up: [0, 1, 0], size: [0.075, 0.047], mirror: s > 0, segments: 8 }),
      0.6,
    );
    b.rod(P(s * 0.03, 1.262, 0.965), P(s * 0.088, 1.232, 0.945), 0.013, FUR_D, { bone: head });
    const lip = hs.drape(
      catmull([P(s * 0.07, 1.085, 0.93), P(s * 0.062, 1.078, 1.05), P(s * 0.045, 1.08, 1.17), P(s * 0.02, 1.09, 1.24)]),
      { lift: 0.003 },
    );
    b.sweep(lip, 0.006, { color: INK, bone: head, caps: "round" });
  }

  // ears
  for (const [s, side] of SIDES) {
    const earJ = b.joint(`ear${side}`, { parent: head, at: P(s * 0.085, 1.24, 0.77), dir: [s * 0.25, 1, 0.05], role: "hinge" });
    b.extrude(tuftEar(0.07, 0.26), {
      at: P(s * 0.085, 1.24, 0.77),
      x: [1, 0, 0],
      y: [s * 0.25, 1, 0.05],
      thickness: 0.02,
      bevel: 0.004,
      smoothing: 1,
      color: earPaint,
      bone: earJ,
    });
    b.extrude(tuftEar(0.044, 0.2), {
      at: P(s * 0.085, 1.245, 0.782),
      x: [1, 0, 0],
      y: [s * 0.25, 1, 0.05],
      thickness: 0.01,
      color: "#6b4a52",
      bone: earJ,
    });
    for (let k = 0; k < 2; k++)
      tuft(P(s * (0.082 + k * 0.012), 1.25 + k * 0.01, 0.79), V(s * 0.1, 0.4, 0.9), V(0, 0, 1), 0.07, 0.03, maneCream, earJ, 0.008);
  }

  // cheek ruff
  const hc = P(0, 1.16, 0.9);
  for (const [s] of SIDES) {
    [
      [85, -25],
      [85, -8],
      [85, 10],
      [68, -16],
      [68, 2],
    ].forEach(([az, el], i) => {
      const h = hs.around(hc).at(s * az, el);
      if (h) tuft(h.moved([0, -0.012, 0]), V(s * 0.4, -0.3 - i * 0.03, -0.85), h.n, 0.11 + (i % 2) * 0.02, 0.06, maneCream, head);
    });
  }

  // Legs ---------------------------------------------------------------------------------------------------------
  const paw = (joint: any, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PAWP, { bone: joint, at: [x, G + 0.05, z + 0.05], scale: [0.058, 0.052, 0.1] });
    for (const k of [-1, 0, 1]) {
      const tz = z + 0.135 - Math.abs(k) * 0.012;
      b.part(new THREE.SphereGeometry(0.028, 6, 4), PAWP, { bone: joint, at: [x + k * 0.03, G + 0.028, tz] });
      b.spike([x + k * 0.03, G + 0.03, tz + 0.02], [k * 0.12, -0.4, 1], 0.05, 0.012, CLAW, { bone: joint });
    }
  };

  for (const [s, side] of SIDES) {
    // front leg
    const sh = P(s * 0.14, 0.8, 0.42);
    const fpts = limb(sh, P(s * 0.135, 0.09, 0.46), [0.37, 0.36], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, fpts, {
      parent: chestJ,
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.1, 0.072, 0.052, 0.046], { color: coat });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: fl.joints[0],
      at: [sh[0] + s * 0.02, sh[1] - 0.08, sh[2] - 0.02],
      scale: [0.1, 0.2, 0.14],
    });
    paw(fl.joints[2], fpts[2].x, fpts[2].z);
    tuft(fpts[1], V(0, -0.5, -1), V(0, 0, -1), 0.13, 0.06, maneGrey, fl.joints[1]);
    tuft(offset(fpts[1], [0, -1, 0], 0.07), V(0, -0.7, -0.8), V(0, 0, -1), 0.1, 0.05, maneCream, fl.joints[1]);

    // hind leg: knee forward, hock back
    const hp = P(s * 0.14, 0.78, -0.4);
    const hpts = limb(hp, P(s * 0.13, 0.08, -0.56), [0.3, 0.3, 0.26], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.11, 0.076, 0.05, 0.042], { color: coat });
    const mid = hpts[0].clone().lerp(hpts[1], 0.45).add(V(s * 0.03, 0, 0));
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: hl.joints[0],
      at: mid,
      dir: hpts[1].clone().sub(hpts[0]),
      scale: [0.105, 0.19, 0.16],
    });
    paw(hl.joints[3], hpts[3].x, hpts[3].z);
    tuft(hpts[2], V(0, -0.2, -1), V(0, 0, -1), 0.11, 0.05, maneGrey, hl.joints[2]);
  }

  // Mane, ruff, chest ---------------------------------------------------------------------------------------------
  const topSkin = b.surface([bodyLoft, neckTube]);
  [-0.2, -0.05, 0.1, 0.24, 0.38, 0.52, 0.64, 0.74].forEach((z, i) => {
    const h = topSkin.ray([0, 3, z], [0, -1, 0]);
    if (!h) return;
    const L = 0.14 + 0.1 * Math.min(1, i / 5);
    tuft(h.moved([0, -0.025, 0]), V(0, 1, -0.5), V(1, 0, 0), L * 1.1, 0.13, maneGrey);
    for (const [s] of SIDES)
      tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.45, 0.4, -0.8), h.n, L * 0.8, 0.09, maneGrey);
  });

  const nk = neck.at(0.18);
  const nkTan = nk.tangent.clone();
  b.ring(nk, { count: 12, radius: 0.13 }, (it: any) => {
    const out = it.axis.clone();
    const up = out.clone().multiplyScalar(0.55).addScaledVector(nkTan, -0.9);
    const front = it.t > 0.3 && it.t < 0.7;
    tuft(it, up, out, 0.2, 0.09, front ? maneCream : maneGrey);
  });
  const nk2 = neck.at(0.4);
  const nk2Tan = nk2.tangent.clone();
  b.ring(nk2, { count: 9, radius: 0.12 }, (it: any) => {
    const out = it.axis.clone();
    const up = out.clone().multiplyScalar(0.5).addScaledVector(nk2Tan, -0.9);
    tuft(it, up, out, 0.15, 0.08, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
  });

  for (const y of [0.74, 0.82, 0.9]) {
    for (const x of [-0.1, 0, 0.1]) {
      const h = topSkin.ray([x, y + G, 2], [0, 0, -1]);
      if (h) tuft(h.moved([0, -0.02, 0]), V(x * 0.8, -1, -0.25), h.n, 0.16, 0.08, maneCream);
    }
  }

  // fur cards
  const neckSkin = b.surface(neckTube);
  const bodySkin = b.surface(bodyLoft);
  b.cards(
    neckSkin.scatter(110, {
      rng: rng(21),
      minDist: 0.035,
      filter: (h: any) => Math.abs(neck.path.closestT(h.at) - 0.55) > 0.09,
    }),
    TUFT_G,
    { size: [0.05, 0.12], lean: 60, bend: 25, vary: 0.3, rng: rng(22), spin: 12 },
  );
  b.cards(
    bodySkin.scatter(70, {
      rng: rng(23),
      minDist: 0.045,
      filter: (h: any) => h.at.z > 0.2 && h.n.y > -0.1 && h.at.y - G > 0.8,
    }),
    TUFT_G,
    { size: [0.055, 0.13], lean: 62, bend: 25, vary: 0.3, rng: rng(24), spin: 12 },
  );
  b.cards(
    bodySkin.scatter(60, {
      rng: rng(25),
      minDist: 0.045,
      filter: (h: any) => h.at.z > 0.3 && h.n.z > 0.35 && h.at.y - G < 0.95,
    }),
    TUFT_C,
    { size: [0.05, 0.12], lean: 70, bend: 25, vary: 0.3, rng: rng(26), flow: [0, -1, -0.2] },
  );

  // Tail tufts
  [0.2, 0.35, 0.5, 0.65, 0.8].forEach((t) => {
    for (const ang of [80, -80]) {
      const sp: any = tailTube.at(t, ang);
      const up = sp.tangent.clone().multiplyScalar(0.9).addScaledVector(sp.n, 0.45);
      tuft(sp, up, sp.n, 0.13, 0.065, maneGrey);
    }
  });

  // Collar: strap, beads, fang and ice pendant ---------------------------------------------------------------------
  const collar = neckSkin.loop(neck.at(0.55), { lift: 0.018 });
  const nj = neck.joints[1];
  b.sweep(collar, 0.017, { color: LEATHER, bone: nj });
  let bead = 0;
  b.along(collar, 14, (at: any) => {
    bead++;
    b.part(new THREE.SphereGeometry(0.015, 6, 4), bead % 3 === 0 ? ICE : bead % 2 ? BONE : "#3a2a20", { at, bone: nj });
  });
  const c55 = neck.at(0.55).at;
  const front = neckSkin.ray([c55.x, c55.y - 0.02, c55.z + 0.6], [0, 0, -1]);
  if (front) {
    b.spike(front, [0, -1, 0.3], 0.1, 0.03, BONE, { bone: nj, section: { ngon: 5 } });
    glow(
      b.part(new THREE.OctahedronGeometry(0.03), ICE, {
        bone: nj,
        at: offset(front, [0, -0.5, 0.9], 0.075),
        scale: [0.8, 1.5, 0.8],
        flat: true,
      }),
      1.4,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The base
  const bp = (geo: THREE.BufferGeometry, color: any, opts: any = {}) => b.part(geo, color, { bone: baseJ, ...opts });
  const CZ = 0.1;
  b.lathe(
    [
      [0, 0],
      [1.28, 0],
      [1.28, 0.06],
      [1.2, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, CZ], segments: 10, color: STONE, bone: baseJ },
  );
  const snow = b.lathe(
    [
      [0, 0.095],
      [1.2, 0.095],
      [1.22, 0.11],
      [1.12, G],
      [0.7, G + 0.004],
      [0, G + 0.006],
    ],
    { at: [0, 0, CZ], segments: 10, color: SNOWP, bone: baseJ },
  );
  glow(
    bp(new THREE.PlaneGeometry(2.1, 2.1), "#ffffff", {
      at: [0, G + 0.011, CZ],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_RING,
    }),
    1.2,
  );

  // snow mounds
  [
    [-0.72, -0.85, 0.2],
    [0.85, 0.85, 0.17],
    [-0.88, 0.95, 0.15],
    [0.25, -1.0, 0.16],
  ].forEach(([x, z, r]) =>
    bp(new THREE.SphereGeometry(r, 8, 5), SNOWP, { at: [x, G + 0.005, z], scale: [1.2, 0.45, 1.0] }),
  );

  // rocks
  [
    [-0.98, 0.5, 0.16, 0.12, 0.13, 20],
    [1.0, 0.1, 0.14, 0.1, 0.12, 50],
    [0.55, -0.85, 0.15, 0.09, 0.13, 70],
    [-0.4, -0.97, 0.13, 0.08, 0.11, 10],
    [0.4, 1.02, 0.12, 0.08, 0.1, 35],
  ].forEach(([x, z, sx, sy, sz, ry]) => {
    bp(new THREE.IcosahedronGeometry(1, 0), OBEL, {
      at: [x, G + sy * 0.55, z],
      scale: [sx, sy, sz],
      rotation: [0, ry, 0],
      flat: true,
    });
    bp(new THREE.IcosahedronGeometry(1, 0), SNOWP, {
      at: [x, G + sy * 0.95, z],
      scale: [sx * 0.8, sy * 0.4, sz * 0.8],
      rotation: [0, ry, 0],
      flat: true,
    });
  });

  // grass tufts poking through the snow
  b.cards(
    b.surface(snow).scatter(34, {
      rng: rng(31),
      minDist: 0.12,
      filter: (h: any) => Math.hypot(h.at.x, h.at.z - CZ) > 0.88 && h.n.y > 0.7,
    }),
    GRASS,
    { size: [0.12, 0.14], lean: 6, vary: 0.3, rng: rng(32), spin: 180 },
  );

  // waystone obelisk
  const OX = -0.95;
  const OZ = -0.45;
  bp(new THREE.BoxGeometry(0.5, 0.1, 0.5), STONE, { at: [OX, G + 0.05, OZ] });
  bp(new THREE.BoxGeometry(0.32, 0.8, 0.32), OBEL, { at: [OX, G + 0.5, OZ] });
  bp(new THREE.BoxGeometry(0.38, 0.06, 0.38), STONE, { at: [OX, G + 0.13, OZ] });
  bp(new THREE.BoxGeometry(0.38, 0.06, 0.38), STONE, { at: [OX, G + 0.88, OZ] });
  bp(new THREE.ConeGeometry(0.255, 0.22, 4), OBEL, { at: [OX, G + 1.02, OZ], rotation: [0, 45, 0], flat: true });
  glow(
    bp(new THREE.OctahedronGeometry(0.09), ICE, { at: [OX, G + 1.28, OZ], scale: [0.8, 1.6, 0.8], flat: true }),
    1.5,
  );
  glow(bp(new THREE.OctahedronGeometry(0.035), ICE, { at: [OX + 0.17, G + 1.18, OZ + 0.08], scale: [0.8, 1.5, 0.8], flat: true }), 1.3);
  glow(
    bp(new THREE.PlaneGeometry(0.2, 0.5), "#ffffff", { at: [OX, G + 0.52, OZ + 0.164], dir: [0, 0, 1], axis: "z", texture: RUNE_STONE }),
    1.2,
  );
  glow(
    bp(new THREE.PlaneGeometry(0.2, 0.5), "#ffffff", { at: [OX + 0.164, G + 0.52, OZ], dir: [1, 0, 0], axis: "z", texture: RUNE_STONE }),
    1.2,
  );

  // frost crystals
  [
    [0, 0, 6, 0, 0.36, 0.05],
    [0.1, 0.06, 28, 18, 0.26, 0.038],
    [-0.09, 0.05, -26, 14, 0.22, 0.034],
    [0.04, -0.1, 12, -30, 0.2, 0.032],
    [-0.04, 0.12, -10, 34, 0.14, 0.026],
  ].forEach(([dx, dz, tx, tz, len, r]) => {
    const d = V(Math.sin((tx * Math.PI) / 180), 1, Math.sin((tz * Math.PI) / 180));
    glow(b.spike([0.8 + dx, G, 0.95 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
  });

  // snowy pine
  const PX = 0.92;
  const PZ = -0.5;
  b.rod([PX, G, PZ], [PX, G + 0.4, PZ], 0.04, WOODP, { bone: baseJ });
  [0, 1, 2].forEach((k) => {
    const r = 0.3 - 0.07 * k;
    const h = 0.34;
    const yc = G + 0.3 + k * 0.22 + h / 2;
    bp(new THREE.ConeGeometry(r, h, 7, 1), PINEP, { at: [PX, yc, PZ], flat: true });
    bp(new THREE.ConeGeometry(r * 0.58, h * 0.5, 7, 1), SNOWP, { at: [PX, yc + h * 0.25 + 0.012, PZ], flat: true });
  });

  // clan banner
  const BX = -0.75;
  const BZ = 0.85;
  b.rod([BX, G, BZ], [BX, G + 1.05, BZ], 0.022, WOODP, { bone: baseJ });
  b.spike([BX, G + 1.05, BZ], [0, 1, 0], 0.12, 0.03, IRON, { bone: baseJ });
  b.rod([BX + 0.02, G + 0.93, BZ], [BX - 0.38, G + 0.93, BZ], 0.014, WOODP, { bone: baseJ });
  bp(new THREE.SphereGeometry(0.02, 6, 4), IRON, { at: [BX - 0.39, G + 0.93, BZ] });
  bp(new THREE.PlaneGeometry(0.3, 0.48), "#ffffff", { at: [BX - 0.2, G + 0.67, BZ + 0.004], dir: [0, 0, 1], axis: "z", texture: BANNER });
  bp(new THREE.PlaneGeometry(0.3, 0.48), "#ffffff", { at: [BX - 0.2, G + 0.67, BZ - 0.004], dir: [0, 0, -1], axis: "z", texture: BANNER });
  b.spike([BX - 0.2, G + 0.4, BZ], [0, -1, 0], 0.07, 0.014, "#d8ecff", { bone: baseJ });

  return b.root;

  // Ear outline: a pointed, slightly bowed triangle.
  function tuftEar(w: number, h: number): any {
    return [
      [-w, 0],
      [w, 0],
      [w * 0.72, h * 0.5],
      [0, h, "sharp"],
      [-w * 0.72, h * 0.5],
    ];
  }
}
