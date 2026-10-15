`chain.span(i)` returns a parameter interval `[t0, t1]` rather than a path, so passing it to `b.sweep` caused the numbers to be parsed as invalid point coordinates; sweeping the limb chains directly fixes this and creates continuous, smoothly skinned meshes.

## Edits

<<<<<<< SEARCH
  // Thighs
  b.sweep(legL.span(0), (t) => [0.11 * (1 - t * 0.25), 0.13 * (1 - t * 0.25)], { color: trollSkin });
  b.sweep(legR.span(0), (t) => [0.11 * (1 - t * 0.25), 0.13 * (1 - t * 0.25)], { color: trollSkin });

  // Calves: high muscular sweep tapering to long lean ankles
  b.sweep(legL.span(1), (t) => [0.095 * (1 - t * 0.45), 0.085 * (1 - t * 0.45)], { color: trollSkin });
  b.sweep(legR.span(1), (t) => [0.095 * (1 - t * 0.45), 0.085 * (1 - t * 0.45)], { color: trollSkin });
=======
  // Legs (smooth continuous skin across thigh, knee, and calf)
  const legRadius = (t: number): [number, number] =>
    t < 0.5
      ? [0.11 - t * 0.06, 0.13 - t * 0.08]
      : [0.085 - (t - 0.5) * 0.07, 0.08 - (t - 0.5) * 0.06];

  b.sweep(legL, legRadius, { color: trollSkin });
  b.sweep(legR, legRadius, { color: trollSkin });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Upper Arms
  b.sweep(armL.span(0), (t) => 0.085 * (1 - t * 0.2), { color: trollSkin });
  b.sweep(armR.span(0), (t) => 0.085 * (1 - t * 0.2), { color: trollSkin });

  // Forearms (Muscular brachiating taper)
  b.sweep(armL.span(1), (t) => [0.075 * (1 - t * 0.25) + 0.015, 0.065], { color: trollSkin });
  b.sweep(armR.span(1), (t) => [0.075 * (1 - t * 0.25) + 0.015, 0.065], { color: trollSkin });
=======
  // Arms (smooth continuous skin across upper arm, elbow, and forearm)
  const armRadius = (t: number): [number, number] =>
    t < 0.5
      ? [0.085 - t * 0.04, 0.085 - t * 0.04]
      : [0.075 - (t - 0.5) * 0.035, 0.065 - (t - 0.5) * 0.03];

  b.sweep(armL, armRadius, { color: trollSkin });
  b.sweep(armR, armRadius, { color: trollSkin });
>>>>>>> REPLACE