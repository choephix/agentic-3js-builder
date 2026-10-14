import * as THREE from "three";
import { countershade, createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description:
    "A plump autumn hedgehog with a dome of chestnut spines tipped in cream, a fawn face with a pointed snout, and a red maple leaf stuck on its back.",
};

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog" });
  const random = rng(3);
  const spineShades = ["#8a4a2a", "#9a5a33", "#7a3f24"];
  const cream = "#f3e6c8";
  const pink = "#f4a6b4";
  const legColor = "#b98355";
  const faceColor = "#e4c39a";

  // Skeleton: hips, a spine that bends the body, a head on the spine's end, four legs.
  b.joint("hips", { at: [0, 0.085, -0.02] });
  const spine = b.chain("spine", [[0, 0.088, -0.1], [0, 0.09, 0], [0, 0.085, 0.075]], {
    role: "spine",
    names: ["back1", "back2"],
  });
  b.joint("head", { parent: "back2", at: [0, 0.085, 0.1], aim: [0, 0.084, 0.22], role: "head" });

  // Body: a plump loft, countershaded so the belly is paler than the back.
  const body = b.loft(
    [
      { at: [0, 0.085, -0.1], w: 0.1, h: 0.1 },
      { at: [0, 0.088, -0.05], w: 0.16, h: 0.15 },
      { at: [0, 0.09, 0.0], w: 0.17, h: 0.16 },
      { at: [0, 0.085, 0.05], w: 0.15, h: 0.14 },
      { at: [0, 0.08, 0.085], w: 0.12, h: 0.12 },
    ],
    {
      name: "body",
      color: countershade("#7b4a2c", "#e6c9a0", { level: 0.2, soft: 0.4 }),
      bone: spine,
    },
  );

  // Head: a fawn loft tapering to a pointed, twitchy snout.
  const head = b.loft(
    [
      { at: [0, 0.085, 0.08], w: 0.13, h: 0.12 },
      { at: [0, 0.088, 0.13], w: 0.12, h: 0.11 },
      { at: [0, 0.085, 0.17], w: 0.08, h: 0.08 },
      { at: [0, 0.082, 0.2], w: 0.03, h: 0.03 },
      { at: [0, 0.08, 0.22], w: 0.012, h: 0.012 },
    ],
    { name: "head", color: faceColor, bone: "head" },
  );

  // Spines: cones scattered over the upper body, leaning back, each with a cream tip.
  const bodySkin = b.surface(body);
  const spines = bodySkin.scatter(150, {
    rng: rng(7),
    minDist: 0.021,
    filter: (h) => h.at.z < 0.05 && h.at.z > -0.11 && h.n.y > -0.25,
  });
  for (const hit of spines) {
    const length = 0.024 + 0.008 * random();
    const dir = new THREE.Vector3(hit.n.x, hit.n.y, hit.n.z - 0.5).normalize();
    const base = hit.at.clone().addScaledVector(dir, -0.003);
    const shade = spineShades[Math.floor(random() * spineShades.length)];
    b.spike(base, dir, length, 0.0028, { color: shade, sides: 5 });
    b.spike(base.clone().addScaledVector(dir, length * 0.55), dir, length * 0.45, 0.0028 * 0.45, {
      color: cream,
      sides: 5,
    });
  }

  // Face: black button nose, bright beady eyes, tiny round ears.
  const headSkin = b.surface(head);
  const nose = headSkin.nearest([0, 0.08, 0.23]);
  b.stick(new THREE.SphereGeometry(0.009, b.segments(10), b.segments(8)), "#0c0a0a", nose, { embed: 0.2 });
  for (const sx of [1, -1]) {
    const eye = headSkin.nearest([sx * 0.045, 0.1, 0.16]);
    b.stick(new THREE.SphereGeometry(0.011, b.segments(10), b.segments(8)), "#120a06", eye, { embed: 0.2 });
    const ear = headSkin.nearest([sx * 0.05, 0.135, 0.11]);
    b.stick(new THREE.SphereGeometry(0.013, b.segments(10), b.segments(8)), faceColor, ear, {
      embed: 0.3,
      scale: [1, 1, 0.35],
    });
  }

  // Legs: short fawn legs on chains, with little pink paws.
  const leg = (sx: 1 | -1, front: boolean) => {
    const s = sx === 1 ? "L" : "R";
    const k = front ? "F" : "B";
    const points = front
      ? [[sx * 0.065, 0.08, 0.05], [sx * 0.075, 0.04, 0.06], [sx * 0.07, 0.012, 0.078]]
      : [[sx * 0.065, 0.08, -0.06], [sx * 0.075, 0.04, -0.045], [sx * 0.07, 0.012, -0.02]];
    const chain = b.chain(`leg${s}${k}`, points, {
      role: "leg",
      names: [`hip${s}${k}`, `knee${s}${k}`, `foot${s}${k}`],
    });
    b.sweep(chain, 0.011, { color: legColor });
    const [z0, z1] = front ? [0.066, 0.09] : [-0.036, -0.012];
    b.capsule([sx * 0.07, 0.016, z0], [sx * 0.07, 0.016, z1], 0.016, {
      color: pink,
      bone: `foot${s}${k}`,
    });
  };
  for (const sx of [1, -1] as const) {
    leg(sx, true);
    leg(sx, false);
  }

  // The maple leaf, stuck on the spines near the top of the back.
  const top = bodySkin.nearest([0.02, 0.17, -0.02]);
  const leafAt = top.moved([0, 0.036, 0]);
  b.extrude(
    [
      [0, 0.06, "sharp"],
      [0.012, 0.03],
      [0.035, 0.04, "sharp"],
      [0.03, 0.012],
      [0.06, 0, "sharp"],
      [0.045, -0.012],
      [0.015, -0.02],
      [0, -0.05, "sharp"],
      [-0.015, -0.02],
      [-0.045, -0.012],
      [-0.06, 0, "sharp"],
      [-0.03, 0.012],
      [-0.035, 0.04, "sharp"],
      [-0.012, 0.03],
    ],
    {
      name: "maple leaf",
      color: "#c2301c",
      at: leafAt,
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.004,
    },
  );

  return b.root;
}
