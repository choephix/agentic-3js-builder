import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Gladiator Colosseum",
  description:
    "A low-poly Roman amphitheatre cut open toward the camera: raked sand arena with a red-granite obelisk spina and trapdoors, a podium wall with five portcullis gates, tiered stone seating, a three-order arcaded facade with statues, the emperor's box with its canopy, velarium sails on masts and banners everywhere.",
};

type V = [number, number, number];
type Col = string | Paint;

// palette: travertine, sand, blood red, gold, wood, iron, terracotta, marble, bronze patina, imperial purple
const STONE_DK = "#a6825c";
const STONE = "#d4b388";
const STONE_LT = "#eed6aa";
const RECESS = "#4a3a47";
const RECESS_LT = "#6a5462";
const SAND_DK = "#c4954f";
const SAND = "#e2bb74";
const SAND_LT = "#f2d79c";
const RED_DK = "#7a1a22";
const RED = "#b3262c";
const GOLD_DK = "#a67624";
const GOLD = "#ddae3e";
const GOLD_LT = "#f8dc78";
const WOOD_DK = "#4d3121";
const WOOD = "#7b4f2f";
const WOOD_LT = "#a8763f";
const IRON_DK = "#2b2e35";
const IRON = "#4b515c";
const IRON_LT = "#7a828f";
const TERRA_DK = "#8e3e27";
const TERRA = "#c05b36";
const TERRA_LT = "#e07f52";
const MARBLE_DK = "#c9c3b8";
const MARBLE = "#efebe2";
const PATINA = "#3f8277";
const PATINA_LT = "#66ad9d";
const PURPLE_DK = "#3f1d4d";
const PURPLE = "#62307a";
const CREAM = "#f4e8cc";
const FIRE = "#ff7a1c";
const FIRE_Y = "#ffd447";
const EMBER = "#ff4319";

const DEG = Math.PI / 180;
const sin = (t: number) => Math.sin(t * DEG);
const cos = (t: number) => Math.cos(t * DEG);

// ---------------------------------------------------------------------------------------------------------------
// Ellipse rings. The arena edge is an ellipse 30 x 20 m; `d` is the distance out from it, θ the angle from +Z
// toward +X. Stands run θ 41.25..318.75 (a 3/4 ring open toward +Z) in 7.5° bays.
const A0 = 15;
const B0 = 10;
const STEP = 9.25;
const E0 = 41.25;
const NB = 30;
const P = (d: number, t: number, y = 0): V => [(A0 + d) * sin(t), y, (B0 + d) * cos(t)];
const edgeT = (j: number) => E0 + STEP * j;
/** yaw (deg) of the outward normal of the offset ellipse at θ */
const yawAt = (d: number, t: number) => Math.atan2(sin(t) / (A0 + d), cos(t) / (B0 + d)) / DEG;

// lower cavea: 7 tiers; upper cavea: 5 tiers
const LOW = Array.from({ length: 7 }, (_, i) => ({ d0: 3.6 + 0.8 * i, d1: 4.4 + 0.8 * i, top: 3.9 + 0.6 * (i + 1) }));
const UP = Array.from({ length: 5 }, (_, j) => ({
  d0: 10.4 + 0.7 * j,
  d1: 11.1 + 0.7 * j,
  top: 10.6 + 0.55 * (j + 1),
}));
const LOW_BASE = 3.9;
const UP_BASE = 8.1;

// ---------------------------------------------------------------------------------------------------------------
// textures (flat fills, hard edges)
const hang = (w: number, h: number, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><g transform="rotate(180 ${w / 2} ${h / 2})">${inner}</g></svg>`;

const EAGLE = (cx: number, cy: number, s: number, fill: string, dark: string) => `
<g transform="translate(${cx} ${cy}) scale(${s})">
 <polygon points="0,-6 -4,-2 -16,-12 -26,-10 -20,-4 -28,-2 -20,2 -24,6 -12,6 -4,8 -6,16 0,22 6,16 4,8 12,6 24,6 20,2 28,-2 20,-4 26,-10 16,-12 4,-2" fill="${fill}"/>
 <polygon points="0,-6 -3,-12 0,-16 4,-13 7,-12 3,-10 3,-6" fill="${fill}"/>
 <polygon points="-16,-12 -20,-4 -12,0" fill="${dark}"/><polygon points="16,-12 20,-4 12,0" fill="${dark}"/>
 <polygon points="-6,16 0,22 6,16 0,18" fill="${dark}"/>
</g>`;

const BANNER = hang(
  60,
  140,
  `<polygon points="0,0 60,0 60,128 30,110 0,128" fill="${RED}"/>
 <polygon points="6,12 54,12 54,118 30,104 6,118" fill="none" stroke="${GOLD}" stroke-width="3"/>
 <rect x="0" y="0" width="60" height="8" fill="${GOLD}"/><rect x="0" y="8" width="60" height="3" fill="${RED_DK}"/>
 <circle cx="30" cy="56" r="16" fill="none" stroke="${GOLD}" stroke-width="4"/>
 <g fill="${GOLD_LT}"><rect x="28" y="34" width="4" height="44" transform="rotate(38 30 56)"/><rect x="28" y="34" width="4" height="44" transform="rotate(-38 30 56)"/></g>
 <rect x="22" y="70" width="16" height="3" fill="${GOLD}" transform="rotate(38 30 56)"/><rect x="22" y="70" width="16" height="3" fill="${GOLD}" transform="rotate(-38 30 56)"/>
 <polygon points="30,84 37,92 30,100 23,92" fill="${GOLD}"/>`,
);
const EMP_BANNER = hang(
  50,
  200,
  `<polygon points="0,0 50,0 50,186 25,200 0,186" fill="${PURPLE}"/>
 <rect x="0" y="0" width="50" height="9" fill="${GOLD}"/>
 <rect x="5" y="14" width="40" height="166" fill="none" stroke="${GOLD}" stroke-width="3"/>
 ${EAGLE(25, 62, 0.75, GOLD, GOLD_DK)}
 <text x="25" y="118" font-family="serif" font-weight="bold" font-size="15" text-anchor="middle" fill="${GOLD_LT}">SPQR</text>
 <rect x="12" y="132" width="26" height="4" fill="${GOLD}"/><rect x="18" y="142" width="14" height="4" fill="${GOLD}"/>
 <polygon points="25,152 33,162 25,172 17,162" fill="${GOLD}"/>`,
);
const TOWER_BANNER = hang(
  60,
  220,
  `<polygon points="0,0 60,0 60,200 45,220 30,204 15,220 0,200" fill="${RED}"/>
 <rect x="0" y="0" width="60" height="10" fill="${GOLD}"/><rect x="0" y="10" width="60" height="3" fill="${RED_DK}"/>
 <rect x="6" y="18" width="48" height="176" fill="none" stroke="${GOLD}" stroke-width="3"/>
 ${EAGLE(30, 70, 0.95, GOLD, GOLD_DK)}
 <text x="30" y="136" font-family="serif" font-weight="bold" font-size="16" text-anchor="middle" fill="${GOLD_LT}">SPQR</text>
 <circle cx="30" cy="166" r="12" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
 <rect x="10" y="186" width="40" height="3" fill="${GOLD}"/>`,
);
const DRAPE = hang(
  120,
  60,
  `<polygon points="0,0 120,0 120,44 110,56 100,44 90,56 80,44 70,56 60,44 50,56 40,44 30,56 20,44 10,56 0,44" fill="${PURPLE}"/>
 <rect x="0" y="0" width="120" height="6" fill="${GOLD}"/>
 <polyline points="0,40 10,52 20,40 30,52 40,40 50,52 60,40 70,52 80,40 90,52 100,40 110,52 120,40" fill="none" stroke="${GOLD}" stroke-width="3"/>
 ${EAGLE(60, 24, 0.55, GOLD, GOLD_DK)}`,
);
const VALANCE = hang(
  100,
  36,
  `<polygon points="0,0 100,0 100,22 90,32 80,22 70,32 60,22 50,32 40,22 30,32 20,22 10,32 0,22" fill="${RED}"/>
 <rect x="0" y="0" width="100" height="5" fill="${GOLD}"/>
 <polyline points="0,18 10,28 20,18 30,28 40,18 50,28 60,18 70,28 80,18 90,28 100,18" fill="none" stroke="${GOLD}" stroke-width="3"/>`,
);
const PENNANT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 80">
 <polygon points="0,0 30,0 30,62 15,80 15,66 0,80" fill="${RED}"/><rect x="0" y="0" width="30" height="6" fill="${GOLD}"/>
 <rect x="11" y="6" width="8" height="58" fill="${GOLD}"/></svg>`;
const GLYPHS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 160"><g fill="${GOLD_LT}">
 <circle cx="10" cy="10" r="4"/><rect x="4" y="18" width="12" height="2.5"/><polygon points="4,26 16,26 10,34"/>
 <rect x="8" y="38" width="4" height="12"/><rect x="5" y="40" width="10" height="2.5"/><circle cx="10" cy="56" r="3" fill="none" stroke="${GOLD_LT}" stroke-width="2.5"/>
 <polyline points="3,66 7,62 10,66 13,62 17,66" fill="none" stroke="${GOLD_LT}" stroke-width="2.5"/>
 <polyline points="3,72 7,68 10,72 13,68 17,72" fill="none" stroke="${GOLD_LT}" stroke-width="2.5"/>
 <polygon points="4,80 12,78 16,82 12,84 10,90 8,84"/><rect x="5" y="96" width="10" height="10"/>
 <rect x="8" y="98" width="4" height="6" fill="${RED_DK}"/><polygon points="10,112 16,122 4,122"/>
 <circle cx="10" cy="130" r="3.5"/><rect x="9" y="133" width="2.5" height="8"/><rect x="4" y="146" width="12" height="2.5"/>
 <rect x="4" y="151" width="12" height="2.5"/></g></svg>`;

const LETTER_ROWS = [
  "S · P · Q · R",
  "MORITVRI TE SALVTANT",
  "PORTA SANAVIVARIA",
  "PORTA LIBITINENSIS",
  "BESTIARII",
  "PORTA TRIVMPHALIS",
];
const LETTERS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 ${64 * LETTER_ROWS.length}">${LETTER_ROWS.map(
  (txt, r) =>
    `<rect x="0" y="${r * 64}" width="512" height="64" fill="${RED}"/><rect x="6" y="${r * 64 + 6}" width="500" height="52" fill="none" stroke="${GOLD}" stroke-width="4"/>` +
    `<text x="256" y="${r * 64 + 44}" font-family="serif" font-weight="bold" font-size="32" text-anchor="middle" fill="${GOLD_LT}" ${txt.length > 12 ? 'textLength="440" lengthAdjust="spacingAndGlyphs"' : ""}>${txt}</text>`,
).join("")}</svg>`;

const roman = (n: number) => {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let s = "";
  for (const [v, r] of map) while (n >= v) ((s += r), (n -= v));
  return s;
};
const NUM_COLS = 4;
const NUM_ROWS = 8;
const NUMERALS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${128 * NUM_COLS} ${40 * NUM_ROWS}">${Array.from(
  { length: NUM_COLS * NUM_ROWS },
  (_, k) => {
    const x = (k % NUM_COLS) * 128;
    const y = Math.floor(k / NUM_COLS) * 40;
    return `<rect x="${x}" y="${y}" width="128" height="40" fill="${STONE_LT}"/><text x="${x + 64}" y="${y + 31}" font-family="serif" font-weight="bold" font-size="30" text-anchor="middle" fill="${RECESS}">${roman(k + 1)}</text>`;
  },
).join("")}</svg>`;

export default function build() {
  const b = createBuilder({ name: "lowPolyColosseum", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  type Joint = typeof base;
  const R = rng(1977);

  const T_BANNER = svg(BANNER, { size: 256 });
  const T_EMP = svg(EMP_BANNER, { size: 256 });
  const T_TOWER = svg(TOWER_BANNER, { size: 256 });
  const T_DRAPE = svg(DRAPE, { size: 256 });
  const T_VALANCE = svg(VALANCE, { size: 256 });
  const T_PENNANT = svg(PENNANT, { size: 128 });
  const T_GLYPHS = svg(GLYPHS, { size: 256 });
  const T_LETTERS = svg(LETTERS, { size: 1024 });
  const T_NUMS = svg(NUMERALS, { size: 512 });

  // -------------------------------------------------------------------------------------------------------------
  // batching: one merged part per bone and colour (or texture)
  const batch = new Map<Joint, Map<Col, THREE.BufferGeometry[]>>();
  const texBatch = new Map<Joint, Map<THREE.Texture, THREE.BufferGeometry[]>>();
  function clean(g: THREE.BufferGeometry) {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "uv") n.deleteAttribute(k);
    if (!n.getAttribute("uv"))
      n.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n.getAttribute("position").count * 2), 2));
    n.clearGroups();
    n.computeVertexNormals();
    return n;
  }
  function add(g: THREE.BufferGeometry, color: Col, bone: Joint = base) {
    let m = batch.get(bone);
    if (!m) batch.set(bone, (m = new Map()));
    let list = m.get(color);
    if (!list) m.set(color, (list = []));
    list.push(clean(g));
  }
  function addTex(g: THREE.BufferGeometry, tex: THREE.Texture, bone: Joint = base) {
    let m = texBatch.get(bone);
    if (!m) texBatch.set(bone, (m = new Map()));
    let list = m.get(tex);
    if (!list) m.set(tex, (list = []));
    list.push(clean(g));
  }
  const mat = (at: V, rot: V = [0, 0, 0], scale: V = [1, 1, 1]) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
      new THREE.Vector3(...scale),
    );
  const at0 = (o: V, yaw: number) => mat(o, [0, yaw, 0]);
  const world = (M: THREE.Matrix4 | undefined, p: V): V => {
    if (!M) return p;
    const v = new THREE.Vector3(...p).applyMatrix4(M);
    return [v.x, v.y, v.z];
  };

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const CYL: Record<number, THREE.BufferGeometry> = {
    4: new THREE.CylinderGeometry(1, 1, 1, 4),
    5: new THREE.CylinderGeometry(1, 1, 1, 5),
    6: new THREE.CylinderGeometry(1, 1, 1, 6),
    8: new THREE.CylinderGeometry(1, 1, 1, 8),
  };
  const CONE4 = new THREE.ConeGeometry(1, 1, 4);
  const CONE5 = new THREE.ConeGeometry(1, 1, 5);
  const CONE6 = new THREE.ConeGeometry(1, 1, 6);
  const SPH = new THREE.SphereGeometry(1, 6, 4);
  const SPH_S = new THREE.SphereGeometry(1, 4, 2);

  function S(
    geo: THREE.BufferGeometry,
    color: Col,
    at: V,
    scale: V = [1, 1, 1],
    rot: V = [0, 0, 0],
    M?: THREE.Matrix4,
    bone: Joint = base,
  ) {
    const g = geo.clone().applyMatrix4(mat(at, rot, scale));
    if (M) g.applyMatrix4(M);
    add(g, color, bone);
  }
  /** an axis-aligned box from bounds (in M's frame) */
  function bx(
    color: Col,
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z0: number,
    z1: number,
    M?: THREE.Matrix4,
    bone: Joint = base,
  ) {
    S(BOX, color, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [x1 - x0, y1 - y0, z1 - z0], [0, 0, 0], M, bone);
  }
  /** vertical n-sided prism, radius r (top radius rt), from y0 to y1 */
  function cyl(
    color: Col,
    n: number,
    r: number,
    x: number,
    z: number,
    y0: number,
    y1: number,
    M?: THREE.Matrix4,
    bone: Joint = base,
    rt = r,
    open = false,
  ) {
    const g = new THREE.CylinderGeometry(rt, r, y1 - y0, n, 1, open).translate(x, (y0 + y1) / 2, z);
    if (M) g.applyMatrix4(M);
    add(g, color, bone);
  }
  /** a box or n-prism of full width w running from a to c */
  function beam(color: Col, a: V, c: V, w: number, M?: THREE.Matrix4, bone: Joint = base, sides = 0) {
    const dir = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = dir.length();
    const q = aim(dir);
    const g = (sides ? CYL[sides] : BOX)
      .clone()
      .applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2),
          q,
          new THREE.Vector3(sides ? w / 2 : w, len, sides ? w / 2 : w),
        ),
      );
    if (M) g.applyMatrix4(M);
    add(g, color, bone);
  }
  /** textured plane facing local +Z; uv rect [u0, v0, u1, v1] picks a cell of the drawing */
  function texPlane(
    tex: THREE.Texture,
    w: number,
    h: number,
    at: V,
    rot: V,
    M?: THREE.Matrix4,
    rect?: [number, number, number, number],
    bone: Joint = base,
  ) {
    const g = new THREE.PlaneGeometry(w, h);
    if (rect) {
      const uv = g.getAttribute("uv");
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, rect[0] + uv.getX(i) * (rect[2] - rect[0]), rect[1] + uv.getY(i) * (rect[3] - rect[1]));
    }
    g.applyMatrix4(mat(at, rot));
    if (M) g.applyMatrix4(M);
    addTex(g, tex, bone);
  }
  const letterRow = (r: number): [number, number, number, number] => [
    0,
    1 - (r + 1) / LETTER_ROWS.length,
    1,
    1 - r / LETTER_ROWS.length,
  ];
  /** U-shaped arch frame (outline around an arched opening), extruded along local +Z from z0 */
  function archFrame(
    color: Col,
    w: number,
    h: number,
    ow: number,
    crownGap: number,
    depth: number,
    y0: number,
    z0: number,
    M: THREE.Matrix4,
    bone: Joint = base,
    segs = 6,
  ) {
    const r = ow / 2;
    const hs = h - crownGap - r;
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(-r, 0);
    s.lineTo(-r, hs);
    for (let k = 1; k < segs; k++) {
      const a = Math.PI - (k / segs) * Math.PI;
      s.lineTo(r * Math.cos(a), hs + r * Math.sin(a));
    }
    s.lineTo(r, hs);
    s.lineTo(r, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, h);
    s.lineTo(-w / 2, h);
    s.lineTo(-w / 2, 0);
    const full = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 }).getAttribute(
      "position",
    );
    // drop the back cap: it lies flat against the wall behind
    const kept: number[] = [];
    for (let i = 0; i < full.count; i += 3)
      if (Math.max(Math.abs(full.getZ(i)), Math.abs(full.getZ(i + 1)), Math.abs(full.getZ(i + 2))) > 1e-6)
        for (let k = i; k < i + 3; k++) kept.push(full.getX(k), full.getY(k), full.getZ(k));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(kept, 3));
    g.translate(0, y0, z0).applyMatrix4(M);
    add(g, color, bone);
    return { hs, r };
  }

  /**
   * A closed (d, y) profile swept round the ellipse from θ t0 to t1 in flat facets. `hide` lists profile edges
   * (edge k runs from point k to k + 1) that lie against other masonry and get no faces.
   */
  function ring(prof: [number, number][], t0: number, t1: number, color: Col, n = 0, hide: number[] = []) {
    const bone = base;
    if (!n) n = Math.max(1, Math.round(Math.abs(t1 - t0) / STEP));
    let area = 0;
    for (let k = 0; k < prof.length; k++) {
      const [x0, y0] = prof[k];
      const [x1, y1] = prof[(k + 1) % prof.length];
      area += x0 * y1 - x1 * y0;
    }
    const ccw = area > 0;
    const pos: number[] = [];
    const va = new THREE.Vector3();
    const vb = new THREE.Vector3();
    const vc = new THREE.Vector3();
    const tri = (a: V, c1: V, c2: V, want: V) => {
      va.set(...a);
      vb.set(...c1).sub(va);
      vc.set(...c2).sub(va);
      const nrm = vb.clone().cross(vc);
      if (nrm.x * want[0] + nrm.y * want[1] + nrm.z * want[2] < 0) pos.push(...a, ...c2, ...c1);
      else pos.push(...a, ...c1, ...c2);
    };
    const dm = prof.reduce((s, p) => s + p[0], 0) / prof.length;
    for (let j = 0; j < n; j++) {
      const ta = t0 + ((t1 - t0) * j) / n;
      const tb = t0 + ((t1 - t0) * (j + 1)) / n;
      const tm = (ta + tb) / 2;
      for (let k = 0; k < prof.length; k++) {
        const p = prof[k];
        const q = prof[(k + 1) % prof.length];
        if (hide.includes(k) || (p[1] <= 0 && q[1] <= 0)) continue;
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        const o = ccw ? [dy, -dx] : [-dy, dx];
        const want: V = [sin(tm) * o[0], o[1], cos(tm) * o[0]];
        const A = P(p[0], ta, p[1]);
        const B = P(q[0], ta, q[1]);
        const C = P(q[0], tb, q[1]);
        const D = P(p[0], tb, p[1]);
        tri(A, B, C, want);
        tri(A, C, D, want);
      }
    }
    const tris = THREE.ShapeUtils.triangulateShape(
      prof.map((p) => new THREE.Vector2(p[0], p[1])),
      [],
    );
    const sg = Math.sign(t1 - t0);
    for (const [t, s] of [
      [t0, -sg],
      [t1, sg],
    ]) {
      const want: V = [s * (A0 + dm) * cos(t), 0, -s * (B0 + dm) * sin(t)];
      for (const [i0, i1, i2] of tris)
        tri(P(prof[i0][0], t, prof[i0][1]), P(prof[i1][0], t, prof[i1][1]), P(prof[i2][0], t, prof[i2][1]), want);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    add(g, color, bone);
  }
  /** frame on the chord between θa and θb at offset d: local +X along increasing θ, +Z outward */
  function facet(d: number, ta: number, tb: number) {
    const a = P(d, ta);
    const c = P(d, tb);
    const cx = c[0] - a[0];
    const cz = c[2] - a[2];
    const yaw = Math.atan2(-cz, cx) / DEG;
    return { M: at0([(a[0] + c[0]) / 2, 0, (a[2] + c[2]) / 2], yaw), w: Math.hypot(cx, cz), yaw };
  }
  /** angular half-width (deg) of a gap `w` meters wide at offset d around θ */
  const halfGap = (w: number, d: number, t: number) => w / 2 / Math.hypot((A0 + d) * cos(t), (B0 + d) * sin(t)) / DEG;
  /** split [t0, t1] around gaps */
  const split = (t0: number, t1: number, gaps: [number, number][]) => {
    const out: [number, number][] = [];
    let s = t0;
    for (const [g0, g1] of gaps.sort((p, q) => p[0] - q[0])) {
      if (g1 <= s || g0 >= t1) continue;
      if (g0 > s) out.push([s, g0]);
      s = Math.max(s, g1);
    }
    if (s < t1) out.push([s, t1]);
    return out;
  };

  // -------------------------------------------------------------------------------------------------------------
  // small props in local frames (feet at the origin, facing local +Z)
  function brazier(M: THREE.Matrix4, s = 1, legs = true) {
    const top = legs ? 1.1 * s : 0.25 * s;
    if (legs) {
      for (let k = 0; k < 3; k++) {
        const a = (k * 120 + 30) * DEG;
        beam(
          IRON_DK,
          [0.42 * s * Math.sin(a), 0, 0.42 * s * Math.cos(a)],
          [0.16 * s * Math.sin(a), top, 0.16 * s * Math.cos(a)],
          0.07 * s,
          M,
        );
        S(
          SPH_S,
          GOLD_DK,
          [0.42 * s * Math.sin(a), 0.05 * s, 0.42 * s * Math.cos(a)],
          [0.08 * s, 0.08 * s, 0.08 * s],
          [0, 0, 0],
          M,
        );
      }
    } else cyl(STONE_DK, 6, 0.3 * s, 0, 0, 0, top, M, base, 0.2 * s);
    cyl(GOLD_DK, 6, 0.26 * s, 0, 0, top, top + 0.32 * s, M, base, 0.5 * s);
    cyl(GOLD, 6, 0.55 * s, 0, 0, top + 0.3 * s, top + 0.38 * s, M);
    cyl(EMBER, 6, 0.46 * s, 0, 0, top + 0.3 * s, top + 0.42 * s, M);
    const f = top + 0.4 * s;
    const spin = R() * 60;
    S(CONE5, FIRE, [0, f + 0.42 * s, 0], [0.36 * s, 0.85 * s, 0.36 * s], [0, spin, 0], M);
    S(CONE4, FIRE, [0.2 * s, f + 0.25 * s, 0.05 * s], [0.18 * s, 0.5 * s, 0.18 * s], [0, spin, -14], M);
    S(CONE4, FIRE, [-0.18 * s, f + 0.22 * s, -0.08 * s], [0.17 * s, 0.45 * s, 0.17 * s], [10, spin, 12], M);
    S(CONE4, FIRE_Y, [0, f + 0.3 * s, 0.02 * s], [0.18 * s, 0.6 * s, 0.18 * s], [0, spin + 45, 0], M);
  }

  function statue(M: THREE.Matrix4, s: number, body: string, accent: string, kind: number, plinth = true) {
    let y = 0;
    if (plinth) {
      bx(STONE_LT, -0.4 * s, 0.4 * s, 0, 0.12 * s, -0.4 * s, 0.4 * s, M);
      bx(STONE, -0.34 * s, 0.34 * s, 0.12 * s, 0.42 * s, -0.34 * s, 0.34 * s, M);
      y = 0.42 * s;
    }
    const at = (x: number, yy: number, z: number): V => [x * s, y + yy * s, z * s];
    // robe / legs, torso, head
    S(CYL[5], body, at(0, 0.48, 0), [0.3 * s, 0.96 * s, 0.24 * s], [0, 36, 0], M);
    S(new THREE.CylinderGeometry(0.2, 0.27, 0.62, 4), body, at(0, 1.27, 0), [s, s, s * 0.75], [0, 45, 0], M);
    S(SPH, body, at(0, 1.74, 0.02), [0.15 * s, 0.17 * s, 0.15 * s], [0, 0, 0], M);
    bx(accent, -0.28 * s, 0.28 * s, y + 0.92 * s, y + 1.0 * s, -0.17 * s, 0.17 * s, M); // belt
    if (kind === 0) {
      // spear raised, round shield
      beam(body, at(-0.24, 1.48, 0), at(-0.42, 1.78, 0.1), 0.11 * s, M);
      beam(accent, at(-0.44, 0.1, 0.12), at(-0.44, 2.45, 0.12), 0.05 * s, M, base, 4);
      S(CONE4, accent, at(-0.44, 2.58, 0.12), [0.07 * s, 0.26 * s, 0.07 * s], [0, 0, 0], M);
      beam(body, at(0.24, 1.48, 0), at(0.36, 1.05, 0.12), 0.11 * s, M);
      S(CYL[8], accent, at(0.42, 1.1, 0.2), [0.3 * s, 0.05 * s, 0.3 * s], [90, 0, 0], M);
      S(SPH_S, body, at(0.42, 1.1, 0.24), [0.07 * s, 0.07 * s, 0.07 * s], [0, 0, 0], M);
    } else if (kind === 1) {
      // sword aloft, crested helmet
      beam(body, at(-0.24, 1.48, 0), at(-0.32, 2.0, 0.12), 0.11 * s, M);
      beam(accent, at(-0.32, 2.0, 0.12), at(-0.28, 2.7, 0.22), 0.07 * s, M);
      bx(accent, -0.44 * s, -0.2 * s, y + 1.97 * s, y + 2.02 * s, 0.07 * s, 0.17 * s, M);
      beam(body, at(0.24, 1.48, 0), at(0.34, 0.98, 0.04), 0.11 * s, M);
      bx(accent, -0.03 * s, 0.03 * s, y + 1.82 * s, y + 1.98 * s, -0.16 * s, 0.14 * s, M);
    } else {
      // laurel offered forward
      beam(body, at(-0.24, 1.48, 0), at(-0.2, 1.42, 0.42), 0.11 * s, M);
      beam(body, at(0.24, 1.48, 0), at(0.2, 1.42, 0.42), 0.11 * s, M);
      S(new THREE.TorusGeometry(0.16, 0.035, 3, 8), accent, at(0, 1.48, 0.48), [s, s, s], [0, 0, 0], M);
    }
  }

  function rack(M: THREE.Matrix4) {
    for (const x of [-1, 1]) {
      beam(WOOD, [x, 0, -0.25], [x, 1.45, 0], 0.11, M);
      beam(WOOD, [x, 0, 0.25], [x, 1.45, 0], 0.11, M);
    }
    beam(WOOD_LT, [-1.1, 1.38, 0], [1.1, 1.38, 0], 0.12, M);
    beam(WOOD_DK, [-1.0, 0.45, 0.14], [1.0, 0.45, 0.14], 0.08, M);
    // spears leaning on the top bar
    for (let k = 0; k < 4; k++) {
      const x = -0.75 + k * 0.32;
      beam(WOOD_LT, [x, 0, 0.42], [x + 0.04, 2.1, -0.06], 0.045, M, base, 4);
      S(CONE4, IRON_LT, [x + 0.045, 2.25, -0.1], [0.06, 0.3, 0.06], [-12, 0, 0], M);
    }
    // swords hanging off the lower rail
    for (const x of [0.4, 0.62]) {
      bx(IRON_LT, x - 0.03, x + 0.03, 0.55, 1.22, 0.2, 0.22, M);
      bx(GOLD, x - 0.12, x + 0.12, 1.22, 1.27, 0.18, 0.24, M);
      bx(WOOD_DK, x - 0.025, x + 0.025, 1.27, 1.42, 0.19, 0.23, M);
    }
    // shields against the feet
    S(CYL[8], RED, [0.78, 0.42, 0.42], [0.42, 0.06, 0.42], [72, 0, 0], M);
    S(CYL[8], GOLD, [0.78, 0.43, 0.46], [0.12, 0.06, 0.12], [72, 0, 0], M);
    bx(RED, -1.05, -0.45, 0.05, 1.05, 0.3, 0.38, M);
    bx(GOLD, -0.78, -0.72, 0.05, 1.05, 0.38, 0.4, M);
    bx(GOLD, -1.05, -0.45, 0.52, 0.58, 0.38, 0.4, M);
    // a gladiator helmet on the top bar
    S(
      new THREE.SphereGeometry(0.2, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
      IRON_LT,
      [0, 1.46, 0],
      [1, 1.1, 1],
      [0, 0, 0],
      M,
    );
    bx(IRON, -0.26, 0.26, 1.44, 1.48, -0.26, 0.26, M);
    bx(RED, -0.03, 0.03, 1.62, 1.72, -0.18, 0.2, M);
  }

  function trapdoor(name: string, x: number, z: number, yaw: number) {
    const M = at0([x, 0, z], yaw);
    const w = 2.0;
    const l = 1.6;
    // stone curb and dark pit
    bx(STONE_DK, -w / 2 - 0.22, w / 2 + 0.22, 0.12, 0.32, -l / 2 - 0.22, -l / 2, M);
    bx(STONE_DK, -w / 2 - 0.22, w / 2 + 0.22, 0.12, 0.32, l / 2, l / 2 + 0.22, M);
    bx(STONE_DK, -w / 2 - 0.22, -w / 2, 0.12, 0.32, -l / 2, l / 2, M);
    bx(STONE_DK, w / 2, w / 2 + 0.22, 0.12, 0.32, -l / 2, l / 2, M);
    bx(RECESS, -w / 2, w / 2, 0.1, 0.18, -l / 2, l / 2, M);
    const hinge = world(M, [0, 0.36, -l / 2]);
    const j = b.joint(name, { parent: base, at: hinge, role: "hinge" });
    const n = 5;
    for (let k = 0; k < n; k++) {
      const x0 = -w / 2 + 0.02 + (k * (w - 0.04)) / n;
      bx(k % 2 ? WOOD : WOOD_LT, x0 + 0.015, x0 + (w - 0.04) / n - 0.015, 0.3, 0.38, -l / 2 + 0.02, l / 2 - 0.02, M, j);
    }
    for (const zz of [-0.45, 0.45]) bx(IRON, -w / 2, w / 2, 0.38, 0.41, zz - 0.07, zz + 0.07, M, j);
    for (const xx of [-0.6, 0.6]) bx(IRON_DK, xx - 0.12, xx + 0.12, 0.33, 0.43, -l / 2 - 0.08, -l / 2 + 0.1, M, j);
    S(new THREE.TorusGeometry(0.12, 0.03, 3, 6), IRON_LT, [0, 0.41, l / 2 - 0.3], [1, 1, 1], [90, 0, 0], M, j);
    for (const xx of [-0.9, -0.3, 0.3, 0.9])
      for (const zz of [-0.45, 0.45]) S(SPH_S, IRON_LT, [xx, 0.42, zz], [0.04, 0.03, 0.04], [0, 0, 0], M, j);
  }

  // -------------------------------------------------------------------------------------------------------------
  // 1. Arena floor: raked sand, blood, trapdoors
  const TRAPS: [number, number, number][] = [
    [9.2, 4.2, 0],
    [-9.2, 4.2, 0],
    [9.2, -4.2, 0],
    [-9.2, -4.2, 0],
    [4.2, -5.2, 0],
    [-4.2, -5.2, 0],
  ];
  const BLOOD: [number, number, number][] = [
    [3.2, 3.0, 0.55],
    [3.7, 3.3, 0.3],
    [2.7, 2.6, 0.22],
    [3.9, 2.7, 0.14],
    [-5.6, -3.2, 0.45],
    [-5.1, -3.5, 0.25],
    [-6.0, -2.8, 0.18],
    [11.8, 1.0, 0.35],
    [12.3, 0.6, 0.2],
    [-1.2, 5.6, 0.3],
    [-0.8, 5.9, 0.16],
  ];
  const sandPaint = paint((p) => {
    for (const [x, z, r] of BLOOD) if ((p.x - x) ** 2 + (p.z - z) ** 2 < r * r) return RED_DK;
    const q = Math.hypot(p.x / A0, p.z / B0);
    if (q > 0.885) return q < 0.9 ? SAND_DK : SAND;
    let dd = Math.hypot(Math.max(Math.abs(p.x) - 7.6, 0), Math.max(Math.abs(p.z) - 1.0, 0)) + 0.6;
    for (const [x, z] of TRAPS) {
      const dt = Math.hypot(Math.max(Math.abs(p.x - x) - 1.0, 0), Math.max(Math.abs(p.z - z) - 0.8, 0));
      if (dt < 1.6) dd = dt + 0.3;
    }
    const m = dd % 0.62;
    return m < 0.11 ? SAND_DK : m < 0.19 ? SAND_LT : SAND;
  });
  {
    const top = new THREE.CircleGeometry(1, 48, (3.75 - 90) * DEG)
      .rotateX(-Math.PI / 2)
      .scale(A0 + 0.05, 1, B0 + 0.05)
      .translate(0, 0.25, 0);
    b.part(top, sandPaint, { bone: base, at: [0, 0, 0], name: "sand" });
    add(
      new THREE.CylinderGeometry(1, 1, 0.25, 48, 1, false, 3.75 * DEG)
        .scale(A0 + 0.05, 1, B0 + 0.05)
        .translate(0, 0.12, 0),
      SAND_DK,
    );
  }
  TRAPS.forEach(([x, z, yaw], i) => trapdoor(`trapdoor${i + 1}`, x, z, yaw));

  // -------------------------------------------------------------------------------------------------------------
  // 2. Spina: long plinth with a red-granite obelisk, metae, bronze champions, braziers
  {
    bx(STONE_DK, -6.3, 6.3, 0.2, 0.55, -1.05, 1.05);
    bx(STONE, -6.0, 6.0, 0.55, 1.35, -0.8, 0.8);
    bx(RED, -6.02, 6.02, 0.95, 1.2, -0.82, 0.82);
    bx(GOLD, -6.02, 6.02, 0.9, 0.95, -0.83, 0.83);
    bx(STONE_LT, -6.25, 6.25, 1.35, 1.52, -0.98, 0.98);
    for (let k = 0; k < 6; k++) {
      const x = -5 + k * 2;
      for (const z of [-1, 1]) bx(STONE_LT, x - 0.6, x + 0.6, 0.62, 0.88, z * 0.8 - 0.03, z * 0.8 + 0.03);
    }
    // obelisk
    bx(STONE_LT, -0.95, 0.95, 1.52, 1.75, -0.95, 0.95);
    bx(STONE, -0.8, 0.8, 1.75, 2.75, -0.8, 0.8);
    bx(GOLD, -0.82, 0.82, 2.45, 2.55, -0.82, 0.82);
    bx(STONE_LT, -0.9, 0.9, 2.75, 2.9, -0.9, 0.9);
    S(new THREE.CylinderGeometry(0.42, 0.62, 7.2, 4), RED_DK, [0, 2.9 + 3.6, 0], [1, 1, 1], [0, 45, 0]);
    S(CONE4, GOLD, [0, 10.1 + 0.4, 0], [0.42, 0.8, 0.42], [0, 45, 0]);
    // gold glyph bands on all four faces, leaning in with the taper
    for (let k = 0; k < 4; k++) texPlane(T_GLYPHS, 0.4, 3.3, [0, 4.75, 0.414], [-1.12, 0, 0], at0([0, 0, 0], k * 90));
    // metae at both ends
    for (const sx of [-1, 1]) {
      const x = sx * 6.75;
      cyl(STONE, 8, 1.05, x, 0, 0.2, 1.35);
      cyl(STONE_LT, 8, 1.15, x, 0, 1.35, 1.52);
      cyl(RED, 8, 1.07, x, 0, 0.95, 1.2);
      for (const z of [-0.55, 0, 0.55]) {
        cyl(GOLD_DK, 6, 0.26, x, z, 1.52, 1.75);
        S(CONE6, GOLD, [x, 1.75 + 1.25, z], [0.24, 2.5, 0.24]);
        S(SPH, GOLD_LT, [x, 4.25, z], [0.13, 0.13, 0.13]);
      }
    }
    // bronze champions on columns
    for (const sx of [-1, 1]) {
      const x = sx * 3.4;
      cyl(STONE_LT, 6, 0.42, x, 0, 1.52, 1.75);
      cyl(MARBLE, 6, 0.28, x, 0, 1.75, 3.5);
      cyl(GOLD, 6, 0.4, x, 0, 3.5, 3.7, undefined, base, 0.4);
      statue(at0([x, 3.7, 0], sx > 0 ? 70 : -70), 1.0, PATINA, GOLD, sx > 0 ? 0 : 1, false);
    }
    for (const sx of [-1, 1]) brazier(at0([sx * 1.75, 1.52, 0], 0), 0.6, false);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) brazier(at0([sx * 5.2, 1.52, sz * 0.4], 0), 0.35, false);
    // weapon racks against the spina's long sides
    rack(at0([-1.8, 0.25, 1.45], 0));
    rack(at0([1.8, 0.25, -1.45], 180));
  }
  // arena clutter: dropped shields, sword, spiked barricades, racks by the side gates
  {
    S(CYL[8], RED, [2.4, 0.3, 3.6], [0.45, 0.06, 0.45], [8, 20, 0]);
    S(CYL[8], GOLD, [2.4, 0.34, 3.6], [0.13, 0.06, 0.13], [8, 20, 0]);
    bx(IRON_LT, 3.5, 4.3, 0.27, 0.31, 3.75, 3.82);
    bx(GOLD, 3.4, 3.46, 0.26, 0.32, 3.68, 3.9);
    S(
      new THREE.SphereGeometry(0.2, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
      IRON_LT,
      [-5.0, 0.25, -2.5],
      [1, 1.1, 1],
      [0, 30, 15],
    );
    bx(RED, -5.03, -4.97, 0.4, 0.5, -2.7, -2.3);
    for (const [x, z, yaw] of [
      [-6.0, 5.3, 20],
      [6.4, -5.6, -15],
    ] as V[]) {
      const M = at0([x, 0.25, z], yaw);
      beam(WOOD, [-1.6, 0.45, 0], [1.6, 0.45, 0], 0.18, M, base, 6);
      for (let k = 0; k < 4; k++) {
        const xx = -1.2 + k * 0.8;
        beam(WOOD_LT, [xx, -0.05, -0.55], [xx, 1.0, 0.55], 0.1, M, base, 5);
        beam(WOOD_LT, [xx, -0.05, 0.55], [xx, 1.0, -0.55], 0.1, M, base, 5);
        S(CONE5, WOOD_DK, [xx, 1.05, 0.6], [0.06, 0.18, 0.06], [55, 0, 0], M);
        S(CONE5, WOOD_DK, [xx, 1.05, -0.6], [0.06, 0.18, 0.06], [-55, 0, 0], M);
      }
    }
    for (const sx of [-1, 1]) rack(at0([sx * 12.4, 0.25, 3.3], sx * -108));
  }

  // -------------------------------------------------------------------------------------------------------------
  // 3. Podium wall with gates; terrace, senators' benches, parapet, braziers, banners
  type GateSpec = { name: string; t: number; half: number; W: number; H: number; row: number; through: boolean };
  const GATES: GateSpec[] = [
    { name: "portcullisFront", t: 360, half: 11.25, W: 3.0, H: 2.6, row: 5, through: true },
    { name: "portcullisL", t: 90, half: 11.25, W: 2.6, H: 2.6, row: 2, through: false },
    { name: "portcullisR", t: 270, half: 11.25, W: 2.6, H: 2.6, row: 3, through: false },
    { name: "portcullisBeastL", t: 138.75, half: 7.5, W: 1.9, H: 2.3, row: 4, through: false },
    { name: "portcullisBeastR", t: 221.25, half: 7.5, W: 1.9, H: 2.3, row: 4, through: false },
  ];
  const gateGaps = GATES.map((g) => [g.t - g.half, g.t + g.half] as [number, number]);
  const RING0 = E0;
  const RING1 = E0 + STEP * NB;
  const podSegs = split(RING0, RING1, gateGaps);
  const frontSegs = split(RING1, 360 + RING0, gateGaps);
  const EMP: [number, number] = [168.75, 191.25];
  for (const [t0, t1] of podSegs) {
    ring(
      [
        [0, 0],
        [3.6, 0],
        [3.6, 3.9],
        [0, 3.9],
      ],
      t0,
      t1,
      STONE,
    );
  }
  // the open quarter keeps only a low barrier wall, so the sand reads from the front
  const FH = 1.6;
  for (const [t0, t1] of frontSegs) {
    ring(
      [
        [0, 0],
        [1.2, 0],
        [1.2, FH],
        [0, FH],
      ],
      t0,
      t1,
      STONE,
    );
    for (const [a, c] of [
      [-0.3, 0],
      [1.2, 1.5],
    ])
      ring(
        [
          [a, 0],
          [c, 0],
          [c, 0.55],
          [a, 0.55],
        ],
        t0,
        t1,
        STONE_DK,
      );
    for (const [a, c] of [
      [-0.06, 0],
      [1.2, 1.26],
    ])
      ring(
        [
          [a, FH - 0.6],
          [c, FH - 0.6],
          [c, FH - 0.25],
          [a, FH - 0.25],
        ],
        t0,
        t1,
        RED,
      );
    ring(
      [
        [-0.22, FH],
        [1.42, FH],
        [1.42, FH + 0.2],
        [-0.22, FH + 0.2],
      ],
      t0,
      t1,
      STONE_LT,
    );
    const n = Math.max(1, Math.round((t1 - t0) / STEP));
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      const p = P(0.6, t);
      bx(STONE_LT, -0.3, 0.3, 0, FH + 0.45, -0.85, 0.85, at0(p, yawAt(0.6, t)));
      S(CONE4, GOLD, [p[0], FH + 0.65, p[2]], [0.18, 0.4, 0.18], [0, yawAt(0.6, t) + 45, 0]);
    }
  }
  for (const [t0, t1] of podSegs) {
    ring(
      [
        [-0.35, 0],
        [0, 0],
        [0, 0.8],
        [-0.2, 0.8],
        [-0.35, 0.6],
      ],
      t0,
      t1,
      STONE_DK,
    );
    ring(
      [
        [-0.1, 2.6],
        [0, 2.6],
        [0, 2.7],
        [-0.1, 2.7],
      ],
      t0,
      t1,
      GOLD,
    );
    ring(
      [
        [-0.06, 2.7],
        [0, 2.7],
        [0, 3.3],
        [-0.06, 3.3],
      ],
      t0,
      t1,
      RED,
    );
    ring(
      [
        [-0.1, 3.4],
        [0, 3.4],
        [0, 3.95],
        [-0.35, 3.95],
        [-0.35, 3.6],
      ],
      t0,
      t1,
      STONE_LT,
    );
    // marble panels with porphyry insets and gold roundels, pilasters between them
    const n = Math.max(1, Math.round((t1 - t0) / STEP));
    for (let k = 0; k < n; k++) {
      const ta = t0 + ((t1 - t0) * k) / n;
      const tb = t0 + ((t1 - t0) * (k + 1)) / n;
      const f = facet(0, ta, tb);
      bx(MARBLE, -f.w * 0.36, f.w * 0.36, 0.95, 2.45, -0.06, 0, f.M);
      bx(RED_DK, -f.w * 0.26, f.w * 0.26, 1.15, 2.25, -0.09, 0, f.M);
      S(SPH_S, GOLD, [0, 1.7, -0.09], [0.15, 0.15, 0.06], [0, 0, 0], f.M);
      bx(STONE_LT, -f.w / 2 - 0.14, -f.w / 2 + 0.14, 0.8, 2.6, -0.12, 0, f.M);
      if (k === n - 1) bx(STONE_LT, f.w / 2 - 0.14, f.w / 2 + 0.14, 0.8, 2.6, -0.12, 0, f.M);
    }
  }
  // parapet runs round the stands, over their gates too
  ring(
    [
      [-0.15, 3.95],
      [0.35, 3.95],
      [0.35, 4.85],
      [-0.15, 4.85],
    ],
    RING0,
    RING1,
    STONE,
  );
  ring(
    [
      [-0.24, 4.85],
      [0.44, 4.85],
      [0.44, 5.02],
      [-0.24, 5.02],
    ],
    RING0,
    RING1,
    STONE_LT,
  );
  ring(
    [
      [-0.18, 4.25],
      [-0.15, 4.25],
      [-0.15, 4.6],
      [-0.18, 4.6],
    ],
    RING0,
    RING1,
    RED_DK,
  );
  // gates
  for (const g of GATES) {
    const f = facet(0, g.t - g.half, g.t + g.half);
    const M = f.M;
    const cw = f.w;
    const D = g.through ? 1.2 : 3.6;
    const { W, H } = g;
    bx(STONE, -cw / 2 - 0.25, -W / 2, 0, 3.95, 0, D, M);
    bx(STONE, W / 2, cw / 2 + 0.25, 0, 3.95, 0, D, M);
    bx(STONE, -W / 2, W / 2, H, 3.95, 0, D, M);
    bx(STONE_DK, -cw / 2 - 0.25, -W / 2, 0, 0.8, -0.3, 0, M);
    bx(STONE_DK, W / 2, cw / 2 + 0.25, 0, 0.8, -0.3, 0, M);
    bx(STONE_LT, -cw / 2 - 0.3, cw / 2 + 0.3, 3.4, 3.95, -0.36, 0, M);
    if (!g.through) {
      bx(RECESS, -W / 2, W / 2, 0, H, 1.0, D - 0.1, M);
      bx(SAND_DK, -W / 2, W / 2, 0, 0.25, -0.05, 1.0, M);
    } else {
      bx(STONE_DK, -W / 2, W / 2, 0, 0.28, -0.05, D + 0.05, M);
      bx(STONE, -cw / 2 - 0.25, cw / 2 + 0.25, 3.95, 4.85, -0.15, D, M);
      bx(STONE_LT, -cw / 2 - 0.35, cw / 2 + 0.35, 4.85, 5.02, -0.24, D + 0.1, M);
      bx(RED_DK, -cw / 2 - 0.1, cw / 2 + 0.1, 4.25, 4.6, -0.18, -0.15, M);
    }
    // arena-face dressing: jambs, lintel trim, keystone, plaque, engaged columns
    const faces = g.through ? [-1, 1] : [-1];
    for (const side of faces) {
      const z0 = side < 0 ? 0 : D;
      const zo = (v: number) => (side < 0 ? z0 - v : z0 + v);
      const zb = (a: number, c: number): [number, number] => (side < 0 ? [zo(c), zo(a)] : [zo(a), zo(c)]);
      bx(STONE_LT, -W / 2 - 0.3, -W / 2, 0.25, H, ...zb(0, 0.12), M);
      bx(STONE_LT, W / 2, W / 2 + 0.3, 0.25, H, ...zb(0, 0.12), M);
      bx(STONE_LT, -W / 2 - 0.3, W / 2 + 0.3, H, H + 0.3, ...zb(0, 0.12), M);
      bx(GOLD, -0.22, 0.22, H - 0.12, H + 0.42, ...zb(0, 0.2), M);
      const ph = 3.38 - (H + 0.32);
      const pw = Math.min(W + 0.6, ph * 8);
      texPlane(
        T_LETTERS,
        pw,
        ph,
        [0, (H + 0.32 + 3.38) / 2, zo(0.04)],
        [0, side < 0 ? 180 : 0, 0],
        M,
        letterRow(side > 0 ? 0 : g.row),
      );
      for (const sx of [-1, 1]) {
        const x = sx * (W / 2 + 0.6);
        cyl(STONE_LT, 6, 0.27, x, zo(0.05), 0.25, 0.5, M);
        cyl(MARBLE, 6, 0.2, x, zo(0.05), 0.5, 3.15, M);
        cyl(GOLD, 6, 0.21, x, zo(0.05), 3.15, 3.4, M, base, 0.3);
      }
    }
    // portcullis
    const pj = b.joint(g.name, { parent: base, at: world(M, [0, H, 0.5]) });
    const nb = Math.max(4, Math.round(W / 0.3));
    for (let k = 0; k < nb; k++) {
      const x = -W / 2 + 0.15 + (k * (W - 0.3)) / (nb - 1);
      bx(IRON, x - 0.045, x + 0.045, 0.34, H + 0.5, 0.45, 0.55, M, pj);
      S(CONE4, IRON_LT, [x, 0.24, 0.5], [0.07, 0.24, 0.07], [180, 45, 0], M, pj);
    }
    for (const y of [0.85, 1.65, H - 0.25])
      bx(IRON_DK, -W / 2 + 0.05, W / 2 - 0.05, y - 0.06, y + 0.06, 0.43, 0.57, M, pj);
    // braziers over the gate
    for (const sx of [-1, 1]) {
      const p = world(M, [sx * (W / 2 + 0.75), 5.02, 0.1]);
      bx(STONE_LT, -0.3, 0.3, 0, 0.2, -0.3, 0.3, at0(p, f.yaw));
      brazier(at0([p[0], 5.22, p[2]], f.yaw), 0.6, false);
    }
  }
  // senators' benches with red cushions on the terrace
  {
    const gaps: [number, number][] = [EMP];
    for (const [t0, t1] of split(RING0, RING1, gaps)) {
      ring(
        [
          [2.3, 3.9],
          [3.25, 3.9],
          [3.25, 4.32],
          [2.3, 4.32],
        ],
        t0,
        t1,
        MARBLE,
      );
      ring(
        [
          [2.4, 4.32],
          [3.15, 4.32],
          [3.15, 4.45],
          [2.4, 4.45],
        ],
        t0,
        t1,
        RED,
      );
      ring(
        [
          [3.25, 3.9],
          [3.6, 3.9],
          [3.6, 4.85],
          [3.25, 4.85],
        ],
        t0,
        t1,
        MARBLE_DK,
      );
    }
  }
  // braziers along the parapet, between banners
  for (const t of [75, 105, 165, 195, 255, 285]) {
    const p = P(0.1, t, 5.02);
    bx(STONE_LT, -0.28, 0.28, 0, 0.18, -0.28, 0.28, at0(p, yawAt(0, t)));
    brazier(at0([p[0], 5.2, p[2]], yawAt(0, t)), 0.55, false);
  }
  // podium banners on joints (cards hang from a gold rod)
  const banner = (name: string, top: V, out: V, tex: THREE.Texture, size: [number, number], rod: number) => {
    const j = b.joint(name, { parent: base, at: top });
    const yaw = Math.atan2(out[0], out[2]) / DEG;
    const M = at0(top, yaw);
    beam(GOLD, [-size[0] / 2 - 0.15, 0, 0], [size[0] / 2 + 0.15, 0, 0], rod, M, j, 6);
    for (const sx of [-1, 1])
      S(SPH_S, GOLD_LT, [sx * (size[0] / 2 + 0.2), 0, 0], [rod * 1.4, rod * 1.4, rod * 1.4], [0, 0, 0], M, j);
    b.cards([frame(top, [0, 1, 0])], tex, { size, lean: 180, flow: out, sink: 0, bone: j, mirror: true });
  };
  [60, 120, 157.5, 202.5, 240, 300].forEach((t, i) => {
    const out: V = [-sin(yawAt(0, t)), 0, -cos(yawAt(0, t))];
    banner(`bannerPodium${i + 1}`, P(-0.28, t, 4.75), out, T_BANNER, [1.2, 2.8], 0.08);
  });
  // vexilla: standards on poles flanking the processional way, their banners on joints
  for (const sx of [-1, 1]) {
    const x = sx * 3.7;
    const z = B0 + 7.2;
    bx(STONE_DK, x - 0.55, x + 0.55, 0.3, 0.55, z - 0.55, z + 0.55);
    bx(STONE_LT, x - 0.38, x + 0.38, 0.55, 0.95, z - 0.38, z + 0.38);
    cyl(WOOD_DK, 6, 0.08, x, z, 0.95, 6.3, undefined, base, 0.07, true);
    for (const y of [1.8, 2.35]) S(CYL[8], GOLD, [x, y, z + 0.08], [0.2, 0.05, 0.2], [90, 0, 0]);
    S(SPH_S, GOLD, [x, 6.45, z], [0.16, 0.22, 0.16]);
    S(SPH_S, GOLD, [x, 6.72, z + 0.1], [0.09, 0.09, 0.11]);
    for (const s2 of [-1, 1]) beam(GOLD, [x, 6.45, z], [x + s2 * 0.5, 6.85, z], 0.08);
    banner(`bannerStandard${sx > 0 ? "L" : "R"}`, [x, 5.7, z + 0.1], [0, 0, 1], T_BANNER, [1.2, 2.8], 0.08);
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. Seating: two caveae of tiers split by stairs, balteus wall with vomitoria, gallery under a tiled roof
  const LOW_AISLES = [75, 105, 135, 165, 195, 225, 255, 285];
  const UP_AISLES = [60, 90, 120, 150, 180, 210, 240, 270, 300];
  const tiers = (rows: typeof LOW, yb: number, aisles: number[], dMid: number) => {
    const gaps = aisles.map((t) => {
      const h = halfGap(1.3, dMid, t);
      return [t - h, t + h] as [number, number];
    });
    for (const [t0, t1] of split(RING0, RING1, gaps)) {
      const n = Math.max(1, Math.round((t1 - t0) / 10));
      rows.forEach((r, i) => {
        ring(
          [
            [r.d0, yb],
            [r.d1, yb],
            [r.d1, r.top],
            [r.d0, r.top],
          ],
          t0,
          t1,
          i % 2 ? STONE : STONE_DK,
          n,
          [0, 1],
        );
        ring(
          [
            [r.d0 - 0.05, r.top - 0.1],
            [r.d0 + 0.32, r.top - 0.1],
            [r.d0 + 0.32, r.top + 0.04],
            [r.d0 - 0.05, r.top + 0.04],
          ],
          t0,
          t1,
          STONE_LT,
          n,
        );
      });
    }
    for (const [g0, g1] of gaps) {
      rows.forEach((r) => {
        const dm = (r.d0 + r.d1) / 2;
        const half = r.top - (rows[1].top - rows[0].top) / 2;
        ring(
          [
            [r.d0, yb],
            [r.d1, yb],
            [r.d1, r.top],
            [dm, r.top],
            [dm, half],
            [r.d0, half],
          ],
          g0,
          g1,
          STONE_LT,
          1,
        );
      });
      // stair cheeks
      for (const t of [g0, g1])
        ring(
          [
            [rows[0].d0, yb],
            [rows[rows.length - 1].d1, yb],
            [rows[rows.length - 1].d1, rows[rows.length - 1].top + 0.18],
            [rows[0].d0, rows[0].top + 0.18],
          ],
          t - 0.12,
          t + 0.12,
          STONE_DK,
          1,
        );
    }
  };
  tiers(LOW, LOW_BASE, LOW_AISLES, 6.4);
  tiers(UP, UP_BASE, UP_AISLES, 12.1);
  // praecinctio walkway and balteus wall
  ring(
    [
      [9.2, LOW_BASE],
      [10.0, LOW_BASE],
      [10.0, 8.1],
      [9.2, 8.1],
    ],
    RING0,
    RING1,
    STONE,
  );
  ring(
    [
      [10.0, LOW_BASE],
      [10.4, LOW_BASE],
      [10.4, 10.6],
      [10.0, 10.6],
    ],
    RING0,
    RING1,
    STONE,
  );
  ring(
    [
      [9.92, 10.6],
      [10.48, 10.6],
      [10.48, 10.78],
      [9.92, 10.78],
    ],
    RING0,
    RING1,
    STONE_LT,
  );
  ring(
    [
      [9.96, 9.6],
      [10.0, 9.6],
      [10.0, 10.3],
      [9.96, 10.3],
    ],
    RING0,
    RING1,
    RED,
  );
  ring(
    [
      [9.94, 9.5],
      [10.0, 9.5],
      [10.0, 9.6],
      [9.94, 9.6],
    ],
    RING0,
    RING1,
    GOLD,
  );
  // vomitoria at the head of each lower stair
  for (const t of LOW_AISLES) {
    const h = halfGap(2.0, 10.0, t);
    const f = facet(10.0, t - h, t + h);
    bx(RECESS, -0.62, 0.62, 8.1, 9.75, -0.02, 0.05, f.M);
    archFrame(STONE_LT, 2.0, 2.3, 1.24, 0.12, 0.14, 8.1, -0.14, f.M);
  }
  // gallery floor, colonnade, architrave and tiled roof
  ring(
    [
      [13.9, UP_BASE],
      [14.4, UP_BASE],
      [14.4, 13.35],
      [13.9, 13.35],
    ],
    RING0,
    RING1,
    STONE,
  );
  for (let j = 0; j <= NB; j++) {
    const t = edgeT(j);
    const p = P(14.05, t);
    bx(STONE_LT, p[0] - 0.22, p[0] + 0.22, 13.35, 13.55, p[2] - 0.22, p[2] + 0.22);
    cyl(MARBLE, 6, 0.16, p[0], p[2], 13.55, 16.0, undefined, base, 0.16, true);
    bx(STONE_LT, p[0] - 0.24, p[0] + 0.24, 15.95, 16.2, p[2] - 0.24, p[2] + 0.24);
  }
  ring(
    [
      [13.75, 16.2],
      [14.7, 16.2],
      [14.7, 16.6],
      [13.75, 16.6],
    ],
    RING0,
    RING1,
    STONE_LT,
  );
  const roofPaint = paint((p) => {
    const a = Math.atan2(p.x / A0, p.z / B0) / DEG;
    return ((a % 1.5) + 1.5) % 1.5 < 0.5 ? TERRA_DK : TERRA;
  });
  ring(
    [
      [13.55, 16.55],
      [14.75, 16.55],
      [14.75, 18.0],
    ],
    RING0,
    RING1,
    roofPaint,
  );
  ring(
    [
      [13.5, 16.48],
      [13.62, 16.48],
      [13.62, 16.66],
      [13.5, 16.66],
    ],
    RING0,
    RING1,
    TERRA_LT,
  );

  // -------------------------------------------------------------------------------------------------------------
  // 5. Outer facade: three arcaded orders (Doric, Ionic, Corinthian), attic with shields and windows, masts
  ring(
    [
      [14.4, 0],
      [15.0, 0],
      [15.0, 18.0],
      [14.75, 18.0],
      [14.75, 13.35],
      [14.4, 13.35],
    ],
    RING0,
    RING1,
    RECESS,
  );
  ring(
    [
      [14.9, 0],
      [16.7, 0],
      [16.7, 0.22],
      [14.9, 0.22],
    ],
    RING0,
    RING1,
    STONE_DK,
  );
  ring(
    [
      [14.9, 0.22],
      [16.25, 0.22],
      [16.25, 0.5],
      [14.9, 0.5],
    ],
    RING0,
    RING1,
    STONE,
  );
  const LV = [
    { y0: 0.5, y1: 5.0 },
    { y0: 5.8, y1: 10.0 },
    { y0: 10.7, y1: 14.6 },
  ];
  const ENT = [
    [5.0, 5.8],
    [10.0, 10.7],
    [14.6, 15.2],
  ];
  for (const [e0, e1] of ENT) {
    const h = e1 - e0;
    ring(
      [
        [15.0, e0],
        [15.86, e0],
        [15.86, e0 + 0.36 * h],
        [15.0, e0 + 0.36 * h],
      ],
      RING0,
      RING1,
      STONE,
      0,
      [2, 3],
    );
    ring(
      [
        [15.0, e0 + 0.36 * h],
        [15.8, e0 + 0.36 * h],
        [15.8, e0 + 0.68 * h],
        [15.0, e0 + 0.68 * h],
      ],
      RING0,
      RING1,
      STONE_DK,
      0,
      [0, 2, 3],
    );
    ring(
      [
        [15.0, e0 + 0.68 * h],
        [15.86, e0 + 0.68 * h],
        [16.06, e0 + 0.84 * h],
        [16.06, e1],
        [15.0, e1],
      ],
      RING0,
      RING1,
      STONE_LT,
      0,
      [0, 4],
    );
  }
  // attic and crowning cornice
  ring(
    [
      [15.0, 15.2],
      [15.6, 15.2],
      [15.6, 18.0],
      [15.0, 18.0],
    ],
    RING0,
    RING1,
    STONE,
  );
  ring(
    [
      [14.6, 18.0],
      [15.75, 18.0],
      [15.98, 18.2],
      [15.98, 18.5],
      [14.6, 18.5],
    ],
    RING0,
    RING1,
    STONE_LT,
  );
  ring(
    [
      [15.0, 17.55],
      [15.66, 17.55],
      [15.66, 17.75],
      [15.0, 17.75],
    ],
    RING0,
    RING1,
    RED,
  );
  const SAILS = new Set([6, 7, 9, 10, 12, 13, 16, 17, 19, 20, 22, 23]);
  for (let j = 0; j < NB; j++) {
    const ta = edgeT(j);
    const tb = edgeT(j + 1);
    const f = facet(15.0, ta, tb);
    LV.forEach((lv, li) => {
      const h = lv.y1 - lv.y0;
      const ow = f.w - 1.5;
      const { hs, r } = archFrame(STONE, f.w + 0.02, h, ow, 0.5, 0.6, lv.y0, 0, f.M, base, 5);
      const crown = lv.y0 + hs + r;
      bx(STONE_LT, -0.24, 0.24, crown - 0.12, crown + 0.42, 0.55, 0.7, f.M); // keystone
      if (li === 0) {
        bx(STONE_DK, -r, r, lv.y0 - 0.02, lv.y0 + 0.04, 0, 0.6, f.M);
        const col = j % NUM_COLS;
        const row = Math.floor(j / NUM_COLS);
        const cell: [number, number, number, number] = [
          col / NUM_COLS,
          1 - (row + 1) / NUM_ROWS,
          (col + 1) / NUM_COLS,
          1 - row / NUM_ROWS,
        ];
        texPlane(T_NUMS, 0.84, 0.26, [0, 5.0 + 0.36 * 0.8 + 0.125, 0.825], [0, 0, 0], f.M, cell);
      } else {
        // balustrade in the arch, statue (2nd order) or red valance (3rd)
        bx(STONE_LT, -r, r, lv.y0, lv.y0 + 0.75, 0.15, 0.42, f.M);
        bx(STONE_DK, -r + 0.2, r - 0.2, lv.y0 + 0.15, lv.y0 + 0.6, 0.41, 0.44, f.M);
        if (li === 1) {
          const kind = j % 3;
          statue(
            mat([0, lv.y0 + 0.75, 0.25]).premultiply(f.M),
            1.15,
            j % 2 ? MARBLE : MARBLE_DK,
            j % 2 ? GOLD : PATINA,
            kind,
          );
        }
      }
    });
    // attic: window or bronze shield; pilasters at the bay edges
    if (j % 2 === 0) {
      bx(RECESS, -0.45, 0.45, 16.0, 17.2, 0.55, 0.62, f.M);
      bx(STONE_LT, -0.6, 0.6, 15.85, 16.0, 0.55, 0.7, f.M);
      bx(STONE_LT, -0.6, 0.6, 17.2, 17.35, 0.55, 0.7, f.M);
    } else {
      S(CYL[6], PATINA, [0, 16.55, 0.62], [0.6, 0.12, 0.6], [90, 0, 0], f.M);
      S(CYL[6], PATINA_LT, [0, 16.55, 0.68], [0.42, 0.06, 0.42], [90, 30, 0], f.M);
      S(SPH_S, GOLD, [0, 16.55, 0.72], [0.17, 0.17, 0.12], [0, 0, 0], f.M);
    }
  }
  // L3 valances hang in every third-order arch
  {
    const frames = [];
    const flows: V[] = [];
    for (let j = 0; j < NB; j++) {
      const f = facet(15.0, edgeT(j), edgeT(j + 1));
      const r = (f.w - 1.15) / 2;
      const hs = 14.6 - 10.7 - 0.5 - r;
      frames.push(frame(world(f.M, [0, 10.7 + hs + r * 0.75, 0.35]), [0, 1, 0]));
      flows.push([Math.sin(f.yaw * DEG), 0, Math.cos(f.yaw * DEG)]);
    }
    b.cards(frames, T_VALANCE, { size: [2.3, 0.85], lean: 180, sink: 0, bone: base, flow: (_fr, i) => flows[i] });
  }
  // engaged columns of the three orders, corbels and velarium masts at every pier
  for (let j = 0; j <= NB; j++) {
    const t = edgeT(j);
    const yaw = yawAt(15.55, t);
    const p = P(15.55, t);
    const M = at0(p, yaw);
    LV.forEach((lv, li) => {
      bx(STONE_LT, -0.42, 0.42, lv.y0, lv.y0 + 0.22, -0.3, 0.42, M);
      cyl(li === 0 ? STONE : MARBLE, 6, 0.27, 0, 0, lv.y0 + 0.22, lv.y1 - 0.3, M, base, 0.24, true);
      if (li === 0) {
        cyl(STONE_LT, 6, 0.24, 0, 0, lv.y1 - 0.3, lv.y1 - 0.14, M, base, 0.36, true);
        bx(STONE_LT, -0.42, 0.42, lv.y1 - 0.14, lv.y1, -0.3, 0.44, M);
      } else if (li === 1) {
        bx(STONE_LT, -0.4, 0.4, lv.y1 - 0.3, lv.y1 - 0.12, -0.3, 0.4, M);
        for (const sx of [-1, 1]) S(CYL[4], GOLD, [sx * 0.34, lv.y1 - 0.24, 0.08], [0.14, 0.62, 0.14], [90, 0, 45], M);
        bx(STONE_LT, -0.44, 0.44, lv.y1 - 0.12, lv.y1, -0.3, 0.44, M);
      } else {
        cyl(MARBLE, 6, 0.24, 0, 0, lv.y1 - 0.45, lv.y1 - 0.14, M, base, 0.38, true);
        cyl(GOLD, 6, 0.31, 0, 0, lv.y1 - 0.36, lv.y1 - 0.24, M, base, 0.34, true);
        bx(STONE_LT, -0.46, 0.46, lv.y1 - 0.14, lv.y1, -0.3, 0.46, M);
      }
    });
    // attic pilaster
    bx(STONE_LT, -0.32, 0.32, 15.2, 17.55, 0.0, 0.16, M);
    // corbel and mast
    const pm = P(16.0, t);
    bx(STONE_DK, -0.3, 0.3, 15.2, 15.5, 0.05, 0.75, M);
    cyl(WOOD, 6, 0.13, pm[0], pm[2], 15.5, 23.1, undefined, base, 0.1, true);
    for (const y of [17.2, 20.6]) cyl(IRON_DK, 6, 0.16, pm[0], pm[2], y, y + 0.14, undefined, base, 0.16, true);
    S(CONE4, GOLD, [pm[0], 23.35, pm[2]], [0.14, 0.5, 0.14]);
    S(SPH_S, GOLD_LT, [pm[0], 23.1, pm[2]], [0.17, 0.13, 0.17]);
  }
  // velarium: booms and striped sails on joints
  const sailPaint = (alt: boolean) =>
    paint((_p, _n, s) => {
      if (s[1] > 0.88) return RED_DK;
      if (s[1] < 0.06) return alt ? GOLD : RED;
      const a = s[0];
      if (alt) return a > 0.38 && a < 0.62 ? GOLD : RED;
      return a > 0.4 && a < 0.6 ? RED : CREAM;
    });
  const SAIL_A = sailPaint(false);
  const SAIL_B = sailPaint(true);
  const boomTip = (j: number): V => P(8.0, edgeT(j), 17.6);
  const booms = new Set<number>();
  for (const j of SAILS) booms.add(j).add(j + 1);
  for (const j of booms) {
    beam(WOOD_LT, P(16.0, edgeT(j), 22.6), boomTip(j), 0.16, undefined, base, 6);
    S(SPH_S, GOLD, boomTip(j), [0.15, 0.15, 0.15]);
    // stay rope from the mast top to the boom middle
    beam(WOOD_DK, P(16.0, edgeT(j), 23.0), P(11.5, edgeT(j), 19.85), 0.05, undefined, base, 4);
  }
  for (const j of SAILS) {
    const tm = (edgeT(j) + edgeT(j + 1)) / 2;
    const top = P(15.9, tm, 22.45);
    const sj = b.joint(`sail${j}`, { parent: base, at: top });
    const a: V[] = [P(15.9, edgeT(j) + 0.4, 22.45), P(15.9, edgeT(j + 1) - 0.4, 22.45)];
    const c: V[] = [P(8.2, edgeT(j) + 0.7, 17.6), P(8.6, tm, 17.1), P(8.2, edgeT(j + 1) - 0.7, 17.6)];
    b.membrane(a, c, { color: j % 2 ? SAIL_A : SAIL_B, thickness: 0.05, rows: 3, cols: 4, bone: sj });
  }
  // pennants on the masts without sails
  {
    const frames = [];
    const flows: V[] = [];
    for (let j = 0; j <= NB; j++) {
      if (booms.has(j)) continue;
      const t = edgeT(j);
      const p = P(16.0, t, 23.3);
      const y = yawAt(16, t);
      frames.push(frame(p, [Math.cos(y * DEG), 0, -Math.sin(y * DEG)]));
      flows.push([Math.sin(y * DEG), 0, Math.cos(y * DEG)]);
    }
    b.cards(frames, T_PENNANT, { size: [0.75, 2.0], flow: (_fr, i) => flows[i], sink: 0, bone: base, bend: 15 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. Emperor's box (pulvinar) at the back, facing the camera across the sand
  {
    const M = at0([0, 0, -B0], 180); // local +Z points away from the arena, local +X is world -X
    // platform on corbels, front parapet with porphyry panel and gold rail
    bx(STONE_LT, -3.4, 3.4, 3.95, 4.5, -0.95, 4.3, M);
    bx(GOLD, -3.42, 3.42, 4.1, 4.22, -0.97, -0.9, M);
    for (const x of [-2.6, 0, 2.6]) {
      bx(STONE_DK, x - 0.25, x + 0.25, 2.9, 3.95, -0.85, 0, M);
      S(CYL[4], STONE_DK, [x, 3.2, -0.6], [0.36, 0.5, 0.5], [0, 45, 0], M);
    }
    bx(MARBLE, -3.4, 3.4, 4.5, 5.35, -0.95, -0.65, M);
    bx(RED_DK, -2.9, 2.9, 4.62, 5.2, -0.99, -0.94, M);
    bx(GOLD, -3.45, 3.45, 5.35, 5.45, -1.0, -0.6, M);
    // columns, back wall, side walls
    for (const x of [-3.0, -1.1, 1.1, 3.0]) {
      cyl(GOLD_DK, 6, 0.3, x, -0.45, 4.5, 4.75, M);
      cyl(MARBLE, 6, 0.22, x, -0.45, 4.75, 8.35, M, base, 0.19);
      cyl(GOLD, 6, 0.2, x, -0.45, 8.35, 8.65, M, base, 0.32);
    }
    bx(RED, -3.3, 3.3, 4.5, 8.65, 3.9, 4.3, M);
    for (const x of [-2.0, 0, 2.0]) bx(GOLD, x - 0.6, x + 0.6, 5.4, 7.6, 3.85, 3.9, M);
    for (const x of [-2.0, 0, 2.0]) bx(RED_DK, x - 0.45, x + 0.45, 5.55, 7.45, 3.82, 3.86, M);
    for (const sx of [-1, 1]) {
      bx(STONE, sx * 3.2 - 0.18, sx * 3.2 + 0.18, 4.5, 8.65, 0.0, 4.3, M);
      bx(PURPLE, sx * 3.0 - 0.06, sx * 3.0 + 0.06, 4.6, 8.4, 0.1, 3.8, M);
    }
    // entablature with SPQR, pediment, tile roof, eagle
    bx(STONE_LT, -3.7, 3.7, 8.65, 9.0, -0.85, 4.4, M);
    bx(RED, -3.65, 3.65, 9.0, 9.45, -0.8, 4.35, M);
    texPlane(T_LETTERS, 3.0, 0.375, [0, 9.225, -0.81], [0, 180, 0], M, letterRow(0));
    bx(STONE_LT, -3.8, 3.8, 9.45, 9.65, -0.95, 4.5, M);
    const ped: OutlinePoint[] = [
      [-3.8, 0],
      [3.8, 0],
      [0, 1.55],
    ];
    const pedAt = world(M, [0, 9.65, 1.75]);
    b.extrude(ped, { at: pedAt, x: [-1, 0, 0], thickness: 5.4, color: STONE, bone: base });
    for (const sx of [-1, 1]) {
      const a = world(M, [sx * 1.95, 10.47, 1.75]);
      const ang = Math.atan2(1.55, 3.8) / DEG;
      S(BOX, TERRA, a, [4.35, 0.16, 5.9], [0, 180, sx * -ang]);
    }
    const eagleTex = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">${EAGLE(32, 17, 0.95, GOLD, GOLD_DK)}</svg>`,
      { size: 256 },
    );
    texPlane(eagleTex, 2.2, 1.1, [0, 10.1, -0.97], [0, 180, 0], M);
    S(SPH, GOLD_LT, world(M, [0, 11.3, -0.9]), [0.22, 0.22, 0.22]);
    for (const sx of [-1, 1]) S(CONE4, GOLD, world(M, [sx * 3.7, 9.95, -0.9]), [0.25, 0.6, 0.25]);
    // gold eagle on the apex
    {
      const e = mat(world(M, [0, 11.45, -0.85]), [0, 0, 0]);
      S(SPH, GOLD, [0, 0.35, 0], [0.28, 0.36, 0.24], [0, 0, 0], e);
      S(SPH, GOLD, [0, 0.8, 0.12], [0.15, 0.15, 0.17], [0, 0, 0], e);
      S(CONE4, GOLD_DK, [0, 0.78, 0.33], [0.06, 0.18, 0.06], [90, 0, 0], e);
      for (const sx of [-1, 1]) {
        const wing: OutlinePoint[] = [
          [0, 0],
          [0.6, 0.35],
          [1.15, 0.9],
          [1.0, 0.55],
          [1.2, 0.5],
          [0.95, 0.2],
          [1.05, 0.05],
          [0.5, 0.0],
          [0.3, -0.25],
        ];
        b.extrude(wing, {
          at: world(M, [sx * -0.15, 11.75, -0.85]),
          x: [sx, 0, 0],
          thickness: 0.08,
          color: GOLD,
          bone: base,
        });
      }
      S(CYL[4], GOLD_DK, [0, 0.0, 0], [0.3, 0.15, 0.3], [0, 45, 0], e);
    }
    // thrones
    for (const [x, s] of [
      [0, 1.15],
      [-1.7, 0.85],
      [1.7, 0.85],
    ] as [number, number][]) {
      bx(GOLD, x - 0.45 * s, x + 0.45 * s, 4.5, 4.5 + 0.55 * s, 1.6, 2.4, M);
      bx(PURPLE, x - 0.4 * s, x + 0.4 * s, 4.5 + 0.55 * s, 4.5 + 0.68 * s, 1.62, 2.35, M);
      bx(GOLD, x - 0.45 * s, x + 0.45 * s, 4.5, 4.5 + 1.5 * s, 2.35, 2.55, M);
      bx(PURPLE_DK, x - 0.32 * s, x + 0.32 * s, 4.5 + 0.7 * s, 4.5 + 1.35 * s, 2.3, 2.36, M);
      for (const sx of [-1, 1])
        bx(GOLD_LT, x + sx * 0.45 * s - 0.06, x + sx * 0.45 * s + 0.06, 4.5 + 0.55 * s, 4.5 + 0.85 * s, 1.6, 2.35, M);
    }
    // braziers at the platform corners
    for (const sx of [-1, 1]) brazier(mat(world(M, [sx * 2.6, 4.5, 0.3]), [0, 180, 0]), 0.6, true);
    // canopy (awning) on its own joint, with valance and poles
    const cj = b.joint("canopy", { parent: base, at: world(M, [0, 8.85, -0.9]) });
    const ca: V[] = [world(M, [-3.6, 8.85, -0.9]), world(M, [3.6, 8.85, -0.9])];
    const cb: V[] = [world(M, [-3.6, 7.75, -3.4]), world(M, [0, 7.55, -3.55]), world(M, [3.6, 7.75, -3.4])];
    const canopyPaint = paint((_p, _n, s) => (Math.floor(s[0] * 9) % 2 ? GOLD : RED));
    b.membrane(ca, cb, { color: canopyPaint, thickness: 0.05, rows: 3, cols: 9, bone: cj });
    const valFrames = [-2.4, 0, 2.4].map((x) => frame(world(M, [x, 7.68, -3.48]), [0, 1, 0]));
    b.cards(valFrames, T_VALANCE, { size: [2.4, 0.6], lean: 180, flow: [0, 0, 1], sink: 0, bone: cj });
    for (const sx of [-1, 1]) {
      beam(GOLD, world(M, [sx * 3.55, 4.5, -3.4]), world(M, [sx * 3.55, 7.85, -3.4]), 0.1, undefined, cj, 6);
      S(SPH, GOLD_LT, world(M, [sx * 3.55, 7.95, -3.4]), [0.13, 0.13, 0.13], [0, 0, 0], undefined, cj);
    }
    // the tribune projects over the sand on four columns, a purple drape hung from its gilded rail
    bx(STONE_LT, -3.75, 3.75, 3.95, 4.5, -3.6, -0.95, M);
    bx(GOLD, -3.77, 3.77, 4.38, 4.45, -3.62, -3.55, M);
    bx(STONE_DK, -3.6, 3.6, 3.7, 3.95, -3.45, -0.95, M);
    for (const x of [-3.4, -1.9, 1.9, 3.4]) {
      bx(STONE_LT, x - 0.32, x + 0.32, 0.2, 0.55, -3.57, -2.93, M);
      cyl(MARBLE, 6, 0.21, x, -3.25, 0.55, 3.45, M, base, 0.18, true);
      cyl(GOLD, 6, 0.19, x, -3.25, 3.45, 3.7, M, base, 0.3);
    }
    for (let k = 0; k <= 6; k++) bx(GOLD, -3.6 + k * 1.2 - 0.04, -3.6 + k * 1.2 + 0.04, 4.5, 5.15, -3.56, -3.48, M);
    bx(GOLD_LT, -3.7, 3.7, 5.15, 5.25, -3.6, -3.44, M);
    b.cards([frame(world(M, [0, 4.42, -3.66]), [0, 1, 0])], T_DRAPE, {
      size: [3.2, 1.6],
      lean: 180,
      flow: [0, 0, 1],
      sink: 0,
      bone: base,
      mirror: true,
    });
    // tall imperial banners at the box's sides
    for (const sx of [-1, 1]) {
      const top = world(M, [sx * 4.05, 9.3, -0.4]);
      banner(sx > 0 ? "bannerImperialR" : "bannerImperialL", top, [0, 0, 1], T_EMP, [1.0, 4.0], 0.07);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 7. Cut ends: masonry section walls and terminal towers with banners
  const top: [number, number][] = [
    [-0.4, 5.1],
    [0.45, 5.1],
    [0.45, 4.2],
    [3.6, 4.2],
  ];
  for (const r of LOW) top.push([r.d0, r.top + 0.3], [r.d1, r.top + 0.3]);
  top.push([10.0, 8.4], [10.0, 10.95], [10.4, 10.95]);
  for (const r of UP) {
    if (r.d0 >= 12.3) break;
    top.push([r.d0, r.top + 0.3], [Math.min(r.d1, 12.3), r.top + 0.3]);
  }
  const topAt = (x: number) => {
    let y = 0;
    for (let k = 0; k + 1 < top.length; k++) {
      const [x0, y0] = top[k];
      const [x1, y1] = top[k + 1];
      if (y0 === y1 && x >= x0 - 1e-6 && x <= x1 + 1e-6) y = Math.max(y, y0);
    }
    return y;
  };
  const endOutline: OutlinePoint[] = [];
  for (const [x, y] of top) {
    const last = endOutline[endOutline.length - 1];
    if (!last || last[0] !== x || last[1] !== y) endOutline.push([x, y]);
  }
  endOutline.push([12.3, endOutline[endOutline.length - 1][1]], [12.3, 0], [-0.4, 0]);
  const masonry = paint((_p, _n, s) => {
    const [x, y] = s;
    if (y > topAt(x) - 0.28) return STONE_LT;
    const row = Math.floor(y / 0.6);
    const mx = (((x + (row % 2) * 0.7) % 1.4) + 1.4) % 1.4;
    if (y - row * 0.6 < 0.07 || mx < 0.07) return STONE_DK;
    return STONE;
  });
  for (const te of [RING0, RING1]) {
    const rad: V = [sin(te), 0, cos(te)];
    const thick: V = [-cos(te), 0, sin(te)]; // rad x up
    // toward the opening: decreasing θ at the first end, increasing at the last
    const tan: V = [(A0 + 8) * cos(te), 0, -(B0 + 8) * sin(te)];
    const sg = te === RING0 ? -1 : 1;
    const dot = thick[0] * tan[0] * sg + thick[2] * tan[2] * sg;
    const o = Math.sign(dot);
    const p0 = P(0, te);
    b.extrude(endOutline, {
      at: [p0[0] + thick[0] * o * 0.3, 0, p0[2] + thick[2] * o * 0.3],
      x: rad,
      y: [0, 1, 0],
      thickness: 1.0,
      color: masonry,
      bone: base,
      name: te === RING0 ? "endWallL" : "endWallR",
    });
    // tower
    const pc = P(14.4, te);
    const c: V = [pc[0] + thick[0] * o * 1.75, 0, pc[2] + thick[2] * o * 1.75];
    const M = at0(c, te); // local +Z radial outward, local +X = -thick
    const ox = -o; // local +X·ox faces the opening
    bx(STONE_DK, -2.15, 2.15, 0, 0.5, -2.55, 2.55, M);
    bx(STONE, -1.9, 1.9, 0.5, 20.6, -2.3, 2.3, M);
    for (const [e0, e1] of [...ENT, [20.4, 21.0]]) {
      bx(STONE_LT, -2.05, 2.05, e0 + (e1 - e0) * 0.6, e1, -2.45, 2.45, M);
      bx(STONE_DK, -1.96, 1.96, e0 + (e1 - e0) * 0.3, e0 + (e1 - e0) * 0.6, -2.36, 2.36, M);
    }
    bx(RED, -1.94, 1.94, 17.6, 17.85, -2.34, 2.34, M);
    // corner pilasters
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        bx(STONE_LT, sx * 1.9 - 0.22, sx * 1.9 + 0.22, 0.5, 20.4, sz * 2.3 - 0.22, sz * 2.3 + 0.22, M);
    // roof
    S(
      new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4),
      TERRA,
      [0, 22.7, 0],
      [2.3 * Math.SQRT2, 3.4, 2.75 * Math.SQRT2],
      [0, 0, 0],
      M,
    );
    S(SPH, GOLD, [0, 24.55, 0], [0.32, 0.32, 0.32], [0, 0, 0], M);
    S(CONE4, GOLD_LT, [0, 25.3, 0], [0.14, 1.2, 0.14], [0, 45, 0], M);
    // outward face: door, niche with statue, windows
    const outFace = (z: number, flip: number) => {
      const F = mat([0, 0, z], [0, flip, 0]).premultiply(M);
      archFrame(STONE_LT, 2.6, 4.2, 1.7, 0.3, 0.2, 0.5, 0, F);
      bx(RECESS, -0.85, 0.85, 0.5, 4.0, -0.05, 0.02, F);
      archFrame(STONE_LT, 2.4, 3.8, 1.6, 0.25, 0.2, 5.8, 0, F);
      bx(RECESS_LT, -0.8, 0.8, 5.8, 9.4, -0.05, 0.02, F);
      statue(mat([0, 5.8, 0.1]).premultiply(F), 1.2, PATINA, GOLD, 1);
      for (const x of [-0.65, 0.65]) {
        archFrame(STONE_LT, 0.9, 2.2, 0.6, 0.15, 0.15, 11.4, 0, mat([x, 0, 0]).premultiply(F));
        bx(RECESS, x - 0.3, x + 0.3, 11.4, 13.4, -0.05, 0.02, F);
      }
      S(CYL[8], PATINA, [0, 16.5, 0.1], [0.7, 0.14, 0.7], [90, 22.5, 0], F);
      S(SPH, GOLD, [0, 16.5, 0.2], [0.22, 0.22, 0.14], [0, 0, 0], F);
    };
    outFace(2.3, 0);
    // the opening-facing side: banner over a blind arcade
    const S2 = mat([1.9 * ox, 0, 0], [0, ox * 90, 0]).premultiply(M);
    archFrame(STONE_LT, 2.8, 4.2, 1.8, 0.3, 0.2, 0.5, 0, S2);
    bx(RECESS, -0.9, 0.9, 0.5, 4.0, -0.05, 0.02, S2);
    // torch sconces flanking the doors on both visible faces
    for (const F of [S2, mat([0, 0, 2.3]).premultiply(M)])
      for (const sx of [-1, 1]) {
        const x = sx * 1.6;
        bx(IRON_DK, x - 0.09, x + 0.09, 2.6, 3.3, 0.15, 0.3, F);
        beam(IRON_DK, [x, 2.7, 0.1], [x, 3.15, 0.6], 0.09, F);
        cyl(GOLD_DK, 6, 0.12, x, 0.62, 3.15, 3.45, F, base, 0.26);
        S(CONE4, FIRE, [x, 3.85, 0.62], [0.25, 0.8, 0.25], [0, 45, 0], F);
        S(CONE4, FIRE_Y, [x, 3.7, 0.62], [0.14, 0.5, 0.14], [0, 0, 0], F);
      }
    S(CYL[8], PATINA, [0, 7.9, 0.08], [0.85, 0.16, 0.85], [90, 22.5, 0], S2);
    S(CYL[8], GOLD, [0, 7.9, 0.15], [0.6, 0.06, 0.6], [90, 22.5, 0], S2);
    S(SPH_S, GOLD_LT, [0, 7.9, 0.2], [0.22, 0.22, 0.14], [0, 0, 0], S2);
    for (const x of [-0.75, 0.75]) {
      archFrame(STONE_LT, 1.1, 3.0, 0.7, 0.15, 0.15, 10.9, 0, mat([x, 0, 0]).premultiply(S2));
      bx(RECESS, x - 0.35, x + 0.35, 10.9, 13.7, -0.05, 0.02, S2);
    }
    const bt = world(S2, [0, 19.9, 0.35]);
    const outDir = world(mat([0, 0, 0], [0, ox * 90 + te, 0]), [0, 0, 1]);
    banner(te === RING0 ? "bannerTowerL" : "bannerTowerR", bt, outDir, T_TOWER, [2.2, 8.0], 0.12);
    // arena-facing side above the stands: windows
    const S3 = mat([0, 0, -2.3], [0, 180, 0]).premultiply(M);
    for (const x of [-0.8, 0.8]) {
      archFrame(STONE_LT, 1.1, 2.6, 0.7, 0.15, 0.15, 15.6, 0, mat([x, 0, 0]).premultiply(S3));
      bx(RECESS, x - 0.35, x + 0.35, 15.6, 18.0, -0.05, 0.02, S3);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 8. Forecourt in the open quarter: flagstones, a porphyry processional way, triumphal gate front
  const flag = paint((p) => {
    // two mosaic medallions: an eight-pointed red star in gold rings
    const mx = p.x - Math.sign(p.x) * 7.6;
    const r = Math.hypot(mx, p.z - 14.0);
    if (r < 2.0) {
      if (r > 1.82) return GOLD_DK;
      if (r > 1.62) return RED_DK;
      if (r > 1.52) return GOLD;
      const u = (((Math.atan2(p.z - 14.0, mx) / (Math.PI / 4)) % 1) + 1) % 1;
      if (r < 0.32) return GOLD;
      return r < 0.55 + 0.9 * Math.abs(2 * u - 1) ? RED : CREAM;
    }
    if (Math.abs(p.x) < 2.0) {
      const g = ((p.z % 1.0) + 1.0) % 1.0 < 0.06 || Math.abs(Math.abs(p.x) - 1.9) < 0.1;
      return g ? GOLD_DK : RED_DK;
    }
    const gx = ((p.x % 1.6) + 1.6) % 1.6 < 0.07;
    const row = Math.floor(p.z / 1.2);
    const gz = ((p.z % 1.2) + 1.2) % 1.2 < 0.07;
    const off = (((p.x + (row % 2) * 0.8) % 1.6) + 1.6) % 1.6 < 0.07;
    return gz || (row % 2 ? off : gx) ? STONE_DK : STONE_LT;
  });
  ring(
    [
      [1.2, 0],
      [16.7, 0],
      [16.7, 0.3],
      [1.2, 0.3],
    ],
    RING1,
    360 + RING0,
    flag,
  );
  ring(
    [
      [16.2, 0.3],
      [16.7, 0.3],
      [16.7, 0.5],
      [16.2, 0.5],
    ],
    RING1,
    360 + RING0,
    STONE_DK,
  );
  {
    // triumphal frontispiece on the outer face of the front gate
    const M = at0([0, 0, B0 + 1.2], 0);
    for (const x of [-2.95, -2.15, 2.15, 2.95]) {
      bx(STONE_LT, x - 0.32, x + 0.32, 0.3, 0.7, 0.0, 0.62, M);
      cyl(MARBLE, 6, 0.24, x, 0.32, 0.7, 3.6, M, base, 0.21);
      cyl(GOLD, 6, 0.22, x, 0.32, 3.6, 3.9, M, base, 0.34);
    }
    bx(STONE_LT, -3.4, 3.4, 3.9, 4.3, -0.1, 0.7, M);
    bx(STONE, -3.3, 3.3, 4.3, 5.7, -0.1, 0.6, M);
    bx(STONE_LT, -3.45, 3.45, 5.7, 5.95, -0.2, 0.75, M);
    texPlane(T_LETTERS, 5.6, 0.7, [0, 5.0, 0.61], [0, 0, 0], M, letterRow(1));
    // gold quadriga stand-in: a great gilded shield with spears
    S(CYL[8], GOLD, [0, 6.75, 0.2], [0.75, 0.16, 0.75], [90, 22.5, 0], M);
    S(CYL[8], RED, [0, 6.75, 0.3], [0.5, 0.06, 0.5], [90, 22.5, 0], M);
    S(SPH, GOLD_LT, [0, 6.75, 0.36], [0.2, 0.2, 0.12], [0, 0, 0], M);
    for (const sx of [-1, 1]) beam(GOLD_DK, [sx * 0.3, 5.95, 0.1], [sx * 1.3, 8.0, 0.1], 0.07, M, base, 4);
    for (const sx of [-1, 1]) {
      statue(at0([sx * 4.6, 0.3, B0 + 2.6], 0), 1.25, PATINA, GOLD, sx > 0 ? 0 : 1);
      brazier(at0([sx * 3.0, 0.3, B0 + 4.2], 0), 1.1, true);
    }
  }
  // a beast cage on wheels waiting for its cue, eyes glowing in the dark
  {
    const M = at0([-9.0, 0.3, 17.6], 28);
    bx(WOOD, -1.4, 1.4, 0.62, 0.84, -0.85, 0.85, M);
    for (const x of [-0.9, 0.9])
      for (const z of [-0.95, 0.95]) {
        S(CYL[8], WOOD_DK, [x, 0.48, z], [0.48, 0.12, 0.48], [90, 0, 0], M);
        S(SPH_S, GOLD, [x, 0.48, z * 1.08], [0.1, 0.1, 0.1], [0, 0, 0], M);
      }
    bx(RECESS, -1.3, 1.3, 0.84, 2.2, -0.75, 0.75, M);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        bx(WOOD_DK, sx * 1.35 - 0.08, sx * 1.35 + 0.08, 0.84, 2.3, sz * 0.8 - 0.08, sz * 0.8 + 0.08, M);
    for (let k = 0; k < 8; k++) {
      const x = -1.15 + (k * 2.3) / 7;
      for (const z of [-0.8, 0.8]) bx(IRON, x - 0.035, x + 0.035, 0.84, 2.3, z - 0.035, z + 0.035, M);
    }
    for (const z of [-0.45, 0, 0.45])
      for (const x of [-1.35, 1.35]) bx(IRON, x - 0.035, x + 0.035, 0.84, 2.3, z - 0.035, z + 0.035, M);
    bx(WOOD_LT, -1.55, 1.55, 2.3, 2.46, -1.0, 1.0, M);
    bx(RED, -1.56, 1.56, 2.18, 2.3, -1.01, 1.01, M);
    beam(WOOD, [1.4, 0.7, 0], [2.7, 0.35, 0], 0.12, M);
    bx(GOLD, -0.18, 0.18, 1.95, 2.15, 0.79, 0.84, M);
    for (const x of [-0.25, 0.05]) {
      const g = new THREE.BoxGeometry(0.09, 0.05, 0.02).translate(x, 1.45, 0.6).applyMatrix4(M);
      add(g, FIRE_Y);
    }
  }
  // supplies by the other tower: crates, amphorae, spare shields
  {
    const M = at0([10.4, 0.3, 19.0], -30);
    for (const [x, z, s, y] of [
      [0, 0, 0.9, 0],
      [1.0, 0.1, 0.8, 0],
      [0.45, 0.05, 0.75, 0.9],
      [-0.9, 0.4, 0.7, 0],
    ]) {
      bx(WOOD_LT, x - s / 2, x + s / 2, y, y + s, z - s / 2, z + s / 2, M);
      for (const yy of [y + s * 0.2, y + s * 0.8])
        bx(WOOD_DK, x - s / 2 - 0.02, x + s / 2 + 0.02, yy - 0.04, yy + 0.04, z - s / 2 - 0.02, z + s / 2 + 0.02, M);
    }
    for (const [x, z] of [
      [-0.3, 1.1],
      [0.25, 1.25],
      [0.8, 1.0],
      [-0.85, 1.35],
    ]) {
      cyl(TERRA_DK, 6, 0.1, x, z, 0, 0.18, M, base, 0.24);
      cyl(TERRA, 6, 0.24, x, z, 0.18, 0.62, M, base, 0.12);
      cyl(TERRA_LT, 6, 0.07, x, z, 0.62, 0.86, M, base, 0.07, true);
      cyl(TERRA_DK, 6, 0.1, x, z, 0.86, 0.92, M);
      for (const s2 of [-1, 1])
        bx(TERRA, x + s2 * 0.12 - 0.025, x + s2 * 0.12 + 0.025, 0.6, 0.84, z - 0.025, z + 0.025, M);
    }
    S(CYL[8], RED, [1.65, 0.48, 0.35], [0.45, 0.06, 0.45], [70, 90, 0], M);
    S(CYL[8], GOLD, [1.7, 0.49, 0.35], [0.13, 0.06, 0.13], [70, 90, 0], M);
  }

  // -------------------------------------------------------------------------------------------------------------
  // flush the batches
  const glowing = new Set<Col>([FIRE, FIRE_Y, EMBER]);
  for (const [bone, m] of batch)
    for (const [color, list] of m) {
      const name = `${bone.name}_${typeof color === "string" ? color.slice(1) : "paint"}`;
      const part = b.part(mergeGeometries(list)!, color, { bone, at: [0, 0, 0], name });
      if (glowing.has(color)) glow(part, 1.6);
    }
  for (const [bone, m] of texBatch)
    for (const [tex, list] of m) b.part(mergeGeometries(list)!, "#ffffff", { bone, at: [0, 0, 0], texture: tex });
  return b.root;
}
