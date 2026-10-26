Cause: `b` is not an SDK export, `ChainRecord` is unused, and `spine.tip` is nullable but must resolve to a valid joint reference.

```ts
<<<<<<< SEARCH
  bezier,
  b,
  catmull,
=======
  bezier,
  catmull,
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
type ChainRecord = ReturnType<typeof createBuilder>["root"];

=======
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
    parent: spine.tip,
    at: headCenter,
=======
    parent: spine.tip ?? spine.joints[spine.joints.length - 1],
    at: headCenter,
>>>>>>> REPLACE
```