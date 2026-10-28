import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description: "A Final Fantasy style gunblade: a broad blade fused with a revolver chamber, trigger grip, ornate guard and a glowing crystal.",
};

// The weapon is held upright: blade up (+Y), grip below, facing +Z.
export default function build() {
  const b = createBuilder({ name: "gunblade" });

  const STEEL = "#cfd6e2";
  const STEEL_HI = "#f2f6ff";
  const STEEL_LO = "#7d8798";
  const DARK = "#23252e";
  const GUN = "#3a3d4a";
  const GOLD = "#d9a93a";
  const GOLD_LO = "#8f6a1e";
  const LEATHER = "#5a2a22";
  const CRYSTAL = "#52e0ff";
  const RED = "#b0262c";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]) =>
    b.part(g, c, { at, rotation: rot, scale, flat: true });

  // Slab-like blade outline, drawn in X (width) / Y (length), thickness along Z.
  const bladeOutline: [number, number, "sharp"?][] = [
    [-0.055, 0.0],
    [0.055, 0.0],
    [0.07, 0.35],
    [0.075, 0.78],
    [0.0, 1.0, "sharp"],
    [-0.06, 0.8],
    [-0.065, 0.35],
  ] as any;
  const baseY = 0.62;

  // Blade body
  b.extrude(bladeOutline as any, { at: [0, baseY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: STEEL });
  // Fuller (central ridge) both faces
  b.extrude(
    [[-0.012, 0.03], [0.012, 0.03], [0.014, 0.6], [0, 0.78, "sharp"], [-0.014, 0.6]] as any,
    { at: [0, baseY, 0.0085], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: STEEL_HI },
  );
  b.extrude(
    [[-0.012, 0.03], [0.012, 0.03], [0.014, 0.6], [0, 0.78, "sharp"], [-0.014, 0.6]] as any,
    { at: [0, baseY, -0.0085], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: STEEL_HI },
  );
  // Edge bevel strip on left side (cutting edge highlight)
  b.extrude(
    [[0.06, 0.02], [0.07, 0.02], [0.075, 0.78], [0.068, 0.7]] as any,
    { at: [0, baseY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: STEEL_LO },
  );
  // Spine back of blade (dark top-back strip with notches)
  b.extrude(
    [[-0.07, 0.03], [-0.058, 0.03], [-0.06, 0.78], [-0.066, 0.4]] as any,
    { at: [0, baseY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: STEEL_LO },
  );
  // Tip highlight
  part(box(0.012, 0.012, 0.018), STEEL_HI, [0.0, baseY + 0.97, 0], [0, 0, 45]);

  // Notch rivets along the spine
  for (let i = 0; i < 4; i++) part(cyl(0.007, 0.007, 0.024, 6), GOLD, [-0.035, baseY + 0.14 + i * 0.13, 0], [90, 0, 0]);

  // Red inlay stripes at blade root
  part(box(0.1, 0.012, 0.018), RED, [0, baseY + 0.045, 0]);
  part(box(0.07, 0.008, 0.019), GOLD, [0, baseY + 0.07, 0]);

  // Revolver chamber (cylinder) at the blade base, axis along X
  const chamberY = 0.58;
  part(cyl(0.062, 0.062, 0.075, 6), GUN, [0, chamberY, 0.01], [0, 0, 90]);
  part(cyl(0.066, 0.066, 0.012, 6), GOLD, [0.045, chamberY, 0.01], [0, 0, 90]);
  part(cyl(0.066, 0.066, 0.012, 6), GOLD, [-0.045, chamberY, 0.01], [0, 0, 90]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    part(cyl(0.012, 0.012, 0.08, 6), DARK, [0.0, chamberY + Math.sin(a) * 0.04, 0.01 + Math.cos(a) * 0.04], [0, 0, 90]);
  }
  // Cartridge heads visible on the side
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    part(cyl(0.008, 0.008, 0.006, 6), GOLD, [0.0415 + 0.002, chamberY + Math.sin(a) * 0.04, 0.01 + Math.cos(a) * 0.04], [0, 0, 90]);
  }

  // Gun frame / barrel running up the back of blade
  part(box(0.05, 0.16, 0.05), GUN, [0, 0.5, -0.005]);
  part(box(0.034, 0.1, 0.06), DARK, [0, 0.64 - 0.14, 0.01]);
  // Barrel sleeve under blade ridge
  part(cyl(0.014, 0.014, 0.3, 8), GUN, [-0.045, baseY + 0.18, 0.0]);
  part(cyl(0.017, 0.017, 0.02, 8), GOLD, [-0.045, baseY + 0.33, 0.0]);
  part(cyl(0.017, 0.017, 0.02, 8), GOLD, [-0.045, baseY + 0.04, 0.0]);

  // Hammer on the back
  part(box(0.02, 0.07, 0.03), DARK, [0, 0.62, -0.055], [-25, 0, 0]);
  part(box(0.026, 0.02, 0.034), GOLD, [0, 0.655, -0.07], [-25, 0, 0]);

  // Guard: ornate winged cross-piece
  part(box(0.3, 0.03, 0.05), GOLD, [0, 0.44, 0]);
  part(box(0.26, 0.012, 0.056), GOLD_LO, [0, 0.425, 0]);
  for (const s of [1, -1]) {
    part(box(0.1, 0.026, 0.044), GOLD, [s * 0.185, 0.455, 0], [0, 0, s * 20]);
    part(box(0.07, 0.02, 0.04), GOLD_LO, [s * 0.255, 0.485, 0], [0, 0, s * 38]);
    part(new THREE.ConeGeometry(0.014, 0.07, 4), STEEL_HI, [s * 0.285, 0.52, 0], [0, 0, -s * 15]);
    part(new THREE.SphereGeometry(0.018, 6, 4), RED, [s * 0.155, 0.44, 0.028]);
  }
  // Central crystal housing and glowing gem
  part(box(0.07, 0.07, 0.06), GOLD, [0, 0.46, 0.0], [0, 0, 45]);
  glow(part(new THREE.OctahedronGeometry(0.036), CRYSTAL, [0, 0.46, 0.036], undefined, [1, 1.4, 0.8]), 1.6);
  part(new THREE.OctahedronGeometry(0.014), "#ffffff", [-0.008, 0.475, 0.058]);

  // Trigger guard assembly on the front of the grip
  part(box(0.05, 0.12, 0.06), GUN, [0, 0.37, 0]);
  b.sweep(
    [[0, 0.42, 0.03], [0, 0.4, 0.1], [0, 0.32, 0.12], [0, 0.27, 0.06]],
    0.007,
    { color: GOLD, sides: 6 },
  );
  part(box(0.01, 0.045, 0.012), DARK, [0, 0.355, 0.05], [20, 0, 0]);

  // Grip
  b.rod([0, 0.34, -0.005], [0, 0.07, -0.005], 0.03, { color: LEATHER, sides: 8 });
  for (let i = 0; i < 8; i++) part(cyl(0.032, 0.032, 0.012, 8), DARK, [0, 0.08 + i * 0.033, -0.005]);
  // Grip backstrap plate
  part(box(0.012, 0.22, 0.02), GOLD_LO, [0, 0.22, -0.034]);

  // Pommel with trailing chain and crest
  part(cyl(0.042, 0.034, 0.03, 8), GOLD, [0, 0.05, -0.005]);
  part(new THREE.SphereGeometry(0.036, 8, 6), GOLD, [0, 0.02, -0.005], undefined, [1, 0.8, 1]);
  glow(part(new THREE.OctahedronGeometry(0.018), CRYSTAL, [0, 0.02, 0.025]), 1.2);
  part(cyl(0.01, 0.01, 0.025, 6), GOLD_LO, [0, 0.035, -0.005]);
  // Lanyard tassel
  b.rod([0.0, 0.02, -0.04], [0.02, -0.0, -0.1], 0.004, { color: RED });
  // keep lowest point near floor: shift via small part touching y=0
  part(new THREE.SphereGeometry(0.006, 4, 3), RED, [0.02, 0.003, -0.1]);

  return b.root;
}
