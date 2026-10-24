import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  aim,
  catmull,
  cells,
  createBuilder,
  grain,
  limb,
  mix,
  noise,
  offset,
  paint,
  polyline,
  resolve,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Mimic",
  description:
    "A chest that is not a chest: the lid hinges open into a jaw of uneven fangs, a purple tongue lolls over a heap of gold, spidery legs prop it up and one bloodshot eye peeks out of the keyhole.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and constants

const INK = "#120a14";
const BONE = "#e9dfc3";
const SLIME = "#a6e88a";
const COIN_A = "#f4c430";
const COIN_B = "#dba416";
const COIN_C = "#fbe07a";

type RGB = readonly [number, number, number];

/** Warm light from above, cool bounce from below. */
function tone(c: RGB, n: THREE.Vector3): RGB {
  const w = mix(c, "#ffcf8a", 0.14 * smoothstep(0.2, 1, n.y));
  return mix(w, "#241c3a", 0.28 * smoothstep(0.1, -0.9, n.y));
}

/** Planked, stained, mossy wood; `seam` gives the coordinate the plank lines repeat along. */
function woodPaint(seam: (p: THREE.Vector3, n: THREE.Vector3) => number, seed: number) {
  const g = grain("#5b3519", "#87532b", { size: 0.04, axis: "x", seed });
  return paint((p, n) => {
    let c: RGB = resolve(g, p, n);
    const f = (((seam(p, n) / 0.095) % 1) + 1) % 1;
    if (f < 0.06) c = mix(c, "#1c0e07", 0.85);
    else if (f < 0.12) c = mix(c, "#b58048", 0.22);
    c = mix(c, "#25160d", 0.55 * smoothstep(0.58, 0.38, p.y));
    c = mix(c, "#33220f", 0.35 * smoothstep(0.6, 0.8, noise(p, 0.12, seed + 3)));
    c = mix(c, "#4f7a2c", 0.8 * smoothstep(0.55, 0.75, noise(p, 0.09, seed + 7)) * smoothstep(0.3, 0.8, n.y));
    return tone(c, n);
  });
}

const BASE_WOOD = woodPaint((p, n) => (Math.abs(n.y) > 0.6 ? p.z : p.y), 1);
const LID_WOOD = woodPaint(
  (p, n) => (Math.abs(n.x) > 0.7 ? p.y : Math.atan2((p.y - 0.83) * 1.25, p.z) * 0.3),
  2,
);

const IRON = metal("iron", { tarnish: 0.55, polish: 0.25 });
const GILT = metal("gilt");

/** Inside of the mouth: mottled wet flesh, darker toward the throat. */
const FLESH = paint((p, n) => {
  let c: RGB = mix("#7d1a40", "#b13a63", noise(p, 0.07, 4));
  c = mix(c, "#3a0b20", 0.7 * smoothstep(-0.05, -0.32, p.z));
  return tone(c, n);
});

/** The purple tongue: papillae, a dark centre groove and a lighter top. */
const TONGUE = paint((p, n, s) => {
  let c: RGB = mix("#7a2f9c", "#b55fd6", smoothstep(-0.3, 0.9, n.y));
  const cell = cells(p, 0.034, 6);
  if (cell.d1 < 0.22) c = mix(c, "#e2a6f4", 0.5);
  const ang = Math.abs((((s[1] + 180) % 360) + 360) % 360 - 180);
  if (ang < 8) c = mix(c, "#45165f", 0.7);
  return tone(c, n);
});

/** Yellowed root to pale tip, for every spike-shaped fang. */
const TOOTH = paint((_p, _n, s) => mix("#a98440", "#fff1cf", smoothstep(0, 0.75, s[0])));

function legPaint(k1: number, k2: number) {
  return paint((_p, n, s) => {
    let c: RGB = mix("#2c1d33", "#4d355d", smoothstep(-0.2, 1, n.y));
    if (Math.min(Math.abs(s[0] - k1), Math.abs(s[0] - k2)) < 0.03) c = mix(c, BONE, 0.85);
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

const COIN = svg(
  `<svg viewBox="0 0 100 100"><defs><radialGradient id="g" cx=".38" cy=".34" r=".8"><stop offset="0" stop-color="#fff2a8"/><stop offset=".6" stop-color="#f3c22e"/><stop offset="1" stop-color="#b9801a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="url(#g)" stroke="#7a4e10" stroke-width="4"/>
  <circle cx="50" cy="50" r="37" fill="none" stroke="#8e5d12" stroke-width="3.5"/>
  <path d="M50 24 L57 43 L77 43 L61 55 L67 75 L50 63 L33 75 L39 55 L23 43 L43 43 Z" fill="#c78a1c" stroke="#7a4e10" stroke-width="3" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);

const EYE = svg(
  `<svg viewBox="0 0 200 100"><defs>
  <radialGradient id="s" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fbf3c2"/><stop offset="1" stop-color="#e2cf7a"/></radialGradient>
  <radialGradient id="i" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffd23a"/><stop offset=".7" stop-color="#ff7a1c"/><stop offset="1" stop-color="#a02a12"/></radialGradient></defs>
  <rect width="200" height="100" fill="url(#s)"/>
  <g stroke="#c4302f" stroke-width="1.6" fill="none" stroke-linecap="round">
   <path d="M52 50 Q70 46 80 49"/><path d="M52 30 Q72 36 80 44"/><path d="M54 72 Q70 62 80 56"/><path d="M60 18 Q70 34 82 42"/>
   <path d="M148 50 Q130 46 120 49"/><path d="M148 30 Q128 36 120 44"/><path d="M146 72 Q130 62 120 56"/><path d="M140 18 Q130 34 118 42"/></g>
  <circle cx="100" cy="50" r="24" fill="url(#i)" stroke="#5a1408" stroke-width="3"/>
  <circle cx="100" cy="50" r="17" fill="none" stroke="#ffb02a" stroke-width="1.4" stroke-dasharray="3 3"/>
  <ellipse cx="100" cy="50" rx="5.5" ry="19" fill="#0a0408"/>
  <circle cx="92" cy="40" r="5" fill="#fff"/><circle cx="109" cy="60" r="2.5" fill="#fff"/></svg>`,
  { size: 512 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#d6a2ff" stroke-width="6"/>
  <circle cx="50" cy="50" r="33" fill="none" stroke="#9f5be0" stroke-width="4" stroke-dasharray="6 5"/>
  <path d="M50 22 L50 78 M50 40 L33 28 M50 40 L67 28 M50 58 L34 72 M50 58 L66 72 M36 50 L64 50" stroke="#f0d4ff" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`,
  { size: 160 },
);

const SKULL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#2b1620" stroke="#e7b84a" stroke-width="6"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#a9792a" stroke-width="2.5"/>
  <path d="M50 20 C70 20 76 36 72 50 C71 56 66 58 66 63 L66 70 L34 70 L34 63 C34 58 29 56 28 50 C24 36 30 20 50 20Z" fill="#efe6cc" stroke="#120a14" stroke-width="2.5" stroke-linejoin="round"/>
  <ellipse cx="39" cy="46" rx="7.5" ry="8.5" fill="#120a14"/><ellipse cx="61" cy="46" rx="7.5" ry="8.5" fill="#120a14"/>
  <path d="M50 53 L45 63 L55 63Z" fill="#120a14"/><path d="M42 70 V62 M50 70 V62 M58 70 V62" stroke="#120a14" stroke-width="2.5"/></svg>`,
  { size: 192 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#e9b94b" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#e9b94b" stroke-width="3.5" stroke-dasharray="3 4"/>
  <path d="M12 50 Q50 14 88 50 Q50 86 12 50Z" fill="#3a1450" stroke="#e9b94b" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="12" fill="#ffcf3a"/><ellipse cx="50" cy="50" rx="3.5" ry="10" fill="#120a14"/></svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 40 60"><path d="M4 60 Q6 30 2 8 Q12 28 14 60Z" fill="#3c6b24"/>
  <path d="M12 60 Q14 24 20 2 Q26 26 26 60Z" fill="#5a9a34"/><path d="M24 60 Q30 36 38 10 Q36 38 34 60Z" fill="#79b844"/>
  <path d="M16 60 Q18 40 24 26 Q26 44 24 60Z" fill="#8fd04f"/></svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

/** Half-ellipse arch outline in (z, y), front to back, for the barrel lid and its bands. */
const arch = (sz: number, sy: number, n = 10): [number, number][] =>
  Array.from({ length: n + 1 }, (_, k) => {
    const a = (k * Math.PI) / n;
    return [sz * Math.cos(a), sy * Math.sin(a)] as [number, number];
  });

const studs = (pts: number[][], r: number) =>
  mergeGeometries(pts.map(([x, y, z]) => new THREE.SphereGeometry(r, 6, 4).translate(x, y, z)))!;

type Coin = { pos: THREE.Vector3; n: THREE.Vector3; r: number };

function coinGeometry(c: Coin) {
  const g = new THREE.CylinderGeometry(c.r, c.r, 0.013, 10);
  g.applyMatrix4(new THREE.Matrix4().compose(c.pos, aim(c.n), new THREE.Vector3(1, 1, 1)));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "mimic", paintSize: 2048 });
  const R = rng(7);

  // ---- skeleton ----------------------------------------------------------------------------------------------
  const body = b.joint("body", { at: [0, 0.6, 0], dir: [0, 1, 0], role: "spine" });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.83, -0.35], dir: [0, 0, 1], role: "jaw" });
  const eyelidU = b.joint("eyelidU", { parent: body, at: [0, 0.714, 0.405], dir: [0, 0, 1], role: "hinge" });
  const eyelidL = b.joint("eyelidL", { parent: body, at: [0, 0.598, 0.405], dir: [0, 0, 1], role: "hinge" });

  // ---- lower body: the chest base ----------------------------------------------------------------------------
  const base = b.part(new THREE.BoxGeometry(1.0, 0.45, 0.7), BASE_WOOD, {
    bone: body,
    at: [0, 0.605, 0],
    name: "chestBase",
  });
  b.part(new THREE.BoxGeometry(1.06, 0.06, 0.76), IRON, { bone: body, at: [0, 0.41, 0], name: "skirt" });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.07, 0.45, 0.07), IRON, { bone: body, at: [sx * 0.468, 0.605, sz * 0.318] });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.08, 0.452, 0.72), IRON, { bone: body, at: [s * 0.36, 0.606, 0], name: "baseBand" });

  const baseRivets: number[][] = [];
  for (const s of [1, -1]) {
    for (const y of [0.46, 0.56, 0.66, 0.76]) baseRivets.push([s * 0.36, y, 0.362]);
    for (const y of [0.45, 0.62, 0.78]) baseRivets.push([s * 0.468, y, 0.356]);
  }
  b.part(studs(baseRivets, 0.0125), GILT, { bone: body, at: [0, 0, 0], name: "baseRivets" });

  // ---- keyhole plate with the peeking eye ------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.26, 0.34, 0.03), GILT, { bone: body, at: [0, 0.62, 0.365], name: "lockPlate" });
  b.part(
    studs(
      [
        [0.1, 0.76, 0.382],
        [-0.1, 0.76, 0.382],
        [0.1, 0.48, 0.382],
        [-0.1, 0.48, 0.382],
      ],
      0.013,
    ),
    GILT,
    { bone: body, at: [0, 0, 0], name: "plateRivets" },
  );
  const kr = 0.07;
  const keyhole: [number, number][] = [
    [-0.04, -0.17],
    [0.04, -0.17],
  ];
  for (let k = 0; k <= 12; k++) {
    const a = ((-72 + (324 * k) / 12) * Math.PI) / 180;
    keyhole.push([kr * Math.cos(a), kr * Math.sin(a)]);
  }
  b.extrude(keyhole, { at: [0, 0.66, 0.385], x: [1, 0, 0], thickness: 0.016, color: INK, bone: body, name: "keyhole" });

  const eye = b.part(new THREE.SphereGeometry(0.056, 12, 8), "#ffffff", {
    bone: body,
    at: [0, 0.66, 0.4],
    rotation: [0, -90, 0],
    texture: EYE,
    name: "eyeball",
  });
  glow(eye, 0.45);
  b.part(new THREE.SphereGeometry(0.062, 10, 6), "#8a2d58", {
    bone: eyelidU,
    at: [0, 0.714, 0.405],
    scale: [1.1, 0.5, 0.9],
    name: "lidUpper",
  });
  b.part(new THREE.SphereGeometry(0.062, 10, 6), "#6e2247", {
    bone: eyelidL,
    at: [0, 0.598, 0.405],
    scale: [1.1, 0.5, 0.9],
    name: "lidLower",
  });
  // heavy brow ridge of little spikes over the lid
  b.ring(
    { at: new THREE.Vector3(0, 0.66, 0.4), axis: new THREE.Vector3(0, 0, 1) },
    { count: 5, radius: 0.07, fromDeg: -60, toDeg: 60, tilt: 20 },
    (lash) => b.spike(lash, lash, 0.03, 0.007, { color: "#4a1738", bone: eyelidU, sides: 5 }),
  );

  // glowing rune on the front, medallions on the flanks
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: body,
      at: [-0.22, 0.6, 0.352],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
      name: "frontRune",
    }),
    1.2,
  );
  for (const s of [1, -1])
    b.decal(base, SKULL, { at: [s * 0.5, 0.62, 0], dir: [s, 0, 0], size: [0.22, 0.22], name: "skullMedallion" });

  // ---- mouth interior: floor, palate, lips ------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.85, 0.02, 0.55), FLESH, { bone: body, at: [0, 0.84, 0], name: "mouthFloor" });
  b.part(new THREE.BoxGeometry(0.85, 0.04, 0.55), FLESH, { bone: jaw, at: [0, 0.81, 0], name: "palate" });
  for (const [bone, y, tag] of [
    [body, 0.83, "lowerLip"],
    [jaw, 0.8, "upperLip"],
  ] as const) {
    b.part(new THREE.BoxGeometry(0.98, 0.06, 0.07), FLESH, { bone, at: [0, y, 0.31], name: `${tag}Front` });
    b.part(new THREE.BoxGeometry(0.98, 0.06, 0.07), FLESH, { bone, at: [0, y, -0.31], name: `${tag}Back` });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.07, 0.06, 0.58), FLESH, { bone, at: [s * 0.46, y, 0], name: `${tag}Side` });
  }
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.BoxGeometry(0.8, 0.014, 0.025), "#c4506e", {
      bone: jaw,
      at: [0, 0.787, i * 0.1],
      name: "palateRidge",
    });
  b.part(new THREE.SphereGeometry(0.032, 6, 5), "#d6648a", {
    bone: jaw,
    at: [0, 0.745, -0.24],
    scale: [1, 1.7, 1],
    name: "uvula",
  });

  // ---- lid: barrel top, bands, hinges, hasp, sigil -----------------------------------------------------------
  const lid = b.extrude(arch(0.35, 0.27), {
    at: [0, 0.83, 0],
    x: [0, 0, 1],
    thickness: 1.0,
    bevel: 0.012,
    color: LID_WOOD,
    bone: jaw,
    name: "lid",
  });
  for (const s of [1, -1]) {
    b.extrude(arch(0.362, 0.282), {
      at: [s * 0.36, 0.83, 0],
      x: [0, 0, 1],
      thickness: 0.08,
      color: IRON,
      bone: jaw,
      name: "lidBand",
    });
    b.extrude(arch(0.358, 0.278), {
      at: [s * 0.485, 0.83, 0],
      x: [0, 0, 1],
      thickness: 0.03,
      color: IRON,
      bone: jaw,
      name: "lidEndBand",
    });
  }
  const lidRivets: number[][] = [];
  for (const s of [1, -1])
    for (let k = 1; k <= 9; k++) {
      const a = (k * Math.PI) / 10;
      lidRivets.push([s * 0.36, 0.83 + 0.282 * Math.sin(a), 0.362 * Math.cos(a)]);
    }
  b.part(studs(lidRivets, 0.014), GILT, { bone: jaw, at: [0, 0, 0], name: "lidRivets" });
  for (const x of [-0.35, 0, 0.35])
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), IRON, {
      bone: jaw,
      at: [x, 0.835, -0.36],
      dir: [1, 0, 0],
      name: "hinge",
    });

  const haspHit = b.surface(lid).nearest([0, 0.99, 0.45]);
  b.stick(new THREE.BoxGeometry(0.12, 0.02, 0.2), GILT, haspHit, { embed: 0.3, name: "hasp" });
  const lockHit = b.surface(lid).nearest([0, 0.89, 0.45]);
  b.stick(new THREE.CylinderGeometry(0.036, 0.036, 0.026, 8), IRON, lockHit, { embed: 0.3, name: "haspLock" });

  glow(
    b.decal(lid, SIGIL, { at: [0, 1.1, 0], dir: [0, 1, 0], up: [0, 0, 1], size: [0.3, 0.3], segments: 12, name: "sigil" }),
    0.7,
  );

  // moss growing on lid and the base's lower flanks
  const lidMoss = b.surface(lid).scatter(26, {
    rng: R,
    minDist: 0.09,
    filter: (h) =>
      h.n.y > 0.3 &&
      Math.abs(Math.abs(h.at.x) - 0.36) > 0.06 &&
      Math.abs(h.at.x) < 0.45 &&
      Math.hypot(h.at.x, h.at.z) > 0.2,
  });
  b.cards(lidMoss, TUFT, { size: [0.06, 0.07], lean: 15, vary: 0.3, rng: R, cross: true });
  const baseMoss = b.surface(base).scatter(14, {
    rng: R,
    minDist: 0.12,
    filter: (h) => h.at.y < 0.48 && Math.abs(h.n.y) < 0.5,
  });
  b.cards(baseMoss, TUFT, { size: [0.05, 0.06], lean: 25, vary: 0.3, rng: R, cross: true });

  // ---- fangs ------------------------------------------------------------------------------------------------
  const mkTooth = (
    bone: typeof body,
    x: number,
    y: number,
    z: number,
    up: number,
    lean: [number, number],
    force?: number,
  ) => {
    const roll = R();
    let len = 0.07 + R() * 0.1;
    if (roll > 0.82) len = 0.2 + R() * 0.07;
    else if (roll < 0.14) len = 0.035 + R() * 0.02;
    if (force) len = force;
    const r = 0.019 + len * 0.11;
    return b.spike([x, y, z], new THREE.Vector3(lean[0], up, lean[1]).normalize(), len, r, {
      color: TOOTH,
      sides: 5,
      bone,
      name: up > 0 ? "fangLower" : "fangUpper",
    });
  };

  // lower jaw (tongue lane x 0.08..0.36 and the bone at x -0.3 left clear)
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.1;
    if ((x > 0.05 && x < 0.38) || Math.abs(x + 0.3) < 0.01) continue;
    mkTooth(body, x, 0.855, 0.31, 1, [R() * 0.1 - 0.05, 0.16], Math.abs(x + 0.4) < 0.01 ? 0.21 : undefined);
  }
  for (const s of [1, -1])
    for (const z of [-0.22, -0.09, 0.04, 0.17]) mkTooth(body, s * 0.46, 0.855, z, 1, [-s * 0.15, 0]);

  // upper jaw (the lid)
  const uppers: ReturnType<typeof mkTooth>[] = [];
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.1;
    uppers.push(
      mkTooth(jaw, x, 0.785, 0.31, -1, [R() * 0.1 - 0.05, 0.12], Math.abs(x + 0.2) < 0.01 || Math.abs(x - 0.3) < 0.01 ? 0.27 : undefined),
    );
  }
  for (const s of [1, -1])
    for (const z of [-0.15, -0.02, 0.11, 0.24]) uppers.push(mkTooth(jaw, s * 0.46, 0.785, z, -1, [-s * 0.15, 0]));

  // ---- gold hoard --------------------------------------------------------------------------------------------
  const heap: Coin[] = [];
  for (let k = 0; k < 90; k++) {
    const ang = R() * Math.PI * 2;
    const rad = Math.sqrt(R());
    const x = Math.cos(ang) * rad * 0.36;
    const z = Math.sin(ang) * rad * 0.21;
    const h = 0.09 * (1 - rad * rad);
    heap.push({
      pos: new THREE.Vector3(x, 0.857 + h + R() * 0.018, z),
      n: new THREE.Vector3(x * 1.6 + (R() - 0.5) * 0.9, 1, z * 1.6 + (R() - 0.5) * 0.9).normalize(),
      r: 0.055 + R() * 0.02,
    });
  }
  const floorCoins: Coin[] = [];
  for (let k = 0; k < 13; k++)
    floorCoins.push({
      pos: new THREE.Vector3((R() - 0.5) * 1.2, 0.012, 0.55 + R() * 0.45),
      n: new THREE.Vector3((R() - 0.5) * 0.2, 1, (R() - 0.5) * 0.2).normalize(),
      r: 0.055 + R() * 0.02,
    });
  for (let k = 0; k < 5; k++)
    floorCoins.push({ pos: new THREE.Vector3(-0.42, 0.0065 + k * 0.0135, 0.66), n: new THREE.Vector3(0, 1, 0), r: 0.065 });
  // a coin leaning on the chest front
  floorCoins.push({ pos: new THREE.Vector3(0.52, 0.062, 0.4), n: new THREE.Vector3(0, 0.55, 0.83).normalize(), r: 0.065 });

  const all = [...heap, ...floorCoins];
  const buckets: THREE.BufferGeometry[][] = [[], [], []];
  all.forEach((c, i) => buckets[i % 3].push(coinGeometry(c)));
  [COIN_A, COIN_B, COIN_C].forEach((col, i) =>
    b.part(mergeGeometries(buckets[i])!, col, { bone: body, at: [0, 0, 0], name: "coins" }),
  );
  const faced = [...heap.filter((c) => c.n.y > 0.8 && c.pos.y > 0.88).slice(0, 12), ...floorCoins.slice(0, 5)];
  for (const c of faced)
    b.part(new THREE.CircleGeometry(c.r * 0.92, 10), "#ffffff", {
      bone: body,
      at: c.pos.clone().addScaledVector(c.n, 0.0068),
      dir: c.n,
      axis: "z",
      texture: COIN,
      name: "coinFace",
    });

  // gems and a gnawed bone in the loot
  const gem = (col: string, at: [number, number, number], s: number) =>
    glow(
      b.part(new THREE.OctahedronGeometry(0.04 * s, 0), col, {
        bone: body,
        at,
        scale: [1, 1.3, 1],
        rotation: [0, R() * 90, 12],
        flat: true,
        name: "gem",
      }),
      0.8,
    );
  gem("#2fe39b", [-0.24, 0.945, 0.06], 1);
  gem("#e0264f", [-0.08, 0.96, -0.12], 1.1);
  gem("#3b7bff", [0.3, 0.9, -0.12], 0.9);

  const boneA = new THREE.Vector3(-0.3, 0.96, -0.12);
  const boneB = new THREE.Vector3(-0.31, 0.88, 0.44);
  b.capsule(boneA, boneB, 0.016, BONE, { bone: body, name: "femur" });
  for (const end of [boneA, boneB])
    for (const dx of [-0.014, 0.014]) b.part(new THREE.SphereGeometry(0.024, 6, 4), BONE, { bone: body, at: [end.x + dx, end.y, end.z] });

  // ---- tongue ------------------------------------------------------------------------------------------------
  const tpath = catmull([
    [0.1, 0.9, -0.26],
    [0.13, 1.01, -0.06],
    [0.17, 1.03, 0.16],
    [0.22, 0.98, 0.36],
    [0.25, 0.84, 0.5],
    [0.26, 0.62, 0.56],
    [0.27, 0.42, 0.59],
    [0.29, 0.26, 0.66],
    [0.31, 0.19, 0.82],
  ]);
  const tongue = b.chain("tongue", tpath, { parent: body, count: 7, role: "tentacle" });
  const tongueSweep = b.sweep(
    tongue,
    (t: number) => [0.1 - 0.03 * t, 0.03 - 0.008 * t] as [number, number],
    { color: TONGUE, to: 0.88, caps: { start: "round", end: "flat" }, name: "tongue" },
  );
  const tongueTip = tongue.joints[tongue.joints.length - 1];
  const fork0 = tpath.at(0.86);
  const tipEnd = tpath.at(1);
  for (const s of [1, -1])
    b.capsule(
      [fork0.x + s * 0.03, fork0.y, fork0.z],
      [tipEnd.x + s * 0.06, tipEnd.y + 0.01, tipEnd.z + 0.1],
      [0.026, 0.01],
      TONGUE,
      { bone: tongueTip, name: "tongueFork" },
    );
  for (const hit of b.surface(tongueSweep).scatter(32, { rng: R, minDist: 0.05, filter: (h) => h.n.y > 0.35 }))
    b.stick(new THREE.SphereGeometry(0.012, 5, 4), "#e3a9f2", hit, { embed: 0.5, name: "papilla" });

  // ---- spidery legs ------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = [-0.25, -0.09, 0.09, 0.25][i];
      const hip: [number, number, number] = [s * 0.43, 0.44, z];
      const foot: [number, number, number] = [s * (0.74 + 0.07 * (i % 2)), 0.02, z * 2.1 + (i < 2 ? -0.03 : 0.03)];
      const pts = limb(hip, foot, [0.22, 0.3, 0.26], [[s * 0.5, 1, 0]]);
      const chain = b.chain(`leg${side}${i}`, pts, {
        parent: body,
        names: [`coxa${side}${i}`, `femur${side}${i}`, `tibia${side}${i}`, `foot${side}${i}`],
        role: "leg",
      });
      const route = polyline(pts);
      const sw = b.sweep(chain, (t: number) => 0.05 * (1 - t) + 0.018 * t, {
        color: legPaint(route.closestT(pts[1]), route.closestT(pts[2])),
        sides: 6,
        name: "leg",
      });
      b.along(
        sw,
        3,
        (at) => b.spike(at, at, 0.06, 0.014, { color: BONE, sides: 5, name: "legSpike" }),
        { from: 0.3, to: 0.95 },
      );
      b.part(new THREE.SphereGeometry(0.03, 6, 4), IRON, {
        bone: chain.tip!,
        at: [foot[0], 0.03, foot[2]],
        name: "footPad",
      });
    }
  }

  // ---- open the jaw ------------------------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: -60 });

  // drool strings hang straight down from the raised fangs
  uppers
    .filter((_, i) => i % 3 === 1)
    .forEach((tooth) => {
      const f = tooth.at(0.92);
      const end = offset(f.at, [0, -1, 0], 0.1 + R() * 0.12);
      b.sweep(polyline([f.at, end]), [0.006, 0.004], { color: SLIME, bone: jaw, name: "drool" });
      b.part(new THREE.SphereGeometry(0.016, 6, 4), SLIME, { bone: jaw, at: end, scale: [1, 1.4, 1], name: "droolDrop" });
    });

  return b.root;
}
