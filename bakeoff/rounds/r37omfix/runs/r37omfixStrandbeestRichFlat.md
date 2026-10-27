Cause: `chain.tip` is typed as `Joint | null`; use the guaranteed final joint in the four-joint leg chain instead.

<<<<<<< SEARCH
        bone: chain.tip,
        at: [p[3][0], 0.045, p[3][2]],
=======
        bone: chain.joints[chain.joints.length - 1],
        at: [p[3][0], 0.045, p[3][2]],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
        at: [p[3][0], 0.072, p[3][2] + (index % 2 === 0 ? 0.13 : -0.13)],
=======
        bone: chain.joints[chain.joints.length - 1],
        at: [p[3][0], 0.072, p[3][2] + (index % 2 === 0 ? 0.13 : -0.13)],
>>>>>>> REPLACE