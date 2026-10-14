import * as THREE from "three";
import { createBuilder, rng, paint, countershade, mottle, catmull, polyline } from "../../../../src/index";

export const meta = {
  name: "hedgehog",
  description: "A stout, round-backed hedgehog with a banded spine coat, a pointed snout, and short legs.",
};

const BROWN = "#7a5333";
const BROWN_DARK = "#4a3020";
const CREAM = "#ebdcbc";
const SPINE_DARK = "#3f2a1d";
const SPINE_BAND = "#e9dcc0";
const HEAD_BROWN = "#5c3e2c";
const SNOUT = "#3a2a22";
const NOSE = "#2b1f1f";
const EYE = "#140d0b";
const EAR = "#6b4a3a";
const LEG = "#3d2c22";

const BODY = countershade(mottle(BROWN, BROWN_DARK, { size: 0.05, seed: 3 }), CREAM, { level: -0.2 });
const HEAD = countershade(HEAD_BROWN, CREAM, { level: -0.2 });
const SPINE = paint((_p, _n, s) => (s[0] > 0.3 && s[0] < 0.62 ? SPINE_BAND : SPINE_DARK));

export default function build() {
  const b = createBuilder({ name: "hedgehog" });

  // Skeleton: a root at the hips, a spine running forward through the neck to the nape.
  const hips = b.joint("hips", { at: [0, 0.078, -0.05] });
  const spine = b.chain("spine", catmull([
    [0, 0.078, -0.05],
    [0, 0.085, 0.01],
    [0, 0.084, 0.07],
  ]), { parent: hips, names: ["spine", "neck", "nape"], role: "spine" });
  const nape = spine.joints[spine.joints.length - 1];

  // Round body: a tube along the spine, fattest in the middle.
  const body = b.sweep(spine, (t: number) => 0.068 + 0.016 * Math.sin(Math.PI * t), { color: BODY });

  // Head: a sphere on a joint, with a tapered snout and a dark nose.
  const head = b.joint("head", { parent: nape, at: [0, 0.092, 0.1], aim: [0, 0.078, 0.22], role: "head" });
  const skull = b.part(new THREE.SphereGeometry(0.066, 10, 8), HEAD, {
    bone: head,
    at: head.local({ forward: 0.012, up: 0.008 }),
  });
  b.sweep(
    [head.local({ forward: 0.05, up: -0.02 }), head.local({ forward: 0.15, up: -0.035 })],
    [0.036, 0.018],
    { bone: head, color: SNOUT },
  );
  b.part(new THREE.SphereGeometry(0.02, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.162, up: -0.03 }),
  });

  // Eyes and ears seated on the skull surface.
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.013, 8, 6), EYE,
      skin.nearest(head.local({ left: s * 0.04, up: 0.02, forward: 0.06 })), { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.016, 6, 4).scale(1, 1, 0.4), EAR,
      skin.nearest(head.local({ left: s * 0.05, up: 0.05, forward: -0.02 })), { embed: 0.45 });
  }

  // Short legs: a hind pair off the hips and a front pair off the neck.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    const hind = b.chain(`legHind${L}`, polyline([
      [s * 0.05, 0.075, -0.05],
      [s * 0.07, 0.04, -0.04],
      [s * 0.06, 0.024, -0.02],
    ]), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
    b.sweep(hind, 0.019, { color: LEG });
    const hindFoot = hind.joints[hind.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.026, 8, 6), LEG, { bone: hindFoot, at: hindFoot.at });

    const front = b.chain(`legFront${L}`, polyline([
      [s * 0.05, 0.075, 0.04],
      [s * 0.07, 0.04, 0.05],
      [s * 0.065, 0.024, 0.07],
    ]), { parent: spine.joints[1], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "leg" });
    b.sweep(front, 0.019, { color: LEG });
    const frontPaw = front.joints[front.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.026, 8, 6), LEG, { bone: frontPaw, at: frontPaw.at });
  }

  // Spines: tapered, banded cones scattered over the back and flanks, fanning backwards.
  const lengths = rng(19);
  const placement = rng(7);
  const bodySkin = b.surface(body);
  const hits = bodySkin.scatter(300, {
    rng: placement,
    minDist: 0.02,
    filter: (h) => h.n.y > -0.3 && h.at.y > 0.05 && h.at.z < 0.075 && h.at.z > -0.14,
  });
  for (const h of hits) {
    const dir = new THREE.Vector3(h.n.x, h.n.y, h.n.z).add(new THREE.Vector3(0, 0, -0.6)).normalize();
    b.spike(h, dir, 0.045 + lengths() * 0.03, 0.0095, { color: SPINE, sides: 6 });
  }

  return b.root;
}
