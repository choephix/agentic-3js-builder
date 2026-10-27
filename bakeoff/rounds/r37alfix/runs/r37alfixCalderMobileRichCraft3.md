Cause: `b.extrude()` accepts no `rotation` option; orientation is defined by its `at`, `x`, and `y` directions.

```diff
<<<<<<< SEARCH
    color,
    rotation,
  });
=======
    color,
  });
>>>>>>> REPLACE
```