```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "scorpion",
  description:
    "Stylized desert scorpion: a flattened prosoma, segmented mesosoma, pincer pedipalps, eight jointed legs and a venom tail arched over the back.",
};

const C = {
  body: "#7b4a22",
  dark: "#3b2412",
  pale: "#c8995c",
  claw: "#a86c35",
  sting: "#b8391c",
  eye: "#101010",
  glint: "#fff2c4",
  mouth: "#2a1a0e",
};

// Ellipsoid built from a unit sphere, so it can be placed in one call.
function blob(rx: number, ry: number, rz: number, seg = 14): THREE.SphereGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3));
  g.scale(rx, ry, rz);
  return g;
}

function ball(r: number, seg = 8): THREE.SphereGeometry {
  return new THREE.SphereGeometry(r, seg, Math.max(5, seg - 2));
}

// Prosoma (cephalothorax) ellipsoid, used to seat eyes on its curved top.
const PRO = { c: [0, 0.03, 0.03], r: [0.016, 0.011, 0.024] };

function proTop(x: number, z: number): number {
  const k = 1 - (x / PRO.r[0]) ** 2 - ((z - PRO.c[2]) / PRO.r[2]) ** 2;
  return PRO.c[1] + PRO.r[1] * Math.sqrt(Math.max(0, k));
}

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // Root joint: the body, centred over the legs.
  const body = b.joint("body", { at: [0, 0.03, 0] });

  // ---- Body -------------------------------------------------------------
  // Prosoma: broad, flattened front section.
  b.part(blob(PRO.r[0], PRO.r[1], PRO.r[2], 16), C.body, { at: PRO.c, bone: body });
  // Dark shield plate over the front of the prosoma.
  b.part(blob(0.012, 0.005, 0.014), C.dark, { at: [0, 0.0395, 0.036], bone: body });

  // Mesosoma: two plated segments, alternating tone for banding.
  b.part(blob(0.016, 0.013, 0.014), C.body, { at: [0, 0.031, -0.012], bone: body });
  b.part(blob(0.015, 0.012, 0.013), C.dark, { at: [0, 0.030, -0.030], bone: body });
  // Tergite seams across the back.
  b.part(blob(0.0165, 0.0030, 0.0030), C.dark, { at: [0, 0.0435, -0.021], bone: body });

  // Mouth, a small dark wedge at the front underside.
  b.part(blob(0.0045, 0.0022, 0.0035), C.mouth, { at: [0, 0.023, 0.053], bone: body });

  // ---- Eyes -------------------------------------------------------------
  // Two median eyes and two lateral triplets' worth of pairs, seated on the curved top.
  const eyeSpots: [number, number][] = [
    [-0.004, 0.047],
    [0.004, 0.047],
    [-0.011, 0.040],
    [0.011, 0.040],
    [-0.013, 0.030],
    [0.013, 0.030],
  ];
  for (const [x, z] of eyeSpots) {
    const ey = proTop(x, z) - 0.0008;
    b.part(ball(0.0026, 8), C.eye, { at: [x, ey, z], bone: body });
    b.part(ball(0.0008, 6), C.glint, { at: [x + 0.0009, ey + 0.0012, z + 0.0016], bone: body });
  }

  // ---- Tail (metasoma) --------------------------------------------------
  // Arcs up and over the back, then curls the venom bulb forward.
  const tailPts: number[][] = [
    [0, 0.03, -0.04],
    [0, 0.036, -0.058],
    [0, 0.05, -0.074],
    [0, 0.068, -0.08],
    [0, 0.084, -0.072],
    [0, 0.094, -0.056],
    [0, 0.096, -0.042],
  ];
  const tail = b.chain("tail", tailPts, { role: "tail" });
  b.sweep(tail, 0.0078, { color: C.body });

  // Segment rings, alternating dark and body tone, shrinking toward the tip.
  const segT = [0.12, 0.3, 0.48, 0.66, 0.84];
  segT.forEach((t, i) => {
    const r = 0.0098 - i * 0.0006;
    b.part(ball(r, 10), i % 2 === 0 ? C.dark : C.body, { at: tail.at(t) });
  });

  // Venom bulb at the top of the arc.
  b.part(blob(0.0105, 0.0095, 0.0125, 12), C.body, { at: [0, 0.093, -0.036], bone: body });
  // Stinger, a sharp spike pointing forward and down.
  b.spike([0, 0.097, -0.030], [0, 0.080, -0.004], null, 0.0035);

  // ---- Legs and pedipalps (mirrored) ------------------------------------
  const legZ = [0.036, 0.020, 0.004, -0.012];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eight walking legs: hip, raised knee, foot on the floor.
    legZ.forEach((z, i) => {
      const hip = [s * 0.014, 0.026, z];
      const knee = [s * 0.034, 0.038, z + 0.006];
      const foot = [s * 0.054, 0.0015, z - 0.008];
      const leg = b.chain(`leg${side}${i}`, [hip, knee, foot], { role: "leg" });
      b.sweep(leg, 0.0027, { color: C.pale });
      // Knee joint knob.
      b.part(ball(0.0036, 8), C.dark, { at: knee });
      // Tarsal claw at the foot.
      b.spike(foot, [s * 0.8, 0.3, -0.25], 0.007, 0.0018);
    });

    // Pedipalp arm running forward from the front of the prosoma.
    const palp = b.chain(`palp${side}`, [
      [s * 0.013, 0.027, 0.046],
      [s * 0.026, 0.030, 0.072],
      [s * 0.021, 0.028, 0.098],
    ], { role: "arm" });
    b.sweep(palp, 0.0052, { color: C.body });

    // Chela palm.
    b.part(blob(0.0085, 0.0068, 0.0105, 12), C.body, { at: [s * 0.020, 0.028, 0.110] });

    // Pincer: a fixed finger and a slightly open moving finger.
    b.spike([s * 0.013, 0.028, 0.116], [s * 0.005, 0.027, 0.136], null, 0.0042);
    b.spike([s * 0.027, 0.028, 0.116], [s * 0.015, 0.027, 0.134], null, 0.0040);
    // Teeth on the fingertips.
    b.spike([s * 0.010, 0.028, 0.124], [s * 0.008, 0.026, 0.130], null, 0.0013);
    b.spike([s * 0.022, 0.028, 0.124], [s * 0.017, 0.026, 0.128], null, 0.0013);
  }

  return b.root;
}
```