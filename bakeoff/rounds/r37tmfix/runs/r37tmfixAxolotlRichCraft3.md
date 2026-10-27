Cause: `Chain.tip` and indexed joint access are nullable in the SDK; the spine has no generated tip for its three named span joints, and nullable references cannot be passed as `parent`/`bone`.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1]!,
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip!,
>>>>>>> REPLACE
```