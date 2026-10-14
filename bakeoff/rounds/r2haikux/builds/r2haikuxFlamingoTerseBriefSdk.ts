import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "A standing flamingo in a rest pose: S-curved neck, two-part bill with black tips, coral wing coverts, black flight feathers and webbed feet.",
};

const BODY = "#f7a1bf";
const NECK = "#fdcadb";
const COVERT = "#ff6b8e";
const COVERT_DEEP = "#e5427a";
const LEG = "#f0708a";
const BILL = "#ffc0d2";
const BLACK = "#1d1a22";
const EYE = "#fff19c";

// One flat webbed foot lying on the floor, toes pointing +Z.
function webFoot(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0.02);
  s.lineTo(0.035, -0.02);
  s.lineTo(0.075, -0.11);
  s.lineTo(0.045, -0.085);
  s.lineTo(0, -0.135);
  s.lineTo(-0.045, -0.085);
  s.lineTo(-0.075, -0.11);
  s.lineTo(-0.035, -0.02);
  s.closePath();
  return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2);
}

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  type Joint = ReturnType<typeof b.joint>;
  type Pt = number[] | Joint;

  // Ellipsoid pinned to a bone: a unit sphere scaled to the radii, centred on `at`.
  const blob = (bone: Joint, at: Pt, radii: number[], color: string) => {
    const g = new THREE.SphereGeometry(1, 16, 12).scale(radii[0], radii[1], radii[2]);
    b.part(g, color, { at, bone });
  };

  // Bending tube through points, pinned to one bone. Geometry is relative to its first point.
  const tubeOn = (bone: Joint, pts: number[][], r: number, color: string) => {
    const o = pts[0];
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(p[0] - o[0], p[1] - o[1], p[2] - o[2])),
    );
    b.part(new THREE.TubeGeometry(curve, 16, r, 8, false), color, { at: o, bone });
  };

  // ---- skeleton: body, tail, neck, head, bill ----
  const hips = b.joint("hips", { at: [0, 0.8, -0.02] });
  const tail1 = b.joint("tail1", { at: [0, 0.86, -0.19], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.875, -0.3], parent: tail1 });

  const n1 = b.joint("neck1", { at: [0, 0.93, 0.12], parent: hips });
  const n2 = b.joint("neck2", { at: [0, 1.04, 0.28], parent: n1 });
  const n3 = b.joint("neck3", { at: [0, 1.16, 0.17], parent: n2 });
  const n4 = b.joint("neck4", { at: [0, 1.25, 0.22], parent: n3 });
  const head = b.joint("head", { at: [0, 1.31, 0.28], parent: n4 });
  const jaw = b.joint("jaw", { at: [0, 1.31, 0.34], parent: head });
  const jawTip = b.joint("jawTip", { at: [0, 1.262, 0.46], parent: jaw });

  // ---- legs and wings (+X is the bird's left) ----
  for (const [tag, s] of [["L", 1], ["R", -1]] as const) {
    const x = (v: number) => s * v;

    // Leg: thigh hidden in the belly, knee bulges forward, hock bends back, foot forward.
    const hip = b.joint(`hip${tag}`, { at: [x(0.085), 0.76, -0.02], parent: hips });
    const knee = b.joint(`knee${tag}`, { at: [x(0.09), 0.56, 0.08], parent: hip });
    const ankle = b.joint(`ankle${tag}`, { at: [x(0.09), 0.3, -0.05], parent: knee });
    const toe = b.joint(`toe${tag}`, { at: [x(0.09), 0.016, 0.04], parent: ankle });

    b.sweep([hip, knee], 0.046, { color: BODY });
    b.sweep([knee, ankle], 0.02, { color: LEG });
    b.sweep([ankle, toe], 0.017, { color: LEG });
    blob(knee, knee, [0.044, 0.044, 0.044], BODY);
    blob(ankle, ankle, [0.021, 0.021, 0.021], LEG);
    blob(toe, toe, [0.018, 0.018, 0.018], LEG);
    b.part(webFoot(), LEG, { at: [x(0.09), 0.004, 0.04], bone: toe });

    // Wing folded along the flank: coral coverts, black flight feathers at the tip.
    const shoulder = b.joint(`shoulder${tag}`, { at: [x(0.1), 0.91, 0.07], parent: hips });
    const wrist = b.joint(`wrist${tag}`, { at: [x(0.125), 0.83, -0.13], parent: shoulder });
    const tip = b.joint(`tip${tag}`, { at: [x(0.12), 0.78, -0.36], parent: wrist });

    b.sweep([shoulder, wrist], 0.05, { color: COVERT });
    b.sweep([wrist, tip], 0.034, { color: COVERT_DEEP });
    blob(wrist, wrist, [0.036, 0.036, 0.036], COVERT_DEEP);
    blob(shoulder, [x(0.118), 0.865, -0.03], [0.042, 0.022, 0.1], COVERT_DEEP);
    blob(wrist, [x(0.124), 0.818, -0.19], [0.036, 0.011, 0.085], BLACK);
    blob(tip, [x(0.12), 0.8, -0.27], [0.034, 0.011, 0.09], BLACK);
    blob(tip, [x(0.116), 0.786, -0.33], [0.03, 0.01, 0.07], BLACK);
  }

  // ---- body: pale rose barrel, chest bulge, shingled coral back ----
  blob(hips, [0, 0.82, -0.03], [0.135, 0.13, 0.225], BODY);
  blob(hips, [0, 0.88, 0.11], [0.13, 0.14, 0.14], BODY);
  blob(hips, [0, 0.935, 0.05], [0.11, 0.04, 0.12], COVERT);
  blob(hips, [0, 0.925, -0.08], [0.12, 0.038, 0.12], COVERT);
  blob(hips, [0, 0.9, -0.17], [0.1, 0.033, 0.09], COVERT_DEEP);

  // Short fluffy tail, two tufts on the tail joints.
  blob(tail1, [0, 0.86, -0.2], [0.075, 0.05, 0.07], COVERT);
  blob(tail2, [0, 0.87, -0.3], [0.05, 0.03, 0.05], COVERT_DEEP);

  // ---- neck: tapering S-curve, one bone per segment with knuckles ----
  b.sweep([n1, n2], 0.056, { color: NECK });
  b.sweep([n2, n3], 0.05, { color: NECK });
  b.sweep([n3, n4], 0.046, { color: NECK });
  b.sweep([n4, head], 0.042, { color: NECK });
  blob(n2, n2, [0.053, 0.053, 0.053], NECK);
  blob(n3, n3, [0.048, 0.048, 0.048], NECK);
  blob(n4, n4, [0.044, 0.044, 0.044], NECK);

  // ---- head and eyes ----
  blob(head, [0, 1.33, 0.3], [0.068, 0.066, 0.1], NECK);
  for (const s of [1, -1]) {
    blob(head, [s * 0.062, 1.345, 0.3], [0.013, 0.013, 0.013], EYE);
    blob(head, [s * 0.072, 1.35, 0.31], [0.0065, 0.0065, 0.0065], BLACK);
  }

  // ---- bill: upper mandible on the head, lower on the jaw, both hooked with black tips ----
  tubeOn(head, [[0, 1.336, 0.34], [0, 1.327, 0.44]], 0.03, BILL);
  tubeOn(head, [[0, 1.327, 0.44], [0, 1.29, 0.5], [0, 1.225, 0.48]], 0.026, BLACK);
  blob(head, [0, 1.225, 0.48], [0.024, 0.024, 0.024], BLACK);

  tubeOn(jaw, [[0, 1.31, 0.34], [0, 1.287, 0.4]], 0.022, BILL);
  tubeOn(jaw, [[0, 1.287, 0.4], [0, 1.262, 0.46]], 0.023, BLACK);
  blob(jaw, jawTip, [0.023, 0.023, 0.023], BLACK);

  return b.root;
}
