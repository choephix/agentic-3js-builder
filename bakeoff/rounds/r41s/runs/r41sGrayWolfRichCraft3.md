```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, limb, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gray Wolf (alert)",
  description: "Chunky Warcraft-style gray wolf standing alert, rigged with jaw, legs and tail.",
};

const DARK = "#23252b";
const BONE = "#efe9da";
const NOSE = "#15151a";

const coat = paint((p, n) => {
  const k = noise(p, 0.08, 3);
  let c = mix("#8e9196", "#585c64", smoothstep(0.3, 0.7, k));
  const back = smoothstep(0.1, 0.7, n.y) * smoothstep(0.35, 0.7, noise(p, 0.18, 5));
  c = mix(c, "#383c44", back * 0.6);
  c = mix(c, "#b8a888", smoothstep(0.55, 0.15, p.y) * 0.7);
  c = mix(c, "#ddd6c6", smoothstep(0.05, -0.6, n.y) * 0.85);
  return c;
});

const EYE = svg(
  `<svg viewBox="0 0 64 32"><path d="M2 22 Q30 -2 62 8 Q34 34 2 22Z" fill="#14100c"/>
  <path d="M10 21 Q30 5 54 10 Q34 28 10 21Z" fill="#ffb21c"/><path d="M10 21 Q30 5 54 10 Q40 12 10 21Z" fill="#c26a08"/>
  <ellipse cx="34" cy="17" rx="3.2" ry="7" fill="#100a06"/><circle cx="29" cy="14" r="2" fill="#fff"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 Q30 28 26 64 L6 64 Q2 28 16 0Z" fill="#f2f2f2"/>
  <path d="M16 6 Q18 34 16 64" stroke="#bdbdbd" stroke-width="2" fill="none"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const hips = b.joint("hips", { at: [0, 0.8, -0.35], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.8, -0.35], [0, 0.83, 0], [0, 0.88, 0.35]]),
    { parent: hips, names: ["spine1", "spine2", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([[0, 0.88, 0.35], [0, 1.0, 0.58], [0, 1.06, 0.74]]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const H = new THREE.Vector3(0, 1.06, 0.78);
  const hp = (x: number, y: number, z: number): [number, number, number] => [H.x + x, H.y + y, H.z + z];
  const head = b.joint("head", { parent: neck.tip!, at: H, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.06, 0.08), aim: hp(0, -0.07, 0.33), role: "jaw" });

  // body
  const body = b.sweep(spine, (t) => [0.12 + 0.045 * t, 0.15 + 0.05 * t], { color: coat, shift: [0, -0.02] });
  const neckS = b.sweep(neck, [0.14, 0.1], { color: coat });
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: spine.tip!, at: [0, 0.88, 0.36], scale: [0.18, 0.2, 0.2] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: spine.tip!, at: [s * 0.13, 0.96, 0.3], scale: [0.09, 0.13, 0.14] });

  // tail
  const tail = b.chain("tail", catmull([[0, 0.82, -0.35], [0, 0.8, -0.6], [0, 0.7, -0.85], [0, 0.52, -1.05]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  const tailS = b.sweep(tail, (t) => 0.055 + 0.07 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.01, {
    color: coat, bands: [[0.8, coat], [1, DARK]],
  });

  // legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fx = s * 0.14;
    const fp = limb([fx, 0.8, 0.33], [fx, 0.05, 0.38], [0.32, 0.3, 0.2], [[0, 0, -1], [0, 0, 1]]);
    const fl = b.chain(`legF${S}`, fp, {
      parent: spine.tip!, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`], role: "leg",
    });
    b.sweep(fl, (t) => [0.075 - 0.03 * t, 0.075 - 0.03 * t], { color: coat });
    const hx = s * 0.15;
    const hpp = limb([hx, 0.8, -0.35], [hx, 0.05, -0.42], [0.34, 0.34, 0.18], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${S}`, hpp, {
      parent: hips, names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`], role: "leg",
    });
    b.sweep(hl, (t) => [0.1 - 0.06 * t, 0.1 - 0.06 * t], { color: coat, shift: [0, 0] });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: hips, at: [s * 0.14, 0.78, -0.37], scale: [0.11, 0.16, 0.17] });
    for (const [x, z, tipJ] of [[fx, 0.38, fl.tip!], [hx, -0.42, hl.tip!]] as const) {
      b.part(new THREE.SphereGeometry(1, 8, 6), "#6d6e72", { bone: tipJ, at: [x, 0.045, z + 0.03], scale: [0.06, 0.047, 0.095] });
      for (const d of [-0.03, 0, 0.03])
        b.spike([x + d, 0.03, z + 0.1], [0, -0.25, 1], 0.05, 0.011, { color: DARK, bone: tipJ });
    }
  }

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 10), coat, { bone: head, at: hp(0, 0, 0.04), scale: [0.11, 0.1, 0.13] });
  b.frustumBox(hp(0, -0.02, 0.1), hp(0, -0.04, 0.34), [0.13, 0.11], [0.07, 0.065], { bone: head, color: "#a9aaa8" });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: hp(0, -0.012, 0.35), scale: [0.037, 0.03, 0.03] });
  b.frustumBox(hp(0, -0.075, 0.1), hp(0, -0.08, 0.33), [0.1, 0.04], [0.05, 0.035], { bone: jaw, color: "#d7d0c0" });
  for (const s of [1, -1]) {
    b.spike(hp(s * 0.03, -0.055, 0.31), [0, -1, 0.1], 0.045, 0.013, { color: BONE, bone: head });
    b.spike(hp(s * 0.028, -0.068, 0.31), [0, 1, 0.1], 0.04, 0.011, { color: BONE, bone: jaw });
    const ear = [[-0.055, 0], [0.055, 0], [0.0, 0.19, "sharp"]] as [number, number, "sharp"][];
    const ey = [s * 0.15, 1, -0.12] as [number, number, number];
    b.extrude(ear, { at: hp(s * 0.075, 0.07, -0.02), x: [s, 0, 0], y: ey, thickness: 0.022, color: coat, bone: head });
    b.extrude(
      [[-0.03, 0.015], [0.03, 0.015], [0, 0.14, "sharp"]] as [number, number, "sharp"][],
      { at: hp(s * 0.075, 0.07, -0.0), x: [s, 0, 0], y: ey, thickness: 0.012, color: "#caa59a", bone: head },
    );
    // brow ridge
    b.rod(hp(s * 0.03, 0.06, 0.14), hp(s * 0.1, 0.075, 0.08), 0.014, { color: "#3c4047", bone: head });
    glow(
      b.decal(skull, EYE, {
        at: hp(s * 0.07, 0.03, 0.12), dir: [s * 0.5, 0.1, 0.85], size: [0.075, 0.04], mirror: s < 0, roll: s * -12,
      }),
      0.8,
    );
  }

  // fur cards: neck ruff, back mane, tail
  const ruff = b.surface(neckS).scatter(70, { rng: rng(2), minDist: 0.035 });
  b.cards(ruff, TUFT, { size: [0.06, 0.13], lean: 55, bend: 20, vary: 0.3, rng: rng(3), color: coat });
  const mane = b.surface(body).scatter(60, { rng: rng(4), minDist: 0.05, filter: (h) => h.n.y > 0.3 && h.at.z > -0.1 });
  b.cards(mane, TUFT, { size: [0.05, 0.1], lean: 60, bend: 20, vary: 0.3, rng: rng(5), color: coat });
  const tf = b.surface(tailS).scatter(40, { rng: rng(6), minDist: 0.05 });
  b.cards(tf, TUFT, { size: [0.05, 0.11], lean: 50, bend: 20, vary: 0.3, rng: rng(7), color: coat });

  return b.root;
}
```