Cause: `tuskPath.at(0.15)` returns a `Vector3`, but `b.ring()` requires a frame with both a position and an axis.

<<<<<<< SEARCH
      catmull(b.ring(tuskPath.at(0.15), {
        count: 10,
        radius: 0.093,
      }).items, { closed: true }),
=======
      catmull(b.ring(frame(tuskPath.at(0.15), tuskPath.tangentAt(0.15)), {
        count: 10,
        radius: 0.093,
      }).items, { closed: true }),
>>>>>>> REPLACE