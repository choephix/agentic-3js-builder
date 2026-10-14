import * as THREE from "three";
import { catmull, createBuilder, stripes } from "../../../../src/index";

export const meta = {
  name: "Desert scorpion",
  description: "Glossy amber desert scorpion with banded armour, raised pincers, eight legs, an arched segmented tail and a bulbous dark stinger.",
};

const AMBER = "#c27a2a";
const AMBER_LIGHT = "#dd9d46";
const DARK = "#4a2510";
const LEG = "#8e5a20";
const SHIELD = "#b8702a";
const STINGER = "#2b1408";
const EYE = "#050403";

export default function scorpion() {
  const b = createBuilder({ name: "desert-scorpion", detail: 1, paintSize: 1024 });

  // Body: a root joint, then a banded carapace lofted from head to rear.
  const body = b.joint("body", { at: [0, 0.03, 0], role: "spine" });
  const armour = stripes(AMBER, DARK, { size: 0.016, axis: "z", width: 0.22, wobble: 0.15, seed: 4 });
  b.loft(
    [
      { at: [0, 0.031, 0.074], w: 0.034, h: 0.026 },
      { at: [0, 0.033, 0.05], w: 0.07, h: 0.04 },
      { at: [0, 0.034, 0.02], w: 0.08, h: 0.044 },
      { at: [0, 0.032, -0.012], w: 0.072, h: 0.04 },
      { at: [0, 0.03, -0.04], w: 0.052, h: 0.032 },
    ],
    { name: "carapace", color: armour, bone: body },
  );

  // Head shield: a flattened dome carrying the eye cluster.
  const shield = b.part(new THREE.SphereGeometry(0.03, b.segments(14), b.segments(8)), SHIELD, {
    at: [0, 0.04, 0.07],
    bone: body,
    scale: [1, 0.45, 0.85],
    name: "shield",
  });
  const onShield = b.surface(shield);
  const eyes: [number, number, number][] = [
    [-0.012, 0.05, 0.086],
    [-0.006, 0.054, 0.09],
    [0, 0.055, 0.09],
    [0.006, 0.054, 0.09],
    [0.012, 0.05, 0.086],
    [-0.02, 0.046, 0.08],
    [0.02, 0.046, 0.08],
    [0, 0.052, 0.1],
  ];
  for (const p of eyes) {
    const eye = new THREE.SphereGeometry(0.0027, b.segments(6), b.segments(4));
    b.stick(eye, EYE, onShield.nearest(p), { embed: 0.35, name: "eye" });
  }

  // Eight walking legs, four per side, each a jointed chain ending on the floor.
  const hipZ = [0.05, 0.02, -0.008, -0.036];
  const lean = [0.03, 0.012, -0.012, -0.034];
  for (const [S, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    hipZ.forEach((z, i) => {
      const n = i + 1;
      const tip = z + lean[i];
      const leg = b.chain(
        `leg${S}${n}`,
        [
          [sx * 0.03, 0.032, z],
          [sx * 0.076, 0.056, z + lean[i] * 0.5],
          [sx * 0.1, 0.02, tip - 0.004],
          [sx * 0.114, 0.001, tip],
        ],
        {
          names: [`coxa${S}${n}`, `femur${S}${n}`, `tibia${S}${n}`, `tarsus${S}${n}`],
          parent: body,
          role: "leg",
        },
      );
      b.sweep(leg, (t: number) => 0.0028 - 0.0016 * t, { color: LEG, name: `leg${S}${n}` });
    });
  }

  // Segmented tail, arched high over the back with the stinger hooking forward.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.042, -0.04],
      [0, 0.07, -0.078],
      [0, 0.11, -0.088],
      [0, 0.138, -0.056],
      [0, 0.142, -0.006],
      [0, 0.118, 0.024],
    ]),
    {
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "stinger"],
      parent: body,
      role: "tail",
    },
  );
  const tailRadius = (t: number) => {
    const bulb = 0.0055 * Math.exp(-(((t - 0.9) / 0.075) ** 2));
    return 0.0082 - 0.0038 * t + bulb;
  };
  // Dark band just after every segment joint; the bulb is dark throughout.
  const tailColor = (t: number) => {
    if (t > 0.84) return STINGER;
    return (t * 5) % 1 < 0.14 ? DARK : AMBER;
  };
  b.sweep(tail, tailRadius, { color: tailColor, name: "tail" });
  b.spike(tail.at(0.965), [0, -0.35, 1], 0.014, 0.0026, {
    color: STINGER,
    bone: tail.joints[tail.joints.length - 1],
    name: "stinger",
  });

  // Pincers: a jointed arm per side ending in a chela with a fixed and a moving finger.
  for (const [S, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [sx * 0.018, 0.036, 0.064],
        [sx * 0.04, 0.042, 0.1],
        [sx * 0.034, 0.036, 0.13],
        [sx * 0.024, 0.03, 0.152],
      ]),
      {
        names: [`upperArm${S}`, `foreArm${S}`, `wrist${S}`, `hand${S}`],
        parent: body,
        role: "arm",
      },
    );
    const hand = arm.joints[arm.joints.length - 1];
    b.sweep(arm, (t: number) => 0.0052 - 0.0016 * t, { color: AMBER, name: `arm${S}` });

    b.part(new THREE.SphereGeometry(0.013, b.segments(12), b.segments(8)), AMBER_LIGHT, {
      at: [sx * 0.026, 0.03, 0.158],
      bone: hand,
      scale: [0.9, 0.75, 1.7],
      name: `chela${S}`,
    });
    b.rod([sx * 0.03, 0.03, 0.165], [sx * 0.018, 0.028, 0.205], [0.0042, 0.0014], {
      color: AMBER,
      bone: hand,
      name: `fixedFinger${S}`,
    });

    const finger = b.joint(`finger${S}`, {
      parent: hand,
      at: [sx * 0.03, 0.03, 0.165],
      aim: [sx * 0.05, 0.03, 0.205],
    });
    b.rod([sx * 0.03, 0.03, 0.165], [sx * 0.042, 0.029, 0.2], [0.0038, 0.0013], {
      color: AMBER,
      bone: finger,
      name: `movingFinger${S}`,
    });
  }

  return b.root;
}
