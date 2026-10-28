import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description:
    "A chunky songbird singing on a black dowel branch, built from Bauhaus primary-colour geometry: quartered roundels, triangle saddle, fanned block feathers, a triangle crest and geometric leaves.",
};

// ---------------------------------------------------------------- palette
const RED = "#d9261c";
const YELLOW = "#f5c211";
const BLUE = "#1e4fa8";
const BLACK = "#16161a";
const WHITE = "#f1ecdf";

const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${BLACK}"/>
    <circle cx="50" cy="50" r="39" fill="${WHITE}"/>
    <circle cx="50" cy="50" r="29" fill="${RED}"/>
    <circle cx="50" cy="50" r="16" fill="${BLACK}"/>
    <circle cx="60" cy="39" r="6" fill="${WHITE}"/>
  </svg>`,
  { size: 128 },
);

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="${BLACK}"/>
    <path d="M50 50 L50 7 A43 43 0 0 0 7 50 Z" fill="${RED}"/>
    <path d="M50 50 L93 50 A43 43 0 0 0 50 7 Z" fill="${YELLOW}"/>
    <path d="M50 50 L50 93 A43 43 0 0 0 93 50 Z" fill="${BLUE}"/>
    <path d="M50 50 L7 50 A43 43 0 0 0 50 93 Z" fill="${WHITE}"/>
    <path d="M50 5 V95 M5 50 H95" stroke="${BLACK}" stroke-width="4"/>
    <circle cx="50" cy="50" r="12" fill="${BLACK}"/>
    <circle cx="50" cy="50" r="6" fill="${WHITE}"/>
  </svg>`,
  { size: 192 },
);

const WING_PANEL = svg(
  `<svg viewBox="0 0 50 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="100" fill="${BLUE}"/>
    <path d="M0 0 L50 0 L25 24 Z" fill="${WHITE}"/>
    <circle cx="25" cy="46" r="16" fill="${YELLOW}" stroke="${BLACK}" stroke-width="3"/>
    <circle cx="25" cy="46" r="6" fill="${BLACK}"/>
    <path d="M0 100 A25 25 0 0 1 50 100 Z" fill="${RED}"/>
    <path d="M0 70 H50" stroke="${BLACK}" stroke-width="3"/>
  </svg>`,
  { size: 160 },
);

const LEAF_DISC = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="47" y="70" width="6" height="30" fill="${BLACK}"/>
    <circle cx="50" cy="48" r="46" fill="${BLACK}"/>
    <circle cx="50" cy="48" r="40" fill="${RED}"/>
    <circle cx="50" cy="48" r="26" fill="${WHITE}"/>
    <circle cx="50" cy="48" r="12" fill="${BLUE}"/>
  </svg>`,
  { size: 128 },
);

const LEAF_TRI = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="47" y="82" width="6" height="18" fill="${BLACK}"/>
    <polygon points="50,4 97,88 3,88" fill="${BLACK}"/>
    <polygon points="50,16 85,80 15,80" fill="${YELLOW}"/>
    <polygon points="50,42 68,73 32,73" fill="${BLUE}"/>
    <circle cx="50" cy="63" r="5" fill="${RED}"/>
  </svg>`,
  { size: 128 },
);

const LEAF_SQ = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="47" y="88" width="6" height="12" fill="${BLACK}"/>
    <polygon points="50,2 98,46 50,90 2,46" fill="${BLACK}"/>
    <polygon points="50,10 90,46 50,82 10,46" fill="${BLUE}"/>
    <polygon points="50,24 76,46 50,68 24,46" fill="${RED}"/>
    <circle cx="50" cy="46" r="10" fill="${BLACK}"/>
    <circle cx="50" cy="46" r="4" fill="${WHITE}"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- scale constants
const BR = 0.014; // branch radius
const BY = 0.014; // branch centre height
const HC = V(0, 0.172, 0.074); // head centre
const HR = 0.044; // head radius

const keyed = (keys: number[][]) => (t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

// ---------------------------------------------------------------- paints
const bodyPaint = paint((p, n) => {
  if (p.z < -0.06) return RED;
  if (p.z < -0.05) return BLACK;
  if (n.y < 0.25) return WHITE;
  return BLUE;
});
const headPaint = paint((p) => {
  const dy = p.y - HC.y;
  if (dy > 0.026) return BLACK;
  if (dy < -0.026) return WHITE;
  return YELLOW;
});
const branchPaint = paint((p) => {
  const m = ((((p.x + 1) / 0.1) % 1) + 1) % 1;
  if (m < 0.09) return WHITE;
  if (m > 0.5 && m < 0.58) return RED;
  return BLACK;
});

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird" });

  // ------------------------------------------------------------ helpers
  const blade = (
    bone: any,
    at: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    w: number,
    color: string,
    tip: "square" | "point",
    th = 0.003,
    tipColor?: string,
  ) => {
    const d = dir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(UP, d);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize();
    const h = w / 2;
    const outline: Pt[] =
      tip === "point"
        ? [[0, -h], [len * 0.78, -h], [len, 0, "sharp"], [len * 0.78, h], [0, h]]
        : [[0, -h], [len, -h], [len, h], [0, h]];
    b.extrude(outline, { at, x: d, y: side, thickness: th, color, bone });
    if (tipColor) {
      const cap: Pt[] =
        tip === "point"
          ? [[len * 0.78, -h], [len, 0, "sharp"], [len * 0.78, h]]
          : [[len - 0.014, -h], [len, -h], [len, h], [len - 0.014, h]];
      b.extrude(cap, { at, x: d, y: side, thickness: th * 1.6, color: tipColor, bone });
    }
  };

  const roundel = (bone: any, at: THREE.Vector3, dir: THREE.Vector3, r: number, cols: string[]) => {
    const d = dir.clone().normalize();
    const radii = [1, 0.62, 0.3];
    cols.forEach((c, k) => {
      const rr = r * radii[k];
      b.part(new THREE.CylinderGeometry(rr, rr, 0.003, 14), c, {
        bone,
        at: at.clone().addScaledVector(d, k * 0.0022),
        dir: d,
      });
    });
  };

  // ------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, BY, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.092, -0.045], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.092, -0.045], [0, 0.1, -0.005], [0, 0.118, 0.032]]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([[0, 0.118, 0.032], [0, 0.14, 0.05], [0, 0.157, 0.066]]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.157, 0.066], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.158, 0.104], aim: [0, 0.157, 0.15], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([[0, 0.09, -0.078], [0, 0.087, -0.115], [0, 0.082, -0.15]]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ------------------------------------------------------------ body
  const bodyR = keyed([[0, 0.014], [0.2, 0.044], [0.42, 0.054], [0.62, 0.051], [0.82, 0.042], [1, 0.036]]);
  const body = b.sweep(
    catmull([
      [0, 0.088, -0.085],
      [0, 0.092, -0.045],
      [0, 0.1, -0.005],
      [0, 0.118, 0.032],
      [0, 0.14, 0.05],
      [0, 0.157, 0.066],
    ]),
    (t) => [bodyR(t), bodyR(t) * 1.03],
    { bone: [spine, neck], color: bodyPaint },
  );

  // chest roundel
  const chest = b.surface(body).ray([0, 0.1, 0.35], [0, 0, -1]);
  if (chest) b.decal(body, ROUNDEL, { at: chest, size: [0.075, 0.075], segments: 12 });

  // triangle saddle along the back
  const saddle = [RED, YELLOW, WHITE];
  let k = 0;
  b.along(
    body,
    6,
    (at) => {
      const i = k++;
      return b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 3), saddle[i % 3], at, {
        embed: 0.3,
        flow: [0, 0, i % 2 ? -1 : 1],
      });
    },
    { from: 0.18, to: 0.64 },
  );

  // collar ring
  const collar = b.surface(body).loop(neck.joints[0], { lift: 0.003 });
  b.sweep(collar, 0.0045, { color: YELLOW, sides: 6 });

  // ------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(HR, 12, 9), headPaint, { bone: head, at: HC });
  const skin = b.surface(skull);

  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 64, 10);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.038, 0.038], segments: 8 });
    const ch = skin.around(HC).at(s * 86, -30);
    if (ch) {
      b.stick(new THREE.CylinderGeometry(0.0125, 0.0125, 0.005, 14), RED, ch, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.0078, 0.0078, 0.004, 12), WHITE, ch.moved([0, 0.0025, 0]), { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.0036, 0.0036, 0.004, 10), BLACK, ch.moved([0, 0.0045, 0]), { embed: 0.3 });
    }
  }

  // crest: three overlapping triangles
  const crest = [
    { dz: 0.01, h: 0.055, c: RED, th: 0.008 },
    { dz: -0.008, h: 0.045, c: BLUE, th: 0.0065 },
    { dz: -0.026, h: 0.035, c: RED, th: 0.005 },
  ];
  for (const cr of crest) {
    const y = HC.y + Math.sqrt(HR * HR - cr.dz * cr.dz) - 0.007;
    b.extrude([[-0.017, 0], [0.017, 0], [-0.012, cr.h, "sharp"]], {
      at: [0, y, HC.z + cr.dz],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: cr.th,
      color: cr.c,
      bone: head,
    });
  }

  // beak: upper on head, lower on jaw
  b.sweep([[0, 0.176, 0.104], [0, 0.163, 0.168]], (t) => [0.018 * (1 - t), 0.0135 * (1 - t)], {
    color: RED,
    bone: head,
    section: { ngon: 4 },
    caps: { start: "flat", end: "point" },
  });
  b.sweep([[0, 0.156, 0.104], [0, 0.157, 0.15]], (t) => [0.0125 * (1 - t), 0.009 * (1 - t)], {
    color: BLACK,
    bone: jaw,
    section: { ngon: 4 },
    caps: { start: "flat", end: "point" },
  });
  b.sweep([[0, 0.16, 0.108], [0, 0.16, 0.138]], (t) => [0.006 * (1 - t) + 0.0005, 0.0018], {
    color: RED,
    bone: jaw,
    caps: { start: "flat", end: "point" },
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.0028, 0.0028, 0.003, 8), BLACK, {
      bone: head,
      at: [s * 0.011, 0.173, 0.12],
      dir: [s * 0.7, 0.6, 0],
    });

  // ------------------------------------------------------------ tail fan
  b.sweep(tail, [0.014, 0.008], { color: BLACK, sides: 6 });
  const tailAng = [-34, -17, 0, 17, 34];
  const tailLen = [0.07, 0.082, 0.092, 0.082, 0.07];
  const tailCol = [BLUE, YELLOW, RED, YELLOW, BLUE];
  tailAng.forEach((a, i) => {
    const r = a * DEG;
    blade(
      tail.joints[0],
      V(Math.sin(r) * 0.006, 0.09 + (2 - Math.abs(i - 2)) * 0.0016, -0.08),
      V(Math.sin(r), -0.12, -Math.cos(r)),
      tailLen[i],
      0.028,
      tailCol[i],
      "square",
      0.003,
      BLACK,
    );
  });

  // ------------------------------------------------------------ wings (spread, separated)
  const featherCols = [BLUE, RED, YELLOW];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = V(s * 0.04, 0.125, 0.005);
    const el = V(s * 0.075, 0.133, 0.0);
    const wr = V(s * 0.115, 0.138, -0.012);
    const tp = V(s * 0.15, 0.138, -0.025);
    const arm = b.chain(`wing${sd}`, polyline([sh, el, wr, tp]), {
      parent: spine.joints[1],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `wingTip${sd}`],
      role: "wing",
    });
    b.sweep(arm, [0.012, 0.006], { color: BLACK, sides: 6 });

    // flight feathers: outer ones point out, inner ones sweep back
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      const pt = arm.at(0.98 - u * 0.8);
      const a = (72 - 66 * u) * DEG;
      blade(
        pt.bone ?? arm.joints[1],
        pt.at.clone().add(V(0, i * 0.0014, 0)),
        V(s * Math.sin(a), 0.03, -Math.cos(a)),
        0.09 - 0.02 * u,
        0.024,
        featherCols[i % 3],
        i < 4 ? "point" : "square",
        0.003,
        BLACK,
      );
    }

    // covert panel with printed pattern on both faces
    const Xw = V(s * 1, 0.1, -0.2).normalize();
    const C = V(s * 0.075, 0.146, -0.01);
    const L = 0.095;
    const W = 0.05;
    b.extrude([[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]], {
      at: C,
      x: Xw,
      y: [0, 0, -1],
      thickness: 0.004,
      color: BLUE,
      bone: arm.joints[0],
    });
    b.part(new THREE.PlaneGeometry(W, L), "#ffffff", {
      bone: arm.joints[0],
      at: C.clone().add(V(0, 0.0027, 0)),
      dir: [0, 1, 0],
      axis: "z",
      up: Xw,
      texture: WING_PANEL,
    });
    b.part(new THREE.PlaneGeometry(W, L), "#ffffff", {
      bone: arm.joints[0],
      at: C.clone().add(V(0, -0.0027, 0)),
      dir: [0, -1, 0],
      axis: "z",
      up: Xw,
      texture: WING_PANEL,
    });

    // trailing triangles at the panel's back edge
    for (let j = 0; j < 4; j++) {
      b.extrude([[0, -0.011], [0.02, 0, "sharp"], [0, 0.011]], {
        at: C.clone().add(Xw.clone().multiplyScalar(-0.036 + j * 0.024)).add(V(0, 0.001, -W / 2 + 0.002)),
        x: [0, 0, -1],
        y: Xw,
        thickness: 0.005,
        color: j % 2 ? RED : YELLOW,
        bone: arm.joints[0],
      });
    }

    // wrist roundel
    roundel(arm.joints[2], V(s * 0.14, 0.15, -0.022), V(0, 1, 0), 0.013, [RED, WHITE, BLACK]);
  }

  // ------------------------------------------------------------ legs and toes
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const cx = s * 0.03;
    const pts = limb(V(cx, 0.07, 0), [cx, 0.034, 0], [0.03, 0.032], [[0, 0, -1]]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
    });
    b.sweep(leg, (t) => 0.0045 + 0.0095 * Math.max(0, 1 - t / 0.5), {
      bands: [[0.5, WHITE], [1, YELLOW]],
      sides: 6,
    });

    const toes = [
      { dx: -0.009, ang: 75 },
      { dx: 0, ang: 78 },
      { dx: 0.009, ang: 75 },
      { dx: 0, ang: -75 },
    ];
    toes.forEach((d, i) => {
      const tp = [0, 0.5, 1].map((f) => {
        const a = d.ang * f * DEG;
        return V(cx + d.dx * f, BY + (BR + 0.004) * Math.cos(a), (BR + 0.004) * Math.sin(a));
      });
      const toe = b.chain(`toe${i + 1}${sd}`, catmull(tp), {
        parent: leg.tip ?? leg.joints[leg.joints.length - 1],
        names: [`toe${i + 1}${sd}a`, `toe${i + 1}${sd}b`],
        role: "digit",
      });
      b.sweep(toe, [0.0045, 0.003], { color: YELLOW, sides: 6 });
      const end = toe.at(1);
      b.spike(end, end, 0.009, 0.003, { color: BLACK, sides: 6 });
    });
  }

  // ------------------------------------------------------------ branch and Bauhaus leaves
  b.sweep([[-0.36, BY, 0], [0.36, BY, 0]], BR, { color: branchPaint, bone: root, sides: 8, caps: "flat" });
  for (const s of [1, -1]) {
    roundel(root, V(s * 0.3605, BY, 0), V(s, 0, 0), 0.0155, [RED, WHITE, BLACK]);
  }

  const twig = (pts: number[][], r0: number, r1: number) =>
    b.sweep(catmull(pts), [r0, r1], { color: BLACK, bone: root, sides: 6 });
  twig([[-0.26, 0.02, 0], [-0.29, 0.07, 0.004], [-0.31, 0.115, 0]], 0.006, 0.003);
  twig([[-0.29, 0.07, 0.004], [-0.265, 0.082, 0.007], [-0.245, 0.095, 0.01]], 0.0035, 0.002);
  twig([[0.26, 0.02, 0], [0.285, 0.065, -0.004], [0.3, 0.105, 0]], 0.006, 0.003);
  twig([[0.285, 0.065, -0.004], [0.31, 0.078, 0], [0.33, 0.09, 0.004]], 0.0035, 0.002);

  const leaf = (at: number[], tex: any, size: number) =>
    b.cards([{ at, axis: [0, 1, 0] } as any].map((f) => (f as any)), tex, {
      size: [size, size],
      lean: 0,
      flow: [0, 0, 1],
      bone: root,
    });
  const mk = (at: number[]) => leafFrame(at);
  function leafFrame(at: number[]) {
    return frame(at, [0, 1, 0]);
  }
  const card = (at: number[], tex: any, size: number) =>
    b.cards([mk(at)], tex, { size: [size, size], lean: 0, flow: [0, 0, 1], bone: root });
  void leaf;
  card([-0.31, 0.115, 0], LEAF_DISC, 0.08);
  card([-0.245, 0.095, 0.01], LEAF_TRI, 0.06);
  card([0.3, 0.105, 0], LEAF_SQ, 0.08);
  card([0.33, 0.09, 0.004], LEAF_TRI, 0.055);

  // ------------------------------------------------------------ singing: beak open
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  return b.root;
}
