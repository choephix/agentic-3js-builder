import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];

const BLUE = "#2a7fe0";
const INK = "#1b1f2a";
const GREEN = "#3f9a4a";
const EYE = "#1fa6a0";
const EYE_DARK = "#0f3d46";
const WING = "#dcf1ff";
const VEIN = "#7d8a94";
const AMBER = "#b5772a";
const LEG = "#2b2f3a";

export const meta = {
  name: "Dragonfly",
  description:
    "A resting dragonfly: big compound eyes, a green thorax, a banded blue abdomen, four glassy wings held flat and six legs.",
};

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // Small helpers, all closed over the builder.
  const sub = (a: V, c: V): V => [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const len = (d: V) => Math.hypot(d[0], d[1], d[2]);
  const unit = (d: V): V => {
    const l = len(d);
    return [d[0] / l, d[1] / l, d[2] / l];
  };
  const midOf = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

  // A cylinder stretched from point a to point c, riding the given bone.
  const seg = (a: V, c: V, rA: number, rB: number, color: string, bone: any, extra = 0) => {
    const d = sub(a, c);
    const l = len(d) + extra;
    b.part(new THREE.CylinderGeometry(rA, rB, l, 8), color, {
      at: midOf(a, c),
      dir: unit(d),
      bone,
    });
  };

  const ball = (p: V, r: number, color: string, bone: any, scale?: V) => {
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at: p, bone, scale });
  };

  const box = (p: V, size: V, color: string, bone: any) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: p, bone });
  };

  // ---- Skeleton: thorax at the centre, head forward, abdomen trailing back ----
  const thorax = b.joint("thorax", { at: [0, 0.036, 0.012] });
  const head = b.joint("head", { at: [0, 0.042, 0.034], parent: thorax });

  // ---- Thorax and head ----
  ball([0, 0.036, 0.012], 0.0125, GREEN, thorax, [0.85, 1.0, 1.2]);
  // Dark shoulder stripes and a dorsal stripe on each side.
  for (const s of [1, -1]) {
    box([s * 0.0095, 0.039, 0.006], [0.002, 0.007, 0.0035], INK, thorax);
    box([s * 0.0095, 0.039, 0.0], [0.002, 0.007, 0.0035], INK, thorax);
    box([s * 0.0075, 0.047, 0.012], [0.0035, 0.0012, 0.009], INK, thorax);
  }

  // Head with its huge compound eyes.
  ball([0, 0.043, 0.036], 0.0095, GREEN, head, [1, 0.95, 0.9]);
  for (const s of [1, -1]) {
    ball([s * 0.0062, 0.047, 0.04], 0.0075, EYE, head, [1, 1.1, 0.95]);
    ball([s * 0.0068, 0.0475, 0.0455], 0.0042, EYE_DARK, head);
    // Short antennae.
    seg([s * 0.002, 0.051, 0.036], [s * 0.006, 0.0575, 0.044], 0.0006, 0.0006, INK, head);
  }

  // ---- Abdomen: eleven joints in a chain, ten banded segments ----
  const abdPts: V[] = Array.from({ length: 11 }, (_, i) => [0, 0.034 - 0.0007 * i, -0.008 - 0.0088 * i]);
  const abdR = [0.0068, 0.0064, 0.006, 0.0062, 0.0058, 0.0052, 0.0046, 0.004, 0.0036, 0.0032, 0.003];
  const abdJ = abdPts.map((p, i) =>
    b.joint(`abd${i}`, { at: p, parent: i === 0 ? thorax : undefined }),
  );
  // Each joint is parented to the one before it.
  // (Joints above were created in order; parent is set through the chain below.)

  for (let i = 0; i < 10; i++) {
    const a = abdPts[i];
    const c = abdPts[i + 1];
    const d = sub(a, c);
    const l = len(d) + 0.0012;
    // Cylinder +Y points along dir, so the top cap sits toward the tail.
    b.part(new THREE.CylinderGeometry(abdR[i + 1], abdR[i], l, 10), i % 3 === 1 ? INK : BLUE, {
      at: midOf(a, c),
      dir: unit(d),
      bone: abdJ[i],
    });
  }
  // Tail end and claspers.
  const tailEnd = abdPts[10];
  ball(tailEnd, 0.0030, INK, abdJ[10], [1, 1, 1.3]);
  for (const s of [1, -1]) {
    seg(tailEnd, [s * 0.0025, tailEnd[1] - 0.0012, tailEnd[2] - 0.0065], 0.0008, 0.0003, INK, abdJ[10]);
  }

  // ---- Wings: four flat extruded membranes with veins and a dark tip mark ----
  const forewingPts: [number, number][] = [
    [0, -0.004],
    [0.02, -0.005],
    [0.05, -0.004],
    [0.062, -0.0005],
    [0.058, 0.0015],
    [0.03, 0.003],
    [0, 0.003],
  ];
  const hindwingPts: [number, number][] = [
    [0, -0.003],
    [0.03, -0.004],
    [0.054, -0.003],
    [0.058, 0.0],
    [0.05, 0.003],
    [0.025, 0.004],
    [0, 0.003],
  ];

  const wingGeo = (pts: [number, number][], s: number) => {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * s, y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.0005, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); // lay the wing flat, thickness along +Y
    return g;
  };

  const wings = [
    { name: "wingF", z: 0.012, pts: forewingPts, tip: 0.05 },
    { name: "wingH", z: 0.0, pts: hindwingPts, tip: 0.048 },
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const w of wings) {
      const at: V = [s * 0.004, 0.05, w.z];
      const joint = b.joint(`${w.name}${side}`, { at, parent: thorax });
      b.part(wingGeo(w.pts, s), WING, { at, bone: joint });

      // Three longitudinal veins running out along the span.
      for (const dz of [-0.0025, 0.0, 0.0025]) {
        box([s * 0.03, 0.0508, w.z + dz], [0.058, 0.0008, 0.0007], VEIN, joint);
      }
    }
    // Amber pterostigma near the forewing tip.
    const fwJoint = b.joint(`pteroMark${side}`, { at: [s * 0.004, 0.05, 0.012], parent: thorax });
    box([s * 0.05, 0.0509, 0.0145], [0.007, 0.0008, 0.0018], AMBER, fwJoint);
  }

  // ---- Six legs: hip, knee and foot joints, a foot touching the ground ----
  const legs = [
    { z: 0.01, kz: 0.006, fz: 0.012 },
    { z: 0.001, kz: 0.0, fz: 0.0 },
    { z: -0.008, kz: -0.006, fz: -0.012 },
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs.forEach((L, i) => {
      const hipP: V = [s * 0.006, 0.034, L.z];
      const kneeP: V = [s * 0.024, 0.016, L.z + L.kz];
      const footP: V = [s * 0.03, 0.0015, L.z + L.fz];

      const hip = b.joint(`leg${side}${i}Hip`, { at: hipP, parent: thorax });
      const knee = b.joint(`leg${side}${i}Knee`, { at: kneeP, parent: hip });
      const foot = b.joint(`leg${side}${i}Foot`, { at: footP, parent: knee });

      seg(hipP, kneeP, 0.0014, 0.0012, LEG, hip);
      seg(kneeP, footP, 0.0011, 0.0009, LEG, knee);
      ball(footP, 0.0018, INK, foot);
    });
  }

  return b.root;
}
