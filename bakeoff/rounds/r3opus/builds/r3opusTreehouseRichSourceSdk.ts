import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  mottle,
  spots,
  stripes,
  catmull,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cozy Treehouse Diorama",
  description:
    "A tabletop diorama: an old oak on a grassy round plinth holding a little plank cabin with a red shingle roof, round window, pennant and lantern, plus a rope ladder, a swing, mushrooms, daisies, stepping stones and a bicycle.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(42);

  // ---------- palette ----------
  const WOOD_D = "#6b4223";
  const PLANKS = ["#b88452", "#a87445", "#c08d5a"];
  const GOLD = "#e0b03a";
  const IRON = "#2d2a28";
  const GLOW = "#ffd97a";
  const ROPE = "#c9a46a";

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone: "root", ...opts });
  const ball = (r: number, color: any, at: V, bone = "root") =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, bone });
  const rod = (p0: any, p1: any, r: number, color: any, bone = "root", sides = 6) =>
    b.rod(p0, p1, r, { color, bone, sides });

  // ---------- paints ----------
  const grass = paint((p) =>
    mix(mix("#5f9e46", "#7fb955", noise(p, 0.09, 1)), "#467f35", 0.7 * smoothstep(0.55, 0.75, noise(p, 0.035, 2))),
  );
  const soil = spots(
    stripes("#7b5435", "#5c3c24", { size: 0.016, axis: "y", width: 0.45, wobble: 0.25 }),
    ["#a99a84", "#8c7f6c"],
    { size: 0.022, amount: 0.25, seed: 3 },
  );
  const ground = paint((p) => (p.y > 0.084 + 0.009 * noise(p, 0.025, 5) ? grass : soil));
  const barkGrain = grain("#7a5638", "#4b311f", { size: 0.007, axis: "y", seed: 2 });
  const bark = paint((p, n) =>
    mix(barkGrain.at(p, n), "#5d8a3a", smoothstep(0.5, 0.68, noise(p, 0.05, 9)) * smoothstep(0.24, 0.12, p.y)),
  );
  const leafPaint = paint((p, n) => {
    const top = smoothstep(-0.3, 0.8, n.y);
    const base = mix("#2f5e2a", "#5c9a3c", 0.25 + 0.6 * top);
    return mix(base, "#86c052", smoothstep(0.58, 0.78, noise(p, 0.07, 3)) * top);
  });
  const wallPaint = paint((p) => {
    const y = (p.y - 0.42) / 0.0188;
    const k = Math.floor(y);
    const f = y - k;
    const base = mix(k % 2 ? "#c4925a" : "#b5804b", "#94622f", 0.5 * noise(p, 0.03, 4));
    return f < 0.12 ? mix(base, "#5e3a1f", 0.65) : base;
  });
  const doorPaint = paint((p) => {
    const u = (p.x + 1) / 0.0137;
    const f = u - Math.floor(u);
    const base = mix("#7d4b2a", "#6a3d21", noise(p, 0.02, 6));
    return f < 0.12 ? mix(base, "#3e2414", 0.6) : base;
  });
  const shingle = (off: number, seed: number) =>
    paint((p) => {
      const u = (p.x + off + 1) / 0.024;
      const c = Math.floor(u);
      const f = u - c;
      const base = mix("#cc4a33", "#9c2e1d", noise(new THREE.Vector3(c * 3.1, seed * 1.7, 0.5), 1, 7));
      return f < 0.09 ? mix(base, "#5e1a12", 0.6) : base;
    });

  // ---------- base ----------
  b.lathe(
    [
      [0, 0],
      [0.54, 0],
      [0.54, 0.03],
      [0.53, 0.04],
      [0, 0.04],
    ],
    { at: [0, 0, 0], color: grain("#6e4526", "#4f3019", { size: 0.004, axis: "x" }), segments: 40, bone: "root" },
  );
  b.part(new THREE.TorusGeometry(0.541, 0.004, 4, 48), "#c9a24a", { at: [0, 0.018, 0], rotation: [90, 0, 0], bone: "root" });
  const baseTop = b.lathe(
    [
      [0, 0.03],
      [0.5, 0.03],
      [0.5, 0.085],
      [0.49, 0.096],
      [0.465, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], color: ground, segments: 40, bone: "root" },
  );

  // ---------- oak ----------
  const TX = 0;
  const TZ = -0.1;
  const trunk = b.loft(
    [
      { at: [TX, 0.07, TZ], w: 0.3, h: 0.28 },
      { at: [TX, 0.14, TZ], w: 0.18, h: 0.17 },
      { at: [TX + 0.005, 0.26, TZ], w: 0.14, h: 0.135 },
      { at: [TX - 0.005, 0.4, TZ], w: 0.13, h: 0.125 },
      { at: [TX, 0.55, TZ], w: 0.12, h: 0.11 },
      { at: [TX + 0.01, 0.69, TZ - 0.01], w: 0.09, h: 0.085 },
    ],
    { color: bark, bone: "root", sides: 10 },
  );
  [25, 100, 155, 215, 290, 340].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const len = 0.21 + 0.04 * (i % 2);
    b.sweep(
      catmull([
        [TX + 0.05 * c, 0.17, TZ + 0.05 * s],
        [TX + 0.13 * c, 0.115, TZ + 0.13 * s],
        [TX + len * c, 0.088, TZ + len * s],
      ]),
      { radius: [0.038, 0.01], color: bark, bone: "root", sides: 7 },
    );
  });
  const branches: V[][] = [
    [[0, 0.58, -0.1], [0.15, 0.72, -0.14], [0.3, 0.82, -0.17]],
    [[0, 0.6, -0.1], [-0.15, 0.74, -0.12], [-0.32, 0.84, -0.14]],
    [[0, 0.64, -0.11], [0.02, 0.8, -0.17], [0, 0.95, -0.2]],
    [[0.01, 0.66, -0.11], [0.01, 0.8, -0.06], [0.02, 0.93, 0.02]],
  ];
  for (const pts of branches) b.sweep(catmull(pts), { radius: [0.042, 0.014], color: bark, bone: "root", sides: 7 });
  // the swing branch
  b.sweep(
    catmull([
      [0, 0.29, -0.09],
      [-0.15, 0.35, -0.05],
      [-0.39, 0.372, -0.03],
    ]),
    { radius: [0.036, 0.012], color: bark, bone: "root", sides: 7 },
  );

  // crown
  const blobs: Array<[number, number, number, number]> = [
    [0, 0.92, -0.2, 0.2],
    [0.24, 0.86, -0.2, 0.16],
    [-0.24, 0.88, -0.18, 0.17],
    [0.4, 0.78, -0.12, 0.12],
    [-0.4, 0.8, -0.1, 0.13],
    [0.12, 1.04, -0.12, 0.14],
    [-0.12, 1.06, -0.2, 0.14],
    [0, 0.84, -0.36, 0.15],
    [0.28, 0.96, -0.02, 0.11],
    [-0.26, 0.98, 0.0, 0.11],
    [0.02, 1.0, 0.04, 0.12],
    [-0.4, 0.39, -0.03, 0.05],
  ];
  const crown = blobs.map(([x, y, z, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), leafPaint, {
      at: [x, y, z],
      scale: [1, 0.88, 1],
      rotation: [rand() * 360, rand() * 360, rand() * 360],
      flat: true,
      bone: "root",
    }),
  );
  const leafTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 63 L32 50" stroke="#888888" stroke-width="3"/>
      <g fill="#eeeeee"><ellipse cx="32" cy="30" rx="13" ry="23"/><circle cx="20" cy="22" r="8"/><circle cx="44" cy="22" r="8"/>
      <circle cx="19" cy="38" r="8"/><circle cx="45" cy="38" r="8"/><circle cx="32" cy="9" r="7"/></g>
      <path d="M32 54 L32 10 M32 30 L20 22 M32 30 L44 22 M32 42 L20 38 M32 42 L44 38" stroke="#a8a8a8" stroke-width="1.6" fill="none"/>
    </svg>`,
  );
  const leafHits = b.surface(crown).scatter(300, { rng: rng(11), minDist: 0.024 });
  b.cards(leafHits, leafTex, {
    size: 0.05,
    lean: 45,
    bend: 25,
    vary: 0.3,
    spin: 50,
    rng: rng(8),
    flow: [0, -1, 0],
    color: mottle("#7fbf4c", "#3f7a2f", { size: 0.07, seed: 4 }),
    bone: "root",
    sink: 0.25,
  });

  // knot hole with an owl peeking out
  const hole = b.surface(trunk).ray([0, 0.25, 0.6], [0, 0, -1]);
  if (hole) {
    b.stick(new THREE.CylinderGeometry(0.017, 0.021, 0.012, 10), "#2b1a10", hole, { bone: "root", embed: 0.8 });
    b.part(new THREE.SphereGeometry(0.012, 8, 6), "#7a5a3c", { at: hole.local([0, 0.0, -0.004]), bone: "root" });
    for (const s of [-1, 1]) {
      ball(0.0045, "#f2d14b", hole.local([s * 0.0062, 0.0055, 0.002]).toArray() as V);
      ball(0.002, "#151515", hole.local([s * 0.0062, 0.0098, 0.002]).toArray() as V);
    }
  }

  // ---------- platform ----------
  for (let i = 0; i < 8; i++) box(0.36, 0.018, 0.034, PLANKS[i % 3], [0, 0.411, -0.19 + 0.0375 * (i + 0.5)]);
  for (const s of [-1, 1]) box(0.02, 0.02, 0.31, WOOD_D, [s * 0.14, 0.392, -0.04]);
  box(0.37, 0.022, 0.015, WOOD_D, [0, 0.405, 0.115]);
  for (const s of [-1, 1])
    for (const z of [0.09, -0.17]) rod([TX, 0.24, TZ], [s * 0.14, 0.385, z], 0.009, "#7a5130");

  // railings
  const RAIL = "#8a5a33";
  const post = (x: number, z: number) => box(0.012, 0.055, 0.012, RAIL, [x, 0.4475, z]);
  for (const x of [-0.17, -0.1, -0.03, 0.04, 0.09]) post(x, 0.105);
  rod([-0.17, 0.472, 0.105], [0.09, 0.472, 0.105], 0.004, RAIL);
  for (const s of [-1, 1]) {
    for (const z of [0.105, 0.03, -0.05, -0.12, -0.18]) if (!(z === 0.105 && s === -1)) post(s * 0.17, z);
    rod([s * 0.17, 0.472, 0.105], [s * 0.17, 0.472, -0.18], 0.004, RAIL);
  }

  // ---------- cabin ----------
  box(0.22, 0.15, 0.16, wallPaint, [0, 0.495, -0.03]);
  for (const x of [-0.11, 0.11]) for (const z of [0.05, -0.11]) box(0.018, 0.152, 0.018, WOOD_D, [x, 0.496, z]);
  // door
  box(0.055, 0.1, 0.008, doorPaint, [-0.05, 0.47, 0.052]);
  box(0.067, 0.008, 0.01, WOOD_D, [-0.05, 0.524, 0.053]);
  for (const s of [-1, 1]) box(0.006, 0.104, 0.01, WOOD_D, [-0.05 + s * 0.0305, 0.472, 0.053]);
  for (const y of [0.445, 0.495]) box(0.05, 0.006, 0.004, "#5e3a1f", [-0.05, y, 0.0575]);
  ball(0.0045, GOLD, [-0.031, 0.47, 0.06]);
  box(0.06, 0.003, 0.03, "#c0533b", [-0.05, 0.4215, 0.075]);
  // round window
  b.part(new THREE.TorusGeometry(0.028, 0.006, 6, 16), WOOD_D, { at: [0.055, 0.495, 0.052], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.004, 16), GLOW, {
    at: [0.055, 0.495, 0.0505],
    rotation: [90, 0, 0],
    bone: "root",
  });
  box(0.054, 0.004, 0.004, WOOD_D, [0.055, 0.495, 0.053]);
  box(0.004, 0.054, 0.004, WOOD_D, [0.055, 0.495, 0.053]);
  // flower box
  box(0.07, 0.014, 0.018, "#8a5530", [0.055, 0.452, 0.06]);
  const FLOWERS = ["#e8505b", "#ffd84d", "#f28ab2"];
  for (let i = 0; i < 5; i++) {
    ball(0.0055, "#4e8f3a", [0.03 + i * 0.0125, 0.461, 0.058]);
    ball(0.0045, FLOWERS[i % 3], [0.03 + i * 0.0125, 0.466, 0.063]);
  }
  // side windows with shutters
  for (const s of [-1, 1]) {
    const x = s * 0.1115;
    const fx = s * 0.113;
    box(0.003, 0.04, 0.04, GLOW, [x, 0.5, -0.03]);
    for (const dy of [-0.0225, 0.0225]) box(0.006, 0.005, 0.05, WOOD_D, [fx, 0.5 + dy, -0.03]);
    for (const dz of [-0.0225, 0.0225]) box(0.006, 0.05, 0.005, WOOD_D, [fx, 0.5, -0.03 + dz]);
    box(0.005, 0.04, 0.003, WOOD_D, [fx, 0.5, -0.03]);
    box(0.005, 0.003, 0.04, WOOD_D, [fx, 0.5, -0.03]);
    for (const dz of [-0.034, 0.034]) box(0.004, 0.046, 0.02, "#4f7a5a", [s * 0.115, 0.5, -0.03 + dz]);
  }

  // ---------- roof ----------
  const th = (34 * Math.PI) / 180;
  const RIDGE: V = [0, 0.652, -0.03];
  for (const side of [1, -1]) {
    const dir = [0, -Math.sin(th), side * Math.cos(th)];
    const nrm = [0, Math.cos(th), side * Math.sin(th)];
    for (let k = 0; k < 5; k++) {
      const d = 0.016 + 0.026 * k;
      const lift = 0.004 + (4 - k) * 0.0015;
      const at: V = [0, RIDGE[1] + dir[1] * d + nrm[1] * lift, RIDGE[2] + dir[2] * d + nrm[2] * lift];
      box(0.3, 0.007, 0.032, shingle(k * 0.012 + (side > 0 ? 0 : 0.006), k + side * 10), at, {
        rotation: [side * 34, 0, 0],
      });
    }
  }
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.31, 8), "#8e2a1c", { at: [0, 0.662, -0.03], rotation: [0, 0, 90], bone: "root" });
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [-0.08, 0],
        [0.08, 0],
        [0, 0.072],
      ],
      { at: [s * 0.11, 0.57, -0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: wallPaint, bone: "root" },
    );
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 10), IRON, {
      at: [s * 0.117, 0.6, -0.03],
      rotation: [0, 0, 90],
      bone: "root",
    });
  }

  // pennant flag
  rod([0.135, 0.655, -0.03], [0.135, 0.778, -0.03], 0.0028, "#5a4636");
  ball(0.006, GOLD, [0.135, 0.781, -0.03]);
  b.joint("flag", { at: [0.135, 0.77, -0.03], parent: "root", dir: [0, 1, 0] });
  b.slab(
    [
      [0.137, 0.773, -0.03],
      [0.137, 0.735, -0.03],
      [0.218, 0.754, -0.03],
    ],
    { color: paint((p) => (p.x > 0.185 ? "#e8553a" : "#f6c945")), thickness: 0.003, bone: "flag" },
  );

  // lantern by the door
  rod([0, 0.548, 0.05], [0, 0.548, 0.08], 0.0022, IRON);
  b.joint("lantern", { at: [0, 0.548, 0.078], parent: "root", dir: [0, -1, 0] });
  rod([0, 0.548, 0.078], [0, 0.533, 0.078], 0.0012, IRON, "lantern", 4);
  b.part(new THREE.ConeGeometry(0.012, 0.01, 4), IRON, { at: [0, 0.529, 0.078], rotation: [0, 45, 0], bone: "lantern" });
  box(0.013, 0.017, 0.013, "#ffcf4d", [0, 0.515, 0.078], { bone: "lantern" });
  for (const dx of [-0.0068, 0.0068])
    for (const dz of [-0.0068, 0.0068]) box(0.0025, 0.019, 0.0025, IRON, [dx, 0.515, 0.078 + dz], { bone: "lantern" });
  box(0.017, 0.003, 0.017, IRON, [0, 0.5045, 0.078], { bone: "lantern" });

  // ---------- rope ladder ----------
  const top = new THREE.Vector3(0, 0.425, 0.112);
  const bot = new THREE.Vector3(0, 0.098, 0.205);
  for (const x of [0.115, 0.155]) {
    rod([x, top.y, top.z], [x, bot.y, bot.z], 0.0032, ROPE);
    ball(0.006, ROPE, [x, 0.427, 0.112]);
  }
  for (let i = 1; i <= 8; i++) {
    const p = top.clone().lerp(bot, i / 9);
    box(0.052, 0.006, 0.012, "#9b6a3e", [0.135, p.y, p.z]);
  }

  // ---------- swing ----------
  b.joint("swing", { at: [-0.3, 0.362, -0.03], parent: "root", dir: [0, -1, 0], role: "hinge" });
  for (const x of [-0.265, -0.335]) rod([x, 0.365, -0.03], [x, 0.16, -0.03], 0.0025, ROPE, "swing");
  box(0.09, 0.009, 0.035, "#a8703f", [-0.3, 0.158, -0.03], { bone: "swing" });

  // ---------- stepping stones ----------
  const STONES = ["#9d9a90", "#8a877e"];
  [
    [0.15, 0.25],
    [0.19, 0.32],
    [0.16, 0.39],
    [0.2, 0.45],
  ].forEach(([x, z], i) =>
    b.part(new THREE.DodecahedronGeometry(0.022, 0), STONES[i % 2], {
      at: [x, 0.1, z],
      scale: [1, 0.28, 0.8],
      rotation: [0, rand() * 360, 0],
      flat: true,
      bone: "root",
    }),
  );

  // ---------- mushrooms ----------
  const mushroom = (x: number, z: number, s: number, cap: string, seed: number) => {
    b.lathe(
      [
        [0, 0],
        [0.007 * s, 0],
        [0.0065 * s, 0.018 * s],
        [0.005 * s, 0.03 * s],
        [0, 0.03 * s],
      ],
      { at: [x, 0.095, z], color: "#efe3c8", segments: 10, bone: "root" },
    );
    b.lathe(
      [
        [0, 0],
        [0.024 * s, -0.003 * s],
        [0.028 * s, 0.004 * s],
        [0.022 * s, 0.016 * s],
        [0.011 * s, 0.023 * s],
        [0, 0.025 * s],
      ],
      {
        at: [x, 0.095 + 0.028 * s, z],
        color: spots(cap, "#fff4e0", { size: 0.012 * s, amount: 0.35, seed }),
        segments: 12,
        bone: "root",
      },
    );
  };
  mushroom(0.25, -0.1, 1.0, "#d8442f", 1);
  mushroom(0.29, -0.055, 0.7, "#d8442f", 2);
  mushroom(0.225, -0.16, 0.55, "#e0662f", 3);
  mushroom(-0.17, -0.3, 0.9, "#b8652f", 4);
  mushroom(-0.13, -0.33, 0.55, "#b8652f", 5);

  // ---------- bicycle ----------
  const bike = b.region({
    at: [-0.22, 0.1, 0.25],
    quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.5),
    bone: "root",
  });
  const FRAME = "#2f8f9d";
  const bRod = (p0: V, p1: V, r: number, color: string) =>
    b.rod(bike.p(p0), bike.p(p1), r, { color, bone: "root", sides: 6 });
  const hubs: V[] = [
    [-0.058, 0.047, 0],
    [0.058, 0.047, 0],
  ];
  for (const c of hubs) {
    bike.part(new THREE.TorusGeometry(0.042, 0.005, 6, 18), "#2b2b2b", { at: c });
    bike.part(new THREE.TorusGeometry(0.036, 0.0018, 4, 18), "#c9c9c9", { at: c });
    bike.part(new THREE.CylinderGeometry(0.005, 0.005, 0.012, 8), "#c9c9c9", { at: c, rotation: [90, 0, 0] });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 4;
      const d = [Math.cos(a) * 0.036, Math.sin(a) * 0.036];
      b.rod(bike.p([c[0] + d[0], c[1] + d[1], 0]), bike.p([c[0] - d[0], c[1] - d[1], 0]), 0.0007, {
        color: "#c9c9c9",
        bone: "root",
        sides: 3,
      });
    }
  }
  const BB: V = [-0.005, 0.042, 0];
  const S: V = [-0.022, 0.1, 0];
  const H: V = [0.042, 0.1, 0];
  const Hb: V = [0.046, 0.088, 0];
  bRod(BB, S, 0.003, FRAME);
  bRod(S, H, 0.003, FRAME);
  bRod(BB, Hb, 0.0032, FRAME);
  bRod(hubs[0], S, 0.0022, FRAME);
  bRod(hubs[0], BB, 0.0022, FRAME);
  bRod(H, hubs[1], 0.0025, FRAME);
  bRod(S, [-0.025, 0.108, 0], 0.002, "#c9c9c9");
  bike.part(new THREE.BoxGeometry(0.024, 0.006, 0.013), "#5a3a22", { at: [-0.027, 0.111, 0] });
  bRod(H, [0.038, 0.116, 0], 0.002, "#c9c9c9");
  bRod([0.038, 0.116, -0.026], [0.038, 0.116, 0.026], 0.0018, "#c9c9c9");
  for (const z of [-0.026, 0.026]) bRod([0.038, 0.116, z], [0.038, 0.116, z * 0.75], 0.0032, "#5a3a22");
  bike.part(new THREE.SphereGeometry(0.0035, 6, 5), GOLD, { at: [0.038, 0.12, 0.016] });
  bike.part(new THREE.TorusGeometry(0.011, 0.0015, 4, 12), "#c9c9c9", { at: [BB[0], BB[1], 0.006] });
  bRod([BB[0], BB[1], 0.008], [BB[0] + 0.012, BB[1] - 0.012, 0.008], 0.0015, "#c9c9c9");
  bike.part(new THREE.BoxGeometry(0.008, 0.003, 0.01), "#2b2b2b", { at: [BB[0] + 0.012, BB[1] - 0.012, 0.014] });
  bRod(BB, [-0.02, 0.001, 0.02], 0.0015, "#c9c9c9");
  bike.part(new THREE.BoxGeometry(0.03, 0.02, 0.032), grain("#c8a062", "#9c7640", { size: 0.002, axis: "x" }), {
    at: [0.07, 0.106, 0],
  });
  bRod(H, [0.06, 0.1, 0], 0.0015, "#c9c9c9");
  FLOWERS.forEach((c, i) => bike.part(new THREE.SphereGeometry(0.004, 6, 5), c, { at: [0.064 + i * 0.006, 0.118, -0.006 + i * 0.006] }));

  // ---------- grass tufts and daisies ----------
  const baseSurf = b.surface(baseTop);
  const clear = (p: THREE.Vector3) =>
    Math.hypot(p.x - TX, p.z - TZ) < 0.15 ||
    Math.hypot(p.x + 0.22, p.z - 0.25) < 0.1 ||
    Math.hypot(p.x - 0.17, p.z - 0.35) < 0.06;
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M6 64 L12 20 L18 64 Z M20 64 L30 0 L38 64 Z M36 64 L48 12 L52 64 Z M48 64 L60 30 L60 64 Z" fill="#f2f2f2"/>
      <path d="M6 64 L18 64 L16 50 L9 50 Z M20 64 L38 64 L36 46 L23 46 Z M36 64 L52 64 L51 52 L39 52 Z" fill="#b5b5b5"/>
    </svg>`,
  );
  const grassHits = baseSurf.scatter(220, { rng: rng(3), filter: (h) => h.n.y > 0.9, keepOut: clear, minDist: 0.018 });
  b.cards(grassHits, grassTex, {
    size: [0.03, 0.035],
    cross: true,
    vary: 0.35,
    spin: 180,
    lean: 8,
    rng: rng(5),
    color: mottle("#7ab84f", "#4e8f3a", { size: 0.08, seed: 6 }),
    bone: "root",
  });
  const daisyHits = baseSurf.scatter(20, { rng: rng(21), filter: (h) => h.n.y > 0.9, keepOut: clear, minDist: 0.05 });
  daisyHits.forEach((h, i) => {
    const tall = 0.018 + 0.008 * ((i * 7) % 3) / 2;
    b.rod(h.moved([0, -0.003, 0]), h.moved([0, tall, 0]), 0.0012, { color: "#4e8f3a", bone: "root", sides: 3 });
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.002, 6), i % 4 === 0 ? "#f28ab2" : "#fbf7ee", {
      at: h.moved([0, tall, 0]),
      bone: "root",
    });
    ball(0.0028, "#ffd84d", h.moved([0, tall + 0.0015, 0]).at.toArray() as V);
  });

  return b.root;
}
