```ts
import * as THREE from "three";
import { createBuilder, catmull, grain, limb } from "agentic-3js-builder";

// Brass, iron and copper with a few dark accents. Amber eyes are the only glow.
const BRASS = grain("#e0b04e", "#9c6a22", { size: 0.04, axis: "z" });
const COPPER = "#b8643a";
const IRON = "#3d434d";
const DARK = "#1f2229";
const GEAR = "#c48a2c";
const EYE = "#ffb640";

export const meta = {
  name: "clockwork dog",
  description: "A brass-and-iron wind-up dog with a back key, a flank gear, a copper boiler and amber eyes.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork dog" });

  // ---- Spine: hips (root), back, chest --------------------------------------
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.3],
      [0, 0.52, -0.1],
      [0, 0.52, 0.05],
      [0, 0.54, 0.2],
    ]),
    { names: ["hips", "back", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const back = spine.joints[1];
  const chest = spine.joints[2];

  // ---- Torso --------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.24, 0.24, 0.5), BRASS, { bone: back, at: [0, 0.5, -0.1] });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.44), IRON, { bone: back, at: [0, 0.37, -0.1] });

  // Iron chest plate with brass rivets.
  b.part(new THREE.BoxGeometry(0.26, 0.26, 0.08), IRON, { bone: chest, at: [0, 0.5, 0.16] });
  for (const x of [-0.1, 0.1])
    for (const y of [0.4, 0.6])
      b.part(new THREE.SphereGeometry(0.012, 6, 4), BRASS, { bone: chest, at: [x, y, 0.21] });

  // Copper boiler on the back with a brass cap.
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10), COPPER, { bone: back, at: [0, 0.67, -0.22] });
  b.part(new THREE.SphereGeometry(0.05, 10, 6), COPPER, { bone: back, at: [0, 0.72, -0.22] });

  // Winding key on the back: a post and a turnable ring standing in the YZ plane.
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), IRON, { bone: back, at: [0, 0.68, -0.1] });
  b.part(new THREE.TorusGeometry(0.05, 0.012, 6, 12), BRASS, {
    bone: back,
    at: [0, 0.76, -0.1],
    rotation: [0, 90, 0],
  });

  // Flank gears: a toothed brass wheel on each side, with a dark hub.
  for (const s of [1, -1]) {
    const gx = s * 0.135;
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.024, 10), GEAR, {
      bone: back,
      at: [gx, 0.5, -0.12],
      rotation: [0, 0, 90],
    });
    for (let i = 0; i < 10; i++) {
      const a = i * 36;
      const rad = (a * Math.PI) / 180;
      b.part(new THREE.BoxGeometry(0.024, 0.03, 0.02), COPPER, {
        bone: back,
        at: [gx, 0.5 + 0.085 * Math.cos(rad), -0.12 + 0.085 * Math.sin(rad)],
        rotation: [a, 0, 0],
      });
    }
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 8), DARK, {
      bone: back,
      at: [s * 0.15, 0.5, -0.12],
      rotation: [0, 0, 90],
    });
  }

  // ---- Tail: a curled brass spring-tail -----------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.5, -0.3],
      [0, 0.56, -0.42],
      [0, 0.7, -0.5],
      [0, 0.78, -0.44],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.035 * (1 - t) + 0.012, {
    color: IRON,
    bands: [
      [0.55, IRON],
      [1, BRASS],
    ],
  });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { at: tail.at(1).at });

  // ---- Neck and head ------------------------------------------------------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.52, 0.05],
      [0, 0.62, 0.2],
      [0, 0.72, 0.32],
    ]),
    { parent: chest, names: ["neckLow", "neckHigh"], role: "neck" },
  );
  b.sweep(neck, [0.07, 0.06], { color: IRON });

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.74, 0.36],
    dir: [0, 0.3, 1],
    role: "head",
  });

  // Skull, snout, nose.
  b.part(new THREE.BoxGeometry(0.17, 0.16, 0.2), BRASS, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.01 }),
  });
  b.part(new THREE.BoxGeometry(0.11, 0.09, 0.16), BRASS, {
    bone: head,
    at: head.local({ forward: 0.15, up: -0.01 }),
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.235 }),
  });

  // Hinged lower jaw.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.05 }),
    dir: [0, -0.1, 1],
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.035, 0.2), IRON, {
    bone: jaw,
    at: jaw.local({ forward: 0.08, up: -0.01 }),
  });

  // Eyes (amber, glowing) in brass bezels, and copper ears on each side.
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.06, up: 0.03, forward: 0.12 });
    b.part(new THREE.SphereGeometry(0.028, 8, 6), EYE, { bone: head, at: eyeAt });
    b.part(new THREE.TorusGeometry(0.036, 0.01, 6, 10), BRASS, { bone: head, at: eyeAt });

    b.spike(head.local({ left: s * 0.06, up: 0.08, forward: -0.03 }), [0, 1, -0.25], 0.12, 0.03, {
      color: COPPER,
      bone: head,
    });
  }

  // ---- Legs ---------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front leg: elbow bends backward, IK lands the paw on the floor.
    const fl = limb([s * 0.1, 0.5, 0.12], [s * 0.1, 0.04, 0.2], [0.24, 0.24], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fl, {
      parent: chest,
      names: [`shoulder${side}F`, `elbow${side}F`, `paw${side}F`],
      role: "leg",
    });
    b.sweep(front, [0.045, 0.028], { color: IRON });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), BRASS, {
      bone: front.joints[1],
      at: front.joints[1].at,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.14), DARK, {
      bone: front.joints[front.joints.length - 1],
      at: [s * 0.1, 0.025, 0.22],
    });

    // Hind leg: stifle forward, hock back (digitigrade), vertical cannon to the paw.
    const hl = limb([s * 0.1, 0.5, -0.28], [s * 0.1, 0.04, -0.3], [0.24, 0.22, 0.12], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${side}`, hl, {
      parent: hips,
      names: [`hip${side}H`, `knee${side}H`, `hock${side}H`, `paw${side}H`],
      role: "leg",
    });
    b.sweep(hind, [0.06, 0.03], { color: IRON });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), BRASS, {
      bone: hind.joints[1],
      at: hind.joints[1].at,
    });
    b.part(new THREE.SphereGeometry(0.028, 8, 6), BRASS, {
      bone: hind.joints[2],
      at: hind.joints[2].at,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.15), DARK, {
      bone: hind.joints[hind.joints.length - 1],
      at: [s * 0.1, 0.025, -0.29],
    });
  }

  return b.root;
}
```