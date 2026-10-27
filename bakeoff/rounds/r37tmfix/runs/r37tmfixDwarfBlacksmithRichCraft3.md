Cause: `.tip` is typed as `Joint | null`, and `spine.tip` is actually null because its `names` list covers only the three span joints; use indexed joints instead.

```text
<<<<<<< SEARCH
  const neck = spine.tip;
=======
  const neck = spine.joints[2];
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: arm.tip,
=======
      bone: arm.joints[3],
>>>>>>> REPLACE
```