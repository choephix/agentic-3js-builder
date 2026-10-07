import * as THREE from "three";
import { createBuilder, catmull, frame, gradient, paint, rng, mix } from "../../../../src/index";

export const meta = {
  name: "Jellyfish",
  description: "A stylized moon jellyfish with a faceted translucent-look bell, rim beads, ruffled oral arms and long trailing tentacles.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jellyfish" });
  const R = rng(11);
  const Y0 = 0.9;

  // Skeleton
  const body = b.joint("body", { at: [0, Y0, 0], dir: [0, 1, 0] });
  const bell = b.joint("bell", { parent: body, at: [0, Y0 + 0.02, 0], dir: [0, 1, 0], role: "hinge" });

  // Bell paint: pale crown, ribs radiating, violet rim
  const bellPaint = paint((p, n) => {
    const ang = Math.atan2(p.x, p.z);
    const rib = 0.5 + 0.5 * Math.cos(ang * 8);
    const h = (p.y - Y0) / 0.25; // -0.2..0.9
    const t = Math.min(Math.max((h + 0.1) / 0.9, 0), 1);
    const base = mix("#b266e0", "#f6d6ff", t);
    return mix(base, "#7a3fc2", rib * 0.28 * (1 - t * 0.6));
  });

  // Bell: half cross-section spun round the axis
  const dome = b.lathe(
    [
      [0, 0.23],
      [0.09, 0.215],
      [0.17, 0.16],
      [0.225, 0.08],
      [0.25, 0.0],
      [0.255, -0.045],
      [0.225, -0.035],
      [0.2, 0.02],
      [0.14, 0.09],
      [0.06, 0.13],
      [0, 0.14],
    ],
    { color: bellPaint, at: [0, Y0, 0], segments: 16, bone: bell, name: "bell" },
  );

  // Rim beads
  const bead = new THREE.IcosahedronGeometry(0.016, 0);
  b.ring(frame([0, Y0 - 0.04, 0], [0, 1, 0]), { count: 16, radius: 0.255 }, (item) => {
    b.stick(bead, "#ffd0f0", item, { embed: 0.3, bone: bell });
  });

  // Spots on the dome
  const surf = b.surface(dome);
  const spot = new THREE.IcosahedronGeometry(0.014, 0);
  for (let i = 0; i < 12; i++) {
    const hit = surf.around([0, Y0, 0]).at(i * 30 + (i % 2) * 12, 38 + (i % 3) * 14);
    if (hit) b.stick(spot, "#fff0fb", hit, { embed: 0.4, bone: bell });
  }

  // Inner organs: gonad rings and stomach
  const gonad = new THREE.TorusGeometry(0.035, 0.009, 4, 8);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.part(gonad, "#ff7ab8", {
      at: [0.075 * Math.sin(a), Y0 + 0.075, 0.075 * Math.cos(a)],
      rotation: [90, 0, 0],
      bone: bell,
      name: `gonad${i}`,
    });
  }
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.07, 8), "#f2a4e6", { at: [0, Y0 + 0.02, 0], bone: bell, name: "manubrium" });

  // Oral arms: four ruffled ribbons
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const pts: [number, number, number][] = [
      [0.03 * sx, Y0 - 0.03, 0.03 * sz],
      [0.05 * sx, Y0 - 0.2, 0.05 * sz],
      [0.03 * sx - 0.03 * sz, Y0 - 0.38, 0.03 * sz + 0.03 * sx],
      [0.06 * sx, Y0 - 0.52, 0.06 * sz],
    ];
    const chain = b.chain(`oral${i}_`, catmull(pts), { parent: bell, role: "tentacle", count: 3 });
    b.sweep(chain, {
      radius: (t: number) => 0.03 * (1 - t * 0.7) + 0.009 * Math.sin(t * 16),
      color: gradient("#ff9ad8", "#c46bf0", [0, Y0, 0], [0, Y0 - 0.55, 0]),
      sides: 6,
      name: `oralArm${i}`,
    });
  }

  // Long trailing tentacles
  const tentColor = gradient("#e2b0ff", "#7d4fd0", [0, Y0, 0], [0, 0, 0]);
  const count = 14;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const sway = 0.04 + 0.03 * R();
    const ph = R() * 6;
    const pts: [number, number, number][] = [0, 1, 2, 3, 4].map((k) => {
      const f = k / 4;
      const r = 0.215 - 0.1 * f;
      return [
        r * sx + sway * Math.sin(ph + f * 5) * sz,
        k === 4 ? 0.012 : Y0 - 0.04 - f * (Y0 - 0.052),
        r * sz - sway * Math.sin(ph + f * 5) * sx,
      ] as [number, number, number];
    });
    const chain = b.chain(`tent${i}_`, catmull(pts), { parent: bell, role: "tentacle", count: 4 });
    b.sweep(chain, { radius: [0.010, 0.0035], color: tentColor, sides: 5, name: `tentacle${i}` });
  }

  return b.root;
}
