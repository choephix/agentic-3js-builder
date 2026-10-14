import * as THREE from "three";
import { createBuilder, grain, mottle, rng } from "../../../../src/index";

export const meta = {
  name: "Treasure chest",
  description:
    "A wooden treasure chest on four feet, with iron straps and rivets, a gold lock plate, side handles and an arched lid propped open on a hinge over a heap of coins, a ruby and an emerald.",
};

const W = 0.7; // chest width (x)
const D = 0.4; // chest depth (z)
const BASE = 0.04; // feet height
const H = 0.3; // body height
const TOP = BASE + H; // where the lid hinges
const R = 0.2; // lid arch radius (half the depth)

/** A half-cylinder arch: flat side on the floor, round side up, axis along x, centred on the origin. */
function arch(radius: number, length: number, sides: number) {
  return new THREE.CylinderGeometry(radius, radius, length, sides, 1, false, 0, Math.PI).rotateZ(Math.PI / 2);
}

export default function treasureChest() {
  const b = createBuilder({ name: "treasure-chest", paintSize: 1024 });
  const random = rng(7);

  const wood = grain("#9a6431", "#5c3614", { size: 0.08, axis: "x", seed: 3 });
  const iron = "#3b3d44";
  const shadow = "#2a1a0e";
  const gold = mottle("#f7d46a", "#b97d17", { size: 0.03, seed: 4 });
  const ruby = "#b0173c";
  const emerald = "#1f9d62";

  // Skeleton: the chest body, and a lid hinge on its back top edge.
  b.joint("base", { at: [0, 0, 0] });
  b.joint("lid", { parent: "base", at: [0, TOP, -D / 2], role: "hinge" });

  // Body and feet.
  b.part(new THREE.BoxGeometry(W, H, D), wood, { bone: "base", at: [0, BASE + H / 2, 0], name: "body" });
  for (const x of [-0.31, 0.31])
    for (const z of [-0.16, 0.16])
      b.part(new THREE.BoxGeometry(0.07, BASE, 0.07), shadow, { bone: "base", at: [x, BASE / 2, z], name: "foot" });

  // Iron straps down the body, with rivets on the front.
  for (const x of [-0.23, 0.23]) {
    b.part(new THREE.BoxGeometry(0.06, H, D + 0.03), iron, {
      bone: "base",
      at: [x, BASE + H / 2, 0],
      name: "strap",
    });
    for (const y of [BASE + 0.04, TOP - 0.04])
      b.part(new THREE.SphereGeometry(0.01, 8, 6), iron, {
        bone: "base",
        at: [x, y, D / 2 + 0.015],
        name: "rivet",
      });
  }

  // Lid: an arch with iron straps wrapping it.
  b.part(arch(R, W, 24), wood, { bone: "lid", at: [0, TOP, 0], name: "lid" });
  for (const x of [-0.23, 0.23])
    b.part(arch(R + 0.012, 0.06, 20), iron, { bone: "lid", at: [x, TOP, 0], name: "lid-strap" });

  // Gold lock plate and keyhole on the front.
  b.part(new THREE.BoxGeometry(0.1, 0.13, 0.02), gold, {
    bone: "base",
    at: [0, BASE + H / 2, D / 2 + 0.01],
    name: "lock",
  });
  b.part(new THREE.BoxGeometry(0.02, 0.04, 0.01), shadow, {
    bone: "base",
    at: [0, BASE + H / 2 - 0.01, D / 2 + 0.02],
    name: "keyhole",
  });

  // Side handles: half rings standing out from each end, in the YZ plane.
  for (const x of [-0.36, 0.36]) {
    const ring = new THREE.TorusGeometry(0.05, 0.012, 8, 16, Math.PI).rotateY(Math.PI / 2);
    b.part(ring, iron, { bone: "base", at: [x, BASE + H * 0.7, 0], name: "handle" });
  }

  // Treasure heaped inside the open chest: coins, a ruby and an emerald.
  const coinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14);
  for (let i = 0; i < 18; i++) {
    const x = (random() * 2 - 1) * 0.24;
    const z = (random() * 2 - 1) * 0.12;
    const y = TOP + 0.006 + random() * random() * 0.03;
    b.part(coinGeo, gold, {
      bone: "base",
      at: [x, y, z],
      rotation: [(random() * 2 - 1) * 12, random() * 360, (random() * 2 - 1) * 12],
      name: "coin",
    });
  }
  b.part(new THREE.OctahedronGeometry(0.035), ruby, {
    bone: "base",
    at: [-0.1, TOP + 0.04, -0.05],
    flat: true,
    name: "ruby",
  });
  b.part(new THREE.OctahedronGeometry(0.03), emerald, {
    bone: "base",
    at: [0.12, TOP + 0.035, 0.02],
    flat: true,
    name: "emerald",
  });

  // A few coins spilled on the floor in front.
  for (const [x, z] of [
    [-0.12, 0.33],
    [0.05, 0.36],
    [0.18, 0.31],
    [-0.02, 0.44],
    [0.27, 0.42],
  ])
    b.part(coinGeo, gold, {
      bone: "base",
      at: [x, 0.006, z],
      rotation: [0, random() * 360, 0],
      name: "floor-coin",
    });

  // Lid propped open about its hinge.
  b.pose("lid", { axis: [1, 0, 0], deg: -35 });

  return b.root;
}
