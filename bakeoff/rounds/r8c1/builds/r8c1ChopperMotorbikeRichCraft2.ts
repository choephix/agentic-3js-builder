import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, createBuilder, frame, gradient, mix, offset, paint, polyline, smoothstep, svg } from "../../../../src/index";
import type { DirectionInput, Fill, Joint, PointInput } from "../../../../src/index";
import { coil, gaugeTexture, gearGeometry, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Overwatch Chopper",
  description:
    "A stylised hero-tech chopper in an Overwatch look: raked springer fork with orange springs, flame-and-emblem tank, V-twin with a glowing cyan energy core, belt drive, drag pipes and a hazard-striped garage stage with holo emblem, bollards and a toolbox.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants

const P = 0.08; // stage height
const RF = 0.34; // front tyre radius
const RR = 0.38; // rear tyre radius
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const AXLE_F = V(0, RF + P, 1.12);
const AXLE_R = V(0, RR + P, -0.95);
const HEAD = V(0, 1.0, 0.5);
const FORK = AXLE_F.clone().sub(HEAD).normalize();
const FORK_LEN = AXLE_F.distanceTo(HEAD);
/** A point down the fork axis, `t` metres from the steering head, with optional sideways offset. */
const u = (t: number, x = 0) => offset(HEAD, FORK, t).add(V(x, 0, 0));

const ORANGE = "#f99e1a";
const NAVY = "#1f2b44";
const WHITE = "#f2f6ff";
const CYAN = "#35d4ff";
const BLACK = "#15171f";
const RUBBER = "#1a1b21";
const RED = "#ff4a2a";

// ---------------------------------------------------------------------------------------------------------------
// SVG helpers

const hexPts = (cx: number, cy: number, r: number, rot = -90) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((rot + 60 * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

const bolt = (cx: number, cy: number, r: number, fill: string) => {
  const pts = [
    [0.12, -0.62],
    [-0.34, 0.1],
    [-0.04, 0.1],
    [-0.14, 0.62],
    [0.34, -0.14],
    [0.04, -0.14],
  ];
  return `<polygon points="${pts.map(([x, y]) => `${(cx + x * r).toFixed(2)},${(cy + y * r).toFixed(2)}`).join(" ")}" fill="${fill}"/>`;
};

const emblem = (cx: number, cy: number, r: number, bg: string, fg: string, ring: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke="${ring}" stroke-width="${(r * 0.12).toFixed(2)}"/>` +
  `<polygon points="${hexPts(cx, cy, r * 0.7)}" fill="none" stroke="${fg}" stroke-width="${(r * 0.1).toFixed(2)}" stroke-linejoin="round"/>` +
  bolt(cx, cy, r * 0.52, fg);

const hazard = (id: string, x: number, y: number, w: number, h: number, bars: number, a: string, c: string) => {
  const sw = h / bars;
  let s = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><g clip-path="url(#${id})" fill="${a}">`;
  for (let i = -2; i < bars + 2; i++) {
    const y0 = y + i * sw;
    s += `<polygon points="${x},${y0 + sw * 0.5} ${x + w},${y0 + sw * 0.5 - w} ${x + w},${y0 + sw * 1.0 - w} ${x},${y0 + sw}"/>`;
  }
  return s + "</g>";
};

const flame = (x0: number, y0: number, len: number, w: number, curl: number) =>
  `M${x0} ${y0 - w} C${x0 + len * 0.45} ${y0 - w} ${x0 + len * 0.7} ${y0 - w * 0.4 + curl * 0.3} ${x0 + len} ${y0 + curl} ` +
  `C${x0 + len * 0.72} ${y0 + w * 0.2} ${x0 + len * 0.5} ${y0 + w} ${x0} ${y0 + w}Z`;

const TONGUES: [number, number, number, number, number][] = [
  [52, 22, 125, 10, -8],
  [48, 45, 135, 13, 5],
  [52, 68, 105, 10, 10],
];

const prof = (ks: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
  const i = Math.min(Math.floor(x), ks.length - 2);
  return ks[i] + (ks[i + 1] - ks[i]) * (x - i);
};

const arcBand = (rIn: number, rOut: number, a0: number, a1: number, n: number): [number, number][] => {
  const o: [number, number][] = [];
  const i: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
    o.push([rOut * Math.sin(a), rOut * Math.cos(a)]);
    i.push([rIn * Math.sin(a), rIn * Math.cos(a)]);
  }
  return o.concat(i.reverse());
};

const hull = (input: [number, number][]) => {
  const pts = input.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], c: [number, number]) =>
    (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
};

type PartOpts = {
  dir?: DirectionInput;
  axis?: "x" | "y" | "z";
  up?: DirectionInput;
  scale?: number | [number, number, number];
  texture?: THREE.Texture;
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // Skeleton ---------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.7, 0] });
  const steer = b.joint("steer", { parent: chassis, at: HEAD, dir: FORK });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXLE_F, dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: chassis, at: AXLE_R, dir: [1, 0, 0] });
  const kick = b.joint("kickstand", {
    parent: chassis,
    at: [0.13, 0.34, 0.1],
    aim: [0.2, 0.095, -0.12],
    role: "hinge",
  });

  // Helpers ----------------------------------------------------------------------------------------------------
  const R = (bone: Joint, a: PointInput, c: PointInput, r: number | [number, number], color: Fill, sides = 10) =>
    b.rod(a, c, r, color, { bone, sides });
  const G = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: PointInput, o: PartOpts = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // Paints -----------------------------------------------------------------------------------------------------
  const hemi = (hi: string, md: string, lo: string) =>
    paint((_p, n) => (n.y > 0.1 ? mix(md, hi, smoothstep(0.1, 0.95, n.y)) : mix(md, lo, smoothstep(0.1, -0.8, n.y))));
  const ORANGE_P = hemi("#ffc457", ORANGE, "#c9561b");
  const WH = hemi("#ffffff", "#e9eef8", "#a9b6d4");
  const NV = hemi("#4a5f92", "#2a3857", "#141b30");
  const GUN = hemi("#59627a", "#363c4d", "#1a1d28");
  const FIN = hemi("#6b7ca8", "#3a4668", "#1c2238");
  const STAGE = hemi("#4a5575", "#2b3350", "#151a2c");
  const LEATHER = hemi("#454a63", "#2a2e42", "#12141f");
  const STRIPED = paint((p) => (Math.abs(p.x) < 0.02 ? WH : Math.abs(p.x) < 0.03 ? NV : ORANGE_P));
  const CHROME = metal("steel", { polish: 0.8, tarnish: 0, size: 0.12 });
  const BLUED = metal("blued", { tarnish: 0 });
  const TIRE = paint((_p, _n, s) => {
    const edge = Math.min(s[1], 1 - s[1]);
    if (edge > 0.29 && edge < 0.33) return CYAN;
    if (edge < 0.17) return Math.floor(s[0] * 44) % 2 === 0 ? "#2d2f3a" : "#181920";
    return "#101116";
  });

  // Textures ---------------------------------------------------------------------------------------------------
  const TANK_TEX = svg(
    `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x, y, l, w, c)}" fill="${NAVY}" stroke="${NAVY}" stroke-width="7" stroke-linejoin="round"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x, y, l, w, c)}" fill="#ffd25a"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 6, y, l * 0.72, w * 0.55, c * 0.6)}" fill="#fff7dc"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 12, y, l * 0.42, w * 0.25, c * 0.3)}" fill="${CYAN}"/>`).join("")}
      ${emblem(30, 45, 24, NAVY, ORANGE, WHITE)}
    </svg>`,
    { size: 512 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#c4f5ff"/><stop offset="1" stop-color="#35d4ff"/></radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="url(#g)"/>
      <polygon points="${hexPts(50, 50, 32)}" fill="none" stroke="#35d4ff" stroke-width="3"/>
      <polygon points="${hexPts(50, 50, 18)}" fill="none" stroke="#7fe3ff" stroke-width="2.5"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = ((-90 + 60 * i) * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + 32 * Math.cos(a)}" y2="${50 + 32 * Math.sin(a)}" stroke="#35d4ff" stroke-width="2"/>`;
      }).join("")}
    </svg>`,
    { size: 256 },
  );
  const CORE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#06202e"/>
      <polygon points="${hexPts(50, 50, 40)}" fill="none" stroke="${CYAN}" stroke-width="3.5"/>
      <polygon points="${hexPts(50, 50, 27)}" fill="#0a3550" stroke="#9cecff" stroke-width="2.5"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = ((-90 + 60 * i) * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + 40 * Math.cos(a)}" y2="${50 + 40 * Math.sin(a)}" stroke="${CYAN}" stroke-width="2"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="14" fill="${CYAN}"/><circle cx="50" cy="50" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const MAG = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#232b44"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="${CYAN}" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="38" fill="#171d33"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = (60 * i * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + 36 * Math.cos(a)}" y2="${50 + 36 * Math.sin(a)}" stroke="${ORANGE}" stroke-width="12" stroke-linecap="round"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="40" fill="none" stroke="${ORANGE}" stroke-width="5"/>
      <circle cx="50" cy="50" r="13" fill="#1f2b44" stroke="#f2f6ff" stroke-width="3"/>
      <polygon points="${hexPts(50, 50, 8)}" fill="${CYAN}"/>
    </svg>`,
    { size: 256 },
  );
  const COVER = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="${ORANGE}"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="${NAVY}" stroke-width="3"/>
      ${emblem(50, 50, 34, NAVY, WHITE, WHITE)}
    </svg>`,
    { size: 256 },
  );
  const AIR = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#d6deed"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (22.5 * i * Math.PI) / 180;
        return `<line x1="${50 + 36 * Math.cos(a)}" y1="${50 + 36 * Math.sin(a)}" x2="${50 + 46 * Math.cos(a)}" y2="${50 + 46 * Math.sin(a)}" stroke="${NAVY}" stroke-width="4" stroke-linecap="round"/>`;
      }).join("")}
      ${emblem(50, 50, 32, NAVY, ORANGE, WHITE)}
    </svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="117" height="57" rx="8" fill="${WHITE}" stroke="${NAVY}" stroke-width="3"/>
      <rect x="8" y="7" width="104" height="9" fill="${ORANGE}"/>
      <text x="60" y="48" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="29" fill="${NAVY}">HX-76</text>
    </svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${hazard("hz", 0, 0, 64, 64, 8, ORANGE, "#1c2233")}</svg>`,
    { size: 128 },
  );
  const HOLO = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${hexPts(64, 64, 60)}" fill="none" stroke="${CYAN}" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="${hexPts(64, 64, 46)}" fill="none" stroke="#9cecff" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="64" cy="64" r="36" fill="none" stroke="${CYAN}" stroke-width="3" stroke-dasharray="3 9"/>
      ${bolt(64, 64, 30, "#ffffff")}
    </svg>`,
    { size: 256 },
  );
  const DECK = svg(
    `<svg viewBox="0 0 104 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="104" height="320" fill="#252d44"/>
      <rect x="9" y="9" width="86" height="302" rx="6" fill="#2e3856" stroke="#3d4a73" stroke-width="1.5"/>
      ${hazard("hl", 0, 0, 8, 320, 40, ORANGE, "#1c2233")}${hazard("hr", 96, 0, 8, 320, 40, ORANGE, "#1c2233")}
      <line x1="52" y1="96" x2="52" y2="222" stroke="#4a5a8c" stroke-width="2" stroke-dasharray="8 6"/>
      <polygon points="${hexPts(52, 52, 30)}" fill="none" stroke="${CYAN}" stroke-width="2.5"/>
      <polygon points="${hexPts(52, 52, 21)}" fill="none" stroke="#4a5a8c" stroke-width="2"/>
      ${bolt(52, 52, 14, ORANGE)}
      ${["#35d4ff", "#2aa6cc", "#207f9e", "#1a5f78", "#144459"]
        .map((c, i) => `<polyline points="22,${236 + i * 14} 52,${252 + i * 14} 82,${236 + i * 14}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`)
        .join("")}
    </svg>`,
    { size: 1024 },
  );
  const GAUGE = gaugeTexture({ needle: 55, label: "kW" });

  // ---------------------------------------------------------------------------------------------------------
  // Stage
  const LOWER: [number, number][] = [
    [-1.68, -0.36],
    [-1.46, -0.6],
    [1.46, -0.6],
    [1.68, -0.36],
    [1.68, 0.36],
    [1.46, 0.6],
    [-1.46, 0.6],
    [-1.68, 0.36],
  ];
  b.extrude(LOWER, { at: [0, 0.025, 0], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.05, bevel: 0.012, color: STAGE, bone: chassis });
  glow(
    b.sweep(polyline(LOWER.map(([zz, xx]) => [xx, 0.028, zz]), { closed: true }), 0.009, {
      color: CYAN,
      sides: 6,
      bone: chassis,
    }),
    1.2,
  );
  G(box(1.04, 0.03, 3.2), NV, chassis, V(0, 0.065, 0));
  G(new THREE.PlaneGeometry(1.04, 3.2), "#ffffff", chassis, V(0, 0.0815, 0), {
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: DECK,
  });
  // corner studs
  {
    const studs: THREE.BufferGeometry[] = [];
    for (const sx of [1, -1])
      for (const z of [-1.55, -0.8, 0.8, 1.55]) studs.push(new THREE.CylinderGeometry(0.02, 0.022, 0.012, 6).translate(sx * 0.49, 0.086, z));
    b.part(mergeGeometries(studs)!, CHROME, { bone: chassis, at: [0, 0, 0] });
  }

  // Front bollards
  for (const s of [1, -1]) {
    R(chassis, V(s * 0.4, 0.08, 1.5), V(s * 0.4, 0.1, 1.5), 0.08, NV, 6);
    G(new THREE.CylinderGeometry(0.055, 0.06, 0.28, 12), "#ffffff", chassis, V(s * 0.4, 0.24, 1.5), { texture: HAZARD });
    R(chassis, V(s * 0.4, 0.38, 1.5), V(s * 0.4, 0.405, 1.5), 0.062, NV, 12);
    glow(R(chassis, V(s * 0.4, 0.405, 1.5), V(s * 0.4, 0.43, 1.5), 0.04, ORANGE, 8), 1.4);
  }

  // Holo emblem pillar (rear left)
  {
    const hx = 0.34;
    const hz = -1.5;
    R(chassis, V(hx, 0.08, hz), V(hx, 0.13, hz), 0.1, NV, 6);
    R(chassis, V(hx, 0.13, hz), V(hx, 0.6, hz), 0.026, CHROME, 8);
    R(chassis, V(hx, 0.6, hz), V(hx, 0.64, hz), 0.06, ORANGE, 6);
    glow(G(new THREE.TorusGeometry(0.11, 0.011, 6, 20), CYAN, chassis, V(hx, 0.66, hz), { dir: [0, 1, 0], axis: "z" }), 1.4);
    glow(
      b.cards([frame([hx, 0.7, hz], [0, 1, 0])], HOLO, { size: [0.5, 0.5], lean: 0, sink: 0, cross: true, bone: chassis }),
      1.3,
    );
    glow(G(new THREE.TorusGeometry(0.075, 0.008, 6, 6), CYAN, chassis, V(hx, 0.095, hz), { dir: [0, 1, 0], axis: "z" }), 1.3);
  }

  // Toolbox and wrench (rear right)
  {
    const tx = -0.34;
    const tz = -1.5;
    G(box(0.3, 0.14, 0.2), NV, chassis, V(tx, 0.15, tz));
    G(box(0.32, 0.045, 0.22), ORANGE_P, chassis, V(tx, 0.2425, tz));
    b.sweep(
      catmull([
        [tx - 0.09, 0.265, tz],
        [tx - 0.09, 0.31, tz],
        [tx + 0.09, 0.31, tz],
        [tx + 0.09, 0.265, tz],
      ]),
      0.009,
      { color: CHROME, bone: chassis, sides: 6 },
    );
    for (const s of [1, -1]) G(box(0.04, 0.05, 0.012), CHROME, chassis, V(tx + s * 0.09, 0.2, tz + 0.105));
    G(new THREE.CircleGeometry(0.045, 14), "#ffffff", chassis, V(tx, 0.15, tz + 0.1005), {
      dir: [0, 0, 1],
      axis: "z",
      texture: COVER,
    });
    const ang = 0.35;
    b.extrude(
      [
        [0.04, 0.014],
        [0.24, 0.014],
        [0.24, -0.014],
        [0.04, -0.014],
        [0.035, -0.03],
        [0.012, -0.05],
        [-0.02, -0.045],
        [-0.04, -0.02],
        [-0.045, 0.0],
        [-0.04, 0.02],
        [-0.02, 0.045],
        [0.012, 0.05],
        [0.035, 0.03],
      ],
      {
        at: [-0.1, 0.092, -1.55],
        x: [Math.cos(ang), 0, Math.sin(ang)],
        y: [-Math.sin(ang), 0, Math.cos(ang)],
        thickness: 0.012,
        bevel: 0.003,
        color: CHROME,
        bone: chassis,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------
  // Frame
  const backbone = catmull([
    [0, 1.01, 0.48],
    [0, 0.9, 0.22],
    [0, 0.76, -0.1],
    [0, 0.64, -0.46],
  ]);
  b.sweep(backbone, 0.038, { color: GUN, bone: chassis, sides: 8 });
  for (const s of [1, -1]) {
    // lower cradle rails run straight back to the axle
    b.sweep(
      catmull([
        [s * 0.02, 0.945, 0.558],
        [s * 0.1, 0.5, 0.32],
        [s * 0.12, 0.34, 0.12],
        [s * 0.12, 0.33, -0.15],
        [s * 0.15, 0.38, -0.5],
        [s * 0.18, 0.46, -0.95],
      ]),
      0.028,
      { color: GUN, bone: chassis, sides: 8 },
    );
    // upper stays
    b.sweep(
      catmull([
        [0, 0.64, -0.46],
        [s * 0.1, 0.58, -0.7],
        [s * 0.18, 0.5, -0.9],
        [s * 0.18, 0.46, -0.95],
      ]),
      0.022,
      { color: GUN, bone: chassis, sides: 8 },
    );
    // dropout plates
    G(box(0.02, 0.08, 0.1), ORANGE_P, chassis, V(s * 0.19, 0.46, -0.95));
  }
  // head tube + clamps
  R(steer, u(-0.13), u(0.11), 0.045, NV, 10);
  R(steer, u(-0.025), u(0.025), 0.052, ORANGE, 10);
  G(box(0.3, 0.045, 0.07), CHROME, steer, u(-0.2), { dir: FORK });
  G(box(0.24, 0.04, 0.065), NV, steer, u(0.12), { dir: FORK });

  // skid plate + glow
  G(box(0.2, 0.03, 0.52), NV, chassis, V(0, 0.325, 0.04));
  for (const s of [1, -1]) glow(R(chassis, V(s * 0.105, 0.31, -0.2), V(s * 0.105, 0.31, 0.3), 0.008, CYAN, 6), 1.3);

  // ---------------------------------------------------------------------------------------------------------
  // Engine
  G(box(0.22, 0.2, 0.38), GUN, chassis, V(0, 0.43, 0.04));
  G(box(0.17, 0.16, 0.14), GUN, chassis, V(0, 0.4, -0.22));
  const fa = (32 * Math.PI) / 180;
  const dirF = V(0, Math.cos(fa), Math.sin(fa));
  const dirR = V(0, Math.cos(fa), -Math.sin(fa));
  const cylAssy = (base: THREE.Vector3, dir: THREE.Vector3) => {
    R(chassis, offset(base, dir, 0), offset(base, dir, 0.22), 0.058, GUN, 10);
    for (let i = 0; i < 7; i++) R(chassis, offset(base, dir, 0.03 + i * 0.027), offset(base, dir, 0.045 + i * 0.027), 0.078, FIN, 10);
    G(box(0.17, 0.09, 0.15), GUN, chassis, offset(base, dir, 0.25), { dir });
    G(box(0.145, 0.035, 0.12), ORANGE_P, chassis, offset(base, dir, 0.3), { dir });
    glow(G(box(0.1, 0.008, 0.03), CYAN, chassis, offset(base, dir, 0.3195), { dir }), 1.3);
  };
  cylAssy(V(0, 0.52, 0.14), dirF);
  cylAssy(V(0, 0.52, -0.04), dirR);

  // primary cover (left) with emblem
  R(chassis, V(0.11, 0.42, 0.07), V(0.15, 0.42, 0.07), 0.105, ORANGE_P, 14);
  G(new THREE.CircleGeometry(0.085, 18), "#ffffff", chassis, V(0.1505, 0.42, 0.07), { dir: [1, 0, 0], axis: "z", texture: COVER });
  G(new THREE.TorusGeometry(0.098, 0.008, 6, 18), CHROME, chassis, V(0.151, 0.42, 0.07), { dir: [1, 0, 0], axis: "z" });
  // energy core (right)
  R(chassis, V(-0.11, 0.42, 0.07), V(-0.15, 0.42, 0.07), 0.105, NV, 14);
  G(new THREE.TorusGeometry(0.088, 0.011, 6, 18), CHROME, chassis, V(-0.151, 0.42, 0.07), { dir: [-1, 0, 0], axis: "z" });
  glow(
    G(new THREE.CircleGeometry(0.075, 6), "#ffffff", chassis, V(-0.1515, 0.42, 0.07), { dir: [-1, 0, 0], axis: "z", texture: CORE }),
    1.5,
  );
  // air cleaner (left)
  R(chassis, V(0, 0.68, 0.06), V(0.1, 0.68, 0.06), 0.035, CHROME, 8);
  R(chassis, V(0.1, 0.68, 0.06), V(0.17, 0.68, 0.06), 0.125, ORANGE_P, 14);
  R(chassis, V(0.17, 0.68, 0.06), V(0.18, 0.68, 0.06), 0.13, CHROME, 14);
  G(new THREE.CircleGeometry(0.115, 16), "#ffffff", chassis, V(0.1805, 0.68, 0.06), { dir: [1, 0, 0], axis: "z", texture: AIR });

  // output shaft + sprocket
  R(chassis, V(0.09, 0.4, -0.2), V(0.235, 0.4, -0.2), 0.02, CHROME, 8);
  b.part(gearGeometry({ teeth: 14, module: 0.01, bore: 0.012 }), CHROME, { bone: chassis, at: V(0.22, 0.4, -0.2), dir: [1, 0, 0] });

  // ---------------------------------------------------------------------------------------------------------
  // Exhaust
  const pipe1 = catmull([
    [-0.07, 0.72, 0.31],
    [-0.17, 0.68, 0.34],
    [-0.25, 0.52, 0.3],
    [-0.27, 0.36, 0.18],
    [-0.27, 0.31, -0.2],
    [-0.27, 0.31, -0.7],
    [-0.27, 0.32, -1.12],
  ]);
  const pipe2 = catmull([
    [-0.07, 0.7, -0.13],
    [-0.17, 0.66, -0.14],
    [-0.26, 0.55, -0.17],
    [-0.3, 0.45, -0.3],
    [-0.3, 0.44, -0.7],
    [-0.3, 0.45, -1.2],
  ]);
  b.sweep(pipe1, [0.026, 0.028, 0.03, 0.032, 0.034, 0.04, 0.052], {
    color: gradient(BLUED, CHROME, V(-0.1, 0.7, 0.3), V(-0.27, 0.34, 0.15)),
    bone: chassis,
    sides: 10,
    caps: "flat",
  });
  b.sweep(pipe2, [0.026, 0.028, 0.03, 0.034, 0.04, 0.055], {
    color: gradient(BLUED, CHROME, V(-0.1, 0.68, -0.13), V(-0.28, 0.5, -0.2)),
    bone: chassis,
    sides: 10,
    caps: "flat",
  });
  G(new THREE.CircleGeometry(0.042, 10), BLACK, chassis, V(-0.27, 0.32, -1.121), { dir: [0, 0, -1], axis: "z" });
  G(new THREE.CircleGeometry(0.045, 10), BLACK, chassis, V(-0.3, 0.45, -1.201), { dir: [0, 0, -1], axis: "z" });
  for (const pp of [pipe1, pipe2])
    b.along(
      pp,
      3,
      (at) => b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.018, 10), BLACK, { frame: at, bone: chassis }),
      { from: 0.5, to: 0.85 },
    );

  // ---------------------------------------------------------------------------------------------------------
  // Tank
  const tankR = prof([0.06, 0.12, 0.15, 0.155, 0.14, 0.1, 0.05]);
  const tank = b.sweep(
    catmull([
      [0, 0.92, 0.42],
      [0, 0.94, 0.25],
      [0, 0.92, 0.05],
      [0, 0.88, -0.2],
    ]),
    (t: number): [number, number] => [tankR(t), tankR(t) * 0.9],
    { color: STRIPED, bone: chassis, sides: 12 },
  );
  for (const s of [1, -1])
    b.decal(tank, TANK_TEX, { at: tank.at(0.42, s * 90), dir: [s, 0, 0], size: [0.4, 0.18], mirror: s < 0 });
  const tankSkin = b.surface(tank);
  for (const z of [0.3, -0.04])
    b.sweep(tankSkin.loop([0, 0.93, z], { dir: [0, 0, 1], lift: 0.004 }), 0.006, { color: CHROME, sides: 6 });
  const capHit = tankSkin.nearest([0, 1.4, 0.2]);
  b.stick(new THREE.CylinderGeometry(0.04, 0.045, 0.03, 8), CHROME, capHit, { embed: 0.35 });
  b.stick(box(0.06, 0.012, 0.014), ORANGE, capHit.moved([0, 0.026, 0]), { embed: 0 });
  // tank mount
  G(box(0.06, 0.05, 0.08), GUN, chassis, V(0, 0.8, 0.0));

  // ---------------------------------------------------------------------------------------------------------
  // Seat + sissy bar
  b.sweep(
    catmull([
      [0, 0.81, -0.2],
      [0, 0.775, -0.38],
      [0, 0.8, -0.6],
    ]),
    (t: number): [number, number] => [0.07 + 0.08 * Math.sin(Math.PI * t), 0.05],
    {
      color: LEATHER,
      bone: chassis,
      sides: 10,
      sectors: [
        [75, 105, ORANGE],
        [255, 285, ORANGE],
      ],
    },
  );
  G(box(0.1, 0.03, 0.2), GUN, chassis, V(0, 0.73, -0.38));
  b.sweep(
    catmull([
      [0.2, 0.52, -0.97],
      [0.2, 0.9, -1.02],
      [0.17, 1.15, -1.05],
      [0.1, 1.29, -1.05],
      [-0.1, 1.29, -1.05],
      [-0.17, 1.15, -1.05],
      [-0.2, 0.9, -1.02],
      [-0.2, 0.52, -0.97],
    ]),
    0.012,
    { color: CHROME, bone: chassis, sides: 8 },
  );
  G(box(0.22, 0.1, 0.05), LEATHER, chassis, V(0, 1.14, -1.08));
  G(box(0.22, 0.012, 0.052), ORANGE, chassis, V(0, 1.195, -1.08));

  // ---------------------------------------------------------------------------------------------------------
  // Fenders
  b.extrude(arcBand(0.42, 0.448, 62, -104, 14), {
    at: AXLE_R,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.34,
    bevel: 0.01,
    color: STRIPED,
    bone: chassis,
  });
  {
    const riv: THREE.BufferGeometry[] = [];
    for (const sx of [1, -1])
      for (let a = 55; a >= -95; a -= 15) {
        const r = (a * Math.PI) / 180;
        riv.push(new THREE.SphereGeometry(0.008, 6, 4).translate(sx * 0.15, AXLE_R.y + 0.452 * Math.cos(r), AXLE_R.z + 0.452 * Math.sin(r)));
      }
    b.part(mergeGeometries(riv)!, CHROME, { bone: chassis, at: [0, 0, 0] });
  }
  for (const s of [1, -1]) R(chassis, V(s * 0.05, 0.66, -0.5), V(s * 0.14, 0.745, -0.63), 0.012, CHROME, 6);
  // fender edge glow strips
  for (const sx of [1, -1]) {
    const rim: number[][] = [];
    for (let a = 62; a >= -104; a -= 11) {
      const r = (a * Math.PI) / 180;
      rim.push([sx * 0.172, AXLE_R.y + 0.452 * Math.cos(r), AXLE_R.z + 0.452 * Math.sin(r)]);
    }
    glow(b.sweep(catmull(rim), 0.005, { color: CYAN, bone: chassis, sides: 5 }), 1.3);
  }
  // tail light + plate
  R(chassis, V(0, 0.55, -1.395), V(0, 0.55, -1.415), 0.05, CHROME, 6);
  glow(R(chassis, V(0, 0.55, -1.415), V(0, 0.55, -1.44), 0.036, RED, 6), 1.6);
  G(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", chassis, V(0, 0.42, -1.405), { dir: [0, 0.15, -1], axis: "z", texture: PLATE });
  G(box(0.17, 0.09, 0.008), NV, chassis, V(0, 0.42, -1.398), { dir: [0, 0, 1] });

  // front fender glow strips
  for (const sx of [1, -1]) {
    const rim: number[][] = [];
    for (let a = 70; a >= -35; a -= 11) {
      const r = (a * Math.PI) / 180;
      rim.push([sx * 0.067, AXLE_F.y + 0.402 * Math.cos(r), AXLE_F.z + 0.402 * Math.sin(r)]);
    }
    glow(b.sweep(catmull(rim), 0.004, { color: CYAN, bone: steer, sides: 5 }), 1.3);
  }
  // front fender
  b.extrude(arcBand(0.375, 0.4, 70, -35, 10), {
    at: AXLE_F,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.13,
    bevel: 0.008,
    color: STRIPED,
    bone: steer,
  });
  for (const s of [1, -1]) R(steer, u(0.62, s * 0.095), V(s * 0.065, AXLE_F.y + 0.384, AXLE_F.z - 0.068), 0.01, CHROME, 6);

  // ---------------------------------------------------------------------------------------------------------
  // Fork
  for (const s of [1, -1]) {
    const x = s * 0.095;
    R(steer, u(-0.2, x), u(0.32, x), 0.017, CHROME, 8);
    b.sweep(coil(u(-0.16, x), u(0.3, x), 0.034, 9), 0.0065, { color: ORANGE, bone: steer, sides: 5 });
    R(steer, u(0.3, x), u(FORK_LEN, x), [0.034, 0.028], NV, 10);
    R(steer, u(0.28, x), u(0.33, x), 0.04, ORANGE, 10);
    R(wheelF, V(s * 0.095, AXLE_F.y, AXLE_F.z), V(s * 0.128, AXLE_F.y, AXLE_F.z), 0.028, CHROME, 6);
    glow(G(new THREE.CircleGeometry(0.018, 6), CYAN, wheelF, V(s * 0.1285, AXLE_F.y, AXLE_F.z), { dir: [s, 0, 0], axis: "z" }), 1.4);
  }
  // front brake caliper
  G(box(0.03, 0.07, 0.06), ORANGE_P, steer, V(-0.07, AXLE_F.y + 0.115, AXLE_F.z - 0.06));

  // ---------------------------------------------------------------------------------------------------------
  // Headlight
  const LAMP = V(0, 1.06, 0.63);
  R(steer, V(0, LAMP.y, LAMP.z - 0.07), V(0, LAMP.y, LAMP.z + 0.03), 0.09, NV, 12);
  R(steer, V(0, LAMP.y, LAMP.z + 0.03), V(0, LAMP.y, LAMP.z + 0.06), 0.097, ORANGE, 12);
  glow(
    G(new THREE.CircleGeometry(0.08, 12), "#ffffff", steer, V(0, LAMP.y, LAMP.z + 0.0612), { dir: [0, 0, 1], axis: "z", texture: LENS }),
    1.3,
  );
  b.extrude(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.085, 0.025],
      [0.04, 0.045],
      [-0.04, 0.045],
      [-0.085, 0.025],
    ],
    { at: [0, LAMP.y + 0.075, LAMP.z - 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.13, bevel: 0.006, color: ORANGE_P, bone: steer },
  );
  for (const s of [1, -1]) R(steer, V(s * 0.095, LAMP.y, 0.436), V(s * 0.08, LAMP.y, LAMP.z - 0.03), 0.014, CHROME, 6);

  // ---------------------------------------------------------------------------------------------------------
  // Handlebars
  const GP = V(0, 1.215, 0.335);
  const GD = V(0, 0.55, -0.83).normalize();
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 1.17, 0.34],
        [s * 0.12, 1.2, 0.35],
        [s * 0.25, 1.27, 0.36],
        [s * 0.3, 1.36, 0.3],
        [s * 0.3, 1.38, 0.2],
        [s * 0.3, 1.37, 0.08],
      ]),
      0.014,
      { color: CHROME, bone: steer, sides: 8 },
    );
    R(steer, u(-0.2, s * 0.05), V(s * 0.05, 1.17, 0.34), 0.02, CHROME, 8);
    R(steer, V(s * 0.3, 1.378, 0.2), V(s * 0.3, 1.37, 0.05), 0.024, RUBBER, 8);
    R(steer, V(s * 0.3, 1.37, 0.05), V(s * 0.3, 1.368, 0.03), 0.026, ORANGE, 8);
    b.spike([s * 0.29, 1.36, 0.22], [s * 0.25, 1.33, 0.0], null, 0.01, { color: CHROME, bone: steer });
    // mirror
    R(steer, V(s * 0.3, 1.36, 0.3), V(s * 0.38, 1.49, 0.27), 0.01, CHROME, 6);
    const md = V(s * -0.08, 0.35, -1).normalize();
    R(steer, V(s * 0.38, 1.49, 0.27), offset(V(s * 0.38, 1.49, 0.27), md, 0.03), 0.052, ORANGE_P, 8);
    glow(G(new THREE.CircleGeometry(0.043, 6), "#7fe6ff", steer, offset(V(s * 0.38, 1.49, 0.27), md, 0.0305), { dir: md, axis: "z" }), 0.8);
  }
  // gauge pod
  R(steer, u(-0.2), GP, 0.018, CHROME, 8);
  R(steer, GP, offset(GP, GD, 0.035), 0.055, NV, 12);
  G(new THREE.CircleGeometry(0.047, 20), "#ffffff", steer, offset(GP, GD, 0.0356), { dir: GD, axis: "z", texture: GAUGE });
  G(new THREE.TorusGeometry(0.052, 0.006, 6, 16), CHROME, steer, offset(GP, GD, 0.035), { dir: GD, axis: "z" });

  // ---------------------------------------------------------------------------------------------------------
  // Front wheel
  G(new THREE.TorusGeometry(0.29, 0.05, 8, 28), TIRE, wheelF, AXLE_F, { dir: [1, 0, 0], axis: "z" });
  G(new THREE.TorusGeometry(0.235, 0.018, 6, 24), CHROME, wheelF, AXLE_F, { dir: [1, 0, 0], axis: "z", scale: [1, 1, 1.6] });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const cy = Math.cos(a);
    const sz = Math.sin(a);
    const sx = i % 2 ? 0.012 : -0.012;
    R(wheelF, V(sx, AXLE_F.y + 0.045 * cy, AXLE_F.z + 0.045 * sz), V(-sx, AXLE_F.y + 0.232 * cy, AXLE_F.z + 0.232 * sz), 0.0075, ORANGE, 6);
  }
  R(wheelF, V(-0.07, AXLE_F.y, AXLE_F.z), V(0.07, AXLE_F.y, AXLE_F.z), 0.045, CHROME, 10);
  R(wheelF, V(-0.055, AXLE_F.y, AXLE_F.z), V(-0.062, AXLE_F.y, AXLE_F.z), 0.14, CHROME, 18);

  // ---------------------------------------------------------------------------------------------------------
  // Rear wheel
  G(new THREE.TorusGeometry(0.28, 0.1, 10, 32), TIRE, wheelR, AXLE_R, { dir: [1, 0, 0], axis: "z", scale: [1, 1, 1.55] });
  R(wheelR, V(-0.13, AXLE_R.y, AXLE_R.z), V(0.13, AXLE_R.y, AXLE_R.z), 0.23, GUN, 14);
  for (const s of [1, -1])
    G(new THREE.CircleGeometry(0.205, 24), "#ffffff", wheelR, V(s * 0.131, AXLE_R.y, AXLE_R.z), { dir: [s, 0, 0], axis: "z", texture: MAG });
  R(wheelR, V(-0.13, AXLE_R.y, AXLE_R.z), V(-0.23, AXLE_R.y, AXLE_R.z), 0.045, CHROME, 10);
  R(wheelR, V(0.13, AXLE_R.y, AXLE_R.z), V(0.26, AXLE_R.y, AXLE_R.z), 0.045, CHROME, 10);
  R(wheelR, V(0.13, AXLE_R.y, AXLE_R.z), V(0.21, AXLE_R.y, AXLE_R.z), 0.09, NV, 12);
  glow(G(new THREE.CircleGeometry(0.036, 6), CYAN, wheelR, V(0.2612, AXLE_R.y, AXLE_R.z), { dir: [1, 0, 0], axis: "z" }), 1.4);
  glow(G(new THREE.CircleGeometry(0.036, 6), CYAN, wheelR, V(-0.2312, AXLE_R.y, AXLE_R.z), { dir: [-1, 0, 0], axis: "z" }), 1.4);
  // sprocket
  b.part(gearGeometry({ teeth: 34, module: 0.01, holes: 6, bore: 0.02 }), CHROME, { bone: wheelR, at: V(0.22, AXLE_R.y, AXLE_R.z), dir: [1, 0, 0] });
  // rear brake disc + caliper
  R(wheelR, V(-0.19, AXLE_R.y, AXLE_R.z), V(-0.198, AXLE_R.y, AXLE_R.z), 0.13, CHROME, 18);
  G(box(0.04, 0.07, 0.1), ORANGE_P, chassis, V(-0.19, AXLE_R.y + 0.115, AXLE_R.z - 0.07));

  // belt drive
  {
    const pts: [number, number][] = [];
    const ring = (cz: number, cy: number, r: number) => {
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        pts.push([cz + r * Math.sin(a), cy + r * Math.cos(a)]);
      }
    };
    ring(AXLE_R.z, AXLE_R.y, 0.19);
    ring(-0.2, 0.4, 0.088);
    const loop = hull(pts).map(([z, y]) => [0.22, y, z]);
    b.sweep(catmull(loop, { closed: true }), 0.009, { color: RUBBER, bone: chassis, sides: 6 });
  }

  // axle through
  R(wheelR, V(-0.23, AXLE_R.y, AXLE_R.z), V(0.26, AXLE_R.y, AXLE_R.z), 0.016, CHROME, 8);

  // ---------------------------------------------------------------------------------------------------------
  // Footpegs and kickstand
  for (const s of [1, -1]) {
    R(chassis, V(s * 0.1, 0.5, 0.32), V(s * 0.24, 0.3, 0.4), 0.014, CHROME, 6);
    R(chassis, V(s * 0.2, 0.3, 0.4), V(s * 0.29, 0.3, 0.4), 0.024, RUBBER, 8);
  }
  R(kick, V(0.13, 0.34, 0.1), V(0.2, 0.095, -0.12), 0.012, CHROME, 6);
  R(kick, V(0.17, 0.2, -0.01), V(0.18, 0.17, -0.03), 0.02, ORANGE, 6);
  G(box(0.06, 0.012, 0.05), BLACK, kick, V(0.2, 0.086, -0.12));

  return b.root;
}
