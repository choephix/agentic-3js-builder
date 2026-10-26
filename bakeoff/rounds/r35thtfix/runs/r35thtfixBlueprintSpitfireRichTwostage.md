Cause: the `b.part` call supplied `axis: "z"` together with `dir`, but `axis` is not a valid `PartOptions` field for that overload; use the supported `aim`/`dir` orientation only.

<<<<<<< SEARCH
      at: p,
      dir: axis,
      axis: "z",
      flat: true,
      name: `s24_exhaustBand${side > 0 ? "L" : "R"}${i}_${t}`,
=======
      at: p,
      dir: axis,
      flat: true,
      name: `s24_exhaustBand${side > 0 ? "L" : "R"}${i}_${t}`,
>>>>>>> REPLACE