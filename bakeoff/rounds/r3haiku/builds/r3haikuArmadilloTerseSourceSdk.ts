import * as THREE from "three";
import { createBuilder, catmull, countershade, polyline, scales, stripes } from "../../../../src/index";

export const meta = {
  name: "Armadillo",
  description:
    "A nine-banded armadillo: a scaled, countershaded shell over short legs, a long pale-snouted head with small eyes and ears, a ringed tail and clawed feet.",
};

export default function armadillo() {
  const b = createBuilder({ name: "armadillo", paintSize: 1024 });

  // Materials. The shell is scaled on the back and pale underneath; the tail is ringed.
  const plates = scales(["#8f6d4d", "#9e7d5a", "#7e5f42"], "#4d3828", { size: 0.055, width: 0.16, seed: 3 });
  const shell = countershade(plates, "#d7c3a0", { level: -0.2, soft: 0.4 });
  const tailPaint = stripes("#c99c7e", "#8a6450", { size: 0.035, axis: "z", width: 0.45 });
  const head = "#a88c70";
  const jawColor = "#b29a7e";
  const limb = "#b8a089";
  const claw = "#ece2cc";
  const black = "#141210";

  // Skeleton: a spine running forward to the head, a jaw hinged under the snout.
  const root = b.joint("root", { at: [0, 0.2, 0] });
  const spine = b.joint("spine", { parent: root, at: [0, 0.21, 0.1], dir: [0, 0, 1] });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.21, 0.24], dir: [0, -0.1, 1], role: "neck" });
  const headJoint = b.joint("head", { parent: neck, at: [0, 0.2, 0.33], dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: headJoint, at: [0, 0.165, 0.36], dir: [0, 0, 1], role: "jaw" });

  // Shell: a banded, domed body that tapers into the neck.
  b.loft(
    [
      { at: [0, 0.2, -0.22], w: 0.2, h: 0.18 },
      { at: [0, 0.21, -0.06], w: 0.27, h: 0.22 },
      { at: [0, 0.21, 0.1], w: 0.27, h: 0.22 },
      { at: [0, 0.2, 0.22], w: 0.22, h: 0.19 },
      { at: [0, 0.19, 0.3], w: 0.16, h: 0.15 },
    ],
    { color: shell, name: "shell", bone: [root, spine, neck], sides: 10 },
  );

  // Head: a long tapering snout.
  const headSweep = b.loft(
    [
      { at: [0, 0.2, 0.27], w: 0.17, h: 0.17 },
      { at: [0, 0.2, 0.36], w: 0.15, h: 0.14 },
      { at: [0, 0.19, 0.46], w: 0.1, h: 0.09 },
      { at: [0, 0.185, 0.55], w: 0.04, h: 0.04 },
    ],
    { color: head, name: "head", bone: [neck, headJoint], sides: 10 },
  );

  // Lower jaw, separate so it can open.
  b.loft(
    [
      { at: [0, 0.168, 0.36], w: 0.08, h: 0.05 },
      { at: [0, 0.158, 0.46], w: 0.06, h: 0.035 },
      { at: [0, 0.152, 0.52], w: 0.03, h: 0.02 },
    ],
    { color: jawColor, name: "jaw", bone: jaw, sides: 8 },
  );

  // Face details seated on the real head surface.
  const skin = b.surface(headSweep);
  const eye = (x: number) =>
    b.stick(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), black, skin.nearest([x, 0.225, 0.42]), {
      embed: 0.35,
      name: "eye",
    });
  eye(0.045);
  eye(-0.045);

  const earGeometry = new THREE.SphereGeometry(0.03, b.segments(8), b.segments(6));
  earGeometry.scale(0.8, 1.3, 0.45);
  b.stick(earGeometry, head, skin.nearest([0.05, 0.28, 0.34]), { embed: 0.4, name: "earL" });
  b.stick(earGeometry.clone(), head, skin.nearest([-0.05, 0.28, 0.34]), { embed: 0.4, name: "earR" });

  b.stick(new THREE.SphereGeometry(0.016, b.segments(8), b.segments(6)), "#2a2220", skin.nearest([0, 0.185, 0.6]), {
    embed: 0.3,
    name: "nose",
  });

  // Legs: short, stout, with a hip bulge, a flattened foot and three claws.
  const feet = [
    { id: "FL", x: 0.13, z: 0.13 },
    { id: "FR", x: -0.13, z: 0.13 },
    { id: "HL", x: 0.14, z: -0.12 },
    { id: "HR", x: -0.14, z: -0.12 },
  ];
  for (const { id, x, z } of feet) {
    const path = polyline([
      [x, 0.16, z],
      [x * 1.12, 0.08, z - 0.02],
      [x, 0.03, z + 0.03],
      [x, 0.02, z + 0.11],
    ]);
    const leg = b.chain(`leg${id}`, path, {
      parent: root,
      role: "leg",
      names: [`upper${id}`, `lower${id}`, `ankle${id}`, `foot${id}`],
    });
    b.sweep(leg, (t) => 0.042 - 0.016 * t, { color: limb, name: `leg${id}` });
    b.part(new THREE.SphereGeometry(0.046, b.segments(10), b.segments(8)), limb, {
      at: [x, 0.16, z],
      bone: root,
      scale: [1, 1.1, 1.15],
      name: `hip${id}`,
    });
    b.part(new THREE.SphereGeometry(0.036, b.segments(8), b.segments(6)), limb, {
      at: [x, 0.02, z + 0.1],
      bone: leg.tip!,
      scale: [1.1, 0.55, 1.5],
      name: `foot${id}`,
    });
    for (const k of [-1, 0, 1]) {
      b.spike([x + k * 0.016, 0.02, z + 0.125], [k * 0.25, -0.45, 1], 0.024, 0.0065, {
        color: claw,
        bone: leg.tip!,
        name: `claw${id}`,
      });
    }
  }

  // Tail: a tapering, ringed tail trailing from the rear of the shell.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.17, -0.18],
      [0, 0.15, -0.36],
      [0, 0.12, -0.56],
      [0, 0.1, -0.7],
    ]),
    { parent: root, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  b.sweep(tail, (t) => 0.048 - 0.034 * t, { color: tailPaint, name: "tail" });

  return b.root;
}
