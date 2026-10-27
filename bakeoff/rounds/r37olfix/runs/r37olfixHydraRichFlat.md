Cause: nullable chain tips were used as joint references, and `ChainPoint` has no `radius`; the null radius values also produced `[0, null, 0]`.

```text
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const h = neck.tip;
=======
    const h = neck.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      p.moved([0, p.radius * 0.9, 0]),
=======
      p.moved([0, 0.16, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      p.moved([0, p.radius * 0.7, 0]),
=======
      p.moved([0, 0.13, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      p.moved([0, p.radius + 0.13 - i * 0.01, -0.025]),
=======
      p.moved([0, 0.13 + 0.13 - i * 0.01, -0.025]),
>>>>>>> REPLACE
```