```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  mix,
  smoothstep,
  cells,
  noise,
  grain,
  mottle,
  svg,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized keel-billed toucan perched on a short mossy branch, wings spread to show off its rainbow beak, with a pink orchid blooming beside it.",
};

export default function build() {
  const b = createBuilder({ name: "toucan", paintSize: 2048 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------- palette ----------------
  const LIME = "#9ed42c";
  const SKY = "#38b6f0";
  const ORANGE = "#ff8a1c";
  const CHERRY = "#d4102e";
  const BEAKLINE = "#1d1d1d";
  const SCARLET = "#e3202b";
  const FEATHER_LINE = "#2c3446";
  const THIGH = "#141519";

  // ---------------- paints ----------------
  const blackP = paint((p, n) => {
    const c = cells(p, 0.016, 4);
    const base = mix("#0f1015", "#2e374b", smoothstep(0.45, 1, n.y) * 0.85);
    return c.d2 - c.d1 < 0.07 ? mix(base, "#000000", 0.5) : base;
  });
  const yellowP = paint((p) => mix("#ffcf1a", "#ffec52", smoothstep(0.2, 0.3, p.y)));

  const bodyPaint = paint((p, n) => {
    if (p.z < -0.045 && p.y < 0.15 && n.y < 0.1) return SCARLET;
    const edge = 0.198 + 9 * p.x * p.x;
    if (n.z > -0.05 && p.z > -0.01 && p.y > edge + 0.007) return yellowP;
    if (n.z > -0.05 && p.z > -0.01 && p.y > edge) return "#d81f2a";
    return blackP;
  });

  const headPaint = paint((p, n) => {
    if (n.z > -0.25 && n.y < 0.05) return yellowP;
    if (n.z < -0.3 && n.y > -0.2 && n.y < 0.7) return mix("#141317", "#5c1b29", 0.8);
    return blackP;
  });

  const tailPaint = paint((p) => {
    const f = (((p.x / 0.012) % 1) + 1) % 1;
    if (Math.abs(f - 0.5) > 0.44) return FEATHER_LINE;
    return blackP;
  });

  const wingPaint = paint((p, n, s) => {
    const along = s[0];
    const across = s[1];
    if (across > 0.42 && ((along * 11) % 1) < 0.09) return FEATHER_LINE;
    const sc = 0.36 + 0.025 * Math.sin(along * Math.PI * 18);
    if (Math.abs(across - sc) < 0.02) return FEATHER_LINE;
    return blackP;
  });

  const legPaint = paint((p) => ((((p.y / 0.0055) % 1) + 1) % 1 < 0.18 ? "#1d5fc4" : "#2f8cf2"));
  const toePaint = paint((p, n, s) => (((s[0] * 4) % 1) < 0.16 ? "#1d5fc4" : "#2f8cf2"));

  const lin = (xs: number[], ys: number[], x: number) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++)
      if (x <= xs[i]) {
        const f = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
        return ys[i - 1] + (ys[i] - ys[i - 1]) * f;
      }
    return ys[ys.length - 1];
  };
  const UZ = [0.095, 0.15, 0.2, 0.242, 0.268];
  const UY = [0.318, 0.322, 0.315, 0.3, 0.282];
  const UH = [0.026, 0.025, 0.02, 0.013, 0.005];
  const upperPaint = paint((p) => {
    const zt = (p.z - 0.095) / 0.173;
    const hn = (p.y - lin(UZ, UY, p.z)) / Math.max(lin(UZ, UH, p.z), 0.004);
    if (zt < 0.035) return BEAKLINE;
    if (zt > 0.84 - 0.1 * hn) return CHERRY;
    if (hn < -0.75 && zt > 0.1 && zt < 0.8 && (((p.z * 90) % 1) + 1) % 1 < 0.3) return "#2a2a2a";
    if (zt < 0.2) return LIME;
    if (hn > 0.5 - 0.3 * zt) return LIME;
    if (zt > 0.55 + 0.25 * hn) return SKY;
    return ORANGE;
  });
  const lowerPaint = paint((p) => {
    const zt = (p.z - 0.098) / 0.158;
    if (zt < 0.035) return BEAKLINE;
    if (zt > 0.8) return CHERRY;
    if (zt < 0.2) return LIME;
    return mix(SKY, "#2a9be0", smoothstep(0.3, 0.8, zt));
  });

  const moss = mottle("#5f8f2a", "#8bb93a", { size: 0.015, seed: 2 });
  const bark = grain("#6b4a2e", "#4a311d", { size: 0.008, axis: "x" });
  const barkPaint = paint((p, n) => {
    const m = noise(p, 0.03, 3);
    if (n.y > 0.3 && m > 0.62 - (n.y - 0.3) * 0.5) return moss;
    const c = cells(p, 0.02, 9);
    if (c.d1 < 0.13 && c.id < 0.3) return "#b9c99a";
    return bark;
  });

  // ---------------- skeleton ----------------
  b.joint("root", { at: [0, 0.034, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.15, -0.04], dir: [0, 1, 0.9] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.15, -0.04],
      [0, 0.205, 0.005],
      [0, 0.255, 0.04],
    ],
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.255, 0.04],
      [0, 0.3, 0.062],
    ],
    { parent: "chest", names: ["neck"], role: "neck" },
  );
  b.joint("head", { parent: "neck", at: [0, 0.312, 0.066], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.289, 0.098], aim: [0, 0.276, 0.256], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.13, -0.07],
      [0, 0.105, -0.13],
      [0, 0.08, -0.19],
      [0, 0.06, -0.245],
    ],
    { parent: "hips", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------------- body ----------------
  b.loft(
    [
      { at: [0, 0.125, -0.075], w: 0.05, h: 0.04 },
      { at: [0, 0.15, -0.04], w: 0.1, h: 0.105 },
      { at: [0, 0.2, 0.005], w: 0.118, h: 0.122 },
      { at: [0, 0.25, 0.04], w: 0.094, h: 0.09 },
      { at: [0, 0.29, 0.058], w: 0.062, h: 0.06 },
    ],
    { color: bodyPaint, bone: [spine, neck], sides: 12, name: "body" },
  );

  const headPart = b.part(new THREE.SphereGeometry(0.047, 12, 9), headPaint, {
    at: [0, 0.312, 0.066],
    bone: "head",
    scale: [0.9, 1, 1.08],
    name: "head",
  });

  // tail + scarlet undertail coverts
  b.sweep(tail, (t: number): [number, number] => [0.02 + 0.016 * t, 0.0065], {
    section: "box",
    color: tailPaint,
    caps: "flat",
    name: "tail",
  });
  b.capsule([0, 0.122, -0.06], [0, 0.104, -0.115], [0.022, 0.012], {
    color: SCARLET,
    bone: "tail1",
    name: "undertail",
  });

  // ---------------- beak ----------------
  b.loft(
    UZ.map((z, i) => ({ at: [0, UY[i], z], w: [0.042, 0.036, 0.027, 0.017, 0.006][i], h: UH[i] * 2 })),
    { color: upperPaint, bone: "head", sides: 10, name: "beakUpper" },
  );
  b.loft(
    [
      { at: [0, 0.287, 0.098], w: 0.038, h: 0.026 },
      { at: [0, 0.285, 0.15], w: 0.031, h: 0.022 },
      { at: [0, 0.287, 0.2], w: 0.022, h: 0.016 },
      { at: [0, 0.281, 0.238], w: 0.012, h: 0.01 },
      { at: [0, 0.276, 0.256], w: 0.004, h: 0.004 },
    ],
    { color: lowerPaint, bone: "jaw", sides: 10, name: "beakLower" },
  );

  // ---------------- eyes ----------------
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hit =
      headSurf.ray([0.3 * s, 0.319, 0.08], [-s, 0, 0]) ?? headSurf.nearest([0.05 * s, 0.319, 0.08]);
    b.stick(new THREE.CylinderGeometry(0.023, 0.024, 0.005, 12), "#5fa52a", hit, {
      embed: 0.4,
      bone: "head",
      name: "eyeRim" + S,
    });
    b.stick(new THREE.CylinderGeometry(0.019, 0.02, 0.006, 12), "#93d43b", hit, {
      embed: 0.2,
      bone: "head",
      name: "eyeSkin" + S,
    });
    b.stick(new THREE.SphereGeometry(0.0085, 10, 8), "#1a120d", hit, {
      embed: 0.3,
      bone: "head",
      name: "eye" + S,
    });
    const n = hit.n;
    const hl = hit.at.addScaledVector(n, 0.0125).add(V(0, 0.0035, 0.002));
    b.part(new THREE.SphereGeometry(0.0022, 6, 4), "#ffffff", { at: hl, bone: "head", name: "eyeShine" + S });
  }

  // ---------------- legs & feet ----------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = 0.028 * s;
    const leg = b.chain(
      "leg" + S,
      [
        [x, 0.14, -0.005],
        [x * 1.1, 0.108, 0.016],
        [x * 1.15, 0.074, 0.002],
      ],
      {
        parent: "hips",
        names: ["hip" + S, "knee" + S, "ankle" + S],
        role: "leg",
        contact: [x * 1.15, 0.068, 0.002],
      },
    );
    b.sweep(leg, [0.011, 0.0065, 0.0055], {
      bands: [[0.42, THIGH] as const, [1, legPaint] as const],
      sides: 7,
      name: "leg" + S,
    });
    const ankle = leg.joints[2];
    const A = ankle.at;
    const toes: Array<[number, number]> = [
      [-0.007, 1],
      [0.007, 1],
      [-0.006, -1],
      [0.006, -1],
    ];
    toes.forEach(([dx, fwd], i) => {
      const path = catmull([
        A,
        V(A.x + dx, 0.069, 0.019 * fwd + 0.002),
        V(A.x + dx * 1.5, 0.055, 0.034 * fwd + 0.002),
      ]);
      const { chain } = b.sprout(`toe${i + 1}${S}`, ankle, path, [0.0048, 0.0036], {
        count: 1,
        role: "digit",
        color: toePaint,
        sides: 6,
      });
      b.spike(path.at(1), path.tangentAt(1), 0.008, 0.003, {
        color: "#1e2128",
        bone: chain!.joints[0],
        sides: 5,
        name: `claw${i + 1}${S}`,
      });
    });
  }

  // ---------------- wings (spread, showing off) ----------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      "wing" + S,
      [
        [0.045 * s, 0.245, 0.005],
        [0.1 * s, 0.262, -0.008],
        [0.16 * s, 0.27, -0.018],
        [0.215 * s, 0.265, -0.03],
      ],
      { parent: "spine2", names: ["shoulder" + S, "elbow" + S, "wrist" + S, "wingTip" + S], role: "wing" },
    );
    b.sweep(wing, [0.013, 0.01, 0.007, 0.004], { color: blackP, sides: 8, name: "wingArm" + S });
    b.membrane(
      wing,
      [
        [0.04 * s, 0.205, -0.05],
        [0.1 * s, 0.208, -0.1],
        [0.16 * s, 0.222, -0.112],
        [0.222 * s, 0.246, -0.085],
      ],
      { color: wingPaint, thickness: 0.009, scallop: 0.08, name: "wing" + S },
    );
    // primary feathers fanning from the hand
    const R0 = V(0.145 * s, 0.258, -0.05);
    const R1 = V(0.21 * s, 0.255, -0.05);
    for (let k = 0; k < 5; k++) {
      const f = k / 4;
      const root = R0.clone().lerp(R1, f);
      root.y -= 0.004 + 0.0015 * k;
      const dir = V((0.25 + 0.75 * f) * s, -0.02, -(1 - 0.7 * f)).normalize();
      const len = 0.078 - 0.008 * f;
      const perp = V(0, 1, 0).cross(dir).normalize();
      const at = (a: number, w: number) => root.clone().addScaledVector(dir, len * a).addScaledVector(perp, w);
      b.slab([at(0, 0.008), at(0.55, 0.012), at(0.88, 0.009), at(1, 0), at(0.88, -0.009), at(0.55, -0.012), at(0, -0.008)], {
        color: k % 2 ? "#14161c" : "#1c212c",
        thickness: 0.004,
        bone: "wingTip" + S,
        name: `primary${k + 1}${S}`,
      });
    }
  }

  // ---------------- branch ----------------
  const branchPath = catmull([
    [-0.25, 0.034, 0.012],
    [-0.08, 0.034, -0.006],
    [0.08, 0.034, 0.004],
    [0.26, 0.034, -0.012],
  ]);
  const branch = b.sweep(branchPath, 0.034, {
    color: barkPaint,
    bone: "root",
    caps: "flat",
    sides: 10,
    up: [0, 1, 0],
    name: "branch",
  });
  for (const t of [0, 1]) {
    const end = branchPath.at(t);
    const tan = branchPath.tangentAt(t, t === 1);
    if (t === 0) tan.negate();
    const cz = end.z;
    const rings = paint((p) => {
      const d = Math.hypot(p.y - 0.034, p.z - cz);
      if (d > 0.029) return "#4a311d";
      return Math.sin(d * 700 + noise(p, 0.01, 5) * 4) > 0.6 ? "#a0703f" : "#cfa676";
    });
    b.part(new THREE.CylinderGeometry(0.0345, 0.0345, 0.003, 10), rings, {
      at: end.clone().addScaledVector(tan, 0.0015),
      dir: tan,
      bone: "root",
      name: t ? "branchEndR" : "branchEndL",
    });
  }

  // side twig with two leaves
  b.sweep(
    catmull([
      [-0.165, 0.05, 0.0],
      [-0.185, 0.09, -0.012],
      [-0.205, 0.128, -0.03],
    ]),
    [0.012, 0.005],
    { color: barkPaint, bone: "root", caps: { start: "flat", end: "round" }, name: "twig" },
  );
  const leafPaint = paint((p, n, s) =>
    Math.abs(s[1]) < 0.0012 ? "#a6d060" : mix("#2f7a32", "#57a844", s[0] / 0.06),
  );
  const LEAF = [
    [0, 0, "sharp"],
    [0.01, 0.008],
    [0.03, 0.011],
    [0.05, 0.007],
    [0.062, 0, "sharp"],
    [0.05, -0.007],
    [0.03, -0.011],
    [0.01, -0.008],
  ];
  for (const d of [V(-0.6, 0.55, 0.45), V(-0.15, 0.7, -0.7)]) {
    d.normalize();
    b.extrude(LEAF, {
      color: leafPaint,
      at: [-0.205, 0.128, -0.03],
      x: d,
      y: d.clone().cross(V(0, 1, 0)),
      thickness: 0.003,
      smoothing: 1,
      bone: "root",
      name: "twigLeaf",
    });
  }

  // moss: blocky clumps and tufted cards
  const branchSurf = b.surface(branch);
  const nearFeet = (p: THREE.Vector3) =>
    Math.abs(Math.abs(p.x) - 0.032) < 0.022 || (p.x > 0.13 && p.x < 0.19 && p.z > -0.015);
  const clumps = branchSurf.scatter(12, {
    rng: rng(12),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.6,
    keepOut: nearFeet,
  });
  clumps.forEach((hit, i) => {
    b.stick(new THREE.IcosahedronGeometry(0.011, 0), i % 2 ? "#6f9a2e" : "#8ab83b", hit, {
      scale: [1, 0.55, 1],
      embed: 0.4,
      flat: true,
      spin: i * 37,
      bone: "root",
      name: "mossClump",
    });
  });
  const mossTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-width="5">
      <path d="M32 64 Q30 40 18 20" stroke="#5b8a28"/>
      <path d="M32 64 Q34 38 46 18" stroke="#6e9e2f"/>
      <path d="M32 64 Q31 36 32 10" stroke="#8bbf3a"/>
      <path d="M30 64 Q22 48 8 40" stroke="#a6cf4a"/>
      <path d="M34 64 Q44 50 58 42" stroke="#7cae33"/></g>
      <g fill="#cde56c"><circle cx="18" cy="20" r="4"/><circle cx="46" cy="18" r="4"/><circle cx="32" cy="10" r="4"/><circle cx="8" cy="40" r="3.5"/><circle cx="58" cy="42" r="3.5"/></g></svg>`,
    { size: 128 },
  );
  const tufts = branchSurf.scatter(40, {
    rng: rng(11),
    minDist: 0.012,
    filter: (h) => h.n.y > 0.5,
    keepOut: nearFeet,
  });
  b.cards(tufts, mossTex, {
    size: [0.024, 0.02],
    lean: 20,
    cross: true,
    vary: 0.35,
    spin: 180,
    rng: rng(3),
    bone: "root",
    name: "mossTufts",
  });

  // ---------------- orchid ----------------
  const F = V(0.15, 0.35, 1).normalize();
  const C = V(0.17, 0.15, 0.075);
  const U = V(0, 1, 0).addScaledVector(F, -F.y).normalize();
  b.sweep(
    catmull([V(0.155, 0.064, 0.012), V(0.165, 0.105, 0.03), V(0.17, 0.135, 0.058), C.clone().addScaledVector(F, -0.006)]),
    0.0025,
    { color: "#5d8a3a", bone: "root", sides: 6, name: "orchidStem" },
  );
  b.rod([0.168, 0.128, 0.05], [0.19, 0.158, 0.045], 0.0016, { color: "#5d8a3a", bone: "root", sides: 5 });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), "#f27fb6", {
    at: [0.192, 0.163, 0.045],
    bone: "root",
    scale: [1, 1.3, 1],
    name: "orchidBud",
  });

  const ORCHID_LEAF = [
    [0, 0, "sharp"],
    [0.015, 0.017],
    [0.05, 0.02],
    [0.08, 0.012],
    [0.09, 0, "sharp"],
    [0.08, -0.012],
    [0.05, -0.02],
    [0.015, -0.017],
  ];
  const orchidLeafPaint = paint((p, n, s) =>
    Math.abs(s[1]) < 0.0015 ? "#7fbf4f" : mix("#2e6e2c", "#4f9a3c", smoothstep(0, 0.09, s[0])),
  );
  for (const d of [V(0.35, -0.22, 1), V(0.7, -0.18, -0.7)]) {
    d.normalize();
    b.extrude(ORCHID_LEAF, {
      color: orchidLeafPaint,
      at: [0.155, 0.068, 0.006],
      x: d,
      y: d.clone().cross(V(0, 1, 0)),
      thickness: 0.003,
      smoothing: 1,
      bone: "root",
      name: "orchidLeaf",
    });
  }

  const petalPaint = (inner: string, outer: string) =>
    paint((p, n, s) => {
      const d = Math.hypot(s[0], s[1]);
      const a = Math.atan2(s[1], s[0]);
      const base = mix(inner, outer, smoothstep(0.004, 0.032, d));
      return Math.abs(Math.sin(a * 16)) < 0.18 && d > 0.008 ? mix(base, "#c2186b", 0.35) : base;
    });
  const PETAL = [
    [0, 0],
    [0.008, 0.012],
    [0.022, 0.019],
    [0.035, 0.014],
    [0.041, 0],
    [0.035, -0.014],
    [0.022, -0.019],
    [0.008, -0.012],
  ];
  const SEPAL = [
    [0, 0],
    [0.01, 0.006],
    [0.024, 0.009],
    [0.036, 0.006],
    [0.04, 0],
    [0.036, -0.006],
    [0.024, -0.009],
    [0.01, -0.006],
  ];
  const LIP = [
    [0, 0],
    [0.006, 0.008],
    [0.016, 0.009],
    [0.022, 0.004],
    [0.027, 0.007, "sharp"],
    [0.025, 0],
    [0.027, -0.007, "sharp"],
    [0.022, -0.004],
    [0.016, -0.009],
    [0.006, -0.008],
  ];
  const lipPaint = paint((p, n, s) =>
    s[0] < 0.009 ? mix("#ffd84a", "#ff9a3a", s[0] / 0.009) : mix("#c0167a", "#8a0d55", smoothstep(0.012, 0.027, s[0])),
  );
  const flower = (deg: number, outline: (string | number)[][], color: ReturnType<typeof paint>, lift: number) => {
    const dir = U.clone().applyAxisAngle(F, (deg * Math.PI) / 180);
    b.extrude(outline, {
      color,
      at: C.clone().addScaledVector(F, lift),
      x: dir,
      y: F.clone().cross(dir),
      thickness: 0.0025,
      smoothing: 1,
      bone: "root",
      name: "orchidPetal",
    });
  };
  const sepalP = petalPaint("#fff4f9", "#f36aa8");
  const petalP = petalPaint("#fff0f7", "#ec4594");
  for (const a of [0, 130, 230]) flower(a, SEPAL, sepalP, 0);
  for (const a of [72, 288]) flower(a, PETAL, petalP, 0.0025);
  flower(180, LIP, lipPaint, 0.005);
  b.capsule(C.clone().addScaledVector(F, 0.003), C.clone().addScaledVector(F, 0.011).addScaledVector(U, 0.004), 0.0033, {
    color: "#fff5f8",
    bone: "root",
    sides: 6,
    name: "orchidColumn",
  });
  b.part(new THREE.SphereGeometry(0.0022, 6, 4), "#ffd23a", {
    at: C.clone().addScaledVector(F, 0.013).addScaledVector(U, 0.0055),
    bone: "root",
    name: "orchidAnther",
  });

  // ---------------- materials ----------------
  b.ctx.paintMaterial().roughness = 0.45;
  b.material("#ffffff").roughness = 0.2;
  b.material("#1a120d").roughness = 0.15;

  return b.root;
}
```