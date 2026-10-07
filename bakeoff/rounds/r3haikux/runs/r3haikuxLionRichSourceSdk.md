```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  interpolate,
  mottle,
  noise,
  paint,
  rgb,
  rng,
  smoothstep,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Proud old lion",
  description:
    "An old lion resting on his chest with his head held high: a golden-to-chocolate shaggy mane, a tawny coat with a cream belly and muzzle, amber eyes, a scarred brow, big padded paws and a long tail ending in a dark tuft.",
};

const DEG = Math.PI / 180;
/** Centre of the skull. */
const SKULL = new THREE.Vector3(0, 0.84, 0.6);
/** Where the golden face of the mane is brightest. */
const FACE = new THREE.Vector3(0, 0.86, 0.74);

const CREAM = "#f2e2bd";
const AMBER = "#e9a12b";
const PUPIL = "#120c08";
const NOSE = "#1c1412";
const SCAR = "#8a4a40";
const EAR = "#b97f48";
const BEAN = "#2f1f14";
const TUFT = "#2b1a0e";

// Torso profile along the spine: half-width (x) and half-height (y) at each stage.
const TORSO_T = [0, 0.3, 0.55, 0.8, 1];
const TORSO_RX = [0.2, 0.23, 0.22, 0.12, 0.1];
const TORSO_RY = [0.19, 0.21, 0.2, 0.13, 0.11];
// Limb radii, by fraction along each limb.
const LIMB_T = [0, 0.4, 0.75, 1];
const FORE_R = [0.095, 0.072, 0.05, 0.042];
const HIND_R = [0.105, 0.085, 0.062, 0.05];

const TUFT_DIRS: Array<[number, number, number]> = [
  [0.9, 0.35, -0.3],
  [-0.9, 0.35, -0.3],
  [0.5, 0.9, -0.2],
  [-0.5, 0.85, -0.25],
  [0.2, 0.6, -0.9],
  [-0.25, 0.55, -0.9],
  [0.75, 0.1, -0.7],
  [-0.7, 0.1, -0.75],
  [0, 1, -0.3],
];

/** A unit sphere stretched to the radii rx, ry, rz (meters), centred on its origin. */
function ellipsoid(rx: number, ry: number, rz: number, segments = 10) {
  const geometry = new THREE.SphereGeometry(1, segments, Math.max(6, Math.round(segments * 0.7)));
  geometry.scale(rx, ry, rz);
  return geometry;
}

const blend = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Coat: mottled tawny on the back, cream where the surface faces down.
const tawny = mottle("#c98c4e", "#a6683a", { size: 0.26, seed: 3, contrast: 1.3 });
const coat = countershade(tawny, CREAM, { level: -0.12, soft: 0.3 });

// Mane: golden blond around the face, fading to dark chocolate at the edges, with shaggy variation.
const GOLD = rgb("#f2d189");
const CHOCOLATE = rgb("#3b2212");
const maneDye = paint((p) => {
  const edge = smoothstep(0.14, 0.46, p.distanceTo(FACE)) + 0.2 * (noise(p, 0.05, 5) - 0.5);
  return blend(GOLD, CHOCOLATE, Math.min(Math.max(edge, 0), 1));
});

export default function lion() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });

  // ---- Skeleton ---------------------------------------------------------------------------
  // Pelvis at the root, a spine rising to the neck, the head on top with a hinged jaw, a long tail.
  b.joint("pelvis", { at: [0, 0.36, -0.45] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.34, -0.22],
      [0, 0.36, 0.02],
      [0, 0.44, 0.2],
      [0, 0.56, 0.36],
      [0, 0.7, 0.46],
    ]),
    { parent: "pelvis", role: "spine", names: ["spine1", "spine2", "chest", "neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: "neck2", at: [0, 0.76, 0.5], aim: [0, 0.86, 0.66], role: "head" });
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.785, 0.6], dir: [0, -0.25, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.32, -0.52],
      [0, 0.18, -0.76],
      [0.04, 0.07, -0.99],
      [0.16, 0.034, -1.16],
      [0.3, 0.05, -1.25],
      [0.38, 0.14, -1.2],
    ]),
    { parent: "pelvis", role: "tail", names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"] },
  );

  // ---- Torso --------------------------------------------------------------------------------
  // One smooth tube along the spine, carried back over the haunches and forward into the neck.
  b.sweep(spine, (t): [number, number] => [interpolate(TORSO_T, TORSO_RX, t), interpolate(TORSO_T, TORSO_RY, t)], {
    color: coat,
    extend: [0.24, 0] as const,
    sides: 10,
  });

  // ---- Legs and paws -----------------------------------------------------------------------
  // Forelegs folded under the raised chest, hind legs tucked under the haunch, each with big padded paws.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const x = 0.15 * s;
    const fore = b.chain(
      `foreLeg${side}`,
      [
        [x, 0.4, 0.2],
        [x, 0.22, 0.12],
        [x, 0.1, 0.36],
        [x, 0.05, 0.46],
      ],
      {
        parent: "chest",
        role: "leg",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `frontPaw${side}`],
      },
    );
    b.sweep(fore, (t) => interpolate(LIMB_T, FORE_R, t), { color: tawny, sides: 8 });
    b.part(ellipsoid(0.075, 0.05, 0.088), tawny, { at: [x, 0.05, 0.48], bone: `frontPaw${side}` });
    for (const k of [-1.5, -0.5, 0.5, 1.5])
      b.part(ellipsoid(0.02, 0.018, 0.02), BEAN, { at: [x + k * 0.026, 0.032, 0.548], bone: `frontPaw${side}` });

    const hx = 0.16 * s;
    const hind = b.chain(
      `hindLeg${side}`,
      [
        [hx, 0.36, -0.4],
        [hx * 1.1, 0.19, -0.16],
        [hx, 0.07, -0.46],
        [hx, 0.04, -0.26],
      ],
      {
        parent: "pelvis",
        role: "leg",
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
      },
    );
    b.sweep(hind, (t) => interpolate(LIMB_T, HIND_R, t), { color: tawny, sides: 8 });
    b.part(ellipsoid(0.08, 0.055, 0.092), tawny, { at: [hx, 0.052, -0.24], bone: `hindPaw${side}` });
    for (const k of [-1.5, -0.5, 0.5, 1.5])
      b.part(ellipsoid(0.022, 0.018, 0.02), BEAN, { at: [hx + k * 0.028, 0.03, -0.158], bone: `hindPaw${side}` });
  }

  // ---- Tail with a dark tuft --------------------------------------------------------------
  b.sweep(tail, (t) => 0.05 - 0.03 * t, { color: tawny, sides: 8 });
  b.part(ellipsoid(0.055, 0.055, 0.06), TUFT, { at: [0.38, 0.14, -1.2], bone: "tail6" });
  for (const dir of TUFT_DIRS) b.spike([0.38, 0.14, -1.2], dir, 0.1, 0.022, { color: TUFT, bone: "tail6" });

  // ---- Head ---------------------------------------------------------------------------------
  // Skull, cream muzzle and cheeks, a broad black nose, and a separate lower jaw.
  const skull = b.part(ellipsoid(0.1, 0.1, 0.11), coat, { at: SKULL, bone: head });
  b.capsule([0, 0.83, 0.6], [0, 0.815, 0.8], [0.062, 0.05], { color: CREAM, bone: head });
  for (const s of [1, -1])
    b.part(ellipsoid(0.04, 0.036, 0.05), CREAM, { at: [s * 0.055, 0.81, 0.74], bone: head });
  b.part(ellipsoid(0.034, 0.022, 0.026), NOSE, { at: [0, 0.83, 0.845], bone: head });
  b.capsule([0, 0.79, 0.6], [0, 0.775, 0.79], [0.036, 0.03], { color: CREAM, bone: jaw });

  // Eyes, pupils and ears, each seated on the real skull (or eye) surface.
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = b.stick(ellipsoid(0.026, 0.024, 0.024), AMBER, skin.nearest([s * 0.058, 0.872, 0.69]), {
      embed: 0.6,
    });
    b.stick(ellipsoid(0.01, 0.007, 0.009), PUPIL, b.surface(eye).nearest([s * 0.078, 0.882, 0.75]), {
      embed: 0.3,
    });
    b.stick(ellipsoid(0.036, 0.012, 0.03), EAR, skin.nearest([s * 0.07, 0.955, 0.57]), { embed: 0.5 });
  }

  // The scar: a short rod laid across one brow, its ends seated on the skull.
  const scarA = skin.nearest([0.095, 0.9, 0.655]);
  const scarB = skin.nearest([0.03, 0.932, 0.7]);
  b.rod(scarA.at.addScaledVector(scarA.n, 0.003), scarB.at.addScaledVector(scarB.n, 0.003), 0.0055, {
    color: SCAR,
    name: "scar",
  });

  // ---- Mane ---------------------------------------------------------------------------------
  // Tapered strands rooted inside the skull and flowing out and down over the neck and shoulders.
  // Strands in front are short, so the face stays open.
  const hair = rng(21);
  const off = (dx: number, dy: number, dz: number) => SKULL.clone().add(new THREE.Vector3(dx, dy, dz));
  const strand = (points: THREE.Vector3[], r0: number, r1: number) =>
    b.sweep(catmull(points), (t) => r0 + (r1 - r0) * t, {
      color: maneDye,
      bone: head,
      sides: 6,
      caps: { start: "none", end: "point" },
    });

  // Outer ruff: long, heavy strands.
  for (let i = 0; i < 64; i++) {
    const theta = ((i + 0.1 + 0.8 * hair()) / 64) * Math.PI * 2;
    const sx = Math.sin(theta);
    const cz = Math.cos(theta);
    if (cz > 0.6) continue;
    const back = Math.max(0, -cz);
    const reach = (0.22 + 0.1 * hair()) * (cz > 0.2 ? 0.7 : 1);
    const droop = 0.06 + 0.17 * back + 0.05 * hair();
    const jig = () => (hair() - 0.5) * 0.05;
    strand(
      [
        off(sx * 0.05, -0.02, cz * 0.05),
        off(sx * reach * 0.55, 0.02 - droop * 0.3, cz * reach * 0.55),
        off(sx * reach + jig(), -droop, cz * reach + jig()),
      ],
      0.03 + 0.008 * hair(),
      0.005,
    );
  }

  // Inner layer: shorter strands filling the gaps.
  for (let i = 0; i < 44; i++) {
    const theta = ((i + 0.5 + 0.6 * (hair() - 0.5)) / 44) * Math.PI * 2;
    const sx = Math.sin(theta);
    const cz = Math.cos(theta);
    if (cz > 0.5) continue;
    const reach = 0.13 + 0.08 * hair();
    const droop = 0.03 + 0.1 * Math.max(0, -cz) + 0.04 * hair();
    strand(
      [
        off(sx * 0.03, -0.01, cz * 0.03),
        off(sx * reach * 0.5, -droop * 0.3, cz * reach * 0.5),
        off(sx * reach, -droop, cz * reach),
      ],
      0.024,
      0.004,
    );
  }

  // Crown: a few strands lifting off the top and back of the skull.
  for (let i = 0; i < 14; i++) {
    const theta = ((i + 0.5) / 14) * Math.PI * 2 + 0.3 * hair();
    const cz = Math.cos(theta);
    if (cz > 0.2) continue;
    const lift = (42 + 28 * hair()) * DEG;
    const d = [Math.sin(theta) * Math.cos(lift), Math.sin(lift), cz * Math.cos(lift)];
    const point = (k: number) => off(d[0] * k, d[1] * k, d[2] * k);
    strand([point(0.04), point(0.12), point(0.2)], 0.02, 0.004);
  }

  return b.root;
}
```