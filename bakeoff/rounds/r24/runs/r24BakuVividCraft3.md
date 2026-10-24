```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  catmull,
  bezier,
  spiral,
  paint,
  noise,
  mix,
  smoothstep,
  stripes,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baku, the Dream Eater (ukiyo-e)",
  description:
    "Edo woodblock-print baku: tapir saddle-back body, elephant trunk inhaling a nightmare wisp, tiger paws, ox tail, vermilion lion mane, rolling cloud-scrolls round its feet. Flat block colours with woodgrain, inked contours.",
};

type P3 = [number, number, number];
type O2 = [number, number][];
type Rad = number | number[] | ((t: number) => number | [number, number]);

// ---------------------------------------------------------------- palette
const INK = "#15121c";
const INDIGO = "#1f3f7a";
const INDIGO_D = "#12285a";
const INDIGO_L = "#3a66ab";
const VERM = "#d9412b";
const VERM_D = "#9e2418";
const PAPER = "#f0e2bd";
const PAPER_D = "#cdb98c";
const TIGER = "#e9a43a";
const TIGER_D = "#b46f1c";
const IVORY = "#f4ead0";
const CLOUD_D = "#9db4d6";
const CLOUD_B = "#7f9bcb";
const SMOKE = "#8a63c8";
const SMOKE_M = "#a98be0";
const SMOKE_L = "#d3bff7";
const GHOST = "#bfa4ec";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// Woodblock paint: hard two-tone shading, wood grain streaks, optional bokashi fade toward the top.
const gq = new THREE.Vector3();
function block(lit: string, dark: string, seed = 1, fade?: string) {
  return paint((p, n) => {
    gq.set(p.x * 0.9, p.y * 0.9, p.z * 0.12);
    const g = noise(gq, 0.05, seed);
    const band = 0.5 + 0.5 * Math.sin(g * 34);
    const key = n.y * 0.65 + n.z * 0.35 + n.x * 0.2;
    let c = mix(dark, lit, smoothstep(-0.03, 0.03, key));
    c = mix(c, dark, 0.17 * smoothstep(0.62, 0.95, band));
    c = mix(c, "#ffffff", 0.05 * smoothstep(0.05, 0.3, band));
    if (fade) c = mix(c, fade, 0.6 * smoothstep(0.95, 1.22, p.y));
    return c;
  });
}

const P_INDIGO = block(INDIGO, INDIGO_D, 3, INDIGO_D);
const P_INDIGO_L = block(INDIGO_L, INDIGO, 4);
const P_VERM = block(VERM, VERM_D, 5);
const P_PAPER = block(PAPER, PAPER_D, 7);
const P_TIGER = block(TIGER, TIGER_D, 9);
const P_CLOUD = block(PAPER, CLOUD_D, 11);
const P_CLOUD_B = block("#b4c7e6", CLOUD_B, 13);

const TIGER_STRIPES = stripes(P_TIGER, INK, { size: 0.05, axis: "y", width: 0.34, wobble: 0.35, seed: 4 });
const PAW = stripes(P_TIGER, INK, { size: 0.055, axis: "z", width: 0.3, wobble: 0.3, seed: 2 });
const LEG = paint((p) => (p.y < 0.4 + 0.04 * tri(p.x * 12 + p.z * 12) ? TIGER_STRIPES : P_INDIGO));

// Tapir saddle: unprinted paper blanket with scalloped edge, vermilion and ink border lines.
const BODY = paint((p, n) => {
  const lo = -0.5 + 0.035 * tri(p.x * 8 + 0.3);
  const hi = 0.12 + 0.035 * tri(p.x * 8);
  const lvl = 0.3 + 0.18 * tri(p.z / 0.1);
  const m = Math.min((n.y - lvl) * 0.3, p.z - lo, hi - p.z);
  if (m > 0.017) return P_PAPER;
  if (m > 0.009) return VERM;
  if (m > 0.0) return INK;
  if (n.y < -0.45) return P_INDIGO_L;
  return P_INDIGO;
});

const EARP = paint((_p, _n, s) => (s[1] > 0.2 + 0.015 * tri(s[0] * 30) ? P_PAPER : P_INDIGO));

// ---------------------------------------------------------------- drawings
function seigaiha(): string {
  const rad = 11;
  let s = "";
  for (let r = 0; r < 16; r++)
    for (let c = -1; c < 8; c++) {
      const cx = c * rad * 2 + (r % 2) * rad;
      const cy = 6 + r * rad * 0.5;
      s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#2f58a0" stroke="#15121c" stroke-width="1.1"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${rad * 0.7}" fill="#efe3c0" stroke="#15121c" stroke-width="0.9"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${rad * 0.42}" fill="#2f58a0" stroke="#15121c" stroke-width="0.9"/>`;
    }
  return s;
}

const TEX = {
  eye: svg(
    `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="a"><path d="M10 46 C30 24 66 18 94 22 C76 50 36 62 10 46 Z"/></clipPath></defs>
      <path d="M6 30 C28 6 64 0 96 8 C68 12 38 20 14 40 Z" fill="${VERM}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M10 46 C30 24 66 18 94 22 C76 50 36 62 10 46 Z" fill="${PAPER}"/>
      <g clip-path="url(#a)">
        <circle cx="56" cy="38" r="17" fill="#e6b94a"/>
        <circle cx="56" cy="38" r="17" fill="none" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="56" cy="39" rx="6.5" ry="12" fill="${INK}"/>
        <circle cx="50" cy="31" r="4.2" fill="#fff"/>
        <circle cx="62" cy="46" r="2" fill="#fff"/>
        <path d="M10 46 C30 24 66 18 94 22 L94 10 L10 10Z" fill="${INK}" opacity="0.25"/>
      </g>
      <path d="M10 46 C30 24 66 18 94 22 C76 50 36 62 10 46 Z" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M10 46 C30 24 66 18 94 22" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  ),
  mane: svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 78 C2 58 6 30 22 3 C26 24 38 44 31 66 C28 74 22 78 14 78 Z" fill="${VERM}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M16 70 C9 54 12 34 21 14" fill="none" stroke="#f08a4a" stroke-width="3" stroke-linecap="round"/>
      <path d="M23 66 C28 52 25 40 24 30" fill="none" stroke="${VERM_D}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 160 },
  ),
  tuft: svg(
    `<svg viewBox="0 0 30 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 78 C3 64 6 30 15 2 C24 30 27 64 15 78Z" fill="${INDIGO}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M15 2 C11 14 9 22 8 30 C13 26 18 26 22 30 C21 22 19 14 15 2Z" fill="${VERM}" stroke="${INK}" stroke-width="2"/>
      <path d="M15 66 C11 54 11 40 15 32" fill="none" stroke="${INDIGO_L}" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 160 },
  ),
  swirl: svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M52 50 C52 46 57 46 57 51 C57 58 46 58 45 50 C44 40 60 38 64 49 C68 62 50 68 40 60 C28 50 34 30 52 28 C70 26 80 44 74 58" fill="none" stroke="${INDIGO}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M20 70 C14 62 20 52 28 56 M80 30 C88 36 84 46 76 44" fill="none" stroke="${INDIGO}" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  ),
  flank: svg(
    `<svg viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><rect x="4" y="4" width="132" height="82" rx="16"/></clipPath></defs>
      <g clip-path="url(#c)"><rect width="140" height="90" fill="#2f58a0"/>${seigaiha()}</g>
      <rect x="4" y="4" width="132" height="82" rx="16" fill="none" stroke="${INK}" stroke-width="3.5"/>
      <rect x="9" y="9" width="122" height="72" rx="12" fill="none" stroke="${VERM}" stroke-width="2.4"/>
    </svg>`,
    { size: 512 },
  ),
  seal: svg(
    `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="44" height="44" rx="4" fill="${VERM}" stroke="${VERM_D}" stroke-width="2"/>
      <path d="M14 14 H36 M25 10 V22 M14 22 H36 M16 30 Q25 26 34 30 M25 28 V42 M15 38 H35" fill="none" stroke="${PAPER}" stroke-width="3.2" stroke-linecap="round"/>
    </svg>`,
    { size: 160 },
  ),
  jewel: svg(
    `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4 C42 22 52 30 50 46 C48 60 38 66 30 66 C22 66 12 60 10 46 C8 30 18 22 30 4Z" fill="#e6b94a" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M30 26 C36 36 40 42 38 50 C36 56 32 58 30 58 C28 58 24 56 22 50 C20 42 24 36 30 26Z" fill="${VERM}" stroke="${INK}" stroke-width="2"/>
      <circle cx="27" cy="46" r="3" fill="${PAPER}"/>
    </svg>`,
    { size: 192 },
  ),
  nightmare: svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 22 L44 33 M86 22 L56 33" stroke="#1b0f2e" stroke-width="6" stroke-linecap="round"/>
      <path d="M16 36 Q32 20 45 42 Q30 50 16 36Z" fill="#1b0f2e"/>
      <path d="M84 36 Q68 20 55 42 Q70 50 84 36Z" fill="#1b0f2e"/>
      <circle cx="33" cy="37" r="3.4" fill="#fff"/><circle cx="67" cy="37" r="3.4" fill="#fff"/>
      <path d="M28 64 Q50 50 72 64 Q66 94 50 90 Q34 94 28 64Z" fill="#1b0f2e"/>
      <path d="M36 62 l4 10 l4 -10 M46 60 l4 10 l4 -10 M56 62 l4 10 l4 -10" fill="#f2e8ff"/>
    </svg>`,
    { size: 256 },
  ),
};

// ---------------------------------------------------------------- geometry helpers
function flipGeo<G extends THREE.BufferGeometry>(g: G): G {
  const ix = g.index;
  if (ix) {
    const a = ix.array as unknown as number[];
    for (let i = 0; i + 2 < a.length; i += 3) {
      const t = a[i + 1];
      a[i + 1] = a[i + 2];
      a[i + 2] = t;
    }
    ix.needsUpdate = true;
  } else {
    for (const name of Object.keys(g.attributes)) {
      const at = g.getAttribute(name);
      const sz = at.itemSize;
      const arr = at.array as unknown as number[];
      for (let i = 0; i + 2 < at.count; i += 3)
        for (let c = 0; c < sz; c++) {
          const t = arr[(i + 1) * sz + c];
          arr[(i + 1) * sz + c] = arr[(i + 2) * sz + c];
          arr[(i + 2) * sz + c] = t;
        }
      at.needsUpdate = true;
    }
  }
  const nm = g.getAttribute("normal");
  if (nm) {
    for (let i = 0; i < nm.count; i++) nm.setXYZ(i, -nm.getX(i), -nm.getY(i), -nm.getZ(i));
    nm.needsUpdate = true;
  }
  return g;
}

function grow(r: Rad, d: number): Rad {
  if (typeof r === "number") return r + d;
  if (Array.isArray(r)) return r.map((v) => v + d);
  return (t: number): number | [number, number] => {
    const v = r(t);
    return typeof v === "number" ? v + d : ([v[0] + d, v[1] + d] as [number, number]);
  };
}

const scaleO = (o: O2, kx: number, ky: number, dy = 0): O2 =>
  o.map(([x, y]) => [x * kx, y * ky + dy] as [number, number]);

export default function build() {
  const b = createBuilder({ name: "baku" });
  type J = ReturnType<typeof b.joint>;
  type Ch = ReturnType<typeof b.chain>;
  const HULL = 0.011;

  // Ink contour: a slightly larger copy with flipped winding shows only as a rim round the silhouette.
  function ink(path: any, radius: Rad, opts: any = {}, d = HULL) {
    const o = { ...opts, color: INK };
    delete o.bands;
    delete o.sectors;
    delete o.name;
    const h = b.sweep(path, grow(radius, d), o);
    for (const m of h.meshes) flipGeo(m.geometry);
    return h;
  }
  function tube(path: any, radius: Rad, opts: any = {}, d = HULL) {
    const s = b.sweep(path, radius, opts);
    ink(path, radius, opts, d);
    return s;
  }
  function blob(at: THREE.Vector3 | P3, scale: P3, color: any, bone: J, d = HULL) {
    const part = b.part(new THREE.SphereGeometry(1, 10, 7), color, { bone, at, scale });
    b.part(flipGeo(new THREE.SphereGeometry(1, 10, 7)), INK, {
      bone,
      at,
      scale: [scale[0] + d, scale[1] + d, scale[2] + d],
    });
    return part;
  }

  // ------------------------------------------------------------ skeleton + body
  const hips = b.joint("hips", { at: [0, 0.84, -0.55], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.84, -0.55],
      [0, 0.88, -0.2],
      [0, 0.87, 0.2],
      [0, 0.86, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const body = tube(
    spine,
    (t: number): [number, number] => [
      0.26 + 0.04 * Math.sin(t * Math.PI),
      0.29 + 0.03 * t + 0.03 * Math.sin(t * Math.PI),
    ],
    { shift: [0, -0.06], color: BODY },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.86, 0.5],
      [0, 0.98, 0.66],
      [0, 1.12, 0.82],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  tube(neck, (t: number) => 0.2 - 0.03 * t, { color: P_INDIGO });

  // Vermilion lion ruff behind the head
  const ruff = blob([0, 1.03, 0.64], [0.27, 0.3, 0.25], P_VERM, neck.joints[0]);

  // ------------------------------------------------------------ head
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  const HC = head.local({ forward: 0.1, up: 0.02 });
  const skull = blob(HC, [0.19, 0.19, 0.23], P_INDIGO, head);

  const snoutEnd = head.local({ forward: 0.3, down: 0.0 });
  tube(
    catmull([head.local({ forward: 0.08 }), head.local({ forward: 0.2 }), snoutEnd]),
    (t: number): [number, number] => [0.12 - 0.035 * t, 0.115 - 0.03 * t],
    { bone: head, color: P_INDIGO },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.11 }),
    aim: head.local({ forward: 0.34, down: 0.1 }),
    role: "jaw",
  });
  const jawSweep = tube(
    catmull([jaw.at.clone(), head.local({ forward: 0.2, down: 0.115 }), head.local({ forward: 0.31, down: 0.11 })]),
    (t: number): [number, number] => [0.085 - 0.035 * t, 0.06 - 0.02 * t],
    { bone: jaw, color: P_PAPER },
  );

  // Elephant trunk, raised and curled toward the nightmare
  const R0 = head.local({ forward: 0.3, down: 0.02 });
  const offs = [
    [0, 0, 0],
    [0, -0.1, 0.16],
    [0, -0.28, 0.32],
    [0, -0.4, 0.56],
    [0, -0.3, 0.8],
    [0, -0.1, 0.92],
    [0, 0.06, 0.88],
  ];
  const trunk = b.chain(
    "trunk",
    catmull(offs.map((o) => [R0.x + o[0], R0.y + o[1], R0.z + o[2]])),
    {
      parent: head,
      names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunkTip"],
      role: "tentacle",
    },
  );
  const TL = trunk.length;
  const TRUNK = paint((_p, n, s) => {
    const ring = tri((s[0] * TL) / 0.05);
    if (ring < 0.1) return INK;
    if (n.y < -0.35) return P_INDIGO_L;
    return ring > 0.9 ? P_INDIGO_L : P_INDIGO;
  });
  tube(trunk, [0.105, 0.095, 0.085, 0.075, 0.065, 0.055, 0.05], {
    color: TRUNK,
    caps: { start: "round", end: "flat" },
  });
  const tp = trunk.at(1);
  const tdir = tp.tangent.clone();
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 8), INK, {
    bone: trunk.tip!,
    at: tp.at.clone().addScaledVector(tdir, 0.006),
    dir: tdir,
  });
  // vermilion collar at trunk root
  tube(
    catmull([R0.clone().add(V(0, 0, -0.03)), R0.clone().add(V(0, -0.01, 0.025))]),
    0.112,
    { bone: head, color: P_VERM, caps: "flat" },
    0.009,
  );

  // Tusks and whiskers
  for (const s of [1, -1]) {
    const p0 = head.local({ left: s * 0.08, forward: 0.24, down: 0.05 });
    const p1 = head.local({ left: s * 0.12, forward: 0.3, down: 0.16 });
    const p2 = head.local({ left: s * 0.17, forward: 0.4, down: 0.11 });
    const p3 = head.local({ left: s * 0.15, forward: 0.47, up: 0.0 });
    tube(bezier(p0, p1, p2, p3), [0.03, 0.0], { bone: head, color: IVORY, caps: { start: "flat", end: "point" } }, 0.008);
    for (let i = 0; i < 3; i++) {
      const w0 = head.local({ left: s * 0.085, forward: 0.27, up: -0.025 * i });
      const w1 = head.local({ left: s * (0.22 + 0.03 * i), forward: 0.3, up: 0.02 - 0.03 * i });
      const w2 = head.local({ left: s * (0.33 + 0.03 * i), forward: 0.22, up: 0.06 - 0.04 * i });
      const w3 = head.local({ left: s * (0.3 + 0.03 * i), forward: 0.1, up: 0.14 - 0.05 * i });
      b.sweep(bezier(w0, w1, w2, w3), [0.009, 0.002], { bone: head, color: INK, caps: { start: "flat", end: "point" } });
    }

    // ears: ink plate, indigo ear with paper tip, vermilion inner
    const EAR: O2 = [
      [-0.07, 0],
      [0.07, 0],
      [0.11, 0.12],
      [0.09, 0.25],
      [0, 0.31],
      [-0.09, 0.24],
      [-0.1, 0.12],
    ];
    const earAt = head.local({ left: s * 0.15, up: 0.13, back: 0.03 });
    const ex = { at: earAt, x: [0, 0, 1], y: [s * 0.55, 1, 0], bone: head, smoothing: 2 };
    b.extrude(scaleO(EAR, 1.14, 1.08, -0.005), { ...ex, thickness: 0.016, color: INK });
    b.extrude(EAR, { ...ex, thickness: 0.022, bevel: 0.005, color: EARP });
    b.extrude(scaleO(EAR, 0.6, 0.62, 0.02), { ...ex, thickness: 0.03, color: P_VERM });

    // eyes
    const sk = b.surface(skull);
    const hit = sk.around(HC).at(s * 58, 10);
    if (hit) b.decal(skull, TEX.eye, { at: hit, size: [0.115, 0.074], mirror: s < 0, bone: head });
  }
  const jh = b.surface(skull).around(HC).at(0, 48);
  if (jh) b.decal(skull, TEX.jewel, { at: jh, size: [0.06, 0.07], bone: head });

  // ------------------------------------------------------------ legs (tiger paws)
  const ruffFrames: any[] = [];
  const pawSpots: [number, number, number][] = [];
  function paw(ak: THREE.Vector3, bone: J) {
    blob([ak.x, 0.115, ak.z + 0.06], [0.1, 0.058, 0.135], PAW, bone);
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.52;
      const tx = ak.x + Math.sin(a) * 0.078;
      const tz = ak.z + 0.06 + Math.cos(a) * 0.118;
      blob([tx, 0.098, tz], [0.036, 0.034, 0.042], PAW, bone, 0.007);
      b.spike([tx, 0.092, tz + 0.03], [Math.sin(a) * 0.35, -0.5, 1], 0.06, 0.013, { color: IVORY, bone });
    }
  }
  function leg(ch: Ch, pts: THREE.Vector3[], hind: boolean, s: number) {
    tube(ch, [0.15, 0.125, 0.085, 0.075], { color: LEG });
    blob(
      hind ? [s * 0.22, 0.72, -0.5] : [s * 0.22, 0.74, 0.4],
      hind ? [0.17, 0.22, 0.25] : [0.16, 0.21, 0.21],
      P_INDIGO,
      ch.joints[0],
    );
    const ak = pts[pts.length - 1];
    paw(ak, ch.tip!);
    ruffFrames.push(...b.ring(ch.tip!, { count: 7, radius: 0.075 }).items);
    pawSpots.push([ak.x, ak.z + 0.06, s]);
  }
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hp = limb([s * 0.21, 0.7, -0.52], [s * 0.21, 0.17, -0.47], [0.3, 0.3], [0, 0, 1]);
    const hc = b.chain(`legH${L}`, hp, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    leg(hc, hp, true, s);
    const fp = limb([s * 0.21, 0.72, 0.38], [s * 0.21, 0.17, 0.42], [0.3, 0.3], [0, 0, -1]);
    const fc = b.chain(`legF${L}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "leg",
    });
    leg(fc, fp, false, s);
  }

  // ------------------------------------------------------------ ox tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.83, -0.78],
      [0, 0.78, -1.0],
      [0, 0.58, -1.12],
      [0, 0.36, -1.1],
      [0, 0.3, -1.08],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  tube(tail, [0.055, 0.04, 0.03, 0.025], { color: P_INDIGO });
  const tuft = tube(
    catmull([
      [0, 0.32, -1.08],
      [0, 0.1, -1.07],
    ]),
    [0.03, 0.07, 0.065, 0.02],
    { bone: tail.joints[3], color: P_VERM },
  );
  b.cards(
    b.surface(tuft).scatter(34, { rng: rng(21), minDist: 0.03 }),
    TEX.tuft,
    { size: [0.06, 0.15], lean: 70, flow: [0, -1, 0], bend: 20, vary: 0.25, spin: 20, rng: rng(22) },
  );

  // ------------------------------------------------------------ cards: mane, crest, cheeks, beard, dorsal, ankles
  b.cards(
    b.surface(ruff).scatter(70, { rng: rng(3), minDist: 0.055, filter: (h) => h.n.y > -0.5 && h.n.z < 0.6 }),
    TEX.mane,
    { size: [0.12, 0.21], lean: 45, bend: 25, vary: 0.3, spin: 15, rng: rng(4) },
  );
  b.cards(
    b.surface(skull).scatter(16, { rng: rng(5), minDist: 0.06, filter: (h) => h.n.y > 0.35 && h.n.z < 0.3 }),
    TEX.mane,
    { size: [0.09, 0.16], lean: 40, bend: 25, vary: 0.25, rng: rng(6) },
  );
  b.cards(
    b.surface(skull).scatter(18, {
      rng: rng(7),
      minDist: 0.05,
      filter: (h) => Math.abs(h.n.x) > 0.5 && h.n.y < -0.1 && h.n.z < 0.5,
    }),
    TEX.mane,
    { size: [0.08, 0.14], lean: 55, bend: 20, vary: 0.25, flow: [0, -0.3, -1], rng: rng(8) },
  );
  b.cards(
    b.surface(jawSweep).scatter(10, { rng: rng(9), minDist: 0.05, filter: (h) => h.n.y < -0.3 }),
    TEX.mane,
    { size: [0.06, 0.12], lean: 30, flow: [0, -1, 0.3], bend: 15, rng: rng(10) },
  );
  b.cards(
    b.surface(body).scatter(30, {
      rng: rng(11),
      minDist: 0.08,
      filter: (h) => h.n.y > 0.8 && Math.abs(h.at.x) < 0.1,
    }),
    TEX.mane,
    { size: [0.08, 0.12], lean: 20, bend: 15, vary: 0.2, rng: rng(12) },
  );
  b.cards(ruffFrames, TEX.mane, { size: [0.07, 0.1], lean: 55, flow: [0, -1, 0], bend: 20, vary: 0.2, rng: rng(13) });

  // ------------------------------------------------------------ flank cartouches + seal
  for (const s of [1, -1]) {
    const hit = b.surface(body).ray([s * 1.0, 0.7, -0.08], [-s, 0, 0]);
    if (hit) b.decal(body, TEX.flank, { at: hit, size: [0.5, 0.32], mirror: s < 0 });
  }
  const sealHit = b.surface(body).ray([0, 2, -0.3], [0, -1, 0]);
  if (sealHit) b.decal(body, TEX.seal, { at: sealHit, up: [0, 0, 1], size: [0.09, 0.09], roll: 8 });

  // ------------------------------------------------------------ cloud scrolls round the feet
  function cloud(cx: number, cz: number, s: number, a1: number, a2: number, a3: number) {
    const mir = (a: number) => (s > 0 ? a : Math.PI - a);
    blob([cx, 0.052, cz], [0.19, 0.052, 0.19], P_CLOUD, hips, 0.01);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + 0.3;
      const lx = cx + Math.cos(a) * 0.165;
      const lz = cz + Math.sin(a) * 0.165;
      const hr = 0.082 + 0.014 * (k % 3);
      const ry = 0.04 + 0.006 * (k % 3);
      const lump = blob([lx, ry, lz], [hr, ry, hr], k % 2 ? P_CLOUD_B : P_CLOUD, hips, 0.009);
      if (k % 2 === 0)
        b.decal(lump, TEX.swirl, {
          at: [lx, ry * 2, lz],
          dir: [0, 1, 0],
          up: [0, 0, 1],
          size: [hr * 1.7, hr * 1.7],
          segments: 6,
          bone: hips,
        });
    }
    const flat = (ang: number, color: any, turns: number) => {
      const out = V(Math.cos(mir(ang)), 0, Math.sin(mir(ang)));
      const from = V(cx, 0.024, cz).addScaledVector(out, 0.24);
      const ctr = from.clone().addScaledVector(out, 0.075);
      tube(spiral(ctr, from, [0, 1, 0], { turns: turns * s, r1: 0.022, pitch: 0 }), [0.026, 0.013], {
        bone: hips,
        color,
      });
    };
    flat(a1, P_CLOUD, 1.3);
    flat(a2, VERM, -1.2);
    const out3 = V(Math.cos(mir(a3)), 0, Math.sin(mir(a3)));
    const f3 = V(cx, 0.08, cz).addScaledVector(out3, 0.18);
    const c3 = f3.clone().add(V(0, 0.07, 0));
    tube(spiral(c3, f3, [-out3.z, 0, out3.x], { turns: 1.15, r1: 0.02, pitch: 0 }), [0.026, 0.012], {
      bone: hips,
      color: INDIGO_L,
    });
  }
  for (const [px, pz, s] of pawSpots) {
    const front = pz > 0;
    cloud(px, pz, s, front ? 0.5 : -0.5, front ? 1.9 : -1.9, front ? 0.3 : -0.3);
  }

  // ------------------------------------------------------------ the nightmare being inhaled
  const G = V(0.35, 1.78, 2.75);
  const toBaku = V(-0.35, -0.6, -1.5).normalize();
  const gh = b.part(new THREE.SphereGeometry(1, 10, 8), GHOST, { bone: hips, at: G, scale: [0.19, 0.21, 0.19] });
  glow(gh, 1.1);
  b.part(flipGeo(new THREE.SphereGeometry(1, 10, 8)), INK, { bone: hips, at: G, scale: [0.2, 0.22, 0.2] });
  glow(
    b.decal(gh, TEX.nightmare, { at: G.clone().addScaledVector(toBaku, 0.2), dir: toBaku, size: [0.32, 0.32], bone: hips }),
    1,
  );
  for (const s of [1, -1])
    glow(
      b.spike(G.clone().add(V(s * 0.08, 0.17, 0)), [s * 0.3, 1, -0.2], 0.12, 0.03, { color: "#f1e2c6", bone: hips }),
      1,
    );
  for (let i = 0; i < 4; i++) {
    const dx = (i - 1.5) * 0.09;
    const p0 = G.clone().add(V(dx * 0.5, 0.15, 0.08));
    const p1 = G.clone().add(V(dx * 1.5, 0.3, 0.2));
    const p2 = G.clone().add(V(dx * 2.5, 0.4, 0.34));
    const p3 = G.clone().add(V(dx * 3.2, 0.62, 0.5 + 0.05 * i));
    glow(tube(bezier(p0, p1, p2, p3), [0.03, 0.0], { bone: hips, color: SMOKE, caps: { start: "flat", end: "point" } }), 1);
  }

  // wisp: ghost mouth to trunk nostril
  const W0 = G.clone().add(V(-0.08, -0.18, -0.12));
  const W1 = tp.at.clone().addScaledVector(tdir, 0.03);
  const axisV = W1.clone().sub(W0);
  const aN = axisV.clone().normalize();
  const uV = V(0, 1, 0).cross(aN).normalize();
  const vV = aN.clone().cross(uV);
  const wisp = (t: number, extra: number, phase: number) => {
    const r = 0.13 * Math.sin(Math.PI * t) * (1 - 0.4 * t) + extra * Math.sin(Math.PI * t);
    const ang = t * Math.PI * 3.2 + phase;
    return W0.clone()
      .addScaledVector(axisV, t)
      .addScaledVector(uV, Math.cos(ang) * r)
      .addScaledVector(vV, Math.sin(ang) * r);
  };
  const wpts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) wpts.push(wisp(i / 12, 0, 0));
  glow(
    tube(catmull(wpts), [0.03, 0.055, 0.045, 0.03, 0.016], {
      bone: hips,
      color: SMOKE,
      bands: [
        [0.4, SMOKE],
        [0.75, SMOKE_M],
        [1, SMOKE_L],
      ],
      caps: { start: "round", end: "point" },
    }),
    1.3,
  );
  for (let i = 1; i <= 6; i++)
    glow(
      b.part(new THREE.SphereGeometry(0.02, 6, 4), "#efe4ff", { bone: hips, at: wisp(i / 7, 0.07, 1.2) }),
      1.5,
    );

  return b.root;
}
```