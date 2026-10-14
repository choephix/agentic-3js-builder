import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Sunny Seahorse",
  description:
    "A ridged yellow seahorse with dark pinstripes, white freckles, a spiked crown, a tube snout, a fluttering dorsal fin and big curious eyes, curling its tail around a strand of seagrass.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const rand = rng(11);

  const C = {
    body: "#ffcf2e",
    ridge: "#f0a300",
    line: "#3b2410",
    freckle: "#fffaf0",
    snout: "#f2b632",
    eyeW: "#ffffff",
    pupil: "#141414",
    fin: "#fff3b0",
    grass: "#2fa34a",
    grassD: "#1d7a36",
    sand: "#e8c98a",
    crown: "#f7a600",
  };

  // Skeleton: root at the belly, spine running up to the head.
  b.joint("hips", { at: [0, 0.08, 0] });
  const trunkPts = [
    [0, 0.08, 0],
    [0, 0.13, 0.012],
    [0, 0.18, 0.024],
    [0, 0.22, 0.036],
  ];
  const spine = b.chain("spine", catmull(trunkPts), { role: "spine" });

  // Body and surface for the ridges and freckles.
  const body = b.sweep(spine, 0.017, { color: C.body });
  const surf = b.surface(body);

  // Ridge bumps in rows around the trunk.
  for (let i = 0; i < 7; i++) {
    const t = 0.14 + i * 0.12;
    const c = spine.at(t);
    for (let k = 0; k < 8; k++) {
      const az = (k * Math.PI) / 4;
      const hit = surf.around(c).at(az, 0);
      b.stick(new THREE.BoxGeometry(0.007, 0.005, 0.005), C.ridge, hit);
    }
  }

  // Thin dark pinstripes between the ridge rows.
  for (let j = 0; j < 6; j++) {
    const t = 0.2 + j * 0.12;
    const c = spine.at(t);
    for (let k = 0; k < 24; k++) {
      const az = (k * Math.PI * 2) / 24;
      const hit = surf.around(c).at(az, 0);
      b.stick(new THREE.BoxGeometry(0.0065, 0.0028, 0.0028), C.line, hit);
    }
  }

  // Scattered white freckles.
  for (let i = 0; i < 16; i++) {
    const t = 0.15 + rand() * 0.7;
    const az = rand() * Math.PI * 2;
    const el = (rand() - 0.5) * 0.5;
    const hit = surf.around(spine.at(t)).at(az, el);
    b.stick(new THREE.SphereGeometry(0.0028, 6, 4), C.freckle, hit);
  }

  // Head.
  const H = [0, 0.262, 0.035];
  const HR = 0.034;
  b.part(new THREE.SphereGeometry(HR, 14, 10), C.body, { at: H });

  // Crown of spikes around the top of the head.
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const base = [Math.cos(a) * 0.014, 0.284, 0.035 + Math.sin(a) * 0.014];
    const dir = [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4];
    b.spike(base, dir, 0.022, 0.0045);
  }

  // Tube snout.
  b.sweep(
    [
      [0, 0.27, 0.06],
      [0, 0.262, 0.09],
      [0, 0.252, 0.12],
      [0, 0.246, 0.138],
    ],
    0.0095,
    { color: C.snout },
  );

  // Big curious eyes with pupils.
  for (const side of [-1, 1]) {
    const v = [side * 0.55, 0.25, 0.8];
    const eye = [H[0] + v[0] * 0.028, H[1] + v[1] * 0.028, H[2] + v[2] * 0.028];
    b.part(new THREE.SphereGeometry(0.0125, 10, 8), C.eyeW, { at: eye });
    const pupil = [
      eye[0] + v[0] * 0.008,
      eye[1] + v[1] * 0.008,
      eye[2] + v[2] * 0.008,
    ];
    b.part(new THREE.SphereGeometry(0.007, 8, 6), C.pupil, { at: pupil });
  }

  // Dorsal fin: a fluttering membrane on the back of the trunk.
  const edgeA = [
    [0, 0.1, -0.012],
    [0, 0.13, -0.006],
    [0, 0.16, 0.0],
    [0, 0.19, 0.009],
    [0, 0.22, 0.02],
  ];
  const edgeB = [
    [0.004, 0.09, -0.06],
    [-0.006, 0.125, -0.08],
    [0.012, 0.16, -0.085],
    [-0.01, 0.195, -0.07],
    [0.006, 0.22, -0.04],
  ];
  b.membrane(edgeA, edgeB, { color: C.fin });

  // Curled tail wrapped around the seagrass stem.
  const cx = 0.05;
  const cz = -0.02;
  const R = 0.017;
  const tailPts: number[][] = [
    [0, 0.085, 0],
    [0.012, 0.072, -0.008],
    [0.026, 0.062, -0.016],
  ];
  for (let i = 0; i < 10; i++) {
    const th = Math.PI + 0.5 + i * 0.6;
    const y = 0.06 - i * 0.0035;
    tailPts.push([cx + R * Math.cos(th), y, cz + R * Math.sin(th)]);
  }
  const thEnd = Math.PI + 0.5 + 9 * 0.6 + 0.4;
  tailPts.push([
    cx + 0.032 * Math.cos(thEnd),
    0.0275,
    cz + 0.032 * Math.sin(thEnd),
  ]);
  b.sweep(tailPts, 0.0055, { color: C.body });

  // Seagrass: two blades rising from a sandy base.
  const sandBase = b.part(new THREE.SphereGeometry(0.03, 10, 6), C.sand, {
    at: [cx, 0.002, cz],
    scale: [1, 0.3, 1],
  } as any);
  void sandBase;

  b.sweep(
    [
      [cx, 0.0, cz],
      [cx, 0.1, cz],
      [cx + 0.002, 0.2, cz - 0.004],
      [cx - 0.002, 0.3, cz - 0.008],
    ],
    0.0075,
    { color: C.grass },
  );
  b.sweep(
    [
      [cx + 0.008, 0.0, cz - 0.01],
      [cx + 0.012, 0.12, cz - 0.015],
      [cx + 0.022, 0.2, cz - 0.01],
      [cx + 0.032, 0.25, cz],
    ],
    0.006,
    { color: C.grassD },
  );

  return b.root;
}
