```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle, paint, mix, noise, smoothstep, rng, svg, offset } from "agentic-3js-builder";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching stone gargoyle with bat wings, horns and a grinning jaw, perched on a gothic ledge.",
};

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(5);

  const STONE = countershade(mottle("#7d7f82", "#5d6064", { size: 0.12, seed: 3 }), "#4b4d52", { level: -0.2 });
  const MOSS = paint((p, n) => {
    const m = smoothstep(0.55, 0.75, noise(p, 0.1, 9)) * smoothstep(0.3, 0.9, n.y);
    return mix(mix("#85888b", "#5c5f63", noise(p, 0.15, 2)), "#5d7a3a", m * 0.8);
  });
  const DARK = "#3a3c41";
  const HORN = "#c9c3b0";
  const EYE = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1a1410"/><circle cx="20" cy="20" r="12" fill="#ffb02a"/><rect x="17" y="6" width="6" height="28" rx="3" fill="#120c08"/><circle cx="14" cy="14" r="3" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#6a6c70"/><path d="M32 6 L56 26 L48 58 H16 L8 26Z" fill="none" stroke="#2b2c30" stroke-width="3"/><path d="M32 16 V50 M20 30 H44 M24 42 L32 34 L40 42" stroke="#2b2c30" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );

  // Ledge
  const hips = b.joint("hips", { at: [0, 0.42, -0.2] });
  b.part(new THREE.BoxGeometry(1.0, 0.16, 0.8), STONE, { bone: hips, at: [0, 0.08, 0], flat: true });
  b.part(new THREE.BoxGeometry(1.08, 0.05, 0.86), MOSS, { bone: hips, at: [0, 0.18, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.4, 0.4, 0.02), RUNE, { bone: hips, at: [0, 0.08, 0.4], texture: RUNE });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.14, 0.82), STONE, { bone: hips, at: [s * 0.5, 0.05, 0], flat: true });
  }

  // Spine chain: hips -> chest, crouched
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.52, -0.3],
      [0, 0.6, -0.1],
      [0, 0.78, 0.1],
      [0, 0.92, 0.22],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  b.sweep(spine, [0.17, 0.2, 0.22, 0.2].length ? (t: number) => [0.2 + 0.05 * Math.sin(t * 3), 0.17 + 0.05 * t] : 0.2, {
    color: STONE,
    section: { ngon: 8 },
  });
  const chest = spine.joints[2];

  // Neck + head
  const neck = b.chain("neck", catmull([[0, 0.92, 0.22], [0, 1.0, 0.34], [0, 1.06, 0.46]]), {
    parent: chest,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  b.sweep(neck, 0.11, { color: STONE, section: { ngon: 8 } });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.06, 0.46], dir: [0, 0, 1], role: "head" });
  const H = 1;
  const hp = (x: number, y: number, z: number) => head.local({ right: -x, up: y, forward: z });
  b.part(new THREE.BoxGeometry(0.32 * H, 0.26 * H, 0.3 * H), STONE, { bone: head, at: hp(0, 0.04, 0.08), flat: true });
  // brow
  b.part(new THREE.BoxGeometry(0.36, 0.06, 0.14), DARK, { bone: head, at: hp(0, 0.17, 0.18), flat: true });
  // snout / upper jaw
  b.part(new THREE.BoxGeometry(0.22, 0.1, 0.2), STONE, { bone: head, at: hp(0, -0.03, 0.28), flat: true });
  b.part(new THREE.BoxGeometry(0.1, 0.04, 0.06), DARK, { bone: head, at: hp(0, 0.03, 0.4), flat: true });
  // jaw
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.08, 0.15), dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.22), STONE, { bone: jaw, at: hp(0, -0.12, 0.27), flat: true });
  for (const s of [1, -1]) {
    // fangs
    b.part(new THREE.ConeGeometry(0.02, 0.08, 5), HORN, { bone: head, at: hp(s * 0.07, -0.1, 0.36), rotation: [180, 0, 0] });
    b.part(new THREE.ConeGeometry(0.02, 0.07, 5), HORN, { bone: jaw, at: hp(s * 0.06, -0.07, 0.34) });
    // eyes
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      bone: head, at: hp(s * 0.11, 0.1, 0.245), dir: [s * 0.3, 0, 1], axis: "z", texture: EYE,
    });
    // horns
    b.sweep(catmull([hp(s * 0.1, 0.14, 0.0), hp(s * 0.2, 0.3, -0.08), hp(s * 0.2, 0.42, -0.2)]), [0.05, 0.005], {
      bone: head, color: HORN, caps: { end: "point" }, sides: 6,
    });
    // ears
    b.extrude([[0, 0], [0.1, 0.02], [0.04, 0.14], [0, 0.08]], {
      at: hp(s * 0.15, 0.06, -0.02), x: [s, 0, 0], thickness: 0.02, color: DARK, bone: head,
    });
  }

  // Arms (planted on ledge)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([[s * 0.24, 0.88, 0.2], [s * 0.3, 0.62, 0.34], [s * 0.28, 0.5, 0.55]]),
      { parent: chest, role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    b.sweep(arm, [0.09, 0.06], { color: STONE, section: { ngon: 7 } });
    for (let i = 0; i < 3; i++) {
      const x = s * (0.28 + (i - 1) * 0.06);
      const claw = b.chain(`digit${side}${i}`, [[x, 0.5, 0.55], [x, 0.48, 0.64], [x, 0.46, 0.7]], {
        parent: arm.tip ?? arm.joints[2], role: "digit", names: [`f${side}${i}a`, `f${side}${i}b`],
      });
      b.sweep(claw, [0.025, 0.008], { color: DARK, sides: 5, caps: { end: "point" } });
    }
    // Legs: crouched haunches
    const leg = b.chain(
      `leg${side}`,
      catmull([[s * 0.26, 0.6, -0.35], [s * 0.34, 0.5, -0.1], [s * 0.26, 0.2, 0.05]]),
      { parent: hips, role: "leg", names: [`hip${side}`, `knee${side}`, `ankle${side}`] },
    );
    b.sweep(leg, [0.14, 0.07], { color: STONE, section: { ngon: 7 } });
    b.part(new THREE.SphereGeometry(0.16, 8, 6), STONE, { bone: leg.joints[0], at: [s * 0.27, 0.52, -0.33] });
    b.part(new THREE.BoxGeometry(0.16, 0.05, 0.3), STONE, { bone: leg.joints[1], at: [s * 0.26, 0.22, 0.12], flat: true });
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.26 + (i - 1) * 0.05), 0.22, 0.27], [0, -0.2, 1], 0.08, 0.018, { color: DARK, bone: leg.joints[1] });
  }

  // Wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w = b.chain(
      `wing${side}`,
      catmull([[s * 0.2, 0.95, 0.0], [s * 0.55, 1.35, -0.25], [s * 0.95, 1.55, -0.4]]),
      { parent: chest, role: "wing", names: [`wingA${side}`, `wingB${side}`, `wingC${side}`] },
    );
    b.sweep(w, [0.05, 0.025], { color: STONE, sides: 6 });
    const tips: THREE.Vector3[] = [];
    for (let i = 0; i < 3; i++) {
      const tip = new THREE.Vector3(s * (1.15 - i * 0.12), 0.95 - i * 0.12 + 0.05, -0.55 - i * 0.12);
      tips.push(tip);
      const f = b.chain(`wf${side}${i}`, [[s * 0.95, 1.55, -0.4], tip.toArray()], {
        parent: w.joints[2], role: "digit", names: [`wfing${side}${i}`],
      });
      b.sweep(f, [0.025, 0.01], { color: STONE, sides: 5, caps: { end: "point" } });
    }
    b.slab([[s * 0.2, 0.95, -0.02], [s * 0.95, 1.55, -0.42], tips[0].toArray(), tips[1].toArray(), tips[2].toArray(), [s * 0.22, 0.6, -0.3]],
      { color: MOSS, thickness: 0.025, bone: chest });
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.5, -0.35], [0, 0.35, -0.6], [0.2, 0.28, -0.85], [0.3, 0.3, -1.0]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"],
  });
  b.sweep(tail, [0.09, 0.02], { color: STONE, sides: 7 });
  b.extrude([[0, 0], [0.09, 0.03], [0.14, 0.14], [0.02, 0.1]], {
    at: [0.3, 0.3, -1.0], x: [0, 0, -1], thickness: 0.02, color: DARK, bone: tail.joints[2],
  });

  // Dorsal spines
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    b.spike([0, 0.68 + t * 0.26, -0.18 + t * 0.4], [0, 1, -0.3], 0.1 - t * 0.03, 0.025, { color: DARK, bone: spine.joints[Math.min(2, Math.floor(t * 3))] });
  }
  void R; void offset;
  return b.root;
}
```