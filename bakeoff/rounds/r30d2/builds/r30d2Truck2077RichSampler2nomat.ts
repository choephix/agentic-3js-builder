import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, mix, noise, smoothstep, rgb, svg, catmull, polyline } from "../../../../src/index";
import type { Builder, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "WARDOG 2077",
  description:
    "Six-wheel armoured corpo-military recon truck: angular wedge hull, railgun roof turret, missile pods, neon trim, drone pad, stencilled unit markings.",
};

// ------------------------------------------------------------------ constants
const D = Math.PI / 180;
type V = [number, number, number];
type O = { glow?: number; scale?: V };

const C = {
  black: "#05070b",
  dark: "#0e1219",
  gun: "#1b222d",
  gun2: "#2a3342",
  plate: "#3d4a5f",
  steel: "#7a889c",
  light: "#aebbd0",
  rubber: "#171a20",
  orange: "#ff7a18",
  yellow: "#ffd21f",
  cyan: "#27f2ff",
  mag: "#ff2bd6",
  red: "#ff2a3c",
  glass: "#08222e",
  white: "#e8f2ff",
  green: "#45ff90",
  copper: "#c0682a",
};

const HUB_Y = 0.59;
const TRACK = 1.34;
const AXLES = [2.4, -0.5, -2.1];

// ------------------------------------------------------------------ merged local assemblies
// Collects primitives in a local frame, merges them by colour and places them as a few parts on one bone.
class Asm {
  private items: { geo: THREE.BufferGeometry; color: string; glow: number }[] = [];

  private put(geo: THREE.BufferGeometry, color: string, pos: V, rot: V, o: O) {
    const sc: V = o.scale ?? [1, 1, 1];
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D, "XYZ")),
      new THREE.Vector3(sc[0], sc[1], sc[2]),
    );
    geo.applyMatrix4(m);
    this.items.push({ geo, color, glow: o.glow ?? 0 });
    return this;
  }
  add(geo: THREE.BufferGeometry, color: string, pos: V = [0, 0, 0], rot: V = [0, 0, 0], o: O = {}) {
    return this.put(geo, color, pos, rot, o);
  }
  box(w: number, h: number, d: number, color: string, pos: V, rot: V = [0, 0, 0], o: O = {}) {
    return this.put(new THREE.BoxGeometry(w, h, d), color, pos, rot, o);
  }
  cyl(r: number, h: number, seg: number, color: string, pos: V, rot: V = [0, 0, 0], o: O = {}) {
    return this.put(new THREE.CylinderGeometry(r, r, h, seg), color, pos, rot, o);
  }
  cone(r: number, h: number, seg: number, color: string, pos: V, rot: V = [0, 0, 0], o: O = {}) {
    return this.put(new THREE.ConeGeometry(r, h, seg), color, pos, rot, o);
  }
  sph(r: number, color: string, pos: V, o: O = {}) {
    return this.put(new THREE.SphereGeometry(r, 8, 6), color, pos, [0, 0, 0], o);
  }
  tor(R: number, r: number, seg: number, color: string, pos: V, rot: V = [0, 0, 0], o: O = {}) {
    return this.put(new THREE.TorusGeometry(R, r, 5, seg), color, pos, rot, o);
  }
  rod(a: V, c: V, r: number, color: string, seg = 6, o: O = {}) {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const len = A.distanceTo(B);
    const geo = new THREE.CylinderGeometry(r, r, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    geo.applyMatrix4(m);
    this.items.push({ geo, color, glow: o.glow ?? 0 });
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build(b: Builder, opts: any) {
    const groups = new Map<string, THREE.BufferGeometry[]>();
    for (const it of this.items) {
      const key = `${it.color}|${it.glow}`;
      const list = groups.get(key) ?? [];
      list.push(it.geo);
      groups.set(key, list);
    }
    for (const [key, list] of groups) {
      const [color, g] = key.split("|");
      const merged = mergeGeometries(list, false);
      if (!merged) throw new Error(`Asm merge failed for ${key}`);
      const part = b.part(merged, color, { flat: true, at: [0, 0, 0], ...opts });
      if (Number(g) > 0) glow(part, Number(g));
    }
    this.items = [];
  }
}

// ------------------------------------------------------------------ paints
function hullPaint(a: string, c: string, seed: number) {
  return paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const cu = 0.72;
    const cv = 0.52;
    const fu = ((u % cu) + cu) % cu;
    const fv = ((v % cv) + cv) % cv;
    const pid = Math.abs(Math.floor(u / cu) * 31 + Math.floor(v / cv) * 17 + seed);
    const tint = ((pid * 2654435761) % 1000) / 1000;
    let col = mix(a, c, 0.15 + 0.3 * tint + 0.35 * noise(p, 0.6, seed));
    col = mix(col, "#8f9bb0", smoothstep(0.66, 0.8, noise(p, 0.09, seed + 5)) * 0.5);
    col = mix(
      col,
      "#b4541a",
      smoothstep(0.78, 0.84, noise(p, 0.05, seed + 8)) * smoothstep(1.7, 0.9, p.y) * 0.6,
    );
    col = mix(col, "#07090d", 0.45 * smoothstep(1.4, 0.6, p.y) + 0.1 * smoothstep(0.2, -0.9, n.y));
    col = mix(col, "#cfe0ff", 0.12 * smoothstep(0.5, 1, n.y));
    if (ax > 0.6) {
      if (Math.abs(p.y - 1.42) < 0.035) col = rgb("#ff7a18");
      else if (Math.abs(p.y - 1.34) < 0.008) col = rgb("#27f2ff");
    }
    if (fu < 0.014 || fv < 0.014) col = mix(col, "#05070b", 0.85);
    else if (fu < 0.03 || fv < 0.03) col = mix(col, "#aab6ca", 0.14);
    return col;
  });
}

// ------------------------------------------------------------------ SVG textures
const emblemSvg = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
<polygon points="64,5 118,34 118,94 64,123 10,94 10,34" fill="#0e1219" stroke="#ff7a18" stroke-width="7" stroke-linejoin="round"/>
<polygon points="64,19 105,41 105,87 64,109 23,87 23,41" fill="none" stroke="#27f2ff" stroke-width="3"/>
<path d="M30 38 L50 54 L78 54 L98 38 L95 70 L79 98 L64 106 L49 98 L33 70 Z" fill="#e8f2ff"/>
<path d="M43 66 L59 72 L58 80 L41 75 Z" fill="#ff2bd6"/>
<path d="M85 66 L69 72 L70 80 L87 75 Z" fill="#ff2bd6"/>
<path d="M64 80 L57 94 L71 94 Z" fill="#0e1219"/>
<path d="M52 98 L52 104 M58 100 L58 106 M64 101 L64 107 M70 100 L70 106 M76 98 L76 104" stroke="#0e1219" stroke-width="3"/>
<path d="M30 38 L22 28 M98 38 L106 28" stroke="#ff7a18" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const sideSvg = () => {
  let hz = "";
  let bc = "";
  for (let i = 0; i < 16; i++)
    hz += `<polygon points="${i * 18 - 6},117 ${i * 18 + 6},117 ${i * 18 + 22},92 ${i * 18 + 10},92" fill="#0b0e14"/>`;
  for (let i = 0; i < 26; i++)
    bc += `<rect x="${196 + i * 3}" y="14" width="${1 + ((i * 7) % 3)}" height="20" fill="#e8f2ff"/>`;
  return `<svg viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
<rect x="3" y="3" width="274" height="114" rx="6" fill="#10151d" stroke="#ff7a18" stroke-width="3"/>
<rect x="3" y="92" width="274" height="25" fill="#ffd21f"/>${hz}
<rect x="3" y="88" width="274" height="4" fill="#0b0e14"/>
<text x="14" y="62" font-family="Arial Black, Impact, sans-serif" font-size="40" font-weight="900" fill="#e8f2ff">WARDOG</text>
<text x="16" y="80" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#27f2ff" letter-spacing="2.4">HEAVY RECON // UNIT 07 // 2077</text>
<text x="16" y="30" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#ff7a18" letter-spacing="2">VANTA ARMS DIVISION</text>
${bc}
<circle cx="248" cy="62" r="13" fill="none" stroke="#ff2bd6" stroke-width="3"/>
<path d="M238 62 H258 M248 52 V72" stroke="#ff2bd6" stroke-width="2.5"/>
<path d="M170 50 L190 50 L196 58 L214 58" fill="none" stroke="#27f2ff" stroke-width="2.5"/>
</svg>`;
};

const neonSvg = `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
<rect x="5" y="5" width="230" height="50" rx="12" fill="none" stroke="#27f2ff" stroke-width="3.2"/>
<text x="120" y="41" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="30" font-weight="900" fill="none" stroke="#ff2bd6" stroke-width="2.6">NO QUARTER</text>
<path d="M14 50 H40 M200 10 H226" stroke="#ffd21f" stroke-width="3"/>
</svg>`;

const hudSvg = `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
<circle cx="90" cy="50" r="22" fill="none" stroke="#27f2ff" stroke-width="1.7"/>
<circle cx="90" cy="50" r="3" fill="#ff2bd6"/>
<path d="M90 20 V32 M90 68 V80 M60 50 H72 M108 50 H120" stroke="#27f2ff" stroke-width="1.7"/>
<path d="M8 8 H28 M8 8 V28 M172 8 H152 M172 8 V28 M8 92 H28 M8 92 V72 M172 92 H152 M172 92 V72" stroke="#27f2ff" stroke-width="2" fill="none"/>
<path d="M20 70 H60 L66 62 H100" stroke="#ff2bd6" stroke-width="1.6" fill="none"/>
<path d="M130 30 H160 M130 36 H150 M130 42 H156" stroke="#45ff90" stroke-width="1.6"/>
<text x="14" y="87" font-family="monospace" font-size="7" font-weight="700" fill="#27f2ff">TGT 0412M  VEL 118  LOCK</text>
</svg>`;

const radarSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="30" fill="#04140a" stroke="#45ff90" stroke-width="2.5"/>
<circle cx="32" cy="32" r="20" fill="none" stroke="#45ff90" stroke-width="1.3"/>
<circle cx="32" cy="32" r="10" fill="none" stroke="#45ff90" stroke-width="1.3"/>
<path d="M32 2 V62 M2 32 H62" stroke="#45ff90" stroke-width="1.2"/>
<path d="M32 32 L58 18 A30 30 0 0 0 52 11 Z" fill="#45ff90" opacity="0.65"/>
<circle cx="44" cy="42" r="2.4" fill="#ff2a3c"/><circle cx="21" cy="22" r="2" fill="#ff2a3c"/><circle cx="40" cy="20" r="1.8" fill="#ffd21f"/>
</svg>`;

const hazardSvg = (() => {
  let s = "";
  for (let i = 0; i < 9; i++)
    s += `<polygon points="${i * 16 - 12},24 ${i * 16 - 4},24 ${i * 16 + 8},0 ${i * 16},0" fill="#0b0e14"/>`;
  return `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="24" fill="#ffd21f"/>${s}</svg>`;
})();

const warnSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<polygon points="32,4 61,56 3,56" fill="#ffd21f" stroke="#0b0e14" stroke-width="5" stroke-linejoin="round"/>
<rect x="29" y="22" width="6" height="19" fill="#0b0e14"/><rect x="29" y="45" width="6" height="6" fill="#0b0e14"/>
</svg>`;

const plateSvg = `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="118" height="38" rx="5" fill="#e8f2ff" stroke="#0e1219" stroke-width="2"/>
<rect x="5" y="5" width="110" height="30" rx="3" fill="none" stroke="#2548d8" stroke-width="1.5"/>
<text x="60" y="29" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="22" font-weight="900" fill="#0e1219">WD-2077</text>
</svg>`;

// ------------------------------------------------------------------ outlines (z, y side views)
const TUB: [number, number][] = [
  [-3.35, 1.0],
  [-3.2, 0.85],
  [3.1, 0.85],
  [3.45, 1.15],
  [3.45, 1.68],
  [3.3, 1.78],
  [-3.35, 1.78],
];
const CAB: [number, number][] = [
  [0.15, 1.78],
  [0.15, 3.0],
  [0.3, 3.08],
  [1.45, 3.08],
  [2.45, 2.32],
  [3.3, 2.17],
  [3.42, 1.95],
  [3.42, 1.78],
];
const CARGO: [number, number][] = [
  [-3.35, 1.78],
  [-3.35, 2.95],
  [-3.0, 3.35],
  [0.15, 3.35],
  [0.15, 1.78],
];
const DOOR: [number, number][] = [
  [0.55, 1.97],
  [0.55, 2.98],
  [1.4, 3.02],
  [2.0, 2.55],
  [2.0, 1.97],
];
const WIN: [number, number][] = [
  [0.72, 2.5],
  [0.72, 2.9],
  [1.36, 2.94],
  [1.85, 2.5],
];
const PLOUGH: [number, number][] = [
  [3.35, 0.9],
  [3.9, 1.0],
  [3.65, 1.4],
  [3.35, 1.4],
];
const TIRE_PROFILE: [number, number][] = [
  [0, -0.25],
  [0.4, -0.25],
  [0.52, -0.18],
  [0.55, -0.1],
  [0.55, 0.1],
  [0.52, 0.18],
  [0.4, 0.25],
  [0, 0.25],
];

function archOutline(zc: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = 180; a >= 0; a -= 30) pts.push([zc + 0.74 * Math.cos(a * D), HUB_Y + 0.74 * Math.sin(a * D)]);
  for (let a = 0; a <= 180; a += 30) pts.push([zc + 0.63 * Math.cos(a * D), HUB_Y + 0.63 * Math.sin(a * D)]);
  return pts;
}

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "wardog_2077", paintSize: 2048 });
  const rand = rng(2077);
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const HULL = hullPaint("#2b3342", "#3a4659", 3);
  const HULL_DARK = hullPaint("#171d27", "#262e3d", 9);
  const TIREP = paint((p, n) => mix("#14161b", "#2a2e38", noise(p, 0.06, 4) * (0.4 + 0.6 * Math.max(n.y, 0))));

  const T = {
    emblem: svg(emblemSvg, { size: 384 }),
    side: svg(sideSvg(), { size: 1024 }),
    neon: svg(neonSvg, { size: 768 }),
    hud: svg(hudSvg, { size: 640 }),
    radar: svg(radarSvg, { size: 256 }),
    hazard: svg(hazardSvg, { size: 512 }),
    warn: svg(warnSvg, { size: 128 }),
    plate: svg(plateSvg, { size: 256 }),
  };

  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: V,
    dir: V,
    o: { up?: V; g?: number; bone?: Joint } = {},
  ) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: o.bone ?? chassis,
      at,
      dir,
      axis: "z",
      up: o.up ?? [0, 1, 0],
      texture: tex,
    });
    if (o.g) glow(p, o.g);
    return p;
  };

  const S = new Asm(); // static model-space greebles on the chassis bone

  // ================================================================ hull bodies
  b.extrude(TUB, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.03, color: HULL, bone: chassis });
  b.extrude(CAB, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, bevel: 0.03, color: HULL, bone: chassis });
  b.extrude(CARGO, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.03, color: HULL, bone: chassis });
  b.extrude(PLOUGH, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.025, color: HULL_DARK, bone: chassis });

  // fenders + neon arch trim
  for (const s of [1, -1])
    for (const z of AXLES) {
      b.extrude(archOutline(z), {
        at: [s * TRACK, 0, 0],
        x: [0, 0, 1],
        thickness: 0.52,
        bevel: 0.02,
        color: HULL_DARK,
        bone: chassis,
      });
      const arc: V[] = [];
      for (let a = 180; a >= 0; a -= 30)
        arc.push([s * (TRACK + 0.265), HUB_Y + 0.77 * Math.sin(a * D), z + 0.77 * Math.cos(a * D)]);
      glow(b.sweep(catmull(arc), 0.016, C.mag, { bone: chassis, sides: 5 }), 1.2);
      // mud flap
      S.box(0.5, 0.42, 0.05, C.rubber, [s * TRACK, 0.9, z - 0.74]);
      S.box(0.5, 0.05, 0.055, C.orange, [s * TRACK, 1.05, z - 0.74]);
    }

  // ================================================================ running gear
  for (const z of AXLES) {
    S.rod([-(TRACK - 0.2), HUB_Y, z], [TRACK - 0.2, HUB_Y, z], 0.09, C.gun2, 8);
    S.sph(0.24, C.plate, [0, HUB_Y, z], { scale: [1, 1, 1.15] });
    S.cyl(0.09, 0.1, 6, C.orange, [0, HUB_Y, z + 0.25], [90, 0, 0]);
    for (const s of [1, -1]) {
      for (let k = 0; k < 3; k++) S.box(0.12, 0.04, 1.25 - k * 0.3, C.steel, [s * 0.8, 0.72 + k * 0.045, z]);
      S.box(0.18, 0.05, 0.16, C.dark, [s * 0.8, 0.82, z]);
      S.rod([s * 0.95, 0.65, z - 0.22], [s * 0.88, 0.97, z - 0.12], 0.05, C.orange, 6);
      S.rod([s * 0.95, 0.65, z + 0.22], [s * 0.88, 0.97, z + 0.12], 0.05, C.orange, 6);
      S.rod([s * 0.6, 0.6, z], [s * (TRACK - 0.15), 0.45, z], 0.03, C.steel, 5);
    }
  }
  S.rod([0, 0.62, AXLES[0]], [0, 0.62, AXLES[2]], 0.05, C.steel, 8);
  S.box(1.6, 0.06, 2.5, C.dark, [0, 0.82, 1.4]);
  S.box(1.4, 0.06, 1.6, C.dark, [0, 0.82, -1.5]);
  S.rod([-0.9, 0.73, AXLES[0]], [0.9, 0.73, AXLES[0] + 0.4], 0.03, C.steel, 5); // steering link

  // wheels
  const wheel = (name: string, s: number, z: number, parent: Joint) => {
    const hub: V = [s * TRACK, HUB_Y, z];
    const spin = b.joint(name, { parent, at: hub, dir: [s, 0, 0], role: "hinge" });
    b.lathe(TIRE_PROFILE, { at: hub, axis: [s, 0, 0], segments: 14, bone: spin, color: TIREP });
    const w = new Asm();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 360;
      w.box(0.075, 0.46, 0.15, "#1d2027", [0.555 * Math.cos(a * D), 0, 0.555 * Math.sin(a * D)], [0, -a, 0]);
      const a2 = a + 11.25;
      for (const y of [-0.2, 0.2])
        w.box(0.1, 0.12, 0.14, "#1d2027", [0.52 * Math.cos(a2 * D), y, 0.52 * Math.sin(a2 * D)], [0, -a2, 0]);
    }
    w.cyl(0.36, 0.06, 14, C.plate, [0, 0.28, 0]);
    w.tor(0.345, 0.025, 14, C.steel, [0, 0.31, 0], [90, 0, 0]);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 360;
      w.cyl(0.022, 0.05, 5, C.steel, [0.3 * Math.cos(a * D), 0.33, 0.3 * Math.sin(a * D)]);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * 360;
      w.box(0.2, 0.025, 0.06, C.gun, [0.2 * Math.cos(a * D), 0.315, 0.2 * Math.sin(a * D)], [0, -a, 0]);
    }
    w.cyl(0.13, 0.1, 8, C.gun2, [0, 0.33, 0]);
    w.cyl(0.07, 0.04, 8, C.orange, [0, 0.39, 0]);
    w.tor(0.25, 0.012, 16, C.cyan, [0, 0.32, 0], [90, 0, 0], { glow: 1.2 });
    w.build(b, { bone: spin, at: hub, dir: [s, 0, 0] });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const steer = b.joint(`steer${side}`, {
      parent: chassis,
      at: [s * TRACK, HUB_Y, AXLES[0]],
      dir: [0, 1, 0],
      role: "hinge",
    });
    wheel(`wheelF${side}`, s, AXLES[0], steer);
    wheel(`wheelM${side}`, s, AXLES[1], chassis);
    wheel(`wheelR${side}`, s, AXLES[2], chassis);
  }

  // ================================================================ underglow, power cells, steps
  for (const s of [1, -1]) {
    S.box(0.05, 0.03, 5.8, C.mag, [s * 0.9, 0.835, 0], [0, 0, 0], { glow: 1.3 });
    S.box(0.34, 0.05, 1.0, C.steel, [s * 1.27, 1.42, 0.95]);
    S.rod([s * 1.1, 1.4, 0.5], [s * 1.2, 1.42, 0.5], 0.02, C.dark, 5);
    S.rod([s * 1.1, 1.4, 1.4], [s * 1.2, 1.42, 1.4], 0.02, C.dark, 5);
    S.box(0.2, 0.38, 1.15, C.gun2, [s * 1.2, 1.13, 0.9]);
    S.box(0.22, 0.05, 1.2, C.orange, [s * 1.2, 1.34, 0.9]);
    for (let i = 0; i < 6; i++)
      S.box(0.02, 0.26, 0.05, C.cyan, [s * 1.305, 1.12, 0.42 + i * 0.18], [0, 0, 0], { glow: 1.1 });
    // cargo side lower neon + frame around the stencil panel
    S.box(0.02, 0.025, 3.2, C.cyan, [s * 1.205, 1.9, -1.6], [0, 0, 0], { glow: 1.1 });
    S.box(0.03, 0.03, 2.5, C.dark, [s * 1.215, 2.86, -1.9]);
    S.box(0.03, 0.03, 2.5, C.dark, [s * 1.215, 1.8 + 0.02 + 0.0 + 0.02, -1.9]);
    S.box(0.03, 1.1, 0.04, C.orange, [s * 1.215, 2.32, -3.12]);
    S.box(0.03, 1.1, 0.04, C.orange, [s * 1.215, 2.32, -0.68]);
    // grab rails
    S.rod([s * 1.25, 2.0, -0.12], [s * 1.25, 2.9, -0.12], 0.025, C.steel, 6);
    S.rod([s * 1.2, 2.0, -0.12], [s * 1.25, 2.0, -0.12], 0.02, C.steel, 5);
    S.rod([s * 1.2, 2.9, -0.12], [s * 1.25, 2.9, -0.12], 0.02, C.steel, 5);
  }
  decal(T.side, 2.4, 1.029, [1.215, 2.32, -1.9], [1, 0, 0]);
  decal(T.side, 2.4, 1.029, [-1.215, 2.32, -1.9], [-1, 0, 0]);
  decal(T.neon, 2.0, 0.5, [1.215, 3.04, -1.9], [1, 0, 0], { g: 1.4 });
  decal(T.neon, 2.0, 0.5, [-1.215, 3.04, -1.9], [-1, 0, 0], { g: 1.4 });
  decal(T.radar, 0.5, 0.5, [1.215, 2.3, -0.42], [1, 0, 0], { g: 1 });
  decal(T.radar, 0.5, 0.5, [-1.215, 2.3, -0.42], [-1, 0, 0], { g: 1 });

  // ================================================================ front fascia
  for (const s of [1, -1]) {
    S.box(0.56, 0.09, 0.06, C.white, [s * 0.78, 1.52, 3.47], [0, 0, 0], { glow: 1.5 });
    S.box(0.64, 0.025, 0.05, C.orange, [s * 0.78, 1.65, 3.48], [0, 0, 0], { glow: 1.2 });
    S.box(0.7, 0.06, 0.2, C.dark, [s * 0.78, 1.62, 3.52], [22, 0, 0]);
    S.box(0.3, 0.05, 0.06, C.orange, [s * 0.9, 1.18, 3.47], [0, 0, 0], { glow: 1.1 });
    S.box(0.04, 0.35, 0.3, C.gun2, [s * 0.52, 1.35, 3.55]);
    for (let i = 0; i < 3; i++) S.cyl(0.045, 0.04, 8, C.white, [s * (0.55 + i * 0.17), 1.33, 3.47], [90, 0, 0], { glow: 1.2 });
  }
  S.box(1.0, 0.52, 0.08, C.dark, [0, 1.38, 3.47]);
  for (let i = 0; i < 5; i++) S.box(0.9, 0.03, 0.03, C.cyan, [0, 1.19 + i * 0.1, 3.52], [0, 0, 0], { glow: 1.1 });
  S.box(0.05, 0.5, 0.04, C.orange, [0, 1.38, 3.53]);
  S.box(1.3, 0.16, 0.06, C.black, [0, 1.0, 3.47]);
  for (let i = 0; i < 7; i++)
    S.cone(0.07, 0.28, 4, C.steel, [-1.0 + i * 0.333, 0.95, 3.95], [90, 0, 0]);
  for (const s of [1, -1]) {
    S.cyl(0.05, 0.4, 6, C.orange, [s * 0.5, 1.12, 3.78], [90, 0, 0]);
    S.tor(0.07, 0.02, 8, C.steel, [s * 0.5, 0.97, 3.93]);
  }
  S.cyl(0.1, 0.8, 8, C.gun2, [0, 1.2, 3.75], [0, 0, 90]); // winch drum
  decal(T.hazard, 2.2, 0.44, [0, 1.2, 3.775], [0, 0.53, 0.848], { up: [0, 0.848, -0.53] });
  // hood
  const hoodY = (z: number) => 2.32 - (z - 2.45) * 0.1765;
  for (const s of [1, -1]) {
    const v = new Asm();
    v.box(0.46, 0.03, 0.46, C.black, [0, 0, 0]);
    for (let i = 0; i < 4; i++) v.box(0.38, 0.012, 0.03, C.orange, [0, 0.02, -0.15 + i * 0.1], [0, 0, 0], { glow: 1.2 });
    v.build(b, { bone: chassis, at: [s * 0.62, hoodY(2.85) + 0.015, 2.85], rotation: [10, 0, 0] });
  }
  S.box(0.12, 0.04, 0.85, C.gun2, [0, hoodY(2.88) + 0.02, 2.88], [10, 0, 0]);
  decal(T.emblem, 0.46, 0.46, [0, hoodY(3.12) + 0.014, 3.12], [0, 0.985, 0.174], { up: [0, 0, -1] });

  // ================================================================ windscreen
  const wsN: V = [0, 0.796, 0.605];
  b.part(new THREE.BoxGeometry(1.9, 0.05, 1.22), C.glass, { bone: chassis, at: [0, 2.716, 1.962], dir: wsN });
  decal(T.hud, 1.8, 1.0, [0, 2.752, 1.989], wsN, { up: [0, 0.605, -0.796], g: 1.1 });
  for (const s of [1, -1]) {
    S.rod([s * 0.99, 3.1, 1.43], [s * 0.99, 2.34, 2.45], 0.04, C.dark, 6);
    S.rod([s * 0.5, 2.42, 2.39], [s * 0.05, 2.58, 2.27], 0.012, C.black, 4); // wipers
  }
  S.rod([-0.98, 3.1, 1.43], [0.98, 3.1, 1.43], 0.04, C.dark, 6);
  S.rod([-0.98, 2.34, 2.45], [0.98, 2.34, 2.45], 0.04, C.dark, 6);

  // ================================================================ doors
  for (const s of [1, -1]) {
    const dj = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: chassis,
      at: [s * 1.08, 2.3, 2.0],
      dir: [0, 1, 0],
      role: "hinge",
    });
    b.extrude(DOOR, { at: [s * 1.08, 0, 0], x: [0, 0, 1], thickness: 0.08, bevel: 0.015, color: HULL, bone: dj });
    b.extrude(WIN, { at: [s * 1.08, 0, 0], x: [0, 0, 1], thickness: 0.1, color: C.glass, bone: dj });
    const d = new Asm();
    d.box(0.04, 0.05, 0.22, C.steel, [s * 1.14, 2.35, 0.75]);
    for (let i = 0; i < 6; i++) d.rod([s * 1.2, 2.48, 0.75 + i * 0.2], [s * 1.2, 2.92, 0.75 + i * 0.2], 0.014, C.gun2, 5);
    d.rod([s * 1.2, 2.92, 0.7], [s * 1.2, 2.92, 1.8], 0.02, C.gun2, 5);
    d.rod([s * 1.2, 2.48, 0.7], [s * 1.2, 2.48, 1.85], 0.02, C.gun2, 5);
    d.rod([s * 1.12, 2.5, 0.72], [s * 1.2, 2.5, 0.72], 0.015, C.dark, 4);
    d.rod([s * 1.12, 2.5, 1.8], [s * 1.2, 2.5, 1.8], 0.015, C.dark, 4);
    d.rod([s * 1.1, 2.55, 1.9], [s * 1.45, 2.7, 1.95], 0.02, C.steel, 5);
    d.rod([s * 1.1, 2.4, 1.9], [s * 1.45, 2.68, 1.95], 0.02, C.steel, 5);
    d.box(0.12, 0.3, 0.22, C.gun, [s * 1.5, 2.72, 1.95]);
    d.box(0.02, 0.24, 0.16, C.glass, [s * 1.5, 2.72, 1.835]);
    d.box(0.05, 0.05, 0.02, C.red, [s * 1.5, 2.88, 2.07], [0, 0, 0], { glow: 1.4 });
    d.box(0.015, 0.02, 1.35, C.cyan, [s * 1.125, 2.06, 1.25], [0, 0, 0], { glow: 1.2 });
    d.box(0.03, 0.4, 0.04, C.orange, [s * 1.125, 2.28, 0.6]);
    d.build(b, { bone: dj });
    decal(T.emblem, 0.4, 0.4, [s * 1.125, 2.28, 1.25], [s, 0, 0], { bone: dj });
  }

  // ================================================================ cab roof
  S.box(1.7, 0.1, 0.16, C.dark, [0, 3.14, 1.25]);
  for (let i = 0; i < 6; i++)
    S.box(0.22, 0.06, 0.02, i === 0 || i === 5 ? C.orange : C.white, [-0.65 + i * 0.26, 3.14, 1.335], [0, 0, 0], { glow: 1.5 });
  for (const s of [1, -1]) {
    S.box(0.06, 0.08, 0.1, C.steel, [s * 0.8, 3.1, 1.25]);
    S.rod([s * 0.95, 3.08, 0.35], [s * 1.0, 4.1, 0.3], 0.012, C.steel, 4);
    S.sph(0.03, C.red, [s * 1.0, 4.1, 0.3], { glow: 1.5 });
    // smoke launchers
    const sm = new Asm();
    sm.box(0.34, 0.08, 0.4, C.gun2, [0, 0, 0]);
    for (let i = 0; i < 4; i++) {
      sm.cyl(0.04, 0.26, 6, C.plate, [-0.12 + i * 0.08, 0.14, 0.05], [50, 0, 0]);
      sm.cyl(0.03, 0.02, 6, C.black, [-0.12 + i * 0.08, 0.255, 0.165], [50, 0, 0]);
    }
    sm.build(b, { bone: chassis, at: [s * 0.9, 3.1, 0.62] });
  }
  S.cyl(0.04, 0.4, 6, C.steel, [-0.55, 3.28, 0.6]);
  S.rod([-0.55, 3.45, 0.6], [-0.46, 3.66, 0.86], 0.012, C.steel, 4);
  S.sph(0.03, C.red, [-0.46, 3.66, 0.86], { glow: 1.4 });
  S.add(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.glass, [0.55, 3.1, 0.75]);
  S.cyl(0.18, 0.04, 8, C.steel, [0.55, 3.09, 0.75]);
  S.sph(0.05, C.cyan, [0.55, 3.18, 0.85], { glow: 1.5 });
  b.lathe(
    [
      [0, 0],
      [0.32, 0.12],
      [0.32, 0.14],
      [0, 0.04],
    ],
    { at: [-0.55, 3.45, 0.6], axis: [0.25, 0.6, 0.75], segments: 12, bone: chassis, color: C.light },
  );

  // ================================================================ rear: tail lights, nozzles, hatch
  for (const s of [1, -1]) {
    S.box(0.55, 0.09, 0.05, C.red, [s * 0.72, 1.62, -3.37], [0, 0, 0], { glow: 1.4 });
    S.box(0.12, 0.09, 0.05, C.white, [s * 1.0, 1.3, -3.37], [0, 0, 0], { glow: 1.2 });
    S.cyl(0.11, 0.03, 10, C.cyan, [s * 0.62, 1.2, -3.5], [90, 0, 0], { glow: 1.4 });
    S.tor(0.2, 0.02, 10, C.steel, [s * 0.62, 1.2, -3.55]);
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.16, 0.1],
        [0.3, 0.4],
        [0.26, 0.4],
        [0.12, 0.12],
        [0, 0.14],
      ],
      { at: [s * 0.62, 1.2, -3.35], axis: [0, 0, -1], segments: 10, bone: chassis, color: C.steel },
    );
  }
  S.cyl(0.04, 0.3, 6, C.steel, [0, 1.05, -3.5], [90, 0, 0]);
  S.sph(0.06, C.steel, [0, 1.05, -3.68]);

  const hatch = b.joint("hatch", { parent: chassis, at: [0, 1.86, -3.38], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.BoxGeometry(2.3, 1.1, 0.08), HULL, { bone: hatch, at: [0, 2.42, -3.4] });
  const h = new Asm();
  h.box(2.3, 0.04, 0.05, C.cyan, [0, 2.94, -3.44], [0, 0, 0], { glow: 1.2 });
  for (const s of [1, -1]) {
    h.box(0.08, 1.0, 0.04, C.gun2, [s * 1.05, 2.42, -3.45]);
    h.box(0.2, 0.08, 0.06, C.steel, [s * 0.5, 2.1, -3.46]);
  }
  h.box(0.5, 0.06, 0.06, C.steel, [0, 2.78, -3.46]);
  for (let i = 0; i < 8; i++) h.cyl(0.018, 0.02, 5, C.steel, [-0.98 + i * 0.28, 1.93, -3.45], [90, 0, 0]);
  h.build(b, { bone: hatch });
  decal(T.hazard, 2.0, 0.4, [0, 2.1, -3.445], [0, 0, -1], { bone: hatch });
  decal(T.plate, 0.45, 0.15, [0, 2.55, -3.445], [0, 0, -1], { bone: hatch });
  decal(T.warn, 0.25, 0.25, [0.8, 2.6, -3.445], [0, 0, -1], { bone: hatch });
  decal(T.warn, 0.25, 0.25, [-0.8, 2.6, -3.445], [0, 0, -1], { bone: hatch });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.3), HULL_DARK, { bone: chassis, at: [0, 1.02, -3.2] });
  decal(T.side, 1.4, 0.6, [0, 1.35, -3.352], [0, 0, -1]);

  // ================================================================ cargo roof
  S.cyl(0.62, 0.08, 14, C.gun2, [0, 3.39, -1.2]);
  S.tor(0.6, 0.04, 14, C.steel, [0, 3.44, -1.2], [90, 0, 0]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 360;
    S.cyl(0.022, 0.03, 5, C.steel, [0.6 * Math.cos(a * D), 3.46, -1.2 + 0.6 * Math.sin(a * D)]);
  }
  decal(T.warn, 0.2, 0.2, [0, 3.436, -0.62], [0, 0.0, 1], { up: [0, 1, 0] });
  for (let i = 0; i < 12; i++)
    for (const s of [1, -1]) {
      const hh = 0.05 + rand() * 0.16;
      const ww = 0.1 + rand() * 0.14;
      const dd = 0.09 + rand() * 0.05;
      S.box(ww, hh, dd, i % 3 === 0 ? C.orange : i % 2 ? C.gun2 : C.plate, [s * (0.8 + rand() * 0.2), 3.35 + hh / 2, -3.1 + i * 0.11]);
    }
  for (const s of [1, -1]) {
    S.rod([s * 1.1, 3.38, -3.0], [s * 1.1, 3.38, 0.0], 0.015, C.cyan, 5, { glow: 1.2 });
    S.rod([s * 1.1, 3.38, 0.0], [s * 0.95, 3.38, 0.0], 0.015, C.cyan, 5, { glow: 1.2 });
    S.rod([s * 1.1, 3.3, -3.1], [s * 1.12, 4.3, -3.1], 0.012, C.steel, 4);
    S.sph(0.03, C.mag, [s * 1.12, 4.3, -3.1], { glow: 1.5 });
  }
  // rear slope panel
  S.box(1.7, 0.04, 0.55, C.gun, [0, 3.17, -3.17], [-49, 0, 0]);
  // mast
  S.cyl(0.07, 0.1, 8, C.dark, [1.0, 3.4, -2.0]);
  S.rod([1.0, 3.4, -2.0], [1.0, 4.8, -2.0], 0.018, C.steel, 5);
  S.rod([0.75, 4.55, -2.0], [1.25, 4.55, -2.0], 0.012, C.steel, 4);
  S.rod([0.8, 4.3, -2.0], [1.2, 4.3, -2.0], 0.012, C.steel, 4);
  S.sph(0.04, C.cyan, [1.0, 4.8, -2.0], { glow: 1.5 });

  // drone landing pad + drone
  S.box(1.3, 0.05, 1.3, C.gun2, [0, 3.375, -2.7]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) S.box(0.08, 0.03, 0.08, C.yellow, [sx * 0.6, 3.405, -2.7 + sz * 0.6], [0, 0, 0], { glow: 1.3 });
  S.tor(0.4, 0.015, 16, C.yellow, [0, 3.41, -2.7], [90, 0, 0], { glow: 1 });
  {
    const dr = new Asm();
    dr.box(0.3, 0.1, 0.36, C.plate, [0, 0, 0]);
    dr.sph(0.12, C.glass, [0, 0.05, 0.1], { scale: [1, 0.6, 1] });
    dr.sph(0.04, C.cyan, [0, 0.06, 0.2], { glow: 1.6 });
    dr.sph(0.035, C.red, [0, -0.07, 0.1], { glow: 1.5 });
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        dr.rod([0, 0.02, 0], [sx * 0.42, 0.04, sz * 0.42], 0.02, C.gun, 5);
        dr.cyl(0.04, 0.06, 6, C.gun2, [sx * 0.42, 0.06, sz * 0.42]);
        dr.cyl(0.2, 0.01, 12, C.light, [sx * 0.42, 0.1, sz * 0.42]);
        dr.rod([sx * 0.42, 0.0, sz * 0.42], [sx * 0.42, -0.1, sz * 0.42], 0.015, C.steel, 4);
        dr.sph(0.02, C.green, [sx * 0.42, 0.03, sz * 0.42 + sz * 0.06], { glow: 1.4 });
      }
    dr.build(b, { bone: chassis, at: [0, 3.55, -2.7] });
  }

  // ================================================================ missile pods
  for (const s of [1, -1]) {
    const pd = new Asm();
    pd.box(0.62, 0.5, 1.0, C.plate, [0, 0, 0]);
    pd.box(0.64, 0.05, 0.9, C.orange, [0, 0.27, -0.03]);
    pd.box(0.5, 0.3, 0.6, C.gun, [0, -0.36, 0]);
    for (const x of [-0.14, 0.14])
      for (const y of [-0.12, 0.12]) {
        pd.cyl(0.11, 0.05, 8, C.black, [x, y, 0.5], [90, 0, 0]);
        pd.cyl(0.08, 0.14, 8, C.white, [x, y, 0.5], [90, 0, 0]);
        pd.cone(0.075, 0.22, 6, C.orange, [x, y, 0.66], [90, 0, 0]);
      }
    pd.box(0.5, 0.025, 0.02, C.cyan, [0, 0.0, 0.505], [0, 0, 0], { glow: 1.2 });
    pd.box(0.025, 0.4, 0.7, C.cyan, [s * 0.316, 0, -0.1], [0, 0, 0], { glow: 0.9 });
    pd.build(b, { bone: chassis, at: [s * 0.88, 3.72, -0.45], rotation: [-22, 0, 0] });
    b.sweep(
      catmull([
        [s * 0.45, 3.45, -1.0],
        [s * 0.62, 3.5, -0.85],
        [s * 0.82, 3.5, -0.62],
        [s * 0.88, 3.55, -0.45],
      ]),
      0.022,
      C.copper,
      { bone: chassis, sides: 5 },
    );
  }

  // ================================================================ turret
  const yawPos: V = [0, 3.4, -1.2];
  const pitchPos: V = [0, 4.0, -1.2];
  const yaw = b.joint("yaw", { parent: chassis, at: yawPos, dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: pitchPos, dir: [0, 0, 1], role: "hinge" });
  {
    const y = new Asm();
    y.cyl(0.5, 0.3, 12, C.gun2, [0, 0.2, 0]);
    y.cyl(0.52, 0.04, 12, C.orange, [0, 0.06, 0]);
    for (const s of [1, -1]) {
      y.box(0.12, 0.72, 1.0, C.plate, [s * 0.38, 0.55, 0]);
      y.box(0.14, 0.05, 0.9, C.orange, [s * 0.38, 0.93, 0]);
      y.box(0.02, 0.4, 0.04, C.cyan, [s * 0.452, 0.5, 0.2], [0, 0, 0], { glow: 1.2 });
      y.box(0.02, 0.4, 0.04, C.cyan, [s * 0.452, 0.5, 0.1], [0, 0, 0], { glow: 1.2 });
    }
    y.cyl(0.08, 0.9, 8, C.steel, [0, 0.6, 0], [0, 0, 90]);
    y.box(0.8, 0.5, 0.5, C.gun, [0, 0.55, -0.6]);
    y.box(0.25, 0.25, 0.3, C.gun2, [0.58, 0.9, 0.1]);
    y.sph(0.06, C.red, [0.58, 0.9, 0.27], { glow: 1.6 });
    y.rod([0.58, 1.02, 0.1], [0.58, 1.35, 0.1], 0.012, C.steel, 4);
    y.build(b, { bone: yaw, at: yawPos });
  }
  {
    const g = new Asm();
    g.box(0.62, 0.46, 0.8, C.plate, [0, 0, -0.3]);
    g.box(0.64, 0.06, 0.7, C.orange, [0, 0.26, -0.3]);
    for (const s of [1, -1]) g.box(0.12, 0.24, 2.4, C.steel, [s * 0.14, 0, 1.4]);
    g.box(0.16, 0.06, 2.2, C.cyan, [0, 0, 1.4], [0, 0, 0], { glow: 1.5 });
    for (let i = 0; i < 6; i++) g.tor(0.25, 0.045, 8, i % 2 ? C.gun2 : C.orange, [0, 0, 0.5 + i * 0.33]);
    for (const s of [1, -1]) {
      g.cyl(0.11, 0.9, 8, C.plate, [s * 0.4, -0.12, 0.35], [90, 0, 0]);
      g.cyl(0.09, 0.02, 8, C.cyan, [s * 0.4, -0.12, 0.81], [90, 0, 0], { glow: 1.4 });
    }
    g.box(0.5, 0.4, 0.3, C.dark, [0, 0, 2.7]);
    for (let i = 0; i < 3; i++) g.box(0.52, 0.03, 0.2, C.orange, [0, -0.12 + i * 0.12, 2.7], [0, 0, 0], { glow: 0.9 });
    g.box(0.24, 0.2, 0.4, C.gun, [0, 0.33, 0.1]);
    g.box(0.1, 0.06, 0.02, C.red, [0, 0.33, 0.31], [0, 0, 0], { glow: 1.6 });
    g.rod([0.5, 0.15, 0.0], [0.5, 0.15, 1.5], 0.045, C.gun2, 6);
    g.cyl(0.07, 0.2, 6, C.steel, [0.5, 0.15, 1.55], [90, 0, 0]);
    g.build(b, { bone: pitch, at: pitchPos });
  }

  // ================================================================ cab interior hint + finish
  S.box(1.5, 0.1, 0.4, C.dark, [0, 2.15, 2.3]); // dash (seen through glass)
  S.box(1.2, 0.04, 0.02, C.cyan, [0, 2.2, 2.1], [0, 0, 0], { glow: 0.8 });
  S.box(0.8, 0.4, 0.5, C.gun, [0.45, 2.35, 1.2]);
  S.box(0.8, 0.4, 0.5, C.gun, [-0.45, 2.35, 1.2]);

  S.build(b, { bone: chassis });

  return b.root;
}
