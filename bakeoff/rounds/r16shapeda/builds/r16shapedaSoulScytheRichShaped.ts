import * as THREE from "three";
import { bezier, catmull, cells, createBuilder, frame, mix, noise, paint, rng, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering stylized soul scythe: a dragon-spine shaft with a leather grip and ribbons, a clawed soul-gem foot, a horned dragon skull with a hinged jaw, and a crescent dragonbone blade edged in glowing teal soul fire, runes and drifting spirits.",
};

type V = [number, number, number];
type P2 = [number, number];
type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#f2b940";
const GOLD_DK = "#9a5f1a";
const GOLD_HI = "#ffe28a";
const TEAL = "#5ff7dc";
const TEAL_HI = "#b6fff3";
const TEAL_MID = "#1fb8b0";
const VIOLET = "#4a3578";
const VIOLET_DK = "#1d1433";
const VIOLET_HI = "#7a58b8";
const TOOTH = "#fffbe8";
const SOCKET = "#1b1226";
const BONE_FLAT = "#eadbb6";

// ---------------------------------------------------------------------------------------------------------------
// Paints: lit by place (warm up, cool under), cracks with soul light seeping through, worn gold, wrapped leather.
function boneShade(p: THREE.Vector3, n: THREE.Vector3, teal: number) {
  const l = smoothstep(-0.8, 0.85, n.y);
  let c = l < 0.5 ? mix("#8f86ad", "#ecdcb6", l * 2) : mix("#ecdcb6", "#fff4d4", (l - 0.5) * 2);
  c = mix(c, "#d8b27a", 0.45 * smoothstep(0.55, 0.8, noise(p, 0.1, 2)));
  const k = cells(p, 0.085, 5);
  const e = k.d2 - k.d1;
  if (e < 0.045) {
    const seep = smoothstep(0.35, 0.6, noise(p, 0.18, 4)) * teal;
    c = mix(mix(c, "#5a4a52", 0.55), TEAL, seep);
  }
  return c;
}

const BONE = paint((p, n) => boneShade(p, n, 0.5));

const BLADE = paint((p, n) => {
  let c = boneShade(p, n, 0.3 + 0.7 * smoothstep(0.5, 1.3, p.z));
  const r = Math.hypot(p.z - 0.45, p.y - 1.3);
  const ring = (r / 0.045) % 1;
  if (ring < 0.07) c = mix(c, "#8c7a68", 0.45);
  const tip = smoothstep(0.7, 1.4, p.z);
  c = mix(c, "#9ff5e6", 0.35 * tip * smoothstep(0.4, 0.7, noise(p, 0.07, 8)));
  return c;
});

const GOLDP = paint((p, n) => {
  const l = smoothstep(-0.6, 0.9, n.y);
  let c = mix(GOLD_DK, GOLD, 0.3 + 0.7 * l);
  c = mix(c, GOLD_HI, 0.4 * smoothstep(0.55, 0.8, noise(p, 0.03, 3)) * (0.4 + l));
  c = mix(c, "#2c8f93", 0.22 * smoothstep(0, -0.8, n.y));
  c = mix(c, "#5b3a12", 0.25 * smoothstep(0.62, 0.8, noise(p, 0.015, 6)));
  return c;
});

const LEATHER = paint((_p, n, s) => {
  const a = (((s[1] - 2160 * s[0]) % 60) + 60) % 60;
  const base = mix(VIOLET_DK, VIOLET, 0.7 * smoothstep(-0.6, 0.8, n.y));
  if (a < 7) return mix(base, "#0d0818", 0.7);
  if (a < 14) return mix(base, VIOLET_HI, 0.4);
  return base;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures: drawings carry runes, the sigil, soul fire, ghosts and the cloth ribbon.
function makeTextures() {
  const flame = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg"><g ${flip ? 'transform="translate(48,0) scale(-1,1)"' : ""}>
      <path d="M24 96 C4 82 8 62 18 46 C26 34 18 18 30 2 C32 20 46 34 42 58 C40 78 36 88 24 96 Z" fill="#19c9bb"/>
      <path d="M24 92 C12 80 15 64 22 50 C27 40 24 28 30 14 C33 30 40 42 37 60 C35 76 32 86 24 92 Z" fill="#5ff7dc"/>
      <path d="M24 86 C18 76 20 64 25 54 C28 46 28 40 30 32 C32 44 34 54 32 64 C31 76 29 82 24 86 Z" fill="#eafffb"/>
      </g></svg>`,
      { size: 128 },
    );
  const glyph = (d: string) =>
    svg(
      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" fill="none" stroke="#1a8f8c" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#9ffff0" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      { size: 128 },
    );
  return {
    flameA: flame(false),
    flameB: flame(true),
    ghost: svg(
      `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 62 L5 24 C5 5 43 5 43 24 L43 62 L34 53 L24 62 L14 53 Z" fill="#c9fff6" stroke="#19c9bb" stroke-width="3.2" stroke-linejoin="round"/>
      <ellipse cx="17" cy="26" rx="4.2" ry="6.4" fill="#0e3a44"/><ellipse cx="31" cy="26" rx="4.2" ry="6.4" fill="#0e3a44"/>
      <circle cx="18.2" cy="23.6" r="1.4" fill="#ffffff"/><circle cx="32.2" cy="23.6" r="1.4" fill="#ffffff"/>
      <ellipse cx="24" cy="40" rx="3.4" ry="4.4" fill="#0e3a44"/></svg>`,
      { size: 128 },
    ),
    ribbon: svg(
      `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d4a"/><stop offset="1" stop-color="#6a4aa0"/></linearGradient></defs>
      <path d="M2 120 L2 6 L20 24 L38 6 L38 120 Z" fill="url(#g)" stroke="#f2b940" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M8 118 L8 20 M32 118 L32 20" stroke="#f2b940" stroke-width="1.6" fill="none"/>
      <path d="M20 40 L27 52 L20 64 L13 52Z" fill="none" stroke="#5ff7dc" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M20 70 L26 80 L20 90 L14 80Z" fill="none" stroke="#5ff7dc" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="20" cy="104" r="3.2" fill="#f2b940"/></svg>`,
      { size: 192 },
    ),
    sigil: svg(
      `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#1d1433" stroke="#f2b940" stroke-width="4"/>
      <g fill="#f2b940"><path d="M32 2 L36 9 L28 9Z"/><path d="M32 62 L36 55 L28 55Z"/><path d="M2 32 L9 28 L9 36Z"/><path d="M62 32 L55 28 L55 36Z"/></g>
      <path d="M9 32 Q32 11 55 32 Q32 53 9 32 Z" fill="#37f2d4" stroke="#0e6a78" stroke-width="2"/>
      <path d="M32 18 Q40 32 32 46 Q24 32 32 18 Z" fill="#0b1b2a"/>
      <ellipse cx="27" cy="28" rx="3" ry="2" fill="#ffffff"/></svg>`,
      { size: 192 },
    ),
    runes: [
      glyph("M16 3 V29 M16 9 L26 17 M16 15 L8 23"),
      glyph("M8 4 L24 4 L9 16 L24 28 L8 28"),
      glyph("M6 28 L16 4 L26 28 M10 20 H22"),
      glyph("M8 6 L24 16 L8 26 M24 5 V27"),
    ],
  };
}

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const R = rng(7);
  const T = makeTextures();

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: a simple prop rig (shaft, claw foot, head, blade, hinged jaw).
  const root = b.joint("scythe", { at: [0, 0.9, 0], dir: [0, 1, 0] });
  const butt = b.joint("butt", { parent: root, at: [0, 0.3, 0], dir: [0, -1, 0] });
  const headJ = b.joint("head", { parent: root, at: [0, 1.6, 0], dir: [0, 1, 0] });
  const skullJ = b.joint("skull", { parent: headJ, at: [0, 1.71, 0.05], dir: [0, 0, 1] });
  const bladeJ = b.joint("blade", { parent: headJ, at: [0, 1.85, -0.1], dir: [0, 0, 1] });

  // -------------------------------------------------------------------------------------------------------------
  // Soul core running through the shaft, glowing in the gaps between vertebrae.
  glow(b.sweep([[0, 0.24, 0], [0, 1.66, 0]], 0.02, { color: TEAL, bone: root, caps: "round", sides: 6 }), 1.3);

  const ringBand = (y: number, r: number, tube: number, color: string | typeof GOLDP, bone: typeof root) =>
    b.part(new THREE.TorusGeometry(r, tube, 6, 14), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z", bone });

  // -------------------------------------------------------------------------------------------------------------
  // Foot: soul gem cradled by three talons that stand the scythe up.
  glow(b.part(new THREE.IcosahedronGeometry(0.06, 1), TEAL, { at: [0, 0.26, 0], bone: butt, flat: true }), 1.5);
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 + 0.2;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const P0: V = [0.045 * sx, 0.42, 0.045 * cz];
    const P1: V = [0.11 * sx, 0.3, 0.11 * cz];
    const P2: V = [0.17 * sx, 0.0, 0.17 * cz];
    b.sweep(bezier(P0, P1, P2), [0.034, 0], { color: BONE, bone: butt, caps: "point", sides: 6 });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), BONE, { at: [0.095 * sx, 0.33, 0.095 * cz], bone: butt });
    b.part(new THREE.ConeGeometry(0.012, 0.045, 5), GOLD, {
      at: [0.15 * sx, 0.075, 0.15 * cz],
      dir: [0.1 * sx, -1, 0.1 * cz],
      bone: butt,
    });
  }
  ringBand(0.42, 0.05, 0.014, GOLDP, butt);
  b.sweep([[0, 0.3, 0], [0, 0.46, 0]], 0.03, { color: BONE, bone: root, caps: "round", sides: 6 });

  // -------------------------------------------------------------------------------------------------------------
  // Vertebrae: the dragon's spine is the shaft. Body, two transverse wings and a swept neural spine each.
  const vertebra = (y0: number, h: number, r: number) => {
    b.lathe(
      [
        [0, 0],
        [r * 0.72, 0],
        [r, h * 0.16],
        [r * 0.8, h * 0.5],
        [r, h * 0.84],
        [r * 0.72, h],
        [0, h],
      ],
      { at: [0, y0, 0], segments: 8, color: BONE, bone: root },
    );
    for (const s of [1, -1]) {
      b.extrude(
        [
          [0, h * 0.25],
          [r * 1.2, h * 0.35],
          [r * 2.1, h * 0.9, "sharp"],
          [r * 1.3, h * 0.8],
          [0, h * 0.75],
        ],
        { at: [0, y0, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: BONE, bone: root },
      );
    }
    b.spike([0, y0 + h * 0.7, -r * 0.6], [0, 0.8, -0.6], h * 1.05, r * 0.3, { color: BONE, bone: root, sides: 5 });
  };
  for (let i = 0; i < 4; i++) {
    vertebra(0.44 + i * 0.1, 0.085, 0.04);
    ringBand(0.44 + i * 0.1 + 0.092, 0.036, 0.006, GOLDP, root);
  }
  for (let i = 0; i < 4; i++) {
    vertebra(1.19 + i * 0.1, 0.085, 0.042 + i * 0.003);
    if (i > 0) ringBand(1.19 + i * 0.1 - 0.008, 0.038, 0.006, GOLDP, root);
  }

  // Grip: wrapped leather, gold bands.
  b.sweep([[0, 0.84, 0], [0, 1.16, 0]], 0.036, { color: LEATHER, bone: root, caps: "flat", sides: 10 });
  for (const y of [0.835, 0.92, 1.0, 1.08, 1.165]) ringBand(y, 0.038, y === 0.835 || y === 1.165 ? 0.012 : 0.006, GOLDP, root);

  // Ribbons hanging from the grip, each ending in a gold bead.
  const ribbonAngles = [0.3, 1.9, 3.5, 5.0];
  b.cards(
    ribbonAngles.map((a) => frame([0.05 * Math.sin(a), 1.17, 0.05 * Math.cos(a)], [0, 1, 0])),
    T.ribbon,
    {
      size: [0.085, 0.4],
      lean: 180,
      flow: (_f, i) => [Math.sin(ribbonAngles[i]), 0, Math.cos(ribbonAngles[i])],
      bone: root,
    },
  );
  for (const a of ribbonAngles) {
    const at: V = [0.055 * Math.sin(a), 0.79, 0.055 * Math.cos(a)];
    b.part(new THREE.SphereGeometry(0.016, 6, 5), GOLDP, { at, bone: root });
    glow(b.part(new THREE.OctahedronGeometry(0.01, 0), TEAL, { at: [at[0], at[1] - 0.02, at[2]], bone: root, flat: true }), 1.4);
  }

  // Collar cup under the skull and cheek guards.
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.07, 0.025],
      [0.085, 0.06],
      [0.065, 0.08],
      [0.05, 0.05],
      [0, 0.05],
    ],
    { at: [0, 1.575, 0], segments: 10, color: GOLDP, bone: headJ },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.07, 0.02],
        [0.12, 0.08],
        [0.1, 0.16, "sharp"],
        [0.04, 0.11],
        [0, 0.1],
      ],
      { at: [s * 0.05, 1.57, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, color: GOLDP, bone: headJ },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // The dragon skull: scale constant K, local coordinates (x right/left, y up, z forward) about S.
  const K = 1.2;
  const S: V = [0, 1.71, 0.05];
  const L = (x: number, y: number, z: number): V => [x * K, S[1] + y * K, S[2] + z * K];
  const jaw = b.joint("jaw", { parent: skullJ, at: L(0, -0.045, 0.0), dir: [0, 0, 1], role: "jaw" });

  b.part(new THREE.SphereGeometry(1, 10, 8), BONE, {
    at: L(0, 0, 0),
    scale: [0.085 * K, 0.075 * K, 0.12 * K],
    bone: skullJ,
  });
  // Upper jaw / snout and tip knob.
  b.frustumBox(L(0, -0.004, 0.09), L(0, -0.012, 0.3), [0.11 * K, 0.085 * K], [0.065 * K, 0.05 * K], {
    color: BONE,
    bone: skullJ,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), BONE, {
    at: L(0, -0.012, 0.3),
    scale: [0.036 * K, 0.028 * K, 0.024 * K],
    bone: skullJ,
  });
  // Lower jaw hangs on the jaw bone.
  b.frustumBox(L(0, -0.052, 0.07), L(0, -0.062, 0.28), [0.085 * K, 0.03 * K], [0.05 * K, 0.022 * K], {
    color: BONE,
    bone: jaw,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), BONE, {
    at: L(0, -0.062, 0.285),
    scale: [0.027 * K, 0.02 * K, 0.02 * K],
    bone: jaw,
  });
  // Glowing soul glimpsed between the jaws.
  glow(
    b.part(new THREE.SphereGeometry(1, 8, 6), TEAL, {
      at: L(0, -0.036, 0.18),
      scale: [0.03 * K, 0.008 * K, 0.07 * K],
      bone: skullJ,
    }),
    1.3,
  );
  // Teeth.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = 0.14 + i * 0.04;
      const f = (z - 0.09) / 0.21;
      const yb = -0.004 + (-0.012 + 0.004) * f - (0.085 + (0.05 - 0.085) * f) / 2;
      const hw = 0.055 + (0.0325 - 0.055) * f;
      const fang = i === 3;
      b.spike(L(s * (hw - 0.006), yb + 0.004, z), [0, -1, 0], (fang ? 0.062 : 0.032) * K, 0.0075 * K, {
        color: TOOTH,
        bone: skullJ,
        sides: 5,
      });
    }
    for (let i = 0; i < 4; i++) {
      const z = 0.12 + i * 0.045;
      const f = (z - 0.07) / 0.21;
      const yt = -0.052 + (-0.062 + 0.052) * f + (0.03 + (0.022 - 0.03) * f) / 2;
      const hw = 0.0425 + (0.025 - 0.0425) * f;
      b.spike(L(s * (hw - 0.005), yt - 0.003, z), [0, 1, 0], 0.026 * K, 0.0065 * K, {
        color: TOOTH,
        bone: jaw,
        sides: 5,
      });
    }
  }
  // Eyes, brows, nostrils, horns, frills.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCKET, {
      at: L(s * 0.058, 0.012, 0.075),
      scale: [0.026 * K, 0.026 * K, 0.03 * K],
      bone: skullJ,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.015 * K, 6, 5), TEAL_HI, { at: L(s * 0.056, 0.012, 0.09), bone: skullJ }),
      1.8,
    );
    b.part(new THREE.SphereGeometry(1, 8, 6), BONE, {
      at: L(s * 0.055, 0.042, 0.075),
      scale: [0.036 * K, 0.016 * K, 0.046 * K],
      bone: skullJ,
    });
    b.part(new THREE.SphereGeometry(1, 6, 5), SOCKET, {
      at: L(s * 0.017, 0.012, 0.27),
      scale: [0.009 * K, 0.006 * K, 0.012 * K],
      bone: skullJ,
    });
    b.sweep(
      bezier(L(s * 0.055, 0.04, -0.02), L(s * 0.11, 0.075, -0.12), L(s * 0.16, 0.05, -0.22), L(s * 0.17, -0.02, -0.3)),
      [0.03 * K, 0],
      { color: BONE, bone: skullJ, caps: "point", sides: 6 },
    );
    b.sweep(
      bezier(L(s * 0.075, -0.015, -0.01), L(s * 0.14, -0.03, -0.07), L(s * 0.15, -0.08, -0.14)),
      [0.02 * K, 0],
      { color: BONE, bone: skullJ, caps: "point", sides: 6 },
    );
    b.extrude(
      [
        [0, 0],
        [0.05, 0.045],
        [0.11, 0.03],
        [0.09, 0.0],
        [0.13, -0.04],
        [0.05, -0.035],
        [0, -0.03],
      ].map(([x, y]) => [x * K, y * K] as P2),
      {
        at: L(s * 0.08, -0.02, -0.01),
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.01,
        color: TEAL_MID,
        bone: skullJ,
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // The blade: a crescent of dragon rib, outline drawn in (z forward, y up).
  const C: P2 = [0.45, 1.3];
  const UP: P2[] = [
    [-0.12, 1.78],
    [-0.06, 1.96],
    [0.12, 2.09],
    [0.4, 2.15],
    [0.7, 2.1],
    [0.98, 1.97],
    [1.2, 1.78],
    [1.34, 1.55],
    [1.4, 1.38],
  ];
  const LO: P2[] = [
    [1.4, 1.38],
    [1.3, 1.55],
    [1.16, 1.72],
    [0.94, 1.86],
    [0.66, 1.95],
    [0.38, 1.99],
    [0.16, 1.96],
    [0.0, 1.87],
  ];
  const inward = (p: P2): P2 => {
    const dx = C[0] - p[0];
    const dy = C[1] - p[1];
    const m = Math.hypot(dx, dy);
    return [dx / m, dy / m];
  };
  const outline: Pt[] = [];
  UP.forEach((p, i) => outline.push(i === 0 || i === UP.length - 1 ? [p[0], p[1], "sharp"] : [p[0], p[1]]));
  LO.slice(1).forEach((p, i, a) => outline.push(i === a.length - 1 ? [p[0], p[1], "sharp"] : [p[0], p[1]]));
  b.extrude(outline, { at: [0, 0, 0], thickness: 0.07, bevel: 0.012, smoothing: 1, color: BLADE, bone: bladeJ });

  // Glowing soul edge along the cutting side.
  const nLo = LO.length;
  const soul: Pt[] = [[LO[0][0], LO[0][1], "sharp"]];
  const edgeOut: P2[] = [];
  for (let i = 1; i < nLo; i++) {
    const d = inward(LO[i]);
    const f = i / (nLo - 1);
    const o = 0.012 + 0.03 * f;
    const q: P2 = [LO[i][0] + d[0] * o, LO[i][1] + d[1] * o];
    soul.push(q);
    edgeOut.push(q);
  }
  for (let i = nLo - 1; i >= 1; i--) {
    const d = inward(LO[i]);
    const f = i / (nLo - 1);
    const o = 0.008 + 0.03 * f;
    soul.push([LO[i][0] - d[0] * o, LO[i][1] - d[1] * o]);
  }
  glow(b.extrude(soul, { at: [0, 0, 0], thickness: 0.032, bevel: 0.006, color: TEAL, bone: bladeJ }), 1.6);

  // Soul veins and runes on both faces.
  const VEIN: P2[] = [
    [0.0, 1.94],
    [0.2, 2.03],
    [0.5, 2.07],
    [0.8, 1.985],
    [1.05, 1.85],
    [1.27, 1.64],
  ];
  for (const s of [1, -1]) {
    const path = catmull(VEIN.map(([z, y]) => [s * 0.039, y, z] as V));
    glow(b.sweep(path, [0.014, 0.004], { color: TEAL_HI, bone: bladeJ, sides: 5, caps: "round" }), 1.8);
    for (let i = 0; i < 6; i++) {
      const t = 0.12 + i * 0.135;
      const P = path.at(t);
      const Tg = path.tangentAt(t);
      const N = new THREE.Vector3(0, Tg.z, -Tg.y).normalize();
      glow(
        b.part(new THREE.PlaneGeometry(0.046, 0.046), "#ffffff", {
          at: [s * 0.0385, P.y + N.y * 0.032, P.z + N.z * 0.032],
          dir: [s, 0, 0],
          up: [Tg.x, Tg.y, Tg.z],
          axis: "z",
          texture: T.runes[i % 4],
          bone: bladeJ,
        }),
        1.6,
      );
    }
  }

  // Bone ridge along the spine of the blade.
  const upPath = catmull(UP.map(([z, y]) => [0, y, z] as V));
  for (let i = 0; i < 6; i++) {
    const t = 0.3 + i * 0.12;
    const P = upPath.at(t);
    const Tg = upPath.tangentAt(t);
    const N = new THREE.Vector3(0, Tg.z, -Tg.y).normalize();
    const len = 0.2 * (1 - t) + 0.05;
    b.extrude(
      [
        [-0.045, 0],
        [0.04, 0],
        [-0.035, len, "sharp"],
      ],
      {
        at: [0, P.y - N.y * 0.012, P.z - N.z * 0.012],
        x: [0, Tg.y === 0 && Tg.z === 0 ? 1 : Tg.y, Tg.z],
        y: [0, N.y, N.z],
        thickness: 0.035,
        color: BONE,
        bone: bladeJ,
      },
    );
  }
  // Counter-weight horn behind the root.
  b.sweep(bezier([0, 1.93, -0.1], [0, 2.0, -0.28], [0, 1.92, -0.44]), [0.04, 0], {
    color: BONE,
    bone: bladeJ,
    caps: "point",
    sides: 6,
  });
  b.sweep(bezier([0, 1.84, -0.1], [0, 1.84, -0.24], [0, 1.74, -0.34]), [0.03, 0], {
    color: BONE,
    bone: bladeJ,
    caps: "point",
    sides: 6,
  });

  // Gold clamp cuff gripping the blade root, with rivets, gems and the dragon-eye sigil.
  const clamp: P2[] = [
    [-0.14, 1.72],
    [-0.15, 1.97],
    [-0.02, 2.1],
    [0.16, 2.15],
    [0.18, 2.0],
    [0.12, 1.93],
    [0.02, 1.82],
    [-0.02, 1.72],
  ];
  b.extrude(clamp, { at: [0, 0, 0], thickness: 0.095, bevel: 0.012, smoothing: 1, color: GOLDP, bone: bladeJ });
  const cx = clamp.reduce((a, p) => a + p[0], 0) / clamp.length;
  const cy = clamp.reduce((a, p) => a + p[1], 0) / clamp.length;
  for (const s of [1, -1]) {
    clamp.forEach((p, i) => {
      const q = clamp[(i + 1) % clamp.length];
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, {
        at: [s * 0.0475, mx + (cx - mx) * 0.14, my + (cy - my) * 0.14].slice(0, 3) as V,
        bone: bladeJ,
      });
    });
  }
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.035, 0), TEAL, {
        at: [s * 0.052, 1.88, -0.085],
        scale: [0.45, 1, 0.8],
        bone: bladeJ,
        flat: true,
      }),
      1.6,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.085, 0.085), "#ffffff", {
        at: [s * 0.0505, 1.98, 0.05],
        dir: [s, 0, 0],
        axis: "z",
        texture: T.sigil,
        bone: bladeJ,
      }),
      1.3,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Soul fire trailing off the cutting edge, ghosts and sparks drifting in the curve of the blade.
  const edgePath = catmull(edgeOut.map(([z, y]) => [0, y, z] as V));
  const flameFrames = [] as ReturnType<typeof frame>[];
  for (let i = 0; i < 11; i++) {
    const t = 0.06 + i * 0.088;
    const P = edgePath.at(t);
    const Tg = edgePath.tangentAt(t);
    const d = inward([P.z, P.y]);
    const dir = new THREE.Vector3(0, d[1] * 0.55 + Tg.y * 0.75 + 0.25, d[0] * 0.55 + Tg.z * 0.75).normalize();
    flameFrames.push(frame([0, P.y, P.z], [dir.x, dir.y, dir.z]));
  }
  glow(
    b.cards(flameFrames, [T.flameA, T.flameB], {
      size: [0.075, 0.18],
      flow: [1, 0, 0],
      cross: true,
      vary: 0.3,
      spin: 20,
      rng: R,
      sink: 0.12,
      bone: bladeJ,
    }),
    1.3,
  );
  const ghostSpots: V[] = [
    [0, 1.46, 0.92],
    [0, 1.64, 0.62],
    [0, 1.3, 1.12],
  ];
  glow(
    b.cards(
      ghostSpots.map((p) => frame(p, [0, 1, 0])),
      T.ghost,
      { size: [0.1, 0.14], flow: [1, 0, 0], cross: true, vary: 0.15, rng: R, sink: 0, bone: bladeJ },
    ),
    1.2,
  );
  for (let i = 0; i < 10; i++) {
    const z = 0.55 + R() * 0.6;
    const y = 1.15 + R() * 0.4;
    const x = (R() - 0.5) * 0.24;
    glow(
      b.part(new THREE.OctahedronGeometry(0.009 + R() * 0.012, 0), TEAL_HI, {
        at: [x, y, z],
        rotation: [R() * 90, R() * 90, 0],
        bone: bladeJ,
        flat: true,
      }),
      1.8,
    );
  }

  // Rest pose: jaw hangs a little open.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  void BONE_FLAT;
  void VIOLET_HI;
  return b.root;
}
