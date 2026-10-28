import * as THREE from "three";
import { createBuilder, bezier, catmull, paint, noise, mix, smoothstep, svg, rng } from "../../../../src/index";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description: "A dragonbone scythe with a spined shaft, a curved bone blade, gold fittings and a glowing soul crystal.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "scythe" });
  const R = rng(5);

  const BONE = paint((p, n) => {
    const t = noise(p, 0.05, 3);
    const c = mix("#cdbf9f", "#efe6cc", t);
    return mix(c, "#6d5a45", smoothstep(0.1, -0.8, n.y) * 0.5);
  });
  const DARK = "#2a2230";
  const GOLD = "#d9a638";
  const SOUL = "#5ff2d0";
  const SOUL2 = "#b8fff0";
  const GLOWMAT = (c: string) => c;

  // Shaft: tall, tilted slightly so the scythe is held upright, 1.9 m long
  const shaftBase: [number, number, number] = [0, 0, 0];
  const shaftTop: [number, number, number] = [0, 1.85, 0];
  b.rod(shaftBase, shaftTop, 0.022, DARK);

  // Vertebra-like segments wrapped round the shaft
  for (let i = 0; i < 9; i++) {
    const y = 0.35 + i * 0.16;
    b.part(new THREE.CylinderGeometry(0.036, 0.03, 0.09, 8), BONE, { at: [0, y, 0] });
    b.part(new THREE.ConeGeometry(0.014, 0.07, 5), BONE, { at: [0, y, -0.045], dir: [0, 0, -1] });
  }

  // Gold bands
  for (const y of [0.25, 0.9, 1.78]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.035, 10), GOLD, { at: [0, y, 0] });
  }

  // Butt cap, spike
  b.part(new THREE.ConeGeometry(0.03, 0.14, 6), GOLD, { at: [0, -0.01, 0], dir: [0, -1, 0] });
  b.part(new THREE.CylinderGeometry(0.04, 0.03, 0.08, 8), GOLD, { at: [0, 0.07, 0] });

  // Head mount: dragon skull-like collar
  b.part(new THREE.SphereGeometry(0.075, 8, 6), BONE, { at: [0, 1.9, 0], scale: [1, 0.9, 1.3] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), SOUL2, { at: [s * 0.05, 1.92, 0.08] });
    b.spike([s * 0.04, 1.95, -0.02], [s * 0.1, 0.5, -0.9], 0.18, 0.02, { color: BONE });
  }
  // jaw tooth row
  for (let i = 0; i < 5; i++) b.spike([0, 1.86, 0.04 + i * 0.015], [0, -1, 0.3], 0.05, 0.008, { color: "#ffffff" });

  // Blade: big curved bone sweep to +Z (the model faces +Z)
  const spine = bezier([0, 1.95, 0.05], [0, 2.4, 0.5], [0, 2.3, 1.0], [0, 1.85, 1.15]);
  b.sweep(spine, [0.045, 0.02], { color: BONE, sides: 6 });

  // Blade edge: extruded crescent
  const blade = [
    [0, 0],
    [0.25, 0.22],
    [0.55, 0.3],
    [0.85, 0.15],
    [1.05, -0.12, "sharp"],
    [0.85, -0.02],
    [0.55, 0.06],
    [0.25, 0.04],
    [0, -0.08],
  ] as [number, number, "sharp"?][];
  b.extrude(blade as any, {
    at: [0, 1.93, 0.05],
    x: [0, 0.3, 1],
    y: [0, 1, -0.3],
    thickness: [0.03, 0.006],
    bevel: 0.006,
    smoothing: 1,
    color: BONE,
  });
  // Inner edge steel-glow strip
  b.extrude(
    [
      [0.1, 0.0],
      [0.5, 0.05],
      [0.95, -0.1, "sharp"],
      [0.5, 0.0],
    ] as any,
    {
      at: [0, 1.9, 0.12],
      x: [0, 0.3, 1],
      y: [0, 1, -0.3],
      thickness: 0.008,
      color: SOUL,
    },
  );

  // Ribs/spurs along the blade back
  b.along(spine, 6, (at) => b.spike(at, [0, 1, -0.3], 0.1, 0.014, { color: BONE }));

  // Rune texture on a plate
  const rune = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#12121c" stroke="#d9a638" stroke-width="4"/><path d="M32 12 L44 34 L32 52 L20 34Z M32 20 V44" stroke="#5ff2d0" stroke-width="4" fill="none"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [0.045, 1.4, 0], dir: [1, 0, 0], axis: "z", texture: rune });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [-0.045, 1.4, 0], dir: [-1, 0, 0], axis: "z", texture: rune });

  // Soul crystal floating in blade's curve
  const crystal = b.part(new THREE.OctahedronGeometry(0.09), GLOWMAT(SOUL), { at: [0, 2.05, 0.58], scale: [0.8, 1.4, 0.8] });
  crystal.mesh.material = new THREE.MeshStandardMaterial({
    color: SOUL,
    emissive: SOUL,
    emissiveIntensity: 1.4,
    flatShading: true,
  });
  // gold cage around the crystal
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    b.rod([Math.cos(a) * 0.1, 1.95, 0.58 + Math.sin(a) * 0.1], [0, 2.2, 0.58], 0.005, GOLD);
  }
  // wisps
  for (let i = 0; i < 6; i++) {
    const m = b.part(new THREE.IcosahedronGeometry(0.014 + R() * 0.01, 0), SOUL2, {
      at: [(R() - 0.5) * 0.2, 2.0 + R() * 0.3, 0.45 + R() * 0.3],
    });
    m.mesh.material = new THREE.MeshStandardMaterial({ color: SOUL2, emissive: SOUL2, emissiveIntensity: 1.6 });
  }

  // Tassel under head
  b.rod([0, 1.78, 0.04], [0.02, 1.52, 0.1], 0.01, "#7a1f3a");
  b.part(new THREE.ConeGeometry(0.03, 0.12, 6), "#7a1f3a", { at: [0.02, 1.46, 0.1], dir: [0, -1, 0] });

  return b.root;
}
