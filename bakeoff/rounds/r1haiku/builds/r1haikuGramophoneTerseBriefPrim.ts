import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "gramophone",
  description:
    "A wind-up gramophone: a varnished wooden cabinet, brass turntable with a red-label record, a tone arm, and a flared brass horn.",
};

const WOOD = "#6b3a1f";
const WOOD_DARK = "#4a2814";
const BRASS = "#d6a94a";
const BRASS_DARK = "#9a7326";
const HORN = "#c99a3e";
const FELT = "#2b2b30";
const RECORD = "#15151a";
const LABEL = "#b8322a";
const STEEL = "#7d838c";

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Root joint so the model has a skeleton anchor; everything else is rigid props.
  b.joint("body", { at: [0, 0, 0] });

  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    aim?: [number, number, number],
  ) => {
    if (aim) b.part({ geo, color, at, aim });
    else b.part({ geo, color, at });
  };

  // A cylinder stretched between two points.
  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    r: number,
    color: string,
  ) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    const m = A.clone().add(C).multiplyScalar(0.5);
    d.multiplyScalar(1 / len);
    put(
      new THREE.CylinderGeometry(r, r, len, 10),
      color,
      [m.x, m.y, m.z],
      [d.x, d.y, d.z],
    );
  };

  // Cabinet
  put(new THREE.BoxGeometry(0.4, 0.08, 0.36), WOOD, [0, 0.04, 0]);
  put(new THREE.BoxGeometry(0.34, 0.05, 0.008), WOOD_DARK, [0, 0.045, 0.181]);
  put(new THREE.BoxGeometry(0.4, 0.006, 0.012), BRASS, [0, 0.077, 0.18]);
  put(new THREE.BoxGeometry(0.4, 0.006, 0.012), BRASS, [0, 0.003, 0.18]);

  // Side crank
  rod([0.2, 0.05, 0], [0.25, 0.05, 0], 0.008, BRASS);
  put(new THREE.SphereGeometry(0.022, 14, 10), WOOD, [0.265, 0.05, 0]);

  // Turntable: brass platter, felt mat, record, label, spindle
  put(new THREE.CylinderGeometry(0.13, 0.135, 0.014, 32), BRASS, [0, 0.087, 0]);
  put(new THREE.CylinderGeometry(0.127, 0.127, 0.004, 32), FELT, [0, 0.1, 0]);
  put(new THREE.CylinderGeometry(0.118, 0.118, 0.004, 32), RECORD, [0, 0.104, 0]);
  put(new THREE.CylinderGeometry(0.045, 0.045, 0.002, 24), LABEL, [0, 0.1075, 0]);
  rod([0, 0.106, 0], [0, 0.13, 0], 0.005, BRASS);
  put(new THREE.SphereGeometry(0.008, 10, 8), BRASS, [0, 0.13, 0]);

  // Tone arm: pivot post, arm, head shell and needle
  put(new THREE.CylinderGeometry(0.02, 0.022, 0.03, 16), BRASS_DARK, [-0.15, 0.085, -0.09]);
  rod([-0.15, 0.1, -0.09], [-0.15, 0.13, -0.09], 0.012, BRASS);
  rod([-0.15, 0.13, -0.09], [-0.12, 0.135, -0.03], 0.007, BRASS);
  rod([-0.12, 0.135, -0.03], [-0.085, 0.12, 0.04], 0.006, BRASS);
  put(new THREE.BoxGeometry(0.03, 0.014, 0.034), BRASS_DARK, [-0.085, 0.117, 0.045]);
  rod([-0.085, 0.11, 0.045], [-0.085, 0.104, 0.045], 0.002, STEEL);

  // Arm rest cradle
  put(new THREE.BoxGeometry(0.05, 0.02, 0.05), BRASS, [0.14, 0.1, -0.1]);

  // Horn stand and collar
  rod([0, 0.08, -0.13], [0, 0.2, -0.13], 0.02, WOOD);
  put(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 20), BRASS, [0, 0.195, -0.13]);

  // Flared horn: a lathed trumpet with a rolled lip, aimed up and forward.
  const hornDir: [number, number, number] = [0, 0.507, 0.862];
  const horn = [
    new THREE.Vector2(0.012, 0),
    new THREE.Vector2(0.016, 0.04),
    new THREE.Vector2(0.025, 0.1),
    new THREE.Vector2(0.05, 0.16),
    new THREE.Vector2(0.1, 0.22),
    new THREE.Vector2(0.15, 0.27),
    new THREE.Vector2(0.168, 0.285),
    new THREE.Vector2(0.178, 0.3),
    new THREE.Vector2(0.18, 0.306),
    new THREE.Vector2(0.172, 0.31),
  ];
  put(new THREE.LatheGeometry(horn, 28), HORN, [0, 0.2, -0.13], hornDir);
}
