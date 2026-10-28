import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { paint, mix, noise, smoothstep, grain } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-forged Battle Axe",
  description: "A stylized two-handed battle axe of dark steel and glowing ice crystal, with runic blades and frozen fittings.",
};

export default function build() {
  const b = createBuilder({ name: "frostaxe" });
  const R = rng(5);

  const STEEL = paint((p, n) => {
    const t = noise(p, 0.12, 3);
    const c = mix("#3b4a68", "#8fa6cc", smoothstep(0.2, 0.8, t));
    return mix(c, "#e8f6ff", 0.5 * smoothstep(0.55, 1, n.y) * (0.5 + t * 0.5));
  });
  const DARK = paint((p, n) => mix("#1c2336", "#3a4a70", noise(p, 0.08, 7) * 0.8 + 0.2 * smoothstep(0, 1, n.y)));
  const HAFT = grain("#2a3a5a", "#4a6290", { size: 0.012, axis: "y", seed: 2 });
  const ICE = "#7fe8ff";
  const ICE2 = "#c8f6ff";
  const GOLD = "#d8b45a";
  const LEATHER = "#2b2233";

  const total = 1.75;
  const root = b.joint("axe", { at: [0, 0.0, 0] });
  const haft = b.joint("haft", { parent: root, at: [0, 0.9, 0], aim: [0, 1.7, 0], role: "spine" });

  // Shaft (slightly tilted standing upright, tip on floor)
  b.rod([0, 0.0, 0], [0, 1.55, 0], 0.028, HAFT, { bone: root, sides: 8 } as any);
  // Pommel spike on bottom
  b.spike([0, 0.06, 0], [0, -1, 0], 0.06, 0.035, { color: STEEL, bone: root } as any);
  b.part(new THREE.CylinderGeometry(0.04, 0.034, 0.05, 8), DARK, { bone: root, at: [0, 0.08, 0] });
  // Leather grip wraps + gold rings
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.022, 8), LEATHER, { bone: root, at: [0, 0.2 + i * 0.045, 0] });
  }
  for (const y of [0.15, 0.62, 1.1]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.018, 8), GOLD, { bone: root, at: [0, y, 0] });
  }
  // Ice-wrapped shaft crystals
  for (let i = 0; i < 6; i++) {
    const y = 0.7 + i * 0.1;
    const a = i * 2.1;
    glow(
      b.part(new THREE.ConeGeometry(0.014, 0.07, 5), ICE, {
        bone: root,
        at: [Math.sin(a) * 0.035, y, Math.cos(a) * 0.035],
        dir: [Math.sin(a), 0.5, Math.cos(a)],
        flat: true,
      }),
      0.8,
    );
  }

  // Head collar
  const hy = 1.38;
  b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 8), DARK, { bone: root, at: [0, hy, 0] });
  for (const dy of [-0.11, 0.11])
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 8), GOLD, { bone: root, at: [0, hy + dy, 0] });

  // Rune texture
  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><g stroke="#bff4ff" stroke-width="4" fill="none" stroke-linecap="round">
    <path d="M32 8 V56"/><path d="M32 20 L48 10"/><path d="M32 34 L16 24"/><path d="M32 46 L46 38"/></g></svg>`,
    { size: 128 },
  );

  // Main blade (big crescent) both sides
  const blade: [number, number, string?][] = [
    [0.05, 0.12], [0.2, 0.2], [0.36, 0.3, "sharp"], [0.42, 0.1], [0.36, -0.08], [0.4, -0.3, "sharp"],
    [0.22, -0.22], [0.05, -0.12],
  ] as any;
  for (const s of [1, -1]) {
    const blob = b.extrude(blade as any, {
      at: [0, hy, s * 0.0],
      x: [0, 0, s],
      y: [0, 1, 0],
      thickness: [0.035, 0.006],
      bevel: 0.006,
      smoothing: 1,
      color: STEEL,
      bone: root,
    });
    // edge highlight strip
    b.extrude(
      [[0.37, 0.28], [0.43, 0.1], [0.37, -0.08], [0.41, -0.28], [0.395, -0.08], [0.45, 0.1]] as any,
      { at: [0, hy, 0], x: [0, 0, s], thickness: 0.012, color: "#f2fbff", bone: root },
    );
    // rune decal plate
    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
        bone: root,
        at: [s * 0.02, hy + 0.0, s * 0.0],
        texture: RUNE,
      }),
      0,
    );
    void blob;
  }
  // Blade is drawn along Z (x:[0,0,±1]); runes on flat faces
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
        bone: root,
        at: [s * 0.02, hy + 0.02, 0.17],
        dir: [s, 0, 0],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
        bone: root,
        at: [s * 0.02, hy + 0.02, -0.17],
        dir: [s, 0, 0],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
  }

  // Back spike (opposite blade is a spike)
  b.extrude([[0, 0.05], [0.0, -0.05], [-0.1, -0.06], [-0.26, 0, "sharp"], [-0.1, 0.06]] as any, {
    at: [0, hy + 0.02, 0],
    x: [0, 0, 1],
    thickness: 0.03,
    color: DARK,
    bone: root,
  });

  // Top spear blade
  b.spike([0, hy + 0.1, 0], [0, 1, 0], 0.26, 0.04, { color: STEEL, bone: root, sides: 4 } as any);
  b.part(new THREE.SphereGeometry(0.045, 6, 4), GOLD, { bone: root, at: [0, hy + 0.12, 0] });

  // Ice crystal core on collar
  glow(b.part(new THREE.OctahedronGeometry(0.07), ICE, { bone: root, at: [0, hy, 0.075], scale: [1, 1.6, 1], flat: true }), 1.6);
  glow(b.part(new THREE.OctahedronGeometry(0.07), ICE, { bone: root, at: [0, hy, -0.075], scale: [1, 1.6, 1], flat: true }), 1.6);

  // Icicle spikes along blade edges
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const y = hy - 0.22 + i * 0.09;
      const x = 0.32 + Math.sin(i * 0.5) * 0.05;
      const sz = 0.05 + R() * 0.04;
      glow(
        b.part(new THREE.ConeGeometry(0.014, sz, 5), ICE2, {
          bone: root,
          at: [0, y, s * x * 0.0 + s * 0.0],
          dir: [0, -1, 0],
          flat: true,
        }),
        0,
      );
    }
  }
  // icicles hanging under blades (along local blade Z)
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = s * (0.14 + i * 0.07);
      glow(
        b.part(new THREE.ConeGeometry(0.012, 0.06 + R() * 0.05, 5), ICE2, {
          bone: root,
          at: [0, hy - 0.2 - i * 0.012, z],
          dir: [0, -1, 0],
          flat: true,
        }),
        1,
      );
    }
  // Frost crystal cluster at blade tips
  for (const s of [1, -1])
    glow(b.part(new THREE.OctahedronGeometry(0.03), ICE, { bone: root, at: [0, hy + 0.3, s * 0.4], scale: [1, 1.8, 1], flat: true }), 1.4);

  // Tassel/strap
  b.rod([0, 1.22, 0.04], [0.02, 1.0, 0.1], 0.008, LEATHER, { bone: root } as any);
  glow(b.part(new THREE.SphereGeometry(0.022, 6, 4), ICE, { bone: root, at: [0.02, 0.98, 0.1] }), 1.5);

  void haft;
  return b.root;
}
