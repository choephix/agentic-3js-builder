The seahorse is an upright body on a skeleton, with a curled prehensile tail that rests on y = 0, a snout with a separate lower jaw, a crown, a dorsal fin and pectoral fins. Its banded gold paint runs across the body and tail as segmented armour. The model is about 18 cm tall. I haven't run it, so the tail's lowest point is only approximately on the floor.

```ts
import * as THREE from "three";
import { catmull, createBuilder, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "An upright seahorse about 18 cm tall: banded gold armour, a tube snout with a hinged lower jaw, a crown, a dorsal fin and pectoral fins, with a prehensile tail curled under the belly.",
};

// Tail coil: three quarter turns shrinking inward, curling forward under the belly.
const TURNS = 1.75 * Math.PI;
const coilR = (theta: number) => 0.03 - 0.018 * (theta / TURNS);
const tailR = (f: number) => 0.0085 - 0.0055 * f;
const CZ = 0.02;
// Lift the coil so its lowest tube surface sits on y = 0 (the bottom is at theta = pi).
const CY = coilR(Math.PI) + tailR(Math.PI / TURNS);

const tailPts: THREE.Vector3[] = [];
for (let i = 0; i <= 14; i++) {
  const th = (TURNS * i) / 14;
  const r = coilR(th);
  tailPts.push(new THREE.Vector3(0, CY + r * Math.cos(th), CZ + r * Math.sin(th)));
}

// Trunk: rises from the tail root, leans forward at the chest, runs up into the neck.
const trunkPts = [
  tailPts[0].clone(),
  new THREE.Vector3(0, 0.09, 0.024),
  new THREE.Vector3(0, 0.118, 0.03),
  new THREE.Vector3(0, 0.14, 0.04),
];

// Pectoral and dorsal fins, as flat outlines (x, y, z in metres).
const dorsal = [
  [0, 0.064, 0.004],
  [0, 0.102, 0.01],
  [0, 0.12, -0.018],
  [0, 0.094, -0.03],
  [0, 0.068, -0.012],
] as const;
const pectoral = (s: number) =>
  [
    [s * 0.012, 0.1, 0.03],
    [s * 0.03, 0.104, 0.02],
    [s * 0.034, 0.092, 0.018],
    [s * 0.014, 0.088, 0.026],
  ] as const;

export default function seahorse() {
  const b = createBuilder({ name: "seahorse", detail: 1, paintSize: 1024 });

  // Banded armour: gold with darker rings running across the body along y.
  const armour = stripes("#f2b53c", "#d9782b", { size: 0.012, axis: "y", width: 0.3 });
  const fin = "#ffe08a";
  const dark = "#2a1d14";

  // Root bone at the base of the tail and trunk.
  b.joint("hips", { at: tailPts[0], dir: [0, 1, 0] });

  // Prehensile tail: a chain along the coil, sweeping a tapering tube.
  const tail = b.chain("tail", catmull(tailPts), { parent: "hips", count: 4, role: "tail" });
  b.sweep(tail, (t: number) => 0.0085 - 0.0055 * t, { color: armour });

  // Trunk: spine chain whose tip joint is the head.
  const trunk = b.chain("torso", catmull(trunkPts), {
    parent: "hips",
    names: ["torso", "chest", "neck", "head"],
    role: "spine",
  });
  b.sweep(trunk, (t: number) => 0.0105 + 0.0075 * Math.sin(Math.PI * Math.min(t * 1.15, 1)), {
    color: armour,
  });

  // Skull: an elongated sphere on the head bone.
  b.part(new THREE.SphereGeometry(0.017, b.segments(10), b.segments(8)), "#f2b53c", {
    bone: "head",
    at: [0, 0.158, 0.046],
    scale: [1, 1.1, 1.35],
  });

  // Snout: a tapering tube from the skull, pointing forward and a little down.
  b.rod([0, 0.154, 0.056], [0, 0.136, 0.108], [0.0078, 0.0045], { color: "#f2b53c", bone: "head" });

  // Lower jaw, hinged at the back of the snout.
  b.joint("jaw", { parent: "head", at: [0, 0.146, 0.058], dir: [0, -0.2, 1], role: "jaw" });
  b.rod([0, 0.146, 0.058], [0, 0.134, 0.104], [0.0045, 0.0028], { color: "#e9a13a", bone: "jaw" });

  // Eyes: a pale ball with a dark pupil on each side of the head.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.0048, b.segments(8), b.segments(6)), "#f7efd0", {
      bone: "head",
      at: [s * 0.0135, 0.162, 0.05],
    });
    b.part(new THREE.SphereGeometry(0.0026, b.segments(6), b.segments(5)), dark, {
      bone: "head",
      at: [s * 0.0172, 0.162, 0.052],
    });
  }

  // Crown: three small spines on top of the head.
  const crown: Array<[number, number, number]> = [
    [0, 0.172, 0.04],
    [0.007, 0.166, 0.044],
    [-0.007, 0.166, 0.044],
  ];
  for (const p of crown) b.spike(p, [0, 1, -0.4], 0.013, 0.0032, { color: fin, bone: "head" });

  // Dorsal fin: a thin sail along the back of the trunk.
  b.slab(dorsal.map((p) => [...p]), { color: fin, thickness: 0.0018, bone: "torso", name: "dorsal fin" });

  // Pectoral fins: small fans on each side of the chest.
  for (const s of [-1, 1]) {
    b.slab(pectoral(s).map((p) => [...p]), {
      color: fin,
      thickness: 0.0016,
      bone: "chest",
      name: s > 0 ? "pectoral fin L" : "pectoral fin R",
    });
  }

  return b.root;
}
```