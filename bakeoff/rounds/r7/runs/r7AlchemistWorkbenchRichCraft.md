```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, spiral, svg, grain, patches, mottle } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A Mondstadt-style alchemist's workbench in a cel-shaded Genshin look: glowing potions, a brass balance, a spellbook with floating runes, a hovering Anemo Vision, hanging herbs, an alembic and a stone transmutation platform.",
};

export default function build() {
  const b = createBuilder({ name: "alchemist_workbench", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const DEG = Math.PI / 180;
  type P3 = [number, number, number];
  const F = 0.09; // platform top
  const T = 0.93; // tabletop height

  // ------------------------------------------------------------------ palette
  const WOOD_X = cel(grain("#b07844", "#94602f", { size: 0.03, axis: "x", seed: 2 }));
  const WOOD_Y = cel(grain("#a56f3d", "#8a5629", { size: 0.03, axis: "y", seed: 4 }));
  const WOOD_Y2 = cel(grain("#946034", "#7c4d26", { size: 0.03, axis: "y", seed: 6 }));
  const WOOD_DK = cel(grain("#6e4327", "#5a3420", { size: 0.025, axis: "x", seed: 8 }));
  const WOOD_DKY = cel(grain("#6e4327", "#5a3420", { size: 0.025, axis: "y", seed: 9 }));
  const GOLD = cel("#f4c85a", "#c88a2a");
  const GOLD_DK = cel("#d6a23e", "#a8702a");
  const IRON = cel("#5d6178", "#3e415a");
  const COPPER = cel("#e48f58", "#b95b3c");
  const GLASS = cel("#e6f8f6", "#b7dce3");
  const CREAM = cel("#fff2d2", "#efcfa4");
  const CORK = cel("#cf9a62", "#a8723f");
  const CLAY = cel("#c9703f", "#a2502f");
  const LEAFG = cel("#79c75e", "#4b9a52");
  const STEM = cel("#4f9a45", "#357a45");
  const TEAL = cel("#33949a", "#21657b");
  const RED = cel("#c8463d", "#963346");
  const PURPLE = cel("#7d5cc2", "#59449e");
  const BLUEB = cel("#3d68b8", "#2d4592");
  const GREENB = cel("#4a8a52", "#2f6448");
  const LEATHER = cel("#7a4a34", "#573327");
  const TWINE = cel("#d9bf86", "#b59a62");
  const SOIL = cel("#4b3226", "#2f1f1a");
  const STONE = cel(patches("#8d8777", ["#cbc4af", "#d6cfba", "#bfb8a3"], { size: 0.28, gap: 0.05, seed: 3 }));
  const STONE_DK = cel("#a39d8b", "#7d7a73");
  const SACK = cel(mottle("#dcc698", "#c8ad7c", { size: 0.08, seed: 5 }), "#a98d5f");
  const TEAL_G = "#6ff0d0";
  const AMBER = "#ffb23d";

  // ------------------------------------------------------------------ svg helpers
  const poly = (cx: number, cy: number, r: number, n: number, rot = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (rot + (i * 360) / n) * DEG;
      return `${(cx + r * Math.sin(a)).toFixed(1)},${(cy - r * Math.cos(a)).toFixed(1)}`;
    }).join(" ");

  let ticks = "";
  for (let i = 0; i < 48; i++) {
    const a = i * 7.5 * DEG;
    const r0 = i % 4 === 0 ? 80 : 85;
    ticks += `<path d="M${(100 + r0 * Math.sin(a)).toFixed(1)} ${(100 - r0 * Math.cos(a)).toFixed(1)} L${(100 + 92 * Math.sin(a)).toFixed(1)} ${(100 - 92 * Math.cos(a)).toFixed(1)}" stroke="#6ff0d0" stroke-width="1.6"/>`;
  }
  let gl = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * DEG;
    const cx = 100 + 73 * Math.sin(a);
    const cy = 100 - 73 * Math.cos(a);
    gl += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.2" fill="none" stroke="#6ff0d0" stroke-width="1.6"/>`;
    gl += `<path d="M${(cx - 2).toFixed(1)} ${(cy + 2).toFixed(1)} L${cx.toFixed(1)} ${(cy - 2.5).toFixed(1)} L${(cx + 2).toFixed(1)} ${(cy + 2).toFixed(1)}" stroke="#6ff0d0" stroke-width="1.2" fill="none"/>`;
  }
  const CIRCLE = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="none" stroke="#6ff0d0" stroke-width="2.4"/>
      <circle cx="100" cy="100" r="62" fill="none" stroke="#6ff0d0" stroke-width="1.6"/>
      <circle cx="100" cy="100" r="40" fill="none" stroke="#6ff0d0" stroke-width="1.6"/>
      ${ticks}${gl}
      <polygon points="${poly(100, 100, 62, 6, 0)}" fill="none" stroke="#6ff0d0" stroke-width="1.8"/>
      <polygon points="${poly(100, 100, 62, 6, 30)}" fill="none" stroke="#6ff0d0" stroke-width="1.8"/>
      <polygon points="${poly(100, 100, 40, 4, 0)}" fill="none" stroke="#6ff0d0" stroke-width="1.6"/>
    </svg>`,
    { size: 1024 },
  );

  const CREST = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#2a6d7a" stroke="#f2c452" stroke-width="5"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke="#f9e6a0" stroke-width="2"/>
      <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42Z" fill="#fff4c8" stroke="#c98a2c" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 24 L56 44 L76 50 L56 56 L50 76 L44 56 L24 50 L44 44Z" fill="#f2c452" stroke="#c98a2c" stroke-width="1.5" stroke-linejoin="round" transform="rotate(45 50 50)"/>
      <circle cx="50" cy="50" r="8" fill="#78e7c4" stroke="#c98a2c" stroke-width="2.5"/>
    </svg>`,
    { size: 192 },
  );

  const PAGES = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#fbf0d2"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="0" y="${i * 3.2 + 1}" width="32" height="1" fill="#d9c59a"/>`).join("")}</svg>`,
    { size: 64 },
  );

  const COVER_ORN = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="52" height="72" rx="3" fill="none" stroke="#f2c452" stroke-width="3"/>
      <rect x="9" y="9" width="42" height="62" rx="2" fill="none" stroke="#f9e6a0" stroke-width="1.6"/>
      <path d="M30 22 L40 40 L30 58 L20 40Z" fill="#f2c452" stroke="#c98a2c" stroke-width="1.5"/>
      <circle cx="30" cy="40" r="5" fill="#78e7c4" stroke="#c98a2c" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="2.4" fill="#f2c452"/><circle cx="46" cy="14" r="2.4" fill="#f2c452"/>
      <circle cx="14" cy="66" r="2.4" fill="#f2c452"/><circle cx="46" cy="66" r="2.4" fill="#f2c452"/>
    </svg>`,
    { size: 160 },
  );

  const textLines = (x0: number, y0: number, n: number, w: number) =>
    Array.from({ length: n }, (_, i) => {
      const len = w * (0.65 + 0.35 * ((i * 37) % 10) / 10);
      return `<rect x="${x0}" y="${y0 + i * 5}" width="${len.toFixed(1)}" height="1.8" rx="0.9" fill="#8b6a46"/>`;
    }).join("");
  const PAGE_L = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="#fbf0d2"/>
      <rect x="6" y="6" width="48" height="30" rx="2" fill="#f1dfb0" stroke="#8b6a46" stroke-width="1.6"/>
      <path d="M30 32 Q29 18 30 10" stroke="#3f7a3a" stroke-width="2" fill="none"/>
      <path d="M30 24 Q38 20 40 14 Q32 16 30 24Z M30 18 Q22 16 20 10 Q28 11 30 18Z" fill="#6fbf5a" stroke="#2e5f2f" stroke-width="1"/>
      <circle cx="44" cy="28" r="3" fill="#b384ff"/>
      ${textLines(6, 44, 7, 48)}
    </svg>`,
    { size: 256 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="#fbf0d2"/>
      <text x="30" y="12" text-anchor="middle" font-family="serif" font-weight="bold" font-size="7" fill="#7a4c2a">Elixir of Winds</text>
      ${textLines(7, 20, 10, 46)}
      <rect x="7" y="72" width="46" height="1.6" fill="#8b6a46"/>
    </svg>`,
    { size: 256 },
  );
  const RUNES = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="22" fill="none" stroke="#6ff0d0" stroke-width="2.2"/>
      <circle cx="30" cy="30" r="14" fill="none" stroke="#6ff0d0" stroke-width="1.8"/>
      <polygon points="${poly(30, 30, 22, 3, 0)}" fill="none" stroke="#6ff0d0" stroke-width="2"/>
      <polygon points="${poly(30, 30, 22, 3, 60)}" fill="none" stroke="#6ff0d0" stroke-width="2"/>
      <path d="M8 62 l5 -6 l5 6 M24 56 v10 M24 61 h7 M38 56 l6 10 M44 56 l-6 10 M50 57 v9 M50 57 h5" stroke="#6ff0d0" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M8 73 h12 M26 73 h8 M40 73 h12" stroke="#6ff0d0" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const sprigLeaves = Array.from({ length: 5 }, (_, i) => {
    const y = 70 - i * 13;
    return `<path d="M16 ${y} Q4 ${y - 4} 3 ${y - 12} Q14 ${y - 10} 16 ${y}Z M16 ${y - 5} Q28 ${y - 9} 29 ${y - 17} Q18 ${y - 15} 16 ${y - 5}Z" fill="#6fbf5a" stroke="#2e5f2f" stroke-width="1.6"/>`;
  }).join("");
  const LEAF = svg(
    `<svg viewBox="0 0 32 80" xmlns="http://www.w3.org/2000/svg"><path d="M16 80 L16 6" stroke="#3f7a3a" stroke-width="3"/>${sprigLeaves}<path d="M16 8 Q10 0 16 -2 Q22 0 16 8Z" fill="#8bd86a"/></svg>`,
    { size: 192 },
  );
  const lavBuds = Array.from({ length: 9 }, (_, i) => {
    const y = 8 + i * 4.8;
    return `<ellipse cx="${i % 2 ? 9 : 15}" cy="${y}" rx="3.6" ry="2.8" fill="${i % 3 ? "#9b7be0" : "#b99cf5"}" stroke="#5a3f9e" stroke-width="1"/>`;
  }).join("");
  const LAVENDER = svg(
    `<svg viewBox="0 0 24 80" xmlns="http://www.w3.org/2000/svg"><path d="M12 80 L12 10" stroke="#4f8a4a" stroke-width="2.6"/><path d="M12 62 Q3 58 2 50 M12 56 Q21 52 22 44" stroke="#4f8a4a" stroke-width="2" fill="none"/>${lavBuds}</svg>`,
    { size: 192 },
  );
  const wheatGrains = Array.from({ length: 7 }, (_, i) => {
    const y = 10 + i * 6;
    return `<ellipse cx="7" cy="${y}" rx="3.2" ry="4.4" fill="#f0c25a" stroke="#a8742a" stroke-width="1" transform="rotate(-25 7 ${y})"/><ellipse cx="17" cy="${y}" rx="3.2" ry="4.4" fill="#f0c25a" stroke="#a8742a" stroke-width="1" transform="rotate(25 17 ${y})"/>`;
  }).join("");
  const WHEAT = svg(
    `<svg viewBox="0 0 24 80" xmlns="http://www.w3.org/2000/svg"><path d="M12 80 L12 6" stroke="#b08a3a" stroke-width="2.6"/>${wheatGrains}<ellipse cx="12" cy="4" rx="3" ry="5" fill="#f0c25a" stroke="#a8742a" stroke-width="1"/></svg>`,
    { size: 192 },
  );

  const HILITE = svg(
    `<svg viewBox="0 0 30 60" xmlns="http://www.w3.org/2000/svg"><path d="M22 6 Q6 14 6 32 Q6 42 10 48" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="22" cy="52" r="3.6" fill="#ffffff"/></svg>`,
    { size: 96 },
  );
  const labelTex = (kind: "drop" | "flame" | "leaf", ink: string) => {
    const icon =
      kind === "drop"
        ? `<path d="M30 18 Q44 36 44 44 A14 14 0 0 1 16 44 Q16 36 30 18Z" fill="${ink}"/>`
        : kind === "flame"
          ? `<path d="M30 14 Q44 30 42 44 Q40 56 30 56 Q20 56 18 44 Q17 36 24 30 Q24 38 30 38 Q28 26 30 14Z" fill="${ink}"/>`
          : `<path d="M16 54 Q14 24 46 16 Q48 46 16 54Z" fill="${ink}"/><path d="M18 52 Q30 38 42 22" stroke="#fbefcc" stroke-width="2" fill="none"/>`;
    return svg(
      `<svg viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="54" height="66" rx="6" fill="#fbefcc" stroke="#7a4c2a" stroke-width="3"/><rect x="9" y="9" width="42" height="54" rx="4" fill="none" stroke="${ink}" stroke-width="1.6"/>${icon}<rect x="18" y="58" width="24" height="2.4" fill="#7a4c2a"/></svg>`,
      { size: 128 },
    );
  };
  const LBL_DROP = labelTex("drop", "#2f7fb8");
  const LBL_FLAME = labelTex("flame", "#d4552c");
  const LBL_LEAF = labelTex("leaf", "#3f8a42");

  let rugDia = "";
  for (let i = 0; i < 9; i++) {
    const cx = 10 + i * 11.5;
    rugDia += `<path d="M${cx} 14 L${cx + 5} 26 L${cx} 38 L${cx - 5} 26Z" fill="#f2c452" stroke="#7a4c2a" stroke-width="1"/><circle cx="${cx}" cy="26" r="1.8" fill="#78e7c4"/>`;
  }
  const RUG = svg(
    `<svg viewBox="0 0 112 52" xmlns="http://www.w3.org/2000/svg">
      <rect width="112" height="52" fill="#2c7f88"/>
      <rect x="3" y="3" width="106" height="46" fill="none" stroke="#f2c452" stroke-width="2.4"/>
      <rect x="7" y="7" width="98" height="38" fill="none" stroke="#f9e6a0" stroke-width="1"/>
      <rect x="9" y="9" width="94" height="34" fill="#236a79"/>
      ${rugDia}
      <path d="M9 11 H103 M9 41 H103" stroke="#f2c452" stroke-width="1.2" stroke-dasharray="3 2"/>
    </svg>`,
    { size: 640 },
  );

  const NOTE = svg(
    `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="100" rx="3" fill="#f3e3b3" stroke="#8b6a46" stroke-width="2.4"/>
      <rect x="5" y="5" width="70" height="90" fill="none" stroke="#c9a566" stroke-width="1.2"/>
      <text x="40" y="17" text-anchor="middle" font-family="serif" font-weight="bold" font-size="8" fill="#6a3f23">ANEMO TONIC</text>
      <circle cx="40" cy="50" r="19" fill="none" stroke="#2f7f88" stroke-width="1.8"/>
      <polygon points="${poly(40, 50, 19, 3, 0)}" fill="none" stroke="#2f7f88" stroke-width="1.6"/>
      <polygon points="${poly(40, 50, 19, 3, 60)}" fill="none" stroke="#2f7f88" stroke-width="1.6"/>
      <circle cx="40" cy="50" r="4" fill="#78e7c4" stroke="#2f7f88" stroke-width="1.2"/>
      <circle cx="14" cy="30" r="5" fill="#b384ff" stroke="#59449e" stroke-width="1.2"/>
      <circle cx="66" cy="30" r="5" fill="#ff8f5a" stroke="#a24a2c" stroke-width="1.2"/>
      <circle cx="14" cy="72" r="5" fill="#7fe0ff" stroke="#2d6f9a" stroke-width="1.2"/>
      <circle cx="66" cy="72" r="5" fill="#8bd86a" stroke="#2f6448" stroke-width="1.2"/>
      <path d="M18 33 L28 42 M62 33 L52 42 M18 69 L28 58 M62 69 L52 58" stroke="#8b6a46" stroke-width="1.2"/>
      ${textLines(10, 82, 3, 60)}
    </svg>`,
    { size: 384 },
  );

  // ------------------------------------------------------------------ primitive helpers
  const part = (g: THREE.BufferGeometry, c: any, at: P3, o: any = {}) => b.part(g, c, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, c: any, at: P3, o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: P3, o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
  const ball = (r: number, c: any, at: P3, o: any = {}, ws = 8, hs = 6) =>
    part(new THREE.SphereGeometry(r, ws, hs), c, at, o);
  const torus = (r: number, tube: number, c: any, at: P3, rot: P3, seg = 24, o: any = {}) =>
    part(new THREE.TorusGeometry(r, tube, 5, seg), c, at, { rotation: rot, ...o });
  const lathe = (outline: number[][], c: any, at: P3, o: any = {}) =>
    b.lathe(outline as any, { at, color: c, bone: root, segments: 12, ...o });
  const solid = (p: number[][]) => [[0, p[0][1]], ...p, [0, p[p.length - 1][1]]];
  const rod = (a: P3, c: P3, r: number, col: any) => b.rod(a, c, r, { color: col, bone: root, sides: 6 } as any);
  const gem = (at: P3, r: number, col: string, str: number, scale: P3 = [1, 1.3, 0.8], o: any = {}) =>
    glow(part(new THREE.OctahedronGeometry(r), col, at, { scale, flat: true, ...o }), str);
  const plane = (w: number, h: number, tex: THREE.Texture, at: P3, dir: P3, up: P3 = [0, 1, 0], o: any = {}) =>
    part(new THREE.PlaneGeometry(w, h), "#ffffff", at, { texture: tex, dir, axis: "z", up, ...o });
  const leaf = (at: P3, dir: P3, side: P3, len: number, wid: number, col: any, thick = 0.004) =>
    b.extrude(
      [
        [0, 0, "sharp"],
        [wid * 0.5, len * 0.35],
        [wid * 0.35, len * 0.72],
        [0, len, "sharp"],
        [-wid * 0.35, len * 0.72],
        [-wid * 0.5, len * 0.35],
      ] as any,
      { at, x: side, y: dir, thickness: thick, color: col, bone: root },
    );
  const local = (ox: number, oy: number, oz: number, yaw: number) => {
    const c = Math.cos(yaw * DEG);
    const s = Math.sin(yaw * DEG);
    return (x: number, y: number, z: number): P3 => [ox + x * c + z * s, oy + y, oz - x * s + z * c];
  };

  // ------------------------------------------------------------------ platform
  lathe(
    [[0, 0], [1.5, 0], [1.5, 0.05], [1.42, 0.07], [1.42, F], [0, F]],
    STONE,
    [0, 0, 0],
    { segments: 8, spin: 22.5 },
  );
  glow(plane(2.7, 2.7, CIRCLE, [0, F + 0.002, 0], [0, 1, 0], [0, 0, -1]), 0.75);
  glow(torus(1.36, 0.012, TEAL_G, [0, F + 0.006, 0], [90, 0, 0], 48), 1);
  for (let k = 0; k < 4; k++) {
    const a = (45 + 90 * k) * DEG;
    const px = 1.32 * Math.sin(a);
    const pz = 1.32 * Math.cos(a);
    lathe([[0.085, 0], [0.085, 0.06], [0.06, 0.09], [0.06, 0.19], [0.078, 0.22], [0.078, 0.235]], STONE_DK, [px, F, pz], {
      segments: 8,
    });
    cyl(0.082, 0.082, 0.012, 8, GOLD, [px, F + 0.2, pz]);
    gem([px, F + 0.29, pz], 0.04, TEAL_G, 1.2, [1, 1.4, 1]);
  }

  // ------------------------------------------------------------------ table
  box(1.56, 0.06, 0.76, WOOD_X, [0, T - 0.03, 0]);
  box(1.5, 0.02, 0.7, WOOD_DK, [0, T - 0.07, 0]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(0.06, 0.064, 0.06, GOLD, [sx * 0.78, T - 0.03, sz * 0.38]);
      box(0.08, T - 0.06 - F, 0.08, WOOD_Y, [sx * 0.68, F + (T - 0.06 - F) / 2, sz * 0.3]);
      box(0.1, 0.04, 0.1, WOOD_DK, [sx * 0.68, F + 0.02, sz * 0.3]);
      box(0.1, 0.03, 0.1, WOOD_DK, [sx * 0.68, T - 0.075, sz * 0.3]);
      ball(0.012, GOLD, [sx * 0.68, F + 0.045, sz * 0.3 + sz * 0.052]);
    }
  box(1.36, 0.14, 0.035, WOOD_X, [0, T - 0.13, 0.3]);
  box(1.36, 0.14, 0.035, WOOD_X, [0, T - 0.13, -0.3]);
  for (const sx of [-1, 1]) {
    box(0.035, 0.14, 0.56, WOOD_X, [sx * 0.68, T - 0.13, 0]);
    box(0.04, 0.04, 0.56, WOOD_DK, [sx * 0.68, F + 0.12, 0]);
  }
  box(1.36, 0.04, 0.04, WOOD_DK, [0, F + 0.12, 0.3]);
  box(1.36, 0.04, 0.04, WOOD_DK, [0, F + 0.12, -0.3]);
  box(1.36, 0.03, 0.56, WOOD_X, [0, F + 0.2, 0]);
  for (const s of [-1, 1]) {
    box(0.6, 0.115, 0.022, WOOD_DK, [s * 0.33, T - 0.13, 0.335]);
    box(0.5, 0.085, 0.01, WOOD_X, [s * 0.33, T - 0.13, 0.35]);
    plane(0.085, 0.085, CREST, [s * 0.33, T - 0.13, 0.356], [0, 0, 1]);
    for (const k of [-1, 1]) {
      ball(0.015, GOLD, [s * 0.33 + k * 0.17, T - 0.13, 0.362]);
      cyl(0.006, 0.006, 0.02, 6, GOLD_DK, [s * 0.33 + k * 0.17, T - 0.13, 0.352], { rotation: [90, 0, 0] });
    }
    // key plate
    box(0.02, 0.028, 0.006, GOLD_DK, [s * 0.33 + (s > 0 ? -0.23 : 0.23), T - 0.13, 0.356]);
  }
  // table runner
  plane(1.1, 0.5, RUG, [0.0, T + 0.0015, 0.06], [0, 1, 0], [0, 0, -1]);
  for (let i = 0; i < 9; i++) {
    cyl(0.006, 0.003, 0.05, 5, GOLD, [-0.5 + i * 0.125, T - 0.022, 0.32 + 0.0], { rotation: [0, 0, 0] });
  }

  // ------------------------------------------------------------------ lower shelf goods
  {
    const sy = F + 0.215;
    const jar = {
      prof: [[0.05, 0], [0.06, 0.01], [0.06, 0.1], [0.052, 0.11], [0.052, 0.125], [0.056, 0.13], [0.056, 0.14]],
      fill: 0.1,
      seg: 8,
    };
    bottle(-0.5, sy, 0.0, { ...jar, liquid: "#8bd86a", label: LBL_LEAF });
    bottle(-0.36, sy, 0.1, { ...jar, liquid: "#ffcf5a", label: LBL_FLAME });
    bottle(0.5, sy, -0.1, { ...jar, liquid: "#9a7be0", label: LBL_DROP });
    // scrolls
    for (let i = 0; i < 3; i++) {
      cyl(0.03, 0.03, 0.34, 8, CREAM, [0.05 + (i % 2) * 0.005, sy + 0.03 + Math.floor(i / 2) * 0.05 + (i === 2 ? 0 : 0), 0.0 + (i === 2 ? 0 : (i - 0.5) * 0.065)], { rotation: [0, 0, 90] });
    }
    for (const x of [-0.08, 0.14]) cyl(0.034, 0.034, 0.014, 8, RED, [x, sy + 0.03, -0.03], { rotation: [0, 0, 90] });
    // crate
    box(0.22, 0.14, 0.2, WOOD_X, [0.3, sy + 0.085, 0.12]);
    box(0.225, 0.02, 0.205, WOOD_DK, [0.3, sy + 0.04, 0.12]);
    box(0.225, 0.02, 0.205, WOOD_DK, [0.3, sy + 0.13, 0.12]);
    gem([0.3, sy + 0.185, 0.12], 0.04, "#ffd35a", 1.1, [1, 1.2, 1]);
  }

  // ------------------------------------------------------------------ back rack
  const topY = 1.86;
  for (const s of [-1, 1]) {
    box(0.07, topY - T, 0.07, WOOD_Y, [s * 0.74, T + (topY - T) / 2, -0.33]);
    cyl(0.0, 0.05, 0.07, 4, GOLD, [s * 0.74, topY + 0.035, -0.33], { rotation: [0, 45, 0] });
    box(0.085, 0.03, 0.085, GOLD, [s * 0.74, T + 0.015, -0.33]);
    b.extrude([[0, 0], [0.14, 0], [0, -0.12]] as any, {
      at: [s * 0.55, 1.325, -0.34],
      thickness: 0.025,
      color: WOOD_DK,
      bone: root,
    });
  }
  for (let i = 0; i < 6; i++) {
    box(0.235, 0.77, 0.02, i % 2 ? WOOD_Y2 : WOOD_Y, [-0.5875 + i * 0.235, 1.335, -0.345 + (i % 2) * 0.002]);
  }
  box(1.6, 0.09, 0.1, WOOD_DK, [0, 1.82, -0.33]);
  box(1.6, 0.014, 0.106, GOLD, [0, 1.772, -0.33]);
  box(1.6, 0.014, 0.106, GOLD, [0, 1.868, -0.33]);
  plane(0.16, 0.16, CREST, [0, 1.82, -0.278], [0, 0, 1]);
  for (const s of [-1, 1]) for (const k of [1, 2, 3]) ball(0.012, GOLD, [s * (0.2 + k * 0.17), 1.82, -0.277], {}, 6, 4);
  // shelf
  const shY = 1.34;
  box(1.41, 0.03, 0.2, WOOD_X, [0, shY, -0.23]);
  box(1.41, 0.04, 0.012, WOOD_DK, [0, shY - 0.005, -0.13]);
  // standing books
  const spineBook = (x: number, h: number, w: number, c: any, lean = 0) => {
    const y = shY + 0.015 + h / 2;
    box(w, h, 0.13, c, [x, y, -0.23], { rotation: [0, 0, lean] });
    for (const f of [-0.35, 0.35])
      box(w + 0.003, 0.008, 0.004, GOLD, [x, y + f * h, -0.163], { rotation: [0, 0, lean] });
    box(w * 0.7, h * 0.22, 0.003, CREAM, [x, y + 0.02, -0.163], { rotation: [0, 0, lean] });
  };
  spineBook(-0.66, 0.2, 0.05, RED);
  spineBook(-0.6, 0.17, 0.045, BLUEB);
  spineBook(-0.55, 0.21, 0.055, GREENB);
  spineBook(-0.49, 0.16, 0.045, PURPLE);
  spineBook(-0.43, 0.19, 0.05, LEATHER, 0);
  spineBook(-0.36, 0.18, 0.045, TEAL, -14);
  bottle(-0.27, shY + 0.015, -0.23, {
    prof: [[0.03, 0], [0.042, 0.01], [0.042, 0.1], [0.03, 0.13], [0.02, 0.15], [0.02, 0.18], [0.025, 0.188]],
    fill: 0.09,
    liquid: "#ff7fb0",
    seg: 8,
  });
  // right of shelf
  bottle(0.28, shY + 0.015, -0.23, {
    prof: [[0.034, 0], [0.06, 0.014], [0.074, 0.05], [0.074, 0.085], [0.056, 0.12], [0.026, 0.145], [0.022, 0.17], [0.027, 0.18], [0.027, 0.186]],
    fill: 0.095,
    liquid: "#7fe0ff",
    label: LBL_DROP,
  });
  bottle(0.4, shY + 0.015, -0.2, {
    prof: [[0.04, 0], [0.065, 0.02], [0.07, 0.06], [0.045, 0.1], [0.052, 0.13], [0.03, 0.16], [0.02, 0.19], [0.025, 0.198]],
    fill: 0.1,
    liquid: "#b8f06a",
    seg: 8,
  });
  const crystal = (x: number, y: number, z: number, h: number, r: number, col: string, tilt: P3) => {
    const L = (k: number): P3 => {
      const rx = tilt[0] * DEG;
      const rz = tilt[2] * DEG;
      return [x - Math.sin(rz) * k, y + Math.cos(rz) * Math.cos(rx) * k, z + Math.sin(rx) * k];
    };
    glow(cyl(r, r * 1.1, h * 0.65, 6, col, L(h * 0.325), { rotation: tilt, flat: true }), 1);
    glow(cyl(0, r, h * 0.35, 6, "#ffffff".length ? col : col, L(h * 0.825), { rotation: tilt, flat: true }), 1.3);
  };
  cyl(0.1, 0.12, 0.03, 7, STONE_DK, [0.58, shY + 0.03, -0.23]);
  crystal(0.58, shY + 0.045, -0.23, 0.17, 0.028, "#ffd35a", [0, 0, 0]);
  crystal(0.54, shY + 0.045, -0.22, 0.11, 0.02, "#ffe58a", [0, 0, 18]);
  crystal(0.63, shY + 0.045, -0.24, 0.12, 0.02, "#ffc23d", [15, 0, -18]);

  // note
  plane(0.26, 0.325, NOTE, [0, 1.56, -0.333], [0, 0, 1]);
  for (const s of [-1, 1]) ball(0.01, RED, [s * 0.1, 1.71, -0.328], {}, 6, 4);

  // arms + herb rail + lanterns
  for (const s of [-1, 1]) {
    rod([s * 0.74, 1.76, -0.3], [s * 0.74, 1.76, -0.08], 0.013, WOOD_DK);
    ball(0.02, GOLD, [s * 0.74, 1.76, -0.08]);
    box(0.06, 0.02, 0.06, GOLD, [s * 0.74, 1.76, -0.3]);
  }
  rod([-0.74, 1.76, -0.08], [0.74, 1.76, -0.08], 0.011, WOOD_DK);

  const lantern = (x: number, y: number, z: number) => {
    glow(cyl(0.055, 0.055, 0.12, 6, "#ffc65c", [x, y, z]), 1.4);
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * DEG;
      box(0.009, 0.13, 0.009, GOLD, [x + 0.056 * Math.sin(a), y, z + 0.056 * Math.cos(a)]);
    }
    cyl(0.012, 0.07, 0.05, 6, GOLD, [x, y + 0.085, z]);
    cyl(0.066, 0.066, 0.012, 6, GOLD, [x, y + 0.062, z]);
    cyl(0.062, 0.04, 0.02, 6, GOLD, [x, y - 0.07, z]);
    cyl(0.0, 0.016, 0.04, 6, GOLD, [x, y - 0.1, z]);
    ball(0.012, GOLD, [x, y + 0.115, z]);
    rod([x, y + 0.12, z], [x, 1.76, z], 0.003, GOLD);
  };
  lantern(-0.74, 1.6, -0.08);
  lantern(0.74, 1.6, -0.08);

  // hanging herbs
  const bundle = (x: number, tex: THREE.Texture, size: [number, number]) => {
    const k: P3 = [x, 1.752, -0.08];
    cyl(0.017, 0.013, 0.04, 6, TWINE, [x, 1.735, -0.08]);
    const items = b.ring(frame(k, [0, -1, 0]), { count: 6, tilt: 68 }).items;
    for (const it of items) b.spike(it, it, size[1] * 0.92, 0.004, { color: STEM, bone: root } as any);
    b.cards(items, tex, { size, lean: 0, cross: true, rng: R, vary: 0.2, sink: 0 });
    box(0.03, 0.012, 0.012, RED, [x, 1.722, -0.075]);
  };
  bundle(-0.66, LEAF, [0.07, 0.22]);
  bundle(-0.5, LAVENDER, [0.05, 0.24]);
  bundle(0.18, WHEAT, [0.055, 0.22]);
  bundle(0.32, LEAF, [0.07, 0.2]);
  bundle(0.46, LAVENDER, [0.05, 0.22]);
  bundle(0.6, WHEAT, [0.055, 0.2]);

  // ------------------------------------------------------------------ bottle helper
  function clip(p: number[][], f: number) {
    const out: number[][] = [];
    for (let i = 0; i < p.length; i++) {
      if (p[i][1] <= f) out.push([p[i][0], p[i][1]]);
      else {
        if (i > 0) {
          const t = (f - p[i - 1][1]) / (p[i][1] - p[i - 1][1]);
          out.push([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, f]);
        }
        break;
      }
    }
    return out;
  }
  function bottle(
    x: number,
    y: number,
    z: number,
    spec: { prof: number[][]; fill: number; liquid: string; seg?: number; label?: THREE.Texture; glow?: number },
  ) {
    const at: P3 = [x, y, z];
    const seg = spec.seg ?? 10;
    const last = spec.prof[spec.prof.length - 1];
    lathe(solid(spec.prof), GLASS, at, { segments: seg });
    const lp = clip(spec.prof, spec.fill).map(([r, yy]) => [r * 1.03, yy + 0.0008]);
    const liq = lathe(solid(lp), spec.liquid, at, { segments: seg });
    glow(liq, spec.glow ?? 0.85);
    cyl(last[0] * 1.05, last[0] * 0.85, 0.034, 8, CORK, [x, y + last[1] + 0.008, z]);
    cyl(last[0] * 1.14, last[0] * 1.14, 0.01, 8, GOLD, [x, y + last[1] - 0.014, z]);
    let rw = 0;
    let yw = 0;
    for (const [r, yy] of lp)
      if (r > rw) {
        rw = r;
        yw = yy;
      }
    if (rw > 0.03) {
      b.decal(liq, HILITE, {
        at: [x - rw * 0.55, y + yw + 0.01, z + rw * 0.85],
        dir: [-0.5, 0.05, 1],
        size: [rw * 0.5, rw * 1.1],
        segments: 4,
        lift: 0.003,
      } as any);
    }
    if (spec.label && rw > 0.045) {
      b.decal(liq, spec.label, {
        at: [x + rw * 0.1, y + yw - 0.005, z + rw],
        dir: [0.1, 0, 1],
        size: [rw * 1.15, rw * 1.38],
        segments: 5,
      } as any);
    }
  }

  // ------------------------------------------------------------------ alembic
  {
    const ax = -0.46;
    const az = 0.05;
    const rh = T + 0.14;
    torus(0.058, 0.007, IRON, [ax, rh, az], [90, 0, 0], 16);
    for (let k = 0; k < 3; k++) {
      const a = (90 + 120 * k) * DEG;
      rod(
        [ax + 0.058 * Math.sin(a), rh, az + 0.058 * Math.cos(a)],
        [ax + 0.12 * Math.sin(a), T, az + 0.12 * Math.cos(a)],
        0.006,
        IRON,
      );
    }
    // spirit lamp
    ball(0.035, BLUEB, [ax, T + 0.032, az], { scale: [1, 0.85, 1] });
    cyl(0.012, 0.016, 0.03, 6, GOLD, [ax, T + 0.07, az]);
    glow(lathe(solid([[0.014, 0], [0.019, 0.012], [0.011, 0.032], [0.0, 0.05]]), AMBER, [ax, T + 0.085, az], { segments: 6 }), 1.3);
    glow(lathe(solid([[0.007, 0], [0.01, 0.01], [0.005, 0.024], [0.0, 0.034]]), "#fff0a0", [ax, T + 0.087, az], { segments: 6 }), 1.4);
    // flask
    const fy = rh - 0.005;
    const prof = [[0.04, 0], [0.075, 0.015], [0.09, 0.06], [0.09, 0.1], [0.07, 0.145], [0.04, 0.18], [0.03, 0.23], [0.03, 0.27], [0.036, 0.28]];
    lathe(solid(prof), GLASS, [ax, fy, az], { segments: 12 });
    const lp = clip(prof, 0.115).map(([r, yy]) => [r * 1.03, yy + 0.0008]);
    const liq = lathe(solid(lp), "#7be08a", [ax, fy, az], { segments: 12 });
    glow(liq, 0.9);
    b.decal(liq, HILITE, { at: [ax - 0.05, fy + 0.08, az + 0.075], dir: [-0.5, 0.05, 1], size: [0.04, 0.085], segments: 4, lift: 0.003 } as any);
    for (let i = 0; i < 5; i++)
      glow(ball(0.007 + (i % 2) * 0.004, "#d8ffd0", [ax + (i - 2) * 0.02, fy + 0.07 + (i % 3) * 0.025, az + 0.01 * (i % 2)], {}, 5, 4), 1.2);
    cyl(0.038, 0.028, 0.045, 8, COPPER, [ax, fy + 0.29, az]);
    cyl(0.04, 0.04, 0.01, 8, GOLD, [ax, fy + 0.268, az]);
    // pipe
    const pts: P3[] = [
      [ax, fy + 0.31, az],
      [ax, fy + 0.37, az + 0.03],
      [ax, fy + 0.36, az + 0.1],
      [ax, T + 0.4, az + 0.17],
      [ax, T + 0.27, az + 0.2],
      [ax, T + 0.23, az + 0.2],
    ];
    const pipe = catmull(pts);
    b.sweep(pipe, 0.011, { color: COPPER, bone: root, sides: 6 } as any);
    for (const t of [0.25, 0.5, 0.78]) {
      const p = pipe.at(t);
      ball(0.017, GOLD, [p.x, p.y, p.z], {}, 6, 4);
    }
    bottle(ax, T, az + 0.2, {
      prof: [[0.04, 0], [0.06, 0.012], [0.062, 0.07], [0.045, 0.11], [0.024, 0.14], [0.022, 0.17], [0.027, 0.18], [0.027, 0.186]],
      fill: 0.07,
      liquid: "#7be08a",
      label: LBL_LEAF,
    });
    glow(ball(0.007, "#d8ffd0", [ax, T + 0.215, az + 0.2], {}, 5, 4), 1.2);
  }

  // ------------------------------------------------------------------ open book
  {
    const bx = -0.16;
    const bz = 0.06;
    box(0.34, 0.012, 0.25, LEATHER, [bx, T + 0.006, bz]);
    box(0.34, 0.006, 0.014, GOLD, [bx, T + 0.014, bz + 0.118]);
    box(0.34, 0.006, 0.014, GOLD, [bx, T + 0.014, bz - 0.118]);
    const t = 5;
    for (const s of [-1, 1]) {
      const cx = bx + s * 0.077;
      const cy = T + 0.023;
      box(0.155, 0.022, 0.225, "#ffffff", [cx, cy, bz], { texture: PAGES, rotation: [0, 0, s * t] });
      const n: P3 = [Math.sin(s * -t * DEG) * -1 * -1, Math.cos(t * DEG), 0];
      // normal tilts toward the spine side
      n[0] = -s * Math.sin(t * DEG);
      const pp = (k: number): P3 => [cx + n[0] * k, cy + n[1] * k, bz];
      plane(0.15, 0.215, s < 0 ? PAGE_L : PAGE_R, pp(0.0125), n, [0, 0, -1]);
      if (s > 0) glow(plane(0.12, 0.16, RUNES, pp(0.0135), n, [0, 0, -1]), 1.1);
    }
    box(0.012, 0.002, 0.07, RED, [bx + 0.01, T + 0.036, bz + 0.15], { rotation: [0, 0, 0] });
    // floating glyph rings over the book
    glow(torus(0.07, 0.003, TEAL_G, [bx + 0.075, T + 0.12, bz], [90, 0, 0], 20), 1);
    glow(torus(0.045, 0.003, TEAL_G, [bx + 0.075, T + 0.17, bz], [90, 0, 0], 16), 1);
    for (let i = 0; i < 4; i++) gem([bx + 0.075 + 0.07 * Math.cos(i * 1.57), T + 0.12, bz + 0.07 * Math.sin(i * 1.57)], 0.008, TEAL_G, 1.3, [1, 1.3, 1]);
  }

  // ------------------------------------------------------------------ mortar & pestle
  {
    const mx = -0.17;
    const mz = -0.22;
    lathe(
      [[0, 0], [0.035, 0], [0.065, 0.012], [0.075, 0.055], [0.07, 0.075], [0.056, 0.075], [0.05, 0.05], [0, 0.035]],
      STONE_DK,
      [mx, T, mz],
      { segments: 10 },
    );
    ball(0.042, LEAFG, [mx, T + 0.045, mz], { scale: [1, 0.35, 1] }, 8, 5);
    b.capsule([mx + 0.01, T + 0.05, mz], [mx + 0.08, T + 0.2, mz - 0.03], [0.014, 0.02], { color: STONE_DK, bone: root, sides: 7 } as any);
    ball(0.016, STONE_DK, [mx + 0.008, T + 0.046, mz], {}, 6, 4);
    // loose herbs
    const hp = [0.0, 1, 2].map((i) => frame([mx + 0.1 + i * 0.03, T + 0.002, mz + 0.06 + (i % 2) * 0.03], [0, 1, 0]));
    b.cards(hp, LEAF, { size: [0.05, 0.12], lean: 90, flow: [1, 0, 0.3], mirror: true, rng: R, vary: 0.2 });
    cyl(0.02, 0.02, 0.012, 8, GOLD, [mx - 0.1, T + 0.006, mz + 0.03]);
  }

  // ------------------------------------------------------------------ balance scale
  {
    const cx = 0.2;
    const cz = -0.16;
    const hy = T + 0.3;
    const tilt = 6;
    lathe(solid([[0.085, 0], [0.085, 0.014], [0.06, 0.03], [0.04, 0.04], [0.026, 0.06]]), GOLD_DK, [cx, T, cz], { segments: 10 });
    cyl(0.013, 0.02, 0.24, 8, GOLD, [cx, T + 0.18, cz]);
    for (const h of [0.08, 0.16]) torus(0.02, 0.005, GOLD_DK, [cx, T + h, cz], [90, 0, 0], 8);
    ball(0.026, GOLD, [cx, hy, cz]);
    ball(0.016, GOLD, [cx, hy + 0.04, cz]);
    cyl(0, 0.014, 0.04, 6, GOLD, [cx, hy + 0.07, cz]);
    box(0.36, 0.014, 0.018, GOLD, [cx, hy, cz], { rotation: [0, 0, tilt] });
    box(0.3, 0.006, 0.024, GOLD_DK, [cx, hy + 0.0, cz], { rotation: [0, 0, tilt] });
    for (const s of [-1, 1]) {
      const ex = cx + s * 0.17 * Math.cos(tilt * DEG);
      const ey = hy + s * 0.17 * Math.sin(tilt * DEG);
      ball(0.013, GOLD, [ex, ey, cz], {}, 6, 4);
      const py = ey - 0.2;
      lathe([[0, 0], [0.03, 0], [0.07, 0.025], [0.07, 0.03], [0, 0.008]], GOLD, [ex, py, cz], { segments: 12 });
      for (let k = 0; k < 3; k++) {
        const a = (k * 120 + 30) * DEG;
        rod([ex, ey, cz], [ex + 0.068 * Math.cos(a), py + 0.03, cz + 0.068 * Math.sin(a)], 0.0018, GOLD_DK);
      }
      if (s < 0) {
        cyl(0.02, 0.026, 0.03, 8, GOLD, [ex - 0.02, py + 0.025, cz]);
        ball(0.008, GOLD, [ex - 0.02, py + 0.046, cz], {}, 5, 4);
        cyl(0.016, 0.02, 0.024, 8, GOLD_DK, [ex + 0.025, py + 0.02, cz + 0.02]);
        for (let c = 0; c < 4; c++) cyl(0.014, 0.014, 0.004, 10, GOLD, [ex + 0.02, py + 0.01 + c * 0.0045 + 0.02, cz - 0.03]);
      } else {
        gem([ex, py + 0.045, cz], 0.022, "#7fe0ff", 1.2, [1, 1.3, 0.9]);
      }
    }
    // table weights
    for (let i = 0; i < 3; i++) {
      const wr = 0.014 + i * 0.004;
      cyl(wr, wr + 0.004, 0.02 + i * 0.006, 8, GOLD, [cx + 0.16 + i * 0.05, T + 0.012 + i * 0.003, cz + 0.12 + (i % 2) * 0.03]);
      ball(0.006, GOLD, [cx + 0.16 + i * 0.05, T + 0.027 + i * 0.006, cz + 0.12 + (i % 2) * 0.03], {}, 5, 4);
    }
  }

  // ------------------------------------------------------------------ vial rack + table bottles
  {
    const rx = 0.1;
    const rz = 0.27;
    box(0.32, 0.025, 0.08, WOOD_DK, [rx, T + 0.0125, rz]);
    box(0.32, 0.05, 0.012, WOOD_X, [rx, T + 0.05, rz - 0.034]);
    for (const s of [-1, 1]) box(0.014, 0.06, 0.08, WOOD_DK, [rx + s * 0.153, T + 0.03, rz]);
    const vp = [[0.015, 0], [0.022, 0.006], [0.022, 0.09], [0.015, 0.11], [0.012, 0.125], [0.012, 0.14], [0.015, 0.145]];
    const cols = ["#b384ff", "#ff7fb0", "#ffc23d", "#7fe0ff"];
    cols.forEach((c, i) => bottle(rx - 0.1 + i * 0.066, T + 0.025, rz + 0.005, { prof: vp, fill: 0.085, liquid: c, seg: 8 }));
    bottle(0.46, T, 0.23, {
      prof: [[0.034, 0], [0.06, 0.014], [0.074, 0.05], [0.074, 0.085], [0.056, 0.12], [0.026, 0.145], [0.022, 0.19], [0.027, 0.2], [0.027, 0.206]],
      fill: 0.1,
      liquid: "#ff8f5a",
      label: LBL_FLAME,
    });
    bottle(0.57, T, 0.19, {
      prof: [[0.06, 0], [0.07, 0.01], [0.03, 0.14], [0.022, 0.17], [0.022, 0.2], [0.027, 0.21], [0.027, 0.216]],
      fill: 0.1,
      liquid: "#7fe0ff",
      label: LBL_DROP,
      seg: 10,
    });
    bottle(0.67, T, 0.25, {
      prof: [[0.03, 0], [0.042, 0.01], [0.042, 0.17], [0.03, 0.21], [0.02, 0.235], [0.02, 0.27], [0.025, 0.278], [0.025, 0.284]],
      fill: 0.14,
      liquid: "#b384ff",
      seg: 8,
    });
  }

  // ------------------------------------------------------------------ book stack + candle
  {
    const book = (ox: number, oy: number, oz: number, yaw: number, w: number, h: number, d: number, cover: any, orn: boolean) => {
      const L = local(ox, oy, oz, yaw);
      const rot: P3 = [0, yaw, 0];
      const t = 0.007;
      box(w, t, d, cover, L(0, t / 2, 0), { rotation: rot });
      box(w, t, d, cover, L(0, h - t / 2, 0), { rotation: rot });
      box(t, h, d, cover, L(-w / 2 + t / 2, h / 2, 0), { rotation: rot });
      box(w - t - 0.004, h - 2 * t, d - 0.012, "#ffffff", L((t - 0.004) / 2, h / 2, 0), { texture: PAGES, rotation: rot });
      for (const z of [-0.3, 0, 0.3]) box(t + 0.004, h + 0.002, 0.008, GOLD, L(-w / 2 + t / 2 - 0.001, h / 2, z * d), { rotation: rot });
      if (orn) {
        const c = Math.cos(yaw * DEG);
        const s = Math.sin(yaw * DEG);
        plane(w * 0.62, d * 0.8, COVER_ORN, L(t * 0.5, h + 0.0012, 0), [0, 1, 0], [-s, 0, -c]);
      }
      box(0.006, h * 0.8, 0.026, GOLD_DK, L(w / 2, h / 2, 0), { rotation: rot });
    };
    book(0.62, T, -0.12, 10, 0.28, 0.05, 0.2, RED, true);
    book(0.62, T + 0.05, -0.12, -8, 0.24, 0.04, 0.17, BLUEB, true);
    book(0.62, T + 0.09, -0.12, 20, 0.2, 0.035, 0.15, GREENB, true);
    const cy = T + 0.125;
    lathe([[0, 0], [0.06, 0], [0.06, 0.008], [0.03, 0.014], [0.03, 0.02], [0.0, 0.02]].map((p) => p), GOLD, [0.62, cy, -0.12], { segments: 10 });
    torus(0.03, 0.006, GOLD, [0.62 + 0.0, cy + 0.02, -0.12], [90, 0, 0], 10);
    cyl(0.022, 0.022, 0.1, 8, CREAM, [0.62, cy + 0.07, -0.12]);
    for (const a of [20, 140, 250]) cyl(0.006, 0.004, 0.03 + (a % 3) * 0.004, 5, CREAM, [0.62 + 0.021 * Math.sin(a * DEG), cy + 0.105, -0.12 + 0.021 * Math.cos(a * DEG)]);
    glow(lathe(solid([[0.012, 0], [0.016, 0.012], [0.008, 0.034], [0.0, 0.055]]), AMBER, [0.62, cy + 0.12, -0.12], { segments: 6 }), 1.4);
    glow(lathe(solid([[0.006, 0], [0.009, 0.01], [0.004, 0.026], [0.0, 0.038]]), "#fff0a0", [0.62, cy + 0.122, -0.12], { segments: 6 }), 1.5);
  }

  // ------------------------------------------------------------------ Cecilia flower pot
  const flower = (at: P3, n: number, s: number, col: string) => {
    for (let k = 0; k < n; k++) {
      const ph = ((k * 360) / n) * DEG;
      const al = 52 * DEG;
      const d: P3 = [Math.sin(ph) * Math.cos(al), Math.sin(al), Math.cos(ph) * Math.cos(al)];
      const xd: P3 = [Math.cos(ph), 0, -Math.sin(ph)];
      glow(
        b.extrude(
          [[0, 0, "sharp"], [0.022 * s, 0.03 * s], [0.016 * s, 0.065 * s], [0, 0.09 * s, "sharp"], [-0.016 * s, 0.065 * s], [-0.022 * s, 0.03 * s]] as any,
          { at, x: xd, y: d, thickness: 0.004, color: col, bone: root },
        ),
        1,
      );
    }
    glow(ball(0.012 * s, "#fff7a8", [at[0], at[1] + 0.012 * s, at[2]], {}, 6, 4), 1.4);
  };
  {
    const px = -0.64;
    const pz = -0.24;
    lathe(solid([[0.042, 0], [0.058, 0.09], [0.068, 0.1], [0.068, 0.118], [0.06, 0.118]]), CLAY, [px, T, pz], { segments: 10 });
    cyl(0.07, 0.07, 0.014, 10, GOLD, [px, T + 0.112, pz]);
    cyl(0.056, 0.056, 0.01, 10, SOIL, [px, T + 0.117, pz]);
    const tips: P3[] = [
      [px, T + 0.28, pz],
      [px - 0.09, T + 0.22, pz + 0.03],
      [px + 0.085, T + 0.2, pz - 0.02],
    ];
    tips.forEach((tp, i) => {
      b.sweep(catmull([[px + (i - 1) * 0.01, T + 0.12, pz], [(px + tp[0]) / 2 + (i - 1) * 0.01, (T + 0.12 + tp[1]) / 2, (pz + tp[2]) / 2], tp]), [0.006, 0.0035], {
        color: STEM,
        bone: root,
        sides: 5,
      } as any);
      flower(tp, 7, i === 0 ? 1 : 0.8, i === 2 ? "#a9e4ff" : "#d6f8ff");
    });
    leaf([px, T + 0.12, pz], [0.7, 0.5, 0.2], [0, 0, 1], 0.1, 0.05, LEAFG);
    leaf([px, T + 0.12, pz], [-0.7, 0.5, 0.4], [0, 0, 1], 0.1, 0.05, LEAFG);
    leaf([px, T + 0.12, pz], [0.2, 0.5, 0.8], [1, 0, 0], 0.09, 0.05, LEAFG);
  }

  // ------------------------------------------------------------------ Anemo Vision
  {
    const V: P3 = [-0.16, 1.4, 0.0];
    const star = b.extrude(
      [[0, 0.1, "sharp"], [0.03, 0.03], [0.1, 0, "sharp"], [0.03, -0.03], [0, -0.1, "sharp"], [-0.03, -0.03], [-0.1, 0, "sharp"], [-0.03, 0.03]] as any,
      { at: V, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: GOLD, bone: root, bevel: 0.003 },
    );
    void star;
    torus(0.058, 0.007, GOLD_DK, [V[0], V[1], V[2] + 0.011], [0, 0, 0], 16);
    gem([V[0], V[1], V[2] + 0.016], 0.05, TEAL_G, 1.6, [1, 1.25, 0.7]);
    torus(0.19, 0.004, TEAL_G, V, [78, 0, 15], 32);
    torus(0.14, 0.004, "#bafff0", V, [20, 0, -40], 28);
    glow(
      b.sweep(spiral(V, [V[0] + 0.2, V[1] - 0.1, V[2]], [0, 1, 0], { turns: 1.5, r1: 0.09, pitch: 0.15 }), [0.007, 0.002], {
        color: TEAL_G,
        bone: root,
        sides: 4,
      } as any),
      1.1,
    );
    for (let i = 0; i < 9; i++) {
      const a = R() * 6.28;
      const rr = 0.13 + R() * 0.12;
      gem([V[0] + rr * Math.cos(a), V[1] - 0.12 + R() * 0.3, V[2] + rr * Math.sin(a)], 0.007 + R() * 0.006, i % 2 ? "#bafff0" : TEAL_G, 1.4, [1, 1.3, 1]);
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      const p: P3 = [V[0] + 0.22 * Math.cos(a), V[1] + 0.08 - i * 0.06, V[2] + 0.22 * Math.sin(a)];
      glow(leaf(p, [Math.cos(a + 1.57), 0.5, Math.sin(a + 1.57)], [0, 1, 0], 0.06, 0.028, "#aef5dc", 0.004), 1.1);
    }
  }

  // ------------------------------------------------------------------ stool, barrel, sack
  {
    const sx = -0.5;
    const sz = 0.82;
    cyl(0.17, 0.17, 0.04, 10, WOOD_X, [sx, F + 0.43, sz]);
    cyl(0.15, 0.15, 0.04, 10, TEAL, [sx, F + 0.47, sz]);
    ball(0.014, GOLD, [sx, F + 0.495, sz], {}, 6, 4);
    for (let k = 0; k < 3; k++) {
      const a = (30 + 120 * k) * DEG;
      rod([sx + 0.11 * Math.sin(a), F + 0.41, sz + 0.11 * Math.cos(a)], [sx + 0.18 * Math.sin(a), F, sz + 0.18 * Math.cos(a)], 0.02, WOOD_DKY);
    }
    torus(0.15, 0.01, WOOD_DK, [sx, F + 0.16, sz], [90, 0, 0], 12);
  }
  {
    const bxp = 0.6;
    const bzp = 0.82;
    const prof = [[0.15, 0], [0.185, 0.1], [0.2, 0.25], [0.185, 0.4], [0.15, 0.5]];
    lathe(solid(prof), WOOD_DKY, [bxp, F, bzp], { segments: 12 });
    const radAt = (y: number) => {
      for (let i = 1; i < prof.length; i++)
        if (y <= prof[i][1]) {
          const t = (y - prof[i - 1][1]) / (prof[i][1] - prof[i - 1][1]);
          return prof[i - 1][0] + (prof[i][0] - prof[i - 1][0]) * t;
        }
      return prof[prof.length - 1][0];
    };
    for (const y of [0.06, 0.17, 0.33, 0.44]) {
      const r = radAt(y) + 0.006;
      cyl(r, r, 0.026, 12, IRON, [bxp, F + y, bzp]);
    }
    cyl(0.15, 0.15, 0.01, 12, WOOD_X, [bxp, F + 0.505, bzp]);
    cyl(0.012, 0.012, 0.07, 6, GOLD, [bxp, F + 0.22, bzp + 0.24], { rotation: [90, 0, 0] });
    ball(0.02, GOLD, [bxp, F + 0.22, bzp + 0.285], {}, 6, 4);
    bottle(bxp, F + 0.51, bzp, {
      prof: [[0.034, 0], [0.06, 0.014], [0.074, 0.05], [0.074, 0.085], [0.056, 0.12], [0.026, 0.145], [0.022, 0.17], [0.027, 0.18], [0.027, 0.186]],
      fill: 0.1,
      liquid: "#ff7fb0",
      label: LBL_FLAME,
    });
  }
  {
    const kx = 1.0;
    const kz = 0.3;
    lathe(solid([[0.12, 0], [0.17, 0.05], [0.19, 0.15], [0.15, 0.25], [0.07, 0.32], [0.085, 0.34], [0.085, 0.37], [0.06, 0.37]]), SACK, [kx, F, kz], { segments: 9 });
    cyl(0.088, 0.088, 0.016, 8, TWINE, [kx, F + 0.33, kz]);
    box(0.03, 0.05, 0.01, TWINE, [kx + 0.03, F + 0.305, kz + 0.085]);
    const items = b.ring(frame([kx, F + 0.36, kz], [0, 1, 0]), { count: 5, radius: 0.03, tilt: 55 }).items;
    b.cards(items, LEAF, { size: [0.07, 0.2], lean: 0, cross: true, rng: R, vary: 0.2, sink: 0.05 });
    plane(0.1, 0.1, CREST, [kx - 0.02, F + 0.17, kz + 0.19], [-0.05, 0.1, 1]);
  }

  return b.root;
}
```