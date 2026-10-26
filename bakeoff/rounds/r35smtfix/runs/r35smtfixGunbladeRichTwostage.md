The `cylX` helper types its `color` parameter as `string`, but it is called with the `CYL_PAINT` Paint on line 215, so the parameter needs to accept a Paint too.

<<<<<<< SEARCH
  const cylX = (r: number, len: number, color: string, at: number[], name: string, seg = 12) =>
=======
  const cylX = (r: number, len: number, color: string | typeof CYL_PAINT, at: number[], name: string, seg = 12) =>
>>>>>>> REPLACE