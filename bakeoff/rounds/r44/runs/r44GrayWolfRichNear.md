```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, mix, noise, paint, smoothstep, grain, frame } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Gray Wolf",
  description: "A alert gray wolf in a hand-painted Warcraft style: heavy ruff, pale muzzle, amber eyes, bristled tail.",
};

const FUR_D = "#2b2d33", FUR_M = "#5b5f69", FUR_L = "#9a9a98", CREAM = "#d8cdb2", AMBER = "#f0a81c";
const NOSE = "#16101a", EAR_IN = "#b58a78", TEETH = "#f4ecd2", MOUTH = "#6a2330", CLAW = "#3a3028";

const coat = paint((p, n) => {
  let c = mix(FUR_M, FUR_L, smoothstep(0.0, 0.9, n.y) * 0.7 + noise(p, 0.05, 3) * 0.3);
  c = mix(c, FUR_D, smoothstep(0.1, 0.9, n.y) * smoothstep(0.55, 0.8, noise(p, 0.14, 7)) * 0.7);
  c = mix(c, CREAM, smoothstep(-0.2, -0.8, n.y) * 0.85);
  c = mix(c, FUR_D, smoothstep(0.3, 0.1, p.y) * 0.6);
  if (p.z > 1.0 && p.y < 0.75) c = mix(c, CREAM, 0.6);
  return c;
});
const bristle = paint((p, n) => mix(mix(FUR_D, FUR_L, noise(p, 0.1, 2)), CREAM, smoothstep(0.2, 0.9, n.y) * 0.2));
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#777"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><polygon points="2,64 10,64 5,6" fill="url(#g)"/><polygon points="9,64 22,64 16,0" fill="url(#g)"/><polygon points="20,64 30,64 28,10" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M2 28 Q30 -2 62 12 Q40 40 2 28Z" fill="#14101a"/><path d="M12 25 Q32 6 54 14 Q38 32 12 25Z" fill="#f0a81c"/><circle cx="36" cy="20" r="6" fill="#14101a"/><circle cx="32" cy="16" r="2.4" fill="#fff"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "wolf", paintSize: 1024 });

  const hips = b.joint("hips", { at: [0, 0.78, -0.45], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.78, -0.45], [0, 0.82, 0.0], [0, 0.88, 0.4]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.88, 0.4], [0, 1.0, 0.62], [0, 1.1, 0.78]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 0.78], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.0, 0.95], aim: [0, 0.98, 1.2], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.8, -0.7], [0, 0.72, -0.95], [0, 0.55, -1.15], [0, 0.4, -1.25]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  const body = b.loft(
    [
      { at: [0, 0.78, -0.7], w: 0.22, h: 0.26 },
      { at: [0, 0.78, -0.45], w: 0.3, h: 0.34 },
      { at: [0, 0.82, 0.0], w: 0.3, h: 0.38 },
      { at: [0, 0.88, 0.4], w: 0.36, h: 0.46 },
      { at: [0, 1.0, 0.62], w: 0.26, h: 0.36 },
      { at: [0, 1.1, 0.78], w: 0.22, h: 0.26 },
    ],
    { bone: [hips, spine, neck], color: coat, sides: 8 },
  );
  b.sweep(tail, [0.07, 0.025], { color: bristle, sides: 6 });
  b.sweep(tail, (t) => 0.06 + 0.06 * Math.sin(t * 3) , { color: bristle, sides: 6 });

  // head
  const skull = b.loft(
    [
      { at: [0, 1.1, 0.8], w: 0.25, h: 0.26 },
      { at: [0, 1.08, 0.95], w: 0.22, h: 0.22 },
      { at: [0, 1.03, 1.1], w: 0.13, h: 0.13 },
      { at: [0, 1.0, 1.25], w: 0.09, h: 0.09 },
    ],
    { bone: head, color: coat, sides: 8, caps: { start: "round", end: "flat" } },
  );
  b.loft(
    [
      { at: [0, 0.94, 0.98], w: 0.12, h: 0.06 },
      { at: [0, 0.93, 1.12], w: 0.09, h: 0.05 },
      { at: [0, 0.94, 1.24], w: 0.07, h: 0.04 },
    ],
    { bone: jaw, color: CREAM, sides: 6 },
  );
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.2), MOUTH, { bone: jaw, at: [0, 0.965, 1.12] });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), NOSE, { bone: head, at: [0, 1.015, 1.27], scale: [1.1, 0.8, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.012, 0.045, 5), TEETH, { bone: head, at: [s * 0.035, 0.955, 1.2], dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.011, 0.04, 5), TEETH, { bone: jaw, at: [s * 0.03, 0.985, 1.2] });
    b.decal(skull, EYE, { at: [s * 0.1, 1.12, 1.0], dir: [s * 0.8, 0.1, 0.5], size: [0.09, 0.056], mirror: s < 0 });
    b.part(new THREE.ConeGeometry(0.01, 0.025, 4), FUR_D, { bone: head, at: [s * 0.1, 1.17, 1.0], dir: [s * 0.4, 0.8, 0.6] });
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.1, 1.2, 0.82], dir: [s * 0.25, 1, -0.1], role: "hinge" });
    b.spike(ear, [s * 0.25, 1, -0.1], 0.2, 0.065, { color: FUR_D, sides: 4, bone: ear });
    b.spike([s * 0.1, 1.205, 0.835], [s * 0.25, 1, -0.1], 0.15, 0.04, { color: EAR_IN, sides: 4, bone: ear });
  }
  // cheek ruff and mane
  const skin = b.surface([body, skull]);
  const ruff = skin.scatter(120, { rng: rng(3), minDist: 0.05, filter: (h) => h.at.z > 0.4 && h.at.z < 1.0 && h.n.y < 0.6 });
  b.cards(ruff, TUFT, { size: [0.06, 0.14], lean: 65, bend: 20, vary: 0.3, rng: rng(4), color: "#b4b0a4" });
  const fur = b.surface(body).scatter(240, { rng: rng(5), minDist: 0.06, filter: (h) => h.n.y > -0.3 });
  b.cards(fur, TUFT, { size: [0.045, 0.1], lean: 68, bend: 20, vary: 0.3, rng: rng(6), color: "#7c7e86" });
  b.cards([frame(tail.at(1), [0, -1, -0.2])], TUFT, { size: [0.1, 0.16], lean: 20, cross: true, color: FUR_D });
  // dorsal bristles
  for (let i = 0; i < 12; i++) {
    const p = body.at(0.35 + i * 0.05, 0);
    b.spike(p, p, 0.1, 0.03, { color: FUR_D, sides: 4, bone: p.bone ?? chest });
  }

  // legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const mk = (front: boolean) => {
      const z = front ? 0.4 : -0.55;
      const pts = limb([s * 0.17, 0.74, z], [s * 0.15, 0.05, z + 0.03], front ? [0.36, 0.34] : [0.34, 0.3, 0.2], front ? [[0, 0, -1]] : [[0, 0, 1], [0, 0, -1]]);
      const nm = front ? [`shoulder${k}`, `elbow${k}`, `paw${k}`] : pts.length === 4 ? [`hip${k}`, `knee${k}`, `hock${k}`, `pawH${k}`] : [`hip${k}`, `knee${k}`, `pawH${k}`];
      const ch = b.chain(`leg${front ? "F" : "H"}${k}`, pts, { parent: front ? chest : hips, names: nm, role: "leg", contact: [s * 0.15, 0, z] });
      b.sweep(ch, front ? [0.075, 0.04] : [0.1, 0.04], { color: coat, sides: 7 });
      const tip = ch.tip!;
      b.part(new THREE.SphereGeometry(0.06, 7, 5), FUR_D, { bone: tip, at: [s * 0.15, 0.04, z + 0.08], scale: [0.85, 0.6, 1.5] });
      for (const o of [-0.03, 0, 0.03]) b.spike([s * 0.15 + o, 0.02, z + 0.15], [0, -0.2, 1], 0.04, 0.012, { color: CLAW, bone: tip, sides: 4 });
    };
    mk(true);
    mk(false);
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
```