Cause: `Chain.tip` is nullable, so assert the existing chain tips are present before using them as parents or joints.

```ts
<<<<<<< SEARCH
      parent: torso.tip,
=======
      parent: torso.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const head = neck.tip;
=======
    const head = neck.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: head,
=======
      parent: head!,
>>>>>>> REPLACE
```