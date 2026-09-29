// Blossom deer. A graceful forest deer whose antlers are flowering cherry branches, in a flat-colour, faceted
// low-poly style: no gradients and no noise anywhere, every colour is a solid fill and every texture an `svg()` of
// flat polygons (each petal and leaf is a light and a dark facet). The body is a faceted loft over a six-joint
// spine and neck with countershading and stuck cream spots; the legs come from `limb` with cloven hooves. Each
// antler is a three-joint bark beam that forks into a randomly grown tree of twigs; every twig carries blossom
// cards, leaf cards, faceted 3D blossoms and buds. A little nest with three eggs sits in one fork and a small
// bluebird perches on the other antler. Moss mounds with fern and flower cards grow along the back, and petals
// flutter all round.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, DEG, rng } from "../src/math";
import type { V3 } from "../src/math";
import { catmull } from "../src/path";
import type { Path } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Blossom Deer",
  description:
    "A forest deer whose antlers are flowering cherry branches: blossoms, buds, leaves, falling petals, a nest with eggs and a bluebird, moss on its back. Flat-colour faceted low-poly with SVG foliage.",
  builtBy: "Claude Sonnet 5.5",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour a flat fill.

const COAT = "#b47a44";
const COAT_BACK = "#8e5b32";
const LEG = "#7a5030";
const CREAM = "#f3e6c8";
const HOOF = "#2c2321";
const NOSE = "#241a18";
const EYE = "#120d0b";
const GLINT = "#ffffff";
const EAR_IN = "#eaa9a2";
const MOUTH = "#5a2429";
const TONGUE = "#dd7783";
const BARK = "#5f4038";
const BARK_LIGHT = "#8a6a5c";
const BARK_DARK = "#3f2b27";
const BUD = "#e5709e";
const CALYX = "#9a5a4c";
const STAMEN = "#f6d24a";
const MOSS_A = "#4f7a2e";
const MOSS_B = "#6b9a37";
const MOSS_C = "#8fbf47";
const NEST = "#8a6a3c";
const NEST_DARK = "#5e4526";
const NEST_LIGHT = "#b89058";
const EGG = "#9edbd3";
const EGG_B = "#b7e5df";
const BIRD = "#3f78c0";
const BIRD_DARK = "#27498a";
const BREAST = "#f0b568";
const BEAK = "#e59a34";
const CAP = "#c8412f";
const STEM = "#efe3c4";
const EYE_RING = "#d9b98a";

type Blossom = { a: string; b: string; vein: string; eye: string };
const PINK_1: Blossom = { a: "#f8c6d6", b: "#fbe0e9", vein: "#e0709a", eye: "#e8477f" };
const PINK_2: Blossom = { a: "#f6b0c7", b: "#f9cddb", vein: "#e0759c", eye: "#d63d76" };
const PINK_3: Blossom = { a: "#fff1f5", b: "#fbd9e4", vein: "#eba3bd", eye: "#e0608f" };
const WHITE_F: Blossom = { a: "#ffffff", b: "#e8f0d8", vein: "#c8d8a0", eye: "#f2c230" };

// ---------------------------------------------------------------------------------------------------------------
// SVG drawing helpers: flat polygons only.

type P = [number, number];
const n2 = (v: number) => v.toFixed(2);
const poly = (a: readonly P[], fill: string) =>
  `<polygon points="${a.map(([x, y]) => `${n2(x)},${n2(y)}`).join(" ")}" fill="${fill}"/>`;
const doc = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;

/** Local (u along, v across) to drawing coordinates: origin (cx, cy), u pointing `deg` clockwise from straight up. */
const frameAt = (cx: number, cy: number, deg: number) => {
  const a = deg * DEG;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  return (u: number, v: number): P => [cx + dx * u - dy * v, cy + dy * u + dx * v];
};

const ngon = (cx: number, cy: number, rad: number, n: number, rot = 0): P[] =>
  Array.from({ length: n }, (_, k): P => {
    const a = rot * DEG + (k / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  });

/** A five-petal blossom seen from the front: each notched petal a light and a dark half with a vein, a pistil, stamens. */
function blossomShapes(cx: number, cy: number, R: number, rot: number, c: Blossom) {
  let out = "";
  const W = R * 0.6;
  for (let k = 0; k < 5; k++) {
    const at = frameAt(cx, cy, rot + k * 72);
    out += poly([at(0, 0), at(R * 0.3, -W * 0.75), at(R * 0.72, -W), at(R * 0.98, -W * 0.42), at(R * 0.84, 0)], c.a);
    out += poly([at(0, 0), at(R * 0.84, 0), at(R * 0.98, W * 0.42), at(R * 0.72, W), at(R * 0.3, W * 0.75)], c.b);
    out += poly([at(R * 0.05, -R * 0.03), at(R * 0.62, 0), at(R * 0.05, R * 0.03)], c.vein);
  }
  out += poly(ngon(cx, cy, R * 0.17, 5, rot), c.eye);
  for (let k = 0; k < 5; k++) {
    const [sx, sy] = frameAt(cx, cy, rot + 36 + k * 72)(R * 0.34, 0);
    out += poly(ngon(sx, sy, R * 0.07, 4, 45), STAMEN);
  }
  return out;
}

const blossomSvg = (c: Blossom, rot: number) => svg(doc(32, 32, blossomShapes(16, 16, 15, rot, c)), { size: 128 });

/** One notched petal, root at the bottom edge. */
const petalSvg = (c: Blossom) =>
  svg(
    doc(
      16,
      24,
      poly(
        [
          [8, 24],
          [3, 18],
          [2, 8],
          [5, 2],
          [8, 6],
        ],
        c.a,
      ) +
        poly(
          [
            [8, 24],
            [8, 6],
            [11, 2],
            [14, 8],
            [13, 18],
          ],
          c.b,
        ) +
        poly(
          [
            [7.7, 23],
            [8, 9],
            [8.3, 23],
          ],
          c.vein,
        ),
    ),
    { size: 96 },
  );

/** A serrated pointed leaf: a light and a dark half along a pale midrib. */
function leafShape(at: (u: number, v: number) => P, L: number, W: number, light: string, dark: string, rib: string) {
  const n = 6;
  const side = (sgn: number) => {
    const pts: P[] = [at(0, 0)];
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      const w = W * Math.sin(Math.PI * Math.pow(u, 0.75)) * (i % 2 ? 0.78 : 1);
      pts.push(at(L * u, sgn * w));
    }
    return pts;
  };
  return poly(side(-1), light) + poly(side(1), dark) + poly([at(0, -0.35), at(L * 0.96, 0), at(0, 0.35)], rib);
}

type LeafPal = { light: string; dark: string; rib: string };
const FRESH: LeafPal = { light: "#8fc25a", dark: "#5f9a45", rib: "#cfe6a0" };
const BRONZE: LeafPal = { light: "#c98a4b", dark: "#8f5a35", rib: "#e8bd7c" };
const DEEP: LeafPal = { light: "#6aa84f", dark: "#3e7a3a", rib: "#a6d08a" };

/** A twig with leaves alternating up it. */
function leafSprig(seed: number, pal: LeafPal) {
  const r = rng(seed);
  let body = poly(
    [
      [15.3, 48],
      [16.7, 48],
      [16.3, 6],
      [15.7, 6],
    ],
    BARK,
  );
  const ys = [41, 32, 23, 14];
  ys.forEach((y, i) => {
    const s = i % 2 ? 1 : -1;
    body += leafShape(frameAt(16, y, s * (52 + r() * 16)), 14 - i * 1.4, 4.4, pal.light, pal.dark, pal.rib);
  });
  body += leafShape(frameAt(16, 9, 0), 13, 4.6, pal.light, pal.dark, pal.rib);
  return svg(doc(32, 48, body), { size: 128 });
}

/** A twig carrying three blossoms, two buds and a bronze leaf. */
function blossomSprig(seed: number) {
  const r = rng(seed);
  let body = poly(
    [
      [15, 48],
      [17, 48],
      [17.6, 34],
      [21, 22],
      [19.6, 21],
      [16.4, 33],
    ],
    BARK,
  );
  body += poly(
    [
      [16.6, 36],
      [16.4, 34],
      [9, 30],
      [9.4, 31.4],
    ],
    BARK,
  );
  body += leafShape(frameAt(17, 40, 60), 10, 3.4, BRONZE.light, BRONZE.dark, BRONZE.rib);
  body += leafShape(frameAt(16.6, 36, -70), 8, 3, FRESH.light, FRESH.dark, FRESH.rib);
  body += blossomShapes(10, 27, 7.5, r() * 70, PINK_1);
  body += blossomShapes(22, 18, 8, r() * 70, PINK_2);
  body += blossomShapes(15, 9, 7, r() * 70, PINK_3);
  for (const [x, y, d] of [
    [25, 31, 20],
    [6, 14, -25],
  ] as const) {
    const at = frameAt(x, y, d);
    body += poly([at(0, 0), at(1.6, -1.5), at(4.6, 0), at(1.6, 1.5)], BUD);
    body += poly([at(-0.6, 0), at(0.6, -1), at(0.6, 1)], CALYX);
  }
  return svg(doc(32, 48, body), { size: 160 });
}

/** A cushion of moss: overlapping flat hexagons in four greens. */
function mossSvg(seed: number) {
  const r = rng(seed);
  let body = "";
  for (let i = 0; i < 24; i++) {
    const x = 3 + r() * 26;
    const y = 22 - r() * 12;
    const rad = 2 + r() * 2.4;
    body += poly(ngon(x, y, rad, 6, 17), [MOSS_A, MOSS_B, MOSS_C, "#a3cc55"][Math.floor(r() * 4)]);
  }
  return svg(doc(32, 24, body), { size: 128 });
}

/** A fern frond: a rachis with paired pinnae, flat triangles in two greens. */
function fernSvg(seed: number) {
  const r = rng(seed);
  let body = poly(
    [
      [15, 48],
      [17, 48],
      [16.5, 2],
      [15.5, 2],
    ],
    "#3e6b2a",
  );
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const y = 44 - t * 40;
    const len = 12 * (1 - t) ** 0.7 + 2;
    const droop = 3 + r() * 2;
    for (const s of [-1, 1])
      body += poly(
        [
          [16, y],
          [16 + s * len, y - droop],
          [16, y - 5],
        ],
        (i + (s > 0 ? 1 : 0)) % 2 ? "#4f8a32" : "#7ab848",
      );
  }
  return svg(doc(32, 48, body), { size: 128 });
}

/** A moss cushion dotted with tiny star flowers. */
function mossBloomSvg(c: Blossom, seed: number) {
  const r = rng(seed);
  let body = "";
  for (let i = 0; i < 9; i++)
    body += poly(ngon(6 + r() * 20, 26 - r() * 5, 2.5 + r() * 2, 6, 17), [MOSS_A, MOSS_B][i % 2]);
  for (const [x, y] of [
    [8, 17],
    [17, 11],
    [24, 19],
    [13, 25],
  ] as const) {
    body += poly(
      [
        [x, 30],
        [x + 0.5, 30],
        [x + 0.3, y + 2],
        [x - 0.3, y + 2],
      ],
      "#4a7a2c",
    );
    body += blossomShapes(x, y, 4.2, r() * 70, c);
  }
  return svg(doc(32, 32, body), { size: 128 });
}

/** A tuft of fur: near-white blades in two shades, tinted by the card colour. */
function tuftSvg(seed: number) {
  const r = rng(seed);
  let body = "";
  for (let i = 0; i < 5; i++) {
    const x = 2.5 + i * 2.8;
    const tx = x + (r() - 0.5) * 6;
    body += poly(
      [
        [x - 3.2, 32],
        [x + 3.2, 32],
        [tx, 1 + r() * 8],
      ],
      i % 2 ? "#ffffff" : "#ece4cf",
    );
  }
  return svg(doc(16, 32, body), { size: 96 });
}

// ---------------------------------------------------------------------------------------------------------------
// 3D pieces: faceted, merged per colour so a cluster of blossoms is a few parts.

/** Unshared vertices so every triangle shades as one crisp facet. */
function facet<T extends THREE.BufferGeometry>(g: T): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g;
  n.computeVertexNormals();
  return n;
}

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ICO = facet(new THREE.IcosahedronGeometry(1, 0));
const OCTA = facet(new THREE.OctahedronGeometry(1, 0));
const CONE4 = facet(new THREE.ConeGeometry(1, 1, 4));

class Bag {
  private readonly m = new Map<string, number[]>();
  private out(c: string) {
    let a = this.m.get(c);
    if (!a) this.m.set(c, (a = []));
    return a;
  }
  tri(c: string, a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) {
    this.out(c).push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  }
  /** Both faces, so the winding never matters for thin sheets. */
  both(c: string, a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) {
    this.tri(c, a, b, d);
    this.tri(c, a, d, b);
  }
  /** A scaled, turned copy of an unindexed polyhedron. */
  solid(c: string, base: THREE.BufferGeometry, at: THREE.Vector3, scale: THREE.Vector3 | number, q?: THREE.Quaternion) {
    const s = typeof scale === "number" ? v3(scale, scale, scale) : scale;
    const pos = base.getAttribute("position");
    const o = this.out(c);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).multiply(s);
      if (q) v.applyQuaternion(q);
      v.add(at);
      o.push(v.x, v.y, v.z);
    }
  }
  parts(): [string, THREE.BufferGeometry][] {
    return [...this.m].map(([c, a]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
      g.computeVertexNormals();
      return [c, g];
    });
  }
}

/** A cupped five-petal blossom facing `dir`: notched petals in two tones round a pink pistil and yellow stamens. */
function blossom3(bag: Bag, at: THREE.Vector3, dir: THREE.Vector3, R: number, spin: number, c: Blossom) {
  const d = dir.clone().normalize();
  const u = new THREE.Vector3().crossVectors(d, Math.abs(d.y) < 0.9 ? v3(0, 1, 0) : v3(1, 0, 0)).normalize();
  const w = new THREE.Vector3().crossVectors(d, u);
  for (let k = 0; k < 5; k++) {
    const a = spin + (k * Math.PI * 2) / 5;
    const o = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
    const t = new THREE.Vector3().crossVectors(d, o);
    const pt = (x: number, y: number, z: number) =>
      at
        .clone()
        .addScaledVector(o, x * R)
        .addScaledVector(t, y * R)
        .addScaledVector(d, z * R);
    const p0 = pt(0.05, 0, 0);
    const p1 = pt(0.55, -0.42, 0.07);
    const p2 = pt(0.98, -0.22, 0.17);
    const p3 = pt(0.86, 0, 0.14);
    const p4 = pt(0.98, 0.22, 0.17);
    const p5 = pt(0.55, 0.42, 0.07);
    bag.both(c.a, p0, p1, p2);
    bag.both(c.a, p0, p2, p3);
    bag.both(c.b, p0, p3, p4);
    bag.both(c.b, p0, p4, p5);
  }
  bag.solid(c.eye, OCTA, at.clone().addScaledVector(d, R * 0.08), R * 0.22);
  bag.solid(STAMEN, OCTA, at.clone().addScaledVector(d, R * 0.22), R * 0.1);
}

/** A closed bud pointing along `dir`: a pink faceted oval on a dark calyx. */
function bud3(bag: Bag, at: THREE.Vector3, dir: THREE.Vector3, len: number) {
  const q = aim(dir);
  const d = dir.clone().normalize();
  bag.solid(BUD, ICO, at.clone().addScaledVector(d, len * 0.55), v3(len * 0.34, len * 0.55, len * 0.34), q);
  bag.solid(CALYX, CONE4, at.clone().addScaledVector(d, len * 0.12), v3(len * 0.3, len * 0.3, len * 0.3), q);
}

const distToSegment = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => {
  const ab = b.clone().sub(a);
  const t = Math.min(Math.max(p.clone().sub(a).dot(ab) / Math.max(ab.lengthSq(), 1e-9), 0), 1);
  return p.distanceTo(a.clone().addScaledVector(ab, t));
};

// ---------------------------------------------------------------------------------------------------------------

/** Change this one number to resize the whole head; joints move, never scale. */
const HEAD_SCALE = 1;

export default function build() {
  const b = createBuilder({ name: "blossomDeer" });

  // ---- Skeleton and body ---------------------------------------------------------------------------------------
  const stations = [
    { at: [0, 0.7, -0.55], w: 0.2, h: 0.28 },
    { at: [0, 0.72, -0.4], w: 0.32, h: 0.4 },
    { at: [0, 0.72, -0.12], w: 0.34, h: 0.4 },
    { at: [0, 0.74, 0.14], w: 0.33, h: 0.42 },
    { at: [0, 0.82, 0.33], w: 0.27, h: 0.37 },
    { at: [0, 0.89, 0.45], w: 0.19, h: 0.27 },
    { at: [0, 0.96, 0.54], w: 0.15, h: 0.21 },
    { at: [0, 1.01, 0.61], w: 0.125, h: 0.16 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const root = b.joint("hips", { at: stations[1].at, group: "body" });
  const spine = b.chain("spine", curve.slice(curve.knots[1], curve.knots[4]), {
    parent: root,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(curve.knots[4], 1), {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "body",
  });
  const belly = (t: number) => Math.sin(Math.PI * Math.min(Math.max((t - 0.08) / 0.45, 0), 1));
  const body = b.loft(stations, {
    bone: [root, spine, neck],
    color: COAT,
    sectors: [
      [-75, 75, COAT_BACK],
      [125, 235, CREAM],
    ],
    shift: (t) => [0, -0.04 * belly(t)],
    section: { ngon: 8 },
    group: "body",
  });

  // ---- Legs: straight front legs, hind legs with the hock behind, cloven hooves on the floor ----------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const front = b.chain(
      `legF${side}`,
      limb(
        [s * 0.11, 0.68, 0.3],
        [s * 0.115, 0.09, 0.34],
        [0.26, 0.24, 0.18],
        [
          [0, 0, -1],
          [0, 0, 1],
        ],
      ),
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "leg",
        group: `legF${side}`,
      },
    );
    b.sweep(front, (t) => [0.022 + 0.036 * Math.max(0, 1 - t / 0.45), 0.024 + 0.042 * Math.max(0, 1 - t / 0.45)], {
      section: { ngon: 6 },
      bands: [
        [0.5, COAT],
        [1, LEG],
      ],
      group: `legF${side}`,
    });
    const hind = b.chain(
      `legH${side}`,
      limb(
        [s * 0.13, 0.66, -0.4],
        [s * 0.13, 0.09, -0.46],
        [0.25, 0.25, 0.18],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      ),
      { parent: root, names: [`hip${side}`, `knee${side}`, `hock${side}`], role: "leg", group: `legH${side}` },
    );
    b.sweep(
      hind,
      (t) => {
        const thigh = Math.max(0, 1 - t / 0.45);
        return [0.024 + 0.05 * thigh, 0.026 + 0.08 * thigh];
      },
      {
        section: { ngon: 6 },
        bands: [
          [0.5, COAT],
          [1, LEG],
        ],
        group: `legH${side}`,
      },
    );
    for (const [leg, tag] of [
      [front, "F"],
      [hind, "H"],
    ] as const) {
      const ankle = leg.at(1).at;
      const hoof = b.joint(`hoof${tag}${side}`, {
        parent: leg.joints[2],
        at: ankle,
        aim: [ankle.x, 0, ankle.z + 0.02],
        group: `leg${tag}${side}`,
      });
      for (const h of [-1, 1])
        b.frustumBox(
          [ankle.x + h * 0.013, 0.09, ankle.z],
          [ankle.x + h * 0.013, 0, ankle.z],
          [0.02, 0.04],
          [0.022, 0.07],
          {
            bone: hoof,
            color: HOOF,
            group: `leg${tag}${side}`,
          },
        );
    }
  }

  // ---- Tail: a short white flag ---------------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.74, -0.52],
      [0, 0.78, -0.6],
      [0, 0.79, -0.68],
      [0, 0.75, -0.75],
    ]),
    { parent: root, names: ["tail1", "tail2", "tail3"], role: "tail", group: "tail" },
  );
  const tailTube = b.sweep(tail, (t) => [0.045 - 0.025 * t, 0.04 - 0.02 * t], {
    section: { ngon: 6 },
    bands: [
      [0.45, COAT],
      [1, CREAM],
    ],
    group: "tail",
  });
  b.cards(b.surface(tailTube).scatter(30, { rng: rng(3), minDist: 0.014, filter: (h) => h.at.z < -0.6 }), tuftSvg(2), {
    size: [0.03, 0.05],
    lean: 50,
    vary: 0.3,
    rng: rng(4),
    color: CREAM,
    flow: [0, -0.4, -1],
    name: "tailFluff",
  });

  // ---- Head ------------------------------------------------------------------------------------------------------
  const HEAD_DIR: V3 = [0, -0.42, 1];
  const skull = b.joint("head", {
    parent: neck.joints[2],
    at: curve.at(1),
    dir: HEAD_DIR,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, scale: HEAD_SCALE, quat: aim(HEAD_DIR, [0, 1, 0], "z") });
  b.loft(
    [
      { at: head.p([0, 0.03, -0.06]), w: head.s(0.17), h: head.s(0.19) },
      { at: head.p([0, 0.035, 0.05]), w: head.s(0.19), h: head.s(0.19) },
      { at: head.p([0, 0.01, 0.16]), w: head.s(0.13), h: head.s(0.13) },
      { at: head.p([0, 0.0, 0.25]), w: head.s(0.09), h: head.s(0.09) },
      { at: head.p([0, -0.005, 0.3]), w: head.s(0.08), h: head.s(0.08) },
    ],
    {
      bone: skull,
      color: COAT,
      sectors: [
        [120, 240, CREAM, 0, 0.84],
        [-179, 179, CREAM, 0.84, 1],
      ],
      section: { ngon: 6 },
      group: "head",
    },
  );
  head.part(facet(new THREE.SphereGeometry(1, 6, 4)), NOSE, {
    at: [0, -0.012, 0.302],
    scale: [0.045, 0.03, 0.03],
    group: "head",
  });
  // The palate, dark inside the mouth once the jaw drops.
  b.frustumBox(
    head.p([0, -0.058, 0.03]),
    head.p([0, -0.058, 0.29]),
    [head.s(0.08), head.s(0.008)],
    [head.s(0.05), head.s(0.008)],
    {
      bone: skull,
      color: MOUTH,
      group: "head",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.072, 0.0],
    aim: [0, -0.08, 0.27],
    role: "jaw",
    group: "jaw",
  });
  b.frustumBox(
    head.p([0, -0.078, 0.0]),
    head.p([0, -0.084, 0.27]),
    [head.s(0.08), head.s(0.032)],
    [head.s(0.05), head.s(0.026)],
    {
      bone: jaw,
      color: CREAM,
      group: "jaw",
    },
  );
  b.frustumBox(
    head.p([0, -0.06, 0.04]),
    head.p([0, -0.062, 0.2]),
    [head.s(0.045), head.s(0.008)],
    [head.s(0.03), head.s(0.008)],
    {
      bone: jaw,
      color: TONGUE,
      group: "jaw",
    },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Eyes: a dark faceted bead in a pale ring.
    const eyeAt = head.p([s * 0.09, 0.06, 0.04]);
    b.part(facet(new THREE.SphereGeometry(0.021, 6, 4)), EYE, { bone: skull, at: eyeAt, group: "head" });
    b.part(facet(new THREE.SphereGeometry(0.006, 4, 3)), GLINT, {
      bone: skull,
      at: head.p([s * 0.104, 0.07, 0.054]),
      group: "head",
    });
    b.part(facet(new THREE.CylinderGeometry(0.027, 0.027, 0.006, 7)), EYE_RING, {
      bone: skull,
      at: head.p([s * 0.086, 0.06, 0.036]),
      dir: head.d([s, 0.1, 0.3]),
      group: "head",
    });
    // Ears: large flat leaves, a paler pink inner leaf riding just in front.
    const base = head.p([s * 0.07, 0.1, -0.045]);
    const a = new THREE.Vector3(s * 0.75, 0.55, -0.35).normalize();
    const nrm = new THREE.Vector3(s * 0.5, 0.2, 0.85);
    nrm.addScaledVector(a, -nrm.dot(a)).normalize();
    const yv = new THREE.Vector3().crossVectors(nrm, a);
    const ear = b.joint(`ear${side}`, { parent: skull, at: base, dir: a, role: "hinge", group: "head" });
    const outline: P[] = [
      [0, -0.02],
      [0.045, -0.05],
      [0.105, -0.062],
      [0.165, -0.03],
      [0.205, 0],
      [0.165, 0.035],
      [0.105, 0.056],
      [0.045, 0.04],
      [0, 0.02],
    ];
    b.extrude(outline, {
      at: base,
      x: a,
      y: yv,
      thickness: 0.012,
      bevel: 0.003,
      color: COAT,
      bone: ear,
      group: "head",
    });
    b.extrude(
      outline.map(([x, y]): P => [x * 0.8 + 0.012, y * 0.6]),
      {
        at: base.clone().addScaledVector(nrm, 0.0065),
        x: a,
        y: yv,
        thickness: 0.004,
        color: EAR_IN,
        bone: ear,
        group: "head",
      },
    );
  }

  // ---- Coat details --------------------------------------------------------------------------------------------
  const skin = b.surface(body);
  const dot = facet(new THREE.CylinderGeometry(0.026, 0.03, 0.01, 6));
  const rs = rng(5);
  for (const hit of skin.scatter(80, {
    rng: rs,
    minDist: 0.07,
    filter: (h) => h.at.z > -0.52 && h.at.z < 0.3 && h.n.y > -0.05 && h.n.y < 0.86,
  }))
    b.stick(dot, CREAM, hit, { embed: 0.5, scale: 0.7 + rs() * 0.7, spin: rs() * 60 });
  const rump = skin.around([0, 0.72, -0.4]).at(180, 6);
  if (rump)
    b.stick(facet(new THREE.CylinderGeometry(0.075, 0.085, 0.012, 8)), CREAM, rump, {
      embed: 0.5,
      spin: 10,
      name: "rumpPatch",
    });

  // Throat ruff and neck mane: fur tufts standing off the skin.
  const ruff = skin.scatter(45, {
    rng: rng(6),
    minDist: 0.034,
    filter: (h) => h.at.z > 0.3 && h.n.y < 0.35 && h.at.y > 0.74,
  });
  b.cards(ruff, [tuftSvg(11), tuftSvg(12)], {
    size: [0.045, 0.055],
    lean: 66,
    vary: 0.25,
    rng: rng(7),
    color: CREAM,
    name: "ruff",
  });
  const mane = skin.scatter(60, {
    rng: rng(8),
    minDist: 0.03,
    filter: (h) => h.at.z > 0.34 && h.n.y > 0.5 && h.at.y > 0.84,
  });
  b.cards(mane, [tuftSvg(13), tuftSvg(14)], {
    size: [0.04, 0.06],
    lean: 58,
    vary: 0.3,
    rng: rng(9),
    color: COAT_BACK,
    name: "mane",
  });

  // ---- Moss mounds along the back with ferns and star flowers ------------------------------------------------
  const mound = facet(new THREE.IcosahedronGeometry(1, 0)).clone().scale(1, 0.5, 1);
  const rm = rng(21);
  const mossMeshes: THREE.Mesh[] = [];
  for (const hit of skin.scatter(16, {
    rng: rm,
    minDist: 0.085,
    filter: (h) => h.n.y > 0.8 && h.at.z > -0.4 && h.at.z < 0.3 && Math.abs(h.at.x) < 0.11,
  }))
    mossMeshes.push(
      b.stick(mound, [MOSS_A, MOSS_B, MOSS_C][Math.floor(rm() * 3)], hit, {
        embed: 0.3,
        scale: 0.05 + rm() * 0.045,
        spin: rm() * 90,
        group: "moss",
      }).mesh,
    );
  const mossSkin = b.surface(mossMeshes);
  b.cards(mossSkin.scatter(130, { rng: rng(22), minDist: 0.02, filter: (h) => h.n.y > 0 }), [mossSvg(1), mossSvg(2)], {
    size: [0.05, 0.035],
    lean: 68,
    vary: 0.3,
    rng: rng(23),
    name: "moss",
  });
  b.cards(mossSkin.scatter(12, { rng: rng(24), minDist: 0.05, filter: (h) => h.n.y > 0.2 }), fernSvg(3), {
    size: [0.04, 0.1],
    bend: 40,
    vary: 0.3,
    rng: rng(25),
    cross: true,
    name: "ferns",
  });
  b.cards(
    mossSkin.scatter(36, { rng: rng(26), minDist: 0.035, filter: (h) => h.n.y > 0.2 }),
    [mossBloomSvg(WHITE_F, 4), mossBloomSvg(PINK_1, 5)],
    { size: [0.045, 0.045], lean: 55, cross: true, vary: 0.3, rng: rng(27), name: "mossFlowers" },
  );
  // A pair of toadstools among the moss.
  for (const hit of mossSkin.scatter(3, { rng: rng(28), minDist: 0.1, filter: (h) => h.n.y > 0.5 })) {
    const stem = b.stick(facet(new THREE.CylinderGeometry(0.007, 0.009, 0.03, 5)), STEM, hit, {
      embed: 0.2,
      group: "moss",
    });
    b.stick(facet(new THREE.SphereGeometry(1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2)), CAP, stem.moved([0, 0.02, 0]), {
      embed: 0,
      scale: 0.017,
      group: "moss",
    });
  }

  // ---- Antlers: cherry branches -----------------------------------------------------------------------------------
  const blossomTex = [blossomSvg(PINK_1, 5), blossomSvg(PINK_2, 30), blossomSvg(PINK_3, 50), blossomSvg(PINK_1, 65)];
  const leafTex = [leafSprig(31, FRESH), leafSprig(32, BRONZE), leafSprig(33, DEEP), leafSprig(34, FRESH)];
  const sprigTex = [blossomSprig(41), blossomSprig(42)];
  const cols = [PINK_1, PINK_2, PINK_3];

  const BEAM: V3[] = [
    [0, 0, 0],
    [0.04, 0.08, -0.03],
    [0.09, 0.17, -0.05],
    [0.15, 0.26, -0.03],
    [0.19, 0.34, 0.02],
    [0.2, 0.41, 0.06],
  ];
  /** No twig climbs above this height, so the antler tips (with their blossoms) end near 1.6 m. */
  const TOP = 1.55;
  const nestSide = 1;
  let nestAt: THREE.Vector3 | null = null;
  let birdPerch: THREE.Vector3 | null = null;
  const bagGroups: Array<{ joint: Joint; bag: Bag }> = [];
  const blossomFrames: Frame[] = [];
  const leafFrames: Frame[] = [];
  const sprigFrames: Frame[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const rr = rng(100 + (s > 0 ? 1 : 2));
    const crown = head.p([s * 0.055, 0.12, -0.035]);
    // Pedicle and coronet.
    b.rod(head.p([s * 0.05, 0.05, -0.02]), crown, [0.024, 0.02], {
      bone: skull,
      color: BARK_DARK,
      section: { ngon: 6 },
      group: "head",
    });
    b.part(facet(new THREE.IcosahedronGeometry(0.026, 0)), BARK_LIGHT, { bone: skull, at: crown, group: "head" });

    const beam = catmull(BEAM.map(([x, y, z]) => crown.clone().add(v3(s * x, y, z))));
    const chain = b.chain(`antler${side}`, beam, {
      parent: skull,
      count: 3,
      names: [`antler${side}1`, `antler${side}2`, `antler${side}3`],
      role: "fan",
      group: `antler${side}`,
    });
    b.sweep(chain, (t) => 0.02 * (1 - t) + 0.006, {
      section: { ngon: 5 },
      caps: { start: "flat", end: "point" },
      color: (t) => (Math.floor(t * 9) % 3 === 1 ? BARK_LIGHT : BARK),
      group: `antler${side}`,
    });
    const joints = chain.joints;
    const ends = [...joints.map((j) => j.at), beam.at(1)];
    const jointFor = (p: THREE.Vector3) => {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < joints.length; i++) {
        const d = distToSegment(p, ends[i], ends[i + 1]);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return joints[best];
    };
    const bags = joints.map((joint) => ({ joint, bag: new Bag() }));
    bagGroups.push(...bags);

    type Twig = { path: Path; depth: number };
    const twigs: Twig[] = [];
    const grow = (from: THREE.Vector3, dir: THREE.Vector3, len: number, r0: number, depth: number) => {
      const steps = depth === 1 ? 4 : 3;
      const pts = [from.clone()];
      const d = dir.clone().normalize();
      const p = from.clone();
      for (let i = 0; i < steps; i++) {
        d.add(v3((rr() - 0.5) * 0.5, 0.06 + (rr() - 0.5) * 0.2, (rr() - 0.5) * 0.5));
        d.y -= Math.max(0, p.y - (TOP - 0.12)) * 8;
        d.normalize();
        p.addScaledVector(d, len / steps);
        p.y = Math.min(p.y, TOP);
        pts.push(p.clone());
      }
      const path = catmull(pts);
      twigs.push({ path, depth });
      b.sweep(path, [r0, Math.max(0.0025, r0 * 0.4)], {
        section: { ngon: depth >= 2 ? 4 : 5 },
        caps: { start: "flat", end: "point" },
        color: BARK,
        group: `antler${side}`,
      });
      if (depth >= 3) return;
      const kids = depth === 1 ? 3 : 2;
      for (let k = 0; k < kids; k++) {
        const t0 = depth === 1 ? 0.35 : 0.5;
        const t = t0 + (0.85 - t0) * (k / kids) + rr() * 0.1;
        const at = path.at(t);
        const tg = path.tangentAt(t);
        const lateral = v3(s * ((k % 2 ? 1 : -0.6) + rr() * 0.4), (rr() - 0.3) * 0.4, (rr() - 0.5) * 1.6).normalize();
        const cd = tg
          .clone()
          .multiplyScalar(0.7)
          .addScaledVector(lateral, 0.8)
          .add(v3(0, 0.18, 0))
          .normalize();
        grow(at, cd, len * (0.52 + rr() * 0.2), r0 * 0.58, depth + 1);
      }
    };

    // Main tines off the beam, then a fork at the tip.
    const tines: Array<[number, [number, number, number], number]> = [
      [0.16, [1, 0.35, 0.15], 0.26],
      [0.3, [0.4, 0.3, 1], 0.22],
      [0.44, [-0.6, 0.45, -0.2], 0.22],
      [0.58, [1, 0.4, -0.5], 0.24],
      [0.72, [0.3, 0.5, 0.9], 0.2],
      [0.88, [0.3, 0.8, -0.2], 0.18],
    ];
    tines.forEach(([t, dv, len], i) => {
      if (s === nestSide && i === 1) return;
      grow(beam.at(t), v3(s * dv[0], dv[1], dv[2]), len, 0.011, 1);
    });
    if (s === nestSide) {
      // A cradle: two limbs from one point, with the nest sitting in the V.
      const at = beam.at(0.3);
      grow(at, v3(s * 0.9, 0.55, 0.3), 0.2, 0.008, 2);
      grow(at, v3(-s * 0.45, 0.6, 0.35), 0.18, 0.008, 2);
      nestAt = at.clone().add(v3(s * 0.045, 0.06, 0.03));
    }
    if (s === -nestSide) birdPerch = twigs.find((tw) => tw.depth === 1)?.path.at(0.6) ?? null;
    // Keep the nest and the bird clear of blossoms.
    const crowded = (p: THREE.Vector3) =>
      (nestAt !== null && p.distanceTo(nestAt) < 0.1) || (birdPerch !== null && p.distanceTo(birdPerch) < 0.09);

    // Blossoms, buds and leaves along every twig.
    for (const tw of twigs) {
      const samples = tw.depth === 1 ? [0.88] : tw.depth === 2 ? [0.55, 0.8, 1] : [0.4, 0.75, 1];
      for (const t of samples) {
        const at = tw.path.at(t);
        if (crowded(at)) continue;
        const tg = tw.path.tangentAt(t);
        const perp = new THREE.Vector3().crossVectors(tg, v3(rr() - 0.5, rr() - 0.5, rr() - 0.5)).normalize();
        const out = perp
          .addScaledVector(tg, 0.35)
          .add(v3(0, 0.25, 0))
          .normalize();
        blossomFrames.push(frame(at.clone(), out));
        const bag = bags[joints.indexOf(jointFor(at))].bag;
        const roll = rr();
        if (tw.depth >= 2 && roll < 0.55)
          blossom3(
            bag,
            at.clone().addScaledVector(out, 0.012),
            out,
            0.016 + rr() * 0.01,
            rr() * 6,
            cols[Math.floor(rr() * 3)],
          );
        else if (roll < 0.85) bud3(bag, at.clone(), out, 0.02 + rr() * 0.012);
      }
      if (tw.depth >= 2) {
        for (const t of [0.25, 0.55, 0.85]) {
          if (rr() < 0.4) continue;
          const at = tw.path.at(t);
          if (crowded(at)) continue;
          const tg = tw.path.tangentAt(t);
          leafFrames.push(
            frame(
              at.clone(),
              tg
                .clone()
                .add(v3((rr() - 0.5) * 1.2, 0.3, (rr() - 0.5) * 1.2))
                .normalize(),
            ),
          );
        }
        if (tw.depth === 3 && rr() < 0.5) {
          const at = tw.path.at(1);
          sprigFrames.push(
            frame(
              at.clone(),
              tw.path
                .tangentAt(1)
                .add(v3(0, 0.3, 0))
                .normalize(),
            ),
          );
        }
      }
    }
  }

  for (const { joint, bag } of bagGroups)
    for (const [colour, geo] of bag.parts()) b.part(geo, colour, { bone: joint, at: [0, 0, 0], group: "blossoms" });

  let k = 0;
  b.cards(blossomFrames, blossomTex, {
    size: [0.05, 0.05],
    lean: 25,
    cross: true,
    vary: 0.3,
    spin: 180,
    flow: () => [Math.cos(k * 2.4), 0.3, Math.sin(k++ * 2.4)],
    rng: rng(51),
    sink: 0.15,
    name: "blossoms",
  });
  b.cards(leafFrames, leafTex, {
    size: [0.045, 0.07],
    lean: 45,
    bend: 20,
    vary: 0.3,
    rng: rng(52),
    cross: true,
    name: "leaves",
  });
  b.cards(sprigFrames, sprigTex, {
    size: [0.055, 0.08],
    lean: 20,
    vary: 0.3,
    cross: true,
    rng: rng(53),
    name: "sprigs",
  });

  // ---- The nest, with three eggs ---------------------------------------------------------------------------------
  if (nestAt) {
    const c = nestAt;
    const NS = 1.5;
    b.lathe(
      (
        [
          [0, 0],
          [0.026, 0.002],
          [0.045, 0.014],
          [0.054, 0.03],
          [0.05, 0.036],
          [0.042, 0.032],
          [0.038, 0.02],
          [0, 0.014],
        ] as Array<[number, number]>
      ).map(([x, y]): [number, number] => [x * NS, y * NS]),
      { at: c, segments: 8, color: NEST, group: "nest" },
    );
    const rn = rng(61);
    for (const [ry, col] of [
      [0.03, NEST_DARK],
      [0.036, NEST_LIGHT],
    ] as const) {
      const loop = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const rad = (0.05 + (rn() - 0.5) * 0.008) * NS;
        return c.clone().add(v3(Math.cos(a) * rad, (ry + Math.sin(a * 2) * 0.004) * NS, Math.sin(a) * rad));
      });
      b.sweep(catmull(loop, { closed: true }), 0.0036, { section: { ngon: 4 }, color: col, group: "nest" });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rn();
      const from = c.clone().add(v3(Math.cos(a) * 0.05 * NS, 0.03 * NS, Math.sin(a) * 0.05 * NS));
      b.spike(from, v3(Math.cos(a), 0.3 + rn() * 0.5, Math.sin(a)), 0.04 + rn() * 0.03, 0.0024, {
        section: { ngon: 4 },
        color: i % 2 ? NEST_DARK : NEST_LIGHT,
        group: "nest",
      });
    }
    for (const [dx, dz, col] of [
      [-0.013, 0.004, EGG],
      [0.012, -0.007, EGG_B],
      [0.002, 0.016, EGG],
    ] as const)
      b.part(facet(new THREE.SphereGeometry(1, 6, 4)), col, {
        at: c.clone().add(v3(dx * NS, 0.03 * NS, dz * NS)),
        scale: [0.013 * NS, 0.017 * NS, 0.013 * NS],
        group: "nest",
      });
  }

  // ---- A tiny bluebird on the other antler ------------------------------------------------------------------------
  if (birdPerch) {
    const bag = new Bag();
    const K = 1.7;
    const o = birdPerch.clone().add(v3(0, 0.003, 0));
    const at = (x: number, y: number, z: number) => o.clone().add(v3(x * K, y * K, z * K));
    const size = (x: number, y: number, z: number) => v3(x * K, y * K, z * K);
    bag.solid(BIRD, ICO, at(0, 0.03, 0), size(0.022, 0.02, 0.036));
    bag.solid(BREAST, ICO, at(0, 0.026, 0.012), size(0.018, 0.016, 0.026));
    bag.solid(BIRD, ICO, at(0, 0.054, 0.028), 0.016 * K);
    bag.solid(BEAK, CONE4, at(0, 0.052, 0.05), size(0.006, 0.014, 0.006), aim([0, 0, 1]));
    for (const sx of [-1, 1]) {
      bag.solid(EYE, OCTA, at(sx * 0.011, 0.058, 0.034), 0.003 * K);
      bag.solid(BIRD_DARK, ICO, at(sx * 0.02, 0.034, -0.004), size(0.006, 0.014, 0.028));
      bag.solid(BEAK, CONE4, at(sx * 0.008, 0.008, 0), size(0.002, 0.012, 0.002));
    }
    bag.solid(BIRD_DARK, CONE4, at(0, 0.036, -0.048), size(0.01, 0.036, 0.004), aim([0, 0.15, -1]));
    const ends = birdPerch;
    const nearest = bagGroups
      .map((g) => g.joint)
      .reduce((best, j) => (j.at.distanceTo(ends) < best.at.distanceTo(ends) ? j : best));
    for (const [colour, geo] of bag.parts()) b.part(geo, colour, { bone: nearest, at: [0, 0, 0], group: "bird" });
  }

  // ---- Fluttering petals ---------------------------------------------------------------------------------------------
  const petalFrames: Frame[] = [];
  const rp = rng(71);
  const headTop = head.p([0, 0.25, 0]);
  let guard = 0;
  while (petalFrames.length < 110 && guard++ < 2000) {
    const around = petalFrames.length < 50;
    const p = around
      ? headTop.clone().add(v3((rp() - 0.5) * 0.95, (rp() - 0.5) * 0.6, (rp() - 0.5) * 0.7))
      : v3((rp() - 0.5) * 1.3, 0.02 + rp() * 1.25, -0.75 + rp() * 1.45);
    const inBody = Math.abs(p.x) < 0.34 && p.y < 1.25 && p.y > 0.5 && p.z > -0.7 && p.z < 0.75;
    const inLegs = Math.abs(p.x) < 0.2 && p.y < 0.5 && Math.abs(p.z) < 0.6;
    if (inBody || inLegs || p.y < 0.01 || p.y > 1.5 || p.distanceTo(headTop) < 0.09) continue;
    petalFrames.push(frame(p, v3((rp() - 0.5) * 0.9, 1, (rp() - 0.5) * 0.9).normalize()));
  }
  let pk = 0;
  b.cards(petalFrames, [petalSvg(PINK_1), petalSvg(PINK_2), petalSvg(PINK_3)], {
    size: [0.03, 0.04],
    lean: 80,
    vary: 0.3,
    sink: 0,
    rng: rng(72),
    flow: () => [Math.cos(pk * 1.7), 0, Math.sin(pk++ * 1.7)],
    name: "petals",
  });

  // ---- Rest pose ------------------------------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });
  b.pose(tail.joints[0], { axis: [1, 0, 0], deg: 18 });
  return b.root;
}
