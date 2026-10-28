import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, bezier, mix, noise, paint, smoothstep, mottle, countershade } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, long-armed swamp troll with teal mottled skin, jutting tusks, a flame-red mohawk, long ears, and a bone-fetish necklace, shoulder spikes and belt trophies.",
};

const SKIN = "#3f8f8a";
const SKIN_D = "#27595f";
const BELLY = "#9bb98a";
const BONE = "#e8dcb8";
const BONE_D = "#b8a77c";
const RED = "#d8341c";
const ORANGE = "#ff8a1e";
const CLOTH = "#6b3a22";
const CLOTH_D = "#3e2214";
const LEATHER = "#4a2c1a";
const GOLD = "#d9a935";
const MOSS = "#5f7a35";

const SKINP = countershade(mottle(SKIN, SKIN_D, { size: 0.12, contrast: 0.6, seed: 4 }), BELLY, { level: -0.55, soft: 0.3 });
const MOHAWK = paint((p) => mix(RED, ORANGE, smoothstep(2.3, 2.75, p.y)));
const CLOTHP = paint((p, _n, s) => {
  const band = Math.abs(((s[1] * 9) % 1) - 0.5) < 0.08;
  return band ? GOLD : mix(CLOTH, CLOTH_D, noise(p, 0.1, 3));
});
const MOSSP = paint((p, n) => (n.y > 0.3 ? mix(MOSS, "#86a043", noise(p, 0.06, 2)) : SKINP));

const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M2 30 Q32 -4 62 14 L58 32 Q32 40 2 30Z" fill="#14240f"/>
  <ellipse cx="34" cy="24" rx="15" ry="11" fill="#ffd21f"/><ellipse cx="34" cy="24" rx="4" ry="10" fill="#1a0a05"/>
  <path d="M2 30 Q32 -4 62 14" stroke="#0a1408" stroke-width="5" fill="none"/></svg>`,
  { size: 192 },
);
const PAINT_MARK = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#e8dcb8" stroke-width="5" stroke-linecap="round">
  <path d="M10 10 L32 54 L54 10"/><path d="M18 24 H46"/><path d="M32 6 V30"/></g>
  <circle cx="32" cy="46" r="5" fill="#d8341c"/></svg>`,
  { size: 192 },
);
const RUNE = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 3 L28 16 L16 29 L4 16Z M16 9 V23 M9 16 H23" stroke="#ff8a1e" stroke-width="3" fill="none"/></svg>`,
  { size: 96 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 24 80"><path d="M12 79 C-2 55 0 20 12 1 C24 20 26 55 12 79Z" fill="#d8341c" stroke="#3a0e08" stroke-width="2.5"/>
  <path d="M12 76 V8" stroke="#ffb14a" stroke-width="3"/><path d="M12 40 L4 28 M12 40 L20 28 M12 56 L5 46 M12 56 L19 46" stroke="#ff8a1e" stroke-width="2"/></svg>`,
  { size: 128 },
);

function ringPts(c: number[], rx: number, rz: number, n: number, y = 0): number[][] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [c[0] + Math.sin(a) * rx, c[1] + Math.cos(a) * y, c[2] + Math.cos(a) * rz];
  });
}

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const R = rng(9);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.1, 0], [0, 1.4, 0.1], [0, 1.7, 0.2], [0, 1.95, 0.22]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.95, 0.22], aim: [0, 2.1, 0.38], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.1, 0.38], aim: [0, 2.3, 0.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.2, 0.55], aim: [0, 2.12, 0.78], role: "jaw" });

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const lp = limb([s * 0.22, 1.05, 0], [s * 0.3, 0.13, 0.1], [0.55, 0.5], [0, 0, 1]);
    legs[L] = b.chain(`leg${L}`, catmull(lp), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
    const ap = limb([s * 0.5, 1.92, 0.2], [s * 0.72, 0.95, 0.38], [0.62, 0.62], [0, 0, -1]);
    arms[L] = b.chain(`arm${L}`, catmull(ap), { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" });
  }

  // ---------------- body
  const torso = b.loft(
    [
      { at: [0, 1.1, 0], w: 0.55, h: 0.42 },
      { at: [0, 1.4, 0.1], w: 0.62, h: 0.55 },
      { at: [0, 1.7, 0.2], w: 0.9, h: 0.6 },
      { at: [0, 1.95, 0.22], w: 0.6, h: 0.42 },
    ],
    { bone: [spine, hips], color: SKINP, sides: 10 },
  );
  const skin = b.surface(torso);
  b.sweep(catmull([[0, 1.95, 0.22], [0, 2.05, 0.3], [0, 2.14, 0.4]]), [0.17, 0.14], { bone: neck, color: SKINP, sides: 8 });
  // hump and shoulders
  b.part(new THREE.SphereGeometry(0.3, 9, 7), SKINP, { bone: chest, at: [0, 1.98, 0.0], scale: [1.1, 0.8, 1.0] });
  b.decal(torso, PAINT_MARK, { at: [0, 1.7, 0.6], dir: [0, 0, 1], size: [0.4, 0.4], bone: chest });
  // belly belt
  b.sweep(skin.loop([0, 1.16, 0], { lift: 0.02 }), 0.04, { color: LEATHER, bone: hips, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), GOLD, { bone: hips, at: [0, 1.16, 0.3], dir: [0, 0, 1] });
  glow(b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", { bone: hips, at: [0, 1.16, 0.318], dir: [0, 0, 1], axis: "z", texture: RUNE }), 1.2);
  // loincloth
  const cloth: OutlinePoint[] = [[-0.22, 0], [0.22, 0], [0.2, -0.45], [0.1, -0.4, "sharp"], [0, -0.55, "sharp"], [-0.1, -0.4, "sharp"], [-0.2, -0.45]];
  b.extrude(cloth, { at: [0, 1.15, 0.32], x: [1, 0, 0], y: [0, 1, 0.1], thickness: 0.03, color: CLOTHP, bone: hips });
  b.extrude(cloth, { at: [0, 1.15, -0.3], x: [1, 0, 0], y: [0, 1, -0.1], thickness: 0.03, color: CLOTHP, bone: hips });
  // fur-less mossy patches
  b.cards(
    skin.scatter(14, { rng: R, minDist: 0.2, filter: (h) => h.n.y > 0.5 }),
    FEATHER,
    { size: [0.05, 0.14], lean: 20, color: MOSS, rng: R, vary: 0.3 },
  );

  // ---------------- necklace of fetishes
  const neckLoop = catmull(ringPts([0, 1.98, 0.3], 0.34, 0.3, 12), { closed: true });
  b.sweep(neckLoop, 0.012, { color: LEATHER, bone: chest, sides: 5 });
  b.along(neckLoop, 9, (at) => b.part(new THREE.ConeGeometry(0.025, 0.11, 5), BONE, { at, bone: chest, rotation: [180, 0, 0] }));
  const skull = b.part(new THREE.SphereGeometry(0.06, 7, 5), BONE, { bone: chest, at: [0, 1.72, 0.52] });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.05), BONE_D, { bone: chest, at: [0, 1.67, 0.55] });
  for (const s of [1, -1]) glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), ORANGE, { bone: chest, at: [s * 0.025, 1.73, 0.57] }), 1.4);
  void skull;
  // belt trophy skull
  b.part(new THREE.SphereGeometry(0.07, 7, 5), BONE, { bone: hips, at: [0.3, 1.1, 0.2] });
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.06), BONE_D, { bone: hips, at: [0.3, 1.04, 0.23] });
  // crossed bones on belt
  b.rod([-0.38, 1.0, 0.18], [-0.2, 1.2, 0.26], 0.018, { color: BONE, bone: hips, sides: 5 });
  b.rod([-0.2, 1.0, 0.26], [-0.38, 1.2, 0.18], 0.018, { color: BONE, bone: hips, sides: 5 });
  for (const [x, y, z] of [[-0.38, 1.0, 0.18], [-0.2, 1.2, 0.26], [-0.2, 1.0, 0.26], [-0.38, 1.2, 0.18]])
    b.part(new THREE.SphereGeometry(0.03, 5, 4), BONE, { bone: hips, at: [x, y, z] });

  // ---------------- head
  const sk = b.part(new THREE.SphereGeometry(1, 12, 9), SKINP, { bone: head, at: [0, 2.3, 0.5], scale: [0.2, 0.19, 0.24] });
  b.part(new THREE.BoxGeometry(0.34, 0.11, 0.18), SKINP, { bone: head, at: [0, 2.2, 0.7], rotation: [8, 0, 0] });
  b.part(new THREE.BoxGeometry(0.4, 0.07, 0.16), SKIN_D, { bone: head, at: [0, 2.4, 0.64], rotation: [-14, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055, 6, 5), SKIN_D, { bone: head, at: [s * 0.06, 2.22, 0.8], scale: [1, 0.7, 0.8] });
    glow(b.decal(sk, EYE, { at: [s * 0.1, 2.33, 0.68], dir: [s * 0.2, 0, 1], size: [0.11, 0.07], mirror: s > 0, bone: head }), 0.8);
    // ears
    b.extrude(
      [[0, -0.07], [0.14, -0.02], [0.5, 0.2, "sharp"], [0.14, 0.12], [0, 0.1]],
      { at: [s * 0.18, 2.32, 0.42], x: [s, 0.15, -0.35], y: [0, 1, 0], thickness: 0.025, bevel: 0.006, color: SKIN, bone: head },
    );
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), GOLD, { bone: head, at: [s * 0.27, 2.34, 0.38], dir: [s, 0, 0], axis: "z" });
  }
  // lower jaw and tusks
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.24), SKINP, { bone: jaw, at: [0, 2.14, 0.66], rotation: [-6, 0, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.08, 0.1), SKIN_D, { bone: jaw, at: [0, 2.08, 0.76] });
  for (const s of [1, -1]) {
    b.spike([s * 0.11, 2.14, 0.74], [s * 0.1, 1, 0.35], 0.3, 0.038, { color: BONE, bone: jaw, sides: 6 });
    b.spike([s * 0.11, 2.14, 0.74], [s * 0.1, 1, 0.35], 0.05, 0.045, { color: GOLD, bone: jaw, sides: 6, caps: "flat" });
  }
  for (let i = 0; i < 4; i++) b.spike([-0.075 + i * 0.05, 2.185, 0.8], [0, 1, 0.1], 0.04, 0.012, { color: BONE_D, bone: jaw, sides: 4 });
  // mohawk
  for (let i = 0; i < 9; i++) {
    const h = 0.34 - Math.abs(i - 3) * 0.03 + (i < 4 ? 0 : 0.0);
    const z = 0.7 - i * 0.075;
    b.extrude(
      [[-0.05, 0], [0.05, 0], [0.04, h * 0.6], [0, h, "sharp"], [-0.05, h * 0.55]] as OutlinePoint[],
      { at: [0, 2.46 - i * 0.012 + (i > 5 ? -0.05 : 0), z], x: [0, 0, 1], y: [0, 1, -0.45], thickness: 0.035, bevel: 0.006, color: MOHAWK, bone: head },
    );
  }
  // feathers and braid tied to mohawk
  b.cards([frame([0.07, 2.4, 0.2], [1, 0.4, 0]), frame([-0.07, 2.4, 0.2], [-1, 0.4, 0])], FEATHER, { size: [0.08, 0.34], lean: 40, bend: 25, flow: [0, -1, -0.4], bone: head });
  // face paint
  b.decal(sk, PAINT_MARK, { at: [0, 2.43, 0.7], dir: [0, 0.3, 1], size: [0.08, 0.08], bone: head });

  // ---------------- legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.sweep(legs[L], (t) => 0.19 - 0.08 * t, { color: SKINP, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), SKINP, { bone: legs[L].joints[0], at: [s * 0.24, 1.1, 0], scale: [1, 1.1, 1] });
    const ank = legs[L].tip!;
    b.part(new THREE.BoxGeometry(0.24, 0.12, 0.34), SKINP, { bone: ank, at: [s * 0.3, 0.06, 0.16] });
    for (const dx of [-0.08, 0, 0.08]) {
      b.part(new THREE.BoxGeometry(0.07, 0.07, 0.12), SKIN_D, { bone: ank, at: [s * 0.3 + dx, 0.04, 0.38] });
      b.spike([s * 0.3 + dx, 0.05, 0.43], [0, -0.1, 1], 0.08, 0.025, { color: BONE_D, bone: ank, sides: 5 });
    }
    // ankle wraps
    b.sweep(catmull(ringPts([s * 0.3, 0.2, 0.1], 0.1, 0.1, 8), { closed: true }), 0.02, { color: LEATHER, bone: ank, sides: 5 });
    // knee bone studs
    const kp = legs[L].at(0.5).at;
    b.spike([kp.x, kp.y + 0.02, kp.z + 0.1], [0, 0.3, 1], 0.14, 0.04, { color: BONE, bone: legs[L].joints[1], sides: 6 });
  }

  // ---------------- arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, (t) => 0.16 - 0.06 * t, { color: SKINP, sides: 8 });
    b.part(new THREE.SphereGeometry(0.25, 9, 7), SKINP, { bone: arm.joints[0], at: [s * 0.5, 1.95, 0.2] });
    // shoulder spikes
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.5 + i * 0.05), 2.15 - i * 0.02, 0.1 + i * 0.1], [s * 0.4, 1, i * 0.2 - 0.2], 0.26 - i * 0.04, 0.045, { color: BONE, bone: arm.joints[0], sides: 6 });
    b.sweep(catmull(ringPts([s * 0.5, 1.95, 0.2], 0.25, 0.25, 8), { closed: true }), 0.02, { color: LEATHER, bone: arm.joints[0], sides: 5 });
    // bracer
    const bt = arm.at(0.75);
    b.sweep(catmull(ringPts([bt.at.x, bt.at.y, bt.at.z], 0.1, 0.1, 8), { closed: true }), 0.03, { color: GOLD, bone: arm.joints[1], sides: 6 });
    const w = arm.tip!;
    const wp = arm.at(1).at;
    b.part(new THREE.SphereGeometry(0.11, 8, 6), SKINP, { bone: w, at: [wp.x, wp.y - 0.05, wp.z], scale: [1, 1.2, 0.9] });
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.045;
      b.capsule([wp.x + dx, wp.y - 0.1, wp.z], [wp.x + dx, wp.y - 0.23, wp.z + 0.07], 0.022, { color: SKIN_D, bone: w, sides: 5 });
      b.spike([wp.x + dx, wp.y - 0.23, wp.z + 0.07], [0, -0.7, 0.7], 0.07, 0.016, { color: BONE_D, bone: w, sides: 4 });
    }
    b.capsule([wp.x + s * 0.08, wp.y - 0.04, wp.z + 0.03], [wp.x + s * 0.14, wp.y - 0.14, wp.z + 0.08], 0.024, { color: SKIN_D, bone: w, sides: 5 });
  }
  // bone fetish staff-less totem hanging from left wrist
  const wl = arms.L.at(1).at;
  b.sweep(bezier([wl.x, wl.y, wl.z], [wl.x + 0.05, wl.y - 0.1, wl.z + 0.1], [wl.x + 0.02, wl.y - 0.28, wl.z + 0.14]), 0.01, { color: LEATHER, bone: arms.L.tip!, sides: 4 });
  b.part(new THREE.OctahedronGeometry(0.05), BONE, { bone: arms.L.tip!, at: [wl.x + 0.02, wl.y - 0.3, wl.z + 0.14], scale: [0.8, 1.4, 0.8], flat: true });
  glow(b.part(new THREE.OctahedronGeometry(0.02), ORANGE, { bone: arms.L.tip!, at: [wl.x + 0.02, wl.y - 0.3, wl.z + 0.18], flat: true }), 1.4);

  return b.root;
}
