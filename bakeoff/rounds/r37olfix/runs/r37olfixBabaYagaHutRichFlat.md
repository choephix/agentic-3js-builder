Cause: `chain.tip` can be `null` when the chain has no explicit tip joint, so passing it as `bone` is both a type error and a runtime error; use the chain’s final guaranteed joint instead.

```diff
<<<<<<< SEARCH
      b.rod(toeBase, [toeBase[0] + dx, 0.14, toeBase[2] + dz], 0.028, STRAW, {
        bone: chain.tip,
        section: { ngon: 5 },
      });
=======
      b.rod(toeBase, [toeBase[0] + dx, 0.14, toeBase[2] + dz], 0.028, STRAW, {
        bone: chain.joints[chain.joints.length - 1],
        section: { ngon: 5 },
      });
>>>>>>> REPLACE
```

```diff
<<<<<<< SEARCH
      b.spike([toeBase[0] + dx, 0.14, toeBase[2] + dz], [0, -1, 0], 0.065, 0.024, {
        color: BLACK,
        bone: chain.tip,
      });
=======
      b.spike([toeBase[0] + dx, 0.14, toeBase[2] + dz], [0, -1, 0], 0.065, 0.024, {
        color: BLACK,
        bone: chain.joints[chain.joints.length - 1],
      });
>>>>>>> REPLACE
```