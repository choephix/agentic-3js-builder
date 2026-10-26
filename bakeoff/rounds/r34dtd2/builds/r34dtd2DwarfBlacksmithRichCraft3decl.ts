import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, offset, svg, paint, noise, mottle, countershade, grain, smoothstep, mix } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description: "A burly Warcraft-style dwarf smith with braided beard, hammer and anvil.",
};

const SKIN = "#d99a73", BEARD = "#c8672a", BEARD2 = "#8e3f18", LEATHER = "#5a3620", LEATHER2 = "#3b2314";
const CLOTH = "#7a2c24", GOLD = "#e0b040", DARK = "#1c1612", WOOD = "#7b4d2a", HOT = "#ff7a2a";
const STEEL = metal("steel"), IRON = metal("iron"), BRASS = metal("gilt"), BLUED = metal("blued");
const SKINP = countershade(SKIN, "#b97c5c", { soft: 0.6 });
const BEARDP = paint((p, n) => mix(BEARD2, BEARD, smoothstep(0.2, 0.8, noise(p, 0.05, 3) * 0.5 + n.y * 0.3 + 0.4)));
const WOODP = grain("#8a5a30", "#5e3a1c", { size: 0.01, axis: "y" });
const STONE = mottle("#6b6660", "#8a847c", { size: 0.08 });

const eyeTex = svg(`<svg viewBox="0 0 64 48"><ellipse cx="32" cy="24" rx="28" ry="18" fill="#f4ede0" stroke="#1c1612" stroke-width="4"/><circle cx="32" cy="25" r="12" fill="#3a8fd0"/><circle cx="32" cy="25" r="6" fill="#0a0a12"/><circle cx="27" cy="20" r="4" fill="#fff"/><path d="M2 8 Q32 -2 62 8" stroke="#8e3f18" stroke-width="6" fill="none"/></svg>`, { size: 128 });
const emblem = svg(`<svg viewBox="0 0 64 64"><path d="M8 8 H56 L56 34 Q32 62 32 62 Q8 34 8 34Z" fill="#7a2c24" stroke="#e0b040" stroke-width="4"/><path d="M20 22 H44 M32 22 V46 M22 40 L32 30 L42 40" stroke="#e0b040" stroke-width="4" fill="none"/></svg>`, { size: 96 });
const runeTex = svg(`<svg viewBox="0 0 64 64"><path d="M32 6 V58 M32 20 L16 8 M32 30 L50 14 M20 44 L44 44" stroke="#ffb040" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`, { size: 96 });
const flame = svg(`<svg viewBox="0 0 32 64"><path d="M16 62 Q0 40 12 24 Q14 34 18 30 Q16 14 20 2 Q30 24 28 40 Q28 54 16 62Z" fill="#ff6a1a"/><path d="M16 62 Q8 48 16 36 Q22 48 16 62Z" fill="#ffd060"/></svg>`, { size: 96 });

export default function build() {
  const b = createBuilder({ name: "dwarf" });
  const R = rng(5);
  const S = [1, -1];

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, 0], [0, 0.72, 0.03], [0, 0.95, 0.06]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.03, 0.08], dir: [0, 1, 0.3], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.08, 0.1], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.17, 0.14], dir: [0, 0, 1], role: "jaw" });

  // ---- legs
  for (const s of S) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [[s * 0.1, 0.5, 0], [s * 0.11, 0.27, 0.02], [s * 0.12, 0.08, 0.0]], { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.095, 0.075], { color: LEATHER2, sides: 8 });
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.26), LEATHER2, { bone: leg.tip!, at: [s * 0.12, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.16, 0.03, 0.27), DARK, { bone: leg.tip!, at: [s * 0.12, 0.015, 0.07] });
    b.part(new THREE.BoxGeometry(0.17, 0.05, 0.14), IRON, { bone: leg.tip!, at: [s * 0.12, 0.09, 0.1] });
    b.part(new THREE.CylinderGeometry(0.1, 0.095, 0.06, 8), LEATHER, { bone: leg.joints[1], at: [s * 0.11, 0.2, 0.02] });
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.02), GOLD, { bone: leg.joints[1], at: [s * 0.11, 0.2, 0.1] });
  }

  // ---- torso
  const body = b.loft([
    { at: [0, 0.5, 0], w: 0.4, h: 0.28 },
    { at: [0, 0.68, 0.03], w: 0.52, h: 0.36 },
    { at: [0, 0.9, 0.05], w: 0.6, h: 0.36 },
    { at: [0, 1.02, 0.06], w: 0.5, h: 0.28 },
  ], { bone: [hips, ...spine.joints], color: CLOTH });
  const sk = b.surface(body);
  b.part(new THREE.BoxGeometry(0.56, 0.2, 0.4), LEATHER, { bone: hips, at: [0, 0.5, 0.02] });
  b.part(new THREE.CylinderGeometry(0.3, 0.32, 0.18, 8), LEATHER, { bone: hips, at: [0, 0.52, 0.02], scale: [1, 1, 0.75] });
  // belt + buckle
  b.part(new THREE.BoxGeometry(0.62, 0.07, 0.42), LEATHER2, { bone: hips, at: [0, 0.6, 0.03] });
  b.part(new THREE.BoxGeometry(0.12, 0.09, 0.03), BRASS, { bone: hips, at: [0, 0.6, 0.25] });
  // apron
  const apron = b.part(new THREE.BoxGeometry(0.5, 0.62, 0.04), LEATHER, { bone: chest, at: [0, 0.55, 0.26], rotation: [4, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", { bone: chest, at: [0, 0.82, 0.285], dir: [0, 0, 1], axis: "z", texture: emblem });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.05), LEATHER2, { bone: chest, at: [0, 0.24, 0.27] });
  for (const x of [-0.2, -0.1, 0, 0.1, 0.2]) b.part(new THREE.SphereGeometry(0.018, 6, 4), STEEL, { bone: chest, at: [x, 0.24, 0.3] });
  // straps
  for (const s of S) {
    b.rod([s * 0.2, 1.05, 0.1], [s * 0.12, 0.62, 0.27], 0.03, LEATHER2, { bone: chest });
    b.part(new THREE.BoxGeometry(0.06, 0.06, 0.04), BRASS, { bone: chest, at: [s * 0.14, 0.7, 0.28] });
  }

  // ---- shoulders & arms
  const handPos: Record<string, any> = {};
  for (const s of S) {
    const side = s > 0 ? "L" : "R";
    const tgt = s > 0 ? [0.3, 0.88, 0.5] : [-0.3, 1.0, 0.0];
    const arm = b.chain(`arm${side}`, s > 0
      ? [[0.34, 0.98, 0.06], [0.42, 0.78, 0.2], [0.3, 0.88, 0.5]]
      : [[-0.34, 0.98, 0.06], [-0.46, 0.8, 0.1], [-0.4, 0.62, 0.3]],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.1, 0.085, 0.07], { color: SKINP, sides: 8 });
    // sleeve & bracer
    b.rod([s * 0.34, 0.98, 0.06], arm.at(0.3).at, [0.115, 0.1], CLOTH, { bone: arm.joints[0], sides: 8 });
    b.rod(arm.at(0.62).at, arm.at(0.95).at, [0.088, 0.078], LEATHER2, { bone: arm.joints[1], sides: 8 });
    b.part(new THREE.SphereGeometry(0.125, 8, 6), STEEL, { bone: arm.joints[0], at: [s * 0.35, 1.02, 0.06], scale: [1, 0.7, 1] });
    for (let i = 0; i < 3; i++) b.spike([s * 0.35 + s * 0.07 * (i - 1) * 0.2, 1.08, 0.06 + (i - 1) * 0.06], [0, 1, 0], 0.08, 0.025, IRON, { bone: arm.joints[0] });
    const hp = arm.tip!;
    b.part(new THREE.BoxGeometry(0.11, 0.1, 0.12), SKINP, { bone: hp, at: arm.at(1).at });
    for (let i = 0; i < 4; i++) b.capsule(offset(arm.at(1).at, [0, 0, 1], 0.05).clone().add(new THREE.Vector3((i - 1.5) * 0.026, 0.0, 0)), offset(arm.at(1).at, [0, 0, 1], 0.1).clone().add(new THREE.Vector3((i - 1.5) * 0.026, -0.015, 0)), 0.014, SKIN, { bone: hp });
    handPos[side] = arm.at(1).at;
  }

  // ---- hammer in right... (model left hand, raised near anvil)
  const hp = handPos["L"];
  const hammerJ = b.joint("hammer", { parent: "wristL", at: hp, dir: [0, 0.6, 0.8] });
  const hd = new THREE.Vector3(0, 0.6, 0.8).normalize();
  b.rod(offset(hp, hd, -0.1), offset(hp, hd, 0.45), 0.022, WOODP, { bone: hammerJ, sides: 6 });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.24), STEEL, { bone: hammerJ, at: offset(hp, hd, 0.45), dir: hd, axis: "y", rotation: [0, 0, 0] });
  b.part(new THREE.BoxGeometry(0.13, 0.13, 0.05), IRON, { bone: hammerJ, at: offset(hp, hd, 0.45).add(new THREE.Vector3(0.12, 0, 0)) });
  b.part(new THREE.BoxGeometry(0.13, 0.13, 0.05), IRON, { bone: hammerJ, at: offset(hp, hd, 0.45).add(new THREE.Vector3(-0.12, 0, 0)) });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: hammerJ, at: offset(hp, hd, -0.1) });

  // ---- head
  const H = 1.0;
  const hc = new THREE.Vector3(0, 1.2, 0.12);
  const skull = b.part(new THREE.SphereGeometry(0.14 * H, 12, 9), SKINP, { bone: head, at: hc, scale: [1.05, 1, 1] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), "#e0a07c", { bone: head, at: [0, 1.17, 0.27], scale: [1, 0.9, 1.1] }); // big nose
  b.part(new THREE.BoxGeometry(0.29, 0.07, 0.1), SKIN, { bone: head, at: [0, 1.26, 0.2] }); // brow
  for (const s of S) {
    b.part(new THREE.PlaneGeometry(0.075, 0.056), "#ffffff", { bone: head, at: [s * 0.058, 1.235, 0.262], dir: [s * 0.1, 0, 1], axis: "z", texture: eyeTex });
    b.rod([s * 0.1, 1.285, 0.25], [s * 0.02, 1.268, 0.265], 0.022, BEARD2, { bone: head });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), SKIN, { bone: head, at: [s * 0.14, 1.19, 0.14], scale: [0.5, 1.2, 0.8] });
    b.spike([s * 0.145, 1.21, 0.14], [s, 0.4, 0], 0.07, 0.025, SKIN, { bone: head });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), "#e68f7a", { bone: head, at: [s * 0.09, 1.15, 0.22] }); // cheeks
  }
  // helmet band + horns
  b.part(new THREE.CylinderGeometry(0.15, 0.155, 0.05, 10), STEEL, { bone: head, at: [0, 1.31, 0.11] });
  b.part(new THREE.SphereGeometry(0.15, 10, 5, 0, 6.3, 0, 1.2), IRON, { bone: head, at: [0, 1.31, 0.11] });
  for (const s of S) {
    b.sweep(bezier([s * 0.15, 1.33, 0.11], [s * 0.26, 1.34, 0.11], [s * 0.3, 1.42, 0.11], [s * 0.28, 1.5, 0.11]), [0.035, 0.008], { bone: head, color: "#e9dcc0", sides: 6 });
  }
  // jaw / mouth
  b.part(new THREE.BoxGeometry(0.17, 0.045, 0.1), "#7a3a30", { bone: jaw, at: [0, 1.125, 0.22] });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.14), SKIN, { bone: jaw, at: [0, 1.09, 0.2] });

  // ---- beard: solid + blades + braids
  const beard = b.loft([
    { at: [0, 1.15, 0.2], w: 0.3, h: 0.12 },
    { at: [0, 1.0, 0.25], w: 0.33, h: 0.14 },
    { at: [0, 0.8, 0.27], w: 0.28, h: 0.12 },
    { at: [0, 0.62, 0.28], w: 0.14, h: 0.08 },
  ], { bone: [head, neck, chest], color: BEARDP });
  const tuft = svg(`<svg viewBox="0 0 24 48"><path d="M12 47 Q2 30 6 2 Q14 20 22 4 Q22 30 12 47Z" fill="#c8672a" stroke="#8e3f18" stroke-width="2"/><path d="M12 44 Q10 28 12 12" stroke="#f0a050" stroke-width="2" fill="none"/></svg>`, { size: 96 });
  const bs = b.surface(beard);
  b.cards(bs.scatter(70, { rng: R, minDist: 0.045, filter: (h) => h.n.z > -0.1 }), tuft, { size: [0.07, 0.14], lean: 55, bend: 20, vary: 0.3, rng: R, spin: 15 });
  for (const s of S) {
    const br = catmull([[s * 0.12, 1.12, 0.26], [s * 0.14, 1.0, 0.3], [s * 0.12, 0.85, 0.32], [s * 0.13, 0.72, 0.33]]);
    b.sweep(br, [0.035, 0.03, 0.02], { bone: chest, color: BEARD, sides: 6 });
    b.along(br, 5, (at) => b.part(new THREE.TorusGeometry(0.035, 0.012, 4, 6), GOLD, { frame: at, bone: chest }));
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: chest, at: [s * 0.13, 0.7, 0.33] });
  }
  // mustache
  for (const s of S) b.sweep(catmull([[s * 0.01, 1.14, 0.29], [s * 0.08, 1.12, 0.29], [s * 0.15, 1.06, 0.26], [s * 0.17, 1.02, 0.22]]), [0.04, 0.012], { bone: head, color: BEARD, sides: 6 });
  // sideburns hair
  for (const s of S) b.part(new THREE.SphereGeometry(0.06, 7, 5), BEARD, { bone: head, at: [s * 0.13, 1.17, 0.12], scale: [0.6, 1.2, 1] });

  // ---- anvil + stump
  const AZ = 0.62;
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.36, 9), WOODP, { bone: hips, at: [0, 0.18, AZ] });
  b.part(new THREE.TorusGeometry(0.3, 0.02, 4, 12), IRON, { bone: hips, at: [0, 0.1, AZ], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.29, 0.02, 4, 12), IRON, { bone: hips, at: [0, 0.3, AZ], rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.2), BLUED, { bone: hips, at: [0, 0.41, AZ] });
  b.part(new THREE.BoxGeometry(0.18, 0.1, 0.1), BLUED, { bone: hips, at: [0, 0.5, AZ] });
  b.part(new THREE.BoxGeometry(0.2, 0.08, 0.62), STEEL, { bone: hips, at: [0, 0.58, AZ] });
  b.spike([0, 0.58, AZ + 0.3], [0, 0, 1], 0.2, 0.05, STEEL, { bone: hips });
  glow(b.part(new THREE.BoxGeometry(0.1, 0.03, 0.34), HOT, { bone: hips, at: [0.0, 0.64, AZ - 0.04], rotation: [0, 8, 0] }), 1.6);
  glow(b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", { bone: hips, at: [0, 0.5, AZ + 0.11], dir: [0, 0, 1], axis: "z", texture: runeTex }), 1.5);
  glow(b.cards([frame([0, 0.66, AZ - 0.15], [0, 1, 0]), frame([0.02, 0.66, AZ + 0.02], [0, 1, 0])], flame, { size: [0.08, 0.14], cross: true, flow: [0, 0, 1], lean: 10 }) as any, 1.4);
  // sparks
  for (let i = 0; i < 9; i++) glow(b.part(new THREE.OctahedronGeometry(0.01), GOLD, { bone: hips, at: [(R() - 0.5) * 0.4, 0.75 + R() * 0.35, AZ + (R() - 0.5) * 0.4] }), 2);
  // tongs on stump side
  b.part(new THREE.BoxGeometry(0.02, 0.02, 0.3), IRON, { bone: hips, at: [0.25, 0.62, AZ - 0.1], rotation: [0, 20, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.02, 0.3), IRON, { bone: hips, at: [0.22, 0.62, AZ - 0.1], rotation: [0, 14, 0] });

  return b.root;
}
