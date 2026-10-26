import * as THREE from "three";
import { createBuilder, frame, rng, aim, offset, catmull, bezier, paint, svg, mix } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood jaguar with eagle head, wings and talons, covered in dotted patterns.",
};

const CREAM = "#fff1c8", ORANGE = "#ff7a1a", PINK = "#ff2f7d", TEAL = "#14b8b0", YEL = "#ffd21f", BLUE = "#2b4de0", GREEN = "#37b34a", RED = "#e0262b", INK = "#1b0f2a", PURPLE = "#7a2fc0";

const dotTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="${INK}"/><circle cx="32" cy="32" r="21" fill="${YEL}"/><circle cx="32" cy="32" r="11" fill="${PINK}"/><circle cx="32" cy="32" r="4" fill="${CREAM}"/></svg>`,
  { size: 64 },
);
const eyeTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${INK}"/><circle cx="32" cy="32" r="25" fill="${CREAM}"/><circle cx="32" cy="32" r="17" fill="${TEAL}"/><circle cx="32" cy="32" r="10" fill="${INK}"/><circle cx="26" cy="26" r="4" fill="#fff"/></svg>`,
  { size: 96 },
);
const featherTex = svg(
  `<svg viewBox="0 0 32 96"><path d="M16 2 Q31 30 28 70 Q16 94 4 70 Q1 30 16 2Z" fill="${INK}"/><path d="M16 8 Q27 32 24 68 Q16 86 8 68 Q5 32 16 8Z" fill="${PINK}"/><path d="M16 22 Q23 40 21 62 Q16 74 11 62 Q9 40 16 22Z" fill="${YEL}"/><circle cx="16" cy="46" r="5" fill="${BLUE}"/><path d="M16 8 L16 80" stroke="${INK}" stroke-width="2"/></svg>`,
  { size: 128 },
);
const zig = svg(
  `<svg viewBox="0 0 64 16"><path d="M0 14 L8 2 L16 14 L24 2 L32 14 L40 2 L48 14 L56 2 L64 14Z" fill="${TEAL}" stroke="${INK}" stroke-width="2"/></svg>`,
  { size: 128 },
);

const jag = paint((p, n) => {
  const cx = Math.floor(p.x / 0.09), cy = Math.floor(p.y / 0.09), cz = Math.floor(p.z / 0.09);
  const h = Math.abs(Math.sin(cx * 12.9 + cy * 78.2 + cz * 37.7) * 43758.5) % 1;
  const fx = (p.x / 0.09 - cx) - 0.5, fy = (p.y / 0.09 - cy) - 0.5, fz = (p.z / 0.09 - cz) - 0.5;
  const d = Math.hypot(fx, fy, fz);
  const base = n.y < -0.2 ? CREAM : ORANGE;
  if (d < 0.2 && h > 0.3) return INK;
  if (d < 0.32 && h > 0.3) return mix(base, PINK, 0.8);
  return base;
});

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.72, -0.45], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.78, -0.45], [0, 0.84, 0], [0, 0.9, 0.4]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.92, 0.4], [0, 1.1, 0.55], [0, 1.3, 0.62]]), { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.32, 0.62], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.3, 0.72], dir: [0, 0, 1], role: "jaw" });

  // body
  const body = catmull([[0, 0.74, -0.8], [0, 0.78, -0.45], [0, 0.84, 0], [0, 0.92, 0.4]]);
  b.sweep(body, [0.2, 0.27, 0.24, 0.2], { bone: [hips, spine], color: jag, sides: 10, caps: "round" });
  b.sweep(catmull([[0, 1.0, 0.38], [0, 1.12, 0.52], [0, 1.3, 0.62]]), [0.2, 0.15, 0.13], { bone: [neck], color: PINK, sides: 8 });
  // neck ruff
  b.cards(b.ring(frame([0, 1.18, 0.5], [0, 0.5, 0.3]), { count: 14, radius: 0.15 }).items, featherTex, { size: [0.1, 0.16], lean: 40, bone: neck.joints[1], flow: [0, -0.3, 1] });

  // head (eagle)
  b.part(new THREE.SphereGeometry(0.17, 10, 8), TEAL, { bone: head, at: [0, 1.34, 0.64], scale: [1, 1.05, 1.1] });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), YEL, { bone: head, at: [0, 1.46, 0.6], scale: [1.05, 0.5, 1.1], flat: true });
  b.part(new THREE.ConeGeometry(0.1, 0.3, 6), YEL, { bone: head, at: [0, 1.31, 0.9], dir: [0, -0.2, 1] });
  b.part(new THREE.ConeGeometry(0.09, 0.2, 6), ORANGE, { bone: head, at: [0, 1.4, 0.92], dir: [0, -0.9, 0.7] }).mesh;
  b.part(new THREE.ConeGeometry(0.07, 0.24, 6), RED, { bone: jaw, at: [0, 1.26, 0.82], dir: [0, 0.05, 1] });
  b.part(new THREE.ConeGeometry(0.05, 0.1, 5), INK, { bone: head, at: [0, 1.22, 1.03], dir: [0, -1, 0.5] });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.07, 14), "#ffffff", { bone: head, at: [s * 0.14, 1.4, 0.74], dir: [s * 0.6, 0.1, 0.8], axis: "z", texture: eyeTex });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.08), INK, { bone: head, at: [s * 0.13, 1.48, 0.75], rotation: [0, 0, s * -15] });
    // jaguar ears
    b.part(new THREE.SphereGeometry(0.06, 7, 5), ORANGE, { bone: head, at: [s * 0.13, 1.52, 0.55], scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), PINK, { bone: head, at: [s * 0.13, 1.52, 0.59] });
    // feather crest
  }
  b.cards([frame([0, 1.5, 0.5], [0, 1, 0]), frame([0.07, 1.5, 0.48], [0.3, 1, -0.2]), frame([-0.07, 1.5, 0.48], [-0.3, 1, -0.2])], featherTex, { size: [0.1, 0.26], flow: [0, 0, 1], bone: head });

  // legs
  const legs: Record<string, number[]> = { FL: [0.15, 0.32], FR: [-0.15, 0.32], BL: [0.16, -0.62], BR: [-0.16, -0.62] };
  for (const k of Object.keys(legs)) {
    const [x, z] = legs[k];
    const front = k[0] === "F";
    const parent = front ? spine.joints[2] : hips;
    const top = [x * 1.1, 0.7, z];
    const knee = [x * 1.2, 0.4, z + (front ? 0.02 : -0.08)];
    const foot = [x * 1.2, 0.07, z + 0.05];
    const c = b.chain("leg" + k, catmull([top, knee, foot]), { parent, names: ["hip" + k, "knee" + k, "foot" + k], role: "leg" });
    b.sweep(c, [0.1, 0.07, 0.05], { color: front ? TEAL : GREEN, bands: [[0.5, k === "FL" || k === "BR" ? BLUE : TEAL], [1, YEL]], sides: 7, bone: c });
    const toes = [-1, 0, 1];
    for (const ti of toes) {
      const tx = x * 1.2 + ti * 0.045;
      b.part(new THREE.SphereGeometry(0.035, 6, 4), YEL, { bone: c.tip ?? c.joints[1], at: [tx, 0.04, foot[2] + 0.08], scale: [1, 0.7, 1.4] });
      b.spike([tx, 0.05, foot[2] + 0.1], [0, -0.35, 1], 0.1, 0.018, { color: INK, bone: c.tip ?? c.joints[1] });
    }
    b.part(new THREE.TorusGeometry(0.075, 0.015, 4, 8), PINK, { bone: c.joints[1], at: knee, dir: [0, 1, 0], axis: "z" });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.78, -0.8], [0, 0.7, -1.1], [0, 0.85, -1.4], [0, 1.1, -1.5]]), { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, [0.09, 0.07, 0.05, 0.03], { bands: [[0.4, ORANGE], [0.6, INK], [0.8, ORANGE], [1, PINK]], bone: tail, sides: 7 });
  b.cards(b.along(tail, 4, () => {}).map((a) => frame(a.at, [0, 1, 0])), featherTex, { size: [0.08, 0.2], flow: [0, 0, -1], bone: tail.joints[3] });

  // wings
  for (const s of [1, -1]) {
    const sh = [s * 0.2, 1.0, 0.1];
    const wing = b.chain("wing" + (s > 0 ? "L" : "R"), catmull([sh, [s * 0.7, 1.15, -0.05], [s * 1.2, 1.2, -0.2], [s * 1.6, 1.15, -0.3]]), { parent: spine.joints[2], names: ["shoulder", "elbow", "wrist", "wingTip"].map((n) => n + (s > 0 ? "L" : "R")), role: "wing" });
    b.sweep(wing, [0.06, 0.05, 0.04, 0.02], { color: ORANGE, bone: wing, sides: 6 });
    const sec = wing.joints[1];
    const feathers = [];
    for (let i = 0; i < 9; i++) {
      const t = 0.15 + i * 0.09;
      const p = wing.at(t).at;
      feathers.push(frame(p, [s * 0.15, -0.3, -1]));
    }
    b.cards(feathers, featherTex, { size: [0.22, 0.6], lean: 80, flow: [s * 0.3, -0.2, -1], bone: sec, vary: 0.2, rng: R, mirror: s < 0 });
    const cov = [];
    for (let i = 0; i < 6; i++) cov.push(frame(wing.at(0.1 + i * 0.13).at, [0, 1, 0.1]));
    b.cards(cov, featherTex, { size: [0.14, 0.26], lean: 80, flow: [s * 0.2, 0, -1], bone: sec, color: undefined, mirror: s < 0 });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), BLUE, { bone: wing.joints[0], at: sh });
  }

  // dots on body
  const skin = b.surface(hips.object.parent ? b.root : b.root);
  const hits = b.surface(b.root).scatter(14, { rng: R, minDist: 0.2, filter: (h) => h.n.y > 0.4 && h.at.z < 0.4 && h.at.z > -0.8 && Math.abs(h.at.x) < 0.3 });
  for (const h of hits) b.part(new THREE.CircleGeometry(0.05, 10), "#ffffff", { at: offset(h.at, h.n, 0.004), dir: h.n, axis: "z", texture: dotTex, bone: spine.joints[1] });
  // zigzag saddle band
  b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { at: [0, 1.12, 0.05], dir: [0, 1, 0], axis: "z", texture: zig, bone: spine.joints[1] });

  // base shift to floor: foot bottoms near y=0
  return b.root;
}
