// Dwarf Rifleman, Warcraft style: chunky proportions, heavy pauldrons, braided copper beard, brass-bound blunderbuss.
import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { frame } from "../../../../src/index";
import { limb } from "../../../../src/index";
import { rng } from "../../../../src/index";
import { catmull, polyline } from "../../../../src/index";
import { mix, noise, paint } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stocky 1.4 m dwarf rifleman with a braided copper beard, iron helm with goggles, blue tabard with a hammer crest, bandolier, and a flared brass blunderbuss.",
};

const SKIN = "#d9946e";
const SKIN_D = "#b9714f";
const BEARD = "#c9631e";
const BEARD_L = "#f0a04a";
const BLUE = "#244a9c";
const BLUE_D = "#16295e";
const GOLD = "#e8b43a";
const GOLD_D = "#9a6a1c";
const IRON = "#6b7080";
const IRON_D = "#3b3e4b";
const LEATHER = "#6b3d22";
const LEATHER_D = "#40240f";
const WOOD = "#7a4a26";
const BRASS = "#c8923a";
const CREAM = "#efe3c4";
const RED = "#b3302a";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const LEATHER_P = paint((p, n) => mix(LEATHER, LEATHER_D, noise(p, 0.05, 3) * 0.7 + (n.y < 0 ? 0.25 : 0)));
const CLOTH_P = paint((p, n) => mix(BLUE_D, BLUE, 0.45 + 0.5 * Math.max(0, n.y * 0.5 + 0.5) * noise(p, 0.09, 2)));
const IRON_P = paint((p, n) => mix(IRON_D, IRON, 0.3 + 0.7 * noise(p, 0.06, 5) * (0.6 + 0.4 * Math.max(0, n.y))));
const BRASS_P = paint((p, n) => mix(GOLD_D, BRASS, 0.4 + 0.6 * noise(p, 0.05, 7) + 0.1 * n.y));
const WOOD_P = paint((p) => mix("#5a3318", WOOD, noise(new THREE.Vector3(p.x * 5, p.y * 5, p.z * 0.6), 0.12, 8)));
const SKIN_P = paint((p, n) => mix(SKIN_D, SKIN, 0.55 + 0.4 * n.y * 0.5 + 0.2 * noise(p, 0.05, 1)));
const BEARD_P = paint((p, n) => mix(BEARD, BEARD_L, Math.min(1, Math.max(0, 0.35 + 0.5 * noise(p, 0.04, 4) + 0.15 * n.y))));
const BRAID_P = paint((_p, _n, s) => (((s[0] * 40) % 1 + 1) % 1 < 0.5 ? BEARD : BEARD_L));

const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="22" rx="28" ry="15" fill="#fff6e0" stroke="#2b1208" stroke-width="4"/>
  <circle cx="32" cy="22" r="11" fill="#2fa6d8"/><circle cx="32" cy="22" r="11" fill="none" stroke="#14506e" stroke-width="2.5"/>
  <circle cx="32" cy="22" r="5.5" fill="#0b0b12"/><circle cx="27" cy="17" r="3.5" fill="#fff"/>
  <path d="M3 12 Q32 -2 61 12" stroke="#2b1208" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
  { size: 192 },
);
const CREST = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4 H60 V44 Q60 68 32 78 Q4 68 4 44Z" fill="#16295e" stroke="#e8b43a" stroke-width="4"/>
  <path d="M16 62 L48 20" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/>
  <path d="M16 20 L48 62" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/>
  <rect x="38" y="12" width="20" height="14" rx="2" fill="#b4b8c8" stroke="#2b2e3b" stroke-width="2.5" transform="rotate(40 48 19)"/>
  <rect x="6" y="12" width="20" height="14" rx="2" fill="#b4b8c8" stroke="#2b2e3b" stroke-width="2.5" transform="rotate(-40 16 19)"/>
  <circle cx="32" cy="40" r="7" fill="#e8b43a"/></svg>`,
  { size: 192 },
);
const STRAND = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 0 Q0 30 14 64 Q20 30 20 0Z" fill="#c9631e"/><path d="M16 0 Q18 34 26 60 Q32 30 28 0Z" fill="#f0a04a"/></svg>`,
  { size: 128 },
);
const RUNES = svg(
  `<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg"><g stroke="#e8b43a" stroke-width="2.2" fill="none" stroke-linecap="round">
  ${Array.from({ length: 6 }, (_, i) => `<path d="M${6 + i * 15} 3 L${6 + i * 15} 13 M${6 + i * 15} 5 L${12 + i * 15} 8 L${6 + i * 15} 11"/>`).join("")}</g></svg>`,
  { size: 384 },
);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 1024 });
  const R = rng(7);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain("spine", polyline([V(0, 0.6, 0), V(0, 0.75, 0.01), V(0, 0.9, 0.02), V(0, 1.02, 0.02)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.04, 0.03], aim: [0, 1.1, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0.05], aim: [0, 1.25, 0.06], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.15, 0.0], aim: [0, 1.13, 0.1], role: "jaw" });

  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.12, 0.6, 0), V(s * 0.14, 0.1, 0.0), [0.27, 0.27], [0, 0, 1]);
    legs[L] = b.chain(`leg${L}`, polyline(pts), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
  }

  const gripR = V(-0.13, 0.93, 0.3);
  const gripL = V(0.0, 0.95, 0.52);
  const arms: Record<string, any> = {};
  const armTargets: Record<string, THREE.Vector3> = { R: gripR, L: gripL };
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = V(s * 0.3, 1.0, 0);
    const pts = limb(sh, armTargets[L], [0.31, 0.3], [0, 0, -1]);
    arms[L] = b.chain(`arm${L}`, polyline(pts), { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" });
  }

  // ---------------- torso
  b.sweep(spine, (t) => [0.2 + 0.07 * Math.sin(t * 2.4 + 0.3), 0.16 + 0.04 * t], {
    color: CLOTH_P,
    sides: 10,
    caps: { start: "flat", end: "flat" },
  });
  // leather vest panels and belly
  b.part(new THREE.SphereGeometry(1, 10, 8), LEATHER_P, { bone: spine.joints[1], at: [0, 0.74, 0.1], scale: [0.2, 0.16, 0.13] });
  // tabard with crest
  b.part(new THREE.BoxGeometry(0.2, 0.46, 0.02), BLUE, { bone: hips, at: [0, 0.62, 0.2], rotation: [4, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.16, 0.2), "#ffffff", { bone: hips, at: [0, 0.68, 0.212], dir: [0, 0, 1], axis: "z", texture: CREST });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.026), GOLD, { bone: hips, at: [0, 0.4, 0.2] });
  b.part(new THREE.PlaneGeometry(0.19, 0.03), "#ffffff", { bone: hips, at: [0, 0.44, 0.214], dir: [0, 0, 1], axis: "z", texture: RUNES });
  b.part(new THREE.BoxGeometry(0.2, 0.4, 0.02), BLUE_D, { bone: hips, at: [0, 0.6, -0.19] });
  // belt
  b.sweep(polyline([V(0, 0.64, 0), V(0, 0.68, 0)]), [0.29, 0.29], { bone: hips, color: LEATHER_D, sides: 10, smooth: false, caps: "flat" });
  b.part(new THREE.BoxGeometry(0.1, 0.085, 0.03), BRASS_P, { bone: hips, at: [0, 0.66, 0.255] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.034, 8), RED, { bone: hips, at: [0, 0.66, 0.272], dir: [0, 0, 1] });
  // bandolier with cartridges
  const bandPts = [V(-0.27, 1.06, 0.03), V(-0.14, 0.95, 0.2), V(0.0, 0.85, 0.24), V(0.16, 0.74, 0.2), V(0.28, 0.66, 0.08)];
  const band = catmull(bandPts);
  b.sweep(band, [0.04, 0.012], { bone: chest, color: LEATHER_P, sides: 6, smooth: false });
  for (let i = 0; i < 7; i++) {
    const p = band.at(0.1 + i * 0.13);
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 6), i % 2 ? BRASS_P : IRON_P, { bone: chest, at: [p.x, p.y - 0.01, p.z + 0.018], dir: [0.1, 1, 0] });
    b.part(new THREE.CylinderGeometry(0.0145, 0.0145, 0.012, 6), RED, { bone: chest, at: [p.x, p.y + 0.02, p.z + 0.018], dir: [0.1, 1, 0] });
  }
  // powder horn and pouch
  b.sweep(catmull([V(0.25, 0.64, 0.14), V(0.33, 0.58, 0.12), V(0.36, 0.5, 0.06)]), [0.036, 0.006], { bone: hips, color: CREAM, sides: 6, caps: "round" });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.06), LEATHER_P, { bone: hips, at: [-0.28, 0.58, 0.1] });
  b.part(new THREE.BoxGeometry(0.11, 0.04, 0.07), LEATHER_D, { bone: hips, at: [-0.28, 0.64, 0.1] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: hips, at: [-0.28, 0.6, 0.137] });

  // ---------------- neck / head
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.08, 8), SKIN_P, { bone: neck, at: [0, 1.07, 0.03] });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN_P, { bone: head, at: [0, 1.22, 0.03], scale: [0.14, 0.15, 0.145] });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.1), SKIN_P, { bone: jaw, at: [0, 1.13, 0.07] });
  // nose bulb
  b.part(new THREE.SphereGeometry(0.04, 8, 6), "#e0806a", { bone: head, at: [0, 1.2, 0.17], scale: [1.1, 1, 1.15] });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.065, 1.245, 0.14], dir: [s * 0.25, 0, 1], size: [0.07, 0.044], bone: head, mirror: s > 0, lift: 0.002 });
    // bushy brows
    b.capsule([s * 0.11, 1.285, 0.125], [s * 0.025, 1.275, 0.162], [0.02, 0.014], { bone: head, color: BEARD, sides: 5 });
    b.spike([s * 0.115, 1.285, 0.12], [s * 0.15, 1.3, 0.1], null, 0.017, { bone: head, color: BEARD, sides: 5 });
    // ears
    b.part(new THREE.SphereGeometry(1, 6, 5), SKIN, { bone: head, at: [s * 0.14, 1.22, 0.0], scale: [0.02, 0.045, 0.03] });
    // cheek pink
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#e88a78", { bone: head, at: [s * 0.1, 1.17, 0.125], scale: [1, 0.8, 0.5] });
  }

  // ---------------- beard: bib, moustache, braids
  const bib = b.loft(
    [
      { at: [0, 1.17, 0.09], w: 0.27, h: 0.12 },
      { at: [0, 1.09, 0.14], w: 0.26, h: 0.14 },
      { at: [0, 0.99, 0.16], w: 0.2, h: 0.12 },
      { at: [0, 0.89, 0.16], w: 0.06, h: 0.06 },
    ],
    { bone: jaw, color: BEARD_P, sides: 8, caps: { start: "flat", end: "point" } },
  );
  b.cards(
    b.surface(bib).scatter(24, { rng: R, minDist: 0.045, filter: (h) => h.n.z > -0.2 }),
    STRAND,
    { size: [0.05, 0.09], lean: 55, bend: 12, flow: [0, -1, 0.3], vary: 0.25, rng: R, bone: jaw },
  );
  for (const s of [1, -1]) {
    b.sweep(catmull([V(s * 0.01, 1.165, 0.17), V(s * 0.06, 1.15, 0.18), V(s * 0.12, 1.12, 0.15), V(s * 0.15, 1.17, 0.12)]), [0.028, 0.008], {
      bone: head, color: BEARD_L, sides: 6, caps: "round",
    });
    // braids with gold ties
    const bp = catmull([V(s * 0.08, 1.0, 0.19), V(s * 0.1, 0.9, 0.22), V(s * 0.1, 0.78, 0.21), V(s * 0.09, 0.66, 0.2)]);
    b.sweep(bp, [0.03, 0.016], { bone: jaw, color: BRAID_P, sides: 6, caps: "round" });
    for (let i = 0; i < 4; i++) {
      const p = bp.at(0.15 + i * 0.22);
      b.part(new THREE.SphereGeometry(0.026 - i * 0.003, 6, 4), BEARD, { bone: jaw, at: [p.x, p.y, p.z], scale: [1, 0.6, 1] });
    }
    const t = bp.at(0.98);
    b.part(new THREE.TorusGeometry(0.02, 0.006, 4, 8), GOLD, { bone: jaw, at: [t.x, t.y + 0.02, t.z], dir: [0, 1, 0], axis: "z" });
    b.part(new THREE.SphereGeometry(0.017, 6, 4), RED, { bone: jaw, at: [t.x, t.y - 0.02, t.z] });
  }
  b.part(new THREE.TorusGeometry(0.03, 0.008, 4, 8), GOLD, { bone: jaw, at: [0, 0.96, 0.185], dir: [0, 0.3, 1], axis: "z" });

  // ---------------- helm with goggles
  b.part(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), IRON_P, {
    bone: head, at: [0, 1.28, 0.02], scale: [0.16, 0.14, 0.165],
  });
  b.sweep(catmull(Array.from({ length: 12 }, (_, i) => V(Math.sin((i / 12) * 6.283) * 0.16, 1.285, 0.02 + Math.cos((i / 12) * 6.283) * 0.165), { closed: true }) as any, { closed: true }), 0.014, {
    bone: head, color: BRASS_P, sides: 6,
  });
  b.rod([0, 1.4, -0.12], [0, 1.4, 0.13], [0.014, 0.014], { bone: head, color: BRASS_P, sides: 4 });
  b.part(new THREE.ConeGeometry(0.025, 0.07, 6), GOLD, { bone: head, at: [0, 1.44, 0.0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.1, 0.05), IRON_P, { bone: head, at: [s * 0.155, 1.24, 0.07] });
    // goggles on brow
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 10), BRASS_P, { bone: head, at: [s * 0.06, 1.33, 0.11], dir: [0, 0.4, 1] });
    glow(b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.034, 10), "#58d7ff", { bone: head, at: [s * 0.06, 1.333, 0.116], dir: [0, 0.4, 1] }), 0.8);
  }
  b.sweep(polyline([V(-0.08, 1.325, 0.108), V(0.08, 1.325, 0.108)]), 0.01, { bone: head, color: LEATHER_D, sides: 4 });

  // ---------------- legs & boots
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = legs[L];
    b.sweep(leg, [0.105, 0.09, 0.085], { color: BLUE_D, sides: 8, caps: { start: "round", end: "flat" }, to: 0.7 });
    const ank = leg.tip ?? leg.joints[2];
    b.sweep(polyline([V(s * 0.135, 0.36, 0.0), V(s * 0.14, 0.1, 0.0)]), [0.1, 0.092], { bone: ank, color: LEATHER_P, sides: 8, caps: { start: "flat", end: "flat" } });
    b.part(new THREE.CylinderGeometry(0.11, 0.1, 0.05, 8), LEATHER_D, { bone: ank, at: [s * 0.135, 0.37, 0.0] });
    b.part(new THREE.BoxGeometry(0.17, 0.1, 0.3), LEATHER_P, { bone: ank, at: [s * 0.14, 0.05, 0.06] });
    b.part(new THREE.SphereGeometry(1, 8, 6), LEATHER_P, { bone: ank, at: [s * 0.14, 0.05, 0.2], scale: [0.085, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.175, 0.025, 0.31), IRON_D, { bone: ank, at: [s * 0.14, 0.012, 0.06] });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.03), BRASS_P, { bone: ank, at: [s * 0.14, 0.32, 0.1] });
    // knee plate
    b.part(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), IRON_P, { bone: leg.joints[1], at: [s * 0.125, 0.34, 0.07], dir: [0, 0, 1] , scale: [1, 1, 0.6]});
  }

  // ---------------- arms, pauldrons, hands
  const hands: Record<string, any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, [0.085, 0.075, 0.065], { color: CLOTH_P, sides: 8, caps: { start: "round", end: "flat" }, to: 0.78 });
    b.sweep(arm, [0.062, 0.062], { color: LEATHER_P, sides: 8, from: 0.62, to: 0.97, caps: "flat" });
    const pad = b.part(new THREE.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), IRON_P, {
      bone: arm.joints[0], at: [s * 0.33, 1.03, 0], rotation: [0, 0, -s * 22], scale: [1, 0.8, 1.05],
    });
    void pad;
    b.sweep(catmull(Array.from({ length: 10 }, (_, i) => V(s * 0.33 + Math.sin((i / 10) * 6.283) * 0.14, 0.99, Math.cos((i / 10) * 6.283) * 0.14)), { closed: true }), 0.013, {
      bone: arm.joints[0], color: GOLD, sides: 5,
    });
    b.part(new THREE.ConeGeometry(0.03, 0.08, 6), GOLD, { bone: arm.joints[0], at: [s * 0.37, 1.12, 0], rotation: [0, 0, -s * 30] });
    hands[L] = arm.tip ?? arm.joints[2];
  }
  const fist = (L: string, c: THREE.Vector3) => {
    const h = hands[L];
    b.part(new THREE.SphereGeometry(0.065, 8, 6), SKIN_P, { bone: h, at: [c.x, c.y, c.z], scale: [1, 0.9, 1.1] });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.CapsuleGeometry(0.014, 0.04, 3, 5), SKIN, {
        bone: h, at: [c.x + (i - 1.5) * 0.001, c.y + 0.045 - i * 0.002, c.z + (i - 1.5) * 0.026],
        rotation: [90, 0, 0],
      });
  };
  fist("R", gripR);
  fist("L", gripL);

  // ---------------- blunderbuss
  const d = gripL.clone().sub(gripR).normalize();
  const butt = gripR.clone().addScaledVector(d, -0.34).add(V(0, -0.06, 0));
  const breech = gripR.clone().addScaledVector(d, 0.08).add(V(0, 0.045, 0));
  const muzzle = gripR.clone().addScaledVector(d, 0.95).add(V(0, 0.045, 0));
  const gun = b.joint("gun", { parent: hands.R, at: breech.toArray() as [number, number, number], dir: d.toArray() as [number, number, number] });
  b.rod(butt, breech.clone().add(V(0, -0.02, 0)), [0.06, 0.04], { bone: gun, color: WOOD_P, sides: 6 });
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.03), BRASS_P, { bone: gun, at: [butt.x, butt.y, butt.z], quat: new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), d) });
  b.rod(breech.clone().addScaledVector(d, -0.04), gripL.clone().addScaledVector(d, 0.05).add(V(0, 0.045, 0)), 0.04, { bone: gun, color: WOOD_P, sides: 6 });
  const barrel = polyline([breech, muzzle]);
  b.sweep(barrel, (t) => (t < 0.55 ? 0.034 : 0.034 + Math.pow((t - 0.55) / 0.45, 2) * 0.07), {
    bone: gun, color: BRASS_P, sides: 8, caps: { start: "flat", end: "flat" },
  });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.01, 10), "#15151b", { bone: gun, at: muzzle.toArray() as any, dir: d.toArray() as any });
  for (const t of [0.12, 0.35, 0.58]) {
    const p = barrel.at(t);
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 8), IRON_P, { bone: gun, at: [p.x, p.y, p.z], dir: d.toArray() as any });
  }
  // lock: flash pan, hammer, trigger
  const lockP = breech.clone().addScaledVector(d, 0.02).add(V(-0.0, 0.0, 0));
  b.part(new THREE.BoxGeometry(0.06, 0.07, 0.12), IRON_P, { bone: gun, at: [lockP.x - 0.03, lockP.y - 0.0, lockP.z], quat: new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), d) });
  b.spike(lockP.clone().add(V(-0.02, 0.04, -0.03)), lockP.clone().add(V(-0.02, 0.1, -0.06)), null, 0.014, { bone: gun, color: IRON_D, sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), "#ffae3a", { bone: gun, at: [lockP.x - 0.01, lockP.y + 0.04, lockP.z + 0.02] }), 1.4);
  b.part(new THREE.TorusGeometry(0.03, 0.005, 4, 8, Math.PI), IRON_D, { bone: gun, at: [gripR.x, gripR.y - 0.06, gripR.z + 0.05], rotation: [0, 90, 0] });
  // sling
  b.sweep(catmull([butt.clone().add(V(0, 0.04, 0)), V(-0.28, 0.7, 0.0), V(-0.3, 1.0, -0.1), gripL.clone().add(V(0.0, 0.0, -0.1)).add(V(0, 0.04, 0))]), 0.01, {
    bone: gun, color: LEATHER_D, sides: 4,
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.025), "#ffffff", { bone: gun, at: [gripL.x - 0.02, gripL.y + 0.0, gripL.z - 0.12], dir: [0.3, 0.6, 0.3], axis: "z", texture: RUNES });

  // hanging tassel of the beard rune ties
  b.cards([frame([0, 0.95, 0.19], [0, 1, 0])], STRAND, { size: [0.04, 0.1], lean: 180, flow: [0, 0, 1], bone: jaw });

  return b.root;
}
