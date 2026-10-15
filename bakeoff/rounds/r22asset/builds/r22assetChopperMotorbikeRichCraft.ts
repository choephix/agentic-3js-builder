import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "Long-fork custom chopper in polished hero-shooter style: graphite and white colour blocking with one orange accent, glowing rims and lamps, V-twin, drag pipes, fat rear tyre.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];

const ORANGE = "#ff7a1a";
const WHITE = "#eef2f6";
const GRAPHITE = "#2b3340";
const FRAMEC = "#3a4350";
const STEEL = "#59636f";
const CHROME = "#b9c3cf";
const BLACK = "#14171c";
const LEATHER = "#4b3226";
const BRASS = "#c9a15a";
const LAMP = "#fff1c2";
const EMBER = "#ff8a2a";
const RED = "#ff3b3b";

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  // ---------------------------------------------------------------- skeleton
  const body = b.joint("frame", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: body, at: [0, 0.975, 0.322], dir: [0, -0.669, 0.743], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.32, 1.05], dir: [1, 0, 0], role: "hinge" });
  const swing = b.joint("swingarm", { parent: body, at: [0, 0.45, -0.35], dir: [0, -0.1, -0.55], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: swing, at: [0, 0.355, -0.9], dir: [1, 0, 0], role: "hinge" });
  const kick = b.joint("kickstand", { parent: body, at: [0.17, 0.3, -0.15], dir: [0.4, -0.3, -0.9], role: "hinge" });
  type Joint = typeof body;

  // ---------------------------------------------------------------- helpers
  const box = (w: number, h: number, d: number, color: string | Paint, bone: Joint, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string | Paint, bone: Joint, at: V, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot });
  const sph = (r: number, color: string | Paint, bone: Joint, at: V, scale?: V) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, scale });
  const rod = (a: V, c: V, r: number, color: string, bone: Joint) =>
    b.rod(a, c, r, color, { bone, sides: 6 });

  // fork axis: t metres down the steering axis, x sideways
  const P = (t: number, x = 0): V => [x, 0.975 - 0.669 * t, 0.322 + 0.743 * t];
  const FORK_ROT: V = [132, 0, 0];

  // ---------------------------------------------------------------- paints and textures
  const tankPaint = paint((p) =>
    Math.abs(p.x) < 0.014 ? WHITE : Math.abs(p.y - 0.955) < 0.006 ? WHITE : p.y < 0.955 ? GRAPHITE : ORANGE,
  );
  const fenderPaint = paint((p) => (Math.abs(p.x) < 0.012 ? WHITE : ORANGE));
  const tread = paint((_p, _n, s) => {
    const side = Math.min(Math.abs(s[1] - 0.25), Math.abs(s[1] - 0.75));
    if (side < 0.035) return ORANGE;
    return Math.floor(s[0] * 56) % 2 ? "#1b1d22" : "#0f1115";
  });
  const seatPaint = paint((p) => (Math.abs(p.x) < 0.004 || Math.abs(Math.abs(p.x) - 0.06) < 0.003 ? ORANGE : LEATHER));

  const BOLT = svg(
    `<svg viewBox="0 0 100 70"><polygon points="6,38 26,6 94,6 74,64 26,64" fill="${GRAPHITE}" stroke="#ffffff" stroke-width="4"/>
    <polygon points="56,12 36,38 50,38 42,60 68,30 54,30 62,12" fill="${ORANGE}"/>
    <rect x="14" y="40" width="16" height="3" fill="#ffffff"/><rect x="20" y="47" width="12" height="3" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#ffffff"/><rect x="1.5" y="1.5" width="57" height="27" fill="none" stroke="${ORANGE}" stroke-width="3"/>
    <rect x="9" y="9" width="6" height="12" fill="${GRAPHITE}"/><rect x="18" y="9" width="6" height="12" fill="${GRAPHITE}"/><rect x="27" y="9" width="6" height="12" fill="${GRAPHITE}"/>
    <polygon points="38,9 52,9 46,21 40,21" fill="${ORANGE}"/></svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- wheels
  const wheel = (j: Joint, cy: number, cz: number, R: number, r: number, rimR: number, tubular: number) => {
    b.part(new THREE.TorusGeometry(R, r, 8, tubular), tread, { bone: j, at: [0, cy, cz], rotation: [0, 90, 0] });
    b.part(new THREE.TorusGeometry(rimR, 0.016, 6, 28), CHROME, { bone: j, at: [0, cy, cz], rotation: [0, 90, 0] });
    for (const x of [0.035, -0.035])
      glow(
        b.part(new THREE.TorusGeometry(rimR - 0.012, 0.006, 4, 28), EMBER, {
          bone: j,
          at: [x, cy, cz],
          rotation: [0, 90, 0],
        }),
        1.6,
      );
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI * 2) / 12;
      const x = k % 2 ? 0.018 : -0.018;
      rod(
        [x, cy + Math.cos(a) * 0.05, cz + Math.sin(a) * 0.05],
        [x, cy + Math.cos(a) * (rimR - 0.01), cz + Math.sin(a) * (rimR - 0.01)],
        0.006,
        CHROME,
        j,
      );
    }
    cyl(0.05, 0.05, 0.12, 10, CHROME, j, [0, cy, cz], [0, 0, 90]);
    cyl(0.032, 0.032, 0.15, 8, ORANGE, j, [0, cy, cz], [0, 0, 90]);
  };
  wheel(wheelF, 0.32, 1.05, 0.27, 0.05, 0.208, 28);
  wheel(wheelR, 0.355, -0.9, 0.275, 0.08, 0.19, 28);

  // front disc + caliper, rear sprocket
  cyl(0.15, 0.15, 0.008, 16, STEEL, wheelF, [0.064, 0.32, 1.05], [0, 0, 90]);
  cyl(0.1, 0.1, 0.01, 12, ORANGE, wheelF, [0.066, 0.32, 1.05], [0, 0, 90]);
  box(0.035, 0.07, 0.05, ORANGE, steer, [0.075, 0.44, 0.97]);
  cyl(0.11, 0.11, 0.022, 14, STEEL, wheelR, [0.115, 0.355, -0.9], [0, 0, 90]);
  cyl(0.07, 0.07, 0.026, 8, ORANGE, wheelR, [0.115, 0.355, -0.9], [0, 0, 90]);

  // ---------------------------------------------------------------- front end
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 10), FRAMEC, {
    bone: body,
    at: [0, 0.975, 0.322],
    rotation: FORK_ROT,
  });
  box(0.28, 0.045, 0.1, GRAPHITE, steer, P(0.1), FORK_ROT);
  box(0.26, 0.04, 0.09, GRAPHITE, steer, P(-0.09), FORK_ROT);
  cyl(0.02, 0.02, 0.05, 6, CHROME, steer, P(-0.12), FORK_ROT);
  for (const s of [1, -1]) {
    rod(P(0.08, s * 0.09), P(0.6, s * 0.09), 0.024, CHROME, steer);
    rod(P(0.58, s * 0.09), P(0.97, s * 0.09), 0.032, STEEL, steer);
    cyl(0.036, 0.036, 0.03, 8, ORANGE, steer, P(0.63, s * 0.09), FORK_ROT);
    cyl(0.026, 0.026, 0.02, 6, BLACK, steer, P(0.97, s * 0.095), [0, 0, 90]);
    for (let i = 0; i < 6; i++) cyl(0.034, 0.034, 0.016, 8, BLACK, steer, P(0.14 + i * 0.065, s * 0.09), FORK_ROT);
    // fender struts
    rod(P(0.7, s * 0.09), [s * 0.065, 0.645, 0.86], 0.01, CHROME, steer);
    // headlight brackets
    rod(P(0.24, s * 0.09), [s * 0.095, 0.88, 0.56], 0.01, CHROME, steer);
    // fork brace bolts
    sph(0.012, CHROME, steer, P(0.1, s * 0.11));
  }
  rod([0.12, 0.32, 1.05], [-0.12, 0.32, 1.05], 0.015, CHROME, wheelF);

  // front fender
  const arcPts: V[] = [-35, -5, 25, 55, 85].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [0, 0.32 + 0.375 * Math.cos(a), 1.05 + 0.375 * Math.sin(a)];
  });
  b.sweep(catmull(arcPts), () => [0.065, 0.011], fenderPaint, { section: "box", bone: steer, caps: "flat" });

  // headlight
  sph(0.095, CHROME, steer, [0, 0.88, 0.58], [1, 1, 0.8]);
  glow(
    b.part(new THREE.CircleGeometry(0.072, 12), LAMP, { bone: steer, at: [0, 0.88, 0.653], dir: [0, 0, 1], axis: "z" }),
    1.8,
  );
  b.part(new THREE.TorusGeometry(0.082, 0.011, 6, 16), BLACK, {
    bone: steer,
    at: [0, 0.88, 0.65],
    dir: [0, 0, 1],
    axis: "z",
  });
  box(0.07, 0.02, 0.04, ORANGE, steer, [0, 0.968, 0.58]);

  // handlebars
  for (const s of [1, -1]) {
    const pts: V[] = [
      [0, 1.085, 0.2],
      [s * 0.14, 1.1, 0.19],
      [s * 0.32, 1.17, 0.2],
      [s * 0.4, 1.235, 0.27],
    ];
    b.sweep(catmull(pts), 0.014, CHROME, { bone: steer, sides: 6 });
    rod([s * 0.4, 1.235, 0.27], [s * 0.47, 1.27, 0.35], 0.021, BLACK, steer);
    sph(0.022, ORANGE, steer, [s * 0.475, 1.272, 0.355]);
    rod([s * 0.4, 1.215, 0.3], [s * 0.43, 1.19, 0.41], 0.006, CHROME, steer);
    rod([s * 0.36, 1.2, 0.24], [s * 0.4, 1.38, 0.2], 0.006, CHROME, steer);
    sph(0.045, CHROME, steer, [s * 0.4, 1.4, 0.19], [1, 1, 0.25]);
    sph(0.035, "#8fb6d6", steer, [s * 0.4, 1.4, 0.175], [1, 1, 0.15]);
    rod([s * 0.08, 1.04, 0.2], [s * 0.1, 1.09, 0.2], 0.018, GRAPHITE, steer);
  }
  // speedo
  cyl(0.045, 0.045, 0.03, 10, BLACK, steer, [0, 1.1, 0.15], [-53, 0, 0]);
  glow(
    b.part(new THREE.CircleGeometry(0.036, 10), EMBER, {
      bone: steer,
      at: [0, 1.115, 0.138],
      dir: [0, 0.6, -0.8],
      axis: "z",
    }),
    1.4,
  );

  // ---------------------------------------------------------------- frame
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 0.5, 0.12],
        [s * 0.11, 0.38, -0.1],
        [s * 0.14, 0.43, -0.35],
      ]),
      0.022,
      FRAMEC,
      { bone: body, sides: 6 },
    );
    rod([s * 0.08, 0.84, -0.42], [s * 0.12, 0.5, -0.33], 0.02, FRAMEC, body);
    rod([s * 0.09, 0.82, -0.4], [s * 0.1, 0.8, -0.98], 0.018, FRAMEC, body);
    rod([s * 0.1, 0.8, -0.98], [s * 0.1, 0.65, -1.1], 0.015, FRAMEC, body);
    // swingarm
    rod([s * 0.16, 0.45, -0.35], [s * 0.16, 0.355, -0.9], 0.027, STEEL, swing);
    cyl(0.04, 0.04, 0.03, 8, ORANGE, swing, [s * 0.175, 0.45, -0.35], [0, 0, 90]);
    cyl(0.032, 0.032, 0.03, 8, CHROME, swing, [s * 0.18, 0.355, -0.9], [0, 0, 90]);
    // shocks
    rod([s * 0.16, 0.44, -0.72], [s * 0.1, 0.78, -0.55], 0.012, BLACK, swing);
    rod([s * 0.152, 0.5, -0.69], [s * 0.115, 0.7, -0.59], 0.03, ORANGE, swing);
    // foot platform
    box(0.15, 0.025, 0.27, BLACK, body, [s * 0.2, 0.29, 0.46]);
    box(0.15, 0.012, 0.27, ORANGE, body, [s * 0.2, 0.305, 0.46]);
    rod([s * 0.1, 0.4, 0.26], [s * 0.16, 0.3, 0.4], 0.016, FRAMEC, body);
  }
  rod([0, 1.0, 0.3], [0, 0.84, -0.42], 0.03, FRAMEC, body);
  rod([0, 0.93, 0.33], [0, 0.5, 0.12], 0.032, FRAMEC, body);
  rod([0, 0.88, -0.42], [0, 0.4, -0.3], 0.025, FRAMEC, body);

  // ---------------------------------------------------------------- tank, seat, fender
  const tank = b.loft(
    [
      { at: [0, 1.0, 0.2], w: 0.2, h: 0.2 },
      { at: [0, 1.04, 0.0], w: 0.3, h: 0.26 },
      { at: [0, 1.0, -0.2], w: 0.26, h: 0.2 },
      { at: [0, 0.94, -0.32], w: 0.1, h: 0.1 },
    ],
    { bone: body, color: tankPaint, sides: 10 },
  );
  for (const s of [1, -1])
    b.decal(tank, BOLT, { at: [s * 0.15, 1.03, 0.0], dir: [s, 0, 0], size: [0.24, 0.17], mirror: s < 0 });
  cyl(0.04, 0.04, 0.03, 10, CHROME, body, [0.0, 1.17, -0.08]);
  cyl(0.022, 0.022, 0.035, 8, ORANGE, body, [0.0, 1.175, -0.08]);

  b.loft(
    [
      { at: [0, 0.9, -0.3], w: 0.2, h: 0.07 },
      { at: [0, 0.89, -0.55], w: 0.3, h: 0.08 },
      { at: [0, 0.91, -0.85], w: 0.24, h: 0.07 },
    ],
    { bone: body, color: seatPaint, sides: 8 },
  );
  b.sweep(
    catmull([
      [0, 0.8, -0.55],
      [0, 0.8, -0.85],
      [0, 0.72, -1.1],
      [0, 0.58, -1.2],
    ]),
    () => [0.11, 0.012],
    fenderPaint,
    { section: "box", bone: body, caps: "flat" },
  );
  glow(box(0.12, 0.035, 0.03, RED, body, [0, 0.6, -1.215]), 1.6);
  box(0.17, 0.11, 0.01, BLACK, body, [0, 0.5, -1.28]);
  b.part(new THREE.PlaneGeometry(0.15, 0.075), "#ffffff", {
    bone: body,
    at: [0, 0.5, -1.288],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
  });
  // sissy bar
  b.sweep(
    catmull([
      [0.1, 0.82, -0.72],
      [0.1, 1.1, -0.8],
      [-0.1, 1.1, -0.8],
      [-0.1, 0.82, -0.72],
    ]),
    0.014,
    CHROME,
    { bone: body, sides: 6 },
  );
  box(0.22, 0.12, 0.03, LEATHER, body, [0, 1.06, -0.82], [-8, 0, 0]);

  // ---------------------------------------------------------------- engine
  const C: V = [0, 0.5, 0.02];
  box(0.2, 0.2, 0.3, GRAPHITE, body, C);
  box(0.22, 0.26, 0.26, GRAPHITE, body, [0, 0.5, -0.2]);
  box(0.16, 0.08, 0.2, STEEL, body, [0, 0.36, -0.05]);
  for (const q of [1, -1]) {
    const th = q * 38;
    const rad = (th * Math.PI) / 180;
    const d: V = [0, Math.cos(rad), Math.sin(rad)];
    const at = (k: number): V => [0, C[1] + d[1] * k, C[2] + d[2] * k];
    for (let i = 0; i < 7; i++) cyl(0.088, 0.088, 0.013, 10, STEEL, body, at(0.1 + i * 0.03), [th, 0, 0]);
    cyl(0.062, 0.062, 0.26, 8, GRAPHITE, body, at(0.2), [th, 0, 0]);
    box(0.16, 0.07, 0.15, ORANGE, body, at(0.34), [th, 0, 0]);
    box(0.17, 0.012, 0.16, CHROME, body, at(0.38), [th, 0, 0]);
    cyl(0.008, 0.008, 0.06, 5, WHITE, body, at(0.42), [th, 0, 0]);
  }
  for (const s of [1, -1]) {
    cyl(0.09, 0.09, 0.03, 12, CHROME, body, [s * 0.112, C[1], C[2]], [0, 0, 90]);
    cyl(0.05, 0.05, 0.036, 10, ORANGE, body, [s * 0.114, C[1], C[2]], [0, 0, 90]);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      sph(0.008, CHROME, body, [s * 0.13, C[1] + Math.cos(a) * 0.07, C[2] + Math.sin(a) * 0.07]);
    }
  }
  // oil tank, air cleaner, carb
  box(0.1, 0.26, 0.18, BLACK, body, [-0.14, 0.58, -0.42]);
  box(0.102, 0.03, 0.182, ORANGE, body, [-0.14, 0.7, -0.42]);
  cyl(0.09, 0.09, 0.1, 12, CHROME, body, [0.2, 0.62, 0.1], [0, 0, 90]);
  cyl(0.06, 0.06, 0.012, 10, ORANGE, body, [0.255, 0.62, 0.1], [0, 0, 90]);
  rod([0.15, 0.63, 0.1], [0.05, 0.67, 0.17], 0.02, CHROME, body);
  // battery / electronics box
  box(0.1, 0.14, 0.16, GRAPHITE, body, [0.14, 0.58, -0.45]);
  glow(box(0.004, 0.02, 0.1, EMBER, body, [0.192, 0.6, -0.45]), 1.4);

  // belt drive (left)
  cyl(0.06, 0.06, 0.022, 10, STEEL, body, [0.12, 0.5, -0.2], [0, 0, 90]);
  rod([0.12, 0.56, -0.2], [0.12, 0.465, -0.9], 0.008, BLACK, body);
  rod([0.12, 0.44, -0.2], [0.12, 0.245, -0.9], 0.008, BLACK, body);

  // exhaust
  for (const s of [1, -1]) {
    const pipe = catmull([
      [s * 0.06, 0.64, 0.31],
      [s * 0.14, 0.54, 0.36],
      [s * 0.27, 0.4, 0.3],
      [s * 0.27, 0.34, 0.0],
      [s * 0.27, 0.34, -0.45],
      [s * 0.26, 0.37, -0.95],
      [s * 0.26, 0.39, -1.2],
    ]);
    b.sweep(pipe, [0.032, 0.045], CHROME, {
      bone: body,
      sides: 8,
      bands: [
        [0.55, CHROME],
        [0.75, BRASS],
        [1, CHROME],
      ],
    });
    b.sweep(pipe, 0.052, STEEL, { bone: body, sides: 8, from: 0.45, to: 0.82, caps: "flat" });
    cyl(0.048, 0.04, 0.03, 8, BLACK, body, [s * 0.26, 0.39, -1.225], [90, 0, 0]);
    for (const t of [0.5, 0.64, 0.78]) {
      const at = pipe.at(t);
      cyl(0.056, 0.056, 0.012, 8, ORANGE, body, [at.x, at.y, at.z], [90, 0, 0]);
    }
  }

  // kickstand (stowed)
  rod([0.17, 0.3, -0.15], [0.3, 0.22, -0.42], 0.014, STEEL, kick);
  box(0.05, 0.015, 0.05, BLACK, kick, [0.3, 0.215, -0.43]);

  return b.root;
}
