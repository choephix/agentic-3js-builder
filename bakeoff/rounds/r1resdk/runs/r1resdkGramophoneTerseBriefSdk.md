```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "gramophone",
  description: "Vintage wind-up gramophone with wooden cabinet, turntable, tonearm and brass horn.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gramophone" });
  b.joint("base", { at: [0, 0, 0] });

  const wood = "#6b3a1e";
  const woodDark = "#4a2511";
  const woodLight = "#8a5230";
  const brass = "#c9a227";
  const brassDark = "#8f6d17";
  const black = "#151515";
  const felt = "#2f6b3a";
  const steel = "#b8bcc2";

  const mk = (g: THREE.BufferGeometry, color: string, p: [number, number, number], rot?: [number, number, number]) => {
    const m = b.part({ geometry: g, color, at: p } as any);
    if (rot && (m as any).rotation) (m as any).rotation.set(...rot);
    return m;
  };

  // Use plain meshes for precision, added to root via builder materials.
  const root = b.root;
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: string, rough = 0.6, metal = 0.05) => {
    const k = c + rough + metal;
    return (mats[k] ??= new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, flatShading: true }));
  };
  const add = (g: THREE.BufferGeometry, c: string, p: [number, number, number], r: [number, number, number] = [0, 0, 0], rough = 0.6, metal = 0.05) => {
    const m = new THREE.Mesh(g, mat(c, rough, metal));
    m.position.set(...p);
    m.rotation.set(...r);
    root.add(m);
    return m;
  };
  void mk; void rng;

  // Feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      add(new THREE.CylinderGeometry(0.025, 0.035, 0.05, 6), woodDark, [sx * 0.2, 0.025, sz * 0.2]);

  // Cabinet
  add(new THREE.BoxGeometry(0.5, 0.3, 0.5), wood, [0, 0.2, 0]);
  // plinth and top trim
  add(new THREE.BoxGeometry(0.54, 0.03, 0.54), woodDark, [0, 0.065, 0]);
  add(new THREE.BoxGeometry(0.54, 0.03, 0.54), woodLight, [0, 0.365, 0]);
  // corner posts
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      add(new THREE.BoxGeometry(0.03, 0.3, 0.03), woodDark, [sx * 0.25, 0.2, sz * 0.25]);
  // front panel with grille
  add(new THREE.BoxGeometry(0.32, 0.2, 0.012), woodDark, [0, 0.2, 0.256]);
  for (let i = 0; i < 6; i++)
    add(new THREE.BoxGeometry(0.28, 0.012, 0.016), brassDark, [0, 0.13 + i * 0.028, 0.262]);
  // side crank
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), brass, [0.28, 0.22, 0], [0, 0, Math.PI / 2], 0.4, 0.6);
  add(new THREE.BoxGeometry(0.02, 0.1, 0.015), brass, [0.31, 0.17, 0], [0, 0, 0], 0.4, 0.6);
  add(new THREE.SphereGeometry(0.02, 6, 5), black, [0.31, 0.12, 0]);

  // Turntable
  const topY = 0.38;
  add(new THREE.CylinderGeometry(0.19, 0.19, 0.01, 16), steel, [-0.02, topY + 0.005, 0.0], [0, 0, 0], 0.3, 0.7);
  add(new THREE.CylinderGeometry(0.18, 0.18, 0.008, 20), black, [-0.02, topY + 0.014, 0]);
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 14), "#a3281f", [-0.02, topY + 0.02, 0]);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), brass, [-0.02, topY + 0.03, 0], [0, 0, 0], 0.3, 0.8);
  // record grooves
  for (const r of [0.09, 0.12, 0.15])
    add(new THREE.TorusGeometry(r, 0.002, 4, 24), "#2b2b2b", [-0.02, topY + 0.019, 0], [Math.PI / 2, 0, 0]);

  // Tonearm base + arm
  add(new THREE.CylinderGeometry(0.03, 0.04, 0.04, 8), brass, [0.17, topY + 0.02, -0.17], [0, 0, 0], 0.4, 0.6);
  add(new THREE.SphereGeometry(0.025, 8, 6), brass, [0.17, topY + 0.05, -0.17], [0, 0, 0], 0.4, 0.6);
  const armA = new THREE.Vector3(0.17, topY + 0.055, -0.17);
  const armB = new THREE.Vector3(0.04, topY + 0.04, 0.06);
  const dir = armB.clone().sub(armA);
  const arm = add(new THREE.CylinderGeometry(0.007, 0.007, dir.length(), 6), steel, [0, 0, 0], [0, 0, 0], 0.3, 0.7);
  arm.position.copy(armA).add(armB).multiplyScalar(0.5);
  arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  add(new THREE.BoxGeometry(0.03, 0.015, 0.03), brass, [0.04, topY + 0.035, 0.065], [0, 0.5, 0], 0.4, 0.6);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6), black, [0.19, topY + 0.05, -0.2], [Math.PI / 2, 0, 0]);

  // Horn: stack of lathe-like frustums rising from the back
  const hornPts: THREE.Vector3[] = [];
  const hn = 14;
  for (let i = 0; i <= hn; i++) {
    const t = i / hn;
    hornPts.push(new THREE.Vector3(0, 0, 0));
  }
  void hornPts;
  // neck elbow
  add(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 8), brass, [0, 0.45, -0.1], [0, 0, 0], 0.35, 0.7);
  add(new THREE.SphereGeometry(0.045, 8, 6), brass, [0, 0.52, -0.1], [0, 0, 0], 0.35, 0.7);
  // curve path: from (0,0.52,-0.1) rising back then flaring forward-up
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.52, -0.1),
    new THREE.Vector3(0, 0.62, -0.14),
    new THREE.Vector3(0, 0.72, -0.08),
    new THREE.Vector3(0, 0.78, 0.04),
    new THREE.Vector3(0, 0.8, 0.2),
  ]);
  const segs = 14;
  const pts = curve.getSpacedPoints(segs);
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs;
    const r0 = 0.04 + 0.2 * Math.pow(t0, 2.4);
    const r1 = 0.04 + 0.2 * Math.pow(t1, 2.4);
    const a = pts[i], c = pts[i + 1];
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r1, r0, d.length() * 1.02, 12, 1, true);
    const m = add(g, i % 2 ? brass : "#d6b132", [0, 0, 0], [0, 0, 0], 0.3, 0.75);
    (m.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    m.position.copy(a).add(c).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  // bell rim
  const last = pts[segs], prev = pts[segs - 1];
  const rd = last.clone().sub(prev).normalize();
  const rim = add(new THREE.TorusGeometry(0.24, 0.012, 5, 20), brass, [0, 0, 0], [0, 0, 0], 0.3, 0.75);
  rim.position.copy(last);
  rim.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), rd);
  // inner dark throat
  const throat = add(new THREE.CircleGeometry(0.2, 12), brassDark, [0, 0, 0], [0, 0, 0], 0.5, 0.4);
  (throat.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  throat.position.copy(last).addScaledVector(rd, -0.04);
  throat.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), rd);

  // felt pad on top corner
  add(new THREE.BoxGeometry(0.1, 0.004, 0.1), felt, [-0.17, topY + 0.017, -0.17]);

  // Ensure floor contact: lowest y = 0
  return root;
}
```