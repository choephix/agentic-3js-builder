```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized coral-orange seahorse built from blocky primitives: segmented bony rings with dorsal knobs, a cream brood pouch with plate ridges, a tube snout with an opening jaw, a crown coronet, big glossy eyes and teal fan fins. It stands upright on its curled tail.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const R: any = rng(7);
  const rand: () => number = typeof R === "function" ? R : () => R.next();

  const V = (a: number[] | THREE.Vector3) =>
    a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
  const last = (c: any, fb: any) =>
    c && Array.isArray(c.joints) && c.joints.length ? c.joints[c.joints.length - 1] : fb;

  const C = {
    body: "#f07a3a",
    bodyLight: "#ff9f55",
    ridge: "#b8461f",
    cream: "#ffe0a3",
    plate: "#f2b86e",
    spot: "#fff3dc",
    fin: "#4fd1c5",
    finRay: "#1f8f8a",
    eyeW: "#fffaf0",
    iris: "#1e6f8a",
    pupil: "#14121f",
    lip: "#8f3418",
    crown: "#ffd166",
  };

  // ---------- skeleton ----------
  const hipsP = [0, 0.11, 0];
  const hips = b.joint("hips", { at: hipsP });

  const tailPts = [
    [0, 0.104, -0.003],
    [0, 0.08, -0.012],
    [0, 0.05, -0.016],
    [0, 0.025, -0.01],
    [0, 0.009, 0.004],
    [0, 0.0045, 0.019],
    [0, 0.011, 0.031],
  ];
  const tail = b.chain("tail", tailPts, { parent: hips, role: "tail", count: 8 } as any);

  const spinePts = [
    [0, 0.118, 0],
    [0, 0.15, -0.004],
    [0, 0.185, -0.012],
  ];
  const spine = b.chain("spine", spinePts, { parent: hips, role: "spine", count: 2 } as any);

  const neckPts = [
    [0, 0.19, -0.012],
    [0, 0.205, -0.012],
    [0, 0.222, -0.004],
  ];
  const neck = b.chain("neck", neckPts, { parent: last(spine, hips), role: "neck", count: 2 } as any);
  const neckEnd = last(neck, last(spine, hips));

  const headC = [0, 0.233, 0.004];
  const snoutTip = [0, 0.2215, 0.058];
  const head = b.joint("head", { at: headC, parent: neckEnd, aim: snoutTip });
  const jawHinge = [0, 0.2205, 0.053];
  const jaw = b.joint("jaw", { at: jawHinge, parent: head, aim: [0, 0.218, 0.064] });

  const finC = [0, 0.142, -0.018];
  const dorsalFin = b.joint("dorsalFin", { at: finC, parent: hips, aim: [0, 0.142, -0.035] });
  const pecL = b.joint("pectoralL", { at: [0.008, 0.215, -0.01], parent: neckEnd, aim: [0.02, 0.215, -0.01] });
  const pecR = b.joint("pectoralR", { at: [-0.008, 0.215, -0.01], parent: neckEnd, aim: [-0.02, 0.215, -0.01] });

  // ---------- helpers ----------
  const seg = (a: any, c: any, r0: number, r1: number, color: string, radial = 7, bone?: any) => {
    const A = V(a), B = V(c);
    const len = A.distanceTo(B) * 1.06;
    const geo = new THREE.CylinderGeometry(r1, r0, len, radial);
    const opts: any = { at: A.clone().add(B).multiplyScalar(0.5), aim: B };
    if (bone) opts.bone = bone;
    return b.part(geo, color, opts);
  };
  const ring = (at: any, dir: THREE.Vector3, r: number, tube: number, color: string, bone?: any) => {
    const geo = new THREE.TorusGeometry(r, tube, 4, 9);
    geo.rotateX(Math.PI / 2);
    const P = V(at);
    const opts: any = { at: P, aim: P.clone().add(dir.clone().normalize()) };
    if (bone) opts.bone = bone;
    return b.part(geo, color, opts);
  };
  const spike = (base: any, dir: THREE.Vector3, len: number, r: number, color: string, bone?: any) => {
    const B = V(base), d = dir.clone().normalize();
    const geo = new THREE.ConeGeometry(r, len, 5);
    const opts: any = { at: B.clone().addScaledVector(d, len / 2), aim: B.clone().addScaledVector(d, len) };
    if (bone) opts.bone = bone;
    return b.part(geo, color, opts);
  };
  const ball = (at: any, r: number, color: string, bone?: any, scale?: number[], ws = 8, hs = 6) => {
    const opts: any = { at: V(at) };
    if (bone) opts.bone = bone;
    if (scale) opts.scale = scale;
    return b.part(new THREE.SphereGeometry(r, ws, hs), color, opts);
  };

  // ---------- segmented body (tail tip -> neck top) ----------
  const full = [...tailPts.slice().reverse(), ...spinePts.slice(1), ...neckPts.slice(1)].map(V);
  const curve = new THREE.CatmullRomCurve3(full);
  const N = 34;
  const samples = curve.getSpacedPoints(N);
  const keysT = [0, 0.3, 0.55, 0.68, 0.8, 0.92, 1];
  const keysR = [0.0035, 0.007, 0.011, 0.0175, 0.016, 0.0105, 0.009];
  const rad = (t: number) => {
    for (let i = 0; i < keysT.length - 1; i++) {
      if (t <= keysT[i + 1]) {
        const u = (t - keysT[i]) / (keysT[i + 1] - keysT[i]);
        return keysR[i] + (keysR[i + 1] - keysR[i]) * u;
      }
    }
    return keysR[keysR.length - 1];
  };
  const X = new THREE.Vector3(1, 0, 0);

  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N;
    const color = Math.floor(i / 2) % 3 === 2 ? C.bodyLight : C.body;
    seg(samples[i], samples[i + 1], rad(t0), rad(t1), color, 7);
  }
  for (let i = 1; i < N; i++) {
    const t = i / N;
    const T = curve.getTangentAt(t);
    const r = rad(t);
    ring(samples[i], T, r * 1.02, r * 0.17, C.ridge);
    const n = T.clone().cross(X).normalize(); // points to the back
    if (i % 2 === 0 && i > 1) {
      const p = samples[i].clone().addScaledVector(n, r * 0.9);
      spike(p, n.clone().add(T.clone().multiplyScalar(0.25)), r * 0.7 + 0.002, r * 0.28 + 0.0006, C.crown);
    }
    if (t > 0.5 && i % 2 === 1) {
      for (const s of [1, -1]) {
        const d = X.clone().multiplyScalar(s).addScaledVector(n, 0.3).normalize();
        const p = samples[i].clone().addScaledVector(d, r * 0.95);
        spike(p, d, 0.0035, 0.0015, C.crown);
      }
    }
  }

  // spots on the body
  for (let k = 0; k < 42; k++) {
    const t = 0.3 + rand() * 0.66;
    const T = curve.getTangentAt(t);
    const n = T.clone().cross(X).normalize();
    const th = rand() * Math.PI * 2;
    const d = X.clone().multiplyScalar(Math.cos(th)).addScaledVector(n, Math.sin(th));
    const p = curve.getPointAt(t).addScaledVector(d, rad(t) * 1.0);
    ball(p, 0.0009 + rand() * 0.0009, C.spot, undefined, undefined, 5, 4);
  }

  // ---------- brood pouch ----------
  const bellyC = new THREE.Vector3(0, 0.135, 0.006);
  const br = 0.019;
  ball(bellyC, br, C.cream, undefined, [0.92, 1.3, 1.0], 9, 7);
  for (let k = 0; k < 6; k++) {
    const y = 0.116 + k * 0.0075;
    const u = (y - bellyC.y) / (br * 1.3);
    const f = Math.sqrt(Math.max(0, 1 - u * u));
    const z = bellyC.z + br * f;
    const w = 2 * br * 0.92 * f * 0.75;
    b.part(new THREE.BoxGeometry(w, 0.0013, 0.004), C.plate, { at: [0, y, z - 0.0012] });
  }

  // ---------- head ----------
  ball(headC, 0.0135, C.body, head, [0.85, 1.05, 1.2], 8, 6);
  ball([0, 0.236, 0.013], 0.0085, C.bodyLight, head, [0.8, 0.8, 1.2], 7, 5);
  for (const s of [1, -1]) {
    ball([s * 0.0075, 0.226, 0.007], 0.0065, C.cream, head, [0.8, 1, 1.25], 7, 5);
  }
  seg([0, 0.229, 0.012], snoutTip, 0.0062, 0.0052, C.body, 7, head);
  const snoutA = V([0, 0.229, 0.012]), snoutB = V(snoutTip);
  const snoutDir = snoutB.clone().sub(snoutA).normalize();
  for (const f of [0.35, 0.6, 0.85]) {
    ring(snoutA.clone().lerp(snoutB, f), snoutDir, 0.0058, 0.0009, C.ridge, head);
  }
  // mouth: upper lip on head, lower jaw on jaw joint
  b.part(new THREE.BoxGeometry(0.0095, 0.0032, 0.009), C.lip, { at: [0, 0.2232, 0.0605], bone: head });
  b.part(new THREE.BoxGeometry(0.007, 0.0012, 0.007), C.pupil, { at: [0, 0.2213, 0.0605], bone: head });
  b.part(new THREE.BoxGeometry(0.0085, 0.0028, 0.0085), C.lip, { at: [0, 0.2193, 0.0595], bone: jaw });

  // eyes
  for (const s of [1, -1]) {
    const E = [s * 0.0105, 0.2355, 0.0085];
    ball(E, 0.0043, C.eyeW, head, undefined, 8, 6);
    ball([E[0] + s * 0.0022, E[1], E[2] + 0.0008], 0.0031, C.iris, head, undefined, 8, 6);
    ball([E[0] + s * 0.0038, E[1], E[2] + 0.0012], 0.0018, C.pupil, head, undefined, 6, 5);
    ball([E[0] + s * 0.0046, E[1] + 0.0012, E[2] + 0.0022], 0.0007, C.eyeW, head, undefined, 5, 4);
    ring([E[0] + s * 0.0014, E[1], E[2]], new THREE.Vector3(s, 0, 0), 0.0042, 0.0009, C.ridge, head);
    spike([E[0], E[1] + 0.0038, E[2] - 0.001], new THREE.Vector3(s * 0.4, 1, -0.2), 0.0045, 0.0014, C.crown, head);
  }

  // coronet
  b.part(new THREE.CylinderGeometry(0.0042, 0.0055, 0.007, 6), C.body, {
    at: [0, 0.2465, -0.003],
    bone: head,
  });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const base = [Math.sin(a) * 0.0034, 0.2495, -0.003 + Math.cos(a) * 0.0034];
    spike(base, new THREE.Vector3(Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5), 0.0055, 0.0015, C.crown, head);
  }
  // spikes down the back of the head
  spike([0, 0.238, -0.008], new THREE.Vector3(0, 0.3, -1), 0.005, 0.0017, C.crown, head);
  spike([0, 0.229, -0.009], new THREE.Vector3(0, -0.1, -1), 0.0045, 0.0016, C.crown, head);

  // ---------- fins ----------
  const halfDisk = (r: number, thetaStart: number) =>
    new THREE.CylinderGeometry(r, r, 0.0008, 9, 1, false, thetaStart, Math.PI);

  // dorsal fin: half disc in the YZ plane, extending backward
  const dGeo = halfDisk(0.016, Math.PI / 2);
  dGeo.rotateZ(Math.PI / 2);
  b.part(dGeo, C.fin, { at: finC, bone: dorsalFin, scale: [1, 1, 0.75] } as any);
  for (let k = 0; k <= 6; k++) {
    const a = (k / 6) * Math.PI;
    const d = new THREE.Vector3(0, Math.cos(a), -Math.sin(a) * 0.75);
    const A = V(finC).addScaledVector(d, 0.001);
    const Bp = V(finC).addScaledVector(d, 0.0155);
    seg(A, Bp, 0.0006, 0.0004, C.finRay, 4, dorsalFin);
  }

  // pectoral fins: half discs facing forward, fanning out to the sides
  for (const [s, jt] of [[1, pecL], [-1, pecR]] as [number, any][]) {
    const g = halfDisk(0.0075, s > 0 ? 0 : Math.PI);
    g.rotateX(Math.PI / 2);
    const P = [s * 0.008, 0.215, -0.01];
    b.part(g, C.fin, { at: P, bone: jt });
    for (let k = 0; k <= 4; k++) {
      const a = (k / 4) * Math.PI;
      const d = new THREE.Vector3(s * Math.sin(a), Math.cos(a), 0);
      seg(V(P).addScaledVector(d, 0.0008), V(P).addScaledVector(d, 0.0072), 0.0004, 0.0003, C.finRay, 4, jt);
    }
  }

  return b.root;
}
```