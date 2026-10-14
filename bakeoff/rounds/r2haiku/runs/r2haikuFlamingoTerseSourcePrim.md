```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description: "A greater flamingo standing on one bent-kneed leg pose, with an S-curved neck, a bent two-tone bill and folded coral wings with black tips.",
};

const LIGHT = "#f7b6c8";
const DEEP = "#e9587f";
const WING = "#ea6d92";
const LEG = "#e59bb1";
const BILL_PINK = "#f8c6d4";
const BLACK = "#15151c";

export default function flamingo() {
  const b = createBuilder({ name: "flamingo", paintSize: 1024 });

  // Skeleton: hips at the centre of the body, legs and neck hang off it.
  b.joint("hips", { at: [0, 0.82, 0] });

  // Body: a long coral egg, painted from pale chest to deep back.
  b.part(
    new THREE.SphereGeometry(0.2, b.segments(16), b.segments(12)),
    gradient(LIGHT, DEEP, [0, 1.0, 0.1], [0, 0.82, -0.25]),
    { bone: "hips", at: [0, 0.9, -0.02], scale: [0.66, 0.56, 1.02], name: "body" },
  );

  // Tail: a short upturned plume.
  b.part(new THREE.ConeGeometry(0.06, 0.16, b.segments(8)), DEEP, {
    bone: "hips",
    at: [0, 0.92, -0.25],
    dir: [0, 0.5, -1],
    name: "tail",
  });

  // Neck: a tall S-curve from the chest to the head.
  const neckPath = catmull([
    [0, 1.0, 0.12],
    [0, 1.16, 0.22],
    [0, 1.28, 0.16],
    [0, 1.36, 0.24],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: "hips",
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  b.sweep(neck, [0.05, 0.034, 0.028, 0.034, 0.04], { color: LIGHT, name: "neck" });

  // Head and bill: the bill is a bent tube, pale at the base and black toward the tip.
  const head = b.joint("head", { parent: neck, at: [0, 1.4, 0.3], dir: [0, 1, 0.3], role: "head" });
  b.part(new THREE.SphereGeometry(0.075, b.segments(14), b.segments(10)), LIGHT, {
    bone: head,
    scale: [1, 0.95, 1.2],
    name: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, b.segments(8), b.segments(6)), BLACK, {
      bone: head,
      at: [0.05 * s, 1.43, 0.33],
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }
  const bill = catmull([
    [0, 1.43, 0.33],
    [0, 1.41, 0.42],
    [0, 1.35, 0.47],
    [0, 1.28, 0.42],
  ]);
  b.sweep(bill, [0.026, 0.022, 0.016, 0.01], {
    bands: [
      [0.5, BILL_PINK],
      [1, BLACK],
    ],
    bone: head,
    name: "bill",
  });

  // Legs: each a jointed chain with a backward knee, a forward ankle and a small foot with three toes.
  const leg = (side: "L" | "R", x: number) => {
    const path = polyline([
      [x, 0.84, 0.0],
      [x, 0.5, -0.1],
      [x, 0.12, 0.02],
      [x, 0.02, 0.04],
    ]);
    const chain = b.chain("leg" + side, path, {
      parent: "hips",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(chain, [0.024, 0.016, 0.012], { color: LEG, name: "leg" + side });
    for (const o of [-0.035, 0, 0.035]) {
      b.rod(
        [x + o, 0.012, 0.04],
        [x + o * 1.4, 0.012, 0.13],
        0.006,
        { color: LEG, bone: `foot${side}`, name: `toe${side}` },
      );
    }
  };
  leg("L", 0.08);
  leg("R", -0.08);

  // Wings: folded coral panels along the flanks, with black primary tips.
  const wing = (side: "L" | "R", s: number) => {
    const x = 0.14 * s;
    b.slab(
      [
        [x, 1.0, 0.12],
        [x, 0.99, -0.02],
        [x, 0.92, -0.22],
        [x, 0.86, -0.3],
        [x, 0.84, -0.12],
        [x, 0.9, 0.02],
      ],
      { color: WING, thickness: 0.014, bone: "hips", name: "wing" + side },
    );
    const tx = 0.155 * s;
    b.slab(
      [
        [tx, 0.93, -0.2],
        [tx, 0.86, -0.31],
        [tx, 0.83, -0.28],
        [tx, 0.87, -0.16],
      ],
      { color: BLACK, thickness: 0.016, bone: "hips", name: "wingtip" + side },
    );
  };
  wing("L", 1);
  wing("R", -1);

  return b.root;
}
```