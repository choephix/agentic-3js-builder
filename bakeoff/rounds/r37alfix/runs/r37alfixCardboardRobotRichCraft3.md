Cause: `spine.tip` is typed as `Joint | null`; use the guaranteed third spine joint instead.

<<<<<<< SEARCH
    parent: spine.tip,
    at: [0, 1.43, 0.03],
=======
    parent: spine.joints[2],
    at: [0, 1.43, 0.03],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { parent: spine.tip, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
=======
    { parent: spine.joints[2], names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { parent: spine.tip, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
=======
    { parent: spine.joints[2], names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
>>>>>>> REPLACE