```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style gunblade: a wide steel blade with a revolver cylinder and trigger grip, lion crest and glowing runes.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  // Weapon lies pointing up (+Y) like a held sword, standing on its pommel at y=0 ... blade up, faces +Z.
  const grip = b.joint("grip", { at: [0, 0.2, 0], dir: [0, 1, 0] });
  const blade = b.joint("blade", { parent: grip, at: [0, 0.5, 0], dir: [0, 1, 0] });
  const trigger = b.joint("trigger", { parent: grip, at: [0, 0.36, 0.05], dir: [0, -0.3, 1], role: "hinge" });

  const STEEL = metal("steel", { polish: 0.7 });
  const BLUED = metal("blued");
  const GILT = metal("gilt");
  const IRON = panelled(metal("iron"), { size: 0.06, rivets: 0.02 });
  const LEATHER = "#3b2318";
  const RED = "#a8202a";
  const CYAN = "#7fe8ff";

  // Pommel and grip
  b.lathe([[0, 0], [0.04, 0], [0.05, 0.03], [0.04, 0.06], [0, 0.07]], { at: [0, 0, 0], bone: grip, color: GILT, segments: 8 });
  b.rod([0, 0.06, 0], [0, 0.34, 0], 0.028, { color: LEATHER, bone: grip, sides: 8 });
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 8), GILT, { bone: grip, at: [0, 0.09 + i * 0.037, 0], rotation: [90, 0, 0] });
  }
  // Guard
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.07), GILT, { bone: grip, at: [0, 0.37, 0] });
  for (const s of [1, -1]) {
    b.spike([s * 0.11, 0.37, 0], [s, 0.2, 0], 0.07, 0.025, { color: GILT, bone: grip });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), RED, { bone: grip, at: [s * 0.07, 0.37, 0.036] });
  }
  // Gun housing (revolver cylinder + hammer + trigger guard)
  b.part(new THREE.BoxGeometry(0.07, 0.14, 0.09), IRON, { bone: grip, at: [0, 0.45, 0.01] });
  const cyl = b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 6), BLUED, { bone: grip, at: [0, 0.45, 0.07], rotation: [90, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 6), "#0a0a10", {
      bone: grip, at: [Math.cos(a) * 0.032, 0.45 + Math.sin(a) * 0.032, 0.108], rotation: [90, 0, 0],
    });
  }
  b.part(new THREE.BoxGeometry(0.02, 0.06, 0.03), IRON, { bone: grip, at: [0, 0.54, -0.04], rotation: [-25, 0, 0] });
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.02), GILT, { bone: trigger, at: [0, 0.33, 0.07], rotation: [20, 0, 0] });
  b.sweep([[0, 0.38, 0.05], [0, 0.38, 0.12], [0, 0.3, 0.12], [0, 0.3, 0.05]], 0.007, { color: GILT, bone: grip });

  // Blade: wide single edge with chisel tip
  const outline: [number, number, "sharp"?][] = [
    [-0.045, 0], [0.065, 0], [0.07, 0.9], [0.0, 1.05, "sharp"], [-0.045, 0.9],
  ];
  const bl = b.extrude(outline as any, { at: [0, 0.52, 0], x: [1, 0, 0], thickness: [0.025, 0.012], bevel: 0.004, color: STEEL, bone: blade });
  // Fuller and edge accents
  b.extrude([[-0.012, 0.05], [0.012, 0.05], [0.012, 0.85], [-0.012, 0.85]], { at: [0.005, 0.52, 0.0125], x: [1, 0, 0], thickness: 0.006, color: BLUED, bone: blade });
  b.extrude([[0.05, 0.02], [0.066, 0.02], [0.069, 0.88], [0.05, 0.88]], { at: [0, 0.52, 0.0], x: [1, 0, 0], thickness: [0.03, 0.016], color: "#e8f0ff", bone: blade });
  // Spine ridge with gilt studs
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 6), GILT, { bone: blade, at: [-0.046, 0.62 + i * 0.14, 0], rotation: [0, 0, 90] });
  // Lion crest decal
  const crest = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 6 L42 18 L56 20 L46 32 L50 50 L32 42 L14 50 L18 32 L8 20 L22 18Z" fill="#d6a23a" stroke="#22112f" stroke-width="3"/><circle cx="32" cy="30" r="7" fill="#a8202a" stroke="#22112f" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", { bone: blade, at: [0.005, 0.66, 0.0275], dir: [0, 0, 1], axis: "z", texture: crest });
  // Glowing runes
  const rune = svg(
    `<svg viewBox="0 0 32 128"><g stroke="#7fe8ff" stroke-width="4" fill="none" stroke-linecap="round"><path d="M16 6 V30 M8 14 L16 22 L24 14"/><path d="M8 48 H24 M16 44 V68"/><path d="M8 84 L16 96 L24 84 M16 96 V120"/></g></svg>`,
    { size: 128 },
  );
  glow(b.part(new THREE.PlaneGeometry(0.03, 0.2), "#ffffff", { bone: blade, at: [0.005, 0.95, 0.0275], dir: [0, 0, 1], axis: "z", texture: rune }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CYAN, { bone: grip, at: [0, 0.5, 0.058] }), 2);
  // Chain with tassel charm
  b.sweep([[0.03, 0.02, 0], [0.07, -0.0, 0.02], [0.08, -0.04, 0.02]].map((p) => p), 0.004, { color: GILT, bone: grip, caps: "round" });
  b.part(new THREE.OctahedronGeometry(0.02), RED, { bone: grip, at: [0.08, -0.05, 0.02] });

  const root = b.root;
  // Lift so the lowest point (charm) rests on the floor
  root.position.y = 0.06;
  return root;
}
```