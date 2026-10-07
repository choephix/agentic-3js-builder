import * as THREE from "three";
import { countershade, createBuilder, catmull, gradient, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "Scorpion",
  description: "A stylised scorpion: segmented carapace, pincer pedipalps, eight legs and an arched sting tail.",
};

export default function scorpion() {
  const b = createBuilder({ name: "scorpion", detail: 1, paintSize: 1024 });

  const DARK = "#3b2516";
  const LEG = "#4a3020";
  const CLAW = "#4c2f1a";
  const STING = "#1e0e08";

  // The carapace: a banded dark-brown paint with a pale belly, so the back reads from above and the underside lightens.
  const carapace = stripes(
    mottle("#5b3d22", "#33200f", { size: 0.02, seed: 4 }),
    "#7a5530",
    { size: 0.011, axis: "z", width: 0.25, wobble: 0.3, seed: 2 },
  );
  const shell = countershade(carapace, "#a07a48", { level: -0.2, soft: 0.5 });

  // Root bone at the body's centre.
  b.joint("body", { at: [0, 0.022, 0] });

  // Spine: rear of the mesosoma forward to the head (the tip joint).
  const spine = b.chain(
    "spine",
    [
      [0, 0.02, -0.06],
      [0, 0.022, -0.025],
      [0, 0.024, 0.0],
      [0, 0.026, 0.03],
      [0, 0.026, 0.05],
    ],
    { parent: "body", role: "spine", names: ["spine1", "spine2", "spine3", "head"] },
  );

  // Body: one smooth loft from the mesosoma rear over the broad prosoma to the front.
  b.loft(
    [
      { at: [0, 0.02, -0.064], w: 0.024, h: 0.02 },
      { at: [0, 0.021, -0.036], w: 0.03, h: 0.024 },
      { at: [0, 0.023, -0.008], w: 0.034, h: 0.026 },
      { at: [0, 0.026, 0.02], w: 0.042, h: 0.03 },
      { at: [0, 0.026, 0.044], w: 0.04, h: 0.03 },
      { at: [0, 0.025, 0.056], w: 0.02, h: 0.02 },
    ],
    { color: shell, bone: spine, name: "carapace" },
  );

  // Median and lateral eyes on the prosoma.
  const eye = () => new THREE.SphereGeometry(0.0042, b.segments(10), b.segments(8));
  for (const x of [-0.007, 0.007]) b.part(eye(), "#060504", { at: [x, 0.038, 0.05], bone: "head" });
  for (const s of [-1, 1]) b.part(eye(), "#060504", { at: [s * 0.02, 0.035, 0.038], bone: "head" });

  // Eight legs: four pairs, each a jointed chain with a rounded knee.
  const zs = [0.034, 0.012, -0.011, -0.033];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const id = `${i + 1}${S}`;
      const leg = b.chain(
        `leg${id}`,
        [
          [s * 0.019, 0.027, z],
          [s * 0.058, 0.048, z + 0.01],
          [s * 0.09, 0.024, z + 0.018],
          [s * 0.115, 0.0015, z + 0.026],
        ],
        {
          parent: "spine2",
          role: "leg",
          names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        },
      );
      b.sweep(leg, [0.0045, 0.0022], { color: LEG, name: `leg${id}` });
      // A knob at the knee, seated on the joint.
      b.part(new THREE.SphereGeometry(0.0034, b.segments(8), b.segments(6)), DARK, { frame: leg.joints[1] });
    });
  }

  // Pedipalps: a jointed arm ending in a bulbous pincer.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `palp${S}`,
      [
        [s * 0.02, 0.028, 0.048],
        [s * 0.046, 0.03, 0.09],
        [s * 0.054, 0.025, 0.125],
      ],
      { parent: "head", role: "arm", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`] },
    );
    b.sweep(arm, [0.0056, 0.0042], { color: CLAW, name: `palp${S}` });
    const wrist = arm.joints[arm.joints.length - 1];

    // The chela's palm, swelling then tapering.
    b.loft(
      [
        { at: [s * 0.054, 0.025, 0.128], w: 0.012, h: 0.013 },
        { at: [s * 0.056, 0.024, 0.142], w: 0.021, h: 0.018 },
        { at: [s * 0.054, 0.023, 0.156], w: 0.014, h: 0.013 },
      ],
      { color: CLAW, bone: wrist, name: `palm${S}` },
    );

    // Two fingers meeting at a gap, the fixed one outside.
    b.sweep(
      [
        [s * 0.062, 0.024, 0.15],
        [s * 0.05, 0.023, 0.18],
        [s * 0.02, 0.022, 0.2],
      ],
      [0.0045, 0.0015],
      { color: CLAW, bone: wrist, name: `fingerFixed${S}` },
    );
    b.sweep(
      [
        [s * 0.04, 0.023, 0.15],
        [s * 0.032, 0.022, 0.18],
        [s * 0.01, 0.021, 0.2],
      ],
      [0.0042, 0.0014],
      { color: CLAW, bone: wrist, name: `fingerMoving${S}` },
    );

    // Teeth along the inside of the fixed finger.
    b.spike([s * 0.05, 0.0225, 0.165], [s * 0.04, 0.021, 0.172], null, 0.002, { color: STING, name: `tooth${S}` });
    b.spike([s * 0.046, 0.0225, 0.178], [s * 0.037, 0.021, 0.184], null, 0.0018, { color: STING, name: `tooth2${S}` });
  }

  // The metasoma: a tail arching up over the back, tip hooking forward.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.034, -0.05],
      [0, 0.058, -0.078],
      [0, 0.088, -0.098],
      [0, 0.11, -0.092],
      [0, 0.126, -0.068],
      [0, 0.132, -0.04],
    ]),
    {
      parent: "spine1",
      role: "tail",
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    },
  );
  b.sweep(tail, (t: number) => 0.0115 - 0.0065 * t + 0.0012 * Math.sin(Math.PI * t * 2), {
    color: gradient("#b5793c", "#2a170c", [0, 0.034, -0.05], [0, 0.132, -0.04]),
    name: "tail",
  });

  // The venom bulb near the tip.
  b.part(new THREE.SphereGeometry(0.0085, b.segments(12), b.segments(9)), "#5a2c12", {
    frame: tail.at(0.9),
    scale: [1, 1, 1.25],
    name: "venomBulb",
  });

  // The curved sting, from the tail tip, hooking forward.
  b.spike(tail.joints[tail.joints.length - 1], [0, 0.12, -0.012], null, 0.0042, {
    color: STING,
    name: "stinger",
  });

  return b.root;
}
