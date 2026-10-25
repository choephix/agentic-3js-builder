```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, countershade, mix, noise, paint, patches, resolve, rng, smoothstep, svg } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { coil, metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "VX-77 Armoured Hauler (2077)",
  description:
    "Six-wheel corporate-security armoured truck from 2077: camo-panelled hull, plough bumper, neon underglow, roof remote weapon station, missile pods, drone pad, radar dish, HUD glass and glowing decals. Rigged with wheels, steering, doors, rear doors, turret, pods and radar.",
};

// ------------------------------------------------------------------ helpers
const D = Math.PI / 180;
type V = [number, number, number];
const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cy = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
const tor = (r: number, t: number, n = 16) => new THREE.TorusGeometry(r, t, 4, n);

function place(g: THREE.BufferGeometry, p: V, r: V = [0, 0, 0]) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(p[0], p[1], p[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D, r[1] * D, r[2] * D)),
    new THREE.Vector3(1, 1, 1),
  );
  return g.clone().applyMatrix4(m);
}
const gather = (items: [THREE.BufferGeometry, V, V?][]) => mergeGeometries(items.map(([g, p, r]) => place(g, p, r)))!;

// ------------------------------------------------------------------ palette
const C = {
  ink: "#06080c",
  gun: "#1d2127",
  gun2: "#2b3139",
  steel: "#59616c",
  steelLt: "#9aa5b1",
  rubber: "#101214",
  glass: "#0a1c28",
  pink: "#ff2e97",
  cyan: "#1cf2ff",
  amber: "#ffb020",
  yellow: "#ffd21a",
  red: "#ff2a3a",
  orange: "#ff7a18",
  white: "#f2f6ff",
  green: "#3dff8a",
  brass: "#c89b3c",
  violet: "#7a3cff",
  nose: "#d8dde3",
};
const MUD: [number, number, number] = [0.22, 0.18, 0.13];
const YEL: [number, number, number] = [1, 0.82, 0.1];
const BLK: [number, number, number] = [0.06, 0.065, 0.08];

const weather = (base: ColorInput, seed = 3) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const mud = smoothstep(1.1, 0.25, p.y) * smoothstep(0.35, 0.7, noise(p, 0.22, seed));
    const dust = smoothstep(0.2, 1, n.y) * 0.18 * noise(p, 0.5, seed + 2);
    return mix(mix(c, MUD, mud * 0.75), [0.55, 0.55, 0.5], dust);
  });

const camo = patches("#0b0d10", ["#23292d", "#1a2a2c", "#33392f", "#2b3036"], { size: 0.9, gap: 0.035, seed: 4 });
const HULL = weather(
  panelled(countershade(camo, "#101216", { level: -0.3, soft: 0.6 }), {
    size: 0.5,
    aspect: 0.62,
    rivets: 0.08,
    seam: "#05060a",
  }),
);
const ARMOUR = weather(
  panelled(metal("iron", { tarnish: 0.3, seed: 5 }), { size: 0.3, aspect: 0.8, rivets: 0.05, seam: "#05060a" }),
  7,
);
const STEELP = weather(metal("steel", { tarnish: 0.45, polish: 0.2 }), 9);
const GUNM = metal("blued", { polish: 0.25 });
const COPPERP = metal("copper", { verdigris: 0.2 });
const TYRE = weather("#15171b", 11);
const HAZARD = paint((p, n) => ((Math.floor(((Math.abs(n.x) > 0.6 ? p.z : p.x) + p.y) / 0.1) & 1) ? YEL : BLK));
const HAZ = weather(HAZARD, 13);
const PLOUGH = paint((_p, n) => (n.z > 0.45 ? HAZ : ARMOUR));

// ------------------------------------------------------------------ textures
const hudGlass = () =>
  svg(
    `<svg viewBox="0 0 164 74" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d5470"/><stop offset="0.5" stop-color="#0b2436"/><stop offset="1" stop-color="#050b14"/></linearGradient></defs>
<rect width="164" height="74" fill="url(#g)"/>
<polygon points="12,0 42,0 24,74 0,74" fill="#37e8ff" fill-opacity="0.16"/>
<polygon points="62,0 72,0 54,74 44,74" fill="#ff3fa4" fill-opacity="0.15"/>
<polygon points="112,0 150,0 130,74 92,74" fill="#37e8ff" fill-opacity="0.1"/>
<g stroke="#2dffd6" stroke-width="1.6" fill="none" stroke-linecap="round">
<path d="M56 20h-9v9M108 20h9v9M56 54h-9v-9M108 54h9v-9"/>
<circle cx="82" cy="37" r="9"/><path d="M82 23v7M82 44v7M68 37h7M89 37h7"/></g>
<path d="M10 62Q82 36 154 62" stroke="#ff3fa4" stroke-width="1.6" fill="none"/>
<g font-family="monospace" font-weight="bold" font-size="6.5" fill="#2dffd6">
<text x="8" y="11">TGT 0412M</text><text x="118" y="11">HEAT 87</text><text x="8" y="70">NAV 2077.N</text><text x="112" y="70">ARM  OK</text></g>
<rect x="150" y="30" width="4" height="14" fill="#ff3fa4"/>
</svg>`,
    { size: 512 },
  );

const sideWindow = (flip: boolean) => {
  const pts = [
    [1.2, 2.3],
    [2.3, 2.3],
    [2.46, 2.14],
    [2.46, 1.9],
    [1.2, 1.9],
  ]
    .map(([z, y]) => `${((flip ? 2.5 - z : z - 1.2) * 100).toFixed(1)},${((2.32 - y) * 100).toFixed(1)}`)
    .join(" ");
  const sx = flip ? 0 : 1;
  return svg(
    `<svg viewBox="0 0 130 42" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b4a63"/><stop offset="1" stop-color="#050b14"/></linearGradient>
<clipPath id="c"><polygon points="${pts}"/></clipPath></defs>
<polygon points="${pts}" fill="url(#g)"/>
<g clip-path="url(#c)"><polygon points="${20 + sx * 40},0 ${46 + sx * 40},0 ${26 + sx * 40},42 ${0 + sx * 40},42" fill="#37e8ff" fill-opacity="0.18"/>
<polygon points="${70 + sx * 10},0 ${78 + sx * 10},0 ${58 + sx * 10},42 ${50 + sx * 10},42" fill="#ff3fa4" fill-opacity="0.16"/></g>
<polygon points="${pts}" fill="none" stroke="#05080c" stroke-width="3" stroke-linejoin="round"/>
</svg>`,
    { size: 512 },
  );
};

const fascia = () => {
  let slats = "";
  for (let i = 0; i < 6; i++) slats += `<rect x="4" y="${10 + i * 7.2}" width="112" height="4" fill="#232a33"/>`;
  let mesh = "";
  for (let i = 0; i < 14; i++) mesh += `<path d="M${8 + i * 8} 8V52" stroke="#10151b" stroke-width="1.2"/>`;
  return svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
<rect width="120" height="60" rx="3" fill="#07090d"/>${slats}${mesh}
<rect x="3" y="3" width="114" height="3" fill="#1cf2ff"/><rect x="3" y="54" width="114" height="3" fill="#ff2e97"/>
<polygon points="60,14 73,22 73,38 60,46 47,38 47,22" fill="#0b0e13" stroke="#ff2e97" stroke-width="2.5"/>
<path d="M52 24L60 38L68 24" stroke="#ffffff" stroke-width="4" fill="none" stroke-linejoin="round"/>
<path d="M8 24l8 6-8 6M112 24l-8 6 8 6" stroke="#ffb020" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
    { size: 512 },
  );
};

const emblem = () =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="none" stroke="#ff2e97" stroke-width="4" stroke-linejoin="round"/>
<polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="#1cf2ff" stroke-width="2.5"/>
<path d="M30 30L50 64L70 30" stroke="#ffffff" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 30L50 48L60 30" stroke="#ff2e97" stroke-width="3" fill="none" stroke-linejoin="round"/>
<text x="50" y="79" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#ffffff">VANTA</text>
</svg>`,
    { size: 256 },
  );

const marking = () =>
  svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
<text x="100" y="52" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="50" fill="#ffd21a">VX-77</text>
<rect x="8" y="62" width="184" height="5" fill="#ffd21a"/>
<text x="100" y="86" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#e8f0ff">ARMOURED LOGISTICS // U-0451</text>
</svg>`,
    { size: 512 },
  );

const neonTag = () =>
  svg(
    `<svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg">
<rect x="4" y="4" width="152" height="52" rx="12" fill="none" stroke="#ff2e97" stroke-width="4"/>
<text x="80" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#ff2e97">SECURITY</text>
<rect x="24" y="41" width="112" height="4" rx="2" fill="#1cf2ff"/>
</svg>`,
    { size: 512 },
  );

const screenTex = () => {
  let grid = "";
  for (let i = 1; i < 8; i++) grid += `<path d="M${i * 8} 0V40" stroke="#0c3a2a" stroke-width="0.6"/>`;
  for (let i = 1; i < 5; i++) grid += `<path d="M0 ${i * 8}H64" stroke="#0c3a2a" stroke-width="0.6"/>`;
  let bars = "";
  [10, 16, 12, 20, 14, 18, 9].forEach((h, i) => (bars += `<rect x="${5 + i * 8}" y="${38 - h}" width="5" height="${h}" fill="#3dff8a"/>`));
  return svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" rx="2" fill="#04100c"/>${grid}${bars}
<polyline points="4,30 14,24 24,27 34,16 44,20 58,8" stroke="#1cf2ff" stroke-width="1.5" fill="none"/>
<text x="4" y="9" font-size="6" fill="#3dff8a" font-family="monospace" font-weight="bold">LOAD 78%</text></svg>`,
    { size: 256 },
  );
};

const hazardPattern = `<defs><pattern id="h" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="#ffd21a"/><rect x="6" width="6" height="12" fill="#101216"/></pattern></defs>`;
const rearA = () =>
  svg(
    `<svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">${hazardPattern}
<rect width="80" height="90" fill="#16191e"/><rect width="80" height="12" fill="url(#h)"/><rect y="78" width="80" height="12" fill="url(#h)"/>
<polygon points="40,20 62,58 18,58" fill="none" stroke="#ff2a3a" stroke-width="3.5" stroke-linejoin="round"/>
<rect x="38" y="30" width="4" height="15" fill="#ff2a3a"/><rect x="38" y="49" width="4" height="4" fill="#ff2a3a"/>
<text x="40" y="67" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="7" fill="#ffffff">AUTO-TURRET</text>
<text x="40" y="74" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="5" fill="#ffd21a">KEEP CLEAR 50M</text></svg>`,
    { size: 384 },
  );
const rearB = () =>
  svg(
    `<svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">${hazardPattern}
<rect width="80" height="90" fill="#16191e"/><rect y="78" width="80" height="12" fill="url(#h)"/>
<rect x="0" y="16" width="80" height="3" fill="#ff2e97"/>
<text x="40" y="12" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="7" fill="#ffd21a">WIDE LOAD</text>
<rect x="8" y="32" width="64" height="26" rx="3" fill="#e9edf2" stroke="#101216" stroke-width="2"/>
<text x="40" y="51" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#101216">NC-2077</text>
<rect x="8" y="64" width="20" height="6" fill="#ff2a3a"/><rect x="52" y="64" width="20" height="6" fill="#1cf2ff"/></svg>`,
    { size: 384 },
  );

const ventTex = () => {
  let s = "";
  for (let i = 0; i < 6; i++) s += `<rect x="5" y="${4 + i * 4.2}" width="40" height="2.4" fill="#ff7a18"/>`;
  return svg(
    `<svg viewBox="0 0 50 30" xmlns="http://www.w3.org/2000/svg"><rect width="50" height="30" fill="#0a0c10"/>${s}<rect x="1" y="1" width="48" height="28" fill="none" stroke="#59616c" stroke-width="2"/></svg>`,
    { size: 256 },
  );
};

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "vx77_hauler", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const put = (g: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(g, color, { bone: chassis, at, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const neon = (g: THREE.BufferGeometry, color: string, at: V, o: any = {}, k = 1.2) => glow(put(g, color, at, o), k);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipe = (a: V, c: V, r: number, color: any, o: any = {}) => b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, k = 0, o: any = {}) => {
    const p = b.part(plane(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
    if (k) glow(p, k);
    return p;
  };

  const HUBY = 0.59;
  const AF = 2.95;
  const AM = -1.1;
  const AR = -2.6;
  const WX = 1.13;

  const T_HUD = hudGlass();
  const T_WL = sideWindow(true);
  const T_WR = sideWindow(false);
  const T_FASCIA = fascia();
  const T_EMBLEM = emblem();
  const T_MARK = marking();
  const T_TAG = neonTag();
  const T_SCREEN = screenTex();
  const T_REARA = rearA();
  const T_REARB = rearB();
  const T_VENT = ventTex();

  // ---------------------------------------------------------- frame and drivetrain
  for (const s of [1, -1]) {
    put(bx(0.2, 0.28, 6.9), C.gun, [s * 0.55, 0.85, -0.15]);
    put(bx(0.06, 0.2, 6.5), C.gun2, [s * 0.66, 0.85, -0.15]);
  }
  for (const z of [-3.4, -2.6, -1.8, -1.1, -0.3, 0.6, 1.5, 2.4, 3.2]) put(bx(1.1, 0.16, 0.12), C.gun2, [0, 0.82, z]);
  pipe([0, 0.7, -2.6], [0, 0.7, 2.95], 0.04, STEELP, { sides: 8 });
  put(bx(0.4, 0.3, 0.5), C.gun2, [0, 0.68, 0.9]);
  put(bx(1.5, 0.06, 1.4), ARMOUR, [0, 0.64, 2.5]);
  put(cy(0.2, 1.2, 10), C.gun2, [0.4, 0.68, 0], { rotation: [90, 0, 0], flat: true });
  for (const z of [AF, AM, AR]) {
    pipe([-1.0, HUBY, z], [1.0, HUBY, z], 0.07, STEELP, { sides: 8 });
    put(new THREE.SphereGeometry(0.2, 8, 6), STEELP, [0, HUBY, z], { flat: true });
  }

  // fenders
  const FENDER: [number, number][] = [
    [-0.8, 0.2], [-0.72, 0.5], [-0.42, 0.78], [0.42, 0.78], [0.72, 0.5], [0.8, 0.2],
    [0.68, 0.2], [0.6, 0.46], [0.38, 0.66], [-0.38, 0.66], [-0.6, 0.46], [-0.68, 0.2],
  ];
  const treadGeo = (() => {
    const items: [THREE.BufferGeometry, V, V?][] = [];
    for (let i = 0; i < 14; i++)
      for (const j of [0, 1]) {
        const a = ((i + j * 0.5) / 14) * Math.PI * 2;
        items.push([bx(0.13, 0.15, 0.07), [0.565 * Math.sin(a), j ? 0.085 : -0.085, 0.565 * Math.cos(a)], [0, a / D, 0]]);
      }
    return gather(items);
  })();
  const boltGeo = (() => {
    const items: [THREE.BufferGeometry, V, V?][] = [[cy(0.09, 0.09, 8), [0, 0.25, 0]]];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      items.push([cy(0.022, 0.05, 6), [0.15 * Math.sin(a), 0.235, 0.15 * Math.cos(a)]]);
    }
    return gather(items);
  })();
  const slotGeo = (() => {
    const items: [THREE.BufferGeometry, V, V?][] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      items.push([bx(0.07, 0.025, 0.16), [0.26 * Math.sin(a), 0.2, 0.26 * Math.cos(a)], [0, a / D, 0]]);
    }
    return gather(items);
  })();
  const TYRE_PROFILE: [number, number][] = [[0, -0.18], [0.44, -0.18], [0.54, -0.13], [0.58, -0.07], [0.58, 0.07], [0.54, 0.13], [0.44, 0.18], [0, 0.18]];
  const RIM_PROFILE: [number, number][] = [[0, 0], [0.4, 0], [0.4, 0.185], [0.33, 0.2], [0.2, 0.15], [0.1, 0.21], [0, 0.21]];

  const wheelSpecs: [string, number, number][] = [
    ["FL", 1, AF], ["FR", -1, AF], ["ML", 1, AM], ["MR", -1, AM], ["RL", 1, AR], ["RR", -1, AR],
  ];
  for (const [k, s, z] of wheelSpecs) {
    const hub: V = [s * WX, HUBY, z];
    const axle: V = [s, 0, 0];
    b.extrude(FENDER, { at: [s * WX, HUBY, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.46, bevel: 0.02, color: HULL, bone: chassis });
    put(bx(0.5, 0.04, 0.55), ARMOUR, [s * (WX + 0.27), HUBY + 0.55, z]); // flare lip
    let parent = chassis;
    if (z === AF) parent = b.joint(`steer${k}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" });
    const spin = b.joint(`wheel${k}`, { parent, at: hub, dir: axle, role: "hinge" });
    b.lathe(TYRE_PROFILE, { at: hub, axis: axle, segments: 14, bone: spin, color: TYRE });
    b.part(treadGeo, TYRE, { bone: spin, at: hub, dir: axle, flat: true });
    b.lathe(RIM_PROFILE, { at: hub, axis: axle, segments: 10, bone: spin, color: STEELP });
    b.part(boltGeo, C.steelLt, { bone: spin, at: hub, dir: axle, flat: true });
    b.part(slotGeo, C.ink, { bone: spin, at: hub, dir: axle });
    glow(
      b.part(tor(0.31, 0.014, 20), C.cyan, { bone: spin, at: [hub[0] + s * 0.212, hub[1], hub[2]], dir: axle, axis: "z" }),
      1.3,
    );
    // suspension
    const dz = z > 0 ? -0.7 : 0.7;
    pipe([s * 0.95, HUBY, z], [s * 0.55, 0.8, z + dz], 0.045, C.gun2);
    b.sweep(coil([s * 0.78, HUBY + 0.1, z], [s * 0.72, 0.98, z], 0.055, 6), 0.011, C.steelLt, { bone: chassis, sides: 5 });
    pipe([s * 0.78, HUBY + 0.1, z], [s * 0.72, 0.98, z], 0.028, C.gun, { sides: 6 });
  }
  // mud flaps
  for (const s of [1, -1]) {
    put(bx(0.5, 0.5, 0.04), C.rubber, [s * WX, 0.5, -3.3]);
    neon(bx(0.5, 0.05, 0.05), C.yellow, [s * WX, 0.27, -3.3], {}, 0.6);
  }

  // ---------------------------------------------------------- cab
  const CAB: [number, number][] = [[0.8, 0.85], [0.8, 2.4], [1.0, 2.5], [2.2, 2.5], [2.85, 1.85], [3.5, 1.78], [3.6, 1.62], [3.6, 0.85]];
  b.extrude(CAB, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.03, color: HULL, bone: chassis });
  // windscreen and armoured cage
  decal(T_HUD, 1.64, 0.735, [0, 2.196, 2.546], [0, 0.707, 0.707], 0.55);
  for (const [z, y] of [[2.41, 2.39], [2.575, 2.225], [2.74, 2.06]]) pipe([-0.85, y, z], [0.85, y, z], 0.018, C.gun2, { sides: 4 });
  for (const s of [1, -1]) pipe([s * 0.89, 2.5, 2.2], [s * 0.89, 1.85, 2.85], 0.05, HULL, { section: "box", caps: "flat" });
  put(bx(1.9, 0.05, 0.45), ARMOUR, [0, 2.56, 2.3]);
  neon(bx(1.8, 0.02, 0.02), C.pink, [0, 2.55, 2.53], {}, 1.2);
  // fascia, headlights
  decal(T_FASCIA, 1.2, 0.6, [0, 1.3, 3.607], [0, 0, 1], 1);
  for (const s of [1, -1]) {
    put(bx(0.34, 0.4, 0.12), ARMOUR, [s * 0.78, 1.3, 3.63]);
    put(bx(0.36, 0.06, 0.16), C.gun, [s * 0.78, 1.52, 3.63]);
    neon(bx(0.26, 0.1, 0.02), C.white, [s * 0.78, 1.38, 3.695], {}, 1.6);
    neon(bx(0.26, 0.04, 0.02), C.amber, [s * 0.78, 1.2, 3.695], {}, 1.2);
    neon(bx(0.03, 0.5, 0.03), C.pink, [s * 0.94, 1.3, 3.61], {}, 1.2);
    neon(cy(0.045, 0.05, 8), C.cyan, [s * 0.7, 0.7, 3.99], { dir: [0, 0, 1], flat: true }, 1.6); // fog lamps
  }
  // hood
  neon(bx(1.5, 0.02, 0.02), C.cyan, [0, 1.7, 3.575], {}, 1.2);
  for (const x of [-0.12, 0.12]) put(bx(0.08, 0.05, 0.55), ARMOUR, [x, 1.86, 3.18]);
  for (const s of [1, -1]) {
    decal(T_VENT, 0.5, 0.3, [s * 0.55, 1.836, 3.15], [0, 1, 0.108], 1.2, { up: [0, 0, 1] });
    put(bx(0.55, 0.03, 0.34), C.gun, [s * 0.55, 1.82, 3.15], { rotation: [-6, 0, 0] });
    put(bx(0.1, 0.1, 0.3), ARMOUR, [s * 0.86, 1.84, 3.1]);
  }
  // cab cheeks, quarter plates, steps
  for (const s of [1, -1]) {
    put(bx(0.08, 1.3, 0.25), ARMOUR, [s * 0.97, 1.7, 0.92]);
    put(bx(0.4, 0.05, 1.1), HAZ, [s * 1.1, 0.8, 1.5]);
    pipe([s * 1.0, 0.8, 1.1], [s * 0.95, 0.95, 1.1], 0.02, C.gun2);
    pipe([s * 1.0, 0.8, 1.9], [s * 0.95, 0.95, 1.9], 0.02, C.gun2);
    put(bx(0.06, 0.3, 1.0), ARMOUR, [s * 0.98, 0.95, 1.5]);
    neon(bx(0.05, 0.04, 2.6), C.cyan, [s * 0.88, 0.83, 2.2], {}, 1.3);
    neon(bx(0.05, 0.04, 3.8), C.pink, [s * 0.88, 0.86, -1.4], {}, 1.3);
  }

  // doors
  const DOOR: [number, number][] = [[1.05, 1.0], [2.2, 1.0], [2.5, 1.3], [2.5, 2.2], [2.26, 2.44], [1.05, 2.44]];
  for (const s of [1, -1]) {
    const dj = b.joint(s > 0 ? "doorL" : "doorR", { parent: chassis, at: [s * 0.97, 1.7, 2.5], dir: [0, 1, 0], role: "hinge" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dp = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: dj, at, ...o });
    b.extrude(DOOR, { at: [s * 0.97, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, color: HULL, bone: dj });
    b.part(plane(1.3, 0.42), "#ffffff", { bone: dj, at: [s * 1.029, 2.11, 1.85], dir: [s, 0, 0], axis: "z", texture: s > 0 ? T_WL : T_WR });
    dp(bx(0.04, 0.3, 1.0), ARMOUR, [s * 1.04, 1.4, 1.6]);
    dp(bx(0.04, 0.05, 0.2), C.steelLt, [s * 1.06, 1.75, 1.25]);
    glow(dp(bx(0.02, 0.03, 0.9), C.pink, [s * 1.065, 1.2, 1.6]), 1.2);
    for (const y of [1.2, 1.7, 2.2]) dp(cy(0.03, 0.12, 6), C.steel, [s * 0.99, y, 2.5], { flat: true });
    // mirror
    b.rod([s * 1.03, 2.25, 2.4], [s * 1.28, 2.35, 2.5], 0.02, C.gun2, { bone: dj, sides: 5 });
    dp(bx(0.1, 0.3, 0.22), C.gun2, [s * 1.3, 2.3, 2.55]);
    dp(bx(0.2, 0.26, 0.02), C.glass, [s * 1.3, 2.3, 2.435]);
    glow(dp(cy(0.025, 0.03, 6), C.cyan, [s * 1.3, 2.14, 2.55], { flat: true }), 1.5);
  }

  // ---------------------------------------------------------------- bumper
  const plough = b.extrude([[3.5, 1.0], [3.5, 0.42], [3.9, 0.36], [4.08, 0.55], [3.8, 1.0]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, bevel: 0.03, color: PLOUGH, bone: chassis,
  });
  const studs = b.surface(plough).scatter(18, { rng: rng(5), minDist: 0.14, filter: (h) => h.n.z > 0.6 });
  for (const hit of studs) b.stick(cy(0.03, 0.03, 6), C.steelLt, hit, { embed: 0.4 });
  for (let i = 0; i < 5; i++) b.spike([-0.8 + i * 0.4, 0.45, 3.96], [0, -0.3, 1], 0.2, 0.055, STEELP, { bone: chassis, sides: 4 });
  for (const s of [1, -1]) {
    put(bx(0.12, 0.2, 0.3), C.gun2, [s * 0.5, 0.85, 3.4]);
    put(tor(0.07, 0.02, 8), C.steelLt, [s * 0.35, 0.78, 4.05], { rotation: [90, 0, 0] });
  }

  // ---------------------------------------------------------------- cab roof
  put(bx(1.6, 0.1, 0.16), C.gun, [0, 2.58, 1.95]);
  const barPath = [[-0.7, 2.64, 1.95], [0.7, 2.64, 1.95]] as V[];
  b.along(catmull([barPath[0], [0, 2.64, 1.95], barPath[1]]), 8, (at) => {
    const i = Math.round(at.t * 8);
    return glow(b.part(bx(0.17, 0.06, 0.2), i % 2 ? C.cyan : C.pink, { at, bone: chassis }), 1.6);
  });
  put(cy(0.22, 0.05, 10), C.gun2, [-0.5, 2.525, 1.4], { flat: true });
  put(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), C.glass, [-0.5, 2.55, 1.4], { flat: true });
  neon(new THREE.SphereGeometry(0.05, 6, 4), C.cyan, [-0.5, 2.62, 1.45], { flat: true }, 1.6);
  put(tor(0.3, 0.025, 14), C.steel, [0.45, 2.52, 1.45], { rotation: [90, 0, 0] });
  put(cy(0.28, 0.04, 12), ARMOUR, [0.45, 2.54, 1.45], { flat: true });
  neon(tor(0.18, 0.012, 14), C.cyan, [0.45, 2.565, 1.45], { rotation: [90, 0, 0] }, 1.2);
  put(bx(0.5, 0.12, 0.35), C.gun2, [0.0, 2.56, 1.1]);
  put(bx(0.4, 0.1, 0.5), ARMOUR, [-0.1, 2.55, 1.7]);
  b.spike([0.82, 2.5, 1.0], [0, 1, 0], 0.95, 0.014, C.steelLt, { bone: chassis, sides: 5 });
  neon(new THREE.SphereGeometry(0.03, 6, 4), C.red, [0.82, 3.46, 1.0], { flat: true }, 2);
  neon(cy(0.03, 0.04, 6), C.green, [-0.85, 2.52, 1.0], { flat: true }, 1.6);
  neon(cy(0.03, 0.04, 6), C.red, [0.85, 2.52, 2.0], { flat: true }, 1.6);

  // ---------------------------------------------------------------- cargo body
  b.extrude([[-3.55, 0.9], [-3.55, 2.0], [-3.15, 2.35], [0.55, 2.35], [0.55, 0.9]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.03, color: HULL, bone: chassis,
  });
  // bellows and cables in the coupling gap
  put(bx(1.4, 1.3, 0.26), C.gun, [0, 1.55, 0.675]);
  for (let y = 1.0; y <= 2.2; y += 0.12) put(bx(1.5, 0.06, 0.3), C.gun2, [0, y, 0.675]);
  const cables: [string, number][] = [[C.pink, -0.25], [C.cyan, -0.1], [C.ink, 0.1], [C.copper ?? "#b5652b", 0.25]];
  for (const [col, x] of cables)
    b.sweep(catmull([[x, 2.2, 0.8], [x + 0.05, 1.7, 0.57], [x - 0.04, 1.3, 0.8], [x, 1.0, 0.56]]), 0.02, col, { bone: chassis, sides: 5 });
  for (const s of [1, -1]) {
    // exhaust stacks
    const x = s * 0.84;
    pipe([x, 1.0, 0.675], [x, 3.0, 0.675], 0.075, STEELP, { sides: 8 });
    put(cy(0.1, 0.9, 8), GUNM, [x, 2.0, 0.675], { flat: true });
    for (const y of [1.45, 2.5]) put(tor(0.085, 0.015, 10), C.steelLt, [x, y, 0.675], { rotation: [90, 0, 0] });
    b.spike([x, 3.0, 0.675], [0, 1, 0], 0.14, 0.1, C.gun, { bone: chassis, sides: 8 });
    neon(tor(0.07, 0.014, 10), C.orange, [x, 2.99, 0.675], { rotation: [90, 0, 0] }, 1.8);
    pipe([x, 2.3, 0.675], [s * 0.95, 2.3, 0.8], 0.015, C.gun2);
  }
  // roof rim, neon edge, rails
  for (const s of [1, -1]) {
    put(bx(0.08, 0.12, 3.7), ARMOUR, [s * 0.92, 2.41, -1.3]);
    neon(bx(0.04, 0.03, 3.6), C.cyan, [s * 0.82, 2.37, -1.3], {}, 1.3);
  }
  put(bx(1.8, 0.1, 0.08), ARMOUR, [0, 2.4, 0.5]);
  decal(T_VENT, 0.5, 0.3, [0.6, 2.357, 0.2], [0, 1, 0], 1.2, { up: [0, 0, 1] });

  // side plates
  const plateZ = [0.05, -0.9, -1.85, -2.8];
  const bolts: [THREE.BufferGeometry, V, V?][] = [];
  for (const s of [1, -1]) {
    plateZ.forEach((z) => {
      put(bx(0.07, 0.8, 0.85), ARMOUR, [s * 0.985, 1.85, z]);
      for (const dy of [-0.34, 0.34]) for (const dz of [-0.36, 0.36]) bolts.push([cy(0.022, 0.03, 6), [s * 1.03, 1.85 + dy, z + dz], [0, 0, 90]]);
    });
    put(bx(0.1, 0.04, 3.95), HAZ, [s * 0.985, 1.42, -1.4]);
    decal(T_SCREEN, 0.6, 0.38, [s * 1.025, 1.95, 0.05], [s, 0, 0], 1.2);
    for (const [i, col] of [C.amber, C.green, C.red].entries()) neon(bx(0.02, 0.05, 0.07), col, [s * 1.03, 1.62, -0.1 + i * 0.15], {}, 1.4);
    decal(T_EMBLEM, 0.62, 0.62, [s * 1.025, 1.9, -0.9], [s, 0, 0], 1.3);
    decal(T_MARK, 0.8, 0.4, [s * 1.025, 1.9, -1.85], [s, 0, 0], 0.4);
    decal(T_TAG, 0.8, 0.3, [s * 1.025, 1.95, -2.8], [s, 0, 0], 1.5);
    put(bx(0.02, 0.12, 0.8), HAZ, [s * 1.03, 1.58, -2.8]);
    // lockers
    put(bx(0.22, 0.46, 0.7), ARMOUR, [s * 1.06, 1.13, 0.2]);
    put(bx(0.04, 0.08, 0.14), C.steelLt, [s * 1.18, 1.2, 0.2]);
    neon(bx(0.02, 0.03, 0.5), C.amber, [s * 1.18, 0.95, 0.2], {}, 1.0);
  }
  b.part(mergeGeometries(bolts.map(([g, p, r]) => place(g, p, r)))!, C.steelLt, { bone: chassis, at: [0, 0, 0], flat: true });

  // ---------------------------------------------------------------- rear
  for (const s of [1, -1]) {
    const rj = b.joint(s > 0 ? "rearDoorL" : "rearDoorR", { parent: chassis, at: [s * 0.94, 1.47, -3.6], dir: [0, 1, 0], role: "hinge" });
    b.part(bx(0.9, 1.0, 0.08), HULL, { bone: rj, at: [s * 0.48, 1.47, -3.6] });
    b.part(plane(0.8, 0.9), "#ffffff", { bone: rj, at: [s * 0.48, 1.47, -3.645], dir: [0, 0, -1], axis: "z", texture: s > 0 ? T_REARA : T_REARB });
    glow(b.part(bx(0.02, 0.9, 0.02), C.pink, { bone: rj, at: [s * 0.06, 1.47, -3.655] }), 1.2);
    b.part(cy(0.02, 0.5, 6), C.steelLt, { bone: rj, at: [s * 0.12, 1.47, -3.66], flat: true });
    for (const y of [1.05, 1.47, 1.9]) b.part(cy(0.035, 0.14, 6), C.steel, { bone: rj, at: [s * 0.94, y, -3.6], flat: true });
    put(bx(0.1, 0.8, 0.14), C.gun, [s * 0.97, 1.5, -3.5]);
    neon(bx(0.04, 0.6, 0.02), C.red, [s * 0.97, 1.5, -3.58], {}, 1.8);
  }
  put(bx(2.0, 0.28, 0.3), HAZ, [0, 0.72, -3.7]);
  put(cy(0.05, 0.2, 8), C.steelLt, [0, 0.72, -3.9], { rotation: [90, 0, 0], flat: true });
  put(tor(0.07, 0.015, 8), C.steelLt, [0, 0.72, -3.98]);
  neon(bx(1.6, 0.05, 0.04), C.red, [0, 2.172, -3.4], {}, 1.8);

  // ---------------------------------------------------------------- remote weapon station
  const TZ = -0.75;
  const TY = 2.35;
  b.lathe([[0, 0], [0.52, 0], [0.52, 0.07], [0.44, 0.16], [0, 0.16]], { at: [0, TY, TZ], axis: [0, 1, 0], segments: 12, bone: chassis, color: ARMOUR });
  neon(tor(0.5, 0.012, 20), C.cyan, [0, TY + 0.075, TZ], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1] }, 1.2);
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, TY + 0.16, TZ], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, TY + 0.58, TZ], dir: [0, 0, 1], role: "hinge" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yp = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: yaw, at, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pp = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: pitch, at, ...o });
  yp(cy(0.4, 0.16, 12), ARMOUR, [0, TY + 0.24, TZ], { flat: true });
  yp(bx(0.78, 0.32, 0.8), ARMOUR, [0, TY + 0.4, TZ]);
  yp(bx(0.7, 0.3, 0.3), HULL, [0, TY + 0.44, TZ - 0.5]);
  for (const s of [1, -1]) {
    yp(bx(0.06, 0.34, 0.5), ARMOUR, [s * 0.4, TY + 0.55, TZ + 0.1], { rotation: [0, 0, s * 10] });
    yp(bx(0.2, 0.3, 0.2), C.gun2, [s * 0.18, TY + 0.82, TZ - 0.15]);
  }
  yp(bx(0.22, 0.3, 0.22), C.gun2, [0.3, TY + 0.7, TZ - 0.1]);
  yp(new THREE.SphereGeometry(0.1, 8, 6), C.gun, [0.3, TY + 0.9, TZ - 0.1], { flat: true });
  glow(yp(new THREE.SphereGeometry(0.045, 6, 4), C.red, [0.3, TY + 0.9, TZ + 0.0], { flat: true }), 2);
  b.spike([-0.3, TY + 0.7, TZ - 0.55], [0, 1, 0], 0.7, 0.012, C.steelLt, { bone: yaw, sides: 5 });
  pp(bx(0.5, 0.26, 0.5), C.gun2, [0, TY + 0.58, TZ + 0.15]);
  pp(bx(0.7, 0.34, 0.06), ARMOUR, [0, TY + 0.58, TZ + 0.42]);
  for (const s of [1, -1]) {
    const x = s * 0.14;
    b.rod([x, TY + 0.58, TZ - 0.25], [x, TY + 0.58, TZ + 1.35], 0.04, GUNM, { bone: pitch, sides: 8 });
    pp(cy(0.07, 0.6, 8), GUNM, [x, TY + 0.58, TZ + 0.75], { rotation: [90, 0, 0], flat: true });
    for (const dz of [0.55, 0.7, 0.85]) pp(bx(0.1, 0.012, 0.035), C.ink, [x, TY + 0.655, TZ + dz]);
    b.frustumBox([x, TY + 0.58, TZ + 1.3], [x, TY + 0.58, TZ + 1.45], [0.12, 0.12], [0.08, 0.08], { bone: pitch, color: C.gun });
    pp(bx(0.28, 0.3, 0.4), HAZ, [s * 0.38, TY + 0.55, TZ + 0.1]);
    b.sweep(catmull([[s * 0.34, TY + 0.68, TZ + 0.3], [s * 0.28, TY + 0.74, TZ + 0.38], [s * 0.2, TY + 0.62, TZ + 0.38]]), 0.02, C.brass, { bone: pitch, sides: 5 });
  }
  glow(pp(bx(0.04, 0.04, 0.06), C.red, [0, TY + 0.76, TZ + 0.3]), 2);

  // ---------------------------------------------------------------- missile pods
  for (const s of [1, -1]) {
    const px = s * 0.68;
    put(bx(0.4, 0.2, 0.4), ARMOUR, [px, 2.45, -2.05]);
    const pj = b.joint(s > 0 ? "podL" : "podR", { parent: chassis, at: [px, 2.62, -2.05], dir: [0, 0, 1], role: "hinge" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pd = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: pj, at, ...o });
    pd(bx(0.42, 0.38, 0.9), HULL, [px, 2.78, -1.7]);
    pd(bx(0.46, 0.06, 0.4), HAZ, [px, 2.99, -1.9]);
    for (const dx of [-0.13, 0, 0.13])
      for (const dy of [-0.08, 0.1]) {
        pd(cy(0.05, 0.04, 8), C.ink, [px + dx, 2.78 + dy, -1.25], { dir: [0, 0, 1], flat: true });
        b.spike([px + dx, 2.78 + dy, -1.26], [0, 0, 1], 0.11, 0.042, C.nose, { bone: pj, sides: 8 });
      }
    glow(pd(bx(0.3, 0.02, 0.02), C.amber, [px, 2.6, -1.24]), 1.2);
    b.pose(pj, { axis: [1, 0, 0], deg: -28 });
  }

  // ---------------------------------------------------------------- drone pad
  put(bx(1.1, 0.05, 1.1), ARMOUR, [0, 2.375, -2.75]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) neon(cy(0.035, 0.03, 6), C.green, [sx * 0.5, 2.405, -2.75 + sz * 0.5], { flat: true }, 1.6);
  const dyy = 2.58;
  put(bx(0.3, 0.1, 0.34), C.gun2, [0, dyy, -2.75]);
  put(new THREE.SphereGeometry(0.14, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.gun, [0, dyy + 0.05, -2.75], { flat: true });
  neon(bx(0.12, 0.04, 0.02), C.cyan, [0, dyy + 0.02, -2.58], {}, 1.8);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const mx = sx * 0.34;
      const mz = -2.75 + sz * 0.34;
      pipe([sx * 0.1, dyy, -2.75 + sz * 0.1], [mx, dyy + 0.03, mz], 0.014, C.gun, { sides: 4 });
      put(cy(0.04, 0.06, 6), C.steel, [mx, dyy + 0.05, mz], { flat: true });
      put(cy(0.17, 0.01, 12), "#10161d", [mx, dyy + 0.1, mz], { flat: true });
      neon(tor(0.17, 0.008, 14), C.cyan, [mx, dyy + 0.1, mz], { rotation: [90, 0, 0] }, 1.2);
      pipe([mx, dyy + 0.03, mz], [mx * 0.9, 2.41, -2.75 + sz * 0.3], 0.012, C.gun, { sides: 4 });
    }

  // ---------------------------------------------------------------- antennas, radar
  b.spike([0.84, 2.35, -3.0], [0, 1, 0], 1.0, 0.014, C.steelLt, { bone: chassis, sides: 5 });
  neon(new THREE.SphereGeometry(0.03, 6, 4), C.red, [0.84, 3.37, -3.0], { flat: true }, 2);
  for (const [i, z] of [-2.8, -3.0, -3.2].entries()) b.spike([-0.84, 2.35, z], [0, 1, 0], 0.5 + i * 0.12, 0.012, C.steelLt, { bone: chassis, sides: 4 });
  put(bx(0.1, 0.06, 0.5), C.gun, [-0.84, 2.38, -3.0]);
  put(cy(0.06, 0.3, 8), C.steel, [-0.75, 2.5, 0.15], { flat: true });
  const radar = b.joint("radarYaw", { parent: chassis, at: [-0.75, 2.65, 0.15], dir: [0, 1, 0], role: "hinge" });
  b.lathe([[0, 0], [0.26, 0.1], [0.26, 0.12], [0, 0.04]], { at: [-0.75, 2.78, 0.17], axis: [0, 0.7, 0.7], segments: 12, bone: radar, color: STEELP });
  b.part(cy(0.04, 0.08, 6), C.gun, { bone: radar, at: [-0.75, 2.78, 0.17], dir: [0, 0.7, 0.7], flat: true });
  b.rod([-0.75, 2.8, 0.19], [-0.75, 3.04, 0.37], 0.012, C.steelLt, { bone: radar, sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), C.amber, { bone: radar, at: [-0.75, 3.04, 0.37], flat: true }), 2);

  return b.root;
}
```