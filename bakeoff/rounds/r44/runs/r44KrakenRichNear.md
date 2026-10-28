```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A heroic, polished kraken: purple mantle with pink underside, glowing teal runes, big yellow eyes, a horn beak and eight spread tentacles with suckers.",
};

const PURPLE = "#6a4bc4";
const PURPLE_D = "#3b2a86";
const PINK = "#f6b8dc";
const TEAL = "#37f0d6";
const ORANGE = "#ff8a2a";
const HORN = "#f4e7c4";
const HORN_D = "#b99a62";
const SUCK = "#ffd3ea";

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const R = rng(5);

  const root = b.joint("mantle", { at: [0, 1.2, 0], dir: [0, 1, 0], role: "spine" });
  const jaw = b.joint("jaw", { parent: root, at: [0, 0.95, 0.6], dir: [0, 0, 1], role: "jaw" });

  const hide = countershade(mottle(PURPLE, PURPLE_D, { size: 0.35, seed: 2 }), PINK, { level: -0.45, soft: 0.2 });

  // Mantle
  const mantle = b.loft(
    [
      { at: [0, 1.0, 0.15], w: 1.3, h: 1.1 },
      { at: [0, 1.5, 0.0], w: 1.75, h: 1.55 },
      { at: [0, 2.1, -0.2], w: 1.65, h: 1.55 },
      { at: [0, 2.7, -0.5], w: 1.05, h: 1.05 },
      { at: [0, 3.15, -0.72], w: 0.3, h: 0.3 },
    ],
    { bone: root, color: hide, sides: 12 },
  );
  const skin = b.surface(mantle);

  // Glowing runes on the mantle
  for (const h of skin.scatter(16, { rng: R, minDist: 0.35, filter: (h) => h.n.y > 0.1 && h.at.y > 1.7 })) {
    glow(b.stick(new THREE.OctahedronGeometry(0.07, 0), TEAL, h, { embed: 0.2, scale: [1, 1.6, 1] }), 1.3);
  }

  // Crest plates
  for (let i = 0; i < 3; i++) {
    const h = 0.55 - i * 0.1;
    b.extrude(
      [[0.18, 0], [0.05, h * 0.6], [-0.2, h, "sharp"], [-0.25, 0]],
      {
        at: [0, 2.55 + i * 0.22, -0.55 - i * 0.2],
        x: [0, -0.3, -1],
        y: [0, 1, -0.3],
        thickness: [0.1, 0.03],
        bevel: 0.01,
        smoothing: 1,
        color: i % 2 ? ORANGE : HORN,
        bone: root,
      },
    );
  }

  // Side fins
  for (const s of [1, -1]) {
    b.extrude(
      [[0, -0.25], [0.7, -0.5, "sharp"], [0.9, 0.1], [0.55, 0.55, "sharp"], [0, 0.35]],
      {
        at: [s * 0.75, 2.2, -0.35],
        x: [s, 0.2, -0.2],
        y: [0, 1, 0],
        thickness: 0.07,
        bevel: 0.015,
        smoothing: 1,
        color: paintFin(s),
        bone: root,
      },
    );
  }

  // Eyes
  const EYE = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="100" fill="#f4f0e6"/>
      <circle cx="100" cy="50" r="38" fill="#2a1a4a"/>
      <circle cx="100" cy="50" r="33" fill="#ffd23a"/>
      <circle cx="100" cy="50" r="22" fill="#ff9a1e"/>
      <ellipse cx="100" cy="50" rx="7" ry="26" fill="#140a24"/>
      <circle cx="86" cy="36" r="9" fill="#fff"/>
      <circle cx="113" cy="66" r="4" fill="#fff"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.27, 14, 10), "#ffffff", {
      bone: root,
      at: [s * 0.52, 1.6, 0.58],
      rotation: [0, -90 + s * 28, 0],
      texture: EYE,
    });
    // heavy brow
    b.rod([s * 0.2, 1.98, 0.62], [s * 0.78, 1.8, 0.45], [0.09, 0.07], { bone: root, color: PURPLE_D, sides: 6 });
  }

  // Beak
  b.spike([0, 1.12, 0.6], [0, -0.45, 1], 0.45, 0.22, { bone: root, color: HORN, sides: 6 });
  b.spike([0, 1.0, 0.6], [0, -0.1, 1], 0.1, 0.01, { bone: root, color: HORN_D, sides: 4 });
  b.spike([0, 0.92, 0.62], [0, -0.1, 1], 0.38, 0.15, { bone: jaw, color: HORN_D, sides: 6 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  // Tentacles
  const base = [
    [0.5, 1.05],
    [1.0, 0.55],
    [1.65, 0.17],
    [2.25, 0.14],
    [2.75, 0.35],
    [3.0, 0.85],
  ];
  const radii = [0.32, 0.26, 0.18, 0.12, 0.07, 0.025];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * 45 * Math.PI) / 180;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const k = i % 2 ? 0.88 : 1.08;
    const pts = base.map(([d, y], j) => {
      const sway = j > 2 ? 0.18 * (i % 2 ? 1 : -1) * (j - 2) : 0;
      return [sx * d * k + sz * sway, y, sz * d * k - sx * sway];
    });
    const ch = b.chain(`tent${i}_`, catmull(pts), { parent: root, count: 6, role: "tentacle" });
    const sw = b.sweep(ch, radii, {
      color: hide,
      sectors: [[130, 230, PINK]],
      sides: 8,
    });
    for (let t = 0.2; t < 0.92; t += 0.075) {
      const r = radii[0] * (1 - t) + 0.03;
      const h = sw.at(t, 180);
      b.stick(new THREE.CylinderGeometry(r * 0.38, r * 0.45, 0.04, 7), SUCK, h, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.045, 6), PURPLE_D, h, { embed: 0.15 });
    }
    const tip = sw.at(0.94, 0);
    glow(b.stick(new THREE.SphereGeometry(0.05, 6, 4), TEAL, tip, { embed: 0.2 }), 1.2);
  }

  return b.root;
}

function paintFin(s: number) {
  return s > 0 ? ORANGE : ORANGE;
}
```