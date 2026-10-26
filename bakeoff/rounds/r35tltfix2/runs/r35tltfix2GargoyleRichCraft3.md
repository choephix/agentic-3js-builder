Cause: the horn role is not valid, horn names contain hyphens when interpolating `s = -1`, and `chain.tip` is nullable even though these chains always include a tip joint.

<<<<<<< SEARCH
        role: "horn",
        names: [`hornBase${s}`, `hornMid${s}`],
=======
        role: "fan",
        names: [
          `hornBase${s > 0 ? "L" : "R"}`,
          `hornMid${s > 0 ? "L" : "R"}`,
        ],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
      scale: [1.3, 0.58, 1.45],
=======
      bone: chain.tip!,
      scale: [1.3, 0.58, 1.45],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
        name: `foot-claw-${label}-${i}`,
=======
        bone: chain.tip!,
        name: `foot-claw-${label}-${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
      scale: [1.1, 0.7, 1.25],
=======
      bone: chain.tip!,
      scale: [1.1, 0.7, 1.25],
>>>>>>> REPLACE

<<<<<<< SEARCH
        { color: CLAW, bone: chain.tip, name: `hand-claw-${label}-${i}` },
=======
        { color: CLAW, bone: chain.tip!, name: `hand-claw-${label}-${i}` },
>>>>>>> REPLACE