```ts
import * as THREE from "three";
import { catmull, createBuilder, polyline, spiral, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description: "A lined yellow seahorse curled round a strand of seagrass, with a crown of spikes, a tube snout and a fluttering dorsal fin.",
};

const YELLOW = "#f7c325";
const LINE = "#5b3410";
const FRECKLE = "#fff8dc";
const CROWN = "#f29a1b";
const FIN = "#ffd98a";
const GRASS = "#3f9a3e";
const WHITE = "#ffffff";
const PUPIL = "#1b130a";

export default function seahorse() {
  const b = createBuilder({ name: "seahorse", paintSize: 1024 });

  // Body paint: yellow with white freckles, crossed by thin dark rings (the bony ridges).
  const body = stripes(spots(YELLOW, FRECKLE, { size: 0.012, amount: 0.22, seed: 4 }), LINE, {
    size: 0.0085,
    axis: "y",
    width: 0.2,
    wobble: 0.35,
    seed: 2,
  });

  // Skeleton: root at the hips, a spine of three spans up to the neck, a head and a jaw.
  const hips = b.joint("hips", { at: [0, 0.072, 0] });

  const spinePath = catmull([
    [0, 0.072, 0],
    [0, 0.104, 0.008],
    [0, 0.134, 0.026],
    [0, 0.15, 0.042],
  ]);
  const spine = b.chain("spine", spinePath, {
    count: 3,
    names: ["abdomen", "chest", "neck"],
    role: "spine",
  });

  const head = b.joint("head", { parent: "neck", at: [0, 0.152, 0.046], dir: [0, 0.6, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.151, 0.058], dir: [0, -0.25, 1], role: "jaw" });

  // Tail: drops from the hips and coils 1.5 turns around the seagrass blade (axis up, at x 0, z -0.012).
  const coilCentre: [number, number, number] = [0, 0.03, -0.012];
  const coilStart: [number, number, number] = [0, 0.062, 0.006];
  const tailPath = polyline([
    [0, 0.072, 0],
    coilStart,
  ]).concat(spiral(coilCentre, coilStart, [0, 1, 0], { turns: 1.5, pitch: -0.02 }));
  const tail = b.chain("tail", tailPath, { role: "tail", parent: hips });

  // Trunk: a ridged tube that tapers into the neck.
  b.sweep(spine, {
    radius: [0.0145, 0.0185, 0.0175, 0.0125, 0.0105],
    color: body,
    sides: 10,
    name: "trunk",
  });

  // Tail tapers from the body into a fine curl.
  b.sweep(tail, {
    radius: [0.0095, 0.0085, 0.007, 0.0055, 0.0042, 0.0034],
    color: body,
    name: "tail",
  });

  // Head: a sculpted sphere, a tube snout and a separate lower jaw.
  b.part(new THREE.SphereGeometry(0.0125, b.segments(12), b.segments(9)), body, {
    bone: head,
    at: [0, 0.156, 0.046],
    scale: [1, 1.12, 1.35],
    name: "skull",
  });
  b.capsule([0, 0.158, 0.054], [0, 0.151, 0.108], [0.0098, 0.0048], {
    color: body,
    bone: head,
    name: "snoutUpper",
  });
  b.capsule([0, 0.151, 0.06], [0, 0.146, 0.102], [0.0045, 0.0028], {
    color: body,
    bone: jaw,
    name: "snoutLower",
  });

  // Crown of spikes on the back of the head.
  b.spike([0, 0.164, 0.034], [0, 1, -0.5], 0.014, 0.0038, { color: CROWN, bone: head, name: "crownTop" });
  b.spike([-0.005, 0.162, 0.034], [-0.5, 1, -0.4], 0.012, 0.0034, { color: CROWN, bone: head, name: "crownL" });
  b.spike([0.005, 0.162, 0.034], [0.5, 1, -0.4], 0.012, 0.0034, { color: CROWN, bone: head, name: "crownR" });
  b.spike([-0.008, 0.158, 0.032], [-0.8, 0.8, -0.5], 0.009, 0.003, { color: CROWN, bone: head, name: "crownOuterL" });
  b.spike([0.008, 0.158, 0.032], [0.8, 0.8, -0.5], 0.009, 0.003, { color: CROWN, bone: head, name: "crownOuterR" });

  // Big, curious eyes: white globes, dark pupils and a small catch-light.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0098, b.segments(14), b.segments(10)), WHITE, {
      bone: head,
      at: [s * 0.0105, 0.158, 0.046],
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.0054, b.segments(10), b.segments(8)), PUPIL, {
      bone: head,
      at: [s * 0.0185, 0.158, 0.05],
      name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.0016, 6, 4), WHITE, {
      bone: head,
      at: [s * 0.0218, 0.1605, 0.0535],
      name: "glint",
    });
  }

  // Dorsal fin: a thin membrane between the back of the trunk and a wavy trailing edge.
  const finRoot = catmull([
    [0, 0.084, -0.016],
    [0, 0.104, -0.019],
    [0, 0.124, -0.016],
    [0, 0.142, -0.01],
  ]);
  const finEdge = catmull([
    [0, 0.086, -0.04],
    [0, 0.1, -0.062],
    [0, 0.116, -0.052],
    [0, 0.13, -0.072],
    [0, 0.144, -0.04],
  ]);
  b.membrane(finRoot, finEdge, {
    color: FIN,
    thickness: 0.0014,
    rows: 6,
    bone: spine,
    name: "dorsalFin",
  });

  // Pectoral fins on each side of the chest.
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.0185, 0.1, 0.0],
        [s * 0.0185, 0.112, 0.011],
        [s * 0.0185, 0.106, 0.016],
        [s * 0.0185, 0.096, 0.007],
      ],
      { color: FIN, thickness: 0.0015, bone: "chest", name: "pectoral" },
    );
  }

  // Seagrass: a tall blade the tail holds, and a shorter blade beside it. Both stand on the floor.
  const blade = (x: number, z: number, h: number, lean: number, name: string) =>
    b.extrude(
      [
        [-0.0055, 0],
        [0.0055, 0],
        [0.0028, h * 0.5],
        [lean, h],
        [-0.0028, h * 0.5],
      ],
      {
        color: GRASS,
        at: [x, 0, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.0022,
        bevel: 0.0007,
        bone: hips,
        name,
      },
    );
  blade(0, -0.012, 0.2, 0.004, "seagrassMain");
  blade(0.028, -0.03, 0.13, -0.006, "seagrassSide");

  return b.root;
}
```