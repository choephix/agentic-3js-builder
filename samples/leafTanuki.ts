import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Leaf Tanuki",
  description:
    "A chubby 0.5 m raccoon-dog standing on hind legs with a big leaf on its head, bandit-mask face, sake-jug charm, a straw hat on its back and a fluffy striped tail, arms held out.",
};

// ---- palette: candy pastels, all flat ---------------------------------------------------------------------
const FUR = "#d6a77c"; // caramel coat
const FUR_LIGHT = "#ebc79f";
const COCOA = "#7a5649"; // legs, arms, ears, tail bands
const CREAM = "#fff0d8";
const PINK = "#ff9db4";
const NOSE = "#3a2631";
const LEAF = "#72d08a";
const STRAW = "#f6d36c";
const STRAW_DARK = "#d8a94a";
const CORD = "#ee5a78";
const JUG = "#86d9e8";
const JUG_DARK = "#4fb2cc";

// ---- drawings ---------------------------------------------------------------------------------------------
// Right eye seen from the front: bandit patch sweeping down and out (outer corner on the drawing's left),
// a big glossy eye, cream brow dot. Mirrored for the left eye.
const EYE_PATCH = svg(
  `<svg viewBox="0 0 60 70">
    <polygon fill="${COCOA}" points="54,16 58,32 53,50 40,60 26,68 10,68 2,60 4,46 8,30 14,14 30,6"/>
    <polygon fill="${COCOA}" points="2,60 -0,66 8,64"/>
    <ellipse cx="33" cy="38" rx="15" ry="17" fill="#231522"/>
    <ellipse cx="33" cy="44" rx="10.5" ry="9.5" fill="#5e3b58"/>
    <circle cx="39.5" cy="29" r="6.2" fill="#ffffff"/>
    <circle cx="26" cy="47" r="3" fill="#ffffff"/>
    <circle cx="41" cy="44" r="1.8" fill="#ffd2e0"/>
    <circle cx="22" cy="12" r="4.6" fill="${CREAM}"/>
  </svg>`,
  { size: 256 },
);

// Cream lower face with a fur-edged top, cheeks, blush with three slashes each.
const FACE = svg(
  `<svg viewBox="0 0 100 64">
    <polygon fill="${CREAM}" points="4,46 9,38 13,43 19,34 25,41 31,33 37,40 43,32 50,38 57,32 63,40 69,33 75,41 81,34 87,43 91,38 96,46 92,54 80,60 62,62 50,62 38,62 20,60 8,54"/>
    <ellipse cx="14" cy="50" rx="8" ry="5" fill="${PINK}"/>
    <ellipse cx="86" cy="50" rx="8" ry="5" fill="${PINK}"/>
    <g stroke="#ff6f93" stroke-width="1.6" stroke-linecap="round">
      <line x1="10" y1="52" x2="12.5" y2="48"/><line x1="14" y1="52.5" x2="16.5" y2="48.5"/><line x1="18" y1="52" x2="20.5" y2="48"/>
      <line x1="82" y1="52" x2="84.5" y2="48"/><line x1="86" y1="52.5" x2="88.5" y2="48.5"/><line x1="90" y1="52" x2="92.5" y2="48"/>
    </g>
  </svg>`,
  { size: 384 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 40 26">
    <path d="M20 2 L20 9" stroke="${NOSE}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M7 10 Q13 21 20 9 Q27 21 33 10" stroke="${NOSE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

const BELLY = svg(
  `<svg viewBox="0 0 80 72">
    <polygon fill="${CREAM}" points="40,2 49,8 58,5 64,14 73,20 75,32 78,44 70,56 58,66 40,70 22,66 10,56 2,44 5,32 7,20 16,14 22,5 31,8"/>
    <path d="M34 38 Q40 33 46 38" stroke="${FUR}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M14 20 l5 6 M66 20 l-5 6 M12 34 l6 3 M68 34 l-6 3" stroke="${FUR_LIGHT}" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 320 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 48"><path fill="#ffffff" d="M16 0 C21 12 29 28 28 48 L4 48 C3 28 11 12 16 0 Z"/></svg>`,
  { size: 128 },
);

const LABEL = svg(
  `<svg viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill="${CORD}"/>
    <path fill="#ffffff" d="M20 7 C25 15 29 19 29 24 A9 9 0 0 1 11 24 C11 19 15 15 20 7 Z"/>
    <circle cx="16.5" cy="24" r="2.2" fill="${CORD}"/>
  </svg>`,
  { size: 128 },
);

const SPARKLE = svg(
  `<svg viewBox="0 0 40 40">
    <path fill="#ffe27a" d="M20 1 L25 15 L39 20 L25 25 L20 39 L15 25 L1 20 L15 15 Z"/>
    <path fill="#ffffff" d="M20 9 L22 18 L31 20 L22 22 L20 31 L18 22 L9 20 L18 18 Z"/>
  </svg>`,
  { size: 128 },
);

const WEAVE = svg(
  `<svg viewBox="0 0 64 16">
    <rect width="64" height="16" fill="${STRAW}"/>
    <g stroke="${STRAW_DARK}" stroke-width="1.3">
      <line x1="0" y1="4" x2="64" y2="4"/><line x1="0" y1="8" x2="64" y2="8"/><line x1="0" y1="12" x2="64" y2="12"/>
      <line x1="4" y1="0" x2="4" y2="4"/><line x1="12" y1="0" x2="12" y2="4"/><line x1="20" y1="0" x2="20" y2="4"/>
      <line x1="28" y1="0" x2="28" y2="4"/><line x1="36" y1="0" x2="36" y2="4"/><line x1="44" y1="0" x2="44" y2="4"/>
      <line x1="52" y1="0" x2="52" y2="4"/><line x1="60" y1="0" x2="60" y2="4"/>
      <line x1="8" y1="4" x2="8" y2="8"/><line x1="16" y1="4" x2="16" y2="8"/><line x1="24" y1="4" x2="24" y2="8"/>
      <line x1="32" y1="4" x2="32" y2="8"/><line x1="40" y1="4" x2="40" y2="8"/><line x1="48" y1="4" x2="48" y2="8"/>
      <line x1="56" y1="4" x2="56" y2="8"/><line x1="0" y1="4" x2="0" y2="8"/>
      <line x1="4" y1="8" x2="4" y2="12"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="20" y1="8" x2="20" y2="12"/>
      <line x1="28" y1="8" x2="28" y2="12"/><line x1="36" y1="8" x2="36" y2="12"/><line x1="44" y1="8" x2="44" y2="12"/>
      <line x1="52" y1="8" x2="52" y2="12"/><line x1="60" y1="8" x2="60" y2="12"/>
      <line x1="8" y1="12" x2="8" y2="16"/><line x1="16" y1="12" x2="16" y2="16"/><line x1="24" y1="12" x2="24" y2="16"/>
      <line x1="32" y1="12" x2="32" y2="16"/><line x1="40" y1="12" x2="40" y2="16"/><line x1="48" y1="12" x2="48" y2="16"/>
      <line x1="56" y1="12" x2="56" y2="16"/>
    </g>
  </svg>`,
  { size: 256 },
);

// Leaf outline in metres: x along the leaf, y across. The same polygon is extruded and drawn (veins) in the SVG.
const LEAF_OUTLINE: Array<[number, number]> = [
  [-0.095, -0.004],
  [-0.072, -0.014],
  [-0.04, -0.052],
  [0.0, -0.068],
  [0.045, -0.054],
  [0.08, -0.022],
  [0.11, 0.0],
  [0.08, 0.022],
  [0.045, 0.054],
  [0.0, 0.068],
  [-0.04, 0.052],
  [-0.072, 0.014],
  [-0.095, 0.004],
];
const LEAF_W = 0.21; // svg width in metres: x from -0.1 to 0.11
const LEAF_H = 0.14;
const lx = (x: number) => ((x + 0.1) / LEAF_W) * 210; // svg units of 1 mm
const ly = (y: number) => (0.07 - y) * 1000;
const LEAF_VEINS = svg(
  `<svg viewBox="0 0 210 140">
    <polygon fill="#8fe0a0" points="${LEAF_OUTLINE.filter(([, y]) => y >= 0)
      .map(([x, y]) => `${lx(x).toFixed(1)},${ly(y).toFixed(1)}`)
      .join(" ")} ${lx(-0.095).toFixed(1)},${ly(0).toFixed(1)}"/>
    <g stroke="#3f9f62" stroke-width="3.2" stroke-linecap="round" fill="none">
      <path d="M${lx(-0.095)} ${ly(0)} L${lx(0.1)} ${ly(0)}"/>
      <path d="M${lx(-0.03)} ${ly(0)} L${lx(0.0)} ${ly(0.038)} M${lx(0.02)} ${ly(0)} L${lx(0.05)} ${ly(0.03)}"/>
      <path d="M${lx(-0.03)} ${ly(0)} L${lx(0.0)} ${ly(-0.038)} M${lx(0.02)} ${ly(0)} L${lx(0.05)} ${ly(-0.03)}"/>
      <path d="M${lx(-0.06)} ${ly(0)} L${lx(-0.04)} ${ly(0.028)} M${lx(-0.06)} ${ly(0)} L${lx(-0.04)} ${ly(-0.028)}"/>
    </g>
  </svg>`,
  { size: 420 },
);

export default function build() {
  const b = createBuilder({ name: "leafTanuki" });
  const random = rng(11);

  // ---- skeleton: spine, neck, head, jaw ---------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.115, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.13, 0],
      [0, 0.21, 0.005],
      [0, 0.29, 0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 0.295, 0.011], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.315, 0.012], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.302, 0.07], aim: [0, 0.302, 0.15], role: "jaw" });

  // ---- body: one fat faceted pear ---------------------------------------------------------------------
  const body = b.sweep(spine, [0.05, 0.115, 0.138, 0.12, 0.085], {
    color: FUR,
    sides: 8,
    smooth: false,
    shift: [0, -0.008],
  });
  const bodySkin = b.surface(body);
  b.decal(body, BELLY, { at: [0, 0.185, 0.2], dir: [0, 0, -1], size: [0.15, 0.135], segments: [9, 8], lift: 0.003 });

  // ---- head -------------------------------------------------------------------------------------------
  const HEAD_C: [number, number, number] = [0, 0.34, 0.01];
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), FUR, {
    bone: head,
    at: HEAD_C,
    scale: [0.135, 0.09, 0.11],
    flat: true,
  });
  b.decal(skull, FACE, { at: [0, 0.335, 0.2], dir: [0, 0, -1], size: [0.2, 0.128], segments: [14, 9], lift: 0.0025 });
  for (const s of [1, -1]) {
    b.decal(skull, EYE_PATCH, {
      at: [s * 0.062, 0.352, 0.2],
      dir: [0, 0, -1],
      size: [0.09, 0.105],
      segments: [8, 10],
      lift: 0.0045,
      mirror: s > 0,
    });
  }

  // muzzle, nose, separate lower jaw
  const muzzle = b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: head,
    at: [0, 0.312, 0.108],
    scale: [0.05, 0.036, 0.045],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, {
    bone: head,
    at: [0, 0.327, 0.152],
    scale: [0.016, 0.011, 0.012],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", {
    bone: head,
    at: [0, 0.336, 0.157],
    scale: [0.0048, 0.0032, 0.0032],
    flat: true,
  });
  const jawPart = b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: jaw,
    at: [0, 0.292, 0.108],
    scale: [0.041, 0.02, 0.042],
    flat: true,
  });
  b.decal([muzzle, jawPart], MOUTH, {
    at: [0, 0.305, 0.3],
    dir: [0, -0.15, -1],
    size: [0.042, 0.027],
    segments: [8, 5],
    lift: 0.002,
  });
  // tongue poking out of the closed smile is tiny: a pink nub on the jaw
  b.part(new THREE.SphereGeometry(1, 6, 4), PINK, {
    bone: jaw,
    at: [0, 0.29, 0.125],
    scale: [0.014, 0.008, 0.014],
    flat: true,
  });

  // ears: cocoa shells with pink insides
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.095, 0.385, -0.005],
      dir: [s * 0.9, 1, 0],
      role: "hinge",
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), COCOA, {
      bone: ear,
      at: [s * 0.108, 0.402, -0.005],
      dir: [s * 0.9, 1, 0.1],
      scale: [0.042, 0.036, 0.024],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), PINK, {
      bone: ear,
      at: [s * 0.107, 0.4, 0.008],
      dir: [s * 0.9, 1, 0.1],
      scale: [0.027, 0.022, 0.012],
      flat: true,
    });
  }

  // cheek fluff: tufts flicked back off the skull
  const skullSkin = b.surface(skull);
  const cheeks = [
    [80, -22],
    [88, -4],
    [76, 16],
    [96, -34],
  ] as const;
  for (const s of [1, -1]) {
    const hits = cheeks
      .map(([az, el]) => skullSkin.around(HEAD_C).at(s * az, el))
      .filter((h): h is NonNullable<typeof h> => h !== null);
    b.cards(hits, TUFT, {
      size: [0.03, 0.045],
      lean: 65,
      bend: 10,
      flow: [0, -0.35, -1],
      mirror: s < 0,
      color: CREAM,
      vary: 0.15,
      rng: random,
    });
  }

  // ---- the leaf ---------------------------------------------------------------------------------------
  const LEAF_AT = new THREE.Vector3(0.0, 0.434, -0.012);
  const leafJoint = b.joint("leaf", { parent: head, at: LEAF_AT, dir: [0, 1, 0], role: "hinge" });
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler((14 * Math.PI) / 180, (-30 * Math.PI) / 180, (6 * Math.PI) / 180, "YXZ"));
  const lxDir = new THREE.Vector3(1, 0, 0).applyQuaternion(tilt);
  const lyDir = new THREE.Vector3(0, 0, -1).applyQuaternion(tilt);
  const lzDir = lxDir.clone().cross(lyDir);
  const LEAF_T = 0.014;
  const KX = 1.3; // leaf stretch over the drawn outline: long
  const KY = 1.6; // and broad
  b.extrude(
    LEAF_OUTLINE.map(([x, y]): [number, number] => [x * KX, y * KY]),
    {
      at: LEAF_AT,
      x: lxDir.toArray() as [number, number, number],
      y: lyDir.toArray() as [number, number, number],
      thickness: LEAF_T,
      bevel: 0.003,
      color: LEAF,
      bone: leafJoint,
    },
  );
  const leafQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(lxDir, lyDir, lzDir));
  const veinCentre = LEAF_AT.clone()
    .addScaledVector(lxDir, 0.005 * KX)
    .addScaledVector(lzDir, LEAF_T / 2 + 0.0015);
  b.part(new THREE.PlaneGeometry(LEAF_W * KX, LEAF_H * KY), "#ffffff", {
    bone: leafJoint,
    at: veinCentre,
    quat: leafQuat,
    texture: LEAF_VEINS,
  });

  // sparkles twinkling round the leaf
  b.cards(
    [
      frame([0.15, 0.452, -0.03], [0, 1, 0]),
      frame([-0.145, 0.43, 0.02], [0, 1, 0]),
      frame([0.05, 0.472, 0.06], [0, 1, 0]),
    ],
    SPARKLE,
    { size: [0.036, 0.036], lean: 0, flow: [0, 0, 1], bone: head, sink: 0 },
  );

  // ---- tail: fat striped brush -------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.115, -0.07],
      [0, 0.105, -0.18],
      [0, 0.15, -0.28],
      [0, 0.255, -0.33],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );
  const STRIPES: Array<[number, string]> = [
    [0.16, FUR],
    [0.3, COCOA],
    [0.44, FUR],
    [0.58, COCOA],
    [0.72, FUR],
    [0.86, COCOA],
    [1, CREAM],
  ];
  const tailTube = b.sweep(tail, [0.042, 0.06, 0.075, 0.066, 0.04], {
    bands: STRIPES,
    sides: 8,
    smooth: false,
    caps: "round",
  });
  // fur tufts along the tail silhouette, tinted per stripe
  let lo = 0.0;
  for (const [hi, colour] of STRIPES) {
    const frames = [];
    for (const t of [lo + 0.25 * (hi - lo), lo + 0.75 * (hi - lo)]) {
      for (const deg of [-80, 80]) frames.push(tailTube.at(Math.min(Math.max(t, 0.08), 0.92), deg));
    }
    b.cards(frames, TUFT, {
      size: [0.055, 0.05],
      lean: 55,
      flow: [0, -0.2, -1],
      color: colour === CREAM ? CREAM : colour,
      vary: 0.2,
      rng: random,
    });
    lo = hi;
  }

  // ---- legs --------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.075, 0.125, 0.01],
        [s * 0.085, 0.075, 0.03],
        [s * 0.085, 0.032, 0.05],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(leg, [0.046, 0.039], { color: COCOA, sides: 8, smooth: false });
    const foot = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), COCOA, {
      bone: foot,
      at: [s * 0.088, 0.03, 0.058],
      scale: [0.048, 0.03, 0.068],
      flat: true,
    });
    [-1, 0, 1].forEach((k, i) => {
      const start: [number, number, number] = [s * (0.088 + k * 0.022), 0.026, 0.108];
      const toe = b.joint(`toe${S}${i + 1}`, {
        parent: foot,
        at: start,
        dir: [k * 0.3 * s, 0, 1],
        role: "digit",
      });
      b.part(new THREE.SphereGeometry(1, 6, 4), COCOA, {
        bone: toe,
        at: [start[0] + k * 0.004 * s, 0.025, 0.12],
        scale: [0.0135, 0.0135, 0.016],
        flat: true,
      });
      b.part(new THREE.SphereGeometry(1, 5, 4), CREAM, {
        bone: toe,
        at: [start[0] + k * 0.006 * s, 0.021, 0.133],
        scale: [0.0065, 0.006, 0.007],
        flat: true,
      });
    });

    // arms held out, slightly drooped, palms forward
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.11, 0.262, 0.012],
        [s * 0.175, 0.262, 0.022],
        [s * 0.232, 0.246, 0.03],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, [0.034, 0.028], { color: COCOA, sides: 8, smooth: false });
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), COCOA, {
      bone: hand,
      at: [s * 0.247, 0.243, 0.032],
      scale: [0.034, 0.03, 0.03],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), PINK, {
      bone: hand,
      at: [s * 0.246, 0.243, 0.059],
      scale: [0.016, 0.014, 0.006],
      flat: true,
    });
    [-1, 0, 1].forEach((k, i) => {
      const dir: [number, number, number] = [s * 1, -0.12 - 0.06 * k * 0, 0.5 * k];
      const origin = new THREE.Vector3(s * 0.257, 0.243, 0.032);
      const d = new THREE.Vector3(...dir).normalize();
      const f0 = origin.clone().addScaledVector(d, 0.008);
      const f1 = origin.clone().addScaledVector(d, 0.034);
      const finger = b.joint(`finger${S}${i + 1}`, { parent: hand, at: f0, aim: f1, role: "digit" });
      b.capsule(f0, f1, [0.011, 0.008], { bone: finger, color: COCOA, sides: 6, smooth: false });
    });
  }

  // ---- cord, jug charm --------------------------------------------------------------------------------
  const neckLoop = bodySkin.loop([0, 0.268, 0.01], { lift: 0.007 });
  b.sweep(neckLoop, 0.0055, { color: CORD, sides: 4, smooth: false, bone: chest });
  const tL = neckLoop.closestT([0.06, 0.268, 0.3]);
  const tR = neckLoop.closestT([-0.06, 0.268, 0.3]);
  const charm = b.joint("charm", { parent: chest, at: [0, 0.236, 0.163], dir: [0, -1, 0], role: "hinge" });
  b.sweep(catmull([neckLoop.at(tL), [0, 0.236, 0.163], neckLoop.at(tR)]), 0.0075, {
    color: CORD,
    sides: 4,
    smooth: false,
    bone: charm,
  });
  const jug = b.lathe(
    [
      [0, 0],
      [0.021, 0],
      [0.03, 0.018],
      [0.027, 0.04],
      [0.014, 0.054],
      [0.011, 0.066],
      [0.017, 0.072],
      [0.0, 0.072],
    ],
    { at: [0, 0.164, 0.163], bone: charm, color: JUG, segments: 8, smoothing: 0 },
  );
  b.part(new THREE.TorusGeometry(0.0185, 0.004, 4, 8), JUG_DARK, {
    bone: charm,
    at: [0, 0.236, 0.163],
    dir: [0, 1, 0],
    scale: [1, 1, 1],
  });
  b.decal(jug, LABEL, { at: [0, 0.192, 0.35], dir: [0, 0, -1], size: [0.034, 0.034], segments: 6, lift: 0.0015 });

  // ---- straw hat hanging on the back ---------------------------------------------------------------------
  const hatJoint = b.joint("hat", { parent: chest, at: [0, 0.29, -0.07], dir: [0, -1, -0.3], role: "hinge" });
  const HAT_C = new THREE.Vector3(0, 0.215, -0.15);
  const hatDir = new THREE.Vector3(0, 0.1, -1).normalize();
  b.part(new THREE.ConeGeometry(0.105, 0.05, 10, 1, false), "#ffffff", {
    bone: hatJoint,
    at: HAT_C,
    dir: hatDir.toArray() as [number, number, number],
    texture: WEAVE,
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.105, 0.005, 4, 10), STRAW_DARK, {
    bone: hatJoint,
    at: HAT_C.clone().addScaledVector(hatDir, -0.025),
    dir: hatDir.toArray() as [number, number, number],
    axis: "z",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), CORD, {
    bone: hatJoint,
    at: HAT_C.clone().addScaledVector(hatDir, 0.03),
    flat: true,
  });
  for (const s of [1, -1]) {
    const strapTop = neckLoop.at(neckLoop.closestT([s * 0.09, 0.268, -0.06]));
    const rim = HAT_C.clone().add(new THREE.Vector3(s * 0.062, 0.078, 0.0));
    b.sweep(catmull([strapTop, [s * 0.098, 0.27, -0.1], rim.toArray() as [number, number, number]]), 0.006, {
      color: CORD,
      sides: 4,
      smooth: false,
      bone: hatJoint,
    });
  }

  return b.root;
}
