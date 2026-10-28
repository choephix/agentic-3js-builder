```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb } from "agentic-3js-builder";
import { paint, cells, mix, smoothstep, svg } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Lava Golem",
  description: "Basalt-plated golem with molten seams, glowing core, eyes and mouth, in a cel-shaded Genshin-like style.",
};

const LAVA = "#ff7a1a";
const LAVA_HOT = "#ffd25a";
const BASALT_LIT: [number, number, number] = [0.3, 0.27, 0.34];
const BASALT_LIT2: [number, number, number] = [0.42, 0.37, 0.43];

// basalt with cracks of orange between cells, warm on top
const crack = paint((p, n) => {
  const c = cells(p, 0.22, 4);
  const e = c.d2 - c.d1;
  if (e < 0.05 && p.y < 2.6 && n.y < 0.7) return LAVA;
  const base = mix(BASALT_LIT, BASALT_LIT2, c.id);
  return mix(base, "#6b5560", Math.max(0, n.y) * 0.35);
});
const BASALT = cel(crack, "#1d1a28");
const PLATE = cel(paint((p, n) => mix("#4a4350", "#6d6070", cells(p, 0.18, 9).id * 0.7 + Math.max(0, n.y) * 0.2)), "#241f30");
const DARK = cel("#2a2533", "#15121d");
const TOOTH = cel("#f2e6c8", "#b9a888");

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const rand = rng(11);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 1.35, 0] });
  const spine = b.chain("spine", catmull([[0, 1.35, 0], [0, 1.8, 0.04], [0, 2.3, 0.07]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.chain("neck", [[0, 2.3, 0.07], [0, 2.46, 0.13]], { parent: spine.joints[1], names: ["neck1"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 2.46, 0.13], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.56, 0.05], dir: [0, 0, 1], role: "jaw" });

  // ---- torso
  const torso = b.loft(
    [
      { at: [0, 1.4, 0], w: 0.62, h: 0.46 },
      { at: [0, 1.8, 0.04], w: 0.92, h: 0.6 },
      { at: [0, 2.2, 0.06], w: 1.18, h: 0.66 },
      { at: [0, 2.42, 0.08], w: 0.6, h: 0.44 },
    ],
    { bone: spine, color: BASALT },
  );
  b.part(new THREE.BoxGeometry(0.7, 0.3, 0.5), PLATE, { bone: hips, at: [0, 1.3, 0], flat: true });

  // core
  const core = b.part(new THREE.OctahedronGeometry(0.13, 0), LAVA_HOT, { bone: spine.joints[0], at: [0, 1.98, 0.36], scale: [1, 1.3, 0.8] });
  glow(core, 1.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    glow(b.part(new THREE.ConeGeometry(0.03, 0.12, 5), LAVA, {
      bone: spine.joints[0], at: [Math.cos(a) * 0.2, 1.98 + Math.sin(a) * 0.2, 0.34],
      dir: [Math.cos(a), Math.sin(a), 0.4],
    }), 1.3);
  }
  // draped crack seams
  const skin = b.surface(torso);
  const seams = [
    [[0, 1.98, 0.6], [-0.2, 1.7, 0.6], [-0.15, 1.5, 0.6], [-0.3, 1.4, 0.5]],
    [[0, 1.98, 0.6], [0.25, 2.2, 0.6], [0.3, 2.4, 0.5]],
    [[0, 1.98, 0.6], [-0.28, 2.15, 0.6], [-0.4, 2.35, 0.5]],
    [[0, 1.98, 0.6], [0.2, 1.75, 0.6], [0.3, 1.5, 0.5]],
  ];
  for (const sp of seams) glow(b.sweep(skin.drape(catmull(sp), { lift: 0.012 }), [0.016, 0.008], { color: LAVA, caps: "flat" }), 1.2);
  // back shards
  for (const h of skin.scatter(16, { rng: rand, minDist: 0.2, filter: (x) => x.n.z < -0.2 && x.at.y > 1.6 }))
    b.stick(new THREE.ConeGeometry(0.07, 0.3, 5), DARK, h, { embed: 0.2 });
  for (const h of skin.scatter(8, { rng: rand, minDist: 0.25, filter: (x) => x.n.z > 0.4 && x.at.y > 1.5 }))
    b.stick(new THREE.OctahedronGeometry(0.06, 0), LAVA, h, { embed: 0.4 });

  // ---- head
  b.part(new THREE.BoxGeometry(0.5, 0.28, 0.44), BASALT, { bone: head, at: [0, 2.7, 0.16], flat: true });
  b.part(new THREE.BoxGeometry(0.56, 0.1, 0.3), PLATE, { bone: head, at: [0, 2.86, 0.1], flat: true });
  b.part(new THREE.BoxGeometry(0.54, 0.07, 0.1), DARK, { bone: head, at: [0, 2.78, 0.37], rotation: [-15, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.42, 0.14, 0.38), BASALT, { bone: jaw, at: [0, 2.5, 0.2], flat: true });
  glow(b.part(new THREE.PlaneGeometry(0.32, 0.05), LAVA_HOT, { bone: head, at: [0, 2.565, 0.382], dir: [0, 0, 1], axis: "z" }), 1.6);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    b.part(new THREE.ConeGeometry(0.02, 0.06, 4), TOOTH, { bone: jaw, at: [s * (0.04 + i * 0.06), 2.6, 0.39], dir: [0, 1, 0] });
  }
  const eye = (flip: number) => svg(`<svg viewBox="0 0 64 32"><path d="M2 ${flip > 0 ? 4 : 20} L62 ${flip > 0 ? 18 : 6} L56 28 L6 24 Z" fill="#ffb02a" stroke="#fff3a0" stroke-width="3"/><ellipse cx="32" cy="16" rx="7" ry="8" fill="#fff6c0"/></svg>`, { size: 128 });
  const eyes: Record<number, THREE.Texture> = { 1: eye(1), [-1]: eye(-1) };
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.15, 0.075), "#ffffff", { bone: head, at: [s * 0.13, 2.7, 0.384], dir: [0, 0, 1], axis: "z", texture: eyes[s] }), 1.6);
  for (const s of [1, -1]) {
    b.spike([s * 0.2, 2.86, 0.0], [s * 0.5, 1, -0.5], 0.42, 0.07, { color: DARK, bone: head, sides: 5 } as never);
    b.spike([s * 0.27, 2.78, 0.1], [s * 1, 0.3, 0], 0.2, 0.05, { color: PLATE, bone: head } as never);
  }

  // ---- arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.62, 2.22, 0], [s * 1.7, 1.35, 0.1], [0.7, 0.7], [[0, 0, -1]]);
    const arm = b.chain(`arm${L}`, pts, { parent: spine.joints[1], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" });
    b.sweep(arm, [0.19, 0.14], { color: BASALT });
    b.part(new THREE.IcosahedronGeometry(0.3, 0), PLATE, { bone: arm.joints[0], at: [s * 0.7, 2.35, 0], scale: [1.2, 0.9, 1.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.17, 0), PLATE, { bone: arm.joints[1], at: pts[1], flat: true });
    glow(b.part(new THREE.OctahedronGeometry(0.07, 0), LAVA, { bone: arm.joints[0], at: [s * 0.8, 2.52, 0.12] }), 1.4);
    glow(b.part(new THREE.OctahedronGeometry(0.06, 0), LAVA, { bone: arm.joints[1], at: [pts[1].x, pts[1].y + 0.1, pts[1].z - 0.12] }), 1.4);
    const w = pts[2];
    b.part(new THREE.BoxGeometry(0.34, 0.3, 0.32), BASALT, { bone: arm.tip!, at: [w.x + s * 0.12, w.y - 0.05, w.z], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.22, 0.04), LAVA, { bone: arm.tip!, at: [w.x + s * 0.12, w.y - 0.05, w.z + 0.17] }), 1.2);
    for (let i = 0; i < 3; i++) {
      const z = w.z + (i - 1) * 0.1;
      const p0 = [w.x + s * 0.25, w.y - 0.08, z];
      const fp = [p0, [p0[0] + s * 0.14, p0[1] - 0.08, z], [p0[0] + s * 0.2, p0[1] - 0.22, z]];
      const f = b.chain(`finger${L}${i + 1}`, fp, { parent: arm.tip!, names: [`finger${L}${i + 1}a`, `finger${L}${i + 1}b`], role: "digit" });
      b.sweep(f, [0.045, 0.03], { color: DARK, caps: "round" });
    }
  }

  // ---- legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.3, 1.3, 0], [s * 0.38, 0.2, 0.05], [0.62, 0.6], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, pts, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
    b.sweep(leg, [0.2, 0.15], { color: BASALT });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), PLATE, { bone: leg.joints[1], at: [pts[1].x, pts[1].y, pts[1].z + 0.08], scale: [1, 1, 0.8], flat: true });
    glow(b.part(new THREE.OctahedronGeometry(0.05, 0), LAVA, { bone: leg.joints[1], at: [pts[1].x, pts[1].y, pts[1].z + 0.25] }), 1.4);
    b.part(new THREE.BoxGeometry(0.38, 0.2, 0.6), BASALT, { bone: leg.tip!, at: [s * 0.38, 0.1, 0.12], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.2, 0.03, 0.04), LAVA, { bone: leg.tip!, at: [s * 0.38, 0.08, 0.43] }), 1.2);
    for (let i = -1; i <= 1; i++)
      b.part(new THREE.ConeGeometry(0.05, 0.12, 4), DARK, { bone: leg.tip!, at: [s * 0.38 + i * 0.11, 0.08, 0.46], dir: [0, 0.2, 1] });
    b.part(new THREE.BoxGeometry(0.1, 0.4, 0.1), PLATE, { bone: leg.joints[0], at: [s * 0.5, 1.2, 0], flat: true });
  }
  return b.root;
}
```