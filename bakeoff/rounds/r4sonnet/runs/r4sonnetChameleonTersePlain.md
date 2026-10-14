```ts
import * as THREE from "three";

export const meta = {
  name: "Veiled Chameleon",
  description:
    "A stylised low-poly veiled chameleon gripping a mossy branch: tall casque, turret eyes, zygodactyl feet wrapped round the bark, barred and striped flanks, dorsal crest and a prehensile tail coiled into a spiral.",
};

type St = { z: number; cy: number; ry: number };
type V3 = THREE.Vector3;

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.anisotropy = 4;
  return t;
}

// chunky scale mosaic, tiles seamlessly
function mosaic(base: string, accents: string[], grout: string, seed: number) {
  return canvasTex(64, 64, (ctx, w, h) => {
    const r = mulberry32(seed);
    ctx.fillStyle = grout;
    ctx.fillRect(0, 0, w, h);
    const cell = 8;
    const hsl = { h: 0, s: 0, l: 0 };
    new THREE.Color(base).getHSL(hsl);
    const acc = accents.map((a) => new THREE.Color(a));
    for (let j = 0; j < h / cell; j++) {
      const off = (j % 2) * 4;
      for (let i = 0; i < w / cell; i++) {
        let c: THREE.Color;
        if (r() < 0.1) {
          c = acc[Math.floor(r() * acc.length)].clone();
        } else {
          c = new THREE.Color().setHSL(
            hsl.h + (r() - 0.5) * 0.03,
            hsl.s,
            THREE.MathUtils.clamp(hsl.l + (r() - 0.5) * 0.12, 0, 1)
          );
        }
        ctx.fillStyle = "#" + c.getHexString();
        const x = (i * cell + off) % w;
        const y = j * cell;
        ctx.fillRect(x, y, cell - 1, cell - 1);
        if (x + cell > w) ctx.fillRect(x - w, y, cell - 1, cell - 1);
      }
    }
  });
}

function skinMat(base: string, accents: string[], grout: string, seed: number, rough = 0.7) {
  const tex = mosaic(base, accents, grout, seed);
  return new THREE.MeshStandardMaterial({
    color: tex ? 0xffffff : new THREE.Color(base),
    map: tex,
    roughness: rough,
    metalness: 0,
    flatShading: true,
  });
}

function scaleUV(g: THREE.BufferGeometry, su: number, sv: number) {
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  uv.needsUpdate = true;
}

function sample(st: St[], z: number) {
  if (z <= st[0].z) return { cy: st[0].cy, ry: st[0].ry };
  for (let i = 0; i < st.length - 1; i++) {
    const a = st[i];
    const b = st[i + 1];
    if (z <= b.z) {
      const t = (z - a.z) / (b.z - a.z);
      return { cy: a.cy + (b.cy - a.cy) * t, ry: a.ry + (b.ry - a.ry) * t };
    }
  }
  const l = st[st.length - 1];
  return { cy: l.cy, ry: l.ry };
}

// point + outward normal on a lofted chain's elliptical cross-section
function onChain(st: St[], k: number, z: number, aDeg: number, s: number, f = 1) {
  const { cy, ry } = sample(st, z);
  const a = (aDeg * Math.PI) / 180;
  const p = new THREE.Vector3(s * k * ry * f * Math.cos(a), cy + ry * f * Math.sin(a), z);
  const n = new THREE.Vector3((s * Math.cos(a)) / k, Math.sin(a), 0).normalize();
  return { p, n };
}

function prism(pts: [number, number][], depth: number, bevel = 0) {
  const sh = new THREE.Shape();
  pts.forEach(([z, y], i) => (i ? sh.lineTo(-z, y) : sh.moveTo(-z, y)));
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    steps: 1,
  });
  g.translate(0, 0, -depth / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

function jitterGeo(g: THREE.BufferGeometry, amt: number, amtY: number, keepAbove: number) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const hx = hash3(x, y, z) - 0.5;
    const hz = hash3(z, x, y) - 0.5;
    const hy = hash3(y, z, x) - 0.5;
    pos.setXYZ(i, x + hx * amt, y > keepAbove ? y : y + hy * amtY, z + hz * amt);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
}

/* ------------------------------------------------------------------ */
/* the model                                                           */
/* ------------------------------------------------------------------ */

export default function build(): THREE.Object3D {
  const rand = mulberry32(90210);
  const Y = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const deg = THREE.MathUtils.degToRad;
  const P = 0.07; // world size of one skin-texture tile

  const root = new THREE.Group();
  const model = new THREE.Group();
  root.add(model);

  /* ---------------- materials ---------------- */
  const flat = (color: string, rough = 0.8) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, flatShading: true });

  const skinLime = skinMat("#82c543", ["#2fc6b4", "#f4d64a", "#a9de4f"], "#4d8f2d", 11);
  const skinDark = skinMat("#2e8a4a", ["#1e6a3c", "#3fa85d", "#86c43f"], "#1c5a33", 23);
  const skinCream = skinMat("#efe3ae", ["#f8f0cc", "#e4cd86"], "#cdb877", 37, 0.8);
  const cream = flat("#f3e7a4");
  const yellow = flat("#f6d343");
  const orange = flat("#f0862a");
  const turq = flat("#2fc6b4");
  const mouthMat = flat("#3b2a1c");
  const blackMat = flat("#121212", 0.35);
  const whiteMat = flat("#fffbe6", 0.4);
  const lidMat = flat("#9fd24a");
  const ringMat = flat("#ffb52e", 0.5);
  const clawMat = flat("#eadfc4");
  const toeMat = flat("#2a7a45");
  const ridgeMat = flat("#b9e25c");
  const barkDark = flat("#59402a", 0.95);
  const cutMat = flat("#d9bd8a");
  const rockA = flat("#8c867b", 0.95);
  const rockB = flat("#6f6a62", 0.95);
  const mossA = flat("#5d9b3f", 0.95);
  const mossB = flat("#7ab648", 0.95);
  const veinMat = flat("#b9e27c");
  const leafMats = [flat("#4aa23c"), flat("#6dc04b"), flat("#38873b")];

  const barkTex = canvasTex(128, 128, (ctx, w, h) => {
    const r = mulberry32(5);
    ctx.fillStyle = "#6b4b31";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 340; i++) {
      const x = Math.floor(r() * w);
      const y = Math.floor(r() * h);
      const l = 8 + r() * 46;
      const ww = 1 + Math.floor(r() * 3);
      const pick = r();
      ctx.fillStyle = pick < 0.45 ? "#4d3524" : pick < 0.75 ? "#85613f" : "#9a7550";
      ctx.globalAlpha = 0.55 + r() * 0.4;
      ctx.fillRect(x, y, ww, l);
    }
    ctx.globalAlpha = 1;
  });
  if (barkTex) barkTex.repeat.set(1, 2.2);
  const barkMat = new THREE.MeshStandardMaterial({
    color: barkTex ? 0xffffff : new THREE.Color("#6b4b31"),
    map: barkTex,
    roughness: 0.95,
    flatShading: true,
  });
  const endTex = canvasTex(64, 64, (ctx, w, h) => {
    ctx.fillStyle = "#d9b98a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = i % 2 ? "#b88f5f" : "#c9a674";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 30 - i * 3.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#7a5233";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  const endMat = new THREE.MeshStandardMaterial({
    color: endTex ? 0xffffff : new THREE.Color("#d9b98a"),
    map: endTex,
    roughness: 0.9,
    flatShading: true,
  });

  /* ---------------- geometry builders ---------------- */
  type LimbOpt = {
    sides?: number;
    kx?: number;
    open?: boolean;
    ts?: number;
    tl?: number;
    tex?: boolean;
  };

  const limb = (
    parent: THREE.Object3D,
    a: V3,
    b: V3,
    r0: number,
    r1: number,
    mat: THREE.Material,
    o: LimbOpt = {}
  ) => {
    const sides = o.sides ?? 6;
    const kx = o.kx ?? 1;
    const tl = o.tl ?? Math.PI * 2;
    const len = Math.max(1e-5, a.distanceTo(b));
    const g = new THREE.CylinderGeometry(r1, r0, len, sides, 1, o.open ?? false, o.ts ?? 0, tl);
    if (o.tex !== false && (mat as THREE.MeshStandardMaterial).map) {
      const circ = 2 * Math.PI * ((r0 + r1) / 2) * ((1 + kx) / 2) * (tl / (Math.PI * 2));
      scaleUV(g, Math.max(1, Math.round(circ / P)), Math.max(0.25, len / P));
    }
    const m = new THREE.Mesh(g, mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(Y, b.clone().sub(a).normalize());
    m.scale.x = kx;
    parent.add(m);
    return m;
  };

  const ball = (
    parent: THREE.Object3D,
    p: V3,
    r: number,
    mat: THREE.Material,
    o: { kx?: number; w?: number; h?: number; q?: THREE.Quaternion; rotY?: number } = {}
  ) => {
    const g = new THREE.SphereGeometry(r, o.w ?? 7, o.h ?? 5);
    if (o.rotY) g.rotateY(o.rotY);
    if ((mat as THREE.MeshStandardMaterial).map)
      scaleUV(
        g,
        Math.max(1, Math.round((2 * Math.PI * r) / P)),
        Math.max(1, Math.round((Math.PI * r) / P))
      );
    const m = new THREE.Mesh(g, mat);
    m.position.copy(p);
    if (o.q) m.quaternion.copy(o.q);
    if (o.kx) m.scale.x = o.kx;
    parent.add(m);
    return m;
  };

  const spike = (
    parent: THREE.Object3D,
    base: V3,
    dir: V3,
    r: number,
    h: number,
    mat: THREE.Material,
    sides = 4
  ) => {
    const d = dir.clone().normalize();
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, sides, 1), mat);
    m.quaternion.setFromUnitVectors(Y, d);
    m.position.copy(base).addScaledVector(d, h / 2);
    parent.add(m);
    return m;
  };

  const disc = (
    parent: THREE.Object3D,
    p: V3,
    n: V3,
    r: number,
    th: number,
    mat: THREE.Material,
    sides = 6
  ) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, th, sides), mat);
    m.quaternion.setFromUnitVectors(Y, n.clone().normalize());
    m.position.copy(p);
    parent.add(m);
    return m;
  };

  // hemisphere whose rings line up with an 8-sided frustum end
  const capSphere = (
    parent: THREE.Object3D,
    c: V3,
    r: number,
    mat: THREE.Material,
    dirZ: number,
    kx: number,
    hs = 3
  ) => {
    const g = new THREE.SphereGeometry(r, 8, hs, 0, Math.PI * 2, 0, Math.PI / 2);
    g.rotateX(dirZ > 0 ? Math.PI / 2 : -Math.PI / 2);
    if ((mat as THREE.MeshStandardMaterial).map)
      scaleUV(g, Math.max(1, Math.round((2 * Math.PI * r) / P)), 1);
    const m = new THREE.Mesh(g, mat);
    m.position.copy(c);
    m.scale.x = kx;
    parent.add(m);
    return m;
  };

  const chain = (parent: THREE.Object3D, st: St[], k: number, mat: THREE.Material) => {
    for (let i = 0; i < st.length - 1; i++) {
      limb(
        parent,
        V(0, st[i].cy, st[i].z),
        V(0, st[i + 1].cy, st[i + 1].z),
        st[i].ry,
        st[i + 1].ry,
        mat,
        { sides: 8, kx: k }
      );
    }
  };

  /* ================================================================ */
  /* BRANCH, ROCKS, LEAVES                                            */
  /* ================================================================ */
  const env = new THREE.Group();
  model.add(env);

  const yb = 0.085;
  const zB0 = -0.165;
  const zB1 = 0.29;
  const BL = zB1 - zB0;
  const branchR = (z: number) =>
    THREE.MathUtils.lerp(0.0195, 0.0145, THREE.MathUtils.clamp((z - zB0) / BL, 0, 1));

  const branch = new THREE.Mesh(
    new THREE.CylinderGeometry(branchR(zB1), branchR(zB0), BL, 9, 1, false),
    [barkMat, endMat, endMat]
  );
  branch.rotation.x = Math.PI / 2;
  branch.position.set(0, yb, (zB0 + zB1) / 2);
  env.add(branch);

  // knots
  ball(env, V(0.016, yb - 0.004, 0.17), 0.0065, barkDark, { w: 6, h: 4 });
  ball(env, V(-0.0135, yb + 0.007, 0.245), 0.006, barkDark, { w: 6, h: 4 });
  ball(env, V(-0.015, yb - 0.006, -0.125), 0.006, barkDark, { w: 6, h: 4 });
  // broken-off stub with a pale cut end
  {
    const a = V(-0.012, yb + 0.012, -0.128);
    const b = V(-0.03, yb + 0.046, -0.136);
    const g = new THREE.CylinderGeometry(0.0048, 0.0072, a.distanceTo(b), 6, 1, false);
    const m = new THREE.Mesh(g, [barkDark, cutMat, cutMat]);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(Y, b.clone().sub(a).normalize());
    env.add(m);
  }

  // supporting rocks with mossy caps
  const buildRock = (x: number, z: number, rBot: number, rTop: number, h: number, mm: THREE.Material, mossM: THREE.Material) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 7, 2);
    jitterGeo(g, rBot * 0.32, h * 0.12, h * 0.4);
    const m = new THREE.Mesh(g, mm);
    m.position.set(x, h / 2 - 0.002, z);
    m.rotation.y = rand() * 6;
    env.add(m);
    const mg = new THREE.CylinderGeometry(rTop * 0.95, rTop * 1.2, 0.024, 7, 1);
    jitterGeo(mg, rTop * 0.2, 0.004, 0.0);
    const moss = new THREE.Mesh(mg, mossM);
    moss.position.set(x, h - 0.002 - 0.008 + 0.012, z);
    moss.rotation.y = rand() * 6;
    env.add(moss);
  };
  buildRock(0.0, -0.158, 0.056, 0.04, 0.056, rockA, mossA);
  buildRock(0.0, 0.225, 0.05, 0.036, 0.056, rockB, mossB);

  const pebble = (x: number, z: number, sx: number, sy: number, sz: number, mm: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mm);
    m.scale.set(sx, sy, sz);
    m.rotation.set(rand() * 0.4, rand() * 6.28, rand() * 0.4);
    m.position.set(x, 0, z);
    m.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(m, true);
    m.position.y = -0.002 - b.min.y;
    env.add(m);
  };
  pebble(0.07, -0.12, 0.022, 0.014, 0.018, rockB);
  pebble(-0.062, -0.19, 0.026, 0.016, 0.02, rockA);
  pebble(0.045, -0.215, 0.016, 0.01, 0.014, rockB);
  pebble(0.062, 0.2, 0.02, 0.012, 0.017, rockA);
  pebble(-0.058, 0.262, 0.024, 0.015, 0.02, rockB);
  pebble(0.03, 0.285, 0.014, 0.009, 0.012, rockA);

  // leaves
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const leafShape = new THREE.Shape();
  const lp: [number, number][] = [
    [0, 0],
    [0.01, 0.01],
    [0.0145, 0.026],
    [0.011, 0.042],
    [0.004, 0.056],
    [0, 0.062],
    [-0.004, 0.056],
    [-0.011, 0.042],
    [-0.0145, 0.026],
    [-0.01, 0.01],
  ];
  lp.forEach(([x, y], i) => (i ? leafShape.lineTo(x, y) : leafShape.moveTo(x, y)));
  leafShape.closePath();
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.0016, bevelEnabled: false });
  leafGeo.translate(0, 0, -0.0008);

  const addLeaf = (p: V3, d: V3, sc: number, mi: number) => {
    const dir = d.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
    const n0 = V(0, 0, 1).applyQuaternion(q);
    const up = V(0, 1, 0).addScaledVector(dir, -dir.y);
    if (up.lengthSq() > 1e-6) {
      up.normalize();
      const ang = Math.atan2(n0.clone().cross(up).dot(dir), n0.dot(up)) + (rand() - 0.5) * 0.7;
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(dir, ang));
    }
    const m = new THREE.Mesh(leafGeo, leafMats[mi % 3]);
    m.quaternion.copy(q);
    m.position.copy(p);
    m.scale.setScalar(sc);
    env.add(m);
    const vein = new THREE.Mesh(unitBox, veinMat);
    vein.position.set(0, 0.031, 0);
    vein.scale.set(0.0016, 0.056, 0.003);
    m.add(vein);
  };

  const twig = (pts: V3[], r0: number, r1: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const t0 = i / (pts.length - 1);
      const t1 = (i + 1) / (pts.length - 1);
      limb(env, pts[i], pts[i + 1], THREE.MathUtils.lerp(r0, r1, t0), THREE.MathUtils.lerp(r0, r1, t1), barkDark, {
        sides: 5,
        tex: false,
      });
      if (i > 0) ball(env, pts[i], THREE.MathUtils.lerp(r0, r1, t0), barkDark, { w: 5, h: 3 });
    }
  };
  const tw1 = [V(0.003, 0.097, 0.2), V(0.014, 0.132, 0.215), V(0.036, 0.168, 0.236)];
  twig(tw1, 0.0058, 0.003);
  addLeaf(tw1[2], V(0.7, 0.6, 0.35), 1.35, 0);
  addLeaf(tw1[2], V(0.2, 0.8, 0.5), 1.1, 1);
  addLeaf(tw1[1], V(0.9, 0.2, 0.3), 1.3, 2);
  addLeaf(tw1[1], V(-0.8, 0.35, 0.45), 1.45, 1);
  const tw2 = [V(-0.004, 0.097, 0.256), V(-0.022, 0.13, 0.262), V(-0.04, 0.16, 0.27)];
  twig(tw2, 0.0052, 0.003);
  addLeaf(tw2[2], V(-0.8, 0.5, 0.3), 1.3, 0);
  addLeaf(tw2[2], V(-0.2, 0.9, 0.4), 1.05, 2);
  addLeaf(tw2[1], V(-0.9, 0.1, 0.2), 1.4, 1);
  addLeaf(tw2[1], V(0.5, 0.4, 0.8), 1.15, 0);

  /* ================================================================ */
  /* CHAMELEON                                                        */
  /* ================================================================ */
  const cham = new THREE.Group();
  model.add(cham);

  const KB = 0.55;
  const KH = 0.85;
  const bodySt: St[] = [
    { z: -0.105, cy: 0.19, ry: 0.034 },
    { z: -0.07, cy: 0.192, ry: 0.047 },
    { z: -0.02, cy: 0.194, ry: 0.057 },
    { z: 0.03, cy: 0.195, ry: 0.058 },
    { z: 0.075, cy: 0.194, ry: 0.05 },
    { z: 0.108, cy: 0.192, ry: 0.038 },
  ];
  const headSt: St[] = [
    { z: 0.104, cy: 0.195, ry: 0.036 },
    { z: 0.128, cy: 0.195, ry: 0.032 },
    { z: 0.155, cy: 0.187, ry: 0.0235 },
    { z: 0.178, cy: 0.18, ry: 0.0145 },
  ];

  /* ---- torso ---- */
  chain(cham, bodySt, KB, skinLime);
  capSphere(cham, V(0, 0.19, -0.105), 0.034, skinLime, -1, KB);

  // cream belly keel
  const belly: St[] = [{ z: -0.095, cy: 0.159, ry: 0.006 }];
  for (let i = 1; i < bodySt.length; i++)
    belly.push({ z: bodySt[i].z, cy: bodySt[i].cy - 0.5 * bodySt[i].ry, ry: 0.6 * bodySt[i].ry });
  chain(cham, belly, 0.5, skinCream);

  // dark bars over the back and flanks
  [-0.085, -0.052, -0.018, 0.016, 0.05].forEach((z0) => {
    const a = sample(bodySt, z0 - 0.007);
    const b = sample(bodySt, z0 + 0.007);
    const f = 1.045;
    limb(
      cham,
      V(0, a.cy, z0 - 0.007),
      V(0, b.cy, z0 + 0.007),
      a.ry * f + 0.0012,
      b.ry * f + 0.0012,
      skinDark,
      { sides: 6, kx: KB, open: true, ts: Math.PI / 4, tl: Math.PI * 1.5 }
    );
  });

  // cream lateral stripe, orange bar spots, turquoise dots
  [1, -1].forEach((s) => {
    const zs: number[] = [];
    for (let z = -0.098; z <= 0.0941; z += 0.016) zs.push(z);
    for (let i = 0; i < zs.length - 1; i++) {
      const a = onChain(bodySt, KB, zs[i], 8, s, 1.045).p;
      const b = onChain(bodySt, KB, zs[i + 1], 8, s, 1.045).p;
      limb(cham, a, b, 0.0045, 0.0045, cream, { sides: 5, open: true });
    }
    [-0.085, -0.052, -0.018, 0.016, 0.05].forEach((z0) => {
      const { p, n } = onChain(bodySt, KB, z0, 40, s, 1.05);
      disc(cham, p.addScaledVector(n, 0.001), n, 0.0072, 0.0035, orange, 6);
    });
    [-0.0685, -0.035, -0.001, 0.033, 0.067].forEach((z0) => {
      const { p, n } = onChain(bodySt, KB, z0, 55, s, 1.0);
      disc(cham, p.addScaledVector(n, 0.0005), n, 0.0062, 0.0035, turq, 6);
    });
  });

  // dorsal crest
  for (let z = -0.098, i = 0; z <= 0.092; z += 0.0145, i++) {
    const { p } = onChain(bodySt, KB, z, 90, 1, 1.0);
    const h = 0.009 + 0.008 * Math.sin((Math.PI * (z + 0.105)) / 0.215);
    spike(cham, p.add(V(0, -0.003, 0)), V(0, 1, -0.35), 0.0042, h, i % 2 ? orange : yellow, 4);
  }
  // ventral teeth
  for (let z = -0.082; z <= 0.092; z += 0.0165) {
    const { cy, ry } = sample(belly, z);
    spike(cham, V(0, cy - ry + 0.001, z), V(0, -1, -0.3), 0.0032, 0.0065, cream, 4);
  }

  /* ---- tail: spiral coil ---- */
  {
    const tailPts: V3[] = [V(0, 0.19, -0.105), V(0, 0.186, -0.145), V(0, 0.177, -0.195)];
    const zc = -0.245;
    const yc = 0.115;
    const c0 = 0.046;
    const c1 = 0.008;
    const turns = 1.45;
    const phi0 = Math.PI / 2;
    const phi1 = phi0 + turns * Math.PI * 2;
    const NS = 44;
    for (let i = 0; i <= NS; i++) {
      const u = i / NS;
      const phi = phi0 + u * (phi1 - phi0);
      const r = c0 + (c1 - c0) * u;
      tailPts.push(V(0.009 * u, yc + r * Math.sin(phi), zc + r * Math.cos(phi)));
    }
    const curve = new THREE.CatmullRomCurve3(tailPts, false, "centripetal");
    const NT = 72;
    const tp = curve.getSpacedPoints(NT);
    const tr = (s: number) => 0.0035 + 0.0285 * Math.pow(1 - s, 2.2);
    for (let i = 0; i < NT; i++) {
      const s0 = i / NT;
      const s1 = (i + 1) / NT;
      const kx = THREE.MathUtils.lerp(0.62, 1, THREE.MathUtils.smoothstep(s0, 0, 0.14));
      const band = Math.floor(i / 4);
      const mat: THREE.Material = i >= NT - 8 ? orange : band % 2 === 0 ? skinLime : skinDark;
      const m = limb(cham, tp[i], tp[i + 1], tr(s0), tr(s1), mat, { sides: 6, kx, open: true });
      ball(cham, tp[i + 1], tr(s1), mat, { w: 6, h: 4, rotY: Math.PI / 6, q: m.quaternion.clone(), kx });
      if (i >= 3 && i <= 22 && i % 3 === 0) {
        spike(
          cham,
          tp[i].clone().add(V(0, tr(s0) * 0.85, 0)),
          V(0, 1, -0.35),
          0.0035,
          Math.max(0.005, 0.012 * (1 - s0 * 2.6)),
          (i / 3) % 2 ? orange : yellow,
          4
        );
      }
    }
  }

  /* ---- feet (zygodactyl grip around the bark) ---- */
  const foot = (s: number, zc: number, bs: number): V3 => {
    const rb = branchR(zc);
    const pa = deg(44);
    const rp = rb + 0.0055;
    const palm = new THREE.Mesh(unitBox, toeMat);
    palm.scale.set(0.011, 0.013, 0.024);
    palm.position.set(s * rp * Math.cos(pa), yb + rp * Math.sin(pa), zc);
    palm.rotation.z = s * pa;
    cham.add(palm);

    const toe = (z: number, d0: number, d1: number, w: number) => {
      const A0 = deg(d0);
      const A1 = deg(d1);
      const nseg = 4;
      for (let i = 0; i < nseg; i++) {
        const a0 = A0 + ((A1 - A0) * i) / nseg;
        const a1 = A0 + ((A1 - A0) * (i + 1)) / nseg;
        const am = (a0 + a1) / 2;
        const thick = 0.0078 - 0.0034 * (i / (nseg - 1));
        const rt = rb + thick / 2;
        const len = Math.abs(a1 - a0) * rt * 1.1 + 0.0005;
        const wd = w * (1 - 0.18 * (i / (nseg - 1)));
        const m = new THREE.Mesh(unitBox, toeMat);
        m.scale.set(thick, len, wd);
        m.position.set(s * rt * Math.cos(am), yb + rt * Math.sin(am), z);
        m.rotation.z = s * am;
        cham.add(m);
      }
      const ds = Math.sign(A1 - A0);
      const rEnd = rb + 0.0022;
      const endP = V(s * rEnd * Math.cos(A1), yb + rEnd * Math.sin(A1), z);
      const t = V(-s * Math.sin(A1) * ds, Math.cos(A1) * ds, 0);
      const inward = V(-s * Math.cos(A1), -Math.sin(A1), 0);
      const cd = t.multiplyScalar(0.85).addScaledVector(inward, 0.45);
      spike(cham, endP.clone().addScaledVector(cd.clone().normalize(), -0.001), cd, 0.0026, 0.0075, clawMat, 4);
    };
    ([[0.002, 70], [0.0078, 76], [0.0136, 66]] as [number, number][]).forEach(([off, len]) =>
      toe(zc + bs * off, 52, 52 + len, 0.0055)
    );
    ([[0.0025, 95], [0.0083, 85]] as [number, number][]).forEach(([off, len]) =>
      toe(zc - bs * off, 36, 36 - len, 0.0055)
    );
    const n = V(s * Math.cos(pa), Math.sin(pa), 0);
    return palm.position.clone().addScaledVector(n, 0.0085);
  };

  const leg = (s: number, sh: V3, el: V3, wr: V3, r: [number, number, number]) => {
    const S = V(sh.x * s, sh.y, sh.z);
    const E = V(el.x * s, el.y, el.z);
    limb(cham, S, E, r[0], r[1], skinLime, { sides: 6, open: true });
    limb(cham, E, wr, r[1], r[2], skinLime, { sides: 6, open: true });
    ball(cham, S, r[0] * 1.18, skinLime);
    ball(cham, E, r[1] * 1.15, skinLime);
    ball(cham, wr, r[2] * 1.08, skinDark);
  };

  // front legs (left foot reaches a little forward)
  leg(1, V(0.027, 0.178, 0.068), V(0.058, 0.138, 0.058), foot(1, 0.093, 1), [0.0125, 0.0102, 0.0088]);
  leg(-1, V(0.027, 0.178, 0.068), V(0.058, 0.138, 0.04), foot(-1, 0.063, 1), [0.0125, 0.0102, 0.0088]);
  // hind legs
  leg(1, V(0.027, 0.178, -0.07), V(0.058, 0.138, -0.046), foot(1, -0.069, -1), [0.0165, 0.0118, 0.0095]);
  leg(-1, V(0.027, 0.178, -0.07), V(0.058, 0.138, -0.056), foot(-1, -0.099, -1), [0.0165, 0.0118, 0.0095]);

  /* ---- head ---- */
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.192, 0.104);
  headPivot.rotation.y = 0.09;
  cham.add(headPivot);
  const headG = new THREE.Group();
  headG.position.set(0, -0.192, -0.104);
  headPivot.add(headG);

  chain(headG, headSt, KH, skinLime);
  capSphere(headG, V(0, 0.195, 0.104), 0.036, skinLime, -1, KH);
  capSphere(headG, V(0, 0.18, 0.178), 0.0145, skinLime, 1, KH);

  // casque (tall helmet crest)
  const casquePts: [number, number][] = [
    [0.16, 0.205],
    [0.148, 0.224],
    [0.13, 0.246],
    [0.112, 0.272],
    [0.096, 0.288],
    [0.094, 0.262],
    [0.097, 0.238],
    [0.1, 0.215],
    [0.13, 0.205],
  ];
  {
    const g = prism(casquePts, 0.014, 0.0015);
    scaleUV(g, 1 / P, 1 / P);
    headG.add(new THREE.Mesh(g, skinLime));
    const inner: [number, number][] = [
      [0.14, 0.228],
      [0.122, 0.248],
      [0.108, 0.268],
      [0.103, 0.262],
      [0.105, 0.24],
      [0.118, 0.226],
    ];
    headG.add(new THREE.Mesh(prism(inner, 0.0185, 0.0006), turq));
    // orange rim along the top edge
    for (let i = 1; i < 5; i++) {
      const a = casquePts[i - 1];
      const b = casquePts[i];
      limb(headG, V(0, a[1] + 0.001, a[0]), V(0, b[1] + 0.001, b[0]), 0.0042, 0.0042, orange, {
        sides: 4,
        open: true,
      });
    }
    spike(headG, V(0, 0.2865, 0.097), V(0, 0.4, -1), 0.0036, 0.011, yellow, 4);
  }

  // eyes
  [1, -1].forEach((s) => {
    const c = V(s * 0.031, 0.206, 0.138);
    const R = 0.02;
    ball(headG, c, R, skinLime, { w: 8, h: 6 });
    const d = V(s * 0.84, 0.14, 0.52).normalize();
    const cap = (mult: number, ang: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(R * mult, 10, 3, 0, Math.PI * 2, 0, ang), mat);
      m.position.copy(c);
      m.quaternion.setFromUnitVectors(Y, d);
      headG.add(m);
    };
    cap(1.07, 1.05, lidMat);
    cap(1.1, 0.62, ringMat);
    cap(1.13, 0.34, blackMat);
    const gd = d.clone().add(V(-s * 0.05, 0.28, 0.12)).normalize();
    ball(headG, c.clone().addScaledVector(gd, R * 1.15), 0.0027, whiteMat, { w: 5, h: 4 });
  });

  // brow ridges, mouth lines, temples, nostrils
  [1, -1].forEach((s) => {
    const rz: [number, number][] = [
      [0.124, 58],
      [0.15, 48],
      [0.172, 38],
    ];
    const rp = rz.map(([z, a]) => onChain(headSt, KH, z, a, s, 1.0).p);
    for (let i = 0; i < rp.length - 1; i++) limb(headG, rp[i], rp[i + 1], 0.0036, 0.0034, ridgeMat, { sides: 4, open: true });

    const mz = [0.118, 0.14, 0.16, 0.178];
    const mp = mz.map((z) => onChain(headSt, KH, z, -20, s, 1.0).p);
    mp.push(V(s * 0.006, 0.1745, 0.1892));
    mp.push(V(0, 0.1745, 0.1925));
    for (let i = 0; i < mp.length - 1; i++) limb(headG, mp[i], mp[i + 1], 0.0016, 0.0016, mouthMat, { sides: 4, open: true });
    const lp2 = mz.map((z) => onChain(headSt, KH, z, -5, s, 1.0).p);
    for (let i = 0; i < lp2.length - 1; i++) limb(headG, lp2[i], lp2[i + 1], 0.0024, 0.0024, cream, { sides: 4, open: true });

    ([[0.112, 12, orange], [0.114, 38, turq], [0.109, 62, orange]] as [number, number, THREE.Material][]).forEach(
      ([z, a, m]) => {
        const { p, n } = onChain(headSt, KH, z, a, s, 1.0);
        disc(headG, p.addScaledVector(n, 0.0006), n, 0.0048, 0.003, m, 6);
      }
    );

    const nz = onChain(headSt, KH, 0.1715, 60, s, 1.0);
    ball(headG, nz.p, 0.0045, skinLime, { w: 6, h: 4 });
    ball(headG, nz.p.clone().addScaledVector(nz.n, 0.0033), 0.0018, blackMat, { w: 5, h: 4 });
  });

  // throat beard
  for (let z = 0.114; z <= 0.168; z += 0.0108) {
    const { cy, ry } = sample(headSt, z);
    spike(headG, V(0, cy - ry * 0.97, z), V(0, -Math.cos(0.45), -Math.sin(0.45)), 0.0032, 0.008, cream, 4);
  }

  /* ================================================================ */
  /* final placement: stand on the floor, centred                     */
  /* ================================================================ */
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model, true);
  model.position.y = -box.min.y - 0.0015;
  model.position.z = -(box.min.z + box.max.z) / 2;

  return root;
}
```