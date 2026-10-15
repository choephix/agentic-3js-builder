// Frost-forged battle axe, League of Legends style: oversized crescent bearded blade with a glowing rime edge, an
// ice-crystal pick on the back, gold-trimmed storm-steel collar with a glowing gem, leather grip with white fur
// ruff, hanging icicles, floating shards, all standing in a frozen rune plinth. Cel-shaded (kits/toon) with
// self-lit cyan magic (kits/glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bezier, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A two-handed Freljord-style battle axe on a frozen rune plinth: crescent bearded blade with a glowing rime edge and rune plate, ice-crystal pick, gold-trimmed steel collar with a glowing gem, leather grip with a white fur ruff, icicles and floating shards.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
type Raw = [number, number, boolean?];

const K = 0.62; // blade drawing units -> meters
const HY = 1.12; // height of the axe head centre

export default function build() {
  const b = createBuilder({ name: "frostAxe" });

  // ---- skeleton: a plain prop, three bones up the haft --------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.1, 0], dir: [0, 1, 0] });
  const head = b.joint("axeHead", { parent: root, at: [0, HY, 0], dir: [0, 1, 0] });
  const tip = b.joint("spearTip", { parent: head, at: [0, 1.46, 0], dir: [0, 1, 0] });

  // ---- palette ---------------------------------------------------------------------------------------------
  const GOLD = "#f2b53d";
  const GOLD_SH = "#b85f1c";
  const GLOW = "#59e6ff";
  const GLOW_RIM = "#6beaff";
  const GEM = "#5af0ff";
  const LEATHER = "#7a4a30";
  const LEATHER_D = "#4b2a1c";

  const GOLDP = cel(GOLD, GOLD_SH);
  const CRYSTAL = cel("#7fdcff", "#2f7fd0");
  const ICICLE = cel("#c4f3ff", "#5aa8e6");
  const ICE_SKIN = cel(mottle("#9be8ff", "#e2faff", { size: 0.05, seed: 2 }));
  const SNOW = cel("#f8fdff", "#a9c6ea");
  const STONE = cel(scales(["#62779f", "#586c95", "#6b80a8"], "#2c3a5c", { size: 0.1, seed: 4 }));
  const STONE_D = cel(mottle("#3a4a73", "#2f3d63", { size: 0.08, seed: 8 }));
  const DARK_STEEL = cel(mottle("#27427a", "#1d3262", { size: 0.05, seed: 7 }));
  const HAFT = cel(grain("#3b5a8e", "#26406e", { size: 0.012, seed: 3 }));
  const SPEAR_STEEL = cel(mottle("#b9d8ff", "#eaf7ff", { size: 0.04, seed: 9 }));
  const BLADE_FACE = cel(
    paint((p) =>
      mix(
        mix("#233d78", "#4f88d4", smoothstep(0.03, 0.3, Math.abs(p.x))),
        "#dff7ff",
        0.75 * smoothstep(0.6, 0.85, noise(p, 0.05, 5)) * smoothstep(0.1, 0.3, Math.abs(p.x)),
      ),
    ),
  );
  const WRAP = cel(
    paint((_p, _n, s) => ((((s[1] - 360 * 12 * s[0]) % 360) + 360) % 360 < 200 ? LEATHER : LEATHER_D)),
  );
  const RIBBON = cel(
    paint((_p, _n, s) =>
      Math.abs(s[0]) > 0.017 || (s[1] < -0.05 && s[1] > -0.065) ? GOLD : s[1] < -0.12 ? "#1f86e0" : "#2bb4ff",
    ),
  );

  // ---- drawings ----------------------------------------------------------------------------------------------
  const flakePaths = (() => {
    let d = "";
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const pt = (r: number, rot = 0) =>
        `${(50 + r * Math.cos(a + rot)).toFixed(1)} ${(62 - r * Math.sin(a + rot)).toFixed(1)}`;
      d += `M50 62 L${pt(34)} `;
      for (const f of [0.45, 0.72]) {
        const bx = 50 + 34 * f * c;
        const by = 62 - 34 * f * s;
        const arm = 11 * (1.1 - f * 0.5);
        d += `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + arm * Math.cos(a + 0.8)).toFixed(1)} ${(by - arm * Math.sin(a + 0.8)).toFixed(1)} `;
        d += `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + arm * Math.cos(a - 0.8)).toFixed(1)} ${(by - arm * Math.sin(a - 0.8)).toFixed(1)} `;
      }
    }
    return d + "M30 14 L50 5 L70 14 M38 23 L50 16 L62 23 M32 112 L50 104 L68 112 M40 118 L50 113 L60 118";
  })();
  const RUNE = svg(
    `<svg viewBox="0 0 100 120"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#1b8fd0" stroke-width="9">${flakePaths}</g>
      <g stroke="#bff8ff" stroke-width="4">${flakePaths}</g></g></svg>`,
    { size: 256 },
  );
  const STRIP_D =
    "M6 20 L20 8 L34 20 L20 32 Z M44 20 L58 8 L72 20 L58 32 Z M82 20 L96 8 L110 20 L96 32 Z M34 20 L44 20 M72 20 L82 20";
  const STRIP = svg(
    `<svg viewBox="0 0 120 40"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${STRIP_D}" stroke="#1b8fd0" stroke-width="8"/>
      <path d="${STRIP_D}" stroke="#bff8ff" stroke-width="3.6"/></g></svg>`,
    { size: 256 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 40 80">
      <path d="M2 80 L38 80 L38 34 L35 10 L29 32 L25 2 L20 30 L15 0 L11 32 L5 12 L2 36 Z" fill="#f5fbff" stroke="#8fb6e4" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M6 74 L8 40 M14 74 L15 38 M22 74 L22 36 M30 74 L29 40 M36 74 L34 42" stroke="#c7def5" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );

  // ---- helpers -----------------------------------------------------------------------------------------------
  const merged = (list: THREE.BufferGeometry[]) => {
    const m = mergeGeometries(list);
    if (!m) throw new Error("frostAxe: geometry merge failed");
    return m;
  };

  const outline = (raw: Raw[], k = 1, ax = 0, ay = 0, sc = K): OutlinePoint[] =>
    raw.map(([x, y, sharp]): OutlinePoint => {
      const px = (ax + (x - ax) * k) * sc;
      const py = (ay + (y - ay) * k) * sc;
      return sharp ? [px, py, "sharp"] : [px, py];
    });

  /** A hexagonal crystal spire: prism to 62% of its length, then a point. */
  const crystal = (base: P3, dir: P3, len: number, r: number, color: string | Paint, bone: Joint) => {
    const l = Math.hypot(dir[0], dir[1], dir[2]);
    const tipPt: P3 = [base[0] + (dir[0] / l) * len, base[1] + (dir[1] / l) * len, base[2] + (dir[2] / l) * len];
    return b.sweep([base, tipPt], (t) => (t < 0.62 ? r : r * (1 - (t - 0.62) / 0.38)), {
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      color,
      bone,
    });
  };

  const band = (y: number, r: number, h: number, bone: Joint, color: string | Paint = GOLDP) =>
    b.lathe(
      [
        [0, -h / 2],
        [r * 0.86, -h / 2],
        [r, -h * 0.28],
        [r, h * 0.28],
        [r * 0.86, h / 2],
        [0, h / 2],
      ],
      { at: [0, y, 0], segments: 10, color, bone },
    );

  const layer = (
    raw: Raw[],
    ax: number,
    ay: number,
    k: number,
    thickness: number,
    bevel: number,
    color: string | Paint,
  ) =>
    b.extrude(outline(raw, k, ax, ay), {
      at: [0, HY, 0],
      x: [1, 0, 0],
      thickness,
      bevel,
      color,
      bone: head,
    });

  const trim = (o: OutlinePoint[], z: number) =>
    polyline(
      o.map(([x, y]) => [x, HY + y, z]),
      { closed: true },
    );

  const rivetGeo = (o: OutlinePoint[], z: number) => {
    const pts: Array<[number, number]> = [];
    o.forEach(([x, y], i) => {
      const [nx, ny] = o[(i + 1) % o.length];
      pts.push([x, y], [(x + nx) / 2, (y + ny) / 2]);
    });
    const out: THREE.BufferGeometry[] = [];
    for (const [x, y] of pts) {
      if (Math.abs(x) < 0.075) continue;
      for (const s of [1, -1]) out.push(new THREE.SphereGeometry(0.0065, 6, 4).translate(x, HY + y, s * z));
    }
    return out;
  };

  // ---- plinth: frozen rune stone ---------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.42, 0.03],
      [0.4, 0.04],
      [0, 0.04],
    ],
    { at: [0, 0, 0], segments: 10, color: STONE_D, bone: root },
  );
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.35, 0.015],
      [0.35, 0.055],
      [0.31, 0.075],
      [0.29, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 10, color: STONE, bone: root },
  );
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.165, 0.015],
      [0.12, 0.035],
      [0.07, 0.05],
      [0.04, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0.1, 0], segments: 10, color: SNOW, bone: root },
  );
  glow(
    b.lathe(
      [
        [0.2, 0],
        [0.235, 0],
        [0.235, 0.006],
        [0.2, 0.006],
      ],
      { at: [0, 0.1, 0], segments: 24, color: GLOW, bone: root },
    ),
    1.2,
  );
  const ticks: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    ticks.push(
      new THREE.BoxGeometry(0.02, 0.008, 0.035)
        .rotateY(a)
        .translate(0.38 * Math.sin(a), 0.042, 0.38 * Math.cos(a)),
    );
  }
  glow(b.part(merged(ticks), GLOW, { at: [0, 0, 0], bone: root }), 1.1);

  // crystal cluster growing round the base
  const rnd = rng(11);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
    const lean = 0.2 + 0.3 * rnd();
    const len = 0.1 + 0.17 * rnd();
    const r = 0.017 + 0.011 * rnd();
    const lit = i % 3 === 0;
    const c = crystal(
      [0.265 * Math.sin(a), 0.095, 0.265 * Math.cos(a)],
      [lean * Math.sin(a), 1, lean * Math.cos(a)],
      len,
      r,
      lit ? GLOW : CRYSTAL,
      root,
    );
    if (lit) glow(c, 1.1);
  }

  // four ice-iron claws gripping the haft
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const ux = Math.sin(a);
    const uz = Math.cos(a);
    b.sweep(bezier([0.27 * ux, 0.1, 0.27 * uz], [0.2 * ux, 0.3, 0.2 * uz], [0.04 * ux, 0.26, 0.04 * uz]), [0.022, 0.012], {
      sides: 6,
      color: DARK_STEEL,
      bone: root,
    });
  }
  band(0.26, 0.046, 0.05, root);
  band(0.26, 0.05, 0.012, root, cel(INK));

  // ---- haft --------------------------------------------------------------------------------------------------
  b.rod([0, 0.1, 0], [0, 1.46, 0], 0.028, { color: HAFT, bone: root, sides: 8 });
  b.rod([0, 0.3, 0], [0, 0.74, 0], 0.0335, { color: WRAP, bone: root, sides: 8 });
  band(0.3, 0.04, 0.026, root);
  band(0.74, 0.04, 0.026, root);
  band(0.2, 0.036, 0.016, root);
  band(0.14, 0.036, 0.016, root);
  for (const y of [1.32, 1.35]) {
    glow(
      b.lathe(
        [
          [0.028, -0.004],
          [0.034, -0.004],
          [0.034, 0.004],
          [0.028, 0.004],
        ],
        { at: [0, y, 0], segments: 10, color: GLOW, bone: head },
      ),
      1.2,
    );
  }
  const studs: THREE.BufferGeometry[] = [];
  for (let row = 0; row < 8; row++) {
    for (let k = 0; k < 3; k++) {
      const a = row * 1.1 + (k * Math.PI * 2) / 3;
      studs.push(new THREE.SphereGeometry(0.0055, 5, 4).translate(0.0345 * Math.sin(a), 0.34 + row * 0.05, 0.0345 * Math.cos(a)));
    }
  }
  b.part(merged(studs), GOLD, { at: [0, 0, 0], bone: root });

  // fur ruff hanging over the top of the grip
  for (const [y, seed] of [
    [0.8, 5],
    [0.77, 6],
  ] as const) {
    const ringItems = b.ring(frame([0, y, 0], [0, 1, 0]), { count: 14, radius: 0.03 }).items;
    b.cards(ringItems, TUFT, {
      size: [0.055, 0.13],
      lean: 70,
      bend: 25,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 8,
      rng: rng(seed),
      bone: root,
    });
  }

  // ---- collar / eye of the axe -------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, -0.17],
      [0.045, -0.17],
      [0.056, -0.155],
      [0.056, 0.155],
      [0.045, 0.17],
      [0, 0.17],
    ],
    { at: [0, HY, 0], segments: 8, spin: 22.5, color: DARK_STEEL, bone: head },
  );
  for (const dy of [-0.15, 0.15]) band(HY + dy, 0.064, 0.032, head);
  for (const dy of [-0.09, 0.09]) band(HY + dy, 0.0575, 0.006, head, cel(INK));
  const bandRivets: THREE.BufferGeometry[] = [];
  for (const dy of [-0.15, 0.15]) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      bandRivets.push(new THREE.SphereGeometry(0.0075, 6, 4).translate(0.066 * Math.sin(a), HY + dy, 0.066 * Math.cos(a)));
    }
  }
  b.part(merged(bandRivets), "#ffd36b", { at: [0, 0, 0], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.038, 0.009, 5, 8), GOLDP, { at: [0, HY, s * 0.054], bone: head, flat: true });
    glow(
      b.part(new THREE.OctahedronGeometry(0.026, 0), GEM, {
        at: [0, HY, s * 0.058],
        scale: [0.8, 1.25, 0.6],
        bone: head,
        flat: true,
      }),
      1.4,
    );
  }

  // crown horns arching out of the collar top
  for (const s of [1, -1]) {
    b.sweep(bezier([0, HY + 0.15, s * 0.035], [0, HY + 0.26, s * 0.1], [0, HY + 0.4, s * 0.13]), [0.03, 0], {
      section: { ngon: 5 },
      caps: { start: "flat", end: "point" },
      color: CRYSTAL,
      bone: head,
    });
  }

  // ribbons hanging from the lower band
  const ribbon = (x: number, z: number, len: number) =>
    b.extrude(
      [
        [-0.022, 0],
        [0.022, 0],
        [0.024, -len],
        [0, -len + 0.04],
        [-0.024, -len - 0.01],
      ],
      { at: [x, HY - 0.145, z], x: [1, 0, 0], thickness: 0.006, color: RIBBON, bone: head },
    );
  for (const s of [1, -1]) {
    ribbon(-0.03, s * 0.062, 0.2);
    ribbon(0.03, s * 0.062, 0.17);
    for (const x of [-0.03, 0.03])
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: [x, HY - 0.145, s * 0.063], bone: head });
  }

  // ---- main blade: crescent bearded edge ----------------------------------------------------------------------------
  const BLADE: Raw[] = [
    [0.06, -0.16],
    [0.22, -0.24],
    [0.38, -0.36],
    [0.5, -0.47, true],
    [0.5, -0.33],
    [0.57, -0.18],
    [0.61, 0.0],
    [0.6, 0.16],
    [0.55, 0.32],
    [0.46, 0.46],
    [0.52, 0.58, true],
    [0.34, 0.5],
    [0.22, 0.38],
    [0.12, 0.24],
    [0.06, 0.16],
  ];
  glow(layer(BLADE, 0.06, 0.05, 1.05, 0.012, 0.003, GLOW_RIM), 1.3);
  layer(BLADE, 0.06, 0.05, 1, 0.024, 0.007, ICE_SKIN);
  layer(BLADE, 0.06, 0.05, 0.78, 0.044, 0.01, BLADE_FACE);
  for (const s of [1, -1]) {
    b.sweep(trim(outline(BLADE, 0.74, 0.06, 0.05), s * 0.022), 0.0045, { color: GOLDP, bone: head, sides: 4 });
    glow(
      b.part(new THREE.PlaneGeometry(0.13, 0.156), "#ffffff", {
        at: [0.19, HY + 0.045, s * 0.025],
        dir: [0, 0, s],
        axis: "z",
        texture: RUNE,
        bone: head,
      }),
      1.2,
    );
  }

  // ---- back pick: ice spike ---------------------------------------------------------------------------------------
  const PICK: Raw[] = [
    [-0.06, 0.14],
    [-0.24, 0.16],
    [-0.44, 0.12],
    [-0.62, 0.03],
    [-0.84, -0.14, true],
    [-0.62, -0.07],
    [-0.44, -0.1],
    [-0.24, -0.15],
    [-0.06, -0.15],
  ];
  glow(layer(PICK, -0.06, 0, 1.06, 0.012, 0.003, GLOW_RIM), 1.3);
  layer(PICK, -0.06, 0, 1, 0.022, 0.006, ICE_SKIN);
  layer(PICK, -0.06, 0, 0.72, 0.036, 0.008, BLADE_FACE);
  for (const s of [1, -1]) {
    b.sweep(trim(outline(PICK, 0.66, -0.06, 0), s * 0.018), 0.004, { color: GOLDP, bone: head, sides: 4 });
    glow(
      b.part(new THREE.PlaneGeometry(0.15, 0.05), "#ffffff", {
        at: [-0.15, HY, s * 0.021],
        dir: [0, 0, s],
        axis: "z",
        texture: STRIP,
        bone: head,
      }),
      1.2,
    );
  }
  b.part(
    merged([...rivetGeo(outline(BLADE, 0.6, 0.06, 0.05), 0.022), ...rivetGeo(outline(PICK, 0.5, -0.06, 0), 0.018)]),
    GOLD,
    { at: [0, 0, 0], bone: head },
  );

  // crystals growing from the head
  glow(crystal([-0.13, HY + 0.088, 0], [-0.5, 1, 0], 0.17, 0.02, GLOW, head), 1.1);
  crystal([-0.21, HY + 0.088, 0], [-0.9, 1, 0], 0.1, 0.014, CRYSTAL, head);
  crystal([-0.07, HY + 0.1, 0.012], [-0.15, 1, 0.5], 0.1, 0.012, CRYSTAL, head);
  glow(crystal([0.085, HY + 0.13, 0], [0.45, 1, 0], 0.2, 0.02, GLOW, head), 1.1);
  for (const s of [1, -1]) crystal([0.085, HY + 0.13, s * 0.014], [0.3, 1, s * 0.5], 0.13, 0.014, CRYSTAL, head);

  // icicles hanging under the edges
  const icicles: Array<[number, number, number, number]> = [
    [0.22, -0.24, 0.06, 0.011],
    [0.3, -0.3, 0.09, 0.013],
    [0.38, -0.36, 0.07, 0.011],
    [0.44, -0.415, 0.1, 0.012],
    [-0.24, -0.15, 0.07, 0.011],
    [-0.34, -0.125, 0.05, 0.009],
    [-0.44, -0.1, 0.08, 0.011],
  ];
  for (const [rx, ry, len, r] of icicles) crystal([rx * K, HY + ry * K + 0.008, 0], [0, -1, 0], len, r, ICICLE, head);

  // ---- spear tip crowning the haft ------------------------------------------------------------------------------------
  band(1.4, 0.04, 0.03, tip);
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.04, 0.015],
      [0.03, 0.06],
      [0.022, 0.075],
      [0, 0.075],
    ],
    { at: [0, 1.4, 0], segments: 8, color: GOLDP, bone: tip },
  );
  const SPEAR: Raw[] = [
    [0, 0],
    [0.045, 0.03],
    [0.055, 0.09],
    [0.035, 0.16],
    [0, 0.26, true],
    [-0.035, 0.16],
    [-0.055, 0.09],
    [-0.045, 0.03],
  ];
  for (const x of [
    [1, 0, 0],
    [0, 0, 1],
  ]) {
    b.extrude(outline(SPEAR, 1, 0, 0, 0.85), {
      at: [0, 1.46, 0],
      x,
      thickness: 0.02,
      bevel: 0.005,
      color: SPEAR_STEEL,
      bone: tip,
    });
    glow(
      b.extrude(outline(SPEAR, 0.55, 0, 0.1, 0.85), {
        at: [0, 1.46, 0],
        x,
        thickness: 0.03,
        bevel: 0.004,
        color: GLOW,
        bone: tip,
      }),
      1.3,
    );
  }

  // ---- floating shards of magic ice -----------------------------------------------------------------------------------
  const shards: Array<[number, number, number, boolean]> = [
    [20, 1.45, 0.9, true],
    [75, 0.95, 1.1, false],
    [140, 1.3, 0.8, true],
    [200, 0.78, 1.0, false],
    [320, 1.1, 0.85, true],
    [250, 1.5, 0.7, false],
  ];
  shards.forEach(([deg, y, size, lit], i) => {
    const a = (deg * Math.PI) / 180;
    const opts = {
      at: [0.55 * Math.sin(a), y, 0.55 * Math.cos(a)] as P3,
      scale: [0.55 * size, 1.5 * size, 0.55 * size] as P3,
      rotation: [10 * i + 8, 40 * i, 15 * i + 6] as P3,
      bone: head,
      flat: true,
    };
    if (lit) glow(b.part(new THREE.OctahedronGeometry(0.05, 0), "#8ff0ff", opts), 1.1);
    else b.part(new THREE.OctahedronGeometry(0.05, 0), CRYSTAL, opts);
  });

  return b.root;
}
