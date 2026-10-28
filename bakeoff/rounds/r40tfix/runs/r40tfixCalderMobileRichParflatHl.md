The leaf outline in `buildBranchC` is scaled with `outline.map((p) => [p[0]*0.96, p[1]*0.96-0.01, p[2]])`, which gives every plain `[x, y]` point a third element of `undefined`. That serialises as `null` and fails the outline check, so the fix is to only keep the third element when it is `"sharp"`.

<<<<<<< SEARCH
  const plate = b.extrude(outline.map((p) => [p[0] * 0.96, p[1] * 0.96 - 0.01, p[2]]) as any,
=======
  const plate = b.extrude(outline.map((p) => (p[2] ? [p[0] * 0.96, p[1] * 0.96 - 0.01, p[2]] : [p[0] * 0.96, p[1] * 0.96 - 0.01])) as any,
>>>>>>> REPLACE

The search line may not match exactly, because the original keeps the `{ at: ...` options on the same line, so here is the exact line:

<<<<<<< SEARCH
  const plate = b.extrude(outline.map((p) => [p[0] * 0.96, p[1] * 0.96 - 0.01, p[2]]) as any, { at: at.clone().addScaledVector(nrm, 0.006).toArray() as any,
=======
  const plate = b.extrude(outline.map((p) => (p[2] ? [p[0] * 0.96, p[1] * 0.96 - 0.01, p[2]] : [p[0] * 0.96, p[1] * 0.96 - 0.01])) as any, { at: at.clone().addScaledVector(nrm, 0.006).toArray() as any,
>>>>>>> REPLACE