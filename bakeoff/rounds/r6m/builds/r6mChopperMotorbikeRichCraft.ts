import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  rgb,
  smoothstep,
  noise,
  cells,
  stripes,
  svg,
  arc,
  catmull,
  polyline,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hardlight Chopper",
  description:
    "Overwatch-style custom chopper: long raked fork, ape-hanger bars, orange tank with 76 roundel, V-twin with glowing reactor covers, teal hard-light accents, on a staged hex pad with props.",
};

type V = [number, number, number];

// Palette
const ORANGE = "#f2741c";
const ORANGE_D = "#c4500f";
const NAVY = "#27304a";
const NAVY_D = "#171c2e";
const WHITE = "#f3efe4";
const TEAL = "#3de6ff";
const YELLOW = "#ffc41f";
const BLACK = "#14161d";
const RED = "#ff3a3a";
const LEATHER = "#3a2a2a";

// Paints: warm on top, cool below
const tone = (c: string) =>
  paint((p, n) => {
    const up = n.y * 0.5 + 0.5;
    const base = mix(c, "#1a2a66", 0.26 * (1 - up));
    return mix(base, "#fff1cf", 0.2 * smoothstep(0.4, 1, up) + 0.05 * noise(p, 0.1, 4));
  });
const CHROME = paint((p, n) =>
  mix("#4d566e", "#eef4ff", smoothstep(-0.5, 0.9, n.y) * 0.8 + 0.2 * noise(p, 0.05, 3)),
);
const STEEL = paint((p, n) => mix("#55607a", "#b8c4dc", smoothstep(-0.4, 0.9, n.y) * 0.8 + 0.2 * noise(p, 0.07, 8)));
const ORANGE_P = tone(ORANGE);
const NAVY_P = tone(NAVY);
const DARK_P = tone("#262a38");
const TANK_P = paint((p, n) => {
  if (Math.abs(p.x) < 0.022 && n.y > 0.2) return WHITE;
  if (Math.abs(p.x) < 0.034 && n.y > 0.2) return NAVY_D;
  return tone(ORANGE).at(p, n);
});
const TIRE_P = paint((p, n, s) => {
  const lug = Math.floor(s[1] / 11) % 2 === 0;
  const tread = Math.abs(n.x) < 0.75;
  if (tread && lug) return "#0d0e13";
  return tread ? "#252833" : "#1b1d26";
});

// Textures
const WHEEL_TEX = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#1d2130"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#f2741c" stroke-width="5"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#0c0e16" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5]
    .map(
      (i) =>
        `<g transform="rotate(${i * 60} 50 50)"><path d="M50 50 L40 14 Q50 8 60 14 Z" fill="#c9d4ea" stroke="#0c0e16" stroke-width="2"/><path d="M50 40 L46 20 L54 20 Z" fill="#8895b3"/></g>`,
    )
    .join("")}
  <circle cx="50" cy="50" r="13" fill="#27304a" stroke="#0c0e16" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="6" fill="#f2741c"/>
</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#171c2e"/>
  <circle cx="50" cy="50" r="39" fill="#f3efe4"/>
  <circle cx="50" cy="50" r="39" fill="none" stroke="#27304a" stroke-width="3"/>
  <path d="M18 62 L50 22 L82 62 L70 62 L50 38 L30 62 Z" fill="#f2741c" stroke="#171c2e" stroke-width="3" stroke-linejoin="round"/>
  <text x="50" y="82" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-style="italic" font-size="22" fill="#171c2e">76</text>
</svg>`,
  { size: 256 },
);
const PLATE_TEX = svg(
  `<svg viewBox="0 0 60 30">
  <rect x="1" y="1" width="58" height="28" rx="4" fill="#f3efe4" stroke="#171c2e" stroke-width="2"/>
  <rect x="4" y="4" width="52" height="5" fill="#f2741c"/>
  <text x="30" y="25" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="15" fill="#171c2e">OW-76</text>
</svg>`,
  { size: 192 },
);
const GAUGE_TEX = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#10131c"/>
  <path d="M20 74 A42 42 0 1 1 80 74" fill="none" stroke="#3de6ff" stroke-width="5"/>
  <path d="M68 28 A42 42 0 0 1 80 74" fill="none" stroke="#ff3a3a" stroke-width="5"/>
  ${Array.from({ length: 9 }, (_, i) => {
    const a = (-135 + i * 33.75) * (Math.PI / 180);
    return `<path d="M${50 + 34 * Math.sin(a)} ${50 - 34 * Math.cos(a)} L${50 + 40 * Math.sin(a)} ${50 - 40 * Math.cos(a)}" stroke="#f3efe4" stroke-width="3"/>`;
  }).join("")}
  <path d="M50 50 L66 30" stroke="#f2741c" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="6" fill="#f3efe4"/>
</svg>`,
  { size: 128 },
);
const CRATE_TEX = svg(
  `<svg viewBox="0 0 60 40">
  <rect width="60" height="40" fill="#b3202a"/>
  <rect x="2" y="2" width="56" height="36" fill="none" stroke="#f3efe4" stroke-width="2"/>
  <path d="M26 12 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6z" fill="#f3efe4"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "chopper" });

  const lp = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  const adv = (a: V, d: V, k: number): V => {
    const l = Math.hypot(...d);
    return [a[0] + (d[0] / l) * k, a[1] + (d[1] / l) * k, a[2] + (d[2] / l) * k];
  };

  // ---------- Skeleton
  const HEAD: V = [0, 0.92, 0.52];
  const AXF: V = [0, 0.37, 1.2];
  const AXR: V = [0, 0.4, -0.9];
  const frameJ = b.joint("frame", { at: [0, 0.6, 0], group: "frame" });
  const forkJ = b.joint("fork", { parent: frameJ, at: HEAD, aim: AXF, group: "fork" });
  const wheelF = b.joint("wheelF", { parent: forkJ, at: AXF, dir: [1, 0, 0], group: "wheel" });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: AXR, dir: [1, 0, 0], group: "wheel" });
  const fp = (t: number, x: number): V => [x, HEAD[1] + (AXF[1] - HEAD[1]) * t, HEAD[2] + (AXF[2] - HEAD[2]) * t];

  const part = (g: THREE.BufferGeometry, c: any, at: V, bone: any, dir?: V, extra: any = {}) =>
    b.part(g, c, { bone, at, ...(dir ? { dir } : {}), ...extra });

  // ---------- Wheels
  function wheel(joint: any, c: V, R: number, w: number) {
    b.lathe(
      [
        [0.2, -w],
        [R - 0.05, -w],
        [R - 0.015, -w * 0.7],
        [R, -w * 0.3],
        [R, w * 0.3],
        [R - 0.015, w * 0.7],
        [R - 0.05, w],
        [0.2, w],
      ],
      { at: c, axis: [1, 0, 0], bone: joint, segments: 20, color: TIRE_P },
    );
    for (const s of [1, -1]) {
      b.part(new THREE.CircleGeometry(R - 0.06, 20), "#ffffff", {
        bone: joint,
        at: [c[0] + s * (w + 0.003), c[1], c[2]],
        dir: [s, 0, 0],
        axis: "z",
        texture: WHEEL_TEX,
      });
      glow(
        b.lathe(
          [
            [R - 0.118, 0],
            [R - 0.098, 0],
            [R - 0.098, 0.006],
            [R - 0.118, 0.006],
          ],
          { at: [c[0] + s * (w + 0.004), c[1], c[2]], axis: [1, 0, 0], bone: joint, segments: 20, color: TEAL },
        ),
        1.4,
      );
      // axle nut
      part(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), CHROME, [c[0] + s * (w + 0.03), c[1], c[2]], joint, [1, 0, 0]);
    }
    part(new THREE.CylinderGeometry(0.03, 0.03, 2 * w + 0.12, 8), STEEL, c, joint, [1, 0, 0]);
  }
  wheel(wheelF, AXF, 0.37, 0.05);
  wheel(wheelR, AXR, 0.4, 0.13);

  // brake disc + caliper on front wheel
  part(new THREE.CylinderGeometry(0.16, 0.16, 0.01, 16), STEEL, [AXF[0] - 0.075, AXF[1], AXF[2]], wheelF, [1, 0, 0]);
  part(new THREE.BoxGeometry(0.04, 0.08, 0.06), ORANGE_P, [-0.09, AXF[1] + 0.13, AXF[2] + 0.03], forkJ);
  // rear sprocket
  part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 14), STEEL, [0.2, AXR[1], AXR[2]], wheelR, [1, 0, 0]);
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 8), ORANGE_P, [0.215, AXR[1], AXR[2]], wheelR, [1, 0, 0]);

  // ---------- Fork
  part(new THREE.BoxGeometry(0.28, 0.04, 0.08), NAVY_P, fp(-0.02, 0), forkJ);
  b.rod(fp(-0.12, 0), fp(0.1, 0), 0.05, NAVY_P, { bone: frameJ });
  for (const s of [1, -1]) {
    b.rod(fp(-0.08, s * 0.1), fp(0.45, s * 0.1), 0.036, NAVY_P, { bone: forkJ });
    b.rod(fp(0.4, s * 0.1), fp(1.0, s * 0.1), 0.025, CHROME, { bone: forkJ });
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), ORANGE_P, fp(0.46, s * 0.1), forkJ, [0, 1, 0]);
    glow(
      part(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 8), TEAL, fp(0.7, s * 0.1), forkJ, [0, -0.55, 0.68]),
      1.4,
    );
    part(new THREE.BoxGeometry(0.03, 0.07, 0.08), STEEL, AXF.map((v, i) => (i === 0 ? s * 0.09 : v)) as V, forkJ);
    // headlamp mount bolts
    b.rod(fp(0.5, s * 0.1), fp(0.5, s * 0.06), 0.012, CHROME, { bone: forkJ });
  }

  // Headlamp
  const HL = fp(0.5, 0);
  b.lathe(
    [
      [0, -0.09],
      [0.07, -0.09],
      [0.088, -0.04],
      [0.088, 0.05],
      [0.078, 0.085],
      [0, 0.085],
    ],
    { at: HL, axis: [0, 0, 1], bone: forkJ, segments: 10, color: tone(ORANGE_D) },
  );
  b.lathe(
    [
      [0.058, 0.08],
      [0.08, 0.08],
      [0.08, 0.095],
      [0.058, 0.095],
    ],
    { at: HL, axis: [0, 0, 1], bone: forkJ, segments: 10, color: CHROME },
  );
  glow(part(new THREE.SphereGeometry(0.062, 8, 6), "#fff6d6", [HL[0], HL[1], HL[2] + 0.09], forkJ, undefined, { scale: [1, 1, 0.5] }), 1.8);

  // Handlebars (ape hangers)
  for (const s of [1, -1]) {
    const pts: V[] = [
      [s * 0.07, 1.02, 0.44],
      [s * 0.14, 1.14, 0.41],
      [s * 0.28, 1.3, 0.36],
      [s * 0.38, 1.36, 0.28],
      [s * 0.43, 1.33, 0.16],
    ];
    b.sweep(catmull(pts), 0.014, { bone: forkJ, color: CHROME, sides: 6 });
    b.rod(lp(pts[3], pts[4], 0.15), pts[4], 0.024, BLACK, { bone: forkJ });
    part(new THREE.SphereGeometry(0.026, 6, 4), CHROME, pts[4], forkJ);
    // brake lever
    b.rod([s * 0.36, 1.35, 0.3], [s * 0.34, 1.3, 0.4], 0.007, CHROME, { bone: forkJ });
    // mirror
    b.rod([s * 0.3, 1.31, 0.35], [s * 0.34, 1.5, 0.3], 0.007, CHROME, { bone: forkJ });
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), CHROME, [s * 0.34, 1.52, 0.3], forkJ, [0, 0.3, -1]);
  }
  // gauge
  part(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 10), CHROME, [0, 1.07, 0.42], forkJ, [0, 0.5, -1]);
  b.part(new THREE.CircleGeometry(0.046, 12), "#ffffff", {
    bone: forkJ,
    at: [0, 1.083, 0.4],
    dir: [0, 0.5, -1],
    axis: "z",
    texture: GAUGE_TEX,
  });

  // ---------- Frame
  const rails = (x: number) => ({
    low: [
      [x, 0.44, 0.38],
      [x, 0.4, -0.1],
      [x * 1.2, 0.4, -0.9],
    ] as V[],
  });
  b.rod([0, 0.88, 0.52], [0, 0.88, 0.0], 0.03, NAVY_P, { bone: frameJ });
  b.rod([0, 0.82, 0.58], [0, 0.5, 0.3], 0.036, NAVY_P, { bone: frameJ });
  for (const s of [1, -1]) {
    const r = rails(s * 0.11).low;
    b.sweep(catmull(r), 0.026, { bone: frameJ, color: NAVY_P, sides: 6 });
    b.rod([s * 0.1, 0.82, -0.3], [s * 0.13, 0.4, -0.9], 0.022, NAVY_P, { bone: frameJ });
    b.rod([s * 0.08, 0.84, 0.4], [s * 0.11, 0.44, 0.38], 0.022, NAVY_P, { bone: frameJ });
    part(new THREE.BoxGeometry(0.03, 0.12, 0.14), STEEL, [s * 0.14, 0.4, -0.9], frameJ);
    // footpegs
    b.rod([s * 0.12, 0.38, -0.05], [s * 0.26, 0.36, -0.05], 0.014, STEEL, { bone: frameJ });
    part(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), BLACK, [s * 0.3, 0.36, -0.05], frameJ, [1, 0, 0]);
  }
  // kickstand
  b.rod([0.14, 0.4, -0.2], [0.24, 0.05, -0.26], 0.014, STEEL, { bone: frameJ });
  part(new THREE.BoxGeometry(0.06, 0.012, 0.07), STEEL, [0.24, 0.045, -0.26], frameJ);

  // ---------- Engine (V-twin)
  const ENG = tone("#3a4258");
  part(new THREE.BoxGeometry(0.26, 0.3, 0.42), ENG, [0, 0.5, 0.05], frameJ);
  part(new THREE.BoxGeometry(0.22, 0.12, 0.3), STEEL, [0, 0.32, 0.07], frameJ);
  for (const [base, dir] of [
    [[0, 0.56, 0.16], [0, 1, 0.55]],
    [[0, 0.56, -0.08], [0, 1, -0.55]],
  ] as [V, V][]) {
    part(new THREE.CylinderGeometry(0.07, 0.075, 0.32, 8), ENG, adv(base, dir, 0.16), frameJ, dir);
    for (let k = 0; k < 6; k++)
      part(new THREE.CylinderGeometry(0.105, 0.105, 0.014, 8), STEEL, adv(base, dir, 0.07 + k * 0.045), frameJ, dir);
    part(new THREE.CylinderGeometry(0.09, 0.08, 0.1, 8), ORANGE_P, adv(base, dir, 0.37), frameJ, dir);
    part(new THREE.SphereGeometry(0.06, 6, 4), CHROME, adv(base, dir, 0.44), frameJ);
  }
  // air cleaner
  part(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12), CHROME, [0.16, 0.78, 0.07], frameJ, [1, 0, 0]);
  glow(part(new THREE.CylinderGeometry(0.06, 0.06, 0.065, 8), TEAL, [0.165, 0.78, 0.07], frameJ, [1, 0, 0]), 1.3);
  b.rod([0.06, 0.74, 0.07], [0.14, 0.78, 0.07], 0.03, CHROME, { bone: frameJ });
  // reactor covers
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 12), ORANGE_P, [s * 0.14, 0.48, 0.08], frameJ, [s, 0, 0]);
    glow(part(new THREE.CylinderGeometry(0.048, 0.048, 0.04, 8), TEAL, [s * 0.15, 0.48, 0.08], frameJ, [s, 0, 0]), 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      part(
        new THREE.SphereGeometry(0.011, 5, 4),
        CHROME,
        [s * 0.158, 0.48 + Math.cos(a) * 0.075, 0.08 + Math.sin(a) * 0.075],
        frameJ,
      );
    }
  }
  // chain
  b.rod([0.2, 0.5, -0.1], [0.2, 0.5, -0.9], 0.006, BLACK, { bone: frameJ });
  b.rod([0.2, 0.4, -0.1], [0.2, 0.3, -0.9], 0.006, BLACK, { bone: frameJ });
  part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), STEEL, [0.2, 0.45, -0.1], frameJ, [1, 0, 0]);
  // underglow
  glow(part(new THREE.BoxGeometry(0.34, 0.014, 0.95), TEAL, [0, 0.255, 0.1], frameJ), 1.5);

  // ---------- Exhausts
  for (const s of [1, -1]) {
    const pipe = b.sweep(
      catmull([
        [s * 0.1, 0.62, 0.28],
        [s * 0.2, 0.5, 0.32],
        [s * 0.24, 0.38, 0.05],
        [s * 0.24, 0.36, -0.5],
        [s * 0.22, 0.42, -1.2],
      ]),
      [0.04, 0.055],
      { bone: frameJ, color: CHROME, sides: 8, caps: "flat" },
    );
    for (const t of [0.35, 0.55, 0.75]) {
      const at = pipe.at(t);
      b.stick(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), STEEL, at, { embed: 0.2 });
    }
    glow(part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), ORANGE, [s * 0.22, 0.42, -1.205], frameJ, [0, 0.1, -1]), 1.8);
  }

  // ---------- Tank
  const tank = b.loft(
    [
      { at: [0, 0.97, 0.5], w: 0.14, h: 0.14 },
      { at: [0, 1.01, 0.3], w: 0.3, h: 0.26 },
      { at: [0, 1.0, 0.05], w: 0.32, h: 0.26 },
      { at: [0, 0.97, -0.15], w: 0.18, h: 0.16 },
    ],
    { bone: frameJ, color: TANK_P },
  );
  for (const s of [1, -1]) {
    glow(b.sweep(tank.line(s * 62, 0.006), 0.007, { color: TEAL, bone: frameJ }), 1.5);
    const hit = b.surface(tank).around([0, 1.0, 0.2]).at(s * 90, 0);
    if (hit)
      b.decal(tank, EMBLEM, { at: hit, dir: [s, 0, 0], size: [0.19, 0.19], bone: frameJ });
  }
  part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), CHROME, [0, 1.13, 0.3], frameJ);
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 8), ORANGE_P, [0, 1.14, 0.3], frameJ);

  // ---------- Seat, sissy bar
  b.loft(
    [
      { at: [0, 0.93, -0.74], w: 0.24, h: 0.08 },
      { at: [0, 0.92, -0.45], w: 0.3, h: 0.1 },
      { at: [0, 0.93, -0.15], w: 0.26, h: 0.09 },
      { at: [0, 0.96, 0.0], w: 0.13, h: 0.07 },
    ],
    { bone: frameJ, color: tone(LEATHER) },
  );
  glow(b.sweep(polyline([[-0.15, 0.89, -0.72], [-0.17, 0.88, -0.45], [-0.14, 0.89, -0.15]]), 0.006, { bone: frameJ, color: TEAL }), 1.2);
  glow(b.sweep(polyline([[0.15, 0.89, -0.72], [0.17, 0.88, -0.45], [0.14, 0.89, -0.15]]), 0.006, { bone: frameJ, color: TEAL }), 1.2);
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.12, 0.88, -0.7], [s * 0.15, 1.05, -0.78], [s * 0.13, 1.28, -0.84]]), 0.013, {
      bone: frameJ,
      color: CHROME,
      sides: 6,
    });
  }
  b.extrude(
    [[-0.13, 0], [0.13, 0], [0.15, 0.2], [0.07, 0.25], [-0.07, 0.25], [-0.15, 0.2]],
    { at: [0, 1.04, -0.82], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.015, color: tone(LEATHER), bone: frameJ },
  );

  // ---------- Rear fender + lights
  b.sweep(arc([0, 0.4, -0.9], [0, 0.4, -1.36], [1, 0, 0], 105), () => [0.125, 0.012], {
    section: "box",
    caps: "flat",
    color: ORANGE_P,
    bone: frameJ,
  });
  glow(b.part(new THREE.BoxGeometry(0.1, 0.04, 0.02), RED, { bone: frameJ, at: [0, 0.4, -1.375] }), 1.8);
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", {
    bone: frameJ,
    at: [0, 0.31, -1.35],
    dir: [0, 0.25, -1],
    axis: "z",
    texture: PLATE_TEX,
  });
  // winglet fins
  for (const s of [1, -1])
    b.extrude(
      [[0, 0], [0.5, 0], [0.62, 0.08, "sharp"], [0.3, 0.34, "sharp"], [0.08, 0.26]],
      { at: [s * 0.19, 0.72, -1.12], x: [0, 0.1, 1], y: [s * 0.2, 1, 0], thickness: 0.018, color: ORANGE_P, bone: frameJ, smoothing: 0 },
    );

  // oil tank + battery
  part(new THREE.CylinderGeometry(0.075, 0.075, 0.38, 10), ORANGE_P, [0.17, 0.6, -0.42], frameJ, [0, 0, 1]);
  glow(part(new THREE.CylinderGeometry(0.078, 0.078, 0.02, 10), TEAL, [0.17, 0.6, -0.35], frameJ, [0, 0, 1]), 1.3);
  part(new THREE.BoxGeometry(0.12, 0.15, 0.3), NAVY_P, [-0.17, 0.6, -0.42], frameJ);
  part(new THREE.BoxGeometry(0.125, 0.02, 0.05), ORANGE_P, [-0.17, 0.62, -0.36], frameJ);

  // ---------- Base
  const BASE_H = 0.06;
  const hexPad = paint((p, n) => {
    if (n.y > 0.5) {
      const c = cells(p, 0.22, 11);
      const e = c.d2 - c.d1;
      if (e < 0.05) return "#1a6f86";
      return mix("#2a3148", "#3a4466", c.id * 0.6 + 0.2 * noise(p, 0.3, 2));
    }
    return p.y > -0.025 ? ORANGE : NAVY_D;
  });
  const outline: [number, number][] = [
    [-0.45, -1.8], [0.45, -1.8], [0.75, -1.5], [0.75, 1.75], [0.45, 2.05], [-0.45, 2.05], [-0.75, 1.75], [-0.75, -1.5],
  ];
  b.extrude(outline, {
    at: [0, -BASE_H / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: BASE_H,
    color: hexPad,
    bone: frameJ,
  });
  const rim: V[] = outline.map(([x, z]) => [x * 0.93, 0.004, z * 0.93]);
  glow(b.sweep(polyline(rim, { closed: true }), 0.008, { color: TEAL, bone: frameJ, sides: 4 }), 1.4);

  // props: drum
  part(new THREE.CylinderGeometry(0.15, 0.15, 0.38, 10), tone(NAVY), [-0.48, 0.19, -1.4], frameJ);
  part(
    new THREE.CylinderGeometry(0.153, 0.153, 0.1, 10),
    stripes(YELLOW, BLACK, { size: 0.05, axis: [1, 0, 1], width: 0.5, wobble: 0 }),
    [-0.48, 0.2, -1.4],
    frameJ,
  );
  part(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 10), STEEL, [-0.48, 0.39, -1.4], frameJ);
  part(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 10), STEEL, [-0.48, 0.01, -1.4], frameJ);
  // toolbox
  b.part(new THREE.BoxGeometry(0.3, 0.16, 0.18), "#ffffff", {
    bone: frameJ,
    at: [0.5, 0.08, -1.35],
    texture: CRATE_TEX,
  });
  b.rod([0.4, 0.17, -1.35], [0.6, 0.17, -1.35], 0.012, CHROME, { bone: frameJ });
  b.rod([0.5, 0.165, -1.2], [0.55, 0.02, -1.15], 0.012, STEEL, { bone: frameJ });
  // charging pylon
  b.lathe(
    [[0, 0], [0.16, 0], [0.16, 0.1], [0.1, 0.16], [0, 0.16]],
    { at: [0.52, 0, 1.45], axis: [0, 1, 0], segments: 6, bone: frameJ, color: NAVY_P },
  );
  glow(part(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 6), TEAL, [0.52, 0.166, 1.45], frameJ), 1.8);
  b.rod([0.52, 0.17, 1.45], [0.52, 0.6, 1.45], 0.012, TEAL, { bone: frameJ, caps: "flat" });
  for (const mesh of b.root.children.length ? [] : []) void mesh;
  part(new THREE.OctahedronGeometry(0.06), TEAL, [0.52, 0.68, 1.45], frameJ);

  b.root.position.y = BASE_H;
  return b.root;
}
