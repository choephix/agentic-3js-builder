Cause: `chain.tip` is nullable, so it cannot be passed as a bone; the flag outline was inferred as an incompatible generic array instead of an `OutlinePoint[]`.

```ts
<<<<<<< SEARCH
          bone: chain.tip,
=======
          bone: chain,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [
        [0, 0],
        [0.16, 0.04],
        [0.11, 0.12],
        [0, 0.17],
      ],
=======
      [
        [0, 0],
        [0.16, 0.04],
        [0.11, 0.12],
        [0, 0.17],
      ] as [number, number][],
>>>>>>> REPLACE
