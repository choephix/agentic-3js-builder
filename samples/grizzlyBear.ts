import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { countershade, gradient, mottle, paint, patches } from "../src/paint";
import { rng } from "../src/math";
import { svg } from "../src/texture";

const COAT_BASE = "#5b3826";
const COAT_DARK = "#2a1712";
const COAT_LIGHT = "#8a5a38";
const MUZZLE = "#bb8b63";
const NOSE = "#171313";
const EYE = "#d59a35";
const PUPIL = "#17100d";
const CLAW = "#c7a46a";
const PAD = "#2c1815";
const MOUTH = "#421b1d";
const TONGUE = "#ad4f53";
const SCAR = "#a96a48";

const coatMottle = countershade(
  mottle(COAT_BASE, COAT_LIGHT, { size: 0.17, contrast: 0.62, seed: 42 }),
  "#3c2119",
  { level: -0.22, soft: 0.2 },
);
const legCoat = gradient(coatMottle, COAT_DARK, [0, 0.36, 0], [0, 0.09, 0]);
const muzzlePaint = patches(MUZZLE, ["#d3a178", "#9d6c4b"], { size: 0.11, gap: 0.025, seed: 9 });
const scarPaint = paint((p, _n, _s) => (p.x * p.z > 0 ? SCAR : COAT_LIGHT));

const furTuft = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 64 C8 50 9 39 4 29 C10 31 13 26 16 17 C19 26 22 31 28 29 C23 40 24 51 16 64Z" fill="#ffffff"/>
    <path d="M16 59 C13 47 15 37 16 25 C18 38 20 47 16 59Z" fill="#bdbdbd" opacity=".42"/>
  </svg>`,
  { size: 128 },
);

export const meta = {
  name: "Grizzly Bear",
  description: "A broad-shouldered grizzly bear prowling on all fours, with shaggy fur, expressive eyes, heavy paws and worn claws.",
  style: "Blizzard/Warcraft",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "grizzlyBear", detail: 1, paintSize: 2048 });

  // Skeleton first: one articulated root, spine/neck/head/jaw, tail, and four complete legs.
  const hips = b.joint("hips", { at: [0, 0.76, -0.24], role: "spine" });
  const spinePath = catmull([
    [0, 0.77, -0.62],
    [0, 0.82, -0.3],
    [0, 0.88, 0.02],
    [0, 0.94, 0.32],
    [0, 0.97, 0.49],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineChest", "spineShoulder", "spineTip"],
    role: "spine",
  });

  const neckPath = catmull([
    spine.tip!.at,
    [0, 1.08, 0.58],
    [0, 1.2, 0.65],
    [0, 1.28, 0.69],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neckBase", "neckMid", "neckTop", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: neck.tip!.at, dir: [0, 0.18, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.12, -0.16]), aim: head.local([0, 0.37, -0.14]), role: "jaw", group: "head" });

  const tailPath = catmull([
    hips.at,
    [0, 0.73, -0.63],
    [0, 0.68, -0.91],
    [0, 0.69, -1.15],
    [0, 0.76, -1.34],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tailMid", "tailTurn", "tailTip", "tailEnd"],
    role: "tail",
  });

  const legTargets = {
    frontL: [0.32, 0.1, 0.43] as [number, number, number],
    frontR: [-0.32, 0.1, 0.43] as [number, number, number],
    hindL: [0.36, 0.1, -0.6] as [number, number, number],
    hindR: [-0.36, 0.1, -0.6] as [number, number, number],
  };
  const frontRoots = {
    L: [0.28, 0.83, 0.34] as [number, number, number],
    R: [-0.28, 0.83, 0.34] as [number, number, number],
  };
  const hindRoots = {
    L: [0.29, 0.78, -0.39] as [number, number, number],
    R: [-0.29, 0.78, -0.39] as [number, number, number],
  };
  const legs: Record<string, Chain> = {};
  for (const side of ["L", "R"] as const) {
    const frontPts = limb(frontRoots[side], legTargets[`front${side}`], [0.3, 0.3, 0.27], [[0, 0, 1], [0, 0, -1]]);
    legs[`front${side}`] = b.chain(`frontLeg${side}`, frontPts, {
      parent: spine.joints[3],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
      contact: legTargets[`front${side}`],
    });
    const hindPts = limb(hindRoots[side], legTargets[`hind${side}`], [0.34, 0.3, 0.3], [[0, 0, -1], [0, 0, 1]]);
    legs[`hind${side}`] = b.chain(`hindLeg${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
      role: "leg",
      contact: legTargets[`hind${side}`],
    });
  }

  const toeChains: Array<{ chain: Chain; side: 1 | -1; z: number; label: string }> = [];
  for (const side of [1, -1] as const) {
    for (const front of [true, false]) {
      const leg = legs[`${front ? "front" : "hind"}${side === 1 ? "L" : "R"}`];
      const legTip = leg.tip!;
      const base = legTip.at;
      const toeZ = front ? 0.08 : 0.04;
      const toeXs = [-0.095, 0, 0.095];
      toeXs.forEach((spread, i) => {
        const x = base.x + spread;
        const tip: [number, number, number] = [x, 0.09, base.z + toeZ];
        const chain = b.chain(`toe${front ? "F" : "H"}${side === 1 ? "L" : "R"}${i}`, [base, tip], {
          parent: legTip,
          names: [`toeBase${front ? "F" : "H"}${side === 1 ? "L" : "R"}${i}`, `toeTip${front ? "F" : "H"}${side === 1 ? "L" : "R"}${i}`],
          role: "digit",
          contact: tip,
        });
        toeChains.push({ chain, side, z: toeZ, label: `${front ? "front" : "hind"}${side === 1 ? "L" : "R"}${i}` });
      });
    }
  }

  // Main silhouette: a low, massive body with a raised shoulder and heavy rump.
  const bodyPath = catmull([
    [0, 0.82, -0.84],
    [0, 0.84, -0.55],
    [0, 0.85, -0.24],
    [0, 0.9, 0.08],
    [0, 0.98, 0.38],
    [0, 1.0, 0.56],
  ]);
  const body = b.sweep(bodyPath, (t) => 0.36 + 0.1 * Math.sin(Math.PI * t), {
    bone: [hips, spine],
    section: { ngon: 8 },
    color: coatMottle,
    group: "body",
    name: "bodyMass",
  });
  const spineFur = b.sweep(spine, (t) => 0.36 + 0.1 * Math.sin(Math.PI * t), {
    bone: spine,
    section: { ngon: 8 },
    color: coatMottle,
    group: "body",
    name: "spineFur",
    caps: "none",
  });
  const neckMass = b.sweep(neck, [0.29, 0.24], { bone: neck, section: { ngon: 8 }, color: coatMottle, group: "neck", name: "neckMass" });
  b.sweep(tail, (t) => 0.19 * (1 - t) + 0.055, {
    bone: tail,
    section: { ngon: 8 },
    color: legCoat,
    group: "tail",
    name: "tailMass",
    caps: { start: "flat", end: "point" },
  });

  // Shoulder hump and cheek masses reinforce the heroic, chunky Warcraft silhouette.
  b.part(new THREE.SphereGeometry(1, 12, 8), coatMottle, {
    bone: spine.joints[3],
    at: spine.joints[3].at,
    scale: [0.43, 0.46, 0.37],
    group: "body",
    name: "shoulderHump",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), coatMottle, {
    bone: hips,
    at: hips.at,
    scale: [0.4, 0.4, 0.43],
    group: "body",
    name: "rumpMass",
  });

  // Legs, paws, pads and claws.
  for (const side of ["L", "R"] as const) {
    const front = legs[`front${side}`];
    const hind = legs[`hind${side}`];
    b.sweep(front, (t) => 0.13 - 0.035 * t, { bone: front, section: { ngon: 6 }, color: legCoat, group: "legs", name: `frontLegFur${side}` });
    b.sweep(hind, (t) => 0.15 - 0.04 * t, { bone: hind, section: { ngon: 6 }, color: legCoat, group: "legs", name: `hindLegFur${side}` });
    const frontTip = front.tip!;
    const hindTip = hind.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 6), legCoat, { bone: frontTip, at: frontTip.at, scale: [0.18, 0.1, 0.2], group: "paws", name: `frontPaw${side}` });
    b.part(new THREE.SphereGeometry(1, 10, 6), legCoat, { bone: hindTip, at: hindTip.at, scale: [0.2, 0.1, 0.22], group: "paws", name: `hindPaw${side}` });
    b.part(new THREE.SphereGeometry(1, 8, 5), PAD, { bone: frontTip, at: [frontTip.at.x, 0.065, frontTip.at.z + 0.02], scale: [0.11, 0.025, 0.1], group: "paws", name: `frontPad${side}` });
    b.part(new THREE.SphereGeometry(1, 8, 5), PAD, { bone: hindTip, at: [hindTip.at.x, 0.065, hindTip.at.z + 0.01], scale: [0.12, 0.025, 0.11], group: "paws", name: `hindPad${side}` });
    for (const clawX of [-0.09, 0, 0.09]) {
      b.spike(
        [frontTip.at.x + clawX, 0.085, frontTip.at.z + 0.13],
        [0, -0.12, 1],
        0.11,
        0.02,
        { bone: frontTip, color: CLAW, group: "claws", name: `frontClaw${side}${clawX}` },
      );
    }
  }
  for (const toe of toeChains) {
    b.sweep(toe.chain, [0.035, 0.018], { bone: toe.chain, section: { ngon: 5 }, color: legCoat, group: "digits", name: `toeFur${toe.label}` });
    b.spike(toe.chain.tip!, toe.chain.tip!, 0.09, 0.018, { color: CLAW, group: "claws", name: `claw${toe.label}` });
  }

  // Head and face. The jaws remain separate for animation and readable rigging.
  b.part(new THREE.SphereGeometry(1, 14, 10), coatMottle, {
    bone: head,
    at: head.at,
    scale: [0.3, 0.3, 0.31],
    group: "head",
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), muzzlePaint, {
    bone: head,
    at: head.local([0, 0.23, -0.04]),
    scale: [0.23, 0.2, 0.17],
    group: "head",
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), NOSE, {
    bone: head,
    at: head.local([0, 0.39, 0.0]),
    scale: [0.12, 0.08, 0.085],
    group: "face",
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), MOUTH, {
    bone: jaw,
    at: jaw.at,
    scale: [0.2, 0.19, 0.095],
    group: "jaw",
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), TONGUE, {
    bone: jaw,
    at: jaw.local([0, 0.11, -0.07]),
    scale: [0.075, 0.11, 0.025],
    group: "jaw",
    name: "tongue",
  });
  for (const side of [1, -1] as const) {
    const eyeAt = head.local([side * 0.18, 0.18, 0.075]);
    b.part(new THREE.SphereGeometry(0.055, 10, 7), EYE, { bone: head, at: eyeAt, group: "face", name: `eyeAmber${side}` });
    b.part(new THREE.SphereGeometry(0.029, 8, 6), PUPIL, { bone: head, at: head.local([side * 0.18, 0.218, 0.075]), group: "face", name: `eyePupil${side}` });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#fff0c6", { bone: head, at: head.local([side * 0.165, 0.237, 0.091]), group: "face", name: `eyeGlint${side}` });
    const earAt = head.local([side * 0.22, -0.015, 0.23]);
    b.part(new THREE.SphereGeometry(1, 10, 7), coatMottle, {
      bone: head,
      at: earAt,
      scale: [0.13, 0.09, 0.12],
      group: "ears",
      name: `earOuter${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, {
      bone: head,
      at: head.local([side * 0.22, 0.015, 0.25]),
      scale: [0.075, 0.035, 0.07],
      group: "ears",
      name: `earInner${side}`,
    });
    b.part(new THREE.SphereGeometry(0.017, 7, 5), NOSE, { bone: head, at: head.local([side * 0.11, 0.41, 0.03]), group: "face", name: `nostril${side}` });
  }

  // Small scar/wear planes and painted face accents give the broad simple forms a hand-painted finish.
  for (const side of [1, -1] as const) {
    const cheek = b.surface(head).around(head.at).at(side * 55, 8);
    if (cheek) {
      b.stick(new THREE.SphereGeometry(0.075, 7, 5), scarPaint, cheek, { embed: 0.35, group: "face", name: `cheekMark${side}` });
    }
  }
  const shoulderMark = b.surface(body).around([0, 0.95, 0.34]).at(0, 38);
  if (shoulderMark) b.stick(new THREE.SphereGeometry(0.13, 8, 5), SCAR, shoulderMark, { embed: 0.45, group: "body", name: "shoulderMark" });

  // Dense, directional fur cards on the back and neck; sparse enough to preserve faceted masses.
  const bodyFurHits = b.surface([body, spineFur, neckMass]).scatter(82, {
    rng: rng(21),
    minDist: 0.055,
    filter: (hit) => hit.n.y > -0.4 && hit.at.y > 0.7,
  });
  b.cards(bodyFurHits, furTuft, {
    size: [0.045, 0.13],
    lean: 48,
    bend: 20,
    vary: 0.3,
    rng: rng(22),
    color: coatMottle,
    group: "furCards",
  });
  const headFurHits = b.surface(head).scatter(24, {
    rng: rng(23),
    minDist: 0.045,
    filter: (hit) => hit.n.y > -0.25 && hit.at.y > 1.05,
  });
  b.cards(headFurHits, furTuft, {
    size: [0.035, 0.095],
    lean: 38,
    bend: 15,
    vary: 0.24,
    rng: rng(24),
    color: coatMottle,
    group: "faceFur",
  });
  const maneHits = b.surface(neckMass).scatter(42, {
    rng: rng(25),
    minDist: 0.04,
    filter: (hit) => hit.n.y > -0.1 && hit.n.z > -0.55,
  });
  b.cards(maneHits, furTuft, {
    size: [0.05, 0.16],
    lean: 34,
    bend: 25,
    vary: 0.28,
    rng: rng(26),
    color: COAT_DARK,
    group: "mane",
  });

  // Bright shoulder ridge and small dorsal tufts break up the silhouette.
  const ridge = b.surface(body).loop(spine.joints[3], { lift: 0.012 });
  b.along(ridge, 9, (at) => {
    const i = Math.floor(at.t * 9);
    b.part(new THREE.SphereGeometry(0.026 + (i % 2) * 0.008, 6, 4), COAT_LIGHT, {
      at,
      group: "furTrim",
      name: `ridgeTuft${i}`,
    });
  });
  b.along(tail, 5, (at) => {
    const i = Math.floor(at.t * 5);
    b.spike(at, at, 0.06 + i * 0.01, 0.018, { color: COAT_LIGHT, group: "tail", name: `tailTuft${i}` });
  });

  // A few blunt teeth are visible even at rest, while the jaw remains a true hinge.
  for (const side of [1, -1] as const) {
    b.spike(jaw.local([side * 0.1, 0.2, 0.03]), [0, -1, 0], 0.045, 0.018, { color: CLAW, group: "teeth", name: `tooth${side}` });
  }

  return b.root;
}
