import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mottle, paint, stripes } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A colossal kraken surging out of the sea, mantle raised, eight tentacles spread wide with two reaching for the sky. Overwatch-style: clean bold shapes, indigo body with one hot orange accent, glowing plates and eyes.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: indigo/teal body, one orange accent.
const ACCENT = "#ff7a1a";
const ACCENT_HOT = "#ffc43a";
const VIOLET = "#3d3f9a";
const VIOLET_B = "#4b5ac4";
const INDIGO = "#262873";
const BELLY = "#9fb4ff";
const BELLY_T = "#c9c2ff";
const BONE = "#f1e6d0";
const BEAK = "#2a2036";
const BEAK_TIP = "#5a4a64";
const RIM = "#f6b9c8";
const INNER = "#8a2f64";
const FIN = "#5e6ae0";
const FIN_TIP = "#ff9a3a";
const WATER = "#1f86b0";
const FOAM = "#e6fbff";
const PUPIL = "#150d20";
const BROW = "#1b1c52";
const SHINE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const random = rng(11);

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 1.6, 0] });
  const jaw = b.joint("jaw", { parent: body, at: [0, 1.15, 1.1], aim: [0, 0.95, 1.95], role: "jaw" });

  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 2.0, -0.2],
      [0, 3.0, -0.5],
      [0, 4.2, -1.0],
      [0, 5.2, -1.7],
    ]),
    { parent: body, count: 3, role: "spine" },
  );

  // ---------- water ----------
  const waterPaint = paint((p) => {
    const r = Math.hypot(p.x, p.z);
    const ring = Math.abs((r * 1.6) % 1 - 0.5) < 0.04 && r > 2.2;
    return ring ? FOAM : r > 6.4 ? "#2aa2c8" : WATER;
  });
  b.part(new THREE.CylinderGeometry(7.2, 7.5, 0.12, 24), waterPaint, { bone: body, at: [0, 0, 0] });
  for (const [r, w] of [
    [1.7, 0.07],
    [2.5, 0.05],
  ] as const)
    b.part(new THREE.TorusGeometry(r, w, 4, 28), FOAM, { bone: body, at: [0, 0.07, 0], rotation: [90, 0, 0] });
  for (let i = 0; i < 16; i++) {
    const a = random() * Math.PI * 2;
    const r = 2.2 + random() * 4.2;
    const y = 0.25 + random() * 1.6;
    b.part(new THREE.SphereGeometry(0.06 + random() * 0.08, 6, 4), FOAM, {
      bone: body,
      at: [Math.sin(a) * r, y, Math.cos(a) * r],
    });
  }

  // ---------- head ----------
  const headPaint = countershade(
    stripes(mottle(VIOLET, VIOLET_B, { size: 0.5, seed: 3 }), INDIGO, { size: 0.5, axis: "y", width: 0.25, seed: 4 }),
    BELLY,
    { level: -0.25 },
  );
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    bone: body,
    at: [0, 2.0, 0.2],
    scale: [1.4, 1.25, 1.5],
  });
  void skull;

  for (const s of [1, -1]) {
    const eyeAt: [number, number, number] = [s * 0.8, 2.3, 1.3];
    const dir = [s * 0.35, 0.05, 1];
    glow(b.part(new THREE.SphereGeometry(0.4, 10, 8), ACCENT, { bone: body, at: eyeAt }), 1.3);
    b.part(new THREE.TorusGeometry(0.4, 0.07, 5, 14), BROW, {
      bone: body,
      at: [s * 0.8, 2.3, 1.3],
      dir,
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PUPIL, {
      bone: body,
      at: [s * 0.84, 2.3, 1.64],
      scale: [0.07, 0.3, 0.06],
    });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), SHINE, { bone: body, at: [s * 0.95, 2.5, 1.66] });
    // heavy brow ridge
    b.rod([s * 1.35, 2.62, 1.0], [s * 0.35, 2.85, 1.45], 0.11, BROW, { bone: body });
    // cheek horns
    b.spike([s * 1.25, 1.9, 0.9], [s * 0.8, 0.1, 0.6], 0.8, 0.16, BONE, { bone: body });
    // crown horns
    b.spike([s * 0.8, 3.0, 0.2], [s * 0.7, 0.8, -0.3], 0.95, 0.17, BONE, { bone: body });
    b.spike([s * 0.5, 3.15, -0.25], [s * 0.4, 0.8, -0.5], 0.7, 0.13, BONE, { bone: body });
  }
  // glowing forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.2), ACCENT_HOT, { bone: body, at: [0, 3.0, 1.0], scale: [1, 1.5, 0.8] }), 1.5);

  // ---------- beak ----------
  b.spike([0, 1.4, 1.15], [0, 0.85, 2.0], null, 0.34, BEAK, { bone: body });
  b.spike([0, 1.1, 1.1], [0, 0.9, 1.95], null, 0.27, BEAK, { bone: jaw });
  b.rod([0, 1.38, 1.5], [0, 0.9, 1.98], 0.05, BEAK_TIP, { bone: body });
  for (const x of [-0.18, -0.09, 0, 0.09, 0.18])
    b.spike([x, 1.08, 1.45 + Math.abs(x)], [0, 1, 0], 0.16, 0.035, BONE, { bone: jaw });

  // ---------- mantle ----------
  const mantlePaint = paint((p, n, s) => {
    const d = Math.min(s[1], 360 - s[1]);
    if (d < 5 && s[0] > 0.08 && s[0] < 0.95) return ACCENT;
    return countershade(
      stripes(mottle(VIOLET, VIOLET_B, { size: 0.55, seed: 3 }), INDIGO, { size: 0.45, axis: "y", width: 0.28, seed: 5 }),
      BELLY,
      { level: -0.2 },
    ).at(p, n);
  });
  const mantleTube = b.sweep(mantle, [1.2, 1.38, 1.05, 0.55, 0.08], { color: mantlePaint, sides: 10 });
  for (const t of [0.22, 0.38, 0.54, 0.7])
    for (const s of [1, -1]) {
      const at = mantleTube.at(t, s * 50);
      glow(b.stick(new THREE.BoxGeometry(0.16, 0.08, 0.42), ACCENT, at, { embed: 0.4 }), 1.4);
    }
  for (const t of [0.3, 0.5, 0.68])
    for (const s of [1, -1]) {
      const at = mantleTube.at(t, s * 100);
      b.spike(at, at, 0.5 * (1 - t) + 0.2, 0.13 * (1 - t) + 0.05, BONE);
    }
  // fins
  for (const s of [1, -1]) {
    const outline: Array<[number, number]> = [
      [0, 0],
      [1.1, -0.4],
      [1.6, 0.5],
      [0.9, 1.7],
      [0, 1.3],
    ];
    const finPaint = paint((_p, _n, uv) => (uv[0] > 1.1 ? FIN_TIP : FIN));
    b.extrude(outline, {
      at: [s * 1.0, 3.2, -0.6],
      x: [s, 0, 0],
      y: [s * 0.3, 1, 0],
      thickness: 0.1,
      bevel: 0.03,
      color: finPaint,
      bone: mantle.joints[1],
    });
  }

  // ---------- tentacles ----------
  const tentPaint = (tip: boolean) =>
    paint((p, n, s) => {
      if (tip && s[0] > 0.9) return ACCENT;
      return countershade(
        stripes(mottle(VIOLET, VIOLET_B, { size: 0.4, seed: 8 }), INDIGO, { size: 0.55, axis: "z", width: 0.2, seed: 2 }),
        BELLY_T,
        { level: -0.45 },
      ).at(p, n);
    });
  const raised = new Set([2, 5]);
  for (let i = 0; i < 8; i++) {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const side = i % 2 ? 1 : -1;
    const R = 5.0 + 0.7 * Math.sin(i * 2.3);
    const H = 2.4 + 0.6 * Math.cos(i * 1.7);
    const P = (r: number, y: number, sd: number): [number, number, number] => [
      dx * r + dz * sd,
      y,
      dz * r - dx * sd,
    ];
    const pts = raised.has(i)
      ? [P(0.9, 1.5, 0), P(1.9, 2.8, 0), P(2.9, 4.0, side * 0.3), P(3.6, 5.0, side * 0.6), P(3.4, 5.6, side * 1.2)]
      : [
          P(0.9, 1.5, 0),
          P(1.9, H, 0),
          P(3.2, H * 0.7, side * 0.3),
          P(R * 0.85, 0.5, side * 0.8),
          P(R, 0.14, side * 1.4),
        ];
    const chain = b.chain(`tent${i}`, catmull(pts), { parent: body, count: 5, role: "tentacle" });
    const rad = (t: number) => 0.42 * (1 - t) + 0.05 * t;
    const sw = b.sweep(chain, [0.42, 0.3, 0.2, 0.12, 0.05], { color: tentPaint(true), sides: 8 });
    // suckers in two rows on the underside
    for (const deg of [145, 215])
      for (let k = 0; k < 8; k++) {
        const t = 0.12 + k * 0.105;
        const at = sw.at(t, deg);
        const rr = rad(t) * 0.45;
        b.stick(new THREE.CylinderGeometry(rr * 0.9, rr, 0.06, 7), RIM, at, { embed: 0.35 });
        b.stick(new THREE.CylinderGeometry(rr * 0.55, rr * 0.55, 0.06, 7), INNER, at, { embed: 0.3 });
      }
    // dorsal spikes
    for (const t of [0.2, 0.35, 0.5, 0.65]) {
      const at = sw.at(t, 0);
      b.spike(at, at, 0.28 * (1 - t) + 0.08, 0.07 * (1 - t) + 0.025, BONE);
    }
    // glowing band near the tip
    glow(b.stick(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), ACCENT_HOT, sw.at(0.86, 0), { embed: 0.2 }), 1.3);
  }

  // ---------- oral arms ----------
  [-0.7, -0.25, 0.25, 0.7].forEach((x, i) => {
    const pts: Array<[number, number, number]> = [
      [x * 0.5, 1.25, 0.9],
      [x * 0.9, 0.95, 1.8],
      [x * 1.5, 0.7, 2.5],
      [x * 1.9, 0.6, 3.1],
    ];
    const chain = b.chain(`oral${i}`, catmull(pts), { parent: body, count: 3, role: "tentacle" });
    b.sweep(chain, [0.17, 0.12, 0.08, 0.035], { color: tentPaint(false), sides: 6 });
  });

  return b.root;
}
