Cause: `b.stick` already inherits orientation from its `Hit`; its options do not accept `dir` or `axis`, so those values were misread as surface-orientation inputs.

<<<<<<< SEARCH
        at: spotAt,
        dir: [0, 1, 0],
        axis: "y",
        bone: tail.at(t).bone,
=======
        at: spotAt,
        bone: tail.at(t).bone,
>>>>>>> REPLACE