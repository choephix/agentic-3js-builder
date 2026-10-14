import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Treasure Chest",
  description: "Banded wooden pirate chest with a domed hinged lid, iron straps, a jeweled lock and spilled gold coins.",
};

export default function build() {
  const b = createBuilder({ name: "treasureChest" });
  const root = b.joint("chest", { at: [0, 0, 0] });
  const lid = b.joint("lidHinge", { at: [0, 0.42, -0.27], parent: root });

  const WOOD = "#8a5226", WOOD_D = "#6b3d1b", IRON = "#3b3f48", IRON_L = "#5d636f";
  const GOLD = "#f2c230", GOLD_D = "#c8921a", RED = "#d3263b", DARK = "#15110e";

  const W = 0.9, D = 0.55, H = 0.42, R = D / 2, LH = 0.8;

  let seed = 12345;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  const box = (w: number, h: number, d: number, c: string, p: number[], bone: any = root) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: p as [number, number, number], bone });

  // half-cylinder lid segment along x, resting on y=0 local
  const dome = (len: number, r: number) => {
    const g = new THREE.CylinderGeometry(r, r, len, 12, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.scale(1, LH, 1);
    return g;
  };

  // body
  box(W, H - 0.06, D, WOOD, [0, 0.06 + (H - 0.06) / 2, 0]);
  // plank lines
  for (let i = 1; i < 4; i++) {
    const y = 0.06 + ((H - 0.06) * i) / 4;
    box(W + 0.01, 0.012, D + 0.01, WOOD_D, [0, y, 0]);
  }
  // feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.1, 0.07, 0.1, WOOD_D, [sx * (W / 2 - 0.05), 0.03, sz * (D / 2 - 0.05)]);

  // base iron rim
  box(W + 0.03, 0.04, D + 0.03, IRON, [0, 0.085, 0]);

  // lid
  b.part(dome(W, R), WOOD, { at: [0, H, 0], bone: lid });
  box(W, 0.03, D, WOOD_D, [0, H - 0.005, 0], lid);
  // lid plank ridges
  for (const a of [0.3, 0.9, 1.5, 2.1, 2.7]) {
    const g = new THREE.CylinderGeometry(R + 0.004, R + 0.004, W - 0.02, 12, 1, false, a - 0.02, 0.04);
    g.rotateZ(Math.PI / 2);
    g.scale(1, LH, 1);
    b.part(g, WOOD_D, { at: [0, H, 0], bone: lid });
  }

  // iron straps
  for (const x of [-0.29, 0.29]) {
    box(0.09, H - 0.02, D + 0.025, IRON, [x, 0.06 + (H - 0.02) / 2 - 0.0, 0]);
    b.part(dome(0.09, R + 0.02), IRON, { at: [x, H, 0], bone: lid });
    // rivets
    for (const z of [-1, 1]) {
      for (const y of [0.14, 0.32]) {
        b.part(new THREE.SphereGeometry(0.014, 6, 4), IRON_L, { at: [x, y, z * (D / 2 + 0.014)], bone: root });
      }
      b.part(new THREE.SphereGeometry(0.014, 6, 4), IRON_L, {
        at: [x, H + R * LH * 0.8, z * R * 0.6 * 1.05],
        bone: lid,
      });
    }
  }
  // end caps / corner brackets
  for (const sx of [-1, 1]) {
    box(0.03, H - 0.02, D - 0.1, IRON, [sx * (W / 2 + 0.008), 0.06 + (H - 0.02) / 2, 0]);
    const g = new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.025, 10, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.scale(1, LH * 0.95, 1);
    b.part(g, IRON, { at: [sx * (W / 2 + 0.012), H, 0], bone: lid });
    for (const sz of [-1, 1])
      box(0.04, 0.12, 0.04, IRON, [sx * (W / 2 - 0.005), 0.12, sz * (D / 2 - 0.005)]);
  }

  // lock
  box(0.14, 0.15, 0.03, GOLD_D, [0, H - 0.04, D / 2 + 0.015]);
  box(0.1, 0.1, 0.012, GOLD, [0, H - 0.04, D / 2 + 0.035]);
  box(0.02, 0.04, 0.012, DARK, [0, H - 0.05, D / 2 + 0.045]);
  b.part(new THREE.SphereGeometry(0.02, 6, 4), DARK, { at: [0, H - 0.025, D / 2 + 0.045], bone: root });
  // hasp on lid
  box(0.1, 0.1, 0.025, GOLD_D, [0, H + 0.04, D / 2 + 0.005], lid);
  // gem
  b.part(new THREE.OctahedronGeometry(0.03), RED, { at: [0, H + 0.1, D / 2 + 0.01], bone: lid });
  // handles
  for (const sx of [-1, 1]) {
    box(0.025, 0.06, 0.03, IRON, [sx * (W / 2 + 0.03), 0.28, 0]);
  }

  // coins spilled in front
  const coinGeo = () => new THREE.CylinderGeometry(0.04, 0.04, 0.008, 10);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, rr = 0.08 + rnd() * 0.26;
    const g = coinGeo();
    const stacked = i > 16;
    g.rotateX((rnd() - 0.5) * (stacked ? 0.3 : 0.15));
    g.rotateZ((rnd() - 0.5) * (stacked ? 0.3 : 0.15));
    g.rotateY(rnd() * 3);
    const px = Math.cos(a) * rr * 1.5 + 0.1;
    const pz = D / 2 + 0.12 + Math.abs(Math.sin(a)) * rr * 1.0;
    b.part(g, i % 3 === 0 ? GOLD_D : GOLD, { at: [px, stacked ? 0.012 + 0.009 : 0.005, pz], bone: root });
  }
  // coin stack
  for (let i = 0; i < 6; i++) {
    const g = coinGeo();
    g.rotateY(rnd() * 3);
    b.part(g, i % 2 ? GOLD_D : GOLD, { at: [-0.3 + (rnd() - 0.5) * 0.01, 0.005 + i * 0.0085, 0.4], bone: root });
  }
  // a gem on the floor
  b.part(new THREE.OctahedronGeometry(0.035), RED, { at: [-0.12, 0.03, 0.42], bone: root });

  return b.root;
}
