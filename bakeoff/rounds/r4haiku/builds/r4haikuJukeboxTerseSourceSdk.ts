import * as THREE from "three";
import { cells, createBuilder, gradient, mix, paint, smoothstep, svg } from "../../../../src/index";
import type { Fill } from "../../../../src/index";

export const meta = {
  name: "Jukebox",
  description:
    "A 1950s jukebox: a cherry-lacquered arched cabinet on a chrome plinth, a glowing marquee, amber bubble tubes, a cream selector panel with coloured buttons, and a turntable behind glass with a record and tone arm.",
};

// Palette.
const CHROME = "#cdd4db";
const CREAM = "#f6ecd4";
const BUTTONS = ["#ffd23f", "#ff4d7d", "#3ec8d8", "#8be06a", "#ff9633", "#b98cff", "#fff4e0", "#ff7fbf"];

// Proportions in metres: about 0.86 wide, 1.55 tall, 0.62 deep. The cabinet is an arched front profile pushed into a
// slab whose depth tapers from the bottom to the top.
const BODY_BOTTOM = 0.09;
const BODY_TOP = 1.5; // apex of the arch
const ARCH_Y = 1.12; // where the arch springs from the sides
const HALF_WIDTH = 0.42;
const DEPTH_BOTTOM = 0.62;
const DEPTH_TOP = 0.5;
const BEVEL = 0.035;
const RECORD_Y = 0.95;
const GRILLE_Y = 0.29;

// The front face is the plane z = frontZ(y), leaning back by TILT degrees. Everything stuck to it uses the same lean.
const frontZ = (y: number) =>
  (DEPTH_BOTTOM + ((DEPTH_TOP - DEPTH_BOTTOM) * (y - BODY_BOTTOM)) / (BODY_TOP - BODY_BOTTOM)) / 2;
const SLOPE = (DEPTH_TOP - DEPTH_BOTTOM) / (2 * (BODY_TOP - BODY_BOTTOM));
const TILT = (Math.atan(SLOPE) * 180) / Math.PI;

// Paints: cherry lacquer with a cream pinstripe, amber bubbles, teal glass, a perforated speaker, a vinyl record.
const lacquer = gradient("#7a0c1b", "#e03a2c", [0, BODY_BOTTOM, 0], [0, BODY_TOP, 0]);
const cabinetPaint = paint((p, n) => (Math.abs(p.y - 0.475) < 0.0075 ? CREAM : lacquer.at(p, n)));

const bubbles = paint((p) => {
  const c = cells(p, 0.03, 5);
  return mix("#ff8a1f", "#fff0b8", smoothstep(0.34, 0.2, c.d1));
});

const glass = gradient("#082632", "#2f8fa3", [-0.22, 0.8, 0], [0.22, 1.1, 0]);

const speaker = paint((p) => {
  const c = cells(p, 0.014, 3);
  return mix("#2b2327", "#0b0a0c", smoothstep(0.3, 0.12, c.d1));
});

const vinyl = paint((p) => {
  const r = Math.hypot(p.x, p.y - RECORD_Y);
  if (r < 0.042) return r < 0.007 ? "#f7f3ea" : "#e8493b";
  const groove = 0.5 + 0.5 * Math.sin(r * 620);
  return mix("#121116", "#2c2a36", groove * 0.5);
});

export default function jukebox() {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });

  // Skeleton: the cabinet, the platter that spins the record, and the tone arm that pivots on the window frame.
  b.joint("cabinet", { at: [0, 0, 0] });
  b.joint("platter", { parent: "cabinet", at: [0, RECORD_Y, frontZ(RECORD_Y) + 0.03], dir: [0, 0, 1] });
  const pivot = [0.245, 1.05, frontZ(1.05) + 0.015] as const;
  const head = [0.11, 0.97, frontZ(RECORD_Y) + 0.045] as const;
  b.joint("toneArm", { parent: "cabinet", at: pivot, aim: head });

  /** A box on the front face, centred at (x, y); its front face stands `front` metres proud of the face. */
  const plate = (w: number, h: number, depth: number, color: Fill, x: number, y: number, front: number) =>
    b.part(new THREE.BoxGeometry(w, h, depth), color, {
      at: [x, y, frontZ(y) + front - depth / 2],
      rotation: [TILT, 0, 0],
      bone: "cabinet",
    });

  /** A round disc facing front, centred on the front face at (x, y); its front stands `front` metres proud. */
  const disc = (r: number, depth: number, color: Fill, x: number, y: number, front: number, bone = "cabinet") =>
    b.part(new THREE.CylinderGeometry(r, r, depth, b.segments(16)), color, {
      at: [x, y, frontZ(y) + front - depth / 2],
      rotation: [90 + TILT, 0, 0],
      bone,
    });

  // Cabinet: the arched front profile, pushed into a slab with rounded rims.
  const arch = Array.from({ length: 11 }, (_, k) => {
    const a = ((k + 1) * Math.PI) / 12;
    return [HALF_WIDTH * Math.cos(a), ARCH_Y + (BODY_TOP - ARCH_Y) * Math.sin(a)];
  });
  const cabinet = b.extrude(
    [[-HALF_WIDTH, BODY_BOTTOM], [HALF_WIDTH, BODY_BOTTOM], [HALF_WIDTH, ARCH_Y], ...arch, [-HALF_WIDTH, ARCH_Y]],
    {
      name: "cabinet",
      color: cabinetPaint,
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [DEPTH_BOTTOM, DEPTH_TOP],
      bevel: BEVEL,
      bone: "cabinet",
    },
  );

  // Chrome plinth, a little wider than the cabinet.
  b.extrude(
    [[-0.43, 0], [0.43, 0], [0.43, 0.1], [-0.43, 0.1]],
    { name: "plinth", color: CHROME, at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.68, bevel: 0.03, bone: "cabinet" },
  );

  // Chrome ball on the crown of the arch.
  b.part(new THREE.SphereGeometry(0.045, b.segments(14), b.segments(10)), CHROME, {
    name: "finial",
    at: [0, BODY_TOP, 0],
    bone: "cabinet",
  });

  // Chrome trim following the arch on the front.
  const trim = Array.from({ length: 19 }, (_, k) => {
    const a = (k * Math.PI) / 18;
    const y = ARCH_Y + 0.34 * Math.sin(a);
    return [0.37 * Math.cos(a), y, frontZ(y) + 0.004];
  });
  b.sweep(trim, { name: "arch.trim", radius: 0.011, color: CHROME, bone: "cabinet" });

  // Marquee: an SVG sign with bulbs, decaled onto the arch so it follows the curve.
  const bulbs = Array.from({ length: 13 }, (_, i) => {
    const x = (36 + (i * 408) / 12).toFixed(1);
    return `<circle cx="${x}" cy="16" r="6" fill="#fff3c8"/><circle cx="${x}" cy="134" r="6" fill="#fff3c8"/>`;
  }).join("");
  const sign = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 150">
  <rect x="4" y="4" width="472" height="142" rx="30" fill="#17123d"/>
  <rect x="16" y="16" width="448" height="118" rx="18" fill="none" stroke="#ffd23f" stroke-width="7"/>
  ${bulbs}
  <text x="240" y="100" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="84" textLength="392" lengthAdjust="spacingAndGlyphs" fill="#ff3d7f" stroke="#fff3c8" stroke-width="5" paint-order="stroke">JUKEBOX</text>
</svg>`,
    { size: 480 },
  );
  b.decal(cabinet, sign, {
    name: "marquee",
    at: [0, 1.27, frontZ(1.27)],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.48, 0.15],
  });

  // Speaker grille at the foot of the front, framed in chrome.
  plate(0.64, 0.025, 0.02, CHROME, 0, GRILLE_Y + 0.1375, 0.024);
  plate(0.64, 0.025, 0.02, CHROME, 0, GRILLE_Y - 0.1375, 0.024);
  plate(0.015, 0.25, 0.02, CHROME, -0.3125, GRILLE_Y, 0.024);
  plate(0.015, 0.25, 0.02, CHROME, 0.3125, GRILLE_Y, 0.024);
  plate(0.61, 0.25, 0.02, speaker, 0, GRILLE_Y, 0.018);

  // Bubble tubes: amber liquid with rising bubbles, a chrome collar at each end.
  for (const x of [-0.315, 0.315]) {
    const pt = (y: number) => [x, y, frontZ(y) - 0.01] as const;
    b.capsule(pt(0.56), pt(1.12), 0.05, { name: "bubbleTube", color: bubbles, bone: "cabinet" });
    for (const y of [0.56, 1.12])
      b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.022, b.segments(16)), CHROME, {
        at: [x, y, frontZ(y) - 0.01],
        bone: "cabinet",
      });
  }

  // Selector panel: cream face, chrome border, eight coloured buttons in two rows.
  plate(0.47, 0.23, 0.02, CHROME, 0, 0.62, 0.01);
  plate(0.44, 0.2, 0.02, CREAM, 0, 0.62, 0.014);
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 4; col++) {
      const x = -0.15 + col * 0.1;
      const y = row ? 0.66 : 0.58;
      disc(0.036, 0.012, CHROME, x, y, 0.02);
      disc(0.027, 0.02, BUTTONS[row * 4 + col], x, y, 0.028);
    }
  plate(0.46, 0.012, 0.02, CHROME, 0, 0.762, 0.016);

  // Turntable behind glass: a chrome frame, a teal window, a spinning record and its tone arm.
  plate(0.48, 0.34, 0.02, CHROME, 0, RECORD_Y, 0.01);
  plate(0.44, 0.3, 0.02, glass, 0, RECORD_Y, 0.014);
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.008, b.segments(40)), vinyl, {
    name: "record",
    at: [0, RECORD_Y, frontZ(RECORD_Y) + 0.034 - 0.004],
    rotation: [90 + TILT, 0, 0],
    bone: "platter",
  });
  disc(0.012, 0.024, CHROME, 0, RECORD_Y, 0.04, "platter");

  b.rod(pivot, head, 0.006, { name: "tonearm", color: CHROME, bone: "toneArm" });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, b.segments(14)), CHROME, {
    name: "tonearm.pivot",
    at: pivot,
    rotation: [90 + TILT, 0, 0],
    bone: "toneArm",
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.022), CHROME, {
    name: "tonearm.head",
    at: head,
    bone: "toneArm",
  });

  return b.root;
}
