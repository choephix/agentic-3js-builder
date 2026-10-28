```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A tall scythe with a vertebrae haft, a curved dragon-rib blade edged in teal soul fire, a clawed collar with a glowing soul gem, hanging tassel and a stone stand.",
};

const BONE = "#e8dcc0";
const BONE_D = "#8a7655";
const GOLD = "#d4a93c";
const SOUL = "#3ff5d0";
const DARK = "#1a1f2e";

const bonePaint = paint((p, n) => {
  const c = mix(BONE_D, BONE, smoothstep(-0.4, 0.9, n.y) * 0.6 + noise(p, 0.05, 3) * 0.4);
  return c;
});
const stonePaint = paint((p, n) => mix("#2c3246", "#5a6485", noise(p, 0.12, 5) * 0.6 + smoothstep(0, 1, n.y) * 0.4));

const RUNE = svg(
  `<svg viewBox="0 0 40 120"><g fill="none" stroke="#3ff5d0" stroke-width="4" stroke-linecap="round"><path d="M20 6 L20 40 M8 16 L20 28 L32 16"/><path d="M10 60 L30 60 L10 90 L30 90"/><path d="M20 100 L20 116"/></g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: root, at, ...o });

  // stand
  b.lathe([[0, 0], [0.4, 0], [0.4, 0.05], [0.34, 0.1], [0.12, 0.12], [0, 0.12]], { at: [0, 0, 0], bone: root, color: stonePaint, segments: 8 });
  b.lathe([[0, 0.12], [0.07, 0.12], [0.05, 0.2], [0, 0.2]], { at: [0, 0, 0], bone: root, color: GOLD, segments: 8 });

  // haft with slight S curve
  const haft = catmull([[0, 0.18, 0], [0.01, 0.8, 0.01], [0, 1.4, -0.01], [0, 2.0, 0]]);
  b.sweep(haft, 0.026, { bone: root, sides: 8, color: bonePaint, caps: "flat", name: "haft" });
  for (let i = 0; i < 16; i++) {
    const t = 0.05 + i * 0.058;
    const q = haft.at(t);
    P(new THREE.SphereGeometry(0.038, 6, 4), bonePaint, [q.x, q.y, q.z], { scale: [1, 0.45, 1] });
    for (const s of [1, -1]) P(new THREE.ConeGeometry(0.009, 0.05, 4), BONE, [q.x + s * 0.04, q.y, q.z], { dir: [s, 0.2, 0], name: "spine" });
  }
  // grip wraps
  for (let i = 0; i < 6; i++) P(new THREE.TorusGeometry(0.03, 0.007, 4, 8), DARK, [0, 0.6 + i * 0.03, 0], { rotation: [90, 0, 0] });
  P(new THREE.SphereGeometry(0.045, 6, 4), GOLD, [0, 0.17, 0]);
  P(new THREE.ConeGeometry(0.03, 0.12, 6), GOLD, [0, 0.1, 0], { rotation: [180, 0, 0] });

  // collar with claws
  b.lathe([[0.02, 1.9], [0.07, 1.9], [0.085, 1.96], [0.07, 2.04], [0.02, 2.04]], { at: [0, 0, 0], bone: root, color: GOLD, segments: 8 });
  for (let k = 0; k < 4; k++) {
    const a = k * 90 + 45;
    const d = [Math.sin((a * Math.PI) / 180), 0.5, Math.cos((a * Math.PI) / 180)];
    P(new THREE.ConeGeometry(0.018, 0.14, 5), BONE, [d[0] * 0.09, 2.0, d[2] * 0.09], { dir: d, name: "claw" });
  }
  glow(P(new THREE.OctahedronGeometry(0.05, 0), SOUL, [0, 2.1, 0], { scale: [1, 1.5, 1] }), 1.8);

  // blade: rib sweep curving forward
  const rib = catmull([[0, 2.05, 0], [0, 2.2, 0.2], [0, 2.18, 0.5], [0, 2.02, 0.8], [0, 1.78, 1.0]]);
  b.sweep(rib, (t) => [0.02 + 0.03 * (1 - t) * 1.2, 0.05 * (1 - t) + 0.01], {
    bone: root, sides: 6, color: bonePaint, caps: "point", name: "rib",
  });
  // soul-fire edge blade
  const edge = catmull([[0, 2.0, 0.08], [0, 2.1, 0.3], [0, 2.02, 0.6], [0, 1.88, 0.85], [0, 1.78, 1.0]]);
  glow(b.sweep(edge, (t) => [0.008, 0.07 * Math.sin(Math.PI * (0.1 + t * 0.8)) + 0.005], {
    bone: root, sides: 4, color: SOUL, caps: "point", name: "soulEdge",
  }), 1.4);
  // rib teeth and runes
  for (let i = 0; i < 5; i++) {
    const q = rib.at(0.15 + i * 0.17);
    const tn = rib.tangentAt(0.15 + i * 0.17);
    P(new THREE.ConeGeometry(0.014, 0.07, 4), BONE, [q.x, q.y + 0.05, q.z], { dir: [0, 1, -tn.y * 0.5], name: "tooth" });
  }
  for (const f of [1, -1]) {
    const q = rib.at(0.35);
    glow(P(new THREE.PlaneGeometry(0.03, 0.09), "#ffffff", [q.x + f * 0.03, q.y - 0.02, q.z], { dir: [f, 0, 0], axis: "z", texture: RUNE, name: "rune" }), 1.3);
  }

  // tassel
  const tass = catmull([[0.03, 1.5, 0], [0.07, 1.4, 0.02], [0.06, 1.28, 0.02]]);
  b.sweep(tass, 0.008, { bone: root, sides: 5, color: "#b02a3a", name: "cord" });
  P(new THREE.ConeGeometry(0.03, 0.12, 6), "#b02a3a", [0.06, 1.2, 0.02], { rotation: [180, 0, 0] });
  glow(P(new THREE.SphereGeometry(0.014, 6, 4), SOUL, [0.06, 1.27, 0.02]), 1.4);

  return b.root;
}
```