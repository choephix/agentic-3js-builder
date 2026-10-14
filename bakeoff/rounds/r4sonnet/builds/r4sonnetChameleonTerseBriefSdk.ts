import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V3 = [number, number, number];
type PO = { dir?: V3; roll?: number; scale?: number | V3 };

export const meta = {
  name: "Veiled Chameleon",
  description:
    "A stylised veiled chameleon standing on four splayed legs: a faceted, hand-painted torso with teal/yellow/orange bars, a tall banded casque, independent turret eyes, a separate upper and lower jaw, zygodactyl toes, a dorsal crest and a coiled prehensile tail. The whole rig is named for animation (spine, neck, head, jaw, eyes, legs, digits, tail1-16).",
};

// ---------------------------------------------------------------- palette
const C = {
  green: "#6dba45",
  greenDk: "#3e8b37",
  greenDeep: "#2c6a34",
  lime: "#a9dc55",
  teal: "#28a99b",
  tealDk: "#1d7f87",
  yellow: "#f2db4c",
  orange: "#f2922f",
  rust: "#cf5a2a",
  cream: "#f2e9b4",
  belly: "#e8e3a2",
  sky: "#69cdea",
  ink: "#16231c",
  gold: "#f6b92f",
  pink: "#e8707f",
  pinkLt: "#f08c98",
  claw: "#f0e4c4",
  white: "#fff8e0",
};

// ---------------------------------------------------------------- helpers
const UP = new THREE.Vector3(0, 1, 0);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (p: THREE.Vector3): V3 => [p.x, p.y, p.z];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// deterministic hash in [0,1)
function hash(a: number, b = 0, c = 0): number {
  let h = Math.imul(a + 1013, 374761393) ^ Math.imul(b + 7919, 668265263) ^ Math.imul(c + 104729, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// cubic Hermite through table rows [z, v1, v2, ...]
function spline(tab: number[][], z: number): number[] {
  const n = tab.length;
  let i = 0;
  while (i < n - 2 && z > tab[i + 1][0]) i++;
  const p0 = tab[Math.max(i - 1, 0)];
  const p1 = tab[i];
  const p2 = tab[i + 1];
  const p3 = tab[Math.min(i + 2, n - 1)];
  const h = p2[0] - p1[0];
  const t = Math.min(1, Math.max(0, (z - p1[0]) / h));
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  const out: number[] = [];
  for (let c = 1; c < p1.length; c++) {
    const m1 = ((p2[c] - p0[c]) / (p2[0] - p0[0])) * h;
    const m2 = ((p3[c] - p1[c]) / (p3[0] - p1[0])) * h;
    out.push(h00 * p1[c] + h10 * m1 + h01 * p2[c] + h11 * m2);
  }
  return out;
}

// flat-shaded (faceted) copy with recomputed normals
function facet(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const f = g.index ? g.toNonIndexed() : g;
  f.computeVertexNormals();
  return f;
}

// ring of S vertices around the z axis. Table rows: [z, top, bottom, halfWidth].
// centre = where the ring's "equator" sits; the half on the other side collapses flat
// (used for the mouth plane of the upper and lower jaw).
const ringMaker =
  (tab: number[][], S: number, centre: "mid" | "top" | "bot", narrow: number) =>
  (z: number): THREE.Vector3[] => {
    const [top, bot, w] = spline(tab, z);
    const mid = centre === "top" ? top : centre === "bot" ? bot : (top + bot) / 2;
    const up = top - mid;
    const dn = mid - bot;
    const out: THREE.Vector3[] = [];
    for (let k = 0; k < S; k++) {
      const th = (k / S) * Math.PI * 2;
      const s = Math.sin(th);
      const c = Math.cos(th);
      out.push(v3(w * s * (1 - narrow * Math.max(c, 0)), mid + (c >= 0 ? up * c : dn * c), z));
    }
    return out;
  };

// ================================================================== model
export default function build(): THREE.Object3D {
  const b: any = createBuilder({ name: "chameleon" });
  const J: Record<string, any> = {};

  const joint = (name: string, at: V3, parent?: string, role?: string) => {
    let j: any;
    if (!parent) {
      j = b.joint(name, { at });
    } else {
      try {
        j = b.joint(name, { at, parent: J[parent] });
      } catch {
        j = b.joint(name, { at, parent });
      }
    }
    if (role && j && j.userData) j.userData.role = role;
    J[name] = j;
    return j;
  };

  const part = (g: THREE.BufferGeometry, color: string, bone: string, at: V3 = [0, 0, 0]) =>
    b.part(g, color, { at, bone: J[bone] });

  // geometry is scaled/rotated about its own origin, then seated at `at` on `bone`
  const put = (g: THREE.BufferGeometry, color: string, bone: string, at: V3, o: PO = {}) => {
    const q = new THREE.Quaternion();
    if (o.dir) q.setFromUnitVectors(UP, new THREE.Vector3(o.dir[0], o.dir[1], o.dir[2]).normalize());
    if (o.roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, o.roll));
    const sc =
      o.scale === undefined ? [1, 1, 1] : typeof o.scale === "number" ? [o.scale, o.scale, o.scale] : o.scale;
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(), q, new THREE.Vector3(sc[0], sc[1], sc[2])));
    return part(facet(g), color, bone, at);
  };

  const blob = (bone: string, color: string, at: V3, size: number | V3, o: PO & { d?: number } = {}) =>
    put(new THREE.IcosahedronGeometry(1, o.d ?? 1), color, bone, at, { dir: o.dir, roll: o.roll, scale: size });

  const box = (bone: string, color: string, at: V3, size: V3, o: PO = {}) =>
    put(new THREE.BoxGeometry(1, 1, 1), color, bone, at, { ...o, scale: size });

  const spike = (bone: string, color: string, at: V3, dir: V3, r: number, h: number, n = 5) => {
    const g = new THREE.ConeGeometry(r, h, n, 1);
    g.translate(0, h / 2, 0);
    return put(g, color, bone, at, { dir });
  };

  const seg = (bone: string, color: string, a: V3, c: V3, ra: number, rb: number, n = 7) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    if (len < 1e-6) return null;
    const g = new THREE.CylinderGeometry(rb, ra, len, n, 1);
    g.translate(0, len / 2, 0);
    return put(g, color, bone, a, { dir: arr(d) });
  };

  const disc = (bone: string, color: string, at: V3, dir: V3, r: number, h: number, n = 12) =>
    put(new THREE.CylinderGeometry(r, r, h, n, 1), color, bone, at, { dir });

  // lofted, facet-painted skin: one part per (bone, colour)
  const loft = (o: {
    zs: number[];
    S: number;
    ring: (z: number) => THREE.Vector3[];
    bone: (zc: number) => string;
    color: (i: number, k: number) => string;
    capA: string;
    capB: string;
  }) => {
    const { zs, S } = o;
    const rings = zs.map((z) => o.ring(z));
    const groups = new Map<string, { bone: string; color: string; pos: number[] }>();
    const push = (bone: string, color: string, pts: THREE.Vector3[]) => {
      const key = bone + "|" + color;
      let g = groups.get(key);
      if (!g) {
        g = { bone, color, pos: [] };
        groups.set(key, g);
      }
      for (const p of pts) g.pos.push(p.x, p.y, p.z);
    };
    for (let i = 0; i < zs.length - 1; i++) {
      const zc = (zs[i] + zs[i + 1]) / 2;
      const bone = o.bone(zc);
      const r0 = rings[i];
      const r1 = rings[i + 1];
      for (let k = 0; k < S; k++) {
        const k2 = (k + 1) % S;
        push(bone, o.color(i, k), [r0[k], r1[k], r1[k2], r0[k], r1[k2], r0[k2]]);
      }
    }
    const centre = (r: THREE.Vector3[]) => {
      const c = new THREE.Vector3();
      r.forEach((p) => c.add(p));
      return c.multiplyScalar(1 / r.length);
    };
    const rA = rings[0];
    const rB = rings[rings.length - 1];
    const cA = centre(rA);
    const cB = centre(rB);
    for (let k = 0; k < S; k++) {
      const k2 = (k + 1) % S;
      push(o.bone(zs[0] + 1e-4), o.capA, [cA, rA[k], rA[k2]]);
      push(o.bone(zs[zs.length - 1] - 1e-4), o.capB, [cB, rB[k2], rB[k]]);
    }
    groups.forEach((g) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(g.pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((g.pos.length / 3) * 2).fill(0), 2));
      geo.computeVertexNormals();
      part(geo, g.color, g.bone);
    });
    return rings;
  };

  // small flattened bumps seated on loft facets
  const tubercles = (
    rings: THREE.Vector3[][],
    zs: number[],
    S: number,
    boneOf: (zc: number) => string,
    i0: number,
    i1: number,
    rows: number[],
    prob: number,
    seed: number,
    colorOf: (m: number, h: number) => string,
    size: number,
  ) => {
    for (let i = i0; i < i1; i++) {
      for (let k = 0; k < S; k++) {
        const m = Math.min(k, S - 1 - k);
        if (!rows.includes(m)) continue;
        const h = hash(i, k, seed);
        if (h > prob) continue;
        const r0 = rings[i];
        const r1 = rings[i + 1];
        const k2 = (k + 1) % S;
        const p00 = r0[k];
        const p01 = r0[k2];
        const p10 = r1[k];
        const p11 = r1[k2];
        const c = p00.clone().add(p01).add(p10).add(p11).multiplyScalar(0.25);
        const n = p10.clone().sub(p00).cross(p01.clone().sub(p00));
        if (n.lengthSq() < 1e-12) continue;
        n.normalize();
        const sz = size * (0.8 + 0.7 * hash(i, k, seed + 1));
        blob(boneOf((zs[i] + zs[i + 1]) / 2), colorOf(m, hash(i, k, seed + 2)), arr(c.clone().addScaledVector(n, 0.0004)), [sz, sz * 0.5, sz], {
          dir: arr(n),
          d: 0,
        });
      }
    }
  };

  // ============================================================ skeleton
  joint("hips", [0, 0.119, -0.1], undefined, "spine");
  joint("spine1", [0, 0.122, -0.02], "hips", "spine");
  joint("spine2", [0, 0.125, 0.06], "spine1", "spine");
  joint("neck", [0, 0.14, 0.13], "spine2", "neck");
  joint("head", [0, 0.158, 0.152], "neck", "head");
  joint("jaw", [0, 0.147, 0.172], "head", "jaw");

  // ============================================================ torso
  const torsoTab = [
    [-0.14, 0.139, 0.099, 0.019],
    [-0.11, 0.166, 0.07, 0.031],
    [-0.07, 0.181, 0.056, 0.038],
    [-0.02, 0.187, 0.053, 0.041],
    [0.03, 0.186, 0.055, 0.041],
    [0.075, 0.184, 0.063, 0.037],
    [0.115, 0.186, 0.085, 0.031],
    [0.16, 0.192, 0.122, 0.024],
  ];
  const zsT = Array.from({ length: 31 }, (_, i) => Math.round((-0.14 + i * 0.01) * 1000) / 1000);
  const torsoBone = (zc: number) => (zc < -0.06 ? "hips" : zc < 0.02 ? "spine1" : zc < 0.1 ? "spine2" : "neck");

  const topBars = [C.teal, C.yellow, C.teal, C.yellow, C.teal, C.yellow];
  const lowBars = [C.orange, C.lime, C.orange, C.lime, C.orange, C.lime];
  const torsoColor = (i: number, k: number) => {
    const m = Math.min(k, 15 - k);
    const j = Math.floor(i / 5);
    const inBar = i % 5 < 2;
    if (m === 0) return C.greenDeep;
    if (m <= 2) {
      if (inBar) return topBars[j];
      return hash(i, m, 11) < 0.09 ? C.sky : C.green;
    }
    if (m === 3) return inBar ? C.cream : C.green;
    if (m <= 5) {
      if (inBar) return lowBars[j];
      return hash(i, m, 5) < 0.07 ? C.yellow : C.lime;
    }
    return C.belly;
  };

  const R = loft({
    zs: zsT,
    S: 16,
    ring: ringMaker(torsoTab, 16, "mid", 0.22),
    bone: torsoBone,
    color: torsoColor,
    capA: C.green,
    capB: C.green,
  });

  // dorsal crest
  for (let i = 2; i <= 22; i += 2) {
    const z = zsT[i];
    if (z > 0.095) break;
    const bell = Math.exp(-Math.pow(z / 0.11, 2));
    spike(torsoBone(z), (i / 2) % 2 === 0 ? C.yellow : C.orange, [0, R[i][0].y - 0.001, z], [0, 1, -0.5], 0.0042, 0.007 + 0.009 * bell, 4);
  }
  // belly ridge + throat studs
  for (let i = 3; i <= 20; i += 3) {
    const p = R[i][8];
    spike(torsoBone(zsT[i]), C.cream, [0, p.y + 0.001, p.z], [0, -1, 0.2], 0.0028, 0.0055, 4);
  }
  for (let i = 22; i <= 29; i++) {
    const p = R[i][8];
    spike(torsoBone(zsT[i]), C.cream, [0, p.y + 0.001, p.z], [0, -1, 0.3], 0.003, 0.0072, 4);
  }
  // scale tubercles on the flanks
  tubercles(
    R,
    zsT,
    16,
    torsoBone,
    1,
    29,
    [1, 2, 4, 5],
    0.2,
    31,
    (m, h) => (m <= 2 ? (h < 0.4 ? C.lime : h < 0.75 ? C.yellow : C.teal) : h < 0.5 ? C.yellow : h < 0.8 ? C.cream : C.rust),
    0.0036,
  );

  // limb-root roundels on the flank (teal / yellow / orange target)
  const roundel = (s: number, z: number, y: number, f: number) => {
    const x = s * (spline(torsoTab, z)[2] - 0.001);
    const bone = torsoBone(z);
    const dir: V3 = [s, 0, 0];
    disc(bone, C.tealDk, [x + s * 0.0005, y, z], dir, 0.026 * f, 0.004);
    disc(bone, C.yellow, [x + s * 0.001, y, z], dir, 0.0205 * f, 0.0055);
    disc(bone, C.orange, [x + s * 0.0015, y, z], dir, 0.0155 * f, 0.007);
  };
  for (const s of [1, -1]) {
    roundel(s, 0.064, 0.121, 1);
    roundel(s, -0.098, 0.112, 1.18);
  }

  // ============================================================ head
  const headTab = [
    [0.135, 0.19, 0.147, 0.029],
    [0.165, 0.198, 0.147, 0.036],
    [0.2, 0.19, 0.147, 0.034],
    [0.235, 0.173, 0.147, 0.022],
    [0.268, 0.16, 0.147, 0.009],
  ];
  const zsH = Array.from({ length: 15 }, (_, i) => 0.135 + (i * (0.268 - 0.135)) / 14);
  const headColor = (i: number, k: number) => {
    const m = Math.min(k, 11 - k);
    if (m === 0) return C.greenDeep;
    if (m === 1) return i >= 12 ? C.lime : hash(i, k, 21) < 0.22 ? C.teal : C.green;
    if (m === 2) return hash(i, k, 22) < 0.25 ? C.yellow : C.lime;
    if (m === 3) return C.cream;
    if (m === 4) return C.lime;
    return C.pinkLt;
  };
  const H = loft({
    zs: zsH,
    S: 12,
    ring: ringMaker(headTab, 12, "bot", 0.2),
    bone: () => "head",
    color: headColor,
    capA: C.green,
    capB: C.lime,
  });

  const jawTab = [
    [0.156, 0.147, 0.121, 0.024],
    [0.185, 0.147, 0.122, 0.027],
    [0.215, 0.147, 0.13, 0.022],
    [0.24, 0.147, 0.137, 0.015],
    [0.262, 0.147, 0.142, 0.0085],
  ];
  const zsJ = Array.from({ length: 12 }, (_, i) => 0.156 + (i * (0.262 - 0.156)) / 11);
  const jawColor = (_i: number, k: number) => {
    const m = Math.min(k, 11 - k);
    if (m <= 2) return C.pink;
    if (m === 3) return C.lime;
    if (m === 4) return C.green;
    return C.belly;
  };
  const Jr = loft({
    zs: zsJ,
    S: 12,
    ring: ringMaker(jawTab, 12, "top", 0),
    bone: () => "jaw",
    color: jawColor,
    capA: C.green,
    capB: C.lime,
  });

  // lips / teeth, nostrils, canthal ridges, head bumps
  for (const s of [1, -1]) {
    const kk = s > 0 ? 3 : 9;
    for (let i = 1; i < 14; i++) {
      const p = H[i][kk];
      box("head", C.cream, [p.x - s * 0.0012, 0.1492, p.z], [0.0034, 0.003, 0.0072]);
    }
    for (let i = 1; i < 11; i++) {
      const p = Jr[i][kk];
      box("jaw", C.white, [p.x - s * 0.0012, 0.1455, p.z + 0.0048], [0.003, 0.0028, 0.0058]);
    }
    const ke = s > 0 ? 2 : 10;
    for (let i = 7; i < 13; i++) {
      const a = arr(H[i][ke]);
      const c2 = arr(H[i + 1][ke]);
      seg("head", C.lime, a, c2, 0.0034, 0.003, 5);
      blob("head", C.lime, a, 0.0034, { d: 0 });
    }
    const np = H[12][ke];
    blob("head", C.ink, [np.x * 1.0, np.y + 0.0006, np.z], [0.0024, 0.0016, 0.0024], { d: 0, dir: [s, 0.6, 0.2] });
  }
  tubercles(H, zsH, 12, () => "head", 1, 12, [1, 2], 0.16, 77, (_m, h) => (h < 0.5 ? C.yellow : C.teal), 0.0033);

  // tongue lying in the lower jaw
  blob("jaw", C.pink, [0, 0.1465, 0.2], [0.008, 0.0035, 0.03]);
  blob("jaw", C.pinkLt, [0, 0.1468, 0.232], [0.0075, 0.0045, 0.0085]);

  // throat studs along the jaw
  for (let i = 2; i <= 10; i++) {
    const p = Jr[i][6];
    spike("jaw", C.cream, [0, p.y + 0.001, p.z], [0, -1, 0.35], 0.0026, 0.0062, 4);
  }

  // casque: layered fin helmet
  {
    const outline: [number, number][] = [
      [0.226, 0.178],
      [0.206, 0.2],
      [0.182, 0.221],
      [0.156, 0.238],
      [0.13, 0.247],
      [0.108, 0.244],
      [0.098, 0.232],
      [0.112, 0.214],
      [0.13, 0.198],
      [0.142, 0.182],
      [0.142, 0.17],
      [0.226, 0.17],
    ];
    const cen: [number, number] = [0.158, 0.213];
    const layer = (scale: number, depth: number, color: string) => {
      const sh = new THREE.Shape();
      outline.forEach(([z, y], idx) => {
        const zz = cen[0] + (z - cen[0]) * scale;
        const yy = cen[1] + (y - cen[1]) * scale;
        if (idx === 0) sh.moveTo(zz, yy);
        else sh.lineTo(zz, yy);
      });
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.0018,
        bevelSize: 0.0018,
        bevelSegments: 1,
        curveSegments: 1,
        steps: 1,
      });
      g.translate(0, 0, -depth / 2);
      g.rotateY(-Math.PI / 2);
      part(g, color, "head");
    };
    layer(1, 0.014, C.teal);
    layer(0.82, 0.0175, C.lime);
    layer(0.62, 0.021, C.yellow);
    layer(0.4, 0.0245, C.orange);
    // little crest along the casque's front edge
    const edge: [number, number][] = [
      [0.212, 0.195],
      [0.19, 0.213],
      [0.168, 0.23],
      [0.146, 0.243],
      [0.124, 0.2475],
      [0.105, 0.241],
    ];
    edge.forEach(([z, y], idx) => {
      spike("head", idx % 2 ? C.orange : C.yellow, [0, y - 0.001, z], [0, 1, 0.5], 0.0032, 0.0085, 4);
    });
  }

  // ============================================================ eyes
  const eye = (s: 1 | -1) => {
    const sd = s > 0 ? "L" : "R";
    const name = "eye" + sd;
    const E: V3 = [s * 0.03, 0.178, 0.198];
    joint(name, E, "head", "hinge");
    const D = new THREE.Vector3(s * 0.9, 0.1, 0.42).normalize();
    const Ra = 0.021;
    // socket mound blends the turret into the skull
    blob("head", C.green, [s * 0.026, 0.172, 0.196], [0.017, 0.022, 0.026]);
    put(new THREE.IcosahedronGeometry(1, 2), C.green, name, E, { scale: Ra });
    const layers: [number, number, string][] = [
      [1.03, 0.92, C.tealDk],
      [1.06, 0.72, C.lime],
      [1.09, 0.52, C.gold],
      [1.12, 0.23, C.ink],
    ];
    for (const [k, th, col] of layers) {
      put(new THREE.SphereGeometry(Ra * k, 16, 4, 0, Math.PI * 2, 0, th), col, name, E, { dir: arr(D) });
    }
    // glint
    const u = new THREE.Vector3().crossVectors(D, UP).normalize();
    const w = new THREE.Vector3().crossVectors(D, u).normalize();
    const hl = D.clone().applyAxisAngle(u, 0.12);
    blob(name, C.white, [E[0] + hl.x * Ra * 1.125, E[1] + hl.y * Ra * 1.125, E[2] + hl.z * Ra * 1.125], 0.0017);
    // ring of lid beads
    for (let j = 0; j < 12; j++) {
      const ph = (j / 12) * Math.PI * 2;
      const th = 0.98;
      const vdir = D.clone()
        .multiplyScalar(Math.cos(th))
        .add(u.clone().multiplyScalar(Math.cos(ph) * Math.sin(th)))
        .add(w.clone().multiplyScalar(Math.sin(ph) * Math.sin(th)));
      blob(
        name,
        j % 2 ? C.yellow : C.orange,
        [E[0] + vdir.x * Ra * 1.0, E[1] + vdir.y * Ra * 1.0, E[2] + vdir.z * Ra * 1.0],
        [0.0027, 0.0016, 0.0027],
        { dir: arr(vdir), d: 0 },
      );
    }
  };
  eye(1);
  eye(-1);

  // ============================================================ legs
  const digit = (name: string, parent: string, base: V3, ang: number, len: number, r: number) => {
    const d: V3 = [Math.sin(ang), 0, Math.cos(ang)];
    const l1 = 0.019 * len;
    const l2 = 0.015 * len;
    const mid: V3 = [base[0] + d[0] * l1, base[1], base[2] + d[2] * l1];
    const tip: V3 = [mid[0] + d[0] * l2, base[1], mid[2] + d[2] * l2];
    joint(name + "a", base, parent, "digit");
    joint(name + "b", mid, name + "a", "digit");
    seg(name + "a", C.green, base, mid, r, r * 0.88, 6);
    blob(name + "a", C.green, mid, r * 0.98, { d: 0 });
    seg(name + "b", C.lime, mid, tip, r * 0.88, r * 0.7, 6);
    spike(name + "b", C.claw, tip, [d[0], -0.55, d[2]], r * 0.62, 0.0085, 4);
  };

  const buildLeg = (s: 1 | -1, front: boolean) => {
    const sd = s > 0 ? "L" : "R";
    const m = (p: V3): V3 => [p[0] * s, p[1], p[2]];
    const [n0, n1, n2] = (front ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"]).map((n) => n + sd);
    const P: V3[] = front
      ? [
          [0.034, 0.118, 0.066],
          [0.088, 0.088, 0.04],
          [0.096, 0.03, 0.082],
        ]
      : [
          [0.034, 0.11, -0.098],
          [0.09, 0.09, -0.06],
          [0.098, 0.032, -0.1],
        ];
    const palm: V3 = front ? [0.098, 0.0095, 0.09] : [0.1, 0.0095, -0.092];
    joint(n0, m(P[0]), front ? "spine2" : "hips", "leg");
    joint(n1, m(P[1]), n0, "leg");
    joint(n2, m(P[2]), n1, "leg");

    const rU = front ? [0.0148, 0.0118] : [0.0175, 0.0128];
    const rL = front ? [0.0118, 0.0095] : [0.0135, 0.0102];

    seg(n0, C.green, m(P[0]), m(P[1]), rU[0], rU[1], 7);
    blob(n0, C.green, m(P[0]), rU[0] * 1.05);
    if (!front) {
      const mp = mix(P[0], P[1], 0.45);
      blob(n0, C.green, m([mp[0], mp[1] + 0.003, mp[2]]), [0.02, 0.018, 0.026]);
    }
    blob(n1, C.green, m(P[1]), rU[1] * 1.14);
    seg(n1, C.lime, m(P[1]), m(P[2]), rL[0], rL[1], 7);
    const rc = lerp(rL[0], rL[1], 0.74) + 0.0014;
    seg(n1, C.orange, m(mix(P[1], P[2], 0.7)), m(mix(P[1], P[2], 0.78)), rc, rc, 7);
    blob(n2, C.green, m(P[2]), rL[1] * 1.15);
    seg(n2, C.greenDk, m(P[2]), m(palm), rL[1], 0.009, 6);
    blob(n2, C.greenDk, m(palm), [0.0155, 0.0095, 0.0175]);

    // zygodactyl toes: front = 3 inner + 2 outer bundle, hind = 2 inner + 3 outer
    const toes = front
      ? [
          { dx: -0.0135, a: -0.5, l: 0.9 },
          { dx: -0.0085, a: -0.3, l: 1.0 },
          { dx: -0.0035, a: -0.1, l: 0.95 },
          { dx: 0.0085, a: 0.14, l: 0.95 },
          { dx: 0.0135, a: 0.34, l: 0.85 },
        ]
      : [
          { dx: -0.0135, a: -0.34, l: 0.85 },
          { dx: -0.0085, a: -0.14, l: 0.95 },
          { dx: 0.0035, a: 0.1, l: 0.95 },
          { dx: 0.0085, a: 0.3, l: 1.0 },
          { dx: 0.0135, a: 0.5, l: 0.9 },
        ];
    const r = 0.0042;
    toes.forEach((t, j) => {
      const base = m([palm[0] + t.dx, r * 0.97, palm[2] + 0.011]);
      digit((front ? "finger" : "toe") + sd + (j + 1), n2, base, t.a * s, t.l, r);
    });
  };
  buildLeg(1, true);
  buildLeg(-1, true);
  buildLeg(1, false);
  buildLeg(-1, false);

  // ============================================================ tail (coiled)
  const NT = 16;
  const tailRad = (t: number) => 0.0035 + 0.016 * Math.pow(1 - t, 0.9);
  const makeTail = (yc: number) => {
    const P0 = v3(0, 0.119, -0.14);
    const zc = -0.215;
    const r0 = 0.05;
    const r1 = 0.016;
    const turn = (410 * Math.PI) / 180;
    const S = v3(0, yc + r0, zc);
    const dense: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) dense.push(P0.clone().lerp(S, i / 8));
    const M = 160;
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      const ph = Math.PI / 2 + turn * u;
      const r = r0 + (r1 - r0) * u;
      dense.push(v3(0, yc + r * Math.sin(ph), zc + r * Math.cos(ph)));
    }
    const cum = [0];
    for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + dense[i].distanceTo(dense[i - 1]));
    const L = cum[cum.length - 1];
    const pts: THREE.Vector3[] = [];
    let sg = 1;
    for (let j = 0; j <= NT; j++) {
      const target = (L * j) / NT;
      while (sg < cum.length - 1 && cum[sg] < target) sg++;
      const t = (target - cum[sg - 1]) / Math.max(1e-9, cum[sg] - cum[sg - 1]);
      pts.push(dense[sg - 1].clone().lerp(dense[sg], Math.min(1, Math.max(0, t))));
    }
    const rad = pts.map((_, j) => tailRad(j / NT));
    return { pts, rad };
  };
  // lower the coil until its lowest tube just rests on the floor
  let yc = 0.05;
  for (let it = 0; it < 8; it++) {
    const { pts, rad } = makeTail(yc);
    let mn = Infinity;
    pts.forEach((p, j) => {
      mn = Math.min(mn, p.y - rad[j] * 1.06);
    });
    yc -= mn + 0.0006;
  }
  const tail = makeTail(yc);

  for (let j = 1; j <= NT; j++) {
    joint("tail" + j, arr(tail.pts[j - 1]), j === 1 ? "hips" : "tail" + (j - 1), "tail");
  }
  for (let j = 1; j <= NT; j++) {
    const a = arr(tail.pts[j - 1]);
    const c = arr(tail.pts[j]);
    const ra = tail.rad[j - 1];
    const rb = tail.rad[j];
    const col = j <= 2 ? C.green : j % 3 === 0 ? (j < 10 ? C.teal : C.orange) : j < 12 ? C.green : C.lime;
    seg("tail" + j, col, a, c, ra, rb, 8);
    blob("tail" + j, col, a, ra * 1.04);
    if (j <= 14) {
      const T = tail.pts[j].clone().sub(tail.pts[j - 1]).normalize();
      const N = v3(0, -T.z, T.y);
      const base = tail.pts[j - 1].clone().addScaledVector(N, ra * 0.92);
      const dir = N.clone().addScaledVector(T, 0.35);
      spike("tail" + j, j % 2 ? C.yellow : C.orange, arr(base), arr(dir), 0.0034 * (1 - 0.5 * (j / NT)), 0.0095 * (1 - j / NT) + 0.002, 4);
    }
  }
  blob("tail" + NT, C.rust, arr(tail.pts[NT]), tail.rad[NT] * 1.2);

  return b.root;
}
