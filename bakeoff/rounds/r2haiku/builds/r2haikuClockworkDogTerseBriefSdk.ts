import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "clockwork dog",
  description: "A brass-and-iron clockwork hound with a glass chest window, exposed gears, a wind-up key and a jointed rig.",
};

const BRASS = "#c99a3c";
const COPPER = "#9c5a2c";
const IRON = "#3a3f47";
const DARK = "#1e2226";
const GLASS = "#7fe6ff";
const AMBER = "#ffb000";

export default function build() {
  const b = createBuilder({ name: "clockwork dog" });
  const rand = rng(7);

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.56, 0] });
  const head = b.joint("head", { at: [0, 0.68, 0.34], parent: hips });

  const legs: Record<string, ReturnType<typeof b.joint>> = {};
  const legSpots: [string, number, number][] = [
    ["FL", 0.08, 0.19],
    ["FR", -0.08, 0.19],
    ["BL", 0.08, -0.19],
    ["BR", -0.08, -0.19],
  ];
  for (const [tag, x, z] of legSpots) {
    legs[tag] = b.joint(`hip${tag}`, { at: [x, 0.48, z], parent: hips });
  }

  // ---- Body: blocky brass chassis ----
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.52), BRASS, { at: [0, 0.56, 0], bone: hips });
  // chest plate and rear plate
  b.part(new THREE.BoxGeometry(0.22, 0.22, 0.08), COPPER, { at: [0, 0.56, 0.26], bone: hips });
  b.part(new THREE.BoxGeometry(0.18, 0.04, 0.44), DARK, { at: [0, 0.67, 0], bone: hips });

  // glass chest window showing the movement
  b.part(new THREE.SphereGeometry(0.055, 12, 8), GLASS, { at: [0, 0.57, 0.3], bone: hips });
  const rimGeo = new THREE.TorusGeometry(0.06, 0.008, 6, 16);
  b.part(rimGeo, BRASS, { at: [0, 0.57, 0.292], bone: hips });

  // rivets along both flanks
  for (const side of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = -0.2 + i * 0.08;
      const y = 0.5 + rand() * 0.02;
      b.part(new THREE.SphereGeometry(0.008, 6, 4), DARK, { at: [side * 0.101, y, z], bone: hips });
    }
  }

  // ---- Exposed gears on each flank ----
  const axisToX = new THREE.Matrix4().makeRotationY(Math.PI / 2);

  function gear(cx: number, cy: number, cz: number, r: number, teeth: number, color: string) {
    const disc = new THREE.CylinderGeometry(r, r, 0.022, 18);
    disc.rotateX(Math.PI / 2);
    disc.applyMatrix4(axisToX);
    b.part(disc, color, { at: [cx, cy, cz], bone: hips });
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const t = new THREE.BoxGeometry(0.03, 0.035, 0.022);
      t.translate(0, r + 0.01, 0);
      t.rotateZ(a);
      t.applyMatrix4(axisToX);
      b.part(t, color, { at: [cx, cy, cz], bone: hips });
    }
    // axle cap
    const cap = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8);
    cap.rotateZ(Math.PI / 2);
    b.part(cap, DARK, { at: [cx + 0.012, cy, cz], bone: hips });
  }

  for (const side of [1, -1]) {
    const x = side * 0.112;
    gear(x, 0.6, 0.08, 0.07, 10, BRASS);
    gear(x, 0.5, 0.08, 0.045, 8, COPPER);
    gear(x, 0.56, -0.12, 0.055, 9, BRASS);
  }

  // ---- Wind-up key on the back ----
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), IRON, { at: [0, 0.7, -0.06], bone: hips });
  const keyRing = new THREE.TorusGeometry(0.04, 0.008, 6, 14);
  keyRing.rotateX(Math.PI / 2);
  b.part(keyRing, BRASS, { at: [0, 0.74, -0.06], bone: hips });
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.06), IRON, { at: [0, 0.745, -0.06], bone: hips });

  // ---- Legs: jointed, ending on the floor ----
  for (const [tag, x, z] of legSpots) {
    const hipZ = z;
    b.sweep(
      [
        [x, 0.5, hipZ],
        [x, 0.27, hipZ + 0.02],
        [x, 0.05, hipZ],
      ],
      0.038,
      { color: IRON, bone: legs[tag] },
    );
    // knee gear cap
    b.part(new THREE.SphereGeometry(0.035, 8, 6), BRASS, { at: [x, 0.27, hipZ + 0.02], bone: legs[tag] });
    // foot
    b.part(new THREE.BoxGeometry(0.07, 0.04, 0.1), DARK, { at: [x, 0.02, hipZ + 0.03], bone: legs[tag] });
  }

  // ---- Neck and head ----
  b.sweep(
    [
      [0, 0.6, 0.2],
      [0, 0.66, 0.27],
      [0, 0.7, 0.33],
    ],
    0.05,
    { color: COPPER, bone: head },
  );

  b.part(new THREE.BoxGeometry(0.14, 0.13, 0.16), BRASS, { at: [0, 0.72, 0.36], bone: head });
  b.part(new THREE.BoxGeometry(0.08, 0.07, 0.12), COPPER, { at: [0, 0.69, 0.46], bone: head });
  b.part(new THREE.BoxGeometry(0.07, 0.03, 0.1), DARK, { at: [0, 0.64, 0.44], bone: head });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.02), DARK, { at: [0, 0.7, 0.51], bone: head });

  // pointed ears
  for (const side of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.04, 0.1, 4), IRON, {
      at: [side * 0.055, 0.8, 0.33],
      bone: head,
    });
  }

  // amber eyes
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 8, 6), AMBER, {
      at: [side * 0.04, 0.74, 0.44],
      bone: head,
    });
  }

  // ---- Tail: a segmented spring-coil ----
  const tailPts: [number, number, number][] = [
    [0, 0.6, -0.27],
    [0, 0.66, -0.36],
    [0, 0.72, -0.42],
    [0, 0.78, -0.44],
  ];
  b.sweep(tailPts, 0.028, { color: IRON, bone: hips });
  for (let i = 0; i < tailPts.length; i++) {
    const [tx, ty, tz] = tailPts[i];
    const coil = new THREE.TorusGeometry(0.036, 0.006, 5, 12);
    coil.rotateX(Math.PI / 2);
    b.part(coil, BRASS, { at: [tx, ty, tz], bone: hips });
  }

  return b.root;
}
