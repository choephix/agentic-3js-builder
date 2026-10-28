import * as THREE from "three";
import { createBuilder, frame, catmull, countershade, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Barnstormer Biplane",
  description: "A chubby, whimsical teal-and-yellow barnstorming biplane with a copper cowl, a scarfed pilot and a star roundel.",
};

export default function build() {
  const b = createBuilder({ name: "biplane" });

  const TEAL = "#2fa7a0", CREAM = "#fff1c9", YELLOW = "#f4c542", RED = "#d9482f";
  const WOOD = "#b8793c", DARK = "#2b2433", COPPER = "#c8743c", GLASS = "#bfeeff", LEATHER = "#7a4a2a";
  const SKIN = "#f0b98d";

  const fusePaint = countershade(TEAL, CREAM, { level: -0.45, soft: 0.2 });
  const wingPaint = paint((_p, _n, s) => {
    const ax = Math.abs(s[0]);
    if (ax > 2.5 && ax < 2.85) return RED;
    if (ax > 2.85 && ax < 3.05) return CREAM;
    return YELLOW;
  });
  const lowPaint = paint((_p, _n, s) => {
    const ax = Math.abs(s[0]);
    if (ax > 2.3 && ax < 2.65) return RED;
    if (ax > 2.65 && ax < 2.85) return CREAM;
    return YELLOW;
  });

  // Fuselage
  const fuse = b.loft(
    [
      { at: [0, 1.4, -3.0], w: 0.1, h: 0.18 },
      { at: [0, 1.35, -2.1], w: 0.32, h: 0.45 },
      { at: [0, 1.25, -0.9], w: 0.8, h: 0.9 },
      { at: [0, 1.2, 0.5], w: 0.98, h: 1.05 },
      { at: [0, 1.2, 1.2], w: 0.92, h: 0.98 },
    ],
    { color: fusePaint },
  );

  // Cowling
  b.lathe(
    [[0, 0], [0.55, 0], [0.6, 0.2], [0.56, 0.5], [0.4, 0.62], [0, 0.66]],
    { at: [0, 1.2, 1.15], axis: [0, 0, 1], segments: 12, color: metalish() },
  );
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8), DARK, { at: [0, 1.2, 1.78], dir: [0, 0, 1] });
  b.ring(frame([0, 1.2, 1.2], [0, 0, 1]), { count: 7, radius: 0.55 }, (it) =>
    b.part(new THREE.SphereGeometry(0.11, 6, 4), COPPER, { at: it }),
  );
  b.part(new THREE.ConeGeometry(0.16, 0.3, 8), RED, { at: [0, 1.2, 1.9], dir: [0, 0, 1] });
  // exhaust stacks
  for (const s of [1, -1]) {
    b.spike([s * 0.5, 1.0, 1.0], [s * 0.4, -0.6, -0.5], 0.5, 0.06, { color: DARK });
  }

  // Propeller
  const hubAt: [number, number, number] = [0, 1.2, 2.0];
  const blade = [[-0.08, 0], [0.08, 0], [0.14, 0.9], [0, 1.1], [-0.14, 0.9]] as [number, number][];
  const bladePaint = paint((_p, _n, s) => (s[1] > 0.8 ? YELLOW : WOOD));
  b.extrude(blade, { at: hubAt, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: bladePaint, smoothing: 1 });
  b.extrude(blade, { at: hubAt, x: [-1, 0, 0], y: [0, -1, 0], thickness: 0.05, color: bladePaint, smoothing: 1 });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), COPPER, { at: [0, 1.2, 2.03] });

  // Wings
  const wingOutline = (span: number, ch: number) =>
    [[-span, -ch / 2], [span, -ch / 2], [span + 0.2, 0], [span, ch / 2], [-span, ch / 2], [-span - 0.2, 0]] as [number, number][];
  b.extrude(wingOutline(3.3, 1.1), { at: [0, 2.35, 0.35], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bevel: 0.03, smoothing: 1, color: wingPaint });
  b.extrude(wingOutline(3.1, 1.0), { at: [0, 0.85, 0.25], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.09, bevel: 0.03, smoothing: 1, color: lowPaint });
  // upper wing centre cut-out look: fuel tank bump
  b.part(new THREE.SphereGeometry(0.3, 8, 6), RED, { at: [0, 2.5, 0.35], scale: [1.2, 0.5, 1.2] });

  // Struts
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 1.6, 0.55], [s * 0.55, 2.3, 0.6], 0.035, { color: DARK });
    b.rod([s * 0.3, 1.6, -0.1], [s * 0.55, 2.3, 0.0], 0.035, { color: DARK });
    for (const x of [1.5, 2.8]) {
      b.rod([s * x, 0.88, 0.5], [s * x, 2.32, 0.65], 0.04, { color: WOOD });
      b.rod([s * x, 0.88, 0.0], [s * x, 2.32, 0.1], 0.04, { color: WOOD });
    }
    b.rod([s * 1.5, 0.9, 0.5], [s * 2.8, 2.3, 0.65], 0.012, { color: DARK });
    b.rod([s * 2.8, 0.9, 0.5], [s * 1.5, 2.3, 0.65], 0.012, { color: DARK });
    // wing tip lamps
    b.part(new THREE.SphereGeometry(0.07, 6, 4), s > 0 ? "#44dd66" : "#ff4455", { at: [s * 3.5, 2.35, 0.35] });
  }

  // Tail
  const finPaint = paint((_p, _n, s) => (s[0] < -0.15 ? RED : TEAL));
  b.extrude([[-0.7, 0], [0.2, 0], [0.2, 0.5], [-0.15, 1.05], [-0.7, 0.9]], {
    at: [0, 1.38, -2.4], x: [0, 0, 1], thickness: 0.07, bevel: 0.02, smoothing: 1, color: finPaint,
  });
  b.extrude([[-1.3, -0.25], [1.3, -0.25], [1.15, 0.4], [-1.15, 0.4]], {
    at: [0, 1.35, -2.55], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, smoothing: 1, color: YELLOW,
  });
  // pennant
  b.extrude([[0, 0], [0.5, 0.1], [0, 0.2]], { at: [0.0, 2.4, -2.8], x: [0, 0, -1], thickness: 0.01, color: RED });
  b.rod([0, 2.35, -2.8], [0, 2.5, -2.8], 0.01, { color: DARK });
  // tail skid wheel
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), DARK, { at: [0, 0.12, -2.8], dir: [1, 0, 0] });
  b.rod([0, 1.3, -2.7], [0, 0.15, -2.8], 0.03, { color: DARK });

  // Landing gear
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.18, 14), DARK, { at: [s * 0.85, 0.4, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8), CREAM, { at: [s * 0.85, 0.4, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 6), RED, { at: [s * 0.85, 0.4, 0.7], dir: [1, 0, 0] });
    b.rod([s * 0.3, 0.9, 0.9], [s * 0.85, 0.4, 0.7], 0.045, { color: WOOD });
    b.rod([s * 0.35, 0.8, 0.3], [s * 0.85, 0.4, 0.7], 0.045, { color: WOOD });
  }
  b.rod([-0.85, 0.4, 0.7], [0.85, 0.4, 0.7], 0.035, { color: DARK });

  // Cockpit
  b.part(new THREE.BoxGeometry(0.62, 0.06, 0.78), CREAM, { at: [0, 1.72, -0.3] });
  b.part(new THREE.BoxGeometry(0.5, 0.07, 0.66), DARK, { at: [0, 1.74, -0.3] });
  b.part(new THREE.BoxGeometry(0.6, 0.28, 0.03), GLASS, { at: [0, 1.88, 0.15], rotation: [-18, 0, 0] });
  // Pilot
  b.part(new THREE.SphereGeometry(0.22, 8, 6), RED, { at: [0, 1.75, -0.32], scale: [1, 0.9, 0.8] });
  b.part(new THREE.SphereGeometry(0.19, 10, 8), SKIN, { at: [0, 2.0, -0.32] });
  b.part(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER, { at: [0, 2.03, -0.32] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 8), GLASS, { at: [s * 0.085, 2.04, -0.15], dir: [0, 0, 1] });
    b.part(new THREE.TorusGeometry(0.068, 0.014, 5, 8), COPPER, { at: [s * 0.085, 2.04, -0.14] });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), "#e8957a", { at: [s * 0.1, 1.95, -0.14] });
  }
  b.part(new THREE.SphereGeometry(0.04, 5, 4), "#e8957a", { at: [0, 1.99, -0.13] });
  b.rod([-0.19, 2.04, -0.3], [0.19, 2.04, -0.3], 0.015, { color: DARK });
  // Scarf
  b.sweep(catmull([[0, 1.84, -0.34], [0.04, 1.88, -0.7], [-0.05, 1.98, -1.2], [0.05, 1.93, -1.8]]), (t) => [0.1, 0.02 + 0.01 * t], {
    color: RED, section: "box", caps: "flat",
  });
  b.sweep(catmull([[0, 1.84, -0.34], [0.2, 1.8, -0.3], [0, 1.78, -0.15]]), 0.05, { color: RED });

  // Decals
  const star = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff1c9" stroke="#2b2433" stroke-width="4"/><circle cx="50" cy="50" r="34" fill="#d9482f"/><path d="M50 18 L58 42 L83 42 L63 57 L70 82 L50 67 L30 82 L37 57 L17 42 L42 42Z" fill="#f4c542" stroke="#2b2433" stroke-width="3" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
  const words = svg(
    `<svg viewBox="0 0 160 50"><rect x="2" y="2" width="156" height="46" rx="14" fill="#fff1c9" stroke="#2b2433" stroke-width="4"/><text x="80" y="33" text-anchor="middle" font-family="serif" font-weight="bold" font-size="22" fill="#d9482f">LUCKY No.7</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.decal(fuse, star, { at: [s * 0.5, 1.35, -0.9], dir: [s, 0, 0], size: [0.55, 0.55] });
    b.decal(fuse, words, { at: [s * 0.2, 1.3, -1.9], dir: [s, 0, 0.0], size: [0.9, 0.28] });
  }

  return b.root;

  function metalish() {
    return paint((p, n) => (n.z > 0.6 && Math.hypot(p.x, p.y - 1.2) < 0.22 ? DARK : COPPER));
  }
}
