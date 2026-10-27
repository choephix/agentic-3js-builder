Cause: `flat` is not a valid property of `ExtrudeOptions`; flat shading must be handled by the builder’s geometry/material pipeline.

```text
<<<<<<< SEARCH
    thickness: 2.62,
    bevel: 0.035,
    color: ROOF,
    flat: true,
  });
=======
    thickness: 2.62,
    bevel: 0.035,
    color: ROOF,
  });
>>>>>>> REPLACE
```