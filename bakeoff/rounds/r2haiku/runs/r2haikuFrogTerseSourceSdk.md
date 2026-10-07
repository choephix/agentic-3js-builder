```ts
import * as THREE from "three";
import { countershade, createBuilder, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Frog",
  description: "A stylised green frog with bulging gold eyes, a pale throat, warts and splayed toes, in a rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "frog", detail: 1, paintSize: 1024 });

  // Green back with darker and lime spots, shading to a pale yellow belly.
  const back = spots("#3d8b37", ["#8cc84b", "#22582a"], { size: 0.028, amount: 0.45, seed: 4 });
  const skin = countershade(back, "#e9e3a3", { level: -0.15, soft: 0.45 });
  const GOLD = "#f2c230";
  const PUPIL = "#0d0d0d";
  const WART = "#1e4f22";
  const PAD = "#c9e56b";

  // Skeleton: pelvis, a spine running forward to the head, and the jaw.
  const pelvis = b.joint("pelvis", { at: [0, 0.045, -0.05] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.045, -0.05],
      [0, 0.05, 0.0],
      [0, 0.052, 0.04],
      [0, 0.05, 0.075],
    ],
    { parent: pelvis, names: ["waist", "chest", "neck", "head"], role: "spine" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.04, 0.05], dir: [0, 0, 1], role: "jaw" });

  // Body: a squat loft from the rear to the snout, bending with the spine.
  const torso = b.loft(
    [
      { at: [0, 0.04, -0.075], w: 0.05, h: 0.05 },
      { at: [0, 0.045, -0.035], w: 0.11, h: 0.08 },
      { at: [0, 0.048, 0.0], w: 0.13, h: 0.085 },
      { at: [0, 0.05, 0.035], w: 0.115, h: 0.075 },
      { at: [0, 0.048, 0.065], w: 0.085, h: 0.065 },
      { at: [0, 0.046, 0.085], w: 0.05, h: 0.04 },
    ],
    { color: skin, bone: spine, name: "body" },
  );

  // Warts scattered over the top and flanks of the body.
  const wartGeometry = new THREE.SphereGeometry(0.0035, b.segments(6), b.segments(4));
  const hits = b.surface(torso).scatter(40, {
    rng: rng(7),
    minDist: 0.014,
    filter: (h) => h.n.y > -0.3 && h.at.z < 0.045 && h.at.z > -0.07,
  });
  for (const hit of hits) b.stick(wartGeometry, WART, hit, { embed: 0.4 });

  // Eyes: gold domes with black pupils and small highlights, riding the head.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, b.segments(12), b.segments(8)), GOLD, {
      at: [s * 0.036, 0.088, 0.055],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.009, b.segments(8), b.segments(6)), PUPIL, {
      at: [s * 0.036, 0.091, 0.071],
      bone: "head",
      name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.003, b.segments(6), b.segments(4)), "#ffffff", {
      at: [s * 0.04, 0.096, 0.076],
      bone: "head",
      name: "highlight",
    });
  }

  // Lower jaw: a pale strip under the snout, on its own hinge so the mouth can open.
  b.capsule([0, 0.042, 0.045], [0, 0.04, 0.09], 0.012, { color: "#e9e3a3", bone: "jaw", name: "lowerJaw" });

  // Limbs, mirrored for left (+X) and right (-X).
  for (const s of [1, -1] as const) {
    const L = s > 0 ? "L" : "R";
    const x = (v: number) => s * v;

    // Hind leg: a folded thigh and shin out to the side, the foot forward on the ground.
    const hind = b.chain(
      `leg${L}`,
      [
        [x(0.04), 0.045, -0.035],
        [x(0.085), 0.03, -0.018],
        [x(0.06), 0.012, 0.03],
      ],
      { parent: pelvis, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(hind, (t: number) => 0.02 - 0.006 * t, { color: skin });

    // Splayed toes, each a short tube ending in a pale pad.
    const toes = [
      [x(0.085), 0.004, 0.06],
      [x(0.07), 0.004, 0.08],
      [x(0.045), 0.004, 0.085],
    ];
    for (const toe of toes) {
      b.capsule([x(0.06), 0.012, 0.03], toe, 0.004, { color: skin, bone: hind });
      b.part(new THREE.SphereGeometry(0.0045, b.segments(6), b.segments(4)), PAD, {
        at: toe,
        bone: hind,
      });
    }

    // Front arm: shoulder tucked under the body, hand planted on the ground.
    const arm = b.chain(
      `arm${L}`,
      [
        [x(0.04), 0.06, 0.03],
        [x(0.058), 0.035, 0.058],
        [x(0.04), 0.012, 0.082],
      ],
      { parent: "chest", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    b.sweep(arm, 0.009, { color: skin });

    // Fingers with pale tips.
    const fingers = [
      [x(0.03), 0.004, 0.095],
      [x(0.045), 0.004, 0.098],
      [x(0.055), 0.004, 0.09],
    ];
    for (const finger of fingers) {
      b.capsule([x(0.04), 0.012, 0.082], finger, 0.003, { color: skin, bone: arm });
      b.part(new THREE.SphereGeometry(0.0035, b.segments(6), b.segments(4)), PAD, {
        at: finger,
        bone: arm,
      });
    }
  }

  return b.root;
}
```