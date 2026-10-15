The cause is a leftover debug line at the end of the tent A block, `b.part(frame(...) as unknown as THREE.BufferGeometry, ...)`. It passes a `Spot` frame to `b.part` where a geometry is required, so I've removed it.

<<<<<<< SEARCH
    b.part(frame(P(F, [0, 0, 0]), [0, 1, 0]) as unknown as THREE.BufferGeometry, C.white, {}) as unknown;
  }
=======
  }
>>>>>>> REPLACE