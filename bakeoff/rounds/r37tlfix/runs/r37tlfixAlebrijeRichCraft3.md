Cause: the named chains have no tip joint, so `.tip` is `null`; the talon spike also passes a nullable `.bone` where the spike frame already supplies bone inheritance.

<<<<<<< SEARCH
    { parent: spine.tip, names: ["neck1", "neck2"], role: "neck" },
=======
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: outer.at(t).bone,
        name: `flight-feather-${s}-${j}`,
=======
        name: `flight-feather-${s}-${j}`,
>>>>>>> REPLACE