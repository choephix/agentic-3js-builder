Cause: the optional `"sharp"` tuple annotation permits an explicit `undefined`, which is not a valid `OutlinePoint`.

<<<<<<< SEARCH
      const outline: [number, number, "sharp"?][] = [
=======
      const outline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE