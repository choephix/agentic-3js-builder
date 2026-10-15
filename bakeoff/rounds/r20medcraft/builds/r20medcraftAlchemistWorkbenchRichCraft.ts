import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemist's workbench: carved wooden table with gold filigree, glowing potions, stacked and open books, a brass balance scale, an alembic, mortar and herbs, hung herb bundles, shelves, lanterns and an elemental crystal.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];
type P2 = Array<[number, number]>;
type Opt = Omit<PartOptions, "bone" | "at">;

const Y = new THREE.Vector3(0, 1, 0);

// ---- flat colours (glow, tiny trims) ----
const GOLDF = "#f4c64e";
const BRASSF = "#c98f3f";
const INKF = "#2b1d33";
const CORKF = "#cf9d60";
const STRINGF = "#b88a52";
const RIBBON = "#e0445f";
const WHITE = "#ffffff";
const PAGEF = "#fff1d2";

// ---- cel palette ----
const GOLD = cel("#f4c64e", "#c98a2e");
const BRASS = cel("#d19a45", "#8f5a2a");
const CREAM = cel("#fff1d2", "#e9c6a0");
const TEAL = cel("#35b9b0");
const NAVY = cel("#3b4b8f", "#2a2f66");
const ROSE = cel("#e8607f");
const PURP = cel("#8d6bd6");
const LEATH = cel("#8b4a34", "#5e2f2f");
const GREENB = cel("#4a9a5a");
const IRON = cel("#4a5070", "#2f3350");
const GLASS = cel("#d3f3f0", "#9cc6dc");
const WOODX = cel(grain("#c0804f", "#a96a40", { size: 0.012, axis: "x" }));
const WOODY = cel(grain("#a56a43", "#8f5a38", { size: 0.012, axis: "y" }));
const DARKW = cel(grain("#8a553a", "#744530", { size: 0.012, axis: "y" }));
const DARKWX = cel(grain("#8a553a", "#744530", { size: 0.012, axis: "x" }));
const STONE = cel(mottle("#a8ded4", "#82c4bc", { size: 0.04 }));
const PAGE = paint((p) => ((((p.y / 0.0035) % 1) + 1) % 1 < 0.22 ? "#d9bf94" : "#fff3d8"));
const WALLBASE = cel(mottle("#52709f", "#46619a", { size: 0.15, contrast: 0.8 }));
const WALL = paint((p) => {
  const f = (((p.x + 0.93) / 0.186) % 1 + 1) % 1;
  return f < 0.022 || f > 0.978 ? "#2c3b63" : WALLBASE;
});
const CLOTH = paint((p) => {
  const dx = Math.abs(p.x) - 0.74;
  const dz = Math.abs(p.z - 0.03) - 0.24;
  if (Math.max(dx, dz) > -0.014) return "#f4c64e";
  if (Math.max(dx, dz) > -0.03) return "#b9433f";
  const d = Math.abs((((p.x + p.z) * 14) % 1));
  return d < 0.07 ? "#3fa7a8" : "#2f7f86";
});
const RUG = paint((p) => {
  const e = Math.min(1.1 - Math.abs(p.x), 0.7 - Math.abs(p.z - 0.12));
  if (e < 0.035) return "#fff1d2";
  if (e < 0.09) return "#d9566f";
  if (e < 0.108) return "#f4c64e";
  const q = Math.hypot(p.x / 1.1, (p.z - 0.12) / 0.7);
  if (q < 0.34) return Math.abs(Math.sin(q * 38)) < 0.25 ? "#f4c64e" : "#3fb3a8";
  if (e < 0.2) return Math.abs((p.x * 9) % 1) < 0.3 ? "#2f3f86" : "#3b4b9f";
  const d = Math.abs((p.x * 7) % 1 - 0.5) + Math.abs((p.z * 7) % 1 - 0.5);
  return d < 0.5 ? "#3c9f98" : "#2d8a84";
});

// ---- textures ----
const ornament = (n: number, w: number, h: number) => {
  let a = "";
  const step = w / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const mid = h / 2;
    a += `<path d="M${x + 3} ${mid} q${step * 0.25} -${h * 0.5} ${step * 0.5} 0 t${step * 0.5} 0"/>`;
    a += `<circle cx="${x + step * 0.5}" cy="${mid}" r="2.6" fill="#f4c64e" stroke-width="1.5"/>`;
  }
  return svg(
    `<svg viewBox="0 0 ${w} ${h}"><g fill="none" stroke="#4a2a1e" stroke-width="6" stroke-linecap="round" opacity="0.9">${a}</g><g fill="none" stroke="#f4c64e" stroke-width="3" stroke-linecap="round">${a}</g></svg>`,
    { size: 768 },
  );
};
const FIL = ornament(6, 240, 24);
const FILS = ornament(3, 120, 12);
const EMB = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#f4c64e" stroke-width="3"><circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="21" stroke-width="2"/></g>
  <polygon fill="#f4c64e" points="32,8 36,26 54,32 36,38 32,56 28,38 10,32 28,26"/><circle cx="32" cy="32" r="5" fill="#2b1d33"/></svg>`,
  { size: 192 },
);
const CIRCLE = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="#f4c64e" stroke-width="2.6" stroke-linejoin="round">
  <circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="40" stroke-width="1.6"/><circle cx="50" cy="50" r="19"/>
  <polygon points="50,12 83,69 17,69"/><polygon points="50,88 17,31 83,31" stroke="#7fe8d8"/></g>
  <g fill="#f4c64e"><circle cx="50" cy="4" r="3"/><circle cx="50" cy="96" r="3"/><circle cx="4" cy="50" r="3"/><circle cx="96" cy="50" r="3"/>
  <polygon points="50,40 53,47 60,50 53,53 50,60 47,53 40,50 47,47"/></g></svg>`,
  { size: 512 },
);
const pageTex = (flip: boolean) => {
  let l = "";
  for (let i = 0; i < 9; i++) l += `<path d="M8 ${(flip ? 12 : 40) + i * 4.2} H${44 + ((i * 7) % 12)}"/>`;
  const pic = flip
    ? `<circle cx="30" cy="26" r="11" fill="none" stroke="#3a8a8a" stroke-width="2"/><path d="M30 15 L36 33 L21 22 L39 22 L24 33Z" fill="none" stroke="#c0453a" stroke-width="1.6"/>`
    : `<path d="M30 36 C16 28 20 12 30 8 C40 12 44 28 30 36Z" fill="#6fbf6a" stroke="#2f7a3a" stroke-width="1.6"/><path d="M30 36 V12" stroke="#2f7a3a" stroke-width="1.6"/>`;
  return svg(`<svg viewBox="0 0 60 80"><g stroke="#7a5a40" stroke-width="1.8" stroke-linecap="round" fill="none">${l}</g>${pic}</svg>`, { size: 256 });
};
const PGL = pageTex(true);
const PGR = pageTex(false);
const labelTex = (sym: string) =>
  svg(
    `<svg viewBox="0 0 40 50"><rect x="2" y="2" width="36" height="46" rx="6" fill="#fff1d2" stroke="#7a4a2e" stroke-width="2.4"/>${sym}<path d="M10 43 H30" stroke="#7a4a2e" stroke-width="2" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
const LAB = [
  labelTex(`<path d="M20 9 C28 22 30 26 30 31 A10 10 0 0 1 10 31 C10 26 12 22 20 9Z" fill="#4aa8d8" stroke="#4a2c1e" stroke-width="1.6"/>`),
  labelTex(`<polygon points="20,8 23,17 32,15 26,22 32,30 23,28 20,37 17,28 8,30 14,22 8,15 17,17" fill="#e8a02a" stroke="#4a2c1e" stroke-width="1.4"/>`),
  labelTex(`<path d="M26 11 A13 13 0 1 0 30 33 A10 10 0 1 1 26 11Z" fill="#8d6bd6" stroke="#4a2c1e" stroke-width="1.6"/>`),
  labelTex(`<path d="M12 36 C8 20 20 10 31 10 C32 22 24 34 12 36Z" fill="#5fbf5a" stroke="#4a2c1e" stroke-width="1.6"/><path d="M12 36 L26 18" stroke="#fff1d2" stroke-width="1.6"/>`),
];
const LEAF = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 63 C4 44 6 16 20 1 C34 16 36 44 20 63Z" fill="#5fbf5a" stroke="#2f7a3a" stroke-width="2"/>
  <path d="M20 63 C34 44 36 16 20 1 Z" fill="#8fe070"/><path d="M20 62 V6 M20 40 L10 30 M20 40 L30 30 M20 26 L12 18 M20 26 L28 18" stroke="#2f7a3a" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const lavBuds = (() => {
  let s = "";
  for (let k = 0; k < 8; k++) {
    const y = 4 + k * 4.2;
    s += `<ellipse cx="${k % 2 ? 24 : 16}" cy="${y}" rx="4" ry="3" fill="${k % 3 ? "#9a72e0" : "#b896f0"}" stroke="#5a3a9a" stroke-width="1"/>`;
  }
  return s;
})();
const LAV = svg(`<svg viewBox="0 0 40 64"><path d="M20 63 V14" stroke="#5f8f45" stroke-width="3" stroke-linecap="round"/>${lavBuds}</svg>`, { size: 128 });
const BERRY = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 63 V10 M20 46 L8 36 M20 36 L32 26 M20 24 L9 16" stroke="#5f8f45" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="8" cy="34" r="5" fill="#e0445f" stroke="#8a2038" stroke-width="1.2"/><circle cx="32" cy="24" r="5" fill="#e0445f" stroke="#8a2038" stroke-width="1.2"/>
  <circle cx="9" cy="14" r="5" fill="#f0643a" stroke="#8a2038" stroke-width="1.2"/><circle cx="20" cy="7" r="5" fill="#e0445f" stroke="#8a2038" stroke-width="1.2"/></svg>`,
  { size: 128 },
);
const MINT = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 63 V8" stroke="#3f8a55" stroke-width="2.6" stroke-linecap="round"/>
  <ellipse cx="11" cy="48" rx="8" ry="5" fill="#46c8a0" stroke="#1f7a68" stroke-width="1.4"/><ellipse cx="29" cy="40" rx="8" ry="5" fill="#46c8a0" stroke="#1f7a68" stroke-width="1.4"/>
  <ellipse cx="11" cy="30" rx="7" ry="4.5" fill="#6fe0b8" stroke="#1f7a68" stroke-width="1.4"/><ellipse cx="29" cy="22" rx="7" ry="4.5" fill="#6fe0b8" stroke="#1f7a68" stroke-width="1.4"/>
  <ellipse cx="20" cy="9" rx="5" ry="7" fill="#8ff0c8" stroke="#1f7a68" stroke-width="1.4"/></svg>`,
  { size: 128 },
);

// ---- bottle kinds ----
type Kind = { prof: P2; liq: number; seg: number };
const KINDS: Record<string, Kind> = {
  flask: { prof: [[0.03, 0], [0.055, 0.012], [0.072, 0.045], [0.075, 0.08], [0.062, 0.118], [0.038, 0.145], [0.024, 0.17], [0.022, 0.215], [0.028, 0.225]], liq: 0.075, seg: 10 },
  vial: { prof: [[0.022, 0], [0.03, 0.01], [0.032, 0.1], [0.03, 0.13], [0.018, 0.15], [0.016, 0.19], [0.021, 0.2]], liq: 0.09, seg: 8 },
  cone: { prof: [[0.06, 0], [0.075, 0.006], [0.07, 0.03], [0.05, 0.09], [0.03, 0.13], [0.022, 0.15], [0.02, 0.2], [0.026, 0.21]], liq: 0.045, seg: 10 },
  squat: { prof: [[0.05, 0], [0.08, 0.02], [0.09, 0.06], [0.08, 0.105], [0.05, 0.13], [0.03, 0.148], [0.026, 0.18], [0.03, 0.19]], liq: 0.08, seg: 10 },
  square: { prof: [[0.05, 0], [0.05, 0.1], [0.03, 0.13], [0.02, 0.15], [0.02, 0.19], [0.025, 0.2]], liq: 0.085, seg: 4 },
  jar: { prof: [[0.045, 0], [0.055, 0.01], [0.056, 0.09], [0.05, 0.105], [0.045, 0.11]], liq: 0.085, seg: 10 },
};
const rAt = (prof: P2, y: number) => {
  if (y <= prof[0][1]) return prof[0][0];
  for (let i = 1; i < prof.length; i++)
    if (y <= prof[i][1]) {
      const [r0, y0] = prof[i - 1];
      const [r1, y1] = prof[i];
      return y1 === y0 ? r1 : r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
  return prof[prof.length - 1][0];
};
const solid = (prof: P2): P2 => [[0, prof[0][1]], ...prof, [0, prof[prof.length - 1][1]]];

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);
  const T = 0.87;

  // ---- helpers ----
  const put = (g: THREE.BufferGeometry, color: Fill, at: V | THREE.Vector3, o: Opt = {}) =>
    b.part(g, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: Fill, at: V | THREE.Vector3, o: Opt = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V | THREE.Vector3, o: Opt = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: number, color: Fill, at: V | THREE.Vector3, scale: number | V = 1, o: Opt = {}) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, { scale, ...o });
  const lat = (profile: P2, color: Fill, at: V | THREE.Vector3, seg = 12, o: object = {}) =>
    b.lathe(profile, { at, color, bone: root, segments: seg, ...o });
  const rod = (a: V | THREE.Vector3, c: V | THREE.Vector3, r: number, color: Fill, sides = 6) =>
    b.rod(a, c, r, color, { bone: root, sides });
  const decalUp = (tex: THREE.Texture, w: number, h: number, at: V | THREE.Vector3, up: V = [0, 0, -1]) =>
    put(new THREE.PlaneGeometry(w, h), WHITE, at, { dir: [0, 1, 0], axis: "z", up, texture: tex });
  const decalZ = (tex: THREE.Texture, w: number, h: number, at: V, dir: V = [0, 0, 1]) =>
    put(new THREE.PlaneGeometry(w, h), WHITE, at, { dir, axis: "z", texture: tex });
  const tassel = (x: number, y: number, z: number, color: Fill, flat: string) => {
    rod([x, y + 0.02, z], [x, y, z], 0.003, flat, 4);
    ball(0.011, color, [x, y - 0.005, z]);
    cyl(0.007, 0.017, 0.035, 8, color, [x, y - 0.032, z]);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.spike([x + Math.cos(a) * 0.01, y - 0.045, z + Math.sin(a) * 0.01], [0, -1, 0], 0.04, 0.005, flat, { bone: root, sides: 4 });
    }
  };
  const spark = (at: V, s: number, color: string) => {
    glow(put(new THREE.OctahedronGeometry(1, 0), color, at, { scale: [s * 0.4, s, s * 0.2] }), 1.4);
    glow(put(new THREE.OctahedronGeometry(1, 0), color, at, { scale: [s, s * 0.4, s * 0.2] }), 1.4);
  };
  const bloom = (x: number, y: number, z: number, s: number, color: string, core: string) => {
    glow(ball(0.012 * s, core, [x, y, z]), 1.3);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const d: V = [Math.cos(a) * 0.8, 0.45, Math.sin(a) * 0.8];
      const n = Math.hypot(...d);
      const u: V = [d[0] / n, d[1] / n, d[2] / n];
      glow(
        put(new THREE.SphereGeometry(0.01 * s, 6, 4), color, [x + u[0] * 0.016 * s, y + u[1] * 0.016 * s, z + u[2] * 0.016 * s], {
          dir: u,
          scale: [0.55, 1.5, 0.3],
        }),
        0.9,
      );
    }
  };
  const scroll = (at: V, len: number, r: number, dir: V, rib: Fill) => {
    const n = Math.hypot(...dir);
    const u = new THREE.Vector3(dir[0] / n, dir[1] / n, dir[2] / n);
    const c = new THREE.Vector3(...at);
    cyl(r, r, len, 10, CREAM, c, { dir });
    cyl(r * 1.1, r * 1.1, 0.02, 10, rib, c, { dir });
    for (const s of [-1, 1]) {
      cyl(r * 0.45, r * 0.45, 0.028, 6, WOODY, c.clone().addScaledVector(u, s * (len / 2 + 0.01)), { dir });
      ball(r * 0.6, GOLD, c.clone().addScaledVector(u, s * (len / 2 + 0.026)));
    }
  };

  function bottle(kind: string, at: V, liquid: string, k = 1, label?: THREE.Texture) {
    const K = KINDS[kind];
    const prof = K.prof.map(([r, y]) => [r * k, y * k] as [number, number]);
    const liq = K.liq * k;
    const top = prof[prof.length - 1];
    const rl = rAt(prof, liq);
    const low: P2 = [...prof.filter(([, y]) => y < liq), [rl, liq]];
    const up: P2 = [[rl, liq], ...prof.filter(([, y]) => y > liq)];
    glow(lat(solid(low), liquid, at, K.seg), 0.7);
    lat(solid(up), GLASS, at, K.seg);
    const [x, y, z] = at;
    cyl(top[0] * 1.2, top[0] * 1.2, 0.009 * k, 8, GOLDF, [x, y + top[1] - 0.012 * k, z]);
    cyl(top[0] * 0.95, top[0] * 0.75, 0.032 * k, 8, CORKF, [x, y + top[1] + 0.012 * k, z]);
    if (kind !== "jar" && kind !== "cone") {
      const ym = liq * 0.75;
      const r = rAt(prof, ym);
      put(new THREE.SphereGeometry(1, 6, 4), WHITE, [x - r * 0.5, y + ym, z + r * 0.86], {
        scale: [0.004 * k, liq * 0.2, 0.004 * k],
      });
    }
    if (label) {
      const yl = liq * 0.62;
      decalZ(label, 0.05 * k, 0.062 * k, [x, y + yl, z + rAt(prof, yl) + 0.004 * k]);
    }
    if (kind === "jar") cyl(0.058 * k, 0.058 * k, 0.014 * k, 10, WOODY, [x, y + top[1] + 0.004 * k, z]);
  }

  function flatBook(at: V, ang: number, w: number, h: number, d: number, cover: Fill) {
    const r = ang * DEG;
    const base = new THREE.Vector3(...at);
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyAxisAngle(Y, r).add(base);
    const rot: V = [0, ang, 0];
    const B = (sx: number, sy: number, sz: number, col: Fill, x: number, y: number, z: number) =>
      box(sx, sy, sz, col, P(x, y, z), { rotation: rot });
    const cov = 0.007;
    B(w, cov, d, cover, 0, cov / 2, 0);
    B(w, cov, d, cover, 0, h - cov / 2, 0);
    B(0.014, h, d, cover, -w / 2 + 0.007, h / 2, 0);
    B(w - 0.016, h - 2 * cov + 0.002, d - 0.014, PAGE, 0.004, h / 2, 0);
    for (const z of [-d * 0.3, 0, d * 0.3]) B(0.018, h + 0.004, 0.011, GOLDF, -w / 2 + 0.006, h / 2, z);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) B(0.028, 0.003, 0.028, GOLDF, sx * (w / 2 - 0.016), h + 0.0012, sz * (d / 2 - 0.016));
    const m = Math.min(w - 0.05, d) * 0.55;
    decalUp(EMB, m, m, P(0.01, h + 0.0018, 0), new THREE.Vector3(0, 0, -1).applyAxisAngle(Y, r).toArray() as V);
    return h;
  }

  function upBook(x: number, y: number, z: number, w: number, h: number, d: number, cover: Fill) {
    box(0.006, h, d, cover, [x - w / 2 + 0.003, y + h / 2, z]);
    box(0.006, h, d, cover, [x + w / 2 - 0.003, y + h / 2, z]);
    box(w, h, 0.01, cover, [x, y + h / 2, z + d / 2 - 0.005]);
    box(w - 0.012, h - 0.01, d - 0.016, PAGE, [x, y + h / 2, z - 0.004]);
    for (const f of [0.18, 0.82]) box(w + 0.004, 0.01, 0.012, GOLDF, [x, y + h * f, z + d / 2]);
    box(w * 0.7, h * 0.24, 0.004, PAGEF, [x, y + h * 0.5, z + d / 2 + 0.003]);
    box(w * 0.5, 0.004, 0.005, BRASSF, [x, y + h * 0.5, z + d / 2 + 0.005]);
  }

  function bundle(x: number, y: number, z: number, tex: THREE.Texture, n: number, len: number, wid: number) {
    rod([x, 1.72, z], [x, y + 0.01, z], 0.003, STRINGF, 4);
    const fr = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return frame([x + Math.cos(a) * 0.012, y, z + Math.sin(a) * 0.012], [0, 1, 0]);
    });
    b.cards(fr, tex, {
      size: [wid, len],
      lean: 166,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      cross: true,
      vary: 0.25,
      spin: 40,
      rng: rand,
    });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.57 + 0.4;
      rod([x + Math.cos(a) * 0.008, y, z + Math.sin(a) * 0.008], [x + Math.cos(a) * 0.03, y - 0.1, z + Math.sin(a) * 0.03], 0.0035, "#8a6a3c", 4);
    }
    cyl(0.019, 0.019, 0.016, 8, RIBBON, [x, y - 0.012, z]);
    ball(0.011, GOLDF, [x, y - 0.012, z + 0.02]);
  }

  // ---- rug ----
  box(2.2, 0.012, 1.4, RUG, [0, 0.006, 0.12]);

  // ---- table ----
  box(1.72, 0.07, 0.76, WOODX, [0, 0.835, 0]);
  box(1.5, 0.004, 0.5, CLOTH, [0, T + 0.002, 0.03]);
  box(1.74, 0.014, 0.014, GOLDF, [0, 0.86, 0.381]);
  box(1.74, 0.014, 0.014, GOLDF, [0, 0.86, -0.381]);
  box(0.014, 0.014, 0.78, GOLDF, [0.861, 0.86, 0]);
  box(0.014, 0.014, 0.78, GOLDF, [-0.861, 0.86, 0]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(0.08, 0.8, 0.08, DARKW, [sx * 0.78, 0.4, sz * 0.31]);
      box(0.092, 0.03, 0.092, GOLDF, [sx * 0.78, 0.015, sz * 0.31]);
      box(0.092, 0.022, 0.092, GOLDF, [sx * 0.78, 0.77, sz * 0.31]);
      box(0.086, 0.2, 0.086, DARKW, [sx * 0.78, 0.5, sz * 0.31]);
      box(0.012, 0.18, 0.012, TEAL, [sx * 0.78 + sx * 0.04, 0.5, sz * 0.31 + sz * 0.04]);
      ball(0.018, GOLD, [sx * 0.78, 0.8, sz * 0.31 + sz * 0.04]);
    }
  box(1.48, 0.12, 0.04, DARKWX, [0, 0.74, 0.31]);
  box(1.48, 0.12, 0.04, DARKWX, [0, 0.74, -0.31]);
  box(0.04, 0.12, 0.54, DARKW, [0.78, 0.74, 0]);
  box(0.04, 0.12, 0.54, DARKW, [-0.78, 0.74, 0]);
  decalZ(FIL, 1.2, 0.12, [0, 0.74, 0.3315]);
  decalZ(FILS, 0.5, 0.05, [0.8015, 0.74, 0], [1, 0, 0]);
  decalZ(FILS, 0.5, 0.05, [-0.8015, 0.74, 0], [-1, 0, 0]);
  box(1.48, 0.035, 0.56, WOODX, [0, 0.26, 0]);
  box(1.5, 0.012, 0.012, GOLDF, [0, 0.265, 0.286]);
  box(1.48, 0.04, 0.03, DARKWX, [0, 0.2, 0.28]);
  box(1.48, 0.04, 0.03, DARKWX, [0, 0.2, -0.28]);
  box(0.03, 0.05, 0.56, DARKW, [0, 0.2, 0]);

  // ---- back wall, posts, beam ----
  box(1.86, 0.91, 0.04, WALL, [0, 1.325, -0.36]);
  box(1.86, 0.025, 0.05, GOLDF, [0, 0.885, -0.335]);
  box(1.86, 0.025, 0.05, GOLDF, [0, 1.775, -0.335]);
  for (const sx of [-1, 1]) {
    box(0.08, 1.8, 0.08, DARKW, [sx * 0.97, 0.9, -0.36]);
    box(0.092, 0.05, 0.092, GOLDF, [sx * 0.97, 1.775, -0.36]);
    box(0.092, 0.03, 0.092, GOLDF, [sx * 0.97, 0.015, -0.36]);
    ball(0.032, GOLD, [sx * 0.97, 1.83, -0.36]);
    box(0.012, 0.9, 0.012, TEAL, [sx * 0.97, 1.0, -0.318]);
  }
  decalZ(CIRCLE, 0.42, 0.42, [0, 1.3, -0.3395]);
  cyl(0.018, 0.018, 1.86, 10, DARKW, [0, 1.72, -0.3], { rotation: [0, 0, 90] });
  for (const sx of [-1, 1]) {
    cyl(0.024, 0.024, 0.03, 8, GOLDF, [sx * 0.9, 1.72, -0.3], { rotation: [0, 0, 90] });
    rod([sx * 0.93, 1.72, -0.325], [sx * 0.93, 1.72, -0.3], 0.012, GOLDF, 6);
  }
  tassel(-0.62, 1.7, -0.3, GOLD, GOLDF);
  tassel(0.62, 1.7, -0.3, GOLD, GOLDF);

  bundle(-0.22, 1.69, -0.3, LAV, 9, 0.24, 0.07);
  bundle(-0.06, 1.69, -0.3, LEAF, 7, 0.22, 0.08);
  bundle(0.1, 1.69, -0.3, BERRY, 8, 0.24, 0.08);
  bundle(0.26, 1.69, -0.3, MINT, 8, 0.22, 0.08);

  // lanterns
  for (const [sx, col] of [
    [-1, "#7fe8d8"],
    [1, "#ffb347"],
  ] as const) {
    const x = sx * 0.885;
    rod([x, 1.72, -0.3], [x, 1.665, -0.3], 0.003, GOLDF, 4);
    cyl(0.0, 0.05, 0.04, 6, GOLD, [x, 1.645, -0.3]);
    glow(box(0.07, 0.1, 0.07, col, [x, 1.57, -0.3]), 1.4);
    glow(ball(0.02, "#fff6c8", [x, 1.57, -0.3]), 1.6);
    for (const ax of [-1, 1])
      for (const az of [-1, 1]) rod([x + ax * 0.037, 1.52, -0.3 + az * 0.037], [x + ax * 0.037, 1.62, -0.3 + az * 0.037], 0.004, GOLDF, 4);
    cyl(0.05, 0.04, 0.02, 6, GOLD, [x, 1.512, -0.3]);
    ball(0.012, GOLD, [x, 1.495, -0.3]);
  }

  // ---- shelves ----
  const shelf = (sx: number, y: number) => {
    const cx = sx * 0.57;
    box(0.54, 0.025, 0.2, WOODX, [cx, y, -0.24]);
    box(0.54, 0.012, 0.012, GOLDF, [cx, y + 0.002, -0.14]);
    for (const dx of [-0.2, 0.2]) rod([cx + dx, y - 0.012, -0.14], [cx + dx, y - 0.1, -0.33], 0.009, DARKW, 5);
  };
  shelf(-1, 1.18);
  shelf(-1, 1.42);
  shelf(1, 1.18);
  shelf(1, 1.42);
  const S1 = 1.1925;
  const S2 = 1.4325;
  // left lower
  bottle("jar", [-0.79, S1, -0.24], "#7be86b", 0.8);
  bottle("jar", [-0.7, S1, -0.24], "#ffb53a", 0.8);
  upBook(-0.6, S1, -0.24, 0.04, 0.17, 0.13, NAVY);
  upBook(-0.555, S1, -0.24, 0.035, 0.19, 0.13, ROSE);
  upBook(-0.515, S1, -0.24, 0.04, 0.16, 0.13, TEAL);
  upBook(-0.47, S1, -0.24, 0.036, 0.18, 0.13, LEATH);
  bottle("flask", [-0.37, S1, -0.24], "#a67bff", 0.6, LAB[0]);
  // left upper
  bottle("vial", [-0.8, S2, -0.24], "#38e0c8", 0.7);
  bottle("vial", [-0.73, S2, -0.24], "#ff6f9c", 0.7);
  bottle("squat", [-0.62, S2, -0.24], "#a67bff", 0.55, LAB[2]);
  bottle("cone", [-0.5, S2, -0.24], "#59a8ff", 0.6);
  flatBook([-0.4, S2, -0.24], 12, 0.14, 0.04, 0.1, PURP);
  flatBook([-0.4, S2 + 0.04, -0.24], -8, 0.12, 0.03, 0.09, GREENB);
  // right lower
  upBook(0.38, S1, -0.24, 0.04, 0.18, 0.13, GREENB);
  upBook(0.425, S1, -0.24, 0.036, 0.16, 0.13, GOLD);
  upBook(0.465, S1, -0.24, 0.04, 0.19, 0.13, PURP);
  bottle("jar", [0.57, S1, -0.24], "#59a8ff", 0.8);
  bottle("jar", [0.67, S1, -0.24], "#ff6f9c", 0.8);
  bottle("squat", [0.77, S1, -0.24], "#38e0c8", 0.5, LAB[1]);
  // right upper
  bottle("square", [0.4, S2, -0.24], "#ffb53a", 0.7);
  bottle("flask", [0.5, S2, -0.24], "#7be86b", 0.55, LAB[3]);
  bottle("vial", [0.6, S2, -0.24], "#a67bff", 0.7);
  bottle("cone", [0.69, S2, -0.24], "#ff6f9c", 0.6);
  upBook(0.77, S2, -0.24, 0.036, 0.15, 0.12, NAVY);
  scroll([0.52, S2 + 0.0, -0.17], 0.12, 0.014, [1, 0, 0.2], RIBBON);
  spark([-0.55, 1.62, -0.2], 0.014, "#fff3b0");
  spark([0.55, 1.62, -0.2], 0.014, "#7fe8d8");

  // ---- books stack (table, left) ----
  let sy = T;
  sy += flatBook([-0.74, sy, -0.12], 8, 0.24, 0.045, 0.17, NAVY);
  sy += flatBook([-0.73, sy, -0.12], -12, 0.22, 0.038, 0.16, ROSE);
  sy += flatBook([-0.745, sy, -0.12], 5, 0.2, 0.05, 0.15, LEATH);
  sy += flatBook([-0.74, sy, -0.12], -20, 0.17, 0.03, 0.13, TEAL);
  ball(0.02, GOLD, [-0.68, sy + 0.012, -0.06], [1, 0.5, 1]);
  scroll([-0.76, T + 0.022, 0.24], 0.2, 0.022, [1, 0, 0.15], RIBBON);
  scroll([-0.74, T + 0.05, 0.24], 0.18, 0.018, [1, 0, -0.1], "#3fb3a8");

  // ---- open book on table ----
  {
    const ox = -0.42;
    const oz = 0.2;
    box(0.36, 0.012, 0.26, TEAL, [ox, T + 0.006, oz]);
    for (const sx of [-1, 1]) {
      box(0.165, 0.03, 0.235, PAGE, [ox + sx * 0.088, T + 0.027, oz]);
      box(0.165, 0.004, 0.012, GOLDF, [ox + sx * 0.088, T + 0.013, oz + 0.126]);
      decalUp(sx < 0 ? PGL : PGR, 0.15, 0.2, [ox + sx * 0.088, T + 0.0425, oz]);
    }
    box(0.014, 0.012, 0.25, TEAL, [ox, T + 0.012, oz]);
    box(0.15, 0.002, 0.2, PAGEF, [ox + 0.09, T + 0.08, oz], { rotation: [0, 0, 28] });
    rod([ox, T + 0.04, oz + 0.12], [ox + 0.005, T + 0.008, oz + 0.17], 0.003, RIBBON, 4);
    tassel(ox + 0.005, T + 0.012, oz + 0.185, GOLD, GOLDF);
    glow(ball(0.032, "#9cf07a", [ox, T + 0.27, oz]), 1.3);
    glow(put(new THREE.TorusGeometry(0.055, 0.003, 4, 20), GOLDF, [ox, T + 0.27, oz], { rotation: [70, 0, 0] }), 1.2);
    glow(put(new THREE.TorusGeometry(0.075, 0.003, 4, 24), "#7fe8d8", [ox, T + 0.27, oz], { rotation: [20, 0, 35] }), 1.2);
    spark([ox - 0.1, T + 0.2, oz - 0.04], 0.014, "#fff3b0");
    spark([ox + 0.1, T + 0.32, oz + 0.03], 0.011, "#9cf07a");
    spark([ox + 0.05, T + 0.16, oz + 0.08], 0.009, "#7fe8d8");
  }

  // ---- ink pot and quill ----
  {
    const ix = -0.18;
    const iz = 0.27;
    lat(solid([[0.028, 0], [0.04, 0.012], [0.042, 0.04], [0.03, 0.055], [0.02, 0.062]]), NAVY, [ix, T, iz], 10);
    cyl(0.026, 0.026, 0.008, 10, GOLDF, [ix, T + 0.06, iz]);
    cyl(0.018, 0.018, 0.004, 10, INKF, [ix, T + 0.066, iz]);
    const th = -25 * DEG;
    const xv = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y, th);
    const yv = new THREE.Vector3(0, 0, -1).applyAxisAngle(Y, th);
    const baseP = new THREE.Vector3(ix + 0.09, T + 0.008, iz + 0.04);
    rod(baseP.clone().addScaledVector(yv, -0.07), baseP, 0.003, "#e9d3a0", 4);
    b.spike(baseP.clone().addScaledVector(yv, -0.07), baseP.clone().addScaledVector(yv, -0.095), null, 0.003, INKF, { bone: root, sides: 4 });
    b.extrude(
      [[0, 0], [0.013, 0.04], [0.011, 0.1], [0, 0.15, "sharp"], [-0.011, 0.1], [-0.013, 0.04]],
      { at: baseP, x: xv.toArray(), y: yv.toArray(), thickness: 0.003, color: cel("#7fe0d0", "#4fb0b8"), bone: root, smoothing: 1 },
    );
  }

  // ---- alembic ----
  {
    const ax = -0.3;
    const az = -0.12;
    cyl(0.05, 0.06, 0.05, 10, IRON, [ax, T + 0.025, az]);
    cyl(0.055, 0.055, 0.008, 10, GOLDF, [ax, T + 0.05, az]);
    glow(b.spike([ax, T + 0.05, az], [0, 1, 0], 0.06, 0.02, "#ffb347", { bone: root, sides: 6 }), 1.6);
    glow(b.spike([ax, T + 0.05, az], [0, 1, 0], 0.04, 0.01, "#fff3b0", { bone: root, sides: 6 }), 1.8);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094 + 0.5;
      rod([ax + Math.cos(a) * 0.07, T + 0.0, az + Math.sin(a) * 0.07], [ax + Math.cos(a) * 0.04, T + 0.15, az + Math.sin(a) * 0.04], 0.006, IRON, 5);
    }
    cyl(0.055, 0.055, 0.008, 10, GOLDF, [ax, T + 0.15, az]);
    const fy = T + 0.155;
    const fl = KINDS.flask;
    const prof = fl.prof;
    glow(lat(solid(prof.filter(([, y]) => y < 0.09).concat([[rAt(prof, 0.09), 0.09]])), "#a67bff", [ax, fy, az], 10), 0.8);
    lat(solid([[rAt(prof, 0.09), 0.09], ...prof.filter(([, y]) => y > 0.09)]), GLASS, [ax, fy, az], 10);
    cyl(0.03, 0.03, 0.01, 8, GOLDF, [ax, fy + 0.2, az]);
    const ty = fy + 0.225;
    cyl(0.026, 0.02, 0.025, 8, CORKF, [ax, ty + 0.005, az]);
    const path = catmull([[ax, ty, az], [ax + 0.1, ty + 0.03, az], [ax + 0.2, ty - 0.02, az], [ax + 0.26, ty - 0.12, az], [ax + 0.26, T + 0.2, az]]);
    b.sweep(path, 0.011, { color: BRASS, bone: root, sides: 6 });
    for (const t of [0.2, 0.45, 0.7]) {
      const p = path.at(t);
      ball(0.017, GOLD, p);
    }
    bottle("vial", [ax + 0.26, T, az], "#38e0c8", 1.0);
    for (let k = 0; k < 3; k++) glow(ball(0.008 + k * 0.002, "#c9a9ff", [ax + 0.005 * k, fy + 0.11 + k * 0.01, az + 0.005 * k]), 1.2);
  }

  // ---- crystal on cradle ----
  {
    const cx = 0.15;
    const cz = -0.21;
    lat(solid([[0.05, 0], [0.055, 0.012], [0.04, 0.03], [0.03, 0.04]]), BRASS, [cx, T, cz], 8);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.571 + 0.78;
      rod([cx + Math.cos(a) * 0.035, T + 0.035, cz + Math.sin(a) * 0.035], [cx + Math.cos(a) * 0.028, T + 0.1, cz + Math.sin(a) * 0.028], 0.005, GOLDF, 4);
    }
    glow(put(new THREE.OctahedronGeometry(1, 0), "#5fe8ff", [cx, T + 0.095, cz], { scale: [0.045, 0.08, 0.045], flat: true }), 1.4);
    glow(put(new THREE.OctahedronGeometry(1, 0), "#b8f6ff", [cx + 0.07, T + 0.045, cz + 0.02], { scale: [0.018, 0.035, 0.018], flat: true }), 1.4);
    glow(put(new THREE.OctahedronGeometry(1, 0), "#7fe8d8", [cx - 0.065, T + 0.035, cz + 0.03], { scale: [0.015, 0.03, 0.015], flat: true, rotation: [0, 0, 18] }), 1.4);
    spark([cx + 0.05, T + 0.2, cz], 0.012, "#b8f6ff");
  }
  bottle("square", [0.31, T, -0.2], "#59a8ff", 1.0);

  // ---- balance scale ----
  {
    const sx = 0.5;
    const sz = -0.03;
    lat(solid([[0.08, 0], [0.085, 0.015], [0.06, 0.035], [0.03, 0.05], [0.018, 0.09], [0.014, 0.3], [0.022, 0.32]]), BRASS, [sx, T, sz], 12);
    for (const y of [0.03, 0.12]) cyl(0.03, 0.03, 0.008, 10, GOLDF, [sx, T + y, sz]);
    ball(0.022, GOLD, [sx, T + 0.34, sz]);
    const a = 4 * DEG;
    const by = T + 0.34;
    box(0.46, 0.014, 0.018, GOLD, [sx, by, sz], { rotation: [0, 0, 4] });
    const ends: Array<[number, V]> = [
      [1, [sx + 0.23 * Math.cos(a), by + 0.23 * Math.sin(a), sz]],
      [-1, [sx - 0.23 * Math.cos(a), by - 0.23 * Math.sin(a), sz]],
    ];
    for (const [sgn, e] of ends) {
      ball(0.014, GOLD, e);
      const py = e[1] - 0.21;
      lat([[0, 0], [0.05, 0], [0.085, 0.022], [0.092, 0.027], [0.085, 0.029], [0.04, 0.012], [0, 0.01]], BRASS, [e[0], py, sz], 12);
      for (let k = 0; k < 3; k++) {
        const t = k * 2.094 + 1.0;
        rod(e, [e[0] + Math.cos(t) * 0.088, py + 0.027, sz + Math.sin(t) * 0.088], 0.0025, GOLDF, 4);
      }
      if (sgn < 0) {
        for (let k = 0; k < 3; k++) {
          const wx = e[0] + (k - 1) * 0.036;
          cyl(0.012, 0.016, 0.02, 8, BRASS, [wx, py + 0.02, sz + (k === 1 ? 0.02 : -0.012)]);
          ball(0.007, GOLD, [wx, py + 0.035, sz + (k === 1 ? 0.02 : -0.012)]);
        }
      } else {
        glow(put(new THREE.OctahedronGeometry(1, 0), "#ff6f9c", [e[0], py + 0.04, sz], { scale: [0.022, 0.03, 0.022], flat: true }), 1.2);
        ball(0.012, "#8fe070", [e[0] + 0.04, py + 0.03, sz - 0.02], [1.5, 0.6, 1]);
      }
    }
  }

  // ---- plant pot (table back right) ----
  {
    const px = 0.75;
    const pz = -0.22;
    lat(solid([[0.05, 0], [0.08, 0.015], [0.09, 0.1], [0.1, 0.12], [0.1, 0.135]]), TEAL, [px, T, pz], 10);
    cyl(0.104, 0.104, 0.014, 10, GOLDF, [px, T + 0.125, pz]);
    cyl(0.088, 0.088, 0.01, 10, "#5a3a2a", [px, T + 0.132, pz]);
    decalZ(FILS, 0.12, 0.012, [px, T + 0.06, pz + 0.0875 + 0.003]);
    const fr = Array.from({ length: 12 }, (_, i) => frame([px + Math.cos(i * 2.4) * 0.025, T + 0.135, pz + Math.sin(i * 2.4) * 0.025], [0, 1, 0]));
    b.cards(fr, LEAF, {
      size: [0.085, 0.2],
      lean: 38,
      bend: 25,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      vary: 0.3,
      rng: rand,
    });
    for (const [dx, dz, h] of [[0.0, 0.0, 0.3], [-0.04, 0.03, 0.24], [0.04, 0.03, 0.2]] as const) {
      rod([px, T + 0.135, pz], [px + dx, T + 0.135 + h, pz + dz], 0.004, "#3f8a55", 4);
      bloom(px + dx, T + 0.135 + h + 0.008, pz + dz, 1.3, "#ff8fc0", "#fff3b0");
    }
  }

  // ---- mortar and pestle ----
  {
    const mx = 0.14;
    const mz = 0.24;
    lat([[0, 0], [0.05, 0], [0.075, 0.02], [0.085, 0.06], [0.09, 0.075], [0.075, 0.075], [0.065, 0.045], [0, 0.03]], STONE, [mx, T, mz], 12);
    cyl(0.092, 0.092, 0.012, 12, GOLDF, [mx, T + 0.068, mz]);
    cyl(0.06, 0.07, 0.016, 10, GOLDF, [mx, T + 0.008, mz]);
    for (const [dx, dz, c] of [[-0.02, 0.0, "#5fbf5a"], [0.02, -0.01, "#8fdc6a"], [0.0, 0.025, "#46c8a0"], [0.03, 0.02, "#5fbf5a"], [-0.03, -0.025, "#8fdc6a"]] as const)
      ball(0.02, c, [mx + dx, T + 0.045, mz + dz], [1, 0.45, 1]);
    b.capsule([mx - 0.02, T + 0.07, mz + 0.0], [mx + 0.08, T + 0.2, mz + 0.07], [0.014, 0.022], { color: STONE, bone: root, sides: 8 });
    b.cards(
      [frame([mx + 0.04, T + 0.05, mz - 0.03], [0, 1, 0]), frame([mx - 0.05, T + 0.05, mz + 0.03], [0, 1, 0]), frame([mx, T + 0.05, mz + 0.05], [0, 1, 0])],
      MINT,
      { size: [0.05, 0.09], lean: 40, flow: [1, 0, 0.5], bend: 20 },
    );
  }

  // ---- candle ----
  {
    const cx = 0.31;
    const cz = 0.25;
    lat([[0, 0], [0.04, 0], [0.045, 0.01], [0.04, 0.018], [0.02, 0.02], [0, 0.02]], BRASS, [cx, T, cz], 10);
    rod([cx + 0.04, T + 0.012, cz], [cx + 0.06, T + 0.03, cz], 0.006, GOLDF, 4);
    cyl(0.016, 0.017, 0.08, 8, CREAM, [cx, T + 0.06, cz]);
    ball(0.008, CREAM, [cx + 0.012, T + 0.085, cz + 0.01], [1, 1.6, 1]);
    glow(put(new THREE.ConeGeometry(0.011, 0.04, 6), "#ffb347", [cx, T + 0.123, cz]), 1.6);
    glow(put(new THREE.ConeGeometry(0.006, 0.025, 6), "#fff6c8", [cx, T + 0.118, cz]), 1.8);
    spark([cx + 0.03, T + 0.17, cz], 0.009, "#ffd88a");
  }

  // ---- front-right potions ----
  bottle("flask", [0.47, T, 0.27], "#a67bff", 1.0, LAB[0]);
  bottle("squat", [0.66, T, 0.25], "#ff6f9c", 0.8, LAB[2]);
  bottle("vial", [0.8, T, 0.28], "#38e0c8", 1.0);
  bottle("cone", [-0.02, T, 0.07], "#ffb53a", 1.0);
  bottle("jar", [0.6, T, 0.1], "#7be86b", 0.7);
  spark([0.47, T + 0.3, 0.27], 0.013, "#d6c2ff");
  spark([0.7, T + 0.26, 0.25], 0.011, "#ffc1d6");
  spark([0.8, T + 0.27, 0.28], 0.01, "#b8fff0");

  // ---- lower shelf contents ----
  {
    const sh = 0.2775;
    let y = sh;
    y += flatBook([-0.55, y, 0.0], 10, 0.26, 0.05, 0.18, LEATH);
    y += flatBook([-0.56, y, 0.0], -6, 0.24, 0.04, 0.17, GREENB);
    flatBook([-0.55, y, 0.0], 18, 0.2, 0.035, 0.15, ROSE);
    bottle("jar", [-0.2, sh, 0.05], "#ffb53a", 0.9);
    bottle("jar", [-0.1, sh, -0.1], "#a67bff", 0.8);
    scroll([-0.3, sh + 0.025, 0.15], 0.22, 0.025, [1, 0, 0.1], RIBBON);
    // cauldron
    const cx = 0.38;
    const cz = 0.0;
    lat(solid([[0.08, 0], [0.12, 0.03], [0.14, 0.09], [0.13, 0.14], [0.12, 0.15]]), IRON, [cx, sh + 0.02, cz], 12);
    cyl(0.14, 0.14, 0.014, 12, IRON, [cx, sh + 0.165, cz]);
    glow(cyl(0.12, 0.12, 0.006, 12, "#7be86b", [cx, sh + 0.172, cz]), 1.2);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094;
      cyl(0.016, 0.006, 0.04, 6, IRON, [cx + Math.cos(a) * 0.1, sh + 0.02, cz + Math.sin(a) * 0.1]);
    }
    b.sweep(catmull([[cx - 0.14, sh + 0.16, cz], [cx - 0.1, sh + 0.28, cz], [cx + 0.1, sh + 0.28, cz], [cx + 0.14, sh + 0.16, cz]]), 0.007, { color: GOLDF, bone: root, sides: 5 });
    for (const [dx, dy, r] of [[0.02, 0.22, 0.018], [-0.04, 0.26, 0.012], [0.05, 0.3, 0.009]] as const)
      glow(ball(r, "#b8ff9c", [cx + dx, sh + dy, cz + 0.02]), 1.3);
    ball(0.02, "#ff8fc0", [cx + 0.2, sh + 0.02, 0.15], 1);
  }

  // ---- stool ----
  {
    const x = -0.28;
    const z = 0.62;
    cyl(0.17, 0.17, 0.04, 10, WOODX, [x, 0.44, z]);
    cyl(0.17, 0.17, 0.012, 10, GOLDF, [x, 0.42, z]);
    cyl(0.15, 0.15, 0.04, 10, ROSE, [x, 0.485, z]);
    ball(0.02, GOLD, [x, 0.51, z]);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094 + 0.5;
      rod([x + Math.cos(a) * 0.1, 0.42, z + Math.sin(a) * 0.1], [x + Math.cos(a) * 0.15, 0, z + Math.sin(a) * 0.15], 0.016, DARKW, 6);
    }
  }

  // ---- herb basket on the floor ----
  {
    const x = 1.0;
    const z = 0.25;
    lat(solid([[0.11, 0.0], [0.14, 0.02], [0.16, 0.12], [0.17, 0.2]]), cel(stripes("#cf9f5c", "#a87438", { size: 0.016, axis: "y", width: 0.5, wobble: 0.2 })), [x, 0.012, z], 12);
    const ring = Array.from({ length: 10 }, (_, i) => [x + Math.cos((i / 10) * 6.283) * 0.172, 0.212, z + Math.sin((i / 10) * 6.283) * 0.172]);
    b.sweep(catmull(ring, { closed: true }), 0.012, { color: BRASS, bone: root, sides: 5 });
    b.sweep(catmull([[x + 0.17, 0.21, z], [x + 0.12, 0.36, z], [x, 0.44, z], [x - 0.12, 0.36, z], [x - 0.17, 0.21, z]]), 0.01, { color: LEATH, bone: root, sides: 5 });
    const fr = (n: number, r: number, off: number) =>
      Array.from({ length: n }, (_, i) => frame([x + Math.cos(i * 2.4 + off) * r * (0.4 + ((i * 37) % 10) / 17), 0.2, z + Math.sin(i * 2.4 + off) * r * (0.4 + ((i * 37) % 10) / 17)], [0, 1, 0]));
    const flow = (_f: unknown, i: number) => [Math.cos(i * 2.4 + 1), 0, Math.sin(i * 2.4 + 1)];
    b.cards(fr(12, 0.1, 0), LAV, { size: [0.06, 0.3], lean: 16, bend: 15, flow, vary: 0.3, rng: rand });
    b.cards(fr(9, 0.1, 1), LEAF, { size: [0.08, 0.2], lean: 30, bend: 20, flow, vary: 0.3, rng: rand });
    b.cards(fr(7, 0.09, 2), BERRY, { size: [0.07, 0.22], lean: 22, bend: 15, flow, vary: 0.3, rng: rand });
    decalZ(FILS, 0.16, 0.016, [x, 0.1, z + 0.158 + 0.006]);
  }

  // ---- floating sparkles over the table ----
  spark([-0.05, 1.05, 0.05], 0.014, "#fff3b0");
  spark([0.3, 1.12, 0.18], 0.011, "#7fe8d8");
  spark([-0.6, 1.08, -0.02], 0.012, "#ffc1d6");

  return b.root;
}
