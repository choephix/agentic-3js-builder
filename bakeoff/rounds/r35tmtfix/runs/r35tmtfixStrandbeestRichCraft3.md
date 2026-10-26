Cause: `spine.tip` is nullable in the SDK, and the third gear’s placement overlaps gear 0; provide a non-null parent fallback and move the third gears outward.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip ?? root,
>>>>>>> REPLACE

<<<<<<< SEARCH
      { teeth: 14, from: 1, angle: -104, spokes: 4, bore: 0.014 },
=======
      { teeth: 14, from: 1, angle: 10, spokes: 4, bore: 0.014 },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { teeth: 14, from: 1, angle: 104, spokes: 4, bore: 0.014 },
=======
      { teeth: 14, from: 1, angle: -10, spokes: 4, bore: 0.014 },
>>>>>>> REPLACE