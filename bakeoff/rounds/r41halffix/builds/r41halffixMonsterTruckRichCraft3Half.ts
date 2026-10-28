import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { cellPaint, pixelArt } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "monster-truck",
  description: "Pixel-art monster truck: flame-painted red body riding on huge lugged tyres, yellow shocks, light bar.",
};

export default function build() {
  const b = createBuilder({ name: "monster-truck" });
  const T = 0.08;

  const RUBBER = cellPaint(T, (c) => (c.random(1) < 0.12 ? "#0c0c0f" : c.pick(["#141418", "#1f1f26", "#2a2a33"], 0.4 + 0.3 * c.random(4))), { dither: true });
  const STEEL = cellPaint(T, (c) => c.pick(["#5c6270", "#8b93a3", "#c3cad6"], 0.3 + 0.5 * c.random(2) * (0.5 + 0.5 * c.n.y)));
  const BODY = cellPaint(T, (c) => {
    if (c.axis === 1) return c.n.y > 0 ? (c.random(3) < 0.08 ? "#d12a22" : "#e5382c") : "#6b1410";
    const z = c.at.z;
    const top = 1.95 + 0.55 * Math.min(1, Math.max(0, (z + 0.6) / 2.6)) + 0.14 * c.random(2);
    const d = top - c.at.y;
    if (c.at.y < 3.0 && d > 0) {
      if (c.at.y < 2.0) return "#2b0d0a";
      if (d < 0.14) return "#ffe34a";
      if (d < 0.3) return "#ff9a1f";
      return "#ff6a1a";
    }
    return c.random(5) < 0.06 ? "#c7241c" : "#e5382c";
  });
  const GLASS = "#1c3a66";
  const DARK = "#17171c";
  const YELLOW = "#ffd21f";
  const NUM = pixelArt(
    ["wwwwwww", "wkkkkkw", "wwwwwkw", "wwwwkww", "wwwkwww", "wwwkwww", "wwkwwww", "wwkwwww", "wwwwwww"],
    { w: "#fff6d8", k: "#1a1a22" },
  );

  const box = (size: number[], color: any, at: number[], rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: at as any, rotation: rotation as any });

  // --- wheels
  const R = 0.8, AY = 0.85;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.5, z = sz * 1.6;
      b.part(new THREE.CylinderGeometry(R, R, 0.9, 12), RUBBER, { at: [x, AY, z], dir: [1, 0, 0] });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.26;
        box([0.92, 0.12, 0.2], RUBBER, [x, AY + Math.cos(a) * (R + 0.01), z + Math.sin(a) * (R + 0.01)], [(a * 180) / Math.PI, 0, 0]);
      }
      // sidewall ring + hub
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 10), "#0a0a0d", { at: [x + sx * 0.455, AY, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 10), STEEL, { at: [x + sx * 0.46, AY, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8), YELLOW, { at: [x + sx * 0.5, AY, z], dir: [1, 0, 0] });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        box([0.1, 0.07, 0.07], "#e9edf3", [x + sx * 0.5, AY + Math.cos(a) * 0.27, z + Math.sin(a) * 0.27]);
      }
    }

  // --- axles, diffs, shocks, frame
  for (const z of [1.6, -1.6]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 3.0, 8), STEEL, { at: [0, AY, z], dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.25, 6, 5), "#4a505c", { at: [0, AY, z] });
    for (const s of [1, -1]) {
      b.rod([s * 1.0, 0.95, z + 0.15], [s * 0.75, 1.85, z + 0.15], 0.07, YELLOW);
      b.rod([s * 1.0, 0.95, z - 0.15], [s * 0.75, 1.85, z - 0.15], 0.07, YELLOW);
      b.rod([s * 0.95, 1.2, z], [s * 0.95, 1.55, z], 0.12, "#3a3f4a");
      box([0.12, 0.1, 0.5], "#3a3f4a", [s * 0.7, 1.82, z]);
    }
  }
  for (const s of [1, -1]) box([0.14, 0.2, 4.3], "#2d313b", [s * 0.7, 1.75, 0]);
  box([1.5, 0.15, 0.2], "#2d313b", [0, 1.75, 0.8]);
  box([1.5, 0.15, 0.2], "#2d313b", [0, 1.75, -0.8]);
  b.rod([0, AY + 0.05, -1.6], [0, AY + 0.05, 1.6], 0.07, "#6a6f7b"); // driveshaft

  // --- body
  box([2.0, 0.6, 4.5], BODY, [0, 2.2, 0]); // lower
  box([1.96, 0.18, 1.5], BODY, [0, 2.59, 1.55]); // hood
  box([0.6, 0.12, 0.7], DARK, [0, 2.72, 1.6]); // scoop
  box([0.5, 0.1, 0.5], "#ff6a1a", [0, 2.8, 1.6]);
  box([2.0, 1.0, 1.5], BODY, [0, 3.0, 0.2]); // cab
  box([2.1, 0.1, 1.6], BODY, [0, 3.55, 0.2]); // roof
  box([1.8, 0.8, 0.06], GLASS, [0, 3.0, 0.98], [-14, 0, 0]);
  box([1.7, 0.6, 0.06], GLASS, [0, 3.05, -0.57]);
  for (const s of [1, -1]) {
    box([0.06, 0.55, 1.15], GLASS, [s * 1.0, 3.08, 0.25]);
    b.part(new THREE.PlaneGeometry(0.62, 0.8), "#ffffff", { at: [s * 1.003, 2.2, 0.35], dir: [s, 0, 0], axis: "z", texture: NUM });
    box([0.1, 0.06, 0.3], STEEL, [s * 1.02, 2.75, 0.62]); // door handle
    box([0.1, 0.7, 0.04], STEEL, [s * 1.07, 3.08, 1.0]); // mirror arm
    box([0.1, 0.2, 0.05], STEEL, [s * 1.14, 3.1, 1.0]);
    // bed walls
    box([0.1, 0.45, 1.8], BODY, [s * 0.95, 2.67, -1.3]);
    // exhaust stacks
    b.rod([s * 0.7, 2.5, -0.65], [s * 0.7, 3.9, -0.65], 0.09, STEEL);
    b.rod([s * 0.7, 3.9, -0.65], [s * 0.7, 3.98, -0.65], 0.14, "#1a1a1f", { caps: "flat" });
  }
  box([2.0, 0.45, 0.1], BODY, [0, 2.67, -2.2]); // tailgate
  box([1.9, 0.05, 1.8], "#2a2a30", [0, 2.5, -1.3]); // bed floor

  // --- front end
  box([1.7, 0.45, 0.1], DARK, [0, 2.2, 2.28]); // grille
  for (let i = 0; i < 4; i++) box([1.6, 0.05, 0.06], STEEL, [0, 2.07 + i * 0.1, 2.34]);
  box([2.2, 0.28, 0.25], STEEL, [0, 1.85, 2.38]); // bumper
  box([2.2, 0.28, 0.25], STEEL, [0, 1.85, -2.38]);
  for (const s of [1, -1]) {
    glow(box([0.3, 0.2, 0.06], "#fff6b0", [s * 0.75, 2.45, 2.3]), 1.4);
    glow(box([0.3, 0.2, 0.06], "#ff2a2a", [s * 0.75, 2.35, -2.26]), 1.2);
    box([0.24, 0.5, 0.3], STEEL, [s * 0.95, 1.45, 2.3]);
  }

  // --- light bar
  box([1.7, 0.1, 0.25], DARK, [0, 3.67, 0.55]);
  for (let i = 0; i < 5; i++) {
    glow(box([0.26, 0.14, 0.12], "#fffbd0", [-0.68 + i * 0.34, 3.76, 0.6]), 1.5);
  }
  // antenna
  b.rod([-0.8, 3.6, -0.5], [-0.8, 4.3, -0.5], 0.015, "#101014");

  return b.root;
}
