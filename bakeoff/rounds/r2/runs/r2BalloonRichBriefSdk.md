```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description:
    "Striped hot-air balloon with patterned band, glowing burner, ropes, woven wicker basket, sandbags and a corner flag.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "balloon" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0) => {
    geo.translate(x, y, z);
    b.part(geo, color, { at: [0, 0, 0], bone: root });
  };

  const rod = (a: number[], c: number[], r: number, color: string, seg = 5) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const len = d.length();
    const geo = new THREE.CylinderGeometry(r, r, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    geo.applyQuaternion(q);
    const m = A.clone().add(B).multiplyScalar(0.5);
    put(geo, color, m.x, m.y, m.z);
  };

  // ---------- envelope ----------
  const Y0 = 3.6, H = 7.4;
  const prof = (s: number, off = 0) => {
    const r = 3.5 * Math.sin(Math.PI * Math.pow(s, 0.868)) + 0.8 * Math.pow(Math.max(0, 1 - s / 0.2), 2) + off;
    return new THREE.Vector2(Math.max(r, 0.001), Y0 + H * s);
  };
  const profile = (s0: number, s1: number, n: number, off = 0) => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= n; i++) pts.push(prof(s0 + ((s1 - s0) * i) / n, off));
    return pts;
  };

  const stripe = ["#fcc419", "#e8442e", "#3fa9e0"];
  const G = 12;
  const full = profile(0, 1, 28);
  for (let i = 0; i < G; i++) {
    const geo = new THREE.LatheGeometry(full, 2, (i * Math.PI * 2) / G, (Math.PI * 2) / G);
    put(geo, stripe[i % 3]);
  }

  // patterned band: two checker rows
  const B1 = 24;
  const rows: [number, number][] = [[0.385, 0.46], [0.46, 0.535]];
  rows.forEach((rw, row) => {
    for (let i = 0; i < B1; i++) {
      const geo = new THREE.LatheGeometry(profile(rw[0], rw[1], 3, 0.05), 1, (i * Math.PI * 2) / B1, (Math.PI * 2) / B1);
      put(geo, (i + row) % 2 ? "#1f2d5c" : "#f6ecd2");
    }
  });
  rows.forEach((rw, row) => {
    for (let i = 0; i < B1; i += 2) {
      // little diamonds accents
      const a = ((i + 0.5 + row) * Math.PI * 2) / B1;
      const s = (rw[0] + rw[1]) / 2;
      const p = prof(s, 0.09);
      const geo = new THREE.OctahedronGeometry(0.1, 0);
      geo.scale(1, 1.2, 0.5);
      geo.rotateY(a + Math.PI / 2);
      put(geo, "#fcc419", Math.sin(a) * p.x, p.y, Math.cos(a) * p.x);
    }
  });
  for (const [s0, s1] of [[0.37, 0.385], [0.535, 0.55]]) {
    put(new THREE.LatheGeometry(profile(s0, s1, 1, 0.07), 24), "#2b1b12");
  }
  // top cap and mouth ring
  put(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 8), "#e8e4d8", 0, Y0 + H, 0);
  put(new THREE.TorusGeometry(0.8, 0.045, 5, 16).rotateX(Math.PI / 2), "#333333", 0, Y0, 0);

  // ---------- basket ----------
  const W = 1.3, BH = 1.1;
  put(new THREE.BoxGeometry(W, 0.1, W), "#5b3a1e", 0, 0.05, 0);
  put(new THREE.BoxGeometry(W - 0.04, BH - 0.1, W - 0.04), "#4a2f18", 0, 0.1 + (BH - 0.1) / 2, 0);
  const weaveA = "#c98e45", weaveB = "#a8702f";
  for (let side = 0; side < 4; side++) {
    const ang = (side * Math.PI) / 2;
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    for (let r = 0; r < 7; r++) {
      const geo = new THREE.BoxGeometry(W + 0.02, 0.1, 0.05);
      geo.rotateY(ang);
      const y = 0.17 + r * 0.125;
      const o = W / 2 + (r % 2 ? 0.0 : 0.015);
      put(geo, r % 2 ? weaveA : weaveB, dir.x * o, y, dir.z * o);
    }
    for (let k = 0; k < 8; k++) {
      const t = -W / 2 + 0.09 + (k * (W - 0.18)) / 7;
      const geo = new THREE.BoxGeometry(0.05, BH - 0.15, 0.06);
      geo.rotateY(ang);
      const px = dir.x * (W / 2 + 0.035) + Math.cos(ang) * t;
      const pz = dir.z * (W / 2 + 0.035) - Math.sin(ang) * t;
      put(geo, k % 2 ? "#d9a35a" : "#b97d38", px, 0.1 + (BH - 0.15) / 2 + 0.03, pz);
    }
    // rim
    const rim = new THREE.BoxGeometry(W + 0.16, 0.1, 0.1);
    rim.rotateY(ang);
    put(rim, "#6b3f1d", dir.x * (W / 2 + 0.03), BH, dir.z * (W / 2 + 0.03));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    put(new THREE.BoxGeometry(0.12, BH + 0.05, 0.12), "#6b3f1d", sx * (W / 2 + 0.02), BH / 2 + 0.02, sz * (W / 2 + 0.02));
  }

  // ---------- burner frame ----------
  const pc = 0.45, topY = 2.5;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    rod([sx * pc, BH, sz * pc], [sx * pc, topY, sz * pc], 0.03, "#8a8f96", 6);
  }
  put(new THREE.BoxGeometry(pc * 2 + 0.1, 0.06, 0.06), "#8a8f96", 0, topY, pc);
  put(new THREE.BoxGeometry(pc * 2 + 0.1, 0.06, 0.06), "#8a8f96", 0, topY, -pc);
  put(new THREE.BoxGeometry(0.06, 0.06, pc * 2 + 0.1), "#8a8f96", pc, topY, 0);
  put(new THREE.BoxGeometry(0.06, 0.06, pc * 2 + 0.1), "#8a8f96", -pc, topY, 0);
  put(new THREE.CylinderGeometry(0.1, 0.13, 0.3, 8), "#3a3d42", 0, topY + 0.18, 0);
  put(new THREE.TorusGeometry(0.17, 0.035, 5, 10).rotateX(Math.PI / 2), "#c0c4ca", 0, topY + 0.34, 0);
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10), "#c0c4ca", 0, topY + 0.02, 0);
  put(new THREE.ConeGeometry(0.24, 1.0, 7), "#ff7a1a", 0, topY + 0.9, 0);
  put(new THREE.ConeGeometry(0.14, 0.7, 6), "#ffd24a", 0, topY + 0.75, 0);
  put(new THREE.ConeGeometry(0.06, 0.4, 5), "#fff6c8", 0, topY + 0.6, 0);
  // fuel tanks
  for (const sx of [-1, 1]) {
    const geo = new THREE.CapsuleGeometry(0.15, 0.4, 2, 8);
    put(geo, "#c9ced4", sx * 0.3, 0.1 + 0.4, sx * 0.0 + 0.0 - 0.2 * 0);
  }

  // ---------- ropes ----------
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / N;
    const top = [Math.sin(a) * 0.8, Y0, Math.cos(a) * 0.8];
    const dx = Math.sin(a), dz = Math.cos(a);
    const m = Math.max(Math.abs(dx), Math.abs(dz));
    const bot = [(dx / m) * (W / 2 + 0.03), BH + 0.03, (dz / m) * (W / 2 + 0.03)];
    rod(top, bot, 0.022, "#e9dcc0", 4);
    // envelope load tape up the gore
    const sTop = prof(0.12, 0.03);
    rod(top, [Math.sin(a) * sTop.x, sTop.y, Math.cos(a) * sTop.x], 0.025, "#e9dcc0", 4);
  }

  // ---------- sandbags ----------
  const bag = (x: number, z: number, ry: number) => {
    const y = 0.62;
    const body = new THREE.SphereGeometry(0.15, 7, 5);
    body.scale(1, 1.2, 0.85);
    body.rotateY(ry);
    put(body, "#cdae74", x, y, z);
    put(new THREE.CylinderGeometry(0.05, 0.08, 0.09, 6).rotateY(ry), "#b99358", x, y + 0.2, z);
    put(new THREE.TorusGeometry(0.06, 0.016, 4, 6).rotateX(Math.PI / 2), "#e8442e", x, y + 0.17, z);
  };
  const off = W / 2 + 0.2;
  for (const sx of [-1, 1]) for (const z of [-0.35, 0.35]) {
    bag(sx * off, z, 0);
    rod([sx * (W / 2 + 0.06), BH - 0.02, z], [sx * off, 0.82, z], 0.015, "#e9dcc0", 4);
  }
  for (const x of [-0.3, 0.3]) {
    bag(x, off, Math.PI / 2);
    rod([x, BH - 0.02, W / 2 + 0.06], [x, 0.82, off], 0.015, "#e9dcc0", 4);
  }

  // ---------- flag ----------
  const fx = W / 2 + 0.02, fz = W / 2 + 0.02;
  rod([fx, BH, fz], [fx, BH + 1.0, fz], 0.022, "#5b3a1e", 5);
  put(new THREE.SphereGeometry(0.04, 5, 4), "#fcc419", fx, BH + 1.03, fz);
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(0.55, -0.1); sh.lineTo(0, -0.3); sh.closePath();
  put(new THREE.ExtrudeGeometry(sh, { depth: 0.015, bevelEnabled: false }), "#e8442e", fx, BH + 1.0, fz);
  const sh2 = new THREE.Shape();
  sh2.moveTo(0.02, -0.1); sh2.lineTo(0.3, -0.13); sh2.lineTo(0.02, -0.2); sh2.closePath();
  put(new THREE.ExtrudeGeometry(sh2, { depth: 0.02, bevelEnabled: false }), "#fcc419", fx, BH + 1.0, fz - 0.002);

  return b.root;
}
```