```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed pufferfish ball: creamy yellow skin with brown leopard rosettes fading to a white belly, short backswept spines all over, big worried round eyes with drooping lids and raised brows, a tiny puckered pout, fluttering fan-shaped side fins, a stubby banded fan tail and a trail of rising bubbles.",
};

type V3 = THREE.Vector3;
const V = THREE.Vector3;
const DEG = Math.PI / 180;
const UP = new V(0, 1, 0);

function sph(az: number, el: number): V3 {
  return new V(
    Math.sin(az * DEG) * Math.cos(el * DEG),
    Math.sin(el * DEG),
    Math.cos(az * DEG) * Math.cos(el * DEG)
  );
}
function vec(a: any): V3 {
  return Array.isArray(a) ? new V(a[0], a[1], a[2]) : (a as V3).clone();
}
function angle(a: V3, b: V3): number {
  return Math.acos(THREE.MathUtils.clamp(a.dot(b) / (a.length() * b.length()), -1, 1));
}
function perpFallback(axis: V3): V3 {
  const t = Math.abs(axis.x) < 0.9 ? new V(1, 0, 0) : new V(0, 0, 1);
  return t.addScaledVector(axis, -t.dot(axis));
}
// geometry +Y -> yDir, geometry +Z -> zHint (orthogonalised)
function basisYZ(yDir: any, zHint: any): THREE.Matrix4 {
  const y = vec(yDir).normalize();
  let z = vec(zHint);
  z.addScaledVector(y, -z.dot(y));
  if (z.lengthSq() < 1e-8) z = perpFallback(y);
  z.normalize();
  const x = new V().crossVectors(y, z);
  return new THREE.Matrix4().makeBasis(x, y, z);
}
// geometry +Z -> zDir, geometry +Y -> yHint (orthogonalised)
function basisZY(zDir: any, yHint: any): THREE.Matrix4 {
  const z = vec(zDir).normalize();
  let y = vec(yHint);
  y.addScaledVector(z, -y.dot(z));
  if (y.lengthSq() < 1e-8) y = perpFallback(z);
  y.normalize();
  const x = new V().crossVectors(y, z);
  return new THREE.Matrix4().makeBasis(x, y, z);
}

function fanShape(len: number, half: number, base: number, n: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-base, 0);
  const steps = n * 2;
  for (let i = 0; i <= steps; i++) {
    const a = -half + (2 * half * i) / steps;
    const r = i % 2 === 0 ? len : len * 0.86;
    s.lineTo(r * Math.sin(a), r * Math.cos(a));
  }
  s.lineTo(base, 0);
  s.lineTo(-base, 0);
  return s;
}
function annulusShape(r1: number, r2: number, half: number, steps: number): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i <= steps; i++) {
    const a = -half + (2 * half * i) / steps;
    if (i === 0) s.moveTo(r2 * Math.sin(a), r2 * Math.cos(a));
    else s.lineTo(r2 * Math.sin(a), r2 * Math.cos(a));
  }
  for (let i = steps; i >= 0; i--) {
    const a = -half + (2 * half * i) / steps;
    s.lineTo(r1 * Math.sin(a), r1 * Math.cos(a));
  }
  return s;
}

export default function build() {
  const b = createBuilder({ name: "pufferfish" });

  const r0: any = (rng as any)(4242);
  const rand: () => number =
    typeof r0 === "function"
      ? () => r0()
      : r0 && typeof r0.next === "function"
      ? () => r0.next()
      : r0 && typeof r0.float === "function"
      ? () => r0.float()
      : () => r0.random();

  const R = 0.14;
  const SIDES = [1, -1];

  // ---------- feature directions (from body centre) ----------
  const eyeN = (s: number) => sph(s * 32, 16);
  const cheekN = (s: number) => sph(s * 48, -12);
  const finN = (s: number) => sph(s * 100, -6);
  const gillN = (s: number) => sph(s * 84, 2);
  const browN = (s: number) => sph(s * 30, 43);
  const nostrilN = (s: number) => sph(s * 15, 3);
  const mouthN = sph(0, -14);
  const tailN = new V(0, 0, -1);
  const dorsalN = sph(180, 38);
  const analN = sph(180, -38);
  const sweatN = sph(-60, 50);

  const avoidSpike: { n: V3; a: number }[] = [
    { n: mouthN, a: 0.25 },
    { n: tailN, a: 0.34 },
    { n: dorsalN, a: 0.18 },
    { n: analN, a: 0.18 },
    { n: sweatN, a: 0.11 },
  ];
  const avoidSpot: { n: V3; a: number }[] = [
    { n: mouthN, a: 0.3 },
    { n: tailN, a: 0.28 },
    { n: dorsalN, a: 0.14 },
    { n: analN, a: 0.14 },
    { n: sweatN, a: 0.1 },
  ];
  for (const s of SIDES) {
    avoidSpike.push(
      { n: eyeN(s), a: 0.52 },
      { n: cheekN(s), a: 0.12 },
      { n: finN(s), a: 0.22 },
      { n: gillN(s), a: 0.09 },
      { n: browN(s), a: 0.16 },
      { n: nostrilN(s), a: 0.07 }
    );
    avoidSpot.push(
      { n: eyeN(s), a: 0.46 },
      { n: cheekN(s), a: 0.16 },
      { n: finN(s), a: 0.2 },
      { n: gillN(s), a: 0.1 },
      { n: browN(s), a: 0.14 },
      { n: nostrilN(s), a: 0.1 }
    );
  }

  // ---------- spines (computed relative to centre, to find the floor) ----------
  type Spike = { n: V3; dir: V3; len: number; rb: number };
  const spikes: Spike[] = [];
  const N = 210;
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const yy = 1 - (2 * (i + 0.5)) / N;
    const rr = Math.sqrt(1 - yy * yy);
    const ph = i * GA;
    const n = new V(rr * Math.cos(ph), yy, rr * Math.sin(ph));
    n.x += (rand() - 0.5) * 0.05;
    n.y += (rand() - 0.5) * 0.05;
    n.z += (rand() - 0.5) * 0.05;
    n.normalize();
    if (avoidSpike.some((f) => angle(n, f.n) < f.a)) continue;
    const dir = n
      .clone()
      .add(new V((rand() - 0.5) * 0.12, (rand() - 0.5) * 0.12, -0.28))
      .normalize();
    const len = 0.025 + rand() * 0.009 - (n.y < -0.5 ? 0.004 : 0);
    spikes.push({ n, dir, len, rb: 0.0062 });
  }
  let minY = -R;
  for (const s of spikes) minY = Math.min(minY, s.n.y * (R - 0.002) + s.dir.y * s.len);
  const C = new V(0, -minY - 0.0015, 0);
  const P = (n: V3, r: number) => C.clone().addScaledVector(n, r);

  // ---------- skeleton ----------
  const body: any = b.joint("body", { at: C.clone() });
  const jaw: any = b.joint("jaw", { at: P(mouthN, R - 0.025), parent: body });
  const tail1: any = b.joint("tail1", { at: P(tailN, R - 0.02), parent: body });
  const tail2: any = b.joint("tail2", { at: P(tailN, R + 0.026), parent: tail1 });
  const dorsalJ: any = b.joint("dorsalFin", { at: P(dorsalN, R), parent: body });
  const analJ: any = b.joint("analFin", { at: P(analN, R), parent: body });
  const mouthPt = P(mouthN, R);
  const bubblesJ: any = b.joint("bubbles", {
    at: mouthPt.clone().add(new V(0, 0.12, 0.05)),
    parent: body,
  });

  const part = (g: THREE.BufferGeometry, color: string, at: V3, bone: any) =>
    b.part(g, color, { at: at.clone(), bone });

  const rod = (a: V3, c: V3, r: number, color: string, bone: any) => {
    const d = c.clone().sub(a);
    const g = new THREE.CapsuleGeometry(r, Math.max(d.length(), 1e-4), 2, 6);
    g.applyMatrix4(basisYZ(d, [0, 0, 1]));
    part(g, color, a.clone().add(c).multiplyScalar(0.5), bone);
  };

  // cap hugging a sphere of radius rad centred at `center`, around direction n
  const cap = (center: V3, rad: number, ang: number, n: V3, color: string, bone: any, segs = 8, rows = 2) => {
    const g = new THREE.SphereGeometry(rad, segs, rows, 0, Math.PI * 2, 0, ang);
    g.applyMatrix4(basisYZ(n, UP));
    part(g, color, center, bone);
  };

  // ---------- body: banded ball fading from yellow to white ----------
  const ROWS = 20;
  const bands: [number, number, string][] = [
    [0, 8, "#f2cd5e"],
    [8, 10, "#f5da88"],
    [10, 12, "#f8e9bf"],
    [12, 20, "#fdf9f0"],
  ];
  for (const [r1, r2, col] of bands) {
    const g = new THREE.SphereGeometry(
      R, 32, r2 - r1, 0, Math.PI * 2, (r1 * Math.PI) / ROWS, ((r2 - r1) * Math.PI) / ROWS
    );
    part(g, col, C, body);
  }

  // ---------- leopard spots & rosettes ----------
  const spotCap = (n: V3, ang: number, color: string, lift: number) =>
    cap(C, R * lift, ang, n, color, body, 8, 2);
  const sites: V3[] = [];
  for (let k = 0; k < 700 && sites.length < 40; k++) {
    const y = -0.3 + 1.3 * rand();
    const ph = rand() * Math.PI * 2;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const n = new V(rr * Math.cos(ph), y, rr * Math.sin(ph));
    const fade = (y + 0.3) / 1.3;
    if (rand() > 0.25 + 0.75 * fade) continue;
    if (avoidSpot.some((f) => angle(n, f.n) < f.a)) continue;
    if (sites.some((s) => angle(n, s) < 0.21)) continue;
    sites.push(n);

    const t1 = new V().crossVectors(n, Math.abs(n.y) < 0.95 ? UP : new V(1, 0, 0)).normalize();
    const t2 = new V().crossVectors(n, t1);
    const off = (phi: number, d: number) =>
      n
        .clone()
        .multiplyScalar(Math.cos(d))
        .addScaledVector(t1, Math.cos(phi) * Math.sin(d))
        .addScaledVector(t2, Math.sin(phi) * Math.sin(d))
        .normalize();
    const size = (0.035 + 0.04 * fade) * (0.8 + 0.4 * rand());
    const dark = fade > 0.7 ? "#5a371b" : fade > 0.4 ? "#74491f" : "#9c6b36";
    if (fade < 0.35 || rand() < 0.4) {
      const blobs = 1 + Math.floor(rand() * 3);
      spotCap(n, size * 0.7, dark, 1.004);
      for (let j = 0; j < blobs - 1; j++)
        spotCap(off(rand() * Math.PI * 2, size * 0.45), size * (0.4 + 0.2 * rand()), dark, 1.004);
    } else {
      spotCap(n, size * 0.85, fade > 0.6 ? "#b5813d" : "#c49450", 1.004);
      const m = 5;
      const skip = Math.floor(rand() * m);
      const ph0 = rand() * Math.PI * 2;
      for (let j = 0; j < m; j++) {
        if (j === skip) continue;
        const phi = ph0 + (j * 2 * Math.PI) / m + (rand() - 0.5) * 0.3;
        const rs = size * (0.3 + 0.1 * rand());
        spotCap(off(phi, size * 0.95), rs, dark, 1.007);
        spotCap(off(phi + 0.38, size * 0.95), rs * 0.8, dark, 1.007);
      }
    }
  }

  // ---------- spines ----------
  for (const s of spikes) {
    const y = s.n.y;
    const shaft = y > 0.45 ? "#d4ab52" : y > 0.1 ? "#e2c26c" : y > -0.3 ? "#f0e2b8" : "#fbf6ea";
    const tipCol = y > 0.45 ? "#6b4423" : y > 0.1 ? "#9a6a35" : null;
    const base = P(s.n, R - 0.002);
    const M = basisYZ(s.dir, UP);
    const g = new THREE.ConeGeometry(s.rb, s.len, 4);
    g.translate(0, s.len / 2, 0);
    g.applyMatrix4(M);
    part(g, shaft, base, body);
    if (tipCol) {
      const th = s.len * 0.42;
      const tg = new THREE.ConeGeometry(s.rb * 0.45, th, 4);
      tg.translate(0, th / 2, 0);
      tg.applyMatrix4(M);
      part(tg, tipCol, base.clone().addScaledVector(s.dir, s.len - th), body);
    }
  }

  // ---------- fan fins ----------
  type FanOpts = {
    len: number; half: number; base: number; n: number; t: number;
    membrane: string; ray: string; inner?: string;
    band?: [number, number]; bandColor?: string;
    dots?: [number, number][]; dotColor?: string;
  };
  const fan = (origin: V3, yDir: V3, zHint: V3, o: FanOpts, bone: any) => {
    const M = basisYZ(yDir, zHint);
    const add = (g: THREE.BufferGeometry, color: string) => {
      g.applyMatrix4(M);
      part(g, color, origin, bone);
    };
    const ext = (shape: THREE.Shape, depth: number) => {
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 2 });
      g.translate(0, 0, -depth / 2);
      return g;
    };
    add(ext(fanShape(o.len, o.half, o.base, o.n), o.t), o.membrane);
    if (o.inner) add(ext(fanShape(o.len * 0.36, o.half, o.base * 1.05, 1), o.t * 1.5), o.inner);
    if (o.band && o.bandColor)
      add(ext(annulusShape(o.len * o.band[0], o.len * o.band[1], o.half * 0.97, 10), o.t * 1.5), o.bandColor);
    const steps = o.n * 2;
    for (let i = 0; i <= steps; i += 2) {
      const a = -o.half + (2 * o.half * i) / steps;
      const rl = o.len * 0.9;
      const g = new THREE.BoxGeometry(0.0024, rl, o.t * 1.9);
      g.translate(0, rl / 2 + 0.002, 0);
      g.rotateZ(-a);
      add(g, o.ray);
    }
    for (const [sx, sy] of o.dots || []) {
      const g = new THREE.CylinderGeometry(0.0042, 0.0042, o.t * 1.5 + 0.002, 7);
      g.rotateX(Math.PI / 2);
      g.translate(sx, sy, 0);
      add(g, o.dotColor || "#6b4423");
    }
  };

  // pectoral fins, extended and fluttering out to the sides
  for (const s of SIDES) {
    const nF = finN(s);
    const fin: any = b.joint(s > 0 ? "finL" : "finR", { at: P(nF, R), parent: body });
    const dirF = nF.clone().add(new V(0, 0.05, -0.55)).normalize();
    const faceN = new V().crossVectors(dirF, UP).normalize();
    const nub = new THREE.SphereGeometry(0.014, 8, 6);
    nub.scale(1, 0.7, 1);
    nub.applyMatrix4(basisYZ(nF, UP));
    part(nub, "#ebbb55", P(nF, R - 0.003), fin);
    fan(P(nF, R - 0.006), dirF, faceN, {
      len: 0.056, half: 48 * DEG, base: 0.009, n: 4, t: 0.003,
      membrane: "#f8e199", ray: "#d9a441", inner: "#ebbb55",
    }, fin);
  }

  // small dorsal and anal fins
  fan(P(dorsalN, R - 0.006), dorsalN.clone().add(new V(0, 0, -0.6)).normalize(), new V(1, 0, 0), {
    len: 0.04, half: 34 * DEG, base: 0.008, n: 3, t: 0.003, membrane: "#f4d47c", ray: "#c58b35",
  }, dorsalJ);
  fan(P(analN, R - 0.006), analN.clone().add(new V(0, 0, -0.6)).normalize(), new V(1, 0, 0), {
    len: 0.034, half: 34 * DEG, base: 0.008, n: 3, t: 0.003, membrane: "#f8e8b8", ray: "#d9b46a",
  }, analJ);

  // stubby tail: peduncle + banded fan
  {
    const a = P(tailN, R - 0.03);
    const c = P(tailN, R + 0.03);
    const g = new THREE.CylinderGeometry(0.019, 0.034, a.distanceTo(c), 10);
    g.applyMatrix4(basisYZ(c.clone().sub(a), UP));
    part(g, "#f0cb62", a.clone().add(c).multiplyScalar(0.5), tail1);
    fan(P(tailN, R + 0.026), tailN, new V(1, 0, 0), {
      len: 0.08, half: 55 * DEG, base: 0.016, n: 5, t: 0.004,
      membrane: "#f4d47c", ray: "#c58b35", band: [0.6, 0.72], bandColor: "#7a4e26",
      dots: [[-0.012, 0.022], [0.012, 0.024], [0, 0.036], [-0.025, 0.036], [0.025, 0.038]],
      dotColor: "#6b4423",
    }, tail2);
  }

  // ---------- eyes: big, round and worried ----------
  const re = 0.05;
  const ed = R - 0.018;
  for (const s of SIDES) {
    const nE = eyeN(s);
    const E = P(nE, ed);
    const eye: any = b.joint(s > 0 ? "eyeL" : "eyeR", { at: E, parent: body });
    const outward = new V(s, 0, 0);
    const d = nE.clone().multiplyScalar(0.55).add(new V(0, 0.06, 0.85)).normalize();
    const upPerp = UP.clone().addScaledVector(d, -UP.dot(d)).normalize();

    part(new THREE.SphereGeometry(re, 20, 14), "#fffdf5", E, eye);
    cap(E, re * 1.004, 0.6, d, "#1f5f59", eye, 16, 3);
    cap(E, re * 1.009, 0.5, d, "#3fae9f", eye, 16, 3);
    cap(E, re * 1.012, 0.33, d, "#7fd3c2", eye, 14, 2);
    cap(E, re * 1.016, 0.2, d, "#121418", eye, 12, 2);
    const h1 = d.clone().addScaledVector(upPerp, 0.5).addScaledVector(outward, -0.12).normalize();
    part(new THREE.SphereGeometry(re * 0.17, 8, 6), "#ffffff", E.clone().addScaledVector(h1, re), eye);
    const h2 = d.clone().addScaledVector(upPerp, -0.35).addScaledVector(outward, 0.3).normalize();
    part(new THREE.SphereGeometry(re * 0.08, 6, 5), "#ffffff", E.clone().addScaledVector(h2, re), eye);

    // drooping upper lid (lower on the outer side) with a brown lash line
    const lidDir = upPerp.clone().addScaledVector(outward, 0.4).addScaledVector(d, -0.05).normalize();
    const lidR = re * 1.07;
    const lidA = 0.98;
    cap(E, lidR, lidA, lidDir, "#e9c257", eye, 18, 4);
    const lash = new THREE.TorusGeometry(lidR * Math.sin(lidA), 0.0034, 5, 22);
    lash.applyMatrix4(basisZY(lidDir, UP));
    part(lash, "#7a4e26", E.clone().addScaledVector(lidDir, lidR * Math.cos(lidA)), eye);

    // socket rim where the eye meets the skin
    const x = (ed * ed + R * R - re * re) / (2 * ed);
    const rc = Math.sqrt(Math.max(R * R - x * x, 1e-6));
    const sock = new THREE.TorusGeometry(rc, 0.0075, 6, 24);
    sock.applyMatrix4(basisZY(nE, UP));
    part(sock, "#e4b84a", P(nE, x), body);

    // worried brow: inner end raised
    const b1 = P(sph(s * 13, 46), R + 0.004);
    const b2 = P(sph(s * 29, 44), R + 0.004);
    const b3 = P(sph(s * 47, 37), R + 0.004);
    rod(b1, b2, 0.0072, "#7a4e26", body);
    rod(b2, b3, 0.0068, "#7a4e26", body);

    // cheek blush, nostril, gill slit
    cap(C, R * 1.004, 0.11, cheekN(s), "#f6a58f", body, 10, 2);
    cap(C, R * 1.006, 0.022, nostrilN(s), "#8a5a2b", body, 6, 1);
    const g1 = P(sph(s * 85, 12), R + 0.001);
    const g2 = P(sph(s * 82, 2), R + 0.001);
    const g3 = P(sph(s * 85, -9), R + 0.001);
    rod(g1, g2, 0.0035, "#b98a33", body);
    rod(g2, g3, 0.0035, "#b98a33", body);
  }

  // ---------- tiny puckered pout (split upper / lower lip) ----------
  {
    const at = P(mouthN, R + 0.003);
    const M = basisZY(mouthN, UP);
    const upper = new THREE.TorusGeometry(0.013, 0.0072, 6, 8, Math.PI);
    upper.applyMatrix4(M);
    part(upper, "#f19a80", at, body);
    const lower = new THREE.TorusGeometry(0.013, 0.0078, 6, 8, Math.PI);
    lower.rotateZ(Math.PI);
    lower.applyMatrix4(M);
    part(lower, "#ee8f76", at, jaw);
    const hole = new THREE.SphereGeometry(0.0095, 8, 6);
    hole.scale(1, 0.85, 0.6);
    hole.applyMatrix4(M);
    part(hole, "#4a1f24", P(mouthN, R + 0.001), body);
  }

  // ---------- nervous sweat drop ----------
  {
    const center = P(sweatN, R + 0.012);
    const dS = UP.clone().addScaledVector(sweatN, 0.4).normalize();
    const M = basisYZ(dS, [0, 0, 1]);
    const ball = new THREE.SphereGeometry(0.0095, 10, 8);
    ball.applyMatrix4(M);
    part(ball, "#a8dcf2", center, body);
    const tip = new THREE.ConeGeometry(0.0082, 0.017, 10);
    tip.translate(0, 0.0105, 0);
    tip.applyMatrix4(M);
    part(tip, "#a8dcf2", center, body);
    const hl = sweatN.clone().addScaledVector(dS, 0.6).normalize();
    part(new THREE.SphereGeometry(0.0028, 6, 5), "#ffffff", center.clone().addScaledVector(hl, 0.0075), body);
  }

  // ---------- rising bubbles ----------
  const bubbles: [number, number, number, number][] = [
    [0.006, 0.022, 0.03, 0.007],
    [-0.011, 0.065, 0.048, 0.0095],
    [0.013, 0.12, 0.058, 0.012],
    [-0.006, 0.19, 0.055, 0.016],
    [0.017, 0.265, 0.045, 0.011],
    [-0.014, 0.32, 0.04, 0.007],
  ];
  const hiA = new V(-0.4, 0.5, 0.6).normalize();
  const hiB = new V(0.45, -0.4, 0.6).normalize();
  for (const [x, y, z, r] of bubbles) {
    const c = mouthPt.clone().add(new V(x, y, z));
    part(new THREE.IcosahedronGeometry(r, 1), "#c6ecf7", c, bubblesJ);
    part(new THREE.SphereGeometry(r * 0.28, 6, 5), "#ffffff", c.clone().addScaledVector(hiA, r * 0.66), bubblesJ);
    part(new THREE.SphereGeometry(r * 0.13, 5, 4), "#ffffff", c.clone().addScaledVector(hiB, r * 0.8), bubblesJ);
  }

  return b.root;
}
```