// A Norse longship pulled up on a shingle beach: flat low-poly, clinker strakes, dragon prow, striped sail.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { bezier, catmull, polyline, spiral } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Viking Longship",
  description:
    "A three-metre clinker-built longship beached on shingle: carved dragon prow and curled stern, striped square sail on a jointed yard, painted shields, run-out oars and a steering oar.",
};

// Palette
const TAR = "#47301f";
const OAK = "#7b5533";
const OAK_LIGHT = "#a67e4d";
const PALE_WOOD = "#b99a68";
const RED = "#a3302a";
const CREAM = "#e6d9b0";
const GOLD = "#d1a23a";
const IRON = "#72777d";
const HEMP = "#b89a62";
const HEMP_DARK = "#8a6d3c";
const BONE = "#eadfc2";
const EYE = "#f0c640";
const DARK = "#1d140e";
const DRIFT = "#8d8474";

// Ship frame: length along z (bow at +z), keel resting on the beach.
const YS = 0.075; // keel underside
const ZE = 1.25; // hull ends (stem feet) at z = ±ZE
const N_STRAKES = 6;
const SHEER_DEPTH = 0.4;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const smooth01 = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Hull surface functions -------------------------------------------------------------------------
const beam = (u: number) => 0.43 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.4)), 0.7);
const keelY = (u: number) => {
  const a = Math.abs(u);
  return a < 0.45 ? 0 : 0.3 * Math.pow((a - 0.45) / 0.55, 2.2);
};
const sheerY = (u: number) => SHEER_DEPTH + 0.26 * Math.pow(Math.abs(u), 2.5);
const flare = (f: number) => 0.1 + 0.9 * (2 * f - f * f);
/** Point on the hull shell at height share f (0 keel .. 1 gunwale), station u (-1 stern .. 1 bow), side s (+1 left). */
const hp = (f: number, u: number, s = 1) => {
  const k = keelY(u);
  return V(s * beam(u) * flare(f), YS + k + f * (sheerY(u) - k), u * ZE);
};
/** Outward unit normal of the shell in the cross-section plane. */
const outN = (f: number, u: number, s = 1) => {
  const a = hp(Math.max(0, f - 0.02), u, 1);
  const b = hp(Math.min(1, f + 0.02), u, 1);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return V((s * dy) / len, -dx / len, 0);
};
/** Fully 3D outward normal (includes the slope along the hull). */
const outN3 = (f: number, u: number, s = 1) => {
  const pf = hp(Math.min(1, f + 0.02), u, s).sub(hp(Math.max(0, f - 0.02), u, s));
  const pu = hp(f, u + 0.02, s).sub(hp(f, u - 0.02, s));
  const n = pu.cross(pf).normalize();
  return n.x * s >= 0 ? n : n.negate();
};
/** Half width of the hull interior at absolute height y, station u. */
const innerHalf = (y: number, u: number) => {
  const k = keelY(u);
  const f = Math.min(1, Math.max(0, (y - YS - k) / (sheerY(u) - k)));
  return Math.max(0.03, beam(u) * flare(f) - 0.014);
};

// Beach ------------------------------------------------------------------------------------------
const BX = 1.5;
const BZ = 2.0;
const BH = 0.092;
const beachH = (x: number, z: number) => {
  const e = Math.pow(Math.pow(Math.abs(x) / BX, 3) + Math.pow(Math.abs(z) / BZ, 3), 1 / 3);
  const fall = 1 - smooth01(0.6, 1, e);
  const rough = 0.007 * Math.sin(x * 9.1 + z * 4.3) + 0.006 * Math.sin(x * 3.7 - z * 8.3 + 1.2) + 0.005 * Math.sin(z * 13 + x * 2);
  return Math.max(0, fall * (BH + rough));
};

/** A tube of quads between rings of section vertices, winding fixed so every face points out. */
type RingVertex = { p: THREE.Vector3; u: number; v: number };
function ribbon(rings: RingVertex[][]) {
  const pos: number[] = [];
  const uv: number[] = [];
  const centre = (r: RingVertex[]) => r.reduce((c, q) => c.add(q.p), V(0, 0, 0)).multiplyScalar(1 / r.length);
  const centres = rings.map(centre);
  const tri = (a: RingVertex, b: RingVertex, c: RingVertex, outward: THREE.Vector3) => {
    const n = b.p.clone().sub(a.p).cross(c.p.clone().sub(a.p));
    if (n.dot(outward) < 0) [b, c] = [c, b];
    for (const q of [a, b, c]) {
      pos.push(q.p.x, q.p.y, q.p.z);
      uv.push(q.u, q.v);
    }
  };
  const m = rings[0].length;
  for (let i = 0; i < rings.length - 1; i++) {
    const mid = centres[i].clone().add(centres[i + 1]).multiplyScalar(0.5);
    for (let j = 0; j < m; j++) {
      const a = rings[i][j];
      const b = rings[i][(j + 1) % m];
      const c = rings[i + 1][(j + 1) % m];
      const d = rings[i + 1][j];
      const out = a.p.clone().add(b.p).add(c.p).add(d.p).multiplyScalar(0.25).sub(mid);
      tri(a, b, c, out);
      tri(a, c, d, out);
    }
  }
  const cap = (ring: RingVertex[], out: THREE.Vector3) => {
    for (let j = 1; j < m - 1; j++) tri(ring[0], ring[j], ring[j + 1], out);
  };
  const last = rings.length - 1;
  cap(rings[0], centres[0].clone().sub(centres[1]));
  cap(rings[last], centres[last].clone().sub(centres[last - 1]));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

/** Cone (or any +Y geometry) carried to model space: base at `at`, pointing along `dir`. */
const oriented = (g: THREE.BufferGeometry, at: THREE.Vector3, dir: THREE.Vector3) => {
  g.applyQuaternion(aim(dir));
  g.translate(at.x, at.y, at.z);
  return g;
};
const tooth = (base: THREE.Vector3, dir: THREE.Vector3, h: number, r: number) =>
  oriented(new THREE.ConeGeometry(r, h, 3).translate(0, h / 2, 0), base, dir);

// Drawings ---------------------------------------------------------------------------------------
function plankDrawing() {
  const rivets: string[] = [];
  for (let x = 6; x < 512; x += 10) rivets.push(`<circle cx="${x}" cy="27" r="2" fill="#7e7e7e"/>`);
  return svg(
    `<svg viewBox="0 0 512 32" xmlns="http://www.w3.org/2000/svg">
<rect width="512" height="32" fill="#f3f3f3"/>
<path d="M0 6 C120 3 200 9 300 6 S460 4 512 7" stroke="#d3d3d3" stroke-width="1.6" fill="none"/>
<path d="M0 12 C90 15 220 10 330 13 S450 15 512 12" stroke="#dcdcdc" stroke-width="1.6" fill="none"/>
<path d="M0 18 C100 16 180 20 290 18 S430 16 512 19" stroke="#d3d3d3" stroke-width="1.6" fill="none"/>
<path d="M0 23 C140 25 240 21 340 23 S470 25 512 22" stroke="#dcdcdc" stroke-width="1.6" fill="none"/>
<ellipse cx="96" cy="14" rx="9" ry="3.4" fill="#c4c4c4"/><ellipse cx="96" cy="14" rx="4" ry="1.4" fill="#adadad"/>
<ellipse cx="350" cy="11" rx="8" ry="3" fill="#c7c7c7"/><ellipse cx="350" cy="11" rx="3.4" ry="1.3" fill="#b1b1b1"/>
<rect x="170" y="0" width="2.4" height="32" fill="#b3b3b3"/>
<rect x="392" y="0" width="2.4" height="32" fill="#b3b3b3"/>
<polygon points="210,32 222,20 236,32" fill="#cfcfcf"/>
<polygon points="430,0 440,9 452,0" fill="#d0d0d0"/>
<rect x="0" y="29.5" width="512" height="2.5" fill="#bdbdbd"/>
<rect x="0" y="0" width="512" height="1.4" fill="#ffffff"/>
${rivets.join("")}
</svg>`,
    { size: 1024 },
  );
}

function woodDrawing() {
  return svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
<rect width="128" height="32" fill="#f1f1f1"/>
<path d="M0 6 C40 4 80 8 128 5" stroke="#d6d6d6" stroke-width="1.6" fill="none"/>
<path d="M0 13 C30 15 90 11 128 14" stroke="#dcdcdc" stroke-width="1.6" fill="none"/>
<path d="M0 21 C50 19 70 23 128 20" stroke="#d6d6d6" stroke-width="1.6" fill="none"/>
<path d="M0 27 C40 29 90 25 128 28" stroke="#dcdcdc" stroke-width="1.6" fill="none"/>
<ellipse cx="92" cy="16" rx="6" ry="2.4" fill="#c5c5c5"/>
</svg>`,
    { size: 256 },
  );
}

const SHIELD_FACES = [
  // quartered red / cream
  `<rect width="100" height="100" fill="${CREAM}"/><rect width="50" height="50" fill="${RED}"/><rect x="50" y="50" width="50" height="50" fill="${RED}"/>`,
  // concentric rings
  `<rect width="100" height="100" fill="${RED}"/><circle cx="50" cy="50" r="38" fill="${CREAM}"/><circle cx="50" cy="50" r="26" fill="#2f6f73"/>`,
  // eight yellow / black wedges
  [0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => {
      const a0 = (i * Math.PI) / 4;
      const a1 = ((i + 1) * Math.PI) / 4;
      const pt = (a: number) => `${(50 + 80 * Math.cos(a)).toFixed(1)} ${(50 + 80 * Math.sin(a)).toFixed(1)}`;
      return `<path d="M50 50 L${pt(a0)} L${pt(a1)} Z" fill="${i % 2 ? DARK : GOLD}"/>`;
    })
    .join(""),
  // teal and cream halves, red bar
  `<rect width="100" height="100" fill="#2f6f73"/><rect x="50" width="50" height="100" fill="${CREAM}"/><rect y="42" width="100" height="16" fill="${RED}"/>`,
  // ochre with red cross
  `<rect width="100" height="100" fill="${GOLD}"/><rect x="40" width="20" height="100" fill="${RED}"/><rect y="40" width="100" height="20" fill="${RED}"/>`,
  // dark with cream sunburst triangles
  `<rect width="100" height="100" fill="#3c2f2a"/><path d="M50 4 L62 50 L50 96 L38 50 Z" fill="${CREAM}"/><path d="M4 50 L50 38 L96 50 L50 62 Z" fill="${CREAM}"/>`,
];
const shieldDrawing = (face: string) =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${face}<circle cx="50" cy="50" r="49" fill="none" stroke="${DARK}" stroke-width="3.4"/><circle cx="50" cy="50" r="11" fill="${IRON}"/><circle cx="50" cy="50" r="11" fill="none" stroke="${DARK}" stroke-width="2.6"/></svg>`,
    { size: 128 },
  );

function sailDrawing() {
  const bands: string[] = [];
  for (let i = 0; i < 12; i += 2) bands.push(`<rect x="${i * 10}" y="0" width="10" height="92" fill="${RED}"/>`);
  const diag: string[] = [];
  for (let x = -92; x < 130; x += 28) {
    diag.push(`M${x} 0 L${x + 92} 92`);
    diag.push(`M${x + 92} 0 L${x} 92`);
  }
  return svg(
    `<svg viewBox="0 0 120 92" xmlns="http://www.w3.org/2000/svg">
<rect width="120" height="92" fill="${CREAM}"/>
${bands.join("")}
<path d="${diag.join(" ")}" stroke="${HEMP_DARK}" stroke-width="1.1" fill="none"/>
<path d="M0 30 L120 30 M0 60 L120 60" stroke="#6b4a2b" stroke-width="1.3" fill="none"/>
<polygon points="0,84 14,80 24,86 38,81 52,87 66,82 80,86 96,80 110,86 120,82 120,92 0,92" fill="#c9b98c"/>
<polygon points="0,0 16,6 30,2 46,8 60,3 76,7 92,2 106,7 120,3 120,0" fill="#c9b98c"/>
<rect x="34" y="20" width="15" height="13" fill="#d9cda6" stroke="#6b4a2b" stroke-width="0.9" stroke-dasharray="2 1.4"/>
<rect x="75" y="52" width="13" height="15" fill="#8e2a25" stroke="#6b4a2b" stroke-width="0.9" stroke-dasharray="2 1.4"/>
<rect x="8" y="58" width="11" height="10" fill="#d9cda6" stroke="#6b4a2b" stroke-width="0.9" stroke-dasharray="2 1.4"/>
<polygon points="100,34 106,40 103,48 97,44" fill="#b9a772"/>
<rect x="1.2" y="0.8" width="117.6" height="90.4" fill="none" stroke="#5b3c22" stroke-width="1.8"/>
</svg>`,
    { size: 960 },
  );
}

function barrelDrawing() {
  const staves: string[] = [];
  for (let i = 0; i < 8; i++)
    staves.push(`<rect x="${i * 10}" y="0" width="10" height="40" fill="${i % 2 ? "#8a6036" : "#9a6d40"}"/>`);
  return svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
${staves.join("")}
<rect y="0" width="80" height="6" fill="#5e4026"/><rect y="34" width="80" height="6" fill="#5e4026"/>
<path d="M10 0V40M20 0V40M30 0V40M40 0V40M50 0V40M60 0V40M70 0V40" stroke="#3f2a19" stroke-width="1.1" fill="none"/>
<rect y="23.5" width="80" height="5" fill="#4a4d52"/><rect y="10.5" width="80" height="5" fill="#4a4d52"/>
<rect y="23.5" width="80" height="1.4" fill="#787d83"/><rect y="10.5" width="80" height="1.4" fill="#787d83"/>
</svg>`,
    { size: 320 },
  );
}

function chestDrawing() {
  return svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
<rect width="64" height="32" fill="#7d5733"/>
<path d="M8 0V32M16 0V32M24 0V32M32 0V32M40 0V32M48 0V32M56 0V32" stroke="#5a3d22" stroke-width="1.2" fill="none"/>
<rect x="6" width="5" height="32" fill="#3f4246"/><rect x="53" width="5" height="32" fill="#3f4246"/>
<rect x="0" width="64" height="3.4" fill="#3f4246"/><rect x="0" y="28.6" width="64" height="3.4" fill="#3f4246"/>
<rect x="28" y="10" width="8" height="10" fill="${GOLD}"/><circle cx="32" cy="14.5" r="1.8" fill="${DARK}"/>
</svg>`,
    { size: 256 },
  );
}

const spiralDrawing = () =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<path d="M32 32 A3 3 0 0 1 38 32 A6 6 0 0 1 26 32 A9 9 0 0 1 44 32 A12 12 0 0 1 20 32 A15 15 0 0 1 50 32" fill="none" stroke="${GOLD}" stroke-width="3.4" stroke-linecap="round"/>
<circle cx="35" cy="32" r="2.4" fill="${RED}"/>
<path d="M50 32 C56 30 60 24 58 18" fill="none" stroke="${GOLD}" stroke-width="3.4" stroke-linecap="round"/>
</svg>`,
    { size: 192 },
  );

const maneDrawing = () =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
<path d="M3 64 C0 40 6 14 22 0 C22 22 30 40 29 64 Z" fill="${GOLD}"/>
<path d="M9 64 C8 44 12 26 20 14 C20 32 25 46 24 64 Z" fill="${RED}"/>
<path d="M14 64 C14 52 16 42 19 34 C20 46 21 54 20 64 Z" fill="#7d1f1b"/>
</svg>`,
    { size: 128 },
  );

const grassDrawing = () =>
  svg(
    `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
<path d="M6 64 C8 42 6 24 2 8 C12 22 16 42 16 64 Z" fill="#7a8f3f"/>
<path d="M14 64 C16 36 18 18 24 0 C30 20 30 40 28 64 Z" fill="#94a84c"/>
<path d="M26 64 C28 44 34 30 46 16 C42 34 40 50 40 64 Z" fill="#6c8238"/>
<path d="M19 64 C20 50 26 40 34 34 C30 46 30 56 30 64 Z" fill="#b6b35a"/>
</svg>`,
    { size: 192 },
  );

const foamDrawing = () =>
  svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
<path d="M2 18 C4 8 12 6 16 12 C18 4 28 2 32 10 C36 3 46 4 48 12 C54 8 62 12 62 20 C56 26 50 22 46 26 C40 30 36 24 30 28 C24 30 20 24 14 26 C8 28 2 24 2 18 Z" fill="#eef5f3"/>
<path d="M12 18 C14 13 20 12 22 16 C26 11 34 12 36 17 C40 14 48 16 50 20 C44 24 40 21 36 24 C30 26 28 22 22 24 C18 25 12 23 12 18 Z" fill="#c5dcdc"/>
</svg>`,
    { size: 256 },
  );

const tasselDrawing = () =>
  svg(
    `<svg viewBox="0 0 12 40" xmlns="http://www.w3.org/2000/svg">
<rect x="4" y="0" width="4" height="8" fill="${HEMP_DARK}"/>
<path d="M4 8 L8 8 L11 40 L7 34 L6 40 L5 34 L1 40 Z" fill="${RED}"/>
<path d="M5.5 8 L6.5 8 L6.3 30 L5.7 30 Z" fill="#7d1f1b"/>
</svg>`,
    { size: 120 },
  );

function shingleDrawing() {
  const W = 300;
  const H = 400;
  const r = rng(11);
  const rho = (ux: number, uy: number) => {
    const x = (ux / W - 0.5) * 2 * BX;
    const z = (uy / H - 0.5) * 2 * BZ;
    return Math.pow(Math.pow(Math.abs(x) / BX, 3) + Math.pow(Math.abs(z) / BZ, 3), 1 / 3);
  };
  const ring = (rh: number, wobble: number) =>
    Array.from({ length: 72 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const k = rh * (1 + wobble * Math.sin(a * 7 + rh * 9));
      const x = BX * Math.sign(c) * Math.pow(Math.abs(c), 2 / 3) * k;
      const z = BZ * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / 3) * k;
      return `${((x / (2 * BX) + 0.5) * W).toFixed(1)},${((z / (2 * BZ) + 0.5) * H).toFixed(1)}`;
    }).join(" ");
  const dry = ["#8d8880", "#a39b8d", "#6f6b66", "#b8ad98", "#7a7468", "#c4baa4", "#5f5c58", "#9a8f7a", "#857c6c"];
  const wet = ["#6a665f", "#7a756c", "#56534f", "#85807a", "#6d675b"];
  const out: string[] = [];
  for (let i = 0; i < 2100; i++) {
    const x = r() * W;
    const y = r() * H;
    const rh = rho(x, y);
    if (rh > 1.02) continue;
    const rx = 1.5 + r() * 2.3;
    const ry = rx * (0.6 + r() * 0.35);
    const rot = Math.floor(r() * 180);
    const tones = rh > 0.88 ? wet : dry;
    const c = tones[Math.floor(r() * tones.length)];
    const tf = `transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})"`;
    if (i % 3 === 0)
      out.push(`<ellipse cx="${(x + 0.6).toFixed(1)}" cy="${(y + 0.8).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" ${tf} fill="#3f3d39"/>`);
    out.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" ${tf} fill="${c}"/>`);
  }
  const weed: string[] = [];
  const kelp = ["#4c5a2e", "#3b4526", "#62552f"];
  for (let i = 0; i < 70; i++) {
    const x = r() * W;
    const y = r() * H;
    const rh = rho(x, y);
    if (rh < 0.9 || rh > 0.99) continue;
    const rx = 4 + r() * 6;
    weed.push(
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(1 + r() * 0.9).toFixed(1)}" transform="rotate(${Math.floor(r() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${kelp[i % 3]}"/>`,
    );
  }
  return svg(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#6b665c"/><polygon points="${ring(1.05, 0.02)}" fill="#6a665d"/><polygon points="${ring(0.9, 0.05)}" fill="#7d776b"/>${out.join("")}${weed.join("")}</svg>`,
    { size: 1536 },
  );
}

export default function build() {
  const b = createBuilder({ name: "vikingLongship" });
  const hull = b.joint("hull", { at: [0, YS + 0.15, 0] });
  const R = (x: number, y: number, z: number) => V(x, YS + y, z);

  // ---- Beach -------------------------------------------------------------------------------
  {
    const pos: number[] = [];
    const uv: number[] = [];
    const jr = rng(5);
    const SECT = 28;
    const RINGS = 9;
    const grid: THREE.Vector3[][] = [];
    for (let k = 0; k <= RINGS; k++) {
      const rho = k / RINGS;
      const row: THREE.Vector3[] = [];
      for (let i = 0; i < SECT; i++) {
        const a = (i / SECT) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        let x = BX * Math.sign(c) * Math.pow(Math.abs(c), 2 / 3) * rho;
        let z = BZ * Math.sign(s) * Math.pow(Math.abs(s), 2 / 3) * rho;
        if (k > 0 && k < RINGS) {
          x += (jr() - 0.5) * 0.12;
          z += (jr() - 0.5) * 0.12;
        }
        row.push(V(x, k === RINGS ? 0 : beachH(x, z), z));
      }
      grid.push(row);
    }
    const push = (p: THREE.Vector3) => {
      pos.push(p.x, p.y, p.z);
      uv.push((p.x + BX) / (2 * BX), (p.z + BZ) / (2 * BZ));
    };
    const up = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) => {
      const n = bb.clone().sub(a).cross(c.clone().sub(a));
      if (n.y < 0) [bb, c] = [c, bb];
      push(a);
      push(bb);
      push(c);
    };
    for (let k = 0; k < RINGS; k++)
      for (let i = 0; i < SECT; i++) {
        const j = (i + 1) % SECT;
        up(grid[k][i], grid[k][j], grid[k + 1][j]);
        if (k > 0) up(grid[k][i], grid[k + 1][j], grid[k + 1][i]);
        else up(grid[0][i], grid[1][j], grid[1][i]);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    b.part(g, "#ffffff", { bone: hull, at: [0, 0, 0], texture: shingleDrawing(), flat: true, name: "shingle" });

    // loose pebbles
    const pr = rng(21);
    const tones = ["#8f8a82", "#6b6760", "#b3a991", "#77705f"];
    const groups: THREE.BufferGeometry[][] = tones.map(() => []);
    for (let i = 0; i < 70; i++) {
      const x = (pr() * 2 - 1) * BX * 0.92;
      const z = (pr() * 2 - 1) * BZ * 0.92;
      const e = Math.pow(Math.pow(Math.abs(x) / BX, 3) + Math.pow(Math.abs(z) / BZ, 3), 1 / 3);
      if (e > 0.92 || (Math.abs(x) < 0.2 && Math.abs(z) < 1.3)) continue;
      const r = (0.018 + pr() * 0.028) * (i % 9 === 0 ? 2.2 : 1);
      const g2 = new THREE.OctahedronGeometry(1, 0);
      g2.scale(r, r * 0.5, r * (1 + pr() * 0.4));
      g2.rotateY(pr() * 3);
      g2.translate(x, beachH(x, z) + r * 0.42, z);
      groups[i % tones.length].push(g2);
    }
    groups.forEach((list, i) => {
      if (list.length) b.part(mergeGeometries(list)!, tones[i], { bone: hull, at: [0, 0, 0], flat: true, name: "pebbles" });
    });

    // beach grass and foam
    const gr = rng(33);
    const tufts: THREE.Vector3[] = [];
    while (tufts.length < 34) {
      const x = (gr() * 2 - 1) * BX;
      const z = (gr() * 2 - 1) * BZ;
      const e = Math.pow(Math.pow(Math.abs(x) / BX, 3) + Math.pow(Math.abs(z) / BZ, 3), 1 / 3);
      if (e < 0.62 || e > 0.86 || x < -0.5) continue;
      tufts.push(V(x, beachH(x, z), z));
    }
    b.cards(tufts.map((p) => frame(p, [0, 1, 0])), grassDrawing(), {
      size: [0.09, 0.15],
      lean: 12,
      vary: 0.35,
      spin: 180,
      cross: true,
      rng: rng(34),
      bone: hull,
    });
    const foam: THREE.Vector3[] = [];
    const fr = rng(41);
    for (let i = 0; i < 12; i++) {
      const z = -1.7 + i * 0.3 + fr() * 0.1;
      const x = -BX * 0.96 + fr() * 0.14;
      foam.push(V(x, 0.004 + fr() * 0.003, z));
    }
    b.cards(foam.map((p) => frame(p, [0, 1, 0])), foamDrawing(), {
      size: [0.3, 0.15],
      lean: 90,
      flow: [1, 0, 0],
      mirror: true,
      vary: 0.3,
      rng: rng(42),
      bone: hull,
    });
  }

  // ---- Clinker strakes ---------------------------------------------------------------------
  const plank = plankDrawing();
  const strakeColors = ["#5a3c27", "#8a6038", "#5a3c27", "#8a6038", RED, "#8a6038"];
  const STATIONS = 21;
  for (const s of [1, -1])
    for (let k = 0; k < N_STRAKES; k++) {
      const f0 = k / N_STRAKES;
      const f1 = (k + 1) / N_STRAKES;
      const f1o = k === N_STRAKES - 1 ? 1 : f1 + 0.035;
      const rings: RingVertex[][] = [];
      for (let i = 0; i < STATIONS; i++) {
        const u = (i / (STATIONS - 1)) * 2 - 1;
        const uu = i / (STATIONS - 1);
        const n0 = outN(f0, u, s);
        const n1 = outN(f1o, u, s);
        rings.push([
          { p: hp(f0, u, s).addScaledVector(n0, -0.006), u: uu, v: 0 },
          { p: hp(f0, u, s).addScaledVector(n0, 0.014), u: uu, v: 0 },
          { p: hp(f1o, u, s).addScaledVector(n1, 0.004), u: uu, v: 1 },
          { p: hp(f1o, u, s).addScaledVector(n1, -0.006), u: uu, v: 1 },
        ]);
      }
      b.part(ribbon(rings), strakeColors[k], {
        bone: hull,
        at: [0, 0, 0],
        texture: plank,
        flat: true,
        name: `strake${k}${s > 0 ? "L" : "R"}`,
      });
    }

  // keel, stems, rails
  const keelPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = (i / 12) * 2 - 1;
    keelPts.push(V(0, YS + keelY(u) + 0.022, u * ZE));
  }
  b.sweep(catmull(keelPts), () => [0.04, 0.026], { section: "box", caps: "flat", bone: hull, color: TAR });

  for (const s of [1, -1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 1; i < STATIONS - 1; i++) {
      const u = (i / (STATIONS - 1)) * 2 - 1;
      if (Math.abs(u) > 0.96) continue;
      const p = hp(1, u, s);
      p.y += 0.012;
      pts.push(p);
    }
    b.sweep(catmull(pts), () => [0.018, 0.012], { section: "box", caps: "flat", bone: hull, color: OAK_LIGHT });
  }

  // ---- Prow with dragon head, curled stern -------------------------------------------------
  const prowPath = catmull([
    R(0, 0.3, 1.2),
    R(0, 0.42, 1.25),
    R(0, 0.56, 1.31),
    R(0, 0.74, 1.38),
    R(0, 0.92, 1.43),
    R(0, 1.06, 1.46),
    R(0, 1.16, 1.52),
  ]);
  const prow = b.sweep(prowPath, (t) => [0.036 - 0.008 * t, 0.042 - 0.014 * t], {
    section: "box",
    bone: hull,
    caps: "flat",
    color: TAR,
    bands: [
      [0.5, TAR],
      [0.54, GOLD],
      [0.68, TAR],
      [0.72, GOLD],
      [0.84, TAR],
      [0.88, RED],
      [1, TAR],
    ],
  });

  const head = b.joint("prowHead", { parent: hull, at: prowPath.at(1), dir: [0, -0.12, 1], role: "head" });
  const HS = 1.3; // the head is authored at 1x and scaled up here
  const hl = (x: number, y: number, z: number) => head.local([x * HS, y * HS, z * HS]);
  const jaw = b.joint("prowJaw", { parent: head, at: hl(0, -0.03, -0.04), aim: hl(0, 0.2, -0.05), role: "jaw" });
  const cranium = b.capsule(hl(0, -0.075, 0), hl(0, 0.045, 0), [0.058 * HS, 0.05 * HS], {
    bone: head,
    sides: 6,
    smooth: false,
    color: TAR,
  });
  const snoutPath = bezier(hl(0, 0.03, 0), hl(0, 0.14, 0), hl(0, 0.25, 0.045));
  b.sweep(snoutPath, (t) => [(0.04 - 0.018 * t) * HS, (0.034 - 0.014 * t) * HS], {
    section: "box",
    bone: head,
    caps: "flat",
    color: TAR,
    bands: [
      [0.82, TAR],
      [1, RED],
    ],
  });
  b.part(new THREE.SphereGeometry(0.03 * HS, 6, 4), RED, { bone: head, at: snoutPath.at(1).add(head.dir([0, 0.012 * HS, 0.004 * HS])), flat: true });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0075 * HS, 5, 3), "#4e1411", {
      bone: head,
      at: snoutPath.at(1).add(head.dir([s * 0.02 * HS, 0.03 * HS, 0.012 * HS])),
      flat: true,
    });
  const lowerPath = bezier(hl(0, -0.05, -0.05), hl(0, 0.08, -0.058), hl(0, 0.21, -0.03));
  b.sweep(lowerPath, (t) => [(0.032 - 0.013 * t) * HS, (0.018 - 0.006 * t) * HS], {
    section: "box",
    bone: jaw,
    caps: "flat",
    color: OAK,
  });
  b.sweep(bezier(hl(0, 0, -0.03), hl(0, 0.1, -0.038), hl(0, 0.19, -0.027)), (t) => [(0.016 - 0.008 * t) * HS, 0.004 * HS], {
    section: "box",
    bone: jaw,
    caps: "flat",
    color: RED,
  });
  // teeth
  const down = head.dir([0, 0, -1]);
  const upDir = head.dir([0, 0, 1]);
  const upperTeeth: THREE.BufferGeometry[] = [];
  const lowerTeeth: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const t = 0.3 + i * 0.16;
      const c = snoutPath.at(t);
      const w = (0.04 - 0.018 * t - 0.007) * HS;
      const ry = (0.034 - 0.014 * t) * HS;
      upperTeeth.push(
        tooth(c.clone().addScaledVector(head.dir([s, 0, 0]), w).addScaledVector(down, ry * 0.9), down, (0.032 - 0.008 * t) * HS, 0.007 * HS),
      );
      const c2 = lowerPath.at(t * 0.95 + 0.03);
      const w2 = (0.032 - 0.013 * t - 0.006) * HS;
      const ry2 = (0.018 - 0.006 * t) * HS;
      lowerTeeth.push(
        tooth(c2.clone().addScaledVector(head.dir([s, 0, 0]), w2).addScaledVector(upDir, ry2 * 0.9), upDir, 0.024 * HS, 0.0065 * HS),
      );
    }
  b.part(mergeGeometries(upperTeeth)!, BONE, { bone: head, at: [0, 0, 0], flat: true });
  b.part(mergeGeometries(lowerTeeth)!, BONE, { bone: jaw, at: [0, 0, 0], flat: true });
  for (const s of [1, -1]) {
    const eyeAt = hl(s * 0.05, 0.03, 0.03);
    b.part(new THREE.SphereGeometry(0.021 * HS, 6, 4), EYE, { bone: head, at: eyeAt, flat: true });
    const gaze = head.dir([s * 0.8, 0.3, 0.25]).normalize();
    b.part(new THREE.CircleGeometry(0.0095 * HS, 6), DARK, {
      bone: head,
      at: eyeAt.clone().addScaledVector(gaze, 0.0205 * HS),
      dir: gaze,
      axis: "z",
    });
    b.sweep(bezier(hl(s * 0.03, 0.07, 0.045), hl(s * 0.055, 0.03, 0.064), hl(s * 0.066, -0.03, 0.056)), [0.012 * HS, 0.006 * HS], {
      section: "box",
      bone: head,
      caps: "flat",
      color: RED,
    });
    b.sweep(bezier(hl(s * 0.035, -0.03, 0.05), hl(s * 0.058, -0.12, 0.115), hl(s * 0.04, -0.21, 0.09)), [0.02 * HS, 0.004 * HS], {
      bone: head,
      sides: 5,
      smooth: false,
      caps: "point",
      color: GOLD,
    });
    b.decal(cranium, spiralDrawing(), {
      at: hl(s * 0.06, 0, 0),
      dir: head.dir([-s, 0, 0]),
      size: [0.085 * HS, 0.085 * HS],
      segments: 5,
      mirror: s < 0,
      bone: head,
    });
  }
  b.extrude(
    (
      [
      [0.04, 0],
      [0.0, 0.07],
      [-0.04, 0.04],
      [-0.08, 0.11],
      [-0.11, 0.05],
      [-0.17, 0.1],
      [-0.2, 0],
      ] as Array<[number, number]>
    ).map(([x, y]) => [x * HS, y * HS] as [number, number]),
    { at: hl(0, 0.0, 0.04), x: head.dir([0, 1, 0]), y: head.dir([0, 0, 1]), thickness: 0.014 * HS, color: RED, bone: head },
  );
  // mane cards down the back of the neck
  b.cards(
    [0.42, 0.52, 0.62, 0.72, 0.82, 0.92].map((t) => prow.at(t, 0)),
    maneDrawing(),
    { size: [0.1, 0.17], lean: 55, flow: [0, 0.6, -1], vary: 0.2, rng: rng(51), cross: true, bone: hull },
  );

  // stern
  const sternLow = catmull([
    R(0, 0.3, -1.2),
    R(0, 0.42, -1.26),
    R(0, 0.58, -1.33),
    R(0, 0.74, -1.4),
    R(0, 0.88, -1.43),
  ]);
  const sternCurl = spiral(R(0, 0.88, -1.28), R(0, 0.88, -1.43), [1, 0, 0], { turns: 0.95, r1: 0.05, pitch: 0 });
  const sternPath = sternLow.concat(sternCurl);
  b.sweep(sternPath, (t) => [0.034 - 0.014 * t, 0.04 - 0.02 * t], {
    section: "box",
    bone: hull,
    caps: "flat",
    color: TAR,
    bands: [
      [0.36, TAR],
      [0.4, GOLD],
      [0.56, TAR],
      [0.6, GOLD],
      [0.74, TAR],
      [0.78, RED],
      [1, TAR],
    ],
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: hull, at: sternPath.at(1), flat: true });

  // ---- Interior ---------------------------------------------------------------------------
  // ribs
  for (let i = 0; i < 15; i++) {
    const z = -0.98 + i * 0.14;
    const u = z / ZE;
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    for (const f of [0.98, 0.8, 0.6, 0.42, 0.26]) {
      left.push(hp(f, u, 1).addScaledVector(outN(f, u, 1), -0.018));
      right.push(hp(f, u, -1).addScaledVector(outN(f, u, -1), -0.018));
    }
    const mid = V(0, YS + keelY(u) + 0.055, z);
    b.sweep(catmull([...left, mid, ...right.reverse()]), 0.011, { section: "box", caps: "flat", bone: hull, color: OAK_LIGHT });
  }
  // floor boards
  const wood = woodDrawing();
  const floorTop = YS + 0.1;
  const boards: THREE.BufferGeometry[] = [];
  for (let z = -0.93; z <= 0.93; z += 0.062) {
    const w = innerHalf(floorTop - 0.02, z / ZE) - 0.004;
    boards.push(new THREE.BoxGeometry(2 * w, 0.02, 0.054).translate(0, floorTop - 0.01, z));
  }
  b.part(mergeGeometries(boards)!, PALE_WOOD, { bone: hull, at: [0, 0, 0], texture: wood, flat: true });
  // thwarts and mast partner
  const beams: THREE.BufferGeometry[] = [];
  for (const z of [-0.8, -0.36, 0.86]) {
    const y = YS + 0.26;
    const w = innerHalf(y, z / ZE) + 0.01;
    beams.push(new THREE.BoxGeometry(2 * w, 0.03, 0.065).translate(0, y, z));
  }
  {
    const y = YS + 0.33;
    const w = innerHalf(y, 0.12 / ZE) + 0.01;
    beams.push(new THREE.BoxGeometry(2 * w, 0.045, 0.13).translate(0, y, 0.12));
    beams.push(new THREE.BoxGeometry(0.15, 0.06, 0.3).translate(0, YS + 0.13, 0.12));
  }
  for (const [z0, z1, sign] of [
    [-0.86, -1.17, -1],
    [0.92, 1.17, 1],
  ])
    for (let z = z0; sign * (z - z1) <= 0; z += sign * 0.056) {
      const y = YS + 0.3;
      const w = innerHalf(y, (z + sign * 0.03) / ZE) + 0.008;
      beams.push(new THREE.BoxGeometry(2 * w, 0.024, 0.05).translate(0, y - 0.012, z));
    }
  b.part(mergeGeometries(beams)!, OAK, { bone: hull, at: [0, 0, 0], texture: wood, flat: true });

  // ---- Mast, yard, sail --------------------------------------------------------------------
  const MAST_Z = 0.12;
  const mastTop = V(0, 1.95, MAST_Z);
  b.sweep(polyline([R(0, 0.1, MAST_Z), mastTop]), [0.034, 0.02], {
    sides: 6,
    smooth: false,
    caps: "flat",
    bone: hull,
    color: PALE_WOOD,
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: hull, at: mastTop.clone().add(V(0, 0.01, 0)), flat: true });
  b.extrude(
    [
      [0, 0],
      [0, 0.12],
      [0.17, 0.095],
      [0.12, 0.065],
      [0.18, 0.04],
      [0.11, 0.03],
      [0.16, 0],
    ],
    { at: mastTop.clone().add(V(0, 0.035, -0.01)), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008, color: GOLD, bone: hull },
  );

  const YARD_Y = 1.74;
  const YARD_Z = 0.175;
  const yard = b.joint("yard", { parent: hull, at: V(0, YARD_Y, YARD_Z), aim: V(0.66, YARD_Y, YARD_Z), role: "hinge" });
  b.sweep(polyline([V(-0.7, YARD_Y, YARD_Z), V(0.7, YARD_Y, YARD_Z)]), (t) => 0.011 + 0.013 * Math.sin(Math.PI * t), {
    sides: 6,
    smooth: false,
    caps: "flat",
    bone: yard,
    color: PALE_WOOD,
    bands: [
      [0.05, GOLD],
      [0.95, PALE_WOOD],
      [1, GOLD],
    ],
  });
  // lashing where the yard meets the mast
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.05, 6), HEMP_DARK, {
    bone: yard,
    at: V(0, YARD_Y, YARD_Z - 0.03),
    flat: true,
  });

  // the sail: a billowed grid, drawn on both faces
  const SAIL_TOP = 1.725;
  const SAIL_H = 0.86;
  const sailPt = (c: number, r: number) => {
    const xn = c * 2 - 1;
    const hw = 0.56 + 0.06 * r;
    const bill = 0.11 * (1 - xn * xn) * Math.sin(Math.PI * r * 0.85);
    return V(xn * hw, SAIL_TOP - r * SAIL_H, YARD_Z + bill);
  };
  const sailTex = sailDrawing();
  for (const front of [true, false]) {
    const C = 10;
    const Rr = 6;
    const pos: number[] = [];
    const uv: number[] = [];
    const vert = (i: number, j: number) => {
      const p = sailPt(i / C, j / Rr);
      p.z += front ? 0.004 : -0.004;
      return { p, u: front ? i / C : 1 - i / C, v: 1 - j / Rr };
    };
    const tri = (a: RingVertex, bb: RingVertex, c: RingVertex) => {
      const n = bb.p.clone().sub(a.p).cross(c.p.clone().sub(a.p));
      if (n.z * (front ? 1 : -1) < 0) [bb, c] = [c, bb];
      for (const q of [a, bb, c]) {
        pos.push(q.p.x, q.p.y, q.p.z);
        uv.push(q.u, q.v);
      }
    };
    for (let i = 0; i < C; i++)
      for (let j = 0; j < Rr; j++) {
        const a = vert(i, j);
        const bb = vert(i + 1, j);
        const c = vert(i + 1, j + 1);
        const d = vert(i, j + 1);
        tri(a, bb, c);
        tri(a, c, d);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    b.part(g, "#ffffff", { bone: yard, at: [0, 0, 0], texture: sailTex, flat: true, name: front ? "sailFront" : "sailBack" });
  }
  // bolt ropes round the sail
  const edge = (f: (t: number) => THREE.Vector3, n: number) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
  const boltRope = (pts: THREE.Vector3[]) =>
    b.sweep(catmull(pts), 0.0065, { sides: 4, smooth: false, caps: "flat", bone: yard, color: HEMP_DARK });
  boltRope(edge((t) => sailPt(0, t), 6));
  boltRope(edge((t) => sailPt(1, t), 6));
  boltRope(edge((t) => sailPt(t, 1), 10));
  // tassels hanging from the foot
  b.cards(
    edge((t) => sailPt(t, 1), 12).map((p) => frame(p, [0, 1, 0])),
    tasselDrawing(),
    { size: [0.028, 0.09], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: rng(61), bone: yard },
  );

  // ---- Rigging -----------------------------------------------------------------------------
  const rope = (pts: THREE.Vector3[], bone = hull, r = 0.006, color = HEMP) =>
    b.sweep(pts.length > 2 ? catmull(pts) : polyline(pts), r, { sides: 4, smooth: false, caps: "flat", bone, color });
  rope([mastTop.clone().add(V(0, -0.02, 0.03)), R(0, 0.66, 1.38)]);
  rope([mastTop.clone().add(V(0, -0.02, -0.03)), R(0, 0.72, -1.4)]);
  for (const s of [1, -1]) {
    [-0.08, 0.06, 0.2].forEach((z, i) => {
      const u = z / ZE;
      const base = hp(1, u, s);
      base.y += 0.02;
      rope([V(0, 1.6 - i * 0.03, MAST_Z - 0.02), base]);
    });
    // lifts from yard ends to the masthead
    rope([V(s * 0.68, YARD_Y + 0.012, YARD_Z), mastTop.clone().add(V(0, -0.03, 0.01))], yard);
    // sheets from the foot corners and braces from the yard ends, made off on the rails
    rope([sailPt(s > 0 ? 1 : 0, 1), hp(1, -0.25 / ZE, s).add(V(0, 0.03, 0))]);
    rope([V(s * 0.7, YARD_Y - 0.005, YARD_Z), hp(1, -0.85 / ZE, s).add(V(0, 0.03, 0))]);
  }

  // ---- Shields -----------------------------------------------------------------------------
  const faces = SHIELD_FACES.map(shieldDrawing);
  for (const s of [1, -1])
    for (let i = 0; i < 11; i++) {
      const z = -0.75 + i * 0.16;
      const u = z / ZE;
      const k = keelY(u);
      const f = (sheerY(u) - 0.04 - k) / (sheerY(u) - k);
      const n = outN3(f, u, s);
      const at = hp(f, u, s).addScaledVector(n, 0.012);
      b.part(new THREE.CylinderGeometry(0.077, 0.077, 0.014, 12), TAR, { bone: hull, at, dir: n, flat: true });
      b.part(new THREE.CircleGeometry(0.075, 12), "#ffffff", {
        bone: hull,
        at: at.clone().addScaledVector(n, 0.0075),
        dir: n,
        axis: "z",
        up: [0, 1, 0],
        texture: faces[(i + (s > 0 ? 0 : 3)) % faces.length],
      });
      b.part(new THREE.SphereGeometry(0.016, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), IRON, {
        bone: hull,
        at: at.clone().addScaledVector(n, 0.0075),
        dir: n,
        flat: true,
      });
    }

  // ---- Oars --------------------------------------------------------------------------------
  const bladeOutline: Array<[number, number]> = [
    [0, -0.016],
    [0.05, -0.034],
    [0.2, -0.056],
    [0.3, -0.04],
    [0.33, 0],
    [0.3, 0.04],
    [0.2, 0.056],
    [0.05, 0.034],
    [0, 0.016],
  ];
  const perp = (d: THREE.Vector3) => {
    const z = V(0, 0, 1);
    return z.sub(d.clone().multiplyScalar(z.dot(d))).normalize();
  };
  const port = new THREE.CircleGeometry(0.029, 8);
  for (const s of [1, -1])
    [-0.55, -0.25, 0.05, 0.35, 0.65, 0.95].forEach((z, i) => {
      const u = z / ZE;
      const fo = 0.58;
      const n = outN3(fo, u, s);
      const P = hp(fo, u, s).addScaledVector(n, 0.011);
      b.part(port, DARK, { bone: hull, at: P.clone().addScaledVector(n, 0.004), dir: n, axis: "z" });
      const d = V(s, -0.18, -0.1).normalize();
      const oar = b.joint(`oar${s > 0 ? "L" : "R"}${i + 1}`, { parent: hull, at: P, dir: d, role: "hinge" });
      b.sweep(polyline([P.clone().addScaledVector(d, -0.3), P.clone().addScaledVector(d, 0.6)]), (t) => 0.017 - 0.006 * t, {
        sides: 6,
        smooth: false,
        caps: "flat",
        bone: oar,
        color: OAK_LIGHT,
      });
      b.extrude(bladeOutline, {
        at: P.clone().addScaledVector(d, 0.58),
        x: d,
        y: perp(d),
        thickness: 0.009,
        color: (i + (s > 0 ? 0 : 1)) % 2 ? CREAM : RED,
        bone: oar,
      });
    });

  // ---- Steering oar (starboard quarter) ----------------------------------------------------
  {
    const z = -0.95;
    const u = z / ZE;
    const fo = 0.78;
    const n = outN3(fo, u, -1);
    const P = hp(fo, u, -1).addScaledVector(n, 0.012);
    const d = V(-0.22, -0.95, -0.14).normalize();
    const steer = b.joint("steeringOar", { parent: hull, at: P, dir: d, role: "hinge" });
    b.part(new THREE.BoxGeometry(0.05, 0.07, 0.06), OAK, { bone: hull, at: P.clone().addScaledVector(n, -0.004), dir: n, axis: "x" });
    b.sweep(polyline([P.clone().addScaledVector(d, -0.36), P.clone().addScaledVector(d, 0.27)]), [0.02, 0.016], {
      sides: 6,
      smooth: false,
      caps: "flat",
      bone: steer,
      color: OAK_LIGHT,
    });
    b.extrude(
      [
        [0, -0.022],
        [0.06, -0.05],
        [0.22, -0.055],
        [0.3, -0.04],
        [0.3, 0.04],
        [0.22, 0.055],
        [0.06, 0.05],
        [0, 0.022],
      ],
      { at: P.clone().addScaledVector(d, 0.2), x: d, y: perp(d), thickness: 0.014, color: RED, bone: steer },
    );
    const top = P.clone().addScaledVector(d, -0.36);
    b.sweep(polyline([top.clone().add(V(0, 0, -0.06)), top.clone().add(V(0, 0, 0.06))]), 0.012, {
      sides: 6,
      smooth: false,
      caps: "flat",
      bone: steer,
      color: OAK_LIGHT,
    });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 3, 6), HEMP_DARK, {
      bone: steer,
      at: P.clone().addScaledVector(d, 0.03),
      dir: d,
      axis: "z",
      flat: true,
    });
  }

  // ---- Cargo -------------------------------------------------------------------------------
  const barrelPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.07, 0),
    new THREE.Vector2(0.088, 0.065),
    new THREE.Vector2(0.097, 0.11),
    new THREE.Vector2(0.088, 0.155),
    new THREE.Vector2(0.07, 0.22),
    new THREE.Vector2(0, 0.22),
  ];
  const barrelTex = barrelDrawing();
  [
    [0.17, 0.42, 10],
    [-0.15, 0.5, 40],
    [0.15, 0.7, 70],
  ].forEach(([x, z, rot]) => {
    b.part(new THREE.LatheGeometry(barrelPts, 8), "#ffffff", {
      bone: hull,
      at: V(x, floorTop, z),
      rotation: [0, rot, 0],
      texture: barrelTex,
      flat: true,
    });
  });
  // sea chest
  {
    const at = V(-0.13, floorTop, -0.58);
    b.part(new THREE.BoxGeometry(0.26, 0.13, 0.14), "#ffffff", {
      bone: hull,
      at: at.clone().add(V(0, 0.065, 0)),
      texture: chestDrawing(),
    });
    b.extrude(
      [
        [-0.072, 0],
        [0.072, 0],
        [0.072, 0.018],
        [0.046, 0.05],
        [-0.046, 0.05],
        [-0.072, 0.018],
      ],
      { at: at.clone().add(V(0, 0.13, 0)), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.26, color: OAK, bone: hull },
    );
  }
  // coiled rope
  {
    const c = V(0.13, floorTop + 0.014, -0.12);
    b.sweep(spiral(c, c.clone().add(V(0.105, 0, 0)), [0, 1, 0], { turns: 2.6, r1: 0.045, pitch: 0.012 }), 0.0135, {
      sides: 5,
      smooth: false,
      detail: 0.5,
      bone: hull,
      color: HEMP,
    });
    b.sweep(spiral(c.clone().add(V(0, 0.026, 0)), c.clone().add(V(0.09, 0.026, 0)), [0, 1, 0], { turns: 1.6, r1: 0.05, pitch: 0.01 }), 0.0135, {
      sides: 5,
      smooth: false,
      detail: 0.5,
      bone: hull,
      color: HEMP_DARK,
    });
  }

  // ---- Beach props: shoring timbers, mooring post and line ---------------------------------
  for (const s of [1, -1])
    for (const z of [-0.4, 0.5]) {
      const u = z / ZE;
      const top = hp(0.6, u, s).addScaledVector(outN(0.6, u, s), 0.014);
      const foot = V(s * (Math.abs(top.x) + 0.42), beachH(s * (Math.abs(top.x) + 0.42), z) + 0.004, z);
      b.sweep(polyline([top, foot]), 0.024, { sides: 4, smooth: false, caps: "flat", bone: hull, color: DRIFT });
    }
  {
    const x = 0.85;
    const z = 1.6;
    const h = beachH(x, z);
    b.sweep(polyline([V(x, h - 0.02, z), V(x, h + 0.36, z)]), 0.032, {
      sides: 6,
      smooth: false,
      caps: "flat",
      bone: hull,
      color: DRIFT,
    });
    const knot = V(x, h + 0.3, z);
    rope([R(0, 0.45, 1.3), V(0.42, 0.26, 1.5), knot], hull, 0.0075, HEMP_DARK);
    b.sweep(polyline([knot.clone().add(V(-0.03, 0.02, 0)), knot.clone().add(V(0.03, 0.02, 0))]), 0.014, {
      sides: 4,
      smooth: false,
      bone: hull,
      color: HEMP_DARK,
    });
  }
  // driftwood
  b.sweep(polyline([V(-1.35, 0.11, -1.35), V(-0.75, 0.1, -1.72)]), [0.05, 0.036], {
    sides: 6,
    smooth: false,
    bone: hull,
    color: DRIFT,
  });

  return b.root;
}
