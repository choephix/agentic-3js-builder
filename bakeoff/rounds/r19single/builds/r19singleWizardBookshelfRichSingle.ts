// A wizard's bookshelf: gothic indigo-and-gold case with a pointed crown, starry back, closed rune cabinet, a hanging
// sign, shelves of tomes, scrolls, glowing orbs and candles, plus floor dressing on a mandala rug.
// High-fantasy anime: toon cel paints (kits/toon), gold filigree, elemental teal glow (kits/glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { DEG, rng } from "../../../../src/math";
import { catmull, spiral } from "../../../../src/path";
import { grain, mottle } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A gothic indigo-and-gold wizard's bookcase with a starry back, rune cabinet, tomes, scrolls, glowing orbs and candles, on a mandala rug with floor clutter.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Geo = THREE.BufferGeometry;
type Col = string | Paint;
type Bucket = { bone: Joint; fill: Col; geos: Geo[]; glow: number; texture?: THREE.Texture };

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const r = rng(11);

  // ------------------------------------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const doorL = b.joint("doorL", { parent: root, at: [0.775, 0.44, 0.215], dir: [0, 1, 0], role: "hinge" });
  const doorR = b.joint("doorR", { parent: root, at: [-0.775, 0.44, 0.215], dir: [0, 1, 0], role: "hinge" });
  const sign = b.joint("signHinge", { parent: root, at: [1.2, 1.925, 0.08], dir: [0, -1, 0], role: "hinge" });

  // ------------------------------------------------------------------------------------------------ palette
  const WHITE = "#ffffff";
  const FLAME = "#ffb340";
  const FLAME_CORE = "#fff3b4";
  const TEAL_GLOW = "#5ff0e0";
  const SPARK = "#a9fff4";
  const GOLD_GLOW = "#ffd35c";
  const EYE_Y = "#ffd54a";

  const INDIGO = cel(mottle("#403c93", "#36327f", { size: 0.1, seed: 2 }));
  const INDIGO_L = cel("#5d55b4");
  const INDIGO_D = cel("#2a2766");
  const NIGHT = cel("#17143a");
  const WOODH = cel(grain("#8a5a42", "#6c4332", { size: 0.012, axis: "x", seed: 4 }));
  const WOODV = cel(grain("#8a5a42", "#6c4332", { size: 0.012, axis: "y", seed: 5 }));
  const GOLD = cel("#ffd35c", "#d28a2a");
  const BRASS = cel("#e0a948", "#a8692a");
  const LEATHER = cel("#7a3f2e");
  const PARCH = cel("#f6e2ae", "#dcb77a");
  const PAGES = cel("#fff2d2", "#e6c99c");
  const SEAL = cel("#d8384c");
  const CORK = cel("#b07b4a");
  const WICKER = cel(grain("#c8924f", "#a56f36", { size: 0.01, axis: "x", seed: 6 }));
  const WICKER_D = cel("#8a5a2c");
  const BASKET_IN = cel("#3b2418");
  const RUG = cel("#7a2d5c");
  const FRINGE = cel("#fff0cf");
  const OWL = cel("#9b7fe0");
  const OWL_W = cel("#6c4cc0");
  const OWL_B = cel("#f7e9ff");
  const HAT = cel("#2f3fa8");
  const BEAK = cel("#ff9c33");

  const COVER_KEYS = ["crimson", "teal", "violet", "emerald", "azure", "amber", "ivory", "plum", "navy"];
  const COVERS: Record<string, Paint> = {
    crimson: cel("#d5405f"),
    teal: cel("#27b5b0"),
    violet: cel("#8b5fd6"),
    emerald: cel("#38a869"),
    azure: cel("#3f84e6"),
    amber: cel("#f0933a"),
    ivory: cel("#efe2c4"),
    plum: cel("#7d3a78"),
    navy: cel("#2d4a9c"),
  };
  const WAX: Record<string, Paint> = {
    cream: cel("#fff6e0", "#ecd3ac"),
    rose: cel("#f7a8c2"),
    teal: cel("#8fe3d6"),
    lav: cel("#c7aaf6"),
  };
  const RIBBONS: Record<string, Paint> = {
    rose: cel("#ef5b84"),
    teal: cel("#2bc4b8"),
    gold: cel("#f6c453"),
    violet: cel("#8b5fd6"),
  };
  const RIB_KEYS = ["rose", "teal", "gold", "violet"];

  // ------------------------------------------------------------------------------------------------ textures
  const GOLDC = "#ffd45e";
  const CREAMC = "#fff0c8";
  const DARKC = "#2a1b4d";
  const spineArt = [
    `<svg viewBox="0 0 30 200"><rect x="0" y="10" width="30" height="6" fill="${GOLDC}"/><rect x="0" y="20" width="30" height="3" fill="${GOLDC}"/><rect x="0" y="177" width="30" height="3" fill="${GOLDC}"/><rect x="0" y="184" width="30" height="6" fill="${GOLDC}"/><path d="M15 66 L26 100 L15 134 L4 100Z" fill="${GOLDC}"/><path d="M15 80 L20 100 L15 120 L10 100Z" fill="${DARKC}"/><circle cx="15" cy="100" r="2.6" fill="#7ff5e6"/></svg>`,
    `<svg viewBox="0 0 30 200"><rect x="0" y="12" width="30" height="7" fill="${GOLDC}"/><rect x="0" y="181" width="30" height="7" fill="${GOLDC}"/><rect x="3" y="58" width="24" height="84" rx="2" fill="${CREAMC}"/><rect x="7" y="70" width="16" height="4" fill="${DARKC}"/><rect x="7" y="82" width="11" height="4" fill="${DARKC}"/><rect x="7" y="94" width="16" height="4" fill="${DARKC}"/><rect x="7" y="106" width="9" height="4" fill="${DARKC}"/><rect x="7" y="118" width="14" height="4" fill="${DARKC}"/></svg>`,
    `<svg viewBox="0 0 30 200"><rect x="0" y="40" width="30" height="4" fill="${GOLDC}"/><rect x="0" y="48" width="30" height="2.5" fill="${GOLDC}"/><rect x="0" y="150" width="30" height="2.5" fill="${GOLDC}"/><rect x="0" y="156" width="30" height="4" fill="${GOLDC}"/><polygon points="15,84 18.2,91.5 26.3,91.9 20,97 22.2,104.9 15,100.4 7.8,104.9 10,97 3.7,91.9 11.8,91.5" fill="${GOLDC}"/><circle cx="15" cy="125" r="3.4" fill="${GOLDC}"/><circle cx="15" cy="70" r="3.4" fill="${GOLDC}"/></svg>`,
    `<svg viewBox="0 0 30 200"><rect x="0" y="14" width="30" height="5" fill="${GOLDC}"/><rect x="0" y="22" width="30" height="3" fill="${GOLDC}"/><path d="M21 76 A14 14 0 1 0 21 112 A10 10 0 1 1 21 76Z" fill="${GOLDC}"/><circle cx="15" cy="135" r="3.4" fill="${CREAMC}"/><circle cx="15" cy="148" r="2.8" fill="${CREAMC}"/><circle cx="15" cy="159" r="2.2" fill="${CREAMC}"/><rect x="0" y="178" width="30" height="8" fill="${GOLDC}"/></svg>`,
    `<svg viewBox="0 0 30 200"><path d="M15 30 C27 50 3 70 15 90 C27 110 3 130 15 150 C27 165 6 175 15 182" stroke="${GOLDC}" stroke-width="3.4" fill="none"/><ellipse cx="22" cy="50" rx="4.5" ry="2.6" fill="${GOLDC}" transform="rotate(-30 22 50)"/><ellipse cx="8" cy="90" rx="4.5" ry="2.6" fill="${GOLDC}" transform="rotate(30 8 90)"/><ellipse cx="22" cy="130" rx="4.5" ry="2.6" fill="${GOLDC}" transform="rotate(-30 22 130)"/><rect x="0" y="8" width="30" height="5" fill="${GOLDC}"/><rect x="0" y="187" width="30" height="5" fill="${GOLDC}"/></svg>`,
    `<svg viewBox="0 0 30 200"><rect x="0" y="14" width="30" height="5" fill="${CREAMC}"/><rect x="0" y="24" width="30" height="5" fill="${CREAMC}"/><rect x="0" y="171" width="30" height="5" fill="${CREAMC}"/><rect x="0" y="181" width="30" height="5" fill="${CREAMC}"/><circle cx="15" cy="100" r="10" fill="#ff6fa0" stroke="${GOLDC}" stroke-width="3.2"/><circle cx="12" cy="96" r="2.6" fill="#ffffff"/><path d="M8 60 L15 70 L22 60 M8 140 L15 130 L22 140" stroke="${GOLDC}" stroke-width="3" fill="none"/></svg>`,
  ];
  const SPINES = spineArt.map((s) => svg(s, { size: 256 }));

  const coverArt = (a: string, c: string) =>
    svg(
      `<svg viewBox="0 0 100 140"><rect x="6" y="6" width="88" height="128" rx="4" fill="none" stroke="${a}" stroke-width="3.5"/><rect x="12" y="12" width="76" height="116" rx="2" fill="none" stroke="${a}" stroke-width="2"/><path d="M6 24 Q24 24 24 6 M94 24 Q76 24 76 6 M6 116 Q24 116 24 134 M94 116 Q76 116 76 134" stroke="${a}" stroke-width="2.8" fill="none"/><circle cx="50" cy="68" r="25" fill="none" stroke="${a}" stroke-width="3.5"/><circle cx="50" cy="68" r="17" fill="none" stroke="${a}" stroke-width="2"/><rect x="38" y="56" width="24" height="24" fill="${c}" transform="rotate(45 50 68)"/><rect x="38" y="56" width="24" height="24" fill="${c}"/><ellipse cx="50" cy="68" rx="9" ry="6" fill="#22112f"/><circle cx="50" cy="68" r="3.4" fill="${a}"/><path d="M34 26 A8 8 0 1 0 34 42 A6 6 0 1 1 34 26Z" fill="${a}" transform="translate(16 -8)"/><path d="M28 112 H72" stroke="${a}" stroke-width="3" fill="none"/><circle cx="36" cy="120" r="2.4" fill="${c}"/><circle cx="50" cy="120" r="2.4" fill="${c}"/><circle cx="64" cy="120" r="2.4" fill="${c}"/></svg>`,
      { size: 256 },
    );
  const TOME_ART = [coverArt("#ffd45e", "#2bd6c6"), coverArt("#e6edff", "#8b5fd6"), coverArt("#ffd45e", "#ff6fa0")];

  const spiralPts = Array.from({ length: 90 }, (_, i) => {
    const a = i * 0.22;
    const rr = 3 + i * 0.3;
    return `${(32 + rr * Math.cos(a)).toFixed(1)} ${(32 + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" L ");
  const SPIRAL = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f3d99a"/><path d="M${spiralPts}" fill="none" stroke="#a8743c" stroke-width="2.6"/></svg>`,
    { size: 128 },
  );

  const orbArt = (top: string, mid: string, bot: string, seed: number) => {
    const rr = rng(seed);
    let stars = "";
    for (let i = 0; i < 16; i++)
      stars += `<circle cx="${(rr() * 256).toFixed(0)}" cy="${(14 + rr() * 100).toFixed(0)}" r="${(2 + rr() * 2).toFixed(1)}" fill="#ffffff"/>`;
    return svg(
      `<svg viewBox="0 0 256 128"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="256" height="128" fill="url(#g)"/><path d="M0 48 Q32 18 64 48 T128 48 T192 48 T256 48" fill="none" stroke="${bot}" stroke-width="8" stroke-opacity="0.55"/><path d="M0 86 Q32 58 64 86 T128 86 T192 86 T256 86" fill="none" stroke="${top}" stroke-width="8" stroke-opacity="0.5"/>${stars}</svg>`,
      { size: 256 },
    );
  };
  const ORB_TEAL = orbArt("#2a8fb8", "#5ff0e0", "#c8fff6", 1);
  const ORB_VIOLET = orbArt("#5a2fb8", "#a782ff", "#e6d9ff", 2);
  const ORB_AMBER = orbArt("#d9701c", "#ffc45a", "#fff2b8", 3);
  const ORB_ROSE = orbArt("#c2307a", "#ff7eb6", "#ffd9ea", 4);
  const ORB_AZURE = orbArt("#2b4fd6", "#6fb4ff", "#e0f2ff", 5);

  const starField = (() => {
    const rr = rng(21);
    let s = "";
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < 70; i++) {
      const x = 4 + rr() * 146;
      const y = 4 + rr() * 168;
      const k = 1.4 + rr() * 2.2;
      if (i < 9) pts.push([x, y]);
      s += `<path d="M${x.toFixed(1)} ${(y - k).toFixed(1)} L${(x + k * 0.28).toFixed(1)} ${(y - k * 0.28).toFixed(1)} L${(x + k).toFixed(1)} ${y.toFixed(1)} L${(x + k * 0.28).toFixed(1)} ${(y + k * 0.28).toFixed(1)} L${x.toFixed(1)} ${(y + k).toFixed(1)} L${(x - k * 0.28).toFixed(1)} ${(y + k * 0.28).toFixed(1)} L${(x - k).toFixed(1)} ${y.toFixed(1)} L${(x - k * 0.28).toFixed(1)} ${(y - k * 0.28).toFixed(1)}Z" fill="${r() < 0.7 ? GOLDC : "#bfe9ff"}"/>`;
    }
    const lines = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const nodes = pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="${CREAMC}"/>`).join("");
    return svg(
      `<svg viewBox="0 0 154 176"><defs><linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17124a"/><stop offset="0.6" stop-color="#2a2373"/><stop offset="1" stop-color="#3f2f8c"/></linearGradient></defs><rect width="154" height="176" fill="url(#n)"/><path d="M118 20 A22 22 0 1 0 118 64 A16 16 0 1 1 118 20Z" fill="${GOLDC}" opacity="0.9"/>${s}<polyline points="${lines}" fill="none" stroke="${GOLDC}" stroke-opacity="0.55" stroke-width="1.4"/>${nodes}</svg>`,
      { size: 512 },
    );
  })();

  const runeArt = (() => {
    let g = "";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 360;
      g += `<g transform="rotate(${a} 50 50)"><path d="M50 12 V26 M44 18 L50 24 L56 18" stroke="${TEAL_GLOW}" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>`;
    }
    return svg(
      `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1d1a52"/><circle cx="50" cy="50" r="44" fill="none" stroke="${TEAL_GLOW}" stroke-width="4"/>${g}<circle cx="50" cy="50" r="14" fill="none" stroke="${TEAL_GLOW}" stroke-width="3.4"/><polygon points="50,38 53,47 62,47 55,53 58,62 50,57 42,62 45,53 38,47 47,47" fill="${CREAMC}"/></svg>`,
      { size: 256 },
    );
  })();

  const parchmentArt = svg(
    `<svg viewBox="0 0 60 90"><path d="M2 0 H58 V80 L52 86 L46 80 L38 88 L30 81 L22 87 L14 80 L7 86 L2 80Z" fill="#f6e2ae" stroke="#b98a52" stroke-width="1.6"/><path d="M8 12 H52 M8 20 H46 M8 28 H52 M8 36 H40" stroke="#6b4a2e" stroke-width="2.2" stroke-dasharray="4 2 7 2 3 2" fill="none"/><circle cx="30" cy="56" r="14" fill="none" stroke="#6b4a2e" stroke-width="2.2"/><polygon points="30,45 40,62 20,62" fill="none" stroke="#2f6fd0" stroke-width="2.2"/><circle cx="30" cy="76" r="4.6" fill="#d8384c"/></svg>`,
    { size: 256 },
  );
  const pageArt = svg(
    `<svg viewBox="0 0 60 100"><rect width="60" height="100" fill="#f9e9bd"/><path d="M6 12 H54 M6 20 H50 M6 28 H54 M6 36 H44 M6 72 H54 M6 80 H48 M6 88 H52" stroke="#6b4a2e" stroke-width="2.2" stroke-dasharray="5 2 8 2 3 2" fill="none"/><circle cx="30" cy="54" r="10" fill="none" stroke="#2f6fd0" stroke-width="2.4"/><circle cx="30" cy="54" r="3.4" fill="#d8384c"/><rect x="6" y="6" width="9" height="9" fill="#d8384c"/></svg>`,
    { size: 256 },
  );
  const signArt = svg(
    `<svg viewBox="0 0 100 64"><path d="M50 52 Q30 42 10 48 L10 22 Q30 16 50 26Z" fill="${CREAMC}" stroke="${GOLDC}" stroke-width="2.4"/><path d="M50 52 Q70 42 90 48 L90 22 Q70 16 50 26Z" fill="${CREAMC}" stroke="${GOLDC}" stroke-width="2.4"/><path d="M16 30 Q30 26 44 32 M16 38 Q30 34 44 40 M56 32 Q70 26 84 30 M56 40 Q70 34 84 38" stroke="${DARKC}" stroke-width="2.4" fill="none"/><path d="M50 4 A9 9 0 1 0 50 22 A6.5 6.5 0 1 1 50 4Z" fill="${GOLDC}"/><circle cx="22" cy="10" r="3" fill="${GOLDC}"/><circle cx="78" cy="10" r="3" fill="${GOLDC}"/><circle cx="62" cy="14" r="2.2" fill="${CREAMC}"/></svg>`,
    { size: 256 },
  );
  const rugArt = (() => {
    let tri = "";
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * 360;
      tri += `<polygon points="100,16 104.5,28 95.5,28" fill="${GOLDC}" transform="rotate(${a} 100 100)"/>`;
    }
    let star = "";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rad = i % 2 === 0 ? 50 : 22;
      star += `${(100 + rad * Math.sin(a)).toFixed(1)},${(100 - rad * Math.cos(a)).toFixed(1)} `;
    }
    return svg(
      `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="99" fill="#8c2f63"/><circle cx="100" cy="100" r="95" fill="none" stroke="${GOLDC}" stroke-width="3"/><circle cx="100" cy="100" r="84" fill="#2d2a7a"/>${tri}<circle cx="100" cy="100" r="68" fill="none" stroke="${CREAMC}" stroke-width="2.5"/><circle cx="100" cy="100" r="62" fill="#8c2f63"/><polygon points="${star}" fill="#27b5b0" stroke="${GOLDC}" stroke-width="2"/><circle cx="100" cy="100" r="17" fill="${CREAMC}"/><path d="M104 88 A13 13 0 1 0 104 112 A9.5 9.5 0 1 1 104 88Z" fill="#2d2a7a"/></svg>`,
      { size: 512 },
    );
  })();

  // ------------------------------------------------------------------------------------------------ geometry helpers
  const mat = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG)),
      new THREE.Vector3(1, 1, 1),
    );
  const xf = (g: Geo, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Geo =>
    g.applyMatrix4(mat(x, y, z, rx, ry, rz));
  const gm = (gs: Geo[], m: THREE.Matrix4): Geo[] => gs.map((g) => g.applyMatrix4(m));
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Geo =>
    xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
  const cyl = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Geo =>
    xf(new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz);
  const ball = (
    rad: number,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = 1,
    sz = 1,
    seg = 7,
    rx = 0,
    ry = 0,
    rz = 0,
  ): Geo => xf(new THREE.SphereGeometry(rad, seg, Math.max(3, Math.round(seg * 0.7))).scale(sx, sy, sz), x, y, z, rx, ry, rz);
  const torus = (
    R: number,
    tube: number,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0,
    seg = 16,
    tseg = 5,
    arc = Math.PI * 2,
  ): Geo => xf(new THREE.TorusGeometry(R, tube, tseg, seg, arc), x, y, z, rx, ry, rz);
  const lat = (pts: number[][], seg: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Geo =>
    xf(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg), x, y, z, rx, ry, rz);
  const plane = (w: number, h: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Geo =>
    xf(new THREE.PlaneGeometry(w, h), x, y, z, rx, ry, rz);
  const circ = (rad: number, seg: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Geo =>
    xf(new THREE.CircleGeometry(rad, seg), x, y, z, rx, ry, rz);

  // ------------------------------------------------------------------------------------------------ merge buckets
  const buckets = new Map<string, Bucket>();
  const put = (
    key: string,
    fill: Col,
    geo: Geo | Geo[],
    opts: { bone?: Joint; glow?: number; texture?: THREE.Texture } = {},
  ) => {
    let bk = buckets.get(key);
    if (!bk) {
      bk = { bone: opts.bone ?? root, fill, geos: [], glow: opts.glow ?? 0, texture: opts.texture };
      buckets.set(key, bk);
    }
    if (Array.isArray(geo)) bk.geos.push(...geo);
    else bk.geos.push(geo);
  };
  const flush = () => {
    for (const [key, bk] of buckets) {
      const parts = bk.geos.map((g) => (g.index ? g.toNonIndexed() : g));
      const merged = mergeGeometries(parts);
      if (!merged) throw new Error(`wizardBookshelf: could not merge bucket ${key}`);
      const p = b.part(merged, bk.fill, { bone: bk.bone, at: [0, 0, 0], name: key, texture: bk.texture });
      if (bk.glow > 0) glow(p, bk.glow);
    }
  };

  // ------------------------------------------------------------------------------------------------ dressing helpers
  const T = [0.72, 1.16, 1.6, 2.04];
  const FRONT = 0.15;

  const book = (
    key: string,
    x: number,
    y: number,
    z: number,
    t: number,
    h: number,
    d: number,
    tex: number,
    rz = 0,
    ry = 0,
    lying = false,
  ) => {
    const lift = (t / 2) * Math.sin(Math.abs(rz) * DEG);
    const m = lying ? mat(x + h / 2, y + t / 2, z, 0, ry, 90) : mat(x, y + lift, z, 0, ry, rz);
    put(
      `cover_${key}`,
      COVERS[key] as Paint,
      gm(
        [
          box(0.006, h, d, -t / 2 + 0.003, h / 2, 0),
          box(0.006, h, d, t / 2 - 0.003, h / 2, 0),
          box(t, h, 0.008, 0, h / 2, d / 2 - 0.004),
        ],
        m,
      ),
    );
    put("pages", PAGES, box(t - 0.012, h - 0.012, d - 0.016, 0, h / 2, -0.004).applyMatrix4(m));
    put(`spine${tex}`, WHITE, plane(t * 0.97, h * 0.97, 0, h / 2, d / 2 + 0.002).applyMatrix4(m), {
      texture: SPINES[tex] as THREE.Texture,
    });
  };

  const row = (x0: number, x1: number, y: number, hmax: number): number => {
    let x = x0;
    let n = 0;
    while (n < 40) {
      const t = 0.03 + r() * 0.032;
      const gap = n > 2 && r() < 0.1 ? 0.09 : 0;
      if (x + gap + t > x1) break;
      const lean = gap > 0 ? 11 + r() * 5 : 0;
      const h = hmax * (0.7 + r() * 0.3);
      const d = 0.19 + r() * 0.05;
      const key = COVER_KEYS[Math.floor(r() * COVER_KEYS.length)] as string;
      x += gap;
      book(key, x + t / 2, y, FRONT - d / 2 + (r() - 0.5) * 0.012, t, h, d, Math.floor(r() * SPINES.length), lean, 0);
      x += t + 0.0015;
      n++;
    }
    return x;
  };

  const tome = (key: string, acc: number, cx: number, y: number, cz: number, W: number, D: number, H: number, ry: number) => {
    const m = mat(cx, y, cz, 0, ry, 0);
    put(
      `cover_${key}`,
      COVERS[key] as Paint,
      gm([box(W, 0.012, D, 0, H - 0.006, 0), box(W, 0.012, D, 0, 0.006, 0), box(0.02, H, D, -W / 2 + 0.01, H / 2, 0)], m),
    );
    put("pages", PAGES, box(W - 0.034, H - 0.022, D - 0.016, 0.008, H / 2, 0).applyMatrix4(m));
    const gold: Geo[] = [];
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        for (const yy of [H - 0.006, 0.006]) gold.push(box(0.04, 0.016, 0.04, sx * (W / 2 - 0.016), yy, sz * (D / 2 - 0.016)));
    for (const zz of [-0.32, 0, 0.32]) gold.push(box(0.026, H + 0.006, 0.012, -W / 2 + 0.01, H / 2, zz * D));
    gold.push(box(0.012, H * 0.7, 0.05, W / 2 + 0.004, H / 2, 0));
    put("gold", GOLD, gm(gold, m));
    put("leather", LEATHER, box(0.016, H + 0.01, 0.036, W / 2 - 0.004, H / 2, 0).applyMatrix4(m));
    put(`tomeArt${acc}`, WHITE, plane(W * 0.84, D * 0.84, 0.012, H + 0.0015, 0, -90, 0, 0).applyMatrix4(m), {
      texture: TOME_ART[acc] as THREE.Texture,
    });
    put("gemTeal", TEAL_GLOW, ball(0.013, 0.012, H + 0.004, 0, 1, 0.6, 1, 6).applyMatrix4(m), { glow: 1.2 });
  };

  const stack = (x: number, y: number, z: number, specs: Array<[number, number, number, number, string, number]>): number => {
    let top = y;
    specs.forEach(([W, D, H, ry, key, acc], i) => {
      tome(key, acc, x + (i % 2 === 0 ? -0.006 : 0.008), top, z, W, D, H, ry);
      top += H;
    });
    return top;
  };

  const scroll = (x: number, y: number, z: number, rad: number, len: number, rx: number, ry: number, rz: number, rib: string) => {
    const m = mat(x, y, z, rx, ry, rz);
    put("scrollP", PARCH, cyl(rad, rad, len, 10, 0, 0, 0).applyMatrix4(m));
    put(
      "spiralCap",
      WHITE,
      gm([circ(rad * 0.99, 10, 0, len / 2 + 0.0016, 0, -90, 0, 0), circ(rad * 0.99, 10, 0, -len / 2 - 0.0016, 0, 90, 0, 0)], m),
      { texture: SPIRAL },
    );
    put(
      "brass",
      BRASS,
      gm([cyl(0.005, 0.005, len + 0.05, 6, 0, 0, 0), ball(0.011, 0, len / 2 + 0.027, 0, 1, 1, 1, 6), ball(0.011, 0, -len / 2 - 0.027, 0, 1, 1, 1, 6)], m),
    );
    put(`rib_${rib}`, RIBBONS[rib] as Paint, cyl(rad * 1.12, rad * 1.12, 0.022, 10, 0, len * 0.2, 0).applyMatrix4(m));
    put("seal", SEAL, ball(0.011, 0, len * 0.2, rad * 1.12, 1, 1, 0.5, 6).applyMatrix4(m));
  };
  // A scroll whose axis points along `d`, starting at `base`.
  const scrollDir = (base: THREE.Vector3, d: THREE.Vector3, rad: number, len: number, rib: string) => {
    const dn = d.clone().normalize();
    const rz = -Math.asin(dn.x) / DEG;
    const rx = Math.atan2(dn.z, dn.y) / DEG;
    const c = base.clone().addScaledVector(dn, len / 2);
    scroll(c.x, c.y, c.z, rad, len, rx, 0, rz, rib);
  };

  const candle = (x: number, y: number, z: number, h: number, rad: number, wax: string): number => {
    put(`wax_${wax}`, WAX[wax] as Paint, [
      cyl(rad * 0.95, rad, h, 8, x, y + h / 2, z),
      cyl(rad * 1.35, rad * 1.5, 0.008, 8, x, y + 0.004, z),
    ]);
    const drips: Geo[] = [];
    for (let i = 0; i < 3; i++) {
      const a = r() * Math.PI * 2;
      const l = 0.025 + r() * 0.04;
      const dx = Math.cos(a) * rad * 0.95;
      const dz = Math.sin(a) * rad * 0.95;
      drips.push(cyl(0.004, 0.0035, l, 5, x + dx, y + h - l / 2, z + dz));
      drips.push(ball(0.0058, x + dx, y + h - l, z + dz, 1, 1.2, 1, 6));
    }
    put(`wax_${wax}`, WAX[wax] as Paint, drips);
    put("wick", INK, box(0.003, 0.014, 0.003, x, y + h + 0.007, z));
    put("flame", FLAME, lat([[0, 0], [0.011, 0.008], [0.0125, 0.02], [0.008, 0.034], [0, 0.052]], 6, x, y + h + 0.004, z), {
      glow: 1.4,
    });
    put("flameCore", FLAME_CORE, lat([[0, 0], [0.006, 0.006], [0.007, 0.014], [0.004, 0.024], [0, 0.032]], 6, x, y + h + 0.005, z), {
      glow: 2,
    });
    return y + h;
  };

  const dish = (x: number, y: number, z: number, R: number): number => {
    put("brass", BRASS, [
      lat([[0, 0], [R, 0], [R + 0.006, 0.006], [R * 0.82, 0.014], [0, 0.014]], 10, x, y, z),
      torus(0.02, 0.004, x + R + 0.014, y + 0.008, z, 0, 0, 0, 10, 4),
    ]);
    return y + 0.014;
  };
  const cup = (x: number, y: number, z: number): number => {
    put("brass", BRASS, lat([[0, 0], [0.016, 0], [0.026, 0.014], [0.022, 0.02], [0, 0.014]], 8, x, y, z));
    return y + 0.014;
  };

  const shine = (cx: number, cy: number, cz: number, R: number) => {
    const D = new THREE.Vector3(-0.42, 0.52, 0.74).normalize();
    const psi = Math.asin(D.x);
    const phi = -Math.asin(D.y / Math.cos(psi));
    const D2 = new THREE.Vector3(0.5, -0.5, 0.7).normalize();
    put(
      "shine",
      WHITE,
      [
        xf(
          new THREE.SphereGeometry(R * 0.2, 6, 4).scale(1.3, 0.8, 0.3),
          cx + D.x * R * 0.94,
          cy + D.y * R * 0.94,
          cz + D.z * R * 0.94,
          phi / DEG,
          psi / DEG,
          0,
        ),
        ball(R * 0.07, cx + D2.x * R * 0.96, cy + D2.y * R * 0.96, cz + D2.z * R * 0.96, 1, 1, 1, 5),
      ],
      { glow: 1 },
    );
  };

  let orbCount = 0;
  const orb = (x: number, y: number, z: number, R: number, tex: THREE.Texture, standH: number): number => {
    put("brass", BRASS, [
      lat(
        [
          [0, 0],
          [R * 0.95, 0],
          [R * 0.95, 0.01],
          [R * 0.6, 0.022],
          [R * 0.34, 0.034],
          [R * 0.34, standH - 0.02],
          [R * 0.7, standH - 0.01],
          [R * 0.82, standH + 0.004],
          [R * 0.6, standH + 0.002],
          [0, standH - 0.004],
        ],
        10,
        x,
        y,
        z,
      ),
      torus(R * 0.78, 0.0045, x, y + standH, z, 90, 0, 0, 12, 4),
    ]);
    const cy = y + standH + R * 0.78;
    orbCount++;
    glow(b.part(new THREE.SphereGeometry(R, 14, 10), WHITE, { bone: root, at: [x, cy, z], texture: tex, name: `orb${orbCount}` }), 1);
    shine(x, cy, z, R);
    return cy + R;
  };

  const flask = (x: number, y: number, z: number, s: number, liq: string, key: string) => {
    const prof = [[0, 0], [0.026, 0.002], [0.04, 0.016], [0.046, 0.04], [0.04, 0.066], [0.024, 0.082], [0.014, 0.096], [0.014, 0.122], [0.019, 0.128], [0, 0.128]].map(
      (p) => [(p[0] as number) * s, (p[1] as number) * s],
    );
    put(`liq_${key}`, liq, lat(prof, 8, x, y, z), { glow: 0.9 });
    put("cork", CORK, cyl(0.015 * s, 0.012 * s, 0.034 * s, 7, x, y + 0.145 * s, z));
    put("seal", SEAL, ball(0.011 * s, x, y + 0.126 * s, z + 0.012 * s, 1, 0.8, 1, 5));
    put("scrollP", PARCH, box(0.05 * s, 0.036 * s, 0.004, x, y + 0.045 * s, z + 0.0475 * s));
    put("shine", WHITE, ball(0.008 * s, x - 0.022 * s, y + 0.058 * s, z + 0.034 * s, 0.6, 1.6, 0.5, 5), { glow: 1 });
  };

  const candelabra = (x: number, y: number, z: number, H: number, radii: number[], ch: number, wax: string[]) => {
    const top = y + H;
    put("brass", BRASS, [
      lat(
        [
          [0, 0],
          [0.085, 0],
          [0.09, 0.012],
          [0.06, 0.03],
          [0.03, 0.06],
          [0.014, 0.09],
          [0.014, H * 0.5 - 0.02],
          [0.026, H * 0.5],
          [0.014, H * 0.5 + 0.02],
          [0.014, H - 0.03],
          [0.022, H - 0.02],
          [0.014, H - 0.008],
          [0, H],
        ],
        8,
        x,
        y,
        z,
      ),
      ball(0.024, x, y + H * 0.5, z, 1, 1, 1, 8),
      ball(0.028, x, y + H * 0.22, z, 1, 0.8, 1, 8),
    ]);
    const spots: Array<[number, number]> = [[x, 0]];
    for (const R of radii)
      for (const s of [1, -1]) {
        put("brass", BRASS, torus(R, 0.007, x, top - R + R, z, 0, 0, s > 0 ? -90 : 180, 12, 5, Math.PI / 2));
        spots.push([x + s * R, 0]);
      }
    spots.forEach(([cx], i) => {
      const cy = cup(cx, top, z);
      candle(cx, cy, z, ch * (i === 0 ? 1.25 : 1 - (i % 3) * 0.1), 0.014, wax[i % wax.length] as string);
    });
  };

  // ================================================================================================ CASE
  // plinth
  put("plinth", INDIGO_D, [box(1.92, 0.07, 0.54, 0, 0.035, 0.03), box(1.82, 0.09, 0.46, 0, 0.115, 0.01)]);
  put("gold", GOLD, [box(1.84, 0.014, 0.012, 0, 0.12, 0.243), box(1.94, 0.01, 0.01, 0, 0.07, 0.302)]);

  // sides, back
  for (const s of [1, -1]) {
    put("side", INDIGO, box(0.06, 2.3, 0.4, s * 0.8, 1.31, 0));
    put("sideIn", INDIGO_L, box(0.01, 1.92, 0.3, s * 0.835, 1.31, 0));
    put("gold", GOLD, [
      box(0.012, 0.014, 0.32, s * 0.838, 0.35, 0),
      box(0.012, 0.014, 0.32, s * 0.838, 2.27, 0),
      box(0.012, 1.94, 0.014, s * 0.838, 1.31, 0.16),
      box(0.012, 1.94, 0.014, s * 0.838, 1.31, -0.16),
      box(0.012, 0.12, 0.12, s * 0.842, 1.31, 0, 45, 0, 0),
      box(0.012, 0.08, 0.08, s * 0.842, 0.8, 0, 45, 0, 0),
      box(0.012, 0.08, 0.08, s * 0.842, 1.82, 0, 45, 0, 0),
    ]);
    put("gemTeal", TEAL_GLOW, [ball(0.026, s * 0.845, 1.31, 0, 0.5, 1, 1, 6), ball(0.017, s * 0.845, 0.8, 0, 0.5, 1, 1, 6), ball(0.017, s * 0.845, 1.82, 0, 0.5, 1, 1, 6)], { glow: 1.2 });
  }
  put("back", INDIGO_D, box(1.54, 2.3, 0.03, 0, 1.31, -0.185));
  put("stars", WHITE, plane(1.54, 1.74, 0, 1.59, -0.168), { texture: starField });
  put("cabDark", NIGHT, box(1.54, 0.52, 0.02, 0, 0.44, 0.19));

  // shelves
  T.forEach((ti, i) => {
    put("shelf", WOODH, box(1.54, 0.04, 0.4, 0, ti - 0.02, 0));
    put("gold", GOLD, box(1.54, 0.016, 0.01, 0, ti - 0.02, 0.204));
    if (i > 0) {
      const teeth: Geo[] = [];
      for (let k = 0; k < 20; k++) teeth.push(box(0.03, 0.03, 0.008, -0.71 + k * 0.0748, ti - 0.058, 0.2, 0, 0, 45));
      put("gold", GOLD, teeth);
    }
  });
  put("shelf", WOODH, [box(0.028, 0.4, 0.36, -0.25, T[1] + 0.2, 0), box(0.028, 0.39, 0.36, 0.43, T[3] + 0.195, 0)]);
  put("gold", GOLD, [box(0.03, 0.01, 0.37, -0.25, T[1] + 0.4, 0), box(0.03, 0.01, 0.37, 0.43, T[3] + 0.39, 0)]);

  // cornice, ceiling board
  put("shelf", WOODH, box(1.54, 0.06, 0.4, 0, 2.46, 0));
  put("cornice", INDIGO, box(1.96, 0.07, 0.52, 0, 2.525, 0.03));
  put("gold", GOLD, [box(1.98, 0.016, 0.012, 0, 2.5, 0.296), box(1.98, 0.01, 0.54, 0, 2.565, 0.03)]);
  const dentils: Geo[] = [];
  for (let k = 0; k < 29; k++) dentils.push(box(0.034, 0.025, 0.02, -0.91 + k * 0.065, 2.478, 0.28));
  put("fringe", FRINGE, dentils);

  // columns and vines
  const CH = 2.33;
  const colProfile = [
    [0, 0],
    [0.07, 0],
    [0.07, 0.04],
    [0.055, 0.07],
    [0.05, 0.12],
    [0.05, CH - 0.14],
    [0.06, CH - 0.1],
    [0.075, CH - 0.06],
    [0.075, CH],
    [0, CH],
  ];
  for (const s of [1, -1]) {
    put("column", INDIGO_L, lat(colProfile, 10, s * 0.84, 0.16, 0.205));
    put("gold", GOLD, [
      torus(0.058, 0.008, s * 0.84, 0.2, 0.205, 90, 0, 0, 14, 4),
      torus(0.058, 0.008, s * 0.84, 0.16 + CH - 0.15, 0.205, 90, 0, 0, 14, 4),
      torus(0.08, 0.008, s * 0.84, 0.16 + CH - 0.02, 0.205, 90, 0, 0, 14, 4),
    ]);
    b.sweep(
      spiral([s * 0.84, 0.3, 0.205], [s * 0.84 + 0.058, 0.3, 0.205], [0, 1, 0], { turns: 5.5, r1: 0.058, pitch: 0.36 }),
      0.007,
      { color: GOLD, bone: root, sides: 5, name: `vine${s > 0 ? "L" : "R"}` },
    );
    // pinnacles on the cornice
    for (const sz of [1, -1])
      put("gold", GOLD, [
        lat([[0, 0], [0.045, 0], [0.045, 0.025], [0.028, 0.045], [0.03, 0.11], [0.042, 0.125], [0, 0.23]], 8, s * 0.93, 2.57, sz * 0.2),
        ball(0.018, s * 0.93, 2.57 + 0.245, sz * 0.2, 1, 1, 1, 6),
      ]);
  }

  // crown
  const CR: Array<[number, number]> = [
    [0.88, 0.056],
    [0.74, 0.08],
    [0.58, 0.112],
    [0.44, 0.176],
    [0.33, 0.256],
    [0.22, 0.32],
    [0.12, 0.384],
    [0.05, 0.464],
  ];
  const crownOutline: OutlinePoint[] = [
    [-0.9, 0, "sharp"],
    [0.9, 0, "sharp"],
    ...CR.map(([x, y]): OutlinePoint => [x, y]),
    [0, 0.51, "sharp"],
    ...[...CR].reverse().map(([x, y]): OutlinePoint => [-x, y]),
  ];
  b.extrude(crownOutline, { at: [0, 2.57, 0], x: [1, 0, 0], thickness: 0.05, bevel: 0.008, smoothing: 1, color: INDIGO, bone: root, name: "crown" });
  const rim: number[][] = [
    ...CR.map(([x, y]) => [-x * 0.93, 2.57 + y - 0.035, 0.031]),
    [0, 2.57 + 0.51 - 0.05, 0.031],
    ...[...CR].reverse().map(([x, y]) => [x * 0.93, 2.57 + y - 0.035, 0.031]),
  ];
  b.sweep(catmull(rim), 0.008, { color: GOLD, bone: root, sides: 5, name: "crownRim" });
  CR.forEach(([x, y], i) => {
    if (i === 0) return;
    for (const s of [1, -1]) put("gold", GOLD, cyl(0, 0.02, 0.055, 6, s * x, 2.57 + y + 0.018, 0, 0, 0, -s * 35));
  });
  const crescent = (R: number): OutlinePoint[] => {
    const tip = 65 * DEG;
    const c = 0.4 * R;
    const tx = R * Math.cos(tip);
    const ty = R * Math.sin(tip);
    const ri = Math.hypot(tx - c, ty);
    const phi = Math.atan2(ty, tx - c);
    const pts: OutlinePoint[] = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const a = tip + ((2 * Math.PI - 2 * tip) * i) / n;
      pts.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    for (let i = 1; i < n; i++) {
      const a = 2 * Math.PI - phi - ((2 * Math.PI - 2 * phi) * i) / n;
      pts.push([c + ri * Math.cos(a), ri * Math.sin(a)]);
    }
    return pts;
  };
  const starOutline = (Ro: number, Ri: number, n: number): OutlinePoint[] =>
    Array.from({ length: n * 2 }, (_, i): OutlinePoint => {
      const a = (i / (n * 2)) * Math.PI * 2;
      const rad = i % 2 === 0 ? Ro : Ri;
      return [rad * Math.sin(a), rad * Math.cos(a), "sharp"];
    });
  b.extrude(crescent(0.1), { at: [-0.03, 2.57 + 0.2, 0.026], x: [1, 0, 0], thickness: 0.012, color: GOLD, bone: root, name: "crownMoon" });
  b.extrude(starOutline(0.045, 0.018, 4), { at: [0.1, 2.57 + 0.2, 0.026], x: [1, 0, 0], thickness: 0.012, color: GOLD, bone: root, name: "crownStar" });
  put("gold", GOLD, [lat([[0, 0], [0.04, 0], [0.03, 0.03], [0.012, 0.045], [0, 0.045]], 8, 0, 2.57 + 0.5, 0), torus(0.034, 0.006, 0, 2.57 + 0.5, 0, 90, 0, 0, 10, 4)]);
  put("gemTeal", TEAL_GLOW, [ball(0.042, 0, 2.57 + 0.56, 0, 1, 1.15, 1, 8)], { glow: 1.4 });
  put("sparkle", SPARK, [
    xf(new THREE.OctahedronGeometry(0.014, 0), 0.07, 2.57 + 0.64, 0.02, 0, 20, 0),
    xf(new THREE.OctahedronGeometry(0.01, 0), -0.08, 2.57 + 0.6, -0.02, 0, 50, 0),
    xf(new THREE.OctahedronGeometry(0.008, 0), 0.02, 2.57 + 0.72, 0.01, 0, 10, 0),
  ], { glow: 1.2 });

  // ================================================================================================ CABINET DOORS
  for (const s of [1, -1]) {
    const bone = s > 0 ? doorL : doorR;
    const tag = s > 0 ? "L" : "R";
    const cx = s * 0.39;
    put(`doorBody${tag}`, INDIGO, box(0.76, 0.52, 0.025, cx, 0.44, 0.2125), { bone });
    put(`doorPanel${tag}`, INDIGO_L, box(0.6, 0.36, 0.012, cx, 0.44, 0.2275), { bone });
    const fr: Geo[] = [
      box(0.624, 0.014, 0.008, cx, 0.627, 0.2285),
      box(0.624, 0.014, 0.008, cx, 0.253, 0.2285),
      box(0.014, 0.388, 0.008, cx + 0.305, 0.44, 0.2285),
      box(0.014, 0.388, 0.008, cx - 0.305, 0.44, 0.2285),
    ];
    for (const sx of [-1, 1]) for (const yy of [0.253, 0.627]) fr.push(box(0.03, 0.03, 0.01, cx + sx * 0.305, yy, 0.23, 0, 0, 45));
    put(`doorGold${tag}`, GOLD, fr, { bone });
    const metal: Geo[] = [
      box(0.26, 0.04, 0.008, s * 0.645, 0.665, 0.2285),
      box(0.26, 0.04, 0.008, s * 0.645, 0.215, 0.2285),
      cyl(0.016, 0.016, 0.07, 8, s * 0.775, 0.665, 0.215),
      cyl(0.016, 0.016, 0.07, 8, s * 0.775, 0.215, 0.215),
      torus(0.03, 0.006, s * 0.075, 0.44, 0.246, 0, 0, 0, 14, 4),
      ball(0.02, s * 0.075, 0.47, 0.238, 1, 1, 0.6, 7),
    ];
    for (const xx of [0.56, 0.64, 0.72])
      for (const yy of [0.665, 0.215]) metal.push(ball(0.008, s * xx, yy, 0.234, 1, 1, 0.7, 5));
    put(`doorMetal${tag}`, BRASS, metal, { bone });
    put(`rune${tag}`, WHITE, plane(0.2, 0.2, cx, 0.44, 0.2345), { bone, glow: 1, texture: runeArt });
    if (s < 0) {
      put("lockPlate", BRASS, [box(0.05, 0.1, 0.008, s * 0.075, 0.56, 0.236)], { bone });
      put("keyhole", INK, [cyl(0.007, 0.007, 0.004, 6, s * 0.075, 0.57, 0.24, 90, 0, 0), box(0.006, 0.022, 0.004, s * 0.075, 0.55, 0.24)], { bone });
    }
  }

  // hanging parchment over the cabinet
  put("scrollP", PARCH, cyl(0.018, 0.018, 0.24, 8, 0.64, 0.74, 0.23, 0, 0, 90));
  put("brass", BRASS, [cyl(0.006, 0.006, 0.28, 6, 0.64, 0.74, 0.23, 0, 0, 90), ball(0.012, 0.785, 0.74, 0.23, 1, 1, 1, 6), ball(0.012, 0.495, 0.74, 0.23, 1, 1, 1, 6)]);
  put("parchHang", WHITE, plane(0.2, 0.3, 0.64, 0.58, 0.243), { texture: parchmentArt });

  // ================================================================================================ TIER 1
  {
    const y0 = T[0] as number;
    row(-0.76, -0.24, y0, 0.34);
    orb(-0.04, y0, 0.03, 0.085, ORB_VIOLET, 0.05);
    // scroll rack
    put("rack", WOODV, [
      box(0.32, 0.012, 0.22, 0.3, y0 + 0.006, 0.04),
      box(0.014, 0.19, 0.2, 0.3 - 0.135, y0 + 0.095, 0.04),
      box(0.014, 0.19, 0.2, 0.3 + 0.135, y0 + 0.095, 0.04),
    ]);
    put("gold", GOLD, [box(0.284, 0.012, 0.012, 0.3, y0 + 0.19, 0.145), ball(0.012, 0.165, y0 + 0.19, 0.145, 1, 1, 1, 6), ball(0.012, 0.435, y0 + 0.19, 0.145, 1, 1, 1, 6)]);
    const layout: Array<[number, number]> = [
      [-0.093, 0],
      [-0.031, 0],
      [0.031, 0],
      [0.093, 0],
      [-0.062, 1],
      [0, 1],
      [0.062, 1],
      [-0.031, 2],
      [0.031, 2],
    ];
    layout.forEach(([dx, row2], i) => {
      scroll(0.3 + dx, y0 + 0.012 + 0.03 + row2 * 0.0537, 0.04, 0.03, 0.24, 90, 0, 0, RIB_KEYS[i % RIB_KEYS.length] as string);
    });
    // candle on a stack of tomes
    const top = stack(0.6, y0, 0.03, [
      [0.27, 0.19, 0.045, 6, "crimson", 0],
      [0.24, 0.18, 0.04, -9, "ivory", 1],
      [0.21, 0.17, 0.04, 8, "navy", 2],
    ]);
    const cy = dish(0.6, top, 0.03, 0.045);
    candle(0.6, cy, 0.03, 0.15, 0.016, "cream");
  }

  // ================================================================================================ TIER 2
  {
    const y0 = T[1] as number;
    row(-0.76, -0.28, y0, 0.35);
    orb(-0.13, y0, 0.04, 0.055, ORB_AMBER, 0.04);
    orb(0.04, y0, 0.04, 0.07, ORB_ROSE, 0.06);
    orb(0.2, y0, 0.04, 0.055, ORB_TEAL, 0.04);
    const top = stack(0.46, y0, 0.03, [
      [0.36, 0.24, 0.05, 4, "violet", 1],
      [0.33, 0.22, 0.045, -7, "emerald", 0],
      [0.3, 0.21, 0.045, 9, "amber", 2],
      [0.26, 0.2, 0.04, -4, "plum", 1],
    ]);
    scroll(0.46, top + 0.022, 0.03, 0.022, 0.26, 0, 8, -90, "teal");
    const cy = dish(0.7, y0, 0.04, 0.04);
    candle(0.7, cy, 0.04, 0.22, 0.02, "rose");
  }

  // ================================================================================================ TIER 3
  {
    const y0 = T[2] as number;
    row(-0.76, -0.34, y0, 0.36);
    // armillary sphere
    const ax = -0.15;
    const ay = y0 + 0.2;
    put("brass", BRASS, [
      lat([[0, 0], [0.09, 0], [0.09, 0.012], [0.05, 0.03], [0.02, 0.05], [0.02, 0.075], [0.045, 0.09], [0, 0.092]], 10, ax, y0, 0.03),
      cyl(0.006, 0.006, 0.34, 6, ax, ay, 0.03, 0, 0, 23),
    ]);
    put("gold", GOLD, [
      torus(0.11, 0.006, ax, ay, 0.03, 67, 0, 0, 20, 4),
      torus(0.11, 0.005, ax, ay, 0.03, 0, 0, 0, 20, 4),
      torus(0.11, 0.005, ax, ay, 0.03, 0, 90, 0, 20, 4),
      torus(0.085, 0.004, ax, ay, 0.03, 0, 45, 0, 18, 4),
      ball(0.016, ax + 0.084, ay + 0.071, 0.03, 1, 1, 1, 7),
      ball(0.01, ax - 0.03, ay + 0.105, 0.03 + 0.03, 1, 1, 1, 6),
    ]);
    put("gemTeal", TEAL_GLOW, ball(0.035, ax, ay, 0.03, 1, 1, 1, 8), { glow: 1.4 });
    // lectern and open grimoire
    const lx = 0.16;
    const ly = y0 + 0.165;
    put("lectern", INDIGO_L, [
      lat([[0, 0], [0.07, 0], [0.07, 0.01], [0.025, 0.03], [0.025, 0.12], [0.05, 0.14], [0.05, 0.155], [0, 0.155]], 8, lx, y0, 0.03),
    ]);
    const bm = mat(lx, ly + 0.008, 0.03, 22, 0, 0);
    put("lectern", INDIGO_L, box(0.32, 0.012, 0.23, 0, 0, 0).applyMatrix4(bm));
    put(`cover_crimson`, COVERS["crimson"] as Paint, box(0.31, 0.008, 0.215, 0, 0.01, 0).applyMatrix4(bm));
    put("pages", PAGES, gm([box(0.12, 0.014, 0.2, -0.062, 0.021, 0), box(0.12, 0.014, 0.2, 0.062, 0.021, 0)], bm));
    put("openPage", WHITE, gm([plane(0.114, 0.19, -0.062, 0.0285, 0, -90, 0, 0), plane(0.114, 0.19, 0.062, 0.0285, 0, -90, 0, 0)], bm), {
      texture: pageArt,
    });
    put("gold", GOLD, gm([box(0.31, 0.004, 0.012, 0, 0.0125, 0.113), box(0.012, 0.004, 0.215, -0.153, 0.0125, 0), box(0.012, 0.004, 0.215, 0.153, 0.0125, 0)], bm));
    put("sparkle", SPARK, [
      xf(new THREE.OctahedronGeometry(0.014, 0), lx + 0.02, y0 + 0.31, 0.06, 0, 25, 0),
      xf(new THREE.OctahedronGeometry(0.01, 0), lx - 0.08, y0 + 0.28, 0.04, 0, 55, 0),
      xf(new THREE.OctahedronGeometry(0.012, 0), lx + 0.1, y0 + 0.33, 0.0, 0, 5, 0),
      xf(new THREE.OctahedronGeometry(0.008, 0), lx - 0.02, y0 + 0.36, 0.05, 0, 35, 0),
      xf(new THREE.OctahedronGeometry(0.009, 0), lx + 0.15, y0 + 0.27, 0.07, 0, 65, 0),
    ], { glow: 1.2 });
    // owl on a tome
    const ttop = stack(0.6, y0, 0.03, [[0.26, 0.2, 0.055, 7, "azure", 0]]);
    const ox = 0.6;
    const oz = 0.03;
    const oy = ttop;
    put("owl", OWL, [
      ball(0.048, ox, oy + 0.075, oz, 1, 1.35, 0.95, 9),
      ball(0.046, ox, oy + 0.158, oz + 0.004, 1.1, 0.9, 0.95, 9),
      cyl(0, 0.014, 0.04, 6, ox - 0.03, oy + 0.198, oz, 0, 0, 20),
      cyl(0, 0.014, 0.04, 6, ox + 0.03, oy + 0.198, oz, 0, 0, -20),
    ]);
    put("owlBelly", OWL_B, [ball(0.04, ox, oy + 0.07, oz + 0.016, 1, 1.2, 0.6, 8), ball(0.034, ox, oy + 0.155, oz + 0.026, 1.35, 1, 0.35, 8)]);
    put("owlWing", OWL_W, [
      ball(0.022, ox - 0.045, oy + 0.075, oz - 0.004, 0.5, 1.6, 0.9, 7, 0, 0, 12),
      ball(0.022, ox + 0.045, oy + 0.075, oz - 0.004, 0.5, 1.6, 0.9, 7, 0, 0, -12),
      box(0.05, 0.05, 0.012, ox, oy + 0.015, oz - 0.04, -30, 0, 0),
    ]);
    put("owlEye", EYE_Y, [ball(0.019, ox - 0.022, oy + 0.162, oz + 0.04, 1, 1, 0.5, 8), ball(0.019, ox + 0.022, oy + 0.162, oz + 0.04, 1, 1, 0.5, 8)], { glow: 1.1 });
    put("wick", INK, [ball(0.009, ox - 0.022, oy + 0.162, oz + 0.054, 1, 1.3, 0.5, 6), ball(0.009, ox + 0.022, oy + 0.162, oz + 0.054, 1, 1.3, 0.5, 6)]);
    put("shine", WHITE, [ball(0.004, ox - 0.018, oy + 0.168, oz + 0.058, 1, 1, 1, 4), ball(0.004, ox + 0.026, oy + 0.168, oz + 0.058, 1, 1, 1, 4)], { glow: 1 });
    put("beak", BEAK, [
      cyl(0, 0.008, 0.022, 5, ox, oy + 0.148, oz + 0.052, 90, 0, 0),
      cyl(0.004, 0.004, 0.025, 4, ox - 0.015, oy + 0.006, oz + 0.032, 90, 0, 0),
      cyl(0.004, 0.004, 0.025, 4, ox + 0.015, oy + 0.006, oz + 0.032, 90, 0, 0),
    ]);
    put("hat", HAT, [cyl(0, 0.04, 0.075, 8, ox + 0.004, oy + 0.24, oz, 0, 0, -8), cyl(0.056, 0.056, 0.006, 10, ox, oy + 0.2, oz)]);
    put("gold", GOLD, [torus(0.04, 0.004, ox, oy + 0.205, oz, 90, 0, 0, 10, 4), ball(0.008, ox + 0.012, oy + 0.28, oz, 1, 1, 1, 5)]);
  }

  // ================================================================================================ TIER 4
  {
    const y0 = T[3] as number;
    row(-0.76, -0.32, y0, 0.34);
    candelabra(-0.12, y0, 0.03, 0.17, [0.07], 0.075, ["cream", "rose", "lav"]);
    put("rack", WOODV, box(0.36, 0.012, 0.15, 0.23, y0 + 0.006, 0.05));
    put("gold", GOLD, box(0.36, 0.01, 0.012, 0.23, y0 + 0.012, 0.126));
    flask(0.12, y0 + 0.012, 0.05, 1.0, "#ff7ac0", "pink");
    flask(0.23, y0 + 0.012, 0.05, 1.3, "#63f2b0", "mint");
    flask(0.34, y0 + 0.012, 0.05, 0.9, "#ffd24a", "sun");
    const top = stack(0.6, y0, 0.03, [
      [0.3, 0.2, 0.05, 5, "teal", 2],
      [0.27, 0.19, 0.045, -8, "crimson", 1],
      [0.24, 0.18, 0.04, 6, "ivory", 0],
    ]);
    orb(0.6, top, 0.03, 0.045, ORB_AZURE, 0.03);
  }

  // ================================================================================================ TOP OF THE CASE
  {
    const y = 2.57;
    let cy = dish(-0.66, y, 0.14, 0.075);
    candle(-0.66, cy, 0.14, 0.2, 0.024, "cream");
    candle(-0.72, cy, 0.19, 0.13, 0.018, "rose");
    candle(-0.6, cy, 0.19, 0.09, 0.016, "teal");
    const top = stack(-0.3, y, 0.14, [
      [0.3, 0.2, 0.05, 6, "plum", 0],
      [0.26, 0.18, 0.045, -9, "amber", 2],
    ]);
    cy = dish(-0.3, top, 0.14, 0.04);
    candle(-0.3, cy, 0.14, 0.11, 0.016, "lav");
    orb(0.36, y, 0.16, 0.075, ORB_TEAL, 0.06);
    cy = dish(0.68, y, 0.14, 0.07);
    candle(0.68, cy, 0.14, 0.17, 0.022, "lav");
    candle(0.62, cy, 0.19, 0.1, 0.017, "cream");
    candle(0.74, cy, 0.19, 0.12, 0.017, "rose");
  }

  // ================================================================================================ HANGING SIGN
  b.sweep(catmull([[0.835, 1.92, 0.08], [1.05, 1.93, 0.08], [1.3, 1.925, 0.08]]), 0.012, { color: BRASS, bone: root, sides: 6, name: "signArm" });
  b.rod([0.835, 1.66, 0.08], [1.08, 1.915, 0.08], 0.009, { color: BRASS, bone: root, sides: 5, name: "signBrace" });
  put("gold", GOLD, [ball(0.024, 1.31, 1.925, 0.08, 1, 1, 1, 8), torus(0.032, 0.005, 1.06, 1.875, 0.08, 0, 0, 0, 14, 4)]);
  for (const cxx of [1.09, 1.31]) b.rod([cxx, 1.925, 0.08], [cxx, 1.725, 0.08], 0.0035, { color: BRASS, bone: sign, sides: 4, name: "signChain" });
  const shield = (k: number): OutlinePoint[] => [
    [-0.15 * k, 0.09 * k],
    [0.15 * k, 0.09 * k],
    [0.15 * k, -0.06 * k],
    [0, -0.1 * k, "sharp"],
    [-0.15 * k, -0.06 * k],
  ];
  b.extrude(shield(1.09), { at: [1.2, 1.62, 0.08], x: [1, 0, 0], thickness: 0.024, color: GOLD, bone: sign, smoothing: 1, name: "signRim" });
  b.extrude(shield(1), { at: [1.2, 1.62, 0.08], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, smoothing: 1, color: INDIGO, bone: sign, name: "signBoard" });
  put("signTex", WHITE, plane(0.26, 0.166, 1.2, 1.63, 0.0975), { bone: sign, texture: signArt });
  put("signGold", GOLD, [ball(0.009, 1.09, 1.72, 0.08, 1, 1, 1, 6), ball(0.009, 1.31, 1.72, 0.08, 1, 1, 1, 6)], { bone: sign });

  // ================================================================================================ FLOOR: rug
  put("rug", RUG, cyl(0.95, 0.95, 0.012, 28, 0, 0.006, 0.9));
  put("rugArt", WHITE, circ(0.93, 32, 0, 0.0128, 0.9, -90, 0, 0), { texture: rugArt });
  const fringe: Geo[] = [];
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2;
    fringe.push(box(0.016, 0.006, 0.05, Math.sin(a) * 0.975, 0.003, 0.9 + Math.cos(a) * 0.975, 0, a / DEG, 0));
  }
  put("fringe", FRINGE, fringe);

  // floor: stack of tomes with a candle
  {
    const top = stack(-1.2, 0, 0.42, [
      [0.4, 0.52, 0.08, 8, "crimson", 0],
      [0.36, 0.48, 0.07, -12, "azure", 1],
      [0.33, 0.44, 0.065, 15, "emerald", 2],
      [0.3, 0.4, 0.06, -5, "violet", 0],
      [0.26, 0.34, 0.055, 20, "amber", 1],
    ]);
    const cy = dish(-1.2, top, 0.42, 0.06);
    candle(-1.2, cy, 0.42, 0.14, 0.022, "cream");
    candle(-1.25, cy, 0.46, 0.08, 0.016, "rose");
    scrollDir(new THREE.Vector3(-1.45, 0.02, 0.62), new THREE.Vector3(0.28, 1, -0.05), 0.026, 0.46, "gold");
  }

  // floor: wicker basket of scrolls
  {
    const bx = 1.2;
    const bz = 0.45;
    put("basket", WICKER, lat([[0, 0], [0.16, 0], [0.19, 0.02], [0.22, 0.3], [0, 0.3]], 12, bx, 0, bz));
    put("basketRing", WICKER_D, [
      torus(0.17, 0.011, bx, 0.07, bz, 90, 0, 0, 14, 4),
      torus(0.188, 0.011, bx, 0.15, bz, 90, 0, 0, 14, 4),
      torus(0.205, 0.011, bx, 0.23, bz, 90, 0, 0, 14, 4),
      torus(0.222, 0.016, bx, 0.3, bz, 90, 0, 0, 14, 5),
      torus(0.1, 0.01, bx + 0.215, 0.2, bz, 0, 90, 0, 10, 4, Math.PI),
      torus(0.1, 0.01, bx - 0.215, 0.2, bz, 0, 90, 0, 10, 4, Math.PI),
    ]);
    put("basketIn", BASKET_IN, cyl(0.205, 0.205, 0.004, 12, bx, 0.298, bz));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const tilt = 0.12 + (i % 3) * 0.06;
      scrollDir(
        new THREE.Vector3(bx + Math.cos(a) * 0.1, 0.27, bz + Math.sin(a) * 0.1),
        new THREE.Vector3(Math.cos(a) * tilt, 1, Math.sin(a) * tilt),
        0.028,
        0.42 + (i % 3) * 0.05,
        RIB_KEYS[i % RIB_KEYS.length] as string,
      );
    }
  }

  // floor: tall candelabra
  candelabra(-1.2, 0, 1.05, 1.0, [0.08, 0.15], 0.12, ["cream", "rose", "teal", "lav", "cream"]);

  // floor: crystal-ball pedestal with orbiting rings
  {
    const px = 0.55;
    const pz = 0.95;
    const py = 0.0125;
    put("brass", BRASS, [
      lat(
        [
          [0, 0],
          [0.16, 0],
          [0.16, 0.02],
          [0.11, 0.05],
          [0.07, 0.09],
          [0.045, 0.14],
          [0.045, 0.4],
          [0.07, 0.46],
          [0.06, 0.52],
          [0.11, 0.58],
          [0.13, 0.62],
          [0.12, 0.64],
          [0.08, 0.63],
          [0, 0.62],
        ],
        10,
        px,
        py,
        pz,
      ),
      torus(0.05, 0.01, px, py + 0.3, pz, 90, 0, 0, 12, 4),
      torus(0.125, 0.008, px, py + 0.63, pz, 90, 0, 0, 14, 4),
      ball(0.03, px, py + 0.22, pz, 1, 1, 1, 7),
    ]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const bot = new THREE.Vector3(px + Math.cos(a) * 0.22, py, pz + Math.sin(a) * 0.22);
      const topP = new THREE.Vector3(px + Math.cos(a) * 0.06, py + 0.25, pz + Math.sin(a) * 0.06);
      const d = topP.clone().sub(bot);
      const len = d.length();
      const dn = d.clone().normalize();
      const c = bot.clone().addScaledVector(dn, len / 2);
      put("brass", BRASS, [
        cyl(0.018, 0.03, len, 6, c.x, c.y, c.z, Math.atan2(dn.z, dn.y) / DEG, 0, -Math.asin(dn.x) / DEG),
        ball(0.036, bot.x, bot.y + 0.012, bot.z, 1, 0.6, 1, 6),
      ]);
    }
    const R = 0.13;
    const cy = py + 0.62 + R * 0.7;
    glow(b.part(new THREE.SphereGeometry(R, 16, 12), WHITE, { bone: root, at: [px, cy, pz], texture: ORB_AZURE, name: "heroOrb" }), 1);
    shine(px, cy, pz, R);
    put("orbRing", GOLD_GLOW, [
      torus(0.2, 0.006, px, cy, pz, 70, 0, 20, 28, 4),
      torus(0.23, 0.005, px, cy, pz, 20, 0, -35, 30, 4),
      ball(0.016, px + 0.2 * Math.cos(1.0) * Math.cos(20 * DEG), cy + 0.2 * Math.sin(1.0), pz + 0.1, 1, 1, 1, 6),
      ball(0.012, px - 0.17, cy + 0.12, pz + 0.12, 1, 1, 1, 6),
    ], { glow: 1.2 });
    put("sparkle", SPARK, [
      xf(new THREE.OctahedronGeometry(0.014, 0), px - 0.2, cy + 0.2, pz + 0.1, 0, 20, 0),
      xf(new THREE.OctahedronGeometry(0.01, 0), px + 0.22, cy + 0.12, pz - 0.05, 0, 50, 0),
      xf(new THREE.OctahedronGeometry(0.012, 0), px + 0.05, cy + 0.3, pz + 0.04, 0, 30, 0),
    ], { glow: 1.2 });
  }

  flush();
  return b.root;
}
