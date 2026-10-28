Cause: `M["hand" + side]` and `M["foot" + side]` index the typed `M` object with a plain `string`, which TypeScript rejects; the fix is to type `M` as a string-indexable record.

<<<<<<< SEARCH
    const hm = M["hand" + side];
    const fm = M["foot" + side];
=======
    const hm = (M as Record<string, [number, number, number]>)["hand" + side];
    const fm = (M as Record<string, [number, number, number]>)["foot" + side];
>>>>>>> REPLACE