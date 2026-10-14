import * as THREE from "three";

export const meta = {
  name: "Desert Scorpion",
  description: "Threatening amber scorpion with arched segmented tail, big pincers, eight legs and a bulbous stinger.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const amber = new THREE.MeshStandardMaterial({ color: 0xd98a1c, roughness: 0.25, metalness: 0.2, flatShading: true });
  const light = new THREE.MeshStandardMaterial({ color: 0xf0b13c, roughness: 0.3, metalness: 0.15, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x5a2a0a, roughness: 0.35, metalness: 0.2, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.5 });
  const stingerM = new THREE.MeshStandardMaterial({ color: 0x2a0f08, roughness: 0.2, metalness: 0.4, flatShading: true });

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], s = [1, 1, 1], r = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(s[0], s[1], s[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const sph = new THREE.SphereGeometry(0.5, 8, 6);
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);

  // limb segment between two points
  const seg = (a: THREE.Vector3, b: THREE.Vector3, w: number, m: THREE.Material, parent: THREE.Object3D = root) => {
    const d = b.clone().sub(a);
    const me = new THREE.Mesh(cyl, m);
    me.scale.set(w, d.length(), w);
    me.position.copy(a).add(b).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(me);
    return me;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const bodyY = 0.06;
  // Carapace (head shield)
  add(box, amber, [0, bodyY + 0.02, 0.13], [0.15, 0.04, 0.17]);
  add(box, light, [0, bodyY + 0.045, 0.14], [0.1, 0.012, 0.12]);
  add(new THREE.CylinderGeometry(0.5, 0.5, 1, 6), dark, [0, bodyY + 0.01, 0.23], [0.1, 0.03, 0.03], [0, 0, 0]);
  // eyes
  add(sph, black, [0, bodyY + 0.058, 0.17], [0.03, 0.025, 0.03]);
  for (const s of [-1, 1]) {
    add(sph, black, [s * 0.025, bodyY + 0.055, 0.17], [0.018, 0.018, 0.018]);
    add(sph, black, [s * 0.06, bodyY + 0.04, 0.22], [0.016, 0.016, 0.016]);
    add(sph, black, [s * 0.05, bodyY + 0.045, 0.2], [0.012, 0.012, 0.012]);
    add(sph, black, [s * 0.075, bodyY + 0.038, 0.19], [0.012, 0.012, 0.012]);
  }
  // Abdomen (mesosoma) 7 plates
  for (let i = 0; i < 7; i++) {
    const z = -0.02 - i * 0.05;
    const w = 0.15 - i * 0.008;
    add(box, i % 2 ? light : amber, [0, bodyY + 0.015, z], [w, 0.05 - i * 0.002, 0.048]);
    add(box, dark, [0, bodyY + 0.015, z - 0.025], [w * 0.96, 0.042 - i * 0.002, 0.008]);
    add(box, dark, [0, bodyY + 0.043 - i * 0.001, z], [0.02, 0.006, 0.04]);
  }

  // Legs: 4 pairs
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z0 = 0.15 - i * 0.06;
      const yaw = (i - 1.5) * 0.28;
      const out = 0.1;
      const hip = V(s * 0.07, bodyY, z0);
      const knee = V(s * (0.17 + i * 0.005), 0.13, z0 + 0.05 * (1.5 - i) * 0.6 + 0.03 - i * 0.01);
      const ankle = V(s * (0.27 + 0.02 * Math.cos(yaw)), 0.07, z0 + (1.5 - i) * 0.07);
      const foot = V(s * (0.32 + 0.01 * i), 0.0, z0 + (1.5 - i) * 0.1);
      void out;
      seg(hip, knee, 0.016, amber);
      add(sph, dark, [knee.x, knee.y, knee.z], [0.026, 0.026, 0.026]);
      seg(knee, ankle, 0.013, light);
      add(sph, dark, [ankle.x, ankle.y, ankle.z], [0.02, 0.02, 0.02]);
      seg(ankle, foot, 0.009, dark);
    }
  }

  // Pedipalps with pincers
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    root.add(g);
    const p0 = V(s * 0.05, bodyY + 0.01, 0.24);
    const p1 = V(s * 0.12, bodyY + 0.02, 0.34);
    const p2 = V(s * 0.1, bodyY + 0.03, 0.47);
    seg(p0, p1, 0.035, amber);
    add(sph, dark, [p1.x, p1.y, p1.z], [0.045, 0.045, 0.045]);
    seg(p1, p2, 0.04, light);
    add(sph, dark, [p2.x, p2.y, p2.z], [0.05, 0.05, 0.05]);
    // claw hand
    const hand = new THREE.Group();
    hand.position.set(s * 0.09, bodyY + 0.035, 0.53);
    root.add(hand);
    add(box, amber, [0, 0, 0], [0.09, 0.05, 0.1], [0, 0, 0], hand);
    add(box, light, [0, 0.027, 0], [0.06, 0.008, 0.08], [0, 0, 0], hand);
    // fixed finger
    add(box, amber, [s * -0.02, 0, 0.1], [0.032, 0.04, 0.12], [0, s * 0.12, 0], hand);
    add(box, dark, [s * -0.02, 0, 0.17], [0.022, 0.03, 0.03], [0, s * 0.2, 0], hand);
    // moving finger
    add(box, amber, [s * 0.04, 0, 0.1], [0.03, 0.036, 0.12], [0, -s * 0.2, 0], hand);
    add(box, dark, [s * 0.025, 0, 0.17], [0.02, 0.028, 0.03], [0, -s * 0.35, 0], hand);
  }

  // Tail: arched curve
  const n = 6;
  const base = V(0, bodyY + 0.02, -0.34);
  let prev = base.clone();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = -0.1 + t * 2.6; // rotation from backward to forward
    const R = 0.22;
    pts.push(V(0, base.y + 0.02 + R * (1 - Math.cos(ang)) * 0.0 + R * Math.sin(ang) * 1.1 - 0, base.z - R * 0.9 * Math.cos(ang) + R * 0.5 * 0));
  }
  // build explicit arc
  pts.length = 0;
  for (let i = 0; i <= n; i++) {
    const a = 0.1 + (i / n) * 2.5;
    pts.push(V(0, 0.09 + 0.3 * Math.sin(a) - 0.0, -0.3 - 0.28 * Math.cos(a) + 0.0));
  }
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1];
    const w = 0.052 - i * 0.004;
    seg(a, b, w, i % 2 ? light : amber);
    const mid = a.clone().lerp(b, 0.5);
    void mid;
    const j = add(sph, dark, [b.x, b.y, b.z], [w * 1.15, w * 0.9, w * 1.15]);
    void j;
    add(box, dark, [a.x, a.y + 0.0, a.z], [0.002, 0.002, 0.002]);
    prev = b;
  }
  const last = pts[n];
  const dirT = pts[n].clone().sub(pts[n - 1]).normalize();
  // stinger bulb
  const bulb = add(sph, stingerM, [last.x + dirT.x * 0.03, last.y + dirT.y * 0.03, last.z + dirT.z * 0.03], [0.085, 0.1, 0.085]);
  void bulb; void prev;
  const tipBase = last.clone().addScaledVector(dirT, 0.08);
  const barb = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 6), stingerM);
  barb.position.copy(tipBase);
  barb.quaternion.setFromUnitVectors(V(0, 1, 0), dirT.clone().add(V(0, 0, 0.0)).normalize());
  root.add(barb);
  // glossy highlight on bulb
  add(sph, amber, [last.x, last.y + 0.02, last.z + 0.03], [0.03, 0.03, 0.03]);
  // tail base joint
  add(box, dark, [0, 0.085, -0.32], [0.07, 0.07, 0.04]);

  // Spots of texture: little ridge bumps on pincers
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1;
    add(sph, dark, [s * (0.09 + rnd() * 0.01), bodyY + 0.06, 0.5 + rnd() * 0.04], [0.012, 0.012, 0.012]);
  }

  // sit on floor: legs reach y=0 (feet radius sink slightly)
  root.position.y = 0.0;
  const out = new THREE.Group();
  out.add(root);
  return out;
}
