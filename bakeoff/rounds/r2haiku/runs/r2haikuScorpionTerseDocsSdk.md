```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, mottle, scales, stripes } from "agentic-3js-builder";

export const meta = {
  name: "scorpion",
  description:
    "A stylised scorpion about half a metre long: a segmented carapace, pincered pedipalps, four pairs of jointed walking legs and a tail curled over the back, ending in an orange stinger.",
};

const CARAPACE = mottle("#5a3115", "#8f5a2b", { size: 0.04, seed: 5 });
const TAIL = scales("#7b4a22", "#2f1a0b", { size: 0.022, seed: 2 });
const LEG = stripes("#8d5424", "#2e1809", { size: 0.03 });
const CLAW = mottle("#7a3f1c", "#a9632c", { size: 0.025, seed: 9 });
const DARK = "#1d0f06";
const EYE = "#0b0b0b";
const STING = "#c8431a";

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // Root: the centre of the body. Everything else hangs from here.
  const hips = b.joint("hips", { at: [0, 0.049, -0.014], role: "spine" });

  // Prosoma (front shield) flowing into the segmented mesosoma.
  const body = b.loft(
    [
      { at: [0, 0.053, 0.091], w: 0.049, h: 0.035 },
      { at: [0, 0.056, 0.042], w: 0.084, h: 0.042 },
      { at: [0, 0.056, -0.007], w: 0.091, h: 0.046 },
      { at: [0, 0.053, -0.042], w: 0.07, h: 0.042 },
      { at: [0, 0.046, -0.084], w: 0.056, h: 0.035 },
      { at: [0, 0.049, -0.098], w: 0.042, h: 0.032 },
    ],
    { bone: hips, color: CARAPACE },
  );

  // Dark tergite seams across the body.
  const shell = b.surface(body);
  for (const z of [-0.06, -0.085]) {
    const seam = shell.loop([0, 0.049, z], { dir: [0, 0, 1], lift: 0.002 });
    b.sweep(seam, 0.0025, { color: DARK });
  }

  // Eyes: two large lateral pairs and two small median ones, seated on the shield.
  for (const s of [1, -1]) {
    const big = shell.nearest([s * 0.02, 0.085, 0.08]);
    b.stick(new THREE.SphereGeometry(0.006, 6, 4), EYE, big, { embed: 0.3 });
    const small = shell.nearest([s * 0.011, 0.088, 0.1]);
    b.stick(new THREE.SphereGeometry(0.0035, 6, 4), EYE, small, { embed: 0.3 });
  }

  // Metasoma: a segmented tail that arches up and over, stinger forward.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.053, -0.091],
      [0, 0.07, -0.154],
      [0, 0.133, -0.189],
      [0, 0.189, -0.161],
      [0, 0.21, -0.098],
      [0, 0.203, -0.042],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.02 - 0.008 * t, { color: TAIL });
  b.spike(tail.at(1), [0, -0.6, 1], 0.05, 0.009, { color: STING });

  // Four pairs of walking legs, feet planted on the floor.
  const legs = [
    { z: 0.028, xf: 0.1, zf: 0.02 },
    { z: 0.0, xf: 0.112, zf: 0.0 },
    { z: -0.028, xf: 0.11, zf: -0.02 },
    { z: -0.056, xf: 0.09, zf: -0.04 },
  ];
  legs.forEach((leg, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const root = [s * 0.035, 0.049, leg.z];
      const foot = [s * leg.xf, 0.005, leg.z + leg.zf];
      const pts = limb(root, foot, [0.056, 0.063, 0.049], [
        [s, 1, 0],
        [s, 1, 0],
      ]);
      const chain = b.chain(`leg${i + 1}${side}`, pts, {
        parent: hips,
        names: [`hip${i + 1}${side}`, `knee${i + 1}${side}`, `ankle${i + 1}${side}`, `foot${i + 1}${side}`],
        role: "leg",
      });
      b.sweep(chain, (t) => 0.009 - 0.004 * t, { color: LEG });
    }
  });

  // Pedipalps: raised, jointed arms ending in pincers.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.035, 0.056, 0.07],
        [s * 0.063, 0.056, 0.14],
        [s * 0.084, 0.053, 0.21],
        [s * 0.084, 0.049, 0.252],
      ]),
      { parent: hips, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, (t) => 0.011 - 0.003 * t, { color: CLAW });

    // Palm of the claw.
    b.loft(
      [
        { at: [s * 0.084, 0.053, 0.205], w: 0.04, h: 0.03 },
        { at: [s * 0.084, 0.05, 0.245], w: 0.05, h: 0.034 },
      ],
      { color: CLAW },
    );

    // Fixed finger and the movable finger, dark tips for contrast.
    b.sweep(
      catmull([
        [s * 0.077, 0.049, 0.238],
        [s * 0.074, 0.048, 0.28],
        [s * 0.068, 0.046, 0.315],
      ]),
      (t) => 0.0135 - 0.0095 * t,
      { bands: [[0.7, CLAW], [1, DARK]], caps: "point" },
    );
    b.sweep(
      catmull([
        [s * 0.091, 0.049, 0.238],
        [s * 0.087, 0.047, 0.28],
        [s * 0.058, 0.046, 0.31],
      ]),
      (t) => 0.0135 - 0.0095 * t,
      { bands: [[0.7, CLAW], [1, DARK]], caps: "point" },
    );
  }

  return b.root;
}
```