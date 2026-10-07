import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { Joint } from "../src/skeleton";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import type { Paint, Rgb } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Harpy Eagle",
  description:
    "Harpy eagle with a raised double crest and fully spread wings: slate-navy plumage, rune-lit cyan flight feathers, gold talon sheaths and wrist guards, in League of Legends style.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// Palette: deep navy plumage, icy greys, one strong cyan arcane accent, gold trim.
const INK = "#10163a";
const NAVY = "#1e2756";
const SLATE = "#3b5290";
const STEEL = "#86a0d8";
const ICE = "#c4d0e6";
const FROST = "#e7eefb";
const CREAM = "#f4f0e6";
const CYAN = "#31f2ff";
const GOLD = "#ffc43a";
const GOLDD = "#c4841a";
const HORN = "#262a3a";
const HORNH = "#5b6382";
const TALON = "#14151d";
const YEL = "#f2c23a";
const YELD = "#b9841c";
const DEG = Math.PI / 180;

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = v3(0, 1, 0);
const X = v3(1, 0, 0);

/** Piecewise-linear lookup. */
const lin = (keys: readonly (readonly [number, number])[], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, c] = keys[i];
      return a + (c - a) * ((t - t0) / (t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
};
const dark = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];
const frac = (x: number) => x - Math.floor(x);
const hash = (a: number) => frac(Math.sin(a * 127.1 + 11.7) * 43758.5453);
const bump = (x: number, c: number, w: number) => 1 - smoothstep(w * 0.5, w, Math.abs(x - c));
/** Feather-row scallops: darkens along cell borders. */
const scallop = (c: Rgb, p: THREE.Vector3, size: number, amt: number, seed = 1): Rgb => {
  const k = cells(p, size, seed);
  return mix(c, dark(c, 0.55), (1 - smoothstep(0, 0.14, k.d2 - k.d1)) * amt);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const FEATHER = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 63 C6 54 2 34 16 1 C30 34 26 54 16 63Z" fill="#dedede"/>
    <path d="M16 63 L16 8" stroke="#8c8c8c" stroke-width="1.8" fill="none"/>
    <g stroke="#b4b4b4" stroke-width="1.2" fill="none">
      <path d="M16 50 L7 38 M16 50 L25 38 M16 38 L9 26 M16 38 L23 26 M16 26 L12 17 M16 26 L20 17"/>
    </g>
  </svg>`,
  { size: 128 },
);

const RIB = svg(
  `<svg viewBox="0 0 24 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.7 159 L11.2 18 L12 0 L12.8 18 L13.3 159 Z" fill="#31f2ff"/>
    <g stroke="#31f2ff" stroke-width="1.5" stroke-linecap="round" fill="none">
      <path d="M12 142 L21 119 M12 142 L3 119 M12 112 L20.5 90 M12 112 L3.5 90 M12 83 L19.5 62 M12 83 L4.5 62 M12 54 L18 38 M12 54 L6 38 M12 28 L16 17 M12 28 L8 17"/>
    </g>
  </svg>`,
  { size: 480 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffe27a"/><stop offset="0.6" stop-color="#ffab1e"/><stop offset="1" stop-color="#e86a00"/>
    </radialGradient></defs>
    <circle cx="32" cy="32" r="29" fill="#0e1224"/>
    <circle cx="32" cy="32" r="25" fill="url(#g)"/>
    <circle cx="32" cy="32" r="11.5" fill="#05060c"/>
    <circle cx="23.5" cy="23" r="5" fill="#ffffff"/>
    <circle cx="40" cy="41" r="2.2" fill="#fff3c0"/>
  </svg>`,
  { size: 192 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#31f2ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 4 L32 60"/>
      <path d="M32 13 L20 24 M32 13 L44 24"/>
      <path d="M32 23 L15 39 M32 23 L49 39"/>
      <path d="M32 34 L21 47 M32 34 L43 47"/>
      <path d="M9 34 A23 23 0 0 1 28 9.5"/>
      <path d="M55 34 A23 23 0 0 0 36 54.5"/>
    </g>
    <circle cx="32" cy="32" r="3.4" fill="#31f2ff"/>
    <circle cx="9" cy="34" r="2" fill="#31f2ff"/><circle cx="55" cy="34" r="2" fill="#31f2ff"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Feather outlines

const FS = [0, 0.18, 0.4, 0.6, 0.76, 0.88, 0.95, 0.99];
const shape = (f: number, tipStart: number, tipPow: number, root = 0.45) => {
  const base = root + (1 - root) * smoothstep(0, 0.2, f);
  const tip = f <= tipStart ? 1 : Math.pow(Math.cos(((f - tipStart) / (1 - tipStart)) * (Math.PI / 2)), tipPow);
  return base * tip;
};

type Kind = { tipStart: number; tipPow: number };
const POINTED: Kind = { tipStart: 0.5, tipPow: 0.8 };
const PRIMARY: Kind = { tipStart: 0.62, tipPow: 0.8 };
const ROUNDED: Kind = { tipStart: 0.8, tipPow: 0.55 };
const COVERT: Kind = { tipStart: 0.7, tipPow: 0.5 };

function outlineOf(L: number, Wl: number, Wr: number, kind: Kind): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  for (const f of FS) out.push([f * L, Wl * shape(f, kind.tipStart, kind.tipPow)]);
  out.push([L, 0]);
  for (const f of [...FS].reverse()) out.push([f * L, -Wr * shape(f, kind.tipStart, kind.tipPow)]);
  return out;
}

/** The glowing swallow-tail cap over the last stretch of a feather, slightly inset. */
function capOf(L: number, Wl: number, Wr: number, kind: Kind, f0: number): OutlinePoint[] {
  const k = 0.93;
  const out: OutlinePoint[] = [[f0 * L, Wl * k * shape(f0, kind.tipStart, kind.tipPow)]];
  for (const f of FS) if (f > f0) out.push([f * L * 0.995, Wl * k * shape(f, kind.tipStart, kind.tipPow)]);
  out.push([L * 0.995, 0]);
  for (const f of [...FS].reverse())
    if (f > f0) out.push([f * L * 0.995, -Wr * k * shape(f, kind.tipStart, kind.tipPow)]);
  out.push([f0 * L, -Wr * k * shape(f0, kind.tipStart, kind.tipPow)]);
  out.push([(f0 + 0.11) * L, 0]);
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints for feathers

const paintCache = new Map<string, Paint>();
const cached = (key: string, make: () => Paint) => {
  let p = paintCache.get(key);
  if (!p) paintCache.set(key, (p = make()));
  return p;
};

function flightPaint(L: number, Wl: number, Wr: number, kind: Kind, seed: number, topN: THREE.Vector3, tail = false) {
  const key = `f${L.toFixed(3)}/${Wl.toFixed(3)}/${Wr.toFixed(3)}/${kind.tipStart}/${tail ? 1 : 0}/${seed % 5}/${topN.y.toFixed(2)}`;
  return cached(key, () =>
    paint((_p, n, s) => {
      const f = s[0] / L;
      const y = s[1];
      const d = n.dot(topN);
      const edge = -Wr * shape(f, kind.tipStart, kind.tipPow) * 0.8;
      const rachis = Math.abs(y) < 0.0028 && f > 0.03 && f < 0.97;
      const barb = frac(s[0] * 60 + y * 110) < 0.14;
      if (d > 0.5) {
        let c: Rgb = mix(NAVY, SLATE, 0.18 + 0.5 * smoothstep(0.05, 1, f) * (0.7 + 0.3 * hash(seed)));
        if (tail) {
          const bars = Math.max(bump(f, 0.34, 0.1), bump(f, 0.58, 0.1), bump(f, 0.8, 0.07));
          c = mix(c, STEEL, 0.75 * bars);
          c = mix(c, INK, 0.7 * smoothstep(0.84, 0.96, f));
        } else {
          c = mix(c, STEEL, 0.14 * Math.max(bump(f, 0.4, 0.08), bump(f, 0.64, 0.08)));
          c = mix(c, INK, 0.5 * smoothstep(0.85, 0.99, f));
        }
        if (barb) c = mix(c, STEEL, 0.12);
        if (y < edge && f > 0.08) c = mix(c, ICE, 0.5);
        if (rachis) c = mix(c, FROST, 0.8);
        return c;
      }
      if (d < -0.5) {
        let c: Rgb = mix(ICE, FROST, 0.3 + 0.4 * smoothstep(0.0, 0.8, f));
        c = mix(c, SLATE, 0.8 * Math.max(bump(f, 0.3, 0.07), bump(f, 0.54, 0.07), bump(f, 0.78, 0.06)));
        c = mix(c, NAVY, 0.8 * smoothstep(0.9, 0.99, f));
        if (barb) c = mix(c, FROST, 0.18);
        if (rachis) c = mix(c, FROST, 0.9);
        return c;
      }
      return NAVY;
    }),
  );
}

function covertPaint(L: number, seed: number, tone: number) {
  const key = `c${L.toFixed(3)}/${seed % 7}/${tone}`;
  return cached(key, () =>
    paint((p, n, s) => {
      const f = s[0] / L;
      const h = hash(seed);
      if (n.y > 0.4) {
        let c: Rgb = mix(NAVY, SLATE, tone * (0.35 + 0.55 * h));
        c = mix(c, STEEL, 0.5 * smoothstep(0.72, 0.9, f));
        c = mix(c, ICE, 0.65 * smoothstep(0.9, 0.98, f));
        c = scallop(c, p, 0.03, 0.25, 4);
        if (Math.abs(s[1]) < 0.0022 && f > 0.1) c = mix(c, STEEL, 0.5);
        return c;
      }
      if (n.y < -0.4) {
        let c: Rgb = mix(FROST, ICE, 0.2 + 0.5 * h);
        c = mix(c, ICE, 0.7 * smoothstep(0.8, 0.96, f));
        c = mix(c, STEEL, 0.5 * bump(f, 0.55, 0.12));
        if (Math.abs(s[1]) < 0.0022 && f > 0.1) c = mix(c, ICE, 0.8);
        return c;
      }
      return NAVY;
    }),
  );
}

function crestPaint(L: number) {
  return cached(`k${L.toFixed(3)}`, () =>
    paint((_p, _n, s) => {
      const f = s[0] / L;
      let c: Rgb = mix(INK, SLATE, 0.2 + 0.55 * f);
      if (Math.abs(s[1]) < 0.0022) c = mix(c, STEEL, 0.8);
      c = mix(c, ICE, 0.35 * bump(f, 0.5, 0.08));
      return c;
    }),
  );
}

export default function build() {
  const b = createBuilder({ name: "harpyEagle", paintSize: 2048 });
  const rand = rng(77);

  type J = Joint;
  /** A frame at a model-space point that rides a joint's bone and faces `dir`. */
  const frameOn = (j: J, P: THREE.Vector3, dir: THREE.Vector3) =>
    frame(j.moved({ left: P.x - j.at.x, up: P.y - j.at.y, forward: P.z - j.at.z }), dir);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: body
  const hips = b.joint("hips", { at: [0, 0.4, -0.12] });
  const spinePath = catmull([v3(0, 0.4, -0.12), v3(0, 0.52, -0.05), v3(0, 0.63, 0.03), v3(0, 0.72, 0.1)]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([v3(0, 0.72, 0.1), v3(0, 0.79, 0.15), v3(0, 0.86, 0.2)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.86, 0.2], dir: [0, 0.12, 1], role: "head", group: "head" });
  const K = 1.25; // head scale: a big expressive head
  const F = (f: number, u: number, l = 0) => head.local({ forward: f * K, up: u * K, left: l * K });
  const jaw = b.joint("jaw", { parent: head, at: F(0.085, -0.03), aim: F(0.19, -0.03), role: "jaw", group: "head" });

  // Body paint --------------------------------------------------------------------------------------------------
  const A = v3(0, 0.32, 0.22).normalize();
  const FV = v3(0, -A.z, A.y); // belly direction
  const H0 = v3(0, 0.4, -0.12);
  const bodyColor = (p: THREE.Vector3, n: THREE.Vector3): Rgb => {
    const t = p.clone().sub(H0).dot(A) / 0.45;
    const v = n.dot(FV);
    const nz = noise(p, 0.07, 3);
    let c: Rgb = mix(NAVY, SLATE, 0.2 + 0.5 * nz);
    const side = smoothstep(-0.55, -0.05, v);
    c = mix(c, mix(SLATE, STEEL, 0.25 + 0.3 * nz), side * 0.8);
    const bib = smoothstep(0.5, 0.6, t + (nz - 0.5) * 0.18);
    const white = mix(CREAM, FROST, nz);
    const belly = smoothstep(0.0, 0.45, v + (nz - 0.5) * 0.3);
    c = mix(c, white, belly * (1 - bib));
    c = mix(c, mix(INK, NAVY, 0.4 + 0.3 * nz), bib * smoothstep(-0.2, 0.3, v) * 0.95);
    return scallop(c, p, 0.04, 0.3, 2);
  };
  const bodyPaint = paint((p, n) => bodyColor(p, n));

  const bodyR = (t: number) =>
    [
      lin(
        [
          [0, 0.1],
          [0.3, 0.145],
          [0.7, 0.172],
          [1, 0.12],
        ],
        t,
      ),
      lin(
        [
          [0, 0.11],
          [0.3, 0.15],
          [0.7, 0.155],
          [1, 0.115],
        ],
        t,
      ),
    ] as [number, number];
  const body = b.sweep(spine, bodyR, { color: bodyPaint, group: "body" });

  // Neck
  b.sweep(neck, [0.088, 0.075], {
    color: paint((p, n) => {
      const nz = noise(p, 0.06, 5);
      let c: Rgb = mix(SLATE, ICE, smoothstep(-0.3, 0.7, n.y * 0.5 + (p.y - 0.75) * 3) * 0.7);
      c = mix(c, STEEL, 0.2 * nz);
      return scallop(c, p, 0.03, 0.25, 6);
    }),
    group: "head",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const HC = F(0.06, 0.035);
  const EYEPOS = [1, -1].map((s) => F(0.1, 0.045, s * 0.067));
  const headPaint = paint((p) => {
    const dz = p.z - HC.z;
    const dy = p.y - HC.y;
    const nz = noise(p, 0.05, 8);
    let c: Rgb = mix(ICE, FROST, smoothstep(-0.02, 0.07, dz) * 0.8);
    c = mix(c, STEEL, 0.25 * nz);
    const crown = smoothstep(0.02, 0.075, dy - 0.3 * dz);
    c = mix(c, mix(SLATE, NAVY, 0.4 + 0.5 * nz), crown * 0.9);
    for (const e of EYEPOS) {
      const d = Math.hypot(p.x - e.x, p.y - e.y, p.z - e.z);
      c = mix(c, INK, (1 - smoothstep(0.024 * K, 0.042 * K, d)) * 0.88);
    }
    return scallop(c, p, 0.022, 0.2, 9);
  });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 9), headPaint, {
    bone: head,
    at: HC,
    scale: [0.088 * K, 0.086 * K, 0.088 * K],
    group: "head",
    name: "skull",
  });

  // Beak
  const beakPath = catmull([F(0.112, 0.012), F(0.168, 0.016), F(0.208, 0.002), F(0.228, -0.05)]);
  b.sweep(beakPath, (t) => [(0.031 * Math.pow(1 - t, 0.9) + 0.004) * K, (0.052 * Math.pow(1 - t, 0.8) + 0.005) * K], {
    bone: head,
    color: paint((_p, _n, s) => {
      const t = s[0];
      const deg = (((s[1] + 180) % 360) + 360) % 360 - 180;
      if (t < 0.17) return mix(YEL, GOLD, 0.5);
      if (t < 0.2) return GOLDD;
      let c: Rgb = mix(HORN, INK, smoothstep(0.7, 1, t) * 0.7);
      if (Math.abs(deg) < 16) c = mix(c, HORNH, 0.8 * (1 - smoothstep(0.1, 0.9, t)));
      if (Math.abs(Math.abs(deg) - 100) < 12 && t < 0.85) c = mix(c, HORNH, 0.35);
      return c;
    }),
    caps: "point",
    group: "head",
    name: "beak",
  });
  b.sweep(catmull([F(0.09, -0.03), F(0.14, -0.03), F(0.188, -0.022)]), (t) => [(0.024 * (1 - t) + 0.006) * K, (0.019 * (1 - t) + 0.006) * K], {
    bone: jaw,
    color: HORN,
    caps: "point",
    group: "head",
    name: "lowerBeak",
  });
  for (const s of [1, -1]) {
    b.rod(F(0.1, -0.012, s * 0.031), F(0.17, -0.009, s * 0.021), 0.0045 * K, { bone: head, color: GOLD, group: "head", name: "gape" });
    b.part(new THREE.SphereGeometry(0.0075 * K, 6, 4), INK, { bone: head, at: F(0.14, 0.03, s * 0.016), group: "head", name: "nostril" });
    // Brow ridge: the scowl.
    b.capsule(F(0.062, 0.082, s * 0.078), F(0.125, 0.062, s * 0.048), [0.017 * K, 0.012 * K], {
      bone: head,
      color: NAVY,
      group: "head",
      name: "brow",
    });
    b.capsule(F(0.07, 0.092, s * 0.07), F(0.12, 0.072, s * 0.046), 0.005 * K, { bone: head, color: STEEL, group: "head", name: "browHi" });
  }

  // Eyes (glowing amber decals)
  const skullSurface = b.surface(skull);
  for (const [i, s] of [1, -1].entries()) {
    const e = EYEPOS[i];
    glow(
      b.decal(skull, EYE, {
        at: e,
        dir: [s * 0.6, 0.1, 0.8],
        size: [0.054 * K, 0.054 * K],
        segments: 8,
        bone: head,
        group: "head",
        name: "eye",
      }),
      1.1,
    );
    // Facial disc: stiff pale feathers radiating from the eye.
    const hits = skullSurface.scatter(26, {
      rng: rand,
      minDist: 0.016,
      filter: (h) => {
        const d = h.at.distanceTo(e);
        return d > 0.034 * K && d < 0.085 * K && h.at.z > HC.z - 0.03;
      },
    });
    b.cards(hits, FEATHER, {
      size: [0.03 * K, 0.05 * K],
      lean: 72,
      flow: (f) => f.at.clone().sub(e).add(v3(0, 0, -0.02)),
      vary: 0.2,
      rng: rand,
      color: FROST,
      sink: 0.2,
      bone: head,
    });
  }
  // Forehead gem
  {
    const fh = skullSurface.ray(F(0.12, 0.2), v3(0, -0.8, -0.35));
    if (fh) {
      glow(b.stick(new THREE.OctahedronGeometry(0.014 * K, 0), CYAN, fh, { embed: 0.35, bone: head, group: "head" }), 1.4);
      b.stick(new THREE.CylinderGeometry(0.019 * K, 0.022 * K, 0.006, 6), GOLD, fh, { embed: 0.2, bone: head, group: "head" });
    }
  }
  // Crown and nape hackle
  {
    const hits = skullSurface.scatter(60, {
      rng: rand,
      minDist: 0.02,
      filter: (h) => h.at.y > HC.y + 0.01 && h.at.z < HC.z + 0.03,
    });
    b.cards(hits, FEATHER, {
      size: [0.034, 0.07],
      lean: 62,
      flow: [0, 0.4, -1],
      vary: 0.25,
      rng: rand,
      color: paint((p) => mix(SLATE, ICE, smoothstep(0.1, -0.04, p.z - HC.z) * 0.2 + noise(p, 0.05, 2) * 0.3)),
      bone: head,
    });
  }
  // Neck ruff
  for (const [t, r, size] of [
    [0.1, 0.085, 0.09],
    [0.6, 0.08, 0.085],
  ] as const) {
    const ruff = b.ring(neck.at(t), { count: 14, radius: r });
    b.cards(ruff.items, FEATHER, {
      size: [0.05, size],
      lean: 70,
      flow: [0, -1, -0.35],
      vary: 0.2,
      rng: rand,
      color: paint((p, n) => mix(SLATE, ICE, smoothstep(0.1, 0.6, n.y * 0.3 + (p.y - 0.78) * 2.5))),
      bend: 15,
    });
  }

  // Crest: two fans, a coronal fan across the crown and a sagittal fan on each side.
  const crownHit = skullSurface.ray([0, 2, HC.z - 0.03], [0, -1, 0]);
  const crownP = crownHit ? crownHit.at.clone() : v3(0, 1, 0.1);
  const crestC = b.joint("crestC", { parent: head, at: crownP, dir: [0, 1, -0.4], role: "fan", group: "crest" });
  const crestSide = [1, -1].map((s) =>
    b.joint(s > 0 ? "crestL" : "crestR", {
      parent: head,
      at: v3(s * 0.05, crownP.y - 0.012, crownP.z + 0.005),
      dir: [s * 0.3, 1, -0.3],
      role: "fan",
      group: "crest",
    }),
  );
  const feather = (o: {
    at: THREE.Vector3;
    dir: THREE.Vector3;
    y?: THREE.Vector3;
    side?: number;
    L: number;
    Wl: number;
    Wr: number;
    kind: Kind;
    color: Parameters<typeof b.extrude>[1]["color"];
    thick: number;
    bone: J;
    group: string;
    cap?: number;
    capThick?: number;
    name?: string;
  }) => {
    const d = o.dir.clone().normalize();
    const y = (o.y ?? new THREE.Vector3().crossVectors(d, UP).multiplyScalar(o.side ?? 1)).clone().normalize();
    const part = b.extrude(outlineOf(o.L, o.Wl, o.Wr, o.kind), {
      at: o.at,
      x: d,
      y,
      thickness: o.thick,
      color: o.color,
      bone: o.bone,
      group: o.group,
      name: o.name,
    });
    if (o.cap !== undefined)
      glow(
        b.extrude(capOf(o.L, o.Wl, o.Wr, o.kind, o.cap), {
          at: o.at,
          x: d,
          y,
          thickness: o.thick + (o.capThick ?? 0.007),
          color: CYAN,
          bone: o.bone,
          group: o.group,
          name: o.name ? `${o.name}Tip` : undefined,
        }),
        1.4,
      );
    return part;
  };
  const crestLens = [0.12, 0.15, 0.18, 0.21, 0.24, 0.21, 0.18, 0.15, 0.12];
  for (let i = 0; i < 9; i++) {
    const a = (-60 + i * 15) * DEG;
    const d = v3(Math.sin(a) * 0.95, Math.cos(a), -0.5 * Math.cos(a)).normalize();
    const y = X.clone().sub(d.clone().multiplyScalar(X.dot(d))).normalize();
    const L = crestLens[i];
    feather({
      at: crownP.clone().add(v3(Math.sin(a) * 0.055, -0.016 - Math.abs(Math.sin(a)) * 0.02, 0)),
      dir: d,
      y,
      L,
      Wl: 0.02,
      Wr: 0.02,
      kind: POINTED,
      color: crestPaint(L),
      thick: 0.011,
      bone: crestC,
      group: "crest",
      cap: 0.66,
      name: "crestA",
    });
  }
  for (const [si, s] of [1, -1].entries()) {
    const sides = [-20, 5, 28, 48, 66, 82];
    const lens = [0.11, 0.15, 0.18, 0.17, 0.14, 0.11];
    for (let i = 0; i < 6; i++) {
      const beta = sides[i] * DEG;
      const d = v3(s * 0.34, Math.cos(beta), -Math.sin(beta)).normalize();
      const y = v3(0, 0, 1).sub(d.clone().multiplyScalar(d.z)).normalize();
      const L = lens[i];
      feather({
        at: crestSide[si].at.clone().add(v3(s * 0.008, -0.01 - i * 0.002, -i * 0.012)),
        dir: d,
        y,
        L,
        Wl: 0.018,
        Wr: 0.018,
        kind: POINTED,
        color: crestPaint(L),
        thick: 0.011,
        bone: crestSide[si],
        group: "crest",
        cap: 0.66,
        name: "crestS",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Body surface detail: feather cards, back and chest sigils
  const bodySurface = b.surface(body);
  const backHit = bodySurface.ray([0, 2, -0.01], [0, -1, 0]);
  const chestHit = bodySurface.ray([0, 0.52, 0.7], [0, 0, -1]);
  if (backHit)
    glow(
      b.decal(body, SIGIL, { at: backHit, size: [0.2, 0.2], segments: 12, name: "sigilBack", group: "body" }),
      1.3,
    );
  if (chestHit)
    glow(
      b.decal(body, SIGIL, { at: chestHit, size: [0.12, 0.12], segments: 10, name: "sigilChest", group: "body" }),
      1.2,
    );
  // Gold gorget with hanging pendants and a cyan gem
  const girthAt = spine.at(0.9);
  const girth = bodySurface.loop(girthAt, { lift: 0.014 });
  b.sweep(girth, 0.0095, { color: GOLD, group: "body", name: "gorget" });
  b.along(girth, 16, (at) => {
    if (at.at.clone().sub(girthAt.at).dot(FV) < 0.1) return;
    b.spike(at, FV.clone().multiplyScalar(0.5).sub(A), 0.06, 0.0125, { color: GOLD, group: "body", name: "pendant" });
  });
  {
    const gemHit = bodySurface.ray(girthAt.at.clone().add(FV.clone().multiplyScalar(0.5)), FV.clone().negate());
    if (gemHit) {
      glow(b.stick(new THREE.OctahedronGeometry(0.024, 0), CYAN, gemHit, { embed: 0.2, group: "body", scale: [1, 1.5, 1] }), 1.5);
      b.stick(new THREE.CylinderGeometry(0.03, 0.034, 0.008, 6), GOLD, gemHit, { embed: 0.3, group: "body" });
    }
  }
  // Dorsal rune dashes toward the nape and the rump
  const dorsal = body.line(0, 0.012);
  for (const [from, to, n] of [
    [0.04, 0.32, 3],
    [0.84, 0.98, 2],
  ] as const)
    b.along(
      dorsal,
      n,
      (at) => glow(b.stick(new THREE.OctahedronGeometry(0.02, 0), CYAN, at, { embed: 0.3, scale: [0.55, 1.6, 0.4], group: "body" }), 1.4),
      { from, to },
    );
  {
    const hits = bodySurface.scatter(300, {
      rng: rand,
      minDist: 0.034,
      filter: (h) =>
        (!backHit || h.at.distanceTo(backHit.at) > 0.12) &&
        (!chestHit || h.at.distanceTo(chestHit.at) > 0.085) &&
        Math.abs(h.at.clone().sub(girthAt.at).dot(A)) > 0.045 &&
        h.at.y > 0.42,
    });
    b.cards(hits, FEATHER, {
      size: [0.052, 0.08],
      lean: 72,
      flow: [0, -0.8, -0.5],
      bend: 14,
      vary: 0.25,
      rng: rand,
      color: bodyPaint,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail
  const tail = b.chain("tail", catmull([v3(0, 0.37, -0.2), v3(0, 0.31, -0.3), v3(0, 0.23, -0.41)]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
    group: "tail",
  });
  const tailBase = b.sweep(tail, [0.085, 0.07, 0.05], {
    color: paint((p, n) => {
      let c: Rgb = mix(NAVY, SLATE, 0.3 + 0.4 * noise(p, 0.05, 4));
      c = mix(c, CREAM, 0.7 * smoothstep(0.2, -0.5, n.y));
      return scallop(c, p, 0.035, 0.3, 5);
    }),
    group: "tail",
  });
  {
    const cuff = b.ring(tail.at(0.5), { count: 10, radius: 0.071 });
    b.sweep(catmull(cuff.items, { closed: true }), 0.008, { color: GOLD, group: "tail", name: "tailCuff" });
    glow(b.stick(new THREE.OctahedronGeometry(0.017, 0), CYAN, cuff.items[0], { embed: 0.25, group: "tail" }), 1.4);
  }
  b.cards(
    b.surface(tailBase).scatter(60, { rng: rand, minDist: 0.03 }),
    FEATHER,
    {
      size: [0.05, 0.1],
      lean: 70,
      flow: [0, -0.7, -0.7],
      vary: 0.25,
      rng: rand,
      color: paint((p, n) => mix(mix(NAVY, SLATE, 0.5), CREAM, smoothstep(0.1, -0.4, n.y) * 0.8 + noise(p, 0.04, 3) * 0.1)),
    },
  );
  const TA = v3(0, -0.6, -0.8).normalize();
  const TN = new THREE.Vector3().crossVectors(X, TA).normalize();
  const TP = v3(0, 0.31, -0.3);
  const ribBuckets = new Map<string, { frames: Frame[]; len: number; up: boolean; n: THREE.Vector3 }>();
  const ribFor = (j: J, P: THREE.Vector3, d: THREE.Vector3, L: number, topN: THREE.Vector3) => {
    const cls = Math.max(0.2, Math.round((L * 0.88) / 0.04) * 0.04);
    for (const up of [true, false]) {
      const key = `${cls.toFixed(2)}/${up}/${topN.y.toFixed(2)}`;
      let bucket = ribBuckets.get(key);
      if (!bucket) ribBuckets.set(key, (bucket = { frames: [], len: cls, up, n: topN.clone() }));
      const at = P.clone().add(d.clone().multiplyScalar(0.035)).add(topN.clone().multiplyScalar(up ? 0.0066 : -0.0066));
      bucket.frames.push(frameOn(j, at, d));
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fan = b.joint(`tailFan${side}`, { parent: tail.joints[1], at: TP, dir: TA, role: "fan", group: "tail" });
    for (let k = 0; k < 6; k++) {
      const phi = (2.5 + 5.2 * k) * DEG;
      const L = 0.5 - 0.012 * k;
      const d = TA.clone().multiplyScalar(Math.cos(phi)).add(X.clone().multiplyScalar(s * Math.sin(phi)));
      const y = new THREE.Vector3().crossVectors(TN, d).normalize();
      const at = TP.clone()
        .add(X.clone().multiplyScalar(s * 0.011 * (k + 0.5)))
        .add(TN.clone().multiplyScalar(0.003 * (5 - k)))
        .add(TA.clone().multiplyScalar(0.02));
      feather({
        at,
        dir: d,
        y,
        L,
        Wl: 0.042,
        Wr: 0.042,
        kind: ROUNDED,
        color: flightPaint(L, 0.042, 0.042, ROUNDED, k + (s > 0 ? 0 : 3), TN, true),
        thick: 0.012,
        bone: fan,
        group: "tail",
        cap: 0.84,
        capThick: 0.006,
        name: "tailF",
      });
      ribFor(fan, at, d, L, TN);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = v3(s * 0.09, 0.37, -0.05);
    const kneeP = v3(s * 0.115, 0.27, 0.08);
    const ankleP = v3(s * 0.11, 0.17, 0.02);
    const footP = v3(s * 0.115, 0.04, 0.075);
    const leg = b.chain(`leg${side}`, catmull([hipP, kneeP, ankleP, footP]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      group: `leg${side}`,
      contact: [s * 0.115, 0.01, 0.12],
    });
    const foot = leg.joints[3];
    const len = leg.length;
    const legR = (t: number) =>
      lin(
        [
          [0, 0.082],
          [0.22, 0.092],
          [0.42, 0.078],
          [0.6, 0.052],
          [0.68, 0.034],
          [1, 0.03],
        ],
        t,
      );
    const legTube = b.sweep(leg, legR, {
      color: paint((p, n, sc) => {
        const t = sc[0];
        const nz = noise(p, 0.05, 7);
        if (t < 0.66) {
          let c: Rgb = mix(CREAM, FROST, nz);
          const bar = frac((t * len) / 0.026) < 0.3 && t > 0.1;
          if (bar) c = mix(c, INK, 0.75);
          c = mix(c, NAVY, 0.55 * smoothstep(0.2, -0.3, n.y) * smoothstep(0.1, 0.25, 0.25 - t));
          return scallop(c, p, 0.035, 0.3, 3);
        }
        const k = frac(((t - 0.66) * len) / 0.016);
        let c: Rgb = k < 0.16 ? mix(YELD, INK, 0.3) : mix(YEL, GOLD, 0.35 * nz);
        c = mix(c, NAVY, 0.7 * (1 - smoothstep(0.66, 0.7, t)));
        return c;
      }),
      group: `leg${side}`,
    });
    const legSurface = b.surface(legTube);
    const thighHit = legSurface.ray([s * 0.5, 0.33, 0.02], [-s, 0, 0]);
    if (thighHit)
      glow(b.decal(legTube, SIGIL, { at: thighHit, size: [0.075, 0.075], segments: 8, name: "sigilThigh", group: `leg${side}` }), 1.2);
    b.cards(
      legSurface.scatter(70, {
        rng: rand,
        minDist: 0.028,
        filter: (h) => h.at.y > 0.2 && (!thighHit || h.at.distanceTo(thighHit.at) > 0.06),
      }),
      FEATHER,
      {
        size: [0.05, 0.09],
        lean: 68,
        flow: [0, -1, -0.15],
        bend: 12,
        vary: 0.25,
        rng: rand,
        color: paint((p, n) => {
          const bar = frac(p.y / 0.03) < 0.28;
          return mix(mix(CREAM, FROST, noise(p, 0.05, 3)), INK, bar ? 0.6 : 0.0 + 0.0 * n.y);
        }),
      },
    );
    // Anklet
    const ankRing = b.ring(leg.at(0.77), { count: 10, radius: 0.04 });
    b.sweep(catmull(ankRing.items, { closed: true }), 0.0085, { color: GOLD, group: `leg${side}`, name: "anklet" });
    glow(b.stick(new THREE.OctahedronGeometry(0.014, 0), CYAN, ankRing.items[5], { embed: 0.2, group: `leg${side}` }), 1.3);

    // Foot
    b.part(new THREE.SphereGeometry(0.036, 8, 6), YEL, {
      bone: foot,
      at: footP.clone().add(v3(0, -0.008, -0.004)),
      scale: [0.95, 0.7, 1.15],
      group: `leg${side}`,
      name: "heel",
    });
    const toeDefs: { id: string; k: number; len: [number, number]; tal: number; talR: number; hallux?: boolean }[] = [
      { id: "In", k: -1, len: [0.05, 0.036], tal: 0.058, talR: 0.0125 },
      { id: "Mid", k: 0, len: [0.058, 0.046], tal: 0.07, talR: 0.0135 },
      { id: "Out", k: 1, len: [0.05, 0.034], tal: 0.056, talR: 0.0125 },
      { id: "Hallux", k: 0, len: [0.042, 0.036], tal: 0.085, talR: 0.0175, hallux: true },
    ];
    for (const td of toeDefs) {
      let dir: THREE.Vector3;
      let base: THREE.Vector3;
      if (td.hallux) {
        dir = v3(-s * 0.1, 0, -1).normalize();
        base = footP.clone().add(v3(-s * 0.004, -0.012, -0.014));
      } else {
        const phi = td.k * 27 * DEG;
        dir = v3(s * Math.sin(phi), 0, Math.cos(phi));
        base = footP.clone().add(v3(s * td.k * 0.014, -0.012, 0.012));
      }
      const p0 = base.clone().setY(0.03);
      const p1 = p0.clone().add(dir.clone().multiplyScalar(td.len[0])).setY(0.021);
      const p2 = p1.clone().add(dir.clone().multiplyScalar(td.len[1])).setY(0.017);
      const toePath = catmull([p0, p1, p2]);
      const toe = b.chain(`toe${td.id}${side}`, toePath, {
        parent: foot,
        names: [`toe${td.id}${side}1`, `toe${td.id}${side}2`, `toe${td.id}${side}3`],
        role: "digit",
        group: `leg${side}`,
      });
      const tl = toePath.length;
      b.sweep(toe, td.hallux ? [0.024, 0.02, 0.016] : [0.02, 0.017, 0.014], {
        color: paint((_p, _n, sc) => {
          const k = frac((sc[0] * tl) / 0.013);
          return k < 0.2 ? mix(YELD, INK, 0.25) : mix(YEL, GOLD, 0.25 * sc[0]);
        }),
        group: `leg${side}`,
      });
      const ctrl = p2.clone().add(dir.clone().multiplyScalar(td.tal * 0.65)).add(v3(0, td.hallux ? 0.034 : 0.024, 0));
      const tip = p2.clone().add(dir.clone().multiplyScalar(td.tal)).setY(0.003);
      b.sweep(bezier(p2, ctrl, tip), [td.talR, 0], {
        bone: toe.joints[2],
        color: paint((_p, _n, sc) => {
          const t = sc[0];
          if (t < 0.2) return GOLD;
          if (t < 0.28) return GOLDD;
          return mix(TALON, HORNH, 0.4 * (1 - smoothstep(0.3, 0.9, t)));
        }),
        caps: "point",
        group: `leg${side}`,
        name: "talon",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Wings
  const flightCards: { j: J; P: THREE.Vector3; d: THREE.Vector3; n: THREE.Vector3; L: number }[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const grp = `wing${side}`;
    const P = [v3(s * 0.13, 0.68, 0.04), v3(s * 0.39, 0.75, -0.03), v3(s * 0.65, 0.85, 0.06), v3(s * 0.85, 0.91, -0.03)];
    const arm = b.chain(`arm${side}`, catmull(P), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
      group: grp,
    });
    const seg = [P[0].distanceTo(P[1]), P[1].distanceTo(P[2]), P[2].distanceTo(P[3])];
    const tot = seg[0] + seg[1] + seg[2];
    const bu1 = seg[0] / tot;
    const bu2 = (seg[0] + seg[1]) / tot;
    const armPt = (u: number) => {
      let d = u * tot;
      for (let i = 0; i < 3; i++) {
        if (d <= seg[i] || i === 2) return P[i].clone().lerp(P[i + 1], Math.min(d / seg[i], 1));
        d -= seg[i];
      }
      return P[3].clone();
    };
    const armJoint = (u: number) => (u < bu1 ? arm.joints[0] : u < bu2 ? arm.joints[1] : arm.joints[2]);
    const THETA: [number, number][] = [
      [0, -40],
      [bu1, -20],
      [bu2 - 0.08, -4],
      [bu2, 3],
      [1, 66],
    ];
    const PITCH: [number, number][] = [
      [0, -0.03],
      [bu2, 0.02],
      [1, 0.13],
    ];
    const LEN: [number, number][] = [
      [0, 0.3],
      [0.1, 0.34],
      [bu1, 0.38],
      [bu2 - 0.1, 0.41],
      [bu2, 0.43],
      [0.8, 0.47],
      [0.88, 0.47],
      [0.94, 0.43],
      [1, 0.33],
    ];
    const TAN = Math.tan(15 * DEG);
    /** Feather frame at arm position u: direction, in-plane width axis and the wing plane's upward normal. */
    const place = (u: number) => {
      const th = lin(THETA, u) * DEG;
      const sn = Math.sin(th);
      const d = v3(s * sn, lin(PITCH, u) + sn * TAN, -Math.cos(th)).normalize();
      const y0 = new THREE.Vector3().crossVectors(d, UP).multiplyScalar(s).normalize();
      const y = y0.multiplyScalar(Math.cos(15 * DEG)).add(UP.clone().multiplyScalar(Math.sin(15 * DEG)));
      y.sub(d.clone().multiplyScalar(y.dot(d))).normalize();
      const n = new THREE.Vector3().crossVectors(d, y);
      if (n.y < 0) n.negate();
      return { P0: armPt(u), d, y, n: n.normalize() };
    };
    const armTube = b.sweep(arm, [0.046, 0.039, 0.031, 0.02], {
      color: paint((p, n) => {
        let c: Rgb = mix(NAVY, SLATE, 0.3 + 0.4 * noise(p, 0.05, 11));
        c = mix(c, FROST, 0.8 * smoothstep(0.1, -0.5, n.y));
        return scallop(c, p, 0.03, 0.3, 12);
      }),
      group: grp,
    });

    // Flight feathers
    const rows: { name: string; n: number; u0: number; u1: number; kind: Kind; cap?: number; own: boolean }[] = [
      { name: "tertial", n: 4, u0: 0.07, u1: bu1 - 0.02, kind: ROUNDED, own: false },
      { name: "secondary", n: 12, u0: bu1 + 0.03, u1: bu2 - 0.03, kind: ROUNDED, cap: 0.87, own: true },
      { name: "primary", n: 10, u0: bu2 + 0.03, u1: 0.97, kind: PRIMARY, cap: 0.8, own: true },
    ];
    let idx = 0;
    for (const row of rows) {
      for (let i = 0; i < row.n; i++) {
        const u = row.u0 + ((row.u1 - row.u0) * i) / (row.n - 1);
        const { P0, d, y, n } = place(u);
        const L = lin(LEN, u) * (row.name === "tertial" ? 0.95 : 1);
        const Wl = 0.014;
        const Wr = row.name === "primary" ? lin([[bu2, 0.043], [1, 0.03]], u) : 0.044;
        const layer = (idx % 2) * 0.0045;
        const base = P0.clone().add(n.clone().multiplyScalar(-0.014 + layer)).add(v3(0, 0, -0.02));
        const parent = armJoint(u);
        const j = row.own
          ? b.joint(`${row.name}${i + 1}${side}`, { parent, at: base, dir: d, role: "fan", group: grp })
          : parent;
        const nUp = n;
        feather({
          at: base,
          dir: d,
          y,
          L,
          Wl,
          Wr,
          kind: row.kind,
          color: flightPaint(L, Wl, Wr, row.kind, idx, UP),
          thick: 0.01,
          bone: j,
          group: grp,
          cap: row.cap,
          capThick: 0.006,
          name: row.name,
        });
        flightCards.push({ j, P: base, d, n, L });
        // Greater coverts above and below
        const cl = L * 0.4;
        for (const up of [1, -1]) {
          const cp = base.clone().add(d.clone().multiplyScalar(0.05)).add(nUp.clone().multiplyScalar(up * 0.0092));
          feather({
            at: cp,
            dir: d,
            y,
            L: cl,
            Wl: 0.017,
            Wr: 0.04,
            kind: COVERT,
            color: covertPaint(cl, idx + (up > 0 ? 0 : 5), up > 0 ? 1 : 0),
            thick: 0.009,
            bone: j,
            group: grp,
            name: up > 0 ? "greaterCoverT" : "greaterCoverB",
          });
        }
        idx++;
      }
    }
    // Median coverts along the whole arm, above and below
    for (let i = 0; i < 16; i++) {
      const u = 0.06 + (0.9 * i) / 15;
      const { P0, d, y, n } = place(u);
      const parent = armJoint(u);
      const L = 0.125 * (0.85 + 0.3 * lin([[0, 0.5], [1, 1]], u));
      for (const up of [1, -1]) {
        feather({
          at: P0.clone().add(n.clone().multiplyScalar(up * 0.0215)).add(v3(0, 0, -0.006 - (i % 2) * 0.004)),
          dir: d,
          y,
          L,
          Wl: 0.02,
          Wr: 0.036,
          kind: COVERT,
          color: covertPaint(L, i * 3 + (up > 0 ? 1 : 2), up > 0 ? 0.9 : 0),
          thick: 0.009,
          bone: parent,
          group: grp,
          name: up > 0 ? "medianCoverT" : "medianCoverB",
        });
      }
    }
    // Lesser coverts: cards
    const armSurface = b.surface(armTube);
    const armHit = armSurface.ray(armPt(0.3).clone().add(v3(0, 0.3, 0)), [0, -1, 0]);
    if (armHit)
      glow(b.decal(armTube, SIGIL, { at: armHit, size: [0.07, 0.07], segments: 8, name: "sigilArm", group: grp }), 1.2);
    b.cards(
      armSurface.scatter(110, {
        rng: rand,
        minDist: 0.03,
        filter: (h) => h.n.y > -0.1 && (!armHit || h.at.distanceTo(armHit.at) > 0.055),
      }),
      FEATHER,
      {
      size: [0.045, 0.075],
      lean: 62,
      flow: [0, 0, -1],
      bend: 12,
      vary: 0.25,
      rng: rand,
      color: paint((p) => mix(NAVY, STEEL, 0.15 + 0.5 * noise(p, 0.06, 5))),
    });
    b.cards(armSurface.scatter(70, { rng: rand, minDist: 0.03, filter: (h) => h.n.y < -0.2 }), FEATHER, {
      size: [0.045, 0.075],
      lean: 78,
      flow: [0, 0, -1],
      bend: 12,
      vary: 0.25,
      rng: rand,
      color: paint((p) => mix(FROST, ICE, noise(p, 0.05, 6))),
    });

    // Alula: three angular blades at the wrist's leading edge
    const wristJ = arm.joints[2];
    const alula = b.joint(`alula${side}`, {
      parent: wristJ,
      at: P[2].clone().add(v3(s * 0.02, 0.008, 0.03)),
      dir: [s * 0.4, 0.1, 1],
      role: "digit",
      group: grp,
    });
    const alulaAngles = [52, 70, 88];
    const alulaLens = [0.13, 0.115, 0.1];
    for (let i = 0; i < 3; i++) {
      const psi = alulaAngles[i] * DEG;
      const d = v3(s * Math.sin(psi), 0.1, Math.cos(psi)).normalize();
      const y = new THREE.Vector3().crossVectors(d, UP).normalize();
      feather({
        at: P[2].clone().add(v3(s * 0.015, 0.006 + i * 0.006, 0.028)),
        dir: d,
        y,
        L: alulaLens[i],
        Wl: 0.019,
        Wr: 0.019,
        kind: POINTED,
        color: crestPaint(alulaLens[i]),
        thick: 0.011,
        bone: alula,
        group: grp,
        cap: 0.6,
        name: "alulaF",
      });
    }

    // Gold wrist guard with a cyan gem, and an elbow band
    for (const [t, r, tube] of [
      [0.62, 0.039, 0.0085],
      [0.55, 0.041, 0.0065],
    ] as const) {
      const ring = b.ring(arm.at(t), { count: 10, radius: r });
      b.sweep(catmull(ring.items, { closed: true }), tube, { color: t > 0.6 ? GOLD : GOLDD, group: grp, name: "guard" });
      if (t > 0.6) glow(b.stick(new THREE.OctahedronGeometry(0.017, 0), CYAN, ring.items[0], { embed: 0.25, group: grp }), 1.4);
    }
  }

  // Rib-light cards on every flight feather
  for (const bk of ribBuckets.values()) {
    glow(
      b.cards(bk.frames, RIB, {
        size: [0.034, bk.len],
        lean: 0,
        flow: bk.up ? bk.n : bk.n.clone().negate(),
        sink: 0,
        color: CYAN,
      }),
      1.3,
    );
  }
  {
    const buckets = new Map<string, { frames: Frame[]; normals: THREE.Vector3[]; len: number; up: boolean }>();
    for (const c of flightCards) {
      const cls = Math.max(0.2, Math.round((c.L * 0.88) / 0.04) * 0.04);
      for (const up of [true, false]) {
        const key = `${cls.toFixed(2)}/${up}`;
        let bk = buckets.get(key);
        if (!bk) buckets.set(key, (bk = { frames: [], normals: [], len: cls, up }));
        const at = c.P.clone().add(c.d.clone().multiplyScalar(0.035)).add(c.n.clone().multiplyScalar(up ? 0.0066 : -0.0066));
        bk.frames.push(frameOn(c.j, at, c.d));
        bk.normals.push(up ? c.n : c.n.clone().negate());
      }
    }
    for (const bk of buckets.values()) {
      glow(
        b.cards(bk.frames, RIB, {
          size: [0.034, bk.len],
          lean: 0,
          flow: (_f, i) => bk.normals[i],
          sink: 0,
          color: CYAN,
        }),
        1.3,
      );
    }
  }

  return b.root;
}
