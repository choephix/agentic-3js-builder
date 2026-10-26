import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg, rng, offset } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description: "Scarred, armoured five-headed hydra with glowing eyes, in a grim God of War style.",
};

const SCALE_D = "#1f2a24";
const SCALE_L = "#4c6a4a";
const BELLY = "#b9a66a";
const BONE = "#d8cfae";
const IRON = "#3b3b40";
const RUNE = "#ff7a2a";
const EYE = "#ffcf3a";
const MOUTH = "#6a1418";

const skin = paint((p, n) => {
  const t = noise(p, 0.12, 3);
  const base = mix(SCALE_D, SCALE_L, smoothstep(0.3, 0.8, t));
  const lit = mix(base, BELLY, smoothstep(0.2, -0.7, n.y));
  const scar = noise(p, 0.05, 9) > 0.8 ? mix(lit, "#8a4a3a", 0.6) : lit;
  return scar;
});

const runeTex = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 6 L32 58 M14 20 L32 34 L50 20 M18 44 L32 30 L46 44" stroke="#ff7a2a" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(5);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.9, -0.9] });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.9, -0.9], [0, 0.95, -0.2], [0, 1.0, 0.45], [0, 1.15, 0.9]]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const chest = spine.joints[2];

  // body
  const tailPath = catmull([[0, 0.5, -3.1], [0, 0.35, -2.3], [0, 0.6, -1.6], [0, 0.9, -0.9]]);
  const tail = b.chain("tail", tailPath.slice(1, 0), { parent: hips, role: "tail", count: 4 });
  b.sweep(tail, (t) => 0.32 * (1 - t) + 0.04, { color: skin, sides: 8 });
  const body = b.sweep(spine, [0.5, 0.6], { color: skin, shift: [0, 0.0], sides: 8, bone: [spine] });
  b.part(new THREE.SphereGeometry(0.55, 8, 6), skin, { bone: hips, at: [0, 0.9, -0.9] });

  // dorsal spikes
  b.along(body, 9, (at) => b.spike(at, at, 0.2, 0.06, { color: BONE }));

  // armour plates on back
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.9, 0.06, 0.28), IRON, {
      bone: spine.joints[Math.min(i, 2)],
      at: [0, 1.5 - i * 0.02, -0.7 + i * 0.5],
      rotation: [0, 0, 0],
    });
  }
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    bone: chest, at: [0, 1.57, 0.5], dir: [0, 1, 0], axis: "z", texture: runeTex,
  }), 1.4);

  // legs
  for (const s of [1, -1]) {
    for (const z of [-0.9, 0.7]) {
      const bone = z < 0 ? hips : chest;
      const tag = `${s > 0 ? "L" : "R"}${z < 0 ? "H" : "F"}`;
      const pts = [[s * 0.5, 0.85, z], [s * 0.75, 0.5, z + 0.1], [s * 0.8, 0.12, z + 0.2]];
      const leg = b.chain("leg" + tag, catmull(pts), { parent: bone, role: "leg", names: ["hip" + tag, "knee" + tag, "ankle" + tag] });
      b.sweep(leg, [0.2, 0.1], { color: skin, sides: 8 });
      b.part(new THREE.BoxGeometry(0.34, 0.1, 0.5), SCALE_D, { bone: leg.tip ?? leg.joints[1], at: [s * 0.8, 0.05, z + 0.3] });
      for (const c of [-1, 0, 1])
        b.spike([s * 0.8 + c * 0.1, 0.06, z + 0.55], [0, -0.3, 1], 0.14, 0.035, { color: BONE, bone: leg.tip ?? leg.joints[1] });
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8), IRON, { bone: leg.joints[0], at: [s * 0.55, 0.7, z] });
    }
  }

  // five heads
  const angles = [-70, -35, 0, 35, 70];
  angles.forEach((a, i) => {
    const rad = (a * Math.PI) / 180;
    const sx = Math.sin(rad);
    const reach = 1.3 + (i === 2 ? 0.5 : 0) + R() * 0.2;
    const base: [number, number, number] = [sx * 0.3, 1.2, 1.0];
    const pts = [
      base,
      [sx * 0.55, 1.7, 1.15],
      [sx * 1.1, 2.3 + R() * 0.2, 1.3],
      [sx * 1.4 + 0, 2.5 + (i === 2 ? 0.4 : 0), 1.0 + reach * 0.5],
    ];
    const name = "neck" + i;
    const neck = b.chain(name, catmull(pts), { parent: chest, role: "neck", count: 4 });
    b.sweep(neck, (t) => 0.2 - 0.06 * t, { color: skin, sides: 8 });
    b.along(neck, 4, (at) => b.spike(at, at, 0.12, 0.04, { color: BONE }));
    const end = neck.at(1).at;
    const head = b.joint("head" + i, { parent: neck.joints[neck.joints.length - 1], at: end, dir: [sx * 0.3, -0.1, 1], role: "head" });
    // skull and snout
    b.part(new THREE.BoxGeometry(0.34, 0.26, 0.36), skin, { bone: head, at: head.local({ forward: 0.0 }) });
    const jaw = b.joint("jaw" + i, { parent: head, at: head.local({ forward: 0.1, down: 0.1 }), dir: [0, 0.3, 1], role: "jaw" });
    b.part(new THREE.BoxGeometry(0.26, 0.14, 0.4), skin, { bone: head, at: head.local({ forward: 0.35, up: 0.0 }) });
    b.part(new THREE.BoxGeometry(0.24, 0.07, 0.38), MOUTH, { bone: jaw, at: head.local({ forward: 0.35, down: 0.12 }) });
    b.part(new THREE.BoxGeometry(0.22, 0.07, 0.36), skin, { bone: jaw, at: head.local({ forward: 0.35, down: 0.17 }) });
    for (const s of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        b.spike(head.local({ left: s * 0.1, forward: 0.2 + k * 0.12, down: 0.1 }), [0, 1, 0], 0.07, 0.016, { color: BONE, bone: head });
        b.spike(head.local({ left: s * 0.09, forward: 0.2 + k * 0.12, down: 0.12 }), [0, -1, 0], 0.0, 0.0, { color: BONE, bone: jaw }).mesh?.removeFromParent?.();
      }
      // eyes
      glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), EYE, { bone: head, at: head.local({ left: s * 0.15, forward: 0.15, up: 0.1 }) }), 2);
      // brow
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.12), IRON, { bone: head, at: head.local({ left: s * 0.15, forward: 0.15, up: 0.17 }) });
      // horns
      b.sweep(
        catmull([
          head.local({ left: s * 0.14, up: 0.12, back: 0.05 }),
          head.local({ left: s * 0.26, up: 0.25, back: 0.15 }),
          head.local({ left: s * 0.3, up: 0.4, back: 0.3 }),
        ]),
        [0.05, 0.0],
        { color: BONE, bone: head, sides: 6 },
      );
      // nostrils
      b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), "#0a0a0a", { bone: head, at: head.local({ left: s * 0.05, forward: 0.55, up: 0.03 }) });
    }
    // crest
    b.spike(head.local({ up: 0.13 }), [0, 1, -0.3], 0.2, 0.05, { color: BONE, bone: head });
    // tongue
    b.part(new THREE.BoxGeometry(0.04, 0.02, 0.25), "#9a2a3a", { bone: jaw, at: head.local({ forward: 0.4, down: 0.09 }) });
    b.pose(jaw, { axis: [1, 0, 0], deg: 10 + i * 4 });
    // collar ring of iron on neck
    b.part(new THREE.TorusGeometry(0.17, 0.04, 5, 8), IRON, {
      bone: neck.joints[1], at: neck.at(0.35).at, dir: neck.at(0.35).tangent,
    });
  });

  // tail spikes
  b.along(tail, 4, (at) => b.spike(at, [0, 1, 0], 0.18, 0.05, { color: BONE }));

  return b.root;
}
