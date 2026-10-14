import * as THREE from "three";
import { createBuilder, frame, grain } from "../../../../src/index";

export const meta = {
  name: "Clockwork dog",
  description: "A brass-and-iron wind-up dog on a jointed skeleton, with geared flanks, a winding key and amber eyes.",
};

const IRON = grain("#3e444d", "#2a2f37", { size: 0.09, axis: "z", seed: 3 });
const BRASS = "#c9a24a";
const COPPER = "#b87333";
const AMBER = "#ffb020";

export default function clockworkDog() {
  const b = createBuilder({ name: "clockwork-dog" });

  // Skeleton: body, neck and head, jaw, tail, four legs.
  b.joint("hips", { at: [0, 0.42, -0.18] });
  b.joint("chest", { parent: "hips", at: [0, 0.44, 0.12], dir: [0, 0, 1] });

  const neck = b.chain("neck", [[0, 0.45, 0.14], [0, 0.53, 0.22], [0, 0.6, 0.27]], {
    parent: "chest",
    role: "neck",
    names: ["neck1", "neck2", "head"],
  });
  b.joint("jaw", { parent: "head", at: [0, 0.575, 0.33], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain("tail", [[0, 0.44, -0.3], [0, 0.49, -0.4], [0, 0.56, -0.5]], {
    parent: "hips",
    role: "tail",
    names: ["tailA", "tailB", "tailTip"],
  });

  const legs = [
    { id: "FL", sign: 1, parent: "chest", hip: [0.085, 0.4, 0.1], knee: [0.09, 0.2, 0.12], ankle: [0.09, 0.04, 0.1] },
    { id: "FR", sign: -1, parent: "chest", hip: [-0.085, 0.4, 0.1], knee: [-0.09, 0.2, 0.12], ankle: [-0.09, 0.04, 0.1] },
    { id: "BL", sign: 1, parent: "hips", hip: [0.085, 0.4, -0.18], knee: [0.09, 0.22, -0.14], ankle: [0.09, 0.04, -0.2] },
    { id: "BR", sign: -1, parent: "hips", hip: [-0.085, 0.4, -0.18], knee: [-0.09, 0.22, -0.14], ankle: [-0.09, 0.04, -0.2] },
  ];
  for (const leg of legs) {
    b.chain(`leg${leg.id}`, [leg.hip, leg.knee, leg.ankle], {
      parent: leg.parent,
      role: "leg",
      names: [`hip${leg.id}`, `knee${leg.id}`, `ankle${leg.id}`],
    });
  }

  // Torso: a painted iron barrel with two brass bands.
  b.capsule([0, 0.42, -0.2], [0, 0.44, 0.14], 0.115, { color: IRON, bone: "hips", name: "torso" });
  for (const z of [-0.1, 0.08]) {
    b.part(new THREE.TorusGeometry(0.12, 0.007, b.segments(6), b.segments(28)), BRASS, {
      at: [0, 0.43, z],
      bone: "hips",
    });
  }

  // Clockwork flank gears, one each side, with a ring of teeth.
  for (const x of [0.118, -0.118]) {
    const face = x > 0 ? [1, 0, 0] : [-1, 0, 0];
    const center = [x, 0.45, -0.02];
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.014, b.segments(18)), BRASS, {
      at: center,
      dir: face,
      bone: "hips",
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, b.segments(10)), COPPER, {
      at: center,
      dir: face,
      bone: "hips",
    });
    b.ring(frame(center, face), { count: 12, radius: 0.062 }, (item) => {
      b.part(new THREE.BoxGeometry(0.012, 0.022, 0.012), BRASS, { frame: item, bone: "hips" });
    });
  }

  // Winding key standing on the back.
  b.capsule([0, 0.5, -0.1], [0, 0.62, -0.1], 0.012, { color: BRASS, bone: "hips" });
  b.part(new THREE.TorusGeometry(0.05, 0.012, b.segments(8), b.segments(20)), BRASS, {
    at: [0, 0.66, -0.1],
    rotation: [0, 90, 0],
    bone: "hips",
  });

  // Legs: thigh and shin tubes, knee bulbs, brass paws.
  for (const leg of legs) {
    const { id, hip, knee, ankle } = leg;
    b.capsule(hip, knee, 0.04, { color: IRON, bone: `hip${id}` });
    b.capsule(knee, ankle, 0.028, { color: IRON, bone: `knee${id}` });
    b.part(new THREE.SphereGeometry(0.036, b.segments(10), b.segments(8)), BRASS, {
      at: knee,
      bone: `knee${id}`,
    });
    b.part(new THREE.BoxGeometry(0.07, 0.034, 0.11), BRASS, {
      at: [ankle[0], 0.017, ankle[2] + 0.02],
      bone: `ankle${id}`,
    });
  }

  // Neck and tail tubes that bend along their chains.
  b.sweep(neck, (t) => 0.05 - 0.01 * t, { color: IRON, name: "neck" });
  b.sweep(tail, (t) => 0.03 - 0.018 * t, { color: BRASS, name: "tail" });
  b.part(new THREE.SphereGeometry(0.026, b.segments(10), b.segments(8)), BRASS, {
    at: tail.at(1).at,
    bone: "tailTip",
  });

  // Head: skull, snout, nose, ears, eyes with brass bezels.
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.14), IRON, { at: [0, 0.62, 0.28], bone: "head" });
  b.capsule([0, 0.6, 0.33], [0, 0.58, 0.46], [0.045, 0.03], { color: IRON, bone: "head", name: "snout" });
  b.part(new THREE.SphereGeometry(0.022, b.segments(10), b.segments(8)), COPPER, {
    at: [0, 0.585, 0.48],
    bone: "head",
  });
  for (const sx of [1, -1]) {
    b.spike([sx * 0.045, 0.67, 0.24], [sx * 0.12, 1, -0.15], 0.07, 0.03, {
      color: IRON,
      bone: "head",
      name: "ear",
    });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), AMBER, {
      at: [sx * 0.045, 0.64, 0.35],
      bone: "head",
    });
    b.part(new THREE.TorusGeometry(0.03, 0.007, b.segments(6), b.segments(14)), BRASS, {
      at: [sx * 0.045, 0.64, 0.345],
      bone: "head",
    });
  }

  // Lower jaw hangs from the jaw joint.
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.18), BRASS, { at: [0, 0.56, 0.38], bone: "jaw" });

  return b.root;
}
