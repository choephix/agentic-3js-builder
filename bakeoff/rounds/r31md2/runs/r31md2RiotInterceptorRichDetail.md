```ts
import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, stripes, catmull } from "agentic-3js-builder";
import { metal, panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot-Control Interceptor RC-07",
  description:
    "Armoured corporate crowd-suppression truck with a roof-mounted water cannon, water tank, strobe bars and neon underglow in a Cyberpunk 2077 look.",
};

// ---------- palette ----------
const GUN = "#222838";
const GUN_D = "#12151e";
const BLACK = "#0b0c11";
const RUBBER = "#15161a";
const YELLOW = "#f2c230";
const CYAN = "#19e6ff";
const MAGENTA = "#ff2fa8";
const RED = "#ff2a3a";
const BLUE = "#2f63ff";
const WHITE = "#e9fbff";
const AMBER = "#ff9a1f";
const TANK = "#2b4a6e";

// ---------- textures ----------
const LOGO = svg(
  `<svg viewBox="0 0 220 66" xmlns="http://www.w3.org/2000/svg">
  <polygon points="33,4 58,18 58,48 33,62 8,48 8,18" fill="#0b0c11" stroke="#19e6ff" stroke-width="3"/>
  <polygon points="33,14 49,23 49,43 33,52 17,43 17,23" fill="none" stroke="#ff2fa8" stroke-width="2.5"/>
  <path d="M24 40 L33 22 L42 40 M27 34 H39" stroke="#f2c230" stroke-width="4" fill="none" stroke-linejoin="round"/>
  <text x="70" y="36" font-family="sans-serif" font-weight="bold" font-size="30" fill="#0b0c11" stroke="#0b0c11" stroke-width="4">ORBITEK</text>
  <text x="70" y="36" font-family="sans-serif" font-weight="bold" font-size="30" fill="#e9fbff">ORBITEK</text>
  <rect x="70" y="42" width="140" height="4" fill="#f2c230"/>
  <text x="70" y="60" font-family="sans-serif" font-weight="bold" font-size="12" fill="#19e6ff" letter-spacing="2">CROWD SUPPRESSION DIV.</text>
  <path d="M212 6 v54" stroke="#ff2fa8" stroke-width="3"/>
</svg>`,
  { size: 512 },
);
const DOORNUM = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="32" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="34" fill="#0b0c11" stroke="#0b0c11" stroke-width="5">RC-07</text>
  <text x="40" y="32" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="34" fill="#f2c230">RC-07</text>
</svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="156" height="66" rx="5" fill="#0b0c11" stroke="#f2c230" stroke-width="3"/>
  <path d="M6 6 L26 6 L6 26Z M34 6 L54 6 L6 54 L6 34Z" fill="#f2c230" opacity="0.8"/>
  <text x="84" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#f2c230">STAND CLEAR</text>
  <text x="84" y="50" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#19e6ff">HYDRANT SYSTEM ARMED</text>
  <text x="84" y="63" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#ff2fa8">COMPLIANCE IS MANDATORY</text>
</svg>`,
  { size: 512 },
);
const VISOR = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06101c"/><stop offset="0.6" stop-color="#0b2a3c"/><stop offset="1" stop-color="#2a0e3a"/></linearGradient></defs>
  <rect width="120" height="40" fill="url(#g)"/>
  <path d="M0 30 L120 6" stroke="#19e6ff" stroke-width="1" opacity="0.35"/>
  <path d="M0 38 L120 14" stroke="#ff2fa8" stroke-width="1" opacity="0.35"/>
  <path d="M8 6 h18 M8 6 v8 M112 6 h-18 M112 6 v8" stroke="#19e6ff" stroke-width="1.5" fill="none"/>
  <text x="60" y="9" text-anchor="middle" font-family="monospace" font-size="5" fill="#19e6ff">TGT LOCK  //  3 HOSTILE  //  PRESSURE 92</text>
</svg>`,
  { size: 512 },
);
const GAUGE = gaugeTexture({ needle: 70, label: "BAR" });

// ---------- paints ----------
const BODY = panelled(
  paint((p, n) => {
    if (p.y > 1.08 && p.y < 1.16 && Math.abs(n.x) > 0.6) return YELLOW;
    let c = mix("#1c2232", "#2c3752", noise(p, 0.6, 3));
    c = mix(c, "#0a0c12", 0.5 * smoothstep(0.9, 0.5, p.y) * noise(p, 0.15, 8));
    if (p.y < 0.8) c = mix(c, "#5a1f5a", 0.22);
    return mix(c, "#34405e", 0.25 * smoothstep(0.3, 1, n.y));
  }),
  { size: 0.6, aspect: 0.8, rivets: 0.12 },
);
const HAZARD = stripes(YELLOW, GUN_D, { size: 0.16, axis: "x", width: 0.5, wobble: 0.02 });
const STEEL = metal("steel", { tarnish: 0.3 });
const IRON = metal("iron");

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const chassis = b.joint("chassis", { at: [0, 1, 0], role: "spine" });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      at: [x, y, z],
      bone: o.bone ?? chassis,
      ...(o.rot ? { rotation: o.rot } : {}),
    });
  const neon = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, k = 1.5, o: any = {}) =>
    glow(box(w, h, d, color, x, y, z, o), k);
  const cyl = (r0: number, r1: number, len: number, color: any, at: number[], dir: number[], seg = 10, bone: any = chassis) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), color, { at, dir, bone });
  const plane = (w: number, h: number, color: string, at: number[], dir: number[], tex: any, bone: any = chassis) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", up: [0, 1, 0], texture: tex, bone });

  // ----- main body -----
  box(2.3, 0.7, 5.6, BODY, 0, 0.85, 0.1); // lower hull
  box(2.2, 0.35, 1.4, BODY, 0, 1.375, 2.2); // hood
  b.extrude(
    [
      [-2.7, 1.2],
      [1.5, 1.2],
      [1.5, 1.55],
      [0.95, 2.15],
      [0.7, 2.2],
      [-2.7, 2.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: BODY, bone: chassis },
  );
  // skirt plating + vents
  for (const s of [1, -1]) {
    box(0.06, 0.28, 4.4, GUN_D, s * 1.15, 0.66, -0.2);
    for (let i = 0; i < 7; i++) box(0.02, 0.05, 0.3, BLACK, s * 1.185, 0.66, -2.0 + i * 0.5);
    // cyan side neon + magenta accent
    neon(0.03, 0.04, 4.6, CYAN, s * 1.16, 0.84, 0.0, 1.8);
    neon(0.03, 0.03, 3.4, MAGENTA, s * 1.16, 0.77, -0.5, 1.6);
    // door seams, handle, window
    box(0.02, 0.8, 0.03, BLACK, s * 1.105, 1.55, 1.25);
    box(0.02, 0.8, 0.03, BLACK, s * 1.105, 1.65, -0.12);
    box(0.02, 0.03, 1.4, BLACK, s * 1.105, 1.27, 0.55);
    box(0.05, 0.05, 0.22, YELLOW, s * 1.12, 1.5, 0.05);
    plane(0.95, 0.42, "#ffffff", [s * 1.112, 1.86, 0.62], [s, 0, 0], VISOR);
    box(0.02, 0.5, 0.03, GUN_D, s * 1.113, 1.86, 0.62);
    // door number (cab) and big logo (rear box)
    plane(0.5, 0.25, "#ffffff", [s * 1.114, 1.46, 0.62], [s, 0, 0], DOORNUM);
    plane(2.3, 0.69, "#ffffff", [s * 1.112, 1.68, -1.45], [s, 0, 0], LOGO);
    // gun-port slits + armour ribs on rear box
    for (let i = 0; i < 3; i++) box(0.03, 0.05, 0.32, BLACK, s * 1.108, 2.07, -0.5 - i * 0.8);
    for (let i = 0; i < 4; i++) box(0.05, 0.9, 0.06, GUN, s * 1.12, 1.68, -2.55 + i * 0.75);
    // mirrors
    box(0.3, 0.04, 0.04, GUN_D, s * 1.25, 1.9, 1.2);
    box(0.08, 0.3, 0.2, GUN, s * 1.4, 1.9, 1.2);
    neon(0.02, 0.05, 0.14, AMBER, s * 1.4, 1.78, 1.28, 1.6);
    // fenders
    box(0.62, 0.09, 1.25, GUN, s * 1.2, 1.04, 1.9);
    box(0.62, 0.09, 1.25, GUN, s * 1.2, 1.04, -0.2);
    box(0.62, 0.09, 1.25, GUN, s * 1.2, 1.04, -1.9);
  }

  // ----- windshield -----
  const wn = [0, 0.55, 0.6];
  const wlen = Math.hypot(0.55, 0.6);
  const wm = [0, 1.85, 1.225];
  b.part(new THREE.PlaneGeometry(1.9, wlen), "#ffffff", {
    at: [wm[0], wm[1] + 0.012, wm[2] + 0.012],
    dir: wn,
    axis: "z",
    up: [0, 1, 0],
    texture: VISOR,
    bone: chassis,
  });
  glow(
    b.part(new THREE.PlaneGeometry(1.9, wlen), "#ffffff", {
      at: [wm[0], wm[1] + 0.02, wm[2] + 0.02],
      dir: wn,
      axis: "z",
      up: [0, 1, 0],
      texture: VISOR,
      bone: chassis,
    }),
    0.5,
  );
  box(2.0, 0.07, 0.07, GUN_D, 0, 2.17, 0.93, { rot: [48, 0, 0] });
  for (let i = -3; i <= 3; i++) box(0.03, 0.04, 0.9, BLACK, i * 0.26, 1.88, 1.25, { rot: [-48, 0, 0] }); // grille wire

  // ----- front end -----
  box(2.0, 0.34, 0.1, BLACK, 0, 1.3, 2.92); // grille
  for (let i = 0; i < 5; i++) neon(1.6, 0.015, 0.03, MAGENTA, 0, 1.18 + i * 0.07, 2.97, 1.4);
  for (const s of [1, -1]) {
    box(0.55, 0.22, 0.06, BLACK, s * 0.85, 1.38, 2.93);
    neon(0.45, 0.13, 0.04, WHITE, s * 0.85, 1.38, 2.97, 2.2);
    neon(0.06, 0.2, 0.04, AMBER, s * 1.12, 1.38, 2.95, 1.5);
  }
  box(2.5, 0.42, 0.3, HAZARD, 0, 0.78, 3.0); // ram bumper
  box(2.55, 0.06, 0.34, GUN_D, 0, 1.0, 3.0);
  neon(2.2, 0.035, 0.03, CYAN, 0, 1.06, 3.0, 1.8);
  for (const x of [-0.85, 0, 0.85]) cyl(0.05, 0.05, 0.85, STEEL, [x, 1.2, 3.05], [0, 1, 0], 8); // bull bars
  box(1.8, 0.06, 0.06, STEEL, 0, 1.62, 3.05);
  for (const s of [1, -1]) {
    box(0.1, 0.35, 0.4, GUN_D, s * 1.2, 0.8, 2.95);
    cyl(0.07, 0.07, 0.1, STEEL, [s * 0.5, 0.55, 3.18], [0, 0, 1], 8); // tow hooks
    neon(0.08, 0.08, 0.04, RED, s * 1.0, 0.55, 3.17, 1.5);
  }
  // front plate
  box(0.6, 0.12, 0.03, "#ffffff", 0, 0.72, 3.16);
  neon(0.5, 0.05, 0.02, CYAN, 0, 0.72, 3.18, 1.4);

  // ----- roof: strobes, domes, antennas -----
  box(2.0, 0.08, 0.3, GUN_D, 0, 2.24, 0.78);
  for (let i = 0; i < 8; i++) neon(0.22, 0.13, 0.26, i % 2 ? BLUE : RED, -0.87 + i * 0.249, 2.34, 0.78, 2.0);
  box(2.05, 0.04, 0.34, STEEL, 0, 2.42, 0.78);
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 0.16, GUN_D, [s * 0.95, 2.3, 0.35], [0, 1, 0], 8);
    neon(0.14, 0.1, 0.05, WHITE, s * 0.95, 2.34, 0.45, 2.0);
    cyl(0.012, 0.012, 1.0, STEEL, [s * 1.0, 2.7, -2.5], [s * 0.1, 1, 0], 6);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 1.05, 3.2, -2.5], bone: chassis }), 2);
  }
  b.part(new THREE.SphereGeometry(0.13, 8, 6), GUN, { at: [0, 2.24, 0.3], bone: chassis, scale: [1, 0.6, 1] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { at: [0, 2.3, 0.4], bone: chassis }), 2);
  // roof rails
  for (const s of [1, -1]) box(0.05, 0.05, 2.6, STEEL, s * 1.05, 2.24, -1.4);

  // ----- water tank -----
  const tankAt = [0, 2.7, -1.75];
  cyl(0.5, 0.5, 1.9, TANK, tankAt, [0, 0, 1], 14);
  for (const z of [-0.75, 0.75])
    for (const s of [1, -1]) cyl(0.53, 0.53, 0.08, STEEL, [0, 2.7, -1.75 + z * 1.0], [0, 0, 1], 14);
  for (const z of [-2.7, -0.8]) b.part(new THREE.SphereGeometry(0.5, 10, 6), TANK, { at: [0, 2.7, z], bone: chassis, scale: [1, 1, 0.25] });
  for (const s of [1, -1]) {
    neon(0.03, 0.7, 0.1, CYAN, s * 0.5, 2.7, -1.75, 1.8); // level windows
    box(0.04, 0.72, 0.16, GUN_D, s * 0.49, 2.7, -1.75);
  }
  box(0.12, 0.05, 0.12, STEEL, 0, 3.22, -1.75); // fill cap
  cyl(0.08, 0.08, 0.06, STEEL, [0, 3.2, -1.75], [0, 1, 0], 8);
  plane(0.9, 0.4, "#ffffff", [0, 2.7, -2.745], [0, 0, -1], WARN);
  box(1.0, 0.5, 0.04, GUN_D, 0, 2.7, -2.74);
  b.sweep(catmull([[0.3, 2.35, -0.8], [0.35, 2.5, -0.6], [0.15, 2.75, -0.3], [0.05, 2.85, -0.25]]), 0.05, { color: GUN_D, bone: chassis });

  // ----- turret & cannon -----
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.24, -0.15], dir: [0, 1, 0], role: "hinge" });
  const cannon = b.joint("cannon", { parent: turret, at: [0, 2.85, -0.15], dir: [0, 0, 1], role: "hinge" });
  cyl(0.5, 0.5, 0.1, STEEL, [0, 2.3, -0.15], [0, 1, 0], 12, turret);
  neon(0.01, 0.01, 0.01, CYAN, 0, 0, 0, 0.1, { bone: turret });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    cyl(0.025, 0.025, 0.05, IRON, [Math.cos(a) * 0.43, 2.36, -0.15 + Math.sin(a) * 0.43], [0, 1, 0], 6, turret);
  }
  cyl(0.38, 0.42, 0.42, GUN, [0, 2.55, -0.15], [0, 1, 0], 10, turret);
  neon(0.78, 0.03, 0.78, MAGENTA, 0, 2.45, -0.15, 1.5, { bone: turret });
  for (const s of [1, -1]) {
    box(0.1, 0.5, 0.7, GUN, s * 0.3, 2.9, -0.15, { bone: turret });
    cyl(0.1, 0.1, 0.12, STEEL, [s * 0.38, 2.85, -0.15], [s, 0, 0], 10, turret);
    b.part(new THREE.CircleGeometry(0.085, 20), "#ffffff", {
      at: [s * 0.447, 2.85, -0.15],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: GAUGE,
      bone: turret,
    });
    box(0.06, 0.12, 0.2, YELLOW, s * 0.36, 2.58, 0.15, { bone: turret });
  }
  box(0.4, 0.34, 0.6, GUN_D, 0, 2.85, -0.4, { bone: cannon }); // breech
  neon(0.42, 0.04, 0.5, CYAN, 0, 2.89, -0.4, 1.4, { bone: cannon });
  cyl(0.14, 0.14, 1.6, STEEL, [0, 2.85, 0.7], [0, 0, 1], 10, cannon);
  cyl(0.115, 0.115, 1.7, GUN, [0, 2.85, 0.75], [0, 0, 1], 8, cannon);
  for (const z of [0.2, 0.7, 1.15]) {
    cyl(0.19, 0.19, 0.09, GUN_D, [0, 2.85, z], [0, 0, 1], 10, cannon);
    neon(0.01, 0.01, 0.01, CYAN, 0, 0, 0, 0.1, { bone: cannon });
  }
  neon(0.2, 0.025, 0.09, CYAN, 0, 3.045, 0.7, 1.8, { bone: cannon });
  cyl(0.2, 0.15, 0.4, STEEL, [0, 2.85, 1.7], [0, 0, 1], 10, cannon); // nozzle flare
  cyl(0.23, 0.23, 0.07, HAZARD, [0, 2.85, 1.93], [0, 0, 1], 10, cannon);
  glow(b.part(new THREE.CircleGeometry(0.17, 12), CYAN, { at: [0, 2.85, 1.97], dir: [0, 0, 1], axis: "z", bone: cannon }), 2.2);
  // target camera
  box(0.12, 0.1, 0.2, GUN_D, 0, 3.12, 0.2, { bone: cannon });
  neon(0.07, 0.07, 0.03, RED, 0, 3.12, 0.32, 2.2, { bone: cannon });
  b.pose(cannon, { axis: [1, 0, 0], deg: -7 });

  // ----- rear -----
  box(2.3, 0.3, 0.3, HAZARD, 0, 0.7, -2.85);
  box(2.0, 0.9, 0.04, GUN, 0, 1.65, -2.72);
  box(0.03, 0.9, 0.05, BLACK, 0, 1.65, -2.74);
  for (const s of [1, -1]) {
    neon(0.1, 0.8, 0.05, RED, s * 1.0, 1.65, -2.74, 1.8);
    box(0.12, 0.5, 0.06, YELLOW, s * 0.4, 1.45, -2.75);
    cyl(0.06, 0.06, 0.35, IRON, [s * 0.7, 1.0, -2.65], [0, 0, -1], 8);
  }
  neon(1.6, 0.04, 0.04, MAGENTA, 0, 2.12, -2.74, 1.6);

  // underglow
  neon(1.9, 0.04, 4.8, MAGENTA, 0, 0.46, 0, 1.2);

  // ----- wheels -----
  const wheelPos: number[][] = [[1.9, 0], [-0.2, 0], [-1.9, 0]].map((v) => [v[0], 0]);
  for (const s of [1, -1]) {
    wheelPos.forEach((wp, wi) => {
      const wz = wp[0];
      const wx = s * 1.2;
      const nm = `wheel${wi}${s > 0 ? "L" : "R"}`;
      const wj = b.joint(nm, { parent: chassis, at: [wx, 0.5, wz], dir: [s, 0, 0], role: "hinge" });
      cyl(0.48, 0.48, 0.45, RUBBER, [wx, 0.5, wz], [s, 0, 0], 16, wj);
      for (let i = 0; i < 14; i++) {
        const a = (i * 360) / 14;
        const r = (a * Math.PI) / 180;
        b.part(new THREE.BoxGeometry(0.44, 0.07, 0.12), RUBBER, {
          at: [wx, 0.5 + 0.49 * Math.cos(r), wz + 0.49 * Math.sin(r)],
          rotation: [a, 0, 0],
          bone: wj,
        });
      }
      cyl(0.31, 0.31, 0.47, STEEL, [wx, 0.5, wz], [s, 0, 0], 12, wj);
      cyl(0.2, 0.2, 0.05, GUN_D, [wx + s * 0.235, 0.5, wz], [s, 0, 0], 10, wj);
      cyl(0.07, 0.07, 0.08, IRON, [wx + s * 0.25, 0.5, wz], [s, 0, 0], 8, wj);
      for (let i = 0; i < 6; i++) {
        const r = (i * Math.PI) / 3;
        cyl(0.018, 0.018, 0.05, STEEL, [wx + s * 0.255, 0.5 + 0.14 * Math.cos(r), wz + 0.14 * Math.sin(r)], [s, 0, 0], 6, wj);
      }
      glow(
        b.part(new THREE.TorusGeometry(0.33, 0.018, 4, 18), wi === 1 ? CYAN : MAGENTA, {
          at: [wx + s * 0.236, 0.5, wz],
          dir: [s, 0, 0],
          axis: "z",
          bone: wj,
        }),
        1.8,
      );
      cyl(0.015, 0.015, 0.06, YELLOW, [wx + s * 0.24, 0.5 + 0.27, wz + 0.05], [s, 0, 0], 5, wj); // valve stem
    });
  }

  return b.root;
}
```