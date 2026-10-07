```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  mottle,
  gradient,
  paint,
  mix,
  smoothstep,
  svg,
  frame,
} from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox: sandy mottled coat with a pale belly, huge splayed ears with pink fur-tufted insides, big dark eyes, a split jaw, and a bushy black-tipped tail. Rigged in a neutral standing rest pose.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "fennecFox", detail: 1 });

  // ---------- palette ----------
  const SAND = "#e3b47a";
  const SAND2 = "#d39b5f";
  const DORSAL = "#c4874d";
  const CREAM = "#f6e7cf";
  const WHITE = "#fbf6ee";
  const DARK = "#2a1c14";
  const EYE = "#120c0a";
  const BROWN = "#5a3a22";

  const coat = mottle(SAND, SAND2, { size: 0.06, seed: 3, contrast: 1.2 });
  const shaded = countershade(coat, CREAM, { level: -0.2, soft: 0.25 });
  const bodyPaint = paint((p, n) => mix(shaded.at(p, n), DORSAL, smoothstep(0.72, 0.97, n.y) * 0.55));
  const headPaint = countershade(coat, WHITE, { level: -0.1, soft: 0.3 });
  const legPaint = gradient(SAND, CREAM, [0, 0.17, 0], [0, 0.03, 0]);
  const tailCoat = mottle(SAND, "#cf9254", { size: 0.05, seed: 8 });
  const tailPaint = paint((p, n, s) => {
    // the dark violet-gland spot on top of the tail near its base
    if (s[0] > 0.1 && s[0] < 0.2 && (s[1] < 28 || s[1] > 332)) return "#6b4a30";
    return mix(tailCoat.at(p, n), DORSAL, smoothstep(0.6, 0.95, n.y) * 0.4);
  });

  const tuft = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><g stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M16 64 C14 42 10 22 5 4"/><path d="M16 64 C16 42 16 22 17 2"/><path d="M16 64 C18 42 23 24 28 6"/><path d="M16 64 C13 46 12 34 11 20"/><path d="M16 64 C19 46 21 36 22 22"/></g></svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.2, -0.1], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, -0.1],
      [0, 0.208, 0.0],
      [0, 0.215, 0.09],
    ],
    { parent: "hips", names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.215, 0.09],
      [0, 0.268, 0.135],
    ],
    { parent: "spine2", names: ["neck"], role: "neck" },
  );
  b.joint("head", { parent: "neck", at: [0, 0.29, 0.15], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.272, 0.178], dir: [0, -0.15, 1], role: "jaw" });

  const legs: Array<{ chain: ReturnType<typeof b.chain>; s: string; side: number; front: boolean }> = [];
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const front = b.chain(
      `legF${s}`,
      [
        [0.045 * side, 0.19, 0.08],
        [0.048 * side, 0.12, 0.06],
        [0.048 * side, 0.03, 0.075],
        [0.048 * side, 0.006, 0.1],
      ],
      { parent: "spine2", names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `paw${s}`], role: "leg" },
    );
    const hind = b.chain(
      `legH${s}`,
      [
        [0.05 * side, 0.19, -0.12],
        [0.055 * side, 0.12, -0.07],
        [0.052 * side, 0.035, -0.145],
        [0.052 * side, 0.006, -0.097],
      ],
      { parent: "hips", names: [`hip${s}`, `knee${s}`, `hock${s}`, `foot${s}`], role: "leg" },
    );
    legs.push({ chain: front, s, side, front: true }, { chain: hind, s, side, front: false });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.195, -0.16],
      [0, 0.175, -0.25],
      [0, 0.14, -0.33],
      [0, 0.115, -0.41],
    ]),
    { parent: "hips", count: 4, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.2, -0.175], w: 0.085, h: 0.085 },
      { at: [0, 0.205, -0.09], w: 0.11, h: 0.11 },
      { at: [0, 0.21, 0.01], w: 0.098, h: 0.108 },
      { at: [0, 0.215, 0.095], w: 0.1, h: 0.112 },
      { at: [0, 0.225, 0.14], w: 0.07, h: 0.08 },
    ],
    { color: bodyPaint, bone: ["hips", spine], sides: 10, name: "body" },
  );
  b.capsule([0, 0.215, 0.1], [0, 0.285, 0.15], [0.042, 0.032], {
    color: bodyPaint,
    bone: [neck, "head"],
    sides: 9,
    name: "neckFur",
  });
  // chest bib
  b.part(new THREE.SphereGeometry(0.04, 9, 7), WHITE, {
    bone: "spine2",
    at: [0, 0.19, 0.12],
    scale: [0.85, 1.1, 0.75],
    name: "chestBib",
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.05, 10, 8), headPaint, {
    bone: "head",
    at: [0, 0.29, 0.15],
    scale: [1.05, 0.9, 1],
    name: "skull",
  });
  b.part(new THREE.CylinderGeometry(0.009, 0.026, 0.07, 8), WHITE, {
    bone: "head",
    at: [0, 0.278, 0.215],
    dir: [0, -0.12, 1],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.008, 7, 5), DARK, {
    bone: "head",
    at: [0, 0.277, 0.248],
    scale: [1.25, 0.9, 1],
    name: "nose",
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.017, 0.055, 7), CREAM, {
    bone: "jaw",
    at: [0, 0.262, 0.21],
    dir: [0, -0.18, 1],
    name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.014, 0.003, 0.03), "#c9726d", {
    bone: "jaw",
    at: [0, 0.266, 0.215],
    dir: [0, -0.18, 1],
    axis: "z",
    name: "tongue",
  });

  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    // eyes
    b.part(new THREE.SphereGeometry(0.016, 8, 6), "#3a2618", {
      bone: "head",
      at: [0.026 * side, 0.298, 0.182],
      name: `eyeRim${s}`,
    });
    b.part(new THREE.SphereGeometry(0.0135, 9, 7), EYE, {
      bone: "head",
      at: [0.026 * side, 0.298, 0.187],
      name: `eye${s}`,
    });
    b.part(new THREE.SphereGeometry(0.0036, 5, 4), "#ffffff", {
      bone: "head",
      at: [0.022 * side, 0.305, 0.199],
      name: `eyeGlint${s}`,
    });
    // dark tear stripe down to the muzzle
    b.capsule([0.022 * side, 0.29, 0.195], [0.013 * side, 0.282, 0.214], 0.0028, {
      color: BROWN,
      bone: "head",
      sides: 5,
      name: `tearMark${s}`,
    });
    // cheek fluff
    b.part(new THREE.SphereGeometry(0.022, 8, 6), WHITE, {
      bone: "head",
      at: [0.034 * side, 0.268, 0.168],
      scale: [1, 0.8, 1.1],
      name: `cheek${s}`,
    });
    b.cards(
      [0, 1, 2].map((k) =>
        frame([0.05 * side, 0.27 - k * 0.008, 0.162 - k * 0.006], [side, -0.25 - k * 0.15, -0.35]),
      ),
      tuft,
      { size: [0.022, 0.03], lean: 20, color: WHITE, bone: "head", spin: 15, rng: undefined, name: `cheekTufts${s}` },
    );
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod(
        [0.012 * side, 0.272 + k * 0.003, 0.232],
        [0.065 * side, 0.262 + k * 0.012, 0.225 - k * 0.012],
        0.0007,
        { color: "#2b211b", sides: 3, bone: "head", name: `whisker${s}${k + 1}` },
      );
    }

    // ---------- ears ----------
    const base = V(0.028 * side, 0.315, 0.138);
    const a = V(0.42 * side, 1, -0.12).normalize();
    const x = V(a.y, -a.x, 0).normalize();
    const n = x.clone().cross(a).normalize();
    const tip = base.clone().addScaledVector(a, 0.148);
    b.joint(`ear${s}`, { parent: "head", at: base, dir: a });
    b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0.032, 0.05],
        [0.018, 0.11],
        [0, 0.148, "sharp"],
        [-0.018, 0.11],
        [-0.032, 0.05],
      ],
      {
        color: gradient(SAND, "#c08750", base, tip),
        at: base,
        x,
        y: a,
        thickness: 0.01,
        bevel: 0.003,
        smoothing: 1,
        bone: `ear${s}`,
        name: `ear${s}`,
      },
    );
    b.extrude(
      [
        [-0.024, 0.008],
        [0.024, 0.008],
        [0.021, 0.05],
        [0.011, 0.1],
        [0, 0.126, "sharp"],
        [-0.011, 0.1],
        [-0.021, 0.05],
      ],
      {
        color: gradient("#e8a597", "#f7e4d4", base, tip),
        at: base.clone().addScaledVector(n, 0.0055),
        x,
        y: a,
        thickness: 0.003,
        smoothing: 1,
        bone: `ear${s}`,
        name: `earInner${s}`,
      },
    );
    const tufts = [
      [-0.012, 0.012],
      [0.0, 0.01],
      [0.012, 0.012],
      [-0.008, 0.03],
      [0.008, 0.03],
      [0.0, 0.045],
      [-0.006, 0.06],
      [0.006, 0.06],
    ].map(([u, v]) =>
      frame(
        base.clone().addScaledVector(x, u).addScaledVector(a, v).addScaledVector(n, 0.007),
        n,
      ),
    );
    b.cards(tufts, tuft, {
      size: [0.018, 0.034],
      lean: 65,
      flow: [a.x, a.y, a.z],
      color: "#fffaf3",
      bone: `ear${s}`,
      vary: 0.2,
      spin: 12,
      name: `earTufts${s}`,
    });
  }

  // ---------- legs ----------
  for (const { chain, s, side, front } of legs) {
    b.sweep(chain, [0.018, 0.0095], { color: legPaint, sides: 7, name: `${front ? "foreleg" : "hindleg"}${s}` });
    const pz = front ? 0.095 : -0.1;
    b.part(new THREE.SphereGeometry(0.018, 8, 6), CREAM, {
      bone: front ? `wrist${s}` : `hock${s}`,
      at: [0.048 * side + (front ? 0 : 0.004 * side), 0.011, pz],
      scale: [1, 0.6, 1.4],
      name: `pawPad${s}${front ? "F" : "H"}`,
    });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.ConeGeometry(0.0028, 0.008, 4), "#3b2a20", {
        bone: front ? `wrist${s}` : `hock${s}`,
        at: [(front ? 0.048 : 0.052) * side + k * 0.007, 0.005, pz + 0.024],
        dir: [0, -0.3, 1],
        name: `claw${s}${front ? "F" : "H"}${k + 2}`,
      });
    }
    if (front) {
      b.part(new THREE.SphereGeometry(0.032, 9, 7), bodyPaint, {
        bone: `shoulder${s}`,
        at: [0.04 * side, 0.172, 0.075],
        scale: [0.7, 1.2, 1],
        name: `shoulderMass${s}`,
      });
    } else {
      b.part(new THREE.SphereGeometry(0.042, 10, 8), bodyPaint, {
        bone: `hip${s}`,
        at: [0.042 * side, 0.165, -0.115],
        scale: [0.75, 1.1, 1.15],
        name: `thigh${s}`,
      });
    }
  }

  // ---------- tail ----------
  b.sweep(tail, (t) => 0.017 + 0.03 * Math.sin(Math.min(t, 1) * Math.PI * 0.75), {
    bands: [
      [0.82, tailPaint],
      [1, DARK],
    ],
    sides: 9,
    name: "tail",
  });

  return b.root;
}
```