import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  spots,
  mottle,
  countershade,
  mix,
  smoothstep,
  catmull,
} from "../../../../src/index";

export const meta = {
  name: "Pufferfish",
  description:
    "A puffed-up, low-poly pufferfish resting on the sand: a spotted ochre ball bristling with brown-tipped spines, big teal googly eyes under heavy lids, a peach beak-mouth with separate jaws, and amber ray-striped fins. Rigged with body, head, jaws, eyes, pectoral fins and a tail chain.",
};

export default function build() {
  const b = createBuilder({ name: "pufferfish", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const clamp = (x: number, a: number, c: number) => Math.min(Math.max(x, a), c);

  // ---- Dimensions -----------------------------------------------------------------------------
  const Y = 0.155; // body axis height
  const ZC = 0.005; // ball centre z
  const R = 0.16; // ball radius
  const SQ = 0.97; // vertical squash
  const Z0 = -0.255;
  const Z1 = 0.165;

  // ---- Palette --------------------------------------------------------------------------------
  const OCHRE = "#e0a33a";
  const OCHRE_DEEP = "#c4842a";
  const SPOT_A = "#4a2c14";
  const SPOT_B = "#6b3f1d";
  const BELLY = "#f7f0dc";
  const BLUSH = "#f2957f";
  const SPINE = "#f4e8c8";
  const SPINE_TIP = "#5a3517";
  const FIN = "#f2c46a";
  const FIN_RAY = "#b8702a";
  const FIN_EDGE = "#fde9b8";
  const LIP = "#f0a585";
  const TOOTH = "#fbf6ea";
  const MOUTH = "#4a1a24";
  const EYE_WHITE = "#fbfaf4";
  const IRIS = "#2fb8a0";
  const PUPIL = "#111418";
  const LID = "#d39532";
  const LASH = "#5a3517";
  const RIM = "#a86a1c";

  // ---- Skeleton -------------------------------------------------------------------------------
  b.joint("body", { at: [0, Y, -0.1], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: "body", at: [0, Y, 0.06], dir: [0, 0, 1], role: "head" });
  b.joint("jawUpper", { parent: head, at: [0, 0.148, 0.15], dir: [0, 0, 1], role: "hinge" });
  b.joint("jaw", { parent: head, at: [0, 0.13, 0.15], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, Y, -0.1],
      [0, Y, -0.155],
      [0, Y, -0.21],
      [0, Y, -0.265],
    ],
    { parent: "body", names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---- Body paint -----------------------------------------------------------------------------
  const back = spots(mottle(OCHRE, OCHRE_DEEP, { size: 0.06, seed: 3 }), [SPOT_A, SPOT_B], {
    size: 0.032,
    amount: 0.45,
    seed: 5,
  });
  const shaded = countershade(back, BELLY, { level: -0.2, soft: 0.25 });
  const blushPts = [V(0.082, 0.122, 0.137), V(-0.082, 0.122, 0.137)];
  const bodyPaint = paint((p, n) => {
    const base = shaded.at(p, n);
    const d = Math.min(...blushPts.map((q) => q.distanceTo(p)));
    return mix(base, BLUSH, smoothstep(0.04, 0.012, d) * 0.75);
  });

  // ---- Body: one puffed ball flowing into the tail peduncle ------------------------------------
  const profile = (z: number) => {
    const ball = Math.sqrt(Math.max(R * R - (z - ZC) ** 2, 0));
    const ped = (0.026 + 0.032 * clamp((z + 0.265) / 0.15, 0, 1)) * (1 - smoothstep(-0.12, -0.05, z));
    const k = 0.035;
    const h = clamp(0.5 + (0.5 * (ball - ped)) / k, 0, 1);
    return ped + (ball - ped) * h + k * h * (1 - h);
  };
  const bodySweep = b.sweep(
    [
      [0, Y, Z0],
      [0, Y, Z1],
    ],
    (t: number) => {
      const r = profile(Z0 + (Z1 - Z0) * t);
      return [r, r * SQ] as const;
    },
    { color: bodyPaint, sides: 16, bone: [tail, "body", "head"], name: "body" },
  );

  const surf = b.surface(bodySweep);
  const around = surf.around([0, Y, ZC]);
  const UP = V(0, 1, 0);

  // ---- Eyes -----------------------------------------------------------------------------------
  const eyeCentres: THREE.Vector3[] = [];
  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";
    const hit = around.at(38 * side, 20)!;
    const n = hit.n;
    const C = hit.at.addScaledVector(n, 0.008);
    eyeCentres.push(C.clone());
    const g = n.clone().add(V(0, 0, 0.35)).normalize();
    const eye = b.joint(`eye${S}`, { parent: head, at: C, dir: g });
    const upG = UP.clone().addScaledVector(g, -UP.dot(g)).normalize();
    const sideG = g.clone().cross(upG).normalize();

    b.part(new THREE.SphereGeometry(0.028, 14, 10), EYE_WHITE, { at: C, bone: eye, name: `eyeball${S}` });
    b.part(new THREE.SphereGeometry(0.0185, 14, 8), IRIS, {
      at: C.clone().addScaledVector(g, 0.0235),
      dir: g,
      axis: "z",
      scale: [1, 1, 0.4],
      bone: eye,
      name: `iris${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0105, 12, 6), PUPIL, {
      at: C.clone().addScaledVector(g, 0.0275),
      dir: g,
      axis: "z",
      scale: [1, 1, 0.4],
      bone: eye,
      name: `pupil${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), "#ffffff", {
      at: C.clone().addScaledVector(g, 0.0305).addScaledVector(upG, 0.008).addScaledVector(sideG, 0.006 * side),
      bone: eye,
      name: `glint${S}`,
    });
    // Socket rim, heavy upper lid and its dark lash line (on the head, so the eyeball can roll beneath).
    b.part(new THREE.TorusGeometry(0.0285, 0.0055, 6, 16), RIM, {
      at: hit.at.addScaledVector(n, 0.004),
      dir: n,
      axis: "z",
      bone: head,
      name: `socket${S}`,
    });
    const lidCap = 0.32 * Math.PI;
    const lidR = 0.0315;
    b.part(new THREE.SphereGeometry(lidR, 16, 6, 0, Math.PI * 2, 0, lidCap), LID, {
      at: C,
      dir: upG,
      bone: head,
      name: `lid${S}`,
    });
    b.part(new THREE.TorusGeometry(lidR * Math.sin(lidCap), 0.003, 5, 18), LASH, {
      at: C.clone().addScaledVector(upG, lidR * Math.cos(lidCap)),
      dir: upG,
      axis: "z",
      bone: head,
      name: `lash${S}`,
    });
    // Nostril bump.
    const nos = around.at(13 * side, 6)!;
    b.stick(new THREE.SphereGeometry(0.0042, 6, 4), SPOT_B, nos, { embed: 0.4, bone: head });
  }

  // ---- Mouth: beak lips, teeth plates, dark gape ----------------------------------------------
  b.part(new THREE.SphereGeometry(0.016, 10, 8), MOUTH, {
    at: [0, 0.139, 0.162],
    scale: [1.4, 1, 0.6],
    bone: head,
    name: "gape",
  });
  b.sweep(
    catmull([
      [-0.024, 0.148, 0.155],
      [0, 0.153, 0.168],
      [0.024, 0.148, 0.155],
    ]),
    (t: number) => 0.0105 * (0.7 + 0.3 * Math.sin(Math.PI * t)),
    { color: LIP, bone: "jawUpper", sides: 10, name: "lipUpper" },
  );
  b.sweep(
    catmull([
      [-0.022, 0.128, 0.153],
      [0, 0.124, 0.165],
      [0.022, 0.128, 0.153],
    ]),
    (t: number) => 0.0105 * (0.7 + 0.3 * Math.sin(Math.PI * t)),
    { color: LIP, bone: "jaw", sides: 10, name: "lipLower" },
  );
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.0135, 0.0075, 0.009), TOOTH, {
      at: [0.0075 * sx, 0.1425, 0.171],
      bone: "jawUpper",
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.0125, 0.0065, 0.009), TOOTH, {
      at: [0.007 * sx, 0.1345, 0.169],
      bone: "jaw",
      flat: true,
    });
  }

  // ---- Fins -----------------------------------------------------------------------------------
  const finPaint = (rays: number, len: number) =>
    paint((_p, _n, s) => {
      const a = Math.atan2(s[1], s[0]);
      const r = Math.hypot(s[0], s[1]) / len;
      const ray = Math.pow(0.5 + 0.5 * Math.cos(a * rays), 5);
      const base = mix(FIN, FIN_EDGE, smoothstep(0.62, 0.98, r));
      return mix(base, FIN_RAY, ray * 0.85 * smoothstep(0.08, 0.3, r) * (1 - 0.5 * smoothstep(0.8, 1, r)));
    });

  // Pectoral fins, spread out to the sides.
  const finRoots: THREE.Vector3[] = [];
  const pecOutline: Array<[number, number]> = [
    [0, -0.012],
    [0.03, -0.03],
    [0.055, -0.031],
    [0.066, -0.012],
    [0.068, 0.006],
    [0.061, 0.025],
    [0.036, 0.033],
    [0, 0.014],
  ];
  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";
    const hit = around.at(80 * side, -6)!;
    finRoots.push(hit.at);
    const out = V(side, 0.05, -0.55).normalize();
    const fin = b.joint(`fin${S}`, { parent: "body", at: hit.at, dir: out, role: "fan" });
    b.extrude(pecOutline, {
      at: hit.at.addScaledVector(hit.n, -0.006),
      x: out,
      y: [0, 1, 0],
      thickness: 0.0045,
      bevel: 0.0015,
      smoothing: 1,
      color: finPaint(22, 0.068),
      bone: fin,
      name: `pectoral${S}`,
    });
    // Gill slit just ahead of the fin.
    const g0 = around.at(71 * side, 7)!;
    const g1 = around.at(69 * side, -15)!;
    b.capsule(g0.at.addScaledVector(g0.n, 0.0012), g1.at.addScaledVector(g1.n, 0.0012), 0.0027, {
      color: SPOT_B,
      bone: "body",
      sides: 6,
      name: `gill${S}`,
    });
  }

  // Caudal fin: a rounded fan.
  b.extrude(
    [
      [0, -0.018],
      [0.03, -0.04],
      [0.06, -0.052],
      [0.08, -0.045],
      [0.09, -0.022],
      [0.092, 0],
      [0.09, 0.022],
      [0.08, 0.045],
      [0.06, 0.052],
      [0.03, 0.04],
      [0, 0.018],
    ],
    {
      at: "tailTip" ? tail.joints[3].at : [0, Y, -0.265],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.005,
      bevel: 0.0015,
      smoothing: 1,
      color: finPaint(26, 0.092),
      bone: "tailTip",
      name: "caudal",
    },
  );

  // Dorsal and anal fins, swept back along the peduncle.
  const dorsalHit = surf.ray([0, 0.6, -0.105], [0, -1, 0])!;
  b.extrude(
    [
      [-0.004, -0.016],
      [0.056, -0.016],
      [0.062, 0.008],
      [0.05, 0.035],
      [0.025, 0.046],
      [0.006, 0.032],
    ],
    {
      at: dorsalHit.at,
      x: V(0, -1.1, -1).normalize(),
      y: [0, 1, 0],
      thickness: 0.0045,
      bevel: 0.0015,
      smoothing: 1,
      color: finPaint(20, 0.06),
      bone: "tail1",
      name: "dorsal",
    },
  );
  const analHit = surf.ray([0, -0.3, -0.105], [0, 1, 0])!;
  b.extrude(
    [
      [-0.004, -0.014],
      [0.05, -0.014],
      [0.055, 0.006],
      [0.044, 0.025],
      [0.022, 0.032],
      [0.006, 0.022],
    ],
    {
      at: analHit.at,
      x: V(0, 1.1, -1).normalize(),
      y: [0, -1, 0],
      thickness: 0.0045,
      bevel: 0.0015,
      smoothing: 1,
      color: finPaint(20, 0.055),
      bone: "tail1",
      name: "anal",
    },
  );

  // ---- Spines: a bristling coat, brown-tipped, leaning back ------------------------------------
  const spinePaint = paint((p) => {
    const d = Math.hypot(p.x, (p.y - Y) / SQ, p.z - ZC);
    return mix(SPINE, SPINE_TIP, smoothstep(R + 0.006, R + 0.03, d));
  });
  const cone = new THREE.ConeGeometry(1, 1, 4, 1);
  cone.translate(0, 0.5, 0);
  const mouthC = V(0, 0.14, 0.165);
  const random = rng(42);
  const hits = surf.scatter(200, {
    rng: rng(7),
    minDist: 0.024,
    keepOut: (p) =>
      p.z < -0.09 ||
      p.distanceTo(mouthC) < 0.06 ||
      eyeCentres.some((c) => c.distanceTo(p) < 0.052) ||
      finRoots.some((c) => c.distanceTo(p) < 0.038),
    filter: (hit) => hit.n.y > -0.45,
  });
  hits.forEach((hit, i) => {
    const n = hit.n;
    const dir = n.clone().add(V(0, 0, -0.35)).normalize();
    const len = 0.028 + 0.018 * random();
    const w = 0.0055 + 0.0015 * random();
    b.part(cone, spinePaint, {
      at: hit.at.addScaledVector(dir, -0.005),
      frame: hit,
      dir,
      scale: [w, len, w],
      flat: true,
      name: `spine${i + 1}`,
    });
  });

  return b.root;
}
