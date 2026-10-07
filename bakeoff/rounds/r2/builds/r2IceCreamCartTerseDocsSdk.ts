import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Ice Cream Cart",
  description: "A stylized pushable ice cream cart with striped canopy, wheels, freezer box and cone toppers.",
};

export default function build() {
  const b = createBuilder({ name: "icecreamcart" });
  const root = b.joint("base", { at: [0, 0.4, 0] });

  const CREAM = "#fff3d6";
  const MINT = "#7fd8c3";
  const PINK = "#ff8fb1";
  const RED = "#e8465a";
  const WHITE = "#fffaf0";
  const WOOD = "#a4683a";
  const DARKWOOD = "#6e4223";
  const METAL = "#b9c2c9";
  const DARK = "#33333b";
  const GOLD = "#e8b84a";
  const CONE = "#d9a04f";
  const CHOC = "#6b3e26";
  const STRAW = "#ffd24a";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  // chassis / deck
  b.part(box(1.3, 0.06, 0.8), DARKWOOD, { bone: root, at: [0, 0.45, 0] });
  // main body freezer box
  b.part(box(1.2, 0.5, 0.72), MINT, { bone: root, at: [0, 0.73, 0] });
  // body trim
  b.part(box(1.24, 0.05, 0.76), WHITE, { bone: root, at: [0, 0.99, 0] });
  b.part(box(1.24, 0.05, 0.76), WHITE, { bone: root, at: [0, 0.5, 0] });
  // lid hatches (two lids on top)
  for (const x of [-0.3, 0.3]) {
    b.part(box(0.5, 0.04, 0.6), METAL, { bone: root, at: [x, 1.04, 0] });
    b.part(cyl(0.025, 0.025, 0.1, 8), DARK, { bone: root, at: [x, 1.1, 0.2], rotation: [0, 0, 90] });
  }
  // front panel decorations: pink scallop stripes
  for (let i = 0; i < 6; i++) {
    const x = -0.5 + i * 0.2;
    b.part(cyl(0.09, 0.09, 0.02, 8), i % 2 ? PINK : WHITE, { bone: root, at: [x, 0.82, 0.37], rotation: [90, 0, 0] });
  }
  // side panel icons (cone shapes)
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.1, 0.25, 6), CONE, { bone: root, at: [s * 0.61, 0.72, 0], rotation: [0, 0, s * 90] });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), PINK, { bone: root, at: [s * 0.7, 0.72, 0] });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: root, at: [s * 0.78, 0.72, 0] });
  }

  // wheels
  for (const s of [1, -1]) {
    const hub = b.joint(s > 0 ? "wheelL" : "wheelR", { parent: root, at: [s * 0.68, 0.32, -0.05], dir: [s, 0, 0] });
    b.part(cyl(0.32, 0.32, 0.07, 16), DARK, { bone: hub, at: hub.at, rotation: [0, 0, 90] });
    b.part(cyl(0.25, 0.25, 0.08, 16), WOOD, { bone: hub, at: hub.at, rotation: [0, 0, 90] });
    b.part(cyl(0.06, 0.06, 0.12, 8), GOLD, { bone: hub, at: hub.at, rotation: [0, 0, 90] });
    for (let i = 0; i < 4; i++) {
      b.part(box(0.03, 0.5, 0.04), DARKWOOD, {
        bone: hub,
        at: [hub.at.x + s * 0.01, hub.at.y, hub.at.z],
        rotation: [i * 45, 0, 0],
      });
    }
  }
  // axle
  b.part(cyl(0.025, 0.025, 1.45, 8), METAL, { bone: root, at: [0, 0.32, -0.05], rotation: [0, 0, 90] });

  // front small support leg and handles
  for (const s of [1, -1]) {
    b.part(cyl(0.025, 0.025, 0.4, 6), METAL, { bone: root, at: [s * 0.5, 0.2, 0.3] });
    b.part(cyl(0.04, 0.04, 0.04, 8), DARK, { bone: root, at: [s * 0.5, 0.02, 0.3] });
    b.rod([s * 0.55, 0.55, -0.4], [s * 0.5, 0.95, -1.0], 0.03, { color: WOOD, bone: root });
    b.part(cyl(0.04, 0.04, 0.16, 8), DARKWOOD, { bone: root, at: [s * 0.5, 0.95, -1.05], rotation: [90, 0, 0] });
  }
  b.rod([-0.5, 0.95, -1.0], [0.5, 0.95, -1.0], 0.025, { color: WOOD, bone: root });

  // canopy poles
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([sx * 0.55, 1.05, sz * 0.33], [sx * 0.55, 2.0, sz * 0.33], 0.02, { color: METAL, bone: root });
      b.part(new THREE.SphereGeometry(0.035, 6, 4), GOLD, { bone: root, at: [sx * 0.55, 2.0, sz * 0.33] });
    }

  // striped canopy: pyramid-ish wedges
  const wedges = 8;
  for (let i = 0; i < wedges; i++) {
    const a0 = (i / wedges) * Math.PI * 2;
    const g = new THREE.ConeGeometry(0.95, 0.4, 8, 1, true, a0, Math.PI * 2 / wedges);
    b.part(g, i % 2 ? WHITE : RED, { bone: root, at: [0, 2.2, 0], scale: [1.0, 1, 0.7] });
  }
  b.part(new THREE.ConeGeometry(0.95, 0.4, 8, 1, true), RED, { bone: root, at: [0, 2.2, 0], scale: [1, 1, 0.7], rotation: [180, 0, 0] });
  // canopy valance scallops
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.1, 6, 4), i % 2 ? WHITE : RED, {
      bone: root,
      at: [Math.cos(a) * 0.9, 2.02, Math.sin(a) * 0.63],
      scale: [1, 0.6, 1],
    });
  }
  b.part(cyl(0.02, 0.02, 0.2, 6), METAL, { bone: root, at: [0, 2.5, 0] });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), GOLD, { bone: root, at: [0, 2.62, 0] });

  // giant ice cream cone topper on canopy
  b.part(new THREE.ConeGeometry(0.06, 0.18, 6), CONE, { bone: root, at: [0, 2.78, 0], rotation: [180, 0, 0] });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), PINK, { bone: root, at: [0, 2.9, 0] });

  // sign board on front
  b.part(box(0.7, 0.2, 0.03), WHITE, { bone: root, at: [0, 1.85, 0.34] });
  b.part(box(0.74, 0.24, 0.02), RED, { bone: root, at: [0, 1.85, 0.33] });
  const rg = rng(5);
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.SphereGeometry(0.04, 6, 4), [PINK, MINT, STRAW, CHOC, RED][i], {
      bone: root,
      at: [-0.26 + i * 0.13, 1.85, 0.36],
    });
  }

  // display cones on top: tub with sprinkles
  for (const [x, col] of [[-0.3, PINK], [0.3, CHOC]] as [number, string][]) {
    b.part(cyl(0.12, 0.1, 0.1, 10), METAL, { bone: root, at: [x, 1.14, -0.1] });
    b.part(new THREE.SphereGeometry(0.11, 8, 6), col, { bone: root, at: [x, 1.2, -0.1], scale: [1, 0.6, 1] });
    for (let i = 0; i < 6; i++) {
      b.part(box(0.015, 0.015, 0.03), [STRAW, MINT, RED][i % 3], {
        bone: root,
        at: [x + (rg() - 0.5) * 0.14, 1.26, -0.1 + (rg() - 0.5) * 0.14],
        rotation: [0, rg() * 180, 0],
      });
    }
  }

  // cone holder rack on side
  b.part(box(0.2, 0.04, 0.2), WOOD, { bone: root, at: [0.0, 1.1, 0.25] });
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.ConeGeometry(0.04, 0.16, 6), CONE, { bone: root, at: [-0.06 + i * 0.06, 1.2, 0.25] });
  }

  // bell
  b.part(new THREE.SphereGeometry(0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.7), GOLD, { bone: root, at: [0.65, 1.0, 0.36] });

  // shift so lowest points rest on floor: wheels bottom at y=0, support feet near 0
  return b.root;
}
