// Mushroom Village: a tabletop diorama (about 1 m across) on a mossy round base. Three mushroom houses, a winding
// pebble path, a well, picket fences, flowers, fireflies and two frog residents. Cute flat low-poly: every mesh is
// faceted, surfaces are flat colours plus SVG drawings (faces, dots, doors, windows, grass and flower cards).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Mushroom Village",
  description:
    "A cute flat low-poly diorama on a mossy round base: three mushroom houses with round doors, lit windows and smoking chimneys, a pebble path, a well, picket fences, flowers, fireflies and two frog residents.",
};

// ---------------------------------------------------------------- palette
const SOIL_D = "#8a5d44";
const PEBBLES = ["#fff3df", "#ecdcc2", "#d8c7b0", "#c6c2dc"];
const CREAM_D = "#f8dab0";
const SPOT_WHITE = "#fff8ec";
const WOOD = "#b98055";
const WOOD_D = "#8a5a3c";
const FENCE = "#fff6e3";
const FENCE_TIP = "#ffadc4";
const PINK = "#ff8fb1";
const PINK_RIM = "#ffc0d4";
const ORANGE = "#ff9a62";
const ORANGE_RIM = "#ffc79c";
const LILAC = "#b59cff";
const LILAC_RIM = "#d8c9ff";
const BRICK_TOP = "#d2705f";
const CHIMNEY_HOLE = "#5a3f52";
const ROCK = "#cbc8de";
const ROCK_D = "#b2aecb";
const MOSS = "#9bd86b";
const MOSS_D = "#74bd56";
const MOSS_L = "#c2f08e";
const LEAF = "#64c86c";
const LEAF_D = "#45a65e";
const GLASS = "#ffe38a";
const FIRE = "#fff07a";
const IRON = "#6d5a7c";
const WATER_STONE = "#ebe7f7";
const FROG_A = "#8fe27c";
const FROG_A_BELLY = "#d9ffb4";
const FROG_A_SPOT = "#62c96e";
const FROG_B = "#72dcc6";
const FROG_B_BELLY = "#c9fbe9";
const FROG_B_SPOT = "#4fbfae";
const EYE_WHITE = "#ffffff";
const INK = "#3a2a50";

const G = 0.09; // ground height: the top of the mossy base
const D = Math.PI / 180;
const TAU = Math.PI * 2;

type V3 = [number, number, number];
const Q = (yaw = 0, pitch = 0, roll = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * D, yaw * D, roll * D, "YXZ"));
const lerp = (a: number, c: number, t: number) => a + (c - a) * t;

// ---------------------------------------------------------------- svg drawings (flat fills only)
const sv = (w: number, h: number, body: string) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const n1 = (n: number) => n.toFixed(1);

// Paths, in metres (x, z), used by the ground drawing, the pebbles and the flower sampler.
const pathMain = catmull([[0.075, G, 0.47], [0.02, G, 0.39], [0.06, G, 0.27], [-0.01, G, 0.14], [-0.09, G, 0.04], [-0.14, G, -0.035]]);
const pathB = catmull([[0.06, G, 0.27], [0.17, G, 0.17], [0.27, G, 0.06], [0.356, G, -0.0285]]);
const pathC = catmull([[0.02, G, 0.39], [-0.05, G, 0.31], [-0.13, G, 0.25], [-0.21, G, 0.2], [-0.235, G, 0.177]]);
const PATHS = [pathMain, pathB, pathC];
const pathSamples: Array<[number, number]> = [];
for (const p of PATHS) for (let i = 0; i <= 60; i++) pathSamples.push([p.at(i / 60).x, p.at(i / 60).z]);

function groundSvg() {
  const r = rng(11);
  const U = (m: number) => (m / 0.5 + 1) * 100; // metres to drawing units (200 across)
  const far = (x: number, y: number, d: number) => pathSamples.every(([px, pz]) => Math.hypot(U(px) - x, U(pz) - y) > d);
  let s = `<rect width="200" height="200" fill="${MOSS}"/>`;
  for (let i = 0; i < 26; i++) {
    const x = r() * 200, y = r() * 200, rx = 7 + r() * 14;
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(rx * 0.7)}" fill="${r() > 0.5 ? MOSS_L : MOSS_D}" transform="rotate(${n1(r() * 180)} ${n1(x)} ${n1(y)})"/>`;
  }
  const trail = (p: typeof pathMain) => {
    let d = "";
    for (let i = 0; i <= 50; i++) d += `${i ? "L" : "M"}${n1(U(p.at(i / 50).x))} ${n1(U(p.at(i / 50).z))}`;
    return d;
  };
  for (const p of PATHS) s += `<path d="${trail(p)}" fill="none" stroke="#e0c08e" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (const p of PATHS) s += `<path d="${trail(p)}" fill="none" stroke="#f0d9b0" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (let i = 0; i < 70; i++) {
    const x = 8 + r() * 184, y = 8 + r() * 184;
    if (Math.hypot(x - 100, y - 100) > 94 || !far(x, y, 14)) continue;
    const k = r();
    if (k < 0.45) s += `<path d="M${n1(x)} ${n1(y)} l-1.6 -4.5 M${n1(x)} ${n1(y)} l0.4 -5 M${n1(x)} ${n1(y)} l2 -4" stroke="#6fbd52" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
    else if (k < 0.75) s += [0, 120, 240].map((a) => `<circle cx="${n1(x + Math.sin(a * D) * 2.1)}" cy="${n1(y - Math.cos(a * D) * 2.1)}" r="2.1" fill="#79c755"/>`).join("");
    else {
      const c = ["#ffffff", "#ffd1e0", "#fff09a"][Math.floor(r() * 3)];
      s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="2" fill="${c}"/><circle cx="${n1(x)}" cy="${n1(y)}" r="0.8" fill="#ffc53d"/>`;
    }
  }
  return sv(200, 200, s);
}

function baseSideSvg() {
  const r = rng(5);
  let s = `<rect width="640" height="18" fill="#b9845d"/>`;
  s += `<path d="M0 10 Q40 8 80 11 T160 10 T240 12 T320 10 T400 11 T480 10 T560 12 T640 10 V12.4 Q600 13.6 560 14.4 T480 12.4 T400 13.6 T320 12.4 T240 14.4 T160 12.4 T80 13.6 T0 12.4Z" fill="#a4714d"/>`;
  s += `<path d="M0 15 Q60 13.6 120 15.4 T240 15 T360 15.6 T480 15 T600 15.4 T640 15 V18 H0Z" fill="#9a6848"/>`;
  for (let i = 0; i < 46; i++) {
    const x = r() * 640, y = 8 + r() * 8, w = 2.5 + r() * 3.5;
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(w)}" ry="${n1(w * 0.6)}" fill="${r() > 0.5 ? "#ecd6b4" : "#cdb79b"}"/>`;
  }
  s += `<rect width="640" height="6.6" fill="${MOSS}"/>`;
  for (let x = 0; x < 640; ) {
    const w = 9 + r() * 12, h = 3 + r() * 6.5;
    s += `<rect x="${n1(x)}" y="3" width="${n1(w)}" height="${n1(h + 3)}" rx="${n1(w / 2.2)}" fill="${MOSS}"/>`;
    x += w + 3 + r() * 10;
  }
  s += `<rect width="640" height="1.6" fill="${MOSS_L}"/>`;
  return sv(640, 18, s);
}

function stemSvg() {
  let s = `<rect width="256" height="64" fill="#fff3da"/><rect y="50" width="256" height="14" fill="#f7dcb4"/>`;
  for (let i = 0; i < 8; i++) {
    const x = i * 32;
    s += `<path d="M${x + 9} 8 V44 M${x + 23} 16 V38" stroke="#f3d9b2" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
    s += `<path d="M${x + 1} 64 L${x + 5} 49 L${x + 10} 64Z M${x + 9} 64 L${x + 15} 45 L${x + 21} 64Z M${x + 20} 64 L${x + 25} 51 L${x + 30} 64Z" fill="#79cc63"/>`;
    s += `<path d="M${x + 14} 64 L${x + 17} 54 L${x + 20} 64Z" fill="#9adf74"/>`;
  }
  return sv(256, 64, s);
}

const gillSvg = () => {
  let s = `<rect width="100" height="100" fill="#ffe8cd"/>`;
  for (let i = 0; i < 24; i++) s += `<path d="M50 50 L${n1(50 + Math.sin(i * 15 * D) * 50)} ${n1(50 - Math.cos(i * 15 * D) * 50)}" stroke="#efc29a" stroke-width="1.9"/>`;
  return sv(100, 100, s + `<circle cx="50" cy="50" r="10" fill="#e7b388"/>`);
};

const spotSvg = (kind: number) => {
  const c = `fill="${SPOT_WHITE}"`;
  if (kind === 0) return sv(64, 64, `<circle cx="32" cy="32" r="29" ${c}/><circle cx="24" cy="23" r="6" fill="#ffffff"/>`);
  if (kind === 1) return sv(64, 64, `<circle cx="22" cy="38" r="21" ${c}/><circle cx="47" cy="20" r="12" ${c}/><circle cx="16" cy="31" r="5" fill="#ffffff"/>`);
  return sv(64, 64, `<circle cx="18" cy="42" r="14" ${c}/><circle cx="44" cy="44" r="10" ${c}/><circle cx="32" cy="17" r="11" ${c}/>`);
};

const shineSvg = sv(64, 64, `<path d="M12 46 Q16 22 42 13" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="52" cy="11" r="4.6" fill="#ffffff"/>`);

const windowSvg = (curtain: string) =>
  sv(64, 64, `<circle cx="32" cy="32" r="33" fill="${GLASS}"/><circle cx="32" cy="35" r="22" fill="#fff0b0"/>` +
    `<path d="M0 6 Q16 20 14 44 Q10 48 7 52 L0 54Z" fill="${curtain}"/><path d="M64 6 Q48 20 50 44 Q54 48 57 52 L64 54Z" fill="${curtain}"/>` +
    `<path d="M40 14 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#ffffff"/>` +
    `<rect x="29" y="0" width="6" height="64" fill="#a86f4b"/><rect x="0" y="29" width="64" height="6" fill="#a86f4b"/><circle cx="32" cy="32" r="5" fill="#c58d63"/>`);

const doorSvg = (base: string, plank: string, band: string, heart: string) =>
  sv(64, 64, `<circle cx="32" cy="32" r="33" fill="${base}"/>` +
    `<path d="M16 0 V64 M32 0 V64 M48 0 V64" stroke="${plank}" stroke-width="2.6"/>` +
    `<rect x="0" y="40" width="64" height="6" fill="${band}"/>` +
    `<circle cx="32" cy="22" r="8" fill="#ffe8a0"/><path d="M32 27 l-5 -5 a3 3 0 0 1 5 -3.4 a3 3 0 0 1 5 3.4z" fill="${heart}"/>` +
    `<circle cx="47" cy="33" r="4.4" fill="#ffd45e"/><circle cx="47" cy="33" r="1.6" fill="#e6a93c"/>`);

const brickSvg = (a: string, c: string, line: string) => {
  let s = `<rect width="32" height="32" fill="${line}"/>`;
  for (let row = 0; row < 4; row++)
    for (let k = -1; k < 2; k++) {
      const x = k * 16 + (row % 2 ? 8 : 0);
      s += `<rect x="${x + 0.8}" y="${row * 8 + 0.8}" width="14.4" height="6.4" fill="${(row + k) % 2 ? a : c}"/>`;
    }
  return sv(32, 32, s);
};

const stoneSvg = () => {
  let s = `<rect width="256" height="64" fill="#b9b5d2"/>`;
  const tones = ["#e3dff2", "#d3cfe6", "#ece9f8"];
  for (let row = 0; row < 3; row++)
    for (let k = -1; k < 9; k++) {
      const x = k * 32 + (row % 2 ? 16 : 0);
      s += `<rect x="${x + 1.6}" y="${row * 21.3 + 1.6}" width="28.8" height="18.1" rx="4" fill="${tones[(row * 3 + k + 9) % 3]}"/>`;
    }
  return sv(256, 64, s);
};

const waterSvg = sv(100, 100, `<circle cx="50" cy="50" r="51" fill="#77cbf2"/><circle cx="50" cy="50" r="33" fill="none" stroke="#a5e3ff" stroke-width="4"/><circle cx="50" cy="50" r="15" fill="none" stroke="#a5e3ff" stroke-width="4"/>` +
  `<path d="M70 26 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#ffffff"/><path d="M26 66 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4z" fill="#ffffff"/>`);

const roofSvg = () => {
  let s = "";
  for (let i = 0; i < 4; i++) {
    const x = i * 32;
    s += `<rect x="${x}" width="32" height="64" fill="${i % 2 ? "#fff0dc" : "#ff7b84"}"/>`;
    s += `<circle cx="${x + 16}" cy="60" r="11" fill="${i % 2 ? "#fff0dc" : "#ff7b84"}"/>`;
    if (i % 2) s += `<path d="M${x + 16} 40 l-6 -6 a3.6 3.6 0 0 1 6 -4.6 a3.6 3.6 0 0 1 6 4.6z" fill="#ff7b84"/>`;
    else s += `<circle cx="${x + 16}" cy="34" r="4" fill="#fff0dc"/>`;
  }
  return sv(128, 64, s);
};

const signSvg = sv(64, 32,
  `<path d="M2 3 H47 L62 16 L47 29 H2 Z" fill="#eebd86" stroke="#a66d45" stroke-width="2.6" stroke-linejoin="round"/>` +
  `<path d="M7 19 a9 9 0 0 1 18 0z" fill="#ff8fb1"/><rect x="13" y="19" width="6" height="6" fill="#fff3da"/><circle cx="12" cy="15" r="1.7" fill="#fff8ec"/><circle cx="19" cy="13" r="1.4" fill="#fff8ec"/>` +
  `<path d="M31 16 H50 M45 11 L50 16 L45 21" stroke="#a66d45" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`);

const eyeSvg = sv(64, 64, `<circle cx="32" cy="34" r="27" fill="${INK}"/><circle cx="41" cy="24" r="10" fill="#ffffff"/><circle cx="23" cy="45" r="5" fill="#ffffff"/>`);
const eyeHappySvg = sv(64, 64, `<path d="M8 44 Q32 8 56 44" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/>`);
const smileSvg = sv(64, 24, `<path d="M6 6 Q32 26 58 6" stroke="${INK}" stroke-width="4.4" stroke-linecap="round" fill="none"/><path d="M5 3 l-2 -2 M59 3 l2 -2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);
const blushSvg = sv(48, 28, `<ellipse cx="24" cy="14" rx="23" ry="12.5" fill="#ff93b2"/><path d="M12 19 l5 -9 M22 21 l5 -10 M32 19 l5 -9" stroke="#ff6f98" stroke-width="2.6" stroke-linecap="round"/>`);
const frogSpotSvg = (c: string) => sv(64, 64, `<circle cx="22" cy="40" r="15" fill="${c}"/><circle cx="46" cy="22" r="11" fill="${c}"/><circle cx="48" cy="48" r="8" fill="${c}"/>`);

const flowerSvg = (petal: string, edge: string, centre: string, n: number, pr: number, headY: number, lean: number) => {
  let s = `<path d="M24 96 Q${24 + lean} 62 24 ${headY}" stroke="#4fae5a" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="14" cy="76" rx="9" ry="4.4" fill="#66c86b" transform="rotate(-30 14 76)"/><ellipse cx="34" cy="66" rx="9" ry="4.4" fill="#66c86b" transform="rotate(30 34 66)"/>`;
  for (let i = 0; i < n; i++) s += `<ellipse cx="24" cy="${headY - pr * 0.95}" rx="${n1(pr * 0.56)}" ry="${n1(pr)}" fill="${petal}" stroke="${edge}" stroke-width="1.6" transform="rotate(${n1((i * 360) / n)} 24 ${headY})"/>`;
  return sv(48, 96, s + `<circle cx="24" cy="${headY}" r="${n1(pr * 0.5)}" fill="${centre}"/>`);
};
const tulipSvg = (c: string, shade: string) =>
  sv(48, 96, `<path d="M24 96 V44" stroke="#4fae5a" stroke-width="3.6" stroke-linecap="round"/><path d="M24 84 Q10 76 8 60 Q20 66 24 84Z" fill="#66c86b"/><path d="M24 88 Q38 82 40 68 Q28 72 24 88Z" fill="#66c86b"/>` +
    `<path d="M10 14 L17 22 L24 10 L31 22 L38 14 Q40 46 24 48 Q8 46 10 14Z" fill="${c}"/><path d="M24 10 L31 22 L38 14 Q40 46 24 48 Q30 34 24 10Z" fill="${shade}"/>`);
const bellSvg = sv(48, 96, `<path d="M24 96 Q34 66 22 30" stroke="#4fae5a" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="16" cy="78" rx="9" ry="4.4" fill="#66c86b" transform="rotate(-30 16 78)"/>` +
  `<path d="M22 30 Q14 28 12 40 Q8 50 6 52 H28 Q26 48 26 38Z" fill="#8f9dff"/><path d="M28 50 Q30 42 38 44 Q42 52 44 58 H26Z" fill="#a9b4ff"/><path d="M14 52 Q16 58 14 62 H22 Q20 58 22 52Z" fill="#8f9dff"/><circle cx="22" cy="28" r="3" fill="#6f7de6"/>`);

const grassSvg = (a: string, c: string, seed: number) => {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < 7; i++) {
    const x = 6 + i * 6 + r() * 2, tip = x + (r() - 0.5) * 14, h = 8 + r() * 22;
    s += `<path d="M${n1(x - 3)} 40 Q${n1(x)} ${n1(40 - h * 0.6)} ${n1(tip)} ${n1(40 - h - 4)} Q${n1(x + 2)} ${n1(40 - h * 0.5)} ${n1(x + 3.4)} 40Z" fill="${i % 2 ? a : c}"/>`;
  }
  return sv(48, 40, s);
};

const sparkleSvg = sv(32, 32, `<path d="M16 0 L19.4 12.6 L32 16 L19.4 19.4 L16 32 L12.6 19.4 L0 16 L12.6 12.6Z" fill="#fff6a0"/><circle cx="16" cy="16" r="4.5" fill="#ffffff"/>`);
const puffSvg = sv(64, 64, `<g fill="#dde8ff"><circle cx="20" cy="46" r="14"/><circle cx="37" cy="40" r="18"/><circle cx="50" cy="48" r="12"/><circle cx="32" cy="52" r="15"/></g>` +
  `<g fill="#ffffff"><circle cx="20" cy="42" r="14"/><circle cx="37" cy="36" r="18"/><circle cx="50" cy="44" r="12"/><circle cx="32" cy="46" r="14"/></g>`);
const leafSvg = sv(48, 64, `<path d="M24 62 C3 48 5 18 24 2 C43 18 45 48 24 62Z" fill="#74d47c"/><path d="M24 62 C45 48 43 18 24 2Z" fill="#55bc6c"/><path d="M24 60 V14 M24 40 l-9 -8 M24 40 l9 -8 M24 26 l-7 -6 M24 26 l7 -6" stroke="#3a9a58" stroke-width="3" stroke-linecap="round" fill="none"/>`);
const interiorSvg = sv(64, 64, `<rect width="64" height="64" fill="#ffd27c"/><rect y="44" width="64" height="20" fill="#d99a62"/><circle cx="32" cy="22" r="9" fill="#fff0b4"/><path d="M14 44 V30 a6 6 0 0 1 12 0 V44Z" fill="#f0a868"/>`);
const butterflySvg = (wing: string, tip: string, dot: string) =>
  sv(48, 40, `<g fill="${wing}"><ellipse cx="14" cy="14" rx="13" ry="11" transform="rotate(-20 14 14)"/><ellipse cx="34" cy="14" rx="13" ry="11" transform="rotate(20 34 14)"/><ellipse cx="16" cy="28" rx="8" ry="7"/><ellipse cx="32" cy="28" rx="8" ry="7"/></g>` +
    `<g fill="${tip}"><circle cx="9" cy="11" r="5"/><circle cx="39" cy="11" r="5"/></g><g fill="${dot}"><circle cx="16" cy="29" r="3"/><circle cx="32" cy="29" r="3"/></g>` +
    `<rect x="22" y="6" width="4" height="30" rx="2" fill="#4a3660"/><path d="M23 7 Q19 0 15 1 M25 7 Q29 0 33 1" stroke="#4a3660" stroke-width="2" fill="none" stroke-linecap="round"/>`);

const T = {
  ground: svg(groundSvg(), { size: 1024 }),
  baseSide: svg(baseSideSvg(), { size: 1024 }),
  stem: svg(stemSvg(), { size: 512 }),
  gills: svg(gillSvg(), { size: 192 }),
  spots: [0, 1, 2].map((k) => svg(spotSvg(k), { size: 128 })),
  shine: svg(shineSvg, { size: 128 }),
  windowPink: svg(windowSvg("#ff9db8"), { size: 128 }),
  windowTeal: svg(windowSvg("#7fd9cf"), { size: 128 }),
  doorTeal: svg(doorSvg("#5ccabd", "#3faa9f", "#2f8c86", "#ff7d9f"), { size: 192 }),
  doorWine: svg(doorSvg("#b86cd0", "#9850b4", "#7a3c94", "#ffd45e"), { size: 192 }),
  doorSun: svg(doorSvg("#ffc94d", "#e6a92f", "#c98424", "#ff7d9f"), { size: 192 }),
  brickA: svg(brickSvg("#f4a28c", "#ec8f7a", "#d9745f"), { size: 128 }),
  brickB: svg(brickSvg("#c9b3ef", "#b79be3", "#9a82cc"), { size: 128 }),
  stone: svg(stoneSvg(), { size: 512 }),
  water: svg(waterSvg, { size: 128 }),
  roof: svg(roofSvg(), { size: 256 }),
  sign: svg(signSvg, { size: 192 }),
  eye: svg(eyeSvg, { size: 128 }),
  eyeHappy: svg(eyeHappySvg, { size: 128 }),
  smile: svg(smileSvg, { size: 128 }),
  blush: svg(blushSvg, { size: 128 }),
  frogSpotA: svg(frogSpotSvg(FROG_A_SPOT), { size: 96 }),
  frogSpotB: svg(frogSpotSvg(FROG_B_SPOT), { size: 96 }),
  flowers: [
    svg(flowerSvg("#ffffff", "#cfc4ea", "#ffc83d", 9, 11.5, 22, 4), { size: 192 }),
    svg(flowerSvg("#ff8fc0", "#e5649d", "#fff0a0", 7, 11, 24, -4), { size: 192 }),
    svg(flowerSvg("#ffd84a", "#f0a82a", "#ff9f3f", 5, 11, 22, 3), { size: 192 }),
    svg(tulipSvg("#ff6f86", "#e5546f"), { size: 192 }),
    svg(tulipSvg("#ffb54d", "#f09a33"), { size: 192 }),
    svg(bellSvg, { size: 192 }),
  ],
  grass: [
    svg(grassSvg("#6cc260", "#8fdc6a", 3), { size: 128 }),
    svg(grassSvg("#58b25a", "#7fd068", 8), { size: 128 }),
    svg(grassSvg("#7fd068", "#a5e77c", 13), { size: 128 }),
  ],
  sparkle: svg(sparkleSvg, { size: 96 }),
  puff: svg(puffSvg, { size: 128 }),
  leaf: svg(leafSvg, { size: 192 }),
  interior: svg(interiorSvg, { size: 96 }),
  butterflies: [svg(butterflySvg("#ff8fc0", "#ffd2e6", "#e5609f"), { size: 128 }), svg(butterflySvg("#8fb5ff", "#d3e2ff", "#5f86e0"), { size: 128 })],
};

// ---------------------------------------------------------------- builder and helpers
export default function build() {
  const b = createBuilder({ name: "mushroomVillage" });
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const rand = rng(77);
  const R = (lo: number, hi: number) => lo + (hi - lo) * rand();

  /** One faceted part on the base joint. */
  const put = (geo: THREE.BufferGeometry, color: string, at: V3, o: { quat?: THREE.Quaternion; scale?: V3 | number; texture?: THREE.Texture } = {}) =>
    b.part(geo, color, { bone: base, at, flat: true, ...o });

  // Static pieces are merged per colour: many little stones, posts and petals become one part each.
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const stat = (color: string, geo: THREE.BufferGeometry, at: V3, quat = new THREE.Quaternion(), scale: V3 | number = 1) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const s = typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at), quat, s));
    const list = buckets.get(color) ?? [];
    list.push(g);
    buckets.set(color, list);
  };
  const disc = (r: number, thick: number, sides: number) => new THREE.CylinderGeometry(r, r, thick, sides).rotateX(Math.PI / 2);

  // ------------------------------------------------------------ the mossy base
  put(new THREE.CylinderGeometry(0.5, 0.425, G, 16, 1, true), "#ffffff", [0, G / 2, 0], { texture: T.baseSide });
  b.part(new THREE.CircleGeometry(0.5, 16), "#ffffff", { bone: base, at: [0, G, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: T.ground, flat: true });
  b.part(new THREE.CircleGeometry(0.425, 16).rotateX(Math.PI / 2), SOIL_D, { bone: base, at: [0, 0.0005, 0], flat: true });

  // ------------------------------------------------------------ houses
  type HouseSpec = {
    id: string;
    x: number;
    z: number;
    yaw: number;
    stemH: number;
    rt: number;
    rb: number;
    capR: number;
    capH: number;
    cap: string;
    rim: string;
    door: THREE.Texture;
    doorR: number;
    doorOpen: number;
    windows: Array<{ ang: number; y: number; r: number; tex: THREE.Texture }>;
    blush: Array<{ ang: number; y: number }>;
    dormer?: { az: number; el: number; r: number };
    chimney: { az: number; el: number; h: number; w: number; brick: THREE.Texture };
    spots: Array<{ az: number; el: number; kind: number; size: number; roll: number }>;
    shine: { az: number; el: number; size: number };
  };
  const COS = Math.cos(22.5 * D);
  const houseAnchor: Array<{ x: number; z: number; r: number }> = [];

  function house(s: HouseSpec) {
    const slope = Math.atan((s.rb - s.rt) / s.stemH) / D;
    const stemR = (y01: number) => lerp(s.rb, s.rt, y01);
    houseAnchor.push({ x: s.x, z: s.z, r: s.rb + 0.045 });

    // stem: eight faces, one of them square to the door, with a little grass skirt drawn at its foot
    const stem = put(new THREE.CylinderGeometry(s.rt, s.rb, s.stemH, 8, 1, true), "#ffffff", [s.x, G + s.stemH / 2, s.z], {
      quat: Q(s.yaw - 22.5),
      texture: T.stem,
    });
    // a face of the stem: where it is, which way it looks
    const face = (ang: number, y01: number, lift: number) => {
      const psi = (s.yaw + ang) * D;
      const r = stemR(y01) * COS + lift;
      return {
        at: new THREE.Vector3(s.x + Math.sin(psi) * r, G + y01 * s.stemH, s.z + Math.cos(psi) * r),
        quat: Q(s.yaw + ang, -slope),
        psi,
      };
    };
    const along = (f: { at: THREE.Vector3; quat: THREE.Quaternion }, d: number): V3 =>
      new THREE.Vector3(0, 0, d).applyQuaternion(f.quat).add(f.at).toArray() as V3;

    // skirt ring under the cap, cap, rim and gills
    const capBase = G + s.stemH + 0.008;
    put(new THREE.CylinderGeometry(s.rt * 1.03, s.rt * 1.75, 0.032, 8), CREAM_D, [s.x, capBase - 0.014, s.z], { quat: Q(s.yaw - 22.5) });
    const cap = put(new THREE.SphereGeometry(1, 12, 6, 0, TAU, 0, Math.PI / 2), s.cap, [s.x, capBase, s.z], { scale: [s.capR, s.capH, s.capR], quat: Q(s.yaw) });
    put(new THREE.TorusGeometry(s.capR * 0.985, 0.0115, 4, 12).rotateX(Math.PI / 2), s.rim, [s.x, capBase, s.z], { quat: Q(s.yaw) });
    put(new THREE.CircleGeometry(s.capR * 0.985, 12).rotateX(Math.PI / 2), "#ffffff", [s.x, capBase - 0.002, s.z], { quat: Q(s.yaw), texture: T.gills });

    // round door on a hinge, with a lit room behind it
    const dy = (s.doorR + 0.004) / s.stemH;
    const df = face(0, dy, 0);
    const doorC = along(df, 0.0);
    const hingeDir = new THREE.Vector3(Math.cos(s.yaw * D), 0, -Math.sin(s.yaw * D));
    const hinge = new THREE.Vector3(...doorC).addScaledVector(hingeDir, -s.doorR);
    const hj = b.joint(`door${s.id}`, { parent: base, at: hinge.toArray() as V3, dir: [0, 1, 0], role: "hinge" });
    put(new THREE.TorusGeometry(s.doorR + 0.004, 0.0055, 5, 12), WOOD_D, along(df, 0.002), { quat: df.quat });
    glow(put(new THREE.CircleGeometry(s.doorR, 10), "#ffffff", along(df, 0.0012), { quat: df.quat, texture: T.interior }), 0.9);
    b.part(disc(s.doorR * 0.995, 0.007, 10), WOOD, { bone: hj, at: along(df, 0.0055), quat: df.quat, flat: true });
    b.part(new THREE.CircleGeometry(s.doorR * 0.995, 10), "#ffffff", { bone: hj, at: along(df, 0.0095), quat: df.quat, flat: true, texture: s.door });
    if (s.doorOpen) b.pose(hj, { axis: [0, 1, 0], deg: -s.doorOpen });
    // doorstep and welcome stones
    stat(PEBBLES[0], new THREE.CylinderGeometry(0.03, 0.034, 0.008, 7), [df.at.x + Math.sin(df.psi) * 0.038, G + 0.003, df.at.z + Math.cos(df.psi) * 0.038], Q(R(0, 60)));
    stat(PEBBLES[1], new THREE.CylinderGeometry(0.02, 0.023, 0.007, 6), [df.at.x + Math.sin(df.psi) * 0.078, G + 0.002, df.at.z + Math.cos(df.psi) * 0.078], Q(R(0, 60)));

    // windows
    for (const w of s.windows) {
      const wf = face(w.ang, w.y, 0);
      put(new THREE.TorusGeometry(w.r + 0.003, 0.005, 5, 12), WOOD_D, along(wf, 0.0025), { quat: wf.quat });
      glow(put(new THREE.CircleGeometry(w.r, 10), "#ffffff", along(wf, 0.0035), { quat: wf.quat, texture: w.tex }), 1);
      stat(WOOD, new THREE.BoxGeometry(w.r * 1.7, 0.006, 0.014), along(wf, 0.004).map((v, i) => (i === 1 ? v - w.r - 0.008 : v)) as V3, Q(s.yaw + w.ang));
    }

    // blushing cheeks on the stem
    const skin = b.surface(stem);
    for (const c of s.blush) {
      const y = G + c.y * s.stemH;
      const hit = skin.around([s.x, y, s.z]).at(s.yaw + c.ang, 0);
      if (hit) b.decal(skin, T.blush, { at: hit, size: [0.04, 0.023], segments: 4, lift: 0.0025, bone: base });
    }

    // cap decorations: dots, a shine, a dormer window, a chimney with smoke
    const top = b.surface(cap);
    const centre: V3 = [s.x, capBase + 0.01, s.z];
    for (const sp of s.spots) {
      const hit = top.around(centre).at(s.yaw + sp.az, sp.el);
      if (hit) b.decal(top, T.spots[sp.kind], { at: hit, size: [sp.size, sp.size], segments: 5, lift: 0.0045, roll: sp.roll, bone: base });
    }
    {
      const hit = top.around(centre).at(s.yaw + s.shine.az, s.shine.el);
      if (hit) b.decal(top, T.shine, { at: hit, size: [s.shine.size, s.shine.size], segments: 5, lift: 0.0055, bone: base });
    }
    if (s.dormer) {
      const hit = top.around(centre).at(s.yaw + s.dormer.az, s.dormer.el);
      if (hit) {
        const out = hit.n.clone().normalize();
        const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), out);
        const at = (d: number): V3 => hit.at.clone().addScaledVector(out, d).toArray() as V3;
        const r = s.dormer.r;
        put(new THREE.TorusGeometry(r + 0.004, 0.0065, 5, 12), WOOD_D, at(0.004), { quat: qn });
        put(disc(r + 0.004, 0.012, 10), s.rim, at(-0.002), { quat: qn });
        glow(put(new THREE.CircleGeometry(r, 10), "#ffffff", at(0.0075), { quat: qn, texture: T.windowPink }), 1);
        // a little roof over the window
        put(new THREE.TorusGeometry(r + 0.012, 0.0055, 4, 7, Math.PI * 1.05), s.cap, at(0.008), {
          quat: qn.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.0)),
        });
      }
    }
    {
      const hit = top.around(centre).at(s.yaw + s.chimney.az, s.chimney.el);
      if (hit) {
        const { h, w } = s.chimney;
        const x = hit.at.x, z = hit.at.z, y0 = hit.at.y - 0.025;
        put(new THREE.BoxGeometry(w, h, w), "#ffffff", [x, y0 + h / 2, z], { quat: Q(s.yaw + 20), texture: s.chimney.brick });
        put(new THREE.BoxGeometry(w * 1.35, 0.012, w * 1.35), BRICK_TOP, [x, y0 + h + 0.004, z], { quat: Q(s.yaw + 20) });
        put(new THREE.BoxGeometry(w * 0.75, 0.002, w * 0.75), CHIMNEY_HOLE, [x, y0 + h + 0.0115, z], { quat: Q(s.yaw + 20) });
        const tops = y0 + h + 0.012;
        [0.04, 0.054, 0.07].forEach((size, i) =>
          b.cards([frame([x + 0.01 * i * i + 0.002, tops + 0.006 + i * 0.038, z], [0, 1, 0])], T.puff, { size, cross: true, flow: [0, 0, 1], bone: base, sink: 0 }),
        );
      }
    }
  }

  house({
    id: "A", x: -0.14, z: -0.18, yaw: 8, stemH: 0.3, rt: 0.105, rb: 0.127, capR: 0.225, capH: 0.15, cap: PINK, rim: PINK_RIM,
    door: T.doorTeal, doorR: 0.04, doorOpen: 0,
    windows: [{ ang: 45, y: 0.74, r: 0.03, tex: T.windowPink }, { ang: -45, y: 0.74, r: 0.03, tex: T.windowPink }, { ang: 180, y: 0.6, r: 0.03, tex: T.windowTeal }],
    blush: [{ ang: 45, y: 0.46 }, { ang: -45, y: 0.46 }],
    dormer: { az: 8, el: 40, r: 0.03 },
    chimney: { az: 215, el: 52, h: 0.09, w: 0.034, brick: T.brickA },
    spots: [
      { az: -50, el: 52, kind: 0, size: 0.07, roll: 0 }, { az: 50, el: 55, kind: 1, size: 0.075, roll: 200 }, { az: 125, el: 38, kind: 2, size: 0.07, roll: 30 },
      { az: 175, el: 55, kind: 0, size: 0.06, roll: 0 }, { az: -110, el: 40, kind: 1, size: 0.07, roll: 90 }, { az: 95, el: 62, kind: 0, size: 0.045, roll: 0 },
      { az: -10, el: 62, kind: 2, size: 0.055, roll: 10 }, { az: -150, el: 58, kind: 0, size: 0.05, roll: 0 },
    ],
    shine: { az: -28, el: 34, size: 0.07 },
  });
  house({
    id: "B", x: 0.27, z: -0.13, yaw: 40, stemH: 0.19, rt: 0.085, rb: 0.105, capR: 0.19, capH: 0.125, cap: ORANGE, rim: ORANGE_RIM,
    door: T.doorWine, doorR: 0.034, doorOpen: 0,
    windows: [{ ang: 45, y: 0.66, r: 0.025, tex: T.windowTeal }, { ang: -45, y: 0.66, r: 0.025, tex: T.windowTeal }, { ang: 180, y: 0.6, r: 0.025, tex: T.windowPink }],
    blush: [{ ang: 45, y: 0.36 }, { ang: -45, y: 0.36 }],
    dormer: { az: -40, el: 40, r: 0.024 },
    chimney: { az: 140, el: 52, h: 0.07, w: 0.03, brick: T.brickB },
    spots: [
      { az: -45, el: 50, kind: 1, size: 0.06, roll: 10 }, { az: 50, el: 52, kind: 0, size: 0.06, roll: 0 }, { az: 110, el: 40, kind: 2, size: 0.055, roll: 0 },
      { az: -120, el: 45, kind: 0, size: 0.05, roll: 0 }, { az: 180, el: 52, kind: 1, size: 0.055, roll: 100 }, { az: 5, el: 66, kind: 0, size: 0.04, roll: 0 },
    ],
    shine: { az: -30, el: 32, size: 0.06 },
  });
  house({
    id: "C", x: -0.31, z: 0.07, yaw: 35, stemH: 0.12, rt: 0.078, rb: 0.096, capR: 0.17, capH: 0.11, cap: LILAC, rim: LILAC_RIM,
    door: T.doorSun, doorR: 0.032, doorOpen: 55,
    windows: [{ ang: 45, y: 0.72, r: 0.022, tex: T.windowPink }, { ang: -45, y: 0.72, r: 0.022, tex: T.windowPink }, { ang: 180, y: 0.6, r: 0.022, tex: T.windowTeal }],
    blush: [{ ang: 45, y: 0.4 }, { ang: -45, y: 0.4 }],
    chimney: { az: 210, el: 50, h: 0.055, w: 0.026, brick: T.brickA },
    spots: [
      { az: -40, el: 48, kind: 0, size: 0.055, roll: 0 }, { az: 55, el: 50, kind: 2, size: 0.05, roll: 40 }, { az: 120, el: 40, kind: 1, size: 0.05, roll: 0 },
      { az: -115, el: 42, kind: 1, size: 0.05, roll: 200 }, { az: 175, el: 50, kind: 0, size: 0.045, roll: 0 }, { az: 10, el: 65, kind: 0, size: 0.035, roll: 0 },
    ],
    shine: { az: -22, el: 34, size: 0.055 },
  });

  // ------------------------------------------------------------ pebble path
  const walk = (p: typeof pathMain, step: number, cb: (x: number, z: number, tx: number, tz: number) => void) => {
    const n = Math.ceil(p.length / step);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const at = p.at(t), tg = p.tangentAt(t);
      cb(at.x, at.z, tg.x, tg.z);
    }
  };
  for (const p of PATHS) {
    walk(p, 0.024, (x, z, tx, tz) => {
      const len = Math.hypot(tx, tz) || 1;
      const nx = -tz / len, nz = tx / len;
      for (const lat of [-0.021, 0, 0.021]) {
        if (rand() < 0.12) continue;
        const o = lat + R(-0.006, 0.006);
        const rad = R(0.0105, 0.0155);
        const h = R(0.006, 0.011);
        stat(PEBBLES[Math.floor(rand() * PEBBLES.length)], new THREE.CylinderGeometry(rad * 0.84, rad, h, 6), [x + nx * o + R(-0.004, 0.004), G + h / 2 - 0.002, z + nz * o + R(-0.004, 0.004)], Q(R(0, 60), R(-5, 5), R(-5, 5)));
      }
    });
  }

  // ------------------------------------------------------------ the well
  const WX = 0.19, WZ = 0.285, WH = 0.07, WRIM = G + WH + 0.014;
  put(new THREE.CylinderGeometry(0.067, 0.074, WH, 8, 1, true), "#ffffff", [WX, G + WH / 2, WZ], { texture: T.stone, quat: Q(-22.5) });
  b.lathe([[0.044, 0], [0.085, 0], [0.085, 0.014], [0.044, 0.014]], { at: [WX, G + WH, WZ], segments: 8, spin: 22.5, color: WATER_STONE, bone: base });
  put(new THREE.CircleGeometry(0.046, 8).rotateX(-Math.PI / 2), "#ffffff", [WX, G + WH - 0.012, WZ], { texture: T.water });
  put(new THREE.CylinderGeometry(0.0455, 0.0455, 0.012, 8, 1, true), "#ffffff", [WX, G + WH - 0.006, WZ], { texture: T.stone, quat: Q(-22.5) });
  for (const s of [1, -1]) {
    stat(WOOD, new THREE.BoxGeometry(0.011, 0.118, 0.011), [WX + s * 0.07, WRIM + 0.059 - 0.012, WZ]);
    stat(WOOD_D, new THREE.SphereGeometry(0.008, 5, 3), [WX + s * 0.07, WRIM + 0.108, WZ]);
  }
  stat(WOOD_D, new THREE.BoxGeometry(0.155, 0.009, 0.011), [WX, WRIM + 0.108, WZ]);
  put(new THREE.ConeGeometry(0.108, 0.058, 4), "#ffffff", [WX, WRIM + 0.14, WZ], { texture: T.roof, quat: Q(45) });
  stat(IRON, new THREE.CylinderGeometry(0.0035, 0.0035, 0.164, 5).rotateZ(Math.PI / 2), [WX, WRIM + 0.084, WZ]);
  stat(WOOD_D, new THREE.BoxGeometry(0.011, 0.028, 0.006), [WX + 0.084, WRIM + 0.072, WZ]);
  stat("#f1dcbc", new THREE.CylinderGeometry(0.0018, 0.0018, 0.058, 4), [WX, WRIM + 0.054, WZ]);
  stat(WOOD, new THREE.CylinderGeometry(0.014, 0.011, 0.02, 7), [WX, WRIM + 0.014, WZ]);
  stat(IRON, new THREE.TorusGeometry(0.0128, 0.0018, 3, 7).rotateX(Math.PI / 2), [WX, WRIM + 0.0225, WZ]);

  // ------------------------------------------------------------ fences and gate
  const FR = 0.445, GATE_A = -19, GATE_B = 34;
  const fenceAt = (deg: number): [number, number] => [FR * Math.sin(deg * D), FR * Math.cos(deg * D)];
  const posts: Array<{ x: number; z: number; deg: number; h: number }> = [];
  const span = 360 + GATE_A - GATE_B;
  const nPosts = Math.round((span * D * FR) / 0.048);
  for (let i = 0; i <= nPosts; i++) {
    const deg = GATE_B + (span * i) / nPosts;
    const [x, z] = fenceAt(deg);
    posts.push({ x, z, deg, h: 0.046 + (i % 3 === 0 ? 0.008 : i % 3 === 1 ? 0 : 0.004) });
  }
  posts.forEach((p, i) => {
    stat(FENCE, new THREE.BoxGeometry(0.013, p.h, 0.008), [p.x, G + p.h / 2 - 0.002, p.z], Q(p.deg));
    stat(FENCE_TIP, new THREE.ConeGeometry(0.0092, 0.016, 4), [p.x, G + p.h + 0.006, p.z], Q(p.deg + 45));
    const n = posts[i + 1];
    if (!n) return;
    const dx = n.x - p.x, dz = n.z - p.z;
    const len = Math.hypot(dx, dz);
    const yaw = Math.atan2(dx, dz) / D;
    for (const hy of [0.017, 0.033]) {
      const mx = (p.x + n.x) / 2, mz = (p.z + n.z) / 2, k = 1 - 0.0055 / FR;
      stat(FENCE, new THREE.BoxGeometry(0.0045, 0.0065, len), [mx * k, G + hy, mz * k], Q(yaw));
    }
  });
  const lanterns: V3[] = [];
  for (const deg of [GATE_A, GATE_B]) {
    const [x, z] = fenceAt(deg);
    stat(WOOD, new THREE.BoxGeometry(0.02, 0.085, 0.02), [x, G + 0.0405, z], Q(deg));
    stat(WOOD_D, new THREE.BoxGeometry(0.026, 0.008, 0.026), [x, G + 0.088, z], Q(deg));
    lanterns.push([x, G + 0.092, z]);
  }
  for (const at of lanterns) {
    glow(put(new THREE.CylinderGeometry(0.0115, 0.0115, 0.022, 6), GLASS, [at[0], at[1] + 0.011, at[2]]), 1.3);
    stat(IRON, new THREE.ConeGeometry(0.0165, 0.013, 6), [at[0], at[1] + 0.0285, at[2]]);
    stat(FENCE_TIP, new THREE.SphereGeometry(0.0035, 5, 3), [at[0], at[1] + 0.037, at[2]]);
    stat(IRON, new THREE.CylinderGeometry(0.0135, 0.0135, 0.003, 6), [at[0], at[1] + 0.0015, at[2]]);
  }

  // ------------------------------------------------------------ sign post
  {
    const x = 0.125, z = 0.4;
    stat(WOOD, new THREE.BoxGeometry(0.009, 0.1, 0.009), [x, G + 0.048, z], Q(-20));
    stat(WOOD_D, new THREE.SphereGeometry(0.008, 5, 3), [x, G + 0.1, z]);
    b.cards([frame([x, G + 0.045, z + 0.006], [0, 1, 0])], T.sign, { size: [0.085, 0.0425], flow: [0.25, 0, 1], bone: base, sink: 0 });
  }
  // ------------------------------------------------------------ rocks, hummocks, tiny mushrooms, flowers, grass
  const blockers: Array<{ x: number; z: number; r: number }> = [
    ...houseAnchor,
    { x: WX, z: WZ, r: 0.1 },
    { x: -0.1, z: 0.37, r: 0.055 },
    { x: 0.125, z: 0.4, r: 0.04 },
  ];
  const free = (x: number, z: number, pad: number) =>
    Math.hypot(x, z) < 0.405 &&
    pathSamples.every(([px, pz]) => Math.hypot(px - x, pz - z) > pad + 0.03) &&
    blockers.every((bl) => Math.hypot(bl.x - x, bl.z - z) > bl.r + pad);
  const props: Array<[number, number, number]> = [];
  const mossList: Array<[number, number, number]> = [];
  const tuftList: Array<[number, number, number]> = [];
  const pick = (taken: Array<[number, number, number]>, pad: number, sep: number, rMin = 0, rMax = 0.41): [number, number] | null => {
    for (let k = 0; k < 400; k++) {
      const a = R(0, TAU), rr = Math.sqrt(R(rMin * rMin, rMax * rMax));
      const x = Math.sin(a) * rr, z = Math.cos(a) * rr;
      if (!free(x, z, pad)) continue;
      if (taken.some(([tx, tz, ts]) => Math.hypot(tx - x, tz - z) < Math.max(sep, ts))) continue;
      taken.push([x, z, sep]);
      return [x, z];
    }
    return null;
  };

  // mossy rocks at the rim
  for (const [deg, rr, sc] of [[112, 0.4, 1], [205, 0.39, 0.8], [300, 0.4, 1.1], [330, 0.38, 0.7]] as Array<[number, number, number]>) {
    const x = Math.sin(deg * D) * rr, z = Math.cos(deg * D) * rr;
    stat(ROCK, new THREE.IcosahedronGeometry(1, 1), [x, G + 0.012 * sc, z], Q(R(0, 360)), [0.05 * sc, 0.033 * sc, 0.042 * sc]);
    stat(ROCK_D, new THREE.IcosahedronGeometry(1, 0), [x + 0.03 * sc, G + 0.006 * sc, z + 0.012], Q(R(0, 360)), [0.026 * sc, 0.017 * sc, 0.022 * sc]);
    stat(MOSS, new THREE.IcosahedronGeometry(1, 0), [x - 0.004, G + 0.03 * sc, z], Q(R(0, 360)), [0.034 * sc, 0.012 * sc, 0.03 * sc]);
    props.push([x, z, 0.06]);
  }
  // moss hummocks
  for (let i = 0; i < 14; i++) {
    const at = pick(mossList, 0.02, 0.09);
    if (!at) continue;
    const [x, z] = at;
    const s = R(0.022, 0.05);
    stat(i % 3 ? MOSS_D : MOSS_L, new THREE.IcosahedronGeometry(1, 1), [x, G, z], Q(R(0, 360)), [s, s * 0.32, s * 0.85]);
  }
  // tiny mushrooms
  const tiny: Array<[string, string]> = [[PINK, PINK_RIM], [ORANGE, ORANGE_RIM], [LILAC, LILAC_RIM], [PINK, PINK_RIM], [ORANGE, ORANGE_RIM], [LILAC, LILAC_RIM], [PINK, PINK_RIM]];
  tiny.forEach(([cap], i) => {
    const at = pick(props, 0.03, 0.08, 0.15);
    if (!at) return;
    const [x, z] = at;
    const sc = R(0.7, 1.2), h = 0.022 * sc;
    const lean = Q(R(0, 360), R(-8, 8));
    stat("#fff3da", new THREE.CylinderGeometry(0.007 * sc, 0.009 * sc, h, 5), [x, G + h / 2 - 0.001, z], lean);
    stat(cap, new THREE.SphereGeometry(1, 7, 3, 0, TAU, 0, Math.PI / 2), [x, G + h - 0.002, z], lean, [0.019 * sc, 0.013 * sc, 0.019 * sc]);
    stat(SPOT_WHITE, new THREE.SphereGeometry(0.0035 * sc, 4, 2), [x + 0.006 * sc, G + h + 0.008 * sc, z + 0.003], undefined, [1, 0.5, 1]);
    if (i % 2) {
      const [x2, z2] = [x + 0.028, z + 0.012];
      stat("#fff3da", new THREE.CylinderGeometry(0.005, 0.0065, 0.014, 5), [x2, G + 0.007, z2]);
      stat(cap, new THREE.SphereGeometry(1, 7, 3, 0, TAU, 0, Math.PI / 2), [x2, G + 0.013, z2], undefined, [0.012, 0.008, 0.012]);
    }
  });
  // chunky flat flowers
  const petalsOf = ["#ff7fa8", "#ffffff", "#ffd84a", "#b79cff", "#ff9a62"];
  for (let i = 0; i < 16; i++) {
    const nearFence = i < 8;
    const at = pick(props, 0.02, 0.055, nearFence ? 0.3 : 0.12, nearFence ? 0.4 : 0.36);
    if (!at) continue;
    const [x, z] = at;
    const h = R(0.04, 0.065), col = petalsOf[i % petalsOf.length];
    const yaw = R(0, 360);
    stat(LEAF, new THREE.CylinderGeometry(0.0022, 0.003, h, 4), [x, G + h / 2 - 0.002, z]);
    stat(LEAF_D, new THREE.SphereGeometry(1, 4, 2), [x + 0.008, G + h * 0.4, z], Q(yaw), [0.011, 0.0025, 0.005]);
    for (let k = 0; k < 6; k++) {
      const a = (k * 360) / 6 + yaw;
      const px = x + Math.sin(a * D) * 0.0085, pz = z + Math.cos(a * D) * 0.0085;
      stat(col, new THREE.SphereGeometry(1, 5, 3), [px, G + h, pz], Q(a, 0, -25), [0.0075, 0.0038, 0.0068]);
    }
    stat("#ffc83d", new THREE.SphereGeometry(0.0062, 5, 3), [x, G + h + 0.002, z]);
  }
  // flower and grass cards
  {
    const spots: Array<[number, number]> = [];
    for (let i = 0; i < 34; i++) {
      const at = pick(props, 0.02, 0.05, 0.1, 0.4);
      if (at) spots.push(at);
    }
    const flowerFrames = spots.map(([x, z]) => frame([x, G, z], [0, 1, 0]));
    b.cards(flowerFrames, T.flowers, { size: [0.036, 0.072], vary: 0.3, spin: 180, rng: rng(31), cross: true, flow: [0, 0, 1], bone: base, sink: 0.04 });
    const tufts: Array<[number, number]> = [];
    for (let i = 0; i < 56; i++) {
      const at = pick(tuftList, 0.0, 0.03, 0.03, 0.4);
      if (at) tufts.push(at);
    }
    b.cards(tufts.map(([x, z]) => frame([x, G, z], [0, 1, 0])), T.grass, { size: [0.06, 0.05], vary: 0.35, spin: 180, rng: rng(41), cross: true, flow: [0, 0, 1], bone: base, sink: 0.08 });
    // grass round the feet of the houses
    const hug: Array<[number, number]> = [];
    for (const h of houseAnchor) for (let k = 0; k < 10; k++) {
      const a = R(0, TAU), r = h.r + R(-0.01, 0.03);
      const x = h.x + Math.sin(a) * r, z = h.z + Math.cos(a) * r;
      if (pathSamples.every(([px, pz]) => Math.hypot(px - x, pz - z) > 0.05)) hug.push([x, z]);
    }
    b.cards(hug.map(([x, z]) => frame([x, G, z], [0, 1, 0])), T.grass, { size: [0.05, 0.042], vary: 0.3, spin: 180, rng: rng(51), cross: true, flow: [0, 0, 1], bone: base, sink: 0.08 });
  }

  // ------------------------------------------------------------ fireflies
  {
    const fly: V3[] = [
      [-0.05, 0.3, 0.2], [0.12, 0.42, 0.3], [0.05, 0.2, 0.08], [0.0, 0.5, -0.42], [0.18, 0.5, -0.3], [-0.4, 0.22, 0.3],
      [0.36, 0.22, 0.27], [-0.2, 0.36, 0.36], [0.42, 0.42, -0.12], [-0.38, 0.5, -0.3], [0.08, 0.6, 0.3], [-0.46, 0.3, -0.05],
    ];
    const geos = fly.map(([x, y, z]) => new THREE.SphereGeometry(0.0085, 6, 4).translate(x, y, z).toNonIndexed());
    glow(b.part(mergeGeometries(geos)!, FIRE, { bone: base, at: [0, 0, 0], flat: true }), 1.5);
    glow(b.cards(fly.map(([x, y, z]) => frame([x, y - 0.022, z], [0, 1, 0])), T.sparkle, { size: 0.044, vary: 0.25, rng: rng(61), cross: true, flow: [0, 0, 1], bone: base, sink: 0 }), 1.2);
  }

  // ------------------------------------------------------------ butterflies: flat wing cards resting in the air
  {
    const spots: Array<[number, number, number]> = [[0.0, 0.2, 0.33], [-0.23, 0.21, 0.3], [0.32, 0.19, 0.12], [-0.04, 0.16, 0.06], [0.1, 0.17, -0.3]];
    b.cards(spots.map(([x, y, z]) => frame([x, y, z], [0, 1, 0])), T.butterflies, {
      size: 0.04,
      lean: 55,
      flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3) + 0.6],
      rng: rng(71),
      vary: 0.15,
      bone: base,
      sink: 0,
    });
  }

  // ------------------------------------------------------------ frogs
  function frog(P: string, ox: number, oy: number, oz: number, yaw: number, o: { skin: string; belly: string; spot: THREE.Texture; wave?: boolean; happy?: boolean; hat?: boolean }) {
    const K = 0.82;
    const q = Q(yaw);
    const W = (x: number, y: number, z: number): V3 => {
      const v = new THREE.Vector3(x * K, y * K, z * K).applyQuaternion(q);
      return [ox + v.x, oy + v.y, oz + v.z];
    };
    const sc = (x: number, y: number, z: number): V3 => [x * K, y * K, z * K];
    const hips = b.joint(`${P}Hips`, { parent: base, at: W(0, 0.03, -0.014), aim: W(0, 0.04, 0.018), role: "spine" });
    const chest = b.joint(`${P}Chest`, { parent: hips, at: W(0, 0.04, 0.018), aim: W(0, 0.052, 0.04), role: "spine" });
    const head = b.joint(`${P}Head`, { parent: chest, at: W(0, 0.052, 0.04), aim: W(0, 0.056, 0.07), role: "head" });
    const jaw = b.joint(`${P}Jaw`, { parent: head, at: W(0, 0.0508, 0.012), aim: W(0, 0.0495, 0.07), role: "jaw" });
    const part = (g: THREE.BufferGeometry, c: string, bone: typeof hips, at: V3, scale: V3 | number = 1, quat = q) =>
      b.part(g, c, { bone, at, flat: true, scale, quat });

    const body = part(new THREE.SphereGeometry(1, 8, 6), o.skin, hips, W(0, 0.033, -0.004), sc(0.036, 0.032, 0.042));
    part(new THREE.SphereGeometry(1, 7, 5), o.belly, chest, W(0, 0.027, 0.018), sc(0.027, 0.025, 0.028));
    // head: an upper skull cut at the mouth line, a dark mouth floor, and a separate lower jaw
    const skull = part(new THREE.SphereGeometry(1, 8, 6, 0, TAU, 0, Math.PI * 0.58), o.skin, head, W(0, 0.058, 0.04), sc(0.047, 0.03, 0.037));
    part(new THREE.CircleGeometry(1, 8).rotateX(Math.PI / 2), "#c24a6e", head, W(0, 0.0508, 0.04), sc(0.0455, 1, 0.0358));
    part(new THREE.SphereGeometry(1, 8, 3, 0, TAU, Math.PI / 2, Math.PI / 2), o.belly, jaw, W(0, 0.0508, 0.04), sc(0.0448, 0.019, 0.0352));
    // eyes: white balls with an eyelid and a drawn pupil
    for (const s of [1, -1]) {
      const eyeAt = W(s * 0.028, 0.087, 0.042);
      const ball = part(new THREE.SphereGeometry(0.02 * K, 7, 5), EYE_WHITE, head, eyeAt);
      part(new THREE.SphereGeometry(0.0208 * K, 7, 3, 0, TAU, 0, Math.PI * 0.3), o.skin, head, eyeAt, 1, q.clone().multiply(Q(0, -8)));
      const eyeSkin = b.surface(ball);
      const hit = eyeSkin.around(eyeAt).at(yaw + s * 6, 6);
      if (hit) b.decal(eyeSkin, o.happy ? T.eyeHappy : T.eye, { at: hit, size: [0.0245, 0.0245], segments: 4, lift: 0.0012, bone: head });
    }
    // smile, cheeks and nostrils
    const headSkin = b.surface(skull);
    const smile = headSkin.around(W(0, 0.058, 0.04)).at(yaw, 3);
    if (smile) b.decal(headSkin, T.smile, { at: smile, size: [0.042, 0.0158], segments: 6, lift: 0.0018, bone: head });
    for (const s of [1, -1]) {
      const cheek = headSkin.around(W(0, 0.058, 0.04)).at(yaw + s * 58, 8);
      if (cheek) b.decal(headSkin, T.blush, { at: cheek, size: [0.017, 0.01], segments: 4, lift: 0.0018, bone: head });
      part(new THREE.SphereGeometry(0.0028 * K, 4, 3), INK, head, W(s * 0.008, 0.071, 0.074));
    }
    // back spots
    const backSkin = b.surface(body);
    for (const [az, el, sz] of [[-28, 62, 0.018], [32, 55, 0.014], [-10, 40, 0.012], [150, 50, 0.016]] as Array<[number, number, number]>) {
      const hit = backSkin.around(W(0, 0.033, -0.004)).at(yaw + az, el);
      if (hit) b.decal(backSkin, o.spot, { at: hit, size: [sz * K * 1.6, sz * K * 1.6], segments: 3, lift: 0.0015, bone: hips });
    }
    // arms and legs
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const waving = o.wave && s > 0;
      const arm = b.chain(
        `${P}Arm${side}`,
        waving
          ? [W(s * 0.032, 0.038, 0.028), W(s * 0.056, 0.05, 0.038), W(s * 0.062, 0.076, 0.046)]
          : [W(s * 0.032, 0.036, 0.028), W(s * 0.043, 0.02, 0.036), W(s * 0.038, 0.006, 0.055)],
        { parent: chest, names: [`${P}Shoulder${side}`, `${P}Elbow${side}`, `${P}Hand${side}`], role: "arm" },
      );
      b.sweep(arm, [0.0105 * K, 0.008 * K, 0.0075 * K], { skin: "rigid", smooth: false, sides: 5, color: o.skin });
      const hand = arm.joints[arm.joints.length - 1];
      const hp = waving ? W(s * 0.062, 0.08, 0.048) : W(s * 0.038, 0.007, 0.06);
      part(new THREE.SphereGeometry(0.0115 * K, 5, 4), o.skin, hand, hp, [1.1, 0.6, 1.1]);
      for (const f of [-1, 0, 1]) {
        const p = waving ? W(s * 0.062 + f * 0.0085, 0.091, 0.05) : W(s * 0.038 + f * 0.0085, 0.006, 0.071);
        part(new THREE.SphereGeometry(0.0055 * K, 5, 3), o.skin, hand, p);
      }

      const hindPts: V3[] = [W(s * 0.033, 0.031, -0.02), W(s * 0.054, 0.042, 0.004), W(s * 0.047, 0.011, -0.038), W(s * 0.053, 0.005, 0.022)];
      const leg = b.chain(`${P}Leg${side}`, hindPts, {
        parent: hips,
        names: [`${P}Hip${side}`, `${P}Knee${side}`, `${P}Ankle${side}`, `${P}Toe${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.017 * K, 0.0125 * K, 0.0085 * K, 0.0075 * K], { skin: "rigid", smooth: false, sides: 5, color: o.skin });
      const foot = leg.joints[leg.joints.length - 1];
      part(new THREE.SphereGeometry(0.0145 * K, 6, 4), o.skin, leg.joints[0], W(s * 0.046, 0.031, -0.018));
      for (const f of [-1, 0, 1]) part(new THREE.SphereGeometry(0.0062 * K, 5, 3), o.skin, foot, W(s * 0.053 + f * 0.0115, 0.0055, 0.03 + (f === 0 ? 0.004 : 0)), [1, 0.7, 1.2]);
    }
    if (o.hat) {
      // a seedling growing from the crown: a stalk and two leaf cards
      part(new THREE.CylinderGeometry(0.0022 * K, 0.0032 * K, 0.02 * K, 4), LEAF_D, head, W(0, 0.0965, 0.03));
      for (const s of [1, -1]) {
        b.cards([frame(W(0, 0.104, 0.03), [0, 1, 0])], T.leaf, { size: [0.03, 0.038], lean: 58, flow: [s, 0, 0.25], mirror: s > 0, bone: head, sink: 0, bend: 20, cross: true });
      }
    }
    return { head, jaw };
  }
  frog("frogA", WX, WRIM, WZ + 0.072, 12, { skin: FROG_A, belly: FROG_A_BELLY, spot: T.frogSpotA, wave: true });
  frog("frogB", -0.1, G, 0.37, 24, { skin: FROG_B, belly: FROG_B_BELLY, spot: T.frogSpotB, happy: true, hat: true });

  // ------------------------------------------------------------ flush the merged statics
  for (const [color, geos] of buckets) b.part(mergeGeometries(geos)!, color, { bone: base, at: [0, 0, 0], flat: true });

  return b.root;
}
