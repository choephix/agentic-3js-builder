// Lava golem: a hulking basalt-plated brute with glowing molten seams, cel-shaded in a Genshin-like palette.
import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, polyline, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A 3 m basalt golem built from chunky plates, with glowing molten seams, a furnace chest core, horned head, molten eyes and flame mane.",
};

const BASALT = cel("#4d485c", "#2c2a45");
const BASALT_L = cel("#726b82", "#403d60");
const BASALT_D = cel("#2f2c3e", "#1c1a2e");
const LAVA = "#ff8a1c";
const LAVA_H = "#ffd35a";
const LAVA_R = "#e8431c";

const CRACK = svg(
  `<svg viewBox="0 0 64 96"><g fill="none" stroke="#ff8a1c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 2 L28 22 L40 36 L30 54 L38 72 L32 94"/><path d="M28 22 L10 30 L6 46"/><path d="M40 36 L58 40 L60 58"/><path d="M30 54 L14 66"/></g>
  <g fill="none" stroke="#ffd35a" stroke-width="2" stroke-linecap="round"><path d="M32 6 L28 22 L40 36 L30 54 L38 72"/></g></svg>`,
  { size: 192 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 32"><path d="M2 20 L30 4 L62 10 L52 26 L24 30Z" fill="#ffd35a" stroke="#ff8a1c" stroke-width="3"/><rect x="26" y="9" width="12" height="16" rx="3" fill="#e8431c"/></svg>`,
  { size: 128 },
);
const FLAME = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 C28 18 32 40 24 64 L8 64 C0 40 4 18 16 0Z" fill="#ff8a1c"/><path d="M16 22 C24 36 24 50 20 64 L12 64 C8 50 10 36 16 22Z" fill="#ffd35a"/></svg>`,
  { size: 128 },
);

const ringPts = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 10) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.sin(a) * rx, cy, cz + Math.cos(a) * rz] as [number, number, number];
  });

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(7);

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.5, 0], [0, 1.75, 0.03], [0, 2.05, 0.06], [0, 2.35, 0.05]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.4, 0.08], aim: [0, 2.55, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.55, 0.15], aim: [0, 2.8, 0.25], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.6, 0.3], aim: [0, 2.55, 0.5], role: "jaw" });

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.4, 1.45, 0], [s * 0.5, 0.22, 0.05], [0.78, 0.7], [0, 0, 1]);
    legs[L] = b.chain(`leg${L}`, pts, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: [s * 0.5, 0, 0.1] });
    arms[L] = b.chain(`arm${L}`, polyline([[s * 0.75, 2.3, 0], [s * 1.2, 1.6, 0.15], [s * 1.3, 0.85, 0.45]]), {
      parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm",
    });
  }

  // torso
  const torso = b.loft(
    [
      { at: [0, 1.4, 0], w: 0.95, h: 0.7 },
      { at: [0, 1.75, 0.03], w: 1.0, h: 0.8 },
      { at: [0, 2.1, 0.06], w: 1.45, h: 0.95 },
      { at: [0, 2.38, 0.05], w: 1.3, h: 0.8 },
    ],
    { bone: [spine, hips], color: BASALT, sides: 8 },
  );
  const skin = b.surface(torso);
  b.decal(torso, CRACK, { at: [0, 2.0, 0.5], dir: [0, 0, 1], size: [0.7, 1.0], bone: chest }) && 0;
  const cr = b.decal(torso, CRACK, { at: [0, 1.9, 0.5], dir: [0, 0, 1], size: [0.7, 1.0], bone: chest });
  glow(cr, 1.3);
  // furnace core
  glow(b.part(new THREE.IcosahedronGeometry(0.2, 0), LAVA_H, { at: [0, 2.05, 0.5], bone: chest, flat: true }), 1.6);
  b.sweep(catmull(ringPts(0, 2.05, 0.5, 0.01, 0.01, 4), { closed: true }), 0.001, { bone: chest, color: LAVA });
  b.part(new THREE.TorusGeometry(0.27, 0.045, 5, 8), BASALT_D, { at: [0, 2.05, 0.5], bone: chest, flat: true });
  // plates
  for (const h of skin.scatter(30, { rng: R, minDist: 0.32, filter: (h) => h.n.y > -0.3 && h.n.z < 0.7 }))
    b.stick(new THREE.BoxGeometry(0.3, 0.07, 0.22), BASALT_L, h, { embed: 0.3, flat: true, spin: R() * 90 });
  // belt seam
  glow(b.sweep(skin.loop([0, 1.55, 0], { lift: 0.02 }), 0.035, { color: LAVA_R, sides: 5 }), 1.2);
  b.sweep(skin.loop([0, 1.65, 0], { lift: 0.03 }), [0.05, 0.05], { color: BASALT_D, sides: 6 });
  // pelvis slabs
  b.part(new THREE.BoxGeometry(1.0, 0.35, 0.7), BASALT_D, { at: [0, 1.38, 0], bone: hips, flat: true });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.3, 0.5, 0.15), BASALT_L, { at: [s * 0.3, 1.2, 0.36], bone: hips, flat: true });

  // back crystals/spikes
  for (let i = 0; i < 5; i++) {
    const y = 1.8 + i * 0.13;
    const x = (i % 2 ? 1 : -1) * 0.25;
    const pos: [number, number, number] = [x, y + 0.1, -0.45];
    b.part(new THREE.ConeGeometry(0.1 + 0.02 * i, 0.5, 5), BASALT_D, { at: pos, dir: [x * 0.6, 0.4, -1], bone: chest, flat: true });
    glow(b.part(new THREE.OctahedronGeometry(0.05), LAVA, { at: [x * 1.5, y + 0.2, -0.78], bone: chest, flat: true }), 1.4);
  }

  // head
  const skull = b.part(new THREE.BoxGeometry(0.75, 0.6, 0.65), BASALT, { at: [0, 2.75, 0.2], bone: head, flat: true });
  b.part(new THREE.BoxGeometry(0.85, 0.14, 0.7), BASALT_D, { at: [0, 2.96, 0.22], bone: head, flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.12, 0.2), BASALT_D, { at: [0, 2.84, 0.5], bone: head, flat: true }); // brow
  b.part(new THREE.BoxGeometry(0.62, 0.2, 0.55), BASALT_L, { at: [0, 2.5, 0.38], bone: jaw, flat: true });
  glow(b.part(new THREE.BoxGeometry(0.5, 0.06, 0.4), LAVA_R, { at: [0, 2.6, 0.4], bone: jaw, flat: true }), 1.3);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.28, 0.14), "#ffffff", { at: [s * 0.2, 2.76, 0.535], dir: [0, 0, 1], axis: "z", texture: EYE, bone: head }), 1.5);
    b.spike([s * 0.3, 2.95, 0.05], [s * 0.7, 1.0, -0.4], 0.6, 0.1, { bone: head, color: BASALT_L, sides: 6 });
    glow(b.part(new THREE.OctahedronGeometry(0.06), LAVA_H, { at: [s * 0.62 + s * 0.2, 3.5, -0.2], bone: head, flat: true }), 1.5);
    for (const t of [-0.2, 0, 0.2])
      b.spike([s * 0.15 + t * 0.4, 2.55, 0.62], [0, 1, 0.1], 0.1, 0.035, { bone: jaw, color: "#ffe6b0", sides: 4 });
  }
  b.sweep(catmull([[0, 2.45, 0.1], [0, 2.5, 0.15]]), 0.2, { bone: neck, color: BASALT_D, sides: 6 });
  // flame mane
  const mane = Array.from({ length: 9 }, (_, i) => {
    const a = ((i - 4) / 4) * 1.2;
    return frame([Math.sin(a) * 0.4, 3.0, -0.05 - Math.cos(a) * 0.1], [Math.sin(a) * 0.5, 1, -0.3]);
  });
  glow(b.cards(mane, FLAME, { size: [0.18, 0.5], bend: 15, bone: head, vary: 0.3, rng: R, flow: [0, 0, -1], cross: true }), 1.3);

  // legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = legs[L];
    b.sweep(leg, [0.36, 0.3, 0.22, 0.2], { color: BASALT, sides: 8 });
    const k = leg.at(0.5).at;
    b.part(new THREE.BoxGeometry(0.5, 0.4, 0.3), BASALT_L, { at: [k.x, k.y, k.z + 0.22], bone: leg.joints[1], flat: true });
    glow(b.sweep(catmull(ringPts(s * 0.43, 0.7, 0.0, 0.3, 0.3), { closed: true }), 0.03, { bone: leg.joints[1], color: LAVA, sides: 5 }), 1.2);
    b.part(new THREE.BoxGeometry(0.62, 0.28, 0.95), BASALT_D, { at: [s * 0.5, 0.14, 0.2], bone: leg.tip ?? leg.joints[2], flat: true });
    b.part(new THREE.BoxGeometry(0.5, 0.15, 0.4), BASALT_L, { at: [s * 0.5, 0.33, 0.3], bone: leg.tip ?? leg.joints[2], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.42, 0.03, 0.04), LAVA, { at: [s * 0.5, 0.2, 0.7], bone: leg.tip ?? leg.joints[2] }), 1.3);
  }

  // arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, [0.28, 0.3, 0.26, 0.24], { color: BASALT, sides: 8 });
    b.part(new THREE.IcosahedronGeometry(0.46, 0), BASALT_L, { at: [s * 0.85, 2.38, 0], bone: chest, flat: true });
    b.part(new THREE.BoxGeometry(0.8, 0.14, 0.7), BASALT_D, { at: [s * 0.9, 2.62, 0], bone: chest, rotation: [0, 0, -s * 20], flat: true });
    glow(b.sweep(catmull(ringPts(s * 1.22, 1.55, 0.15, 0.3, 0.3), { closed: true }), 0.03, { bone: arm.joints[1], color: LAVA, sides: 5 }), 1.2);
    const hand = arm.tip ?? arm.joints[2];
    const w = [s * 1.3, 0.85, 0.45] as [number, number, number];
    b.part(new THREE.BoxGeometry(0.5, 0.45, 0.5), BASALT_L, { at: [w[0], w[1] - 0.2, w[2]], bone: hand, flat: true });
    glow(b.part(new THREE.BoxGeometry(0.4, 0.04, 0.04), LAVA, { at: [w[0], w[1] - 0.05, w[2] + 0.25], bone: hand }), 1.3);
    [-0.17, -0.06, 0.06, 0.17].forEach((z, i) => {
      const base: [number, number, number] = [w[0] + s * 0.02, w[1] - 0.4, w[2] + z * 0.4 + 0.1];
      const f = b.chain(`finger${L}${i + 1}`, [base, [base[0], base[1] - 0.14, base[2] + 0.06 + z * 0.4], [base[0], base[1] - 0.26, base[2] + 0.12 + z * 0.6]], {
        parent: hand, names: [`finger${L}${i + 1}a`, `finger${L}${i + 1}b`], role: "digit",
      });
      b.sweep(f, [0.07, 0.05], { color: BASALT_D, sides: 5 });
    });
    b.rod([w[0] + s * 0.25, w[1] - 0.2, w[2]], [w[0] + s * 0.38, w[1] - 0.45, w[2] + 0.2], [0.07, 0.05], { bone: hand, color: BASALT_D, sides: 5 });
  }

  return b.root;
}
