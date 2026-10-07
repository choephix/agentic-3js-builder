import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, grain, mottle, noise, paint, stripes } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, furEdge } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cherry Bridge Tea House",
  description:
    "A mountain tea house on a mossy cliff terrace: two-tier tiled roofs with gold ridge ornaments and lit shoji, a vermilion arched bridge and torii over a stream that falls from a snow-peaked cliff, a shrine cherry tree in full bloom with drifting glowing petals, stone lanterns, tea terraces, a picnic mat and a sleeping cat.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V = [number, number, number];
type P2 = [number, number];
type Mat = Paint | string;

const DEG = Math.PI / 180;
const hash3 = (x: number, y: number, z: number, s: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 19.19) * 43758.5453;
  return v - Math.floor(v);
};

export default function build() {
  const b = createBuilder({ name: "teaHouseDiorama", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------------------------------------------
  // Palette (all cel-shaded paints; shadow tones are hue-shifted by the toon kit)
  const GRASS_RAW = mottle("#7fd857", "#abec6c", { size: 0.17, seed: 5 });
  const TERRAIN = (top: number) =>
    cel(
      furEdge(
        GRASS_RAW,
        paint((p) => (p.y > top - 0.075 ? "#a97c55" : ROCK_RAW)),
        {
          by: "position",
          axis: [0, 1, 0],
          level: top - 0.034,
          teeth: 0.022,
          period: 0.05,
          along: [1, 0, 1],
          ink: "#4f9a3f",
          inkWidth: 0.004,
        },
      ),
    );
  const ROCK_TONES = ["#a99dc0", "#9488b0", "#b9aed0", "#8d82a8"];
  const ROCK_RAW = paint((p, n) => {
    if (p.y > 1.5 + (noise(p, 0.3, 9) - 0.5) * 0.22) return "#f6f8ff";
    const layer = Math.floor((p.y + (noise(p, 0.4, 2) - 0.5) * 0.06) / 0.05);
    const c = cells(p, 0.32, 4);
    let col = ROCK_TONES[(((layer * 7) % 4) + 4) % 4];
    if (c.d2 - c.d1 < 0.05) col = "#6f6590";
    if (n.y > 0.7 && p.y < 1.2 && noise(p, 0.2, 6) > 0.58) col = "#86c46a";
    return col;
  });
  const ROCK = cel(ROCK_RAW);
  const ROCK_DARK = cel("#9d92bb", "#6f6590");
  const STONE = cel(
    paint((p, n) => {
      const row = Math.floor(p.y / 0.026);
      const seam = Math.abs(n.y) < 0.5 && (((Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x) / 0.07 + row * 0.5) % 1 + 1) % 1 < 0.06;
      if (seam || (((p.y / 0.026) % 1) + 1) % 1 < 0.05) return "#a79bb5";
      return "#d9d0e3";
    }),
  );
  const STONE_PLAIN = cel("#d9d0e3", "#a79bb5");
  const WOOD_RED = cel(grain("#e24a35", "#c93a2c", { size: 0.012, axis: "y" }));
  const WOOD_RED_FLAT = cel("#e24a35");
  const WOOD_DARK = cel(grain("#8a4030", "#6f3027", { size: 0.012, axis: "y" }));
  const WOOD_LIGHT = cel(grain("#e9b878", "#d29e5c", { size: 0.01, axis: "x" }));
  const WOOD_BROWN = cel("#a4673e");
  const GOLD = cel("#ffd35a", "#e0952f");
  const PLASTER = cel(mottle("#ffeccb", "#ffe0b8", { size: 0.07, seed: 3 }), "#d9b0b8");
  const STRAW = cel(stripes("#d9d98a", "#bfc274", { size: 0.04, axis: "x", width: 0.5 }));
  const SOFFIT = cel("#6f3a38");
  const TILE = cel(
    paint((p, n) => {
      const col = Math.abs(n.z) > Math.abs(n.x) ? p.x : p.z;
      const a = ((col / 0.028) % 1 + 1) % 1;
      const row = (((p.y + 0.2 * (a > 0.5 ? 0.0 : 0)) / 0.02) % 1 + 1) % 1;
      if (a < 0.1 || row < 0.1) return "#2a4f8c";
      return a < 0.52 ? "#4f8fd8" : "#3f7ac4";
    }),
  );
  const WATER = cel(
    paint((p, n) => {
      if (n.y > 0.5) {
        const bank = Math.min(p.x - xL(p.z), xR(p.z) - p.x);
        const ripple = Math.sin(p.x * 46 + 4.5 * Math.sin(p.z * 6.5) + p.z * 9) > 0.86;
        const foam = bank < 0.045 + 0.02 * Math.sin(p.z * 31);
        if (foam) return "#f4fdff";
        if (ripple) return "#c8f6ff";
        return noise(p, 0.12, 4) > 0.55 ? "#4fc3e6" : "#38aee0";
      }
      const streak = Math.sin(p.x * 95 + 3 * noise(p, 0.08, 2)) > 0.55;
      return streak ? "#eafcff" : "#6fd2f2";
    }),
  );
  const WATERFALL = cel(
    paint((p, n) => {
      if (n.y > 0.5) return "#5ccbea";
      const streak = Math.sin(p.x * 120 + 5 * noise(p, 0.1, 7)) > 0.35 || Math.sin(p.x * 61 + p.y * 3) > 0.9;
      if (p.y < 0.36) return "#ffffff";
      return streak ? "#f3feff" : "#7bd8f4";
    }),
  );
  const FOAM = cel("#ffffff", "#c6d8f0");
  const PINE_A = cel("#2e9c78");
  const PINE_B = cel("#3fb87c");
  const CHERRY_A = cel(mottle("#ffc2dc", "#ffa6cb", { size: 0.1, seed: 12 }));
  const CHERRY_B = cel(mottle("#ffdcea", "#ffc0d9", { size: 0.1, seed: 13 }));
  const CHERRY_C = cel(mottle("#ff9ec8", "#ff86b8", { size: 0.1, seed: 14 }));
  const BARK = cel(grain("#7a5160", "#563a49", { size: 0.012, axis: "y" }));
  const CLOUD = cel("#ffffff", "#c9d2f4");
  const RED_CLOTH = cel("#e2433a");
  const BAMBOO = cel("#7bc76a");
  const BAMBOO_NODE = cel("#a8e08a", "#6aa87c");
  const TEA = cel(mottle("#3fae5c", "#5cc86c", { size: 0.09, seed: 21 }));
  const TEA_NEW = cel(mottle("#8be07a", "#aaf08a", { size: 0.06, seed: 22 }));
  const CREAM = cel("#fff2da", "#e3c8cc");
  const INDIGO = cel("#34479a");
  const BLACK = cel("#3a2a3f", "#241a30");

  // ---------------------------------------------------------------------------------------------------------------
  // Geometry bins: small static pieces are placed in model space and merged per paint into one part each.
  const bins = new Map<Mat, THREE.BufferGeometry[]>();
  const lights = new Map<string, THREE.BufferGeometry[]>();
  type PutOpts = { rx?: number; ry?: number; rz?: number; q?: THREE.Quaternion; s?: number | V };
  const xform = (g: THREE.BufferGeometry, p: V, o: PutOpts) => {
    const q = o.q ?? new THREE.Quaternion().setFromEuler(new THREE.Euler((o.rx ?? 0) * DEG, (o.ry ?? 0) * DEG, (o.rz ?? 0) * DEG, "YXZ"));
    const sc = typeof o.s === "number" ? [o.s, o.s, o.s] : (o.s ?? [1, 1, 1]);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), q, new THREE.Vector3(sc[0], sc[1], sc[2])));
    return g;
  };
  const put = (mat: Mat, g: THREE.BufferGeometry, p: V, o: PutOpts = {}) => {
    xform(g, p, o);
    const list = bins.get(mat);
    if (list) list.push(g);
    else bins.set(mat, [g]);
  };
  const lamp = (color: string, g: THREE.BufferGeometry, p: V, o: PutOpts = {}) => {
    xform(g, p, o);
    const list = lights.get(color);
    if (list) list.push(g);
    else lights.set(color, [g]);
  };
  const flatten = (list: THREE.BufferGeometry[]) => {
    const flat = list.map((g) => {
      const n = g.index ? g.toNonIndexed() : g;
      for (const name of Object.keys(n.attributes)) if (name !== "position" && name !== "normal" && name !== "uv") n.deleteAttribute(name);
      return n;
    });
    return mergeGeometries(flat);
  };
  let binCount = 0;
  const flush = () => {
    for (const [mat, list] of bins) {
      const g = flatten(list);
      if (g) b.part(g, mat, { bone: base, at: [0, 0, 0], flat: true, name: `mass${++binCount}` });
    }
    for (const [color, list] of lights) {
      const g = flatten(list);
      if (g) glow(b.part(g, color, { bone: base, at: [0, 0, 0], flat: true, name: `lit${++binCount}` }), 1);
    }
  };
  const box = (m: Mat, p: V, s: V, o: PutOpts = {}) => put(m, new THREE.BoxGeometry(s[0], s[1], s[2]), p, o);
  const cyl = (m: Mat, p: V, rt: number, rb: number, h: number, seg: number, o: PutOpts = {}) =>
    put(m, new THREE.CylinderGeometry(rt, rb, h, seg), p, o);
  const cone = (m: Mat, p: V, r: number, h: number, seg: number, o: PutOpts = {}) =>
    put(m, new THREE.ConeGeometry(r, h, seg), p, o);
  const ball = (m: Mat, p: V, r: number, o: PutOpts = {}, ws = 6, hs = 4) =>
    put(m, new THREE.SphereGeometry(r, ws, hs), p, o);
  const rodBetween = (a: V, c: V, r: number, seg = 6) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    return {
      geo: new THREE.CylinderGeometry(r, r, len, seg),
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2] as V,
      o: { q: aim(d.toArray() as V) } as PutOpts,
    };
  };
  const rod = (m: Mat, a: V, c: V, r: number, seg = 6) => {
    const k = rodBetween(a, c, r, seg);
    put(m, k.geo, k.at, k.o);
  };
  const lampRod = (color: string, a: V, c: V, r: number, seg = 6) => {
    const k = rodBetween(a, c, r, seg);
    lamp(color, k.geo, k.at, k.o);
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Layout constants
  const HX = -0.95; // tea house centre
  const HZ = -0.25;
  const FLOOR = 0.62; // house floor level
  const PLATEAU = 0.5; // left plateau top
  const PLATEAU_R = 0.4; // right plateau top
  const WATER_Y = 0.22;
  const BZ = 0.6; // bridge z

  // ---------------------------------------------------------------------------------------------------------------
  // Textures
  const shoji = (extra = "") =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 48"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc766"/><stop offset="1" stop-color="#fff0bd"/></linearGradient></defs><rect width="60" height="48" fill="url(#g)"/>${extra}<g stroke="#8a4a2b" stroke-width="1.7" fill="none"><path d="M15 0V48M30 0V48M45 0V48M0 12H60M0 24H60M0 36H60"/><rect x="0.9" y="0.9" width="58.2" height="46.2" stroke-width="2.2"/></g></svg>`,
      { size: 256 },
    );
  const SHOJI_A = shoji();
  const SHOJI_B = shoji(
    `<path d="M2 44C14 36 22 32 32 25S50 14 58 6" stroke="#b5532a" stroke-width="2.2" fill="none"/><g fill="#ff9f7a"><circle cx="22" cy="32" r="2.6"/><circle cx="34" cy="24" r="2.8"/><circle cx="46" cy="17" r="2.6"/><circle cx="54" cy="9" r="2.2"/></g>`,
  );
  const SHOJI_C = shoji(
    `<path d="M0 36Q12 24 22 30T44 22T60 18V48H0Z" fill="#ffb25a" opacity="0.7"/><circle cx="46" cy="12" r="6" fill="#ff7a4a" opacity="0.85"/>`,
  );
  const MOON = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff6cf"/><stop offset="1" stop-color="#ffc766"/></radialGradient></defs><circle cx="24" cy="24" r="23" fill="url(#g)"/><g stroke="#8a4a2b" stroke-width="1.7" fill="none"><path d="M24 1V47M1 24H47M7.7 7.7L40.3 40.3M40.3 7.7L7.7 40.3"/><circle cx="24" cy="24" r="11"/></g><circle cx="24" cy="24" r="22.4" stroke="#e0a63a" stroke-width="2.6" fill="none"/></svg>`,
    { size: 192 },
  );
  const cupEmblem = (fill: string) =>
    `<g fill="${fill}" stroke="${fill}"><path d="M-8 0H8C8 9 3 13 0 13C-3 13 -8 9 -8 0Z" stroke="none"/><path d="M-6 15H6" stroke-width="1.8" fill="none"/><path d="M-3 -3Q-6 -7 -3 -10T-3 -17M3 -3Q0 -7 3 -10T3 -17" stroke-width="1.7" fill="none"/></g>`;
  const NOREN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><g transform="translate(0 40) scale(1 -1)"><g fill="#34479a"><rect x="0" y="0" width="60" height="6"/><rect x="1" y="6" width="18" height="34"/><rect x="21" y="6" width="18" height="34"/><rect x="41" y="6" width="18" height="34"/></g><g fill="#fff6e4"><rect x="1" y="34" width="18" height="2.4"/><rect x="21" y="34" width="18" height="2.4"/><rect x="41" y="34" width="18" height="2.4"/></g><g transform="translate(30 24) scale(0.8)">${cupEmblem("#fff6e4")}</g><g fill="#ffb7d3"><circle cx="10" cy="20" r="3"/><circle cx="7" cy="16" r="1.6"/><circle cx="14" cy="24" r="1.8"/><circle cx="50" cy="20" r="3"/><circle cx="53" cy="16" r="1.6"/><circle cx="46" cy="24" r="1.8"/></g><rect x="0" y="0" width="60" height="1.6" fill="#ffd35a"/></g></svg>`,
    { size: 256 },
  );
  const BANNER = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 100"><g transform="translate(0 100) scale(1 -1)"><rect width="30" height="100" fill="#e2433a"/><rect x="0" y="0" width="30" height="6" fill="#ffd35a"/><rect x="0" y="94" width="30" height="6" fill="#ffd35a"/><rect x="2" y="8" width="2" height="84" fill="#fff6e4"/><rect x="26" y="8" width="2" height="84" fill="#fff6e4"/><g transform="translate(15 44) scale(1.1)">${cupEmblem("#fff6e4")}</g><path d="M6 72Q10 68 15 72T24 72M6 78Q10 74 15 78T24 78" stroke="#fff6e4" stroke-width="1.6" fill="none"/><g fill="#ffb7d3"><circle cx="15" cy="16" r="3"/><circle cx="15" cy="88" r="3"/></g></g></svg>`,
    { size: 256 },
  );
  const SIGN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 36"><rect x="1" y="1" width="78" height="34" rx="3" fill="#7a2f2a" stroke="#ffd35a" stroke-width="2.4"/><rect x="5" y="5" width="70" height="26" rx="2" fill="none" stroke="#ffd35a" stroke-width="1.2"/><g transform="translate(40 17) scale(0.95)">${cupEmblem("#ffd35a")}</g><g fill="#ffb7d3"><circle cx="14" cy="18" r="3.4"/><circle cx="10" cy="14" r="2"/><circle cx="66" cy="18" r="3.4"/><circle cx="70" cy="14" r="2"/></g></svg>`,
    { size: 256 },
  );
  const MURAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48"><rect x="0" y="0" width="24" height="48" fill="#fff0cc"/><rect x="0" y="0" width="24" height="3" fill="#8a4030"/><rect x="0" y="45" width="24" height="3" fill="#8a4030"/><circle cx="16" cy="12" r="4" fill="#e2433a"/><path d="M2 36L10 18L15 28L19 22L23 36Z" fill="#6f8fd0"/><path d="M8 21L10 18L12 22Z" fill="#fff"/><path d="M0 40Q6 36 12 40T24 40V45H0Z" fill="#8fcfe8"/></svg>`,
    { size: 192 },
  );
  const KARAKUSA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 12"><rect width="120" height="12" fill="#9c2f2c"/><g stroke="#ffd35a" stroke-width="1.3" fill="none">${[0, 1, 2, 3, 4, 5]
      .map((i) => `<path d="M${i * 20 + 1} 9C${i * 20 + 5} 1 ${i * 20 + 12} 1 ${i * 20 + 12} 6C${i * 20 + 12} 9 ${i * 20 + 8} 9 ${i * 20 + 8} 6S${i * 20 + 14} 11 ${i * 20 + 19} 4"/>`)
      .join("")}</g><g fill="#ffd35a">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${i * 20 + 10}" cy="6" r="1.3"/>`).join("")}</g></svg>`,
    { size: 640 },
  );
  const blossom = (petal: string, edge: string, heart: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="${petal}" stroke="${edge}" stroke-width="1.1">${[0, 1, 2, 3, 4]
        .map((k) => `<ellipse cx="20" cy="9.5" rx="7" ry="9.5" transform="rotate(${k * 72} 20 20)"/>`)
        .join("")}</g><circle cx="20" cy="20" r="3.6" fill="${heart}"/><g stroke="#ff4f8e" stroke-width="0.9">${[0, 1, 2, 3, 4]
        .map((k) => `<path d="M20 20L20 14.5" transform="rotate(${k * 72 + 36} 20 20)"/>`)
        .join("")}</g></svg>`,
      { size: 96 },
    );
  const BLOSSOM = [
    blossom("#ffc6de", "#f68cb6", "#ff7aa8"),
    blossom("#fff0f6", "#ffb3cf", "#ff9ec0"),
    blossom("#ffa6cb", "#f0699f", "#ff5f98"),
  ];
  const PETAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb0d0"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs><path d="M12 31C2 24 0 12 6 2L12 8L18 2C24 12 22 24 12 31Z" fill="url(#g)" stroke="#ff9cc4" stroke-width="1.2"/></svg>`,
    { size: 96 },
  );
  const GRASS_TUFT = [
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><g fill="#63c444"><path d="M20 48C19 30 14 14 6 2C18 12 24 28 24 48Z"/><path d="M14 48C15 34 12 24 2 14C12 22 19 32 20 48Z"/><path d="M22 48C24 30 30 14 38 4C34 20 32 34 30 48Z"/></g><g fill="#94e45e"><path d="M18 48C20 34 22 22 26 10C28 24 27 38 26 48Z"/></g></svg>`,
      { size: 96 },
    ),
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><g fill="#4fb85a"><path d="M16 48C14 34 10 20 4 8C14 18 20 32 22 48Z"/><path d="M24 48C26 30 32 18 36 10C34 24 32 38 30 48Z"/></g><g fill="#86dc62"><path d="M18 48C19 32 21 18 20 4C25 20 26 36 24 48Z"/></g></svg>`,
      { size: 96 },
    ),
  ];
  const flower = (head: string, centre: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40"><path d="M12 40V16" stroke="#4aa84a" stroke-width="2.2" fill="none"/><path d="M12 32Q5 30 3 24Q10 25 12 32M12 28Q19 26 21 20Q14 21 12 28" fill="#5cc25a"/><g fill="${head}">${[0, 1, 2, 3, 4, 5]
        .map((k) => `<ellipse cx="12" cy="6.4" rx="2.8" ry="5" transform="rotate(${k * 60} 12 12)"/>`)
        .join("")}</g><circle cx="12" cy="12" r="2.8" fill="${centre}"/></svg>`,
      { size: 96 },
    );
  const FLOWERS = [flower("#ffffff", "#ffd43a"), flower("#ffe05a", "#ff9a2a"), flower("#c7a6ff", "#ffffff"), flower("#ffa0c4", "#fff0a0")];
  const BAMBOO_LEAF = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64"><path d="M8 63C1 40 2 16 8 1C14 16 15 40 8 63Z" fill="#72c955"/><path d="M8 62V4" stroke="#4aa23c" stroke-width="1.8" fill="none"/></svg>`,
    { size: 128 },
  );
  const SHIDE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 56"><path d="M10 0L18 8L6 16L18 24L6 32L18 40L10 56L2 40L14 32L2 24L14 16L2 8Z" fill="#ffffff" stroke="#bdb8e6" stroke-width="1.4"/></svg>`,
    { size: 128 },
  );
  const CHIME_STRIP = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 40"><g transform="translate(0 40) scale(1 -1)"><path d="M1 0H11V36L6 40L1 36Z" fill="#fff2a8" stroke="#ff9a2a" stroke-width="1.4"/><path d="M6 6V30" stroke="#e2433a" stroke-width="1.6"/></g></svg>`,
    { size: 96 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Terrain
  function xL(z: number) {
    return -0.3 + 0.05 * Math.sin(2.6 * z + 0.4);
  }
  function xR(z: number) {
    return 0.3 + 0.05 * Math.sin(2.6 * z + 1.2);
  }
  const bankZ = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1.0, 1.15];
  const LEFT: P2[] = [
    [xL(1.15), 1.15],
    [-0.7, 1.17],
    [-1.15, 1.15],
    [-1.4, 1.02],
    [-1.52, 0.65],
    [-1.48, 0.25],
    [-1.53, -0.15],
    [-1.5, -0.6],
    [-1.52, -1.0],
    [-1.36, -1.44],
    [-1.0, -1.5],
    [-0.55, -1.5],
    [-0.4, -1.05],
    ...bankZ.slice(0, 8).map((z): P2 => [xL(z), z]),
  ];
  const RIGHT: P2[] = [
    [xR(1.15), 1.15],
    [0.75, 1.17],
    [1.2, 1.15],
    [1.42, 1.02],
    [1.52, 0.6],
    [1.47, 0.1],
    [1.52, -0.4],
    [1.48, -0.9],
    [1.35, -1.42],
    [1.0, -1.5],
    [0.55, -1.5],
    [0.4, -1.0],
    ...bankZ.slice(0, 8).map((z): P2 => [xR(z), z]),
  ];
  const slabXZ = (pts: P2[], y0: number, y1: number, color: Mat, extra: { bevel?: number; smoothing?: number } = {}) =>
    b.extrude(
      pts.map(([x, z]): OutlinePoint => [x, -z]),
      { at: [0, (y0 + y1) / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: y1 - y0, color, bone: base, ...extra },
    );
  const rockL = 0.43;
  const rockR = 0.34;
  const capH = 0.075;
  const topL = rockL + capH;
  const topR = PLATEAU_R;
  const capL = slabXZ(LEFT, 0, topL, TERRAIN(topL), { smoothing: 1, bevel: 0.012 });
  const capR = slabXZ(RIGHT, 0, topR, TERRAIN(topR), { smoothing: 1, bevel: 0.012 });
  slabXZ(
    [
      [-0.62, -1.5],
      [0.62, -1.5],
      [0.62, -0.8],
      [-0.62, -0.8],
    ],
    0,
    0.34,
    ROCK,
  );

  // Water: a slab whose front face is the front waterfall
  slabXZ(
    [
      [-0.45, -0.82],
      [0.45, -0.82],
      [0.45, 1.19],
      [-0.45, 1.19],
    ],
    0,
    WATER_Y,
    WATER,
    { bevel: 0.016 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Mountains: faceted tapered columns with strata, snow, pines
  const lumps: [number, number, number, number, number, number, number][] = [
    // cx, cz, y0, rb, rt, h, sides
    [-1.1, -1.08, 0.3, 0.4, 0.015, 1.8, 7],
    [-0.66, -1.15, 0.3, 0.32, 0.015, 1.4, 6],
    [-1.3, -0.85, 0.3, 0.26, 0.015, 0.8, 6],
    [0.5, -1.12, 0.3, 0.34, 0.015, 1.35, 7],
    [1.05, -1.08, 0.3, 0.4, 0.015, 0.9, 7],
    [0.88, -0.74, 0.3, 0.27, 0.02, 0.45, 6],
    [1.38, -0.7, 0.3, 0.2, 0.02, 0.35, 6],
    [-0.08, -1.2, 0.3, 0.26, 0.015, 1.5, 6],
    [-0.88, -1.2, 0.3, 0.26, 0.015, 1.15, 6],
    [-1.3, -1.2, 0.3, 0.26, 0.015, 1.0, 6],
    [0.2, -1.2, 0.3, 0.26, 0.015, 1.2, 6],
    [-0.35, -1.2, 0.3, 0.24, 0.015, 0.95, 6],
    [0.8, -1.2, 0.3, 0.26, 0.015, 1.0, 6],
    [1.32, -1.15, 0.3, 0.24, 0.015, 0.7, 6],
    [-0.62, -1.04, 0.3, 0.46, 0.03, 1.0, 7],
    [0.75, -1.0, 0.3, 0.5, 0.03, 0.9, 7],
    [-0.9, -0.95, 0.3, 0.3, 0.03, 0.7, 7],
    [-0.36, -0.94, 0.3, 0.2, 0.04, 0.72, 6],
    [0.31, -0.93, 0.3, 0.2, 0.04, 0.55, 6],
  ];
  const lumpGeo = (l: number[], seed: number, jit: number) => {
    const [cx, cz, y0, rb, rt, h, sides] = l;
    const g = new THREE.CylinderGeometry(rt, rb, h, sides, 5, false);
    g.rotateY(hash3(seed, 1, 2, 3) * Math.PI);
    g.translate(cx, y0 + h / 2, cz);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const k = jit * (0.4 + (1 - Math.min(1, (y - y0) / h)) * 0.9);
      pos.setXYZ(
        i,
        x + (hash3(x, y, z, seed) - 0.5) * k,
        y + (y > y0 + 0.01 ? (hash3(x, y, z, seed + 5) - 0.5) * k * 0.6 : 0),
        z + (hash3(x, y, z, seed + 9) - 0.5) * k,
      );
    }
    g.computeVertexNormals();
    return g;
  };
  lumps.forEach((l, i) => put(ROCK, lumpGeo(l, 3 + i, 0.12), [0, 0, 0]));
  // the waterfall cliff wall and flanking shoulders
  const wall = new THREE.BoxGeometry(0.7, 1.05, 0.5, 2, 4, 2);
  wall.translate(-0.03, 0.825, -1.05);
  {
    const pos = wall.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const front = z > -0.9;
      const k = front ? 0.012 : 0.05;
      pos.setXYZ(i, x + (hash3(x, y, z, 31) - 0.5) * k, y + (hash3(x, y, z, 32) - 0.5) * k * 0.4, z + (hash3(x, y, z, 33) - 0.5) * k * 0.6);
    }
    wall.computeVertexNormals();
  }
  put(ROCK, wall, [0, 0, 0]);
  // boulders along the water and the base
  const boulders: [number, number, number, number][] = [
    [-0.36, 0.95, rockL, 0.07],
    [-0.4, 0.2, rockL, 0.06],
    [-0.38, -0.5, rockL, 0.08],
    [0.4, -0.45, rockR, 0.07],
    [0.36, 0.25, rockR, 0.06],
    [0.4, 0.95, rockR, 0.08],
    [-1.35, 0.98, rockL + 0.03, 0.09],
    [1.35, 0.95, rockR + 0.03, 0.09],
    [-0.5, 0.2, rockL + 0.07, 0.04],
    [0.55, -0.55, rockR + 0.07, 0.05],
  ];
  boulders.forEach(([x, z, y, r], i) => {
    const g = new THREE.IcosahedronGeometry(r, 0);
    const pos = g.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const px = pos.getX(j);
      const py = pos.getY(j);
      const pz = pos.getZ(j);
      const k = 1 + (hash3(px, py, pz, i) - 0.5) * 0.35;
      pos.setXYZ(j, px * k * 1.2, py * k * 0.75, pz * k);
    }
    g.computeVertexNormals();
    put(ROCK_DARK, g, [x, y + r * 0.35, z], { ry: i * 40 });
  });

  // Waterfall: upper river ledge, falling sheet, foam
  box(WATERFALL, [0.0, 1.38, -1.0], [0.17, 0.05, 0.42]);
  box(WATERFALL, [0.0, 0.78, -0.78], [0.17, 1.16, 0.05]);
  for (let i = 0; i < 5; i++) ball(FOAM, [-0.07 + i * 0.035, 1.4, -0.77], 0.028 + 0.004 * (i % 2), {}, 6, 4);
  for (let i = 0; i < 8; i++) {
    const a = i * 0.9;
    ball(FOAM, [Math.sin(a) * 0.12, 0.25 + (i % 3) * 0.02, -0.74 + Math.cos(a) * 0.04], 0.04 + 0.012 * (i % 3), { s: [1, 0.8, 1] });
  }
  box(FOAM, [0, 0.62, -0.75], [0.04, 0.2, 0.016]);
  // front fall
  for (let i = 0; i < 9; i++) {
    const a = i * 0.74;
    ball(FOAM, [Math.sin(a * 2) * 0.17, 0.035 + (i % 3) * 0.02, 1.2 + (i % 2) * 0.015], 0.04 + 0.01 * (i % 3), { s: [1, 0.8, 1] });
  }

  // Pines hugging the slopes
  const pine = (x: number, y: number, z: number, h: number, tone: Paint) => {
    cyl(BARK, [x, y + h * 0.1, z], h * 0.04, h * 0.05, h * 0.25, 5);
    for (let k = 0; k < 4; k++) {
      const r = h * (0.34 - k * 0.07);
      cone(tone, [x, y + h * (0.28 + k * 0.2), z], r, h * 0.34, 7, { ry: k * 25 });
    }
  };
  const slopePoint = (li: number, y: number, deg: number): V => {
    const [cx, cz, y0, rb, rt, h] = lumps[li];
    const r = rb + (rt - rb) * ((y - y0) / h) - 0.03;
    return [cx + r * Math.sin(deg * DEG), y, cz + r * Math.cos(deg * DEG)];
  };
  const pinePlan: [number, number, number, number][] = [
    [0, 0.5, -40, 0.2],
    [0, 0.72, 15, 0.17],
    [0, 0.95, 55, 0.14],
    [0, 0.6, 70, 0.16],
    [1, 0.5, -20, 0.18],
    [1, 0.85, 35, 0.15],
    [2, 0.45, 10, 0.17],
    [2, 0.62, -50, 0.13],
    [3, 0.5, 30, 0.2],
    [3, 0.8, -35, 0.15],
    [3, 1.05, 10, 0.12],
    [4, 0.5, 20, 0.2],
    [4, 0.7, -50, 0.16],
    [5, 0.45, 0, 0.14],
    [4, 0.52, 70, 0.17],
    [6, 0.42, -10, 0.14],
    [1, 1.1, -10, 0.12],
    [0, 1.2, -20, 0.11],
    [1, 0.62, -60, 0.14],
    [3, 0.62, 60, 0.15],
    [4, 0.85, -10, 0.12],
    [0, 0.45, -70, 0.17],
    [7, 0.55, 20, 0.14],
    [14, 0.5, 10, 0.16],
    [14, 0.7, -40, 0.13],
    [15, 0.5, -20, 0.17],
    [15, 0.65, 40, 0.14],
    [16, 0.45, 0, 0.13],
    [16, 0.55, 30, 0.11],
    [12, 0.5, 10, 0.13],
    [13, 0.45, 0, 0.12],
  ];
  pinePlan.forEach(([li, y, deg, h], i) => {
    const [x, yy, z] = slopePoint(li, y, deg);
    pine(x, yy, z, h, i % 2 ? PINE_A : PINE_B);
  });
  // pines on the plateaus and by the water
  [
    [-1.4, 0.0, 0.22, 0.45],
  ].forEach(([x, z, h], i) => pine(x, PLATEAU - 0.01, z, h, i % 2 ? PINE_A : PINE_B));

  // Clouds
  const cloud = (cx: number, cy: number, cz: number, s: number) => {
    const parts: [number, number, number, number][] = [
      [0, 0, 0, 0.1],
      [0.1, 0.02, 0.02, 0.08],
      [-0.1, 0.01, -0.01, 0.08],
      [0.2, -0.005, 0, 0.06],
      [-0.19, -0.01, 0.01, 0.06],
    ];
    parts.forEach(([x, y, z, r]) => ball(CLOUD, [cx + x * s, cy + y * s, cz + z * s], r * s, { s: [1, 0.6, 0.9] }, 8, 5));
  };
  cloud(-1.35, 1.05, -0.45, 1.2);
  cloud(0.95, 0.9, -1.1, 1.0);
  cloud(-0.55, 1.6, -1.35, 0.9);
  cloud(1.3, 1.1, -0.55, 0.8);

  // sky lanterns drifting up past the peaks
  const skyLantern = (x: number, y: number, z: number, s: number, turn: number) => {
    lamp("#ffc878", new THREE.CylinderGeometry(0.034 * s, 0.026 * s, 0.075 * s, 4), [x, y, z], { ry: 45 + turn });
    put(RED_CLOTH, new THREE.CylinderGeometry(0.037 * s, 0.037 * s, 0.008 * s, 4), [x, y + 0.04 * s, z], { ry: 45 + turn });
    put(GOLD, new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 0.006 * s, 4), [x, y - 0.04 * s, z], { ry: 45 + turn });
    lamp("#fff2b0", new THREE.SphereGeometry(0.008 * s, 5, 4), [x, y - 0.05 * s, z]);
  };
  [
    [-0.28, 1.12, -0.46, 1.0, 10],
    [0.2, 1.58, -0.3, 1.2, 30],
    [-0.75, 1.78, -0.32, 1.1, 5],
    [0.62, 1.88, -0.5, 1.0, 20],
    [-0.05, 1.98, -0.1, 0.9, 40],
    [1.1, 2.0, -0.2, 0.8, 15],
  ].forEach(([x, y, z, s, t]) => skyLantern(x, y, z, s, t));

  // ---------------------------------------------------------------------------------------------------------------
  // Tea house
  const hx = (l: number) => HX + l;
  const hz = (l: number) => HZ + l;
  // podium and steps
  box(STONE, [HX, 0.55, HZ], [0.96, 0.1, 0.7]);
  box(STONE_PLAIN, [HX, 0.605, HZ], [0.99, 0.022, 0.73]);
  box(WOOD_LIGHT, [HX, 0.62, HZ], [0.92, 0.012, 0.66]);
  for (let i = 0; i < 3; i++) box(STONE, [HX, 0.585 - i * 0.03, HZ + 0.36 + i * 0.05], [0.26 - i * 0.02, 0.03, 0.05]);
  for (const s of [1, -1]) box(STONE, [HX + s * 0.17, 0.55, HZ + 0.4], [0.03, 0.1, 0.13], { ry: 0 });

  // walls
  const WALL_B = FLOOR - 0.0;
  const wallY = WALL_B + 0.125; // centre of a 0.25 tall wall
  const zf = hz(0.15);
  const zb = hz(-0.29);
  const zc = (zf + zb) / 2;
  box(PLASTER, [HX, wallY, zb + 0.01], [0.58, 0.25, 0.02]);
  box(PLASTER, [hx(0.29), wallY, zc], [0.02, 0.25, 0.44]);
  box(PLASTER, [hx(-0.29), wallY, zc], [0.02, 0.25, 0.44]);
  box(WOOD_DARK, [HX, WALL_B + 0.25, zc], [0.6, 0.02, 0.46]);
  box(STRAW, [HX, FLOOR + 0.016, zc], [0.54, 0.02, 0.4]);
  box(PLASTER, [hx(-0.095 - 0.0) - 0.0, wallY, zf - 0.01], [0.2, 0.25, 0.02]);
  box(PLASTER, [hx(0.095 + 0.0), wallY, zf - 0.01], [0.2, 0.25, 0.02]);
  // front wall pieces: left bay [-0.29,-0.095], right bay [0.095,0.29], lintel above the doorway
  // (the two boxes above are centred on the bays; recentre them properly)
  box(PLASTER, [hx(0.0), WALL_B + 0.21, zf - 0.01], [0.19, 0.08, 0.02]);
  // kneewall boards under the windows
  for (const s of [1, -1]) {
    box(WOOD_LIGHT, [hx(s * 0.195), FLOOR + 0.04, zf + 0.004], [0.17, 0.07, 0.012]);
    for (let k = 1; k < 5; k++) box(WOOD_DARK, [hx(s * 0.195 - 0.085 + k * 0.034), FLOOR + 0.04, zf + 0.011], [0.004, 0.07, 0.004]);
  }
  // posts
  const POST_H = 0.25;
  for (const lx of [-0.29, -0.095, 0.095, 0.29]) {
    box(WOOD_DARK, [hx(lx), WALL_B + POST_H / 2, zf + 0.002], [0.026, POST_H, 0.026]);
    box(GOLD, [hx(lx), WALL_B + POST_H - 0.02, zf + 0.002], [0.03, 0.006, 0.03]);
  }
  for (const lz of [-0.29, -0.07]) {
    box(WOOD_DARK, [hx(-0.29), WALL_B + POST_H / 2, hz(lz)], [0.026, POST_H, 0.026]);
    box(WOOD_DARK, [hx(0.29), WALL_B + POST_H / 2, hz(lz)], [0.026, POST_H, 0.026]);
  }
  // beams
  box(WOOD_DARK, [HX, WALL_B + POST_H - 0.01, zf + 0.002], [0.62, 0.024, 0.028]);
  box(WOOD_DARK, [HX, FLOOR + 0.082, zf + 0.002], [0.62, 0.012, 0.026]);
  box(WOOD_DARK, [hx(0.29), WALL_B + POST_H - 0.01, zc], [0.028, 0.024, 0.46]);
  box(WOOD_DARK, [hx(-0.29), WALL_B + POST_H - 0.01, zc], [0.028, 0.024, 0.46]);
  box(WOOD_DARK, [hx(0.29), FLOOR + 0.082, zc], [0.026, 0.012, 0.44]);
  box(WOOD_DARK, [hx(-0.29), FLOOR + 0.082, zc], [0.026, 0.012, 0.44]);
  box(WOOD_DARK, [HX, FLOOR + 0.004, zf + 0.002], [0.6, 0.012, 0.03]); // sill

  const plane = (tex: THREE.Texture, c: V, out: V, w: number, h: number, strength = 1) =>
    glow(
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: base, at: c, dir: out, axis: "z", texture: tex, name: "pane" }),
      strength,
    );
  const winFrame = (c: V, out: V, w: number, h: number, mat: Mat = WOOD_DARK) => {
    const onZ = Math.abs(out[2]) > 0.5;
    const sgn = onZ ? Math.sign(out[2]) : Math.sign(out[0]);
    const off = 0.003 * sgn;
    const bar = (dx: number, dy: number, sw: number, sh: number) => {
      if (onZ) box(mat, [c[0] + dx, c[1] + dy, c[2] + off], [sw, sh, 0.01]);
      else box(mat, [c[0] + off, c[1] + dy, c[2] + dx], [0.01, sh, sw]);
    };
    bar(0, h / 2 + 0.005, w + 0.02, 0.012);
    bar(0, -h / 2 - 0.005, w + 0.02, 0.012);
    bar(w / 2 + 0.005, 0, 0.012, h + 0.02);
    bar(-w / 2 - 0.005, 0, 0.012, h + 0.02);
  };
  const win = (c: V, out: V, w: number, h: number, tex: THREE.Texture) => {
    plane(tex, [c[0] + out[0] * 0.003, c[1], c[2] + out[2] * 0.003], out, w, h);
    winFrame(c, out, w, h);
  };
  // ground floor windows
  win([hx(-0.195), FLOOR + 0.145, zf + 0.002], [0, 0, 1], 0.165, 0.115, SHOJI_B);
  win([hx(0.195), FLOOR + 0.145, zf + 0.002], [0, 0, 1], 0.165, 0.115, SHOJI_A);
  win([hx(0.29) + 0.002, FLOOR + 0.145, zc], [1, 0, 0], 0.3, 0.115, SHOJI_C);
  win([hx(-0.29) - 0.002, FLOOR + 0.145, zc], [-1, 0, 0], 0.3, 0.115, SHOJI_B);
  win([HX, FLOOR + 0.145, zb + 0.022], [0, 0, 1], 0.3, 0.1, SHOJI_A);
  // lintel gold karakusa
  b.part(new THREE.PlaneGeometry(0.19, 0.019), "#ffffff", { bone: base, at: [HX, FLOOR + 0.2, zf + 0.0], dir: [0, 0, 1], axis: "z", texture: KARAKUSA, name: "lintel" });
  // interior
  box(WOOD_DARK, [HX, FLOOR + 0.07, zb + 0.025], [0.5, 0.004, 0.04]);
  b.part(new THREE.PlaneGeometry(0.075, 0.14), "#ffffff", { bone: base, at: [HX + 0.1, FLOOR + 0.13, zb + 0.022], dir: [0, 0, 1], axis: "z", texture: MURAL, name: "mural" });
  const ZT = zc - 0.01;
  box(WOOD_BROWN, [HX, FLOOR + 0.058, ZT], [0.12, 0.012, 0.08]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(WOOD_DARK, [HX + sx * 0.05, FLOOR + 0.04, ZT + sz * 0.03], [0.012, 0.04, 0.012]);
  for (const sz of [-1, 1]) box(RED_CLOTH, [HX, FLOOR + 0.04, ZT + sz * 0.1], [0.075, 0.022, 0.075]);
  box(CREAM, [HX - 0.03, FLOOR + 0.07, ZT], [0.03, 0.012, 0.03]);
  ball(CREAM, [HX + 0.03, FLOOR + 0.078, ZT], 0.014, { s: [1, 0.85, 1] });
  lampRod("#ffe7a0", [HX, FLOOR + 0.245, ZT], [HX, FLOOR + 0.2, ZT], 0.002);
  lamp("#ffd27a", new THREE.SphereGeometry(0.022, 8, 6), [HX, FLOOR + 0.185, ZT], { s: [1, 1.2, 1] });
  // noren rod and hinged curtain
  const norenJ = b.joint("noren", { parent: base, at: [HX, FLOOR + 0.2, zf + 0.012], dir: [0, -1, 0], role: "hinge" });
  b.rod([hx(-0.1), FLOOR + 0.2, zf + 0.012], [hx(0.1), FLOOR + 0.2, zf + 0.012], 0.005, { color: WOOD_DARK, bone: base, caps: "round" });
  b.cards([frame([HX, FLOOR + 0.196, zf + 0.012], [0, 1, 0])], NOREN, {
    size: [0.19, 0.11],
    lean: 180,
    flow: [0, 0, 1],
    bone: norenJ,
    sink: 0,
  });

  // veranda posts and railings
  const verandaPosts: [number, number][] = [
    [-0.39, 0.305],
    [0.39, 0.305],
    [-0.39, -0.315],
    [0.39, -0.315],
  ];
  for (const [lx, lz] of verandaPosts) {
    cyl(WOOD_RED, [hx(lx), FLOOR + 0.135, hz(lz)], 0.013, 0.015, 0.27, 8);
    cyl(STONE_PLAIN, [hx(lx), FLOOR + 0.012, hz(lz)], 0.022, 0.026, 0.024, 8);
    cyl(GOLD, [hx(lx), FLOOR + 0.245, hz(lz)], 0.017, 0.017, 0.012, 8);
    box(WOOD_RED_FLAT, [hx(lx), FLOOR + 0.268, hz(lz)], [0.052, 0.014, 0.052]);
  }
  const rail = (a: V, c: V, y: number) => {
    rod(WOOD_RED_FLAT, [a[0], y, a[2]], [c[0], y, c[2]], 0.0075, 6);
  };
  rail([hx(-0.39), 0, hz(0.305)], [hx(-0.13), 0, hz(0.305)], FLOOR + 0.085);
  rail([hx(0.13), 0, hz(0.305)], [hx(0.39), 0, hz(0.305)], FLOOR + 0.085);
  rail([hx(-0.39), 0, hz(0.305)], [hx(-0.39), 0, hz(-0.315)], FLOOR + 0.085);
  rail([hx(0.39), 0, hz(0.305)], [hx(0.39), 0, hz(-0.315)], FLOOR + 0.085);
  rail([hx(-0.39), 0, hz(0.305)], [hx(-0.13), 0, hz(0.305)], FLOOR + 0.04);
  rail([hx(0.13), 0, hz(0.305)], [hx(0.39), 0, hz(0.305)], FLOOR + 0.04);
  for (const sx of [-1, 1])
    for (let k = 1; k < 4; k++) {
      const lz = 0.305 - k * 0.155;
      cyl(WOOD_RED_FLAT, [hx(sx * 0.39), FLOOR + 0.05, hz(lz)], 0.005, 0.005, 0.085, 5);
    }
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) cyl(WOOD_RED_FLAT, [hx(sx * (0.2 + k * 0.065) ), FLOOR + 0.05, hz(0.305)], 0.005, 0.005, 0.085, 5);
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) void k, sx;

  // roofs
  type RoofSpec = { hw: number; hd: number; tw: number; td: number; h: number; lift: number; pw: number; thick: number; K: number; L: number };
  const roofPoint = (r: RoofSpec, t: number, u: number, v: number): V => {
    const hxx = r.hw + (r.tw - r.hw) * t;
    const hzz = r.hd + (r.td - r.hd) * t;
    const c = Math.abs(u * v);
    return [u * hxx, r.h * Math.pow(t, r.pw) + r.lift * c * c * (1 - t) * (1 - t), v * hzz];
  };
  const ringUV = (K: number) => {
    const pts: P2[] = [];
    for (let i = 0; i < K; i++) pts.push([-1 + (2 * i) / K, 1]);
    for (let i = 0; i < K; i++) pts.push([1, 1 - (2 * i) / K]);
    for (let i = 0; i < K; i++) pts.push([1 - (2 * i) / K, -1]);
    for (let i = 0; i < K; i++) pts.push([-1, -1 + (2 * i) / K]);
    return pts;
  };
  const mkGeo = (arr: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((arr.length / 3) * 2).fill(0), 2));
    g.computeVertexNormals();
    return g;
  };
  const roof = (cx: number, cy: number, cz: number, r: RoofSpec, ridge: boolean) => {
    const uv = ringUV(r.K);
    const N = uv.length;
    const top: number[] = [];
    const under: number[] = [];
    const fas: number[] = [];
    const P = (t: number, i: number, dy = 0): V => {
      const [u, v] = uv[i % N];
      const q = roofPoint(r, t, u, v);
      return [cx + q[0], cy + q[1] + dy, cz + q[2]];
    };
    const tri = (arr: number[], p: V, q: V, s: V) => {
      const ux = q[0] - p[0];
      const uy = q[1] - p[1];
      const uz = q[2] - p[2];
      const vx = s[0] - p[0];
      const vy = s[1] - p[1];
      const vz = s[2] - p[2];
      const cxp = uy * vz - uz * vy;
      const cyp = uz * vx - ux * vz;
      const czp = ux * vy - uy * vx;
      if (cxp * cxp + cyp * cyp + czp * czp < 1e-12) return;
      arr.push(...p, ...q, ...s);
    };
    for (let k = 0; k < r.L; k++) {
      const t0 = k / r.L;
      const t1 = (k + 1) / r.L;
      for (let i = 0; i < N; i++) {
        tri(top, P(t0, i), P(t0, i + 1), P(t1, i + 1));
        tri(top, P(t0, i), P(t1, i + 1), P(t1, i));
        tri(under, P(t0, i, -r.thick), P(t1, i + 1, -r.thick), P(t0, i + 1, -r.thick));
        tri(under, P(t0, i, -r.thick), P(t1, i, -r.thick), P(t1, i + 1, -r.thick));
      }
    }
    for (let i = 0; i < N; i++) {
      tri(fas, P(0, i), P(0, i, -r.thick), P(0, i + 1, -r.thick));
      tri(fas, P(0, i), P(0, i + 1, -r.thick), P(0, i + 1));
    }
    put(TILE, mkGeo(top), [0, 0, 0]);
    put(SOFFIT, mkGeo(under), [0, 0, 0]);
    put(GOLD, mkGeo(fas), [0, 0, 0]);
    // hip lines and ridge in gold-trimmed blue
    for (const [u, v] of [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ] as P2[]) {
      for (let k = 0; k < r.L; k++) {
        const a = roofPoint(r, k / r.L, u, v);
        const c = roofPoint(r, (k + 1) / r.L, u, v);
        rod(cel("#7cb6ee", "#4a78c0"), [cx + a[0], cy + a[1] + 0.004, cz + a[2]], [cx + c[0], cy + c[1] + 0.004, cz + c[2]], 0.0065, 5);
      }
    }
    if (ridge) {
      const a = roofPoint(r, 1, -1, 0);
      const c = roofPoint(r, 1, 1, 0);
      rod(cel("#7cb6ee", "#4a78c0"), [cx + a[0], cy + a[1] + 0.006, cz], [cx + c[0], cy + c[1] + 0.006, cz], 0.0085, 6);
      rod(GOLD, [cx + a[0] - 0.012, cy + a[1] + 0.012, cz], [cx + c[0] + 0.012, cy + c[1] + 0.012, cz], 0.0035, 5);
      // gold ridge-end ornaments: upswept shachi-like horns
      for (const s of [-1, 1]) {
        const ex = cx + s * (r.tw + 0.006);
        const ey = cy + r.h + 0.004;
        cone(GOLD, [ex + s * 0.012, ey + 0.032, cz], 0.016, 0.07, 6, { rz: -s * 24 });
        ball(GOLD, [ex + s * 0.002, ey + 0.006, cz], 0.016, {}, 6, 4);
        cone(GOLD, [ex + s * 0.03, ey + 0.066, cz], 0.006, 0.03, 5, { rz: -s * 55 });
      }
      // hōju finial in the middle of the ridge
      ball(GOLD, [cx, cy + r.h + 0.03, cz], 0.02, { s: [1, 1.15, 1] }, 8, 6);
      cone(GOLD, [cx, cy + r.h + 0.062, cz], 0.012, 0.04, 6);
      cyl(GOLD, [cx, cy + r.h + 0.01, cz], 0.014, 0.017, 0.014, 8);
    }
    // gold bells hanging from the four eave corners
    for (const [u, v] of [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ] as P2[]) {
      const q = roofPoint(r, 0, u, v);
      const bx = cx + q[0] + u * 0.012;
      const bz = cz + q[2] + v * 0.012;
      const by = cy + q[1] - r.thick;
      rod(GOLD, [bx, by, bz], [bx, by - 0.016, bz], 0.0016, 4);
      cone(GOLD, [bx, by - 0.03, bz], 0.011, 0.02, 6, { rx: 180 });
      ball(GOLD, [bx, by - 0.04, bz], 0.0035, {}, 4, 3);
    }
    // eave end-tile discs
    for (let i = 0; i < N; i++) {
      const [u, v] = uv[i];
      const p = P(0, i, -r.thick * 0.5);
      const n: V = Math.abs(v) > 0.99 ? [0, 0, Math.sign(v)] : [Math.sign(u), 0, 0];
      const d = 0.01;
      const geo = new THREE.CylinderGeometry(0.0125, 0.0125, 0.006, 8);
      put(WOOD_RED_FLAT, geo, [p[0] + n[0] * d, p[1], p[2] + n[2] * d], { q: aim(n) });
      put(GOLD, new THREE.CylinderGeometry(0.0055, 0.0055, 0.008, 6), [p[0] + n[0] * (d + 0.001), p[1], p[2] + n[2] * (d + 0.001)], { q: aim(n) });
    }
  };
  const lowerRoof: RoofSpec = { hw: 0.45, hd: 0.36, tw: 0.25, td: 0.17, h: 0.135, lift: 0.04, pw: 1.5, thick: 0.014, K: 8, L: 5 };
  const upperRoof: RoofSpec = { hw: 0.38, hd: 0.29, tw: 0.12, td: 0.0, h: 0.19, lift: 0.045, pw: 1.7, thick: 0.014, K: 8, L: 6 };
  const ROOF_Y = FLOOR + 0.265;
  roof(HX, ROOF_Y, HZ, lowerRoof, false);
  // upper floor
  const UF = ROOF_Y + lowerRoof.h - 0.012; // floor of upper storey
  const UH = 0.22;
  const uz = HZ - 0.0;
  box(PLASTER, [HX, UF + UH / 2, uz], [0.46, UH, 0.32]);
  box(WOOD_DARK, [HX, UF + UH - 0.01, uz], [0.5, 0.022, 0.36]);
  box(WOOD_DARK, [HX, UF + 0.01, uz], [0.5, 0.022, 0.36]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(WOOD_DARK, [HX + sx * 0.23, UF + UH / 2, uz + sz * 0.16], [0.026, UH, 0.026]);
  for (const sx of [-0.115, 0.115]) box(WOOD_DARK, [HX + sx, UF + UH / 2, uz + 0.162], [0.02, UH, 0.012]);
  win([HX - 0.165, UF + UH / 2 - 0.005, uz + 0.162], [0, 0, 1], 0.1, 0.13, SHOJI_A);
  win([HX + 0.165, UF + UH / 2 - 0.005, uz + 0.162], [0, 0, 1], 0.1, 0.13, SHOJI_C);
  // central gold-framed round window
  plane(MOON, [HX, UF + UH / 2, uz + 0.165], [0, 0, 1], 0.12, 0.12);
  win([HX + 0.232, UF + UH / 2, uz], [1, 0, 0], 0.2, 0.13, SHOJI_B);
  win([HX - 0.232, UF + UH / 2, uz], [-1, 0, 0], 0.2, 0.13, SHOJI_A);
  win([HX, UF + UH / 2, uz - 0.162], [0, 0, -1], 0.2, 0.13, SHOJI_C);
  // balcony rail in front of the upper storey, resting on the lower roof
  rod(WOOD_RED_FLAT, [HX - 0.26, UF + 0.045, uz + 0.2], [HX + 0.26, UF + 0.045, uz + 0.2], 0.007, 6);
  rod(WOOD_RED_FLAT, [HX - 0.26, UF + 0.02, uz + 0.2], [HX + 0.26, UF + 0.02, uz + 0.2], 0.0045, 5);
  for (let i = 0; i <= 8; i++) cyl(WOOD_RED_FLAT, [HX - 0.26 + i * 0.065, UF + 0.03, uz + 0.2], 0.0055, 0.0055, 0.05, 5);
  for (const s of [-1, 1]) {
    cyl(WOOD_RED, [HX + s * 0.26, UF + 0.03, uz + 0.2], 0.01, 0.01, 0.07, 6);
    ball(GOLD, [HX + s * 0.26, UF + 0.07, uz + 0.2], 0.011, {}, 6, 4);
  }
  roof(HX, UF + UH, uz, upperRoof, true);
  // petals resting on the roof slopes
  {
    const rr = rng(91);
    const onRoof = (spec: RoofSpec, cx: number, cy: number, cz: number, ts: number[], nrm: V): Frame[] =>
      ts.map((t) => {
        const q = roofPoint(spec, t, -0.7 + rr() * 1.4, 1);
        return frame([cx + q[0], cy + q[1] + 0.004, cz + q[2]], nrm);
      });
    const roofPetals = [
      ...onRoof(lowerRoof, HX, ROOF_Y, HZ, [0.2, 0.35, 0.5, 0.65, 0.3, 0.55, 0.45, 0.75], [0, 0.82, 0.58]),
      ...onRoof(upperRoof, HX, UF + UH, uz, [0.15, 0.3, 0.45, 0.6, 0.25, 0.5], [0, 0.84, 0.54]),
    ];
    b.cards(roofPetals, PETAL, {
      size: 0.032,
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.2), -0.4, Math.sin(i * 2.2)],
      vary: 0.3,
      rng: rng(92),
      bone: base,
      sink: 0,
      mirror: true,
    });
  }

  // under-eave brackets and veranda beam
  for (const [lx, lz] of verandaPosts) {
    box(WOOD_DARK, [hx(lx), ROOF_Y - 0.004, hz(lz)], [0.07, 0.01, 0.07]);
    box(GOLD, [hx(lx), ROOF_Y - 0.012, hz(lz)], [0.03, 0.006, 0.03]);
  }
  box(WOOD_DARK, [HX, ROOF_Y - 0.01, hz(0.305)], [0.8, 0.014, 0.022]);

  // hanging paper lanterns (hinged)
  const hangLantern = (name: string, x: number, y: number, z: number, scale: number) => {
    const j = b.joint(name, { parent: base, at: [x, y, z], dir: [0, -1, 0], role: "hinge" });
    const cy = y - 0.075 * scale;
    glow(b.part(new THREE.SphereGeometry(0.03 * scale, 8, 6), "#ff9a3c", { bone: j, at: [x, cy, z], scale: [1, 1.25, 1], name: `${name}Body` }), 1.2);
    b.part(new THREE.CylinderGeometry(0.019 * scale, 0.022 * scale, 0.01 * scale, 8), BLACK, { bone: j, at: [x, y - 0.03 * scale, z], name: `${name}Cap` });
    b.part(new THREE.CylinderGeometry(0.022 * scale, 0.019 * scale, 0.01 * scale, 8), BLACK, { bone: j, at: [x, y - 0.12 * scale, z], name: `${name}Foot` });
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.03 * scale, 4), "#3a2a3f", { bone: j, at: [x, y - 0.012 * scale, z], name: `${name}Cord` });
    for (const k of [-0.35, 0.35]) b.part(new THREE.CylinderGeometry(0.0315 * scale, 0.0315 * scale, 0.004 * scale, 8), BLACK, { bone: j, at: [x, cy + k * 0.045 * scale * 1.3, z], name: `${name}Rib${k}` });
    b.part(new THREE.ConeGeometry(0.009 * scale, 0.045 * scale, 5), GOLD, { bone: j, at: [x, y - 0.15 * scale, z], rotation: [180, 0, 0], name: `${name}Tassel` });
  };
  hangLantern("lanternL", hx(-0.3), ROOF_Y + 0.002, hz(0.335), 1.0);
  hangLantern("lanternR", hx(0.3), ROOF_Y + 0.002, hz(0.335), 1.0);
  hangLantern("lanternBack", hx(0.43), ROOF_Y - 0.012, hz(-0.03), 0.85);

  // hanging sign on a bracket arm
  {
    const sx = hx(0.39);
    const sz = hz(0.305);
    const sy = FLOOR + 0.2;
    rod(WOOD_DARK, [sx, sy, sz], [sx + 0.12, sy, sz], 0.005, 5);
    rod(WOOD_DARK, [sx + 0.0, sy - 0.04, sz], [sx + 0.06, sy, sz], 0.004, 5);
    ball(GOLD, [sx + 0.122, sy, sz], 0.008, {}, 6, 4);
    const sj = b.joint("sign", { parent: base, at: [sx + 0.095, sy - 0.004, sz], dir: [0, -1, 0], role: "hinge" });
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.012), WOOD_DARK, { bone: sj, at: [sx + 0.095, sy - 0.05, sz], name: "signBoard" });
    b.part(new THREE.PlaneGeometry(0.09, 0.0405), "#ffffff", { bone: sj, at: [sx + 0.095, sy - 0.05, sz + 0.0068], dir: [0, 0, 1], axis: "z", texture: SIGN, name: "signFace" });
    for (const s of [-1, 1]) b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.016, 4), "#3a2a3f", { bone: sj, at: [sx + 0.095 + s * 0.04, sy - 0.012, sz], name: `signChain${s}` });
  }

  // wind chime on the upper eave
  {
    const cx0 = HX + 0.3;
    const cy0 = UF + UH + 0.0;
    const cz0 = uz + 0.2;
    const j = b.joint("chime", { parent: base, at: [cx0, cy0, cz0], dir: [0, -1, 0], role: "hinge" });
    b.part(new THREE.ConeGeometry(0.018, 0.026, 8, 1, true), cel("#9fe8f0", "#58b6d6"), { bone: j, at: [cx0, cy0 - 0.032, cz0], rotation: [180, 0, 0], name: "chimeBell" });
    b.part(new THREE.CylinderGeometry(0.0012, 0.0012, 0.02, 4), "#3a2a3f", { bone: j, at: [cx0, cy0 - 0.012, cz0], name: "chimeCord" });
    b.part(new THREE.CylinderGeometry(0.0012, 0.0012, 0.03, 4), "#3a2a3f", { bone: j, at: [cx0, cy0 - 0.04, cz0], name: "chimeClapper" });
    b.cards([frame([cx0, cy0 - 0.054, cz0], [0, 1, 0])], CHIME_STRIP, { size: [0.012, 0.05], lean: 180, flow: [0, 0, 1], bone: j, sink: 0 });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Nobori banners at the foot of the steps
  for (const s of [-1, 1]) {
    const px = HX + s * 0.34;
    const pz = HZ + 0.52;
    cyl(WOOD_DARK, [px, PLATEAU + 0.28, pz], 0.006, 0.007, 0.56, 6);
    cone(GOLD, [px, PLATEAU + 0.585, pz], 0.011, 0.03, 6);
    cyl(STONE, [px, PLATEAU + 0.012, pz], 0.025, 0.03, 0.024, 6);
    rod(WOOD_DARK, [px, PLATEAU + 0.52, pz], [px + s * -0.09, PLATEAU + 0.52, pz], 0.0045, 5);
    ball(GOLD, [px - s * 0.09, PLATEAU + 0.52, pz], 0.0065, {}, 5, 4);
    const nj = b.joint(s > 0 ? "noboriL" : "noboriR", { parent: base, at: [px - s * 0.045, PLATEAU + 0.518, pz], dir: [0, -1, 0], role: "hinge" });
    b.cards([frame([px - s * 0.045, PLATEAU + 0.516, pz], [0, 1, 0])], BANNER, {
      size: [0.085, 0.28],
      lean: 180,
      flow: [0, 0, 1],
      bone: nj,
      sink: 0,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Bridge
  const deckPath = bezier([-0.58, 0.515, BZ], [-0.22, 0.9, BZ], [0.18, 0.9, BZ], [0.66, 0.42, BZ]);
  const deckAt = (t: number) => {
    const p = deckPath.at(t);
    const tg = deckPath.tangentAt(t);
    return { p: [p.x, p.y, p.z] as V, tg: [tg.x, tg.y, tg.z] as V };
  };
  const PLANKS = 26;
  for (let i = 0; i < PLANKS; i++) {
    const { p, tg } = deckAt((i + 0.5) / PLANKS);
    const q = aim(tg, [0, 1, 0], "x");
    put(i % 2 ? WOOD_LIGHT : cel(grain("#f0c488", "#d9a362", { size: 0.01, axis: "x" })), new THREE.BoxGeometry(0.047, 0.014, 0.19), [p[0], p[1] - 0.007, p[2]], { q });
  }
  // under-beams and arched stringers
  for (const s of [-1, 1]) {
    const pts: V[] = [];
    for (let i = 0; i <= 12; i++) {
      const { p } = deckAt(i / 12);
      pts.push([p[0], p[1] - 0.03, BZ + s * 0.07]);
    }
    b.sweep(catmull(pts), () => [0.012, 0.018], { section: "box", color: WOOD_RED_FLAT, bone: base, caps: "flat" });
  }
  // end beams buried in the banks
  for (const [x, y] of [
    [-0.62, 0.5],
    [0.7, 0.4],
  ])
    box(STONE, [x, y + 0.005, BZ], [0.12, 0.03, 0.26]);
  // posts, caps and rails
  const POSTS = 11;
  for (const s of [-1, 1]) {
    const railTop: V[] = [];
    const railLow: V[] = [];
    for (let i = 0; i < POSTS; i++) {
      const { p } = deckAt(i / (POSTS - 1));
      const z = BZ + s * 0.095;
      const big = i === 0 || i === POSTS - 1;
      cyl(WOOD_RED, [p[0], p[1] + 0.045, z], big ? 0.014 : 0.01, big ? 0.015 : 0.011, 0.09, 8);
      ball(GOLD, [p[0], p[1] + 0.098, z], big ? 0.017 : 0.0125, { s: [1, 1.15, 1] }, 7, 5);
      cyl(GOLD, [p[0], p[1] + 0.088, z], big ? 0.017 : 0.013, big ? 0.017 : 0.013, 0.006, 8);
      railTop.push([p[0], p[1] + 0.078, z]);
      railLow.push([p[0], p[1] + 0.04, z]);
    }
    b.sweep(catmull(railTop), 0.0085, { color: WOOD_RED_FLAT, bone: base, sides: 6, caps: "round" });
    b.sweep(catmull(railLow), 0.006, { color: WOOD_RED_FLAT, bone: base, sides: 5, caps: "round" });
    // balusters between posts
    for (let i = 0; i < 20; i++) {
      const { p } = deckAt((i + 0.5) / 20);
      cyl(WOOD_RED_FLAT, [p[0], p[1] + 0.036, BZ + s * 0.095], 0.003, 0.003, 0.07, 4);
    }
  }
  // koshi lattice facing on the deck edge boards
  for (const s of [-1, 1]) {
    const pts: V[] = [];
    for (let i = 0; i <= 12; i++) {
      const { p } = deckAt(i / 12);
      pts.push([p[0], p[1] + 0.003, BZ + s * 0.1]);
    }
    b.sweep(catmull(pts), () => [0.004, 0.006], { section: "box", color: GOLD, bone: base, caps: "flat" });
  }

  // torii over the bridge's far end
  {
    const tx = 0.8;
    const gy = PLATEAU_R;
    const legZ = [BZ - 0.17, BZ + 0.17];
    const H = 0.34;
    for (const z of legZ) {
      cyl(WOOD_RED, [tx, gy + H / 2, z], 0.017, 0.021, H, 8);
      cyl(BLACK, [tx, gy + 0.02, z], 0.024, 0.024, 0.04, 8);
      cyl(BLACK, [tx, gy + H - 0.045, z], 0.0195, 0.0195, 0.012, 8);
    }
    rod(WOOD_RED_FLAT, [tx, gy + H - 0.085, legZ[0] - 0.03], [tx, gy + H - 0.085, legZ[1] + 0.03], 0.0125, 6);
    // kasagi upper beam with upswept ends
    const ky = gy + H + 0.005;
    const kas: V[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = (i / 10) * 2 - 1;
      kas.push([tx, ky + 0.03 * u * u * u * u + 0.008 * Math.abs(u) ** 2, BZ + u * 0.25]);
    }
    b.sweep(catmull(kas), [0.018, 0.018], { color: BLACK, bone: base, sides: 6, caps: "round" });
    const shi: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = (i / 8) * 2 - 1;
      shi.push([tx, ky - 0.028 + 0.012 * u * u, BZ + u * 0.22]);
    }
    b.sweep(catmull(shi), 0.011, { color: WOOD_RED_FLAT, bone: base, sides: 6, caps: "round" });
    // gaku plaque
    box(GOLD, [tx, gy + H - 0.05, BZ], [0.012, 0.05, 0.075]);
    box(INDIGO, [tx, gy + H - 0.05, BZ], [0.016, 0.04, 0.065]);
    for (const s of [-1, 1]) lamp("#ffd35a", new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), [tx + s * 0.0095, gy + H - 0.05, BZ], { rz: 90 });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Stone lanterns (toro)
  const toro = (x: number, y: number, z: number, s: number) => {
    cyl(STONE, [x, y + 0.01 * s, z], 0.05 * s, 0.056 * s, 0.02 * s, 6);
    cyl(STONE, [x, y + 0.062 * s, z], 0.014 * s, 0.017 * s, 0.085 * s, 6);
    cyl(STONE, [x, y + 0.118 * s, z], 0.042 * s, 0.032 * s, 0.022 * s, 6);
    cyl(STONE_PLAIN, [x, y + 0.155 * s, z], 0.03 * s, 0.03 * s, 0.05 * s, 4, { ry: 45 });
    for (const a of [0, 90, 180, 270]) {
      const nx = Math.sin(a * DEG);
      const nz = Math.cos(a * DEG);
      lamp("#ffd27a", new THREE.BoxGeometry(0.026 * s, 0.03 * s, 0.006 * s), [x + nx * 0.0215 * s, y + 0.156 * s, z + nz * 0.0215 * s], { ry: a });
    }
    cone(STONE, [x, y + 0.205 * s, z], 0.062 * s, 0.045 * s, 6);
    cyl(STONE, [x, y + 0.178 * s, z], 0.044 * s, 0.044 * s, 0.01 * s, 6);
    ball(GOLD, [x, y + 0.235 * s, z], 0.013 * s, {}, 6, 4);
    cone(GOLD, [x, y + 0.254 * s, z], 0.007 * s, 0.02 * s, 5);
  };
  toro(-0.47, PLATEAU - 0.005, 0.9, 1.1);
  toro(0.72, PLATEAU_R - 0.005, 0.92, 1.1);
  toro(0.58, PLATEAU_R - 0.005, 0.3, 0.9);

  // Stepping stones
  const stone = (x: number, y: number, z: number, r: number, i: number) =>
    cyl(STONE_PLAIN, [x, y + 0.006, z], r, r * 1.06, 0.014, 7, { ry: i * 33, s: [1, 1, 0.82 + (i % 3) * 0.1] });
  const pathL: P2[] = [
    [HX + 0.0, HZ + 0.52],
    [HX + 0.08, HZ + 0.6],
    [HX + 0.14, HZ + 0.7],
    [HX + 0.2, HZ + 0.8],
    [HX + 0.24, HZ + 0.9],
    [-0.74, 0.5],
  ];
  pathL.forEach(([x, z], i) => stone(x + 0.0, PLATEAU, z - 0.0, 0.04 + 0.006 * (i % 2), i));
  const pathR: P2[] = [
    [0.8, 0.52],
    [0.9, 0.46],
    [0.98, 0.38],
    [1.06, 0.3],
    [1.06, 0.2],
  ];
  pathR.forEach(([x, z], i) => stone(x, PLATEAU_R, z, 0.036 + 0.005 * (i % 2), i + 3));
  // path from steps to the bench
  [
    [HX - 0.18, HZ + 0.55],
    [HX - 0.26, HZ + 0.62],
  ].forEach(([x, z], i) => stone(x, PLATEAU, z, 0.035, i + 9));

  // ---------------------------------------------------------------------------------------------------------------
  // Tea terrace rows, bench with parasol, bamboo
  for (let r = 0; r < 3; r++) {
    const z = 0.7 + r * 0.17;
    const g = new THREE.SphereGeometry(1, 10, 5);
    put(TEA, g, [-1.27, PLATEAU + 0.012, z], { s: [0.14, 0.07, 0.065], ry: r * 3 });
    put(TEA_NEW, new THREE.SphereGeometry(1, 8, 4), [-1.27, PLATEAU + 0.044, z + 0.003], { s: [0.12, 0.04, 0.05] });
    cyl(WOOD_BROWN, [-1.43, PLATEAU + 0.03, z], 0.006, 0.006, 0.06, 5);
    cyl(WOOD_BROWN, [-1.11, PLATEAU + 0.03, z], 0.006, 0.006, 0.06, 5);
  }
  // harvest basket with leaves
  put(cel("#d9a860"), new THREE.CylinderGeometry(0.035, 0.026, 0.05, 8, 1, true), [-1.12, PLATEAU + 0.03, 0.92]);
  cyl(cel("#d9a860"), [-1.12, PLATEAU + 0.006, 0.92], 0.026, 0.026, 0.01, 8);
  ball(TEA_NEW, [-1.12, PLATEAU + 0.045, 0.92], 0.032, { s: [1, 0.6, 1] }, 7, 4);
  // bench
  {
    const bx = -1.02;
    const bz = 0.38;
    box(RED_CLOTH, [bx, PLATEAU + 0.056, bz], [0.22, 0.014, 0.08]);
    box(RED_CLOTH, [bx, PLATEAU + 0.036, bz + 0.042], [0.22, 0.028, 0.006]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(WOOD_DARK, [bx + sx * 0.095, PLATEAU + 0.026, bz + sz * 0.03], [0.012, 0.052, 0.012]);
    box(WOOD_DARK, [bx, PLATEAU + 0.045, bz], [0.2, 0.008, 0.012]);
    // parasol
    const px = bx - 0.03;
    const pz = bz - 0.06;
    cyl(WOOD_BROWN, [px, PLATEAU + 0.24, pz], 0.006, 0.007, 0.48, 6);
    const cone8 = new THREE.ConeGeometry(0.2, 0.075, 12, 2);
    const parasolPaint = cel(
      paint((p) => {
        const ang = Math.atan2(p.z - pz, p.x - px);
        const seg = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 12);
        return seg % 2 ? "#fff3dc" : "#e2433a";
      }),
    );
    put(parasolPaint, cone8, [px, PLATEAU + 0.47, pz]);
    ball(GOLD, [px, PLATEAU + 0.512, pz], 0.012, {}, 6, 4);
    cyl(GOLD, [px, PLATEAU + 0.44, pz], 0.012, 0.012, 0.02, 6);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rod(WOOD_BROWN, [px, PLATEAU + 0.425, pz], [px + Math.cos(a) * 0.19, PLATEAU + 0.4375 - 0.0, pz + Math.sin(a) * 0.19], 0.0016, 4);
    }
    // tea set
    ball(cel("#fffaf0"), [bx - 0.05, PLATEAU + 0.082, bz], 0.022, { s: [1, 0.85, 1] }, 8, 5);
    cyl(cel("#fffaf0"), [bx - 0.05, PLATEAU + 0.105, bz], 0.008, 0.012, 0.01, 8);
    ball(GOLD, [bx - 0.05, PLATEAU + 0.113, bz], 0.005, {}, 5, 4);
    rod(cel("#fffaf0"), [bx - 0.026, PLATEAU + 0.082, bz], [bx - 0.01, PLATEAU + 0.094, bz], 0.004, 5);
    put(cel("#fffaf0"), new THREE.TorusGeometry(0.012, 0.0032, 4, 8, Math.PI), [bx - 0.075, PLATEAU + 0.082, bz], { rz: -90 });
    cyl(cel("#9fd8f2"), [bx + 0.005, PLATEAU + 0.069, bz + 0.02], 0.011, 0.008, 0.016, 8);
    cyl(cel("#9fd8f2"), [bx + 0.035, PLATEAU + 0.069, bz - 0.015], 0.011, 0.008, 0.016, 8);
    cyl(cel("#4fa96c"), [bx + 0.005, PLATEAU + 0.077, bz + 0.02], 0.0095, 0.0095, 0.002, 8);
    cyl(cel("#4fa96c"), [bx + 0.035, PLATEAU + 0.077, bz - 0.015], 0.0095, 0.0095, 0.002, 8);
    // dango plate
    cyl(cel("#fffaf0"), [bx + 0.075, PLATEAU + 0.065, bz + 0.015], 0.025, 0.02, 0.006, 10);
    rod(WOOD_LIGHT, [bx + 0.055, PLATEAU + 0.075, bz + 0.015], [bx + 0.095, PLATEAU + 0.075, bz + 0.015], 0.0017, 4);
    ball(cel("#ff9ec8"), [bx + 0.062, PLATEAU + 0.077, bz + 0.015], 0.0095, {}, 6, 4);
    ball(cel("#fffaf0"), [bx + 0.076, PLATEAU + 0.077, bz + 0.015], 0.0095, {}, 6, 4);
    ball(cel("#8fd46a"), [bx + 0.09, PLATEAU + 0.077, bz + 0.015], 0.0095, {}, 6, 4);
  }

  // bamboo grove
  const bamboo: [number, number, number, number][] = [
    [-1.42, 0.12, 1.05, 3],
    [-1.37, 0.2, 0.85, -2],
    [-1.44, 0.27, 1.2, 2],
    [-1.34, 0.3, 0.95, -4],
    [-1.4, 0.38, 0.75, 3],
    [-1.46, 0.18, 0.7, -3],
  ];
  const leafFrames: Frame[] = [];
  bamboo.forEach(([x, z, h, lean], i) => {
    const top: V = [x + Math.sin(lean * DEG) * h * 0.5, PLATEAU + h, z];
    cyl(BAMBOO, [(x + top[0]) / 2, PLATEAU + h / 2, z], 0.011, 0.014, h, 6, { rz: -lean });
    const nodes = Math.floor(h / 0.1);
    for (let k = 1; k <= nodes; k++) {
      const t = (k * 0.1) / h;
      const nx = x + (top[0] - x) * t;
      cyl(BAMBOO_NODE, [nx, PLATEAU + k * 0.1, z], 0.0145 - t * 0.003, 0.0145 - t * 0.003, 0.006, 6);
    }
    for (let k = 0; k < 5; k++) {
      const t = 0.62 + k * 0.09;
      const a = i * 2.1 + k * 1.7;
      leafFrames.push(frame([x + (top[0] - x) * t, PLATEAU + h * t, z], [Math.cos(a) * 0.9, 0.25, Math.sin(a) * 0.9]));
    }
    leafFrames.push(frame(top, [0, 1, 0]));
  });
  b.cards(leafFrames, BAMBOO_LEAF, {
    size: [0.05, 0.17],
    lean: 55,
    bend: 25,
    flow: (_f, i) => [Math.cos(i * 1.7), -0.2, Math.sin(i * 1.7)],
    vary: 0.3,
    rng: rng(17),
    cross: true,
    bone: base,
    sink: 0.05,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Cherry tree
  const limbs: [V[], number, number][] = [
    [[[0.95, 0.37, 0.05], [0.94, 0.55, 0.05], [0.88, 0.78, 0.03], [0.78, 0.98, 0.0], [0.64, 1.14, -0.02]], 0.078, 0.034],
    [[[0.88, 0.78, 0.03], [1.0, 0.96, 0.0], [1.12, 1.12, -0.06], [1.26, 1.22, -0.06]], 0.034, 0.012],
    [[[0.78, 0.98, 0.0], [0.82, 1.18, -0.1], [0.9, 1.38, -0.16]], 0.03, 0.011],
    [[[0.64, 1.14, -0.02], [0.52, 1.26, 0.04], [0.4, 1.3, 0.1]], 0.03, 0.01],
    [[[0.94, 0.55, 0.05], [1.1, 0.72, 0.1], [1.28, 0.8, 0.16]], 0.032, 0.011],
    [[[0.78, 0.98, 0.0], [0.72, 1.06, 0.18], [0.66, 1.16, 0.32]], 0.026, 0.01],
    [[[0.64, 1.14, -0.02], [0.66, 1.32, -0.04], [0.74, 1.52, -0.02]], 0.026, 0.01],
    [[[1.0, 0.96, 0.0], [1.02, 1.2, 0.08], [1.1, 1.42, 0.06]], 0.024, 0.009],
    [[[1.12, 1.12, -0.06], [1.2, 1.3, 0.0], [1.24, 1.46, -0.02]], 0.014, 0.007],
    [[[0.9, 1.38, -0.16], [0.96, 1.5, -0.1], [1.0, 1.62, -0.04]], 0.012, 0.006],
  ];
  for (const [pts, r0, r1] of limbs) b.sweep(catmull(pts), [r0, r1], { color: BARK, bone: base, sides: 7, caps: "round" });
  // roots
  [
    [0.95, 0.05, 0.1, 0.12],
    [0.95, 0.05, 0.1, -1.4],
    [0.95, 0.05, -0.1, 0.3],
    [0.95, 0.05, 0.1, 2.2],
    [0.95, 0.05, -0.1, -2.6],
  ].forEach(([x, z, r, a]) => {
    const ex = x + Math.cos(a) * (0.12 + r);
    const ez = z + Math.sin(a) * (0.12 + r);
    b.sweep(catmull([[x, 0.46, z], [x + Math.cos(a) * 0.08, 0.41, z + Math.sin(a) * 0.08], [ex, 0.395, ez]]), [0.032, 0.012], { color: BARK, bone: base, sides: 6, caps: "round" });
  });
  // canopy
  const canopy: [number, number, number, number][] = [
    [0.4, 1.3, 0.1, 0.19],
    [0.55, 1.28, -0.02, 0.23],
    [0.72, 1.5, -0.02, 0.22],
    [0.9, 1.4, -0.14, 0.25],
    [1.1, 1.45, 0.06, 0.24],
    [1.26, 1.24, -0.04, 0.22],
    [1.1, 1.15, 0.1, 0.24],
    [0.85, 1.22, 0.08, 0.24],
    [0.66, 1.18, 0.3, 0.17],
    [1.28, 0.86, 0.16, 0.17],
    [1.02, 1.05, 0.28, 0.14],
    [0.95, 1.6, 0.02, 0.2],
    [0.62, 1.4, 0.1, 0.2],
    [-0.4, 0.6, 0.36, 0.1],
    [-0.46, 0.58, 0.42, 0.075],
    [-0.62, 0.6, 1.0, 0.11],
    [-0.55, 0.58, 1.05, 0.075],
    [-1.22, 0.6, 0.5, 0.09],
    [-1.16, 0.58, 0.55, 0.065],
  ];
  const canopyBins: THREE.BufferGeometry[][] = [[], [], []];
  const cr = rng(41);
  canopy.forEach(([x, y, z, r], ci) => {
    const subs: [number, number, number, number][] = [
      [0, 0, 0, r],
      [(cr() - 0.5) * r * 1.1, (cr() - 0.2) * r * 0.6, (cr() - 0.5) * r * 1.1, r * 0.72],
      [(cr() - 0.5) * r * 1.2, (cr() - 0.7) * r * 0.5, (cr() - 0.5) * r * 1.2, r * 0.66],
    ];
    subs.forEach(([dx, dy, dz, rr], si) => {
      const g = new THREE.IcosahedronGeometry(rr * 0.93, 1);
      const pos = g.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const px = pos.getX(j);
        const py = pos.getY(j);
        const pz = pos.getZ(j);
        const k = 1 + (hash3(px + ci, py, pz + si, 5) - 0.5) * 0.2;
        pos.setXYZ(j, px * k, py * k * 0.9, pz * k);
      }
      g.translate(x + dx, y + dy, z + dz);
      g.computeVertexNormals();
      canopyBins[(ci + si * 2) % 3 === 0 ? 1 : (ci + si) % 3 === 0 ? 2 : 0].push(g);
    });
  });
  const canopyParts = [CHERRY_A, CHERRY_B, CHERRY_C].map((m, i) => {
    const g = flatten(canopyBins[i]);
    return g ? b.part(g, m, { bone: base, at: [0, 0, 0], flat: true, name: `canopy${i}` }) : null;
  });
  const canopySurface = b.surface(canopyParts.filter((p): p is NonNullable<typeof p> => p !== null));
  const blossomHits = canopySurface.scatter(1000, { rng: rng(51), minDist: 0.045, filter: (h) => h.n.y > -0.4 });
  b.cards(blossomHits, BLOSSOM, {
    size: [0.088, 0.088],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 2.399), 0.15, Math.sin(i * 2.399)],
    vary: 0.3,
    rng: rng(52),
    bone: base,
    sink: 0,
    mirror: false,
  });
  // sacred shimenawa rope with shide
  {
    const rp = catmull(limbs[0][0]);
    const t = 0.2;
    const ctr = rp.at(t);
    const ringLine = frame(rp.at(t), rp.tangentAt(t));
    const ring = b.ring(ringLine, { count: 12, radius: 0.092 });
    void ctr;
    b.sweep(catmull(ring.items.map((it) => it.at), { closed: true }), 0.0085, { color: cel("#f1dfa8", "#c9a96a"), bone: base, sides: 6 });
    const hangF = ring.items.filter((_, i) => i % 2 === 0).map((it) => frame([it.at.x, it.at.y - 0.004, it.at.z], [0, 1, 0]));
    b.cards(hangF, SHIDE, { size: [0.018, 0.06], lean: 180, flow: [0, 0, 1], bone: base, sink: 0, cross: true });
    for (const it of ring.items.filter((_, i) => i % 3 === 0)) ball(GOLD, [it.at.x, it.at.y, it.at.z], 0.0075, {}, 5, 3);
  }

  // ground petals, on grass, stones and water
  const petalFrames: Frame[] = [];
  const pr = rng(61);
  for (let i = 0; i < 110; i++) {
    const a = pr() * Math.PI * 2;
    const d = Math.sqrt(pr()) * 0.5;
    const x = 0.92 + Math.cos(a) * d * 1.0;
    const z = 0.14 + Math.sin(a) * d * 0.85;
    if (x > 1.44) continue;
    const onWater = x < xR(z) - 0.015;
    if (onWater && x > xL(z) + 0.02) petalFrames.push(frame([x, WATER_Y + 0.003, z], [0, 1, 0]));
    else if (x > xR(z) + 0.03 && z < 1.05) petalFrames.push(frame([x, PLATEAU_R + capH - 0.05 + 0.004, z], [0, 1, 0]));
  }
  for (let i = 0; i < 40; i++) {
    const x = -0.28 + pr() * 0.56;
    const z = -0.6 + pr() * 1.7;
    if (x > xL(z) + 0.03 && x < xR(z) - 0.03) petalFrames.push(frame([x, WATER_Y + 0.003, z], [0, 1, 0]));
  }
  b.cards(petalFrames, PETAL, {
    size: 0.036,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.9), 0, Math.sin(i * 1.9)],
    vary: 0.3,
    rng: rng(62),
    bone: base,
    sink: 0,
    mirror: true,
  });
  // drifting glowing petals spiralling round the tree
  {
    const fr: Frame[] = [];
    for (let i = 0; i < 46; i++) {
      const t = i / 46;
      const a = t * Math.PI * 5.5;
      const rad = 0.38 + 0.3 * Math.sin(t * 3.2) + 0.1 * pr();
      const x = 0.88 + Math.cos(a) * rad;
      const z = 0.08 + Math.sin(a) * rad * 0.9;
      const y = 0.55 + t * 1.15;
      fr.push(frame([x, y, z], [0, 1, 0]));
    }
    glow(
      b.cards(fr, PETAL, {
        size: 0.06,
        lean: 70,
        flow: (_f, i) => [Math.cos(i * 2.7), -0.3, Math.sin(i * 2.7)],
        vary: 0.25,
        rng: rng(63),
        bone: base,
        sink: 0,
        mirror: true,
      }),
      1,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Picnic mat, jizo, cat
  {
    const mx = 1.08;
    const mz = 0.7;
    const ang = 18 * DEG;
    const matPaint = cel(
      paint((p) => {
        const dx = p.x - mx;
        const dz = p.z - mz;
        const u = dx * Math.cos(ang) - dz * Math.sin(ang);
        const w = dx * Math.sin(ang) + dz * Math.cos(ang);
        if (Math.abs(u) > 0.155 || Math.abs(w) > 0.115) return "#fff6e4";
        const cx = Math.floor((u + 1) / 0.04);
        const cz = Math.floor((w + 1) / 0.04);
        return (cx + cz) % 2 ? "#e2433a" : "#ffdce6";
      }),
    );
    box(matPaint, [mx, PLATEAU_R + capH - 0.045, mz], [0.34, 0.012, 0.26], { ry: -18 });
    // tea set
    const yy = PLATEAU_R + capH - 0.034;
    const at = (u: number, w: number): V => [mx + u * Math.cos(ang) + w * Math.sin(ang), yy, mz - u * Math.sin(ang) + w * Math.cos(ang)];
    const tp = at(-0.06, -0.02);
    ball(cel("#6fc7e8"), [tp[0], yy + 0.026, tp[2]], 0.032, { s: [1, 0.85, 1] }, 8, 5);
    cyl(cel("#6fc7e8"), [tp[0], yy + 0.058, tp[2]], 0.012, 0.018, 0.012, 8);
    ball(GOLD, [tp[0], yy + 0.068, tp[2]], 0.006, {}, 5, 4);
    rod(cel("#6fc7e8"), [tp[0] + 0.03, yy + 0.03, tp[2]], [tp[0] + 0.052, yy + 0.048, tp[2]], 0.0055, 5);
    put(GOLD, new THREE.TorusGeometry(0.018, 0.0035, 4, 8, Math.PI), [tp[0] - 0.036, yy + 0.03, tp[2]], { rz: 90 });
    for (const [u, w] of [[0.02, 0.0], [0.05, 0.05]] as P2[]) {
      const c = at(u, w);
      cyl(cel("#fffaf0"), [c[0], yy + 0.012, c[2]], 0.014, 0.01, 0.02, 8);
      cyl(cel("#4fa96c"), [c[0], yy + 0.021, c[2]], 0.012, 0.012, 0.002, 8);
    }
    const dg = at(0.1, -0.03);
    cyl(cel("#fffaf0"), [dg[0], yy + 0.005, dg[2]], 0.03, 0.025, 0.006, 10);
    for (let k = 0; k < 3; k++) ball(k === 0 ? cel("#ff9ec8") : k === 1 ? cel("#fffaf0") : cel("#8fd46a"), [dg[0] + (k - 1) * 0.019, yy + 0.016, dg[2]], 0.0105, {}, 6, 4);
    // cat curled up on the mat corner
    const cat = at(0.02, -0.075);
    const ORANGE = cel("#ffb65c", "#e88a54");
    ball(ORANGE, [cat[0], yy + 0.018, cat[2]], 0.04, { s: [1.25, 0.62, 0.9], ry: 20 }, 8, 5);
    ball(CREAM, [cat[0] + 0.012, yy + 0.026, cat[2] + 0.016], 0.026, { s: [1.2, 0.5, 0.8], ry: 20 }, 6, 4);
    ball(ORANGE, [cat[0] - 0.045, yy + 0.022, cat[2] + 0.012], 0.022, { s: [1, 0.9, 1] }, 7, 5);
    cone(ORANGE, [cat[0] - 0.057, yy + 0.043, cat[2] + 0.003], 0.0075, 0.016, 4);
    cone(ORANGE, [cat[0] - 0.05, yy + 0.043, cat[2] + 0.024], 0.0075, 0.016, 4);
    ball(cel("#ff9ab0"), [cat[0] - 0.064, yy + 0.02, cat[2] + 0.014], 0.004, {}, 4, 3);
    put(BLACK, new THREE.BoxGeometry(0.006, 0.0016, 0.001), [cat[0] - 0.062, yy + 0.03, cat[2] + 0.0035], { ry: 100 });
    put(BLACK, new THREE.BoxGeometry(0.006, 0.0016, 0.001), [cat[0] - 0.056, yy + 0.03, cat[2] + 0.027], { ry: 100 });
    b.sweep(catmull([[cat[0] + 0.04, yy + 0.014, cat[2] + 0.02], [cat[0] + 0.05, yy + 0.012, cat[2] + 0.055], [cat[0] + 0.0, yy + 0.012, cat[2] + 0.062], [cat[0] - 0.035, yy + 0.014, cat[2] + 0.04]]), [0.011, 0.007], { color: ORANGE, bone: base, sides: 5 });
    ball(CREAM, [cat[0] + 0.02, yy + 0.014, cat[2] + 0.06], 0.008, {}, 4, 3);
  }
  // jizo statue with red bib and hat
  {
    const jx = 1.3;
    const jz = 0.22;
    const gy = PLATEAU_R + capH - 0.05;
    cyl(STONE, [jx, gy + 0.012, jz], 0.04, 0.046, 0.026, 6);
    cyl(STONE, [jx, gy + 0.03, jz], 0.03, 0.034, 0.016, 6);
    cyl(STONE_PLAIN, [jx, gy + 0.065, jz], 0.016, 0.026, 0.06, 8);
    ball(STONE_PLAIN, [jx, gy + 0.107, jz], 0.02, {}, 8, 6);
    cone(RED_CLOTH, [jx, gy + 0.138, jz], 0.027, 0.028, 8);
    cyl(RED_CLOTH, [jx, gy + 0.082, jz + 0.005], 0.024, 0.024, 0.012, 8);
    put(BLACK, new THREE.BoxGeometry(0.007, 0.0016, 0.001), [jx - 0.007, gy + 0.109, jz + 0.0185]);
    put(BLACK, new THREE.BoxGeometry(0.007, 0.0016, 0.001), [jx + 0.007, gy + 0.109, jz + 0.0185]);
    cone(GOLD, [jx, gy + 0.098, jz + 0.0215], 0.003, 0.004, 4);
    // small offering cup of petals
    ball(cel("#ffd9e8"), [jx + 0.05, gy + 0.008, jz + 0.03], 0.012, { s: [1, 0.5, 1] }, 5, 3);
  }

  // ema rack of wishing plaques beside the jizo
  {
    const EMA = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24"><g transform="translate(0 24) scale(1 -1)"><path d="M1 24L1 8L10 0L19 8L19 24Z" fill="#d9a05a" stroke="#8a4030" stroke-width="1.4"/><g fill="#ff9ec8">${[0, 1, 2, 3, 4].map((k) => `<ellipse cx="10" cy="11" rx="2.6" ry="3.6" transform="rotate(${k * 72} 10 14)"/>`).join("")}</g><circle cx="10" cy="14" r="1.8" fill="#ffd35a"/><path d="M5 20H15" stroke="#8a4030" stroke-width="1.3"/></g></svg>`,
      { size: 96 },
    );
    const ex = 1.4;
    const ey = PLATEAU_R + capH - 0.05;
    for (const z of [0.42, 0.66]) {
      cyl(WOOD_DARK, [ex, ey + 0.07, z], 0.008, 0.009, 0.14, 6);
      box(WOOD_RED_FLAT, [ex, ey + 0.145, z], [0.022, 0.01, 0.022]);
    }
    rod(WOOD_DARK, [ex, ey + 0.125, 0.4], [ex, ey + 0.125, 0.68], 0.006, 5);
    const emaFrames = [0.45, 0.51, 0.57, 0.63].map((z) => frame([ex, ey + 0.12, z], [0, 1, 0]));
    b.cards(emaFrames, EMA, { size: [0.04, 0.048], lean: 180, flow: [-1, 0, 0], bone: base, sink: 0, cross: false });
  }
  // petals resting on the bridge planks
  {
    const bp: Frame[] = [];
    for (let i = 0; i < 18; i++) {
      const { p } = deckAt(0.08 + (i / 18) * 0.84);
      bp.push(frame([p[0] + (pr() - 0.5) * 0.03, p[1] + 0.002, BZ + (pr() - 0.5) * 0.14], [0, 1, 0]));
    }
    b.cards(bp, PETAL, { size: 0.03, lean: 90, flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)], rng: rng(64), bone: base, sink: 0, mirror: true });
  }

  // koi and lily pads
  const KOI_O = cel("#ff8f3a", "#e0603a");
  const KOI_W = cel("#fffaf0", "#cdbbd8");
  const koi: [number, number, number, number][] = [
    [-0.07, 0.15, 12, 1.0],
    [0.1, -0.12, -30, 0.9],
    [0.0, 0.4, 170, 0.8],
  ];
  koi.forEach(([x, z, ry, s]) => {
    const y = WATER_Y + 0.003;
    ball(KOI_W, [x, y, z], 0.026 * s, { s: [1, 0.55, 2.6], ry }, 7, 4);
    const fx = Math.sin(ry * DEG);
    const fz = Math.cos(ry * DEG);
    ball(KOI_O, [x + fx * 0.004, y + 0.006, z + fz * 0.004], 0.02 * s, { s: [1, 0.5, 1.8], ry }, 6, 3);
    ball(KOI_O, [x - fx * 0.03 * s, y + 0.004, z - fz * 0.03 * s], 0.014 * s, { s: [1, 0.5, 1.6], ry }, 5, 3);
    ball(BLACK, [x + fx * 0.04 * s - fz * 0.01, y + 0.012, z + fz * 0.04 * s + fx * 0.01], 0.004, {}, 4, 3);
    ball(BLACK, [x + fx * 0.04 * s + fz * 0.01, y + 0.012, z + fz * 0.04 * s - fx * 0.01], 0.004, {}, 4, 3);
    cone(KOI_O, [x - fx * 0.085 * s, y + 0.003, z - fz * 0.085 * s], 0.028 * s, 0.05 * s, 4, { q: aim([fx, 0, fz]), s: [1, 0.12, 1] });
    for (const sd of [-1, 1]) cone(KOI_O, [x + fx * 0.012 * s + sd * fz * 0.03, y + 0.002, z + fz * 0.012 * s - sd * fx * 0.03], 0.012 * s, 0.03 * s, 3, { q: aim([fx * 0.5 - sd * fz, 0, fz * 0.5 + sd * fx]), s: [1, 0.12, 1] });
  });
  for (const [x, z, r] of [
    [0.13, 0.05, 0.034],
    [-0.14, -0.1, 0.03],
    [0.18, -0.15, 0.026],
    [-0.1, 0.55, 0.032],
    [0.12, 0.85, 0.03],
  ] as V[]) {
    cyl(cel("#4fb85a"), [x, WATER_Y + 0.003, z], r, r, 0.004, 9);
    cyl(cel("#74d86a"), [x, WATER_Y + 0.0055, z], r * 0.5, r * 0.5, 0.002, 8);
  }
  cone(cel("#ff9ec8"), [0.13, WATER_Y + 0.016, 0.05], 0.012, 0.022, 6);
  cone(cel("#ffd9e8"), [0.135, WATER_Y + 0.02, 0.055], 0.008, 0.02, 5);
  // ripples
  for (const [x, z, r] of [
    [-0.07, 0.15, 0.06],
    [0.1, -0.12, 0.055],
    [0.0, 0.4, 0.05],
  ] as V[]) {
    put(FOAM, new THREE.RingGeometry(r, r + 0.006, 14).rotateX(-Math.PI / 2), [x, WATER_Y + 0.0035, z]);
    put(FOAM, new THREE.RingGeometry(r * 1.55, r * 1.55 + 0.005, 16).rotateX(-Math.PI / 2), [x, WATER_Y + 0.0035, z]);
  }

  // water wheel turning in the stream
  {
    const wy = 0.4;
    const wz = -0.5;
    const wr = 0.2;
    const wj = b.joint("waterWheel", { parent: base, at: [0, wy, wz], role: "hinge" });
    const rimGeos: THREE.BufferGeometry[] = [];
    const paddleGeos: THREE.BufferGeometry[] = [];
    for (const sx of [-0.068, 0.068]) {
      rimGeos.push(xform(new THREE.TorusGeometry(wr, 0.008, 4, 16), [sx, wy, wz], { ry: 90 }));
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI;
        rimGeos.push(xform(new THREE.BoxGeometry(0.01, wr * 2, 0.008), [sx, wy, wz], { rx: a / DEG }));
      }
    }
    rimGeos.push(xform(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), [0, wy, wz], { rz: 90 }));
    rimGeos.push(xform(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 6), [0, wy, wz], { rz: 90 }));
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      paddleGeos.push(xform(new THREE.BoxGeometry(0.15, 0.05, 0.01), [0, wy + Math.cos(a) * (wr - 0.01), wz + Math.sin(a) * (wr - 0.01)], { rx: a / DEG }));
    }
    const rimMerged = flatten(rimGeos);
    const paddleMerged = flatten(paddleGeos);
    if (rimMerged) b.part(rimMerged, WOOD_DARK, { bone: wj, at: [0, 0, 0], flat: true, name: "wheelRim" });
    if (paddleMerged) b.part(paddleMerged, WOOD_LIGHT, { bone: wj, at: [0, 0, 0], flat: true, name: "wheelPaddles" });
    for (let k = 0; k < 4; k++) ball(FOAM, [-0.06 + k * 0.04, WATER_Y + 0.012, wz + 0.1 + (k % 2) * 0.03], 0.016, { s: [1, 0.7, 1] }, 5, 3);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Grass tufts and wild flowers
  const keepOut: [number, number, number][] = [
    [-0.72, 0.6, 0.2],
    [0.68, 0.6, 0.2],
    [-1.02, 0.38, 0.22],
    [-1.27, 0.7, 0.2],
    [-1.27, 0.87, 0.2],
    [-1.27, 1.04, 0.2],
    [-1.12, 0.92, 0.07],
    [-1.4, 0.26, 0.17],
    [0.95, 0.05, 0.14],
    [1.08, 0.7, 0.25],
    [1.3, 0.22, 0.08],
    [-0.47, 0.9, 0.07],
    [0.72, 0.92, 0.07],
    [0.58, 0.3, 0.06],
    [-0.9, 0.7, 0.05],
    [HX, HZ + 0.56, 0.2],
    [HX - 0.34, HZ + 0.52, 0.05],
    [HX + 0.34, HZ + 0.52, 0.05],
    [-1.4, 0.0, 0.05],
    [-0.42, 0.38, 0.12],
    [-0.6, 1.02, 0.12],
    [-1.2, 0.52, 0.1],
  ];
  const free = (x: number, z: number) => {
    if (Math.abs(x - HX) < 0.53 && z > HZ - 0.4 && z < HZ + 0.45) return false;
    return !keepOut.some(([kx, kz, kr]) => (x - kx) ** 2 + (z - kz) ** 2 < kr * kr);
  };
  const capSurface = b.surface([capL, capR]);
  const tufts = capSurface.scatter(330, { rng: rng(71), minDist: 0.055, filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z) });
  b.cards(tufts, GRASS_TUFT, {
    size: [0.055, 0.06],
    lean: 8,
    flow: (_f, i) => [Math.cos(i * 1.3), 0.0, Math.sin(i * 1.3)],
    vary: 0.35,
    rng: rng(72),
    bone: base,
    cross: true,
    sink: 0.15,
  });
  const flowers = capSurface.scatter(110, { rng: rng(73), minDist: 0.1, filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z) });
  b.cards(flowers, FLOWERS, {
    size: [0.035, 0.058],
    lean: 4,
    flow: (_f, i) => [Math.cos(i * 2.1), 0.0, Math.sin(i * 2.1)],
    vary: 0.3,
    rng: rng(74),
    bone: base,
    cross: true,
    sink: 0.1,
  });

  // glowing sparkle motes round the tree and in the mist of the falls
  {
    const SPARKLE = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="#fff3b8"/><path d="M12 6L13.3 10.7L18 12L13.3 13.3L12 18L10.7 13.3L6 12L10.7 10.7Z" fill="#ffffff"/></svg>`,
      { size: 64 },
    );
    const sr = rng(81);
    const fr: Frame[] = [];
    for (let i = 0; i < 34; i++) fr.push(frame([0.25 + sr() * 1.2, 0.6 + sr() * 1.25, -0.4 + sr() * 1.1], [0, 1, 0]));
    for (let i = 0; i < 16; i++) fr.push(frame([-0.2 + sr() * 0.4, 0.35 + sr() * 0.9, -0.74 + sr() * 0.3], [0, 1, 0]));
    glow(
      b.cards(fr, SPARKLE, {
        size: 0.045,
        lean: 0,
        flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
        vary: 0.5,
        rng: rng(82),
        cross: true,
        bone: base,
        sink: 0,
      }),
      1.3,
    );
  }
  flush();
  return b.root;
}
