import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Penguin",
  description: "A stylized emperor-style penguin with black back, white belly, golden chest, flippers, feet and a jawed beak.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });
  const BLACK = "#1b1f27";
  const ORANGE = "#f2a21e";
  const DORANGE = "#d9791a";
  const GOLD = "#f3a51f";

  const sph = new THREE.SphereGeometry(1, 14, 10);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // skeleton
  b.joint("root", { at: [0, 0.4, 0] });
  b.chain(
    "spine",
    [
      [0, 0.4, 0],
      [0, 0.6, 0],
      [0, 0.78, 0.02],
      [0, 0.87, 0.04],
    ],
    { parent: "root", role: "spine", names: ["spine1", "spine2", "neck1", "head"] },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.845, 0.1], dir: [0, 0, 1], role: "jaw" });
  b.joint("tail1", { parent: "root", at: [0, 0.22, -0.2], dir: [0, -0.3, -1] });

  // body
  const coat = paint((p, n) => {
    const belly = mix("#f4f1ea", "#f7d65a", smoothstep(0.52, 0.8, p.y));
    return mix(BLACK, belly, smoothstep(-0.12, 0.25, n.z));
  });
  b.part(sph, coat, { at: [0, 0.52, 0], scale: [0.27, 0.38, 0.25], bone: "spine1" });
  b.part(sph, BLACK, { at: [0, 0.8, 0.02], scale: [0.13, 0.12, 0.13], bone: "neck1" });

  // head
  b.part(sph, BLACK, { at: [0, 0.87, 0.04], scale: [0.1, 0.1, 0.105], bone: "head" });
  for (const s of [1, -1]) {
    b.part(sph, "#ffffff", { at: [s * 0.076, 0.89, 0.092], scale: 0.02, bone: "head" });
    b.part(sph, "#050505", { at: [s * 0.088, 0.89, 0.1], scale: 0.012, bone: "head" });
    b.part(sph, GOLD, { at: [s * 0.089, 0.86, 0.03], scale: [0.012, 0.045, 0.055], bone: "head" });
  }
  b.part(new THREE.ConeGeometry(0.035, 0.17, 6), "#2b2b2b", {
    at: [0, 0.862, 0.135], rotation: [90, 0, 0], scale: [1, 1, 0.55], bone: "head",
  });
  b.part(new THREE.ConeGeometry(0.03, 0.15, 6), ORANGE, {
    at: [0, 0.832, 0.13], rotation: [90, 0, 0], scale: [1, 1, 0.4], bone: "jaw",
  });

  // flippers & legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const pts: [number, number, number][] = [
      [s * 0.23, 0.68, 0],
      [s * 0.31, 0.5, -0.01],
      [s * 0.38, 0.3, -0.03],
    ];
    b.chain(`arm${n}`, pts, {
      parent: "spine2", role: "arm", names: [`shoulder${n}`, `elbow${n}`, `hand${n}`],
    });
    const seg = (a: number[], c: number[], w: number, bone: string) => {
      const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
      const len = A.distanceTo(C);
      b.part(box(0.03, len, w), BLACK, {
        at: A.clone().lerp(C, 0.5), dir: C.clone().sub(A), bone,
      });
    };
    seg(pts[0], pts[1], 0.13, `shoulder${n}`);
    seg(pts[1], pts[2], 0.1, `elbow${n}`);
    b.part(sph, BLACK, { at: pts[2], scale: [0.016, 0.03, 0.05], bone: `elbow${n}` });

    b.chain(`leg${n}`, [[s * 0.1, 0.2, 0.0], [s * 0.1, 0.05, 0.02]], {
      parent: "root", role: "leg", names: [`hip${n}`, `ankle${n}`],
    });
    b.part(new THREE.CylinderGeometry(0.035, 0.03, 0.17, 6), DORANGE, {
      at: [s * 0.1, 0.12, 0.01], bone: `hip${n}`,
    });
    b.part(box(0.09, 0.025, 0.1), ORANGE, { at: [s * 0.1, 0.0125, 0.06], bone: `ankle${n}` });
    for (const k of [-1, 0, 1])
      b.part(box(0.032, 0.022, 0.08), ORANGE, {
        at: [s * 0.1 + k * 0.035, 0.011, 0.12], rotation: [0, k * 18, 0], bone: `ankle${n}`,
      });
  }

  // tail
  b.part(box(0.12, 0.02, 0.17), BLACK, { at: [0, 0.17, -0.27], rotation: [-22, 0, 0], bone: "tail1" });

  return b.root;
}
