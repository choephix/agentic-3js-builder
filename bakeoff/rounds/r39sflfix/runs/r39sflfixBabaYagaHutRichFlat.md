The `sawOutline` helper builds a self-crossing outline: it starts `[0,0] → [L,0] → [L,d0]`, then walks the teeth back from the right, and the last tooth point lands on `[0,d0]` (a repeat of the first tooth's base), so the loop closes against the `[0,0]→[L,0]` edge. The traced path ordering put edge 0→1 and edge 2→3 in conflict because the first tooth apex `[L-w/2, d1]` follows `[L,d0]` with `d1 < d0` for the shingle case (`d0=0.28, d1=0`), which dips down to the base edge at y=0. Likewise, for the bargeboard case `d1 > d0` pokes out the other way. The shingle teeth must point downward from the strip while staying above the base. I fix it by making the strip a solid band, with the base at `d0` above the teeth: teeth go down to `-depth`, with `[0,0]` and `[L,0]` as the top edge.

Rewriting the helper: the outline runs along the top at `d0`, and the teeth go to `d1` on the other side. A shape that is always valid is: bottom-left `[0,d0]`, then the zigzag along the bottom going right, then up the right side and back along the top at `d0 + 0.2`. Callers pass `(L, n, d0, d1)`: for the shingles `(0.28, 0)`, which gives a band from the teeth at y=0 up to y=0.28 with a flat top; for the barge boards `(0.16, 0.38)`, which gives teeth reaching 0.38 up from the base at 0.16, so the flat edge stays at y=0 and the teeth poke upward.

<<<<<<< SEARCH
    const pts: [number, number, "sharp"?][] = [[0, 0], [L, 0], [L, d0]];
    for (let i = n - 1; i >= 0; i--) {
      pts.push([i * w + w / 2, d1, "sharp"]);
      pts.push([i * w, d0, "sharp"]);
    }
    // remove duplicate last point equal to [0,d0] handled by loop; ensure unique
    return pts as any;
=======
    const top = Math.max(d0, d1) + 0.12;
    const lo = Math.min(d0, d1);
    const pts: any[] = [[0, lo, "sharp"]];
    for (let i = 0; i < n; i++) {
      pts.push([i * w + w / 2, d1 < d0 ? d1 : d1, "sharp"]);
      pts.push([(i + 1) * w, d0, "sharp"]);
    }
    pts.push([L, top, "sharp"]);
    pts.push([0, top, "sharp"]);
    pts[0] = [0, d0, "sharp"];
    return pts;
>>>>>>> REPLACE