import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Baby Dragon with Hatched Egg",
  description:
    "A house-cat-sized teal baby dragon sitting proudly beside its broken speckled egg, with orange back spines, amber wing membranes, a spade-tipped tail and a wisp of smoke from one nostril.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "babyDragon" });

  // ---------- deterministic random ----------
  let seed = 1337;
  const rand = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---------- palette ----------
  const TEAL = 0x2aa6a0;
  const TEAL_D = 0x1b7f86;
  const TEAL_L = 0x59c9bd;
  const BELLY = 0xf3dc9a;
  const BELLY_L = 0xfff0bf;
  const ORANGE = 0xf29a3c;
  const AMBER = 0xffb62e;
  const CREAM = 0xefe0b8;
  const CLAW = 0xf8f0d8;
  const DARK = 0x1a1a2a;
  const MOUTH = 0x8a2f3a;

  // ---------- skeleton ----------
  const j = (name: string, at: number[], parent?: any) =>
    parent ? b.joint(name, { at, parent } as any) : b.joint(name, { at } as any);

  const hips = j("hips", [0, 0.15, -0.05]);
  const spine = j("spine", [0, 0.3, -0.03], hips);
  const neck = j("neck", [0, 0.38, 0.03], spine);
  const head = j("head", [0, 0.46, 0.08], neck);
  j("jaw", [0, 0.41, 0.15], head);
  const tailPts = [
    [0, 0.06, -0.17],
    [0, 0.06, -0.22],
    [0.07, 0.05, -0.31],
    [0.2, 0.045, -0.34],
    [0.31, 0.04, -0.25],
    [0.34, 0.035, -0.11],
  ];
  const tailCurve = new THREE.CatmullRomCurve3(tailPts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  let tp: any = hips;
  [0, 0.25, 0.5, 0.75].forEach((t, i) => {
    const p = tailCurve.getPoint(t);
    tp = j("tail" + (i + 1), [p.x, p.y, p.z], tp);
  });
  for (const [n, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const sh = j("shoulder" + n, [0.1 * s, 0.32, 0.06], spine);
    const el = j("elbow" + n, [0.11 * s, 0.17, 0.1], sh);
    j("hand" + n, [0.1 * s, 0.04, 0.16], el);
    const hp = j("hip" + n, [0.15 * s, 0.11, -0.04], hips);
    const kn = j("knee" + n, [0.16 * s, 0.1, 0.03], hp);
    j("foot" + n, [0.14 * s, 0.03, 0.08], kn);
    const ws = j("wingShoulder" + n, [0.1 * s, 0.34, -0.1], spine);
    const wr = j("wrist" + n, [0.3 * s, 0.52, -0.15], ws);
    j("wingFinger1" + n, [0.52 * s, 0.6, -0.22], wr);
    j("wingFinger2" + n, [0.5 * s, 0.38, -0.3], wr);
    j("wingFinger3" + n, [0.36 * s, 0.2, -0.28], wr);
  }

  // ---------- helpers ----------
  const mats = new Map<string, THREE.Material>();
  const mat = (color: number, extra = ""): THREE.MeshStandardMaterial => {
    const key = color + extra;
    let m = mats.get(key) as THREE.MeshStandardMaterial;
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.04,
        flatShading: true,
        side: extra === "2" ? THREE.DoubleSide : THREE.FrontSide,
      });
      mats.set(key, m);
    }
    return m;
  };
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);

  const add = (
    geo: THREE.BufferGeometry,
    color: number,
    pos: number[],
    o: { rot?: number[]; scale?: number[]; side?: boolean; name?: string } = {}
  ) => {
    const m = new THREE.Mesh(geo, mat(color, o.side ? "2" : ""));
    m.position.set(pos[0], pos[1], pos[2]);
    if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    if (o.scale) m.scale.set(o.scale[0], o.scale[1], o.scale[2]);
    if (o.name) m.name = o.name;
    b.root.add(m);
    return m;
  };
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const ball = (r: number, color: number, pos: number[], scale?: number[], rot?: number[]) =>
    add(sphere(r), color, pos, { scale, rot });

  const rod = (a: number[], c: number[], r1: number, r2: number, color: number, seg = 6) => {
    const va = new THREE.Vector3(...(a as [number, number, number]));
    const vc = new THREE.Vector3(...(c as [number, number, number]));
    const d = vc.clone().sub(va);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, seg), mat(color));
    m.position.copy(va).add(vc).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    b.root.add(m);
    return m;
  };
  const cone = (
    r: number,
    h: number,
    color: number,
    pos: number[],
    dir: number[],
    seg = 5
  ) => {
    const g = new THREE.ConeGeometry(r, h, seg);
    g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, mat(color));
    m.position.set(pos[0], pos[1], pos[2]);
    m.quaternion.setFromUnitVectors(Y, new THREE.Vector3(dir[0], dir[1], dir[2]).normalize());
    b.root.add(m);
    return m;
  };

  // ---------- body ----------
  const bodyC = new THREE.Vector3(0, 0.2, -0.03);
  const bodyR = new THREE.Vector3(0.15, 0.19, 0.16);
  const bodyRot = new THREE.Euler(-0.25, 0, 0);
  const bodyQ = new THREE.Quaternion().setFromEuler(bodyRot);
  add(sphere(1, 10, 8), TEAL, bodyC.toArray(), { scale: bodyR.toArray(), rot: [bodyRot.x, 0, 0], name: "torso" });
  // belly
  add(sphere(1, 9, 7), BELLY, [0, 0.19, 0.055], { scale: [0.105, 0.175, 0.11], rot: [-0.2, 0, 0] });
  add(sphere(1, 8, 6), BELLY_L, [0, 0.12, 0.1], { scale: [0.075, 0.09, 0.07], rot: [-0.2, 0, 0] });
  // belly plates
  for (let i = 0; i < 6; i++) {
    const y = 0.09 + i * 0.045;
    const w = 0.085 - Math.abs(i - 2) * 0.008;
    add(sphere(1, 8, 4), i % 2 ? BELLY_L : 0xe9cd86, [0, y, 0.13 - Math.abs(y - 0.19) * 0.25 - 0.0], {
      scale: [w, 0.016, 0.03],
      rot: [-0.2, 0, 0],
    });
  }
  // back scale dots
  for (let i = 0; i < 46; i++) {
    const th = Math.acos(rand() * 1.5 - 0.6); // bias to upper / sides
    const ph = rand() * Math.PI * 2;
    const d = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
    if (d.z > 0.35) continue;
    const pos = d.clone().multiply(bodyR).applyQuaternion(bodyQ).add(bodyC);
    const n = new THREE.Vector3(d.x / bodyR.x, d.y / bodyR.y, d.z / bodyR.z).normalize().applyQuaternion(bodyQ);
    const s = 0.014 + rand() * 0.012;
    const m = add(sphere(1, 5, 4), i % 3 ? TEAL_L : TEAL_D, pos.toArray(), { scale: [s, s, s * 0.35] });
    m.quaternion.setFromUnitVectors(Z, n);
  }

  // neck + throat
  rod([0, 0.34, -0.02], [0, 0.45, 0.07], 0.09, 0.075, TEAL, 8);
  ball(0.06, BELLY, [0, 0.385, 0.09], [0.8, 0.9, 1.0]);

  // ---------- head ----------
  const headC = [0, 0.47, 0.09];
  ball(0.11, TEAL, headC, [1.12, 0.92, 1.0]);
  // brow ridges
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.06, 0.016, 0.05), TEAL_D, [0.065 * s, 0.53, 0.14], { rot: [0.1, 0, -0.35 * s] });
    ball(0.03, TEAL_L, [0.1 * s, 0.44, 0.12], [0.6, 0.8, 0.8]); // cheeks
  }
  // snout
  add(new THREE.BoxGeometry(0.11, 0.056, 0.115), TEAL, [0, 0.44, 0.21]);
  ball(0.04, TEAL, [0, 0.445, 0.265], [1.25, 0.8, 0.5]);
  add(new THREE.BoxGeometry(0.113, 0.01, 0.118), MOUTH, [0, 0.41, 0.205]); // mouth interior
  // lower jaw
  add(new THREE.BoxGeometry(0.1, 0.03, 0.105), BELLY, [0, 0.393, 0.2], { name: "jawMesh" });
  ball(0.034, BELLY, [0, 0.393, 0.255], [1.4, 0.7, 0.6]);
  // grin teeth
  for (let i = 0; i < 5; i++) {
    const x = -0.045 + i * 0.0225;
    cone(0.009, 0.02, CLAW, [x, 0.413, 0.268], [0, -1, 0], 4);
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      cone(0.008, 0.016, CLAW, [0.058 * s, 0.413, 0.2 - k * 0.032], [0, -1, 0], 4);
    }
    cone(0.007, 0.014, CLAW, [0.035 * s, 0.409, 0.262], [0, 1, 0], 4);
  }
  // grin corners
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.01, 0.014, 0.03), TEAL_D, [0.058 * s, 0.42, 0.15], { rot: [0, 0, 0.5 * s] });
  }
  // nostrils
  for (const s of [1, -1]) ball(0.009, DARK, [0.028 * s, 0.457, 0.287], [1, 0.7, 0.6]);

  // eyes
  for (const s of [1, -1]) {
    ball(0.042, 0xfff0c8, [0.068 * s, 0.495, 0.168], [1, 1.05, 0.8]);
    ball(0.036, AMBER, [0.071 * s, 0.495, 0.178], [1, 1.05, 0.8]);
    ball(0.02, DARK, [0.075 * s, 0.495, 0.195], [0.55, 1.5, 0.45]);
    ball(0.009, 0xffffff, [0.08 * s, 0.512, 0.2]);
    // lid
    add(new THREE.BoxGeometry(0.07, 0.01, 0.05), TEAL_D, [0.07 * s, 0.535, 0.175], { rot: [0.25, 0, -0.3 * s] });
  }
  // horns
  for (const s of [1, -1]) {
    cone(0.024, 0.09, CREAM, [0.05 * s, 0.55, 0.05], [0.35 * s, 1, -0.7], 5);
    cone(0.014, 0.04, CREAM, [0.095 * s, 0.5, 0.01], [1 * s, 0.4, -0.5], 4);
    // frill fins
    cone(0.02, 0.07, ORANGE, [0.11 * s, 0.47, 0.03], [1.1 * s, 0.1, -0.5], 4);
    cone(0.015, 0.05, ORANGE, [0.105 * s, 0.43, 0.04], [1.1 * s, -0.3, -0.5], 4);
  }
  // nose bumps
  for (const s of [1, -1]) ball(0.012, TEAL_D, [0.03 * s, 0.472, 0.25], [1, 0.8, 1]);

  // smoke wisp from left nostril
  for (let i = 0; i < 7; i++) {
    const m = new THREE.MeshStandardMaterial({
      color: 0xdfe6ea,
      roughness: 1,
      transparent: true,
      opacity: 0.8 - i * 0.09,
      depthWrite: false,
      flatShading: true,
    });
    const r = 0.009 + i * 0.0055;
    const mesh = new THREE.Mesh(sphere(r, 6, 5), m);
    mesh.position.set(0.03 + 0.03 * Math.sin(i * 0.85), 0.5 + i * 0.036, 0.29 + 0.015 * i + 0.02 * Math.cos(i * 0.85));
    b.root.add(mesh);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    rod([0.1 * s, 0.32, 0.06], [0.11 * s, 0.17, 0.1], 0.045, 0.036, TEAL);
    ball(0.04, TEAL, [0.1 * s, 0.31, 0.06]);
    ball(0.034, TEAL, [0.11 * s, 0.17, 0.1]);
    rod([0.11 * s, 0.17, 0.1], [0.1 * s, 0.045, 0.16], 0.036, 0.03, TEAL);
    ball(0.05, TEAL_L, [0.1 * s, 0.03, 0.175], [1, 0.62, 1.15]);
    for (let k = -1; k <= 1; k++) {
      ball(0.018, TEAL_L, [(0.1 + k * 0.026) * s, 0.02, 0.215], [1, 0.8, 1]);
      cone(0.009, 0.026, CLAW, [(0.1 + k * 0.028) * s, 0.02, 0.228], [k * 0.15 * s, 0.05, 1], 4);
    }
  }
  // ---------- hind legs ----------
  for (const s of [1, -1]) {
    ball(0.092, TEAL, [0.15 * s, 0.11, -0.04], [0.75, 1.0, 1.1]);
    ball(0.06, TEAL_L, [0.19 * s, 0.13, -0.02], [0.4, 0.8, 0.8]);
    rod([0.16 * s, 0.1, 0.03], [0.14 * s, 0.04, 0.09], 0.04, 0.032, TEAL);
    ball(0.055, TEAL_L, [0.14 * s, 0.027, 0.1], [0.95, 0.5, 1.45]);
    for (let k = -1; k <= 1; k++) {
      ball(0.016, TEAL_L, [(0.14 + k * 0.026) * s, 0.016, 0.172], [1, 0.8, 1]);
      cone(0.009, 0.026, CLAW, [(0.14 + k * 0.028) * s, 0.016, 0.185], [k * 0.15 * s, 0.05, 1], 4);
    }
  }

  // ---------- tail ----------
  const N = 15;
  const radiusAt = (t: number) => 0.078 * (1 - t) + 0.024 * t;
  const tailSamples: { p: THREE.Vector3; r: number; t: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = tailCurve.getPoint(t);
    const r = radiusAt(t);
    p.y = Math.max(r * 0.95, 0.02);
    if (t < 0.2) p.y = 0.05 + r * 0.6;
    tailSamples.push({ p, r, t });
    ball(r * 1.12, i % 4 === 3 ? TEAL_D : TEAL, p.toArray(), [1, 0.95, 1.15]);
  }
  // belly underside stripe on the tail
  for (let i = 1; i <= N - 3; i += 2) {
    const s = tailSamples[i];
    ball(s.r * 0.6, BELLY, [s.p.x, s.p.y - s.r * 0.35, s.p.z], [1, 0.4, 1]);
  }
  // spade
  {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.03, 0.025);
    shape.lineTo(0.055, 0.075);
    shape.lineTo(0, 0.125);
    shape.lineTo(-0.055, 0.075);
    shape.lineTo(-0.03, 0.025);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: false });
    const tan = tailCurve.getTangent(1);
    const g = new THREE.Group();
    const tip = tailSamples[N].p;
    g.position.set(tip.x, 0.012, tip.z);
    g.rotation.y = Math.atan2(-tan.x, -tan.z);
    const m = new THREE.Mesh(geo, mat(ORANGE));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.0;
    g.add(m);
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.006, 0.1), mat(0xd9792a));
    rib.position.set(0, 0.016, -0.065);
    g.add(rib);
    b.root.add(g);
  }

  // ---------- back spines ----------
  const backLine = new THREE.CatmullRomCurve3(
    [
      [0, 0.535, -0.03],
      [0, 0.45, -0.1],
      [0, 0.36, -0.17],
      [0, 0.26, -0.2],
      [0, 0.16, -0.21],
      [0, 0.1, -0.2],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  );
  const nBack = 9;
  for (let i = 0; i < nBack; i++) {
    const t = i / (nBack - 1);
    const p = backLine.getPoint(t);
    const sz = 1 - t * 0.35;
    cone(0.02 * sz, 0.06 * sz, ORANGE, p.toArray(), [0, 1, -0.7 + t * 0.2], 5);
    ball(0.016 * sz, 0xd9792a, p.toArray());
  }
  for (let i = 2; i < 12; i += 1) {
    const s = tailSamples[i];
    const sz = 0.85 * (1 - s.t * 0.8);
    cone(0.018 * sz, 0.055 * sz, ORANGE, [s.p.x, s.p.y + s.r * 0.85, s.p.z], [0, 1, -0.1], 5);
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = [0.1 * s, 0.34, -0.1];
    const W = [0.3 * s, 0.52, -0.15];
    const T1 = [0.52 * s, 0.6, -0.22];
    const T2 = [0.5 * s, 0.38, -0.3];
    const T3 = [0.36 * s, 0.2, -0.28];
    const B = [0.13 * s, 0.14, -0.2];
    // membrane
    const pts = [W, T1, T2, T3, B, S];
    const tris: number[][] = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 5],
    ];
    const pos: number[] = [];
    for (const t of tris) for (const k of t) pos.push(...pts[k]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mem = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: AMBER,
        roughness: 0.5,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        flatShading: true,
        depthWrite: false,
      })
    );
    mem.name = "wingMembrane" + (s > 0 ? "L" : "R");
    b.root.add(mem);
    // bones
    rod(S, W, 0.026, 0.02, TEAL, 6);
    ball(0.03, TEAL, S);
    ball(0.026, TEAL_L, W);
    rod(W, T1, 0.014, 0.006, TEAL_D, 5);
    rod(W, T2, 0.014, 0.006, TEAL_D, 5);
    rod(W, T3, 0.014, 0.006, TEAL_D, 5);
    for (const T of [T1, T2, T3]) cone(0.008, 0.03, CLAW, T, [T[0] - W[0], T[1] - W[1], T[2] - W[2]], 4);
    // wrist claw
    cone(0.012, 0.045, CLAW, [W[0], W[1] + 0.02, W[2]], [0.2 * s, 1, 0.3], 4);
  }

  // ---------- egg ----------
  const R = 0.13;
  const eggC = new THREE.Vector3(-0.3, 0.1625, 0.14);
  const thStart = Math.PI * 0.45;
  const shellGeo = new THREE.SphereGeometry(R, 12, 8, 0, Math.PI * 2, thStart, Math.PI - thStart);
  add(shellGeo, 0xf4ead2, eggC.toArray(), { scale: [1, 1.25, 1], side: true, name: "eggShell" });
  add(
    new THREE.SphereGeometry(R * 0.95, 12, 8, 0, Math.PI * 2, thStart, Math.PI - thStart),
    0xf6c9b0,
    eggC.toArray(),
    { scale: [1, 1.25, 1], side: true }
  );
  // jagged rim
  const rimR = R * Math.sin(thStart);
  const rimY = eggC.y + R * Math.cos(thStart) * 1.25;
  const nShard = 11;
  for (let i = 0; i < nShard; i++) {
    const a = (i / nShard) * Math.PI * 2;
    const h = i % 2 ? 0.035 + rand() * 0.02 : 0.07 + rand() * 0.04;
    const px = eggC.x + Math.cos(a) * rimR * 0.99;
    const pz = eggC.z + Math.sin(a) * rimR * 0.99;
    const m = cone(0.034, h, 0xf4ead2, [px, rimY - 0.002, pz], [Math.cos(a) * 0.25, 1, Math.sin(a) * 0.25], 3);
    m.material = mat(0xf4ead2, "2");
  }
  // speckles
  for (let i = 0; i < 40; i++) {
    const th = thStart + 0.05 + rand() * (Math.PI - thStart - 0.15);
    const ph = rand() * Math.PI * 2;
    const lp = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
    const pos = new THREE.Vector3(lp.x * R, lp.y * R * 1.25, lp.z * R).add(eggC);
    const n = new THREE.Vector3(lp.x, lp.y / 1.25, lp.z).normalize();
    if (pos.y < 0.012) continue;
    const s = 0.008 + rand() * 0.012;
    const m = add(sphere(1, 5, 4), i % 3 ? 0x7a5a3a : 0x3b9c92, pos.toArray(), { scale: [s, s, s * 0.3] });
    m.quaternion.setFromUnitVectors(Z, n);
  }
  // loose shell pieces
  add(new THREE.SphereGeometry(0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.35), 0xf4ead2, [-0.15, -0.046, 0.33], {
    rot: [0.2, 0.5, -0.15],
    side: true,
  });
  add(new THREE.SphereGeometry(0.065, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.38), 0xf4ead2, [-0.42, -0.028, 0.34], {
    rot: [-0.15, 1.2, 0.2],
    side: true,
  });
  const shard = cone(0.04, 0.08, 0xf4ead2, [-0.33, 0.0, 0.4], [0.5, 0.35, 0.2], 3);
  shard.material = mat(0xf4ead2, "2");

  return b.root;
}
