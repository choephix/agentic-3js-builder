```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Folk-art log hut standing on two giant chicken legs, with carved shutters, skull fence-post lantern and a smoking chimney.",
};

const LOG = "#8a5a32", LOG2 = "#6d4426", ROOF = "#5a3a22", RED = "#b3302a", BLUE = "#2f5fa8";
const GOLD = "#e3b23c", CREAM = "#f1e2b8", SCALE = "#d9a43a", CLAW = "#3a2a1a", GREEN = "#3f7a4a", DARK = "#1c1410";

const wood = paint((p, n) => {
  const g = noise(p, 0.05, 3);
  const c = mix(LOG2, LOG, smoothstep(0.2, 0.8, g));
  return n.y > 0.7 ? mix(c, "#9bb36a", 0.35 * smoothstep(0.5, 0.8, noise(p, 0.1, 5))) : c;
});
const thatch = paint((p) => mix("#4a2f1c", "#7a5630", smoothstep(0.2, 0.8, noise(p, 0.06, 8))));
const skin = paint((p, n) => mix(SCALE, "#f2cf6a", smoothstep(0.0, 1, n.y) * 0.5 + 0.1 * noise(p, 0.03, 2)));

const flower = svg(`<svg viewBox="0 0 64 64"><g fill="${RED}" stroke="${DARK}" stroke-width="2"><circle cx="32" cy="14" r="9"/><circle cx="32" cy="50" r="9"/><circle cx="14" cy="32" r="9"/><circle cx="50" cy="32" r="9"/></g><circle cx="32" cy="32" r="9" fill="${GOLD}" stroke="${DARK}" stroke-width="2"/><path d="M32 20 L32 4 M32 44 L32 60" stroke="${GREEN}" stroke-width="3"/></svg>`, { size: 128 });
const window_ = svg(`<svg viewBox="0 0 64 80"><rect x="2" y="2" width="60" height="76" rx="10" fill="${BLUE}" stroke="${GOLD}" stroke-width="4"/><rect x="12" y="12" width="40" height="56" rx="6" fill="#ffd36a"/><path d="M32 12 V68 M12 40 H52" stroke="${DARK}" stroke-width="3"/><circle cx="32" cy="6" r="3" fill="${RED}"/></svg>`, { size: 128 });
const door = svg(`<svg viewBox="0 0 64 96"><path d="M4 96 V36 Q32 -6 60 36 V96Z" fill="${RED}" stroke="${GOLD}" stroke-width="4"/><path d="M32 90 V30" stroke="${GOLD}" stroke-width="3"/><g fill="${GOLD}"><circle cx="32" cy="30" r="6"/><circle cx="20" cy="56" r="4"/><circle cx="44" cy="56" r="4"/></g><circle cx="46" cy="64" r="3" fill="${DARK}"/></svg>`, { size: 128 });
const trim = svg(`<svg viewBox="0 0 96 24"><path d="M0 4 H96" stroke="${GOLD}" stroke-width="3"/><g fill="${RED}" stroke="${DARK}" stroke-width="1.5"><path d="M4 8 L16 8 L10 22Z"/><path d="M28 8 L40 8 L34 22Z"/><path d="M52 8 L64 8 L58 22Z"/><path d="M76 8 L88 8 L82 22Z"/></g></svg>`, { size: 128 });
const eye = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${CREAM}" stroke="${DARK}" stroke-width="2"/><circle cx="18" cy="16" r="7" fill="#e0701c"/><circle cx="19" cy="16" r="3.5" fill="${DARK}"/></svg>`, { size: 64 });
const smoke = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#d8d4d0"/></svg>`, { size: 64 });

export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut" });
  const R = rng(11);
  const hips = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, o: any) => b.part(g, c, { bone: hips, ...o });

  // chicken legs
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const hip = [s * 0.55, 1.5, 0.1];
    const pts = [hip, [s * 0.6, 1.0, 0.2], [s * 0.62, 0.6, 0.05], [s * 0.62, 0.2, 0.3]];
    const leg = b.chain(`leg${side}`, catmull(pts), { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" });
    b.sweep(leg, [0.14, 0.09], { color: skin, sides: 6 });
    P(new THREE.SphereGeometry(0.2, 7, 5), skin, { at: [s * 0.58, 1.45, 0.1], bone: leg.joints[0] });
    P(new THREE.SphereGeometry(0.13, 6, 5), SCALE, { at: [s * 0.62, 0.62, 0.05], bone: leg.joints[2] });
    for (const [i, a] of [-0.6, 0, 0.6].entries()) {
      const toe = b.chain(`toe${side}${i}`, catmull([[s * 0.62, 0.1, 0.3], [s * 0.62 + a * 0.35, 0.07, 0.65], [s * 0.62 + a * 0.6, 0.06, 0.95]]), { parent: leg.joints[2], names: [`toe${side}${i}a`, `toe${side}${i}b`, `toe${side}${i}c`], role: "digit" });
      b.sweep(toe, [0.07, 0.04], { color: SCALE, sides: 6 });
      b.spike([s * 0.62 + a * 0.6, 0.07, 0.95], [a * 0.3, -0.1, 1], 0.2, 0.05, { color: CLAW, bone: toe.joints[2] });
    }
    const back = b.chain(`toeB${side}`, catmull([[s * 0.62, 0.1, 0.1], [s * 0.62, 0.07, -0.25], [s * 0.62, 0.05, -0.5]]), { parent: leg.joints[2], names: [`toeB${side}a`, `toeB${side}b`, `toeB${side}c`], role: "digit" });
    b.sweep(back, [0.07, 0.04], { color: SCALE, sides: 6 });
    b.spike([s * 0.62, 0.05, -0.5], [0, -0.1, -1], 0.18, 0.05, { color: CLAW, bone: back.joints[2] });
  }

  // floor platform
  P(new THREE.BoxGeometry(2.1, 0.12, 2.3), wood, { at: [0, 1.56, 0.0] });
  // log walls
  for (let i = 0; i < 8; i++) {
    const y = 1.7 + i * 0.2;
    P(new THREE.CylinderGeometry(0.11, 0.11, 2.0, 8), i % 2 ? LOG : wood, { at: [0, y, 1.0], dir: [1, 0, 0] });
    P(new THREE.CylinderGeometry(0.11, 0.11, 2.0, 8), i % 2 ? wood : LOG, { at: [0, y, -1.0], dir: [1, 0, 0] });
    P(new THREE.CylinderGeometry(0.11, 0.11, 2.2, 8), i % 2 ? wood : LOG, { at: [0.95, y, 0], dir: [0, 0, 1] });
    P(new THREE.CylinderGeometry(0.11, 0.11, 2.2, 8), i % 2 ? LOG : wood, { at: [-0.95, y, 0], dir: [0, 0, 1] });
    for (const sx of [1, -1]) for (const sz of [1, -1])
      P(new THREE.SphereGeometry(0.115, 6, 4), LOG2, { at: [sx * 1.02, y, sz * 1.07] });
  }
  // gable ends
  for (const z of [1, -1]) {
    b.extrude([[-1.05, 0], [1.05, 0], [0, 0.95]], { at: [0, 3.3, z * 0.98], x: [1, 0, 0], thickness: 0.2, color: wood, bone: hips });
  }
  // roof
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [1.75, 0], [1.75, 2.5], [0, 2.5]], { at: [0, 4.3, -1.25 + (s > 0 ? 0 : 2.5)], x: [0, 0, 1], y: [s * 0.6, 0.8, 0], thickness: 0.1, color: thatch, bone: hips });
  }
  for (const s of [1, -1]) for (let k = 0; k < 6; k++)
    P(new THREE.BoxGeometry(0.1, 0.1, 2.7), k % 2 ? RED : ROOF, { at: [s * (0.2 + k * 0.28), 4.15 - k * 0.2 + 0.02, 0], rotation: [0, 0, -s * 38] });
  P(new THREE.BoxGeometry(0.16, 0.16, 2.8), RED, { at: [0, 4.3, 0] });
  P(new THREE.ConeGeometry(0.12, 0.35, 6), GOLD, { at: [0, 4.45, 1.45], rotation: [90, 0, 0] });
  P(new THREE.ConeGeometry(0.12, 0.35, 6), GOLD, { at: [0, 4.45, -1.45], rotation: [-90, 0, 0] });
  // eave trim cards
  for (const s of [1, -1]) b.part(new THREE.PlaneGeometry(2.4, 0.3), "#ffffff", { bone: hips, at: [s * 1.02, 3.35, 0.0], dir: [s, 0, 0], axis: "z", texture: trim });
  b.part(new THREE.PlaneGeometry(2.0, 0.3), "#ffffff", { bone: hips, at: [0, 3.3, 1.12], dir: [0, 0, 1], axis: "z", texture: trim });
  // chimney
  P(new THREE.BoxGeometry(0.4, 0.9, 0.4), "#7a4a3a", { at: [-0.6, 4.4, -0.4] });
  P(new THREE.BoxGeometry(0.5, 0.12, 0.5), DARK, { at: [-0.6, 4.9, -0.4] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.PlaneGeometry(0.4 + i * 0.12, 0.4 + i * 0.12), "#ffffff", { bone: hips, at: [-0.6 + i * 0.12, 5.2 + i * 0.4, -0.4 + R() * 0.05], dir: [0, 0, 1], axis: "z", texture: smoke });
  // door + steps
  b.part(new THREE.PlaneGeometry(0.8, 1.2), "#ffffff", { bone: hips, at: [0, 2.35, 1.14], dir: [0, 0, 1], axis: "z", texture: door });
  P(new THREE.BoxGeometry(1.1, 0.5, 0.05), "#3a2a1a", { at: [0, 2.3, 1.1] });
  for (let i = 0; i < 3; i++) P(new THREE.BoxGeometry(0.9 - i * 0.1, 0.1, 0.3), wood, { at: [0, 1.5 - i * 0.0 + 0.0, 1.35 + i * 0.0] , scale: [1, 1, 1] });
  // windows with shutters
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.55, 0.7), "#ffffff", { bone: hips, at: [s * 0.62, 2.85, 1.14], dir: [0, 0, 1], axis: "z", texture: window_ }), 1.2);
    glow(b.part(new THREE.PlaneGeometry(0.55, 0.7), "#ffffff", { bone: hips, at: [s * 1.07, 2.7, 0.0], dir: [s, 0, 0], axis: "z", texture: window_ }), 1.2);
    P(new THREE.BoxGeometry(0.08, 0.7, 0.04), RED, { at: [s * 0.95, 2.85, 1.15] });
  }
  // flower motifs
  for (const [x, y] of [[-0.55, 2.2], [0.55, 2.2], [0, 3.35]])
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", { bone: hips, at: [x, y, 1.15], dir: [0, 0, 1], axis: "z", texture: flower });
  // skull lantern on the porch post
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), LOG2, { at: [0.85, 1.95, 1.3] });
  P(new THREE.SphereGeometry(0.17, 7, 5), CREAM, { at: [0.85, 2.45, 1.3] });
  P(new THREE.BoxGeometry(0.15, 0.1, 0.14), CREAM, { at: [0.85, 2.3, 1.33] });
  for (const e of [-1, 1]) glow(b.part(new THREE.CircleGeometry(0.05, 8), "#ffffff", { bone: hips, at: [0.85 + e * 0.07, 2.47, 1.465], dir: [0, 0, 1], axis: "z", texture: eye }), 1.5);
  glow(P(new THREE.SphereGeometry(0.07, 6, 4), "#ff9a2a", { at: [0.85, 2.3, 1.35] }), 1.8);
  // bone fence
  for (let i = 0; i < 7; i++) {
    const x = -1.3 + i * 0.43;
    P(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6), CREAM, { at: [x, 1.8, 1.55] });
    P(new THREE.SphereGeometry(0.06, 6, 4), CREAM, { at: [x, 2.07, 1.55] });
  }
  return b.root;
}
```