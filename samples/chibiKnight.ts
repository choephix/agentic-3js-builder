import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { arc, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Chibi Knight",
  description:
    "A 0.7 m kawaii knight: huge pastel helmet with a mint plume and a big-eyed visor, a heart-crest tabard, a wooden sword and a pot-lid shield, little boots.",
};

// ---------------------------------------------------------------- palette
const STEEL = "#a9c6f0";
const STEEL_D = "#7d9fd8";
const STEEL_L = "#dbe8fc";
const GOLD = "#ffd05e";
const GOLD_D = "#ea9f3c";
const PINK = "#ff8db3";
const PINK_L = "#ffd3e2";
const CREAM = "#fff4de";
const LAV = "#c7b5ff";
const NAVY = "#423d7c";
const MINT = "#6fe6c6";
const CORAL = "#ffa592";
const BOOT = "#c98a62";
const BOOT_L = "#ffe2c4";
const WOOD = "#f3c483";
const WOOD_D = "#c58a4c";
const LID = "#d8e0ee";
const LID_D = "#a9b7d3";
const KNOB = "#6b4f9e";

// ---------------------------------------------------------------- drawings (flat fills, no gradients)
const heartPath = (cx: number, cy: number, k: number) =>
  `M${cx} ${cy + 30 * k} C${cx - 52 * k} ${cy - 2 * k} ${cx - 36 * k} ${cy - 40 * k} ${cx - 14 * k} ${cy - 36 * k} C${cx - 6 * k} ${cy - 35 * k} ${cx - 1 * k} ${cy - 28 * k} ${cx} ${cy - 24 * k} C${cx + 1 * k} ${cy - 28 * k} ${cx + 6 * k} ${cy - 35 * k} ${cx + 14 * k} ${cy - 36 * k} C${cx + 36 * k} ${cy - 40 * k} ${cx + 52 * k} ${cy - 2 * k} ${cx} ${cy + 30 * k} Z`;

const eye = (cx: number) => `
  <ellipse cx="${cx}" cy="72" rx="32" ry="41" fill="#ffffff"/>
  <ellipse cx="${cx}" cy="76" rx="26" ry="35" fill="#56d8f5"/>
  <ellipse cx="${cx}" cy="81" rx="16" ry="23" fill="#1f2a6b"/>
  <path d="M${cx - 21} 92 Q${cx} 112 ${cx + 21} 92 Q${cx} 104 ${cx - 21} 92 Z" fill="#b9f4ff"/>
  <circle cx="${cx - 9}" cy="58" r="9" fill="#ffffff"/>
  <circle cx="${cx + 10}" cy="92" r="4.5" fill="#ffffff"/>`;

const FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150">
  <rect x="3" y="6" width="234" height="138" rx="56" fill="${NAVY}"/>
  ${eye(78)}${eye(162)}
  <path d="M52 24 Q78 12 104 22" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/>
  <path d="M136 22 Q162 12 188 24" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="22" cy="118" rx="13" ry="8" fill="#ff7fa8"/>
  <ellipse cx="218" cy="118" rx="13" ry="8" fill="#ff7fa8"/>
  <path d="M16 114 l7 0 M20 119 l7 0" stroke="#ffd3e2" stroke-width="3" stroke-linecap="round"/>
  <path d="M210 114 l7 0 M214 119 l7 0" stroke="#ffd3e2" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 512 },
);

const MOUTH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 44">
  <path d="M10 8 Q40 52 70 8 Q40 16 10 8 Z" fill="${NAVY}" stroke="${NAVY}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M26 26 Q40 40 54 26 Q40 20 26 26 Z" fill="#ff7fa8"/>
</svg>`,
  { size: 256 },
);

const SHINE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60">
  <path d="M8 44 Q16 12 52 8 Q24 18 16 50 Z" fill="#f4f9ff"/>
  <circle cx="62" cy="14" r="6" fill="#f4f9ff"/>
</svg>`,
  { size: 256 },
);

const STAR_DISC = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="${GOLD_D}"/>
  <circle cx="32" cy="32" r="25" fill="${GOLD}"/>
  <path d="M32 12 L37.5 25 L51 26 L40.5 35 L44 49 L32 41.5 L20 49 L23.5 35 L13 26 L26.5 25 Z" fill="#fff4c4" stroke="${GOLD_D}" stroke-width="3" stroke-linejoin="round"/>
</svg>`,
  { size: 192 },
);

const tabardShape = `M16 0 L136 0 L152 158 L126 172 L101 158 L76 172 L51 158 L26 172 L0 158 Z`;
const belt = `<rect x="6" y="84" width="140" height="15" fill="${GOLD_D}"/><rect x="6" y="84" width="140" height="6" fill="${GOLD}"/>
  <rect x="62" y="78" width="28" height="27" rx="5" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="4"/>
  <rect x="71" y="87" width="10" height="9" rx="2" fill="${GOLD_D}"/>`;
const hem = `<path d="M2 146 L150 146" stroke="${GOLD}" stroke-width="7"/>
  <path d="M8 138 l4 0 M24 138 l4 0 M40 138 l4 0 M56 138 l4 0 M72 138 l4 0 M88 138 l4 0 M104 138 l4 0 M120 138 l4 0 M136 138 l4 0" stroke="${PINK_L}" stroke-width="4" stroke-linecap="round"/>`;
const sparkle = (x: number, y: number, r: number) =>
  `<path d="M${x} ${y - r} Q${x + 1.5} ${y - 1.5} ${x + r} ${y} Q${x + 1.5} ${y + 1.5} ${x} ${y + r} Q${x - 1.5} ${y + 1.5} ${x - r} ${y} Q${x - 1.5} ${y - 1.5} ${x} ${y - r} Z" fill="#ffffff"/>`;

const TABARD_FRONT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 152 172">
  <path d="${tabardShape}" fill="${PINK}"/>
  <path d="M16 0 L136 0 L138 14 L14 14 Z" fill="${PINK_L}"/>
  <path d="M6 0 L16 0 L26 158 L0 158 Z" fill="#ff78a4"/>
  <path d="M146 0 L136 0 L126 158 L152 158 Z" fill="#ff78a4"/>
  ${hem}
  <circle cx="76" cy="52" r="33" fill="${CREAM}" stroke="${GOLD}" stroke-width="5"/>
  <path d="${heartPath(76, 53, 0.62)}" fill="#ff3d6e" stroke="#d92a59" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="65" cy="41" rx="5" ry="3" fill="#ffffff" transform="rotate(-35 65 41)"/>
  ${belt}
  ${sparkle(22, 40, 7)}${sparkle(130, 34, 6)}${sparkle(118, 118, 5)}
</svg>`,
  { size: 512 },
);

const TABARD_BACK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 152 172">
  <path d="${tabardShape}" fill="${PINK}"/>
  <path d="M16 0 L136 0 L138 14 L14 14 Z" fill="${PINK_L}"/>
  ${hem}
  <path d="M76 18 L86 44 L114 46 L92 63 L100 90 L76 74 L52 90 L60 63 L38 46 L66 44 Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="6" y="104" width="140" height="13" fill="${GOLD_D}"/><rect x="6" y="104" width="140" height="5" fill="${GOLD}"/>
  ${sparkle(24, 62, 7)}${sparkle(130, 66, 6)}
</svg>`,
  { size: 512 },
);

const BLADE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 160">
  <rect width="40" height="160" fill="${WOOD}"/>
  <rect x="17" width="6" height="160" fill="#f9d9a6"/>
  <path d="M6 0 Q2 40 7 80 Q11 120 5 160" fill="none" stroke="${WOOD_D}" stroke-width="3" stroke-linecap="round"/>
  <path d="M34 0 Q38 50 33 90 Q30 130 35 160" fill="none" stroke="${WOOD_D}" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="29" cy="40" rx="3.5" ry="6" fill="${WOOD_D}"/>
  <path d="M12 118 l0 14 M28 108 l0 14" stroke="${WOOD_D}" stroke-width="3" stroke-linecap="round"/>
  <path d="${heartPath(20, 64, 0.26)}" fill="${PINK}" stroke="#d9567f" stroke-width="2" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const LID_FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${LID}"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="${LID_D}" stroke-width="5"/>
  <circle cx="50" cy="50" r="27" fill="none" stroke="${LID_D}" stroke-width="4"/>
  <path d="M20 34 Q28 18 46 13" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
  <path d="M14 46 Q16 40 18 38" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
  <path d="M66 72 l12 -10 M70 80 l10 -8 M60 82 l7 -6" stroke="${LID_D}" stroke-width="4" stroke-linecap="round"/>
  <path d="M72 24 L75 31 L83 32 L77 37 L79 45 L72 41 L65 45 L67 37 L61 32 L69 31 Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const tuft = (fill: string, vein: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
  <path d="M20 0 Q38 18 34 44 Q30 62 20 64 Q10 62 6 44 Q2 18 20 0 Z" fill="${fill}"/>
  <path d="M20 4 Q22 30 20 62" fill="none" stroke="${vein}" stroke-width="4" stroke-linecap="round"/>
  <path d="M20 26 Q12 22 9 16 M20 40 Q11 36 8 30 M20 26 Q28 22 31 16 M20 40 Q29 36 32 30" fill="none" stroke="${vein}" stroke-width="3" stroke-linecap="round"/>
</svg>`,
    { size: 128 },
  );
const TUFT_MINT = tuft("#d2fbee", "#7fe6cb");
const TUFT_CORAL = tuft("#ffd2c8", "#ff9a8a");

// ---------------------------------------------------------------- model
export default function build() {
  const b = createBuilder({ name: "chibiKnight" });
  const rand = rng(11);
  const sphere = (r: number, w: number, h: number) => new THREE.SphereGeometry(r, w, h);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.18, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.18, 0],
      [0, 0.26, 0],
      [0, 0.335, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 0.34, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.385, 0], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.41, 0.03], aim: [0, 0.37, 0.13], role: "jaw", group: "head" });
  const visor = b.joint("visor", { parent: head, at: [0, 0.536, 0], dir: [0, 0, 1], role: "hinge", group: "head" });

  // ---- torso (steel), tabard panels, skirt
  b.sweep(spine, (t) => [0.088 + 0.012 * t, 0.078 + 0.008 * t], {
    color: STEEL,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
  });
  b.lathe(
    [
      [0, 0.085],
      [0.1, 0.085],
      [0.14, -0.055],
      [0, -0.055],
    ],
    { at: [0, 0.18, 0], bone: hips, color: LAV, segments: 8 },
  );
  b.lathe(
    [
      [0.13, -0.04],
      [0.146, -0.04],
      [0.148, -0.058],
      [0.13, -0.058],
    ],
    { at: [0, 0.18, 0], bone: hips, color: GOLD, segments: 8 },
  );
  const tilt = new THREE.Vector3(0, 0.186, 0.983).normalize();
  for (const f of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.19, 0.214), "#ffffff", {
      at: [0, 0.225, f * (0.118 + 0.005)],
      dir: [0, tilt.y, f * tilt.z],
      axis: "z",
      bone: spine.joints[1],
      texture: f > 0 ? TABARD_FRONT : TABARD_BACK,
    });
  }

  // ---- helmet
  const helmet = b.part(sphere(0.17, 12, 8), STEEL, { bone: head, at: [0, 0.455, 0], flat: true, name: "helmet" });
  const hs = b.surface(helmet);
  b.decal(helmet, FACE, {
    at: [0, 0.457, 0.17],
    dir: [0, 0, 1],
    size: [0.24, 0.15],
    segments: [14, 9],
    lift: 0.004,
    bone: head,
  });
  const shineHit = hs.around([0, 0.455, 0]).at(-38, 52);
  if (shineHit) b.decal(helmet, SHINE, { at: shineHit, size: [0.07, 0.052], lift: 0.002, bone: head });
  // gold neck rim and top ridge
  const rimPts: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    rimPts.push([Math.sin(a) * 0.112, 0.322, Math.cos(a) * 0.112]);
  }
  b.sweep(catmull(rimPts, { closed: true }), 0.014, { color: GOLD, bone: head, sides: 6, smooth: false });
  b.sweep(arc([0, 0.455, 0], [0, 0.455 + 0.175 * Math.sin(0.44), -0.175 * Math.cos(0.44)], [1, 0, 0], 130), 0.012, {
    color: GOLD,
    bone: head,
    sides: 6,
    smooth: false,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.034, 6), GOLD_D, { bone: head, at: [0, 0.636, -0.004], flat: true });
  // brow (visor hinge)
  b.sweep(arc([0, 0.536, 0], [-0.158, 0.536, 0], [0, 1, 0], 180), [0.017, 0.013], {
    color: GOLD,
    bone: visor,
    sides: 6,
    smooth: false,
  });
  // ear discs with star stickers
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.032, 8), STEEL_D, {
      bone: head,
      at: [s * 0.165, 0.455, 0],
      dir: [s, 0, 0],
      flat: true,
    });
    b.part(new THREE.CircleGeometry(0.034, 10), "#ffffff", {
      bone: head,
      at: [s * 0.1825, 0.455, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: STAR_DISC,
    });
  }
  // chin guard on the jaw bone
  const chin = b.part(sphere(0.05, 8, 6), STEEL, {
    bone: jaw,
    at: [0, 0.356, 0.125],
    scale: [1.05, 0.62, 0.8],
    flat: true,
    name: "chin",
  });
  b.decal(chin, MOUTH, { at: [0, 0.352, 0.17], dir: [0, 0, 1], size: [0.052, 0.029], lift: 0.002, bone: jaw });

  // ---- plume
  const plume = b.chain(
    "plume",
    catmull([
      [0, 0.64, -0.004],
      [0, 0.69, -0.035],
      [0, 0.705, -0.11],
      [0, 0.65, -0.2],
      [0, 0.56, -0.235],
    ]),
    { parent: head, names: ["plume1", "plume2", "plume3", "plume4"], role: "tail" },
  );
  const plumeTube = b.sweep(
    plume,
    (t) => {
      const k = Math.sin(Math.PI * Math.pow(t, 0.85));
      return [0.012 + 0.036 * k, 0.012 + 0.02 * k];
    },
    {
      sides: 6,
      smooth: false,
      bands: [
        [0.55, MINT],
        [0.85, "#9af0da"],
        [1, CORAL],
      ],
      caps: "round",
    },
  );
  for (const s of [1, -1])
    b.cards(
      [0.36, 0.46, 0.56, 0.66, 0.75, 0.84, 0.93].map((t) => plumeTube.at(t, 0)),
      [TUFT_MINT, TUFT_MINT, TUFT_CORAL],
      { size: [0.08, 0.11], lean: 82, bend: 22, flow: [s * 1.0, -0.5, -0.25], vary: 0.15, spin: 6, rng: rand },
    );

  // ---- arms, hands, weapons
  const handPos: Record<string, THREE.Vector3> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.1, 0.315, 0],
      [s * 0.175, 0.288, 0.008],
      [s * 0.25, 0.262, 0.018],
      [s * 0.295, 0.245, 0.022],
    ];
    const arm = b.chain(`arm${side}`, polyline(pts), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.04, 0.036, 0.031, 0.028], { color: LAV, sides: 6, smooth: false });
    const [shoulder, elbow, wrist, hand] = arm.joints;
    handPos[side] = hand.at.clone();
    // pauldron with a gold stud
    b.part(sphere(0.052, 8, 6), STEEL, {
      bone: shoulder,
      at: [s * 0.108, 0.322, 0],
      scale: [1.05, 0.85, 1],
      flat: true,
    });
    b.part(sphere(0.014, 5, 3), GOLD, { bone: shoulder, at: [s * 0.112, 0.356, 0], flat: true });
    // elbow pad
    b.part(sphere(0.03, 6, 4), STEEL_L, { bone: elbow, at: [s * 0.178, 0.288, 0.012], flat: true });
    // gauntlet cuff + fist
    b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.024, 6), GOLD, {
      bone: wrist,
      at: [s * 0.257, 0.259, 0.019],
      dir: [s * 0.075, -0.027, 0.004],
      flat: true,
    });
    b.part(sphere(0.037, 7, 5), STEEL_L, { bone: hand, at: hand.at, flat: true });
    // digits: thumb and finger block, each one joint
    const fingers = b.chain(
      `fingers${side}`,
      polyline([
        [s * 0.295, 0.27, 0.05],
        [s * 0.295, 0.212, 0.05],
      ]),
      { parent: hand, names: [`fingers${side}`], role: "digit" },
    );
    b.sweep(fingers, 0.017, { color: STEEL, sides: 6, smooth: false });
    const thumb = b.chain(
      `thumb${side}`,
      polyline([
        [s * 0.295, 0.268, 0.032],
        [s * 0.292, 0.29, 0.046],
      ]),
      { parent: hand, names: [`thumb${side}`], role: "digit" },
    );
    b.sweep(thumb, 0.013, { color: STEEL, sides: 6, smooth: false });
  }

  // wooden sword in the right hand (model right = -X)
  const hr = handPos.R;
  const swordY = hr.y;
  const sword = (y: number) => [hr.x, y, hr.z] as number[];
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.09, 6), PINK, {
    bone: "handR",
    at: sword(swordY + 0.005),
    flat: true,
  });
  b.part(sphere(0.02, 6, 4), GOLD, { bone: "handR", at: sword(swordY - 0.05), flat: true });
  b.part(new THREE.BoxGeometry(0.12, 0.02, 0.024), WOOD_D, { bone: "handR", at: sword(swordY + 0.06), flat: true });
  b.part(new THREE.BoxGeometry(0.05, 0.22, 0.016), "#ffffff", {
    bone: "handR",
    at: sword(swordY + 0.181),
    texture: BLADE,
    flat: true,
  });
  b.part(new THREE.ConeGeometry(0.0354, 0.06, 4).rotateY(Math.PI / 4), WOOD, {
    bone: "handR",
    at: sword(swordY + 0.322),
    scale: [1, 1, 0.32],
    flat: true,
  });

  // pot-lid shield in the left hand
  const hl = handPos.L;
  const lidAxis = new THREE.Vector3(0.12, 0.04, 1).normalize();
  const lidAt = new THREE.Vector3(hl.x + 0.04, hl.y + 0.005, 0.075);
  const lidPt = (h: number) => lidAt.clone().addScaledVector(lidAxis, h).toArray();
  b.lathe(
    [
      [0, 0],
      [0.112, 0],
      [0.122, 0.011],
      [0.112, 0.022],
      [0.09, 0.03],
      [0.06, 0.034],
      [0, 0.034],
    ],
    { at: lidAt, axis: lidAxis, bone: "handL", color: LID_D, segments: 10 },
  );
  b.part(new THREE.CircleGeometry(0.088, 10), "#ffffff", {
    bone: "handL",
    at: lidPt(0.0365),
    dir: lidAxis,
    axis: "z",
    texture: LID_FACE,
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.014, 0.024, 6), KNOB, {
    bone: "handL",
    at: lidPt(0.046),
    dir: lidAxis,
    flat: true,
  });
  b.part(sphere(0.026, 7, 5), KNOB, { bone: "handL", at: lidPt(0.066), flat: true });
  b.capsule(hl, lidPt(0), 0.011, { color: BOOT, bone: "handL" });

  // ---- legs and boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.055, 0.15, 0],
        [s * 0.055, 0.105, 0.004],
        [s * 0.055, 0.065, 0],
        [s * 0.055, 0.03, 0.05],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(leg, [0.03, 0.028, 0.027, 0.022], {
      sides: 6,
      smooth: false,
      bands: [
        [0.45, PINK_L],
        [1, CREAM],
      ],
    });
    const [, , ankle, foot] = leg.joints;
    b.part(sphere(0.05, 8, 6), BOOT, {
      bone: ankle,
      at: [s * 0.055, 0.04, 0.012],
      scale: [0.88, 0.8, 1.25],
      flat: true,
    });
    b.part(sphere(0.034, 7, 5), BOOT_L, {
      bone: foot,
      at: [s * 0.055, 0.03, 0.068],
      scale: [1.05, 0.9, 1.05],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.043, 0.022, 8), BOOT_L, {
      bone: ankle,
      at: [s * 0.055, 0.078, 0],
      flat: true,
    });
  }

  return b.root;
}
