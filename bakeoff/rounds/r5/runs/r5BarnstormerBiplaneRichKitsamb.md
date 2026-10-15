```ts
import * as THREE from "three";
import { bezier, catmull, createBuilder, frame, grain, lerp, mottle, paint, rng, svg } from "agentic-3js-builder";
import { countershade } from "agentic-3js-builder";
import { coil, gaugeTexture, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dizzy Daisy, the Barnstormer",
  description:
    "A chubby whimsical red-and-cream biplane with a smiling turquoise nose, a moustached pilot with a streaming scarf, a waving teddy-bear passenger, bunting, and a little grass airfield with windsock, sign, barrels and hay.",
};

// ---------------------------------------------------------------- palette
const RED = "#d9432e";
const DEEP = "#8e2418";
const CREAM = "#f6e8c3";
const YELLOW = "#f7bf3b";
const TEAL = "#2bb4b0";
const TEALD = "#1b7f86";
const WOOD = "#c98a4b";
const DARK = "#2b2230";
const LEATHER = "#7a4a2b";
const JACKET = "#8a5a34";
const GLOVE = "#5a3820";
const SKIN = "#f2b48c";
const BEAR = "#c98c52";
const GLASS = "#bfeaf2";
const TYRE = "#2a2430";

const BRASS = metal("brass", { tarnish: 0.12, polish: 0.5 });
const IRONP = metal("iron");
const COWL = countershade(TEAL, TEALD, { level: -0.1, soft: 0.5 });
const PROPWOOD = grain("#cf9150", "#a56b33", { size: 0.05, axis: "y" });
const HAY = grain("#e3b64f", "#b98a2c", { size: 0.04, axis: "x" });
const GRASS = mottle("#6fbf4a", "#4e9a3a", { size: 0.7, seed: 4 });
const DIRT = mottle("#d8b57c", "#c39a62", { size: 0.35, seed: 8 });

// painted fabric/patches
const PATCHES = [
  { z0: -0.85, z1: -0.55, y0: 1.2, y1: 1.36, c: TEAL },
  { z0: -1.55, z1: -1.25, y0: 1.24, y1: 1.4, c: YELLOW },
];
const FUSE = paint((p, n) => {
  if (n.y < -0.5) return DEEP;
  const yc = 1.5 + 0.18 * Math.min(Math.max((-p.z - 0.6) / 3, 0), 1);
  const dy = p.y - yc;
  if (Math.abs(n.x) > 0.3 && p.z < 1.0) {
    for (const q of PATCHES) {
      if (p.z > q.z0 && p.z < q.z1 && p.y > q.y0 && p.y < q.y1) {
        const e = Math.min(p.z - q.z0, q.z1 - p.z, p.y - q.y0, q.y1 - p.y);
        if (e < 0.02 && Math.floor(p.z * 70) % 2 === 0) return CREAM;
        return q.c;
      }
    }
    if (p.z > -1.4) {
      if (Math.abs(dy) < 0.08) return CREAM;
      if (Math.abs(dy) < 0.115) return DEEP;
    }
  }
  return RED;
});

const wingPaint = (hs: number, c: number, walkway: boolean) =>
  paint((_p, n, s) => {
    const ax = Math.abs(s[0]);
    const y = s[1];
    const face = Math.abs(n.y) > 0.5;
    const tip = hs - 1.0;
    if (ax > tip + 0.14) return RED;
    if (ax > tip) return YELLOW;
    if (y > c / 2 - 0.1) return RED;
    if (walkway && face && n.y > 0 && ax < 0.7) return "#6b4a38";
    const ail = y < -c / 2 + 0.4 && ax > 1.7 && ax < tip - 0.1;
    if (ail && face) {
      const edge = Math.abs(y - (-c / 2 + 0.4)) < 0.012 || Math.abs(ax - 1.7) < 0.012 || Math.abs(ax - (tip - 0.1)) < 0.012;
      return edge ? DEEP : "#efd9a0";
    }
    if (face && ax % 0.55 < 0.03) return "#d7bf8b";
    return CREAM;
  });

const FINP = paint((_p, _n, s) => (s[1] < 0.45 ? RED : s[1] < 0.85 ? CREAM : TEAL));
const STABP = paint((_p, n, s) => {
  const ax = Math.abs(s[0]);
  if (Math.abs(n.y) > 0.5 && ax % 0.4 < 0.025) return DEEP;
  return RED;
});
const SCARFP = paint((_p, _n, s) => (Math.floor(s[0] * 16) % 2 ? RED : CREAM));
const POLEP = paint((_p, _n, s) => (Math.floor(s[0] * 12) % 2 ? RED : CREAM));
const SOCKP = paint((_p, _n, s) => (Math.floor(s[0] * 7) % 2 ? RED : CREAM));
const BARRELP = paint((_p, _n, s) =>
  Math.abs(s[0] - 0.1) < 0.025 || Math.abs(s[0] - 0.5) < 0.025 ? DARK : TEAL,
);
const BASEP = paint((p, n) => (n.y > 0.5 ? GRASS : Math.sqrt(p.x * p.x + p.z * p.z) > 0 ? "#8a5f3a" : "#8a5f3a"));
const RUNP = paint((p, n) => {
  const t = Math.abs(Math.abs(p.x) - 1.25);
  return t < 0.14 && n.y > 0.5 ? "#a98150" : DIRT;
});

// ---------------------------------------------------------------- textures
const star = (() => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    const r = i % 2 ? 10 : 24;
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  }
  return d + "Z";
})();
const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${RED}" stroke="${DEEP}" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="${CREAM}"/><circle cx="50" cy="50" r="30" fill="${TEAL}"/>
  <path d="${star}" fill="${YELLOW}" stroke="${DEEP}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const hubWedges = [0, 2, 4]
  .map((i) => {
    const a1 = (Math.PI * i) / 3;
    const a2 = (Math.PI * (i + 1)) / 3;
    const p = (a: number) => `${(50 + 40 * Math.cos(a)).toFixed(1)} ${(50 + 40 * Math.sin(a)).toFixed(1)}`;
    return `<path d="M50 50 L${p(a1)} A40 40 0 0 1 ${p(a2)} Z" fill="${RED}"/>`;
  })
  .join("");
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#f3e6c4" stroke="#6b2a1c" stroke-width="4"/>${hubWedges}
  <circle cx="50" cy="50" r="11" fill="#e6b95c" stroke="#6b2a1c" stroke-width="3"/></svg>`,
  { size: 192 },
);
const EYE = svg(
  `<svg viewBox="0 0 66 76"><ellipse cx="36" cy="40" rx="26" ry="32" fill="#fffdf4" stroke="#2a1a22" stroke-width="4"/>
  <ellipse cx="40" cy="46" rx="15" ry="20" fill="#2a8fd0"/><ellipse cx="41" cy="47" rx="9" ry="13" fill="#1a1020"/>
  <circle cx="35" cy="38" r="6" fill="#fff"/><circle cx="47" cy="56" r="3" fill="#fff"/>
  <path d="M12 22 L3 14 M10 34 L2 30 M16 12 L10 4" stroke="#2a1a22" stroke-width="3.6" stroke-linecap="round" fill="none"/></svg>`,
  { size: 256 },
);
const SMILE = svg(
  `<svg viewBox="0 0 100 44"><ellipse cx="9" cy="20" rx="8" ry="6" fill="#ff8aa0"/><ellipse cx="91" cy="20" rx="8" ry="6" fill="#ff8aa0"/>
  <path d="M22 8 Q50 46 78 8 Z" fill="#5a1620" stroke="#2a1a22" stroke-width="4" stroke-linejoin="round"/>
  <path d="M27 9 L73 9 Q71 15 66 15 L34 15 Q29 15 27 9Z" fill="#fff"/>
  <ellipse cx="50" cy="29" rx="10" ry="5" fill="#ff7b8f"/></svg>`,
  { size: 256 },
);
const NAME = svg(
  `<svg viewBox="0 0 200 50"><text x="100" y="37" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="38" fill="${CREAM}" stroke="${DEEP}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">Dizzy Daisy</text>
  <path d="M8 44 Q40 52 70 44" stroke="${YELLOW}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M130 44 Q160 52 192 44" stroke="${YELLOW}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  { size: 512 },
);
const FLAG = svg(
  `<svg viewBox="0 0 40 52"><defs><clipPath id="c"><path d="M1 51 L39 51 L20 1 Z"/></clipPath></defs>
  <g clip-path="url(#c)"><rect x="0" y="36" width="40" height="16" fill="${RED}"/><rect x="0" y="21" width="40" height="15" fill="${CREAM}"/><rect x="0" y="0" width="40" height="21" fill="${TEAL}"/></g>
  <path d="M1 51 L39 51 L20 1 Z" fill="none" stroke="${DARK}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);
const GRASST = svg(
  `<svg viewBox="0 0 40 60"><path d="M20 60 Q18 30 8 4 Q24 26 24 60Z" fill="#5da83a"/><path d="M16 60 Q12 38 2 26 Q18 40 22 60Z" fill="#79c24a"/><path d="M22 60 Q28 30 38 14 Q32 40 28 60Z" fill="#4c9632"/></svg>`,
  { size: 128 },
);
const petals = Array.from({ length: 8 }, (_, i) => `<ellipse cx="20" cy="8" rx="4.2" ry="8" fill="#fffbe8" stroke="#e0d3a0" stroke-width="1" transform="rotate(${i * 45} 20 16)"/>`).join("");
const DAISY = svg(
  `<svg viewBox="0 0 40 60"><path d="M20 60 L20 22" stroke="#4c9632" stroke-width="3.2" stroke-linecap="round"/><path d="M20 46 Q30 40 34 32 Q26 36 20 42Z" fill="#5da83a"/>${petals}<circle cx="20" cy="16" r="5" fill="#f7bf3b"/></svg>`,
  { size: 128 },
);
const SIGN = svg(
  `<svg viewBox="0 0 200 120"><rect x="3" y="3" width="194" height="114" rx="12" fill="#ecc785" stroke="#6b3b1a" stroke-width="6"/>
  <text x="100" y="48" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="34" fill="${DEEP}">AIR SHOW!</text>
  <text x="100" y="78" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="19" fill="#4a2a14">Rides 5¢ - hold your hat</text>
  <path d="M30 94 Q100 112 170 94" stroke="${TEALD}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="22" cy="22" r="4" fill="${DEEP}"/><circle cx="178" cy="22" r="4" fill="${DEEP}"/></svg>`,
  { size: 512 },
);
const GAUGE = gaugeTexture({ needle: 40, label: "ALT" });

// ---------------------------------------------------------------- helpers
type Pt = [number, number];
function rounded(x0: number, x1: number, y0: number, y1: number, r: number, seg = 4): Pt[] {
  const pts: Pt[] = [];
  const corners: [number, number, number][] = [
    [x1 - r, y0 + r, -90],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, 90],
    [x0 + r, y0 + r, 180],
  ];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= seg; i++) {
      const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "barnstormer" });
  const R = rng(11);

  // ---------------------------------------------------------------- skeleton
  const body = b.joint("body", { at: [0, 1.5, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.5, 1.92], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.85, -3.55], dir: [0, 1, 0], role: "hinge" });
  const elev = [1, -1].map((s) =>
    b.joint(s > 0 ? "elevatorL" : "elevatorR", {
      parent: body,
      at: [s * 0.15, 1.77, -3.45],
      dir: [s, 0, 0],
      role: "hinge",
    }),
  );
  const wheelJ = [1, -1].map((s) =>
    b.joint(s > 0 ? "wheelL" : "wheelR", { parent: body, at: [s * 1.35, 0.54, 0.78], dir: [s, 0, 0] }),
  );
  const part = (g: THREE.BufferGeometry, c: string | ReturnType<typeof paint>, o: Record<string, unknown> = {}) =>
    b.part(g, c, { bone: body, ...o });
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------------------------------------------------------------- fuselage
  const fuse = b.loft(
    [
      { at: [0, 1.78, -3.75], w: 0.06, h: 0.1 },
      { at: [0, 1.72, -3.1], w: 0.24, h: 0.36 },
      { at: [0, 1.62, -2.0], w: 0.6, h: 0.78 },
      { at: [0, 1.5, -0.7], w: 0.96, h: 1.04 },
      { at: [0, 1.5, 0.4], w: 1.04, h: 1.12 },
      { at: [0, 1.5, 1.1], w: 1.2, h: 1.24 },
    ],
    { bone: body, color: FUSE },
  );
  const fuseSkin = b.surface(fuse);
  for (const s of [1, -1]) {
    const hit = fuseSkin.around([0, 1.62, -2.1]).at(s * 90, 0);
    if (hit) b.decal(fuse, NAME, { at: hit, dir: [s, 0, 0], size: [1.25, 0.31], lift: 0.004 });
  }

  // ---------------------------------------------------------------- cowling with a face
  const cowl = b.lathe(
    [[0, 0], [0.6, 0], [0.67, 0.08], [0.69, 0.3], [0.67, 0.52], [0.6, 0.66], [0.46, 0.76], [0.26, 0.82], [0, 0.84]],
    { at: [0, 1.5, 1.05], axis: [0, 0, 1], segments: 14, color: COWL, bone: body },
  );
  const cowlSkin = b.surface(cowl);
  for (const s of [1, -1]) {
    const hit = cowlSkin.around([0, 1.5, 1.3]).at(s * 30, 30);
    if (hit) b.decal(cowl, EYE, { at: hit, dir: [s * 0.12, 0.1, 1], size: [0.33, 0.38], mirror: s > 0, lift: 0.004 });
  }
  const mouth = cowlSkin.around([0, 1.5, 1.3]).at(0, -38);
  if (mouth) b.decal(cowl, SMILE, { at: mouth, dir: [0, -0.1, 1], size: [0.5, 0.22], lift: 0.004 });
  for (const z of [1.12, 1.5]) part(new THREE.TorusGeometry(0.675, 0.03, 6, 20), BRASS, { at: [0, 1.5, z], dir: [0, 0, 1], axis: "z" });
  b.ring(frame([0, 1.5, 1.31], [0, 0, 1]), { count: 18, radius: 0.675 }, (it) =>
    b.stick(ball(0.022, 5, 4), BRASS, it, { embed: 0.3, bone: body }),
  );
  // exhaust stacks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.58, 1.28, 1.45], [s * 0.86, 1.22, 1.4], [s * 0.95, 1.05, 1.0], [s * 0.9, 0.98, 0.5]]),
      [0.075, 0.05],
      { color: IRONP, bone: body, sides: 8 },
    );
    part(new THREE.TorusGeometry(0.08, 0.02, 5, 10), BRASS, { at: [s * 0.8, 1.22, 1.4], dir: [0.5, -0.2, 1], axis: "z" });
  }

  // propeller
  b.lathe([[0, 0], [0.17, 0], [0.15, 0.12], [0.08, 0.24], [0, 0.3]], {
    at: [0, 1.5, 1.9],
    axis: [0, 0, 1],
    segments: 10,
    color: BRASS,
    bone: prop,
  });
  const BLADE: Pt[] = [[-0.07, -0.05], [0.07, -0.05], [0.13, 0.45], [0.15, 0.9], [0.08, 1.14], [-0.08, 1.14], [-0.14, 0.9], [-0.11, 0.45]];
  const PROPP = paint((_p, _n, s) => (s[1] > 0.92 ? "#e6b95c" : PROPWOOD));
  for (const k of [1, -1]) {
    const a = 0.12;
    b.extrude(BLADE, {
      at: [0, 1.5, 1.95],
      x: [-k * Math.sin(a), k * Math.cos(a), 0],
      y: [k * Math.cos(a), k * Math.sin(a), 0],
      thickness: [0.05, 0.03],
      bevel: 0.012,
      color: PROPP,
      bone: prop,
    });
  }

  // ---------------------------------------------------------------- wings
  const upperY = 3.05;
  const lowerY = 1.12;
  b.extrude(rounded(-4.2, 4.2, -0.8, 0.8, 0.7, 5), {
    at: [0, upperY, 0.4], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.14, bevel: 0.05, color: wingPaint(4.2, 1.6, false), bone: body,
  });
  b.extrude(rounded(-3.8, 3.8, -0.75, 0.75, 0.65, 5), {
    at: [0, lowerY, 0.3], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.14, bevel: 0.05, color: wingPaint(3.8, 1.5, true), bone: body,
  });
  for (const s of [1, -1]) {
    part(new THREE.CircleGeometry(0.5, 20), "#ffffff", {
      texture: ROUNDEL, at: [s * 2.2, upperY + 0.075, 0.4], dir: [0, 1, 0], up: [0, 0, 1], axis: "z",
    });
    glow(part(ball(0.075, 6, 5), s > 0 ? "#ff3b30" : "#34d058", { at: [s * 4.12, upperY, 0.4] }), 1.6);
  }
  // wing fuel tank
  part(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 10), RED, { at: [0, upperY + 0.27, 0.55], dir: [1, 0, 0] });
  part(new THREE.CylinderGeometry(0.205, 0.205, 0.1, 10), CREAM, { at: [0, upperY + 0.27, 0.55], dir: [1, 0, 0] });
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8), BRASS, { at: [0, upperY + 0.5, 0.55] });

  // struts and wires
  const rodw = (a: number[], c: number[], r: number, col: string | typeof BRASS) =>
    b.rod(a, c, r, { color: col, bone: body, sides: 6 });
  for (const s of [1, -1]) {
    for (const z of [0.9, 0.0]) {
      b.sweep([[s * 2.6, 1.15, z], [s * 2.7, 3.0, z]], () => [0.024, 0.07], { color: TEAL, bone: body, caps: "flat" });
    }
    b.rod([s * 2.6, 1.17, 0.9], [s * 2.7, 2.98, 0.0], 0.011, { color: DARK, bone: body, sides: 4 });
    b.rod([s * 2.6, 1.17, 0.0], [s * 2.7, 2.98, 0.9], 0.011, { color: DARK, bone: body, sides: 4 });
    b.rod([s * 0.6, 2.95, 0.9], [s * 2.6, 1.2, 0.9], 0.011, { color: DARK, bone: body, sides: 4 });
    b.rod([s * 0.5, 2.95, -0.25], [s * 2.6, 1.2, 0.0], 0.011, { color: DARK, bone: body, sides: 4 });
    rodw([s * 0.42, 1.95, 0.95], [s * 0.6, 3.0, 0.95], 0.04, TEAL);
    rodw([s * 0.3, 1.93, -0.25], [s * 0.5, 3.0, -0.25], 0.04, TEAL);
    // tail bracing
    b.rod([s * 1.3, 1.8, -3.0], [0, 2.85, -3.1], 0.01, { color: DARK, bone: body, sides: 4 });
  }

  // ---------------------------------------------------------------- tail
  b.extrude([[-0.2, -0.2], [0.9, -0.2], [0.9, 0.9], [0.75, 1.12], [0.45, 1.2], [0.15, 0.85]], {
    at: [0, 1.85, -2.65], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, bevel: 0.015, color: FINP, bone: body,
  });
  const rud = b.extrude([[0, -0.15], [0.5, -0.1], [0.62, 0.3], [0.62, 0.8], [0.5, 1.1], [0.28, 1.28], [0, 1.2]], {
    at: [0, 1.85, -3.55], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, bevel: 0.015, color: FINP, bone: rudder,
  });
  void rud;
  for (const s of [1, -1])
    part(new THREE.CircleGeometry(0.2, 14), "#ffffff", {
      texture: ROUNDEL, at: [s * 0.04, 2.4, -3.85], dir: [s, 0, 0], up: [0, 1, 0], axis: "z", bone: rudder,
    });
  b.extrude(rounded(-1.6, 1.6, -0.4, 0.35, 0.3, 4), {
    at: [0, 1.76, -3.05], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.09, bevel: 0.03, color: STABP, bone: body,
  });
  for (const s of [1, -1]) {
    b.extrude([[-0.1, 0], [1.35, 0], [1.5, -0.15], [1.58, -0.35], [1.5, -0.58], [1.3, -0.7], [-0.1, -0.7]], {
      at: [s * 0.15, 1.77, -3.45], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.025, color: STABP,
      bone: elev[s > 0 ? 0 : 1],
    });
  }
  // tail wheel and spring
  b.sweep(catmull([[0, 1.5, -2.9], [0, 0.7, -3.3], [0, 0.3, -3.5]]), 0.035, { color: BRASS, bone: body });
  part(new THREE.TorusGeometry(0.12, 0.07, 6, 12), TYRE, { at: [0, 0.18, -3.5], dir: [1, 0, 0], axis: "z" });
  part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), CREAM, { at: [0, 0.18, -3.5], dir: [1, 0, 0] });

  // ---------------------------------------------------------------- landing gear
  b.rod([-1.35, 0.54, 0.78], [1.35, 0.54, 0.78], 0.045, { color: WOOD, bone: body, sides: 6 });
  for (const s of [1, -1]) {
    const bottom = [s * 1.1, 0.55, 0.78];
    const tf = [s * 0.38, 1.0, 1.05];
    const tr = [s * 0.34, 1.05, 0.3];
    b.rod(tf, bottom, 0.05, { color: TEAL, bone: body, sides: 6 });
    b.rod(tr, bottom, 0.05, { color: TEAL, bone: body, sides: 6 });
    b.sweep(coil(lerp(tf, bottom, 0.2), lerp(tf, bottom, 0.6), 0.07, 6), 0.014, { color: DARK, bone: body, sides: 5 });
    const w = wheelJ[s > 0 ? 0 : 1];
    const c: number[] = [s * 1.35, 0.54, 0.78];
    b.part(new THREE.TorusGeometry(0.4, 0.16, 8, 16), TYRE, { bone: w, at: c, dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.26, 12), CREAM, { bone: w, at: c, dir: [1, 0, 0] });
    b.part(new THREE.CircleGeometry(0.26, 18), "#ffffff", {
      bone: w, texture: HUB, at: [s * 1.35 + s * 0.133, 0.54, 0.78], dir: [s, 0, 0], up: [0, 1, 0], axis: "z",
    });
    // wheel chock
    b.extrude([[0, 0], [0.3, 0], [0, 0.2]], {
      at: [s * 1.35, 0.035, 1.38], thickness: 0.2, color: WOOD, bone: body,
    });
  }

  // ---------------------------------------------------------------- cockpits
  const cockpit = (z: number) => {
    b.lathe([[0, 0], [0.36, 0], [0.37, 0.18], [0.33, 0.27], [0.27, 0.27], [0.25, 0.17], [0, 0.17]], {
      at: [0, 1.8, z], segments: 12, color: LEATHER, bone: body,
    });
    part(new THREE.CylinderGeometry(0.245, 0.245, 0.012, 12), "#1f1722", { at: [0, 1.976, z] });
  };
  const windscreen = (z: number) => {
    b.extrude([[-0.3, -0.08], [0.3, -0.08], [0.27, 0.28], [-0.27, 0.28]], {
      at: [0, 2.0, z], thickness: 0.025, x: [1, 0, 0], y: [0, 1, 0], color: GLASS, bone: body,
    });
    b.rod([-0.28, 2.28, z], [0.28, 2.28, z], 0.02, { color: BRASS, bone: body, sides: 5 });
    for (const s of [1, -1]) b.rod([s * 0.3, 1.94, z], [s * 0.27, 2.28, z], 0.018, { color: BRASS, bone: body, sides: 5 });
  };
  const pilotZ = -1.25;
  const bearZ = 0.3;
  cockpit(pilotZ);
  cockpit(bearZ);
  windscreen(-0.72);
  windscreen(bearZ + 0.45);
  // instrument panel
  part(new THREE.BoxGeometry(0.5, 0.26, 0.04), LEATHER, { at: [0, 2.08, -0.8] });
  for (const x of [-0.12, 0.12])
    part(new THREE.CircleGeometry(0.08, 16), "#ffffff", { texture: GAUGE, at: [x, 2.09, -0.822], dir: [0, 0, -1], axis: "z" });

  // ---- pilot
  {
    const z = pilotZ;
    b.capsule([0, 1.95, z], [0, 2.2, z], 0.24, { color: JACKET, bone: body, sides: 8 });
    part(ball(0.22, 10, 8), SKIN, { at: [0, 2.58, z] });
    part(new THREE.SphereGeometry(0.235, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), LEATHER, { at: [0, 2.6, z] });
    part(ball(0.05, 6, 5), DARK, { at: [0, 2.84, z] });
    for (const s of [1, -1]) {
      part(ball(0.07, 6, 5), LEATHER, { at: [s * 0.21, 2.5, z], scale: [0.5, 1, 1] });
      part(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), BRASS, { at: [s * 0.095, 2.64, z + 0.17], dir: [0, 0, 1] });
      part(new THREE.CylinderGeometry(0.058, 0.058, 0.065, 10), GLASS, { at: [s * 0.095, 2.64, z + 0.175], dir: [0, 0, 1] });
      part(ball(0.035, 5, 4), "#f08a7a", { at: [s * 0.13, 2.5, z + 0.17] });
      b.sweep(
        catmull([[0, 2.48, z + 0.21], [s * 0.1, 2.46, z + 0.22], [s * 0.2, 2.5, z + 0.16], [s * 0.26, 2.6, z + 0.08]]),
        [0.035, 0.012],
        { color: "#8a3d1c", bone: body, sides: 6 },
      );
      b.rod([s * 0.27, 2.2, z], [s * 0.07, 2.2, z + 0.33], 0.07, { color: JACKET, bone: body, sides: 6 });
      part(ball(0.085, 6, 5), GLOVE, { at: [s * 0.06, 2.2, z + 0.35] });
    }
    part(ball(0.05, 6, 5), "#f09b7a", { at: [0, 2.55, z + 0.22] });
    part(new THREE.TorusGeometry(0.225, 0.02, 5, 14), DARK, { at: [0, 2.64, z], dir: [0, 1, 0], axis: "z" });
    part(new THREE.TorusGeometry(0.2, 0.05, 5, 12), RED, { at: [0, 2.4, z], dir: [0, 1, 0], axis: "z" });
    b.rod([0, 1.85, z + 0.25], [0, 2.26, z + 0.33], 0.025, { color: WOOD, bone: body, sides: 5 });
    part(ball(0.045, 6, 5), RED, { at: [0, 2.28, z + 0.33] });
    // the long streaming scarf
    b.sweep(
      catmull([[0, 2.36, z - 0.05], [0.1, 2.38, -1.85], [0.32, 2.42, -2.45], [0.5, 2.52, -3.1], [0.4, 2.6, -3.75], [0.58, 2.52, -4.4]]),
      (t) => [0.1 * (1 + 0.3 * t), 0.012],
      { color: SCARFP, bone: body, caps: "flat", sides: 6 },
    );
  }

  // ---- teddy bear passenger
  {
    const z = bearZ;
    b.capsule([0, 1.95, z], [0, 2.18, z], 0.26, { color: BEAR, bone: body, sides: 8 });
    part(ball(0.26, 10, 8), BEAR, { at: [0, 2.55, z] });
    part(ball(0.11, 8, 6), CREAM, { at: [0, 2.49, z + 0.22], scale: [1, 0.8, 0.9] });
    part(ball(0.04, 6, 5), DARK, { at: [0, 2.53, z + 0.32] });
    for (const s of [1, -1]) {
      part(ball(0.1, 7, 5), BEAR, { at: [s * 0.2, 2.78, z - 0.02] });
      part(ball(0.06, 6, 5), "#f0a0a0", { at: [s * 0.2, 2.78, z + 0.05] });
      part(ball(0.032, 6, 5), DARK, { at: [s * 0.09, 2.6, z + 0.23] });
      part(ball(0.01, 4, 3), "#fff", { at: [s * 0.09 + 0.01, 2.62, z + 0.26] });
    }
    // bow tie
    for (const s of [1, -1]) part(new THREE.ConeGeometry(0.07, 0.12, 6), RED, { at: [s * 0.06, 2.28, z + 0.2], dir: [s, 0, 0] });
    part(ball(0.035, 5, 4), YELLOW, { at: [0, 2.28, z + 0.21] });
    // waving left paw, resting right paw
    b.rod([0.3, 2.1, z], [0.5, 2.6, z + 0.05], 0.075, { color: BEAR, bone: body, sides: 6 });
    part(ball(0.095, 6, 5), CREAM, { at: [0.5, 2.64, z + 0.05] });
    b.rod([-0.3, 2.1, z], [-0.3, 2.12, z + 0.32], 0.075, { color: BEAR, bone: body, sides: 6 });
    part(ball(0.095, 6, 5), CREAM, { at: [-0.3, 2.12, z + 0.34] });
    // goggles pushed up
    part(new THREE.TorusGeometry(0.26, 0.018, 5, 14), DARK, { at: [0, 2.7, z], dir: [0, 1, 0.15], axis: "z" });
  }

  // ---------------------------------------------------------------- bunting
  for (const s of [1, -1]) {
    const wire = catmull([[s * 4.0, 2.98, 1.2], [s * 2.6, 2.55, 1.55], [s * 1.2, 2.35, 1.6], [s * 0.35, 2.1, 1.45]]);
    b.sweep(wire, 0.008, { color: DARK, bone: body, sides: 4 });
    const frames = Array.from({ length: 8 }, (_, i) => frame(wire.at((i + 0.7) / 8.6), [0, 1, 0]));
    b.cards(frames, FLAG, { size: [0.24, 0.3], lean: 180, flow: [0, 0, 1], bone: body, sink: 0.02 });
  }

  // ---------------------------------------------------------------- airfield
  const base = b.lathe([[0, -0.05], [5.7, -0.05], [5.7, 0.0], [5.5, 0.035], [0, 0.035]], {
    at: [0, 0, 0], segments: 28, color: BASEP, bone: body,
  });
  b.extrude(rounded(-1.5, 1.5, -4.9, 4.9, 1.4, 6), {
    at: [0, 0.035, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: RUNP, bone: body,
  });
  const blocked = (x: number, z: number) =>
    (Math.abs(x) < 2.0 && Math.abs(z) < 4.6) ||
    Math.hypot(x - 3.9, z - 3.5) < 1.1 ||
    Math.hypot(x + 3.7, z + 3.5) < 0.4 ||
    Math.hypot(x - 3.6, z + 3.4) < 0.9 ||
    Math.hypot(x + 3.9, z - 2.9) < 1.0;
  const hits = b
    .surface(base)
    .scatter(140, { rng: R, minDist: 0.34, filter: (h) => h.n.y > 0.8 && !blocked(h.at.x, h.at.z) });
  b.cards(hits.slice(0, 100), GRASST, { size: [0.24, 0.3], lean: 8, vary: 0.4, spin: 180, rng: R, cross: true, flow: [0, 0, 1], bone: body });
  b.cards(hits.slice(100), DAISY, { size: [0.2, 0.34], lean: 5, vary: 0.3, spin: 180, rng: R, cross: true, flow: [0, 0, 1], bone: body });

  // windsock
  b.sweep([[-3.7, 0.03, -3.5], [-3.7, 3.3, -3.5]], 0.05, { color: POLEP, bone: body, sides: 6 });
  part(ball(0.08, 6, 5), YELLOW, { at: [-3.7, 3.36, -3.5] });
  part(new THREE.TorusGeometry(0.26, 0.022, 5, 12), IRONP, { at: [-3.7, 3.1, -3.5], dir: [1, 0, 0], axis: "z" });
  b.sweep(bezier([-3.7, 3.1, -3.5], [-4.5, 3.1, -3.5], [-5.3, 2.95, -3.6], [-5.5, 2.6, -3.55]), [0.26, 0.1], {
    color: SOCKP, bone: body, caps: { start: "none", end: "flat" }, sides: 8,
  });

  // barrels
  for (const [x, z] of [[3.6, -3.4], [4.2, -2.8]]) {
    b.lathe([[0, 0], [0.26, 0], [0.3, 0.12], [0.32, 0.3], [0.3, 0.48], [0.26, 0.6], [0, 0.6]], {
      at: [x, 0.035, z], segments: 10, color: BARRELP, bone: body,
    });
    part(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), BRASS, { at: [x + 0.1, 0.64, z + 0.05] });
  }

  // hay bales
  const bale = (x: number, y: number, z: number, rot: number) => {
    part(new THREE.BoxGeometry(0.9, 0.5, 0.5), HAY, { at: [x, y, z], rotation: [0, rot, 0] });
    for (const o of [-0.22, 0.22])
      part(new THREE.BoxGeometry(0.04, 0.53, 0.53), "#7a5a2a", { at: [x + o * Math.cos((rot * Math.PI) / 180), y, z - o * Math.sin((rot * Math.PI) / 180)], rotation: [0, rot, 0] });
  };
  bale(-3.9, 0.285, 2.4, 10);
  bale(-3.9, 0.285, 3.3, -5);
  bale(-3.85, 0.785, 2.85, 90);

  // sign with lantern
  {
    const n = new THREE.Vector3(-0.34, 0, 0.94).normalize();
    const t = new THREE.Vector3(0.94, 0, 0.34);
    const c = new THREE.Vector3(3.9, 0, 3.5);
    for (const k of [-1, 1]) {
      const pp = c.clone().addScaledVector(t, 0.6 * k);
      b.rod([pp.x, 0.0, pp.z], [pp.x, 2.05, pp.z], 0.05, { color: WOOD, bone: body, sides: 6 });
    }
    part(new THREE.BoxGeometry(1.5, 0.9, 0.06), WOOD, { at: [c.x, 1.5, c.z], dir: n.toArray(), axis: "z", up: [0, 1, 0] });
    part(new THREE.PlaneGeometry(1.4, 0.8), "#ffffff", {
      texture: SIGN, at: [c.x + n.x * 0.034, 1.5, c.z + n.z * 0.034], dir: n.toArray(), axis: "z", up: [0, 1, 0],
    });
    const lp = c.clone().addScaledVector(t, 0.6);
    part(new THREE.CylinderGeometry(0.1, 0.12, 0.26, 6), DARK, { at: [lp.x, 2.2, lp.z] });
    glow(part(ball(0.1, 6, 5), "#ffcf5a", { at: [lp.x, 2.2, lp.z] }), 1.8);
    part(new THREE.ConeGeometry(0.14, 0.1, 6), DARK, { at: [lp.x, 2.38, lp.z] });
  }

  return b.root;
}
```