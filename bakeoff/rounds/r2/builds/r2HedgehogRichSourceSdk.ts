import * as THREE from "three";
import { createBuilder, rng, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Autumn Hedgehog",
  description:
    "A plump hedgehog on an evening walk: a dome of chestnut spines with cream tips, a fawn pointed face, a black button nose, pink paws, and a red maple leaf stuck on its back.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const random = rng(7);

  const CHEST = "#7a4526";
  const CHEST2 = "#5e3319";
  const CREAM = "#f1dfb4";
  const FAWN = "#d9b78a";
  const PALE = "#ecd6b0";
  const PINK = "#e9a3a0";
  const BLACK = "#14100f";

  // ---- skeleton
  b.joint("root", { at: [0, 0.05, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("body", { parent: "root", at: [0, 0.08, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("head", { parent: "body", at: [0, 0.075, 0.08], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.05, 0.1], dir: [0, 0, 1], role: "jaw" });
  const legSpots: Array<[string, number, number]> = [
    ["FL", 0.05, 0.065],
    ["FR", -0.05, 0.065],
    ["BL", 0.05, -0.075],
    ["BR", -0.05, -0.075],
  ];
  for (const [n, x, z] of legSpots) {
    b.joint("leg" + n, { parent: "body", at: [x, 0.05, z], dir: [0, -1, 0], role: "leg" });
    b.joint("paw" + n, { parent: "leg" + n, at: [x, 0.02, z], dir: [0, 0, 1], role: "leg" });
  }

  // ---- body: belly-light, back-dark dome
  const skin = countershade(mottle(CHEST2, CHEST, { size: 0.03 }), FAWN, { level: -0.1, soft: 0.3 });
  const body = b.loft(
    [
      { at: [0, 0.082, -0.13], w: 0.05, h: 0.05 },
      { at: [0, 0.086, -0.07], w: 0.15, h: 0.12 },
      { at: [0, 0.088, 0.0], w: 0.17, h: 0.135 },
      { at: [0, 0.082, 0.07], w: 0.13, h: 0.11 },
      { at: [0, 0.075, 0.1], w: 0.07, h: 0.07 },
    ],
    { color: skin, bone: "body", sides: 10, name: "body" },
  );

  // ---- spines
  const surf = b.surface(body);
  const hits = surf.scatter(270, {
    rng: random,
    minDist: 0.017,
    filter: (h) => h.n.y > -0.1 && h.at.z < 0.075 && !(h.at.z > 0.025 && h.n.y < 0.45),
  });
  const browns = [CHEST, CHEST2, "#8a5230", "#6b3a1d"];
  for (const h of hits) {
    const len = 0.04 + random() * 0.015;
    const dir = h.n.clone().add(new THREE.Vector3(0, 0.1, -0.65)).normalize();
    const base = h.at.clone().addScaledVector(h.n, -0.01);
    const tip = base.clone().addScaledVector(dir, len);
    const c = browns[Math.floor(random() * browns.length)];
    b.spike(base, tip, null, 0.0065, {
      bands: [
        [0.58, c],
        [1, CREAM],
      ],
      sides: 3,
      bone: "body",
      name: "spine",
    });
  }

  // ---- head and snout
  b.loft(
    [
      { at: [0, 0.075, 0.075], w: 0.075, h: 0.075 },
      { at: [0, 0.073, 0.12], w: 0.06, h: 0.06 },
      { at: [0, 0.068, 0.16], w: 0.036, h: 0.038 },
      { at: [0, 0.064, 0.195], w: 0.016, h: 0.018 },
    ],
    { color: countershade(FAWN, PALE, { level: 0, soft: 0.4 }), bone: "head", sides: 8, name: "head" },
  );
  b.part(new THREE.SphereGeometry(0.0115, 8, 6), BLACK, { at: [0, 0.066, 0.2], bone: "head", name: "nose" });
  b.part(new THREE.SphereGeometry(0.003, 5, 4), "#ffffff", { at: [0.004, 0.071, 0.208], bone: "head", name: "noseShine" });
  b.capsule([0, 0.047, 0.1], [0, 0.047, 0.165], 0.011, { color: PALE, bone: "jaw", sides: 6, name: "lowerJaw" });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), BLACK, { at: [0.03 * s, 0.087, 0.135], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.0025, 5, 4), "#ffffff", { at: [0.032 * s, 0.091, 0.1415], bone: "head", name: "eyeShine" });
    // ears
    b.part(new THREE.SphereGeometry(0.018, 8, 6), FAWN, { at: [0.043 * s, 0.108, 0.085], scale: [1, 1, 0.55], bone: "head", name: "ear" });
    b.part(new THREE.SphereGeometry(0.011, 6, 5), PINK, { at: [0.043 * s, 0.108, 0.093], scale: [1, 1, 0.5], bone: "head", name: "earInner" });
    // brow tufts
    b.part(new THREE.SphereGeometry(0.011, 6, 4), CHEST2, { at: [0.034 * s, 0.097, 0.12], scale: [1, 0.6, 1.3], bone: "head", name: "brow" });
  }

  // ---- legs and paws
  for (const [n, x, z] of legSpots) {
    b.capsule([x, 0.055, z], [x, 0.016, z + 0.005], 0.014, { color: PINK, bone: "leg" + n, sides: 6, name: "leg" });
    b.part(new THREE.SphereGeometry(0.015, 8, 6), PINK, { at: [x, 0.008, z + 0.014], scale: [1, 0.55, 1.5], bone: "paw" + n, name: "paw" });
    for (const t of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.0048, 5, 4), "#c9807f", {
        at: [x + t * 0.0078, 0.006, z + 0.036 - Math.abs(t) * 0.003],
        bone: "paw" + n,
        name: "toe",
      });
    }
  }

  // tail nub
  b.part(new THREE.SphereGeometry(0.014, 6, 5), FAWN, { at: [0, 0.07, -0.135], bone: "body", name: "tail" });

  // ---- maple leaf
  const pts: Array<[number, number]> = [];
  for (let k = 0; k < 5; k++) {
    const a = 18 + 72 * k;
    const rad = (d: number) => (d * Math.PI) / 180;
    const tip = k === 3 ? 0.026 : 0.032;
    const items: Array<[number, number]> = [
      [a - 16, 0.02],
      [a, tip],
      [a + 16, 0.02],
      [a + 36, 0.011],
    ];
    for (const [d, r] of items) pts.push([Math.cos(rad(d)) * r, Math.sin(rad(d)) * r]);
  }
  const leaf = b.extrude(pts, {
    color: "#c4281c",
    at: [-0.03, 0.184, -0.025],
    x: [1, 0.25, 0],
    y: [0, -0.15, -1],
    thickness: 0.003,
    bevel: 0.0008,
    bone: "body",
    name: "mapleLeaf",
  });
  for (let k = 0; k < 5; k++) {
    const a = ((18 + 72 * k) * Math.PI) / 180;
    b.rod(leaf.local([0, 0, 0.002]), leaf.local([Math.cos(a) * 0.026, Math.sin(a) * 0.026, 0.002]), 0.0007, {
      color: "#8f1a12",
      bone: "body",
      sides: 3,
      name: "leafVein",
    });
  }
  // stem (lobe at -90°)
  b.rod(leaf.local([0, -0.02, 0.0]), leaf.local([0, -0.04, 0.0]), 0.0012, {
    color: "#7a2a12",
    bone: "body",
    sides: 4,
    name: "leafStem",
  });

  return b.root;
}
