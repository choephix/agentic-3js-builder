Cause: `spine.tip` and the leg-chain `.tip` are nullable; these chains end at their final named joint, so use the last joint explicitly.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  lowSphere(0.035, YELLOW, legL.tip.at, legL.tip.bone, [1.2, 0.65, 1.15]);
  lowSphere(0.035, YELLOW, legR.tip.at, legR.tip.bone, [1.2, 0.65, 1.15]);
=======
  const ankleL = legL.joints[legL.joints.length - 1];
  const ankleR = legR.joints[legR.joints.length - 1];

  lowSphere(0.035, YELLOW, ankleL.at, ankleL, [1.2, 0.65, 1.15]);
  lowSphere(0.035, YELLOW, ankleR.at, ankleR, [1.2, 0.65, 1.15]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  toe(0.14, 0.035, 0.075, 0.055, legL.tip);
  toe(0.14, 0.035, 0.025, 0.105, legL.tip);
  toe(0.14, 0.035, -0.055, 0.06, legL.tip);

  toe(-0.14, 0.035, -0.075, 0.055, legR.tip);
  toe(-0.14, 0.035, -0.025, 0.105, legR.tip);
  toe(-0.14, 0.035, 0.055, 0.06, legR.tip);
=======
  toe(0.14, 0.035, 0.075, 0.055, ankleL);
  toe(0.14, 0.035, 0.025, 0.105, ankleL);
  toe(0.14, 0.035, -0.055, 0.06, ankleL);

  toe(-0.14, 0.035, -0.075, 0.055, ankleR);
  toe(-0.14, 0.035, -0.025, 0.105, ankleR);
  toe(-0.14, 0.035, 0.055, 0.06, ankleR);
>>>>>>> REPLACE
```