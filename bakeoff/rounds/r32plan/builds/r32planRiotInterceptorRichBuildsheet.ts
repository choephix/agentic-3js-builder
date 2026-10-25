/*
BUILD SHEET — "VANTA-9 Riot Suppression Interceptor", NovaCorp security 6x6 APC
Proportions: 6.8 m long (z), 2.6 m wide (x, wheels incl.), 3.7 m tall incl. tank and roof gear.
Masses: hull slab 6.6 x 2.3 x ~2 m (side-profile extrude, sloped hood and windshield);
  wheels 6 x r0.55; roof water tank 2.0 m x r0.55; turret + cannon barrel 1.9 m; front plow wedge 2.6 m wide.
Parts: hull, undercarriage, 6 tyres + hubs + neon rims, fenders, plow with hazard paint, grille, headlights,
  windshield with HUD drawing + blast cage bars, side windows, corp-logo and text decals, side armour plates,
  roof tank with bands/end caps/hose, turret ring + housing + barrel + nozzle, LRAD dishes, light bars,
  antennas, mirrors, rear doors, plate, tail lights.
Palette: gunmetal #1d212b / #2b3140 hull; tyre #0c0c10; hazard #f2c200 / #14141a; neon magenta #ff2bd6;
  neon cyan #19f0ff; warning red #ff2a3a; water-tank blue #2a7fd0; glass #0a1824; trim steel #6b7388.
Signature features: (1) rooftop water cannon, big tank, housing and glowing nozzle ring;
  (2) neon bars - roof bar split magenta/cyan, side rails, wheel rings, under-glow, all emissive;
  (3) hazard-striped plow and gritty painted hull (grime low, light on top, panel seams);
  (4) drawn windshield HUD, NovaCorp emblem decals and stencil text.
*/
import * as THREE from "three";
import { createBuilder, frame, catmull, mix, noise, paint, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Vanta-9 Riot Interceptor",
  description: "Cyberpunk corporate riot-control APC with roof water cannon and neon light bars.",
};

const BASE = "#1d212b", PLATE = "#2b3140", STEEL = "#6b7388", TYRE = "#0c0c10", YEL = "#f2c200", BLK = "#14141a";
const MAG = "#ff2bd6", CYAN = "#19f0ff", RED = "#ff2a3a", BLUE = "#2a7fd0", GLASS = "#0a1824", WHITE = "#e8fbff";

const HULL = paint((p, n) => {
  let c = mix(BASE, "#39425a", smoothstep(0.3, 1, n.y) * 0.6);
  const g = smoothstep(1.2, 0.5, p.y) * (0.4 + 0.6 * noise(p, 0.3, 4));
  c = mix(c, "#0e0d0c", g * 0.7);
  c = mix(c, "#2d6f86", smoothstep(0.55, 0.8, noise(p, 0.5, 9)) * 0.15 * smoothstep(0, 0.6, n.y));
  const f = Math.abs(((p.z / 0.95) % 1 + 1) % 1 - 0.5);
  if (f > 0.488) c = mix(c, [0.03, 0.03, 0.04], 0.85);
  return c;
});
const PLOW = paint((p) => ((Math.floor((p.x + p.y) * 7) % 2 + 2) % 2 ? YEL : BLK));
const ARMOR = paint((p, n) => mix(PLATE, "#4a5370", smoothstep(0.2, 1, n.y) * 0.5 + 0.2 * noise(p, 0.12, 2)));

const LOGO = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#10131c" stroke="#19f0ff" stroke-width="4"/>
<polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="#ff2bd6" stroke-width="5"/>
<path d="M32 36 L50 66 L68 36" fill="none" stroke="#ffffff" stroke-width="7" stroke-linejoin="round"/>
<circle cx="50" cy="50" r="5" fill="#19f0ff"/></svg>`, { size: 128 });
const SIDETXT = svg(`<svg viewBox="0 0 320 64"><rect width="320" height="64" fill="#10131c" opacity="0.0"/>
<text x="6" y="30" font-family="monospace" font-weight="bold" font-size="28" fill="#19f0ff">RIOT SUPPRESSION</text>
<text x="8" y="56" font-family="monospace" font-size="18" fill="#ff2bd6">NOVACORP SEC // UNIT V-9</text></svg>`, { size: 512 });
const WINDSHIELD = svg(`<svg viewBox="0 0 160 70"><rect width="160" height="70" fill="#0a1824"/>
<path d="M0 8 H160 M0 62 H160" stroke="#16384a" stroke-width="3"/>
<path d="M10 20 H60 M10 28 H44 M100 20 H150 M116 28 H150" stroke="#19f0ff" stroke-width="1.6" opacity="0.8"/>
<circle cx="80" cy="35" r="14" fill="none" stroke="#ff2bd6" stroke-width="1.5"/><path d="M80 17 V25 M80 45 V53 M62 35 H70 M90 35 H98" stroke="#ff2bd6" stroke-width="1.5"/>
<text x="10" y="58" font-family="monospace" font-size="7" fill="#19f0ff">TGT 02 // CROWD 340 // H2O 82%</text>
<path d="M0 70 L50 0 H70 L20 70Z" fill="#ffffff" opacity="0.07"/></svg>`, { size: 512 });
const SIDEWIN = svg(`<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#0a1824" stroke="#2b3140" stroke-width="3"/>
<path d="M0 40 L30 0 H44 L14 40Z" fill="#fff" opacity="0.08"/><path d="M6 10 H30" stroke="#19f0ff" stroke-width="1.5"/></svg>`, { size: 160 });
const GRILLE = svg(`<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#07080c"/>
${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 10 + 2}" y="4" width="6" height="32" fill="#1a1e29"/>`).join("")}
<rect x="0" y="17" width="120" height="3" fill="#ff2bd6"/></svg>`, { size: 256 });
const TANKEND = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#2a7fd0" stroke="#10131c" stroke-width="4"/>
<path d="M50 18 C66 42 72 52 72 62 A22 22 0 0 1 28 62 C28 52 34 42 50 18Z" fill="#e8fbff"/>
<path d="M40 64 A10 10 0 0 0 52 74" stroke="#2a7fd0" stroke-width="4" fill="none"/></svg>`, { size: 128 });
const PLATETX = svg(`<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#e8e8d8" stroke="#10131c" stroke-width="3"/>
<text x="50" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#10131c">NC-0V9</text></svg>`, { size: 160 });
const WARN = svg(`<svg viewBox="0 0 100 100"><polygon points="50,6 96,90 4,90" fill="#f2c200" stroke="#10131c" stroke-width="5"/>
<path d="M50 34 V62" stroke="#10131c" stroke-width="9"/><circle cx="50" cy="76" r="5" fill="#10131c"/></svg>`, { size: 96 });

export default function build() {
  const b = createBuilder({ name: "vanta9" });
  const R = rng(5);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) => P(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (r: number, l: number, c: any, at: number[], dir: number[], seg = 12, o: any = {}) =>
    P(new THREE.CylinderGeometry(r, r, l, seg), c, at, { dir, ...o });
  const neon = (a: number[], z: number[], r: number, c: string, k = 1.6) => glow(b.rod(a, z, r, { color: c, sides: 6, caps: "flat" }), k);
  const lit = (w: number, h: number, d: number, c: string, at: number[], k = 1.8) => glow(box(w, h, d, c, at), k);
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, flat: false, ...o });

  // ---- hull
  b.extrude(
    [[-3.2, 0.5], [3.3, 0.5], [3.4, 0.8], [3.4, 1.45], [2.1, 1.7], [1.3, 2.5], [-3.0, 2.55], [-3.2, 2.3]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: HULL },
  );
  box(2.0, 0.3, 6.2, BLK, [0, 0.4, 0]); // undercarriage
  box(1.8, 0.14, 6.0, PLATE, [0, 0.3, 0]);
  // roof and shoulder armour
  box(2.0, 0.1, 4.2, ARMOR, [0, 2.6, -1.0]);
  box(1.9, 0.08, 0.5, ARMOR, [0, 2.58, 1.1], { rotation: [-8, 0, 0] });
  // ---- plow bumper
  b.extrude([[-1.35, 0.3], [1.35, 0.3], [1.2, 1.0], [-1.2, 1.0]], { at: [0, 0, 3.55], x: [1, 0, 0], thickness: 0.55, bevel: 0.04, color: PLOW });
  box(2.0, 0.28, 0.3, STEEL, [0, 0.95, 3.5]);
  for (const s of [1, -1]) {
    box(0.18, 0.7, 0.5, STEEL, [s * 1.2, 0.65, 3.35]);
    box(0.5, 0.5, 0.06, PLATE, [s * 1.0, 1.1, 3.43]); // headlight pod
    lit(0.34, 0.14, 0.05, WHITE, [s * 1.0, 1.12, 3.47], 2.4);
    lit(0.34, 0.04, 0.05, CYAN, [s * 1.0, 1.28, 3.47], 2.2);
    box(0.5, 0.08, 0.5, STEEL, [s * 1.0, 1.4, 3.1]);
  }
  decal(GRILLE, 1.3, 0.45, [0, 1.15, 3.43], [0, 0, 1]);
  neon([-1.1, 0.72, 3.84], [1.1, 0.72, 3.84], 0.03, CYAN, 2);
  neon([-0.9, 1.45, 3.43], [0.9, 1.45, 3.43], 0.025, MAG, 2);
  decal(WARN, 0.26, 0.26, [0, 1.38, 3.42], [0, 0, 1], { scale: [1, 1, 1] });
  // hood vents
  for (let i = 0; i < 4; i++) box(1.3, 0.03, 0.08, BLK, [0, 1.6 - i * 0.03, 2.9 - i * 0.25], { rotation: [-12, 0, 0] });

  // ---- cab glass
  const wn = new THREE.Vector3(0, 0.707, 0.707);
  decal(WINDSHIELD, 1.95, 1.08, [0, 2.12, 1.72], wn.toArray(), { up: [0, 1, -1] });
  for (let i = -2; i <= 2; i++) b.rod([i * 0.45, 1.75, 2.08], [i * 0.45, 2.5, 1.32], 0.025, STEEL, { sides: 5, caps: "flat" }); // blast cage
  b.rod([-1.0, 2.2, 1.78], [1.0, 2.2, 1.78], 0.025, STEEL, { sides: 5, caps: "flat" });
  for (const s of [1, -1]) {
    decal(SIDEWIN, 1.1, 0.55, [s * 1.162, 2.0, 0.85], [s, 0, 0]);
    decal(SIDEWIN, 0.9, 0.5, [s * 1.162, 2.0, -0.4], [s, 0, 0]);
    box(0.08, 0.28, 0.35, PLATE, [s * 1.3, 1.9, 1.5]); // mirror
    box(0.18, 0.2, 0.06, GLASS, [s * 1.34, 1.9, 1.5]);
  }

  // ---- wheels
  for (const s of [1, -1])
    for (const z of [2.3, 0, -2.3]) {
      const x = s * 1.3;
      cyl(0.55, 0.42, TYRE, [x, 0.55, z], [1, 0, 0], 14);
      cyl(0.3, 0.46, STEEL, [x, 0.55, z], [1, 0, 0], 8);
      cyl(0.1, 0.5, BLK, [x, 0.55, z], [1, 0, 0], 6);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        box(0.05, 0.05, 0.05, STEEL, [x + s * 0.24, 0.55 + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2]);
      }
      P(new THREE.TorusGeometry(0.4, 0.025, 5, 16), CYAN, [x + s * 0.225, 0.55, z], { dir: [s, 0, 0], axis: "z" });
      const ring = b.root.children[b.root.children.length - 1] as THREE.Mesh;
      if (ring && (ring as any).isMesh) glow(ring, 2);
      box(0.55, 0.12, 1.4, BLK, [x, 1.17, z]); // fender
      box(0.1, 0.5, 1.4, PLATE, [s * 1.52, 0.9, z]);
    }

  // ---- sides: neon rails, armour, text
  for (const s of [1, -1]) {
    neon([s * 1.18, 0.78, -2.9], [s * 1.18, 0.78, 2.9], 0.03, MAG, 2);
    neon([s * 1.18, 1.6, -2.9], [s * 1.18, 1.6, 1.6], 0.022, CYAN, 2);
    box(0.08, 0.5, 1.2, ARMOR, [s * 1.19, 1.15, 1.15]);
    box(0.08, 0.5, 1.2, ARMOR, [s * 1.19, 1.15, -1.15]);
    decal(SIDETXT, 1.9, 0.38, [s * 1.162, 1.2, -0.0], [s, 0, 0]);
    decal(LOGO, 0.6, 0.6, [s * 1.162, 1.35, 2.5 - 0.0], [s, 0, 0]);
    decal(WARN, 0.2, 0.2, [s * 1.162, 1.0, -1.9], [s, 0, 0]);
    for (let k = 0; k < 3; k++) box(0.06, 0.06, 0.06, YEL, [s * 1.19, 0.95 + k * 0.0, -2.9 + k * 0.1]);
    // under-glow
    glow(box(0.06, 0.04, 5.2, MAG, [s * 0.95, 0.3, 0]), 2);
    // side rails / handles
    b.rod([s * 1.2, 2.3, -2.7], [s * 1.2, 2.3, -1.6], 0.02, STEEL, { sides: 5 });
  }

  // ---- roof light bars
  box(2.0, 0.14, 0.3, BLK, [0, 2.7, 1.0]);
  lit(0.95, 0.12, 0.26, MAG, [-0.5, 2.8, 1.0], 2.6);
  lit(0.95, 0.12, 0.26, CYAN, [0.5, 2.8, 1.0], 2.6);
  for (const s of [1, -1]) lit(0.12, 0.1, 0.3, RED, [s * 1.0, 2.82, 1.0], 2.2);
  neon([-0.9, 2.62, 1.24], [0.9, 2.62, 1.24], 0.02, WHITE, 2);

  // ---- tank
  const tz = -2.0;
  cyl(0.55, 2.0, BLUE, [0, 3.1, tz], [0, 0, 1], 14, { color: BLUE });
  cyl(0.57, 0.12, PLATE, [0, 3.1, tz + 0.5], [0, 0, 1], 14);
  cyl(0.57, 0.12, PLATE, [0, 3.1, tz - 0.5], [0, 0, 1], 14);
  for (const e of [1, -1]) {
    cyl(0.56, 0.08, STEEL, [0, 3.1, tz + e * 1.03], [0, 0, 1], 14);
    decal(TANKEND, 0.9, 0.9, [0, 3.1, tz + e * 1.075], [0, 0, e], { up: [0, 1, 0] });
  }
  for (const s of [1, -1]) box(0.14, 0.4, 0.5, STEEL, [s * 0.4, 2.75, tz]);
  glow(box(1.4, 0.04, 0.04, CYAN, [0, 3.66, tz]), 2);
  box(0.4, 0.1, 0.4, STEEL, [0, 3.68, tz + 0.5]); // filler cap
  cyl(0.12, 0.06, BLK, [0, 3.74, tz + 0.5], [0, 1, 0], 8);

  // ---- turret + cannon
  const ty = 2.72, tcz = 0.2;
  cyl(0.55, 0.14, STEEL, [0, ty, tcz], [0, 1, 0], 14);
  cyl(0.42, 0.2, PLATE, [0, ty + 0.14, tcz], [0, 1, 0], 12);
  box(0.8, 0.5, 1.1, ARMOR, [0, ty + 0.5, tcz - 0.1]);
  box(0.84, 0.1, 0.9, STEEL, [0, ty + 0.78, tcz - 0.1]);
  box(0.5, 0.35, 0.2, BLK, [0, ty + 0.5, tcz + 0.52]);
  lit(0.3, 0.06, 0.04, CYAN, [0, ty + 0.5, tcz + 0.63], 2.4);
  const by = ty + 0.52;
  cyl(0.16, 1.8, STEEL, [0, by, tcz + 1.3], [0, 0, 1], 10);
  cyl(0.21, 0.35, PLATE, [0, by, tcz + 0.6], [0, 0, 1], 10);
  for (let i = 0; i < 3; i++) cyl(0.2, 0.08, YEL, [0, by, tcz + 1.0 + i * 0.35], [0, 0, 1], 10);
  cyl(0.22, 0.28, BLK, [0, by, tcz + 2.2], [0, 0, 1], 10);
  glow(cyl(0.23, 0.05, CYAN, [0, by, tcz + 2.36], [0, 0, 1], 10), 2.6);
  glow(cyl(0.12, 0.04, WHITE, [0, by, tcz + 2.37], [0, 0, 1], 8), 2.2);
  for (const s of [1, -1]) {
    box(0.1, 0.34, 0.1, STEEL, [s * 0.28, by + 0.05, tcz + 0.6]);
    cyl(0.07, 0.8, BLK, [s * 0.42, by - 0.15, tcz + 0.2], [0, 0, 1], 6);
  }
  // hose from tank to housing
  b.sweep(catmull([[0, 3.0, tz + 1.05], [0.55, 3.15, tz + 1.5], [0.5, 3.1, -0.35], [0.15, 3.05, tcz - 0.3]]), 0.06, { color: BLK, sides: 6 });
  b.sweep(catmull([[0, 3.0, tz + 1.05], [-0.55, 3.0, tz + 1.5], [-0.5, 3.0, -0.35], [-0.15, 3.0, tcz - 0.3]]), 0.06, { color: BLK, sides: 6 });

  // ---- LRAD dishes + sensors
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.22, 0.02], [0.22, 0.1], [0.05, 0.13], [0, 0.13]], { at: [s * 0.8, 2.7, -0.5], axis: [s * 0.3, 0.4, 1], segments: 10, color: STEEL });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), CYAN, { at: [s * 0.8, 2.74, -0.38] }), 2);
    b.rod([s * 0.9, 2.62, -2.9], [s * 0.9, 3.9, -3.0], 0.015, STEEL, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [s * 0.9, 3.92, -3.0] }), 2.5);
  }
  P(new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), BLK, [0, 2.62, 0.6], { flat: true });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), MAG, { at: [0, 2.72, 0.7] }), 2.4);

  // ---- rear
  for (const s of [1, -1]) {
    box(0.05, 1.6, 0.08, BLK, [s * 0.05, 1.35, -3.22]);
    lit(0.5, 0.12, 0.05, RED, [s * 0.8, 1.9, -3.22], 2.2);
    lit(0.12, 0.5, 0.05, RED, [s * 1.0, 1.4, -3.22], 2.0);
    box(0.5, 0.35, 0.08, ARMOR, [s * 0.8, 0.85, -3.22]);
  }
  box(2.0, 0.1, 0.1, STEEL, [0, 2.2, -3.2]);
  decal(PLATETX, 0.55, 0.22, [0, 1.0, -3.28], [0, 0, -1]);
  decal(LOGO, 0.55, 0.55, [0, 1.6, -3.27], [0, 0, -1]);
  box(2.2, 0.3, 0.3, YEL, [0, 0.6, -3.35]); // rear bumper with hazard
  b.part(new THREE.BoxGeometry(2.2, 0.28, 0.28), PLOW, { at: [0, 0.6, -3.37] });
  neon([-1.0, 0.45, -3.55], [1.0, 0.45, -3.55], 0.025, RED, 2);

  // grit rivets
  for (let i = 0; i < 18; i++) {
    const x = (R() < 0.5 ? -1 : 1) * 1.17, z = -2.8 + R() * 5.6, y = 0.95 + R() * 0.15;
    box(0.04, 0.04, 0.04, STEEL, [x, y, z]);
  }
  return b.root;
}
