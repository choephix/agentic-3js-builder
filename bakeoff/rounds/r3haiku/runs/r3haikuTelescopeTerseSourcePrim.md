```ts
import * as THREE from "three";
import { createBuilder, grain } from "agentic-3js-builder";

export const meta = {
  name: "telescope",
  description: "A refractor telescope on a wooden tripod: blue tube, dew shield, finder scope, gold eyepiece on a fork mount.",
};

export default function telescope() {
  const b = createBuilder({ name: "telescope" });

  const wood = grain("#8a5a2b", "#c58f55", { size: 0.03, axis: "y", seed: 3 });
  const dark = "#1d1f24";
  const silver = "#c4c9d2";
  const blue = "#1f5fae";
  const gold = "#c9a227";
  const glass = "#8fd3ff";
  const white = "#f4f4f4";

  // Mount hub: the root of the rig, sitting on top of the tripod.
  const hub = b.joint("hub", { at: [0, 0.92, 0] });

  // Tripod legs: three tapered wooden rods from the hub to the floor, with dark feet.
  const feet: Array<[number, number]> = [
    [0, 0.5],
    [-0.433, -0.25],
    [0.433, -0.25],
  ];
  feet.forEach(([x, z], i) => {
    b.rod(hub, [x, 0, z], [0.024, 0.014], { color: wood, name: `leg${i + 1}` });
    b.part(new THREE.SphereGeometry(0.028, 8, 6), dark, { at: [x, 0.02, z], bone: hub, name: `foot${i + 1}` });
  });

  // Spreader tray and azimuth head.
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16), wood, { at: [0, 0.8, 0], bone: hub, name: "tray" });
  b.part(new THREE.CylinderGeometry(0.11, 0.12, 0.04, 16), dark, { at: [0, 0.98, 0], bone: hub, name: "azimuth" });

  // Fork arms and altitude pin.
  for (const x of [-0.105, 0.105]) {
    b.part(new THREE.BoxGeometry(0.025, 0.16, 0.05), dark, { at: [x, 1.02, 0], bone: hub, name: "fork" });
  }
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 10), silver, {
    at: [0, 1.02, 0],
    dir: [1, 0, 0],
    bone: hub,
    name: "pin",
  });

  // The tube pivots on the fork at 35 degrees of elevation, pointing toward +Z.
  const elevation = (35 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation)); // along the tube
  const N = new THREE.Vector3(0, Math.cos(elevation), -Math.sin(elevation)); // up, across the tube
  const P = new THREE.Vector3(0, 1.02, 0);
  const tube = b.joint("tube", { parent: hub, at: P, dir: D, role: "hinge" });

  // Point at distance t along the tube and o across it.
  const along = (t: number, o = 0) => P.clone().addScaledVector(D, t).addScaledVector(N, o);

  // Main optical tube.
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 20), blue, {
    at: along(0.3),
    dir: D,
    bone: tube,
    name: "tube",
  });
  // White collars give the tube its banded look.
  for (const t of [0.05, 0.55]) {
    b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.05, 20), white, {
      at: along(t),
      dir: D,
      bone: tube,
      name: "collar",
    });
  }
  // Dew shield at the front, with the glass set just inside it.
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 20), dark, { at: along(0.85), dir: D, bone: tube, name: "shield" });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), glass, {
    at: along(0.94),
    dir: D,
    bone: tube,
    name: "lens",
  });

  // Rear: focuser on top, eyepiece holder and gold eyepiece.
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.05), silver, {
    at: along(-0.02, 0.11),
    dir: D,
    bone: tube,
    name: "focuser",
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 16), silver, {
    at: along(-0.2),
    dir: D,
    bone: tube,
    name: "holder",
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.12, 14), gold, {
    at: along(-0.31),
    dir: D,
    bone: tube,
    name: "eyepiece",
  });

  // Dovetail bar under the tube, and a finder scope on top.
  b.part(new THREE.BoxGeometry(0.05, 0.5, 0.03), dark, { at: along(0.1, -0.1), dir: D, bone: tube, name: "dovetail" });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.36, 14), dark, {
    at: along(0.2, 0.17),
    dir: D,
    bone: tube,
    name: "finder",
  });

  return b.root;
}
```