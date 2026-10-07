import * as THREE from "three";
import { createBuilder, rng, frame, catmull, polyline } from "../../../../src/index";

export const meta = {
  name: "gramophone",
  description:
    "A wind-up gramophone: a varnished wooden case, brass turntable, tonearm with head shell, crank and a flared brass horn.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const rand = rng(7);

  const WOOD = "#7a4a22";
  const WOOD_D = "#4a2a12";
  const WOOD_L = "#a8703a";
  const BRASS = "#d9a441";
  const BRASS_D = "#9c6d22";
  const FELT = "#262626";
  const CREAM = "#efe2c0";
  const RED = "#b8322a";
  const STEEL = "#8d939a";

  // Skeleton: base at the floor, horn and tonearm hang off it.
  const base = b.joint("base", { at: [0, 0, 0] });
  const throat = b.joint("throat", { at: [0, 0.16, -0.1], aim: [0, 0.48, 0.06] });
  const arm = b.joint("arm", { at: [0.15, 0.155, -0.12], aim: [0.1, 0.165, 0.04] });

  // Case: a varnished box with a slightly darker lid.
  b.stick(new THREE.BoxGeometry(0.42, 0.14, 0.36), WOOD, frame([0, 0.07, 0], [0, 1, 0]));
  b.stick(new THREE.BoxGeometry(0.40, 0.012, 0.34), WOOD_D, frame([0, 0.14, 0], [0, 1, 0]));
  b.stick(new THREE.BoxGeometry(0.36, 0.1, 0.004), WOOD_L, frame([0, 0.07, 0.182], [0, 0, 1]));

  // Feet and small screws on the front panel.
  for (const x of [-0.19, 0.19]) {
    for (const z of [-0.15, 0.15]) {
      b.stick(new THREE.CylinderGeometry(0.022, 0.024, 0.014, 10), WOOD_D, frame([x, 0, z], [0, 1, 0]));
    }
  }
  for (const [x, y] of [[-0.16, 0.02], [0.16, 0.02], [-0.16, 0.12], [0.16, 0.12]]) {
    const jitter = (rand() - 0.5) * 0.002;
    b.stick(new THREE.SphereGeometry(0.008, 8, 6), BRASS, frame([x, y, 0.186 + jitter], [0, 0, 1]));
  }

  // Turntable: brass rim with a felt platter and a spindle.
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.155, 0.01],
      [0.15, 0.016],
      [0, 0.016],
    ],
    { at: [0, 0.14, 0.02], axis: [0, 1, 0], color: BRASS }
  );
  b.stick(new THREE.CylinderGeometry(0.14, 0.14, 0.004, 40), FELT, frame([0, 0.16, 0.02], [0, 1, 0]));
  b.stick(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 10), STEEL, frame([0, 0.17, 0.02], [0, 1, 0]));

  // Tonearm: a bent brass tube ending in a head shell with a red stylus.
  const armPath = polyline([
    [0.15, 0.155, -0.12],
    [0.15, 0.19, -0.05],
    [0.1, 0.18, 0.0],
    [0.1, 0.165, 0.04],
  ]);
  b.chain("tonearm", armPath);
  b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), BRASS_D, frame([0.15, 0.155, -0.12], [0, 1, 0]));
  b.stick(new THREE.BoxGeometry(0.03, 0.012, 0.045), BRASS, frame([0.1, 0.165, 0.045], [0, 0, 1]));
  b.stick(new THREE.ConeGeometry(0.004, 0.012, 6), RED, frame([0.1, 0.156, 0.045], [0, -1, 0]));

  // Horn neck: a curved tube climbing from the case to the bell.
  const neckPath = catmull([
    [0, 0.16, -0.1],
    [0, 0.3, -0.06],
    [0, 0.48, 0.06],
  ]);
  b.sweep(neckPath, { radius: 0.024, color: BRASS });

  // Flared bell along the final direction of the neck.
  b.lathe(
    [
      [0.03, 0],
      [0.045, 0.06],
      [0.09, 0.16],
      [0.17, 0.27],
      [0.2, 0.31],
    ],
    { at: [0, 0.48, 0.06], axis: [0, 0.5, 0.6], color: BRASS }
  );
  b.stick(new THREE.TorusGeometry(0.2, 0.008, 8, 24), BRASS_D, frame([0, 0.6, 0.27], [0, 0.5, 0.6]));

  // Crank handle on the right side of the case.
  b.capsule([0.21, 0.09, 0.0], [0.27, 0.09, 0.0], { radius: 0.008, color: STEEL });
  b.stick(new THREE.SphereGeometry(0.018, 12, 8), RED, frame([0.275, 0.09, 0.0], [1, 0, 0]));
  b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14), BRASS_D, frame([0.21, 0.09, 0.0], [1, 0, 0]));

  // A cream label on the lid, for a little character.
  b.stick(new THREE.BoxGeometry(0.1, 0.002, 0.06), CREAM, frame([0.12, 0.147, -0.1], [0, 1, 0]));

  return b.root;
}
