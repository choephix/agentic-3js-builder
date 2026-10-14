```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise } from "agentic-3js-builder";

export const meta = {
  name: "Treasure Chest",
  description: "Wooden pirate treasure chest with iron bands, lock, open-ready hinged lid and a gold spill.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "chest" });

  // dimensions (m)
  const W = 0.9, D = 0.55, BH = 0.38; // body width, depth, height
  const T = 0.03;
  const wood = paint((p, n) => {
    const g = noise(new THREE.Vector3(p.x * 0.15, p.y * 3, p.z * 3), 0.1, 3);
    const plank = Math.abs(Math.sin(p.y * 38)) < 0.05 ? 0.45 : 1;
    return mix("#5a3416", "#8a5a2b", g * plank);
  });
  const IRON = "#2b2d33", RIVET = "#6b6e76", GOLD = "#f2b81c", GOLD2 = "#ffd95a", DARK = "#1c120a", RED = "#7a1620";

  b.joint("base", { at: [0, 0, 0] });
  b.joint("lid", { at: [0, BH, -D / 2], dir: [1, 0, 0], role: "hinge", parent: "base" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // body
  b.part(box(W, BH - 0.04, D), wood, { at: [0, (BH - 0.04) / 2 + 0.02, 0], bone: "base" });
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(box(0.1, 0.05, 0.1), "#3a220e", { at: [sx * (W / 2 - 0.04), 0.022, sz * (D / 2 - 0.04)], bone: "base" });
  // interior (dark top + gold)
  b.part(box(W - 2 * T, 0.01, D - 2 * T), RED, { at: [0, BH - 0.06, 0], bone: "base" });
  const r = rngLike(5);
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * (W - 0.14), z = (r() - 0.5) * (D - 0.14);
    const h = 0.03 + 0.05 * Math.cos(x * 3) * (1 - Math.abs(z) * 1.5);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), r() > 0.5 ? GOLD : GOLD2, {
      at: [x, BH - 0.055 + Math.max(0.005, h) * 0.9, z], rotation: [(r() - 0.5) * 50, 0, (r() - 0.5) * 50], bone: "base",
    });
  }
  // gems
  const gem = [["#d02040", -0.18], ["#2a8cff", 0.08], ["#2ec27e", 0.22]] as const;
  gem.forEach(([c, x], i) =>
    b.part(new THREE.OctahedronGeometry(0.03), c, { at: [x, BH - 0.01, 0.05 + i * 0.03], bone: "base", scale: [1, 0.8, 1] }));

  // body bands
  for (const sx of [-1, 1]) {
    const x = sx * (W / 2 - 0.1);
    b.part(box(0.07, BH - 0.02, D + 0.02), IRON, { at: [x, BH / 2 + 0.01, 0], bone: "base" });
    for (const sy of [0.08, BH - 0.1]) for (const sz of [-1, 1])
      b.part(new THREE.SphereGeometry(0.014, 6, 4), RIVET, { at: [x, sy, sz * (D / 2 + 0.012)], bone: "base" });
  }
  // top & bottom rim
  b.part(box(W + 0.02, 0.04, D + 0.02), IRON, { at: [0, 0.05, 0], bone: "base" });
  b.part(box(W + 0.02, 0.035, D + 0.02), IRON, { at: [0, BH - 0.03, 0], bone: "base" });
  // corner brackets
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(box(0.06, BH, 0.06), IRON, { at: [sx * (W / 2), BH / 2, sz * (D / 2)], bone: "base" });

  // lid: half-cylinder barrel along x
  const lidR = D / 2;
  const lidGeo = new THREE.CylinderGeometry(lidR, lidR, W, 14, 1, false, 0, Math.PI);
  lidGeo.rotateZ(Math.PI / 2);
  lidGeo.rotateX(0);
  // after rotateZ cylinder axis along x; half-arc opens toward +y? set explicit rotation
  b.part(lidGeo, wood, { at: [0, 0, D / 2], rotation: [0, 0, 0], bone: "lid", scale: [1, 0.62, 1] });
  // fix arc orientation: cylinder theta 0..PI spans +z..-z through +x; rotate so it spans up
  const lidCap = (sx: number) => {
    const g = new THREE.CylinderGeometry(lidR, lidR, 0.02, 14, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    return g;
  };
  void lidCap;
  // lid bands
  for (const sx of [-1, 1]) {
    const g = new THREE.CylinderGeometry(lidR + 0.012, lidR + 0.012, 0.07, 14, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    b.part(g, IRON, { at: [sx * (W / 2 - 0.1), 0, D / 2], bone: "lid", scale: [1, 0.62, 1] });
  }
  const end = new THREE.CylinderGeometry(lidR, lidR, 0.04, 14, 1, false, 0, Math.PI);
  end.rotateZ(Math.PI / 2);
  for (const sx of [-1, 1])
    b.part(end, IRON, { at: [sx * (W / 2 + 0.005), 0, D / 2], bone: "lid", scale: [1, 0.62, 1] });
  // lid front rim
  b.part(box(W + 0.02, 0.03, 0.03), IRON, { at: [0, 0.012, D - 0.005], bone: "lid" });

  // lock plate and keyhole
  b.part(box(0.12, 0.14, 0.02), GOLD, { at: [0, BH - 0.07, D / 2 + 0.015], bone: "base" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8), DARK, { at: [0, BH - 0.075, D / 2 + 0.028], rotation: [90, 0, 0], bone: "base" });
  b.part(box(0.01, 0.035, 0.01), DARK, { at: [0, BH - 0.1, D / 2 + 0.028], bone: "base" });
  b.part(box(0.08, 0.06, 0.02), GOLD, { at: [0, BH + 0.02, D - 0.005 + 0.0], bone: "lid" });

  // hinges at back
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8), IRON, { at: [sx * 0.25, BH, -D / 2 - 0.01], rotation: [0, 0, 90], bone: "lid" });
    b.part(box(0.07, 0.12, 0.012), IRON, { at: [sx * 0.25, BH - 0.06, -D / 2 - 0.012], bone: "base" });
  }
  // rope handles on sides
  for (const sx of [-1, 1])
    b.part(new THREE.TorusGeometry(0.035, 0.008, 5, 8, Math.PI), IRON, { at: [sx * (W / 2 + 0.03), BH * 0.55, 0], rotation: [0, 90, 180], bone: "base" });

  // floor spill of coins
  for (let i = 0; i < 9; i++) {
    const a = r() * 6.28, d = 0.1 + r() * 0.2;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), r() > 0.5 ? GOLD : GOLD2, {
      at: [Math.sin(a) * d + 0.12, 0.004 + (i > 6 ? 0.008 : 0), D / 2 + 0.1 + Math.cos(a) * d * 0.6], bone: "base",
    });
  }

  // open the lid slightly, rest pose stays closed
  void smoothstep;
  return b.root;
}

function rngLike(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
```