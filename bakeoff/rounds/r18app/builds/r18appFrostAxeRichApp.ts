// Frost-forged battle axe on a rune plinth: League of Legends style (saturated cyan magic against deep navy steel,
// gold trim, crimson accents, big exaggerated crescent blade, glowing frost runes).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { aim, rng } from "../../../../src/math";
import { catmull, spiral } from "../../../../src/path";
import { cells, noise, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering two-handed frost axe on a rune-carved plinth: crescent main blade with glowing frost-fern runes, ice-fang counter blade, gold langets and rivets, crimson pennants, hanging frost charm.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// Palette
const INKB = "#14224a";
const ICE = "#8fe6ff";
const ICE2 = "#c9f4ff";
const ICE3 = "#3fb0f0";
const GLOW = "#4df0ff";
const GLOWCORE = "#d8ffff";
const GOLD = "#f0bf4e";
const GOLD2 = "#b8702a";
const CRIMSON = "#e0305e";
const CRIMSON2 = "#8f1d49";
const SNOW = "#f4fbff";

type UV = [number, number] | [number, number, "sharp"];
type Pt = [number, number];

// ---------------------------------------------------------------------------------------------------------------
// Outline helpers (outline drawn as [x = v up the blade, y = u outward from the haft])
const toOutline = (uv: UV[], k: number): OutlinePoint[] =>
  uv.map((p) => (p.length === 3 ? [p[1] * k, p[0] * k, "sharp"] : [p[1] * k, p[0] * k]));

/** The outline after `rounds` of the SDK's corner cutting (quarter-way cuts, sharp corners kept). */
function chaikin(outline: OutlinePoint[], rounds: number): Pt[] {
  let pts = outline.map((p) => ({ x: p[0], y: p[1], sharp: p[2] === "sharp" }));
  for (let r = 0; r < rounds; r++) {
    const next: typeof pts = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i + pts.length - 1) % pts.length];
      const c = pts[i];
      const d = pts[(i + 1) % pts.length];
      if (c.sharp) next.push(c);
      else {
        next.push({ x: c.x + (a.x - c.x) * 0.25, y: c.y + (a.y - c.y) * 0.25, sharp: false });
        next.push({ x: c.x + (d.x - c.x) * 0.25, y: c.y + (d.y - c.y) * 0.25, sharp: false });
      }
    }
    pts = next;
  }
  return pts.map((p) => [p.x, p.y] as Pt);
}

function polyDist(poly: Pt[], x: number, y: number) {
  let best = 1e9;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const c = poly[(i + 1) % poly.length];
    const ex = c[0] - a[0];
    const ey = c[1] - a[1];
    const l2 = ex * ex + ey * ey || 1e-12;
    const t = Math.min(Math.max(((x - a[0]) * ex + (y - a[1]) * ey) / l2, 0), 1);
    const dx = x - (a[0] + ex * t);
    const dy = y - (a[1] + ey * t);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

/** Polygon moved inward by d (mitred, clamped). */
function inset(poly: Pt[], d: number): Pt[] {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const c = poly[(i + 1) % poly.length];
    area += a[0] * c[1] - c[0] * a[1];
  }
  const sgn = area > 0 ? 1 : -1;
  const n = poly.length;
  return poly.map((p, i) => {
    const a = poly[(i + n - 1) % n];
    const c = poly[(i + 1) % n];
    const e1 = [p[0] - a[0], p[1] - a[1]];
    const e2 = [c[0] - p[0], c[1] - p[1]];
    const l1 = Math.hypot(e1[0], e1[1]) || 1;
    const l2 = Math.hypot(e2[0], e2[1]) || 1;
    const n1 = [(-e1[1] / l1) * sgn, (e1[0] / l1) * sgn];
    const n2 = [(-e2[1] / l2) * sgn, (e2[0] / l2) * sgn];
    const k = 1 / Math.max(1 + n1[0] * n2[0] + n1[1] * n2[1], 0.4);
    let mx = (n1[0] + n2[0]) * k * d;
    let my = (n1[1] + n2[1]) * k * d;
    const len = Math.hypot(mx, my);
    if (len > 2.6 * d) {
      mx *= (2.6 * d) / len;
      my *= (2.6 * d) / len;
    }
    return [p[0] + mx, p[1] + my] as Pt;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Blade outlines, as (u outward, v up) in metres before scaling
const BS = 0.88;
const MAIN_UV: UV[] = [
  [0.03, 0.12, "sharp"],
  [0.12, 0.15],
  [0.22, 0.22],
  [0.3, 0.31],
  [0.37, 0.42, "sharp"],
  [0.41, 0.33],
  [0.44, 0.2],
  [0.45, 0.06],
  [0.45, -0.06],
  [0.43, -0.19],
  [0.39, -0.29],
  [0.33, -0.38, "sharp"],
  [0.26, -0.29],
  [0.19, -0.21],
  [0.1, -0.15],
  [0.03, -0.12, "sharp"],
];
const SEC_UV: UV[] = [
  [0.03, 0.11, "sharp"],
  [0.11, 0.14],
  [0.18, 0.24],
  [0.22, 0.36],
  [0.27, 0.47, "sharp"],
  [0.27, 0.36],
  [0.29, 0.27],
  [0.31, 0.21],
  [0.43, 0.11, "sharp"],
  [0.31, 0.05],
  [0.25, 0.0],
  [0.28, -0.08],
  [0.34, -0.19],
  [0.31, -0.3, "sharp"],
  [0.2, -0.22],
  [0.11, -0.15],
  [0.03, -0.11, "sharp"],
];
const SPEAR: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.05, 0.03],
  [0.062, 0.1],
  [0.04, 0.18],
  [0, 0.31, "sharp"],
  [-0.04, 0.18],
  [-0.062, 0.1],
  [-0.05, 0.03],
];

const mainOutline = toOutline(MAIN_UV, BS);
const secOutline = toOutline(SEC_UV, BS);
const mainPoly = chaikin(mainOutline, 1);
const secPoly = chaikin(secOutline, 1);
const spearPoly = chaikin(SPEAR, 1);

/** Hand-painted blade: bright bevel rim, ink groove, banded rim plate, frosted panel with ice cracks, a painted glint. */
function bladePaint(poly: Pt[], panelDark: string, panelMid: string, panelLight: string) {
  return paint((p, n, s) => {
    if (Math.abs(n.z) < 0.8 && Math.abs(n.x) + Math.abs(n.y) > 0.6) return "#f4feff";
    const d = polyDist(poly, s[0], s[1]);
    if (d < 0.011) return "#f4feff";
    if (d < 0.025) return "#bfe6fc";
    if (d < 0.03) return INKB;
    if (d < 0.054) return d < 0.042 ? "#86b8ee" : "#6fa3e6";
    const v = s[0];
    const u = s[1];
    const glint = Math.abs(v * 0.8 + u * 0.7 - 0.12);
    if (glint < 0.011) return "#e8f8ff";
    if (Math.abs(v * 0.8 + u * 0.7 - 0.17) < 0.004) return "#cfeaff";
    const crack = cells(p, 0.07, 5);
    if (crack.d2 - crack.d1 < 0.045) return "#97c6f4";
    const q = noise(p, 0.12, 3) + (u < 0.14 ? -0.2 : 0) + (u > 0.28 ? 0.1 : 0);
    return q < 0.36 ? panelDark : q < 0.58 ? panelMid : panelLight;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Glowing rune decals for the blades
function runeSvg(
  poly: Pt[],
  o: { s: number; face: 1 | -1; u0: number; u1: number; v0: number; v1: number; fernFrom: number; fernTo: number },
) {
  const W = (o.u1 - o.u0) * 1000;
  const H = (o.v1 - o.v0) * 1000;
  const cxw = (o.s * (o.u0 + o.u1)) / 2;
  const px = (u: number) => (W / 2 + o.face * (o.s * u - cxw) * 1000).toFixed(1);
  const py = (v: number) => ((o.v1 - v) * 1000).toFixed(1);
  const P = (v: number, u: number) => `${px(u)} ${py(v)}`;
  const inner = inset(poly, 0.058);
  const path = "M" + inner.map((p) => P(p[0], p[1])).join(" L") + " Z";
  let ticks = "";
  const outer = inset(poly, 0.036);
  for (let i = 0; i < inner.length; i += 2) {
    const a = inner[i];
    const c = outer[i];
    ticks += `M${P(a[0], a[1])} L${P(c[0], c[1])} `;
  }
  let fern = "";
  const br = (v: number, u: number, ang: number, len: number, depth: number) => {
    const ev = v + Math.sin(ang) * len;
    const eu = u + Math.cos(ang) * len;
    fern += `M${P(v, u)} L${P(ev, eu)} `;
    if (depth > 0) {
      for (const sg of [1, -1]) {
        const k = 0.5;
        br(v + Math.sin(ang) * len * k, u + Math.cos(ang) * len * k, ang + sg * 0.85, len * 0.5, depth - 1);
      }
    }
  };
  fern += `M${P(0, o.fernFrom)} L${P(0, o.fernTo)} `;
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const u = o.fernFrom + 0.02 + ((o.fernTo - o.fernFrom - 0.05) * i) / steps;
    const len = 0.085 * (1 - (i / steps) * 0.55);
    for (const sg of [1, -1]) br(0, u, sg * 0.95, len, i < 4 ? 1 : 0);
  }
  const gl = (extra: string, d: string) => `<path d="${d}" ${extra}/>`;
  return svg(
    `<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${gl(`stroke="${GLOW}" stroke-width="7"`, path)}${gl(`stroke="${GLOW}" stroke-width="5"`, ticks)}${gl(`stroke="${GLOW}" stroke-width="6"`, fern)}
      ${gl(`stroke="${GLOWCORE}" stroke-width="2.6"`, path)}${gl(`stroke="${GLOWCORE}" stroke-width="2"`, ticks)}${gl(`stroke="${GLOWCORE}" stroke-width="2.4"`, fern)}
    </g></svg>`,
    { size: 1024 },
  );
}

const RUNE_STRIP = svg(
  `<svg viewBox="0 0 160 48"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <g stroke="${GLOW}" stroke-width="7">
    <path d="M14 8 L14 40 M14 14 L26 8 M14 24 L26 18"/><path d="M42 8 L56 24 L42 40 M56 8 L56 40"/>
    <path d="M74 8 L88 40 L102 8 M80 26 L96 26"/><path d="M118 8 L118 40 M108 14 L128 14 M108 34 L128 34"/>
    <path d="M140 8 L152 24 L140 40 M152 8 L152 40"/>
  </g>
  <g stroke="${GLOWCORE}" stroke-width="2.6">
    <path d="M14 8 L14 40 M14 14 L26 8 M14 24 L26 18"/><path d="M42 8 L56 24 L42 40 M56 8 L56 40"/>
    <path d="M74 8 L88 40 L102 8 M80 26 L96 26"/><path d="M118 8 L118 40 M108 14 L128 14 M108 34 L128 34"/>
    <path d="M140 8 L152 24 L140 40 M152 8 L152 40"/>
  </g></g></svg>`,
  { size: 320 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "frostAxe", paintSize: 2048 });
  const R = rng(11);
  const root = b.joint("root", { at: [0, 0.12, 0] });

  const HY = 1.2; // head centre
  const HAFT_R = 0.026;

  // Merged small parts: one part per (colour, glow).
  const bags = new Map<string, THREE.BufferGeometry[]>();
  const stash = (color: string, g: THREE.BufferGeometry, glowing = false) => {
    const key = `${color}|${glowing ? 1 : 0}`;
    const list = bags.get(key) ?? [];
    bags.set(key, list);
    list.push(g.index ? g.toNonIndexed() : g);
  };
  const place = (g: THREE.BufferGeometry, pos: number[], dir?: number[], spin = 0) => {
    const q = dir ? aim(dir) : new THREE.Quaternion();
    if (spin) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin));
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(pos[0], pos[1], pos[2]), q, new THREE.Vector3(1, 1, 1)));
    return g;
  };
  const crystalGeo = (r: number, len: number, sides = 6, tip = 0.32) => {
    const body = new THREE.CylinderGeometry(r * 0.86, r, len * (1 - tip), sides, 1).translate(0, (len * (1 - tip)) / 2, 0);
    const top = new THREE.ConeGeometry(r * 0.86, len * tip, sides, 1).translate(0, len * (1 - tip) + (len * tip) / 2, 0);
    return mergeGeometries([body.toNonIndexed(), top.toNonIndexed()])!;
  };
  const crystal = (color: string, base: number[], dir: number[], r: number, len: number, glowing = false) =>
    stash(color, place(crystalGeo(r, len), base, dir, R() * 3), glowing);
  const cluster = (base: number[], dir: number[], n: number, r: number, len: number, colors: string[], glowCol?: string) => {
    for (let i = 0; i < n; i++) {
      const k = i === 0 ? 1 : 0.45 + R() * 0.35;
      const j = i === 0 ? 0 : 0.55;
      const d = [dir[0] + (R() - 0.5) * j * 2, dir[1] + (R() - 0.2) * j, dir[2] + (R() - 0.5) * j * 2];
      const off = i === 0 ? [0, 0, 0] : [(R() - 0.5) * r * 3, 0, (R() - 0.5) * r * 3];
      const isGlow = glowCol !== undefined && i % 3 === 1;
      crystal(
        isGlow ? glowCol! : colors[i % colors.length],
        [base[0] + off[0], base[1], base[2] + off[2]],
        d,
        r * k,
        len * k,
        isGlow,
      );
    }
  };
  const torus = (color: string, center: number[], axis: number[], rad: number, tube: number, glowing = false, sides = 5) =>
    stash(color, place(new THREE.TorusGeometry(rad, tube, sides, 14).rotateX(Math.PI / 2), center, axis), glowing);
  const rivet = (color: string, at: number[], r = 0.008) =>
    stash(color, new THREE.SphereGeometry(r, 6, 4).translate(at[0], at[1], at[2]));

  // =========================================================================================== plinth
  const SNOWC = cel(SNOW, "#a6c6f0");
  const stone = cel(scales(["#35497f", "#2b3e72", "#3c568c"], INKB, { size: 0.1, width: 0.16, seed: 3 }));
  const FROSTC = cel("#cfeeff", "#8bb4e8");
  const plinthPaint = paint((p, n) => {
    if (n.y > 0.7) return SNOWC;
    if (p.y > 0.092 + 0.022 * zigzag((p.x + p.z) / 0.045)) return FROSTC;
    return stone;
  });
  b.lathe(
    [
      [0, 0],
      [0.4, 0],
      [0.4, 0.055],
      [0.375, 0.066],
      [0.335, 0.066],
      [0.335, 0.106],
      [0.31, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color: plinthPaint, name: "plinth" },
  );
  // snow drift round the haft and heaped at the rim
  b.lathe(
    [
      [0, 0.116],
      [0.17, 0.116],
      [0.15, 0.134],
      [0.08, 0.15],
      [0, 0.156],
    ],
    { at: [0, 0, 0], bone: root, segments: 10, color: SNOWC, name: "snowDrift" },
  );
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const rr = 0.3 + R() * 0.03;
    const blob = new THREE.SphereGeometry(0.035 + R() * 0.02, 6, 4).scale(1.5, 0.45, 1.2);
    stash(SNOW, blob.translate(Math.sin(a) * rr, 0.121, Math.cos(a) * rr));
  }
  // glowing rune rings on top, ticks between them
  torus(GLOW, [0, 0.123, 0], [0, 1, 0], 0.265, 0.005, true);
  torus(GLOW, [0, 0.123, 0], [0, 1, 0], 0.2, 0.0038, true);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const g = new THREE.BoxGeometry(0.011, 0.004, i % 2 ? 0.03 : 0.045).rotateY(a);
    stash(GLOWCORE, g.translate(Math.sin(a) * 0.232, 0.123, Math.cos(a) * 0.232), true);
  }
  // rune decals on the eight faces of the lower tier
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ap = 0.4 * Math.cos(Math.PI / 8) + 0.0035;
    glow(
      b.part(new THREE.PlaneGeometry(0.15, 0.045), "#ffffff", {
        bone: root,
        at: [Math.sin(a) * ap, 0.028, Math.cos(a) * ap],
        dir: [Math.sin(a), 0, Math.cos(a)],
        axis: "z",
        texture: RUNE_STRIP,
        name: "plinthRune",
      }),
      1.2,
    );
  }
  // gold corner studs on the plinth
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    rivet(GOLD, [Math.sin(a) * 0.396, 0.04, Math.cos(a) * 0.396], 0.011);
    rivet(GOLD, [Math.sin(a) * 0.337, 0.09, Math.cos(a) * 0.337], 0.008);
  }
  // ice crystal clusters ringing the base
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.2;
    const rr = 0.37 + R() * 0.1;
    const big = i % 3 === 0;
    cluster(
      [Math.sin(a) * rr, -0.005, Math.cos(a) * rr],
      [Math.sin(a) * 0.6, 1, Math.cos(a) * 0.6],
      big ? 4 : 3,
      big ? 0.032 : 0.02,
      big ? 0.26 : 0.14,
      [ICE, ICE2, ICE3],
      GLOW,
    );
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.6;
    const rr = 0.27;
    cluster([Math.sin(a) * rr, 0.12, Math.cos(a) * rr], [Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4], 3, 0.014, 0.075, [ICE2, ICE], GLOW);
  }

  // =========================================================================================== haft
  const hy0 = 0.2;
  const hy1 = 1.43;
  const haftPaint = cel(paint((p, n, s) => {
    void n;
    void s;
    const g = noise(p, 0.02, 9);
    return g < 0.4 ? "#233468" : g < 0.7 ? "#2c428a" : "#3a54a8";
  }));
  b.rod([0, hy0, 0], [0, hy1, 0], HAFT_R, haftPaint, { sides: 10, caps: "flat", bone: root, name: "haft" });
  // pommel: turned steel, gold rings, ice spike sunk in the plinth
  b.lathe(
    [
      [0, 0.1],
      [0.016, 0.125],
      [0.036, 0.15],
      [0.05, 0.175],
      [0.052, 0.2],
      [0.042, 0.228],
      [0.036, 0.27],
      [0, 0.27],
    ],
    { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color: cel("#33497f", "#1d2c5a"), name: "pommel" },
  );
  torus(GOLD, [0, 0.162, 0], [0, 1, 0], 0.044, 0.007);
  torus(GOLD, [0, 0.205, 0], [0, 1, 0], 0.051, 0.007);
  torus(GOLD2, [0, 0.255, 0], [0, 1, 0], 0.04, 0.006);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rivet(GOLD, [Math.sin(a) * 0.052, 0.183, Math.cos(a) * 0.052], 0.006);
  }
  // grip: crimson cord helix with gold collars
  const wrap = spiral([0, 0.4, 0], [HAFT_R + 0.002, 0.4, 0], [0, 1, 0], { turns: 17, pitch: 0.024 });
  b.sweep(wrap, 0.0052, cel(CRIMSON, CRIMSON2), { sides: 5, bone: root, caps: "round", name: "gripWrap" });
  for (const y of [0.37, 0.4, 0.8, 0.83]) torus(GOLD, [0, y, 0], [0, 1, 0], HAFT_R + 0.002, 0.006);
  for (const y of [0.34, 0.86]) torus(GOLD2, [0, y, 0], [0, 1, 0], HAFT_R + 0.004, 0.009, false, 6);
  // lower haft: lighter wood-steel bands
  for (const y of [0.28, 0.31, 0.55, 0.6, 0.65]) torus("#6a86d0", [0, y, 0], [0, 1, 0], HAFT_R + 0.001, 0.004);
  // upper haft: a thin glowing frost vine winding up
  const vine = spiral([0, 0.9, 0], [HAFT_R + 0.001, 0.9, 0], [0, 1, 0], { turns: 3.2, pitch: 0.044 });
  glow(b.sweep(vine, 0.0026, GLOW, { sides: 4, bone: root, caps: "round", name: "frostVine" }), 1.4);

  // =========================================================================================== head socket
  const socketPaint = cel(scales(["#32477c", "#2a3d70"], INKB, { size: 0.05, width: 0.2, seed: 8 }));
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.058, 0.018],
      [0.064, 0.045],
      [0.056, 0.075],
      [0.06, 0.12],
      [0.068, 0.17],
      [0.06, 0.22],
      [0.056, 0.26],
      [0.062, 0.3],
      [0.054, 0.335],
      [0.046, 0.36],
      [0, 0.36],
    ],
    { at: [0, 1.04, 0], bone: root, segments: 8, spin: 22.5, color: socketPaint, name: "socket" },
  );
  // flared under-collar
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.034, 0.03],
      [0.05, 0.065],
      [0.058, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.95, 0], bone: root, segments: 8, spin: 22.5, color: cel("#2d4482", "#1b2b5c"), name: "underCollar" },
  );
  torus(GOLD, [0, 1.05, 0], [0, 1, 0], 0.058, 0.0085, false, 6);
  torus(GOLD, [0, 1.115, 0], [0, 1, 0], 0.062, 0.0065);
  torus(GOLD, [0, 1.285, 0], [0, 1, 0], 0.061, 0.0065);
  torus(GOLD, [0, 1.355, 0], [0, 1, 0], 0.056, 0.0085, false, 6);
  torus(GOLD2, [0, 0.99, 0], [0, 1, 0], 0.04, 0.007);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    rivet(GOLD, [Math.sin(a) * 0.062, 1.083, Math.cos(a) * 0.062], 0.0065);
    rivet(GOLD, [Math.sin(a + 0.31) * 0.06, 1.315, Math.cos(a + 0.31) * 0.06], 0.0065);
  }
  // icicles hanging from the socket's lower ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const len = 0.035 + R() * 0.05;
    stash(i % 2 ? ICE : ICE2, place(new THREE.ConeGeometry(0.007, len, 5), [Math.sin(a) * 0.052, 1.045 - len / 2, Math.cos(a) * 0.052]));
  }
  // glowing rune gems in gold bezels, front and back
  for (const s of [1, -1]) {
    const gem = new THREE.OctahedronGeometry(0.03, 0).scale(0.72, 1.3, 0.6);
    stash(GLOW, place(gem, [0, HY + 0.01, s * 0.066]), true);
    torus(GOLD, [0, HY + 0.01, s * 0.062], [0, 0, 1], 0.034, 0.0065, false, 6);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      rivet(GOLD, [Math.sin(a) * 0.043, HY + 0.01 + Math.cos(a) * 0.043, s * 0.058], 0.005);
    }
  }

  // =========================================================================================== blades
  const rim = (poly: Pt[], s: number, face: 1 | -1, o: { u0: number; u1: number; v0: number; v1: number; ff: number; ft: number }) =>
    runeSvg(poly, { s, face, u0: o.u0, u1: o.u1, v0: o.v0, v1: o.v1, fernFrom: o.ff, fernTo: o.ft });

  // main crescent blade (model left, +X)
  b.extrude(mainOutline, {
    at: [0, HY, 0],
    x: [0, 1, 0],
    y: [1, 0, 0],
    thickness: 0.018,
    bevel: 0.006,
    smoothing: 1,
    color: bladePaint(mainPoly, "#2b4f9c", "#3a66b8", "#5788d0"),
    name: "mainBlade",
  });
  const mainBox = { u0: 0.02, u1: 0.42, v0: -0.34, v1: 0.38 };
  for (const face of [1, -1] as const) {
    const w = mainBox.u1 - mainBox.u0;
    const h = mainBox.v1 - mainBox.v0;
    glow(
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
        bone: root,
        at: [(mainBox.u0 + mainBox.u1) / 2, HY + (mainBox.v0 + mainBox.v1) / 2, face * 0.0105],
        dir: [0, 0, face],
        axis: "z",
        texture: rim(mainPoly, 1, face, { ...mainBox, ff: 0.23, ft: 0.33 }),
        name: "mainRunes",
      }),
      1.5,
    );
  }
  // ice fang counter blade (model right, -X)
  b.extrude(secOutline, {
    at: [0, HY, 0],
    x: [0, 1, 0],
    y: [-1, 0, 0],
    thickness: 0.015,
    bevel: 0.005,
    smoothing: 1,
    color: bladePaint(secPoly, "#2a4aa0", "#3c62c0", "#5a86d6"),
    name: "fangBlade",
  });
  const secBox = { u0: 0.02, u1: 0.4, v0: -0.28, v1: 0.43 };
  for (const face of [1, -1] as const) {
    const w = secBox.u1 - secBox.u0;
    const h = secBox.v1 - secBox.v0;
    glow(
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
        bone: root,
        at: [-(secBox.u0 + secBox.u1) / 2, HY + (secBox.v0 + secBox.v1) / 2, face * 0.0092],
        dir: [0, 0, face],
        axis: "z",
        texture: rim(secPoly, -1, face, { ...secBox, ff: 0.2, ft: 0.28 }),
        name: "fangRunes",
      }),
      1.5,
    );
  }
  // gold langets clamping each blade root, rivets
  const goldPaint = cel(GOLD, GOLD2);
  for (const s of [1, -1]) {
    const len = s > 0 ? 0.215 : 0.19;
    b.extrude(
      [
        [-0.07, 0.05],
        [-0.056, len * 0.7],
        [-0.03, len, "sharp"],
        [0.03, len, "sharp"],
        [0.056, len * 0.7],
        [0.07, 0.05],
      ],
      { at: [0, HY, 0], x: [0, 1, 0], y: [s, 0, 0], thickness: 0.032, bevel: 0.007, color: goldPaint, name: "langet" },
    );
    for (const fz of [1, -1]) {
      for (const [u, v] of [
        [0.09, 0.04],
        [0.09, -0.04],
        [0.15, 0.028],
        [0.15, -0.028],
      ])
        rivet(GOLD2, [s * u, HY + v, fz * 0.0165], 0.0075);
    }
  }
  // frost crystals growing out of the blade faces
  for (const fz of [1, -1]) {
    cluster([0.2, HY + 0.12, fz * 0.008], [0.2, 0.5, fz * 1.1], 4, 0.016, 0.1, [ICE, ICE2, ICE3], GLOW);
    cluster([0.24, HY - 0.13, fz * 0.008], [0.35, -0.3, fz * 1.1], 3, 0.013, 0.08, [ICE2, ICE], GLOW);
    cluster([-0.15, HY + 0.2, fz * 0.007], [-0.3, 0.6, fz * 1.1], 3, 0.013, 0.08, [ICE, ICE2], GLOW);
  }
  // charm hung from the lower horn
  torus(GOLD, [0.285, HY - 0.285, 0], [1, 0, 0], 0.014, 0.0035);

  // =========================================================================================== spearhead + crown
  const spear = b.extrude(SPEAR, {
    at: [0, 1.4, 0],
    x: [1, 0, 0],
    thickness: [0.028, 0.005],
    bevel: 0.004,
    smoothing: 1,
    color: bladePaint(spearPoly, "#2b4f9c", "#3a66b8", "#5788d0"),
    name: "spearhead",
  });
  void spear;
  const spZ = (y: number) => 0.5 * (0.028 - 0.023 * (y / 0.31)) + 0.001;
  for (const fz of [1, -1]) {
    glow(b.rod([0, 1.4 + 0.07, fz * spZ(0.07)], [0, 1.4 + 0.22, fz * spZ(0.22)], 0.0028, GLOW, { sides: 4, name: "spearSlit" }), 1.5);
  }
  // gold socket cap under the spearhead
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.056, 0.012],
      [0.04, 0.03],
      [0.03, 0.05],
      [0, 0.05],
    ],
    { at: [0, 1.395, 0], bone: root, segments: 8, spin: 22.5, color: goldPaint, name: "spearCap" },
  );
  // two ice prongs curling up from the crown, front and back
  for (const fz of [1, -1]) {
    b.sweep(catmull([[0, 1.43, fz * 0.04], [0, 1.5, fz * 0.1], [0, 1.6, fz * 0.1], [0, 1.69, fz * 0.065]]), [0.016, 0], cel(ICE2, "#7fc0ee"), {
      sides: 6,
      bone: root,
      caps: { start: "flat", end: "point" },
      name: "prong",
    });
  }
  // floating shards in the air near the head (magic motes)
  const motes: [number, number, number, number][] = [
    [0.46, 1.62, 0.05, 0.02],
    [0.52, 1.5, -0.04, 0.014],
    [-0.4, 1.66, 0.02, 0.016],
    [0.12, 1.78, -0.06, 0.012],
    [-0.12, 1.74, 0.07, 0.01],
  ];
  for (const [x, y, z, r] of motes) {
    const g = new THREE.OctahedronGeometry(r, 0).scale(0.7, 1.4, 0.7);
    stash(GLOW, place(g, [x, y, z]), true);
  }

  // =========================================================================================== pennants and charm
  for (const [name, sx, sz] of [
    ["pennantA", 1, 1],
    ["pennantB", -1, -1],
  ] as const) {
    const x = sx * 0.04;
    const z = sz * 0.04;
    const chain = b.chain(
      name,
      catmull([
        [x, 1.045, z],
        [x * 1.5, 0.95, z * 1.5],
        [x * 1.6, 0.83, z * 1.6],
        [x * 1.5, 0.7, z * 1.5],
      ]),
      { parent: root, names: [`${name}1`, `${name}2`, `${name}3`], role: "tail" },
    );
    b.sweep(chain, (t) => [0.027 * (1 - 0.15 * t), 0.0028], {
      section: "box",
      caps: { start: "flat", end: "point" },
      color: (t) => (t > 0.84 && t < 0.9 ? GOLD : t > 0.9 ? CRIMSON2 : CRIMSON),
      name: `${name}Cloth`,
    });
  }
  const cord = b.chain(
    "charm",
    catmull([
      [0.285, HY - 0.285, 0],
      [0.285, HY - 0.34, 0],
      [0.285, HY - 0.39, 0],
    ]),
    { parent: root, names: ["charm1", "charm2", "charmTip"], role: "tail" },
  );
  b.sweep(cord, 0.0028, GOLD2, { sides: 4, name: "charmCord" });
  const tipAt = [0.285, HY - 0.39, 0];
  glow(
    b.part(new THREE.OctahedronGeometry(0.028, 0), ICE, { bone: cord.tip!, at: [0.285, HY - 0.42, 0], scale: [0.8, 1.5, 0.8], flat: true, name: "charmGem" }),
    1.3,
  );
  b.part(new THREE.CylinderGeometry(0.014, 0.01, 0.014, 6), GOLD, { bone: cord.tip!, at: [tipAt[0], tipAt[1] - 0.004, tipAt[2]], flat: true, name: "charmCap" });

  // =========================================================================================== flush merged parts
  for (const [key, list] of bags) {
    const [color, g] = key.split("|");
    const merged = mergeGeometries(list)!;
    const part = b.part(merged, color, { bone: root, at: [0, 0, 0], flat: true, name: `bag.${color.slice(1)}${g === "1" ? ".glow" : ""}` });
    if (g === "1") glow(part, 1.4);
  }

  return b.root;
}
