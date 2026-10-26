Cause: the optional `"sharp"` tuple element makes each point a three-element tuple whose third item may be `undefined`, which is not a valid `OutlineInput`.

<<<<<<< SEARCH
  const bladeOutline: [number, number, "sharp"?][] = [
=======
  const bladeOutline: [number, number, "sharp"][] = [
>>>>>>> REPLACE