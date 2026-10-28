```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-forged battle axe",
  description: "Two-headed icy battle axe with a runed steel blade, crystal core and wrapped haft, stylised in a League of Legends look.",
};

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const rnd = rng(5);

  const STEEL = paint((p, n) => {
    const t = noise(p, 0.12, 3);
    const c = mix("#5d7fa8", "#c9ecff", smoothstep(0.2, 0.8, t));
    return mix(c, "#ffffff", 0.3 * smoothstep(0.5, 1, n.y));
  });
  const DARK = "#1c2740";
  const GOLD = "#d9b45a";
  const ICE = "#8fe8ff";
  const LEATHER = "#3a4a66";
  const WOOD = paint((p) => mix("#2c3a58", "#4c6288", noise(p, 0.05, 2)));

  // Axe is 1.6 m tall, pommel at y=0, head up the shaft. Faces +Z, blade extends along X.
  const root = b.joint("root", { at: [0, 0.8, 0] });
  const L = 1.6;
  const headY = 1.25;

  // haft
  b.part(new THREE.CylinderGeometry(0.026, 0.03, L - 0.1, 8), WOOD, { bone: root, at: [0, L / 2 + 0.02, 0] });
  // leather wraps
  for (let i = 0; i < 9; i++)
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 8), LEATHER, { bone: root, at: [0, 0.3 + i * 0.065, 0], rotation: [0, 0, 0] });
  // pommel
  b.part(new THREE.ConeGeometry(0.05, 0.12, 6), GOLD, { bone: root, at: [0, 0.06, 0], dir: [0, -1, 0] });
  b.part(new THREE.SphereGeometry(0.045, 6, 5), ICE, { bone: root, at: [0, 0.14, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.03), ICE, { bone: root, at: [0, 0.02, 0] }), 1.4);
  // gold ring collars
  for (const y of [0.22, 0.78, 1.1])
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 8), GOLD, { bone: root, at: [0, y, 0] });

  // central socket + crystal core
  b.part(new THREE.BoxGeometry(0.12, 0.22, 0.09), DARK, { bone: root, at: [0, headY, 0] });
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.1), GOLD, { bone: root, at: [0, headY + 0.12, 0] });
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.1), GOLD, { bone: root, at: [0, headY - 0.12, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.06, 0), ICE, { bone: root, at: [0, headY, 0.05], scale: [1, 1.6, 0.8] }), 1.6);

  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><g stroke="#bff6ff" stroke-width="4" fill="none" stroke-linecap="round"><path d="M32 8V56M32 20L46 30M32 34L46 44M32 20L18 30"/></g></svg>`,
    { size: 96 },
  );

  // blades both sides
  for (const s of [1, -1]) {
    const outline: [number, number, string?][] = [
      [0.05, 0.2],
      [0.2, 0.3],
      [0.42, 0.42, "sharp"],
      [0.5, 0.18, "sharp"],
      [0.45, -0.05],
      [0.5, -0.3, "sharp"],
      [0.3, -0.34],
      [0.05, -0.2],
    ];
    const blade = b.extrude(outline as any, {
      at: [s * 0.04, headY, 0],
      x: [s, 0, 0],
      thickness: [0.05, 0.012],
      bevel: 0.008,
      color: STEEL,
      bone: root,
    });
    // dark edge trim
    b.extrude(
      [
        [0.05, 0.2],
        [0.2, 0.3],
        [0.2, 0.26],
        [0.05, 0.16],
      ] as any,
      { at: [s * 0.04, headY, 0.0], x: [s, 0, 0], thickness: 0.056, color: GOLD, bone: root },
    );
    // rune decal
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
      bone: root,
      at: blade.local([0.22, 0.05, 0.03]).clone().setZ(0.03),
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    });
    glow(b.part(new THREE.PlaneGeometry(0.001, 0.001), ICE, { bone: root, at: [0, 0, 0] }));
    // ice spikes along blade edge
    for (let i = 0; i < 5; i++) {
      const y = headY + 0.3 - i * 0.14;
      const x = s * (0.46 + (i % 2) * 0.03);
      b.part(new THREE.ConeGeometry(0.03, 0.12 + rnd() * 0.06, 5), ICE, {
        bone: root,
        at: [x, y, 0],
        dir: [s, 0.2 - i * 0.12, 0],
      });
    }
  }

  // top spear spike and frost crown
  b.part(new THREE.ConeGeometry(0.045, 0.3, 6), STEEL, { bone: root, at: [0, headY + 0.28, 0] });
  b.part(new THREE.ConeGeometry(0.03, 0.14, 5), ICE, { bone: root, at: [0, headY + 0.4, 0] });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.025, 0.14, 5), ICE, { bone: root, at: [s * 0.07, headY + 0.2, 0.0], dir: [s * 0.5, 1, 0] });

  // hanging tassel
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 5), "#e8f6ff", { bone: root, at: [0.05, 0.35, 0.03] });
  b.part(new THREE.ConeGeometry(0.03, 0.08, 5), "#e8f6ff", { bone: root, at: [0.05, 0.22, 0.03], dir: [0, -1, 0] });

  return b.root;
}
```