```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, paint, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "kraken",
  description:
    "A teal kraken rising from the deep: a big-eyed mantle with a violet band and crest, a navy beak, and eight violet tentacles spread wide and curling up at the tips, glowing suckers and a cyan collar, in a bold Overwatch-style palette.",
};

// Palette: bold flat colours, two-tone shading, one glowing accent colour.
const TEAL = "#1ab2b0";
const MINT = "#e6fbf2";
const VIOLET = "#5b3fd0";
const LILAC = "#d8cdfb";
const NAVY = "#1c2550";
const GOLD = "#ffc23a";
const CYAN = "#6ff3ff";

// Mantle: teal over mint, a violet band across its middle, a navy base under the skirt.
const mantleShade = countershade(TEAL, MINT, { level: -0.25, soft: 0.2 });
const MANTLE = paint((_p, _n, s) => (s[0] > 0.42 && s[0] < 0.5 ? VIOLET : s[0] < 0.05 ? NAVY : mantleShade));

// Tentacles: violet over lilac, with pale tips.
const tentShade = countershade(VIOLET, LILAC, { level: -0.2 });
const TENT = paint((_p, _n, s) => (s[0] > 0.86 ? LILAC : tentShade));

// Big gold eye with a slit pupil, a heavy navy lid and a hard highlight. Drawn once, placed twice.
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="iris" cx="0.5" cy="0.42" r="0.62">
        <stop offset="0" stop-color="#fff6c2"/>
        <stop offset="0.5" stop-color="${GOLD}"/>
        <stop offset="1" stop-color="#c2701a"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="49" fill="${NAVY}"/>
    <circle cx="50" cy="50" r="40" fill="url(#iris)"/>
    <ellipse cx="50" cy="52" rx="8" ry="33" fill="${NAVY}"/>
    <ellipse cx="38" cy="36" rx="6" ry="4" fill="#ffffff" transform="rotate(-25 38 36)"/>
    <circle cx="62" cy="66" r="2.5" fill="#ffffff"/>
    <path d="M0 42 Q50 12 100 42 L100 0 L0 0Z" fill="${NAVY}"/>
  </svg>`,
  { size: 256 },
);

// A bold downward chevron, drawn in grey so the decal's colour tints it.
const CHEVRON = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 28 L50 64 L88 28 L88 46 L50 82 L12 46Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const rand = rng(7);

  // Skeleton: a core at the base of the mantle, the mantle chain rising and leaning back, and eight tentacle chains.
  const core = b.joint("core", { at: [0, 0.7, 0], role: "spine" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.7, 0],
      [0, 1.4, 0.03],
      [0, 2.05, -0.12],
      [0, 2.5, -0.36],
    ]),
    { parent: core, role: "spine", names: ["mantleA", "mantleB", "mantleC"] },
  );

  // Mantle body: one smooth tube, fat in the middle, closing at the crown.
  const body = b.sweep(mantle, [0.46, 0.66, 0.7, 0.6, 0.42, 0.18], { color: MANTLE });

  // Beak: an upper and lower beak tucked under the mantle skirt, between the front tentacles.
  b.spike([0, 0.62, 0.16], [0, 0.3, 0.4], null, 0.11, { color: NAVY, bone: core });
  b.spike([0, 0.56, 0.2], [0, 0.36, 0.34], null, 0.08, { color: NAVY, bone: core });

  // Dorsal crest: navy spikes along the top of the mantle, tallest near the middle.
  for (const t of [0.22, 0.34, 0.46, 0.58, 0.7, 0.82]) {
    const f = body.at(t, 0);
    const len = 0.3 - Math.abs(t - 0.5) * 0.5;
    b.spike(f, f, len, 0.065, { color: NAVY });
  }

  // Face: the eyes and side chevrons are decals placed by the mantle's surface, facing outward.
  const skin = b.surface(body);
  const eyeCentre = mantle.at(0.5).at;
  const hitAt = (az: number, el: number) => {
    const hit = skin.around(eyeCentre).at(az, el);
    if (!hit) throw new Error(`kraken: no mantle surface at azimuth ${az}, elevation ${el}`);
    return hit;
  };
  for (const s of [1, -1]) {
    glow(b.decal(body, EYE, { at: hitAt(s * 52, 8), size: [0.34, 0.34] }), 1.3);
    glow(b.decal(body, CHEVRON, { at: hitAt(s * 96, -4), size: [0.3, 0.3], color: CYAN }), 1.1);
  }

  // Glowing collar round the mantle, a little out from the surface.
  const collar = b.ring(mantle.at(0.3), { count: 14, radius: 0.7 });
  glow(b.sweep(catmull(collar.items, { closed: true }), 0.022, { color: CYAN }), 1.2);

  // Eight tentacles, spread evenly round the base, each sweeping out along the floor and curling up at the tip.
  const sucker = new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8);
  const tipBead = new THREE.SphereGeometry(0.045, 8, 6);
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4 + (rand() - 0.5) * 0.16;
    const lift = 0.1 + rand() * 0.24;
    const swirl = i % 2 ? 1 : -1;
    // A point at radius r and height y, bent sideways by `lat` (along the tangent of the ring).
    const ring = (r: number, y: number, lat = 0) => [
      Math.sin(a) * r + Math.cos(a) * lat,
      y,
      Math.cos(a) * r - Math.sin(a) * lat,
    ];
    const arm = b.chain(
      `arm${i}`,
      catmull([
        ring(0.56, 0.5),
        ring(1.0, 0.14),
        ring(1.7, 0.09),
        ring(2.3, 0.2 + lift * 0.4, swirl * 0.16),
        ring(2.7, 0.55 + lift, swirl * 0.34),
        ring(2.5, 0.95 + lift, swirl * 0.2),
      ]),
      { parent: core, role: "tentacle", names: [`t${i}a`, `t${i}b`, `t${i}c`, `t${i}d`] },
    );
    const tube = b.sweep(arm, [0.2, 0.16, 0.08, 0.03], { color: TENT });

    // Glowing suckers in a row down the belly of each tentacle.
    for (let k = 0; k < 9; k++) {
      const t = 0.2 + (k / 8) * 0.6;
      glow(b.stick(sucker, CYAN, tube.at(t, 180), { embed: 0.3, flat: true }), 1.4);
    }
    // A gold bead on the tip.
    glow(b.stick(tipBead, GOLD, tube.at(1, 0), { embed: 0.35, flat: true }), 1.2);
  }

  return b.root;
}
```