import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  stripes,
  grain,
  mottle,
  catmull,
  svg,
} from "../../../../src/index";
import { metal, gaugeTexture, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby, whimsical barnstormer biplane with candy-striped fat wings, a grinning radial cowl, a goggled pilot with a long scarf, a teddy-bear passenger, pennant bunting and a little grass airfield.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#fff1c9";
const RED = "#e8453c";
const TEAL = "#2a9d9a";
const NAVY = "#22304a";
const YELLOW = "#f4c542";
const ORANGE = "#ff8a2b";
const PINK = "#ff9bb0";
const SKINC = "#f3b98f";
const DARK = "#2a1810";
const WIRE = "#2b2b34";
const GLASS = "#bfeaff";
const WARM = "#ffd9a0";
const COOL = "#5f6fa8";
const SOIL = "#6b4a2f";
const GRASS1 = "#5fae45";
const GRASS2 = "#7fc752";

const BRASS = metal("brass", { polish: 0.35 });
const GILT = metal("gilt");
const BLUED = metal("blued");
const COPPER = metal("copper", { verdigris: 0.2 });
const STEEL = metal("steel");
const LEATHER = mottle("#8a5530", "#6b3f22", { size: 0.08, seed: 4 });
const LEATHER_LT = mottle("#b9803f", "#9a6530", { size: 0.07, seed: 5 });
const WOOD = grain("#c98f50", "#8f5a2c", { size: 0.025, axis: "y", seed: 2 });
const WOODX = grain("#c98f50", "#8f5a2c", { size: 0.03, axis: "x", seed: 3 });

const shade = (c: Parameters<typeof mix>[0], n: THREE.Vector3) =>
  mix(mix(c, WARM, 0.22 * Math.max(n.y, 0)), COOL, 0.35 * Math.max(-n.y, 0));
const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }).join(" ");

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${NAVY}"/><circle cx="50" cy="50" r="41" fill="${CREAM}"/>
  <circle cx="50" cy="50" r="34" fill="${RED}"/>
  <text x="50" y="69" font-size="56" font-weight="bold" text-anchor="middle" font-family="serif" fill="${NAVY}" stroke="${NAVY}" stroke-width="6">7</text>
  <text x="50" y="69" font-size="56" font-weight="bold" text-anchor="middle" font-family="serif" fill="${CREAM}">7</text></svg>`,
  { size: 256 },
);
const STAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="${NAVY}"/><circle cx="50" cy="50" r="40" fill="${CREAM}"/>
  <polygon points="${starPts(50, 52, 33, 14)}" fill="${RED}" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const GOGGLE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="#8fdcf5"/><circle cx="32" cy="32" r="31" fill="none" stroke="#3a6a86" stroke-width="3"/>
  <circle cx="33" cy="34" r="16" fill="#ffffff" stroke="${DARK}" stroke-width="3"/>
  <circle cx="36" cy="37" r="8" fill="${DARK}"/><circle cx="38.5" cy="34.5" r="2.6" fill="#ffffff"/>
  <ellipse cx="18" cy="16" rx="7" ry="4" transform="rotate(-35 18 16)" fill="#ffffff" opacity="0.95"/></svg>`,
  { size: 128 },
);
const MOUTH = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 8 L114 8 Q112 52 60 56 Q8 52 6 8Z" fill="${DARK}" stroke="#4a2a14" stroke-width="3"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${14 + i * 20}" y="9" width="15" height="${i === 2 ? 22 : 20 - Math.abs(i - 2) * 2}" rx="4" fill="${CREAM}" stroke="#b08a50" stroke-width="1.5"/>`).join("")}
  <path d="M28 44 Q60 56 92 44" stroke="${RED}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 256 },
);
const SMILE = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="7" cy="14" rx="6" ry="4.5" fill="#ff7f9a" opacity="0.85"/><ellipse cx="53" cy="14" rx="6" ry="4.5" fill="#ff7f9a" opacity="0.85"/>
  <path d="M16 18 Q30 38 44 18" stroke="${DARK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M30 28 Q30 33 34 33" stroke="#c0394a" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${RED}"/><circle cx="50" cy="50" r="38" fill="${CREAM}"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="50" y1="50" x2="${(50 + 36 * Math.cos((i * Math.PI) / 3)).toFixed(1)}" y2="${(50 + 36 * Math.sin((i * Math.PI) / 3)).toFixed(1)}" stroke="${NAVY}" stroke-width="5" stroke-linecap="round"/>`).join("")}
  <circle cx="50" cy="50" r="13" fill="#d9a63c" stroke="${NAVY}" stroke-width="3"/></svg>`,
  { size: 128 },
);
const PENNANT = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
  <polygon points="2,58 38,58 20,3" fill="#ffffff" stroke="#bdbdbd" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="12,58 28,58 20,26" fill="#dcdcdc"/></svg>`,
  { size: 128 },
);
const BANNER = svg(
  `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="196" height="36" rx="10" fill="${CREAM}" stroke="${RED}" stroke-width="4"/>
  <text x="100" y="27" font-size="21" font-weight="bold" text-anchor="middle" font-family="serif" fill="${NAVY}">BARNSTORM CO.</text></svg>`,
  { size: 512 },
);
const BEAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="68" rx="23" ry="18" fill="#f3d9a8"/><ellipse cx="50" cy="58" rx="8" ry="5.5" fill="${DARK}"/>
  <path d="M50 63 L50 70 M40 72 Q50 80 60 72" stroke="${DARK}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="30" cy="38" r="7.5" fill="${DARK}"/><circle cx="70" cy="38" r="7.5" fill="${DARK}"/>
  <circle cx="32.5" cy="35.5" r="2.6" fill="#ffffff"/><circle cx="72.5" cy="35.5" r="2.6" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 48 Q6 24 2 6 Q12 20 14 48Z" fill="#3b7d2e"/><path d="M11 48 Q14 20 16 2 Q22 22 22 48Z" fill="#5fae45"/>
  <path d="M19 48 Q24 28 30 12 Q30 32 28 48Z" fill="#7ccd4a"/></svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 48 Q15 34 16 20" stroke="#3b7d2e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M16 38 Q8 36 6 30 Q14 30 16 36Z" fill="#5fae45"/>
  ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${(16 + 7 * Math.cos((i * 2 * Math.PI) / 5)).toFixed(1)}" cy="${(14 + 7 * Math.sin((i * 2 * Math.PI) / 5)).toFixed(1)}" r="5.2" fill="${i % 2 ? PINK : "#ffffff"}" stroke="#d96b86" stroke-width="1"/>`).join("")}
  <circle cx="16" cy="14" r="4" fill="${YELLOW}"/></svg>`,
  { size: 128 },
);
const FRINGE = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${1 + i * 6.2}" y="2" width="4.6" height="38" rx="2.3" fill="${i % 2 ? CREAM : RED}"/>`).join("")}</svg>`,
  { size: 128 },
);
const SIGN = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="94" height="54" rx="6" fill="#f4e2b0" stroke="${RED}" stroke-width="4"/>
  <path d="M22 44 L22 18 M12 28 L22 16 L32 28" stroke="${NAVY}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="66" y="40" font-size="26" font-weight="bold" text-anchor="middle" font-family="serif" fill="${NAVY}">TOP</text></svg>`,
  { size: 256 },
);
const GAUGE = gaugeTexture({ needle: 55, label: "OIL" });

// ---------------------------------------------------------------------------------------------------------------
// Paints
const wingPaint = (zc: number) =>
  paint((p, n) => {
    const ax = Math.abs(p.x);
    let c: string | ReturnType<typeof mix> = Math.floor(ax / 0.3) % 2 === 0 ? CREAM : RED;
    if (p.z - zc > 0.2) c = TEAL;
    if (Math.abs(n.y) > 0.5 && ax % 0.2 < 0.008) c = mix(c, "#6a3f22", 0.55);
    c = mix(c, "#ffffff", 0.12 * (noise(p, 0.14, 3) - 0.5));
    return shade(c, n);
  });

const FUSE = paint((p, n) => {
  const edge = -0.2 + 0.25 * zig(p.z / 0.16);
  let c: string | ReturnType<typeof mix> = n.y > edge ? TEAL : CREAM;
  if (Math.abs(n.x) > 0.6 && Math.abs(p.y - 0.95) < 0.012) c = YELLOW;
  if (p.z > 0.35) c = mix(c, "#3a2a20", 0.55 * smoothstep(0.58, 0.68, noise(p, 0.12, 5)));
  return shade(c, n);
});

const BASE_TOP = 0.05;
const GROUND = paint((p, n) => {
  if (n.y < 0.5) return SOIL;
  const r = Math.hypot(p.x, p.z);
  if (Math.abs(p.x) < 0.7) {
    const dirt = mix("#c9a26a", "#a77f4c", noise(p, 0.12, 8));
    if (Math.abs(p.x) < 0.035 && ((p.z % 0.45) + 0.45) % 0.45 < 0.25) return CREAM;
    return mix(dirt, GRASS1, smoothstep(0.62, 0.7, Math.abs(p.x)));
  }
  return mix(mix(GRASS1, GRASS2, noise(p, 0.35, 2)), "#3f8a35", smoothstep(1.8, 1.98, r) * 0.7);
});

// ---------------------------------------------------------------------------------------------------------------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormer" });
  const R = rng(11);
  const FY = 0.74;
  const PROP = 0.64;

  const body = b.joint("body", { at: [0, FY, 0], dir: [0, 0, 1], role: "spine" });

  // Helpers -----------------------------------------------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mk = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: body, flat: true, at, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rod = (a: number[], c: number[], r: number, color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone: body, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ball = (r: number, color: any, at: number[], o: any = {}) =>
    mk(new THREE.SphereGeometry(r, 8, 6), color, at, o);
  const lp = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);

  // Fuselage -----------------------------------------------------------------------------------------------------
  const fuse = b.loft(
    [
      { at: [0, FY, 0.66], w: 0.5, h: 0.5 },
      { at: [0, FY + 0.01, 0.25], w: 0.56, h: 0.62 },
      { at: [0, FY, -0.2], w: 0.48, h: 0.56 },
      { at: [0, FY + 0.02, -0.75], w: 0.27, h: 0.38 },
      { at: [0, FY + 0.04, -1.35], w: 0.08, h: 0.14 },
    ],
    { bone: body, color: FUSE },
  );
  const skin = b.surface(fuse);
  const topY = (z: number) => skin.ray([0, 3, z], [0, -1, 0])?.at.y ?? 1.0;

  for (const s of [1, -1]) {
    const h = skin.around([0, FY + 0.13, -0.58]).at(s * 90, 0);
    if (h) b.decal(fuse, ROUNDEL, { at: h, size: [0.22, 0.22] });
    const h2 = skin.around([0, FY - 0.1, -0.58]).at(s * 90, 0);
    if (h2) b.decal(fuse, BANNER, { at: h2, size: [0.5, 0.1] });
  }

  // Cowl and engine ----------------------------------------------------------------------------------------------
  const cowl = b.lathe(
    [[0, 0], [0.25, 0], [0.285, 0.07], [0.29, 0.3], [0.22, 0.38], [0.1, 0.425], [0, 0.44]],
    { at: [0, FY, 0.58], axis: [0, 0, 1], bone: body, segments: 16, color: BRASS },
  );
  const mh = b.surface(cowl).ray([0, FY - 0.17, 2], [0, 0, -1]);
  if (mh) b.decal(cowl, MOUTH, { at: mh, dir: [0, 0, 1], size: [0.26, 0.13] });
  for (const z of [0.74, 0.95])
    mk(new THREE.TorusGeometry(0.289, 0.017, 4, 16), GILT, [0, FY, z], { dir: [0, 0, 1], axis: "z" });
  b.ring(frame([0, FY, 0.86], [0, 0, 1]), { count: 9, radius: 0.275 }, (it) =>
    b.stick(new THREE.CylinderGeometry(0.045, 0.055, 0.1, 7), BLUED, it, { embed: 0.25, bone: body, flat: true }),
  );
  for (const s of [1, -1]) {
    // gauge on cowl side
    mk(new THREE.CylinderGeometry(0.046, 0.046, 0.025, 12), GILT, [s * 0.29, FY + 0.02, 0.76], { dir: [s, 0, 0] });
    mk(new THREE.CircleGeometry(0.037, 16), "#ffffff", [s * 0.304, FY + 0.02, 0.76], {
      dir: [s, 0, 0],
      axis: "z",
      texture: GAUGE,
    });
    // exhaust pipes
    for (const dy of [0, -0.075]) {
      b.sweep(
        catmull([
          [s * 0.27, FY - 0.04 + dy, 0.9],
          [s * 0.35, FY - 0.07 + dy, 0.8],
          [s * 0.4, FY - 0.12 + dy, 0.68],
        ]),
        [0.024, 0.032],
        { color: COPPER, bone: body, sides: 6 },
      );
    }
  }

  // Propeller ----------------------------------------------------------------------------------------------------
  const prop = b.joint("prop", { parent: body, at: [0, FY, 1.04], dir: [0, 0, 1], role: "hinge" });
  const propPaint = paint((p) => (Math.hypot(p.x, p.y - FY) > 0.5 ? YELLOW : WOOD));
  const blade: [number, number][] = [[-0.05, 0.04], [-0.07, 0.25], [-0.06, PROP], [0, PROP + 0.03], [0.06, PROP], [0.085, 0.25], [0.05, 0.04]];
  for (const k of [1, -1])
    b.extrude(blade, { at: [0, FY, 1.04], x: [k, 0, 0], y: [0, k, 0], thickness: 0.03, bevel: 0.01, smoothing: 1, color: propPaint, bone: prop });
  mk(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 12), GILT, [0, FY, 1.03], { bone: prop, dir: [0, 0, 1] });
  mk(new THREE.ConeGeometry(0.1, 0.2, 10), BRASS, [0, FY, 1.13], { bone: prop, dir: [0, 0, 1] });
  b.pose(prop, { axis: [0, 0, 1], deg: 35 });

  // Wings --------------------------------------------------------------------------------------------------------
  const planform = (half: number, zc: number, ch: number): [number, number][] => {
    const f = ch / 2;
    const r = f * 0.55;
    return [
      [-half, zc - f * 0.8], [-half, zc + f * 0.8], [-half + r, zc + f], [half - r, zc + f],
      [half, zc + f * 0.8], [half, zc - f * 0.8], [half - r, zc - f], [-half + r, zc - f],
    ];
  };
  const wings = [
    { name: "U", y: 1.52, half: 1.5, zc: 0.3, ch: 0.62 },
    { name: "W", y: 0.66, half: 1.35, zc: 0.18, ch: 0.58 },
  ];
  for (const w of wings) {
    b.extrude(planform(w.half, w.zc, w.ch), {
      at: [0, w.y, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.11, bevel: 0.045, smoothing: 1,
      color: wingPaint(w.zc), bone: body,
    });
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hz = w.zc - w.ch / 2 + 0.01;
      const ail = b.joint(`aileron${w.name}${side}`, { parent: body, at: [s * 0.9, w.y, hz], dir: [s, 0, 0], role: "hinge" });
      b.extrude(
        [[s * 0.55, hz + 0.1], [s * 0.55, hz - 0.14], [s * 1.28, hz - 0.14], [s * (w.half - 0.1), hz + 0.1]],
        { at: [0, w.y, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, bevel: 0.015, smoothing: 1, color: RED, bone: ail },
      );
      glow(
        b.part(new THREE.SphereGeometry(0.035, 8, 6), s > 0 ? "#ff4b4b" : "#4bff7a", {
          bone: body, at: [s * (w.half + 0.01), w.y, w.zc], flat: true,
        }),
        1.5,
      );
    }
  }

  // Struts, wires, cabane, bunting --------------------------------------------------------------------------------
  const flagFrames: ReturnType<typeof frame>[][] = [[], [], [], []];
  let fi = 0;
  for (const s of [1, -1]) {
    for (const [zb, zt] of [[0.4, 0.5], [0.02, 0.12]]) {
      rod([s * 0.95, 0.7, zb], [s * 0.95, 1.48, zt], 0.026, WOOD, { sides: 4 });
      ball(0.032, GILT, [s * 0.95, 0.72, zb]);
      ball(0.032, GILT, [s * 0.95, 1.46, zt]);
    }
    rod([s * 0.95, 0.72, 0.02], [s * 0.95, 1.46, 0.5], 0.005, WIRE);
    rod([s * 0.95, 0.72, 0.4], [s * 0.95, 1.46, 0.12], 0.005, WIRE);
    rod([s * 0.2, 1.0, 0.3], [s * 0.95, 0.74, 0.22], 0.005, WIRE);
    rod([s * 0.17, 0.98, 0.52], [s * 0.13, 1.48, 0.5], 0.028, WOOD, { sides: 4 });
    rod([s * 0.27, 0.9, 0.04], [s * 0.19, 1.48, 0.09], 0.028, WOOD, { sides: 4 });
    ball(0.034, GILT, [s * 0.13, 1.46, 0.5]);
    ball(0.034, GILT, [s * 0.19, 1.46, 0.09]);

    const string = catmull([[s * 0.22, 1.5, 0.68], [s * 0.85, 1.42, 0.7], [s * 1.45, 1.5, 0.62]]);
    b.sweep(string, 0.006, { color: NAVY, bone: body });
    b.along(string, 8, (at) => {
      flagFrames[fi++ % 4].push(frame(at.at, [0, 1, 0]));
    });
  }
  ["#e8453c", "#f4c542", "#2a9d9a", "#ff9bb0"].forEach((tint, i) =>
    b.cards(flagFrames[i], PENNANT, { size: [0.1, 0.13], lean: 180, flow: [0, 0, 1], sink: 0, color: tint, bone: body }),
  );

  // Cockpits ------------------------------------------------------------------------------------------------------
  for (const cz of [0.18, -0.3]) {
    const ty = topY(cz);
    mk(new THREE.CircleGeometry(0.16, 12), DARK, [0, ty + 0.004, cz], { dir: [0, 1, 0], axis: "z" });
    mk(new THREE.TorusGeometry(0.17, 0.035, 5, 12), LEATHER, [0, ty + 0.005, cz], { dir: [0, 1, 0], axis: "z" });
    mk(new THREE.BoxGeometry(0.3, 0.07, 0.012), GLASS, [0, ty + 0.045, cz + 0.2], { rotation: [-20, 0, 0] });
    for (const s of [1, -1]) rod([s * 0.15, ty + 0.01, cz + 0.2], [s * 0.15, ty + 0.085, cz + 0.186], 0.008, GILT);
  }

  // Pilot ---------------------------------------------------------------------------------------------------------
  const PZ = -0.3;
  const PY = topY(PZ);
  const hy = PY + 0.28;
  const head = b.joint("headP", { parent: body, at: [0, hy - 0.1, PZ], dir: [0, 0, 1], role: "head" });
  b.capsule([0, PY - 0.02, PZ], [0, PY + 0.08, PZ], 0.11, LEATHER, { bone: body });
  b.capsule([-0.1, PY + 0.1, PZ], [0.1, PY + 0.1, PZ], 0.06, LEATHER, { bone: body });
  const skull = mk(new THREE.SphereGeometry(0.125, 12, 9), SKINC, [0, hy, PZ], { bone: head, scale: [1, 1.05, 1] });
  mk(new THREE.SphereGeometry(0.138, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER_LT, [0, hy + 0.02, PZ], { bone: head });
  mk(new THREE.TorusGeometry(0.136, 0.015, 4, 12), DARK, [0, hy + 0.02, PZ], { bone: head, dir: [0, 1, 0], axis: "z" });
  mk(new THREE.TorusGeometry(0.128, 0.012, 4, 12), DARK, [0, hy + 0.01, PZ], { bone: head, dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) {
    mk(new THREE.BoxGeometry(0.04, 0.09, 0.07), LEATHER_LT, [s * 0.13, hy - 0.04, PZ], { bone: head });
    mk(new THREE.CylinderGeometry(0.056, 0.056, 0.04, 10), GILT, [s * 0.066, hy + 0.01, PZ + 0.115], { bone: head, dir: [0, 0, 1] });
    mk(new THREE.CircleGeometry(0.047, 12), "#ffffff", [s * 0.066, hy + 0.01, PZ + 0.137], {
      bone: head, dir: [0, 0, 1], axis: "z", texture: GOGGLE,
    });
  }
  ball(0.03, PINK, [0, hy - 0.03, PZ + 0.125], { bone: head });
  const mouthHit = b.surface(skull).around([0, hy, PZ]).at(0, -48);
  if (mouthHit) b.decal(skull, SMILE, { at: mouthHit, dir: [0, 0, 1], size: [0.12, 0.08] });
  // scarf
  mk(new THREE.TorusGeometry(0.09, 0.035, 5, 10), RED, [0, PY + 0.16, PZ], { dir: [0, 1, 0], axis: "z" });
  const scarfPath = catmull([
    [0.05, PY + 0.16, PZ - 0.08], [0.12, PY + 0.17, -0.55], [0.2, PY + 0.22, -0.8], [0.19, PY + 0.2, -1.05], [0.12, PY + 0.27, -1.28],
  ]);
  b.sweep(scarfPath, (t) => [0.04 + 0.035 * t, 0.01], {
    color: stripes(RED, CREAM, { size: 0.09, axis: "z", width: 0.5, wobble: 0 }), bone: body, caps: "flat",
  });
  b.cards([frame(scarfPath.at(1), [0, 1, 0])], FRINGE, { size: [0.15, 0.09], lean: 180, flow: [0, 0, 1], sink: 0, bone: body });
  // arms and gloves
  for (const s of [1, -1]) {
    b.capsule([s * 0.12, PY + 0.1, PZ], [s * 0.21, PY + 0.03, PZ + 0.1], 0.04, LEATHER, { bone: body });
    ball(0.048, "#d9a867", [s * 0.21, PY + 0.03, PZ + 0.11]);
  }

  // Bear passenger ------------------------------------------------------------------------------------------------
  const BZ = 0.18;
  const by = topY(BZ);
  ball(0.09, "#b9803f", [0, by, BZ]);
  const bearHead = ball(0.075, "#b9803f", [0, by + 0.1, BZ]);
  for (const s of [1, -1]) {
    ball(0.03, "#b9803f", [s * 0.06, by + 0.165, BZ - 0.01]);
    ball(0.016, PINK, [s * 0.06, by + 0.165, BZ + 0.012]);
    ball(0.03, "#b9803f", [s * 0.07, by + 0.045, BZ + 0.17]);
  }
  const bh = b.surface(bearHead).around([0, by + 0.1, BZ]).at(0, 0);
  if (bh) b.decal(bearHead, BEAR, { at: bh, dir: [0, 0, 1], size: [0.12, 0.12] });
  mk(new THREE.TorusGeometry(0.06, 0.016, 4, 10), TEAL, [0, by + 0.045, BZ + 0.0], { dir: [0, 1, 0], axis: "z" });

  // Tail group ----------------------------------------------------------------------------------------------------
  const TY = FY + 0.03;
  b.extrude([[0.32, 0], [0, 0], [0, 0.52], [0.1, 0.57], [0.24, 0.42]], {
    at: [0, TY - 0.02, -1.13], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.02, smoothing: 1, color: TEAL, bone: body,
  });
  const rudder = b.joint("rudder", { parent: body, at: [0, TY - 0.02, -1.13], dir: [0, 1, 0], role: "hinge" });
  b.extrude([[0, 0], [-0.3, 0], [-0.34, 0.22], [-0.3, 0.46], [-0.2, 0.58], [0, 0.52]], {
    at: [0, TY - 0.02, -1.13], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.02, smoothing: 1, color: RED, bone: rudder,
  });
  for (const s of [1, -1])
    mk(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", [s * 0.034, TY - 0.02 + 0.3, -1.28], {
      bone: rudder, dir: [s, 0, 0], axis: "z", texture: STAR,
    });
  b.extrude([[-0.5, -1.16], [-0.48, -1.0], [-0.3, -0.92], [0.3, -0.92], [0.48, -1.0], [0.5, -1.16]], {
    at: [0, 0.77, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.045, bevel: 0.015, smoothing: 1, color: wingPaint(-1.05), bone: body,
  });
  const elev = b.joint("elevator", { parent: body, at: [0, 0.77, -1.16], dir: [1, 0, 0], role: "hinge" });
  b.extrude([[-0.5, -1.16], [0.5, -1.16], [0.52, -1.3], [0.3, -1.36], [-0.3, -1.36], [-0.52, -1.3]], {
    at: [0, 0.77, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.045, bevel: 0.015, smoothing: 1, color: RED, bone: elev,
  });
  const sk0 = [0, 0.72, -1.1];
  const sk1 = [0, 0.08, -1.5];
  rod(sk0, sk1, 0.025, WOOD, { sides: 6 });
  mk(new THREE.BoxGeometry(0.07, 0.05, 0.22), LEATHER, [0, 0.025, -1.52]);
  b.sweep(coil(lp(sk0, sk1, 0.25), lp(sk0, sk1, 0.8), 0.04, 5), 0.007, { color: STEEL, bone: body });

  // Landing gear --------------------------------------------------------------------------------------------------
  const WX = 0.58;
  const AY = 0.245;
  const AZ = 0.4;
  rod([-WX + 0.05, AY, AZ], [WX - 0.05, AY, AZ], 0.018, STEEL);
  for (const s of [1, -1]) {
    const wj = b.joint(`wheel${s > 0 ? "L" : "R"}`, { parent: body, at: [s * WX, AY, AZ], dir: [s, 0, 0], role: "hinge" });
    mk(new THREE.TorusGeometry(0.175, 0.07, 6, 14), "#26242c", [s * WX, AY, AZ], { bone: wj, dir: [1, 0, 0], axis: "z" });
    mk(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10), RED, [s * WX, AY, AZ], { bone: wj, dir: [1, 0, 0] });
    for (const f of [1, -1])
      mk(new THREE.CircleGeometry(0.115, 16), "#ffffff", [s * WX + f * 0.052, AY, AZ], {
        bone: wj, dir: [s * f, 0, 0], axis: "z", texture: HUB,
      });
    const a0 = [s * 0.15, 0.52, 0.52];
    const a1 = [s * WX, AY, AZ + 0.02];
    rod(a0, a1, 0.03, STEEL, { sides: 6 });
    rod([s * 0.18, 0.52, 0.28], [s * WX, AY, AZ - 0.02], 0.03, STEEL, { sides: 6 });
    b.sweep(coil(lp(a0, a1, 0.25), lp(a0, a1, 0.85), 0.045, 6), 0.007, { color: DARK, bone: body });
  }

  // Setting -------------------------------------------------------------------------------------------------------
  b.lathe([[0, 0], [2.0, 0], [2.0, 0.035], [1.94, BASE_TOP], [0, BASE_TOP]], {
    at: [0, 0, 0], bone: body, segments: 28, color: GROUND,
  });
  const STONES = ["#8c8a94", "#a7a39a", "#6f6d78"];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    mk(new THREE.DodecahedronGeometry(0.1, 0), STONES[i % 3], [Math.sin(a) * 1.94, BASE_TOP + 0.02, Math.cos(a) * 1.94], {
      scale: [1.1 + R() * 0.3, 0.6, 1], rotation: [R() * 40, R() * 360, 0],
    });
  }
  // windsock
  rod([1.35, BASE_TOP, -1.25], [1.35, 1.25, -1.25], 0.025, WOOD);
  ball(0.04, GILT, [1.35, 1.27, -1.25]);
  const sockAxis = new THREE.Vector3(-1, -0.15, -0.1).normalize();
  b.lathe([[0, 0], [0.11, 0], [0.05, 0.55], [0, 0.55]], {
    at: [1.35, 1.18, -1.25], axis: [sockAxis.x, sockAxis.y, sockAxis.z], bone: body, segments: 10,
    color: stripes(ORANGE, "#ffffff", { size: 0.16, axis: [sockAxis.x, sockAxis.y, sockAxis.z], width: 0.5, wobble: 0 }),
  });
  // fuel barrels
  for (const [bx, bz] of [[-1.45, 1.0], [-1.2, 1.3]]) {
    mk(new THREE.CylinderGeometry(0.16, 0.16, 0.36, 10), "#d9482f", [bx, BASE_TOP + 0.18, bz]);
    for (const dy of [0.07, 0.29])
      mk(new THREE.TorusGeometry(0.163, 0.012, 4, 12), NAVY, [bx, BASE_TOP + dy, bz], { dir: [0, 1, 0], axis: "z" });
    mk(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 10), "#a8321f", [bx, BASE_TOP + 0.366, bz]);
    ball(0.025, GILT, [bx + 0.05, BASE_TOP + 0.38, bz]);
  }
  // crate with sign
  const cx = -1.35;
  const cz2 = -1.1;
  mk(new THREE.BoxGeometry(0.42, 0.34, 0.42), WOOD, [cx, BASE_TOP + 0.17, cz2]);
  for (const sx of [1, -1]) {
    mk(new THREE.BoxGeometry(0.03, 0.36, 0.44), WOODX, [cx + sx * 0.2, BASE_TOP + 0.17, cz2]);
    ball(0.02, GILT, [cx + sx * 0.2, BASE_TOP + 0.3, cz2 + 0.23]);
  }
  mk(new THREE.PlaneGeometry(0.3, 0.18), "#ffffff", [cx, BASE_TOP + 0.17, cz2 + 0.215], { dir: [0, 0, 1], axis: "z", texture: SIGN });
  // hay bale
  const hx = 1.65;
  const hz = 0.55;
  mk(new THREE.BoxGeometry(0.34, 0.3, 0.52), grain("#e8c44f", "#c79a2e", { size: 0.03, axis: "z", seed: 6 }), [hx, BASE_TOP + 0.15, hz]);
  for (const dz of [-0.14, 0.14]) mk(new THREE.BoxGeometry(0.352, 0.312, 0.02), "#8a5a2c", [hx, BASE_TOP + 0.15, hz + dz]);
  // grass tufts and flowers
  const tufts: ReturnType<typeof frame>[] = [];
  const flowers: ReturnType<typeof frame>[] = [];
  const props: [number, number][] = [[1.35, -1.25], [-1.35, -1.1], [-1.45, 1.0], [-1.2, 1.3], [1.65, 0.55]];
  for (let i = 0; i < 200 && tufts.length + flowers.length < 52; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.8 + R() * 1.07;
    const x = Math.sin(a) * rr;
    const z = Math.cos(a) * rr;
    if (Math.abs(x) < 0.85) continue;
    if (props.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.45)) continue;
    (R() < 0.7 ? tufts : flowers).push(frame([x, BASE_TOP, z], [0, 1, 0]));
  }
  b.cards(tufts, TUFT, { size: [0.16, 0.14], lean: 8, cross: true, vary: 0.3, rng: R, bone: body });
  b.cards(flowers, FLOWER, { size: [0.1, 0.16], lean: 5, cross: true, vary: 0.25, rng: R, bone: body });

  return b.root;
}
