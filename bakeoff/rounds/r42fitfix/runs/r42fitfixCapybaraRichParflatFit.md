The `n === 1 ? 0 : i / (n - 1) - 0.5` check in the toe loop compares `n`, which TypeScript narrows to `3 | 4`, against 1, and that can never be true, so the redundant branch is dropped.

<<<<<<< SEARCH
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
=======
      const t = i / (n - 1) - 0.5;
>>>>>>> REPLACE