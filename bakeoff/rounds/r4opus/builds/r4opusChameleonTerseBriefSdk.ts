import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Chameleon",
  description:
    "A stylized veiled/panther chameleon puppet in a rig-ready rest pose: a tall crested casque, ringed turret eyes on their own joints, a hinged jaw with a gular crest, teal-barred lime body with a cream flank stripe, mitten feet split into digit chains, and an 11-joint tail with a gentle tip curl.",
};

export default function build() {
  const b: any = createBuilder({ name: "chameleon" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- palette ----------
  const C = {
    BODY: "#45b04c",
    BODY_D: "#2c7f3b",
    LIGHT: "#a6e35a",
    CREST: "#d9f07a",
    CREAM: "#fff0c2",
    TEAL: "#1fa6a0",
    ORANGE: "#ff8a3d",
    RED: "#e4473b",
    YELLOW: "#ffd447",
    BLACK: "#151515",
    WHITE: "#ffffff",
    CLAW: "#f0d9a8",
    JAW: "#bfe366",
    LEG: "#3c9f47",
    EYE: "#4fbf55",
  };

  // ---------- randomness ----------
  const R: any = rng(20250611);
  const rand = (): number =>
    typeof R === "function"
      ? R()
      : typeof R.next === "function"
      ? R.next()
      : typeof R.random === "function"
      ? R.random()
      : R.float();

  // ---------- helpers ----------
  const role = (j: any, r: string) => {
    const o = j && (j.bone ?? j.object ?? j);
    if (o && o.userData) o.userData.role = r;
  };
  // rotate a geometry so its local +Y points along dir (right-handed basis)
  const orient = (g: THREE.BufferGeometry, dirIn: THREE.Vector3) => {
    const y = dirIn.clone().normalize();
    const ref = Math.abs(y.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    const x = new THREE.Vector3().crossVectors(ref, y).normalize();
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
    return g;
  };
  const part = (g: THREE.BufferGeometry, color: string, at: THREE.Vector3, bone: any) =>
    b.part(g, color, { at, bone });
  const ell = (c: THREE.Vector3, r: THREE.Vector3, color: string, bone: any, ws = 10, hs = 7) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(r.x, r.y, r.z);
    part(g, color, c, bone);
  };
  const ball = (c: THREE.Vector3, r: number, color: string, bone: any, seg = 8, sx = 1) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7)));
    g.scale(r * sx, r, r);
    part(g, color, c, bone);
  };
  const seg = (
    p: THREE.Vector3, q: THREE.Vector3, r1: number, r2: number, color: string, bone: any,
    sides = 7, sx = 1, sz = 1
  ) => {
    const d = q.clone().sub(p);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), sides, 1);
    g.scale(sx, 1, sz);
    orient(g, d);
    part(g, color, p.clone().add(q).multiplyScalar(0.5), bone);
  };
  const cone = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, bone: any, sides = 5) => {
    const g = new THREE.ConeGeometry(r, len, sides);
    g.translate(0, len / 2, 0);
    orient(g, dir);
    part(g, color, base, bone);
  };
  const spot = (p: THREE.Vector3, n: THREE.Vector3, r: number, color: string, bone: any, flat = 0.4) => {
    const g = new THREE.IcosahedronGeometry(1, 0);
    g.scale(r, r * flat, r);
    orient(g, n);
    part(g, color, p, bone);
  };

  // ---------- skeleton: spine, neck, head ----------
  const hips = b.joint("hips", { at: [0, 0.12, -0.04] });
  const spine1 = b.joint("spine1", { at: [0, 0.126, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.13, 0.04], parent: spine1 });
  const neck = b.joint("neck", { at: [0, 0.14, 0.075], parent: chest });
  const head = b.joint("head", { at: [0, 0.148, 0.095], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.14, 0.112], parent: head });
  const snoutTip = b.joint("snoutTip", { at: [0, 0.143, 0.178], parent: head });
  const jawTip = b.joint("jawTip", { at: [0, 0.131, 0.172], parent: jaw });
  [hips, spine1, chest].forEach((j) => role(j, "spine"));
  role(neck, "neck");
  role(head, "head");
  role(snoutTip, "head");
  role(jaw, "jaw");
  role(jawTip, "jaw");

  // ---------- body ----------
  type Ell = { c: THREE.Vector3; r: THREE.Vector3; bone: any };
  const E: Ell[] = [
    { c: V(0, 0.12, -0.038), r: V(0.029, 0.043, 0.06), bone: hips },
    { c: V(0, 0.126, -0.002), r: V(0.031, 0.05, 0.05), bone: spine1 },
    { c: V(0, 0.128, 0.035), r: V(0.03, 0.048, 0.058), bone: chest },
    { c: V(0, 0.142, 0.082), r: V(0.024, 0.03, 0.028), bone: neck },
  ];
  E.forEach((e) => ell(e.c, e.r, C.BODY, e.bone, 12, 9));

  // surface of a union of ellipsoids, seen from the side (s = +1 left, -1 right)
  const sideOf = (list: Ell[], s: number, y: number, z: number) => {
    let best: { x: number; e: Ell } | null = null;
    for (const e of list) {
      const dy = (y - e.c.y) / e.r.y, dz = (z - e.c.z) / e.r.z;
      const q = 1 - dy * dy - dz * dz;
      if (q <= 0) continue;
      const x = e.r.x * Math.sqrt(q);
      if (!best || x > best.x) best = { x, e };
    }
    if (!best) return null;
    const e = best.e;
    const p = V(s * best.x, y, z);
    const n = V(
      (s * best.x) / (e.r.x * e.r.x),
      (y - e.c.y) / (e.r.y * e.r.y),
      (z - e.c.z) / (e.r.z * e.r.z)
    ).normalize();
    return { p, n, bone: e.bone };
  };
  // top (sign 1) or bottom (sign -1) midline of the union
  const midline = (z: number, sign: number) => {
    let best: { y: number; e: Ell } | null = null;
    for (const e of E) {
      const dz = (z - e.c.z) / e.r.z;
      const q = 1 - dz * dz;
      if (q <= 0) continue;
      const y = e.c.y + sign * e.r.y * Math.sqrt(q);
      if (!best || sign * y > sign * best.y) best = { y, e };
    }
    if (!best) return null;
    const e = best.e;
    const p = V(0, best.y, z);
    const n = V(0, (best.y - e.c.y) / (e.r.y * e.r.y), (z - e.c.z) / (e.r.z * e.r.z)).normalize();
    return { p, n, bone: e.bone };
  };

  // dorsal crest
  let ci = 0;
  for (let z = 0.082; z >= -0.092; z -= 0.011) {
    const h = midline(z, 1);
    if (!h) continue;
    const dir = h.n.clone().add(V(0, 0, -0.45)).normalize();
    cone(h.p.clone().addScaledVector(h.n, -0.001), dir, ci % 2 ? 0.0062 : 0.0098, 0.0029, C.CREST, h.bone);
    ci++;
  }
  // ventral (gular-to-vent) crest
  for (let z = 0.1; z >= -0.07; z -= 0.011) {
    const h = midline(z, -1);
    if (!h) continue;
    cone(h.p.clone().addScaledVector(h.n, -0.001), V(0, -1, 0.3), 0.0055, 0.0022, C.WHITE, h.bone, 4);
  }

  for (const s of [1, -1]) {
    // cream flank stripe
    for (let z = -0.086; z <= 0.088; z += 0.0105) {
      const y = 0.104 + 0.004 * Math.sin(z * 70);
      const h = sideOf(E, s, y, z);
      if (h) spot(h.p, h.n, 0.0056, C.CREAM, h.bone, 0.38);
    }
    // teal vertical bars with a red heart
    const bars = [-0.072, -0.045, -0.018, 0.009, 0.036, 0.062];
    bars.forEach((z0, bi) => {
      let k = 0;
      for (let y = 0.118; y <= 0.172; y += 0.0092) {
        const z = z0 + (y - 0.12) * 0.35;
        const h = sideOf(E, s, y, z);
        if (!h) continue;
        const color = k === 2 && bi % 2 === 0 ? C.RED : C.TEAL;
        spot(h.p, h.n, k === 2 ? 0.0058 : 0.005, color, h.bone, 0.36);
        k++;
      }
    });
    // shoulder & hip scallops on the lower flank
    for (let z = -0.08; z <= 0.08; z += 0.016) {
      const h = sideOf(E, s, 0.092, z + 0.008);
      if (h) spot(h.p, h.n, 0.0035, C.LIGHT, h.bone, 0.5);
    }
  }
  // scattered tubercles
  for (let i = 0; i < 90; i++) {
    const s = rand() < 0.5 ? 1 : -1;
    const z = -0.09 + rand() * 0.19;
    const y = 0.084 + rand() * 0.09;
    const h = sideOf(E, s, y, z);
    if (!h) continue;
    const pick = rand();
    const color = pick < 0.55 ? C.BODY_D : pick < 0.9 ? C.LIGHT : C.YELLOW;
    spot(h.p, h.n, 0.0022 + rand() * 0.0016, color, h.bone, 0.6);
  }

  // ---------- head ----------
  const cranium: Ell = { c: V(0, 0.152, 0.108), r: V(0.023, 0.026, 0.036), bone: head };
  ell(cranium.c, cranium.r, C.BODY, head, 10, 8);
  // upper jaw / snout
  seg(V(0, 0.151, 0.118), V(0, 0.143, 0.178), 0.019, 0.0065, C.BODY, head, 6, 1, 0.9);
  // rostral bumps along the snout ridge
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const p = V(0, 0.151 - 0.008 * t + (0.019 - 0.0125 * t) * 0.88, 0.122 + 0.05 * t);
    spot(p, V(0, 1, 0.2), 0.0032 - 0.0005 * i, C.CREST, head, 0.6);
  }
  // lower jaw (separate bone)
  seg(V(0, 0.137, 0.112), V(0, 0.131, 0.172), 0.0165, 0.0058, C.JAW, jaw, 6, 1, 0.75);

  for (const s of [1, -1]) {
    // orange upper lip
    ell(V(s * 0.0095, 0.139, 0.148), V(0.004, 0.0035, 0.028), C.ORANGE, head, 7, 5);
    // nostrils
    ball(V(s * 0.0055, 0.1465, 0.173), 0.0018, C.BLACK, head, 5);
    // lower-jaw lip spots
    for (let i = 0; i < 5; i++) {
      const f = 0.1 + i * 0.18;
      const z = 0.112 + 0.06 * f;
      const r = 0.0165 - 0.0107 * f;
      const cy = 0.137 - 0.006 * f;
      spot(V(s * r * 0.97, cy, z), V(s, -0.2, 0.15), 0.0036 - 0.0003 * i, i % 2 ? C.CREAM : C.ORANGE, jaw, 0.45);
    }
    // cream cheek stripe from mouth corner to neck
    const stripe = [
      [0.141, 0.122], [0.143, 0.111], [0.145, 0.1], [0.146, 0.089], [0.145, 0.078],
    ];
    stripe.forEach(([y, z]) => {
      const h = sideOf([cranium, E[3]], s, y, z);
      if (h) spot(h.p, h.n, 0.0042, C.CREAM, h.bone, 0.35);
    });
    // brow horn over each eye
    cone(V(s * 0.015, 0.167, 0.124), V(s * 0.6, 1, 0.25), 0.007, 0.0038, C.BODY_D, head, 5);
  }
  // gular crest under the jaw
  for (let i = 0; i < 7; i++) {
    const f = 0.1 + i * 0.13;
    const z = 0.112 + 0.06 * f;
    const r = 0.0165 - 0.0107 * f;
    const cy = 0.137 - 0.006 * f;
    cone(V(0, cy - r * 0.7 + 0.001, z), V(0, -1, 0.25), 0.0065 - 0.0004 * i, 0.002, C.WHITE, jaw, 4);
  }

  // ---------- casque (helmet crest) ----------
  const cq: [number, number][] = [
    [0.15, 0.16], [0.128, 0.178], [0.104, 0.203], [0.084, 0.226], [0.068, 0.224],
    [0.057, 0.204], [0.06, 0.176], [0.07, 0.158], [0.095, 0.148], [0.125, 0.146],
  ];
  {
    const shape = new THREE.Shape();
    shape.moveTo(cq[0][0], cq[0][1]);
    for (let i = 1; i < cq.length; i++) shape.lineTo(cq[i][0], cq[i][1]);
    shape.closePath();
    const depth = 0.016;
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 1,
      curveSegments: 1,
    });
    g.translate(0, 0, -depth / 2);
    g.rotateY(-Math.PI / 2); // shape x -> world z, extrusion -> world x
    part(g, C.BODY, V(0, 0, 0), head);
  }
  const topEdge = cq.slice(0, 6);
  // crest cones on the casque rim
  for (let i = 0; i < topEdge.length - 1; i++) {
    const [z0, y0] = topEdge[i];
    const [z1, y1] = topEdge[i + 1];
    const dz = z1 - z0, dy = y1 - y0;
    const L = Math.hypot(dz, dy);
    const n = V(0, -dz / L, dy / L);
    for (const t of [0.25, 0.75]) {
      const p = V(0, y0 + dy * t, z0 + dz * t).addScaledVector(n, 0.0015);
      cone(p, n, 0.0075, 0.0028, (i * 2 + (t > 0.5 ? 1 : 0)) % 2 ? C.ORANGE : C.RED, head, 5);
    }
  }
  // painted bands on both faces of the casque
  const centroid = [0.098, 0.183];
  const samples: [number, number][] = [];
  for (let i = 0; i < topEdge.length - 1; i++) {
    for (const t of [0, 0.5]) {
      samples.push([
        topEdge[i][0] + (topEdge[i + 1][0] - topEdge[i][0]) * t,
        topEdge[i][1] + (topEdge[i + 1][1] - topEdge[i][1]) * t,
      ]);
    }
  }
  samples.push(topEdge[topEdge.length - 1]);
  const rows: [number, string, number][] = [
    [0.2, C.ORANGE, 0.0045],
    [0.45, C.TEAL, 0.0042],
    [0.7, C.YELLOW, 0.0036],
  ];
  for (const s of [1, -1]) {
    rows.forEach(([k, color, r], ri) => {
      samples.forEach(([z, y], si) => {
        if (ri === 2 && si % 2) return;
        const q = [z + (centroid[0] - z) * k, y + (centroid[1] - y) * k];
        spot(V(s * 0.0112, q[1], q[0]), V(s, 0, 0), r, color, head, 0.35);
      });
    });
    spot(V(s * 0.0112, centroid[1] + 0.004, centroid[0] - 0.006), V(s, 0, 0), 0.0055, C.RED, head, 0.35);
  }

  // ---------- turret eyes (own joints so they can swivel) ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const c = V(s * 0.02, 0.158, 0.126);
    const ej = b.joint(`eye${S}`, { at: c, parent: head });
    const dir = V(s, 0.2, 0.5).normalize();
    const Rr = 0.0135;
    ball(c, Rr, C.EYE, ej, 10);
    const ringH = [0.0035, 0.0062, 0.0089, 0.0113];
    const ringC = [C.BODY_D, C.YELLOW, C.BODY_D, C.YELLOW];
    ringH.forEach((h, i) => {
      const rr = Math.sqrt(Rr * Rr - h * h) + 0.0002;
      const g = new THREE.TorusGeometry(rr, 0.0012, 4, 14);
      g.rotateX(Math.PI / 2);
      g.translate(0, h, 0);
      orient(g, dir);
      part(g, ringC[i], c, ej);
    });
    const pupil = c.clone().addScaledVector(dir, Rr - 0.0012);
    ball(pupil, 0.0038, C.BLACK, ej, 8);
    const hl = pupil.clone().addScaledVector(dir, 0.0025).add(V(s * 0.0004, 0.0016, 0.0008));
    ball(hl, 0.0012, C.WHITE, ej, 5);
  }

  // ---------- tail ----------
  const N = 10;
  const tp: THREE.Vector3[] = [V(0, 0.118, -0.085)];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const th = -0.12 - 1.9 * t * t * t;
    const L = 0.03 * (1 - 0.45 * t);
    tp.push(tp[i].clone().add(V(0, Math.sin(th) * L, -Math.cos(th) * L)));
  }
  const rt = (k: number) => 0.0035 + 0.0135 * Math.pow(1 - k / N, 1.1);
  const T: any[] = [];
  for (let k = 0; k <= N; k++) {
    const j = b.joint(`tail${k + 1}`, { at: tp[k], parent: k === 0 ? hips : T[k - 1] });
    role(j, "tail");
    T.push(j);
  }
  for (let k = 0; k < N; k++) {
    const p = tp[k], q = tp[k + 1];
    seg(p, q, rt(k), rt(k + 1), C.BODY, T[k], 7, 0.85, 1);
    ball(q, rt(k + 1), C.BODY, T[k + 1], 7, 0.85);
    const d = q.clone().sub(p);
    const len = d.length();
    const dn = d.clone().normalize();
    const mid = p.clone().add(q).multiplyScalar(0.5);
    const rm = (rt(k) + rt(k + 1)) / 2;
    // colour bands
    {
      const g = new THREE.CylinderGeometry(rm * 1.08, rm * 1.08, len * 0.34, 7, 1);
      g.scale(0.85, 1, 1);
      orient(g, d);
      part(g, k % 2 ? C.BODY_D : C.TEAL, mid, T[k]);
    }
    const up = V(0, -dn.z, dn.y).normalize(); // perpendicular, toward the back
    if (up.y < 0) up.multiplyScalar(-1);
    // crest on the first tail segments
    if (k < 5) {
      for (const t of [0.25, 0.75]) {
        const p0 = p.clone().lerp(q, t).addScaledVector(up, (rt(k) * (1 - t) + rt(k + 1) * t) * 0.92);
        cone(p0, up.clone().addScaledVector(dn, 0.4), 0.0065 - k * 0.0008, 0.0024, C.CREST, T[k], 5);
      }
    }
    // cream flank dots
    if (k % 2 === 0 && k < N - 1) {
      for (const s of [1, -1]) {
        const pt = p.clone().lerp(q, 0.75).add(V(s * rm * 0.82, 0, 0));
        spot(pt, V(s, 0.1, 0), Math.max(0.0022, rm * 0.35), C.CREAM, T[k], 0.4);
      }
    }
  }
  ball(tp[0], rt(0) * 1.02, C.BODY, T[0], 8, 0.85);

  // ---------- legs with mitten feet ----------
  const segDots = (p: THREE.Vector3, q: THREE.Vector3, r: number, bone: any, n: number) => {
    const d = q.clone().sub(p).normalize();
    const ref = Math.abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(ref, d).normalize();
    const w = new THREE.Vector3().crossVectors(d, u);
    for (let i = 0; i < n; i++) {
      const t = 0.2 + 0.6 * rand();
      const a = rand() * Math.PI * 2;
      const nrm = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      const pt = p.clone().lerp(q, t).addScaledVector(nrm, r);
      spot(pt, nrm, 0.0021, rand() < 0.5 ? C.CREAM : C.TEAL, bone, 0.5);
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const defs = [
      {
        names: ["shoulder", "elbow", "wrist"],
        parent: chest,
        role: "arm",
        digit: "finger",
        pts: [V(s * 0.024, 0.108, 0.045), V(s * 0.062, 0.09, 0.035), V(s * 0.068, 0.024, 0.058)],
        tips: [
          { off: V(-s * 0.01, -0.02, 0.018), claws: 3 },
          { off: V(s * 0.016, -0.02, -0.008), claws: 2 },
        ],
      },
      {
        names: ["hip", "knee", "ankle"],
        parent: hips,
        role: "leg",
        digit: "toe",
        pts: [V(s * 0.022, 0.104, -0.05), V(s * 0.06, 0.092, -0.035), V(s * 0.066, 0.024, -0.062)],
        tips: [
          { off: V(-s * 0.007, -0.02, -0.017), claws: 2 },
          { off: V(s * 0.016, -0.02, 0.01), claws: 3 },
        ],
      },
    ];
    for (const L of defs) {
      const [a, k, w] = L.pts;
      const ja = b.joint(`${L.names[0]}${S}`, { at: a, parent: L.parent });
      const jk = b.joint(`${L.names[1]}${S}`, { at: k, parent: ja });
      const jw = b.joint(`${L.names[2]}${S}`, { at: w, parent: jk });
      [ja, jk, jw].forEach((j) => role(j, L.role));

      ell(a, V(0.012, 0.013, 0.014), C.BODY, ja, 8, 6);
      seg(a, k, 0.0095, 0.0075, C.LEG, ja, 7);
      ball(k, 0.0085, C.LEG, jk, 7);
      seg(k, w, 0.0075, 0.0058, C.LEG, jk, 7);
      ball(w, 0.0068, C.LEG, jw, 7);
      segDots(a, k, 0.0085, ja, 3);
      segDots(k, w, 0.0067, jk, 3);
      // knee/elbow tubercle
      cone(k.clone().add(V(s * 0.004, 0.006, 0)), V(s * 0.4, 1, 0), 0.004, 0.0022, C.CREST, jk, 4);

      L.tips.forEach((tip, ti) => {
        const AB = ti === 0 ? "A" : "B";
        const end = w.clone().add(tip.off);
        const midP = w.clone().lerp(end, 0.5).add(V(0, 0.004, 0));
        const j1 = b.joint(`${L.digit}${AB}1${S}`, { at: w.clone().lerp(midP, 0.2), parent: jw });
        const j2 = b.joint(`${L.digit}${AB}2${S}`, { at: midP, parent: j1 });
        role(j1, "digit");
        role(j2, "digit");
        seg(w, midP, 0.0068, 0.0056, C.LEG, j1, 6);
        ball(midP, 0.0056, C.LEG, j2, 6);
        seg(midP, end, 0.0056, 0.0042, C.LEG, j2, 6);
        ball(end, 0.0042, C.LIGHT, j2, 6);
        // claws spread across the tip
        const dir = end.clone().sub(midP);
        dir.y = 0;
        dir.normalize();
        const across = new THREE.Vector3().crossVectors(dir, V(0, 1, 0)).normalize();
        const cdir = dir.clone().add(V(0, -0.35, 0)).normalize();
        for (let c = 0; c < tip.claws; c++) {
          const o = (c - (tip.claws - 1) / 2) * 0.0034;
          const base = end.clone().addScaledVector(across, o).addScaledVector(dir, 0.002);
          cone(base, cdir, 0.006, 0.0015, C.CLAW, j2, 4);
        }
      });
    }
  }

  return b.root;
}
