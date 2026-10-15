// Alchemist's workbench: a Genshin-style prop group. Cel-shaded warm wood, cream stone, teal glaze and gold filigree,
// with glowing elemental potions, a copper still, a balance, books, herbs and a floating rune circle.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import { grain, mottle, paint, spots, stripes } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemy bench with a hutch of potions and books, a copper still, a brass balance, a rune-lit tome, hanging herbs, a lantern and a shop sign.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Vec3 = [number, number, number];
type Col = string | Paint;
type Prof = OutlinePoint[];

const rad = THREE.MathUtils.degToRad;
const eq = (r: Vec3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(r[0]), rad(r[1]), rad(r[2])));

/** A local coordinate system: build a tilted cluster in its own axes, place it anywhere. */
class Grp {
  constructor(
    readonly at: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}
  static of(at: Vec3, r: Vec3 = [0, 0, 0], parent?: Grp) {
    const q = eq(r);
    const p = new THREE.Vector3(...at);
    if (!parent) return new Grp(p, q);
    return new Grp(p.applyQuaternion(parent.q).add(parent.at), parent.q.clone().multiply(q));
  }
  pt(l: Vec3): Vec3 {
    const v = new THREE.Vector3(...l).applyQuaternion(this.q).add(this.at);
    return [v.x, v.y, v.z];
  }
  dir(l: Vec3): Vec3 {
    const v = new THREE.Vector3(...l).applyQuaternion(this.q);
    return [v.x, v.y, v.z];
  }
}

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  const root = b.joint("bench", { at: [0, 0, 0] });
  type Bone = typeof root;
  let cur: Bone = root;
  const TOP = 0.92;

  // ───────────────────────────── palette ─────────────────────────────
  const GOLD = "#f6c453";
  const GOLD_D = "#b9852a";
  const INKC = INK;
  const celCache = new Map<string, Col>();
  const K = (hex: string, shadow?: string): Col => {
    const key = hex + (shadow ?? "");
    let c = celCache.get(key);
    if (!c) celCache.set(key, (c = cel(hex, shadow)));
    return c;
  };
  const wood = (axis: "x" | "y" | "z", lit: string, dark: string, size = 0.03): Col =>
    cel(grain(lit, dark, { size, axis, seed: 3 }));
  const W_M = { x: wood("x", "#c68a52", "#ad7443"), y: wood("y", "#c68a52", "#ad7443"), z: wood("z", "#c68a52", "#ad7443") };
  const W_D = { x: wood("x", "#8a5530", "#774728"), y: wood("y", "#8a5530", "#774728"), z: wood("z", "#8a5530", "#774728") };
  const W_L = { x: wood("x", "#e0a869", "#cd9356"), y: wood("y", "#e0a869", "#cd9356"), z: wood("z", "#e0a869", "#cd9356") };
  const GOLDP = cel(mottle(GOLD, "#ecb23f", { size: 0.03, seed: 9 }), GOLD_D);
  const COPPER = cel(mottle("#e08a4c", "#cf7440", { size: 0.025, seed: 5 }), "#9c4a33");
  const STONE = cel(mottle("#ece5d3", "#d9d0ba", { size: 0.05, seed: 2 }), "#b9b3b8");
  const TEAL = cel(mottle("#35b3ab", "#2a9d9b", { size: 0.04, seed: 4 }), "#1f7088");
  const NAVY = K("#3a4f9a", "#27346e");
  const CREAMP = K("#fbf1d6", "#e5cfa4");
  const PAGES = cel(stripes("#f8ecc8", "#e2cd98", { size: 0.006, axis: "y", width: 0.35 }), "#cdb585");
  const IRON = K("#6b7590", "#434a66");
  const LEATH = {
    navy: K("#3a4f9a", "#27346e"),
    red: K("#c4474a", "#8a2e4a"),
    teal: K("#2fa8a2", "#1f6f88"),
    purple: K("#8460cf", "#5b3d9e"),
    green: K("#5aa84d", "#3a7a4a"),
    brown: K("#9a5a36", "#6e3a2c"),
    cream: K("#efe0b8", "#cdb585"),
  };
  const ROPE = K("#d8b46c", "#a97c46");
  const CORK = K("#d9a066", "#a76d48");
  const WAX = K("#fff3d8", "#e8c9a0");

  // ───────────────────────────── helpers ─────────────────────────────
  type Opt = {
    g?: Grp;
    r?: Vec3;
    q?: THREE.Quaternion;
    sc?: number | Vec3;
    bone?: Bone;
    name?: string;
    tex?: THREE.Texture;
    seg?: number;
  };
  const place = (at: Vec3, o: Opt) => {
    const lq = o.q ?? (o.r ? eq(o.r) : new THREE.Quaternion());
    if (o.g) return { at: o.g.pt(at), quat: o.g.q.clone().multiply(lq) };
    return { at, quat: lq };
  };
  const add = (geo: THREE.BufferGeometry, col: Col, at: Vec3, o: Opt = {}) => {
    const pl = place(at, o);
    return b.part(geo, col, { at: pl.at, quat: pl.quat, bone: o.bone ?? cur, scale: o.sc, texture: o.tex, name: o.name });
  };
  const box = (w: number, h: number, d: number, col: Col, at: Vec3, o?: Opt) => add(new THREE.BoxGeometry(w, h, d), col, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, col: Col, at: Vec3, o?: Opt) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), col, at, o);
  const sph = (r: number, col: Col, at: Vec3, o?: Opt, ws = 8, hs = 6) => add(new THREE.SphereGeometry(r, ws, hs), col, at, o);
  const tor = (R: number, t: number, col: Col, at: Vec3, o?: Opt, rs = 5, ts = 10) =>
    add(new THREE.TorusGeometry(R, t, rs, ts), col, at, o);
  const plane = (w: number, h: number, tex: THREE.Texture, at: Vec3, o?: Opt) =>
    add(new THREE.PlaneGeometry(w, h), "#ffffff", at, { ...o, tex });
  const FLAT: Vec3 = [-90, 0, 0]; // plane faces up
  const lat = (out: Prof, col: Col, at: Vec3, o: Opt & { smooth?: number } = {}) => {
    const pl = place(at, o);
    const ax = new THREE.Vector3(0, 1, 0).applyQuaternion(pl.quat);
    return b.lathe(out, {
      at: pl.at,
      axis: [ax.x, ax.y, ax.z],
      segments: o.seg ?? 10,
      color: col,
      bone: o.bone ?? cur,
      smoothing: o.smooth,
      name: o.name,
    });
  };
  const on = <T>(bone: Bone, fn: () => T): T => {
    const old = cur;
    cur = bone;
    const r = fn();
    cur = old;
    return r;
  };

  // geometry batches: many small same-colour pieces become one part per bone and colour
  const pools = new Map<Bone, Map<Col, THREE.BufferGeometry[]>>();
  const bat = (col: Col, geo: THREE.BufferGeometry, at: Vec3, o: Opt = {}) => {
    const pl = place(at, o);
    const sc =
      o.sc === undefined
        ? new THREE.Vector3(1, 1, 1)
        : typeof o.sc === "number"
          ? new THREE.Vector3().setScalar(o.sc)
          : new THREE.Vector3(...o.sc);
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pl.at), pl.quat, sc));
    const bone = o.bone ?? cur;
    let m = pools.get(bone);
    if (!m) pools.set(bone, (m = new Map()));
    let l = m.get(col);
    if (!l) m.set(col, (l = []));
    l.push(geo);
  };
  const flush = () => {
    for (const [bone, m] of pools)
      for (const [col, geos] of m) {
        const merged = mergeGeometries(geos);
        if (!merged) throw new Error("batch merge failed");
        b.part(merged, col, { bone, at: [0, 0, 0] });
      }
  };
  /** a thin cylinder between two points, batched */
  const brod = (col: Col, a: Vec3, c: Vec3, r: number, seg = 5, o: Opt = {}) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    bat(col, new THREE.CylinderGeometry(r, r, len, seg), [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], {
      ...o,
      q: aim([d.x, d.y, d.z]),
    });
  };
  /** chain of alternating links from a to c */
  const links = (col: Col, a: Vec3, c: Vec3, n: number, r = 0.008, o: Opt = {}) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const q = aim([d.x, d.y, d.z]);
    const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      bat(col, new THREE.TorusGeometry(r, r * 0.3, 4, 6), [a[0] + d.x * t, a[1] + d.y * t, a[2] + d.z * t], {
        ...o,
        q: i % 2 ? q.clone().multiply(turn) : q,
        sc: [1, 1.35, 1],
      });
    }
  };

  // ───────────────────────────── textures ─────────────────────────────
  const R1 = rng(11);
  const star = (cx: number, cy: number, ro: number, ri: number, n: number, rot = 0) => {
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = rad(rot + (i * 180) / n - 90);
      const r = i % 2 ? ri : ro;
      pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
    }
    return pts.join(" ");
  };
  const textLines = (x: number, y: number, w: number, n: number, gap: number, col = "#7a5a3c", h = 1.5) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const ww = w * (0.55 + R1() * 0.45);
      s += `<rect x="${x}" y="${y + i * gap}" width="${i === n - 1 ? ww * 0.5 : ww}" height="${h}" rx="0.7" fill="${col}"/>`;
    }
    return s;
  };

  const RUG = svg(
    (() => {
      let s = `<svg viewBox="0 0 250 160" xmlns="http://www.w3.org/2000/svg"><rect width="250" height="160" fill="#2c3d78"/>`;
      s += `<rect x="4" y="4" width="242" height="152" fill="none" stroke="#f6c453" stroke-width="3"/>`;
      s += `<rect x="10" y="10" width="230" height="140" fill="#1f7a86"/>`;
      for (let x = 18; x < 238; x += 12) {
        s += `<polygon points="${x},15 ${x + 4},19 ${x},23 ${x - 4},19" fill="#fbf1d6"/><polygon points="${x},137 ${x + 4},141 ${x},145 ${x - 4},141" fill="#fbf1d6"/>`;
      }
      for (let y = 30; y < 140; y += 12) {
        s += `<polygon points="15,${y} 19,${y + 4} 15,${y + 8} 11,${y + 4}" fill="#fbf1d6"/><polygon points="235,${y} 239,${y + 4} 235,${y + 8} 231,${y + 4}" fill="#fbf1d6"/>`;
      }
      s += `<rect x="28" y="28" width="194" height="104" fill="#2c3d78" stroke="#f6c453" stroke-width="2"/>`;
      s += `<rect x="33" y="33" width="184" height="94" fill="none" stroke="#fbf1d6" stroke-width="1" stroke-dasharray="4 3"/>`;
      for (let i = -8; i < 20; i++) s += `<path d="M${33 + i * 14} 33 l94 94 M${33 + i * 14 + 94} 33 l-94 94" stroke="#4a5fa8" stroke-width="0.8" fill="none"/>`;
      s += `<polygon points="125,36 205,80 125,124 45,80" fill="#1f7a86" stroke="#f6c453" stroke-width="2.5"/>`;
      s += `<polygon points="125,48 188,80 125,112 62,80" fill="#a8483f" stroke="#fbf1d6" stroke-width="1.5"/>`;
      s += `<circle cx="125" cy="80" r="24" fill="#fbf1d6" stroke="#f6c453" stroke-width="2.5"/>`;
      s += `<polygon points="${star(125, 80, 21, 9, 8)}" fill="#2c3d78"/>`;
      s += `<polygon points="${star(125, 80, 15, 6, 8, 22.5)}" fill="#f6c453"/><circle cx="125" cy="80" r="4" fill="#a8483f"/>`;
      for (const [cx, cy] of [[33, 33], [217, 33], [33, 127], [217, 127]] as const) {
        s += `<circle cx="${cx}" cy="${cy}" r="14" fill="#1f7a86" stroke="#f6c453" stroke-width="1.8"/><polygon points="${star(cx, cy, 9, 4, 6)}" fill="#fbf1d6"/>`;
      }
      for (const x of [75, 175]) s += `<polygon points="${star(x, 80, 8, 3.5, 4)}" fill="#f6c453"/>`;
      return s + `</svg>`;
    })(),
    { size: 900 },
  );

  const WALL = svg(
    (() => {
      let s = `<svg viewBox="0 0 176 101" xmlns="http://www.w3.org/2000/svg"><rect width="176" height="101" fill="#f3e8cc"/>`;
      for (let k = -8; k < 14; k++) s += `<path d="M${k * 16} 0 l101 101 M${k * 16 + 101} 0 l-101 101" stroke="#a9d6cb" stroke-width="1" fill="none"/>`;
      for (let k = -8; k < 14; k++)
        for (let m = 0; m < 24; m++) {
          const x = 8 * (k + m), y = 8 * (m - k);
          if (x > 0 && x < 176 && y > 0 && y < 87 && (k + m) % 2 === 0) s += `<polygon points="${star(x, y, 3, 1.3, 4)}" fill="#e4b64c"/>`;
        }
      s += `<rect x="0" y="87" width="176" height="14" fill="#2a9a9f"/><rect x="0" y="86" width="176" height="1.6" fill="#f6c453"/>`;
      for (let x = 4; x < 176; x += 8) s += `<polygon points="${x},89 ${x + 3},94 ${x},99 ${x - 3},94" fill="#c8ebe2"/>`;
      return s + `</svg>`;
    })(),
    { size: 960 },
  );

  const TOPINLAY = svg(
    (() => {
      let s = `<svg viewBox="0 0 170 70" xmlns="http://www.w3.org/2000/svg">`;
      s += `<rect x="3" y="3" width="164" height="64" fill="none" stroke="#f6c453" stroke-width="1.6"/>`;
      s += `<rect x="6" y="6" width="158" height="58" fill="none" stroke="#fbe29a" stroke-width="0.8"/>`;
      for (const [cx, cy, sx, sy] of [[3, 3, 1, 1], [167, 3, -1, 1], [3, 67, 1, -1], [167, 67, -1, -1]] as const)
        s += `<path d="M${cx + sx * 4} ${cy + sy * 4} q${sx * 14} ${sy * 2} ${sx * 12} ${sy * 12} q${-sx * 2} ${sy * 6} ${-sx * 8} ${sy * 4}" fill="none" stroke="#f6c453" stroke-width="1.4"/><circle cx="${cx + sx * 9}" cy="${cy + sy * 9}" r="1.8" fill="#f6c453"/>`;
      for (let x = 30; x < 150; x += 20) s += `<polygon points="${star(x, 3, 3.6, 1.6, 4)}" fill="#f6c453"/><polygon points="${star(x, 67, 3.6, 1.6, 4)}" fill="#f6c453"/>`;
      return s + `</svg>`;
    })(),
    { size: 1020 },
  );

  const VINE = svg(
    (() => {
      let s = `<svg viewBox="0 0 380 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 C 9 -2 19 -2 28 10 S 47 22 57 10 S 76 -2 85 10" id="v" fill="none" stroke="#f6c453" stroke-width="1.6"/>`;
      s = s.replace(/<path[^>]*>/, "");
      let d = "M0 10";
      for (let x = 0; x < 380; x += 38) d += ` C ${x + 9} -1 ${x + 19} -1 ${x + 28} 10 S ${x + 47} 21 ${x + 38} 10`;
      s += `<path d="${d}" fill="none" stroke="#f6c453" stroke-width="1.5"/>`;
      for (let x = 14; x < 380; x += 38) s += `<circle cx="${x}" cy="3.5" r="1.7" fill="#fbe29a"/><circle cx="${x + 19}" cy="16.5" r="1.7" fill="#fbe29a"/><path d="M${x + 24} 12 q4 -5 8 -1 q-4 4 -8 1z" fill="#f6c453"/>`;
      s += `<rect x="0" y="0" width="380" height="1.4" fill="#f6c453"/><rect x="0" y="18.6" width="380" height="1.4" fill="#f6c453"/>`;
      return s + `</svg>`;
    })(),
    { size: 1520 },
  );

  const FRAME = svg(
    `<svg viewBox="0 0 54 14" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="52" height="12" rx="1.5" fill="none" stroke="#f6c453" stroke-width="1"/><rect x="2.8" y="2.8" width="48.4" height="8.4" rx="1" fill="none" stroke="#fbe29a" stroke-width="0.5"/>${[[1, 1], [53, 1], [1, 13], [53, 13]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#f6c453"/>`).join("")}</svg>`,
    { size: 540 },
  );

  const plaque = (icon: string) =>
    svg(
      `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" rx="2" fill="#fbf1d6"/><rect x="0.8" y="0.8" width="28.4" height="18.4" rx="1.6" fill="none" stroke="#e4b64c" stroke-width="1"/>${icon}</svg>`,
      { size: 240 },
    );
  const ICON_FLASK = plaque(`<path d="M12.5 4 h5 v4 l4.5 8 q0.8 1.6 -1 1.6 h-12 q-1.8 0 -1 -1.6 l4.5 -8z" fill="#2fb7ad" stroke="#22406a" stroke-width="1"/><path d="M11 12.5 h8" stroke="#fbf1d6" stroke-width="1.4"/><circle cx="14" cy="14.5" r="1" fill="#fbf1d6"/>`);
  const ICON_LEAF = plaque(`<path d="M15 17 C 7 15 7 7 15 3 C 23 7 23 15 15 17z" fill="#5aa84d" stroke="#22406a" stroke-width="1"/><path d="M15 17 V6 M15 12 l3 -3 M15 12 l-3 -3" stroke="#d9f2b0" stroke-width="1" fill="none"/>`);
  const ICON_FLAME = plaque(`<path d="M15 3 C 19 8 22 10 20 14 C 19 17 11 17 10 14 C 9 11 12 9 12 7 C 13 8 14 8 15 3z" fill="#ff8a3a" stroke="#22406a" stroke-width="1"/><path d="M15 17 C 12 16 12 13 15 11 C 18 13 18 16 15 17z" fill="#ffe27a"/>`);

  const ORN = svg(
    (() => {
      let s = `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">`;
      s += `<rect x="3" y="3" width="54" height="74" rx="1" fill="none" stroke="#f6c453" stroke-width="1.6"/><rect x="6" y="6" width="48" height="68" fill="none" stroke="#fbe29a" stroke-width="0.8"/>`;
      for (const [cx, cy, sx, sy] of [[6, 6, 1, 1], [54, 6, -1, 1], [6, 74, 1, -1], [54, 74, -1, -1]] as const)
        s += `<path d="M${cx} ${cy + sy * 14} q0 ${-sy * 14} ${sx * 14} ${-sy * 0} M${cx + sx * 3} ${cy + sy * 3} q${sx * 8} ${sy * 1} ${sx * 7} ${sy * 7}" fill="none" stroke="#f6c453" stroke-width="1.5"/><circle cx="${cx + sx * 4}" cy="${cy + sy * 4}" r="1.8" fill="#f6c453"/>`;
      s += `<circle cx="30" cy="40" r="15" fill="none" stroke="#f6c453" stroke-width="1.8"/><circle cx="30" cy="40" r="11" fill="none" stroke="#fbe29a" stroke-width="0.8"/>`;
      s += `<polygon points="${star(30, 40, 14, 5, 8)}" fill="#f6c453"/><polygon points="${star(30, 40, 8, 3.4, 8, 22.5)}" fill="#fbe29a"/><circle cx="30" cy="40" r="2.2" fill="#f6c453"/>`;
      s += `<path d="M30 8 v10 M30 62 v10" stroke="#f6c453" stroke-width="1.6"/><polygon points="${star(30, 13, 3.4, 1.4, 4)}" fill="#fbe29a"/><polygon points="${star(30, 67, 3.4, 1.4, 4)}" fill="#fbe29a"/>`;
      return s + `</svg>`;
    })(),
    { size: 420 },
  );

  const pageBase = (flip: boolean) => {
    const grad = flip ? ["1", "0"] : ["0", "1"];
    return `<defs><linearGradient id="pg" x1="${grad[0]}" x2="${grad[1]}"><stop offset="0" stop-color="#d9bf86"/><stop offset="0.18" stop-color="#f3e3b8"/><stop offset="1" stop-color="#f8edca"/></linearGradient></defs><rect width="85" height="115" fill="url(#pg)"/>`;
  };
  const PAGE_L = svg(
    `<svg viewBox="0 0 85 115" xmlns="http://www.w3.org/2000/svg">${pageBase(true)}
    <rect x="9" y="8" width="64" height="2" fill="#a8483f"/>
    <path d="M42 100 C 41 80 43 66 42 52" stroke="#4d8a3f" stroke-width="2.2" fill="none"/>
    ${[[0, 90, -40], [1, 82, 40], [0, 72, -45], [1, 64, 45], [0, 56, -50]].map(([s, y, a]) => `<g transform="translate(42 ${y}) rotate(${a})"><path d="M0 0 C 7 -5 12 -11 14 -16 C 7 -16 1 -9 0 0z" fill="${s ? "#7fc25a" : "#4d9a46"}" stroke="#2f6a35" stroke-width="0.8"/></g>`).join("")}
    <circle cx="42" cy="46" r="5.5" fill="#e66a6a" stroke="#8a2e4a" stroke-width="1"/><circle cx="40.5" cy="44.5" r="1.5" fill="#ffd0c8"/>
    ${textLines(11, 15, 62, 6, 4.6)}${textLines(11, 104, 40, 2, 4.2)}
    <rect x="10" y="14" width="9" height="9" fill="#a8483f"/><path d="M12 21 l2.5 -5 l2.5 5 M13 19.5 h3" stroke="#f8edca" stroke-width="1.1" fill="none"/>
    </svg>`,
    { size: 340 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 85 115" xmlns="http://www.w3.org/2000/svg">${pageBase(false)}
    <rect x="12" y="8" width="64" height="2" fill="#a8483f"/>
    <circle cx="42" cy="40" r="26" fill="none" stroke="#5b3d24" stroke-width="1.6"/><circle cx="42" cy="40" r="20" fill="none" stroke="#5b3d24" stroke-width="0.9"/>
    <polygon points="${star(42, 40, 20, 20, 3)}" fill="none" stroke="#a8483f" stroke-width="1.5"/>
    <polygon points="${star(42, 40, 20, 20, 3, 60)}" fill="none" stroke="#2f7a8a" stroke-width="1.5"/>
    <circle cx="42" cy="40" r="6" fill="#f6c453" stroke="#5b3d24" stroke-width="1"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${42 + Math.cos(rad(i * 30)) * 23}" cy="${40 + Math.sin(rad(i * 30)) * 23}" r="1.7" fill="#5b3d24"/>`).join("")}
    ${textLines(13, 76, 62, 6, 4.6)}
    <path d="M60 104 l4 -9 l4 9z" fill="#2f7a8a"/><circle cx="20" cy="101" r="3.5" fill="#e4b64c" stroke="#5b3d24" stroke-width="0.8"/>
    </svg>`,
    { size: 340 },
  );

  const SCROLL = svg(
    `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#efdcab"/>
    <rect x="3" y="3" width="94" height="50" fill="none" stroke="#b5894e" stroke-width="1.2"/>
    <circle cx="28" cy="28" r="17" fill="none" stroke="#5b3d24" stroke-width="1.3"/><circle cx="28" cy="28" r="11" fill="none" stroke="#a8483f" stroke-width="1"/>
    <polygon points="${star(28, 28, 17, 17, 3)}" fill="none" stroke="#2f7a8a" stroke-width="1.2"/><polygon points="${star(28, 28, 11, 4.5, 6)}" fill="#e4b64c" stroke="#5b3d24" stroke-width="0.6"/>
    ${textLines(52, 9, 40, 9, 5)}
    <path d="M52 52 q10 -6 20 0 t20 0" stroke="#5b3d24" stroke-width="1" fill="none"/></svg>`,
    { size: 720 },
  );
  const note = (hue: string, doodle: string) =>
    svg(
      `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M1 2 L39 1 L38 49 L2 48z" fill="${hue}"/><path d="M1 2 L39 1 L38 49 L2 48z" fill="none" stroke="#b5894e" stroke-width="0.8"/>${doodle}${textLines(5, 28, 30, 5, 4.2, "#6a4a30", 1.4)}</svg>`,
      { size: 240 },
    );
  const NOTE_A = note("#f6e8bf", `<path d="M17 6 h6 v6 l6 10 q1 2 -1.5 2 h-15 q-2.5 0 -1.5 -2 l6 -10z" fill="#2fb7ad" stroke="#4a3a5a" stroke-width="1"/><circle cx="20" cy="18" r="1.4" fill="#fbf1d6"/>`);
  const NOTE_B = note("#e4f0d0", `<path d="M20 22 C 10 20 10 9 20 5 C 30 9 30 20 20 22z" fill="#5aa84d" stroke="#3a5a3a" stroke-width="1"/><path d="M20 22 V8" stroke="#e6f6b8" stroke-width="1"/>`);

  const label = (fill: string, icon: string) =>
    svg(
      `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="50" rx="3" fill="#fbf1d6"/><rect x="1.5" y="1.5" width="37" height="47" rx="2.2" fill="none" stroke="#e4b64c" stroke-width="1.6"/><circle cx="20" cy="22" r="12" fill="${fill}" stroke="#4a3a5a" stroke-width="1.2"/>${icon}${textLines(8, 40, 24, 2, 3.6, "#7a5a3c", 1.6)}</svg>`,
      { size: 200 },
    );
  const LAB_LEAF = label("#9be5a0", `<path d="M20 31 C 11 28 12 17 20 13 C 28 17 29 28 20 31z" fill="#3f9a4a"/><path d="M20 31 V16" stroke="#e6f6b8" stroke-width="1.3"/>`);
  const LAB_DROP = label("#9fd9ff", `<path d="M20 12 C 25 19 28 22 26 26 C 24 31 16 31 14 26 C 12 22 15 19 20 12z" fill="#2f8fe0"/><circle cx="17.5" cy="25" r="1.6" fill="#e8f6ff"/>`);
  const LAB_FLAME = label("#ffd89a", `<path d="M20 12 C 25 18 28 21 26 26 C 25 30 15 30 14 26 C 13 22 17 20 17 17 C 18 18 19 18 20 12z" fill="#ff6a3a"/><path d="M20 30 C 17 29 17 26 20 24 C 23 26 23 29 20 30z" fill="#ffe27a"/>`);
  const LAB_WIND = label("#cdeedf", `<path d="M12 20 q8 -6 12 0 q3 5 -2 6 M12 26 q9 -2 13 3" stroke="#2f9a8a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);

  const FIRE = svg(
    `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="24" fill="#3a1208"/><rect x="2" y="17" width="36" height="7" fill="#8a2a10"/>
    ${[[10, 20], [20, 22], [30, 20]].map(([x, h]) => `<path d="M${x} 20 C ${x - 7} 14 ${x - 3} 8 ${x} 2 C ${x + 3} 8 ${x + 7} 14 ${x} 20z" fill="#ff8a2a" transform="translate(0 ${20 - h})"/>`).join("")}
    ${[[10, 20], [20, 22], [30, 20]].map(([x, h]) => `<path d="M${x} 20 C ${x - 3.5} 16 ${x - 2} 12 ${x} 8 C ${x + 2} 12 ${x + 3.5} 16 ${x} 20z" fill="#ffe27a" transform="translate(0 ${20 - h})"/>`).join("")}</svg>`,
    { size: 200 },
  );

  const RUNES = svg(
    (() => {
      let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#8ff7ea" stroke-linecap="round" stroke-linejoin="round">`;
      s += `<circle cx="100" cy="100" r="96" stroke-width="3.2"/><circle cx="100" cy="100" r="76" stroke-width="2.4"/><circle cx="100" cy="100" r="50" stroke-width="3"/>`;
      s += `<polygon points="${star(100, 100, 50, 50, 3)}" stroke-width="2.6"/><polygon points="${star(100, 100, 50, 50, 3, 60)}" stroke-width="2.6"/>`;
      s += `<circle cx="100" cy="100" r="12" stroke="#e8fffb" stroke-width="3"/><polygon points="${star(100, 100, 24, 9, 8)}" stroke="#e8fffb" stroke-width="2"/>`;
      for (let i = 0; i < 24; i++) {
        const k = i % 4;
        const g =
          k === 0 ? "M96 14 l8 0 M100 14 l0 10 M96 24 l8 0"
          : k === 1 ? "M95 14 l5 10 l5 -10 M100 24 l0 -4"
          : k === 2 ? "M96 24 l0 -10 l8 5 l-8 5"
          : "M96 14 l8 10 M104 14 l-8 10 M100 12 l0 14";
        s += `<g transform="rotate(${i * 15} 100 100) translate(0 3)"><path d="${g}" stroke-width="2.4" stroke="#bffcf3"/></g>`;
      }
      for (let i = 0; i < 12; i++) s += `<circle cx="${100 + Math.cos(rad(i * 30)) * 63}" cy="${100 + Math.sin(rad(i * 30)) * 63}" r="2.6" fill="#8ff7ea" stroke="none"/>`;
      return s + `</svg>`;
    })(),
    { size: 640 },
  );

  // herb sprigs: two-tone cel leaves
  const leaf = (x: number, y: number, rot: number, len: number, w: number, dark = "#3f9a4a", light = "#86d65e", vein = "#2c6e3a") =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C ${w} ${-len * 0.3} ${w} ${-len * 0.8} 0 ${-len} C ${-w} ${-len * 0.8} ${-w} ${-len * 0.3} 0 0z" fill="${dark}"/><path d="M0 0 C ${w} ${-len * 0.3} ${w} ${-len * 0.8} 0 ${-len}z" fill="${light}"/><path d="M0 -2 L0 ${-len + 4}" stroke="${vein}" stroke-width="1.6"/></g>`;
  const HERB_MINT = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M32 128 C 31 90 33 50 32 12" stroke="#3a7a3a" stroke-width="3.4" fill="none"/>${[0, 1, 2, 3, 4, 5].map((i) => leaf(32, 108 - i * 16, -52 + i * 3, 27 - i * 2.4, 9 - i * 0.7) + leaf(32, 100 - i * 16, 52 - i * 3, 27 - i * 2.4, 9 - i * 0.7)).join("")}${leaf(32, 20, 0, 18, 6)}</svg>`,
    { size: 384 },
  );
  const HERB_LAV = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M32 128 C 33 90 31 50 32 8" stroke="#4a8a4a" stroke-width="3" fill="none"/>${leaf(32, 112, -28, 36, 3.5, "#4a8f5a", "#8ccf7a")}${leaf(32, 108, 30, 34, 3.5, "#4a8f5a", "#8ccf7a")}${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${32 - 5.4}" cy="${44 - i * 4.4 + 8}" rx="5.2" ry="3.4" fill="#7a58c8" transform="rotate(-24 ${26.6} ${52 - i * 4.4})"/><ellipse cx="${32 + 5.4}" cy="${44 - i * 4.4 + 8}" rx="5.2" ry="3.4" fill="#a98aee" transform="rotate(24 ${37.4} ${52 - i * 4.4})"/><ellipse cx="32" cy="${42 - i * 4.4}" rx="4.4" ry="3.2" fill="#8d6bdc"/>`).join("")}<circle cx="32" cy="8" r="3" fill="#b9a0f5"/></svg>`,
    { size: 384 },
  );
  const HERB_FLW = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M32 128 C 30 100 34 70 32 40" stroke="#3a7a3a" stroke-width="3.4" fill="none"/>${leaf(32, 112, -62, 30, 11, "#3f9a4a", "#9bdc62")}${leaf(32, 98, 64, 28, 10, "#3f9a4a", "#9bdc62")}${leaf(32, 80, -50, 22, 8, "#3f9a4a", "#9bdc62")}${Array.from({ length: 8 }, (_, i) => `<ellipse cx="32" cy="22" rx="5.5" ry="11" fill="${i % 2 ? "#ffe27a" : "#ffc83a"}" transform="rotate(${i * 45} 32 34) translate(0 -2)"/>`).join("")}<circle cx="32" cy="34" r="7" fill="#c8693a" stroke="#8a3a2a" stroke-width="1.2"/></svg>`,
    { size: 384 },
  );
  const HERB_DRY = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M32 128 C 33 90 31 50 32 8" stroke="#8a6a3a" stroke-width="3" fill="none"/>${[0, 1, 2, 3, 4].map((i) => leaf(32, 112 - i * 18, -48, 24 - i * 2, 6, "#9a7a3a", "#d4b25a", "#6a4a2a") + leaf(32, 104 - i * 18, 48, 24 - i * 2, 6, "#a87f3a", "#dcbc62", "#6a4a2a")).join("")}${leaf(32, 24, 0, 16, 4, "#9a7a3a", "#d4b25a", "#6a4a2a")}</svg>`,
    { size: 384 },
  );
  const FLOWER_GLOW = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${Array.from({ length: 6 }, (_, i) => `<path d="M32 36 C 22 30 24 10 32 3 C 40 10 42 30 32 36z" fill="${i % 2 ? "#aeeaff" : "#6fcfff"}" transform="rotate(${i * 60} 32 36)"/>`).join("")}<circle cx="32" cy="36" r="6" fill="#fff6c8"/></svg>`,
    { size: 256 },
  );
  const QUILL = svg(
    `<svg viewBox="0 0 24 100" xmlns="http://www.w3.org/2000/svg"><path d="M12 100 L12 2" stroke="#e8dcc0" stroke-width="2.4"/><path d="M12 6 C 28 22 26 60 12 78 C 12 50 12 30 12 6z" fill="#e8f4ff"/><path d="M12 6 C -4 22 -2 60 12 78 C 12 50 12 30 12 6z" fill="#7ec6ee"/><path d="M12 18 C 20 30 20 50 12 64" stroke="#4a7ab0" stroke-width="1.2" fill="none"/></svg>`,
    { size: 300 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 20 52" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="0" width="4" height="8" fill="#e4b64c"/><circle cx="10" cy="12" r="5" fill="#f6c453"/><rect x="5" y="16" width="10" height="3" fill="#b9852a"/><path d="M5 19 H15 L17 50 H3z" fill="#f6c453"/>${[6, 8.5, 11, 13.5].map((x) => `<path d="M${x} 20 V50" stroke="#c99128" stroke-width="0.9"/>`).join("")}</svg>`,
    { size: 208 },
  );
  const SIGN_ICON = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><path d="M22 10 h16 v18 l14 28 q4 8 -5 8 h-34 q-9 0 -5 -8 l14 -28z" fill="#2fb7ad" stroke="#f6c453" stroke-width="3"/><path d="M12 54 q18 8 36 0 l4 6 q4 8 -5 8 h-34 q-9 0 -5 -8z" fill="#7a58c8"/><rect x="20" y="4" width="20" height="9" rx="2" fill="#d9a066" stroke="#f6c453" stroke-width="2"/><circle cx="26" cy="44" r="3" fill="#e8fffb"/><circle cx="36" cy="38" r="2" fill="#e8fffb"/><circle cx="32" cy="52" r="2.4" fill="#e8fffb"/><path d="M24 22 v18" stroke="#e8fffb" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    { size: 480 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" fill="#3a1f4a" stroke="#f6c453" stroke-width="3"/><circle cx="30" cy="30" r="21" fill="none" stroke="#fbe29a" stroke-width="1.2"/><polygon points="${star(30, 30, 19, 7, 8)}" fill="#f6c453"/><polygon points="${star(30, 30, 11, 4.5, 8, 22.5)}" fill="#8ff7ea"/><circle cx="30" cy="30" r="3" fill="#3a1f4a"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${30 + Math.cos(rad(i * 45 + 22.5)) * 24}" cy="${30 + Math.sin(rad(i * 45 + 22.5)) * 24}" r="1.6" fill="#fbe29a"/>`).join("")}</svg>`,
    { size: 300 },
  );

  // ───────────────────────────── joints ─────────────────────────────
  const BEAM_C: Vec3 = [0.74, 1.3, 0.17];
  const beam = b.joint("beam", { parent: root, at: BEAM_C, dir: [1, 0, 0], role: "hinge" });
  const panL = b.joint("panL", { parent: beam, at: [BEAM_C[0] + 0.15, BEAM_C[1], BEAM_C[2]], dir: [0, -1, 0], role: "hinge" });
  const panR = b.joint("panR", { parent: beam, at: [BEAM_C[0] - 0.15, BEAM_C[1], BEAM_C[2]], dir: [0, -1, 0], role: "hinge" });
  const STACK: Vec3 = [-0.74, TOP, -0.1];
  const COVER_Y = TOP + 0.06 + 0.052 + 0.046 + 0.052;
  const cover = b.joint("bookCover", { parent: root, at: [STACK[0] - 0.135, COVER_Y, STACK[2]], dir: [1, 0, 0], role: "hinge" });
  const lantern = b.joint("lantern", { parent: root, at: [-1.12, 1.8, -0.3], dir: [0, -1, 0], role: "hinge" });
  const signJ = b.joint("sign", { parent: root, at: [1.13, 1.8, -0.3], dir: [0, -1, 0], role: "hinge" });
  const armil = b.joint("armillaryRing", { parent: root, at: [-0.2, 1.64, -0.29], dir: [0, 1, 0], role: "hinge" });
  const runeJ = b.joint("runeRing", { parent: root, at: [-0.4, 1.24, 0.1], dir: [0, 1, 0], role: "hinge" });
  const drawer = b.joint("drawerMid", { parent: root, at: [0, 0.755, 0.36], dir: [0, 0, 1] });

  // ───────────────────────────── floor: rug ─────────────────────────────
  {
    box(2.56, 0.014, 1.66, K("#2c3d78"), [0, 0.007, 0.48]);
    plane(2.5, 1.6, RUG, [0, 0.0155, 0.48], { r: FLAT });
    for (let i = 0; i < 26; i++) {
      for (const s of [-1, 1]) {
        const x = -1.2 + i * 0.096;
        bat(ROPE, new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4), [x, 0.012, 0.48 + s * 0.85], { r: [90, 0, 0] });
      }
    }
  }

  // ───────────────────────────── bench ─────────────────────────────
  const legProfile: Prof = [
    [0, 0], [0.04, 0], [0.046, 0.015], [0.046, 0.05], [0.03, 0.08], [0.03, 0.2], [0.044, 0.22], [0.05, 0.26], [0.044, 0.3],
    [0.03, 0.325], [0.03, 0.58], [0.046, 0.61], [0.052, 0.64], [0, 0.64],
  ];
  const topGrain = wood("x", "#d19556", "#bb8044", 0.04);
  const plankPaint = cel(
    paint((p) => {
      const m = (((p.z + 0.4) % 0.2) + 0.2) % 0.2;
      return m < 0.005 || m > 0.195 ? "#6e4329" : topGrain;
    }),
    "#92603a",
  );
  const backGrain = wood("y", "#c68a52", "#ad7443", 0.03);
  const backBoards = cel(paint((p) => (((p.x + 1) % 0.22) + 0.22) % 0.22 < 0.005 ? "#6e4329" : backGrain), "#8f5f3a");
  {
    box(1.94, 0.07, 0.82, plankPaint, [0, 0.885, 0]);
    box(1.94, 0.028, 0.03, W_D.x, [0, 0.846, 0.405]);
    box(0.03, 0.028, 0.82, W_D.z, [0.955, 0.846, 0]);
    box(0.03, 0.028, 0.82, W_D.z, [-0.955, 0.846, 0]);
    plane(1.74, 0.72, TOPINLAY, [0, TOP + 0.0015, 0.0], { r: FLAT });
    // apron
    box(1.74, 0.17, 0.04, W_M.x, [0, 0.755, 0.325]);
    box(1.74, 0.17, 0.04, W_M.x, [0, 0.755, -0.325]);
    box(0.04, 0.17, 0.66, W_M.z, [0.87, 0.755, 0]);
    box(0.04, 0.17, 0.66, W_M.z, [-0.87, 0.755, 0]);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = sx * 0.87, z = sz * 0.32;
        lat(legProfile, W_D.y, [x, 0, z], { seg: 8 });
        box(0.105, 0.21, 0.105, W_M.y, [x, 0.745, z]);
        bat(GOLDP, new THREE.CylinderGeometry(0.056, 0.056, 0.012, 8), [x, 0.655, z]);
        bat(GOLDP, new THREE.CylinderGeometry(0.05, 0.05, 0.01, 8), [x, 0.085, z]);
        bat(GOLDP, new THREE.CylinderGeometry(0.052, 0.052, 0.01, 8), [x, 0.24, z]);
        sph(0.022, GOLDP, [x, 0.855, z], { sc: [1, 0.7, 1] }, 6, 4);
      }
    // drawers (left and right closed, middle open)
    for (const x of [-0.58, 0.58]) {
      box(0.54, 0.135, 0.03, W_L.x, [x, 0.755, 0.355]);
      plane(0.52, 0.126, FRAME, [x, 0.755, 0.3705]);
      plane(0.1, 0.067, x < 0 ? ICON_LEAF : ICON_FLAME, [x, 0.755, 0.3715]);
      cyl(0.014, 0.014, 0.006, 8, GOLDP, [x - 0.17, 0.755, 0.372], { r: [90, 0, 0] });
      cyl(0.014, 0.014, 0.006, 8, GOLDP, [x + 0.17, 0.755, 0.372], { r: [90, 0, 0] });
      for (const dx of [-0.17, 0.17]) tor(0.015, 0.004, GOLD, [x + dx, 0.745, 0.381], {}, 4, 8);
    }
    on(drawer, () => {
      const z = 0.455;
      box(0.54, 0.135, 0.03, W_L.x, [0, 0.755, z]);
      plane(0.52, 0.126, FRAME, [0, 0.755, z + 0.0155]);
      plane(0.1, 0.067, ICON_FLASK, [0, 0.755, z + 0.0165]);
      for (const dx of [-0.17, 0.17]) {
        cyl(0.014, 0.014, 0.006, 8, GOLDP, [dx, 0.755, z + 0.017], { r: [90, 0, 0] });
        tor(0.015, 0.004, GOLD, [dx, 0.745, z + 0.026], {}, 4, 8);
      }
      box(0.02, 0.1, 0.14, W_M.z, [-0.255, 0.74, z - 0.085]);
      box(0.02, 0.1, 0.14, W_M.z, [0.255, 0.74, z - 0.085]);
      box(0.49, 0.015, 0.14, K("#3a4f9a"), [0, 0.695, z - 0.085]);
      // contents: vials, a key, a scroll
      bat("#37e2d5", new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), [-0.12, 0.74, z - 0.07], { r: [0, 0, 90] });
      bat("#ff6fb5", new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), [-0.1, 0.74, z - 0.1], { r: [0, 20, 90] });
      cyl(0.03, 0.03, 0.2, 8, CREAMP, [0.1, 0.735, z - 0.08], { r: [0, 0, 90] });
      tor(0.012, 0.003, GOLD, [0.2, 0.705, z - 0.05], { r: [90, 0, 0] }, 4, 8);
      box(0.05, 0.004, 0.006, GOLD, [0.16, 0.705, z - 0.05]);
    });
    // side panels
    for (const s of [-1, 1]) {
      plane(0.5, 0.135, FRAME, [s * 0.8905, 0.755, 0], { r: [0, s * 90, 0], sc: [1.3, 1, 1] });
      plane(0.1, 0.067, s < 0 ? ICON_LEAF : ICON_FLASK, [s * 0.8915, 0.755, 0], { r: [0, s * 90, 0] });
    }
    // lower shelf with stretchers
    box(1.74, 0.035, 0.62, W_M.x, [0, 0.26, 0]);
    for (const s of [-1, 1]) {
      box(0.04, 0.05, 0.62, W_D.z, [s * 0.87, 0.22, 0]);
      box(1.74, 0.05, 0.04, W_D.x, [0, 0.22, s * 0.32]);
      box(1.74, 0.025, 0.012, GOLDP, [0, 0.265, s * 0.31]);
    }
  }

  // ───────────────────────────── hutch ─────────────────────────────
  const HZ = -0.3;
  const S1 = 1.22 + 0.0175;
  const S2 = 1.52 + 0.0175;
  {
    for (const s of [-1, 1]) {
      box(0.07, 1.01, 0.2, W_M.y, [s * 0.9, 1.425, HZ]);
      box(0.012, 1.01, 0.012, GOLDP, [s * 0.9 - s * 0.0295, 1.425, HZ + 0.1]);
      box(0.082, 0.02, 0.212, W_D.x, [s * 0.9, 0.93, HZ]);
      for (const y of [1.22, 1.52]) box(0.082, 0.026, 0.212, W_D.x, [s * 0.9, y, HZ]);
      lat([[0, 0], [0.03, 0], [0.034, 0.03], [0.016, 0.06], [0.01, 0.075], [0, 0.09]], GOLDP, [s * 0.9, 1.93, HZ + 0.02], { seg: 8 });
      sph(0.012, GOLDP, [s * 0.9, 2.03, HZ + 0.02]);
    }
    box(1.76, 1.01, 0.02, backBoards, [0, 1.425, -0.39]);
    plane(1.76, 1.01, WALL, [0, 1.425, -0.379]);
    for (const y of [1.22, 1.52]) {
      box(1.76, 0.035, 0.22, W_M.x, [0, y, HZ]);
      box(1.78, 0.012, 0.012, GOLDP, [0, y + 0.012, HZ + 0.114]);
      box(1.76, 0.018, 0.02, W_D.x, [0, y - 0.024, HZ + 0.09]);
      for (const x of [-0.7, -0.35, 0, 0.35, 0.7])
        b.extrude(
          [[0, 0], [0.17, 0], [0.17, -0.014], [0.07, -0.045], [0.025, -0.11], [0, -0.11]],
          { x: [0, 0, 1], at: [x, y - 0.0175, -0.4], thickness: 0.03, bevel: 0.004, smoothing: 1, color: W_D.x, bone: cur },
        );
    }
    // cornice
    const half = 0.99;
    const top: [number, number][] = [];
    for (let i = 0; i <= 18; i++) {
      const x = half - (2 * half * i) / 18;
      let y = 0.075 + 0.09 * Math.pow(Math.cos((x / half) * Math.PI * 0.5), 1.5);
      y += 0.055 * Math.max(0, 1 - Math.abs(x) / 0.13);
      top.push([x, y]);
    }
    b.extrude([[-half, 0], [half, 0], [half, 0.07], ...top.slice(0, -1).map(([x, y]) => [x, y] as [number, number]), [-half, 0.07]], {
      at: [0, 1.93, -0.27], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.01, color: W_D.x, bone: cur,
    });
    plane(1.9, 0.1, VINE, [0, 1.985, -0.2335]);
    box(1.98, 0.014, 0.085, GOLDP, [0, 1.931, -0.27]);
    sph(0.034, GOLDP, [0, 2.2, -0.265], {}, 8, 6);
    cyl(0.0, 0.016, 0.06, 6, GOLDP, [0, 2.255, -0.265]);
    for (const s of [-1, 1]) {
      // gold wing flourishes on the cornice
      b.extrude([[0, 0], [0.16, 0.03], [0.26, 0.1], [0.18, 0.085], [0.1, 0.06], [0.05, 0.075]], {
        at: [s * 0.04, 2.1, -0.228], x: [s, 0, 0], thickness: 0.01, bevel: 0.002, color: GOLDP, bone: cur,
      });
    }
    // notes pinned to the wall, hooks and tools
    plane(0.1, 0.125, NOTE_A, [-0.52, 1.07, -0.372], { r: [0, 0, 4] });
    plane(0.1, 0.125, NOTE_B, [-0.38, 1.1, -0.372], { r: [0, 0, -5] });
    plane(0.1, 0.125, NOTE_A, [0.5, 1.06, -0.372], { r: [0, 0, -3] });
    for (const [x, y] of [[-0.52, 1.125], [-0.38, 1.16], [0.5, 1.115]] as const) sph(0.008, K("#c4474a"), [x, y, -0.368], {}, 5, 4);
    brod(IRON, [-0.1, 1.14, -0.372], [0.38, 1.14, -0.372], 0.007);
    for (const [x, kind] of [[-0.05, 0], [0.04, 1], [0.13, 2], [0.22, 0], [0.31, 1]] as const) {
      bat(IRON, new THREE.TorusGeometry(0.008, 0.002, 4, 6), [x, 1.14, -0.36], { r: [90, 0, 0] });
      if (kind === 0) {
        brod(COPPER, [x, 1.13, -0.36], [x, 1.03, -0.36], 0.004);
        bat(COPPER, new THREE.SphereGeometry(0.022, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.55), [x, 1.0, -0.36], { sc: [1, 1, 0.8], r: [180, 0, 0] });
      } else if (kind === 1) {
        brod(GOLDP, [x, 1.13, -0.36], [x, 1.0, -0.36], 0.004);
        bat(GOLDP, new THREE.CylinderGeometry(0.014, 0.02, 0.03, 6), [x, 0.985, -0.36]);
      } else {
        bat(GOLD, new THREE.TorusGeometry(0.02, 0.003, 4, 8), [x, 1.09, -0.36]);
        brod(GOLD, [x, 1.13, -0.36], [x, 1.07, -0.36], 0.003);
        brod(GOLD, [x, 1.07, -0.36], [x + 0.02, 1.0, -0.36], 0.003);
      }
    }
  }

  // ───────────────────────────── bottles ─────────────────────────────
  type Shape = { body: Prof; neck: Prof; lip: [number, number]; cork: [number, number]; R: number; seg: number };
  const SHAPES: Record<string, Shape> = {
    round: {
      body: [[0, 0], [0.022, 0], [0.038, 0.012], [0.045, 0.04], [0.04, 0.075], [0.028, 0.095], [0, 0.095]],
      neck: [[0, 0.092], [0.028, 0.092], [0.016, 0.115], [0.015, 0.15], [0, 0.15]], lip: [0.019, 0.15], cork: [0.014, 0.03], R: 0.045, seg: 10,
    },
    tall: {
      body: [[0, 0], [0.03, 0], [0.034, 0.01], [0.034, 0.14], [0.026, 0.17], [0, 0.17]],
      neck: [[0, 0.168], [0.026, 0.168], [0.012, 0.19], [0.012, 0.23], [0, 0.23]], lip: [0.016, 0.23], cork: [0.012, 0.03], R: 0.034, seg: 10,
    },
    square: {
      body: [[0, 0], [0.04, 0], [0.043, 0.012], [0.043, 0.09], [0.03, 0.112], [0, 0.112]],
      neck: [[0, 0.11], [0.03, 0.11], [0.015, 0.125], [0.015, 0.15], [0, 0.15]], lip: [0.019, 0.15], cork: [0.014, 0.026], R: 0.043, seg: 6,
    },
    flask: {
      body: [[0, 0], [0.052, 0], [0.054, 0.008], [0.032, 0.09], [0.018, 0.118], [0, 0.118]],
      neck: [[0, 0.116], [0.018, 0.116], [0.014, 0.135], [0.014, 0.165], [0, 0.165]], lip: [0.018, 0.165], cork: [0.012, 0.028], R: 0.054, seg: 10,
    },
    vial: {
      body: [[0, 0], [0.014, 0], [0.016, 0.008], [0.016, 0.07], [0.011, 0.085], [0, 0.085]],
      neck: [[0, 0.084], [0.011, 0.084], [0.009, 0.1], [0, 0.1]], lip: [0.012, 0.1], cork: [0.008, 0.018], R: 0.016, seg: 8,
    },
    gourd: {
      body: [[0, 0], [0.03, 0], [0.042, 0.015], [0.044, 0.04], [0.034, 0.06], [0.026, 0.075], [0.032, 0.092], [0.032, 0.11], [0.02, 0.125], [0, 0.125]],
      neck: [[0, 0.123], [0.02, 0.123], [0.012, 0.14], [0.012, 0.17], [0, 0.17]], lip: [0.016, 0.17], cork: [0.011, 0.026], R: 0.044, seg: 10,
    },
  };
  type BottleOpt = { r?: Vec3; label?: THREE.Texture; cage?: boolean; scale?: number; corkCol?: Col; ribbon?: string };
  const bottle = (at: Vec3, shape: string, liquid: string, strength = 1, o: BottleOpt = {}) => {
    const S = SHAPES[shape];
    const k = o.scale ?? 1;
    const g = Grp.of(at, o.r ?? [0, 0, 0]);
    const sc = (p: Prof): Prof => p.map(([x, y]) => [x * k, y * k] as [number, number]);
    const bodyPart = glow(lat(sc(S.body), liquid, [0, 0, 0], { g, seg: S.seg }), strength);
    lat(sc(S.neck), "#d7f3ef", [0, 0, 0], { g, seg: S.seg });
    // gold lip ring and cork
    cyl(S.lip[0] * k, S.lip[0] * k, 0.008 * k, S.seg, GOLDP, [0, (S.lip[1] - 0.006) * k, 0], { g });
    cyl(S.cork[0] * k * 0.9, S.cork[0] * k, S.cork[1] * k, 7, o.corkCol ?? CORK, [0, (S.lip[1] + S.cork[1] / 2 - 0.004) * k, 0], { g });
    // highlights
    const hy = S.body[S.body.length - 3]?.[1] ?? 0.05;
    bat("#ffffff", new THREE.SphereGeometry(0.01 * k, 5, 4), [-S.R * 0.62 * k, hy * 0.55 * k + 0.012 * k, S.R * 0.62 * k], { g, sc: [0.55, 2.8, 0.35], r: [0, -45, 0] });
    bat("#ffffff", new THREE.SphereGeometry(0.006 * k, 5, 4), [-S.R * 0.5 * k, hy * 0.25 * k + 0.006 * k, S.R * 0.78 * k], { g, sc: [0.6, 1, 0.4], r: [0, -35, 0] });
    if (o.cage) {
      for (const y of [0.3, 0.62]) bat(GOLDP, new THREE.TorusGeometry(S.R * k * (shape === "round" ? 0.98 : 1.02), 0.0025 * k, 4, 10), [0, hy * y * k * 1.4, 0], { g, r: [90, 0, 0] });
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        brod(GOLDP, g.pt([Math.cos(a) * S.R * 0.93 * k, 0.012 * k, Math.sin(a) * S.R * 0.93 * k]), g.pt([Math.cos(a) * S.lip[0] * k, S.lip[1] * k, Math.sin(a) * S.lip[0] * k]), 0.0018 * k, 4);
      }
    }
    if (o.ribbon) bat(o.ribbon, new THREE.TorusGeometry(S.neck[2]?.[0] ?? 0.015, 0.003 * k, 4, 8), [0, (S.lip[1] - 0.025) * k, 0], { g, r: [90, 0, 0] });
    if (o.label) {
      const hh = hy * k * 0.78;
      b.decal(b.surface(bodyPart), o.label, { at: g.pt([S.R * 0.2 * k, hy * 0.45 * k, S.R * k]), dir: g.dir([0, 0, 1]), size: [Math.min(0.5, hh * 0.8), hh], segments: 5, lift: 0.002, bone: cur });
    }
    return g;
  };

  // ───────────────────────────── books ─────────────────────────────
  const lyingBook = (c: Vec3, w: number, h: number, d: number, col: Col, rotY: number, orn = true, strap = false) => {
    const g = Grp.of(c, [0, rotY, 0]);
    box(w - 0.012, h - 0.016, d - 0.008, PAGES, [0.006, 0, 0], { g });
    box(w, 0.008, d, col, [0, h / 2 - 0.004, 0], { g });
    box(w, 0.008, d, col, [0, -h / 2 + 0.004, 0], { g });
    box(0.014, h, d, col, [-w / 2 + 0.007, 0, 0], { g });
    for (const sx of [-1, 1] as const) for (const sz of [-1, 1] as const) bat(GOLDP, new THREE.BoxGeometry(0.03, h + 0.003, 0.03), [(sx * (w - 0.03)) / 2 + (sx > 0 ? 0 : 0.012), 0, (sz * (d - 0.03)) / 2], { g });
    for (const dz of [-0.35, 0, 0.35]) bat(GOLDP, new THREE.BoxGeometry(0.018, h + 0.003, 0.012), [-w / 2 + 0.007, 0, dz * d], { g });
    if (orn) plane(w * 0.78, d * 0.82, ORN, [0.006, h / 2 + 0.0015, 0], { g, r: [-90, 0, 90], sc: [1, 1, 1] });
    if (strap) {
      box(0.022, h + 0.012, d + 0.006, K("#6a4228"), [w * 0.18, 0, 0], { g });
      box(0.026, 0.012, 0.03, GOLDP, [w * 0.18, h / 2 + 0.008, 0], { g });
    }
    return g;
  };
  const standBook = (x: number, y0: number, z: number, w: number, h: number, d: number, col: Col, lean = 0) => {
    const g = Grp.of([x, y0, z], [0, 0, lean]);
    box(w, h, d, col, [0, h / 2, 0], { g });
    box(w - 0.01, 0.0015, d - 0.012, PAGES, [0, h + 0.0004, -0.002], { g });
    for (const y of [0.16, 0.5, 0.84]) bat(GOLDP, new THREE.BoxGeometry(w + 0.003, 0.006, 0.003), [0, h * y, d / 2 + 0.0008], { g });
    box(w * 0.7, h * 0.14, 0.003, CREAMP, [0, h * 0.67, d / 2 + 0.0015], { g });
    bat(INKC, new THREE.BoxGeometry(w * 0.45, 0.0025, 0.0015), [0, h * 0.67, d / 2 + 0.003], { g });
  };

  // ───────────────────────────── bench top: left cluster ─────────────────────────────
  {
    // stack of books with a hinged top cover
    lyingBook([STACK[0], TOP + 0.03, STACK[2]], 0.36, 0.06, 0.26, LEATH.navy, 6);
    lyingBook([STACK[0] + 0.01, TOP + 0.06 + 0.026, STACK[2]], 0.32, 0.052, 0.24, LEATH.red, -8, true, true);
    lyingBook([STACK[0] - 0.005, TOP + 0.06 + 0.052 + 0.023, STACK[2]], 0.3, 0.046, 0.22, LEATH.teal, 10);
    // 4th book: pages fixed, cover hinged
    const y4 = TOP + 0.06 + 0.052 + 0.046 + 0.026;
    const g4 = Grp.of([STACK[0], y4, STACK[2]], [0, -3, 0]);
    box(0.264, 0.044, 0.196, PAGES, [0.0, 0, 0], { g: g4 });
    box(0.27, 0.008, 0.2, LEATH.purple, [0, -0.026, 0], { g: g4 });
    box(0.014, 0.052, 0.2, LEATH.purple, [-0.128, 0, 0], { g: g4 });
    for (const dz of [-0.06, 0, 0.06]) bat(GOLDP, new THREE.BoxGeometry(0.018, 0.056, 0.012), [-0.128, 0, dz], { g: g4 });
    on(cover, () => {
      const gc = Grp.of([STACK[0] - 0.135, COVER_Y, STACK[2]], [0, -3, 0]);
      box(0.27, 0.008, 0.2, LEATH.purple, [0.135, 0.004, 0], { g: gc });
      plane(0.21, 0.16, ORN, [0.135, 0.0085, 0], { g: gc, r: [-90, 0, 90] });
      for (const sx of [0.012, 0.258]) for (const sz of [-0.085, 0.085]) bat(GOLDP, new THREE.BoxGeometry(0.03, 0.01, 0.03), [sx, 0.004, sz], { g: gc });
      // ribbon bookmark hanging from the cover
      box(0.01, 0.002, 0.07, K("#c4474a"), [0.2, 0.0005, 0.135], { g: gc });
    });
    // gold-tasselled bookmark ribbon on the pages
    box(0.012, 0.001, 0.08, K("#c4474a"), [STACK[0] + 0.05, y4 + 0.0225, STACK[2] + 0.12], { r: [0, -3, 0] });
    b.cards([frame([STACK[0] + 0.05, y4 + 0.022, STACK[2] + 0.165], [0, 1, 0])], TASSEL, { size: [0.016, 0.042], lean: 150, flow: [0, 0, 1], bone: cur, cross: true });

    // candle in a brass dish on the bench corner
    const cx = -0.88, cz = 0.28;
    lat([[0, 0], [0.065, 0], [0.07, 0.008], [0.06, 0.016], [0.02, 0.02], [0.012, 0.04], [0, 0.04]], GOLDP, [cx, TOP, cz], { seg: 10 });
    tor(0.036, 0.007, GOLDP, [cx + 0.07, TOP + 0.025, cz], { r: [0, 0, 0] }, 4, 8);
    cyl(0.026, 0.028, 0.15, 10, WAX, [cx, TOP + 0.115, cz]);
    lat([[0, 0], [0.032, 0], [0.034, 0.01], [0.03, 0.025], [0.026, 0.05], [0, 0.052]], WAX, [cx, TOP + 0.04, cz], { seg: 10 });
    for (const a of [20, 140, 255]) {
      const ar = rad(a);
      cyl(0.006, 0.0035, 0.045, 5, WAX, [cx + Math.cos(ar) * 0.025, TOP + 0.12, cz + Math.sin(ar) * 0.025]);
      sph(0.007, WAX, [cx + Math.cos(ar) * 0.025, TOP + 0.097, cz + Math.sin(ar) * 0.025], {}, 5, 4);
    }
    cyl(0.002, 0.002, 0.016, 4, INKC, [cx, TOP + 0.198, cz]);
    glow(sph(0.014, "#ffd45a", [cx, TOP + 0.222, cz], { sc: [0.8, 1.8, 0.8] }, 6, 5), 1.4);
    glow(sph(0.007, "#fff3b8", [cx, TOP + 0.216, cz], { sc: [0.8, 1.7, 0.8] }, 5, 4), 1.2);

    // inkwell and quill
    const ix = -0.6, iz = 0.3;
    lat([[0, 0], [0.04, 0], [0.046, 0.012], [0.046, 0.045], [0.034, 0.058], [0.018, 0.062], [0.018, 0.074], [0.026, 0.074], [0.026, 0.082], [0, 0.082]], K("#2b3b6e", "#1a2350"), [ix, TOP, iz], { seg: 8 });
    lat([[0.02, 0.07], [0.03, 0.074], [0.03, 0.084], [0.02, 0.084]], GOLDP, [ix, TOP, iz], { seg: 8 });
    sph(0.016, "#1a1a3a", [ix, TOP + 0.082, iz], { sc: [1, 0.3, 1] }, 6, 4);
    bat("#ffffff", new THREE.SphereGeometry(0.008, 5, 4), [ix - 0.026, TOP + 0.038, iz + 0.03], { sc: [0.6, 2.4, 0.4], r: [0, -35, 0] });
    b.cards([frame([ix + 0.005, TOP + 0.07, iz], [0.35, 1, 0.12])], QUILL, { size: [0.045, 0.24], lean: 0, flow: [0, 0, 1], bone: cur });
    box(0.15, 0.006, 0.11, K("#e8d8a8"), [ix + 0.06, TOP + 0.003, iz + 0.07], { r: [0, 14, 0] });

    // open tome on a wooden stand, with glowing runes floating above
    const tg = Grp.of([-0.4, TOP, 0.1], [0, 4, 0]);
    b.extrude([[0, 0], [0.24, 0], [0.24, 0.185], [0, 0.008]], {
      at: tg.pt([0, 0, 0.12]), x: tg.dir([0, 0, -1]), y: [0, 1, 0], thickness: 0.3, bevel: 0.004, color: W_D.x, bone: cur,
    });
    const bg = Grp.of([0, 0.115, 0.0], [40, 0, 0], tg);
    box(0.4, 0.012, 0.28, LEATH.navy, [0, -0.01, 0], { g: bg });
    for (const s of [-1, 1] as const) {
      box(0.19, 0.022, 0.25, PAGES, [s * 0.1, 0.006, 0], { g: bg });
      plane(0.17, 0.23, s < 0 ? PAGE_L : PAGE_R, [s * 0.1, 0.0175, 0], { g: bg, r: [-90, 0, 0] });
      box(0.205, 0.006, 0.272, LEATH.navy, [s * 0.1, -0.002, 0], { g: bg });
      bat(GOLDP, new THREE.BoxGeometry(0.03, 0.012, 0.03), [s * 0.19, -0.002, 0.125], { g: bg });
      bat(GOLDP, new THREE.BoxGeometry(0.03, 0.012, 0.03), [s * 0.19, -0.002, -0.125], { g: bg });
    }
    cyl(0.008, 0.008, 0.27, 6, LEATH.navy, [0, 0.012, 0], { g: bg, r: [90, 0, 0] });
    // wooden page-holder arms
    for (const s of [-1, 1] as const) box(0.07, 0.003, 0.012, GOLDP, [s * 0.14, 0.019, 0.08], { g: bg });
    // floating rune circle
    on(runeJ, () => {
      const rf = frame([-0.552, 1.19, 0.12], [0, 1, 0.9]);
      glow(b.cards([rf], RUNES, { size: 0.38, lean: 90, flow: [1, 0, 0], mirror: true, bone: cur }), 1.0);
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7;
        glow(sph(0.006 + (i % 3) * 0.002, "#9ffcf0", [-0.4 + Math.cos(a) * 0.2, 1.3 + Math.sin(a) * 0.1 + (i % 3) * 0.03, 0.12 + Math.sin(a) * 0.1], {}, 4, 3), 1.4);
      }
    });
  }

  // ───────────────────────────── the still (centre) ─────────────────────────────
  {
    const SX = -0.04, SZ = 0.0;
    // stone stove with fire window
    box(0.36, 0.2, 0.32, STONE, [SX, TOP + 0.1, SZ]);
    box(0.385, 0.02, 0.345, TEAL, [SX, TOP + 0.01, SZ]);
    box(0.385, 0.026, 0.345, TEAL, [SX, TOP + 0.2, SZ]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bat(GOLDP, new THREE.BoxGeometry(0.018, 0.2, 0.018), [SX + sx * 0.18, TOP + 0.1, SZ + sz * 0.16]);
    bat(GOLDP, new THREE.BoxGeometry(0.386, 0.008, 0.346), [SX, TOP + 0.186, SZ]);
    box(0.17, 0.095, 0.014, "#1c1018", [SX, TOP + 0.092, SZ + 0.165]);
    glow(plane(0.15, 0.085, FIRE, [SX, TOP + 0.092, SZ + 0.1725]), 1.3);
    box(0.19, 0.012, 0.02, GOLDP, [SX, TOP + 0.147, SZ + 0.17]);
    box(0.19, 0.012, 0.02, GOLDP, [SX, TOP + 0.04, SZ + 0.17]);
    for (const s of [-1, 1]) {
      box(0.012, 0.11, 0.02, GOLDP, [SX + s * 0.1, TOP + 0.093, SZ + 0.17]);
      for (let i = 0; i < 4; i++) bat("#3a2a2a", new THREE.BoxGeometry(0.05, 0.008, 0.01), [SX + s * 0.14, TOP + 0.05 + i * 0.03, SZ + 0.165]);
    }
    sph(0.014, GOLDP, [SX, TOP + 0.168, SZ + 0.175], {}, 6, 4);
    for (const s of [-1, 1]) box(0.04, 0.05, 0.002, TEAL, [SX + s * 0.14, TOP + 0.12, SZ + 0.16]);
    // grate and copper pot
    for (const dx of [-0.08, 0, 0.08]) box(0.008, 0.006, 0.3, IRON, [SX + dx, TOP + 0.218, SZ]);
    const PY = TOP + 0.222;
    const potBody = lat([[0, 0], [0.12, 0], [0.15, 0.04], [0.162, 0.1], [0.15, 0.17], [0.124, 0.212], [0.13, 0.226], [0.108, 0.232], [0.105, 0.218], [0, 0.218]], COPPER, [SX, PY, SZ], { seg: 12 });
    b.decal(b.surface(potBody), EMBLEM, { at: [SX, PY + 0.105, SZ + 0.165], dir: [0, 0, 1], size: [0.1, 0.1], segments: 8, lift: 0.002, bone: cur });
    lat([[0.1, 0.205], [0.134, 0.215], [0.134, 0.232], [0.1, 0.232]], GOLDP, [SX, PY, SZ], { seg: 12 });
    lat([[0, 0], [0.11, 0], [0.116, 0.02], [0.095, 0.075], [0.07, 0.14], [0.05, 0.18], [0.042, 0.215], [0.05, 0.232], [0.034, 0.24], [0, 0.24]], COPPER, [SX, PY + 0.226, SZ], { seg: 12 });
    // rivet bands and handles on the pot
    for (const y of [0.06, 0.15]) for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const r = y < 0.1 ? 0.158 : 0.152;
      bat(GOLDP, new THREE.SphereGeometry(0.0075, 5, 4), [SX + Math.cos(a) * r, PY + y, SZ + Math.sin(a) * r]);
    }
    for (const s of [-1, 1]) {
      tor(0.04, 0.009, IRON, [SX + s * 0.168, PY + 0.14, SZ], { r: [0, 90, 0] }, 5, 8);
      sph(0.014, GOLDP, [SX + s * 0.162, PY + 0.14, SZ], {}, 5, 4);
    }
    bat(GOLDP, new THREE.TorusGeometry(0.108, 0.006, 4, 12), [SX, PY + 0.226, SZ], { r: [90, 0, 0] });
    // swan neck to the condenser, tube wound as a coil, tap and receiving bottle
    const CXc = 0.3;
    const neck = catmull([[SX, PY + 0.45, SZ], [SX + 0.005, PY + 0.52, SZ], [SX + 0.1, PY + 0.55, SZ], [0.22, PY + 0.5, SZ], [0.34, PY + 0.4, SZ], [0.41, PY + 0.27, SZ]]);
    b.sweep(neck, [0.03, 0.019], { color: COPPER, bone: cur, sides: 8, caps: "round" });
    b.sweep(neck, 0.021, { color: GOLDP, bone: cur, sides: 8, from: 0.4, to: 0.44, caps: "none" });
    // condenser vessel on a plinth
    box(0.26, 0.185, 0.26, W_D.x, [CXc, TOP + 0.0925, SZ]);
    box(0.28, 0.02, 0.28, GOLDP, [CXc, TOP + 0.19, SZ]);
    lat([[0, 0], [0.1, 0], [0.108, 0.02], [0.105, 0.3], [0.112, 0.31], [0.1, 0.325], [0, 0.325]], TEAL, [CXc, TOP + 0.2, SZ], { seg: 12 });
    lat([[0.04, 0.32], [0.106, 0.325], [0.11, 0.34], [0.06, 0.37], [0.02, 0.385], [0, 0.39], [0, 0.32]], TEAL, [CXc, TOP + 0.2, SZ], { seg: 12 });
    sph(0.02, GOLDP, [CXc, TOP + 0.2 + 0.405, SZ], {}, 6, 5);
    const coil = spiral([CXc, TOP + 0.2 + 0.3, SZ], [CXc + 0.118, TOP + 0.2 + 0.3, SZ], [0, 1, 0], { turns: 3.75, pitch: -0.072 });
    b.sweep(coil, 0.0095, { color: COPPER, bone: cur, sides: 5, caps: "round" });
    b.sweep(catmull([[CXc + 0.118, TOP + 0.2 + 0.3, SZ], [0.41, PY + 0.27, SZ]]), 0.0095, { color: COPPER, bone: cur, sides: 5 });
    // tap and spout
    const tapY = TOP + 0.2 + 0.3 - 0.072 * 3.75;
    box(0.04, 0.03, 0.04, GOLDP, [CXc + 0.12, tapY - 0.015, SZ]);
    b.sweep(catmull([[CXc + 0.12, tapY, SZ], [CXc + 0.16, tapY - 0.02, SZ], [CXc + 0.185, tapY - 0.05, SZ]]), 0.01, { color: COPPER, bone: cur, sides: 5, caps: "round" });
    // receiving bottle
    bottle([CXc + 0.185, TOP, SZ], "round", "#37e2d5", 1.2, { cage: true, scale: 1.25, label: LAB_DROP });
    glow(sph(0.007, "#bff9f3", [CXc + 0.185, tapY - 0.07, SZ], { sc: [0.8, 1.4, 0.8] }, 5, 4), 1.4);
    // heat shimmer motes above the pot head
    for (let i = 0; i < 6; i++) {
      const a = i * 1.1;
      glow(sph(0.005 + (i % 2) * 0.003, i % 2 ? "#ffe9a0" : "#9ffcf0", [SX + Math.cos(a) * (0.05 + i * 0.012), PY + 0.55 + i * 0.045, SZ + Math.sin(a) * 0.05], {}, 4, 3), 1.3);
    }
    // small bellows by the stove
    const bx = SX - 0.255, bz = SZ + 0.11;
    const bg2 = Grp.of([bx, TOP, bz], [0, 55, 0]);
    box(0.1, 0.014, 0.1, W_D.x, [0, 0.07, 0.0], { g: bg2, r: [0, 0, 0], sc: [1, 1, 1] });
    b.extrude([[0, 0], [0.16, 0.0], [0.07, 0.07], [0.0, 0.07]], { at: bg2.pt([-0.05, 0.0, 0]), x: bg2.dir([1, 0, 0]), y: [0, 1, 0], thickness: 0.09, color: LEATH.brown, bone: cur });
    cyl(0.01, 0.014, 0.12, 6, IRON, [0.1, 0.025, 0], { g: bg2, r: [0, 0, 90] });
  }

  // ───────────────────────────── scales ─────────────────────────────
  {
    const [cx, cy, cz] = BEAM_C;
    // base and pillar (static)
    lat([[0, 0], [0.085, 0], [0.09, 0.012], [0.07, 0.03], [0.03, 0.05], [0.02, 0.08], [0.012, 0.1], [0.012, 0.35], [0.02, 0.36], [0.02, 0.376], [0.012, 0.384], [0, 0.386]], GOLDP, [cx, TOP, cz], { seg: 10 });
    lat([[0.012, 0.18], [0.03, 0.2], [0.03, 0.23], [0.012, 0.25]], GOLDP, [cx, TOP, cz], { seg: 8 });
    box(0.05, 0.02, 0.05, GOLDP, [cx, TOP + 0.01, cz]);
    tor(0.05, 0.007, GOLDP, [cx, TOP + 0.022, cz], { r: [90, 0, 0] }, 4, 10);
    box(0.012, 0.09, 0.012, IRON, [cx, TOP + 0.3, cz + 0.014]);
    glow(sph(0.01, "#ffe27a", [cx, TOP + 0.255, cz + 0.014], {}, 5, 4), 1);
    // beam (hinged)
    on(beam, () => {
      box(0.34, 0.014, 0.014, GOLDP, [cx, cy, cz]);
      for (const s of [-1, 1]) {
        sph(0.014, GOLDP, [cx + s * 0.165, cy, cz], { sc: [1, 1, 0.7] }, 6, 5);
        cyl(0.003, 0.003, 0.03, 4, GOLDP, [cx + s * 0.15, cy + 0.016, cz], { r: [0, 0, 0] });
        bat(GOLDP, new THREE.SphereGeometry(0.01, 5, 4), [cx + s * 0.075, cy + 0.01, cz], { sc: [1, 0.8, 0.8] });
      }
      sph(0.016, GOLDP, [cx, cy, cz], { sc: [1, 1, 0.9] }, 6, 5);
      // pointer needle
      box(0.004, 0.065, 0.003, "#3a2a2a", [cx, cy - 0.04, cz + 0.014]);
      box(0.018, 0.01, 0.01, GOLD, [cx, cy + 0.022, cz]);
    });
    // pans
    const panBuilder = (bone: Bone, ex: number, weights: boolean) =>
      on(bone, () => {
        const py = cy - 0.19;
        lat([[0, 0], [0.04, 0], [0.075, 0.016], [0.08, 0.026], [0.074, 0.026], [0.07, 0.02], [0.038, 0.008], [0, 0.008]], GOLDP, [ex, py, cz], { seg: 12 });
        tor(0.078, 0.004, GOLDP, [ex, py + 0.026, cz], { r: [90, 0, 0] }, 4, 12);
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3 + 0.5;
          brod(GOLD, [ex, cy - 0.01, cz], [ex + Math.cos(a) * 0.075, py + 0.024, cz + Math.sin(a) * 0.075], 0.0016, 4);
        }
        bat(GOLDP, new THREE.SphereGeometry(0.008, 5, 4), [ex, cy - 0.01, cz]);
        if (weights) {
          for (const [dx, dz, r, h] of [[-0.02, 0.0, 0.017, 0.022], [0.02, 0.012, 0.013, 0.017], [0.0, -0.028, 0.01, 0.013]] as const) {
            cyl(r * 0.8, r, h, 8, GOLDP, [ex + dx, py + 0.008 + h / 2, cz + dz]);
            sph(r * 0.35, GOLDP, [ex + dx, py + 0.008 + h + r * 0.2, cz + dz], {}, 5, 4);
          }
        } else {
          glow(
            b.part(new THREE.OctahedronGeometry(0.026, 0), "#6fe3d6", { at: [ex - 0.01, py + 0.04, cz], rotation: [0, 20, 8], bone: cur, scale: [0.9, 1.4, 0.9] }),
            1,
          );
          glow(b.part(new THREE.OctahedronGeometry(0.016, 0), "#a8f5ec", { at: [ex + 0.03, py + 0.025, cz + 0.015], rotation: [10, 40, 0], bone: cur, scale: [0.9, 1.3, 0.9] }), 1);
          for (let i = 0; i < 3; i++) b.cards([frame([ex + (i - 1) * 0.03, py + 0.012, cz - 0.02], [0.1 * (i - 1), 1, -0.1])], HERB_MINT, { size: [0.04, 0.07], lean: 25, flow: [0, 0, -1], bone: cur, cross: true });
        }
      });
    panBuilder(panL, cx + 0.15, true);
    panBuilder(panR, cx - 0.15, false);
  }

  // ───────────────────────────── bench top: right cluster & front row ─────────────────────────────
  {
    // mortar and pestle
    const mx = 0.5, mz = 0.32;
    lat([[0, 0], [0.04, 0], [0.065, 0.014], [0.075, 0.05], [0.076, 0.075], [0.068, 0.075], [0.064, 0.05], [0.05, 0.03], [0, 0.028]], STONE, [mx, TOP, mz], { seg: 10 });
    lat([[0.05, 0.002], [0.06, 0.006], [0.06, 0.02], [0.05, 0.02]], GOLDP, [mx, TOP, mz], { seg: 10 });
    bat(GOLDP, new THREE.TorusGeometry(0.073, 0.004, 4, 10), [mx, TOP + 0.075, mz], { r: [90, 0, 0] });
    sph(0.055, K("#6fb14f", "#3f8248"), [mx, TOP + 0.034, mz], { sc: [1, 0.55, 1] }, 8, 5);
    for (let i = 0; i < 5; i++) bat("#b8e86a", new THREE.SphereGeometry(0.009, 5, 4), [mx + Math.cos(i * 1.3) * 0.035, TOP + 0.052, mz + Math.sin(i * 1.3) * 0.035], { sc: [1.3, 0.6, 1] });
    const pq = Grp.of([mx + 0.01, TOP + 0.05, mz], [0, 0, -34]);
    cyl(0.011, 0.016, 0.16, 8, STONE, [0, 0.08, 0], { g: pq });
    sph(0.022, STONE, [0, 0.165, 0], { g: pq }, 8, 6);
    bat(GOLDP, new THREE.CylinderGeometry(0.013, 0.013, 0.012, 8), [0, 0.1, 0], { g: pq });
    // herb bundle and loose herbs
    const hx = 0.86, hz = 0.28;
    b.cards(
      [0, 1, 2, 3, 4].map((i) => frame([hx - i * 0.012, TOP + 0.006 + i * 0.001, hz + (i - 2) * 0.012], [0, 1, 0])),
      [HERB_LAV, HERB_MINT, HERB_FLW],
      { size: [0.1, 0.26], lean: 82, flow: [-0.2, 0, -1], bone: cur, rng: rng(5), spin: 6, vary: 0.1 },
    );
    cyl(0.018, 0.018, 0.012, 8, ROPE, [hx - 0.02, TOP + 0.012, hz - 0.12], { r: [90, 0, 0], sc: [1, 1, 1] });
    // scroll partially unrolled
    const sg = Grp.of([0.38, TOP, 0.14], [0, -18, 0]);
    box(0.2, 0.004, 0.11, K("#efdcab"), [0, 0.002, 0], { g: sg });
    plane(0.2, 0.112, SCROLL, [0, 0.0045, 0], { g: sg, r: [-90, 0, 0] });
    cyl(0.017, 0.017, 0.12, 8, K("#f3e3b8", "#cdb585"), [-0.1, 0.017, 0], { g: sg, r: [90, 0, 0] });
    cyl(0.009, 0.009, 0.14, 6, W_D.x, [-0.1, 0.017, 0], { g: sg, r: [90, 0, 0] });
    sph(0.011, GOLDP, [-0.1, 0.017, 0.07], { g: sg });
    sph(0.011, GOLDP, [-0.1, 0.017, -0.07], { g: sg });
    // curled right end
    cyl(0.011, 0.011, 0.114, 8, K("#f3e3b8", "#cdb585"), [0.1, 0.011, 0], { g: sg, r: [90, 0, 0] });
    sph(0.014, "#c4474a", [0.02, 0.008, 0.04], { g: sg, sc: [1, 0.4, 1] }, 6, 4);
    // vial rack
    const rx = -0.1, rz = 0.34;
    box(0.2, 0.03, 0.07, W_D.x, [rx, TOP + 0.015, rz]);
    for (let i = 0; i < 5; i++) {
      const x = rx - 0.08 + i * 0.04;
      cyl(0.018, 0.018, 0.012, 8, W_D.x, [x, TOP + 0.036, rz]);
      const col = ["#ff6fb5", "#ffb02e", "#9be83c", "#6fc3ff", "#a577ff"][i];
      bottle([x, TOP + 0.03, rz], "vial", col, 1, { corkCol: i % 2 ? CORK : K("#c4474a"), scale: 1.2 });
    }
    // potions near the front right
    bottle([0.14, TOP, 0.3], "flask", "#ffb02e", 1.1, { label: LAB_FLAME, ribbon: "#c4474a" });
    bottle([0.24, TOP, 0.34], "gourd", "#a577ff", 1.1, { label: LAB_WIND, cage: true });
    // a sprouting plant pot with glowing flowers (left rear of the bench)
    const px = 0.1, pz = -0.2;
    lat([[0, 0], [0.04, 0], [0.058, 0.02], [0.065, 0.08], [0.07, 0.085], [0.07, 0.095], [0.06, 0.095], [0.058, 0.085], [0, 0.085]], K("#d9774a", "#a64a42"), [px, TOP, pz], { seg: 10 });
    bat(GOLDP, new THREE.TorusGeometry(0.063, 0.004, 4, 10), [px, TOP + 0.045, pz], { r: [90, 0, 0] });
    cyl(0.058, 0.058, 0.01, 10, K("#4a3226", "#2a1c1c"), [px, TOP + 0.085, pz]);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + 0.3, tx = px + Math.cos(a) * 0.035, tz = pz + Math.sin(a) * 0.035, ty = TOP + 0.2 + (i % 2) * 0.04;
      b.sweep(catmull([[px, TOP + 0.09, pz], [px + Math.cos(a) * 0.015, TOP + 0.14, pz + Math.sin(a) * 0.015], [tx, ty, tz]]), 0.0045, { color: "#4a9a4a", bone: cur, sides: 4, caps: "round" });
      glow(b.cards([frame([tx, ty, tz], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5])], FLOWER_GLOW, { size: 0.07, lean: 0, flow: [0, 0, 1], cross: true, bone: cur }), 1.3);
    }
    b.cards([0, 1, 2, 3, 4, 5].map((i) => frame([px + Math.cos(i * 1.05) * 0.03, TOP + 0.092, pz + Math.sin(i * 1.05) * 0.03], [0, 1, 0])), HERB_FLW, { size: [0.05, 0.1], lean: 55, flow: (_f, i) => [Math.cos(i * 1.05), 0, Math.sin(i * 1.05)], bone: cur, cross: false });

    // back row on the bench: jars
    const jar = (x: number, z: number, col: Col, lid: Col, tex?: THREE.Texture, h = 0.17) => {
      const jp = lat([[0, 0], [0.056, 0], [0.068, 0.02], [0.07, h * 0.7], [0.058, h], [0.046, h + 0.012], [0.046, h + 0.02], [0, h + 0.02]], col, [x, TOP, z], { seg: 10 });
      cyl(0.05, 0.05, 0.022, 10, lid, [x, TOP + h + 0.03, z]);
      sph(0.012, GOLDP, [x, TOP + h + 0.048, z], {}, 6, 4);
      bat(GOLDP, new THREE.TorusGeometry(0.0475, 0.004, 4, 10), [x, TOP + h + 0.016, z], { r: [90, 0, 0] });
      if (tex) b.decal(b.surface(jp), tex, { at: [x, TOP + h * 0.5, z + 0.07], dir: [0, 0, 1], size: [0.07, 0.085], segments: 5, lift: 0.002, bone: cur });
    };
    jar(-0.5, -0.14, TEAL, GOLDP, LAB_LEAF);
    jar(0.5, -0.17, K("#e8cf98", "#b99a68"), W_D.x, LAB_WIND, 0.2);
    jar(0.64, -0.1, K("#9a66c8", "#6b479a"), GOLDP, LAB_DROP, 0.14);
  }

  // ───────────────────────────── hutch contents ─────────────────────────────
  {
    // lower shelf: bottles, jars, books, hourglass
    const z = -0.285;
    bottle([-0.8, S1, z], "square", "#9be83c", 1, { label: LAB_LEAF, scale: 1.1 });
    bottle([-0.68, S1, z], "tall", "#a577ff", 1.1, { cage: true });
    bottle([-0.57, S1, z + 0.02], "round", "#ff6fb5", 1.1, { label: LAB_FLAME });
    // mini book stack
    lyingBook([-0.4, S1 + 0.02, z], 0.17, 0.04, 0.12, LEATH.brown, 8, false);
    lyingBook([-0.4, S1 + 0.057, z], 0.15, 0.034, 0.11, LEATH.green, -6, false);
    bottle([-0.4, S1 + 0.074, z], "vial", "#ffb02e", 1.1, { scale: 1.3 });
    // hourglass
    const hx = -0.22;
    cyl(0.04, 0.04, 0.012, 8, W_D.x, [hx, S1 + 0.006, z]);
    cyl(0.04, 0.04, 0.012, 8, W_D.x, [hx, S1 + 0.168, z]);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      cyl(0.0035, 0.0035, 0.156, 4, GOLDP, [hx + Math.cos(a) * 0.036, S1 + 0.087, z + Math.sin(a) * 0.036]);
    }
    lat([[0, 0], [0.03, 0], [0.032, 0.014], [0.014, 0.06], [0.004, 0.075], [0.014, 0.09], [0.032, 0.136], [0.03, 0.15], [0, 0.15]], "#d9f1ee", [hx, S1 + 0.006, z], { seg: 8 });
    lat([[0, 0], [0.022, 0], [0.026, 0.01], [0.012, 0.045], [0.0, 0.06]], "#ffd27a", [hx, S1 + 0.012, z], { seg: 8 });
    lat([[0, 0], [0.018, 0.0], [0.008, 0.02], [0.0, 0.026]], "#ffd27a", [hx, S1 + 0.098, z], { seg: 8 });
    // mushroom jar
    const mj = lat([[0, 0], [0.05, 0], [0.058, 0.02], [0.06, 0.14], [0.05, 0.16], [0.042, 0.168], [0.042, 0.176], [0, 0.176]], "#bfe6df", [-0.04, S1, z], { seg: 10 });
    cyl(0.046, 0.046, 0.02, 10, W_D.x, [-0.04, S1 + 0.19, z]);
    for (const [dx, dz, s] of [[-0.02, 0.01, 1], [0.02, -0.01, 0.8], [0.01, 0.025, 0.6]] as const) {
      cyl(0.008 * s, 0.01 * s, 0.07 * s, 6, CREAMP, [-0.04 + dx, S1 + 0.045 * s + 0.01, z + dz]);
      lat([[0, 0], [0.04 * s, 0], [0.036 * s, 0.014 * s], [0.018 * s, 0.028 * s], [0, 0.03 * s]], cel(spots("#e0554f", "#fff2d4", { size: 0.018, amount: 0.5, seed: 7 })), [-0.04 + dx, S1 + 0.07 * s + 0.01, z + dz], { seg: 8 });
    }
    b.decal(b.surface(mj), LAB_LEAF, { at: [-0.04, S1 + 0.085, z + 0.06], dir: [0, 0, 1], size: [0.07, 0.085], segments: 5, lift: 0.002, bone: cur });
    // three potions
    bottle([0.14, S1, z], "gourd", "#37e2d5", 1.2, { label: LAB_WIND, cage: true });
    bottle([0.25, S1, z + 0.02], "flask", "#6fc3ff", 1.1, { label: LAB_DROP });
    bottle([0.36, S1, z], "round", "#ff5a5a", 1.1, { cage: true, ribbon: "#f6c453" });
    // small cauldron
    lat([[0, 0.02], [0.03, 0.0], [0.06, 0.02], [0.07, 0.07], [0.062, 0.1], [0.07, 0.11], [0.058, 0.115], [0.054, 0.1], [0, 0.1]], IRON, [0.57, S1, z], { seg: 10 });
    glow(cyl(0.056, 0.056, 0.004, 10, "#9be83c", [0.57, S1 + 0.1, z]), 1.1);
    for (const s of [-1, 1]) tor(0.02, 0.004, IRON, [0.57 + s * 0.07, S1 + 0.085, z], { r: [0, 90, 0] }, 4, 8);
    for (const a of [0, 120, 240]) cyl(0.006, 0.004, 0.03, 4, IRON, [0.57 + Math.cos(rad(a)) * 0.04, S1 + 0.012, z + Math.sin(rad(a)) * 0.04], { r: [0, 0, 0] });
    // jar pair
    jarPair();
    // upper shelf: standing books, armillary, owl, crystal orb
    let x = -0.86;
    const cols = [LEATH.navy, LEATH.red, LEATH.teal, LEATH.green, LEATH.purple, LEATH.brown, LEATH.navy];
    const dims: [number, number][] = [[0.04, 0.22], [0.05, 0.25], [0.035, 0.2], [0.055, 0.26], [0.04, 0.23], [0.045, 0.21], [0.038, 0.24]];
    dims.forEach(([w, h], i) => {
      standBook(x + w / 2, S2, z, w, h, 0.16, cols[i]);
      x += w + 0.002;
    });
    standBook(x + 0.07, S2 + 0.004, z, 0.04, 0.22, 0.16, LEATH.red, 14);
    sph(0.025, GOLDP, [-0.55, S2 + 0.025, z]);
    // armillary sphere
    lat([[0, 0], [0.06, 0], [0.065, 0.01], [0.04, 0.025], [0.014, 0.04], [0.012, 0.09], [0.026, 0.1], [0, 0.104]], GOLDP, [-0.2, S2, z], { seg: 10 });
    sph(0.028, "#6fe3d6", [-0.2, S2 + 0.152 + 0.0, z], {}, 8, 6);
    glow(sph(0.02, "#9ffcf0", [-0.2, S2 + 0.152, z], {}, 6, 5), 1.4);
    on(armil, () => {
      tor(0.062, 0.004, GOLDP, [-0.2, 1.64, z], {}, 4, 14);
      tor(0.062, 0.004, GOLDP, [-0.2, 1.64, z], { r: [0, 90, 0] }, 4, 14);
      tor(0.062, 0.004, GOLDP, [-0.2, 1.64, z], { r: [90, 0, 0] }, 4, 14);
      tor(0.062, 0.0035, GOLDP, [-0.2, 1.64, z], { r: [60, 30, 0] }, 4, 14);
      for (const s of [-1, 1]) sph(0.007, GOLDP, [-0.2, 1.64 + s * 0.064, z], {}, 5, 4);
    });
    // ceramic owl
    const ox = 0.1;
    sph(0.05, K("#f4e6c4", "#cdb585"), [ox, S2 + 0.05, z], { sc: [1, 1.15, 0.9] }, 10, 8);
    sph(0.045, K("#f4e6c4", "#cdb585"), [ox, S2 + 0.105, z + 0.003], {}, 10, 8);
    sph(0.045, K("#d9b27a", "#a77a52"), [ox, S2 + 0.045, z + 0.025], { sc: [0.85, 0.9, 0.55] }, 8, 6);
    for (const s of [-1, 1]) {
      cyl(0.0, 0.015, 0.035, 4, K("#5aa8a2", "#38788a"), [ox + s * 0.032, S2 + 0.145, z], { r: [0, 0, -s * 14] });
      sph(0.016, "#ffffff", [ox + s * 0.02, S2 + 0.108, z + 0.04], {}, 6, 5);
      sph(0.0095, "#2a1a3a", [ox + s * 0.02, S2 + 0.108, z + 0.0525], {}, 5, 4);
      sph(0.0035, "#ffffff", [ox + s * 0.018, S2 + 0.112, z + 0.059], {}, 4, 3);
      b.extrude([[0, 0], [0.05, 0.015], [0.06, 0.05], [0.02, 0.03]], { at: [ox + s * 0.047, S2 + 0.03, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008, color: K("#5aa8a2", "#38788a"), bone: cur, smoothing: 1 });
    }
    cyl(0.0, 0.01, 0.022, 4, "#f6c453", [ox, S2 + 0.1, z + 0.05], { r: [90, 0, 0] });
    for (const s of [-1, 1]) cyl(0.004, 0.004, 0.02, 4, GOLDP, [ox + s * 0.015, S2 + 0.003, z + 0.01]);
    // crystal orb on gold stand
    const kx = 0.4;
    lat([[0, 0], [0.05, 0], [0.056, 0.01], [0.035, 0.03], [0.02, 0.05], [0.036, 0.062], [0.0, 0.062]], GOLDP, [kx, S2, z], { seg: 10 });
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      b.sweep(catmull([[kx + Math.cos(a) * 0.03, S2 + 0.06, z + Math.sin(a) * 0.03], [kx + Math.cos(a) * 0.052, S2 + 0.085, z + Math.sin(a) * 0.052], [kx + Math.cos(a) * 0.042, S2 + 0.125, z + Math.sin(a) * 0.042]]), 0.0035, { color: GOLDP, bone: cur, sides: 4, caps: "round" });
    }
    glow(sph(0.052, "#7fe9ff", [kx, S2 + 0.122, z], {}, 12, 9), 1.2);
    bat("#ffffff", new THREE.SphereGeometry(0.012, 5, 4), [kx - 0.025, S2 + 0.145, z + 0.032], { sc: [0.55, 1.9, 0.4], r: [0, -35, 0] });
    bat("#e8fbff", new THREE.SphereGeometry(0.01, 5, 4), [kx + 0.015, S2 + 0.1, z + 0.04], { sc: [1, 1, 0.5] });
    glow(sph(0.018, "#e8fbff", [kx + 0.01, S2 + 0.12, z + 0.015], {}, 6, 5), 1.4);
    // dried herb jars and a little cauldron-shaped teapot
    for (const [x2, h] of [[0.62, 0.14], [0.75, 0.18]] as const) {
      lat([[0, 0], [0.045, 0], [0.05, 0.015], [0.05, h], [0.042, h + 0.012], [0, h + 0.012]], K("#d8efe8", "#a8cdc8"), [x2, S2, z], { seg: 10 });
      cyl(0.044, 0.044, 0.02, 10, W_D.x, [x2, S2 + h + 0.02, z]);
      b.cards([0, 1, 2].map((i) => frame([x2 + (i - 1) * 0.015, S2 + h * 0.5, z + 0.01], [0, 1, 0])), HERB_DRY, { size: [0.05, h * 0.9], lean: 10, flow: [0, 0, -1], bone: cur, cross: true });
    }
    function jarPair() {
      for (const [x2, col, tex] of [[0.8, TEAL, LAB_LEAF], [0.7, K("#e8cf98", "#b99a68"), LAB_FLAME]] as const) {
        const jp = lat([[0, 0], [0.04, 0], [0.046, 0.01], [0.048, 0.1], [0.04, 0.12], [0.032, 0.126], [0, 0.126]], col, [x2 + (x2 > 0.75 ? 0 : 0), S1, z + (x2 > 0.75 ? 0 : 0)], { seg: 10 });
        cyl(0.036, 0.036, 0.02, 10, x2 > 0.75 ? GOLDP : W_D.x, [x2, S1 + 0.136, z]);
        b.decal(b.surface(jp), tex, { at: [x2, S1 + 0.06, z + 0.048], dir: [0, 0, 1], size: [0.05, 0.062], segments: 5, lift: 0.002, bone: cur });
      }
    }
  }

  // ───────────────────────────── hanging herbs on the drying rail ─────────────────────────────
  {
    const ry = 1.86, rz = -0.1;
    b.rod([-0.9, ry, rz], [0.9, ry, rz], 0.013, { color: W_D.x, bone: cur, sides: 8 });
    for (const s of [-1, 1]) {
      b.rod([s * 0.935, ry - 0.07, HZ + 0.1], [s * 0.935, ry, rz], 0.01, { color: IRON, bone: cur, sides: 6 });
      brod(IRON, [s * 0.9, ry, HZ + 0.1], [s * 0.9, ry, rz], 0.011, 6);
      sph(0.02, GOLDP, [s * 0.91, ry, rz], {}, 6, 5);
    }
    const tex = [HERB_MINT, HERB_LAV, HERB_FLW, HERB_DRY];
    const hungBunch = (x: number, ti: number, n = 7, len = 0.3) => {
      const R = rng(40 + Math.round(x * 100));
      const fr = Array.from({ length: n }, () => frame([x + (R() - 0.5) * 0.05, ry - 0.016, rz + (R() - 0.5) * 0.04], [0, 1, 0]));
      b.cards(fr, [tex[ti], tex[(ti + 1) % 4]], { size: [0.11, len], lean: 172, flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], rng: R, spin: 8, vary: 0.2, bone: cur, cross: true, bend: 10 });
      cyl(0.016, 0.014, 0.03, 8, ROPE, [x, ry - 0.045, rz]);
      tor(0.016, 0.003, ROPE, [x, ry - 0.036, rz], { r: [90, 0, 0] }, 4, 8);
      b.cards([frame([x, ry - 0.06, rz], [0, 1, 0])], TASSEL, { size: [0.012, 0.035], lean: 175, flow: [0, 0, 1], bone: cur, cross: true });
    };
    [-0.82, -0.7, -0.58, -0.46].forEach((x, i) => hungBunch(x, i));
    [0.52, 0.64, 0.76, 0.86].forEach((x, i) => hungBunch(x, (i + 2) % 4, 7, 0.27));
    // string of dried chilies hung between the bunches
    const sagY = (i: number) => ry - 0.035 - Math.sin((i / 6) * Math.PI) * 0.06;
    b.sweep(catmull(Array.from({ length: 7 }, (_, i): [number, number, number] => [-0.33 + i * 0.075, sagY(i) + 0.012, rz + 0.01])), 0.003, { color: ROPE, bone: cur, sides: 4 });
    for (const x of [-0.36, 0.15]) brod(ROPE, [x, ry - 0.012, rz + 0.01], [x === -0.36 ? -0.33 : 0.12, ry - 0.033, rz + 0.01], 0.003, 4);
    for (let i = 0; i < 7; i++) {
      const x = -0.33 + i * 0.075;
      const g = Grp.of([x, sagY(i) + 0.008, rz + 0.01], [0, i * 50, i % 2 ? 8 : -8]);
      bat(i % 2 ? "#e0463f" : "#f26a2e", new THREE.CylinderGeometry(0.014, 0.003, 0.085, 5), [0, -0.045, 0], { g });
      bat("#3f8a3c", new THREE.CylinderGeometry(0.005, 0.005, 0.014, 4), [0, 0.004, 0], { g });
    }
  }

  // ───────────────────────────── lantern and sign on brackets ─────────────────────────────
  {
    const ay = 1.8, az = HZ;
    // lantern bracket
    b.sweep(catmull([[-0.935, ay, az], [-1.04, ay + 0.03, az], [-1.12, ay + 0.015, az], [-1.14, ay - 0.01, az]]), 0.01, { color: IRON, bone: cur, sides: 6, caps: "round" });
    b.rod([-0.935, ay - 0.14, az], [-1.06, ay + 0.022, az], 0.008, { color: IRON, bone: cur, sides: 6 });
    b.sweep(catmull([[-0.97, ay - 0.1, az], [-1.0, ay - 0.06, az], [-0.99, ay - 0.04, az], [-0.96, ay - 0.05, az], [-0.96, ay - 0.07, az]]), 0.005, { color: GOLDP, bone: cur, sides: 4, caps: "round" });
    on(lantern, () => {
      const lx = -1.12;
      links(IRON, [lx, ay, az], [lx, ay - 0.1, az], 7, 0.008);
      tor(0.016, 0.004, GOLDP, [lx, ay - 0.115, az], {}, 4, 8);
      cyl(0.005, 0.07, 0.07, 4, GOLDP, [lx, ay - 0.16, az], { r: [0, 45, 0] });
      sph(0.016, GOLDP, [lx, ay - 0.1, az], {}, 6, 4);
      glow(box(0.09, 0.14, 0.09, "#ffd36a", [lx, ay - 0.265, az]), 1.4);
      glow(box(0.05, 0.06, 0.05, "#fff3c8", [lx, ay - 0.265, az]), 1.2);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        box(0.014, 0.15, 0.014, GOLDP, [lx + sx * 0.048, ay - 0.265, az + sz * 0.048]);
      }
      box(0.108, 0.012, 0.108, GOLDP, [lx, ay - 0.19, az]);
      box(0.108, 0.016, 0.108, GOLDP, [lx, ay - 0.345, az]);
      cyl(0.0, 0.03, 0.04, 4, GOLDP, [lx, ay - 0.373, az], { r: [180, 45, 0] });
      b.cards([frame([lx, ay - 0.39, az], [0, 1, 0])], TASSEL, { size: [0.022, 0.07], lean: 180, flow: [0, 0, 1], bone: cur, cross: true });
      for (const sx of [-1, 1]) b.cards([frame([lx + sx * 0.052, ay - 0.31, az + 0.052], [0, 1, 0])], TASSEL, { size: [0.01, 0.03], lean: 180, flow: [0, 0, 1], bone: cur });
    });
    // sign bracket
    const sx0 = 1.13;
    b.sweep(catmull([[0.935, ay, az], [1.05, ay + 0.02, az], [1.2, ay + 0.02, az], [1.27, ay, az], [1.27, ay - 0.03, az]]), 0.01, { color: IRON, bone: cur, sides: 6, caps: "round" });
    b.rod([0.935, ay - 0.14, az], [1.12, ay + 0.016, az], 0.008, { color: IRON, bone: cur, sides: 6 });
    sph(0.016, GOLDP, [1.27, ay - 0.04, az], {}, 6, 4);
    on(signJ, () => {
      for (const dx of [-0.085, 0.085]) {
        links(IRON, [sx0 + dx, ay - 0.002, az], [sx0 + dx, ay - 0.11, az], 6, 0.007);
        sph(0.01, GOLDP, [sx0 + dx, ay - 0.113, az], {}, 5, 4);
      }
      const sg = Grp.of([sx0, ay - 0.13, az], [0, 0, 0]);
      b.extrude([[-0.115, -0.3], [0.115, -0.3], [0.125, -0.05], [0.09, 0.0], [-0.09, 0.0], [-0.125, -0.05]], {
        at: sg.pt([0, 0, 0]), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.005, color: W_M.x, bone: cur,
      });
      box(0.27, 0.014, 0.034, GOLDP, [0, -0.305, 0], { g: sg });
      for (const s of [-1, 1]) plane(0.2, 0.26, SIGN_ICON, [0, -0.155, s * 0.0175], { g: sg, r: [0, s > 0 ? 0 : 180, 0], sc: [0.75, 1, 1] });
      for (const dx of [-0.09, 0.09]) for (const s of [-1, 1]) sph(0.007, GOLDP, [dx, -0.02, s * 0.0155], { g: sg }, 5, 4);
      b.cards([frame([sx0 - 0.075, ay - 0.435, az], [0, 1, 0]), frame([sx0 + 0.075, ay - 0.435, az], [0, 1, 0])], TASSEL, { size: [0.016, 0.05], lean: 180, flow: [0, 0, 1], bone: cur, cross: true });
    });
  }

  // ───────────────────────────── under-bench shelf and floor dressing ─────────────────────────────
  {
    // shelf: sacks, big jars, crates, bucket, kettle
    const SY = 0.2775;
    // copper kettle
    lat([[0, 0], [0.07, 0], [0.095, 0.02], [0.1, 0.07], [0.085, 0.12], [0.05, 0.145], [0.04, 0.16], [0, 0.162]], COPPER, [-0.6, SY, 0.05], { seg: 12 });
    lat([[0, 0.14], [0.05, 0.145], [0.052, 0.17], [0.03, 0.18], [0, 0.185]], COPPER, [-0.6, SY, 0.05], { seg: 10 });
    sph(0.014, GOLDP, [-0.6, SY + 0.19, 0.05], {}, 6, 4);
    b.sweep(catmull([[-0.5, SY + 0.04, 0.05], [-0.47, SY + 0.07, 0.05], [-0.47, SY + 0.125, 0.05], [-0.54, SY + 0.17, 0.05]]), 0.007, { color: GOLDP, bone: cur, sides: 5, caps: "round" });
    b.sweep(catmull([[-0.68, SY + 0.07, 0.05], [-0.74, SY + 0.12, 0.05], [-0.76, SY + 0.14, 0.05]]), [0.014, 0.006], { color: COPPER, bone: cur, sides: 6, caps: "round" });
    b.sweep(catmull([[-0.6 - 0.08, SY + 0.16, 0.05], [-0.6, SY + 0.28, 0.05], [-0.6 + 0.08, SY + 0.16, 0.05]]), 0.006, { color: IRON, bone: cur, sides: 5, caps: "round" });
    // big jar with cork
    const bj = lat([[0, 0], [0.09, 0], [0.12, 0.04], [0.13, 0.12], [0.1, 0.22], [0.06, 0.26], [0.05, 0.3], [0.058, 0.306], [0.058, 0.32], [0, 0.32]], TEAL, [-0.2, SY, 0.02], { seg: 12 });
    bat(GOLDP, new THREE.TorusGeometry(0.1, 0.006, 4, 12), [-0.2, SY + 0.22, 0.02], { r: [90, 0, 0] });
    cyl(0.044, 0.05, 0.04, 8, CORK, [-0.2, SY + 0.335, 0.02]);
    sph(0.014, GOLDP, [-0.2, SY + 0.37, 0.02], {}, 6, 4);
    b.decal(b.surface(bj), LAB_DROP, { at: [-0.2, SY + 0.12, 0.15], dir: [0, 0, 1], size: [0.11, 0.135], segments: 6, lift: 0.002, bone: cur });
    // crate of bottles
    const cg = Grp.of([0.12, SY, 0.04], [0, 6, 0]);
    box(0.36, 0.02, 0.28, W_L.x, [0, 0.01, 0], { g: cg });
    for (const sz of [-1, 1] as const) {
      box(0.36, 0.13, 0.016, W_L.x, [0, 0.075, sz * 0.132], { g: cg });
      box(0.016, 0.13, 0.28, W_L.z, [sz * 0.172, 0.075, 0], { g: cg });
    }
    for (const x of [-0.12, 0, 0.12]) box(0.012, 0.13, 0.285, W_D.z, [x, 0.075, 0], { g: cg });
    for (let i = 0; i < 6; i++) {
      const col = ["#ff6fb5", "#9be83c", "#6fc3ff", "#ffb02e", "#a577ff", "#37e2d5"][i];
      bottle(cg.pt([-0.1 + (i % 3) * 0.1, 0.02, i < 3 ? -0.06 : 0.06]), i % 2 ? "round" : "flask", col, 1, { scale: 0.9, r: [0, 6, 0] });
    }
    // sacks: gathered cloth with a rope tie
    const sack = (x: number, z: number, s: number, col: Col, y0 = SY) => {
      const prof: Prof = [[0, 0], [0.06, 0], [0.1, 0.03], [0.115, 0.09], [0.1, 0.15], [0.055, 0.19], [0.03, 0.215], [0.034, 0.235], [0.058, 0.27], [0.05, 0.285], [0.02, 0.272], [0, 0.26]];
      lat(prof.map(([px, py]) => [px * s, py * s] as [number, number]), col, [x, y0, z], { seg: 9 });
      tor(0.034 * s, 0.007 * s, ROPE, [x, y0 + 0.222 * s, z], { r: [90, 0, 0] }, 4, 8);
      sph(0.012 * s, ROPE, [x + 0.034 * s, y0 + 0.215 * s, z], {}, 4, 3);
    };
    sack(0.62, 0.06, 1, K("#d9bc84", "#a98a5a"));
    sack(0.45, -0.17, 0.78, K("#b9c8a0", "#80936a"));
    // stool with cushion
    const stx = -0.5, stz = 0.82;
    lat([[0, 0], [0.19, 0], [0.2, 0.02], [0.2, 0.05], [0.0, 0.05]], W_L.y, [stx, 0.4, stz], { seg: 12 });
    box(0.012, 0.012, 0.012, GOLDP, [stx, 0.4, stz]);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.5;
      b.rod([stx + Math.cos(a) * 0.13, 0.41, stz + Math.sin(a) * 0.13], [stx + Math.cos(a) * 0.19, 0.0, stz + Math.sin(a) * 0.19], [0.026, 0.02], { color: W_D.y, bone: cur, sides: 6 });
    }
    bat(GOLDP, new THREE.TorusGeometry(0.168, 0.006, 4, 12), [stx, 0.17, stz], { r: [90, 0, 0] });
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.5;
      brod(W_D.y, [stx + Math.cos(a) * 0.168, 0.17, stz + Math.sin(a) * 0.168], [stx + Math.cos(a + 2.09) * 0.168, 0.17, stz + Math.sin(a + 2.09) * 0.168], 0.01, 5);
    }
    sph(0.19, NAVY, [stx, 0.475, stz], { sc: [1, 0.3, 1] }, 12, 6);
    tor(0.188, 0.006, GOLDP, [stx, 0.455, stz], { r: [90, 0, 0] }, 4, 12);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + 0.4;
      b.cards([frame([stx + Math.cos(a) * 0.19, 0.452, stz + Math.sin(a) * 0.19], [0, 1, 0])], TASSEL, { size: [0.022, 0.07], lean: 180, flow: [Math.cos(a), 0, Math.sin(a)], bone: cur, cross: true });
    }
    bat(GOLDP, new THREE.SphereGeometry(0.014, 6, 4), [stx, 0.495, stz]);
    // wicker basket with herbs
    const bkx = 0.7, bkz = 0.82;
    const wick = cel(
      paint((p) => ((Math.floor(Math.atan2(p.x - bkx, p.z - bkz) * 7) + Math.floor(p.y / 0.03)) % 2 ? "#dcae62" : "#c08c46")),
      "#8f5f3e",
    );
    lat([[0, 0], [0.15, 0], [0.2, 0.22], [0.205, 0.24], [0.19, 0.24], [0.14, 0.035], [0, 0.035]], wick, [bkx, 0, bkz], { seg: 14 });
    bat(W_D.y, new THREE.TorusGeometry(0.205, 0.01, 4, 14), [bkx, 0.24, bkz], { r: [90, 0, 0] });
    b.sweep(catmull([[bkx - 0.2, 0.235, bkz], [bkx - 0.12, 0.4, bkz], [bkx, 0.45, bkz], [bkx + 0.12, 0.4, bkz], [bkx + 0.2, 0.235, bkz]]), 0.012, { color: W_D.y, bone: cur, sides: 6, caps: "round" });
    b.cards(
      Array.from({ length: 16 }, (_, i) => frame([bkx + Math.cos(i * 2.4) * (0.02 + (i % 4) * 0.035), 0.2, bkz + Math.sin(i * 2.4) * (0.02 + (i % 4) * 0.035)], [0, 1, 0])),
      [HERB_MINT, HERB_LAV, HERB_FLW],
      { size: [0.1, 0.28], lean: 14, flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], rng: rng(21), spin: 10, vary: 0.2, bone: cur, cross: true },
    );
    for (const [dx, dz, s] of [[0.12, 0.1, 1], [-0.1, 0.12, 0.8]] as const) {
      cyl(0.012 * s, 0.016 * s, 0.05 * s, 6, CREAMP, [bkx + dx, 0.225 + 0.025 * s, bkz + dz]);
      lat([[0, 0], [0.05 * s, 0], [0.045 * s, 0.02 * s], [0.02 * s, 0.038 * s], [0, 0.04 * s]], cel(spots("#e0554f", "#fff2d4", { size: 0.02, amount: 0.5, seed: 3 })), [bkx + dx, 0.255 + 0.04 * s - 0.01, bkz + dz], { seg: 8 });
    }
    // bucket with ladle
    const bux = -1.15, buz = 0.52;
    const stave = cel(stripes("#c68a52", "#a8703f", { size: 0.04, axis: "y", width: 0.08 }), "#855a38");
    lat([[0, 0], [0.12, 0], [0.15, 0.3], [0.14, 0.3], [0, 0.3]], stave, [bux, 0, buz], { seg: 12 });
    lat([[0, 0.28], [0.147, 0.28], [0.147, 0.296], [0, 0.296]], K("#4ac8cc", "#2a9aa6"), [bux, 0, buz], { seg: 12 });
    for (const y of [0.05, 0.22]) bat(GOLDP, new THREE.TorusGeometry(y < 0.1 ? 0.127 : 0.146, 0.008, 4, 12), [bux, y, buz], { r: [90, 0, 0] });
    b.sweep(catmull([[bux - 0.148, 0.28, buz], [bux - 0.12, 0.42, buz], [bux, 0.46, buz], [bux + 0.12, 0.42, buz], [bux + 0.148, 0.28, buz]]), 0.006, { color: IRON, bone: cur, sides: 5, caps: "round" });
    b.rod([bux + 0.04, 0.29, buz + 0.02], [bux + 0.12, 0.5, buz + 0.1], 0.008, { color: W_D.y, bone: cur, sides: 6 });
    lat([[0, 0], [0.04, 0.0], [0.045, 0.016], [0.0, 0.02]], COPPER, [bux + 0.12, 0.49, buz + 0.1], { seg: 8, r: [0, 0, 0] });
    // sack by the left side
    sack(-1.2, -0.12, 1.15, K("#d9bc84", "#a98a5a"), 0);
    // big floor jar with a glowing cork
    const fx = 1.2, fz = 0.04;
    const fj = lat([[0, 0], [0.12, 0], [0.17, 0.06], [0.18, 0.22], [0.14, 0.38], [0.08, 0.44], [0.07, 0.48], [0.08, 0.49], [0.08, 0.5], [0, 0.5]], cel(stripes("#d9774a", "#c4604a", { size: 0.06, axis: "y", width: 0.2, seed: 2 }), "#8a4a46"), [fx, 0, fz], { seg: 12 });
    bat(GOLDP, new THREE.TorusGeometry(0.178, 0.008, 4, 12), [fx, 0.2, fz], { r: [90, 0, 0] });
    bat(GOLDP, new THREE.TorusGeometry(0.075, 0.007, 4, 10), [fx, 0.48, fz], { r: [90, 0, 0] });
    cyl(0.055, 0.065, 0.07, 8, CORK, [fx, 0.53, fz]);
    b.decal(b.surface(fj), LAB_FLAME, { at: [fx, 0.24, fz + 0.18], dir: [0, 0, 1], size: [0.14, 0.17], segments: 6, lift: 0.002, bone: cur });
    // anemo-like crystal cluster
    const kx = 1.22, kz = 0.62;
    lat([[0, 0], [0.16, 0], [0.18, 0.03], [0.12, 0.07], [0.0, 0.08]], K("#c9c1b0", "#8f8a94"), [kx, 0, kz], { seg: 7 });
    for (const [dx, dz, h, r, tilt, tz] of [[0, 0, 0.36, 0.045, 0, 0], [0.07, 0.03, 0.24, 0.036, -16, 12], [-0.07, 0.02, 0.28, 0.038, 16, -8], [0.02, -0.07, 0.2, 0.03, 4, 22], [-0.03, 0.08, 0.17, 0.028, -8, -18]] as const) {
      const cg2 = Grp.of([kx + dx, 0.06, kz + dz], [tilt, 0, tz]);
      glow(cyl(r, r, h, 6, "#6fe3d6", [0, h / 2, 0], { g: cg2 }), 1.1);
      glow(cyl(0, r, r * 1.8, 6, "#a8f5ec", [0, h + r * 0.9, 0], { g: cg2 }), 1.3);
    }
    // little ground-level glow motes
    for (let i = 0; i < 5; i++) glow(sph(0.007, "#9ffcf0", [kx + Math.cos(i * 1.4) * 0.12, 0.42 + i * 0.06, kz + Math.sin(i * 1.4) * 0.12], {}, 4, 3), 1.4);
  }

  // ───────────────────────────── back of the hutch, shelf plaques, fallen sprigs ─────────────────────────────
  {
    const bz = -0.401;
    plane(1.9, 0.1, VINE, [0, 1.985, -0.3065], { r: [0, 180, 0] });
    for (const x of [-0.5, 0.5]) box(0.07, 1.01, 0.012, W_D.y, [x, 1.425, bz - 0.006]);
    for (const y of [0.99, 1.86]) box(1.76, 0.07, 0.012, W_D.x, [0, y, bz - 0.006]);
    b.rod([-0.85, 1.0, bz - 0.015], [0.85, 1.85, bz - 0.015], 0.02, { color: W_D.x, bone: cur, sides: 4 });
    b.rod([0.85, 1.0, bz - 0.015], [-0.85, 1.85, bz - 0.015], 0.02, { color: W_D.x, bone: cur, sides: 4 });
    for (const [x, y] of [[-0.5, 0.99], [0.5, 0.99], [-0.5, 1.86], [0.5, 1.86], [0, 1.425]] as const) {
      bat(GOLDP, new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), [x, y, bz - 0.014], { r: [90, 0, 0] });
      bat(IRON, new THREE.CylinderGeometry(0.008, 0.008, 0.016, 6), [x, y, bz - 0.018], { r: [90, 0, 0] });
    }
    // hooks with a broom, a wreath of herbs and a rope coil
    brod(IRON, [-0.8, 1.62, bz - 0.04], [0.8, 1.62, bz - 0.04], 0.008);
    for (const x of [-0.7, -0.15, 0.4, 0.7]) {
      brod(IRON, [x, 1.62, bz - 0.04], [x, 1.62, bz - 0.07], 0.005, 5);
      brod(IRON, [x, 1.62, bz - 0.07], [x, 1.595, bz - 0.075], 0.005, 5);
    }
    const bgp = Grp.of([-0.7, 1.58, bz - 0.075], [0, 0, 5]);
    cyl(0.01, 0.01, 0.62, 6, W_D.y, [0, -0.28, 0], { g: bgp });
    bat(ROPE, new THREE.CylinderGeometry(0.052, 0.052, 0.02, 8), [0, -0.45, 0], { g: bgp });
    bat(K("#e0b45a", "#b0843a"), new THREE.CylinderGeometry(0.04, 0.09, 0.22, 8), [0, -0.56, 0], { g: bgp });
    for (let i = 0; i < 5; i++) bat(K("#c99a46", "#9a7236"), new THREE.ConeGeometry(0.012, 0.07, 4), [-0.07 + i * 0.035, -0.69, 0], { g: bgp, r: [0, 0, (i - 2) * 6] });
    const wc: Vec3 = [-0.15, 1.32, bz - 0.06];
    tor(0.12, 0.016, K("#7a5a3a", "#5a3f2a"), [wc[0], wc[1] + 0.2, wc[2]], { r: [0, 0, 0] }, 5, 14);
    b.cards(
      Array.from({ length: 12 }, (_, i) => frame([wc[0] + Math.cos(i * 0.52) * 0.12, wc[1] + 0.2 + Math.sin(i * 0.52) * 0.12, wc[2] - 0.01], [0, 0, -1])),
      [HERB_MINT, HERB_LAV, HERB_DRY],
      { size: [0.08, 0.1], lean: 70, flow: (_f, i) => [-Math.sin(i * 0.52), Math.cos(i * 0.52), 0], bone: cur, rng: rng(33), spin: 8, cross: true },
    );
    for (let i = 0; i < 4; i++) tor(0.07, 0.012, ROPE, [0.4, 1.5, bz - 0.09 - i * 0.022], {}, 5, 12);
    for (const [x, y] of [[0.7, 1.55]] as const) {
      tor(0.014, 0.003, GOLDP, [x, y, bz - 0.09], {}, 4, 8);
      brod(GOLDP, [x, y - 0.014, bz - 0.09], [x, y - 0.1, bz - 0.09], 0.004, 4);
      bat(GOLDP, new THREE.BoxGeometry(0.03, 0.012, 0.004), [x + 0.012, y - 0.09, bz - 0.09]);
    }
    // shelf-front plaques
    const icons = [ICON_LEAF, ICON_FLASK, ICON_FLAME, ICON_LEAF, ICON_FLASK];
    for (const y of [1.22, 1.52])
      [-0.7, -0.35, 0, 0.35, 0.7].forEach((x, i) => plane(0.045, 0.03, icons[(i + (y > 1.4 ? 2 : 0)) % 5], [x, y, HZ + 0.1115]));
    // fallen sprigs on the rug
    b.cards(
      [[-0.1, 0.78], [0.2, 0.92], [0.95, 0.5], [-0.9, 0.9], [0.4, 0.62], [-0.2, 1.15]].map(([x, z]) => frame([x, 0.019, z], [0, 1, 0])),
      [HERB_MINT, HERB_FLW, HERB_LAV],
      { size: [0.06, 0.13], lean: 90, flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)], mirror: true, bone: cur, rng: rng(8), vary: 0.2 },
    );
  }

  flush();

  // ───────────────────────────── rest pose ─────────────────────────────
  b.pose(beam, { axis: [0, 0, 1], deg: -7 });
  b.pose(panL, { axis: [0, 0, 1], deg: 7 });
  b.pose(panR, { axis: [0, 0, 1], deg: 7 });
  b.pose(cover, { axis: [0, 0, 1], deg: 62 });
  b.pose(lantern, { axis: [0, 0, 1], deg: 5 });
  b.pose(signJ, { axis: [1, 0, 0], deg: 4 });
  b.pose(armil, { axis: [0, 1, 0], deg: 25 });

  return b.root;
}
