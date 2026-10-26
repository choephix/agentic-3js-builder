The errors occur because `Chain.tip` is typed as `Joint | null`, while these parent fields require a definite `JointRef`.

<<<<<<< SEARCH
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
    }
=======
    {
      parent: spine.joints[spine.joints.length - 1],
      names: ["neck", "neckTip"],
      role: "neck",
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    {
      parent: spine.tip,
      names: ["shoulderL", "wingL", "wingTipL"],
      role: "wing",
      group: "wings",
    }
=======
    {
      parent: spine.joints[spine.joints.length - 1],
      names: ["shoulderL", "wingL", "wingTipL"],
      role: "wing",
      group: "wings",
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    {
      parent: spine.tip,
      names: ["shoulderR", "wingR", "wingTipR"],
      role: "wing",
      group: "wings",
    }
=======
    {
      parent: spine.joints[spine.joints.length - 1],
      names: ["shoulderR", "wingR", "wingTipR"],
      role: "wing",
      group: "wings",
    }
>>>>>>> REPLACE