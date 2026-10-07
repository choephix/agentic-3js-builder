import * as THREE from "three";
import { catmull, cells, createBuilder, DEG, frame, mix, paint, rgb, rng, smoothstep, spots } from "../../../../src/index";
import type { Paint, Rgb } from "../../../../src/index";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully inflated pufferfish ball: creamy yellow skin with brown leopard rosettes fading to a white belly, " +
    "spikes all over, a tiny pouting two-part mouth, big worried eyes with slanted lids and brows, fluttering " +
    "pectoral fins, a stubby fan tail and a stream of bubbles rising from its lips. Rigged with spine, jaw, " +
    "eye, fin and tail joints.",
};

type V = THREE.Vector3;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const BACK = "#e9bf5a";
const FLANK = "#f4dc98";
const BELLY = "#fffaf0";
const SPOT = "#8a5526";
const SPOT_DARK = "#5f3516";
const BLUSH = "#f2a287";
const FIN_BASE = "#f6e6ae";
const FIN_RAY = "#d2a04a";
const FIN_RIM = "#b97b34";
const FIN_DOT = "#9a6430";
const LIP = "#ee9f84";
const MOUTH_IN = "#3c1613";
const BROW = "#6b3f1c";
const GILL = "#a6753a";
const NOSTRIL = "#7a4a2a";
const BUBBLE = "#d9f3fa";
const BUBBLE_RIM = "#8fd2e6";
const WHITE = "#ffffff";

const SCLERA = rgb("#fffdf4");
const IRIS_IN = rgb("#ffd24f");
const IRIS_OUT = rgb("#ea8f2b");
const LIMBAL = rgb("#7b3b12");
const PUPIL_C = rgb("#130c0a");
const SHINE = rgb("#ffffff");

/** Flat colours the spikes snap to, so each spike matches the skin under its base. */
const SPIKE_PALETTE = [
  "#e6bb55", "#edc96c", "#f2d78c", "#f6e3ae", "#faedcc", "#fffaf0",
  "#d7a959", "#b98547", "#8a5526", "#5f3516",
].map((h) => [h, rgb(h)] as const);

function snap(c: Rgb) {
  let best = SPIKE_PALETTE[0];
  let bd = Infinity;
  for (const e of SPIKE_PALETTE) {
    const d = (e[1][0] - c[0]) ** 2 + (e[1][1] - c[1]) ** 2 + (e[1][2] - c[2]) ** 2;
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best[0];
}

// ---------------------------------------------------------------- body shape
const RX = 0.146;
const RY = 0.15;
const RZ = 0.15;
const STRETCH = 1.12; // the rear of the ball runs a little longer
const TAPER = 0.2; // and narrows toward the tail
const SAG = 0.07; // the belly hangs a little lower

/** A unit-sphere direction -> the point on the puffed body (relative to its centre). */
function inflate(u: V): V {
  const rear = Math.max(0, -u.z);
  const taper = 1 - TAPER * rear * rear;
  const sag = u.y < 0 ? 1 + SAG * -u.y : 1;
  return v3(u.x * RX * taper, u.y * RY * taper * sag, u.z * RZ * (u.z < 0 ? STRETCH : 1));
}

function rho(x: number, y: number, z: number) {
  const zz = z / (z < 0 ? RZ * STRETCH : RZ);
  const rear = Math.min(1, Math.max(0, -zz));
  const taper = 1 - TAPER * rear * rear;
  const ry = y < 0 ? RY * (1 + SAG * Math.min(1, -y / RY)) : RY;
  return Math.hypot(x / (RX * taper), y / (ry * taper), zz);
}

/** Smooth outward normal of the body at a point (relative to its centre). */
function normalAt(q: V): V {
  const e = 1e-4;
  return v3(
    rho(q.x + e, q.y, q.z) - rho(q.x - e, q.y, q.z),
    rho(q.x, q.y + e, q.z) - rho(q.x, q.y - e, q.z),
    rho(q.x, q.y, q.z + e) - rho(q.x, q.y, q.z - e),
  ).normalize();
}

const dirOf = (azDeg: number, elDeg: number) => {
  const az = azDeg * DEG;
  const el = elDeg * DEG;
  return v3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
};

function weldNormals(g: THREE.BufferGeometry) {
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const nor = g.getAttribute("normal") as THREE.BufferAttribute;
  const keyOf = (i: number) =>
    `${Math.round(pos.getX(i) * 1e4)}_${Math.round(pos.getY(i) * 1e4)}_${Math.round(pos.getZ(i) * 1e4)}`;
  const sums = new Map<string, V>();
  for (let i = 0; i < pos.count; i++) {
    const k = keyOf(i);
    const s = sums.get(k) ?? new THREE.Vector3();
    s.add(new THREE.Vector3().fromBufferAttribute(nor, i));
    sums.set(k, s);
  }
  for (let i = 0; i < pos.count; i++) {
    const s = sums.get(keyOf(i))!.clone().normalize();
    nor.setXYZ(i, s.x, s.y, s.z);
  }
}

function bodyGeometry() {
  const g = new THREE.SphereGeometry(1, 16, 12);
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const u = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    u.fromBufferAttribute(pos, i);
    const q = inflate(u);
    pos.setXYZ(i, q.x, q.y, q.z);
  }
  g.computeVertexNormals();
  weldNormals(g);
  return g;
}

// ---------------------------------------------------------------- paints
/** Cream back, white belly, brown leopard rosettes that thin out down the flanks, rosy cheeks. */
function makeSkin(cy: number): Paint {
  const C = v3(0, cy, 0);
  const base = paint((p) => {
    const u = (p.y - cy) / 0.15;
    const top = smoothstep(0.05, 0.9, u);
    const belly = smoothstep(-0.05, -0.62, u);
    return mix(mix(FLANK, BACK, top * 0.85), BELLY, belly);
  });
  const leopard = spots(base, [SPOT, SPOT_DARK], { size: 0.058, amount: 0.62, rosette: true, seed: 7 });
  const cheeks = [56, -56].map((az) => inflate(dirOf(az, -15)).add(C));
  return paint((p, n) => {
    const u = (p.y - cy) / 0.15;
    const plain = base.at(p, n);
    const amt = smoothstep(-0.4, 0.2, u);
    let c: Rgb = amt > 0.002 ? mix(plain, leopard.at(p, n), amt) : plain;
    const d = Math.min(p.distanceTo(cheeks[0]), p.distanceTo(cheeks[1]));
    const bl = smoothstep(0.05, 0.012, d) * 0.4;
    if (bl > 0.002) c = mix(c, BLUSH, bl);
    return c;
  });
}

/** An eyeball painted from the gaze axis: white, gold iris, dark limbal ring, tiny startled pupil, two glints. */
function eyePaint(centre: V, gaze: V) {
  const hl1 = gaze.clone().add(v3(-0.3, 0.24, 0)).normalize();
  const hl2 = gaze.clone().add(v3(0.15, -0.16, 0)).normalize();
  const d = new THREE.Vector3();
  const IRIS = 36;
  const PUPIL = 12;
  const ang = (a: V, b: V) => Math.acos(Math.min(1, Math.max(-1, a.dot(b)))) / DEG;
  return paint((p) => {
    d.copy(p).sub(centre).normalize();
    const a = ang(d, gaze);
    const t = a / IRIS;
    let c: Rgb = SCLERA;
    if (t < 1.12) {
      let iris = mix(IRIS_IN, IRIS_OUT, smoothstep(0.3, 0.95, t));
      iris = mix(iris, LIMBAL, smoothstep(0.78, 1.0, t));
      c = mix(c, iris, smoothstep(1.06, 0.96, t));
    }
    c = mix(c, PUPIL_C, smoothstep(PUPIL + 1.5, PUPIL - 1.5, a));
    const shine = Math.max(smoothstep(7.5, 5, ang(d, hl1)), smoothstep(4, 2.2, ang(d, hl2)));
    return shine > 0.002 ? mix(c, SHINE, shine) : c;
  });
}

/** A fan fin: pale web, golden rays radiating from the apex, a darker rim, optional speckles. */
function finPaint(apex: V, T: V, B: V, R: number, alphaDeg: number, o: { rays: number; dots?: boolean; seed?: number }) {
  const step = (2 * alphaDeg) / o.rays;
  return paint((p) => {
    const dx = p.x - apex.x;
    const dy = p.y - apex.y;
    const dz = p.z - apex.z;
    const s = dx * T.x + dy * T.y + dz * T.z;
    const w = dx * B.x + dy * B.y + dz * B.z;
    const ang = Math.atan2(w, Math.max(s, 1e-4)) / DEG;
    const r = Math.hypot(s, w) / R;
    let c: Rgb = mix(FLANK, FIN_BASE, smoothstep(0.05, 0.4, r));
    const k = (ang + alphaDeg) / step;
    const line = smoothstep(0.22, 0.08, Math.abs(k - Math.round(k))) * smoothstep(0.1, 0.32, r);
    c = mix(c, FIN_RAY, line * 0.8);
    if (o.dots) {
      const cc = cells(p, 0.024, o.seed ?? 3);
      const dot = cc.id > 0.4 ? smoothstep(0.34, 0.24, cc.d1) : 0;
      c = mix(c, FIN_DOT, dot * smoothstep(0.3, 0.5, r) * (1 - smoothstep(0.78, 0.9, r)) * 0.85);
    }
    return mix(c, FIN_RIM, smoothstep(0.82, 0.95, r) * 0.9);
  });
}

/** Half-width of a fan (circular sector) along a straight chain: the apex sits `apex` metres from its start. */
function fanWidth(length: number, apex: number, alphaDeg: number) {
  const a = alphaDeg * DEG;
  const R = length - apex;
  return (t: number) => {
    const s = t * length - apex;
    if (s <= 0) return 0.005;
    const w = s <= R * Math.cos(a) ? s * Math.tan(a) : Math.sqrt(Math.max(0, R * R - s * s));
    return t < 0.5 ? Math.max(w, 0.005) : w;
  };
}

const ribbonRadius = (w: (t: number) => number, thick: number) => (t: number): [number, number] => [w(t), thick];

// ---------------------------------------------------------------- the model
function assemble(cy: number) {
  const b = createBuilder({ name: "pufferfish" });
  const C = v3(0, cy, 0);
  const skin = makeSkin(cy);
  /** A point on the ideal puffed surface at azimuth (0 = front, 90 = left) and elevation, with its smooth normal. */
  const surf = (az: number, el: number) => {
    const q = inflate(dirOf(az, el));
    return { at: q.clone().add(C), n: normalAt(q) };
  };
  const zones: Array<{ at: V; r: number }> = [];

  // ---- skeleton
  b.joint("root", { at: [0, cy, 0], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [
      [0, cy, -0.06],
      [0, cy, 0.02],
      [0, cy, 0.1],
    ],
    { parent: "root", role: "spine" },
  );
  b.joint("head", { parent: spine, at: [0, cy, 0.1], dir: [0, 0, 1], role: "head" });

  // ---- the inflated ball
  const body = b.part(bodyGeometry(), skin, { at: C, bone: "root", name: "body" });

  // ---- eyes, lids, brows, gill slits
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const e = surf(side * 38, 14);
    const centre = e.at.clone().addScaledVector(e.n, -0.012);
    const gaze = v3(side * 0.42, 0.27, 0.86).normalize();
    zones.push({ at: e.at, r: 0.064 });

    b.joint("eye" + tag, { parent: "head", at: centre, dir: gaze, up: [0, 1, 0] });
    b.part(new THREE.SphereGeometry(0.036, 18, 12), eyePaint(centre, gaze), {
      at: centre,
      bone: "eye" + tag,
      name: "eyeball" + tag,
    });
    b.part(new THREE.TorusGeometry(0.0345, 0.0065, 6, 16), skin, {
      at: e.at.clone().addScaledVector(e.n, 0.0015),
      dir: e.n,
      axis: "z",
      bone: "head",
      name: "eyeRim" + tag,
    });
    // upper lid: a skin cap tipped outward, so its edge slopes down toward the outer corner
    const lidAxis = v3(side * 0.62, 0.78, -0.12).normalize();
    b.part(new THREE.SphereGeometry(0.0389, 14, 4, 0, Math.PI * 2, 0, 40 * DEG), skin, {
      at: centre,
      quat: new THREE.Quaternion().setFromUnitVectors(v3(0, 1, 0), lidAxis),
      bone: "head",
      name: "eyelid" + tag,
    });
    // worried brow: inner end raised, outer end low
    const browPts = [
      [29, 44],
      [41, 36],
      [55, 29],
    ].map(([az, el]) => {
      const s = surf(side * az, el);
      zones.push({ at: s.at.clone(), r: 0.03 });
      return s.at.addScaledVector(s.n, 0.0022);
    });
    b.sweep(catmull(browPts), (t: number) => 0.0024 + 0.0024 * Math.sin(Math.PI * t), {
      color: BROW,
      bone: "head",
      sides: 6,
      caps: "round",
      name: "brow" + tag,
    });
    // gill slit
    const gillPts = [
      [86, 10],
      [89, -2],
      [86, -14],
    ].map(([az, el]) => {
      const s = surf(side * az, el);
      return s.at.addScaledVector(s.n, 0.0015);
    });
    zones.push({ at: surf(side * 88, -2).at, r: 0.03 });
    b.sweep(catmull(gillPts), 0.0022, { color: GILL, bone: "head", sides: 5, caps: "round", name: "gill" + tag });
    // nostril
    const nose = surf(side * 9, 7);
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), NOSTRIL, {
      at: nose.at.addScaledVector(nose.n, 0.0005),
      bone: "head",
      name: "nostril" + tag,
    });
  }

  // ---- the tiny pouting mouth: separate upper and lower lips on head and jaw
  const mouth = surf(0, -11);
  const nM = mouth.n.clone();
  const lipC = mouth.at.clone().addScaledVector(nM, 0.0045);
  zones.push({ at: mouth.at, r: 0.056 });
  b.joint("jaw", { parent: "head", at: lipC.clone().addScaledVector(nM, -0.007), dir: nM, up: [0, 1, 0], role: "jaw" });
  const upperLip = b.part(new THREE.TorusGeometry(0.015, 0.0065, 6, 8, Math.PI), LIP, {
    at: lipC,
    dir: nM,
    axis: "z",
    bone: "head",
    name: "upperLip",
  });
  const lowerGeo = new THREE.TorusGeometry(0.015, 0.0065, 6, 8, Math.PI);
  lowerGeo.rotateZ(Math.PI);
  b.part(lowerGeo, LIP, { at: lipC, dir: nM, axis: "z", bone: "jaw", name: "lowerLip" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0066, 6, 5), LIP, { at: upperLip.local([s * 0.015, 0, 0]), bone: "head", name: "mouthCorner" });
  b.part(new THREE.CircleGeometry(0.0105, 14), MOUTH_IN, {
    at: upperLip.local([0, 0, -0.0016]),
    dir: nM,
    axis: "z",
    bone: "head",
    name: "mouthInside",
  });
  b.part(new THREE.BoxGeometry(0.0085, 0.0032, 0.0026), BELLY, {
    at: upperLip.local([0, 0.0019, -0.0004]),
    dir: nM,
    axis: "z",
    bone: "head",
    name: "toothUpper",
  });
  b.part(new THREE.BoxGeometry(0.0085, 0.0032, 0.0026), BELLY, {
    at: upperLip.local([0, -0.0019, -0.0004]),
    dir: nM,
    axis: "z",
    bone: "jaw",
    name: "toothLower",
  });

  // ---- tail: a short stalk and a stubby fan, three joints
  const tailA = v3(0, cy, -0.125);
  const tailB = v3(0, cy, -0.28);
  const tail = b.chain("tail", [tailA, tailB], { parent: "root", role: "tail", up: [1, 0, 0], count: 3 });
  const Lt = tail.length;
  const tailApex = 0.05;
  zones.push({ at: v3(0, cy, -0.168), r: 0.062 });
  b.sweep(
    tail,
    (t: number): [number, number] => [0.042 - 0.02 * t, Math.max(0.008, 0.04 - 0.052 * t)],
    { color: skin, to: 0.6, sides: 10, name: "peduncle" },
  );
  b.sweep(tail, ribbonRadius(fanWidth(Lt, tailApex, 33), 0.003), {
    color: finPaint(tailA.clone().add(v3(0, 0, -tailApex)), v3(0, 0, -1), v3(0, 1, 0), Lt - tailApex, 33, {
      rays: 11,
      dots: true,
      seed: 5,
    }),
    from: 0.28,
    sides: 16,
    name: "caudalFin",
  });

  // ---- pectoral fins: flat fans on a three-joint chain, cupped outward
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const s = surf(side * 96, -6);
    zones.push({ at: s.at.clone(), r: 0.048 });
    const r0 = s.at.clone().addScaledVector(s.n, -0.012);
    const T = v3(side * 0.55, 0.02, -0.835).normalize();
    const N = new THREE.Vector3().crossVectors(v3(0, 1, 0), T).applyAxisAngle(T, side * 0.21);
    const B = new THREE.Vector3().crossVectors(T, N).normalize();
    const L = 0.052;
    const apex = -0.012;
    const chain = b.chain("fin" + tag, [r0, r0.clone().addScaledVector(T, L)], {
      parent: "root",
      role: "wing",
      up: N,
      count: 3,
    });
    b.sweep(chain, ribbonRadius(fanWidth(L, apex, 35), 0.0028), {
      color: finPaint(r0.clone().addScaledVector(T, apex), T, B, L - apex, 35, { rays: 9 }),
      sides: 12,
      name: "pectoralFin" + tag,
    });
  }

  // ---- dorsal and anal fins
  const smallFin = (name: string, az: number, el: number, dir: V, L: number, alpha: number, rays: number) => {
    const s = surf(az, el);
    zones.push({ at: s.at.clone(), r: 0.042 });
    const r0 = s.at.clone().addScaledVector(s.n, -0.012);
    const T = dir.clone().normalize();
    const N = v3(1, 0, 0);
    const B = new THREE.Vector3().crossVectors(T, N).normalize();
    const apex = -0.01;
    b.joint(name, { parent: "root", at: r0, dir: T, up: N, role: "hinge" });
    b.sweep([r0, r0.clone().addScaledVector(T, L)], ribbonRadius(fanWidth(L, apex, alpha), 0.0026), {
      color: finPaint(r0.clone().addScaledVector(T, apex), T, B, L - apex, alpha, { rays }),
      bone: name,
      up: N,
      sides: 10,
      name,
    });
  };
  smallFin("dorsalFin", 180, 62, v3(0, 0.78, -0.62), 0.046, 34, 7);
  smallFin("analFin", 180, -58, v3(0, -0.8, -0.6), 0.04, 34, 6);

  // ---- bubbles rising from the lips
  const M = lipC.clone().addScaledVector(nM, 0.014);
  b.joint("bubbles", { parent: "head", at: M, dir: [0, 1, 0] });
  const hl = v3(-0.35, 0.55, 0.75).normalize();
  const bubble = (c: V, r: number) => {
    b.part(new THREE.SphereGeometry(r, 9, 7), BUBBLE, { at: c, bone: "bubbles", name: "bubble" });
    b.part(new THREE.TorusGeometry(r * 0.97, Math.max(r * 0.07, 0.0007), 4, 14), BUBBLE_RIM, {
      at: c,
      dir: [0, 0, 1],
      axis: "z",
      bone: "bubbles",
      name: "bubbleRim",
    });
    b.part(new THREE.SphereGeometry(r * 0.24, 6, 5), WHITE, {
      at: c.clone().addScaledVector(hl, r * 0.78),
      bone: "bubbles",
      name: "bubbleGlint",
    });
  };
  const stream = catmull(
    [
      [0, 0.012, 0.015],
      [0.012, 0.065, 0.05],
      [-0.014, 0.125, 0.075],
      [0.018, 0.19, 0.085],
      [-0.012, 0.255, 0.08],
    ].map(([x, y, z]) => M.clone().add(v3(x, y, z))),
  );
  b.along(stream, 6, (pt) => bubble(pt.at, 0.0065 + 0.0145 * pt.t));
  for (const [x, y, z, r] of [
    [-0.018, 0.045, 0.03, 0.0045],
    [0.02, 0.1, 0.065, 0.005],
    [-0.024, 0.17, 0.08, 0.0055],
  ])
    bubble(M.clone().add(v3(x, y, z)), r);

  // ---- spikes all over: a jittered golden-spiral spread, seated on the real triangles
  const hits = b.surface(body);
  const random = rng(11);
  const geos = [0.024, 0.029, 0.034].map((h, i) => new THREE.ConeGeometry(0.0088 + i * 0.0004, h, 5, 1, true));
  const COUNT = 270;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (2 * (i + 0.5)) / COUNT;
    const rr = Math.sqrt(1 - y * y);
    const th = golden * i;
    const d = v3(Math.cos(th) * rr, y, Math.sin(th) * rr)
      .add(v3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.07))
      .normalize();
    const ideal = inflate(d).add(C);
    if (zones.some((z) => ideal.distanceTo(z.at) < z.r)) continue;
    const hit = hits.ray(C.clone().addScaledVector(d, 0.6), d.clone().negate());
    if (!hit) continue;
    const at = hit.at;
    const n = normalAt(at.clone().sub(C));
    const colour = snap(skin.at(at, n));
    b.stick(geos[Math.floor(random() * 3)], colour, frame(at, n), {
      bone: "root",
      embed: 0.28,
      spin: random() * 72,
      flat: true,
      name: "spike",
    });
  }

  return b;
}

export default function build(): THREE.Object3D {
  // Build once to measure the lowest spike tip, then rebuild so the fish rests exactly on the floor.
  const probe = assemble(0.4);
  const low = new THREE.Box3().setFromObject(probe.ctx.root, true).min.y;
  const b = assemble(0.4 - low - 0.0008);
  return b.root;
}
