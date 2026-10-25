```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, createBuilder, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import type { Fill, Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Aegis Convoy Hauler",
  description:
    "Low-poly cyberpunk 8-wheel armoured convoy hauler: slit-visor armoured cab with a twin autocannon roof turret, neon underglow, and a sealed biohazard cargo capsule strapped on the deck.",
};

type V3 = [number, number, number];
const DEG = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

// ------------------------------------------------------------------ palette
const C = {
  hull: "#272c3c",
  hullD: "#171a25",
  steel: "#6b7592",
  lite: "#a6b0c8",
  podW: "#dfe3ee",
  podG: "#9ba4ba",
  haz: "#ffc21a",
  hazD: "#15161d",
  mag: "#ff2a8a",
  cyan: "#27f2ff",
  red: "#ff2b3a",
  amber: "#ffa31a",
  white: "#f2fbff",
  rubber: "#14151a",
  glass: "#0b2530",
  teal: "#2de6d4",
  olive: "#5b6b3a",
  brass: "#c99a3c",
};

// ------------------------------------------------------------------ paints
function grime(p: THREE.Vector3, n: THREE.Vector3, lo: string, hi: string): Rgb {
  let c = mix(lo, hi, smoothstep(-0.2, 0.9, n.y));
  c = mix(c, "#12141c", 0.55 * smoothstep(0.55, 0.8, noise(p, 0.6, 3)));
  c = mix(c, "#0c0d12", 0.6 * smoothstep(1.9, 1.1, p.y));
  c = mix(c, "#4a2f24", 0.35 * smoothstep(0.6, 0.85, noise(p, 0.25, 8)) * smoothstep(2.2, 1.3, p.y));
  c = mix(c, "#6a1a55", 0.3 * smoothstep(0.0, -0.8, n.y));
  return c;
}

function plating(lo: string, hi: string, cu: number, cv: number) {
  return paint((p, n) => {
    const c = grime(p, n, lo, hi);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = fract(u / cu) * cu;
    const dv = fract(v / cv) * cv;
    if (du < 0.014 || dv < 0.014) return mix(c, "#05060a", 0.85);
    if (du < 0.03 || dv < 0.03) return mix(c, "#9fb0d8", 0.14);
    if (Math.hypot(du - 0.055, dv - 0.055) < 0.014) return mix(c, "#c8d2f0", 0.5);
    return c;
  });
}

const HULLP = plating("#252a3a", "#3b4560", 0.55, 0.45);
const PLATEP = plating("#2f3650", "#4d5a80", 0.4, 0.35);
const DARKP = plating("#12141c", "#242a3a", 0.6, 0.5);
const HAZP = paint((p) => {
  const k = Math.floor((p.x + p.y) * 5);
  return ((k % 2) + 2) % 2 === 0 ? C.haz : C.hazD;
});

const POD = paint((p, n) => {
  const z = p.z;
  const ang = Math.atan2(p.y - 2.55, p.x);
  let c: Rgb = mix(C.podG, C.podW, smoothstep(-0.5, 0.8, n.y));
  c = mix(c, "#2a2e3c", 0.4 * smoothstep(0.5, 0.8, noise(p, 0.45, 5)));
  c = mix(c, "#14151c", 0.55 * smoothstep(1.9, 1.5, p.y));
  if (z < -3.7 || z > -0.2) {
    const k = Math.floor(ang * 2.6 + z * 2.2);
    c = mix(((k % 2) + 2) % 2 === 0 ? C.haz : C.hazD, "#3a3326", 0.25 + 0.3 * noise(p, 0.3, 2));
  } else if (Math.abs(z + 2.3) > 0.9 && Math.abs(z + 2.3) < 0.96) {
    c = mix(c, C.mag, 0.9);
  }
  const d = fract((z + 4.25) / 1.2) * 1.2;
  if (d < 0.014 || d > 1.186) c = mix(c, "#0a0b10", 0.8);
  return c;
});

// ------------------------------------------------------------------ geometry builders
function makeTyre() {
  const g: THREE.BufferGeometry[] = [new THREE.CylinderGeometry(0.56, 0.56, 0.5, 12)];
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 12; i++) {
      const a = ((i + row * 0.5) / 12) * Math.PI * 2;
      const blk = new THREE.BoxGeometry(0.09, 0.22, 0.2);
      blk.rotateY(-a);
      blk.translate(Math.cos(a) * 0.585, row ? 0.13 : -0.13, Math.sin(a) * 0.585);
      g.push(blk);
    }
  return mergeGeometries(g)!;
}

function makeRim() {
  const g: THREE.BufferGeometry[] = [new THREE.CylinderGeometry(0.4, 0.4, 0.52, 12)];
  const dish = new THREE.CylinderGeometry(0.31, 0.34, 0.07, 12);
  dish.translate(0, 0.27, 0);
  g.push(dish);
  const hub = new THREE.CylinderGeometry(0.1, 0.12, 0.1, 6);
  hub.translate(0, 0.33, 0);
  g.push(hub);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bolt = new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6);
    bolt.translate(Math.cos(a) * 0.22, 0.31, Math.sin(a) * 0.22);
    g.push(bolt);
  }
  return mergeGeometries(g)!;
}

function makeRing() {
  const t = new THREE.TorusGeometry(0.355, 0.02, 4, 20);
  t.rotateX(Math.PI / 2);
  t.translate(0, 0.31, 0);
  return t;
}

function archOutline(cz: number): [number, number][] {
  const WR = 0.62;
  const out: [number, number][] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI;
    out.push([cz + 0.86 * Math.cos(a), WR + 0.86 * Math.sin(a)]);
  }
  for (let i = n; i >= 0; i--) {
    const a = (i / n) * Math.PI;
    out.push([cz + 0.7 * Math.cos(a), WR + 0.7 * Math.sin(a)]);
  }
  return out;
}

// ------------------------------------------------------------------ textures
function makeTextures() {
  const logo = svg(
    `<svg viewBox="0 0 100 100">
      <polygon points="50,4 92,26 92,68 50,97 8,68 8,26" fill="#14161f" stroke="#ff2a8a" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="50,15 81,31 81,63 50,86 19,63 19,31" fill="none" stroke="#27f2ff" stroke-width="3"/>
      <path d="M50 24 L70 66 L59 66 L50 46 L41 66 L30 66 Z" fill="#ffc21a" stroke="#15161d" stroke-width="2"/>
      <rect x="38" y="56" width="24" height="5" fill="#ff2a8a"/>
      <circle cx="50" cy="40" r="3.5" fill="#27f2ff"/>
      <path d="M30 76 H70" stroke="#27f2ff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  let chev = "";
  for (let i = 0; i < 12; i++) chev += `<polygon points="${i * 18},0 ${i * 18 + 9},0 ${i * 18 + 18},7 ${i * 18 + 9},14 ${i * 18},14 ${i * 18 + 9},7" fill="#15161d"/>`;
  let bars = "";
  [0, 3, 5, 9, 11, 14, 17, 20, 23, 26, 29, 32, 36, 38].forEach((x, i) => {
    bars += `<rect x="${142 + x}" y="28" width="${i % 3 === 0 ? 3 : 1.6}" height="30" fill="#15161d"/>`;
  });
  const label = svg(
    `<svg viewBox="0 0 200 70">
      <rect width="200" height="70" rx="5" fill="#f1f2f6" stroke="#15161d" stroke-width="3"/>
      <rect x="2" y="2" width="196" height="14" fill="#ffc21a"/>
      <g transform="translate(0,2)">${chev}</g>
      <text x="10" y="40" font-family="Arial, sans-serif" font-weight="bold" font-size="19" fill="#15161d">SEALED CARGO</text>
      <text x="10" y="54" font-family="monospace" font-size="8.5" fill="#15161d">LOT 7-OMEGA // BIO-CLASS 4</text>
      <text x="10" y="64" font-family="monospace" font-size="7" fill="#b3122e">DO NOT BREACH - AEGIS ESCORT ONLY</text>
      ${bars}
    </svg>`,
    { size: 512 },
  );
  const screen = svg(
    `<svg viewBox="0 0 120 80">
      <rect width="120" height="80" rx="6" fill="#04090d" stroke="#27f2ff" stroke-width="3"/>
      <text x="8" y="17" font-family="monospace" font-size="9" fill="#27f2ff">SEAL INTEGRITY</text>
      <rect x="8" y="22" width="104" height="8" fill="#0d2a33"/>
      <rect x="8" y="22" width="97" height="8" fill="#2de6a0"/>
      <polyline points="8,64 22,52 34,58 48,40 62,50 76,34 90,46 104,30 112,36" fill="none" stroke="#ff2a8a" stroke-width="2.4"/>
      <text x="8" y="75" font-family="monospace" font-size="7" fill="#27f2ff">1.02 ATM  -196C  OK</text>
    </svg>`,
    { size: 256 },
  );
  const pt = (a: number) => `${(50 + 40 * Math.cos(a * DEG)).toFixed(1)} ${(50 - 40 * Math.sin(a * DEG)).toFixed(1)}`;
  let tre = "";
  for (const a0 of [90, 210, 330]) tre += `<path d="M50 50 L${pt(a0 - 30)} A40 40 0 0 0 ${pt(a0 + 30)} Z" fill="#15161d"/>`;
  const trefoil = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#ffc21a" stroke="#15161d" stroke-width="4"/>
      ${tre}
      <circle cx="50" cy="50" r="12" fill="#ffc21a"/>
      <circle cx="50" cy="50" r="7" fill="#15161d"/>
    </svg>`,
    { size: 256 },
  );
  const hazardTri = svg(
    `<svg viewBox="0 0 100 100">
      <polygon points="50,6 96,88 4,88" fill="#ffc21a" stroke="#15161d" stroke-width="6" stroke-linejoin="round"/>
      <rect x="45" y="34" width="10" height="30" fill="#15161d"/>
      <circle cx="50" cy="75" r="6" fill="#15161d"/>
    </svg>`,
    { size: 128 },
  );
  let slits = "";
  for (let i = 0; i < 10; i++) slits += `<rect x="${5 + i * 9.4}" y="4" width="6.4" height="22" fill="#1a1d28" stroke="#4a5578" stroke-width="1"/>`;
  const grille = svg(
    `<svg viewBox="0 0 100 30">
      <rect width="100" height="30" fill="#07080d"/>
      ${slits}
      <rect x="4" y="27" width="92" height="2" fill="#ff2a8a"/>
    </svg>`,
    { size: 256 },
  );
  const visor = svg(
    `<svg viewBox="0 0 200 34">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06222c"/><stop offset="1" stop-color="#020a10"/></linearGradient></defs>
      <rect width="200" height="34" fill="url(#g)"/>
      <polygon points="20,0 50,0 30,34 0,34" fill="#27f2ff" opacity="0.14"/>
      <polygon points="76,0 86,0 66,34 56,34" fill="#27f2ff" opacity="0.1"/>
      <path d="M8 29 H192" stroke="#27f2ff" stroke-width="1.2" opacity="0.8"/>
      <g stroke="#2de6d4" stroke-width="1" fill="none"><circle cx="150" cy="16" r="8"/><path d="M136 16h6M158 16h6M150 2v6M150 24v6"/></g>
      <text x="12" y="11" font-family="monospace" font-size="6" fill="#27f2ff">SPD 062  RNG 4.1KM  HOSTILES 00</text>
      <text x="12" y="21" font-family="monospace" font-size="5" fill="#ff2a8a">// ESCORT LINK ONLINE</text>
    </svg>`,
    { size: 512 },
  );
  const doorNum = svg(
    `<svg viewBox="0 0 80 40">
      <rect width="80" height="40" rx="4" fill="#0e1018" stroke="#ffa31a" stroke-width="2.5"/>
      <text x="40" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#ffa31a">CV-07</text>
    </svg>`,
    { size: 256 },
  );
  const plate = svg(
    `<svg viewBox="0 0 100 40">
      <rect width="100" height="40" rx="4" fill="#f4e9a8" stroke="#15161d" stroke-width="3"/>
      <rect x="4" y="4" width="92" height="7" fill="#15161d"/>
      <text x="50" y="9.6" text-anchor="middle" font-family="monospace" font-size="6" fill="#27f2ff">NEO-TOKYO TRANSIT</text>
      <text x="50" y="33" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#15161d">AEG 7741</text>
    </svg>`,
    { size: 256 },
  );
  const sign = svg(
    `<svg viewBox="0 0 100 40">
      <rect width="100" height="40" rx="6" fill="#0a0612" stroke="#ff2a8a" stroke-width="3"/>
      <text x="50" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="17" fill="#ff5ab0">SEAL//7</text>
      <path d="M8 34 H92" stroke="#27f2ff" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );
  return { logo, label, screen, trefoil, hazardTri, grille, visor, doorNum, plate, sign };
}

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "convoy_hauler", paintSize: 2048 });
  const T = makeTextures();
  const IRON = metal("iron", { tarnish: 0.5 });
  const STEELP = metal("steel", { tarnish: 0.35 });
  const BLUED = metal("blued");
  const COPPER = metal("copper", { verdigris: 0.3 });

  const chassis = b.joint("chassis", { at: [0, 1.0, 0], role: "spine" });

  const put = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: Record<string, any> = {}) =>
    b.part(geo, color, { bone: chassis, at, ...o });
  const rod = (a: V3, c: V3, r: number, color: Fill, o: Record<string, any> = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const decalPlane = (tex: any, w: number, h: number, at: V3, dir: V3, o: Record<string, any> = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });

  // plate laid on a profile edge (z, y) of the side silhouette, outward = right of travel
  const lerp2 = (p0: [number, number], p1: [number, number], t: number): [number, number] => [
    p0[0] + (p1[0] - p0[0]) * t,
    p0[1] + (p1[1] - p0[1]) * t,
  ];
  const onEdge = (
    p0: [number, number],
    p1: [number, number],
    o: { x: number; w: number; t: number; color: Fill; off?: number; tex?: any; bone?: any },
  ) => {
    const dz = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dz, dy);
    const off = (o.off ?? 0) + o.t / 2;
    const mz = (p0[0] + p1[0]) / 2 + (dy / len) * off;
    const my = (p0[1] + p1[1]) / 2 + (-dz / len) * off;
    return b.part(box(o.w, len, o.t), o.color, {
      bone: o.bone ?? chassis,
      at: [o.x, my, mz],
      rotation: [Math.atan2(dz, dy) / DEG, 0, 0],
      texture: o.tex,
    });
  };

  const WR = 0.62;
  const WX = 1.2;
  const AX = [
    { z: 3.15, steer: true },
    { z: 1.8, steer: true },
    { z: -2.4, steer: false },
    { z: -3.75, steer: false },
  ];

  // ================================================================ wheels
  const tyreGeo = makeTyre();
  const rimGeo = makeRim();
  const ringGeo = makeRing();
  AX.forEach((ax, i) => {
    for (const s of [1, -1] as const) {
      const side = s > 0 ? "L" : "R";
      const hub: V3 = [s * WX, WR, ax.z];
      const steer = ax.steer
        ? b.joint(`steer${i + 1}${side}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" })
        : chassis;
      const spin = b.joint(`wheel${i + 1}${side}`, { parent: steer, at: hub, dir: [s, 0, 0], role: "hinge" });
      const o = { bone: spin, at: hub, rotation: [0, 0, -90 * s], flat: true };
      b.part(tyreGeo, C.rubber, o);
      b.part(rimGeo, IRON, o);
      glow(b.part(ringGeo, C.cyan, o));

      // fender arch with neon lip
      b.extrude(archOutline(ax.z), {
        at: [s * WX, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.62,
        bevel: 0.03,
        detail: 0.4,
        bone: chassis,
        color: PLATEP,
      });
      glow(
        put(new THREE.TorusGeometry(0.86, 0.02, 4, 12, Math.PI), C.mag, [s * (WX + 0.32), WR, ax.z], {
          rotation: [0, 90, 0],
        }),
      );
    }
  });

  // ================================================================ chassis, axles, springs
  for (const s of [1, -1] as const) put(box(0.24, 0.3, 9.5), C.hullD, [s * 0.62, 1.08, -0.15]);
  for (const z of [-4.5, -3.0, -1.2, 0.3, 1.0, 2.5, 3.9]) put(box(1.5, 0.2, 0.22), C.hullD, [0, 1.15, z]);
  rod([0, 0.9, 1.6], [0, 0.9, -2.2], 0.05, STEELP, { sides: 8 });
  for (const ax of AX) {
    rod([-WX, WR, ax.z], [WX, WR, ax.z], 0.09, IRON, { sides: 8 });
    put(new THREE.SphereGeometry(0.26, 8, 6), IRON, [0, WR, ax.z], { scale: [1, 1, 0.9], flat: true });
    for (const s of [1, -1] as const) {
      put(box(0.2, 0.18, 0.2), IRON, [s * 0.62, 0.72, ax.z]);
      for (let k = 0; k < 3; k++) put(box(0.1, 0.035, 1.2 - 0.25 * k), STEELP, [s * 0.62, 0.82 + k * 0.045, ax.z]);
      rod([s * 0.88, 0.55, ax.z + 0.22], [s * 0.82, 1.1, ax.z + 0.14], 0.035, C.mag);
    }
  }
  // tanks, battery
  put(cyl(0.3, 1.9, 10), STEELP, [1.05, 0.95, -0.3], { rotation: [90, 0, 0], flat: true });
  for (const z of [-0.9, 0.3]) put(new THREE.TorusGeometry(0.31, 0.025, 4, 10), C.hullD, [1.05, 0.95, z]);
  put(cyl(0.07, 0.08, 6), C.brass, [1.05, 1.26, 0.4]);
  put(box(0.55, 0.5, 1.7), C.hullD, [-1.0, 0.95, -0.3]);
  for (let i = 0; i < 6; i++) glow(put(box(0.03, 0.3, 0.18), C.cyan, [-1.29, 0.95, -0.95 + i * 0.28]));
  put(box(0.58, 0.04, 1.72), HAZP, [-1.0, 1.21, -0.3]);

  // skirts and underglow
  for (const s of [1, -1] as const) {
    for (const z of [-1.2, -0.7, -0.2, 0.3, 0.8]) {
      put(box(0.05, 0.5, 0.44), PLATEP, [s * 1.43, 1.12, z], { rotation: [0, 0, -s * 8] });
      put(cyl(0.018, 0.03, 6), C.lite, [s * 1.46, 1.25, z], { rotation: [0, 0, 90] });
    }
    glow(put(box(0.04, 0.04, 2.45), C.mag, [s * 1.46, 0.88, -0.22]));
    rod([s * 0.75, 0.82, -1.6], [s * 0.75, 0.82, 1.0], 0.03, C.cyan, { sides: 4 });
  }
  glow(put(box(1.2, 0.04, 0.06), C.mag, [0, 0.8, -1.4]));

  // ================================================================ deck
  put(box(2.8, 0.14, 6.2), HULLP, [0, 1.43, -1.9]);
  for (const s of [1, -1] as const) glow(put(box(0.04, 0.04, 6.0), C.cyan, [s * 1.41, 1.5, -1.9]));
  for (const z of [-3.7, -1.9, 0.0]) {
    put(box(1.9, 0.12, 0.5), DARKP, [0, 1.56, z]);
    for (const s of [1, -1] as const) put(box(0.4, 0.42, 0.45), DARKP, [s * 0.72, 1.7, z], { rotation: [0, 0, s * 38] });
  }
  // lockers
  for (const s of [1, -1] as const)
    for (const z of [0.1, -1.2]) {
      put(box(0.42, 0.5, 1.0), PLATEP, [s * 1.19, 1.75, z]);
      put(box(0.44, 0.02, 1.02), HAZP, [s * 1.19, 2.01, z]);
      for (const dz of [-0.3, 0.3]) put(box(0.03, 0.1, 0.12), C.lite, [s * 1.405, 1.8, z + dz]);
    }
  glow(decalPlane(T.sign, 0.9, 0.36, [1.41, 1.78, 0.1], [1, 0, 0]));
  decalPlane(T.hazardTri, 0.4, 0.4, [-1.41, 1.78, 0.1], [-1, 0, 0]);
  decalPlane(T.hazardTri, 0.4, 0.4, [-1.41, 1.78, -1.2], [-1, 0, 0]);
  decalPlane(T.hazardTri, 0.4, 0.4, [1.41, 1.78, -1.2], [1, 0, 0]);
  // greeble on deck rear
  const r = rng(7);
  for (let i = 0; i < 8; i++)
    put(box(0.08 + r() * 0.12, 0.05 + r() * 0.06, 0.08 + r() * 0.1), i % 2 ? C.hullD : C.steel, [
      (r() - 0.5) * 0.9,
      1.53,
      -4.55 - r() * 0.3,
    ]);

  // ================================================================ rear
  put(box(2.9, 0.42, 0.3), HAZP, [0, 1.08, -5.08]);
  put(cyl(0.1, 0.3, 8), IRON, [0, 1.0, -5.35], { rotation: [90, 0, 0] });
  decalPlane(T.plate, 0.7, 0.28, [0, 1.1, -5.235], [0, 0, -1]);
  for (const s of [1, -1] as const) {
    put(box(0.2, 0.9, 0.2), C.hullD, [s * 1.3, 1.95, -4.9]);
    glow(put(box(0.1, 0.6, 0.04), C.red, [s * 1.3, 1.95, -5.015]));
    glow(put(box(0.14, 0.14, 0.04), C.amber, [s * 1.3, 2.33, -5.015]));
    rod([s * 0.32, 1.25, -4.97], [s * 0.32, 1.95, -4.97], 0.025, C.lite);
  }
  for (let i = 0; i < 4; i++) rod([-0.32, 1.35 + i * 0.18, -4.97], [0.32, 1.35 + i * 0.18, -4.97], 0.02, C.lite);
  put(box(0.45, 0.55, 0.2), C.amber, [-0.7, 1.8, -4.65]);
  put(box(0.45, 0.55, 0.2), C.olive, [0.7, 1.8, -4.65]);

  // ================================================================ cab
  const cabOutline: [number, number][] = [
    [4.38, 1.35],
    [4.58, 1.85],
    [4.5, 2.4],
    [4.0, 2.6],
    [3.45, 3.3],
    [1.6, 3.4],
    [1.15, 3.15],
    [1.15, 1.35],
  ];
  b.extrude(cabOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 2.6,
    bevel: 0.07,
    detail: 0.4,
    bone: chassis,
    color: HULLP,
  });
  const roofY = (z: number) => 3.3 + (3.45 - z) * 0.054;

  // hood + windscreen assembly
  const hoodA: [number, number] = [4.5, 2.4];
  const hoodB: [number, number] = [4.0, 2.6];
  const scrA: [number, number] = [4.0, 2.6];
  const scrB: [number, number] = [3.45, 3.3];
  onEdge(hoodA, hoodB, { x: 0, w: 2.4, t: 0.06, color: PLATEP });
  for (let i = 0; i < 4; i++) {
    const [z, y] = lerp2(hoodA, hoodB, 0.2 + i * 0.2);
    put(box(1.1, 0.04, 0.07), C.hazD, [0, y + 0.07, z], { rotation: [-22, 0, 0] });
  }
  onEdge(scrA, scrB, { x: 0, w: 2.4, t: 0.05, color: C.hullD, off: 0.0 });
  const glassA = lerp2(scrA, scrB, 0.14);
  const glassB = lerp2(scrA, scrB, 0.86);
  glow(onEdge(glassA, glassB, { x: 0, w: 2.1, t: 0.05, color: "#ffffff", off: 0.03, tex: T.visor }), 0.85);
  onEdge(lerp2(scrA, scrB, 0.86), scrB, { x: 0, w: 2.4, t: 0.11, color: PLATEP, off: 0.01 });
  onEdge(scrA, lerp2(scrA, scrB, 0.14), { x: 0, w: 2.4, t: 0.09, color: PLATEP, off: 0.01 });
  for (const s of [1, -1] as const) onEdge(scrA, scrB, { x: s * 1.13, w: 0.14, t: 0.09, color: PLATEP, off: 0.01 });
  glow(onEdge(lerp2(scrA, scrB, 0.9), lerp2(scrA, scrB, 0.95), { x: 0, w: 1.9, t: 0.03, color: C.mag, off: 0.1 }));

  // roof
  onEdge([3.45, 3.3], [1.6, 3.4], { x: 0, w: 2.3, t: 0.05, color: PLATEP, off: 0.0 });
  for (const z of [3.0, 2.0])
    put(box(2.2, 0.05, 0.1), C.hullD, [0, roofY(z) + 0.09, z]);
  // light bar
  put(box(1.9, 0.12, 0.16), C.hullD, [0, 3.38, 3.4]);
  [C.mag, C.cyan, C.amber, C.cyan, C.mag].forEach((col, i) =>
    glow(put(box(0.3, 0.07, 0.04), col, [-0.72 + i * 0.36, 3.39, 3.49])),
  );
  // roof hatch
  const hatch = b.joint("roofHatch", { parent: chassis, at: [0, 3.42, 1.7], dir: [0, 0, 1], up: [0, 1, 0], role: "hinge" });
  b.part(cyl(0.3, 0.06, 10), PLATEP, { bone: hatch, at: [0, 3.46, 2.0], flat: true });
  b.part(new THREE.TorusGeometry(0.1, 0.02, 4, 8), C.lite, { bone: hatch, at: [0, 3.5, 2.0], rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.32, 0.03, 4, 10), C.hullD, [0, 3.41, 2.0], { rotation: [90, 0, 0] });
  // sensor dome, dish, antennas
  put(cyl(0.2, 0.05, 10), C.hullD, [0.8, 3.43, 2.2], { flat: true });
  put(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), C.glass, [0.8, 3.45, 2.2], { flat: true });
  glow(put(new THREE.SphereGeometry(0.05, 6, 4), C.red, [0.8, 3.52, 2.25]));
  b.lathe(
    [
      [0, 0],
      [0.28, 0.1],
      [0.28, 0.13],
      [0, 0.03],
    ],
    { at: [-0.8, 3.65, 2.1], axis: [0.3, 0.8, -0.5], segments: 10, bone: chassis, color: C.lite },
  );
  rod([-0.8, 3.4, 2.1], [-0.8, 3.65, 2.1], 0.03, C.hullD);
  for (const [x, h] of [
    [1.1, 1.4],
    [-1.1, 0.9],
  ] as const) {
    put(cyl(0.06, 0.08, 8), C.hullD, [x, 3.45, 1.45]);
    b.spike([x, 3.48, 1.45], [0.08, 1, -0.1], h, 0.014, C.steel, { bone: chassis, sides: 5 });
    glow(put(new THREE.SphereGeometry(0.035, 5, 4), C.red, [x + 0.08 * h * 0.95, 3.48 + h, 1.45 - 0.1 * h * 0.95]));
  }

  // nose
  put(box(2.9, 0.5, 0.4), HAZP, [0, 1.12, 4.72]);
  put(box(2.5, 0.2, 0.3), DARKP, [0, 0.82, 4.62], { rotation: [-25, 0, 0] });
  for (let i = 0; i < 5; i++) b.spike([-1.1 + i * 0.55, 1.1, 4.9], [0, 0, 1], 0.32, 0.075, C.steel, { bone: chassis, sides: 4 });
  put(cyl(0.12, 1.0, 8), C.hullD, [0, 1.25, 4.62], { rotation: [0, 0, 90] });
  put(cyl(0.16, 0.9, 8), IRON, [0, 1.25, 4.62], { rotation: [0, 0, 90] });
  for (const s of [1, -1] as const) {
    put(new THREE.TorusGeometry(0.07, 0.02, 4, 8, Math.PI * 1.5), C.lite, [s * 0.75, 0.98, 4.93], { rotation: [0, 0, 180] });
    glow(put(cyl(0.08, 0.04, 8), C.cyan, [s * 1.2, 1.1, 4.92], { rotation: [90, 0, 0] }));
    // headlight housings
    put(box(0.72, 0.24, 0.14), C.hullD, [s * 0.92, 2.05, 4.58], { rotation: [-8.3, 0, 0] });
    glow(put(box(0.6, 0.1, 0.04), C.white, [s * 0.92, 2.05, 4.65], { rotation: [-8.3, 0, 0] }), 1.4);
    put(box(0.82, 0.05, 0.22), PLATEP, [s * 0.92, 2.22, 4.57], { rotation: [-8.3, 0, 0] });
  }
  decalPlane(T.grille, 1.1, 0.34, [0, 2.1, 4.565], [0, 0.144, 0.99]);
  glow(put(box(0.2, 0.05, 0.03), C.mag, [0, 1.9, 4.62]));

  // exhaust stacks
  for (const s of [1, -1] as const) {
    rod([s * 1.33, 1.5, 0.88], [s * 1.33, 3.7, 0.88], 0.09, BLUED, { sides: 8 });
    put(cyl(0.15, 0.7, 8), IRON, [s * 1.33, 2.4, 0.88]);
    put(box(0.3, 0.04, 0.3), C.hullD, [s * 1.33, 3.76, 0.88], { rotation: [-15, 0, 0] });
    glow(put(new THREE.TorusGeometry(0.09, 0.02, 4, 8), C.amber, [s * 1.33, 3.68, 0.88], { rotation: [90, 0, 0] }));
    for (const y of [1.9, 2.9]) rod([s * 1.2, y, 1.12], [s * 1.33, y, 0.9], 0.03, C.steel);
  }

  // doors
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const door = b.joint(`door${side}`, { parent: chassis, at: [s * 1.34, 2.4, 3.1], dir: [0, 1, 0], role: "hinge" });
    const d = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: Record<string, any> = {}) =>
      b.part(geo, color, { bone: door, at, ...o });
    d(box(0.1, 1.55, 1.4), PLATEP, [s * 1.36, 2.45, 2.4]);
    d(box(0.06, 0.5, 1.1), C.hullD, [s * 1.395, 2.98, 2.45]);
    d(box(0.05, 0.4, 0.95), C.glass, [s * 1.43, 2.98, 2.45]);
    glow(d(box(0.03, 0.03, 0.95), C.cyan, [s * 1.435, 2.74, 2.45]), 0.9);
    for (let i = 0; i < 4; i++) d(box(0.03, 0.04, 0.7), C.hullD, [s * 1.415, 1.85 + i * 0.08, 2.4]);
    d(box(0.07, 0.07, 0.3), C.lite, [s * 1.43, 2.3, 1.85]);
    glow(d(box(0.03, 1.3, 0.03), C.cyan, [s * 1.42, 2.45, 3.08]));
    b.part(new THREE.PlaneGeometry(0.75, 0.38), "#ffffff", {
      bone: door,
      at: [s * 1.412, 2.5, 2.4],
      dir: [s, 0, 0],
      axis: "z",
      texture: T.doorNum,
    });
    rod([s * 1.42, 1.9, 1.55], [s * 1.42, 3.1, 1.55], 0.035, C.lite);
    // mirror camera
    rod([s * 1.4, 3.05, 3.2], [s * 1.78, 3.1, 3.35], 0.025, C.steel);
    put(box(0.2, 0.28, 0.14), C.hullD, [s * 1.82, 3.08, 3.38]);
    glow(put(cyl(0.04, 0.03, 8), C.red, [s * 1.82, 3.08, 3.46], { rotation: [90, 0, 0] }));
  }

  // cab rear panel and umbilicals
  put(box(2.2, 1.3, 0.1), DARKP, [0, 2.3, 1.1]);
  const hoseRing = (path: ReturnType<typeof catmull>) =>
    b.along(path, 5, (at) => {
      b.part(cyl(0.065, 0.05, 6), C.lite, { frame: at, bone: chassis });
    });
  for (const s of [1, -1] as const) {
    put(cyl(0.1, 0.08, 8), C.steel, [s * 0.3, 2.3, 1.08], { rotation: [90, 0, 0] });
    put(cyl(0.1, 0.08, 8), C.steel, [s * 0.3, 2.3, 0.7], { rotation: [90, 0, 0] });
    const hose = catmull([
      [s * 0.3, 2.3, 1.06],
      [s * 0.34, 1.95, 0.95],
      [s * 0.32, 2.0, 0.78],
      [s * 0.3, 2.3, 0.7],
    ]);
    b.sweep(hose, 0.045, C.rubber, { bone: chassis, sides: 6 });
    hoseRing(hose);
    glow(put(new THREE.TorusGeometry(0.11, 0.015, 4, 8), C.cyan, [s * 0.3, 2.3, 0.66]));
  }

  // ================================================================ turret
  const tz = 2.7;
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.42, tz], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.95, tz + 0.15], dir: [0, 0, 1], up: [0, 1, 0], role: "hinge" });
  put(new THREE.TorusGeometry(0.5, 0.05, 4, 12), STEELP, [0, 3.4, tz], { rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++)
    put(cyl(0.025, 0.04, 6), C.lite, [0.5 * Math.cos((i / 8) * Math.PI * 2), 3.46, tz + 0.5 * Math.sin((i / 8) * Math.PI * 2)]);
  const ty = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: Record<string, any> = {}) =>
    b.part(geo, color, { bone: yaw, at, ...o });
  const tp = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: Record<string, any> = {}) =>
    b.part(geo, color, { bone: pitch, at, ...o });
  ty(cyl(0.46, 0.2, 10), PLATEP, [0, 3.53, tz], { flat: true });
  ty(box(1.0, 0.42, 0.9), PLATEP, [0, 3.84, tz]);
  for (const s of [1, -1] as const) {
    ty(box(0.08, 0.5, 0.8), HULLP, [s * 0.52, 3.9, tz + 0.05], { rotation: [0, 0, s * 12] });
    ty(box(0.32, 0.3, 0.5), C.hullD, [s * 0.68, 3.75, tz - 0.1]);
    glow(ty(box(0.04, 0.05, 0.3), C.amber, [s * 0.85, 3.75, tz - 0.1]));
    b.sweep(
      catmull([
        [s * 0.62, 3.9, tz - 0.1],
        [s * 0.5, 4.1, tz + 0.1],
        [s * 0.28, 4.0, tz + 0.35],
      ]),
      0.03,
      C.brass,
      { bone: yaw, sides: 5 },
    );
  }
  ty(box(0.4, 0.2, 0.4), C.hullD, [0.1, 4.15, tz - 0.2]);
  glow(ty(new THREE.SphereGeometry(0.07, 6, 4), C.red, [0.1, 4.18, tz]));
  tp(box(0.58, 0.36, 0.6), HULLP, [0, 3.95, tz + 0.5]);
  tp(box(0.7, 0.1, 0.1), C.steel, [0, 3.95, tz + 0.2]);
  for (const s of [1, -1] as const) {
    b.rod([s * 0.17, 3.95, tz + 0.7], [s * 0.17, 3.95, 4.45], 0.045, STEELP, { bone: pitch, sides: 8 });
    tp(cyl(0.085, 0.7, 8), C.hullD, [s * 0.17, 3.95, tz + 1.05], { rotation: [90, 0, 0] });
    for (let k = 0; k < 4; k++) glow(tp(box(0.03, 0.02, 0.05), C.amber, [s * 0.17, 4.03, tz + 0.85 + k * 0.15]), 0.8);
    tp(box(0.14, 0.14, 0.2), IRON, [s * 0.17, 3.95, 4.42]);
    tp(box(0.2, 0.04, 0.12), C.hullD, [s * 0.17, 3.95, 4.42]);
  }

  // ================================================================ cargo pod
  const podProfile: [number, number][] = [
    [0, 0],
    [0.55, 0],
    [0.88, 0.18],
    [1.05, 0.55],
    [1.05, 4.35],
    [0.88, 4.72],
    [0.55, 4.9],
    [0, 4.9],
  ];
  const pod = b.lathe(podProfile, { at: [0, 2.55, -4.25], axis: [0, 0, 1], segments: 12, bone: chassis, color: POD });
  const podSkin = b.surface(pod);
  for (const z of [-3.7, -0.2])
    put(new THREE.TorusGeometry(1.08, 0.05, 4, 12), STEELP, [0, 2.55, z]);
  for (const z of [-3.35, -1.2]) {
    const loop = podSkin.loop([0, 2.55, z], { dir: [0, 0, 1], lift: 0.03 });
    b.sweep(loop, 0.035, C.hazD, { bone: chassis, sides: 6 });
    glow(b.sweep(podSkin.loop([0, 2.55, z], { dir: [0, 0, 1], lift: 0.065 }), 0.012, C.cyan, { bone: chassis, sides: 4 }));
    put(box(0.24, 0.09, 0.2), STEELP, [0, 3.64, z]);
    put(cyl(0.035, 0.1, 6), C.brass, [0, 3.7, z]);
  }
  // decals
  for (const s of [1, -1] as const) {
    b.decal(pod, T.logo, { at: [s * 1.05, 2.7, -2.3], dir: [s, 0, 0], size: [1.3, 1.3] });
  }
  b.decal(pod, T.label, { at: [-1.05, 2.5, -0.75], dir: [-1, 0, 0], size: [0.95, 0.34] });
  b.decal(pod, T.screen, { at: [1.05, 2.5, -0.75], dir: [1, 0, 0], size: [0.75, 0.5] });
  // rear cap seal lock
  put(cyl(0.45, 0.1, 8), DARKP, [0, 2.55, -4.3], { rotation: [90, 0, 0], flat: true });
  glow(put(new THREE.TorusGeometry(0.38, 0.03, 4, 14), C.red, [0, 2.55, -4.36]));
  decalPlane(T.trefoil, 0.55, 0.55, [0, 2.55, -4.375], [0, 0, -1]);
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 45) * DEG;
    put(box(0.12, 0.3, 0.1), C.steel, [0.62 * Math.cos(a) * 0.9, 2.55 + 0.62 * Math.sin(a) * 0.9, -4.3], {
      rotation: [0, 0, i * 90 + 45 - 90],
    });
  }
  for (const s of [1, -1] as const) glow(put(new THREE.SphereGeometry(0.05, 6, 4), C.red, [s * 0.3, 2.0, -4.3]));
  // front cap
  decalPlane(T.screen, 0.7, 0.47, [0, 2.85, 0.665], [0, 0, 1]);
  put(box(0.5, 0.26, 0.05), C.hullD, [0, 2.2, 0.68]);
  for (let i = 0; i < 6; i++) glow(put(box(0.06, 0.06, 0.02), i % 2 ? C.cyan : C.mag, [-0.15 + (i % 3) * 0.15, 2.15 + Math.floor(i / 3) * 0.1, 0.71]));
  // roof gear
  glow(put(box(0.1, 0.03, 3.0), C.cyan, [0, 3.62, -1.95]));
  for (const z of [-3.1, -0.45]) put(new THREE.TorusGeometry(0.17, 0.03, 4, 8, Math.PI), C.lite, [0, 3.58, z]);
  for (let i = 0; i < 3; i++) put(box(0.3, 0.1, 0.12), C.hullD, [0.45, 3.45, -2.4 + i * 0.4], { rotation: [0, 0, -30] });
  const beacon = b.joint("beacon", { parent: chassis, at: [0, 3.6, -1.95], dir: [0, 1, 0], role: "hinge" });
  b.part(cyl(0.14, 0.06, 8), C.hullD, { bone: chassis, at: [0, 3.65, -1.95] });
  b.part(box(0.12, 0.1, 0.02), C.steel, { bone: beacon, at: [0, 3.78, -1.9] });
  glow(
    b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.amber, {
      bone: beacon,
      at: [0, 3.68, -1.95],
      flat: true,
    }),
    1.3,
  );
  rod([0.5, 3.4, -3.4], [0.4, 4.4, -3.55], 0.02, C.steel, { sides: 5 });
  glow(put(new THREE.SphereGeometry(0.04, 5, 4), C.red, [0.4, 4.43, -3.55]));
  // cable from pod to cab side
  b.sweep(
    catmull([
      [-0.9, 3.0, 0.4],
      [-1.05, 2.7, 0.9],
      [-1.2, 2.9, 1.15],
    ]),
    0.025,
    COPPER,
    { bone: chassis, sides: 5 },
  );

  return b.root;
}
```