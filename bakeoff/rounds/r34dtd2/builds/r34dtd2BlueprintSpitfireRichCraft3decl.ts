import * as THREE from "three";
import { createBuilder, catmull, paint, noise, smoothstep, mix, svg } from "../../../../src/index";

export const meta = { name: "Spitfire Blueprint", description: "Supermarine Spitfire in cyanotype blueprint style" };

const BG = "#0e3a7a", MID = "#1f5fb0", LINE = "#cfe6ff", PALE = "#8fc0f0", DARK = "#082850";

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const fus = b.joint("fuselage", { at: [0, 1.3, 0], role: "spine" });
  const prop = b.joint("propeller", { at: [0, 1.3, 1.85], dir: [0, 0, 1], parent: fus });

  // cyanotype paint: deep blue with faint panel lines and paper-white glints on top
  const SKIN = paint((p, n) => {
    const g = noise(p, 0.3, 4);
    let c = mix(BG, MID, 0.35 + 0.4 * g);
    const seam = Math.abs(((p.z * 6) % 1) - 0.5) > 0.485 || Math.abs(((p.x * 5) % 1) - 0.5) > 0.49;
    if (seam) c = mix(c, LINE, 0.7);
    return mix(c, PALE, 0.35 * smoothstep(0.5, 1, n.y));
  });

  // fuselage
  const spine = catmull([[0,1.3,-3.6],[0,1.3,-2.4],[0,1.3,-0.8],[0,1.3,0.6],[0,1.3,1.7]]);
  b.sweep(spine, (t) => {
    const r = [0.04, 0.1, 0.22, 0.34, 0.36, 0.3, 0.25][0];
    const k = [0.04, 0.13, 0.25, 0.34, 0.28][Math.min(4, Math.floor(t * 5))];
    return [k * 0.85, k];
  }, { color: SKIN, bone: fus, sides: 10, caps: "point" } as any);
  // nose cowl and spinner
  b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.3, 10), DARK, { bone: fus, at: [0, 1.3, 1.75], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.15, 0.4, 10), LINE, { bone: prop, at: [0, 1.3, 2.05], dir: [0, 0, 1] });
  // canopy
  b.part(new THREE.SphereGeometry(1, 10, 6), "#9fd0ff", { bone: fus, at: [0, 1.62, 0.1], scale: [0.2, 0.17, 0.6] });
  // propeller blades
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    b.part(new THREE.BoxGeometry(0.12, 0.9, 0.025), LINE, {
      bone: prop, at: [Math.sin(a) * 0.45, 1.3 + Math.cos(a) * 0.45, 1.95], rotation: [0, 0, -a * 180 / Math.PI],
    });
  }
  // elliptical wings
  const wing = [[0,0],[1.0,0.05],[2.2,0.3],[3.3,0.9],[4.0,1.5],[4.1,1.6],[3.5,1.45],[2.0,1.0],[0,0.95],[-0]] as number[][];
  const outline = [[0,-0.6],[1.8,-0.5],[3.4,-0.1],[4.2,0.4],[3.4,0.5],[1.8,0.6],[0,0.7]];
  for (const s of [1, -1]) {
    b.extrude(outline.map(([x, z]) => [x, z] as [number, number]), {
      at: [0, 1.15, 0.0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.01, smoothing: 1, color: SKIN, bone: fus,
    });
    // roundel and cannons
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.01, 14), LINE, { bone: fus, at: [s * 2.4, 1.2, 0.1] });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 14), BG, { bone: fus, at: [s * 2.4, 1.21, 0.1] });
    b.rod([s * 1.3, 1.15, 0.5], [s * 1.3, 1.15, 1.2], 0.02, DARK, { bone: fus });
    // tailplane
    b.extrude([[0,-0.2],[1.0,-0.05],[1.1,0.15],[0,0.4]], {
      at: [0, 1.3, -3.2], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.04, color: SKIN, bone: fus,
    });
    // landing gear
    b.rod([s * 0.9, 1.15, 0.2], [s * 0.9, 0.2, 0.3], 0.04, LINE, { bone: fus });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 12), DARK, { bone: fus, at: [s * 0.9, 0.2, 0.3], rotation: [0, 0, 90] });
  }
  // fin
  b.extrude([[0,0],[0.9,0],[0.5,0.9],[0.2,0.9]], {
    at: [0, 1.3, -3.7], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, color: SKIN, bone: fus,
  });
  // tail wheel
  b.part(new THREE.SphereGeometry(0.07, 6, 4), DARK, { bone: fus, at: [0, 0.12, -3.3] });
  b.rod([0, 1.25, -3.2], [0, 0.12, -3.3], 0.025, LINE, { bone: fus });
  // blueprint labels
  const tag = svg(`<svg viewBox="0 0 100 30"><text x="50" y="20" fill="#cfe6ff" font-size="14" text-anchor="middle" font-family="monospace">SPITFIRE Mk.I</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(0.8, 0.24), "#ffffff", { bone: fus, at: [0.37, 1.3, -1.0], dir: [1, 0, 0], axis: "z", texture: tag });
  return b.root;
}
