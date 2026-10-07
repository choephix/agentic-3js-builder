```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Ice Cream Cart",
  description: "A stylized pushcart with striped canopy, freezer box, wheels and ice cream cones.",
};

export default function build() {
  const b = createBuilder({ name: "icecreamcart" });
  const body = b.joint("body", { at: [0, 0.5, 0] });

  const CREAM = "#fff3d6", MINT = "#7fd8c4", PINK = "#ff8fb1", RED = "#e84a5f";
  const WOOD = "#a8693a", DARK = "#3a3a44", STEEL = "#b8c0c8", WHITE = "#ffffff";
  const CHOC = "#6b3b24", STRAW = "#ffd36a", CONE = "#d9a35b", GOLD = "#f2c14e";

  const box = (w: number, h: number, d: number, c: string, at: number[], bone = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as [number, number, number] });

  // chassis
  box(0.9, 0.06, 1.5, WOOD, [0, 0.45, 0]);
  // freezer box
  box(0.84, 0.5, 1.0, MINT, [0, 0.73, -0.1]);
  box(0.88, 0.05, 1.04, CREAM, [0, 1.0, -0.1]);
  box(0.86, 0.06, 1.02, PINK, [0, 0.52, -0.1]);
  // lid hatches
  for (const z of [-0.35, 0.15]) {
    box(0.7, 0.03, 0.4, STEEL, [0, 1.04, z]);
    box(0.2, 0.03, 0.04, DARK, [0, 1.07, z + 0.14]);
  }
  // front panel decoration
  box(0.5, 0.2, 0.02, CREAM, [0, 0.75, 0.41]);
  const sign = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#fff"/><circle cx="20" cy="18" r="8" fill="#ff8fb1"/><path d="M12 22 L20 30 L28 22Z" fill="#d9a35b"/><text x="34" y="22" font-size="12" font-family="sans-serif" font-weight="bold" fill="#e84a5f">ICE</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.25), WHITE, {
    bone: body, at: [0, 0.75, 0.415], dir: [0, 0, 1], axis: "z", texture: sign,
  });
  // side stripes
  for (const s of [1, -1]) {
    box(0.02, 0.1, 1.0, PINK, [s * 0.43, 0.8, -0.1]);
    box(0.02, 0.06, 1.0, CREAM, [s * 0.43, 0.65, -0.1]);
  }

  // wheels
  for (const s of [1, -1]) {
    const w = b.joint(s > 0 ? "wheelL" : "wheelR", { parent: body, at: [s * 0.52, 0.32, -0.1], dir: [s, 0, 0], role: "hinge" });
    b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.07, 14), DARK, { bone: w, at: w.at, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.09, 14), RED, { bone: w, at: w.at, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8), STEEL, { bone: w, at: w.at, dir: [1, 0, 0] });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 4;
      b.part(new THREE.BoxGeometry(0.04, 0.4, 0.04), STEEL, {
        bone: w, at: [w.at.x + s * 0.04, w.at.y, w.at.z], rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
  }
  // axle
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), STEEL, { bone: body, at: [0, 0.32, -0.1], dir: [1, 0, 0] });
  // front support leg
  box(0.06, 0.3, 0.06, STEEL, [0.3, 0.3, 0.6]);
  box(0.06, 0.3, 0.06, STEEL, [-0.3, 0.3, 0.6]);
  box(0.1, 0.03, 0.1, DARK, [0.3, 0.02, 0.6]);
  box(0.1, 0.03, 0.1, DARK, [-0.3, 0.02, 0.6]);

  // handle
  b.rod([0.35, 0.6, -0.85], [0.35, 0.9, -1.35], 0.025, { color: WOOD, bone: body });
  b.rod([-0.35, 0.6, -0.85], [-0.35, 0.9, -1.35], 0.025, { color: WOOD, bone: body });
  b.rod([0.35, 0.9, -1.35], [-0.35, 0.9, -1.35], 0.03, { color: WOOD, bone: body });

  // canopy poles
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.rod([sx * 0.4, 1.02, sz * 0.4 - 0.1], [sx * 0.4, 2.0, sz * 0.4 - 0.1], 0.022, { color: STEEL, bone: body });
  }
  // canopy: striped segments
  const N = 8, W = 1.3;
  for (let i = 0; i < N; i++) {
    const w = W / N;
    const x = -W / 2 + w * (i + 0.5);
    const c = i % 2 ? CREAM : RED;
    const h = 0.04;
    const y = 2.05 + 0.18 * (1 - Math.pow(x / (W / 2), 2));
    const tilt = (-x / (W / 2)) * 25;
    b.part(new THREE.BoxGeometry(w + 0.005, h, 1.3), c, { bone: body, at: [x, y, -0.1], rotation: [0, 0, tilt] });
    // valance
    const yv = y - 0.1 - 0.12 * (Math.abs(x) / (W / 2));
    b.part(new THREE.BoxGeometry(w, 0.1, 0.02), c, { bone: body, at: [x, yv, 0.55] });
    b.part(new THREE.ConeGeometry(w / 2, 0.08, 4), c, { bone: body, at: [x, yv - 0.08, 0.55], rotation: [180, 45, 0] });
  }
  // finial
  b.part(new THREE.SphereGeometry(0.06, 8, 6), GOLD, { bone: body, at: [0, 2.3, -0.1] });
  b.part(new THREE.ConeGeometry(0.03, 0.12, 6), GOLD, { bone: body, at: [0, 2.4, -0.1] });

  // display cones on top
  const scoops = [PINK, MINT, CHOC, STRAW];
  scoops.forEach((c, i) => {
    const x = -0.27 + i * 0.18;
    const z = 0.38;
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), STEEL, { bone: body, at: [x, 1.1, z] });
    b.part(new THREE.ConeGeometry(0.05, 0.16, 6), CONE, { bone: body, at: [x, 1.2, z], rotation: [180, 0, 0] });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), c, { bone: body, at: [x, 1.32, z] });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), c, { bone: body, at: [x, 1.4, z] });
    b.part(new THREE.SphereGeometry(0.015, 5, 4), RED, { bone: body, at: [x, 1.44, z] });
  });
  // bell
  b.part(new THREE.SphereGeometry(0.05, 8, 6), GOLD, { bone: body, at: [-0.35, 1.12, -0.5] });

  return b.root;
}
```