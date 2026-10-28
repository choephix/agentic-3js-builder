The nail count `n` is typed `4 | 5`, so the comparison `n === 1` can never be true; the unreachable guard is dropped.

<<<<<<< SEARCH
      const a = (-0.5 + (n === 1 ? 0 : i / (n - 1))) * 1.7 + (R() - 0.5) * 0.05;
=======
      const a = (-0.5 + i / (n - 1)) * 1.7 + (R() - 0.5) * 0.05;
>>>>>>> REPLACE