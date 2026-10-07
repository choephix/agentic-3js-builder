```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Moon Jellyfish",
  description:
    "A glowing, translucent pale-blue moon jellyfish with four pink horseshoe gonads, a fringe of fine rim tentacles and four ruffled, trailing oral arms.",
};

export default function build() {
  const b = createBuilder({ name: "moonJelly" });
  const R = rng(7);

  const bellY = 0.62;
  const bell = b.joint("bell", { at: [0, bellY, 0] });
  const rim = b.joint("rim", { at: [0, bellY, 0], parent: bell });

  // Bell dome: low-poly translucent-looking hemisphere
  const dome = new THREE.SphereGeometry(0.32, 16, 7, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.72, 1);
  b.part(dome, "#b9e1f4", { at: [0, bellY, 0], bone: bell });

  // Inner glowing layer
  const inner = new THREE.SphereGeometry(0.25, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  inner.scale(1, 0.7, 1);
  b.part(inner, "#e6f6ff", { at: [0, bellY + 0.005, 0], bone: bell });

  // Glowing core
  b.part(new THREE.SphereGeometry(0.07, 10, 6), "#fff4c9", { at: [0, bellY + 0.04, 0], bone: bell });

  // Rim lip
  const lip = new THREE.TorusGeometry(0.315, 0.012, 5, 28);
  lip.rotateX(Math.PI / 2);
  b.part(lip, "#d6c8f5", { at: [0, bellY, 0], bone: rim });

  // Four pink horseshoes inside the bell
  for (let i = 0; i < 4; i++) {
    const phi = Math.PI / 4 + (i * Math.PI) / 2;
    const g = new THREE.TorusGeometry(0.065, 0.02, 5, 12, Math.PI * 1.5);
    g.rotateZ(phi - Math.PI * 1.75);
    g.rotateX(Math.PI / 2);
    g.translate(Math.cos(phi) * 0.11, 0, -Math.sin(phi) * 0.11);
    b.part(g, "#ff8fc0", { at: [0, bellY + 0.09, 0], bone: bell });
  }

  // Radial canals (thin ribs on the dome)
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rib = new THREE.BoxGeometry(0.006, 0.006, 0.24);
    rib.translate(0, 0, 0.14);
    rib.rotateX(-0.45);
    rib.rotateY(a);
    b.part(rib, "#9fd0ee", { at: [0, bellY + 0.01, 0], bone: bell });
  }

  // Rim marginal bulbs
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#d9a8ff", {
      at: [Math.cos(a) * 0.318, bellY - 0.005, Math.sin(a) * 0.318],
      bone: rim,
    });
  }

  // Fine rim tentacles
  const N = 56;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const len = 0.09 + R() * 0.07;
    const g = new THREE.CylinderGeometry(0.0025, 0.0045, len, 4);
    g.translate(0, -len / 2, 0);
    g.rotateZ(0.06 * Math.cos(i));
    b.part(g, i % 2 ? "#f3eaff" : "#e3d4fb", {
      at: [Math.cos(a) * 0.31, bellY - 0.01, Math.sin(a) * 0.31],
      bone: rim,
    });
  }

  // Four ruffled oral arms
  const segs = 9;
  const top = bellY - 0.02;
  const step = top / segs;
  for (let k = 0; k < 4; k++) {
    const az = Math.PI / 4 + (k * Math.PI) / 2 + Math.PI / 4;
    const cx = Math.cos(az), cz = Math.sin(az);
    let parent = bell;
    for (let s = 0; s < segs; s++) {
      const t = s / (segs - 1);
      const sway = Math.sin(t * 3 + k) * 0.03 * t;
      const rad = 0.05 + sway;
      const px = cx * rad, pz = cz * rad;
      const py = top - s * step;
      const j = b.joint(`arm${k}_${s}`, { at: [px, py, pz], parent });
      parent = j;
      const w = 0.075 * (1 - t * 0.55);
      const color = s % 2 ? "#e9defa" : "#fbf8ff";
      // Ruffled frill: crossed thin plates
      const plate = new THREE.BoxGeometry(w, step * 0.95, 0.014);
      plate.translate(0, -step / 2, 0);
      plate.rotateY(az + s * 0.9);
      b.part(plate, color, { at: [px, py, pz], bone: j });
      const plate2 = new THREE.BoxGeometry(w * 0.8, step * 0.9, 0.012);
      plate2.translate(0, -step / 2, 0);
      plate2.rotateY(az + s * 0.9 + Math.PI / 2);
      b.part(plate2, s % 2 ? "#c9b0ee" : "#d9c6f4", { at: [px, py, pz], bone: j });
      // frill bulbs at the edges
      const e = new THREE.SphereGeometry(0.011 * (1 - t * 0.4), 5, 4);
      e.translate(Math.cos(az + s * 0.9) * w * 0.5, -step * 0.5, Math.sin(az + s * 0.9) * w * 0.5);
      b.part(e, "#ffffff", { at: [px, py, pz], bone: j });
    }
  }

  return b.root;
}
```