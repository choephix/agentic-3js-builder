import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood jaguar with eagle wings, beak and talons, covered in dots, swirls and zigzags.",
};

const PINK = "#ff2f8a", TEAL = "#16c4b8", YEL = "#ffd21f", ORG = "#ff7a1a", PUR = "#6a2cb8", BLU = "#2a5fe0", GRN = "#38b84a", INK = "#1d0f2a", WHITE = "#fff6e0", RED = "#e02a2a";

const dotCoat = (a: string, b: string, c: string, seed: number) =>
  paint((p, n) => {
    const v = noise(p, 0.05, seed);
    const w = noise(p, 0.12, seed + 4);
    const base = mix(a, b, smoothstep(0.4, 0.6, w));
    return v > 0.62 ? mix(base, c, 0.9) : mix(base, "#000000", 0.25 * smoothstep(0.2, -0.8, n.y));
  });

const SPOT = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${INK}"/><circle cx="16" cy="16" r="10" fill="${YEL}"/><circle cx="16" cy="16" r="5" fill="${PINK}"/><circle cx="16" cy="16" r="2" fill="${TEAL}"/></svg>`, { size: 64 });
const EYE = svg(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${INK}"/><circle cx="20" cy="20" r="15" fill="${YEL}"/><circle cx="20" cy="20" r="9" fill="${RED}"/><circle cx="20" cy="20" r="5" fill="${INK}"/><circle cx="23" cy="16" r="2.4" fill="#fff"/></svg>`, { size: 128 });
const FEATHER = svg(`<svg viewBox="0 0 24 64"><path d="M12 63 C0 40 2 14 12 1 C22 14 24 40 12 63Z" fill="${TEAL}" stroke="${INK}" stroke-width="2"/><path d="M12 60 L12 8" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="20" r="4" fill="${YEL}"/><circle cx="12" cy="34" r="3" fill="${PINK}"/></svg>`, { size: 128 });
const ZIG = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${YEL}"/><path d="M0 14 L8 2 L16 14 L24 2 L32 14 L40 2 L48 14 L56 2 L64 14" fill="none" stroke="${PUR}" stroke-width="3"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.68, 0.25], dir: [0, 0.1, 1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.78, 0.55], dir: [0, 0.6, 0.8], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.0, 0.7], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.88], dir: [0, 0, 1], role: "jaw" });

  const COAT = dotCoat(ORG, YEL, PINK, 3);
  // body
  b.loft([
    { at: [0, 0.66, -0.55], w: 0.3, h: 0.34 },
    { at: [0, 0.68, -0.25], w: 0.42, h: 0.42 },
    { at: [0, 0.72, 0.2], w: 0.46, h: 0.48 },
    { at: [0, 0.8, 0.5], w: 0.38, h: 0.42 },
  ], { bone: [hips, chest], color: COAT });
  // belly stripe
  b.sweep(catmull([[0, 0.5, -0.4], [0, 0.5, 0.2], [0, 0.55, 0.45]]), 0.12, { bone: chest, color: ZIG });
  // neck
  b.sweep(catmull([[0, 0.8, 0.45], [0, 0.95, 0.62], [0, 1.05, 0.72]]), [0.19, 0.15], { bone: neck, color: dotCoat(TEAL, BLU, YEL, 8) });
  // head
  b.part(new THREE.SphereGeometry(0.19, 10, 8), dotCoat(YEL, ORG, PUR, 5), { bone: head, at: [0, 1.06, 0.8], scale: [1, 0.95, 1.1] });
  // beak
  b.spike([0, 1.04, 0.95], [0, -0.25, 1], 0.26, 0.1, { bone: head, color: YEL });
  b.spike([0, 1.0, 0.95], [0, -0.45, 1], 0.2, 0.07, { bone: jaw, color: RED });
  // eyes, brows
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.055, 12), "#ffffff", { bone: head, at: [s * 0.13, 1.12, 0.93], dir: [s * 0.5, 0.1, 1], axis: "z", texture: EYE });
    b.spike([s * 0.1, 1.2, 0.9], [s * 0.6, 0.2, 0.5], 0.14, 0.03, { bone: head, color: PUR });
    // jaguar ears
    b.part(new THREE.ConeGeometry(0.07, 0.12, 6), PINK, { bone: head, at: [s * 0.14, 1.26, 0.72], rotation: [0, 0, -s * 15] });
    b.part(new THREE.ConeGeometry(0.035, 0.07, 6), TEAL, { bone: head, at: [s * 0.14, 1.25, 0.74], rotation: [0, 0, -s * 15] });
  }
  // crest of feathers
  b.cards([0, 1, 2, 3].map((i) => ({ at: [0, 1.22 - i * 0.0, 0.7 - i * 0.07] as number[] })).map((o) => b.joint(`crest${o.at[2].toFixed(2).replace(/\W/g, "")}`, { parent: head, at: o.at, dir: [0, 1, -0.4] })), FEATHER, { size: [0.1, 0.22], color: "#ffffff", cross: true });

  // legs
  const legs: [string, number, number, boolean][] = [["FL", 0.2, 0.4, true], ["FR", -0.2, 0.4, true], ["BL", 0.2, -0.5, false], ["BR", -0.2, -0.5, false]];
  for (const [n, x, z, front] of legs) {
    const root = front ? chest : hips;
    const ch = b.chain("leg" + n, catmull([[x, 0.55, z], [x, 0.3, z + (front ? 0.02 : -0.05)], [x, 0.05, z + 0.03]]), { parent: root, names: ["hip" + n, "knee" + n, "ankle" + n], role: "leg" });
    b.sweep(ch, [0.1, 0.06], { color: dotCoat(PINK, PUR, YEL, 11 + z) });
    const foot = b.joint("foot" + n, { parent: ch.tip ?? undefined, at: [x, 0.04, z + 0.05], dir: [0, 0, 1], role: "leg" });
    b.part(new THREE.BoxGeometry(0.14, 0.07, 0.2), TEAL, { bone: foot, at: [x, 0.035, z + 0.1] });
    for (const k of [-1, 0, 1]) b.spike([x + k * 0.04, 0.05, z + 0.2], [0, -0.3, 1], 0.1, 0.022, { bone: foot, color: WHITE });
  }
  // tail
  const tail = b.chain("tail", catmull([[0, 0.7, -0.6], [0, 0.75, -0.95], [0, 0.95, -1.25], [0, 1.2, -1.35]]), { parent: hips, role: "tail", count: 4 });
  b.sweep(tail, [0.09, 0.04], { color: dotCoat(PUR, PINK, YEL, 20) });
  b.part(new THREE.IcosahedronGeometry(0.08, 0), YEL, { bone: tail.tip ?? tail.joints[3], at: [0, 1.22, -1.38] });
  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w = b.chain("wing" + side, catmull([[s * 0.25, 1.0, 0.1], [s * 0.7, 1.15, -0.05], [s * 1.2, 1.2, -0.2], [s * 1.7, 1.1, -0.35]]), { parent: chest, role: "wing", names: ["shoulder" + side, "elbow" + side, "wrist" + side] });
    b.sweep(w, [0.07, 0.03], { color: PUR });
    const fr = [0, 1, 2, 3, 4].map((i) => ({ at: [s * (0.35 + i * 0.28), 1.15, -0.05 - i * 0.05] as number[] }));
    fr.forEach((f, i) => {
      b.extrude([[0, 0], [0.11, 0.0], [0.09, -0.55 - 0.05 * i], [0, -0.7 - 0.05 * i, "sharp"], [-0.09, -0.55], [-0.11, 0]], {
        at: f.at, x: [1, 0, 0], y: [0, 0.2, -1], thickness: 0.02, smoothing: 1, bone: w.joints[Math.min(i >> 1, 1)],
        color: [TEAL, PINK, YEL, BLU, GRN][i],
      });
    });
    for (let i = 0; i < 5; i++)
      b.part(new THREE.SphereGeometry(0.03, 6, 4), i % 2 ? YEL : INK, { bone: w.joints[Math.min(i >> 1, 1)], at: [s * (0.35 + i * 0.28), 1.12, -0.35 - 0.05 * i] });
  }
  // jaguar spots
  const skin = b.surface(b.root);
  void skin;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    b.part(new THREE.CircleGeometry(0.05, 8), "#ffffff", { bone: i % 2 ? hips : chest, at: [Math.sin(a) * 0.24, 0.8 + Math.cos(a) * 0.06 + 0.1, -0.4 + i * 0.1], dir: [Math.sin(a), 0.4, 0], axis: "z", texture: SPOT });
  }
  // nose-dots on cheek, collar
  b.sweep(catmull([[0.19, 0.95, 0.55], [0, 0.88, 0.62], [-0.19, 0.95, 0.55]]), 0.03, { bone: neck, color: RED });
  return b.root;
}
