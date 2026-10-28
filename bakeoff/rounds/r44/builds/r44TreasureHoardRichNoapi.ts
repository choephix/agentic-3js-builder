import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description: "A heaped hoard of coins, gems, an iron-bound chest, a jeweled crown and goblets, in a stylized painterly fantasy look.",
};

const GOLD = paint((p, n) => {
  const t = smoothstep(0.3, 0.8, noise(p, 0.05, 3));
  let c = mix("#b8741a", "#ffd95a", t * 0.7 + Math.max(0, n.y) * 0.3);
  c = mix(c, "#fff3b0", smoothstep(0.75, 1, n.y) * 0.3);
  return mix(c, "#5a3010", (1 - smoothstep(-0.5, 0.6, n.y)) * 0.35);
});
const WOOD = paint((p, n) => {
  const g = noise(new THREE.Vector3(p.x * 6, p.y, p.z * 0.5), 0.1, 5);
  return mix(mix("#5a2c18", "#8a4a26", g), "#2a120a", (1 - smoothstep(-0.4, 0.8, n.y)) * 0.4);
});
const IRON = "#2d3a4e";

const crest = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#ffd95a" stroke="#6a3c10" stroke-width="4"/><path d="M32 12L48 32L32 52L16 32Z" fill="#2fd0e8" stroke="#6a3c10" stroke-width="3"/><path d="M32 12V52M16 32H48" stroke="#e8ffff" stroke-width="2"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);
  const lid = b.joint("lid", { parent: root, at: [0, 0.55, -0.32], dir: [1, 0, 0], role: "hinge" });

  // chest body
  b.part(new THREE.BoxGeometry(1.1, 0.5, 0.65), WOOD, { bone: root, at: [0, 0.27, 0], name: "chestBody" });
  for (const x of [-0.45, 0, 0.45]) b.part(new THREE.BoxGeometry(0.1, 0.52, 0.68), IRON, { bone: root, at: [x, 0.27, 0] });
  b.part(new THREE.BoxGeometry(1.16, 0.06, 0.7), IRON, { bone: root, at: [0, 0.03, 0] });
  // lid: half cylinder, opened
  const lidG = new THREE.CylinderGeometry(0.34, 0.34, 1.1, 10, 1, false, 0, Math.PI);
  lidG.rotateZ(Math.PI / 2);
  lidG.rotateX(-Math.PI / 2);
  lidG.translate(0, 0, 0.32);
  b.part(lidG, WOOD, { bone: lid, at: [0, 0.55, -0.32], name: "lidShell" });
  for (const x of [-0.45, 0, 0.45]) {
    const g = new THREE.CylinderGeometry(0.355, 0.355, 0.1, 10, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    g.translate(x, 0, 0.32);
    b.part(g, IRON, { bone: lid, at: [0, 0.55, -0.32] });
  }
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });
  b.part(new THREE.BoxGeometry(0.14, 0.16, 0.05), "#ffd95a", { bone: root, at: [0, 0.5, 0.35] });

  // gold heap
  const heap = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(heap, GOLD, { bone: root, at: [0, 0.0, 0.15], scale: [1.6, 0.5, 1.2], name: "heap" });
  b.part(heap.clone(), GOLD, { bone: root, at: [0, 0.3, 0.0], scale: [0.5, 0.3, 0.3] });

  // coins
  const coinG: THREE.BufferGeometry[] = [];
  const coinG2: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 90; i++) {
    const a = R() * Math.PI * 2;
    const r = Math.sqrt(R()) * 1.45;
    const x = Math.cos(a) * r;
    const z = 0.2 + Math.sin(a) * r * 0.75;
    if (Math.abs(x) < 0.6 && z < 0.4 && z > -0.4) continue;
    const y = Math.max(0.03, 0.5 * Math.sqrt(Math.max(0, 1 - (x / 1.6) ** 2 - ((z - 0.15) / 1.2) ** 2))) ;
    const g = new THREE.CylinderGeometry(0.075, 0.075, 0.016, 10);
    g.rotateX((R() - 0.5) * 1.6);
    g.rotateZ((R() - 0.5) * 1.6);
    g.translate(x, y, z);
    (i % 3 ? coinG : coinG2).push(g);
  }
  b.part(mergeGeometries(coinG)!, "#f2b830", { bone: root, at: [0, 0, 0], name: "coins" });
  b.part(mergeGeometries(coinG2)!, "#fff0a0", { bone: root, at: [0, 0, 0], name: "coinsBright" });
  // standing coin with crest
  b.part(new THREE.CircleGeometry(0.22, 16), "#ffffff", { bone: root, at: [0.9, 0.3, 0.7], dir: [0.3, 0.2, 1], axis: "z", texture: crest });

  // gems
  const gemCols = ["#2fd0e8", "#e8336a", "#8a4af0", "#5ae86a"];
  gemCols.forEach((c, k) => {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.OctahedronGeometry(0.07 + R() * 0.05, 0);
      g.scale(1, 1.4, 1);
      g.rotateY(R() * 6);
      const a = R() * Math.PI * 2;
      const r = 0.5 + R() * 1.0;
      g.translate(Math.cos(a) * r, 0.2 + R() * 0.15, 0.3 + Math.sin(a) * r * 0.7);
      gs.push(g);
    }
    glow(b.part(mergeGeometries(gs)!, c, { bone: root, at: [0, 0, 0], name: `gems${k}` }), 0.8);
  });
  // spilled from the chest
  glow(b.part(new THREE.OctahedronGeometry(0.16, 0), "#2fd0e8", { bone: root, at: [0.15, 0.62, 0.1], scale: [1, 1.5, 1] }), 1.2);

  // crown
  const cx = -0.8, cz = 0.85, cy = 0.14;
  b.lathe([[0.26, 0], [0.28, 0.02], [0.27, 0.16], [0.24, 0.16], [0.24, 0.02]], { at: [cx, cy, cz], segments: 12, color: GOLD, bone: root, name: "crownBand" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.05, 0.22, 4), GOLD, { bone: root, at: [cx + Math.cos(a) * 0.26, cy + 0.27, cz + Math.sin(a) * 0.26] });
    glow(b.part(new THREE.OctahedronGeometry(0.04, 0), gemCols[i % 4], { bone: root, at: [cx + Math.cos(a) * 0.27, cy + 0.09, cz + Math.sin(a) * 0.27] }), 1);
  }
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), "#e8336a", { bone: root, at: [cx, cy + 0.4, cz] }), 1);

  // goblets
  const gob = (x: number, z: number, h: number, tilt: number, col: string) => {
    const j = [[0, 0], [0.09, 0], [0.09, 0.02], [0.02, 0.05], [0.02, 0.2 * h], [0.1, 0.24 * h], [0.11, 0.38 * h], [0.09, 0.38 * h], [0.08, 0.26 * h], [0, 0.25 * h]];
    b.lathe(j as [number, number][], { at: [x, 0.12, z], segments: 10, color: col === "g" ? GOLD : "#cfd8e8", bone: root, name: "goblet" });
    glow(b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.01, 10), "#ff4a6a", { bone: root, at: [x, 0.12 + 0.36 * h, z] }), 0.6);
  };
  gob(0.95, 0.35, 1.2, 0, "g");
  gob(1.2, 0.8, 1, 0, "s");
  gob(-0.3, 1.2, 1.1, 0, "g");

  // floor shadow-ish base
  b.part(new THREE.CylinderGeometry(1.9, 1.9, 0.02, 20), "#3a2a3e", { bone: root, at: [0, 0.0, 0.2], name: "floorDisc" });
  return b.root;
}
