`M["neckBase" + k]` indexes the typed `M` object with a plain `string`, which TypeScript rejects; casting the key to `keyof typeof M` fixes it.

<<<<<<< SEARCH
    const m = M["neckBase" + k];
=======
    const m = M[("neckBase" + k) as keyof typeof M];
>>>>>>> REPLACE