```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "garden-snail-adventurer",
  description:
    "A grey-green garden snail with a caramel, chocolate and cream spiral shell, two eye stalks, and a ladybird riding on top of the shell.",
};

const CARAMEL = "#c27c3c";
const CHOCOLATE = "#4a2a1a";
const CREAM = "#f3e6c8";
const BODY = "#8fa08a";
const BODY_DARK = "#6f8068";
const BLACK = "#121212";
const RED = "#d7261e";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "garden-snail-adventurer" });
  const r = rng(7);

  // Skeleton: root body joint, a head joint at the front, and a shell joint riding the back.
  const hips = b.joint("hips", { at: [0, 0, 0] });
  const head = b.joint("head", { at: [0, 0.05, 0.12], parent: hips });

  // Foot / body: a soft sweep from tail to head, sitting on the floor.
  const bodyPath = [
    [0, 0.03, -0.12],
    [0, 0.03, -0.04],
    [0, 0.03, 0.05],
    [0, 0.034, 0.11],
  ];
  b.sweep(bodyPath, 0.03, { color: BODY });

  // Head: a rounded mass that carries the stalks and feelers.
  const headGeo = new THREE.SphereGeometry(0.034, 14, 10);
  headGeo.scale(1, 0.9, 1.1);
  b.part(headGeo, BODY, { at: [0, 0.042, 0.135], bone: head });

  // Pebbly skin: small darker bumps scattered over the upper body.
  const bumpGeo = new THREE.SphereGeometry(0.0045, 6, 4);
  for (let i = 0; i < 46; i++) {
    const z = -0.1 + r() * 0.2;
    const theta = Math.PI * (0.05 + r() * 0.9);
    const rad = 0.03;
    const x = rad * Math.cos(theta) * 0.98;
    const y = 0.03 + rad * Math.sin(theta) * 0.98;
    b.part(bumpGeo, BODY_DARK, { at: [x, y, z], bone: hips });
  }

  // Shell: a caramel dome core with stacked spiral whorl bands in chocolate and cream.
  const shellCenter: [number, number, number] = [0, 0.09, -0.03];
  const domeGeo = new THREE.SphereGeometry(0.065, 18, 12);
  domeGeo.scale(1, 0.8, 1);
  b.part(domeGeo, CARAMEL, { at: shellCenter, bone: hips });

  const bands = [CHOCOLATE, CREAM, CHOCOLATE, CREAM, CHOCOLATE];
  for (let i = 0; i < bands.length; i++) {
    const dy = -0.03 + i * 0.015;
    const ringR = 0.066 * Math.sqrt(Math.max(0.05, 1 - (dy / 0.052) ** 2));
    const torusGeo = new THREE.TorusGeometry(ringR, 0.0075, 8, 28);
    torusGeo.rotateX(Math.PI / 2);
    // Each whorl nudges sideways a touch, so the stack reads as a coil.
    b.part(torusGeo, bands[i], {
      at: [0.004 * i, shellCenter[1] + dy * 0.8, shellCenter[2]],
      bone: hips,
    });
  }

  // Eye stalks: long, thin, rising from the head and bending outward.
  const stalkPaths: [number, number][] = [
    [-1, 1],
    [1, 1],
  ];
  for (const [side] of stalkPaths) {
    const x = side * 0.012;
    const stalkPath = [
      [x, 0.072, 0.142],
      [x * 1.2, 0.1, 0.15],
      [x * 1.5, 0.125, 0.158],
      [x * 1.6, 0.14, 0.162],
    ];
    b.sweep(stalkPath, 0.0038, { color: BODY });

    const eyeGeo = new THREE.SphereGeometry(0.0055, 10, 8);
    b.part(eyeGeo, BLACK, { at: [x * 1.6, 0.143, 0.164], bone: head });
  }

  // Short feelers below the stalks.
  for (const side of [-1, 1]) {
    const x = side * 0.012;
    const feelerPath = [
      [x, 0.058, 0.158],
      [x * 1.3, 0.075, 0.172],
      [x * 1.5, 0.085, 0.18],
    ];
    b.sweep(feelerPath, 0.0028, { color: BODY });
  }

  // Ladybird: a red half-dome with black spots and a black head, perched on the shell top.
  const ladyBase: [number, number, number] = [0.012, 0.152, -0.02];
  const ladyR = 0.009;
  const ladyDomeGeo = new THREE.SphereGeometry(ladyR, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  ladyDomeGeo.scale(1, 0.6, 1);
  b.part(ladyDomeGeo, RED, { at: ladyBase, bone: hips });

  const spotGeo = new THREE.SphereGeometry(0.0025, 6, 4);
  const spotAngles: [number, number][] = [
    [0.5, 0.2],
    [0.5, 2.2],
    [0.5, 4.2],
    [0.9, 1.2],
    [0.9, 3.2],
    [0.9, 5.2],
  ];
  for (const [phi, theta] of spotAngles) {
    const sx = ladyR * 1.02 * Math.sin(phi) * Math.cos(theta);
    const sy = ladyR * 0.6 * 1.02 * Math.cos(phi);
    const sz = ladyR * 1.02 * Math.sin(phi) * Math.sin(theta);
    b.part(spotGeo, BLACK, {
      at: [ladyBase[0] + sx, ladyBase[1] + sy, ladyBase[2] + sz],
      bone: hips,
    });
  }

  const ladyHeadGeo = new THREE.SphereGeometry(0.0045, 8, 6);
  b.part(ladyHeadGeo, BLACK, {
    at: [ladyBase[0], ladyBase[1] + 0.001, ladyBase[2] + ladyR * 0.95],
    bone: hips,
  });

  // Tiny white glints on the snail's eyes for a bit of life.
  const glintGeo = new THREE.SphereGeometry(0.0018, 6, 4);
  for (const side of [-1, 1]) {
    const x = side * 0.012 * 1.6;
    b.part(glintGeo, WHITE, { at: [x + side * 0.002, 0.148, 0.169], bone: head });
  }

  return b.root;
}
```