Cause: nullable chain tips were passed as parents, and the gill outline lacked `"sharp"` markers and self-intersected at its closing edge.

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        const outline: [number, number, "sharp"][] = [
          [0, 0],
          [reach * 0.44, 0.018],
          [reach, 0.0],
          [reach * 0.58, -0.024],
          [0.10, -0.018],
        ];
=======
        const outline: [number, number, "sharp"][] = [
          [0, 0, "sharp"],
          [reach * 0.44, 0.025, "sharp"],
          [reach, 0, "sharp"],
          [reach * 0.55, -0.03, "sharp"],
          [0.02, -0.018, "sharp"],
        ];
>>>>>>> REPLACE