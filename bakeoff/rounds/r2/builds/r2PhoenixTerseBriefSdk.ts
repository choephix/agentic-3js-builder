import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description:
    "Stylized fire-bird in a rest pose with wings spread: faceted flame plumage, crest, long tail streamers, separate upper and lower beak, talons.",
};

const STOPS = ["#ffe27a", "#ffb52e", "#ff7a1c", "#e03a17", "#a81414"];
function pal(t: number): string {
  t = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(t));
  const c = new THREE.Color(STOPS[i]).lerp(new THREE.Color(STOPS[i + 1]), t - i);
  return "#" + c.getHexString();
}

function orient(geo: THREE.BufferGeometry, dir: number[], hint: number[]) {
  const y = new THREE.Vector3(...dir).normalize();
  const h = new THREE.Vector3(...hint);
  let z = h.clone().sub(y.clone().multiplyScalar(h.dot(y)));
  if (z.lengthSq() < 1e-6) z = new THREE.Vector3(0, 0, 1).sub(y.clone().multiplyScalar(y.z));
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return geo;
}

function leafGeo(len: number, w: number) {
  const s = new THREE.Shape();
  const pts = [
    [0, 0], [0.8, 0.2], [1, 0.5], [0.6, 0.85], [0, 1],
    [-0.6, 0.85], [-1, 0.5], [-0.8, 0.2],
  ];
  pts.forEach(([x, y], i) => {
    const px = x * w, py = y * len;
    if (i === 0) s.moveTo(px, py);
    else s.lineTo(px, py);
  });
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(7);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.68, -0.1] });
  const chest = b.joint("chest", { at: [0, 0.84, 0.22], parent: hips });
  const neck1 = b.joint("neck1", { at: [0, 0.97, 0.36], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 1.14, 0.47], parent: neck1 });
  const head = b.joint("head", { at: [0, 1.27, 0.52], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 1.265, 0.58], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.7, -0.45], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.64, -0.85], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.55, -1.2], parent: tail2 });

  const side: Record<string, any> = {};
  for (const [nm, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const shoulder = b.joint("shoulder" + nm, { at: [s * 0.22, 0.97, 0.12], parent: chest });
    const elbow = b.joint("elbow" + nm, { at: [s * 0.75, 1.08, -0.02], parent: shoulder });
    const wrist = b.joint("wrist" + nm, { at: [s * 1.15, 1.04, -0.12], parent: elbow });
    const hip = b.joint("hip" + nm, { at: [s * 0.15, 0.6, 0.0], parent: hips });
    const knee = b.joint("knee" + nm, { at: [s * 0.17, 0.4, 0.13], parent: hip });
    const ankle = b.joint("ankle" + nm, { at: [s * 0.16, 0.2, 0.0], parent: knee });
    const foot = b.joint("foot" + nm, { at: [s * 0.16, 0.06, 0.05], parent: ankle });
    side[nm] = { s, shoulder, elbow, wrist, hip, knee, ankle, foot };
  }

  // ---------- helpers ----------
  const V = (a: number[]) => new THREE.Vector3(...a);
  const feather = (pos: number[], dir: number[], len: number, w: number, color: string, bone: any, hint: number[] = [0, 1, 0]) => {
    b.part(orient(leafGeo(len, w), dir, hint), color, { at: pos, bone });
  };
  const blob = (pos: number[], r: number[], color: string, bone: any, seg = 8) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2));
    g.scale(r[0], r[1], r[2]);
    b.part(g, color, { at: pos, bone });
  };
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const d = V(c).sub(V(a));
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides);
    orient(g, d.toArray(), [0, 0, 1]);
    const m = V(a).add(V(c)).multiplyScalar(0.5);
    b.part(g, color, { at: m.toArray(), bone });
  };
  const cone = (pos: number[], dir: number[], len: number, r: number, color: string, bone: any, sx = 1, sz = 1, sides = 5) => {
    const g = new THREE.ConeGeometry(r, len, sides);
    g.translate(0, len / 2, 0);
    g.scale(sx, 1, sz);
    orient(g, dir, [0, 1, 0]);
    b.part(g, color, { at: pos, bone });
  };

  // ---------- body ----------
  blob([0, 0.78, 0.0], [0.27, 0.28, 0.5], "#d8331a", hips, 10);
  blob([0, 0.86, 0.26], [0.25, 0.27, 0.27], "#e8541c", chest, 10);
  blob([0, 0.7, 0.28], [0.2, 0.18, 0.24], "#ffc13a", chest, 8); // golden breast
  seg([0, 0.95, 0.33], [0, 1.15, 0.47], 0.11, 0.08, "#e8541c", neck1);
  seg([0, 1.15, 0.47], [0, 1.27, 0.52], 0.08, 0.075, "#ff8a1f", neck2);
  blob([0, 1.31, 0.55], [0.115, 0.115, 0.125], "#ff7a1c", head, 9);
  blob([0, 1.26, 0.61], [0.075, 0.06, 0.07], "#ffb52e", head, 6); // cheek/face

  // body plumage
  for (let row = 0; row < 9; row++) {
    const dz = -0.38 + row * 0.1;
    const k = Math.sqrt(Math.max(0.05, 1 - (dz / 0.5) ** 2));
    const n = 13;
    for (let i = 0; i < n; i++) {
      const th = (-150 + (300 * (i + (row % 2) * 0.5)) / (n - 1)) * (Math.PI / 180);
      const p = [0.27 * k * Math.sin(th), 0.78 + 0.28 * k * Math.cos(th), dz];
      const nn = new THREE.Vector3(Math.sin(th), Math.cos(th), (dz / 0.5) * 0.6).normalize();
      const dir = nn.clone().multiplyScalar(0.45).add(new THREE.Vector3(0, -0.1, -1)).normalize();
      const base = V(p).sub(nn.clone().multiplyScalar(0.025));
      const ymix = (Math.cos(th) + 1) / 2;
      const t = 0.15 + ymix * 0.55 + (row / 9) * 0.25 + (rand() - 0.5) * 0.15;
      feather(base.toArray(), dir.toArray(), 0.2 + rand() * 0.05, 0.065, pal(t), dz < 0.1 ? hips : chest, nn.toArray());
    }
  }
  // neck ruff
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const y = 1.0 + r * 0.1, z = 0.36 + r * 0.08;
      const n = new THREE.Vector3(Math.sin(a), Math.cos(a) * 0.3, 0.2).normalize();
      feather([n.x * 0.09, y + n.y * 0.09, z], n.clone().add(new THREE.Vector3(0, -0.2, -0.9)).normalize().toArray(), 0.16, 0.05, pal(0.2 + r * 0.2 + rand() * 0.1), neck1, n.toArray());
    }

  // ---------- head details ----------
  const beakCol = "#f2a516";
  cone([0, 1.305, 0.63], [0, -0.14, 1], 0.2, 0.055, beakCol, head, 0.85, 0.7, 4);
  cone([0, 1.268, 0.62], [0, -0.05, 1], 0.14, 0.04, "#d98a10", jaw, 0.85, 0.6, 4);
  for (const s of [1, -1]) {
    blob([s * 0.095, 1.34, 0.575], [0.04, 0.04, 0.04], "#ffd23a", head, 6);
    blob([s * 0.105, 1.34, 0.59], [0.025, 0.028, 0.028], "#150a08", head, 6);
    blob([s * 0.112, 1.348, 0.6], [0.008, 0.008, 0.008], "#ffffff", head, 4);
  }
  // crest
  const crest = [
    { d: [0, 0.8, -0.55], l: 0.42, x: 0 },
    { d: [0.18, 0.75, -0.5], l: 0.36, x: 0.03 },
    { d: [-0.18, 0.75, -0.5], l: 0.36, x: -0.03 },
    { d: [0.35, 0.6, -0.55], l: 0.3, x: 0.05 },
    { d: [-0.35, 0.6, -0.55], l: 0.3, x: -0.05 },
  ];
  crest.forEach((c, i) =>
    feather([c.x, 1.4, 0.52 - i * 0.01], c.d, c.l, 0.045, pal(i === 0 ? 0 : 0.2 + i * 0.07), head, [1, 0, 0])
  );
  // cheek streamers
  for (const s of [1, -1]) {
    feather([s * 0.1, 1.3, 0.47], [s * 0.4, 0.1, -0.9], 0.3, 0.05, "#ffb52e", head, [0, 1, 0]);
    feather([s * 0.1, 1.28, 0.47], [s * 0.5, -0.1, -0.85], 0.26, 0.045, "#ff7a1c", head, [0, 1, 0]);
  }

  // ---------- wings ----------
  for (const nm of ["L", "R"]) {
    const S = side[nm];
    const s = S.s as number;
    const sh = [s * 0.22, 0.97, 0.12], el = [s * 0.75, 1.08, -0.02], wr = [s * 1.15, 1.04, -0.12], ht = [s * 1.5, 1.0, -0.2];
    seg(sh, el, 0.085, 0.065, "#d8331a", S.shoulder);
    seg(el, wr, 0.065, 0.05, "#e8541c", S.elbow);
    seg(wr, ht, 0.05, 0.03, "#ff7a1c", S.wrist);
    blob(sh, [0.1, 0.1, 0.1], "#d8331a", S.shoulder, 6);
    // tertials/secondaries (trailing edge)
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const p = V(sh).lerp(V(el), t).toArray();
      feather(p, [s * 0.1, -0.05, -1], 0.5 - t * 0.02, 0.085, pal(0.55 + 0.1 * t + rand() * 0.1), S.shoulder);
    }
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const p = V(el).lerp(V(wr), t).toArray();
      feather(p, [s * (0.1 + 0.15 * t), -0.04, -1], 0.62, 0.085, pal(0.35 + 0.35 * (1 - t) + rand() * 0.08), S.elbow);
    }
    // primaries (fan)
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const p = V(wr).lerp(V(ht), t).toArray();
      const dir = [s * 1, -0.02 - t * 0.04, -0.1 - (1 - t) * 0.5];
      feather(p, dir, 0.95 - (1 - t) * 0.25 + (t > 0.8 ? -0.1 : 0), 0.075, pal(t < 0.5 ? 0.0 + t * 0.7 : 0.35 - (t - 0.5) * 0.4 + 0.1), S.wrist);
    }
    // coverts: 3 rows
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const a = V(sh).lerp(V(wr), t);
        const p = [a.x, a.y + 0.03 + row * 0.012, a.z - 0.03 - row * 0.08];
        feather(p, [s * 0.15, 0.02, -1], 0.3 - row * 0.05, 0.065, pal(0.7 - row * 0.2 + rand() * 0.1 - (t > 0.6 ? 0.15 : 0)), t < 0.5 ? S.shoulder : S.elbow);
      }
  }

  // ---------- legs ----------
  for (const nm of ["L", "R"]) {
    const S = side[nm];
    const s = S.s as number;
    blob([s * 0.15, 0.55, 0.05], [0.12, 0.17, 0.15], "#d8331a", S.hip, 7);
    for (let i = 0; i < 4; i++)
      feather([s * 0.2, 0.62 - i * 0.05, 0.1], [s * 0.1, -1, -0.3], 0.2, 0.05, pal(0.5 + i * 0.1), S.hip, [1, 0, 0]);
    seg([s * 0.16, 0.45, 0.1], [s * 0.16, 0.2, 0.0], 0.05, 0.035, "#f2a516", S.knee);
    seg([s * 0.16, 0.2, 0.0], [s * 0.16, 0.06, 0.05], 0.035, 0.03, "#f2a516", S.ankle);
    blob([s * 0.16, 0.21, 0.0], [0.045, 0.045, 0.045], "#d98a10", S.ankle, 6);
    const toes = [-0.4, 0, 0.4];
    for (const a of toes) {
      const e = [s * 0.16 + Math.sin(a) * 0.2, 0.015, 0.05 + Math.cos(a) * 0.2];
      seg([s * 0.16, 0.06, 0.05], e, 0.028, 0.02, "#f2a516", S.foot, 5);
      cone(e, [Math.sin(a) * 0.6, -0.35, Math.cos(a)], 0.07, 0.022, "#3a2418", S.foot);
    }
    const eb = [s * 0.16, 0.015, -0.06];
    seg([s * 0.16, 0.06, 0.05], eb, 0.026, 0.018, "#f2a516", S.foot, 5);
    cone(eb, [0, -0.3, -1], 0.06, 0.02, "#3a2418", S.foot);
  }

  // ---------- tail ----------
  blob([0, 0.72, -0.4], [0.14, 0.12, 0.2], "#c42a16", tail1, 7);
  const n = 11;
  for (let i = 0; i < n; i++) {
    const k = i - (n - 1) / 2;
    const a = k * 0.095;
    const c = 1 - Math.abs(k) / 5.5;
    const len = 1.0 + c * 0.95;
    const dir = [Math.sin(a), -0.17 - c * 0.12, -Math.cos(a)];
    const base = [Math.sin(a) * 0.05, 0.72 - Math.abs(k) * 0.005 + (i % 2) * 0.02, -0.45];
    const col = pal(0.75 - c * 0.55 + (i % 2) * 0.1);
    feather(base, dir, len, 0.1 - Math.abs(k) * 0.005, col, tail1, [0, 1, 0]);
    // golden eyespot near tip
    const d = V(dir).normalize();
    const tip = V(base).add(d.clone().multiplyScalar(len * 0.78));
    const g = new THREE.SphereGeometry(1, 6, 4);
    g.scale(0.055, 0.075, 0.012);
    orient(g, dir, [0, 1, 0]);
    b.part(g, "#ffe27a", { at: tip.toArray(), bone: tail3 });
  }
  // short lower tail coverts
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.14;
    feather([Math.sin(a) * 0.05, 0.68, -0.4], [Math.sin(a), -0.15, -Math.cos(a)], 0.55, 0.08, pal(0.2 + (i % 2) * 0.15), tail2, [0, 1, 0]);
  }

  return b.root;
}
