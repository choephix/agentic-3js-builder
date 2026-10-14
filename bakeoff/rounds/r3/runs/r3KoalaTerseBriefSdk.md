```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description: "A stylized koala standing on all fours, built from faceted ellipsoids on a rigged skeleton.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  const GREY = "#8c8e94", DGREY = "#6f7177", LIGHT = "#dcd9d2", DARK = "#26262a";
  const PINK = "#c9a2a0", CLAW = "#e8e2d4", WHITE = "#f1eee8";

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.27, -0.1] });
  const spine = b.joint("spine1", { at: [0, 0.3, 0.02], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.31, 0.12], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.38, 0.2], parent: chest });
  const head = b.joint("head", { at: [0, 0.44, 0.22], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.4, 0.28], parent: head });

  const sides: [string, number][] = [["L", 1], ["R", -1]];
  const J: Record<string, THREE.Object3D | any> = {};
  for (const [s, k] of sides) {
    J["hip" + s] = b.joint("hip" + s, { at: [0.11 * k, 0.22, -0.16], parent: hips });
    J["knee" + s] = b.joint("knee" + s, { at: [0.11 * k, 0.12, -0.14], parent: J["hip" + s] });
    J["ankle" + s] = b.joint("ankle" + s, { at: [0.11 * k, 0.035, -0.12], parent: J["knee" + s] });
    J["shoulder" + s] = b.joint("shoulder" + s, { at: [0.11 * k, 0.27, 0.14], parent: chest });
    J["elbow" + s] = b.joint("elbow" + s, { at: [0.11 * k, 0.16, 0.15], parent: J["shoulder" + s] });
    J["wrist" + s] = b.joint("wrist" + s, { at: [0.11 * k, 0.04, 0.16], parent: J["elbow" + s] });
    J["ear" + s] = b.joint("ear" + s, { at: [0.115 * k, 0.53, 0.2], parent: head });
  }

  const ell = (geo: THREE.BufferGeometry, color: string, at: number[], scale: number[], bone: any) =>
    b.part(geo, color, { at, bone, scale } as any);
  const sph = new THREE.SphereGeometry(1, 9, 7);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cone = new THREE.ConeGeometry(1, 1, 5);

  // Body
  ell(sph, GREY, [0, 0.29, -0.04], [0.16, 0.17, 0.25], spine);
  ell(sph, GREY, [0, 0.26, -0.16], [0.16, 0.15, 0.14], hips);
  ell(sph, LIGHT, [0, 0.25, 0.0], [0.12, 0.12, 0.22], spine);
  ell(sph, LIGHT, [0, 0.31, 0.15], [0.1, 0.1, 0.07], chest);
  ell(sph, DGREY, [0, 0.43, -0.06], [0.1, 0.05, 0.22], spine);
  ell(sph, LIGHT, [0, 0.2, -0.28], [0.06, 0.04, 0.04], hips); // tail nub

  // Neck + head
  ell(sph, GREY, [0, 0.38, 0.19], [0.12, 0.11, 0.11], neck);
  ell(sph, GREY, [0, 0.45, 0.23], [0.15, 0.13, 0.13], head);
  ell(sph, LIGHT, [0, 0.4, 0.3], [0.09, 0.06, 0.07], head); // muzzle/cheeks
  ell(sph, LIGHT, [0.1, 0.4, 0.26], [0.05, 0.06, 0.06], head);
  ell(sph, LIGHT, [-0.1, 0.4, 0.26], [0.05, 0.06, 0.06], head);
  ell(sph, DARK, [0, 0.455, 0.34], [0.045, 0.07, 0.06], head); // big nose
  ell(sph, "#3c3c40", [0, 0.495, 0.35], [0.03, 0.012, 0.03], head);
  ell(sph, PINK, [0, 0.375, 0.29], [0.045, 0.015, 0.05], jaw); // lower jaw
  ell(sph, LIGHT, [0, 0.365, 0.285], [0.065, 0.025, 0.06], jaw);
  ell(sph, DARK, [0, 0.352, 0.325], [0.015, 0.008, 0.012], jaw);

  // Eyes
  for (const [s, k] of sides) {
    ell(sph, DARK, [0.065 * k, 0.485, 0.325], [0.016, 0.02, 0.012], head);
    ell(sph, WHITE, [0.068 * k, 0.49, 0.335], [0.004, 0.004, 0.004], head);
    ell(sph, DGREY, [0.065 * k, 0.51, 0.31], [0.03, 0.01, 0.02], head);
    // ears
    const e = J["ear" + s];
    ell(sph, GREY, [0.125 * k, 0.54, 0.2], [0.075, 0.08, 0.04], e);
    ell(sph, WHITE, [0.125 * k, 0.54, 0.22], [0.062, 0.068, 0.03], e);
    ell(sph, LIGHT, [0.135 * k, 0.535, 0.195], [0.05, 0.055, 0.02], e);
    ell(sph, PINK, [0.12 * k, 0.535, 0.235], [0.03, 0.035, 0.012], e);
  }

  // Limbs
  for (const [s, k] of sides) {
    const x = 0.11 * k;
    // hind leg
    ell(sph, GREY, [x * 1.1, 0.2, -0.17], [0.075, 0.1, 0.1], J["hip" + s]);
    ell(sph, GREY, [x, 0.115, -0.14], [0.05, 0.09, 0.055], J["knee" + s]);
    ell(box, DARK, [x, 0.02, -0.095], [0.055, 0.04, 0.12], J["ankle" + s]);
    // fore leg
    ell(sph, GREY, [x * 1.05, 0.23, 0.14], [0.06, 0.12, 0.07], J["shoulder" + s]);
    ell(sph, GREY, [x, 0.12, 0.15], [0.045, 0.09, 0.05], J["elbow" + s]);
    ell(box, DARK, [x, 0.025, 0.175], [0.055, 0.04, 0.1], J["wrist" + s]);
    // claws
    for (let i = -1; i <= 1; i++) {
      ell(cone, CLAW, [x + i * 0.02, 0.012, 0.245], [0.008, 0.035, 0.008], J["wrist" + s]);
      ell(cone, CLAW, [x + i * 0.02, 0.012, -0.025], [0.008, 0.035, 0.008], J["ankle" + s]);
    }
  }
  // tilt claws forward: use small rotation via geometry
  return b.root;
}
```