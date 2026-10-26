```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, svg, noise, paint, mix, smoothstep, countershade, mottle } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Pandora Glow Bloom",
  description: "Bioluminescent alien plant with curling stalks, glowing fronds, pods and flower bells, Avatar style.",
};

const DEEP = "#14203a";
const TEAL = "#1fd6c4";
const CYAN = "#5ff0ff";
const VIOLET = "#8a4cff";
const PINK = "#ff5fd0";
const LIME = "#9dff7a";

export default function build() {
  const b = createBuilder({ name: "alienPlant" });
  const R = rng(11);

  const base = b.joint("base", { at: [0, 0.05, 0], role: "spine" });

  // painted stem
  const stemPaint = paint((p, n) => {
    const t = noise(p, 0.18, 3);
    const c = mix("#1b2f55", "#2b5fa0", t);
    const rim = smoothstep(0.1, 0.9, n.y);
    return mix(c, "#3ad6c8", rim * 0.25 * smoothstep(0.55, 0.75, noise(p, 0.05, 8)));
  });
  const soilPaint = mottle("#1a1830", "#33305a", { size: 0.08 });

  // root mound
  b.part(new THREE.CylinderGeometry(0.4, 0.55, 0.12, 9), soilPaint, { bone: base, at: [0, 0.04, 0], flat: true });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.sweep(
      catmull([[Math.sin(a) * 0.12, 0.1, Math.cos(a) * 0.12], [Math.sin(a) * 0.3, 0.12, Math.cos(a) * 0.3], [Math.sin(a) * 0.5, 0.03, Math.cos(a) * 0.5]]),
      [0.05, 0.012],
      { bone: base, color: stemPaint, sides: 6 },
    );
  }

  // glow textures
  const frond = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C2 40 4 14 16 2 C28 14 30 40 16 62Z" fill="#33e8d8" stroke="#0b3a5a" stroke-width="2"/><path d="M16 60 L16 8" stroke="#d8ffff" stroke-width="2"/><g stroke="#aaffff" stroke-width="1.5"><path d="M16 50 L7 40M16 40 L6 28M16 30 L9 18M16 50 L25 40M16 40 L26 28M16 30 L23 18"/></g></svg>`,
    { size: 128 },
  );
  const spotTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#b8fff0"/><circle cx="16" cy="16" r="8" fill="#ffffff"/></svg>`,
    { size: 64 },
  );

  const stalkCount = 5;
  for (let k = 0; k < stalkCount; k++) {
    const a = (k / stalkCount) * Math.PI * 2 + 0.4;
    const h = 1.1 + R() * 0.9;
    const lean = 0.25 + R() * 0.35;
    const dx = Math.sin(a), dz = Math.cos(a);
    const pts = [
      [dx * 0.05, 0.1, dz * 0.05],
      [dx * lean * 0.3, h * 0.35, dz * lean * 0.3],
      [dx * lean * 0.8, h * 0.75, dz * lean * 0.8],
      [dx * lean * 1.4, h, dz * lean * 1.4],
    ];
    const path = catmull(pts);
    const ch = b.chain(`stalk${k}`, path, { parent: base, count: 4, role: "spine" });
    b.sweep(ch, (t) => 0.06 * (1 - t) + 0.02, { color: stemPaint, sides: 6 });
    const tip = path.at(1);

    // glowing frond cards along the stalk
    const hits = [];
    for (let i = 1; i <= 5; i++) hits.push(ch.at(i / 6));
    const sa = Math.atan2(dx, dz);
    for (let i = 0; i < hits.length; i++) {
      for (const s of [1, -1]) {
        const pt = hits[i];
        const f = b.cards([pt], frond, {
          size: [0.14, 0.3 - i * 0.02],
          lean: 55,
          flow: [s * Math.cos(sa), 0.3, -s * Math.sin(sa)],
          bend: 30,
          mirror: s < 0,
          cross: false,
        });
        glow(f, 1.2);
      }
    }

    // flower bell at tip
    const col = [PINK, VIOLET, CYAN, LIME, TEAL][k];
    const bell = b.lathe(
      [[0, 0], [0.05, 0.01], [0.11, 0.1], [0.14, 0.2], [0.11, 0.2], [0.07, 0.1], [0, 0.05]],
      { at: [tip[0], tip[1], tip[2]], axis: [0, -1, 0], segments: 7, color: col, bone: ch.tip ?? ch.joints[ch.joints.length - 1] },
    );
    glow(bell, 1.3);
    // stamen filaments
    for (let i = 0; i < 5; i++) {
      const aa = (i / 5) * Math.PI * 2;
      const e: [number, number, number] = [tip[0] + Math.sin(aa) * 0.04, tip[1] - 0.28 - R() * 0.1, tip[2] + Math.cos(aa) * 0.04];
      glow(b.rod([tip[0], tip[1] - 0.05, tip[2]], e, 0.005, { color: "#ffffff", bone: ch.joints[ch.joints.length - 1] }), 1.5);
      glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), CYAN, { at: e, bone: ch.joints[ch.joints.length - 1] }), 2);
    }
  }

  // central tall spire with glowing core
  const spirePath = catmull([[0, 0.1, 0], [0.05, 0.8, 0], [-0.05, 1.5, 0.05], [0, 2.1, 0]]);
  const sp = b.chain("spire", spirePath, { parent: base, count: 5, role: "spine" });
  b.sweep(sp, (t) => 0.1 * (1 - t) + 0.015, { color: stemPaint, sides: 7 });
  glow(b.part(new THREE.IcosahedronGeometry(0.1, 0), CYAN, { at: spirePath.at(1), bone: sp.joints[sp.joints.length - 1], flat: true }), 2.2);
  b.ring(sp.at(0.9), { count: 6, radius: 0.08, tilt: 40 }, (it) => {
    glow(b.spike(it, it, 0.25, 0.03, { color: TEAL }), 1.2);
  });

  // ground pods and spores
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, d = 0.3 + R() * 0.6;
    const sz = 0.03 + R() * 0.05;
    const c = [TEAL, VIOLET, LIME, PINK][i % 4];
    glow(b.part(new THREE.SphereGeometry(sz, 6, 4), c, { at: [Math.sin(a) * d, sz * 0.8, Math.cos(a) * d], bone: base, flat: true }), 1.4);
  }
  // floating glow spots
  const sparks = [];
  for (let i = 0; i < 16; i++) {
    sparks.push([(R() - 0.5) * 1.6, 0.4 + R() * 1.8, (R() - 0.5) * 1.6]);
  }
  for (const s of sparks) {
    glow(b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", { at: s as [number, number, number], bone: base, dir: [0, 0, 1], axis: "z", texture: spotTex }), 1.8);
  }

  b.part(new THREE.TorusGeometry(0.5, 0.015, 4, 12), DEEP, { bone: base, at: [0, 0.1, 0], rotation: [90, 0, 0] });

  return b.root;
}
```