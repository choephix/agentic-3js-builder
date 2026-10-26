Cause: chain joints are not valid `parent`/`bone` references in this SDK build; use the chain itself (or its `.tip`) as the joint reference, and assert nullable bone handles before passing them.

<<<<<<< SEARCH
  const tail = b.chain("tail", tailPath, {
    parent: spine.joints[0],
=======
  const tail = b.chain("tail", tailPath, {
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: z < 0 ? spine.joints[2] : spine.joints[0],
=======
        parent: z < 0 ? spine : spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: spine.joints[4],
=======
        parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p.bone,
=======
      bone: p.bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: knee.bone,
=======
      bone: knee.bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: ankle.bone,
=======
      bone: ankle.bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foot.bone,
=======
      bone: foot.bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: n.bone,
=======
      bone: n.bone!,
>>>>>>> REPLACE