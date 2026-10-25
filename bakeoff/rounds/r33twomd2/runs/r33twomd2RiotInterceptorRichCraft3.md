```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "VANTA-R9 Riot Interceptor",
  description:
    "Corporate riot-control armoured interceptor with a roof water cannon, hazard-striped bull bar, neon light bars and underglow, in a Cyberpunk 2077 style.",
};

// ---------- palette ----------
const DARK = "#12141c";
const METAL = "#7d869c";
const YELLOW = "#f5e000";
const CYAN = "#12f0ff";
const MAG = "#ff2d95";
const RED = "#ff1f3d";
const WARM = "#fff2b0";
const BLACK = "#07080c";

// ---------- paints ----------
function bodyPaint(lo: string, hi: string, seamZ: number) {
  return paint((p, n) => {
    const lit = smoothstep(-0.2, 0.8, n.y);
    let c = mix(lo, hi, lit * 0.9);
    const grime = smoothstep(0.85, 0.35, p.y) * (0.45 + noise(p, 0.25, 3) * 0.6);
    c = mix(c, "#0a0b0f", Math.min(grime, 0.8));
    if (noise(p, 0.08, 5) > 0.78) c = mix(c, "#59607a", 0.45);
    if (Math.abs(n.x) > 0.6) {
      const m = ((p.z % seamZ) + seamZ) % seamZ;
      if (m < 0.01) c = mix(c, "#04050a", 0.85);
      if (Math.abs(p.y - 0.95) < 0.006) c = mix(c, "#04050a", 0.85);
    }
    return c;
  });
}
const HULL = bodyPaint("#151823", "#2d3449", 0.95);
const CABIN = bodyPaint("#1b2540", "#3a4a78", 1.1);
const TURRET = paint((p, n) => {
  const lit = smoothstep(-0.2, 0.8, n.y);
  let c = mix("#a18c00", "#f2dc1c", lit);
  c = mix(c, "#2a2400", 0.5 * smoothstep(0.5, 0.9, noise(p, 0.12, 8)));
  if (noise(p, 0.05, 2) > 0.82) c = mix(c, "#23232b", 0.6);
  return c;
});
const TANK = paint((p, n) => {
  let c = mix("#1f5a86", "#3a8cc0", smoothstep(-0.3, 0.9, n.y));
  if (Math.abs(p.x) > 0.5) c = mix("#0d0e12", YELLOW, Math.floor(p.y * 14 + p.z * 14) % 2 === 0 ? 0 : 1);
  if (Math.abs(Math.abs(p.x) - 0.22) < 0.012) c = "#0a1a28";
  return c;
});
const tirePaint = (cz: number) =>
  paint((p, n) => {
    if (Math.abs(n.x) < 0.5) {
      const a = Math.atan2(p.y - 0.55, p.z - cz);
      return Math.floor((a / (Math.PI * 2)) * 24 + 100) % 2 ? "#0b0c10" : "#1e2028";
    }
    const r = Math.hypot(p.y - 0.55, p.z - cz);
    return r > 0.44 && r < 0.48 ? "#343846" : "#15161b";
  });

// ---------- textures ----------
let haz = "";
for (let i = -2; i < 12; i++) haz += `<polygon points="${i * 8},10 ${i * 8 + 4},10 ${i * 8 + 10},0 ${i * 8 + 6},0" fill="#f5e000"/>`;
const HAZARD = svg(`<svg viewBox="0 0 80 10"><rect width="80" height="10" fill="#0b0b0f"/>${haz}</svg>`, { size: 256 });

const LOGO = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#0b0d16" stroke="#f5e000" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="26,28 40,28 50,60 60,28 74,28 56,76 44,76" fill="#f5e000"/>
  <path d="M18 40 A34 34 0 0 1 40 14" stroke="#12f0ff" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M82 60 A34 34 0 0 1 60 86" stroke="#ff2d95" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

const CHEVRON = svg(
  `<svg viewBox="0 0 100 100"><g stroke="#07080c" stroke-width="3" stroke-linejoin="round" fill="#f5e000">
  <path d="M8 62 L50 32 L92 62 L92 78 L50 48 L8 78Z"/><path d="M8 40 L50 10 L92 40 L92 56 L50 26 L8 56Z" fill="#12f0ff"/>
  <path d="M8 84 L50 54 L92 84 L92 98 L50 70 L8 98Z" fill="#ff2d95"/></g></svg>`,
  { size: 128 },
);

let slits = "";
for (let i = 0; i < 8; i++) slits += `<rect x="4" y="${4 + i * 4.4}" width="92" height="1.6" fill="#12f0ff"/>`;
const GRILLE = svg(`<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#05060a"/>${slits}<rect x="0" y="0" width="100" height="40" fill="none" stroke="#f5e000" stroke-width="2"/></svg>`, { size: 192 });

const WINDOW = svg(
  `<svg viewBox="0 0 100 60"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2236"/><stop offset="1" stop-color="#03050a"/></linearGradient></defs>
  <rect width="100" height="60" fill="url(#g)"/><polygon points="10,60 30,0 42,0 22,60" fill="#12f0ff" opacity="0.28"/>
  <polygon points="60,60 78,0 84,0 66,60" fill="#ff2d95" opacity="0.25"/><rect width="100" height="60" fill="none" stroke="#020204" stroke-width="4"/></svg>`,
  { size: 192 },
);

let bars = "";
for (let i = 0; i < 26; i++) bars += `<rect x="${250 + i * 4.2}" y="78" width="${i % 3 ? 1.6 : 2.8}" height="16" fill="#f4f4f4"/>`;
const SIDE = svg(
  `<svg viewBox="0 0 380 110"><rect x="4" y="4" width="372" height="102" rx="8" fill="none" stroke="#04050a" stroke-width="3"/>
  <line x1="190" y1="4" x2="190" y2="106" stroke="#04050a" stroke-width="3"/>
  <text x="18" y="48" font-family="monospace" font-weight="bold" font-size="40" fill="#f5e000" stroke="#07080c" stroke-width="1.5">RIOT</text>
  <text x="18" y="72" font-family="monospace" font-weight="bold" font-size="15" fill="#12f0ff">SUPPRESSION UNIT</text>
  <text x="212" y="44" font-family="monospace" font-weight="bold" font-size="30" fill="#ff2d95">R9-07</text>
  <rect x="14" y="86" width="150" height="10" fill="#f5e000"/>${bars}
  <polygon points="320,52 340,52 345,62 330,76 315,62" fill="#0b0d16" stroke="#f5e000" stroke-width="3"/></svg>`,
  { size: 512 },
);

const REAR = svg(
  `<svg viewBox="0 0 200 70"><line x1="100" y1="2" x2="100" y2="68" stroke="#04050a" stroke-width="2"/>
  <rect x="2" y="2" width="196" height="66" rx="4" fill="none" stroke="#04050a" stroke-width="2"/>
  <text x="10" y="26" font-family="monospace" font-weight="bold" font-size="17" fill="#f5e000">VANTA</text>
  <text x="10" y="42" font-family="monospace" font-size="9" fill="#12f0ff">CIVIL ORDER DIVISION</text>
  <rect x="116" y="38" width="70" height="22" rx="3" fill="#e9e9d8"/>
  <text x="151" y="54" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#111">NC-4471</text>
  <rect x="10" y="52" width="80" height="8" fill="#f5e000"/></svg>`,
  { size: 384 },
);

const HUD = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#02101a"/><rect x="6" y="8" width="70" height="8" fill="#12f0ff"/>
  <rect x="6" y="22" width="48" height="8" fill="#ff2d95"/><rect x="6" y="36" width="60" height="8" fill="#f5e000"/>
  <text x="96" y="16" text-anchor="end" font-family="monospace" font-weight="bold" font-size="11" fill="#12f0ff">H2O</text>
  <text x="96" y="46" text-anchor="end" font-family="monospace" font-size="10" fill="#fff">87%</text></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...o });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const hoodY = (z: number) => 1.28 - 0.1714 * (z - 1.55);

  // ---------- hull & cabin ----------
  b.extrude(
    [[-2.6, 0.4], [2.6, 0.4], [2.75, 0.75], [2.6, 1.1], [1.55, 1.28], [-2.6, 1.3]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, bevel: 0.04, color: HULL },
  );
  b.extrude(
    [[-2.2, 1.2], [1.55, 1.2], [0.9, 1.95], [-1.8, 2.0], [-2.2, 1.85]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.8, bevel: 0.04, color: CABIN },
  );

  // underglow
  glow(box(2.0, 0.03, 4.8, CYAN, [0, 0.37, 0]), 1.6);

  // side neon strips
  for (const s of [1, -1]) {
    glow(box(0.03, 0.04, 4.9, MAG, [s * 1.058, 0.55, 0]), 1.8);
    glow(box(0.03, 0.03, 4.4, CYAN, [s * 1.058, 1.22, 0]), 1.6);
  }

  // ---------- wheels ----------
  const wheel = (s: number, z: number) => {
    const x = s * 1.25;
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.46, 16), tirePaint(z), { at: [x, 0.55, z], dir: [1, 0, 0] });
    cyl(0.36, 0.48, 12, METAL, [x, 0.55, z], [1, 0, 0]);
    cyl(0.3, 0.5, 12, DARK, [x, 0.55, z], [1, 0, 0]);
    glow(b.part(new THREE.TorusGeometry(0.26, 0.025, 6, 16), CYAN, { at: [x + s * 0.255, 0.55, z], dir: [s, 0, 0], axis: "z" }), 1.7);
    cyl(0.1, 0.53, 8, YELLOW, [x, 0.55, z], [1, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.022, 0.05, 6, "#c8cddb", [x + s * 0.26, 0.55 + Math.cos(a) * 0.17, z + Math.sin(a) * 0.17], [s, 0, 0]);
    }
    // fender, flap
    box(0.62, 0.14, 1.3, HULL, [s * 1.2, 1.16, z]);
    box(0.62, 0.04, 1.32, YELLOW, [s * 1.2, 1.245, z]);
    box(0.5, 0.3, 0.04, DARK, [s * 1.2, 0.8, z - 0.66]);
    glow(box(0.5, 0.025, 0.025, CYAN, [s * 1.2, 1.1, z + 0.66]), 1.5);
  };
  for (const s of [1, -1]) {
    wheel(s, 1.55);
    wheel(s, -1.5);
    // side step & panel
    box(0.26, 0.06, 1.7, DARK, [s * 1.17, 0.46, 0.0]);
    plane(1.9, 0.55, SIDE, [s * 1.058, 0.85, 0.0], [s, 0, 0]);
    box(0.04, 0.04, 0.2, "#8c93a8", [s * 1.065, 1.12, 0.35]);
  }

  // ---------- windows ----------
  const wn = new THREE.Vector3(0, 0.6, 0.73).normalize();
  const wc = new THREE.Vector3(0, 1.625, 1.225).addScaledVector(wn, 0.015);
  plane(1.65, 0.95, WINDOW, wc.toArray(), wn.toArray());
  box(1.0, 0.025, 0.04, DARK, [-0.35, 1.5, 1.4], { rotation: [-35, 0, 8] });
  box(1.8, 0.07, 0.22, YELLOW, [0, 1.99, 0.93]);
  for (const s of [1, -1]) {
    plane(0.9, 0.4, WINDOW, [s * 0.915, 1.62, 0.55], [s, 0, 0]);
    plane(1.15, 0.4, WINDOW, [s * 0.915, 1.62, -0.85], [s, 0, 0]);
    for (const z of [0.2, 0.55, 0.9, -0.5, -0.9, -1.3]) box(0.02, 0.42, 0.025, DARK, [s * 0.92, 1.62, z]);
    // mirrors
    b.rod([s * 0.95, 1.45, 0.85], [s * 1.12, 1.58, 0.9], 0.012, DARK);
    box(0.1, 0.22, 0.28, DARK, [s * 1.18, 1.62, 0.9]);
    glow(box(0.02, 0.18, 0.02, CYAN, [s * 1.235, 1.62, 0.9]), 1.5);
    // hood camera pods
    b.part(new THREE.SphereGeometry(0.08, 8, 6), DARK, { at: [s * 0.9, 1.33, 1.7] });
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [s * 0.9, 1.34, 1.77] }), 2);
    // hood vents
    for (let i = 0; i < 4; i++) box(0.3, 0.015, 0.04, BLACK, [s * 0.68, hoodY(1.75 + i * 0.15) + 0.005, 1.75 + i * 0.15]);
  }

  // hood chevron
  const hn = new THREE.Vector3(0, 1, 0.1714).normalize();
  plane(1.0, 0.95, CHEVRON, [0, hoodY(2.05) + 0.012, 2.05], hn.toArray(), { up: [0, 0, 1] });

  // ---------- front end ----------
  box(2.2, 0.3, 0.3, DARK, [0, 0.55, 2.85]);
  plane(2.0, 0.2, HAZARD, [0, 0.55, 3.003], [0, 0, 1]);
  glow(box(1.9, 0.03, 0.05, CYAN, [0, 0.4, 3.0]), 1.8);
  box(1.05, 0.38, 0.1, BLACK, [0, 0.9, 2.72]);
  glow(plane(1.0, 0.34, GRILLE, [0, 0.9, 2.775], [0, 0, 1]), 0.9);
  box(0.9, 0.06, 0.08, METAL, [0, 0.98, 2.95]);
  for (const s of [1, -1]) {
    b.rod([s * 0.4, 0.62, 2.95], [s * 0.4, 1.02, 2.88], 0.03, METAL, { sides: 6 });
    box(0.46, 0.2, 0.1, DARK, [s * 0.78, 0.98, 2.71]);
    glow(box(0.4, 0.13, 0.06, WARM, [s * 0.78, 0.99, 2.75]), 2.2);
    glow(box(0.4, 0.03, 0.05, CYAN, [s * 0.78, 0.86, 2.74]), 2);
    for (let i = 0; i < 4; i++) cyl(0.02, 0.03, 6, "#c8cddb", [s * (0.2 + i * 0.28), 0.55, 3.0], [0, 0, 1]);
    box(0.08, 0.2, 0.06, METAL, [s * 0.95, 0.4, 3.0]);
    // rear lamps
    glow(box(0.14, 0.5, 0.05, RED, [s * 0.95, 0.85, -2.61]), 1.8);
  }

  // ---------- rear ----------
  plane(2.0, 0.7, REAR, [0, 0.8, -2.612], [0, 0, -1]);
  box(2.2, 0.25, 0.2, DARK, [0, 0.5, -2.7]);
  plane(1.9, 0.18, HAZARD, [0, 0.5, -2.801], [0, 0, -1]);
  glow(box(1.5, 0.06, 0.04, MAG, [0, 1.22, -2.62]), 1.8);

  // ---------- roof light bars ----------
  const lightBar = (z: number, y: number, rev: boolean) => {
    box(1.76, 0.08, 0.22, DARK, [0, y, z]);
    for (let i = 0; i < 8; i++) {
      const c = (i + (rev ? 1 : 0)) % 2 ? MAG : CYAN;
      glow(box(0.19, 0.09, 0.22, c, [-0.7 + i * 0.2, y + 0.06, z]), 1.8);
    }
    box(1.76, 0.015, 0.24, YELLOW, [0, y + 0.115, z]);
  };
  lightBar(0.5, 2.04, false);
  lightBar(-2.05, 1.97, true);

  // sirens and roof gear
  for (const s of [1, -1]) {
    cyl(0.1, 0.05, 8, DARK, [s * 0.78, 2.025, -0.2]);
    glow(b.part(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), s > 0 ? CYAN : MAG, { at: [s * 0.78, 2.05, -0.2] }), 2);
    b.rod([s * 0.8, 2.0, -1.9], [s * 0.8, 2.9, -1.95], 0.015, DARK, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 0.8, 2.92, -1.95] }), 2.2);
    glow(box(0.04, 0.04, 1.6, YELLOW, [s * 0.9, 2.02, -0.9]), 1.2);
  }
  box(0.5, 0.06, 0.5, DARK, [0.35, 2.03, 0.1]);
  for (let i = 0; i < 4; i++) box(0.4, 0.012, 0.03, BLACK, [0.35, 2.065, -0.05 + i * 0.1]);
  cyl(0.02, 0.2, 5, DARK, [-0.75, 2.1, 0.1]);
  b.lathe([[0, 0], [0.2, 0.07], [0.2, 0.09], [0, 0.03]], { at: [-0.75, 2.2, 0.1], axis: [-0.4, 0.7, 0.6], color: METAL });

  // ---------- water cannon ----------
  b.lathe([[0, 0], [0.5, 0], [0.5, 0.1], [0.42, 0.14], [0, 0.14]], { at: [0, 2.0, -0.55], color: DARK });
  b.extrude(
    [[-0.5, 0], [0.5, 0], [0.55, 0.2], [0.3, 0.45], [-0.35, 0.45], [-0.5, 0.3]],
    { at: [0, 2.12, -0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.9, bevel: 0.03, color: TURRET },
  );
  for (const s of [1, -1]) {
    plane(0.5, 0.22, HUD, [s * 0.456, 2.27, -0.55], [s, 0, 0]);
    glow(plane(0.5, 0.22, HUD, [s * 0.458, 2.27, -0.55], [s, 0, 0]), 1.3);
    glow(plane(0.2, 0.2, LOGO, [s * 0.458, 2.46, -0.8], [s, 0, 0]), 1.2);
    box(0.04, 0.06, 0.9, DARK, [s * 0.455, 2.16, -0.55]);
  }
  const bs = new THREE.Vector3(0, 2.38, -0.1);
  const be = new THREE.Vector3(0, 2.46, 1.45);
  const bd = be.clone().sub(bs).normalize();
  const at = (t: number) => bs.clone().lerp(be, t).toArray();
  cyl(0.19, 0.3, 10, DARK, at(0.0), bd.toArray(), { });
  b.rod(bs, be, [0.13, 0.1], METAL, { sides: 10 });
  for (const t of [0.3, 0.58, 0.82]) cyl(0.15, 0.07, 10, YELLOW, at(t), bd.toArray());
  glow(cyl(0.125, 0.05, 10, CYAN, at(0.93), bd.toArray()), 2);
  b.lathe([[0, 0], [0.1, 0], [0.2, 0.22], [0, 0.17]], { at: be.toArray(), axis: bd.toArray(), color: DARK });
  glow(cyl(0.11, 0.02, 10, CYAN, be.clone().addScaledVector(bd, 0.17).toArray(), bd.toArray()), 2.4);
  // handle / sight
  box(0.12, 0.1, 0.3, DARK, [0, 2.6, 0.15], { rotation: [3, 0, 0] });
  glow(box(0.06, 0.02, 0.06, RED, [0, 2.66, 0.2]), 2);

  // water tank
  cyl(0.3, 1.3, 14, TANK, [0, 2.3, -1.45], [1, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.32, 0.06, 14, DARK, [s * 0.5, 2.3, -1.45], [1, 0, 0]);
    box(0.08, 0.3, 0.3, DARK, [s * 0.25, 2.15, -1.45]);
    const hose = catmull([[s * 0.5, 2.28, -1.45], [s * 0.62, 2.1, -1.25], [s * 0.5, 2.2, -0.95], [s * 0.3, 2.25, -0.85]]);
    b.sweep(hose, 0.035, { color: "#15171d", sides: 6 });
  }
  glow(box(0.8, 0.06, 0.02, CYAN, [0, 2.3, -1.15]), 1.8);
  plane(0.28, 0.28, LOGO, [0.0, 2.45, -1.17], [0, 0.3, 1]);

  return b.root;
}
```