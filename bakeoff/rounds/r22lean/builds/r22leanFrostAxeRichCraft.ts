import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint, grain } from "../../../../src/paint";
import { rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering crescent battle axe of glacial steel on an icy plinth: glowing rune blades, gold trim, frost crystals and ribbon tassels.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const ICE = "#8ee9ff";
const ICE_PALE = "#e6fbff";
const DEEP = "#1d5fd8";
const NAVY = "#1b2556";
const GOLD = "#f5c242";
const GOLD_DK = "#b8801f";
const LEATHER = "#3a2a6e";
const STONE = "#5b6a9c";

const STEEL = cel("#bfd4ee", "#6f86c4");
const STEEL_DK = cel("#5d77b8", "#34408a");
const HAFT = cel(grain("#4a3a86", "#352a6a", { size: 0.02, axis: "y", seed: 3 }), "#241c52");
const PLINTH = cel("#7d8fc4", "#4a5496");

const RUNE = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="26" fill="none" stroke="#bff6ff" stroke-width="3"/>
  <circle cx="32" cy="32" r="18" fill="none" stroke="#5fd6ff" stroke-width="3"/>
  <path d="M32 10 L32 54 M18 22 L32 34 L46 22 M20 46 L32 34 L44 46" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="4" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

const SLASH = svg(
  `<svg viewBox="0 0 64 32">
  <path d="M2 28 Q30 26 62 4" fill="none" stroke="#e6fbff" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 30 Q34 28 58 12" fill="none" stroke="#5fd6ff" stroke-width="3" stroke-linecap="round"/>
  <path d="M14 20 L20 14 L26 20 L32 12" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frostAxe" });
  const r = rng(11);

  // ---- plinth ----
  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.24, 0.03],
      [0.2, 0.065],
      [0.2, 0.09],
      [0, 0.09],
    ],
    { at: [0, 0, 0], segments: 10, color: PLINTH },
  );
  b.lathe(
    [
      [0, 0.09],
      [0.17, 0.09],
      [0.15, 0.105],
      [0, 0.11],
    ],
    { at: [0, 0, 0], segments: 10, color: ICE_PALE },
  );
  // gold rim ring on plinth
  b.part(new THREE.TorusGeometry(0.205, 0.008, 4, 20), GOLD, { at: [0, 0.075, 0], rotation: [90, 0, 0] });
  // frost crystals around plinth
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const len = 0.1 + r() * 0.12;
    const d = new THREE.Vector3(c * 0.45, 1, s * 0.45).normalize();
    b.spike([c * 0.22, 0.06, s * 0.22], d, len, 0.022 + r() * 0.012, i % 2 ? ICE : ICE_PALE, { sides: 5 });
    if (i % 3 === 0) {
      const d2 = new THREE.Vector3(c * 0.8, 1, s * 0.8).normalize();
      b.spike([c * 0.23, 0.05, s * 0.23], d2, 0.07, 0.014, DEEP, { sides: 5 });
    }
  }
  // snow dabs
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.06 + r() * 0.1;
    b.part(new THREE.SphereGeometry(0.02 + r() * 0.015, 6, 4), ICE_PALE, {
      at: [Math.cos(a) * rad, 0.105, Math.sin(a) * rad],
      scale: [1, 0.5, 1],
    });
  }

  // ---- haft ----
  b.rod([0, 0.1, 0], [0, 1.2, 0], 0.024, HAFT, { sides: 8 });
  // pommel
  b.part(new THREE.CylinderGeometry(0.036, 0.03, 0.04, 8), GOLD, { at: [0, 0.125, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.03), ICE, { at: [0, 0.17, 0], scale: [1, 1.4, 1] }), 1.2);
  // grip wraps
  for (let i = 0; i < 14; i++) {
    b.part(new THREE.TorusGeometry(0.027, 0.0075, 4, 8), i % 2 ? LEATHER : NAVY, {
      at: [0, 0.24 + i * 0.026, 0],
      rotation: [90 + (i % 2 ? 8 : -8), 0, 0],
    });
  }
  for (const y of [0.22, 0.61, 0.66]) {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.018, 8), GOLD, { at: [0, y, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), GOLD_DK, { at: [0, 0.64, 0] });
  // ice-blue guard fins
  for (const s of [1, -1]) {
    b.spike([s * 0.03, 0.7, 0], [s, 0.5, 0], 0.09, 0.016, DEEP, { sides: 5 });
  }

  // ---- head socket ----
  b.part(new THREE.CylinderGeometry(0.052, 0.06, 0.3, 8), STEEL_DK, { at: [0, 1.0, 0] });
  for (const y of [0.87, 1.13]) {
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.025, 8), GOLD, { at: [0, y, 0] });
    b.part(new THREE.TorusGeometry(0.062, 0.007, 4, 10), GOLD_DK, { at: [0, y + (y > 1 ? 0.014 : -0.014), 0], rotation: [90, 0, 0] });
  }
  // top spike and crown shards
  b.spike([0, 1.14, 0], [0, 1, 0], 0.17, 0.034, STEEL, { sides: 6 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.spike([Math.cos(a) * 0.04, 1.14, Math.sin(a) * 0.04], [Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7], 0.08, 0.013, ICE, { sides: 5 });
  }
  // core gem (front/back)
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.036), ICE, { at: [0, 1.0, s * 0.062], scale: [1, 1.5, 0.7] }),
      1.3,
    );
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), GOLD, { at: [0, 1.0, s * 0.056] });
  }

  // ---- main blade ----
  const bladeOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0.04, 0.11],
    [0.14, 0.18],
    [0.3, 0.33, "sharp"],
    [0.345, 0.2],
    [0.405, 0.05],
    [0.405, -0.08],
    [0.335, -0.22],
    [0.31, -0.36, "sharp"],
    [0.14, -0.21],
    [0.04, -0.11],
  ];
  const bladePaint = paint((_p, _n, s) => {
    const x = s[0];
    const y = s[1];
    if (x > 0.325) return ICE_PALE;
    if (x > 0.285) return ICE;
    if (Math.abs(y + 0.01) < 0.01 && x > 0.1 && x < 0.27) return DEEP;
    if (x < 0.1) return STEEL_DK;
    if (y > 0.13 || y < -0.15) return STEEL;
    return STEEL;
  });
  const blade = b.extrude(bladeOutline, {
    at: [0, 1.0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.036,
    bevel: 0.01,
    color: bladePaint,
  });
  // engraved glowing runes
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
        at: [0.19, 1.0, s * 0.0215],
        dir: [0, 0, s],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", {
        at: [0.3, 1.2, s * 0.0215],
        dir: [0, 0, s],
        axis: "z",
        rotation: [0, 0, 0],
        texture: SLASH,
      }),
      1,
    );
  }
  // gold trim along blade root
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.34, 0.012), GOLD, { at: [0.075, 1.0, s * 0.022] });
    for (const y of [0.9, 1.0, 1.1]) {
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD_DK, { at: [0.075, y, s * 0.03] });
    }
  }
  // frost crystals growing off blade top and bottom horns
  b.spike([0.28, 1.31, 0], [0.5, 1, 0], 0.11, 0.02, ICE, { sides: 5 });
  b.spike([0.22, 1.27, 0.01], [0.2, 1, 0.3], 0.07, 0.014, ICE_PALE, { sides: 5 });
  b.spike([0.28, 0.67, 0], [0.4, -1, 0], 0.1, 0.02, ICE, { sides: 5 });
  b.spike([0.2, 0.74, -0.01], [0.1, -1, -0.3], 0.06, 0.013, ICE_PALE, { sides: 5 });
  // edge jewel studs
  for (const t of [0.15, 0.0, -0.14]) {
    b.part(new THREE.OctahedronGeometry(0.014), GOLD, { at: [0.12 + Math.abs(t) * -0.1, 1.0 + t * 0.6, 0.022] });
  }

  // ---- back spike (poll) ----
  b.extrude(
    [
      [0.04, 0.075],
      [0.14, 0.08],
      [0.22, 0.05],
      [0.34, -0.03, "sharp"],
      [0.2, -0.05],
      [0.13, -0.09],
      [0.04, -0.075],
    ],
    {
      at: [0, 1.0, 0],
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.008,
      color: paint((_p, _n, s) => (s[0] > 0.22 ? ICE : s[0] > 0.1 ? STEEL : STEEL_DK)),
    },
  );
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [-0.1, 1.0, 0.02] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [-0.1, 1.0, -0.02] });

  // ---- tassels / ribbons ----
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.04, 0.88, 0.04],
      [s * 0.1, 0.8, 0.07],
      [s * 0.13, 0.7, 0.05],
      [s * 0.1, 0.6, 0.06],
    ];
    b.sweep(catmull(pts), 0.01, { color: DEEP, caps: "round", sides: 5 });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: [s * 0.1, 0.59, 0.06] });
    b.spike([s * 0.1, 0.58, 0.06], [0, -1, 0], 0.07, 0.014, ICE, { sides: 5 });
  }
  // frost chain links around the haft
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.TorusGeometry(0.012, 0.004, 4, 6), GOLD, {
      at: [Math.cos(a) * 0.045, 0.78 - 0.015 * Math.sin(a * 2), Math.sin(a) * 0.045],
      rotation: [a * 30, a * 60, 0],
    });
  }

  return b.root;
}
