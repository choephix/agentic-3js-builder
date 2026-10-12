import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description: "A hedgehog at rest: a round body under banded quills, a pale face, a black nose and bead eyes.",
};

const BROWN = "#7b5638";
const BROWN_DARK = "#4a3424";
const DARK = "#2b1e17";
const CREAM = "#eee3cb";
const LEG = "#5b4130";
const PINK = "#d99a8c";
const EAR = "#4f3a2d";
const BLACK = "#120e0c";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "hedgehog", paintSize: 2048 });

  // Skeleton: hips at the rump, a spine running forward through the neck to the head,
  // and a separate lower jaw under the snout.
  const hips = b.joint("hips", { at: [0, 0.086, -0.06], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.086, -0.035],
      [0, 0.09, 0.02],
      [0, 0.095, 0.07],
      [0, 0.099, 0.105],
    ]),
    { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" },
  );
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 0.099, 0.105], aim: [0, 0.085, 0.18], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.076, 0.118], aim: [0, 0.064, 0.18], role: "jaw" });

  // Body and head: one loft, dark mottled back, cream face and belly.
  const coatSkin = mottle(BROWN, BROWN_DARK, { size: 0.04, contrast: 0.5, seed: 4 });
  const coat = paint((p, n) => (p.z > 0.13 || n.y < -0.3 ? CREAM : coatSkin));

  const body = b.loft(
    [
      { at: [0, 0.082, -0.078], w: 0.07, h: 0.07 },
      { at: [0, 0.084, -0.045], w: 0.105, h: 0.1 },
      { at: [0, 0.088, -0.005], w: 0.12, h: 0.1 },
      { at: [0, 0.09, 0.035], w: 0.12, h: 0.1 },
      { at: [0, 0.094, 0.07], w: 0.1, h: 0.094 },
      { at: [0, 0.098, 0.098], w: 0.082, h: 0.08 },
      { at: [0, 0.098, 0.12], w: 0.078, h: 0.076 },
      { at: [0, 0.094, 0.14], w: 0.068, h: 0.066 },
      { at: [0, 0.089, 0.16], w: 0.044, h: 0.042 },
    ],
    { bone: [hips, spine, head], color: coat, detail: 1.25 },
  );
  const shell = b.surface(body);

  // Places kept clear of quills so the face and ears read.
  const avoid: THREE.Vector3[] = [];

  // Bead eyes with a small glint each.
  for (const s of [1, -1]) {
    const spot = new THREE.Vector3(s * 0.045, 0.1, 0.13);
    avoid.push(spot);
    const eye = shell.nearest(spot);
    b.stick(new THREE.SphereGeometry(0.0085, 10, 8), BLACK, eye, { embed: 0.3, group: "face" });
    b.stick(new THREE.SphereGeometry(0.0027, 6, 4), WHITE, eye.moved([0, 0.0072, 0.0035]), {
      embed: 0,
      group: "face",
    });
  }

  // Flattened black nose pad on the tip of the snout.
  const nose = shell.nearest(new THREE.Vector3(0, 0.089, 0.2));
  b.stick(new THREE.SphereGeometry(0.011, 10, 8).scale(1.25, 0.6, 1), BLACK, nose, { embed: 0.3, group: "face" });

  // Small rounded ears on the sides of the head, each with a pink inner dome.
  for (const s of [1, -1]) {
    const spot = new THREE.Vector3(s * 0.045, 0.1, 0.09);
    avoid.push(spot);
    const ear = shell.nearest(new THREE.Vector3(s * 0.05, 0.1, 0.09));
    b.stick(new THREE.SphereGeometry(0.011, 10, 6).scale(1, 0.55, 1), EAR, ear, { embed: 0.35, group: "face" });
    b.stick(new THREE.SphereGeometry(0.0065, 8, 5).scale(1, 0.4, 1), PINK, ear.moved([0, 0.0045, 0]), {
      embed: 0,
      group: "face",
    });
  }

  // Quills: banded cream and dark spikes fanned back over the top and sides.
  const quillA = paint((_p, _n, s) => (s[0] < 0.28 ? DARK : s[0] < 0.6 ? CREAM : s[0] < 0.8 ? DARK : CREAM));
  const quillB = paint((_p, _n, s) => (s[0] < 0.22 ? BROWN_DARK : s[0] < 0.5 ? BROWN : s[0] < 0.74 ? CREAM : BROWN_DARK));

  const quills = shell.scatter(440, {
    rng: rng(11),
    minDist: 0.0105,
    filter: (h) => h.n.y > -0.3 && h.at.z < 0.122 && avoid.every((p) => h.at.distanceTo(p) > 0.026),
  });
  const pick = rng(23);
  const backward = new THREE.Vector3(0, 0.15, -1).normalize();
  for (const h of quills) {
    const dir = h.n.clone().addScaledVector(backward, 0.6 + 0.6 * pick()).normalize();
    const len = 0.024 + 0.012 * pick();
    const r = 0.0042 + 0.0018 * pick();
    b.spike(h, dir, len, r, { color: pick() < 0.6 ? quillA : quillB, sides: 6, group: "quills" });
  }

  // A few stiff bristles fanning forward from the sides of the snout.
  for (const s of [1, -1]) {
    for (const y of [0.083, 0.091]) {
      const hit = shell.nearest(new THREE.Vector3(s * 0.034, y, 0.158));
      const out = hit.n.clone().addScaledVector(new THREE.Vector3(0, 0, 1), 0.9).normalize();
      b.spike(hit, out, 0.016, 0.0011, { color: DARK, sides: 4, group: "face" });
    }
  }

  // Short legs with four little toes on each foot.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Forelegs: elbow bends back, feet sit under the chest.
    const foreFoot = [s * 0.05, 0.009, 0.065];
    const fore = limb([s * 0.045, 0.066, 0.05], foreFoot, [0.036, 0.032], [[0, 0, -1]]);
    const foreLeg = b.chain(`foreLeg${side}`, fore, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
      role: "leg",
    });
    const paw = foreLeg.joints[2];
    b.sweep(foreLeg, (t) => 0.0145 - 0.0045 * t, { color: LEG, group: "legs" });
    b.part(new THREE.SphereGeometry(0.014, 10, 6).scale(1, 0.65, 1.4), PINK, { at: foreFoot, bone: paw });
    for (const dx of [-0.0075, -0.0025, 0.0025, 0.0075]) {
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), PINK, { at: [s * 0.05 + dx, 0.0042, 0.082], bone: paw });
    }

    // Hind legs: knee bends forward, feet tucked under the rump.
    const hindFoot = [s * 0.05, 0.009, -0.04];
    const hind = limb([s * 0.045, 0.066, -0.06], hindFoot, [0.036, 0.032], [[0, 0, 1]]);
    const hindLeg = b.chain(`hindLeg${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const ankle = hindLeg.joints[2];
    b.sweep(hindLeg, (t) => 0.0145 - 0.0045 * t, { color: LEG, group: "legs" });
    b.part(new THREE.SphereGeometry(0.014, 10, 6).scale(1, 0.65, 1.4), PINK, { at: hindFoot, bone: ankle });
    for (const dx of [-0.0075, -0.0025, 0.0025, 0.0075]) {
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), PINK, { at: [s * 0.05 + dx, 0.0042, -0.023], bone: ankle });
    }
  }

  // Lower jaw: a small cream chin hung from the jaw joint under the nose.
  b.capsule(jaw, [0, 0.058, 0.165], [0.0105, 0.0065], { color: CREAM, group: "face" });

  return b.root;
}
