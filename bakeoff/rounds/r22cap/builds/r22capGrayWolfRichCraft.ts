import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, mottle } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description: "A gray wolf standing alert, ears pricked, with a worn leather collar and tooth charm, in chunky hand-painted Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const DARK = "#3b4558";
const MID = "#6c7a90";
const LIGHT = "#a3afc0";
const CREAM = "#eadcbc";
const SOCK = "#bfae8c";
const NOSE = "#16141a";
const AMBER = "#ffb41f";
const LEATHER = "#8a4a22";
const LEATHER_D = "#5b2f14";
const GOLD = "#e0ac2e";
const BONE = "#f4ecd6";
const CLAW = "#2a2530";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "grayWolf" });
  const r = rng(11);

  const coat = countershade(mottle(DARK, MID, { size: 0.08, contrast: 0.8, seed: 3 }), CREAM, { level: -0.15, soft: 0.35 });
  const legCoat = gradient(coat, SOCK, [0, 0.5, 0], [0, 0.12, 0]);
  const tailCoat = gradient(gradient(coat, "#2a303c", [0, 0.5, -0.9], [0, 0.4, -1.1]), "#2a303c", [0, 0.5, -0.9], [0, 0.35, -1.05]);

  // torso
  const bodyPath = catmull([[0, 0.66, -0.55], [0, 0.68, -0.12], [0, 0.66, 0.32]]);
  const body = b.sweep(bodyPath, (t: number) => [0.12 + 0.05 * Math.sin(Math.PI * t), 0.15 + 0.07 * t] as [number, number], {
    color: coat,
    sides: 10,
  });
  // haunch and shoulder masses (chunky)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 9, 7), coat, { at: [s * 0.14, 0.62, -0.5], scale: [0.11, 0.2, 0.2] });
    b.part(new THREE.SphereGeometry(1, 9, 7), coat, { at: [s * 0.15, 0.62, 0.3], scale: [0.1, 0.2, 0.17] });
  }

  // neck
  const neckPath = catmull([[0, 0.7, 0.28], [0, 0.8, 0.45], [0, 0.93, 0.6]]);
  const neck = b.sweep(neckPath, [0.15, 0.11], { color: coat, sides: 10 });

  // chest ruff and neck ruff tufts
  const furHits = b.surface(body).scatter(150, { rng: r, minDist: 0.07, filter: (h) => h.n.y > -0.4 });
  for (const h of furHits) b.stick(new THREE.ConeGeometry(0.022, 0.08, 4), LIGHT, h);
  const neckHits = b.surface(neck).scatter(60, { rng: r, minDist: 0.05 });
  for (const h of neckHits) b.stick(new THREE.ConeGeometry(0.022, 0.09, 4), h.n.y < -0.2 ? CREAM : LIGHT, h);
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.04;
    b.spike([x, 0.64, 0.38], [x * 0.5, -0.9, 0.45], 0.13, 0.026, CREAM);
  }

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, { at: [0, 0.98, 0.7], scale: [0.105, 0.095, 0.12] });
  const snout = b.sweep([[0, 0.96, 0.78], [0, 0.93, 1.0]], [0.068, 0.04], { color: gradient(MID, CREAM, [0, 0, 0.8], [0, 0, 1.0]), sides: 8, caps: "flat" });
  b.rod([0, 0.915, 0.78], [0, 0.9, 0.98], [0.04, 0.03], CREAM, { sides: 6 });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { at: [0, 0.94, 1.012], scale: [0.034, 0.026, 0.026] });
  b.rod([-0.045, 0.912, 0.81], [-0.015, 0.905, 1.0], 0.005, NOSE, { sides: 4 });
  b.rod([0.045, 0.912, 0.81], [0.015, 0.905, 1.0], 0.005, NOSE, { sides: 4 });
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.spike([s * (0.036 - i * 0.004), 0.912, 0.9 + i * 0.03], [0, -1, 0], 0.022 - i * 0.003, 0.006, BONE, { sides: 4 });
    }
    // cheek ruff
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.085, 0.93 + i * 0.012 - 0.02, 0.68 - i * 0.015], [s * 0.7, -0.35, -1], 0.1 - i * 0.008, 0.026, i % 2 ? LIGHT : CREAM, { sides: 4 });
    }
    // ears
    b.spike([s * 0.065, 1.04, 0.66], [s * 0.15, 1, -0.25], 0.15, 0.052, DARK, { sides: 5 });
    b.spike([s * 0.063, 1.04, 0.675], [s * 0.15, 1, -0.25], 0.115, 0.034, "#caa88a", { sides: 5 });
    // eyes
    const eye = b.part(new THREE.SphereGeometry(1, 8, 6), AMBER, { at: [s * 0.068, 1.0, 0.782], scale: [0.02, 0.019, 0.019] });
    glow(eye, 0.6);
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, { at: [s * 0.075, 1.0, 0.797], scale: [0.009, 0.012, 0.008] });
    // brow
    b.rod([s * 0.04, 1.03, 0.795], [s * 0.095, 1.025, 0.76], 0.012, DARK, { sides: 5 });
    b.rod([s * 0.04, 1.02, 0.84], [s * 0.052, 1.0, 0.8], 0.007, NOSE, { sides: 4 });
  }
  b.surface(skull);
  b.surface(snout);

  // legs
  const claws: Array<[number, number, number]> = [];
  for (const s of [1, -1]) {
    // front
    const fl = catmull([[s * 0.15, 0.62, 0.3], [s * 0.14, 0.4, 0.29], [s * 0.125, 0.16, 0.32]]);
    b.sweep(fl, [0.085, 0.052], { color: legCoat, sides: 8, caps: "flat" });
    b.part(new THREE.SphereGeometry(1, 8, 6), legCoat, { at: [s * 0.14, 0.4, 0.29], scale: [0.07, 0.07, 0.075] });
    b.part(new THREE.SphereGeometry(1, 9, 7), SOCK, { at: [s * 0.125, 0.044, 0.36], scale: [0.078, 0.048, 0.115] });
    // hind
    const hl = catmull([[s * 0.17, 0.66, -0.5], [s * 0.19, 0.44, -0.36], [s * 0.15, 0.27, -0.62], [s * 0.13, 0.12, -0.6]]);
    b.sweep(hl, [0.1, 0.048], { color: legCoat, sides: 8, caps: "flat" });
    b.part(new THREE.SphereGeometry(1, 8, 6), legCoat, { at: [s * 0.15, 0.27, -0.62], scale: [0.058, 0.07, 0.065] });
    b.part(new THREE.SphereGeometry(1, 9, 7), SOCK, { at: [s * 0.13, 0.044, -0.54], scale: [0.074, 0.048, 0.112] });
    // dewclaw tuft
    b.spike([s * 0.125, 0.2, 0.37], [0, -0.6, 1], 0.05, 0.016, SOCK, { sides: 4 });
    for (const [px, pz] of [[s * 0.125, 0.36], [s * 0.13, -0.54]] as Array<[number, number]>) {
      for (let i = -1; i <= 1; i++) claws.push([px + i * 0.032, 0.03, pz + 0.095]);
    }
    // toe grooves
    for (const pz of [0.36, -0.54]) {
      for (const i of [-0.5, 0.5]) {
        b.rod([s * 0.125 + i * 0.03, 0.012, pz + 0.04], [s * 0.125 + i * 0.03, 0.03, pz + 0.115], 0.004, "#8a7a5e", { sides: 4 });
      }
    }
  }
  for (const c of claws) b.spike([c[0], c[1], c[2]], [0, -0.4, 1], 0.045, 0.01, CLAW, { sides: 4 });

  // tail
  const tailPath = catmull([[0, 0.7, -0.64], [0, 0.62, -0.86], [0, 0.46, -1.02], [0, 0.3, -1.1]]);
  b.sweep(tailPath, (t: number) => [0.045 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.2)) + 0.01, 0.045 + 0.045 * Math.sin(Math.PI * Math.min(1, t * 1.2))] as [number, number], {
    color: tailCoat,
    sides: 9,
    caps: "point",
  });
  const tailHits = b.surface(b.sweep(tailPath, 0.01, { color: coat, sides: 4 })).scatter(0, {});
  for (const h of tailHits) b.stick(new THREE.ConeGeometry(0.02, 0.06, 4), LIGHT, h);
  for (let i = 0; i < 9; i++) {
    const p = tailPath.at(0.12 + i * 0.09);
    b.spike(p, [0.8 * (i % 2 ? 1 : -1), 0.2, -0.2], 0.07, 0.022, i > 5 ? DARK : LIGHT, { sides: 4 });
  }

  // back mane ridge
  for (let i = 0; i < 12; i++) {
    const p = bodyPath.at(0.1 + i * 0.07);
    b.spike([p.x, p.y + 0.14 + 0.05 * (i / 12), p.z], [0, 1, 0.5], 0.065, 0.024, i % 2 ? DARK : "#2c3342", { sides: 4 });
  }

  // collar with studs and tooth charm
  const c = neckPath.at(0.3);
  const d = neckPath.tangentAt(0.3).clone().normalize();
  const u = new THREE.Vector3(1, 0, 0);
  const v = new THREE.Vector3().crossVectors(d, u).normalize();
  b.part(new THREE.TorusGeometry(0.15, 0.016, 5, 14), LEATHER, { at: c, dir: d, axis: "z" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p = c.clone().addScaledVector(u, Math.cos(a) * 0.152).addScaledVector(v, Math.sin(a) * 0.152);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: p });
  }
  const bottom = c.clone().addScaledVector(v, -0.15);
  b.part(new THREE.TorusGeometry(0.016, 0.004, 4, 8), GOLD, { at: bottom.clone().add(new THREE.Vector3(0, -0.012, 0.012)), rotation: [0, 90, 0] });
  b.spike(bottom.clone().add(new THREE.Vector3(0, -0.02, 0.016)), [0, -1, 0.1], 0.08, 0.018, BONE, { sides: 6 });
  b.rod(bottom.clone().add(new THREE.Vector3(0, -0.025, 0.02)), bottom.clone().add(new THREE.Vector3(0, -0.035, 0.02)), 0.02, LEATHER_D, { sides: 6 });

  return b.root;
}
