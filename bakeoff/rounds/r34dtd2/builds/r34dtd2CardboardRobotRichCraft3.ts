import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, mottle, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cardboard Robot Kid",
  description: "A kid in a homemade cardboard-box robot costume with foil limbs, marker-drawn panels, tape and glowing buttons.",
};

const SKIN = "#f0b98f";
const SKIN_D = "#d99070";
const HAIR = "#5a3520";
const RED = "#d8342c";
const YEL = "#f2c230";
const TAPE = "#8d9298";
const NAVY = "#2d3f6b";
const WHITE = "#f4f0e6";
const DARK = "#2b2118";

const CARD = paint((p, n) => {
  const v = noise(p, 0.06, 3);
  let c = mix("#b6854f", "#d2a56c", v);
  if (Math.abs(n.y) > 0.6) {
    const f = 0.5 + 0.5 * Math.sin(p.x * 150 + p.z * 4);
    c = mix(c, "#8c6234", 0.35 * f);
  } else {
    const f = 0.5 + 0.5 * Math.sin(p.y * 220);
    c = mix(c, "#9a6e3c", 0.12 * f);
  }
  c = mix(c, "#6e4a26", 0.45 * smoothstep(0.7, 0.9, noise(p, 0.03, 8)));
  return c;
});
const CARD2 = paint((p) => mix("#c4955c", "#ddb27a", noise(p, 0.05, 11)));
const FOIL = mottle("#aeb6bf", "#f5f8fa", { size: 0.022, contrast: 1.6, seed: 4 });

const eyeTex = svg(
  `<svg viewBox="0 0 40 56"><ellipse cx="20" cy="28" rx="17" ry="24" fill="#2a1a14"/><circle cx="26" cy="16" r="7" fill="#fff"/><circle cx="14" cy="39" r="3.2" fill="#fff"/></svg>`,
  { size: 96 },
);
const mouthTex = svg(
  `<svg viewBox="0 0 60 30"><path d="M6 5 Q30 40 54 5 Z" fill="#8a2d34" stroke="#5a1a20" stroke-width="3" stroke-linejoin="round"/><path d="M12 5 L48 5 Q40 12 30 12 Q20 12 12 5Z" fill="#fff"/></svg>`,
  { size: 128 },
);
const blushTex = svg(`<svg viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="18" ry="10" fill="#ff8f8a" fill-opacity="0.9"/></svg>`, { size: 64 });

const chestTex = svg(
  `<svg viewBox="0 0 108 100">
  <rect x="3" y="3" width="102" height="94" rx="6" fill="#f4efe2" stroke="#222" stroke-width="3"/>
  <rect x="11" y="11" width="86" height="32" rx="4" fill="#1d3b2c" stroke="#222" stroke-width="3"/>
  <polyline points="14,28 24,28 28,16 34,38 40,20 46,34 52,28 62,28 66,18 72,36 78,28 92,28" fill="none" stroke="#6bff9c" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="28" cy="68" r="14" fill="#fff" stroke="#222" stroke-width="3"/>
  <path d="M28 68 L36 57" stroke="#d8342c" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M17 78 L14 82 M28 82 L28 86 M39 78 L42 82 M16 58 L13 55 M40 58 L43 55" stroke="#222" stroke-width="2.5"/>
  <circle cx="64" cy="68" r="14" fill="#fff" stroke="#222" stroke-width="3"/>
  <path d="M64 68 L56 76" stroke="#222" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="83" y="52" width="14" height="38" rx="3" fill="#fff" stroke="#222" stroke-width="3"/>
  <rect x="85" y="68" width="10" height="7" fill="#f2c230" stroke="#222" stroke-width="2"/>
  <path d="M90 56 L90 64" stroke="#222" stroke-width="2.5"/>
  </svg>`,
  { size: 320 },
);
let stripes = "";
for (let i = -2; i < 14; i++) stripes += `<polygon points="${i * 12},0 ${i * 12 + 7},0 ${i * 12 + 17},20 ${i * 12 + 10},20" fill="#201a12"/>`;
const hazardTex = svg(`<svg viewBox="0 0 160 20"><rect width="160" height="20" fill="#f2c230"/>${stripes}</svg>`, { size: 320 });
const labelTex = svg(
  `<svg viewBox="0 0 100 26"><rect width="100" height="26" rx="3" fill="#f4efe2" stroke="#222" stroke-width="2.5"/><text x="50" y="20" text-anchor="middle" font-family="Comic Sans MS, cursive, sans-serif" font-weight="bold" font-size="19" fill="#d8342c">BOT-9</text></svg>`,
  { size: 256 },
);
const sideTex = svg(
  `<svg viewBox="0 0 80 100"><polygon points="44,6 18,52 36,52 28,94 62,40 42,40 54,6" fill="#f2c230" stroke="#222" stroke-width="4" stroke-linejoin="round"/><path d="M6 80 Q10 62 22 68" fill="none" stroke="#222" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  { size: 256 },
);
const backTex = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="22" fill="none" stroke="#222" stroke-width="9" stroke-dasharray="7 6.9"/><circle cx="50" cy="40" r="18" fill="#f4efe2" stroke="#222" stroke-width="3.5"/><circle cx="50" cy="40" r="6" fill="#222"/><text x="50" y="86" text-anchor="middle" font-family="Comic Sans MS, cursive, sans-serif" font-weight="bold" font-size="13" fill="#222">DO NOT OPEN</text><path d="M20 94 H80" stroke="#d8342c" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  { size: 320 },
);

export default function build() {
  const b = createBuilder({ name: "cardboard_robot_kid" });

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.5, 0], dir: [0, 1, 0] });
  const spine = b.chain("spine", catmull([[0, 0.5, 0], [0, 0.72, 0], [0, 0.95, 0]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2"],
  });
  const chest = spine.joints[1];
  const torsoBone = spine.joints[0];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.95, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.0, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.06, 0.02], aim: [0, 1.04, 0.1], role: "jaw" });

  const box = (w: number, h: number, d: number, color: any, bone: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, color: any, bone: any, at: number[], dir?: number[], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });
  const decalPlane = (w: number, h: number, tex: any, bone: any, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------------- kid head
  b.rod([0, 0.92, 0], [0, 1.03, 0], 0.04, SKIN, { bone: neck });
  const skull = b.part(new THREE.SphereGeometry(0.1, 14, 10), SKIN, { bone: head, at: [0, 1.1, 0.01], scale: [1, 1.08, 1.02] });
  b.part(new THREE.SphereGeometry(0.1, 10, 6), SKIN, { bone: jaw, at: [0, 1.04, 0.035], scale: [0.72, 0.38, 0.78] });
  b.part(new THREE.SphereGeometry(0.015, 6, 5), SKIN_D, { bone: head, at: [0, 1.093, 0.115] });
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, { at: [s * 0.038, 1.123, 0.105], dir: [0, 0, 1], size: [0.032, 0.046] });
    b.decal(skull, blushTex, { at: [s * 0.065, 1.08, 0.085], dir: [s * 0.3, 0, 1], size: [0.036, 0.022] });
    b.part(new THREE.SphereGeometry(0.026, 7, 5), SKIN, { bone: head, at: [s * 0.1, 1.09, 0.0], scale: [0.6, 1, 0.8] });
  }
  b.decal(skull, mouthTex, { at: [0, 1.06, 0.1], dir: [0, 0, 1], size: [0.05, 0.025] });
  // hair
  b.part(new THREE.SphereGeometry(0.11, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.58), HAIR, {
    bone: head,
    at: [0, 1.12, -0.005],
    rotation: [-22, 0, 0],
    flat: true,
  });
  const tufts: [number, number, number, number, number, number][] = [
    [0, 1.2, 0.0, 0, 1, 0.3], [0.05, 1.2, -0.02, 0.5, 1, 0], [-0.05, 1.2, -0.02, -0.5, 1, 0],
    [0.07, 1.17, 0.04, 0.8, 0.6, 0.5], [-0.07, 1.17, 0.04, -0.8, 0.6, 0.5], [0, 1.19, -0.06, 0, 0.8, -0.6],
    [0.03, 1.19, 0.06, 0.2, 0.7, 0.9],
  ];
  for (const t of tufts) b.spike([t[0], t[1], t[2]], [t[3], t[4], t[5]], 0.05, 0.016, { bone: head, color: HAIR, sides: 5 });

  // ---------------- cardboard helmet
  const HW = 0.36, HH = 0.34, HD = 0.32, HY = 1.14, T = 0.012;
  box(HW, T, HD, CARD, head, [0, HY + HH / 2, 0]);
  box(HW, HH, T, CARD, head, [0, HY, -HD / 2]);
  for (const s of [1, -1]) {
    box(T, HH, HD, CARD, head, [s * HW / 2, HY, 0]);
    box(0.07, 0.2, T, CARD2, head, [s * 0.145, HY, HD / 2]);
    cyl(0.04, 0.07, "#b08050", head, [s * 0.21, HY, 0], [s, 0, 0], 12); // paper tube ears
    cyl(0.028, 0.075, DARK, head, [s * 0.21, HY, 0], [s, 0, 0], 10);
    cyl(0.016, 0.01, s > 0 ? YEL : RED, head, [s * 0.17, HY + 0.1, 0.1], [s, 0, 0], 10); // bottle caps
  }
  box(HW, 0.07, T, CARD2, head, [0, HY + 0.135, HD / 2]);
  box(HW, 0.07, T, CARD2, head, [0, HY - 0.135, HD / 2]);
  decalPlane(0.17, 0.045, labelTex, head, [0, HY + 0.135, HD / 2 + 0.0075], [0, 0, 1]);
  // tape on helmet corners
  box(0.05, 0.1, 0.004, TAPE, head, [0.16, HY + 0.12, HD / 2 + 0.008], [0, 0, 35]);
  box(0.05, 0.1, 0.004, TAPE, head, [-0.16, HY - 0.12, HD / 2 + 0.008], [0, 0, -35]);
  // antennae
  for (const s of [1, -1]) {
    cyl(0.02, 0.03, "#b08050", head, [s * 0.08, HY + HH / 2 + 0.015, -0.05]);
    b.rod([s * 0.08, HY + HH / 2, -0.05], [s * 0.1, HY + HH / 2 + 0.12, -0.05], 0.006, FOIL, { bone: head, sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), s > 0 ? "#ff4a3a" : "#5cff7a", {
      bone: head, at: [s * 0.1, HY + HH / 2 + 0.135, -0.05],
    }), 1.4);
  }

  // ---------------- torso box
  const TW = 0.4, TH = 0.44, TD = 0.28, TY = 0.72;
  box(TW, TH, TD, CARD, torsoBone, [0, TY, 0]);
  box(0.26, 0.08, 0.18, NAVY, hips, [0, 0.46, 0]);
  // top flaps
  box(TW, 0.01, 0.12, CARD2, chest, [0, 0.945, TD / 2 + 0.05], [35, 0, 0]);
  box(TW, 0.01, 0.12, CARD2, chest, [0, 0.945, -TD / 2 - 0.05], [-35, 0, 0]);
  for (const s of [1, -1]) box(0.12, 0.01, TD, CARD2, chest, [s * (TW / 2 + 0.05), 0.945, 0], [0, 0, -35 * s]);
  // front details
  decalPlane(0.28, 0.26, chestTex, torsoBone, [0, 0.8, TD / 2 + 0.003], [0, 0, 1]);
  decalPlane(0.4, 0.05, hazardTex, torsoBone, [0, 0.565, TD / 2 + 0.003], [0, 0, 1]);
  const btn = ["#ff4a3a", "#ffd23a", "#5cff7a"];
  btn.forEach((c, i) => glow(cyl(0.02, 0.014, c, torsoBone, [(i - 1) * 0.08, 0.625, TD / 2 + 0.006], [0, 0, 1]), 1.3));
  box(0.05, 0.13, 0.004, TAPE, torsoBone, [0.18, 0.9, TD / 2 + 0.003], [0, 0, 30]);
  box(0.05, 0.13, 0.004, TAPE, torsoBone, [-0.18, 0.9, TD / 2 + 0.003], [0, 0, -30]);
  // back & sides
  decalPlane(0.3, 0.3, backTex, torsoBone, [0, TY + 0.02, -TD / 2 - 0.003], [0, 0, -1]);
  for (const s of [1, -1]) {
    decalPlane(0.16, 0.2, sideTex, torsoBone, [s * (TW / 2 + 0.003), 0.7, -0.05], [s, 0, 0]);
    decalPlane(0.4, 0.05, hazardTex, torsoBone, [s * (TW / 2 + 0.003), 0.565, 0], [s, 0, 0]);
  }
  box(0.2, 0.01, 0.01, TAPE, torsoBone, [0, 0.9, TD / 2 + 0.004]);

  // ---------------- arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([[s * 0.2, 0.85, 0], [s * 0.31, 0.65, 0], [s * 0.35, 0.47, 0.06]]),
      { parent: chest, role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    b.sweep(arm, [0.052, 0.045], { color: FOIL, sides: 8 });
    cyl(0.056, 0.03, RED, arm.joints[1], [s * 0.31, 0.65, 0], [s * 0.2, -1, 0], 8);
    cyl(0.05, 0.04, YEL, arm.tip!, [s * 0.355, 0.485, 0.062], [s * 0.1, -1, 0.2], 8);
    b.part(new THREE.SphereGeometry(0.045, 8, 6), YEL, { bone: arm.tip!, at: [s * 0.36, 0.43, 0.07], scale: [0.95, 1.15, 0.85] });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), YEL, { bone: arm.tip!, at: [s * 0.325, 0.445, 0.095] });
  }

  // ---------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([[s * 0.09, 0.5, 0], [s * 0.09, 0.28, 0.015], [s * 0.09, 0.08, 0]]),
      { parent: hips, role: "leg", names: [`hip${side}`, `knee${side}`, `ankle${side}`] },
    );
    b.sweep(leg, [0.06, 0.05], { color: FOIL, sides: 8 });
    cyl(0.064, 0.03, RED, leg.joints[1], [s * 0.09, 0.28, 0.015], undefined, 8);
    cyl(0.056, 0.035, TAPE, leg.tip!, [s * 0.09, 0.1, 0], undefined, 8);
    box(0.1, 0.07, 0.2, RED, leg.tip!, [s * 0.09, 0.055, 0.04]);
    b.part(new THREE.SphereGeometry(0.05, 8, 6), RED, { bone: leg.tip!, at: [s * 0.09, 0.05, 0.14], scale: [1, 0.8, 0.9] });
    box(0.106, 0.02, 0.21, WHITE, leg.tip!, [s * 0.09, 0.01, 0.045]);
    box(0.06, 0.004, 0.05, WHITE, leg.tip!, [s * 0.09, 0.093, 0.07]);
  }

  return b.root;
}
