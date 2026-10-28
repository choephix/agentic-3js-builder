```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, countershade, spots, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description: "A stylized, Overwatch-flavoured kraken surfacing with eight spread tentacles, glowing spots and a beaked jaw.",
};

const PURPLE = "#6a3fb0";
const PINK = "#f5b4d2";
const TEAL = "#4ff0d6";
const HORN = "#2b1a3c";
const SUCK = "#ffd0e4";

const EYE = svg(
  `<svg viewBox="0 0 200 100"><rect width="200" height="100" fill="#fff0b8"/>
  <circle cx="100" cy="50" r="30" fill="#ff9a1c" stroke="#3a1a10" stroke-width="4"/>
  <circle cx="100" cy="66" r="18" fill="#ffd24a" opacity="0.6"/>
  <ellipse cx="100" cy="50" rx="8" ry="24" fill="#1a0a1c"/>
  <circle cx="90" cy="38" r="6" fill="#fff"/><circle cx="108" cy="62" r="3" fill="#fff"/></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const R = rng(5);
  const SKIN = countershade(spots(PURPLE, TEAL, { size: 0.22, amount: 0.25, seed: 3 }), PINK, { level: -0.3 });

  const body = b.joint("body", { at: [0, 1.6, 0] });
  const head = b.joint("head", { parent: body, at: [0, 1.9, 0.1], dir: [0, 0, 1], role: "head" });

  // head
  b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, { bone: head, at: [0, 1.9, 0.2], scale: [0.9, 0.8, 0.9] });

  // mantle
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 2.1, -0.1],
      [0, 2.7, -0.35],
      [0, 3.3, -0.8],
    ]),
    { parent: body, role: "spine" },
  );
  const msw = b.sweep(mantle, (t) => 0.8 * (1 - 0.9 * t * t), { color: SKIN });

  // fins
  const fin = [
    [0, 0],
    [0.5, 0.1],
    [0.85, 0.55, "sharp"],
    [0.4, 0.75],
    [0, 0.5],
  ] as any;
  for (const s of [1, -1])
    b.extrude(fin, {
      at: [s * 0.55, 2.55, -0.3],
      x: [s, 0, -0.2],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.01,
      smoothing: 1,
      color: PINK,
      bone: mantle.joints[1],
    });

  // glowing back spots
  const hits = b.surface(msw).scatter(14, { rng: R, minDist: 0.3, filter: (h) => h.n.y > 0.1 });
  for (const h of hits) glow(b.stick(new THREE.SphereGeometry(0.06, 6, 4), TEAL, h, { embed: 0.4 }), 1.6);

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.26, 12, 8), "#ffffff", {
      bone: head,
      at: [s * 0.5, 2.0, 0.62],
      rotation: [0, -90, 0],
      texture: EYE,
    });
    b.capsule([s * 0.2, 2.33, 0.72], [s * 0.82, 2.22, 0.55], 0.07, HORN, { bone: head });
  }

  // jaw and beak
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.32, 0.6], aim: [0, 1.3, 1.0], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.22, 0.4, 7), HORN, { bone: head, at: [0, 1.45, 0.82], dir: [0, -0.45, 1] });
  b.part(new THREE.ConeGeometry(0.17, 0.32, 7), "#4a2a5c", { bone: jaw, at: [0, 1.25, 0.82], dir: [0, 0.35, 1] });

  // tentacles
  for (let i = 0; i < 8; i++) {
    const a = ((i * 45 + 22.5) * Math.PI) / 180;
    const d = [Math.sin(a), Math.cos(a)];
    const pe = [Math.cos(a), -Math.sin(a)];
    const h = i % 2 ? 0.3 : 0;
    const P = (r: number, y: number, side = 0) => [d[0] * r + pe[0] * side, y, d[1] * r + pe[1] * side];
    const sg = i % 2 ? 1 : -1;
    const ch = b.chain(
      `tent${i}_`,
      catmull([P(0.6, 1.3), P(1.2, 1.7 + h), P(2.0, 1.15 + h * 0.5, sg * 0.15), P(2.8, 0.5, sg * 0.3), P(3.5, 0.07, sg * 0.5), P(3.9, 0.04, sg * 0.9)]),
      { parent: body, role: "tentacle", count: 5 },
    );
    const sw = b.sweep(ch, [0.3, 0.25, 0.19, 0.12, 0.065, 0.03], { color: SKIN });
    for (let k = 1; k <= 8; k++) {
      const t = 0.08 + k * 0.1;
      for (const ang of [145, 215]) {
        const hit = sw.at(t, ang);
        b.stick(new THREE.CylinderGeometry(0.5, 0.6, 0.5, 7), SUCK, hit, { scale: hit.radius * 0.75, embed: 0.3 });
      }
    }
    for (let k = 0; k < 4; k++) {
      const hit = sw.at(0.12 + k * 0.17, 0);
      b.spike(hit, hit, 0.3 * hit.radius + 0.06, hit.radius * 0.25, { color: TEAL });
    }
  }

  return b.root;
}
```