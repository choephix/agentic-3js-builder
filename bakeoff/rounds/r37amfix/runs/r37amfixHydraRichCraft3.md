Cause: `chain.tip` is typed as `Joint | null`, and passing it directly as `parent` violates the SDK’s `JointRef` requirement; use the guaranteed final joint in `chain.joints`.

```ts
<<<<<<< SEARCH
    const head = b.joint(`head${i}`, {
      parent: chain.tip,
      at: [h.x, h.y, h.z],
=======
    const head = b.joint(`head${i}`, {
      parent: chain.joints[chain.joints.length - 1],
      at: [h.x, h.y, h.z],
>>>>>>> REPLACE
```