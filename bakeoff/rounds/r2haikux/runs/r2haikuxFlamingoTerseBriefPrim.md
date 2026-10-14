```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "flamingo",
  description:
    "A greater flamingo standing in shallow water: S-curved neck, two-part hooked beak with a black tip, black-tipped folded wings, backward-bending stilt legs and webbed feet.",
};

type P = [number, number, number];

const BODY = "#ffb1c6";
const BREAST = "#ffd3de";
const WING = "#ff7fa6";
const TAIL = "#ff8fb1";
const TAIL_TIP = "#ffc3d4";
const NECK = "#ffa3c0";
const HEAD = "#ffd9e4";
const LEG = "#ff4f7e";
const FOOT = "#f23f72";
const BLACK = "#1a171d";
const BEAK = "#ffc9d8";
const EYE = "#fff4c7";
const WATER = "#6fc7cc";
const RIPPLE = "#f4fdff";
const PEBBLE = "#b9a79a";

const mid = (a: P, c: P): P => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const span = (a: P, c: P) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
const toward = (a: P, c: P): P => {
  const l = span(a, c);
  return [(c[0] - a[0]) / l, (c[1] - a[1]) / l, (c[2] - a[2]) / l];
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  type Bone = ReturnType<typeof b.joint>;

  // A stick from a (radius r0) to c (radius r1), riding one bone.
  const stick = (a: P, c: P, r0: number, r1: number, color: string, bone: Bone) => {
    b.part(new THREE.CylinderGeometry(r1, r0, span(a, c), 8), color, {
      at: mid(a, c),
      dir: toward(a, c),
      bone,
    });
  };

  // A ball stretched per axis.
  const blob = (p: P, radii: P, color: string, bone: Bone) => {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(radii[0], radii[1], radii[2]);
    b.part(g, color, { at: p, bone });
  };

  // Webbed foot: a three-toed fan lying flat, toes forward, sole at y = 0.
  const webShape = new THREE.Shape();
  webShape.moveTo(0, -0.025);
  webShape.lineTo(0.07, 0.05);
  webShape.lineTo(0.025, 0.08);
  webShape.lineTo(0, 0.13);
  webShape.lineTo(-0.025, 0.08);
  webShape.lineTo(-0.07, 0.05);
  webShape.closePath();
  const webGeo = new THREE.ExtrudeGeometry(webShape, { depth: 0.008, bevelEnabled: false });
  webGeo.rotateX(Math.PI / 2);
  webGeo.translate(0, 0.006, 0);

  // Skeleton: hips at the root, chest and tail off it.
  const hips = b.joint("hips", { at: [0, 0.84, -0.02] });
  const chest = b.joint("chest", { at: [0, 0.9, 0.12], parent: hips });
  const tail = b.joint("tail", { at: [0, 0.92, -0.2], parent: hips });

  // Body: a teardrop with the tail lifted and the chest dipped, plus a puffed breast.
  const bodyG = new THREE.SphereGeometry(1, 12, 9);
  bodyG.scale(0.15, 0.14, 0.27);
  bodyG.rotateX(0.22);
  b.part(bodyG, BODY, { at: [0, 0.89, -0.02], bone: hips });
  blob([0, 0.87, 0.13], [0.13, 0.13, 0.14], BREAST, chest);

  // Tail: a cone flicked up behind, with a small fan of tail feathers.
  const tailBase: P = [0, 0.92, -0.2];
  const tailDir: P = [0, 0.6, -0.8];
  const tailTip: P = [0, 0.92 + 0.22 * 0.6, -0.2 - 0.22 * 0.8];
  b.part(new THREE.ConeGeometry(0.07, 0.22, 8), TAIL, {
    at: mid(tailBase, tailTip),
    dir: tailDir,
    bone: tail,
  });
  for (const f of [-0.45, 0.45]) {
    const l = Math.sqrt(f * f + 1);
    const d: P = [f / l, 0.6 / l, -0.8 / l];
    const e: P = [
      tailBase[0] + 0.17 * d[0],
      tailBase[1] + 0.17 * d[1],
      tailBase[2] + 0.17 * d[2],
    ];
    b.part(new THREE.ConeGeometry(0.045, 0.17, 6), TAIL_TIP, {
      at: mid(tailBase, e),
      dir: d,
      bone: tail,
    });
  }

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Leg: hip inside the body, knee bending backward, ankle, webbed foot on the floor.
    const hipP: P = [s * 0.075, 0.78, 0.02];
    const kneeP: P = [s * 0.08, 0.4, -0.05];
    const ankleP: P = [s * 0.08, 0.06, 0.02];
    const footP: P = [s * 0.08, 0, 0.03];
    const hip = b.joint(`hip${L}`, { at: hipP, parent: hips });
    const knee = b.joint(`knee${L}`, { at: kneeP, parent: hip });
    const ankle = b.joint(`ankle${L}`, { at: ankleP, parent: knee });
    const foot = b.joint(`foot${L}`, { at: footP, parent: ankle });
    stick(hipP, kneeP, 0.021, 0.017, LEG, hip);
    stick(kneeP, ankleP, 0.016, 0.012, LEG, knee);
    stick(ankleP, footP, 0.012, 0.011, LEG, ankle);
    b.part(webGeo.clone(), FOOT, { at: footP, bone: foot });

    // Wing: folded along the flank, black flight feathers trailing behind.
    const wing = b.joint(`wing${L}`, { at: [s * 0.11, 0.92, 0.02], parent: chest });
    blob([s * 0.128, 0.9, -0.05], [0.036, 0.085, 0.25], WING, wing);
    blob([s * 0.126, 0.885, -0.33], [0.03, 0.045, 0.12], BLACK, wing);
    blob([s * 0.12, 0.87, -0.41], [0.026, 0.038, 0.085], BLACK, wing);
  }

  // Neck: eleven short segments along an S-curve, each on its own joint,
  // so the neck bends at every joint.
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.98, 0.16),
    new THREE.Vector3(0, 1.08, 0.25),
    new THREE.Vector3(0, 1.18, 0.3),
    new THREE.Vector3(0, 1.27, 0.27),
    new THREE.Vector3(0, 1.35, 0.21),
    new THREE.Vector3(0, 1.41, 0.23),
    new THREE.Vector3(0, 1.45, 0.31),
  ]);
  const N = 11;
  const pts: P[] = [];
  for (let i = 0; i < N; i++) {
    const q = spine.getPointAt(i / (N - 1));
    pts.push([q.x, q.y, q.z]);
  }
  const radius = (i: number) => 0.043 - 0.008 * (i / (N - 1));
  const headC: P = [0, 1.47, 0.38];

  const neck: Bone[] = [];
  pts.forEach((p, i) => {
    neck.push(b.joint(`neck${i + 1}`, { at: p, parent: i === 0 ? chest : neck[i - 1] }));
  });
  for (let i = 0; i < N; i++) {
    const to = i + 1 < N ? pts[i + 1] : headC;
    stick(pts[i], to, radius(i), i + 1 < N ? radius(i + 1) : 0.04, NECK, neck[i]);
  }

  // Head, with a jaw hinge for the lower beak.
  const head = b.joint("head", { at: headC, parent: neck[N - 1] });
  blob(headC, [0.072, 0.075, 0.085], HEAD, head);

  const jaw = b.joint("jaw", { at: [0, 1.43, 0.42], parent: head });

  // Beak: pale base and black tip on the upper mandible, black lower mandible.
  stick([0, 1.46, 0.44], [0, 1.41, 0.52], 0.032, 0.025, BEAK, head);
  stick([0, 1.41, 0.52], [0, 1.36, 0.6], 0.025, 0.006, BLACK, head);
  stick([0, 1.43, 0.44], [0, 1.36, 0.58], 0.02, 0.007, BLACK, jaw);

  // Eyes: pale irises with black pupils, set on the sides of the head.
  for (const s of [1, -1]) {
    blob([s * 0.064, 1.478, 0.405], [0.017, 0.017, 0.017], EYE, head);
    blob([s * 0.077, 1.48, 0.418], [0.008, 0.008, 0.008], BLACK, head);
  }

  // Shallow pool with ripple rings and pebbles on the rim.
  b.part(new THREE.CylinderGeometry(0.5, 0.52, 0.008, 18), WATER, {
    at: [0, -0.004, 0.02],
    bone: hips,
  });
  for (const r of [0.24, 0.38]) {
    const ring = new THREE.TorusGeometry(r, 0.005, 4, 28);
    ring.rotateX(Math.PI / 2);
    b.part(ring, RIPPLE, { at: [0, 0.003, 0.02], bone: hips });
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    blob(
      [0.56 * Math.sin(a), 0, 0.02 + 0.56 * Math.cos(a)],
      [0.03 + 0.01 * (i % 2), 0.012, 0.025],
      PEBBLE,
      hips,
    );
  }

  return b.root;
}
```