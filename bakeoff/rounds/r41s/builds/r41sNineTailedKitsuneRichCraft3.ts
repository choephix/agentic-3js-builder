import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, paint, gradient, svg } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kitsune",
  description: "Nine-tailed spirit fox with blue foxfire flames, shrine rope collar and bells, in high-fantasy anime style.",
};

const ORANGE = "#f4a24a", CREAM = "#fff2dc", RED = "#d3263a", GOLD = "#f3c44a", SOCK = "#2a1830";
const COAT = cel(furEdge(ORANGE, CREAM, { level: -0.25, teeth: 0.2, period: 0.03 }));
const TIP = cel("#ffffff", "#c9d6ff");
const FACE = cel(CREAM, "#f0cfa6");
const LEGP = paint((p) => (p.y < 0.27 ? SOCK : p.y < 0.33 ? CREAM : COAT));

const flameSvg = (a: string, b: string, c: string) =>
  svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
<path d="M20 2 C26 22 38 34 36 54 C34 72 24 78 20 78 C14 78 4 72 4 54 C3 40 12 34 14 22 C17 28 18 20 20 2Z" fill="${a}"/>
<path d="M20 22 C25 36 32 44 30 58 C29 70 23 74 20 74 C16 74 10 70 10 58 C10 48 17 42 20 22Z" fill="${b}"/>
<path d="M20 44 C24 52 26 58 25 64 C24 70 22 72 20 72 C18 72 16 70 16 64 C16 58 18 52 20 44Z" fill="${c}"/></svg>`,
    { size: 128 },
  );
const FLAME_A = flameSvg("#6a4cff", "#35c8ff", "#ffffff");
const FLAME_B = flameSvg("#35a0ff", "#8af4ff", "#ffffff");
const EYE = animeEye({ iris: "#ffb01c", irisLight: "#fff0a0", blush: false });
const BROW = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
<path d="M30 4 C36 14 36 26 30 36 C24 26 24 14 30 4Z" fill="${RED}"/>
<path d="M8 22 C16 12 22 14 24 20 M52 22 C44 12 38 14 36 20" stroke="${RED}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="30" cy="22" r="3" fill="#ffe27a"/></svg>`,
  { size: 128 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
<path d="M2 6 C16 8 26 14 38 24 M4 14 C16 16 24 20 32 28" stroke="${RED}" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`,
  { size: 96 },
);
const CHEST_MARK = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="17" fill="${RED}"/>
<circle cx="20" cy="20" r="11" fill="#fff2dc"/><path d="M20 9 C30 14 28 26 20 30 C14 26 12 16 20 9Z" fill="${RED}"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const r = rng(11);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.66, -0.3], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.66, -0.3], [0, 0.68, 0.0], [0, 0.7, 0.3]]), {
    parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.7, 0.3], [0, 0.9, 0.5], [0, 1.0, 0.62]]), {
    parent: spine.tip!, names: ["neck1", "neck2", "neck3"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.0, 0.62], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head, at: head.local({ forward: 0.07, down: 0.045 }), aim: head.local({ forward: 0.25, down: 0.06 }), role: "jaw",
  });

  // ---- body
  b.sweep(spine, (t) => [0.12 + 0.05 * Math.sin(Math.PI * Math.min(t * 1.1, 1)), 0.15 + 0.04 * Math.sin(Math.PI * t)], {
    color: COAT, sides: 10,
  });
  const neckS = b.sweep(neck, [0.115, 0.08], { color: FACE, sides: 8 });

  // ---- head
  const skullAt = head.local({ forward: 0.04 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), FACE, { bone: head, at: skullAt, scale: [0.105, 0.092, 0.11] });
  b.frustumBox(head.local({ forward: 0.08, down: 0.01 }), head.local({ forward: 0.27, down: 0.025 }), [0.11, 0.09], [0.045, 0.04], {
    bone: head, color: FACE,
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), SOCK, { bone: head, at: head.local({ forward: 0.285, down: 0.02 }), scale: [1.2, 0.9, 1] });
  b.frustumBox(jaw, jaw.local({ forward: 0.17 }), [0.085, 0.03], [0.04, 0.022], { bone: jaw, color: CREAM });
  for (const s of [1, -1]) {
    b.spike(jaw.local({ left: s * 0.03, forward: 0.15 }), [0, 1, 0], 0.03, 0.007, { bone: jaw, color: "#ffffff" });
  }
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eh = skin.around(skullAt).at(s * 36, 6)!;
    b.decal(skin, EYE, { at: eh, size: [0.058, 0.08], mirror: s > 0, bone: head });
    const ch = skin.around(skullAt).at(s * 62, -8)!;
    b.decal(skin, CHEEK, { at: ch, size: [0.07, 0.05], mirror: s < 0, bone: head });
    // ears
    const ear = [[-0.065, 0, "sharp"], [0.065, 0, "sharp"], [0.0, 0.21, "sharp"]] as any;
    const inner = [[-0.04, 0, "sharp"], [0.04, 0, "sharp"], [0.0, 0.14, "sharp"]] as any;
    const base = head.local({ left: s * 0.07, up: 0.075, forward: 0.0 });
    b.extrude(ear, { at: base, x: [s, 0, 0], y: [s * 0.3, 1, 0], thickness: 0.03, color: COAT, bone: head });
    b.extrude(inner, { at: head.local({ left: s * 0.07, up: 0.078, forward: 0.014 }), x: [s, 0, 0], y: [s * 0.3, 1, 0], thickness: 0.03, color: "#ff8fa0", bone: head });
    b.spike(head.local({ left: s * 0.093, up: 0.24 }), [s * 0.3, 1, 0], 0.07, 0.025, { color: SOCK, bone: head });
    // cheek ruff
    for (let k = 0; k < 3; k++)
      b.spike(head.local({ left: s * 0.085, forward: 0.03 - k * 0.0, down: 0.01 + k * 0.03 }), [s * 0.8, -0.35 - k * 0.15, 0.1 - k * 0.3], 0.1, 0.03, {
        color: "#ffffff", bone: head,
      });
  }
  b.decal(skin, BROW, { at: skin.around(skullAt).at(0, 52)!, size: [0.085, 0.06], bone: head });
  // brows
  for (const s of [1, -1])
    b.rod(head.local({ left: s * 0.03, up: 0.06, forward: 0.1 }), head.local({ left: s * 0.07, up: 0.075, forward: 0.075 }), 0.007, { color: RED, bone: head });

  // ---- collar: shrine rope, bells, pendant
  const loop = b.surface(neckS).loop(neck.at(0.3), { lift: 0.015 });
  b.sweep(loop, 0.02, { color: "#fdf6ea", sides: 6 });
  b.sweep(b.surface(neckS).loop(neck.at(0.3), { lift: 0.03 }), 0.012, { color: RED, sides: 6 });
  b.along(loop, 6, (at) => b.stick(new THREE.SphereGeometry(0.026, 8, 6), GOLD, at));
  const chestHit = b.surface(b.root).ray([0, 0.45, 1], [0, 0, -1]);
  if (chestHit) {
    b.stick(new THREE.SphereGeometry(0.04, 8, 6), GOLD, chestHit, { embed: 0.4 });
    b.decal(b.surface(b.root), CHEST_MARK, { at: chestHit.at, dir: [0, 0.2, 1], size: [0.08, 0.08], lift: 0.03, bone: spine.joints[2] });
  }

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fp = limb([s * 0.11, 0.6, 0.22], [s * 0.11, 0.04, 0.27], [0.3, 0.3], [[0, 0, -1]]);
    const fl = b.chain(`leg${side}F`, fp, { parent: spine.tip!, names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`], role: "leg" });
    b.sweep(fl, [0.065, 0.04], { color: LEGP, sides: 8 });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), SOCK, { bone: fl.tip!, at: [s * 0.11, 0.04, 0.3], scale: [1, 0.8, 1.5] });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), COAT, { bone: fl.joints[0], at: [s * 0.12, 0.58, 0.2] });

    const hp = limb([s * 0.12, 0.6, -0.3], [s * 0.12, 0.04, -0.42], [0.27, 0.27, 0.13], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`leg${side}H`, hp, { parent: hips, names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`], role: "leg" });
    b.sweep(hl, [0.07, 0.05, 0.04, 0.035], { color: LEGP, sides: 8 });
    b.part(new THREE.SphereGeometry(0.14, 9, 7), COAT, { bone: hl.joints[0], at: [s * 0.13, 0.6, -0.3], scale: [0.85, 1, 1.1] });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), SOCK, { bone: hl.tip!, at: [s * 0.12, 0.04, -0.4], scale: [1, 0.8, 1.5] });
  }

  // ---- nine tails with spirit flames
  const B = [0, 0.7, -0.42];
  for (let i = 0; i < 9; i++) {
    const k = i - 4;
    const a = k * 0.17;
    const h = 1 - Math.abs(k) / 4;
    const sa = Math.sin(a), ca = Math.cos(a);
    const pts = [
      B,
      [B[0] + sa * 0.22, B[1] + 0.1, B[2] - 0.3 * ca],
      [B[0] + sa * 0.6, B[1] + 0.3 + 0.1 * h, B[2] - 0.62 * ca - 0.1],
      [B[0] + sa * 1.0, B[1] + 0.62 + 0.2 * h, B[2] - 0.95 * ca - 0.2],
    ];
    const tail = b.chain(`tail${i + 1}`, catmull(pts), {
      parent: hips, names: [`tail${i + 1}a`, `tail${i + 1}b`, `tail${i + 1}c`, `tail${i + 1}d`], role: "tail",
    });
    b.sweep(tail, [0.05, 0.1, 0.09, 0.04], { bands: [[0.72, COAT], [1, TIP]], sides: 8 });
    b.part(new THREE.IcosahedronGeometry(0.035, 0), "#e8fbff", { bone: tail.tip!, at: pts[3] });
    const tip = frame(pts[3], [0, 1, 0]);
    glow(
      b.cards([tip], i % 2 ? FLAME_A : FLAME_B, { size: [0.2, 0.36], cross: true, lean: 0, flow: [0, 0, 1], bone: tail.tip!, sink: 0.05 }),
      1.4,
    );
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), "#bfeaff", { bone: tail.tip!, at: pts[3] }), 1.6);
  }

  // ---- floating foxfire wisps
  const wisps = [[0.45, 1.05, 0.4], [-0.5, 0.95, 0.2], [0.35, 1.35, -0.1], [-0.3, 1.3, 0.55], [0.6, 0.8, -0.2], [-0.62, 0.75, -0.4]];
  wisps.forEach((w, i) => {
    const sz = 0.1 + r() * 0.06;
    glow(
      b.cards([frame(w, [0, 1, 0])], i % 2 ? FLAME_A : FLAME_B, { size: [sz * 0.6, sz * 1.1], cross: true, flow: [0, 0, 1], bone: hips }),
      1.3,
    );
  });

  return b.root;
}
