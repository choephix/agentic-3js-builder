// Alchemist's workbench: a Liyue-flavoured apothecary bench with a red-lacquer hutch under a teal tiled roof, potions,
// books, a brass balance, an alembic, hanging herbs, a cauldron and a barrel, in cel-shaded Genshin style.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { PartOptions, Part } from "../../../../src/parts";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, spiral } from "../../../../src/path";
import { grain, mottle, paint, spots, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded apothecary bench: red-lacquer hutch with a teal tiled roof and gold trim, glowing elemental potions, books, a brass balance, an alembic, hanging herbs, a bubbling cauldron and a barrel.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
type Pts = [number, number][];
const D = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // ------------------------------------------------------------------------------------------------ palette
  const wood = (a: string, c: string, axis: "x" | "y" | "z") => cel(grain(a, c, { size: 0.016, axis }));
  const WOOD_X = wood("#e0a468", "#cb8a52", "x");
  const WOOD_X2 = wood("#d29358", "#bd7a46", "x");
  const DARK_X = wood("#a85a36", "#93482b", "x");
  const DARK_Y = wood("#a85a36", "#93482b", "y");
  const DARK_Z = wood("#a85a36", "#93482b", "z");
  const SEAM = cel("#8a4529", "#6d3326");
  const GOLD = cel("#ffdb62", "#d9902c");
  const GOLD_DK = cel("#e3ab45", "#a8681f");
  const RED = cel("#d9483b", "#a02a3e");
  const TEAL = cel("#2fb5a8", "#1d8a93");
  const TEAL_DK = cel("#1f7f88", "#165a73");
  const CREAM = cel("#fff0cf", "#ecc99a");
  const PORCELAIN = cel("#fffaf0", "#cbd9ea");
  const IRON = cel("#5d6485", "#383b63");
  const STONE = cel(mottle("#cfc7b6", "#b3ab9f", { size: 0.05, contrast: 0.8 }), "#8f8aa0");
  const GLASS = cel("#e2f8f6", "#a6d3e2");
  const CORK = cel("#d6a470", "#a9744f");
  const PAPER = cel("#fff3d4", "#ebcf9d");
  const BRASS_PAN = cel("#ffd35a", "#c98022");
  const LEATHER_RED = cel(mottle("#b53a4a", "#9c2f46", { size: 0.04, contrast: 0.7 }), "#6d203f");
  const LEATHER_TEAL = cel(mottle("#2a9aa3", "#237f93", { size: 0.04, contrast: 0.7 }), "#1b5878");
  const LEATHER_PURPLE = cel(mottle("#8e5cc4", "#7a49b3", { size: 0.04, contrast: 0.7 }), "#4c3489");
  const LEATHER_GREEN = cel(mottle("#5eab4e", "#4b9547", { size: 0.04, contrast: 0.7 }), "#31704a");
  const LEATHER_BROWN = cel(mottle("#a8683d", "#925730", { size: 0.04, contrast: 0.7 }), "#68402c");
  const WICKER = cel(stripes("#e5b86a", "#c48a45", { size: 0.022, axis: "y", width: 0.55, wobble: 0.15 }), "#8e5f3e");
  const BURLAP = cel(mottle("#ecd9a6", "#d6bd82", { size: 0.03, contrast: 0.8 }), "#b09063");
  const SOIL = cel("#6a4630", "#432d33");

  const FLAME_O = "#ff9a3c";
  const FLAME_Y = "#ffe680";
  const WHITE = "#ffffff";
  const EL = {
    pyro: { c: "#ff6a3d" },
    hydro: { c: "#3d8bff" },
    dendro: { c: "#86e23f" },
    electro: { c: "#b46bff" },
    cryo: { c: "#7fe8ff" },
    anemo: { c: "#46f0c0" },
    geo: { c: "#ffcb3d" },
  };
  type El = keyof typeof EL;

  // ------------------------------------------------------------------------------------------------ helpers
  const bx = (w: number, h: number, d: number, c: string | Paint, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, ...o });
  const cy = (rt: number, rb: number, h: number, seg: number, c: string | Paint, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, ...o });
  const sp = (r: number, c: string | Paint, at: P3, o: PartOptions = {}, ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), c, { at, ...o });
  const tor = (rr: number, t: number, c: string | Paint, at: P3, o: PartOptions = {}, seg = 12) =>
    b.part(new THREE.TorusGeometry(rr, t, 5, seg), c, { at, rotation: [90, 0, 0], ...o });
  const lat = (outline: Pts, c: string | Paint, at: P3, o: { segments?: number; smoothing?: number; spin?: number } = {}) =>
    b.lathe(outline, { at, color: c, segments: 12, ...o });
  const rod = (a: P3, c2: P3, r: number, c: string | Paint) => b.rod(a, c2, r, c, { sides: 6 });
  const sc = (pts: Pts, s: number): Pts => pts.map(([r, h]) => [r * s, h * s]);
  const q = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D));

  /** A rotated local frame, for placing boxes and planes on a tilted or turned object. */
  function grp(origin: P3, rot: P3) {
    const Q = q(...rot);
    const O = new THREE.Vector3(...origin);
    return {
      pt: (l: P3): P3 => {
        const v = new THREE.Vector3(...l).applyQuaternion(Q).add(O);
        return [v.x, v.y, v.z];
      },
      dir: (l: P3): P3 => {
        const v = new THREE.Vector3(...l).applyQuaternion(Q);
        return [v.x, v.y, v.z];
      },
      o: (rot2: P3 = [0, 0, 0]): PartOptions => ({ quat: Q.clone().multiply(q(...rot2)) }),
    };
  }

  const plane = (w: number, h: number, at: P3, dir: P3, up: P3, texture: THREE.Texture, color = WHITE) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", up, texture });

  // ------------------------------------------------------------------------------------------------ textures
  const star = (cx: number, cy2: number, r: number, c: string) =>
    `<path d="M${cx} ${cy2 - r} Q${cx + r * 0.18} ${cy2 - r * 0.18} ${cx + r} ${cy2} Q${cx + r * 0.18} ${cy2 + r * 0.18} ${cx} ${cy2 + r} Q${cx - r * 0.18} ${cy2 + r * 0.18} ${cx - r} ${cy2} Q${cx - r * 0.18} ${cy2 - r * 0.18} ${cx} ${cy2 - r}Z" fill="${c}"/>`;

  const rugBand = (() => {
    let s = "";
    for (let i = 0; i < 22; i++) {
      const x = 14 + i * 11.5;
      s += `<path d="M${x} 10 l5.5 4 l-5.5 4 l-5.5 -4Z" fill="#2a8c92"/><path d="M${x} 142 l5.5 4 l-5.5 4 l-5.5 -4Z" fill="#2a8c92" transform="translate(0 -4)"/>`;
    }
    return s;
  })();
  const RUG = svg(
    `<svg viewBox="0 0 280 160">
    <rect width="280" height="160" fill="#2a8c92"/>
    <rect x="4" y="4" width="272" height="152" fill="none" stroke="#ffd75e" stroke-width="3"/>
    <rect x="10" y="10" width="260" height="140" fill="#f4e2b6"/>
    ${rugBand}
    <rect x="22" y="22" width="236" height="116" fill="#c8453d"/>
    <rect x="26" y="26" width="228" height="108" fill="none" stroke="#ffd75e" stroke-width="2"/>
    <rect x="32" y="32" width="216" height="96" fill="#e7cf9d"/>
    <ellipse cx="140" cy="80" rx="70" ry="40" fill="#2f9aa0" stroke="#ffd75e" stroke-width="3"/>
    <ellipse cx="140" cy="80" rx="52" ry="29" fill="#f4e2b6" stroke="#c8453d" stroke-width="2"/>
    <path d="M140 54 L163 80 L140 106 L117 80Z" fill="#c8453d" stroke="#ffd75e" stroke-width="2.5"/>
    <circle cx="140" cy="80" r="9" fill="#ffd75e"/><circle cx="140" cy="80" r="4" fill="#2f9aa0"/>
    ${[48, 232]
      .map(
        (x) =>
          `<path d="M${x} 80 q-10 -22 -18 -30 q8 24 18 30 q-8 20 -18 30 q10 -8 18 -30Z" fill="#2f9aa0" stroke="#ffd75e" stroke-width="2"/>`,
      )
      .join("")}
    ${[
      [42, 42],
      [238, 42],
      [42, 118],
      [238, 118],
    ]
      .map(([x, y]) => star(x, y, 9, "#c8453d") + `<circle cx="${x}" cy="${y}" r="2.5" fill="#ffd75e"/>`)
      .join("")}
  </svg>`,
    { size: 640 },
  );

  const RUNNER = svg(
    `<svg viewBox="0 0 120 52">
    <rect width="120" height="52" fill="#fff0cf"/>
    <rect x="1.5" y="1.5" width="117" height="49" fill="none" stroke="#2fb5a8" stroke-width="3"/>
    <rect x="6" y="6" width="108" height="40" fill="none" stroke="#ffd75e" stroke-width="1.5"/>
    ${Array.from({ length: 11 }, (_, i) => `<circle cx="${10 + i * 10}" cy="12" r="2" fill="#2fb5a8"/><circle cx="${10 + i * 10}" cy="40" r="2" fill="#2fb5a8"/>`).join("")}
    <path d="M60 14 l10 12 l-10 12 l-10 -12Z" fill="#e0643d" stroke="#ffd75e" stroke-width="1.5"/>
    <circle cx="60" cy="26" r="4" fill="#ffd75e"/>
    <path d="M30 26 q10 -9 20 0 q-10 9 -20 0Z M90 26 q-10 -9 -20 0 q10 9 20 0Z" fill="#2fb5a8" stroke="#ffd75e" stroke-width="1"/>
  </svg>`,
    { size: 480 },
  );

  const CHART = svg(
    `<svg viewBox="0 0 100 72">
    <rect x="0" y="0" width="100" height="5" rx="2.5" fill="#a85a36"/><rect x="0" y="67" width="100" height="5" rx="2.5" fill="#a85a36"/>
    <circle cx="1.5" cy="2.5" r="2.5" fill="#ffd75e"/><circle cx="98.5" cy="2.5" r="2.5" fill="#ffd75e"/>
    <circle cx="1.5" cy="69.5" r="2.5" fill="#ffd75e"/><circle cx="98.5" cy="69.5" r="2.5" fill="#ffd75e"/>
    <path d="M4 5 H96 V67 H4Z" fill="#fff0cf"/>
    <path d="M4 5 H96 V67 H4Z" fill="none" stroke="#d9a03a" stroke-width="1.2"/>
    <circle cx="50" cy="36" r="22" fill="none" stroke="#2f9aa0" stroke-width="2"/>
    <circle cx="50" cy="36" r="15" fill="none" stroke="#c8453d" stroke-width="1.4"/>
    <path d="M50 14 L69 47 H31Z M50 58 L31 25 H69Z" fill="none" stroke="#2f9aa0" stroke-width="1.4"/>
    ${[0, 1, 2, 3, 4, 5, 6]
      .map((i) => {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const cols = ["#ff6a3d", "#3d8bff", "#86e23f", "#b46bff", "#7fe8ff", "#46f0c0", "#ffcb3d"];
        return `<circle cx="${50 + Math.cos(a) * 22}" cy="${36 + Math.sin(a) * 22}" r="5" fill="${cols[i]}" stroke="#3a2a4a" stroke-width="1.2"/>`;
      })
      .join("")}
    <circle cx="50" cy="36" r="5" fill="#ffd75e" stroke="#3a2a4a" stroke-width="1.2"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M8 ${14 + i * 5} h${14 - (i % 2) * 4}" stroke="#7d5a45" stroke-width="1.3" stroke-linecap="round"/><path d="M92 ${14 + i * 5} h${-14 + (i % 2) * 4}" stroke="#7d5a45" stroke-width="1.3" stroke-linecap="round"/>`).join("")}
    ${[0, 1, 2].map((i) => `<path d="M10 ${50 + i * 5} h${22 - i * 3}" stroke="#7d5a45" stroke-width="1.3" stroke-linecap="round"/><path d="M90 ${50 + i * 5} h${-22 + i * 4}" stroke="#7d5a45" stroke-width="1.3" stroke-linecap="round"/>`).join("")}
  </svg>`,
    { size: 512 },
  );

  const CIRCLE = svg(
    `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#6ff0dc" stroke-width="3.2"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#ffd75e" stroke-width="2.4"/>
    ${Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `<path d="M${50 + Math.cos(a) * 38} ${50 + Math.sin(a) * 38} L${50 + Math.cos(a) * 46} ${50 + Math.sin(a) * 46}" stroke="#ffd75e" stroke-width="2.4"/>`;
    }).join("")}
    <path d="M50 14 L81 68 H19Z" fill="none" stroke="#6ff0dc" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 86 L19 32 H81Z" fill="none" stroke="#ffd75e" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#6ff0dc" stroke-width="3"/>
    <circle cx="50" cy="50" r="5" fill="#fff6c8"/>
  </svg>`,
    { size: 384 },
  );

  const PLATE = svg(
    `<svg viewBox="0 0 100 34">
    <rect x="1" y="1" width="98" height="32" rx="5" fill="#1f6f78" stroke="#ffd75e" stroke-width="2.4"/>
    <rect x="5" y="5" width="90" height="24" rx="3" fill="none" stroke="#e3ab45" stroke-width="1"/>
    <g fill="none" stroke="#ffd75e" stroke-width="2" stroke-linecap="round">
      <path d="M44 17 C38 6 22 8 22 16 C22 22 30 22 30 17 C30 14 26 14 26 16"/>
      <path d="M56 17 C62 6 78 8 78 16 C78 22 70 22 70 17 C70 14 74 14 74 16"/>
      <path d="M44 17 C38 28 22 26 14 18 M56 17 C62 28 78 26 86 18"/>
    </g>
    <path d="M50 8 L56 17 L50 26 L44 17Z" fill="#ffd75e"/>
    <circle cx="50" cy="17" r="2.2" fill="#c8453d"/>
  </svg>`,
    { size: 256 },
  );

  const DOOR = svg(
    `<svg viewBox="0 0 60 80">
    <rect x="1" y="1" width="58" height="78" rx="4" fill="#1f6f78" stroke="#ffd75e" stroke-width="2.4"/>
    <rect x="6" y="6" width="48" height="68" rx="2" fill="none" stroke="#e3ab45" stroke-width="1"/>
    ${[
      [6, 6, 1, 1],
      [54, 6, -1, 1],
      [6, 74, 1, -1],
      [54, 74, -1, -1],
    ]
      .map(
        ([x, y, sx, sy]) =>
          `<path d="M${x} ${y} q${sx * 14} 0 ${sx * 14} ${sy * 12} q${-sx * 8} ${sy * -4} ${-sx * 8} ${sy * -8} q${-sx * 4} 0 ${-sx * 6} ${sy * 3}Z" fill="#ffd75e"/>`,
      )
      .join("")}
    <g transform="translate(30 40)">
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<ellipse cx="0" cy="-11" rx="4" ry="8" fill="#ffd75e" stroke="#a8681f" stroke-width="0.8" transform="rotate(${i * 45})"/>`).join("")}
      <circle r="6.5" fill="#c8453d" stroke="#ffd75e" stroke-width="1.6"/>
      <circle r="2.6" fill="#ffd75e"/>
    </g>
    <path d="M30 6 V16 M30 64 V74" stroke="#ffd75e" stroke-width="2"/>
  </svg>`,
    { size: 256 },
  );

  const coverTex = (base: string, deep: string, gem: string) =>
    svg(
      `<svg viewBox="0 0 60 80">
    <rect width="60" height="80" fill="${base}"/>
    <rect x="3" y="3" width="54" height="74" fill="none" stroke="#ffd75e" stroke-width="2"/>
    <rect x="6.5" y="6.5" width="47" height="67" fill="none" stroke="#ffd75e" stroke-width="0.8"/>
    ${[
      [6, 6, 1, 1],
      [54, 6, -1, 1],
      [6, 74, 1, -1],
      [54, 74, -1, -1],
    ]
      .map(([x, y, sx, sy]) => `<path d="M${x} ${y} q${sx * 12} 0 ${sx * 12} ${sy * 9} q${-sx * 7} ${sy * -3} ${-sx * 9} ${sy * -6}Z" fill="#ffd75e"/>`)
      .join("")}
    <g transform="translate(30 40)">
      <path d="M0 -20 L14 0 L0 20 L-14 0Z" fill="${deep}" stroke="#ffd75e" stroke-width="1.6"/>
      <path d="M0 -12 L8 0 L0 12 L-8 0Z" fill="none" stroke="#ffd75e" stroke-width="1"/>
      <circle r="5.2" fill="${gem}" stroke="#ffd75e" stroke-width="1.2"/>
      <circle cx="-1.5" cy="-1.5" r="1.4" fill="#fff"/>
      ${[0, 90, 180, 270].map((a) => `<circle cx="0" cy="-26" r="1.6" fill="#ffd75e" transform="rotate(${a})"/>`).join("")}
    </g>
  </svg>`,
      { size: 160 },
    );
  const COVERS = {
    red: coverTex("#a73344", "#7d2038", "#ffcb3d"),
    teal: coverTex("#228e9a", "#17657e", "#ff8a5a"),
    purple: coverTex("#7a4cb8", "#563790", "#7fe8ff"),
    green: coverTex("#4c9a47", "#2f7048", "#ffe27a"),
    brown: coverTex("#94562f", "#6d3d2a", "#46f0c0"),
  };
  const spineTex = (base: string, mark: string, seed: number) =>
    svg(
      `<svg viewBox="0 0 24 100">
    <rect width="24" height="100" fill="${base}"/>
    <rect x="0" y="4" width="24" height="3" fill="#ffd75e"/><rect x="0" y="9" width="24" height="1.2" fill="#ffd75e"/>
    <rect x="0" y="93" width="24" height="3" fill="#ffd75e"/><rect x="0" y="89" width="24" height="1.2" fill="#ffd75e"/>
    <rect x="4" y="15" width="16" height="${28 + (seed % 3) * 5}" rx="2" fill="#fff0cf" stroke="#ffd75e" stroke-width="1"/>
    <path d="M7 ${22} h10 M7 ${27} h10 M7 ${32} h${6 + (seed % 3) * 2}" stroke="#7d5a45" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M12 56 l6 8 l-6 8 l-6 -8Z" fill="${mark}" stroke="#ffd75e" stroke-width="1.2"/>
    <circle cx="12" cy="80" r="2.4" fill="#ffd75e"/>
  </svg>`,
      { size: 128 },
    );
  const SPINES = [
    spineTex("#a73344", "#ffcb3d", 0),
    spineTex("#228e9a", "#ff8a5a", 1),
    spineTex("#7a4cb8", "#7fe8ff", 2),
    spineTex("#4c9a47", "#ffe27a", 3),
    spineTex("#94562f", "#46f0c0", 4),
    spineTex("#d4742d", "#fff0cf", 5),
  ];

  const PAGE_L = svg(
    `<svg viewBox="0 0 70 100">
    <rect width="70" height="100" fill="#fff3d4"/>
    <circle cx="35" cy="34" r="22" fill="none" stroke="#2f9aa0" stroke-width="1.6"/>
    <circle cx="35" cy="34" r="14" fill="none" stroke="#c8453d" stroke-width="1.2"/>
    <path d="M35 14 L52 43 H18Z M35 54 L18 25 H52Z" fill="none" stroke="#7a4cb8" stroke-width="1.3"/>
    <circle cx="35" cy="34" r="4" fill="#ffd75e" stroke="#7d5a45" stroke-width="0.8"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M8 ${66 + i * 3.6} h${54 - ((i * 7) % 18)}" stroke="#8a6a55" stroke-width="1.1" stroke-linecap="round"/>`).join("")}
    <path d="M0 0 H5 V100 H0Z" fill="#e8c88f"/>
  </svg>`,
    { size: 256 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 70 100">
    <rect width="70" height="100" fill="#fff3d4"/>
    <rect x="9" y="9" width="14" height="14" rx="2" fill="#c8453d"/><path d="M13 20 L16 12 L19 20 M14 17.5 h4" stroke="#ffd75e" stroke-width="1.4" fill="none"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${i < 2 ? 27 : 9} ${12 + i * 3.6} h${i < 2 ? 34 : 52 - ((i * 5) % 14)}" stroke="#8a6a55" stroke-width="1.1" stroke-linecap="round"/>`).join("")}
    <path d="M12 44 q8 -10 16 0 t16 0 t14 0" stroke="#2f9aa0" stroke-width="1.6" fill="none"/>
    <rect x="9" y="52" width="24" height="22" rx="2" fill="#e9f6e0" stroke="#3f9a58" stroke-width="1.2"/>
    <path d="M21 72 V58 M21 64 q-6 -2 -8 -6 M21 62 q6 -2 8 -6" stroke="#3f9a58" stroke-width="1.4" fill="none"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M38 ${54 + i * 3.6} h${24 - ((i * 5) % 10)}" stroke="#8a6a55" stroke-width="1.1" stroke-linecap="round"/>`).join("")}
    ${[0, 1, 2, 3].map((i) => `<path d="M9 ${80 + i * 3.6} h${52 - ((i * 9) % 20)}" stroke="#8a6a55" stroke-width="1.1" stroke-linecap="round"/>`).join("")}
    <path d="M65 0 H70 V100 H65Z" fill="#e8c88f"/>
  </svg>`,
    { size: 256 },
  );

  const glyph = (el: El, col: string) => {
    const ink = "#3a2a4a";
    const stroked = (d: string) =>
      `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="${ink}" stroke-width="10"/><path d="${d}" stroke="${col}" stroke-width="5.2"/></g>`;
    const filled = (d: string) => `<path d="${d}" fill="${col}" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round"/>`;
    switch (el) {
      case "pyro":
        return filled("M20 3 C27 12 33 18 33 26 A13 13 0 0 1 7 26 C7 19 12 16 14 9 C16 12 18 14 20 3Z");
      case "hydro":
        return filled("M20 4 C28 16 33 21 33 27 A13 13 0 0 1 7 27 C7 21 12 16 20 4Z");
      case "dendro":
        return filled("M7 33 C5 15 18 5 34 6 C35 21 27 33 11 33Z") + stroked("M9 31 L27 13");
      case "electro":
        return filled("M24 3 L9 23 H19 L15 37 L31 16 H21Z");
      case "cryo":
        return stroked("M20 5V35M7 12.5L33 27.5M7 27.5L33 12.5");
      case "anemo":
        return stroked("M20 20 a3 3 0 1 1 3.5 3.5 a7.5 7.5 0 1 1 -7.5 -7.5 a12 12 0 1 1 12 12");
      case "geo":
        return filled("M20 3 L33 14 L28 34 H12 L7 14Z");
    }
  };
  const labelTex = (el: El) =>
    svg(
      `<svg viewBox="0 0 40 32">
    <rect x="1" y="1" width="38" height="30" rx="4.5" fill="#fff3d6" stroke="#b9772e" stroke-width="2"/>
    <rect x="4" y="4" width="32" height="24" rx="2.5" fill="none" stroke="#e8c56a" stroke-width="0.9"/>
    <g transform="translate(10 5.5) scale(0.5)">${glyph(el, EL[el].c)}</g>
  </svg>`,
      { size: 128 },
    );
  const LABELS = Object.fromEntries((Object.keys(EL) as El[]).map((k) => [k, labelTex(k)])) as unknown as Record<El, THREE.Texture>;

  const TASSEL = svg(
    `<svg viewBox="0 0 20 64">
    <g stroke="#e24a3a" stroke-width="2.2" stroke-linecap="round">${[3, 6, 9, 11, 14, 17].map((x) => `<path d="M${x} 62 L${10 + (x - 10) * 0.3} 30"/>`).join("")}</g>
    <g stroke="#ffd75e" stroke-width="1.2" stroke-linecap="round">${[4.5, 8, 12.5, 15.5].map((x) => `<path d="M${x} 62 L${10 + (x - 10) * 0.3} 32"/>`).join("")}</g>
    <path d="M5 30 Q10 24 15 30 L14 34 H6Z" fill="#ffd75e" stroke="#a8681f" stroke-width="1"/>
    <rect x="6.5" y="21" width="7" height="4" rx="1" fill="#ffd75e" stroke="#a8681f" stroke-width="0.8"/>
    <circle cx="10" cy="14" r="5.5" fill="#e24a3a" stroke="#8d2a3a" stroke-width="1"/>
    <circle cx="8.3" cy="12.3" r="1.5" fill="#ffb09a"/>
    <path d="M10 8 V0" stroke="#ffd75e" stroke-width="2"/>
  </svg>`,
    { size: 128 },
  );

  const leafTex = (a: string, c: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 40 64">
    <path d="M20 62 C19 52 17 44 20 36" stroke="${c}" stroke-width="2.6" fill="none"/>
    <path d="M20 61 C4 50 -1 24 20 2 C41 24 36 50 20 61Z" fill="${a}" stroke="#2a5a3a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M20 61 C36 50 41 24 20 2 C26 20 26 46 20 61Z" fill="${c}"/>
    <path d="M20 58 V8 M20 40 L9 28 M20 40 L31 28 M20 26 L12 16 M20 26 L28 16" stroke="${vein}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M12 38 C9 30 12 20 17 14" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
      { size: 128 },
    );
  const LEAF_A = leafTex("#7fd05a", "#3f9a58", "#2f7a46");
  const LEAF_B = leafTex("#a6e068", "#52a95a", "#3c8a4a");
  const LEAF_T = leafTex("#43c7a8", "#23907f", "#1d6f6a");

  const FERN = svg(
    `<svg viewBox="0 0 40 80">
    <path d="M20 79 C20 56 21 30 20 4" stroke="#2f7a46" stroke-width="2.4" fill="none"/>
    ${Array.from({ length: 9 }, (_, i) => {
      const y = 70 - i * 7.6;
      const w = 16 - i * 1.4;
      return `<path d="M20 ${y} q${-w * 0.6} ${-w * 0.2} ${-w} ${-w * 0.7} q${w * 0.55} ${w * 0.1} ${w} ${w * 0.7}Z" fill="#6fcb55" stroke="#2a5a3a" stroke-width="0.9"/><path d="M20 ${y} q${w * 0.6} ${-w * 0.2} ${w} ${-w * 0.7} q${-w * 0.55} ${w * 0.1} ${-w} ${w * 0.7}Z" fill="#4fae52" stroke="#2a5a3a" stroke-width="0.9"/>`;
    }).join("")}
  </svg>`,
    { size: 160 },
  );

  const LAVENDER = svg(
    `<svg viewBox="0 0 24 80">
    <path d="M12 79 C12 60 12 40 12 20" stroke="#3f8a4a" stroke-width="2" fill="none"/>
    <path d="M12 56 q-6 -4 -9 -12 M12 52 q6 -4 9 -12" stroke="#3f8a4a" stroke-width="1.6" fill="none"/>
    ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${12 + (i % 2 ? 2.6 : -2.6)}" cy="${34 - i * 4}" rx="3.4" ry="3" fill="${i % 3 ? "#9a6bdc" : "#b78af0"}" stroke="#4c3489" stroke-width="0.9"/>`).join("")}
    <ellipse cx="12" cy="3" rx="3" ry="3.2" fill="#b78af0" stroke="#4c3489" stroke-width="0.9"/>
  </svg>`,
    { size: 128 },
  );

  const LILY = svg(
    `<svg viewBox="0 0 50 72">
    <path d="M25 71 C25 55 25 42 25 30" stroke="#2f7a46" stroke-width="2.6" fill="none"/>
    <path d="M25 58 C12 56 6 48 6 42 C16 42 22 48 25 58Z" fill="#6fcb55" stroke="#2a5a3a" stroke-width="1"/>
    <path d="M25 52 C38 50 44 42 44 36 C34 36 28 42 25 52Z" fill="#4fae52" stroke="#2a5a3a" stroke-width="1"/>
    <g transform="translate(25 22)">
      ${[0, 72, 144, 216, 288].map((a) => `<path d="M0 0 C-7 -6 -6 -16 0 -21 C6 -16 7 -6 0 0Z" fill="#f4fbff" stroke="#6fa8d8" stroke-width="1" transform="rotate(${a})"/><path d="M0 -3 C-2 -8 -2 -13 0 -17" stroke="#8fd7ff" stroke-width="1.6" fill="none" transform="rotate(${a})"/>`).join("")}
      <circle r="4.6" fill="#7fe8ff" stroke="#3d8bff" stroke-width="1.2"/><circle cx="-1.2" cy="-1.2" r="1.4" fill="#fff"/>
    </g>
  </svg>`,
    { size: 128 },
  );

  const HERB = svg(
    `<svg viewBox="0 0 40 80">
    <path d="M20 79 C20 56 20 34 20 6" stroke="#6a8a3a" stroke-width="2.2" fill="none"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const y = 70 - i * 8.4;
      return `<path d="M20 ${y} q-10 -2 -15 -9 q10 -1 15 9Z" fill="${i % 2 ? "#8aa648" : "#6f9340"}" stroke="#3e5a2e" stroke-width="0.9"/><path d="M20 ${y - 4} q10 -2 15 -9 q-10 -1 -15 9Z" fill="${i % 2 ? "#6f9340" : "#8aa648"}" stroke="#3e5a2e" stroke-width="0.9"/>`;
    }).join("")}
  </svg>`,
    { size: 160 },
  );
  const HERB_R = svg(
    `<svg viewBox="0 0 40 80">
    <path d="M20 79 C20 56 20 34 20 6" stroke="#8a5a3a" stroke-width="2.2" fill="none"/>
    ${Array.from({ length: 7 }, (_, i) => {
      const y = 68 - i * 9;
      return `<circle cx="${12 + (i % 2) * 16}" cy="${y}" r="4" fill="#e04a4a" stroke="#8d2a3a" stroke-width="1"/><circle cx="${11 + (i % 2) * 16}" cy="${y - 1}" r="1.1" fill="#ffc0b0"/><path d="M${20} ${y + 2} q${i % 2 ? 5 : -5} -2 ${i % 2 ? -3 : 3} -4" stroke="#8a5a3a" stroke-width="1.2" fill="none"/>`;
    }).join("")}
    <path d="M20 12 q-7 -3 -9 -10 q8 0 9 10Z M20 12 q7 -3 9 -10 q-8 0 -9 10Z" fill="#5eab4e" stroke="#2a5a3a" stroke-width="0.9"/>
  </svg>`,
    { size: 160 },
  );

  const SPARKLE_G = svg(`<svg viewBox="0 0 40 40">${star(20, 20, 19, "#ffe27a")}${star(20, 20, 9, "#ffffff")}</svg>`, { size: 96 });
  const SPARKLE_T = svg(`<svg viewBox="0 0 40 40">${star(20, 20, 19, "#7ff5e0")}${star(20, 20, 9, "#ffffff")}</svg>`, { size: 96 });

  const FEATHER = svg(
    `<svg viewBox="0 0 20 70">
    <path d="M10 69 V2" stroke="#fff3d4" stroke-width="1.6"/>
    <path d="M10 66 C2 50 0 30 10 2 C20 30 18 50 10 66Z" fill="#f2fbff" stroke="#6fa8d8" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M10 66 C18 50 20 30 10 2 C13 24 13 46 10 66Z" fill="#9ed6f2"/>
    <path d="M10 66 V4" stroke="#fff3d4" stroke-width="1.2"/>
    ${[12, 22, 32, 42].map((y) => `<path d="M10 ${y + 10} L3 ${y}" stroke="#6fa8d8" stroke-width="0.8"/>`).join("")}
  </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------------------------------------ floor + rug
  const F = 0.012; // rug thickness: floor items stand on it
  bx(3.7, F, 1.95, TEAL_DK, [0.05, F / 2, 0.2]);
  plane(3.6, 1.85, [0.05, F + 0.0016, 0.2], [0, 1, 0], [0, 0, -1], RUG);
  // rug is 280x160; plane aspect is set above so the pattern stretches slightly

  // ------------------------------------------------------------------------------------------------ the bench
  const TOPY = 0.9;
  const TOP_WOOD = paint((p, n) => {
    if (n.y > 0.5) {
      const f = (((p.z / 0.12) % 1) + 1) % 1;
      if (f < 0.03) return SEAM;
      return Math.floor(p.z / 0.12) % 2 ? WOOD_X : WOOD_X2;
    }
    return DARK_X;
  });
  bx(1.92, 0.06, 0.86, TOP_WOOD, [0, 0.87, 0]);
  // gold inlay on the front edge and corner caps
  bx(1.8, 0.016, 0.006, GOLD, [0, 0.87, 0.431]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      bx(0.034, 0.068, 0.034, GOLD, [sx * 0.943, 0.87, sz * 0.413]);
    }
  bx(1.86, 0.012, 0.012, GOLD_DK, [0, 0.842, 0.41]);

  // table runner
  plane(1.5, 0.64, [-0.12, TOPY + 0.0016, 0.1], [0, 1, 0], [0, 0, -1], RUNNER);

  // legs (left side) with gold feet
  for (const lz of [-0.33, 0.33]) {
    bx(0.09, 0.82, 0.09, RED, [-0.86, F + 0.41, lz]);
    bx(0.108, 0.036, 0.108, GOLD, [-0.86, F + 0.018, lz]);
    bx(0.1, 0.024, 0.1, GOLD_DK, [-0.86, 0.79, lz]);
  }
  // rails + back panel + low shelf
  bx(0.99, 0.09, 0.036, DARK_X, [-0.4, 0.795, 0.335]);
  bx(0.036, 0.09, 0.66, DARK_Z, [-0.86, 0.795, 0]);
  bx(0.99, 0.54, 0.02, DARK_X, [-0.4, 0.55, -0.34]);
  bx(1.0, 0.04, 0.68, WOOD_X, [-0.4, 0.26, 0]);
  bx(1.0, 0.014, 0.014, GOLD, [-0.4, 0.26, 0.345]);
  // front rail inlay studs + corner scroll brackets
  for (let i = 0; i < 7; i++) sp(0.012, GOLD, [-0.8 + i * 0.13, 0.795, 0.357], {}, 6, 4);
  const bracketOutline: Pts = [
    [0, 0],
    [0.14, 0],
    [0.09, 0.012],
    [0.045, 0.04],
    [0.012, 0.09],
    [0, 0.14],
  ];
  for (const [x, dir] of [
    [-0.8, 1],
    [0.0, -1],
  ] as const) {
    b.extrude(bracketOutline, { at: [x, 0.75, 0.34], x: [dir, 0, 0], y: [0, -1, 0], thickness: 0.026, bevel: 0.004, color: GOLD_DK });
  }

  // cabinet (right half): plinth, carcass, drawers, doors
  bx(0.82, 0.05, 0.74, DARK_X, [0.49, F + 0.025, 0.0]);
  bx(0.78, 0.78, 0.7, DARK_Y, [0.49, 0.45, 0]);
  bx(0.82, 0.02, 0.74, GOLD_DK, [0.49, 0.062 + F * 0.4, 0]);
  for (const dy of [0.755, 0.585]) {
    bx(0.68, 0.15, 0.028, DARK_X, [0.49, dy, 0.364]);
    bx(0.64, 0.12, 0.006, WOOD_X, [0.49, dy, 0.38]);
    plane(0.22, 0.075, [0.28, dy, 0.3795], [0, 0, 1], [0, 1, 0], PLATE);
    plane(0.22, 0.075, [0.7, dy, 0.3795], [0, 0, 1], [0, 1, 0], PLATE);
    tor(0.022, 0.005, GOLD, [0.49, dy - 0.005, 0.395], { rotation: [0, 0, 0] });
    cy(0.017, 0.017, 0.012, 8, GOLD, [0.49, dy + 0.025, 0.385], { rotation: [90, 0, 0] });
    sp(0.012, GOLD, [0.49, dy + 0.025, 0.392], {}, 6, 4);
  }
  // doors
  for (const dx of [0.3235, 0.6565]) {
    bx(0.325, 0.43, 0.026, DARK_X, [dx, 0.29, 0.362]);
    plane(0.28, 0.36, [dx, 0.29, 0.376], [0, 0, 1], [0, 1, 0], DOOR);
    for (const hy of [0.12, 0.46]) bx(0.026, 0.045, 0.012, GOLD, [dx + (dx < 0.49 ? -0.15 : 0.15), hy, 0.378]);
    sp(0.016, GOLD, [dx + (dx < 0.49 ? 0.1 : -0.1), 0.29, 0.386], {}, 8, 5);
    cy(0.006, 0.006, 0.014, 6, GOLD_DK, [dx + (dx < 0.49 ? 0.1 : -0.1), 0.29, 0.378], { rotation: [90, 0, 0] });
  }
  bx(0.7, 0.014, 0.008, GOLD, [0.49, 0.675, 0.372]);
  // side hook with a hanging tassel on the cabinet's left end of the top rail
  const tassels: THREE.Vector3[] = [];

  // ------------------------------------------------------------------------------------------------ the hutch
  for (const sx of [-1, 1]) {
    bx(0.075, 1.02, 0.075, RED, [sx * 0.9, TOPY + 0.51, -0.36]);
    bx(0.095, 0.03, 0.095, GOLD, [sx * 0.9, TOPY + 0.015, -0.36]);
    bx(0.095, 0.03, 0.095, GOLD, [sx * 0.9, 1.88, -0.36]);
    bx(0.088, 0.02, 0.088, GOLD_DK, [sx * 0.9, 1.31 - 0.18, -0.36]);
    bx(0.088, 0.02, 0.088, GOLD_DK, [sx * 0.9, 1.6 - 0.18, -0.36]);
  }
  const BACKBOARD = paint((p, n) => {
    if (n.z < 0.5) return DARK_X;
    const f = (((p.x / 0.2) % 1) + 1) % 1;
    return f < 0.02 ? cel("#c9a56d", "#9a7a5f") : cel("#f6e4b8", "#dcbf8d");
  });
  bx(1.78, 1.02, 0.03, BACKBOARD, [0, TOPY + 0.51, -0.4]);
  // gold border on the backboard
  bx(1.74, 0.012, 0.008, GOLD, [0, 1.87, -0.382]);
  bx(1.74, 0.012, 0.008, GOLD, [0, 0.93, -0.382]);
  // shelves with front lips and brackets
  for (const sy of [1.3, 1.6]) {
    bx(1.76, 0.034, 0.27, DARK_X, [0, sy, -0.24]);
    bx(1.76, 0.014, 0.012, GOLD, [0, sy, -0.103]);
    bx(1.76, 0.012, 0.008, GOLD_DK, [0, sy + 0.022, -0.35]);
    for (const sx of [-1, 1]) {
      b.extrude(
        [
          [0, 0],
          [0.15, 0],
          [0.15, 0.012],
          [0.1, 0.02],
          [0.05, 0.06],
          [0.02, 0.12],
          [0, 0.16],
        ],
        { at: [sx * 0.83, sy - 0.017, -0.105], x: [0, 0, -1], y: [0, -1, 0], thickness: 0.018, bevel: 0.003, color: GOLD_DK },
      );
    }
  }
  // wall dressing: chart, notes, transmutation circle
  plane(0.5, 0.36, [0.28, 1.1, -0.382], [0, 0, 1], [0, 1, 0], CHART);
  glow(plane(0.3, 0.3, [0, 1.755, -0.382], [0, 0, 1], [0, 1, 0], CIRCLE), 1);
  plane(0.14, 0.18, [-0.42, 1.12, -0.382], [0, 0, 1], [0, 1, 0], labelTex("geo"));
  plane(0.1, 0.12, [-0.53, 1.07, -0.382], [0, 0, 1], [0, 1, 0], labelTex("hydro"), "#ffe9e9");
  // pins
  for (const [x, y] of [
    [0.1, 1.27],
    [0.46, 1.27],
    [-0.42, 1.2],
    [-0.53, 1.12],
  ])
    sp(0.007, RED, [x, y, -0.376], {}, 6, 4);

  // hanging pegs with a ladle, tongs and funnel (left of the backboard)
  for (const px of [-0.78, -0.66, -0.54]) cy(0.006, 0.006, 0.04, 6, GOLD_DK, [px, 1.14, -0.365], { rotation: [90, 0, 0] });
  // ladle
  rod([-0.78, 1.14, -0.352], [-0.78, 0.96, -0.352], 0.007, GOLD_DK);
  lat(
    [
      [0, 0],
      [0.03, 0.002],
      [0.04, 0.016],
      [0.036, 0.018],
      [0.028, 0.008],
      [0, 0.006],
    ],
    GOLD,
    [-0.78, 0.935, -0.352],
    { segments: 8 },
  );
  // tongs
  rod([-0.66, 1.14, -0.352], [-0.64, 0.95, -0.352], 0.006, IRON);
  rod([-0.66, 1.14, -0.352], [-0.68, 0.95, -0.352], 0.006, IRON);
  sp(0.012, GOLD, [-0.66, 1.14, -0.352], {}, 6, 4);
  // funnel
  b.part(
    new THREE.CylinderGeometry(0.055, 0.012, 0.09, 10, 1, true),
    GOLD,
    { at: [-0.54, 1.08, -0.345], rotation: [8, 0, 0] },
  );
  cy(0.01, 0.01, 0.07, 6, GOLD_DK, [-0.54, 1.005, -0.345]);

  // roof: curved tiled eave, ridge cap and finials
  const ROOF = paint((p, n) => {
    if (n.y > 0.1) {
      const f = (((p.x / 0.085) % 1) + 1) % 1;
      if (f < 0.1) return cel("#1b7f8a", "#14586f");
      return cel(Math.floor(p.x / 0.085) % 2 ? "#33bdb0" : "#2fb0a6", "#1d8a93");
    }
    if (n.y < -0.5) return DARK_X;
    return Math.abs(n.x) > 0.5 ? cel("#e4b04a", "#b87a2c") : TEAL;
  });
  b.extrude(
    [
      [-0.43, 0],
      [0.2, 0],
      [0.375, 0.058, "sharp"],
      [0.24, 0.058],
      [0.1, 0.1],
      [-0.05, 0.165],
      [-0.13, 0.205, "sharp"],
      [-0.3, 0.15],
      [-0.43, 0.09],
    ],
    { at: [0, 1.92, 0], x: [0, 0, 1], thickness: 2.26, smoothing: 1, color: ROOF },
  );
  rod([-1.14, 2.128, -0.13], [1.14, 2.128, -0.13], 0.024, GOLD);
  for (const sx of [-1, 1]) {
    sp(0.04, GOLD, [sx * 1.15, 2.14, -0.13], {}, 8, 6);
    b.spike([sx * 1.15, 2.16, -0.13], [0, 1, 0], 0.1, 0.02, { color: GOLD, sides: 6 });
  }
  // gable-end gold flame ornaments + roof edge trim
  for (const sx of [-1, 1]) {
    bx(0.01, 0.012, 0.64, GOLD, [sx * 1.135, 1.925, -0.05]);
  }
  // red lintel + rafter ends along the eave + hangers + herb rail
  bx(2.0, 0.07, 0.06, RED, [0, 1.885, 0.15]);
  bx(2.0, 0.012, 0.064, GOLD, [0, 1.85, 0.15]);
  for (let i = 0; i < 17; i++) {
    cy(0.017, 0.017, 0.022, 8, GOLD, [-0.96 + i * 0.12, 1.9, 0.275], { rotation: [90, 0, 0] });
    cy(0.011, 0.011, 0.01, 8, RED, [-0.96 + i * 0.12, 1.9, 0.288], { rotation: [90, 0, 0] });
  }
  for (const sx of [-1, 1]) {
    rod([sx * 0.88, 1.85, 0.15], [sx * 0.88, 1.772, 0.15], 0.006, GOLD_DK);
    tor(0.014, 0.004, GOLD, [sx * 0.88, 1.85, 0.15], { rotation: [0, 0, 0] }, 8);
  }
  rod([-0.93, 1.76, 0.15], [0.93, 1.76, 0.15], 0.014, DARK_X);
  for (const sx of [-1, 1]) sp(0.02, GOLD, [sx * 0.94, 1.76, 0.15], {}, 8, 6);
  // tassels at the eave corners
  for (const sx of [-1, 1]) {
    tassels.push(new THREE.Vector3(sx * 1.06, 1.918, 0.31));
  }

  // ------------------------------------------------------------------------------------------------ props
  const flame = (at: P3, s: number, c1 = FLAME_O, c2 = FLAME_Y) => {
    const prof: Pts = [
      [0, 0],
      [0.018, 0.008],
      [0.024, 0.024],
      [0.016, 0.046],
      [0.006, 0.064],
      [0, 0.074],
    ];
    glow(lat(sc(prof, s), c1, at, { segments: 6 }));
    glow(lat(sc(prof, s * 0.6), c2, [at[0], at[1] + 0.002 * s, at[2]], { segments: 6 }));
  };

  const candle = (x: number, y: number, z: number, s = 1) => {
    lat(
      sc(
        [
          [0, 0],
          [0.034, 0],
          [0.036, 0.008],
          [0.03, 0.014],
          [0.01, 0.016],
          [0.0, 0.016],
        ],
        s,
      ),
      GOLD,
      [x, y, z],
      { segments: 10 },
    );
    cy(0.018 * s, 0.02 * s, 0.1 * s, 8, CREAM, [x, y + 0.064 * s, z]);
    sp(0.012 * s, CREAM, [x + 0.012 * s, y + 0.1 * s, z + 0.012 * s], {}, 6, 4);
    cy(0.002, 0.002, 0.016 * s, 4, "#2a2230", [x, y + 0.122 * s, z]);
    flame([x, y + 0.126 * s, z], 0.9 * s);
  };

  const bookStack = (cx: number, cz: number) => {
    const specs: { w: number; h: number; d: number; rot: number; ox: number; oz: number; c: Paint; tex: THREE.Texture }[] = [
      { w: 0.25, h: 0.05, d: 0.18, rot: 4, ox: 0, oz: 0, c: LEATHER_RED, tex: COVERS.red },
      { w: 0.23, h: 0.042, d: 0.165, rot: -9, ox: 0.006, oz: -0.004, c: LEATHER_TEAL, tex: COVERS.teal },
      { w: 0.2, h: 0.036, d: 0.15, rot: 14, ox: -0.006, oz: 0.003, c: LEATHER_PURPLE, tex: COVERS.purple },
      { w: 0.17, h: 0.03, d: 0.125, rot: -4, ox: 0.004, oz: 0, c: LEATHER_GREEN, tex: COVERS.green },
    ];
    let y = TOPY;
    for (const s of specs) {
      const g = grp([cx + s.ox, y + s.h / 2, cz + s.oz], [0, s.rot, 0]);
      const o = g.o();
      bx(s.w, s.h - 0.004, s.d - 0.004, PAPER, g.pt([-0.004, 0, -0.004]), o);
      bx(s.w, 0.007, s.d, s.c, g.pt([0, -s.h / 2 + 0.0035, 0]), o);
      bx(s.w, 0.007, s.d, s.c, g.pt([0, s.h / 2 - 0.0035, 0]), o);
      bx(s.w, s.h, 0.012, s.c, g.pt([0, 0, s.d / 2 - 0.006]), o);
      for (const k of [-0.3, 0, 0.3]) bx(0.007, s.h + 0.003, 0.016, GOLD, g.pt([k * s.w, 0, s.d / 2 - 0.006]), o);
      for (const sx of [-1, 1]) bx(0.022, s.h + 0.003, 0.022, GOLD, g.pt([sx * (s.w / 2 - 0.011), 0, -s.d / 2 + 0.011]), o);
      plane(s.w * 0.72, s.d * 0.78, g.pt([-0.004, s.h / 2 + 0.0009, -0.004]), g.dir([0, 1, 0]), g.dir([0, 0, -1]), s.tex);
      y += s.h;
    }
    // bookmark ribbon hanging out of the red book
    const rb = grp([cx, TOPY + 0.025, cz], [0, 4, 0]);
    bx(0.014, 0.0025, 0.07, RED, rb.pt([0.06, 0.012, 0.115]), rb.o([0, 0, 0]));
    bx(0.014, 0.0025, 0.012, GOLD, rb.pt([0.06, 0.012, 0.152]), rb.o());
    return y;
  };

  // lectern with open grimoire
  const lectern = (cx: number, cz: number) => {
    b.extrude(
      [
        [-0.14, 0],
        [0.14, 0],
        [0.14, 0.045],
        [-0.14, 0.17],
      ],
      { at: [cx, TOPY, cz], x: [0, 0, 1], thickness: 0.34, bevel: 0.004, color: DARK_X },
    );
    bx(0.36, 0.014, 0.3, GOLD_DK, [cx, TOPY + 0.007, cz]);
    // slope: y from 0.17 (back, z-0.14) to 0.045 (front, z+0.14): angle atan(0.125/0.28) = 24°
    const ang = Math.atan2(0.125, 0.28) / D;
    const g = grp([cx, TOPY + 0.115, cz], [ang, 0, 0]);
    // covers
    bx(0.36, 0.01, 0.235, LEATHER_PURPLE, g.pt([0, 0.005, 0]), g.o());
    bx(0.014, 0.012, 0.235, GOLD, g.pt([0, 0.006, 0]), g.o());
    // page blocks
    for (const s of [-1, 1]) {
      const tilt = g.o([0, 0, s * -4]);
      bx(0.165, 0.022, 0.215, PAPER, g.pt([s * 0.0905, 0.019, 0]), tilt);
      bx(0.165, 0.012, 0.205, cel("#f1d9a2", "#d9b878"), g.pt([s * 0.0905, 0.012, 0]), tilt);
      const pg = grp(g.pt([s * 0.0905, 0.0311, 0]), [ang, 0, s * -4]);
      plane(0.15, 0.2, pg.pt([0, 0, 0]), pg.dir([0, 1, 0]), pg.dir([0, 0, -1]), s < 0 ? PAGE_L : PAGE_R);
      // gold corners
      for (const sz of [-1, 1]) bx(0.02, 0.026, 0.02, GOLD, g.pt([s * 0.178, 0.014, sz * 0.105]), g.o());
    }
    bx(0.04, 0.02, 0.236, DARK_X, g.pt([-0.19, 0.01, 0]), g.o());
    // book clasp strap
    // glowing rune ring floating above the book
    glow(
      b.cards([frame([cx, TOPY + 0.36, cz + 0.02], [0, 1, 0])], CIRCLE, { size: 0.18, sink: 0 }),
      1.3,
    );
    glow(
      b.cards(
        [
          frame([cx - 0.07, TOPY + 0.26, cz + 0.05], [0, 1, 0]),
          frame([cx + 0.09, TOPY + 0.3, cz - 0.01], [0, 1, 0]),
        ],
        SPARKLE_T,
        { size: 0.04, sink: 0 },
      ),
    );
  };

  // potions
  type Shape = "round" | "tall" | "flat" | "gourd" | "hex";
  const potion = (el: El, shape: Shape, x: number, y: number, z: number, s = 1) => {
    const c = EL[el].c;
    const foot = 0.008 * s;
    let liquid: Part;
    let neckBase = 0;
    let neckR = 0.02 * s;
    let rFront = 0.05 * s;
    let labelY = 0.05 * s;
    let hl: P3 = [-0.03, 0.06, 0.04];
    const by = y + foot;
    if (shape === "round") {
      liquid = lat(
        sc(
          [
            [0, 0],
            [0.034, 0],
            [0.054, 0.014],
            [0.064, 0.048],
            [0.054, 0.086],
            [0.032, 0.106],
            [0.022, 0.114],
            [0, 0.114],
          ],
          s,
        ),
        c,
        [x, by, z],
        { segments: 10 },
      );
      neckBase = 0.114 * s;
      rFront = 0.064 * s;
      labelY = 0.05 * s;
      hl = [-0.036 * s, 0.075 * s, 0.047 * s];
    } else if (shape === "tall") {
      liquid = lat(
        sc(
          [
            [0, 0],
            [0.022, 0],
            [0.03, 0.012],
            [0.031, 0.11],
            [0.024, 0.138],
            [0.014, 0.15],
            [0, 0.15],
          ],
          s,
        ),
        c,
        [x, by, z],
        { segments: 8 },
      );
      neckBase = 0.15 * s;
      neckR = 0.014 * s;
      rFront = 0.031 * s;
      labelY = 0.07 * s;
      hl = [-0.017 * s, 0.1 * s, 0.026 * s];
    } else if (shape === "flat") {
      liquid = bx(0.09 * s, 0.098 * s, 0.05 * s, c, [x, by + 0.049 * s, z]);
      bx(0.07 * s, 0.014 * s, 0.04 * s, c, [x, by + 0.105 * s, z]);
      neckBase = 0.112 * s;
      rFront = 0.025 * s;
      labelY = 0.048 * s;
      hl = [-0.032 * s, 0.07 * s, 0.026 * s];
    } else if (shape === "gourd") {
      liquid = sp(0.056 * s, c, [x, by + 0.056 * s, z], { scale: [1, 0.95, 1] }, 10, 7);
      sp(0.036 * s, c, [x, by + 0.125 * s, z], {}, 8, 6);
      neckBase = 0.155 * s;
      neckR = 0.017 * s;
      rFront = 0.056 * s;
      labelY = 0.056 * s;
      hl = [-0.032 * s, 0.075 * s, 0.043 * s];
    } else {
      liquid = lat(
        sc(
          [
            [0, 0],
            [0.036, 0],
            [0.058, 0.04],
            [0.052, 0.082],
            [0.026, 0.116],
            [0.016, 0.126],
            [0, 0.126],
          ],
          s,
        ),
        c,
        [x, by, z],
        { segments: 6 },
      );
      neckBase = 0.126 * s;
      rFront = 0.054 * s;
      labelY = 0.052 * s;
      hl = [-0.03 * s, 0.075 * s, 0.043 * s];
    }
    glow(liquid, 0.95);
    cy(0.04 * s, 0.044 * s, foot, 10, GOLD, [x, y + foot / 2, z]);
    cy(neckR, neckR * 1.15, 0.05 * s, 8, GLASS, [x, by + neckBase + 0.018 * s, z]);
    tor(neckR * 1.2, 0.004 * s, GOLD, [x, by + neckBase + 0.002 * s, z], {}, 8);
    cy(neckR * 1.2, neckR * 0.95, 0.024 * s, 8, CORK, [x, by + neckBase + 0.056 * s, z]);
    sp(0.009 * s, cel(c), [x + neckR * 1.3, by + neckBase + 0.036 * s, z + neckR * 0.4], {}, 6, 4);
    // glint
    glow(b.part(new THREE.CapsuleGeometry(0.0045 * s, 0.026 * s, 2, 5), WHITE, { at: [x + hl[0], by + hl[1], z + hl[2]], rotation: [0, 0, -14] }));
    glow(sp(0.004 * s, WHITE, [x + hl[0] * 0.8, by + hl[1] - 0.04 * s, z + hl[2] * 1.02], {}, 5, 4));
    // label
    b.decal(liquid, LABELS[el], {
      at: [x + 0.012 * s, by + labelY, z + rFront],
      dir: [0, 0, 1],
      size: [0.05 * s, 0.04 * s],
      segments: 4,
      lift: 0.0015,
    });
    return by + neckBase + 0.07 * s;
  };

  // porcelain jars
  const jar = (x: number, y: number, z: number, s: number, el: El, band: string) => {
    const body = lat(
      sc(
        [
          [0, 0],
          [0.036, 0],
          [0.048, 0.012],
          [0.056, 0.05],
          [0.05, 0.088],
          [0.034, 0.104],
          [0.03, 0.116],
          [0.036, 0.122],
          [0.0, 0.122],
        ],
        s,
      ),
      PORCELAIN,
      [x, y, z],
      { segments: 10 },
    );
    cy(0.058 * s, 0.056 * s, 0.014 * s, 10, cel(band), [x, y + 0.03 * s, z]);
    cy(0.052 * s, 0.054 * s, 0.01 * s, 10, cel(band), [x, y + 0.085 * s, z]);
    lat(
      sc(
        [
          [0, 0],
          [0.036, 0],
          [0.038, 0.01],
          [0.028, 0.022],
          [0.01, 0.028],
          [0.012, 0.036],
          [0.0, 0.04],
        ],
        s,
      ),
      cel(band),
      [x, y + 0.122 * s, z],
      { segments: 10 },
    );
    sp(0.008 * s, GOLD, [x, y + 0.165 * s, z], {}, 6, 4);
    b.decal(body, LABELS[el], { at: [x, y + 0.06 * s, z + 0.056 * s], dir: [0, 0, 1], size: [0.046 * s, 0.037 * s], segments: 4, lift: 0.0015 });
  };

  // brass balance
  const balance = (cx: number, cz: number) => {
    const y0 = TOPY;
    lat(
      [
        [0, 0],
        [0.115, 0],
        [0.12, 0.012],
        [0.1, 0.022],
        [0.06, 0.034],
        [0.026, 0.06],
        [0.02, 0.075],
        [0, 0.075],
      ],
      GOLD,
      [cx, y0, cz],
      { segments: 12 },
    );
    cy(0.1, 0.108, 0.01, 12, GOLD_DK, [cx, y0 + 0.005, cz]);
    for (let i = 0; i < 4; i++) sp(0.012, GOLD, [cx + Math.cos((i / 4) * 6.283 + 0.785) * 0.104, y0 + 0.02, cz + Math.sin((i / 4) * 6.283 + 0.785) * 0.104], {}, 6, 4);
    cy(0.012, 0.018, 0.3, 8, GOLD, [cx, y0 + 0.22, cz]);
    tor(0.02, 0.006, GOLD_DK, [cx, y0 + 0.12, cz], {}, 8);
    tor(0.018, 0.006, GOLD_DK, [cx, y0 + 0.2, cz], {}, 8);
    sp(0.024, GOLD, [cx, y0 + 0.385, cz], {}, 8, 6);
    // fork holding the beam
    rod([cx, y0 + 0.36, cz - 0.02], [cx, y0 + 0.36, cz + 0.02], 0.006, GOLD_DK);
    // beam, tilted 6 degrees
    const th = 6 * D;
    const L = 0.26;
    const cyb = y0 + 0.385;
    const eR: P3 = [cx + L * Math.cos(th), cyb + L * Math.sin(th), cz];
    const eL: P3 = [cx - L * Math.cos(th), cyb - L * Math.sin(th), cz];
    b.rod(eL, eR, [0.008, 0.008], GOLD, { sides: 6 });
    b.spike([cx, cyb, cz], [0, 1, 0], 0.06, 0.01, { color: GOLD, sides: 6 });
    sp(0.008, RED, [cx, cyb + 0.065, cz], {}, 6, 4);
    for (const e of [eL, eR]) {
      sp(0.015, GOLD, e, {}, 8, 6);
      tor(0.01, 0.0035, GOLD, [e[0], e[1] - 0.012, e[2]], { rotation: [0, 0, 0] }, 8);
    }
    // pointer needle in front of the pillar
    rod([cx, cyb - 0.005, cz + 0.026], [cx + 0.004, y0 + 0.2, cz + 0.026], 0.0035, RED);
    bx(0.07, 0.01, 0.006, GOLD, [cx, y0 + 0.21, cz + 0.026]);
    // pans
    const chainLen = 0.19;
    const pan = (e: P3, heavy: boolean) => {
      const base: P3 = [e[0], e[1] - chainLen, e[2]];
      lat(
        [
          [0, 0],
          [0.04, 0],
          [0.078, 0.02],
          [0.088, 0.034],
          [0.082, 0.034],
          [0.074, 0.024],
          [0.036, 0.01],
          [0, 0.01],
        ],
        BRASS_PAN,
        base,
        { segments: 12 },
      );
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * 6.283 + (heavy ? 0.5 : 1.1);
        const rim: P3 = [base[0] + Math.cos(a) * 0.085, base[1] + 0.034, base[2] + Math.sin(a) * 0.085];
        rod([e[0], e[1] - 0.012, e[2]], rim, 0.0022, GOLD_DK);
        sp(0.005, GOLD, rim, {}, 5, 4);
      }
      return base;
    };
    const pL = pan(eL, true);
    const pR = pan(eR, false);
    // heavy side: coin weights + a gem
    for (let i = 0; i < 4; i++) cy(0.034, 0.034, 0.008, 10, i % 2 ? GOLD : GOLD_DK, [pL[0] - 0.012, pL[1] + 0.014 + i * 0.008, pL[2] + 0.01], { rotation: [0, i * 20, 0] });
    sp(0.012, GOLD, [pL[0] - 0.012, pL[1] + 0.048, pL[2] + 0.01], {}, 6, 4);
    glow(b.part(new THREE.OctahedronGeometry(0.02, 0), EL.pyro.c, { at: [pL[0] + 0.035, pL[1] + 0.03, pL[2] - 0.025], scale: [1, 1.4, 1] }));
    // light side: herb leaves and berries
    leafBunch([pR[0], pR[1] + 0.01, pR[2]], 5, [0.06, 0.07], 0.04, LEAF_A);
    for (let i = 0; i < 4; i++) sp(0.012, cel("#e04a4a", "#9a2a45"), [pR[0] + Math.cos(i * 1.6) * 0.035, pR[1] + 0.02, pR[2] + Math.sin(i * 1.6) * 0.035], {}, 6, 4);
    // set of weights in a tray
    const wx = cx + 0.2;
    const wz = cz + 0.32;
    bx(0.24, 0.012, 0.075, DARK_X, [wx, y0 + 0.006, wz]);
    bx(0.24, 0.02, 0.01, DARK_X, [wx, y0 + 0.018, wz + 0.033]);
    for (let i = 0; i < 5; i++) {
      const r = 0.012 + i * 0.0035;
      const h = 0.014 + i * 0.006;
      cy(r * 0.8, r, h, 8, i % 2 ? GOLD : BRASS_PAN, [wx - 0.09 + i * 0.045, y0 + 0.012 + h / 2, wz - 0.004]);
      sp(0.006 + i * 0.0007, GOLD, [wx - 0.09 + i * 0.045, y0 + 0.014 + h + 0.003, wz - 0.004], {}, 6, 4);
    }
  };

  // leaf cluster (cards)
  function leafBunch(at: P3, count: number, size: [number, number], r: number, tex: THREE.Texture, tilt = 50) {
    const items = b.ring(frame(at, [0, 1, 0]), { count, radius: r, tilt }).items;
    b.cards(items, tex, { size, vary: 0.25, spin: 20, rng: R, cross: true, sink: 0.12 });
  }

  // mortar and pestle
  const mortar = (x: number, z: number) => {
    lat(
      [
        [0, 0],
        [0.04, 0],
        [0.058, 0.012],
        [0.066, 0.045],
        [0.072, 0.056],
        [0.062, 0.058],
        [0.054, 0.046],
        [0.03, 0.022],
        [0, 0.02],
      ],
      STONE,
      [x, TOPY, z],
      { segments: 10 },
    );
    tor(0.07, 0.006, GOLD_DK, [x, TOPY + 0.056, z], {}, 12);
    b.part(new THREE.SphereGeometry(0.044, 8, 5), cel("#5fb05a", "#2f7048"), { at: [x, TOPY + 0.04, z], scale: [1, 0.35, 1] });
    for (let i = 0; i < 5; i++) sp(0.007, cel("#e8e8f0", "#9aa0c0"), [x + (R() - 0.5) * 0.06, TOPY + 0.052, z + (R() - 0.5) * 0.06], {}, 5, 4);
    // pestle
    b.rod([x - 0.012, TOPY + 0.05, z + 0.0], [x - 0.12, TOPY + 0.2, z + 0.07], [0.014, 0.022], STONE, { sides: 7 });
    sp(0.024, STONE, [x - 0.12, TOPY + 0.205, z + 0.07], {}, 7, 5);
    // flat leaves on the table beside it
    b.cards(
      [frame([x + 0.1, TOPY + 0.002, z + 0.02], [0, 1, 0]), frame([x + 0.13, TOPY + 0.002, z + 0.08], [0, 1, 0])],
      LEAF_A,
      { size: [0.05, 0.08], lean: 90, flow: [0.6, 0, 1], mirror: true, sink: 0 },
    );
    b.cards([frame([x + 0.07, TOPY + 0.002, z - 0.05], [0, 1, 0])], LEAF_B, { size: [0.05, 0.08], lean: 90, flow: [-0.3, 0, 1], mirror: true, sink: 0 });
  };

  // inkwell with quill
  const inkwell = (x: number, z: number) => {
    lat(
      [
        [0, 0],
        [0.034, 0],
        [0.04, 0.012],
        [0.036, 0.04],
        [0.02, 0.05],
        [0.022, 0.056],
        [0.0, 0.056],
      ],
      cel("#2f3a78", "#1d2350"),
      [x, TOPY, z],
      { segments: 8 },
    );
    tor(0.022, 0.005, GOLD, [x, TOPY + 0.052, z], {}, 8);
    cy(0.04, 0.042, 0.008, 8, GOLD, [x, TOPY + 0.004, z]);
    rod([x + 0.01, TOPY + 0.05, z], [x + 0.08, TOPY + 0.21, z - 0.04], 0.0025, PAPER);
    b.cards([frame([x + 0.04, TOPY + 0.13, z - 0.02], [0.4, 1, -0.2])], FEATHER, { size: [0.045, 0.14], flow: [1, 0, 0.4], lean: 8, sink: 0, bend: 10 });
  };

  // potted plant
  const plantPot = (x: number, z: number, s: number, tex: THREE.Texture, count: number, shape: "leaf" | "fern" | "lily" = "leaf", y0 = TOPY) => {
    const pot = lat(
      sc(
        [
          [0, 0],
          [0.044, 0],
          [0.066, 0.05],
          [0.076, 0.1],
          [0.082, 0.104],
          [0.08, 0.11],
          [0.066, 0.108],
          [0.0, 0.1],
        ],
        s,
      ),
      cel("#f4f0e4", "#c8d4e6"),
      [x, y0, z],
      { segments: 10 },
    );
    cy(0.068 * s, 0.062 * s, 0.018 * s, 10, TEAL, [x, y0 + 0.04 * s, z]);
    cy(0.072 * s, 0.07 * s, 0.012 * s, 10, GOLD, [x, y0 + 0.098 * s, z]);
    cy(0.066 * s, 0.066 * s, 0.006 * s, 10, SOIL, [x, y0 + 0.103 * s, z]);
    b.decal(pot, LABELS.dendro, { at: [x, y0 + 0.065 * s, z + 0.07 * s], dir: [0, 0, 1], size: [0.05 * s, 0.04 * s], segments: 4, lift: 0.0015 });
    const items = b.ring(frame([x, y0 + 0.1 * s, z], [0, 1, 0]), { count, radius: 0.03 * s, tilt: shape === "fern" ? 60 : shape === "lily" ? 68 : 52 }).items;
    const size: [number, number] = shape === "fern" ? [0.08 * s, 0.22 * s] : shape === "lily" ? [0.08 * s, 0.19 * s] : [0.075 * s, 0.17 * s];
    b.cards(items, tex, { size, vary: 0.25, spin: 18, rng: R, cross: true, sink: 0.1, lean: 10 });
  };

  // lavender vase
  const vase = (x: number, z: number) => {
    lat(
      [
        [0, 0],
        [0.03, 0],
        [0.05, 0.03],
        [0.058, 0.07],
        [0.04, 0.115],
        [0.026, 0.14],
        [0.036, 0.16],
        [0.026, 0.162],
        [0.0, 0.14],
      ],
      cel("#4bb4c4", "#2a7c9e"),
      [x, TOPY, z],
      { segments: 10 },
    );
    tor(0.052, 0.004, GOLD, [x, TOPY + 0.055, z], {}, 10);
    tor(0.034, 0.004, GOLD, [x, TOPY + 0.13, z], {}, 10);
    const items = b.ring(frame([x, TOPY + 0.15, z], [0, 1, 0]), { count: 9, radius: 0.012, tilt: 74 }).items;
    b.cards(items, LAVENDER, { size: [0.045, 0.2], vary: 0.2, spin: 12, rng: R, cross: true, sink: 0.12 });
  };

  // mushroom basket
  const basket = (x: number, y: number, z: number, s: number) => {
    lat(
      sc(
        [
          [0, 0],
          [0.07, 0],
          [0.088, 0.02],
          [0.098, 0.07],
          [0.104, 0.082],
          [0.094, 0.084],
          [0.084, 0.07],
          [0.0, 0.06],
        ],
        s,
      ),
      WICKER,
      [x, y, z],
      { segments: 12 },
    );
    tor(0.1 * s, 0.006 * s, cel("#c48a45", "#8e5f3e"), [x, y + 0.083 * s, z], {}, 12);
    b.part(new THREE.SphereGeometry(0.086 * s, 8, 5), SOIL, { at: [x, y + 0.075 * s, z], scale: [1, 0.2, 1] });
    // mushrooms
    const capPaint = cel(spots("#e04a4a", "#fff6e0", { size: 0.022, amount: 0.5, seed: 4 }), "#a02a45");
    for (const [dx, dz, ms] of [
      [-0.03, 0.02, 1],
      [0.035, -0.015, 0.8],
      [0.0, -0.04, 0.65],
    ] as const) {
      cy(0.012 * ms * s, 0.016 * ms * s, 0.06 * ms * s, 6, CREAM, [x + dx * s, y + 0.1 * s, z + dz * s]);
      b.part(new THREE.SphereGeometry(0.038 * ms * s, 8, 5, 0, 6.283, 0, 1.6), capPaint, { at: [x + dx * s, y + 0.125 * s * ms + 0.005, z + dz * s], scale: [1, 0.65, 1] });
    }
    leafBunch([x + 0.03 * s, y + 0.085 * s, z + 0.045 * s], 4, [0.045 * s, 0.07 * s], 0.012, LEAF_B);
  };

  // alembic
  const alembic = (cx: number, cz: number) => {
    // spirit lamp
    lat(
      [
        [0, 0],
        [0.05, 0],
        [0.07, 0.018],
        [0.064, 0.044],
        [0.036, 0.058],
        [0.026, 0.068],
        [0.0, 0.07],
      ],
      GOLD,
      [cx, TOPY, cz],
      { segments: 10 },
    );
    cy(0.046, 0.052, 0.012, 10, GOLD_DK, [cx, TOPY + 0.03, cz]);
    flame([cx, TOPY + 0.07, cz], 1.5, "#ff7a3a", FLAME_Y);
    // tripod
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * 6.283 + 0.4;
      const top: P3 = [cx + Math.cos(a) * 0.07, TOPY + 0.17, cz + Math.sin(a) * 0.07];
      rod([cx + Math.cos(a) * 0.09, TOPY, cz + Math.sin(a) * 0.09], top, 0.007, IRON);
    }
    tor(0.07, 0.007, IRON, [cx, TOPY + 0.17, cz], {}, 12);
    // flask
    glow(b.part(new THREE.SphereGeometry(0.092, 12, 8), "#7fe04a", { at: [cx, TOPY + 0.265, cz], scale: [1, 0.94, 1] }), 0.95);
    tor(0.09, 0.004, GOLD, [cx, TOPY + 0.2, cz], {}, 12);
    cy(0.026, 0.034, 0.12, 8, GLASS, [cx, TOPY + 0.385, cz]);
    tor(0.034, 0.005, GOLD, [cx, TOPY + 0.34, cz], {}, 8);
    // alembic head
    lat(
      [
        [0, 0],
        [0.036, 0],
        [0.05, 0.02],
        [0.046, 0.05],
        [0.02, 0.07],
        [0, 0.075],
      ],
      GLASS,
      [cx, TOPY + 0.44, cz],
      { segments: 10 },
    );
    tor(0.036, 0.005, GOLD, [cx, TOPY + 0.443, cz], {}, 10);
    sp(0.012, GOLD, [cx, TOPY + 0.52, cz], {}, 6, 4);
    // swan neck down to the receiving bottle
    const bottleX = cx - 0.27;
    const swan = catmull(
      [
        [cx, TOPY + 0.5, cz],
        [cx - 0.07, TOPY + 0.545, cz],
        [cx - 0.17, TOPY + 0.52, cz],
        [bottleX + 0.03, TOPY + 0.43, cz],
        [bottleX, TOPY + 0.3, cz],
        [bottleX, TOPY + 0.22, cz],
      ],
      { tension: 0.5 },
    );
    b.sweep(swan, 0.014, { color: GLASS, sides: 7, caps: "flat" });
    for (const t of [0.12, 0.5, 0.9]) {
      const pt = swan.at(t);
      tor(0.018, 0.004, GOLD, [pt.x, pt.y, pt.z], { rotation: [0, 0, 0] }, 7);
    }
    // drips + receiving bottle
    glow(sp(0.006, "#7fe04a", [bottleX, TOPY + 0.2, cz], {}, 5, 4));
    potion("dendro", "round", bottleX, TOPY, cz, 0.85);
    // glowing bubbles above the head
    for (const [dx, dy, dz, r] of [
      [0.02, 0.58, 0.02, 0.012],
      [-0.03, 0.64, -0.01, 0.009],
      [0.04, 0.7, 0.03, 0.007],
    ] as const)
      glow(sp(r, "#b4ff7a", [cx + dx, TOPY + dy, cz + dz], {}, 6, 4));
  };

  // hourglass
  const hourglass = (x: number, y: number, z: number) => {
    cy(0.04, 0.04, 0.01, 8, GOLD, [x, y + 0.005, z]);
    cy(0.04, 0.04, 0.01, 8, GOLD, [x, y + 0.135, z]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * 6.283 + 0.5;
      rod([x + Math.cos(a) * 0.035, y + 0.01, z + Math.sin(a) * 0.035], [x + Math.cos(a) * 0.035, y + 0.13, z + Math.sin(a) * 0.035], 0.004, RED);
    }
    b.part(new THREE.ConeGeometry(0.03, 0.055, 8), GLASS, { at: [x, y + 0.04, z], rotation: [180, 0, 0] });
    b.part(new THREE.ConeGeometry(0.03, 0.055, 8), GLASS, { at: [x, y + 0.1, z] });
    glow(b.part(new THREE.ConeGeometry(0.018, 0.026, 8), "#ffd86a", { at: [x, y + 0.025, z] }), 0.9);
    glow(b.part(new THREE.ConeGeometry(0.01, 0.014, 8), "#ffd86a", { at: [x, y + 0.115, z], rotation: [180, 0, 0] }), 0.9);
  };

  // crystal cluster on a gold stand
  const crystals = (x: number, y: number, z: number) => {
    lat(
      [
        [0, 0],
        [0.07, 0],
        [0.075, 0.01],
        [0.06, 0.02],
        [0.03, 0.03],
        [0, 0.035],
      ],
      GOLD,
      [x, y, z],
      { segments: 8 },
    );
    const gem = (dx: number, dz: number, h: number, w: number, tilt: number, c: string) =>
      glow(
        b.part(new THREE.OctahedronGeometry(w, 0), c, {
          at: [x + dx, y + 0.035 + h * 0.5, z + dz],
          scale: [1, h / w / 2, 1],
          rotation: [tilt, dz * 200, -dx * 160],
        }),
        1,
      );
    gem(0, 0, 0.16, 0.036, 0, EL.cryo.c);
    gem(0.035, 0.012, 0.11, 0.025, 12, "#a8f4ff");
    gem(-0.035, -0.01, 0.1, 0.024, -14, "#59d3f0");
    gem(0.01, -0.04, 0.08, 0.02, -10, "#a8f4ff");
    gem(-0.015, 0.04, 0.07, 0.02, 14, "#59d3f0");
  };

  // standing book
  const standBook = (x: number, y: number, z: number, t: number, h: number, d: number, c: Paint, spine: THREE.Texture, lean = 0) => {
    const g = grp([x, y + h / 2, z], [0, 0, lean]);
    const o = g.o();
    bx(t - 0.002, h - 0.01, d - 0.006, PAPER, g.pt([0, 0, -0.004]), o);
    bx(t, h, 0.008, c, g.pt([0, 0, d / 2 - 0.004]), o);
    bx(0.007, h, d, c, g.pt([-t / 2 + 0.0035, 0, 0]), o);
    bx(0.007, h, d, c, g.pt([t / 2 - 0.0035, 0, 0]), o);
    bx(t, 0.007, d, c, g.pt([0, h / 2 - 0.0035, 0]), o);
    bx(t, 0.007, d, c, g.pt([0, -h / 2 + 0.0035, 0]), o);
    plane(t * 0.97, h * 0.97, g.pt([0, 0, d / 2 + 0.0008]), g.dir([0, 0, 1]), g.dir([0, 1, 0]), spine);
  };

  // sack of herbs
  const sack = (x: number, z: number, s: number, rot: number) => {
    lat(
      sc(
        [
          [0, 0],
          [0.1, 0],
          [0.15, 0.04],
          [0.16, 0.12],
          [0.14, 0.2],
          [0.09, 0.26],
          [0.05, 0.3],
          [0.07, 0.34],
          [0.06, 0.37],
          [0.03, 0.36],
          [0, 0.33],
        ],
        s,
      ),
      BURLAP,
      [x, F, z],
      { segments: 10, spin: rot },
    );
    tor(0.056 * s, 0.01 * s, cel("#b0452d", "#7d2f3a"), [x, F + 0.29 * s, z], {}, 8);
    leafBunch([x, F + 0.34 * s, z], 6, [0.07 * s, 0.14 * s], 0.01, LEAF_T, 60);
  };

  // barrel
  const barrel = (x: number, z: number) => {
    const profile: Pts = [
      [0, 0],
      [0.17, 0],
      [0.185, 0.04],
      [0.205, 0.14],
      [0.22, 0.25],
      [0.205, 0.36],
      [0.185, 0.46],
      [0.17, 0.5],
      [0, 0.5],
    ];
    const barrelBody = lat(profile, cel(grain("#d99a62", "#bd7a46", { size: 0.015, axis: "y" })), [x, F, z], { segments: 12 });
    for (const [hy, hr] of [
      [0.055, 0.182],
      [0.14, 0.206],
      [0.36, 0.206],
      [0.445, 0.184],
    ] as const)
      tor(hr + 0.003, 0.011, IRON, [x, F + hy, z], {}, 12);
    // lid details
    cy(0.14, 0.14, 0.006, 12, DARK_X, [x, F + 0.503, z]);
    tor(0.14, 0.008, GOLD_DK, [x, F + 0.503, z], {}, 12);
    // tap
    cy(0.012, 0.012, 0.07, 6, GOLD, [x, F + 0.2, z + 0.245], { rotation: [90, 0, 0] });
    sp(0.018, GOLD, [x, F + 0.2, z + 0.285], {}, 6, 4);
    b.decal(
      barrelBody,
      labelTex("hydro"),
      { at: [x - 0.0, F + 0.31, z + 0.215], dir: [0, 0, 1], size: [0.12, 0.096], segments: 4, lift: 0.002 },
    );
  };

  // crate with potions
  const crate = (x: number, z: number, rot: number) => {
    const g = grp([x, F, z], [0, rot, 0]);
    const PLANKS = paint((p, n) => {
      if (n.y > 0.5) return WOOD_X2;
      const f = (((p.y / 0.07) % 1) + 1) % 1;
      return f < 0.07 ? SEAM : DARK_X;
    });
    bx(0.36, 0.26, 0.28, PLANKS, g.pt([0, 0.13, 0]), g.o());
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) bx(0.032, 0.27, 0.032, DARK_Y, g.pt([sx * 0.17, 0.135, sz * 0.13]), g.o());
    bx(0.38, 0.02, 0.3, DARK_X, g.pt([0, 0.26, 0]), g.o());
    bx(0.3, 0.012, 0.22, cel("#e9c768", "#c89d4a"), g.pt([0, 0.272, 0]), g.o());
    for (const sx of [-1, 1]) bx(0.02, 0.05, 0.004, GOLD, g.pt([sx * 0.17, 0.13, 0.15]), g.o());
    return g;
  };

  // amphora
  const amphora = (x: number, y: number, z: number, s: number) => {
    const body = lat(
      sc(
        [
          [0, 0],
          [0.04, 0],
          [0.06, 0.02],
          [0.09, 0.09],
          [0.1, 0.16],
          [0.08, 0.23],
          [0.04, 0.28],
          [0.03, 0.31],
          [0.04, 0.33],
          [0.03, 0.335],
          [0, 0.31],
        ],
        s,
      ),
      cel("#2fa5a6", "#1d6f88"),
      [x, y, z],
      { segments: 10 },
    );
    cy(0.1 * s, 0.098 * s, 0.012 * s, 10, GOLD, [x, y + 0.15 * s, z]);
    cy(0.066 * s, 0.07 * s, 0.01 * s, 10, GOLD, [x, y + 0.075 * s, z]);
    cy(0.04 * s, 0.04 * s, 0.01 * s, 10, GOLD, [x, y + 0.27 * s, z]);
    for (const sx of [-1, 1]) tor(0.045 * s, 0.008 * s, GOLD_DK, [x + sx * 0.085 * s, y + 0.25 * s, z], { rotation: [0, 0, 0] }, 8);
    b.decal(body, LABELS.geo, { at: [x, y + 0.12 * s, z + 0.1 * s], dir: [0, 0, 1], size: [0.08 * s, 0.064 * s], segments: 4, lift: 0.002 });
  };

  // ------------------------------------------------------------------------------------------------ dress the bench
  lectern(-0.66, -0.01);
  bookStack(-0.34, 0.22);
  candle(-0.45, TOPY, -0.14);
  inkwell(-0.55, 0.3);
  vase(-0.85, 0.27);
  balance(-0.02, -0.02);
  mortar(-0.2, 0.3);
  alembic(0.66, -0.02);
  plantPot(0.83, -0.24, 1.05, LEAF_A, 9);
  basket(0.5, TOPY, -0.27, 1);

  // back row of porcelain jars
  const jarSpec: [El, string][] = [
    ["geo", "#e0a03a"],
    ["hydro", "#3d8bff"],
    ["pyro", "#d9483b"],
    ["anemo", "#2fb5a8"],
  ];
  jarSpec.forEach(([el, band], i) => jar(-0.25 + i * 0.14, TOPY, -0.29, 1, el, band));

  // front potion row (right)
  potion("pyro", "tall", 0.42, TOPY, 0.3, 1);
  potion("electro", "round", 0.54, TOPY, 0.3, 1);
  potion("cryo", "hex", 0.66, TOPY, 0.31, 1);
  potion("dendro", "gourd", 0.79, TOPY, 0.29, 1);
  potion("anemo", "flat", 0.19, TOPY, 0.1, 0.8);

  // ------------------------------------------------------------------------------------------------ shelves
  const MS = 1.3 + 0.017;
  const els: El[] = ["pyro", "hydro", "dendro", "electro", "cryo", "anemo", "geo"];
  const shapes: Shape[] = ["round", "tall", "gourd", "flat", "hex", "round", "tall"];
  els.forEach((el, i) => potion(el, shapes[i], -0.62 + i * 0.2, MS, -0.22, 1.05));
  hourglass(-0.82, MS, -0.2);
  // small coin pouch + vial rack on the right of the mid shelf
  bx(0.2, 0.012, 0.1, DARK_X, [0.8, MS + 0.006, -0.22]);
  for (let i = 0; i < 4; i++) {
    const e = els[(i + 2) % 7];
    glow(b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 7), EL[e].c, { at: [0.75 + i * 0.035, MS + 0.052, -0.22] }), 0.9);
    cy(0.009, 0.009, 0.014, 6, CORK, [0.75 + i * 0.035, MS + 0.099, -0.22]);
  }

  const US = 1.6 + 0.017;
  const bookCols: Paint[] = [LEATHER_RED, LEATHER_TEAL, LEATHER_PURPLE, LEATHER_GREEN, LEATHER_BROWN, LEATHER_RED];
  let bxs = -0.82;
  [0.04, 0.035, 0.05, 0.036, 0.042, 0.032].forEach((t, i) => {
    const h = 0.2 + (i % 3) * 0.03;
    const lean = i === 5 ? 12 : 0;
    standBook(bxs + t / 2 + (lean ? 0.03 : 0), US, -0.21, t, h, 0.15, bookCols[i], SPINES[i], lean);
    bxs += t + 0.002;
  });
  // bookends + candle + crystals + jars
  bx(0.016, 0.1, 0.12, GOLD, [-0.855, US + 0.05, -0.21]);
  candle(-0.5, US, -0.2, 0.9);
  crystals(0.0, US, -0.22);
  jar(0.3, US, -0.22, 0.95, "dendro", "#5eab4e");
  jar(0.45, US, -0.22, 0.8, "cryo", "#59d3f0");
  amphora(0.55, US, -0.22, 0.7);
  plantPot(0.8, -0.22, 0.9, LILY, 5, "lily", US);
  plantPot(-1.0, 0.55, 1.7, FERN, 8, "fern", F);
  bx(0.2, 0.012, 0.1, DARK_X, [-0.28, US + 0.006, -0.2]);
  // scrolls
  for (let i = 0; i < 3; i++) {
    const g = grp([-0.28 + (i - 1) * 0.04, US + 0.03 + (i === 1 ? 0.04 : 0), -0.2], [0, 0, 90]);
    cy(0.017, 0.017, 0.18, 8, PAPER, g.pt([0, 0, 0]), g.o());
    for (const sx of [-1, 1]) cy(0.019, 0.019, 0.012, 8, GOLD, g.pt([0, sx * 0.085, 0]), g.o());
    cy(0.0185, 0.0185, 0.012, 8, RED, g.pt([0, 0, 0]), g.o());
  }

  // ------------------------------------------------------------------------------------------------ under the bench
  amphora(-0.76, 0.28, -0.12, 1.15);
  basket(-0.5, 0.28, 0.18, 1.15);
  bx(0.3, 0.012, 0.2, DARK_X, [-0.2, 0.2825, 0.0]);
  // crate sits on the shelf: lift via separate bottles
  for (const [dx, e] of [
    [-0.08, "pyro"],
    [0, "hydro"],
    [0.08, "electro"],
  ] as const)
    potion(e, "round", -0.2 + dx, 0.2885, 0.0, 0.75);
  for (const [dx, dz, ro] of [
    [-0.7, 0.2, 10],
    [-0.28, -0.18, -20],
  ] as const) {
    void dx;
    void dz;
    void ro;
  }

  // ------------------------------------------------------------------------------------------------ floor props
  // fire pit + cauldron (left)
  const CX = -1.3;
  const CZ = 0.18;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.283;
    b.part(new THREE.DodecahedronGeometry(0.06, 0), STONE, { at: [CX + Math.cos(a) * 0.3, F + 0.04, CZ + Math.sin(a) * 0.3], scale: [1, 0.75, 1], rotation: [0, i * 40, 0] });
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 6.283 + 0.3;
    b.rod([CX + Math.cos(a) * 0.2, F + 0.04, CZ + Math.sin(a) * 0.2], [CX - Math.cos(a) * 0.05, F + 0.07, CZ - Math.sin(a) * 0.05], 0.028, DARK_X, { sides: 6 });
  }
  for (const [dx, dz, s, c1] of [
    [0, 0, 3.2, "#ff7a3a"],
    [0.1, 0.06, 2.3, FLAME_O],
    [-0.1, -0.05, 2.5, FLAME_O],
    [0.04, -0.1, 2.0, "#ff7a3a"],
    [-0.06, 0.1, 2.1, FLAME_O],
  ] as const)
    flame([CX + dx, F + 0.05, CZ + dz], s, c1, FLAME_Y);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 6.283 + 0.95;
    rod([CX + Math.cos(a) * 0.3, F, CZ + Math.sin(a) * 0.3], [CX + Math.cos(a) * 0.2, F + 0.2, CZ + Math.sin(a) * 0.2], 0.012, IRON);
  }
  tor(0.2, 0.012, IRON, [CX, F + 0.2, CZ], {}, 12);
  const potY = F + 0.2;
  lat(
    [
      [0, 0],
      [0.1, 0],
      [0.2, 0.06],
      [0.26, 0.17],
      [0.25, 0.27],
      [0.215, 0.31],
      [0.23, 0.318],
      [0.225, 0.33],
      [0.19, 0.325],
      [0.2, 0.3],
      [0.19, 0.2],
      [0.0, 0.24],
    ],
    IRON,
    [CX, potY, CZ],
    { segments: 12 },
  );
  glow(cy(0.21, 0.21, 0.01, 12, "#8cf05a", [CX, potY + 0.285, CZ]), 1);
  tor(0.235, 0.008, GOLD_DK, [CX, potY + 0.33, CZ], {}, 12);
  tor(0.255, 0.006, GOLD_DK, [CX, potY + 0.19, CZ], {}, 12);
  for (const sx of [-1, 1]) sp(0.02, GOLD, [CX + sx * 0.235, potY + 0.31, CZ], {}, 6, 4);
  b.sweep(
    catmull([
      [CX - 0.235, potY + 0.31, CZ],
      [CX - 0.18, potY + 0.52, CZ],
      [CX, potY + 0.6, CZ],
      [CX + 0.18, potY + 0.52, CZ],
      [CX + 0.235, potY + 0.31, CZ],
    ]),
    0.009,
    { color: IRON, sides: 6, caps: "flat" },
  );
  // bubbles + magic swirl
  for (const [dx, dz, r, dy] of [
    [0.06, 0.04, 0.032, 0.3],
    [-0.08, -0.02, 0.026, 0.3],
    [0.0, -0.09, 0.02, 0.3],
    [0.1, -0.05, 0.016, 0.34],
    [-0.04, 0.08, 0.018, 0.35],
  ] as const)
    glow(sp(r, "#bfff8a", [CX + dx, potY + dy, CZ + dz], {}, 8, 5), 1);
  const swirl = spiral([CX, potY + 0.34, CZ], [CX + 0.1, potY + 0.34, CZ], [0, 1, 0], { turns: 2.2, r1: 0.035, pitch: 0.14 });
  glow(b.sweep(swirl, [0.012, 0.004], { color: "#c8ff9a", sides: 5 }), 1);
  glow(
    b.cards(
      [frame([CX + 0.12, potY + 0.6, CZ + 0.02], [0, 1, 0]), frame([CX - 0.1, potY + 0.7, CZ - 0.03], [0, 1, 0]), frame([CX + 0.0, potY + 0.82, CZ], [0, 1, 0])],
      SPARKLE_G,
      { size: 0.06, sink: 0 },
    ),
  );
  // ladle leaning on the pit
  rod([CX + 0.3, potY + 0.28, CZ + 0.18], [CX + 0.52, F + 0.01, CZ + 0.3], 0.01, DARK_X);
  lat(
    [
      [0, 0],
      [0.035, 0.004],
      [0.05, 0.02],
      [0.044, 0.024],
      [0.034, 0.012],
      [0, 0.01],
    ],
    GOLD,
    [CX + 0.3, potY + 0.285, CZ + 0.18],
    { segments: 8 },
  );

  // right side: barrel, sacks, crate with potions
  barrel(1.3, -0.05);
  sack(1.1, 0.33, 1.0, 0);
  sack(1.38, 0.34, 0.8, 40);
  const cg = crate(1.28, 0.62, 12);
  for (const [dx, dz, e] of [
    [-0.08, -0.04, "pyro"],
    [0.07, 0.0, "electro"],
    [0.0, 0.06, "hydro"],
  ] as const) {
    const p = cg.pt([dx, 0.278, dz]);
    potion(e, "round", p[0], p[1], p[2], 0.7);
  }
  // stack of closed books on the floor by the cabinet
  {
    const specs: [number, number, number, number, Paint, THREE.Texture][] = [
      [0.28, 0.06, 0.2, 10, LEATHER_BROWN, COVERS.brown],
      [0.25, 0.05, 0.18, -8, LEATHER_GREEN, COVERS.green],
      [0.22, 0.045, 0.16, 6, LEATHER_RED, COVERS.red],
    ];
    let y = F;
    for (const [w, h, d, rot, c, tex] of specs) {
      const g = grp([0.98, y + h / 2, 0.55 + 0.0], [0, rot, 0]);
      const o = g.o();
      bx(w, h - 0.004, d - 0.004, PAPER, g.pt([-0.004, 0, -0.004]), o);
      bx(w, 0.008, d, c, g.pt([0, -h / 2 + 0.004, 0]), o);
      bx(w, 0.008, d, c, g.pt([0, h / 2 - 0.004, 0]), o);
      bx(w, h, 0.012, c, g.pt([0, 0, d / 2 - 0.006]), o);
      for (const k of [-0.3, 0, 0.3]) bx(0.008, h + 0.003, 0.016, GOLD, g.pt([k * w, 0, d / 2 - 0.006]), o);
      plane(w * 0.72, d * 0.78, g.pt([-0.004, h / 2 + 0.0009, -0.004]), g.dir([0, 1, 0]), g.dir([0, 0, -1]), tex);
      y += h;
    }
  }

  // ------------------------------------------------------------------------------------------------ lantern on the right post
  {
    rod([0.9, 1.78, -0.36], [1.1, 1.78, -0.14], 0.012, DARK_X);
    b.extrude(
      [
        [0, 0],
        [0.2, 0],
        [0.2, 0.012],
        [0.08, 0.02],
        [0.03, 0.1],
        [0, 0.14],
      ],
      { at: [0.9, 1.69, -0.36], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, color: GOLD_DK },
    );
    const lx = 1.1;
    const lz = -0.14;
    rod([lx, 1.78, lz], [lx, 1.7, lz], 0.004, GOLD_DK);
    const lp: Pts = [
      [0, 0],
      [0.05, 0],
      [0.09, 0.03],
      [0.1, 0.1],
      [0.09, 0.17],
      [0.05, 0.2],
      [0, 0.2],
    ];
    glow(lat(lp, "#ff9d55", [lx, 1.46, lz], { segments: 8 }), 1.1);
    cy(0.062, 0.05, 0.022, 8, GOLD, [lx, 1.47, lz]);
    cy(0.05, 0.062, 0.022, 8, GOLD, [lx, 1.65, lz]);
    cy(0.012, 0.03, 0.04, 8, GOLD, [lx, 1.695, lz]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283;
      b.rod([lx + Math.cos(a) * 0.06, 1.48, lz + Math.sin(a) * 0.06], [lx + Math.cos(a) * 0.058, 1.65, lz + Math.sin(a) * 0.058], 0.004, RED, { sides: 4 });
    }
    glow(sp(0.03, "#fff0b0", [lx, 1.56, lz], {}, 6, 4));
    tassels.push(new THREE.Vector3(lx, 1.46, lz));
  }

  // ------------------------------------------------------------------------------------------------ hanging herbs
  for (const [hx, tex, w] of [
    [-0.74, HERB, 0.1],
    [-0.58, HERB_R, 0.09],
    [-0.42, HERB, 0.1],
    [0.42, HERB_R, 0.09],
    [0.58, HERB, 0.1],
    [0.74, HERB, 0.1],
  ] as [number, THREE.Texture, number][]) {
    const fs = [0, 1, 2].map((i) => frame([hx + (i - 1) * 0.012, 1.745, 0.15 + (i - 1) * 0.01], [0, 1, 0]));
    b.cards(fs, tex, { size: [w, 0.3], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.15, spin: 25, rng: R, sink: 0 });
    sp(0.017, cel("#c48a45", "#8e5f3e"), [hx, 1.742, 0.15], {}, 6, 4);
    cy(0.012, 0.012, 0.02, 6, RED, [hx, 1.75, 0.15]);
  }
  // lavender-ish drying bunch + garlic-like bulbs hanging in the middle
  for (const gx of [-0.12, 0, 0.12]) {
    rod([gx, 1.745, 0.15], [gx, 1.69, 0.15], 0.003, cel("#c48a45", "#8e5f3e"));
    sp(0.032, cel("#fff6e0", "#d4c0d8"), [gx, 1.66, 0.15], { scale: [1, 0.9, 1] }, 7, 5);
    b.spike([gx, 1.628, 0.15], [0, 1, 0], 0.02, 0.006, { color: cel("#fff6e0", "#d4c0d8"), sides: 4 });
  }

  // ------------------------------------------------------------------------------------------------ tassels, sparkles
  b.cards(
    tassels.map((p) => frame(p, [0, 1, 0])),
    TASSEL,
    { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], sink: 0 },
  );
  // tassels on the drawer pulls
  b.cards(
    [0.49].flatMap((x) => [frame([x, 0.745, 0.405], [0, 1, 0]), frame([x, 0.575, 0.405], [0, 1, 0])]),
    TASSEL,
    { size: [0.03, 0.11], lean: 180, flow: [0, 0, 1], sink: 0 },
  );
  glow(
    b.cards(
      [
        frame([0.5, 1.2, 0.0], [0, 1, 0]),
        frame([-0.3, 1.05, 0.2], [0, 1, 0]),
        frame([0.35, 1.0, 0.18], [0, 1, 0]),
        frame([0.08, 1.45, 0.1], [0, 1, 0]),
        frame([-0.75, 1.35, 0.12], [0, 1, 0]),
      ],
      SPARKLE_G,
      { size: 0.055, sink: 0, vary: 0.3, rng: R },
    ),
  );
  glow(
    b.cards(
      [frame([0.62, 1.52, 0.04], [0, 1, 0]), frame([0.25, 1.1, 0.0], [0, 1, 0]), frame([-0.5, 1.5, 0.1], [0, 1, 0]), frame([0.9, 1.15, 0.2], [0, 1, 0])],
      SPARKLE_T,
      { size: 0.045, sink: 0, vary: 0.3, rng: R },
    ),
  );

  return b.root;
}
