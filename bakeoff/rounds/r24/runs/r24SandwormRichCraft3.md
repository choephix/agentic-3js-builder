```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  vec,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dune Sandworm",
  description:
    "A colossal desert sandworm rearing out of a crater of dunes: ringed hide, collar bands, dorsal ridge, a four-petal jaw with crystal teeth and a glowing spice-lit throat.",
};

const TAU = Math.PI * 2;
type V = THREE.Vector3;
const P = (v: V): [number, number, number] => [v.x, v.y, v.z];
const comb = (o: V, ...terms: [V, number][]) => terms.reduce((a, [d, k]) => a.addScaledVector(d, k), o.clone());

// ---------------------------------------------------------------- palette
const HIDE_LO = "#76604b";
const HIDE_HI = "#a98e6a";
const HIDE_DARK = "#4a3a2e";
const BELLY = "#d2b992";
const GROOVE = "#33261d";
const COLLAR = "#cdb48c";
const RIDGE = "#5a4535";
const SCUTE = "#8a7156";
const TOOTH = "#f2e4b8";
const TOOTH2 = "#dcc88e";
const LIP = "#bfa47c";
const SAND_LIT = "#f0bb74";
const SAND_MID = "#d79a58";
const SAND_SH = "#a8643c";
const SAND_DEEP = "#7a4a46";
const ROCK = "#6e5a4c";
const COOL = "#5c5a78";
const WARM = "#ffd29a";
const SUN = new THREE.Vector3(0.6, 0.55, 0.4).normalize();

// ---------------------------------------------------------------- textures
const EMBER = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g"><stop offset="0" stop-color="#fff4b8"/><stop offset="0.45" stop-color="#ffa22a"/><stop offset="1" stop-color="#d4421a"/></radialGradient></defs>
    <circle cx="32" cy="32" r="31" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);

const SCAR = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9 Q55 0 117 15 Q56 9 3 9Z" fill="#e6d3aa" stroke="#3b2a1e" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M8 19 Q60 11 112 26 Q60 20 8 19Z" fill="#e6d3aa" stroke="#3b2a1e" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M14 29 Q62 22 104 35 Q62 31 14 29Z" fill="#e6d3aa" stroke="#3b2a1e" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const DUST = svg(
  `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <g fill="#9c6636">
      <circle cx="30" cy="50" r="27"/><circle cx="60" cy="38" r="33"/><circle cx="92" cy="49" r="28"/><rect x="12" y="52" width="100" height="26" rx="6"/>
    </g>
    <g fill="#d8a460">
      <circle cx="30" cy="50" r="24"/><circle cx="60" cy="38" r="30"/><circle cx="92" cy="49" r="25"/><rect x="15" y="54" width="94" height="22" rx="5"/>
    </g>
    <g fill="#f0c88a">
      <circle cx="52" cy="30" r="17"/><circle cx="26" cy="44" r="11"/><circle cx="84" cy="40" r="12"/>
    </g>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- paints
const N_SEG = 36;
const BODY = paint((p, n, s) => {
  const f = (s[0] * N_SEG) % 1;
  const a = ((s[1] % 360) + 360) % 360;
  const d = Math.min(a, 360 - a);
  let c = mix(HIDE_LO, HIDE_HI, smoothstep(0.25, 0.75, noise(p, 0.9, 2)));
  c = mix(c, HIDE_DARK, 0.5 * smoothstep(0.55, 0.8, noise(p, 0.25, 7)));
  c = mix(c, BELLY, smoothstep(100, 150, d));
  c = mix(c, GROOVE, 0.85 * smoothstep(0.17, 0.03, Math.min(f, 1 - f)));
  c = mix(c, mix(COOL, WARM, smoothstep(-0.3, 0.6, n.dot(SUN))), 0.32);
  c = mix(c, SAND_MID, 0.8 * smoothstep(3.0, 0.4, p.y) * (0.6 + 0.4 * noise(p, 0.35, 9)));
  return c;
});

const SAND = paint((p, n) => {
  const sun = n.dot(SUN);
  let c = mix(SAND_SH, SAND_LIT, smoothstep(-0.1, 0.6, sun));
  c = mix(c, SAND_DEEP, 0.35 * smoothstep(0.1, -0.6, sun));
  const ripple = Math.sin((p.x * 0.9 + p.z * 0.5) * 5 + noise(p, 2.5, 4) * 6);
  c = mix(c, SAND_MID, 0.22 * smoothstep(0.3, 1, ripple) * (0.4 + 0.6 * smoothstep(0, 0.8, n.y)));
  c = mix(c, "#fff0c8", 0.18 * smoothstep(0.88, 1, n.y) * noise(p, 0.8, 3));
  return c;
});

const THROAT = paint((_p, _n, s) => {
  const h = s[0];
  let c = mix("#c8431a", "#7a2a1d", smoothstep(-2.4, -1.2, h));
  c = mix(c, "#4e2620", smoothstep(-1.2, 0, h));
  const ridge = Math.abs(((h / 0.2) % 1) - 0.5);
  return mix(c, "#2a100c", 0.5 * smoothstep(0.12, 0.0, ridge));
});

function lobePaint(rad: V) {
  return paint((p, n, s) => {
    const t = s[0];
    let c = mix(HIDE_LO, "#cbb28a", 0.7 * smoothstep(0, 1, t) + 0.3 * noise(p, 0.5, 5));
    if (n.dot(rad) < -0.3) c = mix(c, "#d9a58c", 0.75);
    const rib = Math.abs(Math.sin(t * 38));
    c = mix(c, GROOVE, 0.4 * smoothstep(0.12, 0.0, rib));
    c = mix(c, HIDE_DARK, 0.7 * smoothstep(0.82, 0.98, t));
    return mix(c, mix(COOL, WARM, smoothstep(-0.3, 0.6, n.dot(SUN))), 0.22);
  });
}

// ---------------------------------------------------------------- shape functions
const baseR = (t: number) => 1.9 - 0.45 * smoothstep(0, 0.55, t) + 0.3 * smoothstep(0.6, 1, t);
const bodyR = (t: number) => {
  const f = (t * N_SEG) % 1;
  let m = 0.94 + 0.06 * Math.pow(Math.sin(Math.PI * f), 0.5);
  m = 1 + (m - 1) * (1 - smoothstep(0.96, 0.995, t));
  return baseR(t) * m;
};

const HEAP: [number, number][] = [
  [0, 0.95],
  [2.0, 1.05],
  [3.1, 1.7],
  [4.6, 1.35],
  [6.5, 0.7],
  [9, 0.25],
  [11.5, 0],
];
const heapH = (r: number) => {
  for (let i = 0; i < HEAP.length - 1; i++) {
    const [x0, y0] = HEAP[i];
    const [x1, y1] = HEAP[i + 1];
    if (r <= x1) return y0 + ((y1 - y0) * (r - x0)) / (x1 - x0);
  }
  return 0;
};

export default function build() {
  const b = createBuilder({ name: "sandworm", paintSize: 2048 });
  const BASE: [number, number, number] = [0, 0, -3.5];
  const root = b.joint("root", { at: BASE });

  // ------------------------------------------------------------ spine
  const spinePath = catmull([
    [0, 0, -3.5],
    [0, 2.4, -3.6],
    [0, 5.0, -3.3],
    [0, 7.5, -2.3],
    [0, 9.4, -0.6],
    [0, 10.5, 1.3],
    [0, 10.9, 3.0],
  ]);
  const spine = b.chain("spine", spinePath, { parent: root, role: "spine", count: 9 });
  const END = vec(spinePath.at(1));
  const D = vec(spinePath.tangentAt(1)).normalize();
  const SIDE = new THREE.Vector3(1, 0, 0);
  const U = new THREE.Vector3().crossVectors(D, SIDE).normalize();
  const radial = (a: number) => U.clone().multiplyScalar(Math.cos(a)).addScaledVector(SIDE, Math.sin(a));

  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: P(END),
    dir: P(D),
    role: "head",
  });

  // ------------------------------------------------------------ body
  const body = b.sweep(spine, bodyR, {
    color: BODY,
    sides: 14,
    caps: { start: "flat", end: "none" },
  });

  // collar bands on the bulge of every third segment
  b.along(spine, N_SEG / 3, (at) => {
    b.part(new THREE.TorusGeometry(baseR(at.t), 0.1, 5, 14), COLLAR, {
      frame: at,
      dir: at.tangent,
      axis: "z",
      flat: true,
    });
  });

  // dorsal ridge fins
  b.along(
    body,
    22,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.2, 0.6, 4), RIDGE, at, {
        flow: at.tangent,
        scale: [0.45, 1, 1.5],
        embed: 0.25,
        flat: true,
      });
    },
    { from: 0.07, to: 0.94 },
  );

  // armoured scutes scattered over the hide
  const skin = b.surface(body);
  const scutes = skin.scatter(70, {
    rng: rng(11),
    minDist: 0.7,
    filter: (h) => h.n.y > -0.4 && h.at.y > 0.9 && h.at.distanceTo(END) > 2.5,
  });
  for (const h of scutes) b.stick(new THREE.ConeGeometry(0.25, 0.14, 5), SCUTE, h, { embed: 0.3, flat: true });

  // battle scars
  const scarSpots: [number, number][] = [
    [0.2, 165],
    [0.33, 205],
    [0.46, 120],
    [0.6, 70],
    [0.72, -70],
    [0.5, 225],
  ];
  for (const [t, deg] of scarSpots) {
    const pt = body.at(t, deg);
    b.decal(body, SCAR, { at: pt.at, dir: pt.n, up: pt.tangent, size: [1.6, 0.65], segments: 8 });
  }

  // ------------------------------------------------------------ maw: lip, throat
  const lipPts: [number, number, number][] = [];
  for (let k = 0; k < 16; k++) lipPts.push(P(comb(END, [radial((k / 16) * TAU), 1.76], [D, -0.05])));
  b.sweep(catmull(lipPts, { closed: true }), 0.2, { color: LIP, bone: head, sides: 6 });

  b.lathe(
    [
      [0, -2.4],
      [0.6, -2.35],
      [1.2, -1.1],
      [1.68, 0],
      [1.68, -2.7],
      [0, -2.7],
    ],
    { at: P(END), axis: P(D), bone: head, color: THROAT, segments: 14 },
  );

  glow(
    b.part(new THREE.CircleGeometry(0.58, 12), "#ffffff", {
      bone: head,
      at: P(comb(END, [D, -2.3])),
      dir: P(D),
      axis: "z",
      texture: EMBER,
    }),
    1.5,
  );

  // rings of teeth down the throat
  const throatRing = (depth: number, r: number, count: number, len: number, phase: number) => {
    for (let k = 0; k < count; k++) {
      const rd = radial(((k + phase) / count) * TAU);
      const base = comb(END, [D, depth], [rd, r + 0.05]);
      const dir = comb(new THREE.Vector3(), [rd, -0.85], [D, -0.45]).normalize();
      b.spike(P(base), P(dir), len, 0.09, { color: k % 2 ? TOOTH2 : TOOTH, bone: head, sides: 5 });
    }
  };
  throatRing(-0.35, 1.55, 16, 0.55, 0);
  throatRing(-1.0, 1.27, 12, 0.5, 0.5);
  throatRing(-1.7, 0.92, 9, 0.4, 0);

  // ------------------------------------------------------------ jaw petals
  type LobeCfg = {
    name: string;
    th: number;
    reach: number;
    flare: number;
    wide: number;
    thick: number;
    rootR: number;
    cols: number[];
    stations: number;
    toothLen: number;
  };
  const lobe = (cfg: LobeCfg) => {
    const rad = radial((cfg.th * Math.PI) / 180);
    const tang = new THREE.Vector3().crossVectors(rad, D).normalize();
    const S = comb(END, [rad, cfg.rootR], [D, -0.15]);
    const c1 = comb(S, [D, cfg.reach * 0.42], [rad, 0.1]);
    const c2 = comb(S, [D, cfg.reach * 0.75], [rad, cfg.flare * 0.3]);
    const tip = comb(S, [D, cfg.reach], [rad, cfg.flare]);
    const path = bezier(P(S), P(c1), P(c2), P(tip));
    const joint = b.joint(cfg.name, {
      parent: head,
      at: P(S),
      dir: P(vec(path.tangentAt(0)).normalize()),
      role: "jaw",
    });
    const w = (t: number) => 0.05 + cfg.wide * (1 - Math.pow(t, 1.5)) * (1 + 0.25 * Math.sin(Math.PI * t));
    b.sweep(path, (t): [number, number] => [w(t), cfg.thick * (1 - 0.5 * t) + 0.03], {
      up: P(rad),
      section: "box",
      bone: joint,
      color: lobePaint(rad),
      caps: { start: "flat", end: "flat" },
    });
    for (let ti = 0; ti < cfg.stations; ti++) {
      const t = 0.1 + (ti * 0.74) / Math.max(1, cfg.stations - 1);
      const pnt = vec(path.at(t));
      const T = vec(path.tangentAt(t)).normalize();
      const nIn = rad.clone().addScaledVector(T, -rad.dot(T)).normalize().negate();
      const dir = nIn.clone().addScaledVector(T, 0.55).normalize();
      cfg.cols.forEach((c, ci) => {
        const base = comb(pnt, [nIn, 0.12], [tang, c * w(t)]);
        const len = cfg.toothLen * (1 - 0.65 * t) * (c === 0 ? 1 : 0.82);
        b.spike(P(base), P(dir), len, 0.1 * (1 - 0.45 * t), {
          color: (ti + ci) % 2 ? TOOTH2 : TOOTH,
          bone: joint,
          sides: 5,
        });
      });
    }
  };

  const mainNames = ["jawUpper", "jawL", "jawLower", "jawR"];
  mainNames.forEach((name, k) =>
    lobe({
      name,
      th: k * 90,
      reach: 2.7,
      flare: 3.0,
      wide: 1.0,
      thick: 0.17,
      rootR: 1.68,
      cols: [-0.65, 0, 0.65],
      stations: 7,
      toothLen: 0.95,
    }),
  );
  for (let k = 0; k < 4; k++)
    lobe({
      name: `jawInner${k + 1}`,
      th: 45 + k * 90,
      reach: 1.9,
      flare: 0.6,
      wide: 0.7,
      thick: 0.12,
      rootR: 1.58,
      cols: [-0.5, 0.5],
      stations: 4,
      toothLen: 0.7,
    });

  // ------------------------------------------------------------ dunes and debris
  const heap = (at: [number, number, number], sc: number, hs: number, seg: number) => {
    const o: Array<[number, number] | [number, number, "sharp"]> = [[0, 0]];
    o.push([HEAP[HEAP.length - 1][0] * sc, 0, "sharp"]);
    for (let i = HEAP.length - 2; i >= 0; i--) o.push([HEAP[i][0] * sc, HEAP[i][1] * hs]);
    b.lathe(o, { at, axis: [0, 1, 0], segments: seg, bone: root, color: SAND });
  };
  heap(BASE, 1, 1, 18);
  heap([3.5, 0, -1], 0.35, 0.5, 10);
  heap([-3.8, 0, -5.6], 0.4, 0.55, 10);
  heap([2, 0, -7.2], 0.3, 0.45, 10);

  const dunes: [number, number, number, number, number, number][] = [
    [-11, 4, 7, 2.2, 4, 20],
    [10, 5, 8, 2.6, 4.5, -25],
    [-9, -12, 9, 3.0, 4, 70],
    [11, -10, 8, 2.4, 4, -60],
    [0, 12, 10, 1.6, 3, 5],
  ];
  for (const [x, z, rx, h, rz, yaw] of dunes)
    b.part(new THREE.SphereGeometry(1, 14, 5, 0, TAU, 0, Math.PI / 2), SAND, {
      bone: root,
      at: [x, 0, z],
      scale: [rx, h, rz],
      rotation: [0, yaw, 0],
      flat: true,
    });

  // flung rocks
  const rand = rng(21);
  for (let i = 0; i < 9; i++) {
    const a = rand() * TAU;
    const rho = 4.5 + rand() * 4.5;
    const r = 0.25 + rand() * 0.45;
    b.part(new THREE.DodecahedronGeometry(r, 0), ROCK, {
      bone: root,
      at: [Math.cos(a) * rho, heapH(rho) + 0.25 * r, BASE[2] + Math.sin(a) * rho],
      rotation: [rand() * 90, rand() * 360, rand() * 90],
      scale: [1, 0.7, 1],
      flat: true,
    });
  }

  // billows of dust kicked up around the crater
  const dustFrames: ReturnType<typeof frame>[] = [];
  const flows: V[] = [];
  const dr = rng(33);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU + dr() * 0.2;
    const rho = 3.4 + dr() * 4.2;
    dustFrames.push(frame([Math.cos(a) * rho, heapH(rho) + 0.02, BASE[2] + Math.sin(a) * rho], [0, 1, 0]));
    flows.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
  }
  b.cards(dustFrames, DUST, {
    size: [2.4, 1.7],
    lean: 25,
    flow: (_f, i) => P(flows[i]),
    vary: 0.25,
    rng: rng(5),
    bone: root,
  });

  return b.root;
}
```