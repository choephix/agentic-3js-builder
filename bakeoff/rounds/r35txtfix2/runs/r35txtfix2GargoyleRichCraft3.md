Cause: the final scatter query passed `wingL`/`wingR` chains to `b.surface()`, but `surface()` accepts their sweeps, not `Chain` objects.

<<<<<<< SEARCH
  const wingData: any[] = [];

  for (const s of [1, -1]) {
=======
  const wingData: any[] = [];
  const wingLeadingSurfaces: any[] = [];

  for (const s of [1, -1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const leadingTube = b.sweep(
      leading,
      (t: number) => 0.072 - 0.033 * t,
=======
    const leadingTube = b.sweep(
      leading,
      (t: number) => 0.072 - 0.033 * t,
>>>>>>> REPLACE

<<<<<<< SEARCH
        group: "wings",
      },
    );

    const trailingTube = b.sweep(
=======
        group: "wings",
      },
    );
    wingLeadingSurfaces.push(leadingTube);

    const trailingTube = b.sweep(
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const hit of b.surface([tailTube, ...wingData.map((w) => w.leading)]).scatter(18, {
=======
  for (const hit of b.surface([tailTube, ...wingLeadingSurfaces]).scatter(18, {
>>>>>>> REPLACE