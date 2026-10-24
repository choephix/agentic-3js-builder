```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  paint,
  cells,
  noise,
  mix,
  smoothstep,
  resolve,
  scales,
  svg,
  limb,
} from "agentic-3js-builder";
import type { ColorInput, Joint, Paint, Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A Oaxacan alebrije in painted copal wood: a chunky jaguar body covered in turquoise rosettes, dotted puntillismo and zig-zag socks, with spread eagle wings of striped carved feathers, an Aztec-style feather crown, eagle talons in front, jaguar paws behind, a curled banded tail ending in a feather fan, and a roaring jaw that opens.",
};

// ---------------------------------------------------------------------------------------------
// Small math helpers

type V = THREE.Vector3;
type SC = readonly [number, number];
const DEG = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);
const zig = (x: number) => Math.abs(fract(x) * 2 - 1);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const nrm = (x: number, y: number, z: number) => v3(x, y, z).normalize();
function cyc<T>(list: readonly T[], k: number): T {
  return list[((k % list.length) + list.length) % list.length];
}

// ---------------------------------------------------------------------------------------------
// Palette: the bright enamel colours of a Oaxacan workshop

const C = {
  ink: "#1d1424",
  white: "#fbf6ea",
  cream: "#fff1cf",
  magenta: "#e0287a",
  pink: "#ff8fb4",
  red: "#d8322a",
  orange: "#f58a1f",
  yellow: "#ffd23a",
  gold: "#ffb52e",
  lime: "#8fd13a",
  turq: "#16b8b0",
  cobalt: "#2546b8",
  purple: "#7b3fb0",
  mouth: "#7a1630",
  nose: "#3a1e4a",
};

const WARM: Rgb = [1, 0.95, 0.8];
const COOL: Rgb = [0.24, 0.2, 0.42];

/** Light the form: a warm glaze on upward faces, a cool violet shade underneath. */
function shade(c: Rgb, n: V): Rgb {
  const up = smoothstep(0.35, 1, n.y);
  const down = smoothstep(-0.15, -1, n.y);
  const o = mix(c, WARM, 0.14 * up);
  return mix(o, COOL, 0.32 * down);
}

/** Wraps a pattern function so it is lit like a painted carving. */
function lit(fn: (p: V, n: V, s: SC) => ColorInput): Paint {
  return paint((p, n, s) => shade(resolve(fn(p, n, s), p, n), n));
}

// ---------------------------------------------------------------------------------------------
// Pattern pieces

const tA = new THREE.Vector3();
const tB = new THREE.Vector3();
const tV = new THREE.Vector3();

/** A jaguar rosette painted alebrije style: centre, ink ring, colour ring, ink ring, white dot halo. */
function rosette(p: V, n: V, size: number, seed: number, ring: string, inner: string): string | null {
  const c = cells(p, size, seed);
  if (c.id > 0.72) return null;
  const r = c.d1;
  if (r > 0.47) return null;
  if (r < 0.12) return inner;
  if (r < 0.165) return C.ink;
  if (r < 0.27) return ring;
  if (r < 0.315) return C.ink;
  if (r > 0.36) {
    tA.set(0, 1, 0);
    if (Math.abs(n.y) > 0.9) tA.set(1, 0, 0);
    tA.crossVectors(n, tA).normalize();
    tB.crossVectors(n, tA);
    tV.copy(p).sub(c.center);
    const a = Math.atan2(tV.dot(tB), tV.dot(tA)) / (Math.PI * 2);
    if (Math.abs(fract(a * 10) - 0.5) < 0.24) return C.white;
  }
  return null;
}

/** The jaguar coat: orange-gold ground, rosettes, puntillismo dots, dorsal zig-zag, toothed cream belly. */
const bodyRaw = (p: V, n: V): ColorInput => {
  const edge = n.y + 0.14 * zig(p.z / 0.055 + p.x / 0.055);
  if (edge < -0.5) {
    const d = cells(p, 0.045, 11);
    if (d.d1 < 0.2) return d.id < 0.5 ? C.turq : C.magenta;
    return C.cream;
  }
  if (edge < -0.43) return C.ink;
  if (edge < -0.38) return C.red;
  const ax = Math.abs(p.x);
  if (n.y > 0.5 && p.y > 0.6 && ax < 0.03 + 0.02 * zig(p.z / 0.05)) return ax < 0.01 ? C.yellow : C.magenta;
  const ro = rosette(p, n, 0.14, 3, C.turq, C.magenta);
  if (ro) return ro;
  const dc = cells(p, 0.04, 7);
  if (dc.d1 < 0.16) return dc.id < 0.33 ? C.red : dc.id < 0.66 ? C.cobalt : C.ink;
  return mix(C.orange, C.yellow, 0.25 + 0.5 * noise(p, 0.25, 2));
};

/** Hind legs: the coat, then zig-zag striped socks near the ground. */
const SOCK = [C.magenta, C.yellow, C.cobalt, C.yellow, C.turq, C.yellow];
const legRaw = (p: V, n: V): ColorInput => {
  const h = p.y + 0.012 * zig((p.x + p.z) / 0.03);
  if (h < 0.3) {
    const q = h / 0.06;
    const k = Math.floor(q);
    const f = q - k;
    if (f < 0.14) return C.ink;
    const col = cyc(SOCK, k);
    if (col === C.yellow && Math.abs(f - 0.57) < 0.22) {
      const d = cells(p, 0.028, 17);
      if (d.d1 < 0.24) return C.red;
    }
    return col;
  }
  return bodyRaw(p, n);
};

/** Eagle shanks: golden scales below the cuff. */
const SCALEP = scales([C.yellow, C.gold], C.orange, { size: 0.018 });
const flegRaw = (p: V, n: V): ColorInput => {
  const h = p.y + 0.012 * zig((p.x + p.z) / 0.03);
  if (h < 0.27) return SCALEP;
  if (h < 0.29) return C.ink;
  if (h < 0.315) return C.magenta;
  if (h < 0.325) return C.ink;
  return bodyRaw(p, n);
};

const pawRaw = (p: V): ColorInput => {
  const d = cells(p, 0.034, 23);
  if (d.d1 < 0.2) return C.yellow;
  if (d.d1 < 0.26) return C.ink;
  return C.magenta;
};

/** The face: yellow with small magenta rosettes and blue speckles, warming to orange underneath. */
const headRaw = (p: V, n: V): ColorInput => {
  const ro = rosette(p, n, 0.075, 5, C.magenta, C.turq);
  if (ro) return ro;
  const dc = cells(p, 0.03, 9);
  if (dc.d1 < 0.17) return dc.id < 0.5 ? C.cobalt : C.red;
  return mix(C.yellow, C.orange, smoothstep(0.3, -0.6, n.y) * 0.8 + 0.15 * noise(p, 0.1, 4));
};

const muzzleRaw = (p: V): ColorInput => {
  const d = cells(p, 0.022, 31);
  if (d.d1 < 0.2) return C.turq;
  return C.cream;
};

/** Tail rings with toothed edges, dots on the yellow rings. */
const TAILC = [C.magenta, C.yellow, C.turq, C.yellow, C.purple, C.orange];
const tailRaw = (_p: V, _n: V, s: SC): ColorInput => {
  const q = s[0] * 16 + 0.3 * zig(s[1] / 40);
  const k = Math.floor(q);
  const f = q - k;
  if (f < 0.12) return C.ink;
  const col = cyc(TAILC, k);
  if (col === C.yellow && Math.abs(f - 0.56) < 0.18 && Math.abs(fract(s[1] / 36) - 0.5) < 0.2) return C.red;
  return col;
};

/** Wing bones: cobalt and turquoise bands split by yellow zig-zags, white dots. */
const armRaw = (_p: V, _n: V, s: SC): ColorInput => {
  const q = s[0] * 10 + 0.25 * zig(s[1] / 45);
  const k = Math.floor(q);
  const f = q - k;
  if (f < 0.1) return C.yellow;
  if (Math.abs(f - 0.55) < 0.16 && Math.abs(fract(s[1] / 45) - 0.5) < 0.18) return C.white;
  return k % 2 === 0 ? C.cobalt : C.turq;
};

const BODY = lit((p, n) => bodyRaw(p, n));
const LEG = lit((p, n) => legRaw(p, n));
const FLEG = lit((p, n) => flegRaw(p, n));
const SCALE = lit(() => SCALEP);
const PAW = lit((p) => pawRaw(p));
const HEAD = lit((p, n) => headRaw(p, n));
const MUZ = lit((p) => muzzleRaw(p));
const TAIL = lit(tailRaw);
const WINGARM = lit(armRaw);
const BEAD = lit((p) => (cells(p, 0.02, 41).d1 < 0.25 ? C.yellow : C.cobalt));
const KNOB = lit((p) => (cells(p, 0.022, 43).d1 < 0.22 ? C.white : C.magenta));

/** A carved feather painted with chevron bands, a cream shaft, white dots and an eyed tip (s = outline metres). */
function featherPaint(L: number, W: number, bands: readonly string[], tip: string): Paint {
  return lit((_p, _n, s) => {
    const u = s[0] / L;
    const v = Math.abs(s[1]) / W;
    if (u > 0.82) {
      const d = Math.hypot((u - 0.9) * L, s[1]);
      if (d < W * 0.2) return C.ink;
      if (d < W * 0.34) return C.white;
      return tip;
    }
    if (u > 0.78) return C.ink;
    if (v < 0.07) return C.cream;
    const q = (u - 0.32 * v) * 6.5;
    const k = Math.floor(q);
    const f = q - k;
    if (f < 0.13) return C.ink;
    if (Math.abs(f - 0.57) < 0.16 && Math.abs(v - 0.5) < 0.13) return C.white;
    return cyc(bands, k);
  });
}

/** A feather outline: root at the origin, tip at x = L, half width W. */
function featherOutline(L: number, W: number): Array<[number, number]> {
  return [
    [0, -W * 0.32],
    [L * 0.22, -W],
    [L * 0.62, -W * 0.9],
    [L * 0.9, -W * 0.5],
    [L, 0],
    [L * 0.9, W * 0.5],
    [L * 0.62, W * 0.9],
    [L * 0.22, W],
    [0, W * 0.32],
  ];
}

// ---------------------------------------------------------------------------------------------
// Drawings

function makeTextures() {
  let spokes = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * DEG;
    const x1 = 52 + Math.sin(a) * 17;
    const y1 = 53 - Math.cos(a) * 17;
    const x2 = 52 + Math.sin(a) * 22;
    const y2 = 53 - Math.cos(a) * 22;
    spokes += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${C.ink}" stroke-width="2"/>`;
  }
  const eye = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="${C.ink}"/>
      <circle cx="50" cy="50" r="45" fill="${C.yellow}"/>
      <circle cx="50" cy="50" r="40.5" fill="none" stroke="${C.magenta}" stroke-width="5" stroke-dasharray="4.2 4.2"/>
      <circle cx="50" cy="50" r="35" fill="${C.ink}"/>
      <circle cx="50" cy="50" r="31.5" fill="${C.white}"/>
      <circle cx="52" cy="53" r="23" fill="${C.turq}"/>
      <circle cx="52" cy="53" r="16" fill="${C.lime}"/>
      <path d="M36 53 A16 16 0 0 0 68 53 Z" fill="${C.orange}"/>
      ${spokes}
      <circle cx="52" cy="53" r="23" fill="none" stroke="${C.ink}" stroke-width="3"/>
      <ellipse cx="52" cy="53" rx="6.5" ry="13" fill="${C.ink}"/>
      <circle cx="43" cy="42" r="6.5" fill="#ffffff"/>
      <circle cx="61" cy="63" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  let petals = "";
  let inner = "";
  let dots = "";
  for (let i = 0; i < 8; i++) {
    petals += `<ellipse cx="0" cy="-28" rx="11" ry="19" transform="rotate(${i * 45})" fill="${C.magenta}" stroke="${C.ink}" stroke-width="3"/>`;
    inner += `<ellipse cx="0" cy="-17" rx="7" ry="11" transform="rotate(${i * 45 + 22.5})" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2.5"/>`;
    dots += `<circle cx="0" cy="-35" r="3" fill="${C.white}" transform="rotate(${i * 45})"/>`;
    dots += `<circle cx="0" cy="-6" r="1.8" fill="${C.white}" transform="rotate(${i * 45 + 22.5})"/>`;
  }
  const flower = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50 50)">
        ${petals}${inner}
        <circle r="10" fill="${C.turq}" stroke="${C.ink}" stroke-width="3"/>
        ${dots}
      </g>
    </svg>`,
    { size: 256 },
  );

  let rays = "";
  for (let i = 0; i < 12; i++)
    rays += `<path d="M-8 -29 L0 -48 L8 -29 Z" transform="rotate(${i * 30})" fill="${i % 2 ? C.red : C.orange}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const sun = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50 50)">
        ${rays}
        <circle r="31" fill="${C.yellow}" stroke="${C.ink}" stroke-width="3"/>
        <circle r="25" fill="none" stroke="${C.magenta}" stroke-width="4" stroke-dasharray="3 3"/>
        <path d="M0 0 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0" fill="none" stroke="${C.cobalt}" stroke-width="3.5" stroke-linecap="round"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const heartPath = "M50 92 C22 72 8 54 14 38 C20 22 42 22 50 38 C58 22 80 22 86 38 C92 54 78 72 50 92 Z";
  const heart = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M36 30 C30 18 40 10 38 2 C50 10 52 20 47 30 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="2.2"/>
      <path d="M52 30 C48 16 58 10 58 3 C68 12 66 22 60 31 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2.2"/>
      <path d="${heartPath}" fill="${C.red}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="${heartPath}" transform="translate(50 58) scale(0.78) translate(-50 -58)" fill="none" stroke="${C.white}" stroke-width="3.2" stroke-dasharray="2.5 4" stroke-linecap="round"/>
      <circle cx="50" cy="56" r="11" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2.5"/>
      <circle cx="50" cy="56" r="5" fill="${C.cobalt}"/>
    </svg>`,
    { size: 256 },
  );

  const swirl = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="${C.turq}" stroke="${C.ink}" stroke-width="5"/>
      <g transform="translate(46 50) scale(2)">
        <path d="M0 0 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0 a15 15 0 0 1 30 0" fill="none" stroke="${C.yellow}" stroke-width="3" stroke-linecap="round"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  const featherPathD = "M20 99 C5 80 3 38 20 3 C37 38 35 80 20 99 Z";
  const ruff = (a: string, bb: string, c: string, id: string) =>
    svg(
      `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
        <defs><clipPath id="${id}"><path d="${featherPathD}"/></clipPath></defs>
        <g clip-path="url(#${id})">
          <rect width="40" height="100" fill="${a}"/>
          <rect x="0" y="0" width="40" height="15" fill="${c}"/>
          <path d="M0 30 L20 18 L40 30 L40 44 L20 32 L0 44 Z" fill="${bb}"/>
          <path d="M0 62 L20 50 L40 62 L40 75 L20 63 L0 75 Z" fill="${c}"/>
        </g>
        <path d="${featherPathD}" fill="none" stroke="${C.ink}" stroke-width="3"/>
        <path d="M20 96 L20 10" stroke="${C.cream}" stroke-width="2.6"/>
        <circle cx="13" cy="54" r="2.8" fill="${C.white}"/>
        <circle cx="27" cy="54" r="2.8" fill="${C.white}"/>
        <circle cx="14" cy="86" r="2.4" fill="${C.white}"/>
        <circle cx="26" cy="86" r="2.4" fill="${C.white}"/>
      </svg>`,
      { size: 128 },
    );
  const ruffA = ruff(C.magenta, C.yellow, C.turq, "fa");
  const ruffB = ruff(C.cobalt, C.orange, C.lime, "fb");

  return { eye, flower, sun, heart, swirl, ruffA, ruffB };
}

// ---------------------------------------------------------------------------------------------
// The model

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", paintSize: 2048 });
  const T = makeTextures();

  /** A unit sphere with its poles on local Z (for parts oriented in a forward-pointing bone's frame). */
  const ball = (w: number, h: number) => new THREE.SphereGeometry(1, w, h).rotateX(Math.PI / 2);

  /** One carved feather: an extruded plate with root at `root`, pointing along `dir`, lying in the plane of `planeN`. */
  const feather = (
    root: V,
    dir: V,
    planeN: V,
    L: number,
    W: number,
    color: Paint,
    bone: Joint,
    roll = 0,
    thick = 0.016,
  ) => {
    const x = dir.clone().normalize();
    const y = new THREE.Vector3().crossVectors(planeN, x).normalize();
    if (roll) {
      const z = new THREE.Vector3().crossVectors(x, y);
      y.multiplyScalar(Math.cos(roll * DEG)).addScaledVector(z, Math.sin(roll * DEG));
    }
    return b.extrude(featherOutline(L, W), {
      at: root,
      x,
      y,
      thickness: thick,
      bevel: 0.004,
      smoothing: 1,
      color,
      bone,
    });
  };

  // ----------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.66, -0.42] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.42],
      [0, 0.68, -0.06],
      [0, 0.72, 0.3],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.44],
      [0, 0.94, 0.58],
      [0, 1.05, 0.7],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.06, 0.72], dir: [0, -0.06, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.075 }),
    aim: head.local({ forward: 0.3, down: 0.11 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.7, -0.48],
      [0, 0.64, -0.76],
      [0, 0.8, -1.0],
      [0, 1.06, -1.06],
      [0, 1.28, -0.98],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  // ----------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.66, -0.58], w: 0.24, h: 0.24 },
      { at: [0, 0.665, -0.45], w: 0.4, h: 0.4 },
      { at: [0, 0.67, -0.22], w: 0.42, h: 0.4 },
      { at: [0, 0.675, 0.04], w: 0.37, h: 0.37 },
      { at: [0, 0.71, 0.28], w: 0.44, h: 0.46 },
      { at: [0, 0.75, 0.46], w: 0.36, h: 0.4 },
      { at: [0, 0.79, 0.57], w: 0.2, h: 0.24 },
    ],
    { bone: spine, color: BODY },
  );

  // carved dorsal spikes, alternating enamel colours
  let spikeK = 0;
  b.along(
    body,
    6,
    (at) => {
      const col = cyc([C.magenta, C.turq, C.yellow], spikeK);
      const h = spikeK % 2 === 0 ? 0.09 : 0.07;
      spikeK++;
      b.stick(new THREE.ConeGeometry(0.032, h, 6), col, at, { embed: 0.3 });
    },
    { from: 0.15, to: 0.6 },
  );

  // painted emblems on the flanks, haunches and chest
  for (const s of [1, -1]) {
    b.decal(body, T.flower, { at: [s * 0.2, 0.78, -0.32], dir: [s, 0.45, -0.1], size: [0.15, 0.15], mirror: s < 0 });
    b.decal(body, T.sun, { at: [s * 0.2, 0.7, -0.02], dir: [s, 0.1, 0], size: [0.15, 0.15], mirror: s < 0 });
  }
  b.decal(body, T.heart, { at: [0, 0.64, 0.52], dir: [0, -0.15, 1], size: [0.13, 0.13] });

  // ----------------------------------------------------------------- neck and ruff
  b.sweep(neck, [0.15, 0.12], { color: BODY });
  const ruffRing = b.ring(neck.at(0.42), { count: 16, radius: 0.12 });
  b.cards(ruffRing.items, [T.ruffA, T.ruffB], {
    size: [0.075, 0.17],
    lean: 50,
    bend: 25,
    vary: 0.15,
    spin: 10,
    rng: rng(21),
  });

  // ----------------------------------------------------------------- head
  const onHead = (geo: THREE.BufferGeometry, color: string | Paint, pt: V, scale: [number, number, number]) =>
    b.part(geo, color, { bone: head, frame: head.moved(pt), scale });

  const skull = onHead(ball(12, 9), HEAD, head.local({ forward: 0.02, up: 0.04 }), [0.2, 0.17, 0.165]);
  const muzzle = onHead(ball(10, 8), MUZ, head.local({ forward: 0.15, down: 0.03 }), [0.12, 0.115, 0.068]);
  onHead(ball(8, 6), C.mouth, head.local({ forward: 0.15, down: 0.083 }), [0.085, 0.09, 0.018]);
  onHead(ball(8, 6), C.nose, head.local({ forward: 0.25, up: 0.0 }), [0.048, 0.032, 0.03]);
  onHead(ball(6, 4), C.white, head.local({ forward: 0.262, up: 0.022, left: 0.012 }), [0.012, 0.01, 0.007]);

  // nose bridge stripe
  b.capsule(head.local({ forward: 0.13, up: 0.08 }), head.local({ forward: 0.235, up: 0.025 }), [0.02, 0.016], {
    bone: head,
    color: C.magenta,
  });
  b.capsule(head.local({ forward: 0.14, up: 0.095 }), head.local({ forward: 0.23, up: 0.04 }), 0.006, {
    bone: head,
    color: C.yellow,
  });

  const skullSurf = b.surface(skull);
  const muzzleSurf = b.surface(muzzle);

  // big painted eyes with raised yellow rims and magenta brows
  for (const s of [1, -1]) {
    const eyeDir = nrm(s * 0.38, 0.12, 1);
    const target = head.local({ left: s * 0.085, up: 0.09, forward: 0.12 });
    const origin = target.clone().addScaledVector(eyeDir, 0.4);
    const hit = skullSurf.ray(origin, eyeDir.clone().negate());
    const eyeC = hit ? hit.at.clone() : target;
    b.decal(skull, T.eye, { at: eyeC, dir: eyeDir, size: [0.115, 0.115], mirror: s < 0 });

    const u = new THREE.Vector3().crossVectors(eyeDir, v3(0, 1, 0)).normalize();
    const w = new THREE.Vector3().crossVectors(u, eyeDir).normalize();
    const rimPts: V[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      rimPts.push(
        eyeC
          .clone()
          .addScaledVector(eyeDir, 0.01)
          .addScaledVector(u, Math.cos(a) * 0.06)
          .addScaledVector(w, Math.sin(a) * 0.06),
      );
    }
    b.sweep(skullSurf.drape(catmull(rimPts, { closed: true }), { lift: 0.005 }), 0.008, {
      bone: head,
      color: C.yellow,
    });

    const brow = catmull([
      head.local({ left: s * 0.03, up: 0.165, forward: 0.15 }),
      head.local({ left: s * 0.085, up: 0.19, forward: 0.12 }),
      head.local({ left: s * 0.145, up: 0.16, forward: 0.08 }),
    ]);
    b.sweep(skullSurf.drape(brow, { lift: 0.01 }), [0.017, 0.011], { bone: head, color: C.magenta });
  }

  // forehead sun
  b.decal(skull, T.sun, {
    at: head.local({ up: 0.2, forward: 0.0 }),
    dir: [0, 1, 0.3],
    up: [0, 0, -1],
    size: [0.075, 0.075],
  });

  // whisker dots and wire whiskers
  for (const s of [1, -1]) {
    for (let j = 0; j < 5; j++) {
      const row = j % 2;
      const hit = muzzleSurf.nearest(
        head.local({ left: s * (0.055 + 0.018 * j), forward: 0.215 - 0.022 * j, up: -0.005 - 0.016 * row }),
      );
      b.stick(new THREE.SphereGeometry(0.008, 6, 4), C.ink, hit, { embed: 0.4, bone: head });
      if (j % 2 === 0)
        b.spike(hit, nrm(s, 0.12 - 0.08 * j, 0.25), 0.16, 0.004, { bone: head, color: C.ink });
    }
  }

  // upper fangs
  for (const s of [1, -1]) {
    b.spike(head.local({ left: s * 0.05, forward: 0.21, down: 0.07 }), [0, -1, 0.05], 0.045, 0.014, {
      bone: head,
      color: C.white,
    });
    b.spike(head.local({ left: s * 0.02, forward: 0.235, down: 0.07 }), [0, -1, 0.05], 0.022, 0.008, {
      bone: head,
      color: C.white,
    });
  }

  // lower jaw, teeth and tongue
  b.part(ball(10, 7), MUZ, { bone: jaw, frame: jaw.moved(jaw.local([0, 0.1, 0])), scale: [0.1, 0.11, 0.038] });
  b.part(ball(8, 5), C.red, { bone: jaw, frame: jaw.moved(jaw.local([0, 0.08, -0.025])), scale: [0.07, 0.08, 0.02] });
  b.capsule(jaw.local([0, 0.03, 0.022]), jaw.local([0, 0.15, 0.026]), [0.026, 0.022], { bone: jaw, color: C.pink });
  b.capsule(jaw.local([0, 0.05, 0.047]), jaw.local([0, 0.13, 0.049]), 0.004, { bone: jaw, color: C.magenta });
  for (const s of [1, -1]) {
    b.spike(jaw.local([s * 0.055, 0.17, 0.02]), jaw.dir([0, 0.15, 1]), 0.035, 0.009, { bone: jaw, color: C.white });
    b.spike(jaw.local([s * 0.07, 0.12, 0.022]), jaw.dir([0, 0.1, 1]), 0.02, 0.007, { bone: jaw, color: C.white });
  }

  // round jaguar ears with magenta inners and turquoise swirls
  const EAR: Array<[number, number]> = [
    [-0.055, 0],
    [0.055, 0],
    [0.075, 0.06],
    [0.05, 0.115],
    [0, 0.13],
    [-0.05, 0.115],
    [-0.075, 0.06],
  ];
  const EARIN: Array<[number, number]> = [
    [-0.035, 0.012],
    [0.035, 0.012],
    [0.048, 0.055],
    [0.03, 0.09],
    [0, 0.1],
    [-0.03, 0.09],
    [-0.048, 0.055],
  ];
  for (const s of [1, -1]) {
    const earAt = head.local({ left: s * 0.125, up: 0.15, back: 0.01 });
    const ex = nrm(s, -0.4, 0);
    const ey = nrm(s * 0.4, 1, 0);
    b.extrude(EAR, { at: earAt, x: ex, y: ey, thickness: 0.035, bevel: 0.01, smoothing: 2, color: HEAD, bone: head });
    b.extrude(EARIN, {
      at: earAt.clone().add(v3(0, 0, 0.02)),
      x: ex,
      y: ey,
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 2,
      color: C.magenta,
      bone: head,
    });
    b.part(new THREE.CircleGeometry(0.026, 14), "#ffffff", {
      bone: head,
      at: earAt.clone().addScaledVector(ey, 0.055).add(v3(0, 0, 0.0285)),
      dir: [0, 0, 1],
      axis: "z",
      texture: T.swirl,
    });
  }

  // feather crown: an Aztec penacho fanning behind the ears
  const CREST_A = [C.red, C.yellow, C.turq];
  const CREST_B = [C.lime, C.magenta, C.yellow];
  const crestN = v3(0, 0.45, 1).normalize();
  for (let i = 0; i < 7; i++) {
    const a = (-54 + i * 18) * DEG;
    const dir = v3(Math.sin(a) * 0.85, Math.cos(a), -0.45);
    const L = 0.3 - Math.abs(i - 3) * 0.022;
    const root = head.local({ up: 0.11, back: 0.08, left: Math.sin(a) * 0.07 });
    feather(root, dir, crestN, L, 0.055, featherPaint(L, 0.055, i % 2 ? CREST_B : CREST_A, C.cobalt), head, 10);
  }
  // crown band where the feathers meet the skull
  b.capsule(head.local({ up: 0.105, back: 0.075, left: 0.075 }), head.local({ up: 0.105, back: 0.075, left: -0.075 }), 0.024, {
    bone: head,
    color: KNOB,
  });

  // cheek ruff feathers framing the face
  for (const s of [1, -1]) {
    const planeN = new THREE.Vector3().crossVectors(v3(s, 0, -0.35), v3(0, 1, 0)).normalize();
    for (let i = 0; i < 4; i++) {
      const a = (-45 + i * 30) * DEG;
      const dir = v3(s * Math.cos(a), Math.sin(a), -0.35);
      const L = 0.17 - Math.abs(i - 1.5) * 0.015;
      const root = head.local({ left: s * 0.13, down: 0.02, back: 0.03 });
      feather(root, dir, planeN, L, 0.04, featherPaint(L, 0.04, [C.magenta, C.yellow, C.cobalt], C.turq), head, 8, 0.014);
    }
  }

  // ----------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // hind legs: digitigrade jaguar legs with striped socks and fat paws
    const hip = v3(s * 0.15, 0.6, -0.36);
    const footH = v3(s * 0.17, 0.06, -0.4);
    const hp = limb(hip, footH, [0.24, 0.22, 0.16], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      contact: [s * 0.17, 0, -0.36],
    });
    const hindSweep = b.sweep(hind, [0.12, 0.085, 0.065, 0.058], { color: LEG });
    const footJ = hind.joints[hind.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 10, 7), PAW, {
      bone: footJ,
      at: [footH.x, 0.055, footH.z + 0.035],
      scale: [0.085, 0.055, 0.105],
    });
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.04;
      b.part(new THREE.SphereGeometry(1, 8, 6), PAW, {
        bone: footJ,
        at: [footH.x + dx, 0.03, footH.z + 0.12 - Math.abs(i - 1.5) * 0.012],
        scale: [0.03, 0.027, 0.034],
      });
      b.spike(v3(footH.x + dx, 0.03, footH.z + 0.145 - Math.abs(i - 1.5) * 0.012), nrm(0, -0.45, 1), 0.035, 0.009, {
        bone: footJ,
        color: C.white,
      });
    }
    const hindCuff = b.surface(hindSweep).loop(hind.at(0.82), { lift: 0.005 });
    b.sweep(hindCuff, 0.014, { color: C.turq });
    let hk = 0;
    b.along(hindCuff, 8, (at) => {
      b.part(new THREE.SphereGeometry(0.015, 6, 4), cyc([C.yellow, C.magenta], hk++), { at });
    });

    // front legs: feathered eagle legs with scaled shanks and four-toed talons
    const sh = v3(s * 0.16, 0.64, 0.3);
    const footF = v3(s * 0.18, 0.06, 0.36);
    const fp = limb(sh, footF, [0.3, 0.3], [[0, 0, -1]]);
    const front = b.chain(`legF${S}`, fp, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      contact: [s * 0.18, 0, 0.38],
    });
    const frontSweep = b.sweep(front, [0.1, 0.075, 0.058], { color: FLEG });
    const pants = b.ring(front.at(0.42), { count: 9, radius: 0.07 });
    b.cards(pants.items, [T.ruffA, T.ruffB], {
      size: [0.055, 0.12],
      lean: 75,
      bend: 15,
      flow: [0, -1, 0],
      vary: 0.15,
      rng: rng(31 + (s > 0 ? 1 : 2)),
    });
    const frontCuff = b.surface(frontSweep).loop(front.at(0.84), { lift: 0.005 });
    b.sweep(frontCuff, 0.014, { color: C.magenta });
    let fk = 0;
    b.along(frontCuff, 8, (at) => {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), cyc([C.turq, C.white], fk++), { at });
    });

    const wrist = front.joints[front.joints.length - 1];
    const palmC = v3(footF.x, 0.045, footF.z + 0.01);
    b.part(new THREE.SphereGeometry(1, 9, 6), SCALE, { bone: wrist, at: palmC, scale: [0.065, 0.042, 0.07] });
    const toeAngles = [-32, 0, 32, 180];
    toeAngles.forEach((deg, i) => {
      const a = deg * DEG;
      const d = v3(s * Math.sin(a), 0, Math.cos(a));
      const len = i === 3 ? 0.075 : i === 1 ? 0.11 : 0.095;
      const end = v3(palmC.x + d.x * len, 0.024, palmC.z + d.z * len);
      const toe = b.joint(`toe${i + 1}${S}`, { parent: wrist, at: palmC, aim: end, role: "digit" });
      b.capsule(palmC, end, [0.026, 0.019], { bone: toe, color: SCALE });
      const midP = new THREE.Vector3().lerpVectors(palmC, end, 0.62);
      b.part(new THREE.TorusGeometry(0.022, 0.006, 4, 8), i % 2 ? C.turq : C.magenta, {
        bone: toe,
        at: midP,
        dir: d,
        axis: "z",
      });
      const cd = v3(d.x * 0.85, -0.4, d.z * 0.85).normalize();
      b.spike(end, cd, 0.06, 0.017, { bone: toe, color: C.ink });
    });
  }

  // ----------------------------------------------------------------- wings
  const SEC = [C.turq, C.cobalt, C.lime];
  const PRI = [C.magenta, C.purple, C.orange];
  const COV = [C.yellow, C.orange, C.red];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.15, 0.88, 0.22],
        [s * 0.42, 0.99, 0.2],
        [s * 0.7, 1.08, 0.14],
        [s * 0.95, 1.16, 0.06],
      ]),
      { parent: chest, names: [`wing1${S}`, `wing2${S}`, `wing3${S}`, `wingTip${S}`], role: "wing" },
    );
    const arm = b.sweep(wing, [0.065, 0.03], { color: WINGARM });
    let wk = 0;
    b.along(
      arm,
      9,
      (at) => {
        b.stick(new THREE.SphereGeometry(0.017, 6, 4), cyc([C.yellow, C.white, C.magenta], wk++), at, { embed: 0.4 });
      },
      { from: 0.08, to: 0.95 },
    );
    // shoulder knob and wrist bead
    b.part(new THREE.SphereGeometry(1, 10, 7), KNOB, {
      bone: wing.joints[0],
      at: [s * 0.17, 0.9, 0.22],
      scale: [0.075, 0.07, 0.075],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BEAD, {
      bone: wing.joints[2],
      at: wing.joints[2].at,
      scale: [0.05, 0.045, 0.05],
    });

    const planeN = nrm(-s * 0.3, 1, 0);
    const row = (
      count: number,
      t0: number,
      t1: number,
      L0: number,
      L1: number,
      W: number,
      dirA: V,
      dirB: V,
      lift: number,
      scheme: readonly string[],
      tip: string,
    ) => {
      for (let i = 0; i < count; i++) {
        const u = count === 1 ? 0 : i / (count - 1);
        const cp = wing.at(t0 + (t1 - t0) * u);
        const L = L0 + (L1 - L0) * u;
        const dir = new THREE.Vector3().lerpVectors(dirA, dirB, u).normalize();
        const root = cp.at.clone().add(v3(0, lift + (i % 2) * 0.006, 0));
        const bands = [cyc(scheme, i), cyc(scheme, i + 1), cyc(scheme, i + 2)];
        feather(root, dir, planeN, L, W, featherPaint(L, W, bands, tip), cp.bone ?? wing.joints[0], 10);
      }
    };
    // secondaries: long trailing feathers along the arm
    row(9, 0.1, 0.6, 0.36, 0.42, 0.062, v3(s * 0.1, -0.05, -1), v3(s * 0.3, -0.12, -1), -0.005, SEC, C.magenta);
    // primaries: fanning out from the hand
    row(7, 0.62, 1.0, 0.38, 0.44, 0.06, v3(s * 0.4, -0.1, -1), v3(s * 0.85, 0.1, -0.5), -0.005, PRI, C.cobalt);
    // coverts: short bright feathers over the roots
    row(8, 0.08, 0.9, 0.17, 0.2, 0.05, v3(s * 0.15, -0.1, -1), v3(s * 0.7, -0.03, -0.7), 0.03, COV, C.turq);
  }

  // ----------------------------------------------------------------- tail
  const tailTube = b.sweep(tail, (t: number) => 0.072 * (1 - t) + 0.03, { color: TAIL });
  let tk = 0;
  b.along(
    tailTube,
    9,
    (at) => {
      b.stick(new THREE.SphereGeometry(0.013, 6, 4), cyc([C.white, C.yellow], tk++), at, { embed: 0.4 });
    },
    { from: 0.12, to: 0.85 },
  );
  const cuffP = tail.at(0.93);
  b.part(new THREE.TorusGeometry(0.042, 0.012, 5, 10), C.yellow, {
    at: cuffP.at,
    dir: cuffP.tangent,
    axis: "z",
    bone: cuffP.bone ?? tail.joints[tail.joints.length - 1],
  });
  const tEnd = tail.at(1);
  const tailBone = tEnd.bone ?? tail.joints[tail.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.055, 9, 6), BEAD, { at: tEnd.at, bone: tailBone });
  const Tt = tEnd.tangent.clone().normalize();
  const Xx = v3(1, 0, 0);
  const fanN = new THREE.Vector3().crossVectors(Tt, Xx).normalize();
  const FAN = [C.turq, C.yellow, C.magenta];
  for (let i = 0; i < 7; i++) {
    const a = (-66 + i * 22) * DEG;
    const dir = Tt.clone()
      .multiplyScalar(Math.cos(a))
      .addScaledVector(Xx, Math.sin(a))
      .addScaledVector(fanN, 0.12);
    const L = 0.44 - Math.abs(i - 3) * 0.033;
    const bands = [cyc(FAN, i), cyc(FAN, i + 1), cyc(FAN, i + 2)];
    feather(tEnd.at.clone(), dir, fanN, L, 0.075, featherPaint(L, 0.075, bands, C.purple), tailBone, 12, 0.018);
  }

  // a roaring rest pose: the jaw a little open to show tongue and fangs
  b.pose(jaw, { axis: [1, 0, 0], deg: 20 });

  return b.root;
}
```