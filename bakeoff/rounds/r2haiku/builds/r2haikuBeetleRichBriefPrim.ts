import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "stag-beetle-on-mossy-log",
  description:
    "A proud stag beetle with glossy chestnut wing cases, branched reddish antler jaws, feathery elbowed antennae and spiny legs gripping a mossy log, with a dewdrop on one antler tine.",
};

const CHESTNUT = "#8b4513";
const BLACK = "#15110e";
const ANTLER = "#8e3b1f";
const BARK = "#4a3a2a";
const MOSS = "#5f8f3a";
const MOSS_DARK = "#3f6b2a";
const DEW = "#bfefff";

export default function build() {
  const b = createBuilder({ name: "stag-beetle-on-mossy-log" });
  const R = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  const log = b.joint("log", { at: [0, 0.12, 0] });
  const thorax = b.joint("thorax", { at: [0, 0.33, 0.02], parent: log });
  const head = b.joint("head", { at: [0, 0.33, 0.14], parent: thorax });
  const abdomen = b.joint("abdomen", { at: [0, 0.31, -0.13], parent: thorax });

  // ---- Log (scenery, rides the root joint) --------------------------------
  b.part(new THREE.CylinderGeometry(0.12, 0.13, 0.7, 12, 1), BARK, {
    at: [0, 0.12, 0],
    aim: [0, 0.12, 1],
    bone: log,
  });
  // Bark knots and end rings
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.02, 10, 1), "#2e241b", {
    at: [0, 0.12, 0.35],
    aim: [0, 0.12, 1],
    bone: log,
  });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), "#33281e", {
    at: [0.09, 0.07, 0.1],
    bone: log,
  });

  // Moss clumps scattered over the log's upper half
  for (let i = 0; i < 16; i++) {
    const theta = (R() * 0.9 + 0.05) * Math.PI - Math.PI / 2 + Math.PI / 2; // upper arc
    const a = (R() - 0.5) * 2.2;
    const z = (R() - 0.5) * 0.6;
    const r = 0.122;
    const x = Math.sin(a) * r;
    const y = 0.12 + Math.cos(a) * r;
    const size = 0.03 + R() * 0.03;
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      i % 3 === 0 ? MOSS_DARK : MOSS,
      { at: [x, y, z], scale: [size, size * 0.35, size * 1.2], bone: log },
    );
    void theta;
  }

  // ---- Wing cases (glossy chestnut) ---------------------------------------
  b.part(new THREE.SphereGeometry(1, 20, 14), CHESTNUT, {
    at: [0, 0.34, -0.05],
    scale: [0.095, 0.07, 0.15],
    bone: abdomen,
  });
  // Dark seam between the two wing cases
  b.part(new THREE.BoxGeometry(0.004, 0.06, 0.2), BLACK, {
    at: [0, 0.36, -0.05],
    bone: abdomen,
  });

  // ---- Thorax and head (black) --------------------------------------------
  b.part(new THREE.SphereGeometry(1, 16, 12), BLACK, {
    at: [0, 0.34, 0.05],
    scale: [0.07, 0.06, 0.08],
    bone: thorax,
  });
  b.part(new THREE.SphereGeometry(1, 16, 12), BLACK, {
    at: [0, 0.34, 0.14],
    scale: [0.06, 0.05, 0.06],
    bone: head,
  });
  // Shiny eyes
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.014, 8, 6), "#e8e2d0", {
      at: [s * 0.04, 0.35, 0.17],
      bone: head,
    });
  }

  // ---- Antler jaws (reddish brown, branched) ------------------------------
  for (const s of [-1, 1]) {
    // Main mandible, curving outward and up
    b.sweep(
      [
        [s * 0.012, 0.335, 0.165],
        [s * 0.03, 0.345, 0.2],
        [s * 0.045, 0.36, 0.25],
      ],
      0.009,
      { color: ANTLER },
    );
    // Forward inner tooth
    b.sweep(
      [
        [s * 0.02, 0.338, 0.19],
        [s * 0.012, 0.335, 0.225],
      ],
      0.006,
      { color: ANTLER },
    );
    // Upper branch tine
    b.sweep(
      [
        [s * 0.04, 0.358, 0.235],
        [s * 0.035, 0.39, 0.255],
      ],
      0.006,
      { color: ANTLER },
    );
    // Outer branch tine (carries the dewdrop on the left side)
    b.sweep(
      [
        [s * 0.038, 0.352, 0.225],
        [s * 0.07, 0.37, 0.23],
      ],
      0.006,
      { color: ANTLER },
    );
  }

  // Dewdrop clinging to the outer tine tip
  b.part(new THREE.SphereGeometry(0.011, 10, 8), DEW, {
    at: [0.072, 0.369, 0.23],
    scale: [1, 1.3, 1],
    bone: head,
  });

  // ---- Elbowed antennae with feathery tips --------------------------------
  for (const s of [-1, 1]) {
    b.sweep(
      [
        [s * 0.022, 0.37, 0.18],
        [s * 0.05, 0.382, 0.2],
        [s * 0.07, 0.36, 0.23],
      ],
      0.004,
      { color: BLACK },
    );
    // Feathery club: small flattened lobes fanned at the tip
    const tip = [s * 0.07, 0.36, 0.23];
    for (let k = 0; k < 4; k++) {
      const ang = (k / 4) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(1, 6, 5), "#4a2f1c", {
        at: [
          tip[0] + Math.cos(ang) * 0.008 * s,
          tip[1] + Math.sin(ang) * 0.008,
          tip[2] + 0.008,
        ],
        scale: [0.006, 0.006, 0.02],
        bone: head,
      });
    }
  }

  // ---- Six spiny black legs gripping the bark -----------------------------
  const zs = [0.1, 0.0, -0.1];
  for (const s of [-1, 1]) {
    zs.forEach((z, i) => {
      const hip = [s * 0.035, 0.33, z];
      const knee = [s * 0.11, 0.345, z + 0.005];
      const foot = [s * 0.07, 0.222, z - 0.008];
      b.sweep([hip, knee, foot], 0.008, { color: BLACK });
      // Tibia spines pointing back along the leg
      const mid = [
        (knee[0] + foot[0]) / 2,
        (knee[1] + foot[1]) / 2,
        (knee[2] + foot[2]) / 2,
      ];
      b.spike(mid, [s * 0.4, -0.3, -0.5], 0.02, 0.004);
      b.spike(
        [s * 0.09, 0.285, z + 0.002],
        [s * 0.3, 0.4, 0.4],
        0.015,
        0.0035,
      );
      // Tarsal claws gripping the bark
      b.spike(foot, [s * 0.2, -0.9, -0.2], 0.012, 0.003);
      void i;
    });
  }

  return b.root;
}
