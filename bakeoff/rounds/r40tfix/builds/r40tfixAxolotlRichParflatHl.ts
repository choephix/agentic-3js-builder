import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame, catmull } from "../../../../src/index";

export const meta = {
  "name": "Chibi Axolotl",
  "description": "A chibi leucistic axolotl: a huge flat smiling head, a stubby pale-pink body, a paddle tail with a frilled fin and six feathery hot-pink gills, standing in a neutral rest pose."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#f7c3cd",
  skinBack: "#eaa3b3",
  belly: "#fff0e8",
  spot: "#d9788f",
  gillStalk: "#e8456f",
  gillDeep: "#c92a58",
  gillFrill: "#ff7aa0",
  gillTip: "#ffb3c8",
  fin: "#ffd3dc",
  finEdge: "#ff9cb5",
  eye: "#1b1020",
  eyeRing: "#3b2a4a",
  eyeGold: "#ffd36b",
  shine: "#ffffff",
  blush: "#ff8fab",
  mouthLine: "#b0405e",
  mouthInside: "#7a1f3d",
  tongue: "#ff7b95",
  nostril: "#a8506a",
  pad: "#f08fa6",
  digitTip: "#ffd9e0",
};
const M = {
  headCenter: [0, 0.083, 0.14] as [number, number, number],
  jawHinge: [0, 0.055, 0.1] as [number, number, number],
  mouthFront: [0, 0.056, 0.222] as [number, number, number],
  eyeL: [0.056, 0.123, 0.18] as [number, number, number],
  eyeR: [-0.056, 0.123, 0.18] as [number, number, number],
  cheekL: [0.089, 0.066, 0.172] as [number, number, number],
  cheekR: [-0.089, 0.066, 0.172] as [number, number, number],
  nostrilL: [0.022, 0.1, 0.224] as [number, number, number],
  nostrilR: [-0.022, 0.1, 0.224] as [number, number, number],
  gillBaseL1: [0.048, 0.13, 0.112] as [number, number, number],
  gillBaseL2: [0.084, 0.107, 0.109] as [number, number, number],
  gillBaseL3: [0.087, 0.059, 0.117] as [number, number, number],
  gillBaseR1: [-0.048, 0.13, 0.112] as [number, number, number],
  gillBaseR2: [-0.084, 0.107, 0.109] as [number, number, number],
  gillBaseR3: [-0.087, 0.059, 0.117] as [number, number, number],
  neckJoin: [0, 0.055, 0.06] as [number, number, number],
  dorsalStart: [0, 0.098, 0.04] as [number, number, number],
  tailRoot: [0, 0.05, -0.1] as [number, number, number],
  tailTip: [0, 0.037, -0.31] as [number, number, number],
  shoulderL: [0.07, 0.04, 0.035] as [number, number, number],
  shoulderR: [-0.07, 0.04, 0.035] as [number, number, number],
  hipSocketL: [0.065, 0.04, -0.085] as [number, number, number],
  hipSocketR: [-0.065, 0.04, -0.085] as [number, number, number],
  handPadL: [0.125, 0, 0.08] as [number, number, number],
  handPadR: [-0.125, 0, 0.08] as [number, number, number],
  footPadL: [0.125, 0, -0.075] as [number, number, number],
  footPadR: [-0.125, 0, -0.075] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: any) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw;
  const C = [0, 0.083, 0.14] as [number, number, number];

  const ell = (c: number[], r: number[], col: string, bone: any, w = 10, h = 7) =>
    b.part(new THREE.SphereGeometry(1, w, h), col, { bone, at: c, scale: r });

  // upper skull
  ell(C, [0.1, 0.057, 0.09], P.skin, head);
  // darker crown cap
  ell([0, 0.096, 0.135], [0.082, 0.047, 0.074], P.skinBack, head);
  // snout bump
  ell([0, 0.07, 0.205], [0.05, 0.03, 0.03], P.skin, head);
  // cheek fullness to widen the head
  for (const s of [1, -1]) ell([s * 0.07, 0.07, 0.13], [0.035, 0.04, 0.06], P.skin, head, 8, 6);

  // freckles on the crown
  const skin = b.surface(b.root);
  const spots: [number, number, number][] = [[-20, 75, 0.008], [15, 70, 0.007], [-45, 60, 0.006], [40, 62, 0.009], [0, 55, 0.006], [-8, 80, 0.005]];
  for (const [az, el, r] of spots) {
    const hit = skin.around(C).at(az, el);
    if (hit) b.stick(new THREE.CylinderGeometry(r, r, 0.003, 7), P.spot, hit, { embed: 0.4, bone: head });
  }

  // brow ridges
  for (const s of [1, -1]) {
    ell([s * 0.056, 0.135, 0.18], [0.02, 0.009, 0.016], P.skin, head, 8, 6);
  }

  // mouth interior tray on the upper skull underside
  ell([0, 0.058, 0.15], [0.078, 0.006, 0.07], P.mouthInside, head, 10, 5);

  // lower jaw
  ell([0, 0.035, 0.15], [0.088, 0.026, 0.078], P.belly, jaw);
  // skin-coloured upper rim of the jaw
  const rim = b.part(new THREE.TorusGeometry(1, 0.06, 5, 16), P.skin, {
    bone: jaw, at: [0, 0.051, 0.15], rotation: [90, 0, 0], scale: [0.082, 0.07, 0.3],
  });
  void rim;
  // jaw floor and tongue
  ell([0, 0.05, 0.155], [0.07, 0.006, 0.06], P.mouthInside, jaw, 10, 5);
  ell([0, 0.054, 0.16], [0.04, 0.005, 0.04], P.tongue, jaw, 8, 5);

  // gular fold arcs under the jaw
  for (const [z, rr] of [[0.14, 0.07], [0.115, 0.062]] as number[][]) {
    const t = new THREE.TorusGeometry(1, 0.035, 4, 14, Math.PI);
    b.part(t, "#f2d6cc", {
      bone: jaw, at: [0, 0.018, z], rotation: [90, 180, 0], scale: [rr, rr * 0.8, 0.04 / 0.035 * 0.8],
    });
  }
  void R;
}
    return buildHead;
  })(),
  // face
  (() => {
function buildFace({ b, J, P, M }: any) {
  const head = J.head;
  const jaw = J.jaw;
  const skull = b.surface(b.root);
  const ctr: [number, number, number] = [0, 0.083, 0.14];
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // seat a point on the skull surface, lifted out along the normal
  const seat = (p: number[], lift = 0) => {
    const h = skull.nearest(p);
    return { h, at: h.moved([0, lift, 0]).at };
  };

  // ---- eyes ----
  for (const s of [1, -1]) {
    const e = M[s > 0 ? "eyeL" : "eyeR"];
    const { h } = seat(e, 0);
    const n = h.n.clone();
    const base = h.at.clone().addScaledVector(n, 0.004);
    const ring = b.part(sph(0.019, 10, 7), P.eyeRing, { bone: head, at: base });
    const out = (d: number) => base.clone().addScaledVector(n, d);
    b.part(sph(0.016, 10, 7), P.eye, { bone: head, at: out(0.005) });
    // gold crescent under pupil
    const g = out(0.0155).add(new THREE.Vector3(0, -0.006, 0.002));
    b.part(new THREE.TorusGeometry(0.009, 0.0013, 4, 10, Math.PI), P.eyeGold, {
      bone: head, at: g, dir: n.toArray(), axis: "z", rotation: undefined,
    });
    // shines
    b.part(sph(0.005, 6, 4), P.shine, {
      bone: head, at: out(0.0195).add(new THREE.Vector3(s * 0.006, 0.007, 0.002)),
    });
    b.part(sph(0.0025, 5, 4), P.shine, {
      bone: head, at: out(0.0195).add(new THREE.Vector3(-s * 0.005, -0.006, 0.002)),
    });
    // brow arc
    const bp = [-1, 0, 1].map((k) => {
      const q = [e[0] + k * 0.014 * 1, e[1] + 0.024 - Math.abs(k) * 0.004, e[2] - 0.006 + k * 0.0];
      return seat([e[0] + k * 0.014, q[1], q[2]], 0.002).at;
    });
    b.sweep(bp, 0.0014, { bone: head, color: P.eyeRing, sides: 5 });
  }

  // ---- smile ----
  const pts: THREE.Vector3[] = [];
  const N = 9;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1) * 2 - 1;
    const x = t * 0.085;
    const y = 0.056 - 0.011 * (1 - t * t) + 0.0 + 0.012 * t * t * t * t;
    const z = 0.222 - 0.1 * t * t - 0.0;
    pts.push(seat([x, y + 0.0, z], 0.001).at);
  }
  b.sweep(pts, 0.0012, { bone: head, color: P.mouthLine, sides: 5 });
  for (const s of [1, -1]) {
    const c = pts[s > 0 ? N - 1 : 0];
    b.part(sph(0.0025, 5, 4), P.mouthLine, { bone: head, at: c });
    for (const d of [0.006, 0.012]) {
      b.part(new THREE.BoxGeometry(0.0012, 0.006, 0.0012), P.mouthLine, {
        bone: jaw,
        at: [c.x + s * 0.002, c.y - 0.004 - d * 0.2, c.z - d * 0.2],
        rotation: [0, 0, -s * 25],
      });
    }
  }

  // ---- blush ----
  for (const s of [1, -1]) {
    const c = M[s > 0 ? "cheekL" : "cheekR"];
    const { h } = seat(c, 0);
    const bl = b.stick(new THREE.CylinderGeometry(0.015, 0.015, 0.003, 10), P.blush, h, { embed: 0.3, scale: [1, 1, 0.65], bone: head } as any);
    for (let k = 0; k < 3; k++) {
      const q = seat([c[0], c[1] - 0.004 + 0.004 * 0, c[2] + (k - 1) * 0.008], 0.0025);
      b.stick(new THREE.BoxGeometry(0.0015, 0.0015, 0.007), "#d9607f", q.h, { embed: 0.2, bone: head, spin: 20 } as any);
    }
  }

  // ---- nostrils ----
  for (const s of [1, -1]) {
    const { h } = seat(M[s > 0 ? "nostrilL" : "nostrilR"], 0);
    b.stick(sph(0.0028, 5, 4), P.nostril, h, { embed: 0.3, bone: head } as any);
  }

  // ---- freckles ----
  const r = rng(11);
  for (let i = 0; i < 6; i++) {
    const x = (r() - 0.5) * 0.09;
    const { h } = seat([x, 0.105, 0.2 + r() * 0.02], 0);
    b.stick(new THREE.CylinderGeometry(0.003, 0.003, 0.002, 6), P.spot, h, { embed: 0.3, bone: head } as any);
  }
}
    return buildFace;
  })(),
  // gills
  (() => {
function buildGills({ b, J, P, M }: Ctx) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let n = 1; n <= 3; n++) {
      const j1 = J[`gill${side}${n}`];
      const j2 = J[`gill${side}${n}b`];
      const base = new THREE.Vector3(...((M as Record<string, [number, number, number]>)[`gillBase${side}${n}`]));
      const mid = new THREE.Vector3(...j2.at.toArray());
      const dir1 = mid.clone().sub(base).normalize();
      const droop = n === 3 ? -1 : n === 1 ? 1 : 0.3;
      const tip = mid.clone().addScaledVector(dir1, 0.05);
      tip.y += droop * 0.004;
      // stalk: two sweeps, one per joint, tapered
      b.capsule(base.clone().addScaledVector(dir1, -0.008), mid, [0.007, 0.0048], P.gillStalk, { bone: j1, sides: 6 });
      b.capsule(mid, tip, [0.0048, 0.003], P.gillStalk, { bone: j2, sides: 6 });
      // base collar
      b.part(new THREE.SphereGeometry(0.01, 6, 5), P.gillDeep, { bone: j1, at: base.clone().addScaledVector(dir1, 0.002) });
      // side axis perpendicular to the stalk
      const up = new THREE.Vector3(0, 1, 0);
      let side1 = new THREE.Vector3().crossVectors(dir1, up);
      if (side1.length() < 0.1) side1.set(0, 0, 1);
      side1.normalize();
      const upv = new THREE.Vector3().crossVectors(side1, dir1).normalize();
      const total = 7;
      for (let i = 0; i < total; i++) {
        const t = (i + 0.7) / (total + 0.3);
        const along = t < 0.5 ? 0 : 1;
        const jt = along ? j2 : j1;
        const p = base.clone().lerp(tip, t);
        const len = (0.03 + 0.017 * Math.sin(Math.PI * Math.min(t * 1.1, 1))) * (1 - 0.3 * t) * (0.9 + R() * 0.2 + (s > 0 ? 0.05 : 0));
        for (const k of [1, -1]) {
          const ang = (60 - 8 * t) * (Math.PI / 180);
          const d = dir1.clone().multiplyScalar(Math.cos(ang) * 0.6)
            .addScaledVector(side1, k * Math.sin(ang))
            .addScaledVector(upv, 0.25 * (n === 3 ? -1 : 1) * 0.6)
            .add(new THREE.Vector3(0, 0, -0.25)).normalize();
          const col = t < 0.3 ? P.gillDeep : P.gillFrill;
          const e = p.clone().addScaledVector(d, len);
          b.spike(p, e, null, 0.0042, col, { bone: jt, sides: 5 });
          b.part(new THREE.SphereGeometry(0.0034, 5, 4), P.gillTip, { bone: jt, at: e });
        }
      }
      // tip cluster
      for (let c = -1; c <= 1; c++) {
        const d = dir1.clone().addScaledVector(side1, c * 0.5).addScaledVector(upv, 0.15).normalize();
        const e = tip.clone().addScaledVector(d, 0.022);
        b.spike(tip, e, null, 0.0035, P.gillFrill, { bone: j2, sides: 5 });
        b.part(new THREE.SphereGeometry(0.003, 5, 4), P.gillTip, { bone: j2, at: e });
      }
    }
  }
}
    return buildGills;
  })(),
  // bodyTail
  (() => {
function buildBodyTail({ b, J, P, M }: any) {
  const R = rng(11);
  const hips = J.hips, spine = J.spine;
  const tails = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5];

  // torso: oval loft from neck to tail root
  const bodyPath = catmull([[0, 0.05, 0.075], [0, 0.05, 0.0], [0, 0.05, -0.05], [0, 0.05, -0.11]]);
  const body = b.sweep(bodyPath, (t: number) => [0.065 - 0.012 * t * t, 0.05], {
    bone: [hips, spine], color: P.skin, caps: "round", sides: 10,
    sectors: [[-60, 60, P.skinBack], [130, 230, P.belly]],
  });

  // tail: flattened, tapering paddle
  const tp = catmull([[0, 0.05, -0.1], [0, 0.048, -0.155], [0, 0.044, -0.21], [0, 0.04, -0.26], [0, 0.037, -0.295], [0, 0.037, -0.31]]);
  const tail = b.sweep(tp, (t: number) => [0.045 - 0.039 * t, 0.045 - 0.029 * t], {
    bone: [hips, ...tails], color: P.skin, caps: "round", sides: 8,
    sectors: [[-55, 55, P.skinBack], [130, 230, P.belly]],
  });

  // dorsal fin along back and tail
  const dorsalPts: number[][] = [];
  const baseTop: number[][] = [[0, 0.098, 0.04], [0, 0.1, 0.0], [0, 0.1, -0.06], [0, 0.097, -0.1]];
  for (const p of baseTop) dorsalPts.push(p);
  const tailTop = (t: number, lift: number) => {
    const p = tp.at(t);
    const ry = 0.045 - 0.029 * t;
    return [0, p.y + ry + lift, p.z];
  };
  const edgeTop: number[][] = [[0, 0.098, 0.04], [0, 0.124, 0.0], [0, 0.125, -0.06], [0, 0.123, -0.1]];
  const baseA: number[][] = [...baseTop];
  const edgeA: number[][] = [...edgeTop];
  for (let i = 1; i <= 8; i++) {
    const t = i / 8 * 0.97;
    const lift = 0.03 * (1 - Math.pow(t, 3) * 0.6) + (i % 2 ? 0.004 : 0);
    baseA.push(tailTop(t, -0.004));
    edgeA.push(tailTop(t, lift));
  }
  b.membrane(baseA, edgeA, { color: P.fin, thickness: 0.003, bone: tails[1], rows: 2 });
  b.sweep(edgeA, 0.0025, { color: P.finEdge, bone: tails[1], sides: 5 });
  // ribs
  for (let i = 0; i < baseA.length; i += 1) {
    if (i < 1) continue;
    b.rod(baseA[i], edgeA[i], 0.0014, { color: P.finEdge, bone: i < 4 ? hips : tails[Math.min(4, i - 3)], sides: 4 });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), P.fin, { at: edgeA[i], bone: i < 4 ? hips : tails[Math.min(4, i - 3)] });
  }

  // ventral fin on last 0.12 m
  const vb: number[][] = [], ve: number[][] = [];
  for (let i = 0; i <= 5; i++) {
    const t = 0.6 + i * 0.07;
    const p = tp.at(t);
    const ry = 0.045 - 0.029 * t;
    const h = 0.018 * Math.sin(Math.PI * (0.1 + 0.8 * i / 5));
    vb.push([0, p.y - ry + 0.004, p.z]);
    ve.push([0, p.y - ry - h, p.z]);
  }
  b.membrane(vb, ve, { color: P.fin, thickness: 0.003, bone: tails[3], rows: 2 });
  b.sweep(ve, 0.002, { color: P.finEdge, bone: tails[3], sides: 5 });

  // freckles
  const sk = b.surface([body, tail]);
  const hits = sk.scatter(13, { rng: R, minDist: 0.025, filter: (h: any) => h.n.y > 0.35 || Math.abs(h.n.x) > 0.6 });
  for (const h of hits) {
    const r = 0.003 + R() * 0.003;
    b.stick(new THREE.CylinderGeometry(r, r, 0.003, 7), P.spot, h, { embed: 0.4 });
  }

  // costal grooves
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = 0.05 - i * 0.032;
      b.rod([s * 0.06, 0.07, z + 0.006], [s * 0.066, 0.03, z - 0.004], 0.0016, { color: P.skinBack, bone: z > -0.01 ? spine : hips, sides: 4 });
    }

  // cloaca
  b.part(new THREE.SphereGeometry(0.01, 8, 6), P.belly, { at: [0, 0.006, -0.1], bone: hips, scale: [1, 0.6, 1.2] });
}
    return buildBodyTail;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P, M }: any) {
  const R = rng(5);
  const ell = (rx: number, ry: number, rz: number, seg = 8) =>
    new THREE.SphereGeometry(1, seg, 6).scale(rx, ry, rz);

  // [name, shoulder joint, mid joint, end joint, digit joint names, side, front?, pad mount]
  const sides = [1, -1];
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const limbsDef = [
      { root: "shoulder", mid: "elbow", end: "hand", digits: ["finger", 4], pad: M["handPad" + S], rootAt: M["shoulder" + S], front: true },
      { root: "hip", mid: "knee", end: "foot", digits: ["toe", 5], pad: M["footPad" + S], rootAt: M["hipSocket" + S], front: false },
    ] as const;
    for (const d of limbsDef) {
      const j0 = J[d.root + S], j1 = J[d.mid + S], j2 = J[d.end + S];
      const p0: number[] = d.rootAt;
      const p1 = [j1.at.x, j1.at.y, j1.at.z];
      const p2 = [j2.at.x, j2.at.y, j2.at.z];
      // upper segment and lower segment
      b.sweep([p0, p1], [0.016, 0.014], { color: P.skin, bone: j0, sides: 7, caps: "round" });
      b.sweep([p1, p2], [0.014, 0.012], { color: P.skin, bone: j1, sides: 7, caps: "round" });
      // pale underside strips
      b.rod([p0[0], p0[1] - 0.011, p0[2]], [p1[0], p1[1] - 0.011, p1[2]], 0.006, { color: P.belly, bone: j0, sides: 6 });
      b.rod([p1[0], p1[1] - 0.009, p1[2]], [p2[0], p2[1] - 0.009, p2[2]], 0.005, { color: P.belly, bone: j1, sides: 6 });
      // joint bulge
      b.part(ell(0.022, 0.02, 0.024), P.skin, { bone: j0, at: [p0[0], p0[1], p0[2]] });
      b.part(ell(0.015, 0.014, 0.015), P.skin, { bone: j1, at: p1 });
      // freckles
      for (let i = 0; i < 2; i++) {
        const t = 0.3 + i * 0.4;
        b.part(ell(0.0045, 0.002, 0.0045, 6), P.spot, {
          bone: j0,
          at: [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t + 0.014 - i * 0.002, p0[2] + (p1[2] - p0[2]) * t + (R() - 0.5) * 0.006],
        });
      }
      // paw
      const pad = d.pad;
      b.part(ell(0.018, 0.005, 0.019), P.skin, { bone: j2, at: [pad[0], 0.006, pad[2]] });
      b.part(ell(0.011, 0.0025, 0.012, 7), P.pad, { bone: j2, at: [pad[0], 0.0026, pad[2]] });
      // digits
      const n = d.digits[1] as number;
      for (let k = 1; k <= n; k++) {
        const dj = J[d.digits[0] + S + k];
        const a = [dj.at.x, dj.at.y, dj.at.z];
        const dir = [dj.axis.x, 0, dj.axis.z];
        const mid = Math.abs(k - (n + 1) / 2) / (n / 2);
        const len = 0.028 - 0.005 * mid;
        const e = [a[0] + dir[0] * len, 0.006, a[2] + dir[2] * len];
        const a2 = [a[0], 0.006, a[2]];
        b.sweep([a2, e], [0.0048, 0.003], { color: P.skin, bone: dj, sides: 6, caps: "round" });
        b.part(new THREE.SphereGeometry(0.004, 6, 5), P.digitTip, { bone: dj, at: e });
      }
    }
  }
}
    return buildLimbs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.05,-0.07], dir: [0,0,1], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.052,0], dir: [0,0,1], role: "spine" });
  J["head"] = b.joint("head", { parent: J["spine"], at: [0,0.065,0.07], dir: [0,0.1,1], role: "head", group: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.055,0.1], dir: [0,0,1], role: "jaw", group: "head" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.05,-0.1], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.048,-0.155], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.044,-0.21], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.04,-0.26], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [0,0.037,-0.295], dir: [0,0,-1], role: "tail", group: "tail" });
  J["gillL1"] = b.joint("gillL1", { parent: J["head"], at: [0.048,0.13,0.112], dir: [0.507,0.76,-0.406], role: "fan", group: "gills" });
  J["gillL1b"] = b.joint("gillL1b", { parent: J["gillL1"], at: [0.073,0.168,0.092], dir: [0.45,0.8,-0.35], role: "fan", group: "gills" });
  J["gillL2"] = b.joint("gillL2", { parent: J["head"], at: [0.084,0.107,0.109], dir: [0.885,0.31,-0.4], role: "fan", group: "gills" });
  J["gillL2b"] = b.joint("gillL2b", { parent: J["gillL2"], at: [0.128,0.123,0.089], dir: [0.9,0.3,-0.35], role: "fan", group: "gills" });
  J["gillL3"] = b.joint("gillL3", { parent: J["head"], at: [0.087,0.059,0.117], dir: [0.893,-0.089,-0.446], role: "fan", group: "gills" });
  J["gillL3b"] = b.joint("gillL3b", { parent: J["gillL3"], at: [0.123,0.055,0.099], dir: [0.9,-0.1,-0.4], role: "fan", group: "gills" });
  J["gillR1"] = b.joint("gillR1", { parent: J["head"], at: [-0.048,0.13,0.112], dir: [-0.507,0.76,-0.406], role: "fan", group: "gills" });
  J["gillR1b"] = b.joint("gillR1b", { parent: J["gillR1"], at: [-0.073,0.168,0.092], dir: [-0.45,0.8,-0.35], role: "fan", group: "gills" });
  J["gillR2"] = b.joint("gillR2", { parent: J["head"], at: [-0.084,0.107,0.109], dir: [-0.885,0.31,-0.4], role: "fan", group: "gills" });
  J["gillR2b"] = b.joint("gillR2b", { parent: J["gillR2"], at: [-0.128,0.123,0.089], dir: [-0.9,0.3,-0.35], role: "fan", group: "gills" });
  J["gillR3"] = b.joint("gillR3", { parent: J["head"], at: [-0.087,0.059,0.117], dir: [-0.893,-0.089,-0.446], role: "fan", group: "gills" });
  J["gillR3b"] = b.joint("gillR3b", { parent: J["gillR3"], at: [-0.123,0.055,0.099], dir: [-0.9,-0.1,-0.4], role: "fan", group: "gills" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["spine"], at: [0.07,0.04,0.035], dir: [0.85,-0.4,0.35], role: "arm", group: "limbs" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.105,0.024,0.05], dir: [0.5,-0.3,0.8], role: "arm", group: "limbs" });
  J["handL"] = b.joint("handL", { parent: J["elbowL"], at: [0.125,0.012,0.08], dir: [0.4,-0.2,0.9], role: "arm", group: "limbs" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["spine"], at: [-0.07,0.04,0.035], dir: [-0.85,-0.4,0.35], role: "arm", group: "limbs" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.105,0.024,0.05], dir: [-0.5,-0.3,0.8], role: "arm", group: "limbs" });
  J["handR"] = b.joint("handR", { parent: J["elbowR"], at: [-0.125,0.012,0.08], dir: [-0.4,-0.2,0.9], role: "arm", group: "limbs" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.065,0.04,-0.085], dir: [0.8,-0.3,-0.4], role: "leg", group: "limbs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.105,0.025,-0.105], dir: [0.5,-0.3,0.8], role: "leg", group: "limbs" });
  J["footL"] = b.joint("footL", { parent: J["kneeL"], at: [0.125,0.012,-0.075], dir: [0.4,0,0.9], role: "leg", group: "limbs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.065,0.04,-0.085], dir: [-0.8,-0.3,-0.4], role: "leg", group: "limbs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.105,0.025,-0.105], dir: [-0.5,-0.3,0.8], role: "leg", group: "limbs" });
  J["footR"] = b.joint("footR", { parent: J["kneeR"], at: [-0.125,0.012,-0.075], dir: [-0.4,0,0.9], role: "leg", group: "limbs" });
  J["fingerL1"] = b.joint("fingerL1", { parent: J["handL"], at: [0.137,0.01,0.086], dir: [0.6,0,0.8], role: "digit", group: "limbs" });
  J["fingerL2"] = b.joint("fingerL2", { parent: J["handL"], at: [0.131,0.01,0.092], dir: [0.25,0,0.97], role: "digit", group: "limbs" });
  J["fingerL3"] = b.joint("fingerL3", { parent: J["handL"], at: [0.122,0.01,0.093], dir: [-0.15,0,0.99], role: "digit", group: "limbs" });
  J["fingerL4"] = b.joint("fingerL4", { parent: J["handL"], at: [0.113,0.01,0.09], dir: [-0.5,0,0.87], role: "digit", group: "limbs" });
  J["fingerR1"] = b.joint("fingerR1", { parent: J["handR"], at: [-0.137,0.01,0.086], dir: [-0.6,0,0.8], role: "digit", group: "limbs" });
  J["fingerR2"] = b.joint("fingerR2", { parent: J["handR"], at: [-0.131,0.01,0.092], dir: [-0.25,0,0.97], role: "digit", group: "limbs" });
  J["fingerR3"] = b.joint("fingerR3", { parent: J["handR"], at: [-0.122,0.01,0.093], dir: [0.15,0,0.99], role: "digit", group: "limbs" });
  J["fingerR4"] = b.joint("fingerR4", { parent: J["handR"], at: [-0.113,0.01,0.09], dir: [0.5,0,0.87], role: "digit", group: "limbs" });
  J["toeL1"] = b.joint("toeL1", { parent: J["footL"], at: [0.14,0.009,-0.073], dir: [0.8,0,0.6], role: "digit", group: "limbs" });
  J["toeL2"] = b.joint("toeL2", { parent: J["footL"], at: [0.134,0.009,-0.068], dir: [0.45,0,0.9], role: "digit", group: "limbs" });
  J["toeL3"] = b.joint("toeL3", { parent: J["footL"], at: [0.126,0.009,-0.066], dir: [0.1,0,1], role: "digit", group: "limbs" });
  J["toeL4"] = b.joint("toeL4", { parent: J["footL"], at: [0.118,0.009,-0.067], dir: [-0.25,0,0.97], role: "digit", group: "limbs" });
  J["toeL5"] = b.joint("toeL5", { parent: J["footL"], at: [0.111,0.009,-0.071], dir: [-0.6,0,0.8], role: "digit", group: "limbs" });
  J["toeR1"] = b.joint("toeR1", { parent: J["footR"], at: [-0.14,0.009,-0.073], dir: [-0.8,0,0.6], role: "digit", group: "limbs" });
  J["toeR2"] = b.joint("toeR2", { parent: J["footR"], at: [-0.134,0.009,-0.068], dir: [-0.45,0,0.9], role: "digit", group: "limbs" });
  J["toeR3"] = b.joint("toeR3", { parent: J["footR"], at: [-0.126,0.009,-0.066], dir: [-0.1,0,1], role: "digit", group: "limbs" });
  J["toeR4"] = b.joint("toeR4", { parent: J["footR"], at: [-0.118,0.009,-0.067], dir: [0.25,0,0.97], role: "digit", group: "limbs" });
  J["toeR5"] = b.joint("toeR5", { parent: J["footR"], at: [-0.111,0.009,-0.071], dir: [0.6,0,0.8], role: "digit", group: "limbs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
