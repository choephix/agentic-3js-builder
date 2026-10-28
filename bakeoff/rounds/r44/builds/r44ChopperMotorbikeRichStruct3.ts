import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, catmull, svg, aim } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper",
  description: "Stylized Overwatch-style chopper motorbike with a long raked fork, teardrop tank, glowing headlamp and chrome pipes.",
};

const ORANGE = "#ff8a1c";
const GRAPH = "#272d38";
const STEEL = "#c3cbd7";
const CHROME = "#e8edf5";
const RUBBER = "#1b1e25";
const CYAN = "#33f3ff";
const GOLD = "#ffbd2b";
const LEATHER = "#5a3524";

export default function build() {
  const b = createBuilder({ name: "chopper", paintSize: 1024 });
  const frameJ = b.joint("frame", { at: [0, 0.6, 0], dir: [0, 0, 1], role: "spine" });
  const fork = b.joint("fork", { parent: frameJ, at: [0, 0.95, 0.85], dir: [0, -1, 0.55], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: fork, at: [0, 0.36, 1.45], dir: [1, 0, 0], role: "hinge" });
  const swing = b.joint("swingarm", { parent: frameJ, at: [0, 0.5, -0.5], dir: [0, 0, -1], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: swing, at: [0, 0.4, -1.1], dir: [1, 0, 0], role: "hinge" });

  const tankPaint = paint((p, n) => {
    if (Math.abs(p.x) < 0.02 && n.y > 0.3) return GOLD;
    const flame = p.z > 0.0 && Math.abs(p.y - 1.05 - 0.2 * (p.z - 0.3)) < 0.03;
    if (flame) return GOLD;
    return mix(ORANGE, "#c9540a", smoothstep(1.1, 0.8, p.y) * 0.6 + noise(p, 0.3, 2) * 0.1);
  });
  const metalP = paint((p, n) => mix("#8e98a8", CHROME, smoothstep(-0.4, 0.9, n.y) * 0.8 + noise(p, 0.05, 3) * 0.2));

  const wheel = (j: typeof frameJ, z: number, y: number, r: number, w: number) => {
    b.lathe(
      [[0.1, -w / 2], [r - 0.06, -w / 2], [r, -w * 0.3], [r, w * 0.3], [r - 0.06, w / 2], [0.1, w / 2]],
      { at: [-0, y, z], axis: [1, 0, 0], bone: j, color: RUBBER, segments: 20, name: "tyre" },
    );
    b.lathe([[0.05, -0.03], [r - 0.07, -0.03], [r - 0.07, 0.03], [0.05, 0.03]], { at: [0, y, z], axis: [1, 0, 0], bone: j, color: CHROME, segments: 20, name: "rim" });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI;
      b.rod([0, y + Math.sin(a) * (r - 0.07), z + Math.cos(a) * (r - 0.07)], [0, y - Math.sin(a) * (r - 0.07), z - Math.cos(a) * (r - 0.07)], 0.005, { bone: j, color: STEEL, sides: 4, name: "spoke" });
    }
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 10), STEEL, { bone: j, at: [0, y, z], dir: [1, 0, 0], name: "hub" });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12), GRAPH, { bone: j, at: [0.05, y, z], dir: [1, 0, 0], name: "disc" });
  };
  wheel(wheelF, 1.45, 0.36, 0.36, 0.12);
  wheel(wheelR, -1.1, 0.4, 0.4, 0.26);

  // frame rails
  const rail = catmull([[0, 0.55, -1.1], [0, 0.62, -0.5], [0, 0.72, 0.2], [0, 0.95, 0.85]]);
  b.sweep(rail, 0.04, { bone: frameJ, color: GRAPH, sides: 6, name: "spineTube" });
  b.sweep(catmull([[0, 0.4, -1.1], [0, 0.5, -0.4], [0, 0.45, 0.3], [0, 0.7, 0.85]]), 0.035, { bone: frameJ, color: GRAPH, sides: 6, name: "lowerTube" });

  // fork
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.0, 0.82], [s * 0.1, 0.36, 1.45], 0.028, { bone: fork, color: CHROME, sides: 8, name: "forkTube" });
    b.rod([s * 0.1, 0.62, 1.2], [s * 0.1, 0.36, 1.45], 0.04, { bone: fork, color: STEEL, sides: 8, name: "forkLower" });
    b.rod([s * 0.5, 1.08, 0.8], [s * 0.1, 0.99, 0.84], 0.02, { bone: fork, color: CHROME, sides: 6, name: "bar" });
    b.rod([s * 0.5, 1.08, 0.8], [s * 0.55, 1.2, 0.55], 0.02, { bone: fork, color: CHROME, sides: 6, name: "grip" });
    b.capsule([s * 0.55, 1.2, 0.55], [s * 0.6, 1.22, 0.4], 0.03, { bone: fork, color: LEATHER, sides: 8, name: "handGrip" });
    // swingarm
    b.rod([s * 0.1, 0.5, -0.5], [s * 0.18, 0.4, -1.1], 0.035, { bone: swing, color: GRAPH, sides: 6, name: "swingTube" });
    // exhaust pipes
    b.sweep(catmull([[s * 0.17, 0.42, 0.25], [s * 0.26, 0.32, -0.2], [s * 0.3, 0.3, -0.9], [s * 0.3, 0.38, -1.5]]), [0.045, 0.06], { bone: frameJ, color: metalP, sides: 8, name: "pipe" });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), GRAPH, { bone: frameJ, at: [s * 0.3, 0.38, -1.51], dir: [0, 0, 1], name: "pipeMouth" });
    // foot pegs
    b.rod([s * 0.12, 0.42, -0.05], [s * 0.32, 0.4, -0.05], 0.02, { bone: frameJ, color: STEEL, sides: 6, name: "peg" });
  }
  // fender
  b.sweep(catmull([[0, 0.78, 1.8], [0, 0.82, 1.5], [0, 0.78, 1.15]]), [0.1, 0.1], { bone: fork, color: ORANGE, sides: 8, name: "fenderF" });

  // tank
  b.loft(
    [
      { at: [0, 1.0, 0.7], w: 0.2, h: 0.2 },
      { at: [0, 1.08, 0.4], w: 0.34, h: 0.3 },
      { at: [0, 1.06, 0.05], w: 0.3, h: 0.27 },
      { at: [0, 0.98, -0.2], w: 0.14, h: 0.16 },
    ],
    { bone: frameJ, color: tankPaint, sides: 10, name: "tank" },
  );
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), CHROME, { bone: frameJ, at: [0, 1.25, 0.35], name: "cap" });
  // seat
  b.loft(
    [
      { at: [0, 0.82, -0.3], w: 0.18, h: 0.08 },
      { at: [0, 0.8, -0.65], w: 0.32, h: 0.1 },
      { at: [0, 0.86, -1.0], w: 0.24, h: 0.08 },
    ],
    { bone: frameJ, color: LEATHER, sides: 8, name: "seat" },
  );
  // rear fender + taillight
  b.sweep(catmull([[0, 0.98, -0.8], [0, 0.95, -1.3], [0, 0.72, -1.55]]), [0.14, 0.1], { bone: swing, color: ORANGE, sides: 8, name: "fenderR" });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), "#ff2d3d", { bone: swing, at: [0, 0.72, -1.6], name: "tail" }), 1.5);

  // engine
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.4), GRAPH, { bone: frameJ, at: [0, 0.5, 0.15], name: "crank" });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.26, 10), metalP, { bone: frameJ, at: [s * 0.28, 0.62, 0.3], dir: [s, 0.2, 0], name: "cylinder" });
    for (let i = 0; i < 4; i++) b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 10), STEEL, { bone: frameJ, at: [s * (0.33 + i * 0.045), 0.64, 0.3], dir: [s, 0.2, 0], name: "fin" });
  }
  // headlamp
  b.part(new THREE.SphereGeometry(0.14, 10, 8), CHROME, { bone: fork, at: [0, 0.95, 1.05], scale: [1, 1, 0.8], name: "lampShell" });
  glow(b.part(new THREE.SphereGeometry(0.09, 8, 6), "#fff3c4", { bone: fork, at: [0, 0.95, 1.14], name: "lens" }), 2);
  // glow strip
  glow(b.rod([0.17, 0.3, 0.2], [0.17, 0.3, -0.4], 0.01, { bone: frameJ, color: CYAN, sides: 4, name: "underglowL" }), 1.5);
  glow(b.rod([-0.17, 0.3, 0.2], [-0.17, 0.3, -0.4], 0.01, { bone: frameJ, color: CYAN, sides: 4, name: "underglowR" }), 1.5);
  // emblem on tank
  const EMB = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${GRAPH}" stroke="${GOLD}" stroke-width="8"/><path d="M50 18 L76 74 L50 62 L24 74Z" fill="${ORANGE}"/></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", { bone: frameJ, at: [s * 0.172, 1.07, 0.33], dir: [s, 0, 0], axis: "z", texture: EMB, name: "emblem" });
  // kickstand
  b.rod([0.1, 0.45, -0.2], [0.2, 0.0, -0.1], 0.015, { bone: frameJ, color: STEEL, sides: 5, name: "stand" });

  return b.root;
}
