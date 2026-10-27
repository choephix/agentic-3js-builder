Cause: `Chain.tip` is nullable, so non-null assertions are required where the chain explicitly includes a tip joint; `Segment` exposes `.axis`, not `.tangentAt()`.

```text
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
=======
    parent: spine.tip!,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
=======
    parent: spine.tip!,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: arm.tip,
    at: arm.tip.at,
=======
    bone: arm.tip!,
    at: arm.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: arm.tip,
      at: p,
=======
      bone: arm.tip!,
      at: p,
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
    bone: armL.tip,
    caps: "round",
=======
    bone: armL.tip!,
    caps: "round",
>>>>>>> REPLACE

<<<<<<< SEARCH
    quat: hammerLine.tangentAt(1),
=======
    quat: hammerLine.axis,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armL.tip,
    at: [0.7, 1.52, 0.22],
=======
    bone: armL.tip!,
    at: [0.7, 1.52, 0.22],
>>>>>>> REPLACE

<<<<<<< SEARCH
    dir: hammerLine.tangentAt(1),
=======
    dir: hammerLine.axis,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armL.tip,
    at: [0.7, 1.52, 0.22],
=======
    bone: armL.tip!,
    at: [0.7, 1.52, 0.22],
>>>>>>> REPLACE