import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Cozy Lighthouse Diorama",
  description:
    "A tabletop diorama: a red-and-white striped lighthouse with a glowing lantern room and black iron gallery, a keeper's cottage with a crooked chimney and blue door, a wooden jetty with a moored rowboat, seagulls, grass tufts and wildflowers on a rocky islet, turquoise water with white foam, all on a round wooden display base.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse_diorama" });
  const root = new THREE.Group();
  root.name = "diorama";
  b.root.add(root);

  // ---------- deterministic random ----------
  const R: any = rng(42);
  let seed = 42 >>> 0;
  const mul = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rand = (): number => {
    if (typeof R === "function") {
      const v = R();
      if (typeof v === "number") return v;
    }
    if (R && typeof R.next === "function") {
      const v = R.next();
      if (typeof v === "number") return v;
    }
    if (R && typeof R.float === "function") {
      const v = R.float();
      if (typeof v === "number") return v;
    }
    return mul();
  };
  const rr = (a: number, c: number) => a + (c - a) * rand();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];

  // ---------- materials & helpers ----------
  const mats = new Map<string, THREE.Material>();
  const mat = (c: string, glow = 0): THREE.Material => {
    const key = c + "|" + glow;
    let m = mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.72,
        metalness: 0.04,
        flatShading: true,
        emissive: glow > 0 ? new THREE.Color(c) : new THREE.Color(0x000000),
        emissiveIntensity: glow,
        side: THREE.DoubleSide,
      });
      mats.set(key, m);
    }
    return m;
  };

  type Opt = { r?: number[]; s?: number[]; to?: THREE.Object3D; glow?: number; m?: THREE.Material };
  const put = (geo: THREE.BufferGeometry, color: string, p: number[], o: Opt = {}): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, o.m ?? mat(color, o.glow ?? 0));
    mesh.position.set(p[0], p[1], p[2]);
    if (o.r) mesh.rotation.set(o.r[0], o.r[1], o.r[2]);
    if (o.s) mesh.scale.set(o.s[0], o.s[1], o.s[2]);
    (o.to ?? root).add(mesh);
    return mesh;
  };
  const Box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const Cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const flatTorus = (r: number, tube: number, seg: number, arc = Math.PI * 2) => {
    const g = new THREE.TorusGeometry(r, tube, 4, seg, arc);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const rod = (a: number[], c: number[], r: number, color: string, to: THREE.Object3D = root) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const d = B.clone().sub(A);
    const len = d.length();
    const mesh = put(Cyl(r, r, len, 5), color, [(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2], { to });
    const dn = d.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const axis = new THREE.Vector3().crossVectors(up, dn);
    if (axis.length() > 1e-6) {
      mesh.quaternion.setFromAxisAngle(axis.normalize(), Math.acos(THREE.MathUtils.clamp(up.dot(dn), -1, 1)));
    }
    return mesh;
  };

  // palette
  const WOOD_BASE = "#7a4a2b";
  const BRASS = "#c9a24a";
  const WATER = "#22b3b0";
  const SHALLOW = "#63d2c6";
  const FOAM = "#f4fbfb";
  const RIPPLE = "#9be6dc";
  const ROCKS = ["#8a8f96", "#767b83", "#9ea3a8", "#6b6f75", "#83807a"];
  const GRASS = ["#5f9e3e", "#7cc04f", "#4d8a35", "#8fcf5c"];
  const RED = "#d8433b";
  const WHITE = "#f5efe4";
  const IRON = "#23262b";
  const GLASS = "#ffe28a";
  const BLUE = "#2f6db5";
  const PLANKS = ["#b98a5a", "#a87a4c", "#c69a68"];
  const DARKWOOD = "#6d4a2e";
  const FLOWERS = ["#ffd23f", "#ff7aa8", "#b77cf2", "#ffffff", "#ff8c42"];

  const G = 0.161; // grass top
  const WT = 0.082; // water top

  // ---------- display base ----------
  put(Cyl(0.335, 0.34, 0.012, 24), "#3b2416", [0, 0.006, 0], { r: [0, Math.PI / 24, 0] });
  put(Cyl(0.32, 0.326, 0.05, 24), WOOD_BASE, [0, 0.037, 0], { r: [0, Math.PI / 24, 0] });
  put(flatTorus(0.321, 0.0035, 48), BRASS, [0, 0.062, 0]);
  put(flatTorus(0.336, 0.003, 48), BRASS, [0, 0.0125, 0]);
  // plaque
  put(Box(0.11, 0.026, 0.004), BRASS, [0, 0.037, 0.3205]);
  put(Box(0.094, 0.014, 0.002), "#2a1a10", [0, 0.037, 0.3228]);
  for (let i = 0; i < 3; i++) put(Box(0.012, 0.0025, 0.001), BRASS, [-0.03 + i * 0.03, 0.037, 0.3241]);
  for (const sx of [-1, 1]) put(new THREE.IcosahedronGeometry(0.0018, 0), BRASS, [sx * 0.05, 0.037, 0.3232]);

  // ---------- water ----------
  put(Cyl(0.306, 0.306, 0.026, 40), WATER, [0, 0.069, 0]);
  put(Cyl(0.215, 0.235, 0.003, 14), SHALLOW, [0, 0.0835, 0]);
  put(flatTorus(0.19, 0.009, 24), FOAM, [0, 0.085, 0], { s: [1, 0.6, 1] });
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rr(-0.1, 0.1);
    const rad = rr(0.178, 0.205);
    put(new THREE.IcosahedronGeometry(rr(0.007, 0.014), 0), FOAM, [Math.cos(a) * rad, 0.085, Math.sin(a) * rad], {
      s: [1, 0.35, 1],
      r: [0, rand() * 3, 0],
    });
  }
  // ripple arcs
  const ripples: number[][] = [
    [0.245, 0.3, 1.4],
    [0.27, 2.2, 1.1],
    [0.255, 3.9, 1.3],
    [0.28, 5.2, 0.9],
  ];
  for (const [rad, start, len] of ripples) {
    put(flatTorus(rad, 0.0025, 12, len), RIPPLE, [0, 0.0835, 0], { r: [0, start, 0], s: [1, 0.5, 1] });
  }
  // rocks in the water with foam collars
  const waterRocks: number[][] = [
    [0.235, -0.14, 0.026],
    [-0.245, 0.09, 0.022],
    [-0.15, -0.225, 0.028],
    [0.262, 0.04, 0.016],
  ];
  for (const [x, z, s] of waterRocks) {
    put(new THREE.DodecahedronGeometry(s, 0), pick(ROCKS), [x, 0.078, z], { s: [1, 0.8, 1], r: [rand(), rand(), rand()] });
    put(flatTorus(s * 1.05, 0.0045, 10), FOAM, [x, 0.084, z], { s: [1, 0.6, 1] });
  }
  // buoys
  for (const [x, z] of [
    [-0.13, 0.22],
    [0.2, 0.17],
  ]) {
    put(new THREE.SphereGeometry(0.009, 8, 5), RED, [x, 0.086, z]);
    put(Cyl(0.0092, 0.0092, 0.004, 8), "#ffffff", [x, 0.088, z]);
    put(Cyl(0.0012, 0.0012, 0.012, 4), IRON, [x, 0.099, z]);
    put(flatTorus(0.012, 0.002, 10), FOAM, [x, 0.084, z], { s: [1, 0.5, 1] });
  }

  // ---------- island ----------
  put(Cyl(0.15, 0.18, 0.08, 9), "#7c8189", [0, 0.11, 0], { r: [0, 0.2, 0] });
  put(Cyl(0.168, 0.168, 0.008, 9), "#6e4b2e", [0, 0.151, 0], { r: [0, 0.35, 0] });
  put(Cyl(0.163, 0.168, 0.008, 9), "#6fb04a", [0, 0.157, 0], { r: [0, 0.35, 0] });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + rr(-0.12, 0.12);
    if (a > 1.2 && a < 2.0) continue; // leave room for jetty & boat
    const rad = rr(0.162, 0.185);
    const s = rr(0.03, 0.055);
    put(new THREE.DodecahedronGeometry(s, 0), pick(ROCKS), [Math.cos(a) * rad, rr(0.09, 0.125), Math.sin(a) * rad], {
      s: [1, rr(0.7, 1.0), 1],
      r: [rand() * 3, rand() * 3, rand() * 3],
    });
  }
  // cliff chunks behind the tower
  for (const [x, y, z, s] of [
    [-0.11, 0.13, -0.11, 0.05],
    [-0.04, 0.12, -0.15, 0.045],
    [-0.15, 0.115, -0.03, 0.04],
  ]) {
    put(new THREE.DodecahedronGeometry(s, 0), pick(ROCKS), [x, y, z], { r: [rand(), rand(), rand()] });
  }

  // ---------- lighthouse ----------
  const TX = -0.065;
  const TZ = -0.05;
  put(Cyl(0.072, 0.08, 0.025, 8), "#a39e94", [TX, G + 0.0125, TZ]);
  const fT = G + 0.025;
  const TH = 0.3;
  const rBot = 0.062;
  const rTop = 0.045;
  const rAt = (y: number) => rBot + (rTop - rBot) * ((y - fT) / TH);
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const y0 = fT + (i * TH) / bands;
    const y1b = fT + ((i + 1) * TH) / bands;
    put(Cyl(rAt(y1b), rAt(y0), TH / bands, 12), i % 2 === 0 ? RED : WHITE, [TX, (y0 + y1b) / 2, TZ]);
  }
  // windows up the tower
  const winSpots: number[][] = [
    [0.12, 0.25],
    [0.2, -0.9],
    [0.27, 0.6],
  ];
  for (const [h, ang] of winSpots) {
    const y = fT + h;
    const r = rAt(y);
    const g = new THREE.Group();
    g.position.set(TX + Math.sin(ang) * r, y, TZ + Math.cos(ang) * r);
    g.rotation.y = ang;
    root.add(g);
    put(Box(0.016, 0.024, 0.006), "#efe9dc", [0, 0, 0], { to: g });
    put(Box(0.011, 0.018, 0.006), "#26354a", [0, 0.001, 0.0015], { to: g });
    put(Box(0.02, 0.003, 0.008), "#efe9dc", [0, -0.012, 0.001], { to: g });
  }
  // tower door facing the cottage
  {
    const ang = Math.PI / 4;
    const r = rAt(fT + 0.02);
    const g = new THREE.Group();
    g.position.set(TX + Math.sin(ang) * r, fT, TZ + Math.cos(ang) * r);
    g.rotation.y = ang;
    root.add(g);
    put(Box(0.024, 0.038, 0.006), "#efe9dc", [0, 0.019, 0], { to: g });
    put(Box(0.018, 0.033, 0.006), "#2d5e4f", [0, 0.0165, 0.0015], { to: g });
    put(new THREE.IcosahedronGeometry(0.0017, 0), BRASS, [0.006, 0.017, 0.005], { to: g });
    put(Box(0.03, 0.006, 0.014), "#a39e94", [0, -0.006, 0.008], { to: g });
  }
  const y1 = fT + TH;
  put(Cyl(0.07, 0.046, 0.016, 12), IRON, [TX, y1 - 0.006, TZ]);
  put(Cyl(0.074, 0.074, 0.008, 16), IRON, [TX, y1 + 0.006, TZ]);
  const dT = y1 + 0.01;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    put(Cyl(0.0018, 0.0018, 0.03, 4), IRON, [TX + Math.sin(a) * 0.07, dT + 0.015, TZ + Math.cos(a) * 0.07]);
  }
  put(flatTorus(0.07, 0.0022, 24), IRON, [TX, dT + 0.03, TZ]);
  put(flatTorus(0.07, 0.0015, 24), IRON, [TX, dT + 0.016, TZ]);
  put(Cyl(0.044, 0.046, 0.014, 12), "#c63a33", [TX, dT + 0.007, TZ]);
  const lw = dT + 0.014;
  put(Cyl(0.04, 0.04, 0.05, 8), GLASS, [TX, lw + 0.025, TZ], { glow: 1.4 });
  put(new THREE.IcosahedronGeometry(0.018, 0), "#fff6d0", [TX, lw + 0.025, TZ], { glow: 2.0 });
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    put(Box(0.004, 0.05, 0.004), IRON, [TX + Math.sin(a) * 0.04, lw + 0.025, TZ + Math.cos(a) * 0.04], { r: [0, a, 0] });
  }
  put(Cyl(0.046, 0.046, 0.006, 12), IRON, [TX, lw + 0.053, TZ]);
  const rT = lw + 0.056;
  put(new THREE.ConeGeometry(0.054, 0.045, 12), "#b2302a", [TX, rT + 0.0225, TZ]);
  put(new THREE.SphereGeometry(0.008, 8, 5), IRON, [TX, rT + 0.047, TZ]);
  put(Cyl(0.0015, 0.0015, 0.032, 4), IRON, [TX, rT + 0.066, TZ]);
  put(Box(0.026, 0.004, 0.0015), IRON, [TX, rT + 0.072, TZ], { r: [0, 0.5, 0] });
  put(new THREE.IcosahedronGeometry(0.004, 0), BRASS, [TX, rT + 0.084, TZ]);
  // light beam
  {
    const pivot = new THREE.Group();
    pivot.position.set(TX, lw + 0.025, TZ);
    pivot.rotation.y = -0.35;
    root.add(pivot);
    const bg = new THREE.ConeGeometry(0.05, 0.24, 10, 1, true);
    bg.translate(0, -0.12, 0);
    bg.rotateZ(-Math.PI / 2);
    const beamMat = new THREE.MeshStandardMaterial({
      color: "#fff3b0",
      emissive: new THREE.Color("#fff3b0"),
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.72,
      metalness: 0.04,
    });
    const beam = put(bg, "#fff3b0", [0, 0, 0], { to: pivot, m: beamMat });
    beam.rotation.z = -0.08;
  }

  // ---------- seagull ----------
  const gull = (parent: THREE.Object3D, pos: number[], ry: number, flying: boolean) => {
    const g = new THREE.Group();
    g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    parent.add(g);
    const W = "#fbfbf7";
    const GR = "#9aa3ad";
    put(new THREE.SphereGeometry(1, 8, 6), W, [0, 0.012, 0], { to: g, s: [0.011, 0.01, 0.02] });
    put(new THREE.SphereGeometry(0.0085, 8, 6), W, [0, 0.021, 0.016], { to: g });
    put(new THREE.ConeGeometry(0.0025, 0.01, 5), "#f2b632", [0, 0.02, 0.028], { to: g, r: [Math.PI / 2, 0, 0] });
    for (const s of [-1, 1]) put(new THREE.IcosahedronGeometry(0.0014, 0), "#111111", [s * 0.006, 0.023, 0.02], { to: g });
    put(Box(0.012, 0.003, 0.012), GR, [0, 0.014, -0.022], { to: g, r: [-0.2, 0, 0] });
    put(Box(0.012, 0.0032, 0.004), "#1d1d1d", [0, 0.0155, -0.029], { to: g, r: [-0.2, 0, 0] });
    if (flying) {
      for (const s of [-1, 1]) {
        put(Box(0.03, 0.0022, 0.016), GR, [s * 0.0215, 0.0167, 0], { to: g, r: [0, 0, s * 0.25] });
        put(Box(0.026, 0.0022, 0.012), GR, [s * 0.049, 0.021, -0.002], { to: g, r: [0, 0, -s * 0.2] });
        put(Box(0.01, 0.0024, 0.01), "#1d1d1d", [s * 0.065, 0.0178, -0.003], { to: g, r: [0, 0, -s * 0.2] });
      }
    } else {
      for (const s of [-1, 1]) {
        put(Box(0.004, 0.009, 0.024), GR, [s * 0.0105, 0.014, -0.004], { to: g, r: [0.15, 0, 0] });
        put(Box(0.0042, 0.006, 0.007), "#1d1d1d", [s * 0.0105, 0.016, -0.018], { to: g, r: [0.15, 0, 0] });
        put(Cyl(0.0012, 0.0012, 0.008, 4), "#f08a3c", [s * 0.004, 0.004, 0], { to: g });
        put(Box(0.004, 0.0012, 0.006), "#f08a3c", [s * 0.004, 0.0006, 0.002], { to: g });
      }
    }
    return g;
  };

  // ---------- keeper's cottage ----------
  const CX = 0.08;
  const CZ = 0.04;
  const CRY = -0.3;
  const cot = new THREE.Group();
  cot.position.set(CX, G, CZ);
  cot.rotation.y = CRY;
  root.add(cot);
  const W = 0.11;
  const D = 0.075;
  const H = 0.065;
  const GH = 0.04;
  const wallTop = 0.01 + H;
  const CREAM = "#f3e6c8";
  put(Box(W + 0.008, 0.01, D + 0.008), "#9a958c", [0, 0.005, 0], { to: cot });
  put(Box(W, H, D), CREAM, [0, 0.01 + H / 2, 0], { to: cot });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      put(Box(0.006, H, 0.006), "#ffffff", [sx * (W / 2), 0.01 + H / 2, sz * (D / 2)], { to: cot });
  {
    const sh = new THREE.Shape();
    sh.moveTo(-D / 2, 0);
    sh.lineTo(D / 2, 0);
    sh.lineTo(0, GH);
    sh.lineTo(-D / 2, 0);
    const gg = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false });
    gg.rotateY(Math.PI / 2);
    gg.translate(-W / 2, 0, 0);
    put(gg, CREAM, [0, wallTop, 0], { to: cot });
  }
  {
    const a = Math.atan(GH / (D / 2));
    const t = 0.008;
    const over = 0.016;
    const L = Math.sqrt((D / 2) ** 2 + GH ** 2) + over;
    for (const s of [1, -1]) {
      const down = new THREE.Vector3(0, -Math.sin(a), s * Math.cos(a));
      const n = new THREE.Vector3(0, Math.cos(a), s * Math.sin(a));
      const c = new THREE.Vector3(0, wallTop + GH / 2, (s * D) / 4)
        .addScaledVector(n, t / 2)
        .addScaledVector(down, over / 2);
      put(Box(W + 0.022, t, L), "#4d5a6e", [c.x, c.y, c.z], { to: cot, r: [s * a, 0, 0] });
      // shingle rows
      for (let k = 0; k < 3; k++) {
        const f = -L / 2 + (L * (k + 0.8)) / 3.4;
        const p = c.clone().addScaledVector(n, t / 2 + 0.001).addScaledVector(down, -f);
        put(Box(W + 0.022, 0.0025, 0.004), "#3c475a", [p.x, p.y, p.z], { to: cot, r: [s * a, 0, 0] });
      }
    }
    put(Box(W + 0.026, 0.008, 0.012), "#353e4d", [0, wallTop + GH + 0.004, 0], { to: cot });
  }
  // blue door
  put(Box(0.03, 0.046, 0.003), "#ffffff", [-0.02, 0.033, D / 2 + 0.0005], { to: cot });
  put(Box(0.024, 0.042, 0.004), BLUE, [-0.02, 0.031, D / 2 + 0.002], { to: cot });
  put(Box(0.008, 0.014, 0.002), "#24589a", [-0.0245, 0.04, D / 2 + 0.0043], { to: cot });
  put(Box(0.008, 0.014, 0.002), "#24589a", [-0.0155, 0.04, D / 2 + 0.0043], { to: cot });
  put(Box(0.018, 0.012, 0.002), "#24589a", [-0.02, 0.02, D / 2 + 0.0043], { to: cot });
  put(new THREE.IcosahedronGeometry(0.0022, 0), BRASS, [-0.012, 0.031, D / 2 + 0.005], { to: cot });
  put(Box(0.034, 0.006, 0.012), "#b9b4aa", [-0.02, 0.006, D / 2 + 0.008], { to: cot });
  // door lamp
  put(Box(0.003, 0.003, 0.008), IRON, [-0.043, 0.056, D / 2 + 0.004], { to: cot });
  put(Box(0.007, 0.009, 0.007), "#ffd77a", [-0.043, 0.05, D / 2 + 0.007], { to: cot, glow: 1.2 });
  put(Box(0.009, 0.002, 0.009), IRON, [-0.043, 0.0555, D / 2 + 0.007], { to: cot });

  const windowAt = (pos: number[], ry: number) => {
    const g = new THREE.Group();
    g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    cot.add(g);
    put(Box(0.03, 0.028, 0.003), "#ffffff", [0, 0, 0.0015], { to: g });
    put(Box(0.023, 0.021, 0.003), "#ffd77a", [0, 0, 0.003], { to: g, glow: 0.8 });
    put(Box(0.0025, 0.021, 0.002), "#ffffff", [0, 0, 0.0045], { to: g });
    put(Box(0.023, 0.0025, 0.002), "#ffffff", [0, 0, 0.0045], { to: g });
    for (const s of [-1, 1]) put(Box(0.009, 0.028, 0.003), BLUE, [s * 0.0205, 0, 0.002], { to: g });
    put(Box(0.032, 0.008, 0.01), "#8a5a34", [0, -0.018, 0.006], { to: g });
    for (let i = 0; i < 6; i++) {
      put(new THREE.IcosahedronGeometry(0.0035, 0), i % 2 ? pick(FLOWERS) : "#4d8a35", [-0.0125 + i * 0.005, -0.0125, 0.006 + rr(-0.002, 0.002)], { to: g });
    }
  };
  windowAt([0.025, 0.048, D / 2], 0);
  windowAt([W / 2, 0.048, 0], Math.PI / 2);
  windowAt([-0.02, 0.048, -D / 2], Math.PI);
  // life ring on the -x wall
  {
    const g = new THREE.Group();
    g.position.set(-W / 2 - 0.0035, 0.042, 0.005);
    g.rotation.y = -Math.PI / 2;
    cot.add(g);
    put(new THREE.TorusGeometry(0.011, 0.0035, 6, 12), "#e2493e", [0, 0, 0], { to: g });
    for (let k = 0; k < 4; k++) {
      put(new THREE.TorusGeometry(0.011, 0.0037, 6, 3, Math.PI / 5), "#ffffff", [0, 0, 0], { to: g, r: [0, 0, (k * Math.PI) / 2] });
    }
  }
  // crooked chimney + smoke
  put(Box(0.018, 0.04, 0.018), "#a5523a", [0.03, wallTop + 0.025, -0.02], { to: cot });
  put(Box(0.018, 0.022, 0.018), "#b15d42", [0.0325, wallTop + 0.055, -0.02], { to: cot, r: [0, 0, -0.12] });
  put(Box(0.017, 0.02, 0.017), "#a5523a", [0.036, wallTop + 0.074, -0.02], { to: cot, r: [0, 0, -0.24] });
  put(Box(0.024, 0.006, 0.024), "#3a3530", [0.04, wallTop + 0.086, -0.02], { to: cot, r: [0, 0, -0.3] });
  put(Cyl(0.004, 0.005, 0.008, 6), "#7a3e2b", [0.042, wallTop + 0.092, -0.02], { to: cot, r: [0, 0, -0.3] });
  const smokeY = wallTop + 0.1;
  put(new THREE.IcosahedronGeometry(0.008, 0), "#e9eef0", [0.046, smokeY + 0.004, -0.02], { to: cot });
  put(new THREE.IcosahedronGeometry(0.011, 0), "#e9eef0", [0.041, smokeY + 0.02, -0.022], { to: cot });
  put(new THREE.IcosahedronGeometry(0.014, 0), "#f4f7f8", [0.03, smokeY + 0.04, -0.025], { to: cot });
  // gull on the ridge
  gull(cot, [-0.025, wallTop + GH + 0.008, 0], 0.6, false);

  // ---------- path, steps, jetty ----------
  const toWorld = (lx: number, lz: number) => {
    const v = new THREE.Vector3(lx, 0, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), CRY);
    return [v.x + CX, v.z + CZ];
  };
  const door = toWorld(-0.02, D / 2 + 0.025);
  const pathEnd = [-0.02, 0.145];
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const x = door[0] + (pathEnd[0] - door[0]) * t + rr(-0.006, 0.006);
    const z = door[1] + (pathEnd[1] - door[1]) * t;
    put(Cyl(0.011, 0.012, 0.004, 6), "#b9b4aa", [x, G + 0.001, z], { r: [0, rand(), 0] });
  }
  const JX = -0.02;
  for (let i = 0; i < 4; i++) {
    const top = 0.155 - i * 0.016;
    const h = top - 0.07;
    put(Box(0.045, h, 0.013), pick(PLANKS), [JX, 0.07 + h / 2, 0.158 + i * 0.012]);
  }
  const deckY = 0.1;
  for (let i = 0; i < 8; i++) {
    put(Box(0.05, 0.005, 0.011), PLANKS[i % 3], [JX, deckY - 0.0025, 0.2 + i * 0.0125], { r: [0, rr(-0.04, 0.04), 0] });
  }
  for (const s of [-1, 1]) put(Box(0.006, 0.008, 0.11), DARKWOOD, [JX + s * 0.018, deckY - 0.009, 0.24]);
  for (const s of [-1, 1]) {
    for (const z of [0.2, 0.245, 0.29]) {
      put(Cyl(0.0055, 0.006, 0.05, 6), DARKWOOD, [JX + s * 0.027, 0.085, z]);
      put(Cyl(0.0065, 0.0065, 0.003, 6), "#4f341f", [JX + s * 0.027, 0.1115, z]);
      put(flatTorus(0.009, 0.002, 8), FOAM, [JX + s * 0.027, 0.084, z], { s: [1, 0.5, 1] });
    }
  }
  // barrel, crate, rope coil, lamp post
  put(Cyl(0.011, 0.011, 0.026, 8), "#8c5a32", [JX - 0.01, deckY + 0.013, 0.215]);
  for (const dy of [0.006, 0.02]) put(flatTorus(0.0112, 0.0012, 8), IRON, [JX - 0.01, deckY + dy, 0.215]);
  put(Box(0.02, 0.018, 0.02), "#c59a5e", [JX + 0.012, deckY + 0.009, 0.205], { r: [0, 0.3, 0] });
  put(Box(0.021, 0.003, 0.021), "#a77d48", [JX + 0.012, deckY + 0.009, 0.205], { r: [0, 0.3, 0] });
  put(flatTorus(0.007, 0.0025, 10), "#d8c49a", [JX + 0.005, deckY + 0.0025, 0.278]);
  put(flatTorus(0.0045, 0.0025, 10), "#d8c49a", [JX + 0.005, deckY + 0.006, 0.278]);
  put(Cyl(0.0015, 0.0015, 0.04, 4), IRON, [JX - 0.027, 0.133, 0.29]);
  put(Box(0.008, 0.01, 0.008), "#ffd77a", [JX - 0.027, 0.157, 0.29], { glow: 1.2 });
  put(new THREE.ConeGeometry(0.007, 0.006, 4), IRON, [JX - 0.027, 0.165, 0.29], { r: [0, Math.PI / 4, 0] });
  // gull on the end post
  gull(root, [JX + 0.027, 0.113, 0.29], -0.4, false);

  // ---------- rowboat ----------
  {
    const boat = new THREE.Group();
    boat.position.set(0.04, 0, 0.23);
    boat.rotation.y = 0.15;
    root.add(boat);
    const hull = new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    put(hull, "#f0b13c", [0, 0.094, 0], { to: boat, s: [0.024, 0.018, 0.055] });
    put(Box(0.032, 0.002, 0.074), "#b98a5a", [0, 0.086, 0], { to: boat });
    put(flatTorus(1, 0.12, 14), "#f7f3ea", [0, 0.094, 0], { to: boat, s: [0.0245, 0.025, 0.0555] });
    for (const z of [-0.02, 0.018]) put(Box(0.042, 0.003, 0.01), "#a87a4c", [0, 0.092, z], { to: boat });
    for (const s of [-1, 1]) {
      const og = new THREE.Group();
      og.position.set(s * 0.008, 0.096, 0);
      og.rotation.y = s * 0.1;
      boat.add(og);
      put(Cyl(0.0014, 0.0014, 0.08, 4), "#c69a68", [0, 0, 0], { to: og, r: [Math.PI / 2, 0, 0] });
      put(Box(0.008, 0.0015, 0.018), "#c69a68", [0, 0, -0.045], { to: og });
    }
    put(flatTorus(1, 0.1, 14), FOAM, [0, 0.083, 0], { to: boat, s: [0.03, 0.03, 0.062] });
  }
  rod([0.046, 0.096, 0.279], [JX + 0.027, 0.108, 0.245], 0.0012, "#d8c49a");

  // ---------- flying gull on a wire ----------
  gull(root, [0.2, 0.34, -0.06], -1.2, true);
  rod([0.205, WT, -0.065], [0.2, 0.347, -0.06], 0.0012, "#2b2b2b");
  put(Cyl(0.004, 0.005, 0.003, 6), "#2b2b2b", [0.205, WT + 0.0015, -0.065]);

  // ---------- grass tufts, flowers, pebbles ----------
  const blocked = (x: number, z: number) => {
    if (Math.hypot(x - TX, z - TZ) < 0.088) return true;
    const v = new THREE.Vector3(x - CX, 0, z - CZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), -CRY);
    if (Math.abs(v.x) < 0.07 && Math.abs(v.z) < 0.052) return true;
    return false;
  };
  const sample = (maxR: number) => {
    for (let k = 0; k < 40; k++) {
      const r = Math.sqrt(rand()) * maxR;
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!blocked(x, z)) return [x, z];
    }
    return [0.1, -0.1];
  };
  for (let i = 0; i < 32; i++) {
    const [x, z] = sample(0.155);
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const h = rr(0.014, 0.026);
      put(new THREE.ConeGeometry(0.0035, h, 4), pick(GRASS), [x + rr(-0.005, 0.005), G + h / 2 - 0.001, z + rr(-0.005, 0.005)], {
        r: [rr(-0.35, 0.35), rand() * 3, rr(-0.35, 0.35)],
      });
    }
  }
  for (let i = 0; i < 26; i++) {
    const [x, z] = sample(0.15);
    const sh = rr(0.014, 0.026);
    const c = pick(FLOWERS);
    put(Cyl(0.0012, 0.0012, sh, 3), "#4d8a35", [x, G + sh / 2, z]);
    put(new THREE.IcosahedronGeometry(0.003, 0), "#5f9e3e", [x + 0.003, G + sh * 0.4, z], { s: [1, 0.4, 0.6] });
    put(Cyl(0.006, 0.006, 0.002, 5), c, [x, G + sh, z], { r: [rr(-0.3, 0.3), rand() * 3, rr(-0.3, 0.3)] });
    put(new THREE.IcosahedronGeometry(0.0025, 0), c === "#ffd23f" ? "#8a5a34" : "#ffd23f", [x, G + sh + 0.0015, z]);
  }
  for (let i = 0; i < 7; i++) {
    const [x, z] = sample(0.15);
    put(new THREE.DodecahedronGeometry(rr(0.006, 0.012), 0), pick(ROCKS), [x, G + 0.002, z], { s: [1, 0.6, 1], r: [rand(), rand(), rand()] });
  }

  return b.root;
}
