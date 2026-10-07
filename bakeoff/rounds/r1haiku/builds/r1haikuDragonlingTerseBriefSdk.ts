import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "baby dragon",
  description: "A small green hatchling with folded-out wings, a curled tail and a big-eyed head.",
};

const GREEN = "#5fae4e";
const DARK = "#3c7a36";
const BELLY = "#ecdc95";
const HORN = "#f1e4c2";
const WING = "#e0708e";
const WING_RIB = "#8c3b57";
const EYE = "#ffd21f";
const PUPIL = "#141414";
const CLAW = "#2a2a2a";

// Ellipsoid: a unit sphere squashed to the given radii.
function ell(rx: number, ry: number, rz: number, seg = 10) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 2));
  g.scale(rx, ry, rz);
  return g;
}

// Cone that points along its facing direction.
function cone(r: number, h: number) {
  return new THREE.ConeGeometry(r, h, 6, 1);
}

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });
  const r = rng(7);

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.26, 0] });
  const chest = b.joint("chest", { at: [0, 0.31, 0.1], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.36, 0.2], parent: chest });
  const head = b.joint("head", { at: [0, 0.42, 0.28], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.37, 0.33], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.25, -0.16], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.22, -0.3], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.2, -0.42], parent: tail2 });

  const legs = [
    { side: 1, z: 0.1, hip: "F" },
    { side: -1, z: 0.1, hip: "F" },
    { side: 1, z: -0.1, hip: "H" },
    { side: -1, z: -0.1, hip: "H" },
  ];
  for (const l of legs) {
    const sx = l.side > 0 ? "L" : "R";
    const tag = `${l.hip === "F" ? "fore" : "hind"}${sx}`;
    const x = 0.07 * l.side;
    b.joint(`${tag}Hip`, { at: [x, 0.26, l.z], parent: hips });
    b.joint(`${tag}Knee`, { at: [x, 0.13, l.z + 0.01], parent: hips });
    b.joint(`${tag}Ankle`, { at: [x, 0.03, l.z + 0.03], parent: hips });
  }

  // ---------- Body ----------
  b.stick(ell(0.13, 0.12, 0.2, 14), GREEN, frame([0, 0.3, 0.0], [0, 0, 1]));
  b.stick(ell(0.1, 0.09, 0.14, 12), BELLY, frame([0, 0.25, 0.02], [0, 0, 1]));
  b.stick(ell(0.07, 0.06, 0.08, 10), GREEN, frame([0, 0.36, 0.2], [0, 0.4, 1]));

  // Head: big, round, with a stubby snout and lower jaw.
  b.stick(ell(0.1, 0.095, 0.1, 14), GREEN, frame([0, 0.42, 0.28], [0, 0, 1]));
  b.stick(ell(0.065, 0.055, 0.09, 10), GREEN, frame([0, 0.41, 0.36], [0, 0, 1]));
  b.stick(ell(0.05, 0.025, 0.07, 10), BELLY, frame([0, 0.37, 0.34], [0, 0, 1]));

  // Eyes and pupils on the front-side of the head.
  for (const s of [1, -1]) {
    b.stick(ell(0.03, 0.03, 0.02, 10), EYE, frame([0.07 * s, 0.45, 0.31], [s * 0.6, 0.2, 1]));
    b.stick(ell(0.014, 0.016, 0.01, 8), PUPIL, frame([0.078 * s, 0.452, 0.325], [s * 0.6, 0.2, 1]));
  }

  // Nostrils.
  for (const s of [1, -1]) {
    b.stick(ell(0.008, 0.008, 0.008, 6), DARK, frame([0.02 * s, 0.44, 0.405], [0, 0, 1]));
  }

  // Teeth along the jaw.
  for (let i = 0; i < 4; i++) {
    const x = -0.03 + i * 0.02;
    b.stick(cone(0.007, 0.02), HORN, frame([x, 0.37, 0.37], [0, -0.2, 1]));
  }

  // Horns: swept back from the crown.
  for (const s of [1, -1]) {
    b.stick(cone(0.018, 0.09), HORN, frame([0.05 * s, 0.5, 0.25], [0.5 * s, 0.9, -0.5]));
  }

  // Frill spikes on top of the head and down the back.
  for (let i = 0; i < 7; i++) {
    const z = 0.22 - i * 0.07;
    const y = 0.4 - Math.abs(i - 2) * 0.012;
    const len = 0.035 + r() * 0.02;
    b.stick(cone(0.012, len), i % 2 ? DARK : HORN, frame([0, y + len * 0.5, z], [0, 1, -0.4]));
  }

  // ---------- Wings (folded out to the side) ----------
  const wingOutline: [number, number][] = [
    [0.0, 0.0],
    [0.14, 0.1],
    [0.3, 0.12],
    [0.34, 0.02],
    [0.22, -0.1],
    [0.1, -0.08],
    [0.0, -0.04],
  ];
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [0.1 * s, 0.36, 0.06],
      x: [s, 0, 0],
      y: [0, 1, 0],
    });
    // Wing arms (bones of the wing shape)
    b.stick(ell(0.012, 0.012, 0.11, 6), WING_RIB, frame([0.15 * s, 0.37, 0.07], [s, 0.1, 0.2]));
    b.stick(ell(0.01, 0.01, 0.08, 6), WING_RIB, frame([0.25 * s, 0.36, 0.06], [s, 0, 0.1]));
  }

  // ---------- Legs and feet ----------
  for (const l of legs) {
    const x = 0.07 * l.side;
    const z = l.z;
    const scale = l.hip === "F" ? 1 : 1.15;
    b.stick(ell(0.04 * scale, 0.07, 0.04 * scale, 10), GREEN, frame([x, 0.19, z], [0, -1, 0]));
    b.stick(ell(0.035, 0.035, 0.035, 8), DARK, frame([x, 0.13, z], [0, 0, 1]));
    b.stick(ell(0.035, 0.03, 0.06, 8), GREEN, frame([x, 0.04, z + 0.03], [0, 0, 1]));
    for (let t = -1; t <= 1; t++) {
      b.stick(cone(0.008, 0.02), CLAW, frame([x + t * 0.02, 0.035, z + 0.065], [0, -0.4, 1]));
    }
  }

  // ---------- Tail: three tapering segments curling up at the end ----------
  const tailSegs: [number, number, number, number][] = [
    [0.055, 0.05, -0.2, 0.26],
    [0.04, 0.035, -0.32, 0.23],
    [0.025, 0.022, -0.44, 0.2],
  ];
  for (const [rad, rad2, z, y] of tailSegs) {
    b.stick(ell(rad, rad * 0.9, rad * 2.2, 10), GREEN, frame([0, y, z], [0, 0.1, 1]));
  }
  // Spade tip on the tail.
  b.stick(
    new THREE.ConeGeometry(0.035, 0.06, 4, 1),
    HORN,
    frame([0, 0.2, -0.53], [0, 0.1, -1])
  );
  // Tail spikes.
  for (let i = 0; i < 4; i++) {
    const z = -0.2 - i * 0.08;
    b.stick(cone(0.01, 0.03), DARK, frame([0, 0.29 - i * 0.02, z], [0, 1, 0]));
  }

  // Belly plates for a bit of colour contrast.
  for (let i = 0; i < 4; i++) {
    b.stick(ell(0.06, 0.008, 0.02, 8), BELLY, frame([0, 0.19, 0.12 - i * 0.07], [0, -1, 0]));
  }

  return b.root;
}
