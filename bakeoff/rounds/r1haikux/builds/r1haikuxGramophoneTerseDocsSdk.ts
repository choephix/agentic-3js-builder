import * as THREE from "three";
import { catmull, createBuilder, grain, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A wood-cased gramophone with a brass exponential horn on a curved neck, a black record with a red label, and a swivelling tone arm.",
};

const WOOD_LIGHT = "#8a5530";
const WOOD_DARK = "#4a2611";
const BRASS = "#c9a24a";
const BRASS_DARK = "#8a6a2a";
const STEEL = "#b9bec4";
const BLACK = "#161616";
const VINYL_A = "#1f1f25";
const VINYL_B = "#111116";
const RED = "#b5261e";
const GOLD = "#e6c25a";
const CREAM = "#efe6cf";
const OXBLOOD = "#5a1a14";

// Turntable centre, on the cabinet top
const TT: [number, number, number] = [-0.04, 0.22, 0.03];

const label = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="${BLACK}"/>
    <circle cx="50" cy="50" r="44" fill="${RED}"/>
    <circle cx="50" cy="50" r="37" fill="${GOLD}"/>
    <circle cx="50" cy="50" r="31" fill="${RED}"/>
    <circle cx="50" cy="50" r="6" fill="${BLACK}"/>
  </svg>`,
  { size: 256 },
);

const badge = svg(
  `<svg viewBox="0 0 120 60">
    <ellipse cx="60" cy="30" rx="58" ry="28" fill="${GOLD}"/>
    <ellipse cx="60" cy="30" rx="50" ry="22" fill="${OXBLOOD}"/>
    <ellipse cx="60" cy="30" rx="34" ry="13" fill="${CREAM}"/>
    <path d="M60 19 L66 30 L60 41 L54 30 Z" fill="${OXBLOOD}"/>
  </svg>`,
  { size: 512 },
);

const wood = grain(WOOD_LIGHT, WOOD_DARK, { size: 0.03, axis: "x" });
const vinyl = paint((p) =>
  Math.floor(Math.hypot(p.x - TT[0], p.z - TT[2]) / 0.006) % 2 ? VINYL_A : VINYL_B,
);
const bellPaint = paint((_p, _n, s) => (s[0] > 0.2 ? BRASS_DARK : BRASS));

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Skeleton: cabinet root, turntable, horn neck, tone arm
  const base = b.joint("base", { at: [0, 0, 0], role: "spine" });
  const platter = b.joint("platter", { parent: base, at: TT, dir: [0, 1, 0] });

  const stem = catmull([
    [-0.1, 0.22, -0.13],
    [-0.09, 0.34, -0.15],
    [-0.075, 0.44, -0.13],
    [-0.06, 0.5, -0.06],
  ]);
  const neck = b.chain("horn", stem, {
    parent: base,
    names: ["hornBase", "hornMid", "hornTop", "hornBell"],
    role: "neck",
  });

  const arm = b.chain(
    "toneArm",
    catmull([
      [0.13, 0.27, -0.09],
      [0.115, 0.29, -0.07],
      [0.085, 0.29, -0.045],
      [0.052, 0.272, -0.03],
    ]),
    { parent: base, names: ["armPivot", "armMid", "armHead", "armTip"], role: "hinge" },
  );

  // Cabinet: grained wood box on four feet, with brass trim bands
  const cabinet = b.part(new THREE.BoxGeometry(0.4, 0.19, 0.34), wood, {
    bone: base,
    at: [0, 0.125, 0],
  });
  const shell = b.surface(cabinet);
  b.sweep(shell.loop([0, 0.218, 0], { dir: [0, 1, 0], lift: 0.002 }), 0.004, {
    color: BRASS,
    bone: base,
  });
  b.sweep(shell.loop([0, 0.034, 0], { dir: [0, 1, 0], lift: 0.002 }), 0.004, {
    color: BRASS,
    bone: base,
  });

  const feet: [number, number][] = [
    [-0.17, -0.13],
    [0.17, -0.13],
    [-0.17, 0.13],
    [0.17, 0.13],
  ];
  for (const [x, z] of feet) {
    b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.03, 10), BLACK, {
      bone: base,
      at: [x, 0.015, z],
      flat: true,
    });
  }

  // Oval maker's badge on the front
  b.part(new THREE.PlaneGeometry(0.12, 0.06), "#ffffff", {
    bone: base,
    at: [0, 0.125, 0.1715],
    dir: [0, 0, 1],
    axis: "z",
    texture: badge,
  });

  // Hand crank on the model's left side
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 14), BRASS, {
    bone: base,
    at: [0.206, 0.12, 0],
    rotation: [0, 0, 90],
    flat: true,
  });
  b.rod([0.212, 0.12, 0], [0.245, 0.12, 0], 0.008, { color: BRASS, bone: base });
  b.rod([0.245, 0.12, 0], [0.245, 0.17, 0], 0.007, { color: BRASS, bone: base });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), BLACK, { bone: base, at: [0.245, 0.175, 0] });

  // Turntable: brass rim, black vinyl with grooves, red label, spindle
  b.part(new THREE.CylinderGeometry(0.13, 0.135, 0.01, 24), BRASS, {
    bone: platter,
    at: [TT[0], 0.225, TT[2]],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.118, 0.118, 0.006, 32), vinyl, {
    bone: platter,
    at: [TT[0], 0.233, TT[2]],
  });
  b.part(new THREE.CircleGeometry(0.045, 28), "#ffffff", {
    bone: platter,
    at: [TT[0], 0.2372, TT[2]],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: label,
  });
  b.rod([TT[0], 0.2372, TT[2]], [TT[0], 0.262, TT[2]], 0.005, { color: STEEL, bone: platter });

  // Horn neck: a tapering brass tube rising from a collar on the cabinet top
  b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.02, 14), BRASS, {
    bone: base,
    at: [-0.1, 0.23, -0.13],
    flat: true,
  });
  b.sweep(neck, [0.02, 0.016], { color: BRASS, caps: { start: "round", end: "none" } });

  // Exponential bell: a hollow lathe shell with a closed throat, axis tilted up and forward.
  // Its mouth lip is a darker brass band.
  b.lathe(
    [
      [0, 0],
      [0.016, 0],
      [0.0245, 0.04],
      [0.0377, 0.08],
      [0.0578, 0.12],
      [0.0886, 0.16],
      [0.122, 0.19],
      [0.151, 0.21],
      [0.168, 0.22],
      [0.176, 0.226],
      [0.171, 0.226],
      [0.163, 0.22],
      [0.146, 0.21],
      [0.117, 0.19],
      [0.083, 0.16],
      [0.053, 0.12],
      [0.033, 0.08],
      [0.02, 0.04],
      [0.011, 0.003],
      [0, 0.003],
    ],
    {
      at: [-0.06, 0.5, -0.06],
      axis: [0.16, 0.63, 0.76],
      segments: 16,
      bone: neck.tip ?? neck.joints[3],
      color: bellPaint,
    },
  );

  // Tone arm: a pivot post, a curved brass arm, a head and a steel needle on the record
  b.rod([0.13, 0.215, -0.09], [0.13, 0.27, -0.09], 0.009, { color: BRASS, bone: arm.joints[0] });
  b.sweep(arm, [0.009, 0.006], { color: BRASS, caps: { start: "round", end: "round" } });
  const headBone = arm.tip ?? arm.joints[3];
  b.part(new THREE.BoxGeometry(0.034, 0.016, 0.026), BRASS, {
    bone: headBone,
    at: [0.052, 0.264, -0.03],
    rotation: [0, -35, 0],
    flat: true,
  });
  b.spike([0.052, 0.256, -0.03], [0, -1, 0], 0.021, 0.003, { color: STEEL, bone: headBone });

  return b.root;
}
