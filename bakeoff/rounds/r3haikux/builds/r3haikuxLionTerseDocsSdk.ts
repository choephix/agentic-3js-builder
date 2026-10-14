import * as THREE from "three";
import { catmull, countershade, createBuilder, limb, mottle, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description: "A maned male lion at rest: golden coat, dark mane, amber eyes, a jointed jaw and a tufted tail.",
};

const GOLD = "#d19a4f";
const OCHRE = "#b07434";
const TAN = "#f0cd93";
const CREAM = "#f6e7c6";
const MANE_DARK = "#3a2112";
const MANE_MID = "#86522b";
const BLACK = "#1c120c";
const AMBER = "#f3b53a";
const MOUTH = "#8e3c3c";
const TEETH = "#f8f2e2";
const CLAW = "#eedfb8";
const EAR_IN = "#6e3d2c";

// Tufts drawn in greys, so the mane colour tints them.
const TUFT_A = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M5 80 C1 58 9 36 20 2 C27 30 39 54 35 80 Z" fill="#ffffff"/>
<path d="M14 80 C12 60 16 40 20 18" fill="none" stroke="#8a8a8a" stroke-width="2.4" stroke-linecap="round"/>
<path d="M27 80 C28 62 25 46 21 30" fill="none" stroke="#a9a9a9" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const TUFT_B = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M3 80 C0 62 6 50 12 42 C7 32 13 16 21 2 C25 18 33 28 35 42 C40 56 38 70 35 80 Z" fill="#ffffff"/>
<path d="M11 78 C12 62 17 50 22 36" fill="none" stroke="#7f7f7f" stroke-width="2.4" stroke-linecap="round"/>
<path d="M28 78 C27 64 30 54 33 46" fill="none" stroke="#9c9c9c" stroke-width="2" stroke-linecap="round"/>
</svg>`;

type Key = [number, number, number];

// Smooth piecewise ramp through keys [t, a, b]; returns [a, b] at t.
function ramp(keys: Key[]): (t: number) => [number, number] {
  return (t) => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      const [t1, a1, b1] = keys[i];
      if (t <= t1) {
        const [t0, a0, b0] = keys[i - 1];
        const u0 = (t - t0) / (t1 - t0);
        const u = u0 * u0 * (3 - 2 * u0);
        return [a0 + (a1 - a0) * u, b0 + (b1 - b0) * u];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };
}

export default function build() {
  const b = createBuilder({ name: "lion" });

  // Paints and textures
  const coat = countershade(mottle(GOLD, OCHRE, { size: 0.3, contrast: 0.35, seed: 3 }), TAN, { level: -0.15 });
  const maneTint = mottle(MANE_DARK, MANE_MID, { size: 0.1, contrast: 0.6, seed: 9 });
  const tufts = [svg(TUFT_A, { size: 192 }), svg(TUFT_B, { size: 192 })];

  // Spine: hips (root) -> back -> chest -> withers (tip)
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.55],
      [0, 1.0, -0.2],
      [0, 1.03, 0.2],
      [0, 1.08, 0.42],
    ]),
    { names: ["hips", "back", "chest", "withers"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  b.sweep(spine, ramp([[0, 0.19, 0.2], [0.35, 0.22, 0.22], [0.7, 0.24, 0.22], [1, 0.2, 0.19]]), {
    color: coat,
    sides: 12,
    shift: [0, -0.02],
  });

  // Neck, ending at the head joint
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.08, 0.42],
      [0, 1.14, 0.62],
      [0, 1.2, 0.8],
      [0, 1.24, 0.9],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  const head = neck.tip!;
  b.sweep(neck, (t) => 0.19 - 0.035 * t, { color: coat, sides: 10 });

  // Head: skull, cream muzzle, nose, mouth
  const hp = (f: number, u: number) => head.local({ forward: f, up: u });
  const center = hp(-0.02, 0);

  b.loft(
    [
      { at: hp(-0.13, 0), w: 0.2, h: 0.22 },
      { at: hp(-0.04, 0.01), w: 0.27, h: 0.27 },
      { at: hp(0.04, 0), w: 0.26, h: 0.25 },
      { at: hp(0.08, -0.01), w: 0.22, h: 0.2 },
    ],
    { bone: head, color: coat },
  );
  b.loft(
    [
      { at: hp(0.0, -0.05), w: 0.2, h: 0.17 },
      { at: hp(0.09, -0.06), w: 0.2, h: 0.15 },
      { at: hp(0.15, -0.06), w: 0.17, h: 0.13 },
    ],
    { bone: head, color: CREAM },
  );
  b.part(new THREE.SphereGeometry(0.045, 10, 7), BLACK, {
    bone: head,
    at: hp(0.2, 0.01),
    scale: [1.3, 0.85, 0.85],
    flat: true,
  });
  b.loft(
    [
      { at: hp(0.0, -0.13), w: 0.13, h: 0.04 },
      { at: hp(0.17, -0.135), w: 0.09, h: 0.035 },
    ],
    { bone: head, color: MOUTH },
  );

  // Ears: short discs on the crown with dark insides
  for (const s of [1, -1]) {
    const ear = b.surface(head).around(center).at(s * 55, 45);
    if (!ear) continue;
    b.stick(new THREE.CylinderGeometry(0.05, 0.055, 0.03, 10), coat, ear, { embed: 0.5 });
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), EAR_IN, ear.moved([0, 0.012, 0]), { embed: 0.2 });
  }

  // Eyes: dark rim, amber iris, dark pupil
  for (const s of [1, -1]) {
    const eye = b.surface(head).around(center).at(s * 40, 18);
    if (!eye) continue;
    b.stick(new THREE.SphereGeometry(0.036, 10, 8), BLACK, eye, { embed: 0.6 });
    b.stick(new THREE.SphereGeometry(0.026, 10, 8), AMBER, eye, { embed: 0.35 });
    b.stick(new THREE.SphereGeometry(0.012, 8, 6), BLACK, eye.moved([0, 0.03, 0]), { embed: 0.2 });
  }

  // Lower jaw on its own joint, opened a little, with two fangs
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(-0.03, -0.13),
    aim: hp(0.2, -0.16),
    role: "jaw",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  const jp = (f: number, u: number) => jaw.local({ forward: f, up: u });
  b.loft(
    [
      { at: jp(-0.02, 0), w: 0.12, h: 0.06 },
      { at: jp(0.06, -0.01), w: 0.15, h: 0.06 },
      { at: jp(0.14, -0.02), w: 0.12, h: 0.05 },
      { at: jp(0.19, -0.025), w: 0.08, h: 0.045 },
    ],
    { bone: jaw, color: CREAM },
  );
  for (const s of [1, -1]) {
    b.spike(jaw.local({ left: s * 0.045, forward: 0.13, up: -0.005 }), [0, 1, 0], 0.028, 0.011, {
      color: TEETH,
      bone: jaw,
    });
  }

  // Legs. Forelimbs: shoulder -> elbow -> wrist, paw on the floor.
  // Hind legs: hip -> knee -> hock -> foot.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fore = limb([s * 0.15, 1.0, 0.32], [s * 0.16, 0.13, 0.42], [0.5, 0.44], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, fore, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.1, 0.05], { color: coat, sides: 8 });
    const wrist = arm.tip!;
    b.part(new THREE.SphereGeometry(0.06, 10, 7), coat, {
      bone: wrist,
      at: wrist.local({ forward: 0.03, up: -0.08 }),
      scale: [1.15, 0.85, 1.35],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.spike(wrist.local({ left: k * 0.03, forward: 0.11, up: -0.07 }), [0, -0.5, 1], 0.03, 0.01, {
        color: CLAW,
        bone: wrist,
      });
    }

    const hind = limb([s * 0.15, 0.98, -0.45], [s * 0.16, 0.05, -0.5], [0.42, 0.4, 0.2], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.12, 0.05], { color: coat, sides: 8 });
    const foot = leg.tip!;
    b.part(new THREE.SphereGeometry(0.065, 10, 7), coat, {
      bone: foot,
      at: foot.local({ forward: 0.02 }),
      scale: [1.1, 0.75, 1.3],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.spike(foot.local({ left: k * 0.03, forward: 0.1, up: -0.01 }), [0, -0.5, 1], 0.03, 0.01, {
        color: CLAW,
        bone: foot,
      });
    }
  }

  // Tail: long, hanging, with a dark brush at the end
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.6],
      [0, 0.95, -0.9],
      [0, 0.72, -1.12],
      [0, 0.4, -1.22],
      [0, 0.2, -1.2],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.055 - 0.025 * t, { color: coat, sides: 8 });
  const tip = tail.tip!;
  b.part(new THREE.SphereGeometry(0.055, 8, 6), MANE_DARK, {
    bone: tip,
    at: tip.at,
    scale: [1, 1.4, 1],
    flat: true,
  });
  b.cards(b.ring(tip, { count: 12, radius: 0.035, tilt: -10 }).items, tufts, {
    size: [0.09, 0.15],
    lean: 25,
    bend: 20,
    cross: true,
    vary: 0.2,
    spin: 30,
    rng: rng(21),
    color: MANE_DARK,
  });

  // Mane: three layered rings of tufts around the head, two around the neck
  b.cards(b.ring(head, { count: 24, radius: 0.17, fromDeg: 60, toDeg: 300, tilt: -12 }).items, tufts, {
    size: [0.1, 0.16],
    lean: 30,
    bend: 25,
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(31),
    color: maneTint,
  });
  b.cards(b.ring(head, { count: 26, radius: 0.23, fromDeg: 70, toDeg: 290, tilt: -15 }).items, tufts, {
    size: [0.12, 0.2],
    lean: 36,
    bend: 25,
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(32),
    color: maneTint,
  });
  b.cards(b.ring(head, { count: 24, radius: 0.28, fromDeg: 80, toDeg: 280, tilt: -25 }).items, tufts, {
    size: [0.13, 0.22],
    lean: 45,
    bend: 30,
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(33),
    color: maneTint,
  });
  b.cards(b.ring(neck.at(0.35), { count: 20, radius: 0.22, tilt: -30 }).items, tufts, {
    size: [0.12, 0.2],
    lean: 40,
    bend: 25,
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(34),
    color: maneTint,
  });
  b.cards(b.ring(neck.at(0.75), { count: 18, radius: 0.2, tilt: -25 }).items, tufts, {
    size: [0.11, 0.18],
    lean: 40,
    bend: 25,
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(35),
    color: maneTint,
  });

  return b.root;
}
