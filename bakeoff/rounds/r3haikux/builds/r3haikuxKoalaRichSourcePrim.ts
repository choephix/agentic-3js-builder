import * as THREE from "three";
import { catmull, createBuilder, grain, mix, mottle, paint, smoothstep } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Sleepy koala",
  description:
    "A drowsy koala in ash-grey fur with a cream chest and cream-lined ears, hugging a eucalyptus branch and chewing a sprig of blue-green leaves.",
};

type V = readonly [number, number, number];

// Paints: soft ash fur, a cream chest and face, darker grey paws, grey-green bark. They bake over the surface.
const fur = mottle("#9c9b98", "#b9b7b2", { size: 0.06, contrast: 0.8, seed: 4 });
const cream = mottle("#ebdfc3", "#f7f0de", { size: 0.035, seed: 9 });
const pawSkin = mottle("#6b6d6c", "#868889", { size: 0.03, seed: 12 });
const bark = grain("#7b8674", "#bfc6b1", { size: 0.035, axis: "y", seed: 3 });

const coat = paint((p, n) => {
  const chest = smoothstep(0.3, 0.6, n.z) * smoothstep(0.24, 0.33, p.y) * (1 - smoothstep(0.48, 0.56, p.y));
  return mix(fur.at(p, n), cream.at(p, n), chest);
});
const headCoat = paint((p, n) =>
  mix(fur.at(p, n), cream.at(p, n), smoothstep(0.2, 0.5, n.z) * (1 - smoothstep(0.62, 0.68, p.y))),
);

// Flat colours.
const BROWN_EYE = "#5a3522";
const NOSE = "#1c1917";
const CLAW = "#2c2927";
const LEAF_A = "#86b0a8";
const LEAF_B = "#5d8f88";
const STEM = "#8c9c8a";
const GUMNUT = "#a0a895";

const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const plus = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** A lance-shaped eucalyptus leaf: from `base` along `dir`, flat in the plane of `dir` and `side`. */
function leaf(b: Builder, base: V, dir: V, side: V, length: number, width: number, color: string, bone: string) {
  const axis = unit(dir);
  const across = unit(plus(side, axis, -dot(side, axis)));
  const edge = (t: number, s: number): V =>
    plus(plus(base, axis, length * t), across, s * width * Math.sin(Math.PI * t) ** 0.7);
  const ts = [0.15, 0.35, 0.55, 0.75, 0.9];
  const outline: V[] = [
    base,
    ...ts.map((t) => edge(t, 1)),
    plus(base, axis, length),
    ...[...ts].reverse().map((t) => edge(t, -1)),
  ];
  b.slab(outline, { color, thickness: 0.0025, bone, group: "leaves" });
}

/** Three short dark claws set along `across` at the front of a paw, pointing along `dir`. */
function claws(b: Builder, bone: string, paw: V, dir: V, across: V, reach: number) {
  const forward = unit(dir);
  for (const u of [-0.022, 0, 0.022]) {
    const at = plus(plus(paw, forward, reach), across, u);
    b.part(new THREE.ConeGeometry(0.0065, 0.03, b.segments(6)), CLAW, { at, dir: forward, bone, group: "claws" });
  }
}

export default function koala() {
  const b = createBuilder({ name: "koala" });

  // Skeleton: hips at the root, a spine up to the head, a jaw hinged under the muzzle, arms and legs as chains,
  // and the branch as a prop bone.
  b.joint("hips", { at: [0, 0.3, 0] });
  b.joint("branch", { parent: "hips", at: [-0.2, 0, 0] });
  b.chain(
    "spine",
    [
      [0, 0.47, 0.02],
      [0, 0.6, 0.03],
      [0, 0.72, 0.03],
    ],
    { parent: "hips", names: ["chest", "neck", "head"], role: "spine" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.655, 0.075], role: "jaw" });
  const armR = b.chain(
    "armR",
    [
      [-0.15, 0.53, 0.04],
      [-0.27, 0.47, 0.1],
      [-0.245, 0.36, 0.085],
    ],
    { parent: "chest", names: ["upperArmR", "forearmR", "pawR"], role: "arm" },
  );
  const armL = b.chain(
    "armL",
    [
      [0.15, 0.53, 0.04],
      [0.24, 0.46, 0.1],
      [0.13, 0.6, 0.2],
    ],
    { parent: "chest", names: ["upperArmL", "forearmL", "pawL"], role: "arm" },
  );
  const legR = b.chain(
    "legR",
    [
      [-0.11, 0.3, 0.05],
      [-0.16, 0.2, 0.15],
      [-0.13, 0.17, 0.24],
    ],
    { parent: "hips", names: ["thighR", "shinR", "footR"], role: "leg" },
  );
  const legL = b.chain(
    "legL",
    [
      [0.11, 0.3, 0.05],
      [0.16, 0.2, 0.15],
      [0.13, 0.17, 0.24],
    ],
    { parent: "hips", names: ["thighL", "shinL", "footL"], role: "leg" },
  );

  // Torso, rump and a little tail, all on the hips. The torso carries the cream chest.
  b.part(new THREE.SphereGeometry(0.2, b.segments(14), b.segments(10)), coat, {
    at: [0, 0.4, 0],
    bone: "hips",
    scale: [1, 1.08, 0.96],
    name: "torso",
  });
  b.part(new THREE.SphereGeometry(0.16, b.segments(12), b.segments(9)), fur, {
    at: [0, 0.27, -0.035],
    bone: "hips",
    scale: [1.15, 0.85, 1],
    name: "rump",
  });
  b.part(new THREE.SphereGeometry(0.035, b.segments(8), b.segments(6)), fur, {
    at: [0, 0.27, -0.2],
    bone: "hips",
    name: "tail",
  });

  // Limbs: fat grey tubes along their chains, bending at the joints.
  b.sweep(armR, (t: number) => 0.048 - 0.012 * t, { color: fur, name: "armR" });
  b.sweep(armL, (t: number) => 0.048 - 0.012 * t, { color: fur, name: "armL" });
  b.sweep(legR, (t: number) => 0.078 - 0.03 * t, { color: fur, name: "legR" });
  b.sweep(legL, (t: number) => 0.078 - 0.03 * t, { color: fur, name: "legL" });

  // Paws: strong grey mitts. The right paw grips the branch, the left holds the sprig. Feet have claws.
  const pawR: V = [-0.245, 0.36, 0.085];
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(9)), pawSkin, {
    at: pawR,
    bone: "pawR",
    scale: [1.05, 0.9, 1.1],
    name: "pawR",
  });
  claws(b, "pawR", pawR, [0, -0.2, 1], [1, 0, 0], 0.068);

  const pawL: V = [0.13, 0.6, 0.2];
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(9)), pawSkin, {
    at: pawL,
    bone: "pawL",
    scale: [1.05, 0.9, 1.1],
    name: "pawL",
  });

  const footR: V = [-0.13, 0.165, 0.255];
  const footL: V = [0.13, 0.165, 0.255];
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(9)), pawSkin, {
    at: footR,
    bone: "footR",
    scale: [1.1, 0.75, 1.3],
    name: "footR",
  });
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(9)), pawSkin, {
    at: footL,
    bone: "footL",
    scale: [1.1, 0.75, 1.3],
    name: "footL",
  });
  claws(b, "footR", footR, [0, -0.1, 1], [1, 0, 0], 0.08);
  claws(b, "footL", footL, [0, -0.1, 1], [1, 0, 0], 0.08);

  // Ears: a grey disc, a scalloped fluff of grey puffs round its rim, and a cream lining on the front.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear: V = [s * 0.11, 0.85, -0.01];
    b.part(new THREE.SphereGeometry(0.07, b.segments(14), b.segments(10)), fur, {
      at: ear,
      bone: "head",
      scale: [1, 1, 0.32],
      name: `ear${side}`,
    });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.026, b.segments(8), b.segments(6)), fur, {
        at: plus(ear, [Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0]),
        bone: "head",
        scale: [1, 1, 0.6],
        group: "fluff",
      });
    }
    b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(8)), cream, {
      at: plus(ear, [0, 0, 0.02]),
      bone: "head",
      scale: [1, 1, 0.3],
      group: "lining",
    });
  }

  // Head: fur with a cream chin, a cream muzzle, a big black nose.
  b.part(new THREE.SphereGeometry(0.135, b.segments(16), b.segments(12)), headCoat, {
    at: [0, 0.72, 0.03],
    bone: "head",
    scale: [1.05, 0.95, 0.95],
    name: "head",
  });
  b.part(new THREE.SphereGeometry(0.075, b.segments(12), b.segments(9)), cream, {
    at: [0, 0.68, 0.135],
    bone: "head",
    scale: [1.15, 0.85, 0.95],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.045, b.segments(12), b.segments(9)), NOSE, {
    at: [0, 0.716, 0.192],
    bone: "head",
    scale: [1.35, 0.85, 0.85],
    name: "nose",
  });

  // Half-closed drowsy eyes: a brown eyeball with a fur lid over its top half.
  for (const s of [1, -1]) {
    const eye: V = [s * 0.06, 0.752, 0.148];
    b.part(new THREE.SphereGeometry(0.026, b.segments(12), b.segments(9)), BROWN_EYE, {
      at: eye,
      bone: "head",
      scale: [1, 1.05, 0.7],
    });
    b.part(new THREE.SphereGeometry(0.031, b.segments(12), b.segments(8), 0, Math.PI * 2, 0, Math.PI * 0.56), fur, {
      at: plus(eye, [0, 0, 0.004]),
      bone: "head",
    });
  }

  // Lower jaw: cream chin on its own joint, so the mouth can open.
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(9)), cream, {
    at: [0, 0.625, 0.13],
    bone: "jaw",
    scale: [1.2, 0.7, 1],
    name: "chin",
  });

  // The sprig in the left hand, held up to the mouth: a stem and six leaves.
  const S0: V = [0.12, 0.6, 0.23];
  const S2: V = [0.03, 0.7, 0.3];
  b.rod(S0, S2, [0.0055, 0.0035], { color: STEM, bone: "pawL", name: "sprig" });
  leaf(b, [0.0975, 0.625, 0.2475], [0.7, 0.2, 0.7], [0, 1, 0], 0.085, 0.014, LEAF_A, "pawL");
  leaf(b, [0.075, 0.65, 0.265], [-0.3, 0.5, 0.8], [1, 0, 0.2], 0.08, 0.014, LEAF_B, "pawL");
  leaf(b, [0.0525, 0.675, 0.2825], [-0.6, 0.5, 0.5], [0, 0, 1], 0.075, 0.014, LEAF_A, "pawL");
  leaf(b, [0.03, 0.7, 0.3], [0.1, 0.9, 0.3], [1, 0, 0], 0.07, 0.013, LEAF_B, "pawL");
  leaf(b, [0.085, 0.615, 0.25], [0.4, -0.7, 0.5], [0, 0, 1], 0.07, 0.013, LEAF_B, "pawL");
  leaf(b, [0.06, 0.64, 0.27], [-0.8, -0.2, 0.3], [0, 1, 0], 0.065, 0.013, LEAF_A, "pawL");

  // The eucalyptus branch: a tapering trunk rising from the floor, with a twig and a leafy top.
  b.sweep(
    catmull([
      [-0.2, 0, 0],
      [-0.25, 0.45, 0],
      [-0.28, 0.85, -0.01],
      [-0.33, 1.12, -0.03],
    ]),
    (t: number) => 0.068 - 0.03 * t,
    { color: bark, bone: "branch", name: "trunk", caps: { start: "flat", end: "round" } },
  );
  b.rod([-0.28, 0.8, -0.01], [-0.4, 0.97, 0.03], [0.02, 0.01], { color: bark, bone: "branch", name: "twig" });
  b.part(new THREE.CylinderGeometry(0.011, 0.016, 0.022, b.segments(8)), GUMNUT, {
    at: [-0.334, 0.86, 0],
    bone: "branch",
    name: "gumnut",
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.016, 0.022, b.segments(8)), GUMNUT, {
    at: [-0.37, 0.915, 0.02],
    bone: "branch",
    name: "gumnut",
  });

  leaf(b, [-0.31, 0.84, -0.005], [-0.3, 0.6, 0.7], [0, 1, 0], 0.09, 0.014, LEAF_A, "branch");
  leaf(b, [-0.345, 0.885, 0.01], [-0.6, 0.3, -0.5], [0, 1, 0], 0.085, 0.014, LEAF_B, "branch");
  leaf(b, [-0.385, 0.95, 0.025], [-0.5, 0.8, 0.2], [0, 0, 1], 0.08, 0.014, LEAF_A, "branch");
  leaf(b, [-0.36, 0.91, 0], [-0.2, -0.7, 0.5], [1, 0, 0], 0.075, 0.013, LEAF_B, "branch");

  leaf(b, [-0.33, 1.1, -0.03], [0.3, 1, 0.3], [1, 0, 0], 0.09, 0.014, LEAF_A, "branch");
  leaf(b, [-0.34, 1.08, -0.02], [-0.8, 0.5, 0.2], [0, 0, 1], 0.085, 0.014, LEAF_B, "branch");
  leaf(b, [-0.31, 1.06, -0.05], [0.6, 0.4, -0.7], [0, 1, 0], 0.08, 0.014, LEAF_A, "branch");
  leaf(b, [-0.33, 1.05, 0.03], [-0.1, -0.9, 0.4], [1, 0, 0], 0.07, 0.013, LEAF_B, "branch");

  // A sleepy pose: the head nods forward and the jaw drops a little mid-chew.
  b.pose("jaw", { axis: [1, 0, 0], deg: 14 });
  b.pose("head", { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
