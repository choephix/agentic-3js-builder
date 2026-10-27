Cause: the side graphic passes `side.bone`, which is the builder’s internal root reference rather than a valid public `Joint`; omit that explicit bone assignment.

```diff
<<<<<<< SEARCH
      bone: side.bone,
      name: `sideGraphic${s}`,
=======
      name: `sideGraphic${s}`,
>>>>>>> REPLACE
```