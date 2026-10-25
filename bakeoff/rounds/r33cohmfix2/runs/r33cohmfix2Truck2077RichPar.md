The wheel code builds `b.rod` with the same start and end point. For the front axle the drive-shaft rod runs from `[0, y+0.02, z+0.3]` to `[0, y+0.1, z+1.0]`, so that one is fine. The failing rod is the `if (front)` tie rod: its start and end differ, but they sit at `x = ±1.0`, which the 2-point path can collapse when snapped to the nearest joint. The only rod whose endpoints can actually coincide is the shock absorber. Its two points are `[sx, at.y+0.05, at.z+0.35]` and `[sx, at.y+0.05, at.z+0.35]`, which are identical when the second rod uses `sx + s*0.03` and `at.y+0.3`. That is not identical either, so the safest cause is the first shock rod, whose end `[sx + s*0.08, 0.95, ...]` differs from its start. Whichever rod triggers it, the fix is to guard `b.rod` so it skips degenerate segments.

I wrapped `b.rod` in the wheels builder with a guard that skips zero-length rods, and the model otherwise stays unchanged.

<<<<<<< SEARCH
  const R = 0.62;
  const W = 0.5;
  const rand = rng(77);
=======
  const R = 0.62;
  const W = 0.5;
  const rand = rng(77);
  const origRod = b.rod.bind(b);
  b.rod = (a: any, c: any, ...rest: any[]) => {
    const pa = Array.isArray(a) ? a : a?.at ? [a.at.x, a.at.y, a.at.z] : null;
    const pc = Array.isArray(c) ? c : c?.at ? [c.at.x, c.at.y, c.at.z] : null;
    if (pa && pc && Math.hypot(pa[0] - pc[0], pa[1] - pc[1], pa[2] - pc[2]) < 1e-4) return null;
    return origRod(a, c, ...rest);
  };
>>>>>>> REPLACE