/*
BUILD SHEET — "KIRIN-ARC Civil Order" riot-control interceptor
Proportions: 6.1 m long (z), 3.0 m wide incl. wheels (hull 2.3), 3.0 m tall to the turret barrel.
Main masses: lower hull 2.3x0.4x5.5; cab/body extrude (side profile, 2.3 wide, to y 2.25);
 3 axles of 6 wheels r0.55 w0.5; roof water tank r0.5 L1.7; water-cannon turret on roof.
Parts: hull+body extrude, sloped windshield (textured), side glass + bars, fenders, hazard ram bumper + push bars,
 grille (hex texture), headlights, hood emblem + vents, roof strobe bar, sensor dome, antennas, mirrors,
 turret (lathe base, head, barrel, pressure rings, muzzle, nozzle), tank (bands, caps, gauge), hose,
 wheels (tire, rim, glow ring, cap), side logos, rear door panel, tail lights, skirt neon.
Palette: gunmetal #3a4458/#222838 body; roof sheen #56637d; grime #2a2420; neon cyan #20f0ff;
 neon magenta #ff2a9d; warning yellow #ffd21f; tyre #101116; tail red #ff2030; hot-white headlights #fff6c8;
 tank blue #2a5f9c; brass-less steel #8a93a6.
Signature features: (1) roof water cannon with glowing pressure rings and cyan nozzle; (2) neon cyan/magenta
 strobe bar and skirt lines that glow; (3) painted grime/seams/racing stripe by place on the body;
 (4) hazard-striped ram bumper with push bars; (5) SVG corporate logos, HUD windshield, hex grille, rear slogan.
*/
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, stripes } from "../../../../src/index";
import { panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Riot-Control Interceptor",
  description: "Cyberpunk corporate armored water-cannon interceptor with neon light bars.",
};

const CYAN = "#20f0ff";
const MAG = "#ff2a9d";
const YEL = "#ffd21f";
const DARK = "#101116";
const STEEL = "#8a93a6";
const RED = "#ff2030";
const WHITE = "#fff6c8";

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const neon = (w: number, h: number, d: number, color: string, at: number[], str = 1.5, opts: any = {}) =>
    glow(box(w, h, d, color, at, opts), str);
  const cyl = (r: number, len: number, color: any, at: number[], dir: number[], seg = 12, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, ...opts });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex });

  // ---------- paints ----------
  const BODY = panelled(
    paint((p, n) => {
      let c = mix("#2c3446", "#3f4a60", smoothstep(0.9, 2.3, p.y));
      if (n.y > 0.6) c = mix(c, "#56637d", 0.6);
      if (Math.abs(n.x) > 0.6 && Math.abs(p.y - 1.0) < 0.045) c = mix("#ff2a9d", "#ff2a9d", 1);
      const grime = Math.max(0, 1 - p.y / 1.1) * (0.5 + noise(p, 0.3, 4));
      c = mix(c, "#2a2420", Math.min(grime, 0.85));
      const wear = smoothstep(0.62, 0.8, noise(p, 0.12, 9));
      return mix(c, "#6f7788", wear * 0.18);
    }),
    { size: 0.8, aspect: 0.8, rivets: 0.12 },
  );
  const HAZARD = stripes(YEL, DARK, { size: 0.2, axis: [1, 1, 0], width: 0.5, wobble: 0.02, seed: 3 });
  const TANK = paint((p, n) => mix(mix("#1f4a82", "#3b86c8", smoothstep(2.3, 3.2, p.y)), "#10223e", n.y < -0.3 ? 0.5 : 0));
  const GRIME_DARK = paint((p) => mix("#16181f", "#262a34", noise(p, 0.2, 2)));

  // ---------- textures ----------
  const LOGO = svg(
    `<svg viewBox="0 0 220 88" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10 L30 10 L44 44 L30 78 L6 78 L20 44Z" fill="#ff2a9d"/>
    <path d="M30 10 L40 10 L54 44 L40 78 L30 78 L44 44Z" fill="#20f0ff"/>
    <text x="64" y="44" font-family="Arial Black, sans-serif" font-weight="900" font-size="34" fill="#f2f6ff" stroke="#0b0c12" stroke-width="1.5">KIRIN-ARC</text>
    <rect x="64" y="52" width="150" height="4" fill="#20f0ff"/>
    <text x="64" y="74" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#ffd21f">CIVIL ORDER DIVISION</text>
    </svg>`,
    { size: 512 },
  );
  const SHIELD = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 4 L92 20 L86 70 L50 96 L14 70 L8 20Z" fill="#0b0c12" stroke="#20f0ff" stroke-width="4"/>
    <ellipse cx="50" cy="46" rx="26" ry="15" fill="none" stroke="#ff2a9d" stroke-width="5"/>
    <circle cx="50" cy="46" r="9" fill="#ffd21f"/><circle cx="50" cy="46" r="3.5" fill="#0b0c12"/>
    <path d="M30 76 L50 86 L70 76" fill="none" stroke="#20f0ff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );
  const GLASS = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1a2e"/><stop offset="1" stop-color="#050912"/></linearGradient></defs>
    <rect width="200" height="100" fill="url(#g)"/>
    <path d="M20 100 L70 0 L90 0 L40 100Z" fill="#20f0ff" opacity="0.22"/>
    <path d="M110 100 L150 0 L160 0 L120 100Z" fill="#ff2a9d" opacity="0.22"/>
    <text x="10" y="14" font-family="monospace" font-size="8" fill="#20f0ff">TGT LOCK // CROWD 412 // H2O 87%</text>
    <rect x="130" y="80" width="60" height="6" fill="none" stroke="#20f0ff"/><rect x="132" y="82" width="44" height="2" fill="#20f0ff"/>
    <circle cx="100" cy="50" r="14" fill="none" stroke="#ff2a9d" stroke-width="1"/>
    <path d="M100 30 V40 M100 60 V70 M80 50 H90 M110 50 H120" stroke="#ff2a9d" stroke-width="1"/>
    </svg>`,
    { size: 512 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="40" fill="#0b0c12"/>
    ${Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 12 }, (_, c) => {
        const x = c * 14 + (r % 2 ? 7 : 0) + 4, y = r * 5 + 3;
        return `<path d="M${x} ${y} l5 0 l3 3 l-3 3 l-5 0 l-3 -3Z" fill="none" stroke="#20f0ff" stroke-width="0.9" opacity="0.8"/>`;
      }).join(""),
    ).join("")}
    </svg>`,
    { size: 512 },
  );
  const REAR = svg(
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="80" fill="#14161e"/>
    <rect x="0" y="0" width="200" height="6" fill="#ffd21f"/>
    <text x="100" y="30" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="15" fill="#f2f6ff">DISPERSE OR BE DISPERSED</text>
    <text x="100" y="45" text-anchor="middle" font-family="monospace" font-size="8" fill="#ff2a9d">// KIRIN-ARC SECURITY // NO WARRANT REQUIRED //</text>
    <rect x="72" y="52" width="56" height="22" rx="2" fill="#e9e3b4" stroke="#0b0c12" stroke-width="1.5"/>
    <text x="100" y="68" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#1a1a22">KRT-0451</text>
    </svg>`,
    { size: 512 },
  );
  const GAUGE = svg(
    `<svg viewBox="0 0 90 36" xmlns="http://www.w3.org/2000/svg">
    <rect width="90" height="36" fill="#06182a"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${4 + i * 8.4}" y="${i < 8 ? 6 : 14}" width="6" height="${i < 8 ? 24 : 16}" fill="${i < 8 ? "#20f0ff" : "#0e3a52"}"/>`).join("")}
    </svg>`,
    { size: 256 },
  );

  // ---------- main body ----------
  box(2.3, 0.4, 5.5, GRIME_DARK, [0, 0.75, 0.05]);
  box(2.0, 0.2, 5.3, DARK, [0, 0.5, 0.05]);
  b.extrude(
    [[-2.8, 0.9], [2.9, 0.9], [2.9, 1.3], [2.0, 1.55], [1.2, 2.25], [-2.6, 2.25], [-2.8, 2.0]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.04, color: BODY },
  );
  // windshield
  box(2.05, 0.05, 1.08, "#ffffff", [0, 1.9 + 0.03 * 0.8, 1.6 + 0.03 * 0.7], {
    dir: [0, 0.8, 0.7],
    texture: GLASS,
  });
  for (let i = 0; i < 4; i++) {
    const t = 0.2 + i * 0.2;
    const pz = 2.0 - 0.8 * t, py = 1.55 + 0.7 * t;
    cyl(0.018, 2.05, DARK, [0, py + 0.07, pz + 0.06], [1, 0, 0], 6);
  }
  // roof panel
  box(2.1, 0.06, 3.7, "#20242f", [0, 2.28, -0.7]);
  box(2.0, 0.03, 0.12, MAG, [0, 2.32, 1.1]);

  for (const s of [1, -1]) {
    // side glass and bars
    box(0.04, 0.4, 1.1, "#0a1424", [s * 1.16, 1.8, 0.85]);
    for (let i = 0; i < 5; i++) box(0.05, 0.42, 0.03, DARK, [s * 1.18, 1.8, 0.35 + i * 0.25]);
    box(0.05, 0.03, 1.12, DARK, [s * 1.18, 1.8, 0.85]);
    // door seams and handles
    box(0.02, 1.2, 0.03, DARK, [s * 1.155, 1.5, 1.5]);
    box(0.02, 1.2, 0.03, DARK, [s * 1.155, 1.5, 0.2]);
    box(0.06, 0.05, 0.2, STEEL, [s * 1.17, 1.4, 0.35]);
    // fenders over wheels
    for (const z of [1.9, 0, -1.9]) box(0.62, 0.1, 1.3, "#1a1e29", [s * 1.32, 1.17, z]);
    // neon skirt
    neon(0.03, 0.05, 4.2, CYAN, [s * 1.165, 0.82, 0], 1.6);
    neon(0.03, 0.04, 4.2, MAG, [s * 1.165, 0.72, 0], 1.6);
    // side logo
    plane(2.2, 0.88, LOGO, [s * 1.162, 1.5, -1.4], [s, 0, 0]);
    // armor ribs
    for (let i = 0; i < 3; i++) box(0.08, 0.7, 0.12, "#252b3a", [s * 1.19, 1.5, -2.45 + i * 0.0 - i * 0.0 + 0.0 + (i - 1) * 0.0 - 0.0]);
    // mirrors
    box(0.05, 0.05, 0.3, DARK, [s * 1.3, 1.95, 1.45]);
    box(0.06, 0.3, 0.2, "#1d212c", [s * 1.42, 1.95, 1.45]);
    // headlights
    neon(0.5, 0.12, 0.05, WHITE, [s * 0.95, 1.12, 2.92], 1.8);
    box(0.56, 0.18, 0.04, DARK, [s * 0.95, 1.12, 2.9]);
    // strobes on hood corners
    neon(0.22, 0.08, 0.14, s > 0 ? CYAN : MAG, [s * 1.0, 1.43, 2.35], 2);
    // push bars
    cyl(0.04, 0.5, STEEL, [s * 0.9, 0.82, 3.0], [0, 0, 1], 8);
    // tail lights
    neon(0.7, 0.14, 0.04, RED, [s * 0.65, 1.95, -2.83], 1.8);
    neon(0.2, 0.2, 0.04, RED, [s * 1.0, 1.2, -2.83], 1.6);
  }

  // hood: grille, emblem, vents
  plane(1.1, 0.28, GRILLE, [0, 1.08, 2.915], [0, 0, 1]);
  plane(0.5, 0.5, SHIELD, [0, 1.48, 2.15], [0, 0.34, 1].map((v, i) => (i === 1 ? 0.9 * 0.5 : v)));
  for (let i = 0; i < 4; i++) {
    neon(0.7, 0.012, 0.04, MAG, [0, 1.42 - 0.0 + i * 0.0, 2.55 - i * 0.12 + 0.0], 1.4, { dir: [0, 0.25, 1], axis: "z" });
  }
  // ram bumper
  box(2.5, 0.45, 0.4, HAZARD, [0, 0.7, 2.95]);
  box(2.3, 0.1, 0.1, DARK, [0, 0.4, 3.12]);
  neon(2.2, 0.05, 0.03, MAG, [0, 0.82, 3.16], 1.8);
  box(2.4, 0.4, 0.12, "#262b3a", [0, 0.55, -2.92]);
  // rear
  plane(2.0, 0.8, REAR, [0, 1.35, -2.815], [0, 0, -1]);
  neon(2.0, 0.04, 0.04, CYAN, [0, 1.8, -2.83], 1.4);

  // roof strobe bar
  box(2.0, 0.16, 0.3, DARK, [0, 2.42, 0.95]);
  neon(0.62, 0.12, 0.31, CYAN, [-0.7 * -1, 2.43, 0.95], 2.2);
  neon(0.62, 0.12, 0.31, MAG, [-0.7, 2.43, 0.95], 2.2);
  neon(0.24, 0.12, 0.31, WHITE, [0, 2.43, 0.95], 1.8);
  // sensor dome + antennas
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#1d212c", { at: [-0.75, 2.31, 0.3] });
  neon(0.07, 0.07, 0.06, RED, [-0.75, 2.42, 0.4], 2.5);
  for (const x of [0.85, -0.9]) {
    cyl(0.015, 1.1, DARK, [x, 2.85, -2.2], [0, 1, 0.06], 6);
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), x > 0 ? CYAN : MAG, { at: [x, 3.4, -2.13] }), 2.5);
  }

  // ---------- water cannon turret ----------
  b.lathe([[0, 0], [0.6, 0], [0.6, 0.08], [0.45, 0.2], [0.4, 0.3], [0, 0.3]], { at: [0, 2.28, -0.1], color: "#232836", segments: 12 });
  neon(0.62, 0.025, 0.62, CYAN, [0, 2.43, -0.1], 1.4, { rotation: [0, 45, 0] });
  box(0.8, 0.45, 0.8, "#2e3648", [0, 2.75, -0.1]);
  box(0.3, 0.3, 0.6, DARK, [0.55, 2.78, -0.15]);
  box(0.3, 0.3, 0.6, DARK, [-0.55, 2.78, -0.15]);
  neon(0.02, 0.1, 0.3, YEL, [0.71, 2.8, -0.15], 1.4);
  neon(0.02, 0.1, 0.3, YEL, [-0.71, 2.8, -0.15], 1.4);
  const d = new THREE.Vector3(0, 0.14, 1).normalize();
  const base = new THREE.Vector3(0, 2.8, 0.3);
  const along = (t: number) => base.clone().addScaledVector(d, t).toArray();
  cyl(0.14, 1.7, "#4a556d", along(0.85), d.toArray(), 10);
  cyl(0.2, 0.3, "#1c212d", along(1.7), d.toArray(), 10);
  glow(cyl(0.1, 0.12, CYAN, along(1.9), d.toArray(), 10), 2.5);
  for (const t of [0.35, 0.75, 1.15]) glow(cyl(0.16, 0.05, CYAN, along(t), d.toArray(), 10), 1.8);

  // ---------- water tank ----------
  cyl(0.5, 1.7, TANK, [0, 2.75, -1.65], [0, 0, 1], 12);
  for (const z of [-0.8, -2.5]) b.part(new THREE.SphereGeometry(0.5, 12, 6), "#1f4a82", { at: [0, 2.75, z], scale: [1, 1, 0.3] });
  for (const z of [-1.0, -1.65, -2.3]) cyl(0.52, 0.08, DARK, [0, 2.75, z], [0, 0, 1], 12);
  for (const s of [1, -1]) {
    glow(plane(0.9, 0.34, GAUGE, [s * 0.495, 2.78, -1.65], [s, 0, 0]), 1.6);
    box(0.3, 0.24, 0.3, DARK, [s * 0.45, 2.3, -1.65]);
  }
  b.sweep(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 2.55, -0.9), new THREE.Vector3(0.78, 2.4, -0.7),
      new THREE.Vector3(0.72, 2.45, -0.35), new THREE.Vector3(0.42, 2.7, -0.2),
    ]).getPoints(12).map((v) => v.toArray()),
    0.05,
    { color: DARK, sides: 6 },
  );

  // ---------- wheels ----------
  for (const s of [1, -1])
    for (const z of [1.9, 0, -1.9]) {
      const x = s * 1.32;
      cyl(0.55, 0.5, DARK, [x, 0.55, z], [1, 0, 0], 14);
      cyl(0.34, 0.52, STEEL, [x, 0.55, z], [1, 0, 0], 10);
      glow(cyl(0.26, 0.54, s > 0 ? CYAN : MAG, [x, 0.55, z], [1, 0, 0], 10), 1.6);
      cyl(0.15, 0.58, "#1b1f2b", [x, 0.55, z], [1, 0, 0], 8);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        box(0.62, 0.08, 0.08, "#0b0c10", [x, 0.55 + Math.cos(a) * 0.5, z + Math.sin(a) * 0.5], {
          rotation: [(-a * 180) / Math.PI, 0, 0],
        });
      }
    }

  return b.root;
}
