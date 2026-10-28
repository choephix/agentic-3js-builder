import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description: "Warcraft-style dwarf smith hammering a glowing bar on an anvil.",
};

const SKIN = "#d99a74", SKIN_D = "#b97652", BEARD = "#c8591f", BEARD_L = "#e88a2e", BEARD_D = "#8a3a14";
const LEATHER = "#6b4226", LEATHER_D = "#3f2514", STEEL = "#8d96a6", STEEL_D = "#566070", GOLD = "#e2b53c";
const CLOTH = "#2f4f8f", CLOTH_D = "#223a6a", WOOD = "#7a5230", IRON = "#2e3038", HOT = "#ff7a1a", HOTY = "#ffd24a";
const WHITE = "#f4efe4", DARK = "#16120f";

export default function build() {
  const b = createBuilder({ name: "dwarfSmith" });
  const P = (g: THREE.BufferGeometry, c: string, o: any) => b.part(g, c, { flat: true, ...o });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.85, 0.02], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.15, 0.04], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.22, 0.06], dir: [0, 1, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.28, 0.1], dir: [0, -0.2, 1], role: "jaw" });

  // torso
  P(sph(0.3, 10, 8), CLOTH, { bone: hips, at: [0, 0.72, 0], scale: [1.05, 1.0, 0.85] });
  P(sph(0.34, 10, 8), CLOTH_D, { bone: chest, at: [0, 1.0, 0], scale: [1.15, 0.8, 0.85] });
  P(box(0.7, 0.06, 0.5), LEATHER_D, { bone: hips, at: [0, 0.63, 0.01] });
  P(box(0.1, 0.08, 0.02), GOLD, { bone: hips, at: [0, 0.63, 0.26] });
  // apron
  P(box(0.46, 0.55, 0.04), LEATHER, { bone: hips, at: [0, 0.78, 0.27], rotation: [-6, 0, 0] });
  P(box(0.36, 0.2, 0.04), LEATHER, { bone: chest, at: [0, 1.0, 0.3] });
  P(box(0.2, 0.14, 0.03), LEATHER_D, { bone: hips, at: [0, 0.74, 0.3] });
  for (const s of [1, -1]) {
    P(box(0.05, 0.45, 0.03), LEATHER_D, { bone: chest, at: [s * 0.15, 1.05, 0.2], rotation: [0, 0, s * -8] });
    P(box(0.025, 0.45, 0.02), LEATHER_D, { bone: chest, at: [s * 0.2, 1.05, -0.2] });
  }
  for (let i = 0; i < 4; i++) P(sph(0.015, 5, 4), GOLD, { bone: hips, at: [-0.15 + i * 0.1, 0.55 + 0.4 * 0 + 0.22, 0.295] });

  // neck & head
  P(cyl(0.1, 0.12, 0.12), SKIN_D, { bone: neck, at: [0, 1.2, 0.04] });
  const HC: [number, number, number] = [0, 1.32, 0.07];
  P(sph(0.17, 10, 8), SKIN, { bone: head, at: HC, scale: [1.0, 0.95, 1.0] });
  P(sph(0.065, 8, 6), "#e0897a", { bone: head, at: [0, 1.29, 0.24] }); // nose
  P(sph(0.03, 5, 4), "#c9705f", { bone: head, at: [0, 1.28, 0.285] });
  for (const s of [1, -1]) {
    // eyes
    P(sph(0.032, 8, 6), WHITE, { bone: head, at: [s * 0.075, 1.36, 0.215], scale: [1, 0.8, 0.6] });
    P(sph(0.017, 6, 5), "#2c6bb0", { bone: head, at: [s * 0.075, 1.36, 0.235] });
    P(sph(0.008, 5, 4), DARK, { bone: head, at: [s * 0.075, 1.36, 0.245] });
    // brow
    P(box(0.1, 0.035, 0.05), BEARD_D, { bone: head, at: [s * 0.08, 1.405, 0.205], rotation: [0, 0, s * -18] });
    // ears
    P(sph(0.04, 6, 5), SKIN_D, { bone: head, at: [s * 0.17, 1.32, 0.04], scale: [0.5, 1.2, 0.8] });
    // cheeks
    P(sph(0.04, 6, 5), "#e48a76", { bone: head, at: [s * 0.12, 1.28, 0.19] });
  }
  // jaw & beard
  P(box(0.2, 0.05, 0.18), SKIN_D, { bone: jaw, at: [0, 1.2, 0.14] });
  P(box(0.13, 0.015, 0.02), DARK, { bone: jaw, at: [0, 1.22, 0.235] });
  // beard layers
  P(sph(0.2, 9, 7), BEARD, { bone: jaw, at: [0, 1.17, 0.1], scale: [1.0, 0.9, 0.85] });
  const layers = [
    [0.3, 1.05, 0.16, BEARD_L], [0.26, 0.93, 0.17, BEARD], [0.2, 0.82, 0.17, BEARD_D], [0.13, 0.72, 0.17, BEARD],
  ];
  for (const [w, y, z, c] of layers as [number, number, number, string][]) {
    P(new THREE.ConeGeometry(w, 0.22, 6), c, { bone: chest, at: [0, y, z], rotation: [180, 0, 0], scale: [1, 1, 0.5] });
  }
  // moustache
  for (const s of [1, -1]) {
    b.capsule([s * 0.02, 1.245, 0.255], [s * 0.15, 1.2, 0.2], 0.03, BEARD_L, { bone: head });
    b.spike([s * 0.15, 1.2, 0.2], [s * 0.2, 1.12, 0.17], null, 0.03, { color: BEARD, bone: head });
  }
  // braids
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      P(sph(0.04, 6, 5), i % 2 ? BEARD : BEARD_L, { bone: chest, at: [s * 0.1, 1.04 - i * 0.07, 0.3 - i * 0.005], scale: [1, 1.1, 1] });
    }
    P(cyl(0.045, 0.045, 0.02, 8), GOLD, { bone: chest, at: [s * 0.1, 0.76, 0.295] });
  }
  // helmet
  b.lathe([[0, 0], [0.19, 0], [0.19, 0.04], [0.16, 0.13], [0.08, 0.19], [0, 0.2]], {
    at: [0, 1.42, 0.06], bone: head, color: STEEL, segments: 10,
  });
  P(cyl(0.2, 0.2, 0.035, 10), GOLD, { bone: head, at: [0, 1.44, 0.06] });
  P(box(0.04, 0.12, 0.03), STEEL_D, { bone: head, at: [0, 1.45, 0.25] });
  P(new THREE.ConeGeometry(0.03, 0.08, 6), GOLD, { bone: head, at: [0, 1.65, 0.06] });
  for (const s of [1, -1]) {
    b.sweep([[s * 0.18, 1.5, 0.06], [s * 0.3, 1.55, 0.06], [s * 0.34, 1.72, 0.06]], [0.045, 0.01], { bone: head, color: "#e8dcc0", caps: { end: "point" } });
  }

  // legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${L}`, [[s * 0.15, 0.64, 0], [s * 0.16, 0.36, 0.03], [s * 0.16, 0.1, 0]], {
      parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg",
    });
    b.sweep(leg, [0.105, 0.08], { color: CLOTH_D });
    P(box(0.2, 0.18, 0.3), LEATHER, { bone: leg.joints[1], at: [s * 0.16, 0.14, 0.06] });
    P(box(0.22, 0.05, 0.34), LEATHER_D, { bone: leg.joints[1], at: [s * 0.16, 0.025, 0.07] });
    P(box(0.2, 0.06, 0.1), LEATHER_D, { bone: leg.joints[1], at: [s * 0.16, 0.3, 0.02] });
    P(box(0.05, 0.03, 0.03), GOLD, { bone: leg.joints[1], at: [s * 0.16, 0.2, 0.225] });
  }

  // arms
  const armDef: Record<string, number[][]> = {
    L: [[0.36, 1.08, 0], [0.45, 0.92, 0.2], [0.22, 0.88, 0.42]],
    R: [[-0.36, 1.08, 0], [-0.5, 1.1, 0.22], [-0.3, 1.25, 0.42]],
  };
  const hands: Record<string, THREE.Vector3> = {};
  for (const L of ["L", "R"]) {
    const s = L === "L" ? 1 : -1;
    const pts = armDef[L];
    const arm = b.chain(`arm${L}`, pts, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" });
    b.sweep(arm, [0.085, 0.065], { color: SKIN });
    // sleeve + bracer
    b.sweep(arm, [0.1, 0.095], { color: CLOTH, to: 0.35 } as any);
    b.capsule(pts[1], pts[2], [0.075, 0.07], LEATHER, { bone: arm.joints[1] });
    // pauldron
    P(sph(0.14, 8, 6), STEEL, { bone: arm.joints[0], at: [s * 0.37, 1.14, 0], scale: [1, 0.7, 1.1] });
    P(cyl(0.1, 0.12, 0.04, 8), GOLD, { bone: arm.joints[0], at: [s * 0.38, 1.1, 0], rotation: [0, 0, s * -20] });
    P(new THREE.ConeGeometry(0.03, 0.09, 6), STEEL_D, { bone: arm.joints[0], at: [s * 0.4, 1.25, 0] });
    // hand
    P(sph(0.075, 7, 5), SKIN_D, { bone: arm.tip ?? arm.joints[1], at: pts[2] as any });
    hands[L] = new THREE.Vector3(...pts[2]);
  }

  // hammer in right hand (model right = -X)
  const hp = hands.R;
  b.rod([hp.x, hp.y - 0.15, hp.z], [hp.x, hp.y + 0.3, hp.z], 0.02, WOOD, { bone: "wristR" });
  P(box(0.12, 0.12, 0.26), STEEL, { bone: "wristR", at: [hp.x, hp.y + 0.33, hp.z] });
  P(box(0.14, 0.14, 0.03), STEEL_D, { bone: "wristR", at: [hp.x, hp.y + 0.33, hp.z + 0.14] });
  P(box(0.14, 0.14, 0.03), STEEL_D, { bone: "wristR", at: [hp.x, hp.y + 0.33, hp.z - 0.14] });
  P(sph(0.025, 5, 4), GOLD, { bone: "wristR", at: [hp.x, hp.y - 0.16, hp.z] });

  // stump and anvil
  P(cyl(0.3, 0.34, 0.4, 10), WOOD, { bone: hips, at: [0, 0.2 - 0.0, 0.62] });
  P(cyl(0.31, 0.31, 0.03, 10), "#9a6c40", { bone: hips, at: [0, 0.405, 0.62] });
  for (let i = 0; i < 3; i++) P(box(0.04, 0.2, 0.02), "#5a3a20", { bone: hips, at: [-0.15 + i * 0.15, 0.2, 0.93], rotation: [0, 0, 0] });
  P(box(0.36, 0.06, 0.2), IRON, { bone: hips, at: [0, 0.44, 0.62] });
  P(box(0.2, 0.14, 0.14), IRON, { bone: hips, at: [0, 0.54, 0.62] });
  P(box(0.46, 0.1, 0.22), STEEL_D, { bone: hips, at: [0, 0.66, 0.62] });
  P(box(0.46, 0.02, 0.22), STEEL, { bone: hips, at: [0, 0.72, 0.62] });
  P(new THREE.ConeGeometry(0.1, 0.3, 8), STEEL_D, { bone: hips, at: [0.36, 0.67, 0.62], rotation: [0, 0, -90] });
  P(box(0.1, 0.1, 0.22), STEEL_D, { bone: hips, at: [-0.28, 0.66, 0.62] });
  // glowing bar and tongs held by left hand
  glow(P(box(0.05, 0.035, 0.5), HOT, { bone: "wristL", at: [0.18, 0.755, 0.68] }), 1.6);
  glow(P(box(0.052, 0.036, 0.14), HOTY, { bone: "wristL", at: [0.18, 0.757, 0.86] }), 2);
  b.rod([0.22, 0.88, 0.42], [0.18, 0.77, 0.6], 0.012, STEEL_D, { bone: "wristL" });
  b.rod([0.14, 0.88, 0.42], [0.18, 0.77, 0.6], 0.012, STEEL_D, { bone: "wristL" });
  // sparks
  const sparks: [number, number, number][] = [[-0.1, 0.9, 0.7], [0.3, 0.95, 0.75], [-0.25, 0.85, 0.55], [0.05, 1.0, 0.8], [0.4, 0.82, 0.5]];
  sparks.forEach(([x, y, z], i) => glow(P(sph(0.012 + (i % 2) * 0.006, 4, 3), HOTY, { bone: hips, at: [x, y, z] }), 2));

  return b.root;
}
