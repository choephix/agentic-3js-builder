import * as THREE from "three";
import { createBuilder, polyline, spiral } from "../../../../src/index";

export const meta = {
  name: "Clockwork Dog",
  description:
    "A tin wind-up toy dog with brass legs, visible gears, a butterfly winding key, a coiled spring tail and a hinged jaw.",
};

const RED = "#c23b2a";
const TRIM = "#e2b04a";
const BRASS = "#c8963e";
const DARK_BRASS = "#8f6a2a";
const STEEL = "#9aa3a8";
const BLACK = "#22201f";
const CREAM = "#f1e6cc";
const BELLY = "#e8c35a";

function gear(r: number, teeth: number, depth: number, hole: number) {
  const shape = new THREE.Shape();
  const rin = r * 0.82;
  const step = (Math.PI * 2) / teeth;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < teeth; i++) {
    for (const [f, rad] of [[0, rin], [0.2, r], [0.5, r], [0.7, rin]] as const) {
      const a = (i + f) * step;
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
  }
  pts.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  const h = new THREE.Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  shape.holes.push(h);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -depth / 2);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "clockworkDog" });

  // ---- skeleton ----
  b.joint("root", { at: [0, 0.19, 0] });
  const spine = b.chain(
    "spine",
    [[0, 0.19, -0.14], [0, 0.19, 0], [0, 0.2, 0.14]],
    { role: "spine", parent: "root" },
  );
  const neck = b.chain("neck", [[0, 0.21, 0.12], [0, 0.27, 0.18]], { role: "neck", parent: "spine2" });
  const head = b.joint("head", { parent: neck, at: [0, 0.27, 0.18], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.272, 0.28], dir: [0, 0, 1], role: "jaw" });

  // ---- body ----
  b.sweep(spine, {
    radius: (t: number) => [0.058 + 0.006 * t, 0.062 + 0.006 * t],
    color: RED,
    section: "box",
    caps: "flat",
    bands: [[0.3, RED], [0.35, TRIM], [0.65, RED], [0.7, TRIM], [1, RED]],
    name: "body",
  });
  b.part(new THREE.BoxGeometry(0.09, 0.01, 0.22), BELLY, { at: [0, 0.124, 0], bone: "spine2" });

  // rivets along the sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const z = -0.12 + i * 0.04;
      b.part(new THREE.SphereGeometry(0.005, 5, 4), STEEL, { at: [s * 0.062, 0.145, z], bone: z < 0 ? "spine1" : "spine2" });
    }
  }

  // side gears
  for (const s of [1, -1]) {
    const big = gear(0.036, 12, 0.01, 0.01);
    big.rotateY(Math.PI / 2);
    b.part(big, DARK_BRASS, { at: [s * 0.065, 0.205, -0.02], bone: "spine2" });
    const small = gear(0.021, 8, 0.01, 0.006);
    small.rotateY(Math.PI / 2);
    b.part(small, STEEL, { at: [s * 0.065, 0.2, 0.038], rotation: [20 * s, 0, 0], bone: "spine2" });
    b.part(new THREE.SphereGeometry(0.008, 6, 5), BRASS, { at: [s * 0.072, 0.205, -0.02], bone: "spine2" });
  }
  // top gear
  const topGear = gear(0.03, 10, 0.008, 0.008);
  topGear.rotateX(-Math.PI / 2);
  b.part(topGear, BRASS, { at: [0, 0.257, 0.07], bone: "spine2" });

  // ---- winding key ----
  const key = b.joint("key", { parent: "spine2", at: [0, 0.255, -0.04], dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 6), STEEL, { at: [0, 0.268, -0.04], bone: key });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 8), BRASS, { at: [0, 0.263, -0.04], bone: key });
  b.extrude(
    [[-0.012, 0], [0.012, 0], [0.014, 0.02], [0.045, 0.05], [0.04, 0.07], [0.015, 0.055], [0, 0.045], [-0.015, 0.055], [-0.04, 0.07], [-0.045, 0.05], [-0.014, 0.02]],
    { at: [0, 0.28, -0.04], thickness: 0.008, bevel: 0.002, color: TRIM, bone: key, name: "keyBow" },
  );

  // ---- neck, collar, head ----
  b.capsule([0, 0.21, 0.12], [0, 0.27, 0.18], { radius: 0.032, color: BRASS, sides: 6, bone: "neck1" });
  b.part(new THREE.TorusGeometry(0.036, 0.006, 5, 10), RED, {
    at: [0, 0.24, 0.15], dir: [0, 0.6, 0.6], axis: "z", bone: "neck1",
  });
  b.part(new THREE.SphereGeometry(0.014, 7, 5), TRIM, { at: [0, 0.213, 0.178], bone: "neck1" });

  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.1), RED, { at: [0, 0.31, 0.23], bone: head, name: "skull" });
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.08), BRASS, { at: [0, 0.29, 0.32], bone: head, name: "upperJaw" });
  b.part(new THREE.SphereGeometry(0.015, 7, 5), BLACK, { at: [0, 0.306, 0.362], bone: head });
  b.part(new THREE.BoxGeometry(0.055, 0.016, 0.08), BRASS, { at: [0, 0.268, 0.318], bone: jaw, name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.05), "#b5302a", { at: [0, 0.277, 0.318], bone: jaw });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.005, 0.014, 4), CREAM, { at: [s * 0.022, 0.283, 0.345], bone: jaw });
    // eyes
    b.part(new THREE.SphereGeometry(0.016, 8, 6), CREAM, { at: [s * 0.032, 0.33, 0.272], bone: head });
    b.part(new THREE.SphereGeometry(0.008, 6, 5), BLACK, { at: [s * 0.032, 0.33, 0.286], bone: head });
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.012), TRIM, { at: [s * 0.032, 0.35, 0.28], rotation: [0, 0, -s * 10], bone: head });
    // screw heads on cheeks
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6), STEEL, { at: [s * 0.051, 0.3, 0.2], rotation: [0, 0, 90], bone: head });
  }

  // ears
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${tag}`, { parent: head, at: [s * 0.04, 0.352, 0.21], dir: [s * 0.4, -0.9, 0] });
    b.part(new THREE.BoxGeometry(0.012, 0.075, 0.05), TRIM, {
      at: [s * 0.062, 0.318, 0.21], rotation: [0, 0, s * 20], bone: ear, name: `ear${tag}Plate`,
    });
  }

  // ---- legs ----
  const legMat = BRASS;
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const x = s * 0.045;
    const front = b.chain(
      `legF${tag}`,
      [[x, 0.17, 0.1], [x, 0.1, 0.105], [x, 0.035, 0.1]],
      { role: "leg", parent: "spine2", names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`] },
    );
    b.sweep(front, { radius: [0.024, 0.018, 0.014], color: legMat, sides: 6 });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), STEEL, { at: [x, 0.1, 0.105], bone: front.joints[1] });
    b.part(new THREE.BoxGeometry(0.04, 0.022, 0.065), BLACK, { at: [x, 0.011, 0.115], bone: front.joints[2] });

    const hind = b.chain(
      `legH${tag}`,
      [[x, 0.17, -0.1], [x, 0.1, -0.08], [x, 0.035, -0.105]],
      { role: "leg", parent: "spine1", names: [`hip${tag}`, `knee${tag}`, `hock${tag}`] },
    );
    b.sweep(hind, { radius: [0.028, 0.019, 0.014], color: legMat, sides: 6 });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), STEEL, { at: [x, 0.1, -0.08], bone: hind.joints[1] });
    b.part(new THREE.BoxGeometry(0.04, 0.022, 0.065), BLACK, { at: [x, 0.011, -0.09], bone: hind.joints[2] });
  }

  // ---- spring tail ----
  const lead = polyline([[0, 0.2, -0.13], [0.02, 0.22, -0.17]]);
  const coil = spiral([0, 0.22, -0.17], [0.02, 0.22, -0.17], [0, 0.4, -1], { turns: 3, r1: 0.012, pitch: 0.03 });
  const tailPath = lead.concat(coil);
  const tail = b.chain("tail", tailPath, { role: "tail", parent: "spine1", count: 4 });
  b.sweep(tail, { radius: 0.0065, color: STEEL, sides: 5 });
  b.part(new THREE.SphereGeometry(0.012, 6, 5), TRIM, { at: tailPath.at(1), bone: tail.joints[3] });

  return b.root;
}
