import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, cells, smoothstep, svg, catmull, spiral } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering crescent-bladed battle axe in a stylized League-of-Legends look: dark blued steel with gold trim, a frosted cutting edge, glowing snowflake runes, sapphire gems, ice-crystal spearhead and a frozen crystal base.",
};

type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------- palette
const GOLD = paint((p, n) =>
  mix("#a8741f", "#ffe08a", Math.min(1, 0.55 * noise(p, 0.03, 11) + 0.5 * smoothstep(-0.2, 1, n.y))),
);
const STEEL = paint((p, n) =>
  mix("#3f5876", "#b9d6ec", Math.min(1, 0.5 * noise(p, 0.05, 2) + 0.5 * smoothstep(-0.5, 1, n.y))),
);
const DSTEEL = paint((p, n) =>
  mix(mix("#1a2a44", "#3b5d84", noise(p, 0.05, 3)), "#9fd4ee", 0.35 * smoothstep(0.4, 1, n.y)),
);
const HAFT = paint((p) => {
  const c = mix("#1b2a40", "#34506f", noise(p, 0.012, 4));
  const f = smoothstep(0.55, 0.1, p.y) * smoothstep(0.35, 0.7, noise(p, 0.03, 9) + 0.3);
  return mix(c, "#e8f8ff", f);
});
const BLADE = paint((p, n, s) => {
  if (Math.abs(n.x) < 0.45) return s[0] < 0.3 ? GOLD : "#effcff";
  const t = smoothstep(0.2, 0.44, s[0]);
  const base = mix("#1a2d4b", "#3d6a99", noise(p, 0.06, 5));
  let c = mix(base, "#cdf1ff", t * 0.9);
  const cr = cells(p, 0.09, 4);
  if (cr.d2 - cr.d1 < 0.012) c = mix(c, "#ffffff", 0.55);
  return c;
});
const NAVY = "#13233b";
const PANEL = paint((_p, n) => (Math.abs(n.x) > 0.7 ? NAVY : GOLD));
const LEATHER = "#4a2e24";
const SNOW = "#eaf8ff";
const CRYS = ["#bdeeff", "#7fd0f5", "#e4fbff"];
const GEM = "#4fd0ff";

// ---------------------------------------------------------------- rune drawings
const RUNE = "#a8f0ff";
function flakePath(cx: number, cy: number, R: number) {
  let d = "";
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    d += `M${cx} ${cy}L${(cx + ux * R).toFixed(1)} ${(cy + uy * R).toFixed(1)}`;
    const bx = cx + ux * R * 0.55;
    const by = cy + uy * R * 0.55;
    for (const sg of [-1, 1]) {
      const ang = a + (sg * Math.PI) / 3;
      d += `M${bx.toFixed(1)} ${by.toFixed(1)}L${(bx + Math.cos(ang) * R * 0.32).toFixed(1)} ${(by + Math.sin(ang) * R * 0.32).toFixed(1)}`;
    }
  }
  return d;
}
function runeSvg(body: string, mirror: boolean) {
  return svg(
    `<svg viewBox="0 0 75 100" xmlns="http://www.w3.org/2000/svg"><g ${
      mirror ? 'transform="translate(75 0) scale(-1 1)"' : ""
    }>${body}</g></svg>`,
    { size: 256 },
  );
}
const FLAKE_BODY = `<path d="${flakePath(51.25, 50, 12)}" stroke="${RUNE}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M51.25 46 L55.25 50 L51.25 54 L47.25 50Z" fill="${RUNE}"/>`;
const CRESCENT_PTS: [number, number][] = [
  [13.75, 8.75],
  [22.5, 21.25],
  [28.75, 36.25],
  [30.6, 50],
  [28.75, 63.75],
  [22.5, 78.75],
  [15, 91.25],
];
const CRESCENT_BODY = `<path d="M${CRESCENT_PTS.map((q) => q.join(" ")).join("L")}" stroke="${RUNE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  ${[CRESCENT_PTS[0], CRESCENT_PTS[3], CRESCENT_PTS[6]].map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="2.4" fill="${RUNE}"/>`).join("")}`;

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const R = rng(7);

  const HY = 1.36; // head centre height
  const TOPY = 1.58; // top of the socket

  // ---------------------------------------------------------------- frozen base
  b.part(new THREE.CylinderGeometry(0.2, 0.27, 0.07, 7), SNOW, { at: [0, 0.035, 0], flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    b.part(new THREE.IcosahedronGeometry(0.09, 0), i % 2 ? "#cfeefc" : SNOW, {
      at: [Math.cos(a) * 0.22, 0.035, Math.sin(a) * 0.22],
      scale: [1, 0.5, 1],
      rotation: [0, R() * 180, 0],
      flat: true,
    });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + (R() - 0.5) * 0.4;
    const r0 = 0.09 + R() * 0.07;
    const len = 0.16 + R() * 0.26;
    const rad = 0.022 + R() * 0.02;
    const lean = 0.35 + R() * 0.5;
    const sp = b.spike([Math.cos(a) * r0, 0.04, Math.sin(a) * r0], [Math.cos(a) * lean, 1, Math.sin(a) * lean], len, rad, {
      color: CRYS[i % 3],
      section: { ngon: 6 },
    });
    if (i % 3 === 0) glow(sp, 0.8);
  }

  // ---------------------------------------------------------------- haft
  b.sweep(
    [
      [0, 0.04, 0],
      [0, TOPY, 0],
    ],
    [0.024, 0.028, 0.025, 0.028, 0.024],
    { color: HAFT, caps: "flat" },
  );
  // leather spiral wrap
  b.sweep(spiral([0, 0.34, 0], [0.0285, 0.34, 0], [0, 1, 0], { turns: 11, r1: 0.0285, pitch: 0.06 }), 0.0065, {
    color: LEATHER,
    sides: 5,
  });
  for (const y of [0.3, 1.02]) {
    b.part(new THREE.TorusGeometry(0.031, 0.009, 5, 10), GOLD, { at: [0, y, 0], dir: [0, 1, 0], axis: "z" });
  }
  // langets (steel straps) running down from the head
  for (const [x, z, w, d] of [
    [0.028, 0, 0.008, 0.016],
    [-0.028, 0, 0.008, 0.016],
    [0, 0.028, 0.016, 0.008],
    [0, -0.028, 0.016, 0.008],
  ]) {
    b.part(new THREE.BoxGeometry(w, 0.4, d), STEEL, { at: [x, 1.0, z] });
  }
  // pommel cap
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.052, 0.025],
      [0.04, 0.06],
      [0.036, 0.11],
      [0.052, 0.135],
      [0.052, 0.155],
      [0.034, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0.07, 0], segments: 8, color: GOLD },
  );

  // ---------------------------------------------------------------- head: socket
  b.lathe(
    [
      [0, -0.22],
      [0.045, -0.22],
      [0.065, -0.2],
      [0.065, -0.18],
      [0.05, -0.16],
      [0.05, 0.16],
      [0.065, 0.18],
      [0.065, 0.2],
      [0.045, 0.22],
      [0, 0.22],
    ],
    { at: [0, HY, 0], segments: 8, color: DSTEEL },
  );
  for (const dy of [-0.19, 0.19]) {
    b.part(new THREE.TorusGeometry(0.067, 0.011, 5, 10), GOLD, { at: [0, HY + dy, 0], dir: [0, 1, 0], axis: "z" });
  }

  // ---------------------------------------------------------------- blade
  const BLADE_OUT: Pt[] = [
    [0.02, 0.14],
    [0.2, 0.2],
    [0.34, 0.3],
    [0.5, 0.38, "sharp"],
    [0.41, 0.24],
    [0.36, 0.11],
    [0.345, 0],
    [0.36, -0.11],
    [0.41, -0.24],
    [0.48, -0.37, "sharp"],
    [0.34, -0.3],
    [0.2, -0.2],
    [0.02, -0.14],
  ];
  b.extrude(BLADE_OUT, { at: [0, HY, 0], thickness: 0.04, bevel: 0.01, color: BLADE });

  const PANEL_OUT: Pt[] = [
    [0.03, 0.1],
    [0.18, 0.14],
    [0.27, 0.19],
    [0.29, 0.1],
    [0.26, 0],
    [0.29, -0.1],
    [0.27, -0.19],
    [0.18, -0.14],
    [0.03, -0.1],
  ];
  b.extrude(PANEL_OUT, { at: [0, HY, 0], thickness: 0.052, bevel: 0.008, color: PANEL });

  // gold frame behind the rune panel
  const FRAME_OUT: Pt[] = PANEL_OUT.map(([x, y]) => [0.16 + (x - 0.16) * 1.12, y * 1.16] as Pt);
  b.extrude(FRAME_OUT, { at: [0, HY, 0], thickness: 0.046, bevel: 0.006, color: GOLD });
  // rivets on the panel corners
  for (const s of [1, -1]) {
    for (const [u, v] of [
      [0.2, 0.15],
      [0.2, -0.15],
      [0.28, 0.0],
    ]) {
      b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [s * 0.028, HY + v, u] });
    }
  }
  // gold binding along the blade's inner edges, out to the horn tips
  for (const sg of [1, -1]) {
    b.sweep(
      catmull([
        [0, HY + sg * 0.14, 0.02],
        [0, HY + sg * 0.2, 0.2],
        [0, HY + sg * 0.3, 0.34],
        [0, HY + sg * 0.38, 0.5],
      ]),
      [0.024, 0.008],
      { color: GOLD, section: { ngon: 6 }, caps: "point" },
    );
  }
  // flared gold collar under the socket
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.07, 0.03],
      [0.074, 0.05],
      [0.06, 0.07],
      [0.04, 0.08],
      [0, 0.08],
    ],
    { at: [0, HY - 0.3, 0], segments: 8, color: GOLD },
  );
  // drifting frost motes
  const motes: [number, number, number][] = [
    [0.05, 0.42, 0.3],
    [-0.06, 0.34, 0.5],
    [0.04, -0.4, 0.46],
    [-0.05, -0.28, 0.58],
    [0.06, 0.5, 0.42],
    [-0.04, 0.22, -0.34],
  ];
  for (const [x, y, z] of motes) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.014 + R() * 0.01, 0), "#d9f7ff", {
        at: [x, HY + y, z],
        scale: [0.7, 1.5, 0.7],
        rotation: [R() * 90, R() * 180, 0],
        flat: true,
      }),
      1.2,
    );
  }

  // rear fang, hooking upward
  const FANG: Pt[] = [
    [0.0, 0.08],
    [0.15, 0.12],
    [0.3, 0.15],
    [0.42, 0.22, "sharp"],
    [0.3, 0.07],
    [0.15, -0.02],
    [0.0, -0.08],
  ];
  b.extrude(FANG, { at: [0, HY + 0.02, -0.03], x: [0, 0, -1], thickness: 0.04, bevel: 0.008, color: BLADE });

  // glowing runes on both faces
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.6, 0.8), "#ffffff", {
        at: [s * 0.032, HY, 0.26],
        dir: [s, 0, 0],
        axis: "z",
        texture: runeSvg(FLAKE_BODY, s < 0),
      }),
      1.3,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.6, 0.8), "#ffffff", {
        at: [s * 0.024, HY, 0.26],
        dir: [s, 0, 0],
        axis: "z",
        texture: runeSvg(CRESCENT_BODY, s < 0),
      }),
      1.2,
    );
    // sapphire gems on the socket
    glow(
      b.part(new THREE.OctahedronGeometry(0.045, 0), GEM, {
        at: [s * 0.058, HY, 0],
        scale: [0.55, 1.3, 0.9],
        flat: true,
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------- frost growth on the head
  const crown = (base: number[], dir: number[], len: number, rad: number, col: string, g = 0) => {
    const sp = b.spike(base, dir, len, rad, { color: col, section: { ngon: 5 } });
    if (g) glow(sp, g);
  };
  // spearhead crystal on top
  glow(b.spike([0, TOPY - 0.02, 0], [0, 1, 0], 0.3, 0.036, { color: "#d6f6ff", section: { ngon: 6 } }), 1.1);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.spike([Math.cos(a) * 0.03, TOPY - 0.02, Math.sin(a) * 0.03], [Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6], 0.15, 0.022, {
      color: CRYS[i % 3],
      section: { ngon: 6 },
    });
  }
  // spine crystals
  crown([0, HY + 0.25, 0.27], [0, 1, 0.35], 0.13, 0.022, "#bdeeff", 0.8);
  crown([0, HY + 0.17, 0.12], [0, 1, -0.2], 0.1, 0.02, "#7fd0f5");
  crown([0, HY + 0.3, 0.38], [0, 1, 0.6], 0.09, 0.016, "#e4fbff");
  // icicles hanging from the lower edge
  crown([0, HY - 0.25, 0.27], [0, -1, 0.1], 0.14, 0.02, "#bdeeff");
  crown([0, HY - 0.33, 0.4], [0, -1, 0.1], 0.12, 0.018, "#7fd0f5", 0.8);
  crown([0, HY - 0.176, 0.13], [0, -1, -0.1], 0.09, 0.018, "#e4fbff");

  // floating ice shards in the crescent bite
  const shards: [number, number, number, number][] = [
    [0.0, 0.1, 0.43, 0.026],
    [0.02, -0.08, 0.46, 0.022],
    [-0.02, 0.0, 0.4, 0.03],
    [0.03, 0.17, 0.5, 0.016],
    [-0.03, -0.17, 0.5, 0.018],
  ];
  for (const [x, y, z, sz] of shards) {
    glow(
      b.part(new THREE.OctahedronGeometry(sz, 0), "#c9f3ff", {
        at: [x, HY + y, z],
        scale: [0.6, 1.7, 0.8],
        rotation: [R() * 60, R() * 180, R() * 60],
        flat: true,
      }),
      1,
    );
  }

  // ---------------------------------------------------------------- ribbons
  b.part(new THREE.TorusGeometry(0.034, 0.007, 5, 10), GOLD, { at: [0, 1.12, 0], dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0.0, 1.12, s * 0.05],
        [0.03 * s, 1.0, s * 0.075],
        [-0.01, 0.88, s * 0.07],
        [0.04 * s, 0.76, s * 0.075],
        [0.0, 0.66, s * 0.07],
      ]),
      (t) => [0.04 * (1 - 0.45 * t), 0.005],
      { color: s > 0 ? "#2f8fd0" : "#e8f6ff", caps: "point" },
    );
  }

  return b.root;
}
