import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "dragonfly",
  description:
    "A perched dragonfly: jewel-blue ringed abdomen, green-gold thorax, turquoise compound eyes, six jointed legs and four veined wings.",
};

// Design numbers are written at twice the final size; S scales them to metres (about 10 cm long, 8 cm wingspan).
const S = 0.5;
const q = (a: number[]): [number, number, number] => [a[0] * S, a[1] * S, a[2] * S];
const k = (v: number) => v * S;
const o = (pts: number[][]) => pts.map(([u, v]) => [u * S, v * S]);
const sphere = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);

const BODY = "#2f7d4a";
const THORAX_STRIPE = "#e6cf48";
const ABDOMEN = "#1d6fb5";
const BAND = "#101b27";
const EYE = "#2aa3c2";
const EYE_HI = "#d9f7ff";
const LEG = "#1b1b1b";
const WING = "#bfe7f2";
const VEIN = "#2c4150";
const PTERO = "#2a2018";

// Wing outlines in (span, chord) design units.
const FOREWING = [
  [0, 0.005], [0.03, 0.009], [0.066, 0.008], [0.08, 0.003],
  [0.074, -0.002], [0.05, -0.005], [0.02, -0.006], [0, -0.004],
];
const HINDWING = [
  [0, 0.008], [0.03, 0.011], [0.062, 0.012], [0.07, 0.004],
  [0.064, -0.006], [0.035, -0.01], [0, -0.007],
];

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---- Skeleton -----------------------------------------------------------
  const thorax = b.joint("thorax", { at: q([0, 0.03, 0]) });
  const head = b.joint("head", { at: q([0, 0.043, 0.05]), parent: thorax });

  const abdomen = b.chain(
    "abdomen",
    [
      q([0, 0.03, -0.01]),
      q([0, 0.033, -0.03]),
      q([0, 0.034, -0.05]),
      q([0, 0.033, -0.07]),
      q([0, 0.03, -0.09]),
      q([0, 0.026, -0.11]),
      q([0, 0.022, -0.13]),
    ],
    { role: "tail" },
  );

  // Six legs: three pairs, splayed out for a perched rest pose.
  const legSpecs = [
    { id: "1", hip: [0.008, 0.035, 0.016], knee: [0.026, 0.02, 0.022], foot: [0.046, 0, 0.03] },
    { id: "2", hip: [0.009, 0.032, 0.0], knee: [0.03, 0.018, 0.0], foot: [0.05, 0, -0.004] },
    { id: "3", hip: [0.008, 0.03, -0.014], knee: [0.026, 0.02, -0.02], foot: [0.044, 0, -0.034] },
  ];
  const legs: { chain: ReturnType<typeof b.chain>; foot: number[] }[] = [];
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    for (const L of legSpecs) {
      const pts = [L.hip, L.knee, L.foot].map(([x, y, z]) => q([x * side, y, z]));
      const chain = b.chain(`leg${tag}${L.id}`, pts, { role: "leg" });
      legs.push({ chain, foot: pts[2] });
    }
  }

  // ---- Thorax ---------------------------------------------------------------
  b.part(sphere(16, 12), BODY, { at: q([0, 0.03, 0]), bone: thorax, scale: q([0.012, 0.013, 0.021]) });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(k(0.003), k(0.009), k(0.009)), THORAX_STRIPE, {
      at: q([s * 0.0105, 0.031, -0.002]),
      bone: thorax,
    });
    b.part(new THREE.BoxGeometry(k(0.003), k(0.006), k(0.006)), THORAX_STRIPE, {
      at: q([s * 0.0105, 0.031, 0.008]),
      bone: thorax,
    });
  }

  // ---- Head and eyes ----------------------------------------------------------
  b.part(sphere(14, 10), BODY, { at: q([0, 0.043, 0.05]), bone: head, scale: q([0.0085, 0.0085, 0.0085]) });
  for (const s of [1, -1]) {
    b.part(sphere(20, 14), EYE, {
      at: q([s * 0.0068, 0.046, 0.054]),
      bone: head,
      scale: q([0.0105, 0.0115, 0.0105]),
    });
    b.part(sphere(8, 6), EYE_HI, {
      at: q([s * 0.0075, 0.05, 0.062]),
      bone: head,
      scale: q([0.0025, 0.0025, 0.0025]),
    });
    b.sweep(
      [
        q([s * 0.002, 0.05, 0.056]),
        q([s * 0.006, 0.056, 0.06]),
        q([s * 0.01, 0.058, 0.064]),
      ],
      k(0.0007),
      { color: LEG },
    );
  }

  // ---- Abdomen ----------------------------------------------------------------
  b.sweep(abdomen, k(0.0045), { color: ABDOMEN });
  b.along(abdomen, 8, (at) => {
    b.part(sphere(12, 8), BAND, { at, scale: q([0.0047, 0.0047, 0.0014]) });
  });
  // Club-tipped end and forked claspers (cerci).
  b.part(sphere(12, 10), ABDOMEN, { at: q([0, 0.022, -0.13]), scale: q([0.0055, 0.0055, 0.008]) });
  for (const s of [1, -1]) {
    b.spike(q([s * 0.002, 0.022, -0.13]), [s * 0.6, -0.1, -1], k(0.012), k(0.0018));
  }

  // ---- Legs ------------------------------------------------------------------
  for (const leg of legs) {
    b.sweep(leg.chain, k(0.0012), { color: LEG });
    b.part(sphere(6, 4), LEG, { at: leg.foot, scale: q([0.002, 0.0012, 0.002]) });
  }

  // ---- Wings (horizontal, spread out) ----------------------------------------
  for (const s of [1, -1]) {
    const x: [number, number, number] = [s, 0, 0];
    const y: [number, number, number] = [0, 0, 1];

    b.extrude(o(FOREWING), { at: q([s * 0.003, 0.042, 0.018]), x, y, color: WING });
    b.extrude(o(HINDWING), { at: q([s * 0.003, 0.04, -0.008]), x, y, color: WING });

    // Veins on the forewing and hindwing.
    b.sweep(
      [q([s * 0.002, 0.044, 0.018]), q([s * 0.03, 0.044, 0.016]), q([s * 0.066, 0.044, 0.013])],
      k(0.0005),
      { color: VEIN },
    );
    b.sweep(
      [q([s * 0.002, 0.044, -0.008]), q([s * 0.03, 0.044, -0.01]), q([s * 0.062, 0.044, -0.012])],
      k(0.0005),
      { color: VEIN },
    );
    b.sweep(
      [q([s * 0.03, 0.044, 0.016]), q([s * 0.035, 0.044, 0.0]), q([s * 0.035, 0.044, -0.01])],
      k(0.0004),
      { color: VEIN },
    );

    // Dark pterostigma near each forewing tip.
    b.part(new THREE.BoxGeometry(k(0.008), k(0.0012), k(0.003)), PTERO, {
      at: q([s * 0.07, 0.044, 0.005]),
    });
  }

  return b.root;
}
