import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, polyline, mottle, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sky Island",
  description: "Floating sky island with ancient ruins, a waterfall, glowing crystals and blossoming trees, in a Genshin-like style.",
};

export default function build() {
  const b = createBuilder({ name: "skyisland" });
  const R = rng(11);

  // Palette
  const GOLD = "#e8b84a", TEAL = "#5fe3d6", WATER = "#7fe0ff", BARK = "#7a5238";
  const STONE = paint((p, n) => {
    const base = mix("#d9d0bc", "#a9a08f", noise(p, 0.3, 4));
    if (n.y > 0.6) return mix(base, "#7fc95a", smoothstep(0.35, 0.65, noise(p, 0.18, 9)));
    return base;
  });
  const ROCK = paint((p, n) => {
    const low = smoothstep(2.4, 0.2, p.y);
    const c = mix(mix("#9a8670", "#6c6478", low), "#4b4660", n.y < -0.3 ? 0.35 : 0);
    return mix(c, "#7de0d0", smoothstep(0.62, 0.8, noise(p, 0.25, 3)) * 0.18);
  });
  const GRASS = paint((p) => mix("#6fcf4a", "#b4e86a", noise(p, 0.5, 2)));
  const RUNE = svg(
    `<svg viewBox="0 0 64 96"><rect x="2" y="2" width="60" height="92" rx="8" fill="#2a3a5a" stroke="#e8b84a" stroke-width="4"/>
    <circle cx="32" cy="34" r="14" fill="none" stroke="#7ff3e6" stroke-width="4"/>
    <path d="M32 18 V50 M18 34 H46 M22 24 L42 44 M42 24 L22 44" stroke="#7ff3e6" stroke-width="3" fill="none"/>
    <path d="M14 70 H50 M20 80 H44" stroke="#e8b84a" stroke-width="4"/></svg>`,
    { size: 192 },
  );

  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, ...o });
  const GY = 2.5; // grass top

  // Island body
  b.lathe(
    [[0, 0], [0.3, 0.3], [0.9, 0.8], [1.8, 1.4], [2.6, 1.9], [3.0, 2.15], [3.0, 2.3], [0, 2.3]],
    { at: [0, 0, 0], segments: 10, color: ROCK },
  );
  b.lathe([[0, 2.3], [3.1, 2.3], [3.12, 2.42], [2.8, 2.5], [0, 2.5]], { at: [0, 0, 0], segments: 10, color: GRASS });
  // hanging rock spikes
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const r = 0.9 + R() * 1.3;
    const y = 1.5 - r * 0.28;
    const len = 0.7 + R() * 0.6;
    part(new THREE.ConeGeometry(0.25 + R() * 0.12, len, 5), ROCK, [Math.cos(a) * r, y, Math.sin(a) * r], { dir: [0, -1, 0] });
  }
  // rim rocks and gold-edge stones
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    if (Math.abs(a - 0.13) < 0.3) continue;
    part(new THREE.DodecahedronGeometry(0.12 + R() * 0.08, 0), STONE, [Math.cos(a) * 2.85, GY + 0.05, Math.sin(a) * 2.85]);
  }

  // Ruins platform
  const RC = [-0.8, -0.3];
  part(new THREE.CylinderGeometry(1.4, 1.5, 0.14, 6), STONE, [RC[0], GY + 0.05, RC[1]]);
  part(new THREE.CylinderGeometry(1.1, 1.2, 0.1, 6), "#cfc6b0", [RC[0], GY + 0.15, RC[1]]);
  glow(part(new THREE.TorusGeometry(0.85, 0.02, 4, 24), TEAL, [RC[0], GY + 0.21, RC[1]], { dir: [0, 1, 0], axis: "z" }), 1.2);
  // steps
  for (let i = 0; i < 3; i++) part(new THREE.BoxGeometry(1.0 - i * 0.15, 0.08, 0.25), STONE, [RC[0], GY + 0.03 + i * 0.07, RC[1] + 1.5 + 0.1 - i * 0.2 + 0.1]);

  const pillar = (x: number, z: number, h: number, broken = false) => {
    part(new THREE.BoxGeometry(0.34, 0.12, 0.34), STONE, [x, GY + 0.26, z]);
    part(new THREE.CylinderGeometry(0.13, 0.15, h, 6), STONE, [x, GY + 0.32 + h / 2, z]);
    part(new THREE.CylinderGeometry(0.155, 0.155, 0.04, 6), GOLD, [x, GY + 0.38, z]);
    if (!broken) {
      part(new THREE.CylinderGeometry(0.155, 0.155, 0.04, 6), GOLD, [x, GY + 0.28 + h, z]);
      part(new THREE.BoxGeometry(0.34, 0.1, 0.34), STONE, [x, GY + 0.38 + h, z]);
    } else {
      part(new THREE.DodecahedronGeometry(0.1, 0), STONE, [x + 0.25, GY + 0.28, z + 0.12]);
    }
  };
  const hs = [0.9, 0.5, 0.9, 0.7, 0.4, 0.9];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    if (i === 0 || i === 5) continue; // leave arch side
    pillar(RC[0] + Math.cos(a) * 1.05, RC[1] + Math.sin(a) * 1.05, hs[i], i === 4 || i === 1);
  }
  // Arch at back
  const az = RC[1] - 0.9;
  pillar(RC[0] - 0.6, az, 1.5);
  pillar(RC[0] + 0.6, az, 1.5);
  part(new THREE.BoxGeometry(1.7, 0.2, 0.34), STONE, [RC[0], GY + 2.0, az]);
  part(new THREE.BoxGeometry(1.75, 0.04, 0.38), GOLD, [RC[0], GY + 2.12, az]);
  part(new THREE.CylinderGeometry(0.12, 0.12, 0.36, 3), GOLD, [RC[0], GY + 2.17, az], { dir: [0, 0, 1] });
  part(new THREE.PlaneGeometry(0.5, 0.75), "#ffffff", [RC[0], GY + 1.2, az + 0.02], { dir: [0, 0, 1], axis: "z", texture: RUNE });
  // floating relic
  const orb = glow(part(new THREE.OctahedronGeometry(0.22, 0), TEAL, [RC[0], GY + 0.9, RC[1] + 0.1], { scale: [1, 1.5, 1] }), 1.6);
  void orb;
  glow(part(new THREE.TorusGeometry(0.36, 0.015, 4, 20), GOLD, [RC[0], GY + 0.9, RC[1] + 0.1], { dir: [1, 0.5, 0], axis: "z" }), 1);
  glow(part(new THREE.TorusGeometry(0.44, 0.012, 4, 20), GOLD, [RC[0], GY + 0.9, RC[1] + 0.1], { dir: [0.2, 1, 0.6], axis: "z" }), 1);
  part(new THREE.CylinderGeometry(0.1, 0.16, 0.3, 6), STONE, [RC[0], GY + 0.35, RC[1] + 0.1]);

  // Pond & waterfall
  part(new THREE.CylinderGeometry(0.85, 0.9, 0.08, 10), "#c9c0aa", [1.85, GY + 0.02, 0.4]);
  glow(part(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 10), WATER, [1.85, GY + 0.05, 0.4]), 0.8);
  glow(part(new THREE.BoxGeometry(0.5, 0.05, 0.34), WATER, [2.75, GY + 0.0, 0.4]), 0.8);
  glow(b.sweep(polyline([[3.0, 2.44, 0.4], [2.1, 1.42, 0.4], [1.3, 0.85, 0.4]]), [0.2, 0.15], { color: WATER, caps: "round" }), 0.9);
  for (let i = 0; i < 5; i++) {
    glow(part(new THREE.IcosahedronGeometry(0.1 + R() * 0.12, 0), "#e8fbff", [1.1 + R() * 0.5 - 0.2, 0.6 + R() * 0.25, 0.4 + (R() - 0.5) * 0.4]), 1);
  }

  // Trees
  const tree = (x: number, z: number, h: number, leaf: string[]) => {
    b.sweep(polyline([[x, GY - 0.05, z], [x + 0.05, GY + h * 0.5, z], [x - 0.04, GY + h, z]]), [0.1, 0.05], { color: BARK, caps: "flat" });
    for (let i = 0; i < 4; i++) {
      const a = i * 2.1;
      part(new THREE.IcosahedronGeometry(0.4 + R() * 0.15, 1), leaf[i % leaf.length], [x + Math.cos(a) * 0.3, GY + h + 0.15 + (i % 2) * 0.2, z + Math.sin(a) * 0.3], { flat: true });
    }
    part(new THREE.IcosahedronGeometry(0.45, 1), leaf[0], [x, GY + h + 0.5, z], { flat: true });
  };
  tree(-2.0, 1.0, 0.9, ["#ffa8c8", "#ff8fb8", "#ffc4d8"]);
  tree(0.7, -1.9, 0.8, ["#ffa8c8", "#ffc4d8"]);
  tree(-2.1, -1.0, 0.7, ["#58b84a", "#7ad05a"]);
  tree(1.0, 1.8, 0.6, ["#58b84a", "#8ede5e"]);
  // fallen petals
  for (let i = 0; i < 14; i++) {
    const a = R() * 6.28, r = 1.5 + R() * 1.1;
    part(new THREE.CircleGeometry(0.04, 5), "#ffb7d0", [Math.cos(a) * r, GY + 0.01, Math.sin(a) * r], { dir: [0, 1, 0], axis: "z" });
  }

  // Crystal cluster
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    const h = 0.3 + R() * 0.4;
    glow(part(new THREE.ConeGeometry(0.07 + R() * 0.04, h, 5), TEAL, [0.1 + Math.cos(a) * 0.13, GY + h / 2, 2.0 + Math.sin(a) * 0.13], { dir: [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3] }), 1.4);
  }
  // Grass tufts & flowers
  for (let i = 0; i < 22; i++) {
    const a = R() * 6.28, r = 0.6 + R() * 2.2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x - RC[0], z - RC[1]) < 1.6 || Math.hypot(x - 1.85, z - 0.4) < 1.0) continue;
    if (i % 3 === 0) part(new THREE.SphereGeometry(0.04, 5, 4), i % 2 ? "#fff3b0" : "#ffffff", [x, GY + 0.12, z]);
    part(new THREE.ConeGeometry(0.05, 0.14 + R() * 0.08, 4), "#8ae05a", [x, GY + 0.06, z]);
  }
  void mottle;
  return b.root;
}
