import * as THREE from "three";

export const meta = {
  name: "Fennec Fox Kit on a Dusk Dune",
  description:
    "A fennec kit with enormous peach-lined ears, standing alert on a little sand dune at dusk, wearing a woven leather collar with a brass bell.",
};

type V3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);
const CREAM = new THREE.Color(0xf6e6cc);
const GOLD = new THREE.Color(0xd99b56);
const INK = new THREE.Color(0x1c1411);
const DUNE_LIT = new THREE.Color(0xcf9b6c);
const DUNE_TOP = new THREE.Color(0xdcae7e);
const DUNE_SHADE = new THREE.Color(0x5f4d6a);

const DUNE_R = 0.6; // dune half-width (x)
const DUNE_Z = 0.5; // dune half-depth (z)
const CREST = 0.16; // height of the flat crest the fox stands on
const HEAD_C: V3 = [0, 0.31, 0.18];
const HEAD_R: V3 = [0.058, 0.055, 0.07];

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: THREE.Color, b: THREE.Color, t: number) =>
  a.clone().lerp(b, Math.min(1, Math.max(0, t)));
const vec = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
const toV3 = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
const alignY = (d: THREE.Vector3) =>
  new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());

// Ellipsoid built from a unit sphere, in fox/world space.
function blob(c: V3, r: V3, seg = 20, rings = 14) {
  const g = new THREE.SphereGeometry(1, seg, rings);
  g.scale(r[0], r[1], r[2]);
  g.translate(c[0], c[1], c[2]);
  return g;
}

// Tapered cylinder from a to b (ra at a, rb at b).
function limb(a: V3, b: V3, ra: number, rb: number, seg = 12) {
  const A = vec(a);
  const B = vec(b);
  const d = B.clone().sub(A);
  const g = new THREE.CylinderGeometry(rb, ra, d.length(), seg, 1);
  g.applyQuaternion(alignY(d));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  return g;
}

// Writes per-vertex colours from a function of position and normal.
function paint(
  g: THREE.BufferGeometry,
  fn: (p: THREE.Vector3, n: THREE.Vector3, i: number) => THREE.Color
) {
  if (!g.attributes.normal) g.computeVertexNormals();
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const arr = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    const c = fn(p, n, i);
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}

// Dune height. Flat crest (f = 1) under the fox, falling to exactly 0 at the rim.
function duneField(x: number, z: number) {
  const u = x / DUNE_R;
  const v = z / DUNE_Z;
  const rho = Math.hypot(u, v);
  const lee = ss(-0.15, 0.15, u); // 1 on the steep lee side (+x)
  const fWind = 1 - ss(0.5, 1.0, rho);
  const fLee = 1 - ss(0.5, 0.92, rho);
  const f = fWind * (1 - lee) + fLee * lee;
  const ripple =
    0.0028 *
    Math.sin(x * 75 + 0.8 * Math.sin(z * 6)) *
    (1 - f) *
    (1 - ss(0.92, 1.0, rho));
  return Math.max(0, CREST * f + ripple);
}

// Point on an ellipsoid surface along a direction, plus its outward normal.
function surfaceAt(c: V3, r: V3, dir: THREE.Vector3) {
  const d = dir.clone().normalize();
  const t = 1 / Math.hypot(d.x / r[0], d.y / r[1], d.z / r[2]);
  const p = new THREE.Vector3(c[0] + d.x * t, c[1] + d.y * t, c[2] + d.z * t);
  const n = new THREE.Vector3(
    (p.x - c[0]) / (r[0] * r[0]),
    (p.y - c[1]) / (r[1] * r[1]),
    (p.z - c[2]) / (r[2] * r[2])
  ).normalize();
  return { p, n };
}

// Rounded, tapering ear silhouette in the XY plane. s scales, b lifts the base.
function earShape(s: number, b: number) {
  const X = (x: number) => x * s;
  const Y = (y: number) => y * s + b;
  const sh = new THREE.Shape();
  sh.moveTo(X(-0.056), Y(0));
  sh.quadraticCurveTo(X(-0.078), Y(0.105), X(-0.014), Y(0.18));
  sh.quadraticCurveTo(X(0), Y(0.2), X(0.014), Y(0.18));
  sh.quadraticCurveTo(X(0.078), Y(0.105), X(0.056), Y(0));
  sh.quadraticCurveTo(X(0), Y(-0.016), X(-0.056), Y(0));
  return sh;
}

export default function buildFennec(): THREE.Object3D {
  const rand = makeRng(20417);

  const mat = {
    fur: new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
    earOut: new THREE.MeshStandardMaterial({
      color: 0xead2a8,
      roughness: 0.3,
      side: THREE.DoubleSide,
    }),
    earIn: new THREE.MeshStandardMaterial({
      color: 0xf6bf9e,
      roughness: 0.28,
      side: THREE.DoubleSide,
    }),
    ink: new THREE.MeshStandardMaterial({ color: 0x1c1411, roughness: 0.18 }),
    glint: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.5,
      roughness: 0.2,
    }),
    leather: new THREE.MeshStandardMaterial({
      color: 0x5a3822,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
    tan: new THREE.MeshStandardMaterial({ color: 0xc48c56, roughness: 0.55 }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xf0c15c,
      metalness: 0.75,
      roughness: 0.3,
      side: THREE.DoubleSide,
    }),
    dune: new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    grit: new THREE.MeshStandardMaterial({ color: 0x9c7456, roughness: 0.95 }),
  };

  // Everything below is built in fox space: ground at y = 0, facing +Z.
  const fox = new THREE.Group();
  const put = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    parent: THREE.Object3D = fox
  ) => {
    const mesh = new THREE.Mesh(g, m);
    parent.add(mesh);
    return mesh;
  };
  const furGrad = (n: THREE.Vector3, lo = -0.2, hi = 0.7) =>
    mix(CREAM, GOLD, ss(lo, hi, n.y));

  // ---- body: torso, chest bib, shoulders, haunches, neck ----
  put(
    paint(blob([0, 0.19, -0.02], [0.075, 0.068, 0.12], 26, 16), (_p, n) =>
      furGrad(n, -0.35, 0.6)
    ),
    mat.fur
  );
  put(
    paint(blob([0, 0.178, 0.1], [0.05, 0.05, 0.05], 18, 12), () => CREAM),
    mat.fur
  );
  for (const s of [1, -1]) {
    put(
      paint(blob([s * 0.05, 0.19, 0.06], [0.034, 0.05, 0.05], 16, 12), (_p, n) =>
        furGrad(n)
      ),
      mat.fur
    );
    put(
      paint(blob([s * 0.06, 0.17, -0.1], [0.04, 0.05, 0.06], 18, 14), (_p, n) =>
        furGrad(n)
      ),
      mat.fur
    );
  }
  put(
    paint(limb([0, 0.2, 0.07], [0, 0.3, 0.155], 0.05, 0.042, 16), (_p, n) =>
      furGrad(n, -0.3, 0.6)
    ),
    mat.fur
  );

  // ---- head and face ----
  put(
    paint(blob(HEAD_C, HEAD_R, 28, 18), (_p, n) => furGrad(n, -0.1, 0.6)),
    mat.fur
  );
  for (const s of [1, -1]) {
    put(
      paint(blob([s * 0.046, 0.28, 0.165], [0.024, 0.03, 0.04], 16, 10), () => CREAM),
      mat.fur
    );
  }

  const snoutDir = new THREE.Vector3(0, -0.12, 1).normalize();
  const snoutG = new THREE.LatheGeometry(
    [[0, 0], [0.031, 0], [0.034, 0.03], [0.029, 0.07], [0.017, 0.095], [0, 0.108]].map(
      ([r, y]) => new THREE.Vector2(r, y)
    ),
    16
  );
  snoutG.applyQuaternion(alignY(snoutDir));
  snoutG.translate(0, 0.305, 0.19);
  put(paint(snoutG, (_p, n) => mix(CREAM, GOLD, ss(0.45, 0.95, n.y))), mat.fur);
  put(blob([0, 0.2935, 0.297], [0.013, 0.011, 0.013], 14, 10), mat.ink);

  // ---- big dark eyes with a tiny white sparkle ----
  for (const s of [1, -1]) {
    const { p, n } = surfaceAt(HEAD_C, HEAD_R, new THREE.Vector3(s * 0.5, 0.26, 0.82));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const c = p.clone().addScaledVector(n, 0.002);
    const eyeG = new THREE.SphereGeometry(0.02, 20, 14);
    eyeG.scale(1, 1, 0.6);
    eyeG.applyQuaternion(q);
    eyeG.translate(c.x, c.y, c.z);
    put(eyeG, mat.ink);
    const sp = c
      .clone()
      .addScaledVector(n, 0.0105)
      .add(new THREE.Vector3(-0.0055, 0.0075, 0));
    put(blob(toV3(sp), [0.0042, 0.0042, 0.0042], 10, 8), mat.glint);
  }

  // ---- enormous satin ears, lined in pale peach ----
  const earOutG = new THREE.ExtrudeGeometry(earShape(1, 0), {
    depth: 0.005,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0035,
    bevelSegments: 2,
    curveSegments: 16,
  });
  const earInG = new THREE.ExtrudeGeometry(earShape(0.8, 0.014), {
    depth: 0.003,
    bevelEnabled: false,
    curveSegments: 16,
  });
  const makeEar = (side: number) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.04, 0.33, 0.158);
    ear.rotation.y = side * 0.28; // turn faces outward
    const splay = new THREE.Group();
    splay.rotation.z = -side * 0.26; // tips spread out
    const lean = new THREE.Group();
    lean.rotation.x = -0.2; // tips lean back, alert
    ear.add(splay);
    splay.add(lean);
    lean.add(new THREE.Mesh(earOutG, mat.earOut));
    const lining = new THREE.Mesh(earInG, mat.earIn);
    lining.position.z = 0.0065;
    lean.add(lining);
    return ear;
  };
  fox.add(makeEar(1), makeEar(-1));

  // ---- legs with oversized paws ----
  const leg = (x: number, z: number) => {
    put(
      paint(limb([x, -0.003, z], [x, 0.165, z], 0.0125, 0.017, 12), (p) =>
        mix(CREAM, GOLD, ss(0.09, 0.16, p.y))
      ),
      mat.fur
    );
    const pz = z + 0.012;
    put(
      paint(blob([x, 0.012, pz], [0.026, 0.016, 0.034], 18, 12), () => CREAM),
      mat.fur
    );
    for (const tx of [-0.011, 0, 0.011]) {
      put(
        paint(blob([x + tx, 0.0085, pz + 0.03], [0.0095, 0.0085, 0.0095], 10, 8), () => CREAM),
        mat.fur
      );
      put(blob([x + tx, 0.001, pz + 0.041], [0.0032, 0.0022, 0.0055], 8, 6), mat.ink);
    }
  };
  for (const s of [1, -1]) {
    leg(s * 0.048, 0.08);
    leg(s * 0.052, -0.1);
  }

  // little heaps of sand kicked up around the paws
  for (const [x, z] of [
    [0.048, 0.092],
    [-0.048, 0.092],
    [0.052, -0.088],
    [-0.052, -0.088],
  ]) {
    put(paint(blob([x, 0, z], [0.042, 0.007, 0.05], 16, 6), () => DUNE_LIT), mat.dune);
  }

  // ---- fluffy tail with a black smudge at the tip ----
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.2, -0.12),
    new THREE.Vector3(0, 0.215, -0.19),
    new THREE.Vector3(0.05, 0.215, -0.265),
    new THREE.Vector3(0.11, 0.185, -0.32),
    new THREE.Vector3(0.13, 0.13, -0.355),
  ]);
  const TS = 32;
  const RS = 14;
  const tailG = new THREE.TubeGeometry(tailCurve, TS, 1, RS, false);
  const tp = tailG.attributes.position as THREE.BufferAttribute;
  const cen = new THREE.Vector3();
  const off = new THREE.Vector3();
  for (let j = 0; j <= TS; j++) {
    const t = j / TS;
    tailCurve.getPointAt(t, cen);
    const rad = 0.02 + 0.03 * Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - 0.3 * t);
    for (let i = 0; i <= RS; i++) {
      const idx = j * (RS + 1) + i;
      const a = (i / RS) * Math.PI * 2;
      off.fromBufferAttribute(tp, idx).sub(cen).normalize();
      const fluff = 1 + 0.09 * Math.sin(a * 5 + j * 0.9) + 0.06 * Math.sin(a * 3 - j * 1.7);
      off.multiplyScalar(rad * fluff);
      tp.setXYZ(idx, cen.x + off.x, cen.y + off.y, cen.z + off.z);
    }
  }
  tailG.computeVertexNormals();
  paint(tailG, (_p, n, idx) => {
    const j = Math.floor(idx / (RS + 1));
    const i = idx % (RS + 1);
    const t = j / TS;
    const base = mix(CREAM, GOLD, ss(-0.2, 0.7, n.y));
    const edge = 0.86 + 0.02 * Math.sin(i * 2.3 + j * 0.4);
    return mix(base, INK, ss(edge, edge + 0.05, t));
  });
  put(tailG, mat.fur);
  const tipPt = tailCurve.getPointAt(1);
  put(paint(blob(toV3(tipPt), [0.02, 0.02, 0.02], 14, 10), () => INK), mat.fur);

  // ---- woven leather collar with a brass bell ----
  const N0 = vec([0, 0.2, 0.07]);
  const N1 = vec([0, 0.3, 0.155]);
  const axis = N1.clone().sub(N0).normalize();
  const cc = N0.clone().lerp(N1, 0.55);
  const CR = 0.0475;

  const band = new THREE.CylinderGeometry(CR, CR, 0.024, 28, 1, true);
  band.applyQuaternion(alignY(axis));
  band.translate(cc.x, cc.y, cc.z);
  put(band, mat.leather);

  // checkerboard of tan straps over the dark band reads as a woven braid
  const ref = Math.abs(axis.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const U = ref.clone().addScaledVector(axis, -ref.dot(axis)).normalize();
  const W = new THREE.Vector3().crossVectors(axis, U);
  const K = 24;
  const boxW = ((2 * Math.PI * CR) / K) * 0.9;
  for (let row = 0; row < 2; row++) {
    const yOff = row === 0 ? -0.0058 : 0.0058;
    for (let k = 0; k < K; k++) {
      if ((k + row) % 2 !== 0) continue;
      const th = (k / K) * Math.PI * 2;
      const nrm = U.clone().multiplyScalar(Math.cos(th)).addScaledVector(W, Math.sin(th));
      const tan = U.clone().multiplyScalar(-Math.sin(th)).addScaledVector(W, Math.cos(th));
      const box = new THREE.BoxGeometry(boxW, 0.01, 0.0035);
      const m4 = new THREE.Matrix4().makeBasis(tan, axis, nrm);
      m4.setPosition(
        cc.clone().addScaledVector(nrm, CR + 0.0012).addScaledVector(axis, yOff)
      );
      box.applyMatrix4(m4);
      put(box, mat.tan);
    }
  }

  // stitched trim along both edges
  for (const s of [1, -1]) {
    const trim = new THREE.TorusGeometry(CR + 0.0008, 0.0026, 6, 32);
    trim.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis)
    );
    trim.translate(
      ...toV3(cc.clone().addScaledVector(axis, 0.0118 * s))
    );
    put(trim, mat.leather);
  }

  // small D-ring under the throat, and the bell hanging from it
  const down = new THREE.Vector3(0, -1, 0);
  const under = down.clone().addScaledVector(axis, -down.dot(axis)).normalize();
  const tangent = new THREE.Vector3().crossVectors(axis, under).normalize();
  const loopC = cc.clone().addScaledVector(under, CR + 0.0045);
  const loop = new THREE.TorusGeometry(0.0042, 0.0013, 6, 14);
  loop.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent)
  );
  loop.translate(...toV3(loopC));
  put(loop, mat.brass);

  const B = loopC.clone().add(new THREE.Vector3(0, -0.0235, 0));
  const bellG = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.016, -0.0131),
      new THREE.Vector2(0.0147, -0.0088),
      new THREE.Vector2(0.0131, 0.0),
      new THREE.Vector2(0.0094, 0.0156),
      new THREE.Vector2(0.0044, 0.02),
      new THREE.Vector2(0.0, 0.0205),
    ],
    18
  );
  bellG.translate(B.x, B.y, B.z);
  put(bellG, mat.brass);
  put(
    blob(toV3(B.clone().add(new THREE.Vector3(0, -0.0095, 0))), [0.0034, 0.0034, 0.0034], 10, 8),
    mat.ink
  );

  // ---- place the fox on the crest, turned a little toward the viewer ----
  fox.position.set(0, CREST, 0);
  fox.rotation.y = 0.28;

  // ---- the dune ----
  const dune = new THREE.RingGeometry(0, 1, 96, 28);
  dune.rotateX(-Math.PI / 2);
  const dp = dune.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < dp.count; i++) {
    const x = dp.getX(i) * DUNE_R;
    const z = dp.getZ(i) * DUNE_Z;
    dp.setXYZ(i, x, duneField(x, z), z);
  }
  dune.computeVertexNormals();
  const LIGHT = new THREE.Vector3(-0.55, 0.6, 0.58).normalize();
  paint(dune, (p, n) => {
    const lit = ss(0.15, 0.85, Math.max(0, n.dot(LIGHT)));
    const c = mix(DUNE_SHADE, DUNE_LIT, lit);
    c.lerp(DUNE_TOP, 0.25 * ss(0.05, 0.15, p.y));
    c.multiplyScalar(0.95 + 0.1 * rand());
    return c;
  });

  const root = new THREE.Group();
  root.add(new THREE.Mesh(dune, mat.dune));

  // scattered grit on the sand, kept clear of the fox's feet
  for (let k = 0; k < 22; k++) {
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * 0.9;
    const x = Math.cos(a) * rr * DUNE_R;
    const z = Math.sin(a) * rr * DUNE_Z;
    if (Math.abs(x) < 0.16 && Math.abs(z) < 0.22) continue;
    const r = 0.0045 + rand() * 0.006;
    const y = duneField(x, z);
    root.add(
      new THREE.Mesh(blob([x, y + r * 0.2, z], [r, r * 0.65, r * 0.85], 8, 6), mat.grit)
    );
  }

  root.add(fox);
  return root;
}
