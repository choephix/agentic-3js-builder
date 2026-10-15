import * as THREE from "three";
import { createBuilder, type Builder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Mountain Shrine Arena (backdrop)",
  description:
    "A low-poly fighting-game stage: a worn flagstone fighting floor with a carved crest, a great vermilion gate with opening doors, a five-tier pagoda, bell tower, lanterns, banners, prayer flags, pines and blossom trees, twin waterfalls of cliffs and faceted snow peaks behind.",
};

// ---------------------------------------------------------------- palette
const C = {
  stone0: "#5b5664",
  stone1: "#7c7783",
  stone2: "#a39c97",
  stone3: "#c8bfb0",
  stone4: "#e3dac6",
  red0: "#8e2622",
  red1: "#c83a27",
  red2: "#ec5b33",
  roof0: "#1d3b48",
  roof1: "#2b6670",
  roof2: "#3f8f86",
  roof3: "#79c2a6",
  wood0: "#3a2622",
  wood1: "#5c3b2c",
  wood2: "#8a5b3a",
  gold0: "#a5711d",
  gold1: "#e2a93a",
  gold2: "#ffd86b",
  plaster0: "#dcc9a4",
  plaster1: "#f3e7cb",
  pine0: "#1c4739",
  pine1: "#2b6a49",
  pine2: "#4e9257",
  grass0: "#4f7a3a",
  grass1: "#6f9d47",
  grass2: "#97c05c",
  earth0: "#5e4636",
  earth1: "#7f6148",
  bloom0: "#c8577b",
  bloom1: "#ee8eab",
  bloom2: "#ffc8d8",
  cliff0: "#544c63",
  cliff1: "#776d8a",
  cliff2: "#9a8fab",
  mtn0: "#56659a",
  mtn1: "#7b8fc0",
  mtn2: "#a7bde3",
  hill0: "#4f7f84",
  hill1: "#6fa39c",
  snow0: "#bfcde3",
  snow1: "#f1f5fa",
  water0: "#2e6d9c",
  water1: "#4ea5d4",
  water2: "#9bdcf1",
  foam: "#f2fbff",
  bronze0: "#2e4a43",
  bronze1: "#4e7562",
  bronze2: "#7ba888",
  rope0: "#8f6d43",
  rope1: "#cfa86a",
  lacquer: "#24212b",
  fruit: "#f08a24",
  lamp0: "#ff8a3a",
  lamp1: "#ffc65a",
  lamp2: "#fff0b8",
  smoke: "#e6e1ec",
};
const NAMES: Record<string, string> = Object.fromEntries(Object.entries(C).map(([k, v]) => [v, k]));

// ---------------------------------------------------------------- layout (meters)
const GY = 0.3; // ground top
const FY = 0.6; // fighting floor top
const FZ0 = 4; // floor back edge
const FZ1 = 12; // floor front edge
const FX = 12; // floor half width
const GATE_Z = 2.4;
const TY = 2.4; // terrace top
const TZ = -2.3; // terrace front wall
const TBACK = -11.5;
const PAG_Z = -7;

type P2 = [number, number];
type P3 = [number, number, number];
type G = THREE.BufferGeometry;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- geometry helpers
/** Triangle soup that orients every triangle toward a wanted outward direction. */
class Soup {
  readonly p: number[] = [];
  tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, out?: THREE.Vector3) {
    if (out) {
      const n = b.clone().sub(a).cross(c.clone().sub(a));
      if (n.dot(out) < 0) [b, c] = [c, b];
    }
    this.p.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }
  quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, out?: THREE.Vector3) {
    this.tri(a, b, c, out);
    this.tri(a, c, d, out);
  }
  geo(): G {
    return soupGeo(this.p);
  }
}

function soupGeo(p: number[]): G {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((p.length / 3) * 2), 2));
  g.computeVertexNormals();
  return g;
}

function plain(g: G): G {
  return g.index ? g.toNonIndexed() : g;
}

/** Moves a geometry: rotation in XYZ degrees, then translation. */
function xf(g: G, at: P3, rot: P3 = [0, 0, 0], scale: P3 = [1, 1, 1]): G {
  const m = new THREE.Matrix4().compose(
    V(...at),
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler((rot[0] * Math.PI) / 180, (rot[1] * Math.PI) / 180, (rot[2] * Math.PI) / 180),
    ),
    V(...scale),
  );
  return plain(g).applyMatrix4(m);
}

/** A prism between a bottom outline and a top outline (same corner count), outlines in x/z. */
function prism2(bottom: P2[], top: P2[], y0: number, y1: number): G {
  const s = new Soup();
  let area = 0;
  for (let i = 0; i < bottom.length; i++) {
    const [ax, az] = bottom[i];
    const [bx, bz] = bottom[(i + 1) % bottom.length];
    area += ax * bz - bx * az;
  }
  const sign = area > 0 ? 1 : -1;
  const n = bottom.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = V(bottom[i][0], y0, bottom[i][1]);
    const b2 = V(bottom[j][0], y0, bottom[j][1]);
    const c = V(top[j][0], y1, top[j][1]);
    const d = V(top[i][0], y1, top[i][1]);
    const dx = bottom[j][0] - bottom[i][0];
    const dz = bottom[j][1] - bottom[i][1];
    // outward normal of edge i->j for this winding
    const out = V(-dz * sign, 0, dx * sign).multiplyScalar(-1);
    s.quad(a, b2, c, d, out);
  }
  const faces = THREE.ShapeUtils.triangulateShape(
    bottom.map(([x, z]) => new THREE.Vector2(x, z)),
    [],
  );
  for (const [i, j, k] of faces) {
    s.tri(
      V(bottom[i][0], y0, bottom[i][1]),
      V(bottom[j][0], y0, bottom[j][1]),
      V(bottom[k][0], y0, bottom[k][1]),
      V(0, -1, 0),
    );
    s.tri(V(top[i][0], y1, top[i][1]), V(top[j][0], y1, top[j][1]), V(top[k][0], y1, top[k][1]), V(0, 1, 0));
  }
  return s.geo();
}

/** A prism whose top outline is the bottom one shrunk toward its centre by `inset` meters. */
function prism(outline: P2[], y0: number, y1: number, inset = 0): G {
  if (!inset) return prism2(outline, outline, y0, y1);
  const cx = outline.reduce((a, p) => a + p[0], 0) / outline.length;
  const cz = outline.reduce((a, p) => a + p[1], 0) / outline.length;
  const top = outline.map(([x, z]): P2 => {
    const dx = x - cx;
    const dz = z - cz;
    const l = Math.hypot(dx, dz) || 1;
    const k = Math.max(0.2, (l - inset) / l);
    return [cx + dx * k, cz + dz * k];
  });
  return prism2(outline, top, y0, y1);
}

/** A bevelled block, base centre at `at`. */
function block(w: number, h: number, d: number, at: P3, bevel = 0, rotY = 0): G {
  const hw = w / 2;
  const hd = d / 2;
  const g = prism2(
    [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [-hw, hd],
    ],
    [
      [-hw + bevel, -hd + bevel],
      [hw - bevel, -hd + bevel],
      [hw - bevel, hd - bevel],
      [-hw + bevel, hd - bevel],
    ],
    0,
    h,
  );
  return xf(g, at, [0, rotY, 0]);
}

/** A plain box centred at `at`. */
function box(w: number, h: number, d: number, at: P3, rot: P3 = [0, 0, 0]): G {
  return xf(new THREE.BoxGeometry(w, h, d), at, rot);
}

/** An n-sided frustum standing on `at`. */
function cyl(r0: number, r1: number, h: number, n: number, at: P3, rot: P3 = [0, 0, 0], open = false): G {
  const g = new THREE.CylinderGeometry(r1, r0, h, n, 1, open).translate(0, h / 2, 0);
  return xf(g, at, rot);
}

/** An n-sided tube between two points; `open` leaves the ends off (ropes, rafters). */
function rodG(a: THREE.Vector3 | P3, b: THREE.Vector3 | P3, r: number, n = 5, r1 = r, open = false): G {
  const A = Array.isArray(a) ? V(...a) : a.clone();
  const B = Array.isArray(b) ? V(...b) : b.clone();
  const len = A.distanceTo(B);
  const g = plain(new THREE.CylinderGeometry(r1, r, len, n, 1, open));
  const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), aim(B.clone().sub(A)), V(1, 1, 1));
  return g.applyMatrix4(m);
}

/** A flat board from a to b: `h` thick, `d` wide across the run (kept horizontal). */
function slabG(a: THREE.Vector3 | P3, b: THREE.Vector3 | P3, h: number, d: number): G {
  const A = Array.isArray(a) ? V(...a) : a.clone();
  const B = Array.isArray(b) ? V(...b) : b.clone();
  const x = B.clone().sub(A);
  const len = x.length();
  x.normalize();
  const z = x
    .clone()
    .cross(V(0, 1, 0))
    .normalize();
  const y = z.clone().cross(x).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z).setPosition(A.clone().add(B).multiplyScalar(0.5));
  return plain(new THREE.BoxGeometry(len, h, d)).applyMatrix4(m);
}

/** A sagging rope as a run of thin tubes, returns the points too. */
function sag(a: P3, b: P3, drop: number, n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(V(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - drop * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t));
  }
  return pts;
}

function hash(x: number, y: number, z: number, seed: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453;
  return h - Math.floor(h);
}

/** A faceted rock: an icosahedron with every corner pushed in or out (watertight). */
function rockG(r: number, seed: number, detail = 0, rough = 0.35): G {
  const g = plain(new THREE.IcosahedronGeometry(1, detail));
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = r * (1 + (hash(Math.round(x * 1000), Math.round(y * 1000), Math.round(z * 1000), seed) - 0.5) * rough);
    pos.setXYZ(i, x * k, y * k, z * k);
  }
  g.computeVertexNormals();
  return g;
}

/** A regular polygon outline in x/z. */
function ngon(n: number, r: number, cx = 0, cz = 0, spin = 0): P2[] {
  const out: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = spin + (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }
  return out;
}

/** Rotates a local (x, z) offset by k quarter turns about Y. */
function quarter(k: number, x: number, z: number): P2 {
  const a = (k * Math.PI) / 2;
  return [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
}

// ---------------------------------------------------------------- batching
type Bucket = { tag: string; color: string; bone: Joint; glow: number; p: number[] };

class Pack {
  private readonly buckets = new Map<string, Bucket>();
  constructor(
    private readonly b: Builder,
    readonly root: Joint,
  ) {}

  put(tag: string, color: string, g: G, o: { bone?: Joint; glow?: number } = {}) {
    const bone = o.bone ?? this.root;
    const key = `${tag}|${color}|${bone.name}|${o.glow ?? 0}`;
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tag, color, bone, glow: o.glow ?? 0, p: [] };
      this.buckets.set(key, bucket);
    }
    const arr = plain(g).getAttribute("position").array;
    for (let i = 0; i < arr.length; i++) bucket.p.push(arr[i]);
  }

  /** Splits a geometry by triangle: each triangle takes the colour `pick` gives its centre and normal. */
  split(tag: string, g: G, pick: (c: THREE.Vector3, n: THREE.Vector3) => string, o: { bone?: Joint } = {}) {
    const arr = plain(g).getAttribute("position").array;
    const groups = new Map<string, number[]>();
    for (let i = 0; i < arr.length; i += 9) {
      const a = V(arr[i], arr[i + 1], arr[i + 2]);
      const b2 = V(arr[i + 3], arr[i + 4], arr[i + 5]);
      const c = V(arr[i + 6], arr[i + 7], arr[i + 8]);
      const n = b2.clone().sub(a).cross(c.clone().sub(a)).normalize();
      const col = pick(
        a
          .clone()
          .add(b2)
          .add(c)
          .multiplyScalar(1 / 3),
        n,
      );
      let list = groups.get(col);
      if (!list) groups.set(col, (list = []));
      for (let j = 0; j < 9; j++) list.push(arr[i + j]);
    }
    for (const [col, list] of groups) this.put(tag, col, soupGeo(list), o);
  }

  flush() {
    for (const k of this.buckets.values()) {
      if (!k.p.length) continue;
      const part = this.b.part(soupGeo(k.p), k.color, {
        bone: k.bone,
        at: [0, 0, 0],
        flat: true,
        name: `${k.tag}.${NAMES[k.color] ?? "c"}${k.bone === this.root ? "" : `.${k.bone.name}`}`,
      });
      if (k.glow) glow(part, k.glow);
    }
    this.buckets.clear();
  }
}

// ---------------------------------------------------------------- structure helpers
/** An outline in local x/y pushed `depth` along local z, centred. */
function shapeG(outline: P2[], depth: number): G {
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  return plain(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 })).translate(
    0,
    0,
    -depth / 2,
  );
}

type RoofOpts = {
  at: P3;
  R: number;
  top: number;
  H: number;
  lift: number;
  thick: number;
  wall: number;
  ribs: number;
  rafters?: number;
  bone?: Joint;
  cap?: boolean;
  bells?: boolean;
};

/**
 * A hipped temple roof: corrugated tile faces in two teal values, a light fascia, a dark wooden soffit with
 * vermilion rafters, ridged hips and upturned corners. `at` is the centre at eave height, R the eave half size.
 */
function roof(k: Pack, tag: string, o: RoofOpts) {
  const [cx, cy, cz] = o.at;
  const s = o.R / 4;
  const nu = o.ribs * 2;
  const nv = 3;
  const dip = Math.min(0.08, o.R * 0.02);
  const bone = o.bone;
  const lift = (u: number, v: number) => o.lift * Math.pow(Math.abs(u), 3) * Math.pow(1 - v, 2);
  const topAt = (f: number, u: number, v: number, dipped = false) => {
    const d = o.R + (o.top - o.R) * v;
    const y = o.H * Math.pow(v, 1.7) + lift(u, v) - (dipped && v < 1 ? dip : 0);
    const [x, z] = quarter(f, u * d, d);
    return V(cx + x, cy + y, cz + z);
  };
  const underAt = (f: number, u: number, v: number) => {
    const d = o.R + (o.wall - o.R) * v;
    const y = -o.thick + o.H * 0.25 * v + lift(u, v) * (1 - v * 0.5);
    const [x, z] = quarter(f, u * d, d);
    return V(cx + x, cy + y, cz + z);
  };
  const tiles = [new Soup(), new Soup()];
  const fascia = new Soup();
  const under = new Soup();
  const up = V(0, 1, 0);
  for (let f = 0; f < 4; f++) {
    const [ox, oz] = quarter(f, 0, 1);
    const out = V(ox, 0, oz);
    const tileOut = out.clone().multiplyScalar(0.4).add(up);
    for (let i = 0; i < nu; i++) {
      const u0 = -1 + (2 * i) / nu;
      const u1 = -1 + (2 * (i + 1)) / nu;
      const d0 = i % 2 === 1;
      const d1 = (i + 1) % 2 === 1 && i + 1 < nu;
      for (let j = 0; j < nv; j++) {
        tiles[i % 2].quad(
          topAt(f, u0, j / nv, d0),
          topAt(f, u1, j / nv, d1),
          topAt(f, u1, (j + 1) / nv, d1),
          topAt(f, u0, (j + 1) / nv, d0),
          tileOut,
        );
      }
      fascia.quad(topAt(f, u0, 0, d0), topAt(f, u1, 0, d1), underAt(f, u1, 0), underAt(f, u0, 0), out);
      if (i % 2 === 0) {
        const u2 = -1 + (2 * (i + 2)) / nu;
        under.quad(underAt(f, u0, 0), underAt(f, u2, 0), underAt(f, u2, 1), underAt(f, u0, 1), V(0, -1, 0));
      }
    }
    // hip ridge, corner curl and wind bell at the corner between this face and the next
    const hip: THREE.Vector3[] = [];
    const hn = o.R > 1.5 ? nv : 2;
    for (let j = 0; j <= hn; j++) hip.push(topAt(f, 1, j / hn).add(V(0, 0.05 * s, 0)));
    for (let j = 0; j < hn; j++) k.put(tag, C.roof3, rodG(hip[j], hip[j + 1], 0.08 * s, 3), { bone });
    const e = hip[0];
    const diag = V(e.x - cx, 0, e.z - cz).normalize();
    const tip = e
      .clone()
      .add(diag.clone().multiplyScalar(0.45 * s))
      .add(V(0, 0.42 * s, 0));
    k.put(tag, C.roof3, rodG(e, tip, 0.09 * s, 4, 0.03 * s), { bone });
    k.put(tag, C.gold1, xf(new THREE.OctahedronGeometry(0.07 * s, 0), [tip.x, tip.y, tip.z]), { bone });
    if (o.bells) {
      const hang = underAt(f, 1, 0).add(diag.clone().multiplyScalar(-0.1 * s));
      const bell = hang.clone().add(V(0, -0.45 * s, 0));
      k.put(tag, C.gold0, rodG(hang, bell, 0.012 * s + 0.008, 3), { bone });
      k.put(tag, C.gold1, cyl(0.1 * s, 0.035 * s, 0.2 * s, 6, [bell.x, bell.y - 0.2 * s, bell.z]), { bone });
      k.put(tag, C.gold2, xf(new THREE.OctahedronGeometry(0.05 * s, 0), [bell.x, bell.y - 0.27 * s, bell.z]), { bone });
    }
    for (let r = 0; r < (o.rafters ?? 0); r++) {
      const u = -0.82 + (1.64 * r) / Math.max(1, (o.rafters ?? 1) - 1);
      const a = underAt(f, u, 0.03).add(V(0, -0.05 * s, 0));
      const c = underAt(f, u, 0.85).add(V(0, -0.05 * s, 0));
      k.put(tag, C.red1, rodG(a, c, 0.05 * s, 3, 0.05 * s, true), { bone });
      // a gold end plate on each rafter tip
      const axis = c.clone().sub(a).normalize();
      const p1 = axis.clone().cross(up).normalize();
      const p2 = axis.clone().cross(p1).normalize();
      const cap = new Soup();
      const corner = (q: number) => {
        const th = Math.PI / 2 + (q * Math.PI * 2) / 3;
        return a
          .clone()
          .add(p1.clone().multiplyScalar(Math.cos(th) * 0.075 * s))
          .add(p2.clone().multiplyScalar(Math.sin(th) * 0.075 * s))
          .add(axis.clone().multiplyScalar(-0.01));
      };
      cap.tri(corner(0), corner(1), corner(2), axis.clone().negate());
      k.put(tag, C.gold1, cap.geo(), { bone });
    }
  }
  if (o.cap) {
    const pts = [topAt(0, -1, 1), topAt(0, 1, 1), topAt(2, -1, 1), topAt(2, 1, 1)];
    tiles[0].quad(pts[0], pts[1], pts[2], pts[3], up);
  }
  k.put(tag, C.roof1, tiles[0].geo(), { bone });
  k.put(tag, C.roof2, tiles[1].geo(), { bone });
  k.put(tag, C.roof3, fascia.geo(), { bone });
  k.put(tag, C.wood1, under.geo(), { bone });
}

/** A kasuga stone lantern with a glowing fire box, standing on (x, y0, z). */
function toro(k: Pack, x: number, y0: number, z: number, s = 1) {
  const T = "lantern";
  const y = (h: number) => y0 + h * s;
  k.put(T, C.stone1, prism(ngon(6, 0.44 * s, x, z, Math.PI / 6), y(0), y(0.16), 0.03 * s));
  k.put(T, C.stone2, prism2(ngon(6, 0.36 * s, x, z), ngon(6, 0.2 * s, x, z), y(0.16), y(0.32)));
  k.put(T, C.stone2, cyl(0.13 * s, 0.11 * s, 0.95 * s, 8, [x, y(0.3), z]));
  k.put(T, C.stone3, cyl(0.15 * s, 0.15 * s, 0.07 * s, 8, [x, y(0.72), z]));
  k.put(T, C.stone3, prism2(ngon(6, 0.2 * s, x, z), ngon(6, 0.38 * s, x, z), y(1.23), y(1.4)));
  k.put(T, C.stone1, prism(ngon(6, 0.38 * s, x, z), y(1.4), y(1.45)));
  k.put(T, C.lamp1, prism(ngon(6, 0.21 * s, x, z), y(1.45), y(1.83)), { glow: 1.5 });
  for (const [px, pz] of ngon(6, 0.26 * s, x, z))
    k.put(T, C.stone2, box(0.08 * s, 0.38 * s, 0.08 * s, [px, y(1.64), pz]));
  k.put(T, C.stone1, prism(ngon(6, 0.5 * s, x, z), y(1.83), y(1.9)));
  k.put(T, C.stone3, prism2(ngon(6, 0.53 * s, x, z), ngon(6, 0.12 * s, x, z), y(1.9), y(2.2)));
  for (const [px, pz] of ngon(6, 0.53 * s, x, z)) {
    const dx = (px - x) / (0.53 * s);
    const dz = (pz - z) / (0.53 * s);
    k.put(T, C.stone3, rodG([px, y(1.92), pz], [px + dx * 0.1 * s, y(2.06), pz + dz * 0.1 * s], 0.05 * s, 4, 0.02 * s));
  }
  k.put(T, C.stone2, prism(ngon(6, 0.1 * s, x, z), y(2.2), y(2.28)));
  k.put(T, C.stone3, xf(new THREE.IcosahedronGeometry(0.11 * s, 0), [x, y(2.37), z]));
  k.put(T, C.stone3, cyl(0.07 * s, 0, 0.14 * s, 6, [x, y(2.44), z]));
}

/** A glowing paper lantern hanging with its top at `at`. */
function chochin(k: Pack, at: P3, r: number, bone?: Joint) {
  const [x, y, z] = at;
  k.put("chochin", C.lacquer, cyl(r * 0.55, r * 0.55, r * 0.18, 8, [x, y - r * 0.18, z]), { bone });
  k.put("chochin", C.lamp0, xf(new THREE.SphereGeometry(r, 8, 6), [x, y - r * 1.3, z], [0, 0, 0], [1, 1.2, 1]), {
    bone,
    glow: 1.3,
  });
  k.put("chochin", C.lacquer, cyl(r * 0.55, r * 0.55, r * 0.18, 8, [x, y - r * 2.6, z]), { bone });
  k.put("chochin", C.red0, cyl(r * 0.05, r * 0.05, r * 0.5, 4, [x, y - r * 3.1, z]), { bone });
}

// ---------------------------------------------------------------- trees
const pinePads = (_c: THREE.Vector3, n: THREE.Vector3) => (n.y > 0.55 ? C.pine2 : n.y < -0.35 ? C.pine0 : C.pine1);
const bloomPuffs = (_c: THREE.Vector3, n: THREE.Vector3) => (n.y > 0.45 ? C.bloom2 : n.y < -0.25 ? C.bloom0 : C.bloom1);

/** A double-sided petal or leaf flake. */
function flake(at: THREE.Vector3, size: number, spin: number, tilt: number): G {
  const s = new Soup();
  const a = V(0, 0, size);
  const b2 = V(size * 0.6, 0, -size * 0.4);
  const c = V(-size * 0.6, 0, -size * 0.4);
  s.tri(a, b2, c, V(0, 1, 0));
  s.tri(a, b2, c, V(0, -1, 0));
  return xf(s.geo(), [at.x, at.y, at.z], [tilt, spin, tilt * 0.5]);
}

/**
 * A tree: a twisting faceted trunk swept along a curve, branches as tapered rods and foliage as faceted puffs
 * coloured by facing (light tops, dark undersides). `kind` picks a cloud-pruned pine or a cherry in blossom.
 */
function tree(
  b: Builder,
  k: Pack,
  kind: "pine" | "blossom",
  base: P3,
  h: number,
  lean: P2,
  seed: number,
  name: string,
) {
  const R = rng(seed);
  const pine = kind === "pine";
  const [bx, by, bz] = base;
  const [lx, lz] = lean;
  const at = (t: number, wob: number): THREE.Vector3 =>
    V(
      bx + lx * h * 0.55 * t * t - lz * wob * h,
      by + h * t * (pine ? 0.92 : 0.7),
      bz + lz * h * 0.55 * t * t + lx * wob * h,
    );
  const trunk = catmull([at(0, 0), at(0.25, 0.07), at(0.5, -0.05), at(0.75, 0.06), at(1, 0)]);
  const r0 = h * (pine ? 0.045 : 0.055);
  b.sweep(trunk, [r0, r0 * 0.8, r0 * 0.62, r0 * 0.45, r0 * 0.32], {
    section: { ngon: pine ? 6 : 7 },
    color: pine ? C.wood1 : C.wood0,
    caps: "flat",
    bone: k.root,
    name,
  });
  k.put("trees", pine ? C.wood1 : C.wood0, cyl(r0 * 1.7, r0 * 0.9, h * 0.08, 6, [bx, by - 0.02, bz]));
  const puffs = (c: THREE.Vector3, s: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const off =
        i === 0 ? V(0, 0, 0) : V((R() - 0.5) * s * 1.6, (R() - 0.2) * s * (pine ? 0.3 : 0.8), (R() - 0.5) * s * 1.3);
      const sc = i === 0 ? 1 : rr2(R, 0.55, 0.8);
      const g = xf(
        rockG(s * sc, seed * 17 + i + c.x, 0, 0.3),
        [c.x + off.x, c.y + off.y, c.z + off.z],
        [0, R() * 360, 0],
        pine ? [1.3, 0.42, 1.05] : [1.05, 0.82, 1.0],
      );
      k.split("trees", g, pine ? pinePads : bloomPuffs);
    }
  };
  const nb = pine ? 5 : 6;
  const bark = pine ? C.wood1 : C.wood0;
  const leanA = Math.atan2(lz, lx);
  for (let i = 0; i < nb; i++) {
    const t = (pine ? 0.42 : 0.55) + ((pine ? 0.5 : 0.4) * i) / (nb - 1);
    const start = trunk.at(t);
    const a = leanA + (i % 2 ? 1 : -1) * (0.6 + R() * 1.4) + (i === nb - 1 ? Math.PI : 0) * 0.5;
    const dir = V(Math.cos(a), 0, Math.sin(a));
    const L = h * (pine ? 0.44 - 0.2 * t : 0.4 - 0.12 * t) * rr2(R, 0.85, 1.15);
    const mid = start
      .clone()
      .add(dir.clone().multiplyScalar(L * 0.5))
      .add(V(0, L * (pine ? 0.08 : 0.3), 0));
    const end = start
      .clone()
      .add(dir.clone().multiplyScalar(L))
      .add(V(0, L * (pine ? 0.02 : 0.45), 0));
    const rb = r0 * (pine ? 0.42 : 0.5) * (1.1 - t * 0.5);
    k.put("trees", bark, rodG(start, mid, rb, 5, rb * 0.75));
    k.put("trees", bark, rodG(mid, end, rb * 0.75, 5, rb * 0.45));
    puffs(end.clone().add(V(0, h * 0.03, 0)), h * (pine ? 0.18 * (1.25 - 0.4 * t) : 0.16), pine ? 3 : 4);
  }
  puffs(trunk.at(1).add(V(0, h * 0.04, 0)), h * (pine ? 0.18 : 0.18), pine ? 3 : 5);
  if (!pine) {
    // petals drifting down and settled on the ground
    const top = trunk.at(0.8);
    for (let i = 0; i < 26; i++) {
      const r = Math.sqrt(R()) * h * 0.55;
      const a = R() * Math.PI * 2;
      const y = by + R() * h * 0.6;
      k.put(
        "petals",
        i % 3 ? C.bloom1 : C.bloom2,
        flake(V(top.x + Math.cos(a) * r, y, top.z + Math.sin(a) * r), 0.07, R() * 360, R() * 80),
      );
    }
  }
}

function rr2(R: () => number, a: number, c: number) {
  return a + (c - a) * R();
}

/** A tuft of grass blades. */
function tuft(at: P3, s: number, seed: number): G[] {
  const out: G[] = [];
  for (let i = 0; i < 3; i++) {
    const a = seed * 1.7 + i * 2.1;
    const tip: P3 = [at[0] + Math.cos(a) * 0.1 * s, at[1] + (0.28 + 0.1 * i) * s, at[2] + Math.sin(a) * 0.1 * s];
    out.push(rodG(at, tip, 0.05 * s, 3, 0, true));
  }
  return out;
}

/** A pillar snapped off at a jagged top. */
function brokenG(r: number, h: number, n: number, seed: number): G {
  const g = plain(new THREE.CylinderGeometry(r, r * 1.04, h, n, 2)).translate(0, h / 2, 0);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < h * 0.99) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, y - hash(Math.round(x * 1000), 0, Math.round(z * 1000), seed) * h * 0.35 - (x / r) * h * 0.08);
  }
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- textures
/** One tomoe comma: a round head at angle `deg` and a tail tapering clockwise round the centre. */
function tomoe(deg: number, fill: string) {
  const pts: string[] = [];
  const a0 = (deg * Math.PI) / 180;
  const sweep = (112 * Math.PI) / 180;
  for (let i = 0; i <= 12; i++) {
    const a = a0 + (sweep * i) / 12;
    pts.push(`${(100 + Math.cos(a) * 50).toFixed(1)},${(100 + Math.sin(a) * 50).toFixed(1)}`);
  }
  for (let i = 12; i >= 0; i--) {
    const a = a0 + (sweep * i) / 12;
    const r = 50 - 40 * (1 - i / 12);
    pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
  }
  const hx = 100 + Math.cos(a0) * 30;
  const hy = 100 + Math.sin(a0) * 30;
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/><circle cx="${hx}" cy="${hy}" r="20" fill="${fill}"/>`;
}

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="100" fill="${C.stone1}"/>
  <circle cx="100" cy="100" r="92" fill="${C.gold1}"/>
  <circle cx="100" cy="100" r="84" fill="${C.stone0}"/>
  ${Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `<circle cx="${100 + Math.cos(a) * 76}" cy="${100 + Math.sin(a) * 76}" r="4" fill="${C.gold2}"/>`;
  }).join("")}
  <circle cx="100" cy="100" r="66" fill="${C.red1}"/>
  <circle cx="100" cy="100" r="60" fill="${C.stone0}"/>
  ${[-90, 30, 150].map((deg) => tomoe(deg, C.gold1)).join("")}
  <circle cx="100" cy="100" r="8" fill="${C.red1}"/>
</svg>`,
  { size: 512 },
);

const PLAQUE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100">
  <rect x="0" y="0" width="60" height="100" fill="${C.gold1}"/>
  <rect x="5" y="5" width="50" height="90" fill="${C.lacquer}"/>
  <rect x="9" y="9" width="42" height="82" fill="none" stroke="${C.gold0}" stroke-width="2"/>
  <g fill="${C.gold2}">
    <rect x="18" y="16" width="24" height="4"/><rect x="28" y="14" width="4" height="30"/>
    <rect x="16" y="27" width="28" height="4"/><rect x="18" y="38" width="10" height="4"/>
    <rect x="34" y="34" width="4" height="12"/><rect x="20" y="42" width="4" height="4"/>
    <rect x="16" y="56" width="28" height="4"/><rect x="28" y="52" width="4" height="34"/>
    <rect x="18" y="66" width="8" height="4"/><rect x="34" y="66" width="8" height="4"/>
    <rect x="16" y="76" width="12" height="4"/><rect x="32" y="76" width="12" height="4"/>
  </g>
</svg>`,
  { size: 256 },
);

const PENNANT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52">
  <rect x="0" y="0" width="40" height="52" fill="#ffffff"/>
  <rect x="4" y="4" width="32" height="44" fill="none" stroke="#c4c4c4" stroke-width="3"/>
  <circle cx="20" cy="26" r="8" fill="#b0b0b0"/>
  <circle cx="20" cy="26" r="3.5" fill="#ffffff"/>
</svg>`,
  { size: 64 },
);
const FLAG_COLOURS = [C.water1, C.plaster1, C.red1, C.pine2, C.gold1];
const flagPaint = paint((p) => FLAG_COLOURS[((Math.floor(p.x * 2.1 + p.z * 1.7) % 5) + 5) % 5]);

/** A nobori banner design in meters: vermilion header and border, a gold crest ring and a column of glyphs. */
const BANNER_W = 0.9;
const BANNER_H = 3.4;
const GLYPHS: [number, number, number, number][] = [
  [0.26, 0.0, 0.64, 0.07],
  [0.42, 0.0, 0.49, 0.48],
  [0.22, 0.2, 0.68, 0.27],
  [0.27, 0.33, 0.35, 0.48],
  [0.56, 0.33, 0.64, 0.48],
];
const bannerPaint = paint((_p, _n, s) => {
  const v = s[0] * BANNER_H;
  const u = s[1] * BANNER_W;
  if (v < 0.32 || u < 0.08 || u > BANNER_W - 0.08 || v > BANNER_H - 0.1) return C.red1;
  if (v < 0.37) return C.gold1;
  const d = Math.hypot(u - BANNER_W / 2, v - 0.82);
  if (d < 0.29) return d > 0.23 ? C.gold1 : d < 0.08 ? C.red1 : d < 0.16 ? C.plaster1 : C.lacquer;
  for (let blockI = 0; blockI < 3; blockI++) {
    const v0 = 1.3 + blockI * 0.62;
    for (const [a, b0, c, d1] of GLYPHS.slice(0, blockI === 1 ? 4 : 5))
      if (u > a && u < c && v > v0 + b0 && v < v0 + d1) return C.lacquer;
  }
  return C.plaster1;
});

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "lowPolyArenaBackdrop" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const k = new Pack(b, root);
  const R = rng(20261015);
  const rr = (a: number, c: number) => a + (c - a) * R();
  const pick = <T>(list: readonly T[]) => list[Math.floor(R() * list.length)];

  // ============================================================ GROUND
  {
    // base ground slab with grass top and earth sides
    const outline: P2[] = [];
    const pts: P2[] = [
      [-20, -12.8],
      [20, -12.8],
      [20, 12.6],
      [-20, 12.6],
    ];
    for (let i = 0; i < 4; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % 4];
      const steps = 8;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const jitter = s === 0 ? 0 : rr(-0.25, 0.25);
        const x = a[0] + (c[0] - a[0]) * t;
        const z = a[1] + (c[1] - a[1]) * t;
        outline.push(i % 2 === 0 ? [x, z + (i === 2 ? jitter : 0)] : [x + jitter * (i === 1 ? 1 : 1), z]);
      }
    }
    k.split("ground", prism(outline, 0, GY, 0.12), (_c, n) => (n.y > 0.5 ? C.grass1 : C.earth0));
  }

  // ============================================================ FIGHTING FLOOR
  {
    // grout bed and kerb
    k.put("floor", C.stone0, block(FX * 2, FY - 0.08, FZ1 - FZ0, [0, 0, (FZ0 + FZ1) / 2]));
    const kerb = (x0: number, x1: number, z0: number, z1: number) => {
      const along = x1 - x0 > z1 - z0;
      const len = along ? x1 - x0 : z1 - z0;
      const n = Math.max(1, Math.round(len / 1.3));
      for (let i = 0; i < n; i++) {
        const t0 = i / n;
        const t1 = (i + 1) / n;
        const gap = 0.025;
        const w = along ? (x1 - x0) * (t1 - t0) - gap : x1 - x0;
        const d = along ? z1 - z0 : (z1 - z0) * (t1 - t0) - gap;
        const cx = along ? x0 + (x1 - x0) * (t0 + t1) * 0.5 : (x0 + x1) / 2;
        const cz = along ? (z0 + z1) / 2 : z0 + (z1 - z0) * (t0 + t1) * 0.5;
        const h = FY + 0.06 + rr(-0.015, 0.015);
        k.put("floorKerb", i % 2 ? C.stone2 : C.stone3, block(w, h, d, [cx, 0, cz], 0.05));
        // carved inset panel on the front face of the front kerb
        if (along && z1 >= FZ1) {
          k.put("floorKerb", C.stone1, box(w * 0.62, 0.22, 0.04, [cx, 0.3, z1 + 0.005]));
          k.put("floorKerb", C.stone4, box(w * 0.62, 0.04, 0.06, [cx, 0.43, z1 + 0.01]));
        }
      }
    };
    kerb(-FX - 0.35, FX + 0.35, FZ1 - 0.05, FZ1 + 0.4);
    kerb(-FX - 0.35, FX + 0.35, FZ0 - 0.4, FZ0 + 0.05);
    kerb(-FX - 0.35, -FX + 0.05, FZ0 + 0.05, FZ1 - 0.05);
    kerb(FX - 0.05, FX + 0.35, FZ0 + 0.05, FZ1 - 0.05);

    // emblem square: x ±2.4, rows fit in z
    const EZ = 8;
    const SQ = 2.4;
    const rows = 10;
    const rowD = (FZ1 - 0.05 - (FZ0 + 0.05)) / rows;
    const stoneCols = [C.stone2, C.stone3, C.stone2, C.stone4, C.stone3];
    for (let r = 0; r < rows; r++) {
      const z0 = FZ0 + 0.05 + r * rowD;
      const z1 = z0 + rowD;
      const inSquare = z0 >= EZ - SQ - 0.01 && z1 <= EZ + SQ + 0.01;
      const cuts: number[] = [-FX + 0.05];
      let x = -FX + 0.05 + (r % 2 ? 0.55 : 0);
      while (x < FX - 0.05) {
        x += rr(0.9, 1.6);
        if (x < FX - 0.4) cuts.push(x);
      }
      cuts.push(FX - 0.05);
      const xs = inSquare
        ? [...cuts.filter((c) => c < -SQ - 0.35 || c > SQ + 0.35), -SQ, SQ].sort((a, c) => a - c)
        : cuts;
      for (let i = 0; i < xs.length - 1; i++) {
        const a = xs[i];
        const c = xs[i + 1];
        if (inSquare && a >= -SQ - 0.01 && c <= SQ + 0.01) continue;
        const g = 0.035;
        const h = FY - 0.08 + 0.08 + rr(-0.012, 0.01);
        const quad: P2[] = [
          [a + g, z0 + g],
          [c - g, z0 + g],
          [c - g, z1 - g],
          [a + g, z1 - g],
        ];
        const col = pick(stoneCols);
        if (R() < 0.12 && c - a > 1.0) {
          // a cracked slab: two halves, one sunk a little
          const m = a + (c - a) * rr(0.35, 0.65);
          const m2 = m + rr(-0.25, 0.25);
          k.put("floor", col, prism([quad[0], [m - 0.02, z0 + g], [m2 - 0.02, z1 - g], quad[3]], FY - 0.12, h, 0.05));
          k.put(
            "floor",
            col,
            prism([[m + 0.02, z0 + g], quad[1], quad[2], [m2 + 0.02, z1 - g]], FY - 0.12, h - 0.03, 0.05),
          );
        } else {
          k.put("floor", col, prism(quad, FY - 0.12, h, 0.05));
        }
      }
    }
    // the emblem square: trim frame, spandrels, ring tiles, gold ring and carved crest
    for (const s of [-1, 1]) {
      k.put("emblem", C.stone4, block(SQ * 2 + 0.2, FY + 0.01, 0.18, [0, 0, EZ + s * (SQ + 0.04)], 0.04));
      k.put("emblem", C.stone4, block(0.18, FY + 0.01, SQ * 2 - 0.1, [s * (SQ + 0.04), 0, EZ], 0.04));
    }
    const RO = 2.22;
    const RI = 1.48;
    for (let q = 0; q < 4; q++) {
      const sx = q === 0 || q === 3 ? 1 : -1;
      const sz = q < 2 ? 1 : -1;
      const pts: P2[] = [[sx * (SQ - 0.07), EZ + sz * (SQ - 0.07)]];
      pts.push([0 + sx * 0, EZ + sz * (SQ - 0.07)]);
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * (Math.PI / 2);
        pts.push([sx * Math.sin(a) * (RO + 0.06), EZ + sz * Math.cos(a) * (RO + 0.06)]);
      }
      pts.push([sx * (SQ - 0.07), EZ]);
      k.put(
        "emblem",
        C.stone1,
        prism(
          pts.filter((_p, i) => i !== 2),
          FY - 0.12,
          FY - 0.005,
          0.04,
        ),
      );
    }
    const segs = 16;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2 + 0.012;
      const a1 = ((i + 1) / segs) * Math.PI * 2 - 0.012;
      const quad: P2[] = [
        [Math.cos(a0) * (RI + 0.05), EZ + Math.sin(a0) * (RI + 0.05)],
        [Math.cos(a0) * RO, EZ + Math.sin(a0) * RO],
        [Math.cos(a1) * RO, EZ + Math.sin(a1) * RO],
        [Math.cos(a1) * (RI + 0.05), EZ + Math.sin(a1) * (RI + 0.05)],
      ];
      k.put("emblem", i % 2 ? C.stone3 : C.stone2, prism(quad, FY - 0.12, FY + 0.004, 0.035));
    }
    k.put("emblem", C.gold1, prism(ngon(32, RI + 0.06, 0, EZ), FY - 0.12, FY - 0.035));
    k.put("emblem", C.stone0, prism(ngon(32, RI - 0.02, 0, EZ), FY - 0.12, FY - 0.025));
    b.part(new THREE.CircleGeometry(RI - 0.04, 32), "#ffffff", {
      at: [0, FY - 0.018, EZ],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: EMBLEM,
      bone: root,
      name: "floorCrest",
    });
  }

  // ============================================================ COURTYARD
  // raked gravel: a flat bed with light raked lines laid on it as flat strips
  const gravel = (x0: number, x1: number, z0: number, z1: number, y0: number, y1: number) => {
    k.put(
      "gravel",
      C.plaster0,
      prism(
        [
          [x0, z0],
          [x1, z0],
          [x1, z1],
          [x0, z1],
        ],
        y0,
        y1,
        0.05,
      ),
    );
    const lines = new Soup();
    for (let z = z0 + 0.2; z < z1 - 0.15; z += 0.32)
      lines.quad(
        V(x0 + 0.06, y1 + 0.004, z),
        V(x1 - 0.06, y1 + 0.004, z),
        V(x1 - 0.06, y1 + 0.004, z + 0.12),
        V(x0 + 0.06, y1 + 0.004, z + 0.12),
        V(0, 1, 0),
      );
    k.put("gravel", C.stone4, lines.geo());
  };
  gravel(-12.4, 12.4, TZ, FZ0 - 0.4, GY - 0.05, GY + 0.04);
  // flagstone approach path through the gate
  for (let z = FZ0 - 0.4, i = 0; z > TZ + 1.95; i++) {
    const d = rr(0.55, 0.8);
    const z1 = Math.max(TZ + 1.9, z - d);
    const split = i % 2 ? rr(-0.5, 0.5) : null;
    const spans: P2[] =
      split === null
        ? [[-1.4, 1.4]]
        : [
            [-1.4, split - 0.03],
            [split + 0.03, 1.4],
          ];
    for (const [a, c] of spans)
      k.put(
        "path",
        pick([C.stone2, C.stone3, C.stone3]),
        prism(
          [
            [a, z1 + 0.03],
            [c, z1 + 0.03],
            [c, z - 0.03],
            [a, z - 0.03],
          ],
          GY,
          GY + 0.1,
          0.04,
        ),
      );
    z = z1;
  }
  // stepping stones across the side meadows
  for (const [x, z] of [
    [12.9, 9.3],
    [13.8, 9.9],
    [14.8, 10.3],
    [15.8, 10.9],
    [16.7, 11.5],
    [-17.9, 6.5],
    [-17.5, 5.5],
    [-17.9, 4.5],
    [-17.4, 3.5],
    [-17.8, 2.6],
  ] as const) {
    const r = rr(0.28, 0.38);
    k.put(
      "steppingStones",
      pick([C.stone2, C.stone3]),
      prism(
        ngon(6, r, x, z, R()).map(([a, c]): P2 => [a + rr(-0.05, 0.05), c + rr(-0.05, 0.05)]),
        GY - 0.03,
        GY + 0.06,
        0.04,
      ),
    );
  }

  // ============================================================ GREAT GATE
  const PX = 3.3;
  const doorL = b.joint("gateDoorL", {
    parent: root,
    at: [PX - 0.42, GY + 0.12, GATE_Z],
    dir: [-1, 0, 0],
    up: [0, 0, 1],
    role: "hinge",
  });
  const doorR = b.joint("gateDoorR", {
    parent: root,
    at: [-PX + 0.42, GY + 0.12, GATE_Z],
    dir: [1, 0, 0],
    up: [0, 0, -1],
    role: "hinge",
  });
  {
    const T = "gate";
    for (const s of [-1, 1]) {
      const x = s * PX;
      k.put(T, C.stone2, block(1.4, 0.35, 1.4, [x, GY - 0.05, GATE_Z], 0.08));
      k.put(T, C.lacquer, cyl(0.52, 0.5, 0.95, 10, [x, GY + 0.3, GATE_Z]));
      k.put(T, C.gold1, cyl(0.54, 0.54, 0.09, 10, [x, GY + 1.2, GATE_Z]));
      k.put(T, C.gold1, cyl(0.54, 0.54, 0.05, 10, [x, GY + 0.36, GATE_Z]));
      k.put(T, C.red1, cyl(0.42, 0.38, 7.0 - GY - 0.3, 10, [x, GY + 0.3, GATE_Z]));
      k.put(T, C.red2, cyl(0.46, 0.46, 0.14, 10, [x, 6.62, GATE_Z]));
      // support legs with tie beams and little roofs
      for (const t of [-1, 1]) {
        const z = GATE_Z + t * 1.3;
        k.put(T, C.stone2, block(0.75, 0.3, 0.75, [x, GY - 0.05, z], 0.06));
        k.put(T, C.lacquer, cyl(0.29, 0.28, 0.55, 8, [x, GY + 0.25, z]));
        k.put(T, C.red1, cyl(0.23, 0.21, 3.15, 8, [x, GY + 0.25, z]));
        for (const yy of [1.5, 3.05]) k.put(T, C.red2, box(0.2, 0.26, 1.5, [x, GY + yy, GATE_Z + t * 0.62]));
        roof(k, T, {
          at: [x, GY + 3.5, z],
          R: 0.5,
          top: 0.12,
          H: 0.38,
          lift: 0.08,
          thick: 0.08,
          wall: 0.24,
          ribs: 3,
          cap: true,
        });
      }
      // nuki wedges
      k.put(T, C.red0, box(0.16, 0.6, 0.5, [s * (PX + 0.6), 5.75, GATE_Z]));
    }
    k.put(T, C.stone3, block(2 * PX - 0.84, 0.13, 0.5, [0, GY - 0.01, GATE_Z], 0.03));
    k.put(T, C.red1, box(9.6, 0.5, 0.4, [0, 5.75, GATE_Z]));
    k.put(T, C.red2, box(9.6, 0.06, 0.42, [0, 6.02, GATE_Z]));
    k.put(T, C.red1, box(0.45, 0.85, 0.36, [0, 6.42, GATE_Z]));
    k.put(T, C.red1, box(11.6, 0.42, 0.56, [0, 7.06, GATE_Z]));
    k.put(T, C.red2, box(11.6, 0.06, 0.58, [0, 7.3, GATE_Z]));
    // kasagi: the black lacquer top beam sweeping up at the ends, gold-shod tips
    const L = 6.8;
    const outline: P2[] = [];
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const x = -L + (2 * L * i) / n;
      outline.push([x, 7.33 + 0.3 * Math.pow(Math.abs(x) / L, 2.4)]);
    }
    outline.push([L + 0.15, 8.35]);
    for (let i = n; i >= 0; i--) {
      const x = -L + (2 * L * i) / n;
      outline.push([x, 7.92 + 0.42 * Math.pow(Math.abs(x) / L, 2.6)]);
    }
    outline.push([-L - 0.15, 8.35]);
    k.put(T, C.lacquer, xf(shapeG(outline, 0.78), [0, 0, GATE_Z]));
    for (const s of [-1, 1]) {
      k.put(
        T,
        C.gold1,
        xf(
          shapeG(
            [
              [0, 7.62],
              [0.5, 7.72],
              [0.66, 8.36],
              [0, 8.3],
            ],
            0.82,
          ),
          [s * (L - 0.5), 0, GATE_Z],
          [0, s > 0 ? 0 : 180, 0],
        ),
      );
    }
    // plaque
    k.put(T, C.gold1, box(1.0, 1.42, 0.12, [0, 6.3, GATE_Z + 0.26]));
    k.put(T, C.gold2, box(0.24, 0.12, 0.14, [0, 7.04, GATE_Z + 0.26]));
    b.part(new THREE.PlaneGeometry(0.88, 1.3), "#ffffff", {
      at: [0, 6.3, GATE_Z + 0.325],
      dir: [0, 0, 1],
      axis: "z",
      texture: PLAQUE,
      bone: root,
      name: "gatePlaque",
    });
    // the two door leaves, built closed in model space on their hinge joints
    for (const s of [1, -1]) {
      const bone = s > 0 ? doorL : doorR;
      const D = "gateDoor";
      const x0 = s * (PX - 0.42);
      const x1 = s * 0.02;
      const w = Math.abs(x1 - x0);
      const cx = (x0 + x1) / 2;
      const y0 = GY + 0.12;
      const y1 = 5.48;
      const h = y1 - y0;
      const z = GATE_Z;
      k.put(D, C.red1, box(w, h, 0.12, [cx, y0 + h / 2, z]), { bone });
      for (const zz of [z + 0.07, z - 0.07]) {
        k.put(D, C.red2, box(0.2, h, 0.04, [x0 - s * 0.1, y0 + h / 2, zz]), { bone });
        k.put(D, C.red2, box(0.16, h, 0.04, [x1 + s * 0.08, y0 + h / 2, zz]), { bone });
        for (const yy of [y0 + 0.16, y0 + h * 0.36, y0 + h * 0.66, y1 - 0.1])
          k.put(D, C.red2, box(w, yy === y0 + 0.16 ? 0.32 : 0.16, 0.04, [cx, yy, zz]), { bone });
      }
      // lattice window in the top panel
      const ly0 = y0 + h * 0.68;
      const ly1 = y1 - 0.2;
      k.put(D, C.wood0, box(w - 0.4, ly1 - ly0, 0.15, [cx, (ly0 + ly1) / 2, z]), { bone });
      for (let i = 1; i < 6; i++) {
        const xx = x0 - s * (0.2 + ((w - 0.4) * i) / 6);
        k.put(D, C.red2, box(0.05, ly1 - ly0, 0.17, [xx, (ly0 + ly1) / 2, z]), { bone });
      }
      for (let i = 1; i < 3; i++)
        k.put(D, C.red2, box(w - 0.4, 0.05, 0.17, [cx, ly0 + ((ly1 - ly0) * i) / 3, z]), { bone });
      // gold studs in rows across the two lower panels
      for (const yy of [y0 + h * 0.26, y0 + h * 0.46, y0 + h * 0.56]) {
        for (let i = 0; i < 5; i++) {
          const xx = x0 - s * (0.35 + ((w - 0.6) * i) / 4);
          k.put(D, C.gold1, cyl(0.075, 0.035, 0.06, 6, [xx, yy, z + 0.09], [90, 0, 0]), { bone });
        }
      }
      // hinge straps and the ring pull
      for (const yy of [y0 + 0.55, y1 - 0.55])
        k.put(D, C.gold0, box(1.1, 0.14, 0.03, [x0 - s * 0.6, yy, z + 0.1]), { bone });
      k.put(D, C.gold1, cyl(0.16, 0.16, 0.04, 6, [x1 + s * 0.4, 2.6, z + 0.09], [90, 0, 0]), { bone });
      k.put(D, C.gold2, xf(new THREE.TorusGeometry(0.13, 0.025, 4, 8), [x1 + s * 0.4, 2.45, z + 0.14]), { bone });
    }
  }

  // ============================================================ VERMILION FENCE + LANTERN ROW
  {
    const T = "fence";
    for (const s of [-1, 1]) {
      const xa = s * 4.0;
      const xb = s * 12.3;
      const z = GATE_Z;
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const x = xa + ((xb - xa) * i) / n;
        k.put(T, C.red1, box(0.18, 1.45, 0.18, [x, GY + 0.72, z]));
        k.put(T, C.lacquer, prism(ngon(4, 0.15, x, z, Math.PI / 4), GY + 1.45, GY + 1.6, 0.08));
      }
      const cx = (xa + xb) / 2;
      const L = Math.abs(xb - xa);
      k.put(T, C.red2, box(L, 0.12, 0.16, [cx, GY + 1.3, z]));
      k.put(T, C.lacquer, box(L, 0.05, 0.2, [cx, GY + 1.38, z]));
      k.put(T, C.red0, box(L, 0.12, 0.14, [cx, GY + 0.3, z]));
      k.put(T, C.red2, box(L, 0.08, 0.14, [cx, GY + 1.0, z]));
      for (let x = Math.min(xa, xb) + 0.16; x < Math.max(xa, xb) - 0.1; x += 0.24)
        k.put(T, C.red0, box(0.07, 0.95, 0.06, [x, GY + 0.82, z]));
    }
    for (const x of [-11.0, -8.6, -6.2, 6.2, 8.6, 11.0]) toro(k, x, GY, 3.05, 0.95);
  }

  // ============================================================ TERRACE, STAIRS, BALUSTRADE
  {
    const T = "terrace";
    const SW = 2.3; // stair half width
    k.put(T, C.stone0, block(28, TY - 0.1, TZ - TBACK, [0, 0, (TZ + TBACK) / 2]));
    gravel(-14, 14, TBACK, TZ, TY - 0.12, TY + 0.03);
    // ashlar retaining wall
    const rowsY = [0, 0.62, 1.2, 1.78, TY - 0.12];
    for (let r = 0; r < rowsY.length - 1; r++) {
      for (const s of [-1, 1]) {
        let x = SW + 0.4;
        while (x < 14) {
          const w = Math.min(14 - x, rr(0.9, 1.7) * (r === 0 ? 1.2 : 1));
          if (w < 0.3) break;
          const d = rr(0.3, 0.42);
          const x0 = s * (x + 0.03);
          const x1 = s * (x + w - 0.03);
          const out: P2[] = [
            [Math.min(x0, x1), TZ - 0.05],
            [Math.max(x0, x1), TZ - 0.05],
            [Math.max(x0, x1), TZ + d],
            [Math.min(x0, x1), TZ + d],
          ];
          k.put(
            T,
            pick([C.stone1, C.stone2, C.stone2, C.stone1, C.stone3]),
            prism(out, rowsY[r] + 0.03, rowsY[r + 1] - 0.03, 0.07),
          );
          x += w;
        }
      }
    }
    // coping along the top
    for (const s of [-1, 1]) {
      for (let x = SW + 0.4; x < 14; x += 1.4) {
        const x1 = Math.min(14, x + 1.37);
        k.put(T, C.stone3, block(x1 - x, 0.2, 0.62, [(s * (x + x1)) / 2, TY - 0.12, TZ + 0.18], 0.04));
      }
    }
    // stairs from the courtyard up to the terrace
    const steps = 8;
    const rise = (TY - GY) / steps;
    const zFoot = TZ + 1.9;
    const tread = (zFoot - TZ) / steps;
    for (let i = 0; i < steps; i++) {
      const zf = zFoot - i * tread;
      const yt = GY + (i + 1) * rise;
      k.put(T, i % 2 ? C.stone2 : C.stone3, block(2 * SW, yt, zf - TZ + 0.3, [0, 0, (zf + TZ - 0.3) / 2], 0.02));
      k.put(T, C.stone4, box(2 * SW, 0.05, 0.07, [0, yt - 0.02, zf - 0.02]));
    }
    for (const s of [-1, 1]) {
      // stringer walls
      const side: P2[] = [
        [-(zFoot + 0.25), 0],
        [-(zFoot + 0.25), GY + 0.55],
        [-TZ, TY + 0.3],
        [-TZ + 0.3, TY + 0.3],
        [-TZ + 0.3, 0],
      ];
      k.put(T, C.stone1, xf(shapeG(side, 0.45), [s * (SW + 0.2), 0, 0], [0, 90, 0]));
      k.put(T, C.stone3, rodG([s * (SW + 0.2), GY + 0.6, zFoot + 0.25], [s * (SW + 0.2), TY + 0.35, TZ], 0.3, 4));
      // handrail posts and rail
      const a: P3 = [s * (SW + 0.2), GY + 0.6, zFoot + 0.1];
      const c: P3 = [s * (SW + 0.2), TY + 0.35, TZ - 0.1];
      k.put(T, C.red1, box(0.16, 1.1, 0.16, [a[0], a[1] + 0.55, a[2]]));
      k.put(T, C.gold1, xf(new THREE.IcosahedronGeometry(0.14, 0), [a[0], a[1] + 1.2, a[2]]));
      k.put(T, C.gold1, cyl(0.08, 0, 0.18, 6, [a[0], a[1] + 1.28, a[2]]));
      k.put(T, C.red2, rodG([a[0], a[1] + 1.0, a[2]], [c[0], c[1] + 0.95, c[2]], 0.07, 4));
      k.put(T, C.red1, rodG([a[0], a[1] + 0.5, a[2]], [c[0], c[1] + 0.5, c[2]], 0.05, 4));
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        const p = [a[0], a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
        k.put(T, C.red1, box(0.1, 1.0, 0.1, [p[0], p[1] + 0.5, p[2]]));
      }
    }
    // balustrade along the terrace edge
    for (const s of [-1, 1]) {
      const xa = s * (SW + 0.2);
      const xb = s * 13.8;
      const z = TZ + 0.2;
      const n = 8;
      for (let i = 0; i <= n; i++) {
        const x = xa + ((xb - xa) * i) / n;
        k.put(T, C.red1, box(0.16, 1.05, 0.16, [x, TY + 0.4, z]));
        if (i === 0 || i === n) {
          k.put(T, C.gold1, xf(new THREE.IcosahedronGeometry(0.13, 0), [x, TY + 1.05, z]));
          k.put(T, C.gold1, cyl(0.07, 0, 0.16, 6, [x, TY + 1.12, z]));
        } else k.put(T, C.lacquer, prism(ngon(4, 0.13, x, z, Math.PI / 4), TY + 0.92, TY + 1.0, 0.06));
      }
      const cx = (xa + xb) / 2;
      const L = Math.abs(xb - xa);
      k.put(T, C.red2, box(L, 0.1, 0.14, [cx, TY + 0.85, z]));
      k.put(T, C.red1, box(L, 0.07, 0.1, [cx, TY + 0.5, z]));
      k.put(T, C.red0, box(L, 0.1, 0.12, [cx, TY + 0.15, z]));
      for (let x = Math.min(xa, xb) + 0.35; x < Math.max(xa, xb) - 0.2; x += 0.7)
        k.put(T, C.red0, box(0.06, 0.32, 0.06, [x, TY + 0.66, z]));
    }
  }

  // ============================================================ FIVE-TIER PAGODA
  {
    const T = "pagoda";
    const pz = PAG_Z;
    k.put(T, C.stone2, block(7.6, 0.3, 7.6, [0, TY - 0.02, pz], 0.06));
    k.put(T, C.stone3, block(6.8, 0.24, 6.8, [0, TY + 0.26, pz], 0.05));
    for (let i = 0; i < 3; i++)
      k.put(
        T,
        i % 2 ? C.stone2 : C.stone3,
        block(2.2, 0.17 * (i + 1), 0.32, [0, TY - 0.02, pz + 3.8 - i * 0.3 + 0.02], 0.02),
      );
    const walls = [2.5, 2.2, 1.95, 1.7, 1.45];
    const bodyH = [1.75, 1.0, 0.95, 0.9, 0.85];
    const rise = [0.85, 0.75, 0.7, 0.65, 0.95];
    let y = TY + 0.5;
    let topEave: P3 = [0, 0, 0];
    let topR = 0;
    for (let t = 0; t < 5; t++) {
      const w = walls[t];
      const h = bodyH[t];
      const fbox = (
        f: number,
        bw: number,
        bh: number,
        bd: number,
        lx: number,
        cyy: number,
        lz: number,
        col: string,
      ) => {
        const [qx, qz] = quarter(f, lx, lz);
        k.put(T, col, box(bw, bh, bd, [qx, cyy, pz + qz], [0, f * 90, 0]));
      };
      if (t > 0) {
        // balcony deck and railing
        const dw = w + 0.42;
        k.put(T, C.wood1, block(2 * dw, 0.12, 2 * dw, [0, y - 0.06, pz], 0.03));
        for (let f = 0; f < 4; f++) {
          for (let i = 0; i < 5; i++)
            fbox(f, 0.07, 0.42, 0.07, -dw + 0.04 + (i * (2 * dw - 0.08)) / 5, y + 0.27, dw - 0.04, C.red1);
          fbox(f, 2 * dw, 0.07, 0.09, 0, y + 0.47, dw - 0.04, C.red2);
          fbox(f, 2 * dw, 0.05, 0.06, 0, y + 0.22, dw - 0.04, C.red0);
          const [qx, qz] = quarter(f, -dw + 0.04, dw - 0.04);
          k.put(T, C.gold1, xf(new THREE.OctahedronGeometry(0.07, 0), [qx, y + 0.56, pz + qz]));
        }
      }
      k.put(T, C.red0, block(2 * w + 0.16, 0.16, 2 * w + 0.16, [0, y, pz]));
      const yb = y + 0.16;
      k.put(T, C.plaster1, block(2 * w - 0.08, h, 2 * w - 0.08, [0, yb, pz]));
      for (let f = 0; f < 4; f++) {
        fbox(f, 0.28, h, 0.28, -w + 0.1, yb + h / 2, w - 0.1, C.red1);
        for (const lx of [-w * 0.36, w * 0.36]) fbox(f, 0.2, h, 0.12, lx, yb + h / 2, w - 0.02, C.red1);
        // side bays: low vermilion wainscot
        for (const lx of [-w * 0.68, w * 0.68]) {
          fbox(f, w * 0.52, h * 0.32, 0.06, lx, yb + h * 0.16, w - 0.03, C.red0);
          if (t === 0) fbox(f, w * 0.34, h * 0.3, 0.06, lx, yb + h * 0.6, w - 0.03, C.wood0);
        }
        if (t === 0) {
          // a door on every face
          fbox(f, w * 0.62, h * 0.86, 0.08, 0, yb + h * 0.43, w - 0.02, C.red1);
          fbox(f, 0.04, h * 0.86, 0.1, 0, yb + h * 0.43, w - 0.01, C.red0);
          for (const yy of [0.3, 0.5, 0.7])
            for (const lx of [-0.45, -0.22, 0.22, 0.45]) {
              const [qx, qz] = quarter(f, lx, w + 0.04);
              k.put(T, C.gold1, xf(new THREE.OctahedronGeometry(0.045, 0), [qx, yb + h * yy, pz + qz]));
            }
        } else {
          // lattice windows
          fbox(f, w * 0.6, h * 0.62, 0.06, 0, yb + h * 0.5, w - 0.02, C.wood0);
          for (let i = -2; i <= 2; i++) fbox(f, 0.04, h * 0.62, 0.08, i * w * 0.11, yb + h * 0.5, w - 0.01, C.red2);
          fbox(f, w * 0.6, 0.04, 0.08, 0, yb + h * 0.5, w - 0.01, C.red2);
        }
        // head beams and gold band
        fbox(f, 2 * w + 0.3, 0.2, 0.1, 0, yb + h - 0.22, w + 0.04, C.red1);
        fbox(f, 2 * w + 0.34, 0.07, 0.1, 0, yb + h - 0.05, w + 0.06, C.gold1);
        // bracket clusters carrying the eaves
        for (const lx of [-w, -w * 0.5, 0, w * 0.5]) {
          fbox(f, 0.22, 0.13, 0.22, lx, yb + h + 0.05, w + 0.02, C.red2);
          fbox(f, 0.15, 0.1, 0.55, lx, yb + h + 0.16, w + 0.28, C.roof2);
          fbox(f, 0.19, 0.08, 0.19, lx, yb + h + 0.24, w + 0.5, C.gold1);
        }
      }
      const eave = yb + h + 0.5;
      const last = t === 4;
      const R = w + 1.55;
      roof(k, T, {
        at: [0, eave, pz],
        R,
        top: last ? 0.4 : walls[t + 1] + 0.05,
        H: rise[t],
        lift: 0.5,
        thick: 0.3,
        wall: w,
        ribs: last ? 8 : 10,
        rafters: 7,
        bells: true,
        cap: last,
      });
      y = eave + rise[t] - 0.02;
      topEave = [0, eave, pz];
      topR = R;
    }
    // sorin spire
    k.put(T, C.lacquer, block(0.95, 0.28, 0.95, [0, y - 0.02, pz], 0.05));
    k.put(T, C.gold0, cyl(0.46, 0.26, 0.3, 8, [0, y + 0.26, pz]));
    k.put(T, C.gold1, cyl(0.22, 0.38, 0.2, 8, [0, y + 0.56, pz]));
    k.put(T, C.gold0, cyl(0.08, 0.07, 2.1, 6, [0, y + 0.7, pz]));
    for (let i = 0; i < 9; i++)
      k.put(T, C.gold1, cyl(0.34 - i * 0.012, 0.34 - i * 0.012, 0.07, 8, [0, y + 0.82 + i * 0.14, pz]));
    const ys = y + 2.1;
    const flame: P2[] = [
      [-0.06, 0],
      [-0.3, 0.2],
      [-0.42, 0.5],
      [-0.28, 0.42],
      [-0.32, 0.7],
      [-0.12, 0.62],
      [0, 0.95],
      [0.12, 0.62],
      [0.32, 0.7],
      [0.28, 0.42],
      [0.42, 0.5],
      [0.3, 0.2],
      [0.06, 0],
    ];
    for (const r of [0, 90]) k.put(T, C.gold2, xf(shapeG(flame, 0.05), [0, ys, pz], [0, r, 0]));
    k.put(T, C.gold1, xf(new THREE.IcosahedronGeometry(0.13, 0), [0, ys + 1.05, pz]));
    k.put(T, C.gold2, xf(new THREE.IcosahedronGeometry(0.11, 0), [0, ys + 1.28, pz]));
    k.put(T, C.gold2, cyl(0.07, 0, 0.2, 6, [0, ys + 1.34, pz]));
    // gold chains from the rings down to the top roof's corners
    for (let f = 0; f < 4; f++) {
      const [cx, cz] = quarter(f, topR * 0.92, topR * 0.92);
      const pts = sag([0, y + 2.1, pz], [cx, topEave[1] + 0.35, pz + cz], 0.35, 6);
      for (let i = 0; i < pts.length - 1; i++) k.put(T, C.gold0, rodG(pts[i], pts[i + 1], 0.03, 3, 0.03, true));
      for (const p of pts.slice(1, -1))
        k.put(T, C.gold1, xf(new THREE.OctahedronGeometry(0.06, 0), [p.x, p.y - 0.06, p.z]));
    }
  }

  // ============================================================ BELL TOWER
  const BX = 9.6;
  const BZ = -5.9;
  const BY = TY + 0.62;
  const bellTop = BY + 3.3;
  const bell = b.joint("bell", { parent: root, at: [BX, bellTop, BZ], dir: [0, -1, 0], role: "hinge" });
  const striker = b.joint("bellStriker", {
    parent: root,
    at: [BX, bellTop + 0.05, BZ + 1.5],
    dir: [0, -1, 0],
    role: "hinge",
  });
  {
    const T = "bellTower";
    k.put(T, C.stone2, block(3.9, 0.5, 3.9, [BX, TY - 0.02, BZ], 0.07));
    k.put(T, C.stone3, block(3.5, 0.14, 3.5, [BX, TY + 0.48, BZ], 0.04));
    for (let i = 0; i < 3; i++)
      k.put(T, C.stone3, block(1.6, 0.16 * (i + 1), 0.3, [BX, TY - 0.02, BZ + 2.3 - i * 0.28], 0.02));
    const P = 1.32;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        k.put(T, C.stone3, block(0.42, 0.14, 0.42, [BX + sx * P, BY - 0.02, BZ + sz * P], 0.04));
        k.put(T, C.red1, cyl(0.16, 0.14, 3.55, 8, [BX + sx * P, BY + 0.1, BZ + sz * P]));
        k.put(T, C.gold1, box(0.3, 0.14, 0.3, [BX + sx * P, BY + 3.55, BZ + sz * P]));
      }
    for (const yy of [0.95, 3.05, 3.45]) {
      const col = yy > 3.3 ? C.red2 : C.red1;
      for (const s of [-1, 1]) {
        k.put(T, col, box(2 * P + 0.5, 0.18, 0.14, [BX, BY + yy, BZ + s * P]));
        k.put(T, col, box(0.14, 0.18, 2 * P + 0.5, [BX + s * P, BY + yy, BZ]));
      }
    }
    k.put(T, C.wood1, box(2 * P + 0.3, 0.22, 0.22, [BX, bellTop + 0.18, BZ]));
    // low railing round the platform
    for (const s of [-1, 1]) {
      k.put(T, C.red2, box(2 * P, 0.07, 0.07, [BX, BY + 0.5, BZ - s * P]));
      k.put(T, C.red2, box(0.07, 0.07, 2 * P, [BX + s * P, BY + 0.5, BZ]));
    }
    roof(k, T, {
      at: [BX, BY + 3.95, BZ],
      R: 2.6,
      top: 0.55,
      H: 1.35,
      lift: 0.5,
      thick: 0.25,
      wall: 1.45,
      ribs: 8,
      rafters: 7,
      bells: true,
      cap: true,
    });
    const ry = BY + 3.95 + 1.35;
    k.put(T, C.gold1, cyl(0.2, 0.12, 0.25, 8, [BX, ry, BZ]));
    k.put(T, C.gold2, xf(new THREE.IcosahedronGeometry(0.18, 0), [BX, ry + 0.4, BZ]));
    k.put(T, C.gold2, cyl(0.1, 0, 0.25, 6, [BX, ry + 0.5, BZ]));
    // the bronze bell
    const prof = [
      [0.0, 0.08],
      [0.56, 0],
      [0.62, 0.1],
      [0.52, 0.26],
      [0.49, 1.0],
      [0.43, 1.28],
      [0.27, 1.4],
      [0.0, 1.42],
    ].map(([r, yy]) => new THREE.Vector2(r, yy));
    const yb0 = bellTop - 1.62;
    k.put("bell", C.bronze1, xf(new THREE.LatheGeometry(prof, 10), [BX, yb0, BZ]), { bone: bell });
    for (const yy of [0.3, 0.92])
      k.put("bell", C.bronze0, cyl(0.53, 0.53, 0.07, 10, [BX, yb0 + yy, BZ]), { bone: bell });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      k.put(
        "bell",
        C.bronze0,
        box(
          0.07,
          0.62,
          0.07,
          [BX + Math.cos(a) * 0.5, yb0 + 0.62, BZ + Math.sin(a) * 0.5],
          [0, (-a * 180) / Math.PI, 0],
        ),
        { bone: bell },
      );
      for (let r = 0; r < 2; r++)
        for (let c = -1; c <= 1; c++) {
          const aa = a + Math.PI / 4 + c * 0.24;
          const yy = yb0 + 1.05 + r * 0.14;
          const rad = 0.48 - r * 0.03;
          k.put(
            "bell",
            C.bronze2,
            cyl(0.05, 0.015, 0.06, 5, [BX + Math.cos(aa) * rad, yy, BZ + Math.sin(aa) * rad], [0, 0, 0]),
            { bone: bell },
          );
        }
    }
    k.put("bell", C.bronze2, cyl(0.14, 0.12, 0.05, 8, [BX, yb0 + 0.42, BZ + 0.5], [90, 0, 0]), { bone: bell });
    k.put("bell", C.bronze0, box(0.32, 0.22, 0.14, [BX, yb0 + 1.52, BZ]), { bone: bell });
    k.put("bell", C.bronze0, xf(new THREE.TorusGeometry(0.14, 0.04, 4, 8), [BX, yb0 + 1.72, BZ]), { bone: bell });
    // the striker log on its ropes
    const sy = BY + 1.3;
    k.put("striker", C.wood2, rodG([BX, sy, BZ + 0.75], [BX, sy, BZ + 2.45], 0.15, 7), { bone: striker });
    for (const zz of [BZ + 1.0, BZ + 2.2])
      k.put("striker", C.rope1, rodG([BX, sy, zz - 0.04], [BX, sy, zz + 0.04], 0.17, 7), { bone: striker });
    for (const zz of [BZ + 1.1, BZ + 2.1])
      k.put("striker", C.rope1, rodG([BX, sy + 0.12, zz], [BX, bellTop + 0.08, BZ + P], 0.025, 3), { bone: striker });
    k.put("striker", C.lacquer, rodG([BX, sy, BZ + 2.45], [BX, sy, BZ + 2.5], 0.12, 7), { bone: striker });
  }

  // ============================================================ CLIFFS
  let seedN = 1;
  const tops: [number, number, number][] = [];
  const column = (x: number, z: number, r: number, top: number) => {
    const seed = seedN++;
    const n = 6 + (seed % 2);
    const base = ngon(n, 1, 0, 0, seed * 0.7).map(([a, c]): P2 => {
      const j = 0.75 + hash(a, c, seed, 3) * 0.45;
      return [a * j, c * j];
    });
    const at = (kk: number) => base.map(([a, c]): P2 => [x + a * kk, z + c * kk]);
    const strata = Math.max(1, Math.round(top / 2.8));
    let y0 = 0;
    for (let s = 0; s < strata; s++) {
      const y1 = s === strata - 1 ? top - 0.2 : (top * (s + 1)) / strata + rr(-0.3, 0.3);
      k.put(
        "cliff",
        s % 2 ? C.cliff2 : C.cliff1,
        prism2(at(r * (1 - s * 0.07)), at(r * (1 - s * 0.07 - 0.05)), y0, y1),
      );
      y0 = y1;
    }
    const kr = r * (1 - strata * 0.07 + 0.08);
    k.split("cliff", prism(at(kr), y0 - 0.06, top, 0.2), (_c, nn) =>
      nn.y > 0.9 ? (seed % 3 ? C.grass1 : C.grass2) : C.grass0,
    );
    tops.push([x, top, z]);
  };
  const LIP: P3 = [-15.6, 8.6, -7.6];
  const LEDGE: P3 = [-15.6, 4.4, -5.5];
  const ANCHOR: P3 = [-13.3, 9.9, -10.8];
  const SPIRE: P3 = [-7.6, 9.3, -11.4];
  {
    const fixed: [number, number, number, number][] = [
      [LIP[0], LIP[2], 1.35, LIP[1]],
      [LEDGE[0], LEDGE[2], 1.3, LEDGE[1]],
      [ANCHOR[0], ANCHOR[2], 1.25, ANCHOR[1]],
      [-15.4, -9.6, 1.4, 10.6],
      [-17.6, -7.2, 1.3, 10.2],
      [-13.6, -7.4, 1.25, 9.6],
    ];
    for (const [x, z, r, h] of fixed) column(x, z, r, h);
    for (const s of [-1, 1]) {
      for (let z = -3.3; z > -12.4; z -= 1.55) {
        for (let x = 13.3; x < 19.0; x += 1.7) {
          const px = s * (x + rr(-0.35, 0.35));
          const pz = z + rr(-0.35, 0.35);
          if (s < 0 && px > -17.4 && px < -13.8 && pz > -6.6) continue; // the waterfall gorge
          if (fixed.some(([fx, fz]) => Math.hypot(fx - px, fz - pz) < 1.5)) continue;
          const h =
            s < 0
              ? 4 + (-pz - 3) * 0.72 + (-px - 13) * 0.22 + rr(-0.6, 0.6)
              : 3 + (-pz - 3) * 0.62 + (px - 13) * 0.25 + rr(-0.6, 0.6);
          column(px, pz, Math.min(rr(1.0, 1.35), (19.95 - Math.abs(px)) / 1.2), h);
        }
      }
    }
    column(SPIRE[0], SPIRE[2], 1.15, SPIRE[1]);
    column(SPIRE[0] + 1.3, SPIRE[2] + 0.4, 0.8, 3.6);
    // boulders at the cliff feet
    for (const [x, z, r] of [
      [-13.4, -2.9, 0.7],
      [-18.6, -2.6, 0.9],
      [13.6, -2.7, 0.75],
      [16.8, -2.4, 0.6],
      [19.0, -2.9, 0.9],
      [-19.2, -3.4, 0.6],
    ] as const) {
      k.split("rocks", xf(rockG(r, x * 7 + z, 0), [x, GY + r * 0.35, z], [0, x * 30, 0], [1, 0.75, 1]), (_c, n) =>
        n.y > 0.7 ? C.grass1 : n.y < -0.2 ? C.cliff0 : C.cliff1,
      );
    }
  }

  // ============================================================ WATERFALL, POOL AND STREAM
  {
    const T = "water";
    const fall = (pts: P3[], halfW: number, cols: number) => {
      const colours = [C.water1, C.water2, C.water1, C.foam, C.water1, C.water2, C.water0, C.water2];
      for (let c = 0; c < cols; c++) {
        const u0 = -halfW + (2 * halfW * c) / cols;
        const u1 = u0 + (2 * halfW) / cols;
        const s = new Soup();
        for (let i = 0; i < pts.length - 1; i++) {
          const [x0, y0, z0] = pts[i];
          const [x1, y1, z1] = pts[i + 1];
          const bulge = (u: number) => 0.06 * Math.cos((u / halfW) * 1.4);
          s.quad(
            V(x0 + u0, y0, z0 + bulge(u0)),
            V(x0 + u1, y0, z0 + bulge(u1)),
            V(x1 + u1, y1, z1 + bulge(u1)),
            V(x1 + u0, y1, z1 + bulge(u0)),
            V(0, 0.3, 1),
          );
        }
        k.put(T, colours[(c * 3 + cols) % colours.length], s.geo());
      }
    };
    const [lx, ly, lz] = LIP;
    fall(
      [
        [lx, ly + 0.02, lz + 0.2],
        [lx, ly + 0.05, lz + 1.0],
        [lx, ly - 0.35, lz + 1.45],
        [lx, ly - 1.4, lz + 1.6],
        [lx, LEDGE[1] + 0.05, lz + 1.75],
      ],
      0.85,
      7,
    );
    const ez = LEDGE[2] + 1.15;
    fall(
      [
        [lx, LEDGE[1] + 0.06, lz + 1.75],
        [lx, LEDGE[1] + 0.06, ez],
        [lx, LEDGE[1] - 0.15, ez + 0.35],
        [lx, LEDGE[1] - 1.2, ez + 0.55],
        [lx, GY + 0.06, ez + 0.75],
      ],
      1.05,
      8,
    );
    for (const [y, z, n] of [
      [LEDGE[1] + 0.1, lz + 1.75, 4],
      [GY + 0.1, ez + 0.8, 7],
    ] as const) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI;
        const r = rr(0.22, 0.42);
        k.put(
          T,
          C.foam,
          xf(
            rockG(r, i * 13 + y, 0, 0.3),
            [lx + Math.cos(a) * 1.0, y + r * 0.3, z + Math.sin(a) * 0.35],
            [0, i * 40, 0],
            [1, 0.6, 1],
          ),
        );
      }
    }
    // plunge pool
    const pool = ngon(14, 1, 0, 0).map(([a, c]): P2 => [lx + a * 2.3, -1.9 + c * 2.5]);
    k.put(T, C.water0, prism(pool, GY - 0.05, GY + 0.04));
    for (const [r, w] of [
      [0.9, 0.12],
      [1.5, 0.1],
    ] as const) {
      const ring = new Soup();
      for (let i = 0; i < 16; i++) {
        const a0 = (i / 16) * Math.PI * 2;
        const a1 = ((i + 1) / 16) * Math.PI * 2;
        const cz = ez + 0.9;
        const p = (a: number, rad: number) => V(lx + Math.cos(a) * rad * 1.1, GY + 0.05, cz + Math.sin(a) * rad * 0.8);
        ring.quad(p(a0, r), p(a1, r), p(a1, r + w), p(a0, r + w), V(0, 1, 0));
      }
      k.put(T, C.water2, ring.geo());
    }
    pool.forEach(([x, z], i) => {
      if (z < -3.9) return;
      const r = rr(0.3, 0.55);
      k.split("rocks", xf(rockG(r, i * 3.3, 0), [x, GY + r * 0.2, z], [0, i * 50, 0], [1, 0.7, 1]), (_c, n) =>
        n.y > 0.75 ? C.grass1 : C.cliff1,
      );
    });
    // the stream running forward past the floor
    const course: P2[] = [
      [lx + 0.2, 0.3],
      [-15.0, 3.0],
      [-16.2, 6.0],
      [-15.6, 9.0],
      [-16.1, 12.75],
    ];
    for (let i = 0; i < course.length - 1; i++) {
      const [x0, z0] = course[i];
      const [x1, z1] = course[i + 1];
      const quad = (w: number): P2[] => [
        [x0 - w, z0],
        [x0 + w, z0],
        [x1 + w, z1],
        [x1 - w, z1],
      ];
      k.put(T, C.water0, prism(quad(0.75), GY - 0.04, GY + 0.035));
      k.put(T, C.water1, prism(quad(0.42), GY, GY + 0.045));
      k.put(
        T,
        C.water2,
        prism(
          quad(0.08).map(([x, z]): P2 => [x + 0.15, z]),
          GY,
          GY + 0.05,
        ),
      );
      for (let j = 0; j < 3; j++) {
        const t = (j + 0.5) / 3;
        for (const s of [-1, 1]) {
          const r = rr(0.18, 0.34);
          k.split(
            "rocks",
            xf(
              rockG(r, i * 10 + j * 3 + s, 0),
              [x0 + (x1 - x0) * t + s * rr(0.8, 0.95), GY + r * 0.15, z0 + (z1 - z0) * t],
              [0, j * 70, 0],
              [1, 0.65, 1],
            ),
            (_c, n) => (n.y > 0.75 ? C.grass2 : C.cliff2),
          );
        }
      }
    }
    // a small arched vermilion bridge over the stream
    const bz = 7.6;
    const bx = -15.95;
    const arch = (t: number): [number, number] => [bx - 2.0 + 4.0 * t, GY + 0.08 + 0.75 * Math.sin(Math.PI * t)];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = arch(i / n);
      const [x1, y1] = arch((i + 1) / n);
      k.put("bridge", i % 2 ? C.wood2 : C.wood1, slabG([x0 + 0.02, y0, bz], [x1 - 0.02, y1, bz], 0.09, 1.2));
    }
    for (const s of [-1, 1]) {
      const rail: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) {
        const [x, y] = arch(i / 6);
        rail.push(V(x, y + 0.75, bz + s * 0.55));
        k.put("bridge", C.red1, box(0.1, 0.8, 0.1, [x, y + 0.36, bz + s * 0.55]));
        if (i === 0 || i === 6) {
          k.put("bridge", C.gold1, xf(new THREE.IcosahedronGeometry(0.1, 0), [x, y + 0.85, bz + s * 0.55]));
        }
      }
      for (let i = 0; i < 6; i++) {
        k.put("bridge", C.red2, rodG(rail[i], rail[i + 1], 0.05, 4));
        k.put(
          "bridge",
          C.red0,
          rodG(rail[i].clone().add(V(0, -0.35, 0)), rail[i + 1].clone().add(V(0, -0.35, 0)), 0.035, 4),
        );
      }
    }
  }

  // ============================================================ ROPE BRIDGE TO THE SPIRE SHRINE
  const ropeBridge = b.joint("ropeBridge", {
    parent: root,
    at: [ANCHOR[0] + 0.9, ANCHOR[1], ANCHOR[2]],
    aim: [SPIRE[0] - 0.8, SPIRE[1], SPIRE[2]],
    group: "ropeBridge",
  });
  {
    const T = "ropeBridge";
    const bone = ropeBridge;
    const A: P3 = [ANCHOR[0] + 0.9, ANCHOR[1], ANCHOR[2]];
    const B: P3 = [SPIRE[0] - 0.8, SPIRE[1], SPIRE[2]];
    const deck = sag(A, B, 0.9, 14);
    const dir = V(B[0] - A[0], 0, B[2] - A[2]).normalize();
    const side = V(-dir.z, 0, dir.x);
    for (let i = 0; i < deck.length; i++) {
      const p = deck[i];
      if (i > 0 && i < deck.length - 1)
        k.put(
          T,
          i % 3 ? C.wood2 : C.wood1,
          slabG(
            p.clone().add(side.clone().multiplyScalar(0.5)),
            p.clone().add(side.clone().multiplyScalar(-0.5)),
            0.06,
            0.26,
          ),
          { bone },
        );
    }
    for (const s of [-1, 1]) {
      const off = side.clone().multiplyScalar(s * 0.45);
      const low = deck.map((p) => p.clone().add(off));
      const high = sag([A[0] + off.x, A[1] + 0.85, A[2] + off.z], [B[0] + off.x, B[1] + 0.85, B[2] + off.z], 0.55, 14);
      for (let i = 0; i < 14; i++) {
        k.put(T, C.rope1, rodG(low[i], low[i + 1], 0.035, 3, 0.035, true), { bone });
        k.put(T, C.rope1, rodG(high[i], high[i + 1], 0.035, 3, 0.035, true), { bone });
        if (i % 2 === 0) k.put(T, C.rope0, rodG(low[i], high[i], 0.02, 3, 0.02, true), { bone });
      }
      for (const [p, q] of [
        [A, high[0]],
        [B, high[14]],
      ] as const) {
        k.put(T, C.wood1, rodG([p[0] + off.x, p[1] - 0.2, p[2] + off.z], [q.x, q.y + 0.25, q.z], 0.08, 5), { bone });
      }
    }
    // prayer pennants strung along the bridge rail are added with the flags
  }
  {
    // the little spire shrine
    const T = "spireShrine";
    const [x, y, z] = SPIRE;
    k.put(T, C.stone3, block(1.1, 0.18, 1.0, [x, y - 0.02, z], 0.04));
    k.put(T, C.red1, block(0.8, 0.7, 0.7, [x, y + 0.16, z]));
    k.put(T, C.wood0, box(0.36, 0.42, 0.04, [x, y + 0.42, z + 0.36]));
    k.put(T, C.gold1, box(0.06, 0.06, 0.05, [x, y + 0.42, z + 0.39]));
    roof(k, T, {
      at: [x, y + 0.92, z],
      R: 0.75,
      top: 0.12,
      H: 0.45,
      lift: 0.12,
      thick: 0.08,
      wall: 0.4,
      ribs: 3,
      cap: true,
    });
    k.put(T, C.gold1, xf(new THREE.IcosahedronGeometry(0.1, 0), [x, y + 1.46, z]));
    chochin(k, [x + 0.62, y + 0.85, z + 0.5], 0.12);
    chochin(k, [x - 0.62, y + 0.85, z + 0.5], 0.12);
  }

  // ============================================================ DISTANT PEAKS, HILLS AND CLOUDS
  {
    const mountain = (
      x: number,
      z: number,
      h: number,
      r: number,
      dz: number,
      snow: number,
      seed: number,
      hill = false,
    ) => {
      const g = plain(new THREE.ConeGeometry(1, 1, 9, 4, true));
      const pos = g.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const py = pos.getY(i);
        const pz2 = pos.getZ(i);
        const t = py + 0.5; // 0 at base, 1 at apex
        const j = hash(Math.round(px * 1000), Math.round(py * 1000), Math.round(pz2 * 1000), seed);
        const rad = t < 0.999 ? 1 + (j - 0.5) * 0.45 * (1 - t) + (t > 0.3 ? (j - 0.5) * 0.3 : 0) : 0;
        const shear = t * t * (hash(1, 2, 3, seed) - 0.5) * 0.35;
        const yy = t < 0.999 ? t + (j - 0.5) * 0.09 * (t > 0.01 ? 1 : 0) : 1;
        pos.setXYZ(i, x + (px * rad + shear) * r, yy * h, z + pz2 * rad * dz);
      }
      k.split(hill ? "hills" : "peaks", g, (c, n) => {
        const line = snow + (hash(Math.round(c.x * 10), Math.round(c.y * 10), 0, seed) - 0.5) * 2.2;
        if (!hill && c.y > line) return n.x > 0.05 ? C.snow1 : C.snow0;
        if (hill) return n.x > 0.15 ? C.hill1 : C.hill0;
        if (n.z < -0.5) return C.mtn2;
        return n.x > 0.3 ? C.mtn2 : n.x < -0.3 ? C.mtn0 : C.mtn1;
      });
    };
    mountain(-14.6, -12.9, 15.0, 4.4, 1.3, 10.5, 1);
    mountain(-8.2, -13.1, 19.6, 6.0, 1.4, 12.8, 2);
    mountain(-2.0, -13.4, 14.5, 4.6, 1.2, 10.8, 3);
    mountain(4.2, -13.0, 17.2, 5.0, 1.3, 11.8, 4);
    mountain(10.8, -13.3, 20.0, 6.0, 1.4, 13.2, 5);
    mountain(15.8, -12.9, 15.5, 3.8, 1.2, 10.8, 6);
    mountain(-12.0, -12.2, 10.5, 4.2, 0.9, 99, 7, true);
    mountain(-3.5, -12.3, 9.0, 5.0, 0.9, 99, 8, true);
    mountain(6.0, -12.2, 8.5, 4.6, 0.9, 99, 9, true);
    mountain(14.0, -12.2, 9.5, 4.0, 0.9, 99, 10, true);
    // flat stylised cloud banks drifting between the peaks
    for (const [x, y, z, w] of [
      [-10.0, 11.5, -12.0, 3.2],
      [4.5, 13.2, -12.4, 3.6],
      [15.0, 10.4, -11.8, 2.8],
      [-16.4, 13.8, -12.2, 2.4],
    ] as const) {
      for (let i = 0; i < 4; i++) {
        const r = w * (0.32 + 0.18 * Math.sin(i * 2.1 + x));
        k.split(
          "clouds",
          xf(
            rockG(r, x + i * 5, 0, 0.25),
            [x + (i - 1.5) * w * 0.42, y + Math.sin(i * 1.7) * 0.25, z + i * 0.12],
            [0, i * 33, 0],
            [1.25, 0.42, 0.55],
          ),
          (_c, n) => (n.y > 0.1 ? C.foam : C.smoke),
        );
      }
    }
  }

  // ============================================================ INCENSE BURNER (behind the gate)
  {
    const T = "incense";
    const x = 0;
    const z = 0.95;
    k.put(T, C.stone3, block(1.6, 0.2, 1.6, [x, GY, z], 0.05));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      k.put(
        T,
        C.bronze0,
        rodG(
          [x + Math.cos(a) * 0.5, GY + 0.2, z + Math.sin(a) * 0.5],
          [x + Math.cos(a) * 0.35, GY + 0.75, z + Math.sin(a) * 0.35],
          0.08,
          5,
        ),
      );
    }
    k.put(
      T,
      C.bronze1,
      xf(
        new THREE.LatheGeometry(
          [
            [0, 0],
            [0.42, 0.05],
            [0.62, 0.3],
            [0.66, 0.55],
            [0.58, 0.62],
            [0, 0.62],
          ].map(([a, c]) => new THREE.Vector2(a, c)),
          10,
        ),
        [x, GY + 0.65, z],
      ),
    );
    k.put(T, C.bronze2, cyl(0.68, 0.68, 0.06, 10, [x, GY + 1.2, z]));
    k.put(T, C.lamp0, cyl(0.5, 0.5, 0.06, 8, [x, GY + 1.25, z]), { glow: 1.6 });
    for (const s of [-1, 1])
      k.put(T, C.bronze0, xf(new THREE.TorusGeometry(0.16, 0.04, 4, 6), [x + s * 0.7, GY + 1.12, z], [0, 90, 0]));
    // the little roofed lid on four posts
    for (const [px, pz] of ngon(4, 0.42, x, z, Math.PI / 4))
      k.put(T, C.bronze0, box(0.06, 0.55, 0.06, [px, GY + 1.55, pz]));
    roof(k, T, {
      at: [x, GY + 1.85, z],
      R: 0.62,
      top: 0.1,
      H: 0.45,
      lift: 0.1,
      thick: 0.08,
      wall: 0.4,
      ribs: 3,
      cap: true,
    });
    k.put(T, C.gold1, xf(new THREE.IcosahedronGeometry(0.09, 0), [x, GY + 2.4, z]));
    // smoke puffs climbing out of the burner
    for (let i = 0; i < 6; i++) {
      const r = 0.12 + i * 0.05;
      k.put(
        T,
        C.smoke,
        xf(rockG(r, 50 + i, 0, 0.3), [x + Math.sin(i * 1.3) * 0.25 + i * 0.06, GY + 2.6 + i * 0.42, z - i * 0.05]),
      );
    }
  }

  // ============================================================ TREES AND SHRUBS
  {
    tree(b, k, "pine", [-13.7, GY, 1.9], 7.4, [0.78, 0.3], 11, "pineGreat");
    tree(b, k, "blossom", [13.7, GY, 1.9], 7.0, [-0.78, 0.3], 12, "blossomGreat");
    tree(b, k, "blossom", [-9.2, TY, -6.2], 5.2, [0.35, 0.3], 13, "blossomTerrace");
    tree(b, k, "pine", [6.2, TY, -10.3], 5.4, [-0.45, 0.2], 14, "pineTerrace");
    const near = (x: number, z: number) =>
      tops.reduce((a, c) => (Math.hypot(c[0] - x, c[2] - z) < Math.hypot(a[0] - x, a[2] - z) ? c : a));
    [
      [-18.8, -3.6, 3.0, 0.5, 0.3],
      [-13.6, -7.4, 2.6, 0.6, 0.5],
      [-18.2, -9.6, 3.2, 0.3, 0.5],
      [17.8, -3.8, 3.0, -0.5, 0.3],
      [15.2, -8.8, 3.4, -0.4, 0.4],
      [18.2, -10.4, 2.8, -0.2, 0.5],
    ].forEach(([x, z, h, lx, lz], i) => {
      const [cx, cy, cz] = near(x, z);
      tree(b, k, "pine", [cx, cy - 0.02, cz], h, [lx, lz], 40 + i, `pineCliff${i + 1}`);
    });
    // clipped azalea shrubs along the terrace foot and the right meadow
    const shrubs: [number, number, number, number][] = [
      [-5.0, GY, TZ + 0.6, 0.7],
      [-7.4, GY, TZ + 0.55, 0.85],
      [-10.2, GY, TZ + 0.6, 0.75],
      [-12.4, GY, TZ + 0.7, 0.9],
      [5.0, GY, TZ + 0.6, 0.7],
      [7.6, GY, TZ + 0.55, 0.8],
      [10.4, GY, TZ + 0.6, 0.85],
      [12.5, GY, TZ + 0.7, 0.7],
      [-3.6, TY, -10.6, 0.8],
      [3.4, TY, -10.8, 0.75],
      [14.6, GY, 3.8, 0.7],
      [18.6, GY, 6.2, 0.9],
      [-18.9, GY, 3.6, 0.8],
      [-12.9, GY, 12.0, 0.55],
      [12.9, GY, 12.0, 0.55],
    ];
    shrubs.forEach(([x, y, z, r], i) => {
      k.split("shrubs", xf(rockG(r, 300 + i, 1, 0.22), [x, y + r * 0.5, z], [0, i * 37, 0], [1.15, 0.75, 1]), pinePads);
      if (i % 2 === 0)
        for (let j = 0; j < 5; j++) {
          const a = j * 1.3 + i;
          k.put(
            "shrubs",
            j % 2 ? C.bloom1 : C.bloom2,
            xf(new THREE.OctahedronGeometry(r * 0.13, 0), [
              x + Math.cos(a) * r * 0.85,
              y + r * (0.55 + 0.25 * Math.sin(a * 2)),
              z + Math.sin(a) * r * 0.75,
            ]),
          );
        }
    });
  }

  // ============================================================ NOBORI BANNERS ALONG THE FLOOR
  {
    let i = 0;
    for (const s of [1, -1]) {
      for (const z of [5.0, 7.9, 10.8]) {
        i++;
        const x = s * 12.85;
        const top = 5.6;
        k.put("banners", C.stone2, block(0.55, 0.28, 0.55, [x, 0, z], 0.05));
        k.put("banners", C.stone3, block(0.38, 0.12, 0.38, [x, 0.28, z], 0.03));
        k.put("banners", C.wood0, cyl(0.06, 0.05, top - 0.3, 6, [x, 0.38, z]));
        k.put("banners", C.gold1, xf(new THREE.OctahedronGeometry(0.1, 0), [x, top + 0.12, z]));
        k.put("banners", C.gold1, cyl(0.07, 0.07, 0.06, 6, [x, top - 0.02, z]));
        const y1 = top - 0.2;
        const y0 = y1 - BANNER_H;
        const chain = b.chain(
          `banner${i}`,
          [
            [x + s * 0.07, (y0 + y1) / 2, z],
            [x + s * (0.07 + BANNER_W / 2), (y0 + y1) / 2, z],
            [x + s * (0.07 + BANNER_W), (y0 + y1) / 2, z],
          ],
          { parent: root, names: [`banner${i}`, `banner${i}Mid`, `banner${i}Tip`], role: "tail" },
        );
        b.membrane(
          [
            [x + s * 0.07, y1, z],
            [x + s * 0.07, y0, z],
          ],
          [
            [x + s * (0.07 + BANNER_W), y1, z],
            [x + s * (0.07 + BANNER_W), y0, z],
          ],
          { thickness: 0.025, color: bannerPaint, bone: chain, rows: 4, cols: 6, name: `bannerCloth${i}` },
        );
        k.put("banners", C.lacquer, rodG([x, y1 + 0.03, z], [x + s * (BANNER_W + 0.12), y1 + 0.03, z], 0.035, 5), {
          bone: chain.joints[0],
        });
        k.put(
          "banners",
          C.gold1,
          xf(new THREE.OctahedronGeometry(0.05, 0), [x + s * (BANNER_W + 0.14), y1 + 0.03, z]),
          { bone: chain.joints[1] },
        );
      }
    }
  }

  // ============================================================ PRAYER-FLAG LINES AND PAPER LANTERNS
  {
    const lines: [string, P3, P3, number][] = [
      ["flagsGateL", [6.95, 8.3, GATE_Z], [12.7, 6.9, 2.3], 0.9],
      ["flagsGateR", [-6.95, 8.3, GATE_Z], [-12.9, 6.9, 2.2], 0.9],
      ["flagsPagodaL", [-3.75, 8.0, PAG_Z + 3.75], [-13.4, 9.7, -7.3], 1.3],
      ["flagsPagodaR", [3.75, 8.0, PAG_Z + 3.75], [BX - 2.55, 7.7, BZ + 2.55], 0.5],
      ["flagsBell", [BX + 2.55, 7.7, BZ + 2.55], [14.3, 7.6, -4.4], 0.4],
    ];
    for (const [name, a, c, drop] of lines) {
      const bone = b.joint(name, { parent: root, at: a, aim: c, group: "flags" });
      const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const n = Math.max(4, Math.round(len / 0.5));
      const pts = sag(a, c, drop, n);
      for (let i = 0; i < n; i++) k.put("flags", C.rope0, rodG(pts[i], pts[i + 1], 0.02, 3, 0.02, true), { bone });
      b.cards(
        pts.slice(1, -1).map((p) => frame(p, [0, 1, 0])),
        PENNANT,
        { size: [0.3, 0.4], lean: 180, flow: [0, 0, 1], color: flagPaint, bone, sink: 0, name: `${name}Pennants` },
      );
    }
    // big paper lanterns hung from the gate's lower beam
    for (const s of [-1, 1]) {
      k.put("chochin", C.lacquer, box(0.08, 0.08, 0.5, [s * 1.75, 5.47, GATE_Z + 0.35]));
      chochin(k, [s * 1.75, 5.43, GATE_Z + 0.55], 0.32);
    }
    for (const s of [-1, 1]) chochin(k, [BX + s * 0.85, BY + 3.36, BZ + 1.4], 0.18);
  }

  // ============================================================ KOMAINU GUARDIANS
  for (const s of [-1, 1]) {
    const T = "komainu";
    const x = s * 4.62;
    const z = 3.1;
    k.put(T, C.stone1, block(1.05, 0.16, 0.95, [x, GY - 0.02, z], 0.04));
    k.put(T, C.stone2, block(0.88, 0.62, 0.78, [x, GY + 0.14, z], 0.03));
    k.put(T, C.stone3, block(0.98, 0.1, 0.88, [x, GY + 0.76, z], 0.04));
    k.put(T, C.stone1, box(0.6, 0.3, 0.03, [x, GY + 0.45, z + 0.4]));
    const y0 = GY + 0.86;
    const turn = -s * 18;
    const piece = (g: G, col: string) => k.put(T, col, xf(g, [x, y0, z], [0, turn, 0]));
    piece(block(0.5, 0.36, 0.5, [0, 0, -0.1], 0.06), C.stone3);
    piece(box(0.42, 0.62, 0.34, [0, 0.52, 0.06], [-14, 0, 0]), C.stone3);
    for (const t of [-1, 1]) {
      piece(box(0.12, 0.5, 0.14, [t * 0.14, 0.27, 0.2]), C.stone3);
      piece(block(0.16, 0.09, 0.2, [t * 0.14, 0, 0.24], 0.02), C.stone4);
    }
    piece(
      rockG(0.36, 70 + s, 0, 0.3)
        .scale(1, 1.05, 0.85)
        .translate(0, 0.98, 0.02),
      C.stone2,
    );
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      piece(
        new THREE.IcosahedronGeometry(0.09, 0).translate(Math.cos(a) * 0.33, 0.98 + Math.sin(a) * 0.3, -0.04),
        C.stone2,
      );
    }
    piece(box(0.38, 0.32, 0.3, [0, 1.0, 0.22]), C.stone3);
    piece(box(0.26, 0.15, 0.16, [0, 0.92, 0.42]), C.stone4);
    piece(box(0.1, 0.06, 0.04, [0, 0.98, 0.51]), C.lacquer);
    piece(box(0.2, 0.04, 0.05, [0, 0.86, 0.5]), s > 0 ? C.red0 : C.stone1);
    for (const t of [-1, 1]) {
      piece(new THREE.OctahedronGeometry(0.04, 0).translate(t * 0.1, 1.09, 0.37), C.gold1);
      piece(new THREE.ConeGeometry(0.06, 0.14, 4).translate(t * 0.16, 1.2, 0.16), C.stone2);
    }
    piece(
      shapeG(
        [
          [-0.2, 0],
          [0.2, 0],
          [0, -0.3],
        ],
        0.06,
      ).translate(0, 0.84, 0.3),
      C.red1,
    );
    piece(
      shapeG(
        [
          [0, 0],
          [0.1, 0.25],
          [0.2, 0.15],
          [0.16, 0.45],
          [0.32, 0.38],
          [0.2, 0.7],
          [0.0, 0.5],
          [-0.1, 0.25],
        ],
        0.16,
      )
        .rotateY(Math.PI / 2)
        .translate(0, 0.1, -0.38),
      C.stone2,
    );
    if (s > 0) piece(new THREE.IcosahedronGeometry(0.13, 0).translate(0.15, 0.13, 0.36), C.stone4);
  }

  // ============================================================ SIDE GROUNDS: PROPS THAT TELL THE STORY
  {
    // sake barrel offering wall on the right
    const T = "sake";
    const sx = 16.6;
    const sz = 0.2;
    k.put(T, C.wood1, block(3.7, 0.25, 1.0, [sx, GY - 0.02, sz], 0.03));
    k.put(T, C.wood2, box(3.2, 0.08, 0.9, [sx, GY + 0.98, sz]));
    const labels = [C.red1, C.roof0, C.gold1, C.lacquer, C.red1];
    for (const [row, count] of [
      [0, 5],
      [1, 4],
    ] as const) {
      for (let i = 0; i < count; i++) {
        const x = sx + (i - (count - 1) / 2) * 0.72;
        const y = GY + 0.23 + row * 0.79;
        k.put(T, C.plaster1, cyl(0.34, 0.34, 0.68, 8, [x, y, sz]));
        k.put(T, C.rope1, cyl(0.36, 0.36, 0.06, 8, [x, y + 0.6, sz]));
        k.put(T, labels[(i + row * 2) % labels.length], box(0.44, 0.4, 0.04, [x, y + 0.32, sz + 0.33]));
        k.put(T, C.plaster1, cyl(0.1, 0.1, 0.02, 6, [x, y + 0.36, sz + 0.35], [90, 0, 0]));
      }
    }
    // broken pillars and rubble from an older gate
    const RT = "ruins";
    for (const [x, z, h, seed] of [
      [15.2, 6.2, 2.6, 1],
      [17.6, 7.0, 1.4, 2],
      [15.6, 9.6, 0.9, 3],
    ] as const) {
      k.put(RT, C.stone2, block(1.2, 0.3, 1.2, [x, GY - 0.03, z], 0.08));
      k.put(RT, C.lacquer, cyl(0.46, 0.46, 0.45, 8, [x, GY + 0.27, z]));
      k.put(RT, C.red1, xf(brokenG(0.38, h, 8, seed), [x, GY + 0.27, z]));
      k.put(RT, C.red0, xf(brokenG(0.25, 0.08, 8, seed + 9), [x, GY + 0.27 + h * 0.55, z]).scale(1, 1, 1));
    }
    k.put(RT, C.red1, xf(brokenG(0.36, 2.2, 8, 5), [16.4, GY + 0.33, 8.3], [0, 30, 88]));
    k.put(
      RT,
      C.red2,
      xf(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8),
        [16.4 + Math.cos((30 * Math.PI) / 180) * 0.05, GY + 0.36, 8.3],
        [0, 30, 88],
      ),
    );
    for (let i = 0; i < 10; i++) {
      const r = rr(0.12, 0.32);
      const x = 15 + rr(-0.4, 3.2);
      const z = 6 + rr(0, 4.2);
      k.split(RT, xf(rockG(r, 900 + i, 0, 0.4), [x, GY + r * 0.25, z], [0, i * 40, 0], [1, 0.7, 1]), (_c, n) =>
        n.y > 0.6 ? (i % 3 ? C.stone3 : C.red1) : C.stone1,
      );
    }
    // a fallen lantern roof among the rubble
    k.put(
      RT,
      C.stone3,
      xf(prism2(ngon(6, 0.5, 0, 0), ngon(6, 0.12, 0, 0), 0, 0.3), [18.4, GY + 0.2, 9.0], [25, 10, 15]),
    );

    // sacred boulder bound with a shimenawa rope and paper shide
    const RX = 18.3;
    const RZ = 11.1;
    k.split("sacredRock", xf(rockG(1.25, 777, 1, 0.3), [RX, GY + 0.9, RZ], [0, 20, 0], [1, 0.85, 0.85]), (_c, n) =>
      n.y > 0.72 ? C.grass1 : n.y < -0.3 ? C.stone1 : n.x > 0.3 ? C.stone3 : C.stone2,
    );
    const loop: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      loop.push(V(RX + Math.cos(a) * 1.25, GY + 1.25 + Math.sin(a * 2) * 0.05, RZ + Math.sin(a) * 1.08));
    }
    for (let i = 0; i < 14; i++) k.put("sacredRock", C.rope1, rodG(loop[i], loop[i + 1], 0.1, 5, 0.1, true));
    for (const a of [1.0, 1.6, 2.2]) {
      const p = V(RX + Math.cos(a) * 1.31, GY + 1.18, RZ + Math.sin(a) * 1.13);
      k.put(
        "sacredRock",
        C.plaster1,
        xf(
          shapeG(
            [
              [-0.08, 0],
              [0.08, 0],
              [0.08, -0.12],
              [-0.02, -0.12],
              [-0.02, -0.24],
              [0.08, -0.24],
              [0.08, -0.38],
              [-0.08, -0.38],
              [-0.08, -0.26],
              [0.0, -0.26],
              [0.0, -0.1],
              [-0.08, -0.1],
            ],
            0.015,
          ),
          [p.x, p.y, p.z],
          [0, 90 - (a * 180) / Math.PI, 0],
        ),
      );
    }
    // ema prayer-plaque rack on the left
    const EX = -18.4;
    const EZ2 = 1.6;
    for (const s of [-1, 1]) {
      k.put("ema", C.stone2, block(0.3, 0.15, 0.3, [EX + s * 1.1, GY - 0.02, EZ2], 0.03));
      k.put("ema", C.wood1, box(0.12, 1.9, 0.12, [EX + s * 1.1, GY + 1.05, EZ2]));
    }
    for (const y of [0.85, 1.35, 1.85]) k.put("ema", C.wood0, box(2.4, 0.06, 0.06, [EX, GY + y, EZ2]));
    for (const s of [-1, 1])
      k.put(
        "ema",
        C.roof1,
        slabG([EX - 1.45, GY + 2.12, EZ2 + s * 0.02], [EX + 1.45, GY + 2.12, EZ2 + s * 0.02], 0.05, 0.01).translate(
          0,
          0,
          0,
        ),
      );
    k.put(
      "ema",
      C.roof1,
      xf(
        prism2(
          [
            [-1.45, -0.45],
            [1.45, -0.45],
            [1.45, 0.45],
            [-1.45, 0.45],
          ],
          [
            [-1.45, -0.02],
            [1.45, -0.02],
            [1.45, 0.02],
            [-1.45, 0.02],
          ],
          0,
          0.32,
        ),
        [EX, GY + 2.0, EZ2],
      ),
    );
    k.put("ema", C.roof3, box(3.0, 0.06, 0.08, [EX, GY + 2.33, EZ2]));
    const plaque: P2[] = [
      [-0.11, 0],
      [0.11, 0],
      [0.11, 0.12],
      [0, 0.18],
      [-0.11, 0.12],
    ];
    for (const [row, y] of [
      [0, 0.85],
      [1, 1.35],
      [2, 1.85],
    ] as const) {
      for (let i = 0; i < 8 - row; i++) {
        const x = EX - 0.95 + (i + row * 0.5) * 0.27;
        k.put(
          "ema",
          i % 4 === 1 ? C.wood1 : C.wood2,
          xf(shapeG(plaque, 0.02), [x, GY + y - 0.25, EZ2 + 0.06 + (i % 2) * 0.02], [0, 0, (i % 3) * 4 - 4]),
        );
        if (i % 3 === 0) k.put("ema", C.red1, box(0.12, 0.03, 0.025, [x, GY + y - 0.12, EZ2 + 0.08 + (i % 2) * 0.02]));
      }
    }

    // offering tables either side of the pagoda
    for (const s of [-1, 1]) {
      const ox = s * 4.9;
      const oz = PAG_Z + 3.6;
      k.put("offering", C.red1, box(1.3, 0.08, 0.62, [ox, TY + 0.78, oz]));
      k.put("offering", C.gold1, box(1.34, 0.03, 0.66, [ox, TY + 0.83, oz]));
      for (const [dx, dz] of [
        [-0.58, -0.24],
        [0.58, -0.24],
        [-0.58, 0.24],
        [0.58, 0.24],
      ])
        k.put("offering", C.red0, box(0.07, 0.75, 0.07, [ox + dx, TY + 0.375, oz + dz]));
      for (let i = 0; i < 4; i++)
        k.put(
          "offering",
          C.fruit,
          xf(new THREE.IcosahedronGeometry(0.08, 0), [
            ox - 0.38 + (i % 2) * 0.14,
            TY + 0.93 + (i === 3 ? 0.12 : 0),
            oz + (i < 2 ? -0.06 : 0.06),
          ]),
        );
      k.put("offering", C.plaster1, cyl(0.13, 0.12, 0.08, 8, [ox, TY + 0.86, oz]));
      k.put("offering", C.plaster1, cyl(0.1, 0.09, 0.07, 8, [ox, TY + 0.94, oz]));
      k.put("offering", C.fruit, xf(new THREE.IcosahedronGeometry(0.06, 0), [ox, TY + 1.05, oz]));
      for (const dx of [0.32, 0.46]) {
        k.put("offering", C.plaster1, cyl(0.06, 0.04, 0.28, 6, [ox + dx, TY + 0.86, oz]));
        k.put("offering", C.lacquer, cyl(0.025, 0.025, 0.06, 5, [ox + dx, TY + 1.14, oz]));
      }
    }

    // grass tufts on the open ground
    const R2 = rng(4242);
    let placed = 0;
    for (let tries = 0; tries < 400 && placed < 46; tries++) {
      const x = (R2() < 0.5 ? -1 : 1) * (12.7 + R2() * 7.1);
      const z = -1.9 + R2() * 14.3;
      if (x < 0 && Math.abs(x + 15.6) < 1.4) continue;
      if (x < 0 && z < 1.2 && Math.abs(x + 15.6) < 2.6) continue;
      if (x > 14.4 && x < 18.9 && z > -0.5 && z < 1.0) continue;
      for (const g of tuft([x, GY, z], 0.8 + R2() * 0.6, placed)) k.put("tufts", placed % 3 ? C.grass2 : C.grass0, g);
      placed++;
    }
    // blossom petals scattered on the fighting floor
    for (let i = 0; i < 40; i++) {
      const x = 5 + R2() * 7;
      const z = 4.2 + R2() * 7.6;
      k.put("petals", i % 2 ? C.bloom1 : C.bloom2, flake(V(x, FY + 0.012, z), 0.07, R2() * 360, 0));
    }
    for (let i = 0; i < 16; i++) {
      const x = -12 + R2() * 6;
      const z = 4.2 + R2() * 3;
      k.put("petals", C.pine1, flake(V(x, FY + 0.012, z), 0.05, R2() * 360, 0));
    }
    // moss creeping into the grout near the floor's edges, tufts along the front kerb
    for (let i = 0; i < 34; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (9.2 + R2() * 2.7);
      const z = 4.2 + R2() * 7.6;
      k.put("moss", i % 3 ? C.grass0 : C.grass1, flake(V(x, FY + 0.01, z), 0.09 + R2() * 0.06, R2() * 360, 0));
    }
    for (let i = 0; i < 14; i++) {
      const x = -11.5 + i * 1.75 + R2() * 0.6;
      if (Math.abs(x) < 3) continue;
      for (const g of tuft([x, GY, 12.5 + R2() * 0.08], 0.7, 100 + i)) k.put("tufts", i % 2 ? C.grass2 : C.grass0, g);
    }
  }

  k.flush();
  // rest pose: the gate doors stand open into the inner courtyard
  b.pose(doorL, { axis: [0, 1, 0], deg: -68 });
  b.pose(doorR, { axis: [0, 1, 0], deg: 68 });
  return b.root;
}
