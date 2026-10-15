// Roadside shrine: torii gate, stone lanterns, fox guardians, offerings and a small hokora, in a cel-shaded
// Genshin-style palette (vermilion lacquer, gold filigree and tassels, teal tiles, glowing elemental sigils).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import { catmull, spiral } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lantern Shrine",
  description:
    "A roadside shrine in a cel-shaded Genshin Impact style: a vermilion torii with shide rope and gold tassels, mossy stone lanterns with glowing windows, fox guardians, a small teal-roofed hokora with bell rope and paper lanterns, offerings, an ema rack, a water basin and a sacred sakura.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P = [number, number, number];

const G = 0.2; // top of the grass
const PT = 0.58; // top of the shrine platform

export default function build() {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  const root = b.joint("shrine", { at: [0, 0, 0] });
  const suzu = b.joint("suzu", { parent: root, at: [0, 1.68, -1.12], dir: [0, -1, 0], role: "hinge" });
  const chochinL = b.joint("chochinL", { parent: root, at: [0.8, 1.69, -1.18], dir: [0, -1, 0], role: "hinge" });
  const chochinR = b.joint("chochinR", { parent: root, at: [-0.8, 1.69, -1.18], dir: [0, -1, 0], role: "hinge" });

  // ---------------------------------------------------------------- helpers
  type Opt = {
    bone?: Joint;
    rot?: P;
    dir?: P;
    up?: P;
    axis?: "x" | "y" | "z";
    scale?: number | P;
    texture?: THREE.Texture;
    flat?: boolean;
    name?: string;
  };
  const put = (geo: THREE.BufferGeometry, color: Fill, at: P, o: Opt = {}) =>
    b.part(geo, color, {
      at,
      bone: o.bone ?? root,
      ...(o.rot ? { rotation: o.rot } : {}),
      ...(o.dir ? { dir: o.dir, axis: o.axis ?? "y" } : {}),
      ...(o.up ? { up: o.up } : {}),
      ...(o.scale !== undefined ? { scale: o.scale } : {}),
      ...(o.texture ? { texture: o.texture } : {}),
      ...(o.flat ? { flat: true } : {}),
      ...(o.name ? { name: o.name } : {}),
    });
  const box = (w: number, h: number, d: number, at: P, color: Fill, o: Opt = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, at: P, color: Fill, o: Opt = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: number, at: P, color: Fill, o: Opt = {}, ws = 8, hs = 6) =>
    put(new THREE.SphereGeometry(r, ws, hs), color, at, o);
  const plane = (w: number, h: number, at: P, dir: P, tex: THREE.Texture, o: Opt = {}) =>
    put(new THREE.PlaneGeometry(w, h), "#ffffff", at, { ...o, dir, axis: "z", texture: tex });
  const rod = (a: P, c: P, r: number, color: Fill, bone: Joint = root, sides = 6) =>
    b.rod(a, c, r, { color, bone, sides });
  const tube = (pts: P[], r: number | number[], color: Fill, bone: Joint = root, sides = 6) =>
    b.sweep(catmull(pts), r, { color, bone, sides });
  const ringPts = (cx: number, y: number, cz: number, r: number, n = 10): P[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as P;
    });
  const band = (cx: number, y: number, cz: number, r: number, rad: number, color: Fill, bone: Joint = root) =>
    b.sweep(catmull(ringPts(cx, y, cz, r), { closed: true }), rad, { color, bone, sides: 5 });
  const cards = (on: Parameters<typeof b.cards>[0], tex: Parameters<typeof b.cards>[1], o: Parameters<typeof b.cards>[2]) =>
    b.cards(on, tex, { bone: root, ...o });
  const lines = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join("");

  // ---------------------------------------------------------------- paints
  const stoneRaw = (seed: number) =>
    paint((p, n) => {
      const m = noise(p, 0.2, seed);
      const base = mix("#d6dae6", "#aab1c9", smoothstep(0.38, 0.66, m));
      const mossN = noise(p, 0.28, seed + 11);
      const low = smoothstep(0.62, 0.2, p.y);
      const top = n.y > 0.5 ? 0.3 : 0;
      const amt = smoothstep(0.58, 0.72, mossN + low * 0.25 + top);
      return mix(base, mix("#80c95c", "#5ba24f", noise(p, 0.1, seed + 3)), amt);
    });
  const SR3 = stoneRaw(3);
  const STONE = cel(stoneRaw(1));
  const STONE2 = cel(stoneRaw(7));
  const BLOCKS = cel(
    paint((p, n) => {
      const side = Math.abs(n.y) < 0.5;
      const row = p.y / 0.2;
      const fr = row - Math.floor(row);
      const along = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
      const col = (along + (Math.floor(row) % 2) * 0.3) / 0.6;
      const fc = col - Math.floor(col);
      if (side && (fr < 0.06 || fc < 0.035)) return "#8c93ad";
      if (n.y > 0.5) {
        const gx = p.x / 0.5;
        const gz = p.z / 0.5;
        if (gx - Math.floor(gx) < 0.03 || gz - Math.floor(gz) < 0.03) return "#9aa1bb";
      }
      return SR3;
    }),
  );
  const lacquer = (seed: number) =>
    cel(
      paint((p, _n) => {
        const m = noise(p, 0.5, seed);
        const base = mix("#e2472f", "#f2613a", smoothstep(0.4, 0.7, m) * 0.6);
        return mix(base, "#7a3a2a", smoothstep(0.5, 0.3, p.y) * 0.5);
      }),
    );
  const RED = lacquer(1);
  const RED2 = lacquer(5);
  const DARK = cel("#34294a");
  const GOLD = cel("#f9cf55", "#cf8f27");
  const CREAM = cel("#fff2d4", "#efcfa8");
  const PAPER = cel("#fffdf4", "#d3daf2");
  const WOOD_Y = cel(grain("#bb7a4d", "#9a5b3c", { size: 0.018, axis: "y", seed: 2 }));
  const WOOD_X = cel(grain("#bb7a4d", "#9a5b3c", { size: 0.018, axis: "x", seed: 3 }));
  const WOOD_Z = cel(grain("#bb7a4d", "#9a5b3c", { size: 0.018, axis: "z", seed: 4 }));
  const WOODD = cel("#6e4030");
  const SLATS = cel(stripes("#c98a58", "#8f5434", { size: 0.05, axis: "x", width: 0.18, wobble: 0.02, seed: 2 }));
  const STRAW = cel(grain("#ecd48c", "#c8a65a", { size: 0.012, axis: "y", seed: 6 }));
  const ROPEC = cel(
    paint((_p, _n, s) => ((((s[1] - 900 * s[0]) % 90) + 90) % 90 < 40 ? "#f1d994" : "#c4a05a")),
  );
  const BRAID = cel(
    paint((_p, _n, s) => {
      const k = ((((s[1] - 1500 * s[0]) % 120) + 120) % 120) / 120;
      return k < 0.4 ? "#e2472f" : k < 0.7 ? "#fff2d4" : "#f4c445";
    }),
  );
  const TILE = cel(
    paint((p, n) => {
      if (Math.abs(n.x) > 0.8) return "#fff1d2";
      if (n.y < -0.5) return "#5b3b3a";
      const c = p.x / 0.085;
      const fx = c - Math.floor(c);
      const r = (p.z * 0.9 + p.y * 1.6) / 0.075;
      const fr = r - Math.floor(r);
      if (fx < 0.1) return "#1f4a63";
      if (fr < 0.16) return "#8fd6e0";
      return fx < 0.55 ? "#3d8aa0" : "#346f8a";
    }),
  );
  const WALL = cel(
    paint((p, _n) => (p.y < 0.86 ? "#9a4f35" : mix("#fff2d4", "#f1d9b0", noise(p, 0.3, 2)))),
  );
  const BARK = cel(
    paint((p, _n) =>
      p.y < 1.0 && noise(p, 0.18, 4) > 0.55
        ? "#6fb552"
        : mix("#8b6a5e", "#5e443f", noise(p, 0.05, 8)),
    ),
  );
  const KASAGI = cel(
    paint((p, n) => (n.y > 0.7 ? "#2f2542" : Math.abs(p.x) > 1.74 ? "#f6c84a" : "#e3482f")),
  );
  const CANOPY = cel(
    paint((p, _n) => mix("#ff9dbb", "#ffd8e4", Math.min(1, smoothstep(2.3, 3.7, p.y) * 0.7 + noise(p, 0.3, 5) * 0.4))),
  );
  const BUSH = cel(mottle("#5fc65c", "#3f9c50", { size: 0.3, seed: 3 }));
  const FOXC = cel(stoneRaw(11));
  const FOXIN = cel("#e3482f");
  const MOCHI = cel("#fffdf6", "#cdd6f0");
  const ORANGE = cel("#ffa32e", "#e06a1a");
  const APPLE = cel("#e5413a", "#a82a3a");
  const BRONZE = cel("#4fa59b", "#2d7080");
  const WOODL = cel("#d8b47a", "#b08650");
  const BAMBOO = cel("#7fc45a", "#4f9a4a");
  const grassTop = mottle("#86d65a", "#62b94d", { size: 0.45, seed: 4, contrast: 1.2 });
  const GROUND = cel(
    paint((p, n) => {
      if (n.y < 0.5) return mix("#8a6a52", "#6a4f46", smoothstep(0.2, 0.0, p.y));
      const wander = noise(p, 0.5, 9) * 0.35;
      if (Math.abs(p.x) < 0.78 + wander * 0.5 && p.z > -0.95 && p.z < 3.0)
        return mix("#e3c590", "#cfa974", noise(p, 0.12, 3));
      return grassTop;
    }),
  );

  // ---------------------------------------------------------------- textures
  const SHOJI = svg(
    `<svg viewBox="0 0 70 66">
    <rect width="70" height="66" fill="#7d2f27"/>
    <rect x="3" y="3" width="64" height="38" fill="#fff6e0"/>
    <g stroke="#b9743f" stroke-width="1.4" fill="none">
      ${lines(5, (i) => `<path d="M${3 + (64 * (i + 1)) / 6} 3V41"/>`)}
      ${lines(3, (i) => `<path d="M3 ${3 + (38 * (i + 1)) / 4}H67"/>`)}
    </g>
    <rect x="3" y="44" width="64" height="19" fill="#d79a4e"/>
    <rect x="5.5" y="46.5" width="59" height="14" fill="none" stroke="#f6c84a" stroke-width="1.3"/>
    ${lines(8, (i) => `<ellipse cx="35" cy="48.6" rx="1.5" ry="2.2" fill="#ffe28a" transform="rotate(${i * 45} 35 53.5)"/>`)}
    <circle cx="35" cy="53.5" r="3.2" fill="#f6c84a"/>
    <circle cx="35" cy="53.5" r="1.5" fill="#5fe0cd"/>
    <rect x="1" y="1" width="68" height="64" fill="none" stroke="#f6c84a" stroke-width="2"/>
  </svg>`,
    { size: 420 },
  );
  const TRANSOM = svg(
    `<svg viewBox="0 0 140 10">
    <rect width="140" height="10" fill="#2f6f86"/>
    ${lines(15, (i) => `<circle cx="${i * 10}" cy="10" r="5" fill="none" stroke="#f6c84a" stroke-width="1"/><circle cx="${i * 10}" cy="10" r="2.8" fill="none" stroke="#f6c84a" stroke-width="1"/>`)}
    ${lines(14, (i) => `<circle cx="${5 + i * 10}" cy="5" r="5" fill="none" stroke="#9fe3ee" stroke-width="1"/>`)}
    <rect width="140" height="1.4" fill="#f6c84a"/><rect y="8.6" width="140" height="1.4" fill="#f6c84a"/>
  </svg>`,
    { size: 840 },
  );
  const FILIGREE = svg(
    `<svg viewBox="0 0 160 20">
    <rect width="160" height="20" fill="#244d66"/>
    <rect y="1" width="160" height="1.4" fill="#f6c84a"/><rect y="17.6" width="160" height="1.4" fill="#f6c84a"/>
    ${lines(8, (i) => `<circle cx="${10 + 20 * i}" cy="10" r="5" fill="none" stroke="#f6c84a" stroke-width="1.4"/><circle cx="${10 + 20 * i}" cy="10" r="1.8" fill="#6df5d8"/><path d="M${20 * i + 15} 10q2.5 -7 5 0t5 0" fill="none" stroke="#f6c84a" stroke-width="1.2"/>`)}
  </svg>`,
    { size: 960 },
  );
  const WINDOW = svg(
    `<svg viewBox="0 0 40 48">
    <defs><radialGradient id="g" cx="50%" cy="60%" r="65%"><stop offset="0" stop-color="#fff6c2"/><stop offset="0.6" stop-color="#ffc45a"/><stop offset="1" stop-color="#ff8f2e"/></radialGradient></defs>
    <rect width="40" height="48" fill="#2a2238"/>
    <path d="M5 44V18Q5 5 20 5Q35 5 35 18V44Z" fill="url(#g)"/>
    <path d="M20 5V44M5 26H35" stroke="#2a2238" stroke-width="2"/>
  </svg>`,
    { size: 240 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 56 46">
    <rect width="56" height="46" fill="#1b2150"/>
    <rect x="2" y="2" width="52" height="42" fill="none" stroke="#f6c84a" stroke-width="2.2"/>
    <path d="M28 23q4 -6 10 -2q4 6 -4 11q-10 4 -16 -4q-5 -10 6 -15q12 -3 18 6" fill="none" stroke="#f6c84a" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="9" cy="9" r="2.6" fill="#6df5d8"/><circle cx="47" cy="37" r="2.6" fill="#6df5d8"/>
    <circle cx="47" cy="9" r="2.6" fill="#f6c84a"/><circle cx="9" cy="37" r="2.6" fill="#f6c84a"/>
  </svg>`,
    { size: 336 },
  );
  const emaArt = (accent: string, kind: number) =>
    svg(
      `<svg viewBox="0 0 40 40">
      ${
        kind === 0
          ? `<path d="M20 5C26 13 31 18 28 28C26 34 14 34 12 28C9 20 15 18 16 12C17 16 19 16 20 5Z" fill="${accent}" stroke="#34294a" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 18C23 22 24 26 22 29C19 30 17 28 17 26C17 23 19 22 20 18Z" fill="#fff1b0"/>`
          : kind === 1
            ? `<path d="M20 20q4 -6 9 -2q4 6 -4 10q-10 3 -14 -5q-4 -10 6 -14q10 -3 16 5" fill="none" stroke="${accent}" stroke-width="3.2" stroke-linecap="round"/>`
            : kind === 2
              ? lines(5, (i) => `<ellipse cx="20" cy="11" rx="5" ry="8" fill="${accent}" stroke="#34294a" stroke-width="1.2" transform="rotate(${i * 72} 20 20)"/>`) + `<circle cx="20" cy="20" r="3" fill="#f6c84a"/>`
              : `<path d="M8 6L16 14H24L32 6L33 22Q33 33 20 35Q7 33 7 22Z" fill="${accent}" stroke="#34294a" stroke-width="1.6" stroke-linejoin="round"/><circle cx="14" cy="23" r="2" fill="#34294a"/><circle cx="26" cy="23" r="2" fill="#34294a"/><path d="M18 29H22L20 32Z" fill="#34294a"/>`
      }
    </svg>`,
      { size: 240 },
    );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 64">
    ${lines(7, (i) => `<path d="M${12 + (i - 3) * 1.3} 12L${12 + (i - 3) * 2.6} 62" stroke="${i % 2 ? "#d8443a" : "#f6c84a"}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`)}
    <rect x="6.5" y="9" width="11" height="6" rx="1.5" fill="#d6892a"/>
    <circle cx="12" cy="6" r="5" fill="#f6c84a"/><circle cx="10.4" cy="4.6" r="1.6" fill="#fff2b0"/>
  </svg>`,
    { size: 256 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 24 64">
    <path d="M12 0L12 8L6 16L18 28L6 40L18 52L12 60" fill="none" stroke="#c9d2e8" stroke-width="10" stroke-linejoin="miter"/>
    <path d="M12 0L12 8L6 16L18 28L6 40L18 52L12 60" fill="none" stroke="#fffdf4" stroke-width="7" stroke-linejoin="miter"/>
  </svg>`,
    { size: 256 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 40">
    <path d="M16 40C14 28 8 18 4 6C12 16 17 28 18 40Z" fill="#4fa944"/>
    <path d="M16 40C17 26 20 14 18 2C23 14 22 28 20 40Z" fill="#7fd05a"/>
    <path d="M18 40C20 30 26 22 30 12C29 24 25 32 22 40Z" fill="#4fa944"/>
    <path d="M13 40C11 32 6 28 1 24C8 28 12 32 15 40Z" fill="#9de36a"/>
    <path d="M17 40C18 30 22 22 24 16C24 26 22 34 20 40Z" fill="#a9ea74"/>
  </svg>`,
    { size: 160 },
  );
  const flowerTex = (petal: string, center: string) =>
    svg(
      `<svg viewBox="0 0 24 40">
      <path d="M12 40L12 16" stroke="#4fa944" stroke-width="2.4" fill="none"/>
      <path d="M12 32Q4 30 3 24Q10 25 12 32Z" fill="#7fd05a"/>
      ${lines(5, (i) => `<circle cx="12" cy="8.5" r="3.6" fill="${petal}" transform="rotate(${i * 72} 12 13)"/>`)}
      <circle cx="12" cy="13" r="2.4" fill="${center}"/>
    </svg>`,
      { size: 160 },
    );
  const FLOWER_A = flowerTex("#fff6e8", "#f6c84a");
  const FLOWER_B = flowerTex("#ff9fc0", "#fff2b0");
  const FLOWER_C = flowerTex("#b9a8ff", "#fff2b0");
  const PETAL = svg(
    `<svg viewBox="0 0 16 16">
    <path d="M8 15C2 11 1 5 4 2C6 0 8 3 8 4C8 3 10 0 12 2C15 5 14 11 8 15Z" fill="#ffb6cd"/>
    <path d="M8 14V6" stroke="#ff86ab" stroke-width="1" fill="none"/>
  </svg>`,
    { size: 64 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 16 32">
    <path d="M8 31C1 20 2 8 8 1C14 8 15 20 8 31Z" fill="#3d9a4a"/>
    <path d="M8 29V6" stroke="#8ee07a" stroke-width="1.2" fill="none"/>
  </svg>`,
    { size: 128 },
  );
  const sigil = (c1: string, c2: string) =>
    svg(
      `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="94" fill="none" stroke="${c1}" stroke-width="4"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="${c2}" stroke-width="2.4"/>
      ${lines(8, (i) => `<ellipse cx="100" cy="46" rx="11" ry="26" fill="none" stroke="${c1}" stroke-width="3" transform="rotate(${i * 45} 100 100)"/>`)}
      ${lines(8, (i) => `<circle cx="100" cy="14" r="4" fill="${c2}" transform="rotate(${i * 45 + 22.5} 100 100)"/>`)}
      <polygon points="100,70 108,92 130,100 108,108 100,130 92,108 70,100 92,92" fill="${c1}"/>
      <circle cx="100" cy="100" r="7" fill="${c2}"/>
    </svg>`,
      { size: 640 },
    );
  const SIGIL = sigil("#6df5d8", "#d9fff6");
  const CREST = sigil("#e9ae2c", "#d8443a");
  const CHOCHIN = svg(
    `<svg viewBox="0 0 128 64">
    <rect width="128" height="64" fill="#ff6b3d"/>
    ${lines(16, (i) => `<path d="M${i * 8} 0V64" stroke="#d9402a" stroke-width="1.4"/>`)}
    <rect y="0" width="128" height="7" fill="#f6c84a"/><rect y="57" width="128" height="7" fill="#f6c84a"/>
    <rect y="17" width="128" height="1.6" fill="#f6c84a"/><rect y="45.4" width="128" height="1.6" fill="#f6c84a"/>
    <circle cx="64" cy="32" r="12.5" fill="#fff1d0" stroke="#f6c84a" stroke-width="1.6"/>
    ${lines(6, (i) => `<ellipse cx="64" cy="26" rx="3" ry="5.4" fill="#e2472f" transform="rotate(${i * 60} 64 32)"/>`)}
    <circle cx="64" cy="32" r="2.4" fill="#f6c84a"/>
  </svg>`,
    { size: 512 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 30 40">
    <rect width="30" height="40" fill="#fff6e0"/>
    <rect width="30" height="9" fill="#d8443a"/>
    <rect x="1" y="1" width="28" height="38" fill="none" stroke="#34294a" stroke-width="1.2"/>
    <path d="M10 14V34M15 13V35M20 14V32M7 20H13M17 22H23M8 28H12M17 27H22" stroke="#34294a" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="15" cy="4.5" r="2" fill="#f6c84a"/>
  </svg>`,
    { size: 240 },
  );

  // ---------------------------------------------------------------- small shared pieces
  const rope = (pts: P[], r0: number, bone: Joint = root) => {
    const path = catmull(pts);
    b.sweep(path, (t) => r0 * (0.7 + 0.5 * Math.sin(Math.PI * t)), { color: ROPEC, bone, sides: 6 });
    return path;
  };
  const shideRow = (pts: P[], ts: number[], len = 0.28, bone: Joint = root) => {
    const path = catmull(pts);
    cards(
      ts.map((t) => frame(path.at(t), [0, 1, 0])),
      SHIDE,
      { size: [0.1, len], lean: 180, flow: [0, 0, 1], sink: 0.05, bone },
    );
  };
  const tassel = (at: P, len: number, bone: Joint = root) => {
    ball(len * 0.15, at, GOLD, { bone }, 6, 5);
    cards([frame([at[0], at[1] - len * 0.04, at[2]], [0, 1, 0])], TASSEL, {
      size: [len * 0.4, len],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      sink: 0.02,
      bone,
    });
  };

  // ================================================================ GROUND
  const blob: OutlinePoint[] = Array.from({ length: 22 }, (_, k) => {
    const th = (k / 22) * Math.PI * 2;
    const r = 1 + 0.05 * Math.sin(3 * th + 1) + 0.035 * Math.sin(5 * th + 2) + 0.03 * Math.sin(7 * th);
    return [2.9 * r * Math.cos(th), 3.3 * r * Math.sin(th)] as [number, number];
  });
  const ground = b.extrude(blob, {
    at: [0, 0.1, -0.45],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.2,
    bevel: 0.03,
    smoothing: 1,
    color: GROUND,
    bone: root,
    name: "ground",
  });

  // path slabs
  const slabRows = [2.5, 2.0, 1.5];
  slabRows.forEach((z, i) => {
    for (const s of [1, -1]) {
      const w = 0.58 + 0.04 * ((i + (s > 0 ? 1 : 0)) % 2);
      box(w, 0.04, 0.44, [s * (0.34 + 0.02 * i), G + 0.02, z + 0.03 * s], i % 2 ? STONE : STONE2, {
        rot: [0, s * (3 + 2 * i), 0],
      });
    }
  });
  // plaza with sigil
  cyl(0.82, 0.84, 0.05, 16, [0, G + 0.025, 0.45], STONE2);
  cyl(0.62, 0.64, 0.01, 16, [0, G + 0.054, 0.45], STONE);
  glow(plane(1.12, 1.12, [0, G + 0.066, 0.45], [0, 1, 0], SIGIL, { up: [0, 0, -1] }), 1.5);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.2, 0.07, 0.12, [Math.sin(a) * 0.9, G + 0.035, 0.45 + Math.cos(a) * 0.9], i % 2 ? STONE : STONE2, {
      rot: [0, (a * 180) / Math.PI, 0],
    });
  }

  // ================================================================ PLATFORM + STEPS
  box(3.2, 0.34, 1.95, [0, G + 0.17, -1.975], BLOCKS);
  box(3.28, 0.04, 2.03, [0, 0.56, -1.975], STONE);
  box(1.5, 0.15, 0.3, [0, G + 0.075, -0.58], BLOCKS);
  box(1.4, 0.265, 0.3, [0, G + 0.1325, -0.86], BLOCKS);
  for (const s of [1, -1]) {
    plane(0.8, 0.1, [s * 1.15, 0.38, -0.992], [0, 0, 1], FILIGREE);
    // step cheek stones
    box(0.14, 0.26, 0.6, [s * 0.78, G + 0.13, -0.72], STONE2);
    ball(0.045, [s * 0.78, G + 0.29, -0.52], GOLD, {}, 6, 5);
    // platform corner pillars with gold finials
    cyl(0.07, 0.08, 0.3, 8, [s * 1.5, PT + 0.15, -1.08], STONE);
    ball(0.055, [s * 1.5, PT + 0.33, -1.08], GOLD, {}, 7, 5);
  }

  // railing around the platform (open at the steps)
  const posts = new Set<string>();
  const fenceRun = (a: [number, number], c: [number, number]) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / 0.6));
    const pts: P[] = [];
    for (let i = 0; i <= n; i++) {
      const x = a[0] + ((c[0] - a[0]) * i) / n;
      const z = a[1] + ((c[1] - a[1]) * i) / n;
      pts.push([x, PT, z]);
      const key = `${x.toFixed(2)},${z.toFixed(2)}`;
      if (!posts.has(key)) {
        posts.add(key);
        cyl(0.032, 0.036, 0.5, 8, [x, PT + 0.25, z], RED);
        ball(0.045, [x, PT + 0.54, z], GOLD, {}, 7, 5);
        cyl(0.05, 0.05, 0.02, 8, [x, PT + 0.5, z], GOLD);
      }
    }
    for (let i = 0; i < n; i++) {
      rod([pts[i][0], PT + 0.44, pts[i][2]], [pts[i + 1][0], PT + 0.44, pts[i + 1][2]], 0.022, RED2);
      rod([pts[i][0], PT + 0.24, pts[i][2]], [pts[i + 1][0], PT + 0.24, pts[i + 1][2]], 0.018, RED2);
    }
  };
  fenceRun([-1.5, -1.08], [-0.85, -1.08]);
  fenceRun([-1.5, -1.08], [-1.5, -2.88]);
  fenceRun([-1.5, -2.88], [1.5, -2.88]);
  fenceRun([1.5, -2.88], [1.5, -1.08]);
  fenceRun([0.85, -1.08], [1.5, -1.08]);

  // ================================================================ TORII
  const TX = 1.05;
  const TZ = 1.55;
  const rAt = (y: number) => 0.16 - (0.035 * (y - 0.36)) / 2.34;
  for (const s of [1, -1]) {
    const x = s * TX;
    cyl(0.23, 0.27, 0.16, 8, [x, G + 0.08, TZ], STONE);
    cyl(0.125, 0.16, 2.34, 12, [x, 1.53, TZ], RED);
    cyl(0.168, 0.168, 0.34, 12, [x, 0.53, TZ], DARK);
    cyl(0.175, 0.175, 0.03, 12, [x, 0.72, TZ], GOLD);
    cyl(rAt(2.05) + 0.012, rAt(2.05) + 0.012, 0.03, 12, [x, 2.05, TZ], GOLD);
    cyl(rAt(2.62) + 0.012, rAt(2.62) + 0.012, 0.03, 12, [x, 2.62, TZ], GOLD);
    // kusabi wedges either side of the pillar under the nuki
    for (const k of [1, -1]) box(0.09, 0.3, 0.12, [x + k * 0.19, 2.04, TZ], DARK, { rot: [0, 0, k * 7] });
    box(0.03, 0.17, 0.14, [s * 1.465, 2.2, TZ], GOLD);
  }
  box(2.9, 0.14, 0.11, [0, 2.2, TZ], RED);
  box(3.1, 0.13, 0.28, [0, 2.76, TZ], DARK);
  box(0.14, 0.5, 0.12, [0, 2.46, TZ], DARK);
  b.extrude(
    [
      [-1.72, 0.06],
      [-1.4, -0.04],
      [-0.9, -0.075],
      [0, -0.09],
      [0.9, -0.075],
      [1.4, -0.04],
      [1.72, 0.06],
      [1.8, 0.24],
      [1.45, 0.1],
      [0.9, 0.075],
      [0, 0.06],
      [-0.9, 0.075],
      [-1.45, 0.1],
      [-1.8, 0.24],
    ],
    { at: [0, 2.915, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.3, bevel: 0.02, color: KASAGI, bone: root, name: "kasagi" },
  );
  // plaque
  box(0.56, 0.42, 0.06, [0, 2.45, TZ], DARK);
  plane(0.52, 0.426, [0, 2.45, TZ + 0.036], [0, 0, 1], PLAQUE);
  plane(0.52, 0.426, [0, 2.45, TZ - 0.036], [0, 0, -1], PLAQUE);
  // shimenawa rope with paper shide and tassels
  const toriiRope = rope(
    [
      [-0.95, 2.1, TZ + 0.19],
      [-0.5, 1.98, TZ + 0.2],
      [0, 1.94, TZ + 0.2],
      [0.5, 1.98, TZ + 0.2],
      [0.95, 2.1, TZ + 0.19],
    ],
    0.045,
  );
  shideRow(
    [
      [-0.95, 2.1, TZ + 0.19],
      [-0.5, 1.98, TZ + 0.2],
      [0, 1.94, TZ + 0.2],
      [0.5, 1.98, TZ + 0.2],
      [0.95, 2.1, TZ + 0.19],
    ],
    [0.14, 0.3, 0.5, 0.7, 0.86],
    0.3,
  );
  for (const s of [1, -1]) {
    tassel([s * 0.93, 2.08, TZ + 0.19], 0.38);
    ball(0.045, [s * 0.97, 2.12, TZ + 0.18], GOLD, {}, 6, 5);
  }
  void toriiRope;

  // ================================================================ STONE LANTERNS
  const stoneLantern = (cx: number, cz: number) => {
    cyl(0.42, 0.44, 0.04, 6, [cx, G + 0.02, cz], STONE2);
    cyl(0.27, 0.3, 0.08, 6, [cx, 0.28, cz], STONE);
    cyl(0.17, 0.24, 0.14, 6, [cx, 0.39, cz], STONE2);
    cyl(0.095, 0.105, 0.5, 6, [cx, 0.71, cz], STONE);
    cyl(0.14, 0.14, 0.07, 6, [cx, 0.71, cz], STONE2);
    glow(band(cx, 0.71, cz, 0.142, 0.008, "#6df5d8"), 1.6);
    cyl(0.3, 0.17, 0.1, 6, [cx, 1.01, cz], STONE2);
    cyl(0.19, 0.19, 0.28, 6, [cx, 1.2, cz], STONE);
    for (let k = 0; k < 6; k++) {
      const phi = ((30 + 60 * k) * Math.PI) / 180;
      const r = 0.169;
      glow(
        plane(0.15, 0.2, [cx + Math.sin(phi) * r, 1.2, cz + Math.cos(phi) * r], [Math.sin(phi), 0, Math.cos(phi)], WINDOW),
        1.4,
      );
    }
    cyl(0.4, 0.43, 0.05, 6, [cx, 1.365, cz], STONE2);
    cyl(0.08, 0.36, 0.2, 6, [cx, 1.49, cz], STONE);
    cyl(0.035, 0.09, 0.07, 6, [cx, 1.625, cz], STONE2);
    ball(0.055, [cx, 1.71, cz], GOLD, {}, 7, 5);
    b.spike([cx, 1.73, cz], [0, 1, 0], 0.1, 0.028, { color: GOLD, bone: root, sides: 6 });
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      ball(0.025, [cx + Math.sin(a) * 0.43, 1.37, cz + Math.cos(a) * 0.43], GOLD, {}, 6, 4);
    }
  };
  stoneLantern(1.75, 0.35);
  stoneLantern(-1.75, 0.35);

  // ================================================================ FOX GUARDIANS
  const fox = (s: number) => {
    const cx = s * 1.12;
    const cz = -0.55;
    const y0 = G + 0.39;
    const at = (x: number, y: number, z: number): P => [cx + x, y0 + y, cz + z];
    box(0.5, 0.34, 0.5, [cx, G + 0.17, cz], BLOCKS);
    box(0.56, 0.05, 0.56, [cx, G + 0.365, cz], STONE);
    plane(0.46, 0.06, [cx, G + 0.2, cz + 0.256], [0, 0, 1], FILIGREE);
    b.capsule(at(0, 0.2, -0.13), at(0, 0.4, 0.04), [0.19, 0.14], { color: FOXC, bone: root, sides: 8 });
    b.capsule(at(0, 0.4, 0.04), at(0, 0.54, 0.08), 0.09, { color: FOXC, bone: root, sides: 8 });
    ball(0.115, at(0, 0.6, 0.1), FOXC, { scale: [1.05, 0.92, 1] }, 10, 8);
    for (const t of [1, -1]) {
      ball(0.13, at(t * 0.13, 0.14, -0.1), FOXC, { scale: [1, 1, 1.15] }, 8, 6);
      ball(0.06, at(t * 0.12, 0.05, 0.06), FOXC, { scale: [0.9, 0.6, 1.4] }, 6, 4);
      b.capsule(at(t * 0.075, 0.38, 0.06), at(t * 0.075, 0.05, 0.12), [0.055, 0.05], { color: FOXC, bone: root, sides: 6 });
      ball(0.055, at(t * 0.075, 0.04, 0.15), FOXC, { scale: [1, 0.7, 1.4] }, 6, 4);
      ball(0.05, at(t * 0.1, 0.57, 0.12), FOXC, {}, 6, 5);
      b.spike(at(t * 0.07, 0.67, 0.06), at(t * 0.11, 0.84, 0.03), null, 0.05, { color: FOXC, bone: root, sides: 6 });
      b.spike(at(t * 0.07, 0.67, 0.1), at(t * 0.105, 0.8, 0.045), null, 0.028, { color: FOXIN, bone: root, sides: 5 });
      ball(0.017, at(t * 0.055, 0.62, 0.19), INK, { scale: [1, 1.3, 0.6] }, 6, 4);
      ball(0.006, at(t * 0.052, 0.628, 0.205), "#6df5d8", {}, 4, 3);
    }
    b.spike(at(0, 0.585, 0.16), at(0, 0.55, 0.34), null, 0.062, { color: FOXC, bone: root, sides: 7 });
    ball(0.022, at(0, 0.55, 0.345), INK, {}, 6, 4);
    // tail
    b.sweep(
      catmull([at(0, 0.12, -0.28), at(s * 0.12, 0.1, -0.5), at(s * 0.28, 0.2, -0.55), at(s * 0.3, 0.42, -0.44)]),
      [0.07, 0.03],
      { bands: [[0.78, FOXC], [1, CREAM]], bone: root, sides: 8 },
    );
    // red cloth bib with gold clasp and tassel
    band(cx, y0 + 0.45, cz + 0.06, 0.118, 0.03, RED);
    b.extrude(
      [
        [-0.075, 0],
        [0.075, 0],
        [0, -0.14, "sharp"],
      ],
      { at: at(0, 0.45, 0.2), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.004, color: RED, bone: root },
    );
    cyl(0.026, 0.026, 0.006, 8, at(0, 0.41, 0.211), GOLD, { rot: [90, 0, 0] });
    tassel(at(0, 0.31, 0.205), 0.1);
    if (s > 0) {
      glow(ball(0.06, at(0, 0.065, 0.2), "#6df5d8", {}, 8, 6), 1.8);
      cyl(0.05, 0.06, 0.02, 8, at(0, 0.012, 0.2), GOLD);
    } else {
      cyl(0.028, 0.028, 0.22, 8, at(0, 0.075, 0.2), PAPER, { rot: [0, 0, 90] });
      for (const t of [1, -1]) cyl(0.034, 0.034, 0.02, 8, at(t * 0.11, 0.075, 0.2), GOLD, { rot: [0, 0, 90] });
      cyl(0.03, 0.03, 0.025, 8, at(0.03, 0.075, 0.2), RED, { rot: [0, 0, 90] });
    }
  };
  fox(1);
  fox(-1);

  // ================================================================ SHRINE (hokora)
  const SZ = -2.15;
  box(1.7, 0.12, 1.4, [0, PT + 0.06, SZ], BLOCKS);
  box(0.9, 0.08, 0.16, [0, PT + 0.04, -1.37], STONE);
  for (const sx of [1, -1])
    for (const zz of [-1.6, -2.7]) {
      const x = sx * 0.7;
      cyl(0.075, 0.085, 0.05, 8, [x, 0.725, zz], STONE);
      cyl(0.05, 0.055, 0.88, 10, [x, 1.14, zz], RED);
      cyl(0.06, 0.06, 0.03, 10, [x, 1.52, zz], GOLD);
      box(0.16, 0.04, 0.16, [x, 1.62, zz], DARK);
      box(0.1, 0.03, 0.26, [x, 1.655, zz], WOODD);
    }
  box(1.5, 0.12, 0.09, [0, 1.54, -1.6], RED2);
  box(1.5, 0.12, 0.09, [0, 1.54, -2.7], RED2);
  for (const sx of [1, -1]) box(0.09, 0.12, 1.2, [sx * 0.7, 1.54, SZ], RED2);
  box(1.4, 0.8, 0.05, [0, 1.1, -2.675], WALL);
  for (const sx of [1, -1]) box(0.05, 0.8, 1.1, [sx * 0.7, 1.1, SZ], WALL);
  box(1.4, 0.12, 0.05, [0, 0.76, -1.62], RED);
  box(1.36, 0.66, 0.03, [0, 1.15, -1.65], WOODD);
  for (const sx of [1, -1]) plane(0.7, 0.66, [sx * 0.35, 1.15, -1.618], [0, 0, 1], SHOJI);
  box(0.025, 0.66, 0.035, [0, 1.15, -1.608], GOLD);
  for (const sx of [1, -1]) {
    box(0.035, 0.1, 0.012, [sx * 0.06, 1.0, -1.598], GOLD);
    glow(ball(0.014, [sx * 0.06, 1.0, -1.59], "#6df5d8", {}, 5, 4), 1.6);
  }
  plane(1.4, 0.1, [0, 1.54, -1.549], [0, 0, 1], TRANSOM);
  // front rope with shide and tassels
  const shrinePts: P[] = [
    [-0.68, 1.42, -1.52],
    [-0.34, 1.34, -1.51],
    [0, 1.31, -1.51],
    [0.34, 1.34, -1.51],
    [0.68, 1.42, -1.52],
  ];
  rope(shrinePts, 0.025);
  shideRow(shrinePts, [0.14, 0.32, 0.5, 0.68, 0.86], 0.2);
  for (const sx of [1, -1]) tassel([sx * 0.66, 1.4, -1.52], 0.24);

  // roof
  b.extrude(
    [
      [1.08, 0.16, "sharp"],
      [0.85, 0.1],
      [0.55, 0.17],
      [0.25, 0.37],
      [0, 0.52],
      [-0.25, 0.37],
      [-0.55, 0.17],
      [-0.85, 0.1],
      [-1.08, 0.16, "sharp"],
      [-0.95, 0.03, "sharp"],
      [-0.6, 0, "sharp"],
      [0.6, 0, "sharp"],
      [0.95, 0.03, "sharp"],
    ],
    { at: [0, 1.66, SZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.02, smoothing: 1, color: TILE, bone: root, name: "roof" },
  );
  rod([-1.04, 2.2, SZ], [1.04, 2.2, SZ], 0.05, GOLD);
  for (const sx of [1, -1]) {
    ball(0.07, [sx * 1.06, 2.2, SZ], GOLD, {}, 7, 5);
    const edge: P[] = [
      [sx * 1.015, 1.66 + 0.18, SZ + 1.08],
      [sx * 1.015, 1.66 + 0.12, SZ + 0.85],
      [sx * 1.015, 1.66 + 0.19, SZ + 0.55],
      [sx * 1.015, 1.66 + 0.39, SZ + 0.25],
      [sx * 1.015, 1.66 + 0.54, SZ],
      [sx * 1.015, 1.66 + 0.39, SZ - 0.25],
      [sx * 1.015, 1.66 + 0.19, SZ - 0.55],
      [sx * 1.015, 1.66 + 0.12, SZ - 0.85],
      [sx * 1.015, 1.66 + 0.18, SZ - 1.08],
    ];
    tube(edge, 0.028, GOLD);
    plane(0.46, 0.46, [sx * 1.012, 1.66 + 0.2, SZ], [sx, 0, 0], CREST);
    ball(0.04, [sx * 1.04, 1.66 + 0.1, SZ + 0.0], GOLD, {}, 6, 4);
  }
  rod([-1.0, 1.84, SZ + 1.08], [1.0, 1.84, SZ + 1.08], 0.02, GOLD);
  for (let i = 0; i < 11; i++) box(0.035, 0.035, 0.1, [-1.0 + i * 0.2, 1.67, SZ + 1.0], WOODD);

  // bell rope (suzu) hanging from the eave
  cyl(0.05, 0.05, 0.02, 8, [0, 1.67, -1.12], GOLD);
  rod([0, 1.67, -1.12], [0, 1.57, -1.12], 0.012, GOLD, suzu, 5);
  ball(0.085, [0, 1.49, -1.12], GOLD, { bone: suzu }, 10, 8);
  band(0, 1.49, -1.12, 0.086, 0.007, DARK, suzu);
  ball(0.02, [0, 1.41, -1.12], DARK, { bone: suzu }, 5, 4);
  b.sweep(
    catmull([
      [0, 1.4, -1.12],
      [0, 1.3, -1.12],
      [0, 1.1, -1.12],
    ]),
    0.026,
    { color: BRAID, bone: suzu, sides: 6 },
  );
  tassel([0, 1.1, -1.12], 0.22, suzu);

  // paper lanterns on the eave
  const chochin = (j: Joint, x: number) => {
    const cy = 1.39;
    rod([x, 1.69, -1.18], [x, 1.62, -1.18], 0.01, GOLD, j, 5);
    cyl(0.07, 0.085, 0.045, 8, [x, 1.6, -1.18], DARK, { bone: j });
    glow(
      put(new THREE.SphereGeometry(0.17, 12, 8), "#ffffff", [x, cy, -1.18], {
        bone: j,
        texture: CHOCHIN,
        scale: [1, 1.25, 1],
        rot: [0, -90, 0],
      }),
      1.3,
    );
    cyl(0.075, 0.06, 0.04, 8, [x, 1.17, -1.18], DARK, { bone: j });
    tassel([x, 1.15, -1.18], 0.22, j);
  };
  chochin(chochinL, 0.8);
  chochin(chochinR, -0.8);

  // ================================================================ OFFERINGS
  // donation box
  box(0.74, 0.26, 0.22, [0, PT + 0.18, -1.15], SLATS);
  for (const sx of [1, -1]) {
    box(0.05, 0.05, 0.05, [sx * 0.33, PT + 0.025, -1.15 + 0.07], WOODD);
    box(0.05, 0.05, 0.05, [sx * 0.33, PT + 0.025, -1.15 - 0.07], WOODD);
    box(0.03, 0.27, 0.03, [sx * 0.372, PT + 0.18, -1.039], GOLD);
    box(0.03, 0.27, 0.03, [sx * 0.372, PT + 0.18, -1.261], GOLD);
  }
  for (const zz of [-1.049, -1.251]) box(0.76, 0.03, 0.03, [0, PT + 0.325, zz], WOOD_X);
  for (let i = 0; i < 7; i++) box(0.025, 0.025, 0.22, [-0.3 + i * 0.1, PT + 0.33, -1.15], WOOD_Z);
  cyl(0.05, 0.05, 0.01, 12, [0, PT + 0.19, -1.036], GOLD, { rot: [90, 0, 0] });
  glow(ball(0.014, [0, PT + 0.19, -1.028], "#6df5d8", {}, 5, 4), 1.6);
  const coinR = rng(21);
  for (let i = 0; i < 7; i++)
    cyl(0.022, 0.022, 0.004, 8, [(coinR() - 0.5) * 0.6, PT + 0.346 + 0.004 * (i % 2), -1.15 + (coinR() - 0.5) * 0.12], GOLD, {
      rot: [(coinR() - 0.5) * 20, 0, (coinR() - 0.5) * 20],
    });

  // sakaki vases flanking the box
  const sakaki = (x: number, s: number) => {
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.07, 0.08],
        [0.05, 0.2],
        [0.06, 0.23],
        [0.04, 0.23],
        [0.035, 0.2],
        [0, 0.2],
      ],
      { at: [x, PT, -1.15], segments: 10, color: PAPER, bone: root, smoothing: 1 },
    );
    band(x, PT + 0.215, -1.15, 0.052, 0.008, GOLD);
    const twigs: P[][] = [
      [[x, PT + 0.2, -1.15], [x + 0.03 * s, PT + 0.34, -1.14], [x + 0.1 * s, PT + 0.48, -1.12]],
      [[x, PT + 0.2, -1.15], [x - 0.03 * s, PT + 0.36, -1.17], [x - 0.07 * s, PT + 0.52, -1.18]],
      [[x, PT + 0.2, -1.15], [x + 0.01 * s, PT + 0.38, -1.13], [x + 0.0, PT + 0.56, -1.14]],
    ];
    twigs.forEach((pts, i) => {
      b.sweep(catmull(pts), [0.008, 0.004], { color: WOODD, bone: root, sides: 4 });
      const path = catmull(pts);
      cards(
        [0.35, 0.55, 0.75, 0.95].map((t) => frame(path.at(t), path.tangentAt(t))),
        LEAF,
        { size: [0.045, 0.09], lean: 55, flow: [s * (i - 1 + 0.5), 0, 0.5], cross: true, rng: rng(30 + i), vary: 0.2, spin: 40 },
      );
    });
  };
  sakaki(0.52, 1);
  sakaki(-0.52, -1);

  // sake barrels
  const barrel = (cx: number, cz: number, sc: number) => {
    b.lathe(
      [
        [0, 0, "sharp"],
        [0.17 * sc, 0],
        [0.2 * sc, 0.05 * sc],
        [0.22 * sc, 0.17 * sc],
        [0.2 * sc, 0.29 * sc],
        [0.17 * sc, 0.34 * sc],
        [0, 0.34 * sc, "sharp"],
      ],
      { at: [cx, PT, cz], segments: 10, color: STRAW, bone: root, smoothing: 1 },
    );
    cyl(0.165 * sc, 0.165 * sc, 0.02, 10, [cx, PT + 0.345 * sc, cz], WOODL);
    band(cx, PT + 0.08 * sc, cz, 0.208 * sc, 0.014 * sc, ROPEC);
    band(cx, PT + 0.27 * sc, cz, 0.208 * sc, 0.014 * sc, ROPEC);
    plane(0.11 * sc, 0.15 * sc, [cx, PT + 0.18 * sc, cz + 0.222 * sc], [0, 0, 1], LABEL);
    tassel([cx, PT + 0.33 * sc, cz + 0.17 * sc], 0.14);
  };
  barrel(-1.12, -1.4, 1);
  barrel(-1.1, -1.88, 0.85);

  // kagami mochi on a sanbo
  const mx = -1.1;
  const mz = -2.4;
  box(0.26, 0.1, 0.26, [mx, PT + 0.05, mz], WOODL);
  box(0.34, 0.025, 0.34, [mx, PT + 0.115, mz], GOLD);
  box(0.36, 0.012, 0.36, [mx, PT + 0.134, mz], PAPER);
  cyl(0.13, 0.15, 0.07, 12, [mx, PT + 0.17, mz], MOCHI);
  cyl(0.095, 0.115, 0.06, 12, [mx, PT + 0.235, mz], MOCHI);
  ball(0.06, [mx, PT + 0.31, mz], ORANGE, { scale: [1, 0.85, 1] }, 8, 6);
  cards([frame([mx, PT + 0.36, mz], [0, 1, 0])], LEAF, { size: [0.05, 0.08], lean: 40, flow: [1, 0, 0.5], cross: true });
  tassel([mx + 0.17, PT + 0.14, mz + 0.17], 0.12);

  // fruit tray
  const fx = 1.12;
  const fz = -1.4;
  box(0.28, 0.1, 0.28, [fx, PT + 0.05, fz], WOODL);
  box(0.36, 0.025, 0.36, [fx, PT + 0.115, fz], GOLD);
  for (const sx of [1, -1]) {
    box(0.015, 0.04, 0.36, [fx + sx * 0.18, PT + 0.145, fz], GOLD);
    box(0.36, 0.04, 0.015, [fx, PT + 0.145, fz + sx * 0.18], GOLD);
  }
  const fruitSpots: Array<[number, number, Fill, number]> = [
    [-0.07, -0.06, ORANGE, 0.055],
    [0.07, -0.05, ORANGE, 0.055],
    [0.0, 0.07, APPLE, 0.05],
    [-0.09, 0.07, APPLE, 0.045],
    [0.09, 0.08, ORANGE, 0.05],
  ];
  fruitSpots.forEach(([dx, dz, c, r], i) => {
    ball(r, [fx + dx, PT + 0.13 + r, fz + dz], c, {}, 8, 6);
    cards([frame([fx + dx, PT + 0.13 + 2 * r, fz + dz], [0, 1, 0])], LEAF, {
      size: [0.04, 0.06],
      lean: 50,
      flow: [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
      cross: true,
    });
  });
  tassel([fx + 0.19, PT + 0.12, fz + 0.19], 0.12);

  // incense burner with smoke
  const ix = 1.1;
  const iz = -2.0;
  b.lathe(
    [
      [0, 0.04, "sharp"],
      [0.1, 0.04],
      [0.14, 0.09],
      [0.15, 0.15],
      [0.13, 0.19],
      [0.115, 0.17],
      [0.12, 0.14],
      [0.1, 0.1],
      [0, 0.1, "sharp"],
    ],
    { at: [ix, PT, iz], segments: 10, color: BRONZE, bone: root, smoothing: 1 },
  );
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3;
    b.spike([ix + Math.sin(a) * 0.085, PT + 0.05, iz + Math.cos(a) * 0.085], [0, -1, 0], 0.05, 0.028, { color: GOLD, bone: root, sides: 5 });
  }
  band(ix, PT + 0.185, iz, 0.125, 0.01, GOLD);
  cyl(0.105, 0.105, 0.01, 10, [ix, PT + 0.15, iz], "#8c8aa6");
  for (let k = 0; k < 3; k++) {
    const dx = (k - 1) * 0.04;
    rod([ix + dx, PT + 0.15, iz], [ix + dx * 1.6, PT + 0.38, iz + 0.01 * (k - 1)], 0.004, RED2, root, 4);
    glow(ball(0.008, [ix + dx * 1.6, PT + 0.385, iz + 0.01 * (k - 1)], "#ffb347", {}, 4, 3), 2);
  }
  b.sweep(spiral([ix, PT + 0.4, iz], [ix + 0.015, PT + 0.4, iz], [0, 1, 0], { turns: 1.6, r1: 0.09, pitch: 0.17 }), [0.012, 0.003], {
    color: "#eef0ff",
    bone: root,
    sides: 5,
    caps: { end: "point" },
  });

  // ================================================================ EMA RACK
  const rx = 1.95;
  const rz = 1.15;
  for (const sx of [1, -1]) {
    cyl(0.035, 0.04, 1.45, 8, [rx + sx * 0.42, G + 0.725, rz], RED);
    cyl(0.07, 0.08, 0.06, 8, [rx + sx * 0.42, G + 0.03, rz], STONE);
  }
  box(1.0, 0.07, 0.1, [rx, G + 1.4, rz], RED2);
  box(0.92, 0.05, 0.08, [rx, G + 1.0, rz], RED2);
  b.extrude(
    [
      [-0.6, 0],
      [0.6, 0],
      [0, 0.2, "sharp"],
    ],
    { at: [rx, G + 1.435, rz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.28, bevel: 0.01, color: TILE, bone: root },
  );
  ball(0.04, [rx, G + 1.65, rz], GOLD, {}, 6, 4);
  const emaJoints: Array<Joint | null> = [
    b.joint("ema1", { parent: root, at: [rx - 0.36, G + 1.37, rz], dir: [0, -1, 0], role: "hinge" }),
    b.joint("ema2", { parent: root, at: [rx - 0.18, G + 1.37, rz], dir: [0, -1, 0], role: "hinge" }),
    null,
    b.joint("ema3", { parent: root, at: [rx + 0.18, G + 1.37, rz], dir: [0, -1, 0], role: "hinge" }),
    b.joint("ema4", { parent: root, at: [rx + 0.36, G + 1.37, rz], dir: [0, -1, 0], role: "hinge" }),
  ];
  const accents = ["#e2472f", "#3fb5c9", "#ff86ab", "#f6c84a", "#9a7bff"];
  emaJoints.forEach((j, i) => {
    const bone = j ?? root;
    const px = rx + (i - 2) * 0.18;
    const cy = G + 1.2;
    rod([px, G + 1.37, rz], [px, cy + 0.12, rz], 0.006, "#f6c84a", bone, 4);
    b.extrude(
      [
        [-0.085, -0.1],
        [0.085, -0.1],
        [0.085, 0.06],
        [0, 0.12, "sharp"],
        [-0.085, 0.06],
      ],
      { at: [px, cy, rz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: WOOD_Y, bone },
    );
    const art = emaArt(accents[i], i % 4);
    plane(0.14, 0.14, [px, cy - 0.015, rz + 0.0115], [0, 0, 1], art, { bone });
    plane(0.14, 0.14, [px, cy - 0.015, rz - 0.0115], [0, 0, -1], emaArt(accents[(i + 2) % 5], (i + 1) % 4), { bone });
    ball(0.012, [px, cy + 0.1, rz + 0.012], GOLD, { bone }, 5, 4);
    tassel([px, cy - 0.1, rz], 0.1, bone);
  });

  // ================================================================ WATER BASIN (chozuya)
  const wx = -1.95;
  const wz = 1.2;
  box(0.62, 0.3, 0.62, [wx, G + 0.15, wz], BLOCKS);
  box(0.66, 0.18, 0.66, [wx, G + 0.39, wz], STONE);
  for (const sx of [1, -1]) {
    box(0.07, 0.06, 0.66, [wx + sx * 0.295, G + 0.51, wz], STONE2);
    box(0.52, 0.06, 0.07, [wx, G + 0.51, wz + sx * 0.295], STONE2);
  }
  box(0.52, 0.02, 0.52, [wx, G + 0.505, wz], "#7fe7ff");
  box(0.14, 0.9, 0.14, [wx, G + 0.45, wz - 0.42], STONE);
  ball(0.05, [wx, G + 0.93, wz - 0.42], GOLD, {}, 6, 5);
  tube(
    [
      [wx, G + 0.82, wz - 0.42],
      [wx, G + 0.82, wz - 0.2],
      [wx, G + 0.75, wz + 0.0],
    ],
    0.035,
    BAMBOO,
    root,
    7,
  );
  band(wx, G + 0.81, wz - 0.28, 0.04, 0.008, "#3d7a3d");
  rod([wx, G + 0.745, wz + 0.0], [wx, G + 0.55, wz + 0.01], 0.01, "#9fe9ff", root, 5);
  // ladle resting on the rim
  rod([wx - 0.2, G + 0.575, wz + 0.31], [wx + 0.2, G + 0.575, wz + 0.31], 0.012, BAMBOO, root, 5);
  cyl(0.05, 0.04, 0.05, 8, [wx + 0.23, G + 0.58, wz + 0.31], WOODL);
  tassel([wx + 0.3, G + 0.6, wz + 0.33], 0.1);

  // ================================================================ SACRED SAKURA
  const tx = -2.0;
  const tz = -2.45;
  b.sweep(
    catmull([
      [tx, G - 0.05, tz],
      [tx - 0.05, 0.9, tz],
      [tx + 0.05, 1.6, tz + 0.05],
      [tx + 0.1, 2.3, tz + 0.05],
    ]),
    [0.26, 0.18, 0.12, 0.08],
    { color: BARK, bone: root, sides: 8 },
  );
  const branches: P[][] = [
    [[tx - 0.02, 1.4, tz], [tx - 0.5, 2.0, tz - 0.1], [tx - 0.65, 2.6, tz - 0.15]],
    [[tx + 0.05, 1.7, tz + 0.05], [tx + 0.4, 2.2, tz + 0.1], [tx + 0.55, 2.7, tz + 0.15]],
    [[tx + 0.1, 2.2, tz + 0.05], [tx + 0.05, 2.7, tz - 0.1], [tx - 0.1, 3.1, tz - 0.2]],
    [[tx + 0.08, 2.0, tz + 0.05], [tx + 0.3, 2.5, tz - 0.3], [tx + 0.45, 3.0, tz - 0.45]],
  ];
  branches.forEach((pts) => tube(pts, [0.07, 0.025], BARK, root, 6));
  const blobs: Array<[number, number, number, number]> = [
    [-2.1, 2.9, -2.4, 0.8],
    [-1.6, 2.7, -2.25, 0.5],
    [-2.65, 2.6, -2.6, 0.55],
    [-1.95, 3.45, -2.6, 0.55],
    [-2.45, 3.2, -2.0, 0.5],
    [-1.5, 3.1, -2.75, 0.45],
    [-2.0, 2.45, -1.95, 0.4],
  ];
  const canopy = blobs.map(([x, y, z, r]) => put(new THREE.IcosahedronGeometry(r, 1), CANOPY, [x, y, z], { flat: true }));
  const canopyHits = b.surface(canopy).scatter(110, { rng: rng(41), minDist: 0.12, filter: (h) => h.n.y > -0.4 });
  cards(canopyHits, PETAL, { size: 0.09, lean: 60, bend: 20, vary: 0.3, rng: rng(42), spin: 90 });
  // rope round the trunk
  const trunkRope = band(tx, 1.2, tz, 0.2, 0.035, ROPEC);
  void trunkRope;
  const trunkPts = ringPts(tx, 1.2, tz, 0.2, 10);
  trunkPts.push(trunkPts[0]);
  shideRow(
    trunkPts.filter((_, i) => i % 2 === 0).slice(0, 5),
    [0, 0.25, 0.5, 0.75, 1],
    0.26,
  );
  tassel([tx, 1.2, tz + 0.21], 0.3);
  // fallen petals
  const petalR = rng(51);
  const petalFrames = Array.from({ length: 70 }, () => {
    const a = petalR() * Math.PI * 2;
    const rr = 0.2 + petalR() * 1.6;
    const x = tx + 0.4 + Math.cos(a) * rr;
    const z = tz + 0.4 + Math.sin(a) * rr * 0.8;
    const onPlatform = x > -1.55 && z < -1.0;
    return frame([x, onPlatform ? PT + 0.003 : G + 0.004, z], [0, 1, 0]);
  });
  cards(petalFrames, PETAL, {
    size: 0.07,
    lean: 90,
    mirror: true,
    sink: 0,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
  });

  // ================================================================ BUSHES, BOULDERS, FLOWERS, GRASS
  const bushR = rng(61);
  const bushes: Array<[number, number]> = [
    [2.3, -0.4],
    [-2.3, -0.5],
    [1.45, 2.1],
    [-1.45, 2.1],
    [2.0, -2.3],
  ];
  const flowerCols = ["#ffb3d1", "#fff3c0", "#c9b8ff"];
  for (const [bx, bz] of bushes) {
    for (let k = 0; k < 3; k++) {
      const r = 0.2 + bushR() * 0.12;
      const x = bx + (bushR() - 0.5) * 0.4;
      const z = bz + (bushR() - 0.5) * 0.4;
      put(new THREE.IcosahedronGeometry(r, 1), BUSH, [x, G + r * 0.8, z], { flat: true });
      for (let f = 0; f < 3; f++) {
        const a = bushR() * Math.PI * 2;
        const e = 0.3 + bushR() * 0.9;
        ball(0.022, [x + Math.cos(a) * r * 0.85 * Math.cos(e), G + r * 0.8 + Math.sin(e) * r * 0.9, z + Math.sin(a) * r * 0.85 * Math.cos(e)], flowerCols[(f + k) % 3], {}, 5, 4);
      }
    }
  }
  const boulders: Array<[number, number, number]> = [
    [2.4, 0.25, 0.3],
    [-2.45, 0.6, 0.28],
    [-0.6, -3.3, 0.3],
    [0.8, -3.35, 0.26],
  ];
  for (const [x, z, r] of boulders)
    put(new THREE.IcosahedronGeometry(r, 0), STONE, [x, G + r * 0.45, z], { flat: true, scale: [1.2, 0.75, 1], rot: [0, x * 40, 0] });

  const blocked = (x: number, z: number) =>
    (Math.abs(x) < 0.95 && z > -1.1) ||
    (Math.abs(x) < 1.75 && z < -0.95) ||
    (Math.hypot(Math.abs(x) - 1.12, z + 0.55) < 0.4) ||
    (Math.hypot(Math.abs(x) - 1.75, z - 0.35) < 0.5) ||
    Math.hypot(x - 1.95, z - 1.15) < 0.6 ||
    Math.hypot(x + 1.95, z - 1.2) < 0.55;
  const groundSurf = b.surface(ground);
  const tufts = groundSurf.scatter(190, {
    rng: rng(71),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.9 && !blocked(h.at.x, h.at.z),
  });
  cards(tufts, GRASS, { size: [0.1, 0.16], lean: 8, vary: 0.35, spin: 180, cross: true, rng: rng(72) });
  const blooms = groundSurf.scatter(34, {
    rng: rng(81),
    minDist: 0.25,
    filter: (h) => h.n.y > 0.9 && !blocked(h.at.x, h.at.z),
  });
  cards(blooms, [FLOWER_A, FLOWER_B, FLOWER_C], { size: [0.09, 0.15], lean: 4, vary: 0.25, spin: 180, cross: true, rng: rng(82) });

  return b.root;
}
