```ts
import * as THREE from "three";
import { createBuilder, frame, limb, catmull, polyline, countershade, mottle, gradient, paint, stripes, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Swamp Troll",
  description: "Hunched Warcraft-style swamp troll with tusks, a flame mohawk and bone fetishes.",
};

const BONE = "#e8dcc0", RED = "#c0392b", ORANGE = "#ff9a3c", LEATHER = "#6b4a2b", GOLD = "#d9a72e";
const DARK = "#2a2118", EYE = "#ffd23a", TOOTH = "#f1e6c8", CLAW = "#3a2f26";
const SKIN = countershade(mottle("#4f8a52", "#3b6e48", { size: 0.16, seed: 3 }), "#9aa86a", { level: -0.25 });
const SKINDK = mottle("#3f7348", "#2f5a3e", { size: 0.12, seed: 5 });
const FACE = paint((p, n, s) => {
  const base = SKIN.at(p, n);
  if (p.z > 0.84 && Math.abs(p.x) > 0.04 && Math.sin(p.y * 110) > 0.55 && p.y < 2.0 && p.y > 1.9) return RED;
  return [base[0], base[1], base[2]] as const;
});
const CLOTH = stripes(LEATHER, "#8e3b24", { size: 0.08, axis: "x", width: 0.3, seed: 2 });

const FEATHER = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 Q2 36 16 2 Q30 36 16 62Z" fill="#2fa89a" stroke="#14403b" stroke-width="2"/><path d="M16 60 L16 6" stroke="#14403b" stroke-width="2"/><path d="M16 2 Q7 14 10 26 Q16 14 22 26 Q25 14 16 2Z" fill="#c0392b"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const spk = (a: number[], t: number[], r: number, color: any, bone?: any) =>
    b.spike(a, t, null, r, { color, bone, sides: 6 } as any);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 1.05, -0.05] });
  const spine = b.chain("spine", catmull([[0, 1.05, -0.05], [0, 1.4, 0.1], [0, 1.75, 0.3]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.chain("neck", catmull([[0, 1.75, 0.3], [0, 1.9, 0.52], [0, 1.98, 0.7]]), {
    parent: chest, names: ["neck1", "neck2", "head"], role: "neck",
  });
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.92, 0.76], aim: [0, 1.9, 1.0], role: "jaw" });

  // ---- torso
  const torso = b.sweep(spine, (t) => [0.27 + 0.2 * Math.sin(Math.min(t, 1) * 2), 0.24 + 0.1 * t], { color: SKIN });
  b.part(sph(1, 10, 8), SKIN, { bone: spine.joints[1], at: [0, 1.25, 0.26], scale: [0.3, 0.27, 0.25] });
  b.part(sph(1, 10, 8), SKINDK, { bone: chest, at: [0, 1.95, 0.08], scale: [0.36, 0.28, 0.3] });
  b.sweep(neck, [0.17, 0.13], { color: SKIN });

  // ---- head
  const HC = [0, 2.0, 0.78];
  b.part(sph(1, 12, 9), FACE, { bone: head, at: HC, scale: [0.17, 0.15, 0.18] });
  b.part(sph(1, 8, 6), SKINDK, { bone: head, at: [0, 2.07, 0.88], scale: [0.18, 0.045, 0.09] });
  b.part(sph(1, 8, 6), SKIN, { bone: head, at: [0, 1.96, 0.92], scale: [0.12, 0.07, 0.13] });
  spk([0, 2.0, 0.99], [0, 1.92, 1.13], 0.05, SKIN, head);
  b.part(sph(1, 8, 6), SKINDK, { bone: jaw, at: [0, 1.875, 0.87], scale: [0.13, 0.05, 0.14] });
  for (const s of [1, -1]) {
    spk([s * 0.085, 1.88, 0.98], [s * 0.115, 2.14, 1.07], 0.034, BONE, jaw);
    spk([s * 0.05, 1.9, 1.0], [s * 0.05, 1.96, 1.01], 0.012, TOOTH, jaw);
    glow(b.part(sph(0.032, 6, 5), EYE, { bone: head, at: [s * 0.078, 2.03, 0.935] }));
    b.part(sph(0.012, 5, 4), DARK, { bone: head, at: [s * 0.078, 2.03, 0.965] });
    spk([s * 0.15, 2.03, 0.76], [s * 0.5, 2.22, 0.6], 0.045, SKIN, head);
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 8), GOLD, { bone: head, at: [s * 0.3, 2.1, 0.7], dir: [1, 0, 0], axis: "z" });
  }

  // ---- mohawk
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const bs = [0, 2.14 - 0.14 * Math.pow(t, 1.4), 0.92 - 0.55 * t];
    const tp = [0, bs[1] + 0.2 + 0.12 * Math.sin(Math.PI * t), bs[2] - 0.08 - 0.1 * t];
    b.spike(bs, tp, null, 0.04 + 0.015 * Math.sin(Math.PI * t), {
      color: gradient(RED, ORANGE, bs, tp), bone: t < 0.75 ? head : neck.joints[1], sides: 5,
    } as any);
  }

  // ---- arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.5, 1.75, 0.28], [s * 0.72, 0.5, 0.45], [0.65, 0.65], [0, 0, -1]);
    const arm = b.chain(`arm${L}`, pts, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" });
    b.sweep(arm, [0.13, 0.09], { color: SKIN });
    b.part(sph(0.2, 8, 6), SKINDK, { bone: arm.joints[0], at: pts[0] });
    b.part(sph(1, 8, 6), SKIN, { bone: arm.tip!, at: pts[2], scale: [0.12, 0.11, 0.12] });
    const h = pts[2];
    for (let i = -1; i <= 1; i++) {
      const a = [h.x + s * i * 0.045, h.y - 0.05, h.z + 0.06];
      const c = [a[0], a[1] - 0.1, a[2] + 0.12];
      b.rod(a, c, 0.025, SKIN, { bone: arm.tip! } as any);
      spk(c, [c[0], c[1] - 0.06, c[2] + 0.06], 0.02, CLAW, arm.tip);
    }
    // shoulder spikes + cuff
    spk([pts[0].x + s * 0.1, pts[0].y + 0.16, pts[0].z], [pts[0].x + s * 0.2, pts[0].y + 0.4, pts[0].z - 0.05], 0.05, BONE, arm.joints[0]);
    b.part(new THREE.CylinderGeometry(0.115, 0.12, 0.08, 8), LEATHER, { bone: arm.joints[1], at: [pts[1].x, pts[1].y - 0.1, pts[1].z], dir: [0, 1, 0] });
  }

  // ---- legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.22, 1.0, 0], [s * 0.28, 0.17, 0.16], [0.56, 0.5], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: [s * 0.28, 0, 0.3] } as any);
    b.sweep(leg, [0.17, 0.1], { color: SKINDK });
    b.part(new THREE.BoxGeometry(0.2, 0.14, 0.34), SKIN, { bone: leg.tip!, at: [s * 0.28, 0.07, 0.26] });
    for (let i = -1; i <= 1; i++) spk([s * (0.28 + i * 0.07), 0.07, 0.42], [s * (0.28 + i * 0.08), 0.05, 0.56], 0.03, CLAW, leg.tip);
  }

  // ---- clothing
  const flap = [[-0.18, 0], [-0.14, -0.5], [0, -0.62], [0.14, -0.5], [0.18, 0]] as [number, number][];
  b.extrude(flap, { at: [0, 1.1, 0.3], x: [1, 0, 0], thickness: 0.025, color: CLOTH, bone: hips });
  b.extrude(flap, { at: [0, 1.1, -0.28], x: [1, 0, 0], thickness: 0.025, color: CLOTH, bone: hips });
  b.part(new THREE.TorusGeometry(0.3, 0.035, 5, 14), LEATHER, { bone: hips, at: [0, 1.1, 0.01], dir: [0, 1, 0], axis: "z", scale: [1, 0.85, 1] });
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.03), GOLD, { bone: hips, at: [0, 1.1, 0.29] });
  for (let i = 0; i < 7; i++) spk([-0.15 + i * 0.05, -0.0 + 1.0 + (i % 2) * 0.0, 0.3], [-0.15 + i * 0.05, 0.6, 0.31], 0.012, BONE, hips);

  // ---- bone fetishes
  const skin = b.surface(torso);
  for (let i = 0; i < 9; i++) {
    const x = -0.36 + i * 0.09;
    const y = 1.78 - 0.26 * (1 - Math.abs(x) / 0.36);
    const hit = skin.ray([x, y, 2], [0, 0, -1]);
    if (!hit) continue;
    const slope = Math.sign(x) * -0.7;
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 5), i % 2 ? BONE : LEATHER, {
      bone: chest, at: [hit.at.x, hit.at.y, hit.at.z + 0.03], dir: [1, slope * 0.0 + (x > 0 ? -0.6 : 0.6), 0],
    });
  }
  const pend = skin.ray([0, 1.5, 2], [0, 0, -1]);
  if (pend) {
    const p = [0, 1.5, pend.at.z + 0.07];
    b.part(sph(1, 8, 6), BONE, { bone: chest, at: p, scale: [0.065, 0.07, 0.06] });
    b.part(new THREE.BoxGeometry(0.07, 0.035, 0.05), BONE, { bone: chest, at: [0, p[1] - 0.06, p[2] - 0.005] });
    for (const s of [1, -1]) b.part(sph(0.017, 5, 4), DARK, { bone: chest, at: [s * 0.025, p[1] + 0.01, p[2] + 0.055] });
    spk([0, p[1] + 0.07, p[2] - 0.01], [0, p[1] + 0.2, p[2] - 0.03], 0.008, LEATHER, chest);
  }
  // horned animal skull on left shoulder strap
  const sh = [0.52, 1.95, 0.3];
  b.part(sph(1, 7, 5), BONE, { bone: "shoulderL", at: [sh[0] + 0.1, sh[1] + 0.12, sh[2] + 0.1], scale: [0.07, 0.06, 0.09] });
  spk([sh[0] + 0.16, sh[1] + 0.15, sh[2] + 0.12], [sh[0] + 0.3, sh[1] + 0.3, sh[2] + 0.1], 0.025, BONE, "shoulderL");
  spk([sh[0] + 0.04, sh[1] + 0.15, sh[2] + 0.12], [sh[0] - 0.05, sh[1] + 0.32, sh[2] + 0.1], 0.025, BONE, "shoulderL");
  // hip bundle with feathers
  const bx = -0.33;
  b.rod([bx, 1.1, 0.12], [bx - 0.03, 0.72, 0.14], 0.012, LEATHER, { bone: hips } as any);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), BONE, { bone: hips, at: [bx - 0.03, 0.8, 0.17], dir: [0.1, 1, 0] });
  b.part(sph(0.04, 6, 5), BONE, { bone: hips, at: [bx - 0.03, 0.68, 0.14] });
  b.cards(
    [0, 1, 2].map((i) => frame([bx - 0.03 + (i - 1) * 0.02, 0.9, 0.12 + i * 0.015], [0, 1, 0])),
    FEATHER,
    { size: [0.07, 0.3], lean: 180, flow: [0, 0, 1], bone: hips },
  );

  return b.root;
}
```