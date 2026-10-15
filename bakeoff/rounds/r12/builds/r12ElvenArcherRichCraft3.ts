import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, limb, paint, mix, smoothstep, grain, svg } from "../../../../src/index";
import { cel, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "High-fantasy anime elven ranger: silver braided hair, long pointed ears, big cel-shaded eyes, leaf-trimmed leather vest, forest-green cloak and tabard, quiver of fletched arrows, glowing-rune recurve bow and a rigged skeleton with fingers.",
};

type P = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const norm = (x: number, y: number, z: number) => V(x, y, z).normalize();
const tup = (v: THREE.Vector3): P => [v.x, v.y, v.z];
const stepFrom = (p: THREE.Vector3, d: THREE.Vector3, l: number) => p.clone().addScaledVector(d, l);

const leafOutline = (len: number, wid: number): Pt[] => [
  [0, 0, "sharp"],
  [len * 0.3, wid],
  [len * 0.72, wid * 0.62],
  [len, 0, "sharp"],
  [len * 0.72, -wid * 0.62],
  [len * 0.3, -wid],
];

const grow = (o: Pt[], k: number, cx: number, cy: number): Pt[] =>
  o.map((q) => {
    const x = cx + (q[0] - cx) * k;
    const y = cy + (q[1] - cy) * k;
    return (q.length === 3 ? [x, y, "sharp"] : [x, y]) as Pt;
  });

const dome = (r: number): Pt[] => [
  [0, 0],
  [r, 0],
  [r * 0.92, r * 0.3],
  [r * 0.62, r * 0.62],
  [0, r * 0.72],
];

export default function build() {
  const b = createBuilder({ name: "elven_ranger" });
  const R = rng(21);

  // ------------------------------------------------------------------ palette
  const SKIN = cel("#ffe2d0", "#f0b0a6");
  const EAR_IN = cel("#f9aaa2", "#d97d8a");
  const SHIRT = cel("#f4ecd6", "#c4b9cf");
  const GREEN = cel("#2f8a54", "#1d5d58");
  const GREEN_D = cel("#1f6140", "#153f4a");
  const LEATHER = cel("#a0673a", "#5e3a3a");
  const LEATHER_D = cel("#5f3b22", "#35203f");
  const GOLD = cel("#f6cf62", "#c98a3a");
  const PANTS = cel("#58684a", "#37484c");
  const BOOT = cel("#7a4b2a", "#4a2c38");
  const LINING = cel("#e9e2c4", "#b7a9b8");
  const WOOD = cel(grain("#b07a42", "#6e4424", { size: 0.012, axis: "y" }));
  const HAIR = cel(
    paint((p) => mix(mix("#fdfdff", "#d6ebf6", smoothstep(1.85, 1.4, p.y)), "#8fd6c4", smoothstep(1.2, 0.9, p.y))),
    "#a9b9e0",
  );
  const HAIR_B = cel("#cfe0ee", "#8f9fd0");
  const CLOAK_OUT = cel(paint((p) => mix("#35925c", "#1a5a48", smoothstep(1.45, 0.45, p.y))));
  const TEAL = "#5ff2d0";
  const CREAM = "#f3efe0";
  const SHAFT = "#d9c49a";

  // ------------------------------------------------------------------ textures
  const EYE = animeEye({ iris: "#2fc9a3", irisLight: "#c4ffe9" });
  const MOUTH = svg(
    `<svg viewBox="0 0 40 14"><path d="M6 4 Q20 13 34 4" stroke="#7a2f3d" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M16 9 Q20 11 24 9" stroke="#f0867f" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
    { size: 160 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1d4f3a" stroke="#f6cf62" stroke-width="4"/><path d="M32 8 C49 20 50 41 32 57 C14 41 15 20 32 8Z" fill="#f6cf62" stroke="#7a4a1a" stroke-width="2"/><path d="M32 15 V53 M32 27 L42 20 M32 38 L44 29 M32 27 L22 20 M32 38 L20 29" stroke="#7a4a1a" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  let vine = "M0 8";
  let vineLeaves = "";
  for (let i = 0; i < 16; i++) vine += ` Q${i * 10 + 5} ${i % 2 ? 14 : 2} ${i * 10 + 10} 8`;
  for (let i = 0; i < 8; i++)
    vineLeaves += `<ellipse cx="${i * 20 + 10}" cy="${i % 2 ? 3.5 : 12.5}" rx="4.2" ry="2" fill="#f6cf62" transform="rotate(${i % 2 ? -30 : 30} ${i * 20 + 10} ${i % 2 ? 3.5 : 12.5})"/>`;
  const TRIM = svg(
    `<svg viewBox="0 0 160 16"><rect width="160" height="16" fill="#1b4d38"/><rect width="160" height="2.4" fill="#f6cf62"/><rect y="13.6" width="160" height="2.4" fill="#f6cf62"/><path d="${vine}" stroke="#f6cf62" stroke-width="1.6" fill="none"/>${vineLeaves}</svg>`,
    { size: 512 },
  );
  const fletch = (main: string, edge: string) =>
    svg(
      `<svg viewBox="0 0 24 48"><path d="M12 48 C2 40 2 14 12 0 C22 14 22 40 12 48Z" fill="${main}" stroke="${edge}" stroke-width="2"/><path d="M12 46 V4" stroke="#ffffff" stroke-width="2.6"/><path d="M12 36 L5 28 M12 26 L5 18 M12 36 L19 28 M12 26 L19 18" stroke="${edge}" stroke-width="1.4"/></svg>`,
      { size: 96 },
    );
  const FLETCH_T = fletch("#43c6a6", "#1a5f55");
  const FLETCH_W = fletch("#f4f1e4", "#6a8f86");
  const HAIR_BLADE = svg(
    `<svg viewBox="0 0 24 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#e3f1fb"/><stop offset="1" stop-color="#8fd7c7"/></linearGradient></defs><path d="M12 64 C3 48 4 20 12 0 C20 20 21 48 12 64Z" fill="url(#g)" stroke="#9fb4d6" stroke-width="1.6"/></svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 40 90"><rect width="40" height="90" rx="8" fill="#0b3a3a" stroke="#5ff2d0" stroke-width="2.4"/><g stroke="#7dffe0" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10 V30 M12 16 L20 22 L28 16"/><path d="M12 42 L28 42 L12 58 L28 58"/><path d="M20 66 L10 80 M20 66 L30 80 M20 66 V82"/></g></svg>`,
    { size: 180 },
  );

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.97, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.97, 0], [0, 1.1, 0], [0, 1.29, 0.01], [0, 1.5, 0]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chestJ = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 1.5, 0], [0, 1.57, 0.012], [0, 1.64, 0.02]]), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 1.64, 0.02], dir: [0, 1, 0.02], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.69, 0.025], aim: [0, 1.66, 0.12], role: "jaw" });

  // ------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.0, 0], w: 0.27, h: 0.19 },
      { at: [0, 1.15, 0], w: 0.24, h: 0.17 },
      { at: [0, 1.32, 0.005], w: 0.29, h: 0.19 },
      { at: [0, 1.46, 0], w: 0.34, h: 0.19 },
      { at: [0, 1.54, 0], w: 0.15, h: 0.13 },
    ],
    { bone: [hips, spine], color: SHIRT },
  );
  const vestPaint = paint((p) => {
    const w = (p.y - 1.27) * 0.55;
    if (p.z > 0.02 && p.y > 1.27 && Math.abs(p.x) < w) return SHIRT;
    if (p.z > 0.02 && p.y > 1.27 && Math.abs(p.x) < w + 0.012) return GOLD;
    if (p.y < 1.08) return LEATHER_D;
    return LEATHER;
  });
  const vest = b.loft(
    [
      { at: [0, 1.04, 0], w: 0.285, h: 0.205 },
      { at: [0, 1.15, 0], w: 0.255, h: 0.185 },
      { at: [0, 1.32, 0.005], w: 0.31, h: 0.21 },
      { at: [0, 1.46, 0], w: 0.355, h: 0.21 },
      { at: [0, 1.51, 0], w: 0.26, h: 0.17 },
    ],
    { bone: [hips, spine], color: vestPaint },
  );
  b.sweep(neck, [0.046, 0.04], { color: SKIN, extend: [0, 0.03] });
  const collarRing = b.ring(frame([0, 1.545, 0], [0, 1, 0]), { count: 12, radius: 0.058 });
  b.sweep(catmull(collarRing.items, { closed: true }), 0.012, { bone: neck.joints[0], color: SHIRT });

  // lacing on the vest
  for (let i = 0; i < 4; i++) {
    const y = 1.2 + i * 0.045;
    b.rod([-0.03, y, 0.108], [0.03, y + 0.02, 0.108], 0.004, { bone: chestJ, color: CREAM });
    b.rod([0.03, y, 0.108], [-0.03, y + 0.02, 0.108], 0.004, { bone: chestJ, color: CREAM });
  }

  // skirt, tabard
  b.lathe(
    [[0.17, 0], [0.185, -0.12], [0.215, -0.3], [0.205, -0.3], [0.175, -0.12], [0.16, 0]],
    { at: [0, 0.97, 0], bone: hips, segments: 10, color: GREEN },
  );
  const tabOut: Pt[] = [[-0.085, 0], [0.085, 0], [0.095, -0.16], [0.075, -0.3], [0, -0.38, "sharp"], [-0.075, -0.3], [-0.095, -0.16]];
  const tabY = tup(norm(0, 1, -0.14));
  b.extrude(grow(tabOut, 1.13, 0, -0.19), { at: [0, 0.99, 0.172], x: [1, 0, 0], y: tabY, thickness: 0.01, color: GOLD, bone: hips });
  b.extrude(tabOut, { at: [0, 0.99, 0.18], x: [1, 0, 0], y: tabY, thickness: 0.012, bevel: 0.003, color: GREEN_D, bone: hips });
  glow(
    b.part(new THREE.CircleGeometry(0.042, 16), "#ffffff", {
      bone: hips,
      at: [0, 0.87, 0.206],
      dir: tup(norm(0, 0.14, 1)),
      axis: "z",
      texture: LEAF,
    }),
    0.35,
  );
  for (const s of [1, -1]) {
    b.extrude(leafOutline(0.2, 0.05), {
      at: [s * 0.2, 0.9, 0.04],
      x: [0.2 * s, -1, 0.1],
      y: [0.0, 0.1, 1],
      thickness: 0.01,
      color: GREEN,
      bone: hips,
    });
  }

  // belt
  const torsoSurf = b.surface(torso);
  const belt = torsoSurf.loop([0, 1.04, 0], { lift: 0.026 });
  b.sweep(belt, 0.02, { bone: hips, color: LEATHER_D });
  b.part(new THREE.BoxGeometry(0.06, 0.055, 0.016), GOLD, { bone: hips, at: [0, 1.04, 0.146] });
  glow(
    b.part(new THREE.CircleGeometry(0.022, 12), "#ffffff", { bone: hips, at: [0, 1.04, 0.156], dir: [0, 0, 1], axis: "z", texture: LEAF }),
    0.35,
  );

  // cross-body sash
  const vestSurf = b.surface(vest);
  const sashPath = vestSurf.drape(
    catmull(
      [
        [-0.15, 1.51, -0.02],
        [-0.17, 1.5, 0.07],
        [-0.07, 1.4, 0.14],
        [0.05, 1.24, 0.15],
        [0.15, 1.08, 0.12],
        [0.17, 1.05, 0.0],
        [0.08, 1.12, -0.13],
        [-0.05, 1.32, -0.15],
        [-0.12, 1.45, -0.11],
      ],
      { closed: true },
    ),
    { lift: 0.012 },
  );
  b.sweep(sashPath, 0.015, { color: LEATHER_D });

  // ------------------------------------------------------------------ head
  const HC: P = [0, 1.735, 0.02];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { bone: head, at: HC, scale: [0.108, 0.115, 0.108] });
  const skullZ = (x: number, y: number) =>
    0.02 + 0.108 * Math.sqrt(Math.max(0, 1 - (x / 0.108) ** 2 - ((y - 1.735) / 0.115) ** 2));
  const jawPart = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: jaw, at: [0, 1.675, 0.055], scale: [0.062, 0.052, 0.062] });
  b.part(new THREE.ConeGeometry(0.009, 0.024, 4), SKIN, { bone: head, at: [0, 1.703, 0.127], dir: tup(norm(0, 0.3, 1)) });

  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const h = face.ray([s * 0.047, 1.727, 1], [0, 0, -1]);
    b.decal(skull, EYE, {
      at: h ? h.at : [s * 0.047, 1.727, 0.12],
      dir: [0, 0, 1],
      size: [0.058, 0.08],
      mirror: s > 0,
      segments: 12,
    });
  }
  const mouthSurf = b.surface([skull, jawPart]);
  const mh = mouthSurf.ray([0, 1.667, 1], [0, 0, -1]);
  b.decal(mouthSurf, MOUTH, { at: mh ? mh.at : [0, 1.667, 0.11], dir: [0, 0, 1], size: [0.03, 0.0105] });

  // ears, earrings
  const earOutline: Pt[] = [[0, -0.035], [0.05, -0.028], [0.11, 0.0], [0.18, 0.058, "sharp"], [0.1, 0.042], [0.04, 0.046], [0, 0.04]];
  const earPaint = paint((_p, _n, s) =>
    s[0] > 0.02 && s[0] < 0.13 && Math.abs(s[1] - 0.015) < 0.02 * (1 - s[0] / 0.14) + 0.002 ? EAR_IN : SKIN,
  );
  for (const s of [1, -1]) {
    const d = norm(s * 0.5, 0.42, -0.75);
    const yv = V(0, 1, 0).sub(d.clone().multiplyScalar(d.y)).normalize();
    b.extrude(earOutline, {
      at: [s * 0.098, 1.735, 0.012],
      x: tup(d),
      y: tup(yv),
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: earPaint,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), GOLD, { bone: head, at: [s * 0.102, 1.699, 0.012], scale: 0.008 });
    glow(
      b.part(new THREE.OctahedronGeometry(1), TEAL, { bone: head, at: [s * 0.104, 1.676, 0.012], scale: [0.006, 0.014, 0.006] }),
      1.2,
    );
  }

  // hair: cap, mass, bangs, locks
  const hairCap = b.part(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, 1.45), HAIR, {
    bone: head,
    at: [0, 1.745, 0.005],
    scale: [0.128, 0.13, 0.13],
    rotation: [-18, 0, 0],
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), HAIR, { bone: head, at: [0, 1.69, -0.05], scale: [0.118, 0.1, 0.1] });
  const ribbon = (pts: P[], w0: number, th: number, bone: any = head, color: any = HAIR) =>
    b.sweep(catmull(pts), (t: number): [number, number] => [w0 * (1 - 0.88 * t) + 0.004, th], {
      bone,
      color,
      caps: { start: "round", end: "point" },
    });
  const bangs: [number, number, number][] = [
    [0.012, 0.045, 1.79],
    [0.05, 0.066, 1.782],
    [0.085, 0.095, 1.7],
  ];
  for (const s of [1, -1]) {
    for (const [x0, x1, yt] of bangs) {
      const xm = (x0 + x1) / 2;
      ribbon(
        [
          [s * x0, 1.822, skullZ(x0, 1.822) + 0.004],
          [s * xm, 1.795, skullZ(xm, 1.795) + 0.014],
          [s * x1, yt, skullZ(x1, yt) + 0.012],
        ],
        0.022,
        0.009,
      );
    }
    ribbon(
      [[s * 0.1, 1.775, 0.03], [s * 0.121, 1.68, 0.06], [s * 0.14, 1.57, 0.085], [s * 0.152, 1.46, 0.115], [s * 0.15, 1.4, 0.125]],
      0.034,
      0.012,
    );
    ribbon(
      [[s * 0.065, 1.68, -0.1], [s * 0.07, 1.52, -0.165], [s * 0.075, 1.3, -0.205], [s * 0.07, 1.08, -0.23], [s * 0.05, 0.93, -0.25]],
      0.04,
      0.016,
    );
  }
  ribbon([[0.115, 1.66, -0.07], [0.125, 1.52, -0.13], [0.13, 1.38, -0.17], [0.12, 1.22, -0.2]], 0.032, 0.014);
  // center back lock on its own joints
  const hairC = b.chain(
    "hairBack",
    catmull([[0, 1.68, -0.1], [0, 1.55, -0.16], [0, 1.35, -0.2], [0, 1.15, -0.225], [0, 0.97, -0.24]]),
    { parent: head },
  );
  b.sweep(hairC, (t: number): [number, number] => [0.085 - 0.05 * t, 0.026], { color: HAIR, caps: { start: "round", end: "point" } });

  // braid over the right shoulder
  const braidPath = catmull([
    [-0.115, 1.68, -0.03],
    [-0.145, 1.58, 0.02],
    [-0.18, 1.46, 0.1],
    [-0.195, 1.32, 0.135],
    [-0.19, 1.17, 0.125],
    [-0.18, 1.06, 0.1],
  ]);
  b.along(braidPath, 14, (at: any) => {
    const k = 1 - 0.5 * at.t;
    b.part(new THREE.SphereGeometry(1, 6, 4), at.i % 2 ? HAIR_B : HAIR, {
      frame: at,
      bone: head,
      scale: [0.03 * k + 0.006, 0.03, 0.028 * k + 0.006],
    });
  });
  b.part(new THREE.TorusGeometry(0.02, 0.006, 4, 8), GOLD, { bone: head, at: [-0.178, 1.045, 0.098], rotation: [90, 0, 0] });
  ribbon([[-0.178, 1.04, 0.098], [-0.18, 0.99, 0.1], [-0.17, 0.95, 0.09]], 0.018, 0.008, head, HAIR_B);

  // flyaway wisps
  const wisps = b.surface(hairCap).scatter(16, { rng: R, minDist: 0.04, filter: (h: any) => h.n.y > 0.25 });
  b.cards(wisps, HAIR_BLADE, { size: [0.034, 0.1], lean: 62, flow: [0, -0.2, -1], bend: 30, vary: 0.3, rng: R, spin: 25 });

  // circlet
  b.part(new THREE.TorusGeometry(0.133, 0.0055, 4, 24), GOLD, { bone: head, at: [0, 1.762, 0.002], rotation: [72, 0, 0] });
  glow(b.part(new THREE.OctahedronGeometry(1), TEAL, { bone: head, at: [0, 1.797, 0.131], scale: [0.01, 0.017, 0.008] }), 1.4);

  // ------------------------------------------------------------------ shoulder yoke and cloak
  b.sweep(
    catmull([
      [0.13, 1.51, 0.105],
      [0.19, 1.525, 0.03],
      [0.18, 1.52, -0.07],
      [0.09, 1.52, -0.125],
      [-0.09, 1.52, -0.125],
      [-0.18, 1.52, -0.07],
      [-0.19, 1.525, 0.03],
      [-0.13, 1.51, 0.105],
    ]),
    0.03,
    { bone: chestJ, color: CLOAK_OUT },
  );
  const cloakOutline = (): Pt[] => {
    const pts: Pt[] = [[0.2, 0], [0.25, -0.3], [0.33, -0.7], [0.4, -1.0]];
    const teeth = 7;
    for (let i = 0; i <= teeth; i++) {
      const x = 0.4 - (0.8 * i) / teeth;
      pts.push([x, -0.97]);
      if (i < teeth) pts.push([x - 0.4 / teeth, -1.1, "sharp"]);
    }
    pts.push([-0.4, -1.0], [-0.33, -0.7], [-0.25, -0.3], [-0.2, 0]);
    return pts;
  };
  const cloakPaint = paint((_p, n) => (n.z > 0.35 ? LINING : CLOAK_OUT));
  b.extrude(cloakOutline(), {
    at: [0, 1.535, -0.13],
    x: [1, 0, 0],
    y: tup(norm(0, 1, 0.1)),
    thickness: 0.012,
    bevel: 0.003,
    color: cloakPaint,
    bone: chestJ,
  });
  const cloakAt = (d: number): P => [0, 1.535 - d * 0.995, -0.13 - d * 0.0995];
  const backDir = tup(norm(0, 0.1, -1));
  {
    const c = cloakAt(0.85);
    b.part(new THREE.PlaneGeometry(0.72, 0.062), "#ffffff", {
      bone: chestJ,
      at: [c[0], c[1], c[2] - 0.011],
      dir: backDir,
      axis: "z",
      texture: TRIM,
    });
  }
  for (const s of [1, -1]) {
    const c = cloakAt(0.62);
    glow(
      b.part(new THREE.CircleGeometry(0.042, 14), "#ffffff", {
        bone: chestJ,
        at: [s * 0.2, c[1], c[2] - 0.011],
        dir: backDir,
        axis: "z",
        texture: LEAF,
      }),
      0.3,
    );
    // clasps
    glow(
      b.part(new THREE.CircleGeometry(0.03, 12), "#ffffff", {
        bone: chestJ,
        at: [s * 0.13, 1.5, 0.125],
        dir: tup(norm(s * 0.25, 0.1, 1)),
        axis: "z",
        texture: LEAF,
      }),
      0.4,
    );
  }
  b.sweep(catmull([[0.13, 1.485, 0.12], [0.06, 1.42, 0.13], [0, 1.4, 0.135], [-0.06, 1.42, 0.13], [-0.13, 1.485, 0.12]]), 0.0045, {
    bone: chestJ,
    color: GOLD,
  });
  glow(b.part(new THREE.OctahedronGeometry(1), TEAL, { bone: chestJ, at: [0, 1.375, 0.138], scale: [0.016, 0.028, 0.012] }), 1.5);

  // ------------------------------------------------------------------ arms
  const Zv = V(0, 0, 1);
  const armData: Record<string, { wr: THREE.Vector3; f: THREE.Vector3; handJ: any }> = {};
  const armR = (t: number) => 0.042 - 0.016 * t;

  const makeHand = (S: string, wr: THREE.Vector3, f: THREE.Vector3, handJ: any, grip: boolean) => {
    const sp = grip ? V(-f.y, f.x, 0).normalize() : Zv.clone();
    b.capsule(wr, stepFrom(wr, f, 0.075), [0.027, 0.024], { bone: handJ, color: SKIN });
    const names = ["index", "middle", "ring", "pinky"];
    const offs = [0.029, 0.01, -0.01, -0.028];
    const lens = [0.07, 0.078, 0.072, 0.057];
    names.forEach((nm, i) => {
      const base = stepFrom(stepFrom(wr, f, 0.065), sp, offs[i]);
      const l = lens[i];
      let m: THREE.Vector3;
      let t: THREE.Vector3;
      if (grip) {
        m = base.clone().addScaledVector(f, l * 0.55).addScaledVector(Zv, l * 0.1);
        t = m.clone().addScaledVector(f, l * 0.18).addScaledVector(Zv, l * 0.55);
      } else {
        const dir = f.clone().addScaledVector(sp, offs[i] * 3.5).normalize();
        m = base.clone().addScaledVector(dir, l * 0.52);
        t = m.clone().addScaledVector(dir, l * 0.48);
      }
      const ch = b.chain(`${nm}${S}`, polyline([base, m, t]), {
        parent: handJ,
        names: [`${nm}${S}1`, `${nm}${S}2`, `${nm}${S}3`],
        role: "digit",
      });
      b.sweep(ch, [0.0105, 0.0072], { color: SKIN });
    });
    const tb = stepFrom(stepFrom(wr, f, 0.03), sp, 0.04);
    const td = grip
      ? f.clone().multiplyScalar(0.3).addScaledVector(sp, 0.9).addScaledVector(Zv, 0.3).normalize()
      : f.clone().multiplyScalar(0.55).addScaledVector(sp, 0.8).normalize();
    const tm = stepFrom(tb, td, 0.032);
    const tt = tm.clone().addScaledVector(td, 0.022).addScaledVector(f, 0.006);
    const th = b.chain(`thumb${S}`, polyline([tb, tm, tt]), {
      parent: handJ,
      names: [`thumb${S}1`, `thumb${S}2`, `thumb${S}3`],
      role: "digit",
    });
    b.sweep(th, [0.0125, 0.009], { color: SKIN });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.2, 1.46, 0);
    const el = stepFrom(sh, norm(s * 0.72, -0.69, -0.03), 0.29);
    const wr = stepFrom(el, norm(s * 0.74, -0.67, 0.12), 0.27);
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: spine,
      names: [`upperArm${S}`, `foreArm${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(arm, armR, {
      color: SKIN,
      bands: [
        [0.6, SHIRT],
        [1, SKIN],
      ],
    });
    const bracer = b.sweep(arm, (t: number) => armR(t) + 0.008, { from: 0.62, to: 0.97, color: LEATHER, caps: "flat" });
    b.sweep(arm, (t: number) => armR(t) + 0.011, { from: 0.62, to: 0.65, color: GOLD, caps: "flat" });
    b.sweep(arm, (t: number) => armR(t) + 0.011, { from: 0.94, to: 0.97, color: GOLD, caps: "flat" });
    if (s > 0) {
      const pt = bracer.at(0.8, 0);
      glow(b.decal(bracer, RUNE, { at: pt.at, dir: pt.n, up: pt.tangent, size: [0.04, 0.09] }), 1.2);
    }
    const handJ = arm.joints[2];
    const f = wr.clone().sub(el).normalize();
    armData[S] = { wr, f, handJ };
    makeHand(S, wr, f, handJ, s > 0);

    // pauldron
    const P0 = V(s * 0.21, 1.49, 0);
    const plates = s > 0 ? 3 : 2;
    const defs = [
      { c: [0, 0.03, 0], a: [s * 0.25, 1, 0], r: 0.082 },
      { c: [s * 0.04, 0.012, 0], a: [s * 0.6, 1, 0], r: 0.088 },
      { c: [s * 0.085, -0.012, 0], a: [s * 1, 0.7, 0], r: 0.085 },
    ];
    let last = defs[0];
    for (let i = 0; i < plates; i++) {
      const d = defs[i];
      const c = P0.clone().add(V(d.c[0], d.c[1], d.c[2]));
      const a = norm(d.a[0], d.a[1], d.a[2]);
      b.lathe(dome(d.r), { at: tup(c), axis: tup(a), segments: 9, color: i % 2 ? LEATHER_D : LEATHER, bone: arm.joints[0] });
      last = d;
    }
    {
      const c = P0.clone().add(V(last.c[0], last.c[1], last.c[2]));
      const a = norm(last.a[0], last.a[1], last.a[2]);
      const apex = c.clone().addScaledVector(a, last.r * 0.72 + 0.004);
      glow(
        b.part(new THREE.CircleGeometry(0.027, 12), "#ffffff", { bone: arm.joints[0], at: tup(apex), dir: tup(a), axis: "z", texture: LEAF }),
        0.3,
      );
    }
  }

  // ------------------------------------------------------------------ legs
  const legKeys = [0.074, 0.066, 0.052, 0.05, 0.042, 0.036];
  const legR = (t: number) => {
    const x = t * (legKeys.length - 1);
    const i = Math.min(Math.floor(x), legKeys.length - 2);
    return legKeys[i] + (legKeys[i + 1] - legKeys[i]) * (x - i);
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.1, 0.93, 0], [s * 0.14, 0.1, 0.02], [0.46, 0.45], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.14, 0, 0.1],
    });
    b.sweep(leg, legR, {
      color: PANTS,
      bands: [
        [0.6, PANTS],
        [1, BOOT],
      ],
    });
    b.sweep(leg, (t: number) => legR(t) + 0.01, { from: 0.56, to: 0.64, color: GOLD, caps: "flat" });
    b.sweep(leg, (t: number) => legR(t) + 0.006, { from: 0.64, to: 0.69, color: LEATHER, caps: "flat" });
    const A = pts[2];
    const ball = V(s * 0.14, 0.05, 0.12);
    const toe = V(s * 0.14, 0.04, 0.23);
    const foot = b.chain(`foot${S}`, polyline([A, ball, toe]), { parent: leg, names: [`foot${S}`, `toe${S}`] });
    b.sweep(foot, (t: number): [number, number] => [
      0.052 - 0.006 * t,
      t < 0.54 ? 0.06 - 0.024 * t : 0.047 - (0.015 * (t - 0.54)) / 0.46,
    ], { color: BOOT, caps: { start: "round", end: "point" } });
    b.part(new THREE.SphereGeometry(1, 8, 6), BOOT, { bone: foot.joints[0], at: [s * 0.14, 0.045, -0.005], scale: [0.05, 0.045, 0.06] });
    b.part(new THREE.BoxGeometry(0.1, 0.014, 0.26), INK, { bone: foot.joints[0], at: [s * 0.14, 0.007, 0.085] });
  }

  // ------------------------------------------------------------------ pouch and dagger
  b.part(new THREE.BoxGeometry(0.07, 0.09, 0.06), LEATHER, { bone: hips, at: [0.215, 0.94, 0.07], rotation: [0, 12, 0] });
  b.part(new THREE.BoxGeometry(0.075, 0.04, 0.066), LEATHER_D, { bone: hips, at: [0.215, 0.975, 0.073], rotation: [0, 12, 0] });
  b.part(new THREE.SphereGeometry(1, 6, 4), GOLD, { bone: hips, at: [0.225, 0.955, 0.1], scale: 0.01 });
  b.capsule([-0.235, 1.0, 0.03], [-0.258, 0.74, -0.045], [0.022, 0.012], { bone: hips, color: LEATHER_D });
  b.rod([-0.235, 1.0, 0.03], [-0.233, 1.075, 0.045], 0.012, { bone: hips, color: LEATHER });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.025), GOLD, { bone: hips, at: [-0.235, 1.005, 0.032] });
  glow(b.part(new THREE.OctahedronGeometry(1), TEAL, { bone: hips, at: [-0.233, 1.09, 0.047], scale: 0.011 }), 1.3);
  b.rod([-0.16, 1.04, 0.07], [-0.235, 0.99, 0.034], 0.008, { bone: hips, color: LEATHER_D });

  // ------------------------------------------------------------------ quiver
  const qBot = V(0.1, 1.0, -0.28);
  const qTop = V(-0.13, 1.62, -0.25);
  const qAx = qTop.clone().sub(qBot);
  const qLen = qAx.length();
  const ax = qAx.clone().normalize();
  const qu = V(1, 0, 0).cross(ax).normalize();
  const qw = ax.clone().cross(qu);
  b.lathe(
    [[0, 0], [0.055, 0], [0.065, 0.03], [0.072, qLen * 0.8], [0.085, qLen - 0.02], [0.085, qLen], [0.07, qLen], [0, qLen - 0.02]],
    { at: tup(qBot), axis: tup(ax), segments: 10, color: LEATHER, bone: chestJ },
  );
  for (const k of [0.16, 0.5]) {
    const ringQ = b.ring(frame(tup(qBot.clone().addScaledVector(ax, qLen * k)), tup(ax)), { count: 10, radius: 0.079 });
    b.sweep(catmull(ringQ.items, { closed: true }), 0.009, { bone: chestJ, color: GOLD });
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.05, 0.11), "#ffffff", {
      bone: chestJ,
      at: tup(qBot.clone().addScaledVector(ax, qLen * 0.33).addScaledVector(qu, -0.0745)),
      dir: tup(qu.clone().negate()),
      axis: "z",
      up: tup(ax),
      texture: RUNE,
    }),
    1.1,
  );
  const frT: any[] = [];
  const frW: any[] = [];
  for (let i = 0; i < 6; i++) {
    const th = (i / 6) * Math.PI * 2;
    const off = qu.clone().multiplyScalar(Math.cos(th) * 0.04).addScaledVector(qw, Math.sin(th) * 0.04);
    const low = qBot.clone().addScaledVector(ax, 0.2).add(off);
    const top = qTop.clone().addScaledVector(ax, 0.1 + 0.045 * (i % 3)).add(off.clone().multiplyScalar(1.5));
    b.rod(low, top, 0.0045, { bone: chestJ, color: SHAFT });
    const dir = top.clone().sub(low).normalize();
    const f0 = frame(tup(top.clone().addScaledVector(dir, -0.085)), tup(dir));
    (i % 2 ? frW : frT).push(f0);
    b.part(new THREE.SphereGeometry(1, 6, 4), GOLD, { bone: chestJ, at: tup(top), scale: 0.007 });
  }
  b.cards(frT, FLETCH_T, { size: [0.03, 0.075], lean: 0, cross: true, flow: [1, 0, 0], sink: 0 });
  b.cards(frW, FLETCH_W, { size: [0.03, 0.075], lean: 0, cross: true, flow: [1, 0, 0], sink: 0 });
  b.rod([-0.12, 1.55, -0.22], [-0.15, 1.525, -0.1], 0.012, { bone: chestJ, color: LEATHER_D });
  b.rod([0.08, 1.05, -0.24], [0.1, 1.04, -0.12], 0.01, { bone: chestJ, color: LEATHER_D });

  // ------------------------------------------------------------------ bow in the left hand
  {
    const { wr, f, handJ } = armData["L"];
    const G = stepFrom(wr, f, 0.097).addScaledVector(Zv, 0.03);
    const rel: P[] = [
      [0, -0.62, -0.15], [0, -0.54, -0.115], [0, -0.4, -0.06], [0, -0.22, -0.015], [0, -0.07, 0],
      [0, 0.07, 0], [0, 0.22, -0.015], [0, 0.4, -0.06], [0, 0.54, -0.115], [0, 0.62, -0.15],
    ];
    const pts = rel.map((r) => V(G.x + r[0], G.y + r[1], G.z + r[2]));
    const bowPath = catmull(pts);
    b.sweep(bowPath, (t: number): [number, number] => {
      const u = 1 - Math.abs(2 * t - 1);
      return [0.01 + 0.009 * u, 0.007 + 0.006 * u];
    }, { bone: handJ, color: WOOD });
    b.rod(G.clone().add(V(0, -0.075, 0)), G.clone().add(V(0, 0.075, 0)), 0.0185, { bone: handJ, color: LEATHER_D });
    for (const y of [-0.085, 0.085]) b.part(new THREE.TorusGeometry(0.019, 0.004, 4, 8), GOLD, { bone: handJ, at: tup(G.clone().add(V(0, y, 0))), rotation: [90, 0, 0] });
    const tipT = pts[pts.length - 1];
    const tipB = pts[0];
    b.rod(tipT, tipB, 0.0025, { bone: handJ, color: CREAM });
    for (const tp of [tipT, tipB]) b.part(new THREE.SphereGeometry(1, 6, 4), GOLD, { bone: handJ, at: tup(tp), scale: 0.0125 });
    for (const t of [0.14, 0.27, 0.73, 0.86]) {
      const p = bowPath.at(t);
      glow(b.part(new THREE.OctahedronGeometry(1), TEAL, { bone: handJ, at: [p.x, p.y, p.z + 0.006], scale: [0.007, 0.022, 0.007] }), 1.4);
    }
  }

  return b.root;
}
