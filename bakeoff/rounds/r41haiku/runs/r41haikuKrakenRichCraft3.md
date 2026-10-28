This is a kraken rising from the sea, with eight tentacles spread outward and curling up. It uses a teal bell with stripes, a flat violet-to-pink gradient on the tentacles, drawn eyes and suckers.

```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, gradient, mottle, paint, rng, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "kraken",
  description: "A stylised kraken rising from the sea, eight tentacles spread and curling skyward.",
};

// Palette: bold, saturated, flat-ish colours with a light and a dark tone per material.
const TEAL = "#1ea3a8";
const DEEP = "#0c3a58";
const LIGHT = "#7ff0e0";
const VIOLET = "#4b2180";
const PINK = "#ff5fa2";
const INK = "#1a0f2e";
const SUCKER = "#f4ecff";
const GOLD = "#ffd23f";

// Scale: the mantle is about 1.6 m tall, the tentacles reach about 1.5 m out.
const H = 1.6;

// Eye drawing: a bright ringed iris with a vertical slit pupil and a hard highlight.
const EYE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="${INK}"/>
    <circle cx="50" cy="50" r="40" fill="${GOLD}"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#ff8a1c" stroke-width="6"/>
    <ellipse cx="50" cy="52" rx="10" ry="30" fill="#0b0f18"/>
    <ellipse cx="38" cy="34" rx="8" ry="6" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

// Bell radius along the mantle (t = 0 at the base, 1 at the top): a rounded, heavy head that tapers to a point.
const bell = (t: number) => 0.1 + 0.34 * Math.sin(Math.PI * Math.min(0.97, t * 0.85 + 0.1)) ** 0.7;

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const rand = rng(7);
  const jitter = (k: number) => (rand() - 0.5) * k;

  // Skeleton: a root joint at the base of the mantle, a chain up the bell, and eight tentacle chains off the root.
  const core = b.joint("core", { at: [0, 0.25, 0] });

  const bodyPaint = countershade(stripes(TEAL, LIGHT, { size: 0.22, axis: "y", width: 0.3 }), DEEP, { level: 0.1 });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.25, 0],
      [0, 0.7, 0.02],
      [0, 1.2, 0],
      [0, H - 0.05, -0.08],
    ]),
    { parent: core, count: 4, role: "spine" },
  );
  const mantleSweep = b.sweep(mantle, bell, { color: bodyPaint });

  // Eyes: two big drawn eyes on the front flanks of the bell, each seated on the surface.
  const skin = b.surface(mantleSweep);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 0.8, 0]).at(s * 50, 14);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.22, 0.22], mirror: s < 0 });
  }

  // Fins: swept, flat, violet-edged frills on each side of the bell.
  const finPaint = paint((_p, n) => (Math.abs(n.x) > 0.6 ? VIOLET : PINK));
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.3, 0.22],
        [0.2, 0.55, "sharp"],
        [-0.15, 0.35],
        [-0.2, 0.05],
      ],
      {
        at: [s * 0.44, 0.85, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: [0.03, 0.01],
        bevel: 0.006,
        smoothing: 1,
        color: finPaint,
      },
    );
  }

  // Tentacles: eight arms spreading from the base, each rising and curling at the tip.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    const lift = 0.9 + jitter(0.4);
    const pts = [
      [sa * 0.18, 0.22, ca * 0.18],
      [sa * 0.5, 0.13, ca * 0.5],
      [sa * 0.95, 0.09, ca * 0.95],
      [sa * (1.3 + jitter(0.2)), 0.2 + jitter(0.1), ca * (1.3 + jitter(0.2))],
      [sa * (1.45 + jitter(0.2)), 0.6 + jitter(0.1), ca * (1.45 + jitter(0.2))],
      [sa * (1.1 + jitter(0.2)), lift, ca * (1.1 + jitter(0.2))],
    ] as [number, number, number][];
    const arm = b.chain(`arm${i}`, catmull(pts), { parent: core, count: 5, role: "tentacle" });
    const tip = pts[pts.length - 1];
    const armPaint = gradient(VIOLET, PINK, pts[0], tip);
    const sweep = b.sweep(arm, (t: number) => 0.075 * (1 - t) ** 0.8 + 0.02, { color: armPaint });

    // Suckers: pale discs seated on the underside of the arm.
    const disc = new THREE.CylinderGeometry(0.022, 0.022, 0.008, 8);
    for (let k = 0; k < 5; k++) {
      const t = 0.22 + k * 0.13;
      const hit = sweep.at(t, k % 2 ? 150 : 210);
      b.stick(disc, SUCKER, hit, { embed: 0.3 });
    }
  }

  return b.root;
}
```