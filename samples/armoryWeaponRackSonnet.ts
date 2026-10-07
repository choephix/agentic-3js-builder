import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { grain, mix, mottle, noise, paint, resolve, scales, smoothstep } from "../src/paint";
import type { ColorInput, Paint, Rgb as Rgb3 } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

type Rgb = string | Rgb3;
type Fill = string | Paint;

export const meta = {
  name: "Armory Weapon Rack",
  description:
    "A chunky hand-painted armory: timber rack with polearms, crossed swords, round and kite shields, a shelf of three helmets, a hinged chest, a weapon barrel, an armour stand and a grindstone on a cobbled plinth.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours) and hand-painted paints
const GOLD = "#f2b632";
const GOLD_D = "#a86f14";
const GOLD_L = "#ffe08a";
const IRON = "#59606e";
const IRON_D = "#2d3039";
const STEEL = "#aab4c4";
const LEATHER = "#6b4122";
const LEATHER_D = "#3c2312";
const RED = "#b3262b";
const RED_D = "#6e1218";
const BLUE = "#2658c8";
const BLUE_D = "#18367f";
const BLUE_L = "#5c8df0";
const WOOD_D = "#3f2616";
const CLOTH = "#e6d8b4";
const GLASS = "#ffb23e";
const BONE = "#e9dfc4";
const WATER = "#3b7ccc";
const BLACK = "#17120f";
const SACK = "#a98b57";

const FLOOR = 0.11; // top of the cobbled plinth
const WARM: Rgb = [1, 0.93, 0.78];
const SHADOW = "#1c1230";
const S_D = "#66748d";
const S_M = "#a7b4c9";
const S_L = "#eaf2fb";

/** A hand-painted finish: warm light on top faces, cool shadow under them and where things meet the floor. */
function shaded(base: ColorInput, k = 1) {
  return paint((p, n) => {
    let c = resolve(base, p, n);
    c = mix(c, WARM, Math.max(0, n.y) * 0.17 * k + Math.max(0, n.z) * 0.05 * k);
    c = mix(c, SHADOW, Math.max(0, -n.y) * 0.36 * k);
    c = mix(c, SHADOW, (1 - smoothstep(FLOOR, FLOOR + 0.8, p.y)) * 0.3 * k);
    return c;
  });
}

function wood(base: string, dark: string, axis: "x" | "y" | "z", seed = 1, size = 0.05) {
  const lit = mix(base, "#ff9a4a", 0.16);
  const light = mix(lit, "#ffe6b8", 0.14);
  return shaded(grain(mottle(lit, light, { size: 0.3, contrast: 0.6, seed }), mix(lit, dark, 0.5), { size, axis, seed }));
}

function metal(base: string, dark: string, seed = 3) {
  return shaded(mottle(base, dark, { size: 0.12, contrast: 0.32, seed }));
}

const brush = (c: Rgb, p: THREE.Vector3, amount: number, size = 0.07): Rgb =>
  mix(c, noise(p, size, 9) > 0.5 ? "#ffffff" : "#000000", Math.abs(noise(p, size, 9) - 0.5) * amount);

const wrap01 = (v: number) => ((v % 1) + 1) % 1;

/** Painted steel for an extruded blade: `edge` is 0 in the middle and 1 on the cutting edge. */
function steelPaint(thick: THREE.Vector3, edge: (x: number, y: number) => number) {
  return paint((p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return S_L;
    const e = Math.min(Math.max(edge(s[0], s[1]), 0), 1);
    let c: Rgb = mix(S_D, S_M, smoothstep(0, 0.35, e));
    c = mix(c, S_L, smoothstep(0.6, 0.95, e));
    return brush(c, p, 0.16);
  });
}

/** Painted steel for a swept spike or rod: facets light and dark round the section. */
function steelRod() {
  return paint((p, _n, s) => brush(mix(S_D, S_L, 0.5 + 0.5 * Math.cos(s[1] * DEG * 2 - 0.6)), p, 0.12));
}

const emblem = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M50 3 L91 15 V52 C91 77 71 91 50 98 C29 91 9 77 9 52 V15 Z" fill="#f2b632" stroke="#6e4a0c" stroke-width="3"/>
  <path d="M50 11 L83 21 V52 C83 72 66 83 50 90 C34 83 17 72 17 52 V21 Z" fill="#18367f"/>
  <path d="M50 11 L83 21 V52 C83 72 66 83 50 90 Z" fill="#2658c8"/>
  <g stroke="#6e7a90" stroke-width="9" stroke-linecap="round"><path d="M28 74 L72 30"/><path d="M72 74 L28 30"/></g>
  <g stroke="#eaf2fb" stroke-width="5" stroke-linecap="round"><path d="M28 74 L72 30"/><path d="M72 74 L28 30"/></g>
  <g stroke="#f2b632" stroke-width="7" stroke-linecap="round"><path d="M22 57 L36 71"/><path d="M78 57 L64 71"/></g>
  <circle cx="50" cy="52" r="12" fill="#f2b632" stroke="#6e4a0c" stroke-width="3"/>
  <path d="M50 42 L53 49 L60 50 L55 55 L56 62 L50 58 L44 62 L45 55 L40 50 L47 49 Z" fill="#b3262b"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "armoryRack", paintSize: 2048 });
  const root = b.joint("rack", { at: [0, 0, 0] });
  type Joint = typeof root;
  type P3 = [number, number, number];

  // -------------------------------------------------------------------------------------------------------------
  // Merged small flat-colour pieces: one part per colour and bone
  const bag = new Map<string, { color: string; bone: Joint; geos: THREE.BufferGeometry[] }>();
  function put(geo: THREE.BufferGeometry, color: string, m: THREE.Matrix4, bone: Joint = root) {
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
    const key = `${color}|${bone.name}`;
    let e = bag.get(key);
    if (!e) bag.set(key, (e = { color, bone, geos: [] }));
    e.geos.push(g);
    geo.dispose();
  }
  function flush() {
    for (const e of bag.values()) {
      const merged = mergeGeometries(e.geos);
      if (merged) b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0] });
    }
    bag.clear();
  }
  const dots = (pts: THREE.Vector3[], color: string, r = 0.014, bone: Joint = root) => {
    for (const q of pts) put(r < 0.02 ? new THREE.SphereGeometry(r, 4, 2) : new THREE.SphereGeometry(r, 6, 4), color, new THREE.Matrix4().makeTranslation(q.x, q.y, q.z), bone);
  };

  // -------------------------------------------------------------------------------------------------------------
  // A local frame: U along the object, W across, N = W x U (towards the viewer for objects built facing +Z)
  class Fr {
    readonly U = new THREE.Vector3();
    readonly W = new THREE.Vector3();
    readonly N = new THREE.Vector3();
    readonly q = new THREE.Quaternion();
    readonly O: THREE.Vector3;
    constructor(
      o: P3,
      u: P3,
      w: P3 = [1, 0, 0],
      public bone: Joint = root,
      readonly k = 1,
    ) {
      this.O = new THREE.Vector3(...o);
      this.U.set(...u).normalize();
      const ww = new THREE.Vector3(...w);
      ww.addScaledVector(this.U, -ww.dot(this.U));
      if (ww.lengthSq() < 1e-6) ww.set(0, 0, 1).addScaledVector(this.U, -this.U.z);
      this.W.copy(ww).normalize();
      this.N.crossVectors(this.W, this.U);
      this.q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(this.W, this.U, this.N));
    }
    p(a = 0, w = 0, n = 0) {
      const k = this.k;
      return this.O.clone().addScaledVector(this.U, a * k).addScaledVector(this.W, w * k).addScaledVector(this.N, n * k);
    }
    local(p: THREE.Vector3) {
      const d = p.clone().sub(this.O);
      return { a: d.dot(this.U) / this.k, w: d.dot(this.W) / this.k, n: d.dot(this.N) / this.k };
    }
    quat(rot?: P3) {
      const q = this.q.clone();
      if (rot) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
      return q;
    }
    /** A flat-colour piece merged into the bag; geometry axes: x = W, y = U, z = N. */
    put(geo: THREE.BufferGeometry, color: string, at: P3 = [0, 0, 0], rot?: P3, scale: number | P3 = 1) {
      const s = (typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale)).multiplyScalar(this.k);
      put(geo, color, new THREE.Matrix4().compose(this.p(...at), this.quat(rot), s), this.bone);
    }
    part(geo: THREE.BufferGeometry, color: Fill, at: P3 = [0, 0, 0], rot?: P3, scale?: number | P3, name?: string) {
      const sc = scale === undefined ? this.k : typeof scale === "number" ? scale * this.k : (scale.map((v) => v * this.k) as P3);
      return b.part(geo, color, { at: this.p(...at), quat: this.quat(rot), scale: sc, bone: this.bone, name });
    }
    rod(a0: number, a1: number, r: number | [number, number], color: Fill, w = 0, n = 0, sides = 8) {
      const rr = typeof r === "number" ? r * this.k : ([r[0] * this.k, r[1] * this.k] as [number, number]);
      return b.rod(this.p(a0, w, n), this.p(a1, w, n), rr, { color, sides, bone: this.bone });
    }
    ext(
      outline: OutlinePoint[],
      at: P3,
      thickness: number | [number, number],
      color: Fill,
      o: { bevel?: number; smoothing?: number; name?: string } = {},
    ) {
      const k = this.k;
      const out = k === 1 ? outline : scaleOutline(outline, k);
      const th = typeof thickness === "number" ? thickness * k : ([thickness[0] * k, thickness[1] * k] as [number, number]);
      const opts = { ...o, bevel: o.bevel === undefined ? undefined : o.bevel * k };
      return b.extrude(out, { at: this.p(...at), x: this.U, y: this.W, thickness: th, color, bone: this.bone, ...opts });
    }
    /** A lathe round U at the frame origin; the outline is in the frame's design units. */
    lathe(outline: OutlinePoint[], o: { segments?: number; color: Fill; name?: string; smoothing?: number }) {
      return b.lathe(scaleOutline(outline, this.k), { at: this.O, axis: this.U, bone: this.bone, ...o });
    }
    /** An extrude whose `at`, `x` and `y` are model-space (the outline, thickness and bevel scale with the frame). */
    extX(
      outline: OutlinePoint[],
      o: { at: THREE.Vector3; x: THREE.Vector3; y: THREE.Vector3; thickness: number; bevel?: number; smoothing?: number; color: Fill; name?: string },
    ) {
      return b.extrude(scaleOutline(outline, this.k), {
        ...o,
        thickness: o.thickness * this.k,
        bevel: o.bevel === undefined ? undefined : o.bevel * this.k,
        bone: this.bone,
      });
    }
    /** A ring (torus) lying round the U axis. */
    ring(a: number, R: number, r: number, color: string, w = 0, n = 0, seg = 10) {
      this.put(new THREE.TorusGeometry(R, r, 4, seg), color, [a, w, n], [90, 0, 0]);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // World-aligned helpers
  const box = (
    w: number,
    h: number,
    d: number,
    color: Fill,
    at: P3,
    o: { rot?: P3; bone?: Joint; name?: string } = {},
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: o.rot, bone: o.bone ?? root, name: o.name });
  const rect = (w: number, d: number, c: number): OutlinePoint[] => [
    [-w / 2 + c, -d / 2],
    [w / 2 - c, -d / 2],
    [w / 2, -d / 2 + c],
    [w / 2, d / 2 - c],
    [w / 2 - c, d / 2],
    [-w / 2 + c, d / 2],
    [-w / 2, d / 2 - c],
    [-w / 2, -d / 2 + c],
  ];
  function scaleOutline(o: OutlinePoint[], k: number, cx = 0, cy = 0): OutlinePoint[] {
    return o.map((q) => (q.length === 3 ? [cx + (q[0] - cx) * k, cy + (q[1] - cy) * k, "sharp"] : [cx + (q[0] - cx) * k, cy + (q[1] - cy) * k]));
  }

  // =============================================================================================================
  // PLINTH AND RUG
  const RUG_Z = 0.58;
  b.extrude(rect(4.9, 2.1, 0.14), {
    at: [0, 0.03, 0.2],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.06,
    bevel: 0.014,
    color: "#4d4b5a",
    bone: root,
    name: "plinthBase",
  });
  b.extrude(rect(4.6, 1.8, 0.1), {
    at: [0, 0.085, 0.2],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.05,
    bevel: 0.01,
    color: "#6a6877",
    bone: root,
    name: "plinthTop",
  });
  {
    // cobbles are painted on a one-sided plane so the paint sheet is spent on the visible face only
    const outline = rect(4.56, 1.76, 0.1);
    const shape = new THREE.Shape();
    outline.forEach((q, i) => (i === 0 ? shape.moveTo(q[0], q[1]) : shape.lineTo(q[0], q[1])));
    shape.closePath();
    b.part(new THREE.ShapeGeometry(shape), shaded(
        ((cobble) =>
          paint((p, n) => {
            const c = resolve(cobble, p, n);
            const m = smoothstep(0.56, 0.7, noise(p, 0.45, 7)) * 0.65;
            return mix(c, noise(p, 0.05, 2) > 0.5 ? "#5f9a3e" : "#47802f", m);
          }))(scales(["#8a8896", "#9a98a6", "#7a7886", "#85808a"], "#2b2a38", { size: 0.24, width: 0.045, seed: 8 })),
      ), {
      at: [0, FLOOR + 0.0015, 0.2],
      rotation: [-90, 0, 0],
      bone: root,
      name: "cobbles",
    });
  }
  b.extrude(rect(1.72, 0.92, 0.03), {
    at: [0, FLOOR + 0.007, RUG_Z],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.014,
    bevel: 0.004,
    bone: root,
    name: "rug",
    color: paint((p, n) => {
      if (n.y < 0.5) return RED_D;
      const x = p.x;
      const z = p.z - RUG_Z;
      const d = Math.min(0.86 - Math.abs(x), 0.46 - Math.abs(z));
      if (d < 0.03) return GOLD;
      if (d < 0.07) return BLUE_D;
      if (d < 0.09) return GOLD_D;
      if (d < 0.13) return RED_D;
      const dia = Math.abs(x) / 0.36 + Math.abs(z) / 0.2;
      if (dia < 0.35) return GOLD;
      if (dia < 0.75) return BLUE;
      if (dia < 0.9) return GOLD_D;
      const chk = (Math.floor((x + 3) / 0.1) + Math.floor((z + 3) / 0.1)) % 2;
      return brush(chk ? mix(RED, "#000000", 0.0) : mix(RED, "#7a1a20", 0.45), p, 0.2, 0.03);
    }),
  });
  // rug fringe
  for (const s of [1, -1])
    for (let i = 0; i < 16; i++)
      put(new THREE.BoxGeometry(0.02, 0.008, 0.05), i % 2 ? CLOTH : GOLD_L, new THREE.Matrix4().makeTranslation(s * 0.89, FLOOR + 0.006, RUG_Z - 0.4 + i * 0.053));

  // =============================================================================================================
  // RACK FRAME
  const PZ = -0.38; // rack depth centre
  const POST_X = 1.62;
  const POST_H = 2.62;
  const HEAD_Y = 2.3; // underside of the header beam
  for (const s of [1, -1]) {
    const x = s * POST_X;
    box(0.28, POST_H, 0.3, wood("#6b4224", "#33200f", "y", 2 + s, 0.05), [x, FLOOR + POST_H / 2, PZ], { name: `post${s > 0 ? "L" : "R"}` });
    // carved fluting down the front
    for (const dx of [-0.07, 0.07]) box(0.014, POST_H - 0.3, 0.006, WOOD_D, [x + dx, FLOOR + POST_H / 2, PZ + 0.152]);
    // gold inlay on the post face
    put(new THREE.OctahedronGeometry(0.075), GOLD, new THREE.Matrix4().compose(new THREE.Vector3(x, FLOOR + 1.72, PZ + 0.155), new THREE.Quaternion(), new THREE.Vector3(1, 1.5, 0.22)));
    put(new THREE.OctahedronGeometry(0.04), RED, new THREE.Matrix4().compose(new THREE.Vector3(x, FLOOR + 1.72, PZ + 0.166), new THREE.Quaternion(), new THREE.Vector3(1, 1.5, 0.22)));
    for (const dy of [-0.2, 0.2]) put(new THREE.SphereGeometry(0.018, 5, 3), GOLD, new THREE.Matrix4().makeTranslation(x, FLOOR + 1.72 + dy, PZ + 0.158));
    // iron bands with rivets
    for (const y of [0.34, 1.2, 2.05]) {
      box(0.32, 0.12, 0.34, metal(IRON, IRON_D, 5), [x, FLOOR + y, PZ]);
      dots(
        [-0.11, 0.11].flatMap((dx) => [new THREE.Vector3(x + dx, FLOOR + y, PZ + 0.175)]),
        STEEL,
        0.017,
      );
    }
    // foot runner and braces
    box(0.3, 0.14, 0.95, wood("#5a3720", "#2c1a0c", "z", 8), [x, FLOOR + 0.07, PZ + 0.03], { name: "runner" });
    for (const dz of [1, -1]) {
      b.extrude(
        [
          [0, 0],
          [0.5, 0],
          [0.5, 0.06],
          [0.06, 0.62, "sharp"],
          [0, 0.62],
        ],
        {
          at: [x, FLOOR + 0.14, PZ + dz * 0.15],
          x: [0, 0, dz],
          y: [0, 1, 0],
          thickness: 0.16,
          bevel: 0.018,
          color: wood("#5e3a1f", "#2c1a0c", "y", 11),
          bone: root,
          name: "brace",
        },
      );
      dots([new THREE.Vector3(x - 0.05, FLOOR + 0.3, PZ + dz * 0.15 + dz * 0.2), new THREE.Vector3(x + 0.05, FLOOR + 0.3, PZ + dz * 0.15 + dz * 0.2)], GOLD, 0.016);
    }
    // gold finial
    b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.17, 0.03],
        [0.11, 0.06],
        [0.11, 0.1],
        [0.075, 0.13],
        [0.13, 0.2],
        [0.12, 0.27],
        [0.06, 0.36],
        [0, 0.44, "sharp"],
      ],
      {
        at: [x, FLOOR + POST_H, PZ],
        segments: 8,
        color: shaded(gradientGold()),
        bone: root,
        name: "finial",
      },
    );
  }
  function gradientGold() {
    return paint((p, n, s) => {
      const h = s[0];
      const stripe = Math.abs(Math.sin(h * 70)) < 0.08;
      return brush(stripe ? GOLD_D : mix(GOLD_D, GOLD_L, smoothstep(0.0, 0.3, 1 - Math.abs(n.y - 0.2)) * 0.9), p, 0.1);
    });
  }

  // sill and dark backing wall
  box(2.96, 0.22, 0.3, wood("#5d3a20", "#2a180b", "x", 13), [0, FLOOR + 0.11, PZ], { name: "sill" });
  box(2.98, 2.2, 0.03, WOOD_D, [0, FLOOR + 0.1 + 1.1, PZ - 0.05], { name: "backing" });

  // back planks
  const plankStyles: Array<[string, string]> = [
    ["#7a4a28", "#3b2312"],
    ["#8a5a30", "#44281a"],
    ["#6e4425", "#341f10"],
  ];
  const nails: THREE.Vector3[] = [];
  for (let i = 0; i < 15; i++) {
    const x = -1.4 + i * 0.2;
    const [base, dark] = plankStyles[(i * 7) % 3];
    const h = 2.06 + ((i * 5) % 3) * 0.0;
    box(0.19, h, 0.06, wood(base, dark, "y", 20 + i, 0.04), [x, FLOOR + 0.22 + h / 2, PZ - 0.05], { name: `plank${i}` });
    for (const y of [0.55, 1.15, 1.75, 2.2]) nails.push(new THREE.Vector3(x + ((i * 13) % 5 - 2) * 0.012, FLOOR + y, PZ - 0.018));
  }
  dots(nails, IRON_D, 0.012);

  // header beam with a crowning peak
  b.extrude(
    [
      [-2.0, 0.36],
      [-1.94, 0.0, "sharp"],
      [1.94, 0.0, "sharp"],
      [2.0, 0.36],
      [1.6, 0.36],
      [1.2, 0.41],
      [0.75, 0.47],
      [0.47, 0.64],
      [0.0, 0.74],
      [-0.47, 0.64],
      [-0.75, 0.47],
      [-1.2, 0.41],
      [-1.6, 0.36],
    ],
    {
      at: [0, HEAD_Y, PZ],
      thickness: 0.2,
      x: [1, 0, 0],
      y: [0, 1, 0],
      bevel: 0.02,
      color: wood("#6d4325", "#2f1b0c", "x", 30, 0.06),
      bone: root,
      name: "header",
    },
  );
  // gold-trimmed lower edge and upturned end caps
  box(3.9, 0.05, 0.24, paint((p) => brush(mix(GOLD_D, GOLD, 0.5 + 0.5 * Math.sin(p.x * 22)), p, 0.1)), [0, HEAD_Y + 0.02, PZ], { name: "headerTrim" });
  for (const s of [1, -1]) {
    b.spike([s * 1.94, HEAD_Y + 0.33, PZ], [s * 0.35, 1, 0], 0.26, 0.07, { color: metal(GOLD, GOLD_D, 70), sides: 6, bone: root, name: "headerHorn" });
    dots([new THREE.Vector3(s * 1.94, HEAD_Y + 0.33, PZ + 0.1)], GOLD_D, 0.035);
  }
  b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { at: [0, HEAD_Y + 0.4, PZ + 0.106], texture: emblem, bone: root, name: "plaque" });
  // gusset brackets under the header
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.42, 0],
        [0.42, 0.05],
        [0.06, 0.42, "sharp"],
        [0, 0.42],
      ],
      {
        at: [s * (POST_X - 0.14), HEAD_Y, PZ + 0.1],
        x: [-s, 0, 0],
        y: [0, -1, 0],
        thickness: 0.07,
        bevel: 0.012,
        color: metal(IRON, IRON_D, 7),
        bone: root,
        name: "gusset",
      },
    );

  // =============================================================================================================
  // LEFT BAY: POLEARM RAILS
  const POLE_Z = -0.12;
  const POLE_X = [-1.33, -1.1, -0.87, -0.64];
  for (const y of [0.55, 1.45]) {
    box(1.03, 0.13, 0.24, wood("#6b4224", "#2f1b0c", "x", 40 + Math.round(y * 10)), [-0.98, FLOOR + y, PZ + 0.1], { name: "poleRail" });
    for (const x of [-1.47, -0.5]) box(0.05, 0.17, 0.28, metal(IRON, IRON_D, 4), [x, FLOOR + y, PZ + 0.1]);
    for (const x of POLE_X) {
      // iron loop round each shaft
      put(
        new THREE.TorusGeometry(0.052, 0.012, 5, 12),
        IRON,
        new THREE.Matrix4().compose(new THREE.Vector3(x, FLOOR + y, POLE_Z), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)),
      );
      put(new THREE.BoxGeometry(0.05, 0.05, 0.06), IRON_D, new THREE.Matrix4().makeTranslation(x, FLOOR + y, POLE_Z - 0.06));
    }
  }

  const shaftPaint = (seed: number) => wood("#7a4c28", "#3a2312", "y", seed, 0.035);
  const wrapPaint = (len: number) =>
    paint((p, _n, s) => brush(wrap01(s[0] * len / 0.035 + s[1] / 360) < 0.5 ? mix(LEATHER, "#a06b36", 0.4) : LEATHER_D, p, 0.1, 0.03));
  function poleShaft(x: number, top: number, withWrap = true) {
    b.rod([x, FLOOR, POLE_Z], [x, top, POLE_Z], 0.03, { color: shaftPaint(Math.round(x * 10) + 60), sides: 8, bone: root, name: "shaft" });
    b.rod([x, FLOOR, POLE_Z], [x, FLOOR + 0.12, POLE_Z], 0.036, { color: metal(IRON, IRON_D, 6), sides: 8, bone: root, name: "ferrule" });
    if (withWrap) b.rod([x, 0.95, POLE_Z], [x, 1.32, POLE_Z], 0.038, { color: wrapPaint(0.37), sides: 8, bone: root, name: "wrap" });
  }
  const collar = (f: Fr, a: number, len = 0.1, r = 0.046) => {
    f.put(new THREE.CylinderGeometry(r, r * 1.08, len, 8), GOLD, [a, 0, 0]);
    f.put(new THREE.CylinderGeometry(r * 1.2, r * 1.2, 0.02, 8), GOLD_D, [a + len / 2, 0, 0]);
  };

  /** A bearded axe blade swept towards -W (s = -1) or +W, its attach point at a = 0. */
  function axeBlade(f: Fr, size: number, side: number) {
    const k = size;
    const outline: OutlinePoint[] = [
      [0.3 * k, -0.03 * side],
      [0.34 * k, -0.16 * side],
      [0.3 * k, -0.28 * side, "sharp"],
      [0.17 * k, -0.235 * side],
      [0.08 * k, -0.215 * side],
      [0.0, -0.26 * side],
      [-0.1 * k, -0.32 * side, "sharp"],
      [-0.13 * k, -0.15 * side],
      [-0.05 * k, -0.03 * side],
    ];
    if (side < 0) outline.reverse();
    const edge = (_x: number, y: number) => (Math.abs(y) - 0.05) / 0.2;
    const blade = f.ext(outline, [0, 0, 0], 0.035, steelPaint(f.N, edge), { bevel: 0.01, name: "axeBlade" });
    // gold inlay rivets
    dots([f.p(0.2 * k, side * 0.0 - 0.0 * side, 0.025), f.p(0.09 * k, -0.0, 0.025)].map((v) => v), GOLD, 0.016, f.bone);
    return blade;
  }

  // 1: halberd
  {
    const x = POLE_X[0];
    const top = 1.93;
    poleShaft(x, top);
    const f = new Fr([x, top, POLE_Z], [0, 1, 0]);
    collar(f, -0.02);
    b.spike(f.p(0.03), f.U, 0.46, 0.04, { color: steelRod(), sides: 4, bone: root, name: "halberdSpike" });
    f.put(new THREE.OctahedronGeometry(0.04), GOLD_D, [0.03, 0, 0], undefined, [1.1, 0.8, 1.1]);
    axeBlade(f, 1.3, -1);
    // back hook
    f.ext(
      [
        [0.04, 0.02],
        [0.12, 0.1],
        [0.2, 0.2, "sharp"],
        [0.1, 0.1],
        [0.0, 0.03],
      ],
      [0.03, 0, 0],
      0.03,
      steelPaint(f.N, (_x, y) => 1 - Math.abs(y) * 4),
      { bevel: 0.008, name: "halberdHook" },
    );
    // langets
    for (const dn of [-1, 1]) f.put(new THREE.BoxGeometry(0.014, 0.4, 0.012), IRON, [-0.25, 0, dn * 0.032]);
    for (const dw of [-1, 1]) f.put(new THREE.BoxGeometry(0.012, 0.4, 0.014), IRON, [-0.25, dw * 0.032, 0]);
  }

  // 2: spear with a leaf blade and a red tassel
  {
    const x = POLE_X[1];
    const top = 2.0;
    poleShaft(x, top);
    const f = new Fr([x, top, POLE_Z], [0, 1, 0]);
    collar(f, -0.03, 0.14, 0.044);
    const prof = (
      [
        [0, 0.04],
        [0.1, 0.1],
        [0.2, 0.108],
        [0.31, 0.075],
        [0.43, 0],
      ] as Array<[number, number]>
    ).map(([a, h]): [number, number] => [a * 1.3, h * 1.3]);
    const outline: OutlinePoint[] = [
      ...prof.map(([a, h]) => [a, h] as OutlinePoint),
      ...prof
        .slice(1, -1)
        .reverse()
        .map(([a, h]) => [a, -h] as OutlinePoint),
      [0, -0.052],
    ];
    outline[prof.length - 1] = [0.43 * 1.3, 0, "sharp"];
    const hwAt = (a: number) => {
      for (let i = 1; i < prof.length; i++)
        if (a <= prof[i][0]) return prof[i - 1][1] + ((prof[i][1] - prof[i - 1][1]) * (a - prof[i - 1][0])) / (prof[i][0] - prof[i - 1][0]);
      return 0.001;
    };
    f.ext(outline, [0.04, 0, 0], 0.032, steelPaint(f.N, (xx, y) => (Math.abs(y) < 0.012 ? 0.0 : Math.abs(y) / hwAt(xx))), { bevel: 0.012, name: "spearBlade" });
    f.put(new THREE.BoxGeometry(0.018, 0.44, 0.044), S_D, [0.26, 0, 0.018]);
    // tassel
    b.spike(f.p(-0.34), f.U, 0.2, 0.065, { color: RED, sides: 6, bone: root, name: "tassel" });
    f.ring(-0.3, 0.045, 0.012, GOLD);
    f.ring(-0.16, 0.04, 0.01, GOLD);
    b.spike(f.p(-0.34), [0, -1, 0], 0.1, 0.04, { color: RED_D, sides: 6, bone: root, name: "tasselTip" });
  }

  // 3: glaive with a curved single-edged blade
  {
    const x = POLE_X[2];
    const top = 1.94;
    poleShaft(x, top);
    const f = new Fr([x, top, POLE_Z], [0, 1, 0]);
    collar(f, -0.03, 0.14, 0.044);
    f.ext(
      scaleOutline(
        [
          [0, -0.04],
          [0, 0.04],
          [0.08, 0.11],
          [0.2, 0.15],
          [0.34, 0.13],
          [0.46, 0.08],
          [0.6, -0.02, "sharp"],
          [0.46, -0.03],
          [0.25, -0.05],
        ],
        1.25,
      ),
      [0.03, 0, 0],
      0.032,
      steelPaint(f.N, (_x, y) => (y + 0.025) / 0.17),
      { bevel: 0.01, name: "glaiveBlade" },
    );
    f.put(new THREE.BoxGeometry(0.02, 0.66, 0.046), IRON, [0.36, -0.06, 0]);
    dots([f.p(0.15, 0.02, 0.022), f.p(0.28, 0.04, 0.022), f.p(0.4, 0.03, 0.022)], GOLD, 0.014, f.bone);
    for (const dn of [-1, 1]) f.put(new THREE.BoxGeometry(0.014, 0.38, 0.012), IRON, [-0.24, 0, dn * 0.032]);
    // blue pennon under the blade
    b.extrude(
      [
        [0, 0],
        [0.2, 0.0],
        [0.26, -0.04],
        [0.2, -0.08],
        [0.0, -0.1],
      ],
      { at: f.p(-0.1, 0.03, 0), x: f.W, y: f.U, thickness: 0.006, color: BLUE, bone: root, name: "pennon" },
    );
  }

  // 4: war hammer
  {
    const x = POLE_X[3];
    const top = 1.7;
    poleShaft(x, top);
    const f = new Fr([x, top, POLE_Z], [0, 1, 0]);
    collar(f, -0.02, 0.12, 0.046);
    const hamPaint = metal("#6a7587", "#3a4254", 12);
    f.part(new THREE.BoxGeometry(0.2, 0.2, 0.17), hamPaint, [0.1, 0.11, 0.0], undefined, undefined, "hammerHead");
    f.part(new THREE.BoxGeometry(0.215, 0.07, 0.185), metal(GOLD_D, "#6b4309", 13), [0.1, 0.11, 0.0]);
    f.put(new THREE.BoxGeometry(0.215, 0.025, 0.19), GOLD, [0.105, 0.19, 0]);
    f.put(new THREE.BoxGeometry(0.215, 0.025, 0.19), GOLD, [0.105, 0.03, 0]);
    b.spike(f.p(0.03, -0.1, 0), [-1, 0, 0], 0.26, 0.045, { color: steelRod(), sides: 4, bone: root, name: "hammerBeak" });
    b.spike(f.p(0.2), f.U, 0.26, 0.04, { color: steelRod(), sides: 4, bone: root, name: "hammerTop" });
    dots([f.p(0.2, 0.08, 0.1), f.p(0.2, 0.17, 0.1), f.p(0.02, 0.08, 0.1), f.p(0.02, 0.17, 0.1)], STEEL, 0.016, f.bone);
    // leather grip straps hanging from the head
    f.put(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), LEATHER_D, [-0.25, 0.0, 0.05]);
  }

  // =============================================================================================================
  // ROUND SHIELDS
  function roundShield(f: Fr, R: number, A: string, B: string, trim: string, sparkle = true) {
    const rimColor = metal("#7b8497", "#3a4254", 21);
    b.lathe(
      [
        [0, 0],
        [R, 0],
        [R, R * 0.09],
        [R * 0.75, R * 0.125],
        [R * 0.3, R * 0.19],
        [0, R * 0.21],
      ],
      {
        at: f.O,
        axis: f.U,
        segments: 20,
        bone: f.bone,
        name: "shieldDish",
        color: paint((p, n) => {
          const l = f.local(p);
          const r = Math.hypot(l.w, l.n);
          if (Math.abs(n.dot(f.U)) < 0.5) return LEATHER_D;
          if (n.dot(f.U) < 0) return LEATHER;
          let c: Rgb;
          if (r > R * 0.86) c = mix(trim, "#000000", 0.15);
          else if (Math.abs(r - R * 0.8) < R * 0.022) c = mix(GOLD_D, "#000000", 0.1);
          else if (Math.abs(l.w) < R * 0.09 || Math.abs(l.n) < R * 0.09) c = mix(trim, "#ffffff", 0.1);
          else if (r < R * 0.22) c = mix(trim, "#000000", 0.1);
          else c = mix(l.w > 0 !== l.n > 0 ? A : B, SHADOW, 0.0);
          c = mix(c, SHADOW, smoothstep(R * 0.2, R * 0.85, r) * 0.1);
          return brush(c, p, 0.14, 0.06);
        }),
      },
    );
    // steel rim and boss
    f.part(new THREE.TorusGeometry(R, R * 0.085, 5, 24), rimColor, [R * 0.04, 0, 0], [90, 0, 0], undefined, "shieldRim");
    f.part(new THREE.SphereGeometry(R * 0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), metal("#8d97aa", "#4a5368", 22), [R * 0.19, 0, 0], undefined, [1, 0.8, 1], "shieldBoss");
    b.spike(f.p(R * 0.36), f.U, R * 0.22, R * 0.05, { color: steelRod(), sides: 6, bone: f.bone });
    f.put(new THREE.TorusGeometry(R * 0.2, R * 0.03, 5, 14), GOLD, [R * 0.2, 0, 0], [90, 0, 0]);
    if (sparkle) {
      for (let i = 0; i < 14; i++) {
        const t = (i / 14) * Math.PI * 2;
        f.put(new THREE.SphereGeometry(R * 0.04, 4, 2), GOLD, [R * 0.1, Math.cos(t) * R * 1.0, Math.sin(t) * R * 1.0]);
      }
      for (let i = 0; i < 8; i++) {
        const t = (i / 8) * Math.PI * 2 + Math.PI / 8;
        f.put(new THREE.SphereGeometry(R * 0.035, 4, 2), STEEL, [R * 0.17, Math.cos(t) * R * 0.5, Math.sin(t) * R * 0.5]);
      }
    }
  }
  // big shield on the back wall, under the banner
  const bigShield = new Fr([0, 1.5, PZ + 0.015], [0, 0, 1], [1, 0, 0]);
  roundShield(bigShield, 0.42, BLUE_D, RED_D, GOLD);

  // valance banners hanging under the header
  b.rod([-0.98, HEAD_Y - 0.03, PZ + 0.15], [0.98, HEAD_Y - 0.03, PZ + 0.15], 0.022, { color: GOLD_D, sides: 6, bone: root, name: "bannerRod" });
  dots([new THREE.Vector3(-1.0, HEAD_Y - 0.03, PZ + 0.15), new THREE.Vector3(1.0, HEAD_Y - 0.03, PZ + 0.15)], GOLD, 0.04);
  for (const [cx, field] of [
    [-0.62, BLUE],
    [0, RED],
    [0.62, BLUE],
  ] as Array<[number, string]>) {
    const hw = 0.23;
    const len = 0.46;
    // pennant as a cut cloth with swallow-tail
    b.extrude(
      [
        [-hw, 0],
        [hw, 0],
        [hw, -len],
        [0, -len + 0.14, "sharp"],
        [-hw, -len],
      ],
      {
        at: [cx, HEAD_Y - 0.04, PZ + 0.14],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        color: paint((p, _n, s) => {
          const x = s[0];
          const y = s[1];
          const bottom = -len + 0.14 * (1 - Math.abs(x) / hw) - 0.0;
          const edge = Math.min(hw - Math.abs(x), -y, (y - bottom) * 0.7);
          if (edge < 0.028) return GOLD;
          if (edge < 0.04) return GOLD_D;
          const dia = Math.abs(x) + Math.abs(y + 0.17) * 0.75;
          if (dia < 0.085) return GOLD;
          if (dia < 0.115) return GOLD_D;
          return brush(mix(field, "#000000", 0.0), p, 0.12, 0.05);
        }),
        bone: root,
        name: "pennant",
      },
    );
    // gold tassel
    b.spike([cx, HEAD_Y - 0.04 - len + 0.13, PZ + 0.15], [0, -1, 0], 0.09, 0.03, { color: GOLD, sides: 6, bone: root });
    dots([new THREE.Vector3(cx, HEAD_Y - 0.04 - len + 0.14, PZ + 0.15)], GOLD_D, 0.03);
  }

  // =============================================================================================================
  // HELMET SHELF
  const SHELF_Y = 0.82;
  box(1.4, 0.06, 0.4, wood("#74492a", "#2f1b0c", "x", 70), [0, SHELF_Y - 0.03, PZ + 0.02], { name: "shelf" });
  box(1.4, 0.04, 0.03, paint((p) => brush(GOLD_D, p, 0.2)), [0, SHELF_Y - 0.03, PZ + 0.225], { name: "shelfTrim" });
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.3, 0],
        [0.3, 0.05],
        [0.06, 0.3, "sharp"],
        [0, 0.3],
      ],
      {
        at: [s * 0.55, SHELF_Y - 0.31, PZ + 0.0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.06,
        bevel: 0.01,
        color: wood("#5d3a20", "#2a180b", "y", 71),
        bone: root,
        name: "shelfBracket",
      },
    );
  dots([new THREE.Vector3(-0.64, SHELF_Y + 0.003, PZ + 0.2), new THREE.Vector3(0.64, SHELF_Y + 0.003, PZ + 0.2), new THREE.Vector3(0, SHELF_Y + 0.003, PZ + 0.2)], GOLD, 0.015);

  const HK = 1.2;
  const helmY = SHELF_Y;
  const helmZ = -0.24;
  // painted dome helper shared by helmets
  const domePaint = (f: Fr, tone: [string, string], extra: (l: { a: number; w: number; n: number }, n: THREE.Vector3) => Rgb | null) =>
    paint((p, n) => {
      const l = f.local(p);
      const x = extra(l, n);
      if (x) return x;
      let c: Rgb = mix(tone[1], tone[0], smoothstep(0.0, 0.3, l.a) * 0.9 + (n.y > 0 ? 0.15 : 0));
      c = mix(c, SHADOW, smoothstep(0.0, 0.7, -n.x * 0.3 + 0.0) * 0.0);
      return brush(c, p, 0.14, 0.05);
    });

  // H1: great helm with a blue crest
  {
    const f = new Fr([-0.4, helmY, helmZ], [0, 1, 0], [1, 0, 0], root, HK);
    f.lathe(
      [
        [0, 0],
        [0.125, 0],
        [0.15, 0.03],
        [0.155, 0.13],
        [0.15, 0.21],
        [0.125, 0.28],
        [0.07, 0.315],
        [0, 0.325],
      ],
      {
        segments: 10,
        name: "greatHelm",
        color: domePaint(f, ["#b3bfd3", "#5e6b83"], (l, n) => {
          const front = n.dot(f.N) > 0.45;
          if (front && l.a > 0.145 && l.a < 0.18 && Math.abs(l.w) < 0.1) return mix(BLACK, "#000000", 0);
          if (front && l.a > 0.185 && l.a < 0.205 && Math.abs(l.w) < 0.11) return GOLD;
          if (front && l.a > 0.125 && l.a < 0.145 && Math.abs(l.w) < 0.11) return GOLD;
          if (front && Math.abs(l.w) < 0.016 && l.a > 0.05) return GOLD;
          if (front && l.a < 0.12 && l.w > 0.03 && l.w < 0.12) {
            const gx = wrap01(l.w / 0.03);
            const gy = wrap01(l.a / 0.03);
            if (Math.hypot(gx - 0.5, gy - 0.5) < 0.22 && l.a > 0.02) return BLACK;
          }
          if (l.a < 0.028) return GOLD_D;
          return null;
        }),
      },
    );
    // crest: swept-back blue plume
    f.extX(
      [
        [0.11, 0.3],
        [0.135, 0.41],
        [0.06, 0.52],
        [-0.08, 0.55],
        [-0.22, 0.49],
        [-0.28, 0.36],
        [-0.18, 0.3],
      ],
      {
        at: f.p(0, 0, 0),
        x: f.N,
        y: f.U,
        thickness: 0.05,
        bevel: 0.016,
        smoothing: 1,
        color: paint((p, _n, s) => {
          const ang = Math.atan2(s[1] - 0.26, s[0] + 0.06);
          const t = Math.sin(ang * 34) * 0.5 + 0.5;
          const c = mix(BLUE, BLUE_L, smoothstep(0.22, 0.55, s[1]) * 0.8);
          return brush(mix(c, BLUE_D, t * 0.35), p, 0.1, 0.04);
        }),
        name: "plume",
      },
    );
    f.put(new THREE.CylinderGeometry(0.03, 0.04, 0.05, 8), GOLD, [0.31, 0, 0]);
    for (let i = 0; i < 10; i++) {
      const t = (i / 10) * Math.PI * 2;
      f.put(new THREE.SphereGeometry(0.013, 4, 2), STEEL, [0.04, Math.cos(t) * 0.152, Math.sin(t) * 0.152]);
    }
  }

  // H2: horned war helm
  {
    const f = new Fr([0, helmY, helmZ], [0, 1, 0], [1, 0, 0], root, HK);
    f.lathe(
      [
        [0, 0.01],
        [0.14, 0.01],
        [0.155, 0.05],
        [0.15, 0.12],
        [0.13, 0.2],
        [0.08, 0.255],
        [0, 0.28],
      ],
      {
        segments: 10,
        name: "hornedHelm",
        color: domePaint(f, ["#6a6f7e", "#2f323e"], (l) => {
          if (l.a < 0.06) return brush(mix(GOLD_D, GOLD, 0.4), new THREE.Vector3(l.w, l.a, l.n), 0.2, 0.03);
          if (Math.abs(l.w) < 0.03 && l.a > 0.06) return RED;
          if (Math.abs(l.w) < 0.037 && l.a > 0.06) return RED_D;
          return null;
        }),
      },
    );
    // nasal guard and cheek plates
    f.put(new THREE.BoxGeometry(0.04, 0.17, 0.014), "#7d869a", [0.0, 0, 0.155]);
    f.part(new THREE.BoxGeometry(0.05, 0.1, 0.02), metal("#7d869a", "#3d4457", 25), [-0.04, 0, 0.155]);
    for (const s of [1, -1])
      f.extX(
        [
          [-0.09, 0.06],
          [0.09, 0.06],
          [0.1, 0.0],
          [0.06, -0.1],
          [0.0, -0.14],
          [-0.07, -0.08],
        ],
        {
          at: f.p(0, s * 0.158, 0),
          x: f.N,
          y: f.U,
          thickness: 0.016,
          bevel: 0.004,
          color: metal("#7d869a", "#3d4457", 26),
          name: "cheek",
        },
      );
    // curling bone horns
    for (const s of [1, -1]) {
      b.sweep(bezier(f.p(0.13, s * 0.13, 0), f.p(0.2, s * 0.19, 0.0), f.p(0.34, s * 0.2, 0.02), f.p(0.5, s * 0.12, -0.01)), [0.05 * HK, 0.005], {
        color: paint((p, _n, t) => (wrap01(t[0] * 7) < 0.82 ? brush(mix(BONE, "#c9b98f", t[0]), p, 0.1, 0.03) : "#6b5b3b")),
        sides: 7,
        caps: { start: "flat", end: "point" },
        bone: root,
        name: "horn",
      });
      f.put(new THREE.CylinderGeometry(0.058, 0.066, 0.045, 7), GOLD_D, [0.125, s * 0.145, 0], [0, 0, -s * 75]);
    }
    // top spikes
    for (let i = 0; i < 4; i++) f.put(new THREE.ConeGeometry(0.02, 0.08, 5), STEEL, [0.29 - i * 0.025 + (i === 0 ? -0.04 : 0), 0, -0.1 + i * 0.07 - 0.0], [60 * (i - 1.5) * -0.3, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      f.put(new THREE.SphereGeometry(0.012, 4, 2), STEEL, [0.04, Math.cos(t) * 0.158, Math.sin(t) * 0.158]);
    }
  }

  // H3: winged paladin helm
  {
    const f = new Fr([0.4, helmY, helmZ], [0, 1, 0], [1, 0, 0], root, HK);
    f.lathe(
      [
        [0, 0.01],
        [0.135, 0.01],
        [0.15, 0.05],
        [0.145, 0.14],
        [0.12, 0.22],
        [0.065, 0.27],
        [0, 0.285],
      ],
      {
        segments: 10,
        name: "wingedHelm",
        color: domePaint(f, ["#dfe7f3", "#8c99b2"], (l) => {
          if (l.a < 0.055) return brush(GOLD, new THREE.Vector3(l.w, l.a, l.n), 0.2, 0.03);
          if (Math.abs(l.w) < 0.014 && l.a > 0.05) return GOLD;
          if (Math.abs(l.w) < 0.02 && l.a > 0.05) return GOLD_D;
          return null;
        }),
      },
    );
    f.put(new THREE.BoxGeometry(0.036, 0.15, 0.014), GOLD, [0.0, 0, 0.155]);
    f.put(new THREE.SphereGeometry(0.022, 6, 4), BLUE_L, [0.2, 0, 0.14]);
    f.put(new THREE.OctahedronGeometry(0.03), GOLD, [0.2, 0, 0.138], undefined, [1, 1.4, 0.5]);
    // neck guard
    f.extX(
      [
        [-0.13, 0],
        [0.13, 0],
        [0.11, -0.07],
        [0.0, -0.09],
        [-0.11, -0.07],
      ],
      {
        at: f.p(0.02, 0, -0.13),
        x: f.W,
        y: f.U,
        thickness: 0.014,
        bevel: 0.004,
        color: metal("#aeb9cc", "#5e6b83", 27),
        name: "neckGuard",
      },
    );
    // wings: three feather layers per side
    for (const s of [1, -1]) {
      const normal = new THREE.Vector3(s, 0, 0);
      for (let i = 0; i < 4; i++) {
        const th = (12 + i * 20) * DEG;
        const d = new THREE.Vector3().addScaledVector(f.N, -Math.cos(th)).addScaledVector(f.U, Math.sin(th));
        const yDir = new THREE.Vector3().crossVectors(normal, d);
        if (yDir.dot(f.U) < 0) yDir.negate();
        const len = 0.34 - i * 0.03;
        f.extX(
          [
            [0, 0],
            [len * 0.35, 0.06],
            [len * 0.8, 0.055],
            [len, 0.0, "sharp"],
            [len * 0.8, -0.04],
            [len * 0.35, -0.045],
          ],
          {
            at: f.p(0.19 + i * 0.012, s * 0.165 + s * i * 0.003, -0.02 + i * 0.003),
            x: d,
            y: yDir,
            thickness: 0.01,
            bevel: 0.003,
            smoothing: 1,
            color: paint((p, _n, t) => brush(Math.abs(t[1] - 0.008) < 0.006 ? GOLD_D : mix(GOLD, GOLD_L, 0.5 + 0.5 * Math.sin(t[0] * 20 + i)), p, 0.1, 0.03)),
            name: "wingFeather",
          },
        );
      }
    }
    for (let i = 0; i < 10; i++) {
      const t = (i / 10) * Math.PI * 2;
      f.put(new THREE.SphereGeometry(0.011, 4, 2), GOLD, [0.04, Math.cos(t) * 0.152, Math.sin(t) * 0.152]);
    }
  }

  // =============================================================================================================
  // SWORD BUILDER
  function sword(
    f: Fr,
    o: { L: number; hw: number; guardW?: number; grip?: number; wrap?: Fill; trim?: string; gem?: string; thick?: number; name?: string },
  ) {
    const { L, hw } = o;
    const guardW = o.guardW ?? 0.3;
    const grip = o.grip ?? 0.24;
    const trim = o.trim ?? GOLD;
    const prof: Array<[number, number]> = [
      [0, hw],
      [0.55, hw * 0.9],
      [0.82, hw * 0.62],
      [1, 0],
    ];
    const hwAt = (x: number) => {
      const t = x / L;
      for (let i = 1; i < prof.length; i++)
        if (t <= prof[i][0]) return prof[i - 1][1] + ((prof[i][1] - prof[i - 1][1]) * (t - prof[i - 1][0])) / (prof[i][0] - prof[i - 1][0]);
      return 0.001;
    };
    const outline: OutlinePoint[] = [
      [0, hw],
      [0.55 * L, hw * 0.9],
      [0.82 * L, hw * 0.62],
      [L, 0, "sharp"],
      [0.82 * L, -hw * 0.62],
      [0.55 * L, -hw * 0.9],
      [0, -hw],
    ];
    const steel = paint((p, n, s) => {
      if (Math.abs(n.dot(f.N)) < 0.5) return S_L;
      const x = s[0];
      const r = Math.min(Math.abs(s[1]) / Math.max(hwAt(x), 0.001), 1);
      let c: Rgb;
      if (r > 0.62) c = mix(S_M, S_L, smoothstep(0.62, 0.95, r));
      else if (r > 0.2 && x > 0.04 * L && x < 0.85 * L) c = mix(S_D, S_M, 0.35 + r);
      else if (r < 0.06) c = S_L;
      else c = S_M;
      if (Math.abs(x / L - 0.25 + s[1] * 3.2) < 0.03 && r < 0.9) c = mix(c, "#ffffff", 0.35);
      return brush(c, p, 0.12);
    });
    f.ext(outline, [0.045, 0, 0], o.thick ?? 0.024, steel, { bevel: 0.007, name: o.name ?? "blade" });
    // ricasso, guard and quillons
    f.put(new THREE.BoxGeometry(hw * 1.9, 0.06, 0.04), trim, [0.035, 0, 0]);
    f.put(new THREE.BoxGeometry(guardW, 0.052, 0.058), trim, [0, 0, 0]);
    f.put(new THREE.BoxGeometry(guardW * 0.7, 0.018, 0.064), GOLD_L, [0.0, 0, 0]);
    for (const s of [1, -1]) {
      f.put(new THREE.SphereGeometry(0.036, 5, 3), trim, [0, s * guardW * 0.5, 0]);
      f.put(new THREE.ConeGeometry(0.03, 0.12, 5), trim, [0.05, s * (guardW * 0.5 - 0.01), 0]);
    }
    f.put(new THREE.SphereGeometry(0.026, 6, 5), o.gem ?? BLUE_L, [0, 0, 0.033]);
    // grip, pommel
    f.rod(-grip, -0.01, 0.026, o.wrap ?? wrapPaint(grip), 0, 0, 6);
    f.ring(-0.05, 0.03, 0.01, trim);
    f.ring(-grip + 0.02, 0.03, 0.01, trim);
    f.put(new THREE.SphereGeometry(0.055, 6, 4), trim, [-grip - 0.035, 0, 0]);
    f.put(new THREE.SphereGeometry(0.022, 6, 4), o.gem ?? BLUE_L, [-grip - 0.035, 0, 0.05]);
  }

  // =============================================================================================================
  // RIGHT BAY: CROSSED SWORDS, BOW AND QUIVER
  {
    const swordSpecs: Array<{ low: [number, number]; dir: [number, number]; z: number; opts: Parameters<typeof sword>[1] }> = [
      { low: [0.66, 1.33], dir: [0.609, 0.793], z: PZ + 0.04, opts: { L: 0.9, hw: 0.052, guardW: 0.3, trim: GOLD, gem: BLUE_L, name: "longsword" } },
      {
        low: [1.44, 1.33],
        dir: [-0.609, 0.793],
        z: PZ + 0.075,
        opts: { L: 0.8, hw: 0.075, guardW: 0.34, trim: GOLD_D, gem: RED, wrap: LEATHER, name: "broadsword", thick: 0.028 },
      },
    ];
    // heraldic board behind the crossing
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.215, 0.015],
        [0.2, 0.03],
        [0, 0.03],
      ],
      { at: [1.05, 1.78, PZ + 0.02], axis: [0, 0, 1], segments: 14, color: wood("#5d3a20", "#2a180b", "x", 120), bone: root, name: "emblemBoard" },
    );
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { at: [1.05, 1.78, PZ + 0.054], texture: emblem, bone: root, name: "emblemDisc" });
    for (const sp of swordSpecs) {
      const u: P3 = [sp.dir[0], sp.dir[1], 0];
      const w: P3 = [u[1], -u[0], 0];
      const o: P3 = [sp.low[0] + u[0] * 0.3, sp.low[1] + u[1] * 0.3, sp.z];
      const f = new Fr(o, u, w);
      sword(f, sp.opts);
      // iron mounting straps pinning the blade to the wall
      const reach = sp.z - (PZ - 0.02);
      for (const a of [0.22, 0.7]) {
        f.put(new THREE.BoxGeometry(0.17, 0.045, 0.012), IRON, [a, 0, 0.022]);
        for (const s of [1, -1]) f.put(new THREE.BoxGeometry(0.022, 0.045, reach + 0.02), IRON, [a, s * 0.08, -reach / 2 + 0.01]);
        dots([f.p(a, 0.06, 0.03), f.p(a, -0.06, 0.03)], STEEL, 0.011, f.bone);
      }
    }

    // bow lying on two pegs
    const bowZ = PZ + 0.04;
    const bowPts = [
      [0.5, 1.16, bowZ],
      [0.58, 1.06, bowZ],
      [0.76, 1.15, bowZ],
      [1.0, 1.22, bowZ],
      [1.24, 1.15, bowZ],
      [1.42, 1.06, bowZ],
      [1.5, 1.16, bowZ],
    ];
    b.sweep(catmull(bowPts), (t) => 0.012 + 0.016 * Math.exp(-(((t - 0.5) / 0.1) ** 2)), {
      color: paint((p, _n, s) => {
        if (Math.abs(s[0] - 0.5) < 0.05) return mix(LEATHER, LEATHER_D, wrap01(s[0] * 120) < 0.5 ? 0 : 0.6);
        return brush(mix("#8a5a2c", "#4a2c14", Math.abs(s[1] - 90) / 200), p, 0.14, 0.04);
      }),
      sides: 6,
      bone: root,
      name: "bow",
    });
    b.rod([0.5, 1.16, bowZ], [1.5, 1.16, bowZ], 0.005, { color: CLOTH, sides: 4, bone: root, name: "bowString" });
    dots([new THREE.Vector3(0.5, 1.16, bowZ), new THREE.Vector3(1.5, 1.16, bowZ)], GOLD, 0.017);
    for (const x of [0.78, 1.22]) {
      put(new THREE.CylinderGeometry(0.022, 0.026, 0.1, 6), "#7a4c28", new THREE.Matrix4().compose(new THREE.Vector3(x, 1.1, PZ - 0.0), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)));
      put(new THREE.SphereGeometry(0.028, 6, 4), GOLD_D, new THREE.Matrix4().makeTranslation(x, 1.1, PZ + 0.055));
    }

    // quiver hanging from a peg, full of fletched arrows
    const q = new Fr([0.62, 0.9, PZ + 0.12], [0.1, 1, 0.0], [1, 0, 0]);
    put(new THREE.CylinderGeometry(0.02, 0.024, 0.12, 6), "#7a4c28", new THREE.Matrix4().compose(new THREE.Vector3(0.62, 1.0, PZ + 0.0), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)));
    b.rod(q.p(-0.34), q.p(0.12), [0.07, 0.085], { color: wrapPaint(0.5), sides: 8, bone: root, name: "quiver" });
    b.rod(q.p(-0.34), q.p(-0.31), [0.075, 0.075], { color: GOLD_D, sides: 8, bone: root, name: "quiverFoot" });
    q.ring(0.1, 0.082, 0.014, GOLD, 0, 0, 10);
    q.ring(-0.15, 0.078, 0.012, IRON, 0, 0, 10);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + 0.4;
      const w = Math.cos(ang) * 0.035;
      const n = Math.sin(ang) * 0.035;
      const lean = (i - 2) * 3;
      const aq = new Fr(q.p(0.1, w, n).toArray() as P3, q.U.clone().add(new THREE.Vector3(lean * 0.012, 0, 0)).toArray() as P3, [1, 0, 0]);
      b.rod(aq.p(-0.1), aq.p(0.34), 0.008, { color: "#8a6a3c", sides: 4, bone: root, name: "arrow" });
      aq.put(new THREE.ConeGeometry(0.02, 0.06, 4), STEEL, [0.36, 0, 0]);
      for (let k = 0; k < 3; k++) aq.put(new THREE.BoxGeometry(0.004, 0.09, 0.03), i % 2 ? RED : CLOTH, [0.3, 0, 0], [0, k * 60, 0]);
    }
    // rope strap
    b.sweep(catmull([q.p(-0.2, -0.085, 0.02), q.p(-0.2, -0.04, -0.09), q.p(0.0, 0.04, -0.12), q.p(0.05, 0.085, 0.0)]), 0.012, { color: LEATHER_D, sides: 5, bone: root, name: "quiverStrap" });
  }

  // =============================================================================================================
  // CHEST WITH HINGED LID
  {
    const cx = -0.62;
    const cz = 0.42;
    const bodyH = 0.36;
    const top = FLOOR + bodyH;
    box(0.88, bodyH, 0.5, wood("#7b4b27", "#33200f", "x", 80), [cx, FLOOR + bodyH / 2, cz], { name: "chestBody" });
    // iron bands and corner plates
    for (const dx of [-0.28, 0.28]) {
      box(0.09, bodyH + 0.01, 0.52, metal(IRON, IRON_D, 16), [cx + dx, FLOOR + bodyH / 2, cz], { name: "chestBand" });
      dots([new THREE.Vector3(cx + dx, FLOOR + 0.13, cz + 0.265), new THREE.Vector3(cx + dx, FLOOR + 0.3, cz + 0.265)], STEEL, 0.014);
    }
    for (const s of [1, -1]) {
      box(0.04, bodyH, 0.04, IRON, [cx + s * 0.44, FLOOR + bodyH / 2, cz + 0.25]);
      box(0.04, bodyH, 0.04, IRON, [cx + s * 0.44, FLOOR + bodyH / 2, cz - 0.25]);
    }
    box(0.92, 0.04, 0.54, metal(IRON, IRON_D, 17), [cx, FLOOR + 0.034, cz]);
    // lock plate
    box(0.1, 0.13, 0.02, GOLD, [cx, top - 0.09, cz + 0.26], { name: "lock" });
    put(new THREE.BoxGeometry(0.02, 0.05, 0.01), BLACK, new THREE.Matrix4().makeTranslation(cx, top - 0.09, cz + 0.272));
    put(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 8), BLACK, new THREE.Matrix4().compose(new THREE.Vector3(cx, top - 0.07, cz + 0.272), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)));
    // side handles
    for (const s of [1, -1]) {
      put(
        new THREE.TorusGeometry(0.05, 0.01, 5, 10, Math.PI),
        IRON_D,
        new THREE.Matrix4().compose(new THREE.Vector3(cx + s * 0.465, top - 0.12, cz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI)), new THREE.Vector3(1, 1, 1)),
      );
    }
    // hinged lid
    const lid = b.joint("lid", { parent: root, at: [cx, top, cz - 0.25], dir: [0, 0, 1], role: "hinge" });
    const lidOutline: OutlinePoint[] = [
      [0, 0],
      [0.5, 0],
      [0.5, 0.03],
      [0.475, 0.14],
      [0.4, 0.21],
      [0.26, 0.245],
      [0.12, 0.21],
      [0.03, 0.14],
      [0, 0.03],
    ];
    b.extrude(lidOutline, {
      at: [cx, top, cz - 0.25],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.88,
      bevel: 0.012,
      bone: lid,
      name: "chestLid",
      color: paint((p, n) => {
        const c = resolve(wood("#865229", "#33200f", "x", 81), p, n);
        const seam = Math.abs(wrap01((p.x - cx + 0.44) / 0.176) - 0.5) > 0.47 && n.y > 0.1;
        return seam ? mix(c, "#1c1230", 0.5) : c;
      }),
    });
    for (const dx of [-0.28, 0.28])
      b.extrude(scaleOutline(lidOutline, 1.0).map((q) => [q[0] + 0.0, q[1] + 0.0] as OutlinePoint).map((q, i) => (i === 0 || i === 1 ? ([q[0], q[1]] as OutlinePoint) : q)), {
        at: [cx + dx, top + 0.004, cz - 0.254],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.09,
        bevel: 0.01,
        bone: lid,
        color: metal(IRON, IRON_D, 18),
        name: "lidBand",
      });
    for (const dx of [-0.28, 0.28]) put(new THREE.SphereGeometry(0.014, 4, 2), STEEL, new THREE.Matrix4().makeTranslation(cx + dx, top + 0.245, cz + 0.0), lid);
    put(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), IRON_D, new THREE.Matrix4().compose(new THREE.Vector3(cx, top + 0.01, cz - 0.255), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), new THREE.Vector3(1, 1, 1)), lid);
    // lid clasp
    put(new THREE.BoxGeometry(0.06, 0.06, 0.02), GOLD, new THREE.Matrix4().makeTranslation(cx, top + 0.03, cz + 0.255), lid);
  }

  // =============================================================================================================
  // KITE SHIELD LEANING ON THE SHELF
  {
    const lean = 17 * DEG;
    const u: P3 = [0, Math.cos(lean), -Math.sin(lean)];
    const tip: P3 = [0.5, FLOOR + 0.012, 0.22];
    const f = new Fr([tip[0] + u[0] * 0.5, tip[1] + u[1] * 0.5, tip[2] + u[2] * 0.5], u, [1, 0, 0]);
    const kite: OutlinePoint[] = [
      [-0.5, 0, "sharp"],
      [-0.38, 0.15],
      [-0.06, 0.27],
      [0.2, 0.3],
      [0.37, 0.26],
      [0.43, 0.13],
      [0.4, 0.0],
      [0.43, -0.13],
      [0.37, -0.26],
      [0.2, -0.3],
      [-0.06, -0.27],
      [-0.38, -0.15],
    ];
    f.ext(kite, [0, 0, 0], 0.07, metal("#7b8497", "#3a4254", 30), { bevel: 0.016, name: "kiteRim" });
    f.ext(scaleOutline(kite, 0.88, -0.04, 0), [0, 0, 0], 0.082, paint((p, n, s) => {
      if (Math.abs(n.dot(f.N)) < 0.5) return IRON_D;
      const a = s[0];
      const w = Math.abs(s[1]);
      let c: Rgb;
      if (Math.abs(a - (0.18 - 1.15 * w)) < 0.05) c = GOLD;
      else if (Math.abs(a - (0.18 - 1.15 * w)) < 0.065) c = GOLD_D;
      else if (a - (0.18 - 1.15 * w) > 0) c = s[1] > 0 ? BLUE : mix(BLUE, "#1b2f80", 0.5);
      else c = s[1] > 0 ? RED : mix(RED, RED_D, 0.6);
      return brush(c, p, 0.14, 0.06);
    }), { bevel: 0.008, name: "kiteFace" });
    f.part(new THREE.SphereGeometry(0.07, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), metal(GOLD, GOLD_D, 31), [0.15, 0, 0.04], [90, 0, 0], [1, 1, 0.7]);
    const rivs: THREE.Vector3[] = [];
    for (const [a, w] of [[0.34, 0.2], [0.34, -0.2], [-0.12, 0.2], [-0.12, -0.2], [-0.36, 0.0], [0.4, 0.0]]) rivs.push(f.p(a, w, 0.04));
    dots(rivs, GOLD, 0.017, f.bone);
  }

  // =============================================================================================================
  // BARREL OF WEAPONS
  {
    const bx = 1.18;
    const bz = 0.1;
    const H = 0.68;
    b.lathe(
      [
        [0, 0.0],
        [0.26, 0.0],
        [0.3, 0.1],
        [0.33, 0.34],
        [0.3, 0.58],
        [0.27, H],
        [0.23, H],
        [0.23, H - 0.05],
        [0, H - 0.05],
      ],
      {
        at: [bx, FLOOR, bz],
        segments: 14,
        bone: root,
        name: "barrel",
        color: paint((p, n, s) => {
          if (n.y > 0.6) return brush(mix(WOOD_D, "#6a4326", 0.2), p, 0.2, 0.05);
          const seam = Math.abs(wrap01(s[1] / (360 / 14)) - 0.5) > 0.465;
          let c: Rgb = resolve(wood("#835328", "#3a2312", "y", 90, 0.03), p, n);
          if (seam) c = mix(c, SHADOW, 0.55);
          return c;
        }),
      },
    );
    for (const [y, r] of [
      [0.08, 0.286],
      [0.26, 0.332],
      [0.47, 0.322],
      [0.62, 0.272],
    ]) {
      put(new THREE.TorusGeometry(r, 0.016, 5, 16), IRON, new THREE.Matrix4().compose(new THREE.Vector3(bx, FLOOR + y, bz), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)));
    }
    dots([0, 1, 2, 3, 4, 5].map((i) => new THREE.Vector3(bx + Math.sin(i + 0.4) * 0.34, FLOOR + 0.26, bz + Math.cos(i + 0.4) * 0.34)).filter((v) => v.z > bz), STEEL, 0.015);
    const topY = FLOOR + H - 0.05;
    // swords stuck in the barrel, hilts up
    sword(new Fr([bx - 0.1, topY + 0.2, bz - 0.04], [-0.2, -1, 0.1], [0, 0, 1]), { L: 0.4, hw: 0.06, guardW: 0.26, trim: GOLD, gem: RED, name: "barrelSword" });
    sword(new Fr([bx + 0.1, topY + 0.3, bz + 0.02], [0.18, -1, -0.06], [0, 0, 1]), { L: 0.4, hw: 0.05, guardW: 0.3, trim: GOLD_D, gem: BLUE_L, wrap: wrapPaint(0.24), name: "barrelSword2" });
    // axe: head up, handle down inside
    {
      const f = new Fr([bx + 0.02, topY + 0.34, bz + 0.08], [0.05, 1, 0.08], [1, 0, 0]);
      b.rod(f.p(-0.5), f.p(0.03), 0.028, { color: shaftPaint(95), sides: 8, bone: root, name: "axeHandle" });
      collar(f, -0.02, 0.1, 0.045);
      axeBlade(f, 0.95, 1);
      b.spike(f.p(0.03), f.U, 0.18, 0.03, { color: steelRod(), sides: 4, bone: root });
      f.part(new THREE.SphereGeometry(0.034, 6, 4), metal(GOLD, GOLD_D, 32), [0.03, 0, 0]);
    }
    // mace
    {
      const f = new Fr([bx - 0.2, topY + 0.34, bz + 0.14], [-0.22, 1, 0.12], [1, 0, 0]);
      b.rod(f.p(-0.52), f.p(0.0), 0.026, { color: shaftPaint(96), sides: 8, bone: root, name: "maceHandle" });
      f.put(new THREE.SphereGeometry(0.075, 8, 6), IRON, [0.12, 0, 0]);
      f.put(new THREE.CylinderGeometry(0.045, 0.04, 0.07, 8), GOLD, [0.02, 0, 0]);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * 360;
        f.put(new THREE.BoxGeometry(0.012, 0.15, 0.1), "#8a95aa", [0.12, 0, 0], [0, ang, 0], 1);
        f.put(new THREE.BoxGeometry(0.1, 0.15, 0.012), "#8a95aa", [0.12, 0, 0], [0, ang + 30, 0], 1);
      }
      f.put(new THREE.ConeGeometry(0.03, 0.09, 6), S_M, [0.23, 0, 0]);
    }
  }

  // chopping stump with a hatchet in it
  {
    const sx = -0.02;
    const sz = 0.42;
    const H = 0.34;
    const bark = wood("#6a4426", "#2a1a0d", "y", 140, 0.03);
    b.lathe(
      [
        [0, 0],
        [0.27, 0],
        [0.245, 0.06],
        [0.215, 0.2],
        [0.225, H],
        [0, H],
      ],
      {
        at: [sx, FLOOR, sz],
        segments: 10,
        bone: root,
        name: "stump",
        color: paint((p, n) => {
          if (n.y > 0.7) {
            const r = Math.hypot(p.x - sx, p.z - sz);
            const ring = Math.abs(Math.sin(r * 105 + noise(p, 0.12, 4) * 2.5));
            return brush(mix("#cf9f5f", "#8c5a2b", ring * 0.75 + (r < 0.02 ? 0.3 : 0)), p, 0.08, 0.03);
          }
          return resolve(bark, p, n);
        }),
      },
    );
    const f = new Fr([sx + 0.06, FLOOR + H + 0.1, sz + 0.05], [0.9, -1, 0.25], [0, 0, 1]);
    b.rod(f.p(-0.44), f.p(0.02), 0.025, { color: shaftPaint(141), sides: 8, bone: root, name: "hatchetHandle" });
    collar(f, -0.03, 0.08, 0.04);
    axeBlade(f, 0.85, 1);
    f.put(new THREE.SphereGeometry(0.035, 6, 4), GOLD_D, [-0.46, 0, 0]);
  }

  // buckler leaning on the barrel
  {
    const f = new Fr([1.0, FLOOR + 0.215, 0.58], [0, 0.34, 0.94], [1, 0, 0]);
    roundShield(f, 0.215, RED, BLUE_D, GOLD, false);
  }

  // =============================================================================================================
  // ARMOUR STAND (outside the left post)
  {
    const sx = -2.02;
    const sz = 0.12;
    const wd = wood("#6e4425", "#2f1b0c", "y", 100);
    box(0.7, 0.07, 0.13, wd, [sx, FLOOR + 0.035, sz], { name: "standFoot" });
    box(0.13, 0.07, 0.7, wd, [sx, FLOOR + 0.035, sz], { name: "standFoot2" });
    b.rod([sx, FLOOR, sz], [sx, FLOOR + 1.3, sz], 0.035, { color: wd, sides: 8, bone: root, name: "standPole" });
    const by = FLOOR + 0.5;
    // cuirass
    const torso = new THREE.LatheGeometry(
      [
        [0.0, 0],
        [0.16, 0],
        [0.2, 0.09],
        [0.235, 0.24],
        [0.25, 0.36],
        [0.22, 0.49],
        [0.14, 0.58],
        [0.09, 0.62],
        [0.0, 0.62],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      12,
    );
    b.part(
      torso,
      paint((p, n) => {
        const x = p.x - sx;
        const y = p.y - by;
        const front = n.z > 0.35;
        let c: Rgb = mix("#6c8bd0", "#2a49a3", smoothstep(0.0, 0.62, 0.62 - y) * 0.6);
        c = mix(c, WARM, Math.max(0, n.y) * 0.2);
        if (front && Math.abs(x) < 0.012) c = GOLD;
        if (y < 0.075 && y > 0.02) c = mix(GOLD_D, GOLD, 0.5 + 0.5 * Math.sin(x * 40));
        if (front && Math.abs(Math.abs(x) - 0.12 - (y - 0.3) * 0.0) < 0.012 && y > 0.18 && y < 0.5) c = GOLD_D;
        if (front && y > 0.4 && Math.abs(x) + Math.abs(y - 0.38) * 0.9 < 0.1) c = Math.abs(x) + Math.abs(y - 0.38) * 0.9 < 0.07 ? RED : GOLD;
        if (y > 0.54) c = mix(c, GOLD, 0.7);
        return brush(c, p, 0.14, 0.05);
      }),
      { at: [sx, by, sz], scale: [1.18, 1, 0.78], bone: root, name: "cuirass" },
    );
    put(new THREE.TorusGeometry(0.2, 0.016, 5, 14), GOLD, new THREE.Matrix4().compose(new THREE.Vector3(sx, by + 0.06, sz), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1.18, 0.78, 1)));
    // shoulder bar and pauldrons
    b.rod([sx - 0.4, by + 0.58, sz], [sx + 0.4, by + 0.58, sz], 0.03, { color: wd, sides: 8, bone: root, name: "standBar" });
    for (const s of [1, -1]) {
      const f = new Fr([sx + s * 0.29, by + 0.55, sz], [s * 0.7, 1, 0], [0, 0, 1]);
      b.lathe(
        (
          [
            [0, 0.15],
            [0.09, 0.145],
            [0.15, 0.105],
            [0.19, 0.05],
            [0.205, 0.0],
            [0.21, -0.03],
            [0.18, -0.04],
            [0.2, -0.075],
            [0.21, -0.1],
            [0.18, -0.11],
            [0.15, -0.115],
            [0.0, -0.115],
          ] as Array<[number, number]>
        ).map(([x, y]): OutlinePoint => [x * 0.82, y * 0.82]),
        {
          at: f.O,
          axis: f.U,
          segments: 10,
          bone: root,
          name: "pauldron",
          color: paint((p, n) => {
            const l = f.local(p);
            let c: Rgb = mix("#5c7dc9", "#27449a", smoothstep(0.15, -0.1, l.a));
            c = mix(c, WARM, Math.max(0, n.y) * 0.2);
            if (Math.abs(l.a - 0.0) < 0.012 || Math.abs(l.a + 0.075) < 0.01) c = GOLD;
            if (Math.abs(l.a + 0.1) < 0.012) c = GOLD_D;
            return brush(c, p, 0.14, 0.05);
          }),
        },
      );
      b.spike(f.p(0.115), f.U, 0.13, 0.035, { color: metal(GOLD, GOLD_D, 33), sides: 6, bone: root, name: "pauldronSpike" });
      f.put(new THREE.TorusGeometry(0.125, 0.011, 5, 14), GOLD, [0.085, 0, 0], [90, 0, 0]);
    }
    // tabard hanging at the waist
    b.extrude(
      [
        [-0.13, 0],
        [0.13, 0],
        [0.13, -0.28],
        [0, -0.36, "sharp"],
        [-0.13, -0.28],
      ],
      {
        at: [sx, by + 0.055, sz + 0.16],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        color: paint((p, _n, s) => {
          const edge = Math.min(0.13 - Math.abs(s[0]), -s[1], 0.36 + s[1] - Math.abs(s[0]) * 0.55);
          if (edge < 0.016) return GOLD;
          if (Math.abs(s[0]) < 0.014 && s[1] > -0.3) return GOLD_D;
          return brush(RED, p, 0.14, 0.04);
        }),
        bone: root,
        name: "tabard",
      },
    );
    // belt buckle
    put(new THREE.BoxGeometry(0.07, 0.05, 0.015), GOLD, new THREE.Matrix4().makeTranslation(sx, by + 0.06, sz + 0.165));
    // pot helm on top with a red crest
    const f = new Fr([sx, FLOOR + 1.28, sz], [0, 1, 0], [1, 0, 0], root, 1.2);
    f.lathe(
      [
        [0, 0],
        [0.12, 0],
        [0.145, 0.03],
        [0.15, 0.12],
        [0.13, 0.22],
        [0.08, 0.27],
        [0, 0.285],
      ],
      {
        segments: 10,
        name: "standHelm",
        color: domePaint(f, ["#c8d2e2", "#6b7790"], (l, n) => {
          const front = n.dot(f.N) > 0.45;
          if (front && l.a > 0.1 && l.a < 0.135 && Math.abs(l.w) < 0.1) return BLACK;
          if (front && Math.abs(l.w) < 0.014 && l.a < 0.1) return GOLD;
          if (l.a < 0.028) return GOLD;
          if (Math.abs(l.w) < 0.02 && l.a > 0.15) return RED;
          return null;
        }),
      },
    );
    f.extX(
      [
        [0.1, 0.25],
        [0.12, 0.34],
        [0.02, 0.43],
        [-0.12, 0.42],
        [-0.2, 0.33],
        [-0.16, 0.25],
      ],
      {
        at: f.p(0, 0, 0),
        x: f.N,
        y: f.U,
        thickness: 0.035,
        bevel: 0.012,
        smoothing: 1,
        color: paint((p, _n, s) => brush(mix(RED, "#ff6a4a", smoothstep(0.26, 0.42, s[1])), p, 0.1, 0.04)),
        name: "standPlume",
      },
    );
  }

  // =============================================================================================================
  // GRINDSTONE WITH A HINGED WHEEL (outside the right post)
  {
    const gx = 2.0;
    const gz = 0.28;
    const axleY = FLOOR + 0.62;
    const wd = wood("#6e4425", "#2f1b0c", "y", 110);
    for (const dx of [-0.27, 0.27]) {
      for (const dz of [-1, 1]) b.rod([gx + dx, FLOOR, gz + dz * 0.3], [gx + dx, axleY + 0.02, gz], 0.04, { color: wd, sides: 6, bone: root, name: "grindLeg" });
      box(0.07, 0.07, 0.07, GOLD_D, [gx + dx, axleY, gz]);
    }
    box(0.6, 0.06, 0.06, wd, [gx, FLOOR + 0.18, gz - 0.16], { name: "grindBrace" });
    box(0.6, 0.06, 0.06, wd, [gx, FLOOR + 0.18, gz + 0.16], { name: "grindBrace" });
    // water trough
    box(0.5, 0.1, 0.34, wood("#5d3a20", "#2a180b", "x", 111), [gx, FLOOR + 0.1, gz], { name: "trough" });
    box(0.44, 0.012, 0.28, WATER, [gx, FLOOR + 0.152, gz], { name: "water" });
    const wheel = b.joint("wheel", { parent: root, at: [gx, axleY, gz], dir: [0, 0, 1], role: "hinge" });
    const wf = new Fr([gx, axleY, gz], [1, 0, 0], [0, 1, 0], wheel);
    b.lathe(
      [
        [0, -0.07],
        [0.26, -0.07],
        [0.3, -0.05],
        [0.3, 0.05],
        [0.26, 0.07],
        [0, 0.07],
      ],
      {
        at: wf.O,
        axis: wf.U,
        segments: 14,
        bone: wheel,
        name: "grindWheel",
        color: paint((p, n) => {
          const l = wf.local(p);
          const r = Math.hypot(l.w, l.n);
          let c: Rgb = mix("#8e8d98", "#5f5e6c", noise(p, 0.06, 5));
          if (r < 0.06) c = GOLD_D;
          else if (Math.abs(r - 0.15) < 0.006) c = mix(c, "#2b2a35", 0.5);
          if (Math.abs(n.dot(wf.U)) < 0.4 && Math.abs(wrap01(Math.atan2(l.n, l.w) / (Math.PI * 2) * 24) - 0.5) > 0.46) c = mix(c, "#2b2a35", 0.6);
          if (r > 0.2 && Math.abs(n.dot(wf.U)) > 0.5 && Math.abs(r - 0.29) < 0.01) c = mix(c, "#cfcfd8", 0.4);
          return brush(c, p, 0.2, 0.03);
        }),
      },
    );
    b.rod([gx - 0.36, axleY, gz], [gx + 0.46, axleY, gz], 0.026, { color: metal(IRON, IRON_D, 40), sides: 8, bone: wheel, name: "axle" });
    // crank
    b.rod([gx + 0.42, axleY, gz], [gx + 0.42, axleY + 0.16, gz + 0.07], 0.018, { color: metal(IRON, IRON_D, 41), sides: 6, bone: wheel, name: "crankArm" });
    b.rod([gx + 0.42, axleY + 0.16, gz + 0.07], [gx + 0.54, axleY + 0.16, gz + 0.07], 0.024, { color: wd, sides: 6, bone: wheel, name: "crankKnob" });
    put(new THREE.SphereGeometry(0.035, 6, 4), GOLD, new THREE.Matrix4().makeTranslation(gx + 0.34, axleY, gz), wheel);
    // whetstones and an oil jar
    box(0.16, 0.05, 0.07, "#8e8d98", [gx - 0.28, FLOOR + 0.025, gz + 0.5], { rot: [0, 15, 0] });
    box(0.12, 0.05, 0.06, "#6e6d78", [gx - 0.26, FLOOR + 0.075, gz + 0.5], { rot: [0, -10, 0] });
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.09, 0.06],
        [0.08, 0.12],
        [0.045, 0.16],
        [0.05, 0.19],
        [0.0, 0.19],
      ],
      { at: [gx + 0.28, FLOOR, gz + 0.5], segments: 8, color: shaded(mottle("#8c5a2e", "#5a3318", { size: 0.06, seed: 3 })), bone: root, name: "oilJar" },
    );
    put(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 6), LEATHER, new THREE.Matrix4().makeTranslation(gx + 0.28, FLOOR + 0.205, gz + 0.5));
  }

  // =============================================================================================================
  // LEFT FRONT CLUTTER: crates, a sack and a lying greatsword
  {
    const cp = wood("#8a6032", "#3a2410", "x", 120, 0.04);
    const crate = (x: number, y: number, z: number, s: number, rot: number) => {
      const p = paint((q, n) => {
        const c = resolve(cp, q, n);
        const plank = Math.abs(wrap01((q.y - FLOOR) / (s / 3)) - 0.5) > 0.47;
        const frame = Math.abs(Math.abs(q.x - x) - s / 2) < 0.03 && false;
        return plank || frame ? mix(c, SHADOW, 0.5) : c;
      });
      box(s, s, s, p, [x, y + s / 2, z], { rot: [0, rot, 0], name: "crate" });
      // corner battens and a rope
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y + s / 2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot * DEG, 0)), new THREE.Vector3(1, 1, 1));
      for (const [dx, dz] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ])
        put(new THREE.BoxGeometry(0.045, s + 0.012, 0.045), "#5a3a1c", new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeTranslation((dx * s) / 2, 0, (dz * s) / 2)));
      put(new THREE.BoxGeometry(s + 0.012, 0.04, s + 0.012), "#5a3a1c", new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeTranslation(0, s * 0.18, 0)));
    };
    crate(-1.32, FLOOR, 0.62, 0.46, 8);
    crate(-1.28, FLOOR + 0.46, 0.6, 0.34, -18);
    // sack
    b.lathe(
      [
        [0, 0],
        [0.14, 0],
        [0.2, 0.1],
        [0.18, 0.24],
        [0.1, 0.34],
        [0.07, 0.4],
        [0.12, 0.44],
        [0.0, 0.43],
      ],
      { at: [-0.85, FLOOR, 0.78], segments: 9, color: shaded(mottle(SACK, "#7d6338", { size: 0.08, seed: 5 })), bone: root, name: "sack" },
    );
    put(new THREE.TorusGeometry(0.08, 0.01, 5, 10), LEATHER_D, new THREE.Matrix4().compose(new THREE.Vector3(-0.85, FLOOR + 0.34, 0.78), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)));
    // greatsword lying on the rug
    const gs = new Fr([0.48, FLOOR + 0.04, 0.9], [-1, 0, 0.12], [0, 0, 1]);
    sword(gs, { L: 0.95, hw: 0.065, guardW: 0.4, grip: 0.3, trim: GOLD, gem: RED, thick: 0.028, name: "greatsword" });
  }

  // =============================================================================================================
  // LANTERNS ON THE POSTS
  for (const s of [1, -1]) {
    const x = s * (POST_X - 0.0);
    const y = FLOOR + 2.0;
    const z0 = PZ + 0.15;
    // bracket
    b.rod([x, y + 0.12, z0], [x, y + 0.12, 0.34], 0.022, { color: metal(IRON, IRON_D, 50), sides: 6, bone: root, name: "lanternArm" });
    b.rod([x, y - 0.1, z0], [x, y + 0.12, 0.2], 0.018, { color: IRON, sides: 6, bone: root, name: "lanternStay" });
    put(new THREE.SphereGeometry(0.03, 6, 4), GOLD_D, new THREE.Matrix4().makeTranslation(x, y + 0.12, 0.34));
    b.rod([x, y + 0.12, 0.34], [x, y + 0.02, 0.34], 0.006, { color: IRON_D, sides: 4, bone: root, name: "chain" });
    // lantern
    const lz = 0.34;
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.11, 0.025],
        [0.07, 0.07],
        [0.02, 0.09],
        [0.0, 0.1],
      ],
      { at: [x, y, lz], segments: 6, color: metal(IRON, IRON_D, 51), bone: root, name: "lanternCap" },
    );
    glow(b.part(new THREE.BoxGeometry(0.15, 0.17, 0.15), GLASS, { at: [x, y - 0.1, lz], bone: root, name: "lanternGlass" }), 1.6);
    box(0.19, 0.035, 0.19, IRON_D, [x, y - 0.2, lz], { name: "lanternBase" });
    for (const dx of [-1, 1])
      for (const dz of [-1, 1]) box(0.018, 0.2, 0.018, IRON, [x + dx * 0.078, y - 0.1, lz + dz * 0.078]);
    put(new THREE.ConeGeometry(0.03, 0.04, 4), GOLD, new THREE.Matrix4().makeTranslation(x, y - 0.22, lz));
  }

  // =============================================================================================================
  // WEAPON-RACK HANGERS ON THE POST SIDES (a dangling pouch and a horn)
  for (const s of [1, -1]) {
    const x = s * (POST_X + 0.14);
    b.rod([x, FLOOR + 1.6, PZ], [x + s * 0.09, FLOOR + 1.6, PZ], 0.02, { color: IRON, sides: 6, bone: root, name: "sideHook" });
    put(new THREE.SphereGeometry(0.025, 6, 4), GOLD, new THREE.Matrix4().makeTranslation(x + s * 0.1, FLOOR + 1.6, PZ));
  }
  // horn hanging on the right post
  {
    const x = -(POST_X + 0.23);
    b.sweep(catmull([[x, FLOOR + 1.58, PZ + 0.04], [x, FLOOR + 1.35, PZ + 0.1], [x - 0.02, FLOOR + 1.1, PZ + 0.12], [x - 0.05, FLOOR + 0.93, PZ + 0.08]]), [0.012, 0.055], {
      color: paint((p, _n, s) => brush(wrap01(s[0] * 5) < 0.7 ? BONE : "#9a8a60", p, 0.1, 0.03)),
      sides: 8,
      bone: root,
      name: "warHorn",
    });
    b.rod([x, FLOOR + 0.98, PZ + 0.1], [x - 0.05, FLOOR + 0.93, PZ + 0.08], 0.07, { color: GOLD_D, sides: 8, bone: root, name: "hornCap" });
  }

  // brass name plates under the helmets and on the polearm rails
  for (const x of [-0.4, 0, 0.4]) {
    put(new THREE.BoxGeometry(0.15, 0.04, 0.008), GOLD, new THREE.Matrix4().makeTranslation(x, SHELF_Y - 0.03, PZ + 0.243));
    put(new THREE.BoxGeometry(0.1, 0.008, 0.01), GOLD_D, new THREE.Matrix4().makeTranslation(x, SHELF_Y - 0.03, PZ + 0.245));
  }
  for (const y of [0.55, 1.45]) put(new THREE.BoxGeometry(0.24, 0.05, 0.008), GOLD, new THREE.Matrix4().makeTranslation(-0.98, FLOOR + y - 0.02, PZ + 0.225 + 0.015));

  // border stones round the plinth lip
  {
    const stones: Array<[number, number, number, number]> = [];
    for (let i = 0; i < 15; i++) {
      const x = -2.24 + i * 0.32;
      stones.push([x, 1.178, 0.29, 0.13], [x, -0.778, 0.29, 0.13]);
    }
    for (let i = 0; i < 6; i++) {
      const z = -0.6 + i * 0.32;
      stones.push([-2.378, z, 0.13, 0.29], [2.378, z, 0.13, 0.29]);
    }
    stones.forEach(([x, z, w, d], i) =>
      put(new THREE.BoxGeometry(w, 0.02, d), i % 3 === 0 ? "#8a8898" : i % 3 === 1 ? "#6f6d7c" : "#7b7989", new THREE.Matrix4().makeTranslation(x, 0.07, z)),
    );
  }

  // =============================================================================================================
  // BACK OF THE RACK: battens, iron plates and a hanging banner
  for (const y of [0.55, 1.25, 1.95]) {
    box(2.98, 0.14, 0.06, wood("#6b4224", "#2f1b0c", "x", 130 + Math.round(y * 10)), [0, FLOOR + y, PZ - 0.11], { name: "rearBatten" });
    for (const s of [1, -1]) {
      box(0.3, 0.18, 0.08, metal(IRON, IRON_D, 60), [s * 1.4, FLOOR + y, PZ - 0.11], { name: "rearPlate" });
      dots([new THREE.Vector3(s * 1.4 - 0.08, FLOOR + y, PZ - 0.155), new THREE.Vector3(s * 1.4 + 0.08, FLOOR + y, PZ - 0.155)], STEEL, 0.015);
    }
  }
  for (let i = 0; i < 4; i++) {
    put(new THREE.TorusGeometry(0.1 - i * 0.004, 0.017, 5, 12), "#b99a62", new THREE.Matrix4().compose(new THREE.Vector3(-1.05, FLOOR + 1.45, PZ - 0.2 - i * 0.03), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
  }
  put(new THREE.CylinderGeometry(0.02, 0.022, 0.3, 6), "#7a4c28", new THREE.Matrix4().compose(new THREE.Vector3(-1.05, FLOOR + 1.45, PZ - 0.12), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)));
  b.rod([-0.72, HEAD_Y - 0.06, PZ - 0.17], [0.72, HEAD_Y - 0.06, PZ - 0.17], 0.022, { color: GOLD_D, sides: 6, bone: root, name: "rearRod" });
  dots([new THREE.Vector3(-0.76, HEAD_Y - 0.06, PZ - 0.17), new THREE.Vector3(0.76, HEAD_Y - 0.06, PZ - 0.17)], GOLD, 0.04);
  {
    const hw = 0.5;
    const len = 1.2;
    b.extrude(
      [
        [-hw, 0],
        [hw, 0],
        [hw, -len],
        [0, -len + 0.22, "sharp"],
        [-hw, -len],
      ],
      {
        at: [0, HEAD_Y - 0.08, PZ - 0.17],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        bone: root,
        name: "rearBanner",
        color: paint((p, _n, s) => {
          const x = s[0];
          const y = s[1];
          const bottom = -len + 0.22 * (1 - Math.abs(x) / hw);
          const edge = Math.min(hw - Math.abs(x), -y, (y - bottom) * 0.75);
          if (edge < 0.04) return GOLD;
          if (edge < 0.058) return GOLD_D;
          if (edge < 0.1 && edge > 0.075) return mix(BLUE_D, GOLD_D, 0.3);
          const stripe = Math.abs(x) < 0.05;
          const c = mix(BLUE, BLUE_D, smoothstep(-0.2, -len, y) * 0.7);
          return brush(stripe ? mix(c, "#ffffff", 0.12) : c, p, 0.12, 0.05);
        }),
      },
    );
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [0, HEAD_Y - 0.5, PZ - 0.17 - 0.009], rotation: [0, 180, 0], texture: emblem, bone: root, name: "rearEmblem" });
    for (const dx of [-0.47, 0.47]) b.spike([dx, HEAD_Y - 0.08 - len + 0.04, PZ - 0.17], [0, -1, 0], 0.12, 0.035, { color: GOLD, sides: 6, bone: root });
    b.spike([0, HEAD_Y - 0.08 - len + 0.23, PZ - 0.17], [0, -1, 0], 0.12, 0.035, { color: GOLD, sides: 6, bone: root });
  }
  dots(
    [-1, 1].flatMap((sg) => [new THREE.Vector3(sg * 1.3, HEAD_Y - 0.06, PZ + 0.14), new THREE.Vector3(sg * 1.46, HEAD_Y - 0.3, PZ + 0.14), new THREE.Vector3(sg * 1.12, HEAD_Y - 0.06, PZ + 0.14)]),
    STEEL,
    0.016,
  );

  // =============================================================================================================
  // GRASS TUFTS ALONG THE PLINTH EDGE
  {
    const tuft = svg(
      `<svg viewBox="0 0 48 48">
        <path d="M24 48 C22 34 14 22 6 6 C17 17 22 28 24 34 C25 22 30 10 36 2 C35 20 29 36 24 48 Z" fill="#3f8a33"/>
        <path d="M24 48 C26 36 34 28 44 20 C36 32 31 40 28 48 Z" fill="#56a844"/>
        <path d="M24 48 C20 38 14 34 4 30 C12 38 17 42 20 48 Z" fill="#2f7028"/>
        <path d="M24 48 C24 38 25 28 26 14 C28 28 28 40 28 48 Z" fill="#7fc65a"/>
      </svg>`,
      { size: 128 },
    );
    const r = rng(11);
    const frames = [];
    for (let i = 0; i < 34; i++) {
      const t = r();
      let x: number;
      let z: number;
      if (i < 20) {
        x = -2.2 + t * 4.4;
        z = 1.02 + r() * 0.07;
      } else if (i < 27) {
        x = 2.22 + r() * 0.04;
        z = 0.85 + r() * 0.2 - (i % 2) * 1.05;
      } else {
        x = -2.2 - r() * 0.04;
        z = 0.7 + r() * 0.3 - (i % 2) * 1.2;
      }
      frames.push(frame([x, FLOOR, z], [0, 1, 0]));
    }
    b.cards(frames, tuft, { size: [0.2, 0.2], lean: 10, flow: [0, 0, 1], cross: true, vary: 0.4, spin: 180, rng: rng(12), bone: root });
  }

  flush();
  return b.root;
}
