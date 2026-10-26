Cause: `spine.tip` is typed as `Joint | null`, while these SDK options require a non-null `JointRef`.

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
    sphere(`pauldronBase${s}`, [s * 0.35, 1.405, 0.025], [0.18, 0.11, 0.18], IRON, spine.tip);
=======
    sphere(`pauldronBase${s}`, [s * 0.35, 1.405, 0.025], [0.18, 0.11, 0.18], IRON, spine.tip!);
>>>>>>> REPLACE