```ts
import * as THREE from "three";
import { countershade, createBuilder, gradient, rng, scales, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description:
    "A nine-banded armadillo at rest: a banded domed shell over a pale belly, a ringed tapering tail, stubby clawed feet and a hinged lower jaw.",
};

const SHELL = "#a68b73";
const SHELL_DARK = "#6b5343";
const SHELL_LIGHT = "#c9ae97";
const BELLY = "#f1d8ca";
const EAR = "#dba293";
const CLAW = "#f4ebe0";
const NOSE = "#3a2a25";
const EYE = "#1c1512";
const GLINT = "#fbfaf6";
const TAIL = "#8d725f";
const TAIL_RING = "#5d4739";
const BUMP = "#cfb49e";

export default function armadillo() {
  const b = createBuilder({ name: "armadillo", detail: 1, paintSize: 1024 });

  // Paints: the shell is banded across the body and countershaded to a pale belly; the head is scaled; the tail is ringed.
  const bands = stripes(SHELL, SHELL_DARK, { size: 0.034, axis: "z", width: 0.2, wobble: 0.4, seed: 3 });
  const bodyPaint = countershade(bands, BELLY, { level: -0.15, soft: 0.22 });
  const headPaint = countershade(
    scales([SHELL_LIGHT, SHELL], SHELL_DARK, { size: 0.021, width: 0.14, seed: 5 }),
    BELLY,
    { level: -0.25, soft: 0.2 },
  );
  const tailPaint = stripes(TAIL, TAIL_RING, { size: 0.04, axis: "z", width: 0.5, wobble: 0.15, seed: 9 });
  const legPaint = gradient(SHELL, BELLY, [0, 0.1, 0], [0, 0.03, 0]);

  // Skeleton in a rest pose (metres, +Y up, faces +Z, left is +X): legs straight, head level, tail trailing.
  const hips = b.joint("hips", { at: [0, 0.155, -0.12], aim: [0, 0.165, 0.02] });
  const spine = b.chain("spine", [[0, 0.165, 0.02], [0, 0.175, 0.12], [0, 0.18, 0.2]], {
    parent: hips,
    names: ["spine1", "spine2", "neck"],
    role: "spine",
  });
  b.joint("head", { parent: "neck", at: [0, 0.18, 0.25], aim: [0, 0.165, 0.42], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.13, 0.28], aim: [0, 0.125, 0.42], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.16, -0.17],
      [0, 0.15, -0.25],
      [0, 0.135, -0.33],
      [0, 0.12, -0.41],
      [0, 0.105, -0.49],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Front leg: shoulder, elbow, paw, with four digging claws.
    b.chain(
      `fore${L}`,
      [
        [0.085 * s, 0.11, 0.12],
        [0.09 * s, 0.055, 0.125],
        [0.09 * s, 0.024, 0.135],
      ],
      { parent: "spine2", names: [`shoulderF${L}`, `elbowF${L}`, `pawF${L}`], role: "leg" },
    );
    const fore = b.chain(
      `foreLimb${L}`,
      [
        [0.085 * s, 0.11, 0.12],
        [0.09 * s, 0.055, 0.125],
        [0.09 * s, 0.024, 0.135],
      ],
      { parent: "spine2", names: [`shoulderF${L}`, `elbowF${L}`, `pawF${L}`], role: "leg" },
    );
    b.sweep(fore, [0.036, 0.026, 0.02], { color: legPaint, sides: 8, name: `foreLeg${L}` });
    b.part(new THREE.SphereGeometry(0.03, 10, 6), BELLY, {
      at: [0.09 * s, 0.016, 0.147],
      bone: `pawF${L}`,
      scale: [1.1, 0.5, 1.3],
      name: `pawF${L}`,
    });
    [-0.022, -0.008, 0.007, 0.021].forEach((dx, i) => {
      const at = [(0.09 + dx) * s, 0.012, 0.178];
      const name = `clawF${L}${i + 1}`;
      b.joint(name, { parent: `pawF${L}`, at, dir: [0, -0.3, 1], role: "digit" });
      b.spike(at, [0, -0.3, 1], 0.034, 0.0075, { color: CLAW, bone: name });
    });

    // Hind leg: a longer flat foot with four small claws.
    const hind = b.chain(
      `hindLimb${L}`,
      [
        [0.09 * s, 0.11, -0.1],
        [0.095 * s, 0.055, -0.095],
        [0.095 * s, 0.024, -0.08],
      ],
      { parent: "hips", names: [`hipH${L}`, `kneeH${L}`, `pawH${L}`], role: "leg" },
    );
    b.sweep(hind, [0.04, 0.028, 0.022], { color: legPaint, sides: 8, name: `hindLeg${L}` });
    b.part(new THREE.SphereGeometry(0.032, 10, 6), BELLY, {
      at: [0.095 * s, 0.015, -0.07],
      bone: `pawH${L}`,
      scale: [1.15, 0.45, 1.5],
      name: `pawH${L}`,
    });
    [-0.018, -0.006, 0.006, 0.018].forEach((dx, i) => {
      const at = [(0.095 + dx) * s, 0.01, -0.03];
      const name = `clawH${L}${i + 1}`;
      b.joint(name, { parent: `pawH${L}`, at, dir: [0, -0.25, 1], role: "digit" });
      b.spike(at, [0, -0.25, 1], 0.03, 0.006, { color: CLAW, bone: name });
    });

    // Ear, eye with a glint, on each side of the head.
    b.part(new THREE.SphereGeometry(0.034, 10, 8), EAR, {
      at: [0.062 * s, 0.228, 0.215],
      bone: "head",
      scale: [0.35, 1, 0.9],
    });
    b.part(new THREE.SphereGeometry(0.012, 10, 8), EYE, { at: [0.05 * s, 0.178, 0.305], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), GLINT, { at: [0.056 * s, 0.184, 0.314], bone: "head" });
  }

  // Nose at the tip of the snout.
  b.part(new THREE.SphereGeometry(0.014, 10, 8), NOSE, {
    at: [0, 0.152, 0.418],
    bone: "head",
    scale: [1.25, 0.8, 0.95],
  });

  // Head: a tapering shield with its own paint. The jaw is a separate piece hinged under the snout.
  b.loft(
    [
      { at: [0, 0.165, 0.15], w: 0.12, h: 0.12 },
      { at: [0, 0.17, 0.25], w: 0.13, h: 0.125 },
      { at: [0, 0.163, 0.33], w: 0.1, h: 0.095 },
      { at: [0, 0.155, 0.39], w: 0.065, h: 0.07 },
      { at: [0, 0.15, 0.42], w: 0.035, h: 0.045 },
    ],
    { color: headPaint, bone: "head", sides: 10, name: "head" },
  );
  b.loft(
    [
      { at: [0, 0.13, 0.27], w: 0.085, h: 0.05 },
      { at: [0, 0.125, 0.34], w: 0.07, h: 0.045 },
      { at: [0, 0.122, 0.4], w: 0.045, h: 0.04 },
    ],
    { color: BELLY, bone: "jaw", sides: 8, name: "jaw" },
  );

  // Body: one banded shell, blended across the hips, spine and neck.
  const shell = b.loft(
    [
      { at: [0, 0.15, -0.2], w: 0.11, h: 0.11 },
      { at: [0, 0.155, -0.09], w: 0.2, h: 0.145 },
      { at: [0, 0.155, 0.03], w: 0.22, h: 0.15 },
      { at: [0, 0.158, 0.13], w: 0.2, h: 0.14 },
      { at: [0, 0.175, 0.21], w: 0.13, h: 0.125 },
    ],
    { color: bodyPaint, bone: [hips, spine], sides: 12, name: "shell" },
  );

  // Ringed tail, tapering from the rump.
  b.sweep(tail, [0.044, 0.026, 0.01], { color: tailPaint, sides: 8, name: "tail" });

  // Osteoderm bumps: small domes on the shell top in staggered rows, each seated on the surface it lands on.
  const top = b.surface(shell);
  const jitter = rng(7);
  for (let row = 0; row < 8; row++) {
    const z = -0.16 + row * 0.045;
    for (let col = -2; col <= 2; col++) {
      const x = col * 0.04 + (row % 2 ? 0.02 : 0) + (jitter() - 0.5) * 0.008;
      const hit = top.ray([x, 1, z], [0, -1, 0]);
      if (hit) b.stick(new THREE.SphereGeometry(0.008, 6, 4), BUMP, hit, { embed: 0.5 });
    }
  }

  return b.root;
}
```