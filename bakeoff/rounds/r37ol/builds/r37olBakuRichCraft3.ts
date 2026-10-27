import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  paint,
  spots,
  countershade,
  svg,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "baku",
  description: "A stylized ukiyo-e woodblock baku, the dream-eating tapir spirit, with indigo fur, cream mask, curling trunk, broad ears, talisman markings, and drifting dream wisps.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1, paintSize: 1024 });

  const INK = "#24182a";
  const NIGHT = "#17243b";
  const INDIGO = "#344c70";
  const BLUE = "#587596";
  const CREAM = "#e8d7aa";
  const OCHRE = "#b88745";
  const RED = "#9d3e39";
  const GOLD = "#d8ae57";
  const PALE = "#f6eac5";
  const DREAM = "#8ba9c4";

  const fur = countershade(
    spots(INDIGO, [BLUE, "#263a5b"], { size: 0.18, amount: 0.25, rosette: true, seed: 8 }),
    "#202b45",
    { level: -0.18, soft: 0.28 },
  );
  const mask = paint((p, n) => {
    const across = Math.abs(p.x);
    const forward = p.z;
    if (forward > 0.82 || (forward > 0.58 && across < 0.3)) return n.y > -0.25 ? CREAM : "#c9b788";
    return fur;
  });
  const belly = countershade(CREAM, "#b9a279", { level: -0.2, soft: 0.3 });

  // One readable root, with recognizable rig roles.
  const hips = b.joint("hips", { at: [0, 0.82, -0.12], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, -0.58],
      [0, 0.9, -0.25],
      [0, 0.96, 0.18],
      [0, 1.02, 0.46],
    ]),
    { parent: hips, names: ["pelvis", "back", "shoulder"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.02, 0.42],
      [0, 1.08, 0.62],
      [0, 1.18, 0.76],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.2, 0.78], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.12, 0.82], dir: [0, -0.12, 1], role: "jaw" });

  const body = b.sweep(spine, (t) => 0.31 - 0.035 * t, {
    bone: spine,
    color: fur,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "broadWoodblockBody",
  });
  b.sweep(neck, [0.24, 0.18], {
    bone: neck,
    color: fur,
    section: { ngon: 8 },
    name: "neck",
  });

  // Cream belly apron, deliberately graphic like a printed color block.
  b.sweep(
    catmull([
      [-0.01, 0.74, -0.3],
      [-0.01, 0.76, 0.02],
      [-0.01, 0.82, 0.34],
    ]),
    [0.19, 0.14],
    { bone: spine.joints[0], color: belly, section: { ngon: 6 }, name: "creamBelly" },
  );

  // Head and long tapir nose.
  const skull = b.part(new THREE.SphereGeometry(0.29, 12, 8), mask, {
    bone: head,
    at: [0, 1.27, 0.82],
    scale: [1.0, 0.92, 1.05],
    flat: true,
    name: "paintedMaskHead",
  });
  const muzzle = b.sweep(
    bezier([0, 1.23, 0.92], [0, 1.19, 1.13], [0, 1.14, 1.34], [0, 1.1, 1.46]),
    [0.17, 0.075],
    { bone: jaw, color: mask, section: { ngon: 7 }, caps: "round", name: "dreamSnout" },
  );
  b.part(new THREE.SphereGeometry(0.095, 8, 6), INK, {
    bone: jaw,
    at: [0, 1.105, 1.485],
    flat: true,
    name: "softNose",
  });

  // Mouth opening, lower jaw and a few carved-looking teeth.
  b.sweep(
    catmull([
      [-0.12, 1.09, 1.36],
      [0, 1.055, 1.43],
      [0.12, 1.09, 1.36],
    ]),
    0.012,
    { bone: jaw, color: INK, caps: "round", name: "mouthInk" },
  );
  for (const x of [-0.07, 0.07]) {
    b.part(new THREE.ConeGeometry(0.018, 0.045, 5), PALE, {
      bone: jaw,
      at: [x, 1.085, 1.39],
      dir: [0, -1, 0],
      name: "littleTooth",
    });
  }

  // Eyes: large glossy black almond-like discs with warm gold glints.
  const eyeTex = svg(
    `<svg viewBox="0 0 80 100"><path d="M5 52 Q40 10 75 52 Q40 90 5 52Z" fill="#24182a"/>
      <ellipse cx="42" cy="52" rx="18" ry="26" fill="#b88745"/>
      <ellipse cx="42" cy="53" rx="8" ry="20" fill="#24182a"/>
      <circle cx="35" cy="37" r="6" fill="#fff4cf"/><circle cx="49" cy="66" r="3" fill="#fff4cf"/>
      <path d="M8 45 Q38 5 73 42" fill="none" stroke="#17243b" stroke-width="5"/></svg>`,
    { size: 256 },
  );
  for (const s of [-1, 1]) {
    const eyeAt = [s * 0.145, 1.31, 1.04] as [number, number, number];
    b.decal(skull, eyeTex, {
      at: eyeAt,
      dir: [0, 0.12, 1],
      up: [0, 1, 0],
      size: [0.13, 0.16],
      mirror: s > 0,
      lift: 0.006,
      name: "dreamEye",
    });
  }

  // Tall rounded ears, two-layer woodblock silhouettes.
  const ear = [
    [0.0, 0.0],
    [0.11, 0.015],
    [0.15, 0.16],
    [0.11, 0.34],
    [0.0, 0.43],
    [-0.1, 0.34],
    [-0.13, 0.15],
  ] as [number, number][];
  for (const s of [-1, 1]) {
    b.extrude(ear, {
      at: [s * 0.19, 1.42, 0.77],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      smoothing: 1,
      bone: head,
      color: INK,
      name: "inkEar",
    });
    b.extrude(
      [
        [0.0, 0.035],
        [0.065, 0.05],
        [0.085, 0.16],
        [0.055, 0.29],
        [0.0, 0.34],
        [-0.055, 0.27],
        [-0.07, 0.13],
      ] as [number, number][],
      {
        at: [s * 0.19, 1.43, 0.765],
        x: [s, 0, 0],
        thickness: 0.05,
        bone: head,
        color: OCHRE,
        name: "ochreEarInner",
      },
    );
  }

  // Four sturdy legs, slightly splayed in a calm spirit-animal stance.
  const legData = [
    ["legFL", 0.2, 0.22, 0.2],
    ["legFR", -0.2, 0.22, 0.2],
    ["legBL", 0.21, -0.38, -0.2],
    ["legBR", -0.21, -0.38, -0.2],
  ] as const;
  for (const [name, x, z, footZ] of legData) {
    const points = catmull([
      [x, 0.78, z],
      [x * 1.06, 0.47, z + 0.015],
      [x * 1.02, 0.18, footZ],
    ]);
    const leg = b.chain(name, points, {
      parent: hips,
      names: [`${name}Hip`, `${name}Knee`, `${name}Foot`],
      role: "leg",
      contact: [x * 1.02, 0, footZ],
    });
    b.sweep(leg, [0.105, 0.075], {
      bone: leg,
      color: fur,
      section: { ngon: 6 },
      caps: "round",
      name: `${name}PaintedLeg`,
    });
    b.part(new THREE.BoxGeometry(0.16, 0.08, 0.22), INK, {
      bone: leg.tip,
      at: [x * 1.02, 0.08, footZ + 0.015],
      flat: true,
      name: `${name}InkHoof`,
    });
  }

  // Short tail with a carved tassel.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.62],
      [0, 0.88, -0.85],
      [0.02, 0.82, -1.02],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.095, 0.025], {
    bone: tail,
    color: fur,
    section: { ngon: 7 },
    caps: "point",
    name: "taperedTail",
  });
  b.sweep(
    bezier([0, 0.82, -1.0], [0.03, 0.74, -1.08], [-0.03, 0.68, -1.09], [0, 0.63, -1.04]),
    [0.035, 0.006],
    { bone: tail.tip, color: OCHRE, caps: "point", name: "tailTassel" },
  );

  // Ink-blue dorsal mane, broad and graphic rather than furry.
  const mane = [
    [0, 0],
    [0.14, 0.12],
    [0.1, 0.27],
    [0.18, 0.42],
    [0.08, 0.58],
    [0.14, 0.76],
    [0.0, 0.86],
    [-0.12, 0.68],
    [-0.08, 0.4],
    [-0.14, 0.18],
  ] as [number, number][];
  b.extrude(mane, {
    at: [-0.012, 0.93, -0.48],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.025,
    bevel: 0.008,
    smoothing: 1,
    bone: spine.joints[0],
    color: INK,
    name: "silhouetteMane",
  });

  // Printed talisman sash around the shoulders.
  const sashTex = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#9d3e39"/>
      <path d="M0 16h128M16 0v32M48 0v32M80 0v32M112 0v32" stroke="#e8d7aa" stroke-width="3"/>
      <path d="M8 8l8 8-8 8M40 8l8 8-8 8M72 8l8 8-8 8M104 8l8 8-8 8" fill="none" stroke="#24182a" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const strap = b.sweep(
    catmull([
      [0.27, 1.16, 0.3],
      [0.18, 1.08, 0.48],
      [0, 1.04, 0.57],
      [-0.18, 1.08, 0.48],
      [-0.27, 1.16, 0.3],
    ]),
    0.026,
    { bone: spine.tip, color: RED, caps: "round", name: "ceremonialSash" },
  );
  b.cards(
    [
      b.surface(strap).nearest([0.14, 1.08, 0.48]),
      b.surface(strap).nearest([-0.14, 1.08, 0.48]),
    ],
    sashTex,
    { size: [0.13, 0.19], lean: 82, flow: [0, 0, -1], color: PALE, name: "talismanTags" },
  );

  // Small dream clouds rising from the mouth: the creature is visibly eating nightmares.
  const cloudTex = svg(
    `<svg viewBox="0 0 100 100"><path d="M13 72 Q8 48 30 45 Q30 18 54 28 Q74 10 84 35 Q102 39 90 61 Q96 82 70 78 L31 82Z" fill="#8ba9c4" opacity=".9"/>
      <path d="M24 62 Q43 48 62 61 Q72 68 85 57" fill="none" stroke="#e8d7aa" stroke-width="5"/></svg>`,
    { size: 192 },
  );
  b.cards(
    [
      { at: [0.13, 1.34, 1.5], axis: [0.08, 0.82, 0.18] },
      { at: [-0.02, 1.52, 1.53], axis: [-0.12, 0.7, 0.25] },
      { at: [0.08, 1.72, 1.48], axis: [0.16, 0.58, 0.2] },
    ],
    cloudTex,
    { size: [0.2, 0.24], lean: 12, flow: [0, 0, 1], vary: 0.25, rng: rng(44), name: "dreamWisps" },
  );

  // A few gold seal studs emphasize the print's limited palette.
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), GOLD, {
      bone: spine.tip,
      at: [s * 0.2, 1.1, 0.49],
      dir: [0, 0, 1],
      name: "sashSeal",
    });
  }

  return b.root;
}
