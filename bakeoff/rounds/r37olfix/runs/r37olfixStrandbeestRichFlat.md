```ts
// Cause: nullable `chain.tip`/`spine.tip` values were passed as points or JointRefs; use the final guaranteed joint from each chain instead.

<<<<<<< SEARCH
      const ankle = chain.tip;
=======
      const ankle = chain.joints[chain.joints.length - 1];
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.rod(
        ankle,
        [side * 0.82, 0.105, station.z + forward + 0.025],
        0.042,
        { color: STEEL, sides: 6, caps: "flat", group: "feet" },
      );
=======
      b.rod(
        ankle,
        [side * 0.82, 0.105, station.z + forward + 0.025],
        0.042,
        { color: STEEL, sides: 6, caps: "flat", group: "feet" },
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: ankle,
=======
        bone: ankle,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: ankle,
=======
        bone: ankle,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0, 1.84, z],
      bone: spine.nearestJoint([0, 1.2, z]),
=======
      [0, 1.84, z],
      bone: spine.nearestJoint([0, 1.2, z]),
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: spine.tip,
=======
        bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE
```