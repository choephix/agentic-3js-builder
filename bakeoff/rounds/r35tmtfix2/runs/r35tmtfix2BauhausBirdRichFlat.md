Cause: `Chain.tip` and indexed chain joints are nullable in the SDK types, so they must be narrowed with non-null assertions before being used as `parent` or `bone`.

<<<<<<< SEARCH
    parent: torso.tip,
=======
    parent: torso.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: RED,
        bone: wing.joints[1],
        name: `wingRed${side}`,
=======
        color: RED,
        bone: wing.joints[1]!,
        name: `wingRed${side}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: BLUE_DARK,
        bone: wing.joints[1],
        name: `wingBluePanel${side}`,
=======
        color: BLUE_DARK,
        bone: wing.joints[1]!,
        name: `wingBluePanel${side}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation: [Math.PI / 2, 0, 0],
      name: `wingRoundel${side}`,
=======
      rotation: [Math.PI / 2, 0, 0],
      bone: wing.joints[1]!,
      name: `wingRoundel${side}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.016, 6, 4), BLACK, {
      bone: wing.joints[1],
      at: [s * 0.345, 0.825, 0.181],
=======
    b.part(new THREE.SphereGeometry(0.016, 6, 4), BLACK, {
      bone: wing.joints[1]!,
      at: [s * 0.345, 0.825, 0.181],
>>>>>>> REPLACE