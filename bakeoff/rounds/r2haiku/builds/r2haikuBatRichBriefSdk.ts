import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Fruit bat with fig",
  description:
    "A golden-brown fruit bat with a fox-like face, wings spread wide on charcoal finger bones, clutching a half-eaten fig.",
};

export default function build() {
  const b = createBuilder({ name: "fruit-bat" });

  // Palette
  const FUR = "#b9833f";
  const FUR_DK = "#84571f";
  const WING = "#3a3c44";
  const BONE = "#2b2c33";
  const EYE = "#120c08";
  const NOSE = "#0a0a0a";
  const FIG = "#6e2f5e";
  const FLESH = "#e9a7a0";
  const GLINT = "#ffffff";
  const CLAW = "#d9c9a8";

  // ---- Torso: tail stub, hips, chest, neck (one continuous spine) ----
  const torso = b.chain(
    "torso",
    [
      [0, 0.3, -0.14],
      [0, 0.3, -0.02],
      [0, 0.42, 0.03],
      [0, 0.5, 0.1],
    ],
    { role: "spine" },
  );
  const torsoSweep = b.sweep(torso, 0.085, { color: FUR });

  // ---- Head: cranium and tapered fox-like snout ----
  const head = b.chain(
    "head",
    [
      [0, 0.5, 0.1],
      [0, 0.57, 0.16],
    ],
    { role: "head" },
  );
  const headSweep = b.sweep(head, 0.072, { color: FUR });

  const snout = b.chain(
    "snout",
    [
      [0, 0.57, 0.16],
      [0, 0.555, 0.235],
    ],
    { role: "jaw" },
  );
  b.sweep(snout, 0.042, { color: FUR_DK });

  const headSurf = b.surface(headSweep);
  const torsoSurf = b.surface(torsoSweep);

  // Big dark eyes with a glint
  for (const s of [1, -1]) {
    const eyeHit = headSurf.nearest([0.035 * s, 0.585, 0.165]);
    b.stick(new THREE.SphereGeometry(0.03, 14, 10), EYE, eyeHit);
    const glintHit = headSurf.nearest([0.045 * s, 0.597, 0.185]);
    b.stick(new THREE.SphereGeometry(0.009, 8, 6), GLINT, glintHit);
  }

  // Moist black nose
  const noseHit = headSurf.nearest([0, 0.556, 0.236]);
  b.stick(new THREE.SphereGeometry(0.022, 10, 8), NOSE, noseHit);

  // Pointed ears, charcoal tips on golden fur
  for (const s of [1, -1]) {
    const earGeo = new THREE.ConeGeometry(0.028, 0.1, 6).translate(0, 0.05, 0);
    const earHit = headSurf.nearest([0.04 * s, 0.63, 0.1]);
    b.stick(earGeo, FUR_DK, earHit);
  }

  // Fluffy tufts scattered across the body
  for (const h of torsoSurf.scatter(30)) {
    const tuft = new THREE.ConeGeometry(0.018, 0.05, 5).translate(0, 0.025, 0);
    b.stick(tuft, FUR_DK, h);
  }

  // ---- Wings and legs, built per side ----
  for (const s of [1, -1]) {
    const sn = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): [number, number, number] => [
      x * s,
      y,
      z,
    ];

    // Arm and finger skeleton
    const S = P(0.07, 0.47, 0.02);
    const E = P(0.24, 0.63, 0.0);
    const W = P(0.5, 0.7, -0.02);
    const T1 = P(0.78, 0.6, 0.0);
    const T2 = P(0.72, 0.44, -0.03);
    const T3 = P(0.56, 0.33, -0.02);
    const TH = P(0.44, 0.78, 0.05);

    const arm = b.chain(`arm${sn}`, [S, E, W], { role: "wing" });
    b.sweep(arm, 0.017, { color: BONE });

    for (const [i, tip] of [T1, T2, T3].entries()) {
      const finger = b.chain(`finger${sn}${i + 1}`, [W, tip], { role: "digit" });
      b.sweep(finger, 0.011, { color: BONE });
      b.part(new THREE.SphereGeometry(0.014, 8, 6), BONE, { at: tip });
    }

    // Thumb with a small hooked claw
    const thumb = b.chain(`thumb${sn}`, [W, TH], { role: "digit" });
    b.sweep(thumb, 0.008, { color: BONE });
    b.part(new THREE.ConeGeometry(0.008, 0.03, 6).translate(0, 0.015, 0), CLAW, {
      at: TH,
      dir: [0, 1, 0.2 * s],
    });

    // Leathery wing membrane from body to fingertips
    b.membrane(
      [P(0.1, 0.3, 0.0), P(0.3, 0.3, 0.02), T3],
      [S, E, W, T1],
      { color: WING },
    );

    // Hind leg that curls round the fig
    const hip = P(0.05, 0.3, -0.01);
    const knee = P(0.08, 0.22, 0.06);
    const ankle = P(0.045, 0.13, 0.13);
    const toe = P(0.03, 0.115, 0.19);
    const leg = b.chain(`leg${sn}`, [hip, knee, ankle, toe], { role: "leg" });
    b.sweep(leg, 0.02, { color: FUR_DK });
    b.part(new THREE.ConeGeometry(0.006, 0.025, 5).translate(0, 0.0125, 0), CLAW, {
      at: toe,
      dir: [0, -0.3, 1],
    });
  }

  // ---- The half-eaten fig, resting on the floor ----
  b.part(new THREE.SphereGeometry(0.065, 20, 14), FIG, { at: [0, 0.06, 0.2] });
  b.part(
    new THREE.SphereGeometry(0.035, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    FLESH,
    { at: [0.02, 0.115, 0.25] },
  );
  b.part(new THREE.CylinderGeometry(0.004, 0.006, 0.02, 5), BONE, {
    at: [0, 0.125, 0.2],
  });

  return b.root;
}
