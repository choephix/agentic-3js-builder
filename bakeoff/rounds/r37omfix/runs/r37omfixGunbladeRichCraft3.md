Cause: `[number, number, "sharp"?]` permits an explicit `undefined` third element, which is not assignable to the SDK’s `OutlinePoint` union.

<<<<<<< SEARCH
  const bladeOutline: [number, number, "sharp"?][] = [
=======
  const bladeOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE