The errors come from strict SDK frame types: line frames need `Vector3` axes, nullable joints must be narrowed, and `b.part` rotations use degree arrays rather than `THREE.Euler`.

<<<<<<< SEARCH
      axis: [0, 1, 0] },
=======
      axis: UP },
>>>>>>> REPLACE

<<<<<<< SEARCH
          frame: rootChain.tip,
=======
          frame: rootChain.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: MAGENTA,
      bone: stalk.tip,
=======
      color: MAGENTA,
      bone: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [0, 1.91, 0.045],
      bone: stalk.tip,
=======
      at: [0, 1.91, 0.045],
      bone: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: i % 2 ? MAGENTA : VIOLET,
      bone: stalk.tip,
=======
      color: i % 2 ? MAGENTA : VIOLET,
      bone: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: i % 2 ? CYAN : PINK,
      bone: stalk.tip,
=======
      color: i % 2 ? CYAN : PINK,
      bone: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: CYAN_PALE,
        bone: stalk.tip,
=======
        color: CYAN_PALE,
        bone: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: BLUE,
        bone: stalk.tip,
=======
        color: BLUE,
        bone: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [0, 1.92, 0],
      bone: stalk.tip,
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
=======
      at: [0, 1.92, 0],
      bone: stalk.tip ?? undefined,
      rotation: [90, 0, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [0, 1.92, 0],
      bone: stalk.tip,
      rotation: new THREE.Euler(Math.PI / 2, 0, THREE.MathUtils.degToRad(18)),
=======
      at: [0, 1.92, 0],
      bone: stalk.tip ?? undefined,
      rotation: [90, 0, 18],
>>>>>>> REPLACE