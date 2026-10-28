```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, metal, paint, noise, smoothstep, mix } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = { name: "Chopper", description: "Stylized custom chopper motorbike with long fork, teardrop tank, glowing accents." };

export default function build() {
  const b = createBuilder({ name: "chopper" });
  const BLACK = "#1c1e26", ORANGE = "#ff8a1e", TEAL = "#27d9e8", CHROME = "#cfd6e2", RUBBER = "#15151a", SEAT = "#5a2f1a";
  const frameJ = b.joint("frame", { at: [0, 0.5, 0] });
  const steer = b.joint("steer", { parent: frameJ, at: [0, 0.6, 0.75], aim: [0, 1.0, 1.3] });
  const wheelB = b.joint("wheelB", { parent: frameJ, at: [0, 0.34, -0.7], dir: [1, 0, 0], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.34, 1.55], dir: [1, 0, 0], role: "hinge" });

  const tireTex = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#15151a"/><circle cx="32" cy="32" r="20" fill="none" stroke="#2c2d38" stroke-width="3" stroke-dasharray="4 3"/></svg>`, { size: 128 });
  const tank = paint((p, n) => {
    const base = mix(ORANGE, "#ffc04a", smoothstep(0.7, 1.1, p.y) * 0.6);
    const flame = p.z > 0.1 && Math.sin(p.z * 18 + noise(p, 0.1) * 5) > 0.55 - (p.y - 0.8) * 3;
    const c = flame ? mix("#ffe36a", "#ff4a1a", 0.4) : base;
    return mix(c, "#20202a", smoothstep(0.2, -0.8, n.y) * 0.6);
  });

  for (const [j, z] of [[wheelB, -0.7], [wheelF, 1.55]] as [any, number][]) {
    const w = j === wheelB ? 0.34 : 0.34;
    const wd = j === wheelB ? 0.2 : 0.12;
    b.part(new THREE.CylinderGeometry(w, w, wd, 16), RUBBER, { bone: j, at: [0, 0.34, z], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(w * 0.7, w * 0.7, wd + 0.01, 12), metal("steel"), { bone: j, at: [0, 0.34, z], dir: [1, 0, 0] });
    glow(b.part(new THREE.CylinderGeometry(w * 0.55, w * 0.55, wd + 0.02, 16), TEAL, { bone: j, at: [0, 0.34, z], dir: [1, 0, 0] }), 1.2);
    b.part(new THREE.CylinderGeometry(0.07, 0.07, wd + 0.06, 8), CHROME, { bone: j, at: [0, 0.34, z], dir: [1, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      b.part(new THREE.BoxGeometry(0.02, 0.02, w * 1.3), CHROME, { bone: j, at: [0, 0.34, z], rotation: [Math.cos(a) * 0, 0, 0], quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a) });
    }
  }
  // frame
  const spine = catmull([[0, 0.55, -0.75], [0, 0.62, -0.2], [0, 0.78, 0.3], [0, 0.95, 0.65]]);
  b.sweep(spine, 0.04, { bone: frameJ, color: BLACK });
  b.sweep(polyline([[0, 0.34, -0.7], [0, 0.45, -0.3], [0, 0.45, 0.1], [0, 0.3, 0.45]]), 0.035, { bone: frameJ, color: BLACK });
  b.sweep(polyline([[0, 0.45, 0.1], [0, 0.3, 0.45]]), 0.05, { bone: frameJ, color: BLACK });
  for (const s of [1, -1]) {
    b.sweep(polyline([[s * 0.1, 0.34, -0.7], [s * 0.1, 0.58, -0.35], [0, 0.62, -0.2]]), 0.025, { bone: frameJ, color: BLACK });
    b.sweep(polyline([[s * 0.1, 0.34, -0.7], [s * 0.1, 0.34, 0.1], [0, 0.3, 0.45]]), 0.03, { bone: frameJ, color: BLACK });
  }
  // engine
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.4), metal("iron"), { bone: frameJ, at: [0, 0.38, 0.1] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10), metal("steel"), { bone: frameJ, at: [s * 0.22, 0.38, 0.1], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), CHROME, { bone: frameJ, at: [s * 0.2, 0.55, 0.25], dir: [s, 0.6, 0.3] });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.5), ORANGE, { bone: frameJ, at: [s * 0.1, 0.18, -0.1] });
    // exhaust
    b.sweep(polyline([[s * 0.2, 0.3, 0.3], [s * 0.26, 0.2, 0.2], [s * 0.26, 0.22, -0.5], [s * 0.26, 0.28, -1.0]]), [0.035, 0.05], { bone: frameJ, color: metal("copper") });
    glow(b.part(new THREE.CircleGeometry(0.045, 8), "#ff6a1a", { bone: frameJ, at: [s * 0.26, 0.28, -1.05], dir: [0, 0, -1], axis: "z" }), 1.5);
    // fender and rear
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.5), CHROME, { bone: frameJ, at: [s * 0.14, 0.62, -0.5] });
  }
  // tank
  b.loft([{ at: [0, 0.98, 0.58], w: 0.16, h: 0.14 }, { at: [0, 1.02, 0.35], w: 0.3, h: 0.24 }, { at: [0, 0.99, 0.08], w: 0.26, h: 0.2 }, { at: [0, 0.92, -0.08], w: 0.1, h: 0.1 }], { bone: frameJ, color: tank });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), CHROME, { bone: frameJ, at: [0, 1.15, 0.3] });
  // seat
  b.loft([{ at: [0, 0.8, -0.1], w: 0.2, h: 0.08 }, { at: [0, 0.78, -0.4], w: 0.28, h: 0.1 }, { at: [0, 0.8, -0.65], w: 0.22, h: 0.08 }], { bone: frameJ, color: SEAT });
  // rear fender
  b.extrude([[0, 0], [0.3, 0.12], [0.6, 0.08], [0.9, -0.08], [0.9, -0.05], [0.6, 0.02], [0.3, 0.06], [0, -0.04]], { at: [0, 0.78, -0.2], x: [0, 0, -1], thickness: 0.3, color: BLACK, bone: frameJ });
  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.02), "#ff2a2a", { bone: frameJ, at: [0, 0.76, -1.08] });
  glow(b.part(new THREE.BoxGeometry(0.1, 0.03, 0.02), "#ff3030", { bone: frameJ, at: [0, 0.76, -1.09] }), 2);
  // front fork, extended
  for (const s of [1, -1]) {
    b.sweep(polyline([[s * 0.1, 0.9, 0.75], [s * 0.1, 0.34, 1.55]]), 0.03, { bone: steer, color: CHROME });
    b.sweep(polyline([[s * 0.1, 0.9, 0.75], [s * 0.1, 0.7, 0.98]]), 0.042, { bone: steer, color: BLACK });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.1), CHROME, { bone: steer, at: [s * 0.1, 0.34, 1.55] });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.04, 0.06), BLACK, { bone: steer, at: [0, 0.92, 0.73] });
  // handlebars (ape hangers)
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.06, 0.95, 0.72], [s * 0.2, 1.1, 0.7], [s * 0.3, 1.3, 0.66], [s * 0.34, 1.38, 0.6]]), 0.015, { bone: steer, color: CHROME });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8), RUBBER, { bone: steer, at: [s * 0.35, 1.38, 0.58], dir: [s, 0, -0.3] });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.02), CHROME, { bone: steer, at: [s * 0.3, 1.2, 0.68] });
  }
  // headlight
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 12), CHROME, { bone: steer, at: [0, 0.95, 0.9], dir: [0, 0, 1] });
  glow(b.part(new THREE.CircleGeometry(0.085, 12), "#f4ffff", { bone: steer, at: [0, 0.95, 0.955], dir: [0, 0, 1], axis: "z" }), 1.6);
  // front fender
  b.extrude([[-0.3, 0], [0, 0.1], [0.3, 0], [0.3, -0.03], [0, 0.06], [-0.3, -0.03]], { at: [0, 0.78, 1.55], x: [0, 0, 1], thickness: 0.2, color: ORANGE, bone: steer });
  // teal underglow
  glow(b.part(new THREE.BoxGeometry(0.04, 0.02, 0.9), TEAL, { bone: frameJ, at: [0, 0.14, 0.2] }), 1.5);
  // footpegs
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), CHROME, { bone: frameJ, at: [s * 0.3, 0.3, -0.1], dir: [1, 0, 0] });
    b.part(new THREE.BoxGeometry(0.08, 0.04, 0.2), BLACK, { bone: frameJ, at: [s * 0.2, 0.32, 0.35] });
  }
  // emblem
  const em = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14161e" stroke="#27d9e8" stroke-width="4"/><path d="M32 10 L48 50 L32 40 L16 50Z" fill="#ff8a1e"/></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { bone: frameJ, at: [s * 0.152, 1.02, 0.3], dir: [s, 0, 0], axis: "z", texture: em });
  void tireTex;
  return b.root;
}
```