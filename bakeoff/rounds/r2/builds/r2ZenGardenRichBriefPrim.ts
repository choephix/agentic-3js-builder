import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden Diorama",
  description:
    "Square-base garden with a red arched bridge over a koi pond, three koi, stone lantern, cloud-pruned pine, blossoming cherry tree with falling petals, raked gravel, mossy rocks and stepping stones.",
};

export default function build() {
  const b = createBuilder({ name: "garden" });
  const root = b.joint("base", { at: [0, 0, 0] });

  // deterministic random
  let s = 12345;
  const rnd = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rr = (a: number, c: number) => a + (c - a) * rnd();

  type V = [number, number, number];

  function put(
    geo: THREE.BufferGeometry, color: string, p: V = [0, 0, 0],
    o: { s?: V; r?: V; gy?: number; g?: V } = {}
  ) {
    if (o.s) geo.scale(o.s[0], o.s[1], o.s[2]);
    if (o.r) { geo.rotateX(o.r[0]); geo.rotateY(o.r[1]); geo.rotateZ(o.r[2]); }
    geo.translate(p[0], p[1], p[2]);
    if (o.gy !== undefined) geo.rotateY(o.gy);
    if (o.g) geo.translate(o.g[0], o.g[1], o.g[2]);
    b.part(geo, color, { at: [0, 0, 0], bone: root });
  }

  function rod(a: V, c: V, r1: number, r2: number, color: string, seg = 5) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const len = d.length();
    const geo = new THREE.CylinderGeometry(r2, r1, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    geo.applyQuaternion(q);
    const m = A.clone().add(B).multiplyScalar(0.5);
    geo.translate(m.x, m.y, m.z);
    b.part(geo, color, { at: [0, 0, 0], bone: root });
  }

  const G = 0.08; // ground top

  // ---------- base ----------
  put(new THREE.BoxGeometry(1.2, 0.05, 1.2), "#6b4a2f", [0, 0.025, 0]);
  put(new THREE.BoxGeometry(1.22, 0.012, 1.22), "#4e3420", [0, 0.006, 0]);
  put(new THREE.BoxGeometry(1.1, 0.03, 1.1), "#efece4", [0, 0.065, 0]);

  // grass / moss patches
  put(new THREE.CylinderGeometry(1, 1, 0.008, 10), "#5f9a49", [-0.38, G + 0.002, -0.36], { s: [0.2, 1, 0.18] });
  put(new THREE.CylinderGeometry(1, 1, 0.008, 10), "#5f9a49", [0.3, G + 0.002, -0.4], { s: [0.22, 1, 0.16] });
  put(new THREE.CylinderGeometry(1, 1, 0.008, 10), "#6fae55", [-0.5, G + 0.002, -0.05], { s: [0.07, 1, 0.12] });

  // ---------- pond ----------
  put(new THREE.CylinderGeometry(1, 1, 0.012, 24), "#2f7494", [0, 0.086, 0], { s: [0.37, 1, 0.25] });
  put(new THREE.CylinderGeometry(1, 1, 0.004, 24), "#4aa3c4", [0, 0.092, 0], { s: [0.34, 1, 0.22] });
  // edge rocks
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    if (Math.abs(Math.sin(a)) < 0.4) continue;
    const x = Math.cos(a) * 0.385, z = Math.sin(a) * 0.265;
    const sz = rr(0.025, 0.04);
    put(new THREE.DodecahedronGeometry(1, 0), i % 3 ? "#8a8a84" : "#9b9b94", [x, G + 0.005, z],
      { s: [sz, sz * 0.6, sz], r: [0, rr(0, 3), 0] });
  }
  // lily pads
  for (const [x, z, sc] of [[-0.15, 0.1, 0.035], [0.2, -0.12, 0.04], [0.12, 0.13, 0.028]] as [number, number, number][]) {
    put(new THREE.CylinderGeometry(sc, sc, 0.003, 8), "#4f9a4a", [x, 0.095, z]);
  }
  put(new THREE.ConeGeometry(0.012, 0.015, 6), "#ffb7cf", [0.2, 0.103, -0.12]);

  // ---------- koi ----------
  function koi(x: number, z: number, ang: number, patch: string, scl: number) {
    const g: V = [x, 0.097, z];
    const o = (extra: any = {}) => ({ gy: ang, g, ...extra });
    put(new THREE.IcosahedronGeometry(1, 1), "#fbf7f0", [0, 0, 0], o({ s: [0.024 * scl, 0.018 * scl, 0.07 * scl] }));
    put(new THREE.IcosahedronGeometry(1, 1), "#fbf7f0", [0, 0.001, 0.055 * scl], o({ s: [0.02 * scl, 0.016 * scl, 0.025 * scl] }));
    put(new THREE.IcosahedronGeometry(1, 1), patch, [0, 0.011 * scl, 0.04 * scl], o({ s: [0.014 * scl, 0.01 * scl, 0.02 * scl] }));
    put(new THREE.IcosahedronGeometry(1, 1), patch, [0.004 * scl, 0.013 * scl, -0.02 * scl], o({ s: [0.016 * scl, 0.009 * scl, 0.028 * scl] }));
    put(new THREE.IcosahedronGeometry(1, 0), patch, [-0.004 * scl, 0.012 * scl, -0.052 * scl], o({ s: [0.01 * scl, 0.006 * scl, 0.016 * scl] }));
    // eyes
    put(new THREE.SphereGeometry(0.004 * scl, 5, 4), "#1a1a1a", [0.014 * scl, 0.006 * scl, 0.068 * scl], o());
    put(new THREE.SphereGeometry(0.004 * scl, 5, 4), "#1a1a1a", [-0.014 * scl, 0.006 * scl, 0.068 * scl], o());
    // tail
    put(new THREE.ConeGeometry(1, 1, 4), patch, [0, 0, -0.12 * scl],
      o({ s: [0.03 * scl, 0.06 * scl, 0.005 * scl], r: [-Math.PI / 2, 0, 0] }));
    // fins
    put(new THREE.BoxGeometry(0.003, 0.014 * scl, 0.03 * scl), "#f6d9bf", [0, 0.018 * scl, -0.01 * scl], o());
    put(new THREE.BoxGeometry(0.025 * scl, 0.002, 0.016 * scl), "#f6d9bf", [0.03 * scl, -0.004, 0.025 * scl], o({ r: [0, 0.5, 0] }));
    put(new THREE.BoxGeometry(0.025 * scl, 0.002, 0.016 * scl), "#f6d9bf", [-0.03 * scl, -0.004, 0.025 * scl], o({ r: [0, -0.5, 0] }));
  }
  koi(-0.12, -0.03, 0.6, "#ff7a1c", 1.0);
  koi(0.14, 0.02, 3.7, "#f2561a", 0.9);
  koi(0.0, 0.14, 2.2, "#ff9a2e", 0.8);

  // ---------- bridge ----------
  const L = 0.46, H = 0.12, BY = 0.1;
  const yAt = (x: number) => BY + H * (1 - (x / L) * (x / L));
  const slope = (x: number) => Math.atan((-2 * H * x) / (L * L));
  const N = 16;
  for (let i = 0; i < N; i++) {
    const x = -L + ((i + 0.5) / N) * 2 * L;
    put(new THREE.BoxGeometry(0.052, 0.012, 0.17), i % 2 ? "#b5392b" : "#a63224", [x, yAt(x) + 0.0, 0],
      { r: [0, 0, slope(x)] });
  }
  // stringers
  for (const z of [-0.075, 0.075]) {
    const pts: V[] = [];
    for (let i = 0; i <= 12; i++) { const x = -L + (i / 12) * 2 * L; pts.push([x, yAt(x) - 0.012, z]); }
    for (let i = 0; i < 12; i++) rod(pts[i], pts[i + 1], 0.009, 0.009, "#7d2318", 4);
  }
  // posts & rails
  for (const z of [-0.088, 0.088]) {
    const ps: V[] = [], lows: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const x = -L + (i / 8) * 2 * L;
      ps.push([x, yAt(x) + 0.075, z]);
      lows.push([x, yAt(x) + 0.038, z]);
    }
    for (let i = 0; i <= 8; i++) {
      const x = ps[i][0];
      rod([x, yAt(x), z], ps[i], 0.007, 0.007, "#c8412f", 5);
      if (i % 2 === 0) put(new THREE.SphereGeometry(0.01, 6, 5), "#e0b040", [x, ps[i][1] + 0.01, z], { s: [1, 1.2, 1] });
      else put(new THREE.BoxGeometry(0.012, 0.014, 0.012), "#e0b040", [x, ps[i][1] + 0.003, z]);
    }
    for (let i = 0; i < 8; i++) {
      rod(ps[i], ps[i + 1], 0.005, 0.005, "#d84a35", 4);
      rod(lows[i], lows[i + 1], 0.004, 0.004, "#a63224", 4);
    }
  }
  // footings
  for (const sx of [-1, 1]) {
    put(new THREE.BoxGeometry(0.06, 0.03, 0.2), "#8a8a84", [sx * (L + 0.02), G + 0.005, 0]);
  }

  // ---------- stepping stones ----------
  const steps: [number, number, number][] = [
    [-0.2, 0.5, 0.045], [-0.3, 0.43, 0.042], [-0.4, 0.36, 0.04], [-0.48, 0.27, 0.042], [-0.52, 0.16, 0.04],
  ];
  for (const [x, z, r] of steps) {
    put(new THREE.CylinderGeometry(r, r * 1.1, 0.02, 7), "#9a9a92", [x, G + 0.008, z], { r: [0, rr(0, 3), 0] });
    put(new THREE.CylinderGeometry(r * 0.6, r * 0.7, 0.004, 6), "#7ea65a", [x + r * 0.2, G + 0.019, z - r * 0.2]);
  }

  // ---------- rocks & gravel rings ----------
  const rock = (x: number, z: number, sz: number) => {
    put(new THREE.DodecahedronGeometry(1, 0), "#7d7d78", [x, G + sz * 0.45, z], { s: [sz, sz * 0.75, sz * 0.85], r: [0, 0.7, 0] });
    put(new THREE.IcosahedronGeometry(1, 1), "#5f9a49", [x, G + sz * 0.9, z], { s: [sz * 0.7, sz * 0.3, sz * 0.6] });
    put(new THREE.IcosahedronGeometry(1, 0), "#78b25a", [x + sz * 0.35, G + sz * 0.7, z + sz * 0.3], { s: [sz * 0.25, sz * 0.18, sz * 0.25] });
  };
  rock(0.12, 0.4, 0.06);
  rock(0.27, 0.5, 0.035);
  rock(-0.1, 0.5, 0.03);
  rock(-0.5, -0.1, 0.04);
  for (const r of [0.08, 0.115]) {
    put(new THREE.TorusGeometry(r, 0.003, 4, 28), "#cfcabb", [0.12, G + 0.002, 0.4], { r: [Math.PI / 2, 0, 0] });
  }
  for (let i = 0; i < 6; i++) {
    put(new THREE.BoxGeometry(0.9, 0.003, 0.004), "#d7d2c4", [0.0, G + 0.001, -0.54 + i * 0.0 + 0.0 + (i - 3) * 0.0 + 0.0 + 0.0 + 0.0 + 0.0]);
    break;
  }
  for (let i = 0; i < 4; i++) {
    put(new THREE.BoxGeometry(0.5, 0.003, 0.004), "#d7d2c4", [0.2, G + 0.001, 0.53 - i * 0.0 - 0.0 + i * 0.0 - 0.0 - i * 0.0 + 0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0], {});
    break;
  }

  // ---------- stone lantern ----------
  {
    const x = 0.45, z = 0.27;
    put(new THREE.CylinderGeometry(0.05, 0.058, 0.02, 6), "#a3a39a", [x, G + 0.01, z]);
    put(new THREE.CylinderGeometry(0.014, 0.018, 0.09, 6), "#b5b5ab", [x, G + 0.065, z]);
    put(new THREE.SphereGeometry(0.026, 6, 4), "#a3a39a", [x, G + 0.115, z], { s: [1, 0.6, 1] });
    put(new THREE.CylinderGeometry(0.052, 0.04, 0.014, 6), "#b5b5ab", [x, G + 0.138, z]);
    put(new THREE.BoxGeometry(0.044, 0.05, 0.044), "#c6c6bb", [x, G + 0.17, z]);
    // warm windows
    for (const [dx, dz, ry] of [[0, 0.023, 0], [0, -0.023, 0], [0.023, 0, Math.PI / 2], [-0.023, 0, Math.PI / 2]] as [number, number, number][]) {
      put(new THREE.BoxGeometry(0.02, 0.026, 0.004), "#ffcf6a", [x + dx, G + 0.172, z + dz], { r: [0, ry, 0] });
    }
    put(new THREE.ConeGeometry(0.085, 0.05, 6), "#8f8f86", [x, G + 0.222, z]);
    put(new THREE.SphereGeometry(0.015, 6, 5), "#b5b5ab", [x, G + 0.255, z]);
    put(new THREE.ConeGeometry(0.008, 0.02, 6), "#b5b5ab", [x, G + 0.274, z]);
  }

  // ---------- pine tree ----------
  {
    const tx = -0.38, tz = -0.36, y0 = G;
    const P: V[] = [
      [tx, y0, tz], [tx + 0.03, y0 + 0.09, tz + 0.01], [tx - 0.02, y0 + 0.18, tz], [tx + 0.02, y0 + 0.27, tz - 0.01],
    ];
    rod(P[0], P[1], 0.028, 0.02, "#5a3d28", 6);
    rod(P[1], P[2], 0.02, 0.016, "#5a3d28", 6);
    rod(P[2], P[3], 0.016, 0.01, "#5a3d28", 6);
    const cloud = (cx: number, cy: number, cz: number, r: number, from: V) => {
      rod(from, [cx, cy - 0.01, cz], 0.009, 0.006, "#5a3d28", 4);
      const cols = ["#2f6b3a", "#3b7a44", "#2a5f35"];
      put(new THREE.IcosahedronGeometry(1, 1), cols[0], [cx, cy, cz], { s: [r, r * 0.5, r * 0.9] });
      put(new THREE.IcosahedronGeometry(1, 1), cols[1], [cx + r * 0.5, cy + r * 0.1, cz + r * 0.2], { s: [r * 0.6, r * 0.38, r * 0.6] });
      put(new THREE.IcosahedronGeometry(1, 1), cols[2], [cx - r * 0.5, cy + r * 0.08, cz - r * 0.2], { s: [r * 0.6, r * 0.36, r * 0.6] });
      put(new THREE.IcosahedronGeometry(1, 1), cols[1], [cx, cy + r * 0.35, cz], { s: [r * 0.55, r * 0.3, r * 0.5] });
    };
    cloud(tx + 0.13, y0 + 0.15, tz + 0.03, 0.075, P[1]);
    cloud(tx - 0.11, y0 + 0.22, tz - 0.02, 0.075, P[2]);
    cloud(tx + 0.07, y0 + 0.28, tz + 0.08, 0.06, P[3]);
    cloud(tx + 0.02, y0 + 0.34, tz - 0.01, 0.08, P[3]);
  }

  // ---------- cherry tree ----------
  {
    const tx = 0.3, tz = -0.38, y0 = G;
    rod([tx, y0, tz], [tx - 0.01, y0 + 0.1, tz], 0.03, 0.022, "#4a3224", 6);
    rod([tx - 0.01, y0 + 0.1, tz], [tx + 0.03, y0 + 0.2, tz + 0.01], 0.022, 0.016, "#4a3224", 6);
    rod([tx + 0.03, y0 + 0.2, tz + 0.01], [tx - 0.1, y0 + 0.29, tz + 0.03], 0.012, 0.007, "#4a3224", 5);
    rod([tx + 0.03, y0 + 0.2, tz + 0.01], [tx + 0.12, y0 + 0.28, tz - 0.03], 0.012, 0.007, "#4a3224", 5);
    rod([tx + 0.03, y0 + 0.2, tz + 0.01], [tx + 0.02, y0 + 0.33, tz - 0.02], 0.012, 0.007, "#4a3224", 5);
    rod([tx - 0.01, y0 + 0.12, tz], [tx - 0.08, y0 + 0.2, tz - 0.06], 0.01, 0.006, "#4a3224", 5);
    const pinks = ["#f6a6c1", "#f9bfd3", "#ee8fb0", "#fbd5e2", "#f4b3ca"];
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.17;
      const cx = tx + 0.01 + Math.cos(a) * d, cz = tz + Math.sin(a) * d * 0.85;
      const cy = y0 + 0.33 + (0.08 - d * 0.35) * rnd() + (d < 0.08 ? 0.05 : 0) - 0.03;
      const r = rr(0.04, 0.075);
      put(new THREE.IcosahedronGeometry(1, 1), pinks[i % 5], [cx, cy, cz], { s: [r, r * 0.8, r], r: [rnd(), rnd(), 0] });
    }
    // petals
    for (let i = 0; i < 60; i++) {
      const a = rnd() * Math.PI * 2, d = rr(0.05, 0.42);
      const x = tx + Math.cos(a) * d, z = tz + Math.sin(a) * d * 1.3;
      if (Math.abs(x) > 0.54 || Math.abs(z) > 0.54) continue;
      const inPond = (x / 0.36) ** 2 + (z / 0.24) ** 2 < 1;
      let y: number;
      if (i < 24) y = rr(0.12, 0.34);
      else y = inPond ? 0.095 : G + 0.002;
      put(new THREE.CylinderGeometry(0.009, 0.009, 0.002, 5), pinks[i % 5], [x, y, z],
        { s: [1, 1, 1.4], r: [y > 0.1 && !inPond ? rr(-1, 1) : 0, rr(0, 3), y > 0.1 && !inPond ? rr(-1, 1) : 0] });
    }
  }

  return b.root;
}
