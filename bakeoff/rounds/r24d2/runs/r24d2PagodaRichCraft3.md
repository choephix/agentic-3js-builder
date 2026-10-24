```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, aim, paint, mix, noise, smoothstep, grain, svg, catmull, bezier } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gojunoto - five-storey pagoda",
  description:
    "A Japanese temple pagoda on a two-tier stone kidan: five vermilion-pillared storeys with plaster walls, painted friezes, lattice windows and bracket sets, curved tiled hip roofs with tomoe eave tiles, corner wind bells, balconies, and a bronze sorin finial with nine rings, water flames and suspension chains.",
};

type V = [number, number, number];
type Fill = string | Paint;
type B = ReturnType<typeof createBuilder>;

// ---------------------------------------------------------------------------------------------------------------
// Palette

const PLASTER = "#efe6d0";
const BEAM = "#6e1a12";
const ARM = "#9c2a1b";
const GREEN = "#2f6b5c";
const END = "#eee5cc";
const STONE_DK = "#5d5a53";
const STONE_LT = "#aaa798";
const DECK = "#8c6a48";
const SLAB = "#4e3224";
const GOLD = "#dcae3c";
const RIDGE = "#2b3138";
const ORN = "#2e343c";
const UNDER = "#3a2a20";
const FASCIA = "#e9dfc3";
const RAFTER = "#4a2c20";
const BRONZE_F = "#7d6a3c";
const CHAIN = "#2d2b27";
const BLACK = "#1b1411";
const VERM = "#c3321e";
const VERM_DK = "#8d2216";

const fract = (x: number) => x - Math.floor(x);
const hash2 = (a: number, b: number) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const PLASTER_TEX = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f2e1"/><stop offset="0.65" stop-color="#efe6cf"/><stop offset="1" stop-color="#cbbf9e"/></linearGradient></defs>
  <rect width="128" height="128" fill="url(#g)"/>
  <g stroke="#b3a684" stroke-opacity="0.35" stroke-width="1.4" fill="none">
    <path d="M20 0 L22 40 L19 92"/><path d="M60 0 L58 55 L62 112"/><path d="M102 0 L104 36 L99 84"/>
  </g>
  <path d="M72 30 l6 8 l-3 9 l7 10 l-2 7" stroke="#8f8368" stroke-opacity="0.5" stroke-width="1" fill="none"/>
  <g fill="#a99b78" fill-opacity="0.3"><circle cx="30" cy="104" r="5"/><circle cx="84" cy="112" r="7"/><circle cx="110" cy="96" r="4"/><circle cx="50" cy="118" r="6"/></g>
  <rect x="2" y="2" width="124" height="124" fill="none" stroke="#d6caa9" stroke-width="3"/>
</svg>`,
  { size: 128 },
);

const doorStuds = [9, 57]
  .map((x0) => {
    let s = "";
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) s += `<circle cx="${x0 + 6 + c * 11}" cy="${16 + r * 10}" r="1.7" fill="#e2b444" stroke="#6b4a10" stroke-width="0.5"/>`;
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) s += `<circle cx="${x0 + 6 + c * 11}" cy="${112 + r * 10}" r="1.7" fill="#e2b444" stroke="#6b4a10" stroke-width="0.5"/>`;
    return s;
  })
  .join("");

const DOOR_TEX = svg(
  `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="140" fill="#2a1710"/>
  <rect x="4" y="4" width="44" height="132" fill="#b8301f" stroke="#5a140c" stroke-width="1.5"/>
  <rect x="52" y="4" width="44" height="132" fill="#b8301f" stroke="#5a140c" stroke-width="1.5"/>
  <g fill="#a62a1a" stroke="#6e1a10" stroke-width="1.4">
    <rect x="9" y="9" width="34" height="34"/><rect x="9" y="50" width="34" height="48"/><rect x="9" y="104" width="34" height="27"/>
    <rect x="57" y="9" width="34" height="34"/><rect x="57" y="50" width="34" height="48"/><rect x="57" y="104" width="34" height="27"/>
  </g>
  <rect x="4" y="44" width="44" height="5" fill="#7d1c11"/><rect x="52" y="44" width="44" height="5" fill="#7d1c11"/>
  <rect x="4" y="99" width="44" height="4" fill="#7d1c11"/><rect x="52" y="99" width="44" height="4" fill="#7d1c11"/>
  ${doorStuds}
  <g fill="none" stroke="#e2b444" stroke-width="2"><circle cx="44" cy="72" r="4.5"/><circle cx="56" cy="72" r="4.5"/></g>
  <g fill="#e2b444"><circle cx="44" cy="72" r="2"/><circle cx="56" cy="72" r="2"/></g>
  <rect x="49" y="4" width="2" height="132" fill="#2a1710"/>
</svg>`,
  { size: 192 },
);

const windowBars = Array.from({ length: 10 }, (_, k) => `<rect x="${9 + k * 8.4}" y="6" width="4.2" height="88" fill="#b8301f"/><rect x="${9 + k * 8.4}" y="6" width="1.2" height="88" fill="#d9573a"/>`).join("");
const WINDOW_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#2a1710"/>
  <rect x="6" y="6" width="88" height="88" fill="#100b09"/>
  ${windowBars}
  <rect x="6" y="30" width="88" height="4" fill="#7d1c11"/><rect x="6" y="66" width="88" height="4" fill="#7d1c11"/>
  <rect x="2" y="2" width="96" height="96" fill="none" stroke="#6e1a10" stroke-width="4"/>
</svg>`,
  { size: 128 },
);

const vine = Array.from({ length: 8 }, (_, k) => `<g transform="translate(${k * 50} 0)">
  <path d="M2 28 C10 8 30 6 34 18 C36 26 26 28 24 21 C23 16 30 14 31 18" stroke="#e0b040" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M34 18 C40 10 46 12 50 20" stroke="#e0b040" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M16 14 C20 5 30 7 28 13 C24 13 19 16 16 14Z" fill="#e0b040"/>
  <circle cx="42" cy="27" r="3.2" fill="#b8301f" stroke="#5a140c" stroke-width="0.8"/>
  <circle cx="12" cy="31" r="2" fill="#f0e6c8"/></g>`).join("");
const FRIEZE_TEX = svg(
  `<svg viewBox="0 0 400 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="40" fill="#2d6b5b"/>
  <rect width="400" height="5" fill="#b8301f"/><rect y="5" width="400" height="1.6" fill="#e0b040"/>
  <rect y="35" width="400" height="5" fill="#b8301f"/><rect y="33.4" width="400" height="1.6" fill="#e0b040"/>
  ${vine}
</svg>`,
  { size: 512 },
);

const TOMOE_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#3b424b" stroke="#1d2126" stroke-width="5"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#6b7580" stroke-width="2"/>
  ${[0, 120, 240]
    .map(
      (a) => `<g transform="rotate(${a} 50 50)"><circle cx="50" cy="29" r="9" fill="#d9d3c0"/>
      <path d="M41 29 Q42 46 56 52 Q47 46 50 38 Z" fill="#d9d3c0"/></g>`,
    )
    .join("")}
</svg>`,
  { size: 96 },
);

const PLAQUE_TEX = svg(
  `<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="70" fill="#1b1411"/>
  <rect x="3" y="3" width="194" height="64" fill="none" stroke="#dcae3c" stroke-width="3"/>
  <rect x="8" y="8" width="184" height="54" fill="none" stroke="#dcae3c" stroke-width="1"/>
  ${Array.from({ length: 8 }, (_, k) => `<ellipse cx="100" cy="22" rx="6.5" ry="13" transform="rotate(${k * 45} 100 35)" fill="#dcae3c" stroke="#7a5412" stroke-width="1"/>`).join("")}
  <circle cx="100" cy="35" r="6" fill="#b8301f" stroke="#7a5412" stroke-width="1"/>
  <g stroke="#dcae3c" stroke-width="2.4" fill="none" stroke-linecap="round">
    <path d="M20 35 C30 18 50 18 58 30 C62 38 52 42 50 35"/><path d="M180 35 C170 18 150 18 142 30 C138 38 148 42 150 35"/>
  </g>
</svg>`,
  { size: 256 },
);

const LANTERN_TEX = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#d9362a"/>
  ${Array.from({ length: 9 }, (_, k) => `<rect y="${10 + k * 10}" width="200" height="1.6" fill="#8d1d14"/>`).join("")}
  <rect width="200" height="9" fill="#1b1411"/><rect y="91" width="200" height="9" fill="#1b1411"/>
  ${[50, 150].map((x) => `<circle cx="${x}" cy="50" r="19" fill="#fbe9c0" stroke="#1b1411" stroke-width="3"/>
    <circle cx="${x}" cy="50" r="8" fill="none" stroke="#b8301f" stroke-width="4"/>`).join("")}
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const PILLAR = grain(VERM, VERM_DK, { size: 0.06, axis: "y", seed: 5 });

const STONE = paint((p, n) => {
  const wob = noise(p, 0.3, 4);
  if (Math.abs(n.y) < 0.5) {
    const course = Math.floor(p.y / 0.45);
    const u = (Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x) + course * 0.53;
    const bi = Math.floor(u / 1.1);
    const fy = p.y / 0.45 - course;
    const fu = u / 1.1 - bi;
    if (fy < 0.07 || fu < 0.025) return "#575650";
    const h = hash2(bi, course);
    let c = mix("#97948a", "#b9b5a6", h);
    c = mix(c, "#6f6d65", 0.35 * wob);
    if (fy > 0.9) c = mix(c, "#d0ccbc", 0.3);
    if (p.y < 0.3 || noise(p, 0.8, 9) > 0.7) c = mix(c, "#5f7a4a", 0.28);
    return c;
  }
  if (n.y > 0.5) {
    const fu = fract(p.x / 0.9);
    const fv = fract(p.z / 0.9);
    if (fu < 0.03 || fv < 0.03) return "#69665e";
    const h = hash2(Math.floor(p.x / 0.9), Math.floor(p.z / 0.9));
    let c = mix("#a09d90", "#c3bfae", h);
    c = mix(c, "#6f6d65", 0.3 * wob);
    if (noise(p, 0.9, 12) > 0.66) c = mix(c, "#5f7a4a", 0.3);
    return c;
  }
  return "#6a6860";
});

function roofPaint(E: number): Paint {
  return paint((p, n) => {
    const ax = Math.abs(p.x);
    const az = Math.abs(p.z);
    const across = ax > az ? p.z : p.x;
    const dist = Math.max(ax, az);
    let c = mix("#38404a", "#5b6671", noise(p, 0.6, 3));
    const col = fract(across / 0.3);
    if (col < 0.16) c = mix(c, "#1f252c", 0.65);
    else if (col < 0.34) c = mix(c, "#8a97a4", 0.22);
    if (fract(dist / 0.38) < 0.07) c = mix(c, "#1f252c", 0.4);
    if (Math.abs(ax - az) < 0.12) c = mix(c, "#252b32", 0.8);
    if (dist > E - 0.4) c = mix(c, "#20262d", 0.7);
    if (n.y > 0.4 && noise(p, 0.9, 11) > 0.64) c = mix(c, "#6c8552", 0.3);
    return c;
  });
}

const BRONZE_P = metal("bronze", { verdigris: 0.45, size: 0.12 });
const GILT_P = metal("gilt", { tarnish: 0.2 });

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

const FA = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
const UPV = new THREE.Vector3(0, 1, 0);

/** Face-local (x along the face, y up, z outward) to model space. Face 0 is the front (+Z). */
function toW(f: number, lx: number, ly: number, lz: number) {
  const a = FA[f];
  return new THREE.Vector3(lx * Math.cos(a) + lz * Math.sin(a), ly, -lx * Math.sin(a) + lz * Math.cos(a));
}

function xf(g: THREE.BufferGeometry, pos: ArrayLike<number>, ry = 0) {
  g.applyMatrix4(
    new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromAxisAngle(UPV, ry),
      new THREE.Vector3(1, 1, 1),
    ),
  );
  return g;
}

class Bag {
  private groups = new Map<string, { fill: Fill; tex?: THREE.Texture; flat: boolean; geos: THREE.BufferGeometry[] }>();

  add(fill: Fill, g: THREE.BufferGeometry, tex?: THREE.Texture, flat = false) {
    const key = `${fill}|${tex ? tex.uuid : ""}|${flat}`;
    let e = this.groups.get(key);
    if (!e) this.groups.set(key, (e = { fill, tex, flat, geos: [] }));
    e.geos.push(g);
  }

  box(fill: Fill, size: V, pos: V, ry = 0) {
    this.add(fill, xf(new THREE.BoxGeometry(size[0], size[1], size[2]), pos, ry));
  }

  fbox(fill: Fill, f: number, size: V, l: V) {
    this.add(fill, xf(new THREE.BoxGeometry(size[0], size[1], size[2]), toW(f, l[0], l[1], l[2]).toArray(), FA[f]));
  }

  fplane(tex: THREE.Texture, f: number, w: number, h: number, l: V) {
    this.add("#ffffff", xf(new THREE.PlaneGeometry(w, h), toW(f, l[0], l[1], l[2]).toArray(), FA[f]), tex);
  }

  between(fill: Fill, a: THREE.Vector3, c: THREE.Vector3, w: number, h: number) {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.BoxGeometry(w, len, h);
    g.applyQuaternion(aim(d.clone().normalize()));
    const m = a.clone().add(c).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    this.add(fill, g);
  }

  flush(b: B, name: string) {
    let n = 0;
    for (const e of this.groups.values()) {
      const merged = mergeGeometries(e.geos, false);
      if (!merged) throw new Error(`could not merge ${name}`);
      b.part(merged, e.tex ? "#ffffff" : e.fill, {
        at: [0, 0, 0],
        texture: e.tex,
        flat: e.flat,
        name: `${name}.${n++}`,
      });
    }
  }
}

class Soup {
  pos: number[] = [];
  idx: number[] = [];
  v(x: number, y: number, z: number) {
    this.pos.push(x, y, z);
    return this.pos.length / 3 - 1;
  }
  t(a: number, b: number, c: number) {
    this.idx.push(a, b, c);
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    const uv = new Float32Array((this.pos.length / 3) * 2);
    for (let i = 0; i < this.pos.length / 3; i++) {
      uv[i * 2] = this.pos[i * 3] * 0.1;
      uv[i * 2 + 1] = this.pos[i * 3 + 2] * 0.1;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Roofs: curved hip roof as a height field, with upturned eaves and lifted corners

type Roof = { E: number; H: number; c: number; y: number };

function roofTop(R: Roof, x: number, z: number) {
  const ax = Math.abs(x) / R.E;
  const az = Math.abs(z) / R.E;
  const r = Math.max(ax, az);
  const m = Math.min(ax, az);
  const base = R.H * Math.pow(Math.max(1 - r, 0), 1.35);
  const kick = r > 0.78 ? 0.28 * Math.pow((r - 0.78) / 0.22, 2) : 0;
  const corner = R.c * Math.pow(r, 4) * Math.pow(m, 3);
  return R.y + base + kick + corner;
}
const thick = (r: number) => 0.2 + 0.24 * smoothstep(0.6, 1, r);
const roofUnder = (R: Roof, x: number, z: number) =>
  roofTop(R, x, z) - thick(Math.max(Math.abs(x), Math.abs(z)) / R.E);

function roofGeos(R: Roof, n = 14) {
  const top = new Soup();
  const under = new Soup();
  const side = new Soup();
  const N1 = n + 1;
  const X = (i: number) => -R.E + (2 * R.E * i) / n;
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      const x = X(i);
      const z = X(j);
      const y = roofTop(R, x, z);
      const r = Math.max(Math.abs(x), Math.abs(z)) / R.E;
      top.v(x, y, z);
      under.v(x, y - thick(r), z);
    }
  const id = (i: number, j: number) => j * N1 + i;
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const p00 = id(i, j);
      const p01 = id(i, j + 1);
      const p10 = id(i + 1, j);
      const p11 = id(i + 1, j + 1);
      const cx = X(i) + X(i + 1);
      const cz = X(j) + X(j + 1);
      if (cx * cz > 0) {
        top.t(p00, p01, p11);
        top.t(p00, p11, p10);
        under.t(p00, p11, p01);
        under.t(p00, p10, p11);
      } else {
        top.t(p00, p01, p10);
        top.t(p01, p11, p10);
        under.t(p00, p10, p01);
        under.t(p01, p10, p11);
      }
    }
  const ring: number[] = [];
  for (let i = 0; i <= n; i++) ring.push(id(i, 0));
  for (let j = 1; j <= n; j++) ring.push(id(n, j));
  for (let i = n - 1; i >= 0; i--) ring.push(id(i, n));
  for (let j = n - 1; j >= 1; j--) ring.push(id(0, j));
  ring.push(ring[0]);
  const P = (s: Soup, k: number) => new THREE.Vector3(s.pos[k * 3], s.pos[k * 3 + 1], s.pos[k * 3 + 2]);
  for (let k = 0; k < ring.length - 1; k++) {
    const ta = P(top, ring[k]);
    const tb = P(top, ring[k + 1]);
    const ua = P(under, ring[k]);
    const ub = P(under, ring[k + 1]);
    const nrm = tb.clone().sub(ta).cross(ua.clone().sub(ta));
    const out = new THREE.Vector3((ta.x + tb.x) / 2, 0, (ta.z + tb.z) / 2);
    const a = side.v(ta.x, ta.y, ta.z);
    const bb = side.v(tb.x, tb.y, tb.z);
    const c = side.v(ub.x, ub.y, ub.z);
    const d = side.v(ua.x, ua.y, ua.z);
    if (nrm.dot(out) >= 0) {
      side.t(a, bb, c);
      side.t(a, c, d);
    } else {
      side.t(a, c, bb);
      side.t(a, d, c);
    }
  }
  return { top: top.geo(), under: under.geo(), side: side.geo() };
}

// ---------------------------------------------------------------------------------------------------------------
// Small assemblies

const BELL_PTS = [
  new THREE.Vector2(0.14, 0),
  new THREE.Vector2(0.115, 0.1),
  new THREE.Vector2(0.085, 0.21),
  new THREE.Vector2(0.05, 0.27),
  new THREE.Vector2(0.0, 0.285),
];

/** A wind bell (furin) hanging from an eave corner, with clapper and paper tag. */
function windBell(bag: Bag, x: number, y: number, z: number) {
  bag.box(CHAIN, [0.02, 0.3, 0.02], [x, y - 0.15, z]);
  const by = y - 0.58;
  bag.add(BRONZE_F, xf(new THREE.LatheGeometry(BELL_PTS, 8), [x, by, z]));
  bag.add(BLACK, xf(new THREE.CircleGeometry(0.13, 8).rotateX(Math.PI / 2), [x, by + 0.02, z]));
  bag.add(BRONZE_F, xf(new THREE.SphereGeometry(0.035, 5, 4), [x, by - 0.01, z]));
  bag.box(END, [0.07, 0.2, 0.012], [x, by - 0.13, z], Math.PI / 4);
}

// ---------------------------------------------------------------------------------------------------------------
// Main

export default function build() {
  const b = createBuilder({ name: "pagoda", paintSize: 2048 });

  const N = 5;
  const WH = [3.7, 3.4, 3.1, 2.8, 2.5]; // half width of each storey's wall
  const HT = [3.5, 3.2, 3.0, 2.8, 2.7]; // pillar height
  const OUT = [2.35, 2.25, 2.15, 2.05, 1.95]; // eave overhang
  const RH = [2.5, 2.4, 2.3, 2.2, 2.9]; // roof rise
  const BASE = 1.6;
  const yF: number[] = [BASE];
  const yT: number[] = [];
  const roofs: Roof[] = [];
  for (let i = 0; i < N; i++) {
    yT[i] = yF[i] + HT[i];
    roofs[i] = { E: WH[i] + OUT[i], H: RH[i], c: 1.0, y: yT[i] + 0.75 };
    yF[i + 1] = yT[i] + 1.45;
  }

  // ---- Stone foundation (kidan)
  const T1 = 8.0;
  const T2 = 6.8;
  b.part(new THREE.BoxGeometry(2 * T1, 0.9, 2 * T1), STONE, { at: [0, 0.45, 0], name: "kidan.lower" });
  b.part(new THREE.BoxGeometry(2 * T2, 0.7, 2 * T2), STONE, { at: [0, 1.25, 0], name: "kidan.upper" });
  for (let k = 0; k < 3; k++) {
    const top = 0.9 - 0.225 * (k + 1);
    b.part(new THREE.BoxGeometry(3.6, top, 0.5), STONE, { at: [0, top / 2, T1 + 0.25 + 0.5 * k], name: `stairLow${k}` });
  }
  for (let k = 0; k < 2; k++) {
    const top = BASE - 0.233 * (k + 1);
    b.part(new THREE.BoxGeometry(3.2, top - 0.9, 0.5), STONE, {
      at: [0, (top + 0.9) / 2, T2 + 0.25 + 0.5 * k],
      name: `stairUp${k}`,
    });
  }
  {
    const bag = new Bag();
    const coping = (half: number, yTop: number, gap: number) => {
      const w = 0.35;
      const y = yTop + 0.06;
      bag.box(STONE_LT, [2 * half, 0.12, w], [0, y, -(half - w / 2)]);
      bag.box(STONE_LT, [w, 0.12, 2 * half - 2 * w], [half - w / 2, y, 0]);
      bag.box(STONE_LT, [w, 0.12, 2 * half - 2 * w], [-(half - w / 2), y, 0]);
      const seg = half - gap / 2;
      bag.box(STONE_LT, [seg, 0.12, w], [-(gap / 2 + seg / 2), y, half - w / 2]);
      bag.box(STONE_LT, [seg, 0.12, w], [gap / 2 + seg / 2, y, half - w / 2]);
    };
    coping(T1, 0.9, 3.6);
    coping(T2, BASE, 3.2);
    // corner stones
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        bag.box(STONE_DK, [0.5, 0.2, 0.5], [sx * (T1 - 0.25), 1.0, sz * (T1 - 0.25)]);
        bag.box(STONE_DK, [0.5, 0.2, 0.5], [sx * (T2 - 0.25), BASE + 0.1, sz * (T2 - 0.25)]);
      }
    bag.flush(b, "kidanTrim");
  }

  // ---- Storeys
  for (let i = 0; i < N; i++) {
    const wh = WH[i];
    const R = roofs[i];
    const E = R.E;
    const yf = yF[i];
    const yt = yT[i];
    const bag = new Bag();

    // wall core, hidden deep in the roof above and the roof below
    const coreBottom = i === 0 ? yf : yf - 0.5;
    const coreTop = yt + 1.4;
    bag.box(PLASTER, [2 * wh, coreTop - coreBottom, 2 * wh], [0, (coreTop + coreBottom) / 2, 0]);

    const openBottom = yf + 0.12;
    const openTop = yt - 0.92;
    const bay = (2 * wh) / 3;

    for (let f = 0; f < 4; f++) {
      // pillars
      for (const s of [-1, 1]) {
        bag.fbox(PILLAR, f, [0.34, yt - yf, 0.34], [(s * wh) / 3, (yf + yt) / 2, wh]);
        bag.add(STONE_DK, xf(new THREE.CylinderGeometry(0.27, 0.31, 0.14, 8), toW(f, (s * wh) / 3, yf + 0.07, wh).toArray()));
      }
      bag.fbox(PILLAR, f, [0.44, yt - yf, 0.44], [wh, (yf + yt) / 2, wh]);
      bag.add(STONE_DK, xf(new THREE.CylinderGeometry(0.33, 0.37, 0.14, 8), toW(f, wh, yf + 0.07, wh).toArray()));

      // beams
      bag.fbox(BEAM, f, [2 * wh + 0.5, 0.32, 0.22], [0, yt - 0.16, wh + 0.11]);
      bag.fbox(BEAM, f, [2 * wh + 0.1, 0.2, 0.14], [0, yt - 0.82, wh + 0.07]);
      for (const s of [-1, 1]) bag.fbox(END, f, [0.05, 0.32, 0.22], [s * (wh + 0.25), yt - 0.16, wh + 0.11]);

      // painted frieze under the tie beam
      bag.fplane(FRIEZE_TEX, f, 2 * wh, 0.4, [0, yt - 0.52, wh + 0.02]);

      // side bays: plaster panels
      for (const s of [-1, 1]) {
        bag.fplane(PLASTER_TEX, f, bay, openTop - openBottom, [s * bay, (openTop + openBottom) / 2, wh + 0.015]);
      }

      // centre bay: door below, lattice window above
      const ow = bay - 0.4;
      if (i === 0) {
        bag.fplane(DOOR_TEX, f, ow, openTop - openBottom, [0, (openTop + openBottom) / 2, wh + 0.03]);
      } else {
        const wb = yf + 0.55;
        bag.fplane(WINDOW_TEX, f, ow, openTop - wb, [0, (openTop + wb) / 2, wh + 0.03]);
        bag.fplane(PLASTER_TEX, f, bay, wb - openBottom, [0, (wb + openBottom) / 2, wh + 0.015]);
        bag.fbox(BEAM, f, [ow + 0.1, 0.08, 0.1], [0, wb - 0.02, wh + 0.06]);
      }

      // bracket sets
      for (const lx of [-wh, -wh / 3, wh / 3, wh]) {
        const corner = Math.abs(lx) === wh;
        bag.fbox(GREEN, f, [0.4, 0.2, 0.4], [lx, yt + 0.1, wh + 0.2]);
        bag.fbox(ARM, f, [0.22, 0.16, 0.9], [lx, yt + 0.28, wh + 0.45]);
        bag.fbox(END, f, [0.24, 0.17, 0.04], [lx, yt + 0.28, wh + 0.92]);
        if (!corner) {
          bag.fbox(GREEN, f, [1.0, 0.16, 0.24], [lx, yt + 0.44, wh + 0.75]);
          for (const s of [-1, 1]) bag.fbox(END, f, [0.04, 0.17, 0.26], [lx + s * 0.5, yt + 0.44, wh + 0.75]);
          bag.fbox(ARM, f, [0.2, 0.16, 1.5], [lx, yt + 0.62, wh + 0.75]);
          bag.fbox(END, f, [0.22, 0.17, 0.04], [lx, yt + 0.62, wh + 1.52]);
          bag.fbox(ARM, f, [1.4, 0.16, 0.26], [lx, yt + 0.62, wh + 1.25]);
          for (const s of [-1, 1]) bag.fbox(END, f, [0.04, 0.18, 0.28], [lx + s * 0.7, yt + 0.62, wh + 1.25]);
        }
      }

      // corner (diagonal) arms and the long hip rafter
      {
        const c0 = toW(f, wh, yt + 0.28, wh);
        bag.between(ARM, c0, toW(f, wh + 0.75, yt + 0.28, wh + 0.75), 0.22, 0.16);
        bag.between(END, toW(f, wh + 0.75, yt + 0.28, wh + 0.75), toW(f, wh + 0.8, yt + 0.28, wh + 0.8), 0.24, 0.17);
        bag.between(ARM, toW(f, wh, yt + 0.6, wh), toW(f, wh + 1.2, yt + 0.6, wh + 1.2), 0.2, 0.16);
        const tip = toW(f, E - 0.3, 0, E - 0.3);
        tip.y = roofUnder(R, tip.x, tip.z) - 0.12;
        const start = toW(f, wh, yt + 0.4, wh);
        const dir = tip.clone().sub(start).normalize();
        const mid = tip.clone().addScaledVector(dir, -0.12);
        bag.between(BEAM, start, mid, 0.2, 0.24);
        bag.between(END, mid, tip, 0.21, 0.25);
      }

      // rafters under the roof
      for (let lx = -(E - 0.55); lx <= E - 0.55 + 1e-6; lx += 0.5) {
        const z0 = Math.max(wh, Math.abs(lx) + 0.05);
        const z1 = E - 0.08;
        if (z1 - z0 < 0.35) continue;
        const a = toW(f, lx, 0, z0);
        const c = toW(f, lx, 0, z1);
        a.y = roofUnder(R, a.x, a.z) - 0.1;
        c.y = roofUnder(R, c.x, c.z) - 0.1;
        const dir = c.clone().sub(a).normalize();
        const mid = c.clone().addScaledVector(dir, -0.1);
        bag.between(RAFTER, a, mid, 0.1, 0.14);
        bag.between(END, mid, c, 0.11, 0.15);
      }

      // round eave tiles with tomoe
      for (let t = -(E - 0.45); t <= E - 0.45 + 1e-6; t += 0.6) {
        const w = toW(f, t, 0, E);
        const y = roofTop(R, w.x, w.z) - 0.2;
        bag.add("#ffffff", xf(new THREE.CircleGeometry(0.16, 8), toW(f, t, y, E + 0.02).toArray(), FA[f]), TOMOE_TEX);
      }
    }

    // front board with lotus on the ground storey
    if (i === 0) bag.fplane(PLAQUE_TEX, 0, 1.5, 0.52, [0, yt - 0.52, wh + 0.07]);

    // roof: tiles (painted), fascia and underside
    const rg = roofGeos(R);
    b.part(rg.top, roofPaint(E), { at: [0, 0, 0], flat: true, name: `roof${i}.tiles` });
    bag.add(FASCIA, rg.side, undefined, true);
    bag.add(UNDER, rg.under);

    // wind bells at the four eave corners
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = sx * (E - 0.2);
        const z = sz * (E - 0.2);
        windBell(bag, x, roofUnder(R, x, z) - 0.02, z);
      }

    // balcony with railing (upper storeys)
    if (i > 0) {
      const Bw = wh + 0.75;
      const ri = Bw - 0.1;
      bag.box(SLAB, [2 * Bw, 0.4, 2 * Bw], [0, yf - 0.2, 0]);
      bag.box(DECK, [2 * Bw - 0.1, 0.03, 2 * Bw - 0.1], [0, yf + 0.015, 0]);
      for (let f = 0; f < 4; f++) {
        bag.fbox(VERM, f, [2 * ri + 0.1, 0.1, 0.12], [0, yf + 0.85, ri]);
        bag.fbox(VERM_DK, f, [2 * ri, 0.07, 0.08], [0, yf + 0.45, ri]);
        const count = Math.ceil((2 * ri) / 0.85);
        for (let k = 1; k < count; k++) {
          const lx = -ri + (k * 2 * ri) / count;
          bag.fbox(VERM, f, [0.1, 0.85, 0.1], [lx, yf + 0.425, ri]);
        }
        bag.fbox(VERM, f, [0.18, 1.0, 0.18], [ri, yf + 0.5, ri]);
        const cp = toW(f, ri, yf + 1.07, ri);
        bag.add(GOLD, xf(new THREE.SphereGeometry(0.11, 6, 5), cp.toArray()));
        bag.add(GOLD, xf(new THREE.ConeGeometry(0.06, 0.16, 6), [cp.x, cp.y + 0.14, cp.z]));
      }
    }

    // ground-storey door lanterns
    if (i === 0) {
      const yl = openTop;
      for (const s of [-1, 1]) {
        const lx = s * bay;
        const ctr = yl - 0.71;
        bag.fbox(BEAM, 0, [0.05, 0.05, 0.55], [lx, yl - 0.02, wh + 0.3]);
        bag.fbox(BLACK, 0, [0.02, 0.3, 0.02], [lx, yl - 0.17, wh + 0.5]);
        bag.add(BLACK, xf(new THREE.CylinderGeometry(0.12, 0.14, 0.06, 8), [lx, ctr + 0.38, wh + 0.5]));
        bag.add(BLACK, xf(new THREE.CylinderGeometry(0.14, 0.1, 0.06, 8), [lx, ctr - 0.38, wh + 0.5]));
        bag.add(GOLD, xf(new THREE.ConeGeometry(0.03, 0.2, 5), [lx, ctr - 0.52, wh + 0.5]));
        glow(
          b.part(new THREE.SphereGeometry(0.28, 10, 8), "#ffffff", {
            at: [lx, ctr, wh + 0.5],
            scale: [1, 1.25, 1],
            texture: LANTERN_TEX,
            name: `lantern${s > 0 ? "L" : "R"}`,
          }),
          1.2,
        );
      }
    }

    bag.flush(b, `storey${i}`);

    // hip ridges
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const pts: V[] = [];
        const s0 = i === N - 1 ? 0.0 : 0.25 * E;
        for (let k = 0; k <= 8; k++) {
          const s = s0 + ((E - 0.15 - s0) * k) / 8;
          pts.push([sx * s, roofTop(R, sx * s, sz * s) + 0.07, sz * s]);
        }
        b.sweep(catmull(pts), [0.14, 0.11], { color: RIDGE, sides: 6, name: `hip${i}` });
        // curled corner tile ornament
        const ox = sx * (E - 0.5);
        const oz = sz * (E - 0.5);
        const k = Math.SQRT1_2;
        b.extrude(
          [
            [0, 0],
            [0.6, 0.05],
            [0.95, 0.4],
            [1.0, 0.8],
            [0.85, 0.55],
            [0.6, 0.3],
            [0.2, 0.28],
            [0, 0.3],
          ],
          { at: [ox, roofTop(R, ox, oz) - 0.08, oz], x: [sx * k, 0, sz * k], thickness: 0.16, color: ORN, name: `cornerTile${i}` },
        );
      }
  }

  // ---- Sorin finial on the top roof
  const top = roofs[N - 1];
  const apexY = roofTop(top, 0, 0);
  const y0 = apexY - 0.15;
  b.part(new THREE.BoxGeometry(1.1, 0.3, 1.1), BRONZE_P, { at: [0, y0 + 0.15, 0], name: "roban" });
  b.lathe(
    [[0, 0], [0.48, 0], [0.5, 0.1], [0.44, 0.24], [0.3, 0.36], [0, 0.42]],
    { at: [0, y0 + 0.3, 0], segments: 10, color: BRONZE_P, name: "fukubachi" },
  );
  b.lathe(
    [[0, 0], [0.22, 0], [0.55, 0.1], [0.62, 0.22], [0.5, 0.18], [0.2, 0.14], [0, 0.14]],
    { at: [0, y0 + 0.72, 0], segments: 10, color: BRONZE_P, name: "ukebana" },
  );
  b.rod([0, y0 + 0.8, 0], [0, y0 + 4.6, 0], 0.07, { color: BRONZE_P, sides: 6, name: "sorinPole" });
  for (let k = 0; k < 9; k++) {
    const s = 1 - k * 0.03;
    b.lathe(
      [[0.1, 0], [0.46 * s, 0], [0.52 * s, 0.05], [0.46 * s, 0.1], [0.1, 0.08]],
      { at: [0, y0 + 1.1 + k * 0.26, 0], segments: 12, color: BRONZE_P, name: `kurin${k}` },
    );
  }
  const flame: [number, number][] = [
    [-0.05, 0], [0.3, 0.05], [0.32, 0.3], [0.2, 0.5], [0.25, 0.75], [0.05, 0.55], [0, 0.85],
    [-0.05, 0.55], [-0.25, 0.75], [-0.2, 0.5], [-0.32, 0.3], [-0.3, 0.05],
  ];
  b.extrude(flame, { at: [0, y0 + 3.5, 0], x: [1, 0, 0], thickness: 0.05, color: GILT_P, name: "suienA" });
  b.extrude(flame, { at: [0, y0 + 3.5, 0], x: [0, 0, 1], thickness: 0.05, color: GILT_P, name: "suienB" });
  b.lathe(
    [[0.13, -0.07], [0.2, -0.07], [0.28, 0], [0.2, 0.07], [0.13, 0.07]],
    { at: [0, y0 + 4.4, 0], segments: 10, color: GILT_P, name: "ryusha" },
  );
  b.lathe(
    [[0, 0], [0.14, 0.05], [0.2, 0.18], [0.14, 0.34], [0.05, 0.5], [0, 0.62]],
    { at: [0, y0 + 4.55, 0], segments: 8, color: GILT_P, name: "hoju" },
  );

  // suspension chains from the sorin to the top roof corners
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const cx = sx * (top.E - 0.35);
      const cz = sz * (top.E - 0.35);
      const p3: V = [cx, roofTop(top, cx, cz) + 0.2, cz];
      const p0: V = [sx * 0.05, y0 + 3.45, sz * 0.05];
      const ctrl: V = [(p0[0] + p3[0]) / 2, (p0[1] + p3[1]) / 2 - 0.9, (p0[2] + p3[2]) / 2];
      b.sweep(bezier(p0, ctrl, p3), 0.025, { color: CHAIN, sides: 5, name: "sorinChain" });
      b.part(new THREE.SphereGeometry(0.08, 6, 4), GILT_P, { at: p3, name: "chainKnob" });
    }

  return b.root;
}
```