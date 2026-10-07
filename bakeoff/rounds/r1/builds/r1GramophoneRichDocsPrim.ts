import * as THREE from "three";
import { createBuilder, catmull, mottle, stripes, gradient, svg, frame } from "../../../../src/index";

export const meta = {
  name: "Antique Gramophone",
  description: "Walnut cabinet gramophone with a morning-glory brass horn, record, tonearm, crank and claw feet.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const WOOD = "#5a3319", WOOD2 = "#3f2210", BRASS = "#b8923a", PATINA = "#6f9a78";
  const BLACK = "#111111", RED = "#b3202a", SILVER = "#c9ced3", DARK = "#2a1a0e";

  const base = b.joint("base", { at: [0, 0.1, 0] });
  const cab = b.joint("cabinet", { parent: base, at: [0, 0.2, 0], dir: [0, 1, 0] });
  const table = b.joint("turntable", { parent: cab, at: [0, 0.98, 0], dir: [0, 1, 0], role: "hinge" });
  const armBase = b.joint("tonearmBase", { parent: cab, at: [-0.2, 1.0, -0.17], dir: [0, 1, 0] });
  const arm = b.joint("tonearm", { parent: armBase, at: [-0.2, 1.12, -0.17], dir: [0.5, 0, 0.8], role: "arm" });
  const crank = b.joint("crank", { parent: cab, at: [0.31, 0.6, 0.0], dir: [1, 0, 0], role: "hinge" });

  const woodPaint = mottle(WOOD, WOOD2, { size: 0.06, contrast: 0.7, seed: 3 });
  const brassPaint = mottle(BRASS, PATINA, { size: 0.05, contrast: 0.6, seed: 5 });
  const brassGrad = gradient(brassPaint, PATINA, [0, 1.2, 0], [0, 1.9, 0]);

  // cabinet body
  b.part(new THREE.BoxGeometry(0.56, 0.78, 0.46), woodPaint, { bone: cab, at: [0, 0.6, 0] });
  // plinth and top moulding
  b.part(new THREE.BoxGeometry(0.62, 0.07, 0.52), WOOD2, { bone: cab, at: [0, 0.235, 0] });
  b.part(new THREE.BoxGeometry(0.62, 0.05, 0.52), WOOD2, { bone: cab, at: [0, 0.995, 0] });
  b.part(new THREE.BoxGeometry(0.58, 0.02, 0.48), woodPaint, { bone: cab, at: [0, 1.03, 0] });
  // corner posts
  for (const sx of [1, -1]) for (const sz of [1, -1])
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6), WOOD2, { bone: cab, at: [sx * 0.285, 0.6, sz * 0.235] });

  // claw feet
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    const x = sx * 0.26, z = sz * 0.21;
    b.part(new THREE.SphereGeometry(0.045, 6, 5), BRASS, { bone: base, at: [x, 0.07, z] });
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6), WOOD2, { bone: base, at: [x, 0.17, z] });
    for (const k of [-1, 0, 1]) {
      const dx = x * 1.0 + k * 0.03 * (sz > 0 ? 1 : 1);
      b.part(new THREE.ConeGeometry(0.013, 0.07, 5), BRASS, {
        bone: base, at: [x + k * 0.03, 0.03, z + sz * 0.05], dir: [k * 0.2, -0.6, sz * 1], });
      void dx;
    }
  }

  // inlay: pale floral pattern on front/back/sides
  const flower = svg(`<svg viewBox="0 0 64 64"><g fill="#e8d9a8">
    <circle cx="32" cy="32" r="5"/>
    <ellipse cx="32" cy="18" rx="5" ry="9"/><ellipse cx="32" cy="46" rx="5" ry="9"/>
    <ellipse cx="18" cy="32" rx="9" ry="5"/><ellipse cx="46" cy="32" rx="9" ry="5"/>
    <ellipse cx="22" cy="22" rx="3" ry="6" transform="rotate(-45 22 22)"/>
    <ellipse cx="42" cy="22" rx="3" ry="6" transform="rotate(45 42 22)"/>
    <ellipse cx="22" cy="42" rx="3" ry="6" transform="rotate(45 22 42)"/>
    <ellipse cx="42" cy="42" rx="3" ry="6" transform="rotate(-45 42 42)"/></g>
    <path d="M4 60 Q16 50 4 40 M60 60 Q48 50 60 40" stroke="#e8d9a8" stroke-width="3" fill="none"/></svg>`, { size: 128 });
  const plane = new THREE.PlaneGeometry(0.34, 0.34);
  b.part(plane, "#ffffff", { bone: cab, at: [0, 0.6, 0.236], dir: [0, 0, 1], axis: "z", texture: flower });
  b.part(plane, "#ffffff", { bone: cab, at: [0, 0.6, -0.236], dir: [0, 0, -1], axis: "z", texture: flower });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: cab, at: [0.286, 0.6, 0], dir: [1, 0, 0], axis: "z", texture: flower });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: cab, at: [-0.286, 0.6, 0], dir: [-1, 0, 0], axis: "z", texture: flower });
  // inlay border strips on front
  for (const y of [0.3, 0.9]) b.part(new THREE.BoxGeometry(0.46, 0.012, 0.01), "#e8d9a8", { bone: cab, at: [0, y + 0.05, 0.235] });
  // front brass keyhole plate and knobs
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), BRASS, { bone: cab, at: [0, 0.4, 0.238], dir: [0, 0, 1] });

  // turntable
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 20), "#3a3a3a", { bone: table, at: [0, 1.06, 0] });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.012, 24), BLACK, { bone: table, at: [0, 1.08, 0] });
  for (const r of [0.17, 0.14, 0.11])
    b.part(new THREE.TorusGeometry(r, 0.002, 4, 24), "#262626", { bone: table, at: [0, 1.088, 0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.004, 16), RED, { bone: table, at: [0, 1.088, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), SILVER, { bone: table, at: [0, 1.1, 0] });

  // horn: lathe flaring bell, tilted toward the front/up
  const hornAt: [number, number, number] = [0, 1.18, -0.05];
  const hp: [number, number][] = [];
  const prof = [[0.03, 0], [0.04, 0.12], [0.07, 0.28], [0.13, 0.42], [0.22, 0.54], [0.36, 0.64], [0.52, 0.72], [0.62, 0.78]];
  for (const [r, y] of prof) hp.push([r, y]);
  for (let i = prof.length - 1; i >= 0; i--) hp.push([prof[i][0] - 0.012, prof[i][1] - 0.004]);
  b.lathe(hp as any, { at: [0, 1.06, -0.1], axis: [0, 1, 0.55], segments: 16, smoothing: 1, color: brassGrad, bone: cab });
  // flared rim ring
  const rimC = new THREE.Vector3(0, 1.06, -0.1).add(new THREE.Vector3(0, 1, 0.55).normalize().multiplyScalar(0.78));
  b.part(new THREE.TorusGeometry(0.62, 0.012, 5, 28), BRASS, { bone: cab, at: [rimC.x, rimC.y, rimC.z], dir: [0, 1, 0.55], axis: "z" });
  // horn neck elbow to cabinet
  b.sweep(catmull([[0, 1.04, 0.0], [0, 1.1, -0.05], [0, 1.14, -0.1]]), [0.045, 0.035], { bone: cab, color: BRASS });
  void hornAt;
  // horn support bracket
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.1, 6), BRASS, { bone: cab, at: [0, 1.08, -0.1] });

  // tonearm
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.1, 8), SILVER, { bone: armBase, at: [-0.2, 1.1, -0.17] });
  b.rod([-0.2, 1.15, -0.17], [-0.03, 1.13, 0.08], [0.012, 0.008], { bone: arm, color: SILVER });
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.035), SILVER, { bone: arm, at: [-0.02, 1.125, 0.09], dir: [0.3, 0, 1], axis: "z" });
  b.spike([-0.02, 1.115, 0.1], [-0.02, 1.085, 0.1], null, 0.005, { bone: arm, color: "#888" });
  b.part(new THREE.SphereGeometry(0.025, 6, 5), SILVER, { bone: arm, at: [-0.215, 1.16, -0.2] });

  // crank
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), BRASS, { bone: cab, at: [0.295, 0.6, 0], dir: [1, 0, 0] });
  b.rod([0.3, 0.6, 0], [0.4, 0.6, 0], 0.01, { bone: crank, color: BRASS });
  b.rod([0.4, 0.6, 0], [0.4, 0.5, 0], 0.01, { bone: crank, color: BRASS });
  b.part(new THREE.SphereGeometry(0.03, 7, 5), WOOD2, { bone: crank, at: [0.4, 0.47, 0] });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 6), DARK, { bone: crank, at: [0.4, 0.5, 0.0], dir: [1, 0, 0] });

  // speaker grille on front
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.01), DARK, { bone: cab, at: [0, 0.82, 0.237] });
  for (let i = 0; i < 6; i++) b.part(new THREE.BoxGeometry(0.28, 0.006, 0.012), BRASS, { bone: cab, at: [0, 0.78 + i * 0.02, 0.239] });

  void stripes; void frame;
  return b.root;
}
