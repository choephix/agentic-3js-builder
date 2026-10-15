import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { aim, DEG, rng } from "../src/math";
import type { FrameInput } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Arcanist's Spire",
  description:
    "A crooked low-poly wizard tower landmark, 26 m tall: leaning stone tiers on a rocky outcrop, jettied timber-framed upper floors, a twisted starry roof with an orrery and star finial, glowing round windows, a telescope balcony, a spiral outer stair, buttresses, chimneys puffing colourful smoke, banners, signs and potion-lined sills, with orbiting rune rings and floating crystals.",
};

// ---------------------------------------------------------------- palette (flat colours)
const STONE_D = "#585c78";
const STONE = "#7f84a3";
const STONE_L = "#a9adc7";
const MORTAR = "#43465c";
const ROCK_D = "#5e5048";
const ROCK = "#85715f";
const ROCK_L = "#a8927a";
const WOOD_D = "#3f2820";
const WOOD = "#6b4330";
const WOOD_L = "#9a6542";
const PLASTER = "#efdfb8";
const ROOF_D = "#232a5e";
const ROOF = "#34418e";
const ROOF_L = "#5366c2";
const ROOF_S = "#4b2c8f";
const PURPLE_L = "#9450c0";
const GOLD_D = "#9a6418";
const GOLD = "#d89a2e";
const GOLD_L = "#f5c95a";
const MOSS_D = "#35552f";
const MOSS = "#55803c";
const MOSS_L = "#86b350";
const IRON = "#2b2933";
const IRON_L = "#4c4a58";
const WIN_DARK = "#1d1530";
const TERRA = "#b5573a";
const TERRA_L = "#d97a52";
const GLOW_GOLD = "#ffc94d";
const GLOW_PURPLE = "#b56cff";
const GLOW_GREEN = "#7dff6a";
const CRYSTAL_C: [string, string, string] = ["#d2fcff", "#62e6ff", "#2c9fd6"];
const CRYSTAL_P: [string, string, string] = ["#f2d6ff", "#b873ff", "#7438cf"];
/** The fixed "light" that picks each crystal facet's glow tone, so self-lit crystals still read as faceted. */
const CRYSTAL_LIGHT = new THREE.Vector3(0.3, 0.6, 0.75).normalize();
const SMOKE: [string, string][] = [
  ["#ffb3e6", "#f477c8"],
  ["#a8fbe9", "#4fdcc2"],
  ["#d4c6ff", "#9d84f5"],
];
const POTIONS = ["#5ee07a", "#ff5a7e", "#4fb6ff", "#ffb43d"];

// ---------------------------------------------------------------- small geometry helpers
type V = THREE.Vector3;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = v3(0, 1, 0);
const ONE = v3(1, 1, 1);
const qAxis = (axis: V, deg: number) => new THREE.Quaternion().setFromAxisAngle(axis, deg * DEG);
const qX = (deg: number) => qAxis(v3(1, 0, 0), deg);
const qY = (deg: number) => qAxis(UP, deg);
const qZ = (deg: number) => qAxis(v3(0, 0, 1), deg);
const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);

/** A leaning frame: tilt `dx` degrees toward +X and `dz` toward +Z, after a yaw about its own up. */
function leanQ(dx: number, dz: number, yaw: number) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(dz * DEG, 0, -dx * DEG)).multiply(qY(yaw));
}

class F3 {
  readonly qi: THREE.Quaternion;
  constructor(
    readonly o: V,
    readonly q: THREE.Quaternion,
  ) {
    this.qi = q.clone().invert();
  }
  p(x: number, y: number, z: number) {
    return v3(x, y, z).applyQuaternion(this.q).add(this.o);
  }
  d(x: number, y: number, z: number) {
    return v3(x, y, z).applyQuaternion(this.q);
  }
  local(p: V) {
    return p.clone().sub(this.o).applyQuaternion(this.qi);
  }
  m(x: number, y: number, z: number, rotY = 0, extra?: THREE.Quaternion, scale?: V) {
    const q = this.q.clone().multiply(qY(rotY));
    if (extra) q.multiply(extra);
    return new THREE.Matrix4().compose(this.p(x, y, z), q, scale ?? ONE);
  }
  polar(th: number, r: number, y: number) {
    return this.p(r * sin(th), y, r * cos(th));
  }
}

/** An octagonal tier: faces centred at multiples of 45°, circumradius `rb` at its base and `rt` at its top. */
class Tier extends F3 {
  readonly slant: number;
  constructor(
    o: V,
    q: THREE.Quaternion,
    readonly h: number,
    readonly rb: number,
    readonly rt: number,
  ) {
    super(o, q);
    this.slant = Math.atan2(this.A(0) - this.A(h), h) / DEG;
  }
  R(y: number) {
    return this.rb + ((this.rt - this.rb) * y) / this.h;
  }
  A(y: number) {
    return this.R(y) * cos(22.5);
  }
  W(y: number) {
    return 2 * this.R(y) * sin(22.5);
  }
  top() {
    return this.p(0, this.h, 0);
  }
  /** A point on face `th`: `u` along the face (toward the face's +X), `v` up, `w` out of the face. */
  fp(th: number, u: number, v: number, w: number) {
    const a = this.A(v) + w;
    return this.p(a * sin(th) + u * cos(th), v, a * cos(th) - u * sin(th));
  }
  /** Matrix on face `th` whose local x runs along the face, y up the face and z out of it. */
  fm(th: number, u: number, v: number, w: number, extra?: THREE.Quaternion, scale?: V) {
    const q = this.q.clone().multiply(qY(th)).multiply(qX(-this.slant));
    if (extra) q.multiply(extra);
    return new THREE.Matrix4().compose(this.fp(th, u, v, w), q, scale ?? ONE);
  }
  out(th: number) {
    return this.d(sin(th), 0, cos(th));
  }
  along(th: number) {
    return this.d(cos(th), 0, -sin(th));
  }
  faceUp(th: number) {
    return v3(0, 1, 0).applyQuaternion(this.q.clone().multiply(qY(th)).multiply(qX(-this.slant)));
  }
}

/** Triangle soup with optional UVs, auto-wound to face an outward hint. */
class Tris {
  pos: number[] = [];
  uv: number[] = [];
  tri(a: V, b: V, c: V, out?: V, ua: number[] = [0, 0], ub: number[] = [0, 0], uc: number[] = [0, 0]) {
    const n = b.clone().sub(a).cross(c.clone().sub(a));
    if (n.lengthSq() < 1e-12) return;
    let [B, C, UB, UC] = [b, c, ub, uc];
    if (out && n.dot(out) < 0) [B, C, UB, UC] = [c, b, uc, ub];
    this.pos.push(a.x, a.y, a.z, B.x, B.y, B.z, C.x, C.y, C.z);
    this.uv.push(ua[0], ua[1], UB[0], UB[1], UC[0], UC[1]);
  }
  quad(a: V, b: V, c: V, d: V, out?: V, uvs?: number[][]) {
    this.tri(a, b, c, out, uvs?.[0], uvs?.[1], uvs?.[2]);
    this.tri(a, c, d, out, uvs?.[0], uvs?.[2], uvs?.[3]);
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeVertexNormals();
    return g;
  }
}

function arch(w: number, hs: number, n = 7): OutlinePoint[] {
  const pts: OutlinePoint[] = [
    [-w / 2, 0, "sharp"],
    [w / 2, 0, "sharp"],
  ];
  for (let i = 0; i <= n; i++) {
    const a = (180 * i) / n;
    pts.push([(w / 2) * cos(a), hs + (w / 2) * sin(a)]);
  }
  return pts;
}

function starShape(R: number, r: number, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < 2 * n; i++) {
    const a = 90 + (180 * i) / n;
    const rad = i % 2 ? r : R;
    if (i === 0) s.moveTo(rad * cos(a), rad * sin(a));
    else s.lineTo(rad * cos(a), rad * sin(a));
  }
  return s;
}
const starGeo = (R: number, r: number, depth: number) =>
  new THREE.ExtrudeGeometry(starShape(R, r), { depth, bevelEnabled: false }).translate(0, 0, -depth / 2);

const lathe = (pts: number[][], seg: number) =>
  new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    seg,
  );

const hash = (a: number, b: number, s: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- drawings
function runeStrip() {
  const r = rng(77);
  const G = [
    [0, 0],
    [30, 0],
    [60, 0],
    [0, 30],
    [30, 30],
    [60, 30],
    [0, 60],
    [30, 60],
    [60, 60],
  ];
  let glyphs = "";
  let dots = "";
  for (let i = 0; i < 14; i++) {
    const x0 = i * 100 + 20;
    const y0 = 20;
    const stave = r() < 0.7;
    let d = stave ? `M${x0 + 30} ${y0} L${x0 + 30} ${y0 + 60}` : "";
    const n = 2 + Math.floor(r() * 2);
    for (let k = 0; k < n; k++) {
      const a = G[Math.floor(r() * 9)];
      const c = G[Math.floor(r() * 9)];
      if (a === c) continue;
      d += ` M${x0 + a[0]} ${y0 + a[1]} L${x0 + c[0]} ${y0 + c[1]}`;
    }
    if (!d) d = `M${x0} ${y0} L${x0 + 60} ${y0 + 60}`;
    glyphs += `<path d="${d.trim()}"/>`;
    dots += `<rect x="${i * 100 + 92}" y="44" width="12" height="12" transform="rotate(45 ${i * 100 + 98} 50)"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 100"><rect width="1400" height="100" fill="#26124e"/><rect y="5" width="1400" height="7" fill="#ffcf5e"/><rect y="88" width="1400" height="7" fill="#ffcf5e"/><g stroke="#ffe08a" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter" fill="none">${glyphs}</g><g fill="#c48bff">${dots}</g></svg>`,
    { size: 2048 },
  );
}

const SIGIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="64" cy="64" r="57" stroke="#d9a6ff" stroke-width="6"/>
  <circle cx="64" cy="64" r="45" stroke="#b56cff" stroke-width="3"/>
  <path d="M64 21 L101 85 L27 85 Z" stroke="#ffd36b" stroke-width="5"/>
  <path d="M38 64 Q64 40 90 64 Q64 88 38 64 Z" stroke="#d9a6ff" stroke-width="5"/>
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return `<path d="M${64 + 49 * Math.cos(a)} ${64 + 49 * Math.sin(a)} L${64 + 54 * Math.cos(a)} ${64 + 54 * Math.sin(a)}" stroke="#ffd36b" stroke-width="4"/>`;
  }).join("")}
  </g><circle cx="64" cy="64" r="8" fill="#ffd36b"/></svg>`,
  { size: 256 },
);

const BANNER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300"><g transform="rotate(180 50 150)">
  <path d="M0 0 H100 V300 L50 252 L0 300 Z" fill="#6a2f91"/>
  <path d="M0 196 H100 V226 L50 206 L0 226 Z" fill="#9450c0"/>
  <path d="M9 22 H91 V281 L50 242 L9 281 Z" fill="none" stroke="#f5c95a" stroke-width="5"/>
  <rect width="100" height="20" fill="#3d1d5c"/>
  <circle cx="50" cy="108" r="30" fill="#f5c95a"/>
  <circle cx="62" cy="98" r="27" fill="#6a2f91"/>
  <path d="M60 92 L63.5 101 L73 101 L65.5 107 L68.5 116 L60 110.5 L51.5 116 L54.5 107 L47 101 L56.5 101 Z" fill="#f5c95a"/>
  <path d="M50 150 l7 9 l-7 9 l-7 -9 Z M50 172 l5 7 l-5 7 l-5 -7 Z" fill="#f5c95a"/>
  <circle cx="26" cy="60" r="3.5" fill="#f5c95a"/><circle cx="76" cy="150" r="3.5" fill="#f5c95a"/><circle cx="24" cy="160" r="3" fill="#f5c95a"/>
  </g></svg>`,
  { size: 512 },
);

const SIGN_POTION = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><g transform="rotate(180 60 55)">
  <path d="M14 6 H106 L114 14 V96 L106 104 H14 L6 96 V14 Z" fill="#9a6542" stroke="#3f2820" stroke-width="6"/>
  <path d="M10 40 H110 M10 72 H110" stroke="#6b4330" stroke-width="3"/>
  <rect x="53" y="22" width="14" height="22" fill="#e6f4f2"/>
  <rect x="50" y="16" width="20" height="9" fill="#c9a06a"/>
  <circle cx="60" cy="66" r="25" fill="#e6f4f2"/>
  <path d="M37 70 A23 23 0 0 0 83 70 Z" fill="#5ee07a"/>
  <circle cx="52" cy="80" r="3.5" fill="#c9ffd2"/><circle cx="66" cy="76" r="2.5" fill="#c9ffd2"/>
  </g></svg>`,
  { size: 256 },
);

const SIGN_STAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><g transform="rotate(180 60 55)">
  <path d="M60 4 L112 30 V96 L104 104 H16 L8 96 V30 Z" fill="#34418e" stroke="#f5c95a" stroke-width="6"/>
  <circle cx="52" cy="66" r="26" fill="#f5c95a"/>
  <circle cx="63" cy="58" r="23" fill="#34418e"/>
  <path d="M80 44 L83 53 L92 53 L85 59 L88 68 L80 62.5 L72 68 L75 59 L68 53 L77 53 Z" fill="#f5c95a"/>
  <circle cx="30" cy="36" r="3" fill="#f5c95a"/><circle cx="94" cy="86" r="3" fill="#f5c95a"/>
  </g></svg>`,
  { size: 256 },
);

const IVY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 64 L30 40 L34 20 L31 2" stroke="#35552f" stroke-width="3" fill="none"/>
  <path d="M30 46 L16 38 L18 50 Z M30 46 L22 56 L32 54 Z" fill="#55803c"/>
  <path d="M33 30 L50 24 L46 38 Z M33 30 L44 42 L36 44 Z" fill="#86b350"/>
  <path d="M32 14 L18 8 L20 22 Z M32 14 L40 2 L44 14 Z" fill="#55803c"/>
  <path d="M31 52 L44 52 L40 62 Z" fill="#35552f"/>
  <path d="M31 24 L20 28 L26 34 Z" fill="#35552f"/>
  </svg>`,
  { size: 128 },
);

const GRASS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M8 64 L14 22 L20 64 Z" fill="#55803c"/>
  <path d="M18 64 L26 6 L32 64 Z" fill="#86b350"/>
  <path d="M28 64 L38 18 L42 64 Z" fill="#55803c"/>
  <path d="M38 64 L50 12 L50 64 Z" fill="#86b350"/>
  <path d="M46 64 L58 30 L58 64 Z" fill="#35552f"/>
  <path d="M2 64 L4 36 L12 64 Z" fill="#35552f"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- the build
export default function build() {
  const b = createBuilder({ name: "lowPolyWizardTower", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(4242);

  // ---- merge bags: every small static piece goes in one part per tag, colour, bone and glow
  type Bag = { geos: THREE.BufferGeometry[]; color: Fill; bone: Joint; glow: number; tag: string };
  const bags = new Map<string, Bag>();
  const norm = (g0: THREE.BufferGeometry) => {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    for (const k of Object.keys(g.attributes))
      if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
    if (!g.getAttribute("uv"))
      g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute("position").count * 2), 2));
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    g.clearGroups();
    return g;
  };
  const bagFor = (tag: string, color: Fill, bone: Joint, glowS: number) => {
    const key = `${tag}|${String(color)}|${bone.name}|${glowS}`;
    let e = bags.get(key);
    if (!e) bags.set(key, (e = { geos: [], color, bone, glow: glowS, tag }));
    return e;
  };
  const put = (
    geo: THREE.BufferGeometry,
    color: Fill,
    m: THREE.Matrix4 | null,
    tag: string,
    bone: Joint = root,
    glowS = 0,
  ) => {
    const g = norm(geo);
    if (m) g.applyMatrix4(m);
    bagFor(tag, color, bone, glowS).geos.push(g);
  };
  /** Faceted two- or three-tone: each triangle takes the light, mid or dark colour by how it faces `light`. */
  const putShaded = (
    geo: THREE.BufferGeometry,
    m: THREE.Matrix4 | null,
    cols: readonly string[],
    tag: string,
    bone: Joint = root,
    glowS = 0,
    light: V = UP,
    hi = 0.55,
    lo = -0.25,
  ) => {
    const g = norm(geo);
    if (m) g.applyMatrix4(m);
    const pos = g.getAttribute("position");
    const sets: Tris[] = cols.map(() => new Tris());
    const a = v3(0, 0, 0);
    const bb = v3(0, 0, 0);
    const c = v3(0, 0, 0);
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      bb.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      const n = bb.clone().sub(a).cross(c.clone().sub(a)).normalize();
      const d = n.dot(light);
      const k = d > hi ? 0 : cols.length === 3 && d < lo ? 2 : 1;
      sets[k].tri(a.clone(), bb.clone(), c.clone());
    }
    sets.forEach((s, k) => {
      if (s.pos.length) bagFor(tag, cols[k], bone, glowS).geos.push(s.geo());
    });
  };
  const beam = (a: V, c: V, w: number, d: number, up: V) => {
    const dir = c.clone().sub(a);
    const len = dir.length();
    return {
      geo: new THREE.BoxGeometry(w, len, d),
      m: new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), aim(dir, up), ONE),
    };
  };
  const putBeam = (
    a: V,
    c: V,
    w: number,
    d: number,
    up: V,
    color: Fill,
    tag: string,
    bone: Joint = root,
    glowS = 0,
  ) => {
    const bm = beam(a, c, w, d, up);
    put(bm.geo, color, bm.m, tag, bone, glowS);
  };
  const flush = () => {
    const count = new Map<string, number>();
    for (const e of bags.values()) {
      const merged = mergeGeometries(e.geos);
      if (!merged) throw new Error(`merge failed: ${e.tag}`);
      const n = (count.get(e.tag) ?? 0) + 1;
      count.set(e.tag, n);
      const part = b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true, name: `${e.tag}${n}` });
      if (e.glow) glow(part, e.glow);
    }
    bags.clear();
  };

  // ---- stone paint: coursed blocks in three shades, light tops, dark undersides, all hard edged
  const stonePaint = (F: F3, seed: number, ch = 0.46, bw = 0.86, rRef = 3) =>
    paint((p, n) => {
      const nl = n.clone().applyQuaternion(F.qi);
      if (nl.y > 0.5) return STONE_L;
      if (nl.y < -0.5) return STONE_D;
      const l = F.local(p);
      const row = Math.floor(l.y / ch);
      const fy = l.y / ch - row;
      const u = Math.atan2(l.x, l.z) * rRef + (row % 2 ? bw * 0.5 : 0) + hash(row, 0, seed) * 0.3;
      const col = Math.floor(u / bw);
      const fu = u / bw - col;
      if (fy < 0.1 || fu < 0.05) return MORTAR;
      const h = hash(row, col, seed);
      return h < 0.2 ? STONE_D : h > 0.84 ? STONE_L : STONE;
    });

  // =================================================================== TIERS
  const T0 = new Tier(v3(0, 0, 0), new THREE.Quaternion(), 1.25, 3.72, 3.5);
  const T1 = new Tier(v3(0, 1.25, 0), leanQ(3, -1.5, 0), 7.0, 3.15, 2.85);
  const T2 = new Tier(T1.top(), leanQ(-5.5, 3, 14), 4.2, 2.55, 2.38);
  const T3 = new Tier(T2.top(), leanQ(4, -3, -6), 3.3, 3.2, 3.3);
  const T4 = new Tier(T3.top(), leanQ(-6.5, 2.5, 18), 2.7, 2.75, 2.8);
  const RF = new F3(T4.top(), T4.q);
  const oct = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 8, 1, false, Math.PI / 8);

  // plinth and stone tiers
  b.part(oct(T0.rt, T0.rb, 1.4), stonePaint(T0, 1), { bone: root, at: [0, 0.55, 0], flat: true, name: "plinth" });
  put(oct(T0.rt + 0.12, T0.rt + 0.12, 0.16), STONE_L, T0.m(0, 1.24, 0), "plinthCap");
  const t1Body = b.part(oct(T1.rt, T1.R(-0.4), T1.h + 0.4), stonePaint(T1, 2), {
    bone: root,
    at: T1.p(0, (T1.h - 0.4) / 2, 0),
    quat: T1.q,
    flat: true,
    name: "tier1",
  });
  b.part(oct(T2.rt, T2.R(-0.6), T2.h + 0.6), stonePaint(T2, 3), {
    bone: root,
    at: T2.p(0, (T2.h - 0.6) / 2, 0),
    quat: T2.q,
    flat: true,
    name: "tier2",
  });
  b.part(oct(T3.rt, T3.R(-0.3), T3.h + 0.3), PLASTER, {
    bone: root,
    at: T3.p(0, (T3.h - 0.3) / 2, 0),
    quat: T3.q,
    flat: true,
    name: "tier3",
  });
  b.part(oct(T4.rt, T4.R(-0.7), T4.h + 0.7), PLASTER, {
    bone: root,
    at: T4.p(0, (T4.h - 0.7) / 2, 0),
    quat: T4.q,
    flat: true,
    name: "tier4",
  });

  // quoins on the stone corners
  const quoins = (T: Tier, y0: number, y1: number, tag: string) => {
    for (let k = 0; k < 8; k++) {
      const thv = 22.5 + 45 * k;
      for (let j = 0, y = y0 + 0.24; y < y1 - 0.24; j++, y += 0.5) {
        const big = (j + k) % 2 === 0;
        put(
          new THREE.BoxGeometry(big ? 0.66 : 0.44, 0.42, big ? 0.44 : 0.66),
          j % 3 === 1 ? STONE : STONE_L,
          T.m(T.R(y) * sin(thv) * 0.97, y, T.R(y) * cos(thv) * 0.97, thv),
          tag,
        );
      }
    }
  };
  quoins(T1, 0, T1.h - 0.6, "quoins1");
  quoins(T2, 0.1, T2.h - 0.4, "quoins2");

  // cornice and corbels on top of tier 1
  put(oct(T1.rt + 0.34, T1.rt + 0.14, 0.42), STONE_L, T1.m(0, T1.h - 0.12, 0), "cornice1");
  put(oct(T1.rt + 0.14, T1.rt + 0.02, 0.2), STONE_D, T1.m(0, T1.h - 0.42, 0), "cornice1");
  for (let k = 0; k < 8; k++)
    for (const i of [-1, 0, 1]) {
      put(
        new THREE.BoxGeometry(0.26, 0.42, 0.34),
        STONE,
        T1.fm(k * 45, (i * T1.W(T1.h)) / 3.3, T1.h - 0.72, 0.1),
        "corbels1",
      );
      put(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        STONE_D,
        T1.fm(k * 45, (i * T1.W(T1.h)) / 3.3, T1.h - 1.0, 0.04),
        "corbels1",
      );
    }
  // plinth corbels on tier 2's top (under the jetty)
  put(oct(T2.rt + 0.18, T2.rt + 0.04, 0.3), STONE_L, T2.m(0, T2.h - 0.35, 0), "cornice2");

  // =================================================================== SPIRAL STAIR (tier 1)
  const ST0 = 45;
  const ST1 = 300;
  const SY0 = -1.05;
  const SY1 = 5.95;
  const NS = 40;
  const stairY = (th: number) => SY0 + ((SY1 - SY0) * (th - ST0)) / (ST1 - ST0);
  const rOut = 4.3;
  const railTop: V[] = [];
  const railMid: V[] = [];
  const stairLamps: [V, number][] = [];
  for (let i = 0; i < NS; i++) {
    const f = i / (NS - 1);
    const th = ST0 + (ST1 - ST0) * f;
    const y = SY0 + (SY1 - SY0) * f;
    const rIn = T1.A(Math.max(y, 0)) - 0.3;
    const len = rOut - rIn;
    const rm = (rOut + rIn) / 2;
    put(
      new THREE.BoxGeometry(0.62, 0.22, len),
      i % 2 ? STONE_L : STONE,
      T1.m(rm * sin(th), y - 0.11, rm * cos(th), th),
      "stairSteps",
    );
    // support block under the outer half
    put(
      new THREE.BoxGeometry(0.42, 0.42, len * 0.62),
      STONE_D,
      T1.m((rIn + len * 0.31) * sin(th), y - 0.43, (rIn + len * 0.31) * cos(th), th),
      "stairCorbels",
    );
    if (i % 2 === 0) {
      const pr = rOut - 0.12;
      const base = T1.polar(th, pr, y);
      const topP = T1.polar(th, pr, y + 1.05);
      putBeam(base, topP, 0.12, 0.12, T1.out(th), WOOD, "stairRail");
      railTop.push(T1.polar(th, pr, y + 1.08));
      railMid.push(T1.polar(th, pr, y + 0.55));
      put(
        new THREE.ConeGeometry(0.1, 0.16, 4),
        WOOD_D,
        T1.m(pr * sin(th), y + 1.14, pr * cos(th), th + 45),
        "stairRail",
      );
      if (i % 12 === 6) stairLamps.push([T1.polar(th, pr, y + 1.42), th]);
    }
  }
  b.sweep(catmull(railTop), 0.055, {
    color: WOOD_L,
    section: { ngon: 5 },
    bone: root,
    caps: "flat",
    name: "stairHandrail",
  });
  b.sweep(catmull(railMid), 0.035, {
    color: WOOD_D,
    section: { ngon: 4 },
    bone: root,
    caps: "flat",
    name: "stairRope",
  });
  // top landing with a side door
  const LTH = 315;
  put(new THREE.BoxGeometry(2.3, 0.3, 1.5), STONE_L, T1.fm(LTH, 0, SY1 - 0.15, 0.7), "landing");
  put(new THREE.BoxGeometry(2.0, 0.6, 1.1), STONE_D, T1.fm(LTH, 0, SY1 - 0.6, 0.55), "landing");
  for (const u of [-0.7, 0, 0.7])
    put(new THREE.BoxGeometry(0.34, 0.5, 0.9), STONE, T1.fm(LTH, u, SY1 - 1.1, 0.4), "landing");

  // =================================================================== BUTTRESSES (tier 1)
  const buttress = (th: number, H: number, depth: number) => {
    const outline: OutlinePoint[] = [
      [0, -0.6],
      [depth, -0.6],
      [depth, 0.35 * H],
      [depth * 0.68, 0.52 * H],
      [depth * 0.68, 0.78 * H],
      [0.2, H],
      [0, H],
    ];
    const r0 = T1.R(0) * 0.86;
    b.extrude(outline, {
      at: T1.polar(th, r0, 0),
      x: T1.out(th),
      y: T1.d(0, 1, 0),
      thickness: 0.78,
      color: stonePaint(T1, 9, 0.42, 0.7),
      bone: root,
      name: "buttress",
    });
    // capstones on the two slopes
    const cap = (a: number[], c: number[]) =>
      putBeam(
        T1.polar(th, r0 + a[0], a[1] + 0.08),
        T1.polar(th, r0 + c[0], c[1] + 0.08),
        0.92,
        0.14,
        T1.d(0, 1, 0),
        STONE_L,
        "buttressCaps",
      );
    cap([depth + 0.05, 0.35 * H], [depth * 0.68 - 0.05, 0.52 * H]);
    cap([depth * 0.68 + 0.05, 0.78 * H], [0.1, H + 0.05]);
  };
  buttress(22.5, 5.0, 1.75);
  buttress(-22.5, 5.0, 1.75);
  buttress(157.5, stairY(157.5) - 0.62, 1.55);
  buttress(202.5, stairY(202.5) - 0.62, 1.55);
  buttress(247.5, stairY(247.5) - 0.62, 1.55);

  // =================================================================== ROCKY OUTCROP
  const rockSpots: { at: V; top: V; size: number }[] = [];
  const addRock = (x: number, z: number, size: number, sy: number, lift = 0) => {
    const g = new THREE.DodecahedronGeometry(1, 0);
    const sx = 0.8 + R() * 0.5;
    const sz = 0.8 + R() * 0.5;
    const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 0.5, R() * 6.28, (R() - 0.5) * 0.5));
    const h = size * sy;
    const cy = h - 0.38 + lift;
    putShaded(
      g,
      new THREE.Matrix4().compose(v3(x, cy, z), rot, v3(size * sx, h, size * sz)),
      [ROCK_L, ROCK, ROCK_D],
      "rocks",
    );
    rockSpots.push({ at: v3(x, cy, z), top: v3(x, cy + h * 0.82, z), size });
  };
  for (let i = 0; i < 26; i++) {
    const th = i * (360 / 26) + (R() - 0.5) * 8;
    const a = ((th + 540) % 360) - 180;
    if (Math.abs(a) < 30) continue;
    let dist = 3.7 + R() * 1.5;
    let size = 0.85 + R() * 0.75;
    const inStair = th > 35 && th < 300;
    if (inStair && dist < 4.85) {
      const cap = stairY(th) + 1.25 - 0.5;
      if (cap < size * 1.6) dist = 4.85 + R() * 0.5;
    }
    if (th > 35 && th < 130) size = Math.min(size, 0.85);
    addRock(dist * sin(th), dist * cos(th), size, 0.7 + R() * 0.5);
  }
  // an outer apron of low flat slabs and a few big boulders behind
  for (let i = 0; i < 18; i++) {
    const th = i * 20 + R() * 10;
    const a = ((th + 540) % 360) - 180;
    if (Math.abs(a) < 26) continue;
    const dist = 5.3 + R() * 0.9;
    addRock(dist * sin(th), dist * cos(th), 0.7 + R() * 0.5, 0.45);
  }
  addRock(-3.6, -3.4, 1.5, 1.05);
  addRock(2.9, -4.2, 1.35, 1.0);
  addRock(-4.4, -1.4, 1.2, 0.9, 0.2);
  addRock(-1.0, -4.9, 1.1, 0.9);
  // flanking rocks at the foot of the front steps
  addRock(2.5, 4.8, 0.8, 0.8);
  addRock(-2.7, 4.6, 0.9, 0.85);
  addRock(-3.3, 3.6, 1.0, 1.0);
  // moss caps, grass and mushrooms
  const grassFrames: FrameInput[] = [];
  rockSpots.forEach((r, i) => {
    if (hash(i, 3, 5) < 0.45) {
      putShaded(
        new THREE.DodecahedronGeometry(1, 0),
        new THREE.Matrix4().compose(
          r.top.clone().add(v3(0, -0.06, 0)),
          qY(i * 37),
          v3(r.size * 0.62, r.size * 0.22, r.size * 0.62),
        ),
        [MOSS_L, MOSS, MOSS_D],
        "moss",
      );
      for (let k = 0; k < 2; k++)
        grassFrames.push(
          frame(
            r.top.clone().add(v3((hash(i, k, 1) - 0.5) * r.size * 0.8, 0.02, (hash(i, k, 2) - 0.5) * r.size * 0.8)),
            [0, 1, 0],
          ),
        );
    }
  });
  b.cards(grassFrames, GRASS, {
    size: [0.7, 0.6],
    cross: true,
    rng: rng(5),
    spin: 40,
    vary: 0.3,
    bone: root,
    sink: 0.25,
  });
  const mushroom = (p: V, s: number, glowing: boolean) => {
    put(
      new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 0.3 * s, 5),
      PLASTER,
      new THREE.Matrix4().compose(p.clone().add(v3(0, 0.15 * s, 0)), qY(0), ONE),
      "mushStems",
    );
    const cap = lathe(
      [
        [0, 0.26],
        [0.16, 0.2],
        [0.24, 0.06],
        [0.2, 0.0],
        [0, 0.02],
      ],
      6,
    );
    put(
      cap,
      glowing ? GLOW_PURPLE : TERRA_L,
      new THREE.Matrix4().compose(p.clone().add(v3(0, 0.26 * s, 0)), qY(0), v3(s, s, s)),
      "mushCaps",
      root,
      glowing ? 1 : 0,
    );
  };
  [5, 9, 14, 20, 27, 33].forEach((i, k) => {
    const r = rockSpots[i % rockSpots.length];
    mushroom(r.top.clone().add(v3(0.2, -0.05, 0.15)), 0.9 + (k % 3) * 0.3, k % 2 === 0);
    mushroom(r.top.clone().add(v3(-0.18, -0.08, 0.05)), 0.6, k % 2 === 1);
  });

  // =================================================================== FRONT STEPS AND PROPS
  for (let i = 0; i < 4; i++) {
    const top = 1.25 - i * 0.31;
    const z0 = 3.3 + i * 0.48;
    const w = 2.2 + i * 0.3;
    putShaded(
      new THREE.BoxGeometry(w, top + 0.3, 0.5),
      new THREE.Matrix4().compose(v3(0, (top - 0.3) / 2, z0 + 0.25), qY(0), ONE),
      [STONE_L, STONE, STONE_D],
      "frontSteps",
    );
  }
  for (const s of [1, -1]) {
    putShaded(
      new THREE.BoxGeometry(0.5, 1.3, 2.1),
      new THREE.Matrix4().compose(v3(s * 1.45, 0.55, 4.3), qX(-14), ONE),
      [STONE_L, STONE, STONE_D],
      "frontSteps",
    );
    put(
      new THREE.BoxGeometry(0.6, 0.18, 2.2),
      STONE_L,
      new THREE.Matrix4().compose(v3(s * 1.45, 1.2, 4.18), qX(-14), ONE),
      "frontSteps",
    );
  }
  // barrel
  const barrel = (p: V, s: number) => {
    put(
      new THREE.CylinderGeometry(0.36 * s, 0.36 * s, 0.95 * s, 8),
      WOOD,
      new THREE.Matrix4().compose(p.clone().add(v3(0, 0.475 * s, 0)), qY(10), ONE),
      "props",
    );
    put(
      new THREE.CylinderGeometry(0.4 * s, 0.4 * s, 0.86 * s, 8),
      WOOD_L,
      new THREE.Matrix4().compose(p.clone().add(v3(0, 0.475 * s, 0)), qY(10), v3(1, 0.5, 1)),
      "props",
    );
    for (const y of [0.12, 0.83])
      put(
        new THREE.CylinderGeometry(0.385 * s, 0.385 * s, 0.07 * s, 8),
        IRON_L,
        new THREE.Matrix4().compose(p.clone().add(v3(0, y * s, 0)), qY(10), ONE),
        "props",
      );
    put(
      new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 0.03, 8),
      WOOD_D,
      new THREE.Matrix4().compose(p.clone().add(v3(0, 0.95 * s, 0)), qY(10), ONE),
      "props",
    );
  };
  barrel(v3(2.15, 0, 5.25), 1);
  barrel(v3(2.7, 0, 4.55), 0.85);
  // crate of potions
  const crateAt = v3(-2.1, 0, 5.3);
  put(
    new THREE.BoxGeometry(0.9, 0.62, 0.8),
    WOOD_L,
    new THREE.Matrix4().compose(crateAt.clone().add(v3(0, 0.31, 0)), qY(-18), ONE),
    "props",
  );
  for (const y of [0.06, 0.56])
    put(
      new THREE.BoxGeometry(0.94, 0.1, 0.84),
      WOOD_D,
      new THREE.Matrix4().compose(crateAt.clone().add(v3(0, y, 0)), qY(-18), ONE),
      "props",
    );
  // cauldron
  const cauldronAt = v3(-2.0, 0, 4.1);
  put(
    lathe(
      [
        [0, 0.12],
        [0.32, 0.14],
        [0.5, 0.35],
        [0.52, 0.55],
        [0.44, 0.74],
        [0.5, 0.78],
        [0.4, 0.8],
        [0.38, 0.7],
        [0, 0.68],
      ],
      8,
    ),
    IRON,
    new THREE.Matrix4().compose(cauldronAt, qY(0), ONE),
    "props",
  );
  put(
    new THREE.CylinderGeometry(0.4, 0.4, 0.04, 8),
    GLOW_GREEN,
    new THREE.Matrix4().compose(cauldronAt.clone().add(v3(0, 0.72, 0)), qY(0), ONE),
    "potionGlow",
    root,
    1.2,
  );
  for (let k = 0; k < 3; k++)
    putBeam(
      cauldronAt.clone().add(v3(0.32 * sin(k * 120), 0.25, 0.32 * cos(k * 120))),
      cauldronAt.clone().add(v3(0.42 * sin(k * 120), -0.05, 0.42 * cos(k * 120))),
      0.08,
      0.08,
      UP,
      IRON,
      "props",
    );
  for (let k = 0; k < 4; k++) {
    const p = cauldronAt.clone().add(v3((k - 1.5) * 0.12, 0.85 + (k % 2) * 0.2 + k * 0.08, 0.05 * k));
    putShaded(
      new THREE.IcosahedronGeometry(0.07 + k * 0.025, 0),
      new THREE.Matrix4().compose(p, qY(k * 30), ONE),
      [SMOKE[1][0], SMOKE[1][1]],
      "cauldronFumes",
      root,
      0,
      UP,
      0.3,
    );
  }
  // broom leaning by the door
  {
    const foot = T1.fp(0, -1.15, 0.02, 0.35);
    const top = T1.fp(0, -1.45, 1.75, 0.08);
    putBeam(foot, top, 0.06, 0.06, T1.out(0), WOOD_L, "props");
    const dir = top.clone().sub(foot).normalize();
    put(
      new THREE.ConeGeometry(0.22, 0.6, 6),
      GOLD_D,
      new THREE.Matrix4().compose(foot.clone().add(dir.clone().multiplyScalar(0.25)), aim(dir), ONE),
      "props",
    );
    put(
      new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6),
      WOOD_D,
      new THREE.Matrix4().compose(foot.clone().add(dir.clone().multiplyScalar(0.5)), aim(dir), ONE),
      "props",
    );
  }

  // =================================================================== DOORS
  const plank = (thick: V) =>
    paint((_p, n, s) => {
      if (Math.abs(n.dot(thick)) < 0.5) return WOOD_D;
      const x = s[0] + 2;
      const i = Math.floor(x / 0.25);
      if (x / 0.25 - i < 0.12) return WOOD_D;
      return i % 2 ? WOOD : WOOD_L;
    });
  const doorway = (T: Tier, th: number, y0: number, w: number, hs: number, tag: string, hinge: Joint | null) => {
    const x = T.along(th);
    const y = T.faceUp(th);
    const thick = x.clone().cross(y).normalize();
    b.extrude(arch(w + 0.14, hs), {
      at: T.fp(th, 0, y0, 0.02),
      x,
      y,
      thickness: 0.08,
      color: WIN_DARK,
      bone: root,
      name: `${tag}Dark`,
    });
    const leafBone = hinge ?? root;
    b.extrude(arch(w, hs), {
      at: T.fp(th, 0, y0, 0.12),
      x,
      y,
      thickness: 0.12,
      color: plank(thick),
      bone: leafBone,
      name: `${tag}Leaf`,
    });
    // iron straps with rivets
    for (const sv of [0.35, hs * 0.55, hs + 0.15]) {
      const sw = sv > hs ? w * 0.86 : w + 0.12;
      put(new THREE.BoxGeometry(sw, 0.1, 0.04), IRON, T.fm(th, sw * 0.04, y0 + sv, 0.2), `${tag}Iron`, leafBone);
      for (let k = 0; k < 4; k++)
        put(
          new THREE.CylinderGeometry(0.03, 0.03, 0.04, 5),
          IRON_L,
          T.fm(th, -w * 0.38 + (k * w * 0.76) / 3, y0 + sv, 0.23, qX(90)),
          `${tag}Iron`,
          leafBone,
        );
    }
    put(
      new THREE.TorusGeometry(0.11, 0.025, 4, 8),
      IRON_L,
      T.fm(th, -w * 0.32, y0 + hs * 0.62, 0.24),
      `${tag}Iron`,
      leafBone,
    );
    // stone surround: jambs and voussoirs
    const R0 = w / 2 + 0.2;
    for (let j = 0; j < 5; j++) {
      const vy = 0.2 + j * (hs / 5);
      for (const s of [1, -1])
        put(
          new THREE.BoxGeometry(j % 2 ? 0.36 : 0.48, hs / 5 - 0.04, 0.24),
          j % 2 ? STONE : STONE_L,
          T.fm(th, s * (R0 + (j % 2 ? 0 : 0.06)), y0 + vy, 0.06),
          `${tag}Surround`,
        );
    }
    const NV = 9;
    for (let k = 0; k < NV; k++) {
      const a = (180 * (k + 0.5)) / NV;
      const key = k === (NV - 1) / 2;
      put(
        new THREE.BoxGeometry(key ? 0.42 : 0.3, key ? 0.62 : 0.44, key ? 0.34 : 0.26),
        k % 2 ? STONE : STONE_L,
        T.fm(th, (R0 + 0.04) * cos(a), y0 + hs + (R0 + 0.04) * sin(a), 0.06, qZ(a - 90)),
        `${tag}Surround`,
      );
    }
    put(new THREE.BoxGeometry(w + 0.7, 0.14, 0.5), STONE_L, T.fm(th, 0, y0 - 0.02, 0.2), `${tag}Surround`);
    return { keystone: T.fp(th, 0, y0 + hs + R0 + 0.04, 0.24), x, y, thick };
  };
  // front door, hinged on its left (+X) edge
  const DW = 1.5;
  const DH = 1.7;
  const door = b.joint("door", { parent: root, at: T1.fp(0, DW / 2, 0.05, 0.12), dir: T1.faceUp(0), role: "hinge" });
  const front = doorway(T1, 0, 0.05, DW, DH, "frontDoor", door);
  b.part(new THREE.PlaneGeometry(0.85, 0.85), "#ffffff", {
    bone: door,
    at: T1.fp(0, 0, 0.05 + DH * 0.95, 0.19),
    dir: T1.out(0),
    up: T1.faceUp(0),
    axis: "z",
    texture: SIGIL,
    name: "doorSigil",
  });
  put(
    new THREE.OctahedronGeometry(0.15, 0),
    GLOW_PURPLE,
    new THREE.Matrix4().compose(front.keystone, T1.q, ONE),
    "gems",
    root,
    1.4,
  );
  // stair landing door (static)
  doorway(T1, LTH, SY1, 1.1, 1.3, "landingDoor", null);

  // =================================================================== WINDOWS, SILLS, POTIONS, LANTERNS
  const BOTTLES = [
    [
      [0, 0],
      [0.08, 0],
      [0.12, 0.07],
      [0.12, 0.16],
      [0.05, 0.23],
      [0.04, 0.32],
      [0, 0.32],
    ],
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.26],
      [0.035, 0.31],
      [0.035, 0.4],
      [0, 0.4],
    ],
    [
      [0, 0],
      [0.13, 0],
      [0.05, 0.2],
      [0.05, 0.3],
      [0, 0.3],
    ],
  ];
  let bottleI = 0;
  const bottlesOn = (T: Tier, th: number, v: number, w: number, span: number, n: number) => {
    for (let k = 0; k < n; k++) {
      const kind = BOTTLES[(bottleI + k) % 3];
      const col = POTIONS[(bottleI * 2 + k) % POTIONS.length];
      const u = -span / 2 + (span * (k + 0.5)) / n + (hash(bottleI, k, 9) - 0.5) * 0.1;
      const s = 1.15 + hash(k, bottleI, 4) * 0.35;
      const topY = kind[kind.length - 1][1] * s;
      put(lathe(kind, 6), col, T.fm(th, u, v, w, undefined, v3(s, s, s)), "potions");
      put(
        new THREE.CylinderGeometry(0.045 * s, 0.04 * s, 0.07 * s, 5),
        WOOD_L,
        T.fm(th, u, v + topY + 0.02, w),
        "potions",
      );
    }
    bottleI++;
  };
  const lantern = (at: V, q: THREE.Quaternion, s: number, tag: string, bone: Joint = root) => {
    const M = (x: number, y: number, z: number, e?: THREE.Quaternion) =>
      new THREE.Matrix4().compose(
        at.clone().add(v3(x * s, y * s, z * s).applyQuaternion(q)),
        e ? q.clone().multiply(e) : q,
        v3(s, s, s),
      );
    put(new THREE.BoxGeometry(0.26, 0.34, 0.26), GLOW_GOLD, M(0, 0, 0), tag, bone, 1.5);
    put(new THREE.ConeGeometry(0.26, 0.22, 4), IRON, M(0, 0.28, 0, qY(45)), tag, bone);
    put(new THREE.BoxGeometry(0.32, 0.06, 0.32), IRON, M(0, -0.2, 0), tag, bone);
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 4), IRON, M(0, 0.44, 0), tag, bone);
    for (const [a, c] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ])
      put(new THREE.BoxGeometry(0.035, 0.36, 0.035), IRON, M(a * 0.13, 0, c * 0.13), tag, bone);
  };
  const wallLantern = (T: Tier, th: number, u: number, v: number) => {
    const arm0 = T.fp(th, u, v + 0.6, 0);
    const arm1 = T.fp(th, u, v + 0.6, 0.62);
    putBeam(arm0, arm1, 0.07, 0.07, T.d(0, 1, 0), IRON, "lanterns");
    putBeam(
      T.fp(th, u, v + 0.1, 0),
      arm1.clone().add(T.out(th).multiplyScalar(-0.2)),
      0.05,
      0.05,
      T.d(0, 1, 0),
      IRON,
      "lanterns",
    );
    lantern(T.fp(th, u, v, 0.62), T.q.clone().multiply(qY(th)), 1, "lanterns");
  };
  wallLantern(T1, 0, 1.25, 1.5);
  wallLantern(T1, 0, -1.25, 1.5);
  for (const [p, th] of stairLamps) lantern(p, T1.q.clone().multiply(qY(th)), 0.75, "lanterns");

  type WinOpt = { stone: boolean; sill?: number; keys?: boolean; flowers?: boolean };
  const roundWindow = (T: Tier, th: number, v: number, r: number, col: string, o: WinOpt) => {
    put(new THREE.CylinderGeometry(r, r, 0.1, 10), col, T.fm(th, 0, v, 0.0, qX(90)), "windowGlass", root, 1.3);
    put(
      new THREE.TorusGeometry(r + 0.06, o.stone ? 0.12 : 0.1, 4, 10),
      o.stone ? STONE_L : WOOD_D,
      T.fm(th, 0, v, 0.07),
      "windowFrames",
    );
    put(new THREE.BoxGeometry(0.07, 2 * r, 0.06), o.stone ? IRON : WOOD_D, T.fm(th, 0, v, 0.08), "windowMullions");
    put(new THREE.BoxGeometry(2 * r, 0.07, 0.06), o.stone ? IRON : WOOD_D, T.fm(th, 0, v, 0.08), "windowMullions");
    if (o.keys)
      for (let k = 0; k < 4; k++) {
        const a = 90 * k + 45;
        put(
          new THREE.BoxGeometry(0.22, 0.32, 0.2),
          k % 2 ? STONE : STONE_L,
          T.fm(th, (r + 0.17) * cos(a), v + (r + 0.17) * sin(a), 0.08, qZ(a - 90)),
          "windowKeys",
        );
      }
    if (o.stone && o.keys)
      put(new THREE.BoxGeometry(0.3, 0.42, 0.24), STONE_L, T.fm(th, 0, v + r + 0.2, 0.09), "windowKeys");
    if (o.sill !== undefined) {
      const sw = 2 * r + 0.5;
      const sv = v - r - 0.22;
      put(new THREE.BoxGeometry(sw, 0.12, 0.42), o.stone ? STONE_L : WOOD, T.fm(th, 0, sv, 0.17), "sills");
      put(
        new THREE.BoxGeometry(sw - 0.16, 0.12, 0.3),
        o.stone ? STONE_D : WOOD_D,
        T.fm(th, 0, sv - 0.12, 0.1),
        "sills",
      );
      if (o.flowers) {
        put(new THREE.BoxGeometry(sw - 0.1, 0.26, 0.3), WOOD_L, T.fm(th, 0, sv + 0.18, 0.25), "flowerBox");
        for (let k = 0; k < 5; k++) {
          const fu = -sw / 2 + 0.2 + (k * (sw - 0.4)) / 4;
          putShaded(
            new THREE.IcosahedronGeometry(0.16, 0),
            T.fm(th, fu, sv + 0.38, 0.25),
            [MOSS_L, MOSS],
            "flowerBox",
            root,
            0,
            T.d(0, 1, 0),
            0.3,
          );
          put(
            new THREE.OctahedronGeometry(0.07, 0),
            k % 2 ? GOLD_L : TERRA_L,
            T.fm(th, fu + 0.05, sv + 0.52, 0.32),
            "flowers",
          );
        }
      } else if (o.sill > 0) bottlesOn(T, th, sv + 0.06, 0.2, sw - 0.3, o.sill);
    }
  };
  const slit = (T: Tier, th: number, v: number, lit: boolean) => {
    put(
      new THREE.BoxGeometry(0.16, 0.8, 0.06),
      lit ? GLOW_PURPLE : WIN_DARK,
      T.fm(th, 0, v, 0.0),
      "slits",
      root,
      lit ? 1 : 0,
    );
    for (const s of [1, -1])
      put(new THREE.BoxGeometry(0.14, 1.0, 0.16), STONE_L, T.fm(th, s * 0.15, v, 0.04), "slitFrames");
    put(new THREE.BoxGeometry(0.46, 0.14, 0.18), STONE_L, T.fm(th, 0, v + 0.52, 0.04), "slitFrames");
    put(new THREE.BoxGeometry(0.46, 0.12, 0.2), STONE_L, T.fm(th, 0, v - 0.5, 0.04), "slitFrames");
  };
  // tier 1
  roundWindow(T1, 0, 4.2, 0.78, GLOW_GOLD, { stone: true, keys: true });
  roundWindow(T1, 90, 4.2, 0.55, GLOW_PURPLE, { stone: true, keys: true, sill: 3 });
  roundWindow(T1, 180, 5.5, 0.5, GLOW_GOLD, { stone: true, keys: true, sill: 2 });
  roundWindow(T1, 270, 3.2, 0.5, GLOW_PURPLE, { stone: true, keys: true, sill: 2 });
  slit(T1, 45, 3.0, false);
  slit(T1, 135, 4.8, true);
  slit(T1, 225, 1.9, false);
  slit(T1, 315, 3.1, true);
  // tier 2
  roundWindow(T2, 0, 2.2, 0.62, GLOW_PURPLE, { stone: true, keys: true, sill: 3 });
  roundWindow(T2, 135, 2.5, 0.5, GLOW_GOLD, { stone: true, keys: true, sill: 2 });
  roundWindow(T2, 225, 1.9, 0.5, GLOW_PURPLE, { stone: true, keys: true, sill: 2 });
  slit(T2, 90, 2.4, true);
  slit(T2, 270, 2.0, false);
  // iron tie plates on tier 2
  for (const th of [45, 180, 315])
    for (const v of [0.9, 3.3]) {
      put(new THREE.BoxGeometry(0.62, 0.1, 0.05), IRON, T2.fm(th, 0, v, 0.04, qZ(45)), "tiePlates");
      put(new THREE.BoxGeometry(0.62, 0.1, 0.05), IRON, T2.fm(th, 0, v, 0.04, qZ(-45)), "tiePlates");
      put(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), IRON_L, T2.fm(th, 0, v, 0.07, qX(90)), "tiePlates");
    }

  // =================================================================== JETTY (tier 2 -> tier 3)
  put(oct(T3.R(0) + 0.28, T3.R(0) + 0.2, 0.36), WOOD_D, T3.m(0, -0.12, 0), "jettyFloor");
  for (let k = 0; k < 16; k++) {
    const th = k * 22.5 + 11.25;
    const a = T3.polar(th, T3.R(0) - 0.7, -0.42);
    const c = T3.polar(th, T3.R(0) + 0.42, -0.42);
    putBeam(a, c, 0.18, 0.2, T3.d(0, 1, 0), WOOD, "joists");
  }
  for (let k = 0; k < 8; k++) {
    const th = 22.5 + k * 45;
    const hi = T3.polar(th, T3.R(0) - 0.05, -0.45);
    const l = T2.local(hi);
    const ang = Math.atan2(l.x, l.z) / DEG;
    const lo = T2.polar(ang, T2.R(T2.h - 1.6) - 0.1, T2.h - 1.6);
    putBeam(lo, hi, 0.2, 0.2, T2.d(0, 1, 0), WOOD_D, "jettyStruts");
    put(
      new THREE.BoxGeometry(0.34, 0.3, 0.3),
      STONE_L,
      new THREE.Matrix4().compose(lo, T2.q.clone().multiply(qY(ang)), ONE),
      "jettyStruts",
    );
  }

  // =================================================================== TIMBER FRAMING
  type TimberOpt = { windows: Map<number, [number, number, string, boolean]>; door?: number };
  const timber = (T: Tier, o: TimberOpt, tag: string) => {
    const h = T.h;
    const mid = h * 0.42;
    const hw = (v: number) => T.W(v) / 2 - 0.12;
    const bm = (th: number, u0: number, v0: number, u1: number, v1: number, w = 0.2, col = WOOD_D) =>
      putBeam(T.fp(th, u0, v0, 0.06), T.fp(th, u1, v1, 0.06), w, 0.14, T.out(th), col, tag);
    for (let k = 0; k < 8; k++) {
      const th = k * 45;
      const thv = th + 22.5;
      putBeam(
        T.polar(thv, T.R(-0.1) + 0.02, -0.1),
        T.polar(thv, T.R(h) + 0.02, h + 0.02),
        0.28,
        0.28,
        T.d(sin(thv), 0, cos(thv)),
        WOOD_D,
        tag,
      );
      bm(th, -hw(0.14), 0.14, hw(0.14), 0.14, 0.24);
      bm(th, -hw(h - 0.12), h - 0.12, hw(h - 0.12), h - 0.12, 0.24);
      const win = o.windows.get(th);
      if (o.door === th) {
        for (const s of [1, -1]) bm(th, s * 0.75, 0.14, s * 0.75, h - 0.12, 0.2);
        bm(th, -0.75, 2.25, 0.75, 2.25, 0.2);
        for (const s of [1, -1]) bm(th, s * 0.75, mid, s * hw(mid), mid);
      } else if (win) {
        const [v, r] = win;
        const su = r + 0.26;
        for (const s of [1, -1]) {
          bm(th, s * su, 0.14, s * su, h - 0.12, 0.18);
          bm(th, s * su, mid, s * hw(mid), mid);
          bm(th, s * hw(0.3), 0.3, s * (su + 0.08), mid - 0.1, 0.14);
        }
        bm(th, -su, v - r - 0.2, su, v - r - 0.2, 0.16);
        bm(th, -su, Math.min(v + r + 0.2, h - 0.3), su, Math.min(v + r + 0.2, h - 0.3), 0.16);
      } else {
        bm(th, -hw(mid), mid, hw(mid), mid);
        bm(th, -hw(0.2) + 0.05, 0.22, hw(mid) - 0.05, mid - 0.06, 0.16);
        bm(th, hw(0.2) - 0.05, 0.22, -hw(mid) + 0.05, mid - 0.06, 0.16);
        bm(th, -hw(mid) + 0.05, mid + 0.06, 0, h - 0.2, 0.16);
        bm(th, hw(mid) - 0.05, mid + 0.06, 0, h - 0.2, 0.16);
        bm(th, 0, mid + 0.06, 0, h - 0.2, 0.14);
      }
    }
    for (const [th, [v, r, col, flowers]] of o.windows)
      roundWindow(T, th, v, r, col, { stone: false, sill: flowers ? 0 : 2, flowers });
  };
  timber(
    T3,
    {
      windows: new Map([
        [0, [1.75, 0.6, GLOW_GOLD, true]],
        [90, [1.7, 0.5, GLOW_PURPLE, false]],
        [135, [1.8, 0.45, GLOW_GOLD, false]],
        [180, [1.75, 0.55, GLOW_PURPLE, true]],
        [45, [1.8, 0.45, GLOW_PURPLE, false]],
      ]),
      door: 270,
    },
    "timber3",
  );
  timber(
    T4,
    {
      windows: new Map([
        [0, [1.4, 0.5, GLOW_PURPLE, false]],
        [90, [1.35, 0.42, GLOW_GOLD, false]],
        [225, [1.4, 0.45, GLOW_GOLD, false]],
        [270, [1.35, 0.42, GLOW_PURPLE, false]],
      ]),
    },
    "timber4",
  );

  // =================================================================== ROOFS
  type Station = { c: V; r: number; tw: number };
  const shingles = (
    F: F3,
    st: Station[],
    lip: number,
    drop: number,
    sides: number,
    innerR0: number,
    tag: string,
    stripe: string | null,
  ) => {
    const trim = new Tris();
    const slope = new Tris();
    const band = new Tris();
    const under = new Tris();
    const ring = (c: V, r: number, tw: number, dy = 0) =>
      Array.from({ length: sides }, (_, j) => {
        const a = tw + ((j + 0.5) * 360) / sides;
        return F.p(c.x + r * sin(a), c.y + dy, c.z + r * cos(a));
      });
    const facets: { a: V; b: V; c: V; d: V }[][] = [];
    for (let k = 0; k < st.length - 1; k++) {
      const s0 = st[k];
      const s1 = st[k + 1];
      const L = ring(s0.c, s0.r + lip, s0.tw, -drop);
      const T = ring(s1.c, s1.r, s1.tw);
      const M = L.map((p, j) => p.clone().lerp(T[j], 0.24));
      const I = ring(s0.c, k === 0 ? innerR0 : s0.r * 0.96, s0.tw, k === 0 ? 0 : 0.02);
      const cm = F.p(s0.c.x, (s0.c.y + s1.c.y) / 2, s0.c.z);
      const down = F.d(0, -1, 0);
      const row: { a: V; b: V; c: V; d: V }[] = [];
      for (let j = 0; j < sides; j++) {
        const j1 = (j + 1) % sides;
        const out = M[j].clone().add(M[j1]).multiplyScalar(0.5).sub(cm);
        trim.quad(L[j], L[j1], M[j1], M[j], out);
        (stripe && (((j - k) % 4) + 4) % 4 === 0 ? band : slope).quad(M[j], M[j1], T[j1], T[j], out);
        under.quad(L[j], L[j1], I[j1], I[j], down);
        row.push({ a: M[j], b: M[j1], c: T[j1], d: T[j] });
      }
      facets.push(row);
    }
    put(trim.geo(), ROOF_L, null, tag);
    put(slope.geo(), ROOF, null, tag);
    if (stripe) put(band.geo(), stripe, null, tag);
    put(under.geo(), ROOF_D, null, tag);
    return facets;
  };
  // skirt roof over tier 3
  const SK = new F3(T3.p(0, T3.h, 0), T3.q);
  shingles(
    SK,
    [
      { c: v3(0, -0.2, 0), r: T3.R(T3.h) + 0.55, tw: 0 },
      { c: v3(0, 0.3, 0), r: 3.15, tw: 0 },
      { c: v3(0, 0.78, 0), r: 2.6, tw: 0 },
    ],
    0.28,
    0.16,
    8,
    T3.R(T3.h) - 0.2,
    "skirtRoof",
    null,
  );
  // main roof: a twisted, bent witch's hat
  const RH = 4.9;
  const RR = 3.5;
  const bend = v3(-2.1, -0.35, -1.35);
  const RK = 9;
  const rt = (t: number) => Math.max(RR * Math.pow(1 - t, 1.45), 0);
  const rc = (t: number) => v3(bend.x * Math.pow(t, 2.6), RH * t + bend.y * Math.pow(t, 3), bend.z * Math.pow(t, 2.6));
  const rtw = (t: number) => 150 * t;
  const stations: Station[] = Array.from({ length: RK + 1 }, (_, k) => {
    const t = k / RK;
    return { c: rc(t), r: k === RK ? 0 : rt(t), tw: rtw(t) };
  });
  const roofFacets = shingles(RF, stations, 0.24, 0.18, 8, T4.R(T4.h) - 0.3, "roof", ROOF_S);
  const roofTip = RF.p(rc(1).x, rc(1).y, rc(1).z);
  // a little dormer with a round window, front right
  {
    const DF = new F3(RF.p(0, 0, 0), RF.q.clone().multiply(qY(14)));
    put(new THREE.BoxGeometry(1.15, 1.3, 1.9), PLASTER, DF.m(0, 0.95, 2.2), "dormer");
    for (const s of [1, -1]) {
      put(new THREE.BoxGeometry(0.16, 1.35, 0.16), WOOD_D, DF.m(s * 0.57, 0.95, 3.12), "dormer");
      put(new THREE.BoxGeometry(0.12, 1.1, 2.3), ROOF, DF.m(s * 0.42, 1.9, 2.15, 0, qZ(s * 52)), "dormerRoof");
      put(new THREE.BoxGeometry(0.06, 1.12, 2.32), ROOF_L, DF.m(s * 0.47, 1.93, 2.15, 0, qZ(s * 52)), "dormerRoof");
    }
    put(new THREE.BoxGeometry(1.3, 0.16, 0.18), WOOD_D, DF.m(0, 1.56, 3.15), "dormer");
    put(new THREE.BoxGeometry(0.1, 0.1, 2.3), GOLD, DF.m(0, 2.32, 2.15, 0, qZ(45)), "dormerRoof");
    put(
      new THREE.CylinderGeometry(0.3, 0.3, 0.08, 10),
      GLOW_PURPLE,
      DF.m(0, 0.98, 3.16, 0, qX(90)),
      "windowGlass",
      root,
      1.3,
    );
    put(new THREE.TorusGeometry(0.36, 0.08, 4, 10), WOOD_D, DF.m(0, 0.98, 3.2), "windowFrames");
    put(new THREE.BoxGeometry(0.05, 0.6, 0.05), WOOD_D, DF.m(0, 0.98, 3.21), "windowFrames");
    put(new THREE.BoxGeometry(0.6, 0.05, 0.05), WOOD_D, DF.m(0, 0.98, 3.21), "windowFrames");
  }
  // eave fascia and rafter tails
  for (let k = 0; k < 16; k++) {
    const th = k * 22.5 + 11.25;
    putBeam(
      RF.polar(th, T4.R(T4.h) - 0.2, -0.12),
      RF.polar(th, RR + 0.05, -0.12),
      0.14,
      0.16,
      RF.d(0, 1, 0),
      WOOD,
      "rafters",
    );
  }
  for (let k = 0; k < 16; k++) {
    const th = k * 22.5;
    putBeam(
      SK.polar(th, T3.R(T3.h) - 0.2, -0.32),
      SK.polar(th, T3.R(T3.h) + 0.6, -0.32),
      0.12,
      0.14,
      SK.d(0, 1, 0),
      WOOD,
      "rafters",
    );
  }
  // gold stars on the roof
  const sr = rng(31);
  for (let k = 1; k < RK - 1; k++) {
    const row = roofFacets[k];
    const picks = k < 4 ? 2 : 1;
    for (let i = 0; i < picks; i++) {
      const f = row[Math.floor(sr() * row.length)];
      const p = f.a.clone().add(f.b).add(f.c).add(f.d).multiplyScalar(0.25);
      const n = f.b.clone().sub(f.d).cross(f.c.clone().sub(f.a)).normalize();
      const out = p.clone().sub(RF.p(0, RF.local(p).y, 0));
      if (n.dot(out) < 0) n.negate();
      const s = 0.36 - k * 0.03;
      put(
        starGeo(s, s * 0.45, 0.06),
        GOLD_L,
        new THREE.Matrix4().compose(p.add(n.clone().multiplyScalar(0.03)), aim(n, RF.d(0, 1, 0), "z"), ONE),
        "roofStars",
        root,
        1,
      );
    }
  }
  // tip collar, mast and finial
  const mastUp = RF.d(0, 1, 0).lerp(UP, 0.6).normalize();
  const mastAt = (d: number) => roofTip.clone().add(mastUp.clone().multiplyScalar(d));
  const qm = aim(mastUp);
  put(new THREE.CylinderGeometry(0.1, 0.3, 0.5, 6), GOLD, new THREE.Matrix4().compose(mastAt(-0.15), qm, ONE), "mast");
  put(
    new THREE.CylinderGeometry(0.06, 0.08, 2.0, 6),
    GOLD_D,
    new THREE.Matrix4().compose(mastAt(0.95), qm, ONE),
    "mast",
  );
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 6), GOLD, new THREE.Matrix4().compose(mastAt(0.25), qm, ONE), "mast");
  put(new THREE.IcosahedronGeometry(0.16, 0), GOLD_L, new THREE.Matrix4().compose(mastAt(1.85), qm, ONE), "mast");
  put(
    starGeo(0.62, 0.27, 0.16),
    GLOW_GOLD,
    new THREE.Matrix4().compose(mastAt(2.4), aim(v3(0, 0, 1), mastUp, "z"), ONE),
    "starFinial",
    root,
    1.6,
  );
  put(
    starGeo(0.4, 0.17, 0.2),
    GOLD_L,
    new THREE.Matrix4().compose(mastAt(2.4), aim(v3(0, 0, 1), mastUp, "z"), ONE),
    "starFinial",
    root,
    1.2,
  );

  // =================================================================== ORRERY (on the roof spire)
  const orrery = b.joint("orrery", { parent: root, at: mastAt(0.4), dir: mastUp });
  putShaded(
    new THREE.IcosahedronGeometry(0.34, 1),
    new THREE.Matrix4().compose(mastAt(1.0), qm, ONE),
    [GLOW_GOLD, GOLD_L],
    "orrerySun",
    orrery,
    1.4,
    v3(0.3, 0.8, 0.5),
    0.2,
  );
  const arms: [number, number, number, string, boolean][] = [
    [0.55, 0.85, 0.13, "#4fd1c5", false],
    [0.8, 1.35, 0.19, TERRA_L, false],
    [1.5, 1.85, 0.24, PURPLE_L, true],
  ];
  arms.forEach(([hgt, L, pr, col, ringed], i) => {
    const arm = b.joint(`orreryArm${i + 1}`, { parent: orrery, at: mastAt(hgt), dir: mastUp });
    const yaw = 40 + i * 125;
    const outDir = v3(sin(yaw), 0, cos(yaw));
    const a = mastAt(hgt);
    const c = a.clone().add(outDir.clone().multiplyScalar(L));
    put(
      new THREE.CylinderGeometry(0.11, 0.11, 0.1, 6),
      GOLD,
      new THREE.Matrix4().compose(a, qm, ONE),
      "orreryArms",
      arm,
    );
    putBeam(a, c, 0.045, 0.045, UP, GOLD, "orreryArms", arm);
    putBeam(a, a.clone().add(outDir.clone().multiplyScalar(-0.35)), 0.045, 0.045, UP, GOLD, "orreryArms", arm);
    put(
      new THREE.IcosahedronGeometry(0.07, 0),
      GOLD_D,
      new THREE.Matrix4().compose(a.clone().add(outDir.clone().multiplyScalar(-0.38)), qm, ONE),
      "orreryArms",
      arm,
    );
    const pc = c.clone().add(v3(0, 0.26 + pr, 0));
    putBeam(c, pc, 0.035, 0.035, outDir, GOLD, "orreryArms", arm);
    putShaded(
      new THREE.IcosahedronGeometry(pr, 1),
      new THREE.Matrix4().compose(pc, qm, ONE),
      [col === PURPLE_L ? CRYSTAL_P[0] : GOLD_L, col],
      `planet${i + 1}`,
      arm,
      0,
      v3(0.3, 0.8, 0.5),
      0.45,
    );
    if (ringed)
      put(
        new THREE.TorusGeometry(pr * 1.65, pr * 0.12, 3, 12),
        GOLD_L,
        new THREE.Matrix4().compose(pc, qX(70).multiply(qY(20)), ONE),
        `planet${i + 1}`,
        arm,
      );
    if (i === 1)
      put(
        new THREE.IcosahedronGeometry(0.06, 0),
        PLASTER,
        new THREE.Matrix4().compose(pc.clone().add(v3(0.32, 0.08, 0)), qm, ONE),
        `planet${i + 1}`,
        arm,
      );
  });

  // =================================================================== RUNE RINGS
  const RUNES = runeStrip();
  const runeRing = (name: string, center: V, normal: V, rIn: number, rOut: number, seg: number, parent: Joint) => {
    const j = b.joint(name, { parent, at: center, dir: normal });
    const q = aim(normal);
    const hgt = 0.045;
    const top = new Tris();
    const bot = new Tris();
    const quarter = seg / 4;
    for (let i = 0; i < seg; i++) {
      const a0 = (360 * i) / seg;
      const a1 = (360 * (i + 1)) / seg;
      const u0 = (i % quarter) / quarter;
      const u1 = u0 + 1 / quarter;
      const P = (r: number, a: number, y: number) =>
        v3(r * cos(a), y, r * sin(a))
          .applyQuaternion(q)
          .add(center);
      const nUp = normal.clone();
      top.quad(P(rIn, a0, hgt), P(rOut, a0, hgt), P(rOut, a1, hgt), P(rIn, a1, hgt), nUp, [
        [u0, 0],
        [u0, 1],
        [u1, 1],
        [u1, 0],
      ]);
      bot.quad(P(rIn, a0, -hgt), P(rOut, a0, -hgt), P(rOut, a1, -hgt), P(rIn, a1, -hgt), nUp.clone().negate(), [
        [u0, 0],
        [u0, 1],
        [u1, 1],
        [u1, 0],
      ]);
    }
    glow(b.part(top.geo(), "#ffffff", { bone: j, at: [0, 0, 0], texture: RUNES, flat: true, name: `${name}Top` }), 1.1);
    glow(
      b.part(bot.geo(), "#ffffff", { bone: j, at: [0, 0, 0], texture: RUNES, flat: true, name: `${name}Bottom` }),
      1.1,
    );
    const tq = q.clone().multiply(qX(90));
    for (const r of [rIn, rOut])
      put(
        new THREE.TorusGeometry(r, 0.06, 4, seg),
        GOLD_L,
        new THREE.Matrix4().compose(center, tq, ONE),
        `${name}Rims`,
        j,
        1,
      );
    return j;
  };
  runeRing("runeRingA", RF.p(0, 1.85, 0), v3(sin(20), cos(20), 0).applyAxisAngle(UP, -45 * DEG), 4.25, 4.98, 48, root);
  runeRing(
    "runeRingB",
    RF.p(-0.4, 4.3, -0.3),
    v3(-sin(18), cos(18), 0).applyAxisAngle(UP, 45 * DEG),
    2.6,
    3.1,
    40,
    root,
  );
  runeRing("runeRingC", mastAt(1.0), v3(sin(60), cos(60), 0).applyAxisAngle(UP, 70 * DEG), 0.62, 0.76, 24, orrery);

  // =================================================================== FLOATING CRYSTALS
  const orbit = b.joint("crystalOrbit", { parent: root, at: RF.p(0, 1.2, 0), dir: RF.d(0, 1, 0) });
  const crystalGeo = lathe(
    [
      [0, -0.6],
      [0.3, -0.12],
      [0.3, 0.28],
      [0, 1.1],
    ],
    6,
  );
  for (let i = 0; i < 7; i++) {
    const th = i * (360 / 7) + 18;
    const y = -3.2 + ((i * 3) % 7) * 1.05;
    const at = RF.polar(th, 5.9 + (i % 2) * 0.4, y);
    const dir = v3(sin(th) * 0.35, 1, cos(th) * 0.35)
      .add(v3((hash(i, 1, 2) - 0.5) * 0.6, 0, (hash(i, 2, 2) - 0.5) * 0.6))
      .normalize();
    const j = b.joint(`crystal${i + 1}`, { parent: orbit, at, dir });
    const s = 0.9 + hash(i, 3, 1) * 0.5;
    const cols = i % 2 ? CRYSTAL_P : CRYSTAL_C;
    putShaded(
      crystalGeo,
      new THREE.Matrix4().compose(at, aim(dir), v3(s, s * 1.2, s)),
      cols,
      `crystalBody${i + 1}`,
      j,
      1.1,
      CRYSTAL_LIGHT,
      0.45,
      -0.15,
    );
    for (let k = 0; k < 2; k++) {
      const off = v3(
        (hash(i, k, 7) - 0.5) * 1.1,
        (k ? 1 : -1) * (0.5 + hash(i, k, 8) * 0.4),
        (hash(i, k, 6) - 0.5) * 1.1,
      );
      const d2 = dir
        .clone()
        .add(v3(hash(k, i, 3) - 0.5, 0, hash(i, k, 4) - 0.5))
        .normalize();
      putShaded(
        crystalGeo,
        new THREE.Matrix4().compose(at.clone().add(off), aim(d2), v3(s * 0.35, s * 0.4, s * 0.35)),
        cols,
        `crystalBody${i + 1}`,
        j,
        1.1,
        CRYSTAL_LIGHT,
        0.45,
        -0.15,
      );
    }
  }

  // =================================================================== BALCONY AND TELESCOPE (tier 3, right side)
  const BTH = 270;
  {
    const depth = 1.9;
    const halfW = 1.75;
    const pt = (u: number, w: number, v: number) => T3.fp(BTH, u, v, w);
    // deck planks
    for (let i = 0; i < 9; i++) {
      const u = -halfW + 0.2 + i * ((2 * halfW - 0.4) / 8);
      const inset = Math.abs(u) > halfW - 0.6 ? 0.45 : 0;
      putBeam(
        pt(u, -0.2, 0.0),
        pt(u, depth - inset, 0.0),
        0.36,
        0.12,
        T3.d(0, 1, 0),
        i % 2 ? WOOD : WOOD_L,
        "balconyDeck",
      );
    }
    putBeam(
      pt(-halfW, depth - 0.02, -0.12),
      pt(halfW, depth - 0.02, -0.12),
      0.22,
      0.22,
      T3.out(BTH),
      WOOD_D,
      "balconyFrame",
    );
    for (const u of [-halfW + 0.1, 0, halfW - 0.1]) {
      putBeam(pt(u, -0.6, -0.14), pt(u, depth, -0.14), 0.22, 0.22, T3.d(0, 1, 0), WOOD_D, "balconyFrame");
      putBeam(
        pt(u, depth - 0.15, -0.2),
        T2.fp(BTH + 20, u, T2.h - 1.9, 0),
        0.18,
        0.18,
        T3.out(BTH),
        WOOD_D,
        "balconyFrame",
      );
    }
    // railing
    const posts: [number, number][] = [
      [-halfW + 0.05, 0.15],
      [-halfW + 0.05, depth - 0.45],
      [-halfW + 0.5, depth - 0.05],
      [-0.6, depth - 0.05],
      [0.6, depth - 0.05],
      [halfW - 0.5, depth - 0.05],
      [halfW - 0.05, depth - 0.45],
      [halfW - 0.05, 0.15],
    ];
    const rail: V[] = [];
    posts.forEach(([u, w]) => {
      putBeam(pt(u, w, 0), pt(u, w, 1.15), 0.14, 0.14, T3.out(BTH), WOOD_D, "balconyRail");
      put(
        new THREE.ConeGeometry(0.11, 0.18, 4),
        GOLD,
        new THREE.Matrix4().compose(pt(u, w, 1.28), T3.q, ONE),
        "balconyRail",
      );
      rail.push(pt(u, w, 1.12));
    });
    for (let i = 0; i < rail.length - 1; i++) {
      putBeam(rail[i], rail[i + 1], 0.1, 0.16, T3.d(0, 1, 0), WOOD_L, "balconyRail");
      const a = posts[i];
      const c = posts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.26));
      for (let k = 1; k < n; k++) {
        const f = k / n;
        const u = a[0] + (c[0] - a[0]) * f;
        const w = a[1] + (c[1] - a[1]) * f;
        putBeam(pt(u, w, 0.05), pt(u, w, 1.06), 0.06, 0.06, T3.out(BTH), WOOD, "balconyRail");
      }
    }
    // telescope on a tripod
    const head = pt(0.35, 1.05, 1.25);
    for (let k = 0; k < 3; k++) {
      const a = k * 120 + 30;
      putBeam(head, pt(0.35 + 0.5 * cos(a), 1.05 + 0.5 * sin(a), 0.06), 0.06, 0.06, T3.d(0, 1, 0), WOOD_D, "tripod");
    }
    const scope = b.joint("telescope", { parent: root, at: head, dir: T3.d(0, 1, 0) });
    put(
      new THREE.IcosahedronGeometry(0.12, 0),
      GOLD,
      new THREE.Matrix4().compose(head, T3.q, ONE),
      "telescopeMount",
      scope,
    );
    const tubeDir = T3.out(BTH)
      .multiplyScalar(0.75)
      .add(T3.d(0, 1, 0))
      .add(T3.along(BTH).multiplyScalar(0.25))
      .normalize();
    const tilt = b.joint("telescopeTilt", { parent: scope, at: head.clone().add(T3.d(0, 0.08, 0)), dir: tubeDir });
    const tq = aim(tubeDir);
    const tp = (d: number) =>
      head
        .clone()
        .add(T3.d(0, 0.08, 0))
        .add(tubeDir.clone().multiplyScalar(d));
    const seg = (d0: number, d1: number, r0: number, r1: number, col: string) =>
      put(
        new THREE.CylinderGeometry(r1, r0, d1 - d0, 7),
        col,
        new THREE.Matrix4().compose(tp((d0 + d1) / 2), tq, ONE),
        "telescope",
        tilt,
      );
    seg(-0.75, -0.5, 0.06, 0.06, IRON);
    seg(-0.5, 0.1, 0.1, 0.1, GOLD);
    seg(0.1, 0.75, 0.13, 0.13, GOLD_D);
    seg(0.75, 1.3, 0.16, 0.16, GOLD);
    seg(1.3, 1.45, 0.19, 0.2, GOLD_L);
    for (const d of [-0.5, 0.1, 0.75]) seg(d - 0.04, d + 0.04, 0.17 + d * 0.02, 0.17 + d * 0.02, GOLD_L);
    put(
      new THREE.CylinderGeometry(0.16, 0.16, 0.02, 7),
      CRYSTAL_C[1],
      new THREE.Matrix4().compose(tp(1.46), tq, ONE),
      "telescopeLens",
      tilt,
      1.2,
    );
    // balcony door and lantern
    doorway(T3, BTH, 0.05, 1.1, 1.25, "balconyDoor", null);
    lantern(pt(halfW - 0.05, depth - 0.45, 1.55), T3.q.clone().multiply(qY(BTH)), 0.9, "lanterns");
    // hanging sign under the balcony corner
    const signBal = b.joint("signBalcony", {
      parent: root,
      at: pt(-halfW - 0.05, depth - 0.2, -0.3),
      dir: T3.out(BTH),
      role: "hinge",
    });
    putBeam(
      pt(-halfW - 0.05, depth - 1.0, -0.22),
      pt(-halfW - 0.05, depth + 0.5, -0.22),
      0.07,
      0.09,
      T3.d(0, 1, 0),
      IRON,
      "signBracket",
    );
    putBeam(
      pt(-halfW - 0.05, depth - 0.75, -0.25),
      pt(-halfW - 0.05, depth - 0.75, -0.95),
      0.03,
      0.03,
      T3.out(BTH),
      IRON,
      "signBalcony",
      signBal,
    );
    putBeam(
      pt(-halfW - 0.05, depth + 0.35, -0.25),
      pt(-halfW - 0.05, depth + 0.35, -0.95),
      0.03,
      0.03,
      T3.out(BTH),
      IRON,
      "signBalcony",
      signBal,
    );
    b.cards([frame(pt(-halfW - 0.05, depth - 0.2, -0.9), T3.d(0, 1, 0))], SIGN_STAR, {
      size: [1.3, 1.2],
      lean: 180,
      flow: T3.along(BTH).negate(),
      bone: signBal,
      sink: 0,
    });
    // a little owl keeping watch on the rail
    {
      const OF = new F3(pt(-halfW + 0.5, depth - 0.05, 1.2), T3.q.clone().multiply(qY(BTH + 25)));
      putShaded(
        new THREE.IcosahedronGeometry(0.24, 0),
        OF.m(0, 0.24, 0, 0, undefined, v3(1, 1.2, 0.9)),
        [WOOD_L, WOOD],
        "owl",
        root,
        0,
        OF.d(0, 1, 0.3).normalize(),
        0.3,
      );
      put(new THREE.IcosahedronGeometry(0.15, 0), PLASTER, OF.m(0, 0.2, 0.12, 0, undefined, v3(1, 1.25, 0.6)), "owl");
      putShaded(
        new THREE.IcosahedronGeometry(0.19, 0),
        OF.m(0, 0.56, 0.02, 0, undefined, v3(1.1, 0.9, 1)),
        [WOOD_L, WOOD],
        "owl",
        root,
        0,
        OF.d(0, 1, 0.3).normalize(),
        0.3,
      );
      for (const s of [1, -1]) {
        put(new THREE.ConeGeometry(0.05, 0.14, 4), WOOD_D, OF.m(s * 0.11, 0.72, 0, 0, qZ(-s * 20)), "owl");
        put(
          new THREE.CylinderGeometry(0.07, 0.07, 0.03, 6),
          GLOW_GOLD,
          OF.m(s * 0.075, 0.58, 0.17, 0, qX(90)),
          "owlEyes",
          root,
          1.3,
        );
        put(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 5), IRON, OF.m(s * 0.075, 0.58, 0.185, 0, qX(90)), "owl");
        put(new THREE.BoxGeometry(0.06, 0.03, 0.08), GOLD_D, OF.m(s * 0.07, 0.01, 0.06), "owl");
      }
      put(new THREE.ConeGeometry(0.035, 0.08, 4), GOLD_D, OF.m(0, 0.5, 0.19, 0, qX(110)), "owl");
    }
  }

  // =================================================================== BANNERS (hung from the jetty)
  for (const [name, th] of [
    ["bannerL", 50],
    ["bannerR", -45],
  ] as [string, number][]) {
    const l = T2.local(T3.polar(th, T3.R(0) - 0.35, -0.55));
    const a2 = Math.atan2(l.x, l.z) / DEG;
    const w = T2.A(T2.h - 0.9) + 0.25;
    const top = T2.polar(a2, w, l.y);
    const along = T2.along(a2);
    const j = b.joint(name, { parent: root, at: top, dir: along });
    putBeam(
      top.clone().add(along.clone().multiplyScalar(-0.72)),
      top.clone().add(along.clone().multiplyScalar(0.72)),
      0.08,
      0.08,
      UP,
      WOOD_D,
      "bannerPoles",
      j,
    );
    for (const s of [1, -1])
      put(
        new THREE.OctahedronGeometry(0.1, 0),
        GOLD_L,
        new THREE.Matrix4().compose(top.clone().add(along.clone().multiplyScalar(s * 0.76)), T2.q, ONE),
        "bannerPoles",
        j,
      );
    for (const s of [1, -1])
      putBeam(
        top.clone().add(along.clone().multiplyScalar(s * 0.6)),
        T3.polar(th + s * 6, T3.R(0) - 0.25, -0.3),
        0.03,
        0.03,
        T2.out(a2),
        IRON,
        "bannerPoles",
        j,
      );
    b.cards([frame(top.clone().add(v3(0, -0.02, 0)), [0, 1, 0])], BANNER, {
      size: [1.15, 3.3],
      lean: 180,
      flow: T2.out(a2),
      bone: j,
      sink: 0,
    });
  }

  // =================================================================== HANGING SIGN BY THE DOOR
  {
    const th = 34;
    const v = 3.05;
    const base = T1.polar(th, T1.R(v) * 0.95, v);
    const tip = T1.polar(th, T1.R(v) + 1.45, v);
    putBeam(base, tip, 0.08, 0.08, T1.d(0, 1, 0), IRON, "signBracket");
    putBeam(
      T1.polar(th, T1.R(v - 0.7) * 0.95, v - 0.7),
      T1.polar(th, T1.R(v) + 0.7, v),
      0.06,
      0.06,
      T1.d(0, 1, 0),
      IRON,
      "signBracket",
    );
    for (let k = 0; k < 3; k++)
      put(
        new THREE.TorusGeometry(0.12, 0.025, 3, 6),
        IRON,
        new THREE.Matrix4().compose(
          T1.polar(th, T1.R(v) + 0.75 + k * 0.18, v + 0.18),
          T1.q.clone().multiply(qY(th + 90)),
          ONE,
        ),
        "signBracket",
      );
    const pivot = T1.polar(th, T1.R(v) + 0.9, v - 0.04);
    const sj = b.joint("signDoor", { parent: root, at: pivot, dir: T1.out(th), role: "hinge" });
    for (const s of [1, -1])
      putBeam(
        T1.polar(th, T1.R(v) + 0.9 + s * 0.42, v - 0.04),
        T1.polar(th, T1.R(v) + 0.9 + s * 0.42, v - 0.38),
        0.025,
        0.025,
        T1.out(th),
        IRON,
        "signDoor",
        sj,
      );
    b.cards([frame(T1.polar(th, T1.R(v) + 0.9, v - 0.34), T1.d(0, 1, 0))], SIGN_POTION, {
      size: [1.1, 1.0],
      lean: 180,
      flow: T1.along(th),
      bone: sj,
      sink: 0,
    });
  }

  // =================================================================== CHIMNEYS AND SMOKE
  const smoke = (start: V, drift: V, n: number, family: number, tag: string) => {
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      const p = start
        .clone()
        .add(v3(0, 0.35 + i * 0.55, 0))
        .add(drift.clone().multiplyScalar(Math.pow(f, 1.3)));
      const r = 0.22 + i * 0.075;
      const cols = SMOKE[(family + i) % SMOKE.length];
      putShaded(
        new THREE.IcosahedronGeometry(r, 0),
        new THREE.Matrix4().compose(p, qY(i * 47 + family * 13).multiply(qX(i * 21)), ONE),
        cols,
        tag,
        root,
        0,
        v3(0.3, 0.85, 0.4).normalize(),
        0.25,
      );
    }
  };
  const chimney = (T: Tier, th: number, r: number, y0: number, H: number, tag: string, family: number) => {
    const CF = new F3(T.polar(th, r, y0), T.q.clone().multiply(qY(th)));
    b.part(new THREE.BoxGeometry(0.95, H, 0.95), stonePaint(CF, 11 + family, 0.3, 0.52, 0.6), {
      bone: root,
      at: CF.p(0, H / 2, 0),
      quat: CF.q,
      flat: true,
      name: tag,
    });
    put(new THREE.BoxGeometry(1.2, 0.2, 1.2), STONE_L, CF.m(0, H + 0.05, 0), `${tag}Cap`);
    put(new THREE.BoxGeometry(1.1, 0.16, 1.1), STONE_D, CF.m(0, H - 0.6, 0), `${tag}Cap`);
    for (const s of [1, -1]) {
      put(new THREE.CylinderGeometry(0.17, 0.2, 0.55, 6), TERRA, CF.m(s * 0.24, H + 0.42, 0), `${tag}Pots`);
      put(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 6), TERRA_L, CF.m(s * 0.24, H + 0.72, 0), `${tag}Pots`);
    }
    smoke(
      CF.p(0.24, H + 0.6, 0),
      T.out(th).multiplyScalar(-0.6).add(T.along(th).multiplyScalar(0.9)),
      4,
      family,
      `${tag}Smoke`,
    );
  };
  chimney(T3, 150, 3.1, T3.h - 0.6, 3.8, "chimneyA", 0);
  chimney(T3, 222, 3.15, T3.h - 0.3, 2.9, "chimneyB", 1);
  // iron stovepipe out of the roof
  {
    const f = roofFacets[1][1];
    const p0 = f.a.clone().add(f.b).add(f.c).add(f.d).multiplyScalar(0.25);
    const outD = p0
      .clone()
      .sub(RF.p(0, RF.local(p0).y, 0))
      .setY(0)
      .normalize();
    const p1 = p0.clone().add(outD.clone().multiplyScalar(0.42));
    const p2 = p1.clone().add(v3(0, 1.5, 0));
    b.sweep([p0.clone().sub(outD.clone().multiplyScalar(0.3)), p1, p2], 0.15, {
      color: IRON_L,
      section: { ngon: 6 },
      bone: root,
      caps: "flat",
      skin: "rigid",
      name: "stovepipe",
    });
    for (const p of [p1.clone().add(v3(0, 0.5, 0)), p2.clone().add(v3(0, -0.1, 0))])
      put(
        new THREE.CylinderGeometry(0.19, 0.19, 0.09, 6),
        GOLD_D,
        new THREE.Matrix4().compose(p, qY(0), ONE),
        "stovepipe",
      );
    put(
      new THREE.ConeGeometry(0.34, 0.3, 6),
      IRON,
      new THREE.Matrix4().compose(p2.clone().add(v3(0, 0.35, 0)), qY(0), ONE),
      "stovepipe",
    );
    for (const s of [1, -1])
      putBeam(
        p2.clone().add(v3(s * 0.12, 0, 0)),
        p2.clone().add(v3(s * 0.2, 0.25, 0)),
        0.03,
        0.03,
        UP,
        IRON,
        "stovepipe",
      );
    smoke(p2.clone().add(v3(0, 0.45, 0)), outD.clone().multiplyScalar(-0.45), 3, 2, "stoveSmoke");
  }

  // =================================================================== IVY on tier 1's back
  const ivyHits = b.surface(t1Body).scatter(260, {
    rng: rng(19),
    minDist: 0.26,
    filter: (h) => {
      const l = T1.local(h.at);
      const a = (Math.atan2(l.x, l.z) / DEG + 360) % 360;
      const n = h.n.clone().applyQuaternion(T1.qi);
      return Math.abs(n.y) < 0.4 && a > 95 && a < 265 && l.y < 5.4 - Math.abs(a - 180) * 0.035 && l.y > -0.2;
    },
  });
  b.cards(ivyHits, IVY, {
    size: [0.62, 0.62],
    lean: 55,
    flow: [0, -1, 0],
    rng: rng(23),
    spin: 30,
    vary: 0.35,
    bone: root,
    sink: 0.05,
  });

  // =================================================================== CRYSTAL CLUSTERS IN THE ROCKS
  [105, 175, 238, 320].forEach((target, ci) => {
    let best = rockSpots[0];
    let bestD = Infinity;
    for (const r of rockSpots) {
      const a = (Math.atan2(r.at.x, r.at.z) / DEG + 360) % 360;
      const d = Math.abs(((a - target + 540) % 360) - 180) + (Math.hypot(r.at.x, r.at.z) > 5.6 ? 30 : 0) - r.size * 8;
      if (d < bestD) [best, bestD] = [r, d];
    }
    const cols = ci % 2 ? CRYSTAL_P : CRYSTAL_C;
    const base = best.top.clone().add(v3(0, -0.2, 0));
    for (let k = 0; k < 5; k++) {
      const dir = v3((hash(ci, k, 1) - 0.5) * 1.3, 1, (hash(ci, k, 2) - 0.5) * 1.3).normalize();
      const s = k === 0 ? 1.0 : 0.45 + hash(ci, k, 3) * 0.35;
      const off = k === 0 ? v3(0, 0, 0) : v3((hash(ci, k, 4) - 0.5) * 0.9, -0.05, (hash(ci, k, 5) - 0.5) * 0.9);
      putShaded(
        crystalGeo,
        new THREE.Matrix4().compose(base.clone().add(off), aim(dir), v3(s, s * 1.4, s)),
        cols,
        "rockCrystals",
        root,
        1.1,
        CRYSTAL_LIGHT,
        0.45,
        -0.15,
      );
    }
  });

  // =================================================================== SPARKLES (fireflies round the door, motes round the top)
  const sp = rng(61);
  for (let i = 0; i < 28; i++) {
    const th = sp() * 360;
    const at = RF.polar(th, 3.4 + sp() * 3.2, -2.5 + sp() * 7.5);
    const col = [GOLD_L, CRYSTAL_P[0], CRYSTAL_C[0]][i % 3];
    put(
      new THREE.OctahedronGeometry(0.06 + sp() * 0.07, 0),
      col,
      new THREE.Matrix4().compose(at, qY(sp() * 90), ONE),
      "motes",
      orbit,
      1.5,
    );
  }
  for (let i = 0; i < 12; i++) {
    const at = v3((sp() - 0.5) * 5.5, 0.6 + sp() * 2.6, 3.9 + sp() * 2.2);
    put(
      new THREE.OctahedronGeometry(0.04 + sp() * 0.04, 0),
      i % 2 ? GLOW_GOLD : GLOW_GREEN,
      new THREE.Matrix4().compose(at, qY(sp() * 90), ONE),
      "fireflies",
      root,
      1.5,
    );
  }

  // =================================================================== LANTERNS HUNG UNDER THE JETTY
  for (const th of [22.5, -22.5, 157.5]) {
    const hang = T3.polar(th, T3.R(0) + 0.15, -0.5);
    const lamp = T3.polar(th, T3.R(0) + 0.15, -1.25);
    putBeam(hang, lamp.clone().add(T3.d(0, 0.4, 0)), 0.03, 0.03, T3.out(th), IRON, "lanterns");
    lantern(lamp, T3.q.clone().multiply(qY(th)), 0.85, "lanterns");
  }

  flush();
  return b.root;
}
