```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Kit at Dusk",
  description:
    "A stylized low-poly fennec fox kit standing alert on a little dusk-lit sand dune: enormous satin ears lined in peach, cream fur warming to sandy gold, a bushy black-tipped tail, big sparkling eyes, oversized paws and a woven leather collar with a brass bell.",
};

type V = [number, number, number];

export default function build() {
  const b: any = createBuilder({ name: "fennecKit" });

  // ---------------- deterministic randomness ----------------
  const rr: any = rng(11);
  let fb = 98765;
  const rand = (): number => {
    let x: any;
    try {
      if (typeof rr === "function") x = rr();
      else if (rr && typeof rr.next === "function") x = rr.next();
      else if (rr && typeof rr.float === "function") x = rr.float();
      else if (rr && typeof rr.random === "function") x = rr.random();
    } catch (e) {
      x = undefined;
    }
    if (typeof x === "number" && isFinite(x)) {
      if (x >= 0 && x < 1) return x;
      return (Math.abs(x) % 1000003) / 1000003;
    }
    fb = (fb * 16807) % 2147483647;
    return fb / 2147483647;
  };
  const range = (a: number, c: number) => a + (c - a) * rand();

  // ---------------- small math helpers ----------------
  const V3 = (a: V | THREE.Vector3) =>
    a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
  const addv = (a: THREE.Vector3, x: number, y: number, z: number) => a.clone().add(new THREE.Vector3(x, y, z));

  function basisQ(yDir: V | THREE.Vector3, zHint: V | THREE.Vector3 = [0, 0, 1]) {
    const y = V3(yDir).normalize();
    let z = V3(zHint);
    z.sub(y.clone().multiplyScalar(z.dot(y)));
    if (z.lengthSq() < 1e-8) {
      z = new THREE.Vector3(1, 0, 0);
      z.sub(y.clone().multiplyScalar(z.dot(y)));
    }
    z.normalize();
    const x = new THREE.Vector3().crossVectors(y, z);
    const m = new THREE.Matrix4().makeBasis(x, y, z);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }

  // ---------------- materials ----------------
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  function mat(color: string, kind: "base" | "satin" | "gloss" | "metal" = "base") {
    const key = color + "|" + kind;
    let m = mats.get(key);
    if (!m) {
      const rough = kind === "satin" ? 0.42 : kind === "gloss" ? 0.18 : kind === "metal" ? 0.32 : 0.72;
      const metal = kind === "metal" ? 0.75 : 0.04;
      m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: true });
      mats.set(key, m);
    }
    return m;
  }

  // ---------------- geometry caches ----------------
  const icoCache = new Map<number, THREE.BufferGeometry>();
  const ico = (d: number) => {
    let g = icoCache.get(d);
    if (!g) {
      g = new THREE.IcosahedronGeometry(1, d);
      icoCache.set(d, g);
    }
    return g;
  };
  const cylCache = new Map<string, THREE.BufferGeometry>();
  const cyl = (rTop: number, rBot: number, sides: number) => {
    const k = `${rTop}_${rBot}_${sides}`;
    let g = cylCache.get(k);
    if (!g) {
      g = new THREE.CylinderGeometry(rTop, rBot, 1, sides);
      cylCache.set(k, g);
    }
    return g;
  };
  const coneCache = new Map<number, THREE.BufferGeometry>();
  const coneG = (sides: number) => {
    let g = coneCache.get(sides);
    if (!g) {
      g = new THREE.ConeGeometry(1, 1, sides);
      coneCache.set(sides, g);
    }
    return g;
  };

  // ---------------- mesh placement (model space -> bone local) ----------------
  function put(
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    bone: any,
    pos: V | THREE.Vector3,
    q?: THREE.Quaternion,
    scale?: V
  ) {
    const mesh = new THREE.Mesh(geo, material);
    const bp = new THREE.Vector3();
    const bq = new THREE.Quaternion();
    bone.getWorldPosition(bp);
    bone.getWorldQuaternion(bq);
    const inv = bq.clone().invert();
    mesh.position.copy(V3(pos).sub(bp).applyQuaternion(inv));
    mesh.quaternion.copy(inv.multiply(q ? q.clone() : new THREE.Quaternion()));
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    bone.add(mesh);
    return mesh;
  }

  // ellipsoid
  function ell(color: string, bone: any, c: V | THREE.Vector3, r: V, q?: THREE.Quaternion, kind: any = "base", det = 1) {
    return put(ico(det), mat(color, kind), bone, c, q, r);
  }
  // tapered segment a->b
  function seg(color: string, bone: any, a: V | THREE.Vector3, bb: V | THREE.Vector3, r0: number, r1: number, sides = 7, kind: any = "base") {
    const A = V3(a), B = V3(bb);
    const d = B.clone().sub(A);
    const len = d.length();
    return put(cyl(r1 / r0, 1, sides), mat(color, kind), bone, A.clone().add(B).multiplyScalar(0.5), basisQ(d), [r0, len, r0]);
  }
  // cone base->tip
  function cone(color: string, bone: any, base: V | THREE.Vector3, tip: V | THREE.Vector3, r: number, sides = 5, zHint?: V | THREE.Vector3, flat = 1, kind: any = "base") {
    const A = V3(base), B = V3(tip);
    const d = B.clone().sub(A);
    const len = d.length();
    return put(coneG(sides), mat(color, kind), bone, A.clone().add(B).multiplyScalar(0.5), basisQ(d, zHint ?? [0, 0, 1]), [r, len, r * flat]);
  }

  // ---------------- palette ----------------
  const C = {
    cream: "#f7e8cf",
    creamLight: "#fff6e8",
    gold: "#e3b066",
    goldWarm: "#d99e55",
    goldDeep: "#c3843f",
    peach: "#f8c3a2",
    peachVein: "#eba58a",
    earTip: "#a8683a",
    eye: "#1c120d",
    liner: "#3d2617",
    nose: "#2a1b17",
    white: "#ffffff",
    whisker: "#fff3e2",
    leather: "#8d512d",
    leatherDark: "#5e321b",
    brass: "#e0ae46",
    brassDark: "#8f6a22",
    sand: "#e39a5f",
    ripple: "#c47a47",
    ridge: "#f6c38c",
    pebbleA: "#a26f57",
    pebbleB: "#7d5546",
    plantA: "#8e9c5e",
    plantB: "#b3b97c",
    petal: "#f58ea8",
    petalDeep: "#e0698c",
    flowerC: "#ffd35a",
    foot: "#c98450",
    shadow: "#cd8650",
    tailTip: "#2a1f1a",
    smudge: "#6a4630",
    pad: "#e9cfae",
    stripe: "#b9783c",
  };

  // ---------------- skeleton ----------------
  const G = 0.119; // dune top height under the paws
  const P = (x: number, y: number, z: number): V => [x, G + y, z];
  const J = (name: string, at: V, parent?: any, role?: string) => {
    const j = parent ? b.joint(name, { at, parent }) : b.joint(name, { at });
    if (role) j.userData.role = role;
    return j;
  };

  const root = J("root", [0, 0, 0]);
  const hips = J("hips", P(0, 0.11, -0.06), root, "spine");
  const spine1 = J("spine1", P(0, 0.118, 0.0), hips, "spine");
  const chest = J("chest", P(0, 0.125, 0.05), spine1, "spine");
  const neck = J("neck", P(0, 0.16, 0.075), chest, "neck");
  const head = J("head", P(0, 0.215, 0.1), neck, "head");
  const jaw = J("jaw", P(0, 0.198, 0.12), head, "jaw");

  const H = V3(P(0, 0.215, 0.1));
  const sides: [number, string][] = [
    [1, "L"],
    [-1, "R"],
  ];

  const ears: Record<string, { base: THREE.Vector3; tip: THREE.Vector3; j0: any; j1: any }> = {};
  const fronts: Record<string, any> = {};
  const hinds: Record<string, any> = {};

  for (const [s, S] of sides) {
    const eb = addv(H, s * 0.026, 0.03, -0.01);
    const et = addv(H, s * 0.088, 0.16, -0.025);
    const j0 = J(`ear${S}`, [eb.x, eb.y, eb.z], head, "fan");
    const em = eb.clone().lerp(et, 0.5);
    const j1 = J(`ear${S}1`, [em.x, em.y, em.z], j0, "fan");
    ears[S] = { base: eb, tip: et, j0, j1 };

    const shoulder = J(`shoulder${S}`, P(s * 0.033, 0.105, 0.055), chest, "leg");
    const elbow = J(`elbow${S}`, P(s * 0.036, 0.06, 0.06), shoulder, "leg");
    const wrist = J(`wrist${S}`, P(s * 0.037, 0.022, 0.066), elbow, "leg");
    const fingers = J(`fingers${S}`, P(s * 0.037, 0.01, 0.088), wrist, "digit");
    fronts[S] = { shoulder, elbow, wrist, fingers };

    const hip = J(`hip${S}`, P(s * 0.036, 0.105, -0.075), hips, "leg");
    const knee = J(`knee${S}`, P(s * 0.041, 0.066, -0.048), hip, "leg");
    const hock = J(`hock${S}`, P(s * 0.041, 0.028, -0.09), knee, "leg");
    const toes = J(`toes${S}`, P(s * 0.041, 0.01, -0.058), hock, "digit");
    hinds[S] = { hip, knee, hock, toes };
  }

  const tailPts: V[] = [P(0, 0.125, -0.105), P(0, 0.132, -0.16), P(0, 0.124, -0.22), P(0, 0.108, -0.275), P(0, 0.098, -0.33)];
  const tailJ: any[] = [];
  {
    let parent = hips;
    for (let i = 0; i < 4; i++) {
      const j = J(`tail${i}`, tailPts[i], parent, "tail");
      tailJ.push(j);
      parent = j;
    }
  }

  // ======================================================================
  // DUNE (scenery on the root)
  // ======================================================================
  const prof: [number, number][] = [
    [0.0, 0.122],
    [0.12, 0.118],
    [0.25, 0.1],
    [0.38, 0.066],
    [0.5, 0.026],
    [0.6, 0.0],
  ];
  const hAt = (r: number) => {
    if (r <= 0) return prof[0][1];
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, h0] = prof[i], [r1, h1] = prof[i + 1];
      if (r <= r1) return h0 + ((h1 - h0) * (r - r0)) / (r1 - r0);
    }
    return 0;
  };
  const slopeAt = (r: number) => (hAt(r + 0.005) - hAt(Math.max(0, r - 0.005))) / 0.01;
  const duneNormal = (x: number, z: number) => {
    const r = Math.hypot(x, z) || 1e-6;
    const k = slopeAt(r);
    return new THREE.Vector3((-k * x) / r, 1, (-k * z) / r).normalize();
  };
  const onDune = (x: number, z: number, lift = 0.0008) => new THREE.Vector3(x, hAt(Math.hypot(x, z)) + lift, z);

  {
    const pts = prof.map(([r, h]) => new THREE.Vector2(Math.max(r, 0.0005), h)).reverse();
    const lathe = new THREE.LatheGeometry(pts, 13);
    put(lathe, mat(C.sand), root, [0, 0, 0]);

    // soft shadow pool under the kit
    ell(C.shadow, root, [0, 0.1212, -0.01], [0.075, 0.0008, 0.16], undefined, "base", 1);

    // wind ripples: dark trough + lit crest
    for (const rBase of [0.3, 0.41, 0.51]) {
      for (let a = 0; a < Math.PI * 2; a += 0.115) {
        if (rand() < 0.22) continue;
        const r = rBase + 0.012 * Math.sin(a * 3 + rBase * 20);
        const x = r * Math.sin(a), z = r * Math.cos(a);
        const n = duneNormal(x, z);
        const tan = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
        const q = basisQ(tan, n);
        ell(C.ripple, root, onDune(x, z, 0.0006), [0.006, 0.032, 0.0022], q);
        const r2 = r - 0.011;
        const x2 = r2 * Math.sin(a), z2 = r2 * Math.cos(a);
        ell(C.ridge, root, onDune(x2, z2, 0.0007), [0.004, 0.03, 0.0018], basisQ(tan, duneNormal(x2, z2)));
      }
    }

    // pebbles
    for (let i = 0; i < 8; i++) {
      const a = range(0, Math.PI * 2);
      const r = range(0.22, 0.55);
      const x = r * Math.sin(a), z = r * Math.cos(a);
      const sz = range(0.007, 0.016);
      const p = onDune(x, z, sz * 0.35);
      put(new THREE.DodecahedronGeometry(1, 0), mat(i % 2 ? C.pebbleA : C.pebbleB), root, p,
        basisQ(duneNormal(x, z), [rand() - 0.5, 0, 1]), [sz, sz * 0.6, sz * 0.9]);
    }

    // little paw-print trail climbing up from behind
    for (let i = 0; i < 9; i++) {
      const z = -0.17 - i * 0.045;
      const x = 0.04 * Math.sin(i * 0.55) + (i % 2 ? 0.017 : -0.017);
      if (Math.hypot(x, z) > 0.56) break;
      const n = duneNormal(x, z);
      const q = basisQ([0, 0, 1], n);
      const c = onDune(x, z, 0.0006);
      ell(C.foot, root, c, [0.008, 0.012, 0.0014], q);
      for (let t = -1; t <= 1; t++) {
        const tp = onDune(x + t * 0.006, z + 0.014, 0.0006);
        ell(C.foot, root, tp, [0.0028, 0.0034, 0.0012], q);
      }
    }

    // desert tuft with a tiny pink bloom, front-right
    const tx = -0.27, tz = 0.33;
    const tb = onDune(tx, tz, -0.002);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
      const lean = range(0.25, 0.7);
      const len = range(0.05, 0.09);
      const dir = new THREE.Vector3(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize();
      cone(i % 2 ? C.plantA : C.plantB, root, tb, tb.clone().add(dir.multiplyScalar(len)), 0.0045, 4);
    }
    const stemTop = addv(tb, 0.01, 0.075, 0.012);
    seg(C.plantA, root, tb, stemTop, 0.0016, 0.0013, 5);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const d = new THREE.Vector3(Math.cos(a), 0.25, Math.sin(a)).normalize();
      ell(i % 2 ? C.petal : C.petalDeep, root, stemTop.clone().add(d.clone().multiplyScalar(0.008)), [0.0045, 0.0085, 0.0018], basisQ(d, [0, 1, 0]), "satin");
    }
    ell(C.flowerC, root, addv(stemTop, 0, 0.0025, 0), [0.0042, 0.003, 0.0042]);

    // a dry twig half buried on the other flank
    const w0 = onDune(0.33, 0.12, -0.002), w1 = onDune(0.42, 0.22, 0.004);
    seg(C.pebbleB, root, w0, w1, 0.003, 0.0018, 5);
    seg(C.pebbleB, root, w0.clone().lerp(w1, 0.55), addv(w0.clone().lerp(w1, 0.55), 0.02, 0.02, -0.005), 0.0018, 0.001, 4);
  }

  // ======================================================================
  // BODY
  // ======================================================================
  const bodyC = V3(P(0, 0.112, -0.008));
  const bodyQ = basisQ([0, 0.12, 1], [0, 1, 0]); // y along body, z up
  ell(C.cream, spine1, bodyC, [0.046, 0.09, 0.047], bodyQ);
  ell(C.gold, spine1, addv(bodyC, 0, 0.013, -0.002), [0.042, 0.085, 0.04], bodyQ);
  ell(C.goldWarm, spine1, addv(bodyC, 0, 0.03, -0.004), [0.026, 0.072, 0.02], bodyQ);
  ell(C.goldDeep, spine1, addv(bodyC, 0, 0.041, -0.01), [0.011, 0.055, 0.008], bodyQ);
  // belly fluff
  ell(C.creamLight, spine1, addv(bodyC, 0, -0.022, 0.01), [0.034, 0.06, 0.026], bodyQ);

  // chest ruff
  const ruffC = V3(P(0, 0.135, 0.068));
  ell(C.creamLight, chest, ruffC, [0.036, 0.042, 0.03]);
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.009;
    const base = addv(ruffC, x, -0.012 + Math.abs(x) * 0.6, 0.018);
    cone(i % 2 ? C.cream : C.creamLight, chest, base, addv(base, x * 0.4, -0.03, 0.012), 0.0075, 4);
  }

  // neck
  seg(C.cream, neck, P(0, 0.128, 0.058), P(0, 0.205, 0.096), 0.031, 0.027, 8);
  ell(C.gold, neck, P(0, 0.18, 0.068), [0.026, 0.03, 0.02]);

  // ======================================================================
  // COLLAR + BELL
  // ======================================================================
  {
    const cc = V3(P(0, 0.168, 0.08));
    const n = new THREE.Vector3(0, 0.07, 0.042).normalize();
    const u = new THREE.Vector3(1, 0, 0);
    const w = new THREE.Vector3().crossVectors(n, u).normalize(); // in-plane, points front-down
    const R = 0.031;
    put(new THREE.TorusGeometry(R, 0.0052, 5, 18), mat(C.leatherDark), neck, cc, basisQ(u, n).multiply(new THREE.Quaternion()), undefined);
    // the torus lies in its local XY plane; orient its local z to n
    // (re-place properly: rotate so torus axis = n)
    const ringMesh = neck.children[neck.children.length - 1] as THREE.Mesh;
    {
      const bq = new THREE.Quaternion();
      neck.getWorldQuaternion(bq);
      const qWorld = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(u, new THREE.Vector3().crossVectors(n, u), n)
      );
      ringMesh.quaternion.copy(bq.invert().multiply(qWorld));
    }
    // woven braid beads
    const N = 20;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const radial = u.clone().multiplyScalar(Math.cos(a)).add(w.clone().multiplyScalar(Math.sin(a)));
      const tan = u.clone().multiplyScalar(-Math.sin(a)).add(w.clone().multiplyScalar(Math.cos(a)));
      const tilt = i % 2 ? 0.55 : -0.55;
      const dir = tan.clone().add(n.clone().multiplyScalar(tilt)).normalize();
      const p = cc.clone().add(radial.clone().multiplyScalar(R + 0.0035));
      ell(i % 2 ? C.leather : "#a8653a", neck, p, [0.0035, 0.0068, 0.0028], basisQ(dir, radial));
    }
    // bell hanging at the front
    const front = cc.clone().add(w.clone().multiplyScalar(R + 0.006));
    put(new THREE.TorusGeometry(0.0038, 0.0012, 4, 8), mat(C.brassDark, "metal"), neck, front, basisQ([0, 1, 0], [1, 0, 0]));
    const bellC = addv(front, 0, -0.011, 0.002);
    ell(C.brass, neck, bellC, [0.0105, 0.0105, 0.0105], undefined, "metal", 1);
    put(new THREE.TorusGeometry(0.0098, 0.0011, 4, 12), mat(C.brassDark, "metal"), neck, addv(bellC, 0, -0.001, 0), basisQ([0, 0, 1], [0, 1, 0]));
    put(new THREE.BoxGeometry(0.0022, 0.0015, 0.016), mat(C.nose), neck, addv(bellC, 0, -0.0085, 0));
    ell(C.brassDark, neck, addv(bellC, 0, -0.0045, 0.0085), [0.0018, 0.0018, 0.0014], undefined, "metal", 0);
    ell("#fff1c4", neck, addv(bellC, 0.004, 0.005, 0.007), [0.0022, 0.0022, 0.0012], undefined, "gloss", 0);
  }

  // ======================================================================
  // HEAD
  // ======================================================================
  const HR: V = [0.046, 0.042, 0.042];
  ell(C.cream, head, H, HR);
  ell(C.gold, head, addv(H, 0, 0.014, -0.006), [0.041, 0.032, 0.037]);
  ell(C.goldWarm, head, addv(H, 0, 0.026, 0.006), [0.017, 0.012, 0.03]);
  // cheeks + tufts
  for (const [s] of sides) {
    ell(C.creamLight, head, addv(H, s * 0.03, -0.013, 0.012), [0.026, 0.021, 0.024]);
    for (let k = 0; k < 3; k++) {
      const base = addv(H, s * 0.046, -0.01 - k * 0.008, 0.004 - k * 0.003);
      cone(k === 1 ? C.cream : C.creamLight, head, base, addv(base, s * 0.024, -0.008 - k * 0.004, -0.012), 0.007, 4);
    }
  }
  // muzzle
  ell(C.creamLight, head, addv(H, 0, -0.012, 0.046), [0.02, 0.016, 0.03]);
  ell(C.goldWarm, head, addv(H, 0, 0.002, 0.04), [0.0095, 0.0075, 0.026]);
  ell(C.nose, head, addv(H, 0, -0.005, 0.076), [0.0095, 0.0072, 0.0072], undefined, "gloss");
  ell("#7a5a50", head, addv(H, 0, -0.0005, 0.08), [0.004, 0.0018, 0.003], undefined, "gloss", 0);
  ell(C.liner, head, addv(H, 0, -0.0195, 0.056), [0.012, 0.0015, 0.016]);
  // lower jaw (separate bone)
  ell(C.creamLight, jaw, addv(H, 0, -0.026, 0.042), [0.016, 0.0085, 0.025]);
  ell(C.cream, jaw, addv(H, 0, -0.03, 0.03), [0.018, 0.009, 0.018]);

  // whiskers
  for (const [s] of sides) {
    for (let k = 0; k < 3; k++) {
      const base = addv(H, s * 0.015, -0.01 - k * 0.003, 0.064 - k * 0.002);
      const tip = addv(base, s * 0.045, 0.01 - k * 0.01, -0.006 + k * 0.004);
      seg(C.whisker, head, base, tip, 0.0007, 0.0004, 3);
    }
  }

  // eyes
  for (const [s] of sides) {
    const ex = 0.021, ey = 0.007;
    const ez = HR[2] * Math.sqrt(Math.max(0, 1 - (ex / HR[0]) ** 2 - (ey / HR[1]) ** 2));
    const n = new THREE.Vector3((s * ex) / HR[0] ** 2, ey / HR[1] ** 2, ez / HR[2] ** 2).normalize();
    const surf = addv(H, s * ex, ey, ez);
    const q = basisQ(n, [0, 1, 0]); // local y = outward normal, local z = up
    // eyeliner rim (darker, slightly larger, almond)
    ell(C.liner, head, surf.clone().add(n.clone().multiplyScalar(-0.0035)), [0.0185, 0.007, 0.017], q);
    // the big dark eye
    const eyeC = surf.clone().add(n.clone().multiplyScalar(-0.001));
    ell(C.eye, head, eyeC, [0.0155, 0.0075, 0.0158], q, "gloss");
    // sparkles
    const up = new THREE.Vector3(0, 1, 0);
    const out = new THREE.Vector3(s, 0, 0);
    ell(C.white, head, eyeC.clone().add(n.clone().multiplyScalar(0.0062)).add(up.clone().multiplyScalar(0.0062)).add(out.clone().multiplyScalar(0.004)),
      [0.0036, 0.0036, 0.0022], q, "gloss", 0);
    ell(C.white, head, eyeC.clone().add(n.clone().multiplyScalar(0.0066)).add(up.clone().multiplyScalar(-0.005)).add(out.clone().multiplyScalar(-0.004)),
      [0.0016, 0.0016, 0.0012], q, "gloss", 0);
    // tear streak down toward the muzzle
    const ts = addv(H, s * 0.012, -0.009, 0.055);
    ell(C.stripe, head, ts, [0.0028, 0.0095, 0.0025], basisQ([s * 0.35, 1, -0.3], [0, 0, 1]));
    // pale brow
    ell(C.creamLight, head, addv(H, s * 0.021, 0.024, 0.032), [0.011, 0.005, 0.007], basisQ([0, 1, 0.3], [0, 0, 1]));
  }

  // ======================================================================
  // EARS (enormous, satin peach lining)
  // ======================================================================
  for (const [s, S] of sides) {
    const { base, tip, j0, j1 } = ears[S];
    const d = tip.clone().sub(base);
    const len = d.length();
    const dn = d.clone().normalize();
    const q = basisQ(dn, [0, 0.15, 1]);
    const zAx = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const xAx = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const b0 = base.clone().sub(dn.clone().multiplyScalar(0.012));
    const L = len + 0.012;
    // outer gold shell
    put(coneG(7), mat(C.gold), j0, b0.clone().add(dn.clone().multiplyScalar(L / 2)), q, [0.038, L, 0.038 * 0.38]);
    // warm back seam
    put(coneG(5), mat(C.goldWarm), j0, b0.clone().add(dn.clone().multiplyScalar(L * 0.42)).add(zAx.clone().multiplyScalar(-0.006)), q, [0.02, L * 0.8, 0.008]);
    // satin peach lining
    const inL = L * 0.86;
    put(coneG(7), mat(C.peach, "satin"), j0,
      b0.clone().add(dn.clone().multiplyScalar(inL / 2 + 0.004)).add(zAx.clone().multiplyScalar(0.0062)), q, [0.03, inL, 0.0065]);
    // veins
    for (const vx of [-0.0085, 0.0085]) {
      put(ico(0), mat(C.peachVein, "satin"), j1,
        b0.clone().add(dn.clone().multiplyScalar(L * 0.5)).add(xAx.clone().multiplyScalar(vx)).add(zAx.clone().multiplyScalar(0.0105)),
        basisQ(dn.clone().add(xAx.clone().multiplyScalar(vx * 4)), zAx), [0.0016, L * 0.2, 0.0012]);
    }
    // dark tip
    const tipBase = b0.clone().add(dn.clone().multiplyScalar(L - 0.03));
    put(coneG(6), mat(C.earTip), j1, tipBase.clone().add(dn.clone().multiplyScalar(0.0155)), q, [0.0098, 0.031, 0.0098 * 0.5]);
    // cream inner fur tufts
    for (let k = 0; k < 5; k++) {
      const off = (k - 2) * 0.0065;
      const fbse = base.clone().add(xAx.clone().multiplyScalar(off)).add(zAx.clone().multiplyScalar(0.009)).add(dn.clone().multiplyScalar(0.004));
      const ftip = fbse.clone()
        .add(dn.clone().multiplyScalar(0.03 + 0.008 * (2 - Math.abs(k - 2))))
        .add(xAx.clone().multiplyScalar(off * 0.6))
        .add(zAx.clone().multiplyScalar(0.006));
      cone(k % 2 ? C.cream : C.creamLight, j0, fbse, ftip, 0.0042, 4, zAx, 0.6);
    }
  }

  // ======================================================================
  // LEGS (oversized kit paws)
  // ======================================================================
  function paw(bone: any, toeBone: any, center: THREE.Vector3, s: number, fwd: number) {
    ell(C.cream, bone, center, [0.0195, 0.0132, 0.025]);
    ell(C.pad, bone, addv(center, 0, -0.008, -0.003 * fwd), [0.015, 0.005, 0.018]);
    for (let t = 0; t < 4; t++) {
      const x = (t - 1.5) * 0.0098;
      const tc = addv(center, x, -0.002 - Math.abs(t - 1.5) * 0.0005, fwd * (0.02 - Math.abs(t - 1.5) * 0.0035));
      ell(C.creamLight, toeBone, tc, [0.0058, 0.0072, 0.0066]);
      // dark claw tip
      cone(C.liner, toeBone, addv(tc, 0, -0.003, fwd * 0.005), addv(tc, 0, -0.005, fwd * 0.009), 0.0014, 4);
    }
    // toe division lines
    for (let t = 0; t < 3; t++) {
      const x = (t - 1) * 0.0098;
      ell(C.goldDeep, toeBone, addv(center, x, 0.004, fwd * 0.02), [0.0009, 0.0035, 0.004]);
    }
    void s;
  }

  for (const [s, S] of sides) {
    const f = fronts[S];
    const Sp = V3(P(s * 0.033, 0.105, 0.055)), E = V3(P(s * 0.036, 0.06, 0.06)), W = V3(P(s * 0.037, 0.022, 0.066));
    ell(C.gold, f.shoulder, addv(Sp, 0, 0.005, -0.004), [0.021, 0.028, 0.024]);
    seg(C.gold, f.shoulder, Sp, E, 0.017, 0.012, 7);
    ell(C.cream, f.elbow, E, [0.0125, 0.0125, 0.0125]);
    seg(C.cream, f.elbow, E, W, 0.0115, 0.0098, 7);
    // little warm stripe down the foreleg
    ell(C.stripe, f.elbow, E.clone().lerp(W, 0.45).add(new THREE.Vector3(0, 0, 0.0095)), [0.0025, 0.016, 0.0018], basisQ(W.clone().sub(E)));
    ell(C.cream, f.wrist, W, [0.011, 0.011, 0.011]);
    paw(f.wrist, f.fingers, V3(P(s * 0.037, 0.012, 0.078)), s, 1);

    const h = hinds[S];
    const Hp = V3(P(s * 0.036, 0.105, -0.075)), K = V3(P(s * 0.041, 0.066, -0.048)), Hk = V3(P(s * 0.041, 0.028, -0.09));
    ell(C.gold, h.hip, Hp.clone().lerp(K, 0.4).add(new THREE.Vector3(s * 0.004, 0.006, -0.006)), [0.024, 0.037, 0.03], basisQ(K.clone().sub(Hp), [0, 0, 1]));
    ell(C.goldWarm, h.hip, Hp.clone().lerp(K, 0.3).add(new THREE.Vector3(s * 0.012, 0.012, -0.01)), [0.012, 0.022, 0.016], basisQ(K.clone().sub(Hp), [0, 0, 1]));
    seg(C.gold, h.hip, Hp, K, 0.019, 0.013, 7);
    ell(C.cream, h.knee, K, [0.012, 0.012, 0.012]);
    seg(C.cream, h.knee, K, Hk, 0.011, 0.0085, 7);
    ell(C.cream, h.hock, Hk, [0.0095, 0.0095, 0.0095]);
    seg(C.cream, h.hock, Hk, P(s * 0.041, 0.012, -0.08), 0.0092, 0.0105, 7);
    paw(h.hock, h.toes, V3(P(s * 0.041, 0.012, -0.073)), s, 1);
  }

  // ======================================================================
  // TAIL (bushy, black smudge at the tip)
  // ======================================================================
  {
    const radii = [0.024, 0.033, 0.037, 0.03];
    const segC = [C.gold, C.gold, C.goldWarm, C.goldWarm];
    for (let i = 0; i < 4; i++) {
      const A = V3(tailPts[i]), B = V3(tailPts[i + 1]);
      const d = B.clone().sub(A);
      const len = d.length();
      const mid = A.clone().add(B).multiplyScalar(0.5);
      const q = basisQ(d, [0, 1, 0]);
      const r = radii[i];
      ell(segC[i], tailJ[i], mid, [r, len * 0.82, r * 0.95], q);
      // cream underside
      ell(C.cream, tailJ[i], addv(mid, 0, -r * 0.35, 0), [r * 0.8, len * 0.7, r * 0.6], q);
      // tufts
      const dn = d.clone().normalize();
      const u = new THREE.Vector3(1, 0, 0);
      const w = new THREE.Vector3().crossVectors(dn, u).normalize();
      const nT = 8;
      for (let k = 0; k < nT; k++) {
        const a = (k / nT) * Math.PI * 2 + rand() * 0.5;
        const radial = u.clone().multiplyScalar(Math.cos(a)).add(w.clone().multiplyScalar(Math.sin(a)));
        const along = range(-0.3, 0.35) * len;
        const bpos = mid.clone().add(dn.clone().multiplyScalar(along)).add(radial.clone().multiplyScalar(r * 0.75));
        const tpos = bpos.clone().add(radial.clone().multiplyScalar(range(0.012, 0.02))).add(dn.clone().multiplyScalar(range(0.012, 0.022)));
        const isTop = radial.y > -0.2;
        const col = i === 3 && along > 0 ? C.smudge : isTop ? (rand() < 0.5 ? C.gold : C.goldWarm) : C.cream;
        cone(col, tailJ[i], bpos, tpos, r * 0.28, 4, radial, 0.7);
      }
    }
    // black-tipped end
    const T3 = V3(tailPts[3]), T4 = V3(tailPts[4]);
    const dT = T4.clone().sub(T3);
    const qT = basisQ(dT, [0, 1, 0]);
    ell(C.smudge, tailJ[3], T3.clone().lerp(T4, 0.55), [0.029, 0.03, 0.028], qT);
    ell(C.tailTip, tailJ[3], T3.clone().lerp(T4, 0.95), [0.022, 0.03, 0.021], qT);
    cone(C.tailTip, tailJ[3], T3.clone().lerp(T4, 1.2), T3.clone().lerp(T4, 1.6), 0.012, 5);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      const bpos = T3.clone().lerp(T4, 1.05).add(radial.clone().multiplyScalar(0.014));
      cone(C.tailTip, tailJ[3], bpos, bpos.clone().add(dT.clone().normalize().multiplyScalar(0.022)).add(radial.clone().multiplyScalar(0.008)), 0.006, 4);
    }
    // fluffy root where tail meets the rump
    ell(C.gold, hips, V3(tailPts[0]).add(new THREE.Vector3(0, 0, 0.01)), [0.024, 0.022, 0.022]);
  }

  return b.root;
}
```