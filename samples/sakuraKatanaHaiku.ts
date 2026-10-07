import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { mottle, paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Sakura Katana and Saya on Lacquered Stand",
  description:
    "A katana and its cherry-blossom saya resting on an indigo lacquered katana rack: a sakura tsuba, a teal ito wrap, gold fittings and tassel, an edge of cyan light and a glowing rune on the base.",
  style: "Genshin/anime mix",
  commit: "b816db2",
};

type V3 = [number, number, number];
const v = (x: number, y: number, z: number): V3 => [x, y, z];

// ---- layout, metres. Model faces +Z; the katana lies flat, its edge toward +Z.
const Z_H = -0.03; // straight centre line of blade, tang, tsuka and tsuba
const X_S = 0.02; // the sori (curve) starts here and runs to the tip
const X_T = -0.525; // blade tip
const SORI = 0.03; // how far the tip curves toward the edge side
const BLADE_Y = 0.415; // centre height of blade and tsuka
const HALF_E = 0.0155; // half width, edge side
const HALF_M = 0.0145; // half width, mune (spine) side
const SHEATH_Y = 0.2145; // centre height of the saya
const TOP_Y = 0.056; // top of the stand's gold frame

const zc = (x: number) => (x >= X_S ? Z_H : Z_H + SORI * ((X_S - x) / (X_S - X_T)) ** 2);
const tipU = (x: number) => Math.min(1, Math.max(0, (-0.4 - x) / 0.125));
const hwE = (x: number) => HALF_E * (1 - tipU(x) ** 1.6);
const sheathZ = (x: number) => zc(x) + 0.17;
const sheathR = (t: number): [number, number] => [0.0175 * (1 - 0.22 * t ** 3), 0.0125 * (1 - 0.18 * t ** 3)];

// ---- palette: cel tones; shadows hue-shifted toward blue
const LAC = cel("#2d3f93", "#1c2768");
const LAC_DEEP = cel("#1e2b70", "#131c4c");
const GOLD = cel("#ffd766", "#c98a2e");
const GOLD_DEEP = cel("#f2b24c", "#a8612a");
const TEAL = cel("#38dcd0", "#1b8f98");
const SHEATH = cel(mottle("#ffc9dc", "#f7a7c4", { size: 0.05, contrast: 0.5, seed: 4 }), "#e98aae");
const ITO = cel(
  paint((p, _n, s) => ((((p.x * 45 + s[1] / 90) % 1) + 1) % 1 < 0.42 ? "#41e6d8" : "#14a3a8")),
  "#127d86",
);
const BLADE = cel(
  paint((p, n) => {
    if (n.y < 0.5) return "#9fb3cc";
    const dz = p.z - zc(p.x);
    const hamon = hwE(p.x) * 0.55 + 0.0009 * Math.sin(p.x * 150);
    if (Math.abs(dz - hamon) < 0.0011) return "#fbfdff";
    if (Math.abs(dz + HALF_M * 0.35) < 0.0006) return "#8fa2bd";
    return "#d6e2ef";
  }),
  "#7d92b1",
);
const TSUBA = cel(
  paint((_p, _n, s) => {
    const d = Math.hypot(s[0], s[1]);
    if (d < 0.02) return "#ff9cc0";
    if (d < 0.0225) return "#fff0a0";
    return "#ffd24f";
  }),
  "#b87a24",
);
const EDGE_GLOW = "#7ff8ff";
// lacquer panel: rings of two indigo tones fanning out from the rune
const PANEL = cel(
  paint((p, n) => {
    if (n.y < 0.5) return "#2b3d92";
    const d = Math.hypot(p.x + 0.05, p.z - 0.06);
    return Math.floor(d / 0.045) % 2 === 0 ? "#22327c" : "#34489e";
  }),
  "#18225a",
);

// ---- textures
const FILIGREE = (() => {
  let d = "";
  let dots = "";
  for (let i = 0; i < 10; i++) {
    const x = i * 40;
    d += `M${x} 20 Q${x + 10} 10 ${x + 20} 20 Q${x + 30} 30 ${x + 40} 20 `;
    d += `M${x + 20} 20 C${x + 20} 8 ${x + 32} 6 ${x + 33} 13 C${x + 34} 18 ${x + 28} 19 ${x + 27} 15 `;
    dots += `<circle cx="${x + 10}" cy="12" r="2.2"/><circle cx="${x + 30}" cy="28" r="2.2"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 40"><path d="${d}" fill="none" stroke="#ffd766" stroke-width="2.6" stroke-linecap="round"/><g fill="#ffd766">${dots}</g></svg>`,
    { size: 1024 },
  );
})();
const PETAL = (() => {
  const petals = [0, 1, 2, 3, 4]
    .map(
      (k) =>
        `<path d="M32 32 C20 25 19 8 32 4 C45 8 44 25 32 32Z" fill="#ffd3e1" stroke="#f284ab" stroke-width="2" transform="rotate(${k * 72} 32 32)"/>`,
    )
    .join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${petals}<circle cx="32" cy="32" r="4.5" fill="#ffe27a"/></svg>`,
    { size: 128 },
  );
})();
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g fill="none" stroke="#7ff8ff"><circle cx="128" cy="128" r="112" stroke-width="7"/><circle cx="128" cy="128" r="94" stroke-width="3" stroke-dasharray="9 7"/><polygon points="128,44 186,144 70,144" stroke-width="4"/><polygon points="128,212 70,112 186,112" stroke-width="4"/><circle cx="128" cy="128" r="18" stroke-width="3"/></g><g fill="#7ff8ff">${Array.from({ length: 12 }, (_, k) => `<path d="M128 22 l5 10 h-10z" transform="rotate(${k * 30} 128 128)"/>`).join("")}</g></svg>`,
  { size: 512 },
);

// Five-lobed sakura outline: r0 at the notches, r1 more at the petal tips, n points.
const fiveLobe = (r0: number, r1: number, n: number): OutlinePoint[] => {
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = r0 + r1 * Math.abs(Math.cos(2.5 * a)) ** 0.9;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
};

export default function build() {
  const b = createBuilder({ name: "sakuraKatanaHaiku", paintSize: 2048 });
  b.joint("stand", { at: [0, 0, 0] });

  // ---- closed loop of the saya's cross-section at x, grown by `grow`
  const ringAt = (x: number, grow: number) => {
    const r = sheathR((0.245 - x) / 0.76);
    const pts: V3[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push(v(x, SHEATH_Y + (r[1] + grow) * Math.sin(a), sheathZ(x) + (r[0] + grow) * Math.cos(a)));
    }
    return catmull(pts, { closed: true });
  };

  // ---- stand: indigo lacquer plinth with a gold frame, a ripple-patterned panel and a rune
  const roundRect = (hx: number, hz: number, r: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [];
    const corners: [number, number, number][] = [
      [hx - r, hz - r, 0],
      [r - hx, hz - r, 90],
      [r - hx, r - hz, 180],
      [hx - r, r - hz, 270],
    ];
    for (const [cx, cz, a0] of corners) {
      for (let k = 0; k <= 3; k++) {
        const a = ((a0 + k * 30) * Math.PI) / 180;
        pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
      }
    }
    return pts;
  };
  b.extrude(roundRect(0.66, 0.23, 0.05), {
    at: [0, 0.025, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.05,
    bevel: 0.012,
    color: inkLines(LAC_DEEP, { levels: [0.45], axis: [0, 1, 0], width: 0.05 }),
  });
  b.extrude(roundRect(0.655, 0.225, 0.045), {
    at: [0, 0.053, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.006,
    bevel: 0.002,
    color: GOLD,
  });
  b.extrude(roundRect(0.625, 0.195, 0.03), {
    at: [0, 0.058, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.004,
    bevel: 0.0015,
    color: PANEL,
  });
  // gold studs on the frame, two per edge segment of a rounded rectangle
  const studRing = roundRect(0.638, 0.208, 0.03);
  for (let i = 0; i < studRing.length; i++) {
    const [ax, az] = studRing[i];
    const [bx, bz] = studRing[(i + 1) % studRing.length];
    for (const u of [0, 0.5]) {
      b.part(new THREE.SphereGeometry(0.0055, 6, 4), GOLD, {
        at: v(ax + (bx - ax) * u, 0.0565, az + (bz - az) * u),
      });
    }
  }
  // filigree frieze on the front and back faces
  b.part(new THREE.PlaneGeometry(1.1, 0.03), "#ffffff", { at: [0, 0.028, 0.2315], texture: FILIGREE });
  b.part(new THREE.PlaneGeometry(1.1, 0.03), "#ffffff", {
    at: [0, 0.028, -0.2315],
    rotation: [0, 180, 0],
    texture: FILIGREE,
  });
  // glowing rune on the panel
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      at: [-0.05, 0.0605, 0.06],
      rotation: [-90, 0, 0],
      texture: RUNE,
    }),
    1.4,
  );

  // ---- turned posts, gold collars and cradle rods
  const post = (x: number, z: number, y1: number) => {
    const h = y1 - TOP_Y;
    const at = (f: number) => TOP_Y + h * f;
    b.lathe(
      [
        [0, TOP_Y],
        [0.04, TOP_Y],
        [0.04, at(0.035)],
        [0.027, at(0.07)],
        [0.02, at(0.11)],
        [0.02, at(0.78)],
        [0.03, at(0.82)],
        [0.03, at(0.84)],
        [0.02, at(0.86)],
        [0.02, at(0.93)],
        [0.036, at(0.96)],
        [0.036, y1],
        [0, y1],
      ],
      { at: [x, 0, z], segments: 8, color: LAC },
    );
    b.lathe(
      [
        [0, at(0.83)],
        [0.033, at(0.83)],
        [0.033, at(0.87)],
        [0, at(0.87)],
      ],
      { at: [x, 0, z], segments: 8, color: GOLD },
    );
  };
  const rod = (x: number, y: number, z: number) => {
    b.rod([x, y, z - 0.065], [x, y, z + 0.065], 0.013, { color: LAC });
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.015, 8, 6), GOLD, { at: [x, y, z + s * 0.065] });
  };
  post(-0.3, -0.03, 0.39);
  post(0.12, -0.03, 0.39);
  post(-0.36, 0.15, 0.18);
  post(0.16, 0.15, 0.18);
  rod(-0.3, 0.4, -0.03);
  rod(0.12, 0.4, -0.03);
  rod(-0.36, 0.19, 0.15);
  rod(0.16, 0.19, 0.15);
  b.part(new THREE.BoxGeometry(0.44, 0.028, 0.05), LAC, { at: [-0.09, 0.25, -0.03], flat: true });
  b.part(new THREE.BoxGeometry(0.52, 0.024, 0.05), LAC, { at: [-0.1, 0.11, 0.15], flat: true });

  // ---- katana: blade, hamon, glowing edge, habaki, tsuba, tsuka, fittings
  const BLADE_X = [0.24, 0.12, 0.0, -0.12, -0.24, -0.34, -0.4, -0.44, -0.47, -0.495, -0.51];
  const bladeOutline: OutlinePoint[] = [];
  for (const x of BLADE_X) bladeOutline.push([x, zc(x) - HALF_M * (1 - tipU(x) ** 2.5)]);
  bladeOutline.push([X_T, zc(X_T), "sharp"]);
  for (const x of [...BLADE_X].reverse()) bladeOutline.push([x, zc(x) + hwE(x)]);
  b.extrude(bladeOutline, {
    at: [0, BLADE_Y, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.007,
    bevel: 0.002,
    color: BLADE,
  });

  // cyan light running along the edge
  const edge: V3[] = [];
  for (let x = 0.2; x >= -0.44; x -= 0.02) edge.push(v(x, BLADE_Y, zc(x) + hwE(x)));
  glow(b.sweep(catmull(edge), [0.0011, 0.0016], { color: EDGE_GLOW, sides: 6 }), 1.6);

  b.part(new THREE.BoxGeometry(0.026, 0.02, 0.05), GOLD_DEEP, { at: [0.2485, BLADE_Y, Z_H], flat: true });

  const tsubaOutline = fiveLobe(0.029, 0.0085, 60);
  b.extrude(tsubaOutline, {
    at: [0.2668, BLADE_Y, Z_H],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.007,
    bevel: 0.0018,
    color: TSUBA,
  });

  // tsuka: teal ito wrap, fuchi collar, kashira cap with a glowing jewel, two menuki
  b.sweep(
    [
      v(0.27, BLADE_Y, Z_H),
      v(0.508, BLADE_Y, Z_H),
    ],
    [0.016, 0.0135],
    { color: ITO, sides: 10, caps: "flat" },
  );
  b.lathe(
    [
      [0, -0.011],
      [0.024, -0.011],
      [0.024, 0.011],
      [0, 0.011],
    ],
    { at: [0.282, BLADE_Y, Z_H], axis: [1, 0, 0], segments: 8, color: GOLD },
  );
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.021, 0.004],
      [0.018, 0.012],
      [0.012, 0.02],
      [0, 0.023],
    ],
    { at: [0.508, BLADE_Y, Z_H], axis: [1, 0, 0], segments: 8, color: GOLD },
  );
  glow(b.part(new THREE.SphereGeometry(0.0065, 8, 6), EDGE_GLOW, { at: [0.5305, BLADE_Y, Z_H] }), 2);
  for (const x of [0.36, 0.43]) {
    b.extrude(fiveLobe(0.005, 0.0045, 36), {
      at: [x, BLADE_Y + 0.0135 + 0.0018, Z_H],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.005,
      bevel: 0.0012,
      color: GOLD,
    });
  }

  // ---- saya: lacquered sheath with gold bands, a koiguchi and scattered petals
  const SHEATH_X = [0.245, 0.2, 0.1, 0.0, -0.1, -0.2, -0.3, -0.4, -0.46, -0.5, -0.515];
  const sheathPath: V3[] = SHEATH_X.map((x) => v(x, SHEATH_Y, sheathZ(x)));
  const sheath = b.sweep(catmull(sheathPath), (t: number) => sheathR(t), {
    caps: { start: "flat", end: "round" },
    sides: 10,
    color: SHEATH,
  });
  for (const x of [-0.44, -0.24, -0.04, 0.14]) b.sweep(ringAt(x, 0.0012), 0.0024, { color: GOLD, sides: 6 });
  b.sweep(ringAt(0.243, 0.0022), 0.0035, { color: GOLD_DEEP, sides: 6 });
  // sageo: teal silk wound round the koiguchi
  for (const x of [0.2, 0.186, 0.172]) b.sweep(ringAt(x, 0.0016), 0.0021, { color: TEAL, sides: 6 });

  const petalHits = b.surface(sheath).scatter(42, {
    rng: rng(5),
    minDist: 0.07,
    filter: (h) => h.n.y > -0.5,
  });
  b.cards(petalHits, PETAL, { size: 0.036, lean: 70, vary: 0.25, spin: 60, rng: rng(6) });

  // tassel knotted at the koiguchi
  b.part(new THREE.SphereGeometry(0.008, 8, 6), GOLD, { at: [0.238, SHEATH_Y, 0.158] });
  b.sweep(
    catmull([v(0.238, SHEATH_Y, 0.158), v(0.237, 0.18, 0.165), v(0.236, 0.152, 0.17)]),
    0.0021,
    { color: TEAL, sides: 6 },
  );
  const TX = 0.236;
  const TZ = 0.17;
  b.lathe(
    [
      [0, 0.09],
      [0.011, 0.09],
      [0.016, 0.102],
      [0.017, 0.12],
      [0.013, 0.138],
      [0.007, 0.149],
      [0, 0.15],
    ],
    { at: [TX, 0, TZ], segments: 8, color: GOLD },
  );
  b.lathe(
    [
      [0, 0.148],
      [0.0115, 0.148],
      [0.0115, 0.158],
      [0.005, 0.162],
      [0, 0.162],
    ],
    { at: [TX, 0, TZ], segments: 8, color: GOLD },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.sweep(
      catmull([
        v(TX + 0.012 * Math.cos(a), 0.09, TZ + 0.012 * Math.sin(a)),
        v(TX + 0.018 * Math.cos(a), 0.075, TZ + 0.018 * Math.sin(a)),
        v(TX + 0.022 * Math.cos(a), 0.064, TZ + 0.022 * Math.sin(a)),
      ]),
      0.0017,
      { color: TEAL, sides: 5 },
    );
  }

  // petals fallen on the plinth
  const basePetals: [number, number, number][] = [
    [-0.56, 0.12, 0.4],
    [-0.47, -0.12, 1.9],
    [-0.22, 0.2, 0.7],
    [0.36, 0.1, 2.6],
    [0.5, -0.12, 0.2],
    [0.6, 0.03, 1.2],
    [-0.6, -0.1, 2.2],
    [0.3, -0.17, 0.9],
    [0.44, 0.18, 2.9],
    [-0.12, -0.19, 1.5],
    [0.04, 0.2, 2.1],
    [-0.44, 0.2, 0.9],
    [0.62, -0.17, 1.7],
    [-0.62, 0.16, 0.3],
    [0.25, -0.205, 2.4],
    [0.52, 0.19, 2.0],
    [-0.24, -0.2, 1.1],
    [0.08, -0.1, 0.5],
  ];
  b.cards(
    basePetals.map(([x, z]) => frame(v(x, 0.0605, z), [0, 1, 0])),
    PETAL,
    {
      size: 0.03,
      lean: 90,
      flow: (_f, i) => [Math.cos(basePetals[i][2]), 0, Math.sin(basePetals[i][2])],
      mirror: true,
    },
  );

  return b.root;
}
