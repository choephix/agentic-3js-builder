Cause: nullable `spine.tip` needs narrowing, and `b.spike` requires fixed three-number tuples rather than inferred `number[]` arrays.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(foot, [s * 0.58, 0.21, 0.78], null, 0.045, {
=======
    b.spike(foot, [s * 0.58, 0.21, 0.78] as [number, number, number], null, 0.045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(foot, [s * 0.46, 0.21, 0.84], 0.18, 0.045, {
=======
    b.spike(foot, [s * 0.46, 0.21, 0.84] as [number, number, number], 0.18, 0.045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(foot, [s * 0.34, 0.21, 0.75], 0.13, 0.045, {
=======
    b.spike(foot, [s * 0.34, 0.21, 0.75] as [number, number, number], 0.13, 0.045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hand, [s * 0.57, 0.55, 1.05], 0.25, 0.035, {
=======
    b.spike(hand, [s * 0.57, 0.55, 1.05] as [number, number, number], 0.25, 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hand, [s * 0.49, 0.51, 1.08], 0.29, 0.035, {
=======
    b.spike(hand, [s * 0.49, 0.51, 1.08] as [number, number, number], 0.29, 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hand, [s * 0.41, 0.54, 1.02], 0.22, 0.035, {
=======
    b.spike(hand, [s * 0.41, 0.54, 1.02] as [number, number, number], 0.22, 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      [f.x, crownBaseY + 0.055, crownZ],
      [f.x, crownBaseY + 0.055 + f.h, crownZ],
=======
      [f.x, crownBaseY + 0.055, crownZ] as [number, number, number],
      [f.x, crownBaseY + 0.055 + f.h, crownZ] as [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [f.x, crownBaseY + 0.055 + f.h * 0.70, crownZ],
      [f.x, crownBaseY + 0.055 + f.h * 0.93, crownZ],
=======
      [f.x, crownBaseY + 0.055 + f.h * 0.70, crownZ] as [number, number, number],
      [f.x, crownBaseY + 0.055 + f.h * 0.93, crownZ] as [number, number, number],
>>>>>>> REPLACE