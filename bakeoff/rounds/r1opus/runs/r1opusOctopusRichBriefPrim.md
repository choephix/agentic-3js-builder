```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with a bulbous mottled mantle, bumpy skin, golden bar-pupil eyes under grumpy brows, eight curling arms lined with cream suckers, and one arm proudly holding up an old brass shipwreck key.",
};

export default function build(): THREE.Object3D {
  // ---------------------------------------------------------------- setup
  let B: any = null;
  try {
    B = createBuilder({ name: "reefOctopus" });
  } catch {
    B = null;
  }
  const sdk = !!(B && B.root);
  const root: THREE.Object3D = sdk ? B.root : new THREE.Group();

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const arr = (p: THREE.Vector3) => [p.x, p.y, p.z];

  // deterministic random
  let rand: () => number;
  {
    let s = 0x1234abcd;
    rand = () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    try {
      const r: any = (rng as any)(4242);
      let f: (() => number) | null = null;
      if (typeof r === "function") f = () => r();
      else if (r && typeof r.next === "function") f = () => r.next();
      else if (r && typeof r.float === "function") f = () => r.float();
      else if (r && typeof r.random === "function") f = () => r.random();
      if (f) {
        const t = f();
        if (typeof t === "number" && t >= 0 && t < 1) rand = f;
      }
    } catch {
      /* keep local prng */
    }
  }

  // ---------------------------------------------------------------- joints
  const J: Record<string, any> = {};
  function joint(name: string, at: THREE.Vector3, parent?: string, role?: string) {
    if (!sdk) return null;
    const opts: any = { at: arr(at) };
    if (role) opts.role = role;
    if (parent) opts.parent = J[parent];
    try {
      const j = B.joint(name, opts);
      J[name] = j;
      return j;
    } catch {
      if (parent) {
        try {
          const j = B.joint(name, { ...opts, parent });
          J[name] = j;
          return j;
        } catch {
          /* fall through */
        }
      }
      J[name] = null;
      return null;
    }
  }

  // ---------------------------------------------------------------- parts
  const rawGroup = new THREE.Group();
  rawGroup.name = "octopusParts";
  const mats = new Map<string, THREE.Material>();
  const METAL = new Set(["#c99a2e", "#8c6a22", "#e3c060"]);
  function rawMat(color: string) {
    let m = mats.get(color);
    if (!m) {
      const metal = METAL.has(color);
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: metal ? 0.38 : 0.72,
        metalness: metal ? 0.55 : 0.04,
        flatShading: true,
      });
      mats.set(color, m);
    }
    return m;
  }
  let mode = sdk ? 0 : 2; // 0 untested, 1 sdk parts ok, 2 raw meshes
  function put(geo: THREE.BufferGeometry, color: string, at: THREE.Vector3) {
    if (mode !== 2) {
      let before: Set<THREE.Object3D> | null = null;
      if (mode === 0) {
        before = new Set();
        root.traverse((o: any) => {
          if (o.isMesh) before!.add(o);
        });
      }
      try {
        B.part(geo, color, { at: arr(at) });
        if (mode === 0) {
          geo.computeBoundingBox();
          const lb = geo.boundingBox!.clone();
          const ec = lb.getCenter(new THREE.Vector3()).add(at);
          const es = lb.getSize(new THREE.Vector3());
          const added: THREE.Object3D[] = [];
          root.traverse((o: any) => {
            if (o.isMesh && !before!.has(o)) added.push(o);
          });
          let ok = false;
          for (const m of added) {
            m.updateWorldMatrix(true, false);
            const box = new THREE.Box3().setFromObject(m);
            if (box.isEmpty()) continue;
            const c = box.getCenter(new THREE.Vector3());
            const s = box.getSize(new THREE.Vector3());
            if (
              c.distanceTo(ec) < 0.01 &&
              Math.abs(s.x - es.x) < 0.01 &&
              Math.abs(s.y - es.y) < 0.01 &&
              Math.abs(s.z - es.z) < 0.01
            )
              ok = true;
          }
          if (ok) mode = 1;
          else {
            added.forEach((m) => m.removeFromParent());
            mode = 2;
          }
        }
        if (mode === 1) return;
      } catch {
        mode = 2;
      }
    }
    const mesh = new THREE.Mesh(geo, rawMat(color));
    mesh.position.copy(at);
    rawGroup.add(mesh);
  }

  // ---------------------------------------------------------------- geometry helpers
  function axesFor(dir: THREE.Vector3, hint?: THREE.Vector3) {
    const y = dir.clone().normalize();
    let h = hint ? hint.clone() : V(0, 0, 1);
    if (h.lengthSq() < 1e-8 || Math.abs(h.clone().normalize().dot(y)) > 0.97)
      h = Math.abs(y.z) < 0.9 ? V(0, 0, 1) : V(1, 0, 0);
    const x = new THREE.Vector3().crossVectors(y, h).normalize();
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    return [x, y, z];
  }
  function basis(geo: THREE.BufferGeometry, x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) {
    geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
    return geo;
  }
  function alongY(geo: THREE.BufferGeometry, dir: THREE.Vector3, hint?: THREE.Vector3) {
    const [x, y, z] = axesFor(dir, hint);
    return basis(geo, x, y, z);
  }
  function seg(p0: THREE.Vector3, p1: THREE.Vector3, r0: number, r1: number, color: string, radial = 8) {
    const d = p1.clone().sub(p0);
    const len = d.length();
    if (len < 1e-5) return;
    const geo = new THREE.CylinderGeometry(r1, r0, len, radial, 1, false);
    alongY(geo, d);
    put(geo, color, p0.clone().add(p1).multiplyScalar(0.5));
  }
  function ball(c: THREE.Vector3, r: number, color: string, ws = 8, hs = 6) {
    put(new THREE.SphereGeometry(r, ws, hs), color, c);
  }
  function disc(c: THREE.Vector3, axis: THREE.Vector3, r: number, h: number, color: string, radial = 8) {
    const geo = new THREE.CylinderGeometry(r, r, h, radial, 1, false);
    alongY(geo, axis, V(rand() - 0.5, rand() - 0.5, rand() - 0.5));
    put(geo, color, c);
  }
  function lens(c: THREE.Vector3, n: THREE.Vector3, r: number, thick: number, color: string, segs = 7) {
    const geo = new THREE.SphereGeometry(1, segs, 4);
    geo.scale(r, thick, r);
    alongY(geo, n, V(rand() - 0.5, rand() - 0.5, rand() - 0.5));
    put(geo, color, c);
  }
  function cone(base: THREE.Vector3, dir: THREE.Vector3, r: number, len: number, color: string, radial = 6) {
    const geo = new THREE.ConeGeometry(r, len, radial);
    alongY(geo, dir);
    put(geo, color, base.clone().addScaledVector(dir.clone().normalize(), len / 2));
  }
  function ellPoint(c: THREE.Vector3, rad: THREE.Vector3, rot: THREE.Matrix4 | null, u: THREE.Vector3) {
    const p = V(u.x * rad.x, u.y * rad.y, u.z * rad.z);
    const n = V(u.x / rad.x, u.y / rad.y, u.z / rad.z).normalize();
    if (rot) {
      p.applyMatrix4(rot);
      n.transformDirection(rot);
    }
    return { p: p.add(c), n };
  }
  function randDir() {
    const z = rand() * 2 - 1;
    const ph = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    return V(s * Math.cos(ph), z, s * Math.sin(ph));
  }

  // ---------------------------------------------------------------- body layout
  const bodyC = V(0, 0.075, 0);
  const headC = V(0, 0.15, 0.03);
  const headR = V(0.1, 0.082, 0.095);
  const mantleC = V(0, 0.27, -0.07);
  const mantleR = V(0.115, 0.14, 0.125);
  const tilt = new THREE.Matrix4().makeRotationX(-0.5);
  const tiltInv = new THREE.Matrix4().makeRotationX(0.5);
  const mantleTop = V(0, mantleR.y, 0).applyMatrix4(tilt).add(mantleC);

  // eyes
  type Eye = { side: number; p: THREE.Vector3; n: THREE.Vector3; c: THREE.Vector3; g: THREE.Vector3 };
  const eyes: Eye[] = [1, -1].map((sx) => {
    const az = 0.86 * sx;
    const el = 0.32;
    const u = V(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const { p, n } = ellPoint(headC, headR, null, u);
    const c = p.clone().addScaledVector(n, -0.009);
    const g = n.clone().add(V(-sx * 0.22, 0.02, 0.5)).normalize();
    return { side: sx, p, n, c, g };
  });

  // ---------------------------------------------------------------- arms (paths first)
  const rad = (s: number) => 0.0055 + 0.027 * Math.pow(Math.max(0, 1 - s), 1.1);
  type Node = { p: THREE.Vector3; d: THREE.Vector3; n: THREE.Vector3; o: THREE.Vector3; s: number };
  type Loop = { center: THREE.Vector3; axis: THREE.Vector3; steps: number };

  function runArm(
    base: THREE.Vector3,
    headingAz: number,
    pitch0: number,
    L: number,
    N: number,
    beta: number,
    sgn: number,
    rate: (s: number) => number[],
    drift: number
  ) {
    const u = V(Math.sin(headingAz), 0, Math.cos(headingAz));
    const d = u.clone().multiplyScalar(Math.cos(pitch0)).addScaledVector(UP, Math.sin(pitch0)).normalize();
    const n = UP.clone().multiplyScalar(Math.cos(pitch0)).addScaledVector(u, -Math.sin(pitch0)).normalize();
    const p = base.clone();
    const ds = L / N;
    const curlAxis = () => {
      const side = new THREE.Vector3().crossVectors(d, n).normalize();
      return side.multiplyScalar(Math.cos(beta)).addScaledVector(n, Math.sin(beta)).normalize();
    };
    const oral = () => new THREE.Vector3().crossVectors(curlAxis(), d).normalize().multiplyScalar(sgn);
    const nodes: Node[] = [{ p: p.clone(), d: d.clone(), n: n.clone(), o: oral(), s: 0 }];
    let loop: Loop | null = null;
    for (let j = 0; j < N; j++) {
      const s = (j + 0.5) / N;
      const [pr, yr, cr] = rate(s);
      if (pr) {
        const side = new THREE.Vector3().crossVectors(d, n).normalize();
        d.applyAxisAngle(side, pr * ds);
        n.applyAxisAngle(side, pr * ds);
      }
      if (yr) d.applyAxisAngle(n, yr * ds);
      let used: THREE.Vector3 | null = null;
      if (cr) {
        const a = curlAxis();
        const ang = cr * ds * sgn;
        d.applyAxisAngle(a, ang);
        n.applyAxisAngle(a, ang);
        used = a;
        if (!loop) {
          const inward = new THREE.Vector3().crossVectors(a, d).normalize().multiplyScalar(sgn);
          const c = p
            .clone()
            .addScaledVector(d, ds / 2)
            .addScaledVector(inward, ds / 2 / Math.tan(Math.abs(cr * ds) / 2));
          loop = { center: c, axis: a.clone(), steps: 0 };
        }
        loop.steps++;
      }
      d.normalize();
      n.addScaledVector(d, -n.dot(d)).normalize();
      p.addScaledVector(d, ds);
      if (used && drift && loop) p.addScaledVector(loop.axis, drift);
      const sn = (j + 1) / N;
      const r = rad(sn);
      if (p.y < r) {
        p.y = r;
        d.y = 0;
        d.normalize();
        n.set(0, 1, 0);
      }
      nodes.push({ p: p.clone(), d: d.clone(), n: n.clone(), o: oral(), s: sn });
    }
    return { nodes, loop };
  }

  type Arm = { name: string; nodes: Node[]; stride: number; loop: Loop | null; key: boolean };
  const arms: Arm[] = [];
  const betaTable = [0, 0.5, 1.3, 0.25, 1.4, 0.35, 1.2, 0.15];
  const curlTable = [0, 3.8, 4.4, 3.0, 4.6, 3.2, 4.3, 4.6];
  for (let i = 0; i < 8; i++) {
    const az = ((i + 0.5) * Math.PI) / 4;
    const name = i < 4 ? `armL${i + 1}` : `armR${8 - i}`;
    const base = V(Math.sin(az) * 0.075, 0.085, Math.cos(az) * 0.075);
    if (i === 0) {
      // the proud key-bearing arm: rises, then coils outward around the key
      const L = 0.62;
      const N = 24;
      const res = runArm(
        base,
        0.85,
        0.05,
        L,
        N,
        0,
        -1,
        (s) => {
          if (s < 0.1) return [0, 0, 0];
          if (s < 0.42) return [1.45 / (0.32 * L), 0, 0];
          if (s < 0.7) return [0.1 / (0.28 * L), 0, 0];
          return [0, 0, 45];
        },
        0.006
      );
      arms.push({ name, nodes: res.nodes, stride: 4, loop: res.loop, key: true });
    } else {
      const L = 0.4 + 0.07 * rand();
      const N = 18;
      const sc = i === 7 ? 0.45 : 0.5 + 0.12 * rand();
      const total = curlTable[i] + 0.4 * rand();
      const sideSign = Math.sin(az) >= 0 ? 1 : -1;
      const beta = betaTable[i] * sideSign;
      const yawK = (rand() - 0.5) * 1.6;
      const res = runArm(
        base,
        az + (rand() - 0.5) * 0.15,
        -0.55,
        L,
        N,
        beta,
        1,
        (s) => [0, yawK, s > sc ? (total * 2 * (s - sc)) / ((1 - sc) * (1 - sc)) / L : 0],
        0
      );
      arms.push({ name, nodes: res.nodes, stride: 3, loop: null, key: false });
    }
  }

  // ---------------------------------------------------------------- skeleton
  joint("body", bodyC, undefined, "spine");
  joint("head", headC, "body", "head");
  joint("mantle", V(0, 0.24, -0.05), "head", "spine");
  joint("mantleTip", mantleTop, "mantle", "spine");
  joint("eyeL", eyes[0].c, "head");
  joint("eyeR", eyes[1].c, "head");
  joint("jaw", V(0, 0.042, 0.012), "body", "jaw");
  for (const a of arms) {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < a.nodes.length; k += a.stride) pts.push(a.nodes[k].p);
    if (!sdk) continue;
    let done = false;
    try {
      const ch = B.chain(a.name, pts.map(arr), { parent: J.body, role: "tentacle" });
      done = !!ch;
    } catch {
      done = false;
    }
    if (!done) {
      let parent = "body";
      pts.forEach((p, k) => {
        const nm = `${a.name}_${k}`;
        joint(nm, p, parent, "tentacle");
        parent = nm;
      });
    }
  }

  // ---------------------------------------------------------------- palette
  const C = {
    mantle: "#e2623f",
    head: "#d9573a",
    neck: "#dd5d3d",
    skirt: "#b8462e",
    rust: "#8e3420",
    pale1: "#f5c2a4",
    pale2: "#f8d3b8",
    fleck: "#fff1e0",
    bump1: "#ea7a55",
    bump2: "#c94b31",
    sucker: "#f6e3c4",
    suckerIn: "#d98f7a",
    eye: "#f4b934",
    iris: "#e0861c",
    pupil: "#1a1210",
    shine: "#fffaf0",
    lid: "#b94a31",
    lidLow: "#d4583c",
    brow: "#8e3420",
    papilla: "#ec7650",
    beak: "#2a1c17",
    brass: "#c99a2e",
    brassDark: "#8c6a22",
    brassHi: "#e3c060",
    verdigris: "#5aa58e",
  };
  const armGrad = ["#cf4f35", "#d85d3e", "#e06d48", "#e88054", "#ef9463", "#f3a674"];
  const armCol = (s: number) => armGrad[Math.min(5, Math.floor(s * 6))];

  // ---------------------------------------------------------------- arms geometry
  for (const a of arms) {
    const ns = a.nodes;
    const N = ns.length - 1;
    for (let j = 0; j < N; j++) {
      seg(ns[j].p, ns[j + 1].p, rad(ns[j].s), rad(ns[j + 1].s), armCol((ns[j].s + ns[j + 1].s) / 2));
    }
    for (let j = 0; j <= N; j++) ball(ns[j].p, rad(ns[j].s) * (j === 0 ? 1.05 : 1.0), armCol(ns[j].s));

    // suckers: staggered double row on the oral side
    const count = Math.round(1.6 * N);
    for (let k = 0; k < count; k++) {
      const t = 2 + ((N - 2.6) * k) / (count - 1);
      const j = Math.min(N - 1, Math.floor(t));
      const f = t - j;
      const A = ns[j];
      const Bn = ns[j + 1];
      const P = A.p.clone().lerp(Bn.p, f);
      const T = A.d.clone().lerp(Bn.d, f).normalize();
      const O = A.o.clone().lerp(Bn.o, f);
      O.addScaledVector(T, -O.dot(T)).normalize();
      const W = new THREE.Vector3().crossVectors(T, O).normalize();
      const phi = k % 2 === 0 ? 0.5 : -0.5;
      const R = O.clone().multiplyScalar(Math.cos(phi)).addScaledVector(W, Math.sin(phi)).normalize();
      const s = A.s + (Bn.s - A.s) * f;
      const r = rad(s);
      const rs = r * 0.42;
      const h = r * 0.34;
      const c = P.clone().addScaledVector(R, r * 0.9);
      disc(c, R, rs, h, C.sucker, 8);
      if (k < 14) disc(c.clone().addScaledVector(R, h * 0.18), R, rs * 0.5, h * 1.05, C.suckerIn, 6);
    }

    // pale mottling along the arm flanks
    for (let j = 1; j < N - 3; j += 2) {
      const nd = ns[j];
      const W = new THREE.Vector3().crossVectors(nd.d, nd.o).normalize().multiplyScalar(j % 4 === 1 ? 1 : -1);
      const r = rad(nd.s);
      lens(nd.p.clone().addScaledVector(W, r * 0.93), W, r * 0.55, 0.0022, rand() < 0.5 ? C.pale1 : C.pale2, 6);
    }
  }

  // ---------------------------------------------------------------- body geometry
  {
    const g = new THREE.SphereGeometry(1, 14, 10);
    g.scale(mantleR.x, mantleR.y, mantleR.z);
    g.applyMatrix4(tilt);
    put(g, C.mantle, mantleC);
  }
  {
    const g = new THREE.SphereGeometry(1, 14, 9);
    g.scale(headR.x, headR.y, headR.z);
    put(g, C.head, headC);
  }
  {
    const g = new THREE.SphereGeometry(1, 12, 8);
    g.scale(0.098, 0.075, 0.1);
    put(g, C.neck, V(0, 0.2, -0.025));
  }
  {
    const g = new THREE.SphereGeometry(1, 16, 6);
    g.scale(0.135, 0.04, 0.135);
    put(g, C.skirt, V(0, 0.075, 0));
  }

  // beak (upper on head, lower on jaw)
  cone(V(0, 0.05, 0.004), V(0, -1, 0.15), 0.012, 0.024, C.beak, 6);
  cone(V(0, 0.046, 0.018), V(0, -0.6, 0.8), 0.008, 0.018, C.beak, 5);

  // siphon on the right flank
  {
    const s0 = V(-0.082, 0.16, -0.035);
    const dir = V(-0.55, -0.25, -0.55).normalize();
    const s1 = s0.clone().addScaledVector(dir, 0.05);
    seg(s0, s1, 0.016, 0.012, C.skirt, 8);
    disc(s1, dir, 0.009, 0.004, "#5a1e14", 8);
    ball(s0, 0.016, C.skirt, 8, 5);
  }

  // mottling, freckles and bumps on the mantle
  const insideHead = (p: THREE.Vector3) => {
    const q = p.clone().sub(headC);
    return (q.x / headR.x) ** 2 + (q.y / headR.y) ** 2 + (q.z / headR.z) ** 2 < 1.0;
  };
  const insideMantle = (p: THREE.Vector3) => {
    const q = p.clone().sub(mantleC).applyMatrix4(tiltInv);
    return (q.x / mantleR.x) ** 2 + (q.y / mantleR.y) ** 2 + (q.z / mantleR.z) ** 2 < 1.0;
  };
  const nearEye = (p: THREE.Vector3) => eyes.some((e) => e.p.distanceTo(p) < 0.05);

  for (let k = 0; k < 120; k++) {
    const { p, n } = ellPoint(mantleC, mantleR, tilt, randDir());
    if (p.y < 0.17 || insideHead(p) || nearEye(p)) continue;
    const t = rand();
    if (t < 0.36) {
      const r = 0.005 + 0.007 * rand();
      ball(p.clone().addScaledVector(n, -r * 0.3), r, rand() < 0.65 ? C.bump1 : C.bump2, 6, 4);
    } else if (t < 0.72) {
      const big = rand() < 0.2;
      lens(p, n, big ? 0.03 + 0.012 * rand() : 0.012 + 0.014 * rand(), 0.003, rand() < 0.5 ? C.pale1 : C.pale2, 7);
    } else if (t < 0.86) {
      lens(p, n, 0.008 + 0.008 * rand(), 0.003, C.rust, 6);
    } else {
      lens(p, n, 0.004 + 0.002 * rand(), 0.0025, C.fleck, 5);
    }
  }
  for (let k = 0; k < 60; k++) {
    const { p, n } = ellPoint(headC, headR, null, randDir());
    if (p.y < 0.115 || insideMantle(p) || nearEye(p)) continue;
    const t = rand();
    if (t < 0.45) {
      const r = 0.004 + 0.006 * rand();
      ball(p.clone().addScaledVector(n, -r * 0.3), r, rand() < 0.6 ? C.bump1 : C.bump2, 6, 4);
    } else if (t < 0.85) {
      lens(p, n, 0.01 + 0.01 * rand(), 0.0025, rand() < 0.5 ? C.pale1 : C.pale2, 6);
    } else {
      lens(p, n, 0.004, 0.0025, C.fleck, 5);
    }
  }

  // ---------------------------------------------------------------- eyes and grumpy brows
  for (const e of eyes) {
    const sx = e.side;
    const ER = 0.03;
    ball(e.c, ER, C.eye, 12, 9);
    // socket rim
    {
      const g = new THREE.TorusGeometry(ER * 0.98, 0.007, 5, 14);
      const [x, y, z] = axesFor(e.n);
      basis(g, x, z, y); // torus axis (Z) along normal
      put(g, C.lidLow, e.c.clone().addScaledVector(e.n, -0.006));
    }
    const ex = new THREE.Vector3().crossVectors(UP, e.g).normalize();
    const ey = new THREE.Vector3().crossVectors(e.g, ex).normalize();
    disc(e.c.clone().addScaledVector(e.g, ER - 0.002), e.g, 0.018, 0.006, C.iris, 10);
    {
      const g = new THREE.BoxGeometry(0.027, 0.0085, 0.006);
      basis(g, ex, ey, e.g.clone());
      put(g, C.pupil, e.c.clone().addScaledVector(e.g, ER + 0.0015));
    }
    {
      const hd = e.g.clone().addScaledVector(ey, 0.5).addScaledVector(ex, 0.35 * sx).normalize();
      ball(e.c.clone().addScaledVector(hd, ER), 0.0045, C.shine, 6, 4);
    }
    // heavy upper lid, tipped toward the middle for a grumpy look
    const inner = V(-sx, 0, 0);
    const capDir = UP.clone().addScaledVector(e.g, 0.55).addScaledVector(inner, 0.35).normalize();
    {
      const g = new THREE.SphereGeometry(ER + 0.0045, 12, 4, 0, Math.PI * 2, 0, Math.PI * 0.42);
      alongY(g, capDir, e.g);
      put(g, C.lid, e.c.clone());
    }
    {
      const lowDir = UP.clone().multiplyScalar(-1).addScaledVector(e.g, 0.45).normalize();
      const g = new THREE.SphereGeometry(ER + 0.003, 12, 3, 0, Math.PI * 2, 0, Math.PI * 0.26);
      alongY(g, lowDir, e.g);
      put(g, C.lidLow, e.c.clone());
    }
    // brow ridge: outer end raised, inner end pulled down
    {
      const xb0 = new THREE.Vector3().crossVectors(UP, e.g).normalize();
      const xb = xb0.clone().addScaledVector(UP, 0.45 * sx).normalize();
      const zb = new THREE.Vector3().crossVectors(xb, capDir).normalize();
      const yb = new THREE.Vector3().crossVectors(zb, xb).normalize();
      const browC = e.c.clone().addScaledVector(capDir, ER + 0.009);
      const g = new THREE.BoxGeometry(0.058, 0.013, 0.02);
      basis(g, xb, yb, zb);
      put(g, C.brow, browC);
      const outer = browC.clone().addScaledVector(xb, 0.024 * sx);
      cone(outer, capDir.clone().add(V(sx * 0.3, 0.6, 0)).normalize(), 0.0075, 0.024, C.papilla, 5);
      cone(
        browC.clone().addScaledVector(xb, 0.002 * sx).addScaledVector(yb, 0.004),
        capDir.clone().add(V(0, 0.5, 0)).normalize(),
        0.005,
        0.014,
        C.papilla,
        5
      );
    }
  }

  // ---------------------------------------------------------------- the brass key
  const keyArm = arms.find((a) => a.key);
  if (keyArm && keyArm.loop) {
    const lp = keyArm.loop;
    let k = lp.axis.clone().normalize();
    if (k.x < 0) k.multiplyScalar(-1);
    const C0 = lp.center.clone().addScaledVector(lp.axis, (0.006 * lp.steps) / 2);
    let t = UP.clone().addScaledVector(k, -UP.dot(k));
    if (t.lengthSq() < 1e-6) t = V(0, 0, 1);
    t.normalize();
    const w = new THREE.Vector3().crossVectors(k, t).normalize();

    // shank
    seg(C0.clone().addScaledVector(k, -0.062), C0.clone().addScaledVector(k, 0.045), 0.0075, 0.0075, C.brass, 8);
    ball(C0.clone().addScaledVector(k, -0.064), 0.0085, C.brassDark, 8, 5);
    // collars
    for (const off of [0.03, 0.04]) {
      const g = new THREE.TorusGeometry(0.0095, 0.003, 5, 10);
      basis(g, t, w, k);
      put(g, C.brassDark, C0.clone().addScaledVector(k, off));
    }
    // bow (ring) with a little cross inside
    const bowC = C0.clone().addScaledVector(k, 0.045 + 0.022);
    {
      const g = new THREE.TorusGeometry(0.02, 0.0065, 6, 12);
      basis(g, k, t, w);
      put(g, C.brass, bowC);
    }
    {
      const g = new THREE.BoxGeometry(0.03, 0.0045, 0.0045);
      basis(g, k, t, w);
      put(g, C.brassDark, bowC.clone());
      const g2 = new THREE.BoxGeometry(0.0045, 0.03, 0.0045);
      basis(g2, k, t, w);
      put(g2, C.brassDark, bowC.clone());
      ball(bowC, 0.006, C.brassHi, 8, 5);
    }
    // bit with teeth
    {
      const g = new THREE.BoxGeometry(0.026, 0.024, 0.006);
      basis(g, k, t, w);
      put(g, C.brass, C0.clone().addScaledVector(k, -0.046).addScaledVector(t, -0.015));
      for (const [ko, h] of [
        [-0.038, 0.012],
        [-0.054, 0.008],
      ]) {
        const gt = new THREE.BoxGeometry(0.007, h, 0.006);
        basis(gt, k, t, w);
        put(gt, C.brassDark, C0.clone().addScaledVector(k, ko).addScaledVector(t, -0.027 - h / 2));
      }
    }
    // verdigris and a glint
    lens(bowC.clone().addScaledVector(t, 0.02).addScaledVector(w, 0.006), w, 0.006, 0.002, C.verdigris, 5);
    lens(C0.clone().addScaledVector(k, -0.05).addScaledVector(t, -0.02).addScaledVector(w, 0.0032), w, 0.005, 0.0015, C.verdigris, 5);
    lens(C0.clone().addScaledVector(k, 0.015).addScaledVector(t, 0.0072), t, 0.004, 0.0015, C.brassHi, 5);
  }

  if (rawGroup.children.length > 0) root.add(rawGroup);
  return root;
}
```