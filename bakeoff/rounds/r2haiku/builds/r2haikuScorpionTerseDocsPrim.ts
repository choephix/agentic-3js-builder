import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, countershade, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "scorpion",
  description:
    "A stylised scorpion: a blocky segmented shell, a raised metasoma ending in a stinger, pincer pedipalps and eight jointed walking legs.",
};

const SHELL = "#4a2e1c";
const SHELL_LT = "#7d5030";
const BELLY = "#b48d5e";
const LEG = "#3a2619";
const CLAW = "#6e4a2c";
const TAIL = "#6b4128";
const TAIL_D = "#3f2718";
const STING = "#a8361f";
const STING_TIP = "#1f1612";
const EYE = "#e9a23b";
const PUPIL = "#120c08";
const GRAN = "#2a1a10";

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // Skeleton: the body hub sits in the middle of the mesosoma.
  const hips = b.joint("hips", { at: [0, 0.066, -0.03], role: "spine" });

  // Shell paints: a mottled dark carapace over a paler belly, and banded tergites on the abdomen.
  const carapace = countershade(mottle(SHELL, SHELL_LT, { size: 0.05 }), BELLY, { level: -0.25 });
  const tergites = countershade(stripes(SHELL, SHELL_LT, { size: 0.03 }), BELLY, { level: -0.25 });

  const blob = (center: number[], scale: number[], color: any) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { bone: hips, at: center, scale });

  // Body: a broad prosoma (head shield), a banded mesosoma, and a narrow waist.
  const prosoma = blob([0, 0.072, 0.08], [0.05, 0.03, 0.058], carapace);
  const meso = blob([0, 0.066, -0.03], [0.06, 0.036, 0.05], tergites);
  blob([0, 0.064, -0.085], [0.03, 0.025, 0.02], tergites);

  // Metasoma: the raised, curled tail, ending in a dark stinger.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.07, -0.085],
      [0, 0.1, -0.13],
      [0, 0.165, -0.165],
      [0, 0.228, -0.14],
      [0, 0.258, -0.06],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.026 - 0.012 * t, {
    color: TAIL,
    bands: [
      [0.45, TAIL],
      [0.8, TAIL_D],
      [1, STING],
    ],
  });
  const tip = tail.at(1);
  b.spike(tip, tip, 0.05, 0.012, { color: STING_TIP });

  // Eight walking legs: four pairs, each a three-segment limb planted on the ground, knees raised.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    [0.06, 0.02, -0.02, -0.06].forEach((z, i) => {
      const n = i + 1;
      const root = [s * 0.045, 0.07, z];
      const foot = [s * 0.14, 0.012, z - 0.025];
      const pts = limb(root, foot, [0.075, 0.08, 0.065], [
        [0, 1, 0],
        [0, 1, 0],
      ]);
      const leg = b.chain(`leg${S}${n}`, pts, {
        parent: hips,
        names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`, `foot${S}${n}`],
        role: "leg",
      });
      b.sweep(leg, [0.013, 0.007], { color: LEG });
    });
  }

  // Pedipalps: raised pincers reaching forward, each with a fixed finger and a pinching moving finger.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.035, 0.075, 0.11],
        [s * 0.085, 0.078, 0.15],
        [s * 0.072, 0.075, 0.245],
      ]),
      { parent: hips, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, [0.014, 0.012], { color: CLAW });

    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), CLAW, {
      bone: hand,
      at: [s * 0.074, 0.075, 0.25],
      scale: [0.03, 0.024, 0.04],
    });

    // Fixed finger, bent gently inward at the tip.
    b.sweep(
      bezier([s * 0.09, 0.075, 0.26], [s * 0.095, 0.079, 0.3], [s * 0.076, 0.074, 0.345]),
      [0.011, 0.004],
      { bone: hand, color: CLAW },
    );

    // Moving finger: its own joint, so it can be posed open or closed.
    const claw = b.joint(`claw${S}`, {
      parent: hand,
      at: [s * 0.058, 0.075, 0.26],
      aim: [s * 0.07, 0.074, 0.345],
      role: "digit",
    });
    b.sweep(
      bezier([s * 0.058, 0.075, 0.26], [s * 0.06, 0.079, 0.3], [s * 0.071, 0.074, 0.345]),
      [0.011, 0.004],
      { bone: claw, color: CLAW },
    );
  }

  // Eyes: amber lateral eyes with black pupils, seated on the front of the prosoma.
  const shieldSurface = b.surface([prosoma]);
  for (const s of [1, -1]) {
    const eyeHit = shieldSurface.nearest([s * 0.03, 0.099, 0.115]);
    b.stick(new THREE.SphereGeometry(0.012, 8, 6), EYE, eyeHit, { embed: 0.3 });
    const pupilHit = shieldSurface.nearest([s * 0.032, 0.102, 0.125]);
    b.stick(new THREE.SphereGeometry(0.006, 6, 5), PUPIL, pupilHit, { embed: 0.3 });
  }

  // Granules: small raised bumps scattered over the shell for surface texture.
  const shell = b.surface([prosoma, meso]);
  for (const h of shell.scatter(60, { rng: rng(11), minDist: 0.014, filter: (h) => h.n.y > -0.3 })) {
    b.stick(new THREE.ConeGeometry(0.0045, 0.01, 5), GRAN, h, { embed: 0.3 });
  }

  return b.root;
}
