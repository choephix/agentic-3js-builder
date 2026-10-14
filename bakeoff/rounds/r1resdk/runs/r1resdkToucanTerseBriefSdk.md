```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Toucan",
  description: "Perched toco toucan with a big two-part orange beak, blue eye skin, white throat and red undertail.",
};

function ell(rx: number, ry: number, rz: number, tilt = 0, w = 8, h = 6) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  if (tilt) g.rotateX(tilt);
  return g;
}
function box(x: number, y: number, z: number, tilt = 0) {
  const g = new THREE.BoxGeometry(x, y, z);
  if (tilt) g.rotateX(tilt);
  return g;
}
function cyl(a: number[], c: number[], r: number) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c);
  const len = A.distanceTo(B);
  const g = new THREE.CylinderGeometry(r, r * 0.8, len, 5);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    B.clone().sub(A).normalize()
  );
  g.applyQuaternion(q);
  return { g, mid: A.add(B).multiplyScalar(0.5).toArray() as number[] };
}

export default function build() {
  const b = createBuilder({ name: "toucan" });
  const T = -0.95;

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const chest = b.joint("chest", { at: [0, 0.37, 0.07], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.45, 0.12], parent: chest });
  const head = b.joint("head", { at: [0, 0.5, 0.14], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.475, 0.2], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.2, -0.1], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.14, -0.2], parent: tail1 });
  const legs: Record<string, any> = {};
  const wings: any[] = [];
  for (const [s, n] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const hip = b.joint("hip" + n, { at: [s * 0.045, 0.22, 0], parent: hips });
    const knee = b.joint("knee" + n, { at: [s * 0.05, 0.12, 0.02], parent: hip });
    const ankle = b.joint("ankle" + n, { at: [s * 0.05, 0.04, 0.02], parent: knee });
    legs[n] = { hip, knee, ankle, s };
    wings.push({ s, n, j: b.joint("shoulder" + n, { at: [s * 0.08, 0.36, 0.0], parent: chest }) });
  }

  const add = (geometry: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part({ geometry, color, at, bone } as any);

  // body
  add(ell(0.085, 0.1, 0.17, T, 10, 8), "#1b1b22", [0, 0.3, 0], hips);
  add(ell(0.075, 0.08, 0.06, T, 8, 6), "#fff3c4", [0, 0.395, 0.1], chest);
  add(ell(0.06, 0.05, 0.05, T, 8, 6), "#ffd23a", [0, 0.44, 0.12], chest);
  add(ell(0.05, 0.04, 0.05, 0, 6, 5), "#d8202a", [0, 0.2, -0.09], tail1);
  add(ell(0.06, 0.06, 0.06, 0, 8, 6), "#1b1b22", [0, 0.5, 0.14], head);
  add(ell(0.055, 0.05, 0.05, 0, 8, 6), "#1b1b22", [0, 0.455, 0.12], neck);

  // tail
  add(box(0.09, 0.02, 0.2, -0.5), "#15151b", [0, 0.17, -0.2], tail1);
  add(box(0.08, 0.02, 0.12, -0.5), "#22222c", [0, 0.1, -0.31], tail2);
  add(box(0.09, 0.012, 0.03, -0.5), "#ffffff", [0, 0.07, -0.37], tail2);

  // wings
  for (const w of wings) {
    add(ell(0.02, 0.09, 0.17, T, 8, 6), "#23232d", [w.s * 0.09, 0.3, -0.03], w.j);
    add(ell(0.015, 0.05, 0.1, T, 6, 5), "#2f3a55", [w.s * 0.098, 0.27, -0.06], w.j);
  }

  // eyes
  for (const s of [1, -1]) {
    add(ell(0.02, 0.028, 0.028, 0, 6, 5), "#3fb5e6", [s * 0.05, 0.52, 0.17], head);
    add(ell(0.01, 0.014, 0.014, 0, 6, 5), "#0a0a0a", [s * 0.065, 0.52, 0.18], head);
    add(ell(0.004, 0.005, 0.005, 0, 4, 3), "#ffffff", [s * 0.072, 0.525, 0.185], head);
  }

  // beak
  add(ell(0.036, 0.046, 0.125, 0.06, 8, 6), "#ffb21f", [0, 0.5, 0.3], head);
  add(ell(0.03, 0.025, 0.1, 0.02, 8, 6), "#ff8a1f", [0, 0.468, 0.285], jaw);
  add(ell(0.02, 0.025, 0.03, 0.06, 6, 5), "#1b1b22", [0, 0.495, 0.42], head);
  add(ell(0.038, 0.048, 0.016, 0.06, 8, 6), "#d8202a", [0, 0.5, 0.2], head);
  add(ell(0.02, 0.014, 0.1, 0.06, 6, 4), "#ffe27a", [0, 0.54, 0.3], head);
  add(ell(0.02, 0.02, 0.02, 0, 4, 3), "#1b1b22", [0, 0.47, 0.375], jaw);

  // legs and feet
  for (const n of ["L", "R"]) {
    const { hip, ankle, s } = legs[n];
    const l = cyl([s * 0.045, 0.22, 0], [s * 0.05, 0.04, 0.02], 0.014);
    add(l.g, "#5f8fb8", l.mid, hip);
    add(ell(0.022, 0.03, 0.025, 0, 5, 4), "#2a2a33", [s * 0.047, 0.2, 0], hip);
    for (const a of [-0.3, 0, 0.3]) {
      const t = box(0.014, 0.014, 0.06);
      t.rotateY(a * s);
      add(t, "#5f8fb8", [s * 0.05 + Math.sin(a * s) * 0.03, 0.008, 0.055], ankle);
    }
    add(box(0.014, 0.014, 0.04), "#5f8fb8", [s * 0.05, 0.008, -0.03], ankle);
    add(box(0.03, 0.016, 0.03), "#5f8fb8", [s * 0.05, 0.012, 0.02], ankle);
  }

  return b.root;
}
```