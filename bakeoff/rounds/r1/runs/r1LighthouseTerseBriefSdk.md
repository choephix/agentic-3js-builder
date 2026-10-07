```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Island Lighthouse",
  description: "A striped lighthouse with a keeper's cottage, dock and rowboat on a tiny rocky island.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse" });
  b.joint("root", { at: [0, 0, 0] });
  const root = b.root;

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const k = c + JSON.stringify(extra);
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.03, flatShading: true, ...extra });
    return mats[k];
  };
  const add = (g: THREE.BufferGeometry, c: string, p: [number, number, number], extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const m = new THREE.Mesh(g, mat(c, extra));
    m.position.set(...p);
    root.add(m);
    return m;
  };

  let seed = 12345;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  // Sea
  add(new THREE.CylinderGeometry(9, 9, 0.3, 24), "#2f7fa8", [0, 0.15 - 0.0, 0]);
  add(new THREE.TorusGeometry(5.6, 0.12, 4, 24), "#e8f4f8", [0, 0.32, 0]).rotation.x = Math.PI / 2;

  // Island
  add(new THREE.CylinderGeometry(4.6, 5.6, 1.5, 8), "#7a7068", [0, 0.7, 0]);
  add(new THREE.CylinderGeometry(4.0, 4.4, 0.3, 8), "#d9c48a", [0, 1.45, 0]);
  add(new THREE.CylinderGeometry(3.5, 3.8, 0.25, 8), "#5b9a4a", [0, 1.62, 0]);
  const top = 1.75;

  // Rocks
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + rnd() * 0.4;
    const r = 4.6 + rnd() * 1.6;
    const s = 0.4 + rnd() * 0.5;
    if (Math.abs(a - Math.PI / 2) < 0.35) continue; // keep dock side clear
    const m = add(new THREE.DodecahedronGeometry(s, 0), i % 2 ? "#6b635c" : "#857b72", [Math.cos(a) * r, 0.25, Math.sin(a) * r]);
    m.scale.y = 0.7;
    m.rotation.y = rnd() * 3;
  }
  // Bushes & flowers
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 2, r = 2.6 + rnd() * 0.7;
    add(new THREE.IcosahedronGeometry(0.28 + rnd() * 0.12, 0), "#3f7d3a", [Math.cos(a) * r, top + 0.1, Math.sin(a) * r]);
  }
  for (let i = 0; i < 8; i++) {
    const a = rnd() * Math.PI * 2, r = 1.9 + rnd() * 1.4;
    add(new THREE.OctahedronGeometry(0.07, 0), i % 2 ? "#ffd84a" : "#f28ab2", [Math.cos(a) * r, top + 0.05, Math.sin(a) * r]);
  }

  // Tower: banded frustums
  const bands = 5, bh = 2.2, r0 = 1.6, r1 = 1.0;
  add(new THREE.CylinderGeometry(1.8, 1.9, 0.3, 8), "#8d8a85", [0, top + 0.1, 0]);
  const base = top + 0.2;
  for (let i = 0; i < bands; i++) {
    const ra = r0 + (r1 - r0) * (i / bands);
    const rb = r0 + (r1 - r0) * ((i + 1) / bands);
    add(new THREE.CylinderGeometry(rb, ra, bh, 8), i % 2 ? "#f3efe6" : "#c8372d", [0, base + bh * (i + 0.5), 0]);
  }
  const towerTop = base + bh * bands;

  // Door (faces +Z)
  const dz = r0 - 0.02;
  add(new THREE.BoxGeometry(0.7, 1.2, 0.2), "#5a3a22", [0, base + 0.6, dz]);
  add(new THREE.BoxGeometry(0.9, 0.12, 0.3), "#b8b3aa", [0, base + 0.06, dz + 0.1]);
  add(new THREE.SphereGeometry(0.05, 5, 4), "#e8c14a", [0.2, base + 0.6, dz + 0.12]);
  // Windows
  for (let i = 1; i < bands; i++) {
    const y = base + bh * i + 0.2;
    const rr = r0 + (r1 - r0) * (i / bands) - 0.03;
    for (const ang of [Math.PI / 2 - 0.0, Math.PI / 2 + Math.PI]) {
      const x = Math.cos(ang) * rr, z = Math.sin(ang) * rr;
      const w = add(new THREE.BoxGeometry(0.3, 0.5, 0.12), "#1f3550", [x, y, z]);
      w.rotation.y = -ang + Math.PI / 2;
    }
  }

  // Gallery
  add(new THREE.CylinderGeometry(1.55, 1.2, 0.3, 8), "#2e3a45", [0, towerTop + 0.1, 0]);
  const gy = towerTop + 0.25;
  add(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 8), "#3a4753", [0, gy + 0.05, 0]);
  const posts = 16;
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.06, 0.7, 0.06), "#2e3a45", [Math.cos(a) * 1.5, gy + 0.45, Math.sin(a) * 1.5]);
  }
  add(new THREE.TorusGeometry(1.5, 0.04, 4, 16), "#2e3a45", [0, gy + 0.8, 0]).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(1.5, 0.03, 4, 16), "#2e3a45", [0, gy + 0.45, 0]).rotation.x = Math.PI / 2;

  // Lantern room
  const ly = gy + 0.1;
  const lh = 1.3;
  add(new THREE.CylinderGeometry(0.8, 0.8, lh, 8), "#ffe9a0", [0, ly + lh / 2, 0], {
    emissive: new THREE.Color("#ffcc55"), emissiveIntensity: 0.9, transparent: true, opacity: 0.85,
  });
  add(new THREE.SphereGeometry(0.3, 6, 5), "#fffbe0", [0, ly + lh / 2, 0], { emissive: new THREE.Color("#fff3b0"), emissiveIntensity: 1.5 });
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.06, lh, 0.06), "#2e3a45", [Math.cos(a) * 0.82, ly + lh / 2, Math.sin(a) * 0.82]);
  }
  add(new THREE.CylinderGeometry(0.88, 0.88, 0.1, 8), "#2e3a45", [0, ly + 0.05, 0]);
  add(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 8), "#2e3a45", [0, ly + lh, 0]);
  add(new THREE.ConeGeometry(1.05, 0.8, 8), "#c8372d", [0, ly + lh + 0.45, 0]);
  add(new THREE.SphereGeometry(0.12, 6, 5), "#e8c14a", [0, ly + lh + 0.9, 0]);
  add(new THREE.CylinderGeometry(0.02, 0.03, 0.8, 4), "#2e3a45", [0, ly + lh + 1.3, 0]);
  // Weather vane arm
  add(new THREE.BoxGeometry(0.5, 0.03, 0.03), "#2e3a45", [0, ly + lh + 1.45, 0]);

  // Light beams
  const beamY = ly + lh / 2;
  for (const s of [1, -1]) {
    const m = add(new THREE.ConeGeometry(1.1, 6, 8, 1, true), "#fff2b0", [s * 3.8, beamY, 0], {
      transparent: true, opacity: 0.22, emissive: new THREE.Color("#fff2b0"), emissiveIntensity: 0.6, side: THREE.DoubleSide,
    });
    m.rotation.z = s * Math.PI / 2 * -1;
    m.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    m.position.x = s * 3.8;
  }

  // Keeper's cottage
  const hx = 2.3, hz = 0.9;
  add(new THREE.BoxGeometry(1.7, 1.2, 1.4), "#efe4cc", [hx, top + 0.6, hz]);
  const roof = add(new THREE.ConeGeometry(1.45, 0.8, 4), "#8a3b2a", [hx, top + 1.6, hz]);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.0, 1, 0.85);
  add(new THREE.BoxGeometry(0.25, 0.6, 0.25), "#7a7068", [hx + 0.5, top + 1.9, hz - 0.2]);
  add(new THREE.BoxGeometry(0.35, 0.08, 0.35), "#5b534d", [hx + 0.5, top + 2.22, hz - 0.2]);
  add(new THREE.BoxGeometry(0.4, 0.8, 0.08), "#5a3a22", [hx - 0.3, top + 0.4, hz + 0.72]);
  add(new THREE.BoxGeometry(0.4, 0.35, 0.08), "#3b6d8f", [hx + 0.4, top + 0.7, hz + 0.72]);
  add(new THREE.BoxGeometry(0.5, 0.06, 0.14), "#5a3a22", [hx + 0.4, top + 0.5, hz + 0.76]);
  add(new THREE.BoxGeometry(0.08, 0.35, 0.4), "#3b6d8f", [hx + 0.86, top + 0.7, hz]);

  // Path from door to dock
  for (let i = 0; i < 4; i++) {
    add(new THREE.CylinderGeometry(0.28, 0.3, 0.05, 6), "#b5ada0", [0.1 * i, top + 0.02, 2 + i * 0.55]);
  }

  // Dock
  const dockY = 0.7;
  for (let i = 0; i < 7; i++) {
    add(new THREE.BoxGeometry(1.2, 0.08, 0.3), i % 2 ? "#8b6a45" : "#9c7a52", [0, dockY, 4.3 + i * 0.36]);
  }
  for (const x of [-0.65, 0.65]) {
    for (const z of [4.4, 5.5, 6.6]) {
      add(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 5), "#5a3a22", [x, dockY - 0.3, z]);
    }
  }

  // Rowboat
  const hull = add(new THREE.SphereGeometry(0.6, 8, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), "#2d5d8f", [1.6, 0.42, 6.0]);
  hull.scale.set(0.8, 0.6, 1.6);
  hull.rotation.y = 0.1;
  add(new THREE.BoxGeometry(0.9, 0.05, 0.12), "#d9b36a", [1.6, 0.5, 6.0]);

  // Mooring buoy
  add(new THREE.SphereGeometry(0.25, 6, 5), "#e04b2f", [-3.5, 0.35, 6.5]);
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 5), "#f3efe6", [-3.5, 0.62, 6.5]);

  // Gulls
  for (const [x, z] of [[-1.0, 2.8], [-0.3, 3.1]]) {
    add(new THREE.SphereGeometry(0.12, 5, 4), "#f5f5f5", [x, top + 0.15, z]).scale.set(1, 0.9, 1.4);
    add(new THREE.ConeGeometry(0.04, 0.1, 4), "#f2a93b", [x, top + 0.2, z + 0.2]).rotation.x = Math.PI / 2;
  }

  return root;
}
```