import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, mottle } from "../../../../src/index";
import { panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aegis CV-07 Convoy Hauler",
  description:
    "Low-poly cyberpunk six-wheel armoured convoy hauler with a roof turret, neon underglow and a sealed barrel cargo pod.",
};

// ---------- palette ----------
const DARK = "#12141b";
const GUN = "#2a3040";
const PLATE = "#3a4358";
const STEEL = "#8e98ad";
const NUT = "#d8dbe4";
const GILT = "#c9a24a";
const TYRE = "#15161b";
const CYAN = "#2ff3ff";
const MAG = "#ff2e9a";
const AMBER = "#ffb020";
const RED = "#ff2a3c";
const WHITE = "#e8f6ff";

// ---------- paints ----------
const HULLBASE = paint((p, n) => {
  const base = mix("#2b3342", "#3f495e", noise(p, 0.5, 3));
  const dirt = smoothstep(1.4, 0.3, p.y) * 0.55;
  const top = smoothstep(0.3, 0.9, n.y) * 0.14;
  return mix(mix(base, "#7a84a0", top), "#15151a", dirt);
});
const HULL = panelled(HULLBASE, { size: 0.55, aspect: 0.8, rivets: 0.09 });
const PODP = panelled(mottle("#aeb9d0", "#8793ae", { size: 0.45, seed: 4 }), { size: 0.75, aspect: 1, rivets: 0.1 });
const FRAME = panelled(paint((p) => mix("#1a1d27", "#30364a", noise(p, 0.3, 8))), { size: 0.4, rivets: 0 });

// ---------- textures ----------
const stripesSvg = (() => {
  let s = "";
  for (let i = -1; i < 14; i++) s += `<path d="M${i * 10} 20 l10 -20 h6 l-10 20z" fill="#12131a"/>`;
  return `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="20" fill="${AMBER}"/>${s}<rect x="1" y="1" width="118" height="18" fill="none" stroke="#12131a" stroke-width="2"/></svg>`;
})();
const HAZ = svg(stripesSvg, { size: 256 });
const DOOR = svg(
  `<svg viewBox="0 0 110 40" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="40" rx="4" fill="#10131c" stroke="${CYAN}" stroke-width="2"/>
  <text x="55" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="${AMBER}">CV-07</text>
  <text x="55" y="33" text-anchor="middle" font-family="sans-serif" font-size="7" fill="${CYAN}">AEGIS ESCORT ◆ ARMED</text>
  <rect x="6" y="5" width="30" height="3" fill="${MAG}"/><rect x="74" y="5" width="30" height="3" fill="${MAG}"/></svg>`,
  { size: 256 },
);
const EMB = svg(
  `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="156" height="96" rx="8" fill="#0d1018" stroke="${AMBER}" stroke-width="4"/>
  <polygon points="42,14 66,28 66,56 42,70 18,56 18,28" fill="#1b2030" stroke="${MAG}" stroke-width="3"/>
  <circle cx="42" cy="42" r="10" fill="none" stroke="${CYAN}" stroke-width="3"/><path d="M42 24v36M26 33l32 18M58 33L26 51" stroke="${CYAN}" stroke-width="2"/>
  <text x="112" y="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="${AMBER}">SEALED</text>
  <text x="112" y="58" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${CYAN}">CARGO POD 7-K</text>
  <text x="112" y="76" text-anchor="middle" font-family="monospace" font-size="8" fill="#c9d3ea">DO NOT BREACH</text>
  <path d="M10 90h140" stroke="${MAG}" stroke-width="3" stroke-dasharray="8 4"/></svg>`,
  { size: 384 },
);
const HATCH = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#232a3a" stroke="#0d1018" stroke-width="3"/>
  <circle cx="50" cy="50" r="36" fill="#161b27" stroke="${AMBER}" stroke-width="3"/>
  <path d="M30 40l20 -12l20 12M30 56l20 -12l20 12M30 72l20 -12l20 12" fill="none" stroke="${AMBER}" stroke-width="4"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${50 + 42 * Math.cos((i * Math.PI) / 4)}" cy="${50 + 42 * Math.sin((i * Math.PI) / 4)}" r="2.6" fill="${STEEL}"/>`).join("")}
  <circle cx="50" cy="14" r="4" fill="${MAG}"/></svg>`,
  { size: 256 },
);
const WIND = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b2a3a"/><stop offset="1" stop-color="#07101c"/></linearGradient></defs>
  <rect width="100" height="40" fill="url(#g)"/><path d="M8 40L30 0h8L16 40zM44 40L66 0h4L48 40z" fill="#2ff3ff" opacity="0.18"/>
  <path d="M10 30h30M60 8h30" stroke="${CYAN}" stroke-width="1" opacity="0.8"/><rect x="62" y="24" width="28" height="10" fill="none" stroke="${MAG}" stroke-width="1"/>
  <text x="76" y="32" text-anchor="middle" font-family="monospace" font-size="7" fill="${MAG}">LOCK 98%</text>
  <rect x="0" y="0" width="100" height="40" fill="none" stroke="#050810" stroke-width="3"/></svg>`,
  { size: 384 },
);
const SIDE = svg(
  `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="30" fill="#0a2230"/><path d="M6 30L22 0h6L12 30z" fill="${CYAN}" opacity="0.25"/><rect width="60" height="30" fill="none" stroke="#050810" stroke-width="3"/><rect x="40" y="20" width="14" height="3" fill="${MAG}"/></svg>`,
  { size: 160 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 90 22" xmlns="http://www.w3.org/2000/svg"><rect width="90" height="22" fill="#0b0d13" stroke="${STEEL}" stroke-width="1.5"/>
  ${[3, 7, 11, 15, 19].map((y) => `<rect x="4" y="${y}" width="82" height="1.6" fill="${CYAN}" opacity="0.7"/>`).join("")}
  <polygon points="45,3 52,11 45,19 38,11" fill="#0b0d13" stroke="${MAG}" stroke-width="2"/></svg>`,
  { size: 256 },
);
const NUMPLATE = svg(
  `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="20" rx="2" fill="#e8e2c8" stroke="#111" stroke-width="1.5"/><text x="30" y="14" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" fill="#1b1b1b">N1GHT-07</text></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...o });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex });
  const bolts = (cx: number, cy: number, cz: number, dx: number, dz: number, dy: number, s: number) => {
    for (const a of [-1, 1])
      for (const c of [-1, 1]) cyl(0.035, 0.05, 6, NUT, [cx, cy + c * dy, cz + a * dz], [s, 0, 0]);
    void dx;
  };

  // ---------- chassis ----------
  for (const s of [1, -1]) {
    box(0.32, 0.4, 9.6, FRAME, [s * 0.75, 0.78, -0.5]);
    box(0.06, 0.3, 9.4, PLATE, [s * 0.93, 0.78, -0.5]);
    // underglow
    glow(b.part(new THREE.BoxGeometry(0.07, 0.07, 8.2), MAG, { at: [s * 1.02, 0.52, -0.5] }), 1.4);
  }
  for (const z of [3.9, 2.0, 0.2, -1.5, -3.0, -4.4]) box(1.6, 0.25, 0.3, FRAME, [0, 0.8, z]);
  // axles + diffs
  for (const z of [3.0, -1.8, -3.2]) {
    cyl(0.1, 3.0, 8, DARK, [0, 0.625, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), GUN, { at: [0, 0.6, z], scale: [1, 0.9, 1] });
    cyl(0.07, 0.4, 6, STEEL, [0.4, 0.8, z + 0.1], [0, 1, 0]);
  }

  // ---------- wheels ----------
  const R = 0.62;
  const wheel = (x: number, z: number) => {
    const s = Math.sign(x);
    const y = 0.625;
    cyl(R, 0.5, 14, TYRE, [x, y, z], [1, 0, 0]);
    for (let k = 0; k < 12; k++) {
      const t = (k / 12) * Math.PI * 2;
      box(0.52, 0.05, 0.22, "#0b0b0f", [x, y + 0.64 * Math.cos(t), z + 0.64 * Math.sin(t)], {
        rotation: [(t * 180) / Math.PI, 0, 0],
      });
    }
    cyl(0.4, 0.54, 12, STEEL, [x, y, z], [1, 0, 0]);
    cyl(0.33, 0.06, 12, DARK, [x + s * 0.28, y, z], [1, 0, 0]);
    cyl(0.14, 0.12, 8, GILT, [x + s * 0.32, y, z], [1, 0, 0]);
    cyl(0.05, 0.16, 6, NUT, [x + s * 0.36, y, z], [1, 0, 0]);
    for (let k = 0; k < 6; k++) {
      const t = (k / 6) * Math.PI * 2;
      cyl(0.03, 0.07, 6, NUT, [x + s * 0.33, y + 0.22 * Math.cos(t), z + 0.22 * Math.sin(t)], [1, 0, 0]);
    }
    box(0.04, 0.08, 0.04, AMBER, [x + s * 0.3, y + 0.28, z + 0.0]); // valve stem marker
    // brake caliper inside
    box(0.1, 0.22, 0.14, "#b02040", [x - s * 0.2, y, z + 0.34]);
    // fender arch
    const pts: [number, number][] = [];
    for (let k = 0; k <= 6; k++) {
      const a = Math.PI - (k * Math.PI) / 6;
      pts.push([0.84 * Math.cos(a), 0.84 * Math.sin(a)]);
    }
    for (let k = 6; k >= 0; k--) {
      const a = Math.PI - (k * Math.PI) / 6;
      pts.push([0.7 * Math.cos(a), 0.7 * Math.sin(a)]);
    }
    b.extrude(pts, { at: [x, y, z], x: [0, 0, 1], thickness: 0.62, bevel: 0.03, color: HULL });
    glow(box(0.64, 0.03, 0.05, CYAN, [x, y + 0.85, z + 0.0]), 1.2);
  };
  for (const s of [1, -1]) for (const z of [3.0, -1.8, -3.2]) wheel(s * 1.45, z);
  for (const s of [1, -1])
    for (const z of [-3.95]) {
      box(0.6, 0.5, 0.04, DARK, [s * 1.45, 0.45, z - 0.0]);
      box(0.4, 0.06, 0.05, AMBER, [s * 1.45, 0.3, z - 0.03]);
    }

  // ---------- cab ----------
  const prof: [number, number][] = [
    [0, 0], [3.0, 0], [3.1, 0.55], [2.5, 0.95], [1.9, 1.25], [1.45, 2.0], [0.1, 2.05], [0, 1.9],
  ];
  b.extrude(prof, { at: [0, 1.0, 1.0], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: HULL });
  // hood vents
  for (let i = 0; i < 4; i++) {
    const u = 2.0 + i * 0.16;
    const v = 1.25 - (u - 1.9) * 0.5;
    box(1.1, 0.025, 0.07, DARK, [0, 1 + v + 0.02, 1 + u], { rotation: [26.6, 0, 0] });
  }
  glow(box(0.06, 0.02, 0.7, MAG, [0, 1 + 1.05 + 0.025, 1 + 2.25], { rotation: [26.6, 0, 0] }), 1.1);
  // windshield
  const wn = [0, 0.514, 0.857];
  glow(plane(2.05, 0.86, WIND, [0, 2.63 + 0.02, 2.68 + 0.03], wn), 0.7);
  box(2.2, 0.06, 0.08, DARK, [0, 3.0, 2.46], { rotation: [-31, 0, 0] }); // visor frame
  // grille + headlights
  const fn = [0, -0.18, 1];
  plane(1.7, 0.42, GRILLE, [0, 1.22, 4.1], fn);
  for (const s of [1, -1]) {
    glow(plane(0.42, 0.2, svg(`<svg viewBox="0 0 40 20"><rect width="40" height="20" rx="4" fill="#f4ffff"/><rect x="4" y="8" width="32" height="4" fill="${CYAN}"/></svg>`, { size: 128 }), [s * 0.95, 1.38, 4.08], fn), 1.8);
    box(0.5, 0.3, 0.04, DARK, [s * 0.95, 1.38, 4.075], { rotation: [-10, 0, 0] });
  }
  // bumper
  box(2.5, 0.38, 0.36, FRAME, [0, 0.78, 4.25]);
  plane(2.35, 0.3, HAZ, [0, 0.78, 4.435], [0, 0, 1]);
  box(2.6, 0.08, 0.4, PLATE, [0, 0.99, 4.25]);
  for (let i = 0; i < 5; i++) b.spike([-1.0 + i * 0.5, 0.62, 4.43], [0, 0, 1], 0.24, 0.07, { color: STEEL });
  plane(0.3, 0.1, NUMPLATE, [0.7, 0.9, 4.1], [0, 0, 1]);
  // tow hooks
  for (const s of [1, -1]) cyl(0.05, 0.3, 6, GILT, [s * 1.0, 0.55, 4.45], [0, 0, 1]);
  // cab sides: windows, armour, signs
  for (const s of [1, -1]) {
    glow(plane(0.95, 0.55, SIDE, [s * 1.17, 2.58, 1.95], [s, 0, 0]), 0.6);
    // armour door plate
    box(0.08, 0.95, 1.4, PLATE, [s * 1.19, 1.62, 1.95]);
    bolts(s * 1.235, 1.62, 1.95, 0, 0.62, 0.42, s);
    plane(1.1, 0.4, DOOR, [s * 1.236, 1.64, 1.95], [s, 0, 0]);
    box(0.05, 0.05, 0.22, STEEL, [s * 1.24, 2.05, 1.5]); // handle
    box(0.04, 0.9, 0.02, DARK, [s * 1.24, 1.62, 2.67]); // door seam
    // side skirt and step
    box(0.2, 0.08, 1.4, GUN, [s * 1.25, 1.08, 1.95]);
    glow(box(0.04, 0.04, 1.3, CYAN, [s * 1.36, 1.08, 1.95]), 1.2);
    // mirror
    box(0.04, 0.04, 0.4, DARK, [s * 1.4, 2.5, 2.35], { rotation: [0, 0, 0] });
    box(0.1, 0.4, 0.18, GUN, [s * 1.62, 2.5, 2.4]);
    glow(box(0.02, 0.3, 0.12, CYAN, [s * 1.675, 2.5, 2.4]), 0.8);
    // exhaust stack
    cyl(0.1, 2.5, 8, "#5a6176", [s * 1.28, 2.2, 0.85], [0, 1, 0]);
    for (const y of [1.6, 2.2, 2.8]) cyl(0.125, 0.12, 8, GILT, [s * 1.28, y, 0.85], [0, 1, 0]);
    cyl(0.14, 0.1, 8, DARK, [s * 1.28, 3.5, 0.85], [0, 1, 0]);
    glow(cyl(0.07, 0.02, 8, AMBER, [s * 1.28, 3.56, 0.85], [0, 1, 0]), 1.5);
    // battery packs
    box(0.32, 0.52, 2.8, PLATE, [s * 1.38, 0.82, 0.6]);
    for (let i = 0; i < 4; i++) glow(box(0.04, 0.24, 0.4, CYAN, [s * 1.55, 0.82, -0.4 + i * 0.65]), 1.2);
    bolts(s * 1.56, 0.82, 0.6, 0, 1.3, 0.2, s);
  }
  // cab rear guard
  box(2.3, 1.9, 0.14, PLATE, [0, 2.0, 0.93]);
  glow(box(1.8, 0.05, 0.03, MAG, [0, 2.4, 0.855]), 1.2);
  for (let i = 0; i < 5; i++) box(0.05, 1.7, 0.05, DARK, [-0.9 + i * 0.45, 2.0, 0.85]);

  // roof: light bar, turret, antenna
  glow(box(0.8, 0.1, 0.14, CYAN, [-0.42, 3.13, 2.3]), 1.4);
  glow(box(0.8, 0.1, 0.14, MAG, [0.42, 3.13, 2.3]), 1.4);
  box(1.8, 0.05, 0.2, DARK, [0, 3.07, 2.3]);
  cyl(0.38, 0.14, 10, PLATE, [0, 3.12, 1.65], [0, 1, 0]);
  cyl(0.3, 0.08, 10, STEEL, [0, 3.2, 1.65], [0, 1, 0]);
  box(0.7, 0.34, 0.8, HULL, [0, 3.42, 1.65]);
  box(0.74, 0.1, 0.5, PLATE, [0, 3.62, 1.55]);
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 3.42, 2.0], [s * 0.2, 3.42, 3.0], 0.05, STEEL);
    cyl(0.075, 0.18, 8, DARK, [s * 0.2, 3.42, 3.0], [0, 0, 1]);
    cyl(0.08, 0.1, 8, GILT, [s * 0.2, 3.42, 2.1], [0, 0, 1]);
    box(0.08, 0.2, 0.2, GUN, [s * 0.4, 3.42, 1.9]);
  }
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), RED, { at: [0, 3.5, 2.07] }), 2);
  box(0.2, 0.14, 0.2, DARK, [0.2, 3.7, 1.45]);
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), CYAN, { at: [0.2, 3.7, 1.56] }), 2);
  b.rod([-1.0, 3.05, 1.25], [-1.0, 4.4, 1.25], [0.03, 0.015], DARK);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [-1.0, 4.42, 1.25] }), 2);
  b.rod([1.0, 3.05, 1.25], [1.0, 3.9, 1.25], [0.03, 0.015], DARK);

  // ---------- flatbed + pod ----------
  box(2.4, 0.2, 5.4, FRAME, [0, 1.05, -2.0]);
  glow(box(2.46, 0.04, 5.2, AMBER, [0, 0.94, -2.0]), 0.8);
  // cradles
  const cradle: [number, number][] = [
    [-1.25, 0], [1.25, 0], [1.45, 0.5], [1.2, 1.1], [1.0, 1.0], [1.15, 0.55], [-1.15, 0.55], [-1.0, 1.0], [-1.2, 1.1], [-1.45, 0.5],
  ];
  for (const z of [-0.9, -3.1]) {
    b.extrude(cradle, { at: [0, 1.15, z], x: [1, 0, 0], thickness: 0.28, bevel: 0.02, color: FRAME });
    bolts(1.3, 1.5, z, 0, 0, 0.0, 1);
  }

  const C = [0, 2.35, -2.0];
  const podOutline: [number, number][] = [
    [0, -2.6], [0.9, -2.5], [1.25, -2.0], [1.3, -1.5], [1.3, 1.5], [1.25, 2.0], [0.9, 2.5], [0, 2.6],
  ];
  const pod = b.lathe(podOutline, { at: C, axis: [0, 0, 1], segments: 8, spin: 22.5, color: PODP });
  for (const z of [-3.8, -2.0, -0.2]) {
    b.lathe([[1.2, -0.12], [1.38, -0.12], [1.38, 0.12], [1.2, 0.12]], { at: [0, 2.35, z], axis: [0, 0, 1], segments: 8, spin: 22.5, color: GUN });
  }
  for (const z of [-2.9, -1.1])
    b.lathe([[1.25, -0.04], [1.34, -0.04], [1.34, 0.04], [1.25, 0.04]], { at: [0, 2.35, z], axis: [0, 0, 1], segments: 8, spin: 22.5, color: DARK });

  const skin = b.surface(pod);
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 90, 0);
    if (hit) b.decal(skin, EMB, { at: hit, dir: [s, 0, 0], size: [1.9, 1.2], mirror: false });
    for (const el of [38, -38]) {
      const h = skin.around(C).at(s * 90, el);
      if (h) {
        const o = [h.at.x + h.n.x * 0.03, h.at.y + h.n.y * 0.03];
        glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 1.9), el > 0 ? MAG : CYAN, { at: [o[0], o[1], -3.0] }), 1.4);
      }
    }
  }
  for (const x of [-0.45, 0.45]) {
    const t = skin.ray([x, 6, -2.0], [0, -1, 0]);
    if (t) glow(b.part(new THREE.BoxGeometry(0.07, 0.05, 3.0), MAG, { at: [x, t.at.y + 0.02, -2.0] }), 1.4);
  }
  const top = skin.ray([0, 6, -2.0], [0, -1, 0]);
  if (top) {
    const y = top.at.y;
    b.lathe([[0, 0], [0.26, 0], [0.22, 0.08], [0.2, 0.2], [0, 0.26]], { at: [0, y, -2.0], segments: 8, color: AMBER });
    glow(b.part(new THREE.SphereGeometry(0.16, 6, 4), AMBER, { at: [0, y + 0.14, -2.0] }), 1.6);
    cyl(0.28, 0.06, 8, DARK, [0, y + 0.01, -2.0], [0, 1, 0]);
    for (const z of [-3.0, -1.0]) {
      box(0.9, 0.06, 0.4, DARK, [0, y + 0.02, z]);
      for (let i = 0; i < 4; i++) box(0.8, 0.02, 0.04, STEEL, [0, y + 0.06, z - 0.12 + i * 0.08]);
    }
  }
  // rear hatch
  const rear = skin.around(C).at(180, 0);
  if (rear) b.decal(skin, HATCH, { at: rear, dir: [0, 0, -1], size: [1.2, 1.2] });
  // front valve cluster
  const front = skin.around(C).at(0, 0);
  if (front) {
    b.stick(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 8), PLATE, front, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6), STEEL, front.moved([0, 0.12, 0]), { embed: 0.1 });
    for (const s of [1, -1]) b.stick(new THREE.BoxGeometry(0.1, 0.1, 0.2), RED, front.moved([s * 0.4, 0, 0.0]), { embed: 0.3 });
  }
  // pod door-lock lights along flanks
  for (const s of [1, -1]) for (const z of [-4.3, -0.4]) glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), z < -2 ? RED : CYAN, { at: [s * 1.12, 2.05, z] }), 2);

  // ---------- rear end ----------
  box(2.7, 0.4, 0.3, FRAME, [0, 0.72, -4.95]);
  plane(2.5, 0.28, HAZ, [0, 0.72, -5.11], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.06, RED, [s * 0.95, 1.08, -5.0]), 1.6);
    glow(box(0.2, 0.18, 0.06, AMBER, [s * 1.18, 1.08, -5.0]), 1.4);
  }
  plane(0.46, 0.15, NUMPLATE, [0, 1.0, -5.03], [0, 0, -1]);
  cyl(0.08, 0.4, 8, STEEL, [0, 0.72, -5.2], [0, 0, 1]); // hitch pin

  // ---------- wheel-well side plates on bed ----------
  for (const s of [1, -1]) {
    box(0.1, 0.5, 5.0, PLATE, [s * 1.25, 1.35, -2.0]);
    for (let i = 0; i < 6; i++) cyl(0.035, 0.05, 6, NUT, [s * 1.31, 1.35, -4.2 + i * 0.85], [s, 0, 0]);
    glow(box(0.03, 0.05, 4.4, AMBER, [s * 1.31, 1.52, -2.0]), 0.9);
  }

  return b.root;
}
