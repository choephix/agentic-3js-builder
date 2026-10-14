import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Hot-Air Balloon",
  description: "Striped gore envelope, wicker basket, burner frame, rigging ropes and sandbags.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "hotAirBalloon" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const put = (g: THREE.BufferGeometry, color: string, at: [number, number, number]) =>
    b.part(g, color, { at, bone: root });

  // cylinder between two points
  const cyl = (a: number[], c: number[], r: number, color: string, seg = 6) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...c);
    const d = vb.clone().sub(va);
    const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
    const m = va.clone().add(vb).multiplyScalar(0.5);
    put(g, color, [m.x, m.y, m.z]);
  };

  // ---- envelope ----
  const prof: [number, number][] = [
    [1.1, 3.4], [1.6, 3.9], [2.8, 4.9], [4.0, 6.2], [4.9, 7.8], [5.4, 9.5],
    [5.3, 11], [4.6, 12.6], [3.3, 13.9], [1.8, 14.8], [0.5, 15.3], [0.001, 15.5],
  ];
  const pts = (a: number, c: number) => prof.slice(a, c + 1).map(([r, y]) => new THREE.Vector2(r, y));
  const gores = 12, step = (Math.PI * 2) / gores;
  const gc = ["#d8322b", "#f6e7c1", "#e8a21e", "#f6e7c1"];
  for (let i = 0; i < gores; i++) {
    put(new THREE.LatheGeometry(pts(2, 9), 2, i * step, step), gc[i % 4], [0, 0, 0]);
    put(new THREE.LatheGeometry(pts(0, 2), 1, i * step, step), i % 2 ? "#1e3a6e" : "#2b4f94", [0, 0, 0]);
    put(new THREE.LatheGeometry(pts(9, 11), 2, i * step, step), i % 2 ? "#f6e7c1" : "#d8322b", [0, 0, 0]);
  }
  // decorative band (navy ring around the belly)
  put(new THREE.TorusGeometry(5.4, 0.12, 4, 24), "#1e3a6e", [0, 9.5, 0]).rotation.x = Math.PI / 2;
  put(new THREE.TorusGeometry(4.0, 0.08, 4, 24), "#e8a21e", [0, 6.2, 0]).rotation.x = Math.PI / 2;
  put(new THREE.TorusGeometry(1.12, 0.07, 5, 16), "#3a2a1a", [0, 3.4, 0]).rotation.x = Math.PI / 2;
  put(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 8), "#3a2a1a", [0, 15.5, 0]);

  // ---- basket ----
  const W = 1.3, H = 1.0;
  put(new THREE.BoxGeometry(W, H, W), "#b07a3c", [0, H / 2, 0]);
  put(new THREE.BoxGeometry(W - 0.2, 0.06, W - 0.2), "#6b4a24", [0, 0.1, 0]);
  for (const y of [0.25, 0.55, 0.8]) put(new THREE.BoxGeometry(W + 0.05, 0.07, W + 0.05), "#8a5b28", [0, y, 0]);
  for (let i = -2; i <= 2; i++) {
    const o = i * 0.25;
    put(new THREE.BoxGeometry(0.05, H, W + 0.06), "#c78d4a", [o, H / 2, 0]);
  }
  // rim
  for (const [x, z, sx, sz] of [[0, 0.68, 1.45, 0.14], [0, -0.68, 1.45, 0.14], [0.68, 0, 0.14, 1.45], [-0.68, 0, 0.14, 1.45]] as number[][])
    put(new THREE.BoxGeometry(sx, 0.1, sz), "#5a3b1a", [x, H + 0.04, z]);
  // leather corner pads
  const corners: [number, number][] = [[0.6, 0.6], [-0.6, 0.6], [0.6, -0.6], [-0.6, -0.6]];
  for (const [x, z] of corners) put(new THREE.BoxGeometry(0.16, H + 0.05, 0.16), "#4a2e18", [x, H / 2, z]);

  // ---- burner frame ----
  const topY = 2.6;
  for (const [x, z] of corners) {
    cyl([x, H, z], [x * 0.9, topY, z * 0.9], 0.03, "#9aa0a6", 6);
    // ropes to envelope ring
    const ang = Math.atan2(z, x);
    cyl([x * 0.9, topY, z * 0.9], [Math.cos(ang) * 1.1, 3.4, Math.sin(ang) * 1.1], 0.015, "#d9c9a0", 4);
  }
  put(new THREE.BoxGeometry(1.2, 0.06, 0.06), "#9aa0a6", [0, topY, 0]);
  put(new THREE.BoxGeometry(0.06, 0.06, 1.2), "#9aa0a6", [0, topY, 0]);
  // burner coil + flame
  put(new THREE.TorusGeometry(0.2, 0.05, 5, 12), "#c9c2b0", [0, topY - 0.15, 0]).rotation.x = Math.PI / 2;
  put(new THREE.CylinderGeometry(0.12, 0.2, 0.2, 8), "#6d6f73", [0, topY - 0.05, 0]);
  put(new THREE.ConeGeometry(0.22, 0.75, 7), "#ff8a1f", [0, topY + 0.45, 0]);
  put(new THREE.ConeGeometry(0.12, 0.5, 6), "#ffe27a", [0, topY + 0.35, 0]);

  // propane tanks inside basket
  for (const x of [-0.3, 0.3]) {
    put(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 10), "#cfd3d6", [x, 0.4, -0.15]);
    put(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#cfd3d6", [x, 0.75, -0.15]);
  }

  // sandbags hanging outside
  for (const x of [-0.35, 0, 0.35]) {
    put(new THREE.SphereGeometry(0.13, 6, 5), "#c2a878", [x, 0.78, 0.74]).scale.set(1, 1.2, 0.8);
    put(new THREE.BoxGeometry(0.03, 0.1, 0.02), "#4a2e18", [x, 0.98, 0.72]);
  }

  return b.root;
}
