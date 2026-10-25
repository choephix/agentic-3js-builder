/**
 * catalogs/materials2077.ts: paint and texture recipes for a low-poly 2077 look. The topology catalogs are painted
 * plainly; this one makes the Roles (colours by part role) they take, plus neon strips, decals and screens that
 * `truck.ts assemble` lays on the finished truck. Each recipe is a plain function; copy what you use.
 *
 * ROLES   roles(picks) → Roles for the topology catalogs: a palette's flat colours with the body and trim recipes
 *   applied. Roles = { body, trim, glass, light, tyre, rim, steel, dark, weapon }; a Palette adds neon, neon2.
 *
 * PALETTES (flat faceted colour sets, `palettes.<name>`)
 *   nightOps  gunmetal body, black trim, cyan glass and lamps, magenta and cyan neon
 *   hazard    industrial yellow body, black trim, orange lamps, orange and white neon
 *   arctic    bone-white body, cobalt trim, ice-blue lamps, blue and white neon
 *   ember     oxblood body, soot trim, orange lamps, red and amber neon
 *
 * BODY PAINTS (`bodyPaints.<name>(palette)` → Fill; each a different pattern, in meters, baked to the atlas)
 *   flat        the palette body colour as is
 *   camo        digitalCamo: three tones quantised to a 12 cm grid from two octaves of noise
 *   panels      panelLines: a 45 cm panel grid in a darker seam, on the two axes across each face
 *   worn        wornEdges: bare-metal chips from fine noise, more on faces that look up
 *   grime       grime: a mottled dirt gradient climbing from the floor
 *   wornPanels  panel lines under worn edges (recipes nest)
 * TRIM PAINTS (`trimPaints.<name>(palette)` for bumpers, rails, cradles)
 *   flat      the palette trim colour
 *   chevrons  hazardChevrons: 45° stripes in the palette's hazard pair
 *   bands     horizontal stripes every 6 cm
 *   checker   8 cm checkerboard
 * NEON (`neons.<name>`, laid by `dress`; neonStrip(b, from, to, colour, bone, r) is one glowing rod)
 *   flank      a strip along each flank at the belt line
 *   outline    strips along the roof, hood and bed-rail edges
 *   underglow  strips under the frame rails and across the axles
 *   rings      a glowing ring on each wheel
 * DECALS (`decals.<name>()` → Texture; `decal(b, texture, m, w, h)` lays one on a face)
 *   unitNumber  a stencilled two-digit number in a frame
 *   warning     yellow triangle with a lightning glyph
 *   brand       hexagon mark with a chevron
 * SCREENS (`screens.<name>()` → Texture; `screen(b, texture, m, w, h)` lays one on a face and makes it glow)
 *   hud      reticle, grid, status bars, "SYS OK"
 *   map      contour lines with a blip
 *   warning  red "!" over hazard bars
 *
 * PICKS (truck.ts assemble, `style: { palette?, body?, trim?, neon?, decal?, screen? }`): names from the lists above;
 *   `dress` lays the unit number on the bed sides, the warning and brand on the tailgate, the screen on the back of the cab.
 */
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { gradient, mottle, noise, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import type { Anchors, Mount, Roles, V3 } from "./truck";
import { box, cyl } from "./truck";
import { row } from "./board";

export type Palette = Roles & { body: string; trim: string; neon: string; neon2: string; hazard: [string, string] };

export const palettes: Record<"nightOps" | "hazard" | "arctic" | "ember", Palette> = {
  nightOps: {
    body: "#2f343c",
    trim: "#1c1f24",
    glass: "#8fd3ff",
    light: "#7df9ff",
    tyre: "#17191c",
    rim: "#4b5159",
    steel: "#6a7079",
    dark: "#101214",
    weapon: "#262a30",
    neon: "#ff2bd6",
    neon2: "#2bf0ff",
    hazard: ["#e9c32a", "#15161a"],
  },
  hazard: {
    body: "#d9a21b",
    trim: "#1b1b1b",
    glass: "#b0e0ff",
    light: "#ff8a00",
    tyre: "#1a1a1a",
    rim: "#8a8f96",
    steel: "#7a7f86",
    dark: "#242628",
    weapon: "#3a3d42",
    neon: "#ff6a00",
    neon2: "#ffffff",
    hazard: ["#1b1b1b", "#d9a21b"],
  },
  arctic: {
    body: "#e4e9ee",
    trim: "#2d5fa3",
    glass: "#8ad7ff",
    light: "#9ff8ff",
    tyre: "#22252a",
    rim: "#b8c0c8",
    steel: "#8c949c",
    dark: "#3a4048",
    weapon: "#5a6470",
    neon: "#2b8cff",
    neon2: "#ffffff",
    hazard: ["#2d5fa3", "#e4e9ee"],
  },
  ember: {
    body: "#4a1f22",
    trim: "#161214",
    glass: "#ffb380",
    light: "#ff5a1f",
    tyre: "#1a1416",
    rim: "#6a5a52",
    steel: "#7c6f68",
    dark: "#241a1c",
    weapon: "#3a2a2c",
    neon: "#ff1f3d",
    neon2: "#ffb000",
    hazard: ["#ff8a1f", "#161214"],
  },
};

// ---------------------------------------------------------------- paints (model-space patterns)

/** Three tones quantised to a `size` grid: two octaves of noise read at each cell's corner. */
export function digitalCamo(tones: [string, string, string], size = 0.12, seed = 3) {
  return paint((p) => {
    const q = new THREE.Vector3(
      Math.floor(p.x / size) * size,
      Math.floor(p.y / size) * size,
      Math.floor(p.z / size) * size,
    );
    const v = noise(q, size * 4, seed) * 0.65 + noise(q, size * 1.6, seed + 1) * 0.35;
    return v < 0.42 ? tones[0] : v < 0.58 ? tones[1] : tones[2];
  });
}

/** A `size` panel grid drawn in `line`, on the two axes that run across the face (the one along its normal is skipped). */
export function panelLines(base: Fill, line: string, size = 0.45, width = 0.012) {
  const near = (v: number) => {
    const f = (((v / size) % 1) + 1) % 1;
    return Math.min(f, 1 - f) * size < width;
  };
  return paint((p, n) =>
    (Math.abs(n.x) < 0.7 && near(p.x + 0.17)) ||
    (Math.abs(n.y) < 0.7 && near(p.y + 0.05)) ||
    (Math.abs(n.z) < 0.7 && near(p.z + 0.31))
      ? line
      : base,
  );
}

/** Bare-metal chips where fine noise peaks; faces that look up chip more. */
export function wornEdges(base: Fill, bare: string, amount = 0.5, seed = 5) {
  return paint((p, n) =>
    noise(p, 0.035, seed) > 0.8 - amount * 0.12 - Math.max(0, n.y) * 0.05 && noise(p, 0.012, seed + 9) > 0.45
      ? bare
      : base,
  );
}

/** Mottled dirt climbing from `yLow` (full) to `yHigh` (clean). */
export function grime(base: Fill, dirt: string, yLow = 0.25, yHigh = 1.3) {
  return gradient(base, mottle(dirt, base, { size: 0.22, contrast: 0.9, seed: 7 }), [0, yHigh, 0], [0, yLow, 0]);
}

/** 45° stripes `size` apart in the XY plane (the front and back faces of a bumper read them as chevrons). */
export function hazardChevrons(a: string, b: string, size = 0.12) {
  return paint((p) => (((((p.x + p.y) / size) % 1) + 1) % 1 < 0.5 ? a : b));
}

export function bands(a: string, b: string, size = 0.06) {
  return paint((p) => (((((p.y + 0.02) / size) % 1) + 1) % 1 < 0.5 ? a : b));
}

export function checker(a: string, b: string, size = 0.08) {
  return paint((p) => ((Math.floor(p.x / size) + Math.floor(p.y / size) + Math.floor(p.z / size)) % 2 ? a : b));
}

export const bodyPaints = {
  flat: (k: Palette): Fill => k.body,
  camo: (k: Palette): Fill => digitalCamo([k.body, k.trim, k.steel as string]),
  panels: (k: Palette): Fill => panelLines(k.body, k.dark as string),
  worn: (k: Palette): Fill => wornEdges(k.body, k.rim as string),
  grime: (k: Palette): Fill => grime(k.body, k.dark as string),
  wornPanels: (k: Palette): Fill => wornEdges(panelLines(k.body, k.dark as string), k.rim as string),
};

export const trimPaints = {
  flat: (k: Palette): Fill => k.trim,
  chevrons: (k: Palette): Fill => hazardChevrons(k.hazard[0], k.hazard[1]),
  bands: (k: Palette): Fill => bands(k.hazard[0], k.hazard[1]),
  checker: (k: Palette): Fill => checker(k.hazard[0], k.hazard[1]),
};

// ---------------------------------------------------------------- neon

/** One glowing tube from `from` to `to`. */
export function neonStrip(b: Builder, from: V3, to: V3, color: string, bone: Joint, r = 0.012) {
  return glow(b.rod(from, to, r, color, { bone, sides: 6, caps: "flat" }), 1.6);
}

/** Truck coordinates (the base's chassis joint sits at [0, 0.6, 0]) shifted to wherever this chassis is. */
function truckSpace(a: Anchors) {
  const o = a.chassis.at;
  return (x: number, y: number, z: number): V3 => [o.x + x, o.y - 0.6 + y, o.z + z];
}

export const neons = {
  flank(b: Builder, a: Anchors, k: Palette) {
    const P = truckSpace(a);
    for (const s of [1, -1]) {
      neonStrip(b, P(s * 1.0, 1.33, -2.5), P(s * 1.0, 1.33, -0.4), k.neon, a.chassis);
      neonStrip(b, P(s * 1.0, 1.33, -0.2), P(s * 1.0, 1.33, 1.2), k.neon2, a.chassis);
    }
  },
  outline(b: Builder, a: Anchors, k: Palette) {
    const P = truckSpace(a);
    for (const s of [1, -1]) {
      neonStrip(b, P(s * 0.95, 1.97, -0.2), P(s * 0.95, 1.97, 1.2), k.neon, a.chassis);
      neonStrip(b, P(s * 0.82, 1.38, 1.3), P(s * 0.82, 1.38, 2.45), k.neon, a.chassis);
      neonStrip(b, P(s * 0.97, 1.44, -2.5), P(s * 0.97, 1.44, -0.4), k.neon2, a.chassis);
    }
    neonStrip(b, P(-0.95, 1.97, 1.2), P(0.95, 1.97, 1.2), k.neon, a.chassis);
  },
  underglow(b: Builder, a: Anchors, k: Palette) {
    const P = truckSpace(a);
    for (const s of [1, -1]) neonStrip(b, P(s * 0.62, 0.47, -2.2), P(s * 0.62, 0.47, 2.2), k.neon, a.chassis, 0.015);
    for (const z of [-1.0, 0.3]) neonStrip(b, P(-0.6, 0.47, z), P(0.6, 0.47, z), k.neon2, a.chassis, 0.015);
  },
  rings(b: Builder, a: Anchors, k: Palette) {
    for (const key of ["wheelFL", "wheelFR", "wheelRL", "wheelRR"] as const) {
      const m = a[key];
      glow(
        b.part(new THREE.TorusGeometry(0.3, 0.012, 5, 16), k.neon, {
          bone: m.bone,
          at: [m.at[0] + m.s * 0.18, m.at[1], m.at[2]],
          rotation: [0, 90, 0],
        }),
        1.6,
      );
    }
  },
};

// ---------------------------------------------------------------- decals and screens (SVG textures)

const FONT = 'font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900"';

export const decals = {
  unitNumber: (n = "07") =>
    svg(
      `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#f2f2f2" stroke-width="5"/><text x="64" y="58" ${FONT} font-size="56" fill="#f2f2f2" text-anchor="middle">${n}</text></svg>`,
      { size: 256 },
    ),
  warning: () =>
    svg(
      `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`,
      { size: 256 },
    ),
  brand: () =>
    svg(
      `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15161a" stroke="#f2f2f2" stroke-width="4"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#f2f2f2" stroke-width="9"/><polyline points="32,74 48,54 64,74" fill="none" stroke="#f2f2f2" stroke-width="7"/></svg>`,
      { size: 256 },
    ),
};

export const screens = {
  hud: () =>
    svg(
      `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a" stroke-width="1">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20, 40, 60, 80].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><line x1="52" y1="50" x2="108" y2="50" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="44" height="6" fill="#2bf0ff"/><rect x="8" y="88" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="88" width="22" height="6" fill="#ff2bd6"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">SYS OK</text></svg>`,
      { size: 320 },
    ),
  map: () =>
    svg(
      `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#071a10"/><g fill="none" stroke="#1f7a3a" stroke-width="2"><path d="M10 80 C 40 60, 60 90, 90 60 S 140 40, 155 20"/><path d="M5 50 C 30 30, 70 70, 100 30 S 130 10, 158 40"/><path d="M20 95 C 50 80, 80 95, 120 75 S 150 70, 160 80"/></g><circle cx="96" cy="46" r="5" fill="#5dff8a"/><circle cx="96" cy="46" r="12" fill="none" stroke="#5dff8a" stroke-width="2"/><text x="8" y="16" font-family="monospace" font-size="11" fill="#5dff8a">GRID 44N</text></svg>`,
      { size: 320 },
    ),
  warning: () =>
    svg(
      `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#1a0404"/>${[0, 32, 64, 96, 128].map((x) => `<polygon points="${x},0 ${x + 16},0 ${x + 32},16 ${x + 16},16" fill="#ff3a2a"/>`).join("")}${[0, 32, 64, 96, 128].map((x) => `<polygon points="${x},84 ${x + 16},84 ${x + 32},100 ${x + 16},100" fill="#ff3a2a"/>`).join("")}<text x="80" y="68" ${FONT} font-size="52" fill="#ff3a2a" text-anchor="middle">!</text></svg>`,
      { size: 320 },
    ),
};

/** A drawing on a flat face, a few millimetres out along the mount normal. */
export function decal(
  b: Builder,
  texture: THREE.Texture,
  m: Mount,
  w: number,
  h: number,
  up: V3 = [0, 1, 0],
  lift = 0.006,
) {
  const [x, y, z] = m.at;
  return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
    bone: m.bone,
    at: [x + m.n[0] * lift, y + m.n[1] * lift, z + m.n[2] * lift],
    dir: m.n,
    up,
    axis: "z",
    texture,
  });
}

/** A glowing drawing on a flat face: a screen in a bezel. */
export function screen(b: Builder, texture: THREE.Texture, m: Mount, w: number, h: number, up: V3 = [0, 1, 0]) {
  const [x, y, z] = m.at;
  b.part(box(w + 0.04, h + 0.04, 0.02), "#111214", {
    bone: m.bone,
    at: [x + m.n[0] * 0.01, y + m.n[1] * 0.01, z + m.n[2] * 0.01],
    dir: m.n,
    up,
    axis: "z",
  }); // bezel
  return glow(decal(b, texture, m, w, h, up, 0.024), 1.4);
}

// ---------------------------------------------------------------- picks, roles and dress

export type Picks = {
  palette?: keyof typeof palettes;
  body?: keyof typeof bodyPaints;
  trim?: keyof typeof trimPaints;
  neon?: keyof typeof neons;
  decal?: keyof typeof decals | "all";
  screen?: keyof typeof screens;
};

export function roles(p: Picks): Roles {
  const k = palettes[p.palette ?? "nightOps"];
  return { ...k, body: bodyPaints[p.body ?? "flat"](k), trim: trimPaints[p.trim ?? "flat"](k) };
}

export function dress(b: Builder, a: Anchors, _c: Roles, p: Picks) {
  const k = palettes[p.palette ?? "nightOps"];
  if (p.neon) neons[p.neon](b, a, k);
  const d = p.decal;
  if (d === "unitNumber" || d === "all")
    for (const side of ["L", "R"] as const)
      decal(b, decals.unitNumber(), { ...a[`bedSide${side}`], at: [a[`bedSide${side}`].at[0], 1.12, -1.0] }, 0.36, 0.2);
  if (d === "warning" || d === "all")
    decal(b, decals.warning(), { ...a.tailgate, at: [0.55, 1.1, a.tailgate.at[2] - 0.03] }, 0.24, 0.24);
  if (d === "brand" || d === "all")
    decal(b, decals.brand(), { ...a.tailgate, at: [-0.5, 1.1, a.tailgate.at[2] - 0.03] }, 0.3, 0.3);
  if (p.screen)
    screen(
      b,
      screens[p.screen](),
      { ...a.cabRear, at: [0.45, a.cabRear.at[1] - 0.05, a.cabRear.at[2] - 0.01] },
      0.4,
      0.25,
    );
}

// ---------------------------------------------------------------- board

export const meta = {
  name: "Materials 2077 catalog",
  description: "Palettes, body and trim paints, neon, decals and screens on a board.",
};

export default function build() {
  const b = createBuilder({ name: "materialsBoard" });
  const root = b.joint("board", { at: [0, 0, 0] });
  // Decals and screens on upright plates, in front.
  row(b, root, 0, Object.keys(decals), {
    y: 0.5,
    pitch: 1.6,
    front: 0.5,
    n: [0, 0, 1],
    x0: -3.4,
    prefix: "decal",
  }).forEach((m, i) => {
    b.part(box(0.9, 0.9, 0.05), palettes.nightOps.body, { bone: m.bone, at: [m.at[0], m.at[1], m.at[2] - 0.03] });
    decal(b, Object.values(decals)[i](), m, i === 0 ? 0.7 : 0.6, i === 0 ? 0.4 : 0.6);
  });
  row(b, root, 0, Object.keys(screens), {
    y: 0.5,
    pitch: 1.6,
    front: 0.5,
    n: [0, 0, 1],
    x0: 2.6,
    prefix: "screen",
  }).forEach((m, i) => {
    b.part(box(0.9, 0.9, 0.05), palettes.nightOps.dark, { bone: m.bone, at: [m.at[0], m.at[1], m.at[2] - 0.03] });
    screen(b, Object.values(screens)[i](), m, 0.72, 0.45);
  });
  // Trim paints on a bumper-sized bar; body paints on a box with a drum (faces that look up, sideways and round),
  // once in nightOps and once in arctic so the patterns read on a dark and a light body.
  row(b, root, -3, Object.keys(trimPaints), { y: 0, pitch: 1.7, front: 0.6, prefix: "trim" }).forEach((m, i) => {
    b.part(box(1.2, 0.3, 0.24), Object.values(trimPaints)[i](palettes.nightOps), {
      bone: m.bone,
      at: [m.at[0], 0.15, m.at[2]],
    });
  });
  for (const [z, name, k] of [
    [-6, "body", palettes.nightOps],
    [-9.5, "arcticBody", palettes.arctic],
  ] as const)
    row(b, root, z, Object.keys(bodyPaints), { y: 0, pitch: 1.7, front: 0.6, prefix: name }).forEach((m, i) => {
      const fill = Object.values(bodyPaints)[i](k);
      b.part(box(1.0, 0.7, 0.6), fill, { bone: m.bone, at: [m.at[0], 0.35, m.at[2]] });
      b.part(cyl(0.28, 0.5, 12), fill, { bone: m.bone, at: [m.at[0], 0.95, m.at[2]], flat: true });
    });
  // Palettes: a stack of the nine role colours plus the two neon colours, per palette.
  row(b, root, -13, Object.keys(palettes), { y: 0, pitch: 1.7, front: 0.5, prefix: "palette" }).forEach((m, i) => {
    const pal = Object.values(palettes)[i];
    (["body", "trim", "glass", "light", "tyre", "rim", "steel", "dark", "weapon"] as const).forEach((role, j) =>
      b.part(box(1.0, 0.12, 0.3), pal[role], { bone: m.bone, at: [m.at[0], 0.06 + j * 0.13, m.at[2]] }),
    );
    glow(b.part(box(1.0, 0.1, 0.1), pal.neon, { bone: m.bone, at: [m.at[0], 1.28, m.at[2] + 0.1] }), 1.6);
    glow(b.part(box(1.0, 0.1, 0.1), pal.neon2, { bone: m.bone, at: [m.at[0], 1.28, m.at[2] - 0.1] }), 1.6);
  });
  return b.root;
}

/** The four neon layouts on stand-in masses the size of the base truck's cab, hood, bed and rails, with its wheels. */
export function boardNeon() {
  const b = createBuilder({ name: "materialsNeon" });
  const root = b.joint("board", { at: [0, 0, 0] });
  const k = palettes.nightOps;
  Object.keys(neons).forEach((key, i) => {
    const [m] = row(b, root, -(i >> 1) * 9, [key], {
      y: 0,
      x0: i & 1 ? 3.2 : -3.2,
      pitch: 5,
      front: 3.6,
      prefix: "neon",
    });
    const [sx, , sz] = m.at;
    b.part(box(1.9, 1.23, 1.5), k.body, { bone: m.bone, at: [sx, 1.335, sz + 0.5] }); // cab
    b.part(box(1.6, 0.64, 1.25), k.body, { bone: m.bone, at: [sx, 1.04, sz + 1.875] }); // hood
    b.part(box(1.95, 0.6, 2.2), k.body, { bone: m.bone, at: [sx, 1.1, sz - 1.45] }); // bed
    for (const s of [1, -1]) b.part(box(0.1, 0.16, 4.9), k.dark, { bone: m.bone, at: [sx + s * 0.5, 0.58, sz] }); // rails
    const chassis = b.joint(`chassis_${i}`, { parent: m.bone, at: [sx, 0.6, sz] });
    const a = { chassis } as Anchors;
    for (const key of ["wheelFL", "wheelFR", "wheelRL", "wheelRR"] as const) {
      const s = key.endsWith("L") ? 1 : -1;
      a[key] = {
        bone: chassis,
        at: [sx + s * 0.86, 0.42, key[5] === "F" ? sz + 1.55 : sz - 1.55],
        s,
        n: [s, 0, 0],
        root: chassis,
        tag: "",
      };
      b.part(cyl(0.42, 0.3, 12), k.tyre, { bone: chassis, at: a[key].at, rotation: [0, 0, 90], flat: true });
    }
    Object.values(neons)[i](b, a, k);
    b.pose(m.bone, { axis: [0, 1, 0], deg: -50 }); // show the flank
  });
  return b.root;
}
