```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description: "Low-poly adult African bush elephant with big fan ears, curved tusks, a segmented trunk and a swishing tail.",
};

const HIDE = "#8a8479";
const TOES = "#e3d9c0";
const TUSK = "#f1e8cf";

export default function build() {
  const b = createBuilder({ name: "elephant", paintSize: 1024 });
  const skin = paint((p, n) => {
    let c = mix("#6f6a62", "#9a9387", smoothstep(-0.6, 0.8, n.y));
    c = mix(c, "#5a5249", smoothstep(0.55, 0.8, noise(p, 0.3, 3)) * 0.35);
    return mix(c, "#8b6b50", smoothstep(0.5, 0.0, p.y) * 0.35);
  });

  const hips = b.joint("hips", { at: [0, 2.0, -0.7], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 2.0, -0.7], [0, 2.1, 0], [0, 2.15, 0.8]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.1, 1.2], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.05, 1.5], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.5, 1.9], aim: [0, 1.4, 2.3], role: "jaw" });

  // body
  b.loft(
    [
      { at: [0, 2.0, -1.5], w: 1.3, h: 1.5 },
      { at: [0, 2.05, -0.7], w: 1.7, h: 1.8 },
      { at: [0, 2.15, 0.2], w: 1.75, h: 1.85 },
      { at: [0, 2.2, 1.0], w: 1.5, h: 1.7 },
    ],
    { bone: [hips, spine], color: skin, sides: 10, smooth: false, name: "body" },
  );
  // head
  b.part(new THREE.IcosahedronGeometry(1, 1), skin, { bone: head, at: [0, 2.1, 1.6], scale: [0.65, 0.75, 0.7], flat: true, name: "skull" });
  b.part(new THREE.IcosahedronGeometry(1, 0), skin, { bone: head, at: [0, 2.55, 1.55], scale: [0.5, 0.35, 0.4], flat: true, name: "forehead" });
  b.part(new THREE.BoxGeometry(0.5, 0.25, 0.5), skin, { bone: jaw, at: [0, 1.55, 2.0], name: "lowerJaw" });

  // trunk
  const trunk = b.chain("trunk", catmull([[0, 1.85, 2.0], [0, 1.4, 2.25], [0, 0.8, 2.4], [0, 0.35, 2.6], [0, 0.22, 2.95]]), {
    parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4"], role: "tentacle",
  });
  b.sweep(trunk, [0.28, 0.1], { color: skin, sides: 8, smooth: false, name: "trunk" });
  for (let i = 0; i < 8; i++) {
    const c = trunk.at(0.1 + i * 0.11);
    b.part(new THREE.TorusGeometry(0.2 - i * 0.015, 0.02, 4, 8), "#6a645a", { bone: c.bone as any, at: c.at, dir: c.tangent, flat: true, name: "wrinkle" });
  }
  b.part(new THREE.SphereGeometry(0.1, 6, 4), "#3b3834", { bone: trunk.tip ?? trunk.joints[3], at: [0, 0.2, 3.0], name: "trunkTip" });

  // eyes
  const eye = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1a1412"/><circle cx="11" cy="11" r="4" fill="#fff"/></svg>`, { size: 64 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: head, at: [s * 0.58, 2.2, 1.78], dir: [s, 0, 0.35], axis: "z", texture: eye, name: "eye" });
    // ears
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.55, 2.4, 1.3], dir: [s, 0.1, -0.3], role: "hinge" });
    b.extrude([[0, 0.5], [0.5, 0.9], [1.2, 0.7], [1.45, 0], [1.1, -0.9], [0.5, -1.2], [0.0, -0.6]], {
      at: [s * 0.55, 2.4, 1.3], x: [s, 0, -0.45], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, color: paint((p, n) => mix("#7a7468", "#a7857a", smoothstep(0.2, -0.8, p.y - 2.2))), bone: ear, name: "ear",
    });
    // tusks
    b.sweep(catmull([[s * 0.32, 1.75, 2.0], [s * 0.45, 1.3, 2.35], [s * 0.45, 1.0, 2.9], [s * 0.3, 1.0, 3.35]]), [0.09, 0.015], {
      bone: head, color: TUSK, sides: 6, caps: { start: "flat", end: "point" }, name: "tusk",
    });
    // legs
    for (const front of [true, false]) {
      const z = front ? 0.75 : -1.1;
      const root: [number, number, number] = [s * 0.6, 1.5, z];
      const pts = limb(root, [s * 0.6, 0.18, z], [0.8, 0.7], [0, 0, front ? -1 : 1]);
      const k = (front ? "F" : "H") + side;
      const leg = b.chain(`leg${k}`, pts, {
        parent: front ? chest : hips, names: [`hip${k}`, `knee${k}`, `foot${k}`], role: "leg", contact: [s * 0.6, 0, z],
      });
      b.sweep(leg, [0.4, 0.3, 0.3], { color: skin, sides: 8, smooth: false, name: `leg${k}` });
      b.part(new THREE.CylinderGeometry(0.32, 0.36, 0.2, 8), "#6a645a", { bone: leg.tip!, at: [s * 0.6, 0.1, z], flat: true, name: "foot" });
      for (let t = -1; t <= 1; t++)
        b.part(new THREE.SphereGeometry(0.07, 5, 4), TOES, { bone: leg.tip!, at: [s * 0.6 + t * 0.16, 0.08, z + 0.3], scale: [1, 0.8, 0.7], flat: true, name: "toenail" });
    }
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 2.4, -1.5], [0, 2.1, -1.8], [0, 1.6, -1.85], [0, 1.1, -1.8]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  b.sweep(tail, [0.1, 0.04], { color: skin, sides: 6, name: "tail" });
  b.part(new THREE.ConeGeometry(0.12, 0.3, 5), "#2a2622", { bone: tail.joints[2], at: [0, 1.0, -1.8], dir: [0, -1, 0], flat: true, name: "tailTuft" });

  return b.root;
}
```