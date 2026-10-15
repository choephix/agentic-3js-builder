The cause is that `limb()` takes a point as `[x, y, z]`, a `Vector3` or a Frame, and `hipPt` was a `{ x, y, z }` object.

<<<<<<< SEARCH
    const hipPt: P = { x: s * 0.2, y: 1.0, z: 0 };
=======
    const hipPt: [number, number, number] = [s * 0.2, 1.0, 0];
>>>>>>> REPLACE