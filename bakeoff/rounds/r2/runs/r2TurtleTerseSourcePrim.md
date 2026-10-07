```ts
import * as THREE from "three";
import { createBuilder, mottle, patches } from "agentic-3js-builder";

export const meta = {
  name: "Sea Turtle",
  description:
    "Stylized green sea turtle in a rest pose: patterned domed carapace, cream plastron, paddle flippers, and a rigged neck, head and jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seaTurtle" });

  const skin = mottle("#7d8c52", "#a9a96a", { size: 0.07, seed: 3 });
  const shell = patches("#3a2c1c", ["#7a5a2e", "#8d6c38", "#6a4e29", "#80612f"], { size: 0.15, gap: 0.12, seed: 5 });
  const CREAM = "#ead9a2";
  const BEAK = "#6e5a3a";

  // Skeleton
  b.joint("root", { at: [0, 0.2, 0] });
  b.joint("spine", { parent: "root", at: [0, 0.2, 0.12], dir: [0, 0, 1], role: "spine" });

  // Neck and head
  b.chain(
    "neck",
    [
      [0, 0.22, 0.36],
      [0, 0.235, 0.46],
      [0, 0.245, 0.55],
    ],
    { parent: "spine", names: ["neck1", "neck2", "head"], role: "neck", up: [0, 1, 0] },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.212, 0.6], dir: [0, 0, 1], role: "jaw" });

  // Tail
  const tail = b.chain(
    "tail",
    [
      [0, 0.14, -0.42],
      [0, 0.135, -0.5],
      [0, 0.13, -0.58],
    ],
    { parent: "root", names: ["tail1", "tail2"], role: "tail", up: [0, 1, 0] },
  );
  b.sweep(tail, (t: number) => 0.045 * (1 - t) + 0.012, { color: skin, caps: "round", sides: 6 });

  // Flippers
  const flipperW = (len: number, thick: number) => (t: number) =>
    [0.012 + len * Math.sin(Math.PI * Math.min(1, 0.2 + 0.8 * t)), 0.008 + thick * (1 - t)] as [number, number];

  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    const front = b.chain(
      "frontFlipper" + side,
      [
        [0.2 * s, 0.15, 0.22],
        [0.42 * s, 0.14, 0.2],
        [0.66 * s, 0.13, 0.1],
        [0.9 * s, 0.12, -0.04],
      ],
      {
        parent: "root",
        names: ["shoulder" + side, "elbow" + side, "wrist" + side, "flipperTip" + side],
        role: "arm",
        up: [0, 1, 0],
      },
    );
    b.sweep(front, flipperW(0.085, 0.016), { color: skin, caps: "round", sides: 6 });
    // claw
    b.part(new THREE.ConeGeometry(0.012, 0.045, 5), "#e8dcc0", {
      at: [0.7 * s, 0.13, 0.12],
      rotation: [90, 0, -90 * s],
      bone: "wrist" + side,
    });

    const hind = b.chain(
      "hindFlipper" + side,
      [
        [0.16 * s, 0.13, -0.3],
        [0.28 * s, 0.12, -0.4],
        [0.4 * s, 0.11, -0.5],
      ],
      { parent: "root", names: ["hip" + side, "knee" + side, "ankle" + side], role: "leg", up: [0, 1, 0] },
    );
    b.sweep(hind, flipperW(0.06, 0.014), { color: skin, caps: "round", sides: 6 });

    // eye
    b.part(new THREE.SphereGeometry(0.02, 8, 6), "#14100c", { at: [0.063 * s, 0.268, 0.62], bone: "head" });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { at: [0.077 * s, 0.275, 0.628], bone: "head" });
    // brow scale
    b.part(new THREE.SphereGeometry(1, 8, 5), "#5d6a3a", {
      at: [0.05 * s, 0.295, 0.6],
      scale: [0.03, 0.012, 0.04],
      bone: "head",
    });
  }

  // Neck sweep
  const neck = b.ctx.joints.get("neck1")!;
  b.sweep(
    [
      [0, 0.22, 0.34],
      [0, 0.235, 0.46],
      [0, 0.245, 0.56],
    ],
    (t: number) => 0.08 - 0.01 * t,
    { color: skin, bone: [neck, "neck2", "head"], caps: "round", sides: 8 },
  );

  // Head
  b.part(new THREE.SphereGeometry(1, 12, 8), skin, {
    at: [0, 0.25, 0.6],
    scale: [0.075, 0.066, 0.095],
    bone: "head",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), BEAK, {
    at: [0, 0.238, 0.675],
    scale: [0.05, 0.028, 0.07],
    bone: "head",
  });
  b.part(new THREE.ConeGeometry(0.014, 0.035, 5), BEAK, {
    at: [0, 0.215, 0.725],
    rotation: [180, 0, 0],
    bone: "head",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#8a7448", {
    at: [0, 0.2, 0.635],
    scale: [0.042, 0.018, 0.06],
    bone: "jaw",
  });

  // Shell
  b.part(new THREE.SphereGeometry(1, 18, 11), shell, {
    at: [0, 0.22, 0],
    scale: [0.38, 0.16, 0.5],
    bone: "root",
  });
  b.part(new THREE.SphereGeometry(1, 18, 6), "#5b4526", {
    at: [0, 0.2, 0],
    scale: [0.42, 0.055, 0.53],
    bone: "root",
  });
  b.part(new THREE.SphereGeometry(1, 16, 7), CREAM, {
    at: [0, 0.085, 0],
    scale: [0.3, 0.085, 0.44],
    bone: "root",
  });
  // plastron seams
  for (const z of [-0.2, 0, 0.2])
    b.part(new THREE.BoxGeometry(0.4, 0.008, 0.01), "#c9b678", { at: [0, 0.05, z], bone: "root" });

  // vertebral keel scutes
  for (let i = 0; i < 5; i++) {
    const z = -0.26 + i * 0.13;
    const yTop = 0.22 + 0.16 * Math.sqrt(1 - (z / 0.5) ** 2);
    b.part(new THREE.SphereGeometry(1, 8, 5), i % 2 ? "#a07a3e" : "#946f38", {
      at: [0, yTop - 0.004, z],
      scale: [0.07, 0.022, 0.058],
      bone: "root",
    });
  }
  // barnacles
  const r = (() => {
    let s = 7;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const rr = 0.4 + r() * 0.4;
    const x = Math.cos(a) * 0.3 * rr;
    const z = Math.sin(a) * 0.4 * rr;
    const y = 0.22 + 0.16 * Math.sqrt(Math.max(0, 1 - (x / 0.38) ** 2 - (z / 0.5) ** 2));
    b.part(new THREE.ConeGeometry(0.014, 0.02, 5), "#d8d2c0", { at: [x, y, z], bone: "root" });
  }

  return b.root;
}
```