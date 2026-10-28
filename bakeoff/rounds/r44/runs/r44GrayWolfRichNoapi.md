```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Gray Wolf",
  description: "A heavy-shouldered gray wolf standing alert in a hand-painted Warcraft style: ruffed neck, amber eyes, bushy tail and fanged jaw.",
};

const FUR_D = "#3a3d44", FUR = "#7c8088", FUR_L = "#b9bcc0", CREAM = "#d8d0bc", DARK = "#1b1c21";
const AMBER = "#ffb020", NOSE = "#16120f", CLAW = "#2b2622", TOOTH = "#f1e9d0", MOUTH = "#6a2630";

const coat = paint((p, n) => {
  let c = mix(FUR, FUR_L, smoothstep(0.1, 0.9, noise(p, 0.12, 3)) * 0.6);
  c = mix(c, FUR_D, smoothstep(0.3, 0.9, n.y) * smoothstep(0.45, 0.6, noise(p, 0.2, 7)) * 0.8); // dark saddle
  c = mix(c, CREAM, smoothstep(-0.2, -0.8, n.y) * 0.9); // pale belly
  if (p.y < 0.45) c = mix(c, mix("#8a7d66", FUR_L, 0.3), smoothstep(0.45, 0.2, p.y) * 0.7); // lighter legs
  if (p.z > 1.0 && p.y < 0.98) c = mix(c, CREAM, 0.55); // pale muzzle
  c = mix(c, FUR_D, smoothstep(0.4, 0.7, noise(p, 0.05, 9)) * 0.25);
  return c;
});
const tailPaint = paint((p, n, s) => mix(mix(FUR, FUR_L, noise(p, 0.07, 2)), DARK, smoothstep(0.78, 1, s[0])));

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <polygon points="2,64 10,64 5,6" fill="url(#g)"/><polygon points="9,64 20,64 16,0" fill="url(#g)"/>
  <polygon points="19,64 30,64 27,10" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <ellipse cx="32" cy="32" rx="30" ry="20" fill="#111"/><ellipse cx="32" cy="32" rx="26" ry="17" fill="#ffb020"/>
  <ellipse cx="32" cy="32" rx="26" ry="8" fill="#ffd860" opacity="0.5"/>
  <ellipse cx="32" cy="32" rx="7" ry="15" fill="#100800"/><circle cx="26" cy="25" r="4" fill="#fff"/>
  <path d="M2 20 Q32 4 62 18" stroke="#111" stroke-width="5" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "grayWolf", paintSize: 1024 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.4], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.8, -0.4], [0, 0.85, 0.0], [0, 0.88, 0.4]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.88, 0.4], [0, 0.95, 0.62], [0, 1.02, 0.82]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.02, 0.84], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.93, 1.02], aim: [0, 0.91, 1.3], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.82, -0.62], [0, 0.78, -0.85], [0, 0.66, -1.05], [0, 0.5, -1.2]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  // body
  const body = b.loft(
    [
      { at: [0, 0.78, -0.62], w: 0.2, h: 0.24 },
      { at: [0, 0.8, -0.4], w: 0.27, h: 0.32 },
      { at: [0, 0.78, 0.0], w: 0.26, h: 0.34 },
      { at: [0, 0.82, 0.35], w: 0.3, h: 0.42 },
      { at: [0, 0.9, 0.55], w: 0.26, h: 0.34 },
      { at: [0, 1.0, 0.8], w: 0.2, h: 0.26 },
    ],
    { bone: [hips, spine, neck], color: coat, sides: 8, name: "body" },
  );
  b.sweep(tail, (t) => [0.04 + 0.05 * Math.sin(Math.PI * Math.min(t * 1.2, 1)), 0.04 + 0.04 * Math.sin(Math.PI * Math.min(t * 1.2, 1))], { color: tailPaint, sides: 8, caps: "round", name: "tail" });

  // head
  const skull = b.loft(
    [
      { at: [0, 1.0, 0.8], w: 0.2, h: 0.22 },
      { at: [0, 1.0, 0.94], w: 0.2, h: 0.2 },
      { at: [0, 0.97, 1.08], w: 0.15, h: 0.15 },
      { at: [0, 0.95, 1.2], w: 0.1, h: 0.1 },
      { at: [0, 0.94, 1.3], w: 0.085, h: 0.085 },
    ],
    { bone: head, color: coat, sides: 8, caps: { start: "round", end: "round" }, name: "skull" },
  );
  b.loft(
    [
      { at: [0, 0.895, 1.0], w: 0.11, h: 0.05 },
      { at: [0, 0.89, 1.15], w: 0.085, h: 0.045 },
      { at: [0, 0.9, 1.27], w: 0.065, h: 0.04 },
    ],
    { bone: jaw, color: mix(FUR_L, CREAM, 0.6) as any, sides: 6, caps: { start: "round", end: "round" }, name: "lowerJaw" },
  );
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.22), MOUTH, { bone: jaw, at: [0, 0.918, 1.14], name: "tongue" });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NOSE, { bone: head, at: [0, 0.955, 1.325], scale: [1.2, 0.85, 0.9], name: "nose" });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.01, 0.045, 5), TOOTH, { bone: head, at: [s * 0.032, 0.9, 1.24], dir: [0, -1, 0], name: "fang" });
    b.part(new THREE.ConeGeometry(0.009, 0.04, 5), TOOTH, { bone: jaw, at: [s * 0.028, 0.93, 1.23], name: "fangLow" });
    // eyes + brows
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", { bone: head, at: [s * 0.083, 1.035, 1.06], dir: [s * 0.9, 0.1, 0.5], axis: "z", texture: EYE, name: "eye" });
    b.capsule([s * 0.05, 1.075, 1.0], [s * 0.088, 1.06, 1.12], 0.011, { bone: head, color: FUR_D, sides: 5, name: "brow" });
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.075, 1.09, 0.88], dir: [s * 0.25, 1, -0.2], role: "hinge" });
    b.part(new THREE.ConeGeometry(0.06, 0.18, 4), coat, { bone: ear, at: [s * 0.08, 1.18, 0.875], dir: [s * 0.25, 1, -0.2], scale: [1, 1, 0.55], name: "ear" });
    b.part(new THREE.ConeGeometry(0.038, 0.13, 4), "#c8a890", { bone: ear, at: [s * 0.08, 1.17, 0.9], dir: [s * 0.25, 1, -0.2], scale: [1, 1, 0.4], name: "earInner" });
  }

  // legs
  const radii = [0.075, 0.055, 0.04, 0.034, 0.03];
  const legs: ReturnType<typeof b.sweep>[] = [];
  const mkLeg = (s: number, front: boolean) => {
    const sd = s > 0 ? "L" : "R";
    const root: [number, number, number] = front ? [s * 0.14, 0.7, 0.38] : [s * 0.15, 0.68, -0.45];
    const foot: [number, number, number] = front ? [s * 0.13, 0.04, 0.42] : [s * 0.14, 0.04, -0.52];
    const pts = limb(root, foot, front ? [0.28, 0.26, 0.14] : [0.32, 0.3, 0.14], front ? [[0, 0, -1], [0, 0, 1], [0, 0, -1]] : [[0, 0, 1], [0, 0, -1], [0, 0, 1]]);
    const names = front ? ["shoulder", "elbow", "carpus", "paw"] : ["hip", "knee", "hock", "pawH"];
    const chain = b.chain(`leg${front ? "F" : "H"}${sd}`, pts, { parent: front ? chest : hips, names: names.map((n) => n + sd), role: "leg", contact: [foot[0], 0, foot[2]] });
    legs.push(b.sweep(chain, radii, { color: coat, sides: 7, name: `leg${front ? "F" : "H"}${sd}` }));
    const tip = chain.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: tip, at: [foot[0], 0.035, foot[2] + 0.04], scale: [0.045, 0.04, 0.08], name: "paw" });
    for (const k of [-1, 0, 1]) b.spike([foot[0] + k * 0.025, 0.02, foot[2] + 0.11], [0, -0.3, 1], 0.03, 0.009, { bone: tip, color: CLAW, sides: 4, name: "claw" });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: chain.joints[0], at: [root[0], root[1] - 0.05, root[2]], scale: [0.09, 0.17, 0.15], name: front ? "shoulderMass" : "thigh" });
  };
  for (const s of [1, -1]) { mkLeg(s, true); mkLeg(s, false); }

  // fur cards
  const skin = b.surface([body, ...legs]);
  b.cards(skin.scatter(260, { rng: rng(3), minDist: 0.05, filter: (h) => h.n.y > -0.4 && h.at.y > 0.3 }), TUFT, { size: [0.04, 0.09], lean: 65, bend: 18, vary: 0.3, rng: rng(4), color: FUR_L, flow: [0, -0.3, -1] });
  // neck ruff and mane
  b.cards(b.surface(body).scatter(90, { rng: rng(5), minDist: 0.04, filter: (h) => h.at.z > 0.45 && h.at.z < 0.85 }), TUFT, { size: [0.06, 0.15], lean: 55, bend: 20, vary: 0.3, rng: rng(6), color: "#cfd0d0", flow: [0, -0.4, -1] });
  b.cards(b.surface(skull).scatter(28, { rng: rng(7), minDist: 0.035, filter: (h) => h.at.z < 1.02 && h.n.y < 0.4 }), TUFT, { size: [0.04, 0.09], lean: 70, vary: 0.3, rng: rng(8), color: CREAM, flow: [0, -0.3, -1] });
  b.cards(b.surface(skull).scatter(14, { rng: rng(9), minDist: 0.03, filter: (h) => h.n.y > 0.4 && h.at.z < 1.0 }), TUFT, { size: [0.03, 0.07], lean: 40, vary: 0.2, rng: rng(10), color: FUR_D, flow: [0, 0, -1] });

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
```