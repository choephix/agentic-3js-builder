The `leaf` helper's return type `[number, number, string?][]` allows an optional third element of type `string | undefined`, which does not match `OutlinePoint` (`[x, y]` or `[x, y, "sharp"]`). Typing it as `[number, number][]` fixes all four reported lines.

<<<<<<< SEARCH
  const leaf = (len: number, w: number): [number, number, string?][] => [
=======
  const leaf = (len: number, w: number): [number, number][] => [
>>>>>>> REPLACE