import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { catmull } from "../../../../src/index";

export const meta = {
  name: "Overwatch Custom Chopper",
  description:
    "Long-raked custom chopper with a teardrop tank, ape-hanger bars, a V-twin, drag pipes, a fat rear tyre and glowing cyan accents in bold orange-and-graphite colour blocking.",
};

type P3 = [number, number, number];

const GRAPH = "#2a2f3a";
const GRAPH_L = "#454d5c";
const ORANGE = "#ff7a14";
const CHROME = "#d8dee8";
const CYAN = "#33e0ff";
const LEATHER = "#5a3320";
const RUBBER = "#17191f";
const RED = "#ff2d3d";

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#2a2f3a" stroke="#ffffff" stroke-width="7"/><path d="M50 18 L76 74 L50 62 L24 74 Z" fill="#ff7a14"/><rect x="34" y="80" width="32" height="6" fill="#33e0ff"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "chopper", paintSize: 1024 });
  const frame = b.joint("frame", { at: [0, 0.6, 0] });
  const HEAD: P3 = [0, 0.98, 0.3];
  const AF: P3 = [0, 0.33, 0.85];
  const AR: P3 = [0, 0.37, -0.85];
  const steer = b.joint("steer", { parent: frame, at: HEAD, dir: [0, -0.64, 0.55], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frame, at: AR, dir: [1, 0, 0], role: "hinge" });

  const rod = (a: P3, c: P3, r: number, color: string, bone = frame) =>
    b.rod(a, c, r, { bone, color, sides: 6 });

  // ---- wheels
  function wheel(bone: typeof frame, c: P3, R: number, w: number) {
    b.lathe(
      [
        [R * 0.55, -w],
        [R * 0.8, -w * 1.05],
        [R * 0.97, -w * 0.7],
        [R, 0],
        [R * 0.97, w * 0.7],
        [R * 0.8, w * 1.05],
        [R * 0.55, w],
      ],
      { at: c, axis: [1, 0, 0], bone, color: RUBBER, segments: 20, name: "tyre" },
    );
    b.lathe(
      [
        [R * 0.5, -w * 0.5],
        [R * 0.58, 0],
        [R * 0.5, w * 0.5],
      ],
      { at: c, axis: [1, 0, 0], bone, color: ORANGE, segments: 20, name: "rim" },
    );
    const sp: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.BoxGeometry(0.016, R * 1.0, 0.03);
      g.rotateX((i * Math.PI) / 5);
      g.translate(c[0], c[1], c[2]);
      sp.push(g);
    }
    b.part(mergeGeometries(sp)!, CHROME, { bone, at: [0, 0, 0], name: "spokes" });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, w * 2.2, 10), GRAPH_L, { bone, at: c, dir: [1, 0, 0], name: "hub" });
  }
  wheel(wheelR, AR, 0.37, 0.15);
  wheel(wheelF, AF, 0.33, 0.045);
  // front disc
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 16), CHROME, { bone: wheelF, at: [0.05, AF[1], AF[2]], dir: [1, 0, 0], name: "disc" });

  // ---- frame
  rod(HEAD, [0, 0.74, -0.5], 0.04, GRAPH);
  rod([0, 0.74, -0.5], [0, 0.45, -0.8], 0.04, GRAPH);
  rod([0, 0.95, 0.3], [0, 0.4, -0.02], 0.045, GRAPH);
  rod([0, 0.4, -0.02], [0, 0.4, -0.3], 0.04, GRAPH);
  for (const s of [1, -1]) {
    rod([s * 0.2, 0.38, -0.05], [s * 0.2, 0.37, -0.85], 0.03, GRAPH);
    rod([s * 0.2, 0.37, -0.85], [s * 0.16, 0.72, -0.5], 0.028, GRAPH);
    rod([s * 0.16, 0.72, -0.5], [0, 0.74, -0.5], 0.025, GRAPH);
    rod([0, 0.4, -0.02], [s * 0.2, 0.38, -0.05], 0.03, GRAPH);
    rod([s * 0.2, 0.37, -0.85], [s * 0.2, 0.37, -0.85 - 0.05], 0.05, CHROME);
  }
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), CHROME, { bone: frame, at: HEAD, dir: [0, 0.64, -0.55], name: "headTube" });

  // ---- fork, bars, lamp
  for (const s of [1, -1]) {
    rod([s * 0.1, 1.0, 0.28], [s * 0.1, AF[1], AF[2]], 0.026, CHROME, steer);
    rod([s * 0.1, 0.65, 0.58], [s * 0.1, AF[1], AF[2]], 0.036, GRAPH_L, steer);
    b.sweep(
      catmull([[s * 0.08, 1.04, 0.27], [s * 0.2, 1.2, 0.22], [s * 0.42, 1.5, 0.18], [s * 0.5, 1.52, 0.3], [s * 0.52, 1.46, 0.42]]),
      0.017,
      { bone: steer, color: CHROME, sides: 6, caps: "round", name: "ape" },
    );
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.14, 8), RUBBER, { bone: steer, at: [s * 0.52, 1.44, 0.45], dir: [0, 0.3, 1], name: "grip" });
    rod([s * 0.1, 1.0, 0.28], [s * 0.1, 1.02, 0.46], 0.015, CHROME, steer);
  }
  b.part(new THREE.BoxGeometry(0.28, 0.05, 0.1), GRAPH, { bone: steer, at: [0, 1.03, 0.28], name: "clamp" });
  b.part(new THREE.SphereGeometry(0.11, 10, 8), CHROME, { bone: steer, at: [0, 1.04, 0.5], scale: [1, 1, 0.85], name: "lampShell" });
  glow(b.part(new THREE.CircleGeometry(0.085, 12), "#e8fbff", { bone: steer, at: [0, 1.04, 0.585], dir: [0, 0, 1], axis: "z", name: "lens" }), 1.8);
  b.part(new THREE.TorusGeometry(0.09, 0.012, 5, 14), ORANGE, { bone: steer, at: [0, 1.04, 0.58], name: "lampRing" });

  // fenders
  const arc = (c: P3, R: number, a0: number, a1: number): P3[] => {
    const out: P3[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = ((a0 + ((a1 - a0) * i) / 10) * Math.PI) / 180;
      out.push([0, c[1] + R * Math.sin(a), c[2] + R * Math.cos(a)]);
    }
    return out;
  };
  b.sweep(catmull(arc(AF, 0.37, 30, 125)), 0.045, { bone: steer, color: ORANGE, sides: 6, caps: "round", name: "fenderF" });
  b.sweep(catmull(arc(AR, 0.46, 80, 175)), 0.09, { bone: frame, color: ORANGE, sides: 6, caps: "round", name: "fenderR" });
  rod([0, 0.7, -0.62], [0, 0.88, -1.2], 0.02, GRAPH);

  // ---- tank (teardrop) with colour block
  const tankPaint = paint((p) => {
    if (Math.abs(p.x) < 0.018 && p.y > 0.95) return "#ffffff";
    return p.z > -0.05 ? ORANGE : GRAPH;
  });
  b.lathe(
    [[0, 0], [0.1, 0.03], [0.17, 0.18], [0.165, 0.38], [0.1, 0.55], [0.04, 0.62], [0, 0.64]],
    { at: [0, 0.88, -0.35], axis: [0, 0, 1], bone: frame, color: tankPaint, segments: 12, name: "tank" },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: frame, at: [s * 0.172, 0.88, -0.12], dir: [s, 0, 0], axis: "z", texture: EMBLEM, name: "emblem",
    });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), CHROME, { bone: frame, at: [0, 1.06, -0.14], name: "cap" });
  glow(b.sweep([[-0.0, 0.76, -0.3], [0, 0.74, 0.2]], 0.012, { bone: frame, color: CYAN, caps: "round", name: "tankGlow" }), 1.4);

  // ---- seat
  b.part(new THREE.SphereGeometry(1, 10, 6), LEATHER, { bone: frame, at: [0, 0.79, -0.62], scale: [0.2, 0.05, 0.3], name: "seat" });
  rod([0, 0.74, -0.45], [0, 0.82, -0.62], 0.015, CHROME);

  // ---- engine V-twin
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.4), GRAPH_L, { bone: frame, at: [0, 0.5, -0.1], name: "crankcase" });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), CHROME, { bone: frame, at: [0.16, 0.5, -0.1], dir: [1, 0, 0], name: "cover" });
  for (const [k, ang] of [["F", 28], ["R", -28]] as [string, number][]) {
    const a = (ang * Math.PI) / 180;
    const cx = 0, cy = 0.55 + 0.17 * Math.cos(a), cz = -0.1 + 0.17 * Math.sin(a);
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.3, 10), GRAPH, { bone: frame, at: [cx, cy, cz], rotation: [ang, 0, 0], name: `cyl${k}` });
    for (let i = 0; i < 4; i++) {
      const o = -0.09 + i * 0.06;
      b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.015, 10), CHROME, {
        bone: frame, at: [cx, cy + o * Math.cos(a) , cz + o * Math.sin(a)], rotation: [ang, 0, 0], name: "fin",
      });
    }
    b.part(new THREE.BoxGeometry(0.22, 0.09, 0.15), ORANGE, {
      bone: frame, at: [cx, cy + 0.2 * Math.cos(a), cz + 0.2 * Math.sin(a)], rotation: [ang, 0, 0], name: `head${k}`,
    });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 10), CHROME, { bone: frame, at: [0, 0.82, -0.1], name: "aircleaner" });

  // ---- exhaust
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.05, 0.62, 0.1], [s * 0.2, 0.52, 0.2], [s * 0.3, 0.38, 0.0], [s * 0.3, 0.38, -0.6], [s * 0.26, 0.46, -1.15], [s * 0.24, 0.5, -1.4]]),
      [0.035, 0.055],
      { bone: frame, color: CHROME, sides: 8, caps: "round", name: "pipe" },
    );
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), GRAPH, { bone: frame, at: [s * 0.24, 0.5, -1.41], dir: [0, 0, 1], name: "pipeMouth" });
    // footpeg
    rod([s * 0.2, 0.36, 0.0], [s * 0.34, 0.34, 0.0], 0.015, CHROME);
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), RUBBER, { bone: frame, at: [s * 0.38, 0.34, 0.0], dir: [1, 0, 0], name: "peg" });
  }

  // ---- tail light and strip
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 5), RED, { bone: frame, at: [0, 0.78, -1.28], scale: [1.3, 1, 1.4], name: "tail" }), 1.6);
  glow(b.sweep([[0.1, 0.35, 0.0], [0.1, 0.35, -0.7]], 0.01, { bone: frame, color: CYAN, caps: "round", name: "underL" }), 1.4);
  glow(b.sweep([[-0.1, 0.35, 0.0], [-0.1, 0.35, -0.7]], 0.01, { bone: frame, color: CYAN, caps: "round", name: "underR" }), 1.4);

  return b.root;
}
