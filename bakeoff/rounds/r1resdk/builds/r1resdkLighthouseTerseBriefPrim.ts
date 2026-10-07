import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lighthouse Island",
  description: "A striped lighthouse on a tiny rocky island with a boathouse, dock, and rowboat.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const r = rng(7);
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---- Island ----
  b.part({ geometry: new THREE.CylinderGeometry(2.6, 3.4, 0.5, 9), color: "#5f6670", at: [0, 0.2, 0] });
  b.part({ geometry: new THREE.CylinderGeometry(2.2, 2.6, 0.3, 9), color: "#6b8f4a", at: [0, 0.55, 0] });
  b.part({ geometry: new THREE.CylinderGeometry(1.5, 2.0, 0.25, 8), color: "#7aa355", at: [0, 0.8, 0] });
  // rocks around the shore
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * 0.3;
    const d = 2.6 + r() * 0.9;
    const s = 0.3 + r() * 0.35;
    b.part({
      geometry: new THREE.DodecahedronGeometry(s, 0),
      color: i % 2 ? "#4b525b" : "#747b85",
      at: [Math.cos(a) * d, s * 0.35, Math.sin(a) * d],
      rotation: [r() * 3, r() * 3, r() * 3],
    });
  }
  // grass tufts / bushes
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = 1.4 + r() * 0.8;
    b.part({
      geometry: new THREE.IcosahedronGeometry(0.2 + r() * 0.12, 0),
      color: i % 2 ? "#3f7a3a" : "#4f9145",
      at: [Math.cos(a) * d, 1.05, Math.sin(a) * d],
    });
  }

  // ---- Tower ----
  const baseY = 0.92;
  b.part({ geometry: new THREE.CylinderGeometry(0.95, 1.05, 0.5, 10), color: "#8a8f98", at: [0, baseY + 0.25, 0] });
  const segs = 6;
  const segH = 0.8;
  let y = baseY + 0.5;
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs;
    const r0 = 0.82 - t0 * 0.3, r1 = 0.82 - t1 * 0.3;
    b.part({
      geometry: new THREE.CylinderGeometry(r1, r0, segH, 10),
      color: i % 2 ? "#c8352f" : "#f4efe6",
      at: [0, y + segH / 2, 0],
    });
    y += segH;
  }
  const topR = 0.52;
  // windows
  for (let i = 0; i < 4; i++) {
    const yy = baseY + 1.2 + i * 1.0;
    const rad = 0.82 - ((yy - baseY) / (segs * segH + 0.5)) * 0.3;
    b.part({ geometry: new THREE.BoxGeometry(0.16, 0.26, 0.1), color: "#27384f", at: [0, yy, rad - 0.01] });
    b.part({ geometry: new THREE.BoxGeometry(0.22, 0.04, 0.14), color: "#d8d2c4", at: [0, yy - 0.15, rad + 0.01] });
  }
  // door
  b.part({ geometry: new THREE.BoxGeometry(0.34, 0.55, 0.12), color: "#6a3f22", at: [0, baseY + 0.5 + 0.05, 1.0] });
  b.part({ geometry: new THREE.CylinderGeometry(0.17, 0.17, 0.12, 8), color: "#6a3f22", at: [0, baseY + 0.85, 1.0], rotation: [Math.PI / 2, 0, 0] });

  // gallery
  b.part({ geometry: new THREE.CylinderGeometry(0.85, 0.7, 0.14, 12), color: "#2f3540", at: [0, y + 0.07, 0] });
  y += 0.14;
  // railing
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part({ geometry: new THREE.BoxGeometry(0.04, 0.3, 0.04), color: "#2f3540", at: [Math.cos(a) * 0.82, y + 0.15, Math.sin(a) * 0.82] });
  }
  b.part({ geometry: new THREE.TorusGeometry(0.82, 0.025, 4, 16), color: "#2f3540", at: [0, y + 0.3, 0], rotation: [Math.PI / 2, 0, 0] });

  // lantern room
  b.part({ geometry: new THREE.CylinderGeometry(0.46, 0.46, 0.55, 8), color: "#ffe9a0", at: [0, y + 0.275, 0], emissive: undefined });
  b.part({ geometry: new THREE.SphereGeometry(0.2, 6, 5), color: "#fff6c8", at: [0, y + 0.28, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part({ geometry: new THREE.BoxGeometry(0.05, 0.58, 0.05), color: "#2f3540", at: [Math.cos(a) * 0.47, y + 0.28, Math.sin(a) * 0.47] });
  }
  y += 0.55;
  b.part({ geometry: new THREE.CylinderGeometry(0.5, 0.5, 0.06, 8), color: "#2f3540", at: [0, y + 0.03, 0] });
  b.part({ geometry: new THREE.ConeGeometry(0.58, 0.45, 8), color: "#c8352f", at: [0, y + 0.28, 0] });
  b.part({ geometry: new THREE.SphereGeometry(0.07, 6, 5), color: "#2f3540", at: [0, y + 0.55, 0] });
  b.part({ geometry: new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), color: "#2f3540", at: [0, y + 0.7, 0] });

  // ---- Boathouse / keeper cottage ----
  const cx = 1.5, cz = 0.8;
  b.part({ geometry: new THREE.BoxGeometry(0.9, 0.5, 0.7), color: "#efe6d2", at: [cx + 0.2, 0.93 + 0.25, cz], rotation: [0, 0.4, 0] });
  b.part({ geometry: new THREE.ConeGeometry(0.75, 0.4, 4), color: "#8c3b2e", at: [cx + 0.2, 1.65, cz], rotation: [0, 0.4 + Math.PI / 4, 0], scale: [1, 1, 0.8] });
  b.part({ geometry: new THREE.BoxGeometry(0.14, 0.3, 0.1), color: "#6a3f22", at: [cx + 0.2 + Math.sin(0.4) * 0.0 + 0.13, 1.08, cz + 0.36], rotation: [0, 0.4, 0] });

  // ---- Dock ----
  const dockA = -0.7;
  for (let i = 0; i < 6; i++) {
    b.part({ geometry: new THREE.BoxGeometry(0.4, 0.06, 0.9 - 0.0), color: i % 2 ? "#9a6b3e" : "#8a5c33", at: [-2.6 - i * 0.0 - 0.0, 0.5, 0], scale: [1, 1, 1], rotation: [0, 0, 0] });
    break;
  }
  for (let i = 0; i < 6; i++) {
    b.part({ geometry: new THREE.BoxGeometry(0.22, 0.05, 0.8), color: i % 2 ? "#9a6b3e" : "#8a5c33", at: [-2.5 - i * 0.25, 0.5, 0.0] });
  }
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      b.part({ geometry: new THREE.CylinderGeometry(0.04, 0.04, 0.6, 5), color: "#5a3a20", at: [-2.7 - i * 0.55, 0.25, s * 0.4] });
    }
  }

  // ---- Rowboat ----
  const bx = -3.5, bz = 1.1;
  b.part({ geometry: new THREE.BoxGeometry(0.5, 0.14, 1.0), color: "#2e6fa5", at: [bx, 0.12, bz], scale: [1, 1, 1] });
  b.part({ geometry: new THREE.ConeGeometry(0.25, 0.4, 4), color: "#2e6fa5", at: [bx, 0.12, bz + 0.65], rotation: [Math.PI / 2, 0, Math.PI / 4], scale: [1, 1, 0.5] });
  b.part({ geometry: new THREE.BoxGeometry(0.46, 0.03, 0.9), color: "#e8d7a8", at: [bx, 0.2, bz] });
  b.part({ geometry: new THREE.BoxGeometry(0.5, 0.03, 0.12), color: "#c8352f", at: [bx, 0.19, bz - 0.1] });

  // ---- Seagulls on rocks ----
  for (let i = 0; i < 2; i++) {
    const gx = 1.0 - i * 3.0, gz = 2.7 - i * 0.2;
    b.part({ geometry: new THREE.SphereGeometry(0.09, 5, 4), color: "#f8f8f8", at: [gx, 0.62, gz], scale: [1, 0.9, 1.4] });
    b.part({ geometry: new THREE.SphereGeometry(0.05, 5, 4), color: "#f8f8f8", at: [gx, 0.74, gz + 0.1] });
    b.part({ geometry: new THREE.ConeGeometry(0.02, 0.07, 4), color: "#f2a93b", at: [gx, 0.74, gz + 0.17], rotation: [Math.PI / 2, 0, 0] });
  }

  return b.root;
}
