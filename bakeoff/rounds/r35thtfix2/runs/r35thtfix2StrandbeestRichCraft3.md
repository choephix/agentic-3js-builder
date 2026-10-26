Cause: nullable chain tips/joints were passed where the SDK requires definite `JointRef`/points, and the sensor spike overload could not infer a nullable tip.

```ts
<<<<<<< SEARCH
      const hipJoint = chain.joints[0];
      const kneeJoint = chain.joints[1];
      const ankleJoint = chain.joints[2];
      const footJoint = chain.tip;
=======
      const hipJoint = chain.joints[0]!;
      const kneeJoint = chain.joints[1]!;
      const ankleJoint = chain.joints[2]!;
      const footJoint = chain.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: ankleJoint,
=======
      bone: ankleJoint!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: footJoint,
=======
      bone: footJoint!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      mast.tip.at,
=======
      mastTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    mast.tip.at,
=======
    mastTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rotorAt = mast.tip.at.clone();
=======
  const rotorAt = mastTip.at.clone();
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike(sensorL.tip, sensorL.tip, 0.12, 0.025, {
=======
  b.spike(sensorL.tip!, sensorL.tip!, 0.12, 0.025, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike(sensorR.tip, sensorR.tip, 0.12, 0.025, {
=======
  b.spike(sensorR.tip!, sensorR.tip!, 0.12, 0.025, {
>>>>>>> REPLACE
```