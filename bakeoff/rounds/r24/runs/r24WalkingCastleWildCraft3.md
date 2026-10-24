```ts
// STYLE: "Delftware porcelain". The whole fortress is tin-glazed white earthenware hand-painted in
// cobalt blue: ship and windmill tiles, tulip panels, dinner-plate medallions, ginger-jar cannons and
// onion-dome roofs with blue scale-work. The only warm notes are the glowing eyes and windows, and a few gilt finials.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  scales,
  polyline,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Delft Walking Fortress",
  description:
    "A four-legged walking fortress made of white tin-glazed Delftware with cobalt hand-painted tiles, a windmill keep, onion-dome towers, ginger-jar cannons and a glowing gatehouse face.",
};

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const WHITE = "#f5f7fa";
const SHADE = "#d3dcea";
const PALE = "#c3d4ee";
const LIGHT = "#7b9bd6";
const COBALT = "#24459a";
const DEEP = "#142a6b";
const INKB = "#0c1a45";
const GOLD = "#e0a93a";
const WARM = "#ffd36b";

// ---------------------------------------------------------------- paints
const GLAZE = paint((p, n) => {
  const base = mix(SHADE, WHITE, smoothstep(-0.8, 0.5, n.y));
  const pool = smoothstep(0.62, 0.8, noise(p, 1.3, 11));
  return mix(base, PALE, pool * 0.45);
});
const BLUE = paint((p, n) => {
  const base = mix(DEEP, COBALT, smoothstep(-0.7, 0.6, n.y));
  const pool = smoothstep(0.55, 0.8, noise(p, 1.1, 5));
  return mix(base, DEEP, pool * 0.5);
});
const ROOF = scales(["#2a4ea6", "#2f57b3", "#244796"], PALE, { size: 0.45, width: 0.14, seed: 4 });
const FOOT = paint((p) => (p.y < 0.22 ? BLUE : GLAZE));
const LEGP = paint((_p, _n, s) => {
  const t = s[0];
  if (t < 0.06 || t > 0.94 || (t > 0.43 && t < 0.57)) return BLUE;
  return GLAZE;
});
const KEEP = paint((p) => {
  const y = p.y;
  if (y < 9.95 || (y > 12.85 && y < 13.05) || (y > 14.2 && y < 14.6)) return BLUE;
  return GLAZE;
});
const PLANKS = paint((p) => {
  const f = (((p.z / 0.6) % 1) + 1) % 1;
  return f < 0.07 ? COBALT : GLAZE;
});
const towerPaint = (cx: number, cz: number) =>
  paint((p) => {
    const y = p.y;
    if (y < 7.3 || (y > 10.0 && y < 10.3) || y > 10.8) return BLUE;
    const ang = Math.atan2(p.x - cx, p.z - cz);
    const k = (((ang / (Math.PI / 6)) % 1) + 1) % 1;
    if (y > 7.6 && y < 9.9 && Math.abs(k - 0.5) < 0.07) return LIGHT;
    return GLAZE;
  });

// ---------------------------------------------------------------- SVG drawings
const tulip = (x: number, y: number, k: number, fill: string) =>
  `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 0 L0 34" stroke="${COBALT}" stroke-width="2" fill="none"/>` +
  `<path d="M0 30 Q-13 22 -15 8 Q-4 14 0 26Z M0 26 Q12 20 15 10 Q5 14 0 22Z" fill="${LIGHT}" stroke="${COBALT}" stroke-width="1.3"/>` +
  `<path d="M-8 0 Q-11 -14 -5 -21 L0 -13 L5 -21 Q11 -14 8 0 Q0 7 -8 0Z" fill="${fill}" stroke="${COBALT}" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<path d="M0 -13 L0 3 M-4 -6 Q-5 -2 -3 1 M4 -6 Q5 -2 3 1" stroke="${COBALT}" stroke-width="1.2" fill="none"/></g>`;

const framed = (w: number, h: number) =>
  `<rect width="${w}" height="${h}" fill="${WHITE}"/>` +
  `<rect x="2.5" y="2.5" width="${w - 5}" height="${h - 5}" fill="none" stroke="${COBALT}" stroke-width="3"/>` +
  `<rect x="7" y="7" width="${w - 14}" height="${h - 14}" fill="none" stroke="${LIGHT}" stroke-width="1.2"/>` +
  `<path d="M7 7 H20 A13 13 0 0 1 7 20Z M${w - 7} 7 H${w - 20} A13 13 0 0 0 ${w - 7} 20Z M7 ${h - 7} H20 A13 13 0 0 0 7 ${h - 20}Z M${w - 7} ${h - 7} H${w - 20} A13 13 0 0 1 ${w - 7} ${h - 20}Z" fill="${COBALT}"/>`;

const waves = (x0: number, y: number, n: number, color: string, wd = 1.5) =>
  `<path d="M${x0} ${y} q4 -4 8 0${" t8 0".repeat(n - 1)}" stroke="${color}" stroke-width="${wd}" fill="none" stroke-linecap="round"/>`;

const shipSails = [78, 100, 122]
  .map((mx, i) => {
    const ty = [26, 18, 28][i];
    return (
      `<path d="M${mx - 13} 60 L${mx - 12} ${ty + 8} Q${mx} ${ty + 2} ${mx + 12} ${ty + 8} L${mx + 13} 60 Q${mx} 55 ${mx - 13} 60Z" fill="${WHITE}" stroke="${COBALT}" stroke-width="1.6"/>` +
      `<path d="M${mx - 12} ${(ty + 34) / 2 + 4} Q${mx} ${(ty + 34) / 2} ${mx + 12} ${(ty + 34) / 2 + 4}" stroke="${LIGHT}" stroke-width="1.2" fill="none"/>` +
      `<path d="M${mx - 8} ${ty + 6} L${mx} ${ty - 5} L${mx + 8} ${ty + 6}Z" fill="${PALE}" stroke="${COBALT}" stroke-width="1.3"/>` +
      `<path d="M${mx} ${ty - 5} V64" stroke="${DEEP}" stroke-width="2"/><path d="M${mx} ${ty - 5} l11 3 l-11 3Z" fill="${COBALT}"/>`
    );
  })
  .join("");
const SHIP = svg(
  `<svg viewBox="0 0 195 100">${framed(195, 100)}
  <circle cx="150" cy="27" r="8" fill="${PALE}" stroke="${LIGHT}" stroke-width="1.5"/>
  <path d="${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `M${150 + Math.cos(a) * 11} ${27 + Math.sin(a) * 11}L${150 + Math.cos(a) * 16} ${27 + Math.sin(a) * 16}`;
  }).join("")}" stroke="${LIGHT}" stroke-width="1.5"/>
  <path d="M24 30 q4 -7 10 -3 q5 -6 11 0 q7 0 5 6 H24Z" fill="${PALE}" stroke="${LIGHT}" stroke-width="1"/>
  ${waves(12, 74, 22, COBALT)}${waves(18, 82, 21, LIGHT)}${waves(12, 89, 22, COBALT, 1.1)}
  ${shipSails}
  <path d="M50 64 L150 64 L138 80 L62 80Z" fill="${COBALT}" stroke="${DEEP}" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M54 69 H146" stroke="${WHITE}" stroke-width="1.6"/>
  ${[70, 82, 94, 106, 118, 130].map((x) => `<circle cx="${x}" cy="74" r="1.8" fill="${WHITE}"/>`).join("")}
  <path d="M150 64 L172 56" stroke="${DEEP}" stroke-width="2"/>
  </svg>`,
  { size: 384 },
);

const sailArms = [0, 90, 180, 270]
  .map(
    (a) =>
      `<g transform="rotate(${a} 55 38)"><rect x="55" y="10" width="8" height="24" fill="${WHITE}" stroke="${COBALT}" stroke-width="1"/>` +
      `<path d="M55 15 H63 M55 20 H63 M55 25 H63 M55 30 H63" stroke="${LIGHT}" stroke-width="0.9"/></g>`,
  )
  .join("");
const LAND = svg(
  `<svg viewBox="0 0 195 100">${framed(195, 100)}
  <path d="M7 80 Q60 70 120 77 T188 75 V93 H7Z" fill="${PALE}"/>
  <path d="M14 84 l8 -3 M30 88 l9 -3 M70 86 l8 -3 M110 88 l9 -3 M150 85 l9 -3 M168 90 l9 -3" stroke="${COBALT}" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M90 20 q4 -5 8 0 q4 -5 8 0 M150 24 q3 -4 6 0 q3 -4 6 0" stroke="${COBALT}" stroke-width="1.5" fill="none"/>
  <path d="M42 82 L68 82 L62 42 L48 42Z" fill="${WHITE}" stroke="${COBALT}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="52" y="70" width="6" height="12" fill="${COBALT}"/>
  <path d="M44 62 H66 M46 52 H64" stroke="${LIGHT}" stroke-width="1.2"/>
  <path d="M46 42 L55 30 L64 42Z" fill="${COBALT}"/>
  <g transform="rotate(18 55 38)"><path d="M55 38 V8 M55 38 V68 M55 38 H25 M55 38 H85" stroke="${DEEP}" stroke-width="2.2"/>${sailArms}</g>
  <circle cx="55" cy="38" r="2.6" fill="${DEEP}"/>
  ${tulip(120, 50, 1, WHITE)}${tulip(145, 44, 1.2, PALE)}${tulip(170, 52, 1, WHITE)}
  </svg>`,
  { size: 384 },
);

const TULIPS = svg(
  `<svg viewBox="0 0 260 100">${framed(260, 100)}
  <path d="M20 90 Q130 70 240 90" stroke="${COBALT}" stroke-width="2" fill="none"/>
  ${tulip(65, 40, 1.35, WHITE)}${tulip(130, 32, 1.6, PALE)}${tulip(195, 40, 1.35, WHITE)}
  ${[30, 98, 162, 230].map((x) => `<circle cx="${x}" cy="50" r="3" fill="${COBALT}"/><circle cx="${x}" cy="50" r="6" fill="none" stroke="${LIGHT}" stroke-width="1.2"/>`).join("")}
  </svg>`,
  { size: 512 },
);

const petals = Array.from(
  { length: 8 },
  (_, i) =>
    `<ellipse cx="50" cy="29" rx="7" ry="14" transform="rotate(${i * 45} 50 50)" fill="${WHITE}" stroke="${COBALT}" stroke-width="1.8"/>`,
).join("");
const dots = Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI) / 8;
  return `<circle cx="${50 + Math.cos(a) * 44}" cy="${50 + Math.sin(a) * 44}" r="1.8" fill="${COBALT}"/>`;
}).join("");
const MEDALLION = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="${WHITE}" stroke="${COBALT}" stroke-width="3"/>
  <circle cx="50" cy="50" r="40" fill="${PALE}" stroke="${COBALT}" stroke-width="2"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="${WHITE}" stroke-width="1.2" stroke-dasharray="3 3"/>
  ${dots}${petals}<circle cx="50" cy="50" r="8" fill="${COBALT}"/><circle cx="50" cy="50" r="3.2" fill="${WARM}"/></svg>`,
  { size: 192 },
);

const border = (len: number) => {
  const w = Math.round(len * 40);
  const n = Math.floor(w / 16);
  let s = `<rect width="${w}" height="16" fill="${COBALT}"/><rect y="1" width="${w}" height="1" fill="${LIGHT}"/><rect y="14" width="${w}" height="1" fill="${LIGHT}"/>`;
  for (let i = 0; i < n; i++) {
    const x = i * 16 + (w - n * 16) / 2;
    s += `<path d="M${x + 8} 2.5 L${x + 14} 8 L${x + 8} 13.5 L${x + 2} 8Z" fill="${WHITE}"/><circle cx="${x + 8}" cy="8" r="2" fill="${COBALT}"/><circle cx="${x + 16}" cy="8" r="1.4" fill="${PALE}"/>`;
  }
  return svg(`<svg viewBox="0 0 ${w} 16">${s}</svg>`, { size: 1024 });
};
const BORDER_L = border(11.4);
const BORDER_S = border(9.4);

const SAIL = svg(
  `<svg viewBox="0 0 40 140"><rect x="1.5" y="1.5" width="37" height="137" fill="none" stroke="${COBALT}" stroke-width="3"/>
  ${Array.from({ length: 13 }, (_, i) => `<path d="M2 ${10 + i * 10} H38" stroke="${COBALT}" stroke-width="2.2"/>`).join("")}
  <path d="M11 2 V138 M29 2 V138" stroke="${LIGHT}" stroke-width="1.8"/>
  <path d="M20 0 V140" stroke="${DEEP}" stroke-width="4"/><rect x="1" y="1" width="38" height="12" fill="${COBALT}"/></svg>`,
  { size: 256 },
);

const FLAG = svg(
  `<svg viewBox="0 0 40 120"><path d="M2 118 L38 118 L36 44 L20 4 L4 44Z" fill="${COBALT}" stroke="${DEEP}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M8 112 L32 112 L31 50 L20 14 L9 50Z" fill="${WHITE}"/>
  <path d="M20 14 V112 M9 70 H31" stroke="${LIGHT}" stroke-width="1.4"/>
  <g transform="translate(20 90) scale(0.55)"><path d="M-8 0 Q-11 -14 -5 -21 L0 -13 L5 -21 Q11 -14 8 0 Q0 7 -8 0Z" fill="${COBALT}"/></g>
  <circle cx="20" cy="58" r="5" fill="${COBALT}"/></svg>`,
  { size: 192 },
);

const GATE = svg(
  `<svg viewBox="0 0 68 100"><path d="M1 100 V38 Q1 1 34 1 Q67 1 67 38 V100Z" fill="${WHITE}" stroke="${COBALT}" stroke-width="2"/>
  ${Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 8;
    return `<path d="M${34 + Math.cos(a) * 26} ${38 + Math.sin(a) * 28} L${34 + Math.cos(a) * 33} ${38 + Math.sin(a) * 36}" stroke="${COBALT}" stroke-width="1.6"/>`;
  }).join("")}
  <path d="M9 100 V38 Q9 10 34 10 Q59 10 59 38 V100Z" fill="${INKB}"/>
  <path d="M9 100 V82 H59 V100Z" fill="${WARM}"/>
  ${[15, 22, 29, 36, 43, 50, 56].map((x) => `<path d="M${x} 10 V76" stroke="${LIGHT}" stroke-width="2.4"/><path d="M${x - 2.4} 76 L${x} 88 L${x + 2.4} 76Z" fill="${LIGHT}"/>`).join("")}
  ${[24, 38, 52, 66].map((y) => `<path d="M9 ${y} H59" stroke="${LIGHT}" stroke-width="2"/>`).join("")}</svg>`,
  { size: 256 },
);

const WINDOW = svg(
  `<svg viewBox="0 0 28 50"><defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset="1" stop-color="#ffb938"/></linearGradient></defs>
  <path d="M1 50 V20 Q1 1 14 1 Q27 1 27 20 V50Z" fill="${COBALT}"/>
  <path d="M4.5 46 V20 Q4.5 4.5 14 4.5 Q23.5 4.5 23.5 20 V46Z" fill="url(#w)"/>
  <path d="M14 4.5 V46 M4.5 24 H23.5" stroke="${COBALT}" stroke-width="1.8"/>
  <rect x="0" y="45" width="28" height="5" fill="${PALE}" stroke="${COBALT}" stroke-width="1.2"/></svg>`,
  { size: 160 },
);

const EYE = svg(
  `<svg viewBox="0 0 100 100"><defs><radialGradient id="g" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fff3b8"/><stop offset=".6" stop-color="#ffcf5a"/><stop offset="1" stop-color="#f29a1c"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="${COBALT}"/>
  <circle cx="50" cy="50" r="41" fill="${WHITE}" stroke="${DEEP}" stroke-width="2"/>
  <circle cx="50" cy="50" r="34" fill="url(#g)"/><circle cx="50" cy="50" r="34" fill="none" stroke="${DEEP}" stroke-width="3"/>
  <ellipse cx="52" cy="52" rx="11" ry="17" fill="${INKB}"/>
  <circle cx="44" cy="40" r="6" fill="#fff"/><circle cx="60" cy="63" r="3" fill="#fff"/>
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<circle cx="${50 + Math.cos(a) * 45}" cy="${50 + Math.sin(a) * 45}" r="1.7" fill="${WHITE}"/>`;
  }).join("")}</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- model
export default function build() {
  const b = createBuilder({ name: "delft_walking_fortress", paintSize: 2048 });
  const hull = b.joint("hull", { at: [0, 5.8, 0], role: "spine" });

  // Merged static trim, one part per colour.
  const bag: Record<string, THREE.BufferGeometry[]> = {};
  const put = (color: string, g: THREE.BufferGeometry, at: [number, number, number], rotY = 0) => {
    const m = new THREE.Matrix4().compose(
      V(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)),
      V(1, 1, 1),
    );
    (bag[color] ??= []).push(g.applyMatrix4(m));
  };

  const plane = (w: number, h: number, tex: THREE.Texture, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: hull, at, dir, axis: "z", texture: tex });

  const plate = (bone: ReturnType<typeof b.joint>, c: THREE.Vector3, d: THREE.Vector3, r: number) => {
    b.part(new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.12, 14), BLUE, { bone, at: c, dir: d, flat: true });
    b.part(new THREE.CircleGeometry(r, 16), "#ffffff", {
      bone,
      at: c.clone().addScaledVector(d, 0.066),
      dir: d,
      axis: "z",
      texture: MEDALLION,
    });
  };

  // ============================================================ hull
  b.frustumBox([0, 4.5, 0], [0, 6.1, 0], [6.6, 8.6], [9.0, 11.0], { bone: hull, color: BLUE });
  b.part(new THREE.BoxGeometry(9.4, 0.45, 11.4), BLUE, { bone: hull, at: [0, 6.3, 0] });
  b.part(new THREE.BoxGeometry(9.0, 2.2, 11.0), GLAZE, { bone: hull, at: [0, 7.6, 0] });
  b.part(new THREE.BoxGeometry(9.6, 0.4, 11.6), BLUE, { bone: hull, at: [0, 8.9, 0] });

  for (const s of [1, -1]) {
    plane(11.4, 0.4, BORDER_L, [s * 4.73, 6.3, 0], [s, 0, 0]);
    plane(11.6, 0.4, BORDER_L, [s * 4.83, 8.9, 0], [s, 0, 0]);
    plane(9.4, 0.4, BORDER_S, [0, 6.3, s * 5.73], [0, 0, s]);
    plane(9.6, 0.4, BORDER_S, [0, 8.9, s * 5.83], [0, 0, s]);
    // side tile panels
    plane(3.9, 2.0, s > 0 ? SHIP : LAND, [s * 4.53, 7.6, 2.05], [s, 0, 0]);
    plane(3.9, 2.0, s > 0 ? LAND : SHIP, [s * 4.53, 7.6, -2.05], [s, 0, 0]);
    // medallions beside the gate
    b.part(new THREE.CircleGeometry(0.55, 16), "#ffffff", {
      bone: hull,
      at: [s * 2.55, 7.6, 5.53],
      dir: [0, 0, 1],
      axis: "z",
      texture: MEDALLION,
    });
    for (const z of [-4.0, 0, 4.0]) put(COBALT, new THREE.BoxGeometry(0.16, 2.2, 0.3), [s * 4.54, 7.6, z]);
  }
  plane(5.2, 2.0, TULIPS, [0, 7.6, -5.53], [0, 0, -1]);

  // crenellations
  for (const s of [1, -1]) {
    for (let z = -3.6; z <= 3.7; z += 1.2) {
      put(WHITE, new THREE.BoxGeometry(0.5, 0.75, 0.7), [s * 4.55, 9.475, z]);
      put(COBALT, new THREE.BoxGeometry(0.58, 0.1, 0.78), [s * 4.55, 9.89, z]);
    }
    for (let x = -2.9; x <= 2.95; x += 1.2) {
      if (s > 0 && Math.abs(x) < 2.3) continue;
      put(WHITE, new THREE.BoxGeometry(0.7, 0.75, 0.5), [x, 9.475, s * 5.55]);
      put(COBALT, new THREE.BoxGeometry(0.78, 0.1, 0.58), [x, 9.89, s * 5.55]);
    }
  }

  // ============================================================ gatehouse (the face)
  b.frustumBox([0, 4.9, 6.5], [0, 5.8, 6.5], [2.6, 1.2], [3.8, 2.0], { bone: hull, color: BLUE });
  b.part(new THREE.BoxGeometry(3.8, 4.4, 2.0), GLAZE, { bone: hull, at: [0, 8.0, 6.5] });
  b.part(new THREE.BoxGeometry(4.3, 0.32, 2.5), BLUE, { bone: hull, at: [0, 10.36, 6.5] });
  b.part(new THREE.BoxGeometry(4.0, 0.3, 2.2), BLUE, { bone: hull, at: [0, 5.85, 6.5] });
  const half = [
    [2.1, 0],
    [2.1, 0.5],
    [1.7, 0.5],
    [1.7, 1.0],
    [1.3, 1.0],
    [1.3, 1.5],
    [0.9, 1.5],
    [0.9, 2.0],
    [0.5, 2.0],
    [0.5, 2.4],
  ];
  const gableOutline = (k: number, up: number): [number, number][] => [
    ...half.map(([x, y]) => [x * k, y === 0 ? 0 : y + up] as [number, number]),
    ...half.map(([x, y]) => [-x * k, y === 0 ? 0 : y + up] as [number, number]).reverse(),
  ];
  b.extrude(gableOutline(1.06, 0.1), { at: [0, 10.5, 6.96], x: [1, 0, 0], thickness: 0.8, color: BLUE, bone: hull });
  b.extrude(gableOutline(1, 0), { at: [0, 10.5, 7.0], x: [1, 0, 0], thickness: 0.9, color: GLAZE, bone: hull });
  b.part(new THREE.SphereGeometry(0.3, 8, 6), GOLD, { bone: hull, at: [0, 13.2, 7.0], flat: true });
  glow(
    b.part(new THREE.PlaneGeometry(0.8, 1.4), "#ffffff", {
      bone: hull,
      at: [0, 11.55, 7.47],
      dir: [0, 0, 1],
      axis: "z",
      texture: WINDOW,
    }),
    1,
  );
  plane(1.7, 2.5, GATE, [0, 7.2, 7.52], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", {
        bone: hull,
        at: [s * 1.05, 9.0, 7.53],
        dir: [0, 0, 1],
        axis: "z",
        texture: EYE,
      }),
      1.3,
    );
    // stern brows: inner ends low
    b.capsule([s * 0.3, 9.62, 7.62], [s * 1.75, 9.9, 7.62], 0.075, COBALT, { bone: hull });
    put(COBALT, new THREE.BoxGeometry(0.16, 4.4, 0.16), [s * 1.9, 8.0, 7.5]);
  }

  // drawbridge (built flat, then lowered)
  const bridge = b.joint("bridge", { parent: hull, at: [0, 6.05, 7.6], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.BoxGeometry(2.4, 0.22, 5.0), PLANKS, { bone: bridge, at: [0, 6.05, 10.1] });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 2.7, 8), COBALT, { bone: bridge, at: [0, 6.12, 7.65], dir: [1, 0, 0], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.32, 5.0), BLUE, { bone: bridge, at: [s * 1.2, 6.2, 10.1] });
    b.part(new THREE.SphereGeometry(0.2, 6, 4), GOLD, { bone: bridge, at: [s * 1.2, 6.45, 12.55], flat: true });
  }
  b.pose(bridge, { axis: [1, 0, 0], deg: 38 });
  for (const s of [1, -1]) {
    const top = V(s * 1.55, 9.9, 7.62);
    const bot = bridge.local([-s * 1.2, 4.9, 0.3]);
    b.rod(top, bot, 0.045, COBALT, { bone: bridge });
    b.along(polyline([top, bot]), 6, (at) =>
      b.part(new THREE.SphereGeometry(0.11, 5, 4), WHITE, { at: at.at, bone: bridge, flat: true }),
    );
  }

  // ============================================================ corner towers
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const cx = sx * 4.4;
      const cz = sz * 5.4;
      const body = b.lathe(
        [
          [0, 6.5],
          [1.45, 6.5],
          [1.45, 6.8],
          [1.3, 6.95],
          [1.3, 10.6],
          [1.6, 10.85],
          [1.65, 11.3],
          [1.65, 11.6],
          [0, 11.6],
        ],
        { at: [cx, 0, cz], bone: hull, color: towerPaint(cx, cz) },
      );
      b.lathe(
        [
          [0, 0, "sharp"],
          [1.75, 0, "sharp"],
          [1.95, 0.6],
          [1.6, 1.4],
          [0.9, 2.2],
          [0.35, 3.0],
          [0.12, 3.6],
          [0, 3.8, "sharp"],
        ],
        { at: [cx, 11.6, cz], bone: hull, color: ROOF, smoothing: 1 },
      );
      b.part(new THREE.SphereGeometry(0.22, 8, 6), GOLD, { bone: hull, at: [cx, 15.45, cz], flat: true });
      b.rod([cx, 15.5, cz], [cx, 16.9, cz], 0.045, COBALT, { bone: hull });
      b.cards([frame([cx, 16.85, cz], [0, 0, -1])], FLAG, { size: [0.8, 2.0], flow: [1, 0, 0], bend: 25, bone: hull });
      const out = Math.atan2(sx, sz) / DEG;
      for (const [da, y] of [
        [0, 9.2],
        [-52, 8.4],
        [52, 8.4],
      ]) {
        const hit = b.surface(body).around([cx, y, cz]).at(out + da, 0);
        if (hit) glow(b.decal(body, WINDOW, { at: hit, size: [0.5, 0.9], segments: 6 }), 1);
      }
      // arrow-slit studs ring
      put(COBALT, new THREE.CylinderGeometry(1.5, 1.5, 0.12, 12), [cx, 8.0, cz]);
    }

  // ============================================================ windmill keep
  const kz = -0.8;
  const keep = b.lathe(
    [
      [0, 9.1],
      [2.9, 9.1],
      [2.9, 9.6],
      [2.6, 9.7],
      [2.15, 14.0],
      [2.35, 14.15],
      [2.35, 14.4],
      [2.0, 14.55],
      [0, 14.55],
    ],
    { at: [0, 0, kz], segments: 8, spin: 22.5, bone: hull, color: KEEP },
  );
  b.lathe(
    [
      [0, 0, "sharp"],
      [2.25, 0, "sharp"],
      [2.35, 0.25],
      [2.0, 0.9],
      [1.3, 1.6],
      [0.5, 2.1],
      [0, 2.3, "sharp"],
    ],
    { at: [0, 14.55, kz], bone: hull, color: ROOF, smoothing: 1 },
  );
  // gallery
  b.lathe(
    [
      [0, -0.1],
      [3.3, -0.1],
      [3.35, 0.05],
      [3.3, 0.2],
      [0, 0.2],
    ],
    { at: [0, 11.6, kz], bone: hull, color: BLUE, segments: 16 },
  );
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    put(WHITE, new THREE.BoxGeometry(0.1, 0.6, 0.1), [Math.sin(a) * 3.2, 11.8 + 0.3, kz + Math.cos(a) * 3.2]);
  }
  put(COBALT, new THREE.TorusGeometry(3.2, 0.07, 5, 20).rotateX(Math.PI / 2), [0, 12.45, kz]);
  for (const [az, y] of [
    [0, 12.8],
    [90, 12.8],
    [-90, 12.8],
    [180, 12.8],
    [90, 10.4],
    [-90, 10.4],
    [180, 10.4],
  ]) {
    const hit = b.surface(keep).around([0, y, kz]).at(az, 0);
    if (hit) glow(b.decal(keep, WINDOW, { at: hit, size: [0.6, 1.1], segments: 6 }), 1);
  }
  for (const az of [-45, 45, -135, 135]) {
    const hit = b.surface(keep).around([0, 13.45, kz]).at(az, 0);
    if (hit) b.decal(keep, MEDALLION, { at: hit, size: [0.85, 0.85], segments: 6 });
  }
  const door = b.surface(keep).around([0, 9.8, kz]).at(0, 0);
  if (door) b.decal(keep, GATE, { at: door, size: [0.9, 1.35], segments: 6 });

  // windmill sails
  const hub = V(0, 15.4, 2.6);
  const sails = b.joint("sails", { parent: hull, at: hub, dir: [0, 0, 1], role: "hinge" });
  b.rod([0, 15.4, 1.0], [0, 15.4, 2.6], 0.22, COBALT, { bone: hull });
  b.part(new THREE.SphereGeometry(0.55, 8, 6), COBALT, { bone: sails, at: [0, 15.4, 2.65], flat: true });
  b.part(new THREE.ConeGeometry(0.3, 0.7, 8), GOLD, { bone: sails, at: [0, 15.4, 3.2], dir: [0, 0, 1], flat: true });
  for (let k = 0; k < 4; k++) {
    const a = (22 + 90 * k) * DEG;
    const d = V(Math.cos(a), Math.sin(a), 0);
    b.rod(hub.clone().addScaledVector(d, 0.4), hub.clone().addScaledVector(d, 4.9), 0.11, DEEP, { bone: sails });
    b.part(new THREE.BoxGeometry(1.3, 3.9, 0.05), "#ffffff", {
      bone: sails,
      at: hub.clone().addScaledVector(d, 2.9).add(V(0, 0, 0.12)),
      dir: d,
      up: [0, 0, 1],
      texture: SAIL,
    });
    b.part(new THREE.SphereGeometry(0.14, 6, 4), GOLD, { bone: sails, at: hub.clone().addScaledVector(d, 4.95), flat: true });
  }
  // cap flag
  b.part(new THREE.SphereGeometry(0.2, 8, 6), GOLD, { bone: hull, at: [0, 16.9, kz], flat: true });
  b.rod([0, 16.9, kz], [0, 19.0, kz], 0.06, COBALT, { bone: hull });
  b.cards([frame([0, 18.95, kz], [0, 0, -1])], FLAG, { size: [1.0, 3.0], flow: [1, 0, 0], bend: 22, bone: hull });

  // ============================================================ ginger-jar cannons
  const VASE: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.55, 0, "sharp"],
    [0.8, 0.15],
    [1.0, 0.7],
    [1.05, 1.3],
    [0.85, 2.0],
    [0.5, 2.6],
    [0.42, 3.2],
    [0.5, 3.6],
    [0.62, 3.95],
    [0.64, 4.15, "sharp"],
    [0, 4.15, "sharp"],
  ];
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const base = V(s * 3.75, 9.6, 0.4);
    const d = V(s * 0.8, 0.52, 0.3).normalize();
    const gun = b.joint(`gun${tag}`, { parent: hull, at: base, dir: d, role: "hinge" });
    b.part(new THREE.BoxGeometry(1.7, 0.5, 2.0), BLUE, { bone: hull, at: [base.x, 9.35, 0.4] });
    for (const dz of [-1.05, 1.05])
      b.part(new THREE.CylinderGeometry(0.45, 0.45, 0.2, 10), WHITE, {
        bone: hull,
        at: [base.x, 9.5, 0.4 + dz],
        dir: [1, 0, 0],
        flat: true,
      });
    const vp = paint((p) => {
      const h = p.clone().sub(base).dot(d);
      if (h < 0.25 || h > 3.95 || (h > 2.55 && h < 2.7) || (h > 3.15 && h < 3.28)) return COBALT;
      if (h > 1.95 && h < 2.05) return LIGHT;
      return GLAZE;
    });
    const start = base.clone().addScaledVector(d, -0.1);
    const vase = b.lathe(VASE, { at: start, axis: d, bone: gun, color: vp, smoothing: 1, segments: 14 });
    b.part(new THREE.CircleGeometry(0.5, 10), INKB, {
      bone: gun,
      at: start.clone().addScaledVector(d, 4.17),
      dir: d,
      axis: "z",
    });
    const bulb = start.clone().addScaledVector(d, 1.15);
    const hit = b.surface(vase).nearest(bulb.clone().add(V(s * 1.2, 0, 0)));
    b.decal(vase, MEDALLION, { at: hit, size: [1.2, 1.2], segments: 8 });
    b.decal(vase, MEDALLION, { at: b.surface(vase).nearest(bulb.clone().add(V(0, 0, 1.2))), size: [0.9, 0.9], segments: 8 });
  }

  // ============================================================ granary at the stern
  b.part(new THREE.BoxGeometry(3.2, 2.0, 1.7), GLAZE, { bone: hull, at: [0, 10.1, -4.55] });
  b.part(new THREE.BoxGeometry(3.4, 0.2, 1.9), BLUE, { bone: hull, at: [0, 9.2, -4.55] });
  b.extrude(
    [
      [-1.05, 0],
      [1.05, 0],
      [0.8, 0.8],
      [0, 1.5],
      [-0.8, 0.8],
    ],
    { at: [0, 11.1, -4.55], x: [0, 0, 1], thickness: 3.6, color: ROOF, bone: hull },
  );
  b.part(new THREE.BoxGeometry(0.5, 1.1, 0.5), BLUE, { bone: hull, at: [1.1, 12.1, -4.2] });
  b.part(new THREE.BoxGeometry(0.62, 0.12, 0.62), GLAZE, { bone: hull, at: [1.1, 12.7, -4.2] });
  for (const x of [-0.8, 0.8])
    glow(
      b.part(new THREE.PlaneGeometry(0.5, 0.9), "#ffffff", {
        bone: hull,
        at: [x, 10.3, -5.42],
        dir: [0, 0, -1],
        axis: "z",
        texture: WINDOW,
      }),
      1,
    );
  b.rod([0, 11.9, -5.3], [0, 11.9, -6.4], 0.07, COBALT, { bone: hull });
  b.part(new THREE.SphereGeometry(0.2, 6, 4), GOLD, { bone: hull, at: [0, 11.9, -6.45], flat: true });

  // ============================================================ legs
  for (const f of [1, -1])
    for (const s of [1, -1]) {
      const tag = `${f > 0 ? "F" : "H"}${s > 0 ? "L" : "R"}`;
      const hipP = V(s * 3.9, 5.6, f * 4.4);
      const foot = V(s * 6.6, 0.75, f * 6.4);
      const pts = limb(hipP, foot, [3.9, 3.9], [[s * 1.1, 1.7, f * 0.5]]);
      const leg = b.chain(`leg${tag}`, pts, {
        parent: hull,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [foot.x, 0, foot.z],
      });
      const [hip, knee, ankle] = leg.joints;
      b.sweep(leg, (t: number) => 0.62 - 0.22 * t, { color: LEGP, sides: 8 });

      // hip ball with a dinner-plate
      b.part(new THREE.SphereGeometry(1.05, 10, 8), GLAZE, { bone: hip, at: hipP, flat: true });
      plate(hip, hipP.clone().addScaledVector(V(s, 0.1, f * 0.5).normalize(), 1.0), V(s, 0.1, f * 0.5).normalize(), 0.62);
      b.ring(frame(hipP, [0, 1, 0]), { count: 8, radius: 1.04, fromDeg: 0, toDeg: 315 }, (it) =>
        b.part(new THREE.SphereGeometry(0.1, 5, 4), COBALT, { frame: it, bone: hip, flat: true }),
      );

      // knee
      const kp = pts[1];
      const kd = kp.clone().sub(pts[0].clone().add(pts[2]).multiplyScalar(0.5)).normalize();
      b.part(new THREE.SphereGeometry(0.78, 10, 8), BLUE, { bone: knee, at: kp, flat: true });
      plate(knee, kp.clone().addScaledVector(kd, 0.66), kd, 0.5);
      b.ring(leg.at(0.5), { count: 7, radius: 0.8 }, (it) =>
        b.part(new THREE.SphereGeometry(0.13, 5, 4), WHITE, { frame: it, flat: true }),
      );

      // rib rings
      for (const t of [0.2, 0.3, 0.7, 0.8]) {
        const cp = leg.at(t);
        b.part(new THREE.TorusGeometry((0.62 - 0.22 * t) * 1.07, 0.07, 5, 14), COBALT, {
          bone: cp.bone,
          at: cp.at,
          dir: cp.tangent,
          axis: "z",
        });
      }

      // ankle + foot
      b.part(new THREE.SphereGeometry(0.55, 8, 6), BLUE, { bone: ankle, at: pts[2], flat: true });
      b.lathe(
        [
          [0, 0, "sharp"],
          [1.35, 0, "sharp"],
          [1.4, 0.12],
          [1.25, 0.3],
          [0.9, 0.7],
          [0.6, 0.95],
          [0, 0.95, "sharp"],
        ],
        { at: [foot.x, 0, foot.z], bone: ankle, color: FOOT, smoothing: 1, segments: 12 },
      );
      b.ring(frame([foot.x, 0.27, foot.z], [0, 1, 0]), { count: 5, radius: 1.0, fromDeg: -75, toDeg: 75 }, (it) =>
        b.rod(it, offset3(it, 0.7), [0.27, 0.2], BLUE, { bone: ankle, caps: { start: "flat", end: "round" }, sides: 6 }),
      );
    });

  // offset helper: a point along an item's outward axis
  function offset3(item: { at: THREE.Vector3; axis: THREE.Vector3 }, dist: number) {
    return item.at.clone().addScaledVector(item.axis, dist);
  }

  // flush merged trim
  for (const [color, list] of Object.entries(bag)) {
    const g = mergeGeometries(list);
    if (g) b.part(g, color, { bone: hull, at: [0, 0, 0] });
  }

  return b.root;
}
```