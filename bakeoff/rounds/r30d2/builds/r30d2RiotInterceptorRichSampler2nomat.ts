import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, polyline, mix, noise, paint, smoothstep, mottle, svg } from "../../../../src/index";
import type { Joint, Fill, V3 } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { gaugeTexture, metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "VANTAGE RSV-07 Riot Interceptor",
  description:
    "Six-wheel corporate crowd-suppression truck: armoured white/graphite livery with a yellow slash, roof-mounted water cannon on a yawing turret, cyan/magenta neon light bars, LRAD dishes, riot shield racks, lit logo boxes and an LED dispersal board. Cyberpunk 2077 style.",
};

type Opt = { [k: string]: any };

export default function build() {
  const b = createBuilder({ name: "rsv07", paintSize: 2048 });
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ palette
  const YEL = "#fcee0a";
  const CYAN = "#19f3ff";
  const MAG = "#ff2bd6";
  const RED = "#ff2a4d";
  const WHITE = "#dfe3ea";
  const GRAPH = "#1b1f2b";
  const DARK = "#0d1018";
  const GLASS = "#0c2230";
  const LAMP = "#f2fdff";

  // ------------------------------------------------------------------ textures
  const LOGO = svg(
    `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,12 178,56 178,144 100,188 22,144 22,56" fill="none" stroke="${CYAN}" stroke-width="7" stroke-linejoin="round"/>
    <polygon points="100,34 160,68 160,132 100,166 40,132 40,68" fill="none" stroke="${MAG}" stroke-width="4"/>
    <path d="M62 70 L100 140 L138 70 L116 70 L100 104 L84 70Z" fill="${YEL}"/>
    <path d="M100 188 L100 204" stroke="${CYAN}" stroke-width="6"/>
    <text x="100" y="228" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="27" fill="${CYAN}" letter-spacing="4">VANTAGE</text>
    </svg>`,
    { size: 512 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="h" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="32" fill="${YEL}"/><rect x="16" width="16" height="32" fill="#14161c"/></pattern></defs><rect width="128" height="32" fill="url(#h)"/><rect width="128" height="32" fill="none" stroke="#14161c" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const LEDBOARD = svg(
    `<svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="d" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.2" fill="#0c2a33"/></pattern></defs>
    <rect width="300" height="110" fill="#04060b"/><rect width="300" height="110" fill="url(#d)"/>
    <rect x="3" y="3" width="294" height="104" fill="none" stroke="${CYAN}" stroke-width="3"/>
    <text x="150" y="58" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="46" fill="${MAG}" letter-spacing="3">DISPERSE</text>
    <rect x="16" y="68" width="268" height="3" fill="${YEL}"/>
    <text x="150" y="94" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="${CYAN}" letter-spacing="2">ZONE 4 CLOSED // MOVE ALONG</text>
    <polygon points="14,14 34,14 24,30" fill="${YEL}"/><polygon points="286,14 266,14 276,30" fill="${YEL}"/>
    </svg>`,
    { size: 512 },
  );
  const WINDSCREEN = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123446"/><stop offset="1" stop-color="#03070b"/></linearGradient></defs>
    <rect width="200" height="100" fill="url(#g)"/>
    <polygon points="30,0 62,0 22,100 -10,100" fill="#ffffff" opacity="0.10"/><polygon points="80,0 92,0 52,100 40,100" fill="#ffffff" opacity="0.07"/>
    <polygon points="140,0 175,0 135,100 100,100" fill="${CYAN}" opacity="0.07"/>
    <text x="8" y="12" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="${CYAN}" opacity="0.7">TARGET LOCK // HOSTILES 000</text>
    <rect x="0" y="94" width="200" height="6" fill="#050608"/></svg>`,
    { size: 512 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="40" fill="#07090e"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="4" y="${3 + i * 4.1}" width="132" height="1.8" fill="#2b3142"/>`).join("")}
    ${[14, 30, 110, 126].map((x) => `<rect x="${x}" y="4" width="3" height="32" fill="${CYAN}" opacity="0.8"/>`).join("")}
    <polygon points="70,5 84,13 84,27 70,35 56,27 56,13" fill="#0a0c12" stroke="${YEL}" stroke-width="2.4"/>
    <path d="M62 15 L70 29 L78 15" stroke="${YEL}" stroke-width="3" fill="none"/>
    <rect x="1" y="1" width="138" height="38" fill="none" stroke="#3a4156" stroke-width="2"/></svg>`,
    { size: 384 },
  );
  const RIM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="49" fill="#161923"/>
    ${Array.from({ length: 6 }, (_, i) => `<polygon points="45,12 55,12 60,38 40,38" fill="${YEL}" transform="rotate(${i * 60} 50 50)"/>`).join("")}
    <circle cx="50" cy="50" r="44" fill="none" stroke="${CYAN}" stroke-width="3"/>
    <circle cx="50" cy="50" r="13" fill="#2a2f3d" stroke="#0a0c12" stroke-width="3"/>
    <polygon points="50,43 56,46.5 56,53.5 50,57 44,53.5 44,46.5" fill="${MAG}"/></svg>`,
    { size: 256 },
  );
  const LEVEL = svg(
    `<svg viewBox="0 0 40 200" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="4" width="24" height="192" rx="6" fill="none" stroke="${CYAN}" stroke-width="5"/>
    <rect x="12" y="70" width="16" height="122" rx="3" fill="#2f7bff"/><rect x="12" y="70" width="16" height="6" fill="#9fe6ff"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="32" y="${14 + i * 24}" width="6" height="3" fill="${YEL}"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const DOORTAG = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="${YEL}"/><rect x="3" y="3" width="114" height="34" fill="none" stroke="#14161c" stroke-width="2.5"/>
    <text x="60" y="27" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="20" fill="#14161c">RSV-07</text></svg>`,
    { size: 256 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><text x="140" y="68" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="66" fill="${YEL}" letter-spacing="4">RSV-07</text>
    <rect x="10" y="80" width="260" height="8" fill="#14161c" opacity="0.8"/></svg>`,
    { size: 512 },
  );
  const GAUGE = gaugeTexture({ label: "BAR", needle: 70 });

  // ------------------------------------------------------------------ paints
  const frac = (x: number, w: number) => {
    const t = ((x / w) % 1 + 1) % 1;
    return Math.min(t, 1 - t) * w;
  };
  const LIVERY = paint((p, n) => {
    const side = Math.abs(n.x) > 0.5;
    let c: string;
    if (n.y > 0.6) c = "#c9d0dc";
    else if (n.y < -0.6) c = "#10131b";
    else {
      const cut = 1.18 + 0.11 * p.z;
      c = p.y < cut ? GRAPH : p.y < cut + 0.07 ? YEL : WHITE;
    }
    const grime = smoothstep(1.5, 0.8, p.y) * smoothstep(0.4, 0.8, noise(p, 0.4, 3)) * 0.6;
    let col = mix(c, "#3b362f", grime);
    const pu = side ? p.z : p.x;
    const pv = n.y > 0.6 ? p.z : p.y;
    if (frac(pu + 0.3, 0.9) < 0.006 || frac(pv, 0.7) < 0.006) col = mix(col, "#0b0d12", 0.8);
    return col;
  });
  const PLATE = panelled(metal("iron", { tarnish: 0.45, polish: 0.15, seed: 3 }), { size: 0.35, aspect: 0.8, rivets: 0.07 });
  const STEEL = metal("steel", { polish: 0.4 });
  const BLUED = metal("blued");
  const DARKM = metal("iron", { tarnish: 0.2 });
  const RUBBER = mottle("#13141a", "#262830", { size: 0.05 });
  const CANNON = paint((p) => {
    const ring = (z: number) => Math.abs(p.z - z) < 0.06;
    if (ring(-0.3) || ring(0.45)) return YEL;
    if (ring(-0.2) || ring(-0.4) || ring(0.55) || ring(0.35)) return "#14161c";
    return BLUED;
  });

  // ------------------------------------------------------------------ helpers
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const bx = (w: number, h: number, d: number, color: Fill, at: V3, o: Opt = {}) =>
    b.part(box(w, h, d), color, { bone: chassis, ...o, at });
  const cy = (r: number, h: number, s: number, color: Fill, at: V3, o: Opt = {}) =>
    b.part(cyl(r, h, s), color, { bone: chassis, ...o, at });
  const neon = (w: number, h: number, d: number, color: string, at: V3, str = 1.5, o: Opt = {}) =>
    glow(bx(w, h, d, color, at, o), str);
  const decal = (geo: THREE.BufferGeometry, tex: THREE.Texture, at: V3, dir: V3, o: Opt = {}) =>
    b.part(geo, "#ffffff", { bone: chassis, ...o, at, dir, axis: "z", texture: tex });
  const rod = (a: V3, c: V3, r: number, color: Fill, o: Opt = {}) => b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const ringGeo = (hub: V3, angs: number[], R: number, make: (i: number, a: number) => THREE.BufferGeometry) => {
    const list = angs.map((a, i) => {
      const g = make(i, a);
      g.translate(hub[0], hub[1] + R * Math.cos(a), hub[2] + R * Math.sin(a));
      return g;
    });
    return mergeGeometries(list)!;
  };
  const full = (n: number) => Array.from({ length: n }, (_, i) => (i / n) * TAU);

  // ------------------------------------------------------------------ hull
  const HULL: [number, number][] = [
    [3.12, 0.75], [3.3, 1.0], [3.28, 1.5], [2.55, 1.78], [1.8, 2.4], [0.58, 2.4],
    [0.58, 2.62], [-3.1, 2.62], [-3.28, 2.45], [-3.28, 0.9], [-3.1, 0.75],
  ];
  b.extrude(HULL, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.07, bone: chassis, color: LIVERY });
  bx(1.6, 0.06, 5.8, DARKM, [0, 0.72, 0]); // skid plate

  // roof deck rim and details
  for (const s of [1, -1]) {
    bx(0.08, 0.07, 3.6, PLATE, [s * 1.04, 2.65, -1.3]);
    for (let i = 0; i < 8; i++) neon(0.05, 0.05, 0.4, i % 2 ? MAG : CYAN, [s * 1.0, 2.68, -2.95 + i * 0.5], 1.6);
    // vents
    bx(0.6, 0.06, 0.5, DARKM, [s * 0.5, 2.65, -2.5]);
    for (let i = 0; i < 4; i++) bx(0.56, 0.03, 0.04, STEEL, [s * 0.5, 2.7, -2.64 + i * 0.1]);
  }
  decal(new THREE.PlaneGeometry(1.3, 0.46), STENCIL, [0, 2.627, 0.05], [0, 1, 0], { up: [0, 0, 1] });

  // ------------------------------------------------------------------ cab front
  const gl = Math.hypot(0.75, 0.62);
  const wn: V3 = [0, 0.62 / gl, 0.75 / gl].map((v, i) => (i === 1 ? 0.77 : i === 2 ? 0.64 : 0)) as V3;
  decal(new THREE.PlaneGeometry(1.9, gl), WINDSCREEN, [0, 2.105, 2.195], wn, { up: [0, 1, 0] });
  for (let i = 0; i < 9; i++) {
    const x = -0.8 + i * 0.2;
    rod([x, 1.83, 2.59], [x, 2.45, 1.84], 0.011, STEEL, { sides: 5 });
  }
  for (const t of [0.0, 0.5, 1.0]) {
    const z = 2.59 + (1.84 - 2.59) * t;
    const y = 1.83 + (2.45 - 1.83) * t;
    rod([-0.85, y, z], [0.85, y, z], 0.016, STEEL, { sides: 5 });
  }
  bx(2.0, 0.08, 0.1, PLATE, [0, 2.44, 1.78]); // visor over screen

  // hood
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) bx(0.5, 0.025, 0.05, DARK, [s * 0.55, 1.66 - i * 0.025, 2.82 + i * 0.1], { rotation: [21, 0, 0] });
    bx(0.56, 0.02, 0.4, STEEL, [s * 0.55, 1.62, 2.9], { rotation: [21, 0, 0] });
  }
  neon(0.05, 0.02, 0.7, CYAN, [0, 1.68, 2.92], 1.5, { rotation: [21, 0, 0] });

  // nose
  decal(new THREE.PlaneGeometry(1.4, 0.4), GRILLE, [0, 1.25, 3.305], [0, 0, 1]);
  neon(2.0, 0.04, 0.05, CYAN, [0, 1.48, 3.29], 1.6);
  for (const s of [1, -1]) {
    neon(0.3, 0.1, 0.05, LAMP, [s * 0.92, 1.25, 3.3], 2);
    bx(0.38, 0.04, 0.12, GRAPH, [s * 0.92, 1.35, 3.33]);
    cy(0.07, 0.1, 10, DARK, [s * 0.95, 1.2, 3.72], { rotation: [90, 0, 0], flat: true });
    neon(0.1, 0.1, 0.02, LAMP, [s * 0.95, 1.2, 3.78], 2);
    bx(0.25, 0.42, 0.6, PLATE, [s * 1.18, 0.98, 3.4], { rotation: [0, s * -14, 0] });
    bx(0.12, 0.12, 0.08, YEL, [s * 0.9, 0.78, 3.76]); // tow shackle
    rod([s * 0.58, 1.18, 3.56], [s * 0.58, 1.62, 3.4], 0.04, STEEL, { sides: 8 });
  }
  bx(2.4, 0.42, 0.45, PLATE, [0, 0.98, 3.5]); // push bumper
  decal(new THREE.PlaneGeometry(2.2, 0.34), HAZARD, [0, 0.98, 3.735], [0, 0, 1]);
  bx(2.1, 0.06, 0.4, STEEL, [0, 1.2, 3.52], { rotation: [-8, 0, 0] });
  rod([-0.58, 1.62, 3.4], [0.58, 1.62, 3.4], 0.04, STEEL, { sides: 8 });
  for (let i = 0; i < 5; i++) rod([-0.4 + i * 0.2, 1.2, 3.55], [-0.4 + i * 0.2, 1.62, 3.4], 0.012, STEEL, { sides: 4 });
  neon(1.1, 0.03, 0.03, CYAN, [0, 1.62, 3.46], 1.8);
  neon(2.2, 0.03, 0.03, MAG, [0, 0.74, 3.5], 1.6); // under-bumper glow

  // ------------------------------------------------------------------ side & cab detail
  const doors: Record<string, Joint> = {};
  for (const s of [1, -1] as const) {
    const sd = s > 0 ? "L" : "R";
    const door = b.joint(`door${sd}`, { parent: chassis, at: [s * 1.12, 1.5, 1.78], dir: [0, 1, 0], role: "hinge" });
    doors[sd] = door;
    bx(0.05, 0.45, 0.95, LIVERY, [s * 1.125, 1.47, 1.28], { bone: door });
    bx(0.05, 0.68, 0.95, "#141824", [s * 1.125, 2.0, 1.28], { bone: door });
    bx(0.06, 0.5, 0.8, GLASS, [s * 1.13, 2.02, 1.28], { bone: door });
    for (const z of [1.0, 1.28, 1.56]) rod([s * 1.17, 1.77, z], [s * 1.17, 2.27, z], 0.012, STEEL, { bone: door, sides: 5 });
    bx(0.04, 0.04, 0.18, STEEL, [s * 1.16, 1.6, 0.95], { bone: door });
    decal(new THREE.PlaneGeometry(0.5, 0.167), DOORTAG, [s * 1.153, 1.4, 1.3], [s, 0, 0], { bone: door });
    neon(0.03, 0.03, 0.9, CYAN, [s * 1.145, 1.28, 1.28], 1.5, { bone: door });
    // hinge pins
    for (const y of [1.3, 2.25]) cy(0.025, 0.12, 6, STEEL, [s * 1.14, y, 1.78]);
    // step bar
    rod([s * 1.25, 0.95, 0.85], [s * 1.25, 0.95, 1.35], 0.04, STEEL, { sides: 8 });
    for (const z of [0.9, 1.3]) rod([s * 1.1, 1.0, z], [s * 1.25, 0.95, z], 0.025, DARKM);
    // mirrors
    rod([s * 1.1, 1.95, 1.9], [s * 1.32, 2.05, 2.05], 0.02, STEEL, { sides: 5 });
    rod([s * 1.1, 2.25, 1.9], [s * 1.32, 2.15, 2.05], 0.02, STEEL, { sides: 5 });
    bx(0.12, 0.42, 0.3, GRAPH, [s * 1.38, 2.1, 2.05]);
    bx(0.1, 0.36, 0.02, "#7fb4c8", [s * 1.38, 2.1, 1.89]);
    neon(0.05, 0.05, 0.02, CYAN, [s * 1.38, 2.22, 2.21], 1.8);
    // exhaust stack
    rod([s * 1.22, 1.35, 0.3], [s * 1.22, 3.0, 0.3], 0.07, DARKM, { sides: 8 });
    cy(0.1, 0.9, 8, STEEL, [s * 1.22, 2.05, 0.3]);
    for (const y of [1.5, 2.5]) bx(0.14, 0.04, 0.1, GRAPH, [s * 1.16, y, 0.3]);
    cy(0.09, 0.05, 8, "#14161c", [s * 1.22, 3.02, 0.3]);
    // lit logo box
    bx(0.03, 1.32, 1.3, DARK, [s * 1.115, 1.92, -0.8]);
    decal(new THREE.PlaneGeometry(1.0, 1.2), LOGO, [s * 1.1365, 1.92, -0.8], [s, 0, 0], { bone: chassis, extra: 0 });
    neon(0.03, 0.03, 1.32, CYAN, [s * 1.13, 2.58, -0.8], 1.8);
    neon(0.03, 0.03, 1.32, CYAN, [s * 1.13, 1.27, -0.8], 1.8);
    // running strips
    neon(0.03, 0.04, 1.6, CYAN, [s * 1.118, 1.4, -2.25], 1.6);
    neon(0.03, 0.04, 0.6, CYAN, [s * 1.118, 1.4, 0.25], 1.6);
    neon(0.03, 0.04, 1.25, CYAN, [s * 1.118, 1.4, 2.475], 1.6);
    for (const z of [1.05, -1.05]) neon(0.1, 0.02, 0.85, MAG, [s * 1.0, 0.725, z], 1.6);
    // hydrant hatch
    bx(0.04, 0.5, 0.55, PLATE, [s * 1.12, 1.0, -1.05]);
    for (const dz of [-0.15, 0.15]) {
      cy(0.085, 0.1, 10, YEL, [s * 1.17, 1.0, -1.05 + dz], { rotation: [0, 0, 90], flat: true });
      cy(0.04, 0.12, 6, DARKM, [s * 1.2, 1.0, -1.05 + dz], { rotation: [0, 0, 90] });
    }
    // riot shields
    for (let i = 0; i < 3; i++) {
      const zc = -2.85 + i * 0.45;
      b.extrude(
        [[-0.19, 1.5], [0.19, 1.5], [0.19, 2.42], [-0.19, 2.42]],
        { at: [s * 1.16, 0, zc], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, smoothing: 2, bone: chassis, color: "#12384a" },
      );
      bx(0.05, 0.22, 0.3, "#5fb3cf", [s * 1.185, 2.12, zc]);
      neon(0.03, 0.03, 0.34, i % 2 ? MAG : CYAN, [s * 1.19, 1.52, zc], 1.6);
      neon(0.03, 0.03, 0.34, i % 2 ? CYAN : MAG, [s * 1.19, 2.4, zc], 1.6);
    }
    for (const y of [1.65, 2.3]) rod([s * 1.1, y, -2.4], [s * 1.17, y, -2.4], 0.02, STEEL, { sides: 5 });
    // mudflaps
    for (const z of [-0.78, -2.88]) {
      bx(0.5, 0.45, 0.04, RUBBER, [s * 1.12, 0.5, z]);
      neon(0.5, 0.04, 0.045, YEL, [s * 1.12, 0.3, z], 0.8);
    }
  }

  // ------------------------------------------------------------------ wheels
  const wheelJ: Record<string, Joint> = {};
  const WPOS: [string, number][] = [["F", 2.1], ["M", 0], ["R", -2.1]];
  for (const [k, z] of WPOS) {
    for (const s of [1, -1] as const) {
      const sd = s > 0 ? "L" : "R";
      const hub: V3 = [s * 1.12, 0.55, z];
      const parent =
        k === "F" ? b.joint(`steer${k}${sd}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" }) : chassis;
      wheelJ[k + sd] = b.joint(`wheel${k}${sd}`, { parent, at: hub, dir: [s, 0, 0], role: "hinge" });
    }
    // axle
    rod([-1.0, 0.55, z], [1.0, 0.55, z], 0.08, STEEL, { sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), DARKM, { bone: chassis, at: [0, 0.55, z], scale: [1, 0.9, 1.1], flat: true });
    bx(0.1, 0.04, 1.0, STEEL, [0.6, 0.66, z]);
    bx(0.1, 0.04, 1.0, STEEL, [-0.6, 0.66, z]);
  }
  rod([0, 0.6, 2.1], [0, 0.6, -2.1], 0.045, STEEL, { sides: 8 });
  for (const [x, z] of [[0.4, 1.0], [-0.4, -1.0]]) cy(0.16, 0.9, 10, DARKM, [x, 0.56, z], { rotation: [90, 0, 0], flat: true });

  for (const [k, z] of WPOS) {
    for (const s of [1, -1] as const) {
      const j = wheelJ[k + (s > 0 ? "L" : "R")];
      const hub: V3 = [s * 1.12, 0.55, z];
      b.part(cyl(0.55, 0.46, 14), RUBBER, { bone: j, at: hub, rotation: [0, 0, 90], flat: true });
      const tread = ringGeo(hub, full(14), 0.52, (i, a) => {
        const g = new THREE.BoxGeometry(0.2, 0.1, 0.22);
        g.translate(i % 2 ? 0.1 : -0.1, 0, 0);
        g.rotateX(a);
        return g;
      });
      b.part(tread, RUBBER, { bone: j, at: [0, 0, 0], flat: true });
      b.part(cyl(0.34, 0.47, 10), "#20242f", { bone: j, at: hub, rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.12, 0.56, 8), STEEL, { bone: j, at: hub, rotation: [0, 0, 90], flat: true });
      const nuts = ringGeo(hub, full(6), 0.2, () => {
        const g = new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6);
        g.rotateZ(Math.PI / 2);
        g.translate(s * 0.27, 0, 0);
        return g;
      });
      b.part(nuts, STEEL, { bone: j, at: [0, 0, 0], flat: true });
      b.part(new THREE.CircleGeometry(0.33, 20), "#ffffff", {
        bone: j, at: [hub[0] + s * 0.238, hub[1], hub[2]], dir: [s, 0, 0], axis: "z", texture: RIM,
      });
      glow(
        b.part(new THREE.TorusGeometry(0.355, 0.014, 5, 20), CYAN, {
          bone: j, at: [hub[0] + s * 0.236, hub[1], hub[2]], rotation: [0, 90, 0],
        }),
        1.8,
      );
      // fender arch
      const fender = ringGeo([s * 1.12, 0.55, z], [-75, -50, -25, 0, 25, 50, 75].map((d) => (d * Math.PI) / 180), 0.7, (_i, a) => {
        const g = new THREE.BoxGeometry(0.66, 0.05, 0.32);
        g.rotateX(a);
        return g;
      });
      b.part(fender, PLATE, { bone: chassis, at: [0, 0, 0], flat: true });
      neon(0.68, 0.03, 0.05, YEL, [s * 1.12, 1.255, z], 0.9);
    }
  }

  // ------------------------------------------------------------------ roof: light bar, LRAD, sensors
  bx(1.9, 0.12, 0.3, GRAPH, [0, 2.46, 1.55]);
  for (let i = 0; i < 8; i++) neon(0.2, 0.1, 0.26, i % 2 ? MAG : CYAN, [-0.84 + i * 0.24, 2.56, 1.55], 2);
  for (const s of [1, -1]) bx(0.08, 0.2, 0.34, PLATE, [s * 0.99, 2.5, 1.55]);
  neon(1.8, 0.03, 0.02, LAMP, [0, 2.47, 1.71], 1.8);
  for (const s of [1, -1]) {
    cy(0.05, 0.25, 8, STEEL, [s * 0.62, 2.52, 1.0]);
    const ax: V3 = [0, 0.35, 1];
    b.lathe([[0, 0], [0.27, 0.1], [0.27, 0.125], [0, 0.03]], {
      at: [s * 0.62, 2.68, 1.0], axis: ax, segments: 12, bone: chassis, color: PLATE,
    });
    glow(b.part(cyl(0.07, 0.02, 10), CYAN, { bone: chassis, at: [s * 0.62, 2.7, 1.04], dir: ax }), 1.8);
    b.spike([s * 0.95, 2.4, 0.75], [0, 1, 0], 1.2, 0.014, STEEL, { bone: chassis, sides: 5 });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: chassis, at: [s * 0.95, 3.62, 0.75], flat: true });
  }
  cy(0.22, 0.06, 10, GRAPH, [0, 2.43, 0.95]);
  b.part(new THREE.SphereGeometry(0.2, 10, 6, 0, TAU, 0, Math.PI / 2), "#0a2a36", { bone: chassis, at: [0, 2.45, 0.95], flat: true });
  neon(0.07, 0.07, 0.03, CYAN, [0, 2.55, 1.13], 1.8);

  // beacons
  for (const s of [1, -1] as const) {
    const bj = b.joint(`beacon${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 0.9, 2.7, -2.95], dir: [0, 1, 0], role: "hinge" });
    cy(0.12, 0.08, 10, GRAPH, [s * 0.9, 2.66, -2.95], { flat: true });
    bx(0.12, 0.1, 0.02, STEEL, [s * 0.9, 2.78, -2.92], { bone: bj });
    glow(b.part(new THREE.SphereGeometry(0.11, 10, 5, 0, TAU, 0, Math.PI / 2), YEL, { bone: chassis, at: [s * 0.9, 2.7, -2.95], flat: true }), 1.8);
  }

  // ------------------------------------------------------------------ rear face
  decal(new THREE.PlaneGeometry(1.7, 0.62), LEDBOARD, [0, 1.7, -3.292], [0, 0, -1]);
  glow(
    b.part(new THREE.PlaneGeometry(1.7, 0.62), "#ffffff", { bone: chassis, at: [0, 1.7, -3.296], dir: [0, 0, -1], axis: "z", texture: LEDBOARD }),
    1.3,
  );
  for (let i = 0; i < 7; i++) neon(0.2, 0.09, 0.05, i % 2 ? CYAN : MAG, [-0.84 + i * 0.28, 2.42, -3.3], 1.8);
  bx(1.7, 0.02, 0.04, DARK, [0, 1.38, -3.3]);
  bx(0.03, 0.9, 0.04, DARK, [0, 1.0, -3.3]); // door seam
  bx(0.03, 0.9, 0.04, DARK, [0, 1.0, -3.3]);
  for (const s of [1, -1]) {
    decal(new THREE.PlaneGeometry(0.12, 0.6), LEVEL, [s * 0.98, 1.7, -3.294], [0, 0, -1]);
    neon(0.14, 0.4, 0.04, RED, [s * 0.98, 1.1, -3.3], 1.8);
    bx(0.05, 0.12, 0.05, STEEL, [s * 0.1, 1.0, -3.31]);
    cy(0.07, 0.4, 8, DARKM, [s * 0.5, 0.75, -3.45], { rotation: [90, 0, 0] });
  }
  bx(2.3, 0.3, 0.4, PLATE, [0, 0.98, -3.5]);
  decal(new THREE.PlaneGeometry(2.1, 0.26), HAZARD, [0, 0.98, -3.705], [0, 0, -1]);
  b.part(new THREE.SphereGeometry(0.06, 8, 6), STEEL, { bone: chassis, at: [0, 1.17, -3.5], flat: true });
  neon(2.0, 0.03, 0.03, MAG, [0, 0.77, -3.5], 1.6);

  // ------------------------------------------------------------------ water cannon turret
  const TZ = -1.2;
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.62, TZ], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 3.1, TZ], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.62, 0.05, 6, 20), STEEL, { bone: chassis, at: [0, 2.66, TZ], rotation: [90, 0, 0], flat: true });
  const bolts = mergeGeometries(
    full(12).map((a) => {
      const g = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6);
      g.translate(0.62 * Math.cos(a), 2.7, TZ + 0.62 * Math.sin(a));
      return g;
    }),
  )!;
  b.part(bolts, DARKM, { bone: chassis, at: [0, 0, 0], flat: true });
  b.lathe([[0, 0], [0.6, 0], [0.57, 0.1], [0.5, 0.32], [0, 0.32]], {
    at: [0, 2.64, TZ], axis: [0, 1, 0], segments: 14, bone: yaw, color: PLATE,
  });
  for (const s of [1, -1] as const) {
    b.extrude(
      [[-0.6, 2.95], [0.5, 2.95], [0.55, 3.15], [0.25, 3.6], [-0.3, 3.6], [-0.6, 3.3]],
      { at: [s * 0.43, 0, TZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.14, bevel: 0.03, bone: yaw, color: PLATE },
    );
    bx(0.16, 0.04, 0.55, YEL, [s * 0.43, 3.6, TZ - 0.02], { bone: yaw });
    neon(0.02, 0.03, 0.9, CYAN, [s * 0.505, 3.0, TZ - 0.05], 1.8, { bone: yaw });
    cy(0.1, 0.3, 10, STEEL, [s * 0.52, 3.1, TZ], { bone: pitch, rotation: [0, 0, 90], flat: true });
  }
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 18), "#1c1c22", { bone: yaw, at: [0.505, 3.3, TZ + 0.32], rotation: [0, 0, 90] });
  b.part(new THREE.CircleGeometry(0.12, 20), "#ffffff", {
    bone: yaw, at: [0.516, 3.3, TZ + 0.32], dir: [1, 0, 0], axis: "z", texture: GAUGE,
  });
  bx(1.0, 0.6, 0.5, PLATE, [0, 3.15, TZ - 0.65], { bone: yaw });
  for (let i = 0; i < 4; i++) bx(0.7, 0.03, 0.03, DARK, [0, 3.0 + i * 0.1, TZ - 0.91], { bone: yaw });
  neon(0.7, 0.05, 0.06, MAG, [0, 3.5, TZ - 0.65], 1.8, { bone: yaw });
  cy(0.12, 0.08, 8, STEEL, [0.25, 3.47, TZ - 0.5], { bone: yaw });
  bx(0.7, 0.42, 0.5, STEEL, [0, 3.1, TZ - 0.1], { bone: pitch });
  cy(0.2, 0.12, 10, DARKM, [0, 3.1, -1.56], { bone: pitch, rotation: [90, 0, 0], flat: true });
  b.sweep(polyline([[0, 3.1, -1.45], [0, 3.1, 0.9]]), [0.17, 0.15, 0.13, 0.12, 0.12], {
    bone: pitch, color: CANNON, sides: 10, caps: "flat",
  });
  cy(0.19, 0.5, 10, PLATE, [0, 3.1, -0.95], { bone: pitch, rotation: [90, 0, 0], flat: true });
  for (const z of [-0.3, 0.45])
    b.part(new THREE.TorusGeometry(0.15, 0.035, 5, 12), YEL, { bone: pitch, at: [0, 3.1, z] });
  for (const s of [1, -1]) neon(0.03, 0.03, 1.1, "#3df2ff", [s * 0.1, 3.22, 0.15], 1.8, { bone: pitch });
  bx(0.28, 0.2, 0.34, PLATE, [0, 3.34, -0.75], { bone: pitch });
  glow(b.part(cyl(0.06, 0.02, 10), CYAN, { bone: pitch, at: [0, 3.34, -0.575], rotation: [90, 0, 0] }), 2);
  b.lathe([[0, 0], [0.12, 0], [0.13, 0.04], [0.22, 0.35], [0.19, 0.36], [0.1, 0.1], [0, 0.1]], {
    at: [0, 3.1, 0.9], axis: [0, 0, 1], segments: 12, bone: pitch, color: BLUED,
  });
  glow(b.part(new THREE.TorusGeometry(0.205, 0.013, 5, 16), "#3df2ff", { bone: pitch, at: [0, 3.1, 1.255] }), 2);
  // hoses from the tank to the turret
  for (const s of [1, -1]) {
    const hose = catmull([[s * 0.35, 2.64, -2.3], [s * 0.45, 2.85, -2.0], [s * 0.3, 3.0, -1.7]]);
    b.sweep(hose, 0.035, { bone: yaw, color: "#15171d", sides: 6 });
    b.along(hose, 5, (at) =>
      b.part(new THREE.TorusGeometry(0.04, 0.012, 4, 8), STEEL, {
        at, bone: yaw,
        quat: at.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)),
      }),
    );
    cy(0.06, 0.12, 8, YEL, [s * 0.35, 2.66, -2.3]);
  }

  return b.root;
}
