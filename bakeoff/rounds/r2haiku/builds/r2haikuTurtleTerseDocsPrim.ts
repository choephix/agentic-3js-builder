import * as THREE from "three";
import { catmull, countershade, createBuilder, limb, rng, scales } from "../../../../src/index";

export const meta = {
  name: "Sea turtle",
  description: "A green sea turtle: domed shell with scute pattern, paddle flippers, and a short head on a neck.",
};

const SHELL = "#5b7b3c";
const SHELL_EDGE = "#2c3d1f";
const PLASTRON = "#e9dcaa";
const SKIN = countershade("#4e7a52", "#d8e6b0", { level: -0.2 });
const FLIPPER = "#3f5e3c";
const EYE = "#141414";
const EYE_WHITE = "#f2f2ea";
const BEAK = "#e3c77a";
const BARNACLE = "#d9d3b8";

export default function build() {
  const b = createBuilder({ name: "sea-turtle" });

  // Body core: the root joint, at the middle of the shell.
  const hips = b.joint("hips", { at: [0, 0.25, 0], dir: [0, 0, 1] });

  // Shell: a flattened top dome with a scute pattern.
  const shellGeo = new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  shellGeo.scale(0.36, 0.22, 0.46);
  const shell = b.part(shellGeo, scales(SHELL, SHELL_EDGE, { size: 0.1 }), {
    at: [0, 0.3, 0],
    bone: hips,
    flat: true,
    name: "shell",
  });

  // Plastron: the lower bowl under the shell, creamy yellow.
  const plastronGeo = new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  plastronGeo.scale(0.33, 0.13, 0.42);
  b.part(plastronGeo, PLASTRON, { at: [0, 0.3, 0], bone: hips, flat: true, name: "plastron" });

  // Barnacles scattered across the top of the shell.
  for (const hit of b.surface(shell).scatter(12, { rng: rng(7), minDist: 0.14, filter: (h) => h.n.y > 0.5 })) {
    b.stick(new THREE.SphereGeometry(0.018, 6, 4), BARNACLE, hit, { embed: 0.4 });
  }

  // Neck, head and jaw. The chain's tip joint is the head.
  const neck = b.chain("neck", catmull([
    [0, 0.26, 0.3],
    [0, 0.31, 0.48],
    [0, 0.34, 0.66],
  ]), {
    parent: hips,
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  const head = neck.tip!;
  b.sweep(neck, (t: number) => 0.075 - 0.025 * t, { color: SKIN });

  // Head: an elongated sphere on the tip joint.
  const headGeo = new THREE.SphereGeometry(0.08, 12, 9);
  headGeo.scale(1, 0.85, 1.25);
  b.part(headGeo, SKIN, { bone: head, flat: true, name: "head" });

  // Beak: a short cone pointing forward.
  b.part(new THREE.ConeGeometry(0.035, 0.09, 6), BEAK, {
    bone: head,
    at: head.local({ forward: 0.1, up: -0.01 }),
    dir: head.dir([0, 0, 1]),
    name: "beak",
  });

  // Eyes on each side of the head.
  for (const s of [1, -1]) {
    const side = s > 0 ? { left: 0.07 } : { right: 0.07 };
    const pupilSide = s > 0 ? { left: 0.078 } : { right: 0.078 };
    b.part(new THREE.SphereGeometry(0.026, 8, 6), EYE_WHITE, {
      bone: head,
      at: head.local({ ...side, forward: 0.045, up: 0.015 }),
      name: "eyeWhite",
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), EYE, {
      bone: head,
      at: head.local({ ...pupilSide, forward: 0.05, up: 0.017 }),
      name: "pupil",
    });
  }

  // Tail: a short, tapered stub behind the shell.
  b.chain("tail", catmull([
    [0, 0.24, -0.36],
    [0, 0.21, -0.5],
    [0, 0.19, -0.6],
  ]), {
    parent: hips,
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
  });
  b.sweep(
    b.chain("tailCopy", [[0, 0, 0]], { parent: hips, names: ["tailDummy"] }),
    0.02,
    { color: SKIN },
  );

  // Flippers: front pair from the shoulders, rear pair from the hips.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Front flipper: shoulder, elbow, hand.
    const fore = limb([s * 0.26, 0.22, 0.2], [s * 0.6, 0.03, 0.05], [0.24, 0.2], [[0, -1, 0]]);
    const frontFlip = b.chain(`flipF${L}`, fore, {
      parent: hips,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "arm",
    });
    b.sweep(frontFlip, (t: number) => 0.04 - 0.012 * t, { color: FLIPPER });
    const paddleF = new THREE.SphereGeometry(1, 8, 5);
    paddleF.scale(0.2, 0.03, 0.09);
    b.part(paddleF, FLIPPER, { bone: frontFlip.tip!, flat: true, name: `paddleF${L}` });

    // Rear flipper: hip, knee, foot.
    const hind = limb([s * 0.2, 0.2, -0.22], [s * 0.3, 0.03, -0.5], [0.2, 0.16], [[0, -1, 0]]);
    const rearFlip = b.chain(`flipH${L}`, hind, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `foot${L}`],
      role: "leg",
    });
    b.sweep(rearFlip, (t: number) => 0.03 - 0.008 * t, { color: FLIPPER });
    const paddleH = new THREE.SphereGeometry(1, 8, 5);
    paddleH.scale(0.13, 0.025, 0.06);
    b.part(paddleH, FLIPPER, { bone: rearFlip.tip!, flat: true, name: `paddleH${L}` });
  }

  return b.root;
}
