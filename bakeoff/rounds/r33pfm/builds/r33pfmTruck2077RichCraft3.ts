import * as THREE from "three";
import { createBuilder, rng, paint, mottle, patches, noise, smoothstep, mix, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Warhound 6x6 — 2077 militarised truck",
  description: "Low-poly cyberpunk armoured 6x6 truck with railgun turret, missile pods, neon trim and decals.",
};

type V = [number, number, number];

// ---------- palette ----------
const CYAN = "#19f2ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb02e";
const RED = "#ff2a3c";
const YELLOW = "#f2c71c";
const TIRE = "#17181d";
const DARK = "#0d0f14";
const STEEL = "#4a5262";
const GLASS = "#0a2a38";

const CAMO = patches("#2b342f", ["#35423a", "#232a2a", "#443f31", "#2d3a44"], { size: 0.55, gap: 0.04, seed: 4 });
const HULL = panelled(CAMO, { size: 0.5, aspect: 0.6, rivets: 0.06 });
const HULL2 = panelled(paint((p, n) => {
  const base: [number, number, number] = [0.14, 0.16, 0.19];
  const dirt = smoothstep(0.55, 0.8, noise(p, 0.3, 3)) * smoothstep(1.3, 0.3, p.y);
  return mix(base, [0.28, 0.22, 0.14], dirt * 0.8 + 0.1 * Math.max(n.y, 0));
}), { size: 0.4, rivets: 0.05 });
const IRON = metal("iron", { tarnish: 0.5 });
const GUN = metal("blued", { polish: 0.5 });
const BRASS = metal("brass", { tarnish: 0.6 });

// ---------- textures ----------
const hazard = (() => {
  let s = "";
  for (let i = -8; i < 12; i++) s += `<polygon points="${i * 8},64 ${i * 8 + 4},64 ${i * 8 + 36},0 ${i * 8 + 32},0" fill="#f2c71c"/>`;
  return svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#111"/>${s}</svg>`, { size: 128 });
})();
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0b0d12" stroke="#ff2bd6" stroke-width="5"/>
  <polygon points="50,18 80,34 80,66 50,82 20,66 20,34" fill="none" stroke="#19f2ff" stroke-width="3"/>
  <path d="M24 40 L50 52 L76 40 L66 62 L50 70 L34 62 Z" fill="#ff2bd6"/>
  <path d="M34 47 L46 53 L44 58 L35 54 Z M66 47 L54 53 L56 58 L65 54 Z" fill="#0b0d12"/>
  <path d="M42 66 L50 62 L58 66" stroke="#0b0d12" stroke-width="3" fill="none"/></svg>`, { size: 192 });
const STENCIL = svg(
  `<svg viewBox="0 0 240 64"><rect x="2" y="2" width="236" height="60" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <text x="14" y="32" font-family="monospace" font-weight="bold" font-size="26" fill="#19f2ff">WARHOUND</text>
  <text x="14" y="55" font-family="monospace" font-size="16" fill="#f2c71c">MK-IX // NX-2077</text>
  <rect x="196" y="12" width="32" height="40" fill="#ff2bd6"/><text x="200" y="44" font-family="monospace" font-weight="bold" font-size="28" fill="#0b0d12">77</text></svg>`, { size: 256 });
const HUD = svg(
  `<svg viewBox="0 0 128 40"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2cf6ff"/><stop offset="1" stop-color="#0a5f78"/></linearGradient></defs>
  <rect width="128" height="40" fill="url(#g)"/>
  <path d="M0 14 H128 M0 28 H128" stroke="#063344" stroke-width="2"/>
  <path d="M8 6 H30 M98 6 H120 M60 34 H68 M20 20 H44 M84 20 H108" stroke="#d8ffff" stroke-width="2"/>
  <circle cx="64" cy="20" r="9" fill="none" stroke="#ff2bd6" stroke-width="2"/><path d="M64 8 V32 M52 20 H76" stroke="#ff2bd6" stroke-width="1.5"/></svg>`, { size: 256 });
const DOORS = svg(
  `<svg viewBox="0 0 100 70"><rect width="100" height="70" fill="#14171d"/><rect x="3" y="3" width="94" height="64" fill="none" stroke="#3a4352" stroke-width="2"/>
  <path d="M50 3 V67" stroke="#000" stroke-width="3"/><rect x="8" y="8" width="38" height="54" fill="none" stroke="#2a313d" stroke-width="2"/><rect x="54" y="8" width="38" height="54" fill="none" stroke="#2a313d" stroke-width="2"/>
  <rect x="40" y="30" width="6" height="12" fill="#ff2bd6"/><rect x="54" y="30" width="6" height="12" fill="#ff2bd6"/>
  <text x="12" y="22" font-family="monospace" font-size="8" fill="#f2c71c">CAUTION</text><text x="58" y="22" font-family="monospace" font-size="8" fill="#f2c71c">ARMED</text></svg>`, { size: 192 });
const VENT = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#08090c"/>${[3, 9, 15, 21, 27].map((y) => `<rect x="3" y="${y}" width="58" height="3" fill="#1e232c"/>`).join("")}<rect x="3" y="14" width="58" height="1.5" fill="#ff2bd6"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "warhound" });
  const rand = rng(77);

  // ---------- helpers ----------
  const box = (s: V, c: any, at: V, o: any = {}) => b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, ...o });
  const gbox = (s: V, c: string, at: V, str = 1, o: any = {}) => glow(box(s, c, at, o), str);
  const cyl = (r: number, len: number, c: any, at: V, dir: V, seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at, dir, ...o });
  const tex = (w: number, h: number, t: THREE.Texture, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: t, ...o });
  const mirror = (fn: (s: number) => void) => [1, -1].forEach(fn);

  // ---------- chassis ----------
  box([1.9, 0.6, 7.6], HULL2, [0, 1.2, -0.2]);
  box([1.2, 0.3, 7.8], STEEL, [0, 0.82, -0.2]);                       // ladder frame
  mirror((s) => box([0.14, 0.2, 7.4], IRON, [s * 0.7, 0.75, -0.2]));
  box([2.5, 0.45, 0.45], HULL2, [0, 1.05, 3.8]);                       // front bumper
  tex(2.4, 0.3, hazard, [0, 1.05, 4.03], [0, 0, 1]);
  mirror((s) => box([0.5, 0.5, 0.5], IRON, [s * 1.1, 1.0, 3.65], { rotation: [0, s * 25, 0] }));
  // ram / bull bar
  b.part(new THREE.BoxGeometry(2.4, 0.18, 0.5), IRON, { at: [0, 1.35, 4.0], rotation: [-25, 0, 0] });
  mirror((s) => box([0.1, 0.55, 0.12], IRON, [s * 0.9, 1.3, 3.95]));
  gbox([0.7, 0.1, 0.06], AMBER, [0, 0.9, 4.04], 1.2);                  // winch lamp
  box([0.3, 0.3, 0.3], DARK, [0, 0.9, 3.95]);

  // axles + wheels
  const R = 0.7;
  const axles = [2.7, -0.7, -2.4];
  axles.forEach((z) => {
    cyl(0.1, 2.5, IRON, [0, R, z], [1, 0, 0], 8);
    box([0.9, 0.3, 0.5], IRON, [0, R + 0.05, z]);
  });
  const wheel = (x: number, z: number) => {
    const s = Math.sign(x);
    cyl(R, 0.55, TIRE, [x, R, z], [1, 0, 0], 14);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      box([0.58, 0.1, 0.22], "#24262d", [x, R + (R + 0.02) * Math.cos(a), z + (R + 0.02) * Math.sin(a)], { rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    cyl(0.42, 0.6, GUN, [x, R, z], [1, 0, 0], 10);
    glow(cyl(0.3, 0.63, CYAN, [x, R, z], [1, 0, 0], 10));
    cyl(0.17, 0.68, DARK, [x, R, z], [1, 0, 0], 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.03, 0.08, BRASS, [x + s * 0.34, R + 0.25 * Math.cos(a), z + 0.25 * Math.sin(a)], [1, 0, 0], 5);
    }
  };
  axles.forEach((z) => mirror((s) => {
    wheel(s * 1.25, z);
    box([0.8, 0.08, 1.75], HULL, [s * 1.3, 1.5, z]);                    // fender
    box([0.08, 0.3, 1.7], HULL2, [s * 1.68, 1.36, z]);                  // flare
    gbox([0.04, 0.04, 1.5], MAGENTA, [s * 1.73, 1.52, z], 1);
  }));

  // underglow & side tanks
  mirror((s) => {
    gbox([0.05, 0.06, 6.8], CYAN, [s * 0.98, 0.6, -0.2], 1.2);
    cyl(0.26, 1.3, HULL2, [s * 1.1, 1.05, 1.0], [0, 0, 1], 8);
    [0.5, 1.0, 1.5].forEach((z) => glow(cyl(0.275, 0.06, AMBER, [s * 1.1, 1.05, z], [0, 0, 1], 8)));
  });

  // ---------- cab ----------
  b.extrude(
    [[1.0, 1.5], [3.6, 1.5], [3.6, 2.0], [2.95, 2.3], [2.35, 3.1], [1.0, 3.1]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.04, color: HULL },
  );
  tex(1.9, 0.7, HUD, [0, 2.7 + 0.007, 2.65 + 0.01], [0, 0.6, 0.8]);
  glow(b.part(new THREE.PlaneGeometry(1.9, 0.7), "#ffffff", { at: [0, 2.708, 2.66], dir: [0, 0.6, 0.8], axis: "z", texture: HUD }), 0.8);
  box([2.0, 0.07, 0.07], DARK, [0, 2.36 + 0.0, 2.93], { rotation: [37, 0, 0] });
  box([2.0, 0.07, 0.07], DARK, [0, 3.05, 2.4], { rotation: [37, 0, 0] });
  mirror((s) => {
    box([0.07, 0.75, 0.07], DARK, [s * 0.98, 2.7, 2.65], { rotation: [37, 0, s * 6] });
    // side window + doors
    tex(1.0, 0.5, HUD, [s * 1.106, 2.6, 1.8], [s, 0, 0], { color: "#ffffff" });
    box([0.04, 0.04, 1.6], DARK, [s * 1.105, 2.2, 1.9]);
    box([0.04, 0.9, 0.04], DARK, [s * 1.105, 2.2, 1.35]);
    box([0.04, 0.9, 0.04], DARK, [s * 1.105, 2.2, 2.4]);
    gbox([0.06, 0.05, 0.25], CYAN, [s * 1.12, 2.1, 1.55], 1);
    // armour wedges on cab flanks
    box([0.1, 0.5, 1.2], HULL2, [s * 1.15, 1.85, 3.0], { rotation: [0, 0, s * -8] });
    box([0.1, 0.4, 0.9], HULL2, [s * 1.15, 2.7, 1.2]);
    // mirrors
    box([0.05, 0.05, 0.5], IRON, [s * 1.3, 2.55, 2.5], { rotation: [0, s * 40, 0] });
    box([0.08, 0.4, 0.25], DARK, [s * 1.4, 2.5, 2.35]);
    gbox([0.02, 0.28, 0.16], CYAN, [s * 1.4 + s * 0.045, 2.5, 2.35], 0.7);
    // headlights
    gbox([0.42, 0.14, 0.05], "#d9fbff", [s * 0.8, 1.72, 3.62], 1.8);
    gbox([0.42, 0.05, 0.05], MAGENTA, [s * 0.8, 1.55, 3.62], 1.2);
    // exhaust stacks
    b.rod([s * 1.0, 1.4, 0.75], [s * 1.0, 3.4, 0.75], 0.09, GUN, { sides: 8 });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), AMBER, { at: [s * 1.0, 3.43, 0.75] }), 1.5);
    box([0.14, 0.14, 0.14], IRON, [s * 1.0, 2.2, 0.75]);
    box([0.14, 0.14, 0.14], IRON, [s * 1.0, 3.0, 0.75]);
  });
  // grille
  box([1.0, 0.42, 0.06], DARK, [0, 1.75, 3.62]);
  tex(0.9, 0.38, VENT, [0, 1.75, 3.655], [0, 0, 1]);
  tex(0.5, 0.5, EMBLEM, [0, 2.15, 3.3 + 0.0], [0, 0.3, 1], { at: [0, 2.15, 3.3] } as any);
  // hood details
  box([0.9, 0.12, 0.7], IRON, [0, 2.3, 3.1], { rotation: [-12, 0, 0] });
  tex(0.8, 0.4, VENT, [0, 2.37, 3.1], [0, 1, 0.2]);
  mirror((s) => box([0.3, 0.05, 0.6], DARK, [s * 0.6, 2.21, 3.1], { rotation: [-15, 0, 0] }));
  // roof light bar + spots
  gbox([1.6, 0.08, 0.1], MAGENTA, [0, 3.17, 2.28], 1.5);
  gbox([1.6, 0.04, 0.06], CYAN, [0, 3.17, 2.36], 1.2);
  mirror((s) => {
    box([0.2, 0.2, 0.3], DARK, [s * 0.75, 3.22, 1.3]);
    gbox([0.14, 0.14, 0.04], "#fff7d0", [s * 0.75, 3.22, 1.46], 1.8);
  });

  // ---------- turret & railgun ----------
  cyl(0.5, 0.12, IRON, [0, 3.16, 1.7], [0, 1, 0], 10);
  b.part(new THREE.BoxGeometry(1.1, 0.42, 1.1), HULL, { at: [0, 3.48, 1.7], flat: true });
  box([1.3, 0.3, 0.3], HULL2, [0, 3.5, 2.3]);                              // mantlet
  box([0.7, 0.2, 0.7], HULL2, [0, 3.78, 1.6], { rotation: [-8, 0, 0] });
  gbox([0.5, 0.05, 0.08], CYAN, [0, 3.72, 2.08], 1.2);
  mirror((s) => {
    b.rod([s * 0.24, 3.5, 2.2], [s * 0.24, 3.5, 4.1], 0.07, GUN, { sides: 8 });
    [2.5, 2.9, 3.3, 3.7].forEach((z) => glow(cyl(0.12, 0.08, CYAN, [s * 0.24, 3.5, z], [0, 0, 1], 8), 1.4));
    box([0.1, 0.1, 0.4], DARK, [s * 0.55, 3.45, 2.4]);
  });
  box([0.2, 0.2, 0.2], DARK, [0, 3.5, 4.05]);
  // sensor ball
  b.part(new THREE.SphereGeometry(0.16, 8, 6), DARK, { at: [0.0, 3.85, 2.0] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0, 3.87, 2.13] }), 1.6);

  // ---------- cargo container ----------
  const cz = -1.75;
  box([2.3, 1.5, 4.5], HULL, [0, 2.25, cz]);
  box([2.4, 0.1, 4.6], HULL2, [0, 3.03, cz]);
  box([2.4, 0.1, 4.6], HULL2, [0, 1.52, cz]);
  [-3.5, -2.2, -0.9].forEach((z) => mirror((s) => box([0.1, 1.5, 0.12], IRON, [s * 1.18, 2.25, z + 0.0])));
  mirror((s) => {
    gbox([0.05, 0.05, 4.5], MAGENTA, [s * 1.2, 3.0, cz], 1.2);
    gbox([0.05, 0.05, 4.5], CYAN, [s * 1.2, 1.56, cz], 1);
    tex(1.4, 1.4, EMBLEM, [s * 1.162, 2.4, -0.9], [s, 0, 0]);
    tex(1.9, 0.5, STENCIL, [s * 1.162, 1.95, -2.95], [s, 0, 0]);
    tex(1.0, 0.3, hazard, [s * 1.162, 3.0 - 0.15, -3.55], [s, 0, 0]);
    tex(0.9, 0.3, VENT, [s * 1.162, 2.7, -2.2], [s, 0, 0]);
    tex(0.9, 0.3, VENT, [s * 1.162, 2.3, -2.2], [s, 0, 0]);
    box([0.14, 0.6, 1.0], HULL2, [s * 1.2, 2.3, -3.6]);
    gbox([0.03, 0.4, 0.04], AMBER, [s * 1.275, 2.3, -3.2], 1);
    // side ammo boxes
    box([0.25, 0.3, 0.7], IRON, [s * 1.3, 1.3, -2.0 + 0.0]);
    // rear lamps
    gbox([0.3, 0.12, 0.05], RED, [s * 0.95, 1.4, -4.03], 1.5);
    gbox([0.3, 0.12, 0.05], RED, [s * 0.95, 1.1, -4.03], 1);
  });
  // rear doors
  tex(2.0, 1.4, DOORS, [0, 2.25, cz - 2.255], [0, 0, -1]);
  box([2.5, 0.35, 0.4], HULL2, [0, 1.0, -4.2]);
  tex(2.3, 0.25, hazard, [0, 1.0, -4.41], [0, 0, -1]);
  box([0.4, 0.2, 0.5], IRON, [0, 0.9, -4.5]);
  cyl(0.1, 0.3, GUN, [0, 0.9, -4.8], [0, 0, 1], 8);

  // roof of container: vents, domes, missile pods, radar
  [-2.6, -1.8, -0.9].forEach((z) => {
    box([0.7, 0.1, 0.45], DARK, [0.0, 3.12, z + 0.0]);
    tex(0.65, 0.4, VENT, [0, 3.18, z], [0, 1, 0], { up: [0, 0, 1] });
  });
  b.part(new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), IRON, { at: [0.7, 3.08, -3.4] });
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), CYAN, { at: [0.7, 3.37, -3.4] }), 1.5);
  // radar dish
  cyl(0.06, 0.4, IRON, [-0.7, 3.25, -3.3], [0, 1, 0], 6);
  b.part(new THREE.ConeGeometry(0.4, 0.15, 10, 1, true), STEEL, { at: [-0.7, 3.5, -3.3], dir: [0, 0.6, -1], axis: "y", flat: true });
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [-0.7, 3.6, -3.45] }), 1.4);
  // missile pods (tilted 30°)
  const ang = (30 * Math.PI) / 180;
  const fwd: V = [0, Math.sin(ang), Math.cos(ang)];
  const upv: V = [0, Math.cos(ang), -Math.sin(ang)];
  mirror((s) => {
    const base: V = [s * 0.62, 3.4, -1.0];
    box([0.9, 0.75, 1.3], HULL2, base, { rotation: [-30, 0, 0] });
    box([0.5, 0.3, 0.3], IRON, [s * 0.62, 3.2, -1.5]);
    for (let gx = 0; gx < 3; gx++)
      for (let gu = 0; gu < 2; gu++) {
        const ox = (gx - 1) * 0.27;
        const ou = (gu - 0.5) * 0.3;
        const at: V = [base[0] + ox + 0, base[1] + upv[1] * ou + fwd[1] * 0.55, base[2] + upv[2] * ou + fwd[2] * 0.55];
        cyl(0.11, 0.5, DARK, at, fwd, 6);
        glow(cyl(0.07, 0.04, AMBER, [at[0], at[1] + fwd[1] * 0.26, at[2] + fwd[2] * 0.26], fwd, 6), 1.2);
        b.part(new THREE.ConeGeometry(0.06, 0.18, 6), RED, { at: [at[0], at[1] + fwd[1] * 0.18, at[2] + fwd[2] * 0.18 + 0.0], dir: fwd });
      }
  });
  // antennas
  [[-0.95, -3.7, 4.3], [0.95, -3.7, 4.0], [1.0, 0.7, 3.9]].forEach(([x, z, top]) => {
    b.rod([x, x > 0 && z > 0 ? 3.1 : 3.05, z], [x, top, z], [0.025, 0.01], IRON, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.045, 5, 4), z > 0 ? CYAN : MAGENTA, { at: [x, top + 0.03, z] }), 1.8);
  });
  // spot greebles: rivet-like plates scattered on container sides
  mirror((s) => {
    for (let i = 0; i < 8; i++) {
      const z = -3.9 + rand() * 4.0;
      const y = 1.7 + rand() * 1.1;
      box([0.04, 0.12 + rand() * 0.1, 0.18 + rand() * 0.2], rand() > 0.5 ? IRON : STEEL, [s * 1.17, y, z]);
    }
  });
  // cables along the frame
  mirror((s) => b.sweep([[s * 0.5, 0.95, 3.4], [s * 0.45, 0.7, 1.0], [s * 0.5, 0.95, -1.5], [s * 0.45, 0.75, -3.6]], 0.03, { color: "#222", sides: 5 }));
  // door handle glows
  mirror((s) => gbox([0.05, 0.06, 0.2], YELLOW, [s * 1.12, 2.45, 2.35], 1));

  return b.root;
}
