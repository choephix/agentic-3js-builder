```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Gunblade",
  description: "A Final Fantasy style gunblade: broad steel blade with a revolver cylinder, trigger guard, and glowing rune edge, standing point-up.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const grip = b.joint("grip", { at: [0, 0.3, 0], dir: [0, 1, 0] });

  const STEEL = metal("steel", { polish: 0.7 });
  const BLUED = metal("blued");
  const GILT = metal("gilt");
  const IRON = panelled(metal("iron"), { size: 0.06, rivets: 0.02 });
  const LEATHER = "#3a2418";
  const RED = "#b3261e";
  const CYAN = "#7fe8ff";

  const RUNE = svg(
    `<svg viewBox="0 0 64 256"><rect width="64" height="256" fill="#0a2a3a"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M32 ${20 + i * 40} l-12 14 l12 14 l12 -14z M32 ${20 + i * 40} v-12" stroke="#7fe8ff" stroke-width="4" fill="none"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  const RUNE_TEX = RUNE;

  // grip
  b.part(new THREE.CylinderGeometry(0.028, 0.03, 0.26, 8), LEATHER, { at: [0, 0.2, -0.0], bone: grip });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.TorusGeometry(0.03, 0.005, 5, 10), GILT, { at: [0, 0.09 + i * 0.045, 0], rotation: [90, 0, 0], bone: grip });
  // pommel
  b.part(new THREE.OctahedronGeometry(0.045), GILT, { at: [0, 0.06, 0], bone: grip, flat: true });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), RED, { at: [0, 0.06, 0.035], bone: grip });

  // revolver body (receiver) behind the guard
  b.part(new THREE.BoxGeometry(0.07, 0.16, 0.13), IRON, { at: [0, 0.36, 0.0], bone: grip });
  // cylinder
  const cyl = b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), BLUED, { at: [0, 0.38, 0.06], rotation: [0, 0, 90], bone: grip, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 6), "#111118", {
      at: [0, 0.38 + Math.cos(a) * 0.04, 0.06 + Math.sin(a) * 0.04],
      rotation: [0, 0, 90],
      bone: grip,
    });
  }
  void cyl;
  // trigger + guard
  b.part(new THREE.TorusGeometry(0.05, 0.007, 5, 14, Math.PI), GILT, { at: [0, 0.3, 0.0], rotation: [0, 90, 0], bone: grip });
  b.part(new THREE.BoxGeometry(0.01, 0.04, 0.012), RED, { at: [0, 0.29, 0.02], bone: grip });
  // hammer
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.03), STEEL, { at: [0, 0.46, -0.07], rotation: [-30, 0, 0], bone: grip });

  // crossguard
  for (const s of [1, -1]) {
    b.extrude(
      [[0, -0.02], [0.14, -0.005], [0.17, 0.04, "sharp"], [0.1, 0.03], [0, 0.03]],
      { at: [0, 0.455, 0], x: [s, 0, 0], thickness: 0.04, bevel: 0.005, color: GILT, bone: grip },
    );
    b.part(new THREE.SphereGeometry(0.018, 6, 5), RED, { at: [s * 0.12, 0.465, 0.022], bone: grip });
  }

  // blade (spine side thick, edge toward +Z)
  const bladeOutline: [number, number, string?][] = [
    [-0.05, 0], [0.05, 0], [0.06, 0.55], [0.05, 0.85], [0, 1.0, "sharp"], [-0.05, 0.8], [-0.055, 0.5],
  ];
  const blade = b.extrude(bladeOutline as any, {
    at: [0, 0.48, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.03, 0.012], bevel: 0.004, color: STEEL, bone: grip,
  });
  void blade;
  // edge bevel strip (brighter)
  b.part(new THREE.BoxGeometry(0.004, 0.8, 0.02), "#f2f6ff", { at: [0, 0.9, 0.055], bone: grip });
  // spine rail
  b.part(new THREE.BoxGeometry(0.04, 0.9, 0.025), BLUED, { at: [0, 0.93, -0.06], bone: grip });
  // fuller with glowing runes
  glow(
    b.part(new THREE.PlaneGeometry(0.04, 0.62), "#ffffff", {
      at: [0.0165, 0.86, 0.0], dir: [1, 0, 0], axis: "z", texture: RUNE_TEX, bone: grip,
    }),
    1.3,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.04, 0.62), "#ffffff", {
      at: [-0.0165, 0.86, 0.0], dir: [-1, 0, 0], axis: "z", texture: RUNE_TEX, bone: grip,
    }),
    1.3,
  );
  // spine studs and gilded bands
  const r = rng(3);
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 6), GILT, {
      at: [0, 0.6 + i * 0.13 + r() * 0.01, -0.06], rotation: [0, 0, 90], bone: grip,
    });
  // muzzle glow
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 5), CYAN, { at: [0, 0.5, 0.065], bone: grip }), 1.5);
  // hanging tassel
  b.part(new THREE.CylinderGeometry(0.005, 0.012, 0.1, 5), RED, { at: [0, 0.0, 0], bone: grip });
  b.part(new THREE.ConeGeometry(0.018, 0.06, 5), RED, { at: [0, -0.03, 0], rotation: [180, 0, 0], bone: grip });

  // lift so lowest point (tassel) touches y=0 : tassel bottom ~ y=0.0 - 0.06 -> shift whole root
  b.root.position.y = 0.06;
  return b.root;
}
```