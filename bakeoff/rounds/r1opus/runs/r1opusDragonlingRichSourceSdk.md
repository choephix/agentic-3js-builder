```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  smoothstep,
  scales,
  stripes,
  spots,
  mottle,
  catmull,
  interpolate,
  frame,
} from "agentic-3js-builder";

export const meta = {
  name: "Hatchling Dragon",
  description:
    "A cat-sized baby dragon standing proudly beside its broken speckled egg: teal scales over a buttery belly, soft orange spines, stubby horns, oversized amber-membraned wings, a spade-tipped tail, big amber eyes, a toothy grin and a curl of smoke from one nostril.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "babyDragon", paintSize: 2048 });
  const R = rng(11);

  // ---------------------------------------------------------------- paints
  const TEAL = scales(["#2fae9e", "#27a091", "#38bba8"], "#1b7a70", { size: 0.02, width: 0.16, seed: 3 });
  const BELLY = stripes("#ffe8a6", "#f1cd78", { size: 0.024, axis: "z", width: 0.2, wobble: 0.08, seed: 2 });
  const THROAT = stripes("#ffe8a6", "#f1cd78", { size: 0.02, axis: "y", width: 0.2, wobble: 0.08, seed: 4 });
  const skin = paint((p, n) => {
    let bel = smoothstep(-0.05, -0.5, n.y);
    const throat = p.y > 0.24 && p.y < 0.37 && p.z > 0.11 && Math.abs(p.x) < 0.07;
    if (throat) bel = Math.max(bel, smoothstep(0.15, 0.6, n.z) * (1 - smoothstep(0.34, 0.37, p.y)));
    if (bel <= 0.001) return TEAL;
    return mix(TEAL.at(p, n), (throat ? THROAT : BELLY).at(p, n), bel);
  });
  const SPINE = paint((p, n, s) => mix("#e8641c", "#ffc58a", smoothstep(0, 0.03, s[1])));
  const WING = paint((p, n, s) => {
    const across = Math.abs(s[1] - 0.5) * 2;
    const c = mix("#ffcf73", "#e0701c", across * across * 0.75 + (1 - s[0]) * 0.3);
    const vein = Math.abs(s[1] - 0.5) < 0.025 && s[0] < 0.85;
    return vein ? mix(c, "#b8521a", 0.5) : c;
  });
  const HORN = paint((p, n, s) => {
    const c = mix("#f7ecd2", "#b98a52", s[0]);
    const ridge = Math.sin(s[0] * Math.PI * 7) > 0.55;
    return ridge ? ([c[0] * 0.84, c[1] * 0.84, c[2] * 0.84] as [number, number, number]) : c;
  });
  const CLAW = "#f4e7c8";
  const FINGER = "#1f8579";
  const DARK = "#173b38";

  const shellOuter = spots(mottle("#f6efdc", "#e8dcc0", { size: 0.03, seed: 2 }), ["#7b4a2b", "#a5643a", "#56663f"], {
    size: 0.016,
    amount: 0.32,
    seed: 5,
  });
  const shellPaint = (c: THREE.Vector3) =>
    paint((p, n) => (n.dot(p.clone().sub(c)) < 0 ? "#fff3da" : shellOuter));

  // ---------------------------------------------------------------- skeleton
  const P = [
    V(0, 0.045, -0.52),
    V(0, 0.032, -0.43),
    V(0, 0.065, -0.33),
    V(0, 0.11, -0.23),
    V(0, 0.155, -0.14),
    V(0, 0.18, -0.05),
    V(0, 0.2, 0.04),
    V(0, 0.235, 0.11),
  ];
  b.joint("root", { at: P[5] });
  const spine = b.chain("spine", catmull([P[5], P[6], P[7]]), {
    parent: "root",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const tail = b.chain("tail", catmull([P[4], P[3], P[2], P[1], P[0]]), {
    parent: "root",
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });
  const neck = b.chain("neck", catmull([V(0, 0.235, 0.11), V(0, 0.3, 0.15), V(0, 0.355, 0.165)]), {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { parent: "neck2", at: [0, 0.37, 0.175], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.355, 0.19], dir: [0, 0, 1], role: "jaw" });
  b.joint("egg", { parent: "root", at: [-0.3, 0, 0.17] });

  // ---------------------------------------------------------------- body + tail
  const bodyPath = catmull(P);
  const kts = bodyPath.knots;
  const RX = [0.012, 0.02, 0.029, 0.042, 0.062, 0.085, 0.09, 0.072];
  const RY = [0.012, 0.019, 0.027, 0.04, 0.058, 0.08, 0.088, 0.072];
  const SAG = [0, 0, 0, 0, 0.3, 1, 0.8, 0];
  const body = b.sweep(
    bodyPath,
    (t: number): [number, number] => [interpolate(kts, RX, t), interpolate(kts, RY, t)],
    {
      color: skin,
      bone: [tail, spine],
      sides: 14,
      shift: (t: number): [number, number] => [0, -0.012 * interpolate(kts, SAG, t)],
      name: "body",
    },
  );
  const neckSweep = b.sweep(neck, [0.056, 0.045, 0.038], { color: skin, sides: 12, name: "neck" });

  // Tail spade
  b.extrude(
    [
      [0, -0.008],
      [0.013, 0],
      [0.032, 0.012],
      [0.024, 0.034],
      [0, 0.064, "sharp"],
      [-0.024, 0.034],
      [-0.032, 0.012],
      [-0.013, 0],
    ],
    {
      color: SPINE,
      at: [0, 0.046, -0.51],
      x: [1, 0, 0],
      y: [0, 0.3, -1],
      thickness: 0.009,
      bevel: 0.002,
      smoothing: 1,
      bone: "tail4",
      name: "tailSpade",
    },
  );

  // Soft dorsal spines
  const finOutline = (h: number) => [
    [0.5 * h, -0.25 * h],
    [-0.45 * h, -0.25 * h],
    [-0.5 * h, 0.5 * h],
    [-0.32 * h, h],
    [0.1 * h, 0.45 * h],
  ];
  const fin = (at: any, x: THREE.Vector3, y: THREE.Vector3, h: number, bone?: string) =>
    b.extrude(finOutline(h), {
      color: SPINE,
      at,
      x,
      y,
      thickness: [0.4 * h, 0.12 * h],
      smoothing: 2,
      bevel: 0.0015,
      ...(bone ? { bone } : {}),
    });
  b.along(
    body,
    16,
    (pt) => {
      const k = Math.min(1, Math.max(0, (pt.t - 0.05) / 0.88));
      const h = 0.009 + 0.024 * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.15)), 0.7);
      fin(pt, pt.tangent, pt.n, Math.max(h, 0.009));
    },
    { from: 0.08, to: 0.95 },
  );
  b.along(
    neckSweep,
    4,
    (pt) => fin(pt, pt.tangent, pt.n, 0.022 - pt.t * 0.008),
    { from: 0.12, to: 0.88 },
  );

  // ---------------------------------------------------------------- legs
  const paw = (s: number, bone: string, c: [number, number, number], size: [number, number, number]) => {
    b.part(new THREE.SphereGeometry(1, 12, 8), skin, { at: c, bone, scale: size });
    for (let k = -1; k <= 1; k++)
      b.spike(
        [c[0] + k * 0.014, 0.014, c[2] + size[2] * 0.8 - Math.abs(k) * 0.006],
        [k * 0.15, -0.35, 1],
        0.015,
        0.0045,
        { color: CLAW, bone, sides: 6 },
      );
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const front = b.chain(
      `frontLeg${S}`,
      catmull([V(s * 0.06, 0.19, 0.1), V(s * 0.085, 0.1, 0.078), V(s * 0.085, 0.032, 0.112)]),
      { parent: "spine2", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "leg", contact: [s * 0.085, 0, 0.122] },
    );
    b.sweep(front, [0.036, 0.026, 0.021], { color: skin, sides: 10 });
    paw(s, `wrist${S}`, [s * 0.085, 0.02, 0.122], [0.03, 0.021, 0.037]);

    const hind = b.chain(
      `hindLeg${S}`,
      catmull([V(s * 0.072, 0.16, -0.07), V(s * 0.1, 0.088, -0.005), V(s * 0.097, 0.032, -0.05)]),
      { parent: "root", names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.098, 0, -0.028] },
    );
    b.sweep(hind, [0.056, 0.034, 0.024], { color: skin, sides: 10 });
    paw(s, `ankle${S}`, [s * 0.098, 0.021, -0.028], [0.034, 0.022, 0.046]);
  }

  // ---------------------------------------------------------------- wings
  const membranes: THREE.Mesh[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.05, 0.25, 0.05);
    const el = V(s * 0.15, 0.31, 0.0);
    const wr = V(s * 0.25, 0.345, 0.02);
    const arm = b.chain(`wing${S}`, catmull([sh, el, wr]), {
      parent: "spine2",
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(arm, [0.02, 0.014, 0.011], { color: skin, sides: 10 });
    const tips: Array<[THREE.Vector3, THREE.Vector3]> = [
      [V(s * 0.31, 0.42, 0.0), V(s * 0.36, 0.5, -0.04)],
      [V(s * 0.35, 0.37, -0.04), V(s * 0.45, 0.38, -0.1)],
      [V(s * 0.33, 0.3, -0.07), V(s * 0.42, 0.25, -0.15)],
      [V(s * 0.28, 0.26, -0.08), V(s * 0.33, 0.18, -0.16)],
    ];
    const fingers = tips.map(([m, t], k) => {
      const c = b.chain(`wingFinger${k + 1}${S}`, catmull([wr, m, t]), {
        parent: `wingWrist${S}`,
        names: [`wingFinger${k + 1}a${S}`, `wingFinger${k + 1}b${S}`],
        role: "digit",
      });
      b.sweep(c, [0.0085, 0.006, 0.0035], { color: FINGER, sides: 8 });
      return c;
    });
    for (let k = 0; k < 3; k++)
      membranes.push(
        ...b.membrane(fingers[k], fingers[k + 1], { color: WING, thickness: 0.003, scallop: 0.16, name: `wingSkin${k + 1}${S}` }),
      );
    membranes.push(
      ...b.membrane(fingers[3], [wr, V(s * 0.05, 0.215, -0.09)], {
        color: WING,
        thickness: 0.003,
        scallop: 0.25,
        bone: "spine1",
        name: `wingSkinFlank${S}`,
      }),
    );
    b.spike(wr, [0, 0.4, 1], 0.03, 0.0065, { color: CLAW, bone: `wingWrist${S}`, sides: 6 });
  }

  // ---------------------------------------------------------------- head
  const cranium = b.part(new THREE.SphereGeometry(0.062, 18, 14), skin, {
    at: [0, 0.4, 0.19],
    bone: "head",
    scale: [1.06, 0.93, 1],
    name: "cranium",
  });
  const snout = b.sweep(
    [
      [0, 0.385, 0.215],
      [0, 0.38, 0.275],
    ],
    (t: number): [number, number] => [0.042 - 0.01 * t, 0.027 - 0.004 * t],
    { color: skin, bone: "head", caps: "round", sides: 12, name: "snout" },
  );
  b.part(new THREE.SphereGeometry(0.026, 10, 8), "#5a1f2a", { at: [0, 0.36, 0.24], bone: "head", scale: [1.2, 0.6, 1.4], name: "mouth" });

  // Cheeks, brows, ears, horns
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 12, 10), skin, { at: [s * 0.046, 0.372, 0.208], bone: "head" });
    b.capsule([s * 0.02, 0.447, 0.235], [s * 0.062, 0.437, 0.212], 0.0095, { color: "#1f7d72", bone: "head", sides: 8 });
    b.slab(
      [
        [s * 0.05, 0.418, 0.165],
        [s * 0.05, 0.39, 0.16],
        [s * 0.11, 0.405, 0.115],
        [s * 0.1, 0.43, 0.125],
      ],
      { color: "#f29a4a", thickness: 0.005, bone: "head" },
    );
    b.sweep(catmull([V(s * 0.034, 0.442, 0.168), V(s * 0.05, 0.472, 0.148), V(s * 0.062, 0.488, 0.115)]), [0.015, 0.011, 0.004], {
      color: HORN,
      bone: "head",
      caps: { start: "flat", end: "round" },
      sides: 8,
      extend: [0.01, 0],
      name: `horn${s > 0 ? "L" : "R"}`,
    });
  }

  // Eyes
  const eyePaint = (c: THREE.Vector3, g: THREE.Vector3) => {
    const right = new THREE.Vector3().crossVectors(g, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, g).normalize();
    return paint((p) => {
      const d = p.clone().sub(c).normalize();
      const f = d.dot(g);
      if (f < 0.35) return "#2b1d14";
      const u = d.dot(right);
      const v = d.dot(up);
      if (Math.hypot(u - 0.24, v - 0.3) < 0.12) return "#fffbea";
      if (Math.hypot(u + 0.2, v + 0.28) < 0.06) return "#fff1c8";
      const slit = 0.085 * Math.sqrt(Math.max(0, 1 - (v / 0.62) ** 2));
      if (Math.abs(u) < slit && f > 0.6) return "#1a0d06";
      if (f < 0.5) return "#6b3208";
      return mix("#ffd84a", "#e0760c", smoothstep(0.98, 0.55, f));
    });
  };
  for (const s of [1, -1]) {
    const c = V(s * 0.042, 0.42, 0.228);
    const g = V(s * 0.35, 0.05, 0.94).normalize();
    b.part(new THREE.SphereGeometry(0.024, 16, 12), eyePaint(c, g), { at: c, bone: "head", name: `eye${s > 0 ? "L" : "R"}` });
  }

  // Nostrils
  const snoutSurf = b.surface(snout);
  let smokeStart = V(0.014, 0.398, 0.305);
  let smokeDir = V(0, 0, 1);
  for (const s of [1, -1]) {
    const hit = snoutSurf.ray([s * 0.014, 0.398, 0.6], [0, 0, -1]) ?? snoutSurf.nearest([s * 0.014, 0.398, 0.31]);
    b.stick(new THREE.SphereGeometry(0.0055, 8, 6), DARK, hit, { embed: 0.5, scale: [1.3, 1, 0.8] });
    if (s > 0) {
      smokeStart = hit.at;
      smokeDir = hit.n;
    }
  }

  // Upper teeth
  for (const s of [1, -1])
    [0.232, 0.252, 0.272].forEach((z, i) => {
      const u = Math.min(1, (z - 0.215) / 0.06);
      const cy = 0.385 - 0.005 * u;
      const rx = 0.042 - 0.01 * u;
      const ry = 0.027 - 0.004 * u;
      b.spike([s * 0.62 * rx, cy - ry * 0.72, z], [0, -1, 0.1], i === 2 ? 0.02 : 0.016, 0.0045, {
        color: "#fffaf0",
        bone: "head",
        sides: 6,
      });
    });

  // Lower jaw, tongue, lower fangs
  b.sweep(
    [
      [0, 0.348, 0.2],
      [0, 0.346, 0.27],
    ],
    (t: number): [number, number] => [0.036 - 0.008 * t, 0.013],
    { color: skin, bone: "jaw", caps: "round", sides: 12, name: "lowerJaw" },
  );
  b.sweep(
    [
      [0, 0.355, 0.215],
      [0, 0.357, 0.262],
    ],
    (t: number): [number, number] => [0.016 - 0.004 * t, 0.006],
    { color: "#ef7f8e", bone: "jaw", caps: "round", sides: 8, name: "tongue" },
  );
  for (const s of [1, -1])
    b.spike([s * 0.018, 0.355, 0.262], [0, 1, 0.05], 0.013, 0.004, { color: "#fffaf0", bone: "jaw", sides: 6 });

  // Head spines
  const around = b.surface(cranium).around([0, 0.4, 0.19]);
  for (const [el, h] of [
    [62, 0.017],
    [38, 0.014],
  ]) {
    const hit = around.at(180, el);
    if (!hit) continue;
    const n = hit.n;
    const x = V(0, 0, 1).addScaledVector(n, -n.z).normalize();
    fin(hit, x, n, h, "head");
  }

  // Smoke wisp from the left nostril
  const S0 = smokeStart.clone().addScaledVector(smokeDir, 0.004);
  const off = (x: number, y: number, z: number) => S0.clone().add(V(x, y, z));
  const smoke = b.sweep(
    catmull([
      S0,
      off(0.006, 0.012, 0.012),
      off(0.022, 0.032, 0.022),
      off(0.04, 0.06, 0.015),
      off(0.048, 0.09, -0.005),
      off(0.035, 0.112, -0.02),
      off(0.018, 0.105, -0.012),
    ]),
    (t: number) => 0.002 + 0.011 * Math.pow(Math.sin(Math.PI * t), 0.8) * (0.4 + 0.6 * t),
    { color: "#dfe5e7", bone: "head", sides: 8, name: "smoke" },
  );
  const puffs = [
    b.part(new THREE.SphereGeometry(0.012, 10, 8), "#dfe5e7", { at: off(0.03, 0.128, -0.032), bone: "head" }),
    b.part(new THREE.SphereGeometry(0.008, 8, 6), "#dfe5e7", { at: off(0.05, 0.145, -0.022), bone: "head" }),
    b.part(new THREE.SphereGeometry(0.005, 8, 6), "#dfe5e7", { at: off(0.062, 0.158, -0.03), bone: "head" }),
  ];

  // Open the jaw into a toothy grin
  b.pose("jaw", { axis: [1, 0, 0], deg: 16 });

  // ---------------------------------------------------------------- egg
  const eggAt = V(-0.3, 0, 0.17);
  const shell = shellPaint(V(-0.3, 0.09, 0.17));
  b.lathe(
    [
      [0, 0],
      [0.038, 0.006],
      [0.061, 0.028],
      [0.073, 0.062],
      [0.076, 0.095],
      [0.073, 0.12],
      [0.067, 0.12],
      [0.07, 0.095],
      [0.067, 0.064],
      [0.056, 0.033],
      [0.034, 0.013],
      [0, 0.007],
    ],
    { color: shell, at: eggAt, segments: 18, bone: "egg", name: "eggShell" },
  );
  b.ring(frame([-0.3, 0.118, 0.17], [0, 1, 0]), { count: 12, radius: 0.07 }, (item) => {
    const out = item.outward;
    const tangent = V(0, 1, 0).cross(out).normalize();
    const ydir = V(0, 1, 0).addScaledVector(out, -0.12);
    const h = 0.008 + 0.026 * R();
    const o = (R() - 0.5) * 0.016;
    b.extrude(
      [
        [-0.021, -0.008],
        [0.021, -0.008],
        [o, h],
      ],
      { color: shell, at: item.at, x: tangent, y: ydir, thickness: 0.0058, bone: "egg" },
    );
  });
  // Egg cap lying upside down
  const capAxis = V(0.35, -1, 0.2).normalize();
  const capAt = V(-0.2, 0.073, 0.34);
  b.lathe(
    [
      [0.067, 0],
      [0.073, 0],
      [0.068, 0.03],
      [0.05, 0.06],
      [0.026, 0.075],
      [0, 0.081],
      [0, 0.075],
      [0.022, 0.069],
      [0.045, 0.055],
      [0.062, 0.028],
    ],
    { color: shellPaint(capAt), at: capAt, axis: capAxis, segments: 16, bone: "egg", name: "eggCap" },
  );
  // Shards on the ground
  const shards: Array<Array<[number, number, number]>> = [
    [
      [-0.17, 0.003, 0.25],
      [-0.145, 0.004, 0.265],
      [-0.16, 0.003, 0.29],
    ],
    [
      [-0.41, 0.003, 0.22],
      [-0.385, 0.005, 0.235],
      [-0.395, 0.003, 0.26],
      [-0.42, 0.003, 0.245],
    ],
    [
      [-0.33, 0.003, 0.3],
      [-0.31, 0.003, 0.315],
      [-0.325, 0.004, 0.33],
    ],
  ];
  for (const pts of shards) b.slab(pts, { color: shell, thickness: 0.004, bone: "egg" });

  // ---------------------------------------------------------------- finish
  const root = b.root;
  for (const m of membranes) {
    const mat = (m.material as THREE.MeshStandardMaterial).clone();
    mat.transparent = true;
    mat.opacity = 0.82;
    mat.side = THREE.DoubleSide;
    mat.emissive = new THREE.Color("#6a3000");
    mat.emissiveIntensity = 0.35;
    mat.emissiveMap = mat.map;
    m.material = mat;
  }
  const smokeMat = new THREE.MeshStandardMaterial({
    color: "#e4e9eb",
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  });
  for (const m of smoke.meshes) m.material = smokeMat;
  for (const p of puffs) p.mesh.material = smokeMat;
  return root;
}
```