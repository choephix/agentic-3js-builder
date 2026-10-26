```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, countershade, scales, svg, rng, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description: "A scarred, armoured God of War style hydra with five fanged heads on serpentine necks, glowing eyes and rune-scarred hide.",
};

const BELLY = "#b79a68", BONE = "#e6dcc0", DARK = "#15110f", EMBER = "#ff7a1c", BLOOD = "#7a1410";
const HIDE = countershade(scales("#3d4a34", "#14180f", { size: 0.09, width: 0.16 }), BELLY, { level: -0.35 });
const HIDE2 = paint((p, n) => {
  const base = mix("#33402c", "#566346", noise(p, 0.18, 3));
  const m = smoothstep(0.55, 0.8, noise(p, 0.1, 9));
  const c = mix(base, "#14180f", m * 0.5);
  return n.y < -0.3 ? mix(c, BELLY, 0.7) : c;
});
const ARMOR = paint((p, n) => mix("#2b2826", "#6b6258", noise(p, 0.05, 5) * 0.6 + Math.max(n.y, 0) * 0.3));

const EYE = svg(`<svg viewBox="0 0 64 32"><path d="M2 16 Q32 -4 62 16 Q32 36 2 16Z" fill="#ffb02a" stroke="#1a0d05" stroke-width="3"/><ellipse cx="32" cy="16" rx="5" ry="12" fill="#150500"/></svg>`, { size: 128 });
const RUNE = svg(`<svg viewBox="0 0 64 64"><g stroke="#ff8a2a" stroke-width="5" fill="none" stroke-linecap="round"><path d="M32 6 V58 M32 20 L50 8 M32 34 L16 22 M32 46 L48 36"/></g></svg>`, { size: 128 });
const SCAR = svg(`<svg viewBox="0 0 64 64"><path d="M8 8 L56 56 M20 6 L58 44 M6 22 L42 58" stroke="#d9c7a0" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 1.0, -0.9], role: "spine" });
  const chestJ = b.joint("chest", { parent: hips, at: [0, 1.15, 0.2], aim: [0, 1.3, 0.8], role: "spine" });

  // Body
  const spine = b.chain("spine", catmull([[0, 1.0, -0.9], [0, 1.15, 0.2], [0, 1.3, 0.8]]), { parent: hips, names: ["spineA", "spineB"], role: "spine" });
  const tail = b.chain("tail", catmull([[0, 1.0, -0.9], [0, 0.8, -2.0], [0.3, 0.5, -3.2], [0, 0.3, -4.2], [-0.4, 0.25, -5.0]]), { parent: hips, count: 6, role: "tail" });
  b.sweep(catmull([[0, 0.3, -5.0], [0, 0.45, -3.4], [0, 1.0, -0.9], [0, 1.15, 0.2], [0, 1.3, 0.85]]),
    (t) => [0.05 + 0.65 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85 + 0.25) * 0.9 + 0.05, 0.05 + 0.6 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85 + 0.25) * 0.9],
    { bone: [tail, hips, spine], color: HIDE, sides: 10, caps: "round" });

  // Spine plates along back
  const back = b.surface(b.root).around([0, 1.1, -0.3]);
  for (let i = 0; i < 9; i++) {
    const z = -2.2 + i * 0.38;
    const h = b.surface(b.root).ray([0, 3, z], [0, -1, 0]);
    if (!h) continue;
    const s = 0.12 + 0.1 * Math.sin((i / 8) * Math.PI);
    b.stick(new THREE.ConeGeometry(s * 0.7, s * 3, 5), BONE, h, { embed: 0.25 });
  }
  void back;

  // Armour pauldron plates and rune chest
  const chestHit = b.surface(b.root).ray([0, 1.4, 3], [0, 0, -1]);
  if (chestHit) {
    glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: offset(chestHit.at, [0, 0, 1], 0.02), dir: [0, 0, 1], axis: "z", texture: RUNE }), 1.4);
  }
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.4, 7, 5), ARMOR, { bone: chestJ, at: [s * 0.65, 1.7, 0.35], scale: [1, 0.6, 1.1] });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.ConeGeometry(0.07, 0.35, 5), BONE, { bone: chestJ, at: [s * (0.65 + k * 0.1), 2.0 - k * 0.04, 0.35 - k * 0.2], dir: [s * 0.3, 1, -0.2] });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: chestJ, at: [s * 0.9, 1.45, 0.5], dir: [s, 0.1, 0.1], axis: "z", texture: SCAR });
  }

  // Legs
  for (const s of [1, -1]) {
    for (const [z, nm] of [[-1.2, "H"], [0.55, "F"]] as [number, string][]) {
      const side = s > 0 ? "L" : "R";
      const parent = nm === "H" ? hips : chestJ;
      const leg = b.chain(`leg${nm}${side}`, [[s * 0.7, 1.0, z], [s * 0.95, 0.55, z + 0.15], [s * 0.9, 0.12, z + 0.1]],
        { parent, names: [`hip${nm}${side}`, `knee${nm}${side}`, `ankle${nm}${side}`], role: "leg" });
      b.sweep(leg, [0.3, 0.14], { color: HIDE2, sides: 7 });
      b.part(new THREE.BoxGeometry(0.4, 0.14, 0.55), HIDE2, { bone: leg.tip ?? leg.joints[2], at: [s * 0.9, 0.07, z + 0.3] });
      for (let c = -1; c <= 1; c++)
        b.spike([s * 0.9 + c * 0.13, 0.09, z + 0.55], [0, -0.2, 1], 0.2, 0.05, { color: BONE, bone: leg.tip ?? leg.joints[2] });
    }
  }

  // Heads
  const dirs = [-1, -0.5, 0, 0.5, 1];
  dirs.forEach((d, i) => {
    const mid = i === 2;
    const baseP: [number, number, number] = [d * 0.35, 1.7, 0.75];
    const lean = d * 1.1;
    const hh = mid ? 3.7 : 3.1 + (1 - Math.abs(d)) * 0.4 + R() * 0.2;
    const fwd = mid ? 1.7 : 1.2 + Math.abs(d) * 0.3;
    const pts = [baseP, [d * 0.6, 2.3, 0.9], [lean * 0.9, hh * 0.6, 1.0], [lean * 1.1, hh * 0.85, fwd * 0.75], [lean * 1.2, hh, fwd]] as number[][];
    const neck = b.chain(`neck${i}`, catmull(pts), { parent: chestJ, count: 4, role: "neck" });
    b.sweep(neck, (t) => 0.3 - 0.13 * t, { color: HIDE, sides: 8 });
    b.along(neck, 4, (at) => b.spike(at, at, 0.12, 0.05, { color: BONE }));
    const tip = pts[4];
    const sc = mid ? 1.3 : 1;
    const head = b.joint(`head${i}`, { parent: neck.joints[3], at: tip, dir: [lean * 0.2, -0.15, 1], role: "head" });
    b.part(new THREE.BoxGeometry(0.42 * sc, 0.3 * sc, 0.5 * sc), HIDE2, { bone: head, at: head.local({ forward: 0.0, up: 0.02 }) });
    b.part(new THREE.BoxGeometry(0.3 * sc, 0.16 * sc, 0.45 * sc), HIDE2, { bone: head, at: head.local({ forward: 0.4 * sc, up: -0.02 }) });
    b.part(new THREE.BoxGeometry(0.28 * sc, 0.05 * sc, 0.4 * sc), BLOOD, { bone: head, at: head.local({ forward: 0.38 * sc, down: 0.06 * sc }) });
    const jaw = b.joint(`jaw${i}`, { parent: head, at: head.local({ forward: 0.1, down: 0.1 * sc }), dir: [0, 0, 1], role: "jaw" });
    b.part(new THREE.BoxGeometry(0.28 * sc, 0.09 * sc, 0.55 * sc), HIDE2, { bone: jaw, at: head.local({ forward: 0.4 * sc, down: 0.13 * sc }) });
    b.pose(jaw, { axis: [1, 0, 0], deg: 14 });
    for (const s of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        b.spike(head.local({ forward: 0.3 * sc + k * 0.1, down: 0.04 * sc, right: s * 0.12 * sc }), [0, -1, 0.1], 0.11, 0.025, { color: BONE, bone: head });
        b.spike(head.local({ forward: 0.3 * sc + k * 0.1, down: 0.1 * sc, right: s * 0.11 * sc }), [0, 1, 0], 0.09, 0.022, { color: BONE, bone: jaw });
      }
      glow(b.part(new THREE.PlaneGeometry(0.17 * sc, 0.085 * sc), "#ffffff", {
        bone: head, at: head.local({ forward: 0.18 * sc, up: 0.1 * sc, right: s * 0.214 * sc }), dir: [-s, 0, 0.35], axis: "z", texture: EYE }), 1.6);
      b.spike(head.local({ forward: -0.1, up: 0.12 * sc, right: s * 0.15 * sc }), [s * 0.8, 0.5, -1], 0.5 * sc, 0.06 * sc, { color: BONE, bone: head });
      b.spike(head.local({ forward: 0.0, up: 0.18 * sc, right: s * 0.1 * sc }), [s * 0.3, 1, -0.5], 0.28 * sc, 0.05 * sc, { color: BONE, bone: head });
      b.part(new THREE.SphereGeometry(0.03, 5, 4), DARK, { bone: head, at: head.local({ forward: 0.62 * sc, up: 0.03, right: s * 0.06 }) });
    }
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.3 * sc), BONE, { bone: head, at: head.local({ forward: 0.1, up: 0.17 * sc }) });
    if (i % 2 === 0) b.part(new THREE.TorusGeometry(0.18, 0.04, 5, 8), "#6b6258", { bone: neck.joints[3], at: [tip[0] * 0.9, tip[1] * 0.9 - 0.2, tip[2] * 0.7], dir: [0, 1, 0.3], axis: "z" });
  });

  // Tail spikes
  b.along(tail, 5, (at) => b.spike(at, at, 0.2, 0.06, { color: BONE }));
  glow(b.part(new THREE.SphereGeometry(0.08, 5, 4), EMBER, { bone: chestJ, at: [0, 1.55, 1.05] }), 1.5);

  return b.root;
}
```