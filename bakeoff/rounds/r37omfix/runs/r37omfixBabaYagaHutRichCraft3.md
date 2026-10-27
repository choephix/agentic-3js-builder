The errors come from indexing a `Path` like an array, while `Path.at(t)` must be used, and from passing nullable `at.bone` where the builder expects an optional `JointRef`.

<<<<<<< SEARCH
    const ankle = side > 0 ? legLPath[legLPath.length - 1] : legRPath[legRPath.length - 1];

    const toeSpecs = [
=======
    const ankle = side > 0 ? legLPath.at(1) : legRPath.at(1);

    const toeSpecs = [
>>>>>>> REPLACE

<<<<<<< SEARCH
          bone: at.bone,
          name: "leg_scale",
=======
          bone: at.bone ?? undefined,
          name: "leg_scale",
>>>>>>> REPLACE