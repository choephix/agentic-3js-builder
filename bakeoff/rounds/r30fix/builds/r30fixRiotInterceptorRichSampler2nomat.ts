import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, mottle, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  name: "TRIGEN Public Order Interceptor",
  description:
    "Corporate six-wheel riot-control interceptor: armoured cab, roof-mounted water cannon on a yaw/pitch turret, saddle water tank, sonic horns, neon light bars and hazard-striped pusher bumper in a Cyberpunk 2077 style.",
};

// ------------------------------------------------------------------ palette
const WHITE = "#e8ecf1";
const GRAPH = "#2a2d36";
const NAVY = "#171a26";
const YEL = "#fcee0a";
const CYAN = "#19f3ff";
const MAG = "#ff2e97";
const RED = "#ff2a3a";
const AMBER = "#ff9a1f";
const RUBBER = "#17181c";
const BLACK = "#0b0c10";
const BOLT = "#aeb5c2";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
const torus = (r: number, t: number, rs = 6, ts = 14) => new THREE.TorusGeometry(r, t, rs, ts);
const halfSphere = (r: number, w = 10, h = 5) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2);

// ------------------------------------------------------------------ paints
const LIVERY = paint((p, n) => {
  const grime = noise(p, 0.4, 3);
  const low = smoothstep(1.4, 0.55, p.y);
  if (n.y < -0.3) return mix(GRAPH, BLACK, 0.4);
  if (Math.abs(n.x) < 0.3 && p.y < 1.25 && p.y > 0.5 && p.z > -3.0 && p.z < 2.85) return mix(GRAPH, BLACK, 0.5); // arch walls
  if (n.z > 0.7) return mix(GRAPH, NAVY, grime);
  if (p.y < 0.98) return mix(GRAPH, "#14151b", grime * 0.6 + low * 0.3);
  if (p.y < 1.07 && Math.abs(n.x) > 0.5) return YEL;
  if (n.y > 0.6 && p.z > 2.7) return mix(GRAPH, NAVY, 0.5);
  if (n.y > 0.6) return mix("#d3d9e0", "#9aa3b0", grime * 0.7);
  if (Math.abs(n.x) > 0.5 && Math.abs(p.y - 1.14) < 0.012) return CYAN;
  return mix(WHITE, "#aeb9c8", grime * 0.35 + low * 0.45);
});
const BODYP = panelled(LIVERY, { size: 0.62, aspect: 0.68, rivets: 0.12 });
const STEELP = mottle("#59606e", "#7b8493", { size: 0.16, seed: 2 });
const DARKP = mottle("#23252d", "#353842", { size: 0.2, seed: 5 });
const TYREP = mottle(RUBBER, "#272930", { size: 0.08, seed: 7 });
const PLATEP = mottle("#e4e8ee", "#c2cad5", { size: 0.3, seed: 9 });
const TANKP = paint((p, n) => {
  const g = noise(p, 0.25, 11);
  if (p.z < -3.08 || p.z > -0.92) return mix(GRAPH, NAVY, g);
  if (Math.abs(p.z + 1.98) < 0.04) return YEL;
  return mix("#d6e6f2", "#8fb2cb", g * 0.8 + (n.y < -0.2 ? 0.25 : 0));
});

export default function build() {
  const b = createBuilder({ name: "trigen_interceptor" });

  // ================================================================== textures
  const chev = (c1: string, c2: string) => {
    let s = `<rect width="120" height="30" fill="${c1}"/>`;
    for (let x = -10; x < 130; x += 24)
      s += `<polyline points="${x},32 ${x + 12},4 ${x + 24},32" fill="none" stroke="${c2}" stroke-width="9"/>`;
    s += `<rect width="120" height="30" fill="none" stroke="${c2}" stroke-width="3"/>`;
    return svg(`<svg viewBox="0 0 120 30">${s}</svg>`, { size: 512 });
  };
  const CHEVRON = chev(YEL, "#111216");

  const LOGO = svg(
    `<svg viewBox="0 0 100 100">
      <polygon points="50,3 92,27 92,73 50,97 8,73 8,27" fill="#14151b" stroke="#fcee0a" stroke-width="5"/>
      <polygon points="50,17 80,34 80,66 50,83 20,66 20,34" fill="none" stroke="#19f3ff" stroke-width="2.5"/>
      <path d="M29 35 H71 V45 H55 V71 H45 V45 H29 Z" fill="#fcee0a"/>
      <path d="M35 77 L50 67 L65 77" fill="none" stroke="#ff2e97" stroke-width="3.5"/>
    </svg>`,
    { size: 256 },
  );

  const GLASS = svg(
    `<svg viewBox="0 0 200 80">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="0.6" stop-color="#10283a"/><stop offset="1" stop-color="#0a1218"/></linearGradient></defs>
      <rect width="200" height="80" fill="url(#g)"/>
      <polygon points="20,80 60,0 80,0 40,80" fill="#19f3ff" fill-opacity="0.13"/>
      <polygon points="100,80 140,0 150,0 110,80" fill="#ff2e97" fill-opacity="0.12"/>
      <rect width="200" height="9" fill="#05070c"/>
      <rect x="98" y="0" width="4" height="80" fill="#0a0b10"/>
      <rect width="200" height="80" fill="none" stroke="#14151b" stroke-width="4"/>
      <text x="50" y="72" fill="#19f3ff" fill-opacity="0.6" font-size="6" text-anchor="middle" font-family="monospace">UNIT 0451 - THREAT: LOW</text>
      <text x="150" y="72" fill="#ff2e97" fill-opacity="0.6" font-size="6" text-anchor="middle" font-family="monospace">COMPLY - STAY CALM</text>
    </svg>`,
    { size: 512 },
  );

  const WINDOW = svg(
    `<svg viewBox="0 0 100 54">
      <defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1c2a"/><stop offset="1" stop-color="#070a10"/></linearGradient></defs>
      <rect width="100" height="54" rx="4" fill="url(#w)"/>
      <polygon points="12,54 38,0 50,0 24,54" fill="#19f3ff" fill-opacity="0.15"/>
      <rect x="33" y="0" width="2.5" height="54" fill="#3a3f4b"/><rect x="66" y="0" width="2.5" height="54" fill="#3a3f4b"/>
      <rect width="100" height="54" rx="4" fill="none" stroke="#fcee0a" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const LED = svg(
    `<svg viewBox="0 0 300 70">
      <defs><pattern id="d" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0H3M0 0V3" stroke="#000" stroke-opacity="0.4" stroke-width="0.8"/></pattern></defs>
      <rect width="300" height="70" rx="6" fill="#06040c"/>
      <rect x="2" y="2" width="296" height="66" rx="5" fill="none" stroke="#ff2e97" stroke-width="2"/>
      <text x="150" y="36" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="32" fill="#ff2e97" letter-spacing="4">STAND BACK</text>
      <text x="150" y="59" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="17" fill="#19f3ff" letter-spacing="1.5">DISPERSE - 30 SEC TO COMPLY</text>
      <rect width="300" height="70" fill="url(#d)"/>
    </svg>`,
    { size: 512 },
  );

  const FLANK = svg(
    `<svg viewBox="0 0 400 100">
      <rect x="0" y="6" width="14" height="88" fill="#fcee0a"/>
      <text x="26" y="58" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="54" fill="#15171e" letter-spacing="3">TRIGEN</text>
      <text x="28" y="88" font-family="Arial, sans-serif" font-weight="700" font-size="21" fill="#2a2d36" letter-spacing="2.2">PUBLIC ORDER DIVISION</text>
      <polygon points="300,8 328,8 306,44 278,44" fill="#ff2e97"/>
      <polygon points="336,8 364,8 342,44 314,44" fill="#19f3ff"/>
      <text x="394" y="88" text-anchor="end" font-family="monospace" font-weight="700" font-size="22" fill="#2a2d36">RCU-0451</text>
    </svg>`,
    { size: 1024 },
  );

  let gl = `<rect width="140" height="40" fill="#0d0e13"/>`;
  for (let i = 0; i < 6; i++)
    gl += `<rect x="4" y="${3 + i * 6}" width="132" height="3.4" fill="#2c303a"/><rect x="4" y="${3 + i * 6}" width="132" height="0.8" fill="#6f7788"/>`;
  gl += `<rect x="0" y="0" width="140" height="40" fill="none" stroke="#19f3ff" stroke-width="2"/><rect x="0" y="37" width="140" height="3" fill="#ff2e97"/>`;
  const GRILLE = svg(`<svg viewBox="0 0 140 40">${gl}</svg>`, { size: 512 });

  const PLATE = svg(
    `<svg viewBox="0 0 120 60">
      <rect x="1" y="1" width="118" height="58" rx="7" fill="#f3f1e0" stroke="#15171e" stroke-width="3"/>
      <rect x="6" y="6" width="108" height="11" fill="#19f3ff"/>
      <text x="60" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#06080c">NIGHT CITY - NCPD CONTRACT</text>
      <text x="60" y="48" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="26" fill="#15171e" letter-spacing="2">RCU 0451</text>
    </svg>`,
    { size: 256 },
  );

  const TANKLABEL = svg(
    `<svg viewBox="0 0 300 90">
      <rect x="2" y="2" width="296" height="86" rx="10" fill="#101322" stroke="#19f3ff" stroke-width="3"/>
      <polygon points="40,14 72,70 8,70" fill="#fcee0a" stroke="#15171e" stroke-width="3"/>
      <rect x="37.5" y="30" width="5" height="22" fill="#15171e"/><rect x="37.5" y="56" width="5" height="5" fill="#15171e"/>
      <text x="92" y="42" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="34" fill="#19f3ff" letter-spacing="3">H2O</text>
      <text x="92" y="62" font-family="Arial, sans-serif" font-weight="700" font-size="16" fill="#ffffff" letter-spacing="1.5">CROWD DISPERSAL</text>
      <text x="92" y="80" font-family="monospace" font-weight="700" font-size="14" fill="#ff2e97">MAX 40 BAR / NON-LETHAL</text>
    </svg>`,
    { size: 512 },
  );

  let rim = `<circle cx="50" cy="50" r="50" fill="#1b1d24"/><circle cx="50" cy="50" r="45" fill="#8b93a3"/>`;
  for (let i = 0; i < 8; i++)
    rim += `<rect x="44" y="12" width="12" height="22" rx="5" fill="#14151b" transform="rotate(${i * 45} 50 50)"/>`;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    rim += `<circle cx="${(50 + 24 * Math.cos(a)).toFixed(1)}" cy="${(50 + 24 * Math.sin(a)).toFixed(1)}" r="3.2" fill="#d6dbe4" stroke="#14151b" stroke-width="1.2"/>`;
  }
  rim += `<circle cx="50" cy="50" r="13" fill="#fcee0a" stroke="#14151b" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="#14151b"/><circle cx="50" cy="50" r="47" fill="none" stroke="#19f3ff" stroke-width="3"/>`;
  const RIM = svg(`<svg viewBox="0 0 100 100">${rim}</svg>`, { size: 256 });

  const GAUGE = gaugeTexture({ label: "BAR", needle: 55 });

  // ================================================================== skeleton
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const put = (geo: THREE.BufferGeometry, color: any, at: number[], bone: any, o: Record<string, any> = {}) =>
    b.part(geo, color, { bone, at, ...o } as any);
  const rod = (a: number[], c: number[], r: any, color: any, bone: any, o: Record<string, any> = {}) =>
    b.rod(a, c, r, color, { bone, sides: 6, ...o } as any);
  const lit = <T,>(p: T, k = 1.5): T => glow(p as any, k) as T;
  const neon = (a: number[], c: number[], color: string, bone: any, r = 0.018, k = 1.6) =>
    lit(b.rod(a, c, r, color, { bone, sides: 5 } as any), k);
  const cylD = (r: number, h: number, s: number, color: any, at: number[], bone: any, dir: number[], o: Record<string, any> = {}) =>
    put(cyl(r, h, s), color, at, bone, { dir, flat: true, ...o });
  const face = (t: any, w: number, h: number, at: number[], dir: number[], bone: any, o: Record<string, any> = {}) =>
    b.part(plane(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: t, ...o } as any);

  // ================================================================== main body (side profile extruded across the width)
  const OUTLINE: [number, number][] = [
    [-3.45, 0.55], [-2.98, 0.55], [-2.9, 1.0], [-2.7, 1.22], [-0.5, 1.22], [-0.3, 1.0], [-0.22, 0.55],
    [1.4, 0.55], [1.45, 1.0], [1.65, 1.22], [2.55, 1.22], [2.75, 1.0], [2.8, 0.55],
    [3.5, 0.55], [3.5, 1.75], [2.75, 1.95], [2.05, 2.55],
    [-0.1, 2.55], [-0.1, 2.2], [-3.35, 2.2], [-3.45, 2.1],
  ];
  const body = b.extrude(OUTLINE, {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.05, bone: chassis, color: BODYP,
  } as any);

  // wheel-well liners hide the see-through slots
  put(box(1.5, 0.67, 1.3), DARKP, [0, 0.885, 2.1], chassis);
  put(box(1.5, 0.67, 2.65), DARKP, [0, 0.885, -1.6], chassis);
  put(box(1.6, 0.06, 5.2), DARKP, [0, 0.5, 0.2], chassis); // skid plate
  rod([0, 0.62, -2.3], [0, 0.62, 2.1], 0.06, STEELP, chassis, { sides: 8 }); // drive shaft

  // ================================================================== wheels
  const R = 0.555;
  const axles = [
    { k: "F", z: 2.1, steer: true },
    { k: "M", z: -0.9, steer: false },
    { k: "R", z: -2.3, steer: false },
  ];
  for (const ax of axles) {
    rod([-1.03, R, ax.z], [1.03, R, ax.z], 0.08, STEELP, chassis, { sides: 8 });
    put(new THREE.SphereGeometry(0.2, 8, 6), DARKP, [0, R, ax.z], chassis, { scale: [1, 0.9, 1.1], flat: true });
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub = [s * 1.03, R, ax.z];
      const steer = ax.steer
        ? b.joint(`steer${ax.k}${side}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" } as any)
        : chassis;
      const spin = b.joint(`wheel${ax.k}${side}`, { parent: steer, at: hub, dir: [s, 0, 0], role: "hinge" } as any);
      put(cyl(R, 0.44, 16), TYREP, hub, spin, { dir: [1, 0, 0], flat: true });
      for (const dx of [-0.13, 0.13])
        put(torus(R - 0.01, 0.028, 4, 20), TYREP, [hub[0] + dx, R, ax.z], spin, { dir: [1, 0, 0], axis: "z", flat: true });
      put(cyl(0.34, 0.46, 12), STEELP, hub, spin, { dir: [1, 0, 0], flat: true });
      face(RIM, 0.68, 0.68, [hub[0] + s * 0.232, R, ax.z], [s, 0, 0], spin);
      put(torus(0.345, 0.03, 4, 16), BOLT, [hub[0] + s * 0.228, R, ax.z], spin, { dir: [s, 0, 0], axis: "z", flat: true });
      lit(put(torus(0.37, 0.016, 4, 20), CYAN, [hub[0] + s * 0.225, R, ax.z], spin, { dir: [s, 0, 0], axis: "z" }), 1.5);
      cylD(0.09, 0.07, 8, YEL, [hub[0] + s * 0.255, R, ax.z], spin, [s, 0, 0]);
    }
  }
  // fender lips and mud flaps
  for (const s of [1, -1]) {
    put(box(0.08, 0.07, 1.4), PLATEP, [s * 1.235, 1.25, 2.1], chassis);
    put(box(0.08, 0.07, 2.3), PLATEP, [s * 1.235, 1.25, -1.6], chassis);
    put(box(0.05, 0.42, 0.5), RUBBER, [s * 1.03, 0.4, -2.98], chassis);
    put(box(0.05, 0.36, 0.45), RUBBER, [s * 1.03, 0.42, 2.82], chassis);
    face(LOGO, 0.2, 0.2, [s * 1.03 + s * 0.03, 0.42, -2.98], [s, 0, 0], chassis);
  }

  // ================================================================== cab
  const slope = (u: number, off = 0.03): [number, number] => [2.75 - 0.7 * u + 0.65 * off, 1.95 + 0.6 * u + 0.76 * off]; // [z, y]
  const NRM = [0, 0.76, 0.65];
  face(GLASS, 2.0, 0.78, [0, 2.265, 2.413], NRM, chassis);
  for (const s of [1, -1]) {
    const [zm, ym] = slope(0.5, 0.025);
    put(box(0.12, 0.06, 0.95), PLATEP, [s * 1.06, ym, zm], chassis, { rotation: [40.6, 0, 0] }); // A pillar
    const [z0, y0] = slope(0.04, 0.05);
    const [z1, y1] = slope(0.5, 0.05);
    rod([s * 0.15, y0, z0], [s * 0.85, y1, z1], 0.012, BLACK, chassis, { sides: 4 }); // wiper
  }
  put(box(2.2, 0.06, 0.1), GRAPH, [0, ...slope(0.0, 0.02).reverse()].slice(0, 3) as number[], chassis, { rotation: [40.6, 0, 0] });
  put(box(2.2, 0.06, 0.1), GRAPH, [0, slope(1.0, 0.02)[1], slope(1.0, 0.02)[0]], chassis, { rotation: [40.6, 0, 0] });
  // armoured sun shutter
  put(box(2.3, 0.06, 0.36), GRAPH, [0, 2.63, 2.12], chassis, { rotation: [-10, 0, 0] });
  for (const dx of [-0.9, 0, 0.9]) put(box(0.05, 0.1, 0.05), STEELP, [dx, 2.57, 2.0], chassis);
  neon([-1.05, 2.66, 2.3], [1.05, 2.66, 2.3], CYAN, chassis, 0.012, 1.3);

  // hood details
  face(LOGO, 0.5, 0.5, [0, 1.855, 3.12], [0, 0.966, 0.258], chassis, { up: [0, 0, -1] });
  for (const s of [1, -1]) {
    put(box(0.36, 0.05, 0.3), BLACK, [s * 0.7, 1.82, 3.15], chassis, { rotation: [-15, 0, 0] });
    for (let i = 0; i < 3; i++) neon([s * 0.55, 1.86, 3.04 + i * 0.09], [s * 0.85, 1.86, 3.04 + i * 0.09], MAG, chassis, 0.006, 1.2);
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const door = b.joint(`door${side}`, { parent: chassis, at: [s * 1.2, 1.7, 1.3], dir: [0, 1, 0], role: "hinge" } as any);
    put(box(0.07, 1.5, 1.35), LIVERY, [s * 1.215, 1.7, 0.62], door);
    put(box(0.04, 0.63, 1.1), BLACK, [s * 1.248, 2.02, 0.6], door);
    face(WINDOW, 1.02, 0.55, [s * 1.272, 2.02, 0.6], [s, 0, 0], door);
    put(box(0.04, 0.07, 0.22), STEELP, [s * 1.26, 1.5, 0.05], door);
    put(box(0.025, 0.1, 1.3), YEL, [s * 1.255, 1.12, 0.62], door);
    for (const y of [1.15, 2.2]) cylD(0.03, 0.2, 6, STEELP, [s * 1.22, y, 1.3], door, [0, 1, 0]);
    neon([s * 1.255, 1.36, -0.03], [s * 1.255, 1.36, 1.28], CYAN, door, 0.011, 1.3);
    face(LOGO, 0.2, 0.2, [s * 1.255, 1.62, 0.6], [s, 0, 0], door);

    // front quarter window above the front arch
    put(box(0.04, 0.45, 0.78), BLACK, [s * 1.205, 2.0, 1.72], chassis);
    face(WINDOW, 0.72, 0.4, [s * 1.228, 2.0, 1.72], [s, 0, 0], chassis);

    // mirror
    rod([s * 1.18, 2.2, 2.05], [s * 1.52, 2.28, 2.1], 0.02, STEELP, chassis, { sides: 5 });
    put(box(0.12, 0.38, 0.2), GRAPH, [s * 1.6, 2.28, 2.12], chassis);
    put(box(0.02, 0.32, 0.15), "#9cc4d8", [s * 1.6, 2.28, 2.0], chassis, { rotation: [0, 0, 0] });
    lit(put(box(0.1, 0.04, 0.02), AMBER, [s * 1.6, 2.1, 2.23], chassis), 1.5);
    lit(put(box(0.05, 0.05, 0.02), MAG, [s * 1.6, 2.44, 2.23], chassis), 1.5);

    // sill steps and neon
    put(box(0.2, 0.05, 1.1), DARKP, [s * 1.3, 0.82, 0.62], chassis);
    neon([s * 1.215, 0.62, -0.12], [s * 1.215, 0.62, 1.36], CYAN, chassis, 0.02, 1.6);
    neon([s * 1.215, 2.52, -0.05], [s * 1.215, 2.52, 1.95], MAG, chassis, 0.014, 1.4);
  }

  // ================================================================== front end
  // grille + headlights + visor
  put(box(1.5, 0.5, 0.05), BLACK, [0, 1.45, 3.51], chassis);
  face(GRILLE, 1.4, 0.4, [0, 1.45, 3.54], [0, 0, 1], chassis);
  face(LOGO, 0.3, 0.3, [0, 1.45, 3.565], [0, 0, 1], chassis);
  for (const s of [1, -1]) {
    put(box(0.56, 0.3, 0.14), BLACK, [s * 0.98, 1.45, 3.56], chassis);
    put(box(0.6, 0.05, 0.2), GRAPH, [s * 0.98, 1.62, 3.56], chassis);
    lit(put(box(0.48, 0.07, 0.02), "#e8fdff", [s * 0.98, 1.5, 3.635], chassis), 1.8);
    lit(put(box(0.48, 0.04, 0.02), MAG, [s * 0.98, 1.38, 3.635], chassis), 1.6);
    lit(put(box(0.07, 0.07, 0.02), AMBER, [s * 0.72, 1.44, 3.635], chassis), 1.5);
  }
  neon([-1.12, 1.72, 3.53], [1.12, 1.72, 3.53], MAG, chassis, 0.02, 1.8);
  neon([-1.12, 1.27, 3.53], [-0.76, 1.27, 3.53], CYAN, chassis, 0.012, 1.4);
  neon([1.12, 1.27, 3.53], [0.76, 1.27, 3.53], CYAN, chassis, 0.012, 1.4);

  // crowd-pusher bumper
  b.extrude(
    [[-1.28, 0.6], [1.28, 0.6], [1.22, 1.2], [0.9, 1.26], [-0.9, 1.26], [-1.22, 1.2]] as any,
    { at: [0, 0, 3.62], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.22, bevel: 0.04, bone: chassis, color: DARKP } as any,
  );
  face(CHEVRON, 2.3, 0.42, [0, 0.88, 3.735], [0, 0, 1], chassis);
  put(box(2.5, 0.1, 0.1), RUBBER, [0, 0.62, 3.72], chassis); // rubber strip
  neon([-1.15, 0.54, 3.6], [1.15, 0.54, 3.6], MAG, chassis, 0.02, 1.8);
  rod([-0.95, 1.3, 3.5], [0.95, 1.3, 3.5], 0.04, STEELP, chassis, { sides: 6 }); // manifold
  for (const x of [-0.8, -0.35, 0.35, 0.8]) {
    cylD(0.06, 0.3, 8, STEELP, [x, 1.35, 3.62], chassis, [0, 0.1, 1]);
    lit(cylD(0.045, 0.03, 8, CYAN, [x, 1.36, 3.78], chassis, [0, 0.1, 1]), 1.6);
    put(box(0.1, 0.08, 0.1), DARKP, [x, 1.3, 3.55], chassis);
  }
  for (const s of [1, -1]) {
    lit(cylD(0.07, 0.04, 8, AMBER, [s * 1.0, 0.75, 3.75], chassis, [0, 0, 1]), 1.4); // fog lamp
    put(torus(0.07, 0.015, 4, 8, ), YEL, [s * 0.5, 0.64, 3.76], chassis, { rotation: [90, 0, 0] }); // tow loop
  }

  // ================================================================== roof
  const barZ = 1.72;
  put(box(2.0, 0.1, 0.38), DARKP, [0, 2.6, barZ], chassis);
  const lensCols = [CYAN, MAG, CYAN, MAG, MAG, CYAN, MAG, CYAN];
  lensCols.forEach((c, i) => lit(put(box(0.2, 0.12, 0.34), c, [-0.84 + i * 0.24, 2.71, barZ], chassis), 1.8));
  put(box(2.04, 0.03, 0.42), STEELP, [0, 2.78, barZ], chassis);
  neon([-0.9, 2.62, barZ + 0.2], [0, 2.62, barZ + 0.2], CYAN, chassis, 0.014, 1.8);
  neon([0, 2.62, barZ + 0.2], [0.9, 2.62, barZ + 0.2], MAG, chassis, 0.014, 1.8);
  for (const s of [1, -1]) {
    const beacon = b.joint(`beacon${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.1, 2.6, barZ], dir: [0, 1, 0], role: "hinge" } as any);
    put(cyl(0.11, 0.06, 8), DARKP, [s * 1.1, 2.63, barZ], beacon, { flat: true });
    lit(put(halfSphere(0.11), s > 0 ? MAG : CYAN, [s * 1.1, 2.66, barZ], beacon, { flat: true }), 1.8);
    put(box(0.1, 0.1, 0.02), STEELP, [s * 1.1, 2.74, barZ + 0.05], beacon);
  }

  // sonic horns
  for (const s of [1, -1]) {
    put(box(0.14, 0.34, 0.14), DARKP, [s * 0.9, 2.72, 0.7], chassis);
    put(box(0.5, 0.05, 0.5), GRAPH, [s * 0.9, 2.57, 0.9], chassis);
    b.lathe(
      [[0, 0], [0.1, 0], [0.12, 0.1], [0.2, 0.3], [0.28, 0.55], [0.25, 0.55], [0.16, 0.3], [0.09, 0.14], [0, 0.14]] as any,
      { at: [s * 0.9, 2.95, 0.65], axis: [0, 0, 1], segments: 10, bone: chassis, color: PLATEP } as any,
    );
    lit(cylD(0.08, 0.02, 8, MAG, [s * 0.9, 2.95, 0.82], chassis, [0, 0, 1]), 1.5);
    put(torus(0.28, 0.02, 4, 12), YEL, [s * 0.9, 2.95, 1.2], chassis);
  }

  // sensor domes and antennas
  for (const s of [1, -1]) {
    put(cyl(0.15, 0.05, 10), DARKP, [s * 0.65, 2.575, 0.05], chassis, { flat: true });
    put(halfSphere(0.13), "#26364a", [s * 0.65, 2.6, 0.05], chassis, { flat: true });
    lit(put(new THREE.SphereGeometry(0.03, 6, 4), CYAN, [s * 0.65, 2.68, 0.13], chassis), 1.8);
    put(cyl(0.05, 0.1, 8), DARKP, [s * 1.1, 2.6, 0.05], chassis);
    b.spike([s * 1.1, 2.65, 0.05], [0, 1, 0], 1.15, 0.014, STEELP, { bone: chassis, sides: 5 } as any);
    lit(put(new THREE.SphereGeometry(0.035, 6, 4), AMBER, [s * 1.1, 3.82, 0.05], chassis), 1.6);
    // floodlights on cab roof corners
    put(box(0.2, 0.14, 0.14), DARKP, [s * 1.0, 2.64, 2.0], chassis);
    lit(put(box(0.16, 0.1, 0.02), "#ffffff", [s * 1.0, 2.64, 2.08], chassis), 1.8);
  }
  put(box(0.5, 0.06, 0.4), GRAPH, [0, 2.58, 0.15], chassis); // roof hatch
  put(box(0.3, 0.02, 0.2), STEELP, [0, 2.61, 0.15], chassis);

  // ================================================================== water cannon turret
  const tz = 0.75;
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.57, tz], dir: [0, 1, 0], role: "hinge" } as any);
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.12, tz], dir: [0, 0, 1], role: "hinge" } as any);
  put(torus(0.41, 0.04, 6, 16), STEELP, [0, 2.6, tz], chassis, { rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(cyl(0.022, 0.03, 6), BOLT, [0.41 * Math.cos(a), 2.64, tz + 0.41 * Math.sin(a)], chassis);
  }
  cylD(0.36, 0.22, 12, PLATEP, [0, 2.7, tz], yaw, [0, 1, 0]);
  cylD(0.2, 0.34, 10, STEELP, [0, 2.95, tz], yaw, [0, 1, 0]);
  neon([-0.2, 2.72, tz + 0.36], [0.2, 2.72, tz + 0.36], CYAN, yaw, 0.02, 1.2);
  for (const s of [1, -1]) {
    put(box(0.07, 0.72, 0.72), PLATEP, [s * 0.3, 3.12, tz], yaw);
    cylD(0.1, 0.12, 10, DARKP, [s * 0.37, 3.12, tz], yaw, [1, 0, 0]);
    put(box(0.03, 0.5, 0.04), YEL, [s * 0.34, 3.12, tz - 0.3], yaw);
  }
  face(GAUGE, 0.26, 0.26, [0.345, 3.33, tz + 0.12], [1, 0, 0], yaw);
  put(torus(0.13, 0.014, 4, 14), BOLT, [0.337, 3.33, tz + 0.12], yaw, { dir: [1, 0, 0], axis: "z" });
  // barrel
  put(box(0.42, 0.42, 0.58), PLATEP, [0, 3.12, 0.5], pitch);
  rod([0, 3.12, 0.75], [0, 3.12, 2.0], [0.19, 0.14], PLATEP, pitch, { sides: 10, caps: "flat" });
  for (const z of [1.0, 1.45]) put(torus(0.2 - (z - 1.0) * 0.08, 0.03, 5, 12), YEL, [0, 3.12, z], pitch);
  put(box(0.22, 0.14, 0.3), DARKP, [0, 3.4, 0.6], pitch); // sensor pod
  lit(cylD(0.04, 0.03, 8, MAG, [0, 3.4, 0.77], pitch, [0, 0, 1]), 1.8);
  neon([0, 3.34, 0.9], [0, 3.34, 1.95], MAG, pitch, 0.01, 1.6); // laser sight
  b.lathe(
    [[0, 0], [0.15, 0], [0.15, 0.08], [0.24, 0.32], [0.2, 0.32], [0.1, 0.12], [0, 0.12]] as any,
    { at: [0, 3.12, 2.0], axis: [0, 0, 1], segments: 10, bone: pitch, color: STEELP } as any,
  );
  lit(cylD(0.09, 0.02, 10, CYAN, [0, 3.12, 2.13], pitch, [0, 0, 1]), 2.0);
  lit(put(torus(0.225, 0.015, 4, 16), CYAN, [0, 3.12, 2.31], pitch), 1.8);
  // feed hose from the tank
  b.sweep(catmull([[0, 2.9, -0.78], [0, 3.28, -0.4], [0, 3.34, 0.05], [0, 3.2, 0.3]]) as any, 0.05, RUBBER, { bone: pitch, sides: 6 } as any);
  put(cyl(0.07, 0.08, 8), YEL, [0, 3.18, 0.3], pitch, { dir: [0, 0.3, 1] });

  // ================================================================== water tank
  const tank = b.lathe(
    [[0, 0], [0.25, 0.02], [0.42, 0.1], [0.5, 0.24], [0.52, 0.45], [0.52, 2.1], [0.5, 2.31], [0.42, 2.45], [0.25, 2.53], [0, 2.55]] as any,
    { at: [0, 2.84, -3.25], axis: [0, 0, 1], segments: 14, bone: chassis, color: TANKP } as any,
  );
  for (const z of [-2.9, -1.0]) put(box(1.0, 0.14, 0.26), DARKP, [0, 2.27, z], chassis);
  for (const z of [-2.95, -2.5, -1.0]) put(torus(0.54, 0.03, 4, 16), DARKP, [0, 2.84, z], chassis);
  for (const s of [1, -1]) {
    b.decal(tank, TANKLABEL, { at: [s * 0.52, 2.84, -1.75], dir: [s, 0, 0], size: [1.0, 0.3], segments: 6 } as any);
    rod([s * 0.56, 2.52, -2.65], [s * 0.56, 3.05, -2.65], 0.028, s > 0 ? CYAN : MAG, chassis, { sides: 5 });
    lit(b.rod([s * 0.56, 2.55, -2.65], [s * 0.56, 3.02, -2.65], 0.02, s > 0 ? CYAN : MAG, { bone: chassis, sides: 5 } as any), 1.6);
    for (const y of [2.5, 3.07]) put(box(0.07, 0.05, 0.08), STEELP, [s * 0.55, y, -2.65], chassis);
  }
  cylD(0.16, 0.1, 10, STEELP, [0, 3.38, -1.8], chassis, [0, 1, 0]);
  cylD(0.2, 0.04, 10, YEL, [0, 3.44, -1.8], chassis, [0, 1, 0]);
  cylD(0.04, 0.3, 6, STEELP, [-0.25, 3.45, -2.5], chassis, [0, 1, 0]);
  put(torus(0.42, 0.02, 4, 12), NAVY, [0, 2.84, -3.12], chassis);
  lit(cylD(0.08, 0.03, 8, CYAN, [0, 3.2, -3.28], chassis, [0, 0, -1]), 1.4); // rear fill-port lamp

  // ================================================================== flank detail (rear compartment)
  for (const s of [1, -1]) {
    b.decal(body, LOGO, { at: [s * 1.2, 1.72, -0.75], dir: [s, 0, 0], size: [0.55, 0.55], segments: 6 } as any);
    b.decal(body, FLANK, { at: [s * 1.2, 1.88, -2.05], dir: [s, 0, 0], size: [1.9, 0.475], segments: 8 } as any);
    put(box(1.8, 0.28, 0.03), BLACK, [s * 1.215, 1.47, -2.05], chassis);
    lit(face(LED, 1.72, 0.22, [s * 1.234, 1.47, -2.05], [s, 0, 0], chassis), 1.4);
    put(box(0.05, 0.9, 0.12), PLATEP, [s * 1.215, 1.7, -3.25], chassis); // rib
    put(box(0.05, 0.9, 0.12), PLATEP, [s * 1.215, 1.7, -0.3], chassis);
    neon([s * 1.215, 2.17, -3.3], [s * 1.215, 2.17, -0.15], CYAN, chassis, 0.016, 1.5);
    // exhaust stack
    rod([s * 1.28, 0.95, -0.14], [s * 1.28, 3.0, -0.14], 0.07, STEELP, chassis, { sides: 8 });
    for (const y of [1.3, 1.9, 2.5]) put(torus(0.085, 0.015, 4, 8), BOLT, [s * 1.28, y, -0.14], chassis, { rotation: [90, 0, 0] });
    put(box(0.04, 1.0, 0.12), GRAPH, [s * 1.34, 1.5, -0.14], chassis);
    put(cyl(0.08, 0.03, 8), AMBER, [s * 1.28, 3.02, -0.14], chassis);
  }
  // roof edge of the rear box + service ladder on the tank saddle
  for (let i = 0; i < 4; i++) put(box(0.04, 0.04, 0.3), STEELP, [0.7, 2.24 + i * 0.001, -0.5 - i * 0.7], chassis);

  // ================================================================== rear
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const dj = b.joint(`rearDoor${side}`, { parent: chassis, at: [s * 1.15, 1.4, -3.46], dir: [0, 1, 0], role: "hinge" } as any);
    put(box(1.08, 1.25, 0.08), LIVERY, [s * 0.6, 1.4, -3.5], dj);
    face(CHEVRON, 1.0, 0.3, [s * 0.6, 0.98, -3.545], [0, 0, -1], dj);
    put(box(0.8, 0.16, 0.02), BLACK, [s * 0.6, 1.72, -3.55], dj);
    neon([s * 0.25, 1.72, -3.565], [s * 0.95, 1.72, -3.565], MAG, dj, 0.006, 1.4);
    rod([s * 0.12, 1.15, -3.56], [s * 0.12, 1.65, -3.56], 0.022, STEELP, dj, { sides: 5 });
    for (const y of [0.95, 1.85]) cylD(0.03, 0.14, 6, STEELP, [s * 1.15, y, -3.46], dj, [0, 1, 0]);
    lit(put(box(0.07, 0.95, 0.1), RED, [s * 1.19, 1.45, -3.46], chassis), 1.7); // tail light
    face(LOGO, 0.26, 0.26, [s * 0.6, 1.42, -3.55], [0, 0, -1], dj);
  }
  neon([-1.0, 2.06, -3.47], [1.0, 2.06, -3.47], RED, chassis, 0.02, 1.8);
  neon([-0.35, 2.12, -3.47], [0.35, 2.12, -3.47], CYAN, chassis, 0.012, 1.5);
  put(box(2.4, 0.34, 0.3), DARKP, [0, 0.75, -3.58], chassis);
  face(PLATE, 0.5, 0.25, [0, 0.76, -3.736], [0, 0, -1], chassis);
  lit(put(box(0.2, 0.02, 0.02), "#ffffff", [0, 0.9, -3.74], chassis), 1.4);
  put(cyl(0.05, 0.12, 8), STEELP, [0.8, 0.7, -3.77], chassis, { dir: [0, 0, 1] });
  neon([-1.1, 0.57, -3.7], [1.1, 0.57, -3.7], MAG, chassis, 0.016, 1.6);
  put(box(0.5, 0.05, 0.3), STEELP, [-0.8, 0.95, -3.7], chassis); // step
  put(box(0.5, 0.05, 0.3), STEELP, [0.0, 0.95, -3.7], chassis);

  return b.root;
}
