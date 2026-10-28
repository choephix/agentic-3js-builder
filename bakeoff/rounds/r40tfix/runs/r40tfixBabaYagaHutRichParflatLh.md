The `featherOutline` helper's return type `[number, number, "sharp"?][]` allows optional tuple members, which doesn't match the SDK's `OutlinePoint` (`[x, y]` or `[x, y, "sharp"]`), so I changed it to a union of those two tuple types.

<<<<<<< SEARCH
  const featherOutline = (len: number, wid: number): [number, number, "sharp"?][] => [
=======
  const featherOutline = (len: number, wid: number): ([number, number] | [number, number, "sharp"])[] => [
>>>>>>> REPLACE