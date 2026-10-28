import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, rng, catmull, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description:
    "A grimy 1979 Nostromo-style spaceship galley: riveted bulkheads, steel counter run with sink, hob and hood, hanging pans, a bolted mess table with stools, a drinking bird, fridge lockers, a CRT, valves, pipes and ceiling lights.",
};

type V3 = [number, number, number];
type Col = ColorInput;
const AX: Record<"x" | "y" | "z", V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

// ---------------------------------------------------------------- textures
const FONT = `font-family="Arial, Helvetica, sans-serif" font-weight="bold"`;
const MONO = `font-family="Courier New, monospace" font-weight="bold"`;
const HAZ_PAT = `<pattern id="hz" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="#e0b020"/><rect x="4" width="4" height="8" fill="#1c1c1c"/></pattern>`;

function cabinetTex(label: string, accent: string) {
  return svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#3a3320" stop-opacity="0"/><stop offset="1" stop-color="#3a3320" stop-opacity="0.5"/></linearGradient></defs>
<rect width="60" height="80" fill="#c6c2ac"/>
<rect x="1.2" y="1.2" width="57.6" height="77.6" fill="none" stroke="#3b3a33" stroke-width="2.4"/>
<rect x="6" y="6" width="48" height="68" fill="#b9b59f" stroke="#8a8672" stroke-width="1.4"/>
<rect x="6" y="6" width="48" height="10" fill="${accent}"/>
<text x="30" y="13.5" text-anchor="middle" ${FONT} font-size="6.5" fill="#1b1a16">${label}</text>
<rect x="8" y="24" width="44" height="1" fill="#8a8672"/>
<path d="M12 60 L20 44 L28 60Z" fill="none" stroke="#6d6a58" stroke-width="1.4"/>
<rect x="44" y="34" width="6" height="16" rx="1.5" fill="#35363a"/>
<g fill="#7a776a"><circle cx="9" cy="9" r="1.1"/><circle cx="51" cy="9" r="1.1"/><circle cx="9" cy="71" r="1.1"/><circle cx="51" cy="71" r="1.1"/></g>
<path d="M14 30 l12 3 M40 62 l8 -4 M10 52 l6 1" stroke="#6b6650" stroke-width="0.8" opacity="0.4"/>
<rect width="60" height="80" fill="url(#gr)"/></svg>`,
    { size: 192 },
  );
}

function drawersTex() {
  let d = "";
  for (let i = 0; i < 3; i++) {
    const y = i * 26.6;
    d += `<rect x="3" y="${y + 3}" width="54" height="22" fill="#bdb9a3" stroke="#6f6c5b" stroke-width="1.2"/>
<rect x="18" y="${y + 9}" width="24" height="4" rx="2" fill="#2f3033"/>
<text x="30" y="${y + 21}" text-anchor="middle" ${FONT} font-size="4.5" fill="#4a4838">UTIL ${i + 1}</text>`;
  }
  return svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="#c6c2ac"/>${d}
<rect x="1.2" y="1.2" width="57.6" height="77.6" fill="none" stroke="#3b3a33" stroke-width="2.4"/></svg>`,
    { size: 192 },
  );
}

function ovenTex() {
  return svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2326"/><stop offset="0.5" stop-color="#2d3b40"/><stop offset="1" stop-color="#10171a"/></linearGradient></defs>
<rect width="60" height="80" fill="#a9adb0"/>
<rect x="1.2" y="1.2" width="57.6" height="77.6" fill="none" stroke="#2f3033" stroke-width="2.4"/>
<rect x="4" y="4" width="52" height="15" fill="#2c2e31"/>
<g fill="#cfd2d4"><circle cx="13" cy="11.5" r="3.4"/><circle cx="25" cy="11.5" r="3.4"/><circle cx="37" cy="11.5" r="3.4"/><circle cx="48" cy="11.5" r="2.4"/></g>
<g stroke="#2c2e31" stroke-width="1"><path d="M13 9 v3 M25 9 v3 M37 9 v3"/></g>
<rect x="6" y="26" width="48" height="40" rx="2" fill="url(#gl)" stroke="#2f3033" stroke-width="2"/>
<path d="M10 62 L28 30 L36 30 L18 62Z" fill="#ffffff" opacity="0.1"/>
<rect x="8" y="21.5" width="44" height="3" rx="1.5" fill="#e4e6e8" stroke="#55585b" stroke-width="0.6"/>
<text x="30" y="74" text-anchor="middle" ${FONT} font-size="5" fill="#222">OVEN 02 / 240C MAX</text></svg>`,
    { size: 192 },
  );
}

function lockerTex(base: string, label: string, display: string, sub: string) {
  return svg(
    `<svg viewBox="0 0 50 120" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stop-color="#2b261a" stop-opacity="0"/><stop offset="1" stop-color="#2b261a" stop-opacity="0.5"/></linearGradient></defs>
<rect width="50" height="120" fill="${base}"/>
<rect x="1" y="1" width="48" height="118" fill="none" stroke="#2f3235" stroke-width="2"/>
<rect x="8" y="9" width="30" height="14" fill="#0b1410" stroke="#2f3235" stroke-width="1.4"/>
<text x="23" y="19.5" text-anchor="middle" ${MONO} font-size="8" fill="#5dff90">${display}</text>
<text x="23" y="40" text-anchor="middle" ${FONT} font-size="6" fill="#1b1b1b">${label}</text>
<text x="23" y="48" text-anchor="middle" ${FONT} font-size="3.6" fill="#33352f">${sub}</text>
<rect x="43" y="30" width="3.4" height="52" rx="1.4" fill="#2a2c2f"/>
<rect x="6" y="56" width="30" height="1.2" fill="#2f3235" opacity="0.6"/>
<path d="M14 80 L22 64 L30 80Z" fill="#e0b020" stroke="#1c1c1c" stroke-width="1.2"/>
<rect x="21" y="69" width="2" height="6" fill="#1c1c1c"/>
<g fill="#26282b"><rect x="8" y="100" width="30" height="1.6"/><rect x="8" y="104" width="30" height="1.6"/><rect x="8" y="108" width="30" height="1.6"/></g>
<path d="M6 90 l10 2 M30 52 l8 -1" stroke="#3b3a2a" stroke-width="0.8" opacity="0.4"/>
<rect width="50" height="120" fill="url(#gr)"/></svg>`,
    { size: 256 },
  );
}

function panelTex() {
  const xs = [20, 45, 70, 95, 120];
  const names = ["PWR", "WTR", "VNT", "HTR", "GAL"];
  let g = "";
  xs.forEach((x, i) => {
    g += `<circle cx="${x}" cy="32" r="6" fill="#16181a" stroke="#8a8e90" stroke-width="1.2"/>
<text x="${x}" y="46" text-anchor="middle" ${FONT} font-size="5" fill="#d8d4c0">${names[i]}</text>
<rect x="${x - 7}" y="56" width="14" height="12" rx="2" fill="#101213" stroke="#6a6e70" stroke-width="1"/>
<text x="${x}" y="77" text-anchor="middle" ${FONT} font-size="4" fill="#9a9784">${["A", "B", "C", "D", "E"][i]}-0${i + 1}</text>`;
  });
  return svg(
    `<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg"><defs>${HAZ_PAT}</defs>
<rect width="140" height="100" rx="5" fill="#363b3f"/>
<rect x="3" y="3" width="134" height="94" rx="3" fill="none" stroke="#9a9d9a" stroke-width="1.6"/>
<rect x="8" y="5" width="124" height="12" fill="#d9772b"/>
<text x="70" y="14.5" text-anchor="middle" ${FONT} font-size="8.5" fill="#1a1a1a">GALLEY SERVICES</text>
${g}
<rect x="8" y="86" width="124" height="8" fill="url(#hz)"/>
<g fill="#b7b9b4"><circle cx="6" cy="22" r="1.6"/><circle cx="134" cy="22" r="1.6"/><circle cx="6" cy="80" r="1.6"/><circle cx="134" cy="80" r="1.6"/></g></svg>`,
    { size: 384 },
  );
}

function crtTex() {
  const lines = ["MU/TH/UR 6000 - INTERFACE 2037", "GALLEY STORES ........ 61%", "WATER RECLAIM ......... OK", "CREW: 7   DECK C", "SPECIAL ORDER 937", "> _"];
  let t = "";
  lines.forEach((l, i) => (t += `<text x="6" y="${14 + i * 10}" ${MONO} font-size="5.2" fill="#5dff8a">${l}</text>`));
  let sc = "";
  for (let y = 0; y < 80; y += 3) sc += `<rect x="0" y="${y}" width="100" height="1" fill="#000" opacity="0.25"/>`;
  return svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="80" rx="8" fill="#06120a"/>
<rect x="2" y="2" width="96" height="76" rx="7" fill="none" stroke="#1d5a30" stroke-width="2"/>${t}${sc}</svg>`,
    { size: 256 },
  );
}

function signTex() {
  return svg(
    `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg"><defs>${HAZ_PAT}</defs>
<rect width="160" height="36" fill="#d9772b"/>
<rect x="0" y="0" width="160" height="4" fill="url(#hz)"/><rect x="0" y="32" width="160" height="4" fill="url(#hz)"/>
<text x="80" y="22" text-anchor="middle" ${FONT} font-size="17" letter-spacing="3" fill="#161616">GALLEY</text>
<text x="80" y="30" text-anchor="middle" ${FONT} font-size="5" letter-spacing="1.5" fill="#161616">DECK C / MESS / AUTHORISED CREW</text>
<g fill="#161616"><circle cx="6" cy="18" r="1.8"/><circle cx="154" cy="18" r="1.8"/></g></svg>`,
    { size: 512 },
  );
}

function plaqueTex() {
  return svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="#8f8b78"/>
<rect x="2" y="2" width="116" height="36" fill="none" stroke="#2a2822" stroke-width="1.6"/>
<text x="60" y="15" text-anchor="middle" ${FONT} font-size="7" fill="#1d1c17">NOSTROMO</text>
<text x="60" y="24" text-anchor="middle" ${FONT} font-size="4.4" fill="#1d1c17">COMMERCIAL TOWING VEHICLE</text>
<text x="60" y="33" text-anchor="middle" ${MONO} font-size="5" fill="#1d1c17">REG 180924609</text></svg>`,
    { size: 256 },
  );
}

function hatchTex() {
  let ribs = "";
  for (let y = 36; y < 82; y += 9) ribs += `<rect x="4" y="${y}" width="32" height="1.4" fill="#4d585e"/>`;
  return svg(
    `<svg viewBox="0 0 40 95" xmlns="http://www.w3.org/2000/svg"><defs>${HAZ_PAT}
<radialGradient id="w" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#5a7d8c"/><stop offset="1" stop-color="#0f1c24"/></radialGradient></defs>
<rect width="40" height="95" fill="#7e8b92"/>
<rect x="1.5" y="1.5" width="37" height="92" fill="none" stroke="#2f383d" stroke-width="2.4"/>
<circle cx="20" cy="20" r="9" fill="url(#w)" stroke="#2f383d" stroke-width="2.4"/>
${ribs}
<circle cx="20" cy="30" r="0.1" fill="none"/>
<g stroke="#e0b020" stroke-width="2" fill="none"><circle cx="20" cy="56" r="0.1"/></g>
<text x="20" y="72" text-anchor="middle" ${FONT} font-size="7" fill="#1b1b1b">C-3</text>
<text x="20" y="79" text-anchor="middle" ${FONT} font-size="3.6" fill="#1b1b1b">MESS ACCESS</text>
<rect x="4" y="84" width="32" height="7" fill="url(#hz)"/>
<rect x="30" y="44" width="4" height="12" rx="1.5" fill="#26292b"/></svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "nostromo_galley", paintSize: 2048 });
  const R = rng(11);

  const F = 0.05; // floor top
  const TOP = 0.98; // counter top
  const LX = 2.1; // left wall inner face
  const TT = 0.78; // table top height
  const BZ = -1.6; // back wall inner face

  // ---- palette
  const WALLBASE = paint((p) => {
    const y = p.y;
    const base = y < 1.05 ? "#5f6b72" : "#b4af9b";
    if (y >= 1.05 && y < 1.11) return "#d9772b";
    const g = noise(p, 0.4, 5);
    const streak = noise(new THREE.Vector3(p.x * 8, p.y * 0.5, p.z * 8), 0.6, 9);
    const dirt = 0.45 * smoothstep(0.55, 0.9, g) + 0.3 * smoothstep(0.6, 1, streak);
    const edge = smoothstep(0.5, 0, y) * 0.4 + smoothstep(2.3, 2.65, y) * 0.3;
    return mix(mix(base, "#2a281f", dirt * 0.8), "#1c1a15", edge);
  });
  const WALL = panelled(WALLBASE, { size: 0.6, aspect: 1.2, rivets: 0.12 });
  const grime = (base: string, amt = 0.3, seed = 1) =>
    paint((p) => mix(base, "#2a2822", Math.min(1, amt * noise(p, 0.35, seed) * 1.3 + smoothstep(0.7, 0, p.y) * 0.3)));
  const CAB = grime("#c3bfa8", 0.4, 2);
  const CEILP = panelled(grime("#74776f", 0.4, 3), { size: 0.5, aspect: 0.8, rivets: 0.1 });
  const STEEL = metal("steel", { polish: 0.45, tarnish: 0.25 });
  const STEELD = metal("iron");
  const COPPER = metal("copper", { verdigris: 0.25 });
  const BRASS = metal("brass", { tarnish: 0.5 });
  const HAZARD = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.07) % 2 ? "#1c1c1c" : "#e0b020"));
  const FLOOR = paint((p, n) => {
    if (n.y < 0.5) return "#2c2e30";
    if (p.z > 1.84 || p.x < -2.12) return Math.floor((p.x + p.z) / 0.08) % 2 ? "#1c1c1c" : "#d9ac1c";
    const f = (v: number, s: number) => v / s - Math.floor(v / s);
    if (f(p.x, 0.9) * 0.9 < 0.012 || f(p.z, 0.9) * 0.9 < 0.012) return "#16171a";
    const u = f(p.x, 0.1);
    const v = f(p.z, 0.1);
    if (Math.abs(u - 0.5) < 0.3 && Math.abs(v - 0.5) < 0.3) return "#1a1c1e";
    return mix(mix("#6a7076", "#40454a", noise(p, 0.3, 2)), "#1c1d1a", 0.35 * smoothstep(0.55, 0.85, noise(p, 0.5, 6)));
  });
  const VINYL = paint((p, n) => mix(mix("#c85a18", "#e58a3a", smoothstep(0, 1, n.y)), "#4a2208", 0.5 * smoothstep(0.55, 0.9, noise(p, 0.12, 4))));
  const TABLETOP = paint((p, n, s) => {
    if (Math.abs(n.y) < 0.5) return "#4a4d50";
    if (Math.abs(s[0]) > 0.9 || Math.abs(s[1]) > 0.385) return "#c8641c";
    return mix(mix("#d8d3bd", "#a9a58f", noise(p, 0.25, 4) * 0.8), "#6a604a", 0.5 * smoothstep(0.7, 0.9, noise(p, 0.07, 8)));
  });
  const CRATE = panelled("#7e8566", { size: 0.25, aspect: 1, rivets: 0.05 });

  // ---- helpers
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: Col, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...extra });
  const cyl = (x: number, y: number, z: number, r: number, h: number, color: Col, ax: "x" | "y" | "z" = "y", seg = 10, r2 = r) =>
    b.part(new THREE.CylinderGeometry(r2, r, h, seg), color, { at: [x, y, z], dir: [...AX[ax]] });
  const ball = (x: number, y: number, z: number, r: number, color: Col, scale: V3 = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], scale });
  const lathe = (x: number, y: number, z: number, outline: [number, number][], color: Col, seg = 10, axis: V3 = [0, 1, 0], smoothing = 0) =>
    b.lathe(outline, { at: [x, y, z], axis, segments: seg, color, smoothing });
  const rod = (a: V3, c: V3, r: number, color: Col) => b.rod(a, c, r, color, { sides: 8 });
  const decal = (tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, dir: V3, g = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex });
    if (g) glow(p, g);
    return p;
  };

  // ---- shell
  box(0, F / 2, 0.1, 4.6, F, 3.8, FLOOR);
  box(0, 1.325, -1.7, 4.6, 2.65, 0.2, WALL);
  box(2.2, 1.325, 0.1, 0.2, 2.65, 3.8, WALL);
  box(0, 0.11, BZ + 0.02, 4.4, 0.12, 0.04, "#3a3d40");
  box(LX - 0.02, 0.11, 0.1, 0.04, 0.12, 3.7, "#3a3d40");
  // ceiling beams and plate
  box(0, 2.62, -1.35, 4.6, 0.06, 0.9, CEILP);
  for (const z of [-1.55, -0.55, 0.45, 1.45]) box(0, 2.52, z, 4.6, 0.16, 0.14, CEILP);
  box(2.0, 2.52, 0.1, 0.2, 0.16, 3.8, CEILP);
  // light fixtures
  for (const x of [-1.2, 0.3])
    for (const z of [-0.05, 0.95]) {
      box(x, 2.53, z, 0.92, 0.05, 0.42, "#44474a");
      glow(box(x, 2.495, z, 0.82, 0.03, 0.32, "#fff0c4"), 1.3);
      for (const s of [-1, 1]) box(x + s * 0.41, 2.5, z, 0.03, 0.06, 0.4, "#2a2c2e");
    }
  // corner column with hazard band
  box(-2.22, 1.325, -1.55, 0.16, 2.65, 0.16, "#8b8672");
  box(-2.22, 0.3, -1.55, 0.175, 0.5, 0.175, HAZARD);
  // extinguisher on the column
  lathe(-2.22, 0.75, -1.41, [[0, 0], [0.06, 0], [0.062, 0.02], [0.062, 0.26], [0.04, 0.31], [0.02, 0.33], [0, 0.33]], "#b8321f", 10);
  box(-2.22, 1.1, -1.41, 0.04, 0.03, 0.05, "#1b1b1b");
  for (const y of [0.85, 1.0]) cyl(-2.22, y, -1.41, 0.066, 0.025, "#2a2a2a", "y", 10);
  b.sweep(catmull([[-2.22, 1.09, -1.41], [-2.16, 1.06, -1.35], [-2.16, 0.9, -1.34], [-2.2, 0.85, -1.36]]), 0.008, { color: "#1b1b1b" });

  // ---- counter run
  box(-1.7, 0.54, -1.275, 0.6, 0.78, 0.65, CAB);
  box(0.4, 0.54, -1.275, 2.4, 0.78, 0.65, CAB);
  box(-1.1, 0.45, -1.275, 0.6, 0.6, 0.65, CAB);
  box(-0.2, 0.1, -1.3, 3.5, 0.1, 0.55, "#1d1f21");
  box(-1.68, 0.955, -1.265, 0.64, 0.05, 0.67, STEEL);
  box(0.38, 0.955, -1.265, 2.44, 0.05, 0.67, STEEL);
  box(-1.1, 0.955, -1.55, 0.52, 0.05, 0.1, STEEL);
  box(-1.1, 0.955, -1.015, 0.52, 0.05, 0.17, STEEL);
  box(-0.2, 0.955, -0.924, 3.6, 0.03, 0.012, "#d9772b");
  box(-1.1, 0.79, -1.3, 0.5, 0.02, 0.4, STEELD);
  for (const s of [-1, 1]) box(-1.1 + s * 0.25, 0.89, -1.3, 0.02, 0.18, 0.4, STEEL);
  box(-1.1, 0.89, -1.5, 0.5, 0.18, 0.02, STEEL);
  box(-1.1, 0.89, -1.1, 0.5, 0.18, 0.02, STEEL);
  cyl(-1.1, 0.803, -1.3, 0.03, 0.006, "#111214", "y", 10);
  // faucet
  cyl(-1.1, TOP + 0.04, -1.55, 0.03, 0.08, STEEL, "y", 8);
  b.sweep(
    catmull([[-1.1, TOP + 0.06, -1.55], [-1.1, TOP + 0.28, -1.55], [-1.1, TOP + 0.38, -1.48], [-1.1, TOP + 0.32, -1.36], [-1.1, TOP + 0.24, -1.33]]),
    0.014,
    { color: STEEL, sides: 8 },
  );
  for (const [s, c] of [[-1, "#2e67c8"], [1, "#b8321f"]] as const) {
    cyl(-1.1 + s * 0.09, TOP + 0.075, -1.55, 0.008, 0.05, STEEL, "y", 6);
    cyl(-1.1 + s * 0.09, TOP + 0.11, -1.55, 0.02, 0.012, c, "y", 8);
  }
  // doors under the counter
  const dTexA = cabinetTex("DRY 14", "#d9772b");
  const dTexB = cabinetTex("TOOLS", "#e0b020");
  const dTexC = cabinetTex("WASTE", "#6a7a82");
  const drawers = drawersTex();
  const oven = ovenTex();
  const mods: [number, THREE.Texture][] = [[-1.7, drawers], [-1.1, dTexC], [-0.5, dTexA], [0.1, oven], [0.7, dTexB], [1.3, dTexA]];
  for (const [cx, tex] of mods) {
    decal(tex, cx, 0.54, -0.947, 0.55, 0.73, AX.z);
    if (tex === drawers) for (const y of [0.29, 0.54, 0.79]) box(cx, y + 0.1, -0.93, 0.18, 0.02, 0.03, STEEL);
    else if (tex !== oven) {
      box(cx + 0.2, 0.62, -0.935, 0.025, 0.2, 0.025, STEEL);
    } else box(cx, 0.72, -0.925, 0.4, 0.02, 0.03, STEEL);
  }
  // hob
  box(0.1, TOP + 0.008, -1.275, 0.56, 0.016, 0.5, "#1c1c1e");
  const burners: [number, number, boolean][] = [[-0.13, -0.11, true], [0.13, -0.11, false], [-0.13, 0.11, false], [0.13, 0.11, true]];
  for (const [dx, dz, hot] of burners) {
    cyl(0.1 + dx, TOP + 0.022, -1.275 + dz, 0.075, 0.012, "#2b2b2d", "y", 10);
    const ring = b.part(new THREE.TorusGeometry(0.052, 0.008, 5, 14), hot ? "#ff7a1c" : "#3a3a3d", { at: [0.1 + dx, TOP + 0.03, -1.275 + dz], rotation: [90, 0, 0] });
    if (hot) glow(ring, 1.6);
  }
  for (const dz of [-0.11, 0.11]) box(0.1, TOP + 0.045, -1.275 + dz, 0.55, 0.012, 0.014, "#111214");
  for (const dx of [-0.13, 0.13]) box(0.1 + dx, TOP + 0.045, -1.275, 0.014, 0.012, 0.46, "#111214");
  for (let i = 0; i < 4; i++) {
    cyl(-0.05 + i * 0.1, 0.955, -0.917, 0.022, 0.03, "#1c1c1e", "z", 8);
    box(-0.05 + i * 0.1, 0.97, -0.9, 0.006, 0.016, 0.004, "#e0b020");
  }
  // pots on the hob
  const pot = (x: number, y: number, z: number, r: number, h: number) => {
    lathe(x, y, z, [[0, 0], [r, 0], [r + 0.01, 0.01], [r + 0.01, h], [r, h], [r, 0.012], [0, 0.012]], STEEL, 12);
    cyl(x, y + h * 0.78, z, r - 0.002, 0.006, "#7a5a2c", "y", 12);
  };
  pot(0.1 - 0.13, TOP + 0.05, -1.385, 0.1, 0.16);
  cyl(0.1 - 0.13, TOP + 0.05 + 0.17, -1.385, 0.1, 0.012, STEEL, "y", 12);
  cyl(0.1 - 0.13, TOP + 0.05 + 0.185, -1.385, 0.014, 0.025, "#1b1b1b", "y", 6);
  pot(0.1 + 0.13, TOP + 0.05, -1.165, 0.075, 0.1);
  rod([0.23, TOP + 0.12, -1.09], [0.23, TOP + 0.12, -0.96], 0.011, "#1b1b1b");
  for (const s of [-1, 1]) box(0.23 + s * 0.085, TOP + 0.13, -1.165, 0.02, 0.012, 0.03, "#1b1b1b");
  // hood
  b.frustumBox([0.1, 1.45, -1.3], [0.1, 1.8, -1.3], [0.8, 0.5], [0.3, 0.3], { color: STEEL });
  box(0.1, 2.2, -1.3, 0.3, 0.8, 0.3, STEEL);
  for (const y of [1.95, 2.3]) box(0.1, y, -1.3, 0.34, 0.03, 0.34, STEELD);
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.3), "#ffe6a8", { at: [0.1, 1.447, -1.3], dir: [0, -1, 0], axis: "z" }), 1.2);
  box(0.1, 1.45, -1.05, 0.8, 0.03, 0.02, "#d9772b");
  // backsplash
  box(-0.2, 1.215, -1.59, 3.6, 0.5, 0.02, STEEL);

  // sink side
  box(-1.7, TOP + 0.005, -1.45, 0.6, 0.01, 0.2, "#1d1f21");
  for (let i = 0; i < 5; i++) b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 12), "#e8e6dc", { at: [-1.92 + i * 0.055, TOP + 0.115, -1.3], dir: [1, 0, 0] });
  box(-1.8, TOP + 0.02, -1.3, 0.32, 0.02, 0.24, "#3a3d40");
  for (const x of [-1.95, -1.65]) box(x, TOP + 0.03, -1.3, 0.012, 0.06, 0.24, "#3a3d40");
  // detergent bottle + sponge
  cyl(-1.38, TOP + 0.1, -1.5, 0.04, 0.2, "#2e8f6a", "y", 8);
  cyl(-1.38, TOP + 0.21, -1.5, 0.014, 0.03, "#e8e6dc", "y", 6);
  box(-0.7, TOP + 0.015, -1.45, 0.07, 0.03, 0.05, "#e0b020");
  // right of the stove: board, knife, canister
  box(0.62, TOP + 0.012, -1.25, 0.32, 0.024, 0.22, "#8a6a3c", { rotation: [0, 6, 0] });
  box(0.58, TOP + 0.03, -1.25, 0.16, 0.006, 0.03, STEEL, { rotation: [0, 6, 0] });
  box(0.7, TOP + 0.03, -1.25, 0.08, 0.016, 0.026, "#1b1b1b", { rotation: [0, 6, 0] });
  lathe(0.75, TOP + 0.005, -1.5, [[0, 0], [0.06, 0], [0.065, 0.01], [0.065, 0.16], [0.055, 0.17], [0, 0.17]], "#8f9a8a", 10);
  for (const [dx, a] of [[-0.02, 8], [0, -6], [0.02, 3]] as const) rod([0.75 + dx, TOP + 0.16, -1.5], [0.75 + dx * 2.5, TOP + 0.3, -1.5 + a * 0.003], 0.007, "#2a2a2a");

  // ---- CRT and coffee machine
  const crt = crtTex();
  box(0.95, TOP + 0.01, -1.38, 0.3, 0.02, 0.3, "#3a3d40");
  box(0.95, TOP + 0.18, -1.3, 0.4, 0.34, 0.06, "#c9c3a8");
  b.frustumBox([0.95, TOP + 0.18, -1.33], [0.95, TOP + 0.17, -1.58], [0.34, 0.28], [0.18, 0.15], { color: "#b7b19a" });
  decal(crt, 0.95, TOP + 0.205, -1.268, 0.3, 0.24, AX.z, 1.1);
  for (const dx of [0.12, 0.16]) cyl(0.95 + dx, TOP + 0.045, -1.268, 0.012, 0.012, "#2a2a2a", "z", 8);
  glow(cyl(0.95 - 0.15, TOP + 0.045, -1.268, 0.006, 0.006, "#ff4a3a", "z", 6), 1.5);
  // coffee machine
  box(1.38, TOP + 0.01, -1.28, 0.26, 0.02, 0.5, "#2a2d30");
  box(1.38, TOP + 0.17, -1.49, 0.26, 0.34, 0.1, "#3b4045");
  box(1.38, TOP + 0.33, -1.3, 0.26, 0.07, 0.5, "#3b4045");
  glow(cyl(1.38, TOP + 0.33, -1.045, 0.01, 0.01, "#56e07a", "z", 6), 1.5);
  cyl(1.38, TOP + 0.3, -1.2, 0.012, 0.03, STEELD, "y", 6);
  lathe(1.38, TOP + 0.02, -1.2, [[0, 0], [0.06, 0], [0.065, 0.03], [0.055, 0.12], [0.04, 0.16], [0.035, 0.16], [0.05, 0.12], [0.06, 0.03], [0, 0.02]], "#5a3a22", 10);
  b.part(new THREE.TorusGeometry(0.04, 0.007, 5, 8, Math.PI), "#1b1b1b", { at: [1.44, TOP + 0.1, -1.2], rotation: [0, 0, -90] });
  // wall panel with 3D toggles and lamps
  const PX = 1.05, PY = 1.62, PZ = -1.568;
  box(PX, PY, -1.585, 0.72, 0.52, 0.03, "#2a2d30");
  decal(panelTex(), PX, PY, PZ, 0.7, 0.5, AX.z);
  const wp = (sx: number, sy: number): V3 => [PX + (sx - 70) * 0.005, PY + (50 - sy) * 0.005, PZ];
  [20, 45, 70, 95, 120].forEach((sx, i) => {
    const [x, y, z] = wp(sx, 32);
    cyl(x, y, z + 0.004, 0.012, 0.008, STEEL, "z", 8);
    const up = i % 2 ? 0.6 : -0.6;
    const tip: V3 = [x, y + up * 0.02, z + 0.04];
    rod([x, y, z + 0.006], tip, 0.004, STEEL);
    ball(tip[0], tip[1], tip[2], 0.008, i % 2 ? "#b8321f" : "#cfcfc6");
    const [lx, ly, lz] = wp(sx, 62);
    glow(cyl(lx, ly, lz + 0.004, 0.011, 0.008, ["#ff8a1c", "#56e07a", "#ff4a3a", "#56e07a", "#ff8a1c"][i], "z", 8), 1.6);
  });
  decal(plaqueTex(), 1.75, 1.7, -1.568, 0.3, 0.1, AX.z);
  // cables
  b.sweep(catmull([[0.8, 2.44, -1.5], [0.8, 2.2, -1.53], [0.85, 2.0, -1.56], [0.9, 1.89, -1.565]]), 0.011, { color: "#151618", sides: 6 });
  b.sweep(catmull([[1.3, 2.44, -1.5], [1.35, 2.1, -1.54], [1.25, 1.95, -1.56], [1.2, 1.89, -1.565]]), 0.009, { color: "#8a2a1c", sides: 6 });
  b.sweep(catmull([[0.95, TOP + 0.15, -1.57], [1.02, TOP + 0.05, -1.575], [1.15, TOP + 0.01, -1.5], [1.2, TOP + 0.01, -1.4]]), 0.007, { color: "#151618", sides: 6 });

  // ---- shelves and hanging rack
  const can = (x: number, y0: number, z: number, band: string) => {
    cyl(x, y0 + 0.055, z, 0.04, 0.11, "#b9bdc0", "y", 10);
    cyl(x, y0 + 0.055, z, 0.0408, 0.05, band, "y", 10);
    cyl(x, y0 + 0.112, z, 0.036, 0.006, "#8a8e92", "y", 10);
  };
  const jar = (x: number, y0: number, z: number) => {
    cyl(x, y0 + 0.06, z, 0.04, 0.12, "#a8661c", "y", 8);
    cyl(x, y0 + 0.13, z, 0.042, 0.03, "#2a2a2a", "y", 8);
  };
  const mug = (x: number, y: number, z: number, color: Col, rotY = 0) => {
    lathe(x, y, z, [[0, 0], [0.04, 0], [0.043, 0.003], [0.043, 0.09], [0.038, 0.09], [0.038, 0.009], [0, 0.009]], color, 10);
    b.part(new THREE.TorusGeometry(0.025, 0.006, 5, 8, Math.PI), color, { at: [x + 0.04, y + 0.05, z], rotation: [0, rotY, -90] });
  };
  for (const [sy] of [[1.5], [1.85]]) {
    box(-1.6, sy, -1.475, 0.8, 0.025, 0.25, STEELD);
    box(-1.6, sy + 0.03, -1.357, 0.8, 0.04, 0.015, "#d9772b");
    for (const x of [-1.95, -1.25]) box(x, sy - 0.05, -1.5, 0.025, 0.1, 0.2, "#2a2c2e");
  }
  [-1.93, -1.85, -1.77].forEach((x, i) => can(x, 1.5125, -1.5, ["#d9772b", "#e0b020", "#b8321f"][i]));
  can(-1.93, 1.5125, -1.42, "#56a05a");
  can(-1.85, 1.5125, -1.42, "#d9772b");
  jar(-1.6, 1.5125, -1.48);
  jar(-1.5, 1.5125, -1.48);
  box(-1.34, 1.5125 + 0.09, -1.48, 0.12, 0.18, 0.1, "#d6a03a", { rotation: [0, 8, 0] });
  box(-1.34, 1.5125 + 0.12, -1.43, 0.1, 0.05, 0.002, "#b8321f");
  mug(-1.7, 1.8625, -1.45, "#e8e6dc");
  mug(-1.58, 1.8625, -1.45, "#d9772b", 180);
  box(-1.42, 1.8625 + 0.1, -1.48, 0.16, 0.2, 0.1, "#c9c3a8");
  box(-1.42, 1.8625 + 0.1, -1.428, 0.12, 0.08, 0.002, "#3d6a8a");
  box(-1.3, 1.8625 + 0.1, -1.48, 0.1, 0.2, 0.1, "#8a9a7a");
  cyl(-1.9, 1.8625 + 0.11, -1.48, 0.035, 0.22, "#6a3a22", "y", 8);
  cyl(-1.9, 1.8625 + 0.23, -1.48, 0.015, 0.03, "#1b1b1b", "y", 6);
  cyl(-1.82, 1.8625 + 0.09, -1.48, 0.032, 0.18, "#2e6a8f", "y", 8);
  // hanging rail
  rod([-1.15, 2.15, -1.47], [-0.3, 2.15, -1.47], 0.012, STEEL);
  for (const x of [-1.15, -0.3]) rod([x, 2.15, -1.6], [x, 2.15, -1.47], 0.012, STEEL);
  // ladle
  rod([-1.05, 2.15, -1.47], [-1.05, 1.86, -1.47], 0.007, STEEL);
  lathe(-1.05, 1.83, -1.47, [[0, 0], [0.03, 0.008], [0.046, 0.035], [0.04, 0.037], [0.026, 0.02], [0, 0.012]], STEEL, 8, [0, 0, 1], 1);
  // spatula
  rod([-0.92, 2.15, -1.47], [-0.92, 1.97, -1.47], 0.008, "#2a2a2a");
  b.extrude([[-0.03, 0], [0.03, 0], [0.032, 0.12], [-0.032, 0.12]], { at: [-0.92, 1.97, -1.47], x: [1, 0, 0], y: [0, -1, 0], thickness: 0.006, smoothing: 1, color: "#2a2a2a" });
  // pan
  rod([-0.68, 2.15, -1.47], [-0.68, 2.0, -1.47], 0.012, "#1b1b1b");
  lathe(-0.68, 1.88, -1.47, [[0, 0], [0.1, 0], [0.12, 0.035], [0.115, 0.037], [0.095, 0.012], [0, 0.012]], "#3a3d40", 12, [0, 0, 1]);
  // hanging pot
  rod([-0.42, 2.15, -1.47], [-0.42, 2.02, -1.47], 0.006, STEEL);
  lathe(-0.42, 1.88, -1.45, [[0, 0], [0.085, 0], [0.09, 0.01], [0.09, 0.07], [0.082, 0.07], [0.082, 0.012], [0, 0.012]], STEELD, 10, [0, 0, 1]);

  // ---- ceiling pipes
  rod([-2.25, 2.38, -1.5], [1.95, 2.38, -1.5], 0.05, STEEL);
  rod([-2.25, 2.4, -1.3], [1.55, 2.4, -1.3], 0.03, COPPER);
  ball(1.95, 2.38, -1.5, 0.056, STEEL);
  rod([1.95, F, -1.5], [1.95, 2.38, -1.5], 0.045, STEEL);
  for (const x of [-1.8, -0.9, 0, 0.9, 1.7]) cyl(x, 2.38, -1.5, 0.058, 0.05, "#2a2c2e", "x", 10);
  for (const x of [-2.0, -1.1, -0.2, 0.7, 1.4]) cyl(x, 2.4, -1.3, 0.036, 0.03, "#2a2c2e", "x", 8);
  // valve
  box(1.95, 1.25, -1.5, 0.11, 0.12, 0.11, BRASS);
  rod([1.95, 1.25, -1.5], [1.95, 1.25, -1.43], 0.012, BRASS);
  b.part(new THREE.TorusGeometry(0.085, 0.012, 5, 14), "#b8321f", { at: [1.95, 1.25, -1.42] });
  rod([1.865, 1.25, -1.42], [2.035, 1.25, -1.42], 0.008, "#b8321f");
  rod([1.95, 1.165, -1.42], [1.95, 1.335, -1.42], 0.008, "#b8321f");
  box(1.95, 0.8, -1.5, 0.1, 0.12, 0.1, "#e0b020");

  // ---- left-wall lockers
  const lock = [
    { z: -1.0, tex: lockerTex("#aab4b8", "COLD STORE 01", "-04C", "PERISHABLES / CREW") },
    { z: -0.2, tex: lockerTex("#9aa8ae", "FREEZER 02", "-21C", "LONG-TERM RATIONS") },
    { z: 0.6, tex: lockerTex("#b8b49c", "DRY STORE 03", "21C", "CANS / POWDERS / SALT") },
  ];
  for (const l of lock) {
    box(1.875, 1.025, l.z, 0.45, 1.95, 0.8, "#4a4e52");
    decal(l.tex, 1.648, 1.01, l.z, 0.74, 1.78, [-1, 0, 0]);
    box(1.628, 1.15, l.z + 0.3, 0.035, 0.55, 0.035, STEEL);
    for (const y of [0.92, 1.38]) box(1.64, y, l.z + 0.3, 0.02, 0.025, 0.025, STEELD);
    glow(box(1.642, 0.2, l.z - 0.3, 0.008, 0.012, 0.012, "#56e07a"), 1.5);
  }
  // ducts above the lockers
  box(1.9, 2.25, -0.1, 0.35, 0.28, 2.6, CEILP);
  for (const z of [-1.2, -0.5, 0.2, 0.9]) box(1.9, 2.25, z, 0.39, 0.32, 0.04, STEELD);
  for (let i = 0; i < 4; i++) box(1.722, 2.25, 0.2 + i * 0.5 - 0.5, 0.008, 0.02, 0.36, "#111214");
  // hatch with hazard frame
  const hz = 1.55;
  decal(hatchTex(), LX - 0.006, 1.0, hz, 0.8, 1.9, [-1, 0, 0]);
  for (const s of [-1, 1]) box(LX - 0.02, 1.02, hz + s * 0.42, 0.04, 2.0, 0.06, HAZARD);
  box(LX - 0.02, 2.0, hz, 0.04, 0.06, 0.9, HAZARD);
  decal(signTex(), LX - 0.01, 2.2, hz, 0.8, 0.18, [-1, 0, 0]);
  glow(box(LX - 0.03, 2.33, hz, 0.02, 0.025, 0.5, "#fff0c4"), 1.0);

  // ---- mess table
  const TXc = -0.45, TZc = 0.45;
  b.extrude([[-0.95, -0.43], [0.95, -0.43], [0.95, 0.43], [-0.95, 0.43]], {
    at: [TXc, TT - 0.025, TZc],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.05,
    bevel: 0.008,
    smoothing: 2,
    color: TABLETOP,
  });
  for (const s of [-1, 1]) {
    cyl(TXc + s * 0.55, F + 0.34, TZc, 0.065, 0.68, STEEL, "y", 8);
    cyl(TXc + s * 0.55, F + 0.015, TZc, 0.18, 0.03, STEELD, "y", 10);
    cyl(TXc + s * 0.55, TT - 0.06, TZc, 0.12, 0.02, STEELD, "y", 10);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      ball(TXc + s * 0.55 + Math.cos(a) * 0.14, F + 0.035, TZc + Math.sin(a) * 0.14, 0.012, "#1b1b1b");
    }
  }
  // stools
  for (const sz of [-1, 1])
    for (const dx of [-0.55, 0, 0.55]) {
      const x = TXc + dx;
      const z = TZc + sz * 0.68;
      cyl(x, F + 0.015, z, 0.13, 0.03, STEELD, "y", 10);
      cyl(x, F + 0.2, z, 0.035, 0.4, STEEL, "y", 8);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + 0.5;
        rod([x, F + 0.2, z], [x + Math.cos(a) * 0.12, F + 0.2, z + Math.sin(a) * 0.12], 0.008, STEEL);
      }
      b.part(new THREE.TorusGeometry(0.12, 0.011, 5, 12), STEEL, { at: [x, F + 0.2, z], rotation: [90, 0, 0] });
      lathe(x, 0.38, z, [[0, 0], [0.17, 0], [0.19, 0.02], [0.19, 0.06], [0.15, 0.09], [0, 0.09]], VINYL, 12, [0, 1, 0], 1);
      cyl(x, 0.385, z, 0.17, 0.02, "#2a2c2e", "y", 12);
    }
  // trays
  const tray = (x: number, z: number, rot: number) => {
    box(x, TT + 0.01, z, 0.42, 0.02, 0.3, "#8c9096", { rotation: [0, rot, 0] });
    for (const s of [-1, 1]) box(x + Math.cos((rot * Math.PI) / 180) * s * 0.21, TT + 0.025, z - Math.sin((rot * Math.PI) / 180) * s * 0.21, 0.012, 0.025, 0.3, "#6a6e72", { rotation: [0, rot, 0] });
    const foods = ["#c98a3a", "#6a8f3f", "#cfc9a0"];
    foods.forEach((c, i) => {
      const lx = (i - 1) * 0.125;
      const co = Math.cos((rot * Math.PI) / 180);
      const si = Math.sin((rot * Math.PI) / 180);
      ball(x + lx * co, TT + 0.03, z - lx * si, 0.05, c, [1, 0.4, 1]);
    });
  };
  tray(-0.9, 0.28, 4);
  tray(-0.12, 0.64, -8);
  mug(-0.5, TT, 0.3, "#e8e6dc");
  mug(-0.3, TT, 0.62, "#d9772b", 180);
  mug(-0.72, TT, 0.7, "#6a7a82");
  // coffee pot
  cyl(-0.38, TT + 0.01, 0.4, 0.07, 0.02, "#1b1b1b", "y", 10);
  lathe(-0.38, TT + 0.02, 0.4, [[0, 0], [0.06, 0], [0.065, 0.03], [0.055, 0.13], [0.04, 0.17], [0.035, 0.17], [0.05, 0.13], [0.06, 0.03], [0, 0.01]], "#4a2a18", 10);
  // cat bowl
  lathe(0.2, TT, 0.38, [[0, 0], [0.05, 0], [0.075, 0.03], [0.07, 0.034], [0.045, 0.01], [0, 0.01]], "#e8e6dc", 10);
  cyl(0.2, TT + 0.014, 0.38, 0.045, 0.01, "#a8602a", "y", 8);
  // condiments and cans
  cyl(0.28, TT + 0.07, 0.65, 0.028, 0.14, "#b8321f", "y", 8);
  cyl(0.28, TT + 0.15, 0.65, 0.012, 0.03, "#e8e6dc", "y", 6);
  for (const [x, c] of [[0.1, "#e8e6dc"], [0.15, "#2a2a2a"]] as const) {
    cyl(x, TT + 0.03, 0.7, 0.016, 0.06, c, "y", 6);
    cyl(x, TT + 0.065, 0.7, 0.012, 0.012, STEEL, "y", 6);
  }
  can(0.0, TT, 0.2, "#d9772b");
  can(0.07, TT, 0.2, "#56a05a");
  // drinking bird
  {
    const bx = -0.62, bz = 0.52, y0 = TT;
    const th = 0.5, c = Math.cos(th), s = Math.sin(th);
    const P = [bx, y0 + 0.105, bz];
    const at = (ly: number, lz: number, lx = 0): V3 => [bx + lx, P[1] + ly * c - lz * s, P[2] + ly * s + lz * c];
    box(bx, y0 + 0.006, bz, 0.1, 0.012, 0.055, "#2a2a2a");
    for (const sx of [-1, 1]) rod([bx + sx * 0.04, y0 + 0.012, bz], [bx + sx * 0.04, y0 + 0.105, bz], 0.004, "#1b1b1b");
    cyl(bx, y0 + 0.105, bz, 0.005, 0.1, "#1b1b1b", "x", 6);
    const bulb = at(-0.05, 0);
    ball(bulb[0], bulb[1], bulb[2], 0.034, "#c4291d");
    rod(at(-0.03, 0), at(0.15, 0), 0.007, "#9fd0d8");
    const head = at(0.17, 0.005);
    ball(head[0], head[1], head[2], 0.023, "#c4291d");
    const beak = at(0.165, 0.04);
    b.part(new THREE.ConeGeometry(0.014, 0.045, 6), "#b8a060", { at: beak, dir: [0, -s, c] });
    const hat = at(0.19, 0);
    lathe(hat[0], hat[1], hat[2], [[0, 0], [0.042, 0], [0.042, 0.004], [0.022, 0.006], [0.022, 0.045], [0, 0.045]], "#1a1a1a", 10, [0, c, s]);
    for (const sx of [-1, 1]) {
      const e = at(0.18, 0.02, sx * 0.017);
      ball(e[0], e[1], e[2], 0.005, "#111111");
    }
    cyl(bx, y0 + 0.03, bz + 0.13, 0.03, 0.06, "#6aa7c8", "y", 8);
    cyl(bx, y0 + 0.045, bz + 0.13, 0.026, 0.02, "#2e6a98", "y", 8);
  }

  // ---- floor props
  lathe(-1.95, F, -0.55, [[0, 0], [0.17, 0], [0.18, 0.04], [0.18, 0.5], [0.2, 0.52], [0.2, 0.56], [0, 0.58]], "#6a7076", 10);
  cyl(-1.95, F + 0.27, -0.55, 0.183, 0.05, "#d9772b", "y", 10);
  box(-1.95, F + 0.04, -0.34, 0.12, 0.03, 0.08, "#1b1b1b");
  box(-1.85, F + 0.15, 1.55, 0.55, 0.3, 0.4, CRATE);
  box(-1.85, F + 0.3 + 0.1, 1.55, 0.4, 0.2, 0.3, CRATE, { rotation: [0, 14, 0] });
  for (const s of [-1, 1]) box(-1.85 + s * 0.12, F + 0.15, 1.75, 0.04, 0.3, 0.012, "#e0b020");
  box(-1.85, F + 0.2, 1.752, 0.18, 0.1, 0.004, "#e0b020");

  return b.root;
}
