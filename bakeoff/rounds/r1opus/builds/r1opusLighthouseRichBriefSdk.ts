import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lighthouse Island Diorama",
  description:
    "A cozy tabletop diorama: a red-and-white striped lighthouse with a glowing lantern room and black iron gallery, a keeper's cottage with a crooked smoking chimney and blue door, a plank jetty with a tethered rowboat, seagulls, grass tufts and wildflowers among the rocks, and turquoise water ringed with foam, all on a round walnut display base.",
};

type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse_diorama" });
  const j: any = b.joint("root", { at: [0, 0, 0] });
  const host: THREE.Object3D =
    j && j.isObject3D
      ? j
      : j && j.bone && j.bone.isObject3D
        ? j.bone
        : j && j.object && j.object.isObject3D
          ? j.object
          : b.root;

  // ---------- deterministic randomness ----------
  const R: any = rng(1873);
  let seed = 1873 >>> 0;
  const mul = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rand = (): number => {
    let v: any;
    try {
      if (typeof R === "function") v = R();
      else if (R && typeof R.next === "function") v = R.next();
      else if (R && typeof R.float === "function") v = R.float();
      else if (R && typeof R.random === "function") v = R.random();
    } catch {
      v = undefined;
    }
    if (typeof v === "number" && isFinite(v)) return v - Math.floor(v);
    return mul();
  };
  const rr = (a: number, c: number) => a + (c - a) * rand();
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length) % arr.length];

  // ---------- materials ----------
  const mats = new Map<string, THREE.Material>();
  const mat = (c: string, emissive = 0): THREE.Material => {
    const k = c + "|" + emissive;
    let m = mats.get(k);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.72,
        metalness: 0.04,
        flatShading: true,
        emissive: emissive ? new THREE.Color(c) : new THREE.Color(0x000000),
        emissiveIntensity: emissive || 1,
      });
      mats.set(k, m);
    }
    return m;
  };
  const waterMat = new THREE.MeshStandardMaterial({ color: "#2fb5c0", roughness: 0.3, metalness: 0.05, flatShading: true });
  const shallowMat = new THREE.MeshStandardMaterial({ color: "#5fd8cf", roughness: 0.3, metalness: 0.05, flatShading: true });
  const hullMat = new THREE.MeshStandardMaterial({ color: "#f3efe4", roughness: 0.72, metalness: 0.04, flatShading: true, side: THREE.DoubleSide });
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#ffe9a8",
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // palette
  const WALNUT = "#5b3a29", BRASS = "#c9a24a", FOAM = "#f4fbfa";
  const ISLAND = "#857d72", GRASS = "#6fae4f";
  const ROCKS = ["#9a958c", "#7d786f", "#b1aa9d"];
  const TUFT = ["#4f9a3c", "#6cb84a", "#8acb5c"];
  const FLOWERS = ["#ffffff", "#f5c842", "#e86aa6", "#9b6fd6", "#ff8a5c"];
  const RED = "#d23a35", WHITE = "#f4efe6", STONE = "#a39d92", IRON = "#1d1f24";
  const DOORG = "#2f5d50", NAVY = "#23324a";
  const GLASS = "#ffd76a", LAMP = "#fff4cf", PANE = "#ffcf6e";
  const CREAM = "#f2e3c6", ROOF = "#3f5563", ROOFD = "#2c3d49", BLUE = "#2f6db5";
  const BRICK = "#a4553c", BRICKD = "#7a3a28", SMOKE1 = "#ecebe6", SMOKE2 = "#d6d5cf";
  const WOOD = ["#a8774a", "#9a6a3f", "#b88752"], POST = "#6b4a30", ROPE = "#d9c08a";
  const GULLG = "#9aa3ad", BEAK = "#f2b632", LEG = "#e8894a";

  // ---------- helpers ----------
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const mk = (
    geo: THREE.BufferGeometry,
    m: string | THREE.Material,
    p: V,
    r?: V | null,
    s?: V | null,
    parent: THREE.Object3D = host,
  ) => {
    const mesh = new THREE.Mesh(geo, typeof m === "string" ? mat(m) : m);
    mesh.position.set(p[0], p[1], p[2]);
    if (r) mesh.rotation.set(r[0], r[1], r[2]);
    if (s) mesh.scale.set(s[0], s[1], s[2]);
    parent.add(mesh);
    return mesh;
  };
  const group = (p: V, yaw = 0, parent: THREE.Object3D = host) => {
    const g = new THREE.Group();
    g.position.set(p[0], p[1], p[2]);
    g.rotation.y = yaw;
    parent.add(g);
    return g;
  };
  const tube = (pts: V[], r: number, c: string, closed = false, seg = 16) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), closed);
    return mk(new THREE.TubeGeometry(curve, seg, r, 4, closed), c, [0, 0, 0]);
  };

  // ---------- key levels ----------
  const BASE_TOP = 0.05;
  const WY = 0.075; // water surface
  const GY = 0.135; // island ground
  const IX = 0, IZ = -0.02; // island centre

  // ---------- display base ----------
  mk(cyl(0.325, 0.34, BASE_TOP, 24), WALNUT, [0, BASE_TOP / 2, 0]);
  mk(new THREE.TorusGeometry(0.327, 0.004, 4, 40), BRASS, [0, BASE_TOP, 0], [Math.PI / 2, 0, 0]);
  mk(new THREE.TorusGeometry(0.337, 0.003, 4, 40), BRASS, [0, 0.006, 0], [Math.PI / 2, 0, 0]);
  // plaque
  mk(box(0.1, 0.024, 0.004), BRASS, [0, 0.026, 0.333], [-0.29, 0, 0]);
  mk(box(0.088, 0.014, 0.002), IRON, [0, 0.026, 0.3355], [-0.29, 0, 0]);
  for (let i = 0; i < 4; i++) mk(box(0.006, 0.003, 0.002), i % 2 ? WHITE : RED, [-0.03, 0.021 + i * 0.003, 0.3372 - i * 0.0009], [-0.29, 0, 0]);
  for (let i = 0; i < 5; i++) mk(box(0.008, 0.0016, 0.001), BRASS, [-0.012 + i * 0.011, 0.026, 0.3375], [-0.29, 0, 0]);

  // ---------- water ----------
  mk(cyl(0.305, 0.305, WY - BASE_TOP + 0.002, 32), waterMat, [0, (WY + BASE_TOP) / 2 - 0.001, 0]);
  mk(cyl(0.235, 0.235, 0.002, 20), shallowMat, [IX, WY + 0.0005, IZ + 0.01]);
  mk(new THREE.TorusGeometry(0.302, 0.004, 3, 48), FOAM, [0, WY, 0], [Math.PI / 2, 0, 0]);
  // ripples
  for (let i = 0; i < 16; i++) {
    const a = rr(0, Math.PI * 2), rad = rr(0.22, 0.285);
    const x = Math.sin(a) * rad, z = Math.cos(a) * rad;
    if (x > 0.05 && x < 0.22 && z > 0.1) continue;
    mk(new THREE.TorusGeometry(rr(0.012, 0.022), 0.0016, 3, 8, Math.PI * 0.6), FOAM, [x, WY + 0.001, z], [-Math.PI / 2, 0, rr(0, Math.PI * 2)], [1, 1, 0.4]);
  }

  // ---------- island ----------
  mk(cyl(0.15, 0.185, GY - 0.06, 9), ISLAND, [IX, (GY + 0.06) / 2 - 0.006, IZ]);
  mk(cyl(0.15, 0.156, 0.012, 9), GRASS, [IX, GY - 0.006, IZ]);
  const jettyAng = Math.atan2(0.1 - IX, 0.13 - IZ);
  const nearJetty = (a: number) => {
    let d = Math.abs(((a - jettyAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    return d < 0.3;
  };
  // lower rock ring
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + rr(-0.1, 0.1);
    if (nearJetty(a)) continue;
    const rad = rr(0.168, 0.19), s = rr(0.024, 0.042);
    mk(new THREE.DodecahedronGeometry(s, 0), pick(ROCKS), [IX + Math.sin(a) * rad, rr(0.074, 0.088), IZ + Math.cos(a) * rad], [rr(0, 3), rr(0, 3), rr(0, 3)], [1, rr(0.6, 0.85), 1]);
  }
  // upper rock ring
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2 + rr(-0.15, 0.15);
    if (nearJetty(a)) continue;
    const rad = rr(0.145, 0.16), s = rr(0.017, 0.028);
    mk(new THREE.DodecahedronGeometry(s, 0), pick(ROCKS), [IX + Math.sin(a) * rad, rr(0.112, 0.128), IZ + Math.cos(a) * rad], [rr(0, 3), rr(0, 3), rr(0, 3)], [1, 0.7, 1]);
    if (rand() < 0.6) {
      // grass between rocks
      const gx = IX + Math.sin(a + 0.12) * 0.148, gz = IZ + Math.cos(a + 0.12) * 0.148;
      for (let k = 0; k < 3; k++)
        mk(new THREE.ConeGeometry(0.003, rr(0.014, 0.022), 3), pick(TUFT), [gx + rr(-0.004, 0.004), GY + 0.004, gz + rr(-0.004, 0.004)], [rr(-0.35, 0.35), 0, rr(-0.35, 0.35)]);
    }
  }
  // foam around shore
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 + rr(-0.05, 0.05);
    const rad = rr(0.186, 0.2), s = rr(0.01, 0.019);
    mk(new THREE.IcosahedronGeometry(s, 0), FOAM, [IX + Math.sin(a) * rad, WY, IZ + Math.cos(a) * rad], [rr(0, 3), rr(0, 3), 0], [1, 0.28, 1]);
  }
  for (let i = 0; i < 18; i++) {
    const a = rr(0, Math.PI * 2), rad = rr(0.205, 0.222);
    mk(new THREE.IcosahedronGeometry(rr(0.005, 0.009), 0), FOAM, [IX + Math.sin(a) * rad, WY, IZ + Math.cos(a) * rad], null, [1, 0.3, 1]);
  }
  // lone rocks in the sea
  const seaRocks: V[] = [[-0.22, 0, 0.13], [0.24, 0, -0.13], [-0.13, 0, 0.235], [-0.2, 0, -0.17]];
  for (const p of seaRocks) {
    const s = rr(0.018, 0.028);
    mk(new THREE.DodecahedronGeometry(s, 0), pick(ROCKS), [p[0], WY + 0.002, p[2]], [rr(0, 3), rr(0, 3), rr(0, 3)], [1, 0.75, 1]);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      mk(new THREE.IcosahedronGeometry(rr(0.005, 0.008), 0), FOAM, [p[0] + Math.sin(a) * s * 1.1, WY, p[2] + Math.cos(a) * s * 1.1], null, [1, 0.3, 1]);
    }
  }

  // ---------- lighthouse ----------
  const LX = -0.065, LZ = -0.05;
  mk(cyl(0.06, 0.066, 0.03, 8), STONE, [LX, GY + 0.012, LZ]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    mk(box(0.003, 0.03, 0.003), ISLAND, [LX + Math.sin(a) * 0.0625, GY + 0.012, LZ + Math.cos(a) * 0.0625], [0, a, 0]);
  }
  const y0 = GY + 0.027, H = 0.27, NB = 6;
  const tr = (t: number) => 0.048 - 0.016 * t;
  for (let i = 0; i < NB; i++) {
    const t0 = i / NB, t1 = (i + 1) / NB;
    mk(cyl(tr(t1), tr(t0), H / NB, 10), i % 2 === 0 ? RED : WHITE, [LX, y0 + (i + 0.5) * (H / NB), LZ]);
  }
  const onTower = (a: number, t: number, out: number): V => {
    const r = tr(t) + out;
    return [LX + Math.sin(a) * r, y0 + t * H, LZ + Math.cos(a) * r];
  };
  // windows
  for (const [a, t] of [[0.45, 0.32], [-0.3, 0.55], [0.9, 0.78], [2.6, 0.45]] as [number, number][]) {
    mk(box(0.015, 0.022, 0.004), WHITE, onTower(a, t, 0.0), [0, a, 0]);
    mk(box(0.009, 0.015, 0.004), NAVY, onTower(a, t, 0.0015), [0, a, 0]);
  }
  // door
  const DA = 0.8;
  mk(box(0.028, 0.04, 0.005), WHITE, onTower(DA, 0.075, 0.0), [0, DA, 0]);
  mk(box(0.021, 0.034, 0.006), DOORG, [onTower(DA, 0.065, 0.001)[0], y0 + 0.017, onTower(DA, 0.065, 0.001)[2]], [0, DA, 0]);
  mk(new THREE.SphereGeometry(0.0018, 5, 4), BRASS, onTower(DA, 0.07, 0.005).map((v, k) => (k === 0 ? v + 0.004 : v)) as V);
  const ldoor = onTower(DA, 0, 0.012);
  mk(box(0.03, 0.006, 0.014), STONE, [ldoor[0], GY + 0.003, ldoor[2]], [0, DA, 0]);
  // gallery
  const yT = y0 + H;
  mk(cyl(0.068, 0.062, 0.01, 12), IRON, [LX, yT + 0.005, LZ]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    mk(box(0.004, 0.016, 0.014), IRON, [LX + Math.sin(a) * (tr(1) + 0.006), yT - 0.007, LZ + Math.cos(a) * (tr(1) + 0.006)], [0, a, 0]);
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    mk(cyl(0.0017, 0.0017, 0.03, 4), IRON, [LX + Math.sin(a) * 0.064, yT + 0.025, LZ + Math.cos(a) * 0.064]);
  }
  mk(new THREE.TorusGeometry(0.064, 0.0024, 4, 28), IRON, [LX, yT + 0.04, LZ], [Math.PI / 2, 0, 0]);
  mk(new THREE.TorusGeometry(0.064, 0.0014, 3, 28), IRON, [LX, yT + 0.025, LZ], [Math.PI / 2, 0, 0]);
  // lantern room
  mk(cyl(0.037, 0.037, 0.018, 10), RED, [LX, yT + 0.019, LZ]);
  mk(cyl(0.034, 0.034, 0.048, 10), mat(GLASS, 1.0), [LX, yT + 0.052, LZ]);
  mk(new THREE.IcosahedronGeometry(0.015, 0), mat(LAMP, 1.5), [LX, yT + 0.052, LZ]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    mk(box(0.003, 0.048, 0.003), IRON, [LX + Math.sin(a) * 0.035, yT + 0.052, LZ + Math.cos(a) * 0.035], [0, a, 0]);
  }
  mk(new THREE.TorusGeometry(0.035, 0.0018, 3, 20), IRON, [LX, yT + 0.045, LZ], [Math.PI / 2, 0, 0]);
  mk(cyl(0.043, 0.043, 0.006, 10), IRON, [LX, yT + 0.079, LZ]);
  mk(new THREE.ConeGeometry(0.043, 0.032, 10), RED, [LX, yT + 0.098, LZ]);
  mk(new THREE.SphereGeometry(0.007, 6, 4), IRON, [LX, yT + 0.117, LZ]);
  mk(cyl(0.0012, 0.0012, 0.03, 4), IRON, [LX, yT + 0.134, LZ]);
  mk(box(0.024, 0.002, 0.0025), IRON, [LX, yT + 0.143, LZ], [0, 0.7, 0]);
  mk(new THREE.ConeGeometry(0.004, 0.007, 3), IRON, [LX + Math.cos(0.7) * 0.013, yT + 0.143, LZ - Math.sin(0.7) * 0.013], [0, 0.7, -Math.PI / 2]);
  // light beams
  for (const yaw of [0.55, 0.55 + Math.PI]) {
    const len = 0.32;
    const g = new THREE.ConeGeometry(0.07, len, 12, 1, true);
    g.translate(0, -len / 2, 0);
    const m = new THREE.Mesh(g, beamMat);
    m.position.set(LX, yT + 0.052, LZ);
    m.rotation.set(-Math.PI / 2, yaw, 0, "YXZ");
    host.add(m);
  }
  const lamp = new THREE.PointLight("#ffd28a", 0.6, 1.2, 2);
  lamp.position.set(LX, yT + 0.052, LZ);
  host.add(lamp);

  // ---------- keeper's cottage ----------
  const CX = 0.065, CZ = 0.015, W = 0.104, D = 0.075, WH = 0.065;
  const wallBase = GY + 0.006, wallTop = wallBase + WH;
  mk(box(W + 0.008, 0.014, D + 0.008), STONE, [CX, GY + 0.003, CZ]);
  mk(box(W, WH, D), CREAM, [CX, wallBase + WH / 2, CZ]);
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(box(0.006, WH, 0.006), WHITE, [CX + sx * W / 2, wallBase + WH / 2, CZ + sz * D / 2]);
  // gable
  const rh = 0.045, hs = D / 2;
  const sh = new THREE.Shape();
  sh.moveTo(-hs, 0); sh.lineTo(hs, 0); sh.lineTo(0, rh); sh.lineTo(-hs, 0);
  const gg = new THREE.ExtrudeGeometry(sh, { depth: W - 0.002, bevelEnabled: false });
  gg.translate(0, 0, -(W - 0.002) / 2);
  gg.rotateY(Math.PI / 2);
  mk(gg, CREAM, [CX, wallTop, CZ]);
  // roof slabs
  const sa = Math.atan2(rh, hs), L = Math.hypot(hs, rh) + 0.016, RT = 0.008;
  const peak = new THREE.Vector3(CX, wallTop + rh, CZ);
  for (const s of [1, -1]) {
    const dir = new THREE.Vector3(0, -Math.sin(sa), s * Math.cos(sa));
    const n = new THREE.Vector3(0, Math.cos(sa), s * Math.sin(sa));
    const c = peak.clone().addScaledVector(dir, L / 2 - 0.004).addScaledVector(n, RT / 2);
    mk(box(W + 0.022, RT, L), ROOF, [c.x, c.y, c.z], [s * sa, 0, 0]);
    for (let k = 1; k <= 3; k++) {
      const p = peak.clone().addScaledVector(dir, (k / 4) * L).addScaledVector(n, RT + 0.0012);
      mk(box(W + 0.022, 0.0025, 0.004), ROOFD, [p.x, p.y, p.z], [s * sa, 0, 0]);
    }
  }
  mk(box(W + 0.026, 0.008, 0.013), ROOFD, [CX, peak.y + 0.006, CZ], [Math.PI / 4, 0, 0], [1, 1, 1]);
  // chimney (crooked)
  const CHX = CX - 0.028, CHZ = CZ - 0.02;
  mk(box(0.018, 0.05, 0.018), BRICK, [CHX, wallTop + 0.03, CHZ], [0, 0, 0.05]);
  mk(box(0.0185, 0.003, 0.0185), BRICKD, [CHX - 0.0005, wallTop + 0.04, CHZ], [0, 0, 0.05]);
  mk(box(0.0185, 0.003, 0.0185), BRICKD, [CHX - 0.001, wallTop + 0.05, CHZ], [0, 0, 0.05]);
  mk(box(0.0165, 0.022, 0.0165), BRICK, [CHX - 0.003, wallTop + 0.064, CHZ], [0, 0, -0.09]);
  mk(box(0.023, 0.005, 0.023), BRICKD, [CHX - 0.0015, wallTop + 0.077, CHZ], [0, 0, -0.14]);
  mk(cyl(0.005, 0.0055, 0.01, 6), BRICKD, [CHX - 0.0005, wallTop + 0.084, CHZ], [0, 0, -0.2]);
  for (let i = 0; i < 5; i++) {
    const s = 0.006 + i * 0.0028;
    mk(new THREE.IcosahedronGeometry(s, 0), i % 2 ? SMOKE2 : SMOKE1, [CHX - 0.004 - i * i * 0.0028, wallTop + 0.097 + i * 0.017, CHZ + i * 0.002], [i, i * 2, 0]);
  }
  // facades
  const windowAt = (g: THREE.Object3D, x: number, y: number, w: number, h: number, shutters: boolean) => {
    mk(box(w + 0.006, h + 0.006, 0.003), WHITE, [x, y, 0.0015], null, null, g);
    mk(box(w, h, 0.003), mat(PANE, 0.9), [x, y, 0.0025], null, null, g);
    mk(box(0.0018, h, 0.002), WHITE, [x, y, 0.0045], null, null, g);
    mk(box(w, 0.0018, 0.002), WHITE, [x, y, 0.0045], null, null, g);
    if (shutters) for (const sx of [-1, 1]) {
      mk(box(0.007, h + 0.004, 0.003), BLUE, [x + sx * (w / 2 + 0.0075), y, 0.002], null, null, g);
      mk(box(0.005, 0.001, 0.001), WHITE, [x + sx * (w / 2 + 0.0075), y, 0.0037], null, null, g);
    }
    mk(box(w + 0.008, 0.006, 0.008), WOOD[1], [x, y - h / 2 - 0.006, 0.004], null, null, g);
    for (let k = 0; k < 4; k++)
      mk(new THREE.IcosahedronGeometry(0.0028, 0), k % 2 ? GRASS : pick(FLOWERS), [x - w / 2 + (k + 0.5) * (w / 4), y - h / 2 - 0.0015, 0.004], null, null, g);
  };
  const front = group([CX, 0, CZ + D / 2]);
  windowAt(front, -0.034, wallBase + 0.038, 0.016, 0.016, true);
  windowAt(front, 0.034, wallBase + 0.038, 0.016, 0.016, true);
  mk(box(0.028, 0.047, 0.003), WHITE, [0, wallBase + 0.0235, 0.0015], null, null, front);
  mk(box(0.022, 0.042, 0.005), BLUE, [0, wallBase + 0.021, 0.0025], null, null, front);
  for (const dx of [-0.0055, 0.0055]) mk(box(0.0012, 0.04, 0.001), "#245796", [dx, wallBase + 0.021, 0.0052], null, null, front);
  mk(box(0.008, 0.008, 0.002), mat(PANE, 0.9), [0, wallBase + 0.034, 0.0052], null, null, front);
  mk(new THREE.SphereGeometry(0.0019, 5, 4), BRASS, [0.0075, wallBase + 0.02, 0.0058], null, null, front);
  mk(box(0.034, 0.006, 0.014), STONE, [0, GY + 0.003, 0.008], null, null, front);
  // porch hood
  mk(box(0.036, 0.003, 0.014), ROOF, [0, wallBase + 0.051, 0.007], [0.25, 0, 0], null, front);
  const sideR = group([CX + W / 2, 0, CZ], Math.PI / 2);
  windowAt(sideR, 0, wallBase + 0.036, 0.018, 0.018, true);
  const sideL = group([CX - W / 2, 0, CZ], -Math.PI / 2);
  windowAt(sideL, 0, wallBase + 0.036, 0.016, 0.016, false);
  // rain barrel
  mk(cyl(0.009, 0.008, 0.02, 8), WOOD[0], [CX + W / 2 + 0.012, GY + 0.01, CZ + 0.025]);
  for (const dy of [0.004, 0.016]) mk(new THREE.TorusGeometry(0.0088, 0.001, 3, 10), IRON, [CX + W / 2 + 0.012, GY + dy, CZ + 0.025], [Math.PI / 2, 0, 0]);

  // ---------- gulls ----------
  const gull = (p: V, yaw: number, fly: boolean) => {
    const g = group(p, yaw);
    if (fly) g.rotation.z = 0.15;
    mk(new THREE.SphereGeometry(1, 7, 5), WHITE, [0, 0.012, 0], null, [0.011, 0.01, 0.02], g);
    mk(new THREE.SphereGeometry(0.0085, 7, 5), WHITE, [0, 0.022, 0.016], null, null, g);
    mk(new THREE.ConeGeometry(0.003, 0.011, 4), BEAK, [0, 0.0205, 0.028], [Math.PI / 2, 0, 0], null, g);
    for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.0016, 4, 3), IRON, [sx * 0.0062, 0.0245, 0.02], null, null, g);
    mk(box(0.012, 0.003, 0.012), GULLG, [0, 0.014, -0.023], [0.15, 0, 0], null, g);
    for (const sx of [-1, 1]) {
      if (fly) {
        mk(box(0.03, 0.003, 0.016), GULLG, [sx * 0.019, 0.016, 0], [0, 0, sx * 0.3], null, g);
        mk(box(0.03, 0.0025, 0.012), GULLG, [sx * 0.046, 0.022, -0.003], [0, sx * 0.15, -sx * 0.18], null, g);
        mk(box(0.012, 0.0026, 0.009), IRON, [sx * 0.064, 0.0195, -0.006], [0, sx * 0.2, -sx * 0.18], null, g);
      } else {
        mk(box(0.004, 0.009, 0.024), GULLG, [sx * 0.0095, 0.015, -0.004], [0.12, 0, 0], null, g);
        mk(box(0.0035, 0.004, 0.008), IRON, [sx * 0.007, 0.016, -0.021], [0.2, 0, 0], null, g);
        mk(cyl(0.0012, 0.0012, 0.006, 4), LEG, [sx * 0.004, 0.003, 0.002], null, null, g);
        mk(box(0.004, 0.0012, 0.005), LEG, [sx * 0.004, 0.0006, 0.004], null, null, g);
      }
    }
  };
  gull([CX + 0.028, peak.y + 0.009, CZ], 0.5, false);
  gull([-0.15, 0.43, 0.12], 1.3, true);

  // ---------- jetty ----------
  const JX = 0.1, JY = 0.1, JZ0 = 0.112, JZ1 = 0.278;
  for (let z = JZ0, k = 0; z < JZ1; z += 0.0152, k++)
    mk(box(0.055, 0.005, 0.012), WOOD[k % 3], [JX + rr(-0.002, 0.002), JY - 0.0025, z + 0.006], [0, rr(-0.04, 0.04), 0]);
  for (const sx of [-1, 1]) mk(box(0.006, 0.006, JZ1 - JZ0), POST, [JX + sx * 0.02, JY - 0.008, (JZ0 + JZ1) / 2]);
  for (const z of [0.14, 0.2, 0.265]) for (const sx of [-1, 1]) {
    const top = z > 0.25 ? JY + 0.016 : JY + 0.01;
    mk(cyl(0.0055, 0.006, top - 0.055, 6), POST, [JX + sx * 0.028, (top + 0.055) / 2, z]);
    mk(new THREE.TorusGeometry(0.0095, 0.0022, 3, 10), FOAM, [JX + sx * 0.028, WY, z], [Math.PI / 2, 0, 0]);
  }
  // step up onto island
  mk(box(0.055, 0.007, 0.016), WOOD[2], [JX, 0.117, 0.104]);
  mk(box(0.05, 0.016, 0.004), POST, [JX, 0.106, 0.112]);
  // crate, barrel, rope coil
  mk(box(0.022, 0.02, 0.022), WOOD[2], [JX - 0.01, JY + 0.01, 0.248], [0, 0.2, 0]);
  mk(box(0.023, 0.004, 0.023), WOOD[1], [JX - 0.01, JY + 0.017, 0.248], [0, 0.2, 0]);
  mk(box(0.003, 0.021, 0.023), WOOD[1], [JX - 0.01, JY + 0.01, 0.248], [0, 0.2, 0.75]);
  mk(cyl(0.0095, 0.0085, 0.022, 8), WOOD[0], [JX + 0.012, JY + 0.011, 0.155]);
  for (const dy of [0.004, 0.018]) mk(new THREE.TorusGeometry(0.0093, 0.001, 3, 10), IRON, [JX + 0.012, JY + dy, 0.155], [Math.PI / 2, 0, 0]);
  mk(new THREE.TorusGeometry(0.007, 0.0022, 4, 10), ROPE, [JX - 0.008, JY + 0.002, 0.185], [Math.PI / 2, 0, 0]);
  mk(new THREE.TorusGeometry(0.0045, 0.002, 4, 10), ROPE, [JX - 0.008, JY + 0.005, 0.185], [Math.PI / 2, 0, 0]);
  // lifebuoy
  const buoy = group([JX + 0.0345, JY + 0.001, 0.265], Math.PI / 2);
  for (let i = 0; i < 4; i++) mk(new THREE.TorusGeometry(0.01, 0.003, 4, 4, Math.PI / 2), i % 2 ? WHITE : RED, [0, 0, 0], [0, 0, (i * Math.PI) / 2], null, buoy);
  // gull on end post
  gull([JX - 0.028, JY + 0.016, 0.265], -0.6, false);

  // ---------- rowboat ----------
  const BX = 0.168, BZ = 0.205, BR = WY + 0.007;
  const hull = new THREE.SphereGeometry(1, 12, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  mk(hull, hullMat, [BX, BR, BZ], null, [0.029, 0.021, 0.062]);
  const rim: V[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rim.push([BX + Math.sin(a) * 0.029, BR, BZ + Math.cos(a) * 0.062]);
  }
  tube(rim, 0.0028, RED, true, 32);
  mk(cyl(1, 1, 0.002, 12), WOOD[0], [BX, WY + 0.001, BZ], null, [0.026, 1, 0.056]);
  for (const dz of [-0.022, 0.016]) mk(box(0.052, 0.003, 0.011), WOOD[1], [BX, BR - 0.002, BZ + dz]);
  for (const sx of [-1, 1]) {
    mk(cyl(0.0014, 0.0014, 0.07, 4), WOOD[2], [BX + sx * 0.008, BR + 0.001, BZ - 0.004], [Math.PI / 2, 0, sx * 0.05], null);
    mk(box(0.007, 0.0015, 0.016), WOOD[2], [BX + sx * 0.0095, BR + 0.001, BZ - 0.042]);
  }
  tube([[JX + 0.028, JY + 0.012, 0.265], [0.148, 0.084, 0.278], [BX - 0.004, BR + 0.002, BZ + 0.058]], 0.0012, ROPE, false, 10);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    mk(new THREE.IcosahedronGeometry(rr(0.004, 0.007), 0), FOAM, [BX + Math.sin(a) * 0.032, WY, BZ + Math.cos(a) * 0.066], null, [1, 0.3, 1]);
  }

  // ---------- clothesline ----------
  const P1: V = [-0.1, GY, 0.05], P2: V = [-0.045, GY, 0.09], PH = 0.055;
  for (const p of [P1, P2]) {
    mk(cyl(0.002, 0.0022, PH, 5), POST, [p[0], GY + PH / 2, p[2]]);
    mk(box(0.012, 0.002, 0.002), POST, [p[0], GY + PH - 0.003, p[2]], [0, Math.atan2(-(P2[2] - P1[2]), P2[0] - P1[0]) + Math.PI / 2, 0]);
  }
  const lineY = GY + PH - 0.003;
  const mid: V = [(P1[0] + P2[0]) / 2, lineY - 0.007, (P1[2] + P2[2]) / 2];
  tube([[P1[0], lineY, P1[2]], mid, [P2[0], lineY, P2[2]]], 0.0007, WHITE, false, 10);
  const lyaw = Math.atan2(-(P2[2] - P1[2]), P2[0] - P1[0]);
  const laundry = [FLOWERS[2], BLUE, FLOWERS[1], WHITE];
  laundry.forEach((c, i) => {
    const t = 0.2 + i * 0.2;
    const sag = 0.007 * (1 - Math.pow(2 * t - 1, 2));
    const x = P1[0] + (P2[0] - P1[0]) * t, z = P1[2] + (P2[2] - P1[2]) * t;
    const h = i === 1 ? 0.018 : 0.013;
    mk(box(0.011, h, 0.0015), c, [x, lineY - sag - h / 2, z], [0, lyaw, rr(-0.06, 0.06)]);
    mk(box(0.002, 0.004, 0.003), WOOD[0], [x, lineY - sag, z], [0, lyaw, 0]);
  });

  // ---------- path stones ----------
  const pathPts: [number, number][] = [[ldoor[0] + 0.01, ldoor[2] + 0.012], [0.0, 0.082], [JX, 0.098]];
  const doorFront: [number, number] = [CX, CZ + D / 2 + 0.022];
  const stonesOn = (a: [number, number], c: [number, number], n: number) => {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      mk(cyl(1, 1, 0.004, 6), STONE, [a[0] + (c[0] - a[0]) * t + rr(-0.003, 0.003), GY + 0.0015, a[1] + (c[1] - a[1]) * t + rr(-0.003, 0.003)], [0, rr(0, 1), 0], [rr(0.008, 0.011), 1, rr(0.007, 0.01)]);
    }
  };
  stonesOn(pathPts[0], pathPts[1], 4);
  stonesOn(pathPts[1], pathPts[2], 4);
  stonesOn(doorFront, [CX - 0.01, 0.088], 1);

  // ---------- grass tufts & wildflowers ----------
  const free = (x: number, z: number) => {
    if (Math.hypot(x - IX, z - IZ) > 0.135) return false;
    if (Math.hypot(x - LX, z - LZ) < 0.074) return false;
    if (x > CX - W / 2 - 0.01 && x < CX + W / 2 + 0.03 && z > CZ - D / 2 - 0.01 && z < CZ + D / 2 + 0.03) return false;
    for (const p of [P1, P2]) if (Math.hypot(x - p[0], z - p[2]) < 0.008) return false;
    return true;
  };
  const sample = (): [number, number] | null => {
    for (let k = 0; k < 30; k++) {
      const a = rr(0, Math.PI * 2), r = Math.sqrt(rand()) * 0.135;
      const x = IX + Math.sin(a) * r, z = IZ + Math.cos(a) * r;
      if (free(x, z)) return [x, z];
    }
    return null;
  };
  for (let i = 0; i < 34; i++) {
    const s = sample();
    if (!s) continue;
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rr(0, 1);
      mk(new THREE.ConeGeometry(0.0032, rr(0.015, 0.026), 3), pick(TUFT), [s[0] + Math.sin(a) * 0.003, GY + 0.007, s[1] + Math.cos(a) * 0.003], [Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]);
    }
  }
  for (let i = 0; i < 28; i++) {
    const s = sample();
    if (!s) continue;
    const h = rr(0.01, 0.02);
    mk(cyl(0.0008, 0.0008, h, 3), TUFT[0], [s[0], GY + h / 2, s[1]]);
    const c = pick(FLOWERS);
    const hy = GY + h + 0.001;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      mk(new THREE.IcosahedronGeometry(0.0022, 0), c, [s[0] + Math.sin(a) * 0.0024, hy, s[1] + Math.cos(a) * 0.0024], null, [1, 0.6, 1]);
    }
    mk(new THREE.IcosahedronGeometry(0.0014, 0), c === FLOWERS[1] ? BRICK : FLOWERS[1], [s[0], hy + 0.001, s[1]]);
  }

  return b.root;
}
