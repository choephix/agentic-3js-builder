import * as THREE from "three";
import { createBuilder, catmull, countershade, limb, line, mottle } from "../../../../src/index";

export const meta = {
  name: "lion",
  description: "A stylized standing lion with a layered mane, tufted tail, separate lower jaw and fangs.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });

  // Palette
  const BODY = "#d9a054";
  const BELLY = "#f0d39a";
  const DARK = "#2b1a10";
  const EYE = "#e7b72c";
  const TEETH = "#f5efe0";
  const PAW = "#3d2817";

  // Paints
  const coat = countershade(BODY, BELLY, { level: -0.2 });
  const mane = mottle("#a85a22", "#5e3314", { size: 0.12, seed: 3 });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.12, -0.62] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.62],
      [0, 1.18, -0.1],
      [0, 1.22, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.22, 0.42],
      [0, 1.42, 0.6],
      [0, 1.6, 0.78],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 1.62, 0.86], role: "head" });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.07 }),
    aim: head.local({ forward: 0.4, up: -0.09 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.1, -0.7],
      [0, 1.0, -1.3],
      [0, 0.92, -1.7],
      [0, 1.12, -1.95],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Legs: shoulder/hip -> elbow/knee -> wrist/hock -> paw
  const legLengths: [number, number, number] = [0.5, 0.48, 0.14];
  const legs: Record<string, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const foreRoot = [0.15 * s, 1.1, 0.38];
    const foreTarget = [0.15 * s, 0.035, 0.44];
    const fore = limb(foreRoot, foreTarget, legLengths, [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    legs[`fore${side}`] = b.chain(`fore${side}`, fore, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });

    const hindRoot = [0.15 * s, 1.1, -0.6];
    const hindTarget = [0.15 * s, 0.035, -0.56];
    const hind = limb(hindRoot, hindTarget, legLengths, [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    legs[`hind${side}`] = b.chain(`hind${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
      role: "leg",
    });
  }

  // ---- Body ---------------------------------------------------------------
  b.sweep(spine, (t: number) => [0.2 + 0.05 * Math.sin(Math.PI * t), 0.22 + 0.05 * Math.sin(Math.PI * t)], {
    color: coat,
  });

  b.sweep(neck, (t: number) => 0.17 - 0.02 * t, { color: coat });

  b.sweep(tail, (t: number) => 0.05 - 0.02 * t, { color: coat });
  const tipPt = tail.at(1);
  b.part(new THREE.SphereGeometry(0.075, 8, 6), TIP_COLOR(DARK), { bone: tipPt.bone, at: tipPt.at });

  // Legs and paws
  for (const side of ["L", "R"]) {
    const fore = legs[`fore${side}`];
    const hind = legs[`hind${side}`];
    b.sweep(fore, (t: number) => 0.1 - 0.055 * t, { color: coat });
    b.sweep(hind, (t: number) => 0.11 - 0.06 * t, { color: coat });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), PAW, {
      bone: fore.tip!,
      at: fore.tip!.at,
      scale: [1, 0.7, 1.3],
    });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), PAW, {
      bone: hind.tip!,
      at: hind.tip!.at,
      scale: [1, 0.7, 1.3],
    });
  }

  // ---- Head ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.19, 12, 9), coat, {
    bone: head,
    at: head.at,
    scale: [1, 0.95, 1.08],
  });

  // Mane: a solid core behind the head plus rings of spikes
  b.part(new THREE.SphereGeometry(0.3, 10, 8), mane, {
    bone: head,
    at: head.local({ forward: -0.12 }),
    scale: [1, 1, 0.7],
  });
  b.ring(line([0, 1.62, 0.72], [0, 1.62, 0.45]), { count: 22, radius: 0.26 }, (it) => {
    b.spike(it, it, 0.2, 0.05, { color: mane });
  });
  b.ring(line([0, 1.62, 0.62], [0, 1.62, 0.4]), { count: 16, radius: 0.2 }, (it) => {
    b.spike(it, it, 0.18, 0.04, { color: mane });
  });

  // Muzzle, nose, ears
  b.part(new THREE.SphereGeometry(0.085, 10, 8), BELLY, {
    bone: head,
    at: head.local({ forward: 0.17, up: -0.05 }),
    scale: [1, 0.8, 1.2],
  });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), DARK, {
    bone: head,
    at: head.local({ forward: 0.25, up: 0.02 }),
    scale: [1.2, 0.8, 0.9],
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055, 8, 6), coat, {
      bone: head,
      at: head.local({ left: s * 0.13, up: 0.16, back: 0.02 }),
      scale: [1, 0.8, 0.5],
    });

    // Eyes with pupils and a brow mark
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.075, up: 0.035, forward: 0.17 }),
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.075, up: 0.035, forward: 0.19 }),
    });
    b.part(new THREE.BoxGeometry(0.06, 0.012, 0.03), DARK, {
      bone: head,
      at: head.local({ left: s * 0.075, up: 0.065, forward: 0.16 }),
    });

    // Upper fang on the head
    b.spike(head.local({ left: s * 0.05, up: -0.05, forward: 0.2 }), [0, -1, 0.3], 0.06, 0.012, {
      bone: head,
      color: TEETH,
    });

    // Lower fang on the separate jaw
    b.spike(jaw.local({ left: s * 0.05, up: 0.02, forward: 0.12 }), [0, 1, 0.3], 0.05, 0.011, {
      bone: jaw,
      color: TEETH,
    });
  }

  // Lower jaw
  b.part(new THREE.BoxGeometry(0.11, 0.04, 0.2), BELLY, {
    bone: jaw,
    at: jaw.local({ forward: 0.09, up: -0.005 }),
  });

  return b.root;
}

// Helper: a flat dark colour for the tail tuft
function TIP_COLOR(c: string): string {
  return c;
}
