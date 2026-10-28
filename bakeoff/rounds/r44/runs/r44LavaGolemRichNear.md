```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Basalt Lava Golem",
  description: "A hulking cel-shaded lava golem of stacked basalt plates, glowing molten seams, a gold-trimmed core and ember crown.",
};

const BAS = "#3a3446";
const BAS_L = "#5a5068";
const GOLD = "#f2b84a";
const LAVA = "#ff7a1f";
const LAVA_H = "#ffd35a";
const RED = "#c9301c";

const ROCK = paint((p, n) => {
  const lit = n.y > 0.2 ? 1 : 0;
  const nz = noise(p, 0.12, 4);
  const base = mix("#2e2838", BAS_L, 0.25 + nz * 0.5);
  const c = lit ? base : mix(base, "#1c1626", 0.45);
  return n.y > 0.7 && nz > 0.62 ? mix(c, "#6f6a58", 0.5) : c;
});
const ROCK_D = paint((p) => mix("#241f2e", BAS, noise(p, 0.1, 7)));
const MOLTEN = paint((p) => mix(RED, LAVA_H, smoothstep(0.3, 0.8, noise(p, 0.08, 2))));

const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M2 30 L30 4 L62 12 L40 36 Z" fill="#ffd35a" stroke="#fff3b0" stroke-width="3"/><ellipse cx="34" cy="20" rx="6" ry="9" fill="#ff5a10"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="#ffd35a" stroke-width="3"/><path d="M24 8 L36 24 L24 40 L12 24 Z M24 16 V32" fill="none" stroke="#fff3b0" stroke-width="3" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 1024 });
  const R = rng(9);
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const hips = b.joint("hips", { at: V(0, 1.2, 0), role: "spine" });
  const spine = b.chain("spine", catmull([V(0, 1.2, 0), V(0, 1.7, 0.05), V(0, 2.2, 0.1)]), {
    parent: hips, names: ["spine1", "chest"], role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: V(0, 2.2, 0.1), aim: V(0, 2.4, 0.2), role: "neck" });
  const head = b.joint("head", { parent: neck, at: V(0, 2.4, 0.2), aim: V(0, 2.7, 0.25), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: V(0, 2.5, 0.28), aim: V(0, 2.42, 0.5), role: "jaw" });

  // pelvis and torso
  b.part(new THREE.IcosahedronGeometry(0.5, 0), ROCK_D, { bone: hips, at: V(0, 1.2, 0), scale: [1.2, 0.8, 0.9], flat: true });
  const torso = b.loft(
    [
      { at: V(0, 1.35, 0), w: 0.9, h: 0.6 },
      { at: V(0, 1.75, 0.05), w: 1.3, h: 0.8 },
      { at: V(0, 2.15, 0.08), w: 1.7, h: 0.9 },
    ],
    { bone: [spine, hips], color: ROCK, sides: 6, smooth: false },
  );
  // molten core
  glow(b.part(new THREE.OctahedronGeometry(0.2, 0), LAVA_H, { bone: chest, at: V(0, 1.85, 0.46), scale: [1, 1.3, 0.7], flat: true }), 1.6);
  b.part(new THREE.TorusGeometry(0.27, 0.035, 5, 10), GOLD, { bone: chest, at: V(0, 1.85, 0.47) });
  b.decal(torso, RUNE, { at: V(0, 1.45, 0.4), dir: V(0, 0, 1), size: [0.3, 0.3], bone: chest });
  // basalt plates on chest / back
  const sk = b.surface(torso);
  for (const h of sk.scatter(26, { rng: R, minDist: 0.28, filter: (h) => h.n.y > -0.3 })) {
    const s = 0.14 + R() * 0.1;
    b.stick(new THREE.BoxGeometry(s * 1.6, s * 0.5, s * 1.2), R() > 0.5 ? ROCK : ROCK_D, h, { embed: 0.3, flat: true });
  }
  // molten seams as glowing sweeps
  for (const x of [-0.5, -0.2, 0.2, 0.5]) {
    glow(b.sweep(catmull([V(x, 1.3, 0.38), V(x * 1.2, 1.7, 0.5), V(x * 1.5, 2.1, 0.55)]), 0.022, { bone: chest, color: MOLTEN, sides: 4 }), 1.3);
  }
  // spine crest
  for (let i = 0; i < 6; i++) {
    b.spike(V(((i % 2) - 0.5) * 0.3, 1.5 + i * 0.16, -0.45), V(0, 0.5, -1), 0.3 + (i % 3) * 0.08, 0.07, { bone: chest, color: ROCK_D, sides: 5 });
  }
  // belt of lava
  glow(b.sweep(sk.loop(V(0, 1.32, 0), { lift: 0.02 }), 0.04, { bone: hips, color: MOLTEN, sides: 4 }), 1.2);

  // head
  b.part(new THREE.IcosahedronGeometry(0.34, 0), ROCK, { bone: head, at: V(0, 2.55, 0.2), scale: [1.1, 0.9, 1], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.1, 0.2), ROCK_D, { bone: head, at: V(0, 2.65, 0.45), rotation: [15, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.4, 0.12, 0.3), ROCK_D, { bone: jaw, at: V(0, 2.4, 0.38), flat: true });
  glow(b.part(new THREE.BoxGeometry(0.3, 0.05, 0.05), LAVA, { bone: jaw, at: V(0, 2.45, 0.54) }), 1.3);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.2, 0.125), "#ffffff", { bone: head, at: V(s * 0.14, 2.58, 0.5), dir: V(s * 0.2, 0, 1), axis: "z", texture: EYE }), 1.5);
    b.sweep(catmull([V(s * 0.2, 2.75, 0.3), V(s * 0.4, 3.0, 0.15), V(s * 0.45, 3.3, -0.1)]), [0.08, 0.01], { bone: head, color: ROCK_D, sides: 5, caps: { end: "point" } });
    glow(b.part(new THREE.OctahedronGeometry(0.07, 0), LAVA_H, { bone: head, at: V(s * 0.45, 3.3, -0.1), scale: [1, 1.6, 1], flat: true }), 1.4);
  }
  glow(b.part(new THREE.OctahedronGeometry(0.1, 0), LAVA, { bone: head, at: V(0, 2.92, 0.15), scale: [1, 1.8, 1], flat: true }), 1.4);

  // arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${L}`, catmull([V(s * 0.9, 2.1, 0), V(s * 1.25, 1.45, 0.1), V(s * 1.4, 0.7, 0.3)]), {
      parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm",
    });
    b.sweep(arm, (t) => 0.2 + 0.1 * Math.sin(t * 3), { color: ROCK, sides: 6, smooth: false });
    glow(b.sweep(catmull([V(s * 1.0, 2.0, 0.2), V(s * 1.3, 1.4, 0.3), V(s * 1.42, 0.8, 0.42)]), 0.02, { bone: arm.joints[1], color: MOLTEN, sides: 4 }), 1.3);
    b.part(new THREE.IcosahedronGeometry(0.42, 0), ROCK_D, { bone: arm.joints[0], at: V(s * 0.98, 2.25, 0), scale: [1.1, 0.8, 1], flat: true });
    for (let i = 0; i < 3; i++) b.spike(V(s * (0.95 + i * 0.1), 2.5, -0.05), V(s * 0.3, 1, 0), 0.3, 0.07, { bone: arm.joints[0], color: ROCK, sides: 5 });
    const fist = arm.tip ?? arm.joints[1];
    b.part(new THREE.IcosahedronGeometry(0.34, 0), ROCK, { bone: fist, at: V(s * 1.4, 0.6, 0.3), scale: [1.1, 1, 1], flat: true });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.14, 0.2, 0.14), ROCK_D, { bone: fist, at: V(s * (1.28 + i * 0.12), 0.38, 0.5), flat: true });
      glow(b.part(new THREE.BoxGeometry(0.08, 0.03, 0.08), LAVA, { bone: fist, at: V(s * (1.28 + i * 0.12), 0.27, 0.5) }), 1.2);
    }
  }

  // legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${L}`, catmull([V(s * 0.4, 1.2, 0), V(s * 0.45, 0.65, 0.05), V(s * 0.45, 0.2, 0.05)]), {
      parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: V(s * 0.45, 0, 0.15),
    });
    b.sweep(leg, (t) => 0.3 - 0.06 * t, { color: ROCK_D, sides: 6, smooth: false });
    b.part(new THREE.IcosahedronGeometry(0.28, 0), ROCK, { bone: leg.joints[1], at: V(s * 0.45, 0.68, 0.22), flat: true });
    const foot = leg.tip ?? leg.joints[1];
    b.part(new THREE.BoxGeometry(0.55, 0.3, 0.8), ROCK, { bone: foot, at: V(s * 0.45, 0.15, 0.15), flat: true });
    glow(b.part(new THREE.BoxGeometry(0.4, 0.03, 0.06), LAVA, { bone: foot, at: V(s * 0.45, 0.2, 0.56) }), 1.2);
    glow(b.sweep(catmull([V(s * 0.5, 1.1, 0.25), V(s * 0.5, 0.65, 0.3), V(s * 0.48, 0.3, 0.3)]), 0.018, { bone: leg.joints[0], color: MOLTEN, sides: 4 }), 1.3);
  }

  // floating embers
  for (let i = 0; i < 8; i++) {
    glow(b.part(new THREE.OctahedronGeometry(0.04 + R() * 0.03, 0), i % 2 ? LAVA : LAVA_H, {
      bone: head, at: V((R() - 0.5) * 1.6, 2.8 + R() * 0.6, (R() - 0.5) * 0.8), flat: true,
    }), 1.5);
  }
  return b.root;
}
```