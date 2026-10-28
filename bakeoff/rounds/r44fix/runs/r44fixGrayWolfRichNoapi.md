The lower jaw loft passes `mix(FUR_L, CREAM, 0.6) as any` as its colour. `mix` returns an `Rgb` array, and `color` accepts only a colour string or a paint, so the build threw. A plain hex string fixes it.

<<<<<<< SEARCH
    { bone: jaw, color: mix(FUR_L, CREAM, 0.6) as any, sides: 6, caps: { start: "round", end: "round" }, name: "lowerJaw" },
=======
    { bone: jaw, color: "#c9c4b4", sides: 6, caps: { start: "round", end: "round" }, name: "lowerJaw" },
>>>>>>> REPLACE