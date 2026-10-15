1. **Arms read as angular dark shards.** The box-section sweeps over the arm and leg chains twist and fold into wedges, so the koala looks winged. I replaced them with tapered box limbs (`frustumBox`) between the joints, which fits the blocky pixel look and still rides the bones.
2. **The fork reads as antlers.** The koala sat between two splayed arms of the Y with its hands far from the wood. I made the fork taller (limbs reach y ≈ 1.15) and narrower at the top (±0.42 m). The limbs now run just beside the torso, and the hands and elbows are pulled in so the koala visibly clasps them.
3. **Leaf cards cover the face and are oversized.** Twigs could throw leaves forward across the head. I limited their forward lean and shrank the cards so the foliage sits above and beside the head and the face stays clear.
4. **The face is small for the style.** I enlarged the eye pixels a little so they read as the focal point.

<<<<<<< SEARCH
const SLOPE = 0.46 / 0.65;
const armX = (y: number) => SLOPE * (y - 0.3);
const armPt = (s: number, t: number): V => [s * 0.46 * t, 0.3 + 0.65 * t, FORK_Z];
const ARM_ANGLE = (Math.atan2(0.46, 0.65) * 180) / Math.PI;
=======
const FORK_X = 0.42;
const FORK_H = 0.85;
const SLOPE = FORK_X / FORK_H;
const armX = (y: number) => SLOPE * (y - 0.3);
const armPt = (s: number, t: number): V => [s * FORK_X * t, 0.3 + FORK_H * t, FORK_Z];
const ARM_ANGLE = (Math.atan2(FORK_X, FORK_H) * 180) / Math.PI;
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.27, 0.6, 0.1],
        [s * 0.235, 0.63, -0.015],
=======
        [s * 0.235, 0.6, 0.1],
        [s * 0.165, 0.63, -0.015],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(arm, [0.052, 0.04], { section: "box", caps: "flat", color: FUR });
    b.sweep(leg, [0.07, 0.055, 0.042], { section: "box", caps: "flat", color: FUR });
=======
    b.frustumBox(arm.joints[0].at, arm.joints[1].at, [0.1, 0.1], [0.085, 0.085], { color: FUR, bone: arm.joints[0] });
    b.frustumBox(arm.joints[1].at, arm.joints[2].at, [0.085, 0.085], [0.07, 0.07], { color: FUR, bone: arm.joints[1] });
    b.frustumBox(leg.joints[0].at, leg.joints[1].at, [0.13, 0.12], [0.095, 0.095], { color: FUR, bone: leg.joints[0] });
    b.frustumBox(leg.joints[1].at, leg.joints[2].at, [0.095, 0.095], [0.075, 0.075], { color: FUR, bone: leg.joints[1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(wrist, [0.1, 0.09, 0.06], [s * 0.234, 0.63, -0.03], PAW);
=======
    box(wrist, [0.1, 0.09, 0.06], [s * 0.165, 0.63, -0.03], PAW);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(arm.joints[1], [0.06, 0.06, 0.06], [s * 0.285, 0.6, 0.1], FUR_LT);
=======
    box(arm.joints[1], [0.07, 0.07, 0.07], [s * 0.235, 0.6, 0.1], FUR_LT);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const d = norm([s * (0.5 + R() * 0.4), 0.6 + R() * 0.3, -0.3 + R() * 1.1]);
=======
      const d = norm([s * (0.5 + R() * 0.4), 0.6 + R() * 0.3, -0.5 + R() * 0.7]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.08, 0.18],
=======
    size: [0.06, 0.14],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.034, 0.034, 0.012), "#ffffff", {
=======
    b.part(new THREE.BoxGeometry(0.044, 0.044, 0.012), "#ffffff", {
>>>>>>> REPLACE