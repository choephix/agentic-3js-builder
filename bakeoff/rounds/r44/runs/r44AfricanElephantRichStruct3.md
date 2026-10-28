```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description: "Low-poly adult African bush elephant with huge ears, trunk, tusks, pillar legs and wrinkled painted hide.",
};

const SKIN = "#7d7469";
const TUSK = "#efe6cc";
const NAIL = "#c9bda6";

export default function build() {
  const b = createBuilder({ name: "elephant", paintSize: 1024 });
  const hide = paint((p, n) => {
    let c = mix("#6f675d", "#8c8276", noise(p, 0.3, 3));
    c = mix(c, "#5a5249", smoothstep(0.5, 0.8, noise(p, 0.06, 7)) * 0.5);
    c = mix(c, "#9a8a70", smoothstep(0.3, 0.0, p.y) * 0.5);
    return mix(c, "#4e473f", smoothstep(-0.2, -0.9, n.y) * 0.4);
  });

  const hips = b.joint("hips", { at: [0, 2.0, -0.9], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 2.0, -0.9], [0, 2.1, 0], [0, 2.2, 0.9]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const body = b.loft(
    [
      { at: [0, 2.0, -1.8], w: 1.2, h: 1.4 },
      { at: [0, 2.05, -0.9], w: 1.9, h: 1.9 },
      { at: [0, 2.1, 0.1], w: 2.0, h: 2.0 },
      { at: [0, 2.2, 1.0], w: 1.8, h: 1.9 },
    ],
    { bone: [hips, spine], color: hide, sides: 10, name: "body" },
  );

  const neck = b.joint("neck", { parent: chest, at: [0, 2.3, 1.1], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.3, 1.4], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.7, 2.0], dir: [0, -0.2, 1], role: "jaw" });
  b.part(new THREE.IcosahedronGeometry(0.75, 1), hide, { bone: head, at: [0, 2.3, 1.8], scale: [0.95, 1.1, 1], flat: true, name: "skull" });
  b.part(new THREE.IcosahedronGeometry(0.4, 1), hide, { bone: head, at: [0, 2.7, 1.85], scale: [1.1, 0.7, 1], flat: true, name: "forehead" });
  b.part(new THREE.BoxGeometry(0.5, 0.25, 0.4), SKIN, { bone: jaw, at: [0, 1.75, 2.1], name: "lowerJaw" });

  const trunk = b.chain("trunk", catmull([[0, 2.0, 2.1], [0, 1.4, 2.4], [0, 0.8, 2.55], [0, 0.35, 2.9], [0, 0.2, 3.4]]), {
    parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4"], role: "tentacle",
  });
  b.sweep(trunk, (t) => 0.3 - 0.17 * t, { color: hide, sides: 8, name: "trunk" });
  for (let i = 0; i < 6; i++) {
    const c = trunk.at(0.1 + i * 0.15);
    b.part(new THREE.TorusGeometry(0.3 - 0.17 * (0.1 + i * 0.15), 0.02, 4, 8), "#5a5249", { at: c.at, dir: c.tangent, axis: "z", bone: trunk.joints[Math.min(3, i)], name: "wrinkle" });
  }
  b.part(new THREE.ConeGeometry(0.1, 0.12, 6), "#4e473f", { bone: trunk.tip ?? trunk.joints[3], at: [0, 0.2, 3.45], dir: [0, 0, 1], name: "trunkTip" });

  const earTex = svg(`<svg viewBox="0 0 64 64"><path d="M32 2 L60 20 L56 52 L32 62 L6 46 L8 16Z" fill="#8a7f72"/><path d="M32 12 L50 24 L47 46 L32 52 L16 42 L18 22Z" fill="#c59a8c"/></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${k}`, { parent: head, at: [s * 0.55, 2.55, 1.6], dir: [s, 0, -0.2], role: "hinge" });
    b.extrude([[0, 0.8], [0.9, 1.0], [1.4, 0.4], [1.3, -0.5], [0.7, -1.0], [0.1, -0.5]], {
      at: [s * 0.55, 2.55, 1.6], x: [s, 0, -0.5], y: [0, 1, 0], thickness: 0.06, bevel: 0.01, color: hide, bone: ear, name: `ear${k}`,
    });
    b.part(new THREE.PlaneGeometry(1.1, 1.3), "#ffffff", { bone: ear, at: [s * 1.05, 2.45, 1.38], dir: [s * 0.8, 0, 0.6], axis: "z", texture: earTex, name: "earInner" });
    // eyes
    b.part(new THREE.SphereGeometry(0.06, 6, 4), "#1c120c", { bone: head, at: [s * 0.62, 2.45, 2.0], flat: true, name: "eye" });
    // tusks
    const tp = catmull([[s * 0.3, 1.9, 2.1], [s * 0.4, 1.5, 2.6], [s * 0.4, 1.3, 3.3], [s * 0.3, 1.4, 3.8]]);
    b.sweep(tp, [0.11, 0.02], { bone: head, color: TUSK, sides: 6, caps: { start: "flat", end: "point" }, name: `tusk${k}` });
    // legs
    for (const front of [true, false]) {
      const z = front ? 0.75 : -1.25;
      const root: [number, number, number] = [s * 0.65, 1.5, z];
      const pts = limb(root, [s * 0.62, 0.15, z + 0.05], [0.7, 0.65], [[0, 0, front ? -1 : 1]]);
      const nm = front ? "F" : "H";
      const leg = b.chain(`leg${nm}${k}`, pts, {
        parent: front ? chest : hips, names: [`hip${nm}${k}`, `knee${nm}${k}`, `foot${nm}${k}`], role: "leg", contact: [s * 0.62, 0, z + 0.05],
      });
      b.sweep(leg, [0.42, 0.33], { color: hide, sides: 8, name: `leg${nm}${k}` });
      b.part(new THREE.CylinderGeometry(0.36, 0.4, 0.2, 8), hide, { bone: leg.tip!, at: [s * 0.62, 0.1, z + 0.05], name: "foot" });
      for (let i = -1; i <= 1; i++)
        b.part(new THREE.BoxGeometry(0.12, 0.1, 0.1), NAIL, { bone: leg.tip!, at: [s * 0.62 + i * 0.2, 0.06, z + 0.4], name: "toenail" });
    }
  }

  const tail = b.chain("tail", catmull([[0, 2.2, -1.8], [0, 1.8, -2.0], [0, 1.1, -2.1]]), { parent: hips, names: ["tail1", "tail2"], role: "tail" });
  b.sweep(tail, [0.1, 0.04], { color: hide, sides: 6, name: "tail" });
  b.part(new THREE.ConeGeometry(0.1, 0.3, 5), "#3a322c", { bone: tail.joints[1], at: [0, 0.95, -2.1], dir: [0, -1, 0], name: "tailTuft" });

  return b.root;
}
```