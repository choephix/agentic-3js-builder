`leg.tip` is typed `Joint | null`, so `b.ring` rejects it as a `FrameInput`. The fix is to use the tip joint through a non-null assertion on that line.

<<<<<<< SEARCH
    const items = b.ring(leg.tip, { count: 4, radius: 0.04 }).items;
=======
    const items = b.ring(leg.tip!, { count: 4, radius: 0.04 }).items;
>>>>>>> REPLACE