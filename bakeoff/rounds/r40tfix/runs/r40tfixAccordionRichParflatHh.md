The bass case indexes `P` with a plain `string` key (`P[key]`), which TypeScript rejects because `P` has only literal property names; casting the key to `keyof typeof P` fixes it.

<<<<<<< SEARCH
    b.part(merged, P[key], { at: [0, 0, 0], flat: true, name: `bassCase.${key}` });
=======
    b.part(merged, P[key as keyof typeof P], { at: [0, 0, 0], flat: true, name: `bassCase.${key}` });
>>>>>>> REPLACE