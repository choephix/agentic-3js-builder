```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, countershade, svg } from "agentic-3js-builder";

export const meta = {
  name: "Capybara with Bird",
  description: "A calm, blocky capybara with a tiny blue bird perched on its head.",
};

const FUR = "#9a6b3f";
const FUR_D = "#6e4a2b";
const BELLY = "#c89a62";
const NOSE = "#3a2a22";
const CREAM = "#f3e6c8";

const EYE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#1d1410"/><circle cx="25" cy="24" r="7" fill="#fff"/><circle cx="40" cy="39" r="3" fill="#fff"/><path d="M8 18 Q32 2 56 18" stroke="#3a2415" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const coat = countershade(mottle(FUR, FUR_D, { size: 0.12, contrast: 0.6 }), BELLY, { level: -0.2 });

  const hips = b.joint("hips", { at: [0, 0.33, -0.38], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.33, -0.38], [0, 0.35, -0.05], [0, 0.37, 0.24]]), {
    parent: hips,
    role: "spine",
  });
  b.sweep(spine, (t) => [0.19 + 0.03 * Math.sin(Math.PI * t), 0.17 + 0.03 * Math.sin(Math.PI * t)], {
    color: coat,
    bone: spine,
  });

  const neck = b.chain("neck", catmull([[0, 0.37, 0.2], [0, 0.4, 0.34], [0, 0.42, 0.46]]), {
    parent: spine,
    role: "neck",
  });
  b.sweep(neck, 0.13, { color: coat });
  const head = b.joint("head", { parent: neck, at: [0, 0.42, 0.46], dir: [0, -0.08, 1], role: "head" });

  // Head
  b.frustumBox(head.at, head.local({ forward: 0.2 }), [0.2, 0.21], [0.2, 0.2], { bone: head, color: coat });
  b.frustumBox(head.local({ forward: 0.17, up: -0.02 }), head.local({ forward: 0.34, up: -0.02 }), [0.19, 0.17], [0.17, 0.15], {
    bone: head,
    color: coat,
  });
  b.part(new THREE.BoxGeometry(0.15, 0.07, 0.03), NOSE, { bone: head, at: head.local({ forward: 0.345, up: 0.0 }) });
  // jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.08 }),
    aim: head.local({ forward: 0.3, up: -0.09 }),
    role: "jaw",
  });
  b.frustumBox(jaw.local({ forward: 0 }), jaw.local({ forward: 0.22 }), [0.14, 0.04], [0.12, 0.04], {
    bone: jaw,
    color: BELLY,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.025, 0.01), CREAM, {
      bone: head,
      at: head.local({ forward: 0.335, up: -0.08, left: s * 0.02 }),
    });
    // eyes
    b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
      bone: head,
      at: head.local({ forward: 0.14, up: 0.04, left: s * 0.103 }),
      dir: [s, 0, 0],
      axis: "z",
      texture: EYE,
    });
    // ears
    b.part(new THREE.SphereGeometry(0.04, 8, 6), FUR_D, {
      bone: head,
      at: head.local({ forward: 0.01, up: 0.11, left: s * 0.075 }),
      scale: [1, 1.2, 0.6],
    });
    // nostrils
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#120c0a", {
      bone: head,
      at: head.local({ forward: 0.36, up: 0.015, left: s * 0.04 }),
    });
    // cheeks
    b.part(new THREE.SphereGeometry(0.04, 7, 5), BELLY, {
      bone: head,
      at: head.local({ forward: 0.2, up: -0.06, left: s * 0.08 }),
      scale: [0.7, 0.8, 1.1],
    });
  }

  // Legs
  const legs: [number, number, number, boolean][] = [];
  for (const s of [1, -1]) {
    legs.push([s, -0.35, 0.15, false]); // hind
    legs.push([s, 0.14, 0.11, true]); // front
  }
  for (const [s, z, x, front] of legs) {
    const side = s > 0 ? "L" : "R";
    const tag = (front ? "F" : "H") + side;
    const hip: [number, number, number] = [s * x, 0.29, z];
    const foot: [number, number, number] = [s * (x + 0.01), 0.03, z + (front ? 0.02 : -0.02)];
    const pts = limb(hip, foot, [0.16, 0.16], [[0, 0, front ? -1 : 1]]);
    const leg = b.chain(`leg${tag}`, pts, {
      parent: front ? spine : hips,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
    });
    b.sweep(leg, [0.075, 0.05], { color: coat });
    b.part(new THREE.BoxGeometry(0.1, 0.04, 0.14), FUR_D, {
      bone: leg.joints[leg.joints.length - 1],
      at: [foot[0], 0.02, foot[2] + 0.03],
    });
    for (const k of [-1, 0, 1])
      b.part(new THREE.BoxGeometry(0.025, 0.02, 0.02), NOSE, {
        bone: leg.joints[leg.joints.length - 1],
        at: [foot[0] + k * 0.032, 0.012, foot[2] + 0.105],
      });
  }

  // Tail nub
  b.part(new THREE.SphereGeometry(0.04, 6, 5), FUR_D, { bone: hips, at: [0, 0.32, -0.6] });

  // Bird on head
  const BLUE = "#59b8e6";
  const BIRD_W = "#fff3c9";
  const base = head.local({ forward: 0.05, up: 0.105 });
  const bp = (x: number, y: number, z: number) => base.clone().add(new THREE.Vector3(x, y, z));
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BLUE, { bone: head, at: bp(0, 0.05, 0), scale: [1, 0.95, 1.15] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), BIRD_W, { bone: head, at: bp(0, 0.04, 0.03), scale: [0.95, 0.9, 1] });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), BLUE, { bone: head, at: bp(0, 0.1, 0.04) });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 6), "#ffb02e", { bone: head, at: bp(0, 0.1, 0.09), dir: [0, -0.1, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#101018", { bone: head, at: bp(s * 0.027, 0.11, 0.065) });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), "#3a95cc", {
      bone: head,
      at: bp(s * 0.06, 0.055, -0.005),
      scale: [0.3, 0.8, 1.3],
    });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 4), "#ffb02e", { bone: head, at: bp(s * 0.02, 0.0, 0.01) });
  }
  b.part(new THREE.BoxGeometry(0.05, 0.01, 0.07), "#3a95cc", {
    bone: head,
    at: bp(0, 0.06, -0.09),
    rotation: [-20, 0, 0],
  });
  for (const k of [-1, 0, 1])
    b.part(new THREE.ConeGeometry(0.01, 0.04, 5), "#ff7a8a", {
      bone: head,
      at: bp(k * 0.014, 0.155, 0.03 - Math.abs(k) * 0.01),
      rotation: [-15, 0, k * -18],
    });

  return b.root;
}
```