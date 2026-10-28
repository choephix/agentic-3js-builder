```ts
import * as THREE from "three";
import { createBuilder, rng, aim, DEG, noise, mix, paint, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description: "A League-of-Legends styled hoard: an open iron-bound chest spilling coins, gems, a jeweled crown and goblets on a gold mound.",
};

const GOLD = paint((p, n) => {
  const g = noise(p, 0.05, 3);
  let c = mix("#c9801a", "#ffd95a", 0.3 + 0.6 * g);
  c = mix(c, "#fff4b0", smoothstep(0.6, 1, n.y) * 0.4);
  return c;
});
const WOOD = paint((p) => mix("#4a2614", "#7a4524", noise(new THREE.Vector3(p.x * 0.3, p.y * 3, p.z * 3), 0.1, 5)));
const IRON = "#2b3140";
const RUNE = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#3df5ff" stroke-width="7"/><path d="M50 20V80M30 40L50 55L70 40" stroke="#3df5ff" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(9);
  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: root, at, ...o });

  // gold mound
  b.lathe([[0, 0], [1.1, 0], [1.0, 0.12], [0.7, 0.28], [0.35, 0.36], [0, 0.4]], { at: [0, 0, 0], segments: 14, color: GOLD, bone: root, name: "mound" });

  // chest at back
  const cz = -0.35;
  part(new THREE.BoxGeometry(0.8, 0.36, 0.5), WOOD, [0, 0.3, cz], { flat: true });
  for (const x of [-0.3, 0.3]) part(new THREE.BoxGeometry(0.07, 0.38, 0.54), IRON, [x, 0.3, cz], { flat: true });
  part(new THREE.BoxGeometry(0.72, 0.04, 0.42), GOLD, [0, 0.49, cz]);
  // open lid on hinge
  const hinge = b.joint("lid", { parent: root, at: [0, 0.48, cz - 0.25], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 10, 1, false, 0, Math.PI), WOOD, { bone: hinge, at: [0, 0.48, cz - 0.25], rotation: [0, 0, 90], flat: true });
  for (const x of [-0.3, 0.3]) b.part(new THREE.CylinderGeometry(0.265, 0.265, 0.07, 10, 1, false, 0, Math.PI), IRON, { bone: hinge, at: [x, 0.48, cz - 0.25], rotation: [0, 0, 90], flat: true });
  b.pose(hinge, { axis: [1, 0, 0], deg: -105 });
  part(new THREE.BoxGeometry(0.1, 0.12, 0.04), GOLD, [0, 0.4, cz + 0.27]);
  glow(part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", [0, 0.4, cz + 0.295], { texture: RUNE, dir: [0, 0, 1], axis: "z" }), 1.2);

  // coin heap in chest
  for (let i = 0; i < 40; i++) {
    const a = R() * 6.28, r = Math.sqrt(R()) * 0.3;
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 10), GOLD, [Math.cos(a) * r * 1.1, 0.5 + 0.05 * (1 - r / 0.3) + R() * 0.02, cz + Math.sin(a) * r * 0.7], { rotation: [(R() - 0.5) * 60, R() * 360, (R() - 0.5) * 60] });
  }
  // spilled coins
  for (let i = 0; i < 70; i++) {
    const a = R() * 6.28, r = 0.35 + R() * 0.75;
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 10), GOLD, [Math.cos(a) * r, Math.max(0.03, 0.4 - r * 0.33) + R() * 0.03, Math.sin(a) * r + 0.1], { rotation: [(R() - 0.5) * 50, R() * 360, (R() - 0.5) * 50] });
  }
  // stacks
  for (const [x, z, n] of [[0.55, 0.6, 7], [-0.6, 0.55, 5]] as const)
    for (let i = 0; i < n; i++) part(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 12), GOLD, [x, 0.2 + i * 0.019, z], { rotation: [0, i * 20, 0] });

  // gems
  const cols = ["#ff3b5c", "#3df5ff", "#8a5cff", "#4be07a", "#ffb02e"];
  for (let i = 0; i < 16; i++) {
    const a = R() * 6.28, r = 0.3 + R() * 0.7, s = 0.04 + R() * 0.04;
    glow(part(new THREE.OctahedronGeometry(s), cols[i % 5], [Math.cos(a) * r, Math.max(0.08, 0.42 - r * 0.3) + s, Math.sin(a) * r + 0.2], { scale: [1, 1.3, 1], rotation: [R() * 40, R() * 360, R() * 40], flat: true }), 0.9);
  }

  // crown
  const crX = 0.0, crY = 0.38, crZ = 0.55;
  b.lathe([[0.2, 0], [0.24, 0], [0.24, 0.1], [0.2, 0.1]], { at: [crX, crY, crZ], segments: 12, color: GOLD, bone: root, name: "crownBand" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.28;
    part(new THREE.ConeGeometry(0.04, 0.18, 4), GOLD, [crX + Math.cos(a) * 0.22, crY + 0.19, crZ + Math.sin(a) * 0.22], { flat: true });
    glow(part(new THREE.OctahedronGeometry(0.03), cols[i % 5], [crX + Math.cos(a) * 0.245, crY + 0.05, crZ + Math.sin(a) * 0.245], { flat: true }), 1);
  }
  glow(part(new THREE.OctahedronGeometry(0.05), "#3df5ff", [crX, crY + 0.3, crZ], { scale: [1, 1.5, 1], flat: true }), 1.4);

  // goblets
  for (const [x, z, h] of [[-0.75, 0.0, 0.3], [0.85, 0.1, 0.26]] as const) {
    b.lathe([[0, 0], [0.09, 0], [0.09, 0.02], [0.02, 0.05], [0.02, h * 0.55], [0.1, h * 0.7], [0.12, h], [0.105, h], [0.085, h * 0.75], [0, h * 0.72]], { at: [x, 0.25, z], segments: 10, color: GOLD, bone: root, name: "goblet" });
    glow(part(new THREE.SphereGeometry(0.03, 6, 4), "#ff3b5c", [x, 0.25 + h * 0.45, z + 0.025]), 1);
  }
  return b.root;
}
```