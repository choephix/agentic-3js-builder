// Bush seaplane on floats, Genshin Impact style: a Mondstadt-bright high-wing bush plane with a cel-shaded teal and
// cream livery, ornate gold trim and filigree, a wind-crest emblem, tassel charms and glowing anemo crystals.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Builder, OutlinePoint } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { aim } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Path } from "../src/path";
import { paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Windwing Bush Seaplane",
  description:
    "A high-wing bush seaplane on twin floats in a Genshin-style teal and cream livery with gold filigree, a wind-crest emblem, tassel charms, glowing anemo crystals and hinged doors, flaps, ailerons, rudder, elevators, water rudders and propeller.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
const SIDES = [1, -1] as const;

// ---------------------------------------------------------------- palette
const TEAL = cel("#2fd0c0");
const DEEP = cel("#1f8fae");
const NAVY = cel("#34478a", "#232c63");
const CREAM = cel("#fff2d4", "#f7dcc4");
const GOLD = cel("#ffc93f", "#d98a22");
const BRASS = cel("#e5a43a", "#b06c1c");
const STEEL = cel("#a9b8dc", "#6c71a8");
const DARK = cel("#3c3260", "#241c3f");
const CORAL = cel("#ff7b67", "#d9494f");
const ROPE = cel("#ead29a", "#c49a5c");
const WOOD = cel("#cf9156", "#9c5d3b");
const SEAM = cel("#d9b98c", "#b8946a");
const SEAM_T = cel("#23b8ab", "#1b8a96");
const ANEMO = "#74f7e0";
const RED_LIGHT = "#ff4d5e";
const GREEN_LIGHT = "#4dff9a";
const WHITE_LIGHT = "#fffbe8";
const AMBER_LIGHT = "#ffe27a";

// ---------------------------------------------------------------- drawings
const GOLD_HEX = "#ffc93f";

function windowSvg(w: number, h: number, kind: "pilot" | "pass" | "cargo" | "small") {
  const f = 5;
  const sl = kind === "pilot" ? 40 : kind === "small" ? 14 : 0;
  const shape = `M${f},${h - f} L${f},${sl + 24} Q${f},${f} ${f + 26 + sl},${f} L${w - f - 14},${f} Q${w - f},${f} ${w - f},${f + 14} L${w - f},${h - f} Z`;
  const cx = w / 2;
  const cy = h / 2;
  const inner = `translate(${cx} ${cy}) scale(0.82) translate(${-cx} ${-cy})`;
  const head = h * 0.2;
  let who = "";
  if (kind === "pilot") {
    who = `
      <rect x="${w * 0.2}" y="${h * 0.3}" width="${w * 0.5}" height="${h * 0.8}" rx="12" fill="#4a3b73"/>
      <ellipse cx="${w * 0.45}" cy="${h * 0.98}" rx="${w * 0.24}" ry="${h * 0.3}" fill="#34478a"/>
      <rect x="${w * 0.36}" y="${h * 0.64}" width="${w * 0.18}" height="${h * 0.12}" fill="#ff7b67"/>
      <circle cx="${w * 0.45}" cy="${h * 0.54}" r="${head}" fill="#f2c29b"/>
      <path d="M${w * 0.45 - head - 3},${h * 0.52} Q${w * 0.45},${h * 0.2} ${w * 0.45 + head + 3},${h * 0.52} Z" fill="#2fd0c0" stroke="${INK}" stroke-width="3"/>
      <rect x="${w * 0.45 - head - 5}" y="${h * 0.47}" width="${head * 2 + 10}" height="7" rx="3" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="2"/>
      <circle cx="${w * 0.45 - 9}" cy="${h * 0.37}" r="9" fill="#9be8ff" stroke="${GOLD_HEX}" stroke-width="5"/>
      <circle cx="${w * 0.45 + 9}" cy="${h * 0.37}" r="9" fill="#9be8ff" stroke="${GOLD_HEX}" stroke-width="5"/>`;
  } else if (kind === "pass") {
    who = `
      <rect x="${w * 0.25}" y="${h * 0.35}" width="${w * 0.5}" height="${h * 0.8}" rx="12" fill="#4a3b73"/>
      <ellipse cx="${w * 0.5}" cy="${h * 1.0}" rx="${w * 0.22}" ry="${h * 0.28}" fill="#ff7b67"/>
      <circle cx="${w * 0.5}" cy="${h * 0.58}" r="${head * 0.9}" fill="#f2c29b"/>
      <path d="M${w * 0.5 - head},${h * 0.6} Q${w * 0.5 - head},${h * 0.3} ${w * 0.5},${h * 0.3} Q${w * 0.5 + head},${h * 0.3} ${w * 0.5 + head},${h * 0.6} Q${w * 0.5},${h * 0.5} ${w * 0.5 - head},${h * 0.6} Z" fill="#f4a43a" stroke="${INK}" stroke-width="3"/>`;
  } else if (kind === "cargo") {
    who = `
      <rect x="${w * 0.12}" y="${h * 0.55}" width="${w * 0.36}" height="${h * 0.5}" fill="#cf9156" stroke="${INK}" stroke-width="3"/>
      <rect x="${w * 0.12}" y="${h * 0.55}" width="${w * 0.36}" height="8" fill="${GOLD_HEX}"/>
      <rect x="${w * 0.5}" y="${h * 0.4}" width="${w * 0.34}" height="${h * 0.7}" fill="#34478a" stroke="${INK}" stroke-width="3"/>
      <path d="M${w * 0.5},${h * 0.4} L${w * 0.84},${h * 0.4} L${w * 0.67},${h * 0.62} Z" fill="#ff7b67"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fbff"/><stop offset="1" stop-color="#73ccee"/></linearGradient>
      <clipPath id="c"><path d="${shape}" transform="${inner}"/></clipPath>
    </defs>
    <path d="${shape}" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="${shape}" transform="${inner}" fill="url(#sky)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <g clip-path="url(#c)">
      <ellipse cx="${w * 0.2}" cy="${h * 0.9}" rx="${w * 0.2}" ry="${h * 0.13}" fill="#ffffff"/>
      <ellipse cx="${w * 0.78}" cy="${h * 0.95}" rx="${w * 0.26}" ry="${h * 0.16}" fill="#ffffff"/>
      ${who}
      <path d="M${w * 0.62},0 L${w * 0.74},0 L${w * 0.34},${h} L${w * 0.22},${h} Z" fill="#f4feff"/>
      <path d="M${w * 0.8},0 L${w * 0.86},0 L${w * 0.46},${h} L${w * 0.4},${h} Z" fill="#f4feff"/>
    </g>
  </svg>`;
}

const WIN_PILOT = svg(windowSvg(150, 140, "pilot"), { size: 300 });
const WIN_PASS = svg(windowSvg(130, 130, "pass"), { size: 260 });
const WIN_CARGO = svg(windowSvg(130, 112, "cargo"), { size: 260 });
const WIN_SMALL = svg(windowSvg(110, 110, "small"), { size: 220 });

const WINDSHIELD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 190">
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fbff"/><stop offset="1" stop-color="#6fc9ec"/></linearGradient>
      <clipPath id="c"><path d="M30,176 L66,24 Q70,14 82,14 L318,14 Q330,14 334,24 L370,176 Z"/></clipPath>
    </defs>
    <path d="M10,184 L50,14 Q54,4 66,4 L334,4 Q346,4 350,14 L390,184 Z" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M30,176 L66,24 Q70,14 82,14 L318,14 Q330,14 334,24 L370,176 Z" fill="url(#s)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <g clip-path="url(#c)">
      <ellipse cx="90" cy="165" rx="80" ry="22" fill="#ffffff"/>
      <ellipse cx="300" cy="172" rx="100" ry="26" fill="#ffffff"/>
      <path d="M120,0 L160,0 L110,190 L70,190 Z" fill="#f4feff"/>
      <path d="M185,0 L200,0 L150,190 L135,190 Z" fill="#f4feff"/>
      <path d="M270,0 L300,0 L250,190 L220,190 Z" fill="#f4feff"/>
    </g>
    <path d="M193,14 L207,14 L207,176 L193,176 Z" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="4"/>
    <circle cx="200" cy="95" r="11" fill="#2fd0c0" stroke="${INK}" stroke-width="4"/>
  </svg>`,
  { size: 400 },
);

// A wind crest: four pinwheel feathers in a gold ring.
const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="94" fill="#fff2d4" stroke="${INK}" stroke-width="6"/>
    <circle cx="100" cy="100" r="84" fill="#2fd0c0" stroke="${GOLD_HEX}" stroke-width="10"/>
    <circle cx="100" cy="100" r="72" fill="none" stroke="${INK}" stroke-width="3"/>
    <g id="f" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M100,100 C100,60 112,34 146,30 C150,64 134,92 100,100 Z" fill="#fff2d4"/>
      <path d="M100,100 C108,72 120,54 146,30" fill="none" stroke="${GOLD_HEX}" stroke-width="5"/>
    </g>
    <use href="#f" transform="rotate(90 100 100)"/>
    <use href="#f" transform="rotate(180 100 100)"/>
    <use href="#f" transform="rotate(270 100 100)"/>
    <circle cx="100" cy="100" r="13" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="4"/>
  </svg>`,
  { size: 512 },
);

// Gold scroll band, a run of mirrored curls on a centre line.
function filigreeSvg(units: number) {
  const unit = (x: number) => `
    <g transform="translate(${x} 0)">
      <path d="M0,24 C12,24 16,6 34,6 C48,6 52,20 43,23 C36,25 33,17 39,14"/>
      <path d="M80,24 C68,24 64,42 46,42 C32,42 28,28 37,25 C44,23 47,31 41,34"/>
      <circle cx="40" cy="24" r="3" fill="${GOLD_HEX}"/>
    </g>`;
  let body = "";
  for (let i = 0; i < units; i++) body += unit(i * 80);
  const w = units * 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 48">
    <g fill="none" stroke="${GOLD_HEX}" stroke-width="4" stroke-linecap="round">
      <path d="M0,24 L${w},24" stroke-width="3"/>${body}
    </g></svg>`;
}
const FILIGREE = svg(filigreeSvg(6), { size: 1440 });

const RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 64">
    <g fill="none" stroke="${ANEMO}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="5" fill="${ANEMO}"/>
      <path d="M92,50 C84,22 110,10 124,24 C132,34 118,42 112,34"/>
      <path d="M170,50 L190,12 L210,50 M178,36 L202,36"/>
      <path d="M250,18 C282,8 292,40 266,52 C246,58 238,38 258,34"/>
      <circle cx="336" cy="32" r="18"/><path d="M336,14 L336,50 M318,32 L354,32"/>
      <path d="M394,50 C386,22 412,10 426,24 C434,34 420,42 414,34"/>
      <path d="M446,14 L466,50 M466,14 L446,50"/>
    </g></svg>`,
  { size: 960 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 180">
    <path d="M30,0 L30,34" stroke="${INK}" stroke-width="5"/>
    <circle cx="30" cy="36" r="14" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="4"/>
    <path d="M20,56 L40,56 L44,70 L16,70 Z" fill="#ff7b67" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
      <path d="M16,70 L21,176 L27,70 Z" fill="#2fd0c0"/>
      <path d="M27,70 L32,180 L37,70 Z" fill="#fff2d4"/>
      <path d="M37,70 L43,176 L44,70 Z" fill="#2fd0c0"/>
      <path d="M22,70 L24,160 L28,70 Z" fill="#ffc93f"/>
    </g>
    <rect x="14" y="94" width="32" height="8" rx="3" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

// A swept gold wing of three feathers for the cowl flanks (front at the drawing's left).
const WINGMARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M8,62 C60,50 130,50 192,70 C140,66 80,70 8,62 Z" fill="#fff2d4"/>
      <path d="M8,56 C60,32 130,28 188,44 C136,46 80,56 8,56 Z" fill="${GOLD_HEX}"/>
      <path d="M8,50 C50,14 120,6 176,16 C126,24 76,40 8,50 Z" fill="#fff2d4"/>
    </g>
    <circle cx="14" cy="57" r="9" fill="${GOLD_HEX}" stroke="${INK}" stroke-width="4"/>
  </svg>`,
  { size: 400 },
);

const REG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
    <text x="100" y="46" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-style="italic" font-size="46" fill="#fff2d4" stroke="${INK}" stroke-width="3" paint-order="stroke">WZ-17</text>
  </svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------- merge helper
class Batch {
  private geos: THREE.BufferGeometry[] = [];

  put(geo: THREE.BufferGeometry, at: P3, dir?: P3, scale?: P3, spinDeg = 0) {
    let q = dir ? aim(dir) : new THREE.Quaternion();
    if (spinDeg) q = q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (spinDeg * Math.PI) / 180));
    geo.applyMatrix4(
      new THREE.Matrix4().compose(new THREE.Vector3(...at), q, new THREE.Vector3(...(scale ?? [1, 1, 1]))),
    );
    this.geos.push(geo);
    return this;
  }

  flush(b: Builder, color: Paint | string, bone: Joint, name: string) {
    if (!this.geos.length) return null;
    const merged = mergeGeometries(this.geos, false);
    if (!merged) throw new Error(`batch ${name} failed to merge`);
    return b.part(merged, color, { bone, at: [0, 0, 0], name });
  }
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);
const ball = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);

function studs(path: Path, count: number, r: number, offsetY = 0) {
  const batch = new Batch();
  for (let i = 0; i < count; i++) {
    const p = path.at(count === 1 ? 0.5 : i / (count - 1));
    batch.put(ball(r, 4, 3), [p.x, p.y + offsetY, p.z]);
  }
  return batch;
}

function need<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`no hit for ${what}`);
  return v;
}

// ---------------------------------------------------------------- shape helpers
const WING_Y = 3.27;
const WING_Z = 0.45;
const SPAN = 7.3;
const hc = (ax: number) => 0.86 - 0.24 * Math.min(1, ax / SPAN);
const WAVE_Z = 0.42;

function waveLine(z: number) {
  const base = z > -2 ? 2.3 : 2.3 + (-2 - z) * 0.08;
  return base + 0.06 * zigzag(z / WAVE_Z);
}

function hullColor(p: THREE.Vector3): Paint {
  const d = p.y - waveLine(p.z);
  const seam = Math.abs((((p.z + 3.3) % 1.1) + 1.1) % 1.1 - 0.55) > 0.536;
  if (p.y < 1.78 && p.z > -2.3) return DEEP;
  if (d > 0.1) return seam ? SEAM_T : TEAL;
  if (d > 0.02) return GOLD;
  if (d > 0.0) return DARK;
  return seam ? SEAM : CREAM;
}
const hullPaint = paint((p) => hullColor(p));

function wingColor(p: THREE.Vector3, n: THREE.Vector3): Paint {
  const ax = Math.abs(p.x);
  const top = n.y > -0.2;
  const edge = 6.1 + 0.1 * zigzag(p.z / 0.26);
  if (ax > edge) return GOLD;
  if (ax > edge - 0.22) return top ? CREAM : DEEP;
  const rib = Math.abs(((ax + 0.25) % 0.8) - 0.4) > 0.388;
  const hinge = p.z - (-0.1 + 0.07 * zigzag(ax / 0.3));
  const ctrl = hinge < 0;
  if (!top) return rib ? DEEP : ctrl ? TEAL : CREAM;
  if (ax > 0.1 && ax < 1.15 && p.z > 0.05 && p.z < 0.95) {
    const e = Math.min(p.z - 0.05, 0.95 - p.z, 1.15 - ax, ax - 0.1);
    return e < 0.03 ? NAVY : Math.floor(ax / 0.12) % 2 === 0 ? CREAM : DEEP;
  }
  if (hinge < 0.035 && hinge > -0.0) return GOLD;
  if (ax > 1.25 && ax < 5.85 && Math.abs(p.z - (0.78 + 0.035 * zigzag(ax / 0.22))) < 0.016) return GOLD;
  if (ctrl) return rib ? DEEP : CREAM;
  if (p.z > WING_Z + hc(ax) - 0.2) return DEEP;
  return rib ? DEEP : TEAL;
}
const wingPaint = paint((p, n) => wingColor(p, n));
// tailplane teal, elevators cream behind a gold zig-zag hinge line
const tailPaint = paint((p) => {
  const d = p.z + 4.45 - 0.07 * zigzag(Math.abs(p.x) / 0.3);
  return d > 0.035 ? TEAL : d > 0 ? GOLD : CREAM;
});

function floatColor(p: THREE.Vector3, n: THREE.Vector3): Paint {
  const wave = 0.5 + 0.035 * zigzag(p.z / 0.4);
  if (n.y > 0.7) return Math.abs(Math.abs(p.x) - 1.45) < 0.03 ? CREAM : TEAL;
  if (p.y > wave + 0.08) return TEAL;
  if (p.y > wave) return GOLD;
  if (p.y > 0.14) return CREAM;
  return DEEP;
}
const floatPaint = paint((p, n) => floatColor(p, n));

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "bushSeaplane", paintSize: 2048 });

  // ------------------------------------------------------------ skeleton
  const hull = b.joint("hull", { at: [0, 2.35, 0], role: "spine" });
  const prop = b.joint("prop", { parent: hull, at: [0, 2.2, 3.92], dir: [0, 0, 1], role: "hinge" });

  // ------------------------------------------------------------ fuselage
  const fus = b.loft(
    [
      { at: [0, 2.2, 3.4], w: 1.1, h: 1.12 },
      { at: [0, 2.27, 2.95], w: 1.32, h: 1.42 },
      { at: [0, 2.31, 2.35], w: 1.5, h: 1.68 },
      { at: [0, 2.34, 1.5], w: 1.56, h: 1.76 },
      { at: [0, 2.35, 0.3], w: 1.56, h: 1.78 },
      { at: [0, 2.37, -0.9], w: 1.5, h: 1.72 },
      { at: [0, 2.43, -2.0], w: 1.28, h: 1.5 },
      { at: [0, 2.54, -3.0], w: 0.92, h: 1.18 },
      { at: [0, 2.66, -3.9], w: 0.55, h: 0.8 },
      { at: [0, 2.76, -4.5], w: 0.3, h: 0.58 },
      { at: [0, 2.84, -4.92], w: 0.14, h: 0.38 },
    ],
    { sides: 16, color: hullPaint, bone: hull, name: "fuselage" },
  );
  const hullSkin = b.surface(fus);

  // gold trim lines down the fuselage and rivets
  for (const s of SIDES) {
    const rail = fus.line(s * 36, 0.006).slice(0.14, 0.72);
    b.sweep(rail, 0.012, { color: GOLD, bone: hull, caps: "none", sides: 4 });
    studs(fus.line(s * 124, 0.004).slice(0.12, 0.7), 40, 0.012).flush(b, "#e5a43a", hull, `rivets${s > 0 ? "L" : "R"}`);
  }
  // belly keel strip
  b.sweep(fus.line(180, 0.01).slice(0.08, 0.85), 0.03, { color: STEEL, bone: hull, caps: "none", sides: 6 });

  // windshield on the sloping nose of the cabin
  const wsHit = need(hullSkin.ray([0, 4, 2.22], [0, -1, 0]), "windshield");
  b.decal(hullSkin, WINDSHIELD, { at: wsHit, dir: wsHit.n, size: [1.2, 0.62], bone: hull, name: "windshield" });
  // gold windshield brow and wiper arms
  b.sweep(polyline([[-0.58, 3.02, 2.44], [0, 3.1, 2.38], [0.58, 3.02, 2.44]]), 0.018, {
    color: GOLD,
    bone: hull,
    sides: 5,
    caps: "round",
  });
  for (const s of SIDES) {
    b.rod([s * 0.1, 2.88, 2.46], [s * 0.42, 2.98, 2.32], 0.007, { color: STEEL, bone: hull, sides: 4 });
  }

  // rear details: emblem roundels, registration, filigree bands
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    const rh = need(hullSkin.ray([s * 3, 2.75, -1.55], [-s, 0, 0]), "roundel");
    b.decal(hullSkin, EMBLEM, { at: rh, dir: [s, 0, 0], size: [0.66, 0.66], bone: hull, name: `roundel${sideTag}` });
    const fh = need(hullSkin.ray([s * 3, 2.1, -2.7], [-s, 0, 0]), "filigree");
    b.decal(hullSkin, FILIGREE, {
      at: fh,
      dir: [s, 0, 0],
      size: [1.7, 0.2],
      bone: hull,
      name: `filigree${sideTag}`,
    });
    const gh = need(hullSkin.ray([s * 3, 2.72, -3.0], [-s, 0, 0]), "reg");
    b.decal(hullSkin, REG, { at: gh, dir: [s, 0, 0], size: [0.85, 0.26], bone: hull, name: `reg${sideTag}` });
  }

  // ------------------------------------------------------------ doors (hinged, conforming to the hull)
  type DoorSpec = { name: string; z0: number; z1: number; hingeZ: number; win: typeof WIN_PILOT; ws: [number, number]; handle: number };
  const doorSpecs: DoorSpec[] = [
    { name: "door", z0: 2.1, z1: 1.12, hingeZ: 2.1, win: WIN_PILOT, ws: [0.74, 0.69], handle: 1.25 },
    { name: "cargoDoorF", z0: 0.45, z1: -0.36, hingeZ: 0.45, win: WIN_CARGO, ws: [0.6, 0.52], handle: -0.25 },
    { name: "cargoDoorR", z0: -0.36, z1: -1.17, hingeZ: -1.17, win: WIN_PASS, ws: [0.58, 0.58], handle: -0.28 },
  ];
  const doorAngles = [38, 54, 70, 86, 102, 118];
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    const doorLines = doorAngles.map((a) => fus.line(s * a, -0.005));
    for (const d of doorSpecs) {
      const hinge = b.joint(`${d.name}${sideTag}`, { parent: hull, at: [s * 0.72, 2.4, d.hingeZ], dir: [0, 1, 0], role: "hinge" });
      const probe = (l: Path, z: number) => {
        const t = l.closestT([l.at(0.5).x, l.at(0.5).y, z]);
        return t;
      };
      const yTop = doorLines[0].at(probe(doorLines[0], d.z0)).y;
      const yBot = doorLines[doorLines.length - 1].at(probe(doorLines[doorLines.length - 1], d.z0)).y;
      const doorPaint = paint((p) => {
        const edge = Math.min(p.z - d.z1, d.z0 - p.z, yTop - p.y, p.y - yBot);
        return edge < 0.03 ? INK : hullColor(p);
      });
      const strips: THREE.Mesh[] = [];
      for (let k = 0; k < doorLines.length - 1; k++) {
        const la = doorLines[k];
        const lb = doorLines[k + 1];
        strips.push(
          ...b.membrane(la.slice(probe(la, d.z0), probe(la, d.z1)), lb.slice(probe(lb, d.z0), probe(lb, d.z1)), {
            color: doorPaint,
            thickness: 0.045,
            rows: 1,
            bone: hinge,
            name: `${d.name}${sideTag}Panel${k}`,
          }),
        );
      }
      const ds = b.surface(strips);
      const zc = (d.z0 + d.z1) / 2;
      b.decal(ds, d.win, { at: [s * 0.78, 2.62, zc], dir: [s, 0, 0], size: d.ws, mirror: s < 0, bone: hinge, name: `${d.name}${sideTag}Window` });
      const hh = ds.nearest([s * 0.8, 2.3, d.handle]);
      b.stick(box(0.03, 0.03, 0.2), BRASS, hh, { embed: 0.2, bone: hinge, name: `${d.name}${sideTag}Handle` });
      const hh2 = ds.nearest([s * 0.8, 2.3, d.handle + 0.08]);
      b.stick(ball(0.03, 6, 4), GOLD, hh2, { embed: 0.3, bone: hinge });
      // hinge straps on the hull
      const hs = need(hullSkin.ray([s * 2, 2.65, d.hingeZ], [-s, 0, 0]), "strap");
      b.stick(box(0.03, 0.34, 0.05), STEEL, hs, { embed: 0.2, bone: hull });
      const hs2 = need(hullSkin.ray([s * 2, 2.1, d.hingeZ], [-s, 0, 0]), "strap2");
      b.stick(box(0.03, 0.24, 0.05), STEEL, hs2, { embed: 0.2, bone: hull });
    }
    // fixed windows between and behind the doors
    b.decal(hullSkin, WIN_SMALL, { at: [s * 0.78, 2.65, 0.78], dir: [s, 0, 0], size: [0.5, 0.5], mirror: s < 0, bone: hull, name: `windowMid${sideTag}` });
    b.decal(hullSkin, WIN_SMALL, { at: [s * 0.7, 2.62, -1.6], dir: [s, 0, 0], size: [0.46, 0.46], mirror: s < 0, bone: hull, name: `windowRear${sideTag}` });
  }

  // ------------------------------------------------------------ engine cowl
  const CZ = 3.0;
  const CY = 2.2;
  const cowlPaint = paint((p) => {
    const rx = Math.hypot(p.x, p.y - CY);
    if (p.z > 3.55 && rx < 0.5) return DARK;
    if (p.z > 3.78) return GOLD;
    const ang = Math.atan2(p.y - CY, p.x) / (Math.PI * 2);
    const band = 3.46 + 0.05 * zigzag(ang * 28);
    if (Math.abs(p.z - 3.4) < 0.025) return GOLD;
    if (p.z > band) return CREAM;
    if (p.z < 3.14 && Math.abs(((ang * 36) % 1) - 0.5) < 0.1) return DEEP;
    return TEAL;
  });
  const cowl = b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.66, 0.1],
      [0.69, 0.4],
      [0.66, 0.72],
      [0.6, 0.82],
      [0.57, 0.86],
      [0.5, 0.86],
      [0.5, 0.62],
      [0, 0.62],
    ],
    { at: [0, CY, CZ], axis: [0, 0, 1], segments: 20, color: cowlPaint, bone: hull, name: "cowl" },
  );
  const cowlSkin = b.surface(cowl);
  for (const s of SIDES) {
    const wh = need(cowlSkin.ray([s * 2, CY + 0.14, 3.62], [-s, 0, 0]), "wingmark");
    b.decal(cowlSkin, WINGMARK, { at: wh, dir: [s, 0, 0], size: [0.42, 0.21], mirror: s < 0, bone: hull, name: `cowlWing${s > 0 ? "L" : "R"}` });
  }
  // radial engine in the recess: nine finned cylinders and a hub
  const cylB = new Batch();
  const capB = new Batch();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    cylB.put(cyl(0.06, 0.07, 0.2, 6), [dx * 0.31, CY + dy * 0.31, CZ + 0.7], [dx, dy, 0]);
    capB.put(cyl(0.075, 0.075, 0.03, 6), [dx * 0.43, CY + dy * 0.43, CZ + 0.7], [dx, dy, 0]);
  }
  cylB.put(cyl(0.16, 0.16, 0.16, 10), [0, CY, CZ + 0.7], [0, 0, 1]);
  cylB.flush(b, STEEL, hull, "engineCylinders");
  capB.flush(b, GOLD, hull, "rockerCaps");
  // gold crown petals round the cowl lip, cooling gills at the shoulder, exhaust ports
  const petals = new Batch();
  const gills = new Batch();
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    petals.put(new THREE.ConeGeometry(0.035, 0.12, 4), [Math.cos(a) * 0.545, CY + Math.sin(a) * 0.545, CZ + 0.9], [0, 0, 1]);
    gills.put(box(0.17, 0.022, 0.16), [Math.cos(a) * 0.68, CY + Math.sin(a) * 0.68, CZ + 0.2], [Math.cos(a), Math.sin(a), 0], undefined, 0);
  }
  petals.flush(b, GOLD, hull, "crownPetals");
  gills.flush(b, DARK, hull, "coolingGills");

  // anemo gems on the cowl flanks
  for (const s of SIDES) {
    b.part(cyl(0.11, 0.12, 0.03, 8), GOLD, { bone: hull, at: [s * 0.69, CY - 0.17, 3.62], dir: [s, 0, 0], name: `gemSocket${s > 0 ? "L" : "R"}` });
    glow(
      b.part(new THREE.OctahedronGeometry(0.075), ANEMO, {
        bone: hull,
        at: [s * 0.72, CY - 0.17, 3.62],
        scale: [0.8, 1.5, 0.8],
        flat: true,
        name: `anemoGem${s > 0 ? "L" : "R"}`,
      }),
      1.6,
    );
    // exhaust collector
    b.sweep(catmull([[s * 0.62, 1.78, 3.4], [s * 0.68, 1.82, 3.0], [s * 0.72, 1.86, 2.5]]), [0.055, 0.045], {
      color: STEEL,
      bone: hull,
      sides: 6,
      caps: { start: "flat", end: "flat" },
    });
    b.part(cyl(0.065, 0.045, 0.1, 6), DARK, { bone: hull, at: [s * 0.72, 1.86, 2.46], dir: [0, 0, -1], name: `exhaustTip${s > 0 ? "L" : "R"}` });
    const stubs = new Batch();
    for (let i = 0; i < 4; i++) {
      const a = Math.PI * (1.15 + 0.12 * i);
      const dx = Math.cos(a) * s * -1;
      stubs.put(cyl(0.035, 0.045, 0.12, 6), [dx * 0.66, CY + Math.sin(a) * 0.62, 3.2 + 0.12 * (i % 2)], [dx, Math.sin(a) * 1.1, 0]);
    }
    stubs.flush(b, STEEL, hull, `exhaustStubs${s > 0 ? "L" : "R"}`);
  }

  // ------------------------------------------------------------ propeller
  const spinnerPaint = paint((p, _n, c) => {
    const h = c[0];
    if (h > 0.03 && h < 0.08) return GOLD;
    const ang = Math.atan2(p.y - CY, p.x) * (180 / Math.PI);
    if ((((ang - 380 * h) % 90) + 90) % 90 < 22) return CREAM;
    return TEAL;
  });
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.215, 0.07],
      [0.18, 0.26],
      [0.1, 0.4],
      [0, 0.47],
    ],
    { at: [0, CY, 3.9], axis: [0, 0, 1], segments: 14, color: spinnerPaint, bone: prop, name: "spinner" },
  );
  b.part(cyl(0.2, 0.2, 0.05, 12), GOLD, { bone: prop, at: [0, CY, 3.92], dir: [0, 0, 1], name: "propHubPlate" });
  // a thin anemo ring that turns with the propeller
  const ringPts: P3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ringPts.push([Math.cos(a) * 0.3, CY + Math.sin(a) * 0.3, 3.98]);
  }
  glow(b.sweep(catmull(ringPts, { closed: true }), 0.012, { color: ANEMO, bone: prop, sides: 4, name: "anemoRing" }), 1.5);
  const BLADE: OutlinePoint[] = [
    [0.1, -0.06],
    [0.4, -0.11],
    [0.85, -0.12],
    [1.25, -0.1],
    [1.42, -0.05],
    [1.44, 0.02],
    [1.38, 0.07],
    [1.0, 0.13],
    [0.55, 0.12],
    [0.12, 0.07],
  ];
  const bladePaint = paint((_p, _n, c) => (c[0] > 1.14 ? GOLD : c[0] < 0.4 ? STEEL : c[0] > 1.1 ? INK : DEEP));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const pitch = (20 * Math.PI) / 180;
    const rx = [Math.cos(a), Math.sin(a), 0] as P3;
    const cy = [-Math.sin(a) * Math.cos(pitch), Math.cos(a) * Math.cos(pitch), Math.sin(pitch)] as P3;
    b.extrude(BLADE, { at: [0, CY, 3.96], x: rx, y: cy, thickness: 0.045, bevel: 0.014, detail: 0.5, smoothing: 1, color: bladePaint, bone: prop, name: `blade${i + 1}` });
  }

  // ------------------------------------------------------------ wing
  const wingPath = catmull([
    [-7.38, 3.6, WING_Z + 0.04],
    [-7.0, 3.38, WING_Z],
    [-6.4, WING_Y, WING_Z],
    [-3.2, WING_Y, WING_Z],
    [0, WING_Y, WING_Z],
    [3.2, WING_Y, WING_Z],
    [6.4, WING_Y, WING_Z],
    [7.0, 3.38, WING_Z],
    [7.38, 3.6, WING_Z + 0.04],
  ]);
  const wing = b.sweep(
    wingPath,
    (t) => {
      const u = Math.abs(t - 0.5) * 2;
      return [0.86 - 0.26 * u, 0.145 - 0.075 * u];
    },
    { sides: 12, color: wingPaint, bone: hull, caps: "flat", up: [0, 1, 0], name: "wing" },
  );
  const wingSkin = b.surface(wing);

  // control surfaces: flaps inboard, ailerons outboard
  const zh = -0.12;
  const teZ = (ax: number) => WING_Z - hc(ax) - 0.04;
  const surfaces = [
    { name: "flap", x0: 0.75, x1: 4.3 },
    { name: "aileron", x0: 4.4, x1: 6.55 },
  ];
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    for (const c of surfaces) {
      const hinge = b.joint(`${c.name}${sideTag}`, { parent: hull, at: [s * (c.x0 + c.x1) / 2, WING_Y, zh], dir: [s, 0, 0], role: "hinge" });
      const len = c.x1 - c.x0;
      const out: OutlinePoint[] = [
        [0, zh],
        [len, zh],
        [len, teZ(c.x1) + 0.05],
        [len - 0.05, teZ(c.x1)],
        [0.05, teZ(c.x0)],
        [0, teZ(c.x0) + 0.05],
      ];
      b.extrude(out, { at: [s * c.x0, WING_Y - 0.01, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: [0.03, 0.13], bevel: 0.01, color: wingPaint, bone: hinge, name: `${c.name}${sideTag}` });
      // hinge fittings
      const fit = new Batch();
      const n = Math.max(3, Math.round(len / 0.9));
      for (let i = 0; i <= n; i++) fit.put(box(0.08, 0.05, 0.1), [s * (c.x0 + (len * i) / n), WING_Y - 0.01, zh + 0.02]);
      fit.flush(b, STEEL, hinge, `${c.name}${sideTag}Hinges`);
      // trim tab line on the aileron trailing edge
      if (c.name === "aileron") {
        b.rod([s * (c.x0 + 0.1), WING_Y + 0.03, teZ(c.x0 + 0.1) + 0.02], [s * (c.x1 - 0.1), WING_Y + 0.03, teZ(c.x1 - 0.1) + 0.02], 0.012, { color: GOLD, bone: hinge, sides: 4 });
      }
    }
  }

  // rib rivets, fuel caps, emblems on the wing top
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    const cap = need(wingSkin.ray([s * 2.2, 5, 0.8], [0, -1, 0]), "fuel cap");
    b.stick(cyl(0.1, 0.1, 0.03, 10), BRASS, cap, { embed: 0.3, bone: hull, name: `fuelCap${sideTag}` });
    b.stick(cyl(0.065, 0.065, 0.04, 8), GOLD, cap.moved([0, 0.01, 0]), { embed: 0.3, bone: hull });
    const em = need(wingSkin.ray([s * 3.55, 5, 0.55], [0, -1, 0]), "emblem");
    b.decal(wingSkin, EMBLEM, { at: em, dir: [0, 1, 0], up: [0, 0, 1], size: [1.05, 1.05], mirror: s > 0, bone: hull, name: `wingEmblem${sideTag}` });
    const fh = need(wingSkin.ray([s * 5.15, 5, 0.52], [0, -1, 0]), "wing filigree");
    b.decal(wingSkin, FILIGREE, { at: fh, dir: [0, 1, 0], up: [s, 0, 0], size: [1.1, 0.14], bone: hull, name: `wingFiligree${sideTag}` });
    // leading-edge rivets
    // wingtip gold finial, nav light
    b.part(ball(0.08, 8, 6), GOLD, { bone: hull, at: [s * 7.4, 3.61, WING_Z + 0.05], name: `wingtipCap${sideTag}` });
    glow(b.part(ball(0.075, 8, 6), s > 0 ? RED_LIGHT : GREEN_LIGHT, { bone: hull, at: [s * 7.46, 3.64, WING_Z + 0.05], name: `navLight${sideTag}` }), 2);
    // landing light in the leading edge
    const ll = need(wingSkin.ray([s * 2.5, WING_Y, 4], [0, 0, -1]), "landing light");
    b.stick(cyl(0.1, 0.1, 0.04, 10), BRASS, ll, { embed: 0.35, bone: hull, name: `landingBezel${sideTag}` });
    glow(b.stick(cyl(0.07, 0.07, 0.04, 10), AMBER_LIGHT, ll.moved([0, 0.012, 0]), { embed: 0.3, bone: hull, name: `landingLight${sideTag}` }), 1.4);
  }
  // pitot tube
  b.rod([-3.0, 3.18, 1.1], [-3.0, 3.18, 1.72], 0.012, { color: STEEL, bone: hull, sides: 5 });
  b.part(ball(0.02), GOLD, { bone: hull, at: [-3.0, 3.18, 1.74] });

  // wing struts and jury struts
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    const sec = () => [0.024, 0.07] as [number, number];
    const bottom: P3 = [s * 0.4, 1.66, 0.95];
    const top: P3 = [s * 4.05, 3.1, 0.7];
    b.sweep(polyline([bottom, top]), sec, { color: STEEL, bone: hull, sides: 8, caps: "flat", name: `wingStrut${sideTag}` });
    const midP: P3 = [s * 2.1, 2.39, 0.85];
    b.sweep(polyline([midP, [s * 2.9, 3.12, 0.28]]), () => [0.018, 0.045] as [number, number], { color: STEEL, bone: hull, sides: 8, caps: "flat", name: `juryStrut${sideTag}` });
    const fit = new Batch();
    fit.put(box(0.1, 0.1, 0.22), [top[0], 3.12, top[2]]);
    fit.put(box(0.16, 0.12, 0.26), [bottom[0], 1.68, bottom[2]]);
    fit.put(box(0.08, 0.08, 0.14), [s * 2.9, 3.14, 0.28]);
    fit.put(box(0.1, 0.1, 0.12), [midP[0], midP[1], midP[2]]);
    fit.flush(b, GOLD, hull, `strutFittings${sideTag}`);
    // gold sleeve bands
    const bands = new Batch();
    for (const t of [0.2, 0.5, 0.8]) {
      bands.put(cyl(0.05, 0.05, 0.05, 8), [bottom[0] + (top[0] - bottom[0]) * t, bottom[1] + (top[1] - bottom[1]) * t, bottom[2] + (top[2] - bottom[2]) * t], [top[0] - bottom[0], top[1] - bottom[1], top[2] - bottom[2]]);
    }
    bands.flush(b, GOLD, hull, `strutBands${sideTag}`);
  }

  // ------------------------------------------------------------ tail
  const fin: OutlinePoint[] = [
    [-2.3, 2.98, "sharp"],
    [-2.75, 3.5],
    [-3.2, 3.95],
    [-3.6, 4.2],
    [-3.95, 4.28],
    [-4.3, 4.28, "sharp"],
    [-4.3, 2.9, "sharp"],
  ];
  const finPart = b.extrude(fin, { at: [0, 0, 0], thickness: 0.11, bevel: 0.025, smoothing: 1, color: TEAL, bone: hull, name: "fin" });
  const rudderJoint = b.joint("rudder", { parent: hull, at: [0, 3.6, -4.3], dir: [0, 1, 0], role: "hinge" });
  const rudderOut: OutlinePoint[] = [
    [-4.3, 4.28, "sharp"],
    [-4.85, 4.25],
    [-5.1, 3.95],
    [-5.12, 3.4],
    [-4.92, 3.07],
    [-4.3, 3.04, "sharp"],
  ];
  const rudderPaint = paint((p) => (p.z < -4.97 || p.z > -4.36 ? GOLD : CREAM));
  const rudder = b.extrude(rudderOut, { at: [0, 0, 0], thickness: [0.09, 0.05], bevel: 0.02, smoothing: 1, color: rudderPaint, bone: rudderJoint, name: "rudder" });
  b.rod([0, 3.12, -4.3], [0, 4.2, -4.3], 0.02, { color: STEEL, bone: rudderJoint, sides: 5 });
  // fin gold leading edge strip, crests on fin and rudder
  b.sweep(polyline([[0, 2.97, -2.27], [0, 3.52, -2.72], [0, 3.97, -3.19], [0, 4.21, -3.59]]), 0.035, { color: GOLD, bone: hull, sides: 6, caps: "round", name: "finLeadingEdge" });
  const finSkin = b.surface(finPart);
  const rudSkin = b.surface(rudder);
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    b.decal(finSkin, EMBLEM, { at: [s * 0.08, 3.5, -3.55], dir: [s, 0, 0], size: [0.62, 0.62], mirror: s < 0, bone: hull, name: `finEmblem${sideTag}` });
    b.decal(rudSkin, FILIGREE, { at: [s * 0.08, 3.95, -4.7], dir: [s, 0, 0], up: [0, 0, -1], roll: 0, size: [0.6, 0.1], bone: rudderJoint, name: `rudderFiligree${sideTag}` });
  }
  const rh = new Batch();
  for (const y of [3.2, 3.65, 4.1]) rh.put(box(0.06, 0.1, 0.1), [0, y, -4.3]);
  rh.flush(b, STEEL, rudderJoint, "rudderHinges");
  // rudder horn balance and trim tab
  b.extrude([[0, 0], [0.22, 0], [0.22, 0.25], [0, 0.32]], { at: [0, 3.1, -5.1], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, color: GOLD, bone: rudderJoint, smoothing: 0, name: "rudderTab" });

  // horizontal stabiliser and elevators
  const stabOut: OutlinePoint[] = [
    [0, -3.3],
    [2.2, -3.72],
    [2.72, -3.95],
    [2.8, -4.2],
    [2.78, -4.45],
    [0, -4.45],
  ];
  const elevOut: OutlinePoint[] = [
    [0.1, -4.45],
    [2.78, -4.45],
    [2.78, -4.7],
    [2.5, -5.02],
    [0.1, -5.1],
  ];
  const STAB_Y = 2.82;
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    b.extrude(stabOut, { at: [0, STAB_Y, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: [0.04, 0.11], bevel: 0.015, smoothing: 1, color: tailPaint, bone: hull, name: `stabiliser${sideTag}` });
    const eJoint = b.joint(`elevator${sideTag}`, { parent: hull, at: [s * 1.4, STAB_Y, -4.45], dir: [s, 0, 0], role: "hinge" });
    b.extrude(elevOut, { at: [0, STAB_Y, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: [0.03, 0.06], bevel: 0.012, smoothing: 1, color: tailPaint, bone: eJoint, name: `elevator${sideTag}` });
    b.rod([s * 0.2, STAB_Y, -4.45], [s * 2.7, STAB_Y, -4.45], 0.012, { color: STEEL, bone: eJoint, sides: 4 });
    const eh = new Batch();
    for (const x of [0.3, 1.0, 1.7, 2.4]) eh.put(box(0.1, 0.05, 0.1), [s * x, STAB_Y, -4.45]);
    eh.flush(b, STEEL, eJoint, `elevatorHinges${sideTag}`);
    // trim tab on the elevator trailing edge
    b.extrude([[0, 0], [0.6, 0], [0.55, -0.16], [0.05, -0.16]], { at: [s * 0.75, STAB_Y, -5.08], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.008, color: GOLD, bone: eJoint, smoothing: 0, name: `trimTab${sideTag}` });
    // gold tip on the elevator and tailplane
    b.part(ball(0.06, 6, 4), GOLD, { bone: eJoint, at: [s * 2.8, STAB_Y, -4.5], scale: [1, 0.7, 2.5] });
    // stabiliser bracing struts
    b.sweep(polyline([[s * 1.5, STAB_Y - 0.03, -3.95], [s * 0.2, 2.2, -3.5]]), () => [0.016, 0.04] as [number, number], { color: STEEL, bone: hull, sides: 6, caps: "flat" });
  }

  // wing rivet rows along the leading and trailing edges
  const rivetB = new Batch();
  for (const deg of [62, -64]) {
    for (const [t0, t1] of [[0.04, 0.46], [0.54, 0.96]]) {
      const row = wing.line(deg, 0.004).slice(t0, t1);
      for (let i = 0; i < 34; i++) {
        const q = row.at(i / 33);
        rivetB.put(ball(0.014, 4, 3), [q.x, q.y, q.z]);
      }
    }
  }
  rivetB.flush(b, "#e5a43a", hull, "wingRivets");
  // inspection plates with gold screws on the rear fuselage
  for (const s of SIDES) {
    for (const z of [-2.35, -3.05]) {
      const ph = need(hullSkin.ray([s * 3, 2.32, z], [-s, 0, 0]), "inspection plate");
      b.stick(box(0.02, 0.2, 0.3), SEAM, ph, { embed: 0.3, bone: hull, name: `inspection${s > 0 ? "L" : "R"}` });
      const screws = new Batch();
      for (const dy of [-0.08, 0.08]) for (const dz of [-0.12, 0.12]) {
        const sh = need(hullSkin.ray([s * 3, 2.32 + dy, z + dz], [-s, 0, 0]), "screw");
        screws.put(cyl(0.015, 0.015, 0.02, 5), [sh.at.x + s * 0.012, sh.at.y, sh.at.z], [s, 0, 0]);
      }
      screws.flush(b, "#ffc93f", hull, `plateScrews${s > 0 ? "L" : "R"}`);
    }
  }

  // tail beacon, white tail light, tie-down ring
  glow(b.part(ball(0.07, 8, 6), RED_LIGHT, { bone: hull, at: [0, 3.14, -2.5], scale: [1, 0.8, 1], name: "beacon" }), 2);
  glow(b.part(ball(0.05, 6, 4), WHITE_LIGHT, { bone: rudderJoint, at: [0, 3.55, -5.12], name: "tailLight" }), 2);
  b.sweep(catmull([[0, 2.75, -4.9], [0, 2.62, -4.98], [0, 2.55, -4.92], [0, 2.68, -4.84]], { closed: true }), 0.012, { color: STEEL, bone: hull, sides: 4, name: "tieDownRing" });

  // fin pennant on a gold pole
  b.rod([0, 4.28, -4.1], [0, 4.8, -4.1], 0.014, { color: GOLD, bone: hull, sides: 6 });
  b.part(ball(0.03, 6, 4), GOLD, { bone: hull, at: [0, 4.82, -4.1] });
  const pennantPaint = paint((_p, _n, c) => {
    const k = Math.floor(c[0] / 0.2) % 3;
    return k === 0 ? TEAL : k === 1 ? CREAM : GOLD;
  });
  b.extrude(
    [
      [0, 0.2],
      [0.5, 0.22],
      [1.0, 0.15],
      [0.8, 0.0],
      [1.0, -0.15],
      [0.5, -0.22],
      [0, -0.2],
    ],
    { at: [0, 4.6, -4.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: pennantPaint, bone: hull, smoothing: 0, name: "pennant" },
  );

  // antenna mast and wire
  b.rod([0, 3.1, -1.3], [0, 3.45, -1.3], 0.015, { color: STEEL, bone: hull, sides: 5 });
  b.sweep(polyline([[0, 3.45, -1.3], [0, 4.1, -3.9]]), 0.006, { color: INK, bone: hull, sides: 4, caps: "none", name: "antennaWire" });

  // ------------------------------------------------------------ floats
  const FL: [number, number, number, number][] = [
    [-3.15, 0.4, 0.58, 0.1],
    [-2.5, 0.2, 0.66, 0.34],
    [-1.6, 0, 0.72, 0.58],
    [-0.6, 0, 0.76, 0.66],
    [0.7, 0, 0.76, 0.66],
    [1.9, 0, 0.74, 0.62],
    [2.9, 0.1, 0.7, 0.5],
    [3.55, 0.32, 0.66, 0.3],
    [3.98, 0.52, 0.62, 0.08],
  ];
  for (const s of SIDES) {
    const sideTag = s > 0 ? "L" : "R";
    const fx = s * 1.45;
    const fl = b.loft(
      FL.map(([z, y0, y1, w]) => ({ at: [fx, (y0 + y1) / 2, z] as P3, w, h: y1 - y0 })),
      { sides: 10, color: floatPaint, bone: hull, name: `float${sideTag}` },
    );
    const fs = b.surface(fl);
    // deck hatches with gold rims and ring handles
    for (const z of [-1.1, 0.1, 1.3]) {
      const h = need(fs.ray([fx, 2, z], [0, -1, 0]), "hatch");
      b.stick(cyl(0.11, 0.12, 0.03, 10), GOLD, h, { embed: 0.3, bone: hull, name: `hatchRim${sideTag}` });
      b.stick(cyl(0.085, 0.085, 0.03, 10), CREAM, h.moved([0, 0.012, 0]), { embed: 0.3, bone: hull });
      b.sweep(catmull([[fx - 0.04, 0, z], [fx, 0, z + 0.04], [fx + 0.04, 0, z], [fx, 0, z - 0.04]].map((q) => [q[0], h.at.y + 0.035, q[2]]), { closed: true }), 0.006, { color: BRASS, bone: hull, sides: 4 });
    }
    // hand-pump standpipe on the deck and a mooring ring on the bow cleat
    const pump = need(fs.ray([fx, 2, -1.9], [0, -1, 0]), "pump");
    b.stick(cyl(0.03, 0.035, 0.2, 6), STEEL, pump, { embed: 0.1, bone: hull, name: `pump${sideTag}` });
    b.stick(cyl(0.045, 0.045, 0.03, 6), GOLD, pump.moved([0, 0.19, 0]), { embed: 0.1, bone: hull });
    b.sweep(catmull([[fx - 0.05, 0.72, 3.42], [fx, 0.78, 3.4], [fx + 0.05, 0.72, 3.42], [fx, 0.68, 3.4]], { closed: true }), 0.008, { color: BRASS, bone: hull, sides: 4 });
    // bow cleat, bow cap, stern deck plate, gold chine strip
    const bow = need(fs.ray([fx, 2, 3.4], [0, -1, 0]), "bow");
    b.stick(box(0.2, 0.05, 0.05), GOLD, bow, { embed: 0.2, bone: hull, name: `cleat${sideTag}` });
    b.stick(box(0.05, 0.08, 0.05), GOLD, bow.moved([0, 0.02, 0.04]), { embed: 0.2, bone: hull });
    b.part(ball(0.07, 6, 4), CORAL, { bone: hull, at: [fx, 0.55, 3.97], scale: [1, 1.1, 1.4], name: `bowBumper${sideTag}` });
    b.sweep(fl.line(s * 90, 0.004).slice(0.18, 0.82), 0.015, { color: GOLD, bone: hull, sides: 4, caps: "none" });
    b.sweep(fl.line(s * 125, 0.004).slice(0.18, 0.82), 0.02, { color: NAVY, bone: hull, sides: 4, caps: "none" });
    // glowing runes and filigree on the outer side
    const sh = need(fs.ray([s * 3, 0.38, 0.6], [-s, 0, 0]), "float side");
    glow(b.decal(fs, RUNES, { at: sh, dir: [s, 0, 0], size: [1.7, 0.2], bone: hull, name: `runes${sideTag}` }), 1.5);
    // planing step on the keel
    b.extrude([[0, 0], [0.5, 0], [0.38, 0.1], [0.12, 0.1]], { at: [fx, 0, -0.95], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.25, color: DEEP, bone: hull, smoothing: 0, name: `step${sideTag}` });
    // water rudder
    const wr = b.joint(`waterRudder${sideTag}`, { parent: hull, at: [fx, 0.4, -2.98], dir: [0, 1, 0], role: "hinge" });
    b.extrude(
      [
        [0.04, 0.58, "sharp"],
        [-0.42, 0.58],
        [-0.5, 0.12],
        [-0.12, -0.0],
        [0.04, 0.05, "sharp"],
      ],
      { at: [fx, 0, -2.98], thickness: 0.04, bevel: 0.008, smoothing: 1, color: CREAM, bone: wr, name: `waterRudderBlade${sideTag}` },
    );
    b.rod([fx, 0.62, -2.98], [fx, 0.1, -2.98], 0.02, { color: STEEL, bone: wr, sides: 5 });
    // strut sets
    const strutSec = () => [0.024, 0.07] as [number, number];
    // cargo lashed to the deck: a barrel on the left float, a crate on the right
    const deckY = need(fs.ray([fx, 2, -0.5], [0, -1, 0]), "cargo").at.y;
    if (s > 0) {
      b.part(cyl(0.16, 0.15, 0.34, 10), WOOD, { bone: hull, at: [fx, deckY + 0.17, -0.5], name: "barrel" });
      const hoops = new Batch();
      for (const dy of [0.08, 0.26]) hoops.put(cyl(0.166, 0.166, 0.03, 10), [fx, deckY + dy, -0.5]);
      hoops.flush(b, GOLD, hull, "barrelHoops");
      b.part(cyl(0.12, 0.12, 0.02, 10), CREAM, { bone: hull, at: [fx, deckY + 0.35, -0.5], name: "barrelLid" });
    } else {
      b.part(box(0.42, 0.3, 0.38), WOOD, { bone: hull, at: [fx, deckY + 0.15, -0.5], name: "crate" });
      const trim = new Batch();
      for (const dx of [-0.2, 0.2]) for (const dz of [-0.18, 0.18]) trim.put(box(0.05, 0.32, 0.05), [fx + dx, deckY + 0.15, -0.5 + dz]);
      trim.put(box(0.44, 0.04, 0.4), [fx, deckY + 0.3, -0.5]);
      trim.flush(b, GOLD, hull, "crateTrim");
      b.sweep(polyline([[fx - 0.22, deckY + 0.15, -0.7], [fx - 0.22, deckY + 0.32, -0.5], [fx - 0.22, deckY + 0.15, -0.3]]), 0.01, { color: ROPE, bone: hull, sides: 4, caps: "none" });
    }
    for (const [fz, zs] of [[1.38, [1.78, 1.0]], [-1.1, [-0.7, -1.55]]] as [number, number[]][]) {
      for (const z of zs) {
        b.sweep(polyline([[s * 0.4, 1.64, z], [fx, 0.74, fz]]), strutSec, { color: STEEL, bone: hull, sides: 8, caps: "flat", name: `floatStrut${sideTag}` });
      }
      const fit = new Batch();
      fit.put(box(0.2, 0.08, 0.3), [fx, 0.77, fz]);
      for (const z of zs) fit.put(box(0.16, 0.1, 0.18), [s * 0.4, 1.66, z]);
      fit.flush(b, GOLD, hull, `floatFittings${sideTag}`);
      b.rod([s * 1.2, 0.98, fz], [0, 0.98, fz], 0.04, { color: STEEL, bone: hull, sides: 8, name: `spreader${sideTag}` });
      // gold clamp where the spreader meets the struts
      b.part(cyl(0.06, 0.06, 0.1, 8), GOLD, { bone: hull, at: [s * 1.2, 0.98, fz], dir: [1, 0, 0] });
    }
  }

  // ------------------------------------------------------------ hanging lantern and tassel charms
  for (const s of SIDES) {
    const cx = s * 2.6;
    const cz = 0.0;
    b.rod([cx, 3.15, cz], [cx, 2.95, cz], 0.008, { color: ROPE, bone: hull, sides: 4 });
    b.part(new THREE.ConeGeometry(0.075, 0.1, 6), GOLD, { bone: hull, at: [cx, 2.9, cz], name: "lanternCap" });
    glow(b.part(new THREE.OctahedronGeometry(0.075), ANEMO, { bone: hull, at: [cx, 2.76, cz], scale: [0.9, 1.6, 0.9], flat: true, name: "lanternCrystal" }), 1.8);
    b.part(cyl(0.05, 0.03, 0.05, 6), GOLD, { bone: hull, at: [cx, 2.6, cz], name: "lanternBase" });
    b.cards([frame([cx, 2.58, cz], [0, 1, 0])], TASSEL, { size: [0.11, 0.33], lean: 180, flow: [0, 0, 1], cross: true });
  }

  // ------------------------------------------------------------ extra dressing
  // carburettor scoop on top of the cowl
  b.extrude(
    [
      [0, 0],
      [0.52, 0],
      [0.54, 0.1],
      [0.38, 0.22],
      [0.1, 0.2],
      [0, 0.08],
    ],
    { at: [0, CY + 0.62, 3.12], thickness: 0.3, bevel: 0.03, smoothing: 1, color: TEAL, bone: hull, name: "cowlScoop" },
  );
  b.part(box(0.22, 0.1, 0.03), DARK, { bone: hull, at: [0, CY + 0.7, 3.64], name: "scoopMouth" });
  b.part(box(0.28, 0.025, 0.06), GOLD, { bone: hull, at: [0, CY + 0.76, 3.64], name: "scoopBrow" });
  for (const s of SIDES) {
    const tag = s > 0 ? "L" : "R";
    // boarding step on the front float strut, grab rail beside the pilot door
    b.part(box(0.3, 0.03, 0.22), STEEL, { bone: hull, at: [s * 0.95, 1.14, 1.58], name: `boardingStep${tag}` });
    b.part(box(0.3, 0.035, 0.04), GOLD, { bone: hull, at: [s * 0.95, 1.15, 1.7], name: `stepLip${tag}` });
    b.sweep(polyline([[s * 0.68, 2.0, 2.28], [s * 0.8, 2.12, 2.28], [s * 0.8, 2.85, 2.28], [s * 0.68, 2.97, 2.28]]), 0.015, {
      color: BRASS,
      bone: hull,
      sides: 6,
      name: `grabRail${tag}`,
    });
    // a streamer of anemo wind curling off each wingtip
    const sp = catmull([
      [s * 7.5, 3.64, 0.48],
      [s * 7.6, 3.8, -0.3],
      [s * 7.66, 3.92, -1.0],
      [s * 7.6, 3.78, -1.65],
      [s * 7.5, 3.55, -1.95],
      [s * 7.42, 3.6, -1.65],
      [s * 7.46, 3.82, -1.4],
    ]);
    glow(b.sweep(sp, [0.035, 0.004], { color: ANEMO, bone: hull, sides: 5, caps: { start: "flat", end: "point" }, name: `windStreamer${tag}` }), 1.4);
  }
  // coiled mooring rope on the right float deck
  const coilY = 0.72;
  for (let k = 0; k < 3; k++) {
    const ring: P3[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ring.push([-1.45 + Math.cos(a) * (0.13 - 0.01 * k), coilY + 0.025 + 0.035 * k, 2.3 + Math.sin(a) * (0.13 - 0.01 * k)]);
    }
    b.sweep(catmull(ring, { closed: true }), 0.022, { color: ROPE, bone: hull, sides: 5, name: `ropeCoil${k}` });
  }

  return b.root;
}
