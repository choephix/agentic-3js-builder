import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  line,
  offset,
  lerp,
  rng,
  paint,
  mottle,
  noise,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Battle-worn Griffin Knight",
  description:
    "A fantasy knight in dented plate: great helm with eye slit and crimson plume, gold-filigree pauldrons, blue griffin surcoat, kite shield with an arrow in it, broadsword raised, torn crimson cape.",
};

// ---------- palette ----------
const STEEL = "#9aa3ad";
const STEEL_DK = "#68717b";
const STEEL_LT = "#e2e7ec";
const GOLD = "#d6a73e";
const GOLD_DK = "#9c7424";
const CRIMSON = "#a8172a";
const CRIMSON_DK = "#5e0b17";
const BLUE = "#1f3f82";
const BLUE_DK = "#14295a";
const LEATHER = "#6a4426";
const LEATHER_DK = "#3b2616";
const WOOD = "#8a6440";
const FLETCH = "#ece4d2";

// ---------- textures ----------
const GRIFFIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
<g fill="#e4e8ef" stroke="#4f5f78" stroke-width="4" stroke-linejoin="round">
<path d="M150 165 Q190 175 182 212 Q176 232 158 226 Q172 214 168 196 Q162 180 140 176 Z"/>
<path d="M112 92 L138 40 L160 12 L178 8 L172 34 L190 36 L176 60 L192 70 L168 86 L182 100 L150 110 L128 122 Z"/>
<path d="M118 168 L104 200 L90 222 L110 228 L118 206 L134 178 Z"/>
<path d="M140 160 L150 196 L156 224 L176 224 L166 196 L156 156 Z"/>
<ellipse cx="118" cy="138" rx="34" ry="46" transform="rotate(-22 118 138)"/>
<path d="M96 120 L64 104 L48 92 L40 100 L50 108 L44 116 L58 116 L90 136 Z"/>
<path d="M104 138 L70 146 L54 142 L50 152 L62 156 L58 164 L74 160 L108 154 Z"/>
<path d="M104 112 Q84 96 80 78 L96 70 Q110 88 122 100 Z"/>
<circle cx="80" cy="66" r="20"/>
<path d="M64 58 L36 70 L52 76 L60 82 Z" fill="#d6a73e"/>
<path d="M82 48 L96 30 L94 54 Z"/>
</g>
<g fill="none" stroke="#4f5f78" stroke-width="3">
<path d="M140 50 L150 78 M158 30 L160 70 M170 52 L162 84"/>
</g>
<circle cx="76" cy="62" r="4.5" fill="#1a1d25"/>
</svg>`;

function faceSvg(): string {
  let holes = "";
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      holes += `<circle cx="${30 + c * 18}" cy="${132 + r * 18}" r="4.5" fill="#07080b"/>`;
  let rivets = "";
  for (const y of [22, 110, 165, 220]) rivets += `<circle cx="120" cy="${y}" r="5" fill="#8a6a20"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
<rect x="108" y="0" width="24" height="240" fill="#d6a73e" stroke="#8a6a20" stroke-width="3"/>
<rect x="16" y="68" width="90" height="13" rx="5" fill="#07080b"/>
<rect x="134" y="68" width="90" height="13" rx="5" fill="#07080b"/>
${holes}${rivets}
</svg>`;
}

const DENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<ellipse cx="32" cy="32" rx="28" ry="21" fill="#5a626c"/>
<ellipse cx="30" cy="29" rx="19" ry="13" fill="#7b848e"/>
<path d="M8 38 Q32 58 56 36" stroke="#eef2f6" stroke-width="5" fill="none"/>
</svg>`;

const CHIP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M6 30 L18 10 L30 18 L44 6 L58 24 L50 34 L60 50 L38 56 L28 46 L12 54 L16 40 Z" fill="#aeb6bf" stroke="#5c6670" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

const TEAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 72">
<path d="M24 2 L30 16 L26 24 L34 36 L28 46 L32 60 L24 70 L18 56 L22 46 L14 34 L20 24 L16 12 Z" fill="#5d646c" stroke="#0e1a38" stroke-width="4" stroke-linejoin="round"/>
<g fill="#8b939b"><circle cx="24" cy="20" r="2.5"/><circle cx="22" cy="34" r="2.5"/><circle cx="26" cy="48" r="2.5"/><circle cx="24" cy="60" r="2.5"/></g>
</svg>`;

const featherSvg = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
<path d="M16 96 C 3 74 1 34 16 2 C 31 34 29 74 16 96 Z" fill="${c}"/>
<path d="M16 94 L16 8" stroke="#8c8c8c" stroke-width="2.5"/>
<path d="M6 62 L14 54 M26 50 L18 42 M5 36 L13 31 M27 70 L19 64" stroke="#b0b0b0" stroke-width="2"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });

  // ---------- paints ----------
  const steelBase = mottle(STEEL, STEEL_DK, { size: 0.08, contrast: 0.55, seed: 2 });
  const steel = paint((p) => {
    const sc = noise(p, 0.045, 11);
    const gate = noise(p, 0.16, 5);
    if (Math.abs(sc - 0.5) < 0.01 && gate > 0.56) return STEEL_LT;
    if (noise(p, 0.03, 23) > 0.8) return STEEL_DK;
    return steelBase;
  });
  const filigree = paint((p) => {
    const f =
      Math.sin(p.x * 60 + 2.2 * Math.sin(p.z * 48 + p.y * 20)) *
      Math.sin(p.y * 60 + 2.2 * Math.sin(p.x * 44 - p.z * 30));
    if (Math.abs(f) < 0.09) return GOLD;
    return steel;
  });
  const blueBase = mottle(BLUE, BLUE_DK, { size: 0.1, contrast: 0.5, seed: 3 });
  const blueCloth = paint((p) => {
    const sc = noise(p, 0.05, 31);
    if (Math.abs(sc - 0.5) < 0.012 && noise(p, 0.2, 7) > 0.6) return "#4a6aa8";
    return blueBase;
  });
  const shieldBlue = paint((p) => {
    const sc = noise(p, 0.04, 41);
    if (Math.abs(sc - 0.5) < 0.012 && noise(p, 0.14, 8) > 0.5) return "#9fb0cc";
    return blueBase;
  });
  const panelPaint = paint((_p, _n, s) =>
    Math.abs(s[0]) > 0.14 || (s[1] < -0.28 && s[1] > -0.305) ? GOLD : blueCloth,
  );
  const capeBase = mottle(CRIMSON, "#7f1020", { size: 0.14, contrast: 0.6, seed: 17 });
  const capePaint = paint((_p, n, s) => {
    if (s[0] > 0.9) return CRIMSON_DK;
    if (n.z > 0.3) return "#6e0e1c";
    return capeBase;
  });
  const plumePaint = mottle(CRIMSON, "#c8303f", { size: 0.05, seed: 9 });
  const bladeSteel = paint((p) => (noise(p, 0.02, 4) > 0.74 ? "#a3acb6" : "#d3d9df"));
  const bladePaint = paint((_p, _n, s) =>
    Math.abs(s[0]) < 0.006 && s[1] > 0.03 && s[1] < 0.62 ? STEEL_DK : bladeSteel,
  );
  const gripPaint = paint((p) => (Math.floor(p.y / 0.016) % 2 ? LEATHER : LEATHER_DK));

  const griffinTex = svg(GRIFFIN, { size: 512 });
  const faceTex = svg(faceSvg(), { size: 512 });
  const dentTex = svg(DENT, { size: 128 });
  const chipTex = svg(CHIP, { size: 128 });
  const tearTex = svg(TEAR, { size: 128 });
  const featherA = svg(featherSvg("#ffffff"), { size: 128 });
  const featherB = svg(featherSvg("#cfcfcf"), { size: 128 });

  const ringOutline = (ri: number, ro: number, h: number): OutlinePoint[] => [
    [ri, 0],
    [ro, 0],
    [ro, h],
    [ri, h],
  ];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 1.0, 0],
      [0, 1.15, 0],
      [0, 1.3, 0],
      [0, 1.48, 0],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.48, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.6, 0], dir: [0, 1, 0], role: "head" });

  // ---------- torso / surcoat ----------
  const torso = b.loft(
    [
      { at: [0, 0.93, 0], w: 0.33, h: 0.24 },
      { at: [0, 1.05, 0], w: 0.31, h: 0.22 },
      { at: [0, 1.2, 0], w: 0.35, h: 0.25 },
      { at: [0, 1.36, 0.01], w: 0.42, h: 0.28 },
      { at: [0, 1.48, 0], w: 0.38, h: 0.24 },
      { at: [0, 1.56, 0], w: 0.2, h: 0.16 },
    ],
    { bone: spine, color: blueCloth, caps: "flat" },
  );
  b.decal(torso, griffinTex, { at: [0, 1.28, 0.15], dir: [0, 0, 1], size: [0.24, 0.29] });
  b.decal(torso, tearTex, { at: [-0.13, 1.12, 0.1], dir: [-0.5, 0, 0.85], size: [0.05, 0.08] });

  // belt
  const torsoSurf = b.surface(torso);
  const beltPath = torsoSurf.loop([0, 1.0, 0], { lift: 0.012 });
  b.sweep(beltPath, 0.022, { bone: hips, color: LEATHER, sides: 6 });
  const bf = beltPath.at(0);
  b.part(new THREE.BoxGeometry(0.07, 0.055, 0.016), GOLD, { at: [bf.x, bf.y, bf.z + 0.022], bone: hips });
  b.part(new THREE.BoxGeometry(0.04, 0.03, 0.018), LEATHER_DK, { at: [bf.x, bf.y, bf.z + 0.024], bone: hips });
  const studLoop = torsoSurf.loop([0, 1.0, 0], { lift: 0.03 });
  b.along(
    studLoop,
    12,
    (at) => b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at, bone: hips }),
    { from: 0.07, to: 0.93 },
  );

  // fauld (hip lames)
  for (let i = 0; i < 3; i++) {
    const top = 0.985 - 0.055 * i;
    const w = 0.37 + 0.02 * i;
    const d = 0.27 + 0.012 * i;
    b.frustumBox([0, top, 0], [0, top - 0.065, 0], [w, d], [w + 0.02, d + 0.012], { bone: hips, color: steel });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD_DK, { at: [s * (w / 2 + 0.006), top - 0.03, 0], bone: hips });
  }

  // tabard skirt panels (dagged hem)
  const panel: OutlinePoint[] = [
    [-0.16, 0, "sharp"],
    [0.16, 0, "sharp"],
    [0.17, -0.36],
    [0.12, -0.42, "sharp"],
    [0.07, -0.37],
    [0.02, -0.44, "sharp"],
    [-0.04, -0.38],
    [-0.09, -0.43, "sharp"],
    [-0.13, -0.37],
    [-0.17, -0.4, "sharp"],
  ];
  b.extrude(panel, { at: [0, 0.985, 0.155], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: panelPaint, bone: hips });
  b.extrude(panel, { at: [0, 0.985, -0.155], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: panelPaint, bone: hips });

  // empty scabbard on the left hip
  const scA = [0.23, 0.97, 0.07];
  const scB = [0.31, 0.32, -0.12];
  b.frustumBox(scA, scB, [0.026, 0.065], [0.022, 0.05], { bone: hips, color: LEATHER_DK });
  b.frustumBox(lerp(scA, scB, -0.01), lerp(scA, scB, 0.1), [0.032, 0.072], [0.031, 0.07], { bone: hips, color: GOLD });
  b.frustumBox(lerp(scA, scB, 0.86), lerp(scA, scB, 1.02), [0.028, 0.055], [0.02, 0.03], { bone: hips, color: GOLD });
  b.rod([0.18, 1.0, 0.08], [0.235, 0.94, 0.066], 0.011, { bone: hips, color: LEATHER });

  // pouch on the right hip
  b.part(new THREE.BoxGeometry(0.06, 0.08, 0.07), LEATHER, { at: [-0.205, 0.95, 0.04], bone: hips });
  b.part(new THREE.BoxGeometry(0.066, 0.03, 0.076), LEATHER_DK, { at: [-0.206, 0.98, 0.04], bone: hips });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [-0.24, 0.972, 0.04], bone: hips });

  // gorget
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.155, 0.03],
      [0.11, 0.08],
      [0.095, 0.13],
      [0, 0.13],
    ],
    { at: [0, 1.47, 0], segments: 10, spin: 18, color: steel, bone: chest },
  );
  b.part(new THREE.TorusGeometry(0.158, 0.008, 4, 12), GOLD, { at: [0, 1.475, 0], dir: [0, 1, 0], axis: "z", bone: chest });

  // ---------- great helm ----------
  const helm = b.lathe(
    [
      [0, 0],
      [0.148, 0],
      [0.153, 0.05],
      [0.148, 0.2],
      [0.142, 0.27],
      [0.11, 0.305],
      [0, 0.315],
    ],
    { at: [0, 1.555, 0], segments: 10, spin: 18, color: steel, bone: head },
  );
  b.lathe(ringOutline(0.146, 0.159, 0.026), { at: [0, 1.558, 0], segments: 10, spin: 18, color: GOLD, bone: head });
  b.lathe(ringOutline(0.142, 0.155, 0.022), { at: [0, 1.75, 0], segments: 10, spin: 18, color: GOLD, bone: head });
  b.ring(frame([0, 1.571, 0], [0, 1, 0]), { count: 12, radius: 0.16 }, (item) =>
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_DK, { at: item, bone: head }),
  );
  b.decal(helm, faceTex, { at: [0, 1.69, 0.15], dir: [0, 0, 1], size: [0.24, 0.24] });
  b.decal(helm, dentTex, { at: [-0.11, 1.65, 0.1], dir: [-0.7, 0, 0.7], size: [0.05, 0.04] });
  b.decal(helm, dentTex, { at: [0.12, 1.79, -0.06], dir: [0.9, 0.2, -0.4], size: [0.045, 0.035], roll: 30 });

  // plume
  b.part(new THREE.CylinderGeometry(0.024, 0.034, 0.05, 8), GOLD, { at: [0, 1.885, 0], bone: head });
  const plume = b.sweep(
    bezier([0, 1.89, 0], [0, 2.22, 0.02], [0, 2.2, -0.32], [0, 1.92, -0.4]),
    [0.025, 0.06, 0.075, 0.065, 0.035],
    { bone: head, color: plumePaint },
  );
  const plumeHits = b.surface(plume).scatter(150, { rng: rng(11), minDist: 0.02 });
  b.cards(plumeHits, [featherA, featherB], {
    size: [0.036, 0.11],
    lean: 45,
    bend: 30,
    vary: 0.3,
    spin: 20,
    rng: rng(12),
    color: CRIMSON,
  });

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${S}`, { parent: chest, at: [s * 0.05, 1.45, 0], aim: [s * 0.19, 1.45, 0] });
    const arm = b.chain(
      `arm${S}`,
      [
        [s * 0.19, 1.45, 0],
        [s * 0.48, 1.45, 0],
        [s * 0.74, 1.45, 0],
      ],
      { parent: clav, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const hand = arm.joints[2];

    // pauldron: dome + cascading lames, gold-etched
    const domeAxis = [s * 0.55, 1, 0];
    const dome = b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.14, 0.05],
        [0.1, 0.1],
        [0, 0.125],
      ],
      { at: [s * 0.21, 1.44, 0], axis: domeAxis, segments: 10, color: filigree, bone: shoulder },
    );
    b.part(new THREE.TorusGeometry(0.148, 0.01, 4, 12), GOLD, { at: [s * 0.21, 1.44, 0], dir: domeAxis, axis: "z", bone: shoulder });
    b.decal(dome, dentTex, { at: [s * 0.25, 1.55, 0.04], dir: [s * 0.5, 1, 0.3], size: [0.05, 0.04] });
    for (let i = 0; i < 3; i++) {
      const x0 = s * (0.25 + 0.045 * i);
      const r = 0.115 - 0.012 * i;
      b.lathe(
        [
          [r - 0.012, 0],
          [r, 0],
          [r - 0.016, 0.06],
          [r - 0.028, 0.06],
        ],
        { at: [x0, 1.45, 0], axis: [s, 0, 0], segments: 10, color: filigree, bone: shoulder },
      );
      b.part(new THREE.TorusGeometry(r, 0.006, 4, 10), GOLD, { at: [x0, 1.45, 0], dir: [s, 0, 0], axis: "z", bone: shoulder });
    }

    // rerebrace, couter, vambrace
    b.rod([s * 0.2, 1.45, 0], [s * 0.47, 1.45, 0], 0.055, { bone: shoulder, color: steel });
    b.part(new THREE.SphereGeometry(0.062, 8, 6), steel, { at: [s * 0.48, 1.45, 0], bone: elbow, flat: true });
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.014, 8), filigree, { at: [s * 0.48, 1.45, -0.06], dir: [0, 0, -1], bone: elbow });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: [s * 0.48, 1.45, -0.068], bone: elbow });
    b.rod([s * 0.49, 1.45, 0], [s * 0.72, 1.45, 0], [0.05, 0.044], { bone: elbow, color: steel });

    // gauntlet
    b.lathe(
      [
        [0.048, 0],
        [0.074, 0.075],
        [0.066, 0.078],
        [0.042, 0.006],
      ],
      { at: [s * 0.765, 1.45, 0], axis: [-s, 0, 0], segments: 10, color: steel, bone: hand },
    );
    b.part(new THREE.TorusGeometry(0.071, 0.006, 4, 10), GOLD, { at: [s * 0.69, 1.45, 0], dir: [s, 0, 0], axis: "z", bone: hand });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.095), steel, { at: [s * 0.8, 1.45, 0], bone: hand });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.022, 0.021, 0.085), STEEL_DK, { at: [s * 0.852, 1.45 + (k - 1.5) * 0.024, 0], bone: hand });
    b.capsule([s * 0.77, 1.5, 0.045], [s * 0.82, 1.512, 0.05], 0.016, { bone: hand, color: steel });

    if (s < 0) {
      // broadsword, raised
      b.rod([-0.8, 1.36, 0], [-0.8, 1.61, 0], 0.017, { bone: hand, color: gripPaint, sides: 6 });
      b.lathe(
        [
          [0, 0],
          [0.03, 0.02],
          [0.032, 0.04],
          [0.015, 0.06],
          [0, 0.066],
        ],
        { at: [-0.8, 1.3, 0], segments: 8, color: GOLD, bone: hand },
      );
      b.part(new THREE.BoxGeometry(0.24, 0.026, 0.03), GOLD, { at: [-0.8, 1.612, 0], bone: hand });
      for (const e of [1, -1])
        b.part(new THREE.SphereGeometry(0.021, 6, 4), GOLD_DK, { at: [-0.8 + e * 0.122, 1.612, 0], bone: hand, flat: true });
      b.part(new THREE.SphereGeometry(0.016, 6, 4), CRIMSON, { at: [-0.8, 1.612, 0.016], bone: hand });
      b.extrude(
        [
          [-0.028, 0, "sharp"],
          [0.028, 0, "sharp"],
          [0.026, 0.35],
          [0.019, 0.37, "sharp"],
          [0.025, 0.39],
          [0.022, 0.72],
          [0.012, 0.86],
          [0, 0.92, "sharp"],
          [-0.013, 0.85],
          [-0.021, 0.6],
          [-0.016, 0.55, "sharp"],
          [-0.022, 0.53],
          [-0.026, 0.2],
        ],
        { at: [-0.8, 1.624, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.012, 0.003], bevel: 0.003, color: bladePaint, bone: hand },
      );
    } else {
      // kite shield strapped to the left forearm
      const SH = [0.64, 1.36, 0.1];
      const kite: OutlinePoint[] = [
        [-0.28, 0.3, "sharp"],
        [-0.14, 0.34],
        [0, 0.35],
        [0.14, 0.34],
        [0.28, 0.3, "sharp"],
        [0.27, 0.05],
        [0.2, -0.2],
        [0.1, -0.42],
        [0, -0.6, "sharp"],
        [-0.1, -0.42],
        [-0.2, -0.2],
        [-0.27, 0.05],
      ];
      const inner = kite.map(
        (q): OutlinePoint =>
          q.length === 3 ? [q[0] * 0.87, q[1] * 0.9 + 0.008, "sharp"] : [q[0] * 0.87, q[1] * 0.9 + 0.008],
      );
      b.extrude(kite, { at: SH, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.006, smoothing: 1, color: GOLD, bone: elbow });
      const field = b.extrude(inner, {
        at: [SH[0], SH[1], SH[2] + 0.006],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.004,
        smoothing: 1,
        color: shieldBlue,
        bone: elbow,
      });
      b.decal(field, griffinTex, { at: [SH[0], 1.4, 0.125], dir: [0, 0, 1], size: [0.34, 0.41] });
      b.decal(field, chipTex, { at: [0.5, 1.55, 0.125], dir: [0, 0, 1], size: [0.06, 0.06] });
      b.decal(field, chipTex, { at: [0.76, 1.2, 0.125], dir: [0, 0, 1], size: [0.05, 0.045], roll: 70 });
      b.decal(field, chipTex, { at: [0.6, 0.98, 0.125], dir: [0, 0, 1], size: [0.04, 0.04], roll: 140 });
      // rim studs
      const rimPts = kite.map((q) => [SH[0] + q[0] * 0.935, SH[1] + q[1] * 0.95 + 0.004, SH[2] + 0.016]);
      b.along(catmull(rimPts, { closed: true }), 18, (at) =>
        b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD_DK, { at, bone: elbow }),
      );
      // enarme straps
      for (const x of [0.54, 0.64]) {
        b.part(new THREE.TorusGeometry(0.052, 0.009, 4, 10), LEATHER, { at: [x, 1.45, 0], dir: [1, 0, 0], axis: "z", bone: elbow });
        b.part(new THREE.BoxGeometry(0.03, 0.025, 0.04), LEATHER_DK, { at: [x, 1.45, 0.068], bone: elbow });
      }
      // an arrow stuck in the shield
      const aBase = [0.73, 1.5, 0.105];
      const aDir = [0.35, 0.3, 1];
      b.rod(aBase, offset(aBase, aDir, 0.42), 0.006, { bone: elbow, color: WOOD, sides: 5 });
      b.ring(line(offset(aBase, aDir, 0.33), offset(aBase, aDir, 0.41)), { count: 3, radius: 0.012 }, (item) =>
        b.part(new THREE.BoxGeometry(0.003, 0.07, 0.018), FLETCH, { at: item, dir: aDir, up: item.outward, bone: elbow }),
      );
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 6), CRIMSON_DK, { at: offset(aBase, aDir, 0.42), dir: aDir, bone: elbow });
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.115;
    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.1, 0.97, 0],
        [s * 0.11, 0.53, 0.01],
        [x, 0.1, 0],
        [x, 0.03, 0.2],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`], role: "leg", contact: [x, 0, 0.06] },
    );
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.joints[2];

    b.rod([s * 0.1, 0.95, 0], [s * 0.11, 0.56, 0.01], [0.08, 0.065], { bone: hip, color: steel });
    b.part(new THREE.SphereGeometry(0.068, 8, 6), filigree, { at: [s * 0.11, 0.53, 0.05], bone: knee, flat: true });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 8), filigree, { at: [s * 0.175, 0.53, 0.01], dir: [s, 0, 0], bone: knee });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at: [s * 0.183, 0.53, 0.01], bone: knee });
    b.rod([s * 0.11, 0.52, 0.01], [x, 0.07, 0], [0.062, 0.047], { bone: knee, color: steel });
    b.frustumBox([x, 0.135, 0], [x, 0.075, 0], [0.11, 0.11], [0.12, 0.12], { bone: ankle, color: steel });

    // sabaton
    b.frustumBox([x, 0.05, -0.06], [x, 0.025, 0.2], [0.1, 0.1], [0.075, 0.05], { bone: ankle, color: steel });
    for (const z of [0.05, 0.1, 0.15]) {
      const k = (z + 0.06) / 0.26;
      const top = 0.05 - 0.025 * k + (0.1 - 0.05 * k) / 2;
      b.part(new THREE.BoxGeometry(0.09 - 0.02 * k, 0.012, 0.035), STEEL_DK, { at: [x, top, z], rotation: [11, 0, 0], bone: ankle });
    }
    // golden spur
    b.rod([x, 0.06, -0.1], [x, 0.066, -0.16], 0.007, { bone: ankle, color: GOLD, sides: 5 });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 6), GOLD, { at: [x, 0.066, -0.168], dir: [1, 0, 0], bone: ankle, flat: true });
  }

  // ---------- torn cape ----------
  const xs = [0.27, 0.14, 0, -0.14, -0.27];
  const zf = [-0.21, -0.28, -0.22, -0.29, -0.21];
  const yb = [0.3, 0.42, 0.2, 0.46, 0.28];
  const edges = xs.map((cx, i) =>
    catmull([
      [cx * 0.7, 1.5, -0.135],
      [cx * 0.92, 1.2, zf[i] * 0.78],
      [cx * 1.02, 0.8, zf[i]],
      [cx * 1.08, yb[i], zf[i] - 0.02],
    ]),
  );
  for (let i = 0; i < 4; i++)
    b.membrane(edges[i], edges[i + 1], { color: capePaint, thickness: 0.012, bone: chest });
  b.sweep(catmull(xs.map((cx) => [cx * 0.7, 1.505, -0.14])), 0.022, { bone: chest, color: CRIMSON_DK, sides: 6 });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), GOLD, { at: [s * 0.15, 1.5, -0.16], dir: [0, 0, -1], bone: chest });

  return b.root;
}
