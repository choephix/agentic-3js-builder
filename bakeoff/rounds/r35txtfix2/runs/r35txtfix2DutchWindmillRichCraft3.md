Cause: the optional tuple element (`"sharp"?`) introduces `undefined`, which is not a valid `OutlineInput` tuple.

<<<<<<< SEARCH
  const bladeOutline: [number, number, "sharp"?][] = [
=======
  const bladeOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE