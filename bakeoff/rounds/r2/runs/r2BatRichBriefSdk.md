```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Fruit Bat with Fig",
  description:
    "A golden-brown fluffy fruit bat in flight with charcoal membrane wings spread on finger bones, hooked thumb claws, a fox-like face, and a half-eaten fig clutched in its feet.",
};

export default function build() {
  const b = createBuilder({ name: "fruitBat" });

  // deterministic rng (mulberry32)
  let seed = 20240607;
  const rnd = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  type V = [number, number, number];
  const GOLD = "#a8702f", GOLD2 = "#c08a3e", GOLD3 = "#8a5a26", BELLY = "#dba95e", MANTLE = "#e3b266";
  const WING = "#3a3a44", WING2 = "#30303a", BONE = "#1f1f26";

  // ---------- helpers ----------
  const bar = (a: V, c: V, r0: number, r1: number, color: string, bone: any, seg = 6) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
    return b.part(g, color, { at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], bone });
  };
  const ell = (c: V, rx: number, ry: number, rz: number, color: string, bone: any, seg = 8) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 2));
    g.scale(rx, ry, rz);
    return b.part(g, color, { at: c, bone });
  };
  const polys = (polysList: V[][]) => {
    const pos: number[] = [];
    const tri = (p: V, q: V, r: V) => {
      pos.push(...p, ...q, ...r);
      pos.push(...p, ...r, ...q);
    };
    for (const poly of polysList) {
      const c: V = [0, 0, 0];
      poly.forEach((p) => { c[0] += p[0] / poly.length; c[1] += p[1] / poly.length; c[2] += p[2] / poly.length; });
      for (let i = 0; i < poly.length; i++) tri(c, poly[i], poly[(i + 1) % poly.length]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  };

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 0.4, 0] });
  const chest = b.joint("chest", { at: [0, 0.41, 0.05], parent: body });
  const neck = b.joint("neck", { at: [0, 0.43, 0.14], parent: chest });
  const head = b.joint("head", { at: [0, 0.455, 0.19], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.425, 0.21], parent: head });
  const earL = b.joint("earL", { at: [0.032, 0.5, 0.17], parent: head });
  const earR = b.joint("earR", { at: [-0.032, 0.5, 0.17], parent: head });

  // ---------- torso ----------
  ell([0, 0.405, -0.02], 0.085, 0.08, 0.13, GOLD, body, 10);
  ell([0, 0.39, 0.0], 0.07, 0.06, 0.11, BELLY, body, 9);
  ell([0, 0.425, 0.09], 0.09, 0.08, 0.075, GOLD2, chest, 10);
  ell([0, 0.43, 0.15], 0.078, 0.07, 0.06, MANTLE, neck, 9); // fluffy ruff
  // ruff tufts
  const tuft = (c: V, rx: number, ry: number, rz: number, n: number, bone: any, len: number, test?: (p: V) => boolean) => {
    const cols = [GOLD, GOLD2, MANTLE, GOLD3];
    for (let i = 0; i < n; i++) {
      const th = rnd() * Math.PI * 2, u = rnd() * 2 - 1, s = Math.sqrt(1 - u * u);
      const sx = s * Math.cos(th), sy = u, sz = s * Math.sin(th);
      const p: V = [c[0] + rx * sx, c[1] + ry * sy, c[2] + rz * sz];
      if (test && !test(p)) continue;
      const nn = new THREE.Vector3(sx / rx, sy / ry, sz / rz).normalize();
      const base: V = [p[0] - nn.x * 0.008, p[1] - nn.y * 0.008, p[2] - nn.z * 0.008];
      const l = len * (0.7 + rnd() * 0.6);
      const tip: V = [p[0] + nn.x * l, p[1] + nn.y * l, p[2] + nn.z * l];
      bar(base, tip, 0.011, 0.001, cols[Math.floor(rnd() * cols.length)], bone, 4);
    }
  };
  tuft([0, 0.405, -0.02], 0.085, 0.08, 0.13, 60, body, 0.03);
  tuft([0, 0.43, 0.15], 0.078, 0.07, 0.06, 36, neck, 0.032, (p) => p[2] < 0.19);
  tuft([0, 0.425, 0.09], 0.09, 0.08, 0.075, 26, chest, 0.028);

  // ---------- head ----------
  ell([0, 0.46, 0.2], 0.052, 0.048, 0.056, GOLD2, head, 9);
  ell([0, 0.447, 0.26], 0.03, 0.026, 0.05, GOLD, head, 8); // snout
  ell([0, 0.449, 0.305], 0.022, 0.018, 0.03, "#7a5028", head, 7); // muzzle
  ell([0, 0.455, 0.333], 0.017, 0.013, 0.012, "#0c0c0f", head, 7); // moist nose
  ell([0.005, 0.461, 0.343], 0.005, 0.003, 0.003, "#9a9aa8", head, 4);
  ell([0, 0.505, 0.2], 0.04, 0.025, 0.04, MANTLE, head, 7); // forehead tuft
  // lower jaw (separate)
  ell([0, 0.418, 0.258], 0.02, 0.012, 0.042, GOLD3, jaw, 7);
  ell([0, 0.417, 0.295], 0.012, 0.008, 0.012, "#2a1c16", jaw, 5);
  for (const s of [1, -1]) {
    bar([s * 0.009, 0.43, 0.292], [s * 0.009, 0.442, 0.292], 0.003, 0.0007, "#f4efe0", jaw, 4);
    bar([s * 0.009, 0.44, 0.312], [s * 0.009, 0.428, 0.312], 0.003, 0.0007, "#f4efe0", head, 4);
    // eyes
    ell([s * 0.037, 0.472, 0.238], 0.0185, 0.02, 0.018, "#150b0a", head, 8);
    ell([s * 0.043, 0.481, 0.253], 0.005, 0.005, 0.004, "#ffffff", head, 4);
    ell([s * 0.035, 0.463, 0.254], 0.0025, 0.0025, 0.002, "#cfd8e8", head, 4);
    ell([s * 0.04, 0.495, 0.238], 0.022, 0.008, 0.02, GOLD3, head, 6); // brow
    // whiskers
    for (let k = 0; k < 3; k++) {
      bar([s * 0.02, 0.445, 0.3], [s * (0.07 + k * 0.005), 0.452 + (k - 1) * 0.02, 0.31 + k * 0.012], 0.0012, 0.0004, "#3a2a1a", head, 3);
    }
  }
  // ears
  for (const s of [1, -1]) {
    const ej = s === 1 ? earL : earR;
    bar([s * 0.032, 0.495, 0.17], [s * 0.062, 0.585, 0.15], 0.024, 0.003, GOLD, ej, 5);
    bar([s * 0.034, 0.5, 0.176], [s * 0.061, 0.578, 0.158], 0.015, 0.002, "#d98a8a", ej, 5);
    bar([s * 0.03, 0.495, 0.168], [s * 0.04, 0.53, 0.16], 0.026, 0.014, GOLD2, ej, 5);
  }

  // ---------- wings & legs ----------
  const fc = 0.02; // fig centre z
  for (const s of [1, -1]) {
    const sd = s === 1 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [s * x, y, z];
    const S = P(0.08, 0.45, 0.07), E = P(0.3, 0.52, 0.0), W = P(0.52, 0.57, 0.03);
    const K2 = P(0.6, 0.58, 0.09), T2 = P(0.76, 0.57, 0.15);
    const K3 = P(0.66, 0.56, -0.02), T3 = P(0.88, 0.52, 0.0);
    const K4 = P(0.64, 0.5, -0.12), T4 = P(0.8, 0.42, -0.2);
    const K5 = P(0.58, 0.46, -0.2), T5 = P(0.64, 0.34, -0.36);
    const A = P(0.07, 0.19, -0.04) /* ankle */;
    const Hh = P(0.06, 0.37, -0.11) /* hip */;
    const Kn = P(0.08, 0.28, -0.15) /* knee */;
    const N = P(0.06, 0.45, 0.14);

    const shoulder = b.joint("shoulder" + sd, { at: S, parent: chest });
    const elbow = b.joint("elbow" + sd, { at: E, parent: shoulder });
    const wrist = b.joint("wrist" + sd, { at: W, parent: elbow });
    const d2a = b.joint("digit2a" + sd, { at: K2, parent: wrist });
    const d2b = b.joint("digit2b" + sd, { at: T2, parent: d2a });
    const d3a = b.joint("digit3a" + sd, { at: K3, parent: wrist });
    const d3b = b.joint("digit3b" + sd, { at: T3, parent: d3a });
    const d4a = b.joint("digit4a" + sd, { at: K4, parent: wrist });
    const d4b = b.joint("digit4b" + sd, { at: T4, parent: d4a });
    const d5a = b.joint("digit5a" + sd, { at: K5, parent: wrist });
    const d5b = b.joint("digit5b" + sd, { at: T5, parent: d5a });
    const thumb = b.joint("thumb" + sd, { at: W, parent: wrist });
    const thumbTip = P(0.56, 0.63, 0.115);
    const hip = b.joint("hip" + sd, { at: Hh, parent: body });
    const knee = b.joint("knee" + sd, { at: Kn, parent: hip });
    const ankle = b.joint("ankle" + sd, { at: A, parent: knee });

    // membrane panels (all on shoulder bone, rigid)
    const lift = (p: V, dy: number): V => [p[0], p[1] + dy, p[2]];
    b.part(polys([[S, E, W, N]]), WING2, { at: [0, 0, 0], bone: shoulder });
    b.part(polys([[W, K2, K3], [K2, T2, T3, K3]]), WING, { at: [0, 0, 0], bone: wrist });
    b.part(polys([[W, K3, K4], [K3, T3, T4, K4]]), WING2, { at: [0, 0, 0], bone: wrist });
    b.part(polys([[W, K4, K5], [K4, T4, T5, K5]]), WING, { at: [0, 0, 0], bone: wrist });
    b.part(polys([[S, E, W, K5, T5, A, Hh].map((p, i) => (i === 5 || i === 6 ? p : lift(p, -0.005)))]), WING2, { at: [0, 0, 0], bone: shoulder });

    // arm and finger bones
    bar(S, E, 0.017, 0.013, BONE, shoulder, 5);
    bar(E, W, 0.013, 0.01, BONE, elbow, 5);
    ell(lerp3(S, E, 0.3), 0.03, 0.026, 0.04, GOLD, shoulder, 7);
    ell(lerp3(S, E, 0.1), 0.035, 0.03, 0.045, GOLD2, shoulder, 7);
    bar(W, K2, 0.009, 0.007, BONE, wrist, 4); bar(K2, T2, 0.007, 0.003, BONE, d2a, 4);
    bar(W, K3, 0.009, 0.007, BONE, wrist, 4); bar(K3, T3, 0.007, 0.003, BONE, d3a, 4);
    bar(W, K4, 0.009, 0.007, BONE, wrist, 4); bar(K4, T4, 0.007, 0.003, BONE, d4a, 4);
    bar(W, K5, 0.009, 0.007, BONE, wrist, 4); bar(K5, T5, 0.007, 0.003, BONE, d5a, 4);
    // knuckle nubs
    for (const [k, j] of [[K2, d2a], [K3, d3a], [K4, d4a], [K5, d5a]] as [V, any][]) ell(k, 0.01, 0.01, 0.01, "#15151a", j, 5);
    ell(W, 0.015, 0.015, 0.015, "#15151a", wrist, 6);
    // thumb with hooked claw
    bar(W, thumbTip, 0.011, 0.008, BONE, thumb, 5);
    const c1: V = [thumbTip[0] + s * 0.004, 0.645, 0.135];
    const c2: V = [thumbTip[0] + s * 0.004, 0.64, 0.155];
    const c3: V = [thumbTip[0] + s * 0.004, 0.615, 0.162];
    bar(thumbTip, c1, 0.008, 0.006, "#e6dcc4", thumb, 4);
    bar(c1, c2, 0.006, 0.0045, "#e6dcc4", thumb, 4);
    bar(c2, c3, 0.0045, 0.0005, "#e6dcc4", thumb, 4);

    // leg
    bar(Hh, Kn, 0.017, 0.012, GOLD3, hip, 5);
    bar(Kn, A, 0.012, 0.009, GOLD3, knee, 5);
    ell(Hh, 0.026, 0.03, 0.03, GOLD, hip, 6);
    ell(Kn, 0.013, 0.013, 0.013, GOLD2, knee, 5);
    ell(A, 0.014, 0.012, 0.018, "#3a2a22", ankle, 5);
    // toes clutching fig
    for (let i = 0; i < 4; i++) {
      const th = Math.PI - s * 0 - (0.4 + 0.28 * i);
      const rr = 0.069;
      const tip: V = [s * rr * Math.sin(th), 0.1, fc + rr * Math.cos(th)];
      const midp: V = [(A[0] + tip[0]) / 2 + s * 0.006, (A[1] + tip[1]) / 2 + 0.01, (A[2] + tip[2]) / 2];
      bar(A, midp, 0.007, 0.0055, "#3a2a22", ankle, 4);
      bar(midp, tip, 0.0055, 0.0045, "#3a2a22", ankle, 4);
      const cl: V = [tip[0] * 0.92, tip[1] - 0.012, fc + (tip[2] - fc) * 0.92];
      bar(tip, cl, 0.0045, 0.0005, "#e6dcc4", ankle, 4);
    }
  }

  // ---------- half-eaten fig ----------
  const fig = b.joint("fig", { at: [0, 0.07, fc], parent: body });
  const prof = [
    [0.0001, 0], [0.03, 0.004], [0.055, 0.02], [0.068, 0.045], [0.07, 0.075],
    [0.062, 0.108], [0.042, 0.137], [0.02, 0.155], [0.011, 0.165],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const w = 0.85;
  b.part(new THREE.LatheGeometry(prof, 16, w, Math.PI * 2 - 2 * w), "#5a2a52", { at: [0, 0, fc], bone: fig });
  // cut faces
  const faces: number[] = [];
  for (const phi of [w, -w]) {
    for (let i = 0; i < prof.length - 1; i++) {
      const a0: V = [0, prof[i].y, fc], a1: V = [0, prof[i + 1].y, fc];
      const p0: V = [prof[i].x * Math.sin(phi), prof[i].y, fc + prof[i].x * Math.cos(phi)];
      const p1: V = [prof[i + 1].x * Math.sin(phi), prof[i + 1].y, fc + prof[i + 1].x * Math.cos(phi)];
      faces.push(...a0, ...p0, ...p1, ...a0, ...p1, ...p0, ...a0, ...p1, ...a1, ...a0, ...a1, ...p1);
    }
  }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute("position", new THREE.Float32BufferAttribute(faces, 3));
  fg.computeVertexNormals();
  b.part(fg, "#e2677a", { at: [0, 0, 0], bone: fig });
  ell([0, 0.07, fc], 0.056, 0.062, 0.056, "#b8324e", fig, 9);
  ell([0, 0.075, fc], 0.04, 0.045, 0.04, "#7a1f3a", fig, 7);
  // pulp under the bite and seeds
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 1.4 - 0.7, y = 0.045 + (i % 3) * 0.022;
    ell([0.056 * Math.sin(a) * 0.96, y, fc + 0.056 * Math.cos(a) * 0.96], 0.004, 0.003, 0.004, "#f2d27a", fig, 4);
  }
  // base nub and stem
  ell([0, 0.003, fc], 0.012, 0.005, 0.012, "#3a1a38", fig, 5);
  bar([0, 0.16, fc], [0.006, 0.19, fc - 0.004], 0.009, 0.005, "#6b7a3a", fig, 5);
  // skin speckles
  for (let i = 0; i < 14; i++) {
    const a = Math.PI / 2 + rnd() * 5, y = 0.015 + rnd() * 0.12;
    const r = (prof.reduce((m, p, k) => (Math.abs(p.y - y) < Math.abs(m.y - y) ? p : m), prof[0]) as THREE.Vector2).x;
    if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < w + 0.1 && Math.cos(a) > 0.2) continue;
    ell([r * Math.sin(a), y, fc + r * Math.cos(a)], 0.004, 0.004, 0.004, "#a88aa0", fig, 4);
  }

  function lerp3(p: V, q: V, t: number): V {
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  }

  return b.root;
}
```