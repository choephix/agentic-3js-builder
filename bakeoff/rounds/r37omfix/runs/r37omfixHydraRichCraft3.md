Cause: `Chain.tip` is typed as `Joint | null` and can be null; passing it as a joint parent violates the type contract and reaches `joint()` at runtime as `null`.

```ts
<<<<<<< SEARCH
    const head = b.joint(`head${i + 1}`, {
      parent: neck.tip,
      at: [d.tx, d.ty, d.tz],
=======
    const head = b.joint(`head${i + 1}`, {
      parent: neck.joints[neck.joints.length - 1],
      at: [d.tx, d.ty, d.tz],
>>>>>>> REPLACE
```