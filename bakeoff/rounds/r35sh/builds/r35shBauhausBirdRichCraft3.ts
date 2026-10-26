import * as THREE from "three";
import { catmull, createBuilder, frame, limb, paint, polyline, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description:
    "A chunky songbird perched on a banded black-and-white branch, built from circles, triangles and squares in Bauhaus primary red, yellow and blue.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: primaries plus black and paper white
const RED = "#d9261c";
const YELLOW = "#f7c516";
const BLUE = "#1f46a8";
const BLACK = "#16161a";
const WHITE = "#f4efe3";
const SOFT_BLACK = "#26262d";

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type OL = Array<[number, number] | [number, number, "sharp"]>;

/** Smooth interpolation through [t, value] keys. */
function prof(keys: [number, number][], t: number): number {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      const k = Math.min(Math.max((t - t0) / (t1 - t0), 0), 1);
      return v0 + (v1 - v0) * (k * k * (3 - 2 * k));
    }
  }
  return keys[keys.length - 1][1];
}

const disc = (cx: number, cy: number, r: number, n = 10): OL =>
  Array.from({ length: n }, (_, i) => [
    cx + r * Math.cos((i / n) * Math.PI * 2),
    cy + r * Math.sin((i / n) * Math.PI * 2),
  ] as [number, number]);

const pie = (cx: number, cy: number, r: number, a0: number, a1: number, steps: number): OL => {
  const pts: OL = [[cx, cy]];
  for (let k = 0; k <= steps; k++) {
    const a = a0 + ((a1 - a0) * k) / steps;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
};

type Kind = "circle" | "tri" | "square";
function shapeGeo(kind: Kind, r: number, thick: number, spin = 0) {
  const sides = kind === "circle" ? 16 : kind === "tri" ? 3 : 4;
  const g = new THREE.CylinderGeometry(r, r, thick, sides, 1);
  g.rotateY((kind === "square" ? Math.PI / 4 : 0) + spin);
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="${BLACK}"/>
    <circle cx="50" cy="50" r="39" fill="${WHITE}"/>
    <circle cx="52" cy="50" r="27" fill="${BLUE}"/>
    <circle cx="53" cy="50" r="15" fill="${BLACK}"/>
    <circle cx="44" cy="40" r="6" fill="${WHITE}"/>
  </svg>`,
  { size: 128 },
);

const CHEEK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="${RED}" stroke="${BLACK}" stroke-width="6"/>
    <path d="M50 50 L50 10 A40 40 0 0 1 90 50 Z" fill="${WHITE}"/>
    <circle cx="50" cy="50" r="7" fill="${BLACK}"/>
  </svg>`,
  { size: 128 },
);

const CHEST = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="${RED}" stroke="${BLACK}" stroke-width="5"/>
    <circle cx="50" cy="50" r="34" fill="${YELLOW}" stroke="${BLACK}" stroke-width="3"/>
    <circle cx="50" cy="50" r="21" fill="${BLUE}"/>
    <path d="M50 29 L71 65 L29 65 Z" fill="${WHITE}"/>
    <circle cx="50" cy="55" r="5" fill="${BLACK}"/>
  </svg>`,
  { size: 192 },
);

const LEAF_A = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 92 L10 10 A82 82 0 0 1 92 92 Z" fill="${YELLOW}" stroke="${BLACK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M10 92 L10 42 A50 50 0 0 1 60 92 Z" fill="${RED}"/>
  </svg>`,
  { size: 128 },
);

const LEAF_B = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 6 L94 92 L6 92 Z" fill="${BLUE}" stroke="${BLACK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M50 44 L72 84 L28 84 Z" fill="${WHITE}"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BARK = paint((p) => {
  const k = (((p.x + 1) / 0.04) % 1 + 1) % 1;
  return k < 0.16 ? WHITE : SOFT_BLACK;
});

const tipPaint = (color: string, tip: string, len: number) =>
  paint((_p, _n, s) => (s[0] > len - 0.014 ? tip : color));

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "bauhaus_songbird" });

  // ---------- root + perch ----------
  const root = b.joint("root", { at: [0, 0.01, 0] });

  const bp = catmull([
    [-0.19, 0.07, -0.012],
    [-0.1, 0.027, -0.003],
    [0, 0.0098, 0],
    [0.095, 0.017, 0.004],
    [0.2, 0.048, 0.012],
  ]);
  const branch = b.sweep(bp, (t) => 0.0125 - 0.0062 * t, { bone: root, color: BARK, sides: 6 });
  const branchSkin = b.surface(branch);
  const footTop = (x: number) => {
    const hit = branchSkin.ray([x, 0.2, 0], [0, -1, 0]);
    return hit ? hit.at.y : 0.019;
  };

  // twigs with Bauhaus leaves
  const twig = (pts: THREE.Vector3[], r0: number, r1: number) =>
    b.sweep(catmull(pts), [r0, r1], { bone: root, color: BLACK, sides: 6 });

  const emblem = (c: THREE.Vector3, dir: THREE.Vector3, layers: [Kind, number, string, number?][]) => {
    const d = dir.clone().normalize();
    layers.forEach(([kind, r, color, spin], k) => {
      b.part(shapeGeo(kind, r, 0.0028, spin ?? 0), color, {
        bone: root,
        at: c.clone().addScaledVector(d, k * 0.0026),
        dir: d,
        flat: true,
      });
    });
  };

  const a0 = bp.at(0.16);
  const a1 = a0.clone().add(V(-0.01, 0.045, 0.004));
  const a2 = a1.clone().add(V(-0.022, 0.042, -0.005));
  const b1 = a1.clone().add(V(0.03, 0.036, 0.008));
  twig([a0, a1, a2], 0.0048, 0.0028);
  twig([a1, a1.clone().add(V(0.014, 0.016, 0.004)), b1], 0.0035, 0.002);

  const c0 = bp.at(0.86);
  const c1 = c0.clone().add(V(0.01, 0.038, -0.004));
  const c2 = c1.clone().add(V(0.02, 0.03, 0.006));
  twig([c0, c1, c2], 0.0046, 0.0026);

  emblem(a2.clone().add(V(-0.004, 0.018, 0.004)), V(0.1, 0.05, 1), [
    ["circle", 0.02, YELLOW],
    ["circle", 0.012, RED],
    ["circle", 0.005, BLACK],
  ]);
  emblem(b1.clone().add(V(0.004, 0.02, 0.004)), V(-0.1, 0.05, 1), [
    ["tri", 0.022, BLUE],
    ["tri", 0.012, WHITE, Math.PI],
  ]);
  emblem(c2.clone().add(V(0.003, 0.016, 0.004)), V(0.05, 0.1, 1), [
    ["square", 0.02, RED, 0.3],
    ["circle", 0.01, YELLOW],
  ]);
  emblem(c1.clone().add(V(-0.014, 0.01, 0.006)), V(0, 0, 1), [["circle", 0.008, BLUE]]);

  const leafFrames = [
    frame(a1, [-0.6, 1, 0]),
    frame(a0.clone().lerp(a1, 0.6), [0.7, 1, 0]),
    frame(c1, [0.6, 1, 0]),
    frame(c0.clone().lerp(c1, 0.55), [-0.7, 1, 0]),
    frame(b1.clone().lerp(a1, 0.4), [0.2, 1, 0.3]),
  ];
  b.cards(leafFrames, [LEAF_A, LEAF_B], {
    size: [0.024, 0.03],
    lean: 20,
    flow: [0, 0, 1],
    vary: 0.2,
    rng: rng(4),
    bone: root,
  });

  // ---------- skeleton ----------
  const P0: [number, number, number] = [0, 0.066, -0.052];
  const P1: [number, number, number] = [0, 0.072, -0.024];
  const P2: [number, number, number] = [0, 0.086, 0.004];
  const P3: [number, number, number] = [0, 0.1, 0.028];
  const P4: [number, number, number] = [0, 0.112, 0.042];
  const HEAD_C: [number, number, number] = [0, 0.128, 0.052];
  const TAIL2: [number, number, number] = [0, 0.04, -0.104];

  const pelvis = b.joint("pelvis", { parent: root, at: P1, dir: [0, 0.4, 0.9], role: "spine" });
  const bodyPath = catmull([P0, P1, P2, P3, P4]);
  const rootT = bodyPath.closestT(pelvis.at);
  const front = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: pelvis,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const back = b.chain("rump", bodyPath.slice(rootT, 0), {
    parent: pelvis,
    count: 1,
    names: ["rump"],
    role: "spine",
  });
  const tail = b.chain("tail", catmull([P0, [0, 0.052, -0.078], TAIL2]), {
    parent: back,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  const neck = b.joint("neck", { parent: front, at: P4, aim: HEAD_C, role: "neck" });
  const head = b.joint("head", { parent: neck, at: HEAD_C, dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.1215, 0.072], dir: [0, -0.02, 1], role: "jaw" });

  // ---------- body ----------
  const RX: [number, number][] = [[0, 0.012], [0.15, 0.026], [0.45, 0.041], [0.75, 0.038], [1, 0.024]];
  const RY: [number, number][] = [[0, 0.012], [0.15, 0.026], [0.45, 0.042], [0.75, 0.04], [1, 0.026]];
  const body = b.sweep(bodyPath, (t): [number, number] => [prof(RX, t), prof(RY, t)], {
    bone: [back, pelvis, front],
    color: WHITE,
    bands: [[0.2, RED]],
    sectors: [[-78, 78, BLUE, 0.2, 1]],
    sides: 8,
    smooth: false,
  });
  const skin = b.surface(body);

  // black collar ring at the neck
  const cp = body.at(0.9);
  const collar = skin.loop(cp, { dir: cp.tangent, lift: 0.0015 });
  b.sweep(collar, 0.0036, { color: BLACK, sides: 4 });

  // breast emblem
  const chestHit = skin.around([0, 0.088, 0.0]).at(0, -12);
  if (chestHit) b.decal(body, CHEST, { at: chestHit, size: [0.052, 0.052] });

  // back dots
  const dotColors = [YELLOW, RED, YELLOW];
  let di = 0;
  b.along(
    body,
    3,
    (at) => {
      b.stick(new THREE.CylinderGeometry(0.0065, 0.0065, 0.004, 12), dotColors[di++ % 3], at, {
        embed: 0.35,
        flat: true,
      });
    },
    { from: 0.3, to: 0.75 },
  );

  // ---------- head ----------
  const headGeo = new THREE.SphereGeometry(0.03, 10, 8);
  headGeo.scale(1, 0.96, 1.04);
  const headPart = b.part(headGeo, YELLOW, { bone: head, at: HEAD_C, flat: true });

  const capGeo = new THREE.SphereGeometry(0.0315, 10, 4, 0, Math.PI * 2, 0, Math.PI * 0.36);
  capGeo.scale(1, 0.96, 1.04);
  b.part(capGeo, BLACK, { bone: head, at: [HEAD_C[0], HEAD_C[1] + 0.0005, HEAD_C[2]], flat: true });

  // eyes and cheeks
  const hs = b.surface(headPart);
  for (const s of [1, -1]) {
    const eyeHit = hs.around(HEAD_C).at(s * 46, 5);
    if (eyeHit) b.decal(headPart, EYE, { at: eyeHit, size: [0.019, 0.019], mirror: s > 0 });
    const cheekHit = hs.around(HEAD_C).at(s * 58, -30);
    if (cheekHit) b.decal(headPart, CHEEK, { at: cheekHit, size: [0.0145, 0.0145], mirror: s > 0 });
  }

  // beak: red upper, black lower (jaw)
  const upper = new THREE.ConeGeometry(0.0115, 0.034, 4, 1);
  upper.scale(1, 1, 0.65);
  b.part(upper, RED, { bone: head, at: [0, 0.1245, 0.0925], dir: [0, -0.05, 1], flat: true });
  const lower = new THREE.ConeGeometry(0.0095, 0.026, 4, 1);
  lower.scale(1, 1, 0.55);
  b.part(lower, BLACK, { bone: jaw, at: [0, 0.1175, 0.0895], dir: [0, -0.03, 1], flat: true });

  // crest: layered triangles
  const crestTri = (k: number): OL => [
    [-0.018 * k, 0],
    [0.012 * k, 0],
    [-0.03 * k, 0.034 * k],
  ];
  const crestSet: [number, number, string][] = [
    [0, 1.0, RED],
    [0.0055, 0.75, BLUE],
    [-0.0055, 0.75, BLUE],
    [0.011, 0.5, WHITE],
    [-0.011, 0.5, WHITE],
  ];
  for (const [xo, k, col] of crestSet) {
    b.extrude(crestTri(k), {
      at: [xo, HEAD_C[1] + 0.02, HEAD_C[2] + 0.004],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.005,
      color: col,
      bone: head,
    });
  }

  // ---------- tail feathers ----------
  const tailDir = V(...TAIL2).sub(V(...P0)).normalize();
  const tailCols = [BLUE, RED, YELLOW, RED, BLUE];
  const tailLens = [0.046, 0.056, 0.064, 0.056, 0.046];
  for (let i = -2; i <= 2; i++) {
    const a = i * 13 * DEG;
    const dir = tailDir.clone().applyAxisAngle(V(0, 1, 0), a);
    const side = V(Math.cos(a), 0, -Math.sin(a));
    const n = dir.clone().cross(side);
    if (n.y < 0) n.negate();
    const L = tailLens[i + 2];
    const outline: OL = [
      [0, -0.006],
      [L - 0.016, -0.0105],
      [L, 0, "sharp"],
      [L - 0.016, 0.0105],
      [0, 0.006],
    ];
    const origin = V(...P0).add(V(0, 0.004, 0.002)).addScaledVector(n, (2 - Math.abs(i)) * 0.0012);
    b.extrude(outline, {
      at: origin,
      x: dir,
      y: side,
      thickness: 0.0032,
      color: tipPaint(tailCols[i + 2], i === 0 ? BLACK : WHITE, L),
      bone: tail.joints[0],
    });
  }

  // ---------- legs & toes ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fx = s * 0.02;
    const top = footTop(fx);
    const hip: [number, number, number] = [fx, 0.062, 0.002];
    const pts = limb(hip, [fx, top + 0.003, 0], [0.021, 0.024], [[0, 0, -1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: pelvis,
      names: [`hip${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [fx, top, 0],
    });
    b.sweep(leg, [0.0042, 0.003], { color: BLACK, sides: 6 });
    b.part(new THREE.SphereGeometry(0.0052, 6, 4), YELLOW, { bone: leg.joints[1], at: pts[1], flat: true });

    const foot = pts[pts.length - 1];
    [-26, 0, 26, 180].forEach((deg, k) => {
      const a = deg * DEG;
      const d = V(Math.sin(a), 0, Math.cos(a));
      const sc = k === 3 ? 0.85 : 1;
      const p0 = foot.clone();
      p0.y = top + 0.0025;
      const p1 = foot.clone().addScaledVector(d, 0.007 * sc);
      p1.y = top + 0.0008;
      const p2 = foot.clone().addScaledVector(d, 0.0115 * sc);
      p2.y = top - 0.005;
      const nm = `toe${S}${k + 1}`;
      const toe = b.chain(nm, polyline([p0, p1, p2]), {
        parent: leg.tip ?? leg.joints[2],
        names: [`${nm}a`, `${nm}b`],
        role: "digit",
      });
      b.sweep(toe, [0.003, 0.0021], { color: BLACK, sides: 6 });
    });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      polyline([
        [s * 0.041, 0.099, 0.012],
        [s * 0.046, 0.089, -0.018],
        [s * 0.047, 0.076, -0.048],
        [s * 0.048, 0.062, -0.078],
      ]),
      {
        parent: front.joints[1],
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `handTip${S}`],
        role: "wing",
      },
    );
    const shoulder = wing.joints[0];
    const elbow = wing.joints[1];

    // wing plane basis (u back and slightly in, v up leaning in)
    const Xd = V(-0.28 * s, 0, -1).normalize();
    const Lw = V(-0.3 * s, 1, 0);
    const Yd = Lw.clone().addScaledVector(Xd, -Lw.dot(Xd)).normalize();
    const nOut = Xd.clone().cross(Yd);
    if (nOut.x * s < 0) nOut.negate();
    const pivot = V(s * 0.0415, 0.103, 0.014);
    const layer = (off: number) => pivot.clone().addScaledVector(nOut, off);

    // primaries: fanned slats
    const slatLens = [0.088, 0.082, 0.074, 0.064, 0.054];
    for (let i = 0; i < 5; i++) {
      const phi = -(10 + 12 * i) * DEG;
      const xi = Xd.clone().multiplyScalar(Math.cos(phi)).addScaledVector(Yd, Math.sin(phi));
      const yi = Yd.clone().multiplyScalar(Math.cos(phi)).addScaledVector(Xd, -Math.sin(phi));
      const L = slatLens[i];
      const outline: OL = [
        [0, -0.005],
        [L - 0.012, -0.0066],
        [L, 0, "sharp"],
        [L - 0.012, 0.0066],
        [0, 0.005],
      ];
      const dark = i % 2 === 1;
      b.extrude(outline, {
        at: layer(i * 0.0006),
        x: xi,
        y: yi,
        thickness: 0.0032,
        color: tipPaint(dark ? BLACK : BLUE, dark ? YELLOW : WHITE, L),
        bone: elbow,
      });
    }

    // coverts: black outline pie, red pie, yellow dot
    b.extrude(pie(0, 0.003, 0.0415, 0, -Math.PI / 2, 6), {
      at: layer(0.0038),
      x: Xd,
      y: Yd,
      thickness: 0.0035,
      color: BLACK,
      bone: shoulder,
    });
    b.extrude(pie(0, 0.003, 0.037, 0, -Math.PI / 2, 6), {
      at: layer(0.005),
      x: Xd,
      y: Yd,
      thickness: 0.0035,
      color: RED,
      bone: shoulder,
    });
    b.extrude(disc(0.016, -0.014, 0.0085, 10), {
      at: layer(0.0078),
      x: Xd,
      y: Yd,
      thickness: 0.003,
      color: YELLOW,
      bone: shoulder,
    });
    b.extrude(disc(0.016, -0.014, 0.0035, 8), {
      at: layer(0.0104),
      x: Xd,
      y: Yd,
      thickness: 0.003,
      color: BLACK,
      bone: shoulder,
    });
  }

  // rest pose: wings opened a little
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.pose(`shoulder${S}`, { axis: [0, 1, 0], deg: -s * 12 });
  }

  return b.root;
}
