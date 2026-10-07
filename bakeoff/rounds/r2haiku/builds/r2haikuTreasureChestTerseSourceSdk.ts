import * as THREE from "three";
import { createBuilder, grain, mottle, rng } from "../../../../src/index";
import type { Paint } from "../../../../src/index";

export const meta = {
  name: "Treasure chest",
  description: "A banded wooden treasure chest with a domed, hinged lid propped open on a heap of gold coins and gems.",
};

export default function treasureChest() {
  const b = createBuilder({ name: "treasure-chest" });

  // Proportions (meters). The body runs from y = BASE to TOP; the lid is a half-cylinder hinged on the back top edge.
  const W = 0.9;
  const D = 0.55;
  const H = 0.4;
  const BASE = 0.04;
  const TOP = BASE + H;
  const R = D / 2;
  const DOME = 0.55; // lid height as a share of its radius

  const wood: Paint = grain("#8a5a2e", "#5c3819", { size: 0.06, axis: "x", seed: 3 });
  const darkWood: Paint = grain("#5c3819", "#3e2410", { size: 0.05, axis: "x", seed: 9 });
  const gold: Paint = mottle("#f2c531", "#b8861b", { size: 0.04, seed: 5 });
  const brass = "#c9a227";
  const iron = "#40424a";

  const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
    new THREE.BoxGeometry(w, h, d).translate(x, y, z);

  const add = (geometry: THREE.BufferGeometry, color: string | Paint, bone = "chest") =>
    b.part(geometry, color, { bone, at: [0, 0, 0] });

  // Root joint: the chest itself.
  b.joint("chest", { at: [0, 0, 0] });
  // The lid hinges along the back top edge.
  b.joint("lid", { parent: "chest", at: [0, TOP, -R], dir: [0, 1, 0], role: "hinge" });

  // Body and feet.
  add(box(W, H, D, 0, BASE + H / 2, 0), wood);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) add(box(0.1, BASE, 0.1, sx * (W / 2 - 0.08), BASE / 2, sz * (D / 2 - 0.08)), darkWood);

  // Iron corner brackets and vertical straps that wrap over the top under the lid.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) add(box(0.05, H + 0.01, 0.05, sx * W / 2, BASE + H / 2, sz * D / 2), iron);
  for (const x of [-0.27, 0.27]) add(box(0.05, H + 0.01, D + 0.01, x, BASE + H / 2, 0), iron);

  // Hinge knuckles on the back edge.
  for (const x of [-0.3, 0, 0.3])
    add(
      new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8).rotateZ(Math.PI / 2).translate(x, TOP, -R),
      iron,
    );

  // Front lock: a brass plate, a dark keyhole and a shackle ring.
  add(box(0.11, 0.13, 0.012, 0, 0.3, D / 2 + 0.004), brass);
  add(box(0.025, 0.05, 0.014, 0, 0.28, D / 2 + 0.008), "#1d1a16");
  add(new THREE.TorusGeometry(0.03, 0.008, 6, 10).translate(0, 0.36, D / 2 + 0.01), brass);

  // The domed lid: a half-cylinder along x, scaled to a shallow dome, centred over the body.
  const lidDome = (scaleR: number, length: number, open: boolean) =>
    new THREE.CylinderGeometry(R * scaleR, R * scaleR, length, 18, 1, open, 0, Math.PI)
      .rotateZ(Math.PI / 2)
      .scale(1, DOME, 1)
      .translate(0, TOP, 0);

  add(lidDome(1, W, false), wood, "lid");
  for (const x of [-0.3, 0, 0.3]) add(lidDome(1.04, 0.035, true).translate(x, 0, 0), iron, "lid");
  // Brass studs along the lid's front rim.
  for (let i = 0; i < 7; i++) {
    const x = -0.36 + i * 0.12;
    add(new THREE.SphereGeometry(0.014, 6, 4).translate(x, TOP + 0.002, D / 2 - 0.01), brass, "lid");
  }

  // A heap of coins spilling from the open chest, with two gems on top.
  const coin = (x: number, y: number, z: number, tx: number, tz: number) =>
    new THREE.CylinderGeometry(0.036, 0.036, 0.008, 10).rotateX(tx).rotateZ(tz).translate(x, y, z);
  const rnd = rng(7);
  for (let i = 0; i < 22; i++) {
    const d = Math.sqrt(rnd()) * 0.14;
    const a = rnd() * Math.PI * 2;
    const x = Math.cos(a) * d * 1.2;
    const z = 0.16 + Math.sin(a) * d;
    const y = TOP + 0.004 + (1 - d / 0.14) * 0.05 + rnd() * 0.03;
    add(coin(x, y, z, (rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.5), gold);
  }
  add(new THREE.OctahedronGeometry(0.03).scale(1, 0.7, 1).translate(0.04, TOP + 0.075, 0.16), "#b3202c");
  add(new THREE.OctahedronGeometry(0.024).scale(1, 0.7, 1).translate(-0.08, TOP + 0.065, 0.12), "#2a5bd7");

  // Rest pose: the lid propped open, its front raised about 65 degrees, so the gold shows.
  b.pose("lid", { axis: [1, 0, 0], deg: -65 });

  return b.root;
}
