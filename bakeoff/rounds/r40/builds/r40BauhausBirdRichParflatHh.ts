import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Bauhaus Songbird",
  "description": "A small songbird perched on a short branch, built from circles, triangles and rectangles in red, yellow, blue, black and white, in the style of a Bauhaus poster."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  red: "#d62820",
  redDeep: "#a01a14",
  yellow: "#f5c211",
  yellowDeep: "#d99a0b",
  blue: "#1c3f9e",
  blueDeep: "#132c70",
  black: "#141414",
  white: "#f4efe4",
  cream: "#e6d9b8",
  branchDark: "#2a2420",
  grey: "#8d8a84",
};
const M = {
  perchTop: [0, 0.036, 0] as [number, number, number],
  branchAxis: [0, 0.02, 0] as [number, number, number],
  bodyCentre: [0, 0.115, 0] as [number, number, number],
  neckBase: [0, 0.15, 0.04] as [number, number, number],
  headCentre: [0, 0.178, 0.058] as [number, number, number],
  jawHinge: [0, 0.17, 0.07] as [number, number, number],
  beakBase: [0, 0.172, 0.088] as [number, number, number],
  chestFront: [0, 0.125, 0.07] as [number, number, number],
  shoulderL: [0.05, 0.13, 0] as [number, number, number],
  shoulderR: [-0.05, 0.13, 0] as [number, number, number],
  tailRoot: [0, 0.09, -0.07] as [number, number, number],
  hipL: [0.025, 0.075, 0.01] as [number, number, number],
  hipR: [-0.025, 0.075, 0.01] as [number, number, number],
  footL: [0.025, 0.04, 0.005] as [number, number, number],
  footR: [-0.025, 0.04, 0.005] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
type V3 = [number, number, number];
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, V3> };
type V = THREE.Vector3;

function buildTorso({ b, J, P, M }: Ctx) {
  // ---------------------------------------------------------------- body frame
  // Body-frame coordinates (x = left, y = along the body bone, z = up-and-back of the tilted body).
  const C = new THREE.Vector3(...M.bodyCentre);
  const D = new THREE.Vector3(0, 0.5, 0.85).normalize(); // body bone
  const E = new THREE.Vector3(1, 0, 0); // model left
  const R = new THREE.Vector3(-1, 0, 0); // model right (SDK local +X)
  const N = new THREE.Vector3().crossVectors(R, D).normalize(); // SDK local +Z of the body bone (up/back)
  const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(R, D, N));

  // Ellipsoid semi-axes: width, length along the bone, height
  const A = 0.047;
  const L = 0.078;
  const H = 0.042;
  const semi = (k: number) => new THREE.Vector3(A * k, L * k, H * k);
  const toWorld = (v: V) => C.clone().addScaledVector(E, v.x).addScaledVector(D, v.y).addScaledVector(N, v.z);

  // Layer scales: blue back sits lowest, black outline band above it, white belly highest.
  const K_BACK = 0.96;
  const K_BAND = 0.985;
  const K_BELLY = 1.0;
  const CUT = (96.5 * Math.PI) / 180; // belly edge (angle from the up pole)
  const CUT_BAND = (92 * Math.PI) / 180;

  const onEll = (s: V, k: number) => {
    const n = s.clone().normalize();
    const r = semi(k);
    return new THREE.Vector3(n.x * r.x, n.y * r.y, n.z * r.z);
  };
  const gradN = (p: V, k: number) => {
    const r = semi(k);
    return new THREE.Vector3(p.x / (r.x * r.x), p.y / (r.y * r.y), p.z / (r.z * r.z)).normalize();
  };
  // Line (q + s n) meets the ellipsoid: take the outer root.
  const project = (q: V, n: V, k: number) => {
    const r = semi(k).toArray();
    const qa = q.toArray();
    const na = n.toArray();
    let ca = 0;
    let cb = 0;
    let cc = -1;
    for (let i = 0; i < 3; i++) {
      const r2 = r[i] * r[i];
      ca += (na[i] * na[i]) / r2;
      cb += (2 * qa[i] * na[i]) / r2;
      cc += (qa[i] * qa[i]) / r2;
    }
    const disc = cb * cb - 4 * ca * cc;
    const s = disc < 0 ? -cb / (2 * ca) : (-cb + Math.sqrt(disc)) / (2 * ca);
    return q.clone().addScaledVector(n, s);
  };

  // ---------------------------------------------------------------- patches seated on the ellipsoid
  type Pt = [number, number];
  const patch = (outline: Pt[], s: V, ref: V, k: number, lift: number, color: string, name: string, subd?: number) => {
    const p0 = onEll(s, k);
    const n0 = gradN(p0, k);
    const ty = ref.clone().addScaledVector(n0, -ref.dot(n0)).normalize();
    const tx = new THREE.Vector3().crossVectors(ty, n0).normalize();
    const sd = subd ?? (outline.length < 8 ? 4 : 1);
    const per: Pt[] = [];
    outline.forEach((p, i) => {
      const q = outline[(i + 1) % outline.length];
      for (let j = 0; j < sd; j++) {
        const t = j / sd;
        per.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    });
    const m = per.length;
    const rings = [0.34, 0.67, 1];
    const place = (x: number, y: number) => {
      const q = p0.clone().addScaledVector(tx, x).addScaledVector(ty, y);
      const hit = project(q, n0, k);
      return toWorld(hit.addScaledVector(gradN(hit, k), lift));
    };
    const verts: V[] = [place(0, 0)];
    for (const f of rings) for (const pt of per) verts.push(place(pt[0] * f, pt[1] * f));
    const idx = (ring: number, i: number) => 1 + ring * m + (i % m);
    const tris: number[][] = [];
    for (let i = 0; i < m; i++) tris.push([0, idx(0, i), idx(0, i + 1)]);
    for (let ring = 0; ring < rings.length - 1; ring++)
      for (let i = 0; i < m; i++) {
        const a = idx(ring, i);
        const bb = idx(ring, i + 1);
        const c = idx(ring + 1, i);
        const d = idx(ring + 1, i + 1);
        tris.push([a, c, d], [a, d, bb]);
      }
    // Wind every triangle outward from the body centre.
    for (const t of tris) {
      const [v0, v1, v2] = [verts[t[0]], verts[t[1]], verts[t[2]]];
      const nrm = new THREE.Vector3().subVectors(v1, v0).cross(new THREE.Vector3().subVectors(v2, v0));
      const cen = v0.clone().add(v1).add(v2).divideScalar(3).sub(C);
      if (nrm.dot(cen) < 0) [t[1], t[2]] = [t[2], t[1]];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts.flatMap((v) => [v.x, v.y, v.z]), 3));
    geo.setIndex(tris.flat());
    geo.computeVertexNormals();
    return b.part(geo, color, { bone: J.body, at: [0, 0, 0], name });
  };

  const circle = (r: number, n = 24): Pt[] =>
    Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r] as Pt);
  const scaled = (o: Pt[], f: number): Pt[] => o.map(([x, y]) => [x * f, y * f] as Pt);
  const square = (h: number): Pt[] => [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ];
  const triangle: Pt[] = [
    [0, 0.024],
    [0.021, -0.014],
    [-0.021, -0.014],
  ];

  // A poster emblem: stacked layers, each a hard-edged colour, 1.2 mm apart.
  const emblem = (
    name: string,
    s: V,
    ref: V,
    k: number,
    layers: [Pt[], string][],
    base = 0.0015,
    step = 0.0012,
  ) => layers.forEach(([o, c], i) => patch(o, s, ref, k, base + step * i, c, `${name}${i}`));

  // ---------------------------------------------------------------- body: blue back, black band, white belly
  const sphere = (th0: number, hs: number) => {
    const g =
      th0 === 0
        ? new THREE.SphereGeometry(1, 18, 12)
        : new THREE.SphereGeometry(1, 18, hs, 0, Math.PI * 2, th0, Math.PI - th0);
    g.rotateX(Math.PI / 2); // pole -> body up (+Z local)
    return g;
  };
  const bodyPart = (g: THREE.BufferGeometry, color: string, k: number, name: string) =>
    b.part(g, color, { bone: J.body, at: C, quat, scale: [A * k, L * k, H * k], flat: true, name });
  bodyPart(sphere(0, 12), P.blue, K_BACK, "torsoBack");
  bodyPart(sphere(CUT_BAND, 6), P.black, K_BAND, "torsoBand");
  bodyPart(sphere(CUT, 6), P.white, K_BELLY, "torsoBelly");

  // ---------------------------------------------------------------- neck (short blue cylinder, hides the head join)
  const nb = new THREE.Vector3(...M.neckBase);
  b.rod(
    nb.clone().add(new THREE.Vector3(0, -0.002, -0.004)),
    nb.clone().add(new THREE.Vector3(0, 0.022, 0.016)),
    0.027,
    P.blue,
    { bone: J.neck, name: "torsoNeck" },
  );

  // ---------------------------------------------------------------- chest emblem: red disc on black outline disc
  const chestDir = new THREE.Vector3(0, 0.8, -0.6);
  const up = new THREE.Vector3(0, 0, 1);
  emblem("torsoChest", chestDir, up, K_BELLY, [
    [circle(0.0295), P.black],
    [circle(0.0268), P.red],
    [circle(0.0125), P.black],
    [circle(0.0104), P.yellow],
    [circle(0.0036, 16), P.black],
  ]);

  // ---------------------------------------------------------------- rump: yellow triangle on a black triangle
  const rumpDir = new THREE.Vector3(0, -0.59, 0.807);
  const toTail = new THREE.Vector3(0, -1, 0);
  emblem("torsoRump", rumpDir, toTail, K_BACK, [
    [scaled(triangle, 1.28), P.black],
    [triangle, P.yellow],
    [scaled(triangle, 0.38), P.red],
  ]);

  // ---------------------------------------------------------------- flank squares (yellowDeep on black), each side
  for (const side of [1, -1]) {
    const s = new THREE.Vector3(side * 0.8, 0.6, 0.25);
    emblem(`torsoFlank${side > 0 ? "L" : "R"}`, s, up, K_BACK, [
      [square(0.0083), P.black],
      [square(0.0065), P.yellowDeep],
    ]);
  }

  // ---------------------------------------------------------------- belly-edge buttons, three per side
  const edgeCols: [string, string][] = [
    [P.white, P.black],
    [P.black, P.white],
    [P.white, P.black],
  ];
  for (const side of [1, -1]) {
    [-0.1, 0.12, 0.32].forEach((sa, i) => {
      const su = -0.07;
      const sx = side * Math.sqrt(1 - sa * sa - su * su);
      emblem(
        `torsoButton${side > 0 ? "L" : "R"}${i}`,
        new THREE.Vector3(sx, sa, su),
        new THREE.Vector3(0, 1, 0),
        0.99,
        [
          [circle(0.0068, 16), edgeCols[i][1]],
          [circle(0.0052, 16), edgeCols[i][0]],
        ],
      );
    });
  }

  // ---------------------------------------------------------------- rings and stripes round the body
  const crossSection = (f: number, k: number, from: number, to: number, n: number) => {
    const rho = Math.sqrt(1 - f * f);
    const pts: V[] = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - (to - from >= 359 ? 0 : 1));
      const phi = ((from + (to - from) * t) * Math.PI) / 180;
      pts.push(toWorld(onEll(new THREE.Vector3(Math.sin(phi) * rho, f, Math.cos(phi) * rho), k)));
    }
    return pts;
  };

  // Black collar where neck meets body (full ring)
  b.sweep(catmull(crossSection(0.028 / L, 0.99, 0, 360, 18), { closed: true }), 0.0042, {
    color: P.black,
    bone: J.body,
    sides: 6,
    name: "torsoCollar",
  });

  // Saddle stripe across the shoulders: blueDeep with thin black pin-lines either side
  const f0 = -0.19;
  b.sweep(catmull(crossSection(f0, 0.962, -100, 100, 11)), 0.0045, {
    color: P.blueDeep,
    bone: J.body,
    sides: 6,
    name: "torsoSaddle",
  });
  for (const df of [-0.085, 0.085]) {
    b.sweep(catmull(crossSection(f0 + df, 0.966, -96, 96, 11)), 0.0014, {
      color: P.black,
      bone: J.body,
      sides: 5,
      name: "torsoSaddleLine",
    });
  }
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const C = new THREE.Vector3(...M.headCentre);
  const R = 0.032;
  const CAP_R = 0.0338;
  const head = J.head;
  const jaw = J.jaw;
  const BLACK = P.black;

  // Unit direction on the head sphere from azimuth (0 = front, 90 = side) and elevation, side s (+1 = left, +X).
  const dirAt = (s: number, az: number, el: number) => {
    const a = (az * Math.PI) / 180;
    const e = (el * Math.PI) / 180;
    return new THREE.Vector3(s * Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).normalize();
  };
  const surf = (d: THREE.Vector3, off: number) => C.clone().addScaledVector(d, R - 0.0005 + off);

  // A flat disc seated on the head surface, facing outward.
  const disc = (s: number, az: number, el: number, r: number, off: number, color: string, sides = 16, t = 0.0006) => {
    const d = dirAt(s, az, el);
    return b.part(new THREE.CylinderGeometry(r, r, t, sides), color, {
      bone: head,
      at: surf(d, off),
      dir: d,
      flat: true,
    });
  };

  // ---------- skull ----------
  b.part(new THREE.SphereGeometry(R, 14, 10), P.yellow, { bone: head, at: C, flat: true });

  // yellowDeep crown cap with a black rim ring
  b.part(new THREE.SphereGeometry(CAP_R, 14, 5, 0, Math.PI * 2, 0, 0.62), P.yellowDeep, {
    bone: head,
    at: C,
    flat: true,
  });
  b.part(new THREE.TorusGeometry(CAP_R * Math.sin(0.62) + 0.0003, 0.0008, 4, 20), BLACK, {
    bone: head,
    at: [C.x, C.y + CAP_R * Math.cos(0.62) - 0.0004, C.z],
    dir: [0, 1, 0],
    axis: "z",
  });

  // ---------- crest: three fanned triangular blades ----------
  const blade = (dz: number, tiltDeg: number, h: number, w: number, color: string, thick: number, outline: boolean) => {
    const a = (tiltDeg * Math.PI) / 180;
    const y = C.y + Math.sqrt(CAP_R * CAP_R - dz * dz) - 0.003;
    const at = [0, y, C.z + dz];
    const x = [0, -Math.sin(a), Math.cos(a)];
    const yy = [0, Math.cos(a), Math.sin(a)];
    if (outline) {
      b.extrude(
        [
          [-(w + 0.003) / 2, -0.001],
          [(w + 0.003) / 2, -0.001],
          [w * 0.15, h + 0.0022],
        ],
        { at, x, y: yy, thickness: 0.0012, color: BLACK, bone: head },
      );
    }
    b.extrude(
      [
        [-w / 2, 0],
        [w / 2, 0],
        [w * 0.15, h],
      ],
      { at, x, y: yy, thickness: thick, color, bone: head },
    );
  };
  blade(0.009, 24, 0.009, 0.011, P.red, 0.0028, true);
  blade(0.0, 0, 0.012, 0.012, P.blue, 0.0034, true);
  blade(-0.009, -24, 0.008, 0.011, BLACK, 0.0028, false);

  // ---------- beak: black outline plate, upper jaw on head, lower jaw on jaw joint ----------
  const bb = new THREE.Vector3(...M.beakBase);
  b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.0006, 14), BLACK, {
    bone: head,
    at: [0, bb.y - 0.0025, C.z + R - 0.0011],
    dir: [0, 0.0, 1],
    flat: true,
  });
  // upper jaw
  b.spike([0, 0.1745, 0.083], [0, 0.1698, 0.125], null, 0.0112, {
    color: P.red,
    bone: head,
    sides: 8,
    caps: { start: "flat", end: "point" },
  });
  // culmen highlight ridge (small yellow stripe on top of the upper beak)
  b.rod([0, 0.1862, 0.088], [0, 0.1795, 0.1085], 0.0009, { color: P.yellow, bone: head, sides: 4 });
  // lower jaw
  b.spike([0, 0.164, 0.085], [0, 0.1652, 0.1155], null, 0.0082, {
    color: P.redDeep,
    bone: jaw,
    sides: 8,
    caps: { start: "flat", end: "point" },
  });
  // mouth line, each side
  for (const s of [1, -1]) {
    b.rod([s * 0.0088, 0.1672, 0.0895], [s * 0.0028, 0.1668, 0.1155], 0.0007, {
      color: BLACK,
      bone: head,
      sides: 4,
    });
    // nostril
    b.part(new THREE.SphereGeometry(0.0013, 6, 4), BLACK, {
      bone: head,
      at: [s * 0.0084, 0.1748, 0.0935],
    });
  }

  // ---------- eyes (both sides) ----------
  for (const s of [1, -1]) {
    const az = 55;
    const el = 9;
    disc(s, az, el, 0.0112, 0.0022, BLACK, 18); // outline
    disc(s, az, el, 0.0092, 0.0032, P.white, 18); // white
    disc(s, az + 1, el, 0.0066, 0.0042, P.blue, 16); // iris
    disc(s, az + 1.5, el, 0.0037, 0.0052, BLACK, 12); // pupil
    disc(s, az - 2.5, el + 4, 0.0016, 0.0062, P.white, 8, 0.0005); // highlight

    // brow bar above the eye
    const bd = dirAt(s, az - 3, el + 26);
    b.part(new THREE.BoxGeometry(0.019, 0.0028, 0.0016), BLACK, {
      bone: head,
      at: surf(bd, 0.0016),
      dir: bd,
      axis: "z",
      up: [0, 1, 0],
    });

    // blue cheek patch behind the eye, on a black outline disc
    disc(s, 104, -12, 0.0105, 0.002, BLACK, 16);
    disc(s, 104, -12, 0.0088, 0.003, P.blue, 16);
    // tiny white dot in the cheek patch motif
    disc(s, 104, -12, 0.0025, 0.004, P.white, 8, 0.0005);
  }

  // ---------- small throat accent: black chin dot beneath the beak ----------
  {
    const d = dirAt(1, 0, -52);
    b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.0006, 10), BLACK, {
      bone: head,
      at: surf(d, 0.0008),
      dir: d,
      flat: true,
    });
  }
}
    return buildHead;
  })(),
  // wingsTail
  (() => {
function buildWingsTail({ b, J, P, M }: Ctx) {
  const DEG = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  type Pt = [number, number] | [number, number, "sharp"];

  // Rotate an outline about (ox, oy), keeping sharp markers.
  const rot = (pts: Pt[], deg: number, ox = 0, oy = 0): Pt[] => {
    const a = deg * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return pts.map((p) => {
      const x = ox + p[0] * c - p[1] * s;
      const y = oy + p[0] * s + p[1] * c;
      return p.length === 3 ? ([x, y, "sharp"] as Pt) : ([x, y] as Pt);
    });
  };

  // Push a roundish outline outward from its centroid (used for the black poster outlines).
  const grow = (pts: Pt[], k: number): Pt[] => {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return pts.map((p) => {
      const dx = p[0] - cx;
      const dy = p[1] - cy;
      const l = Math.hypot(dx, dy) || 1;
      const x = p[0] + (dx / l) * k;
      const y = p[1] + (dy / l) * k;
      return p.length === 3 ? ([x, y, "sharp"] as Pt) : ([x, y] as Pt);
    });
  };

  const rect = (u0: number, u1: number, v0: number, v1: number): Pt[] => [
    [u0, v0],
    [u1, v0],
    [u1, v1],
    [u0, v1],
  ];

  // ------------------------------------------------------------------ wings
  // Pointed flight feather in wing coordinates (u back along the wing, v up in the wing plane).
  const wingFeather = (u0: number, c: number, len: number, hw: number, ang: number, g: number): Pt[] =>
    rot(
      [
        [-g, -(hw + g)],
        [len - 0.014, -(hw + g)],
        [len + g * 1.5, 0, "sharp"],
        [len - 0.014, hw + g],
        [-g, hw + g],
      ],
      ang,
      u0,
      c,
    );

  const COVERT: Pt[] = [
    [0, 0.006],
    [0.01, 0.017],
    [0.038, 0.019],
    [0.064, 0.01],
    [0.07, -0.008],
    [0.05, -0.03],
    [0.016, -0.034],
    [0, -0.016],
  ];
  const featherColors = [P.blue, P.yellow, P.blue, P.black];
  const tipSquare = [P.white, P.black, P.white, P.white];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const w1 = J[`wing${S}1`];
    const w2 = J[`wing${S}2`];
    const sh = M[s > 0 ? "shoulderL" : "shoulderR"];
    const origin = V(sh[0] + s * 0.004, sh[1], sh[2]);
    const d = V(s * 0.045, -0.045, -0.115).normalize();
    const yv = V(0, 1, 0);
    yv.addScaledVector(d, -yv.dot(d)).normalize();
    const nrm = new THREE.Vector3().crossVectors(d, yv).normalize();
    if (nrm.x * s < 0) nrm.negate();
    const P3 = (u: number, v: number, l: number) =>
      origin.clone().addScaledVector(d, u).addScaledVector(yv, v).addScaledVector(nrm, l);
    const slab = (pts: Pt[], l: number, t: number, color: string, bone: any, smoothing = 0) =>
      b.extrude(pts, {
        at: P3(0, 0, l),
        x: d.toArray(),
        y: yv.toArray(),
        thickness: t,
        color,
        bone,
        smoothing,
      });

    // flight feathers: stepped fan, each on a black outline slab
    for (let i = 0; i < 4; i++) {
      const c = -i * 0.011;
      const len = 0.101 - i * 0.012;
      const ang = -i * 3;
      const l = 0.002 - i * 0.001;
      slab(wingFeather(0.03, c, len, 0.0075, ang, 0.0016), l - 0.0004, 0.0016, P.black, w2);
      slab(wingFeather(0.03, c, len, 0.0075, ang, 0), l, 0.0016, featherColors[i], w2);
      // tip square, alternating white / black
      const sq = rot(rect(len - 0.03, len - 0.0235, -0.00325, 0.00325), ang, 0.03, c);
      slab(
        sq.map((p) => [p[0], p[1]] as Pt),
        l + 0.0013,
        0.0012,
        tipSquare[i],
        w2,
      );
    }

    // covert: black outline behind, red slab on top
    slab(grow(COVERT, 0.003), 0.004, 0.0024, P.black, w1, 1);
    slab(COVERT, 0.0057, 0.002, P.red, w1, 1);

    // yellow disc on a black disc
    const dcU = 0.03;
    const dcV = 0.002;
    b.part(new THREE.CylinderGeometry(0.0108, 0.0108, 0.0016, 16), P.black, {
      at: P3(dcU, dcV, 0.0075),
      dir: nrm.toArray(),
      bone: w1,
    });
    b.part(new THREE.CylinderGeometry(0.0088, 0.0088, 0.0022, 16), P.yellow, {
      at: P3(dcU, dcV, 0.0087),
      dir: nrm.toArray(),
      bone: w1,
    });
    // white bar across the covert
    slab(rect(0.05, 0.057, -0.026, 0.014), 0.0075, 0.0024, P.white, w1);
  }

  // ------------------------------------------------------------------- tail
  const root = V(M.tailRoot[0], M.tailRoot[1], M.tailRoot[2]);
  const tdir = V(0, -0.032, -0.075).normalize();
  const X = V(1, 0, 0);
  const up = new THREE.Vector3().crossVectors(tdir, X).normalize();
  if (up.y < 0) up.negate();
  const T3 = (l: number) => root.clone().addScaledVector(up, l);
  const tslab = (pts: Pt[], l: number, t: number, color: string, bone: any) =>
    b.extrude(pts, {
      at: T3(l),
      x: tdir.toArray(),
      y: X.toArray(),
      thickness: t,
      color,
      bone,
    });

  const tailColors = [P.black, P.blue, P.black, P.blue, P.black];
  const SPLIT = 0.04;

  for (let k = 0; k < 5; k++) {
    const i = k - 2;
    const ang = i * 9;
    const len = [0.07, 0.076, 0.08, 0.076, 0.07][k];
    const hw = i === 0 ? 0.0075 : 0.0065;
    const notched = Math.abs(i) === 2;
    const l = (3 - Math.abs(i)) * 0.001;
    const col = tailColors[k];

    const basePts = (g: number): Pt[] => [
      [0, -(0.005 + g)],
      [SPLIT, -(hw + g)],
      [SPLIT, hw + g],
      [0, 0.005 + g],
    ];
    const tipPts = (g: number): Pt[] => {
      const h = hw + g;
      const L = len + g;
      return notched
        ? [
            [SPLIT, -h],
            [L, -h],
            [L - 0.01, 0, "sharp"],
            [L, h],
            [SPLIT, h],
          ]
        : [
            [SPLIT, -h],
            [len - 0.012, -h],
            [L, 0, "sharp"],
            [len - 0.012, h],
            [SPLIT, h],
          ];
    };

    // black outline underneath, then the coloured feather: base on tail1, rest on tail2
    tslab(rot(basePts(0.0016), ang), l - 0.0004, 0.0016, P.black, J.tail1);
    tslab(rot(tipPts(0.0016), ang), l - 0.0004, 0.0016, P.black, J.tail2);
    tslab(rot(basePts(0), ang), l, 0.0016, col, J.tail1);
    tslab(rot(tipPts(0), ang), l, 0.0016, col, J.tail2);

    // white bar across every feather
    tslab(rot(rect(0.06, 0.067, -hw, hw), ang), l + 0.0014, 0.0012, P.white, J.tail2);

    if (i === 0) {
      // yellow band stripe and red tip triangle on the middle feather
      tslab(rot(rect(0.046, 0.054, -hw, hw), ang), l + 0.0014, 0.0012, P.yellow, J.tail2);
      tslab(
        rot(
          [
            [len - 0.032, -0.0055],
            [len - 0.004, 0, "sharp"],
            [len - 0.032, 0.0055],
          ],
          ang,
        ),
        l + 0.0014,
        0.0012,
        P.red,
        J.tail2,
      );
    }
  }
}
    return buildWingsTail;
  })(),
  // legsFeet
  (() => {
function buildLegsFeet({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const RED = P.red;
  const YELLOW = P.yellow;
  const YDEEP = P.yellowDeep;
  const WHITE = P.white;

  const toeDirs = [
    [-0.3, 1],
    [0, 1],
    [0.3, 1],
    [0, -1],
  ];

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hipJ = J[`hip${side}`];
    const ankleJ = J[`ankle${side}`];
    const footJ = J[`foot${side}`];
    const hip = M[`hip${side}`];
    const foot = M[`foot${side}`];
    const x = hip[0];
    const ankle: [number, number, number] = [x, 0.045, 0.005];

    // --- thigh puff: two hemispheres, hard split down the middle ---
    const half = new THREE.SphereGeometry(0.011, 10, 6, 0, Math.PI);
    // outer half faces away from the mid-plane, inner half faces it
    b.part(half, YDEEP, { bone: hipJ, at: hip, rotation: [0, s * 90, 0] });
    b.part(half, WHITE, { bone: hipJ, at: hip, rotation: [0, -s * 90, 0] });

    // --- tarsus ---
    b.rod(hip, ankle, 0.0036, BLACK, { bone: hipJ, sides: 6 });
    // lower shank from ankle to the foot
    b.capsule(ankle, [x, 0.0415, 0.005], 0.0042, BLACK, { bone: ankleJ, sides: 6 });

    // --- ankle ring band: black outline rings around a red ring ---
    const ringDir: [number, number, number] = [0, 1, 0.1];
    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.0062, 10), BLACK, {
      bone: ankleJ,
      at: [x, 0.0495, 0.0052],
      dir: ringDir,
    });
    b.part(new THREE.CylinderGeometry(0.0054, 0.0054, 0.0074, 10), RED, {
      bone: ankleJ,
      at: [x, 0.0495, 0.0052],
      dir: ringDir,
    });

    // --- foot pad ---
    b.part(new THREE.SphereGeometry(0.0048, 8, 6), BLACK, { bone: footJ, at: [x, 0.0405, 0.005] });

    // --- toes ---
    toeDirs.forEach(([dx, dz], i) => {
      const toeJ = J[`toe${side}${i + 1}`];
      // joint dirs for R mirror L, so spread outward/inward consistently
      const sx = s === 1 ? dx : -dx;
      const len2 = Math.hypot(sx, dz);
      const dxn = sx / len2;
      const dzn = dz / len2;
      const hind = dz < 0;
      const L = hind ? 0.014 : 0.02;
      const p0: [number, number, number] = [x, 0.0405, 0.005];
      const p1: [number, number, number] = [x + dxn * L * 0.55, 0.0402, 0.005 + dzn * L * 0.55];
      const p2: [number, number, number] = [x + dxn * L, hind ? 0.0372 : 0.0355, 0.005 + dzn * L];

      b.sweep(catmull([p0, p1, p2]), [0.0034, 0.0027], {
        bone: toeJ,
        sides: 6,
        caps: "round",
        color: BLACK,
      });

      // red cone claw at the tip, curving down
      const cd: [number, number, number] = [dxn, -0.55, dzn];
      b.spike(p2, cd, 0.0085, 0.0028, { bone: toeJ, color: RED, sides: 6 });

      // knuckle: black outline disc + tiny yellow disc seated on the toe top
      const kx = x + dxn * 0.005;
      const kz = 0.005 + dzn * 0.005;
      b.part(new THREE.CylinderGeometry(0.0036, 0.0036, 0.0012, 8), BLACK, {
        bone: toeJ,
        at: [kx, 0.0437, kz],
      });
      b.part(new THREE.CylinderGeometry(0.0027, 0.0027, 0.0012, 8), YELLOW, {
        bone: toeJ,
        at: [kx, 0.0443, kz],
      });
    });
  }
}
    return buildLegsFeet;
  })(),
  // branch
  (() => {
function buildBranch({ b, J, P, M }: Ctx) {
  const bone = J.perch;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);
  const AXIS_Y = 0.02;
  const RAD = (x: number) => 0.016 + 0.0005 * (x / 0.22);
  const BAND_COLORS = [P.red, P.yellow, P.blue, P.white];

  // ---- main rod ----------------------------------------------------------
  b.rod([-0.217, AXIS_Y, 0], [0.217, AXIS_Y, 0], [0.0155, 0.0165], P.branchDark, {
    bone,
    sides: 12,
    name: "branchRod",
  });

  // ---- helpers -----------------------------------------------------------
  const disc = (at: THREE.Vector3, dir: [number, number, number], r: number, h: number, color: string, seg = 16) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, bone });

  // a poster-style band: black underlay ring + coloured ring, along a given direction
  const band = (at: THREE.Vector3, dir: THREE.Vector3, r: number, color: string, len = 0.008, seg = 14) => {
    const d = dir.clone().normalize();
    disc(at, [d.x, d.y, d.z], r + 0.0005, len + 0.003, P.black, seg);
    disc(at, [d.x, d.y, d.z], r + 0.0012, len, color, seg);
  };

  // ---- colour bands along the main rod -----------------------------------
  const plusX = [0.055, 0.077, 0.099, 0.121, 0.143, 0.165, 0.187];
  plusX.forEach((x, i) => band(V(x, AXIS_Y, 0), V(1, 0, 0), RAD(x), BAND_COLORS[i % 4]));
  const minusX = [-0.05, -0.072, -0.094, -0.116, -0.138, -0.16];
  minusX.forEach((x, i) => band(V(x, AXIS_Y, 0), V(1, 0, 0), RAD(x), BAND_COLORS[(i + 2) % 4]));

  // ---- cut ends: black flat disc with white inner ring -------------------
  for (const s of [1, -1]) {
    disc(V(s * 0.2185, AXIS_Y, 0), [1, 0, 0], 0.0195, 0.003, P.black, 20);
    b.part(new THREE.RingGeometry(0.0075, 0.0118, 20), P.white, {
      at: V(s * 0.2203, AXIS_Y, 0),
      dir: [s, 0, 0],
      axis: "z",
      bone,
    });
    disc(V(s * 0.2203, AXIS_Y, 0), [1, 0, 0], 0.0035, 0.0006, P.red, 10);
  }

  // ---- knot on the front of the rod --------------------------------------
  {
    const kx = -0.022;
    const kz = RAD(kx) + 0.0002;
    disc(V(kx, AXIS_Y + 0.001, kz), [0, 0, 1], 0.0078, 0.003, P.black, 14);
    disc(V(kx, AXIS_Y + 0.001, kz + 0.0006), [0, 0, 1], 0.0055, 0.003, P.cream, 14);
    disc(V(kx, AXIS_Y + 0.001, kz + 0.0012), [0, 0, 1], 0.0028, 0.003, P.branchDark, 10);
  }

  // ---- stub nubs ----------------------------------------------------------
  const nub = (x: number, dir: THREE.Vector3) => {
    const d = dir.clone().normalize();
    const start = V(x, AXIS_Y, 0).addScaledVector(d, 0.008);
    const tip = V(x, AXIS_Y, 0).addScaledVector(d, 0.03);
    b.rod(start, tip, [0.005, 0.0036], P.branchDark, { bone, sides: 8 });
    disc(tip.clone().addScaledVector(d, 0.0006), [d.x, d.y, d.z], 0.0039, 0.0016, P.black, 8);
    disc(tip.clone().addScaledVector(d, 0.0013), [d.x, d.y, d.z], 0.0022, 0.0008, P.white, 8);
    band(lerpV(start, tip, 0.35), d, 0.0044, P.yellow, 0.004, 8);
  };
  nub(0.112, V(0.15, 0.55, -1));
  nub(-0.118, V(-0.1, 0.5, 0.9));

  // ---- twigs -------------------------------------------------------------
  type Twig = { a: THREE.Vector3; b: THREE.Vector3; r0: number; r1: number; d: THREE.Vector3 };
  const twig = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r0: number, r1: number): Twig => {
    const d = dir.clone().normalize();
    const tip = base.clone().addScaledVector(d, len);
    b.capsule(base, tip, [r0, r1], P.branchDark, { bone, sides: 8 });
    return { a: base, b: tip, r0, r1, d };
  };
  const pointOn = (t: Twig, u: number) => lerpV(t.a, t.b, u);
  const radiusOn = (t: Twig, u: number) => t.r0 + (t.r1 - t.r0) * u;
  const twigBand = (t: Twig, u: number, color: string) =>
    band(pointOn(t, u), t.d, radiusOn(t, u), color, 0.005, 10);

  // ---- leaves ------------------------------------------------------------
  type Pt = [number, number];
  const rotPts = (pts: Pt[], deg: number): Pt[] => {
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);
    return pts.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  };
  const scalePts = (pts: Pt[], k: number): Pt[] => pts.map(([x, y]) => [x * k, y * k]);
  const shape = (kind: "tri" | "half" | "square", s: number): Pt[] => {
    if (kind === "tri")
      return [
        [-s, -s * 0.75],
        [s, -s * 0.75],
        [0, s * 1.05],
      ];
    if (kind === "square")
      return [
        [-s, -s],
        [s, -s],
        [s, s],
        [-s, s],
      ];
    const pts: Pt[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (Math.PI * i) / 6;
      pts.push([Math.cos(a) * s, Math.sin(a) * s - 0.42 * s]);
    }
    return pts;
  };
  const leaf = (kind: "disc" | "tri" | "half" | "square", c: THREE.Vector3, s: number, color: string, rot = 0) => {
    const margin = 0.003;
    if (kind === "disc") {
      disc(c, [0, 0, 1], s + margin, 0.003, P.black, 20);
      disc(c.clone().add(V(0, 0, 0.0015)), [0, 0, 1], s, 0.002, color, 20);
      return;
    }
    const pts = rotPts(shape(kind, s), rot);
    b.extrude(scalePts(pts, (s + margin) / s), {
      at: c,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      color: P.black,
      bone,
    });
    b.extrude(pts, {
      at: c.clone().add(V(0, 0, 0.0015)),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.002,
      color,
      bone,
    });
  };
  const stem = (from: THREE.Vector3, to: THREE.Vector3) =>
    b.rod(from, to, [0.0024, 0.0018], P.black, { bone, sides: 6 });

  // main rising twig at +X, about 50 degrees
  const t1 = twig(V(0.15, 0.03, 0), V(0.63, 0.75, 0.12), 0.092, 0.0058, 0.003);
  twigBand(t1, 0.22, P.red);
  twigBand(t1, 0.6, P.blue);
  twigBand(t1, 0.86, P.yellow);
  const tip1 = t1.b;
  stem(tip1, tip1.clone().add(V(0.002, 0.01, 0)));
  leaf("disc", tip1.clone().add(V(0.002, 0.021, 0.0)), 0.0115, P.red);

  // forked smaller twig
  const t2 = twig(pointOn(t1, 0.5), V(-0.35, 0.9, 0.15), 0.056, 0.0038, 0.0022);
  twigBand(t2, 0.35, P.white);
  twigBand(t2, 0.75, P.red);
  const tip2 = t2.b;
  stem(tip2, tip2.clone().add(V(-0.001, 0.008, 0)));
  leaf("tri", tip2.clone().add(V(-0.002, 0.0185, 0.001)), 0.0115, P.yellow, 8);

  // blue half-disc leaf on a side stem
  {
    const from = pointOn(t1, 0.3);
    const to = V(0.192, 0.054, 0.028);
    stem(from, to);
    leaf("half", to.clone().add(V(0.003, 0.002, 0.0)), 0.0105, P.blue, -15);
  }
  // white square leaf on a stem toward -Z
  {
    const from = pointOn(t2, 0.62);
    const to = V(0.174, 0.1, -0.022);
    stem(from, to);
    leaf("square", to.clone().add(V(0, 0.005, -0.003)), 0.0085, P.white, 22);
  }

  // right-end stub at -X with a blue disc leaf
  const t3 = twig(V(-0.19, 0.03, 0), V(-0.3, 1, 0), 0.062, 0.0052, 0.0032);
  twigBand(t3, 0.3, P.yellow);
  twigBand(t3, 0.62, P.red);
  const tip3 = t3.b;
  stem(tip3, tip3.clone().add(V(-0.001, 0.009, 0)));
  leaf("disc", tip3.clone().add(V(-0.002, 0.02, 0)), 0.0105, P.blue);
}
    return buildBranch;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird" });
  const J: Record<string, Joint> = {};
  J["perch"] = b.joint("perch", { at: [0,0.02,0], dir: [1,0,0] });
  J["body"] = b.joint("body", { parent: J["perch"], at: [0,0.115,0], dir: [0,0.5,0.85], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,0.15,0.04], dir: [0,0.6,0.8], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.17,0.055], dir: [0,0.1,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.17,0.07], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.09,-0.07], dir: [0,-0.35,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.08,-0.1], dir: [0,-0.35,-1], role: "tail" });
  J["wingL1"] = b.joint("wingL1", { parent: J["body"], at: [0.05,0.13,0], dir: [0.35,-0.2,-1], role: "wing" });
  J["wingL2"] = b.joint("wingL2", { parent: J["wingL1"], at: [0.07,0.115,-0.045], dir: [0.3,-0.2,-1], role: "wing" });
  J["wingR1"] = b.joint("wingR1", { parent: J["body"], at: [-0.05,0.13,0], dir: [-0.35,-0.2,-1], role: "wing" });
  J["wingR2"] = b.joint("wingR2", { parent: J["wingR1"], at: [-0.07,0.115,-0.045], dir: [-0.3,-0.2,-1], role: "wing" });
  J["hipL"] = b.joint("hipL", { parent: J["body"], at: [0.025,0.075,0.01], dir: [0,-1,0], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["hipL"], at: [0.025,0.045,0.005], dir: [0,-1,0.1], role: "leg" });
  J["footL"] = b.joint("footL", { parent: J["ankleL"], at: [0.025,0.04,0.005], dir: [0,0,1], role: "leg" });
  J["toeL1"] = b.joint("toeL1", { parent: J["footL"], at: [0.025,0.04,0.005], dir: [-0.3,-0.15,1], role: "digit" });
  J["toeL2"] = b.joint("toeL2", { parent: J["footL"], at: [0.025,0.04,0.005], dir: [0,-0.15,1], role: "digit" });
  J["toeL3"] = b.joint("toeL3", { parent: J["footL"], at: [0.025,0.04,0.005], dir: [0.3,-0.15,1], role: "digit" });
  J["toeL4"] = b.joint("toeL4", { parent: J["footL"], at: [0.025,0.04,0.005], dir: [0,-0.15,-1], role: "digit" });
  J["hipR"] = b.joint("hipR", { parent: J["body"], at: [-0.025,0.075,0.01], dir: [0,-1,0], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["hipR"], at: [-0.025,0.045,0.005], dir: [0,-1,0.1], role: "leg" });
  J["footR"] = b.joint("footR", { parent: J["ankleR"], at: [-0.025,0.04,0.005], dir: [0,0,1], role: "leg" });
  J["toeR1"] = b.joint("toeR1", { parent: J["footR"], at: [-0.025,0.04,0.005], dir: [0.3,-0.15,1], role: "digit" });
  J["toeR2"] = b.joint("toeR2", { parent: J["footR"], at: [-0.025,0.04,0.005], dir: [0,-0.15,1], role: "digit" });
  J["toeR3"] = b.joint("toeR3", { parent: J["footR"], at: [-0.025,0.04,0.005], dir: [-0.3,-0.15,1], role: "digit" });
  J["toeR4"] = b.joint("toeR4", { parent: J["footR"], at: [-0.025,0.04,0.005], dir: [0,-0.15,-1], role: "digit" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
