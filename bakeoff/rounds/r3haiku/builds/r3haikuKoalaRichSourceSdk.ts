import * as THREE from "three";
import { createBuilder, catmull, grain, mottle, paint } from "../../../../src/index";

export const meta = {
  name: "Sleepy koala",
  description: "A drowsy ash-grey koala with a cream chest and fluffy ears, hugging a eucalyptus sprig and mid-munch.",
};

const ASH = "#9a9ea3";
const ASH_LIGHT = "#bfc3c6";
const CREAM = "#f2e7cb";
const NOSE = "#161616";
const EYE = "#4a2c14";
const CLAW = "#262626";
const BARK_A = "#5b4330";
const BARK_B = "#86603f";

// Eucalyptus leaf: a lens in the leaf's own x (length) and y (width), in meters.
const LEAF: Array<[number, number]> = [
  [0, 0],
  [0.018, 0.011],
  [0.05, 0.009],
  [0.078, 0],
  [0.05, -0.008],
  [0.018, -0.01],
];

export default function koala() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });

  const fur = mottle(ASH, ASH_LIGHT, { size: 0.05, seed: 3, contrast: 0.8 });
  // Cream chest on the front of the body, ash everywhere else.
  const body = paint((p, n) => (p.z > 0.1 && p.y > 0.22 && p.y < 0.46 && n.z > 0.4 ? CREAM : fur));
  const bark = grain(BARK_A, BARK_B, { size: 0.012, axis: "y", seed: 5 });
  const leafPaint = mottle("#3f7a6d", "#7db7a4", { size: 0.02, seed: 9 });

  const sphere = (r: number) => new THREE.SphereGeometry(r, b.segments(14), b.segments(10));

  // ---- Skeleton -------------------------------------------------------------------------------------------
  b.joint("hips", { at: [0, 0.17, 0], dir: [0, 1, 0] });

  const spine = b.chain("spine", catmull([[0, 0.17, 0], [0, 0.33, 0.03], [0, 0.48, 0.05]]), {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  b.joint("neck", { parent: "chest", at: [0, 0.5, 0.05], dir: [0, 1, 0.4] });
  b.joint("head", { parent: "neck", at: [0, 0.6, 0.08], dir: [0, 1, 0.2], role: "head" });

  for (const [side, x] of [
    ["L", 0.1],
    ["R", -0.1],
  ] as const) {
    b.joint(`ear${side}`, { parent: "head", at: [x, 0.7, 0.03], dir: [Math.sign(x) * 0.5, 1, 0] });
  }

  // Arms: the +X arm (koala's left) reaches the upper branch, the -X arm the lower one.
  const armR = b.chain("armR", catmull([[-0.15, 0.44, 0.07], [-0.2, 0.36, 0.17], [-0.02, 0.39, 0.28]]), {
    parent: "chest",
    names: ["armR1", "armR2", "pawR"],
    role: "arm",
  });
  const armL = b.chain("armL", catmull([[0.15, 0.44, 0.07], [0.2, 0.4, 0.18], [0.08, 0.5, 0.295]]), {
    parent: "chest",
    names: ["armL1", "armL2", "pawL"],
    role: "arm",
  });

  // Hind legs: thighs forward, feet flat on the floor.
  const legR = b.chain("legR", catmull([[-0.12, 0.16, 0], [-0.18, 0.07, 0.15], [-0.1, 0.03, 0.27]]), {
    parent: "hips",
    names: ["legR1", "legR2", "footR"],
    role: "leg",
  });
  const legL = b.chain("legL", catmull([[0.12, 0.16, 0], [0.18, 0.07, 0.15], [0.1, 0.03, 0.27]]), {
    parent: "hips",
    names: ["legL1", "legL2", "footL"],
    role: "leg",
  });

  // ---- Body -----------------------------------------------------------------------------------------------
  b.sweep(spine, [0.16, 0.19, 0.17], { color: body, name: "body" });
  b.sweep(armR, [0.05, 0.042, 0.038], { color: fur, name: "armR" });
  b.sweep(armL, [0.05, 0.042, 0.038], { color: fur, name: "armL" });
  b.sweep(legR, [0.07, 0.055, 0.045], { color: fur, name: "legR" });
  b.sweep(legL, [0.07, 0.055, 0.045], { color: fur, name: "legL" });

  // Feet: flattened pads on the floor.
  b.part(sphere(0.05), fur, { bone: "footR", at: [-0.1, 0.04, 0.3], scale: [0.9, 0.55, 1.3], name: "footR" });
  b.part(sphere(0.05), fur, { bone: "footL", at: [0.1, 0.04, 0.3], scale: [0.9, 0.55, 1.3], name: "footL" });

  // ---- Head -----------------------------------------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.13, b.segments(16), b.segments(12)), fur, {
    bone: "head",
    at: [0, 0.61, 0.08],
    scale: [1.08, 1, 1],
    name: "head",
  });

  // Fluffy ears with cream linings.
  for (const [side, x] of [
    ["L", 0.1],
    ["R", -0.1],
  ] as const) {
    const bone = `ear${side}`;
    b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(8)), fur, {
      bone,
      at: [x, 0.7, 0.03],
      scale: [1, 1.05, 0.35],
      name: `ear${side}`,
    });
    b.part(new THREE.SphereGeometry(0.036, b.segments(10), b.segments(8)), CREAM, {
      bone,
      at: [x, 0.7, 0.055],
      scale: [0.9, 0.95, 0.2],
      name: `earLining${side}`,
    });
  }

  // Half-closed drowsy eyes: a brown eye under a fur-coloured lid.
  for (const sx of [1, -1]) {
    b.part(sphere(0.022), EYE, { bone: "head", at: [sx * 0.055, 0.625, 0.19], name: "eye" });
    b.part(sphere(0.03), fur, {
      bone: "head",
      at: [sx * 0.055, 0.645, 0.195],
      scale: [1.2, 0.6, 0.5],
      name: "eyelid",
    });
  }

  // Big black leathery nose.
  b.part(new THREE.SphereGeometry(0.05, b.segments(14), b.segments(10)), NOSE, {
    bone: "head",
    at: [0, 0.615, 0.2],
    scale: [1.3, 0.85, 0.9],
    name: "nose",
  });

  // ---- Paws and claws ---------------------------------------------------------------------------------------
  const paws = [
    { bone: "pawR", at: [-0.02, 0.39, 0.29] as [number, number, number] },
    { bone: "pawL", at: [0.08, 0.5, 0.295] as [number, number, number] },
  ];
  for (const { bone, at } of paws) {
    b.part(sphere(0.045), fur, { bone, at, scale: [1.15, 0.85, 1], name: bone });
    for (const ox of [-0.022, 0, 0.022]) {
      b.spike(
        [at[0] + ox, at[1] - 0.02, at[2] + 0.035],
        [0, -0.35, 1],
        0.022,
        0.0055,
        { color: CLAW, bone, name: "claw" },
      );
    }
  }
  // Foot claws, small and dark.
  for (const [bone, x] of [
    ["footR", -0.1],
    ["footL", 0.1],
  ] as const) {
    for (const ox of [-0.02, 0.02]) {
      b.spike([x + ox, 0.03, 0.37], [0, -0.1, 1], 0.014, 0.004, { color: CLAW, bone, name: "toeClaw" });
    }
  }

  // ---- Eucalyptus sprig -----------------------------------------------------------------------------------
  // The branch rests on the floor, runs up across the chest in both paws and ends by the mouth.
  const twig = b.sweep(
    catmull([
      [-0.32, 0.03, 0.36],
      [-0.14, 0.24, 0.3],
      [-0.02, 0.4, 0.27],
      [0.08, 0.5, 0.27],
      [0.15, 0.6, 0.2],
    ]),
    0.022,
    { color: bark, bone: "hips", name: "branch" },
  );

  // Leaves along the sprig's end, each a flat lens sticking out from the branch surface.
  const leaves: Array<[number, number]> = [
    [0.8, 25],
    [0.84, 140],
    [0.88, 250],
    [0.92, 70],
    [0.95, 190],
    [0.99, 300],
  ];
  for (const [t, deg] of leaves) {
    const sp = twig.at(t, deg, 0.002);
    const dir = sp.n.clone().multiplyScalar(0.8).addScaledVector(sp.tangent, 0.6).normalize();
    b.extrude(LEAF, {
      color: leafPaint,
      at: sp.at,
      x: dir,
      y: sp.tangent,
      thickness: 0.004,
      bone: "hips",
      name: "leaf",
    });
  }

  return b.root;
}
