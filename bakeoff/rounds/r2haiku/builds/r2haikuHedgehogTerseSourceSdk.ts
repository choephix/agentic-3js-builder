import * as THREE from "three";
import { countershade, createBuilder, gradient, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description:
    "A stylised hedgehog: a round brown body under cream-tipped spines, a pale face with a dark snout and beady eyes, short legs on the floor.",
};

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", paintSize: 1024 });

  const coat = countershade("#8c6444", "#efe0c4", { level: 0.15, soft: 0.3 });
  const dark = "#3d2c22";
  const legColor = "#4b3426";
  const random = rng(7);

  // Skeleton: body root, neck and head, a jaw hinge, four legs.
  b.joint("body", { at: [0, 0.075, 0] });
  b.joint("neck", { parent: "body", at: [0, 0.088, 0.085] });
  b.joint("head", { parent: "neck", at: [0, 0.098, 0.135] });
  b.joint("jaw", { parent: "head", at: [0, 0.09, 0.165], dir: [0, 0, 1], role: "jaw" });

  const legs: Array<[string, number, number]> = [
    ["FL", 0.055, 0.05],
    ["FR", -0.055, 0.05],
    ["BL", 0.055, -0.06],
    ["BR", -0.055, -0.06],
  ];
  for (const [side, x, z] of legs) {
    b.joint(`hip${side}`, { parent: "body", at: [x, 0.06, z] });
    b.joint(`foot${side}`, { parent: `hip${side}`, at: [x, 0.012, z + 0.01] });
  }

  // Body: one smooth loft from rump to shoulders, rigid on the body bone so spines can ride it.
  const body = b.loft(
    [
      { at: [0, 0.072, -0.11], w: 0.07, h: 0.08 },
      { at: [0, 0.076, -0.05], w: 0.14, h: 0.13 },
      { at: [0, 0.078, 0.02], w: 0.16, h: 0.14 },
      { at: [0, 0.072, 0.08], w: 0.13, h: 0.12 },
      { at: [0, 0.064, 0.105], w: 0.09, h: 0.09 },
    ],
    { name: "body", color: coat, bone: "body" },
  );

  // Tail nub.
  b.capsule([0, 0.086, -0.108], [0, 0.1, -0.13], [0.012, 0.008], { color: dark, bone: "body", name: "tail" });

  // Legs and feet.
  for (const [side] of legs) {
    b.capsule(`hip${side}`, `foot${side}`, 0.015, { color: legColor, bone: `hip${side}`, name: `leg${side}` });
    b.part(new THREE.SphereGeometry(0.02, b.segments(8), b.segments(6)), dark, {
      bone: `foot${side}`,
      scale: [1, 0.6, 1.3],
      name: `foot${side}`,
    });
  }

  // Head: a pale forehead running to a dark snout.
  const face = gradient("#8a6548", "#2b211c", [0, 0.115, 0.13], [0, 0.09, 0.19]);
  b.part(new THREE.SphereGeometry(0.042, b.segments(14), b.segments(10)), face, {
    bone: "head",
    at: [0, 0.098, 0.135],
    name: "head",
  });

  // Upper and lower snout, nose.
  b.capsule([0, 0.098, 0.165], [0, 0.088, 0.2], [0.02, 0.014], { color: "#6e5444", bone: "head", name: "snout" });
  b.capsule([0, 0.09, 0.165], [0, 0.082, 0.192], [0.018, 0.011], { color: "#4a3a33", bone: "jaw", name: "jaw" });
  b.part(new THREE.SphereGeometry(0.014, b.segments(10), b.segments(8)), "#161110", {
    bone: "head",
    at: [0, 0.09, 0.203],
    name: "nose",
  });

  // Eyes: small glossy-looking black beads.
  for (const x of [0.02, -0.02]) {
    b.part(new THREE.SphereGeometry(0.007, b.segments(8), b.segments(6)), "#0d0a09", {
      bone: "head",
      at: [x, 0.112, 0.166],
      name: "eye",
    });
  }

  // Ears: thin pink fans at the sides of the head.
  const ear: Array<[number, number, number]> = [];
  for (const x of [0.031, -0.031]) ear.push([x, 0.13, 0.122]);
  for (const at of ear) {
    b.extrude(
      [
        [-0.014, 0],
        [0.014, 0],
        [0.008, 0.016],
        [-0.008, 0.016],
      ],
      {
        color: "#c99a84",
        at,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.005,
        smoothing: 1,
        bone: "head",
        name: "ear",
      },
    );
  }

  // Spines: scattered over the back and flanks, cream at the root, dark at the tip.
  const spines = b.surface(body).scatter(280, {
    rng: random,
    minDist: 0.013,
    filter: (hit) => hit.n.y > -0.25 && hit.at.z < 0.07 && hit.at.z > -0.115,
  });
  for (const hit of spines) {
    b.spike(hit, hit, 0.028 + 0.016 * random(), 0.0045, {
      sides: 5,
      bands: [
        [0.55, "#f3e7cf"],
        [1, dark],
      ],
      name: "spine",
    });
  }

  return b.root;
}
