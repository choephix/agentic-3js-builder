```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description: "Plate-armored knight with kite shield, longsword, plumed helm and tabard, rigged on a humanoid skeleton.",
};

export default function build() {
  const b = createBuilder({ name: "knight" });
  const steel = "#aab2bd", dark = "#5b6470", gold = "#d4a937", red = "#a31f2b", leather = "#5a3a22", cream = "#e8e0cc";

  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.joint("spine", { at: [0, 1.2, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.4, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.62, 0], parent: chest });
  const head = b.joint("head", { at: [0, 1.7, 0], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.74, 0.08], parent: head });

  const J: Record<string, any> = {};
  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    J["hip" + s] = b.joint("hip" + s, { at: [0.15 * x, 0.95, 0], parent: hips });
    J["knee" + s] = b.joint("knee" + s, { at: [0.15 * x, 0.52, 0.02], parent: J["hip" + s] });
    J["ankle" + s] = b.joint("ankle" + s, { at: [0.15 * x, 0.1, 0], parent: J["knee" + s] });
    J["shoulder" + s] = b.joint("shoulder" + s, { at: [0.33 * x, 1.52, 0], parent: chest });
    J["elbow" + s] = b.joint("elbow" + s, { at: [0.42 * x, 1.24, 0], parent: J["shoulder" + s] });
    J["wrist" + s] = b.joint("wrist" + s, { at: [0.48 * x, 0.98, 0.04], parent: J["elbow" + s] });
  }

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, extra: any = {}) =>
    b.part(geo, color, { at, bone, ...extra });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const cyl = (r1: number, r2: number, h: number, n = 8) => new THREE.CylinderGeometry(r1, r2, h, n);

  // pelvis & torso
  P(box(0.38, 0.2, 0.26), dark, [0, 1.0, 0], hips);
  P(box(0.42, 0.06, 0.3), leather, [0, 1.1, 0], hips); // belt
  P(box(0.08, 0.08, 0.02), gold, [0, 1.1, 0.16], hips); // buckle
  P(cyl(0.2, 0.25, 0.25), steel, [0, 1.25, 0], spine);
  P(box(0.52, 0.34, 0.34), steel, [0, 1.43, 0], chest);
  P(box(0.2, 0.28, 0.04), gold, [0, 1.43, 0.19], chest); // breast plate trim
  P(box(0.22, 0.5, 0.02), red, [0, 0.8, 0.17], hips); // tabard front
  P(box(0.22, 0.5, 0.02), red, [0, 0.8, -0.17], hips);
  P(box(0.28, 0.08, 0.34), dark, [0, 1.58, 0], chest); // gorget
  P(cyl(0.07, 0.08, 0.08), dark, [0, 1.63, 0], neck);

  // head: helm
  P(sph(0.14), steel, [0, 1.8, 0], head, { scale: [1, 1.15, 1.1] });
  P(box(0.25, 0.05, 0.04), "#15171c", [0, 1.8, 0.15], head); // eye slit
  P(box(0.04, 0.16, 0.04), "#15171c", [0, 1.73, 0.155], head);
  P(box(0.2, 0.1, 0.2), steel, [0, 1.7, 0.04], jaw); // chin plate
  P(box(0.04, 0.1, 0.26), gold, [0, 1.95, -0.02], head); // crest base
  P(new THREE.ConeGeometry(0.06, 0.3, 6), red, [0, 2.08, -0.1], head, { dir: [0, 0.6, -0.8] }); // plume

  // legs and arms
  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    P(box(0.16, 0.45, 0.18), steel, [0.15 * x, 0.74, 0], J["hip" + s]);
    P(sph(0.1), gold, [0.15 * x, 0.52, 0.07], J["knee" + s]); // knee cop
    P(box(0.14, 0.4, 0.16), dark, [0.15 * x, 0.3, 0], J["knee" + s]);
    P(box(0.17, 0.06, 0.2), steel, [0.15 * x, 0.2, 0.01], J["knee" + s]);
    P(box(0.15, 0.1, 0.3), steel, [0.15 * x, 0.05, 0.07], J["ankle" + s]);
    // arm
    P(sph(0.14), steel, [0.35 * x, 1.54, 0], J["shoulder" + s], { scale: [1.1, 0.8, 1.1] });
    P(box(0.4 * 0.3 + 0.02, 0.05, 0.3), gold, [0.36 * x, 1.6, 0], J["shoulder" + s]);
    P(cyl(0.065, 0.06, 0.3), steel, [0.38 * x, 1.38, 0], J["shoulder" + s], { dir: [0.15 * x, -1, 0] });
    P(sph(0.07), gold, [0.42 * x, 1.24, 0], J["elbow" + s]);
    P(cyl(0.06, 0.07, 0.28), dark, [0.45 * x, 1.11, 0.02], J["elbow" + s], { dir: [0.1 * x, -1, 0.1] });
    P(box(0.1, 0.12, 0.12), steel, [0.48 * x, 0.94, 0.04], J["wrist" + s]);
  }

  // sword in right hand (-X)
  const w = J["wristR"];
  P(cyl(0.02, 0.02, 0.16, 6), leather, [-0.48, 0.96, 0.08], w, { dir: [0, 1, 0] });
  P(box(0.3, 0.04, 0.05), gold, [-0.48, 1.05, 0.08], w);
  P(sph(0.03), gold, [-0.48, 0.86, 0.08], w);
  P(box(0.06, 0.95, 0.015), "#dfe5ec", [-0.48, 1.55, 0.08], w);
  P(new THREE.ConeGeometry(0.03, 0.1, 4), "#dfe5ec", [-0.48, 2.07, 0.08], w, { rot: [0, Math.PI / 4, 0] });

  // kite shield on left forearm
  const e = J["elbowL"];
  P(box(0.1, 0.7, 0.5), dark, [0.62, 1.1, 0.2], e, { dir: [0, 1, 0] });
  P(box(0.06, 0.62, 0.42), red, [0.66, 1.12, 0.2], e);
  P(box(0.07, 0.5, 0.06), cream, [0.69, 1.12, 0.2], e);
  P(box(0.07, 0.06, 0.34), cream, [0.69, 1.22, 0.2], e);
  P(new THREE.ConeGeometry(0.2, 0.2, 4), dark, [0.62, 0.65, 0.2], e, { rot: [0, Math.PI / 4, 0], scale: [0.4, 1, 1.2], dir: [0, -1, 0] });

  return b.root;
}
```