```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg, rng } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood jaguar with eagle wings, beak and talons, covered in dot and zigzag patterns.",
};

const PINK = "#ff2f8e", TEAL = "#16c2b4", YEL = "#ffd21f", ORG = "#ff7a1a", PUR = "#6a2fb8", BLU = "#2a6ae0", GRN = "#3bb54a", RED = "#e02a2a", INK = "#1b0f2a", CREAM = "#fff1d0";

const dotsTex = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#fff"/>
<circle cx="8" cy="8" r="4" fill="#ff7a1a"/><circle cx="24" cy="8" r="2.5" fill="#6a2fb8"/><circle cx="16" cy="20" r="4" fill="#16c2b4"/><circle cx="4" cy="26" r="2.5" fill="#e02a2a"/><circle cx="28" cy="26" r="3" fill="#ffd21f"/></svg>`, { size: 128 });
const eyeTex = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffd21f" stroke="#1b0f2a" stroke-width="4"/><circle cx="32" cy="32" r="20" fill="#e02a2a"/><circle cx="32" cy="32" r="11" fill="#1b0f2a"/><circle cx="27" cy="26" r="4" fill="#fff"/></svg>`, { size: 128 });
const featherTex = svg(`<svg viewBox="0 0 32 96"><path d="M16 2 C32 24 30 70 16 94 C2 70 0 24 16 2Z" fill="#2a6ae0" stroke="#1b0f2a" stroke-width="3"/><path d="M16 8 V90" stroke="#ffd21f" stroke-width="3"/><circle cx="16" cy="30" r="5" fill="#ff2f8e"/><circle cx="16" cy="52" r="4" fill="#ffd21f"/><path d="M8 70 L16 62 L24 70" stroke="#fff1d0" stroke-width="3" fill="none"/></svg>`, { size: 128 });
const featherTex2 = svg(`<svg viewBox="0 0 32 96"><path d="M16 2 C32 24 30 70 16 94 C2 70 0 24 16 2Z" fill="#ff7a1a" stroke="#1b0f2a" stroke-width="3"/><path d="M16 8 V90" stroke="#6a2fb8" stroke-width="3"/><circle cx="16" cy="34" r="5" fill="#16c2b4"/><path d="M8 62 L16 54 L24 62" stroke="#fff1d0" stroke-width="3" fill="none"/></svg>`, { size: 128 });
const zig = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#fff"/><path d="M0 12 L8 3 L16 12 L24 3 L32 12 L40 3 L48 12 L56 3 L64 12" stroke="#1b0f2a" stroke-width="3" fill="none"/></svg>`, { size: 128 });

const body = paint((p, n) => {
  const k = noise(p, 0.12, 3);
  let c = mix(ORG, YEL, smoothstep(0.35, 0.7, k));
  const sp = noise(p, 0.07, 9);
  if (sp > 0.62) c = mix(c, PUR, 0.9);
  else if (sp < 0.2) c = mix(c, PINK, 0.85);
  return mix(c, CREAM, smoothstep(0.1, -0.7, n.y) * 0.6);
});
const legP = paint((p) => (Math.floor(p.y / 0.06) % 2 ? TEAL : PINK));

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const R = rng(5);
  const hips = b.joint("hips", { at: [0, 0.78, -0.35], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.8, -0.35], [0, 0.85, 0], [0, 0.9, 0.3]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.9, 0.3], [0, 1.05, 0.5], [0, 1.2, 0.62]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.2, 0.62], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.17, 0.7], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.8, -0.35], [0, 0.78, -0.8], [0, 0.95, -1.2], [0, 1.2, -1.4]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // torso
  b.sweep(catmull([[0, 0.8, -0.55], [0, 0.82, -0.35], [0, 0.87, 0.05], [0, 0.95, 0.35]]), (t) => [0.2 + 0.05 * Math.sin(t * 3), 0.2 + 0.04 * Math.sin(t * 3)], { bone: [hips, spine], color: body, sides: 8 });
  b.sweep(neck, [0.14, 0.1], { color: body });
  b.sweep(tail, [0.07, 0.04], { color: (t) => (Math.floor(t * 6) % 2 ? PINK : TEAL), bands: [[1, YEL]] } as any);
  b.part(new THREE.SphereGeometry(0.07, 6, 5), PUR, { bone: tail.joints[2], at: [0, 1.22, -1.44] });
  // belly stripe zigzag decal
  b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { bone: spine.joints[0], at: [0.205, 0.9, -0.05], dir: [1, 0, 0], axis: "z", texture: zig });
  b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { bone: spine.joints[0], at: [-0.205, 0.9, -0.05], dir: [-1, 0, 0], axis: "z", texture: zig });

  // head
  const HS = 1.0;
  b.part(new THREE.SphereGeometry(0.16 * HS, 8, 6), body, { bone: head, at: [0, 1.22, 0.7], scale: [1, 0.95, 1.05] });
  b.part(new THREE.BoxGeometry(0.16, 0.08, 0.14), CREAM, { bone: head, at: [0, 1.15, 0.84] });
  // eagle beak
  b.spike([0, 1.2, 0.84], [0, -0.35, 1], 0.2, 0.065, { bone: head, color: YEL });
  b.spike([0, 1.14, 0.84], [0, -0.1, 1], 0.14, 0.05, { bone: jaw, color: ORG });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), INK, { bone: head, at: [0.025, 1.22, 0.9] });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), INK, { bone: head, at: [-0.025, 1.22, 0.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.06, 14), "#ffffff", { bone: head, at: [s * 0.13, 1.28, 0.8], dir: [s * 0.5, 0.1, 1], axis: "z", texture: eyeTex });
    b.part(new THREE.ConeGeometry(0.06, 0.1, 6), PINK, { bone: head, at: [s * 0.11, 1.4, 0.64] });
    b.part(new THREE.ConeGeometry(0.035, 0.07, 6), TEAL, { bone: head, at: [s * 0.11, 1.4, 0.65] });
    b.rod([s * 0.1, 1.35, 0.8], [s * 0.18, 1.38, 0.88], 0.012, { bone: head, color: INK });
  }
  // crest of feathers
  const crest = [0, 1, 2, 3, 4].map((i) => ({ at: [0, 1.38 - i * 0.01, 0.52 + i * -0.04] as [number, number, number] }));
  crest.forEach((c, i) => b.spike(c.at, [0, 1, -0.3], 0.14 + 0.02 * i, 0.04, { bone: head, color: [RED, ORG, YEL, GRN, BLU][i] }));
  // mane tufts of cards
  const frames = b.along(neck, 6, (at) => at);
  b.cards(frames as any, featherTex2, { size: [0.1, 0.18], lean: 70, flow: [0, -0.2, -1], vary: 0.2, rng: R, spin: 40 });

  // legs: jaguar front legs & hind legs with talons
  for (const s of [1, -1]) {
    for (const [z, name, fr] of [[0.28, "F", true], [-0.5, "H", false]] as const) {
      const x = s * 0.19;
      const side = s > 0 ? "L" : "R";
      const hipPt: [number, number, number] = [x, 0.78, z];
      const knee: [number, number, number] = [x, 0.42, z + (fr ? 0.04 : -0.08)];
      const ank: [number, number, number] = [x, 0.1, z + (fr ? 0 : -0.02)];
      const leg = b.chain(`leg${name}${side}`, [hipPt, knee, ank], { parent: fr ? spine.joints[1] : hips, role: "leg", names: [`hip${name}${side}`, `knee${name}${side}`, `ankle${name}${side}`] });
      b.sweep(leg, fr ? [0.1, 0.06] : [0.12, 0.06], { color: legP });
      b.part(new THREE.SphereGeometry(0.09, 7, 5), body, { bone: leg.joints[0], at: hipPt });
      b.part(new THREE.BoxGeometry(0.15, 0.05, 0.2), PINK, { bone: leg.tip ?? leg.joints[1], at: [x, 0.03, ank[2] + 0.04] });
      for (let k = -1; k <= 1; k++) {
        b.spike([x + k * 0.05, 0.04, ank[2] + 0.13], [0, -0.2, 1], 0.1, 0.022, { bone: leg.tip ?? leg.joints[1], color: CREAM });
      }
      b.rod([x - 0.06, 0.2, ank[2]], [x + 0.06, 0.2, ank[2]], 0.045, { bone: leg.joints[1], color: YEL });
    }
  }

  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.2, 1.05, 0.15];
    const wing = b.chain(`wing${side}`, [sh, [s * 0.55, 1.35, 0.0], [s * 0.95, 1.4, -0.12]], { parent: spine.joints[1], role: "wing", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] });
    b.sweep(wing, [0.07, 0.04], { color: PUR });
    const tips: any[] = [];
    for (let i = 0; i < 6; i++) {
      const t = 0.25 + i * 0.14;
      const p = wing.at(Math.min(t, 1));
      tips.push(p);
    }
    b.cards(tips, [featherTex, featherTex2], { size: [0.18, 0.55], lean: 80, flow: [s * 0.5, -0.1, -1], bend: 15, rng: R, vary: 0.15, cross: false });
    b.cards(tips.slice(0, 4), featherTex2, { size: [0.14, 0.35], lean: 60, flow: [s * 0.3, -0.1, -1], mirror: s < 0 });
  }

  // back spines
  b.along(spine, 5, (at) => b.spike(at, at, 0.1, 0.04, { color: [TEAL, PINK, YEL, GRN, RED][at.t > 0.5 ? 1 : 0] }));
  // dots on body
  const skin = b.surface(spine.joints[0]);
  const hits = skin.scatter(18, { rng: R, minDist: 0.1, filter: (h) => h.n.y > 0.2 });
  hits.forEach((h, i) => b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), [BLU, RED, GRN, CREAM][i % 4], h, { embed: 0.4 }));

  return b.root;
}
```