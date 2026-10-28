The `arch2` outline in `buildBody` is built with `arch.map((p) => [p[0]*0.6, p[1]*0.6+0.01, p[2]])`. Most points have no third element, so `p[2]` is `undefined`, and the array it produces serializes as `[x, y, null]`. The extrude check rejects that. The fix is to only add the `"sharp"` marker when the source point has one.

<<<<<<< SEARCH
  const arch2 = arch.map((p: any) => [p[0] * 0.6, p[1] * 0.6 + 0.01, p[2]]) as any;
=======
  const arch2 = arch.map((p: any) => (p[2] ? [p[0] * 0.6, p[1] * 0.6 + 0.01, p[2]] : [p[0] * 0.6, p[1] * 0.6 + 0.01])) as any;
>>>>>>> REPLACE

The same `p[2]` pattern appears in the tail spade and the wing-panel arch outlines, so I fixed those too.

<<<<<<< SEARCH
  b.extrude(spade.map((p: any) => [p[0] * 0.5, p[1] * 0.5 + 0.03, p[2]]) as any, {
=======
  b.extrude(spade.map((p: any) => (p[2] ? [p[0] * 0.5, p[1] * 0.5 + 0.03, p[2]] : [p[0] * 0.5, p[1] * 0.5 + 0.03])) as any, {
>>>>>>> REPLACE