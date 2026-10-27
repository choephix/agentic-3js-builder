Cause: the neck chain passed its `Path` as the chain name, and nullable chain tips were passed directly where the SDK requires a non-null `JointRef`.

```ts
<<<<<<< SEARCH
  const neck = b.chain(
    catmull([
=======
  const neck = b.chain(
    "neck",
    catmull([
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
      parent: torso.tip,
=======
      parent: torso.tip ?? undefined,
>>>>>>> REPLACE
```