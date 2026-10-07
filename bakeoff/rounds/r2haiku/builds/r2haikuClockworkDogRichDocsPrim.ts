import * as THREE from "three";
import { createBuilder, catmull, spiral } from "../../../../src/index";

export const meta = {
  name: "Clockwork terrier",
  description:
    "A wind-up brass and copper terrier with riveted plates, gears visible in the chest, a winding key, springy legs, leather ears, green lens eyes, a coiled spring tail and a red collar with a brass tag.",
};

const BRASS = "#c9a54b";
const RIVET = "#e8c973";
const COPPER = "#b8733a";
const RED = "#a3161f";
const LEATHER = "#4a2c1a";
const GLASS = "#7fe8a8";
const DARK = "#2b2118";

const EAR: [number, number][] = [
  [-0.03, 0.03],
  [0.03, 0.03],
  [0.035, -0.04],
  [0.025, -0.12],
  [0, -0.14],
  [-0.025, -0.12],
  [-0.035, -0.04],
];

export default function build() {
  const b = createBuilder({ name: "clockwork-terrier" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.44, -0.22] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.44, -0.22],
      [0, 0.48, 0],
      [0, 0.53, 0.16],
      [0, 0.58, 0.27],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.58, 0.27],
      [0, 0.66, 0.36],
      [0, 0.74, 0.42],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 0.74, 0.42], aim: [0, 0.8, 0.52], role: "head" });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.03 }),
    aim: head.local({ forward: 0.2, up: -0.03 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.46, -0.3],
      [0, 0.53, -0.39],
      [0, 0.6, -0.44],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- Body ---------------------------------------------------------------
  // Brass barrel with copper riveted panels on the back (sector bands on the dorsal clock).
  const torso = b.sweep(spine, (t: number) => 0.085 + 0.03 * Math.sin(Math.PI * t), {
    color: BRASS,
    sectors: [
      [-55, 55, COPPER, 0.08, 0.5],
      [-55, 55, COPPER, 0.6, 0.92],
    ],
  });

  // Rivets along the panel edges and the flanks.
  for (const t of [0.06, 0.2, 0.36, 0.5, 0.62, 0.78, 0.92]) {
    for (const deg of [-55, 55, -100, 100]) {
      b.stick(new THREE.SphereGeometry(0.008, 5, 4), RIVET, torso.at(t, deg), { embed: 0.35 });
    }
  }

  // Neck tube.
  b.sweep(neck, 0.05, { color: BRASS });

  // Gear housings on each flank of the chest, with turning gears.
  const gear = (cx: number, cy: number, cz: number, nx: number, r: number, teeth: number, color: string) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.012, 16), color, { at: [cx, cy, cz], dir: [nx, 0, 0] });
    b.part(new THREE.CylinderGeometry(r * 0.25, r * 0.25, 0.02, 8), RIVET, {
      at: [cx + nx * 0.004, cy, cz],
      dir: [nx, 0, 0],
    });
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const dy = Math.cos(a);
      const dz = Math.sin(a);
      b.part(new THREE.BoxGeometry(0.012, 0.016, 0.014), color, {
        at: [cx, cy + dy * (r + 0.006), cz + dz * (r + 0.006)],
        dir: [0, dy, dz],
        axis: "y",
      });
    }
  };

  for (const s of [1, -1]) {
    // Brass window plate on the chest flank.
    b.part(new THREE.BoxGeometry(0.01, 0.13, 0.13), BRASS, {
      bone: spine.joints[2],
      at: [s * 0.118, 0.52, 0.17],
    });
    gear(s * 0.124, 0.53, 0.15, s, 0.032, 10, COPPER);
    gear(s * 0.124, 0.5, 0.2, s, 0.02, 7, BRASS);
  }

  // Winding key on the back.
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), COPPER, {
    bone: spine.joints[1],
    at: [0, 0.59, -0.1],
  });
  b.part(new THREE.TorusGeometry(0.035, 0.008, 6, 14), COPPER, {
    bone: spine.joints[1],
    at: [0, 0.66, -0.1],
    dir: [1, 0, 0],
    axis: "z",
  });

  // Coiled spring tail: a thin core on the tail chain, with a spring wound around it.
  b.sweep(tail, 0.006, { color: COPPER });
  b.sweep(spiral([0, 0.46, -0.3], [0.03, 0.46, -0.3], [0, 0.7, -0.7], { turns: 8, pitch: 0.018, r1: 0.022 }), 0.006, {
    color: COPPER,
  });

  // ---- Head ---------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.13, 0.12, 0.12), BRASS, { bone: head, at: head.local({ forward: -0.01, up: 0.03 }) });
  b.part(new THREE.BoxGeometry(0.08, 0.07, 0.1), BRASS, { bone: head, at: head.local({ forward: 0.1, up: 0 }) });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), DARK, { bone: head, at: head.local({ forward: 0.155, up: 0.005 }) });

  // Lower jaw on its own joint.
  b.part(new THREE.BoxGeometry(0.07, 0.03, 0.09), BRASS, { bone: jaw, at: jaw.local({ forward: 0.05, up: -0.01 }) });

  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.05, up: 0.04, forward: 0.06 });
    b.part(new THREE.SphereGeometry(0.028, 8, 6), GLASS, { bone: head, at: eyeAt });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 10), BRASS, {
      bone: head,
      at: eyeAt,
      dir: [0, 0, 1],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.04, forward: 0.09 }),
    });

    // Floppy leather ear hanging from the side of the skull.
    b.extrude(EAR, {
      at: head.local({ left: s * 0.07, up: 0.04, back: 0.01 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 2,
      color: LEATHER,
    });
  }

  // Red collar with a brass tag at the front of the neck.
  b.part(new THREE.TorusGeometry(0.066, 0.014, 6, 16), RED, {
    bone: neck.joints[1],
    at: [0, 0.66, 0.36],
    dir: [0, 0.7, 0.7],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 10), BRASS, {
    bone: neck.joints[1],
    at: [0, 0.59, 0.41],
    dir: [0, 0, 1],
  });

  // ---- Legs ---------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Front leg: shoulder, elbow, wrist, paw.
    const fl = b.chain(
      `leg${L}F`,
      [
        [s * 0.085, 0.5, 0.14],
        [s * 0.085, 0.3, 0.15],
        [s * 0.085, 0.12, 0.14],
        [s * 0.085, 0.02, 0.18],
      ],
      { parent: spine.joints[2], names: [`shoulderF${L}`, `elbowF${L}`, `wristF${L}`, `pawF${L}`], role: "leg" },
    );
    b.sweep(fl, [0.024, 0.014], { color: BRASS });
    b.sweep(spiral([s * 0.085, 0.13, 0.14], [s * 0.085 + 0.03, 0.13, 0.14], [0, 1, 0], { turns: 6, pitch: 0.02 }), 0.005, {
      color: COPPER,
    });
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.06), BRASS, {
      bone: fl.joints[fl.joints.length - 1],
      at: [s * 0.085, 0.02, 0.19],
    });

    // Rear leg: thigh, knee, hock, paw.
    const rl = b.chain(
      `leg${L}H`,
      [
        [s * 0.085, 0.44, -0.2],
        [s * 0.085, 0.28, -0.25],
        [s * 0.085, 0.12, -0.2],
        [s * 0.085, 0.02, -0.16],
      ],
      { parent: spine.joints[0], names: [`thighH${L}`, `kneeH${L}`, `hockH${L}`, `pawH${L}`], role: "leg" },
    );
    b.sweep(rl, [0.026, 0.014], { color: BRASS });
    b.sweep(spiral([s * 0.085, 0.13, -0.2], [s * 0.085 + 0.03, 0.13, -0.2], [0, 1, 0], { turns: 6, pitch: 0.02 }), 0.005, {
      color: COPPER,
    });
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.06), BRASS, {
      bone: rl.joints[rl.joints.length - 1],
      at: [s * 0.085, 0.02, -0.15],
    });
  }

  return b.root;
}
