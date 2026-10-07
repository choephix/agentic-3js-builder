```ts
import * as THREE from "three";

export const meta = {
  name: "Lined Seahorse on Seagrass",
  description:
    "A sunny-yellow lined seahorse with ridged bony rings, thin dark lines and white freckles, a spiky coronet, long tube snout, rippling translucent dorsal fin and big curious eyes, its curled tail wrapped around a strand of seagrass rising from a little patch of sand.",
};

function makeRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

export default function build(): THREE.Object3D {
  const rand = makeRng(1337);
  const root = new THREE.Group();

  // ---------- textures ----------
  function bodyTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "#ffbf1c");
    gr.addColorStop(0.5, "#ffdc4e");
    gr.addColorStop(1, "#ffbf1c");
    g.fillStyle = gr;
    g.fillRect(0, 0, 1024, 128);
    const gh = g.createLinearGradient(0, 0, 1024, 0);
    gh.addColorStop(0, "rgba(240,140,20,0)");
    gh.addColorStop(0.55, "rgba(240,140,20,0.1)");
    gh.addColorStop(1, "rgba(220,110,20,0.4)");
    g.fillStyle = gh;
    g.fillRect(0, 0, 1024, 128);
    g.strokeStyle = "rgba(70,38,18,0.9)";
    g.lineWidth = 1.6;
    for (let k = 0; k < 12; k++) {
      const y0 = ((k + 0.5) / 12) * 128;
      g.beginPath();
      for (let x = 0; x <= 1024; x += 8) {
        const y = y0 + 2.6 * Math.sin(x * 0.02 + k) + 1.6 * Math.sin(x * 0.053 + k * 2.1);
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    g.fillStyle = "#ffffff";
    for (let i = 0; i < 70; i++) {
      const x = rand() * 600;
      const y = rand() * 128;
      const rx = 2 + rand() * 3;
      g.beginPath();
      g.ellipse(x, y, rx, rx * 0.55, 0, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function finTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 64, 0, 0);
    gr.addColorStop(0, "rgba(255,220,120,0.75)");
    gr.addColorStop(1, "rgba(255,250,225,0.45)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 64);
    g.strokeStyle = "rgba(235,140,30,0.95)";
    g.lineWidth = 2.5;
    for (let k = 0; k < 15; k++) {
      const x = ((k + 0.5) / 15) * 256;
      g.beginPath();
      g.moveTo(x, 64);
      g.lineTo(x + (x - 128) * 0.12, 2);
      g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.fillRect(0, 0, 256, 3);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function sandTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ead7a4";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const v = rand();
      g.fillStyle = v < 0.5 ? "rgba(190,160,110,0.55)" : v < 0.8 ? "rgba(255,245,215,0.7)" : "rgba(150,120,90,0.5)";
      g.fillRect(rand() * 256, rand() * 256, 2, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // ---------- materials ----------
  const bodyMat = new THREE.MeshStandardMaterial({ map: bodyTexture(), roughness: 0.55, flatShading: true });
  const orangeMat = new THREE.MeshStandardMaterial({ color: "#f08a1a", roughness: 0.5, flatShading: true });
  const tipMat = new THREE.MeshStandardMaterial({ color: "#fff4d6", roughness: 0.5, flatShading: true });
  const finMat = new THREE.MeshStandardMaterial({
    map: finTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.4,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25 });
  const irisMat = new THREE.MeshStandardMaterial({ color: "#c8661a", roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: "#120a06", roughness: 0.2 });
  const lidMat = new THREE.MeshStandardMaterial({ color: "#e0701c", roughness: 0.5, flatShading: true });
  const grassMats = [
    new THREE.MeshStandardMaterial({ color: "#3f9a4a", roughness: 0.7, side: THREE.DoubleSide, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: "#62c45a", roughness: 0.7, side: THREE.DoubleSide, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: "#2c7444", roughness: 0.7, side: THREE.DoubleSide, flatShading: true }),
  ];
  const stalkMat = new THREE.MeshStandardMaterial({ color: "#4f8f3a", roughness: 0.7, flatShading: true });
  const nodeMat = new THREE.MeshStandardMaterial({ color: "#8aa83a", roughness: 0.7, flatShading: true });
  const sandMat = new THREE.MeshStandardMaterial({ map: sandTexture(), roughness: 0.95, flatShading: true });
  const sandDarkMat = new THREE.MeshStandardMaterial({ color: "#d9c08a", roughness: 0.95, flatShading: true });
  const pebbleMats = [
    new THREE.MeshStandardMaterial({ color: "#9aa3a8", roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: "#c9a88e", roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: "#6f7a86", roughness: 0.8, flatShading: true }),
  ];
  const starMat = new THREE.MeshStandardMaterial({ color: "#ff6f5e", roughness: 0.6, flatShading: true });
  const starDotMat = new THREE.MeshStandardMaterial({ color: "#ffd9c9", roughness: 0.6, flatShading: true });

  // ---------- helpers ----------
  function add(geo: THREE.BufferGeometry, mat: THREE.Material, pos?: THREE.Vector3) {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.copy(pos);
    root.add(m);
    return m;
  }
  function cylBetween(a: THREE.Vector3, b: THREE.Vector3, rB: number, rA: number, seg: number, mat: THREE.Material) {
    const d = b.clone().sub(a);
    const m = add(new THREE.CylinderGeometry(rB, rA, d.length(), seg), mat, a.clone().add(b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    return m;
  }
  function coneAt(base: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, seg: number, mat: THREE.Material) {
    const d = dir.clone().normalize();
    const m = add(new THREE.ConeGeometry(r, h, seg), mat, base.clone().addScaledVector(d, h / 2));
    m.quaternion.setFromUnitVectors(UP, d);
    return m;
  }

  // ---------- seahorse body (swept, ridged) ----------
  const ctrl: THREE.Vector3[] = [
    V(0, 0.274, 0.04),
    V(0, 0.256, 0.04),
    V(0, 0.232, 0.05),
    V(0, 0.208, 0.058),
    V(0, 0.184, 0.058),
    V(0, 0.162, 0.05),
    V(0, 0.145, 0.038),
    V(0, 0.132, 0.026),
    V(0, 0.122, 0.016),
  ];
  const radii = [0.009, 0.0105, 0.014, 0.0165, 0.016, 0.0135, 0.01, 0.0072, 0.0056];
  const R = 0.0096;
  const helixSteps = 13;
  for (let k = 0; k <= helixSteps; k++) {
    const a = (k * Math.PI) / 4;
    const rr = R * (1 - 0.25 * (k / helixSteps));
    ctrl.push(V(rr * Math.sin(a), 0.114 - k * 0.00155, rr * Math.cos(a)));
    radii.push(0.0048 - (k / helixSteps) * 0.0033);
  }
  const n = ctrl.length;
  const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
  const len = curve.getLength();
  const radiusAt = (t: number) => {
    const f = t * (n - 1);
    const i = Math.min(n - 2, Math.floor(f));
    const a = f - i;
    return radii[i] * (1 - a) + radii[i + 1] * a;
  };
  const RING = 0.0068;
  {
    const NS = 260, RS = 8;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    let prevT: THREE.Vector3 | null = null;
    const Nrm = new THREE.Vector3();
    for (let i = 0; i <= NS; i++) {
      const u = i / NS;
      const t = curve.getUtoTmapping(u);
      const P = curve.getPointAt(u);
      const T = curve.getTangentAt(u).normalize();
      if (!prevT) {
        Nrm.set(1, 0, 0).addScaledVector(T, -T.x).normalize();
      } else {
        const ax = new THREE.Vector3().crossVectors(prevT, T);
        const sl = ax.length();
        if (sl > 1e-7) {
          ax.divideScalar(sl);
          Nrm.applyAxisAngle(ax, Math.acos(THREE.MathUtils.clamp(prevT.dot(T), -1, 1)));
        }
      }
      prevT = T.clone();
      const B = new THREE.Vector3().crossVectors(T, Nrm).normalize();
      const s = u * len;
      const pulse = Math.pow(0.5 + 0.5 * Math.cos((2 * Math.PI * s) / RING), 3);
      let r = radiusAt(t) * (0.88 + 0.24 * pulse);
      if (u > 0.985) r *= Math.max(0, (1 - u) / 0.015);
      for (let j = 0; j <= RS; j++) {
        const th = (j / RS) * Math.PI * 2 + Math.PI / 8;
        const p = P.clone()
          .addScaledVector(Nrm, Math.cos(th) * r * 0.82)
          .addScaledVector(B, Math.sin(th) * r);
        pos.push(p.x, p.y, p.z);
        uv.push(u, j / RS);
      }
    }
    for (let i = 0; i < NS; i++)
      for (let j = 0; j < RS; j++) {
        const a = i * (RS + 1) + j, b = a + RS + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    add(geo, bodyMat);
  }

  // tubercles on ring peaks
  for (let k = 1; k * RING < len; k++) {
    const u = (k * RING) / len;
    const t = curve.getUtoTmapping(u);
    const f = t * (n - 1);
    const P = curve.getPointAt(u);
    const T = curve.getTangentAt(u).normalize();
    const r = radiusAt(t) * 1.12;
    if (f > 1.0 && f < 6.8 && !(f > 2.7 && f < 5.2)) {
      const bd = V(0, 0.15, -1).addScaledVector(T, -T.dot(V(0, 0.15, -1))).normalize();
      coneAt(P.clone().addScaledVector(bd, r * 0.85), bd, 0.0014, 0.0038, 5, orangeMat);
    }
    if (f > 1.5 && f < 6.5 && k % 2 === 0) {
      for (const sx of [-1, 1]) {
        const sd = V(sx, 0, 0.25);
        coneAt(P.clone().add(V(sx * r * 0.78, 0, 0)), sd, 0.001, 0.0026, 4, orangeMat);
      }
    }
    if (f > 7 && f < n - 2 && k % 2 === 0) {
      const out = V(P.x, 0, P.z).normalize();
      coneAt(P.clone().addScaledVector(out, radiusAt(t) * 0.9), out, 0.0008, 0.002, 4, orangeMat);
    }
  }

  // ---------- fins ----------
  function makeFin(b0: THREE.Vector3, b1: THREE.Vector3, out: THREE.Vector3, H: number, ripple: number, waves: number) {
    const nu = 20, nv = 4;
    const bdir = b1.clone().sub(b0);
    const o = out.clone().normalize();
    const rax = new THREE.Vector3().crossVectors(bdir, o).normalize();
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const h = H * Math.pow(Math.sin(Math.PI * (0.08 + 0.84 * u)), 0.6) * (1 - 0.08 * Math.abs(Math.sin(u * Math.PI * 8)));
      for (let j = 0; j <= nv; j++) {
        const v = j / nv;
        const p = b0.clone().addScaledVector(bdir, u).addScaledVector(o, h * v)
          .addScaledVector(rax, ripple * Math.sin(u * Math.PI * waves + v * 1.4) * v);
        pos.push(p.x, p.y, p.z);
        uv.push(u, v);
      }
    }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j, b = a + nv + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    add(geo, finMat);
  }
  const backPoint = (f: number) => {
    const t = f / (n - 1);
    return curve.getPoint(t).add(V(0, 0, -radiusAt(t) * 0.8));
  };
  makeFin(backPoint(5.0), backPoint(2.85), V(0, 0.25, -1), 0.017, 0.0024, 5);
  for (const s of [-1, 1]) {
    makeFin(V(s * 0.0078, 0.249, 0.041), V(s * 0.0078, 0.261, 0.04), V(s * 0.75, 0.1, -0.65), 0.0075, 0.0009, 3);
  }

  // ---------- head ----------
  const hc = V(0, 0.277, 0.045);
  {
    const g = new THREE.IcosahedronGeometry(0.0125, 1);
    g.scale(0.8, 0.95, 1.1);
    const m = add(g, bodyMat, hc);
    m.rotation.x = 0.25;
    const ch = new THREE.IcosahedronGeometry(0.0075, 1);
    ch.scale(0.85, 0.9, 1.25);
    add(ch, bodyMat, V(0, 0.273, 0.056));
  }
  // snout
  const sA = V(0, 0.273, 0.054), sB = V(0, 0.268, 0.089);
  cylBetween(sA, sB, 0.0041, 0.005, 7, bodyMat);
  const sd = sB.clone().sub(sA).normalize();
  cylBetween(sB.clone().addScaledVector(sd, -0.0012), sB.clone().addScaledVector(sd, 0.0022), 0.0047, 0.0046, 7, orangeMat);
  // little ridge on top of snout
  coneAt(V(0, 0.2765, 0.06), V(0, 1, 0.5), 0.0011, 0.003, 4, orangeMat);

  // coronet
  {
    const cb = V(0, 0.29, 0.039);
    const m = add(new THREE.CylinderGeometry(0.0042, 0.0052, 0.007, 6), orangeMat, cb);
    m.rotation.x = -0.15;
    const top = V(0, 0.2935, 0.0385);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const off = V(Math.sin(a) * 0.0033, 0, Math.cos(a) * 0.0033);
      const dir = V(Math.sin(a) * 0.45, 1, Math.cos(a) * 0.45);
      coneAt(top.clone().add(off), dir, 0.0014, 0.0058, 5, orangeMat);
      coneAt(top.clone().add(off).addScaledVector(dir.normalize(), 0.0058), dir, 0.0004, 0.0012, 4, tipMat);
    }
    coneAt(top.clone(), V(0, 1, -0.1), 0.0016, 0.0075, 5, orangeMat);
  }

  // eyes
  for (const s of [-1, 1]) {
    const ec = V(0.0085 * s, 0.2805, 0.047);
    const d = V(s, 0.12, 0.55).normalize();
    add(new THREE.SphereGeometry(0.0052, 12, 8), whiteMat, ec);
    const iris = add(new THREE.CylinderGeometry(0.0037, 0.0037, 0.0012, 12), irisMat, ec.clone().addScaledVector(d, 0.0047));
    iris.quaternion.setFromUnitVectors(UP, d);
    const pup = add(new THREE.CylinderGeometry(0.0021, 0.0021, 0.0012, 10), pupilMat, ec.clone().addScaledVector(d, 0.0051));
    pup.quaternion.setFromUnitVectors(UP, d);
    add(new THREE.SphereGeometry(0.0008, 6, 4), whiteMat, ec.clone().addScaledVector(d, 0.006).add(V(0, 0.0013, 0.0008)));
    add(new THREE.SphereGeometry(0.0004, 5, 3), whiteMat, ec.clone().addScaledVector(d, 0.006).add(V(0, -0.001, -0.0006)));
    const lid = add(new THREE.TorusGeometry(0.0049, 0.0008, 5, 14), lidMat, ec.clone().addScaledVector(d, 0.0018));
    lid.quaternion.setFromUnitVectors(V(0, 0, 1), d);
    // brow spine
    coneAt(ec.clone().add(V(0.001 * s, 0.0045, -0.001)), V(s * 0.5, 1, -0.2), 0.0011, 0.0035, 4, orangeMat);
    // gill cover arc
    const og = new THREE.TorusGeometry(0.0048, 0.0007, 4, 10, Math.PI);
    og.rotateZ(-Math.PI / 2);
    og.rotateY(Math.PI / 2);
    add(og, lidMat, V(s * 0.0093, 0.272, 0.041));
  }

  // ---------- seagrass ----------
  function ribbon(pts: THREE.Vector3[], width: number, mat: THREE.Material, twist: number, segs = 16) {
    const c = new THREE.CatmullRomCurve3(pts);
    const pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const P = c.getPointAt(u);
      const T = c.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(T, V(0, 0, 1));
      if (side.length() < 1e-3) side.set(1, 0, 0);
      side.normalize().applyAxisAngle(T, twist * u);
      const nrm = new THREE.Vector3().crossVectors(side, T).normalize();
      const w = width * Math.min(1, (1 - u) * 5) * (0.8 + 0.2 * (1 - u)) + 0.0002;
      const a = P.clone().addScaledVector(side, -w / 2);
      const m = P.clone().addScaledVector(nrm, w * 0.15);
      const b = P.clone().addScaledVector(side, w / 2);
      pos.push(a.x, a.y, a.z, m.x, m.y, m.z, b.x, b.y, b.z);
    }
    for (let i = 0; i < segs; i++) {
      const r0 = i * 3, r1 = r0 + 3;
      idx.push(r0, r1, r0 + 1, r1, r1 + 1, r0 + 1, r0 + 1, r1 + 1, r0 + 2, r1 + 1, r1 + 2, r0 + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    add(geo, mat);
  }

  // held strand
  cylBetween(V(0, 0.006, 0), V(0, 0.168, 0), 0.0044, 0.0052, 7, stalkMat);
  for (const y of [0.06, 0.168]) {
    const node = add(new THREE.TorusGeometry(0.0052, 0.0011, 4, 8), nodeMat, V(0, y, 0));
    node.rotation.x = Math.PI / 2;
  }
  ribbon([V(0, 0.162, 0), V(-0.003, 0.22, -0.006), V(-0.016, 0.29, -0.01), V(-0.034, 0.35, -0.002), V(-0.052, 0.39, 0.014)], 0.0105, grassMats[1], 0.9, 18);
  ribbon([V(0, 0.164, 0), V(0.012, 0.2, -0.006), V(0.03, 0.24, -0.004), V(0.05, 0.265, 0.008)], 0.008, grassMats[0], -0.6, 12);
  ribbon([V(0, 0.058, 0), V(0.01, 0.09, -0.008), V(0.024, 0.115, -0.014), V(0.04, 0.128, -0.01)], 0.007, grassMats[2], 0.5, 10);

  for (let k = 0; k < 10; k++) {
    let ang = rand() * Math.PI * 2;
    const rad = 0.03 + rand() * 0.06;
    let x = Math.sin(ang) * rad, z = Math.cos(ang) * rad;
    if (z > -0.005 && Math.abs(x) < 0.05) { z = -Math.abs(z) - 0.02; ang = Math.atan2(x, z); }
    const H = 0.11 + rand() * 0.2;
    const lean = V(Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(H * (0.2 + rand() * 0.25));
    const sway = rand() * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let m = 0; m <= 4; m++) {
      const f = m / 4;
      pts.push(V(x, 0.01, z).add(V(0, H * f, 0)).addScaledVector(lean, f * f)
        .add(V(Math.sin(sway + f * 3) * 0.006 * f, 0, Math.cos(sway + f * 3) * 0.006 * f)));
    }
    ribbon(pts, 0.006 + rand() * 0.004, grassMats[k % 3], (rand() - 0.5) * 2.4, 14);
  }

  // ---------- sand base ----------
  add(new THREE.CylinderGeometry(0.11, 0.12, 0.014, 14), sandMat, V(0, 0.007, 0));
  for (let k = 0; k < 6; k++) {
    const a = rand() * Math.PI * 2, r = 0.02 + rand() * 0.07;
    const g = new THREE.IcosahedronGeometry(0.02 + rand() * 0.015, 0);
    g.scale(1, 0.18, 1);
    add(g, k % 2 ? sandMat : sandDarkMat, V(Math.sin(a) * r, 0.014, Math.cos(a) * r));
  }
  for (let k = 0; k < 9; k++) {
    const a = rand() * Math.PI * 2, r = 0.035 + rand() * 0.07;
    const s = 0.004 + rand() * 0.006;
    const g = new THREE.DodecahedronGeometry(s, 0);
    g.scale(1, 0.6, 0.85);
    const m = add(g, pebbleMats[k % 3], V(Math.sin(a) * r, 0.014 + s * 0.2, Math.cos(a) * r));
    m.rotation.y = rand() * 3;
  }
  // starfish
  {
    const c = V(0.06, 0.0155, 0.06);
    const center = add(new THREE.CylinderGeometry(0.005, 0.0055, 0.003, 5), starMat, c);
    center.rotation.y = 0.3;
    for (let k = 0; k < 5; k++) {
      const a = 0.3 + (k / 5) * Math.PI * 2;
      const g = new THREE.ConeGeometry(0.0038, 0.016, 4);
      g.rotateZ(-Math.PI / 2);
      g.scale(1, 0.45, 1);
      const m = add(g, starMat, c.clone().add(V(Math.cos(a) * 0.0095, 0, -Math.sin(a) * 0.0095)));
      m.rotation.y = a;
      for (let d = 1; d <= 2; d++) {
        add(new THREE.SphereGeometry(0.0007, 4, 3), starDotMat,
          c.clone().add(V(Math.cos(a) * (0.004 + d * 0.0045), 0.0012, -Math.sin(a) * (0.004 + d * 0.0045))));
      }
    }
    add(new THREE.SphereGeometry(0.0011, 5, 3), starDotMat, c.clone().add(V(0, 0.0016, 0)));
  }

  return root;
}
```