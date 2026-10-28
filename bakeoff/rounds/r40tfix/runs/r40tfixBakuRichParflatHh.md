Cause: the whiskers' `sweep` has an always-nullish `(undefined as any) ?? bezierPts(...)` expression, and `M["pawF" + S]` / `M["pawH" + S]` index `M` with a plain string key.

<<<<<<< SEARCH
      b.sweep([p0, p1, p2, p3].map(arr).length ? (undefined as any) ?? bezierPts(p0, p1, p2, p3) : [], [0.007, 0.002], {
=======
      b.sweep(bezierPts(p0, p1, p2, p3), [0.007, 0.002], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      const pc = M["pawF" + S];
=======
      const pc = (M as Record<string, number[]>)["pawF" + S];
>>>>>>> REPLACE

<<<<<<< SEARCH
      const pc = M["pawH" + S];
=======
      const pc = (M as Record<string, number[]>)["pawH" + S];
>>>>>>> REPLACE