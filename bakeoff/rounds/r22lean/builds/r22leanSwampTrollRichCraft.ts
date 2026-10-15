import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { countershade, gradient, grain, mottle, paint, scales, stripes } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hulking, hunched bog troll with moss-draped hump, tusked underbite, bone-spiked wooden pauldron, rope belt with skull trophy, hide loincloth and a spiked bog-oak club.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swampTroll" });
  const R = rng(11);

  // ---- palette ----
  const BONE = "#e6d9a8";
  const BONE_D = "#b8a46c";
  const IRON = "#59595f";
  const IRON_L = "#8a8c94";
  const WOOD_D = "#4a3220";
  const ROPE = "#b89a62";
  const HIDE = "#8a5a34";
  const EYE = "#ffd21f";
  const MOSS = "#6f9a2e";
  const TEETH = "#f1e6bd";
  const SKIN_BASE = mottle("#5c8f46", "#3f7a4e", { size: 0.2, contrast: 0.9, seed: 3 });
  const SKIN = countershade(SKIN_BASE, "#a3b565", { level: -0.35, soft: 0.5 });
  const SKIN_DARK = mottle("#456f3a", "#35603f", { size: 0.12, seed: 5 });
  const LIMB = paint((p, n) => {
    const base = SKIN.at(p, n);
    const warm = p.y < 0.5 ? 0.25 : 0;
    return [base[0] * (1 - warm) + 0.28 * warm, base[1] * (1 - warm) + 0.24 * warm, base[2] * (1 - warm) + 0.12 * warm] as const;
  });
  const HIDE_P = mottle("#8a5a34", "#6a4325", { size: 0.1, seed: 9 });
  const WOOD = grain(WOOD_D, "#6b4a2c", { size: 0.03, axis: "y", seed: 4 });
  const PLATE = scales("#7a5a36", "#3a2614", { size: 0.09, width: 0.12, seed: 2 });
  const WARTS = "#7fa35a";

  const sph = (r: number[], at: number[], color: any, seg = 10, rows = 7, rot?: number[]) =>
    b.part(new THREE.SphereGeometry(1, seg, rows), color, { at, scale: r, rotation: rot });
  const hemi = (r: number[], at: number[], color: any, rot?: number[]) =>
    b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), color, { at, scale: r, rotation: rot });

  // ---- torso ----
  const belly = sph([0.58, 0.52, 0.52], [0, 1.28, 0.12], SKIN, 12, 8);
  const chest = sph([0.74, 0.58, 0.56], [0, 1.82, 0.1], SKIN, 12, 8);
  sph([0.55, 0.4, 0.45], [0, 2.1, -0.22], SKIN_DARK, 10, 7); // back hump
  sph([0.5, 0.3, 0.45], [0, 1.0, -0.02], SKIN, 10, 6); // hips
  // pecs and navel
  for (const s of [1, -1]) sph([0.27, 0.22, 0.16], [s * 0.28, 1.85, 0.56], SKIN, 8, 6);
  sph([0.05, 0.05, 0.03], [0, 1.2, 0.62], "#3e6535", 6, 4);

  // ---- legs ----
  for (const s of [1, -1]) {
    b.capsule([s * 0.3, 1.0, 0.0], [s * 0.36, 0.58, 0.12], [0.21, 0.17], LIMB, { sides: 8 });
    sph([0.2, 0.19, 0.2], [s * 0.36, 0.55, 0.14], LIMB, 8, 6); // knee
    b.capsule([s * 0.36, 0.52, 0.12], [s * 0.36, 0.2, 0.06], [0.16, 0.13], LIMB, { sides: 8 });
    sph([0.19, 0.14, 0.3], [s * 0.36, 0.14, 0.2], LIMB, 8, 6); // foot
    for (const t of [-1, 0, 1]) {
      sph([0.055, 0.06, 0.07], [s * 0.36 + t * 0.1, 0.07, 0.46], LIMB, 6, 4);
      b.spike([s * 0.36 + t * 0.1, 0.07, 0.5], [0, -0.1, 1], 0.1, 0.035, BONE_D, { sides: 6 });
    }
    // knee strap and ankle wrap
    b.part(new THREE.TorusGeometry(0.17, 0.025, 5, 10), ROPE, { at: [s * 0.36, 0.34, 0.1], rotation: [90, 0, 0], scale: [1, 1, 1] });
    sph([0.16, 0.05, 0.16], [s * 0.36, 0.26, 0.08], HIDE_P, 8, 4);
  }

  // ---- belt, loincloth, trophies ----
  b.part(new THREE.TorusGeometry(0.54, 0.05, 6, 20), ROPE, { at: [0, 1.1, 0.1], rotation: [90, 0, 0], scale: [1.0, 0.96, 1] });
  b.part(new THREE.TorusGeometry(0.55, 0.03, 5, 20), WOOD_D, { at: [0, 1.04, 0.1], rotation: [90, 0, 0], scale: [1.0, 0.96, 1] });
  const flap = [
    [-0.26, 0],
    [0.26, 0],
    [0.23, -0.4],
    [0.1, -0.52, "sharp"],
    [0, -0.4],
    [-0.1, -0.54, "sharp"],
    [-0.23, -0.4],
  ] as [number, number, "sharp"?][];
  b.extrude(flap as any, { at: [0, 1.08, 0.6], x: [1, 0, 0], thickness: 0.035, bevel: 0.01, color: HIDE_P });
  b.extrude(flap as any, { at: [0, 1.08, -0.46], x: [-1, 0, 0], thickness: 0.035, bevel: 0.01, color: HIDE_P });
  b.rod([-0.2, 1.0, 0.63], [0.2, 1.0, 0.63], 0.012, ROPE, { sides: 5 });
  for (const t of [-0.15, 0, 0.15]) b.spike([t, 0.7, 0.62], [0, -1, 0], 0.07, 0.03, BONE, { sides: 6 });
  // skull trophy on the left hip
  sph([0.09, 0.08, 0.09], [0.5, 1.0, 0.42], BONE, 8, 6);
  b.part(new THREE.BoxGeometry(0.08, 0.04, 0.06), BONE_D, { at: [0.5, 0.92, 0.46] });
  for (const e of [-1, 1]) sph([0.022, 0.022, 0.015], [0.5 + e * 0.035, 1.02, 0.5], "#221a12", 5, 4);
  b.rod([0.5, 1.07, 0.38], [0.46, 1.1, 0.3], 0.012, ROPE, { sides: 5 });
  // pouch on the right hip
  sph([0.1, 0.1, 0.07], [-0.52, 0.98, 0.34], HIDE_P, 8, 6);
  sph([0.07, 0.03, 0.06], [-0.52, 1.08, 0.34], HIDE, 6, 4);

  // ---- arms ----
  for (const s of [1, -1]) {
    sph([0.33, 0.3, 0.32], [s * 0.82, 2.0, 0.06], LIMB, 10, 7); // deltoid
    b.capsule([s * 0.86, 1.95, 0.06], [s * 0.98, 1.4, 0.18], [0.24, 0.2], LIMB, { sides: 8 });
    sph([0.2, 0.19, 0.2], [s * 0.98, 1.38, 0.18], LIMB, 8, 6);
    b.capsule([s * 0.98, 1.36, 0.18], [s * 1.0, 0.82, 0.32], [0.22, 0.24], LIMB, { sides: 8 }); // forearm
    b.part(new THREE.TorusGeometry(0.22, 0.03, 5, 10), ROPE, { at: [s * 0.99, 0.92, 0.3], rotation: [90, 0, 0] });
    // hand
    sph([0.24, 0.22, 0.2], [s * 1.0, 0.68, 0.34], LIMB, 8, 6);
    for (const k of [-1, 0, 1]) {
      sph([0.07, 0.07, 0.07], [s * 1.0 + k * 0.1, 0.55, 0.48], LIMB, 6, 4);
      b.spike([s * 1.0 + k * 0.1, 0.52, 0.5], [0, -0.7, 0.7], 0.12, 0.035, BONE_D, { sides: 6 });
    }
    sph([0.06, 0.08, 0.06], [s * 0.82, 0.62, 0.42], LIMB, 6, 4); // thumb
  }

  // ---- club (model-left hand) ----
  b.rod([1.0, 0.0, 0.36], [1.0, 1.55, 0.36], [0.05, 0.07], WOOD, { sides: 8 });
  b.capsule([1.0, 1.5, 0.36], [1.0, 2.05, 0.36], [0.16, 0.2], PLATE, { sides: 9 });
  b.part(new THREE.TorusGeometry(0.19, 0.03, 5, 12), IRON, { at: [1.0, 1.62, 0.36], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.21, 0.03, 5, 12), IRON, { at: [1.0, 1.95, 0.36], rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const y = i % 2 ? 1.75 : 1.88;
    b.spike([1.0 + Math.cos(a) * 0.17, y, 0.36 + Math.sin(a) * 0.17], [Math.cos(a), 0.15, Math.sin(a)], 0.2, 0.04, IRON_L, { sides: 5 });
  }
  b.spike([1.0, 2.2, 0.36], [0, 1, 0], 0.2, 0.05, IRON_L, { sides: 5 });
  b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 8), ROPE, { at: [1.0, 1.0, 0.36], rotation: [90, 0, 0] });
  for (const y of [0.78, 0.9]) b.part(new THREE.TorusGeometry(0.07, 0.014, 4, 8), ROPE, { at: [1.0, y, 0.36], rotation: [90, 0, 0] });

  // ---- pauldron (model-right shoulder): bark plate with bone spikes ----
  hemi([0.4, 0.24, 0.38], [-0.88, 2.17, 0.04], PLATE, [0, 0, 18]);
  b.part(new THREE.TorusGeometry(0.38, 0.03, 5, 14), IRON, { at: [-0.88, 2.15, 0.04], rotation: [90, 0, 18], scale: [1, 1, 1] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.spike([-0.88 + Math.cos(a) * 0.2, 2.34, 0.04 + Math.sin(a) * 0.2], [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4], 0.24, 0.05, BONE, { sides: 6 });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.025, 5, 4), IRON_L, { at: [-0.9 + Math.cos(a) * 0.36, 2.18, 0.04 + Math.sin(a) * 0.34] });
  }
  // moss mantle on the other shoulder
  hemi([0.34, 0.16, 0.32], [0.88, 2.2, 0.04], mottle(MOSS, "#4c7a22", { size: 0.08, seed: 7 }), [0, 0, -18]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([0.88 + Math.cos(a) * 0.25, 2.18, 0.04 + Math.sin(a) * 0.25], [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3], 0.16, 0.03, MOSS, { sides: 5 });
  }

  // ---- neck, head ----
  sph([0.3, 0.22, 0.3], [0, 2.18, 0.34], SKIN, 8, 6);
  const skull = sph([0.25, 0.21, 0.26], [0, 2.3, 0.5], SKIN, 12, 8);
  sph([0.29, 0.14, 0.23], [0, 2.12, 0.62], SKIN, 10, 6); // jaw
  sph([0.2, 0.08, 0.16], [0, 2.07, 0.75], SKIN_DARK, 8, 5); // chin
  sph([0.07, 0.06, 0.08], [0, 2.22, 0.78], "#4f8340", 6, 5); // nose
  for (const s of [1, -1]) {
    sph([0.02, 0.02, 0.02], [s * 0.035, 2.2, 0.85], "#1b2a16", 4, 3);
    // eyes
    glow(sph([0.04, 0.032, 0.03], [s * 0.1, 2.31, 0.7], EYE, 6, 4), 1.4);
    sph([0.012, 0.025, 0.012], [s * 0.1, 2.31, 0.73], "#221a0a", 4, 4);
    // brow ridge
    b.capsule([s * 0.03, 2.36, 0.72], [s * 0.22, 2.4, 0.6], [0.045, 0.04], SKIN_DARK, { sides: 6 });
    // cheek bone
    sph([0.06, 0.05, 0.06], [s * 0.2, 2.2, 0.66], SKIN, 6, 4);
    // ears
    b.spike([s * 0.23, 2.32, 0.46], [s, 0.35, -0.35], 0.26, 0.055, SKIN, { sides: 6 });
    b.spike([s * 0.23, 2.32, 0.46], [s, 0.35, -0.35], 0.18, 0.03, "#7aa650", { sides: 6 });
    // upward tusks
    b.spike([s * 0.15, 2.1, 0.8], [s * 0.15, 1, 0.45], 0.24, 0.045, BONE, { sides: 6 });
    b.spike([s * 0.15, 2.1, 0.8], [s * 0.15, 1, 0.45], 0.08, 0.05, BONE_D, { sides: 6 });
    // bone earring
    b.part(new THREE.TorusGeometry(0.035, 0.01, 4, 8), BONE, { at: [s * 0.25, 2.27, 0.48], rotation: [0, 90, 0] });
  }
  // teeth row
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.045;
    b.spike([x, 2.1, 0.8 - Math.abs(i) * 0.03], [0, 1, 0.1], 0.05, 0.013, TEETH, { sides: 4 });
  }
  b.rod([-0.17, 2.14, 0.78], [0.17, 2.14, 0.78], 0.012, "#2b1a1a", { sides: 4 });
  // warty brow and moss tufts on head
  for (const [x, y, z] of [[0.08, 2.48, 0.5], [-0.1, 2.47, 0.45], [0, 2.5, 0.38], [0.14, 2.42, 0.38], [-0.15, 2.42, 0.34]]) {
    b.spike([x, y, z], [x * 0.5, 1, -0.3], 0.18, 0.025, "#3d5a1e", { sides: 4 });
  }
  void skull;

  // ---- bone necklace of teeth ----
  for (let i = 0; i < 9; i++) {
    const a = (-70 + i * 17.5) * (Math.PI / 180);
    const x = Math.sin(a) * 0.4;
    const z = 0.38 + Math.cos(a) * 0.3;
    const y = 2.0 - Math.cos(a) * 0.05 - Math.abs(Math.sin(a)) * 0.05;
    b.spike([x, y, z], [0, -1, 0.2], 0.1, 0.025, i === 4 ? BONE_D : BONE, { sides: 5 });
  }
  b.part(new THREE.TorusGeometry(0.33, 0.015, 4, 14), ROPE, { at: [0, 2.04, 0.36], rotation: [90, 0, 0], scale: [1.2, 1, 1] });
  sph([0.06, 0.06, 0.03], [0, 1.86, 0.65], "#3fa7a0", 6, 5); // swamp gem charm

  // ---- back: mushrooms, thorns, moss drapes ----
  for (const [x, y, z, h, w] of [[0.2, 2.35, -0.35, 0.3, 0.13], [-0.25, 2.3, -0.28, 0.22, 0.1], [0.0, 2.38, -0.5, 0.18, 0.08], [0.4, 2.2, -0.25, 0.14, 0.07]] as number[][]) {
    b.rod([x, y, z], [x + 0.02, y + h, z - 0.03], [0.03, 0.022], "#d9cfa0", { sides: 6 });
    hemi([w, w * 0.6, w], [x + 0.02, y + h - 0.02, z - 0.03], "#c6422b");
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6;
      b.part(new THREE.SphereGeometry(w * 0.14, 4, 3), "#f6ecd0", { at: [x + 0.02 + Math.cos(a) * w * 0.55, y + h + w * 0.28, z - 0.03 + Math.sin(a) * w * 0.55] });
    }
  }
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.12;
    b.spike([x, 2.38 - Math.abs(i - 3) * 0.04, -0.52 + Math.abs(i - 3) * 0.05], [0, 1, -0.5], 0.17, 0.035, BONE_D, { sides: 5 });
  }
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.17;
    b.spike([x, 2.0, -0.55], [0, -1, -0.15], 0.3 - Math.abs(i - 2) * 0.05, 0.035, MOSS, { sides: 5 });
  }

  // ---- surface detail: warts, scars, stripes ----
  for (const target of [belly, chest]) {
    const hits = b.surface(target).scatter(16, { rng: R, minDist: 0.14, filter: (h) => h.n.y > -0.3 });
    for (const h of hits) b.stick(new THREE.SphereGeometry(0.025, 5, 4), WARTS, h);
  }
  for (const s of [1, -1]) {
    for (const k of [0, 1, 2]) {
      b.rod([s * (0.12 + k * 0.1), 2.02 - k * 0.02, 0.6 - k * 0.02], [s * (0.2 + k * 0.1), 1.58, 0.62], 0.012, "#8a3d3d", { sides: 4 });
    }
  }
  b.decal(chest, new (class {})() as never, { at: [0, 1.9, 0.6], size: 0.1 } as never);

  return b.root;
}
