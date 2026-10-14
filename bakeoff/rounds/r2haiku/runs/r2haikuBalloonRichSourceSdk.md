```ts
import * as THREE from "three";
import { createBuilder, extrude, gradient, paint, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description: "A striped hot-air balloon on its wicker basket, burner lit, ropes taut, sandbags on the sides and a small flag on one corner.",
};

export default function balloon() {
  const b = createBuilder({ name: "hot-air balloon" });

  // Rig: a root on the ground, the basket on it, the envelope above and the burner on the basket.
  b.joint("root", { at: [0, 0, 0] });
  b.joint("basket", { at: [0, 0, 0], parent: "root" });
  b.joint("envelope", { at: [0, 2.6, 0], parent: "root" });
  b.joint("burner", { at: [0, 1.4, 0], parent: "basket" });

  // Colours
  const SUN = "#ffc20e";
  const TOMATO = "#e8412c";
  const SKY = "#6ec6f0";
  const CREAM = "#fff3c4";
  const NAVY = "#2b3a67";

  // Envelope: bold vertical stripes (12 meridians, 30 degrees each) with a checked band at the middle.
  // Lathe surface coordinates are [height along the outline, degrees round the axis].
  const envelope = paint((p, n, s) => {
    const [h, deg] = s;
    if (h > 5.0 && h < 6.6) {
      const edge = h < 5.12 || h > 6.48;
      if (edge) return NAVY;
      const cell = (Math.floor(deg / 15) + Math.floor(h / 0.4)) % 2;
      return cell ? CREAM : NAVY;
    }
    return [SUN, TOMATO, SKY][Math.floor(deg / 30) % 3];
  });

  // Wicker: horizontal weave rows in two browns.
  const wicker = stripes("#9a6a3a", ["#c99a5b", "#b5824a"], {
    size: 0.09,
    axis: "y",
    width: 0.55,
    wobble: 0.2,
  });

  // Basket: a tapered box that is wider at the top, with a darker rim lip.
  b.frustumBox([0, 0, 0], [0, 1.4, 0], [1.2, 1.2], [1.5, 1.5], {
    color: wicker,
    caps: "flat",
    bone: "basket",
    name: "basket",
  });
  b.frustumBox([0, 1.36, 0], [0, 1.52, 0], [1.56, 1.56], [1.56, 1.56], {
    color: "#6b4224",
    caps: "flat",
    bone: "basket",
    name: "basket.rim",
  });

  // Envelope: a solid of revolution, open at the mouth underneath.
  b.lathe(
    [
      [1.2, 0],
      [2.4, 0.9],
      [3.5, 2.6],
      [4.2, 4.8],
      [4.4, 7.0],
      [4.0, 9.2],
      [3.0, 10.9],
      [1.8, 11.9],
      [0, 12.4],
    ],
    {
      color: envelope,
      at: [0, 2.6, 0],
      bone: "envelope",
      segments: 24,
      name: "envelope",
    },
  );

  // Burner: a grey head on a short stem, with a flame that runs from yellow to orange.
  b.rod([0, 1.4, 0], [0, 1.95, 0], 0.06, { color: "#3c4048", bone: "burner", name: "burner.stem" });
  b.capsule([0, 1.98, 0], [0, 2.22, 0], 0.2, { color: "#4a4f57", bone: "burner", name: "burner.head" });
  b.lathe(
    [
      [0, 0],
      [0.3, 0.04],
      [0.36, 0.3],
      [0.24, 0.62],
      [0.1, 0.9],
      [0, 1.05],
    ],
    {
      color: gradient("#fff1a6", "#ff6a1a", [0, 2.25, 0], [0, 3.2, 0]),
      at: [0, 2.22, 0],
      bone: "burner",
      segments: 10,
      name: "burner.flame",
    },
  );

  // Ropes: eight from the basket rim (on its square perimeter) up to the envelope skirt.
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const m = Math.max(Math.abs(sx), Math.abs(cz));
    const basketPoint: [number, number, number] = [(sx * 0.7) / m, 1.52, (cz * 0.7) / m];
    const envelopePoint: [number, number, number] = [sx * 2.5, 3.6, cz * 2.5];
    b.rod(basketPoint, envelopePoint, 0.018, { color: "#8b6b3e", bone: "basket", name: `rope${k + 1}` });
  }

  // Sandbags hanging on the basket sides: squashed spheres.
  const bag = new THREE.SphereGeometry(0.17, 10, 8);
  bag.scale(1.25, 0.8, 0.7);
  const bags: Array<[number, number, number]> = [
    [-0.35, 0.95, 0.8],
    [0.05, 0.9, 0.82],
    [0.4, 0.97, 0.78],
    [-0.2, 0.9, -0.8],
    [-0.8, 0.9, 0.2],
  ];
  for (const [i, at] of bags.entries()) {
    b.part(bag.clone(), "#c8a46a", { at, bone: "basket", name: `sandbag${i + 1}` });
  }

  // A little flag on the back-left corner: a pole and a swallowtail pennant.
  b.rod([-0.7, 1.52, -0.7], [-0.7, 2.4, -0.7], 0.02, { color: "#333333", bone: "basket", name: "flag.pole" });
  extrude(
    [
      [0, 0],
      [0.8, 0.12],
      [0.55, 0.26],
      [0.8, 0.4],
      [0, 0.34],
    ],
    {
      color: TOMATO,
      at: [-0.7, 2.3, -0.7],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      bone: "basket",
      name: "flag",
    },
  );

  return b.root;
}
```