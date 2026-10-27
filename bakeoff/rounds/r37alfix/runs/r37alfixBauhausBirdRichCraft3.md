Cause: nullable chain tips and joint-array entries were passed where the SDK requires definite joints; the wing outline had an invalid optional tuple type, and the rear-toe `rod` options contained an unnecessary invalid `bone` field.

<<<<<<< SEARCH
      parent: torso.tip,
=======
      parent: torso.joints[torso.joints.length - 1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: torso.joints[1],
=======
      bone: torso.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const wingOutline: [number, number, "sharp"?][] = [
=======
  const wingOutline: [number, number][] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: ORANGE, bone: s < 0 ? undefined : undefined, caps: "round", name: "rearToe", group: "feet" },
=======
      { color: ORANGE, caps: "round", name: "rearToe", group: "feet" },
>>>>>>> REPLACE