```ts
import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, polyline, bezier, mottle, grain, paint, mix, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description: "A stocky Warcraft-style dwarf rifleman with an iron helm, braided beard and a flared brass-banded blunderbuss.",
};

const SKIN = "#d8a07a", NOSE = "#d98a76", IRON = "#6d727d", IRON_D = "#3c4049", BRASS = "#d0993a", BRASS_D = "#8a5f1e";
const WOOD = "#7a4a26", BEARD = "#c9622a", BEARD_L = "#ee9a4a", BLUE = "#27478f", BLUE_D = "#182c5c", LEATHER = "#5a3620";
const RED = "#a8302a", BLACK = "#14100e", WHITE = "#f6efe0";
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const COAT = paint((p, n) => mix(mix(BLUE_D, BLUE, 0.4 + 0.6 * Math.max(0, n.y * 0.5 + 0.5)), "#3a62b8", noise(p, 0.05, 3) * 0.3));
const LEATH = mottle(LEATHER, "#3b2212", { size: 0.04, contrast: 0.6, seed: 2 });
const WOODP = grain(WOOD, "#4e2d14", { size: 0.012, axis: "z", seed: 4 });
const STEEL = mottle(IRON, IRON_D, { size: 0.05, contrast: 0.5, seed: 7 });

const STRAND = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 64 Q0 30 8 2 Q14 30 14 64Z" fill="${BEARD}"/><path d="M14 64 Q14 24 20 0 Q28 30 24 64Z" fill="${BEARD_L}"/><path d="M22 64 Q26 34 30 12 Q32 40 30 64Z" fill="#a24a1c"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="${BRASS_D}" stroke="${BRASS}" stroke-width="5"/><path d="M32 10 L42 30 L32 54 L22 30Z" fill="${BRASS}"/><path d="M14 30 H50" stroke="#3a2008" stroke-width="5"/><circle cx="32" cy="30" r="4" fill="${RED}"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg"><g stroke="#ffb347" stroke-width="3" fill="none" stroke-linecap="round"><path d="M4 4 V20 M4 12 L12 4"/><path d="M20 4 L28 20 L20 20 M24 12 H30"/><path d="M38 4 V20 M34 8 L42 16"/></g></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain("spine", catmull([V(0, 0.6, 0), V(0, 0.78, 0.01), V(0, 0.98, 0.02)]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0.02], aim: [0, 1.06, 0.04], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.06, 0.04], aim: [0, 1.2, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.08, 0.05], aim: [0, 1.04, 0.17], role: "jaw" });

  // torso
  const torso = b.sweep(spine, (t) => [0.2 - 0.02 * t + 0.03 * Math.sin(t * 3), 0.155], { color: COAT, sides: 10 });
  const skin = b.surface(torso);
  b.sweep(skin.loop(V(0, 0.68, 0), { lift: 0.012 }), 0.03, { color: LEATH, bone: hips, sides: 6 });
  b.part(new THREE.BoxGeometry(0.1, 0.085, 0.03), BRASS, { bone: hips, at: [0, 0.68, 0.18] });
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: hips, at: [0, 0.68, 0.197], dir: [0, 0, 1], axis: "z", texture: EMBLEM });
  b.sweep(skin.drape(catmull([V(-0.14, 0.98, 0.04), V(0, 0.84, 0.17), V(0.16, 0.66, 0.1)]), { lift: 0.012 }), 0.025, { color: LEATH, bone: chest, sides: 5 });
  // tabard skirt
  b.extrude([[-0.13, 0], [0.13, 0], [0.11, -0.2], [0, -0.26, "sharp"], [-0.11, -0.2]], { at: [0, 0.66, 0.17], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: RED, bone: hips });
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 10), BLUE_D, { bone: hips, at: [0, 0.6, 0] });
  // pauldrons & collar
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), IRON, { bone: chest, at: [s * 0.24, 0.97, 0], scale: [1.2, 0.8, 1.1] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), BRASS, { bone: chest, at: [s * 0.24, 1.05, 0.0] });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.05, 8), LEATH, { bone: neck, at: [0, 1.01, 0.02] });

  // legs
  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.1, 0.6, 0), V(s * 0.11, 0.07, 0.02), [0.3, 0.29], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, polyline(pts), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: [s * 0.11, 0, 0.05] });
    legs[L] = leg;
    b.sweep(leg, [0.095, 0.08, 0.07], { color: "#4a3a2c", sides: 8 });
    b.part(new THREE.CylinderGeometry(0.085, 0.075, 0.2, 8), LEATH, { bone: leg.joints[1], at: [s * 0.11, 0.2, 0.02] });
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.27), LEATH, { bone: leg.tip, at: [s * 0.11, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.16, 0.025, 0.28), IRON_D, { bone: leg.tip, at: [s * 0.11, 0.0125, 0.07] });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), IRON, { bone: leg.joints[1], at: [s * 0.1, 0.33, 0.07], scale: [1, 1, 0.7] });
  }

  // gun geometry
  const d = V(0.12, 0.06, 1).normalize();
  const G0 = V(-0.12, 0.8, 0);
  const P = (t: number) => G0.clone().addScaledVector(d, t);

  // arms
  const arms: Record<string, any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const tgt = s < 0 ? P(0.04).add(V(0, -0.05, 0)) : P(0.3).add(V(0, -0.05, 0));
    const pts = limb(V(s * 0.25, 0.93, 0), tgt, [0.25, 0.25], [s, -0.5, -0.3]);
    const arm = b.chain(`arm${L}`, polyline(pts), { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" });
    arms[L] = arm;
    b.sweep(arm, [0.075, 0.062, 0.055], { color: COAT, sides: 8 });
    const wr = pts[2];
    b.part(new THREE.CylinderGeometry(0.062, 0.066, 0.07, 8), LEATH, { bone: arm.joints[1], at: wr.clone().lerp(pts[1], 0.25) });
    b.part(new THREE.SphereGeometry(0.058, 8, 6), SKIN, { bone: arm.tip, at: wr });
    for (let i = 0; i < 4; i++) {
      b.capsule(wr.clone().add(V(0.045 - i * 0.03, 0.03, 0.03)), wr.clone().add(V(0.045 - i * 0.03, -0.045, 0.05)), 0.014, { bone: arm.tip, color: SKIN, sides: 5 });
    }
  }

  // blunderbuss
  const gun = b.joint("gun", { parent: arms.R.tip, at: P(0), dir: d });
  const gb = { bone: gun } as const;
  b.rod(P(-0.22), P(0.28), [0.04, 0.032], { ...gb, color: WOODP, sides: 6 });
  b.part(new THREE.BoxGeometry(0.05, 0.14, 0.05), WOOD, { ...gb, at: P(-0.22).add(V(0, -0.05, 0)), rotation: [0, 0, 0] });
  b.rod(P(0.2), P(0.7), [0.03, 0.038], { ...gb, color: STEEL, sides: 8 });
  b.lathe([[0.034, 0], [0.042, 0], [0.1, 0.15], [0.085, 0.15]], { at: P(0.7), axis: d, bone: gun, color: BRASS, segments: 10, smoothing: 0 });
  for (const t of [0.26, 0.42, 0.58, 0.69]) b.rod(P(t - 0.012), P(t + 0.012), 0.045 + (t > 0.6 ? 0.004 : 0), { ...gb, color: BRASS, sides: 8 });
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.1), BRASS_D, { ...gb, at: P(0.16).add(V(0.0, 0.05, 0)) });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), IRON, { ...gb, at: P(0.1).add(V(0, 0.075, 0)) });
  b.sweep(catmull([P(0.07).add(V(0, -0.02, 0.0)), P(0.1).add(V(0, -0.07, 0)), P(0.15).add(V(0, -0.02, 0))]), 0.006, { ...gb, color: BRASS, sides: 4 });
  glow(b.part(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", { ...gb, at: P(0.45).add(V(-0.045, 0.0, 0)), dir: [-1, 0, 0.1], axis: "z", texture: RUNE }), 1);
  b.sweep(catmull([P(0.0).add(V(0.04, -0.03, 0)), P(0.3).add(V(0.06, -0.08, 0)), P(0.55).add(V(0.045, -0.04, 0))]), 0.007, { ...gb, color: LEATHER, sides: 4 });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: [0, 1.12, 0.04], scale: [0.135, 0.14, 0.14] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), NOSE, { bone: head, at: [0, 1.1, 0.19], scale: [1, 0.95, 1.05] });
  b.part(new THREE.BoxGeometry(0.17, 0.04, 0.12), SKIN, { bone: jaw, at: [0, 1.04, 0.09] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.028, 8, 6), WHITE, { bone: head, at: [s * 0.058, 1.15, 0.168] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BLACK, { bone: head, at: [s * 0.058, 1.15, 0.194] });
    b.capsule([s * 0.1, 1.2, 0.15], [s * 0.025, 1.18, 0.19], 0.02, { bone: head, color: BEARD, sides: 5 });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), SKIN, { bone: head, at: [s * 0.14, 1.12, 0.03], scale: [0.6, 1.2, 0.9] });
    // moustache
    b.sweep(catmull([V(0, 1.065, 0.2), V(s * 0.06, 1.05, 0.205), V(s * 0.13, 1.0, 0.16), V(s * 0.16, 0.93, 0.13)]), [0.03, 0.012], { bone: head, color: BEARD_L, sides: 6 });
  }
  // beard bib + cards
  const bib = b.loft(
    [{ at: [0, 1.06, 0.14], w: 0.24, h: 0.08 }, { at: [0, 0.98, 0.19], w: 0.26, h: 0.1 }, { at: [0, 0.9, 0.2], w: 0.2, h: 0.1 }, { at: [0, 0.82, 0.18], w: 0.08, h: 0.06 }],
    { bone: jaw, color: BEARD, sides: 8, caps: { start: "flat", end: "point" } },
  );
  b.cards(b.surface(bib).scatter(40, { rng: R, minDist: 0.04 }), STRAND, { size: [0.05, 0.08], lean: 60, flow: [0, -1, 0.2], vary: 0.25, rng: R, bone: jaw });
  // braids
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const br = b.chain(`braid${L}`, catmull([V(s * 0.07, 0.95, 0.2), V(s * 0.08, 0.85, 0.23), V(s * 0.08, 0.74, 0.23), V(s * 0.08, 0.64, 0.21)]), { parent: jaw, count: 3, role: "tail" });
    b.sweep(br, [0.034, 0.02], { color: BEARD, sides: 6 });
    b.along(br, 4, (at) => b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), BRASS, { frame: at, bone: br.joints[1], dir: at.axis, axis: "z" }));
    b.part(new THREE.SphereGeometry(0.022, 6, 4), BRASS, { bone: br.joints[2], at: [s * 0.08, 0.62, 0.21] });
  }
  // helm
  b.lathe([[0, 0], [0.15, 0], [0.165, 0.03], [0.15, 0.11], [0.09, 0.17], [0, 0.19]], { at: [0, 1.19, 0.03], bone: head, color: STEEL, segments: 12, smoothing: 1 });
  b.sweep(catmull([V(-0.15, 1.2, 0.03), V(0, 1.2, 0.17), V(0.15, 1.2, 0.03)]), 0.014, { bone: head, color: BRASS, sides: 5 });
  b.rod([0, 1.2, 0.17], [0, 1.1, 0.19], [0.014, 0.01], { bone: head, color: IRON, sides: 4 });
  for (const s of [1, -1]) {
    b.sweep(bezier(V(s * 0.15, 1.24, 0.03), V(s * 0.3, 1.26, 0.03), V(s * 0.3, 1.36, 0.03), V(s * 0.24, 1.42, 0.03)), [0.035, 0.0], { bone: head, color: "#efe0b4", sides: 6, caps: { end: "point" } });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), BRASS, { bone: head, at: [s * 0.18, 1.245, 0.03], dir: [s, 0.2, 0] });
  }
  b.part(new THREE.ConeGeometry(0.02, 0.07, 5), RED, { bone: head, at: [0, 1.4, 0.03] });

  // powder horn at hip
  b.sweep(bezier(V(0.2, 0.62, -0.12), V(0.27, 0.6, -0.08), V(0.29, 0.5, -0.02), V(0.24, 0.44, 0.04)), [0.04, 0.008], { bone: hips, color: "#e6d6a8", sides: 6, caps: { end: "point" } });
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 6), BRASS, { bone: hips, at: [0.2, 0.63, -0.12], dir: [1, 0.3, 0] });

  return b.root;
}
```