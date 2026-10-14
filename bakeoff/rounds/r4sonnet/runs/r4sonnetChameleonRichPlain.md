```ts
import * as THREE from "three";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "A stylised panther chameleon mid-stride along a gnarled twig: turquoise head fading through lime green to a sunset-orange tail, with a white flank stripe, red bars, a ridged casque crest, independent turret eyes, mitten-like clamping feet and a tightly coiled tail.",
};

type V3 = THREE.Vector3;
type Mat = THREE.MeshStandardMaterial;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const V = (x = 0, y = 0, z = 0): V3 => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const XAX = V(1, 0, 0);
const ZAX = V(0, 0, 1);

const BOX = new THREE.BoxGeometry(1, 1, 1);
const ICO0 = new THREE.IcosahedronGeometry(1, 0);
const ICO1 = new THREE.IcosahedronGeometry(1, 1);

function xf(p: V3, q?: THREE.Quaternion, s?: V3): THREE.Matrix4 {
  return new THREE.Matrix4().compose(p, q ?? new THREE.Quaternion(), s ?? new THREE.Vector3(1, 1, 1));
}

function mergeGeos(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let n = 0;
  for (const g of list) n += g.getAttribute("position").count;
  const P = new Float32Array(n * 3);
  const N = new Float32Array(n * 3);
  const U = new Float32Array(n * 2);
  let o = 0;
  for (const g of list) {
    const p = g.getAttribute("position");
    const nn = g.getAttribute("normal");
    const uu = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      P[(o + i) * 3] = p.getX(i);
      P[(o + i) * 3 + 1] = p.getY(i);
      P[(o + i) * 3 + 2] = p.getZ(i);
      if (nn) {
        N[(o + i) * 3] = nn.getX(i);
        N[(o + i) * 3 + 1] = nn.getY(i);
        N[(o + i) * 3 + 2] = nn.getZ(i);
      }
      if (uu) {
        U[(o + i) * 2] = uu.getX(i);
        U[(o + i) * 2 + 1] = uu.getY(i);
      }
    }
    o += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(P, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(N, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(U, 2));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

/** Collects geometry per material and merges it into one mesh per material. */
class Builder {
  private geo = new Map<Mat, THREE.BufferGeometry[]>();
  private tris = new Map<Mat, { p: number[]; uv: number[] }>();

  emit(g: THREE.BufferGeometry, m: Mat, mx?: THREE.Matrix4): void {
    let x: THREE.BufferGeometry = mx ? g.clone().applyMatrix4(mx) : g;
    if (x.index) x = x.toNonIndexed();
    const list = this.geo.get(m);
    if (list) list.push(x);
    else this.geo.set(m, [x]);
  }

  sphere(c: V3, rx: number, ry: number, rz: number, m: Mat, detail = 1, q?: THREE.Quaternion): void {
    this.emit(detail > 0 ? ICO1 : ICO0, m, xf(c, q, V(rx, ry, rz)));
  }

  box(c: V3, sx: number, sy: number, sz: number, m: Mat, q?: THREE.Quaternion): void {
    this.emit(BOX, m, xf(c, q, V(sx, sy, sz)));
  }

  limb(a: V3, b: V3, ra: number, rb: number, sides: number, m: Mat): void {
    const d = b.clone().sub(a);
    const len = d.length();
    if (len < 1e-6) return;
    d.normalize();
    const g = new THREE.CylinderGeometry(rb, ra, len, sides, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
    this.emit(g, m, xf(a.clone().add(b).multiplyScalar(0.5), q));
  }

  cone(base: V3, dir: V3, r: number, h: number, sides: number, m: Mat): void {
    const d = dir.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
    this.emit(new THREE.ConeGeometry(r, h, sides, 1), m, xf(base.clone().addScaledVector(d, h / 2), q));
  }

  tri(m: Mat, a: V3, b: V3, c: V3, ref?: V3, uv?: number[]): void {
    let d = this.tris.get(m);
    if (!d) {
      d = { p: [], uv: [] };
      this.tris.set(m, d);
    }
    let B = b;
    let C = c;
    let t = uv ?? [0, 0, 0, 0, 0, 0];
    if (ref) {
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
      const cen = new THREE.Vector3().add(a).add(b).add(c).multiplyScalar(1 / 3).sub(ref);
      if (n.dot(cen) < 0) {
        B = c;
        C = b;
        t = [t[0], t[1], t[4], t[5], t[2], t[3]];
      }
    }
    d.p.push(a.x, a.y, a.z, B.x, B.y, B.z, C.x, C.y, C.z);
    d.uv.push(t[0], t[1], t[2], t[3], t[4], t[5]);
  }

  build(name: string): THREE.Group {
    for (const [m, d] of this.tris) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(d.p, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(d.uv, 2));
      g.computeVertexNormals();
      this.emit(g, m);
    }
    this.tris.clear();
    const grp = new THREE.Group();
    grp.name = name;
    for (const [m, list] of this.geo) {
      const mesh = new THREE.Mesh(mergeGeos(list), m);
      mesh.name = name + "_" + m.name;
      grp.add(mesh);
    }
    return grp;
  }
}

function canvasTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(20250611);
  const texRand = mulberry32(777);

  /* ------------------------------------------------------------------ textures */
  const scaleTex = canvasTex(64, 64, (ctx) => {
    ctx.fillStyle = "#d4d4d4";
    ctx.fillRect(0, 0, 64, 64);
    const cell = 16;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const ox = col * cell + (row % 2 ? cell / 2 : 0);
        const oy = row * cell;
        const v = Math.floor(222 + texRand() * 33);
        for (const dx of [-64, 0, 64]) {
          const x = ox + dx;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.beginPath();
          ctx.moveTo(x + cell * 0.5, oy + 1);
          ctx.lineTo(x + cell - 1.5, oy + cell * 0.28);
          ctx.lineTo(x + cell - 1.5, oy + cell * 0.72);
          ctx.lineTo(x + cell * 0.5, oy + cell - 1);
          ctx.lineTo(x + 1.5, oy + cell * 0.72);
          ctx.lineTo(x + 1.5, oy + cell * 0.28);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgb(165,165,165)";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }
    }
  });

  const barkTex = canvasTex(64, 128, (ctx) => {
    ctx.fillStyle = "#e4e4e4";
    ctx.fillRect(0, 0, 64, 128);
    for (let i = 0; i < 80; i++) {
      const x = texRand() * 64;
      const y = texRand() * 128;
      const len = 8 + texRand() * 30;
      const v = Math.floor(110 + texRand() * 90);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.lineWidth = 1 + texRand() * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (texRand() - 0.5) * 3, y + len);
      ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const y = texRand() * 128;
      ctx.strokeStyle = "rgb(120,120,120)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(64, y + (texRand() - 0.5) * 6);
      ctx.stroke();
    }
  });

  /* ------------------------------------------------------------------ materials */
  const mats = new Map<number, Mat>();
  const mat = (
    hex: number,
    o: { map?: THREE.Texture | null; rough?: number; side?: THREE.Side } = {}
  ): Mat => {
    let m = mats.get(hex);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: o.rough ?? 0.65,
        metalness: 0,
        flatShading: true,
        map: o.map ?? null,
        side: o.side ?? THREE.FrontSide,
      });
      m.name = "c" + hex.toString(16).padStart(6, "0");
      mats.set(hex, m);
    }
    return m;
  };
  const skin = (hex: number) => mat(hex, { map: scaleTex, rough: 0.5 });
  const bark = (hex: number) => mat(hex, { map: barkTex, rough: 0.92 });

  /* ------------------------------------------------------------------ palette */
  const STOPS: Array<[number, number]> = [
    [0.0, 0x19b9c9],
    [0.09, 0x17c3b6],
    [0.16, 0x25cb9a],
    [0.23, 0x55d46a],
    [0.3, 0x9cdc40],
    [0.38, 0xcfdc30],
    [0.46, 0xf2c42b],
    [0.56, 0xf79a24],
    [0.72, 0xf0701f],
    [1.0, 0xd8431b],
  ];
  const gradColor = (s: number): THREE.Color => {
    const t = clamp(s, 0, 1);
    for (let i = 0; i < STOPS.length - 1; i++) {
      const [s0, c0] = STOPS[i];
      const [s1, c1] = STOPS[i + 1];
      if (t <= s1) return new THREE.Color(c0).lerp(new THREE.Color(c1), (t - s0) / (s1 - s0));
    }
    return new THREE.Color(STOPS[STOPS.length - 1][1]);
  };
  const STEPS = 24;
  const bodyHex = (s: number) => gradColor(Math.round(clamp(s, 0, 1) * STEPS) / STEPS).getHex();
  const CREAM = new THREE.Color(0xf4f0d2);
  const bellyHex = (s: number) =>
    gradColor(Math.round(clamp(s, 0, 1) * 6) / 6).lerp(CREAM, 0.58).getHex();

  const STRIPE = 0xf6f3e6;
  const RED = 0xdc3a2e;
  const CRIMSON = 0xb02a1c;

  const cham = new Builder();
  const twigB = new Builder();

  /* ------------------------------------------------------------------ twig */
  const FOOT_Z = { LF: 0.1, RF: 0.06, RH: -0.03, LH: -0.088 };
  const TW_Z0 = -0.12;
  const TW_Z1 = 0.26;
  const twR = (z: number) => lerp(0.0135, 0.0092, smooth(TW_Z0, TW_Z1, z));
  const twYRaw = (z: number) =>
    twR(z) + 0.0035 * (1 + Math.sin(9 * z + 0.4)) + 0.022 * smooth(0.12, 0.26, z);
  let twLow = Infinity;
  for (let i = 0; i <= 120; i++) {
    const z = lerp(TW_Z0, TW_Z1, i / 120);
    twLow = Math.min(twLow, twYRaw(z) - twR(z));
  }
  for (const z of Object.values(FOOT_Z)) {
    twLow = Math.min(twLow, twYRaw(z) - 0.956 * (twR(z) + 0.0034) - 0.0022);
  }
  const twY = (z: number) => twYRaw(z) - twLow - 0.001;
  const twX = (z: number) => -0.012 * smooth(0.16, 0.26, z);
  const twig = (z: number) => ({ x: twX(z), y: twY(z), r: twR(z) });

  const barkDark = bark(0x573a25);
  const barkMid = bark(0x7a5636);
  const barkLight = bark(0x9a7241);
  const woodCut = mat(0xd9bb88, { rough: 0.8 });
  const leafMats = [
    mat(0x2f7d3b, { rough: 0.7, side: THREE.DoubleSide }),
    mat(0x45a04a, { rough: 0.7, side: THREE.DoubleSide }),
    mat(0x5fae3e, { rough: 0.7, side: THREE.DoubleSide }),
  ];
  const pickBark = (): Mat => {
    const q = rand();
    return q < 0.5 ? barkMid : q < 0.82 ? barkDark : barkLight;
  };

  function tube(
    b: Builder,
    centers: V3[],
    radii: number[],
    sides: number,
    pick: () => Mat,
    noise: number,
    capStart: Mat | null,
    capEnd: Mat | null
  ): void {
    const n = centers.length;
    const rg: V3[][] = [];
    const Ts: V3[] = [];
    const arcs: number[] = [0];
    for (let j = 0; j < n; j++) {
      if (j > 0) arcs.push(arcs[j - 1] + centers[j].distanceTo(centers[j - 1]));
      const T = centers[Math.min(n - 1, j + 1)].clone().sub(centers[Math.max(0, j - 1)]).normalize();
      const ref = Math.abs(T.y) > 0.92 ? ZAX : UP;
      const sd = new THREE.Vector3().crossVectors(ref, T).normalize();
      const up2 = new THREE.Vector3().crossVectors(T, sd).normalize();
      const ring: V3[] = [];
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2;
        const rr = radii[j] * (1 + (rand() - 0.5) * noise);
        ring.push(
          centers[j].clone().addScaledVector(up2, Math.cos(a) * rr).addScaledVector(sd, Math.sin(a) * rr)
        );
      }
      rg.push(ring);
      Ts.push(T);
    }
    for (let j = 0; j < n - 1; j++) {
      const ref = centers[j].clone().add(centers[j + 1]).multiplyScalar(0.5);
      for (let k = 0; k < sides; k++) {
        const k2 = (k + 1) % sides;
        const m = pick();
        const u0 = (k / sides) * 2;
        const u1 = ((k + 1) / sides) * 2;
        const v0 = arcs[j] / 0.03;
        const v1 = arcs[j + 1] / 0.03;
        b.tri(m, rg[j][k], rg[j + 1][k], rg[j][k2], ref, [u0, v0, u0, v1, u1, v0]);
        b.tri(m, rg[j + 1][k], rg[j + 1][k2], rg[j][k2], ref, [u0, v1, u1, v1, u1, v0]);
      }
    }
    if (capStart) {
      const c0 = centers[0].clone();
      const refc = c0.clone().addScaledVector(Ts[0], 0.01);
      for (let k = 0; k < sides; k++) b.tri(capStart, rg[0][k], rg[0][(k + 1) % sides], c0, refc);
    }
    if (capEnd) {
      const tip = centers[n - 1].clone().addScaledVector(Ts[n - 1], radii[n - 1] * 1.2);
      for (let k = 0; k < sides; k++)
        b.tri(capEnd, rg[n - 1][k], rg[n - 1][(k + 1) % sides], tip, centers[n - 1]);
    }
  }

  function leaf(b: Builder, base: V3, fwd: V3, tilt: number, len: number, wid: number, m: Mat): void {
    const f = fwd.clone().normalize();
    const r = new THREE.Vector3().crossVectors(UP, f);
    if (r.lengthSq() < 1e-4) r.set(1, 0, 0);
    r.normalize();
    const u = new THREE.Vector3().crossVectors(f, r).normalize();
    const rr = r.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(u, Math.sin(tilt));
    const uu = u.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(r, -Math.sin(tilt));
    const NS = 4;
    const rows: V3[][] = [];
    for (let i = 0; i <= NS; i++) {
      const t = i / NS;
      const w = wid * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.75))), 0.9);
      const droop = -0.16 * len * t * t;
      const lift = w * 0.5;
      const at = (lx: number, ly: number) =>
        base.clone().addScaledVector(rr, lx).addScaledVector(uu, ly + droop).addScaledVector(f, t * len);
      rows.push([at(-w, lift), at(0, 0), at(w, lift)]);
    }
    for (let i = 0; i < NS; i++) {
      const a = rows[i];
      const c = rows[i + 1];
      b.tri(m, a[0], a[1], c[0]);
      b.tri(m, a[1], c[1], c[0]);
      b.tri(m, a[1], a[2], c[1]);
      b.tri(m, a[2], c[2], c[1]);
    }
  }

  // main twig
  {
    const NT = 14;
    const centers: V3[] = [];
    const radii: number[] = [];
    for (let i = 0; i <= NT; i++) {
      const z = lerp(TW_Z0, TW_Z1, i / NT);
      centers.push(V(twX(z), twY(z), z));
      radii.push(twR(z));
    }
    radii[NT] = 0.0055;
    tube(twigB, centers, radii, 8, pickBark, 0.1, woodCut, barkDark);

    // knots and bark lumps
    const knots: Array<[number, number, number]> = [
      [-0.07, 1.2, 0.0052],
      [0.02, -1.9, 0.0046],
      [0.13, 2.4, 0.0042],
      [0.2, -1.2, 0.0038],
      [-0.1, -2.2, 0.0044],
    ];
    for (const [z, ang, rad] of knots) {
      const t = twig(z);
      const p = V(t.x + Math.sin(ang) * t.r * 0.95, t.y + Math.cos(ang) * t.r * 0.95, z);
      twigB.sphere(p, rad, rad * 0.85, rad * 1.2, barkDark, 0);
    }
  }

  function twiglet(
    zAt: number,
    dir: V3,
    len: number,
    r0: number,
    curl: V3,
    nLeaves: number,
    leafLen: number
  ): void {
    const tw = twig(zAt);
    const d = dir.clone().normalize();
    const start = V(tw.x, tw.y, zAt).addScaledVector(d, tw.r * 0.2);
    const N = 5;
    const pts: V3[] = [];
    const rad: number[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push(start.clone().addScaledVector(d, len * t).addScaledVector(curl, t * t));
      rad.push(lerp(r0, 0.0014, Math.pow(t, 0.9)));
    }
    tube(twigB, pts, rad, 6, pickBark, 0.1, null, barkDark);
    for (let i = 0; i < nLeaves; i++) {
      const t = nLeaves === 1 ? 1 : 0.42 + 0.58 * (i / (nLeaves - 1));
      const idx = Math.min(N, Math.round(t * N));
      const p = pts[idx];
      const tan = pts[Math.min(N, idx + 1)].clone().sub(pts[Math.max(0, idx - 1)]).normalize();
      const sgn = i % 2 === 0 ? 1 : -1;
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const terminal = idx === N;
      const ld = terminal
        ? tan.clone().addScaledVector(UP, 0.1)
        : tan.clone().multiplyScalar(0.75).addScaledVector(side, 0.65 * sgn).addScaledVector(UP, 0.1);
      leaf(twigB, p, ld, sgn * 0.35, leafLen * (0.85 + rand() * 0.3), leafLen * 0.21, leafMats[i % 3]);
    }
  }
  twiglet(0.165, V(-0.55, 0.62, 0.55), 0.11, 0.0042, V(-0.01, 0.03, 0.02), 4, 0.058);
  twiglet(0.215, V(0.6, 0.5, 0.62), 0.09, 0.0036, V(0.0, 0.025, 0.0), 3, 0.052);

  // leaf cluster at the end of the main twig
  {
    const zEnd = TW_Z1;
    const pEnd = V(twX(zEnd), twY(zEnd), zEnd);
    const dirs = [V(0.0, 0.18, 1), V(0.55, 0.12, 0.8), V(-0.55, 0.12, 0.8)];
    dirs.forEach((d, i) => {
      leaf(twigB, pEnd, d, (i - 1) * 0.4, 0.056 + i * 0.004, 0.012, leafMats[i % 3]);
    });
  }

  /* ------------------------------------------------------------------ body loft */
  const ANG = [0, 32, 62, 84, 100, 128, 156, 180, -156, -128, -100, -84, -62, -32].map(
    (d) => (d * Math.PI) / 180
  );
  const NP = ANG.length;

  // z, centre y, half-width, height above centre, depth below centre
  const KEYS: number[][] = [
    [0.137, 0.1045, 0.0035, 0.0055, 0.0055],
    [0.128, 0.1055, 0.0085, 0.0105, 0.0085],
    [0.112, 0.1075, 0.014, 0.0165, 0.0125],
    [0.092, 0.1105, 0.018, 0.022, 0.015],
    [0.074, 0.114, 0.0185, 0.0295, 0.0175],
    [0.058, 0.115, 0.0165, 0.034, 0.02],
    [0.044, 0.1085, 0.0185, 0.04, 0.0295],
    [0.025, 0.106, 0.0205, 0.045, 0.036],
    [0.0, 0.104, 0.0225, 0.048, 0.04],
    [-0.025, 0.103, 0.0225, 0.048, 0.0385],
    [-0.05, 0.101, 0.021, 0.043, 0.0335],
    [-0.07, 0.0995, 0.0185, 0.035, 0.027],
    [-0.09, 0.098, 0.0145, 0.026, 0.02],
  ];
  const crs = (p0: number, p1: number, p2: number, p3: number, t: number) =>
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

  interface Row {
    y: number;
    z: number;
    hw: number;
    ht: number;
    hb: number;
  }
  const rows: Row[] = [];
  const SUB = 4;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const p0 = KEYS[Math.max(0, i - 1)];
    const p1 = KEYS[i];
    const p2 = KEYS[i + 1];
    const p3 = KEYS[Math.min(KEYS.length - 1, i + 2)];
    for (let s = 0; s < SUB; s++) {
      const t = s / SUB;
      rows.push({
        z: lerp(p1[0], p2[0], t),
        y: crs(p0[1], p1[1], p2[1], p3[1], t),
        hw: crs(p0[2], p1[2], p2[2], p3[2], t),
        ht: crs(p0[3], p1[3], p2[3], p3[3], t),
        hb: crs(p0[4], p1[4], p2[4], p3[4], t),
      });
    }
  }
  const lk = KEYS[KEYS.length - 1];
  rows.push({ z: lk[0], y: lk[1], hw: lk[2], ht: lk[3], hb: lk[4] });
  const rumpIdx = rows.length - 1;
  const headEnd = rows.findIndex((r) => r.z < 0.062);

  // tail: short lead-in, then a tight logarithmic spiral in the YZ plane
  const ZC = -0.15;
  const R0 = 0.04;
  const BB = 0.1146;
  const Y_TOP = 0.088;
  const YC = Y_TOP - R0;
  const LEAD = 12;
  for (let i = 1; i <= LEAD; i++) {
    const f = i / LEAD;
    const sm = f * f * (3 - 2 * f);
    const hw = lerp(0.0145, 0.0144, f);
    rows.push({
      z: lerp(-0.09, ZC, f),
      y: lerp(0.098, Y_TOP, sm),
      hw,
      ht: hw * lerp(1.8, 1.08, sm),
      hb: hw * lerp(1.38, 1.0, sm),
    });
  }
  {
    let a = 0;
    const A_END = 4 * Math.PI;
    while (a < A_END - 1e-6) {
      const R = R0 * Math.exp(-BB * a);
      a = Math.min(A_END, a + clamp(0.007 / R, 0.1, 0.34));
      const Rn = R0 * Math.exp(-BB * a);
      const hw = Math.max(0.0032, 0.36 * Rn);
      rows.push({ y: YC + Rn * Math.cos(a), z: ZC - Rn * Math.sin(a), hw, ht: hw * 1.08, hb: hw });
    }
    const n = rows.length;
    const fade = [0.85, 0.65, 0.42];
    for (let i = 0; i < 3; i++) {
      const r = rows[n - 3 + i];
      r.hw *= fade[i];
      r.ht *= fade[i];
      r.hb *= fade[i];
    }
  }

  interface Ring {
    c: V3;
    T: V3;
    U: V3;
    hw: number;
    ht: number;
    hb: number;
    arc: number;
    pts: V3[];
    tiles: number;
  }
  const cs = rows.map((r) => V(0, r.y, r.z));
  const rings: Ring[] = [];
  {
    let arc = 0;
    for (let j = 0; j < rows.length; j++) {
      if (j > 0) arc += cs[j].distanceTo(cs[j - 1]);
      const a = cs[Math.max(0, j - 1)];
      const b = cs[Math.min(rows.length - 1, j + 1)];
      const T = b.clone().sub(a).normalize();
      const U = V(0, -T.z, T.y); // X cross T
      const row = rows[j];
      const pts = ANG.map((th) => {
        const sn = Math.sin(th);
        const cn = Math.cos(th);
        const sx = Math.sign(sn) * Math.pow(Math.abs(sn), 0.85);
        const cy = Math.sign(cn) * Math.pow(Math.abs(cn), 0.85);
        const px = row.hw * sx;
        const py = (cn >= 0 ? row.ht : row.hb) * cy;
        return cs[j].clone().addScaledVector(XAX, px).addScaledVector(U, py);
      });
      const perim = 2 * Math.PI * Math.sqrt((row.hw * row.hw + Math.pow((row.ht + row.hb) / 2, 2)) / 2);
      rings.push({
        c: cs[j],
        T,
        U,
        hw: row.hw,
        ht: row.ht,
        hb: row.hb,
        arc,
        pts,
        tiles: Math.max(1, Math.round(perim / 0.012)),
      });
    }
  }
  const totalArc = rings[rings.length - 1].arc;
  const arcRump = rings[rumpIdx].arc;
  const BAR_Z = [0.031, 0.008, -0.015, -0.038, -0.061, -0.083];

  const faceHex = (j: number, k: number): number => {
    const r0 = rings[j];
    const r1 = rings[j + 1];
    const arcM = (r0.arc + r1.arc) / 2;
    const s = arcM / totalArc;
    const zM = (r0.c.z + r1.c.z) / 2;
    const isTail = j >= rumpIdx;
    const arcT = arcM - arcRump;
    if (k >= 5 && k <= 8) return bellyHex(s);
    if (k === 3 || k === 10) {
      if ((!isTail && zM <= 0.047) || (isTail && arcT < 0.045)) return STRIPE;
    }
    if (!isTail) {
      const wide =
        k === 0 || k === 13 || k === 1 || k === 12
          ? 0.0058
          : k === 2 || k === 11 || k === 4 || k === 9
          ? 0.0042
          : 0;
      if (wide > 0 && zM < 0.05 && zM > -0.09) {
        for (const zc of BAR_Z) if (Math.abs(zM - zc) < wide) return s < 0.45 ? RED : CRIMSON;
      }
    } else if (arcT > 0.012) {
      const ph = (arcT - 0.012) / 0.026;
      if (ph - Math.floor(ph) < 0.34) return CRIMSON;
    }
    const ss = k === 0 || k === 13 ? s - 0.05 : k === 4 || k === 9 ? s + 0.025 : s;
    return bodyHex(ss);
  };

  // skin quads
  for (let j = 0; j < rings.length - 1; j++) {
    const A = rings[j];
    const B = rings[j + 1];
    const ref = A.c.clone().add(B.c).multiplyScalar(0.5);
    const v0 = A.arc / 0.012;
    const v1 = B.arc / 0.012;
    for (let k = 0; k < NP; k++) {
      const k2 = (k + 1) % NP;
      const m = skin(faceHex(j, k));
      const ua0 = (k / NP) * A.tiles;
      const ua1 = ((k + 1) / NP) * A.tiles;
      const ub0 = (k / NP) * B.tiles;
      const ub1 = ((k + 1) / NP) * B.tiles;
      cham.tri(m, A.pts[k], B.pts[k], A.pts[k2], ref, [ua0, v0, ub0, v1, ua1, v0]);
      cham.tri(m, B.pts[k], B.pts[k2], A.pts[k2], ref, [ub0, v1, ub1, v1, ua1, v0]);
    }
  }
  // snout cap
  {
    const r = rings[0];
    const capC = r.c.clone().addScaledVector(r.T, -0.003);
    for (let k = 0; k < NP; k++) {
      cham.tri(skin(faceHex(0, k)), r.pts[k], r.pts[(k + 1) % NP], capC, r.c);
    }
  }
  // tail tip cap
  {
    const n = rings.length - 1;
    const r = rings[n];
    const capC = r.c.clone().addScaledVector(r.T, 0.002);
    const tipM = skin(bodyHex(1));
    for (let k = 0; k < NP; k++) cham.tri(tipM, r.pts[k], r.pts[(k + 1) % NP], capC, r.c);
  }

  // thin decal strips lying on the skin
  const strip = (j0: number, j1: number, k: number, halfW: number, off: number, hex: number) => {
    const m = skin(hex);
    for (let j = j0; j < j1; j++) {
      const A = rings[j].pts[k];
      const B = rings[j + 1].pts[k];
      const nA = A.clone().sub(rings[j].c).normalize();
      const nB = B.clone().sub(rings[j + 1].c).normalize();
      const d = B.clone().sub(A);
      const wA = d.clone().cross(nA).normalize().multiplyScalar(halfW);
      const wB = d.clone().cross(nB).normalize().multiplyScalar(halfW);
      const a1 = A.clone().add(wA).addScaledVector(nA, off);
      const a2 = A.clone().sub(wA).addScaledVector(nA, off);
      const b1 = B.clone().add(wB).addScaledVector(nB, off);
      const b2 = B.clone().sub(wB).addScaledVector(nB, off);
      const ref = rings[j].c.clone().add(rings[j + 1].c).multiplyScalar(0.5);
      cham.tri(m, a1, b1, a2, ref);
      cham.tri(m, b1, b2, a2, ref);
    }
  };
  // mouth line
  strip(1, headEnd, 5, 0.0009, 0.0005, 0x0f6a72);
  strip(1, headEnd, 9, 0.0009, 0.0005, 0x0f6a72);

  /* ------------------------------------------------------------------ spines */
  const spineMat = mat(0xf2e8b0, { rough: 0.6 });
  for (let j = 0; j < rings.length; j++) {
    const r = rings[j];
    const inBody = j > headEnd + 1 && j <= rumpIdx;
    const tailT = j > rumpIdx ? (r.arc - arcRump) / (totalArc - arcRump) : 0;
    const inTail = j > rumpIdx && tailT < 0.28;
    if (!(inBody || inTail)) continue;
    if (j % 2 !== 0) continue;
    const size = inBody ? 1 : lerp(0.85, 0.35, tailT / 0.28);
    const dir = r.U.clone().addScaledVector(r.T, 0.45).normalize();
    const base = r.pts[0].clone().addScaledVector(r.U, -0.001);
    cham.cone(base, dir, 0.0026 * size, 0.0078 * size, 4, spineMat);
  }
  for (let j = 4; j <= rumpIdx; j++) {
    if (j % 2 !== 0) continue;
    const r = rings[j];
    const dir = r.U.clone().multiplyScalar(-1).addScaledVector(r.T, 0.4).normalize();
    const base = r.pts[7].clone().addScaledVector(r.U, 0.001);
    cham.cone(base, dir, 0.002, 0.0055, 4, spineMat);
  }

  /* ------------------------------------------------------------------ head: crest, brows, nose */
  const bladeGeo = (pts: number[][], depth: number): THREE.BufferGeometry => {
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
    g.rotateY(-Math.PI / 2);
    g.translate(depth / 2, 0, 0);
    return g;
  };
  const casquePts = [
    [0.108, 0.117],
    [0.101, 0.131],
    [0.094, 0.139],
    [0.09, 0.1365],
    [0.083, 0.148],
    [0.079, 0.1445],
    [0.071, 0.158],
    [0.067, 0.1545],
    [0.058, 0.17],
    [0.0545, 0.1665],
    [0.046, 0.1765],
    [0.04, 0.1595],
    [0.0345, 0.1545],
    [0.03, 0.142],
    [0.06, 0.125],
  ];
  const blade = bladeGeo(casquePts, 0.006);
  cham.emit(blade, skin(bodyHex(0.05)));
  // teeth on the ridge crest
  for (const idx of [2, 4, 6, 8, 10]) {
    const [zz, yy] = casquePts[idx];
    cham.cone(V(0, yy - 0.0008, zz), V(0, 1, -0.35), 0.0022, 0.005, 4, spineMat);
  }
  {
    const pivot = V(0, 0.138, 0.07);
    const sideMat = mat(0x7be6d4, { rough: 0.55 });
    for (const sd of [1, -1]) {
      const m = new THREE.Matrix4()
        .makeTranslation(sd * 0.0075, 0, 0)
        .multiply(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
        .multiply(new THREE.Matrix4().makeRotationZ(-sd * 0.55))
        .multiply(new THREE.Matrix4().makeScale(1, 0.72, 0.8))
        .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
      cham.emit(blade, sideMat, m);
    }
    // brow ridges along the upper corners of the head
    for (const k of [1, 13]) {
      for (let j = 2; j <= headEnd + 1; j++) {
        const a = rings[j].pts[k].clone().addScaledVector(rings[j].pts[k].clone().sub(rings[j].c).normalize(), 0.0012);
        const b = rings[j + 1].pts[k]
          .clone()
          .addScaledVector(rings[j + 1].pts[k].clone().sub(rings[j + 1].c).normalize(), 0.0012);
        cham.limb(a, b, 0.0022, 0.0022, 4, sideMat);
      }
    }
    // nose bumps and nostrils
    for (const sd of [1, -1]) {
      cham.sphere(V(sd * 0.0045, 0.1135, 0.1255), 0.0034, 0.0032, 0.0036, sideMat, 0);
      cham.box(V(sd * 0.0047, 0.1157, 0.1278), 0.0015, 0.0012, 0.0016, mat(0x0b0b0b, { rough: 0.5 }));
    }
  }

  /* ------------------------------------------------------------------ turret eyes */
  const lidMat = skin(bodyHex(0.08));
  const rimMat = mat(0x7be6d4, { rough: 0.55 });
  const irisMat = mat(0xe8a923, { rough: 0.35 });
  const pupilMat = mat(0x0b0b0b, { rough: 0.3 });
  const glintMat = mat(STRIPE, { rough: 0.3 });
  const eye = (side: number, look: V3) => {
    const c = V(side * 0.0215, 0.1185, 0.088);
    const R = 0.0125;
    const dir = look.clone().normalize();
    cham.sphere(c, R, R, R, lidMat, 1);
    const ringQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
    cham.emit(
      new THREE.TorusGeometry(0.0118, 0.0015, 4, 8),
      rimMat,
      xf(c.clone().add(V(-side * 0.0042, 0, 0)), ringQ)
    );
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
    const at = (d: number) => c.clone().addScaledVector(dir, d);
    cham.emit(new THREE.CylinderGeometry(0.0062, 0.0082, 0.0032, 8), rimMat, xf(at(R - 0.0001), q));
    cham.emit(new THREE.CylinderGeometry(0.0046, 0.0046, 0.0006, 8), irisMat, xf(at(R + 0.0018), q));
    cham.emit(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0006, 8), pupilMat, xf(at(R + 0.0023), q));
    const sdv = new THREE.Vector3().crossVectors(UP, dir).normalize();
    const upv = new THREE.Vector3().crossVectors(dir, sdv).normalize();
    cham.sphere(at(R + 0.0027).addScaledVector(sdv, 0.0011).addScaledVector(upv, 0.0011), 0.0007, 0.0007, 0.0007, glintMat, 0);
  };
  eye(1, V(0.62, 0.1, 0.78)); // left eye scans forward
  eye(-1, V(-0.93, 0.12, -0.3)); // right eye looks sideways and back

  /* ------------------------------------------------------------------ legs and feet */
  const clawMat = mat(0x3a2a20, { rough: 0.5 });

  function foot(side: number, fz: number, lift: number, open: number, m: Mat): V3 {
    const tw = twig(fz);
    const cx = tw.x;
    const cy = tw.y + lift;
    const R = tw.r + 0.0034;
    const bundles = [
      { dir: side, zc: fz + 0.0048, w: 0.0138, claws: 3, wrap: 2.85 },
      { dir: -side, zc: fz - 0.0052, w: 0.0098, claws: 2, wrap: 2.6 },
    ];
    const SEG = 5;
    for (const b of bundles) {
      const wrap = b.wrap * (1 - 0.42 * open);
      let lastArc = 0.006;
      for (let i = 0; i < SEG; i++) {
        const p0 = (i / SEG) * wrap;
        const p1 = ((i + 1) / SEG) * wrap;
        const pc = (p0 + p1) / 2;
        const f = i / (SEG - 1);
        const thick = lerp(0.0068, 0.0046, f);
        lastArc = R * (p1 - p0) * 1.1 + 0.0006;
        const pos = V(cx + b.dir * Math.sin(pc) * R, cy + Math.cos(pc) * R, b.zc);
        const q = new THREE.Quaternion().setFromAxisAngle(ZAX, -b.dir * pc);
        cham.box(pos, lastArc, thick, b.w * lerp(1, 0.84, f), m, q);
      }
      const pe = wrap;
      const ex = cx + b.dir * Math.sin(pe) * R;
      const ey = cy + Math.cos(pe) * R;
      const tan = V(b.dir * Math.cos(pe), -Math.sin(pe), 0);
      const inw = V(-b.dir * Math.sin(pe), -Math.cos(pe), 0);
      const cd = tan.clone().addScaledVector(inw, 0.6).normalize();
      for (let c = 0; c < b.claws; c++) {
        const zz = b.zc + (c - (b.claws - 1) / 2) * (b.w / b.claws) * 0.95;
        const base = V(ex, ey, zz).addScaledVector(tan, lastArc * 0.35);
        cham.cone(base, cd, 0.0016, 0.006, 4, clawMat);
      }
    }
    cham.box(V(cx, cy + R, fz + 0.0006), 0.0105, 0.0072, 0.0216, m);
    return V(cx, cy + R + 0.0036, fz);
  }

  function leg(
    side: number,
    sz: number,
    sy: number,
