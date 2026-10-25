import * as THREE from "three";
import { createBuilder, svg, paint, mottle, countershade, catmull, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Riot Interceptor RC-07",
  description:
    "Corporate riot-control interceptor: armored cab, plow bumper, roof-mounted water cannon with tank and hose, neon light bars and sirens, cyberpunk livery.",
};

// ---------------------------------------------------------------- palette
const GUN = "#1b1f2a";
const DARK = "#12141a";
const STEEL = "#4a5266";
const CYAN = "#19f2ff";
const MAG = "#ff2a8a";
const YEL = "#f5e642";
const RED = "#ff2030";
const BLUE = "#2a5cff";
const AMBER = "#ffb020";
const WHITE = "#eaf6ff";

// ---------------------------------------------------------------- textures
const LOGO = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#101218" stroke="${YEL}" stroke-width="6"/>
  <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="${CYAN}" stroke-width="2"/>
  <path d="M34 28 H44 V45 L60 28 H72 L54 48 L74 72 H61 L47 54 L44 57 V72 H34Z" fill="${YEL}"/>
  <path d="M58 20 L48 40 H56 L46 62" fill="none" stroke="${MAG}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const SIDE = svg(
  `<svg viewBox="0 0 400 100"><rect x="2" y="2" width="396" height="96" rx="8" fill="#0c0e14" stroke="${YEL}" stroke-width="4"/>
  <rect x="2" y="2" width="60" height="96" fill="${YEL}"/>
  <path d="M10 90 L30 10 M28 90 L48 10" stroke="#0c0e14" stroke-width="9"/>
  <text x="78" y="52" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="${WHITE}">CROWD SUPPRESSION</text>
  <text x="78" y="82" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="${CYAN}">KIRO-TEC // UNIT 07 // WATER DIV.</text>
  <rect x="352" y="64" width="36" height="22" fill="${MAG}"/></svg>`,
  { size: 512 },
);
const HEAD = svg(
  `<svg viewBox="0 0 100 36"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${CYAN}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <polygon points="2,32 8,6 98,2 92,20 40,30" fill="url(#g)"/><polygon points="12,24 14,12 60,9 40,22" fill="#ffffff" opacity="0.8"/></svg>`,
  { size: 192 },
);
const WIND = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#0a2634"/>
  <polygon points="0,60 30,0 44,0 14,60" fill="${CYAN}" opacity="0.35"/><polygon points="50,60 80,0 86,0 56,60" fill="${CYAN}" opacity="0.25"/>
  <rect x="0" y="0" width="100" height="6" fill="#06141c"/>
  <text x="6" y="54" font-family="monospace" font-size="6" fill="${MAG}">TARGET LOCK // CROWD 128</text></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#0a2634"/><polygon points="0,40 24,0 36,0 12,40" fill="${CYAN}" opacity="0.3"/>
  <rect x="48" y="0" width="4" height="40" fill="#06141c"/></svg>`,
  { size: 192 },
);
const GAUGE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#06141c" stroke="${CYAN}" stroke-width="5"/>
  <path d="M50 50 L24 76 A38 38 0 0 1 12 50" stroke="none" fill="none"/>
  <path d="M18 74 A38 38 0 1 1 82 74" stroke="${CYAN}" stroke-width="4" fill="none" stroke-dasharray="3 5"/>
  <path d="M70 80 A38 38 0 0 0 82 74" stroke="${RED}" stroke-width="8" fill="none"/>
  <path d="M50 50 L68 30" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="6" fill="${MAG}"/></svg>`,
  { size: 128 },
);
const LED = svg(
  `<svg viewBox="0 0 200 40"><rect width="200" height="40" fill="#0b0805"/>
  <text x="100" y="31" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="30" letter-spacing="3" fill="${AMBER}">DISPERSE</text></svg>`,
  { size: 384 },
);
const REAR = svg(
  `<svg viewBox="0 0 200 60"><rect width="200" height="60" fill="#14070a"/>
  <text x="100" y="30" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="24" fill="${RED}">STAND DOWN</text>
  <text x="100" y="52" text-anchor="middle" font-family="monospace" font-size="12" fill="${AMBER}">KEEP 30M // CANNON ARMED</text></svg>`,
  { size: 384 },
);
const LENS = svg(
  `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#220306" stroke="${RED}" stroke-width="3"/><circle cx="20" cy="20" r="9" fill="${RED}"/><circle cx="16" cy="16" r="3" fill="#fff"/></svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------- paints
const HAZ = paint((p) => (Math.floor((p.x + p.y * 0.9) / 0.14) & 1 ? "#f2d71c" : "#15161b"));
const BODY = panelled(
  countershade(mottle("#2c3342", "#232937", { size: 0.4, seed: 3 }), "#161a22", { level: -0.2 }),
  { size: 0.5, aspect: 0.6, rivets: 0.06 },
);
const LOWER = paint((p, n) => (Math.abs(n.x) > 0.7 && p.y < 0.84 ? HAZ : BODY));
const CABIN = panelled(countershade("#2a3140", "#171b24", { level: 0 }), { size: 0.4, aspect: 0.8, rivets: 0.05 });
const TANK = panelled(mottle("#303848", "#262d3b", { size: 0.3, seed: 8 }), { size: 0.35, aspect: 1, rivets: 0.05 });
const TREAD = (cz: number) =>
  paint((p, n) => {
    if (Math.abs(n.x) > 0.7) return "#23252c";
    const a = Math.atan2(p.y - 0.62, p.z - cz);
    return Math.floor(a / (Math.PI / 7)) & 1 ? "#0e0f12" : "#1c1d23";
  });
const IRON = metal("iron");
const STEELM = metal("steel", { tarnish: 0.4 });

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  // ------------------------------------------------------------ helpers
  const box = (size: number[], color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opts });
  const cyl = (r: number, h: number, color: any, at: any, dir?: any, seg = 10, r2?: number) => {
    const o: any = { at };
    if (dir) o.dir = dir;
    return b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, o);
  };
  const neon = (size: number[], color: string, at: number[], s = 1.6) => glow(box(size, color, at), s);
  const plane = (w: number, h: number, tex: any, at: any, dir: any, up: any = [0, 1, 0], g = 0, flat = false) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
    if (g) glow(p, g);
    return p;
  };
  const prof = (pts: number[][], thick: number, color: any, bevel = 0.04) =>
    b.extrude(pts as any, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: thick, bevel, color });

  // ------------------------------------------------------------ chassis & body
  box([2.0, 0.3, 4.9], DARK, [0, 0.62, -0.05]); // underbody
  prof(
    [[-2.6, 0.65], [-2.6, 1.55], [1.2, 1.6], [2.6, 1.35], [2.7, 1.05], [2.62, 0.65]],
    2.3,
    LOWER,
  );
  // cabin
  prof([[-1.1, 1.55], [-1.1, 2.35], [0.5, 2.4], [1.25, 1.6]], 2.0, CABIN, 0.05);
  // roof plate and rear cabin wall details
  box([1.9, 0.05, 1.5], STEEL, [0, 2.42, -0.5]);

  // windshield
  const WN = [0, 0.684, 0.729];
  plane(1.9, 0.95, WIND, [0, 2.0 + 0.684 * 0.02, 0.875 + 0.729 * 0.02], WN, [0, 1, 0], 0.35);
  // cage bars
  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3;
    b.rod([x, 2.44, 0.544], [x, 1.64, 1.294], 0.012, DARK);
  }
  for (const t of [0.2, 0.5, 0.8]) {
    const y = 2.44 + (1.64 - 2.44) * t;
    const z = 0.544 + (1.294 - 0.544) * t;
    b.rod([-0.95, y, z], [0.95, y, z], 0.014, DARK);
  }
  // windshield frame neon
  glow(b.rod([-1.0, 2.41, 0.5], [1.0, 2.41, 0.5], 0.022, CYAN), 1.8);

  for (const s of [1, -1]) {
    // side windows
    plane(1.3, 0.45, SIDEWIN, [s * 1.012, 2.0, -0.2], [s, 0, 0], [0, 1, 0], 0.3);
    // cabin edge neon
    glow(b.rod([s * 1.02, 2.38, -1.05], [s * 1.02, 2.38, 0.48], 0.02, CYAN), 1.8);
    // door handle & mirror
    box([0.04, 0.05, 0.22], STEEL, [s * 1.02, 1.8, -0.9]);
    b.rod([s * 1.0, 2.05, 0.55], [s * 1.28, 2.1, 0.62], 0.025, DARK);
    box([0.1, 0.3, 0.2], GUN, [s * 1.31, 2.1, 0.62]);
    neon([0.02, 0.24, 0.16], MAG, [s * 1.37, 2.1, 0.62], 1.2);
    // exhaust stacks
    cyl(0.08, 0.9, IRON, [s * 1.03, 2.0, -1.2], undefined, 8);
    glow(cyl(0.06, 0.03, AMBER, [s * 1.03, 2.46, -1.2], undefined, 8), 1.5);
    // side decal
    plane(1.7, 0.43, SIDE, [s * 1.153, 1.22, 0.07], [s, 0, 0]);
    // side neon between wheels
    neon([0.04, 0.06, 1.7], MAG, [s * 1.165, 0.93, 0.07], 1.8);
    // underglow
    neon([0.05, 0.04, 3.6], CYAN, [s * 1.0, 0.6, 0], 1.5);
    // hood neon
    const zs = [1.3, 2.55];
    const hy = (z: number) => 1.6 - 0.25 * ((z - 1.2) / 1.4) + 0.03;
    glow(b.rod([s * 0.95, hy(zs[0]), zs[0]], [s * 0.95, hy(zs[1]), zs[1]], 0.025, CYAN), 1.8);
    // headlight eyes
    plane(0.55, 0.2, HEAD, [s * 0.72, 1.2, 2.69], [0, 0.3, 1], [0, 1, 0], 1.6);
    // tail lights
    neon([0.5, 0.12, 0.06], RED, [s * 0.8, 1.2, -2.63], 1.8);
    // bull bars
    b.rod([s * 0.7, 0.85, 3.0], [s * 0.7, 1.45, 2.72], 0.05, STEEL);
    // spotlights on roof
    box([0.18, 0.1, 0.2], DARK, [s * 0.8, 2.49, -0.55]);
    cyl(0.1, 0.22, GUN, [s * 0.8, 2.6, -0.5], [0, 0, 1], 10);
    glow(b.part(new THREE.CircleGeometry(0.085, 10), WHITE, { at: [s * 0.8, 2.6, -0.385], dir: [0, 0, 1], axis: "z" }), 1.6);
    // sirens
    box([0.5, 0.06, 0.3], DARK, [s * 0.78, 2.46, 0.25]);
    neon([0.44, 0.12, 0.24], s > 0 ? RED : BLUE, [s * 0.78, 2.54, 0.25], 2.0);
    // fenders
  }
  neon([0.7, 0.07, 0.05], CYAN, [0, 1.2, 2.69], 1.8);
  plane(1.2, 0.4, LOGO, [0, 1.475 + 0.984 * 0.014, 1.9 + 0.176 * 0.014], [0, 0.984, 0.176], [0, 0, -1]);

  // LED sign
  box([1.1, 0.22, 0.12], DARK, [0, 2.54, 0.3]);
  plane(1.0, 0.19, LED, [0, 2.54, 0.362], [0, 0, 1], [0, 1, 0], 1.4);

  // plow bumper
  b.extrude([[2.55, 0.3], [3.1, 0.3], [3.2, 0.75], [2.55, 0.9]] as any, {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.03, color: HAZ,
  });
  box([2.2, 0.08, 0.1], STEEL, [0, 0.9, 3.15]);
  // rear bumper & lights
  box([2.3, 0.3, 0.25], DARK, [0, 0.85, -2.72]);
  neon([2.0, 0.05, 0.05], RED, [0, 1.4, -2.64], 1.5);
  box([1.0, 0.12, 0.1], YEL, [0, 0.72, -2.85]);

  // ------------------------------------------------------------ wheels
  for (const s of [1, -1])
    for (const z of [1.65, -1.5]) {
      const x = s * 1.2;
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 14), TREAD(z), { at: [x, 0.62, z], dir: [1, 0, 0] });
      cyl(0.38, 0.54, IRON, [x, 0.62, z], [1, 0, 0], 12);
      glow(b.part(new THREE.TorusGeometry(0.3, 0.03, 5, 18), MAG, { at: [x + s * 0.275, 0.62, z], dir: [s, 0, 0], axis: "z" }), 1.8);
      cyl(0.1, 0.06, STEELM, [x + s * 0.29, 0.62, z], [1, 0, 0], 8);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.03, 0.05, STEEL, [x + s * 0.28, 0.62 + Math.sin(a) * 0.19, z + Math.cos(a) * 0.19], [1, 0, 0], 6);
      }
      box([0.7, 0.12, 1.5], GUN, [s * 1.25, 1.31, z]);
      box([0.7, 0.34, 0.08], GUN, [s * 1.25, 1.1, z + 0.71]);
      box([0.7, 0.34, 0.08], GUN, [s * 1.25, 1.1, z - 0.71]);
    }
  for (const z of [1.65, -1.5]) b.rod([-1.2, 0.62, z], [1.2, 0.62, z], 0.1, DARK);

  // ------------------------------------------------------------ water tank
  const tank = b.part(new THREE.CylinderGeometry(0.6, 0.6, 1.4, 16), TANK, { at: [0, 2.1, -1.85], dir: [0, 0, 1] });
  for (const z of [-2.3, -1.4]) cyl(0.62, 0.08, DARK, [0, 2.1, z], [0, 0, 1], 16);
  for (const z of [-2.56, -1.14]) cyl(0.5, 0.05, STEEL, [0, 2.1, z], [0, 0, 1], 12);
  for (const s of [1, -1]) {
    glow(box([0.05, 0.35, 0.9], CYAN, [s * 0.585, 1.8, -1.85]), 1.3);
    b.decal(tank, LOGO, { at: [s * 0.6, 2.25, -1.85], dir: [s, 0, 0], size: [0.38, 0.38] });
  }
  plane(0.95, 0.3, REAR, [0, 2.1, -2.585], [0, 0, -1], [0, 1, 0], 1.3);
  // filler cap & ladder
  cyl(0.12, 0.08, STEEL, [0, 2.72, -2.0], undefined, 8);
  for (let i = 0; i < 4; i++) b.rod([-0.3, 1.7 + i * 0.25, -2.62], [0.3, 1.7 + i * 0.25, -2.62], 0.015, STEEL);
  b.rod([-0.3, 1.6, -2.62], [-0.3, 2.6, -2.62], 0.02, STEEL);
  b.rod([0.3, 1.6, -2.62], [0.3, 2.6, -2.62], 0.02, STEEL);

  // ------------------------------------------------------------ water cannon turret
  const P = new THREE.Vector3(0, 2.82, -0.15);
  const D = new THREE.Vector3(0, 0.07, 1).normalize();
  const at = (t: number) => P.clone().addScaledVector(D, t).toArray();
  cyl(0.36, 0.12, GUN, [0, 2.46, -0.3], undefined, 10);
  glow(b.part(new THREE.TorusGeometry(0.34, 0.015, 4, 16), CYAN, { at: [0, 2.53, -0.3], dir: [0, 1, 0], axis: "z" }), 1.8);
  box([0.6, 0.42, 0.7], CABIN, [0, 2.75, -0.33]);
  box([0.5, 0.06, 0.55], STEEL, [0, 2.98, -0.33]);
  cyl(0.16, 0.45, IRON, at(0.15), D.toArray(), 10);
  cyl(0.1, 1.3, STEELM, at(0.8), D.toArray(), 10);
  for (const t of [0.45, 0.95, 1.25]) cyl(0.125, 0.07, YEL, at(t), D.toArray(), 10);
  cyl(0.1, 0.3, GUN, at(1.5), D.toArray(), 10, 0.16);
  glow(b.part(new THREE.CircleGeometry(0.12, 10), CYAN, { at: at(1.652), dir: D.toArray(), axis: "z" }), 2.2);
  glow(cyl(0.165, 0.03, CYAN, at(1.64), D.toArray(), 10), 1.6);
  for (const s of [1, -1]) plane(0.26, 0.26, GAUGE, [s * 0.312, 2.8, -0.4], [s, 0, 0], [0, 1, 0], 0.7);
  // camera pod
  b.part(new THREE.SphereGeometry(0.09, 8, 6), DARK, { at: [0, 3.03, -0.35] });
  glow(b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [0, 3.03, -0.258], dir: [0, 0, 1], axis: "z", texture: LENS }), 1.4);
  // hose
  b.sweep(
    catmull([[0, 2.65, -1.3], [0, 3.1, -1.05], [0, 3.05, -0.85], [0, 2.8, -0.69]]),
    0.06,
    { color: "#0e1015", sides: 6 },
  );
  for (const [z, y] of [[-1.3, 2.65], [-0.69, 2.8]]) cyl(0.085, 0.08, YEL, [0, y, z], undefined, 8);

  // antenna
  b.rod([-0.85, 2.42, -0.9], [-0.85, 3.4, -0.9], 0.015, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [-0.85, 3.42, -0.9] }), 2);
  // sensor dome
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#2b3345", { at: [0.8, 2.43, -0.95] });

  // ------------------------------------------------------------ grime & rivet studs
  const r = rng(11);
  for (let i = 0; i < 14; i++) {
    const s = r() > 0.5 ? 1 : -1;
    box([0.03, 0.03 + r() * 0.05, 0.12 + r() * 0.2], i % 3 ? MAG : CYAN, [s * 1.168, 1.45 + r() * 0.05, -2.2 + i * 0.12], {});
  }

  return b.root;
}
