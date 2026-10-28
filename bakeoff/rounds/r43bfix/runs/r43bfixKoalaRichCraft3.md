The bake crashed because a paint returned a colour `undefined`. `c.pick(...)` from `cellPaint` returns an array element, and the `bark` paint passes `noise([...] as any, ...)` a plain array instead of a `Vector3`. That makes the noise `NaN`, so `pick` indexes the ramp out of range.

<<<<<<< SEARCH
    const streak = noise([c.at.x * 6, c.at.y * 0.8, c.at.z * 6] as any, 0.1, 5);
    return c.pick(BARK, 0.35 + 0.6 * streak + 0.15 * (c.random(1) - 0.5));
=======
    const streak = noise(new THREE.Vector3(c.at.x * 6, c.at.y * 0.8, c.at.z * 6), 0.1, 5);
    const val = 0.35 + 0.6 * streak + 0.15 * (c.random(1) - 0.5);
    return c.pick(BARK, Number.isFinite(val) ? val : 0.5);
>>>>>>> REPLACE