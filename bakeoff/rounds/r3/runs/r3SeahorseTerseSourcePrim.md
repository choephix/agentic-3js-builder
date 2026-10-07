```ts
import * as THREE from "three";
import { createBuilder, catmull, stripes, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description: "A stylized upright seahorse with a curled prehensile tail, banded body, dorsal fin, crown and a hinged snout.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seahorse" });

  const ORANGE = "#e9a43c";
  const DEEP = "#d98a2c";
  const BAND = "#8a4a1c";
  const FIN = "#f4c97a";
  const BODY = stripes(mottle(ORANGE, DEEP, { size: 0.02, seed: 2 }), BAND, {
    size: 0.012,
    axis: "y",
    width: 0.22,
    wobble: 0.4,
  });

  const root = b.joint("root", { at: [0, 0.08, 0.012], dir: [0, 1, 0] });

  // Neck and torso, rising from the belly
  const neckPath = catmull([
    [0, 0.08, 0.012],
    [0, 0.1, 0.022],
    [0, 0.12, 0.018],
    [0, 0.138, 0.008],
  ]);
  const neck = b.chain("neck", neckPath, { parent: root, count: 5, role: "neck" });
  const neckR = (t: number) => 0.028 - 0.016 * Math.pow(t, 0.7);
  b.sweep(neck, {
    radius: (t: number) => [neckR(t) * 0.8, neckR(t)] as [number, number],
    color: BODY,
    sides: 8,
  });

  // Curled prehensile tail
  const tailPath = catmull([
    [0, 0.08, 0.012],
    [0, 0.062, 0.004],
    [0, 0.046, -0.008],
    [0, 0.032, -0.016],
    [0, 0.016, -0.014],
    [0, 0.0065, 0.0],
    [0, 0.0065, 0.014],
    [0, 0.016, 0.024],
    [0, 0.03, 0.025],
    [0, 0.036, 0.015],
    [0, 0.03, 0.008],
  ]);
  const tail = b.chain("tail", tailPath, { parent: root, count: 10, role: "tail" });
  const tailR = (t: number) => 0.003 + 0.023 * Math.pow(1 - t, 2.2);
  b.sweep(tail, {
    radius: (t: number) => [tailR(t) * 0.85, tailR(t)] as [number, number],
    color: BODY,
    sides: 8,
  });

  // Belly bulge
  b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
    at: [0, 0.075, 0.022],
    scale: [0.021, 0.03, 0.03],
    bone: root,
  });

  // Head
  const head = b.joint("head", { parent: neck, at: [0, 0.14, 0.008], dir: [0, 0.3, 1], role: "head" });
  b.part(new THREE.SphereGeometry(1, 10, 8), "#e2992f", {
    at: [0, 0.148, 0.014],
    scale: [0.013, 0.016, 0.018],
    bone: head,
  });
  b.rod([0, 0.147, 0.022], [0, 0.136, 0.062], { radius: [0.009, 0.0055], color: "#e2992f", bone: head, caps: "round" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.134, 0.03], dir: [0, -0.1, 1], role: "jaw" });
  b.rod([0, 0.132, 0.03], [0, 0.128, 0.06], { radius: [0.004, 0.0025], color: "#c9822a", bone: jaw, caps: "round" });

  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), "#f6e7a8", { at: [0.0125 * s, 0.152, 0.02], scale: 0.0058, bone: head });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#111111", { at: [0.0165 * s, 0.1525, 0.0215], scale: 0.003, bone: head });
  }

  // Crown
  const crown: Array<[number, number, number]> = [
    [0, 0.162, 0.01],
    [0.007, 0.16, 0.006],
    [-0.007, 0.16, 0.006],
    [0.004, 0.161, -0.002],
    [-0.004, 0.161, -0.002],
  ];
  crown.forEach((p, i) => {
    b.spike(p, [0, 1, -0.4], 0.01 - (i > 2 ? 0.003 : 0), 0.0035, { color: "#b8641f", bone: head, sides: 5 });
  });

  // Back spikes
  const spikeAlong = (path: ReturnType<typeof catmull>, rf: (t: number) => number, ts: number[], bone: string | typeof neck) => {
    for (const t of ts) {
      const p = path.at(t);
      b.spike([0, p.y, p.z - rf(t) * 0.85], [0, 0.5, -1], 0.008, 0.003, { color: "#b8641f", bone, sides: 5 });
    }
  };
  spikeAlong(neckPath, neckR, [0.15, 0.3, 0.45, 0.6, 0.75], neck);
  spikeAlong(tailPath, tailR, [0.05, 0.12, 0.2, 0.28, 0.36, 0.44], tail);

  // Dorsal fin, behind the torso
  const finD = b.joint("finDorsal", { parent: neck, at: [0, 0.07, -0.006], dir: [0, 1, 0], role: "hinge" });
  b.extrude(
    [
      [0, 0],
      [0.02, 0.004],
      [0.028, 0.02],
      [0.022, 0.038],
      [0, 0.044],
    ],
    {
      color: stripes(FIN, "#e08a3c", { size: 0.005, axis: "y", width: 0.3, wobble: 0.1 }),
      at: [0, 0.055, -0.005],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.002,
      smoothing: 1,
      bone: finD,
    },
  );

  // Pectoral fins
  for (const s of [1, -1]) {
    const f = b.joint(s > 0 ? "finL" : "finR", {
      parent: neck,
      at: [0.015 * s, 0.108, 0.002],
      dir: [0, 0.3, -1],
      role: "hinge",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), FIN, {
      at: [0.019 * s, 0.108, -0.004],
      scale: [0.0015, 0.011, 0.009],
      rotation: [-15, 0, 22 * s],
      bone: f,
    });
  }

  // Snout tip nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 5, 4), "#6b3a14", { at: [0.003 * s, 0.1385, 0.06], scale: 0.0012, bone: head });

  return b.root;
}
```