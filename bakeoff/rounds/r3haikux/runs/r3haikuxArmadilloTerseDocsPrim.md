```ts
import * as THREE from "three";
import { catmull, createBuilder, scales } from "agentic-3js-builder";

export const meta = {
  name: "armadillo",
  description:
    "A nine-banded armadillo in rest pose: a domed tan shell with movable bands over a cream belly, a pointed snout, a long tapering tail with bony rings, and long digging claws.",
};

// Palette
const SHELL = "#b58d66";
const SHELL_DEEP = "#7c5c46";
const SHELL_DARK = "#4a3528";
const CREAM = "#efe0c6";
const IVORY = "#f8f1e2";
const INK = "#221a17";
const NOSE = "#3b2b28";

// Surface paints: outlined plates give the armour its texture
const BODY = scales(SHELL_DEEP, SHELL_DARK, { size: 0.016, width: 0.0035, seed: 5 });
const BANDS = scales(SHELL, SHELL_DEEP, { size: 0.012, width: 0.003, seed: 9 });
const LEGS = scales(SHELL_DEEP, SHELL_DARK, { size: 0.01, width: 0.0025, seed: 11 });
const TAIL = scales(SHELL, SHELL_DEEP, { size: 0.012, width: 0.003, seed: 13 });

type Key = [number, number];

/** Piecewise-linear profile over t. */
function key(t: number, keys: Key[]): number {
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

// Body section: broad over the rump and middle, a little narrower at the shoulders.
const bodyRX = (t: number) => 0.11 - 0.016 * t + 0.012 * Math.sin(Math.PI * t);
const bodyRY = (t: number) => 0.07 - 0.01 * t + 0.007 * Math.sin(Math.PI * t);

// A movable band is the body plus a dome that dies out at its two edges.
function bandRadius(a: number, z: number) {
  return (t: number): [number, number] => {
    const u = Math.min(1, Math.max(0, (t - a) / (z - a)));
    const k = Math.sin(Math.PI * u);
    return [bodyRX(t) + 0.013 * k, bodyRY(t) + 0.01 * k];
  };
}

// Tail: thick at the base, tapering to a point.
const tailR = (t: number): [number, number] => [0.044 - 0.032 * t, 0.04 - 0.028 * t];

const FORE_LEG_R: Key[] = [
  [0, 0.034],
  [0.45, 0.024],
  [0.78, 0.02],
  [1, 0.019],
];
const HIND_LEG_R: Key[] = [
  [0, 0.04],
  [0.34, 0.026],
  [0.68, 0.02],
  [1, 0.017],
];

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.14, -0.12], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.14, -0.1],
      [0, 0.14, -0.02],
      [0, 0.145, 0.06],
      [0, 0.152, 0.13],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  // Neck, head and snout run as one chain; the head and snout are its inner and tip joints.
  const neckPath = catmull([
    [0, 0.152, 0.13],
    [0, 0.158, 0.2],
    [0, 0.152, 0.28],
    [0, 0.128, 0.41],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "head", "snout"],
    role: "neck",
  });
  const head = neck.joints[2];
  const snout = neck.joints[3];
  const tHead = neckPath.closestT([0, 0.152, 0.28]);

  // Lower jaw hangs from its own joint so the mouth can open.
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.112, 0.31],
    aim: [0, 0.106, 0.4],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.14, -0.14],
      [0, 0.136, -0.25],
      [0, 0.125, -0.35],
      [0, 0.11, -0.44],
      [0, 0.1, -0.52],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // ---- body: one domed shell, dark plates on the back, cream belly ----
  b.sweep(spine, (t) => [bodyRX(t), bodyRY(t)], {
    sides: 12,
    color: CREAM,
    sectors: [[-118, 118, BODY]],
  });

  // Seven movable bands between the shoulder and pelvic shields.
  for (let i = 0; i < 7; i++) {
    const a = 0.27 + i * 0.075;
    const z = a + 0.062;
    b.sweep(spine, bandRadius(a, z), {
      from: a,
      to: z,
      sides: 12,
      caps: "none",
      color: CREAM,
      sectors: [[-118, 118, BANDS]],
    });
  }

  // ---- neck, head and snout: dark shield on top, pale underside, tapering to the nose ----
  const neckR = (t: number): [number, number] => [
    key(t, [
      [0, 0.088],
      [tHead, 0.06],
      [1, 0.016],
    ]),
    key(t, [
      [0, 0.07],
      [tHead, 0.062],
      [1, 0.017],
    ]),
  ];
  b.sweep(neck, neckR, {
    sides: 12,
    color: CREAM,
    sectors: [[-118, 118, BODY]],
  });

  // Lower jaw, a separate piece riding the jaw joint.
  b.capsule([0, 0.112, 0.31], [0, 0.106, 0.395], [0.014, 0.009], { color: CREAM, bone: jaw });

  // Dark nose cap.
  b.part(new THREE.SphereGeometry(0.018, 8, 6), NOSE, {
    at: [0, 0.127, 0.418],
    bone: snout,
    flat: true,
  });

  for (const s of [1, -1]) {
    // Ears: small flat plates standing up off the skull, drawn in the side plane.
    b.extrude(
      [
        [-0.022, -0.012],
        [0.022, -0.012],
        [0.027, 0.01],
        [0.013, 0.032, "sharp"],
        [-0.006, 0.035],
        [-0.024, 0.02],
      ],
      {
        at: [0.05 * s, 0.2, 0.27],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 2,
        color: SHELL_DEEP,
        bone: head,
      },
    );

    // Small dark eye with a glint.
    b.part(new THREE.SphereGeometry(0.011, 8, 6), INK, {
      at: [0.054 * s, 0.17, 0.3],
      bone: head,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0034, 6, 4), IVORY, {
      at: [0.06 * s, 0.177, 0.308],
      bone: head,
    });
  }

  // ---- legs: short and stout, with long ivory digging claws up front ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Fore leg: shoulder, elbow, wrist and paw tip.
    const fore = b.chain(
      `foreLeg${side}`,
      catmull([
        [0.085 * s, 0.135, 0.09],
        [0.095 * s, 0.075, 0.095],
        [0.1 * s, 0.03, 0.11],
        [0.1 * s, 0.02, 0.14],
      ]),
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
        role: "leg",
      },
    );
    b.sweep(fore, (t) => key(t, FORE_LEG_R), { sides: 10, color: LEGS });

    const paw = fore.joints[3];
    for (const x of [-0.013, -0.0045, 0.0045, 0.013]) {
      b.spike([0.1 * s + x, 0.016, 0.146], [0, -0.35, 1], 0.03, 0.0065, {
        color: IVORY,
        bone: paw,
      });
    }

    // Hind leg: hip, knee, hock and toe tip.
    const hind = b.chain(
      `hindLeg${side}`,
      catmull([
        [0.085 * s, 0.14, -0.08],
        [0.1 * s, 0.085, -0.04],
        [0.1 * s, 0.035, -0.1],
        [0.1 * s, 0.017, -0.03],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
      },
    );
    b.sweep(hind, (t) => key(t, HIND_LEG_R), { sides: 10, color: LEGS });

    const foot = hind.joints[3];
    for (const x of [-0.012, -0.006, 0, 0.006, 0.012]) {
      b.spike([0.1 * s + x, 0.012, -0.024], [0, -0.22, 1], 0.016, 0.0045, {
        color: IVORY,
        bone: foot,
      });
    }
  }

  // ---- tail: shelled, with bony rings along it ----
  b.sweep(tail, tailR, { sides: 10, color: TAIL });
  b.along(
    tail,
    9,
    (p) => {
      const r = tailR(p.t)[0] * 1.2;
      b.part(new THREE.CylinderGeometry(r, r, 0.012, 10), SHELL_DARK, {
        frame: p,
        flat: true,
      });
    },
    { from: 0.1, to: 0.9 },
  );

  return b.root;
}
```