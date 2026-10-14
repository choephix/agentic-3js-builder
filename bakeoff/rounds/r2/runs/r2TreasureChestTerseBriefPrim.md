```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treasure Chest",
  description: "A stylized wooden treasure chest with iron bands, a gold lock, and a spill of coins and gems.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasureChest" });
  const r = rng(7);

  const base = b.joint("base", { at: [0, 0, 0] });
  const lid = b.joint("lid", { at: [0, 0.5, -0.3], parent: base });

  const WOOD = "#8a5530", WOOD_D = "#5e3a20", WOOD_L = "#a56b3a";
  const IRON = "#3a3d46", IRON_L = "#5a5f6b", GOLD = "#e8b923", GOLD_D = "#b8860b";

  const W = 0.9, D = 0.6, H = 0.5;

  // Body
  b.part(new THREE.BoxGeometry(W, H, D), WOOD, { at: [0, H / 2, 0], bone: base });
  // Plank lines on body front/back
  for (let i = 1; i < 4; i++) {
    const y = (H / 4) * i;
    b.part(new THREE.BoxGeometry(W + 0.01, 0.012, D + 0.01), WOOD_D, { at: [0, y, 0], bone: base });
  }
  // Base trim
  b.part(new THREE.BoxGeometry(W + 0.05, 0.05, D + 0.05), WOOD_D, { at: [0, 0.025, 0], bone: base });
  // Corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.07, H + 0.02, 0.07), IRON, { at: [sx * (W / 2), H / 2, sz * (D / 2)], bone: base });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), IRON_L, { at: [sx * (W / 2 + 0.03), H - 0.02, sz * (D / 2 + 0.03)], bone: base });
  }
  // Vertical iron bands on body
  for (const x of [-0.27, 0.27]) {
    b.part(new THREE.BoxGeometry(0.09, H + 0.01, D + 0.03), IRON, { at: [x, H / 2, 0], bone: base });
    for (const sz of [-1, 1]) for (const y of [0.1, 0.4]) {
      b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 6).rotateX(Math.PI / 2), IRON_L, { at: [x, y, sz * (D / 2 + 0.02)], bone: base });
    }
  }
  // Interior filled with coins (visible when lid opens slightly) – top surface
  b.part(new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1), GOLD_D, { at: [0, H - 0.01, 0], bone: base });

  // Lid: half-cylinder barrel
  const lidR = D / 2;
  const lidGeo = new THREE.CylinderGeometry(lidR, lidR, W, 10, 1, false, 0, Math.PI);
  lidGeo.rotateZ(Math.PI / 2);
  // After rotateZ, the half faces +Y? Cylinder arc spans +Z..-Z via x; ensure dome up
  lidGeo.rotateX(-Math.PI / 2);
  b.part(lidGeo, WOOD_L, { at: [0, 0, 0.3], bone: lid });
  // end caps (half discs)
  for (const sx of [-1, 1]) {
    const cap = new THREE.CylinderGeometry(lidR, lidR, 0.03, 10, 1, false, 0, Math.PI);
    cap.rotateZ(Math.PI / 2);
    cap.rotateX(-Math.PI / 2);
    b.part(cap, WOOD_D, { at: [sx * (W / 2), 0, 0.3], bone: lid });
  }
  // Lid bottom plate
  b.part(new THREE.BoxGeometry(W, 0.03, D), WOOD_D, { at: [0, 0.015, 0.3], bone: lid });
  // Lid bands (arched)
  for (const x of [-0.27, 0.27]) {
    const band = new THREE.CylinderGeometry(lidR + 0.02, lidR + 0.02, 0.09, 10, 1, false, 0, Math.PI);
    band.rotateZ(Math.PI / 2);
    band.rotateX(-Math.PI / 2);
    b.part(band, IRON, { at: [x, 0, 0.3], bone: lid });
  }
  // End bands
  for (const sx of [-1, 1]) {
    const band = new THREE.CylinderGeometry(lidR + 0.025, lidR + 0.025, 0.05, 10, 1, false, 0, Math.PI);
    band.rotateZ(Math.PI / 2);
    band.rotateX(-Math.PI / 2);
    b.part(band, IRON, { at: [sx * (W / 2 + 0.01), 0, 0.3], bone: lid });
  }
  // Lid rivets
  for (const x of [-0.27, 0.27]) for (const a of [0.5, 1.2, 1.94, 2.64]) {
    b.part(new THREE.SphereGeometry(0.018, 5, 4), IRON_L, {
      at: [x, Math.sin(a) * (lidR + 0.025), 0.3 + Math.cos(a) * (lidR + 0.025)], bone: lid,
    });
  }
  // Hinges at back
  for (const x of [-0.27, 0.27]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.11, 6).rotateZ(Math.PI / 2), IRON_L, { at: [x, 0, 0], bone: lid });
  }

  // Lock plate and clasp
  b.part(new THREE.BoxGeometry(0.16, 0.2, 0.03), GOLD, { at: [0, 0.38, D / 2 + 0.03], bone: base });
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.04), GOLD_D, { at: [0, 0.4, D / 2 + 0.05], bone: base });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.045, 6).rotateX(Math.PI / 2), IRON, { at: [0, 0.4, D / 2 + 0.075], bone: base });
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.045), IRON, { at: [0, 0.372, D / 2 + 0.075], bone: base });
  // Lid hasp tab
  b.part(new THREE.BoxGeometry(0.12, 0.16, 0.025), GOLD, { at: [0, 0.54, D / 2 + 0.03], bone: lid });
  // Gold corner studs
  for (const sx of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [sx * 0.06, 0.44, D / 2 + 0.05], bone: base });
  }

  // Feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.04, 0.1), IRON, { at: [sx * (W / 2 - 0.02), 0.02, sz * (D / 2 - 0.02)], bone: base });
  }

  // Spilled coins and gems on the floor in front
  const gemCols = ["#d6264b", "#2fb6d9", "#3fcf6a"];
  for (let i = 0; i < 16; i++) {
    const x = (r() - 0.5) * 0.8;
    const z = 0.38 + r() * 0.3 - Math.abs(x) * 0.1;
    const stack = r() < 0.4 ? 2 : 1;
    for (let s = 0; s < stack; s++) {
      const coin = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8);
      coin.rotateY(r() * 3);
      if (r() < 0.25) coin.rotateZ(0.3);
      b.part(coin, r() < 0.5 ? GOLD : GOLD_D, { at: [x, 0.008 + s * 0.013, z], bone: base });
    }
  }
  for (let i = 0; i < 4; i++) {
    const g = new THREE.OctahedronGeometry(0.035, 0);
    b.part(g, gemCols[i % 3], { at: [-0.3 + i * 0.2 + (r() - 0.5) * 0.05, 0.03, 0.5 + r() * 0.15], bone: base });
  }
  // Coin pile on top of the chest interior
  for (let i = 0; i < 10; i++) {
    const c = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8);
    c.rotateZ((r() - 0.5) * 0.6);
    b.part(c, r() < 0.5 ? GOLD : GOLD_D, { at: [(r() - 0.5) * 0.5, H + 0.005, (r() - 0.5) * 0.2], bone: base });
  }

  // Slightly crack the lid open for rest pose
  lid.rotation.x = 0;

  return b.root;
}
```