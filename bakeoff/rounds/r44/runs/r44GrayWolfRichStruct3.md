```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, grain, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Gray Wolf",
  description: "A hand-painted, Warcraft-style gray wolf standing alert: heavy shoulders, bristling ruff, wedge muzzle with fangs, pricked ears, bushy tail.",
};

const DARK = "#2b2c33", MID = "#6c6d76", LIGHT = "#b4b0a6", CREAM = "#d9d0bb";
const NOSE = "#16120f", EYE = "#f0b020", FANG = "#f2ead0", MOUTH = "#6a2330", CLAW = "#2a2420", EARIN = "#8c6a62";

const coat = paint((p, n) => {
  const g = grain(MID, LIGHT, { size: 0.02, axis: "z", seed: 3 }).at(p, n);
  let c = mix(DARK, g, smoothstep(-0.3, 0.8, n.y));
  c = mix(c, CREAM, smoothstep(-0.2, -0.8, n.y) * 0.9);
  c = mix(c, DARK, smoothstep(0.55, 0.8, noise(p, 0.2, 4)) * 0.35);
  c = mix(c, DARK, smoothstep(0.8, 0.9, n.y) * smoothstep(0.03, 0, Math.abs(p.x)) * 0.5);
  return c;
});
const tuftTex = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><polygon points="3,64 9,64 5,6" fill="#aaa"/><polygon points="10,64 20,64 16,0" fill="#fff"/><polygon points="21,64 29,64 28,10" fill="#ccc"/></svg>`, { size: 96 });

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const hips = b.joint("hips", { at: [0, 0.78, -0.45], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.8, -0.1], [0, 0.88, 0.25], [0, 0.9, 0.55]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.9, 0.55], [0, 1.0, 0.75], [0, 1.1, 0.9]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 0.9], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 1.0], aim: [0, 1.0, 1.3], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.8, -0.7], [0, 0.72, -0.95], [0, 0.6, -1.2], [0, 0.45, -1.4]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  const body = b.loft([
    { at: [0, 0.78, -0.72], w: 0.26, h: 0.28 }, { at: [0, 0.8, -0.4], w: 0.3, h: 0.34 },
    { at: [0, 0.84, 0.0], w: 0.3, h: 0.32 }, { at: [0, 0.9, 0.35], w: 0.36, h: 0.42 },
    { at: [0, 0.96, 0.62], w: 0.32, h: 0.38 }, { at: [0, 1.08, 0.88], w: 0.22, h: 0.26 },
  ], { bone: [hips, spine, neck], color: coat, sides: 10 });
  b.sweep(tail, [0.07, 0.1, 0.06, 0.01], { color: coat, sides: 8 });

  const skull = b.loft([
    { at: [0, 1.12, 0.92], w: 0.2, h: 0.2 }, { at: [0, 1.1, 1.05], w: 0.18, h: 0.18 },
    { at: [0, 1.05, 1.2], w: 0.1, h: 0.1 }, { at: [0, 1.03, 1.32], w: 0.08, h: 0.075 },
  ], { bone: head, color: coat, sides: 8 });
  b.loft([{ at: [0, 1.0, 1.02], w: 0.1, h: 0.04 }, { at: [0, 0.99, 1.2], w: 0.075, h: 0.035 }, { at: [0, 1.0, 1.31], w: 0.06, h: 0.03 }],
    { bone: jaw, color: CREAM, sides: 6 });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NOSE, { bone: head, at: [0, 1.06, 1.36], scale: [1.2, 0.9, 1] });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.22), MOUTH, { bone: jaw, at: [0, 1.015, 1.18] });
  for (const s of [1, -1]) {
    b.cone = undefined;
    b.part(new THREE.ConeGeometry(0.01, 0.045, 5), FANG, { bone: head, at: [s * 0.03, 1.0, 1.29], dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.008, 0.035, 5), FANG, { bone: jaw, at: [s * 0.028, 1.03, 1.27] });
    const eyeAt: [number, number, number] = [s * 0.08, 1.15, 1.1];
    b.part(new THREE.SphereGeometry(0.02, 8, 6), EYE, { bone: head, at: eyeAt, scale: [0.8, 0.9, 1.2] });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), NOSE, { bone: head, at: [s * 0.093, 1.15, 1.115] });
    b.capsule([s * 0.045, 1.2, 1.07], [s * 0.1, 1.18, 1.14], 0.011, { bone: head, color: DARK, sides: 5 });
    const earJ = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.08, 1.26, 0.95], dir: [s * 0.2, 1, -0.1], role: "hinge" });
    b.extrude([[-0.06, 0], [0.06, 0], [0.04, 0.12], [0, 0.2, "sharp"], [-0.04, 0.12]], {
      at: [s * 0.08, 1.26, 0.95], x: [1, 0, 0], y: [s * 0.2, 1, -0.1], thickness: 0.025, bevel: 0.005, color: DARK, bone: earJ });
    b.extrude([[-0.035, 0.01], [0.035, 0.01], [0, 0.14]], {
      at: [s * 0.08, 1.262, 0.965], x: [1, 0, 0], y: [s * 0.2, 1, -0.1], thickness: 0.012, color: EARIN, bone: earJ });
  }

  const radii = [0.07, 0.055, 0.04, 0.035, 0.032];
  const legs: any[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const mk = (front: boolean) => {
      const z = front ? 0.5 : -0.5, x = s * (front ? 0.14 : 0.13);
      const pts = limb([x, 0.76, z], [x, 0.045, z + 0.05], front ? [0.28, 0.28, 0.12] : [0.3, 0.3, 0.14],
        front ? [[0, 0, -1], [0, 0, 1], [0, 0, -1]] : [[0, 0, 1], [0, 0, -1], [0, 0, 1]]);
      const nm = front ? ["shoulder", "elbow", "wrist", "paw"] : ["hip", "knee", "hock", "pawH"];
      const ch = b.chain(`leg${front ? "F" : "H"}${L}`, pts, { parent: front ? chest : hips, names: nm.map((n) => n + L), role: "leg", contact: [x, 0, z + 0.1] });
      legs.push(b.sweep(ch, front ? radii : [0.085, 0.06, 0.04, 0.033, 0.03], { color: coat, sides: 8 }));
      b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: ch.tip!, at: [x, 0.04, z + 0.1], scale: [0.045, 0.04, 0.09] });
      for (const k of [-1, 0, 1]) b.spike([x + k * 0.025, 0.02, z + 0.17], [0, -0.2, 1], 0.03, 0.009, { bone: ch.tip!, color: CLAW, sides: 5 });
      if (front) b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: ch.joints[0], at: [x, 0.8, z - 0.02], scale: [0.09, 0.17, 0.15] });
      else b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: ch.joints[0], at: [x, 0.76, z], scale: [0.1, 0.18, 0.17] });
    };
    mk(true); mk(false);
  }

  const r = rng(5);
  const skin = b.surface([body, ...legs]);
  b.cards(skin.scatter(300, { rng: r, minDist: 0.06, filter: (h) => h.n.y > -0.4 && h.at.y > 0.3 }), tuftTex,
    { size: [0.05, 0.1], lean: 65, bend: 20, vary: 0.3, rng: rng(6), color: "#9a9890", flow: [0, -0.3, -1] });
  const ruff: any[] = [];
  for (let i = 0; i < 24; i++) ruff.push(body.at(0.62 + 0.36 * (i / 23), (i % 6) * 60 - 150));
  b.cards(ruff, tuftTex, { size: [0.08, 0.17], lean: 55, bend: 15, vary: 0.25, rng: rng(7), color: "#c9c4b8", cross: true, flow: [0, -0.4, -1] });
  b.cards([tail.at(1)], tuftTex, { size: [0.1, 0.2], lean: 20, cross: true, color: DARK, flow: [0, -1, -0.3] });

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
```