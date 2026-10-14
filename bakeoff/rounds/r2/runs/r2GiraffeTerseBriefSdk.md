```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Giraffe",
  description: "A stylized low-poly giraffe built from primitives, with a rigged neck, legs, tail, jaw and a patched coat.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  const TAN = "#e0aa4a";
  const CREAM = "#f1d89a";
  const BROWN = "#8f4e1e";
  const BROWN2 = "#a65f27";
  const DARK = "#3a2314";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 2.9, -0.7] });
  const spine = b.joint("spine", { at: [0, 3.1, 0.2], parent: hips });
  const chest = b.joint("chest", { at: [0, 3.2, 0.9], parent: spine });
  const neck1 = b.joint("neck1", { at: [0, 3.5, 1.1], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 4.0, 1.4], parent: neck1 });
  const neck3 = b.joint("neck3", { at: [0, 4.5, 1.7], parent: neck2 });
  const head = b.joint("head", { at: [0, 4.95, 1.95], parent: neck3 });
  const jaw = b.joint("jaw", { at: [0, 4.88, 2.3], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 3.0, -1.35], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 2.5, -1.5], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 2.0, -1.5], parent: tail2 });

  const sph = (r: number, d = 1) => new THREE.IcosahedronGeometry(r, d);

  // ---------- torso ----------
  const body = b.part(new THREE.SphereGeometry(1, 12, 8), TAN, {
    at: [0, 3.1, 0.15], scale: [0.5, 0.6, 1.3], bone: spine,
  });
  const rump = b.part(new THREE.SphereGeometry(1, 10, 8), TAN, {
    at: [0, 2.95, -0.6], scale: [0.46, 0.52, 0.62], bone: hips,
  });
  const withers = b.part(new THREE.SphereGeometry(1, 10, 8), TAN, {
    at: [0, 3.25, 0.85], scale: [0.43, 0.56, 0.6], bone: chest,
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    at: [0, 2.75, 0.2], scale: [0.36, 0.3, 1.0], bone: spine,
  });

  // ---------- neck ----------
  const neck = b.sweep(
    [[0, 3.4, 1.0], [0, 4.0, 1.4], [0, 4.5, 1.7], [0, 4.95, 1.95]],
    0.19,
    { color: TAN },
  );
  // mane along back of neck
  const manePts = [[0, 3.55, 0.88], [0, 3.85, 1.08], [0, 4.15, 1.25], [0, 4.45, 1.42], [0, 4.75, 1.58], [0, 5.0, 1.74]];
  const maneBones = [neck1, neck1, neck2, neck3, neck3, head];
  manePts.forEach((p, i) => {
    b.part(new THREE.BoxGeometry(0.06, 0.2, 0.1), DARK, { at: [p[0], p[1], p[2]], bone: maneBones[i] });
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), TAN, { at: [0, 5.05, 2.1], scale: [0.18, 0.21, 0.3], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), TAN, { at: [0, 4.95, 2.4], scale: [0.13, 0.14, 0.22], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: [0, 4.93, 2.6], scale: [0.12, 0.1, 0.07], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { at: [0, 4.84, 2.5], scale: [0.1, 0.06, 0.2], bone: jaw });
  b.part(new THREE.SphereGeometry(1, 6, 5), DARK, { at: [0, 4.82, 2.68], scale: [0.09, 0.05, 0.05], bone: jaw });
  for (const s of [1, -1]) {
    // eyes
    b.part(sph(0.05, 1), "#ffffff", { at: [0.15 * s, 5.1, 2.2], bone: head });
    b.part(sph(0.032, 1), "#111111", { at: [0.18 * s, 5.1, 2.23], bone: head });
    // ears
    b.part(new THREE.SphereGeometry(1, 6, 4), BROWN, { at: [0.3 * s, 5.14, 1.97], scale: [0.16, 0.06, 0.07], bone: head });
    // ossicones
    b.spike([0.09 * s, 5.22, 2.0], [0, 1, -0.15], 0.3, 0.035, { color: TAN, bone: head } as any);
    b.part(sph(0.06, 1), DARK, { at: [0.09 * s, 5.53, 1.95], bone: head });
    // nostrils
    b.part(sph(0.02, 0), "#000000", { at: [0.05 * s, 4.95, 2.66], bone: head });
  }
  b.part(sph(0.06, 1), DARK, { at: [0, 5.22, 2.2], bone: head });

  // ---------- legs ----------
  const legSweeps: any[] = [];
  for (const [sx, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const x = 0.3 * sx;
    // front
    const shoulder = b.joint("shoulder" + side, { at: [x, 3.0, 0.85], parent: chest });
    const elbowKnee = b.joint("wrist" + side, { at: [x, 1.6, 0.9], parent: shoulder });
    const fHoof = b.joint("hoofF" + side, { at: [x, 0.14, 0.92], parent: elbowKnee });
    legSweeps.push(b.sweep([[x, 3.0, 0.85], [x, 2.3, 0.88], [x, 1.6, 0.9]], 0.15, { color: TAN }));
    b.sweep([[x, 1.6, 0.9], [x, 0.8, 0.91], [x, 0.2, 0.92]], 0.085, { color: CREAM });
    b.part(sph(0.12, 1), TAN, { at: [x, 1.6, 0.9], bone: elbowKnee });
    b.part(new THREE.BoxGeometry(0.2, 0.16, 0.28), DARK, { at: [x, 0.07, 0.94], bone: fHoof });
    // rear
    const hip = b.joint("hip" + side, { at: [x, 2.9, -0.8], parent: hips });
    const knee = b.joint("knee" + side, { at: [x, 1.7, -0.6], parent: hip });
    const hock = b.joint("hock" + side, { at: [x, 1.0, -0.95], parent: knee });
    const rHoof = b.joint("hoofR" + side, { at: [x, 0.14, -0.85], parent: hock });
    legSweeps.push(b.sweep([[x, 2.9, -0.8], [x, 2.3, -0.7], [x, 1.7, -0.6], [x, 1.0, -0.95]], 0.16, { color: TAN }));
    b.sweep([[x, 1.0, -0.95], [x, 0.5, -0.9], [x, 0.2, -0.85]], 0.08, { color: CREAM });
    b.part(sph(0.11, 1), TAN, { at: [x, 1.0, -0.95], bone: hock });
    b.part(new THREE.BoxGeometry(0.19, 0.16, 0.27), DARK, { at: [x, 0.07, -0.83], bone: rHoof });
  }

  // ---------- tail ----------
  b.sweep([[0, 3.05, -1.3], [0, 2.5, -1.5], [0, 2.05, -1.5]], 0.035, { color: TAN });
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: [0, 1.9, -1.5], scale: [0.07, 0.2, 0.07], bone: tail3 });

  // ---------- coat patches ----------
  const patch = (surf: any, n: number, size: number, offsetIdx = 0) => {
    const hits = surf.scatter(n);
    hits.forEach((h: any, i: number) => {
      const s = size * (0.7 + ((i * 37) % 10) / 15);
      b.stick(sph(s, 0), (i + offsetIdx) % 2 ? BROWN : BROWN2, h);
    });
  };
  try {
    patch(b.surface(body), 22, 0.15);
    patch(b.surface(rump), 14, 0.14, 1);
    patch(b.surface(withers), 14, 0.14);
    patch(b.surface(neck), 24, 0.1, 1);
    legSweeps.forEach((l) => patch(b.surface(l), 6, 0.08));
  } catch (e) {
    // coat patches are decoration; model remains valid without them
  }

  return b.root;
}
```