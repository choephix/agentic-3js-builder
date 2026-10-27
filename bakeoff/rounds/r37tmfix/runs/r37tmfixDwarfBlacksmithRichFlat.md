Cause: `Chain.tip` is typed as `Joint | null`, while `parent`/`bone` require a non-null `JointRef`; these chains do have tip joints, so assert them non-null.

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