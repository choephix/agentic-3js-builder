import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized low-poly keel-billed toucan with wings spread, perched on a short mossy branch: a lime, orange and cherry-red upper bill over a sky-blue lower bill, glossy black plumage, a lemon bib edged in red, lime eye rings, blue zygodactyl feet, a scarlet undertail and a pink orchid in bloom beside it.",
};

type V = [number, number, number];
const V3 = THREE.Vector3;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "toucan" });
  const root: THREE.Object3D = b.root;

  // ---------- deterministic randomness ----------
  let seed = 1337;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let rand: () => number = lcg;
  try {
    const r: any = (rng as any)(11);
    const f: any =
      typeof r === "function"
        ? r
        : r && typeof r.next === "function"
        ? () => r.next()
        : r && typeof r.float === "function"
        ? () => r.float()
        : null;
    if (f) {
      rand = () => {
        const x = f();
        return typeof x === "number" && isFinite(x) ? x - Math.floor(x) : lcg();
      };
    }
  } catch {
    rand = lcg;
  }
  const rr = (a: number, c: number) => a + (c - a) * rand();

  // ---------- materials ----------
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  function mat(color: string, rough = 0.72, metal = 0.04) {
    const key = `${color}|${rough}|${metal}`;
    let m = mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: rough,
        metalness: metal,
        flatShading: true,
        side: THREE.DoubleSide,
      });
      mats.set(key, m);
    }
    return m;
  }
  const GLOSS = (c: string) => mat(c, 0.3, 0.12);
  const BLACK = GLOSS("#0f1016");
  const SHEEN = GLOSS("#1d2336");
  const SHAFT = mat("#3c4459", 0.5);

  // ---------- skeleton (translation-only bones) ----------
  const bones = new Map<string, { bone: THREE.Bone; at: THREE.Vector3 }>();
  function joint(name: string, at: V, parent?: string, role?: string) {
    const bone = new THREE.Bone();
    bone.name = name;
    const w = new V3(at[0], at[1], at[2]);
    if (parent) {
      const p = bones.get(parent)!;
      bone.position.copy(w).sub(p.at);
      p.bone.add(bone);
    } else {
      bone.position.copy(w);
      root.add(bone);
    }
    if (role) bone.userData.role = role;
    bones.set(name, { bone, at: w });
    return bone;
  }

  function add(
    geo: THREE.BufferGeometry,
    m: THREE.Material | string,
    at: V | THREE.Vector3,
    boneName: string,
    q?: THREE.Quaternion,
    scale?: V
  ) {
    const material = typeof m === "string" ? mat(m) : m;
    const mesh = new THREE.Mesh(geo, material);
    const j = bones.get(boneName)!;
    const p = Array.isArray(at) ? new V3(at[0], at[1], at[2]) : at.clone();
    mesh.position.copy(p).sub(j.at);
    if (q) mesh.quaternion.copy(q);
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    j.bone.add(mesh);
    return mesh;
  }

  // local +X -> dir, local +Y ~ up
  function qX(dir: THREE.Vector3, up = new V3(0, 1, 0)) {
    const x = dir.clone().normalize();
    let z = new V3().crossVectors(x, up);
    if (z.lengthSq() < 1e-8) z = new V3().crossVectors(x, new V3(0, 0, 1));
    z.normalize();
    const y = new V3().crossVectors(z, x);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  }
  // local +Z -> normal, local +Y ~ up
  function qZ(normal: THREE.Vector3) {
    const n = normal.clone().normalize();
    let x = new V3().crossVectors(new V3(0, 1, 0), n);
    if (x.lengthSq() < 1e-8) x = new V3(1, 0, 0);
    x.normalize();
    const y = new V3().crossVectors(n, x);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n));
  }

  const blobGeo0 = new THREE.IcosahedronGeometry(1, 0);
  const blobGeo1 = new THREE.IcosahedronGeometry(1, 1);
  function blob(at: V | THREE.Vector3, radii: V, m: THREE.Material | string, bone: string, q?: THREE.Quaternion, smooth = true) {
    return add(smooth ? blobGeo1 : blobGeo0, m, at, bone, q, radii);
  }

  function rodGeo(len: number, r0: number, r1: number, segs = 6) {
    const g = new THREE.CylinderGeometry(r1, r0, len, segs, 1);
    g.translate(0, len / 2, 0);
    g.rotateZ(-Math.PI / 2);
    return g;
  }
  function rod(a: V | THREE.Vector3, c: V | THREE.Vector3, r0: number, r1: number, m: THREE.Material | string, bone: string, segs = 6) {
    const A = Array.isArray(a) ? new V3(...a) : a.clone();
    const C = Array.isArray(c) ? new V3(...c) : c.clone();
    const d = C.clone().sub(A);
    return add(rodGeo(d.length(), r0, r1, segs), m, A, bone, qX(d));
  }

  function tube(pts: V[], r: number, m: THREE.Material | string, bone: string, tub = 8, rad = 5) {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new V3(...p)));
    const g = new THREE.TubeGeometry(curve, tub, r, rad, false);
    return add(g, m, [0, 0, 0], bone);
  }

  // flat leaf/feather shape along +X, thickness in Y
  function leafGeo(L: number, W: number, thick = 0.004, kind: "full" | "inner" | "outer" = "full") {
    const s = new THREE.Shape();
    let pts: [number, number][];
    if (kind === "inner")
      pts = [[0, -W * 0.3], [L * 0.55, -W / 2], [L * 0.55, W / 2], [0, W * 0.3]];
    else if (kind === "outer")
      pts = [[0, -W / 2], [L * 0.35, -W * 0.47], [L * 0.47, -W * 0.2], [L * 0.5, 0], [L * 0.47, W * 0.2], [L * 0.35, W * 0.47], [0, W / 2]];
    else
      pts = [[0, -W * 0.22], [L * 0.25, -W / 2], [L * 0.8, -W * 0.42], [L, 0], [L * 0.8, W * 0.42], [L * 0.25, W / 2], [0, W * 0.22]];
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
    g.translate(0, 0, -thick / 2);
    g.rotateX(-Math.PI / 2);
    return g;
  }

  // loft along z with faceted cross-sections (used for the bill)
  function loft(u0: number, u1: number, steps: number, n: number, sec: (u: number) => { z: number; y0: number; y1: number; w: number; keel: number }) {
    const pos: number[] = [];
    const idx: number[] = [];
    const ends: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = u0 + ((u1 - u0) * i) / steps;
      const s = sec(u);
      const my = (s.y0 + s.y1) / 2, hy = (s.y1 - s.y0) / 2;
      for (let k = 0; k < n; k++) {
        const a = (Math.PI * 2 * k) / n + Math.PI / 2;
        const sa = Math.sin(a), ca = Math.cos(a);
        const x = (s.w / 2) * ca * (sa > 0 ? 1 - s.keel * sa : 1);
        pos.push(x, my + hy * sa, s.z);
      }
      if (i === 0 || i === steps) ends.push(new V3(0, my, s.z));
    }
    for (let i = 0; i < steps; i++)
      for (let k = 0; k < n; k++) {
        const a = i * n + k, bb = i * n + ((k + 1) % n), c = (i + 1) * n + k, d = (i + 1) * n + ((k + 1) % n);
        idx.push(a, c, bb, bb, c, d);
      }
    const c0 = pos.length / 3;
    pos.push(ends[0].x, ends[0].y, ends[0].z);
    const c1 = c0 + 1;
    pos.push(ends[1].x, ends[1].y, ends[1].z);
    for (let k = 0; k < n; k++) {
      idx.push(c0, (k + 1) % n, k);
      idx.push(c1, steps * n + k, steps * n + ((k + 1) % n));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // point + normal on a (rotated about X) ellipsoid
  function ellPoint(center: V, radii: V, rotX: number, az: number, el: number) {
    const n0 = new V3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    const p = new V3(radii[0] * n0.x, radii[1] * n0.y, radii[2] * n0.z);
    const nn = new V3(n0.x / radii[0], n0.y / radii[1], n0.z / radii[2]).normalize();
    const e = new THREE.Euler(rotX, 0, 0);
    p.applyEuler(e).add(new V3(...center));
    nn.applyEuler(e);
    return { p, n: nn };
  }

  // ================= SKELETON =================
  joint("root", [0, 0, 0], undefined, "spine");
  joint("hips", [0, 0.2, -0.01], "root", "spine");
  joint("spine", [0, 0.27, 0.0], "hips", "spine");
  joint("neck", [0, 0.33, 0.02], "spine", "neck");
  joint("head", [0, 0.38, 0.03], "neck", "head");
  joint("jaw", [0, 0.37, 0.08], "head", "jaw");
  joint("tail1", [0, 0.175, -0.06], "hips", "tail");
  joint("tail2", [0, 0.143, -0.16], "tail1", "tail");
  joint("tail3", [0, 0.111, -0.26], "tail2", "tail");
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    joint("shoulder" + S, [0.065 * s, 0.29, -0.01], "spine", "wing");
    joint("elbow" + S, [0.15 * s, 0.315, -0.035], "shoulder" + S, "wing");
    joint("wrist" + S, [0.24 * s, 0.335, -0.05], "elbow" + S, "wing");
    joint("wingTip" + S, [0.32 * s, 0.35, -0.07], "wrist" + S, "wing");
    joint("hip" + S, [0.035 * s, 0.19, 0.0], "hips", "leg");
    joint("knee" + S, [0.035 * s, 0.155, 0.015], "hip" + S, "leg");
    joint("ankle" + S, [0.035 * s, 0.105, 0.0], "knee" + S, "leg");
    joint("toeF" + S, [0.035 * s, 0.072, 0.048], "ankle" + S, "digit");
    joint("toeB" + S, [0.035 * s, 0.072, -0.048], "ankle" + S, "digit");
  }

  // ================= BRANCH =================
  const BARK = mat("#6b4a2f", 0.9);
  const BARK_D = mat("#4a3220", 0.95);
  const branch = new THREE.CylinderGeometry(0.045, 0.048, 0.72, 8);
  branch.rotateZ(-Math.PI / 2);
  add(branch, BARK, [0, 0.046, 0], "root");
  for (const ang of [0.7, -0.7, 1.9, -1.9, 0.25, -1.3]) {
    const n = new V3(0, Math.cos(ang), Math.sin(ang));
    const len = rr(0.3, 0.6);
    const x0 = rr(-0.3, 0.3 - len) + len / 2;
    const at = new V3(x0, 0.046 + n.y * 0.046, n.z * 0.046);
    add(new THREE.BoxGeometry(len, 0.006, 0.006), BARK_D, at, "root", qZ(n));
  }
  for (const s of [1, -1]) {
    const cap = new THREE.CylinderGeometry(0.042, 0.042, 0.004, 8);
    cap.rotateZ(-Math.PI / 2);
    add(cap, mat("#d9b98a", 0.85), [0.361 * s, 0.046, 0], "root");
    const ring = new THREE.CylinderGeometry(0.026, 0.026, 0.005, 8);
    ring.rotateZ(-Math.PI / 2);
    add(ring, mat("#b4885a", 0.85), [0.3615 * s, 0.046, 0], "root");
    const core = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6);
    core.rotateZ(-Math.PI / 2);
    add(core, mat("#7a5434", 0.85), [0.362 * s, 0.046, 0], "root");
  }
  // broken side twig with two leaves
  rod([0.2, 0.075, 0.02], [0.27, 0.16, 0.075], 0.013, 0.007, BARK, "root", 6);
  const twigEnd = new THREE.CylinderGeometry(0.007, 0.007, 0.003, 6);
  add(twigEnd, mat("#d9b98a", 0.85), [0.27, 0.161, 0.075], "root", qX(new V3(0.07, 0.085, 0.055)).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), -Math.PI / 2)));
  add(leafGeo(0.07, 0.03, 0.003), mat("#4f9a35", 0.6), [0.245, 0.13, 0.055], "root", qX(new V3(0.6, 0.3, 0.6)));
  add(leafGeo(0.06, 0.026, 0.003), mat("#6cb83e", 0.6), [0.255, 0.145, 0.065], "root", qX(new V3(-0.2, 0.5, 0.8)));

  // moss clumps
  const mossCols = ["#6f9a32", "#8bb33d", "#4f7a26", "#9cc94a"];
  for (let i = 0; i < 46; i++) {
    const x = rr(-0.34, 0.34);
    const ang = rr(-1.25, 1.25);
    const n = new V3(0, Math.cos(ang), Math.sin(ang));
    const r = rr(0.011, 0.02);
    const at = new V3(x, 0.046 + n.y * 0.044, n.z * 0.044);
    blob(at, [r * rr(1, 1.6), r * 0.55, r], mat(mossCols[i % 4], 0.95), "root", qZ(n).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), Math.PI / 2)), false);
  }
  // moss sporophytes (little stalks with capsules)
  for (let i = 0; i < 12; i++) {
    const x = rr(-0.33, 0.33);
    if (Math.abs(Math.abs(x) - 0.035) < 0.02) continue;
    const z = rr(-0.02, 0.02);
    const top = new V3(x + rr(-0.006, 0.006), 0.115 + rr(0, 0.015), z);
    rod([x, 0.088, z], top, 0.0012, 0.001, mat("#a8692a", 0.8), "root", 3);
    blob(top, [0.0028, 0.004, 0.0028], mat("#d4762c", 0.7), "root", undefined, false);
  }
  // lichen
  for (let i = 0; i < 8; i++) {
    const x = rr(-0.32, 0.32);
    const ang = (rand() > 0.5 ? 1 : -1) * rr(1.3, 1.9);
    const n = new V3(0, Math.cos(ang), Math.sin(ang));
    const at = new V3(x, 0.046 + n.y * 0.047, n.z * 0.047);
    add(new THREE.CircleGeometry(rr(0.007, 0.012), 6), mat("#b9c79a", 0.95), at, "root", qZ(n));
  }

  // ================= ORCHID =================
  const OX = -0.2;
  const STEM = mat("#4d8a3a", 0.6);
  add(leafGeo(0.13, 0.045, 0.004), mat("#3f8a3a", 0.5), [OX, 0.088, 0.02], "root", qX(new V3(-0.7, 0.18, 0.7)));
  add(leafGeo(0.11, 0.04, 0.004), mat("#4a9a42", 0.5), [OX + 0.005, 0.089, 0.025], "root", qX(new V3(0.25, 0.2, 0.95)));
  add(new THREE.BoxGeometry(0.11, 0.002, 0.003), mat("#7cc25e", 0.5), new V3(OX, 0.0905, 0.02).add(new V3(-0.7, 0.18, 0.7).normalize().multiplyScalar(0.055)), "root", qX(new V3(-0.7, 0.18, 0.7)));
  blob([OX, 0.09, 0.012], [0.012, 0.008, 0.012], mat("#6a8a3a", 0.9), "root", undefined, false);
  // aerial roots
  tube([[OX, 0.088, 0.0], [OX - 0.03, 0.085, -0.03], [OX - 0.05, 0.06, -0.045]], 0.003, mat("#c9d3b0", 0.8), "root", 6, 4);
  tube([[OX + 0.01, 0.088, -0.005], [OX + 0.03, 0.08, -0.035], [OX + 0.04, 0.05, -0.047]], 0.0028, mat("#c9d3b0", 0.8), "root", 6, 4);
  // stem
  const C = new V3(OX - 0.02, 0.26, 0.105);
  tube([[OX, 0.09, 0.012], [OX - 0.01, 0.16, 0.03], [OX - 0.025, 0.23, 0.07], [C.x, C.y - 0.008, C.z - 0.012]], 0.0032, STEM, "root", 10, 5);
  // bud
  tube([[OX - 0.012, 0.19, 0.045], [OX - 0.035, 0.205, 0.06]], 0.002, STEM, "root", 3, 4);
  blob([OX - 0.04, 0.206, 0.064], [0.009, 0.007, 0.007], mat("#f29ac8", 0.55), "root", qX(new V3(-1, 0.3, 0.3)));
  // flower
  const PETAL = mat("#ff7fbf", 0.5);
  const SEPAL = mat("#ff9fd0", 0.5);
  const SPOT = mat("#c2186b", 0.5);
  const zAx = new V3(0, 0, 1);
  const petals: [number, number, number, THREE.Material][] = [
    [90, 0.032, 0.018, SEPAL],
    [215, 0.032, 0.018, SEPAL],
    [325, 0.032, 0.018, SEPAL],
    [20, 0.034, 0.03, PETAL],
    [160, 0.034, 0.03, PETAL],
  ];
  for (const [deg, len, wid, m] of petals) {
    const a = (deg * Math.PI) / 180;
    const dir = new V3(Math.cos(a), Math.sin(a), 0);
    const q = new THREE.Quaternion().setFromAxisAngle(zAx, a);
    const at = C.clone().add(dir.clone().multiplyScalar(len * 0.55)).add(new V3(0, 0, -0.002));
    blob(at, [len * 0.55, wid / 2, 0.003], m, "root", q);
    if (m === PETAL) {
      for (let k = 0; k < 3; k++) {
        const t = 0.35 + k * 0.17;
        const sp = C.clone().add(dir.clone().multiplyScalar(len * t)).add(new V3(0, (k - 1) * 0.004, 0.0025));
        blob(sp, [0.0022, 0.0022, 0.001], SPOT, "root", undefined, false);
      }
    }
  }
  blob(C.clone().add(new V3(0, -0.015, 0.008)), [0.012, 0.014, 0.008], mat("#c2186b", 0.45), "root");
  blob(C.clone().add(new V3(0, -0.009, 0.014)), [0.005, 0.004, 0.003], mat("#ffd23a", 0.5), "root", undefined, false);
  blob(C.clone().add(new V3(0, 0.004, 0.006)), [0.004, 0.008, 0.004], mat("#fff4f8", 0.5), "root", undefined, false);

  // ================= BODY =================
  const bodyC: V = [0, 0.255, -0.01];
  const bodyR: V = [0.075, 0.11, 0.08];
  const bodyRot = 0.2;
  blob(bodyC, bodyR, BLACK, "spine", new THREE.Quaternion().setFromEuler(new THREE.Euler(bodyRot, 0, 0)));
  blob([0, 0.195, -0.045], [0.06, 0.05, 0.065], BLACK, "hips");
  blob([0, 0.34, 0.015], [0.05, 0.055, 0.05], BLACK, "neck");
  // maroon nape
  blob([0, 0.36, -0.03], [0.047, 0.042, 0.03], GLOSS("#5a1a24"), "neck");
  // back sheen
  blob([0, 0.3, -0.06], [0.05, 0.06, 0.025], SHEEN, "spine", new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0, 0)));

  // breast feather scallops
  for (let row = 0; row < 3; row++) {
    for (let k = -2; k <= 2; k++) {
      if (row === 2 && Math.abs(k) === 2) continue;
      const el = -0.05 - row * 0.32;
      const az = k * 0.28 + (row % 2) * 0.14;
      const { p, n } = ellPoint(bodyC, bodyR, bodyRot, az, el);
      blob(p, [0.016, 0.011, 0.004], GLOSS("#22242f"), row === 2 ? "hips" : "spine", qZ(n));
    }
  }
  // back chevrons
  for (let row = 0; row < 3; row++) {
    for (let k = -1; k <= 1; k++) {
      const az = Math.PI + k * 0.38 + (row % 2) * 0.19;
      const el = 0.25 - row * 0.3;
      const { p, n } = ellPoint(bodyC, bodyR, bodyRot, az, el);
      blob(p, [0.017, 0.012, 0.004], SHEEN, "spine", qZ(n));
    }
  }

  // lemon bib + red border
  blob([0, 0.287, 0.06], [0.05, 0.02, 0.03], GLOSS("#d81f2e"), "spine");
  blob([0, 0.322, 0.055], [0.058, 0.055, 0.035], GLOSS("#ffe23a"), "spine");
  blob([0, 0.355, 0.058], [0.044, 0.033, 0.03], GLOSS("#ffe74f"), "neck");
  blob([0, 0.335, 0.083], [0.03, 0.022, 0.008], GLOSS("#fff28a"), "neck");

  // scarlet undertail
  blob([0, 0.16, -0.075], [0.042, 0.024, 0.05], GLOSS("#e0242f"), "tail1", new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0, 0)));
  blob([0, 0.155, -0.04], [0.03, 0.02, 0.03], GLOSS("#ff3a3a"), "hips");

  // ================= TAIL =================
  for (let k = -2; k <= 2; k++) {
    const base = new V3(k * 0.012, 0.18 - Math.abs(k) * 0.003, -0.06);
    const dir = new V3(k * 0.12, -0.32, -1).normalize();
    const L = 0.21 - Math.abs(k) * 0.012;
    const W = 0.045;
    const up = new V3(-k * 0.15, 1, 0);
    const q = qX(dir, up);
    const col = k === 0 ? SHEEN : BLACK;
    add(leafGeo(L, W, 0.005, "inner"), col, base, "tail1", q);
    add(leafGeo(L, W, 0.005, "outer"), col, base.clone().add(dir.clone().multiplyScalar(L * 0.5)), "tail2", q);
    add(new THREE.BoxGeometry(L * 0.9, 0.0015, 0.002), SHAFT, base.clone().add(dir.clone().multiplyScalar(L * 0.45)).add(new V3(0, 0.003, 0)), L * 0.45 > 0.105 ? "tail2" : "tail1", q);
  }

  // ================= HEAD =================
  blob([0, 0.385, 0.025], [0.056, 0.06, 0.064], BLACK, "head");
  blob([0, 0.428, 0.0], [0.035, 0.018, 0.04], SHEEN, "head");
  for (const s of [1, -1]) {
    blob([s * 0.05, 0.392, 0.045], [0.009, 0.025, 0.027], GLOSS("#8fd13a"), "head");
    const ringG = new THREE.TorusGeometry(0.0145, 0.0038, 5, 12);
    ringG.rotateY(Math.PI / 2);
    add(ringG, GLOSS("#b4ec42"), [s * 0.058, 0.392, 0.045], "head");
    blob([s * 0.055, 0.392, 0.045], [0.0105, 0.0105, 0.0105], mat("#140b08", 0.15, 0.1), "head");
    blob([s * 0.0645, 0.397, 0.05], [0.003, 0.003, 0.003], mat("#ffffff", 0.2), "head", undefined, false);
  }

  // ================= BILL =================
  const seam = (u: number) => 0.372 - 0.022 * u * u;
  const bz = (u: number) => 0.075 + 0.225 * u;
  const bw = (u: number) => 0.006 + 0.05 * Math.pow(1 - u, 0.6);
  const smooth = (a: number, c: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (c - a)));
    return t * t * (3 - 2 * t);
  };
  const upper = (u: number) => ({
    z: bz(u),
    y1: seam(u) + 0.004 + 0.054 * Math.pow(1 - u, 0.85),
    y0: seam(u) - 0.012 * smooth(0.8, 1, u) - 0.002,
    w: bw(u),
    keel: 0.35,
  });
  const lower = (u: number) => ({
    z: bz(u),
    y1: seam(u) - 0.001,
    y0: seam(u) - 0.003 - 0.034 * Math.pow(1 - u, 0.9),
    w: bw(u) * 0.9,
    keel: 0,
  });
  const upperBands: [number, number, string, number][] = [
    [0, 0.04, "#1b2410", 1],
    [0.04, 0.55, "#8ccc2a", 7],
    [0.55, 0.82, "#ff8a1c", 4],
    [0.82, 1, "#d8162b", 4],
  ];
  for (const [u0, u1, col, st] of upperBands) add(loft(u0, u1, st, 8, upper), GLOSS(col), [0, 0, 0], "head");
  const lowerBands: [number, number, string, number][] = [
    [0, 0.04, "#1b2410", 1],
    [0.04, 0.42, "#4fb7e8", 5],
    [0.42, 0.78, "#8ccc2a", 5],
    [0.78, 0.93, "#d8162b", 3],
  ];
  for (const [u0, u1, col, st] of lowerBands) add(loft(u0, u1, st, 8, lower), GLOSS(col), [0, 0, 0], "jaw");
  // cutting-edge line and serrations
  for (const s of [1, -1]) {
    const pts: V[] = [0.03, 0.25, 0.5, 0.72, 0.92].map((u) => [s * bw(u) * 0.5, seam(u) - 0.001, bz(u)] as V);
    tube(pts, 0.0018, mat("#14180c", 0.4), "head", 10, 4);
    for (let i = 0; i < 7; i++) {
      const u = 0.14 + i * 0.1;
      const cone = new THREE.ConeGeometry(0.0028, 0.007, 4);
      cone.rotateX(Math.PI);
      add(cone, mat("#2a3a12", 0.5), [s * bw(u) * 0.46, seam(u) - 0.003, bz(u)], "head");
    }
    // nostril slit tucked by the forehead
    blob([s * 0.012, 0.426, 0.083], [0.003, 0.002, 0.006], mat("#0a0a0a", 0.6), "head", undefined, false);
  }
  // orange stripe along upper culmen sides
  for (const s of [1, -1]) {
    const pts: V[] = [0.12, 0.3, 0.48].map((u) => {
      const sc = upper(u);
      return [s * sc.w * 0.38, sc.y0 + (sc.y1 - sc.y0) * 0.72, sc.z] as V;
    });
    tube(pts, 0.004, GLOSS("#ffb02e"), "head", 6, 4);
  }

  // ================= WINGS =================
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = bones.get("shoulder" + S)!.at;
    const el = bones.get("elbow" + S)!.at;
    const wr = bones.get("wrist" + S)!.at;
    const tp = bones.get("wingTip" + S)!.at;
    const up = new V3(-s * 0.25, 1, 0).normalize();
    rod(sh, el, 0.022, 0.017, BLACK, "shoulder" + S, 6);
    rod(el, wr, 0.017, 0.011, BLACK, "elbow" + S, 6);
    rod(wr, tp, 0.011, 0.005, BLACK, "wrist" + S, 5);
    blob(sh.clone().lerp(el, 0.4), [0.035, 0.012, 0.03], SHEEN, "shoulder" + S, qX(el.clone().sub(sh), up));

    // primaries
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = wr.clone().lerp(tp, 0.6 * (1 - t)).add(new V3(0, -0.004 + i * 0.0015, 0));
      const dir = new V3(s * (1 - 0.65 * t), -0.04, -(0.2 + 0.95 * t)).normalize();
      const L = 0.15 - 0.03 * t;
      const q = qX(dir, up);
      add(leafGeo(L, 0.032, 0.004), i % 2 ? BLACK : GLOSS("#15161d"), base, "wrist" + S, q);
      add(new THREE.BoxGeometry(L * 0.85, 0.0015, 0.0018), SHAFT, base.clone().add(dir.clone().multiplyScalar(L * 0.45)).add(up.clone().multiplyScalar(0.003)), "wrist" + S, q);
    }
    // secondaries
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = wr.clone().lerp(sh, t * 0.9).add(new V3(0, -0.006 + i * 0.0009, 0));
      const dir = new V3(s * 0.25 * (1 - t), -0.08, -1).normalize();
      const L = 0.12 - 0.025 * t;
      const bone = t < 0.5 ? "elbow" + S : "shoulder" + S;
      const q = qX(dir, up);
      add(leafGeo(L, 0.036, 0.004), BLACK, base, bone, q);
      add(new THREE.BoxGeometry(L * 0.85, 0.0015, 0.0018), SHAFT, base.clone().add(dir.clone().multiplyScalar(L * 0.45)).add(up.clone().multiplyScalar(0.003)), bone, q);
    }
    // coverts
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = wr.clone().lerp(sh, t * 0.95).add(new V3(0, 0.006, 0.004));
      const dir = new V3(s * 0.2 * (1 - t), -0.05, -1).normalize();
      add(leafGeo(0.065, 0.032, 0.004), SHEEN, base, t < 0.5 ? "elbow" + S : "shoulder" + S, qX(dir, up));
    }
  }

  // ================= LEGS & FEET =================
  const BLUE = GLOSS("#2f7fe0");
  const BLUE_D = GLOSS("#1f5bb8");
  const CLAW = mat("#20242e", 0.4);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hp = bones.get("hip" + S)!.at;
    const kn = bones.get("knee" + S)!.at;
    const an = bones.get("ankle" + S)!.at;
    blob(hp.clone().lerp(kn, 0.5), [0.025, 0.028, 0.026], BLACK, "hip" + S);
    rod(kn, an, 0.0085, 0.0075, BLUE, "knee" + S, 6);
    const legDir = an.clone().sub(kn);
    for (let k = 1; k <= 3; k++) {
      const tor = new THREE.TorusGeometry(0.0085, 0.0016, 4, 8);
      add(tor, BLUE_D, kn.clone().lerp(an, k * 0.24), "knee" + S, qZ(legDir));
    }
    blob(an, [0.011, 0.009, 0.011], BLUE, "ankle" + S);
    for (const fb of [1, -1]) {
      const toeName = (fb > 0 ? "toeF" : "toeB") + S;
      for (const dx of [-0.007, 0.007]) {
        const x = an.x + dx + s * 0.002;
        const pts: V[] = [
          [x, an.y - 0.004, an.z + fb * 0.005],
          [x, 0.097, fb * 0.028],
          [x, 0.083, fb * 0.042],
          [x, 0.07, fb * 0.049],
        ];
        tube(pts, 0.0055, BLUE, toeName, 6, 5);
        const claw = new THREE.ConeGeometry(0.0035, 0.01, 4);
        claw.rotateX(Math.PI);
        add(claw, CLAW, [x, 0.064, fb * 0.05], toeName);
      }
    }
  }

  // ================= rest on the floor =================
  const box = new THREE.Box3().setFromObject(root, true);
  if (isFinite(box.min.y)) bones.get("root")!.bone.position.y -= box.min.y;

  return root;
}
