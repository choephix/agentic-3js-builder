Cause: `neck.tip` is typed as `Joint | null`, but `parent` requires a non-null `JointRef`; assert that the chain tip exists.

```ts
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE
```