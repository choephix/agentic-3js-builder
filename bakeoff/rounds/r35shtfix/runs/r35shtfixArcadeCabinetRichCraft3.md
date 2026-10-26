The cause is a stray placeholder line, `glow(b.parts ? ({} as never) : ({} as never), 1);`. `b.parts` doesn't exist, and `glow` was handed an empty object. Deleting the line fixes both errors.

<<<<<<< SEARCH
  glow(b.parts ? ({} as never) : ({} as never), 1);
=======
>>>>>>> REPLACE