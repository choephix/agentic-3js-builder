```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, grain, bezier, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A heroic double-bladed axe of blued steel and gilt trim with a glowing glacial gem, rune-etched ice edge, and frozen crystals, planted in a snowy rune-ringed stone plinth.",
};

const GILT = "#e3b650";
const GILT_D = "#a67a2a";
const LEATHER = "#3b2a2e";
const ICE_A = "#c9f6ff";
const ICE_B = "#79d6ff";
const ICE_C = "#e9fbff";
const CLOTH = "#2f7fd8";

// ---------- textures ----------
const RUNE = svg(
  `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#9ff0ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 12 Q70 50 70 80 Q70 110 12 148"/>
      <path d="M30 40 Q52 62 52 80 Q52 98 30 120" stroke="#e9fbff" stroke-width="3.5"/>
    </g>
    <g stroke="#e9fbff" stroke-width="4.5" stroke-linecap="round" fill="none">
      <path d="M26 80 H62 M44 62 V98 M31 67 L57 93 M57 67 L31 93"/>
    </g>
    <circle cx="44" cy="80" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);
const RING = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="94" fill="none" stroke="#7fe6ff" stroke-width="5"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#bff3ff" stroke-width="3"/>
    <g stroke="#9ff0ff" stroke-width="6" stroke-linecap="round">
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 100 + Math.sin(a) * 74;
        const y1 = 100 - Math.cos(a) * 74;
        const x2 = 100 + Math.sin(a) * 90;
        const y2 = 100 - Math.cos(a) * 90;
        return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
      }).join("")}
    </g>
    <path d="M100 52 V148 M58 76 L142 124 M142 76 L58 124" stroke="#e9fbff" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// ---------- paints ----------
const BLADE = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5) return "#effcff";
  const x = s[0];
  const base = mix("#2f4c78", "#6d93bd", noise(new THREE.Vector3(x * 3, s[1] * 3, n.z), 0.25, 4));
  const edge = smoothstep(0.23, 0.33, x);
  const rim = smoothstep(0.0, 0.1, x) * 0.0;
  return mix(mix(base, "#9fc4e6", rim), ICE_A, edge);
});
const SNOWROCK = paint((p, n) => {
  if (n.y > 0.55) return mix("#f0f9ff", "#c3e2f5", noise(p, 0.08, 2));
  return mix("#4a5568", "#7a8798", noise(p, 0.1, 5));
});
const HAFT = grain("#233a63", "#3e5f94", { size: 0.012, axis: "y" });
const STEEL = metal("blued", { tarnish: 0.1 });

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const HY = 1.1; // head height

  const cone = (base: number[], dir: number[], len: number, r: number, color: string, sides = 6, glowK = 0) => {
    const d = new THREE.Vector3(...dir).normalize();
    const c = new THREE.Vector3(...base).addScaledVector(d, len / 2);
    const part = b.part(new THREE.ConeGeometry(r, len, sides), color, { bone: root, at: c, dir: d, flat: true });
    if (glowK) glow(part, glowK);
    return part;
  };

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.39, 0.05],
      [0.33, 0.13],
      [0.2, 0.16],
      [0, 0.16],
    ],
    { at: [0, 0, 0], segments: 8, color: SNOWROCK, bone: root },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.21, 24), "#ffffff", {
      bone: root,
      at: [0, 0.166, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RING,
    }),
    1.2,
  );
  // snow mounds
  for (let i = 0; i < 5; i++) {
    const a = 0.6 + i * 1.25;
    b.part(new THREE.SphereGeometry(0.05 + R() * 0.03, 6, 4), "#f2fbff", {
      bone: root,
      at: [Math.sin(a) * 0.3, 0.15, Math.cos(a) * 0.3],
      scale: [1, 0.5, 1],
      flat: true,
    });
  }
  // side crystals
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.3;
    const rr = 0.33;
    const len = 0.1 + R() * 0.16;
    const col = [ICE_A, ICE_B, ICE_C][i % 3];
    cone(
      [Math.sin(a) * rr, 0.1, Math.cos(a) * rr],
      [Math.sin(a) * 0.55, 1, Math.cos(a) * 0.55],
      len,
      0.035 + R() * 0.02,
      col,
      6,
      i % 2 ? 0.6 : 0,
    );
  }
  // frost shards hugging the haft
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + 0.4;
    cone([Math.sin(a) * 0.05, 0.15, Math.cos(a) * 0.05], [Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5], 0.15 + R() * 0.06, 0.025, ICE_C, 5, 0.5);
  }

  // ---------- haft ----------
  b.sweep(
    [
      [0, 0.08, 0],
      [0, 1.36, 0],
    ],
    0.03,
    { color: HAFT, caps: "flat", bone: root },
  );
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.TorusGeometry(0.033, 0.007, 5, 8), LEATHER, {
      bone: root,
      at: [0, 0.34 + i * 0.045, 0],
      rotation: [90, 0, 0],
      flat: true,
    });
  }
  for (const y of [0.3, 0.76]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 8), GILT, { bone: root, at: [0, y, 0], flat: true });
  }
  // cloth ribbon + tassel
  b.sweep(
    bezier([0.0, HY - 0.2, 0.05], [0.04, HY - 0.36, 0.1], [-0.03, HY - 0.5, 0.07], [0.02, HY - 0.66, 0.1]),
    (t) => [0.022 * (1 - t * 0.3), 0.004],
    { section: "box", color: CLOTH, caps: "flat", bone: root },
  );
  b.part(new THREE.SphereGeometry(0.028, 6, 4), GILT, { bone: root, at: [0, HY - 0.2, 0.05], flat: true });
  cone([0.02, HY - 0.64, 0.1], [0, -1, 0], 0.09, 0.025, GILT_D, 6);

  // ---------- head collar ----------
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.44, 8), STEEL, { bone: root, at: [0, HY, 0], flat: true });
  for (const dy of [-0.21, 0.21, 0]) {
    b.part(new THREE.CylinderGeometry(dy === 0 ? 0.054 : 0.058, dy === 0 ? 0.054 : 0.058, dy === 0 ? 0.02 : 0.03, 8), GILT, {
      bone: root,
      at: [0, HY + dy, 0],
      flat: true,
    });
  }
  // top spike and cap
  cone([0, HY + 0.225, 0], [0, 1, 0], 0.26, 0.04, ICE_A, 6);
  cone([0, HY + 0.225, 0], [0, 1, 0], 0.05, 0.05, GILT, 8);
  cone([0, HY - 0.225, 0], [0, -1, 0], 0.1, 0.05, GILT_D, 8);

  // glacial gem
  b.part(new THREE.TorusGeometry(0.046, 0.009, 5, 10), GILT, { bone: root, at: [0, HY, 0.05] });
  glow(
    b.part(new THREE.OctahedronGeometry(0.05), "#7ff4ff", {
      bone: root,
      at: [0, HY, 0.064],
      scale: [0.8, 1.3, 0.7],
      flat: true,
    }),
    1.6,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.03), "#7ff4ff", {
      bone: root,
      at: [0, HY, -0.064],
      scale: [0.8, 1.3, 0.7],
      flat: true,
    }),
    1.4,
  );

  // ---------- blades ----------
  const bracket: [number, number, string?][] = [
    [0, 0.27],
    [0.1, 0.31],
    [0.13, 0.2],
    [0.13, -0.2],
    [0.1, -0.31],
    [0, -0.27],
  ].map((q) => [q[0], q[1]] as [number, number]);
  const mainBlade: any = [
    [0.02, 0.22],
    [0.14, 0.27],
    [0.28, 0.36],
    [0.43, 0.34, "sharp"],
    [0.35, 0.2],
    [0.31, 0.07],
    [0.31, -0.07],
    [0.35, -0.2],
    [0.43, -0.34, "sharp"],
    [0.28, -0.36],
    [0.14, -0.27],
    [0.02, -0.22],
  ];
  const backBlade: any = [
    [0.0, 0.15],
    [0.12, 0.19],
    [0.26, 0.12],
    [0.34, 0.0, "sharp"],
    [0.26, -0.12],
    [0.12, -0.19],
    [0.0, -0.15],
  ];
  const at = [0, HY, 0];
  b.extrude(mainBlade, { at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.032, bevel: 0.009, color: BLADE, bone: root });
  b.extrude(backBlade, { at, x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, color: BLADE, bone: root });
  for (const sx of [1, -1]) {
    b.extrude(bracket as any, {
      at,
      x: [sx, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.01,
      color: metal("gilt"),
      bone: root,
    });
  }
  // rune inlays on both faces of main blade
  for (const sz of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
        bone: root,
        at: [0.19, HY, sz * 0.0175],
        dir: [0, 0, sz],
        axis: "z",
        texture: RUNE,
      }),
      1.3,
    );
  }
  // ice teeth and icicles on the head
  for (let i = 0; i < 4; i++) {
    const y = -0.15 + i * 0.1;
    cone([0.31 + (i === 1 || i === 2 ? 0 : 0.03), HY + y, 0], [1, 0.0, 0], 0.07, 0.02, ICE_C, 5, 0.7);
  }
  for (const [x, l] of [
    [0.4, 0.14],
    [0.3, 0.1],
    [0.2, 0.08],
  ]) {
    cone([x, HY - 0.33, 0], [0, -1, 0], l, 0.022, ICE_B, 5, 0.5);
  }
  // crystals bursting from the back blade
  for (const [x, ang, l] of [
    [0.2, 25, 0.18],
    [0.28, 5, 0.16],
    [0.2, -30, 0.15],
  ] as number[][]) {
    const r = (ang * Math.PI) / 180;
    cone([-x, HY, 0.0], [-Math.cos(r), Math.sin(r), 0.0], l, 0.03, ICE_A, 6, 0.6);
  }

  return b.root;
}
```