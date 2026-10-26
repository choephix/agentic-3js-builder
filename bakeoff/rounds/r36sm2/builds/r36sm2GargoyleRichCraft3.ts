import * as THREE from "three";
import { createBuilder, rng, polyline, catmull, bezier, limb, frame, offset, paint, mix, noise, smoothstep, patches, mottle, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A horned stone gargoyle crouched on a moss-stained cathedral ledge, wings half spread, jaw hinged, eyes glowing amber.",
};

// ---------- palette & paints ----------
const STONE_D = "#55544f";
const TOOTH = "#d6d0bc";
const CLAW = "#3f3d3a";
const TONGUE = "#4a2f33";
const MOSS = [0.36, 0.5, 0.24] as const;

const stone = paint((p, n) => {
  let c = mix("#74746f", "#a2a198", noise(p, 0.09, 1));
  c = mix(c, "#45443f", smoothstep(0.58, 0.85, noise(p, 0.05, 4)) * 0.55);
  if (n.y < -0.2) c = mix(c, "#4b5058", 0.35);
  if (n.y > 0.3) c = mix(c, "#b3ae9c", 0.25 * n.y);
  if (n.y > 0.55 && noise(p, 0.07, 9) > 0.6) c = mix(c, MOSS, 0.7 * smoothstep(0.6, 0.72, noise(p, 0.07, 9)));
  return c;
});
const horn = mottle("#4a4944", "#77756d", { size: 0.05, seed: 3 });
const wingSkin = paint((p, n) => {
  let c = mix("#6c6b66", "#8e8d85", noise(p, 0.12, 6));
  if (noise(p, 0.03, 8) > 0.7) c = mix(c, "#3f3e3a", 0.4);
  if (n.y < 0) c = mix(c, "#4c525a", 0.3);
  return c;
});
const blocks = patches("#4a4945", "#8c8b83", { size: 0.22, gap: 0.05, seed: 2 });
const ledgePaint = paint((p, n) => {
  if (n.y > 0.7 && noise(p, 0.1, 12) > 0.58) return MOSS;
  if (n.y > 0.7) return mix("#9a998f", "#7b7a72", noise(p, 0.05, 2));
  return blocks;
});

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 64 44">
  <path d="M2 24 Q32 -6 62 22 Q32 46 2 24Z" fill="#1d1612"/>
  <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#e8741c"/></radialGradient></defs>
  <path d="M8 24 Q32 3 56 22 Q32 40 8 24Z" fill="url(#g)"/>
  <ellipse cx="32" cy="23" rx="4.5" ry="12" fill="#1d1612"/>
  <path d="M2 24 Q32 -6 62 22" stroke="#1d1612" stroke-width="4" fill="none"/>
  </svg>`,
  { size: 128 },
);
const quatre = (cx: number) =>
  `<g fill="#6d6c65" stroke="#34332f" stroke-width="1.4"><circle cx="${cx}" cy="9.5" r="5.2"/><circle cx="${cx}" cy="20.5" r="5.2"/><circle cx="${cx - 5.5}" cy="15" r="5.2"/><circle cx="${cx + 5.5}" cy="15" r="5.2"/></g><circle cx="${cx}" cy="15" r="3" fill="#2f2e2b"/>`;
const TRACERY = svg(
  `<svg viewBox="0 0 210 30"><rect width="210" height="30" fill="#8d8c84"/><rect y="0" width="210" height="2" fill="#34332f"/><rect y="28" width="210" height="2" fill="#34332f"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => quatre(15 + i * 30)).join("")}</svg>`,
  { size: 512 },
);
const SIGIL = svg(
  `<svg viewBox="0 0 60 60"><path d="M6 6 H54 V32 Q54 52 30 58 Q6 52 6 32Z" fill="#a09e92" stroke="#34332f" stroke-width="3"/>
  <path d="M30 12 V50 M16 26 H44" stroke="#34332f" stroke-width="5" stroke-linecap="round"/>
  <circle cx="30" cy="26" r="6" fill="#a09e92" stroke="#34332f" stroke-width="3"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 48"><path d="M4 48 Q2 24 6 6 Q12 26 14 48Z" fill="#5f8a3a"/><path d="M12 48 Q14 20 18 2 Q24 24 22 48Z" fill="#7fae48"/><path d="M20 48 Q24 28 30 14 Q30 34 28 48Z" fill="#4d7530"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(11);
  const LT = 0.18; // ledge top

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.5, -0.3] });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.5, -0.3], [0, 0.58, -0.12], [0, 0.76, 0.08], [0, 0.88, 0.2]]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 0.88, 0.2], [0, 0.98, 0.3], [0, 1.02, 0.38]]), { parent: spine, role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck, at: [0, 1.02, 0.38], dir: [0, -0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.06 }),
    aim: head.local({ forward: 0.32, down: 0.07 }),
    role: "jaw",
  });

  // ---------- ledge ----------
  const ledge = b.part(new THREE.BoxGeometry(0.9, 0.14, 1.2), ledgePaint, { bone: hips, at: [0, 0.07, 0.05] });
  const lip = b.part(new THREE.BoxGeometry(1.0, 0.06, 1.3), ledgePaint, { bone: hips, at: [0, 0.15, 0.05] });
  for (let i = 0; i < 9; i++)
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.05), STONE_D, { bone: hips, at: [-0.4 + i * 0.1, 0.105, 0.665] });
  b.part(new THREE.PlaneGeometry(0.84, 0.12), "#ffffff", { bone: hips, at: [0, 0.07, 0.652], dir: [0, 0, 1], axis: "z", texture: TRACERY });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.84, 0.12), "#ffffff", { bone: hips, at: [s * 0.452, 0.07, 0.05], dir: [s, 0, 0], axis: "z", texture: TRACERY });
  const mossHits = b.surface(lip).scatter(34, { rng: R, minDist: 0.08, filter: (h) => h.n.y > 0.8 });
  b.cards(mossHits, TUFT, { size: [0.06, 0.07], vary: 0.3, rng: rng(5), cross: true, bone: hips });

  // ---------- body ----------
  const bw = (t: number) => Math.sin(Math.PI * Math.min(1, t * 1.25));
  const body = b.sweep(spine, (t) => [0.16 + 0.05 * bw(t), 0.16 + 0.06 * bw(t)], { color: stone });
  b.part(new THREE.SphereGeometry(1, 10, 8), stone, { bone: hips, at: [0, 0.5, -0.3], scale: [0.22, 0.19, 0.22] });
  b.along(body, 6, (at) => b.spike(at, at, 0.1, 0.035, { color: horn, sides: 5 }));
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), stone, { bone: chest, at: [s * 0.2, 0.82, 0.1], scale: [0.11, 0.11, 0.12] });
    // ribs
    for (let i = 0; i < 3; i++)
      b.rod([s * 0.1, 0.78 - i * 0.07, 0.3 - i * 0.12], [s * 0.2, 0.68 - i * 0.06, 0.18 - i * 0.12], 0.012, STONE_D, { bone: chest, sides: 5 });
  }
  b.decal(body, SIGIL, { at: b.surface(body).ray([0, 0.78, 1], [0, 0, -1])!, dir: [0, 0, 1], size: [0.12, 0.12] });

  // ---------- neck ----------
  const neckTube = b.sweep(neck, [0.115, 0.09], { color: stone });
  b.along(neckTube, 3, (at) => b.spike(at, at, 0.08, 0.03, { color: horn, sides: 5 }));

  // ---------- head ----------
  const hc = head.local({ forward: 0.05, up: 0.03 });
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), stone, { bone: head, at: hc, scale: [0.17, 0.14, 0.18] });
  b.frustumBox(head.local({ forward: 0.14, up: -0.01 }), head.local({ forward: 0.36, up: -0.04 }), [0.2, 0.13], [0.17, 0.09], { bone: head, color: stone });
  b.part(new THREE.BoxGeometry(0.17, 0.045, 0.06), stone, { bone: head, at: head.local({ forward: 0.35, up: 0.0 }) });
  // lower jaw & tongue
  b.frustumBox(jaw.at, jaw.local({ forward: 0.25 }), [0.17, 0.05], [0.12, 0.04], { bone: jaw, color: stone });
  b.frustumBox(jaw.local({ forward: 0.05, up: 0.025 }), jaw.local({ forward: 0.2, up: 0.025 }), [0.1, 0.014], [0.07, 0.012], { bone: jaw, color: TONGUE });
  b.spike(jaw.local({ forward: 0.2, down: 0.02 }), [0, -0.5, 0.6], 0.1, 0.03, { bone: jaw, color: horn, sides: 5 });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    // eyes
    const hit = skin.around(hc).at(s * 40, 15)!;
    glow(b.decal(skin, EYE, { at: hit, size: [0.085, 0.058], roll: s * 8 }), 0.9);
    // brow
    b.rod(head.local({ left: s * 0.03, up: 0.115, forward: 0.2 }), head.local({ left: s * 0.16, up: 0.085, forward: 0.08 }), 0.03, horn, { bone: head, sides: 6 });
    // horns
    b.sweep(
      bezier(head.local({ left: s * 0.09, up: 0.12, forward: 0.0 }), head.local({ left: s * 0.2, up: 0.24, forward: -0.08 }), head.local({ left: s * 0.2, up: 0.2, forward: -0.3 })),
      [0.05, 0.005],
      { bone: head, color: horn, sides: 6, caps: { start: "flat", end: "point" } },
    );
    // fangs
    b.spike(head.local({ left: s * 0.065, down: 0.075, forward: 0.32 }), [0, -1, 0], 0.075, 0.018, { bone: head, color: TOOTH, sides: 5 });
    b.spike(jaw.local({ left: s * 0.055, forward: 0.22 }), [0, 1, 0.1], 0.075, 0.016, { bone: jaw, color: TOOTH, sides: 5 });
    // cheek spines & nostrils
    b.spike(head.local({ left: s * 0.15, down: 0.03, forward: 0.0 }), [s, -0.2, -0.5], 0.1, 0.025, { bone: head, color: horn, sides: 5 });
    b.spike(head.local({ left: s * 0.13, down: 0.05, forward: 0.06 }), [s, -0.4, -0.2], 0.07, 0.02, { bone: head, color: horn, sides: 5 });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), CLAW, { bone: head, at: head.local({ left: s * 0.04, up: 0.025, forward: 0.385 }) });
  }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 0.5, -0.3], [0, 0.36, -0.5], [0.18, 0.25, -0.5], [0.36, 0.24, -0.34]]), { parent: hips, role: "tail", count: 5 });
  const tailTube = b.sweep(tail, (t) => 0.07 * (1 - t) + 0.028, { color: stone });
  b.along(tailTube, 4, (at) => b.spike(at, at, 0.06, 0.025, { color: horn, sides: 5 }));
  b.spike(tail.at(1).at, [0.3, 0, 1], 0.14, 0.04, { bone: tail, color: horn, sides: 5 });

  // ---------- legs & arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // hind leg
    const hip: [number, number, number] = [s * 0.2, 0.5, -0.3];
    const foot: [number, number, number] = [s * 0.26, LT + 0.035, 0.0];
    const lp = limb(hip, foot, [0.34, 0.3], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, lp, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.09, 0.04], { color: stone });
    b.part(new THREE.SphereGeometry(1, 8, 6), stone, { bone: leg.joints[0], at: [s * 0.24, 0.48, -0.25], scale: [0.12, 0.16, 0.17] });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), stone, { bone: leg.joints[1], at: lp[1] });
    b.part(new THREE.SphereGeometry(1, 8, 6), stone, { bone: leg, at: [foot[0], 0.22, 0.07], scale: [0.06, 0.035, 0.09] });
    for (let i = -1; i <= 1; i++)
      b.spike([foot[0] + i * 0.035, 0.215, 0.12], [i * 0.15, -0.2, 1], 0.1, 0.018, { bone: leg, color: CLAW, sides: 5 });
    b.spike(lp[1], [s * 0.3, 0.5, -1], 0.09, 0.025, { bone: leg.joints[1], color: horn, sides: 5 });

    // arm
    const sh: [number, number, number] = [s * 0.2, 0.8, 0.1];
    const hand: [number, number, number] = [s * 0.22, 0.205, 0.52];
    const ap = limb(sh, hand, [0.38, 0.38], [[s * 0.5, 0.3, -1]]);
    const arm = b.chain(`arm${S}`, ap, { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.075, 0.045], { color: stone });
    b.part(new THREE.SphereGeometry(0.055, 7, 5), stone, { bone: arm.joints[1], at: ap[1] });
    b.spike(ap[1], [s * 0.6, 0.2, -1], 0.1, 0.03, { bone: arm.joints[1], color: horn, sides: 5 });
    b.part(new THREE.SphereGeometry(1, 8, 6), stone, { bone: arm, at: [hand[0], 0.23, hand[2] + 0.03], scale: [0.065, 0.04, 0.08] });
    for (let i = -1; i <= 1; i++)
      b.spike([hand[0] + i * 0.035, 0.215, hand[2] + 0.07], [i * 0.1, -0.45, 1], 0.13, 0.02, { bone: arm, color: CLAW, sides: 5 });

    // wing
    const w0: [number, number, number] = [s * 0.15, 0.86, -0.02];
    const elbow: [number, number, number] = [s * 0.5, 1.12, -0.22];
    const wrist: [number, number, number] = [s * 0.72, 1.3, -0.3];
    const wArm = b.chain(`wing${S}`, catmull([w0, elbow, wrist]), { parent: chest, names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`], role: "wing" });
    b.sweep(wArm, [0.045, 0.028], { color: horn });
    b.spike(wrist, [s * 0.3, 0.8, 0.6], 0.14, 0.03, { bone: wArm, color: CLAW, sides: 5 });
    const tips: [number, number, number][] = [[s * 1.18, 1.38, -0.75], [s * 1.05, 1.0, -0.92], [s * 0.7, 0.72, -0.8]];
    const fingers = tips.map((tip, i) => {
      const mid: [number, number, number] = [(wrist[0] + tip[0]) / 2, (wrist[1] + tip[1]) / 2 + 0.03, (wrist[2] + tip[2]) / 2];
      const f = b.chain(`finger${i + 1}${S}`, catmull([wrist, mid, tip]), { parent: wArm, names: [`f${i + 1}a${S}`, `f${i + 1}b${S}`, `f${i + 1}c${S}`], role: "digit" });
      b.sweep(f, [0.02, 0.005], { color: horn, sides: 5 });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: wingSkin, thickness: 0.012, scallop: 0.15 });
    b.membrane(fingers[1], fingers[2], { color: wingSkin, thickness: 0.012, scallop: 0.15 });
    b.membrane(fingers[2], [elbow, [s * 0.22, 0.7, -0.25], [s * 0.15, 0.5, -0.38]], { color: wingSkin, thickness: 0.012, bone: chest });
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });
  return b.root;
}
