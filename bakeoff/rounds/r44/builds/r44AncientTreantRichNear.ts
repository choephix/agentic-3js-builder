import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, bezier, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering mossy treant guardian: bark-plated trunk body, root legs, branch arms with finger-roots, a carved amber-eyed face with a root beard, leafy crown, glowing rune heart and shoulder mushrooms.",
};

const DARK = "#2a1c12";
const BARK_L = "#7a5636";
const MOSS = "#5f8a2e";
const LEAF1 = "#3f7a2a";
const LEAF2 = "#5fa23a";
const LEAF3 = "#a6c94a";
const AMBER = "#ffb62e";
const CAP = "#c4432b";
const CREAM = "#f3e6c4";

const BARK = paint((p, n) => {
  let c = mix("#3a2a1e", BARK_L, noise(p, 0.25, 1));
  const g = noise(new THREE.Vector3(p.x * 6, p.y * 0.5, p.z * 6), 0.2, 3);
  c = mix(c, DARK, smoothstep(0.55, 0.75, g) * 0.75);
  const moss = smoothstep(0.3, 0.8, n.y) * smoothstep(0.38, 0.62, noise(p, 0.3, 7));
  c = mix(c, MOSS, moss * 0.85);
  c = mix(c, "#2a3a18", smoothstep(0.35, 0.05, p.y) * 0.5);
  return c;
});
const BARK_D = paint((p) => mix(DARK, "#4a3524", noise(p, 0.12, 5)));

const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 30 Q30 -6 62 14 Q34 40 2 30Z" fill="#ffb62e" stroke="#2a1208" stroke-width="4"/>
  <ellipse cx="34" cy="21" rx="6" ry="10" fill="#fff6c8"/>
  <ellipse cx="34" cy="21" rx="2.5" ry="7" fill="#7a2a00"/></svg>`,
  { size: 192 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="#2a1c12" stroke="#ffb62e" stroke-width="3"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#ffe08a" stroke-width="1.5"/>
  <path d="M32 10 L32 54 M32 22 L18 12 M32 22 L46 12 M32 34 L16 24 M32 34 L48 24 M32 46 L22 40 M32 46 L42 40" stroke="#ffd25a" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <circle cx="32" cy="32" r="4" fill="#fff6c8"/></svg>`,
  { size: 192 },
);
const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 47 C2 34 2 12 16 1 C30 12 30 34 16 47Z" fill="#5fa23a" stroke="#2f5a1e" stroke-width="2"/>
  <path d="M16 44 L16 8" stroke="#a6c94a" stroke-width="2.5"/></svg>`,
  { size: 96 },
);
const MOSSCARD = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 48 Q2 20 10 4 Q14 26 16 48Z M14 48 Q16 12 22 0 Q26 24 28 48Z" fill="#6fa036"/>
  <path d="M10 48 Q12 28 16 14" stroke="#9cc84a" stroke-width="2" fill="none"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "treant" });
  const R = rng(5);

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.5, 0], [0, 1.95, 0], [0, 2.4, 0.05], [0, 2.8, 0.1]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.8, 0.1], aim: [0, 3.0, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.0, 0.15], aim: [0, 3.5, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.0, 0.2], aim: [0, 2.9, 0.55], role: "jaw" });

  // torso
  const torso = b.loft(
    [
      { at: [0, 1.25, 0], w: 1.3, h: 1.1 },
      { at: [0, 1.55, 0], w: 1.05, h: 0.95 },
      { at: [0, 1.95, 0.02], w: 0.95, h: 0.85 },
      { at: [0, 2.4, 0.06], w: 1.3, h: 1.0 },
      { at: [0, 2.8, 0.1], w: 1.55, h: 1.1 },
      { at: [0, 3.0, 0.14], w: 0.95, h: 0.8 },
    ],
    { bone: [spine, hips], color: BARK, sides: 10, name: "trunk" },
  );
  const skin = b.surface(torso);
  b.decal(torso, RUNE, { at: [0, 2.2, 0.5], dir: [0, 0, 1], size: [0.55, 0.55], bone: chest, lift: 0.01 });
  glow(b.decal(torso, RUNE, { at: [0, 2.2, 0.5], dir: [0, 0, 1], size: [0.5, 0.5], bone: chest, lift: 0.02 }), 1.2);

  // bark knots and ridges
  for (const h of skin.scatter(16, { rng: R, minDist: 0.4, filter: (h) => h.at.y > 1.5 && h.n.y > -0.3 }))
    b.stick(new THREE.ConeGeometry(0.1, 0.3, 5), BARK_D, h, { embed: 0.3, flat: true });
  b.cards(
    skin.scatter(90, { rng: R, minDist: 0.12, filter: (h) => h.n.y > 0.45 }),
    MOSSCARD,
    { size: [0.14, 0.22], lean: 40, bend: 15, vary: 0.3, rng: R, bone: chest },
  );
  // shoulder mushrooms
  for (const [x, y, z, s] of [[0.5, 3.0, -0.1, 1], [-0.62, 2.95, 0.05, 0.8], [0.9, 2.9, 0.1, 0.6], [0.3, 2.0, -0.4, 0.7]] as const) {
    b.part(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.25 * s, 6), CREAM, { at: [x, y + 0.1, z], bone: chest });
    b.part(new THREE.SphereGeometry(0.17 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { at: [x, y + 0.22 * s, z], bone: chest, scale: [1, 0.7, 1] });
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6;
      b.part(new THREE.SphereGeometry(0.03 * s, 4, 3), CREAM, { at: [x + Math.cos(a) * 0.09 * s, y + 0.3 * s, z + Math.sin(a) * 0.09 * s], bone: chest });
    }
  }
  // shoulder knots
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.4, 8, 6), BARK, { at: [s * 0.85, 2.75, 0], bone: chest, scale: [1, 0.85, 1] });
    b.cards(
      b.surface(b.part(new THREE.SphereGeometry(0.3, 6, 4), MOSS, { at: [s * 0.85, 3.05, 0], bone: chest })).scatter(16, { rng: R, minDist: 0.1 }),
      MOSSCARD, { size: [0.14, 0.24], lean: 35, rng: R, bone: chest },
    );
  }

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BARK, { at: [0, 3.3, 0.1], scale: [0.5, 0.5, 0.45], bone: head });
  b.part(new THREE.BoxGeometry(0.8, 0.16, 0.3), BARK_D, { at: [0, 3.38, 0.42], bone: head, rotation: [10, 0, 0] });
  for (const s of [1, -1]) {
    b.capsule([s * 0.38, 3.48, 0.38], [s * 0.1, 3.4, 0.46], 0.07, { color: BARK_D, bone: head, sides: 6 });
    glow(
      b.decal(skull, EYE, { at: [s * 0.2, 3.3, 0.5], dir: [s * 0.15, 0, 1], size: [0.26, 0.17], mirror: s > 0, bone: head, lift: 0.01 }),
      1.3,
    );
    b.part(new THREE.ConeGeometry(0.07, 0.35, 6), BARK, { at: [s * 0.55, 3.2, 0.2], dir: [s, 0.2, 0.2], bone: head });
  }
  b.spike([0, 3.28, 0.5], [0, -0.35, 1], 0.4, 0.1, { color: BARK, bone: head, sides: 6 });
  // jaw
  b.part(new THREE.SphereGeometry(1, 10, 7), BARK, { at: [0, 2.95, 0.25], scale: [0.4, 0.2, 0.36], bone: jaw });
  b.part(new THREE.SphereGeometry(1, 8, 5), "#1a0c08", { at: [0, 3.1, 0.3], scale: [0.3, 0.07, 0.28], bone: jaw });
  for (const s of [1, -1]) b.spike([s * 0.2, 3.05, 0.5], [0, 1, 0.2], 0.2, 0.05, { color: CREAM, bone: jaw, sides: 5 });
  // root beard
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.1;
    const len = 0.5 + (3 - Math.abs(i - 3)) * 0.15;
    b.sweep(catmull([[x, 2.85, 0.45], [x * 1.2, 2.65, 0.5], [x * 1.5, 2.85 - len, 0.5 + 0.05 * i % 3]]), [0.06, 0.008], { color: BARK_D, bone: jaw, sides: 5, caps: "point" });
  }

  // crown
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const dx = Math.cos(a), dz = Math.sin(a);
    const tip: [number, number, number] = [dx * 0.9, 4.1 + (i % 2) * 0.35, dz * 0.7];
    b.sweep(bezier([dx * 0.2, 3.65, dz * 0.15], [dx * 0.5, 3.95, dz * 0.4], tip), [0.1, 0.03], { color: BARK, bone: head, sides: 6 });
    b.part(new THREE.IcosahedronGeometry(0.42, 1), i % 2 ? LEAF1 : LEAF2, { at: tip, bone: head, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.26, 0), LEAF3, { at: [tip[0] * 1.1, tip[1] + 0.3, tip[2] * 1.1], bone: head, flat: true });
    b.cards([frame(tip, [dx, 0.6, dz]), frame(tip, [dx, 1, dz])], LEAF, { size: [0.22, 0.34], lean: 40, cross: true, bone: head, rng: R, vary: 0.3 });
  }
  b.part(new THREE.IcosahedronGeometry(0.6, 1), LEAF1, { at: [0, 4.0, 0], bone: head, flat: true });
  b.part(new THREE.IcosahedronGeometry(0.38, 1), LEAF2, { at: [0.1, 4.45, 0], bone: head, flat: true });

  // arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.85, 2.75, 0], [s * 1.35, 1.25, 0.55], [1.0, 0.95], [0, 0, -1]);
    const arm = b.chain(`arm${L}`, pts, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" });
    b.sweep(arm, [0.3, 0.24, 0.17], { color: BARK, sides: 8 });
    const wr = pts[2];
    b.part(new THREE.SphereGeometry(0.2, 7, 5), BARK, { at: [wr.x, wr.y, wr.z], bone: arm.tip! });
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * 0.09;
      const base = [wr.x + off, wr.y - 0.05, wr.z + 0.08];
      const f = b.chain(
        `finger${L}${k}`,
        catmull([base, [base[0] + s * off * 0.6, base[1] - 0.2, base[2] + 0.18], [base[0] + s * off, base[1] - 0.4, base[2] + 0.4]]),
        { parent: arm.tip!, names: [`finger${L}${k}a`, `finger${L}${k}b`], role: "digit" },
      );
      b.sweep(f, [0.07, 0.015], { color: BARK_D, sides: 5, caps: "point" });
    }
    // vine wrap
    b.sweep(catmull([[pts[0].x, pts[0].y - 0.1, pts[0].z + 0.2], [pts[1].x, pts[1].y + 0.05, pts[1].z + 0.28]]), 0.03, { color: MOSS, bone: arm.joints[0], sides: 5 });
  }

  // legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.4, 1.5, 0], [s * 0.5, 0.2, 0.1], [0.78, 0.78], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: [s * 0.5, 0, 0.1] });
    b.sweep(leg, [0.36, 0.28, 0.22], { color: BARK, sides: 8 });
    b.part(new THREE.SphereGeometry(0.26, 8, 6), BARK, { at: [s * 0.5, 0.18, 0.1], bone: leg.tip!, scale: [1, 0.7, 1.2] });
    for (let k = 0; k < 4; k++) {
      const a = (k - 1.5) * 0.4 + (s > 0 ? 0.1 : -0.1);
      const dx = Math.sin(a), dz = Math.cos(a);
      const t = b.chain(
        `toe${L}${k}`,
        catmull([[s * 0.5, 0.12, 0.2], [s * 0.5 + dx * 0.3, 0.09, 0.2 + dz * 0.3], [s * 0.5 + dx * 0.6, 0.06, 0.2 + dz * 0.6]]),
        { parent: leg.tip!, names: [`toe${L}${k}a`, `toe${L}${k}b`], role: "digit" },
      );
      b.sweep(t, [0.12, 0.04], { color: BARK, sides: 6, caps: "round" });
    }
    b.part(new THREE.SphereGeometry(0.2, 6, 4), MOSS, { at: [s * 0.45, 0.35, -0.05], bone: leg.tip!, scale: [1, 0.5, 1] });
  }

  // back roots / tail
  const tail = b.chain("tail", catmull([[0, 1.5, -0.3], [0, 1.1, -0.8], [0, 0.6, -1.2], [0, 0.15, -1.6]]), { parent: hips, count: 3, role: "tail" });
  b.sweep(tail, [0.3, 0.04], { color: BARK, sides: 7 });

  return b.root;
}
