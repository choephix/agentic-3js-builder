Cause: the side-profile outline was inferred as `number[]` tuples, while `b.extrude` requires `OutlinePoint` tuples whose coordinate shape is explicitly preserved.

<<<<<<< SEARCH
  const sideProfile: [number, number][] = [
=======
  const sideProfile: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE