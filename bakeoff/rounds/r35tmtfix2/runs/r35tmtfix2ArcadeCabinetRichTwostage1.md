Cause: the SDK’s `rotation` option expects a rotation string, so the numeric rotation arrays must be converted to quaternions.

<<<<<<< SEARCH
      rotation,
      name,
=======
      quat: rotation
        ? new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
              (rotation[0] * Math.PI) / 180,
              (rotation[1] * Math.PI) / 180,
              (rotation[2] * Math.PI) / 180,
            ),
          )
        : undefined,
      name,
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation,
    });
=======
      quat: rotation
        ? new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
              (rotation[0] * Math.PI) / 180,
              (rotation[1] * Math.PI) / 180,
              (rotation[2] * Math.PI) / 180,
            ),
          )
        : undefined,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    rotation: [-8, 0, 0],
    name: "screenSurface",
=======
    quat: new THREE.Quaternion().setFromEuler(
      new THREE.Euler((-8 * Math.PI) / 180, 0, 0),
    ),
    name: "screenSurface",
>>>>>>> REPLACE

<<<<<<< SEARCH
    rotation: [-3, 0, 0],
    name: "marqueeFace",
=======
    quat: new THREE.Quaternion().setFromEuler(
      new THREE.Euler((-3 * Math.PI) / 180, 0, 0),
    ),
    name: "marqueeFace",
>>>>>>> REPLACE