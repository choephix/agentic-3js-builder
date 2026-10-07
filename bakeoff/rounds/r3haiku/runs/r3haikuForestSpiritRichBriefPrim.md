This is a first pass at the forest spirit, built from primitives and rigged on a simple skeleton. I haven't run it, and some SDK call shapes (the `parent` option, the `scale` format, and the `sweep` radius) are inferred from the reference, so they may need adjusting.

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "forest spirit",
  description:
    "A small deer-like forest spirit: a river-stone body under soft moss, slender wooden legs with hooves, branching antlers in flower and leaf, a pale wooden mask face with glowing green eyes, and fireflies circling its head.",
};

const STONE = "#8a9096";
const STONE_DARK = "#60656a";
const MOSS = "#5f9e4a";
const MOSS_LIGHT = "#8cc465";
const WOOD = "#c8a77a";
const WOOD_DARK = "#7a5a3a";
const PALE = "#eadfc4";
const GLOW = "#7dff7a";
const FIREFLY = "#eaff8a";
const PETAL = "#fffaf0";
const LEAF = "#6bbf5a";
const HOOF = "#3b2e24";
const ANTLER = "#d9c49a";

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const chest = b.joint("chest", { at: [0, 1.1, 0.25], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.28, 0.42], parent: chest });
  const head = b.joint("head", { at: [0, 1.48, 0.56], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.38, 0.74], parent: head });

  // ---------- Stone body ----------
  b.part(new THREE.DodecahedronGeometry(0.42, 0), STONE, {
    at: [0, 1.02, 0.1],
    bone: hips,
    scale: [0.85, 0.8, 1.3],
  });
  // darker stone chunks for a river-rock read
  b.part(new THREE.DodecahedronGeometry(0.2, 0), STONE_DARK, {
    at: [0.22, 0.8, -0.05],
    bone: hips,
    scale: [1, 0.9, 1.1],
  });
  b.part(new THREE.DodecahedronGeometry(0.16, 0), STONE_DARK, {
    at: [-0.24, 0.84, 0.3],
    bone: hips,
    scale: [1, 0.9, 1],
  });

  // ---------- Moss on the stone ----------
  const mossSpots: [number[], number][] = [
    [[0.1, 1.32, 0.0], 0.18],
    [[-0.16, 1.22, 0.24], 0.15],
    [[0.2, 1.0, 0.32], 0.14],
    [[-0.12, 1.36, -0.16], 0.16],
    [[0.05, 0.9, -0.3], 0.13],
    [[-0.3, 1.0, -0.05], 0.12],
  ];
  for (const [at, r] of mossSpots) {
    b.part(new THREE.DodecahedronGeometry(r, 0), MOSS, {
      at: at as [number, number, number],
      bone: hips,
      scale: [1.1, 0.55, 1.0],
    });
    b.part(new THREE.DodecahedronGeometry(r * 0.55, 0), MOSS_LIGHT, {
      at: [at[0], (at[1] as number) + r * 0.3, at[2]] as [number, number, number],
      bone: hips,
      scale: [1, 0.5, 1],
    });
  }

  // ---------- Slender wooden legs with hooves ----------
  const seg = (
    j: any,
    a: [number, number, number],
    c: [number, number, number],
    r: number,
    color: string,
  ) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    b.part(new THREE.CylinderGeometry(r, r * 0.75, len, 6), color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      aim: c,
      bone: j,
    });
  };

  const leg = (name: string, x: number, z: number) => {
    const top: [number, number, number] = [x, 0.9, z];
    const knee: [number, number, number] = [x, 0.5, z + 0.03];
    const ankle: [number, number, number] = [x, 0.1, z - 0.02];
    const hipJ = b.joint(`${name}Hip`, { at: top, parent: hips });
    const kneeJ = b.joint(`${name}Knee`, { at: knee, parent: hipJ });
    const ankleJ = b.joint(`${name}Ankle`, { at: ankle, parent: kneeJ });
    seg(hipJ, top, knee, 0.035, WOOD);
    seg(kneeJ, knee, ankle, 0.03, WOOD);
    // knee knob
    b.part(new THREE.SphereGeometry(0.04, 6, 5), WOOD_DARK, { at: knee, bone: kneeJ });
    // hoof
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.05, 6), HOOF, {
      at: [x, 0.025, z - 0.02],
      bone: ankleJ,
    });
  };
  leg("frontL", 0.2, 0.22);
  leg("frontR", -0.2, 0.22);
  leg("hindL", 0.2, -0.16);
  leg("hindR", -0.2, -0.16);

  // ---------- Neck (stone, sweeps up into the head) ----------
  b.sweep(
    [
      [0, 1.02, 0.3],
      [0, 1.28, 0.42],
      [0, 1.46, 0.54],
    ],
    0.12,
    { color: STONE },
  );
  b.part(new THREE.DodecahedronGeometry(0.1, 0), MOSS, {
    at: [0, 1.36, 0.42],
    bone: neck,
    scale: [1.2, 0.5, 1],
  });

  // ---------- Pale wooden mask face ----------
  b.part(new THREE.BoxGeometry(0.22, 0.24, 0.16), PALE, {
    at: [0, 1.5, 0.68],
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.1), PALE, {
    at: [0, 1.42, 0.78],
    bone: jaw,
  });
  b.part(new THREE.BoxGeometry(0.035, 0.03, 0.02), WOOD_DARK, {
    at: [0, 1.44, 0.845],
    bone: jaw,
  });
  // eye sockets
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.07, 0.05, 0.02), WOOD_DARK, {
      at: [0.058 * s, 1.52, 0.762],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GLOW, {
      at: [0.058 * s, 1.52, 0.77],
      bone: head,
    });
  }
  // a few carved lines on the mask
  b.part(new THREE.BoxGeometry(0.02, 0.12, 0.01), WOOD_DARK, {
    at: [0, 1.52, 0.765],
    bone: head,
  });

  // ---------- Antlers with flowers and leaves ----------
  const antler = (s: number) => {
    b.sweep(
      [
        [0.06 * s, 1.6, 0.52],
        [0.1 * s, 1.8, 0.48],
        [0.2 * s, 1.95, 0.44],
      ],
      0.022,
      { color: ANTLER },
    );
    b.sweep(
      [
        [0.1 * s, 1.76, 0.5],
        [0.22 * s, 1.8, 0.47],
      ],
      0.014,
      { color: ANTLER },
    );
    b.sweep(
      [
        [0.14 * s, 1.86, 0.48],
        [0.22 * s, 2.04, 0.43],
      ],
      0.014,
      { color: ANTLER },
    );
    // flowers at the tips
    for (const p of [
      [0.2 * s, 1.97, 0.44],
      [0.23 * s, 1.8, 0.47],
      [0.23 * s, 2.06, 0.43],
    ] as [number, number, number][]) {
      b.part(new THREE.SphereGeometry(0.028, 6, 5), PETAL, { at: p, bone: head });
      b.part(new THREE.SphereGeometry(0.012, 5, 4), FIREFLY, { at: p, bone: head });
    }
    // leaves on the branches
    for (const p of [
      [0.15 * s, 1.9, 0.45],
      [0.12 * s, 1.72, 0.5],
    ] as [number, number, number][]) {
      b.part(new THREE.SphereGeometry(0.04, 5, 4), LEAF, {
        at: p,
        bone: head,
        scale: [1, 0.3, 0.6],
      });
    }
  };
  antler(1);
  antler(-1);

  // ---------- Fireflies circling the head ----------
  const flies: [number, number, number][] = [
    [0.35, 1.7, 0.6],
    [-0.3, 1.86, 0.5],
    [0.25, 1.4, 0.92],
    [-0.4, 1.55, 0.8],
    [0.1, 2.14, 0.7],
  ];
  for (const p of flies) {
    b.part(new THREE.SphereGeometry(0.025, 6, 5), FIREFLY, { at: p, bone: head });
  }

  return b.root;
}
```