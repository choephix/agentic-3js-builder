```ts
import * as THREE from "three";
import { createBuilder, stripes, paint, mix, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description: "Striped envelope, wicker basket, burner and rigging, hanging above the ground.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "balloon" });
  b.joint("root", { at: [0, 0.0, 0] });
  b.joint("envelope", { parent: "root", at: [0, 3.2, 0], dir: [0, 1, 0] });
  b.joint("flap", { parent: "envelope", at: [0, 10.5, 0], dir: [0, 1, 0], role: "hinge" });

  // Envelope: lathe with striped paint
  const colors = ["#d9362b", "#f5e6c0", "#2b6cb0", "#f2b134"];
  const gores = paint((p, n) => {
    const a = Math.atan2(p.x, p.z);
    const k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 16);
    const base = colors[k % colors.length];
    const band = smoothstep(7.4, 7.6, p.y) * (1 - smoothstep(7.9, 8.1, p.y));
    return band > 0.5 ? "#2a2a33" : base;
  });
  b.lathe(
    [
      [0.01, 5.0],
      [0.9, 5.05],
      [1.8, 5.5],
      [2.9, 6.6],
      [3.7, 8.0],
      [3.9, 9.4],
      [3.4, 11.0],
      [2.3, 12.4],
      [1.0, 13.3],
      [0.01, 13.5],
    ],
    { at: [0, 0, 0], color: gores, segments: 16, bone: "envelope", name: "envelope" },
  );
  // Mouth skirt
  b.lathe(
    [
      [0.78, 4.4],
      [0.95, 4.4],
      [1.0, 5.1],
      [0.8, 5.1],
    ],
    { at: [0, 0, 0], color: "#c9482f", segments: 12, bone: "envelope" },
  );
  // Top cap
  b.part(new THREE.CylinderGeometry(0.7, 0.8, 0.12, 10), "#2a2a33", { at: [0, 13.45, 0], bone: "flap" });
  b.part(new THREE.TorusGeometry(0.6, 0.05, 5, 10), "#d9d9d9", { at: [0, 13.5, 0], rotation: [90, 0, 0], bone: "flap" });

  // Burner & frame
  const metal = "#8d949c";
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 8), "#bfc6cc", { at: [0, 3.55, 0], bone: "root" });
  b.part(new THREE.ConeGeometry(0.25, 0.3, 8), "#f26b1d", { at: [0, 4.1, 0], bone: "root" });
  b.part(new THREE.ConeGeometry(0.12, 0.4, 6), "#ffd23a", { at: [0, 4.3, 0], bone: "root" });

  // Support poles & ropes
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const bx = sx * 0.6;
      const bz = sz * 0.45;
      b.rod([bx, 1.45, bz], [bx * 0.9, 3.4, bz * 0.9], 0.03, { color: metal, bone: "root", sides: 5 });
      // rigging to envelope edge
      const ex = sx * 1.6;
      const ez = sz * 1.6;
      b.rod([bx * 0.9, 3.4, bz * 0.9], [ex * 0.85, 5.5, ez * 0.85], 0.015, { color: "#5b4630", bone: "root", sides: 4 });
      // envelope-edge anchor
      b.part(new THREE.SphereGeometry(0.06, 5, 4), "#d9d9d9", { at: [ex * 0.85, 5.5, ez * 0.85], bone: "root" });
    }
  // Burner crossbar
  b.part(new THREE.BoxGeometry(1.0, 0.06, 0.06), metal, { at: [0, 3.4, 0], bone: "root" });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.8), metal, { at: [0, 3.4, 0], bone: "root" });

  // Basket
  const wicker = stripes("#b9854a", "#8c5e2c", { size: 0.08, axis: "y", width: 0.5, wobble: 0.2 });
  b.part(new THREE.BoxGeometry(1.4, 1.05, 1.1), wicker, { at: [0, 0.75, 0], bone: "root", name: "basket" });
  b.part(new THREE.BoxGeometry(1.5, 0.12, 1.2), "#6e4521", { at: [0, 1.3, 0], bone: "root" });
  b.part(new THREE.BoxGeometry(1.5, 0.12, 1.2), "#5a3a1c", { at: [0, 0.14, 0], bone: "root" });
  // Hollow-look inner lip
  b.part(new THREE.BoxGeometry(1.2, 0.04, 0.9), "#3b2813", { at: [0, 1.37, 0], bone: "root" });
  // Weave bands
  for (const y of [0.45, 0.8, 1.1])
    b.part(new THREE.BoxGeometry(1.43, 0.05, 1.13), "#7a4f25", { at: [0, y, 0], bone: "root" });
  // Corner posts
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.1, 1.3, 0.1), "#5a3a1c", { at: [sx * 0.7, 0.75, sz * 0.55], bone: "root" });
  // Sandbags
  for (const sx of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.16, 6, 5), "#c8b88a", { at: [sx * 0.82, 0.8, 0.0], scale: [1, 1.2, 1], bone: "root" });
    b.rod([sx * 0.76, 1.15, 0], [sx * 0.82, 0.95, 0], 0.01, { color: "#5b4630", bone: "root", sides: 3 });
  }
  // Propane tank
  b.part(new THREE.CapsuleGeometry(0.2, 0.35, 3, 8), "#e8e8ea", { at: [0.3, 0.7, 0.0], bone: "root", rotation: [0, 0, 0] });

  const root = b.root;
  // Lift whole model so basket bottom touches y=0 (basket base already at ~0.08)
  root.position.y = -0.08;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
```