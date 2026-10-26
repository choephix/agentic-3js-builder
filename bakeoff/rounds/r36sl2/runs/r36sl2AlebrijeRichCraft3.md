```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood jaguar with eagle wings, beak and talons, covered in dotted patterns.",
};

const PINK = "#ff2d8a", TEAL = "#12c6b5", YEL = "#ffd21f", ORG = "#ff7a1a", BLUE = "#2a5bd7",
  PURP = "#7a2bbd", GRN = "#3bb54a", RED = "#e02424", WHITE = "#fff7e0", BLK = "#1a1020";

const dots = (base: string, dot: string, size: number, seed: number) =>
  paint((p, n) => {
    const v = noise(p, size, seed);
    const w = noise(p, size * 2.2, seed + 4);
    const shade = 0.85 + 0.15 * smoothstep(-0.5, 0.8, n.y);
    const c = v > 0.62 ? dot : w > 0.7 ? WHITE : base;
    const rgb = mix(c, c, 0);
    return [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade];
  });

const BODY = dots(ORG, BLK, 0.05, 3);
const LEG = dots(YEL, RED, 0.04, 5);
const WINGP = dots(TEAL, PINK, 0.06, 7);

const spotTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="${PINK}" stroke="${BLK}" stroke-width="4"/><circle cx="32" cy="32" r="16" fill="${YEL}" stroke="${BLK}" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="${BLUE}"/></svg>`,
  { size: 96 },
);
const eyeTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${WHITE}" stroke="${BLK}" stroke-width="4"/><circle cx="32" cy="32" r="18" fill="${GRN}" stroke="${BLK}" stroke-width="3"/><circle cx="32" cy="32" r="9" fill="${BLK}"/><circle cx="26" cy="26" r="4" fill="#fff"/></svg>`,
  { size: 96 },
);
const featherTex = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 2 Q31 24 26 62 L6 62 Q1 24 16 2Z" fill="${PURP}" stroke="${BLK}" stroke-width="3"/><path d="M16 8 L16 60" stroke="${YEL}" stroke-width="3"/><circle cx="16" cy="22" r="5" fill="${PINK}"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.66, -0.3], [0, 0.7, 0], [0, 0.74, 0.3]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.76, 0.3], [0, 0.95, 0.42], [0, 1.1, 0.5]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 0.5], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.07, 0.6], dir: [0, 0, 1], role: "jaw" });

  b.sweep(catmull([[0, 0.62, -0.5], [0, 0.66, -0.3], [0, 0.7, 0], [0, 0.78, 0.3]]), [0.17, 0.2, 0.22, 0.18], { bone: [hips, spine], color: BODY, sides: 8 });
  b.sweep(neck, [0.14, 0.12], { color: dots(ORG, BLK, 0.05, 3) });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), BODY, { bone: head, at: [0, 1.12, 0.52], scale: [1, 0.9, 1.1] });
  // beak
  b.part(new THREE.ConeGeometry(0.1, 0.28, 6), YEL, { bone: head, at: [0, 1.1, 0.74], dir: [0, -0.2, 1] });
  b.part(new THREE.ConeGeometry(0.07, 0.2, 6), RED, { bone: jaw, at: [0, 1.04, 0.68], dir: [0, 0.05, 1] });
  // ears
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.06, 0.12, 5), PINK, { bone: head, at: [s * 0.11, 1.28, 0.46] });
    b.part(new THREE.CircleGeometry(0.06, 10), "#ffffff", { bone: head, at: [s * 0.1, 1.17, 0.66], dir: [s * 0.5, 0.2, 1], axis: "z", texture: eyeTex });
    b.part(new THREE.CircleGeometry(0.08, 8), "#fff", { bone: hips, at: [s * 0.2, 0.74, -0.25], dir: [s, 0, 0], axis: "z", texture: spotTex });
    b.part(new THREE.CircleGeometry(0.08, 8), "#fff", { bone: hips, at: [s * 0.2, 0.74, 0.1], dir: [s, 0, 0], axis: "z", texture: spotTex });
  }
  // crest
  for (let i = 0; i < 5; i++) {
    const c = [PINK, YEL, TEAL, ORG, PURP][i];
    b.part(new THREE.ConeGeometry(0.04, 0.16, 5), c, { bone: head, at: [0, 1.3 - i * 0.02, 0.4 - i * 0.06], dir: [0, 1, -0.3 * i / 2] });
  }
  // legs
  const legs: [number, number, boolean][] = [[0.16, 0.2, true], [0.16, -0.5, false]];
  for (const [x, z, front] of legs)
    for (const s of [1, -1]) {
      const n = `${front ? "F" : "H"}${s > 0 ? "L" : "R"}`;
      const ch = b.chain("leg" + n, catmull([[s * x, 0.6, z], [s * x, 0.32, z], [s * x, 0.07, z + 0.02]]), { parent: front ? spine.joints[1] : hips, role: "leg", names: ["hip" + n, "knee" + n, "foot" + n] });
      b.sweep(ch, [0.09, 0.06], { color: LEG, sides: 6 });
      for (let t = -1; t <= 1; t++)
        b.part(new THREE.ConeGeometry(0.02, 0.1, 5), BLK, { bone: ch.tip!, at: [s * x + t * 0.04, 0.04, z + 0.12], dir: [0, -0.3, 1] });
      b.part(new THREE.BoxGeometry(0.14, 0.05, 0.2), TEAL, { bone: ch.tip!, at: [s * x, 0.025, z + 0.06] });
    }
  // tail
  const tail = b.chain("tail", catmull([[0, 0.66, -0.5], [0, 0.7, -0.8], [0, 0.95, -1.05], [0, 1.2, -1.1]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });
  b.sweep(tail, [0.07, 0.03], { color: (t: number) => (Math.floor(t * 6) % 2 ? BLK : YEL) });
  // wings
  for (const s of [1, -1]) {
    const w = b.chain("wing" + (s > 0 ? "L" : "R"), catmull([[s * 0.2, 0.9, 0], [s * 0.6, 1.1, -0.05], [s * 1.0, 1.15, -0.15]]), { parent: spine.joints[0], role: "wing", names: ["shoulder" + (s > 0 ? "L" : "R"), "elbow" + (s > 0 ? "L" : "R")] });
    b.sweep(w, [0.06, 0.04], { color: WINGP });
    for (let i = 0; i < 7; i++) {
      const f = i / 6;
      const base = new THREE.Vector3(s * (0.3 + f * 0.7), 1.12 - f * 0.02, -0.08 - f * 0.1);
      const plane = new THREE.PlaneGeometry(0.17, 0.5);
      b.part(plane, "#ffffff", { bone: w.joints[1], at: [base.x, base.y - 0.1, base.z - 0.08], dir: [s * 0.4, -1, -0.15], up: [0, 0, 1], axis: "y", texture: featherTex });
    }
    b.part(new THREE.SphereGeometry(0.08, 6, 5), PINK, { bone: w.joints[0], at: [s * 0.25, 0.92, 0] });
  }
  return b.root;
}
```