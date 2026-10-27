Cause: `rootBone` was never defined, `leg.tip` is nullable, and one `b.part` call passes an unsupported `axis` option alongside `dir`.

<<<<<<< SEARCH
      bone: rootBone,
=======
      bone: undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip ?? root,
>>>>>>> REPLACE

<<<<<<< SEARCH
    dir: [1, 0, 0],
    axis: "z",
=======
    dir: [1, 0, 0],
>>>>>>> REPLACE