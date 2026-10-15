1. **The arms were broken.** The tilted box-frustums for the upper arm and forearm rendered as grey shards. I replaced them with aimed box limbs, so the arms read as chunky pixel blocks with elbow and knee fluff.
2. **The koala wasn't hugging the branch.** The fork limbs ran through the back of the body, and the paws and claws pointed back into empty air. I moved the fork behind the koala (`FORK_Z = -0.2`) so the back rests against it. The arms now reach round to the front face of each limb, with fingers and claws curling around the sides.
3. **The feet floated.** The legs now come up and out to the knee, then back to the lower fork limbs, with toes and claws wrapped around each limb.
4. **The eyes were too small for the face.** I enlarged them and raised the brow ticks to match.

<<<<<<< SEARCH
const FORK_Z = -0.1;
=======
const FORK_Z = -0.2;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tag = (s: number) => (s > 0 ? "L" : "R");
=======
  const tag = (s: number) => (s > 0 ? "L" : "R");
  const limbBox = (bone: Joint, a: V, e: V, w: number, color: any) => {
    const d: V = [e[0] - a[0], e[1] - a[1], e[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    return b.part(new THREE.BoxGeometry(w, len, w), color, {
      bone,
      at: [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2],
      dir: d,
    });
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.14, 0.68, 0.02],
        [s * 0.235, 0.6, 0.1],
        [s * 0.165, 0.63, -0.015],
      ]),
=======
        [s * 0.14, 0.68, 0.02],
        [s * 0.235, 0.6, -0.02],
        [s * 0.168, 0.64, -0.145],
      ]),
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.12, 0.45, 0.0],
        [s * 0.205, 0.5, 0.15],
        [s * 0.135, 0.49, 0.02],
      ]),
=======
        [s * 0.12, 0.45, -0.03],
        [s * 0.21, 0.5, 0.07],
        [s * 0.1, 0.47, -0.15],
      ]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [s * 0.07, 0.868, 0.176],
    });
    // brow tick above each eye
    box(head, [0.036, 0.008, 0.01], [s * 0.07, 0.892, 0.176], "#3a3842");
=======
      at: [s * 0.07, 0.87, 0.176],
    });
    // brow tick above each eye
    box(head, [0.042, 0.008, 0.01], [s * 0.07, 0.903, 0.176], "#3a3842");
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.044, 0.044, 0.012), "#ffffff", {
=======
    b.part(new THREE.BoxGeometry(0.058, 0.058, 0.012), "#ffffff", {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const grip = (bone: Joint, s: number, ys: number[], z: number) => {
    for (const y of ys) {
      const xo = s * (armX(y) + 0.04);
      box(bone, [0.022, 0.024, 0.075], [xo, y, z - 0.035], PAW);
      box(bone, [0.018, 0.02, 0.018], [xo, y, z - 0.085], CLAW);
    }
  };
=======
  const grip = (bone: Joint, s: number, ys: number[], inner: boolean) => {
    for (const y of ys) {
      const xo = s * (armX(y) + (inner ? -0.052 : 0.052));
      const reach = inner ? 0.06 : 0.09;
      box(bone, [0.024, 0.026, reach], [xo, y, -0.15 - reach / 2 + 0.02], PAW);
      box(bone, [0.018, 0.02, 0.02], [xo, y, -0.15 - reach + 0.015], CLAW);
    }
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.frustumBox(arm.joints[0].at, arm.joints[1].at, [0.1, 0.1], [0.085, 0.085], { color: FUR, bone: arm.joints[0] });
    b.frustumBox(arm.joints[1].at, arm.joints[2].at, [0.085, 0.085], [0.07, 0.07], { color: FUR, bone: arm.joints[1] });
    b.frustumBox(leg.joints[0].at, leg.joints[1].at, [0.13, 0.12], [0.095, 0.095], { color: FUR, bone: leg.joints[0] });
    b.frustumBox(leg.joints[1].at, leg.joints[2].at, [0.095, 0.095], [0.075, 0.075], { color: FUR, bone: leg.joints[1] });
    const wrist = arm.joints[2];
    const ankle = leg.joints[2];
    // hand
    box(wrist, [0.1, 0.09, 0.06], [s * 0.165, 0.63, -0.03], PAW);
    grip(wrist, s, [0.6, 0.63, 0.66], -0.03);
    box(wrist, [0.02, 0.025, 0.05], [s * (armX(0.64) - 0.045), 0.645, -0.06], PAW);
    box(wrist, [0.016, 0.02, 0.016], [s * (armX(0.64) - 0.045), 0.645, -0.095], CLAW);
    // foot
    box(ankle, [0.1, 0.06, 0.09], [s * 0.14, 0.49, -0.015], PAW);
    grip(ankle, s, [0.465, 0.49, 0.515], -0.03);
    // elbow and knee fluff
    box(arm.joints[1], [0.07, 0.07, 0.07], [s * 0.235, 0.6, 0.1], FUR_LT);
    box(leg.joints[1], [0.06, 0.06, 0.06], [s * 0.215, 0.5, 0.16], FUR_LT);
=======
    const sh: V = [s * 0.14, 0.68, 0.02];
    const el: V = [s * 0.235, 0.6, -0.02];
    const wr: V = [s * 0.168, 0.64, -0.145];
    const hp: V = [s * 0.12, 0.45, -0.03];
    const kn: V = [s * 0.21, 0.5, 0.07];
    const an: V = [s * 0.1, 0.47, -0.15];
    limbBox(arm.joints[0], sh, el, 0.1, FUR);
    limbBox(arm.joints[1], el, wr, 0.08, FUR);
    limbBox(leg.joints[0], hp, kn, 0.12, FUR);
    limbBox(leg.joints[1], kn, an, 0.09, FUR);
    const wrist = arm.joints[2];
    const ankle = leg.joints[2];
    // elbow, knee fluff
    box(arm.joints[1], [0.075, 0.075, 0.075], el, FUR_LT);
    box(leg.joints[1], [0.085, 0.085, 0.085], kn, FUR_LT);
    // hand: palm on the front of the limb, fingers wrapping round both sides
    box(wrist, [0.09, 0.09, 0.045], [wr[0], wr[1], -0.15], PAW);
    grip(wrist, s, [0.605, 0.64, 0.675], false);
    grip(wrist, s, [0.62, 0.655], true);
    // foot
    box(ankle, [0.09, 0.065, 0.05], [an[0], an[1], -0.15], PAW);
    grip(ankle, s, [0.445, 0.47, 0.495], false);
    grip(ankle, s, [0.455, 0.485], true);
>>>>>>> REPLACE