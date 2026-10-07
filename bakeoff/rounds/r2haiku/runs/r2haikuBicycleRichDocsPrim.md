```ts
import * as THREE from "three";
import { createBuilder, arc, catmull, frame, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Dutch city bicycle",
  description:
    "Vintage mint-green Dutch city bike: upright bars with cream grips and a silver bell, a leather sprung saddle, chrome mudguards, a chain guard, whitewall tyres and a wicker basket of sunflowers and a baguette.",
};

const MINT = "#9fd6b8";
const CHROME = "#d6dbe1";
const CREAM = "#f5ecd6";
const LEATHER = "#6b4224";
const TYRE = "#222326";
const WHITE = "#f7f2e6";
const BELL = "#c4c9d0";
const WICKER = "#c9a06a";
const WICKER_DARK = "#8e6236";
const SUN = "#f4b82a";
const SUN_CENTRE = "#4a2a12";
const STEM = "#4f7a34";
const BREAD = "#c98a3e";
const SLASH = "#7a4a1e";
const CHAIN = "#5d646c";
const PEDAL = "#2a2a2a";
const RED = "#b8322a";

export default function build() {
  const b = createBuilder({ name: "dutch-bike" });

  // Skeleton: ground frame, steering head, and both wheels.
  const base = b.joint("frame", { at: [0, 0.36, 0] });
  const steer = b.joint("steer", { parent: base, at: [0, 0.9, 0.42] });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.36, 0.52] });
  const wheelR = b.joint("wheelR", { parent: base, at: [0, 0.36, -0.52] });

  // ---- Frame (step-through: low top tube) ----
  b.capsule([0, 0.82, 0.44], [0, 0.3, -0.02], 0.022, { color: MINT, bone: base }); // down tube
  b.capsule([0, 0.88, 0.42], [0, 0.9, -0.18], 0.017, { color: MINT, bone: base }); // low top tube
  b.capsule([0, 0.3, -0.02], [0, 0.92, -0.2], 0.018, { color: MINT, bone: base }); // seat tube
  b.capsule([0, 0.82, 0.44], [0, 1.0, 0.4], 0.024, { color: MINT, bone: steer }); // head tube
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 10), CHROME, {
    at: [0, 0.3, -0.02],
    dir: [1, 0, 0],
    bone: base,
  }); // bottom bracket shell

  for (const s of [1, -1]) {
    b.capsule([s * 0.06, 0.3, -0.02], [s * 0.06, 0.36, -0.52], 0.011, { color: MINT, bone: base }); // chainstay
    b.capsule([s * 0.03, 0.86, -0.19], [s * 0.06, 0.36, -0.52], 0.01, { color: MINT, bone: base }); // seatstay
    b.capsule([s * 0.05, 0.8, 0.44], [s * 0.06, 0.36, 0.52], 0.013, { color: MINT, bone: steer }); // fork blade
  }
  b.capsule([-0.05, 0.8, 0.44], [0.05, 0.8, 0.44], 0.02, { color: MINT, bone: steer }); // fork crown

  // Seat post
  b.capsule([0, 0.88, -0.2], [0, 0.955, -0.26], 0.016, { color: CHROME, bone: base });

  // ---- Saddle: brown leather, carried on coil springs ----
  b.extrude(
    [
      [-0.13, 0.05],
      [0.02, 0.06],
      [0.12, 0.035],
      [0.13, 0.0],
      [0.02, -0.01],
      [-0.12, -0.01],
      [-0.14, 0.02],
    ],
    {
      at: [0, 0.995, -0.26],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.11, 0.16],
      bevel: 0.008,
      smoothing: 1,
      color: LEATHER,
      bone: base,
    },
  );
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 12), CHROME, {
      at: [0, 0.955 + i * 0.009, -0.26],
      dir: [0, 1, 0],
      axis: "z",
      bone: base,
    });
  }

  // ---- Chain guard, chainring, cranks, pedals, chain ----
  b.extrude(
    [
      [0.09, -0.06],
      [0.1, 0.08],
      [0.02, 0.13],
      [-0.14, 0.13],
      [-0.24, 0.08],
      [-0.3, 0.0],
      [-0.3, -0.06],
      [0.0, -0.06],
    ],
    {
      at: [-0.09, 0.29, -0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      smoothing: 2,
      color: MINT,
      bone: base,
    },
  );
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.006, 20), CHAIN, {
    at: [-0.06, 0.3, -0.02],
    dir: [1, 0, 0],
    bone: base,
  });
  b.capsule([-0.14, 0.3, -0.02], [-0.14, 0.17, -0.02], 0.012, { color: CHROME, bone: base });
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.1), PEDAL, { at: [-0.14, 0.16, -0.02], bone: base });
  b.capsule([-0.06, 0.39, -0.02], [-0.06, 0.395, -0.52], 0.004, { color: CHAIN, bone: base });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 14), CHAIN, {
    at: [-0.06, 0.36, -0.52],
    dir: [1, 0, 0],
    bone: wheelR,
  });

  // ---- Wheels: black whitewall tyres, chrome hubs and spokes ----
  const wheel = (joint: any, cz: number) => {
    const at: [number, number, number] = [0, 0.36, cz];
    b.part(new THREE.TorusGeometry(0.322, 0.038, 8, 32), TYRE, {
      at,
      bone: joint,
      dir: [1, 0, 0],
      axis: "z",
    });
    for (const s of [1, -1]) {
      b.part(new THREE.RingGeometry(0.245, 0.3, 36), WHITE, {
        at: [s * 0.034, 0.36, cz],
        bone: joint,
        dir: [s, 0, 0],
        axis: "z",
      });
    }
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), CHROME, {
      at,
      bone: joint,
      dir: [1, 0, 0],
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      b.rod(at, [0, 0.36 + 0.25 * Math.cos(a), cz + 0.25 * Math.sin(a)], 0.0025, {
        color: CHROME,
        bone: joint,
      });
    }
  };
  wheel(wheelR, -0.52);
  wheel(wheelF, 0.52);

  // ---- Mudguards: chrome bands arcing over each wheel ----
  b.sweep(arc([0, 0.36, 0.52], [0, 0.75, 0.52], [1, 0, 0], 100), () => [0.03, 0.004], {
    color: CHROME,
    bone: wheelF,
  });
  b.sweep(arc([0, 0.36, -0.52], [0, 0.75, -0.52], [-1, 0, 0], 110), () => [0.03, 0.004], {
    color: CHROME,
    bone: wheelR,
  });
  b.part(new THREE.BoxGeometry(0.04, 0.03, 0.03), RED, { at: [0, 0.24, -0.88], bone: wheelR });

  // ---- Steering: stem, upright bars with cream grips, bell, headlamp ----
  b.capsule([0, 1.0, 0.4], [0, 1.14, 0.34], 0.016, { color: CHROME, bone: steer });
  b.sweep(
    catmull([
      [-0.3, 1.19, 0.16],
      [-0.22, 1.16, 0.28],
      [0, 1.14, 0.34],
      [0.22, 1.16, 0.28],
      [0.3, 1.19, 0.16],
    ]),
    0.012,
    { color: CHROME, bone: steer },
  );
  for (const s of [1, -1]) {
    b.capsule([s * 0.2, 1.16, 0.28], [s * 0.3, 1.19, 0.16], 0.018, { color: CREAM, bone: steer });
  }
  b.part(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), BELL, {
    at: [0.1, 1.16, 0.32],
    bone: steer,
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8), CHROME, {
    at: [0.1, 1.15, 0.32],
    bone: steer,
  });
  b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.09, 12), CHROME, {
    at: [0, 0.85, 0.55],
    dir: [0, 0.25, 1],
    bone: steer,
  });

  // ---- Wicker basket on the front, carried from the bars ----
  b.frustumBox([0, 1.0, 0.56], [0, 1.0, 0.82], [0.32, 0.2], [0.28, 0.18], {
    color: stripes(WICKER, WICKER_DARK, { size: 0.03, axis: "y" }),
    bone: steer,
  });
  const rim: [number, number, number][][] = [
    [
      [-0.16, 1.1, 0.56],
      [0.16, 1.1, 0.56],
    ],
    [
      [-0.14, 1.09, 0.82],
      [0.14, 1.09, 0.82],
    ],
    [
      [-0.16, 1.1, 0.56],
      [-0.14, 1.09, 0.82],
    ],
    [
      [0.16, 1.1, 0.56],
      [0.14, 1.09, 0.82],
    ],
  ];
  for (const [p, q] of rim) b.capsule(p, q, 0.011, { color: WICKER_DARK, bone: steer });
  for (const s of [1, -1]) {
    b.capsule([s * 0.1, 1.13, 0.33], [s * 0.14, 0.95, 0.56], 0.008, { color: CHROME, bone: steer });
  }

  // Sunflowers: stem, dark centre and a ring of petals each.
  const petal = new THREE.BoxGeometry(0.028, 0.06, 0.005).translate(0, 0.03, 0);
  const heads: { c: [number, number, number]; dir: [number, number, number]; base: [number, number, number] }[] = [
    { c: [-0.1, 1.27, 0.66], dir: [-0.4, 0.7, 0.6], base: [-0.1, 1.0, 0.66] },
    { c: [0.07, 1.3, 0.6], dir: [0.3, 0.8, 0.5], base: [0.07, 1.0, 0.6] },
    { c: [0.02, 1.24, 0.8], dir: [0, 0.6, 1], base: [0.02, 1.0, 0.8] },
    { c: [0.13, 1.2, 0.74], dir: [0.5, 0.5, 1], base: [0.13, 1.0, 0.74] },
  ];
  for (const h of heads) {
    b.capsule(h.base, h.c, 0.008, { color: STEM, bone: steer });
    b.part(new THREE.SphereGeometry(0.03, 10, 6), SUN_CENTRE, { at: h.c, bone: steer });
    b.ring(frame(h.c, h.dir), { count: 12, radius: 0.028 }, (p) => {
      b.part(petal, SUN, { frame: p });
    });
  }

  // Baguette lying across the top, with three slashes.
  const bread = b.sweep(
    catmull([
      [-0.14, 1.13, 0.6],
      [0, 1.15, 0.7],
      [0.14, 1.13, 0.82],
    ]),
    0.026,
    { color: BREAD, bone: steer, caps: "round" },
  );
  for (const t of [0.25, 0.5, 0.75]) {
    b.stick(new THREE.BoxGeometry(0.035, 0.006, 0.012), SLASH, bread.at(t, 0, 0), {
      embed: 0.3,
      bone: steer,
    });
  }

  return b.root;
}
```