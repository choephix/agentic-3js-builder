```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, mottle, countershade, paint, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A towering Overwatch-style kraken: violet mantle with glowing cyan runes, amber slit eyes, an ivory beak, and eight spread tentacles with pink suckers and glowing tips.",
};

const VIOLET = "#6a3fb5";
const VIOLET_D = "#34206b";
const TEAL = "#2fd6c8";
const CYAN = "#5ff3ff";
const PINK = "#ffb0c8";
const IVORY = "#f4ead0";
const AMBER = "#ffb02e";
const GOLD = "#e9b640";
const DARK = "#120b24";

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ff9a1a"/>
    <circle cx="50" cy="50" r="38" fill="#ffd34a"/>
    <ellipse cx="50" cy="50" rx="9" ry="30" fill="#120b24"/>
    <circle cx="38" cy="36" r="7" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 1024 });
  const R = rng(5);
  const body = b.joint("body", { at: [0, 1.8, 0], role: "spine" });

  const skinPaint = countershade(mottle(VIOLET, "#7d52c9", { size: 0.35, seed: 2 }), mix(VIOLET, PINK, 0.35) as any, {
    level: -0.2,
  });
  const tentPaint = paint((p, n, s) => {
    if (n.y < -0.3) return mix(PINK, VIOLET, 0.35);
    return mix(VIOLET_D, VIOLET, smoothstep(0, 0.9, 1 - s[0]) * 0.9 + 0.1 * Math.sin(p.x * 3));
  });

  // mantle
  const mantle = b.loft(
    [
      { at: [0, 1.4, 0], w: 2.2, h: 2.0 },
      { at: [0, 2.3, -0.1], w: 2.8, h: 2.6 },
      { at: [0, 3.4, -0.4], w: 2.4, h: 2.4 },
      { at: [0, 4.4, -0.9], w: 1.4, h: 1.4 },
      { at: [0, 5.0, -1.2], w: 0.5, h: 0.5 },
    ],
    { bone: body, color: skinPaint, sides: 12 },
  );
  const skin = b.surface(mantle);

  // back ridge spikes
  for (let i = 0; i < 5; i++) {
    const y = 2.6 + i * 0.55;
    const z = -0.5 - i * 0.2 - (i > 2 ? 0.2 : 0);
    b.spike([0, y, z - 0.9 + i * 0.12], [0, 0.9, -0.7], 0.6 - i * 0.05, 0.16, { bone: body, color: IVORY, sides: 5 });
  }
  // glowing runes
  const runeGeo = new THREE.OctahedronGeometry(0.09, 0);
  for (const h of skin.scatter(18, { rng: rng(9), minDist: 0.5, filter: (h) => h.n.y > -0.1 && h.at.y > 2.2 }))
    glow(b.stick(runeGeo, CYAN, h, { embed: 0.2, scale: [1, 0.5, 1.4] }), 1.2);

  // eyes
  for (const s of [1, -1]) {
    const c: [number, number, number] = [s * 0.75, 2.55, 1.15];
    glow(b.part(new THREE.SphereGeometry(0.34, 8, 6), AMBER, { bone: body, at: c }), 0.6);
    glow(
      b.part(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", {
        bone: body,
        at: [c[0], c[1], c[2] + 0.31],
        dir: [s * 0.15, 0, 1],
        axis: "z",
        texture: EYE,
      }),
      0.8,
    );
    b.part(new THREE.SphereGeometry(1, 8, 5), VIOLET_D, {
      bone: body,
      at: [c[0], c[1] + 0.27, c[2] + 0.05],
      scale: [0.42, 0.18, 0.4],
      rotation: [0, 0, -s * 18],
    });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), GOLD, { bone: body, at: [s * 1.2, 3.0, 0.5], flat: true });
  }

  // beak
  b.spike([0, 1.85, 1.05], [0, -0.75, 0.75], 0.55, 0.3, { bone: body, color: IVORY, sides: 6 });
  b.spike([0, 1.5, 1.2], [0, 0.55, 0.85], 0.4, 0.22, { bone: body, color: IVORY, sides: 6 });
  b.part(new THREE.TorusGeometry(0.4, 0.07, 5, 10), GOLD, { bone: body, at: [0, 1.85, 0.95], rotation: [60, 0, 0] });

  // tentacles
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.4) * 45 * Math.PI) / 180;
    const P = (r: number, y: number): [number, number, number] => [Math.sin(a) * r, y, Math.cos(a) * r];
    const lift = i % 2 ? 0.5 : 0;
    const path = catmull([P(0.6, 1.6), P(1.7, 1.7 + lift), P(2.9, 1.5 + lift), P(3.9, 0.8), P(4.6, 0.07)]);
    const ch = b.chain(`tentacle${i + 1}`, path, { parent: body, role: "tentacle" });
    const sw = b.sweep(ch, (t) => 0.55 - 0.5 * t + 0.02, { color: tentPaint, sides: 8 });
    for (let k = 0; k < 9; k++) {
      const t = 0.14 + k * 0.08;
      const r = 0.11 - k * 0.008;
      b.stick(new THREE.CylinderGeometry(r, r * 1.1, 0.06, 6), PINK, sw.at(t, 180), { embed: 0.4 });
    }
    glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), CYAN, { bone: ch.joints[ch.joints.length - 1], at: path.at(0.985) }), 1.3);
    b.sweep(sw.line(0, 0.01).slice(0.05, 0.9), 0.03, { color: TEAL, sides: 4, bone: ch.joints[1] });
  }
  void R;
  void DARK;
  return b.root;
}
```