Cause: `crownLeaves` entries are inferred as readonly tuples, but `leaf()` required mutable tuples.

<<<<<<< SEARCH
    base: [number, number, number],
    tip: [number, number, number],
=======
    base: readonly [number, number, number],
    tip: readonly [number, number, number],
>>>>>>> REPLACE