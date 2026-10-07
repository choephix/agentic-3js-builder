```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, offset, paint, spots } from "agentic-3js-builder";

export const meta = {
  name: "seahorse",
  description:
    "A stylised seahorse at rest: a box-section trunk ringed with armour plates, a horse-like head with a separate jaw and gold eyes, a coral coronet, fan fins, and a prehensile tail coiled on the floor.",
};

// Palette
const ORANGE = "#f28a3b";
const CREAM = "#ffe3b3";
const RED = "#b5402a";
const PLATE = "#d7692c";
const CORAL = "#ff5f6d";
const FIN = "#ffe7a6";
const RAY = "#ff8a3d";
const EYE = "#fff8ec";
const IRIS = "#ffb53d";
const PUPIL = "#21140f";
const SHINE = "#ffffff";

/** Smooth interpolation through values spread evenly over t in [0, 1]. */
function keyed(values: number[]) {
  return (t: number): number => {
    const f = Math.min(Math.max(t, 0), 1) * (values.length - 1);
    const i = Math.min(Math.floor(f), values.length - 2);
    const u = f - i;
    return values[i] + (values[i + 1] - values[i]) * u * u * (3 - 2 * u);
  };
}

const halfWidth = keyed([0.017, 0.025, 0.023, 0.016]); // trunk, sideways
const halfDepth = keyed([0.02, 0.028, 0.025, 0.017]); // trunk, back to belly
const tailRadius = keyed([0.0105, 0.0072, 0.0042]);

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // Skin: orange back with red spots, cream belly.
  const skin = countershade(spots(ORANGE, RED, { size: 0.03, amount: 0.4, seed: 4 }), CREAM, { level: 0 });
  // Fins: pale fan with orange rays radiating from each fin's root.
  const fan = paint((_p, _n, s) => (Math.abs(Math.sin(Math.atan2(s[1], s[0]) * 9)) < 0.3 ? RAY : FIN));

  // Tail: 1.2 turns of coil in the body's side plane, tip curled inside.
  // The coil's centre height is set so its lowest tube surface sits on y = 0.
  const CZ = 0.025;
  const CY = 0.0472;
  const coil: [number, number, number][] = [];
  for (let k = 0; k <= 14; k++) {
    const u = k / 14;
    const th = ((130 + 440 * u) * Math.PI) / 180;
    const r = 0.055 * Math.pow(0.02 / 0.055, u);
    coil.push([0, CY + r * Math.sin(th), CZ + r * Math.cos(th)]);
  }
  const pelvis = coil[0];

  // Skeleton
  const hips = b.joint("hips", { at: pelvis, role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([pelvis, [0, 0.126, 0.006], [0, 0.16, 0.026], [0, 0.186, 0.05]]),
    { parent: hips, count: 4, names: ["abdomen", "belly", "chest", "neck"], role: "spine" },
  );
  const tail = b.chain("tail", catmull(coil), { parent: hips, count: 16, role: "tail" });
  const head = b.joint("head", {
    parent: spine.joints[3],
    at: [0, 0.186, 0.05],
    aim: [0, 0.178, 0.166],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.19, 0.1], aim: [0, 0.172, 0.16], role: "jaw" });

  // Trunk: a box-section tube that follows the spine and bulges at the belly.
  b.sweep(spine, (t: number): [number, number] => [halfWidth(t), halfDepth(t)], {
    section: "box",
    color: skin,
    caps: { start: "flat", end: "flat" },
  });

  // Armour rings across the trunk, each with a small dorsal spine.
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + (0.82 * (i + 0.5)) / 9;
    const at = spine.at(t);
    const w = halfWidth(t) + 0.002;
    const d = halfDepth(t) + 0.002;
    b.part(new THREE.BoxGeometry(2 * w, 0.0055, 2 * d), PLATE, { frame: at });
    if (t > 0.3 && t < 0.52) continue; // the dorsal fan sits here
    b.spike(offset(at, at.normal, d), offset(at.normal, at.tangent, 0.35), 0.011, 0.0032, {
      color: CORAL,
      bone: at.bone,
    });
  }

  // Tail rings, then the tapering tail itself with a pale tip.
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + (0.86 * i) / 8;
    const r = tailRadius(t) * 1.04 + 0.0004;
    b.part(new THREE.CylinderGeometry(r, r, 0.0042, 8), PLATE, { frame: tail.at(t), flat: true });
  }
  b.sweep(tail, (t: number) => tailRadius(t), {
    color: skin,
    caps: { start: "round", end: "point" },
    bands: [
      [0.86, skin],
      [1, FIN],
    ],
  });

  // Head: a stretched cranium, a tubular snout, a separate lower jaw and a dark mouth.
  b.part(new THREE.SphereGeometry(1, 12, 8).scale(0.021, 0.022, 0.032), skin, {
    bone: head,
    at: [0, 0.206, 0.068],
    flat: true,
  });
  b.capsule([0, 0.2, 0.095], [0, 0.178, 0.166], [0.0175, 0.0085], { bone: head, color: skin });
  b.capsule([0, 0.19, 0.1], [0, 0.172, 0.16], [0.0105, 0.006], { bone: jaw, color: skin });
  b.part(new THREE.SphereGeometry(0.0035, 6, 4), PUPIL, { bone: head, at: [0, 0.1755, 0.1735] });

  // Coronet: a crown of coral spines over the skull.
  b.spike([0, 0.223, 0.062], [0, 0.85, -0.5], 0.036, 0.0075, { color: CORAL, bone: head });
  for (const s of [1, -1]) {
    b.spike([s * 0.011, 0.219, 0.06], [s * 0.45, 0.8, -0.45], 0.027, 0.0065, { color: CORAL, bone: head });
  }

  // Eyes: cream globes with gold irises, dark pupils and a glint.
  for (const s of [1, -1]) {
    const eye: [number, number, number] = [s * 0.0205, 0.212, 0.072];
    const gaze = (k: number): [number, number, number] => [eye[0] + s * 0.8 * k, eye[1], eye[2] + 0.6 * k];
    const pupil = gaze(0.0175);
    b.part(new THREE.SphereGeometry(0.0125, 10, 8), EYE, { bone: head, at: eye });
    b.part(new THREE.SphereGeometry(0.0082, 8, 6), IRIS, { bone: head, at: gaze(0.0105) });
    b.part(new THREE.SphereGeometry(0.0042, 6, 4), PUPIL, { bone: head, at: pupil });
    b.part(new THREE.SphereGeometry(0.0018, 5, 4), SHINE, {
      bone: head,
      at: [pupil[0] + s * 0.0026, pupil[1] + 0.0016, pupil[2] + 0.0019],
    });
  }

  // Dorsal fan: a flat sail in the body's side plane, rising from mid-back.
  b.extrude(
    [
      [0.012, -0.01],
      [0.006, 0.014],
      [-0.01, 0.026],
      [-0.026, 0.03, "sharp"],
      [-0.04, 0.02],
      [-0.046, 0.004],
      [-0.03, -0.01],
      [-0.008, -0.012],
    ],
    {
      at: [0, 0.128, -0.012],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.0045,
      bevel: 0.0015,
      smoothing: 1,
      color: fan,
      bone: spine.joints[1],
    },
  );

  // Pectoral fans, one lying against each flank.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.004, 0.01],
        [-0.01, 0.016],
        [-0.028, 0.012, "sharp"],
        [-0.034, -0.004],
        [-0.02, -0.012],
        [0, -0.006],
      ],
      {
        at: [s * 0.0265, 0.156, 0.022],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.0025,
        bevel: 0.0008,
        smoothing: 1,
        color: fan,
        bone: spine.joints[2],
      },
    );
  }

  return b.root;
}
```