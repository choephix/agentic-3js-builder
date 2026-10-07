```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Hot-Air Balloon",
  description:
    "Striped hot-air balloon about to take off: yellow, red and blue envelope with a checkered band, glowing burner, ropes, wicker basket, sandbags, propane tanks and a pennant.",
};

export default function build() {
  const b = createBuilder({ name: "balloon" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const basketJ = b.joint("basket", { at: [0, 0.5, 0], parent: root });
  const burnerJ = b.joint("burner", { at: [0, 3.2, 0], parent: root });
  const envJ = b.joint("envelope", { at: [0, 8, 0], parent: root });
  const flagJ = b.joint("flag", { at: [0.75, 2.3, -0.75], parent: basketJ });

  const add = (g: THREE.BufferGeometry, color: string, bone: any) => b.part(g, color, { bone });

  const rodGeo = (a: number[], c: number[], r: number, seg = 5) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.applyQuaternion(q);
    const m = A.clone().add(C).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return g;
  };
  const boxAt = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    return g;
  };

  // ---------- Envelope ----------
  const prof: [number, number][] = [
    [1.1, 3.8], [1.9, 4.6], [3.0, 6.0], [4.2, 8.0], [4.9, 10.0],
    [5.0, 11.0], [4.6, 12.6], [3.6, 14.0], [2.0, 15.2], [0.0, 15.8],
  ];
  const radiusAt = (y: number) => {
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, y0] = prof[i];
      const [r1, y1] = prof[i + 1];
      if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0;
  };
  const colors = ["#ffc928", "#e8432d", "#3a9bdc"];
  const N = 12;
  const dphi = (Math.PI * 2) / N;
  const pts = prof.map(([r, y]) => new THREE.Vector2(r, y));
  for (let i = 0; i < N; i++) {
    add(new THREE.LatheGeometry(pts, 2, i * dphi, dphi), colors[i % 3], envJ);
  }

  // patterned band (checker)
  const rows: [number, number][] = [[8.2, 9.2], [9.2, 10.2]];
  const BN = 24;
  const bphi = (Math.PI * 2) / BN;
  rows.forEach(([y0, y1], row) => {
    const bp: THREE.Vector2[] = [];
    for (let k = 0; k <= 2; k++) {
      const y = y0 + ((y1 - y0) * k) / 2;
      bp.push(new THREE.Vector2(radiusAt(y) * 1.012, y));
    }
    for (let i = 0; i < BN; i++) {
      add(new THREE.LatheGeometry(bp, 1, i * bphi, bphi), (i + row) % 2 ? "#1f2d5c" : "#fff3d6", envJ);
    }
  });
  for (const y of [8.2, 10.2]) {
    const g = new THREE.TorusGeometry(radiusAt(y) * 1.014, 0.07, 4, 36);
    g.rotateX(Math.PI / 2);
    g.translate(0, y, 0);
    add(g, "#f0a21c", envJ);
  }
  // mouth ring and top cap knob
  {
    const g = new THREE.TorusGeometry(1.1, 0.07, 4, 24);
    g.rotateX(Math.PI / 2);
    g.translate(0, 3.8, 0);
    add(g, "#2b2b33", envJ);
    add(new THREE.CylinderGeometry(0.35, 0.45, 0.15, 8).translate(0, 15.8, 0), "#2b2b33", envJ);
  }

  // ---------- Basket ----------
  const wick = ["#b9803f", "#a06a2f"];
  for (let i = 0; i < 10; i++) {
    const e = i % 2 ? 0.012 : 0;
    add(boxAt(1.3 + e, 0.1, 1.3 + e, 0, 0.05 + i * 0.1, 0), wick[i % 2], basketJ);
  }
  // vertical staves
  for (let k = 0; k < 7; k++) {
    const p = -0.54 + k * 0.18;
    const c = wick[k % 2 ? 0 : 1];
    add(boxAt(0.07, 0.95, 0.03, p, 0.5, 0.665), c, basketJ);
    add(boxAt(0.07, 0.95, 0.03, p, 0.5, -0.665), c, basketJ);
    add(boxAt(0.03, 0.95, 0.07, 0.665, 0.5, p), c, basketJ);
    add(boxAt(0.03, 0.95, 0.07, -0.665, 0.5, p), c, basketJ);
  }
  // leather rim
  const rim = "#5a3418";
  add(boxAt(1.42, 0.09, 0.12, 0, 1.03, 0.65), rim, basketJ);
  add(boxAt(1.42, 0.09, 0.12, 0, 1.03, -0.65), rim, basketJ);
  add(boxAt(0.12, 0.09, 1.42, 0.65, 1.03, 0), rim, basketJ);
  add(boxAt(0.12, 0.09, 1.42, -0.65, 1.03, 0), rim, basketJ);
  // floor skids
  add(boxAt(1.4, 0.05, 0.14, 0, 0.0, 0.45), rim, basketJ);
  add(boxAt(1.4, 0.05, 0.14, 0, 0.0, -0.45), rim, basketJ);

  // corner poles up to burner frame
  const corners: [number, number][] = [[0.6, 0.6], [-0.6, 0.6], [0.6, -0.6], [-0.6, -0.6]];
  for (const [x, z] of corners) {
    add(rodGeo([x, 1.0, z], [x, 3.0, z], 0.04, 6), "#c9ccd2", basketJ);
  }
  // burner frame
  const fy = 3.0;
  add(boxAt(1.28, 0.06, 0.06, 0, fy, 0.6), "#c9ccd2", burnerJ);
  add(boxAt(1.28, 0.06, 0.06, 0, fy, -0.6), "#c9ccd2", burnerJ);
  add(boxAt(0.06, 0.06, 1.28, 0.6, fy, 0), "#c9ccd2", burnerJ);
  add(boxAt(0.06, 0.06, 1.28, -0.6, fy, 0), "#c9ccd2", burnerJ);
  // burner unit
  add(new THREE.CylinderGeometry(0.1, 0.14, 0.4, 8).translate(0, 3.25, 0), "#3a3a42", burnerJ);
  add(new THREE.CylinderGeometry(0.2, 0.12, 0.12, 8).translate(0, 3.5, 0), "#8a8d96", burnerJ);
  add(rodGeo([0, 3.0, 0], [0, 3.2, 0], 0.05), "#3a3a42", burnerJ);
  add(rodGeo([0.6, fy, 0], [-0.6, fy, 0], 0.035), "#3a3a42", burnerJ);
  // flame
  add(new THREE.ConeGeometry(0.28, 1.3, 8).translate(0, 4.2, 0), "#ff6a13", burnerJ);
  add(new THREE.ConeGeometry(0.16, 0.9, 6).translate(0, 4.0, 0), "#ffc23a", burnerJ);
  add(new THREE.ConeGeometry(0.07, 0.5, 6).translate(0, 3.9, 0), "#fff6c2", burnerJ);

  // propane tanks
  for (const x of [-0.38, 0.38]) {
    add(new THREE.CylinderGeometry(0.17, 0.17, 0.75, 10).translate(x, 0.5 + 0.35, -0.3), "#d8dce2", basketJ);
    add(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, 1.225, -0.3), "#d8dce2", basketJ);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6).translate(x, 1.45, -0.3), "#b33a2a", basketJ);
    add(new THREE.CylinderGeometry(0.175, 0.175, 0.08, 10).translate(x, 0.75, -0.3), "#e8432d", basketJ);
  }
  add(rodGeo([-0.38, 1.45, -0.3], [0, 3.1, 0], 0.025, 4), "#222222", basketJ);
  add(rodGeo([0.38, 1.45, -0.3], [0, 3.1, 0], 0.025, 4), "#222222", basketJ);

  // ---------- Ropes ----------
  const ropeCol = "#e9dcc0";
  const attach = (x: number, z: number, y: number) => {
    const th = Math.atan2(x, z);
    const r = radiusAt(y) * 1.0;
    return [r * Math.sin(th), y, r * Math.cos(th)];
  };
  for (const [x, z] of corners) {
    add(rodGeo([x, 3.0, z], attach(x, z, 5.0), 0.025, 4), ropeCol, envJ);
  }
  for (const [x, z] of [[0, 0.66], [0, -0.66], [0.66, 0], [-0.66, 0]]) {
    add(rodGeo([x, 1.05, z], attach(x, z, 5.0), 0.022, 4), ropeCol, envJ);
  }
  // load ring pads on envelope
  for (const [x, z] of [...corners, [0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const a = attach(x, z, 5.0);
    add(new THREE.SphereGeometry(0.1, 5, 4).translate(a[0], a[1], a[2]), "#2b2b33", envJ);
  }

  // ---------- Sandbags ----------
  const sack = (x: number, z: number) => {
    const y = 0.62;
    const g = new THREE.SphereGeometry(0.17, 7, 5);
    g.scale(1, 1.25, 0.85);
    g.translate(x, y, z);
    add(g, "#cfae72", basketJ);
    add(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 6).translate(x, y + 0.22, z), "#8a6a3a", basketJ);
    add(rodGeo([x, y + 0.25, z], [x, 1.03, z], 0.015, 4), ropeCol, basketJ);
  };
  for (const z of [-0.4, 0, 0.4]) {
    sack(0.76, z);
    sack(-0.76, z);
  }
  for (const x of [-0.3, 0.3]) sack(x, 0.76);

  // ---------- Flag ----------
  add(rodGeo([0.75, 0.95, -0.75], [0.75, 2.5, -0.75], 0.025, 5), "#5a3418", flagJ);
  add(new THREE.SphereGeometry(0.05, 6, 4).translate(0.75, 2.52, -0.75), "#f0a21c", flagJ);
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.lineTo(0.8, -0.14);
  sh.lineTo(0, -0.4);
  sh.closePath();
  const fg = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false });
  fg.translate(0.77, 2.46, -0.76);
  add(fg, "#e8432d", flagJ);
  const sh2 = new THREE.Shape();
  sh2.moveTo(0, -0.1);
  sh2.lineTo(0.45, -0.18);
  sh2.lineTo(0, -0.25);
  sh2.closePath();
  const fg2 = new THREE.ExtrudeGeometry(sh2, { depth: 0.03, bevelEnabled: false });
  fg2.translate(0.77, 2.46, -0.765);
  add(fg2, "#ffc928", flagJ);

  return b.root;
}
```