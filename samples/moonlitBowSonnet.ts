import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { cells, grain, mottle, paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel } from "../kits/toon";

export const meta = {
  name: "Moonlit Elven Longbow",
  description:
    "A silverwood elven longbow on a moon-phase plinth: gold-vine limbs with glowing runes, a moonstone riser, silk ribbons and tassel, one nocked moonsilver arrow, and a navy crescent halo with star charms.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour is a two-tone cel paint, glow colours stay flat
const FACE = cel(grain("#f4f6ff", "#e1e7fc", { size: 0.012, axis: "y", seed: 2 }), "#9aa6e4");
const BACK = cel("#3a4ca6", "#222d78");
const BELLY = cel("#e3e7ff", "#a3aee6");
const GOLD = cel("#ffd873", "#d98b32");
const GOLD_D = cel("#e9b04a", "#b9651f");
const NAVY = cel("#262d78", "#141847");
const NAVY_B = cel("#2f3a8f", "#1a2058");
const LAV = cel("#bba9ff", "#7e6fd9");
const PEARL = cel("#f7f4ff", "#b6b4ee");
const TEAL = cel("#3bb8ac", "#24788f");
const TEAL_D = cel("#277f86", "#1b4d6a");
const LEAF = cel("#a4e6c8", "#4fa9a6");
const LEAF_B = cel("#7fd6c1", "#3a8f9e");
const STEM = cel("#5bbf9f", "#2f8394");
const STONE = cel(
  mottle("#6f7bc0", "#5d69ab", { size: 0.1, seed: 5 }),
  mottle("#46529a", "#3a4584", { size: 0.1, seed: 5 }),
);
const STONE_CARVED = cel("#3c4789", "#252d63");
const STONE_LIGHT = cel("#8791d6", "#5560ad");
const RUNE_GLOW = "#aef4ff";
const STAR_GLOW = "#fff0b0";
const ARROW_WOOD = cel("#f1ecdc", "#b9b2d6");

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 200">
  <path d="M20 4 C6 24 34 44 20 64 S6 104 20 124 S34 164 20 196" fill="none" stroke="#18bfff" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M20 34 q10 -10 17 -3 q-8 10 -17 3z M20 94 q-10 -10 -17 -3 q8 10 17 3z M20 154 q10 -10 17 -3 q-8 10 -17 3z" fill="#4fd8ff"/>
  <path d="M20 64 q-10 -8 -16 -2 q7 9 16 2z M20 124 q10 -8 16 -2 q-7 9 -16 2z" fill="#18bfff"/>
  <circle cx="20" cy="64" r="3.6" fill="#ffffff"/><circle cx="20" cy="124" r="3.6" fill="#ffffff"/>
  <circle cx="20" cy="9" r="3" fill="#ffffff"/><circle cx="20" cy="191" r="3" fill="#ffffff"/>
  <path d="M8 96 l4 4 l-4 4 l-4 -4z M32 156 l4 4 l-4 4 l-4 -4z M32 36 l4 4 l-4 4 l-4 -4z" fill="#ffffff"/>
</svg>`,
  { size: 400 },
);

const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 170">
  <path d="M25 4 C22 30 28 50 25 85 S22 140 25 166" fill="none" stroke="#ffd873" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M25 30 C42 24 48 44 36 50 C28 53 27 44 33 43" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M25 52 C8 46 2 66 14 72 C22 75 23 66 17 65" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M25 96 C42 90 48 110 36 116 C28 119 27 110 33 109" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M25 118 C8 112 2 132 14 138 C22 141 23 132 17 131" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="25" cy="85" r="5" fill="#ffd873"/><circle cx="25" cy="12" r="3.4" fill="#ffd873"/><circle cx="25" cy="158" r="3.4" fill="#ffd873"/>
  <circle cx="44" cy="76" r="2.2" fill="#ffd873"/><circle cx="6" cy="30" r="2.2" fill="#ffd873"/><circle cx="6" cy="150" r="2.2" fill="#ffd873"/><circle cx="44" cy="136" r="2.2" fill="#ffd873"/>
</svg>`,
  { size: 340 },
);

const TASSEL_STRANDS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <g fill="none" stroke-width="3.4" stroke-linecap="round">
    <path d="M30 118 L8 8" stroke="#cdbdff"/><path d="M30 118 L16 4" stroke="#f4f0ff"/><path d="M30 118 L24 2" stroke="#bba9ff"/>
    <path d="M30 118 L30 0" stroke="#f4f0ff"/><path d="M30 118 L36 2" stroke="#cdbdff"/><path d="M30 118 L44 4" stroke="#bba9ff"/>
    <path d="M30 118 L52 8" stroke="#f4f0ff"/>
  </g>
  <g fill="#aef4ff"><circle cx="8" cy="8" r="3.2"/><circle cx="24" cy="3.6" r="3.2"/><circle cx="36" cy="3.6" r="3.2"/><circle cx="52" cy="8" r="3.2"/><circle cx="30" cy="2.4" r="3.2"/></g>
</svg>`,
  { size: 240 },
);

const MOON_DISC = (() => {
  const dx = [0, -5, -9, -14, 99, 14, 9, 5];
  let phases = "";
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
    const cx = 100 + 74 * Math.cos(a);
    const cy = 100 + 74 * Math.sin(a);
    phases += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="10" fill="#f6f2ff"/>`;
    if (dx[k] !== 99)
      phases += `<circle cx="${(cx + dx[k]).toFixed(1)}" cy="${cy.toFixed(1)}" r="10" fill="#1c2262"/>`;
    phases += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="11.5" fill="none" stroke="#ffd873" stroke-width="1.6"/>`;
  }
  let rays = "";
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const r0 = 18;
    const r1 = k % 2 ? 36 : 46;
    rays += `<path d="M${(100 + r0 * Math.cos(a)).toFixed(1)} ${(100 + r0 * Math.sin(a)).toFixed(1)} L${(100 + r1 * Math.cos(a)).toFixed(1)} ${(100 + r1 * Math.sin(a)).toFixed(1)}" stroke="#ffd873" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="100" fill="#1c2262"/>
  <circle cx="100" cy="100" r="96" fill="none" stroke="#ffd873" stroke-width="3"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="#5a69c8" stroke-width="1.5"/>
  <circle cx="100" cy="100" r="54" fill="none" stroke="#ffd873" stroke-width="2"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="#5a69c8" stroke-width="1.2" stroke-dasharray="3 3"/>
  ${phases}${rays}
  <circle cx="100" cy="100" r="15" fill="#f6f2ff"/><circle cx="106" cy="97" r="13" fill="#1c2262"/>
  <path d="M100 6 l2.4 6 l-2.4 -1.6 l-2.4 1.6z M100 194 l2.4 -6 l-2.4 1.6 l-2.4 -1.6z M6 100 l6 2.4 l-1.6 -2.4 l1.6 -2.4z M194 100 l-6 2.4 l1.6 -2.4 l-1.6 -2.4z" fill="#ffd873"/>
</svg>`,
    { size: 640 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------
// Bow layout (bow plane is XY; the archer's side, with the string, is -X; the target side is +X)
const OX = -0.042; // puts the lower tip on x = 0, over the stand's cup
const Y0 = 1.12; // grip height
const K = 0.92; // half-length scale
const HALF: [number, number][] = [
  [0, 0.27],
  [0.12, 0.268],
  [0.3, 0.248],
  [0.48, 0.205],
  [0.64, 0.148],
  [0.76, 0.092],
  [0.85, 0.045],
  [0.915, 0.02],
  [0.96, 0.028],
  [1.0, 0.042],
];
const RX: [number, number][] = [
  [0, 0.036],
  [0.2, 0.033],
  [0.5, 0.027],
  [0.8, 0.019],
  [1, 0.012],
];
const RY: [number, number][] = [
  [0, 0.04],
  [0.2, 0.037],
  [0.5, 0.03],
  [0.8, 0.021],
  [1, 0.0135],
];

function tab(u: number, table: [number, number][]) {
  const x = Math.min(Math.max(u, 0), 1);
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][0]) {
      const [a, ra] = table[i - 1];
      const [c, rc] = table[i];
      const f = (x - a) / (c - a);
      const s = f * f * (3 - 2 * f);
      return ra + (rc - ra) * (f * 0.5 + s * 0.5);
    }
  }
  return table[table.length - 1][1];
}
const rxAt = (y: number) => tab(Math.abs(y - Y0) / K, RX);
const ryAt = (y: number) => tab(Math.abs(y - Y0) / K, RY);

// the two fittings above and below the grip swell by this much
const FIT_NEAR = 0.075;
const FIT_FAR = 0.24;
const fitExtra = (y: number) => {
  const d = Math.abs(y - Y0);
  if (d < FIT_NEAR || d > FIT_FAR) return 0;
  return 0.01 * Math.pow(1 - (d - FIT_NEAR) / (FIT_FAR - FIT_NEAR), 1.25) + 0.003;
};

function crescentOutline(R1: number, R2: number, d: number, n = 20): OutlinePoint[] {
  const xi = (R2 * R2 - R1 * R1 - d * d) / (2 * d);
  const yi = Math.sqrt(R1 * R1 - xi * xi);
  const th = Math.atan2(yi, xi);
  const ph = Math.atan2(yi, xi + d);
  const out: OutlinePoint[] = [];
  for (let i = 0; i <= n; i++) {
    const a = th + ((-th - th) * i) / n;
    const edge = i === 0 || i === n;
    out.push([R1 * Math.cos(a), R1 * Math.sin(a), ...(edge ? (["sharp"] as const) : [])] as OutlinePoint);
  }
  for (let i = 0; i <= n; i++) {
    const a = -ph + ((ph + ph) * i) / n;
    if (i === 0 || i === n) continue;
    out.push([-d + R2 * Math.cos(a), R2 * Math.sin(a)]);
  }
  return out;
}

function starOutline(R: number, r: number, points = 4): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const rr = i % 2 ? r : R;
    out.push([rr * Math.cos(a), rr * Math.sin(a), "sharp"]);
  }
  return out;
}

const LEAF_OUT: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.012, 0.008],
  [0.03, 0.0075],
  [0.048, 0, "sharp"],
  [0.03, -0.0075],
  [0.012, -0.008],
];

export default function build() {
  const b = createBuilder({ name: "moonlitElvenLongbow", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const rand = rng(11);

  type Col = Parameters<typeof b.part>[1];
  const P = (g: THREE.BufferGeometry, color: Col, o: NonNullable<Parameters<typeof b.part>[2]> = {}) =>
    b.part(g, color, { bone: root, ...o });

  // --- bow centreline ------------------------------------------------------------------------------------------
  const pts: number[][] = [];
  for (let i = HALF.length - 1; i >= 1; i--) pts.push([HALF[i][1] + OX, Y0 - K * HALF[i][0], 0]);
  for (let i = 0; i < HALF.length; i++) pts.push([HALF[i][1] + OX, Y0 + K * HALF[i][0], 0]);
  const bowPath = catmull(pts);

  const tCache = new Map<number, number>();
  function tAtY(y: number) {
    const key = Math.round(y * 10000);
    const hit = tCache.get(key);
    if (hit !== undefined) return hit;
    let best = 0;
    let bd = 1e9;
    for (let i = 0; i <= 900; i++) {
      const t = i / 900;
      const d = Math.abs(bowPath.at(t).y - y);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    tCache.set(key, best);
    return best;
  }
  function limbAt(y: number) {
    const t = tAtY(y);
    const p = bowPath.at(t);
    const T = bowPath.tangentAt(t).clone().normalize();
    const B = new THREE.Vector3(T.y, -T.x, 0).normalize();
    return { t, p, T, B, rx: rxAt(p.y), ry: ryAt(p.y) };
  }
  const radiusAtT = (t: number): [number, number] => {
    const y = bowPath.at(t).y;
    return [rxAt(y), ryAt(y)];
  };

  // gold collar ring round the limb at height y
  function ringAt(y: number, add: number, h: number, color: Col = GOLD) {
    const L = limbAt(y);
    const e = fitExtra(y);
    return P(new THREE.CylinderGeometry(1, 1, h, 12), color, {
      at: [L.p.x, L.p.y, L.p.z],
      dir: [L.T.x, L.T.y, L.T.z],
      up: [0, 0, 1],
      scale: [L.rx + e + add, 1, L.ry + e + add],
    });
  }

  // --- the bow --------------------------------------------------------------------------------------------------
  const bowPaint = paint((_p, n) => {
    const ax = Math.abs(n.x);
    if (ax > 0.7 && ax < 0.8) return GOLD;
    if (n.x >= 0.8) return BACK;
    if (n.x <= -0.8) return BELLY;
    return FACE;
  });
  const limbs = b.sweep(bowPath, radiusAtT, { bone: root, up: [0, 0, 1], sides: 10, color: bowPaint, name: "limbs" });

  // gilded tip sleeves
  const tLo = tAtY(Y0 - K * 0.93);
  const tHi = tAtY(Y0 + K * 0.93);
  for (const [from, to] of [
    [0, tLo],
    [tHi, 1],
  ] as const) {
    b.sweep(bowPath, (t) => [radiusAtT(t)[0] + 0.004, radiusAtT(t)[1] + 0.004], {
      bone: root,
      up: [0, 0, 1],
      from,
      to,
      sides: 10,
      color: GOLD,
      name: "tipSleeve",
    });
  }
  for (const s of [-1, 1]) {
    const nock = limbAt(Y0 + s * K * 0.915);
    ringAt(Y0 + s * K * 0.915, 0.006, 0.016, GOLD_D);
    ringAt(Y0 + s * K * 0.915 + s * 0.025, 0.0045, 0.008, GOLD);
    ringAt(Y0 + s * K * 0.915 - s * 0.025, 0.0045, 0.008, GOLD);
    void nock;
  }
  // moonstone bead on the upper tip
  {
    const tip = bowPath.at(1);
    glow(P(new THREE.SphereGeometry(0.012, 8, 6), "#d9fbff", { at: [tip.x, tip.y + 0.004, 0] }), 1.4);
  }
  // gilded leaf wings flaring from each tip sleeve
  for (const s of [1, -1]) {
    const L = limbAt(Y0 + s * K * 0.84);
    for (const f of [1, -1]) {
      b.extrude(
        [
          [0, 0, "sharp"],
          [0.015, 0.016],
          [0.04, 0.023],
          [0.075, 0.016],
          [0.108, 0.002, "sharp"],
          [0.05, 0.005],
        ],
        {
          at: [L.p.x, L.p.y, f * (L.ry + 0.003)],
          x: [L.T.x * s, L.T.y * s, 0],
          y: [0, 0, f],
          thickness: 0.006,
          bevel: 0.0015,
          smoothing: 1,
          color: GOLD,
          bone: root,
          name: "tipWing",
        },
      );
    }
  }

  // --- fittings (navy, gold-filigreed) above and below the grip -------------------------------------------------
  const fit = (s: 1 | -1) => {
    const ya = Y0 + s * FIT_NEAR;
    const yb = Y0 + s * FIT_FAR;
    const ta = tAtY(ya);
    const tb = tAtY(yb);
    return b.sweep(bowPath, (t) => {
      const y = bowPath.at(t).y;
      const e = fitExtra(y);
      const [rx, ry] = radiusAtT(t);
      return [rx + e + 0.003, ry + e * 0.95 + 0.003];
    }, {
      bone: root,
      up: [0, 0, 1],
      sides: 10,
      from: Math.min(ta, tb),
      to: Math.max(ta, tb),
      color: NAVY,
      caps: s > 0 ? { start: "flat", end: "round" } : { start: "round", end: "flat" },
      name: s > 0 ? "fittingUpper" : "fittingLower",
    });
  };
  const fitU = fit(1);
  const fitL = fit(-1);
  for (const s of [1, -1] as const) {
    ringAt(Y0 + s * (FIT_NEAR + 0.002), 0.006, 0.012, GOLD);
    ringAt(Y0 + s * (FIT_NEAR + 0.032), 0.002, 0.006, GOLD_D);
    ringAt(Y0 + s * (FIT_FAR - 0.004), 0.007, 0.012, GOLD);
  }
  // filigree decals on both faces of both fittings
  for (const [target, s] of [
    [fitU, 1],
    [fitL, -1],
  ] as const) {
    const yc = Y0 + s * 0.16;
    const L = limbAt(yc);
    for (const f of [1, -1]) {
      b.decal(target, FILIGREE, {
        at: [L.p.x, yc, f * 0.04],
        dir: [0, 0, f],
        up: [L.T.x * s, L.T.y * s, 0],
        size: [0.056, 0.15],
        segments: 14,
        bone: root,
        name: "filigree",
      });
    }
  }
  // gold rail lines running down both fittings
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (const s of [1, -1]) {
    for (const phi of [38, 142, -38, -142]) {
      const rail: number[][] = [];
      for (let i = 0; i <= 10; i++) {
        const y = Y0 + s * (FIT_NEAR + 0.006 + ((FIT_FAR - FIT_NEAR - 0.014) * i) / 10);
        const L = limbAt(y);
        const e = fitExtra(y) + 0.003;
        const a = (phi * Math.PI) / 180;
        const q = L.p
          .clone()
          .addScaledVector(L.B, Math.cos(a) * (L.rx + e + 0.0015))
          .addScaledVector(zAxis, Math.sin(a) * (L.ry + e * 0.95 + 0.0015));
        rail.push(q.toArray());
      }
      b.sweep(catmull(rail), 0.0022, { bone: root, sides: 4, color: GOLD, name: "fitRail" });
    }
  }

  // --- grip ------------------------------------------------------------------------------------------------------
  const GX = 0.27 + OX;
  const wrap = paint((p) => {
    const a = Math.atan2(p.z, p.x - GX);
    const v = (((p.y / 0.032 + a / (2 * Math.PI)) % 1) + 1) % 1;
    return v < 0.2 ? GOLD : v < 0.6 ? TEAL : TEAL_D;
  });
  {
    const ta = tAtY(Y0 - 0.092);
    const tb = tAtY(Y0 + 0.08);
    b.sweep(bowPath, (t) => [radiusAtT(t)[0] + 0.007, radiusAtT(t)[1] + 0.006], {
      bone: root,
      up: [0, 0, 1],
      sides: 12,
      from: ta,
      to: tb,
      color: wrap,
      caps: "flat",
      name: "gripWrap",
    });
  }

  // moonstone bezels on the upper fitting, both faces
  for (const f of [1, -1]) {
    const yc = Y0 + 0.185;
    const L = limbAt(yc);
    const hit = b.surface(fitU).ray([L.p.x, yc, f * 1.0], [0, 0, -f]);
    if (hit) {
      b.stick(new THREE.CylinderGeometry(0.019, 0.023, 0.01, 8), GOLD, hit, { embed: 0.3, bone: root });
      glow(b.stick(new THREE.SphereGeometry(0.0145, 8, 6), "#e6fdff", hit.moved([0, 0.006, 0]), { embed: 0.2, bone: root }), 1.5);
    }
  }
  // gold crescent inlay on the lower fitting
  for (const f of [1, -1]) {
    const yc = Y0 - 0.185;
    const L = limbAt(yc);
    const hit = b.surface(fitL).ray([L.p.x, yc, f * 1.0], [0, 0, -f]);
    if (hit) {
      b.extrude(crescentOutline(0.02, 0.02, 0.011, 8), {
        at: [hit.at.x, hit.at.y, hit.at.z + f * 0.001],
        x: [f, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: GOLD,
        bone: root,
        name: "lowerCrescent",
      });
    }
  }
  // winged guard on the lower fitting
  for (const f of [1, -1]) {
    const L = limbAt(Y0 - 0.1);
    b.extrude(
      [
        [0, 0],
        [0.03, 0.004],
        [0.07, 0.03],
        [0.088, 0.078, "sharp"],
        [0.052, 0.052],
        [0.022, 0.036],
        [0, 0.032],
      ],
      {
        at: [L.p.x, Y0 - 0.1, f * 0.004],
        x: [0, 0, f],
        y: [0, 1, 0],
        thickness: 0.009,
        bevel: 0.0025,
        smoothing: 1,
        color: GOLD,
        bone: root,
        name: "guardWing",
      },
    );
  }

  // --- arrow rest + string + arrow ------------------------------------------------------------------------------
  const nockL = limbAt(Y0 - K * 0.915);
  const xs = nockL.p.x - nockL.rx - 0.001; // the string sits on the belly face of the nocks
  const stringTop = Y0 + K * 0.915;
  const stringBot = Y0 - K * 0.915;
  glow(
    b.sweep(polyline([[xs, stringBot, 0], [xs, stringTop, 0]]), 0.0042, {
      bone: root,
      sides: 6,
      color: "#e4fbff",
      caps: "flat",
      name: "string",
    }),
    0.9,
  );
  b.sweep(polyline([[xs, Y0 + 0.04, 0], [xs, Y0 + 0.17, 0]]), 0.0068, { bone: root, sides: 8, color: TEAL, caps: "flat", name: "serving" });
  for (const dy of [0.035, 0.175]) P(new THREE.SphereGeometry(0.0085, 8, 6), GOLD, { at: [xs, Y0 + dy, 0] });
  // string loops over the nocks
  for (const y of [stringBot, stringTop]) P(new THREE.TorusGeometry(0.0075, 0.0025, 5, 8), PEARL, { at: [xs, y, 0], dir: [1, 0, 0], axis: "z" });

  const yA = Y0 + 0.108;
  const xr = limbAt(yA).p.x;
  const zR = limbAt(yA).ry + fitExtra(yA) * 0.95 + 0.003 + 0.0075;
  const P0 = new THREE.Vector3(xs + 0.012, yA, 0.007);
  const ang = Math.atan2(zR - P0.z, xr - P0.x);
  const D = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
  const U = new THREE.Vector3(0, 1, 0);
  const W = new THREE.Vector3().crossVectors(D, U).normalize();
  const A = (s: number) => P0.clone().addScaledVector(D, s);
  const ARROW_L = 0.74;

  // arrow shelf
  P(new THREE.BoxGeometry(0.052, 0.006, 0.034), GOLD, { at: [xr, yA - 0.0125, zR - 0.004] });
  P(new THREE.BoxGeometry(0.052, 0.016, 0.006), GOLD_D, { at: [xr, yA - 0.006, zR + 0.015] });

  const shaftPaint = paint((p) => {
    const s = p.clone().sub(P0).dot(D);
    if ((s > 0.178 && s < 0.188) || (s > 0.232 && s < 0.242)) return GOLD;
    if (s > 0.188 && s < 0.232) return NAVY_B;
    if (s > 0.06 && s < 0.066) return TEAL;
    return ARROW_WOOD;
  });
  b.sweep(polyline([A(0.02), A(ARROW_L - 0.06)]), 0.0056, { bone: root, sides: 7, color: shaftPaint, caps: "flat", name: "shaft" });
  // nock
  P(new THREE.CylinderGeometry(0.0078, 0.0066, 0.028, 8), LAV, { at: A(0.012).toArray(), dir: D.toArray() });
  // fletching: three vanes
  const vane = paint((_p, _n, s) => (s[1] > 0.0145 ? TEAL : s[1] < 0.0075 ? LAV : PEARL));
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2;
    const R = U.clone().multiplyScalar(Math.cos(a)).addScaledVector(W, Math.sin(a));
    b.extrude(
      [
        [0, 0.004],
        [0.012, 0.021],
        [0.075, 0.023],
        [0.115, 0.016],
        [0.135, 0.004],
      ],
      {
        at: A(0.04).toArray(),
        x: D.toArray(),
        y: R.toArray(),
        thickness: 0.0016,
        smoothing: 1,
        color: vane,
        bone: root,
        name: "vane",
      },
    );
  }
  // head: socket, crossed blades, glowing fuller
  P(new THREE.CylinderGeometry(0.0085, 0.0058, 0.034, 8), GOLD, { at: A(ARROW_L - 0.07).toArray(), dir: D.toArray() });
  const blade: OutlinePoint[] = [
    [0, 0.005],
    [0.01, 0.0185],
    [0.034, 0.021],
    [0.058, 0.011],
    [0.078, 0, "sharp"],
    [0.058, -0.011],
    [0.034, -0.021],
    [0.01, -0.0185],
    [0, -0.005],
  ];
  const BLADE = cel("#f1f5ff", "#8d9bdc");
  for (const [yy, name] of [
    [U, "bladeA"],
    [W, "bladeB"],
  ] as const) {
    b.extrude(blade, { at: A(ARROW_L - 0.06).toArray(), x: D.toArray(), y: yy.toArray(), thickness: 0.0034, bevel: 0.001, smoothing: 1, color: BLADE, bone: root, name });
    glow(
      b.extrude(
        [
          [0.014, 0.0012],
          [0.04, 0.0032],
          [0.062, 0.0009],
          [0.04, -0.0032],
          [0.014, -0.0012],
        ],
        { at: A(ARROW_L - 0.06).toArray(), x: D.toArray(), y: yy.toArray(), thickness: 0.0042, color: RUNE_GLOW, bone: root, name: `${name}Fuller` },
      ),
      1.3,
    );
  }

  // --- runes and gold vines on the limbs ------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    for (const dy of [0.4, 0.57]) {
      const y = Y0 + s * dy;
      const L = limbAt(y);
      const w = Math.min(0.042, L.rx * 1.75);
      for (const f of [1, -1]) {
        glow(
          b.decal(limbs, RUNES, {
            at: [L.p.x, y, f * L.ry],
            dir: [0, 0, f],
            up: [L.T.x * s, L.T.y * s, 0],
            size: [w, w * 5],
            segments: 12,
            bone: root,
            name: "runes",
          }),
          1.2,
        );
      }
    }
  }
  const upZ = new THREE.Vector3(0, 0, 1);
  function vine(y0: number, y1: number, turns: number, n: number, phase: number) {
    const path: THREE.Vector3[] = [];
    const info: { pos: THREE.Vector3; o: THREE.Vector3; tan: THREE.Vector3 }[] = [];
    for (let i = 0; i <= n; i++) {
      const y = y0 + ((y1 - y0) * i) / n;
      const L = limbAt(y);
      const phi = phase + (turns * Math.PI * 2 * i) / n;
      const add = 0.0035;
      const o = L.B.clone().multiplyScalar(Math.cos(phi)).addScaledVector(upZ, Math.sin(phi));
      const pos = L.p.clone().addScaledVector(L.B, Math.cos(phi) * (L.rx + add)).addScaledVector(upZ, Math.sin(phi) * (L.ry + add));
      path.push(pos);
      info.push({ pos, o, tan: new THREE.Vector3() });
    }
    for (let i = 0; i <= n; i++) info[i].tan.copy(path[Math.min(i + 1, n)]).sub(path[Math.max(i - 1, 0)]).normalize();
    b.sweep(catmull(path), 0.0034, { bone: root, sides: 5, color: GOLD, caps: "round", name: "vine" });
    info.forEach((q, i) => {
      if (i % 3 !== 1) return;
      const side = (i / 3) % 2 ? 1 : -1;
      const x = q.tan.clone().applyAxisAngle(q.o, side * 0.7).normalize();
      const yv = new THREE.Vector3().crossVectors(q.o, x).normalize();
      b.extrude(LEAF_OUT, {
        at: q.pos.clone().addScaledVector(q.o, 0.001).toArray(),
        x: x.toArray(),
        y: yv.toArray(),
        thickness: 0.0032,
        smoothing: 1,
        color: i % 6 === 1 ? LEAF : LEAF_B,
        bone: root,
        name: "vineLeaf",
      });
    });
  }
  for (const s of [1, -1]) {
    vine(Y0 + s * 0.3, Y0 + s * 0.355, 1.5, 16, s > 0 ? 0 : Math.PI);
    vine(Y0 + s * 0.67, Y0 + s * 0.8, 3.2, 38, s > 0 ? 0.5 : Math.PI + 0.5);
  }
  // little gold studs along the belly edge of each limb
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const y = Y0 + s * (0.3 + i * 0.09);
      const L = limbAt(y);
      P(new THREE.SphereGeometry(0.0055, 6, 4), GOLD, { at: [L.p.x - L.rx * 0.92, y, 0.0] });
    }
  }

  // --- tassel -----------------------------------------------------------------------------------------------------
  {
    const yT = Y0 - 0.205;
    const L = limbAt(yT);
    ringAt(yT, 0.0075, 0.012, GOLD);
    const ax = L.p.x - L.rx - 0.03;
    const attach: [number, number, number] = [ax, yT, 0];
    P(new THREE.BoxGeometry(0.03, 0.007, 0.007), GOLD, { at: [L.p.x - L.rx - 0.012, yT, 0] });
    const tas = b.chain(
      "tassel",
      polyline([attach, [ax, yT - 0.075, 0], [ax, yT - 0.2, 0]]),
      { parent: root, names: ["tasselA", "tasselB", "tasselTip"], role: "tail" },
    );
    const [ja, jb] = tas.joints;
    b.part(new THREE.TorusGeometry(0.0085, 0.0025, 5, 8), GOLD, { at: attach, dir: [1, 0, 0], axis: "z", bone: ja });
    b.sweep(polyline([[ax, yT - 0.008, 0], [ax, yT - 0.07, 0]]), 0.0032, { bone: ja, sides: 5, color: LAV, name: "tasselCord" });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), GOLD, { at: [ax, yT - 0.045, 0], bone: ja });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), PEARL, { at: [ax, yT - 0.074, 0], bone: jb });
    b.lathe(
      [
        [0, 0],
        [0.011, 0],
        [0.015, -0.012],
        [0.013, -0.026],
        [0, -0.026],
      ],
      { at: [ax, yT - 0.082, 0], bone: jb, color: GOLD, segments: 8, name: "tasselHead" },
    );
    b.cards([frame([ax, yT - 0.106, 0], [0, 1, 0])], TASSEL_STRANDS, { size: [0.075, 0.115], lean: 180, flow: [0, 0, 1], cross: true, bone: jb });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), RUNE_GLOW, { at: [ax, yT - 0.222, 0], bone: jb });
  }

  // --- silk ribbons ------------------------------------------------------------------------------------------------
  const ribbonPaint = paint((_p, _n, s) => {
    const t = s[0];
    if (t < 0.035) return GOLD;
    return t < 0.18 ? PEARL : t < 0.6 ? LAV : cel("#8d7bf0", "#5b4cc2");
  });
  const ribbon = (name: string, ya: number, pt: number[][], w0: number, tw: number) => {
    const L = limbAt(ya);
    ringAt(ya, 0.006, 0.012, GOLD);
    const path = catmull(pt.map(([dx, dy, z]) => [L.p.x + dx, ya + dy, z]));
    const ch = b.chain(name, path, { parent: root, up: [0, 0, 1], count: 5, twist: tw, role: "tail" });
    b.sweep(ch, (t) => [w0 * (1 - 0.42 * t), 0.0032], { section: "box", color: ribbonPaint, caps: "point", name });
  };
  ribbon("ribbonTop", Y0 + 0.225, [[0.02, 0, -0.012], [0.13, 0.045, -0.02], [0.25, -0.005, -0.02], [0.37, 0.04, -0.02], [0.5, -0.01, -0.02]], 0.044, 70);
  ribbon("ribbonLow", Y0 - 0.225, [[0.02, 0, -0.012], [0.14, -0.04, -0.02], [0.26, 0.0, -0.02], [0.4, -0.05, -0.02], [0.52, -0.01, -0.02]], 0.038, -60);

  // --- the stand --------------------------------------------------------------------------------------------------
  const sideStone = paint((_p, n, s) => {
    if (n.y > 0.6) return STONE;
    const blocks = Math.floor(s[1] / 15);
    if (s[0] > 0.016 && s[0] < 0.046 && blocks % 2 === 0) return STONE_CARVED;
    return STONE;
  });
  const plinth = (outline: OutlinePoint[], color: Col, name: string) =>
    b.lathe(outline, { at: [0, 0, 0], bone: root, color, segments: 20, name });
  plinth(
    [
      [0, 0],
      [0.49, 0],
      [0.5, 0.012],
      [0.5, 0.05],
      [0.48, 0.062],
      [0, 0.062],
    ],
    sideStone,
    "plinthBase",
  );
  plinth(
    [
      [0, 0.062],
      [0.425, 0.062],
      [0.431, 0.075],
      [0.425, 0.095],
      [0, 0.095],
    ],
    STONE,
    "plinthMid",
  );
  plinth(
    [
      [0, 0.095],
      [0.366, 0.095],
      [0.371, 0.108],
      [0.356, 0.12],
      [0, 0.12],
    ],
    STONE_LIGHT,
    "plinthTop",
  );
  for (const [r, y] of [
    [0.501, 0.0505],
    [0.431, 0.0955],
    [0.371, 0.1085],
  ] as const)
    plinth(
      [
        [r - 0.012, y - 0.004],
        [r + 0.003, y - 0.004],
        [r + 0.003, y + 0.004],
        [r - 0.012, y + 0.004],
      ],
      GOLD,
      "plinthTrim",
    );
  P(new THREE.CircleGeometry(0.345, 28), "#ffffff", { at: [0, 0.1214, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: MOON_DISC, name: "moonDisc" });
  // pedestal and cup that hold the lower tip
  b.lathe(
    [
      [0, 0.12],
      [0.05, 0.12],
      [0.048, 0.132],
      [0.028, 0.148],
      [0.02, 0.168],
      [0.03, 0.18],
      [0, 0.18],
    ],
    { at: [0, 0, 0], bone: root, color: STONE_LIGHT, segments: 10, name: "pedestal" },
  );
  b.lathe(
    [
      [0.0, 0.186],
      [0.024, 0.2],
      [0.04, 0.232],
      [0.05, 0.238],
      [0.05, 0.23],
      [0.038, 0.19],
      [0.022, 0.168],
      [0.0, 0.168],
    ],
    { at: [0, 0, 0], bone: root, color: GOLD, segments: 10, name: "cup" },
  );

  // claw that cradles the lower limb, with its rod
  {
    const yc = 0.6;
    const L = limbAt(yc);
    const arc: number[][] = [];
    for (let i = 0; i <= 18; i++) {
      const phi = ((-150 + (300 * i) / 18) * Math.PI) / 180;
      const q = L.p.clone().addScaledVector(L.B, Math.cos(phi) * (L.rx + 0.011)).addScaledVector(upZ, Math.sin(phi) * (L.ry + 0.011));
      arc.push(q.toArray());
    }
    b.sweep(catmull(arc), 0.0065, { bone: root, sides: 6, color: GOLD, caps: "round", name: "claw" });
    for (const f of [-1, 1]) {
      const phi = (f * 150 * Math.PI) / 180;
      const q = L.p.clone().addScaledVector(L.B, Math.cos(phi) * (L.rx + 0.011)).addScaledVector(upZ, Math.sin(phi) * (L.ry + 0.011));
      glow(P(new THREE.SphereGeometry(0.0085, 6, 4), "#dffcff", { at: q.toArray() }), 1.3);
    }
    const end = L.p.clone().addScaledVector(L.B, L.rx + 0.011);
    const rod = catmull([[0.27, 0.12, 0], [0.33, 0.26, 0], [0.335, 0.42, 0], [end.x + 0.045, end.y - 0.05, 0], end.toArray()]);
    b.sweep(rod, [0.0135, 0.0095], {
      bone: root,
      sides: 8,
      color: GOLD_D,
      bands: [[0.1, GOLD], [0.46, LAV], [0.52, GOLD], [0.92, LAV], [1, GOLD]],
      name: "claw rod",
    });
    b.lathe(
      [
        [0, 0.12],
        [0.036, 0.12],
        [0.03, 0.134],
        [0.016, 0.148],
        [0, 0.148],
      ],
      { at: [0.27, 0, 0], bone: root, color: GOLD, segments: 8, name: "rodFoot" },
    );
  }

  // --- the halo crescent --------------------------------------------------------------------------------------------
  const CZ = -0.2;
  const R1 = 0.9;
  const R2 = 0.9;
  const CD = 0.2;
  const C1X = -0.3;
  const navyStar = paint((p) => {
    const c = cells(p, 0.085, 11);
    if (c.d1 < 0.07) return "#fff3c4";
    return c.id > 0.5 ? NAVY_B : NAVY;
  });
  b.extrude(crescentOutline(R1 + 0.014, R2 - 0.014, CD, 22), {
    at: [C1X, Y0, CZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    color: GOLD,
    bone: root,
    name: "crescentRim",
  });
  b.extrude(crescentOutline(R1, R2, CD, 22), {
    at: [C1X, Y0, CZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.032,
    bevel: 0.007,
    color: navyStar,
    bone: root,
    name: "crescent",
  });
  // gold inlay lines on the crescent face
  const arcLine = (cx: number, r: number, a0: number, a1: number, z: number) => {
    const out: number[][] = [];
    for (let i = 0; i <= 30; i++) {
      const a = ((a0 + ((a1 - a0) * i) / 30) * Math.PI) / 180;
      out.push([cx + r * Math.cos(a), Y0 + r * Math.sin(a), z]);
    }
    return out;
  };
  for (const f of [1, -1]) {
    const z = CZ + f * 0.0175;
    b.sweep(catmull(arcLine(C1X, R1 - 0.03, -70, 70, z)), 0.0032, { bone: root, sides: 5, color: GOLD, name: "crescentInlayOuter" });
    b.sweep(catmull(arcLine(C1X - CD, R2 + 0.03, -66, 66, z)), 0.0032, { bone: root, sides: 5, color: GOLD, name: "crescentInlayInner" });
  }
  // glowing stars and a constellation line set in both faces of the crescent
  for (const f of [1, -1]) {
    const degs = f > 0 ? [-58, -38, -18, 0, 18, 38, 58] : [-54, -34, -12, 8, 26, 44, 60];
    const spot = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      const r = R1 - 0.5 * CD * Math.cos(a);
      return [C1X + r * Math.cos(a), Y0 + r * Math.sin(a), CZ + f * 0.0165];
    };
    degs.forEach((deg, i) => {
      const sz = i % 3 === 0 ? 0.026 : 0.017;
      glow(
        b.extrude(starOutline(sz, sz * 0.32), {
          at: spot(deg),
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.004,
          color: STAR_GLOW,
          bone: root,
          name: "crescentStar",
        }),
        1.1,
      );
    });
    glow(
      b.sweep(polyline(degs.map(spot)), 0.0016, { bone: root, sides: 4, color: STAR_GLOW, caps: "flat", name: "constellation" }),
      0.8,
    );
  }
  // crescent post, gold, from the plinth
  {
    const q = C1X + Math.sqrt(R1 * R1 - 0.52 * 0.52) - 0.012;
    b.sweep(catmull([[0.3, 0.12, CZ], [0.34, 0.3, CZ], [q, Y0 - 0.52, CZ]]), [0.016, 0.012], {
      bone: root,
      sides: 8,
      color: GOLD_D,
      bands: [[0.18, GOLD], [0.5, NAVY_B], [0.58, GOLD], [1, NAVY_B]],
      name: "post",
    });
    b.lathe(
      [
        [0, 0.12],
        [0.04, 0.12],
        [0.03, 0.136],
        [0.018, 0.15],
        [0, 0.15],
      ],
      { at: [0.3, 0, CZ], bone: root, color: GOLD, segments: 8, name: "postFoot" },
    );
  }
  // hanging star charms from both horns
  const horn = Math.sqrt(R1 * R1 - ((R2 * R2 - R1 * R1 - CD * CD) / (2 * CD)) ** 2);
  const hornX = C1X + (R2 * R2 - R1 * R1 - CD * CD) / (2 * CD);
  for (const s of [1, -1]) {
    const hy = Y0 + s * horn;
    const len = s > 0 ? 0.2 : 0.1;
    const name = s > 0 ? "charmTop" : "charmLow";
    const ch = b.chain(name, polyline([[hornX, hy - s * 0.006, CZ], [hornX, hy - s * 0.006 - len * 0.5, CZ], [hornX, hy - s * 0.006 - len, CZ]]), {
      parent: root,
      names: [name, `${name}B`, `${name}Tip`],
      role: "tail",
    });
    const [ja, jb] = ch.joints;
    b.part(new THREE.TorusGeometry(0.009, 0.0026, 5, 8), GOLD, { at: [hornX, hy - s * 0.004 + (s > 0 ? -0.006 : 0.006), CZ], dir: [1, 0, 0], axis: "z", bone: ja });
    b.sweep(polyline([[hornX, hy - s * 0.016, CZ], [hornX, hy - s * 0.006 - len + 0.03, CZ]]), 0.0026, { bone: ja, sides: 5, color: GOLD, name: "charmChain" });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), PEARL, { at: [hornX, hy - s * 0.006 - len * 0.5, CZ], bone: jb });
    b.extrude(starOutline(0.036, 0.012, 4), {
      at: [hornX, hy - s * 0.006 - len - 0.002, CZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: GOLD,
      bone: jb,
      name: "charmStar",
    });
    glow(b.part(new THREE.SphereGeometry(0.0095, 6, 4), "#e0fcff", { at: [hornX, hy - s * 0.006 - len - 0.002, CZ + 0.006], bone: jb }), 1.4);
  }

  // --- plinth dressing: crystals, moon-lilies, fallen leaves -------------------------------------------------------
  const shard = (x: number, z: number, h: number, lean: [number, number], rad: number, tint: string) => {
    glow(
      P(new THREE.ConeGeometry(rad, h, 5), tint, {
        at: [x + lean[0] * h * 0.5, 0.095 + h * 0.5 - 0.004, z + lean[1] * h * 0.5],
        dir: [lean[0], 1, lean[1]],
        name: "shard",
      }),
      1.1,
    );
  };
  shard(-0.3, 0.25, 0.15, [-0.15, 0.1], 0.022, "#bff7ff");
  shard(-0.35, 0.2, 0.1, [-0.35, -0.05], 0.017, "#d9fbff");
  shard(-0.27, 0.29, 0.085, [0.1, 0.3], 0.016, "#9aeeff");
  shard(-0.33, 0.27, 0.06, [-0.4, 0.3], 0.012, "#e8fdff");

  const lily = (x: number, z: number, h: number, bx: number, bz: number, k: number) => {
    const top = [x + bx, 0.095 + h, z + bz];
    b.sweep(catmull([[x, 0.095, z], [x + bx * 0.1, 0.095 + h * 0.5, z + bz * 0.1], top]), [0.0045, 0.0032], { bone: root, sides: 5, color: STEM, name: "lilyStem" });
    const dir = [bx * 1.5, 1, bz * 1.5];
    b.ring(frame(top, dir), { count: 6, radius: 0.004, tilt: 58, fromDeg: 0, toDeg: 300 }, (item) =>
      b.spike(item, item, 0.042, 0.0105, { color: PEARL, bone: root, sides: 4, name: "petal" }),
    );
    glow(P(new THREE.SphereGeometry(0.0085, 6, 4), "#fff3b0", { at: [top[0], top[1] + 0.006, top[2]] }), 1.2);
    // one blade leaf at the base
    const a = k * 2.1;
    b.extrude(LEAF_OUT, {
      at: [x, 0.098, z],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.003,
      smoothing: 1,
      color: LEAF,
      bone: root,
      name: "lilyLeaf",
    });
  };
  lily(0.2, 0.33, 0.15, 0.03, 0.04, 0);
  lily(0.29, 0.28, 0.2, 0.05, 0.0, 1);
  lily(0.12, 0.37, 0.11, -0.01, 0.05, 2);

  // leaves strewn over the lower steps
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.445 + rand() * 0.035;
    const h = 0.0625;
    const hd = rand() * Math.PI * 2;
    const sc = 1.1 + rand() * 0.9;
    const col = i % 3 === 0 ? LAV : i % 3 === 1 ? LEAF : LEAF_B;
    const outline = LEAF_OUT.map(([x, y]) => [x * sc, y * sc] as OutlinePoint);
    b.extrude(outline, {
      at: [r * Math.cos(a), h + 0.0015, r * Math.sin(a)],
      x: [Math.cos(hd), 0, Math.sin(hd)],
      y: [-Math.sin(hd), 0, Math.cos(hd)],
      thickness: 0.0032,
      smoothing: 1,
      color: col,
      bone: root,
      name: "fallenLeaf",
    });
  }

  return b.root;
}
