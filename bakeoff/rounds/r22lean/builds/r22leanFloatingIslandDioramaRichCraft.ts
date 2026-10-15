import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, scales } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded floating island: a hanging crystal-studded rock, a mossy ruined colonnade with a glowing rune plaza and floating crystal, a stream that spills over the rim as a waterfall, a stone bridge, a sakura, a ginkgo, a green tree and a pine, flowers, vines, lanterns and drifting sparkles.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "floatingIslandDiorama" });
  const R = rng(11);

  // ---------- palette ----------
  const GOLD = "#f2c14e";
  const CYAN = "#7ff3ff";
  const VIOLET = "#b9a6ff";
  const WARM = "#ffd37a";
  const ROCK = cel(
    paint((p) => {
      const t = noise(p, 0.25, 3);
      if (p.y < 0.45) return t > 0.5 ? "#7a6a98" : "#6c5d8c";
      return Math.sin(p.y * 24 + t * 3) > 0.6 ? "#b8a4c2" : t > 0.5 ? "#9c88ae" : "#8e7aa4";
    }),
  );
  const GRASS_BASE = mottle("#9be86e", "#6fd16a", { size: 0.3, seed: 2 });
  const TOP = cel(paint((p, n) => (p.y < 1.345 && n.y < 0.7 ? "#8a5a3c" : GRASS_BASE)));
  const GRASS = cel(mottle("#a6ee74", "#78d86c", { size: 0.2, seed: 9 }));
  const STONE0 = mottle("#efe6d0", "#ddd0b0", { size: 0.12, seed: 5 });
  const STONE = cel(STONE0);
  const COL = cel(
    paint((_p, _n, s) => {
      if (s[0] < 0.07) return "#7cc86a";
      return s[1] % 45 < 7 ? "#cdbd98" : STONE0;
    }),
  );
  const PLAZA = cel(scales(["#efe5cd", "#e4d8bb", "#ebdfc2"], "#b5a583", { size: 0.1, seed: 4 }));
  const TRUNK = cel(grain("#8a5a44", "#6a4234", { size: 0.03, axis: "y", seed: 2 }));
  const SAK = cel(mottle("#ffc8e0", "#ff9cc4", { size: 0.14, seed: 6 }));
  const GREEN = cel(mottle("#58c46a", "#3fae6a", { size: 0.12, seed: 8 }));
  const GINKGO = cel(mottle("#ffd84a", "#ffb93a", { size: 0.12, seed: 12 }));
  const PINE = cel(mottle("#2e9f78", "#23876a", { size: 0.1, seed: 3 }));
  const BUSH = cel(mottle("#4fc268", "#3aa85c", { size: 0.1, seed: 14 }));
  const WATER = cel("#6adaff", "#3fa8ee");
  const CLOUD = cel("#ffffff", "#cfe3ff");
  const MOSS = cel("#7cc86a", "#4fa064");
  const TEAL = cel("#2fb5b0", "#1f8c9c");

  // ---------- helpers ----------
  const lump = (
    at: number[],
    r: number,
    color: string | Paint,
    sc: number[] = [1, 1, 1],
    detail = 0,
    rot: number[] = [R() * 360, R() * 360, R() * 360],
  ) => b.part(new THREE.IcosahedronGeometry(r, detail), color, { at, scale: sc, rotation: rot });
  const box = (at: number[], size: number[], color: string | Paint, rotY = 0) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: [0, rotY, 0] });
  const ringPts = (c: number[], r: number, tx = 0, tz = 0, n = 20) => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push(
        new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
          .applyEuler(new THREE.Euler(tx, 0, tz))
          .add(new THREE.Vector3(c[0], c[1], c[2])),
      );
    }
    return out;
  };
  const PROFILE: number[][] = [
    [0, 0],
    [0.1, 0.12],
    [0.32, 0.4],
    [0.62, 0.72],
    [0.95, 1.0],
    [1.2, 1.22],
    [1.26, 1.3],
  ];
  const rockR = (h: number) => {
    for (let i = 0; i < PROFILE.length - 1; i++) {
      const a = PROFILE[i];
      const c = PROFILE[i + 1];
      if (h <= c[1]) return a[0] + ((c[0] - a[0]) * (h - a[1])) / (c[1] - a[1]);
    }
    return 1.26;
  };
  const segDist = (x: number, z: number, a: number[], c: number[]) => {
    const dx = c[0] - a[0];
    const dz = c[1] - a[1];
    let t = ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz);
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
  };

  // ---------- layout ----------
  const CX = -0.4;
  const CZ = -0.15;
  const PY = 1.48;
  const STREAM_XZ = [
    [0.35, -0.5],
    [0.55, -0.36],
    [0.8, -0.2],
    [1.05, 0.02],
    [1.2, 0.15],
    [1.31, 0.215],
  ];
  const STREAM_Y = [1.455, 1.455, 1.455, 1.455, 1.445, 1.385];
  const POND = [0.3, -0.52];
  const TREES = [
    [-0.85, 0.62, 0.38],
    [0.55, 0.72, 0.36],
    [0.1, -0.95, 0.3],
    [0.9, -0.55, 0.3],
    [-1.0, 0.2, 0.15],
  ];
  const free = (x: number, z: number, pad = 0.05, trees = true) => {
    if (Math.hypot(x - CX, z - CZ) < 0.66) return false;
    for (let i = 0; i < STREAM_XZ.length - 1; i++)
      if (segDist(x, z, STREAM_XZ[i], STREAM_XZ[i + 1]) < 0.17 + pad) return false;
    if (Math.hypot(x - POND[0], z - POND[1]) < 0.3 + pad) return false;
    if (trees) for (const t of TREES) if (Math.hypot(x - t[0], z - t[1]) < t[2] + pad) return false;
    return true;
  };
  const sample = (n: number, maxR = 1.1, pad = 0.05, trees = true, near?: number[], nearR = 0.5) => {
    const out: number[][] = [];
    let tries = 0;
    while (out.length < n && tries < n * 60) {
      tries++;
      const a = R() * Math.PI * 2;
      const r = Math.sqrt(R()) * maxR;
      let x = Math.cos(a) * r;
      let z = Math.sin(a) * r;
      if (near) {
        x = near[0] + Math.cos(a) * Math.sqrt(R()) * nearR;
        z = near[1] + Math.sin(a) * Math.sqrt(R()) * nearR;
        if (Math.hypot(x, z) > maxR) continue;
      }
      if (free(x, z, pad, trees)) out.push([x, z]);
    }
    return out;
  };

  // ---------- textures ----------
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><path d="M3 40 Q6 20 1 4 Q11 18 12 40Z" fill="#6fd46a"/><path d="M11 40 Q14 18 16 0 Q21 18 22 40Z" fill="#8be67a"/><path d="M20 40 Q24 22 31 8 Q31 24 29 40Z" fill="#5cc460"/></svg>`,
    { size: 128 },
  );
  const flowerSvg = (c: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40"><path d="M12 40 Q11 26 12 12" stroke="#3f9e55" stroke-width="2.4" fill="none"/><path d="M12 30 Q5 26 4 20 Q10 22 12 30Z" fill="#5cc860"/>${[0, 72, 144, 216, 288]
        .map(
          (a) =>
            `<circle cx="${12 + 4.6 * Math.sin((a * Math.PI) / 180)}" cy="${9 - 4.6 * Math.cos((a * Math.PI) / 180)}" r="4" fill="${c}"/>`,
        )
        .join("")}<circle cx="12" cy="9" r="2.6" fill="#ffd54a"/></svg>`,
      { size: 128 },
    );
  const leafSvg = (c1: string, c2: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="${c1}" stroke="${c2}" stroke-width="1.2"><ellipse cx="16" cy="21" rx="5" ry="10" transform="rotate(-40 16 21)"/><ellipse cx="16" cy="21" rx="5" ry="10" transform="rotate(40 16 21)"/><ellipse cx="16" cy="19" rx="5" ry="11"/></g></svg>`,
      { size: 96 },
    );
  const PETAL = leafSvg("#ffb8d6", "#ff86b4");
  const FAN = leafSvg("#ffe05a", "#f0b020");
  const LEAF = leafSvg("#6edc78", "#3fae6a");
  const FLOWERS = [flowerSvg("#ffffff"), flowerSvg("#ffa6c8"), flowerSvg("#8fd8ff"), flowerSvg("#ffe27a")];
  const vineTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 80"><path d="M10 80 Q4 55 12 36 Q16 20 8 0" stroke="#3f9e55" stroke-width="2.6" fill="none"/>${[
      [8, 62, -1],
      [13, 46, 1],
      [8, 30, -1],
      [12, 14, 1],
    ]
      .map(
        ([x, y, s]) =>
          `<ellipse cx="${x + s * 4}" cy="${y}" rx="4.5" ry="2.6" transform="rotate(${s * -25} ${x + s * 4} ${y})" fill="#6ad46a" stroke="#3fae6a" stroke-width="0.9"/>`,
      )
      .join("")}</svg>`,
    { size: 256 },
  );
  const starTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 0 L19.5 12.5 L32 16 L19.5 19.5 L16 32 L12.5 19.5 L0 16 L12.5 12.5Z" fill="#ffe27a"/><circle cx="16" cy="16" r="3.2" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const streaks = Array.from({ length: 10 }, (_, i) => {
    const y = R() * 40;
    return `<rect x="${2 + i * 3.9}" y="${y}" width="1.3" height="${30 + R() * 40}" fill="#ffffff" opacity="0.75"/>`;
  }).join("");
  const fallTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe3ff"/><stop offset="0.7" stop-color="#b8f0ff"/><stop offset="1" stop-color="#f2fdff"/></linearGradient></defs><rect width="40" height="100" fill="url(#g)"/>${streaks}</svg>`,
    { size: 256 },
  );
  const runeTicks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return `<line x1="${64 + 56 * Math.sin(a)}" y1="${64 - 56 * Math.cos(a)}" x2="${64 + 62 * Math.sin(a)}" y2="${64 - 62 * Math.cos(a)}" stroke="#ffd96a" stroke-width="2.4"/>`;
  }).join("");
  const tri = (rot: number) =>
    `<polygon points="${[0, 120, 240]
      .map((a) => {
        const r = ((a + rot) * Math.PI) / 180;
        return `${64 + 42 * Math.sin(r)},${64 - 42 * Math.cos(r)}`;
      })
      .join(" ")}" fill="none" stroke="#5ef2e6" stroke-width="2.4"/>`;
  const runeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="none" stroke="#5ef2e6" stroke-width="2.4"/><circle cx="64" cy="64" r="50" fill="none" stroke="#ffd96a" stroke-width="2.4"/><circle cx="64" cy="64" r="16" fill="none" stroke="#5ef2e6" stroke-width="2.4"/>${runeTicks}${tri(0)}${tri(60)}</svg>`,
    { size: 256 },
  );

  // ---------- island rock ----------
  b.lathe(
    [
      [0, 0],
      [0.1, 0.12],
      [0.32, 0.4],
      [0.62, 0.72],
      [0.95, 1.0],
      [1.2, 1.22],
      [1.26, 1.3],
      [0, 1.3],
    ],
    { at: [0, 0, 0], segments: 9, color: ROCK },
  );
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36 + R() * 20) * Math.PI) / 180;
    const h = 0.45 + R() * 0.7;
    const rr = rockR(h) * 0.92;
    const s = 0.2 + R() * 0.14;
    lump([Math.sin(a) * rr, h, Math.cos(a) * rr], s, ROCK, [1, 1.1, 0.9]);
  }
  for (const [deg, h, len, r] of [
    [20, 1.0, 0.55, 0.09],
    [75, 0.95, 0.5, 0.08],
    [130, 1.05, 0.6, 0.1],
    [190, 0.9, 0.45, 0.07],
    [245, 1.0, 0.55, 0.09],
    [300, 0.95, 0.5, 0.08],
    [340, 1.1, 0.6, 0.07],
  ]) {
    const a = (deg * Math.PI) / 180;
    const rr = rockR(h) * 0.8;
    b.spike([Math.sin(a) * rr, h, Math.cos(a) * rr], [0, -1, 0], len, r, ROCK, { sides: 6 });
  }
  // glowing crystals under the island
  [
    [30, 0.62],
    [110, 0.7],
    [170, 0.55],
    [230, 0.75],
    [300, 0.6],
  ].forEach(([deg, h], i) => {
    const a = (deg * Math.PI) / 180;
    const rr = rockR(h) * 0.9;
    const base = [Math.sin(a) * rr, h, Math.cos(a) * rr];
    const col = i % 2 ? VIOLET : CYAN;
    glow(b.spike(base, [Math.sin(a) * 0.8, -0.45, Math.cos(a) * 0.8], 0.3, 0.06, col, { sides: 6 }), 1.2);
    const a2 = a + 0.14;
    glow(
      b.spike(
        [Math.sin(a2) * rr, h + 0.08, Math.cos(a2) * rr],
        [Math.sin(a2) * 0.8, -0.45, Math.cos(a2) * 0.8],
        0.2,
        0.04,
        col,
        { sides: 6 },
      ),
      1.2,
    );
  });
  // root tendrils
  for (let i = 0; i < 8; i++) {
    const a = ((i * 45 + 12) * Math.PI) / 180;
    const pts = [1.2, 0.98, 0.82].map((h, k) => {
      const rr = rockR(h) * (1.0 + k * 0.02) + 0.02;
      return [Math.sin(a + k * 0.08) * rr, h, Math.cos(a + k * 0.08) * rr];
    });
    b.sweep(catmull(pts), [0.016, 0.006], TRUNK, { sides: 5 });
  }

  // grass cap with soil lip
  b.lathe(
    [
      [0, 1.3],
      [1.3, 1.3],
      [1.32, 1.36],
      [1.18, 1.44],
      [0, 1.45],
    ],
    { at: [0, 0, 0], segments: 18, color: TOP },
  );
  b.sweep(catmull(ringPts([0, 1.3, 0], 1.305, 0, 0, 28), { closed: true }), 0.014, GOLD, { sides: 5 });
  // vines hanging off the rim
  {
    const angs: number[] = [];
    for (let i = 0; i < 30; i++) angs.push(((i * 12 + R() * 8) * Math.PI) / 180);
    const fr = angs.map((a) => frame([Math.sin(a) * 1.29, 1.31, Math.cos(a) * 1.29], [0, 1, 0]));
    b.cards(fr, vineTex, {
      size: [0.1, 0.35],
      lean: 180,
      flow: (_f, i) => [Math.sin(angs[i]), 0, Math.cos(angs[i])],
      vary: 0.4,
      rng: R,
    });
  }

  // ---------- ruins ----------
  const P = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return [CX + Math.sin(a) * r, CZ + Math.cos(a) * r];
  };
  b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.56, 0.035],
      [0, 0.035],
    ],
    { at: [CX, 1.445, CZ], segments: 14, color: PLAZA },
  );
  b.sweep(catmull(ringPts([CX, 1.484, CZ], 0.545, 0, 0, 24), { closed: true }), 0.008, GOLD, { sides: 5 });
  b.sweep(catmull(ringPts([CX, 1.484, CZ], 0.4, 0, 0, 20), { closed: true }), 0.006, GOLD, { sides: 5 });
  glow(
    b.part(new THREE.PlaneGeometry(0.76, 0.76), "#ffffff", {
      at: [CX, 1.4835, CZ],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: runeTex,
    }),
    1,
  );
  // steps
  box([CX, 1.4675, CZ + 0.62], [0.46, 0.035, 0.1], STONE);
  box([CX, 1.4625, CZ + 0.7], [0.54, 0.025, 0.1], STONE);
  // pedestal
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.15, 0.05],
      [0.07, 0.07],
      [0.06, 0.24],
      [0.1, 0.26],
      [0.1, 0.3],
      [0, 0.3],
    ],
    { at: [CX, PY, CZ], segments: 8, color: STONE },
  );
  b.sweep(catmull(ringPts([CX, PY + 0.065, CZ], 0.12, 0, 0, 16), { closed: true }), 0.006, GOLD, { sides: 5 });
  const CRY = [CX, 2.03, CZ];
  glow(
    b.part(new THREE.OctahedronGeometry(0.1, 0), CYAN, { at: CRY, scale: [0.8, 1.5, 0.8], rotation: [0, 20, 0] }),
    1.4,
  );
  b.sweep(catmull(ringPts(CRY, 0.19, 0.5, 0.2, 20), { closed: true }), 0.007, GOLD, { sides: 5 });
  b.sweep(catmull(ringPts(CRY, 0.23, -0.4, -0.5, 20), { closed: true }), 0.007, GOLD, { sides: 5 });
  ringPts(CRY, 0.19, 0.5, 0.2, 6).forEach((p, i) => {
    if (i % 2 === 0) glow(lump([p.x, p.y, p.z], 0.022, i === 2 ? VIOLET : CYAN, [1, 1, 1], 0), 1.3);
  });

  const column = (x: number, z: number, h: number, intact: boolean) => {
    const pts: [number, number][] = intact
      ? [
          [0, 0],
          [0.085, 0],
          [0.085, 0.04],
          [0.062, 0.055],
          [0.055, h - 0.07],
          [0.075, h - 0.05],
          [0.09, h - 0.03],
          [0.09, h],
          [0, h],
        ]
      : [
          [0, 0],
          [0.085, 0],
          [0.085, 0.04],
          [0.062, 0.055],
          [0.055, h - 0.04],
          [0.045, h],
          [0.025, h + 0.03],
          [0, h + 0.015],
        ];
    b.lathe(pts, { at: [x, PY, z], segments: 8, color: COL });
    if (intact) {
      b.lathe(
        [
          [0.052, 0],
          [0.066, 0],
          [0.066, 0.014],
          [0.052, 0.014],
        ],
        { at: [x, PY + h - 0.12, z], segments: 8, color: GOLD },
      );
    } else {
      lump([x + 0.03, PY + 0.02, z + 0.02], 0.035, MOSS, [1.3, 0.5, 1.3], 0);
    }
  };
  const COLS: [number, number, boolean][] = [
    [100, 0.55, true],
    [160, 0.55, true],
    [220, 0.34, false],
    [280, 0.2, false],
    [340, 0.55, true],
    [40, 0.42, false],
  ];
  for (const [deg, h, ok] of COLS) {
    const [x, z] = P(deg, 0.46);
    column(x, z, h, ok);
  }
  // lintel, banner
  const P1 = P(100, 0.46);
  const P2 = P(160, 0.46);
  b.frustumBox([P1[0], 2.07, P1[1]], [P2[0], 2.07, P2[1]], [0.1, 0.09], [0.1, 0.09], STONE);
  b.rod([P1[0], 2.115, P1[1]], [P2[0], 2.115, P2[1]], 0.007, GOLD, { sides: 5 });
  {
    const dx = P2[0] - P1[0];
    const dz = P2[1] - P1[1];
    const len = Math.hypot(dx, dz);
    const dn = [dx / len, dz / len];
    const mx = (P1[0] + P2[0]) / 2;
    const mz = (P1[1] + P2[1]) / 2;
    const ox = mx - CX;
    const oz = mz - CZ;
    const ol = Math.hypot(ox, oz);
    const bx = mx - dn[0] * 0.05 + (ox / ol) * 0.065;
    const bz = mz - dn[1] * 0.05 + (oz / ol) * 0.065;
    b.extrude(
      [
        [0, 0],
        [0.1, 0],
        [0.1, -0.24],
        [0.05, -0.18],
        [0, -0.24],
      ],
      {
        at: [bx, 2.03, bz],
        x: [dn[0], 0, dn[1]],
        thickness: 0.012,
        paint: undefined,
        color: paint((_p, _n, s) => (s[1] > -0.04 ? GOLD : s[1] < -0.17 && Math.abs(s[0] - 0.05) < 0.02 ? GOLD : TEAL)),
      } as never,
    );
    lump([bx + dn[0] * 0.05, 1.78, bz + dn[1] * 0.05], 0.022, GOLD);
  }
  // fallen column drum
  {
    const c = [-0.92, 1.515, -0.3];
    const d = [0.8, -0.6];
    b.rod([c[0] - d[0] * 0.3, c[1], c[2] - d[1] * 0.3], [c[0] - d[0] * 0.02, c[1], c[2] - d[1] * 0.02], 0.065, COL, {
      sides: 8,
      caps: "flat",
    });
    b.rod([c[0] + d[0] * 0.05, c[1], c[2] + d[1] * 0.05], [c[0] + d[0] * 0.22, c[1], c[2] + d[1] * 0.22], 0.065, COL, {
      sides: 8,
      caps: "flat",
    });
    lump([c[0] - 0.02, 1.47, c[2] + 0.1], 0.04, MOSS, [1.4, 0.5, 1.2]);
  }
  // rubble
  for (let i = 0; i < 12; i++) {
    const inPlaza = i < 5;
    const a = ((R() * 360) * Math.PI) / 180;
    const r = inPlaza ? 0.25 + R() * 0.2 : 0.62 + R() * 0.3;
    const x = CX + Math.sin(a) * r;
    const z = CZ + Math.cos(a) * r;
    if (Math.hypot(x, z) > 1.12 || (!inPlaza && !free(x, z, 0, false))) continue;
    const s = 0.04 + R() * 0.05;
    box([x, (inPlaza ? PY : 1.45) + s * 0.4, z], [s * 1.4, s * 0.8, s], STONE, R() * 180);
  }
  // moss on the plaza edge
  for (let i = 0; i < 6; i++) {
    const [x, z] = P(i * 60 + 25, 0.52);
    lump([x, PY + 0.005, z], 0.05, MOSS, [1.4, 0.3, 1.1]);
  }

  // ---------- pond, stream, waterfall ----------
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.012],
      [0, 0.012],
    ],
    { at: [POND[0], 1.445, POND[1]], segments: 14, color: WATER },
  );
  for (let i = 0; i < 9; i++) {
    const a = i * 40 + 10;
    const x = POND[0] + Math.sin((a * Math.PI) / 180) * 0.23;
    const z = POND[1] + Math.cos((a * Math.PI) / 180) * 0.23;
    if (STREAM_XZ.some((s, k) => k < 2 && Math.hypot(x - s[0], z - s[1]) < 0.12)) continue;
    lump([x, 1.465, z], 0.045 + R() * 0.02, ROCK, [1.2, 0.8, 1]);
  }
  for (const [x, z] of [
    [0.22, -0.55],
    [0.35, -0.6],
  ]) b.part(new THREE.CircleGeometry(0.045, 7), "#4fbf6a", { at: [x, 1.4635, z], rotation: [-90, 0, 0] });
  lump([0.22, 1.475, -0.55], 0.03, "#ff9cc4", [1, 0.8, 1], 0);
  b.sweep(
    catmull(STREAM_XZ.map((p, i) => [p[0], STREAM_Y[i], p[1]])),
    () => [0.085, 0.022],
    WATER,
    { sides: 8 },
  );
  // bridge
  {
    const at = [0.925, 1.445, -0.09];
    const u = [0.707, 0, -0.707];
    const w = [0.707, 0, 0.707];
    b.extrude(
      [
        [-0.3, 0],
        [-0.3, 0.05],
        [-0.15, 0.1],
        [0.15, 0.1],
        [0.3, 0.05],
        [0.3, 0],
        [0.2, 0],
        [0.1, 0.06],
        [-0.1, 0.06],
        [-0.2, 0],
      ],
      { at, x: u, thickness: 0.16, bevel: 0.006, color: STONE },
    );
    for (const t of [1, -1]) {
      const tops: number[][] = [];
      for (const s of [1, -1]) {
        const px = at[0] + u[0] * s * 0.26 + w[0] * t * 0.085;
        const pz = at[2] + u[2] * s * 0.26 + w[2] * t * 0.085;
        b.rod([px, 1.5, pz], [px, 1.6, pz], 0.012, GOLD, { sides: 5 });
        lump([px, 1.61, pz], 0.017, GOLD);
        tops.push([px, 1.585, pz]);
      }
      b.rod(tops[0], tops[1], 0.007, GOLD, { sides: 5 });
    }
  }
  // lip and fall
  lump([1.3, 1.37, 0.17], 0.06, ROCK, [1.2, 0.8, 1]);
  lump([1.3, 1.37, 0.3], 0.06, ROCK, [1.2, 0.8, 1]);
  lump([1.36, 1.41, 0.23], 0.05, "#f2fdff", [1.2, 0.7, 1.2]);
  glow(
    b.part(new THREE.BoxGeometry(0.07, 1.05, 0.2), "#ffffff", {
      at: [1.35, 0.875, 0.22],
      rotation: [0, -9, 0],
      texture: fallTex,
    }),
    0.7,
  );
  b.rod([1.37, 0.36, 0.22], [1.37, 0.12, 0.22], [0.045, 0.005], "#cfefff", { sides: 6 });
  for (const [dx, dy, dz, r] of [
    [0, 0, 0, 0.14],
    [0.12, 0.03, 0.08, 0.1],
    [-0.1, 0.02, -0.07, 0.1],
    [0.05, 0.08, -0.1, 0.09],
    [0.15, 0.0, -0.06, 0.08],
    [-0.02, 0.04, 0.14, 0.09],
  ])
    lump([1.4 + dx, 0.35 + dy, 0.22 + dz], r, CLOUD, [1, 0.8, 1], 1);

  // ---------- trees ----------
  const tree = (
    x: number,
    z: number,
    top: number,
    lean: number[],
    lumps: number[][],
    leaf: Paint,
    card: THREE.Texture | null,
  ) => {
    b.sweep(
      catmull([
        [x, 1.44, z],
        [x + lean[0] * 0.3, 1.44 + (top - 1.44) * 0.45, z + lean[1] * 0.3],
        [x + lean[0], top, z + lean[1]],
      ]),
      [0.075, 0.035],
      TRUNK,
      { sides: 7 },
    );
    b.lathe(
      [
        [0, 0],
        [0.13, 0],
        [0.07, 0.12],
        [0, 0.14],
      ],
      { at: [x, 1.44, z], segments: 7, color: TRUNK },
    );
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.6;
      b.rod([x + Math.cos(a) * 0.05, 1.52, z + Math.sin(a) * 0.05], [x + Math.cos(a) * 0.2, 1.45, z + Math.sin(a) * 0.2], [0.03, 0.012], TRUNK, {
        sides: 5,
      });
    }
    const fr: ReturnType<typeof frame>[] = [];
    lumps.forEach((l, i) => {
      const c = [x + lean[0] + l[0], l[1], z + lean[1] + l[2]];
      lump(c, l[3], leaf, [1, 0.85, 1], 1);
      if (i < 3) b.rod([x + lean[0], top - 0.05, z + lean[1]], c, [0.025, 0.014], TRUNK, { sides: 5 });
      if (card)
        for (let k = 0; k < 7; k++) {
          const d = new THREE.Vector3(R() * 2 - 1, R() * 1.4 - 0.4, R() * 2 - 1).normalize();
          fr.push(frame([c[0] + d.x * l[3] * 0.95, c[1] + d.y * l[3] * 0.85, c[2] + d.z * l[3] * 0.95], [d.x, d.y, d.z]));
        }
    });
    if (card) b.cards(fr, card, { size: 0.11, lean: 55, bend: 15, cross: true, vary: 0.3, rng: R });
  };
  // sakura
  tree(
    -0.85,
    0.62,
    2.15,
    [-0.08, 0.05],
    [
      [0, 2.35, 0, 0.36],
      [0.3, 2.3, 0.1, 0.28],
      [-0.3, 2.35, -0.1, 0.3],
      [0.05, 2.28, 0.32, 0.26],
      [-0.1, 2.62, 0.12, 0.26],
      [0.2, 2.6, -0.2, 0.24],
      [-0.28, 2.25, 0.28, 0.22],
      [0.35, 2.5, 0.2, 0.2],
    ].map((l) => l),
    SAK,
    PETAL,
  );
  // green tree
  tree(
    0.55,
    0.72,
    1.95,
    [0.05, -0.04],
    [
      [0, 2.1, 0, 0.34],
      [0.28, 2.0, 0.08, 0.26],
      [-0.28, 2.02, -0.06, 0.27],
      [0.02, 2.0, 0.3, 0.24],
      [-0.05, 2.34, 0.0, 0.24],
      [0.12, 2.28, -0.24, 0.2],
    ],
    GREEN,
    LEAF,
  );
  // ginkgo
  tree(
    0.9,
    -0.55,
    1.8,
    [-0.04, 0.03],
    [
      [0, 1.95, 0, 0.26],
      [0.2, 1.88, 0.06, 0.2],
      [-0.2, 1.9, -0.05, 0.2],
      [0.0, 2.15, 0.02, 0.18],
      [0.04, 1.88, 0.22, 0.17],
    ],
    GINKGO,
    FAN,
  );
  // pine
  {
    const [x, z] = [0.1, -0.95];
    b.rod([x, 1.44, z], [x, 1.75, z], [0.05, 0.035], TRUNK, { sides: 6 });
    [
      [1.58, 0.32, 0.38],
      [1.82, 0.27, 0.34],
      [2.04, 0.21, 0.3],
      [2.24, 0.14, 0.28],
    ].forEach(([y, r, h]) => {
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 0.35, h * 0.55],
          [r * 0.55, h * 0.5],
          [0, h],
        ],
        { at: [x, y, z], segments: 7, color: PINE },
      );
    });
    glow(b.spike([x, 2.44, z], [0, 1, 0], 0.1, 0.02, WARM, { sides: 5 }), 1);
  }

  // stone lantern
  {
    const [x, z] = [-1.0, 0.2];
    box([x, 1.47, z], [0.15, 0.04, 0.15], STONE);
    b.rod([x, 1.49, z], [x, 1.66, z], 0.025, STONE, { sides: 6 });
    box([x, 1.69, z], [0.12, 0.03, 0.12], STONE);
    glow(box([x, 1.76, z], [0.085, 0.1, 0.085], WARM), 1.3);
    b.lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.02, 0.06],
        [0, 0.07],
      ],
      { at: [x, 1.81, z], segments: 4, spin: 45, color: STONE },
    );
    lump([x, 1.885, z], 0.018, GOLD);
  }

  // bushes
  sample(6, 1.05, 0.12).forEach(([x, z], i) => {
    lump([x, 1.5, z], 0.11, BUSH, [1, 0.8, 1], 1);
    lump([x + 0.09, 1.49, z + 0.03], 0.08, BUSH, [1, 0.8, 1], 1);
    lump([x - 0.06, 1.49, z - 0.07], 0.07, BUSH, [1, 0.8, 1], 1);
    for (let k = 0; k < 3; k++)
      lump([x + (R() - 0.5) * 0.2, 1.56 + R() * 0.03, z + (R() - 0.5) * 0.2], 0.014, i % 2 ? "#ffffff" : "#ffa6c8");
  });

  // grass tufts, flowers, petal carpet
  {
    const g = sample(150, 1.12, 0.03).map(([x, z]) => frame([x, 1.447, z], [0, 1, 0]));
    b.cards(g, grassTex, { size: [0.09, 0.1], vary: 0.35, cross: true, rng: R });
    const f = sample(80, 1.1, 0.06).map(([x, z]) => frame([x, 1.447, z], [0, 1, 0]));
    b.cards(f, FLOWERS, { size: [0.06, 0.1], vary: 0.3, cross: true, rng: R });
    const cp = sample(40, 1.1, 0, false, [-0.85, 0.62], 0.55);
    const fa = cp.map(() => R() * Math.PI * 2);
    b.cards(
      cp.map(([x, z]) => frame([x, 1.452, z], [0, 1, 0])),
      PETAL,
      { size: 0.07, lean: 90, mirror: true, flow: (_f, i) => [Math.cos(fa[i]), 0, Math.sin(fa[i])], rng: R },
    );
  }

  // ---------- sky dressing ----------
  const floatRock = (x: number, y: number, z: number, r: number, crystal: boolean) => {
    lump([x, y, z], r, ROCK, [1, 0.8, 1]);
    lump([x, y + r * 0.62, z], r * 0.95, GRASS, [1, 0.3, 1]);
    if (crystal) glow(b.spike([x, y + r * 0.7, z], [0, 1, 0], r * 1.4, r * 0.3, CYAN, { sides: 5 }), 1.3);
  };
  floatRock(1.55, 1.75, -0.5, 0.13, true);
  floatRock(-1.5, 0.95, 0.5, 0.1, false);
  floatRock(1.0, 2.5, 0.9, 0.09, false);
  for (const [x, y, z] of [
    [-1.35, 0.55, 0.3],
    [-1.55, 0.5, 0.1],
    [-1.25, 0.5, 0.5],
  ])
    lump([x, y, z], 0.13, CLOUD, [1.2, 0.8, 1], 1);
  for (const [x, y, z] of [
    [0.4, 0.5, 1.2],
    [0.6, 0.48, 1.3],
  ])
    lump([x, y, z], 0.12, CLOUD, [1.2, 0.8, 1], 1);

  {
    const sp: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 14; i++) {
      const a = ((i * 25.7 + 10) * Math.PI) / 180;
      const r = 1.35 + R() * 0.4;
      sp.push(frame([Math.sin(a) * r, 0.8 + R() * 1.8, Math.cos(a) * r], [0, 1, 0]));
    }
    glow(b.cards(sp, starTex, { size: 0.12, cross: true, vary: 0.3, rng: R }), 1.2);
  }

  return b.root;
}
