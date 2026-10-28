`M.legPlaneXs` is a four-element array cast to a three-element tuple type, which the compiler rejects; typing it as `number[]` fixes it.

<<<<<<< SEARCH
  legPlaneXs: [0.5, 1, -0.5, -1] as [number, number, number],
=======
  legPlaneXs: [0.5, 1, -0.5, -1] as number[],
>>>>>>> REPLACE