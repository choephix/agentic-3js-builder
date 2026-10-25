import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint, noise, mix, smoothstep, stripes, aim, catmull } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a long elevated railgun, glowing coil rings and four deployed stabiliser legs.",
};

// ---------------------------------------------------------------- palette & paints
const CYAN = "#58f0ff";
const AMBER = "#ffb02e";
const YELLOW = "#e8b800";
const BLACK = "#17181a";

const ARMOR_BASE = paint((p, n) => {
  let c = mix("#46552e", "#6a7a42", smoothstep(0.3, 0.7, noise(p, 1.2, 4)));
  c = mix(c, "#8a7f55", smoothstep(0.62, 0.8, noise(p, 0.5, 9)) * 0.7);
  c = mix(c, "#a3b172", 0.22 * smoothstep(0.5, 1, n.y));
  c = mix(c, "#4a3f2c", smoothstep(1.1, 0.2, p.y) * 0.55 * (0.5 + noise(p, 0.3, 2)));
  return c;
});
const ARMOR = panelled(ARMOR_BASE, { size: 0.9, aspect: 0.7, rivets: 0.15 });
const ARMOR_S = panelled(ARMOR_BASE, { size: 0.55, aspect: 0.8, rivets: 0.12 });
const STEEL = metal("steel", { tarnish: 0.3 });
const DARK = metal("iron");
const BRASS = metal("brass", { tarnish: 0.5 });
const TIRE = paint((p) =>
  mix("#1b1c1f", "#5a4a35", Math.min(1, smoothstep(0.8, 0.0, p.y) * (0.4 + noise(p, 0.3, 2)))),
);
const HAZARD = stripes(YELLOW, BLACK, { size: 0.2, axis: [1, 1, 0], width: 0.5, wobble: 0 });
const PAD = paint((p, n) => mix("#4a4e55", "#8a7a5a", noise(p, 0.25, 6) * 0.8 + 0.2 * (1 - n.y)));

// ---------------------------------------------------------------- textures
const GLASS = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" rx="4" fill="#0e2a3a" stroke="#101418" stroke-width="4"/>
  <rect x="4" y="4" width="92" height="42" fill="#1d5a78"/>
  <path d="M10 46 L40 4 L52 4 L22 46Z" fill="#7fd6ee" opacity="0.5"/><path d="M58 46 L80 4 L86 4 L64 46Z" fill="#7fd6ee" opacity="0.35"/></svg>`,
  { size: 256 },
);
const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#e9e6d6" stroke="#17181a" stroke-width="4"/>
  <circle cx="50" cy="50" r="32" fill="#2c3a25"/>
  <path d="M50 22 L57 42 L78 42 L61 55 L68 76 L50 63 L32 76 L39 55 L22 42 L43 42Z" fill="#e9e6d6"/></svg>`,
  { size: 256 },
);
const NUMBER = svg(
  `<svg viewBox="0 0 160 50"><rect width="160" height="50" rx="4" fill="#17181a" opacity="0.55"/>
  <text x="80" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="36" fill="#e9e6d6">RG-06</text></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="8" fill="#e8b800" stroke="#17181a" stroke-width="6"/>
  <path d="M50 14 L88 78 L12 78Z" fill="none" stroke="#17181a" stroke-width="6" stroke-linejoin="round"/>
  <path d="M54 32 L42 56 L52 56 L46 72 L62 48 L52 48Z" fill="#17181a"/>
  <text x="50" y="94" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#17181a">HIGH VOLT</text></svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#1a1c20" stroke="#0a0a0c" stroke-width="3"/>
  ${[8, 16, 24, 32, 40].map((y) => `<rect x="6" y="${y}" width="88" height="4" fill="#4a505a"/>`).join("")}
  <rect x="44" y="4" width="12" height="42" fill="#2b2f36"/></svg>`,
  { size: 256 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#6a707c" stroke="#23262c" stroke-width="4"/>
  <circle cx="50" cy="50" r="36" fill="#4b505a" stroke="#23262c" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${50 + 26 * Math.cos((i * Math.PI) / 4)}" cy="${50 + 26 * Math.sin((i * Math.PI) / 4)}" r="4.5" fill="#b8bec9" stroke="#23262c" stroke-width="1.5"/>`).join("")}
  <circle cx="50" cy="50" r="13" fill="#e8b800" stroke="#23262c" stroke-width="3"/></svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="6" fill="#1b2a33" stroke="#58f0ff" stroke-width="3"/>
  <path d="M10 30 H90" stroke="#58f0ff" stroke-width="5"/><path d="M10 22 H90 M10 38 H90" stroke="#e9e6d6" stroke-width="2"/>
  <circle cx="82" cy="30" r="5" fill="#58f0ff"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- builder & helpers
export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const cyl = (r: number, len: number, color: any, at: number[], dir: number[], seg = 10, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, flat: true, ...opts });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

  // ------------------------------------------------ hull
  box(2.4, 1.0, 10.5, ARMOR, [0, 1.4, 0.15]); // main hull z -5.1..5.4
  box(2.2, 0.16, 10.2, DARK, [0, 0.88, 0.15]); // skid plate
  box(2.0, 0.12, 8.6, ARMOR_S, [0, 1.96, -0.8]); // raised deck plate
  // sloped nose plate
  b.extrude(
    [[0, 0], [0.5, 0], [0.5, 0.35], [0, 0.55]],
    { at: [0, 1.55, 5.38], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: ARMOR, bevel: 0.03 },
  );
  box(2.6, 0.3, 0.35, HAZARD, [0, 1.0, 5.72]); // bumper
  for (const s of [1, -1]) {
    box(0.3, 0.2, 0.2, DARK, [s * 0.9, 0.82, 5.8]); // tow hooks
    glow(box(0.4, 0.2, 0.1, "#fff3b0", [s * 0.85, 1.85, 5.62]), 1.4); // headlights
    box(0.5, 0.28, 0.06, DARK, [s * 0.85, 1.85, 5.66]); // light bezels
    glow(box(0.3, 0.14, 0.08, "#ff3030", [s * 1.0, 1.5, -5.14]), 1.4); // tail lights
    // mirrors
    b.rod([s * 1.15, 2.3, 4.75], [s * 1.5, 2.45, 4.8], 0.025, DARK);
    box(0.08, 0.38, 0.22, DARK, [s * 1.52, 2.45, 4.8]);
  }
  decal(GRILLE, 1.5, 0.75, [0, 1.35, 5.4], [0, 0, 1]);
  // rear ladder + hitch
  for (const x of [0.75, 1.05]) b.rod([x, 0.95, -5.22], [x, 1.85, -5.22], 0.025, STEEL);
  for (let i = 0; i < 5; i++) box(0.36, 0.035, 0.05, STEEL, [0.9, 1.05 + i * 0.18, -5.24]);
  cyl(0.07, 0.35, DARK, [0, 1.1, -5.3], [0, 0, 1], 8);
  b.part(new THREE.SphereGeometry(0.1, 8, 6), STEEL, { at: [0, 1.1, -5.5] });

  // ------------------------------------------------ cab
  b.extrude(
    [[3.4, 1.88], [5.2, 1.88], [5.2, 2.2], [4.65, 2.92], [3.5, 2.95], [3.4, 2.85]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.04, color: ARMOR_S },
  );
  decal(GLASS, 2.0, 0.85, [0, 2.572, 4.941], [0, 0.607, 0.795]);
  for (const s of [1, -1]) {
    decal(GLASS, 1.0, 0.55, [s * 1.112, 2.45, 4.05], [s, 0, 0]);
    decal(ROUNDEL, 0.36, 0.36, [s * 1.112, 2.2, 3.62], [s, 0, 0]);
  }
  glow(box(1.5, 0.1, 0.28, "#ffd27a", [0, 3.01, 4.4]), 1.0); // roof light bar
  box(1.6, 0.06, 0.34, DARK, [0, 2.97, 4.4]);
  // roof sensors
  cyl(0.05, 0.6, DARK, [-0.85, 3.25, 3.9], [0, 1, 0], 6);
  b.lathe([[0, 0], [0.34, 0.1], [0.34, 0.14], [0, 0.05]], {
    at: [-0.85, 3.55, 3.9], axis: [0, 0.4, 0.9], color: STEEL, segments: 10,
  });
  b.rod([-0.85, 3.55, 3.9], [-0.78, 3.72, 4.25], 0.02, DARK);
  glow(cyl(0.1, 0.16, AMBER, [0.95, 3.04, 3.9], [0, 1, 0], 8), 1.6); // beacon
  b.rod([0.95, 2.95, 3.7], [0.95, 3.7, 3.7], 0.012, DARK); // whip aerial
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.1, 1.2, DARK, [s * 1.0, 2.5, 3.15], [0, 1, 0], 8);
    b.part(new THREE.ConeGeometry(0.14, 0.12, 8), STEEL, { at: [s * 1.0, 3.14, 3.15], flat: true });
  }

  // ------------------------------------------------ wheels
  const wheelZ = [3.9, 0.9, -2.1];
  const lugGeo = (a: number) => {
    const g = new THREE.BoxGeometry(0.58, 0.12, 0.24);
    g.translate(0, 0.68, 0);
    g.rotateX(a);
    return g;
  };
  for (const z of wheelZ) {
    // axle & differential
    cyl(0.12, 3.2, DARK, [0, 0.7, z], [1, 0, 0], 8);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), STEEL, { at: [0, 0.62, z], flat: true });
    for (const s of [1, -1]) {
      const x = s * 1.55;
      cyl(0.7, 0.55, TIRE, [x, 0.7, z], [1, 0, 0], 14);
      const lugs: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 12; i++) lugs.push(lugGeo((i / 12) * Math.PI * 2));
      const merged = mergeGeometries(lugs)!;
      merged.translate(x, 0.7, z);
      b.part(merged, "#141517", { at: [0, 0, 0], flat: true });
      cyl(0.42, 0.6, STEEL, [x, 0.7, z], [1, 0, 0], 12);
      decal(HUB, 0.8, 0.8, [x + s * 0.31, 0.7, z], [s, 0, 0]);
      cyl(0.16, 0.12, DARK, [x + s * 0.34, 0.7, z], [1, 0, 0], 8);
      // fender
      box(0.95, 0.1, 1.9, ARMOR_S, [x, 1.5, z]);
      box(0.95, 0.3, 0.08, ARMOR_S, [x, 1.38, z + 0.95], { rotation: [-25, 0, 0] });
      box(0.95, 0.3, 0.08, ARMOR_S, [x, 1.38, z - 0.95], { rotation: [25, 0, 0] });
      b.rod([s * 1.2, 1.0, z], [x - s * 0.1, 0.8, z], 0.07, DARK); // suspension arm
    }
  }
  // mud flaps
  for (const s of [1, -1]) box(0.8, 0.5, 0.05, "#1b1c1f", [s * 1.55, 0.95, -3.05]);

  // side details on hull between wheels
  for (const s of [1, -1]) {
    box(0.38, 0.62, 1.2, ARMOR, [s * 1.4, 1.25, -0.6]); // tool box
    box(0.4, 0.06, 1.0, DARK, [s * 1.41, 1.58, -0.6]);
    decal(ROUNDEL, 0.6, 0.6, [s * 1.212, 1.55, -3.5], [s, 0, 0]);
    decal(NUMBER, 1.0, 0.31, [s * 1.212, 1.6, 1.7], [s, 0, 0]);
    decal(LABEL, 0.4, 0.4, [s * 1.2 + s * 0.012 + s * 0.2, 1.18, -0.6], [s, 0, 0]);
    decal(EMBLEM, 0.55, 0.33, [s * 1.212, 1.15, 1.7], [s, 0, 0]);
  }

  // ------------------------------------------------ stabiliser legs
  for (const z of [2.4, -4.2])
    for (const s of [1, -1]) {
      const px = s * 2.5;
      box(1.5, 0.3, 0.42, ARMOR, [s * 1.85, 1.35, z]); // outrigger beam
      box(0.5, 0.5, 0.6, DARK, [s * 1.25, 1.35, z]); // mount housing
      cyl(0.19, 0.8, DARK, [px, 1.4, z], [0, 1, 0], 8); // outer cylinder
      cyl(0.215, 0.3, HAZARD, [px, 1.1, z], [0, 1, 0], 8);
      cyl(0.1, 1.0, STEEL, [px, 0.65, z], [0, 1, 0], 8); // piston
      b.part(new THREE.SphereGeometry(0.17, 7, 5), DARK, { at: [px, 0.25, z], flat: true });
      cyl(0.52, 0.12, PAD, [px, 0.06, z], [0, 1, 0], 8); // foot pad
      cyl(0.52, 0.04, HAZARD, [px, 0.14, z], [0, 1, 0], 8);
      b.rod([s * 1.25, 1.75, z], [px, 0.7, z], 0.06, STEEL); // diagonal strut
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        cyl(0.03, 0.05, STEEL, [px + Math.cos(a) * 0.38, 0.14, z + Math.sin(a) * 0.38], [0, 1, 0], 6);
      }
    }

  // ------------------------------------------------ railgun
  const G = [0, 3.3, -0.5];
  const A = (8 * Math.PI) / 180;
  const D = V(0, Math.sin(A), Math.cos(A));
  const UPG = V(0, Math.cos(A), -Math.sin(A));
  const QG = aim(D, [0, 1, 0], "z");
  const gp = (s: number, l = 0, h = 0) =>
    V(G[0] + D.x * s + l, G[1] + D.y * s + UPG.y * h, G[2] + D.z * s + UPG.z * h);
  const gbox = (s0: number, s1: number, l: number, h: number, w: number, ht: number, color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, ht, s1 - s0), color, { at: gp((s0 + s1) / 2, l, h), quat: QG, ...opts });
  const gGeo = (s0: number, s1: number, l: number, h: number, w: number, ht: number) => {
    const g = new THREE.BoxGeometry(w, ht, s1 - s0);
    g.applyMatrix4(new THREE.Matrix4().compose(gp((s0 + s1) / 2, l, h), QG, V(1, 1, 1)));
    return g;
  };

  // trunnion pylons & pins
  for (const s of [1, -1]) {
    box(0.3, 1.5, 0.9, ARMOR, [s * 0.95, 2.65, -0.5]);
    cyl(0.17, 0.5, STEEL, [s * 0.95, 3.3, -0.5], [1, 0, 0], 10);
    gbox(-2.5, 1.5, s * 0.72, 0, 0.22, 0.9, ARMOR_S); // cradle sides
    gbox(-2.5, 1.5, s * 0.72, 0.5, 0.26, 0.1, DARK);
    // rails
    gbox(-3.5, 8.0, s * 0.26, 0, 0.26, 0.38, STEEL);
    gbox(-3.5, 8.0, s * 0.26, 0.2, 0.18, 0.04, DARK);
    glow(gbox(-0.2, 8.0, s * 0.15, 0, 0.03, 0.22, CYAN), 1.3); // inner glow strips
    // muzzle cheeks
    gbox(7.8, 8.7, s * 0.45, 0, 0.22, 0.62, DARK);
    glow(gbox(8.5, 8.72, s * 0.2, 0, 0.04, 0.3, CYAN), 1.6);
    // elevation hydraulics
    const base = V(s * 0.7, 2.0, -2.7);
    const mid = base.clone().lerp(gp(-1.8, s * 0.72, -0.45), 0.5);
    b.rod(base, mid, 0.13, DARK);
    b.rod(mid, gp(-1.8, s * 0.72, -0.45), 0.08, STEEL);
    decal(LABEL, 0.45, 0.45, gp(0.5, s * 0.84, 0).toArray(), [s, 0, 0], UPG.toArray());
    decal(EMBLEM, 0.6, 0.36, gp(-1.4, s * 0.84, 0).toArray(), [s, 0, 0], UPG.toArray());
  }
  gbox(8.4, 8.8, 0, 0.36, 1.0, 0.14, DARK); // muzzle top bar
  gbox(8.4, 8.8, 0, -0.34, 1.0, 0.14, DARK);
  gbox(-3.6, -2.5, 0, 0.1, 1.0, 0.75, ARMOR); // breech housing
  gbox(-3.65, -3.5, 0, 0.1, 0.8, 0.5, DARK);
  glow(gbox(-3.66, -3.64, 0, 0.1, 0.35, 0.2, CYAN), 1.4);
  gbox(-2.2, -1.9, 0, 0.0, 1.34, 0.28, DARK); // cross beams
  gbox(0.3, 0.6, 0, 0.0, 1.34, 0.28, DARK);
  gbox(-0.5, 1.5, 0, 0.5, 0.9, 0.12, ARMOR_S); // top cover
  // coil rings
  for (let i = 0; i < 10; i++) {
    const s0 = 2.0 + i * 0.62;
    const s1 = s0 + 0.16;
    gbox(s0, s1, 0.55, 0, 0.1, 0.84, BRASS);
    gbox(s0, s1, -0.55, 0, 0.1, 0.84, BRASS);
    gbox(s0, s1, 0, -0.37, 1.2, 0.1, BRASS);
    gbox(s0, s1, 0, 0.37, 1.2, 0.1, BRASS);
    glow(gbox(s0 + 0.03, s1 - 0.03, 0, 0.43, 0.8, 0.04, CYAN), 1.3);
  }
  // heat fins along rail sides
  const fins: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 18; i++)
    for (const s of [1, -1]) fins.push(gGeo(2.2 + i * 0.31, 2.26 + i * 0.31, s * 0.43, 0, 0.08, 0.32));
  b.part(mergeGeometries(fins)!, DARK, { at: [0, 0, 0], flat: true });

  // ------------------------------------------------ capacitor banks & power cables
  for (const z of [-4.0, -2.2])
    for (const x of [-1.0, -0.5, 0.5, 1.0]) {
      cyl(0.24, 1.5, BRASS, [x, 2.3, z], [0, 0, 1], 10);
      glow(cyl(0.255, 0.12, CYAN, [x, 2.3, z - 0.55], [0, 0, 1], 10), 1.2);
      glow(cyl(0.255, 0.12, CYAN, [x, 2.3, z + 0.55], [0, 0, 1], 10), 1.2);
      cyl(0.05, 0.1, STEEL, [x, 2.56, z], [0, 1, 0], 6);
    }
  for (const s of [1, -1]) {
    const pts = [V(s * 0.5, 2.6, -2.2), V(s * 0.45, 3.0, -2.5), V(s * 0.4, 3.0, -3.0), gp(-2.8, s * 0.3, -0.35)];
    b.sweep(catmull(pts.map((p) => p.toArray())), 0.045, { color: "#16171a", sides: 6 });
  }
  box(1.2, 0.5, 0.4, DARK, [0, 2.25, -1.3]);
  decal(LABEL, 0.38, 0.38, [0, 2.25, -1.09], [0, 0, 1]);
  glow(box(0.5, 0.1, 0.02, CYAN, [0, 2.4, -1.09]), 1.3);

  return b.root;
}
