import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, svg, paint, mottle, grain, noise, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Folk-art log hut standing on giant chicken legs, with carved shutters, a kokoshnik roof and a glowing window.",
};

const WOOD = "#9a6a3a";
const WOOD_D = "#6b4423";
const RED = "#c8321e";
const BLUE = "#2a5fa8";
const GOLD = "#e9b232";
const CREAM = "#f3e3b8";
const GREEN = "#3f7d3a";
const SCALE = "#d8a23a";
const CLAW = "#4a3220";

export default function build() {
  const b = createBuilder({ name: "hut" });
  const R = rng(7);

  const logs = paint((p, n, s) => {
    const k = noise(p, 0.08, 3);
    const row = Math.abs(((p.y / 0.11) % 1) - 0.5) * 2;
    const base = k > 0.5 ? WOOD : "#8a5c30";
    return row > 0.86 ? WOOD_D : base;
  });
  const thatch = grain("#b98a3e", "#7a5a22", { size: 0.04, axis: "x", seed: 2 });
  const moss = mottle("#3f7d3a", "#6a9a4a", { size: 0.12, seed: 4 });

  const root = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const hut = b.joint("hutBody", { parent: root, at: [0, 1.6, 0], dir: [0, 1, 0] });

  // legs
  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    const hip = [s * 0.45, 1.55, -0.05];
    const foot = [s * 0.55, 0.05, 0.1];
    const pts = limb(hip, foot, [0.85, 0.75], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, { parent: root, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.09, 0.06], { color: SCALE, sides: 6 });
    // scaly bands
    b.along(leg, 7, (at) => {
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), "#b98228", { at: at.at, dir: at.tangent });
    });
    // toes
    const ank = pts[2];
    const toes: [number, number][] = [[-0.3, 0.5], [0, 0.6], [0.3, 0.5]];
    toes.forEach(([a, l], i) => {
      const tip: number[] = [ank.x + Math.sin(a) * l * 0.8 + s * 0.05, 0.03, ank.z + Math.cos(a) * l];
      const t = b.chain(`toe${side}${i}`, [[ank.x, 0.06, ank.z], [(ank.x + tip[0]) / 2, 0.05, (ank.z + tip[2]) / 2], tip], {
        parent: leg.joints[leg.joints.length - 1],
        names: [`toe${side}${i}a`, `toe${side}${i}b`],
        role: "digit",
      });
      b.sweep(t, [0.055, 0.04], { color: SCALE, sides: 6 });
      b.spike([tip[0], 0.04, tip[2]], [0, -0.1, 1], 0.14, 0.04, CLAW, { bone: t.joints[1] });
    });
    // back toe
    const bt = b.chain(`toe${side}back`, [[ank.x, 0.07, ank.z], [ank.x, 0.05, ank.z - 0.3]], {
      parent: leg.joints[leg.joints.length - 1], names: [`toe${side}back1`], role: "digit",
    });
    b.sweep(bt, 0.05, { color: SCALE, sides: 6 });
    b.spike([ank.x, 0.05, ank.z - 0.3], [0, 0, -1], 0.12, 0.04, CLAW, { bone: bt.joints[0] });
    // feathery thigh fluff
    b.part(new THREE.IcosahedronGeometry(0.2, 0), "#d8b25a", { bone: root, at: [s * 0.45, 1.5, -0.05], scale: [1, 1.1, 1.2], flat: true });
  }

  // floor platform
  b.part(new THREE.BoxGeometry(1.6, 0.18, 1.6), logs, { bone: hut, at: [0, 1.62, 0] });
  // cross log ends under floor
  for (let i = -3; i <= 3; i++)
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 8), WOOD_D, { bone: hut, at: [0, 1.52, i * 0.22], dir: [1, 0, 0] });

  // walls: stacked logs
  for (let i = 0; i < 9; i++) {
    const y = 1.78 + i * 0.12;
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 8), i % 2 ? WOOD : "#8a5c30", { bone: hut, at: [0, y, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 8), i % 2 ? "#8a5c30" : WOOD, { bone: hut, at: [0, y, -0.7], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 8), i % 2 ? WOOD : "#8a5c30", { bone: hut, at: [0.7, y, 0], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 8), i % 2 ? "#8a5c30" : WOOD, { bone: hut, at: [-0.7, y, 0], dir: [0, 0, 1] });
    // log end knobs at corners
    for (const sx of [1, -1]) for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), "#c79a5a", { bone: hut, at: [sx * 0.78, y, sz * 0.7], dir: [1, 0, 0] });
  }
  b.part(new THREE.BoxGeometry(1.4, 1.0, 1.4), WOOD_D, { bone: hut, at: [0, 2.3, 0] });

  // gables (front/back triangles)
  const gable: [number, number][] = [[-0.75, 0], [0.75, 0], [0, 0.85]];
  for (const z of [0.7, -0.7])
    b.extrude(gable, { at: [0, 2.85, z], x: [1, 0, 0], thickness: 0.12, color: logs, bone: hut });

  // roof planks
  for (const s of [1, -1]) {
    const roof = b.part(new THREE.BoxGeometry(1.2, 0.08, 1.75), thatch, {
      bone: hut, at: [s * 0.52, 3.2, 0], rotation: [0, 0, s * 38],
    });
    // scalloped shingle ridge
    for (let i = 0; i < 7; i++) {
      const z = -0.72 + i * 0.24;
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), RED, {
        bone: hut, at: [s * 1.02, 2.78, z], rotation: [90, 0, s * 38], scale: [1, 1, 1],
      });
    }
  }
  // ridge log + carved horse-head ends
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 8), RED, { bone: hut, at: [0, 3.55, 0], dir: [0, 0, 1] });
  for (const z of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.14, 6, 5), GOLD, { bone: hut, at: [0, 3.55, z * 0.98], flat: true });
    b.part(new THREE.ConeGeometry(0.07, 0.25, 5), GOLD, { bone: hut, at: [0, 3.55, z * 1.15], dir: [0, 0, z] });
  }

  // chimney with smoke
  b.part(new THREE.BoxGeometry(0.25, 0.5, 0.25), "#8a8a8a", { bone: hut, at: [-0.5, 3.4, -0.3] });
  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.3), "#555", { bone: hut, at: [-0.5, 3.68, -0.3] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.IcosahedronGeometry(0.1 + i * 0.04, 0), "#e6e1d8", { bone: hut, at: [-0.5 + i * 0.05, 3.9 + i * 0.22, -0.3], flat: true });

  // front window w/ glow
  const win = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffc94a"/><path d="M32 0V64M0 32H64" stroke="#5a3515" stroke-width="5"/><rect x="1" y="1" width="62" height="62" fill="none" stroke="#5a3515" stroke-width="3"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: hut, at: [0.25, 2.35, 0.81], dir: [0, 0, 1], axis: "z", texture: win }), 1.4);

  // shutters + carved frame
  const shutter = svg(`<svg viewBox="0 0 32 64"><rect width="32" height="64" fill="#2a5fa8"/><path d="M16 6 Q26 16 16 26 Q6 16 16 6Z" fill="#e9b232"/><circle cx="16" cy="40" r="6" fill="#c8321e"/><path d="M16 48 L22 60 H10Z" fill="#f3e3b8"/><rect x="1" y="1" width="30" height="62" fill="none" stroke="#f3e3b8" stroke-width="2"/></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.2, 0.4), "#ffffff", { bone: hut, at: [0.25 + s * 0.31, 2.35, 0.81], dir: [0, 0, 1], axis: "z", texture: shutter });
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.08), CREAM, { bone: hut, at: [0.25, 2.62, 0.8] });
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.08), CREAM, { bone: hut, at: [0.25, 2.08, 0.8] });
  b.extrude([[-0.45, 0], [0.45, 0], [0.38, 0.14], [0, 0.26], [-0.38, 0.14]], { at: [0.25, 2.64, 0.8], x: [1, 0, 0], thickness: 0.05, color: RED, bone: hut, smoothing: 1 });

  // door on left front
  const door = svg(`<svg viewBox="0 0 40 70"><rect width="40" height="70" fill="#c8321e"/><path d="M20 8 L32 22 L20 36 L8 22Z" fill="#e9b232"/><path d="M20 38 L32 52 L20 66 L8 52Z" fill="#2a5fa8"/><circle cx="20" cy="22" r="4" fill="#f3e3b8"/><circle cx="20" cy="52" r="4" fill="#f3e3b8"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.34, 0.6), "#ffffff", { bone: hut, at: [-0.4, 2.1, 0.81], dir: [0, 0, 1], axis: "z", texture: door });
  // steps
  for (let i = 0; i < 3; i++)
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.18), WOOD, { bone: hut, at: [-0.4, 1.68 - i * 0.0, 0.9 + i * 0.0 + 0.1 * i], scale: 1 });

  // skull lanterns on fence-less posts: glowing skulls at corners
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 6, 5), CREAM, { bone: hut, at: [sx * 0.85, 1.95, 0.85], flat: true });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), "#ffb030", { bone: hut, at: [sx * 0.8, 1.97, 0.94] }), 2);
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), "#ffb030", { bone: hut, at: [sx * 0.9, 1.97, 0.94] }), 2);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), WOOD_D, { bone: hut, at: [sx * 0.85, 1.75, 0.85] });
  }

  // moss on roof
  for (let i = 0; i < 6; i++)
    b.part(new THREE.IcosahedronGeometry(0.1, 0), moss, { bone: hut, at: [(R() - 0.5) * 1.6, 3.0 + R() * 0.2, (R() - 0.5) * 1.5], scale: [1.2, 0.5, 1], flat: true });

  return b.root;
}
