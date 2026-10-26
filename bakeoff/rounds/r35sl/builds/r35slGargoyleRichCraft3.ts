import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle, paint, mix, noise, smoothstep, svg, rng, aim } from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle with bat wings, horns and fangs, perched on a carved ledge.",
};

const STONE = mottle("#8d8a84", "#6f6c68", { size: 0.12, seed: 3 });
const MOSS = paint((p, n) => {
  const base = mix("#86837d", "#66635f", noise(p, 0.1, 5));
  return mix(base, "#5f7a4a", smoothstep(0.55, 0.8, noise(p, 0.18, 9)) * smoothstep(0.3, 0.9, n.y) * 0.8);
});
const DARK = mottle("#4f4d4b", "#3d3b3a", { size: 0.08, seed: 2 });
const LEDGE = countershade(mottle("#999690", "#77746f", { size: 0.2, seed: 8 }), "#55524f");
const BONE = "#cfc8b8";
const EMBER = "#e9a23b";

const EYE = svg(
  `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="28" ry="20" fill="#1a1816"/><ellipse cx="32" cy="32" rx="20" ry="13" fill="#e9a23b"/><ellipse cx="32" cy="32" rx="5" ry="12" fill="#1a1816"/><path d="M2 20 Q32 4 62 20" stroke="#1a1816" stroke-width="8" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(4);

  // Ledge
  b.part(new THREE.BoxGeometry(1.0, 0.18, 0.7), LEDGE, { at: [0, 0.09, 0], flat: true });
  b.part(new THREE.BoxGeometry(1.08, 0.05, 0.78), STONE, { at: [0, 0.2, 0.02], flat: true });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.12] });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.12], [0, 0.6, 0.02], [0, 0.78, 0.14], [0, 0.88, 0.2]]), {
    parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.88, 0.2], [0, 0.95, 0.3], [0, 0.98, 0.38]]), {
    parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "neck3"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip ?? neck.joints[2], at: [0, 0.98, 0.38], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.93, 0.44], dir: [0, -0.1, 1], role: "jaw" });

  // Torso
  b.sweep(catmull([[0, 0.5, -0.15], [0, 0.6, 0.0], [0, 0.78, 0.14], [0, 0.88, 0.2]]), [0.19, 0.22, 0.2, 0.16].length ? (t: number) => [0.2 - 0.03 * t + 0.04 * Math.sin(t * 3), 0.19], {
    bone: spine, color: MOSS, section: { ngon: 7 }, caps: "round",
  });
  // Haunches
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.17, 0), MOSS, { at: [s * 0.2, 0.37, -0.14], scale: [1, 1.1, 1.2], flat: true, bone: hips });
    // hind leg
    const hl = b.chain(`legH${s > 0 ? "L" : "R"}`, [[s * 0.22, 0.38, -0.14], [s * 0.26, 0.28, 0.1], [s * 0.26, 0.22, -0.02], [s * 0.26, 0.24, 0.2]].map((p) => new THREE.Vector3(...p)), {
      parent: hips, names: [`hipH${s > 0 ? "L" : "R"}`, `kneeH${s > 0 ? "L" : "R"}`, `ankleH${s > 0 ? "L" : "R"}`, `footH${s > 0 ? "L" : "R"}`], role: "leg",
    });
    b.sweep(hl, [0.09, 0.05], { color: STONE, section: { ngon: 6 } });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.26 + i * 0.045, 0.22, 0.2], [0, -0.3, 1], 0.1, 0.022, { color: DARK, bone: hl.tip ?? hl.joints[3] });
    }
    // front arm planted on ledge
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, [[s * 0.22, 0.82, 0.18], [s * 0.3, 0.55, 0.3], [s * 0.26, 0.3, 0.42], [s * 0.25, 0.23, 0.5]].map((p) => new THREE.Vector3(...p)), {
      parent: spine.joints[2], names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `wrist${s > 0 ? "L" : "R"}`, `hand${s > 0 ? "L" : "R"}`], role: "arm",
    });
    b.sweep(arm, [0.085, 0.05], { color: MOSS, section: { ngon: 6 } });
    b.part(new THREE.IcosahedronGeometry(0.13, 0), MOSS, { at: [s * 0.22, 0.84, 0.16], flat: true, bone: spine.joints[2] });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.25 + i * 0.045, 0.23, 0.5], [i * 0.15, -0.2, 1], 0.1, 0.02, { color: DARK, bone: arm.tip ?? arm.joints[3] });
    }
  }

  // Wings
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const w = b.chain(`wing${n}`, catmull([[s * 0.14, 0.82, 0.08], [s * 0.4, 1.1, -0.1], [s * 0.7, 1.2, -0.3]].map((p) => new THREE.Vector3(...p))), {
      parent: spine.joints[2], names: [`wingRoot${n}`, `wingElbow${n}`, `wingTip${n}`], role: "wing",
    });
    b.sweep(w, [0.045, 0.025], { color: STONE, section: { ngon: 5 } });
    const tips: number[][] = [[s * 0.95, 0.9, -0.55], [s * 0.85, 0.55, -0.6], [s * 0.55, 0.45, -0.45]];
    const fingers = tips.map((t, i) => {
      const f = b.chain(`finger${n}${i}`, [[s * 0.7, 1.2, -0.3], t].map((p) => new THREE.Vector3(...p)), {
        parent: w.tip ?? w.joints[2], names: [`finger${n}${i}`, `fingerTip${n}${i}`], role: "digit",
      });
      b.sweep(f, [0.025, 0.01], { color: STONE, section: { ngon: 5 } });
      return f;
    });
    b.membrane(w, fingers[0], { color: DARK, thickness: 0.02, scallop: 0.15, bone: w.joints[0] });
    b.membrane(fingers[0], fingers[1], { color: DARK, thickness: 0.02, scallop: 0.2 });
    b.membrane(fingers[1], fingers[2], { color: DARK, thickness: 0.02, scallop: 0.2 });
  }

  // Head
  const H = 1.0;
  b.part(new THREE.IcosahedronGeometry(0.17 * H, 1), STONE, { at: [0, 1.0, 0.4], scale: [1.1, 0.9, 1], flat: true, bone: head });
  b.part(new THREE.BoxGeometry(0.2, 0.09, 0.2), STONE, { at: [0, 0.97, 0.56], flat: true, bone: head });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.19), STONE, { at: [0, 0.89, 0.54], flat: true, bone: jaw });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.05), DARK, { at: [0, 1.0, 0.66], flat: true, bone: head });
  // Brow
  b.part(new THREE.BoxGeometry(0.36, 0.05, 0.1), DARK, { at: [0, 1.08, 0.5], flat: true, bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [s * 0.085, 1.04, 0.565], dir: [s * 0.2, 0, 1], axis: "z", texture: EYE, bone: head });
    b.spike([s * 0.1, 1.15, 0.36], [s * 0.5, 1, -0.4], 0.26, 0.045, { color: BONE, bone: head });
    b.spike([s * 0.19, 1.0, 0.32], [s * 1, 0.4, 0.1], 0.14, 0.04, { color: STONE, bone: head }); // ear
    // fangs
    b.spike([s * 0.06, 0.935, 0.62], [0, -1, 0.2], 0.07, 0.014, { color: BONE, bone: head });
    b.spike([s * 0.05, 0.905, 0.6], [0, 1, 0.2], 0.05, 0.012, { color: BONE, bone: jaw });
  }
  // Chin beard
  b.spike([0, 0.88, 0.5], [0, -1, 0.3], 0.1, 0.03, { color: DARK, bone: jaw });
  // Spine ridge
  b.along(b.sweep(catmull([[0, 0.55, -0.15], [0, 0.7, 0.02], [0, 0.88, 0.14]]), 0.01, { bone: spine, color: STONE }), 5, (at) =>
    b.spike(at, [0, 1, -0.2], 0.1, 0.03, { color: DARK }),
  );

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.45, -0.25], [0, 0.3, -0.5], [0.2, 0.28, -0.6], [0.3, 0.3, -0.45]].map((p) => new THREE.Vector3(...p))), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail",
  });
  b.sweep(tail, [0.09, 0.02], { color: STONE, section: { ngon: 6 }, caps: "point" });
  b.spike([0.3, 0.3, -0.45], [0, 0.5, 1], 0.1, 0.04, { color: DARK, bone: tail.joints[3] });

  // Cracks and chips
  const skin = b.surface(b.root);
  for (const h of skin.scatter(10, { rng: R, minDist: 0.15, filter: (h) => h.n.y > 0.3 && h.at.y > 0.4 })) {
    b.stick(new THREE.IcosahedronGeometry(0.02 + R() * 0.02, 0), DARK, h, { embed: 0.3, flat: true });
  }
  return b.root;
}
