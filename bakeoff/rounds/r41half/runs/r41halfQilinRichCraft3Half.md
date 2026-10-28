```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, bezier, countershade, scales, svg } from "agentic-3js-builder";
import { animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin",
  description: "Jade-scaled hooved chimera with golden antlers, dragon head, cloud mane and flame tail.",
};

const JADE = "#2fa58f", JADE_D = "#0f5a55", GOLD = "#f2c557", GOLD_D = "#b8842a", CREAM = "#fff0c8", HOOF = "#3a2a1a";

const cloudTex = svg(
  `<svg viewBox="0 0 64 64"><g stroke="#16706a" stroke-width="2.5" stroke-linejoin="round">
  <path d="M32 62 C30 48 34 36 32 4 C46 14 56 30 50 44 C46 54 40 60 32 62Z" fill="#8ee6dc"/>
  <path d="M32 62 C26 52 20 44 22 30 C24 20 28 14 32 4 C30 30 34 46 32 62Z" fill="#e8fffb"/>
  <circle cx="22" cy="44" r="9" fill="#bff3ec"/><circle cx="44" cy="40" r="8" fill="#6fd8d0"/></g>
  <path d="M30 56 Q36 40 33 14" stroke="#ffffff" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const flameTex = svg(
  `<svg viewBox="0 0 48 80"><path d="M24 78 C4 66 6 44 18 30 C16 42 22 46 24 40 C22 24 26 12 30 2 C34 20 46 34 44 54 C43 68 34 76 24 78Z" fill="#ff7a2a"/>
  <path d="M24 76 C12 68 14 52 22 44 C22 52 26 54 28 48 C30 56 36 62 32 70 C30 74 27 76 24 76Z" fill="#ffc94a"/>
  <path d="M24 74 C19 70 20 62 25 58 C28 64 30 68 24 74Z" fill="#fff6c8"/></svg>`,
  { size: 128 },
);
const emblemTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#0f5a55" stroke="#f2c557" stroke-width="4"/>
  <path d="M32 8 A24 24 0 0 1 32 56 A12 12 0 0 1 32 32 A12 12 0 0 0 32 8Z" fill="#f2c557"/>
  <circle cx="32" cy="20" r="3.5" fill="#0f5a55"/><circle cx="32" cy="44" r="3.5" fill="#f2c557"/></svg>`,
  { size: 128 },
);
const EYE = animeEye({ iris: "#ffb21c", blush: false });

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const R = rng(5);
  const COAT = countershade(scales([JADE, "#3dbba2", "#279080"], JADE_D, { size: 0.05 }), scales([CREAM, "#f3dca0"], GOLD_D, { size: 0.05 }), { level: -0.25 });

  const hips = b.joint("hips", { at: [0, 1.0, -0.45], role: "spine", dir: [0, 0, 1] });
  const spine = b.chain("spine", catmull([[0, 1.0, -0.45], [0, 1.02, 0], [0, 1.07, 0.45]]), { parent: hips, role: "spine" });
  const sj = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([[0, 1.07, 0.45], [0, 1.3, 0.66], [0, 1.58, 0.82]]), { parent: sj, role: "neck" });
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.58, 0.82], dir: [0, -0.08, 1], role: "head" });
  const tail = b.chain("tail", catmull([[0, 1.0, -0.45], [0, 1.0, -0.8], [0, 0.95, -1.15], [0, 0.82, -1.4]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tailTip"],
  });

  // body
  const body = b.sweep(spine, (t) => [0.19 + 0.05 * t, 0.24 + 0.04 * t], { color: COAT });
  const neckS = b.sweep(neck, (t) => 0.15 - 0.055 * t, { color: COAT });
  b.sweep(tail, [0.075, 0.03], { color: COAT });
  const bs = b.surface(body);
  b.sweep(bs.loop(spine.at(0.8), { lift: 0.012 }), 0.014, { color: GOLD, bone: spine });
  b.sweep(bs.loop(spine.at(0.1), { lift: 0.012 }), 0.014, { color: GOLD, bone: hips });
  for (const s of [1, -1]) {
    const hit = bs.around(spine.at(0.55).at).at(s * 90, 8);
    if (hit) b.decal(body, emblemTex, { at: hit, size: [0.22, 0.22], mirror: s < 0 });
  }

  // legs
  const legs: any[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fp = limb([s * 0.2, 0.98, 0.42], [s * 0.2, 0.07, 0.45], [0.5, 0.48], [[0, 0, 1]]);
    legs.push(b.chain(`legF${L}`, fp, { parent: spine.joints[1], role: "leg", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`] }));
    const hp = limb([s * 0.2, 1.0, -0.45], [s * 0.2, 0.07, -0.5], [0.4, 0.4, 0.28], [[0, 0, 1], [0, 0, -1]]);
    legs.push(b.chain(`legH${L}`, hp, { parent: hips, role: "leg", names: [`hip${L}`, `knee${L}`, `hock${L}`, `ankle${L}`] }));
  }
  for (const leg of legs) {
    b.sweep(leg, (t) => 0.085 - 0.045 * t, { color: COAT });
    const foot = leg.tip.at;
    b.part(new THREE.CylinderGeometry(0.05, 0.062, 0.07, 6), HOOF, { bone: leg.tip, at: [foot.x, 0.035, foot.z] });
    b.part(new THREE.BoxGeometry(0.014, 0.05, 0.05), "#1a1008", { bone: leg.tip, at: [foot.x, 0.04, foot.z + 0.05] });
    b.sweep(catmull([[foot.x, 0.14, foot.z], [foot.x, 0.1, foot.z]]), 0.052, { color: GOLD, bone: leg.tip, caps: "flat" });
    const items = b.ring(leg.tip, { count: 4, radius: 0.04 }).items;
    glow(b.cards(items, flameTex, { size: [0.08, 0.15], lean: 30, flow: [0, 1, -0.3], vary: 0.2, rng: R }), 1.1);
  }

  // head
  const hl = (f: number, u: number, l: number) => head.local({ forward: f, up: u, left: l });
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), COAT, { bone: head, at: hl(0.06, 0.02, 0), scale: [0.12, 0.11, 0.14] });
  b.frustumBox(hl(0.12, 0, 0), hl(0.4, -0.03, 0), [0.17, 0.15], [0.13, 0.1], { bone: head, color: JADE });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), GOLD_D, { bone: head, at: hl(0.41, -0.025, 0), scale: [1.6, 1, 1] });
  const jaw = b.joint("jaw", { parent: head, at: hl(0.12, -0.05, 0), aim: hl(0.38, -0.07, 0), role: "jaw" });
  b.frustumBox(hl(0.14, -0.075, 0), hl(0.38, -0.085, 0), [0.14, 0.05], [0.1, 0.04], { bone: jaw, color: CREAM });
  for (const s of [1, -1]) {
    b.spike(hl(0.32, -0.055, s * 0.045), [0, -1, 0], 0.055, 0.013, { bone: head, color: "#ffffff" });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), "#1a1008", { bone: head, at: hl(0.43, 0.0, s * 0.03) });
  }
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 42, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.065, 0.088], mirror: s > 0 });
    b.rod(hl(0.04, 0.1, s * 0.07), hl(0.17, 0.115, s * 0.1), 0.014, JADE_D, { bone: head });
    // whiskers
    b.sweep(bezier(hl(0.38, 0.0, s * 0.06), hl(0.4, -0.1, s * 0.3), hl(0.0, -0.25, s * 0.45)), [0.008, 0.002], { bone: head, color: GOLD, caps: { end: "point" } });
    // ears
    b.extrude([[0, 0], [0.04, 0.03], [0.05, 0.1, "sharp"], [-0.01, 0.07]], {
      at: hl(-0.03, 0.08, s * 0.1), x: [s, 0, -0.5], thickness: 0.012, color: JADE, bone: head, smoothing: 1,
    });
    // antlers
    const beam = catmull([hl(0.0, 0.1, s * 0.05), hl(-0.1, 0.25, s * 0.08), hl(-0.2, 0.42, s * 0.11), hl(-0.2, 0.62, s * 0.06)]);
    b.sweep(beam, [0.026, 0.008], { bone: head, color: GOLD, caps: { end: "point" } });
    [0.3, 0.55, 0.8].forEach((t, i) =>
      b.spike(beam.at(t), [s * 0.5, 0.7, 0.55], 0.17 - 0.04 * i, 0.014, { bone: head, color: i % 2 ? GOLD : "#ffe08a" }),
    );
    b.spike(beam.at(0.15), [s * 0.6, 0.2, -0.4], 0.12, 0.016, { bone: head, color: GOLD_D });
    // cheek cloud ruff
    const ch = skin.around(skull.at).at(s * 85, -15);
    if (ch) b.cards([ch], cloudTex, { size: [0.17, 0.2], lean: 70, flow: [0, -0.1, -1], bend: 20, cross: true, bone: head });
  }
  // forehead gem
  b.part(new THREE.OctahedronGeometry(0.03), "#ff5a6a", { bone: head, at: hl(0.14, 0.1, 0), scale: [0.7, 1.2, 0.7] });

  // cloud mane along neck and back
  const mane: any[] = [];
  b.along(neckS, 8, (at: any) => { mane.push(neckS.at(at.t, 0)); });
  b.along(neckS, 8, (at: any) => { mane.push(neckS.at(at.t, 55)); mane.push(neckS.at(at.t, -55)); });
  b.cards(mane, cloudTex, { size: [0.2, 0.26], lean: 55, flow: [0, -0.3, -1], bend: 25, vary: 0.25, spin: 15, rng: R, cross: true });
  const back: any[] = [];
  b.along(body, 6, (at: any) => { back.push(body.at(at.t, 0)); });
  b.cards(back, cloudTex, { size: [0.14, 0.18], lean: 60, flow: [0, -0.3, -1], vary: 0.2, rng: R, cross: true });

  // flame tail
  const tf = b.ring(tail.tip, { count: 6, radius: 0.02 }).items;
  glow(b.cards(tf, flameTex, { size: [0.2, 0.5], lean: 25, flow: [0, 0.3, -1], bend: 25, vary: 0.3, rng: R, cross: true }), 1.2);

  return b.root;
}
```