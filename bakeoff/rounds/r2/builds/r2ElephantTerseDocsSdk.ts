import * as THREE from "three";
import { createBuilder, polyline, catmull, paint, mottle } from "../../../../src/index";

export const meta = {
  name: "African Elephant",
  description: "Stylized rigged African elephant: mottled hide, flapping ears, curved tusks, ringed trunk, separate jaw, tail with tuft.",
};

const GREY = "#8b8784";
const DARK = "#6c6866";
const LIGHT = "#a5a09b";
const EAR_IN = "#b78f89";
const IVORY = "#eee3c8";
const NAIL = "#d6ccba";
const EYE = "#1b1614";
const HAIR = "#3a3432";

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const coat = mottle(GREY, DARK, { size: 0.28, contrast: 0.55, seed: 3 });
  const coatB = mottle(DARK, "#5c5856", { size: 0.2, contrast: 0.5, seed: 5 });

  // ---------- spine & body ----------
  const hips = b.joint("hips", { at: [0, 1.75, -0.85], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 1.75, -0.85], [0, 1.8, 0], [0, 1.9, 0.9], [0, 1.95, 1.3]]), {
    parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"],
  });
  b.sweep(spine, (t) => [0.72 + 0.06 * Math.sin(Math.PI * t), 0.86 + 0.08 * Math.sin(Math.PI * t)], {
    color: coat, sides: 12,
  });

  // neck + head
  const neck = b.chain("neck", polyline([[0, 1.95, 1.0], [0, 2.02, 1.5]]), {
    parent: spine.joints[2], names: ["neck"], role: "neck",
  });
  b.sweep(neck, [0.6, 0.55], { color: coat, sides: 10 });
  const head = b.joint("head", { parent: neck, at: [0, 2.02, 1.5], dir: [0, -0.05, 1], role: "head" });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 9).scale(0.48, 0.58, 0.55), coat, {
    bone: head, at: [0, 2.0, 1.8],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8).scale(0.36, 0.28, 0.34), coat, { bone: head, at: [0, 2.46, 1.72] });
  // forehead bumps
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.17, 8, 6), LIGHT, { bone: head, at: [s * 0.2, 2.5, 1.9] });
  b.part(new THREE.SphereGeometry(0.27, 8, 6), coat, { bone: head, at: [0, 1.78, 2.15] });

  // eyes
  for (const s of [1, -1]) {
    const hit = b.surface(skull).around(skull.at).at(s * 72, 12);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.045, 6, 4), EYE, hit, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), DARK, hit, { embed: 0.3 });
    }
  }

  // jaw
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.55, 1.85], dir: [0, -0.05, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.34, 0.16, 0.5), LIGHT, { bone: jaw, at: [0, 1.48, 2.1] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.3), EAR_IN, { bone: jaw, at: [0, 1.56, 2.1] });

  // ---------- trunk ----------
  const trunkPath = catmull([
    [0, 1.82, 2.12], [0, 1.45, 2.42], [0, 1.0, 2.55], [0, 0.6, 2.58], [0, 0.35, 2.68], [0, 0.2, 2.9],
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 6, role: "tentacle" });
  b.sweep(trunk, (t) => 0.22 * (1 - t) + 0.07, {
    sides: 10,
    color: paint((_p, n, s) => (Math.floor(s[0] * 36) % 2 === 0 ? coat : coatB)),
  });
  const tj = trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1])
    b.spike([s * 0.03, 0.2, 2.9], [s * 0.02, 0.12, 2.98], null, 0.045, { color: LIGHT, bone: tj });

  // ---------- tusks ----------
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.24, 1.72, 2.15], [s * 0.32, 1.4, 2.4], [s * 0.35, 1.15, 2.78], [s * 0.3, 1.1, 3.2]]),
      [0.08, 0.0], { bone: head, color: IVORY, sides: 8, caps: { start: "flat", end: "point" } });

  // ---------- ears ----------
  const earOutline: [number, number][] = [
    [0, 0.2], [0.28, 0.32], [0.62, 0.22], [0.8, -0.12], [0.68, -0.6], [0.36, -0.88], [0.12, -0.55], [0, -0.1],
  ];
  const inner = earOutline.map(([x, y]) => [0.35 + (x - 0.35) * 0.72, -0.3 + (y + 0.3) * 0.72] as [number, number]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root: [number, number, number] = [s * 0.42, 2.3, 1.6];
    const ear = b.joint("ear" + side, { parent: head, at: root, dir: [s, 0, -0.3], role: "hinge" });
    const x: [number, number, number] = [s * 0.95, 0, -0.3];
    b.extrude(earOutline, { at: root, x, thickness: 0.04, bevel: 0.01, smoothing: 1, color: coat, bone: ear });
    b.extrude(inner, { at: root, x, thickness: 0.055, smoothing: 1, color: EAR_IN, bone: ear });
  }

  // ---------- legs ----------
  const legs: [number, number, boolean][] = [[0.42, 0.75, true], [0.42, -0.75, false]];
  for (const [ax, z, front] of legs)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pre = front ? "F" : "H";
      const x = s * ax;
      const leg = b.chain(
        `leg${pre}${side}`,
        polyline([[x, 1.35, z], [x, 0.7, z + (front ? 0.03 : -0.02)], [x, 0.14, z]]),
        {
          parent: front ? spine.joints[2] : hips,
          names: [`hip${pre}${side}`, `knee${pre}${side}`, `ankle${pre}${side}`],
          role: "leg", contact: [x, 0, z],
        },
      );
      b.sweep(leg, [0.33, 0.28, 0.25, 0.26], { sides: 10, color: coat, caps: { start: "round", end: "flat" } });
      const tip = leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.29, 0.31, 0.16, 10), LIGHT, { bone: tip, at: [x, 0.07, z] });
      for (let k = 0; k < 4; k++) {
        const a = (-45 + k * 30) * (Math.PI / 180);
        b.part(new THREE.BoxGeometry(0.1, 0.09, 0.05), NAIL, {
          bone: tip,
          at: [x + Math.sin(a) * 0.3, 0.07, z + Math.cos(a) * 0.3],
          dir: [Math.sin(a), 0, Math.cos(a)], axis: "z",
        });
      }
      // knee wrinkle band
      b.part(new THREE.TorusGeometry(0.27, 0.025, 5, 10), DARK, {
        bone: leg.joints[1], at: [x, 0.7, z], dir: [0, 1, 0],
      });
    }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 1.9, -1.45], [0, 1.6, -1.72], [0, 1.2, -1.82], [0, 0.8, -1.82]]), {
    parent: hips, count: 3, role: "tail",
  });
  b.sweep(tail, [0.06, 0.025], { color: coat, sides: 6 });
  b.ring(tail.at(1), { count: 7, radius: 0.015, tilt: 25 }, (it) =>
    b.spike(it, it, 0.2, 0.022, { color: HAIR, sides: 5 }),
  );

  return b.root;
}
