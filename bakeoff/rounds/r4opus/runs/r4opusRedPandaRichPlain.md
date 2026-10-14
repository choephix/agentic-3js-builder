```ts
import * as THREE from "three";

export const meta = {
  name: "Red Panda on a Mossy Branch",
  description:
    "A delighted red panda balancing upright on a mossy branch, holding a bamboo shoot in one paw. Its other paw is raised and its big ringed tail swings out for balance. The scene has a stumpy tree, a moss mound, toadstools and a tiny ladybug.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);

export default function build(): THREE.Object3D {
  const rnd = makeRng(77123);
  const root = new THREE.Group();

  // ---------- textures ----------
  function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (!g) return null;
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  const furTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#b4441c";
    g.fillRect(0, 0, w, h);
    const cols = ["#c9541f", "#9a3614", "#d86a2c", "#a63e18", "#e07a36"];
    for (let i = 0; i < 1400; i++) {
      const x = rnd() * w, y = rnd() * h, l = 5 + rnd() * 9;
      const a = Math.PI / 2 + (rnd() - 0.5) * 0.6;
      g.strokeStyle = cols[Math.floor(rnd() * cols.length)];
      g.lineWidth = 1.5 + rnd() * 1.5;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
  });

  const barkTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#5f4129";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      let x = rnd() * w;
      g.strokeStyle = rnd() < 0.6 ? "#3e2918" : "#7d5a3a";
      g.lineWidth = 1 + rnd() * 3.5;
      g.beginPath();
      g.moveTo(x, -10);
      for (let y = 0; y <= h + 16; y += 16) {
        x += (rnd() - 0.5) * 6;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let i = 0; i < 6; i++) {
      g.fillStyle = "#3a2615";
      g.beginPath();
      g.ellipse(rnd() * w, rnd() * h, 5 + rnd() * 6, 10 + rnd() * 10, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
  if (barkTex) barkTex.repeat.set(2, 1);

  // ---------- materials ----------
  const M = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...extra });

  const rust = furTex ? M(0xffffff, { map: furTex }) : M(0xb8461f);
  const rustDark = M(0x7e2a12);
  const black = M(0x241714);
  const white = M(0xf6efe2);
  const cream = M(0xf0d29a);
  const ginger = M(0xd2601e);
  const noseBlack = M(0x0f0a0a, { roughness: 0.35 });
  const mouthDark = M(0x5a1a1c);
  const pink = M(0xe8858a);
  const blush = M(0xf4a3a0);
  const bambooGreen = M(0x8bbd3c, { roughness: 0.6 });
  const bambooNode = M(0x5e8e28);
  const bambooLeaf = M(0xa6d14e);
  const bark = barkTex ? M(0xffffff, { map: barkTex }) : M(0x5f4129);
  const barkLight = M(0xc39a68);
  const moss = M(0x557f2a);
  const mossLight = M(0x8cb83f);
  const leafMat = M(0x4f8f35);
  const leafLight = M(0x74b043);
  const capRed = M(0xd8432a, { roughness: 0.5 });
  const rock = M(0x8a8f96);
  const flowerPink = M(0xf08fb0);
  const flowerYellow = M(0xf5d24a);

  // ---------- shared geometry ----------
  const SPH = new THREE.SphereGeometry(1, 10, 8);
  const SPH_LO = new THREE.SphereGeometry(1, 7, 5);
  const ICO = new THREE.IcosahedronGeometry(1, 0);
  const LEAF = new THREE.SphereGeometry(1, 6, 3);
  const CAP = new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const HEMI = new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2);

  function ell(parent: THREE.Object3D, mat: THREE.Material, p: number[], s: number[], r: number[] = [0, 0, 0], geo: THREE.BufferGeometry = SPH) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(r[0], r[1], r[2]);
    parent.add(m);
    return m;
  }

  function tube(parent: THREE.Object3D, mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, seg = 8) {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    parent.add(m);
    return m;
  }

  function cone(parent: THREE.Object3D, mat: THREE.Material, base: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, seg = 5) {
    const d = dir.clone().normalize();
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
    m.position.copy(base).addScaledVector(d, h / 2);
    m.quaternion.setFromUnitVectors(UP, d);
    parent.add(m);
    return m;
  }

  function leaf(parent: THREE.Object3D, mat: THREE.Material, pos: THREE.Vector3, yaw: number, pitch: number, len: number, wid: number) {
    const piv = new THREE.Group();
    piv.position.copy(pos);
    piv.rotation.set(pitch, yaw, 0, "YXZ");
    const m = new THREE.Mesh(LEAF, mat);
    m.scale.set(wid, wid * 0.18, len / 2);
    m.position.z = len / 2;
    piv.add(m);
    parent.add(piv);
  }

  function leafCluster(parent: THREE.Object3D, c: THREE.Vector3, n: number, size: number) {
    for (let i = 0; i < n; i++) {
      const yaw = (i / n) * Math.PI * 2 + rnd() * 0.5;
      const pitch = -0.5 + rnd() * 0.9;
      leaf(parent, rnd() < 0.5 ? leafMat : leafLight, c, yaw, pitch, size * (0.8 + rnd() * 0.4), size * 0.32);
    }
  }

  function mushroom(parent: THREE.Object3D, pos: THREE.Vector3, s: number, tilt: number, yaw: number) {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.rotation.set(0, yaw, tilt);
    g.scale.setScalar(s);
    tube(g, white, V(0, -0.005, 0), V(0, 0.035, 0), 0.011, 0.008, 6);
    ell(g, capRed, [0, 0.032, 0], [0.028, 0.02, 0.028], [0, 0, 0], CAP);
    const dots: [number, number][] = [[0, 0], [0.75, 0.3], [0.75, 1.9], [0.75, 3.5], [0.75, 5.0]];
    for (const [phi, th] of dots) {
      const x = Math.sin(phi) * Math.cos(th) * 0.028;
      const y = Math.cos(phi) * 0.02 + 0.032;
      const z = Math.sin(phi) * Math.sin(th) * 0.028;
      ell(g, white, [x, y, z], [0.004, 0.003, 0.004], [0, 0, 0], SPH_LO);
    }
    parent.add(g);
  }

  // ================= TREE TRUNK =================
  const tx = -0.66, tz = -0.03, trunkH = 1.3;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, trunkH, 9), bark);
  trunk.position.set(tx, trunkH / 2, tz);
  root.add(trunk);
  // broken top
  const topDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.02, 9), barkLight);
  topDisc.position.set(tx, trunkH, tz);
  root.add(topDisc);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    cone(root, i % 2 ? bark : barkLight, V(tx + Math.cos(a) * 0.1, trunkH - 0.01, tz + Math.sin(a) * 0.1), V(Math.cos(a) * 0.15, 1, Math.sin(a) * 0.15), 0.035, 0.05 + rnd() * 0.09, 4);
  }
  // roots
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    tube(root, bark, V(tx + Math.cos(a) * 0.1, 0.24, tz + Math.sin(a) * 0.1), V(tx + Math.cos(a) * 0.33, 0.018, tz + Math.sin(a) * 0.33), 0.065, 0.02, 6);
  }
  // twigs with leaves on trunk
  const tw1a = V(tx + 0.05, 1.05, tz + 0.05), tw1b = V(tx + 0.3, 1.32, tz + 0.12);
  tube(root, bark, tw1a, tw1b, 0.032, 0.014, 6);
  leafCluster(root, tw1b, 8, 0.1);
  const tw2a = V(tx - 0.08, 0.92, tz), tw2b = V(tx - 0.33, 1.14, tz + 0.06);
  tube(root, bark, tw2a, tw2b, 0.03, 0.013, 6);
  leafCluster(root, tw2b, 7, 0.09);
  // moss patches on trunk
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2;
    const y = 0.2 + rnd() * 0.9;
    const rr = 0.17 - (y / trunkH) * 0.05;
    const s = 0.025 + rnd() * 0.03;
    const m = ell(root, rnd() < 0.5 ? moss : mossLight, [tx + Math.cos(a) * rr, y, tz + Math.sin(a) * rr], [s * 0.6, s * 1.4, s * 1.2], [0, -a, 0], ICO);
    m.rotation.y = -a;
  }
  // moss collar at branch junction
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const s = 0.03 + rnd() * 0.02;
    ell(root, i % 2 ? moss : mossLight, [-0.5, 0.56 + Math.cos(a) * 0.095, Math.sin(a) * 0.095], [s * 1.2, s, s], [a, 0, 0], ICO);
  }

  // ================= GROUND MOUND =================
  ell(root, moss, [tx, 0, tz], [0.5, 0.13, 0.42], [0, 0, 0], HEMI);
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2, d = 0.2 + rnd() * 0.22;
    const s = 0.06 + rnd() * 0.06;
    ell(root, mossLight, [tx + Math.cos(a) * d, 0, tz + Math.sin(a) * d * 0.85], [s * 1.3, s * 0.7, s], [0, rnd() * 3, 0], HEMI);
  }
  ell(root, rock, [-0.22, 0.02, 0.26], [0.07, 0.05, 0.06], [0.3, 0.6, 0.2], new THREE.DodecahedronGeometry(1, 0));
  ell(root, rock, [-1.0, 0.015, 0.15], [0.05, 0.04, 0.05], [0.5, 0.2, 0.1], new THREE.DodecahedronGeometry(1, 0));
  mushroom(root, V(-0.4, 0.05, 0.27), 1.2, 0.1, 0.3);
  mushroom(root, V(-0.34, 0.04, 0.3), 0.8, -0.2, 1.2);
  mushroom(root, V(-0.92, 0.04, -0.2), 1.0, 0.15, 2.0);
  // little flowers
  const flowerSpots: [number, number, THREE.Material][] = [
    [-0.55, 0.32, flowerPink], [-0.82, 0.25, flowerYellow], [-0.98, -0.05, flowerPink], [-0.3, -0.15, flowerYellow], [-0.6, -0.36, flowerPink],
  ];
  for (const [fx, fz, fm] of flowerSpots) {
    const top = V(fx, 0.13 + rnd() * 0.04, fz);
    tube(root, leafMat, V(fx, 0.03, fz), top, 0.004, 0.003, 4);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ell(root, fm, [fx + Math.cos(a) * 0.012, top.y, fz + Math.sin(a) * 0.012], [0.01, 0.004, 0.01], [0, 0, 0], SPH_LO);
    }
    ell(root, fm === flowerPink ? flowerYellow : white, [fx, top.y + 0.003, fz], [0.006, 0.005, 0.006], [0, 0, 0], SPH_LO);
  }
  // ferns
  for (let i = 0; i < 6; i++) {
    const a = 0.5 + i * 1.05;
    leaf(root, i % 2 ? leafMat : leafLight, V(tx + Math.cos(a) * 0.18, 0.08, tz + Math.sin(a) * 0.18), Math.PI / 2 - a, -0.5, 0.2, 0.04);
  }

  // ================= BRANCH =================
  const bp = [V(-0.6, 0.56, 0), V(-0.28, 0.505, 0), V(0.08, 0.5, 0), V(0.42, 0.52, -0.01), V(0.72, 0.58, 0.03), V(0.94, 0.67, 0.06)];
  const br = [0.095, 0.08, 0.073, 0.062, 0.047, 0.028];
  for (let i = 0; i < bp.length - 1; i++) {
    tube(root, bark, bp[i], bp[i + 1], br[i], br[i + 1], 8);
    if (i > 0) ell(root, bark, [bp[i].x, bp[i].y, bp[i].z], [br[i], br[i], br[i]], [0, 0, 0], SPH_LO);
  }
  ell(root, barkLight, [bp[5].x, bp[5].y, bp[5].z], [0.028, 0.028, 0.028], [0, 0, 0], SPH_LO);
  // broken stub
  cone(root, bark, V(-0.3, 0.52, -0.04), V(0.2, 0.4, -1), 0.03, 0.12, 6);

  function branchAt(x: number) {
    for (let i = 0; i < bp.length - 1; i++) {
      if (x <= bp[i + 1].x || i === bp.length - 2) {
        const t = THREE.MathUtils.clamp((x - bp[i].x) / (bp[i + 1].x - bp[i].x), 0, 1);
        return { c: bp[i].clone().lerp(bp[i + 1], t), r: br[i] + (br[i + 1] - br[i]) * t };
      }
    }
    return { c: bp[0].clone(), r: br[0] };
  }

  // moss clumps on top of the branch
  for (let i = 0; i < 46; i++) {
    const x = -0.5 + rnd() * 1.38;
    if (Math.abs(x) < 0.15) continue;
    const { c, r } = branchAt(x);
    const a = (rnd() - 0.5) * 2.4;
    const s = (0.018 + rnd() * 0.025) * (r / 0.08 + 0.3);
    ell(root, rnd() < 0.55 ? moss : mossLight, [c.x, c.y + Math.cos(a) * r * 0.92, c.z + Math.sin(a) * r * 0.92], [s * 1.4, s * 0.6, s * 1.1], [a, rnd(), 0], ICO);
  }
  // hanging moss strands
  for (const x of [-0.42, -0.31, -0.2, 0.19, 0.3, 0.47, 0.6]) {
    const { c, r } = branchAt(x);
    for (let k = 0; k < 2; k++) {
      const len = 0.04 + rnd() * 0.09;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.011, len, 4), k ? moss : mossLight);
      m.position.set(c.x + (rnd() - 0.5) * 0.03, c.y - r * 0.85 - len / 2, c.z + (rnd() - 0.5) * 0.05);
      m.rotation.set(Math.PI, rnd() * 3, 0);
      root.add(m);
    }
  }
  // toadstools on branch
  {
    const a = branchAt(-0.4), b = branchAt(-0.33);
    mushroom(root, V(a.c.x, a.c.y + a.r * 0.7, a.c.z + a.r * 0.6), 1.0, 0, -0.3);
    mushroom(root, V(b.c.x, b.c.y + b.r * 0.8, b.c.z + b.r * 0.5), 0.7, -0.2, 0.8);
  }
  // twig + leaves at the tip
  {
    const s = branchAt(0.66).c;
    const e = V(0.8, 0.88, 0.13);
    tube(root, bark, s, e, 0.02, 0.01, 6);
    leafCluster(root, e, 7, 0.1);
    leafCluster(root, bp[5], 5, 0.09);
    leafCluster(root, s.clone().lerp(e, 0.5), 3, 0.08);
  }
  // ladybug
  {
    const { c, r } = branchAt(0.56);
    const g = new THREE.Group();
    g.position.set(c.x, c.y + r * 0.97, c.z);
    g.rotation.y = 0.7;
    ell(g, capRed, [0, 0, 0], [0.012, 0.01, 0.015], [0, 0, 0], CAP);
    ell(g, black, [0, 0.002, 0.014], [0.007, 0.006, 0.006], [0, 0, 0], SPH_LO);
    ell(g, black, [0, 0.0095, 0], [0.0008, 0.0012, 0.014], [0, 0, 0], SPH_LO);
    for (const [dx, dz] of [[0.006, 0.004], [-0.006, 0.004], [0.006, -0.006], [-0.006, -0.006]]) {
      ell(g, black, [dx, 0.007, dz], [0.0028, 0.002, 0.0028], [0, 0, 0], SPH_LO);
    }
    root.add(g);
  }

  // ================= RED PANDA =================
  const y0 = 0.57;
  const pg = new THREE.Group();
  pg.position.set(0, y0, 0);
  root.add(pg);

  // body
  ell(pg, rust, [0, 0.24, 0], [0.14, 0.18, 0.12]);
  ell(pg, black, [0, 0.22, 0.04], [0.112, 0.16, 0.095]);
  ell(pg, rust, [0, 0.41, 0], [0.09, 0.06, 0.08]);
  for (const s of [1, -1]) {
    // shoulders, thighs, legs, feet
    ell(pg, rust, [s * 0.1, 0.335, 0.02], [0.055, 0.055, 0.06]);
    ell(pg, rust, [s * 0.085, 0.11, 0.01], [0.07, 0.085, 0.085]);
    tube(pg, black, V(s * 0.09, 0.09, 0.03), V(s * 0.082, 0.025, 0.04), 0.04, 0.034, 7);
    ell(pg, black, [s * 0.08, 0.014, 0.035], [0.042, 0.022, 0.058], [0.3, 0, 0]);
    for (const dx of [-0.02, 0, 0.02]) {
      cone(pg, cream, V(s * 0.08 + dx, 0.0, 0.083), V(0, -0.45, 1), 0.005, 0.02, 4);
    }
  }

  // right paw (-X) holding the bamboo
  const P_R = V(-0.156, 0.4, 0.139);
  const S_R = V(-0.1, 0.33, 0.03), E_R = V(-0.17, 0.31, 0.1);
  tube(pg, black, S_R, E_R, 0.036, 0.032, 7);
  ell(pg, black, [E_R.x, E_R.y, E_R.z], [0.032, 0.032, 0.032], [0, 0, 0], SPH_LO);
  tube(pg, black, E_R, P_R, 0.032, 0.03, 7);
  ell(pg, black, [P_R.x, P_R.y, P_R.z + 0.005], [0.04, 0.036, 0.036]);
  for (const dy of [-0.02, 0, 0.02]) {
    ell(pg, black, [P_R.x + 0.012, P_R.y + dy, P_R.z + 0.03], [0.015, 0.012, 0.014], [0, 0, 0], SPH_LO);
  }

  // left paw (+X) raised in a happy wave
  const S_L = V(0.1, 0.33, 0.03), E_L = V(0.19, 0.36, 0.07), P_L = V(0.24, 0.46, 0.09);
  tube(pg, black, S_L, E_L, 0.036, 0.032, 7);
  ell(pg, black, [E_L.x, E_L.y, E_L.z], [0.032, 0.032, 0.032], [0, 0, 0], SPH_LO);
  tube(pg, black, E_L, P_L, 0.032, 0.03, 7);
  ell(pg, black, [P_L.x, P_L.y, P_L.z], [0.038, 0.044, 0.032], [0, 0, -0.3]);
  for (let k = 0; k < 4; k++) {
    const dx = -0.024 + k * 0.016;
    cone(pg, cream, V(P_L.x + dx - 0.01, P_L.y + 0.038 - Math.abs(dx) * 0.4, P_L.z + 0.012), V(dx * 4 - 0.25, 1, 0.2), 0.005, 0.02, 4);
  }

  // bamboo shoot
  {
    const B0 = V(-0.115, 0.2, 0.15), B1 = V(-0.225, 0.74, 0.12);
    const dir = B1.clone().sub(B0);
    const bam = new THREE.Group();
    bam.position.copy(B0);
    bam.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    pg.add(bam);
    const nodes = [0, 0.14, 0.27, 0.39, 0.48];
    for (let i = 0; i < nodes.length - 1; i++) {
      const ra = 0.017 - i * 0.0018, rb = 0.017 - (i + 1) * 0.0018;
      tube(bam, bambooGreen, V(0, nodes[i], 0), V(0, nodes[i + 1], 0), ra, rb, 7);
      if (i > 0) {
        const n = new THREE.Mesh(new THREE.CylinderGeometry(ra + 0.003, ra + 0.003, 0.01, 7), bambooNode);
        n.position.y = nodes[i];
        bam.add(n);
      }
    }
    const cut = new THREE.Mesh(new THREE.CylinderGeometry(0.0175, 0.0175, 0.006, 7), cream);
    cut.position.y = 0;
    bam.add(cut);
    cone(bam, bambooNode, V(0, 0.475, 0), V(0, 1, 0), 0.011, 0.07, 6);
    const lv: [number, number, number, number][] = [
      [0.39, 0.6, -0.5, 0.09], [0.39, 3.0, -0.6, 0.08],
      [0.47, 1.8, -0.8, 0.1], [0.47, -0.6, -0.7, 0.1], [0.5, 4.2, -1.0, 0.085],
    ];
    for (const [h, yaw, pitch, len] of lv) {
      leaf(bam, bambooLeaf, V(0, h, 0), yaw, pitch, len, 0.016);
    }
  }

  // ---------- head ----------
  const hg = new THREE.Group();
  hg.position.set(0, 0.53, 0.035);
  hg.rotation.set(-0.08, 0, 0.12);
  pg.add(hg);

  ell(hg, rust, [0, 0, 0], [0.13, 0.11, 0.11]);
  ell(hg, white, [0, -0.02, 0.05], [0.122, 0.085, 0.072]);
  ell(hg, white, [0, -0.045, 0.1], [0.055, 0.04, 0.045]);
  ell(hg, noseBlack, [0, -0.022, 0.142], [0.021, 0.013, 0.012]);
  ell(hg, white, [0.007, -0.016, 0.152], [0.005, 0.003, 0.003], [0, 0, 0], SPH_LO);
  ell(hg, mouthDark, [0, -0.07, 0.126], [0.026, 0.017, 0.011]);
  ell(hg, pink, [0, -0.078, 0.131], [0.015, 0.009, 0.007]);

  const eyeGeo = new THREE.TorusGeometry(0.017, 0.0072, 4, 10, Math.PI);
  for (const s of [1, -1]) {
    // fluffy cheeks
    cone(hg, white, V(s * 0.1, -0.035, 0.03), V(s * 0.92, -0.39, 0.05), 0.036, 0.085, 5);
    cone(hg, white, V(s * 0.085, -0.07, 0.04), V(s * 0.6, -0.8, 0.1), 0.03, 0.07, 5);
    // tear marks
    ell(hg, rust, [s * 0.054, -0.032, 0.1], [0.021, 0.05, 0.019], [0, s * 0.4, s * 0.25]);
    // happy closed eyes
    const eye = new THREE.Mesh(eyeGeo, noseBlack);
    eye.position.set(s * 0.05, 0.012, 0.114);
    eye.rotation.set(0, s * 0.38, 0);
    hg.add(eye);
    // white brows
    ell(hg, white, [s * 0.05, 0.056, 0.084], [0.025, 0.014, 0.013], [0, s * 0.4, -s * 0.2]);
    // blush
    ell(hg, blush, [s * 0.088, -0.045, 0.093], [0.02, 0.012, 0.008], [0, s * 0.75, 0], SPH_LO);
    // ears
    const eg = new THREE.Group();
    eg.position.set(s * 0.088, 0.075, -0.015);
    eg.rotation.set(-0.1, 0, -s * 0.45);
    hg.add(eg);
    const rim = ell(eg, white, [0, 0.04, 0], [1, 1, 0.45], [0, 0, 0], new THREE.ConeGeometry(0.05, 0.095, 6));
    rim.rotation.y = Math.PI / 6;
    ell(eg, rustDark, [0, 0.03, 0.012], [1, 1, 0.4], [0, 0, 0], new THREE.ConeGeometry(0.033, 0.066, 6));
    ell(eg, rust, [0, 0.033, -0.01], [1, 1, 0.4], [0, 0, 0], new THREE.ConeGeometry(0.04, 0.075, 6));
    cone(eg, white, V(0, 0.0, 0.022), V(-s * 0.2, 1, 0.3), 0.012, 0.045, 4);
  }

  // ---------- tail ----------
  {
    const tc = new THREE.CatmullRomCurve3([
      V(0.03, 0.15, -0.09), V(0.16, 0.12, -0.15), V(0.31, 0.13, -0.12),
      V(0.44, 0.19, -0.06), V(0.51, 0.31, -0.01), V(0.48, 0.43, 0.03),
    ]);
    const N = 9;
    const seg = tc.getLength() / N;
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N;
      const p = tc.getPointAt(t);
      const tan = tc.getTangentAt(t);
      let r = 0.05 + 0.032 * Math.sin(Math.PI * Math.min(1, t * 1.15));
      const mat = i === N - 1 ? rustDark : i % 2 === 0 ? ginger : cream;
      if (i === N - 1) r *= 0.85;
      const m = new THREE.Mesh(SPH, mat);
      m.position.copy(p);
      m.scale.set(r, seg * 0.64, r);
      m.quaternion.setFromUnitVectors(UP, tan);
      pg.add(m);
      // fluff tufts
      const ref = Math.abs(tan.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
      const n1 = new THREE.Vector3().crossVectors(tan, ref).normalize();
      const n2 = new THREE.Vector3().crossVectors(tan, n1).normalize();
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + i * 0.9;
        const n = n1.clone().multiplyScalar(Math.cos(a)).addScaledVector(n2, Math.sin(a));
        cone(pg, mat, p.clone().addScaledVector(n, r * 0.8), n.clone().addScaledVector(tan, 0.6), 0.022, 0.045, 4);
      }
    }
    const tipP = tc.getPointAt(1);
    cone(pg, rustDark, tipP.clone().addScaledVector(tc.getTangentAt(1), -0.02), tc.getTangentAt(1), 0.035, 0.06, 6);
  }

  return root;
}
```