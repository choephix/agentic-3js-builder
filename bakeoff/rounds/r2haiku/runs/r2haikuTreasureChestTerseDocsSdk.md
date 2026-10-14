```ts
import * as THREE from "three";
import { createBuilder, grain, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treasure chest",
  description: "An oak treasure chest with iron bands, a brass lock and an open lid spilling gold coins and gems.",
};

// Palette
const WOOD_A = "#9a6532";
const WOOD_B = "#5e3418";
const LID_A = "#ab7140";
const IRON = "#3d434c";
const BRASS = "#d9a23a";
const DARK = "#1c0e06";
const GOLD = "#f2b233";
const GOLD_HI = "#ffd766";
const RED = "#c92a3e";
const TEAL = "#2aa6c9";
const GREEN = "#37b26b";

// Dimensions (metres)
const W = 0.9; // width (x)
const D = 0.56; // depth (z)
const Y0 = 0.04; // underside of body, sitting on the feet
const Y1 = 0.36; // top of body, hinge height
const HALF_W = W / 2;
const HALF_D = D / 2;

export default function build() {
  const b = createBuilder({ name: "treasure chest" });
  const r = rng(11);

  // Skeleton: a fixed body and a lid hinged along its back top edge.
  const body = b.joint("body", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: body, at: [0, Y1, -HALF_D] });

  // ---- Body -------------------------------------------------------------
  const bodyGeo = new THREE.BoxGeometry(W, Y1 - Y0, D).translate(0, (Y0 + Y1) / 2, 0);
  b.part(bodyGeo, grain(WOOD_A, WOOD_B, { size: 0.12, axis: "x", seed: 3 }), { bone: body, at: [0, 0, 0] });

  // Dark interior recess showing through the open top
  const recess = new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.08).translate(0, 0.355, 0);
  b.part(recess, DARK, { bone: body, at: [0, 0, 0] });

  // Feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const foot = new THREE.BoxGeometry(0.1, Y0, 0.1).translate(sx * 0.36, Y0 / 2, sz * 0.2);
      b.part(foot, IRON, { bone: body, at: [0, 0, 0] });
    }

  // Iron straps on front and back, with rivets
  const strapH = Y1 - Y0;
  const strapMid = (Y0 + Y1) / 2;
  const rivetGeo = new THREE.SphereGeometry(0.011, 6, 4);
  for (const x of [-0.3, 0, 0.3]) {
    for (const sz of [1, -1]) {
      const strap = new THREE.BoxGeometry(0.035, strapH, 0.012).translate(x, strapMid, sz * (HALF_D + 0.004));
      b.part(strap, IRON, { bone: body, at: [0, 0, 0] });
      for (const y of [0.08, 0.2, 0.32])
        b.part(rivetGeo, BRASS, { bone: body, at: [x, y, sz * (HALF_D + 0.008)] });
    }
  }
  // Straps on the ends, under the handles
  for (const sx of [-1, 1]) {
    for (const z of [-0.2, 0.2]) {
      const strap = new THREE.BoxGeometry(0.012, strapH, 0.035).translate(sx * (HALF_W + 0.004), strapMid, z);
      b.part(strap, IRON, { bone: body, at: [0, 0, 0] });
      for (const y of [0.08, 0.2, 0.32])
        b.part(rivetGeo, BRASS, { bone: body, at: [sx * (HALF_W + 0.008), y, z] });
    }
  }

  // Brass corner guards
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const corner = new THREE.BoxGeometry(0.06, strapH + 0.01, 0.06).translate(
        sx * HALF_W,
        strapMid,
        sz * HALF_D,
      );
      b.part(corner, BRASS, { bone: body, at: [0, 0, 0] });
    }

  // Hinge knuckle along the back top edge
  const knuckle = new THREE.CylinderGeometry(0.014, 0.014, W - 0.04, 8)
    .rotateZ(Math.PI / 2)
    .translate(0, Y1, -HALF_D);
  b.part(knuckle, IRON, { bone: body, at: [0, 0, 0] });

  // Side handles on the ends
  for (const sx of [-1, 1]) {
    const ring = new THREE.TorusGeometry(0.045, 0.012, 8, 16).rotateY(Math.PI / 2).translate(sx * 0.47, 0.25, 0);
    b.part(ring, BRASS, { bone: body, at: [0, 0, 0] });
    for (const y of [0.295, 0.205]) {
      const plate = new THREE.BoxGeometry(0.03, 0.022, 0.04).translate(sx * (HALF_W + 0.01), y, 0);
      b.part(plate, BRASS, { bone: body, at: [0, 0, 0] });
    }
  }

  // ---- Lid (hinged) -----------------------------------------------------
  const lidSlab = new THREE.BoxGeometry(W, 0.04, D).translate(0, 0.38, 0);
  b.part(lidSlab, grain(LID_A, WOOD_B, { size: 0.12, axis: "x", seed: 5 }), { bone: lid, at: [0, 0, 0] });

  // Domed top: a half cylinder along X, flattened to a shallow arch
  const dome = new THREE.CylinderGeometry(HALF_D, HALF_D, W, 16, 1, false, 0, Math.PI)
    .rotateZ(Math.PI / 2)
    .scale(1, 0.35, 1)
    .translate(0, 0.4, 0);
  b.part(dome, grain(LID_A, WOOD_B, { size: 0.12, axis: "x", seed: 6 }), { bone: lid, at: [0, 0, 0] });

  // Iron band over the top ridge
  const ridgeBand = new THREE.BoxGeometry(W - 0.02, 0.012, 0.05).translate(0, 0.5, 0);
  b.part(ridgeBand, IRON, { bone: lid, at: [0, 0, 0] });

  // Brass lock plate and keyhole on the lid front
  const lock = new THREE.BoxGeometry(0.09, 0.06, 0.015).translate(0, 0.38, HALF_D + 0.0075);
  b.part(lock, BRASS, { bone: lid, at: [0, 0, 0] });
  const keyhole = new THREE.BoxGeometry(0.02, 0.03, 0.01).translate(0, 0.375, HALF_D + 0.016);
  b.part(keyhole, DARK, { bone: lid, at: [0, 0, 0] });

  // Open the lid, front edge raised
  b.pose(lid, { axis: [1, 0, 0], deg: -75 });

  // ---- Treasure inside ----------------------------------------------------
  const coinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 10);
  for (let i = 0; i < 70; i++) {
    const x = (r() * 2 - 1) * 0.32;
    const z = (r() * 2 - 1) * 0.2;
    const d = (x / 0.34) ** 2 + (z / 0.22) ** 2;
    if (d > 1) continue; // keep the pile inside the chest
    const y = Y1 + 0.005 + 0.035 * (1 - d) + r() * 0.012; // heaped toward the middle
    const col = r() < 0.5 ? GOLD : GOLD_HI;
    b.part(coinGeo, col, {
      bone: body,
      at: [x, y, z],
      rotation: [(r() - 0.5) * 40, r() * 360, (r() - 0.5) * 40],
    });
  }

  // A few gems set into the top of the pile
  const gemGeo = new THREE.OctahedronGeometry(0.028).scale(1, 0.8, 1);
  const gems: [number, number, number, string][] = [
    [-0.1, 0.42, 0.02, RED],
    [0.06, 0.43, -0.03, TEAL],
    [0.13, 0.4, 0.06, RED],
    [-0.02, 0.44, 0.06, GREEN],
  ];
  for (const [x, y, z, col] of gems)
    b.part(gemGeo, col, { bone: body, at: [x, y, z], rotation: [0, r() * 90, 0] });

  // Coins spilled on the floor beside the chest
  const floorCoin = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 10);
  const spills: [number, number][] = [
    [0.62, 0.22],
    [0.7, 0.3],
    [0.58, 0.34],
    [0.68, 0.14],
    [0.76, 0.24],
  ];
  for (const [x, z] of spills)
    b.part(floorCoin, r() < 0.5 ? GOLD : GOLD_HI, {
      bone: body,
      at: [x, 0.005, z],
      rotation: [0, r() * 360, 0],
    });

  return b.root;
}
```