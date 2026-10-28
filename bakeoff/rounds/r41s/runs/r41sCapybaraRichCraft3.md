```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle, svg } from "agentic-3js-builder";

export const meta = {
  name: "Capybara with Bird",
  description: "A whimsical, chunky capybara with a tiny blue bird perched on its head and a yuzu beside it.",
};

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const FUR = countershade(mottle("#9a6a3e", "#b98550", { size: 0.12, seed: 3 }), "#d8b080", { level: -0.2 });
  const DARK = "#2a1a14", NOSE = "#3a2620", WHITE = "#fff6e0";

  const hips = b.joint("hips", { at: [0, 0.4, -0.45], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.4, -0.45], [0, 0.42, -0.1], [0, 0.44, 0.25], [0, 0.46, 0.4]]), {
    parent: hips, count: 3, role: "spine",
  });
  b.sweep(spine, (t) => [0.2 - 0.02 * t, 0.2 - 0.02 * t], { color: FUR, bone: spine });
  b.part(new THREE.SphereGeometry(0.21, 10, 8), FUR, { bone: spine.joints[0], at: [0, 0.4, -0.5], scale: [1, 0.95, 1.05] });

  // head
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.5, 0.42], dir: [0, 0.05, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.16, 10, 8), FUR, { bone: head, at: head.local({ forward: 0.1 }), scale: [1, 1, 1.1] });
  b.part(new THREE.BoxGeometry(0.22, 0.17, 0.24), FUR, { bone: head, at: head.local({ forward: 0.27, down: 0.0 }) });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.03), NOSE, { bone: head, at: head.local({ forward: 0.4, up: 0.03 }) });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.14, down: 0.07 }), dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.17, 0.05, 0.22), "#c99a68", { bone: jaw, at: jaw.local({ forward: 0.12 }) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 5), DARK, { bone: head, at: head.local({ left: s * 0.095, up: 0.07, forward: 0.2 }) });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), WHITE, { bone: head, at: head.local({ left: s * 0.105, up: 0.085, forward: 0.225 }) });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), FUR, { bone: head, at: head.local({ left: s * 0.1, up: 0.15, back: 0.02 }), scale: [0.8, 1, 0.5] });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), NOSE, { bone: head, at: head.local({ left: s * 0.05, up: 0.04, forward: 0.41 }) });
    b.part(new THREE.PlaneGeometry(0.06, 0.04), "#ffffff", {
      bone: head, at: head.local({ left: s * 0.125, down: 0.0, forward: 0.17 }), dir: [s, 0, 0.1], axis: "z",
      texture: svg(`<svg viewBox="0 0 30 20"><ellipse cx="15" cy="10" rx="14" ry="8" fill="#ff8f8f" opacity="0.7"/></svg>`, { size: 64 }),
    });
    b.part(new THREE.BoxGeometry(0.015, 0.02, 0.01), WHITE, { bone: jaw, at: jaw.local({ left: s * 0.03, forward: 0.22, up: 0.03 }) });
  }

  // legs
  for (const s of [1, -1]) {
    for (const [z, nm] of [[-0.5, "H"], [0.25, "F"]] as [number, string][]) {
      const side = s > 0 ? "L" : "R";
      const bend = nm === "H" ? 1 : -1;
      const pts = [[s * 0.13, 0.3, z], [s * 0.14, 0.17, z + bend * 0.03], [s * 0.14, 0.04, z]];
      const parent = nm === "H" ? spine.joints[0] : spine.joints[2];
      const leg = b.chain(`leg${nm}${side}`, catmull(pts), {
        parent, names: [`hip${nm}${side}`, `knee${nm}${side}`, `ankle${nm}${side}`], role: "leg",
      });
      b.sweep(leg, [0.075, 0.05], { color: FUR });
      b.part(new THREE.BoxGeometry(0.1, 0.04, 0.14), "#6b4a30", { bone: leg.tip ?? leg.joints[1], at: [s * 0.14, 0.02, z + 0.03] });
    }
  }
  b.part(new THREE.SphereGeometry(0.04, 6, 5), FUR, { bone: hips, at: [0, 0.36, -0.7] });

  // yuzu
  b.part(new THREE.SphereGeometry(0.05, 8, 6), "#f2c230", { bone: head, at: head.local({ up: 0.19, left: -0.08, forward: 0.05 }) });
  b.part(new THREE.ConeGeometry(0.012, 0.03, 5), "#4a8a30", { bone: head, at: head.local({ up: 0.245, left: -0.08, forward: 0.05 }) });

  // bird
  const bird = b.joint("birdBody", { parent: head, at: head.local({ up: 0.17, forward: 0.06 }), dir: [0, 0, 1] });
  const BLUE = "#5aa8e8";
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BLUE, { bone: bird, at: bird.local({ up: 0.04 }), scale: [1, 0.9, 1.2] });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), "#f6f0e0", { bone: bird, at: bird.local({ up: 0.025, forward: 0.03 }), scale: [0.9, 0.7, 1] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), BLUE, { bone: bird, at: bird.local({ up: 0.1, forward: 0.05 }) });
  b.part(new THREE.ConeGeometry(0.012, 0.035, 5), "#f5a020", { bone: bird, at: bird.local({ up: 0.098, forward: 0.1 }), dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK, { bone: bird, at: bird.local({ left: s * 0.028, up: 0.112, forward: 0.07 }) });
    const w = b.joint(`wing${s > 0 ? "L" : "R"}`, { parent: bird, at: bird.local({ left: s * 0.055, up: 0.05 }), dir: [s, 0, -0.3], role: "wing" });
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.05), "#3d86cc", { bone: w, at: w.local({ left: s * 0.0, up: 0 }) , scale: [1, 1, 1] });
  }
  b.part(new THREE.BoxGeometry(0.03, 0.01, 0.07), "#3d86cc", { bone: bird, at: bird.local({ up: 0.04, back: 0.09 }) });

  return b.root;
}
```