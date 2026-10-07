```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Clockwork dog",
  description:
    "A copper clockwork hound on four jointed legs, with a boiler back, a chimney, a brass gear flank, a winding key, a clock-face chest and a coiled spring tail.",
};

const COPPER = "#b5652f";
const COPPER_DARK = "#8a4a22";
const BELLY = "#e0b872";
const BRASS = "#c8912e";
const GOLD = "#e8c15a";
const IRON = "#3b3f47";
const CREAM = "#f3e6c3";
const GLASS = "#7fe7ff";
const BLACK = "#1d1d22";

export default function build() {
  const b = createBuilder({ name: "clockwork-dog" });

  // ---- Skeleton -----------------------------------------------------------
  const body = b.joint("body", { at: [0, 0.62, 0] });
  const head = b.joint("head", { at: [0, 1.0, 0.62], parent: body });
  const jaw = b.joint("jaw", { at: [0, 0.92, 0.76], parent: head });

  // Helper: a cylinder stretched from point a to point c, riding a joint.
  const seg = (a: number[], c: number[], r: number, color: string, bone: any) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const dir = d.map((v) => v / len);
    const at = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part(new THREE.CylinderGeometry(r * 0.8, r, len, 8), color, { at, dir, bone });
  };

  // Four legs: hip -> knee -> ankle, each a named joint chain.
  const leg = (name: string, x: number, z: number, rear: boolean) => {
    const hipP = [x, 0.56, z];
    const kneeP = rear ? [x, 0.3, z + 0.04] : [x, 0.3, z - 0.03];
    const ankleP = rear ? [x, 0.08, z - 0.06] : [x, 0.07, z + 0.03];

    const hip = b.joint(`${name}Hip`, { at: hipP, parent: body });
    const knee = b.joint(`${name}Knee`, { at: kneeP, parent: hip });
    const ankle = b.joint(`${name}Ankle`, { at: ankleP, parent: knee });

    b.part(new THREE.SphereGeometry(0.056, 10, 8), BRASS, { at: hipP, bone: hip });
    seg(hipP, kneeP, 0.05, COPPER, hip);
    b.part(new THREE.SphereGeometry(0.036, 8, 6), BRASS, { at: kneeP, bone: knee });
    seg(kneeP, ankleP, 0.04, IRON, knee);
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.14), IRON, {
      at: [x, 0.025, ankleP[2] + 0.02],
      bone: ankle,
    });
  };
  leg("frontL", 0.14, 0.26, false);
  leg("frontR", -0.14, 0.26, false);
  leg("rearL", 0.14, -0.26, true);
  leg("rearR", -0.14, -0.26, true);

  // ---- Torso --------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.36, 0.3, 0.34), COPPER, { at: [0, 0.7, 0.26], bone: body });
  b.part(new THREE.BoxGeometry(0.36, 0.28, 0.32), COPPER, { at: [0, 0.66, -0.26], bone: body });
  b.part(new THREE.BoxGeometry(0.32, 0.12, 0.8), BELLY, { at: [0, 0.52, 0], bone: body });

  // Riveted side panels (left flank).
  b.part(new THREE.BoxGeometry(0.02, 0.22, 0.36), COPPER_DARK, {
    at: [0.185, 0.66, -0.12],
    bone: body,
  });
  for (let i = 0; i < 4; i++) {
    const z = -0.26 + i * 0.09;
    b.part(new THREE.SphereGeometry(0.012, 6, 5), BRASS, { at: [0.198, 0.56, z], bone: body });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), BRASS, { at: [0.198, 0.76, z], bone: body });
  }

  // Boiler along the back, with iron end caps.
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 14), BRASS, {
    at: [0, 0.9, 0],
    dir: [0, 0, 1],
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.025, 14), IRON, {
    at: [0, 0.9, 0.3],
    dir: [0, 0, 1],
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.025, 14), IRON, {
    at: [0, 0.9, -0.3],
    dir: [0, 0, 1],
    bone: body,
  });

  // Chimney with a flared cap.
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.2, 10), IRON, {
    at: [0, 1.12, -0.2],
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 10), BRASS, {
    at: [0, 1.23, -0.2],
    bone: body,
  });

  // Clock face on the chest, facing +Z.
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 20), CREAM, {
    at: [0, 0.72, 0.455],
    dir: [0, 0, 1],
    bone: body,
  });
  b.part(new THREE.TorusGeometry(0.088, 0.008, 6, 20), BRASS, {
    at: [0, 0.72, 0.47],
    bone: body,
  });
  b.part(new THREE.BoxGeometry(0.008, 0.06, 0.006), BLACK, { at: [0, 0.75, 0.48], bone: body });
  b.part(new THREE.BoxGeometry(0.05, 0.008, 0.006), BLACK, { at: [0.022, 0.72, 0.48], bone: body });

  // Brass gear on the right flank: disc, hub and twelve teeth.
  const gearC = [-0.19, 0.68, 0.12];
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), BRASS, {
    at: gearC,
    dir: [1, 0, 0],
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), GOLD, {
    at: gearC,
    dir: [1, 0, 0],
    bone: body,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = [0, Math.cos(a), Math.sin(a)];
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.025), GOLD, {
      at: [gearC[0] + r[0] * 0.088, gearC[1] + r[1] * 0.088, gearC[2] + r[2] * 0.088],
      dir: r,
      bone: body,
    });
  }

  // Winding key on the left flank: a ring plus a shaft.
  b.part(new THREE.TorusGeometry(0.04, 0.01, 6, 14), BRASS, {
    at: [0.2, 0.66, 0.1],
    dir: [1, 0, 0],
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), BRASS, {
    at: [0.2, 0.66, 0.1],
    dir: [1, 0, 0],
    bone: body,
  });

  // ---- Neck and head -------------------------------------------------------
  const neck = b.chain(
    "neck",
    [
      [0, 0.78, 0.3],
      [0, 0.92, 0.44],
      [0, 1.0, 0.6],
    ],
    { role: "neck" },
  );
  b.sweep(neck, 0.07, { color: COPPER_DARK });

  b.part(new THREE.BoxGeometry(0.24, 0.2, 0.26), COPPER, { at: [0, 1.0, 0.66], bone: head });
  b.part(new THREE.BoxGeometry(0.26, 0.04, 0.2), COPPER_DARK, { at: [0, 1.1, 0.64], bone: head });
  b.part(new THREE.BoxGeometry(0.16, 0.13, 0.24), COPPER, { at: [0, 0.97, 0.84], bone: head });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BLACK, { at: [0, 0.99, 0.965], bone: head });

  // Ears: cones tipped back.
  b.part(new THREE.ConeGeometry(0.05, 0.14, 4), COPPER_DARK, {
    at: [0.09, 1.15, 0.6],
    dir: [0.2, 1, -0.3],
    bone: head,
  });
  b.part(new THREE.ConeGeometry(0.05, 0.14, 4), COPPER_DARK, {
    at: [-0.09, 1.15, 0.6],
    dir: [-0.2, 1, -0.3],
    bone: head,
  });

  // Glass eyes in brass rings.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 10, 8), GLASS, {
      at: [0.08 * sx, 1.03, 0.8],
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.04, 0.01, 6, 12), BRASS, {
      at: [0.08 * sx, 1.03, 0.8],
      bone: head,
    });
  }

  // Jaw: separate lower jaw with cream fangs.
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.2), IRON, { at: [0, 0.91, 0.82], bone: jaw });
  for (const tx of [-0.05, 0, 0.05]) {
    b.part(new THREE.ConeGeometry(0.012, 0.03, 4), CREAM, {
      at: [tx, 0.9, 0.9],
      dir: [0, -1, 0],
      bone: jaw,
    });
  }

  // ---- Tail: a spring of brass coils on a curved chain ----------------------
  const tail = b.chain(
    "tail",
    [
      [0, 0.66, -0.44],
      [0, 0.7, -0.6],
      [0, 0.84, -0.72],
      [0, 0.98, -0.74],
    ],
    { role: "tail" },
  );
  b.sweep(tail, 0.03, { color: IRON });
  b.along(tail, 7, (at: any) => {
    b.part(new THREE.TorusGeometry(0.05, 0.01, 6, 12), BRASS, { frame: at });
  });

  return b.root;
}
```