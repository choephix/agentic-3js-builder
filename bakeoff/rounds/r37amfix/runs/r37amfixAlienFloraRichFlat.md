Cause: `V3` was declared as a type but instantiated at runtime; the sweep options used unsupported overload fields, and the extrude outline was typed as requiring `"sharp"` on every corner.

```ts
<<<<<<< SEARCH
    flat: true,
  });
=======
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    let sideVec = new V3(0, 1, 0).cross(dir);
    if (sideVec.lengthSq() < 0.02) sideVec = new V3(1, 0, 0).cross(dir);
=======
    let sideVec = new THREE.Vector3(0, 1, 0).cross(dir);
    if (sideVec.lengthSq() < 0.02) sideVec = new THREE.Vector3(1, 0, 0).cross(dir);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, 0],
    [0.055, 0.02],
    [0.11, 0.18],
    [0.055, 0.31, "sharp"],
    [0, 0.22],
    [-0.055, 0.31, "sharp"],
    [-0.11, 0.18],
    [-0.055, 0.02],
=======
    [0, 0, "sharp"],
    [0.055, 0.02, "sharp"],
    [0.11, 0.18, "sharp"],
    [0.055, 0.31, "sharp"],
    [0, 0.22, "sharp"],
    [-0.055, 0.31, "sharp"],
    [-0.11, 0.18, "sharp"],
    [-0.055, 0.02, "sharp"],
>>>>>>> REPLACE
```