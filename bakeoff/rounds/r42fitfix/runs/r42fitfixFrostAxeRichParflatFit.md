`b.spike` returns a `Sweep`, which has `meshes` (not `mesh`), so `.mesh.position.z` was undefined. The call was a no-op nudge (`+= 0.0`), so I removed the property access.

<<<<<<< SEARCH
    b.spike([x, y, 0.0], [0, -1, 0], l * 0.6, 0.01, { color: P.iceEdge, sides: 4 } as any).mesh.position.z += 0.0;
=======
    b.spike([x, y, 0.0], [0, -1, 0], l * 0.6, 0.01, { color: P.iceEdge, sides: 4 } as any);
>>>>>>> REPLACE