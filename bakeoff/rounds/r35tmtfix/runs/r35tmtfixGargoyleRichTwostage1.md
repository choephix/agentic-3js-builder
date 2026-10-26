Cause: `spine.tip` and `w.tip` are nullable SDK references, while the ledge passes `null` as a bone; assert known tips and omit null bones.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.part(g, color, { at, bone, name, flat: true });
=======
  return b.part(g, color, { at, ...(bone ? { bone } : {}), name, flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: EDGE, bone: w.tip, name: `wingFinger${s}A`, caps: "point" },
=======
      { color: EDGE, bone: w.tip!, name: `wingFinger${s}A`, caps: "point" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: EDGE, bone: w.tip, name: `wingFinger${s}B`, caps: "point" },
=======
      { color: EDGE, bone: w.tip!, name: `wingFinger${s}B`, caps: "point" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: EDGE, bone: w.tip, name: `wingFinger${s}C`, caps: "point" },
=======
      { color: EDGE, bone: w.tip!, name: `wingFinger${s}C`, caps: "point" },
>>>>>>> REPLACE