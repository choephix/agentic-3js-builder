```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "A wind-up terrier in polished brass and copper: riveted plates, a gear-filled chest, a winding key, springy legs, floppy leather ears, green lens eyes, a coiled spring tail and a red collar with a brass tag.",
};

// Palette
const BRASS = "#d4a72c";
const BRASS_DARK = "#a57f1c";
const COPPER = "#b87333";
const IRON = "#3a3a40";
const LEATHER = "#6b3d22";
const LENS = "#6fe0a0";
const RED = "#b3262e";
const NOSE = "#1d1d20";

export default function build() {
  const b = createBuilder({ name: "clockwork-terrier" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone });

  const ball = (r: number, c: string, at: number[], bone: any) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), c, { at, bone });

  // cylinder whose axis points along +Z (faces forward)
  const cylZ = (r: number, h: number, c: string, at: number[], bone: any, seg = 14) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateX(Math.PI / 2);
    return b.part(g, c, { at, bone });
  };

  // ring lying in the horizontal XZ plane
  const ringH = (R: number, tube: number, c: string, at: number[], bone: any) => {
    const g = new THREE.TorusGeometry(R, tube, 6, 16);
    g.rotateX(Math.PI / 2);
    return b.part(g, c, { at, bone });
  };

  // ring facing forward (plane XY)
  const ringF = (R: number, tube: number, c: string, at: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(R, tube, 6, 16), c, { at, bone });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const neck = b.joint("neck", { at: [0, 0.38, 0.2], parent: hips });
  const head = b.joint("head", { at: [0, 0.44, 0.27], parent: neck });
  const earL = b.joint("earL", { at: [0.055, 0.5, 0.3], parent: head });
  const earR = b.joint("earR", { at: [-0.055, 0.5, 0.3], parent: head });
  const gearA = b.joint("gearA", { at: [0, 0.33, 0.27], parent: hips });

  const legs = [
    { p: "frontL", x: 0.075, z: 0.15 },
    { p: "frontR", x: -0.075, z: 0.15 },
    { p: "backL", x: 0.075, z: -0.15 },
    { p: "backR", x: -0.075, z: -0.15 },
  ].map(({ p, x, z }) => {
    const hip = b.joint(`hip_${p}`, { at: [x, 0.28, z], parent: hips });
    const knee = b.joint(`knee_${p}`, { at: [x, 0.15, z], parent: hip });
    const ankle = b.joint(`ankle_${p}`, { at: [x, 0.03, z], parent: knee });
    return { x, z, hip, knee, ankle };
  });

  // Tail: a short arched chain; the coiled spring is swept along its centreline below.
  b.chain("tail", [
    [0, 0.34, -0.2],
    [0, 0.4, -0.31],
    [0, 0.5, -0.38],
  ]);

  // ---------- torso: dark core with brass and copper plates ----------
  box(0.3, 0.13, 0.46, IRON, [0, 0.32, 0], hips);
  box(0.32, 0.024, 0.48, BRASS, [0, 0.4, 0], hips); // top plate
  box(0.024, 0.12, 0.46, COPPER, [0.162, 0.32, 0], hips); // side plates
  box(0.024, 0.12, 0.46, COPPER, [-0.162, 0.32, 0], hips);
  box(0.26, 0.12, 0.02, BRASS_DARK, [0, 0.32, 0.245], hips); // chest plate
  box(0.2, 0.02, 0.1, BRASS_DARK, [0, 0.245, -0.19], hips); // belly plate

  // rivets along the plates
  for (const y of [0.28, 0.36]) {
    for (const z of [-0.17, -0.05, 0.07, 0.17]) {
      ball(0.007, COPPER, [0.175, y, z], hips);
      ball(0.007, COPPER, [-0.175, y, z], hips);
    }
  }
  for (const x of [-0.1, 0, 0.1]) {
    for (const z of [-0.17, 0, 0.17]) {
      ball(0.007, COPPER, [x, 0.415, z], hips);
    }
  }
  for (const x of [-0.1, 0.1]) {
    ball(0.007, COPPER, [x, 0.33, 0.257], hips); // chest rivets
  }

  // ---------- chest gears (visible movement mechanism) ----------
  cylZ(0.05, 0.02, BRASS, [0, 0.33, 0.265], gearA, 16);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    box(0.013, 0.013, 0.02, BRASS, [0.058 * Math.cos(a), 0.33 + 0.058 * Math.sin(a), 0.265], gearA);
  }
  cylZ(0.026, 0.024, COPPER, [0.045, 0.37, 0.27], gearA, 12); // small meshing gear
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    box(0.009, 0.009, 0.02, COPPER, [0.045 + 0.03 * Math.cos(a), 0.37 + 0.03 * Math.sin(a), 0.27], gearA);
  }
  // glass window ring around the gears
  ringF(0.062, 0.006, BRASS, [0, 0.33, 0.27], gearA);

  // ---------- winding key on the back ----------
  box(0.022, 0.05, 0.022, BRASS, [0, 0.435, -0.05], hips);
  ringF(0.035, 0.008, BRASS, [0, 0.49, -0.05], hips);
  box(0.03, 0.012, 0.03, COPPER, [0, 0.412, -0.05], hips);

  // ---------- legs: springy brass and copper with coiled knee joints ----------
  for (const L of legs) {
    const { x, z, hip, knee, ankle } = L;
    box(0.05, 0.14, 0.05, IRON, [x, 0.215, z], hip); // upper leg
    box(0.036, 0.12, 0.036, COPPER, [x, 0.09, z], knee); // lower leg
    ball(0.022, BRASS, [x, 0.15, z], knee); // knee joint
    ringF(0.02, 0.004, COPPER, [x, 0.15, z + 0.023], knee);
    box(0.07, 0.02, 0.1, BRASS_DARK, [x, 0.01, z + 0.02], ankle); // foot
    ball(0.016, BRASS, [x, 0.03, z], ankle);
  }

  // ---------- neck, collar and tag ----------
  box(0.12, 0.12, 0.14, IRON, [0, 0.4, 0.22], neck);
  ringH(0.078, 0.013, RED, [0, 0.4, 0.22], neck);
  cylZ(0.018, 0.005, BRASS, [0, 0.31, 0.3], neck, 14);
  box(0.004, 0.02, 0.004, BRASS, [0, 0.33, 0.297], neck); // tag ring link
  ringF(0.007, 0.002, BRASS, [0, 0.34, 0.297], neck);

  // ---------- head ----------
  box(0.13, 0.11, 0.13, IRON, [0, 0.46, 0.3], head);
  box(0.13, 0.024, 0.13, BRASS, [0, 0.52, 0.3], head); // skull plate
  box(0.08, 0.07, 0.1, BRASS, [0, 0.44, 0.4], head); // snout
  box(0.084, 0.02, 0.1, COPPER, [0, 0.48, 0.4], head); // snout top plate
  ball(0.02, NOSE, [0, 0.45, 0.455], head);
  for (const x of [0.05, -0.05]) {
    ball(0.022, LENS, [x, 0.48, 0.37], head); // green-tinted glass lens
    ringF(0.027, 0.006, BRASS, [x, 0.48, 0.37], head); // brass eye rim
    ball(0.008, "#ffffff", [x + 0.006 * Math.sign(x), 0.487, 0.39], head); // glint
  }
  ball(0.012, COPPER, [0.075, 0.46, 0.3], head); // rivets on skull
  ball(0.012, COPPER, [-0.075, 0.46, 0.3], head);

  // floppy leather ears hinged at the head
  for (const [ear, sx] of [
    [earL, 1],
    [earR, -1],
  ] as const) {
    const g = new THREE.BoxGeometry(0.035, 0.11, 0.012);
    b.part(g, LEATHER, { at: [0.055 * sx, 0.455, 0.29], bone: ear, dir: [0.3 * sx, -1, -0.15] });
    b.part(new THREE.SphereGeometry(0.006, 6, 6), BRASS, {
      at: [0.058 * sx, 0.5, 0.3],
      bone: ear,
    });
  }

  // ---------- coiled spring tail ----------
  const coil: number[][] = [];
  const turns = 9;
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cy = 0.34 + 0.16 * t;
    const cz = -0.2 - 0.18 * t;
    const ang = t * turns * Math.PI * 2;
    const r = 0.028 * (1 - 0.3 * t);
    coil.push([r * Math.cos(ang), cy + r * Math.sin(ang), cz]);
  }
  b.sweep(coil, 0.008, { color: COPPER });
  // tip ball on the tail
  ball(0.018, BRASS, [0, 0.5, -0.38], hips);

  return b.root;
}
```