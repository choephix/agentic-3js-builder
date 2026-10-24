```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  offset,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  spots,
  countershade,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Snow Leopard on a Frosted Ledge",
  description:
    "A Genshin-style cel-shaded snow leopard crouched on a snowy rock ledge: smoky rosette coat, jade eyes, fluffy cheek ruffs and a huge ringed tail curled around its side, with glowing cryo crystals and a frost glyph carved into the stone.",
};

// ---------------------------------------------------------------------------------------------------------------
// Basics

const D2R = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** Height of the ledge top: the leopard stands on it. */
const Y0 = 0.3;
/** A point above the ledge top. */
const P = (x: number, y: number, z: number) => V(x, Y0 + y, z);

type Fill = string | Paint;
type OL = ([number, number] | [number, number, "sharp"])[];
type S3 = [number, number, number];

function keyed(t: number, keys: number[][]) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const c = keys[i];
      const u = (t - a[0]) / Math.max(c[0] - a[0], 1e-6);
      const s = u * u * (3 - 2 * u);
      return a[1] + (c[1] - a[1]) * s;
    }
  }
  return keys[keys.length - 1][1];
}

function perp(x: THREE.Vector3, up: THREE.Vector3) {
  const u = up.clone().addScaledVector(x, -up.dot(x));
  if (u.lengthSq() < 1e-8) return V(0, 1, 0);
  return u.normalize();
}

function need<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`snow leopard: no surface hit for ${what}`);
  return v;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette

const FUR_TOP = "#dedad2";
const FUR_WARM = "#d3c8b3";
const FUR_SMOKE = "#bdb9b5";
const BELLY = "#f7f4ed";
const ROS = "#383641";
const ROS2 = "#4c4854";
const EAR_BACK = "#2b2932";
const EAR_SPOT = "#ebe8e0";
const EAR_RIM = "#4a4650";
const INNER_EAR = "#ecd3cd";
const NOSE_PINK = "#cf8d93";
const NOSE_DARK = "#5a3b44";
const NOSE_HI = "#f2c3c6";
const MOUTH_C = "#9e4757";
const TONGUE = "#e07d8c";
const TOOTH = "#fbf8ef";
const WHISK = "#fbfbf6";

const STONE_DK = "#4c5468";
const STONE_LT = "#909bb0";
const STONE_LINE = "#363d4e";
const LICHEN_A = "#e0a84a";
const LICHEN_B = "#a8bf62";
const SNOW = "#f3f8ff";
const SNOW_EDGE = "#c6d8f0";
const ICE = "#cdeeff";
const CRYO_A = "#8be4ff";
const CRYO_B = "#c4f5ff";

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** The coat: smoky cream with broken dark rosettes, pale belly. */
const COAT_RAW = countershade(
  spots(mottle(FUR_TOP, FUR_WARM, { size: 0.16, seed: 2 }), [ROS, ROS2], {
    size: 0.09,
    amount: 0.62,
    rosette: true,
    seed: 3,
  }),
  BELLY,
  { level: -0.32, soft: 0.22 },
);
const COAT = cel(COAT_RAW, undefined, { threshold: 0.0 });

/** Head: small solid spots, smokier top, cream underneath. */
const HEAD_RAW = countershade(
  spots(mottle(FUR_TOP, FUR_SMOKE, { size: 0.08, seed: 5 }), ROS, { size: 0.034, amount: 0.42, seed: 21 }),
  BELLY,
  { level: -0.15, soft: 0.2 },
);
const HEAD = cel(HEAD_RAW, undefined, { threshold: 0.0 });
const CHEEK = cel(countershade(HEAD_RAW, BELLY, { level: 0.25, soft: 0.15 }), undefined, { threshold: 0.0 });
const MUZZLE = cel(countershade(mottle("#c6c0b5", "#d8d2c6", { size: 0.03, seed: 7 }), BELLY, { level: 0.55, soft: 0.12 }));
const PADS = cel("#fbf9f4");
const JAW = cel(BELLY);

/** Legs fade to pale, sparsely spotted socks near the paws. */
const LEG_RAW = paint((p, n) => mix(COAT_RAW.at(p, n), BELLY, smoothstep(Y0 + 0.17, Y0 + 0.06, p.y)));
const LEG = cel(LEG_RAW, undefined, { threshold: 0.0 });

/** Ringed tail: rosettes near the root, bold dark rings and a black tip. */
const isRing = (t: number) => t > 0.94 || (t > 0.5 && ((t - 0.5) * 10) % 1 < 0.38);
const TAIL = cel(
  paint((_p, _n, s) => (isRing(s[0]) ? ROS : COAT_RAW)),
  undefined,
  { threshold: 0.0 },
);

/** Shaped fur blades: root colour to a bright tip along the drawing's x. */
const CHEEK_BLADE = cel(paint((_p, _n, s) => mix("#cbc6bc", "#fdfcf8", smoothstep(0.0, 0.1, s[0]))));
const CHEST_BLADE = cel(paint((_p, _n, s) => mix("#e8e3d8", "#ffffff", smoothstep(0.0, 0.1, s[0]))));
const ELBOW_BLADE = cel(paint((p, n, s) => mix(COAT_RAW.at(p, n), "#f3efe7", smoothstep(0.0, 0.07, s[0]))));

const NOSE = cel(
  paint((_p, n, s) => {
    if (n.z < 0.55) return NOSE_DARK;
    if (s[1] > 0.006 && Math.abs(s[0]) < 0.012) return NOSE_HI;
    return NOSE_PINK;
  }),
);

/** Ear: grey front, black back with the pale "thumbprint" spot. */
const earPaint = (front: THREE.Vector3) =>
  cel(
    paint((_p, n, s) => {
      const d = n.dot(front);
      if (d < -0.5) return Math.hypot(s[0], s[1] - 0.028) < 0.013 ? EAR_SPOT : EAR_BACK;
      if (d > 0.5) return FUR_TOP;
      return EAR_RIM;
    }),
  );

/** Stone: cool blue-grey strata, lichen on the walls, snow drifts on every upward face. */
const STONE_RAW = paint((p, n) => {
  const m = noise(p, 0.22, 11);
  let c = mix(STONE_DK, STONE_LT, 0.2 + 0.55 * m + 0.25 * smoothstep(-0.4, 0.9, n.y));
  const band = (((p.y * 8 + noise(p, 0.3, 4) * 1.8) % 1) + 1) % 1;
  if (n.y < 0.55 && band < 0.08) c = mix(c, STONE_LINE, 0.75);
  if (n.y > -0.25 && n.y < 0.6 && noise(p, 0.07, 8) > 0.7)
    c = mix(c, noise(p, 0.05, 9) > 0.5 ? LICHEN_A : LICHEN_B, 0.85);
  const snow = (n.y - 0.5) * 0.4 + (noise(p, 0.15, 5) - 0.5) * 1.1;
  if (snow > 0.1) return SNOW;
  if (snow > 0.055) return SNOW_EDGE;
  return c;
});
const STONE = cel(STONE_RAW, undefined, { threshold: 0.05 });
const SNOWCAP = cel(paint((_p, n) => (n.y > -0.1 ? SNOW : SNOW_EDGE)));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const ALMOND = "M8 41 Q30 9 62 13 Q90 17 94 37 Q78 62 46 63 Q20 61 8 41Z";

function eyeTexture() {
  return svg(
    `<svg viewBox="0 0 100 72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ir" cx="0.55" cy="0.66" r="0.62">
          <stop offset="0" stop-color="#f6f9d8"/>
          <stop offset="0.42" stop-color="#bcd9a4"/>
          <stop offset="0.8" stop-color="#6f9c86"/>
          <stop offset="1" stop-color="#3f6a66"/>
        </radialGradient>
        <clipPath id="al"><path d="${ALMOND}"/></clipPath>
      </defs>
      <path d="M1 44 Q26 -2 64 3 Q99 8 99 38 Q84 72 46 71 Q14 69 1 44Z" fill="#f7f5ef"/>
      <path d="${ALMOND}" fill="url(#ir)"/>
      <g clip-path="url(#al)">
        <path d="M0 0 H100 V24 Q60 31 0 27Z" fill="#2f4d4d" opacity="0.6"/>
        <circle cx="54" cy="40" r="15.5" fill="none" stroke="#3c5f58" stroke-width="2.5"/>
        <circle cx="54" cy="40" r="12.5" fill="#15141b"/>
        <ellipse cx="45" cy="29" rx="7.5" ry="5.5" fill="#ffffff"/>
        <circle cx="64" cy="50" r="3.2" fill="#ffffff"/>
        <circle cx="38" cy="47" r="1.8" fill="#ffffff"/>
        <path d="M28 54 Q50 61 74 53" fill="none" stroke="#f4ffe0" stroke-width="2.4" opacity="0.85"/>
      </g>
      <path d="${ALMOND}" fill="none" stroke="#1b1921" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M4 42 Q28 4 62 9 Q88 13 96 33" fill="none" stroke="#1b1921" stroke-width="8" stroke-linecap="round"/>
      <path d="M8 38 Q3 33 1 25" fill="none" stroke="#1b1921" stroke-width="6" stroke-linecap="round"/>
      <path d="M93 40 Q89 55 93 71" fill="none" stroke="#1b1921" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}

function mouthTexture() {
  let dots = "";
  for (const s of [1, -1])
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++) {
        const cx = 50 + s * (15 + col * 7 + row * 2.5);
        const cy = 10 + row * 7;
        dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.1" fill="#4e3f48"/>`;
      }
  return svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      ${dots}
      <path d="M50 2 V30" stroke="#2e1f2a" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M50 30 Q42 47 24 40 M50 30 Q58 47 76 40" fill="none" stroke="#2e1f2a" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M40 46 Q50 52 60 46" fill="none" stroke="#7a4a58" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}

function tuftTexture() {
  return svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 64 C2 40 6 18 9 2 C12 20 15 44 15 64 Z" fill="#e4e4e4" stroke="#8c8c8c" stroke-width="1.6"/>
      <path d="M18 64 C21 44 25 24 30 8 C29 28 28 46 29 64 Z" fill="#d2d2d2" stroke="#8c8c8c" stroke-width="1.6"/>
      <path d="M10 64 C12 38 15 16 19 0 C21 22 21 44 22 64 Z" fill="#ffffff" stroke="#8c8c8c" stroke-width="1.6"/>
    </svg>`,
    { size: 128 },
  );
}

function wispTexture() {
  return svg(
    `<svg viewBox="0 0 24 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 80 C1 52 5 26 8 4 C11 28 13 54 12 80 Z" fill="#dedede" stroke="#8a8a8a" stroke-width="1.4"/>
      <path d="M10 80 C12 50 16 24 21 0 C21 28 19 56 21 80 Z" fill="#ffffff" stroke="#8a8a8a" stroke-width="1.4"/>
    </svg>`,
    { size: 160 },
  );
}

function frostTexture() {
  return svg(
    `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 48 Q8 26 3 10 Q14 26 15 48Z" fill="#d8d8d8" stroke="#909090" stroke-width="1.5"/>
      <path d="M18 48 Q20 20 24 2 Q28 22 29 48Z" fill="#ffffff" stroke="#909090" stroke-width="1.5"/>
      <path d="M32 48 Q36 28 45 14 Q40 32 40 48Z" fill="#e2e2e2" stroke="#909090" stroke-width="1.5"/>
      <circle cx="24" cy="6" r="3" fill="#ffffff"/>
      <circle cx="5" cy="12" r="2.4" fill="#ffffff"/>
      <circle cx="44" cy="16" r="2.4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
}

function glyphTexture() {
  const pt = (r: number, a: number) => `${(50 + Math.sin(a) * r).toFixed(1)} ${(50 - Math.cos(a) * r).toFixed(1)}`;
  let rays = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D2R;
    rays += `M${pt(9, a)} L${pt(33, a)} M${pt(21, a)} L${pt(29, a + 0.35)} M${pt(21, a)} L${pt(29, a - 0.35)} `;
  }
  let gems = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 + 30) * D2R;
    gems += `<circle cx="${(50 + Math.sin(a) * 40).toFixed(1)}" cy="${(50 - Math.cos(a) * 40).toFixed(1)}" r="2.6" fill="#e8fbff"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#5fd2f5" stroke-width="4"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke="#a9ecff" stroke-width="2.2" stroke-dasharray="6 5"/>
      ${gems}
      <path d="${rays}" fill="none" stroke="#e6faff" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 38 L60 50 L50 62 L40 50Z" fill="#ffffff" stroke="#7fe0ff" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Model

export default function build() {
  const b = createBuilder({ name: "snowLeopard", paintSize: 2048 });
  const R = rng(17);

  const EYE = eyeTexture();
  const MOUTH = mouthTexture();
  const TUFT = tuftTexture();
  const WISP = wispTexture();
  const FROST = frostTexture();
  const GLYPH = glyphTexture();

  const sphere = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);
  const blob = (at: THREE.Vector3, sc: S3, color: Fill, bone: Joint, segs: [number, number] = [12, 8], name = "blob") =>
    b.part(sphere(segs[0], segs[1]), color, { bone, at, scale: sc, name });

  // ------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0, 0] });

  const rumpP = P(0, 0.36, -0.42);
  const hipsP = P(0, 0.4, -0.28);
  const midP = P(0, 0.37, -0.02);
  const chestP = P(0, 0.39, 0.22);
  const neckP = P(0, 0.47, 0.34);
  const headP = P(0, 0.53, 0.42);

  const hips = b.joint("hips", { parent: root, at: hipsP, role: "spine" });
  const spine = b.chain("spine", catmull([hipsP, midP, chestP]), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([chestP, neckP, headP]), {
    parent: spine.joints[2],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: headP, dir: [0, -0.12, 1], role: "head" });

  /** Head scale: every head position and size goes through it. */
  const H = 1.1;
  const hp = (x: number, y: number, z: number) => head.at.clone().add(V(x * H, y * H, z * H));

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.06, 0.04),
    aim: hp(0, -0.09, 0.17),
    role: "jaw",
  });

  // ------------------------------------------------------------------ body
  const bodyPts = [rumpP, hipsP, midP, chestP, neckP, headP];
  const bodyPath = catmull(bodyPts);
  const tk = bodyPts.map((p) => bodyPath.closestT(p));
  const kz = (vals: number[]) => tk.map((t, i) => [t, vals[i]]);
  const RXK = kz([0.1, 0.145, 0.13, 0.145, 0.095, 0.07]);
  const RYK = kz([0.1, 0.15, 0.14, 0.165, 0.1, 0.07]);
  const SYK = kz([0, 0, -0.02, -0.03, -0.005, 0]);
  const body = b.sweep(bodyPath, (t: number): [number, number] => [keyed(t, RXK), keyed(t, RYK)], {
    bone: [hips, spine, neck, head],
    shift: (t: number): [number, number] => [0, keyed(t, SYK)],
    color: COAT,
    sides: 12,
    name: "body",
  });
  const bodySurf = b.surface(body);

  // ------------------------------------------------------------------ legs
  const pawToes = (c: THREE.Vector3, bone: Joint, reach: number, tag: string) => {
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5;
      b.part(sphere(8, 6), LEG, {
        bone,
        at: V(c.x + o * 0.024, Y0 + 0.021, c.z + reach - Math.abs(o) * 0.012),
        scale: [0.016, 0.021, 0.02],
        name: `toe${tag}${i}`,
      });
    }
  };

  const bladeOL = (len: number, w: number): OL => [
    [0, -w * 0.55],
    [len * 0.4, -w],
    [len, w * 0.15, "sharp"],
    [len * 0.55, w * 0.95],
    [0, w * 0.6],
  ];
  const blade = (
    at: THREE.Vector3,
    dirX: THREE.Vector3,
    upHint: THREE.Vector3,
    len: number,
    w: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) => {
    const x = dirX.clone().normalize();
    const y = perp(x, upHint);
    return b.extrude(bladeOL(len, w), {
      at,
      x,
      y,
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color,
      bone,
      name,
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front leg: elbow tucked back, paw planted forward.
    const shoulderP = P(s * 0.09, 0.33, 0.2);
    const wristP = P(s * 0.1, 0.055, 0.36);
    const fpts = limb(shoulderP, wristP, [0.18, 0.17], [[0, 0, -1]]);
    const legF = b.chain(`legF${side}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.1, Y0, 0.395],
    });
    b.sweep(legF, [0.06, 0.046, 0.04], { color: LEG, sides: 9, name: `legF${side}` });
    const shJ = legF.joints[0];
    const elJ = legF.joints[1];
    const wrJ = legF.joints[2];
    blob(shJ.at.clone().add(V(s * 0.025, 0.03, -0.02)), [0.062, 0.1, 0.085], COAT, shJ, [12, 8], `shoulder${side}`);
    const pawF = P(s * 0.1, 0.033, 0.395);
    blob(pawF, [0.052, 0.034, 0.066], LEG, wrJ, [12, 8], `pawF${side}`);
    pawToes(pawF, wrJ, 0.052, `F${side}`);
    for (let k = 0; k < 2; k++)
      blade(
        elJ.at.clone().add(V(s * (0.02 + k * 0.012), -0.01 - k * 0.025, -0.03)),
        V(s * (0.25 + k * 0.15), -0.4 - k * 0.2, -1),
        V(0, 1, 0),
        0.075 - k * 0.012,
        0.022,
        ELBOW_BLADE,
        elJ,
        `elbowTuft${side}${k}`,
      );

    // Hind leg: digitigrade crouch, knee forward, hock back.
    const hipP = P(s * 0.11, 0.34, -0.3);
    const footP = P(s * 0.12, 0.05, -0.1);
    const hpts = limb(hipP, footP, [0.2, 0.2, 0.13], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const legH = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.12, Y0, -0.055],
    });
    b.sweep(legH, [0.08, 0.062, 0.046, 0.04], { color: LEG, sides: 9, name: `legH${side}` });
    const hipJ = legH.joints[0];
    const hockJ = legH.joints[2];
    const footJ = legH.joints[3];
    blob(hipJ.at.clone().add(V(s * 0.035, -0.04, 0.03)), [0.08, 0.12, 0.13], COAT, hipJ, [14, 10], `haunch${side}`);
    const pawH = P(s * 0.12, 0.033, -0.055);
    blob(pawH, [0.05, 0.034, 0.075], LEG, footJ, [12, 8], `pawH${side}`);
    pawToes(pawH, footJ, 0.062, `H${side}`);
    blade(
      hockJ.at.clone().add(V(s * 0.015, 0, -0.025)),
      V(s * 0.25, 0.25, -1),
      V(0, 1, 0),
      0.06,
      0.018,
      ELBOW_BLADE,
      hockJ,
      `hockTuft${side}`,
    );
  }

  // ------------------------------------------------------------------ tail
  const tailPts = [
    P(0, 0.35, -0.42),
    P(0.03, 0.22, -0.58),
    P(0.12, 0.085, -0.7),
    P(0.3, 0.078, -0.68),
    P(0.42, 0.078, -0.48),
    P(0.44, 0.08, -0.24),
    P(0.4, 0.11, -0.05),
    P(0.35, 0.18, 0.02),
    P(0.32, 0.25, -0.06),
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 9, role: "tail" });
  const tailTube = b.sweep(tail, (t: number) => 0.078 - 0.014 * t + 0.006 * Math.sin(t * Math.PI), {
    color: TAIL,
    sides: 10,
    name: "tail",
  });

  // Fluff over the tail: pale cards on the coat, dark cards on the rings.
  const tailHits = b
    .surface(tailTube)
    .scatter(170, { rng: rng(31), minDist: 0.04, filter: (h) => h.n.y > -0.35 });
  const darkHits = tailHits.filter((h) => isRing(tailPath.closestT(h.at)));
  const paleHits = tailHits.filter((h) => !isRing(tailPath.closestT(h.at)));
  const tailFlow = (f: { at: THREE.Vector3 }) => tailPath.tangentAt(tailPath.closestT(f.at));
  if (paleHits.length)
    b.cards(paleHits, TUFT, {
      size: [0.045, 0.085],
      lean: 55,
      bend: 30,
      vary: 0.3,
      rng: rng(32),
      color: "#dcd7cd",
      flow: tailFlow,
    });
  if (darkHits.length)
    b.cards(darkHits, TUFT, {
      size: [0.045, 0.085],
      lean: 55,
      bend: 30,
      vary: 0.3,
      rng: rng(33),
      color: "#4a4752",
      flow: tailFlow,
    });

  // ------------------------------------------------------------------ head
  const skullC = hp(0, 0.02, 0.03);
  const skull = blob(skullC, [0.13 * H, 0.115 * H, 0.125 * H], HEAD, head, [16, 12], "skull");
  const skullSurf = b.surface(skull);

  const cheeks: ReturnType<typeof blob>[] = [];
  const pads: ReturnType<typeof blob>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    cheeks.push(blob(hp(s * 0.07, -0.035, 0.065), [0.06 * H, 0.055 * H, 0.06 * H], CHEEK, head, [12, 8], `cheek${side}`));
    pads.push(blob(hp(s * 0.025, -0.062, 0.165), [0.032 * H, 0.028 * H, 0.03 * H], PADS, head, [10, 8], `pad${side}`));
  }
  const muzzle = blob(hp(0, -0.045, 0.125), [0.068 * H, 0.045 * H, 0.065 * H], MUZZLE, head, [12, 8], "muzzle");

  // Lower jaw and mouth, built to open.
  blob(hp(0, -0.093, 0.12), [0.048 * H, 0.024 * H, 0.062 * H], JAW, jaw, [10, 8], "chin");
  blob(hp(0, -0.076, 0.11), [0.04 * H, 0.012 * H, 0.05 * H], MOUTH_C, jaw, [8, 6], "mouthFloor");
  blob(hp(0, -0.072, 0.12), [0.027 * H, 0.008 * H, 0.04 * H], TONGUE, jaw, [8, 6], "tongue");
  blob(hp(0, -0.07, 0.11), [0.042 * H, 0.01 * H, 0.05 * H], MOUTH_C, head, [8, 6], "palate");
  for (const s of [1, -1])
    b.spike(hp(s * 0.022, -0.078, 0.172), [0, -1, 0.1], 0.03, 0.0065, {
      color: TOOTH,
      bone: head,
      sides: 6,
      name: `fang${s > 0 ? "L" : "R"}`,
    });

  // Nose and mouth drawing on the muzzle.
  const muzzleSurf = b.surface([muzzle, ...pads]);
  const noseHit = need(muzzleSurf.ray(hp(0, -0.012, 0.6), [0, 0, -1]), "nose");
  b.extrude(
    [
      [-0.024, 0.008],
      [-0.012, 0.016],
      [0.012, 0.016],
      [0.024, 0.008],
      [0.005, -0.012],
      [-0.005, -0.012],
    ],
    {
      at: offset(noseHit.at, [0, 0, 1], 0.003),
      x: [1, 0, 0],
      y: [0, 1, 0.35],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: NOSE,
      bone: head,
      name: "nose",
    },
  );
  const mouthHit = need(muzzleSurf.ray(V(0, noseHit.at.y - 0.04, noseHit.at.z + 0.4), [0, 0, -1]), "mouth");
  b.decal([muzzle, ...pads], MOUTH, {
    at: mouthHit.at,
    dir: [0, 0, 1],
    size: [0.075, 0.0525],
    bone: head,
    name: "mouthDecal",
  });

  // Eyes: big jade decals with a white fur rim, a little self-lit sparkle.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = need(skullSurf.around(skullC).at(s * 30, 20), `eye${side}`);
    glow(
      b.decal(skull, EYE, {
        at: eyeHit.at,
        dir: [s * 0.45, 0.1, 1],
        size: [0.075, 0.054],
        mirror: s > 0,
        bone: head,
        name: `eye${side}`,
      }),
      0.35,
    );
    // Brow whiskers above each eye.
    for (let k = 0; k < 2; k++) {
      const a = eyeHit.at.clone().add(V(s * (0.006 + k * 0.012), 0.032, -0.008));
      const e = a.clone().add(V(s * (0.07 + k * 0.02), 0.07 - k * 0.015, -0.03));
      b.sweep(bezier(a, a.clone().lerp(e, 0.5).add(V(0, 0.015, 0.01)), e), [0.0018, 0.0006], {
        color: WHISK,
        bone: head,
        sides: 4,
        name: `browWhisker${side}${k}`,
      });
    }
  }

  // Whiskers fanning from the pads.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pc = hp(s * 0.025, -0.062, 0.165);
    for (let i = 0; i < 4; i++) {
      const a = pc.clone().add(V(s * 0.024, -0.004 - i * 0.006, 0.01));
      const e = a.clone().add(V(s * (0.15 - i * 0.012), 0.025 - i * 0.02, -0.05 - i * 0.012));
      const c = a.clone().lerp(e, 0.5).add(V(0, 0.012, 0.02));
      b.sweep(bezier(a, c, e), [0.0022, 0.0006], { color: WHISK, bone: head, sides: 4, name: `whisker${side}${i}` });
    }
  }

  // Ears: small, round, set wide; black backs with a pale thumbprint.
  const EAR: OL = [
    [-0.034, 0],
    [0.034, 0],
    [0.04, 0.028],
    [0.022, 0.052],
    [0, 0.058],
    [-0.022, 0.052],
    [-0.04, 0.028],
  ];
  const INNER: OL = [
    [-0.022, 0],
    [0.022, 0],
    [0.026, 0.02],
    [0.012, 0.038],
    [0, 0.042],
    [-0.012, 0.038],
    [-0.026, 0.02],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earHit = need(skullSurf.around(skullC).at(s * 52, 50), `ear${side}`);
    const a = 22 * D2R;
    const x = V(s * Math.cos(a), -Math.sin(a), 0);
    const y = V(s * Math.sin(a), Math.cos(a), -0.15);
    const thick = x.clone().cross(y).normalize();
    const f = thick.z > 0 ? 1 : -1;
    const front = thick.clone().multiplyScalar(f);
    const ear = b.extrude(EAR.map(([u, v]) => [u * H, v * H] as [number, number]), {
      at: offset(earHit.at, earHit.n, -0.012),
      x,
      y,
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 2,
      color: earPaint(front),
      bone: head,
      name: `ear${side}`,
    });
    b.extrude(INNER.map(([u, v]) => [u * H, v * H] as [number, number]), {
      at: ear.local([0, 0.006, f * 0.0078]),
      x,
      y,
      thickness: 0.003,
      smoothing: 2,
      color: cel(INNER_EAR),
      bone: head,
      name: `innerEar${side}`,
    });
  }

  // Cheek ruffs: three broad blades per side sweeping back and down.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const cheek = cheeks[s > 0 ? 0 : 1];
    const cheekC = hp(s * 0.07, -0.035, 0.065);
    const cs = b.surface(cheek);
    for (let k = 0; k < 3; k++) {
      const h = need(cs.around(cheekC).at(s * (82 + k * 18), -8 - k * 12), `ruff${side}${k}`);
      blade(
        offset(h.at, h.n, -0.012),
        V(s * (0.6 - k * 0.05), -0.3 - k * 0.15, -0.7),
        V(0, 1, 0),
        (0.1 - k * 0.008) * H,
        0.03 * H,
        CHEEK_BLADE,
        head,
        `ruff${side}${k}`,
      );
    }
  }
  const cheekHits = b
    .surface(cheeks)
    .scatter(16, { rng: rng(51), minDist: 0.025, filter: (h) => h.n.y < 0.15 && Math.abs(h.n.x) > 0.45 });
  if (cheekHits.length)
    b.cards(cheekHits, WISP, {
      size: [0.03, 0.065],
      lean: 50,
      bend: 20,
      vary: 0.25,
      rng: rng(52),
      color: BELLY,
      flow: [0, -0.6, -1],
    });

  // Chest ruff: two rows of bright blades on the throat and chest.
  const chestC = P(0, 0.4, 0.26);
  const chestBone = neck.joints[0];
  const rows: [number[], number, number, number][] = [
    [[-60, -30, 0, 30, 60], -22, 0.12, 0.032],
    [[-45, -15, 15, 45], -42, 0.1, 0.028],
  ];
  rows.forEach(([azs, el, len, w], r) => {
    azs.forEach((az, i) => {
      const h = need(bodySurf.around(chestC).at(az, el), `chestRuff${r}${i}`);
      blade(
        offset(h.at, h.n, -0.012),
        V(Math.sin(az * D2R) * 0.45, -1, 0.5),
        V(1, 0, 0),
        len - Math.abs(az) * 0.0003,
        w,
        CHEST_BLADE,
        chestBone,
        `chestRuff${r}${i}`,
      );
    });
  });

  // Belly fringe: long pale hair hanging under the crouch.
  const bellyHits = bodySurf.scatter(45, {
    rng: rng(41),
    minDist: 0.05,
    filter: (h) => h.n.y < -0.55 && h.at.z > -0.32 && h.at.z < 0.3,
  });
  if (bellyHits.length)
    b.cards(
      bellyHits.map((h) => frame(h, [0, 1, 0])),
      TUFT,
      { size: [0.045, 0.065], lean: 180, flow: [1, 0, 0], cross: true, vary: 0.3, rng: rng(42), color: BELLY },
    );

  // ------------------------------------------------------------------ the rocky ledge
  const LEDGE_XZ = [
    [-0.6, 0.55],
    [-0.4, 0.8],
    [-0.05, 0.88],
    [0.3, 0.82],
    [0.6, 0.62],
    [0.68, 0.2],
    [0.64, -0.3],
    [0.55, -0.75],
    [0.25, -0.95],
    [-0.15, -0.92],
    [-0.5, -0.72],
    [-0.66, -0.2],
  ];
  const slab = b.extrude(LEDGE_XZ.map(([x, z]) => [x, -z] as [number, number]), {
    at: [0, Y0 / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: Y0,
    bevel: 0.035,
    smoothing: 1,
    color: STONE,
    bone: root,
    name: "ledge",
  });
  const STEP_XZ = [
    [0.15, 0.8],
    [0.45, 0.98],
    [0.72, 0.85],
    [0.8, 0.5],
    [0.62, 0.35],
    [0.3, 0.55],
  ];
  const step = b.extrude(STEP_XZ.map(([x, z]) => [x, -z] as [number, number]), {
    at: [0, 0.08, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.16,
    bevel: 0.025,
    smoothing: 1,
    color: STONE,
    bone: root,
    name: "ledgeStep",
  });

  /** A faceted boulder whose lowest point rests on `base`. */
  let rockCount = 0;
  const rock = (x: number, z: number, base: number, sx: number, sy: number, sz: number, seed: number) => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos = geo.getAttribute("position");
    const tmp = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i);
      const k = 0.8 + 0.38 * noise(tmp.clone(), 0.9, seed);
      tmp.multiplyScalar(k);
      if (tmp.y > 0.55) tmp.y = 0.55 + (tmp.y - 0.55) * 0.3;
      pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    geo.scale(sx, sy, sz);
    geo.rotateY(R() * Math.PI * 2);
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    const lift = base - geo.boundingBox!.min.y - 0.006;
    rockCount++;
    return b.part(geo, STONE, { bone: root, at: [x, lift, z], flat: true, name: `rock${rockCount}` });
  };

  const backRock = rock(-0.42, -0.72, Y0 - 0.05, 0.26, 0.3, 0.22, 61);
  rock(-0.12, -0.88, Y0 - 0.02, 0.1, 0.08, 0.09, 62);
  const sideRockR = rock(-0.66, 0.15, 0, 0.17, 0.16, 0.24, 63);
  const sideRockL = rock(0.7, -0.35, 0, 0.16, 0.18, 0.22, 64);
  rock(-0.45, 0.8, 0, 0.2, 0.14, 0.15, 65);
  rock(0.3, -0.95, 0, 0.22, 0.14, 0.14, 66);
  rock(0.82, 0.72, 0, 0.12, 0.1, 0.12, 67);
  rock(-0.58, -0.65, 0, 0.14, 0.12, 0.16, 68);
  rock(0.55, 0.7, 0.16, 0.06, 0.05, 0.06, 69);
  rock(0.36, 0.88, 0.16, 0.05, 0.04, 0.05, 70);
  rock(-0.52, 0.3, Y0, 0.07, 0.05, 0.07, 71);
  rock(0.58, 0.3, Y0, 0.06, 0.045, 0.06, 72);
  rock(-0.3, 0.6, Y0, 0.045, 0.035, 0.05, 73);

  // Snow caps on the boulder tops.
  const capOn = (target: ReturnType<typeof rock>, x: number, z: number, w: number, d: number, tag: string) => {
    const hit = b.surface(target).ray([x, 3, z], [0, -1, 0]);
    if (hit)
      b.stick(sphere(10, 6), SNOWCAP, hit, { scale: [w, 0.028, d], embed: 0.45, bone: root, name: `snowCap${tag}` });
  };
  capOn(backRock, -0.42, -0.72, 0.15, 0.12, "Back");
  capOn(backRock, -0.32, -0.66, 0.08, 0.07, "Back2");
  capOn(sideRockR, -0.66, 0.15, 0.1, 0.14, "R");
  capOn(sideRockL, 0.7, -0.35, 0.09, 0.12, "L");

  // Icicles hanging under the front rim.
  const ledgeSurf = b.surface([slab, step]);
  const slabOnly = b.surface(slab);
  [-0.32, -0.24, -0.17, 0.33, 0.4].forEach((x, i) => {
    const hit = slabOnly.ray([x, Y0 - 0.04, 1.6], [0, 0, -1]);
    if (!hit) return;
    const base = hit.at.clone().add(V(0, 0, -0.012));
    b.spike(base, [0, -1, 0.05], 0.07 + 0.05 * R(), 0.013 + 0.005 * R(), {
      color: ICE,
      bone: root,
      sides: 6,
      name: `icicle${i}`,
    });
  });

  // A glowing cryo glyph carved into the ledge front.
  const glyphHit = slabOnly.ray([0.08, 0.15, 1.6], [0, 0, -1]);
  if (glyphHit)
    glow(
      b.decal(slab, GLYPH, {
        at: glyphHit.at,
        dir: [0, 0, 1],
        size: [0.2, 0.2],
        bone: root,
        name: "cryoGlyph",
      }),
      1.2,
    );

  // Cryo crystal cluster in the front-right corner, and two shards on the back rock.
  const crystal = (base: THREE.Vector3, dir: S3, len: number, w: number, col: string, tag: string) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const at = base.clone().addScaledVector(d, len * 0.42);
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), col, {
        bone: root,
        at,
        dir: d,
        scale: [w, len * 0.5, w],
        flat: true,
        name: `crystal${tag}`,
      }),
      0.9,
    );
  };
  const cc = V(-0.44, Y0, 0.5);
  const cluster: [S3, number, number, S3][] = [
    [[0, 1, 0.05], 0.2, 0.035, [0, 0, 0]],
    [[-0.35, 1, 0.2], 0.15, 0.03, [-0.03, 0, 0.02]],
    [[0.3, 1, 0.25], 0.13, 0.028, [0.03, 0, 0.025]],
    [[-0.15, 1, -0.35], 0.11, 0.025, [-0.01, 0, -0.03]],
    [[0.4, 1, -0.2], 0.09, 0.022, [0.035, 0, -0.02]],
    [[-0.5, 1, -0.05], 0.07, 0.018, [-0.05, 0, -0.005]],
  ];
  cluster.forEach(([dir, len, w, o], i) =>
    crystal(cc.clone().add(V(o[0], -0.012, o[2])), dir, len, w, i % 2 ? CRYO_B : CRYO_A, `F${i}`),
  );
  b.part(sphere(10, 6), SNOWCAP, { bone: root, at: cc.clone().add(V(0, 0.004, 0)), scale: [0.09, 0.025, 0.08], name: "crystalDrift" });
  const backTop = b.surface(backRock).ray([-0.5, 3, -0.78], [0, -1, 0]);
  if (backTop) {
    crystal(backTop.at.clone().add(V(0, -0.01, 0)), [-0.2, 1, -0.1], 0.1, 0.02, CRYO_A, "B0");
    crystal(backTop.at.clone().add(V(0.03, -0.01, 0.02)), [0.3, 1, 0.1], 0.07, 0.016, CRYO_B, "B1");
  }

  // Frost grass tufts along the ledge, kept clear of the leopard and its tail.
  const frostHits = ledgeSurf.scatter(28, {
    rng: rng(81),
    minDist: 0.11,
    filter: (h) => {
      if (h.n.y < 0.9) return false;
      const p = h.at;
      if (Math.abs(p.x) < 0.27 && p.z > -0.5 && p.z < 0.7) return false;
      if (p.distanceTo(cc) < 0.12) return false;
      return tailPath.at(tailPath.closestT(p)).distanceTo(p) > 0.15;
    },
  });
  if (frostHits.length)
    b.cards(frostHits, FROST, {
      size: [0.07, 0.08],
      cross: true,
      vary: 0.35,
      spin: 40,
      rng: rng(82),
      color: "#e2f2ff",
    });

  return b.root;
}
```