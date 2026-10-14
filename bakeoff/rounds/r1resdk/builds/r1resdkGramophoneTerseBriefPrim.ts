import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "gramophone",
  description: "Tabletop wind-up gramophone with a mahogany cabinet, brass flared horn, tone arm, record and side crank.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gramophone" });
  const root = new THREE.Group();
  root.name = "gramophone";
  void b;

  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (c: string, rough = 0.6, metal = 0.05) => {
    const k = c + rough + metal;
    if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, flatShading: true, side: THREE.DoubleSide }));
    return mats.get(k)!;
  };
  const add = (g: THREE.BufferGeometry, c: string, p: [number, number, number], rot: [number, number, number] = [0, 0, 0], rough = 0.6, metal = 0.05) => {
    const m = new THREE.Mesh(g, mat(c, rough, metal));
    m.position.set(...p);
    m.rotation.set(...rot);
    root.add(m);
    return m;
  };
  const rod = (a: number[], bb: number[], r: number, c: string, metal = 0.6) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...bb);
    const d = vb.clone().sub(va);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), mat(c, 0.35, metal));
    m.position.copy(va.clone().add(vb).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    root.add(m);
  };

  const wood = "#6b3216", woodDark = "#4a2210", woodLight = "#8a4a22";
  const brass = "#d9a73a", brassDark = "#a87a22", black = "#17171a";

  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.CylinderGeometry(0.02, 0.014, 0.04, 6), woodDark, [sx * 0.16, 0.02, sz * 0.15]);
  // cabinet
  add(new THREE.BoxGeometry(0.4, 0.18, 0.38), wood, [0, 0.13, 0]);
  add(new THREE.BoxGeometry(0.42, 0.015, 0.4), woodLight, [0, 0.2275, 0]); // top slab
  add(new THREE.BoxGeometry(0.42, 0.02, 0.4), woodDark, [0, 0.05, 0]); // base moulding
  // front panel and grille
  add(new THREE.BoxGeometry(0.3, 0.12, 0.01), woodDark, [0, 0.13, 0.19]);
  add(new THREE.BoxGeometry(0.26, 0.09, 0.012), "#2b1409", [0, 0.13, 0.192]);
  for (let i = 0; i < 6; i++)
    add(new THREE.BoxGeometry(0.008, 0.085, 0.016), brassDark, [-0.1 + i * 0.04, 0.13, 0.194], [0, 0, 0], 0.4, 0.5);
  // brass corner studs
  for (const sx of [-1, 1])
    add(new THREE.SphereGeometry(0.008, 6, 4), brass, [sx * 0.19, 0.21, 0.2], [0, 0, 0], 0.3, 0.7);

  // turntable, record, label, spindle
  const cy = 0.2475, cz = 0.04;
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 20), "#555a5e", [0, cy + 0.004, cz], [0, 0, 0], 0.4, 0.6);
  add(new THREE.CylinderGeometry(0.135, 0.135, 0.006, 24), black, [0, cy + 0.011, cz], [0, 0, 0], 0.3);
  for (const r of [0.06, 0.085, 0.11])
    add(new THREE.TorusGeometry(r, 0.0012, 3, 24), "#2a2a30", [0, cy + 0.0145, cz], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.0015, 16), "#b3261e", [0, cy + 0.0145, cz]);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.0016, 8), "#e8d9a8", [0, cy + 0.0155, cz]);
  add(new THREE.CylinderGeometry(0.0025, 0.0025, 0.02, 6), brass, [0, cy + 0.024, cz], [0, 0, 0], 0.3, 0.8);

  // pedestal and elbow
  const bx = 0, by = 0.3, bz = -0.12;
  add(new THREE.CylinderGeometry(0.03, 0.04, 0.05, 8), brassDark, [bx, 0.255, bz], [0, 0, 0], 0.35, 0.7);
  add(new THREE.SphereGeometry(0.036, 8, 6), brass, [bx, by, bz], [0, 0, 0], 0.3, 0.7);

  // horn (lathe, flaring), tilted up and toward +Z
  const L = 0.5, pts: THREE.Vector2[] = [];
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new THREE.Vector2(0.022 + 0.215 * Math.pow(t, 3.4), t * L));
  }
  const horn = add(new THREE.LatheGeometry(pts, 16), brass, [bx, by, bz], [(65 * Math.PI) / 180, 0, 0], 0.28, 0.75);
  // mouth lip
  const dir = new THREE.Vector3(0, Math.cos((65 * Math.PI) / 180), Math.sin((65 * Math.PI) / 180));
  const tip = new THREE.Vector3(bx, by, bz).addScaledVector(dir, L);
  const lip = add(new THREE.TorusGeometry(0.237, 0.008, 5, 20), brassDark, [tip.x, tip.y, tip.z], [(65 * Math.PI) / 180 + Math.PI / 2, 0, 0], 0.3, 0.75);
  void horn; void lip;
  // horn rings
  for (const t of [0.35, 0.6, 0.82]) {
    const p = new THREE.Vector3(bx, by, bz).addScaledVector(dir, t * L);
    add(new THREE.TorusGeometry(0.022 + 0.215 * Math.pow(t, 3.4) + 0.002, 0.004, 4, 16), brassDark, [p.x, p.y, p.z], [(65 * Math.PI) / 180 + Math.PI / 2, 0, 0], 0.3, 0.75);
  }
  // horn support strut
  const sp = new THREE.Vector3(bx, by, bz).addScaledVector(dir, 0.3 * L * 2 * 0.5 + 0.1);
  rod([0, 0.228, 0.0], [sp.x, sp.y - 0.05, sp.z], 0.006, brassDark);

  // tone arm
  rod([bx, by - 0.004, bz + 0.02], [0.07, 0.275, 0.07], 0.007, "#c9ccd0");
  add(new THREE.CylinderGeometry(0.02, 0.016, 0.022, 8), brass, [0.075, 0.268, 0.078], [0, 0, 0], 0.3, 0.7);
  add(new THREE.CylinderGeometry(0.013, 0.013, 0.004, 8), "#222", [0.075, 0.281, 0.078]);
  add(new THREE.ConeGeometry(0.003, 0.014, 5), "#c9ccd0", [0.075, 0.25, 0.078], [Math.PI, 0, 0], 0.3, 0.8);

  // side crank
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), brassDark, [0.205, 0.12, -0.02], [0, 0, Math.PI / 2], 0.3, 0.7);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 6), brass, [0.225, 0.12, -0.02], [0, 0, Math.PI / 2], 0.3, 0.8);
  rod([0.25, 0.12, -0.02], [0.25, 0.08, -0.02], 0.005, brass);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 6), black, [0.265, 0.08, -0.02], [0, 0, Math.PI / 2]);
  add(new THREE.SphereGeometry(0.009, 6, 4), black, [0.285, 0.08, -0.02]);

  return root;
}
