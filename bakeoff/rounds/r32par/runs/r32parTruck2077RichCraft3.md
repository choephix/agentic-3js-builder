```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint, mix, noise, smoothstep, patches, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled, coil } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Vanguard MX-77 Armored Truck",
  description:
    "Low-poly cyberpunk 8x8 militarized cab-over truck from 2077: camo-panelled armor hull, neon trim, rail-gun turret, missile pods, drone, radar dish, glowing energy cells.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "truck2077", paintSize: 2048 });

  // ---------------------------------------------------------------- palette
  const GUN2 = "#1b1f26";
  const BLACK = "#0d0f13";
  const STEEL = "#7d8796";
  const DSTEEL = "#4a5260";
  const TEAL = "#24424a";
  const CYAN = "#27f3ff";
  const MAG = "#ff2a8a";
  const AMBER = "#ffb020";
  const RED = "#ff2a2a";
  const WHITE = "#e8f4ff";
  const YEL = "#e8c020";
  const TIRE = "#16181c";
  const ORANGE = "#ff6a1a";
  const BLUE = "#2a5cff";

  const camo = patches("#232932", ["#1b2027", "#2e3642", "#26353a", "#2c2f2a"], { size: 0.5, gap: 0.04, seed: 3 });
  const hullBase = paint((p, n) => {
    let c = camo.at(p, n);
    c = mix(c, "#0a0c10", 0.55 * smoothstep(2.0, 1.2, p.y) * (0.4 + noise(p, 0.25, 4)));
    c = mix(c, "#6a7788", 0.22 * smoothstep(0.4, 1, n.y));
    return c;
  });
  const HULL = panelled(hullBase, { size: 0.55, aspect: 0.6, rivets: 0.07, seam: "#07080b" });
  const PLATE = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.35, aspect: 0.8, rivets: 0.06 });
  const SPAINT = metal("steel", { tarnish: 0.3 });

  // ---------------------------------------------------------------- textures
  let stripesSvg = "";
  for (let i = 0; i < 12; i++)
    stripesSvg += `<polygon points="${i * 20},0 ${i * 20 + 10},0 ${i * 20},20 ${i * 20 - 10},20" fill="#111"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="20" fill="${YEL}"/>${stripesSvg}</svg>`,
    { size: 512 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="48" fill="#07090c"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<rect x="3" y="${4 + i * 7}" width="58" height="4" fill="#3a424e"/><rect x="3" y="${8 + i * 7}" width="58" height="1.5" fill="#ff2a8a"/>`)
      .join("")}<rect x="1" y="1" width="62" height="46" fill="none" stroke="#7d8796" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#05070a"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#27f3ff" stroke-width="3.5"/>
    <polygon points="50,12 82,31 82,69 50,88 18,69 18,31" fill="none" stroke="#ff2a8a" stroke-width="3"/>
    <path d="M50 22 L66 48 L58 48 L50 38 L42 48 L34 48 Z" fill="#27f3ff"/>
    <path d="M24 56 L44 62 L50 80 L56 62 L76 56 L50 68 Z" fill="#ff2a8a"/>
    <text x="50" y="58" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#ffffff">V-77</text></svg>`,
    { size: 256 },
  );
  const NEON = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="40" rx="5" fill="#05070a"/>
    <rect x="2" y="2" width="156" height="36" rx="4" fill="none" stroke="#ff2a8a" stroke-width="2.2"/>
    <text x="80" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#27f3ff">VANGUARD</text>
    <text x="80" y="34" text-anchor="middle" font-family="monospace" font-size="8" fill="#ff2a8a">2077 // ARMED RESPONSE</text></svg>`,
    { size: 512 },
  );
  const HUD = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14485a"/><stop offset="1" stop-color="#04141c"/></linearGradient></defs>
    <rect width="200" height="100" fill="url(#g)"/>
    <polygon points="20,0 60,0 30,100 -10,100" fill="#ffffff" fill-opacity="0.10"/>
    <polygon points="90,0 105,0 75,100 60,100" fill="#ffffff" fill-opacity="0.07"/>
    <g stroke="#27f3ff" stroke-width="1.6" fill="none"><circle cx="150" cy="50" r="18"/><path d="M150 26v10M150 64v10M126 50h10M164 50h10"/><path d="M12 14h40M12 20h26M12 86h60"/></g>
    <text x="12" y="36" font-family="monospace" font-size="8" fill="#27f3ff">THREAT: 03</text>
    <text x="12" y="46" font-family="monospace" font-size="6" fill="#ff2a8a">LOCK // ACQUIRING</text></svg>`,
    { size: 512 },
  );
  const GLASS = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14485a"/><stop offset="1" stop-color="#04141c"/></linearGradient></defs>
    <rect width="100" height="50" fill="url(#g)"/><polygon points="10,0 35,0 15,50 -10,50" fill="#ffffff" fill-opacity="0.12"/></svg>`,
    { size: 128 },
  );
  let spokes = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    spokes += `<path d="M50 50 L${(50 + Math.sin(a) * 40).toFixed(1)} ${(50 - Math.cos(a) * 40).toFixed(1)}" stroke="#7d8796" stroke-width="7"/>`;
  }
  const RIM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="49" fill="#1a1d23"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#7d8796" stroke-width="5"/>${spokes}
    <circle cx="50" cy="50" r="30" fill="none" stroke="#27f3ff" stroke-width="3"/>
    <circle cx="50" cy="50" r="12" fill="#3b4350"/><circle cx="50" cy="50" r="5" fill="#ff2a8a"/></svg>`,
    { size: 192 },
  );
  const REAR = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="60" fill="#14171c"/>
    <rect width="120" height="12" fill="${YEL}"/><rect x="2" y="2" width="116" height="56" fill="none" stroke="#7d8796" stroke-width="2"/>
    <text x="60" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#e8f4ff">KX-2077</text>
    <text x="60" y="50" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#ff2a2a">WARNING: ARMED</text></svg>`,
    { size: 256 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="60" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e8c020">TK-07</text>
    <path d="M4 4 L20 4 L14 12 L4 12Z M100 4 L116 4 L116 12 L106 12Z" fill="#ff2a8a"/></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- helpers
  const bx = (w: number, h: number, d: number, at: V, color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, at: V, dir: V, color: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir, flat: true, ...o });
  const sph = (r: number, at: V, color: any, o: any = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, flat: true, ...o });
  const plane = (w: number, h: number, tex: any, at: V, dir: V, g = 0, color = "#ffffff") => {
    const p = b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture: tex });
    if (g) glow(p, g);
    return p;
  };
  const rod = (a: V, c: V, r: number, color: any, o: any = {}) => b.rod(a, c, r, color, { sides: 6, ...o });
  const neon = (a: V, c: V, color: string, r = 0.025, s = 1.2) => glow(rod(a, c, r, color), s);
  const merged = (list: number[][], color: any) => {
    const gs = list.map(([w, h, d, x, y, z]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z));
    return b.part(mergeGeometries(gs)!, color, { at: [0, 0, 0] });
  };

  // ---------------------------------------------------------------- chassis
  const AX = [2.9, 1.3, -1.9, -3.5];
  bx(1.6, 0.35, 9.4, [0, 1.0, -0.1], GUN2);
  bx(1.2, 0.12, 9.0, [0, 0.8, -0.1], BLACK);
  cyl(0.07, 0.07, 8.4, 8, [0, 0.85, -0.1], [0, 0, 1], DSTEEL);

  const treadGeo = (() => {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 16; i++) {
      const g = new THREE.BoxGeometry(0.15, 0.6, 0.13);
      g.translate(0, 0, 0.7);
      g.rotateY((i / 16) * Math.PI * 2);
      gs.push(g);
    }
    return mergeGeometries(gs)!;
  })();

  for (const z of AX) {
    cyl(0.09, 0.09, 3.0, 8, [0, 0.74, z], [1, 0, 0], DSTEEL);
    sph(0.27, [0, 0.74, z], SPAINT);
    for (const s of [1, -1]) {
      const x = s * 1.5;
      // wheel
      cyl(0.64, 0.64, 0.52, 12, [x, 0.74, z], [1, 0, 0], TIRE);
      b.part(treadGeo.clone(), TIRE, { at: [x, 0.74, z], dir: [1, 0, 0], flat: true });
      plane(1.0, 1.0, RIM, [x + s * 0.27, 0.74, z], [s, 0, 0]);
      cyl(0.16, 0.16, 0.62, 8, [x, 0.74, z], [1, 0, 0], STEEL);
      // suspension
      bx(0.25, 0.06, 1.4, [s * 1.0, 0.98, z], DSTEEL);
      cyl(0.05, 0.05, 0.4, 6, [s * 1.1, 1.0, z + 0.35], [0, 1, 0], AMBER);
      b.sweep(coil([s * 1.1, 0.82, z - 0.35], [s * 1.1, 1.2, z - 0.35], 0.08, 4), 0.012, { color: STEEL, sides: 4 });
      // fender + flap
      bx(0.8, 0.07, 1.9, [x, 1.62, z], HULL);
      bx(0.06, 0.3, 1.9, [s * 1.9, 1.5, z], PLATE);
      bx(0.8, 0.07, 0.4, [x, 1.5, z + 1.05], HULL, { rotation: [-35, 0, 0] });
      bx(0.8, 0.07, 0.4, [x, 1.5, z - 1.05], HULL, { rotation: [35, 0, 0] });
      bx(0.7, 0.5, 0.04, [x, 1.1, z - 0.85], BLACK);
      neon([s * 1.91, 1.5, z - 0.9], [s * 1.91, 1.5, z + 0.9], CYAN, 0.015, 1);
    }
  }
  // steering link
  for (const z of [2.9, 1.3]) rod([-1.2, 0.5, z + 0.25], [1.2, 0.5, z + 0.25], 0.025, DSTEEL);

  // energy cells
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.4, 8, [s * 1.1, 0.88, -0.2], [0, 0, 1], TEAL);
    for (const z of [-0.7, -0.2, 0.3]) glow(cyl(0.295, 0.295, 0.08, 8, [s * 1.1, 0.88, z], [0, 0, 1], CYAN), 1);
    cyl(0.1, 0.1, 0.1, 6, [s * 1.1, 0.88, 0.55], [0, 0, 1], STEEL);
  }
  // underglow
  for (const s of [1, -1]) {
    neon([s * 1.36, 1.05, -1.1], [s * 1.36, 1.05, 0.5], MAG, 0.03, 1.4);
    neon([s * 1.36, 1.05, -4.1], [s * 1.36, 1.05, -2.9], MAG, 0.03, 1.4);
  }

  // ---------------------------------------------------------------- cab
  b.extrude(
    [
      [0.9, 1.3],
      [4.2, 1.3],
      [4.4, 1.75],
      [4.2, 2.15],
      [3.3, 2.9],
      [1.2, 2.9],
      [0.9, 2.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, color: HULL },
  );
  // windshield
  plane(2.2, 1.0, HUD, [0, 2.54, 3.763], [0, 0.77, 0.64], 0.6);
  bx(2.35, 0.08, 0.08, [0, 2.97 - 0.0, 3.2], GUN2, { rotation: [0, 0, 0] });
  rod([-1.1, 2.0, 4.26], [1.1, 2.0, 4.26], 0.03, GUN2);
  for (const s of [1, -1]) {
    plane(1.3, 0.55, GLASS, [s * 1.255, 2.45, 2.6], [s, 0, 0], 0.35);
    rod([s * 1.27, 1.35, 1.8], [s * 1.27, 2.8, 1.8], 0.012, BLACK);
    rod([s * 1.27, 1.35, 3.4], [s * 1.27, 2.2, 3.4], 0.012, BLACK);
    rod([s * 1.27, 2.15, 1.8], [s * 1.27, 2.15, 3.4], 0.012, BLACK);
    plane(0.8, 0.27, DOOR, [s * 1.262, 1.72, 2.6], [s, 0, 0]);
    bx(0.12, 0.05, 0.4, [s * 1.31, 2.05, 2.0], STEEL); // handle
    // ERA tiles
    const r = rng(11 + s);
    const tiles: number[][] = [];
    for (const z0 of [1.0, 3.5]) {
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 3; j++) {
          if (r() < 0.08) continue;
          tiles.push([0.05 + r() * 0.01, 0.19, 0.19, s * 1.275, 1.45 + j * 0.22, z0 + 0.1 + i * 0.2]);
        }
    }
    merged(tiles, "#39424c");
    // mirrors
    rod([s * 1.25, 2.4, 3.75], [s * 1.62, 2.5, 3.9], 0.025, DSTEEL);
    bx(0.09, 0.4, 0.24, [s * 1.65, 2.5, 3.9], GUN2);
    glow(b.part(new THREE.PlaneGeometry(0.2, 0.32), CYAN, { at: [s * 1.65, 2.5, 3.776], dir: [0, 0, -1], axis: "z" }), 0.9);
    // cab edge neon
    neon([s * 1.2, 2.93, 1.25], [s * 1.2, 2.93, 3.3], CYAN, 0.02);
    neon([s * 1.27, 1.33, 1.0], [s * 1.27, 1.33, 4.1], MAG, 0.02);
    // headlights
    glow(bx(0.8, 0.16, 0.12, [s * 0.85, 1.75, 4.4], WHITE), 1.6);
    glow(bx(0.3, 0.08, 0.1, [s * 1.0, 1.45, 4.3], AMBER), 1.2);
    // exhaust
    cyl(0.11, 0.11, 2.2, 8, [s * 1.4, 2.6, 0.82], [0, 1, 0], SPAINT);
    for (const y of [2.0, 2.6, 3.2]) cyl(0.135, 0.135, 0.1, 8, [s * 1.4, y, 0.82], [0, 1, 0], DSTEEL);
    glow(cyl(0.12, 0.12, 0.05, 8, [s * 1.4, 3.7, 0.82], [0, 1, 0], ORANGE), 1.5);
    bx(0.3, 0.06, 0.3, [s * 1.3, 1.8, 0.82], DSTEEL);
    // mast antennas
    cyl(0.015, 0.015, 1.5, 5, [s * 1.0, 3.65, 1.3], [0, 1, 0], STEEL);
    glow(sph(0.045, [s * 1.0, 4.42, 1.3], s > 0 ? CYAN : MAG), 1.6);
    // spotlights
    cyl(0.16, 0.16, 0.12, 10, [s * 1.0, 1.05, 5.0], [0, 0, 1], GUN2);
    glow(cyl(0.125, 0.125, 0.02, 10, [s * 1.0, 1.05, 5.065], [0, 0, 1], WHITE), 1.6);
    // tow hooks
    bx(0.12, 0.2, 0.25, [s * 0.6, 0.65, 5.05], AMBER);
    // tail lights
    glow(bx(0.5, 0.15, 0.08, [s * 1.0, 2.2, -4.64], RED), 1.5);
    glow(bx(0.12, 0.5, 0.08, [s * 1.15, 1.7, -4.64], RED), 1.2);
    neon([s * 1.3, 1.3, -4.62], [s * 1.3, 2.45, -4.62], CYAN, 0.015, 1);
  }
  // grille
  bx(0.9, 0.5, 0.1, [0, 1.62, 4.37], BLACK);
  plane(0.8, 0.42, VENT, [0, 1.64, 4.43], [0, 0.05, 1]);
  glow(bx(1.6, 0.04, 0.06, [0, 1.35, 4.2], CYAN), 1.2);
  // roof gear
  bx(2.0, 0.1, 0.2, [0, 3.0, 3.15], GUN2);
  [-0.75, -0.25, 0.25, 0.75].forEach((x, i) => glow(bx(0.42, 0.09, 0.22, [x, 3.08, 3.15], i < 2 ? RED : BLUE), 1.8));
  b.lathe(
    [[0, 0], [0.12, 0], [0.45, 0.3], [0.42, 0.33], [0.1, 0.07], [0, 0.07]],
    { at: [-0.7, 3.1, 1.7], axis: [0.3, 0.8, 0.5], segments: 10, color: STEEL },
  );
  cyl(0.05, 0.05, 0.25, 6, [-0.7, 2.98, 1.7], [0, 1, 0], DSTEEL);
  rod([-0.7, 3.2, 1.7], [-0.55, 3.5, 1.9], 0.012, STEEL);
  sph(0.18, [0.7, 3.06, 1.8], GUN2);
  glow(sph(0.055, [0.7, 3.08, 1.97], RED), 2);

  // ---------------------------------------------------------------- bed
  b.extrude(
    [
      [-4.6, 1.25],
      [0.75, 1.25],
      [0.75, 2.7],
      [0.2, 2.85],
      [-4.2, 2.85],
      [-4.6, 2.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, color: HULL },
  );
  [-3.5, -2.1, -0.7].forEach((zc, i) => {
    for (const s of [1, -1]) {
      bx(0.08, 1.2, 1.3, [s * 1.29, 2.0, zc], HULL);
      const d: V = [s, 0, 0];
      if (i === 0) plane(1.2, 0.3, NEON, [s * 1.335, 2.3, zc], d, 1.2);
      if (i === 1) plane(0.8, 0.8, EMBLEM, [s * 1.335, 2.0, zc], d, 0.9);
      if (i === 2) plane(1.0, 0.75, VENT, [s * 1.335, 2.0, zc], d);
      if (i === 0) plane(1.2, 0.2, HAZARD, [s * 1.335, 1.6, zc], d);
      neon([s * 1.34, 1.4, zc - 0.7], [s * 1.34, 2.6, zc - 0.7], CYAN, 0.015, 1);
    }
  });
  for (const s of [1, -1]) {
    neon([s * 1.34, 2.65, -4.2], [s * 1.34, 2.65, -0.05], CYAN, 0.02);
    neon([s * 1.34, 1.38, -4.25], [s * 1.34, 1.38, -0.05], MAG, 0.015, 1);
    // roof rails
    rod([s * 1.15, 2.95, -4.1], [s * 1.15, 2.95, -2.3], 0.02, STEEL);
    rod([s * 1.15, 2.95, -1.1], [s * 1.15, 2.95, 0.1], 0.02, STEEL);
    // missile pods
    const t = 0.42;
    const d = new THREE.Vector3(0, Math.sin(t), Math.cos(t));
    const u = new THREE.Vector3(0, Math.cos(t), -Math.sin(t));
    const c = new THREE.Vector3(s * 0.92, 3.15, -3.85);
    bx(0.5, 0.3, 0.8, [s * 0.92, 2.97, -3.85], DSTEEL);
    b.part(new THREE.BoxGeometry(0.62, 0.56, 1.0), PLATE, { at: c.toArray() as V, dir: d.toArray() as V, axis: "z" });
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 3; j++) {
        const p = c
          .clone()
          .addScaledVector(new THREE.Vector3(1, 0, 0), (i - 0.5) * 0.28)
          .addScaledVector(u, (j - 1) * 0.17)
          .addScaledVector(d, 0.5);
        b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 8), BLACK, { at: p.toArray() as V, dir: d.toArray() as V, flat: true });
        b.part(new THREE.ConeGeometry(0.055, 0.14, 6), RED, {
          at: p.clone().addScaledVector(d, 0.06).toArray() as V,
          dir: d.toArray() as V,
          flat: true,
        });
      }
    glow(bx(0.5, 0.04, 0.04, [s * 0.92, 3.4, -4.05], AMBER), 1.2);
  }
  // hatch & roof vents
  cyl(0.3, 0.3, 0.06, 8, [0, 2.9, -0.4], [0, 1, 0], DSTEEL);
  cyl(0.08, 0.08, 0.1, 6, [0, 2.96, -0.4], [0, 1, 0], STEEL);
  for (const s of [1, -1]) bx(0.5, 0.08, 0.4, [s * 0.75, 2.9, -0.3], GUN2);
  // drone
  bx(0.46, 0.1, 0.36, [0, 3.0, -3.25], GUN2);
  glow(sph(0.05, [0, 3.0, -3.06], CYAN), 2);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      rod([sx * 0.2, 3.0, -3.25 + sz * 0.15], [sx * 0.36, 3.03, -3.25 + sz * 0.26], 0.015, DSTEEL);
      glow(cyl(0.14, 0.14, 0.015, 10, [sx * 0.36, 3.07, -3.25 + sz * 0.26], [0, 1, 0], CYAN), 0.6);
      rod([sx * 0.3, 2.9, -3.25 + sz * 0.2], [sx * 0.3, 3.0, -3.25 + sz * 0.2], 0.012, DSTEEL);
    }

  // ---------------------------------------------------------------- turret
  cyl(0.62, 0.7, 0.14, 12, [0, 2.92, -1.7], [0, 1, 0], SPAINT);
  glow(cyl(0.64, 0.64, 0.03, 12, [0, 2.98, -1.7], [0, 1, 0], MAG), 1.2);
  b.extrude(
    [
      [-0.65, 0],
      [0.6, 0],
      [0.75, 0.2],
      [0.55, 0.55],
      [0, 0.65],
      [-0.55, 0.55],
      [-0.7, 0.3],
    ],
    { at: [0, 3.0, -1.7], x: [0, 0, 1], thickness: 1.0, color: PLATE },
  );
  bx(0.9, 0.32, 0.25, [0, 3.3, -1.0], GUN2);
  for (const s of [1, -1]) {
    const x = s * 0.22;
    cyl(0.055, 0.055, 1.9, 8, [x, 3.3, -0.15], [0, 0, 1], STEEL);
    bx(0.16, 0.16, 0.9, [x, 3.3, -0.65], DSTEEL);
    cyl(0.09, 0.09, 0.18, 6, [x, 3.3, 0.8], [0, 0, 1], BLACK);
    glow(cyl(0.06, 0.06, 0.02, 8, [x, 3.3, 0.895], [0, 0, 1], CYAN), 2);
    for (let k = 0; k < 4; k++) glow(cyl(0.085, 0.085, 0.04, 8, [x, 3.3, -0.4 + k * 0.28], [0, 0, 1], CYAN), 1.2);
  }
  cyl(0.25, 0.25, 0.4, 10, [0.72, 3.15, -1.8], [1, 0, 0], GUN2);
  glow(cyl(0.2, 0.2, 0.02, 10, [0.93, 3.15, -1.8], [1, 0, 0], AMBER), 1);
  rod([0.55, 3.15, -1.8], [0.3, 3.3, -1.3], 0.04, DSTEEL);
  sph(0.2, [-0.35, 3.68, -1.9], GUN2);
  glow(sph(0.07, [-0.35, 3.72, -1.72], RED), 2);
  cyl(0.01, 0.01, 0.8, 5, [0.4, 4.0, -2.1], [0, 1, 0], STEEL);
  glow(sph(0.04, [0.4, 4.4, -2.1], MAG), 1.6);
  for (let i = 0; i < 4; i++) rod([-0.55 + i * 0.05, 3.1, -2.4], [-0.45 + i * 0.05, 3.45, -2.4], 0.02, STEEL);

  // ---------------------------------------------------------------- front bumper & rear
  b.extrude(
    [
      [4.3, 0.4],
      [5.0, 0.5],
      [5.0, 1.2],
      [4.4, 1.35],
      [4.3, 1.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.8, color: PLATE },
  );
  plane(2.6, 0.3, HAZARD, [0, 0.62, 5.012], [0, 0, 1]);
  neon([-1.2, 0.38, 4.8], [1.2, 0.38, 4.8], MAG, 0.03, 1.5);
  for (const x of [-0.5, 0, 0.5]) rod([x, 0.85, 5.02], [x, 1.25, 4.5], 0.03, DSTEEL);
  bx(2.7, 0.4, 0.35, [0, 1.05, -4.7], PLATE);
  plane(2.5, 0.22, HAZARD, [0, 1.05, -4.88], [0, 0, -1]);
  plane(1.3, 0.65, REAR, [0, 1.85, -4.61], [0, 0, -1]);
  cyl(0.06, 0.06, 0.3, 6, [0, 0.9, -4.95], [0, 0, 1], STEEL);
  neon([-1.1, 0.8, -4.9], [1.1, 0.8, -4.9], MAG, 0.025, 1.3);
  rod([-0.6, 1.4, -4.62], [0.6, 1.4, -4.62], 0.015, BLACK);
  rod([-0.6, 2.4, -4.62], [0.6, 2.4, -4.62], 0.015, BLACK);

  return b.root;
}
```