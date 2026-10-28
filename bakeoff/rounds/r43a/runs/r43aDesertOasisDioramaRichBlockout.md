```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "desert oasis",
  description: "Round desert diorama with a pond, palm trees, two tents and two camels.",
};

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const SAND = "#e8c47a", DUNE = "#d9aa5c", WATER = "#3fb6c9", GRASS = "#6aa84f";
  const TRUNK = "#8a5a2b", LEAF = "#2f8f46", TENT = "#d9484a", TENT2 = "#f2e2b8";
  const CAMEL = "#c18a4a", DARK = "#7a4b22", ROCK = "#a08060";

  const root = b.joint("root", { at: [0, 0, 0] });

  // base disc
  b.part(new THREE.CylinderGeometry(3, 3.2, 0.3, 14), SAND, { bone: root, at: [0, 0.14, 0] });
  // dunes
  b.part(new THREE.SphereGeometry(1, 8, 5), DUNE, { bone: root, at: [-1.9, 0.2, -1.8], scale: [1.4, 0.6, 1.1] });
  b.part(new THREE.SphereGeometry(1, 8, 5), DUNE, { bone: root, at: [2.0, 0.2, -2.0], scale: [1.2, 0.45, 1] });
  // pond and grass rim
  b.part(new THREE.CylinderGeometry(1.15, 1.25, 0.1, 12), GRASS, { bone: root, at: [0, 0.33, 0.1] });
  b.part(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 12), WATER, { bone: root, at: [0, 0.37, 0.1] });
  for (const [x, z] of [[0.5, 0.6], [-0.6, -0.4], [0.3, -0.7]])
    b.part(new THREE.DodecahedronGeometry(0.1, 0), ROCK, { bone: root, at: [x * 1.2, 0.42, z * 1.2 + 0.1] });

  // palms
  const palms: [number, number, number][] = [[-0.9, 0.9, 1.5], [1.0, -0.6, 1.8], [-0.7, -1.0, 1.3]];
  for (const [x, z, h] of palms) {
    const top: [number, number, number] = [x + 0.15, 0.35 + h, z];
    b.rod([x, 0.3, z], top, [0.1, 0.06], TRUNK, { bone: root });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const tip: [number, number, number] = [top[0] + Math.sin(a) * 0.7, top[1] - 0.25, top[2] + Math.cos(a) * 0.7];
      b.rod(top, tip, [0.07, 0.01], LEAF, { bone: root });
    }
    b.part(new THREE.SphereGeometry(0.1, 6, 4), DARK, { bone: root, at: [top[0], top[1] - 0.05, top[2]] });
  }

  // tents
  const tents: [number, number, number, string][] = [[1.6, 1.0, 0.4, TENT], [-1.7, 0.2, -0.6, TENT2]];
  for (const [x, z, rot, c] of tents) {
    b.part(new THREE.ConeGeometry(0.65, 0.9, 4), c, { bone: root, at: [x, 0.75, z], rotation: [0, 45 + rot * 30, 0] });
    b.part(new THREE.BoxGeometry(0.25, 0.4, 0.05), DARK, { bone: root, at: [x + Math.sin(rot) * 0.3, 0.5, z + 0.32] });
  }

  // camels
  const camels: [number, number, number][] = [[0.2, 1.9, 0], [-1.6, 1.5, 0.8]];
  for (const [cx, cz, ry] of camels) {
    const rot = (v: [number, number, number]): [number, number, number] => {
      const c = Math.cos(ry), s = Math.sin(ry);
      return [cx + v[0] * c + v[2] * s, v[1], cz - v[0] * s + v[2] * c];
    };
    b.part(new THREE.BoxGeometry(0.35, 0.4, 0.8), CAMEL, { bone: root, at: rot([0, 0.95, 0]), rotation: [0, (ry * 180) / Math.PI, 0] });
    b.part(new THREE.SphereGeometry(0.17, 6, 5), CAMEL, { bone: root, at: rot([0, 1.25, -0.1]) });
    b.part(new THREE.SphereGeometry(0.17, 6, 5), CAMEL, { bone: root, at: rot([0, 1.25, 0.2]) });
    b.rod(rot([0, 1.05, 0.38]), rot([0, 1.5, 0.55]), 0.08, CAMEL, { bone: root });
    b.part(new THREE.BoxGeometry(0.16, 0.18, 0.3), CAMEL, { bone: root, at: rot([0, 1.55, 0.7]), rotation: [0, (ry * 180) / Math.PI, 0] });
    b.rod(rot([0, 0.9, -0.4]), rot([0, 0.7, -0.6]), [0.05, 0.02], DARK, { bone: root });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        b.rod(rot([sx * 0.13, 0.78, sz * 0.3]), rot([sx * 0.13, 0.3, sz * 0.3]), [0.06, 0.04], DARK, { bone: root });
  }

  return b.root;
}
```