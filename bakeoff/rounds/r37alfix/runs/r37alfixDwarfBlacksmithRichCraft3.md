Cause: `spine.tip` is typed as `Joint | null` and is actually `null` for this chain; use the chain’s final joint explicitly as the parent.

```ts
<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.43, 0.08],
=======
  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 1.43, 0.08],
>>>>>>> REPLACE
```