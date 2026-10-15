1. **Crescent as hero:** `spearBlade` is now 0.23 m tall with `spearFuller` rescaled to match. `PICK` is rewritten as literals scaled 0.9 × 0.85, with its wedge centre, glint, shard anchors and the sparkle near its tip moved to match. `MAIN` keeps its shape apart from the nick vertices added under change 8.
2. **Pick inlay:** the two `PICK_RUNE` cards are gone. A fern-like engraved motif of thin glowing sweeps now follows your four anchor points (scaled by 0.9 × 0.85). Each point is placed on the sloped-face equation plus 1.3 mm. The pick wedge's flat face is widened slightly so the motif stays at least 12 mm inside its boundary. Only the last point sits close to that limit, at roughly 13 mm by hand calculation, not checked in a render.
3. **Heart setting:** `bezel` is now a real hexagonal ring (ExtrudeGeometry with a hole at 0.82 of `BEZ`) with a dark backing plate 5 mm behind its face. `heartCrystal` is 0.063 × 0.14 × 0.12, split into deep-blue, cyan and pale facet groups by light direction, with the pale facets glowing brightest.
4. **Base:** the plinth, foot, rune plane, crack plane, rocks and crystal anchors are scaled to 80% in X/Z. The nine clusters become five asymmetrical ones, tallest 0.19 m, with `RUNE_RING` glow at 0.2. The ferrule and haft heights are unchanged.
5. **Ice growths:** the head now has one main-spine cluster (0.22 m main shard, 0.10 and 0.09 m companions fanned about −27° to +24°), each sunk 30 mm into the spine on a shared low icosahedron footing. There is one small lower-blade cluster and two small pick growths. The cutting arc and pick point are clear.
6. **Grip:** `gripWrap` is a custom helical leather strip 48 mm wide and 3.5 mm thick at 45 mm pitch, so turns overlap by 3 mm. It is stepped so each turn sits over the one below it. A dark seam strip runs along each lower edge. It wraps a 0.054 m leather core and both ends tuck under new steel sleeves.
7. **Fur:** the tori stay. Seven extruded wedge tufts sit on the upper torus and five on the lower, each with a broad buried root and three uneven tips. Their paint is pale on top faces and grey-blue underneath. Only 5 `TUFT` cards remain to break the outline, and the cone teeth are removed.
8. **Materials:** `BLADE` now has pale-blue upper bevels, steel-blue lower facets and a few large noise-shaped highlights. `bladePlate` is mid-blue. The fern has 4 tapered branch pairs and glows at 0.25. Two shallow edge nicks are added: one near the upper horn and one at the lower end of the arc. The edge and pick glows are lowered.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  mix,
  noise,
  paint,
  smoothstep,
  grain,
  polyline,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-forged Battle Axe",
  description:
    "A Freljord-style battle axe: a dominant crescent blade with a restrained fern inlay and a few buried ice growths, a subordinate piercing fang with an engraved rune line, a faceted ice heart set in a recessed gold frame, a broad leather-wrapped grip, a chunky fur cuff and cloth tails, planted in a small frozen runic plinth.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and constants

const HC = 1.6; // height of the axe head centre
const GOLD = "#e2c77a";
const GOLDD = "#a8863c";
const CYANL = "#d2f8ff";
const FURC = "#e9f1f9";
const CRYSTAL_SIDES = ["#2f93c9", "#2579b4", "#48a9d8", "#1f6aa6"];
const CRYSTAL_TIPS = ["#d9f7ff", "#bff0ff", "#e8fcff", "#a8e6fb"];

type Pt = [number, number] | [number, number, "sharp"];
type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const BLADE = paint((p, n) => {
  const az = Math.abs(n.z);
  const hi = smoothstep(0.64, 0.68, noise(p, 0.2, 31)); // a few large deliberate highlight shapes
  if (az < 0.35) return n.y > -0.1 ? "#f2fdff" : "#9dc3dc"; // honed rim
  if (az < 0.985) {
    const up = smoothstep(-0.3, 0.5, n.y);
    const base = mix("#6a93bb", "#cfe8f6", up); // pale on upper bevels, steel-blue on lower facets
    return mix(base, "#ffffff", hi * 0.75 * up);
  }
  const g = smoothstep(0.05, 0.55, Math.abs(p.x));
  return mix(mix("#2a4a80", "#3f6aa4", g), "#5a86bd", smoothstep(0.58, 0.9, noise(p, 0.3, 5)) * 0.3);
});

const PLATE = paint((p, n) => {
  const az = Math.abs(n.z);
  if (az < 0.4) return "#7aa8d2";
  if (az < 0.98) return "#3a6aa8";
  return mix("#2a5190", "#3b70b2", smoothstep(0.5, 0.85, noise(p, 0.3, 8)) * 0.8);
});

const HUB = paint((p, n) =>
  mix(mix("#182a52", "#233f74", smoothstep(0.5, 0.85, noise(p, 0.3, 6)) * 0.7), "#3a5f9a", smoothstep(0.75, 1, n.y) * 0.5),
);

const STEEL = paint((p, n) =>
  mix(mix("#41567e", "#6580ad", noise(p, 0.25, 4) * 0.7), "#a9c0de", smoothstep(0.7, 1, n.y) * 0.4),
);

const HAFT = grain("#1b2a4d", "#2f4a7c", { size: 0.012, axis: "y", seed: 2 });

const GRIP = paint((p, n) => {
  const base = mix("#5b4034", "#7c5a42", noise(p, 0.03, 2));
  return mix(base, "#b08a64", smoothstep(0.45, 0.95, n.z * 0.8 + n.x * 0.3) * 0.3);
});

const CLOTH = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.7) return "#0d1a3a";
  if (Math.abs(s[0]) > 0.03) return GOLD;
  if (s[1] > -0.02) return GOLDD;
  return mix("#1f4f9a", "#2f78cc", noise(p, 0.05, 9) * 0.8);
});

const STONE = paint((p, n) => {
  if (n.y > 0.6) return mix("#eaf7ff", "#cde9f6", noise(p, 0.25, 1) * 0.8);
  return mix("#27324d", "#394868", noise(p, 0.25, 2));
});

const FURP = paint((_p, n, s) => {
  const base = n.y > 0.2 ? "#f4f9ff" : n.y < -0.2 ? "#8ea9c8" : "#cfe0f0";
  return s[1] > 0.06 && n.y > -0.2 ? mix(base, "#ffffff", 0.5) : base;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

function frostSvg() {
  const poly = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l = Math.hypot(dx, dy);
    const nx = ((-dy / l) * w) / 2;
    const ny = ((dx / l) * w) / 2;
    return `M${(x0 + nx).toFixed(2)} ${(y0 + ny).toFixed(2)} L${x1.toFixed(2)} ${y1.toFixed(2)} L${(x0 - nx).toFixed(2)} ${(y0 - ny).toFixed(2)}Z `;
  };
  let outer = poly(4, 80, 94, 80, 5);
  let inner = poly(4, 80, 88, 80, 2);
  for (let i = 0; i < 4; i++) {
    const x = 16 + i * 17;
    const L = 46 - i * 8;
    for (const k of [-1, 1]) {
      const ex = x + L * 0.5;
      const ey = 80 + k * L;
      outer += poly(x, 80, ex, ey, 4.4 - i * 0.4);
      inner += poly(x, 80, x + (ex - x) * 0.88, 80 + (ey - 80) * 0.88, 1.6);
      const mx = x + (ex - x) * 0.5;
      const my = 80 + (ey - 80) * 0.5;
      outer += poly(mx, my, mx + L * 0.3, my + k * L * 0.12, 2.6);
    }
  }
  return svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="${outer}" fill="#3fb6e0"/>
      <path d="${inner}" fill="#d6faff"/>
    </svg>`,
    { size: 512 },
  );
}
const FROST = frostSvg();

function runeRingSvg() {
  const glyphs = [
    "M0 -9 L0 9 M0 -9 L7 -2 M0 2 L7 9",
    "M-6 -9 L-6 9 M-6 -9 L6 9 M6 -9 L6 9",
    "M0 -9 L7 0 L0 9 L-7 0 Z",
    "M-6 -9 L6 -9 M0 -9 L0 9 M-6 9 L6 5",
    "M-6 9 L0 -9 L6 9 M-4 2 L4 2",
  ];
  let g = "";
  for (let i = 0; i < 12; i++)
    g += `<g transform="translate(100 100) rotate(${i * 30}) translate(0 -80)"><path d="${glyphs[i % glyphs.length]}" stroke="#9cefff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  let ticks = "";
  for (let i = 0; i < 36; i++)
    ticks += `<path d="M100 8 L100 14" transform="rotate(${i * 10} 100 100)" stroke="#6fdcff" stroke-width="2.6"/>`;
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="94" fill="none" stroke="#7fe6ff" stroke-width="3"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#7fe6ff" stroke-width="2.6"/>
      ${ticks}${g}
    </svg>`,
    { size: 512 },
  );
}
const RUNE_RING = runeRingSvg();

function crackSvg() {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    d += `M50 50`;
    for (let k = 1; k <= 4; k++) {
      const aa = a + (k % 2 ? 0.18 : -0.15);
      const r = 8 + k * 9 + (i % 3) * 2;
      d += ` L${(50 + Math.cos(aa) * r).toFixed(1)} ${(50 + Math.sin(aa) * r).toFixed(1)}`;
    }
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" stroke="#bfeaff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="9" fill="none" stroke="#e6faff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
}
const CRACK = crackSvg();

const RIBBON_RUNE = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 L34 30 L20 56 L6 30 Z" stroke="#e2c77a" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M20 14 L20 46 M20 20 L28 30 M20 34 L28 42 M12 24 L20 32" stroke="#8ff0ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);

const SPARK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42Z" fill="#e8fcff" stroke="#6fdcff" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 64 Q4 30 12 6 Q16 28 18 64Z" fill="#dce9f6"/>
    <path d="M10 64 Q12 24 18 0 Q24 26 26 64Z" fill="#f4f9ff"/>
    <path d="M18 64 Q22 34 28 12 Q31 36 30 64Z" fill="#c4d8ee"/>
    <path d="M18 60 Q19 30 18 6" stroke="#aac4e0" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outlines (relative to the head centre; blade on +x, pick drawn on +x and mirrored)

// Crescent blade; two shallow nicks sit near the horn and near the lower end of the arc.
const MAIN: Pt[] = [
  [0.03, 0.24],
  [0.18, 0.3],
  [0.34, 0.42],
  [0.5, 0.58, "sharp"],
  [0.47, 0.4],
  [0.5024, 0.3496],
  [0.4962, 0.3298, "sharp"],
  [0.5168, 0.3272],
  [0.56, 0.26],
  [0.63, 0.08],
  [0.65, -0.1],
  [0.6, -0.28],
  [0.56, -0.352],
  [0.5428, -0.3542, "sharp"],
  [0.55, -0.37],
  [0.5, -0.46],
  [0.4, -0.6, "sharp"],
  [0.34, -0.42],
  [0.2, -0.3],
  [0.03, -0.22],
];

const PANEL: Pt[] = [
  [0.04, 0.16],
  [0.17, 0.215],
  [0.3, 0.29],
  [0.4, 0.3],
  [0.45, 0.2],
  [0.5, 0.09],
  [0.51, -0.07],
  [0.46, -0.19],
  [0.4, -0.27],
  [0.3, -0.25],
  [0.17, -0.21],
  [0.04, -0.14],
];

// Pick: compressed 0.9 horizontally and 0.85 vertically.
const PICK: Pt[] = [
  [0.0, 0.136],
  [0.162, 0.187],
  [0.324, 0.289],
  [0.486, 0.442],
  [0.612, 0.595, "sharp"],
  [0.513, 0.34],
  [0.378, 0.187],
  [0.225, 0.034],
  [0.0, -0.119],
];

const KITE: Pt[] = [
  [-0.077, 0.24],
  [0.077, 0.24],
  [0.127, 0.065],
  [0.127, -0.065],
  [0.077, -0.24],
  [-0.077, -0.24],
  [-0.127, -0.065],
  [-0.127, 0.065],
];

const BEZ: Pt[] = [
  [0, 0.17],
  [0.08, 0.085],
  [0.08, -0.085],
  [0, -0.17],
  [-0.08, -0.085],
  [-0.08, 0.085],
];

// ---------------------------------------------------------------------------------------------------------------
// Wedge solid

function wedge(
  pts: Pt[],
  o: { c: [number, number]; k: [number, number]; te: number; tb: (x: number, y: number) => number; sx?: number },
) {
  const sx = o.sx ?? 1;
  const P: [number, number][] = pts.map((p) => [p[0], p[1]]);
  let area = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    const c = P[(i + 1) % P.length];
    area += a[0] * sx * c[1] - c[0] * sx * a[1];
  }
  if (area < 0) P.reverse();
  const n = P.length;
  const I2: [number, number][] = P.map((p) => [o.c[0] + (p[0] - o.c[0]) * o.k[0], o.c[1] + (p[1] - o.c[1]) * o.k[1]]);
  const E = (i: number, s: number) => new THREE.Vector3(P[i][0] * sx, P[i][1], s * o.te);
  const I = (i: number, s: number) => new THREE.Vector3(I2[i][0] * sx, I2[i][1], s * o.tb(I2[i][0], I2[i][1]));
  const pos: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) =>
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(E(i, 1), E(j, 1), I(j, 1));
    tri(E(i, 1), I(j, 1), I(i, 1));
    tri(E(j, -1), E(i, -1), I(i, -1));
    tri(E(j, -1), I(i, -1), I(j, -1));
    tri(E(i, 1), E(i, -1), E(j, -1));
    tri(E(i, 1), E(j, -1), E(j, 1));
  }
  const contour = I2.map((p) => new THREE.Vector2(p[0] * sx, p[1]));
  const tris = THREE.ShapeUtils.triangulateShape(
    contour.map((v) => v.clone()),
    [],
  );
  for (const [a, b, c] of tris) {
    const va = contour[a];
    const vb = contour[b];
    const vc = contour[c];
    const cross = (vb.x - va.x) * (vc.y - va.y) - (vb.y - va.y) * (vc.x - va.x);
    const [q, r] = cross >= 0 ? [b, c] : [c, b];
    tri(I(a, 1), I(q, 1), I(r, 1));
    tri(I(a, -1), I(r, -1), I(q, -1));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Helical leather strip: a flattened ribbon whose turns overlap like shingles

function helix(o: {
  R: number;
  t: number;
  w: number;
  pitch: number;
  y0: number;
  steps: number;
  sl: number;
  v0: number;
  v1: number;
  lift: number;
  full: boolean;
}) {
  const pos: number[] = [];
  const dth = (Math.PI * 2) / 12;
  const pt = (i: number, v: number, out: boolean) => {
    const th = i * dth;
    const yc = o.y0 + (o.pitch * th) / (Math.PI * 2);
    const rad = o.R + o.sl * (-v / (o.w / 2)) + (out ? o.t : 0) + o.lift;
    return new THREE.Vector3(Math.sin(th) * rad, yc + v, Math.cos(th) * rad);
  };
  const tri = (p: THREE.Vector3, q: THREE.Vector3, r: THREE.Vector3) =>
    pos.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
  const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, out: THREE.Vector3) => {
    const nrm = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (nrm.dot(out) >= 0) {
      tri(a, b, c);
      tri(a, c, d);
    } else {
      tri(a, c, b);
      tri(a, d, c);
    }
  };
  const UP = new THREE.Vector3(0, 1, 0);
  const DOWN = new THREE.Vector3(0, -1, 0);
  for (let i = 0; i < o.steps; i++) {
    const mid = (i + 0.5) * dth;
    const radial = new THREE.Vector3(Math.sin(mid), 0, Math.cos(mid));
    quad(pt(i, o.v0, true), pt(i + 1, o.v0, true), pt(i + 1, o.v1, true), pt(i, o.v1, true), radial);
    if (o.full) {
      quad(pt(i, o.v1, true), pt(i + 1, o.v1, true), pt(i + 1, o.v1, false), pt(i, o.v1, false), UP);
      quad(pt(i, o.v0, false), pt(i + 1, o.v0, false), pt(i + 1, o.v0, true), pt(i, o.v0, true), DOWN);
    }
  }
  if (o.full) {
    const e = o.steps;
    const t0 = new THREE.Vector3(-1, 0, 0);
    const te = new THREE.Vector3(Math.cos(e * dth), 0, -Math.sin(e * dth));
    quad(pt(0, o.v0, false), pt(0, o.v0, true), pt(0, o.v1, true), pt(0, o.v1, false), t0);
    quad(pt(e, o.v0, false), pt(e, o.v0, true), pt(e, o.v1, true), pt(e, o.v1, false), te);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(21);

  // --------------------------------------------------------------------------------------------------------
  // Helpers

  const P3 = (x: number, y: number, z = 0): V => [x, HC + y, z];

  function planeGeo(w: number, h: number, flip: boolean) {
    const g = new THREE.PlaneGeometry(w, h);
    if (flip) {
      const uv = g.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    }
    return g;
  }

  function crystal(
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    tone: number,
    g = 0.3,
    embed = 0.02,
  ) {
    const d = dir.clone().normalize();
    const bodyLen = len * 0.62;
    const start = base.clone().addScaledVector(d, -embed);
    const body = b.part(new THREE.CylinderGeometry(r * 0.85, r, bodyLen + embed, 6, 1), CRYSTAL_SIDES[tone % 4], {
      at: start.clone().addScaledVector(d, (bodyLen + embed) / 2),
      dir: d,
      flat: true,
    });
    const tip = b.part(new THREE.ConeGeometry(r * 0.85, len * 0.38, 6, 1), CRYSTAL_TIPS[tone % 4], {
      at: base.clone().addScaledVector(d, bodyLen + len * 0.19),
      dir: d,
      flat: true,
    });
    if (g > 0) {
      glow(body, g);
      glow(tip, g * 1.8);
    }
  }

  function bladeShard(
    s: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    dz: number,
    len: number,
    r: number,
    tone = 0,
    embed = 0.02,
  ) {
    crystal(new THREE.Vector3(s * x, HC + y, 0), new THREE.Vector3(s * dx, dy, dz), len, r, tone, 0.25, embed);
  }

  // low faceted ice footing shared by a growth cluster
  function footing(x: number, y: number, rotZ: number, sx: number, sy: number, sz: number, rotY: number, pale: boolean) {
    b.part(new THREE.IcosahedronGeometry(1, 0), pale ? "#c4ecf8" : "#9fd8ee", {
      at: [x, HC + y, 0],
      scale: [sx, sy, sz],
      rotation: [0, rotY, rotZ],
      flat: true,
    });
  }

  // --------------------------------------------------------------------------------------------------------
  // Base: small frozen runic plinth (80% footprint)

  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.336, 0.05],
      [0.33, 0.1],
      [0.3, 0.14],
      [0.264, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE, name: "plinth" },
  );
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.36, 0.03],
      [0.324, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: "#222d44", name: "plinthFoot" },
  );

  glow(
    b.part(planeGeo(0.544, 0.544, false), "#ffffff", {
      at: [0, 0.174, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_RING,
    }),
    0.2,
  );
  b.part(planeGeo(0.3, 0.3, false), "#ffffff", {
    at: [0, 0.178, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: CRACK,
  });

  for (const [deg, r] of [
    [75, 0.08],
    [118, 0.088],
    [160, 0.072],
    [205, 0.096],
    [250, 0.08],
    [290, 0.08],
    [50, 0.044],
    [-50, 0.048],
  ] as [number, number][]) {
    const a = (deg * Math.PI) / 180;
    b.part(new THREE.IcosahedronGeometry(r, 0), STONE, {
      at: [Math.sin(a) * 0.3, 0.1 + r * 0.25, Math.cos(a) * 0.3],
      scale: [1.25, 0.8, 1],
      rotation: [R() * 40, R() * 360, R() * 30],
      flat: true,
    });
  }

  // five asymmetrical ice groups, front left open
  const clusters: [number, number, number][] = [
    [150, 0.29, 0.19],
    [205, 0.29, 0.14],
    [265, 0.3, 0.1],
    [95, 0.3, 0.12],
    [35, 0.29, 0.06],
  ];
  clusters.forEach(([deg, rad, H], ci) => {
    const a = (deg * Math.PI) / 180;
    const bx = Math.sin(a) * rad;
    const bz = Math.cos(a) * rad;
    for (let k = 0; k < 3; k++) {
      const out = 0.25 + R() * 0.3;
      const dir = new THREE.Vector3(Math.sin(a) * out + (R() - 0.5) * 0.4, 1, Math.cos(a) * out + (R() - 0.5) * 0.4);
      const len = H * (k === 0 ? 1 : 0.5 + R() * 0.3);
      crystal(
        new THREE.Vector3(bx + (R() - 0.5) * 0.05, 0.12, bz + (R() - 0.5) * 0.05),
        dir,
        len,
        len * 0.16,
        ci + k,
        0.15,
        0.03,
      );
    }
  });

  // --------------------------------------------------------------------------------------------------------
  // Haft, leather grip and steel sleeves

  b.sweep(
    [
      [0, 0.12, 0],
      [0, 1.88, 0],
    ],
    [0.043, 0.047, 0.043, 0.047, 0.043],
    { sides: 8, color: HAFT, caps: "flat", name: "haft" },
  );

  // fuller grip core
  b.part(new THREE.CylinderGeometry(0.054, 0.054, 0.76, 10, 1), "#3a2a22", { at: [0, 0.8, 0], flat: true, name: "gripCore" });

  // overlapping flat leather strip: 48 mm wide, 3.5 mm thick, 45 mm pitch
  const GW = 0.048;
  const gripArgs = { R: 0.0525, t: 0.0035, w: GW, pitch: 0.045, y0: 0.454, steps: 190, sl: 0.0012 };
  b.part(helix({ ...gripArgs, v0: -GW / 2, v1: GW / 2, lift: 0, full: true }), GRIP, { at: [0, 0, 0], name: "gripWrap" });
  b.part(helix({ ...gripArgs, v0: -GW / 2, v1: -GW / 2 + 0.004, lift: 0.0012, full: false }), "#2a1c15", {
    at: [0, 0, 0],
    name: "gripSeam",
  });

  // steel sleeves hiding both strip ends
  for (const y0 of [0.4, 1.1]) {
    b.lathe(
      [
        [0, 0],
        [0.056, 0],
        [0.064, 0.012],
        [0.064, 0.088],
        [0.056, 0.1],
        [0, 0.1],
      ],
      { at: [0, y0, 0], segments: 8, color: STEEL, name: "gripSleeve" },
    );
  }
  for (const y of [0.5, 1.1]) {
    b.part(new THREE.TorusGeometry(0.064, 0.005, 5, 10), GOLD, { at: [0, y, 0], dir: [0, 1, 0], axis: "z", flat: true });
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at: [Math.sin(a) * 0.066, 1.15, Math.cos(a) * 0.066] });
  }

  // ferrule planted in the plinth
  b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.06, 0.02],
      [0.052, 0.06],
      [0.048, 0.14],
      [0.058, 0.16],
      [0, 0.16],
    ],
    { at: [0, 0.15, 0], segments: 8, color: STEEL, name: "ferrule" },
  );
  b.part(new THREE.TorusGeometry(0.057, 0.007, 5, 8), GOLD, { at: [0, 0.2, 0], dir: [0, 1, 0], axis: "z", flat: true });

  // --------------------------------------------------------------------------------------------------------
  // Fur cuff: two torus supports covered with chunky wedge tufts

  const FUR_Y1 = HC - 0.3;
  const FUR_Y2 = HC - 0.35;
  b.part(new THREE.TorusGeometry(0.06, 0.03, 5, 9), FURC, { at: [0, FUR_Y1, 0], dir: [0, 1, 0], axis: "z", flat: true });
  b.part(new THREE.TorusGeometry(0.056, 0.026, 5, 9), "#c9dcef", {
    at: [0, FUR_Y2, 0],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });
  const furRng = rng(5);

  function tuft(a: number, y: number, rad: number, W: number, L: number) {
    const r = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const t: V = [Math.cos(a), 0, -Math.sin(a)];
    const d = r.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, -0.87, 0)).normalize();
    const O = r.clone().multiplyScalar(rad);
    O.y = y;
    const fa = 0.85 + furRng() * 0.3;
    const fb = 0.9 + furRng() * 0.2;
    const fc = 0.8 + furRng() * 0.3;
    const outline: Pt[] = [
      [-0.95 * W, -0.015],
      [0.95 * W, -0.015],
      [1.0 * W, 0.3 * L],
      [0.78 * W, 0.72 * L * fc, "sharp"],
      [0.38 * W, 0.55 * L],
      [0.05 * W, L * fb, "sharp"],
      [-0.3 * W, 0.52 * L],
      [-0.72 * W, 0.85 * L * fa, "sharp"],
      [-1.0 * W, 0.35 * L],
    ];
    b.extrude(outline, {
      at: O,
      x: t,
      y: [d.x, d.y, d.z],
      thickness: 0.03,
      bevel: 0.008,
      color: FURP,
      name: "furTuft",
    });
  }
  for (let i = 0; i < 7; i++) {
    tuft((i / 7) * Math.PI * 2 + 0.2, FUR_Y1 + 0.012, 0.058, 0.0225 + furRng() * 0.005, 0.078 + furRng() * 0.012);
  }
  for (let i = 0; i < 5; i++) {
    tuft((i / 5) * Math.PI * 2 + 0.55, FUR_Y2 + 0.005, 0.054, 0.021, 0.06 + furRng() * 0.008);
  }
  const cardRing = b.ring(frame([0, FUR_Y1 + 0.02, 0], [0, 1, 0]), { count: 5, radius: 0.06 });
  b.cards(cardRing.items, TUFT, {
    size: [0.05, 0.075],
    lean: 70,
    flow: [0, -1, 0],
    bend: 20,
    vary: 0.2,
    spin: 8,
    sink: 0.25,
    rng: furRng,
  });

  // --------------------------------------------------------------------------------------------------------
  // Ribbons, tucked under the cuff

  for (const s of [1, -1]) {
    const k = 0.19;
    const L = Math.hypot(1, k);
    const xdir: V = [1 / L, (s * k) / L, 0];
    const ydir: V = [(-s * k) / L, 1 / L, 0];
    const origin = new THREE.Vector3(s * 0.085, HC - 0.34, 0);
    const at = (u: number, v: number, z = 0) =>
      new THREE.Vector3(origin.x + xdir[0] * u + ydir[0] * v, origin.y + xdir[1] * u + ydir[1] * v, z);
    const rib: Pt[] = [
      [-0.035, 0],
      [0.035, 0],
      [0.038, -0.27],
      [0, -0.2],
      [-0.038, -0.27],
    ];
    b.extrude(rib, { at: origin, x: xdir, y: ydir, thickness: 0.008, bevel: 0.002, color: CLOTH, name: "ribbon" });
    for (const zs of [1, -1]) {
      glow(
        b.part(planeGeo(0.045, 0.07, false), "#ffffff", {
          at: at(0, -0.12, zs * 0.0055),
          dir: [0, 0, zs],
          axis: "z",
          up: ydir,
          texture: RIBBON_RUNE,
        }),
        0.6,
      );
    }
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: at(-0.038, -0.27) });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: at(0.038, -0.27) });
  }

  // --------------------------------------------------------------------------------------------------------
  // Hub, recessed gold setting and faceted ice heart

  b.extrude(KITE, { at: [0, HC, 0], x: [1, 0, 0], thickness: 0.12, bevel: 0.014, color: HUB, name: "hub" });

  for (const zs of [1, -1]) {
    const trim = KITE.map((p) => [p[0] * 0.88, HC + p[1] * 0.88, zs * 0.061] as V);
    b.sweep(polyline(trim, { closed: true }), 0.005, { sides: 5, color: GOLD, name: "hubTrim" });
    for (const [x, y] of [
      [0.068, 0.211],
      [-0.068, 0.211],
      [0.068, -0.211],
      [-0.068, -0.211],
    ]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: [x, HC + y, zs * 0.062] });
    }
  }

  // genuine hexagonal ring with an opening
  const hexShape = (sc: number) => {
    const sh = new THREE.Shape();
    BEZ.forEach((p, i) => (i ? sh.lineTo(p[0] * sc, p[1] * sc) : sh.moveTo(p[0] * sc, p[1] * sc)));
    sh.closePath();
    return sh;
  };
  const ringShape = hexShape(1);
  ringShape.holes.push(new THREE.Path(hexShape(0.82).getPoints()));
  const bezelGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.14, bevelEnabled: false, steps: 1 });
  bezelGeo.translate(0, 0, -0.07);
  bezelGeo.clearGroups();
  b.part(bezelGeo, GOLD, { at: [0, HC, 0], flat: true, name: "bezel" });

  // dark backing 5 mm behind the ring face
  b.extrude(
    BEZ.map((p) => [p[0] * 0.86, p[1] * 0.86] as Pt),
    { at: [0, HC, 0], x: [1, 0, 0], thickness: 0.13, color: "#0c1a3c", name: "bezelBacking" },
  );

  // heart crystal: facets in deep blue, cyan and pale highlight
  {
    const g = new THREE.SphereGeometry(1, 6, 5).toNonIndexed();
    const pos = g.getAttribute("position");
    const L = new THREE.Vector3(-0.35, 0.75, 0.55).normalize();
    const sc = new THREE.Vector3(0.063, 0.14, 0.12);
    const buckets: number[][] = [[], [], []];
    const c = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      c.set(0, 0, 0);
      for (let k = 0; k < 3; k++) c.add(tmp.fromBufferAttribute(pos, i + k));
      c.divideScalar(3).divide(sc).normalize();
      const d = c.dot(L);
      const bk = d > 0.35 ? 2 : d < -0.2 ? 0 : 1;
      for (let k = 0; k < 3; k++) buckets[bk].push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k));
    }
    const cols = ["#1f6bc4", "#69dcff", "#eafcff"];
    const strengths = [0.9, 1.1, 1.8];
    buckets.forEach((arr, k) => {
      if (!arr.length) return;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
      geo.computeVertexNormals();
      glow(
        b.part(geo, cols[k], { at: [0, HC, 0], scale: [0.063, 0.14, 0.12], flat: true, name: `heartFacet${k}` }),
        strengths[k],
      );
    });
  }

  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.076, 0.02],
      [0.076, 0.05],
      [0.06, 0.08],
      [0, 0.08],
    ],
    { at: [0, HC - 0.3, 0], segments: 8, color: STEEL, name: "lowerCollar" },
  );
  b.part(new THREE.TorusGeometry(0.074, 0.007, 5, 8), GOLD, {
    at: [0, HC - 0.26, 0],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });

  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.078, 0.02],
      [0.062, 0.045],
      [0.062, 0.09],
      [0.074, 0.1],
      [0.074, 0.12],
      [0.046, 0.14],
      [0, 0.14],
    ],
    { at: [0, HC + 0.2, 0], segments: 8, color: STEEL, name: "socket" },
  );
  b.part(new THREE.TorusGeometry(0.075, 0.006, 5, 8), GOLD, {
    at: [0, HC + 0.27, 0],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });

  // compact spear crown, 0.23 m
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.065, 0.08],
      [0, 0.23, "sharp"],
      [-0.065, 0.08],
    ],
    {
      at: [0, HC + 0.34, 0],
      x: [1, 0, 0],
      thickness: [0.045, 0.006],
      bevel: 0.006,
      color: BLADE,
      name: "spearBlade",
    },
  );
  glow(
    b.extrude(
      [
        [-0.014, 0.03],
        [0.014, 0.03],
        [0.024, 0.08],
        [0, 0.19],
        [-0.024, 0.08],
      ],
      { at: [0, HC + 0.34, 0], x: [1, 0, 0], thickness: [0.05, 0.022], color: CYANL, name: "spearFuller" },
    ),
    0.5,
  );

  // --------------------------------------------------------------------------------------------------------
  // Main crescent blade

  b.part(wedge(MAIN, { c: [0.2, 0], k: [0.8, 0.85], te: 0.004, tb: () => 0.04 }), BLADE, {
    at: [0, HC, 0],
    name: "bladeMain",
  });
  b.extrude(PANEL, {
    at: [0, HC, 0],
    x: [1, 0, 0],
    thickness: 0.09,
    bevel: 0.01,
    smoothing: 1,
    color: PLATE,
    name: "bladePlate",
  });

  // cutting-edge glint, interrupted at the nicks
  const edge = [
    [0.5168, 0.3272],
    [0.56, 0.26],
    [0.63, 0.08],
    [0.65, -0.1],
    [0.6, -0.28],
    [0.56, -0.352],
  ].map(([x, y]) => P3(x, y));
  glow(b.sweep(polyline(edge), 0.004, { sides: 5, color: CYANL, name: "edgeGlint" }), 0.35);

  // frost fern inlay
  for (const zs of [1, -1]) {
    glow(
      b.part(planeGeo(0.42, 0.58, zs < 0), "#ffffff", {
        at: [0.3, HC, zs * 0.0465],
        dir: [0, 0, zs],
        axis: "z",
        texture: FROST,
      }),
      0.25,
    );
  }

  // ice accretion on the unsharpened spine: one dominant cluster on a shared footing
  footing(0.26, 0.36, 37, 0.09, 0.028, 0.055, 15, true);
  footing(0.17, 0.3, 37, 0.045, 0.02, 0.04, -20, false);
  crystal(new THREE.Vector3(0.26, HC + 0.365, 0), new THREE.Vector3(-0.15, 1, 0.03), 0.22, 0.032, 0, 0.3, 0.03);
  crystal(new THREE.Vector3(0.32, HC + 0.405, 0.01), new THREE.Vector3(0.45, 1, 0.12), 0.1, 0.02, 2, 0.3, 0.03);
  crystal(new THREE.Vector3(0.2, HC + 0.315, -0.01), new THREE.Vector3(-0.5, 1, -0.1), 0.09, 0.018, 3, 0.3, 0.03);

  // smaller lower-blade cluster
  footing(0.28, -0.36, -41, 0.07, 0.024, 0.045, -10, false);
  crystal(new THREE.Vector3(0.26, HC - 0.352, 0), new THREE.Vector3(0.15, -1, 0.05), 0.15, 0.026, 1, 0.3, 0.03);
  crystal(new THREE.Vector3(0.32, HC - 0.403, 0), new THREE.Vector3(0.55, -1, 0.1), 0.09, 0.018, 0, 0.3, 0.03);

  // --------------------------------------------------------------------------------------------------------
  // Pick fang: compressed outline, engraved rune line that follows the sloped face

  const A = 0.042;
  const pa = 0.02727;
  const pb = 0.01636;
  b.part(
    wedge(PICK, { c: [0.27, 0.1275], k: [0.86, 0.82], te: 0.004, tb: (x, y) => A - pa * x - pb * y, sx: -1 }),
    BLADE,
    { at: [0, HC, 0], name: "pick" },
  );

  const runePts: [number, number][] = [
    [0.126, 0.068],
    [0.261, 0.1615],
    [0.387, 0.2805],
    [0.486, 0.3995],
  ];
  const onFace = (x: number, y: number, zs: number): V => [-x, HC + y, zs * (A - pa * x - pb * y + 0.0013)];
  const branchSpec: [number, number[]][] = [
    [1, [1, -1]],
    [2, [-1]],
  ];
  for (const zs of [1, -1]) {
    glow(
      b.sweep(polyline(runePts.map(([x, y]) => onFace(x, y, zs))), 0.0022, {
        sides: 5,
        color: CYANL,
        name: "pickRune",
      }),
      0.3,
    );
    for (const [k, sides] of branchSpec) {
      const [x, y] = runePts[k];
      const [x0, y0] = runePts[k - 1];
      let tx = x - x0;
      let ty = y - y0;
      const tl = Math.hypot(tx, ty);
      tx /= tl;
      ty /= tl;
      for (const sd of sides) {
        const bx = tx * 0.55 - ty * sd * 0.85;
        const by = ty * 0.55 + tx * sd * 0.85;
        const bl = Math.hypot(bx, by);
        const ex = x + (bx / bl) * 0.028;
        const ey = y + (by / bl) * 0.028;
        glow(
          b.sweep(polyline([onFace(x, y, zs), onFace(ex, ey, zs)]), 0.002, {
            sides: 5,
            color: CYANL,
            name: "pickRuneBranch",
          }),
          0.3,
        );
      }
    }
  }

  const pickEdge = [
    [0.162, 0.187],
    [0.324, 0.289],
    [0.486, 0.442],
    [0.594, 0.578],
  ].map(([x, y]) => P3(-x, y));
  glow(b.sweep(polyline(pickEdge), 0.004, { sides: 5, color: CYANL, name: "pickGlint" }), 0.3);

  // two small pick growths
  bladeShard(-1, 0.216, 0.221, -0.25, 1, 0.1, 0.13, 0.02, 0, 0.02);
  bladeShard(-1, 0.27, 0.098, 0.35, -1, 0, 0.11, 0.02, 3, 0.015);

  // --------------------------------------------------------------------------------------------------------
  // Frost sparkles

  const sparkFrames = (
    [
      [0.54, HC + 0.66, 0.04],
      [0.7, HC + 0.3, 0.1],
      [-0.66, HC + 0.7, 0.05],
      [0.5, HC - 0.68, 0.08],
      [-0.4, HC + 0.5, 0.1],
    ] as V[]
  ).map((p) => frame(p, [0, 1, 0]));
  glow(b.cards(sparkFrames, SPARK, { size: 0.065, lean: 0, flow: [0, 0, 1], vary: 0.3, spin: 20, rng: rng(9) }), 1.0);

  return b.root;
}
```