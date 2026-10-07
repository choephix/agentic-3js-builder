import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "hedgehog",
  description: "A stylized hedgehog: a blocky brown body under a dome of spines, with a pointed snout, bead eyes and four short legs.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const rand = rng(7);

  const FUR = "#7a4a2a";
  const SPINE_DARK = "#3a2516";
  const SPINE_TIP = "#efe2c4";
  const SKIN = "#c9a27a";
  const INK = "#141010";
  const FOOT = "#2a1d14";

  // Skeleton: body is the root, head and four legs hang from it.
  const body = b.joint("body", { at: [0, 0.1, 0] });
  const head = b.joint("head", { at: [0, 0.1, 0.1], parent: body });
  const legFL = b.joint("legFL", { at: [0.05, 0.07, 0.06], parent: body });
  const legFR = b.joint("legFR", { at: [-0.05, 0.07, 0.06], parent: body });
  const legBL = b.joint("legBL", { at: [0.05, 0.07, -0.06], parent: body });
  const legBR = b.joint("legBR", { at: [-0.05, 0.07, -0.06], parent: body });

  // Body: a squashed ball, a little longer than it is tall.
  const bodyGeo = new THREE.SphereGeometry(1, 16, 12);
  b.part(bodyGeo, FUR, { at: [0, 0.1, 0], bone: body, scale: [0.085, 0.08, 0.115] });

  // Pale belly patch so the underside reads against the spines.
  const belly = new THREE.SphereGeometry(1, 12, 8);
  b.part(belly, SKIN, { at: [0, 0.055, 0.02], bone: body, scale: [0.06, 0.03, 0.08] });

  // Spines: a fibonacci spread over the upper body, skipping the face and belly.
  const N = 320;
  const golden = 2.399963;
  const rx = 0.085, ry = 0.08, rz = 0.115;
  const cy = 0.1;
  const coneCache = new Map<string, THREE.BufferGeometry>();

  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * i) / (N - 1);
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * golden;
    const sx = Math.cos(th) * r;
    const sy = y;
    const sz = Math.sin(th) * r;

    // Skip the face (front) and the underside.
    if (sz > 0.45 || sy < -0.15) continue;

    const at: [number, number, number] = [sx * rx, cy + sy * ry, sz * rz];
    const nx = sx / rx, ny = sy / ry, nz = sz / rz;
    const nl = Math.hypot(nx, ny, nz) || 1;
    const dir: [number, number, number] = [
      nx / nl + 0.0,
      ny / nl + 0.25,
      nz / nl - 0.45,
    ];
    const dl = Math.hypot(dir[0], dir[1], dir[2]);
    const d: [number, number, number] = [dir[0] / dl, dir[1] / dl, dir[2] / dl];

    const len = 0.045 + rand() * 0.02;
    const key = len.toFixed(3);
    let geo = coneCache.get(key);
    if (!geo) {
      geo = new THREE.ConeGeometry(0.008, len, 5);
      geo.translate(0, len / 2, 0); // base at the origin, tip along +Y
      coneCache.set(key, geo);
    }
    const color = i % 4 === 0 ? SPINE_TIP : SPINE_DARK;
    b.stick(geo, color, frame(at, d));
  }

  // Head: snout, eyes, nose, ears.
  const snoutGeo = new THREE.CylinderGeometry(0.012, 0.03, 0.07, 8);
  snoutGeo.rotateX(Math.PI / 2); // axis now along +Z, narrow tip forward
  b.part(snoutGeo, SKIN, { at: [0, 0.085, 0.165], bone: head });

  const headGeo = new THREE.SphereGeometry(1, 12, 10);
  b.part(headGeo, SKIN, { at: [0, 0.095, 0.1], bone: head, scale: [0.04, 0.035, 0.04] });

  const eyeGeo = new THREE.SphereGeometry(0.013, 10, 8);
  b.part(eyeGeo, INK, { at: [0.032, 0.115, 0.14], bone: head });
  b.part(eyeGeo, INK, { at: [-0.032, 0.115, 0.14], bone: head });

  const noseGeo = new THREE.SphereGeometry(0.012, 10, 8);
  b.part(noseGeo, INK, { at: [0, 0.09, 0.2], bone: head });

  const earGeo = new THREE.SphereGeometry(0.02, 10, 8);
  b.part(earGeo, SKIN, { at: [0.035, 0.13, 0.085], bone: head, scale: [0.6, 1, 0.3] });
  b.part(earGeo, SKIN, { at: [-0.035, 0.13, 0.085], bone: head, scale: [0.6, 1, 0.3] });

  // Legs: short tapered capsules with dark feet, all planted on y = 0.
  const legGeo = new THREE.CylinderGeometry(0.02, 0.024, 0.07, 8);
  const footGeo = new THREE.SphereGeometry(0.022, 10, 8);
  const legs: [THREE.Object3D | any, number, number][] = [
    [legFL, 0.05, 0.06],
    [legFR, -0.05, 0.06],
    [legBL, 0.05, -0.06],
    [legBR, -0.05, -0.06],
  ];
  for (const [joint, x, z] of legs) {
    b.part(legGeo, SKIN, { at: [x, 0.035, z], bone: joint });
    b.part(footGeo, FOOT, { at: [x, 0.012, z + 0.01], bone: joint, scale: [1, 0.5, 1.3] });
  }

  return b.root;
}
