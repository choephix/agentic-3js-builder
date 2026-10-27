Cause: `nearestJoint()` is nullable, so it cannot be passed as a parent/bone; the rotor blade’s `extrude` call also needs explicitly typed direction tuples.

```diff
<<<<<<< SEARCH
          parent: spine.nearestJoint(root),
=======
          parent: spine.joints[Math.min(i, spine.joints.length - 1)],
>>>>>>> REPLACE

<<<<<<< SEARCH
          { 
          color: TUBE,
=======
          {
          color: TUBE,
>>>>>>> REPLACE

<<<<<<< SEARCH
        { bone: spine.nearestJoint([0, 1.05, z]), group: "body" },
=======
        { bone: hips, group: "body" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: spine.nearestJoint([0, 1.05, z]), group: "mechanism" },
=======
      { bone: hips, group: "mechanism" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: spine.nearestJoint([0, 1.05, za]), group: "mechanism" },
=======
      { bone: hips, group: "mechanism" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: spine.nearestJoint([0, 1.05, za]), group: "mechanism" },
=======
      { bone: hips, group: "mechanism" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    const radial: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const tangent: [number, number, number] = [
      -Math.sin(a),
      Math.cos(a),
      0,
    ];
=======
    const radial: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const tangent: [number, number, number] = [
      -Math.sin(a),
      Math.cos(a),
      0,
    ];
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: spine.nearestJoint([0, 1.05, z]),
=======
        bone: hips,
>>>>>>> REPLACE
```