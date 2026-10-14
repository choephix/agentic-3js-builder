import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon",
  description: "Striped gore-panel envelope, wicker basket, burner, tanks, poles and cables.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "balloon" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const part = (g: THREE.BufferGeometry, color: string, at: [number, number, number] = [0, 0, 0]) =>
    b.part(g, color, { at, bone: root });

  // rod between two points, baked into geometry
  const rod = (a: number[], c: number[], r: number, color: string, seg = 6) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...c);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    const m = va.clone().add(vb).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    part(g, color);
  };

  // Envelope
  const prof: [number, number][] = [
    [2.0, 7.0], [3.4, 8.4], [5.2, 10.2], [6.6, 12.2],
    [7.4, 14.2], [7.5, 15.8], [6.9, 17.8],
    [5.6, 19.7], [3.6, 21.2], [1.5, 22.2], [0.01, 22.5],
  ];
  const pts = (a: number, c: number) =>
    prof.slice(a, c + 1).map(([r, y]) => new THREE.Vector2(r, y));
  const palette = ["#d8312b", "#f2b61f", "#1f5fa8", "#f4efe2"];
  const N = 12;
  const phi = (Math.PI * 2) / N;
  for (let i = 0; i < N; i++) {
    const c = palette[i % 4];
    const start = i * phi;
    part(new THREE.LatheGeometry(pts(0, 3), 2, start, phi), c);
    part(new THREE.LatheGeometry(pts(3, 6), 2, start, phi), i % 2 ? "#fbf6e8" : "#2b2b3a");
    part(new THREE.LatheGeometry(pts(6, 10), 2, start, phi), c);
  }
  // skirt (fire-resistant fabric)
  part(new THREE.CylinderGeometry(2.1, 1.9, 0.9, 12, 1, true), "#3a2a22", [0, 6.55, 0]);
  part(new THREE.CylinderGeometry(2.14, 2.14, 0.12, 12, 1, true), "#d8312b", [0, 6.15, 0]);
  // top cap
  part(new THREE.ConeGeometry(0.7, 0.35, 8), "#3a2a22", [0, 22.5, 0]);
  // load rings around envelope
  for (const y of [10.2, 17.8]) {
    const t = new THREE.TorusGeometry(prof.find(p => p[1] === y)![0] + 0.04, 0.05, 4, 24);
    t.rotateX(Math.PI / 2);
    part(t, "#5a3b22", [0, y, 0]);
  }

  // Basket
  part(new THREE.BoxGeometry(1.3, 1.0, 1.3), "#b07a3c", [0, 0.5, 0]);
  for (const y of [0.2, 0.55, 0.85]) {
    part(new THREE.BoxGeometry(1.36, 0.06, 1.36), "#8a5a28", [0, y, 0]);
  }
  for (const x of [-0.6, 0, 0.6]) for (const s of [-1, 1]) {
    part(new THREE.BoxGeometry(0.07, 1.0, 1.36), "#8a5a28", [x, 0.5, 0]);
    void s;
  }
  part(new THREE.BoxGeometry(1.45, 0.1, 1.45), "#5a3b22", [0, 1.05, 0]);
  part(new THREE.BoxGeometry(1.4, 0.08, 1.4), "#4a3018", [0, 0.04, 0]);

  // Propane tanks
  for (const x of [-0.3, 0.3]) {
    const g = new THREE.CapsuleGeometry(0.17, 0.5, 3, 8);
    g.rotateX(Math.PI / 2);
    part(g, "#c9ccd2", [x, 0.4, 0]);
  }

  // Poles, burner frame, cables
  const corners = [[0.65, 0.65], [-0.65, 0.65], [0.65, -0.65], [-0.65, -0.65]];
  for (const [x, z] of corners) {
    const top = [x, 3.2, z];
    rod([x, 1.05, z], top, 0.04, "#444a52");
    const l = Math.hypot(x, z);
    rod(top, [(x / l) * 1.95, 6.5, (z / l) * 1.95], 0.015, "#2b2b2b", 4);
  }
  part(new THREE.BoxGeometry(1.5, 0.07, 0.07), "#444a52", [0, 3.2, 0.65]);
  part(new THREE.BoxGeometry(1.5, 0.07, 0.07), "#444a52", [0, 3.2, -0.65]);
  part(new THREE.BoxGeometry(0.07, 0.07, 1.4), "#444a52", [0.65, 3.2, 0]);
  part(new THREE.BoxGeometry(0.07, 0.07, 1.4), "#444a52", [-0.65, 3.2, 0]);

  // Burner
  part(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8), "#8d949e", [0, 3.4, 0]);
  part(new THREE.TorusGeometry(0.2, 0.05, 5, 10).rotateX(Math.PI / 2), "#b8bec7", [0, 3.5, 0]);
  rod([0, 3.3, 0], [0, 1.1, 0], 0.03, "#333", 5);
  part(new THREE.ConeGeometry(0.2, 1.5, 7), "#ff8a1f", [0, 4.3, 0]);
  part(new THREE.ConeGeometry(0.11, 1.0, 6), "#ffe27a", [0, 4.05, 0]);

  return b.root;
}
