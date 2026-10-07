import * as THREE from "three";

export const meta = {
  name: "Panther Chameleon on Driftwood",
  description:
    "A stylized low-poly panther chameleon gripping a driftwood perch with mitten feet. Its tail is coiled, one turret eye is locked on a fly resting on a leaf, and the other eye wanders skyward. The perch sits on a mossy slate base with mushrooms and a pink blossom.",
};

type V = [number, number, number];

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(20240611);
  const root = new THREE.Group();
  root.name = "chameleon-diorama";

  const C = {
    skin: 0x3cb46e, skinDark: 0x24834f, belly: 0xb5e26b, cream: 0xf6edc6,
    orange: 0xf0682c, red: 0xd8392a, yellow: 0xffd23f, blue: 0x2f80d8,
    black: 0x121212, white: 0xffffff, claw: 0x3b2f29, foot: 0x58c07c,
    bark: 0x6e4b2e, barkDark: 0x4b321f, barkLight: 0x8c6644, wood: 0xcfa86f,
    rock: 0x7c848d, rockDark: 0x5c636c, moss: 0x6b9e3a, mossDark: 0x4a7c2b,
    leaf: 0x4f9e2e, leafDark: 0x3a7a22, rib: 0xa9d86c, lichen: 0xbcd98c,
    petal: 0xff5d8f, petalDeep: 0xd93a74, cap: 0xe04a2f,
    fly: 0x24445a, flyEye: 0xb0221a, wing: 0xd8ecff,
  };
  const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");

  // ---------- materials ----------
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const M = (
    color: number,
    rough = 0.7,
    extra: THREE.MeshStandardMaterialParameters = {},
    key = ""
  ) => {
    const k = color.toString(16) + key;
    let m = cache.get(k);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, flatShading: true, ...extra });
      cache.set(k, m);
    }
    return m;
  };

  const canvasTex = (
    w: number,
    h: number,
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  ): THREE.Texture | null => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    if (!ctx) return null;
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  };

  // ---------- helpers ----------
  const mesh = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: V = [0, 0, 0],
    r: V = [0, 0, 0],
    s: V = [1, 1, 1]
  ) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(p[0], p[1], p[2]);
    me.rotation.set(r[0], r[1], r[2]);
    me.scale.set(s[0], s[1], s[2]);
    parent.add(me);
    return me;
  };
  const ball = (parent: THREE.Object3D, p: V, r: number, m: THREE.Material, s: V = [1, 1, 1], ws = 8, hs = 6) =>
    mesh(parent, new THREE.SphereGeometry(r, ws, hs), m, p, [0, 0, 0], s);
  const UP = new THREE.Vector3(0, 1, 0);
  const limb = (parent: THREE.Object3D, a: V, b: V, r1: number, r2: number, m: THREE.Material, seg = 6) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    const len = Math.max(d.length(), 1e-5);
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, seg, 1), m);
    me.position.copy(A).addScaledVector(d, 0.5);
    me.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(me);
    return me;
  };
  const chain = (parent: THREE.Object3D, pts: V[], radii: number[], m: THREE.Material, seg = 7, joints = true) => {
    for (let i = 0; i < pts.length - 1; i++) {
      limb(parent, pts[i], pts[i + 1], radii[i], radii[i + 1], m, seg);
      if (joints && i > 0) ball(parent, pts[i], radii[i], m, [1, 1, 1], seg, 5);
    }
  };
  const orientedBall = (parent: THREE.Object3D, p: V, n: THREE.Vector3, r: number, flat: number, m: THREE.Material) => {
    const me = mesh(parent, new THREE.IcosahedronGeometry(r, 0), m, p, [0, 0, 0], [1, flat, 1]);
    me.quaternion.setFromUnitVectors(UP, n.clone().normalize());
    return me;
  };

  // ---------- textures ----------
  const bodyTex = canvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = hex(C.skin);
    ctx.fillRect(0, 0, w, h);
    // dorsal band (u ~ 0.75)
    ctx.fillStyle = hex(C.skinDark);
    ctx.fillRect(0.69 * w, 0, 0.12 * w, h);
    // belly (u ~ 0.25)
    ctx.fillStyle = hex(C.belly);
    ctx.fillRect(0.17 * w, 0, 0.16 * w, h);
    // chevron bars over the back
    const bars = [0.2, 0.35, 0.5, 0.65, 0.8];
    for (const yc of bars) {
      for (const off of [0, -w]) {
        const layers: [string, number][] = [[hex(C.red), 4], [hex(C.orange), 0]];
        for (const [col, grow] of layers) {
          ctx.fillStyle = col;
          ctx.beginPath();
          const top: [number, number][] = [];
          const bot: [number, number][] = [];
          for (let u = 0.36; u <= 1.1401; u += 0.02) {
            const k = 1 - Math.min(1, Math.abs(u - 0.75) / 0.39);
            const bend = 0.05 * h * k;
            const hh = (0.018 + 0.022 * k) * h + grow;
            top.push([u * w + off, yc * h - hh + bend]);
            bot.push([u * w + off, yc * h + hh + bend]);
          }
          ctx.moveTo(top[0][0], top[0][1]);
          for (const p of top) ctx.lineTo(p[0], p[1]);
          for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    // dashed cream lateral stripes
    ctx.fillStyle = hex(C.cream);
    for (const u of [0.37, 0.13]) {
      for (let y = 0.1; y < 0.92; y += 0.09) {
        ctx.fillRect(u * w - 0.016 * w, y * h, 0.032 * w, 0.065 * h);
      }
    }
    // spots
    for (let i = 0; i < 90; i++) {
      let u = rand();
      if (u > 0.15 && u < 0.35) u = (u + 0.4) % 1;
      const v = 0.08 + rand() * 0.86;
      ctx.fillStyle = rand() < 0.55 ? hex(C.blue) : hex(C.yellow);
      ctx.beginPath();
      ctx.arc(u * w, v * h, 2 + rand() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const tailTex = canvasTex(512, 64, (ctx, w, h) => {
    ctx.fillStyle = hex(C.skin);
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) {
      const u = 0.06 + i * 0.092;
      const bw = (0.034 - i * 0.0015) * w;
      ctx.fillStyle = hex(C.red);
      ctx.fillRect(u * w - 3, 0, bw + 6, h);
      ctx.fillStyle = hex(C.orange);
      ctx.fillRect(u * w, 0, bw, h);
      ctx.fillStyle = hex(C.cream);
      ctx.fillRect(u * w + bw + 0.012 * w, 0, 0.007 * w, h);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rand() < 0.5 ? hex(C.yellow) : hex(C.blue);
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 1.5 + rand() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const barkTex = canvasTex(128, 256, (ctx, w, h) => {
    ctx.fillStyle = hex(C.bark);
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {
      ctx.fillStyle = rand() < 0.6 ? hex(C.barkDark) : hex(C.barkLight);
      const x = rand() * w;
      const y = rand() * h;
      ctx.fillRect(x, y, 1 + rand() * 3, 20 + rand() * 120);
    }
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = hex(C.barkDark);
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const skinMat = M(C.skin, 0.55);
  const bodyMat = bodyTex ? M(0xffffff, 0.55, { map: bodyTex }, "body") : skinMat;
  const tailMat = tailTex ? M(0xffffff, 0.55, { map: tailTex }, "tail") : skinMat;
  const barkMat = barkTex ? M(0xffffff, 0.9, { map: barkTex }, "bark") : M(C.bark, 0.9);
  const footMat = M(C.foot, 0.55);
  const orangeMat = M(C.orange, 0.5);
  const yellowMat = M(C.yellow, 0.5);
  const creamMat = M(C.cream, 0.6);
  const blackMat = M(C.black, 0.2);
  const clawMat = M(C.claw, 0.4);

  // =========================================================
  // BASE: layered slate slab
  // =========================================================
  mesh(root, new THREE.CylinderGeometry(0.215, 0.235, 0.016, 8), M(C.rockDark, 0.9), [0, 0.008, 0], [0, 0, 0], [1, 1, 1.45]);
  mesh(root, new THREE.CylinderGeometry(0.19, 0.21, 0.034, 8), M(C.rock, 0.85), [0, 0.033, 0], [0, 0, 0], [1, 1, 1.45]);
  const baseTop = 0.05;

  // boulder with moss cap
  mesh(root, new THREE.DodecahedronGeometry(0.045, 0), M(C.rock, 0.85), [0.12, 0.06, -0.17], [0.3, 0.5, 0.1], [1, 0.65, 1.2]);
  mesh(root, new THREE.IcosahedronGeometry(0.03, 0), M(C.moss, 0.95), [0.118, 0.083, -0.165], [0, 0.4, 0], [1, 0.3, 1.2]);

  // moss patches
  for (let i = 0; i < 11; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.35 + rand() * 0.55;
    const x = Math.cos(a) * 0.16 * rr;
    const z = Math.sin(a) * 0.25 * rr;
    const r = 0.018 + rand() * 0.022;
    mesh(root, new THREE.IcosahedronGeometry(r, 0), M(i % 2 ? C.moss : C.mossDark, 0.95), [x, baseTop, z], [0, rand() * 3, 0], [1, 0.32, 1]);
  }
  // moss around trunk foot
  mesh(root, new THREE.IcosahedronGeometry(0.04, 0), M(C.moss, 0.95), [0.012, baseTop, 0.035], [0, 0.3, 0], [1.2, 0.3, 1]);

  // pebbles
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.55 + rand() * 0.4;
    const r = 0.007 + rand() * 0.009;
    mesh(root, new THREE.DodecahedronGeometry(r, 0), M(rand() < 0.5 ? C.rockDark : C.rock, 0.85),
      [Math.cos(a) * 0.165 * rr, baseTop + r * 0.2, Math.sin(a) * 0.26 * rr], [rand() * 3, rand() * 3, 0], [1, 0.7, 1]);
  }

  // grass tufts
  const tufts: V[] = [[-0.13, baseTop, -0.05], [0.13, baseTop, 0.12], [-0.06, baseTop, -0.24], [0.06, baseTop, 0.24]];
  for (const t of tufts) {
    for (let k = 0; k < 5; k++) {
      const hgt = 0.03 + rand() * 0.025;
      const a = (k / 5) * Math.PI * 2 + rand();
      const lean = 0.25 + rand() * 0.25;
      const blade = mesh(root, new THREE.ConeGeometry(0.0028, hgt, 3), M(k % 2 ? C.leaf : C.rib, 0.8),
        [t[0] + Math.cos(a) * 0.006, t[1] + hgt / 2 - 0.002, t[2] + Math.sin(a) * 0.006]);
      blade.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean);
    }
  }

  // mushrooms (bright red with white dots)
  const shroom = (x: number, z: number, hgt: number, r: number) => {
    const g = new THREE.Group();
    g.position.set(x, baseTop, z);
    g.rotation.set((rand() - 0.5) * 0.3, rand() * 3, (rand() - 0.5) * 0.3);
    root.add(g);
    mesh(g, new THREE.CylinderGeometry(r * 0.32, r * 0.42, hgt, 6), creamMat, [0, hgt / 2, 0]);
    mesh(g, new THREE.CylinderGeometry(r * 0.92, r * 0.5, 0.003, 8), creamMat, [0, hgt - 0.0005, 0]);
    mesh(g, new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), M(C.cap, 0.45), [0, hgt, 0], [0, 0, 0], [1, 0.65, 1]);
    for (let i = 0; i < 5; i++) {
      const th = 0.3 + rand() * 0.9;
      const ph = rand() * Math.PI * 2;
      ball(g, [r * Math.sin(th) * Math.cos(ph), hgt + 0.65 * r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)], r * 0.14, M(C.white, 0.6), [1, 0.6, 1], 5, 3);
    }
  };
  shroom(-0.12, 0.16, 0.032, 0.017);
  shroom(-0.095, 0.185, 0.022, 0.012);
  shroom(-0.135, 0.19, 0.014, 0.008);

  // =========================================================
  // DRIFTWOOD PERCH
  // =========================================================
  // trunk and fork
  const fork: V = [0.012, 0.125, 0.05];
  chain(root, [[0.012, 0.045, 0.035], [0.02, 0.085, 0.045], fork], [0.024, 0.02, 0.017], barkMat);
  ball(root, fork, 0.017, barkMat, [1, 1, 1], 7, 5);
  chain(root, [fork, [0.002, 0.16, -0.02], [0, 0.188, -0.07]], [0.016, 0.014, 0.012], barkMat);
  chain(root, [fork, [0.012, 0.165, 0.12], [0.004, 0.19, 0.175]], [0.016, 0.014, 0.012], barkMat);
  mesh(root, new THREE.CylinderGeometry(0.024, 0.042, 0.022, 7), barkMat, [0.012, 0.058, 0.035]);
  const roots: V[] = [[0.075, 0.049, 0.065], [-0.045, 0.049, 0.075], [0.035, 0.049, -0.035], [-0.03, 0.049, -0.01]];
  for (const r of roots) limb(root, [0.012, 0.06, 0.035], r, 0.012, 0.004, barkMat, 5);

  // horizontal branch along Z
  const BR: V[] = [[0, 0.2, -0.14], [0, 0.2, 0.0], [0, 0.2, 0.2], [0.004, 0.205, 0.27], [0.012, 0.214, 0.33]];
  chain(root, BR, [0.021, 0.022, 0.02, 0.016, 0.011], barkMat, 8);
  // cut ends showing wood
  limb(root, [0, 0.2, -0.1425], [0, 0.2, -0.1395], 0.0205, 0.0205, M(C.wood, 0.8), 8);
  mesh(root, new THREE.TorusGeometry(0.011, 0.0012, 3, 10), M(C.barkLight, 0.8), [0, 0.2, -0.1428]);
  ball(root, [0.012, 0.214, 0.334], 0.0105, M(C.wood, 0.8), [1, 1, 0.5], 7, 4);
  // broken side stub
  limb(root, [-0.012, 0.205, -0.03], [-0.04, 0.226, -0.04], 0.0075, 0.005, barkMat, 6);
  ball(root, [-0.04, 0.226, -0.04], 0.0052, M(C.wood, 0.8), [1, 0.6, 1], 6, 4);
  // lichen spots on the underside and flanks
  for (let i = 0; i < 9; i++) {
    const z = -0.12 + rand() * 0.3;
    const a = -Math.PI * (0.05 + rand() * 0.9);
    const n = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    orientedBall(root, [n.x * 0.021, 0.2 + n.y * 0.021, z], n, 0.006 + rand() * 0.004, 0.3, M(C.lichen, 0.9));
  }

  // ---------- leaves ----------
  const leafGeo = new THREE.SphereGeometry(1, 6, 5);
  leafGeo.rotateX(Math.PI / 2);
  let leafToggle = 0;
  const leaf = (parent: THREE.Object3D, p: V, yaw: number, pitch: number, len: number, wid: number) => {
    const g = new THREE.Group();
    g.position.set(p[0], p[1], p[2]);
    g.rotation.order = "YXZ";
    g.rotation.set(pitch, yaw, 0);
    parent.add(g);
    const m = new THREE.Mesh(leafGeo, M(leafToggle++ % 2 ? C.leafDark : C.leaf, 0.6));
    m.scale.set(wid / 2, 0.0025, len / 2);
    m.position.z = len / 2;
    g.add(m);
    limb(g, [0, 0.0016, 0.003], [0, 0.0016, len * 0.9], 0.0011, 0.0005, M(C.rib, 0.6), 4);
    return g;
  };

  // twig with leaves and the fly
  const T0: V = [0.006, 0.21, 0.25], T1: V = [0.04, 0.252, 0.285], T2: V = [0.068, 0.29, 0.31];
  chain(root, [T0, T1, T2], [0.006, 0.0045, 0.003], barkMat, 5);
  leaf(root, T1, 1.3, 0.3, 0.06, 0.028);
  leaf(root, T1, -0.5, -0.15, 0.05, 0.024);
  leaf(root, T2, 1.9, -0.35, 0.055, 0.026);
  const flyLeaf = leaf(root, T2, 0.25, 0.12, 0.07, 0.034);

  // fly
  const fly = new THREE.Group();
  fly.position.set(0, 0.0058, 0.036);
  fly.rotation.y = -2.0;
  flyLeaf.add(fly);
  const flyMat = M(C.fly, 0.25, { metalness: 0.5 }, "fly");
  ball(fly, [0, 0, 0], 0.0042, flyMat, [1, 0.9, 1.2], 6, 5);
  ball(fly, [0, -0.0003, -0.0068], 0.0046, flyMat, [0.9, 0.8, 1.4], 6, 5);
  ball(fly, [0, 0.0003, 0.0062], 0.0033, blackMat, [1, 1, 1], 6, 4);
  for (const s of [1, -1]) {
    ball(fly, [s * 0.0025, 0.0011, 0.0072], 0.0023, M(C.flyEye, 0.3), [1, 1, 1], 6, 4);
    const w = mesh(fly, new THREE.SphereGeometry(1, 6, 4), M(C.wing, 0.2, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }, "wing"),
      [s * 0.004, 0.0042, -0.006], [0, s * 0.4, 0], [0.0035, 0.0004, 0.009]);
    w.rotation.z = s * 0.15;
    for (let k = 0; k < 3; k++) {
      const z = 0.003 - k * 0.003;
      limb(fly, [s * 0.002, -0.002, z], [s * 0.0075, -0.0058, z + (k - 1) * 0.003], 0.0006, 0.0004, blackMat, 3);
    }
  }

  // flowering stem on the right side
  const F0: V = [-0.004, 0.21, 0.22], F1: V = [-0.04, 0.25, 0.245], F2: V = [-0.058, 0.272, 0.258];
  chain(root, [F0, F1, F2], [0.004, 0.003, 0.0025], M(C.leafDark, 0.7), 5);
  leaf(root, F1, -1.2, 0.25, 0.045, 0.022);
  const flower = new THREE.Group();
  flower.position.set(...F2);
  flower.quaternion.setFromUnitVectors(UP, new THREE.Vector3(-0.45, 1, 0.45).normalize());
  root.add(flower);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const p = mesh(flower, new THREE.SphereGeometry(1, 6, 4), M(C.petal, 0.5),
      [Math.cos(a) * 0.011, 0.002, Math.sin(a) * 0.011], [0, -a, 0], [0.011, 0.0018, 0.0058]);
    p.rotation.z = 0.25;
    const a2 = a + Math.PI / 5;
    mesh(flower, new THREE.SphereGeometry(1, 6, 4), M(C.petalDeep, 0.5),
      [Math.cos(a2) * 0.006, 0.004, Math.sin(a2) * 0.006], [0, -a2, 0.35], [0.006, 0.0016, 0.0035]);
  }
  ball(flower, [0, 0.005, 0], 0.0038, yellowMat, [1, 0.7, 1], 6, 4);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    limb(flower, [0, 0.005, 0], [Math.cos(a) * 0.004, 0.013, Math.sin(a) * 0.004], 0.0006, 0.0005, yellowMat, 3);
    ball(flower, [Math.cos(a) * 0.004, 0.013, Math.sin(a) * 0.004], 0.0012, M(C.red, 0.5), [1, 1, 1], 4, 3);
  }

  // sprout from the trunk fork
  const S1: V = [-0.035, 0.15, 0.07];
  limb(root, fork, S1, 0.004, 0.0025, M(C.leafDark, 0.7), 5);
  leaf(root, S1, -1.5, -0.1, 0.05, 0.024);
  leaf(root, S1, -0.4, 0.35, 0.042, 0.02);
  ball(root, [-0.037, 0.156, 0.071], 0.004, M(C.petal, 0.5), [1, 1.4, 1], 5, 4);

  // =========================================================
  // CHAMELEON
  // =========================================================
  const ells: { c: V; r: V }[] = [
    { c: [0, 0.31, 0], r: [0.035, 0.06, 0.1] }, // body
    { c: [0, 0.315, 0.095], r: [0.03, 0.045, 0.035] }, // neck
    { c: [0, 0.322, 0.135], r: [0.03, 0.032, 0.048] }, // head
  ];
  const topY = (z: number) => {
    let y = -Infinity;
    for (const e of ells) {
      const t = (z - e.c[2]) / e.r[2];
      if (Math.abs(t) < 1) y = Math.max(y, e.c[1] + e.r[1] * Math.sqrt(1 - t * t));
    }
    return y;
  };
  const bottomY = (z: number) => {
    let y = Infinity;
    for (const e of ells) {
      const t = (z - e.c[2]) / e.r[2];
      if (Math.abs(t) < 1) y = Math.min(y, e.c[1] - e.r[1] * Math.sqrt(1 - t * t));
    }
    if (z > 0.155 && z < 0.205) y = Math.min(y, 0.312 - (0.009 + (0.013 * (0.205 - z)) / 0.05));
    return y;
  };

  // body (poles along Z so texture runs nose→tail)
  mesh(root, new THREE.SphereGeometry(1, 16, 12), bodyMat, [0, 0.31, 0], [Math.PI / 2, 0, 0], [0.035, 0.1, 0.06]);
  ball(root, [0, 0.315, 0.095], 1, skinMat, [0.03, 0.045, 0.035], 10, 8);
  ball(root, [0, 0.322, 0.135], 1, skinMat, [0.03, 0.032, 0.048], 12, 8);

  // snout
  mesh(root, new THREE.CylinderGeometry(0.009, 0.022, 0.05, 7), skinMat, [0, 0.312, 0.18], [Math.PI / 2, 0, 0], [0.85, 1, 1]);
  ball(root, [0, 0.312, 0.205], 0.0095, skinMat, [0.85, 1, 0.8], 7, 5);

  // casque helmet with orange ridges
  mesh(root, new THREE.ConeGeometry(0.026, 0.055, 6), M(C.skinDark, 0.55), [0, 0.355, 0.115], [-0.55, 0, 0], [0.45, 1, 1]);
  const apex: V = [0, 0.378, 0.1006];
  limb(root, apex, [0, 0.345, 0.151], 0.0028, 0.0025, orangeMat, 5);
  limb(root, apex, [0, 0.318, 0.107], 0.0028, 0.0025, orangeMat, 5);
  ball(root, apex, 0.0032, orangeMat, [1, 1, 1], 5, 4);

  // dorsal crest
  const nCrest = 13;
  for (let i = 0; i < nCrest; i++) {
    const t = i / (nCrest - 1);
    const z = 0.09 - t * 0.175;
    const k = 0.65 + 0.55 * Math.sin(Math.PI * Math.min(1, t * 1.3));
    const h = 0.011 * k;
    mesh(root, new THREE.ConeGeometry(0.0045 * k, h, 4), i % 2 ? yellowMat : orangeMat,
      [0, topY(z) + h / 2 - 0.0025, z], [-0.35, 0, 0]);
  }

  // gular crest (throat)
  for (let i = 0; i < 6; i++) {
    const z = 0.1 + i * 0.014;
    const h = 0.009 - i * 0.0009;
    mesh(root, new THREE.ConeGeometry(0.0035, h, 4), creamMat, [0, bottomY(z) - h / 2 + 0.0025, z], [Math.PI + 0.25, 0, 0]);
  }

  // face details, both sides
  for (const s of [1, -1]) {
    // mouth line
    chain(root, [[s * 0.0062, 0.305, 0.203], [s * 0.0128, 0.303, 0.175], [s * 0.021, 0.301, 0.15], [s * 0.0195, 0.297, 0.127]],
      [0.0016, 0.0016, 0.0016, 0.0016], blackMat, 4);
    // cream cheek stripe
    limb(root, [s * 0.0195, 0.297, 0.127], [s * 0.027, 0.295, 0.092], 0.0028, 0.0024, creamMat, 5);
    // canthal ridge over the eye to the nose
    chain(root, [[s * 0.018, 0.348, 0.13], [s * 0.0135, 0.336, 0.172], [s * 0.0055, 0.32, 0.2]], [0.0026, 0.0024, 0.002], orangeMat, 5);
    // tear stripe
    limb(root, [s * 0.028, 0.318, 0.148], [s * 0.0205, 0.302, 0.155], 0.0022, 0.002, orangeMat, 4);
    // cheek spots
    ball(root, [s * 0.027, 0.311, 0.124], 0.0045, M(C.blue, 0.5), [0.35, 1, 1.2], 6, 4);
    ball(root, [s * 0.0245, 0.326, 0.115], 0.0032, M(C.blue, 0.5), [0.35, 1, 1.2], 6, 4);
    // nostril
    ball(root, [s * 0.0045, 0.317, 0.2045], 0.0018, blackMat, [1, 1, 1], 5, 4);
  }

  // turret eyes
  root.updateMatrixWorld(true);
  const flyPos = new THREE.Vector3();
  fly.getWorldPosition(flyPos);
  const eye = (center: V, dir: THREE.Vector3) => {
    const g = new THREE.Group();
    g.position.set(...center);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    root.add(g);
    const R = 0.016;
    ball(g, [0, 0, 0], R, skinMat, [1, 1, 1], 10, 8);
    const ring = (z: number, tube: number, m: THREE.Material) =>
      mesh(g, new THREE.TorusGeometry(Math.sqrt(R * R - z * z) + tube * 0.2, tube, 4, 14), m, [0, 0, z]);
    ring(0.0045, 0.0017, orangeMat);
    ring(0.0098, 0.0015, yellowMat);
    ring(0.0138, 0.0014, creamMat);
    ball(g, [0, 0, 0.0152], 0.0042, blackMat, [1, 1, 1], 8, 6);
    ball(g, [0.0014, 0.0016, 0.0192], 0.0012, M(C.white, 0.2, { emissive: 0xffffff, emissiveIntensity: 0.6 }, "hl"), [1, 1, 1], 5, 4);
  };
  const eyeL: V = [0.029, 0.332, 0.145];
  const toFly = flyPos.clone().sub(new THREE.Vector3(...eyeL)).normalize();
  eye(eyeL, toFly.add(new THREE.Vector3(0.3, 0, 0)).normalize());
  eye([-0.029, 0.332, 0.145], new THREE.Vector3(-0.6, 0.65, -0.45));

  // legs with zygodactyl mitten feet
  const legs = [
    { s: 1, front: true, fz: 0.108 },
    { s: -1, front: true, fz: 0.088 },
    { s: 1, front: false, fz: -0.095 },
    { s: -1, front: false, fz: -0.115 },
  ];
  for (const L of legs) {
    const s = L.s, fz = L.fz;
    const sh: V = [s * 0.025, 0.286, L.front ? 0.062 : -0.064];
    const el: V = [s * 0.066, 0.256, L.front ? fz - 0.055 : fz + 0.06];
    const wr: V = [s * 0.012, 0.236, fz];
    ball(root, sh, 0.014, skinMat, L.front ? [0.8, 1, 1.15] : [0.85, 1.05, 1.25], 8, 6);
    limb(root, sh, el, 0.0105, 0.008, skinMat, 6);
    ball(root, el, 0.0082, skinMat, [1, 1, 1], 6, 5);
    limb(root, el, wr, 0.0075, 0.006, skinMat, 6);
    ball(root, wr, 0.0068, footMat, [1, 1, 1], 6, 5);
    // speckles on the upper limb
    ball(root, [(sh[0] + el[0]) / 2 + s * 0.008, (sh[1] + el[1]) / 2 + 0.004, (sh[2] + el[2]) / 2], 0.0024, yellowMat, [1, 1, 1], 4, 3);
    ball(root, [(el[0] * 2 + wr[0]) / 3 + s * 0.005, (el[1] * 2 + wr[1]) / 3 + 0.005, (el[2] * 2 + wr[2]) / 3], 0.002, M(C.blue, 0.5), [1, 1, 1], 4, 3);

    const bundle = (a: V, b: V, c: V) => {
      limb(root, a, b, 0.0058, 0.005, footMat, 6);
      ball(root, b, 0.005, footMat, [1, 1, 1], 6, 4);
      limb(root, b, c, 0.005, 0.0038, footMat, 6);
      ball(root, c, 0.0038, footMat, [1, 1, 1], 5, 4);
      const d = new THREE.Vector3(c[0] - b[0], c[1] - b[1], c[2] - b[2]).normalize();
      for (const off of [-0.0022, 0.0022]) {
        const c0: V = [c[0], c[1], c[2] + off];
        limb(root, c0, [c0[0] + d.x * 0.006, c0[1] + d.y * 0.006, c0[2] + d.z * 0.006], 0.0014, 0.0002, clawMat, 4);
      }
    };
    bundle(wr, [s * 0.027, 0.214, fz], [s * 0.0215, 0.193, fz + 0.001]);
    bundle(wr, [-s * 0.012, 0.229, fz], [-s * 0.0215, 0.206, fz]);
  }

  // coiled prehensile tail (tapered tube)
  const tailPts: THREE.Vector3[] = [];
  const P0 = new THREE.Vector3(0, 0.305, -0.075);
  const Q = new THREE.Vector3(0, 0.235, -0.15);
  const P1 = new THREE.Vector3(0, 0.23, -0.21);
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    tailPts.push(new THREE.Vector3(0, a * P0.y + b * Q.y + c * P1.y, a * P0.z + b * Q.z + c * P1.z));
  }
  const coilC = new THREE.Vector3(0, 0.18, -0.21);
  for (let i = 0; i <= 34; i++) {
    const th = (i / 34) * 2.3 * Math.PI;
    const r = 0.05 * (1 - 0.11 * th);
    tailPts.push(new THREE.Vector3(0, coilC.y + r * Math.cos(th), coilC.z - r * Math.sin(th)));
  }
  const tailCurve = new THREE.CatmullRomCurve3(tailPts, false, "centripetal");
  const TS = 64, RS = 7;
  const tailGeo = new THREE.TubeGeometry(tailCurve, TS, 1, RS, false);
  const taper = (u: number) => 0.0035 + 0.0155 * Math.pow(1 - u, 0.85);
  const pos = tailGeo.attributes.position as THREE.BufferAttribute;
  const P = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) {
    tailCurve.getPointAt(i / TS, P);
    const r = taper(i / TS);
    for (let j = 0; j <= RS; j++) {
      const idx = i * (RS + 1) + j;
      pos.setXYZ(idx, P.x + (pos.getX(idx) - P.x) * r, P.y + (pos.getY(idx) - P.y) * r, P.z + (pos.getZ(idx) - P.z) * r);
    }
  }
  pos.needsUpdate = true;
  tailGeo.computeVertexNormals();
  mesh(root, tailGeo, tailMat);
  const tip = tailCurve.getPointAt(1);
  ball(root, [tip.x, tip.y, tip.z], 0.0036, tailMat, [1, 1, 1], 6, 4);

  // crest spikes along the outer edge of the tail
  const T = new THREE.Vector3();
  for (let u = 0.03; u < 0.55; u += 0.045) {
    tailCurve.getPointAt(u, P);
    tailCurve.getTangentAt(u, T);
    const n = new THREE.Vector3(0, -T.z, T.y).normalize();
    const h = 0.009 * (1 - u * 1.3);
    const r = taper(u);
    const c = mesh(root, new THREE.ConeGeometry(h * 0.42, h, 4), Math.round(u * 22) % 2 ? yellowMat : orangeMat,
      [P.x + n.x * (r + h / 2 - 0.002), P.y + n.y * (r + h / 2 - 0.002), P.z + n.z * (r + h / 2 - 0.002)]);
    c.quaternion.setFromUnitVectors(UP, n);
  }

  return root;
}
