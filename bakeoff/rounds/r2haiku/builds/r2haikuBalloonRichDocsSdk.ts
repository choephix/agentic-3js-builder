import * as THREE from "three";
import { createBuilder, paint, spots } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "hot-air-balloon",
  description: "A hot-air balloon about to take off: striped envelope with a patterned band, glowing burner, wicker basket, ropes, sandbags and a pennant.",
};

// Palette
const SUN = "#ffc21a";
const TOMATO = "#e2412b";
const SKY = "#4fb4e8";
const CREAM = "#fff1d0";
const NAVY = "#1f3a68";
const WICKER = "#c9995e";
const WICKER_DARK = "#7a5330";
const ROPE = "#6b5234";
const METAL = "#7d848f";
const DARK = "#3a2b20";
const FLAME = "#ff7a1f";
const CORE = "#ffd84a";
const SAND = "#d2b07a";
const TIE = "#8a6a3e";

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  const root = b.joint("body", { at: [0, 0, 0] });

  // Envelope: a lathe profile, skirt at y = 2.0, widest at y ~ 4.2, top at 6.6.
  const envProfile: OutlinePoint[] = [
    [0, 2.0],
    [0.9, 2.0],
    [1.5, 2.4],
    [2.0, 3.2],
    [2.2, 4.2],
    [2.0, 5.1],
    [1.4, 5.9],
    [0.7, 6.4],
    [0, 6.6],
  ];

  // Vertical stripes: 12 sectors of 30 degrees, cycling yellow, red, blue.
  // A patterned band (cream with navy spots) runs round the middle.
  const band = spots(CREAM, NAVY, { size: 0.16, amount: 0.4, seed: 4 });
  const COLS = [SUN, TOMATO, SKY];
  const envelope = paint((_p, _n, s) => {
    if (s[0] > 3.6 && s[0] < 4.3) return band;
    const deg = (((s[1] % 360) + 360) % 360);
    return COLS[Math.floor(deg / 30) % 3];
  });
  b.lathe(envProfile, { segments: 24, smoothing: 1, color: envelope, bone: root });

  // Dark mouth ring where the envelope opens over the burner.
  b.part(new THREE.TorusGeometry(0.88, 0.05, 6, 16), DARK, {
    at: [0, 2.0, 0],
    rotation: [90, 0, 0],
    bone: root,
  });

  // Burner: support, body, glowing flame and hot core.
  b.rod([0, 1.12, 0], [0, 1.32, 0], 0.05, { color: METAL, bone: root });
  b.part(new THREE.CylinderGeometry(0.14, 0.18, 0.26, 8), METAL, { at: [0, 1.45, 0], bone: root });
  b.part(new THREE.ConeGeometry(0.2, 0.5, 8), FLAME, { at: [0, 1.9, 0], bone: root });
  b.part(new THREE.ConeGeometry(0.1, 0.35, 6), CORE, { at: [0, 1.8, 0], bone: root });

  // Wicker basket: a four-sided lathe with horizontal weave bands.
  const basketProfile: OutlinePoint[] = [
    [0, 0],
    [0.5, 0],
    [0.6, 1.1],
    [0, 1.1],
  ];
  const wicker = stripesWeave();
  b.lathe(basketProfile, { segments: 4, spin: 45, color: wicker, bone: root });

  // Dark rim on top of the basket.
  b.part(new THREE.CylinderGeometry(0.64, 0.64, 0.06, 4), WICKER_DARK, {
    at: [0, 1.13, 0],
    rotation: [0, 45, 0],
    bone: root,
  });

  // Ropes from the basket corners up to the envelope skirt.
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI / 4 + (i * Math.PI) / 2;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    b.rod([c * 0.6, 1.12, s * 0.6], [c * 0.85, 2.0, s * 0.85], 0.018, { color: ROPE, bone: root });
  }

  // Sandbags hanging against the sides, each tied to the rim.
  const bags: [number, number, number][] = [
    [0.7, 0.72, 0.1],
    [-0.68, 0.66, -0.25],
    [0.2, 0.6, -0.7],
  ];
  for (const [x, y, z] of bags) {
    b.rod([x * 0.86, 1.1, z * 0.86], [x, y + 0.1, z], 0.018, { color: TIE, bone: root });
    b.part(new THREE.SphereGeometry(0.13, 8, 6), SAND, {
      at: [x, y, z],
      scale: [1.3, 0.85, 0.8],
      bone: root,
    });
  }

  // Little pennant on one corner, on a pole from the rim.
  const px = 0.424;
  const pz = 0.424;
  b.rod([px, 1.12, pz], [px, 1.8, pz], 0.02, { color: METAL, bone: root });
  const flag: OutlinePoint[] = [
    [0, 0],
    [0.42, 0.07],
    [0, 0.16],
  ];
  b.extrude(flag, {
    at: [px, 1.66, pz],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: TOMATO,
    bone: root,
  });

  return b.root;
}

// Weave: alternating light and dark horizontal bands on the basket.
function stripesWeave() {
  return paint((_p, _n, s) => (Math.floor(s[0] * 0 + 0) === 0 ? WICKER : WICKER_DARK));
}
