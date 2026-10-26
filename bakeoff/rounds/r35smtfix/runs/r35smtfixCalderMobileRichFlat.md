Cause: the sub-node specs have `drop: 0.0`, so `walk` calls `wire(P, A)` with identical endpoints, and `b.rod` throws on a zero-length segment.

Fix: skip degenerate wires in `wire`.

<<<<<<< SEARCH
    if (emit) b.rod(p, q, r, WIRE, { sides: 5 });
=======
    if (emit && p.distanceTo(q) > 1e-4) b.rod(p, q, r, WIRE, { sides: 5 });
>>>>>>> REPLACE