Cause: nullable chain tips were passed as joint refs, `ExtrudeOptions` has no `rotation`, and several helper calls used the SDK argument order incorrectly (`part`/`rod`).

```text
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armL.tip,
=======
      bone: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armR.tip,
=======
      bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    rotation?: Rot,
  ) =>
=======
    _rotation?: Rot,
  ) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
        color,
        rotation,
      }),
=======
        color,
      }),
>>>>>>> REPLACE

<<<<<<< SEARCH
    new THREE.CylinderGeometry(0.050, 0.050, 0.044, 8),
    BRASS,
    [-0.29, 1.268, 0.56],
    hammerBone,
=======
    new THREE.CylinderGeometry(0.050, 0.050, 0.044, 8),
    [-0.29, 1.268, 0.56],
    BRASS,
    hammerBone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    new THREE.CylinderGeometry(0.055, 0.055, 0.010, 8),
    GOLD,
    [-0.29, 1.294, 0.56],
    hammerBone,
=======
    new THREE.CylinderGeometry(0.055, 0.055, 0.010, 8),
    [-0.29, 1.294, 0.56],
    GOLD,
    hammerBone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    new THREE.CylinderGeometry(0.053, 0.053, 0.010, 8),
    BRASS_LIGHT,
    [-0.29, 1.242, 0.56],
    hammerBone,
=======
    new THREE.CylinderGeometry(0.053, 0.053, 0.010, 8),
    [-0.29, 1.242, 0.56],
    BRASS_LIGHT,
    hammerBone,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod(
    "buckleHammerHandleA",
    [-0.038, 1.040, 0.354],
    [0.038, 1.100, 0.354],
    0.006,
    GOLD,
    chestBone,
  );
=======
  b.rod(
    [-0.038, 1.040, 0.354],
    [0.038, 1.100, 0.354],
    0.006,
    GOLD,
    { name: "buckleHammerHandleA", bone: chestBone },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod(
    "buckleHammerHandleB",
    [-0.038, 1.100, 0.354],
    [0.038, 1.040, 0.354],
    0.006,
    GOLD,
    chestBone,
  );
=======
  b.rod(
    [-0.038, 1.100, 0.354],
    [0.038, 1.040, 0.354],
    0.006,
    GOLD,
    { name: "buckleHammerHandleB", bone: chestBone },
  );
>>>>>>> REPLACE
```