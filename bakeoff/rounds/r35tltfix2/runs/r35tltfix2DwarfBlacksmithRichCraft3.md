Cause: `Chain.tip` is typed as possibly `null`, so passing it directly as a `bone` does not satisfy the builder overload.

<<<<<<< SEARCH
      { color: LEATHER_L, bone: a.tip, section: { ngon: 6 } },
=======
      { color: LEATHER_L, bone: a.tip!, section: { ngon: 6 } },
>>>>>>> REPLACE