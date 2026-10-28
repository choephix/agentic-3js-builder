The chest emblem's inner shield is built by mapping `[p[0]*0.82, p[1]*0.82, p[2]]` over the outline. Most points have no third element, so `p[2]` is `undefined`, which JSON-serialises as `null`, and the extrude rejects it. The fix is to append `"sharp"` only when the original point has it.

<<<<<<< SEARCH
    b.extrude(shield.map((p: any) => [p[0] * 0.82, p[1] * 0.82 - (p[1] < 0 ? 0 : 0), p[2]]) as any, {
=======
    b.extrude(shield.map((p: any) => (p[2] ? [p[0] * 0.82, p[1] * 0.82, "sharp"] : [p[0] * 0.82, p[1] * 0.82])) as any, {
>>>>>>> REPLACE