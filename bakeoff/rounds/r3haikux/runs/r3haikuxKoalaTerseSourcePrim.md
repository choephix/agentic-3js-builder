```ts
import * as THREE from "three";
import { createBuilder, limb, mix, noise, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description:
    "A koala sitting upright: a fluffy grey coat with a cream chest, big round ears lined in cream, a large black nose, and a eucalyptus sprig in its left paw.",
};

const COAT = "#8e9288";
const COAT_DARK = "#666a62";
const CREAM = "#ece5d1";
const EAR_LINING = "#e4d9c2";
const EYE = "#15110e";
const NOSE = "#1c1917";
const GLINT = "#eef1f3";
const CLAW = "#2e2a26";
const STEM = "#8a7a64";
const LEAF = "#7e9d8c";

/** Cloudy grey fur, cream on the chest and chin, darker on the back. Model-space, so every part continues it. */
const fur = paint((p, n) => {
  const cloud = smoothstep(0.3, 0.7, 0.65 * noise(p, 0.09, 7) + 0.35 * noise(p, 0.025, 11));
  const coat = mix(COAT_DARK, COAT, cloud);
  const front = smoothstep(0.3, 0.8, n.z);
  const centre = 1 - smoothstep(0.1, 0.2, Math.abs(p.x));
  const low = 1 - smoothstep(0.42, 0.5, p.y);
  return mix(coat, CREAM, front * centre * low);
});

export default function koala() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });

  // Skeleton: pelvis (root) -> spine -> neck -> head -> jaw, ears on the head.
  // Legs, arms and tail are chains.
  const pelvis = b.joint("pelvis", { at: [0, 0.12, 0], role: "spine" });
  const spine = b.joint("spine", { parent: pelvis, at: [0, 0.3, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.44, 0.01], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.5, 0.02], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.505, 0.06], dir: [0, 0, 1], role: "jaw" });

  // Body: a pear of revolution, squashed front to back, standing on y = 0.
  const profile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.12, 0.0),
    new THREE.Vector2(0.18, 0.05),
    new THREE.Vector2(0.2, 0.15),
    new THREE.Vector2(0.19, 0.28),
    new THREE.Vector2(0.155, 0.38),
    new THREE.Vector2(0.09, 0.45),
    new THREE.Vector2(0.0, 0.47),
  ];
  b.part(new THREE.LatheGeometry(profile, 16), fur, { at: [0, 0, 0], bone: spine, scale: [1, 1, 0.84] });

  // Head: a broad round skull with a cream muzzle.
  b.part(new THREE.SphereGeometry(0.12, 18, 14), fur, {
    at: [0, 0.56, 0.02],
    bone: head,
    scale: [1.12, 0.95, 1],
  });
  b.part(new THREE.SphereGeometry(0.062, 12, 8), CREAM, {
    at: [0, 0.525, 0.115],
    bone: head,
    scale: [1.1, 0.7, 0.85],
  });
  // Lower jaw: its own piece on the jaw joint, so the mouth can open.
  b.part(new THREE.SphereGeometry(0.04, 12, 8), CREAM, {
    at: [0, 0.495, 0.108],
    bone: jaw,
    scale: [1.25, 0.55, 1],
  });
  // The big black nose, with a wet highlight.
  b.part(new THREE.SphereGeometry(0.035, 14, 10), NOSE, {
    at: [0, 0.566, 0.152],
    bone: head,
    scale: [1.35, 0.9, 0.85],
  });
  b.part(new THREE.SphereGeometry(0.0075, 8, 6), GLINT, { at: [0.014, 0.574, 0.178], bone: head });

  for (const s of [1, -1] as const) {
    const S = s > 0 ? "L" : "R";
    const x = (v: number) => s * v;

    // Ear: a round fluffy disc turned forward and out, with a cream lining on its front.
    const ear = b.joint(`ear${S}`, { parent: head, at: [x(0.1), 0.62, 0] });
    const facing = new THREE.Vector3(x(0.55), 0.15, 0.82).normalize();
    const earAt = new THREE.Vector3(x(0.115), 0.635, -0.005);
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.035, 14), fur, { at: earAt, dir: facing, bone: ear });
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 12), EAR_LINING, {
      at: earAt.clone().addScaledVector(facing, 0.02),
      dir: facing,
      bone: ear,
    });

    // Eyes: small, dark, set high, each with a glint.
    const eye = new THREE.Vector3(x(0.055), 0.6, 0.122);
    b.part(new THREE.SphereGeometry(0.017, 10, 8), EYE, { at: eye, bone: head });
    b.part(new THREE.SphereGeometry(0.0055, 6, 5), GLINT, {
      at: eye.clone().add(new THREE.Vector3(x(0.006), 0.006, 0.013)),
      bone: head,
    });

    // Legs: thighs forward, knees up, feet down on the ground.
    const leg = b.chain(
      `leg${S}`,
      limb([x(0.12), 0.13, 0.03], [x(0.12), 0.05, 0.25], [0.14, 0.13], [0, 1, 0]),
      { parent: pelvis, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    const [hip, knee, ankle] = leg.joints;
    b.capsule(hip, knee, [0.085, 0.065], { color: fur });
    b.capsule(knee, ankle, [0.06, 0.05], { color: fur });

    // Foot: a flat pad with five claws fanned forward.
    b.part(new THREE.SphereGeometry(0.06, 14, 10), fur, {
      at: [x(0.12), 0.031, 0.29],
      bone: ankle,
      scale: [1, 0.5, 1.25],
    });
    for (let k = -2; k <= 2; k++)
      b.spike([x(0.12) + k * 0.014, 0.031, 0.35], [k * 0.12, -0.04, 1], 0.034, 0.0085, {
        color: CLAW,
        bone: ankle,
      });

    // Arms: out and forward, paws in front of the chest.
    const arm = b.chain(
      `arm${S}`,
      [
        [x(0.13), 0.34, 0.03],
        [x(0.23), 0.27, 0.1],
        [x(0.2), 0.3, 0.25],
      ],
      { parent: spine, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    const [shoulder, elbow, wrist] = arm.joints;
    b.capsule(shoulder, elbow, [0.05, 0.042], { color: fur });
    b.capsule(elbow, wrist, [0.042, 0.038], { color: fur });

    // Paw: a soft blob with five long claws.
    b.part(new THREE.SphereGeometry(0.042, 12, 9), fur, {
      at: [x(0.2), 0.3, 0.26],
      bone: wrist,
      scale: [1.05, 0.85, 1.25],
    });
    for (let k = -2; k <= 2; k++)
      b.spike([x(0.2) + k * 0.012, 0.3, 0.29], [k * 0.18, -0.1, 1], 0.03, 0.0075, {
        color: CLAW,
        bone: wrist,
      });

    if (s > 0) {
      // A eucalyptus sprig held up in the left paw, with narrow grey-green leaves.
      const from = new THREE.Vector3(x(0.2), 0.3, 0.26);
      const dir = new THREE.Vector3(0.02, 0.8, 0.6).normalize();
      const to = from.clone().addScaledVector(dir, 0.27);
      b.rod(wrist, to, 0.0045, { color: STEM });
      [0.28, 0.42, 0.56, 0.7, 0.84].forEach((t, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const c = from.clone().lerp(to, t);
        const out = new THREE.Vector3(side, 0, 0);
        const d = dir.clone().multiplyScalar(0.5).addScaledVector(out, 0.85).normalize();
        const w = dir.clone().addScaledVector(d, -dir.dot(d)).normalize();
        const L = 0.085;
        const W = 0.024;
        b.slab(
          [
            c,
            c.clone().addScaledVector(d, L * 0.35).addScaledVector(w, W / 2),
            c.clone().addScaledVector(d, L),
            c.clone().addScaledVector(d, L * 0.35).addScaledVector(w, -W / 2),
          ],
          { color: LEAF, thickness: 0.002, bone: wrist },
        );
      });
    }
  }

  // Tail: a small fluffy stub at the back, swept along a three-joint chain.
  const tail = b.chain(
    "tail",
    [
      [0, 0.1, -0.12],
      [0, 0.11, -0.18],
      [0, 0.13, -0.22],
    ],
    { parent: pelvis, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, { radius: [0.05, 0.028], color: fur });

  return b.root;
}
```