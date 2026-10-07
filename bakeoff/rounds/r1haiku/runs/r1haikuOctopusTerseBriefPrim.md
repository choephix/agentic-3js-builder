```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "octopus",
  description:
    "A purple octopus with a bulbous mantle, a pointed rear tail, big eyes with pupils, coral spots, and eight suckered arms curling across the floor.",
};

// Deterministic pseudo-random in [0, 1) from an integer seed.
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const COLOR = {
  mantle: "#9b5de5",
  arm: "#7b3fbf",
  sucker: "#f4c2ff",
  eyeWhite: "#fff6e0",
  pupil: "#1b0f2e",
  spot: "#ff6b9a",
};

// Arm stations: [radial distance, height, sweep angle, tube radius]
const STATIONS: [number, number, number, number][] = [
  [0.12, 0.3, 0.0, 0.075],
  [0.28, 0.16, 0.1, 0.06],
  [0.45, 0.07, 0.25, 0.05],
  [0.56, 0.045, 0.55, 0.042],
  [0.56, 0.05, 0.95, 0.036],
  [0.47, 0.06, 1.25, 0.032],
  [0.38, 0.13, 1.45, 0.027],
  [0.33, 0.24, 1.6, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "octopus" });

  // Skeleton root sits in the mantle core.
  const body = b.joint("body", { at: [0, 0.4, 0] });

  // Mantle: a stretched sphere, scaled in the geometry itself.
  const mantleGeo = new THREE.SphereGeometry(0.22, 24, 16);
  mantleGeo.scale(1.0, 1.45, 1.05);
  b.part(mantleGeo, COLOR.mantle, { at: [0, 0.58, 0] });

  // Pointed rear tail of the mantle.
  const tailGeo = new THREE.ConeGeometry(0.14, 0.3, 14);
  b.part(tailGeo, COLOR.mantle, {
    at: [0, 0.8, -0.14],
    aim: [0, 0.95, -0.3],
  });

  // Coral spots scattered over the mantle's upper body.
  for (let k = 0; k < 14; k++) {
    const u = hash(k * 2 + 1);
    const v = hash(k * 2 + 2);
    const phi = 0.5 + v * 1.9; // polar angle from the top
    const theta = u * Math.PI * 2;
    const p = new THREE.Vector3(
      0.22 * Math.sin(phi) * Math.cos(theta),
      0.58 + 0.319 * Math.cos(phi),
      0.231 * Math.sin(phi) * Math.sin(theta),
    );
    const spotGeo = new THREE.SphereGeometry(0.02, 8, 6);
    spotGeo.scale(1, 0.5, 1);
    b.part(spotGeo, COLOR.spot, { at: p });
  }

  // Eyes: white globes with dark pupils on the front of the mantle.
  for (const side of [1, -1]) {
    const eyeX = 0.12 * side;
    const eyeC = new THREE.Vector3(eyeX, 0.6, 0.19);
    b.part(new THREE.SphereGeometry(0.07, 14, 10), COLOR.eyeWhite, { at: eyeC });
    b.part(new THREE.SphereGeometry(0.035, 10, 8), COLOR.pupil, {
      at: [eyeX * 1.05, 0.6, 0.25],
    });
  }

  // Eight arms: a joint chain per arm, a tapering tube per segment.
  for (let i = 0; i < 8; i++) {
    const theta = (i / 8) * Math.PI * 2;
    const sign = i < 4 ? 1 : -1;

    const pts: THREE.Vector3[] = STATIONS.map(([d, h, phi]) => {
      const a = theta + sign * phi;
      return new THREE.Vector3(Math.cos(a) * d, h, Math.sin(a) * d);
    });
    const radii = STATIONS.map((s) => s[3]);

    // Joints along the arm, each parented to the previous one.
    let parent: any = body;
    pts.forEach((p, j) => {
      parent = b.joint(`arm${i}_${j}`, { at: p, parent });
    });

    // Tapering segments: each aimed from one joint to the next.
    for (let j = 0; j < pts.length - 1; j++) {
      const a = pts[j];
      const c = pts[j + 1];
      const len = a.distanceTo(c);
      const geo = new THREE.CylinderGeometry(
        radii[j + 1],
        radii[j],
        len * 1.08,
        10,
      );
      const mid = a.clone().add(c).multiplyScalar(0.5);
      b.part(geo, COLOR.arm, { at: mid, aim: c });
    }

    // Suckers on the underside of the middle and outer arm.
    for (const j of [2, 4, 6]) {
      const p = pts[j];
      const r = radii[j];
      const sGeo = new THREE.SphereGeometry(r * 0.5, 8, 6);
      sGeo.scale(1, 0.4, 1);
      b.part(sGeo, COLOR.sucker, {
        at: [p.x, p.y - r * 0.85, p.z],
      });
    }
  }

  return b.root;
}
```