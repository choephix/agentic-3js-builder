import * as THREE from "three";
import { createBuilder, catmull, polyline, rng } from "../../../../src/index";

export const meta = {
  name: "seahorse",
  description: "A stylised upright seahorse with a curled prehensile tail, tube snout, coronet and dorsal fin.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const rand = rng(11);

  const GOLD = "#e9a23b";
  const BELLY = "#f7d98b";
  const FIN = "#f2844b";
  const DEEP = "#c4602b";
  const EYE_W = "#fffaf0";
  const EYE_K = "#1d1a18";

  // Skeleton: trunk rises from the base, the head sits on top, the snout runs forward.
  const trunkPath = catmull([
    [0, 0.09, 0],
    [0, 0.13, 0.008],
    [0, 0.165, 0.025],
    [0, 0.195, 0.05],
  ]);
  const trunk = b.chain("spine", trunkPath, { role: "spine" });

  const head = b.joint("head", { at: [0, 0.225, 0.07] });

  const snoutPath = polyline([
    [0, 0.225, 0.085],
    [0, 0.22, 0.12],
    [0, 0.2, 0.165],
  ]);
  b.chain("snout", snoutPath, { role: "head" });

  const jawPath = polyline([
    [0, 0.216, 0.085],
    [0, 0.21, 0.12],
    [0, 0.194, 0.158],
  ]);
  b.chain("jaw", jawPath, { role: "jaw" });

  const tailPath = catmull([
    [0, 0.09, 0],
    [0, 0.05, -0.02],
    [0, 0.02, -0.03],
    [0, 0.012, -0.012],
    [0, 0.024, 0.012],
    [0, 0.05, 0.01],
  ]);
  b.chain("tail", tailPath, { role: "tail" });

  // Body: a tapered trunk sweep plus a rounded chest and a pale belly pouch.
  b.sweep(trunkPath, 0.021, { color: GOLD });
  b.part(new THREE.SphereGeometry(0.032, 10, 8), GOLD, { at: [0, 0.14, 0.012] });
  b.part(new THREE.SphereGeometry(0.026, 10, 8), BELLY, { at: [0, 0.112, 0.024] });

  // Tail, curled under the body.
  b.sweep(tailPath, 0.0085, { color: GOLD });

  // Head and snout.
  b.part(new THREE.SphereGeometry(0.024, 10, 8), GOLD, { at: [0, 0.226, 0.07], bone: head });
  b.sweep(snoutPath, 0.011, { color: GOLD });
  b.sweep(jawPath, 0.0095, { color: BELLY });

  // Eyes: white sclera with dark pupil on each side of the head.
  for (const s of [1, -1]) {
    const ex = 0.017 * s;
    b.part(new THREE.SphereGeometry(0.008, 8, 6), EYE_W, { at: [ex, 0.232, 0.085] });
    b.part(new THREE.SphereGeometry(0.0048, 6, 5), EYE_K, { at: [ex + 0.004 * s, 0.233, 0.092] });
  }

  // Coronet: a small crown of spikes on top of the head.
  b.spike([0, 0.244, 0.068], [0, 1, -0.3], 0.02, 0.005);
  b.spike([0.008, 0.241, 0.066], [0.4, 1, -0.2], 0.016, 0.004);
  b.spike([-0.008, 0.241, 0.066], [-0.4, 1, -0.2], 0.016, 0.004);

  // Dorsal fin: flat extruded fan on the back of the trunk, one per side for a clean read.
  const dorsal = [
    [0, 0],
    [-0.035, 0.028],
    [-0.04, 0.05],
    [-0.01, 0.036],
    [0.012, 0.01],
  ];
  b.extrude(dorsal, { at: [0.002, 0.11, -0.004], x: [0, 0, 1], y: [0, 1, 0] });

  // Pectoral fins: small flat paddles on each flank.
  const pectoral = [
    [0, 0],
    [0.03, 0.012],
    [0.034, -0.012],
    [0, -0.014],
  ];
  b.extrude(pectoral, { at: [0.02, 0.135, 0.02], x: [0, 0, 1], y: [0, 1, 0] });
  b.extrude(pectoral, { at: [-0.02, 0.135, 0.02], x: [0, 0, 1], y: [0, 1, 0] });

  // Dorsal spines running up the back of the trunk.
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + i * 0.12;
    const f = trunk.at(t);
    const r = 0.0035 + rand() * 0.001;
    b.spike(f, [0, 0.7, -0.7], 0.011 + rand() * 0.003, r);
  }

  // Tail tip accent.
  b.part(new THREE.SphereGeometry(0.0095, 8, 6), DEEP, { at: [0, 0.012, -0.012] });

  return b.root;
}
