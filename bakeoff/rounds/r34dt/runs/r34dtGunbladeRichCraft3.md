```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, catmull, rng } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style revolver-hilted gunblade with runed blade, lion chain pendant and glowing gem, planted tip-down.",
};

const GOLD = metal("gilt");
const STEEL = metal("steel", { polish: 0.6 });
const BLUED = metal("blued");
const LEATHER = "#2a1d1a";
const DARK = "#14161f";
const CYAN = "#5ae8ff";

const bladePaint = paint((_p, n, s) => {
  const x = s[0];
  const edge = smoothstep(0.038, 0.058, x);
  const base: [number, number, number] = [0.72, 0.78, 0.86];
  const hi: [number, number, number] = [0.97, 0.99, 1];
  const shade = 0.88 + 0.12 * smoothstep(-0.5, 0.7, n.y);
  const c = mix(base, hi, edge);
  return [c[0] * shade, c[1] * shade, c[2] * shade];
});
const fullerPaint = paint((_p, _n, s) => mix("#46566e", "#2a3548", smoothstep(0, 0.9, s[1])));

const RUNE = svg(
  `<svg viewBox="0 0 20 100"><g stroke="#7af0ff" stroke-width="2" stroke-linecap="round" fill="none">
  <path d="M10 6 L10 16 M5 10 L15 10"/><path d="M5 26 L15 26 L10 36 Z"/><path d="M6 46 L14 54 M14 46 L6 54"/>
  <path d="M10 62 L10 74 M6 66 Q10 60 14 66"/><circle cx="10" cy="88" r="4"/></g></svg>`,
  { size: 256 },
);
const LION = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L50 14 L58 32 L50 52 L32 60 L14 52 L6 32 L14 14 Z" fill="#e8c35a" stroke="#6a4a14" stroke-width="3"/>
  <circle cx="32" cy="32" r="14" fill="#b8892c" stroke="#6a4a14" stroke-width="2.5"/>
  <path d="M24 28 L30 30 M40 28 L34 30" stroke="#2a1a08" stroke-width="3" stroke-linecap="round"/>
  <path d="M28 38 Q32 42 36 38 M32 32 L32 37" stroke="#2a1a08" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M18 20 L24 14 M46 20 L40 14 M12 34 L16 38 M52 34 L48 38" stroke="#6a4a14" stroke-width="3" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const BLUE_STRIPE = svg(
  `<svg viewBox="0 0 40 20"><rect width="40" height="20" fill="#1a2a5a"/><path d="M0 4H40M0 16H40" stroke="#e8c35a" stroke-width="2"/>
  <path d="M5 10 L10 6 L15 10 L10 14Z M25 10 L30 6 L35 10 L30 14Z" fill="#e8c35a"/></svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gunblade" });
  const R = rng(5);

  // helper: cylinder with its axis along dir
  const cyl = (r: number, h: number, color: any, at: number[], dir: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });

  // ---- Blade (hilt up, tip planted at y = 0)
  const outline: any = [
    [-0.045, 0.96],
    [-0.045, 0.14],
    [0.03, 0, "sharp"],
    [0.068, 0.22],
    [0.074, 0.96],
  ];
  b.extrude(outline, { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: bladePaint });
  // fuller groove
  b.extrude(
    [[-0.028, 0.9], [-0.028, 0.24], [0.012, 0.1, "sharp"], [0.034, 0.24], [0.034, 0.9]] as any,
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.0135, color: fullerPaint },
  );
  for (const z of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.05, 0.5), "#ffffff", {
        at: [0.003, 0.55, z * 0.0072],
        dir: [0, 0, z],
        axis: "z",
        texture: RUNE,
      }),
      1.3,
    );
  }
  // edge bevel strip
  b.extrude([[0.06, 0.96], [0.052, 0.2], [0.032, 0.02, "sharp"], [0.07, 0.2], [0.078, 0.96]] as any, {
    at: [0, 0, 0], x: [1, 0, 0], thickness: 0.004, color: "#f4fbff",
  });

  // ---- Spine barrel on blade back
  cyl(0.02, 0.62, BLUED, [-0.066, 0.65, 0], [0, 1, 0], 8);
  cyl(0.026, 0.03, GOLD, [-0.066, 0.34, 0], [0, 1, 0], 8);
  cyl(0.013, 0.012, DARK, [-0.066, 0.325, 0], [0, 1, 0], 8);
  for (const y of [0.45, 0.6, 0.75, 0.9]) cyl(0.023, 0.02, GOLD, [-0.066, y, 0], [0, 1, 0], 8);
  // spine rivets
  for (let i = 0; i < 6; i++)
    b.part(new THREE.SphereGeometry(0.006, 6, 4), GOLD, { at: [0.0, 0.3 + i * 0.1, 0.0075] });

  // ---- Receiver / guard
  box(0.2, 0.14, 0.07, STEEL, [-0.01, 1.01, 0]);
  box(0.215, 0.025, 0.08, GOLD, [-0.01, 0.945, 0]);
  box(0.215, 0.025, 0.08, GOLD, [-0.01, 1.08, 0]);
  // crossguard wings
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.09, 0.015], [0.12, -0.03, "sharp"], [0.06, -0.05], [0, -0.035]] as any, {
      at: [-0.01 + s * 0.1, 0.97, 0], x: [s, 0, 0], thickness: 0.02, bevel: 0.004, color: GOLD,
    });
  }
  // revolver cylinder (both sides)
  for (const z of [1, -1]) {
    cyl(0.052, 0.03, GOLD, [-0.01, 1.01, z * 0.05], [0, 0, 1], 12);
    cyl(0.018, 0.034, STEEL, [-0.01, 1.01, z * 0.052], [0, 0, 1], 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.009, 0.034, DARK, [-0.01 + Math.cos(a) * 0.034, 1.01 + Math.sin(a) * 0.034, z * 0.052], [0, 0, 1], 6);
    }
  }
  // blue/gold trim texture panel on receiver front
  b.part(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", { at: [-0.01, 1.01, 0.0365 + 0.0], dir: [0, 0, 1], axis: "z", texture: BLUE_STRIPE });

  // ---- Grip
  cyl(0.024, 0.22, LEATHER, [-0.01, 1.2, 0], [0, 1, 0], 8);
  for (let i = 0; i < 9; i++)
    b.part(new THREE.TorusGeometry(0.025, 0.004, 4, 8), GOLD, { at: [-0.01, 1.1 + i * 0.024, 0], dir: [0, 1, 0], axis: "z", rotation: [90, 0, 0] });
  // trigger guard & trigger
  b.part(new THREE.TorusGeometry(0.04, 0.006, 5, 12), GOLD, { at: [0.08, 1.07, 0] });
  box(0.008, 0.04, 0.012, DARK, [0.075, 1.075, 0], [0, 0, 15]);
  // hammer
  b.extrude([[0, 0], [0.04, 0.04], [0.05, 0.065], [0.02, 0.05], [0, 0.02]] as any, {
    at: [-0.115, 1.07, 0], x: [-1, 0, 0], thickness: 0.016, color: STEEL,
  });

  // ---- Pommel
  b.lathe([[0, 0], [0.03, 0], [0.038, 0.02], [0.03, 0.045], [0.012, 0.06], [0, 0.06]] as any, {
    at: [-0.01, 1.31, 0], color: GOLD, segments: 8,
  });
  glow(b.part(new THREE.OctahedronGeometry(0.03), CYAN, { at: [-0.01, 1.4, 0], scale: [1, 1.5, 1] }), 1.8);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [-0.01 + s * 0.03, 1.375, 0] });

  // ---- Chain with lion pendant
  const path = catmull([
    [-0.04, 1.31, 0.02],
    [-0.12, 1.26, 0.03],
    [-0.15, 1.14, 0.035],
    [-0.13, 1.0, 0.03],
  ]);
  const N = 12;
  for (let i = 0; i < N; i++) {
    const p = path.at(i / (N - 1));
    b.part(new THREE.TorusGeometry(0.012, 0.0032, 4, 8), i % 2 ? STEEL : GOLD, {
      at: [p.x, p.y, p.z],
      dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
      axis: "z",
    });
  }
  const pe = path.at(1);
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), GOLD, { at: [pe.x, pe.y - 0.05, pe.z], dir: [0, 0, 1] });
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    at: [pe.x, pe.y - 0.05, pe.z + 0.0075], dir: [0, 0, 1], axis: "z", texture: LION,
  });
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    at: [pe.x, pe.y - 0.05, pe.z - 0.0075], dir: [0, 0, -1], axis: "z", texture: LION,
  });

  // wear: small nicks on blade edge (tiny dark notches)
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.006, 0.01, 0.014), "#8a93a2", { at: [0.073, 0.4 + R() * 0.5, 0] });

  return b.root;
}
```