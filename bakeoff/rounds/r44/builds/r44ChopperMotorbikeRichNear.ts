import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, catmull, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper",
  description: "Custom chopper motorbike with a long raked fork, teardrop tank, V-twin engine, fat rear tyre and glowing accents, in a bold Overwatch look.",
};

const NAVY = "#1f2747";
const ORANGE = "#ff7a1a";
const WHITE = "#eef2fb";
const STEEL = "#b3bdd4";
const DARK = "#14172b";
const RUBBER = "#17181f";
const GLOW = "#ffc766";
const CYAN = "#46e6ff";

const tank = paint((p, n) => {
  let c = mix("#e86a10", "#ff9a40", smoothstep(-0.3, 0.9, n.y));
  if (Math.abs(p.x) < 0.012) c = mix(c, WHITE, 0.9);
  if (Math.abs(p.z - 0.05) < 0.02) c = mix(c, NAVY, 0.9);
  return mix(c, "#7a3008", 0.25 * noise(p, 0.1, 3));
});
const tyre = paint((p, n) => (Math.abs(n.x) < 0.6 && Math.sin(Math.atan2(p.y, p.z) * 40) > 0.3 ? "#0b0c10" : RUBBER));

const BADGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="#1f2747" stroke="#ff7a1a" stroke-width="8"/><path d="M28 62 L50 24 L72 62 L50 52 Z" fill="#eef2fb"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "chopper", paintSize: 1024 });
  const frameJ = b.joint("frame", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: frameJ, at: [0, 0.95, 0.75], dir: [0, -0.8, 0.6], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.34, 1.55], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: [0, 0.4, -0.95], dir: [1, 0, 0], role: "hinge" });

  const wheel = (bone: any, z: number, y: number, R: number, w: number, nm: string) => {
    b.lathe(
      [[0.2, -w / 2], [R - 0.06, -w / 2], [R, -w * 0.3], [R, w * 0.3], [R - 0.06, w / 2], [0.2, w / 2]],
      { at: [0, y, z], axis: [1, 0, 0], bone, color: tyre, segments: 20, name: nm + "Tyre" },
    );
    b.lathe([[0.03, -w * 0.3], [R - 0.07, -w * 0.3], [R - 0.07, w * 0.3], [0.03, w * 0.3]], {
      at: [0, y, z], axis: [1, 0, 0], bone, color: STEEL, segments: 16, name: nm + "Rim",
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      b.part(new THREE.BoxGeometry(w * 0.2, 0.025, (R - 0.1) * 2), ORANGE, {
        bone, at: [0, y, z], rotation: [(a * 180) / Math.PI, 0, 0], name: nm + "Spoke",
      });
    }
    b.part(new THREE.CylinderGeometry(0.06, 0.06, w * 0.7, 10), ORANGE, { bone, at: [0, y, z], dir: [1, 0, 0], name: nm + "Hub" });
    glow(b.part(new THREE.TorusGeometry(R - 0.1, 0.012, 4, 24), CYAN, { bone, at: [0, y, z], dir: [1, 0, 0], axis: "z", name: nm + "Glow" }), 1.4);
  };
  wheel(wheelF, 1.55, 0.34, 0.34, 0.12, "front");
  wheel(wheelR, -0.95, 0.4, 0.4, 0.3, "rear");

  // frame tubes
  const tube = (pts: number[][], r: number, c: string, nm: string) =>
    b.sweep(catmull(pts), r, { bone: frameJ, color: c, sides: 8, name: nm });
  for (const s of [1, -1]) {
    tube([[s * 0.08, 0.95, 0.75], [s * 0.1, 0.8, 0.2], [s * 0.1, 0.55, -0.2], [s * 0.1, 0.45, -0.95]], 0.025, NAVY, "frameLow");
    tube([[s * 0.08, 0.98, 0.7], [s * 0.1, 0.98, 0.0], [s * 0.12, 0.8, -0.55], [s * 0.1, 0.45, -0.95]], 0.022, NAVY, "frameTop");
    // front fork (raked)
    b.rod([s * 0.1, 1.0, 0.8], [s * 0.1, 0.34, 1.55], 0.026, { bone: steer, color: STEEL, sides: 8, name: "fork" });
    b.rod([s * 0.1, 0.62, 1.2], [s * 0.1, 0.34, 1.55], 0.034, { bone: steer, color: DARK, sides: 8, name: "forkLower" });
    // exhaust
    b.sweep(catmull([[s * 0.2, 0.42, 0.25], [s * 0.3, 0.3, 0.0], [s * 0.3, 0.3, -0.7], [s * 0.26, 0.4, -1.3]]), [0.04, 0.05], {
      bone: frameJ, color: STEEL, sides: 8, name: "exhaust",
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 10), ORANGE, { bone: frameJ, at: [s * 0.26, 0.4, -1.32], dir: [0, 0.3, -1], name: "exhaustTip" });
    // pegs
    b.rod([s * 0.1, 0.4, -0.1], [s * 0.35, 0.36, -0.1], 0.02, { bone: frameJ, color: STEEL, name: "peg" });
    // rear fender strut
    b.rod([s * 0.1, 0.8, -0.5], [s * 0.17, 0.4, -0.95], 0.015, { bone: frameJ, color: STEEL, name: "strut" });
  }

  // engine
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.4), DARK, { bone: frameJ, at: [0, 0.5, 0.05], name: "crankcase" });
  for (const [a, z] of [[-35, 0.2], [35, -0.1]] as const) {
    b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.28, 8), STEEL, { bone: frameJ, at: [0, 0.72, z], rotation: [0, 0, a], name: "cylinder" });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), ORANGE, { bone: frameJ, at: [Math.sin((a * Math.PI) / 180) * -0.17, 0.82, z], rotation: [0, 0, a], name: "head" });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), STEEL, { bone: frameJ, at: [0.17, 0.5, 0.05], dir: [1, 0, 0], name: "cover" });

  // tank
  b.sweep(catmull([[0, 1.1, 0.6], [0, 1.14, 0.3], [0, 1.08, 0.0]]), (t) => [0.17 - 0.06 * t, 0.12 - 0.04 * t], {
    bone: frameJ, color: tank, sides: 12, caps: "round", name: "tank",
  });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { bone: frameJ, at: [s * 0.172, 1.1, 0.33], dir: [s, 0, 0], axis: "z", texture: BADGE, name: "badge" });
  // seat
  b.extrude([[-0.15, 0], [0.15, 0], [0.18, 0.4], [0, 0.5], [-0.18, 0.4]], {
    at: [0, 0.93, -0.55], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, color: NAVY, bone: frameJ, name: "seat",
  });
  // rear fender
  b.sweep(catmull([[0, 0.9, -0.5], [0, 0.88, -0.95], [0, 0.55, -1.3]]), [0.17, 0.17], {
    bone: frameJ, color: ORANGE, section: "box", name: "fender",
  });
  glow(b.part(new THREE.BoxGeometry(0.16, 0.04, 0.02), "#ff2d3d", { bone: frameJ, at: [0, 0.65, -1.32], name: "tailLight" }), 1.6);
  // handlebars
  b.rod([-0.5, 1.2, 0.72], [0.5, 1.2, 0.72], 0.016, { bone: steer, color: STEEL, name: "bars" });
  b.rod([0, 1.0, 0.8], [0, 1.2, 0.72], 0.025, { bone: steer, color: STEEL, name: "riser" });
  for (const s of [1, -1]) b.rod([s * 0.45, 1.2, 0.72], [s * 0.55, 1.2, 0.72], 0.022, { bone: steer, color: DARK, name: "grip" });
  // headlight
  b.part(new THREE.SphereGeometry(0.1, 10, 8), STEEL, { bone: steer, at: [0, 0.95, 1.0], scale: [1, 1, 0.8], name: "lampShell" });
  glow(b.part(new THREE.SphereGeometry(0.075, 10, 8), GLOW, { bone: steer, at: [0, 0.95, 1.05], scale: [1, 1, 0.6], name: "lamp" }), 1.8);
  // stand
  b.rod([0.12, 0.45, -0.1], [0.2, 0.0, -0.1], 0.015, { bone: frameJ, color: STEEL, name: "stand" });
  return b.root;
}
