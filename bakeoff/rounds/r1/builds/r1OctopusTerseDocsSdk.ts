import * as THREE from "three";
import { createBuilder, rng, catmull, countershade, spots, mottle } from "../../../../src/index";

export const meta = {
  name: "Octopus",
  description:
    "Stylized common octopus resting on the sea floor: bulbous mottled mantle, gold slit-pupil eyes, eight splayed curling arms with two rows of suckers each, siphon, papillae and a two-part beak.",
};

const SKIN_A = "#cf5a3f";
const SKIN_B = "#a83a32";
const SPOT = "#e58a63";
const BELLY = "#ebb594";
const SUCKER = "#f6dccb";
const SUCKER_IN = "#d98b8b";
const EYE = "#e8b93a";
const BLACK = "#15100f";
const RIM = "#8e2f2a";
const BEAK = "#3b2a22";

export default function build() {
  const b = createBuilder({ name: "octopus" });

  const skin = countershade(
    spots(mottle(SKIN_A, SKIN_B, { size: 0.06, seed: 3 }), SPOT, { size: 0.05, amount: 0.35, seed: 5 }),
    BELLY,
    { level: -0.35 },
  );

  // ---- skeleton: body + mantle
  const body = b.joint("body", { at: [0, 0.11, 0], role: "spine" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.11, 0],
      [0, 0.2, -0.02],
      [0, 0.3, -0.07],
      [0, 0.4, -0.14],
    ]),
    { parent: body, count: 3, role: "spine" },
  );
  const mantleSweep = b.sweep(mantle, [0.1, 0.105, 0.115, 0.1, 0.075], { color: skin, sides: 12 });
  const bodySurf = b.surface(mantleSweep);

  // ---- arms
  const rad = (t: number) => 0.05 * (1 - t) + 0.008;
  const ts = [0, 0.2, 0.4, 0.6, 0.8, 1];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const d = [Math.sin(a), 0, Math.cos(a)];
    const p = [Math.cos(a), 0, -Math.sin(a)];
    const sgn = i % 2 ? 1 : -1;
    const pts = ts.map((t, k) => {
      const R = 0.05 + 0.5 * t;
      const side = sgn * 0.08 * t * t;
      let y = rad(t) * 0.98;
      if (k === 0) y = 0.085;
      if (k === 4) y = rad(t) + 0.008;
      if (k === 5) y = rad(t) + 0.035;
      return [d[0] * R + p[0] * side, y, d[2] * R + p[2] * side];
    });
    const arm = b.chain(`arm${i + 1}_`, catmull(pts), { parent: body, count: 5, role: "tentacle" });
    const sw = b.sweep(arm, (t: number) => rad(t), { color: skin, sides: 8 });

    // suckers in two rows on the underside
    const n = 11;
    for (const deg of [145, 215]) {
      for (let k = 0; k < n; k++) {
        const t = 0.1 + (0.8 * k) / (n - 1);
        const hit = sw.at(t, deg);
        const sr = rad(t) * 0.55;
        b.stick(new THREE.CylinderGeometry(1, 1.1, 0.35, 8), SUCKER, hit, { embed: 0.2, scale: sr });
        b.stick(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 8), SUCKER_IN, hit, { embed: 0.2, scale: sr });
      }
    }
  }

  // ---- eyes
  for (const s of [1, -1]) {
    const hit = bodySurf.around([0, 0.2, -0.02]).at(s * 55, 18);
    if (!hit) continue;
    b.stick(new THREE.TorusGeometry(0.034, 0.009, 5, 12).rotateX(Math.PI / 2), RIM, hit, { embed: 0.3 });
    const eye = b.stick(new THREE.SphereGeometry(0.03, 10, 8), EYE, hit, { embed: 0.35 });
    const o = eye.at.clone().addScaledVector(eye.axis, 0.12);
    const ph = b.surface(eye).ray(o, eye.axis.clone().negate());
    if (ph) b.stick(new THREE.BoxGeometry(0.036, 0.008, 0.009), BLACK, ph, { embed: 0.5 });
  }

  // ---- siphon
  const sip = bodySurf.around([0, 0.17, 0]).at(-50, -15);
  if (sip) b.stick(new THREE.CylinderGeometry(0.014, 0.022, 0.06, 7), SKIN_B, sip, { embed: 0.25 });

  // ---- papillae on the mantle
  const bumps = bodySurf.scatter(34, {
    rng: rng(2),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.05 && h.at.y > 0.24,
  });
  for (const h of bumps) b.stick(new THREE.ConeGeometry(0.013, 0.025, 5), SPOT, h, { embed: 0.3 });

  // ---- beak: separate upper and lower jaw
  const jaw = b.joint("jaw", {
    parent: body,
    at: [0, 0.035, 0.0],
    aim: [0, 0.01, 0.04],
    role: "jaw",
  });
  b.part(new THREE.ConeGeometry(0.02, 0.045, 6), BEAK, { bone: body, at: [0, 0.03, 0.015], dir: [0, -1, 0.3] });
  b.part(new THREE.ConeGeometry(0.016, 0.035, 6), BEAK, { bone: jaw, at: [0, 0.024, 0.03], dir: [0, -0.4, 1] });

  return b.root;
}
