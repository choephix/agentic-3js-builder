```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, paint, mix, noise, smoothstep, grain, mottle, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Anemo Sky Island",
  description:
    "A floating sky island in a Genshin Impact style: sakura and green trees, glowing ancient ruins with a rune platform, a pond with a waterfall, a stone lantern, hanging vines, crystals and mini islets.",
};

const G = 3.02; // grass level
const TEAL = "#5ff3e8";
const GOLD = "#e0a63c";

// ---------- paints ----------
const ROCK_PROFILE: [number, number][] = [
  [0, 0],
  [0.3, 0.25],
  [0.8, 0.8],
  [1.7, 1.5],
  [2.6, 2.1],
  [2.95, 2.62],
];
function rockR(y: number) {
  for (let i = 1; i < ROCK_PROFILE.length; i++) {
    const [r0, y0] = ROCK_PROFILE[i - 1];
    const [r1, y1] = ROCK_PROFILE[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
  }
  return 2.95;
}
const ROCK = paint((p, n) => {
  let c = mix("#8d7b72", "#b8a28a", noise(p, 0.55, 1));
  if (Math.sin(p.y * 13 + noise(p, 0.9, 3) * 5) > 0.35) c = mix(c, "#6f5f5f", 0.45);
  c = mix(c, "#4a4262", smoothstep(1.4, 0.1, p.y) * 0.75);
  if (n.y > 0.55) c = mix(c, "#7cc45a", 0.55 * smoothstep(0.3, 0.7, noise(p, 0.3, 7)));
  const sh = 0.82 + 0.18 * smoothstep(-0.8, 0.6, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh] as const;
});
const GRASS = paint((p, n) => {
  if (n.y > 0.5) {
    const t = noise(p, 0.45, 4);
    return mix(mix("#6fcf54", "#a5e56a", t), "#c6f07c", 0.35 * smoothstep(0.55, 0.8, noise(p, 0.12, 8)));
  }
  return mix("#8b5a3a", "#6a4230", noise(p, 0.2, 2));
});
const STONE = paint((p, n) => {
  let c = mix("#d9cfb6", "#bdb095", noise(p, 0.22, 5));
  if (Math.floor(p.y * 5) % 2 === 0 && n.y < 0.5) c = mix(c, "#a99c84", 0.25);
  if (n.y > 0.5 && noise(p, 0.3, 9) > 0.42) c = mix(c, "#7fb853", 0.7);
  c = mix(c, "#6aa047", 0.45 * smoothstep(G + 0.5, G, p.y));
  const sh = 0.8 + 0.2 * smoothstep(-0.6, 0.7, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh] as const;
});
const WATER = paint((p) => mix("#43bde6", "#9aeef2", noise(p, 0.3, 2)));
const BARK = grain("#5b3c2e", "#85593c", { size: 0.05, axis: "y" });

const PINK_A = cel("#ffb9d0", "#ec86b0");
const PINK_B = cel("#ffd3e2", "#f3a3c3");
const GREEN_A = cel("#6fd35a", "#2f9e6a");
const GREEN_B = cel("#9be56a", "#4db36a");
const PINE = cel("#3fae78", "#25785f");

// ---------- textures ----------
const RUNE_CIRCLE = (() => {
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const r0 = 80, r1 = i % 3 === 0 ? 92 : 87;
    ticks += `M${100 + Math.sin(a) * r0} ${100 - Math.cos(a) * r0}L${100 + Math.sin(a) * r1} ${100 - Math.cos(a) * r1}`;
  }
  let star = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2 * 3) / 8;
    star += `${i ? "L" : "M"}${100 + Math.sin(a) * 62} ${100 - Math.cos(a) * 62}`;
  }
  return svg(
    `<svg viewBox="0 0 200 200"><g fill="none" stroke="#5ff3e8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="95" stroke-width="3"/><circle cx="100" cy="100" r="76" stroke-width="2.5"/>
    <path d="${ticks}" stroke-width="3"/><path d="${star}Z" stroke-width="3"/>
    <circle cx="100" cy="100" r="26" stroke="#e0a63c" stroke-width="4"/><circle cx="100" cy="100" r="8" fill="#e0a63c" stroke="none"/>
    <path d="M100 74V126M74 100H126" stroke="#e0a63c" stroke-width="3"/></g></svg>`,
    { size: 512 },
  );
})();
const GLYPH = svg(
  `<svg viewBox="0 0 40 80"><g fill="none" stroke="#5ff3e8" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 4V76"/><circle cx="20" cy="22" r="9"/><path d="M6 44L20 34L34 44"/><path d="M8 58L20 50L32 58"/><circle cx="20" cy="68" r="3" fill="#e0a63c" stroke="#e0a63c"/></g></svg>`,
  { size: 256 },
);
const FALLS = svg(
  `<svg viewBox="0 0 60 200"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#b8f2ff"/><stop offset="0.5" stop-color="#58c8ec"/><stop offset="1" stop-color="#d8f8ff"/></linearGradient></defs>
  <rect width="60" height="200" fill="url(#g)"/>
  <g stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.85">
  <path d="M8 10V80M20 30V150M33 5V110M45 40V170M54 15V90M14 110V190M40 120V195M27 150V198"/></g></svg>`,
  { size: 256 },
);
const TUFT = svg(
  `<svg viewBox="0 0 40 50"><path d="M20 50 Q14 28 6 4 Q22 22 24 50Z" fill="#7fd45a"/><path d="M18 50 Q22 26 20 0 Q30 24 26 50Z" fill="#a8e86c"/><path d="M22 50 Q30 30 38 12 Q34 36 28 50Z" fill="#5cbf4e"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "skyIsland" });
  const R = rng(11);

  const put = (geo: THREE.BufferGeometry, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(geo, color, { at: [x, y, z], ...o });
  const blob = (x: number, y: number, z: number, r: number, color: any, sy = 0.85) =>
    put(new THREE.IcosahedronGeometry(r, 1), color, x, y, z, { scale: [1, sy, 1], flat: true });
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, rot?: number[]) =>
    put(new THREE.BoxGeometry(w, h, d), color, x, y, z, rot ? { rotation: rot } : {});

  const free = (x: number, z: number) =>
    Math.hypot(x + 1.4, z + 0.3) > 1.4 &&
    Math.hypot(x - 0.8, z - 0.4) > 1.25 &&
    !(x > 1.4 && Math.abs(z - 0.4) < 0.5) &&
    Math.hypot(x - 1.6, z + 1.5) > 0.4 &&
    Math.hypot(x + 2.3, z - 1.4) > 0.4 &&
    Math.hypot(x - 0.25, z - 1.95) > 0.4 &&
    Math.hypot(x + 0.5, z + 2.4) > 0.4;

  // ---------- island body ----------
  b.lathe([...ROCK_PROFILE, [0, 2.62]] as any, { at: [0, 0, 0], segments: 9, spin: 10, color: ROCK });
  const cap = b.lathe(
    [[0, 2.55], [2.9, 2.55], [3.05, 2.75], [3.05, 2.95], [2.8, G], [0, G]] as any,
    { at: [0, 0, 0], segments: 12, color: GRASS },
  );
  // rocky chunks bulging from the flank
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const y = 0.8 + R() * 1.6;
    const r = rockR(y);
    put(new THREE.DodecahedronGeometry(0.3 + R() * 0.25, 0), ROCK, Math.sin(a) * r * 0.95, y, Math.cos(a) * r * 0.95, {
      scale: [1, 1.2, 1],
      rotation: [R() * 90, R() * 90, 0],
      flat: true,
    });
  }
  // stalactites
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.7;
    const y = 1.9 - R() * 0.5;
    const r = rockR(y) * 0.82;
    const h = 0.6 + R() * 0.5;
    put(new THREE.ConeGeometry(0.16 + R() * 0.08, h, 6), ROCK, Math.sin(a) * r, y - h / 2 + 0.1, Math.cos(a) * r, {
      rotation: [180, 0, 0],
      flat: true,
    });
  }
  // glowing crystals in the flank
  for (const [deg, y, s] of [[200, 1.25, 1], [320, 1.6, 0.8], [140, 0.95, 0.7]] as number[][]) {
    const a = (deg * Math.PI) / 180;
    const r = rockR(y) + 0.02;
    glow(
      put(new THREE.OctahedronGeometry(0.16 * s, 0), TEAL, Math.sin(a) * r, y, Math.cos(a) * r, {
        scale: [0.8, 2.2, 0.8],
        dir: [Math.sin(a) * 0.8, -0.35, Math.cos(a) * 0.8],
        flat: true,
      }),
      1.4,
    );
  }
  // hanging vines
  for (const deg of [200, 250, 330, 20, 150, 290]) {
    const a = (deg * Math.PI) / 180;
    const s = Math.sin(a), c = Math.cos(a);
    const len = 0.7 + R() * 0.6;
    b.sweep(catmull([[s * 3.0, 2.8, c * 3.0], [s * 3.08, 2.8 - len * 0.4, c * 3.08], [s * 2.98, 2.8 - len, c * 2.98]]), [0.03, 0.012], {
      color: "#4fa24a",
      sides: 5,
    });
    blob(s * 3.05, 2.45, c * 3.05, 0.09, GREEN_B);
    blob(s * 2.98, 2.8 - len, c * 2.98, 0.07, GREEN_A);
  }

  // ---------- pond, river, waterfall ----------
  put(new THREE.CylinderGeometry(0.98, 1.02, 0.1, 10), STONE, 0.8, G + 0.03, 0.4, { flat: true });
  put(new THREE.CylinderGeometry(0.88, 0.88, 0.08, 10), WATER, 0.8, G + 0.07, 0.4);
  b.sweep(catmull([[1.4, G + 0.045, 0.4], [1.9, G + 0.045, 0.55], [2.5, G + 0.045, 0.2], [3.15, G + 0.045, 0.4]]), () => [0.27, 0.035], {
    section: "box",
    color: WATER,
    caps: "flat",
  });
  for (const [x, z] of [[1.8, 0.05], [2.3, 0.75], [2.8, 0.0]]) put(new THREE.DodecahedronGeometry(0.12, 0), STONE, x, G + 0.05, z, { flat: true });
  // rock spring behind the pond
  for (const [x, y, z, r] of [[0.2, 0.1, 1.0, 0.3], [0.5, 0.15, 1.28, 0.22]] as number[][])
    put(new THREE.DodecahedronGeometry(r, 0), STONE, x + 0.3, G + y, z - 1.0, { flat: true });
  const fallsX = 3.17;
  glow(put(new THREE.BoxGeometry(0.14, 2.5, 0.6), "#ffffff", fallsX, G - 1.25, 0.4, { texture: FALLS }), 0.5);
  put(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 7), "#bff3ff", fallsX, G - 0.02, 0.4, { rotation: [90, 0, 0], flat: true });
  for (const [dx, dy, dz, r] of [[0, 0, 0, 0.4], [0.25, 0.1, 0.3, 0.3], [-0.1, 0.05, -0.3, 0.32], [0.3, 0.05, -0.2, 0.26], [0.1, 0.35, 0.05, 0.28]])
    blob(fallsX + dx, 0.55 + dy, 0.4 + dz, r, "#f2fbff", 0.7);
  for (let i = 0; i < 8; i++) blob(fallsX + 0.1 + R() * 0.5, 0.2 + R() * 0.6, 0.4 + (R() - 0.5) * 0.9, 0.06, "#d8f6ff");

  // ---------- ruins ----------
  const PX = -1.4, PZ = -0.3;
  put(new THREE.CylinderGeometry(1.15, 1.25, 0.16, 8), STONE, PX, G + 0.08, PZ, { flat: true });
  put(new THREE.CylinderGeometry(1.0, 1.05, 0.04, 8), "#bfb399", PX, G + 0.18, PZ, { flat: true });
  glow(
    put(new THREE.CircleGeometry(0.95, 24), "#ffffff", PX, G + 0.215, PZ, { dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: RUNE_CIRCLE }),
    1.3,
  );
  // trim ring in gold
  b.part(new THREE.TorusGeometry(1.1, 0.025, 4, 8), GOLD, { at: [PX, G + 0.17, PZ], rotation: [90, 22.5, 0], flat: true });

  const pillar = (x: number, z: number, h: number, glyph: boolean, broken: boolean) => {
    const y0 = G + 0.16;
    box(0.66, 0.2, 0.66, STONE, x, y0 + 0.1, z);
    box(0.46, h, 0.46, STONE, x, y0 + 0.2 + h / 2, z);
    box(0.5, 0.05, 0.5, GOLD, x, y0 + 0.23, z);
    glow(box(0.47, 0.04, 0.47, TEAL, x, y0 + 0.2 + h * 0.62, z), 1.2);
    if (!broken) {
      box(0.62, 0.16, 0.62, STONE, x, y0 + 0.2 + h + 0.08, z);
      box(0.66, 0.04, 0.66, GOLD, x, y0 + 0.2 + h + 0.0, z);
    } else {
      put(new THREE.DodecahedronGeometry(0.26, 0), STONE, x, y0 + 0.2 + h + 0.03, z, { scale: [1, 0.6, 1], rotation: [0, 30, 10], flat: true });
    }
    if (glyph)
      glow(
        put(new THREE.PlaneGeometry(0.26, 0.52), "#ffffff", x, y0 + 0.2 + h * 0.35, z + 0.235, { dir: [0, 0, 1], axis: "z", texture: GLYPH }),
        1.4,
      );
    return y0 + 0.2 + h;
  };
  const topL = pillar(-2.2, -1.05, 2.1, true, false);
  pillar(-0.6, -1.05, 1.0, true, true);
  // broken arch fragment springing from the tall pillar
  b.extrude(
    [[0, -0.3], [0.5, 0.05], [1.0, 0.25], [1.4, 0.3], [1.4, 0.7], [0.9, 0.65], [0.35, 0.4], [0, 0.1]] as any,
    { at: [-2.2 + 0.1, topL + 0.08, -1.05], x: [1, 0, 0], thickness: 0.4, bevel: 0.02, color: STONE },
  );
  b.extrude([[0, 0], [0.5, 0], [0.4, 0.22], [0.1, 0.3]] as any, { at: [-0.8, G + 0.26, -1.05], x: [1, 0, 0], thickness: 0.4, color: STONE });
  // fallen blocks
  for (const [x, z, ry] of [[-1.5, 0.6, 25], [-0.7, 0.55, -15], [-2.6, 0.2, 40]] as number[][]) {
    box(0.45, 0.22, 0.3, STONE, x, G + 0.11, z, [0, ry, 0]);
    box(0.4, 0.03, 0.26, "#7fb853", x, G + 0.225, z, [0, ry, 0]);
  }
  // altar crystal
  put(new THREE.CylinderGeometry(0.18, 0.26, 0.45, 6), STONE, PX, G + 0.4, PZ, { flat: true });
  b.part(new THREE.TorusGeometry(0.2, 0.02, 4, 6), GOLD, { at: [PX, G + 0.64, PZ], rotation: [90, 0, 0], flat: true });
  glow(put(new THREE.OctahedronGeometry(0.25, 0), "#7ff7ff", PX, G + 1.25, PZ, { scale: [0.85, 1.7, 0.85], flat: true }), 1.6);
  glow(put(new THREE.TorusGeometry(0.5, 0.018, 5, 24), GOLD, PX, G + 1.25, PZ, { rotation: [70, 0, 20] }), 1.2);
  glow(put(new THREE.TorusGeometry(0.62, 0.014, 5, 24), GOLD, PX, G + 1.25, PZ, { rotation: [100, 0, -35] }), 1.0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    glow(put(new THREE.OctahedronGeometry(0.06, 0), "#9ffcff", PX + Math.sin(a) * 0.75, G + 1.0 + (i % 2) * 0.4, PZ + Math.cos(a) * 0.75, { scale: [1, 1.8, 1], flat: true }), 1.5);
  }
  // stepping stones
  for (const [x, z] of [[-1.2, 1.0], [-0.9, 1.4], [-0.5, 1.75]]) put(new THREE.CylinderGeometry(0.22, 0.24, 0.07, 7), STONE, x, G + 0.03, z, { flat: true });

  // stone lantern
  {
    const x = 0.25, z = 1.95;
    put(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 6), STONE, x, G + 0.06, z, { flat: true });
    put(new THREE.CylinderGeometry(0.07, 0.09, 0.45, 6), STONE, x, G + 0.34, z, { flat: true });
    put(new THREE.CylinderGeometry(0.17, 0.12, 0.06, 6), STONE, x, G + 0.6, z, { flat: true });
    glow(box(0.2, 0.2, 0.2, "#ffc860", x, G + 0.73, z), 1.6);
    put(new THREE.ConeGeometry(0.28, 0.2, 4), "#8a6a58", x, G + 0.93, z, { rotation: [0, 45, 0], flat: true });
    put(new THREE.SphereGeometry(0.05, 6, 4), GOLD, x, G + 1.06, z);
  }

  // ---------- trees ----------
  const trunk = (x: number, z: number, s: number, lean: number) => {
    b.sweep(
      catmull([[x, G - 0.05, z], [x + lean * 0.4, G + 0.6 * s, z], [x - lean * 0.3, G + 1.2 * s, z + 0.08 * s], [x + lean * 0.1, G + 1.65 * s, z]]),
      [0.17 * s, 0.07 * s],
      { color: BARK, sides: 6 },
    );
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + x;
      put(new THREE.ConeGeometry(0.07 * s, 0.3 * s, 5), BARK, x + Math.sin(a) * 0.14 * s, G + 0.08, z + Math.cos(a) * 0.14 * s, {
        dir: [Math.sin(a), 0.7, Math.cos(a)],
        flat: true,
      });
    }
  };
  const crown = (x: number, z: number, s: number, A: any, B: any, white?: string) => {
    const bl = [[0, 2.0, 0, 0.78], [0.55, 1.8, 0.2, 0.52], [-0.55, 1.75, -0.1, 0.55], [0.1, 1.7, 0.55, 0.5], [-0.1, 1.7, -0.55, 0.5], [0.15, 2.45, 0.1, 0.5]];
    bl.forEach(([dx, dy, dz, r], i) => blob(x + dx * s, G + dy * s, z + dz * s, r * s, i % 2 ? B : A));
    if (white) for (let i = 0; i < 6; i++) blob(x + (R() - 0.5) * 1.4 * s, G + (1.7 + R() * 0.9) * s, z + (R() - 0.5) * 1.4 * s, 0.1 * s, white, 0.6);
  };
  trunk(1.6, -1.5, 1.25, 0.15);
  crown(1.6, -1.5, 1.25, PINK_A, PINK_B, "#fff2f7");
  trunk(-2.3, 1.4, 0.8, -0.1);
  crown(-2.3, 1.4, 0.8, GREEN_A, GREEN_B);
  // pines
  for (const [x, z, s] of [[-0.5, -2.4, 1.0], [2.1, 1.9, 0.7]]) {
    put(new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 0.5 * s, 6), BARK, x, G + 0.2 * s, z, { flat: true });
    for (let i = 0; i < 4; i++)
      put(new THREE.ConeGeometry(0.58 * s * (1 - i * 0.2), 0.6 * s, 7), PINE, x, G + (0.65 + i * 0.4) * s, z, { flat: true });
  }
  // bushes
  for (const [x, z, r] of [[2.4, -0.8, 0.3], [-0.9, 2.1, 0.26], [0.7, -0.9, 0.24], [-2.9, -0.4, 0.28]]) {
    blob(x, G + r * 0.5, z, r, GREEN_A);
    blob(x + r * 0.7, G + r * 0.35, z + r * 0.3, r * 0.7, GREEN_B);
  }

  // ---------- surface detail ----------
  const skin = b.surface(cap);
  const tufts = skin.scatter(70, { rng: rng(3), minDist: 0.28, filter: (h) => h.n.y > 0.9 && free(h.at.x, h.at.z) });
  b.cards(tufts, TUFT, { size: [0.22, 0.26], lean: 8, cross: true, vary: 0.3, rng: rng(4) });
  const FLOWERS = ["#ffffff", "#ffe066", "#ff9ec4", "#c9a6ff"];
  skin.scatter(30, { rng: rng(5), minDist: 0.35, filter: (h) => h.n.y > 0.9 && free(h.at.x, h.at.z) }).forEach((h, i) => {
    const { x, y, z } = h.at;
    put(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 4), "#4fa24a", x, y + 0.05, z);
    put(new THREE.IcosahedronGeometry(0.045, 0), FLOWERS[i % 4], x, y + 0.13, z, { flat: true });
  });

  // ---------- floating islets ----------
  const islet = (x: number, y: number, z: number, r: number, tree: boolean) => {
    put(new THREE.ConeGeometry(r, r * 1.7, 7), ROCK, x, y - r * 0.85, z, { rotation: [180, 0, 0], flat: true });
    put(new THREE.CylinderGeometry(r * 1.03, r, 0.14, 8), GRASS, x, y + 0.04, z, { flat: true });
    if (tree) {
      put(new THREE.CylinderGeometry(0.03, 0.05, 0.4, 5), BARK, x, y + 0.26, z);
      blob(x, y + 0.55, z, 0.26, PINK_A);
      blob(x + 0.14, y + 0.48, z + 0.05, 0.17, PINK_B);
    } else {
      put(new THREE.DodecahedronGeometry(0.14, 0), STONE, x, y + 0.2, z, { flat: true });
    }
  };
  islet(-3.9, 2.4, 1.4, 0.6, false);
  islet(3.9, 3.7, -1.4, 0.55, true);
  islet(-2.7, 4.7, -2.7, 0.42, false);
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    put(new THREE.DodecahedronGeometry(0.08 + R() * 0.08, 0), ROCK, Math.sin(a) * 3.6, 1.0 + R() * 3.3, Math.cos(a) * 3.6, { flat: true });
  }
  // petals drifting from the sakura
  for (let i = 0; i < 16; i++)
    put(new THREE.BoxGeometry(0.07, 0.012, 0.045), i % 2 ? "#ffc4d8" : "#fff0f5", 1.6 + (R() - 0.5) * 3.4, G + 0.3 + R() * 2.5, -1.5 + (R() - 0.5) * 3.2, {
      rotation: [R() * 180, R() * 180, R() * 180],
    });
  // cloud puffs round the underside
  for (const [x, y, z] of [[-3.0, 0.9, 1.5], [2.4, 0.6, 2.2], [-1.5, 0.5, -2.8], [1.8, 1.0, -2.7], [3.2, 1.2, 1.5]]) {
    blob(x, y, z, 0.42, "#ffffff", 0.6);
    blob(x + 0.4, y - 0.05, z + 0.1, 0.32, "#f4f9ff", 0.6);
    blob(x - 0.38, y - 0.08, z - 0.1, 0.3, "#eaf3ff", 0.6);
  }

  void mottle;
  return b.root;
}
```