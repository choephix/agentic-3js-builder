import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Keel-billed toucan on a mossy branch",
  description:
    "A showy keel-billed toucan with a banded rainbow beak, yellow bib, lime eye rings, blue feet and scarlet undertail, perched on a mossy branch beside a pink orchid.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "toucan" });

  // Skeleton (rest-pose rig for the bird)
  const hips = b.joint("hips", { at: [0, 0.28, 0] });
  const chest = b.joint("chest", { at: [0, 0.36, 0.03], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.44, 0.06], parent: chest });
  const head = b.joint("head", { at: [0, 0.5, 0.07], parent: neck });
  b.joint("jaw", { at: [0, 0.47, 0.1], parent: head });
  b.joint("tail1", { at: [0, 0.2, -0.08], parent: hips });

  const root = b.root;
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (c: string, rough = 0.6) => {
    const k = c + rough;
    if (!mats.has(k))
      mats.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.04, flatShading: true }));
    return mats.get(k)!;
  };

  const add = (g: THREE.BufferGeometry, color: string, p: number[], s: number[] = [1, 1, 1], r: number[] = [0, 0, 0], rough = 0.6) => {
    const m = new THREE.Mesh(g, mat(color, rough));
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(r[0], r[1], r[2]);
    root.add(m);
    return m;
  };
  const ball = (color: string, p: number[], s: number[], r: number[] = [0, 0, 0], rough = 0.6, seg = 10) =>
    add(new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3)), color, p, s, r, rough);
  const rod = (a: number[], c: number[], rad: number, color: string, seg = 6) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, d.length(), seg), mat(color));
    m.position.copy(va.clone().add(vc).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    root.add(m);
    return m;
  };

  // ---------- Branch ----------
  rod([-0.5, 0.045, 0], [0.5, 0.04, 0], 0.04, "#5a3f2a", 7);
  rod([0.3, 0.05, 0], [0.45, 0.12, -0.03], 0.018, "#5a3f2a", 6);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const x = -0.48 + rnd() * 0.96;
    const a = rnd() * Math.PI * 2;
    const rr = 0.04;
    const y = 0.043 + Math.sin(a) * rr * 0.9;
    const z = Math.cos(a) * rr * 0.9;
    const s = 0.016 + rnd() * 0.02;
    ball(rnd() > 0.5 ? "#4f8a2f" : "#6aa83a", [x, Math.max(y, 0.03), z], [s * 1.5, s * 0.8, s], [0, 0, 0], 0.95, 6);
  }
  ball("#3f7a2a", [-0.4, 0.09, 0], [0.05, 0.02, 0.035], [0, 0, 0], 0.95, 6);

  // ---------- Body ----------
  ball("#0b0b10", [0, 0.29, 0], [0.095, 0.16, 0.105], [0.3, 0, 0], 0.25, 12); // glossy body
  ball("#0b0b10", [0, 0.5, 0.065], [0.075, 0.075, 0.08], [0, 0, 0], 0.25, 12); // head
  ball("#ffe23a", [0, 0.415, 0.085], [0.075, 0.1, 0.05], [0.25, 0, 0], 0.55, 10); // bib
  ball("#ffe23a", [0, 0.47, 0.12], [0.05, 0.04, 0.03], [0, 0, 0], 0.55, 8); // chin
  ball("#ffffff", [0, 0.2, -0.09], [0.06, 0.03, 0.03], [0, 0, 0], 0.6, 8); // rump
  ball("#e0141e", [0, 0.15, -0.085], [0.055, 0.045, 0.05], [0, 0, 0], 0.55, 8); // scarlet undertail
  // wings
  for (const s of [-1, 1]) {
    ball("#0e0e14", [s * 0.098, 0.31, -0.02], [0.03, 0.14, 0.085], [0.28, 0, s * -0.06], 0.3, 8);
    ball("#1d4fa8", [s * 0.108, 0.25, -0.05], [0.012, 0.06, 0.04], [0.28, 0, s * -0.06], 0.4, 6);
  }
  // tail
  add(new THREE.BoxGeometry(1, 1, 1), "#0b0b10", [0, 0.1, -0.2], [0.07, 0.025, 0.24], [-0.45, 0, 0], 0.3);
  add(new THREE.BoxGeometry(1, 1, 1), "#16161e", [0, 0.085, -0.215], [0.04, 0.015, 0.25], [-0.5, 0, 0], 0.3);

  // ---------- Eyes ----------
  for (const s of [-1, 1]) {
    ball("#a8e61f", [s * 0.063, 0.52, 0.1], [0.014, 0.034, 0.034], [0, 0, 0], 0.6, 10);
    ball("#2a74d6", [s * 0.071, 0.52, 0.1], [0.008, 0.024, 0.024], [0, 0, 0], 0.6, 8);
    ball("#2a1408", [s * 0.077, 0.52, 0.1], [0.008, 0.014, 0.014], [0, 0, 0], 0.2, 6);
  }

  // ---------- Beak ----------
  const N = 10;
  const colorAt = (i: number) => (i <= 2 ? "#8fd21f" : i <= 4 ? "#3fb4ee" : i <= 8 ? "#ff8a14" : "#c8102e");
  const f = (t: number) => 1 - 0.7 * t;
  const cy = 0.5;
  const z0 = 0.1, L = 0.23;
  const curve = (z: number, k: number) => cy - k * (z - z0) * (z - z0);
  const part = (W: number, H: number, k: number, yOff: number, top: boolean) => {
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const za = z0 + L * t0, zb = z0 + L * t1;
      const ya = curve(za, k) + yOff * (1 - 0.3 * t0), yb = curve(zb, k) + yOff * (1 - 0.3 * t1);
      const g = new THREE.CylinderGeometry(f(t1) * 0.98, f(t0), (zb - za) * 1.08 + 0.002, 8);
      g.rotateX(Math.PI / 2);
      const dz = zb - za, dy = yb - ya;
      const m = new THREE.Mesh(g, mat(top ? colorAt(i) : colorAt(Math.min(i, i >= 9 ? 9 : i)), 0.4));
      const len = Math.hypot(dz, dy);
      m.scale.set(W, H, 1);
      m.position.set(0, (ya + yb) / 2, (za + zb) / 2);
      m.rotation.x = -Math.atan2(dy, dz);
      void len;
      root.add(m);
    }
  };
  part(0.037, 0.047, 1.03, 0.0, true); // upper beak
  part(0.03, 0.02, 0.8, -0.043, false); // lower beak (jaw)
  // dark base line and cutting-edge stripe
  add(new THREE.CylinderGeometry(1, 1, 0.006, 10).rotateX(Math.PI / 2), "#1a1a1a", [0, 0.5, 0.108], [0.038, 0.049, 1], [0, 0, 0], 0.5);
  add(new THREE.BoxGeometry(0.004, 0.004, 1), "#3a2008", [0, 0.468, 0.21], [1, 1, 0.2], [0.18, 0, 0], 0.5);
  ball("#ffb060", [0, 0.543, 0.17], [0.008, 0.004, 0.05], [0.12, 0, 0], 0.3, 6); // ridge highlight
  for (const s of [-1, 1]) ball("#0b0b10", [s * 0.012, 0.525, 0.125], [0.005, 0.006, 0.006], [0, 0, 0], 0.3, 5);

  // ---------- Feet ----------
  for (const s of [-1, 1]) {
    rod([s * 0.045, 0.18, 0.0], [s * 0.045, 0.095, 0.02], 0.014, "#2a7fe0");
    ball("#2a7fe0", [s * 0.045, 0.095, 0.02], [0.022, 0.018, 0.025], [0, 0, 0], 0.6, 6);
    for (const [dx, dz] of [[-0.018, 0.06], [0.018, 0.06], [-0.012, -0.045], [0.012, -0.045]]) {
      const tx = s * 0.045 + dx;
      rod([s * 0.045, 0.098, 0.02], [tx, 0.09, 0.02 + dz], 0.008, "#2a7fe0", 5);
      ball("#10264a", [tx, 0.088, 0.02 + dz * 1.05], [0.007, 0.007, 0.011], [0, 0, 0], 0.4, 5);
    }
  }

  // ---------- Orchid ----------
  const fc = [0.34, 0.24, 0.05];
  rod([0.3, 0.07, 0.0], [0.325, 0.16, 0.03], 0.005, "#3f8a2a");
  rod([0.325, 0.16, 0.03], fc, 0.004, "#3f8a2a");
  ball("#2f7d2a", [0.29, 0.1, 0.03], [0.05, 0.008, 0.014], [0, 0.4, 0.5], 0.7, 6);
  ball("#2f7d2a", [0.37, 0.095, 0.02], [0.05, 0.008, 0.014], [0, -0.3, -0.5], 0.7, 6);
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    const g = new THREE.SphereGeometry(1, 7, 5);
    const m = new THREE.Mesh(g, mat("#f58ac4", 0.5));
    m.scale.set(0.014, 0.036, 0.005);
    m.position.set(fc[0] + Math.cos(a) * 0.034, fc[1] + Math.sin(a) * 0.034, fc[2] - 0.004);
    m.rotation.z = a - Math.PI / 2;
    root.add(m);
  }
  for (const s of [-1, 1]) {
    ball("#ff9fd2", [fc[0] + s * 0.037, fc[1] + 0.004, fc[2]], [0.034, 0.028, 0.005], [0, 0, s * -0.4], 0.5, 8);
  }
  ball("#c2186f", [fc[0], fc[1] - 0.025, fc[2] + 0.008], [0.017, 0.022, 0.008], [0.3, 0, 0], 0.5, 7);
  ball("#ffe36b", [fc[0], fc[1] + 0.003, fc[2] + 0.008], [0.008, 0.01, 0.008], [0, 0, 0], 0.5, 5);
  // a small bud
  rod([0.325, 0.16, 0.03], [0.3, 0.22, 0.04], 0.003, "#3f8a2a");
  ball("#f58ac4", [0.3, 0.225, 0.04], [0.009, 0.013, 0.009], [0, 0, 0.3], 0.5, 6);

  return root;
}
