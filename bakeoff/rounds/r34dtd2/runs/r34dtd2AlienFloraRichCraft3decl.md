```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, rng, paint, mix, noise, smoothstep, svg, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description: "Pandora-style glowing stalk plant with luminous fronds, bulbs and spore tufts.",
};

const CYAN = "#37f2e0";
const BLUE = "#2a7bff";
const PINK = "#ff5fd0";
const VIOLET = "#6b3fd0";
const DEEP = "#1b1450";

export default function build() {
  const b = createBuilder({ name: "alienPlant" });
  const rand = rng(11);

  const stalkPaint = paint((p, n) => {
    const t = noise(p, 0.12, 3);
    const base = mix(DEEP, VIOLET, smoothstep(0.1, 0.9, p.y / 1.3) * 0.6 + t * 0.4);
    const rim = smoothstep(0.55, 1, n.y);
    return mix(base, CYAN, rim * 0.25 + (noise(p, 0.05, 8) > 0.72 ? 0.5 : 0));
  });
  const rootPaint = paint((p) => mix(DEEP, "#3a2a7a", noise(p, 0.08, 5)));

  const base = b.joint("base", { at: [0, 0.05, 0], role: "spine" });
  const stalk = b.chain(
    "stalk",
    catmull([[0, 0.02, 0], [0.04, 0.35, 0.02], [-0.03, 0.75, 0.06], [0.05, 1.15, 0.0], [0.1, 1.4, -0.05]]),
    { parent: base, count: 5, role: "spine" },
  );
  b.sweep(stalk, (t) => 0.1 * (1 - t) + 0.03, { color: stalkPaint, sides: 7 });

  // root buttress
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    b.sweep(
      bezier([c * 0.05, 0.15, s * 0.05], [c * 0.2, 0.1, s * 0.2], [c * 0.4, 0.0, s * 0.4]),
      [0.06, 0.012],
      { color: rootPaint, sides: 6, bone: base, caps: { end: "point" } },
    );
  }

  // glowing spots along stalk
  const skin = b.surface(b.root);
  const spots = skin.scatter(40, { rng: rand, minDist: 0.07, filter: (h) => h.at.y > 0.1 && h.at.y < 1.4 });
  for (const h of spots) glow(b.stick(new THREE.SphereGeometry(0.014, 5, 4), CYAN, h, { embed: 0.3 }), 1.4);

  // fronds
  const frondTex = svg(
    `<svg viewBox="0 0 64 128"><path d="M32 126 C4 90 6 30 32 2 C58 30 60 90 32 126Z" fill="#2fe0d0" stroke="#144a7a" stroke-width="3"/>
     <path d="M32 120 L32 10" stroke="#e8fff9" stroke-width="3"/>
     <path d="M32 90 L14 66 M32 90 L50 66 M32 60 L18 40 M32 60 L46 40" stroke="#ff7ae0" stroke-width="2.5" fill="none"/>
     <circle cx="32" cy="22" r="4" fill="#fff"/></svg>`,
    { size: 192 },
  );
  const fronds: THREE.Mesh[] = [];
  for (let k = 0; k < 7; k++) {
    const t = 0.3 + (k / 7) * 0.65;
    const pt = stalk.at(t);
    const a = k * 2.4;
    const out = [Math.cos(a), 0.35, Math.sin(a)];
    const tip: [number, number, number] = [pt.at.x + out[0] * 0.5, pt.at.y + 0.28, pt.at.z + out[2] * 0.5];
    const mid: [number, number, number] = [pt.at.x + out[0] * 0.3, pt.at.y + 0.2, pt.at.z + out[2] * 0.3];
    const e = b.sprout(`frond${k}`, pt, bezier(pt.at, mid, tip), [0.022, 0.006], {
      count: 2, color: k % 2 ? BLUE : VIOLET, sides: 5,
    });
    const f = frame(tip, [out[0], 0.4, out[2]]);
    fronds.push(
      ...b.cards([f], frondTex, { size: [0.2, 0.34], lean: 40, flow: [out[0], -0.2, out[2]], cross: true, bone: e.chain!.joints[1] }),
    );
  }
  for (const m of fronds) glow(m, 0.8);

  // crown bulb
  const top = stalk.at(1);
  const bulb = b.part(new THREE.IcosahedronGeometry(0.11, 1), PINK, { bone: stalk.tip ?? stalk.joints[4], at: top.at, flat: true });
  glow(bulb, 1.8);
  b.ring(frame(top.at, [0, 1, 0]), { count: 8, radius: 0.1, tilt: 35 }, (it) => {
    glow(b.spike(it, it, 0.3, 0.02, { color: CYAN, bone: stalk.tip ?? stalk.joints[4] }), 1.2);
  });

  // hanging spore tufts
  for (let i = 0; i < 5; i++) {
    const t = 0.45 + i * 0.1;
    const p = stalk.at(t).at;
    const a = i * 1.9;
    const hp: [number, number, number] = [p.x + Math.cos(a) * 0.22, p.y - 0.1, p.z + Math.sin(a) * 0.22];
    b.rod(p, hp, 0.006, VIOLET, { bone: stalk.joints[Math.min(4, Math.floor(t * 5))] });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), i % 2 ? PINK : CYAN, { at: hp, bone: stalk.joints[Math.min(4, Math.floor(t * 5))] }), 1.6);
  }

  // ground glow pods
  for (let i = 0; i < 7; i++) {
    const a = rand() * 6.28, r = 0.25 + rand() * 0.3;
    const h = 0.03 + rand() * 0.04;
    glow(b.part(new THREE.SphereGeometry(h, 6, 4), i % 2 ? CYAN : PINK, { at: [Math.cos(a) * r, h * 0.7, Math.sin(a) * r], bone: base }), 1.3);
  }

  return b.root;
}
```