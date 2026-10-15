```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  limb,
  mottle,
  stripes,
  grain,
  countershade,
  spots,
  paint,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Oasis Caravan Diorama",
  description:
    "A whimsical low-poly desert oasis on a round wooden plinth: a kidney-shaped pond with lotus and reeds, five palms, three striped tents, a hieroglyph obelisk and pyramid, a glowing campfire, bunting, and three rigged Bactrian camels (two adults and a calf).",
};

const YAXIS = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const G = 0.1; // ground height of the sand
  const root = b.joint("base", { at: [0, G, 0] });
  const S = { bone: root };
  const rand = rng(11);

  // ------------------------------------------------------------------ palette
  const CREAM = "#f6e8c6";
  const RED = "#c8402f";
  const TEAL = "#1f8f8a";
  const GOLD = "#f0b93f";
  const BRASS = "#c8962e";
  const WOODC = "#7a4f2b";
  const ROPE = "#c9a56a";
  const STONE = "#8f8a82";

  // ------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 64 64">
      <ellipse cx="32" cy="36" rx="26" ry="21" fill="#fffaf0" stroke="#2b1a10" stroke-width="5"/>
      <circle cx="35" cy="37" r="15" fill="#5a3418"/>
      <circle cx="35" cy="37" r="8.5" fill="#150a05"/>
      <circle cx="40" cy="30" r="5" fill="#ffffff"/>
      <circle cx="30" cy="44" r="2.4" fill="#ffffff"/>
      <path d="M10 24 Q4 16 6 8 M20 16 Q18 8 22 3 M32 13 Q32 6 36 2" stroke="#2b1a10" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 60 100">
      <path d="M6 100 L6 40 Q6 4 30 4 Q54 4 54 40 L54 100 Z" fill="#2b1522"/>
      <path d="M16 100 L16 46 Q16 18 30 16 Q44 18 44 46 L44 100 Z" fill="#74303c"/>
      <path d="M6 100 L6 40 Q6 4 30 4 Q54 4 54 40 L54 100 Z" fill="none" stroke="#f2d27a" stroke-width="4"/>
      <path d="M6 100 L6 40 Q8 12 26 7 Q13 42 22 100 Z" fill="#c8402f"/>
      <path d="M54 100 L54 40 Q52 12 34 7 Q47 42 38 100 Z" fill="#f3e3bf"/>
      <path d="M8 58 L20 56 M52 58 L40 56" stroke="#f0b93f" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const RUG = svg(
    `<svg viewBox="0 0 80 50">
      <rect width="80" height="50" fill="#8e2b3a"/>
      <rect x="3" y="3" width="74" height="44" fill="none" stroke="#f3dca0" stroke-width="3"/>
      <rect x="8" y="8" width="64" height="34" fill="none" stroke="#1f6f78" stroke-width="2"/>
      <path d="M40 8 L58 25 L40 42 L22 25 Z" fill="#f3b94a"/>
      <path d="M40 15 L51 25 L40 35 L29 25 Z" fill="#1f6f78"/>
      <path d="M40 21 L44 25 L40 29 L36 25 Z" fill="#f6e8c6"/>
      <g fill="#f3dca0"><circle cx="14" cy="25" r="3"/><circle cx="66" cy="25" r="3"/><circle cx="14" cy="13" r="2"/><circle cx="66" cy="13" r="2"/><circle cx="14" cy="37" r="2"/><circle cx="66" cy="37" r="2"/></g>
    </svg>`,
    { size: 256 },
  );
  const WATER = svg(
    `<svg viewBox="0 0 100 70">
      <g fill="none" stroke="#eafffb" stroke-width="1.5" stroke-linecap="round">
        <path d="M16 30 Q28 24 42 29"/><path d="M52 20 Q64 14 78 20"/><path d="M60 44 Q72 38 86 44"/>
        <path d="M24 46 Q34 41 46 45"/><path d="M40 10 Q48 7 56 10"/><path d="M10 40 Q16 37 22 40"/><path d="M70 30 Q76 28 82 30"/>
      </g>
      <g fill="#ffffff"><path d="M30 18 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z"/><path d="M72 52 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5z"/><path d="M84 18 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5z"/></g>
    </svg>`,
    { size: 512 },
  );
  const FLAG = svg(
    `<svg viewBox="0 0 60 40">
      <rect width="60" height="40" fill="#1c7f8a"/>
      <rect x="1.5" y="1.5" width="57" height="37" fill="none" stroke="#f6c844" stroke-width="2"/>
      <circle cx="24" cy="20" r="13" fill="#f6c844"/><circle cx="29" cy="18" r="11" fill="#1c7f8a"/>
      <polygon points="43,12 45.3,17.5 51,18 46.7,21.8 48,27.5 43,24.5 38,27.5 39.3,21.8 35,18 40.7,17.5" fill="#f6c844"/>
    </svg>`,
    { size: 128 },
  );
  const BUNT = svg(
    `<svg viewBox="0 0 64 100">
      <polygon points="3,98 61,98 32,4" fill="#ffffff" stroke="#9a9a9a" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="14,90 50,90 32,36" fill="#dcdcdc"/>
    </svg>`,
    { size: 128 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 30 100">
      <g fill="none" stroke="#f2c14e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="15" cy="9" rx="5" ry="6.5"/><path d="M15 15 V34 M7 22 H23"/>
        <path d="M4 46 Q15 36 26 46 Q15 54 4 46 Z"/><circle cx="15" cy="46" r="2.5"/>
        <path d="M4 62 q4 -6 8 0 t8 0 t6 0"/><path d="M4 70 q4 -6 8 0 t8 0 t6 0"/>
        <path d="M6 88 L15 78 L24 88 Z"/><circle cx="15" cy="94" r="3"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 100 40">
      <rect width="100" height="40" fill="#8a5a2e"/>
      <rect x="2" y="2" width="96" height="36" fill="none" stroke="#4b2e17" stroke-width="3"/>
      <path d="M2 14 H98 M2 26 H98" stroke="#7a4f27" stroke-width="1.2"/>
      <text x="40" y="27" font-size="19" font-family="Georgia, serif" font-weight="bold" fill="#fbe9b7" text-anchor="middle">OASIS</text>
      <polygon points="72,12 90,20 72,28 76,20" fill="#fbe9b7"/>
    </svg>`,
    { size: 256 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 40 60">
      <path d="M4 60 Q6 30 2 8 Q12 28 14 60 Z" fill="#3f9a4a"/>
      <path d="M12 60 Q16 24 14 2 Q24 24 24 60 Z" fill="#5dbb55"/>
      <path d="M22 60 Q26 34 34 12 Q34 34 31 60 Z" fill="#3f9a4a"/>
      <path d="M28 60 Q34 42 39 28 Q38 46 36 60 Z" fill="#7dd062"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------ helpers
  const place = (x: number, z: number, yaw = 0, k = 1, y = G) => {
    const o = V(x, y, z);
    const q = new THREE.Quaternion().setFromAxisAngle(YAXIS, yaw);
    const P = (px: number, py: number, pz: number) => V(px, py, pz).multiplyScalar(k).applyQuaternion(q).add(o);
    const D = (dx: number, dy: number, dz: number) => V(dx, dy, dz).applyQuaternion(q).normalize();
    const R = (r: number) => r * k;
    return { P, D, R, q, o };
  };
  const toYaw = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z);
  const ell = (rx: number, ry: number, rz: number, w = 8, h = 6) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    return g;
  };

  // ------------------------------------------------------------------ base plinth and sand
  const WOOD = grain("#6e4527", "#54331c", { size: 0.02, axis: "y", seed: 3 });
  b.lathe(
    [
      [0, 0],
      [0.92, 0],
      [0.92, 0.035],
      [0.88, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], color: WOOD, ...S },
  );
  b.lathe(
    [
      [0.915, 0.012],
      [0.935, 0.012],
      [0.935, 0.03],
      [0.915, 0.03],
    ],
    { at: [0, 0, 0], color: BRASS, ...S },
  );
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    studs.push(new THREE.SphereGeometry(0.0085, 6, 4).translate(Math.cos(a) * 0.94, 0.021, Math.sin(a) * 0.94));
  }
  b.part(mergeGeometries(studs)!, GOLD, { bone: root, at: [0, 0, 0] });

  const SAND = mottle("#efd08c", "#e2bb72", { size: 0.16, contrast: 0.8, seed: 2 });
  const STRATA = stripes("#e2b868", "#cf9c52", { size: 0.022, axis: "y", width: 0.5, wobble: 0.6, seed: 4 });
  const GROUNDP = paint((_p, n) => (n.y > 0.6 ? SAND : STRATA));
  b.lathe(
    [
      [0, 0.04],
      [0.84, 0.04],
      [0.86, 0.07],
      [0.82, G],
      [0, G],
    ],
    { at: [0, 0, 0], color: GROUNDP, ...S },
  );

  // dunes
  for (const [x, z, sx, sy, sz] of [
    [0.34, 0.64, 0.15, 0.05, 0.08],
    [-0.68, -0.3, 0.07, 0.05, 0.15],
  ]) {
    const g = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(sx, sy, sz);
    b.part(g, SAND, { at: [x, G, z], ...S });
  }

  // ------------------------------------------------------------------ pond
  const PC = V(0.02, G, 0.02);
  const pondOutline = (extra: number) =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      const r = 0.3 + 0.04 * Math.cos(2 * a + 0.6) + 0.03 * Math.sin(3 * a) + extra;
      return [r * Math.cos(a) * 1.1, r * Math.sin(a) * 0.78] as [number, number];
    });
  const RIMP = mottle("#c9a15a", "#b88d48", { size: 0.08, seed: 6 });
  b.extrude(pondOutline(0.055), {
    at: [PC.x, G + 0.014, PC.z],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.056,
    bevel: 0.005,
    smoothing: 1,
    color: RIMP,
    ...S,
  });
  const WATERP = paint((p) => {
    const d = Math.hypot((p.x - PC.x) / 1.1, (p.z - PC.z) / 0.78);
    return mix("#1b8fb8", "#46dccb", smoothstep(0.05, 0.34, d));
  });
  b.extrude(pondOutline(0), {
    at: [PC.x, G + 0.01, PC.z],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.036,
    bevel: 0.003,
    smoothing: 1,
    color: WATERP,
    ...S,
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.76, 0.54), "#ffffff", {
      at: [PC.x, G + 0.0305, PC.z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: WATER,
      ...S,
    }),
    0.45,
  );
  // lily pads and a lotus
  const PAD = "#3fae5a";
  for (const [x, z, r] of [
    [-0.12, 0.08, 0.035],
    [0.14, -0.03, 0.03],
    [0.1, 0.1, 0.026],
  ]) {
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 8), PAD, { at: [x, G + 0.0305, z], flat: true, ...S });
  }
  {
    const c = V(-0.12, G + 0.034, 0.08);
    b.ring(frame(c, [0, 1, 0]), { count: 6, radius: 0.006, tilt: 55 }, (it) =>
      b.spike(it, it, 0.028, 0.011, { color: "#ff8fb8", bone: root }),
    );
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: [c.x, c.y + 0.008, c.z], ...S });
  }
  // rim rocks and grass tufts
  const rimPath = catmull(
    pondOutline(0.06).map(([u, v]) => V(PC.x + u, G + 0.04, PC.z - v)),
    { closed: true },
  );
  const ROCKC = ["#9a948a", "#b0a496", "#847d74"];
  for (let i = 0; i < 18; i++) {
    const p = rimPath.at((i + 0.5) / 18);
    const out = p.clone().sub(PC).multiplyScalar(0.05);
    const rs = 0.022 + rand() * 0.02;
    b.part(ell(rs * 1.25, rs * 0.85, rs, 5, 4), ROCKC[i % 3], {
      at: [p.x + out.x, G + 0.036, p.z + out.z],
      rotation: [0, rand() * 360, 0],
      flat: true,
      ...S,
    });
  }
  const tufts = [];
  for (let i = 0; i < 14; i++) {
    const p = rimPath.at((i + 0.3 + rand() * 0.4) / 14);
    const out = p.clone().sub(PC).multiplyScalar(0.1);
    tufts.push(frame(V(p.x + out.x, G + 0.034, p.z + out.z), [0, 1, 0]));
  }
  b.cards(tufts, GRASS, { size: [0.05, 0.07], cross: true, vary: 0.3, spin: 180, rng: rng(5), lean: 8, bone: root });

  // ------------------------------------------------------------------ palms
  const TRUNKP = paint((_p, _n, s) => (Math.floor(s[0] * 22) % 2 ? "#8a6238" : "#6f4c2b"));
  const frondPaint = (a: string, c: string, rib: string) =>
    paint((_p, _n, s) => (Math.abs(s[1] - 0.5) < 0.05 ? rib : Math.floor(s[0] * 16 + (s[1] < 0.5 ? 0 : 0.5)) % 2 ? a : c));
  const FROND1 = frondPaint("#4fae4a", "#3b9a44", "#c9d97a");
  const FROND2 = frondPaint("#5cbf6a", "#2f9a68", "#d6e58a");

  function palm(id: string, x: number, z: number, h: number, lx: number, lz: number, twist: number, fp: typeof FROND1) {
    const f = h / 0.62;
    const base = V(x, G, z);
    const pts = [
      base.clone().add(V(0, -0.01, 0)),
      base.clone().add(V(lx * 0.1, h * 0.35, lz * 0.1)),
      base.clone().add(V(lx * 0.45, h * 0.7, lz * 0.45)),
      base.clone().add(V(lx, h, lz)),
    ];
    const trunk = b.chain(`trunk${id}`, catmull(pts), {
      parent: root,
      names: [`trunk${id}1`, `trunk${id}2`, `trunk${id}3`, `crown${id}`],
    });
    b.sweep(trunk, [0.055 * f, 0.04 * f, 0.031 * f, 0.027 * f], { color: TRUNKP });
    const crown = trunk.joints[trunk.joints.length - 1];
    const top = pts[3];
    b.part(ell(0.036 * f, 0.03 * f, 0.036 * f), "#6b7a2a", { bone: crown, at: [top.x, top.y + 0.005, top.z] });
    const dates: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      dates.push(
        new THREE.SphereGeometry(0.014 * f, 6, 4).translate(
          top.x + Math.cos(a) * 0.03 * f,
          top.y - 0.03 * f,
          top.z + Math.sin(a) * 0.03 * f,
        ),
      );
    }
    b.part(mergeGeometries(dates)!, "#c0561e", { bone: crown, at: [0, 0, 0] });
    const L = 0.34 * f;
    for (let i = 0; i < 9; i++) {
      const phi = twist + (i * Math.PI * 2) / 9 + (rand() - 0.5) * 0.2;
      const dir = V(Math.sin(phi), 0, Math.cos(phi));
      const side = V(dir.z, 0, -dir.x);
      const up = i % 3 === 0;
      const len = L * (up ? 0.85 : 1 + rand() * 0.12);
      const droop = up ? -0.1 : 0.2 + rand() * 0.25;
      const w = len * 0.17;
      const root0 = top.clone().add(V(0, 0.012 * f, 0));
      const c1 = root0.clone().addScaledVector(dir, len * 0.35).add(V(0, len * 0.32, 0));
      const c2 = root0.clone().addScaledVector(dir, len * 0.72).add(V(0, len * 0.27, 0));
      const tip = root0.clone().addScaledVector(dir, len * 0.98).add(V(0, -len * droop, 0));
      const edge = (sg: number) =>
        bezier(
          root0.clone().addScaledVector(side, sg * 0.004),
          c1.clone().addScaledVector(side, sg * w * 0.55),
          c2.clone().addScaledVector(side, sg * w * 0.85),
          tip.clone().addScaledVector(side, sg * 0.004),
        );
      b.membrane(edge(1), edge(-1), { color: fp, thickness: 0.005, bone: crown });
    }
  }
  palm("A", -0.28, -0.12, 0.62, 0.1, 0.02, 0.3, FROND1);
  palm("B", 0.3, -0.2, 0.72, -0.12, 0.05, 1.1, FROND2);
  palm("C", -0.2, 0.3, 0.46, 0.05, -0.05, 2.0, FROND1);
  palm("D", 0.64, 0.05, 0.55, -0.08, 0.06, 0.7, FROND2);
  palm("E", 0.28, 0.14, 0.3, 0.04, 0.02, 1.7, FROND1);

  // ------------------------------------------------------------------ camels
  type CamelOpts = {
    id: string;
    x: number;
    z: number;
    yaw: number;
    k: number;
    fur: [string, string];
    belly: string;
    blanket: [string, string] | null;
    load: "baskets" | "sack" | "none";
  };
  function camel(o: CamelOpts) {
    const { P, D, R, q } = place(o.x, o.z, o.yaw, o.k);
    const n = (s: string) => `${s}_${o.id}`;
    const coat = countershade(mottle(o.fur[0], o.fur[1], { size: 0.045, contrast: 0.7, seed: o.id.charCodeAt(0) }), o.belly, {
      level: -0.35,
      soft: 0.3,
    });
    const DARKH = "#6b4527";
    const NOSE = "#3e2a1e";

    // spine, body
    const spine = b.chain(
      n("body"),
      catmull([P(0, 0.98, -0.52), P(0, 1.0, -0.18), P(0, 1.03, 0.18), P(0, 1.0, 0.5)]),
      { parent: root, names: [n("hips"), n("spine"), n("chest")], role: "spine" },
    );
    const body = b.sweep(
      spine,
      (t) => [R(0.19 + 0.06 * Math.sin(Math.PI * t)), R(0.24 + 0.04 * Math.sin(Math.PI * t))] as [number, number],
      { color: coat },
    );
    // humps
    b.part(ell(R(0.15), R(0.2), R(0.18)), coat, { bone: spine.joints[1], at: P(0, 1.3, -0.24), quat: q });
    b.part(ell(R(0.15), R(0.2), R(0.18)), coat, { bone: spine.joints[2], at: P(0, 1.3, 0.26), quat: q });
    b.spike(P(0, 1.42, -0.24), D(0, 1, -0.25), R(0.12), R(0.07), { color: DARKH, bone: spine.joints[1] });
    b.spike(P(0, 1.42, 0.26), D(0, 1, -0.25), R(0.12), R(0.07), { color: DARKH, bone: spine.joints[2] });

    // blanket, loads
    if (o.blanket) {
      const skin = b.surface(body);
      const [c1, c2] = o.blanket;
      const bandPaint = paint((_p, _n, s) => (Math.floor(s[0] * 22) % 2 ? c1 : c2));
      const loopAt = (dz: number) => skin.loop(P(0, 1.02, dz), { dir: D(0, 0, 1), lift: R(0.012) });
      b.sweep(loopAt(0.02), () => [R(0.075), R(0.012)] as [number, number], { section: "box", color: bandPaint });
      for (const dz of [-0.07, 0.11]) {
        b.sweep(loopAt(dz), () => [R(0.01), R(0.018)] as [number, number], { section: "box", color: GOLD });
      }
    }
    const loadBone = spine.joints[1];
    if (o.load === "baskets") {
      const WICK = stripes("#b9894a", "#8b5e2c", { size: 0.012, axis: "y", width: 0.45, wobble: 0.2, seed: 8 });
      for (const s of [1, -1]) {
        b.part(new THREE.CylinderGeometry(R(0.085), R(0.065), R(0.17), 8), WICK, {
          bone: loadBone,
          at: P(s * 0.3, 0.84, 0.02),
          quat: q,
          flat: true,
        });
        b.rod(P(s * 0.2, 1.12, 0.02), P(s * 0.29, 0.93, 0.02), R(0.008), { color: ROPE, bone: loadBone });
        for (const dz of [-0.03, 0.04]) {
          b.part(new THREE.SphereGeometry(R(0.03), 6, 4), dz > 0 ? "#e8782b" : "#d9a521", {
            bone: loadBone,
            at: P(s * 0.3, 0.94, 0.02 + dz),
          });
        }
      }
    } else if (o.load === "sack") {
      b.part(ell(R(0.2), R(0.15), R(0.12), 8, 6), "#e9dcc0", { bone: loadBone, at: P(0, 1.4, 0.01), quat: q });
      b.sweep([P(-0.2, 1.4, 0.01), P(0, 1.55, 0.01), P(0.2, 1.4, 0.01)], R(0.012), { color: ROPE, bone: loadBone });
    }

    // neck, head
    const neck = b.chain(n("neck"), catmull([P(0, 1.02, 0.4), P(0, 1.22, 0.58), P(0, 1.5, 0.7), P(0, 1.64, 0.84)]), {
      parent: spine.joints[2],
      names: [n("neck1"), n("neck2"), n("neck3"), n("head")],
      role: "neck",
    });
    b.sweep(neck, [R(0.15), R(0.1), R(0.08), R(0.075)], { color: coat });
    const collar = b.ring(neck.at(0.5), { count: 10, radius: R(0.115) });
    b.sweep(catmull(collar.items, { closed: true }), R(0.02), { color: o.blanket ? o.blanket[0] : RED, sides: 6 });
    const head = neck.joints[neck.joints.length - 1];
    const skull = b.part(ell(R(0.1), R(0.09), R(0.11)), coat, { bone: head, at: P(0, 1.66, 0.9), quat: q });
    b.frustumBox(P(0, 1.65, 0.95), P(0, 1.57, 1.17), [R(0.15), R(0.13)], [R(0.12), R(0.1)], { color: "#dcb67c", bone: head });
    b.part(ell(R(0.062), R(0.05), R(0.05), 6, 5), NOSE, { bone: head, at: P(0, 1.575, 1.18), quat: q });
    b.frustumBox(P(0, 1.625, 1.02), P(0, 1.617, 1.05), [R(0.15), R(0.128)], [R(0.15), R(0.128)], {
      color: o.blanket ? o.blanket[0] : RED,
      bone: head,
    });
    const jaw = b.joint(n("jaw"), { parent: head, at: P(0, 1.6, 0.95), aim: P(0, 1.52, 1.14), role: "jaw" });
    b.frustumBox(P(0, 1.6, 0.95), P(0, 1.53, 1.14), [R(0.1), R(0.05)], [R(0.085), R(0.045)], { color: "#cfa56c", bone: jaw });
    b.spike(P(0, 1.52, 1.05), D(0, -1, -0.15), R(0.08), R(0.03), { color: DARKH, bone: jaw });
    b.spike(P(0, 1.73, 0.9), D(0, 1, 0.3), R(0.08), R(0.05), { color: DARKH, bone: head });
    for (const s of [1, -1]) {
      b.decal(skull, EYE, {
        at: P(s * 0.088, 1.69, 0.93),
        dir: D(s, 0.2, 0.35),
        size: [R(0.1), R(0.1)],
        mirror: s > 0,
      });
      b.spike(P(s * 0.065, 1.725, 0.86), D(s * 0.6, 0.7, -0.35), R(0.09), R(0.035), { color: coat, bone: head });
      b.part(new THREE.SphereGeometry(R(0.012), 5, 4), "#2a1a10", { bone: head, at: P(s * 0.03, 1.6, 1.215) });
    }

    // tail
    const tail = b.chain(n("tail"), catmull([P(0, 1.0, -0.5), P(0, 0.95, -0.72), P(0, 0.72, -0.8), P(0, 0.5, -0.78)]), {
      parent: spine.joints[0],
      names: [n("tail1"), n("tail2"), n("tail3"), n("tail4")],
      role: "tail",
    });
    b.sweep(tail, [R(0.05), R(0.025)], { color: coat });
    b.part(ell(R(0.045), R(0.09), R(0.045), 6, 5), DARKH, {
      bone: tail.joints[tail.joints.length - 1],
      at: P(0, 0.46, -0.78),
      quat: q,
    });

    // legs
    for (const [fh, z, parent] of [
      ["F", 0.33, spine.joints[2]],
      ["H", -0.4, spine.joints[0]],
    ] as const) {
      for (const s of [1, -1]) {
        const tag = `${fh}${s > 0 ? "L" : "R"}`;
        const front = fh === "F";
        const hip = P(s * 0.17, 0.86, z);
        const foot = P(s * 0.17, 0.035, z + (front ? 0.03 : -0.03));
        const pts = limb(hip, foot, [R(0.32), R(0.32), R(0.3)], [D(0, 0, front ? -1 : 1), D(0, 0, front ? 1 : -1)]);
        const leg = b.chain(n(`leg${tag}`), pts, {
          parent,
          names: [n(`hip${tag}`), n(`knee${tag}`), n(`ankle${tag}`), n(`foot${tag}`)],
          role: "leg",
          contact: [foot.x, G, foot.z],
        });
        b.sweep(leg, [R(0.09), R(0.065), R(0.045), R(0.04)], { color: coat });
        b.part(ell(R(0.06), R(0.035), R(0.085), 8, 5), "#5d4129", {
          bone: leg.joints[leg.joints.length - 1],
          at: foot,
          quat: q,
        });
        b.part(ell(R(0.05), R(0.05), R(0.05), 6, 4), DARKH, { bone: leg.joints[2], at: pts[2], quat: q });
      }
    }
  }
  camel({ id: "A", x: -0.42, z: 0.4, yaw: 1.2, k: 0.2, fur: ["#cc9d5e", "#b88848"], belly: "#e6c690", blanket: [RED, CREAM], load: "baskets" });
  camel({ id: "B", x: 0.52, z: 0.4, yaw: -1.25, k: 0.2, fur: ["#b88150", "#9c6a3c"], belly: "#d9b484", blanket: [TEAL, GOLD], load: "sack" });
  camel({ id: "C", x: 0.1, z: 0.52, yaw: 0.35, k: 0.12, fur: ["#e4bf84", "#d3a96c"], belly: "#f2dcb0", blanket: null, load: "none" });

  // ------------------------------------------------------------------ lantern helper
  function lantern(pos: THREE.Vector3) {
    b.rod(pos, pos.clone().add(V(0, -0.02, 0)), 0.0025, { color: BRASS, ...S });
    b.part(new THREE.ConeGeometry(0.02, 0.016, 6), BRASS, { at: [pos.x, pos.y - 0.028, pos.z], ...S });
    glow(b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.034, 6), "#ffcf6b", { at: [pos.x, pos.y - 0.053, pos.z], ...S }), 1.6);
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.005, 6), BRASS, { at: [pos.x, pos.y - 0.073, pos.z], ...S });
  }

  // ------------------------------------------------------------------ tent A: striped bell tent
  const poleWood = WOODC;
  {
    const { P, D, q } = place(-0.45, -0.4, toYaw(-0.45, -0.4, 0, 0.1), 1);
    const TENTP = paint((_p, _n, s) => (s[0] < 0.02 ? "#7a2a1f" : (Math.floor(s[1] / 36) % 2 + 2) % 2 ? CREAM : RED));
    const tent = b.lathe(
      [
        [0, 0],
        [0.175, 0],
        [0.175, 0.12],
        [0.06, 0.3],
        [0, 0.31],
      ],
      { at: P(0, 0, 0), segments: 10, color: TENTP, ...S },
    );
    b.lathe(
      [
        [0.172, 0.108],
        [0.184, 0.108],
        [0.184, 0.126],
        [0.172, 0.126],
      ],
      { at: P(0, 0, 0), segments: 10, color: GOLD, ...S },
    );
    b.rod(P(0, 0.29, 0), P(0, 0.44, 0), 0.004, { color: poleWood, ...S });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), GOLD, { at: P(0, 0.445, 0), ...S });
    b.part(new THREE.BoxGeometry(0.1, 0.065, 0.003), "#ffffff", { at: P(0.055, 0.405, 0), quat: q, texture: FLAG, ...S });
    b.decal(tent, DOOR, { at: P(0, 0.1, 0.17), dir: D(0, 0.25, 1), size: [0.1, 0.17] });
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 5 + (i * Math.PI * 2) / 5.5 + 0.5;
      const sx = Math.sin(a);
      const cz = Math.cos(a);
      b.rod(P(sx * 0.1, 0.18, cz * 0.1), P(sx * 0.3, 0.005, cz * 0.3), 0.0025, { color: ROPE, ...S });
      b.spike(P(sx * 0.3, 0.025, cz * 0.3), D(0, 1, 0), 0.03, 0.006, { color: poleWood, ...S });
    }
  }

  // ------------------------------------------------------------------ tent B: gabled merchant tent
  {
    const { P, D, q } = place(0.12, -0.58, 0, 1);
    const wall = b.part(new THREE.BoxGeometry(0.34, 0.12, 0.26), "#f3e3bf", { at: P(0, 0.06, 0), quat: q, ...S });
    const ROOFP = paint((_p, _n, s) => ((Math.floor((s[0] + 1) / 0.06) % 2 + 2) % 2 ? CREAM : TEAL));
    b.extrude(
      [
        [-0.21, 0],
        [0.21, 0],
        [0, 0.15, "sharp"],
      ],
      { at: P(0, 0.12, 0), x: D(1, 0, 0), y: D(0, 1, 0), thickness: 0.32, bevel: 0.004, color: ROOFP, ...S },
    );
    for (const dz of [-0.16, 0.16]) b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { at: P(0, 0.27, dz), ...S });
    b.rod(P(0, 0.27, -0.16), P(0, 0.27, 0.16), 0.005, { color: poleWood, ...S });
    b.decal(wall, DOOR, { at: P(0, 0.055, 0.131), dir: D(0, 0, 1), size: [0.12, 0.105] });
    const AWN = paint((p) => ((Math.floor((p.x + 3) / 0.05) % 2 + 2) % 2 ? CREAM : TEAL));
    b.slab([P(-0.19, 0.125, 0.15), P(0.19, 0.125, 0.15), P(0.19, 0.085, 0.32), P(-0.19, 0.085, 0.32)], {
      color: AWN,
      thickness: 0.008,
      ...S,
    });
    for (const s of [1, -1]) b.rod(P(s * 0.18, 0.085, 0.31), P(s * 0.18, 0, 0.31), 0.007, { color: poleWood, ...S });
    const Dp = P(-0.19, 0.082, 0.32);
    const Cp = P(0.19, 0.082, 0.32);
    const fr1: ReturnType<typeof frame>[] = [];
    const fr2: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 10; i++) {
      const f = frame(Dp.clone().lerp(Cp, (i + 0.5) / 10), [0, 1, 0]);
      (i % 2 ? fr1 : fr2).push(f);
    }
    b.cards(fr1, BUNT, { size: [0.036, 0.04], lean: 180, flow: [0, 0, 1], color: RED, bone: root, sink: 0 });
    b.cards(fr2, BUNT, { size: [0.036, 0.04], lean: 180, flow: [0, 0, 1], color: GOLD, bone: root, sink: 0 });
    b.part(new THREE.BoxGeometry(0.24, 0.006, 0.16), "#ffffff", { at: P(0, 0.003, 0.22), quat: q, texture: RUG, ...S });
    lantern(P(0.2, 0.085, 0.31));
    // bunting from tent A finial to this ridge
    const a0 = place(-0.45, -0.4).P(0, 0.4, 0);
    const a1 = P(0, 0.27, 0.16);
    const mid = a0.clone().lerp(a1, 0.5).add(V(0, -0.07, 0));
    const string = catmull([a0, mid, a1]);
    b.sweep(string, 0.0025, { color: "#5b3a22", ...S });
    const bf: [ReturnType<typeof frame>[], ReturnType<typeof frame>[], ReturnType<typeof frame>[]] = [[], [], []];
    for (let i = 0; i < 12; i++) bf[i % 3].push(frame(string.at(0.07 + (i / 11) * 0.86), [0, 1, 0]));
    [RED, TEAL, GOLD].forEach((c, i) =>
      b.cards(bf[i], BUNT, { size: [0.03, 0.04], lean: 180, flow: [0, 0, 1], color: c, bone: root, sink: 0 }),
    );
  }

  // ------------------------------------------------------------------ tent C: black goat-hair tent
  {
    const { P, q } = place(0.6, -0.22, toYaw(0.6, -0.22, 0, 0), 1);
    const ROOFC = stripes("#3a2a22", "#e8dcc0", { size: 0.07, axis: "x", width: 0.12, wobble: 0.1, seed: 2 });
    const WALLC = grain("#3a2a22", "#4b362c", { size: 0.02, axis: "z", seed: 1 });
    const t = 0.006;
    b.slab([P(-0.17, 0.2, 0.12), P(0.17, 0.2, 0.12), P(0.17, 0.12, -0.14), P(-0.17, 0.12, -0.14)], { color: ROOFC, thickness: t, ...S });
    for (const s of [1, -1])
      b.slab([P(s * 0.17, 0.2, 0.12), P(s * 0.17, 0.12, -0.14), P(s * 0.17, 0, -0.14), P(s * 0.17, 0, 0.12)], {
        color: WALLC,
        thickness: t,
        ...S,
      });
    b.slab([P(-0.17, 0.12, -0.14), P(0.17, 0.12, -0.14), P(0.17, 0, -0.14), P(-0.17, 0, -0.14)], { color: WALLC, thickness: t, ...S });
    for (const s of [1, -1]) {
      b.rod(P(s * 0.17, 0.2, 0.12), P(s * 0.17, 0, 0.12), 0.007, { color: poleWood, ...S });
      b.rod(P(s * 0.17, 0.2, 0.12), P(s * 0.22, 0.005, 0.3), 0.0025, { color: ROPE, ...S });
      b.spike(P(s * 0.22, 0.025, 0.3), V(0, 1, 0), 0.03, 0.006, { color: poleWood, ...S });
    }
    b.rod(P(-0.18, 0.2, 0.12), P(0.18, 0.2, 0.12), 0.006, { color: poleWood, ...S });
    b.part(new THREE.BoxGeometry(0.26, 0.005, 0.2), "#ffffff", { at: P(0, 0.003, 0.0), quat: q, texture: RUG, ...S });
    const CUSH = [RED, TEAL, GOLD];
    CUSH.forEach((c, i) =>
      b.part(ell(0.04, 0.02, 0.03, 6, 4), c, { at: P(-0.09 + i * 0.09, 0.015, -0.06 + (i % 2) * 0.05), quat: q, flat: true, ...S }),
    );
    lantern(P(0, 0.2, 0.12));
  }

  // ------------------------------------------------------------------ pyramid and obelisk
  {
    const { P, q } = place(-0.7, -0.02, 0, 1);
    const q45 = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(YAXIS, Math.PI / 4));
    const COURSES = stripes("#d9b878", "#b99455", { size: 0.022, axis: "y", width: 0.1, wobble: 0, seed: 3 });
    b.part(new THREE.ConeGeometry(0.17, 0.2, 4), COURSES, { at: P(0, 0.1, 0), quat: q45, flat: true, ...S });
    b.part(new THREE.ConeGeometry(0.03, 0.04, 4), GOLD, { at: P(0, 0.19, 0), quat: q45, flat: true, ...S });
    // obelisk
    const ob = place(-0.62, 0.14, 0, 1);
    const obe = b.frustumBox(ob.P(0, 0, 0), ob.P(0, 0.3, 0), [0.07, 0.07], [0.035, 0.035], { color: "#cfc3ad", ...S });
    const qo = ob.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(YAXIS, Math.PI / 4));
    b.part(new THREE.ConeGeometry(0.0247, 0.05, 4), GOLD, { at: ob.P(0, 0.325, 0), quat: qo, flat: true, ...S });
    glow(b.decal(obe, GLYPH, { at: ob.P(0, 0.15, 0.03), dir: ob.D(0, 0.05, 1), size: [0.032, 0.13] }), 0.6);
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.1), STONE, { at: ob.P(0, 0.006, 0), quat: ob.q, ...S });
  }

  // ------------------------------------------------------------------ campfire
  {
    const c = V(-0.14, G, -0.27);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(ell(0.02, 0.014, 0.018, 5, 4), i % 2 ? "#6f6a64" : "#8a847b", {
        at: [c.x + Math.cos(a) * 0.058, G + 0.008, c.z + Math.sin(a) * 0.058],
        rotation: [0, i * 40, 0],
        flat: true,
        ...S,
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      b.rod(V(c.x + Math.cos(a) * 0.05, G + 0.01, c.z + Math.sin(a) * 0.05), V(c.x, G + 0.035, c.z), 0.009, { color: "#4a2c18", ...S });
    }
    glow(b.part(new THREE.ConeGeometry(0.03, 0.1, 6), "#ff8a1f", { at: [c.x, G + 0.08, c.z], flat: true, ...S }), 1.6);
    glow(b.part(new THREE.ConeGeometry(0.02, 0.075, 6), "#ffd23f", { at: [c.x + 0.012, G + 0.07, c.z + 0.008], flat: true, ...S }), 1.8);
    glow(b.part(new THREE.ConeGeometry(0.015, 0.06, 5), "#ff4a1f", { at: [c.x - 0.018, G + 0.06, c.z - 0.01], flat: true, ...S }), 1.6);
    const sparks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++)
      sparks.push(new THREE.SphereGeometry(0.004, 4, 3).translate(c.x + (rand() - 0.5) * 0.07, G + 0.13 + rand() * 0.07, c.z + (rand() - 0.5) * 0.07));
    glow(b.part(mergeGeometries(sparks)!, "#ffd77a", { bone: root, at: [0, 0, 0] }), 2);
    for (let i = 0; i < 3; i++) {
      const a = 3.4 + i * 0.9;
      const p = V(c.x + Math.cos(a) * 0.14, G + 0.016, c.z + Math.sin(a) * 0.14);
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 6), "#7d5230", {
        at: p,
        dir: V(-Math.sin(a), 0, Math.cos(a)),
        flat: true,
        ...S,
      });
    }
    // teapot on a flat stone
    const tp = V(-0.24, G, -0.2);
    b.part(ell(0.03, 0.01, 0.03, 6, 4), "#7a756e", { at: [tp.x, tp.y + 0.005, tp.z], flat: true, ...S });
    b.lathe(
      [
        [0, 0, "sharp"],
        [0.03, 0],
        [0.038, 0.02],
        [0.035, 0.045],
        [0.02, 0.055],
        [0, 0.057, "sharp"],
      ],
      { at: [tp.x, tp.y + 0.01, tp.z], segments: 8, color: GOLD, ...S },
    );
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS, { at: [tp.x, tp.y + 0.072, tp.z], ...S });
    b.sweep(bezier(V(tp.x + 0.032, tp.y + 0.03, tp.z), V(tp.x + 0.06, tp.y + 0.04, tp.z), V(tp.x + 0.055, tp.y + 0.075, tp.z)), [0.008, 0.004], { color: GOLD, ...S });
    b.sweep(catmull([V(tp.x - 0.034, tp.y + 0.05, tp.z), V(tp.x - 0.06, tp.y + 0.05, tp.z), V(tp.x - 0.055, tp.y + 0.025, tp.z), V(tp.x - 0.036, tp.y + 0.02, tp.z)]), 0.004, { color: BRASS, ...S });
  }

  // ------------------------------------------------------------------ jars, crates, sacks
  const JAR = stripes("#c9622f", "#f0d7a0", { size: 0.02, axis: "y", width: 0.25, wobble: 0.1, seed: 4 });
  const jar = (x: number, z: number, k: number) => {
    const pts: [number, number, "sharp"?][] = [
      [0, 0, "sharp"],
      [0.03, 0],
      [0.048, 0.035],
      [0.052, 0.075],
      [0.04, 0.115],
      [0.024, 0.135],
      [0.032, 0.15],
      [0, 0.15, "sharp"],
    ];
    b.lathe(
      pts.map(([r, h, s]) => (s ? ([r * k, h * k, s] as [number, number, "sharp"]) : ([r * k, h * k] as [number, number]))),
      { at: [x, G, z], segments: 8, smoothing: 1, color: JAR, ...S },
    );
  };
  jar(0.38, -0.43, 1);
  jar(0.43, -0.5, 0.8);
  jar(-0.66, 0.3, 0.9);
  const CRATE = grain("#a8743c", "#8a5a2a", { size: 0.015, axis: "x", seed: 6 });
  b.part(new THREE.BoxGeometry(0.07, 0.06, 0.07), CRATE, { at: [0.47, G + 0.03, -0.5], rotation: [0, 20, 0], ...S });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.06), CRATE, { at: [0.5, G + 0.085, -0.5], rotation: [0, -15, 0], ...S });
  b.part(ell(0.04, 0.035, 0.035, 7, 5), "#e9dcc0", { at: [0.57, G + 0.03, -0.52], flat: true, ...S });
  b.part(ell(0.035, 0.03, 0.03, 7, 5), "#d9c9a4", { at: [-0.3, G + 0.027, -0.2], flat: true, ...S });

  // ------------------------------------------------------------------ signpost
  {
    const { P, q } = place(-0.12, 0.68, 0.25, 1);
    b.rod(P(0, 0, 0), P(0, 0.22, 0), 0.008, { color: poleWood, ...S });
    b.part(new THREE.BoxGeometry(0.17, 0.075, 0.008), "#ffffff", { at: P(0, 0.19, 0.012), quat: q, texture: SIGN, ...S });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: P(0, 0.225, 0), ...S });
  }

  // ------------------------------------------------------------------ cacti
  const CACT = spots("#3f9a54", "#e8f5c0", { size: 0.022, amount: 0.35, seed: 5 });
  const cactus = (x: number, z: number, h: number) => {
    b.sweep(catmull([V(x, G, z), V(x, G + h * 0.5, z), V(x + 0.002, G + h, z)]), 0.026, { color: CACT, sides: 7, ...S });
    b.sweep(bezier(V(x, G + h * 0.4, z), V(x + 0.06, G + h * 0.4, z), V(x + 0.06, G + h * 0.72, z)), 0.016, {
      color: CACT,
      sides: 6,
      ...S,
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ff6fa5", { at: [x + 0.002, G + h + 0.026, z], ...S });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), "#ffd23f", { at: [x + 0.06, G + h * 0.72 + 0.02, z], ...S });
  };
  cactus(0.7, 0.22, 0.14);
  cactus(-0.68, 0.2, 0.1);

  // ------------------------------------------------------------------ scattered rocks
  for (const [x, z, s, i] of [
    [0.74, -0.05, 0.035, 0],
    [-0.55, -0.62, 0.03, 1],
    [0.0, -0.78, 0.04, 2],
    [-0.35, 0.68, 0.025, 0],
    [0.62, 0.62, 0.03, 1],
    [0.7, -0.45, 0.025, 2],
  ] as const) {
    b.part(ell(s * 1.3, s * 0.85, s, 5, 4), ROCKC[i], { at: [x, G + 0.01, z], rotation: [0, x * 300, 0], flat: true, ...S });
  }

  return b.root;
}
```