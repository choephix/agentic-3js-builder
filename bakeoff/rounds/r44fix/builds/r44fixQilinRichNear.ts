import * as THREE from "three";
import { createBuilder, rng, limb, catmull, bezier, paint, mix, noise, smoothstep, scales, countershade, svg, frame } from "../../../../src/index";
import type { Chain, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description: "A scaled, hooved chimera with branching antlers, a swirling cloud mane, a flame-tipped tail and jade-gold ornaments, in a high-fantasy anime style.",
};

const TEAL = "#2fb8a6", TEAL_D = "#1b6f7a", JADE = "#7ff0c8", CREAM = "#fff1cf", GOLD = "#f2bf4a", GOLD_D = "#a8731c";
const RED = "#e8503a", CLOUD_A = "#ff9ac2", CLOUD_B = "#ffd6a8", CLOUD_C = "#b9a8ff", HOOF = "#3a2a2e", INK = "#2a1738";

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const R = rng(5);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const hips = b.joint("hips", { at: [0, 1.15, -0.55], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.15, -0.55], [0, 1.2, -0.1], [0, 1.25, 0.35], [0, 1.28, 0.55]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 1.35, 0.5], [0, 1.6, 0.75], [0, 1.82, 0.95]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const hp = neck.at(1).at.clone();
  const head = b.joint("head", { parent: neck.joints[1], at: hp, dir: [0, -0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, hp.y - 0.12, hp.z + 0.12], aim: [0, hp.y - 0.17, hp.z + 0.4], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 1.25, -0.9], [0, 1.2, -1.25], [0, 1.0, -1.5], [0, 0.85, -1.6]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  const coat = countershade(scales(TEAL, TEAL_D, { size: 0.05, width: 0.14 }), CREAM, { level: -0.45 });

  const bodySweep = b.sweep(spine, (t) => [0.27 + 0.03 * t, 0.32 + 0.03 * t], { color: coat, sides: 12, name: "body" });
  b.sweep(neck, (t) => [0.17 - 0.06 * t, 0.2 - 0.07 * t], { color: coat, sides: 10, name: "neck" });
  b.sweep(tail, [0.08, 0.03], { color: coat, sides: 8, name: "tailTube" });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: head, at: [0, hp.y - 0.02, hp.z + 0.1], scale: [0.16, 0.17, 0.22], name: "skull" });
  b.part(new THREE.BoxGeometry(0.17, 0.12, 0.26), coat, { bone: head, at: [0, hp.y - 0.1, hp.z + 0.3], name: "muzzle" });
  b.part(new THREE.BoxGeometry(0.15, 0.06, 0.24), CREAM, { bone: jaw, at: [0, hp.y - 0.19, hp.z + 0.27], name: "lowerJaw" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), INK, { bone: head, at: [s * 0.05, hp.y - 0.08, hp.z + 0.43], name: "nostril" });
    const k = s > 0 ? "L" : "R";
    // whisker tendrils
    b.sweep(catmull([[s * 0.08, hp.y - 0.12, hp.z + 0.36], [s * 0.3, hp.y - 0.1, hp.z + 0.4], [s * 0.45, hp.y - 0.25, hp.z + 0.3], [s * 0.5, hp.y - 0.5, hp.z + 0.2]]), [0.012, 0.003], { bone: head, color: GOLD, sides: 4, name: "whisker" + k });
    // eyes
    const eye = svg(`<svg viewBox="0 0 64 48"><path d="M2 30 Q32 -6 62 24 Q32 50 2 30Z" fill="${INK}"/><circle cx="32" cy="27" r="14" fill="#ffb02e"/><circle cx="32" cy="27" r="7" fill="${INK}"/><circle cx="26" cy="21" r="5" fill="#fff"/><path d="M2 30 Q32 -10 62 24" stroke="${INK}" stroke-width="5" fill="none"/></svg>`, { size: 128 });
    b.decal(skull, eye, { at: [s * 0.13, hp.y + 0.0, hp.z + 0.22], dir: [s * 0.8, 0.1, 0.6], size: [0.1, 0.075], mirror: s < 0, name: "eye" + k });
    // ears
    const ear = b.joint("ear" + k, { parent: head, at: [s * 0.12, hp.y + 0.1, hp.z + 0.02], dir: [s * 0.8, 0.5, -0.4], role: "hinge" });
    b.spike(ear, [s * 0.8, 0.5, -0.4], 0.16, 0.045, { color: coat, sides: 5, bone: ear });
    // antlers
    const a0 = V(s * 0.07, hp.y + 0.14, hp.z - 0.02);
    const main = [a0, a0.clone().add(V(s * 0.05, 0.2, -0.1)), a0.clone().add(V(s * 0.12, 0.4, -0.12)), a0.clone().add(V(s * 0.1, 0.62, -0.2))];
    b.sweep(catmull(main), [0.03, 0.008], { bone: head, color: GOLD, sides: 6, caps: { start: "flat", end: "point" }, name: "antler" + k });
    for (const t of [0.35, 0.65]) {
      const p = catmull(main).at(t);
      b.spike(p, [s * 0.7, 0.8, 0.5 - t], 0.2 - 0.05 * t, 0.018, { bone: head, color: GOLD, sides: 5 });
    }
    b.part(new THREE.IcosahedronGeometry(0.025, 0), JADE, { bone: head, at: main[0].toArray(), flat: true });
  }
  // brow gem
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), RED, { bone: head, at: [0, hp.y + 0.12, hp.z + 0.2], flat: true, name: "browGem" }), 1.2);
  // single central horn
  b.spike([0, hp.y + 0.14, hp.z + 0.08], [0, 0.7, 0.5], 0.2, 0.03, { bone: head, color: CREAM, sides: 6 });

  // legs
  const legs: Chain[] = [];
  for (const s of [1, -1])
    for (const front of [true, false]) {
      const k = (front ? "F" : "H") + (s > 0 ? "L" : "R");
      const z = front ? 0.45 : -0.55;
      const pts = limb([s * 0.2, 1.0, z], [s * 0.2, 0.08, z + 0.03], front ? [0.4, 0.38, 0.2] : [0.45, 0.4, 0.2], front ? [[0, 0, -1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]]);
      const leg = b.chain("leg" + k, pts, { parent: front ? chest : hips, role: "leg", names: ["hip" + k, "knee" + k, "ankle" + k, "hoof" + k], contact: [s * 0.2, 0, z] });
      legs.push(leg);
      b.sweep(leg, [0.1, 0.075, 0.05, 0.045], { color: coat, sides: 8, name: "leg" + k });
      b.part(new THREE.SphereGeometry(0.15, 8, 6), coat, { bone: leg.joints[0], at: [s * 0.2, 1.0, z], scale: [0.85, 1.2, 1], name: "thigh" });
      b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.1, 6), HOOF, { bone: leg.tip!, at: [s * 0.2, 0.05, z + 0.04], flat: true, name: "hoof" });
      b.part(new THREE.TorusGeometry(0.052, 0.012, 4, 8), GOLD, { bone: leg.tip!, at: [s * 0.2, 0.14, z + 0.03], dir: [0, 1, 0], axis: "z" });
      // cloud wisp at ankle
      b.ring(leg.joints[2], { count: 4, radius: 0.04, tilt: 70 }, (it) => b.spike(it, it, 0.12, 0.025, { color: CLOUD_B, sides: 4 }));
    }

  // cloud mane tufts
  const cloudCols = [CLOUD_A, CLOUD_B, CLOUD_C, CLOUD_A];
  const tuft = (at: THREE.Vector3, d: THREE.Vector3, L: number, c: string, bone: Joint) => {
    const tip = at.clone().addScaledVector(d, L);
    const mid = at.clone().addScaledVector(d, L * 0.5).add(V(0, 0.08, 0));
    b.sweep(bezier(at, mid, tip), [0.05, 0.0], { bone, color: c, sides: 5, caps: { start: "round", end: "point" } });
  };
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const cp = neck.at(Math.min(0.98, t));
    const base = cp.at.clone().add(V(0, 0.18 - 0.06 * t, -0.05));
    for (const s of [-1, 0, 1]) tuft(base.clone().add(V(s * 0.05, 0, 0)), V(s * 0.4, 0.2, -0.8).normalize(), 0.3 + 0.1 * R(), cloudCols[(i + s + 1) % 4], cp.bone as Joint);
    b.part(new THREE.IcosahedronGeometry(0.075, 0), cloudCols[i % 4], { bone: cp.bone as Joint, at: base.toArray(), flat: true });
  }
  // tail flame plume
  const te = tail.at(1).at;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    tuft(te.clone(), V(Math.cos(a) * 0.5, -0.1 + Math.sin(a) * 0.4, -0.7).normalize(), 0.4, i % 2 ? RED : GOLD, tail.joints[2]);
  }
  // body decals: golden cloud swirl on flanks
  const swirl = svg(`<svg viewBox="0 0 100 60"><path d="M10 40 Q10 15 35 20 Q55 25 45 40 Q35 48 30 38 M60 35 Q62 12 85 22 Q95 32 82 42" stroke="${GOLD}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`, { size: 256 });
  const bodyMesh = b.surface(bodySweep);
  for (const s of [1, -1]) b.decal(bodyMesh, swirl, { at: [s * 0.3, 1.2, -0.1], dir: [s, 0, 0], size: [0.4, 0.24], mirror: s < 0 });
  // chest pendant
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), JADE, { bone: neck.joints[0], at: [0, 1.28, 0.78], flat: true }), 1);
  b.part(new THREE.TorusGeometry(0.2, 0.014, 4, 12), GOLD_D, { bone: neck.joints[0], at: [0, 1.5, 0.66], dir: [0, 0.6, 1], axis: "z" });
  void frame;
  return b.root;
}
