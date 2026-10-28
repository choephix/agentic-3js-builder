Cause: `M["foot" + id]` indexes the typed `M` object with a plain string, and the `leaf` helper returns a loose tuple array, which `extrude` does not accept as an outline.

<<<<<<< SEARCH
    const [fx, , fz] = M["foot" + id];
=======
    const [fx, , fz] = (M as Record<string, number[]>)["foot" + id];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leaf = (L: number, w: number): [number, number, string?][] => [
=======
  const leaf = (L: number, w: number): any => [
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(
      [
        [0.74 * L, -0.33 * W],
=======
    b.extrude(
      ([
        [0.74 * L, -0.33 * W],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0.74 * L, 0.33 * W],
      ],
      { ...base, at: o, thickness: 0.02, color: P.cream },
=======
        [0.74 * L, 0.33 * W],
      ] as any),
      { ...base, at: o, thickness: 0.02, color: P.cream },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(
      [
        [0.08 * L, -0.008],
=======
    b.extrude(
      ([
        [0.08 * L, -0.008],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0.08 * L, 0.008],
      ],
      { ...base, at: o, thickness: 0.022, color: P.cream },
=======
        [0.08 * L, 0.008],
      ] as any),
      { ...base, at: o, thickness: 0.022, color: P.cream },
>>>>>>> REPLACE