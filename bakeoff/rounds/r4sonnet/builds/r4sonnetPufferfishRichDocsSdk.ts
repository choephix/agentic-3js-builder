import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/index";
import {
  catmull,
  countershade,
  createBuilder,
  mottle,
  paint,
  polyline,
  rng,
  spots,
  vec,
} from "../../../../src/index";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed-up pufferfish ball: creamy yellow skin with brown leopard rosettes on top fading to a white belly, " +
    "short spikes all over, a tiny pouting two-part mouth with buck teeth, big worried teal eyes with slanted lids, " +
    "small ray-painted side fins, stubby fan tail, little dorsal and anal fins, and a few bubbles rising from the mouth.",
};

const DEG = Math.PI / 180;

// palette
const YELLOW = "#f6dc80";
const YELLOW_DEEP = "#efc766";
const BROWN = "#7a4322";
const WHITE = "#fcf8ea";
const LIP = "#ee9a78";
const NOSTRIL = "#e0916c";
const MOUTH_DARK = "#4b2420";
const TOOTH = "#fffdf3";
const SCLERA = "#fffbf0";
const IRIS_RING = "#1e6c86";
const IRIS = "#46b8cf";
const PUPIL = "#14202a";
const HILITE = "#ffffff";
const RIM = "#5a3118";
const GILL = "#6b3b1c";
const BUBBLE = "#bfe8f2";
const DROP_C = "#8fd8f0";

const hash01 = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// fin outlines (x = along the fin, y = across it)
const scaleOutline = (pts: number[][], k: number): OutlinePoint[] => pts.map(([x, y]) => [x * k, y * k]);

const PEC_OUT = scaleOutline(
  [
    [0, -0.013],
    [0.025, -0.04],
    [0.055, -0.058],
    [0.082, -0.045],
    [0.092, -0.015],
    [0.092, 0.015],
    [0.082, 0.045],
    [0.055, 0.058],
    [0.025, 0.04],
    [0, 0.013],
  ],
  1.1,
);

const TAIL_OUT = scaleOutline(
  [
    [0, -0.014],
    [0.03, -0.05],
    [0.07, -0.082],
    [0.1, -0.07],
    [0.105, -0.03],
    [0.094, 0],
    [0.105, 0.03],
    [0.1, 0.07],
    [0.07, 0.082],
    [0.03, 0.05],
    [0, 0.014],
  ],
  0.88,
);

const MEDIAN_OUT: OutlinePoint[] = [
  [-0.03, -0.015],
  [0.036, -0.015],
  [0.04, 0.008],
  [0.024, 0.033],
  [0.008, 0.05],
  [-0.008, 0.04],
  [-0.022, 0.02],
];

const DROP_OUT: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.008, 0.002],
  [0.0105, 0.009],
  [0.0085, 0.017],
  [0.0045, 0.025],
  [0, 0.033, "sharp"],
];

// radial-ray paint for fins, rooted at the outline origin
const finPaint = (base: string, ray: string, edge: string, rEdge: number, rays: number) =>
  paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    if (r > rEdge) return edge;
    const ang = Math.atan2(s[1], s[0]);
    return r > 0.018 && Math.abs(Math.sin(ang * rays)) < 0.4 ? ray : base;
  });

export default function build() {
  const b = createBuilder({ name: "pufferfish" });

  const CY = 0.198; // ball centre height: lowest spike tip lands on y = 0
  const RB = 0.165; // ball radius
  const RZ = 0.175; // ball half length
  const C = new THREE.Vector3(0, CY, 0);

  // ---------- paints ----------
  const spotCol = countershade(BROWN, YELLOW, { level: 0.0, soft: 0.5 });
  const upper = spots(mottle(YELLOW, YELLOW_DEEP, { size: 0.12, seed: 4 }), spotCol, {
    size: 0.07,
    amount: 0.46,
    rosette: true,
    seed: 11,
  });
  const SKIN = countershade(upper, WHITE, { level: -0.3, soft: 0.3 });
  const TIP = countershade("#a66a2e", "#d9c7a0", { level: -0.1, soft: 0.5 });
  const SPIKE = paint((_p, _n, s) => (s[1] > 0.7 ? TIP : SKIN));

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, CY, 0], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, CY, 0],
      [0, CY, 0.09],
      [0, CY, 0.165],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    polyline([
      [0, CY, 0],
      [0, CY, -0.09],
      [0, CY, -0.17],
      [0, CY, -0.215],
      [0, CY, -0.3],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- the puffed ball ----------
  const ballRadius = (t: number): [number, number] => {
    const u = 2 * t - 1;
    const k = Math.sqrt(Math.max(0, 1 - u * u));
    const r = Math.max(0.01, RB * k);
    return [r, r];
  };
  const body = b.sweep(
    polyline([
      [0, CY, -RZ],
      [0, CY, RZ],
    ]),
    ballRadius,
    { bone: [tail, hips, spine], color: SKIN, sides: 16, detail: 1.3 },
  );
  const skinSurf = b.surface(body);
  const hitAt = (az: number, el: number) => {
    const h = skinSurf.around(C).at(az, el);
    if (!h) throw new Error(`no surface at ${az}, ${el}`);
    return h;
  };

  const avoid: Array<[THREE.Vector3, number]> = [];

  // ---------- head, mouth ----------
  const MH = hitAt(0, -12);
  const mouthC = vec(MH.at);
  const R0 = new THREE.Vector3(mouthC.x, mouthC.y, mouthC.z + 0.026); // lip ring centre
  avoid.push([mouthC, 0.058]);

  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, CY - 0.015, 0.13],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, R0.y - 0.003, R0.z - 0.02],
    aim: [0, R0.y - 0.003, R0.z + 0.03],
    role: "jaw",
  });

  // muzzle bump
  b.part(new THREE.SphereGeometry(0.042, 10, 8).scale(1, 0.88, 0.75), SKIN, {
    bone: head,
    at: [mouthC.x, mouthC.y, mouthC.z - 0.004],
  });
  // pouting lips: upper half on the head, lower half on the jaw
  b.part(new THREE.TorusGeometry(0.02, 0.0085, 5, 8, Math.PI), LIP, { bone: head, at: R0 });
  b.part(new THREE.TorusGeometry(0.02, 0.0085, 5, 8, Math.PI).rotateZ(Math.PI), LIP, { bone: jaw, at: R0 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0088, 6, 4), LIP, { bone: head, at: [R0.x + s * 0.02, R0.y, R0.z] });
  }
  // dark mouth interior and buck teeth
  b.part(new THREE.CylinderGeometry(0.0215, 0.0215, 0.012, 10), MOUTH_DARK, {
    bone: head,
    at: [R0.x, R0.y, R0.z - 0.002],
    dir: [0, 0, 1],
  });
  b.part(new THREE.BoxGeometry(0.011, 0.0055, 0.006), TOOTH, {
    bone: head,
    at: [R0.x, R0.y + 0.0087, R0.z - 0.002],
  });
  b.part(new THREE.BoxGeometry(0.011, 0.0055, 0.006), TOOTH, {
    bone: jaw,
    at: [R0.x, R0.y - 0.0087, R0.z - 0.002],
  });

  // ---------- bubbles rising from the mouth ----------
  const bubbles: Array<[number, number, number, number]> = [
    [0.004, 0.036, 0.03, 0.0095],
    [-0.008, 0.078, 0.042, 0.0145],
    [0.01, 0.128, 0.05, 0.0205],
    [-0.016, 0.192, 0.056, 0.028],
    [0.01, 0.268, 0.056, 0.036],
  ];
  for (const [dx, dy, dz, r] of bubbles) {
    const c = new THREE.Vector3(R0.x + dx, R0.y + dy, R0.z + dz);
    b.part(new THREE.IcosahedronGeometry(r, 1), BUBBLE, { bone: head, at: c, flat: true });
    b.part(new THREE.IcosahedronGeometry(r * 0.27, 0), HILITE, {
      bone: head,
      at: c.clone().add(new THREE.Vector3(-0.42 * r, 0.45 * r, 0.62 * r)),
      flat: true,
    });
  }

  // ---------- both sides: eyes, nostrils, gills, pectoral fins ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // eye
    const E = hitAt(s * 50, 22);
    const ec = vec(E.at).addScaledVector(vec(E.n), -0.012);
    avoid.push([ec.clone(), 0.078]);
    const gaze = new THREE.Vector3(
      s * Math.sin(40 * DEG) * Math.cos(12 * DEG),
      Math.sin(12 * DEG),
      Math.cos(40 * DEG) * Math.cos(12 * DEG),
    );
    const eye = b.joint(`eye${side}`, { parent: head, at: ec, dir: gaze });
    const along = (k: number) => ec.clone().addScaledVector(gaze, k);

    b.part(new THREE.SphereGeometry(0.056, 12, 9), SCLERA, { bone: eye, at: ec });
    const disc = (r: number, k: number, col: string, seg: number) =>
      b.part(new THREE.SphereGeometry(r, seg, 6).scale(1, 1, 0.4), col, {
        bone: eye,
        at: along(k),
        dir: gaze,
        axis: "z",
      });
    disc(0.031, 0.0475, IRIS_RING, 10);
    disc(0.0235, 0.0535, IRIS, 10);
    disc(0.0125, 0.0605, PUPIL, 8);

    const e1 = new THREE.Vector3(0, 1, 0).addScaledVector(gaze, -gaze.y).normalize();
    const w = new THREE.Vector3(-1, 0, 0);
    w.addScaledVector(gaze, -w.dot(gaze)).normalize(); // viewer's left, across the eye
    b.part(new THREE.SphereGeometry(0.0078, 8, 6), HILITE, {
      bone: eye,
      at: along(0.0625).addScaledVector(e1, 0.012).addScaledVector(w, 0.011),
    });
    b.part(new THREE.SphereGeometry(0.0036, 6, 4), HILITE, {
      bone: eye,
      at: along(0.0605).addScaledVector(e1, -0.011).addScaledVector(w, -0.009),
    });

    // puffy socket ring
    b.part(new THREE.TorusGeometry(0.0545, 0.0075, 5, 16), SKIN, {
      bone: head,
      at: along(0.011),
      dir: gaze,
      axis: "z",
    });

    // worried lid: inner end raised, outer end drooping
    const o = new THREE.Vector3().crossVectors(e1, gaze).multiplyScalar(s).normalize();
    const phi = 28 * DEG;
    const lidAxis = e1
      .clone()
      .multiplyScalar(Math.cos(phi))
      .addScaledVector(o, Math.sin(phi))
      .normalize();
    const lid = b.joint(`lid${side}`, { parent: head, at: ec, dir: lidAxis, role: "hinge" });
    const RL = 0.0585;
    const TH = 50 * DEG;
    b.part(new THREE.SphereGeometry(RL, 12, 4, 0, Math.PI * 2, 0, TH), SKIN, {
      bone: lid,
      at: ec,
      dir: lidAxis,
    });
    b.part(new THREE.TorusGeometry(RL * Math.sin(TH), 0.0042, 4, 16), RIM, {
      bone: lid,
      at: ec.clone().addScaledVector(lidAxis, RL * Math.cos(TH)),
      dir: lidAxis,
      axis: "z",
    });

    // nostril nub
    const N = hitAt(s * 20, 16);
    avoid.push([vec(N.at), 0.03]);
    b.stick(new THREE.CylinderGeometry(0.0055, 0.008, 0.012, 6), NOSTRIL, N, { flat: true, bone: head });

    // gill slit
    const gillHits = [
      [88, 16],
      [84, 6],
      [84, -6],
      [88, -16],
    ].map(([az, el]) => hitAt(s * az, el));
    b.sweep(catmull(gillHits), 0.0035, { color: GILL, sides: 5 });
    avoid.push([vec(hitAt(s * 86, 8).at), 0.034]);
    avoid.push([vec(hitAt(s * 86, -8).at), 0.034]);

    // pectoral fin
    const F = hitAt(s * 98, -8);
    avoid.push([vec(F.at), 0.055]);
    const d = new THREE.Vector3(s * 0.82, 0, -0.57).normalize();
    const finRoot = vec(F.at).addScaledVector(vec(F.n), -0.02);
    const finTip = finRoot.clone().addScaledVector(d, 0.1);
    const fin = b.chain(`pectoral${side}`, polyline([finRoot, finTip]), {
      parent: hips,
      names: [`pectoral${side}`, `pectoralTip${side}`],
      role: "arm",
    });
    b.extrude(PEC_OUT, {
      at: finRoot,
      x: d,
      y: [0, 1, 0],
      thickness: 0.005,
      bevel: 0.0015,
      smoothing: 1,
      color: finPaint("#f7e7a8", "#d9a64d", "#b87636", 0.092, 9),
      bone: fin.joints[0],
    });
  }

  // ---------- sweat drop of alarm ----------
  const SD = hitAt(26, 62);
  avoid.push([vec(SD.at), 0.04]);
  b.lathe(DROP_OUT, {
    at: vec(SD.at).add(new THREE.Vector3(0, -0.002, 0)),
    axis: [0, 1, 0],
    segments: 8,
    color: DROP_C,
    bone: head,
  });

  // ---------- tail: stubby peduncle and fan ----------
  b.sweep(
    polyline([
      [0, CY, -0.15],
      [0, CY, -0.245],
    ]),
    (t: number) => 0.045 - 0.039 * t,
    { bone: tail, color: SKIN, sides: 10 },
  );
  b.extrude(TAIL_OUT, {
    at: [0, CY, -0.215],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.0018,
    smoothing: 1,
    color: finPaint("#f7e5a0", "#d9a04a", "#9c5f2b", 0.097, 11),
    bone: tail.joints[3],
  });
  avoid.push([new THREE.Vector3(0, CY, -RZ), 0.06]);

  // ---------- small dorsal and anal fins ----------
  const medianPaint = finPaint("#f2d37c", "#c98d3c", "#8a5326", 0.04, 7);
  for (const mf of [
    { name: "dorsalFin", el: 45 },
    { name: "analFin", el: -45 },
  ]) {
    const H = hitAt(180, mf.el);
    const n = vec(H.n);
    n.x = 0;
    n.normalize();
    const tb = new THREE.Vector3(0, n.z, -n.y);
    if (tb.z > 0) tb.negate();
    tb.normalize();
    const root = vec(H.at).addScaledVector(n, -0.012);
    const j = b.joint(mf.name, { parent: tail.joints[0], at: root, dir: n, role: "fan" });
    b.extrude(MEDIAN_OUT, {
      at: root,
      x: tb,
      y: n,
      thickness: 0.005,
      bevel: 0.0015,
      smoothing: 1,
      color: medianPaint,
      bone: j,
    });
    avoid.push([vec(H.at), 0.055]);
  }

  // ---------- spikes all over ----------
  const BH = hitAt(0, -90);
  avoid.push([vec(BH.at), 0.03]);
  const spikeHits = skinSurf.scatter(260, {
    rng: rng(7),
    minDist: 0.033,
    filter: (h) => {
      const p = vec(h.at);
      return avoid.every(([c, r]) => p.distanceTo(c) > r);
    },
  });
  spikeHits.forEach((h, i) => {
    b.stick(new THREE.ConeGeometry(0.0105, 0.042, 6, 1), SPIKE, h, {
      embed: 0.2,
      flat: true,
      scale: 0.8 + 0.2 * hash01(i),
    });
  });
  // the spike straight down is the one that touches the floor
  b.stick(new THREE.ConeGeometry(0.0105, 0.042, 6, 1), SPIKE, BH, { embed: 0.2, flat: true });

  return b.root;
}
