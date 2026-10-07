import * as THREE from "three";
import { createBuilder, catmull, countershade, scales, slab, spots } from "../../../../src/index";

export const meta = {
  name: "Baby dragon beside its egg",
  description:
    "A house-cat-sized teal baby dragon sitting beside its broken speckled egg, with orange back spines, stubby horns, amber wing membranes, a spade-tipped tail and a wisp of smoke.",
};

const b = createBuilder({ name: "baby-dragon", detail: 1, paintSize: 1024 });

// Palette
const TEAL = ["#2aa198", "#23877f", "#34b3a6"];
const DEEP = "#1b5f5b";
const BELLY = "#f3dc8e";
const AMBER = "#e9a13b";
const ORANGE = "#f28c28";
const CREAM = "#fbf3d5";
const SMOKE = "#ebe7dc";

const hide = countershade(
  scales(TEAL, DEEP, { size: 0.035, width: 0.14, seed: 3 }),
  BELLY,
  { level: -0.05, soft: 0.45 },
);

// Skeleton: spine (waist is the root), neck, head, jaw, tail, legs, arms, wings
const spine = b.chain("spine", catmull([[0, 0.12, 0], [0, 0.2, 0.04], [0, 0.28, 0.1]]), {
  role: "spine",
  names: ["waist", "chest"],
});

b.chain("neck", catmull([[0, 0.28, 0.1], [0, 0.355, 0.16], [0, 0.41, 0.2]]), {
  parent: "chest",
  role: "neck",
  names: ["neck1", "neck2"],
});

b.joint("head", { parent: "neck2", at: [0, 0.445, 0.225], aim: [0, 0.5, 0.3], role: "head" });
const jaw = b.joint("jaw", { parent: "head", at: [0, 0.39, 0.19], dir: [0, 0, 1], role: "jaw" });

const tail = b.chain("tail", catmull([[0, 0.13, -0.02], [0, 0.1, -0.14], [0, 0.12, -0.27], [0, 0.2, -0.34]]), {
  parent: "waist",
  role: "tail",
  names: ["tail1", "tail2", "tail3"],
});

// Body: one smooth loft bending along the spine
const body = b.loft(
  [
    { at: [0, 0.12, -0.03], w: 0.2, h: 0.16 },
    { at: [0, 0.2, 0.0], w: 0.25, h: 0.22 },
    { at: [0, 0.28, 0.08], w: 0.22, h: 0.2 },
    { at: [0, 0.35, 0.16], w: 0.13, h: 0.13 },
    { at: [0, 0.4, 0.2], w: 0.11, h: 0.11 },
  ],
  { name: "body", color: hide, bone: spine, sides: 10 },
);
const bodySkin = b.surface(body);

// Tail: chubby, tapering, ending in a spade
b.sweep(tail, [0.05, 0.04, 0.026, 0.018], { color: hide, name: "tail", sides: 10 });
b.slab(
  [
    [0, 0.2, -0.33],
    [0, 0.235, -0.36],
    [0, 0.23, -0.395],
    [0, 0.2, -0.42],
    [0, 0.17, -0.395],
    [0, 0.165, -0.36],
  ],
  { color: "#1f6f6a", thickness: 0.018, bone: "tail3", name: "spade" },
);

// Head: a sphere with a longer snout, shaped by the scale
const headPart = b.part(new THREE.SphereGeometry(0.07, b.segments(14), b.segments(10)), hide, {
  bone: "head",
  at: [0, 0.445, 0.225],
  scale: [1, 0.9, 1.1],
});
const headSkin = b.surface(headPart);

// Lower jaw (rigid on the jaw joint), with cream teeth on both jaws
b.part(new THREE.BoxGeometry(0.06, 0.02, 0.1), BELLY, { bone: "jaw", at: [0, 0.385, 0.245] });
for (const x of [-0.025, 0, 0.025]) {
  b.spike([x, 0.395, 0.26], [0, 1, 0.35], 0.016, 0.006, { bone: "jaw", color: CREAM, name: "tooth" });
}
for (const x of [-0.03, -0.01, 0.01, 0.03]) {
  const hit = headSkin.nearest([x, 0.39, 0.28]);
  b.spike(hit, [0, -0.6, 1], 0.016, 0.006, { color: CREAM, name: "tooth" });
}
b.pose("jaw", { axis: [1, 0, 0], deg: 10 });

// Big amber eyes, seated on the head with a dark pupil in front
const eyeGeo = new THREE.SphereGeometry(0.026, b.segments(12), b.segments(8));
const pupilGeo = new THREE.SphereGeometry(0.012, b.segments(8), b.segments(6));
for (const s of [1, -1]) {
  const hit = headSkin.nearest([s * 0.05, 0.46, 0.28]);
  const eye = b.stick(eyeGeo, AMBER, hit, { embed: 0.35, bone: "head", name: s > 0 ? "eyeL" : "eyeR" });
  b.part(pupilGeo, "#120a06", {
    frame: eye,
    at: eye.at.clone().addScaledVector(eye.axis, 0.022),
    bone: "head",
    name: s > 0 ? "pupilL" : "pupilR",
  });
}

// Stubby horns on top of the head
for (const s of [1, -1]) {
  const base = headSkin.ray([s * 0.035, 0.7, 0.2], [0, -1, 0]);
  if (base) b.spike(base, [s * 0.25, 1, -0.5], 0.04, 0.012, { color: CREAM, name: "horn" });
}

// Orange spines down the back, seated on the body's real top surface
for (const z of [-0.09, -0.05, -0.01, 0.03, 0.07]) {
  const hit = bodySkin.ray([0, 0.8, z], [0, -1, 0]);
  if (hit) b.spike(hit, [0, 1, -0.35], 0.04, 0.011, { color: ORANGE, name: "spine" });
}

// Legs, feet and toes
for (const [s, S] of [
  [1, "L"],
  [-1, "R"],
] as const) {
  const p = (x: number, y: number, z: number): [number, number, number] => [s * x, y, z];

  const hind = b.chain(`hind${S}`, catmull([p(0.08, 0.13, -0.02), p(0.12, 0.06, 0.1), p(0.09, 0.03, 0.17)]), {
    parent: "waist",
    role: "leg",
    names: [`hip${S}`, `knee${S}`, `ankle${S}`],
  });
  b.sweep(hind, [0.05, 0.035, 0.024], { color: hide, sides: 10 });
  b.part(new THREE.SphereGeometry(0.04, b.segments(12), b.segments(8)), BELLY, {
    bone: `ankle${S}`,
    at: [s * 0.09, 0.022, 0.19],
    scale: [1, 0.5, 1.3],
  });
  for (const x of [-0.018, 0, 0.018]) {
    b.part(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), BELLY, {
      bone: `ankle${S}`,
      at: [s * 0.09 + x, 0.012, 0.225],
    });
  }

  const arm = b.chain(`arm${S}`, catmull([p(0.07, 0.27, 0.09), p(0.1, 0.16, 0.14), p(0.1, 0.04, 0.2)]), {
    parent: "chest",
    role: "arm",
    names: [`shoulder${S}`, `elbow${S}`, `paw${S}`],
  });
  b.sweep(arm, [0.026, 0.02, 0.017], { color: hide, sides: 8 });
  b.part(new THREE.SphereGeometry(0.022, b.segments(10), b.segments(8)), BELLY, {
    bone: `paw${S}`,
    at: [s * 0.1, 0.024, 0.225],
    scale: [1, 0.7, 1.1],
  });

  // Wing arm, its three fingers and the amber membrane between them
  const wing = b.chain(`wing${S}`, catmull([p(0.08, 0.31, 0.05), p(0.2, 0.38, 0.02), p(0.32, 0.36, -0.05)]), {
    parent: "chest",
    role: "wing",
    names: [`wing${S}1`, `wing${S}2`, `wrist${S}`],
  });
  b.sweep(wing, [0.02, 0.015, 0.011], { color: hide, sides: 8 });
  const wrist = wing.tip!;
  for (const tip of [
    [0.46, 0.4, 0.0],
    [0.42, 0.32, -0.12],
    [0.3, 0.26, -0.24],
  ] as const) {
    b.rod(wrist, p(tip[0], tip[1], tip[2]), [0.012, 0.005], { color: "#2b7f78", caps: "round", name: "finger" });
  }
  const outline = [
    [0.08, 0.31, 0.05],
    [0.2, 0.38, 0.02],
    [0.32, 0.36, -0.05],
    [0.46, 0.4, 0.0],
    [0.38, 0.33, -0.03],
    [0.42, 0.32, -0.12],
    [0.34, 0.3, -0.14],
    [0.3, 0.26, -0.24],
    [0.1, 0.22, -0.1],
  ].map(([x, y, z]) => p(x, y, z));
  slab(b.ctx.root.parent ? outline : outline, {
    color: AMBER,
    thickness: 0.008,
    bone: `wrist${S}`,
    name: `wingSkin${S}`,
  } as never);
}

// Wisp of smoke from one nostril
b.sweep(
  catmull([
    [0.02, 0.475, 0.305],
    [0.045, 0.5, 0.325],
    [0.03, 0.53, 0.345],
    [0.065, 0.565, 0.355],
  ]),
  (t: number) => 0.006 + 0.014 * t,
  { color: SMOKE, name: "smoke", sides: 8 },
);

// The broken speckled egg beside the dragon: a thin, jagged-topped shell spun from a profile
const RX = 0.068;
const RY = 0.09;
const CY = 0.075;
const eggProfile: number[][] = [];
const steps = 7;
const angle = (i: number) => (-90 + (i * 125) / steps) * (Math.PI / 180);
for (let i = 0; i <= steps; i++) eggProfile.push([RX * Math.cos(angle(i)), CY + RY * Math.sin(angle(i))]);
const rimOuter = eggProfile[eggProfile.length - 1];
const rimInner = [(RX - 0.005) * Math.cos(angle(steps)), CY + (RY - 0.005) * Math.sin(angle(steps))];
for (let k = 1; k <= 3; k++) {
  const f = k / 4;
  const x = rimOuter[0] + (rimInner[0] - rimOuter[0]) * f;
  const y = rimOuter[1] + (rimInner[1] - rimOuter[1]) * f;
  eggProfile.push([x, y + (k % 2 ? 0.012 : -0.008)]);
}
for (let i = steps; i >= 0; i--)
  eggProfile.push([(RX - 0.005) * Math.cos(angle(i)), CY + (RY - 0.005) * Math.sin(angle(i))]);

const eggPaint = spots("#f3ead2", [TEAL[0], DEEP], { size: 0.018, amount: 0.55, seed: 4 });
b.lathe(eggProfile, { color: eggPaint, at: [-0.25, 0.015, 0.0], axis: [0, 1, 0], segments: 12, name: "eggshell" });

// A loose shard of shell on the ground
b.slab(
  [
    [-0.1, 0.003, 0.12],
    [-0.075, 0.003, 0.135],
    [-0.09, 0.003, 0.16],
  ],
  { color: "#f3ead2", thickness: 0.006, name: "shard" },
);

export default function babyDragon() {
  return b.root;
}
