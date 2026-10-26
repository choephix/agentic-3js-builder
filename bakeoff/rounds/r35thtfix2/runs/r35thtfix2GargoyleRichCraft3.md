Cause: `chain.tip` can be null when a chain has no explicit tip joint, several rod calls receive widened `number[]` values instead of tuple points, and one decal target condition tests an always-defined function.

<<<<<<< SEARCH
      names: [prefix + (i + 1), `${prefix}Tip${i + 1}`],
=======
      names: [prefix + (i + 1), `${prefix}Mid${i + 1}`, `${prefix}Tip${i + 1}`],
>>>>>>> REPLACE

<<<<<<< SEARCH
      chain.tip,
=======
      chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        rib[0],
        rib[1],
=======
        rib[0] as [number, number, number],
        rib[1] as [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.rod(
        [s * (0.13 + i * 0.018), y, 0.255],
        [s * (0.28 + i * 0.024), y + 0.015, 0.22],
=======
      b.rod(
        [s * (0.13 + i * 0.018), y, 0.255] as [number, number, number],
        [s * (0.28 + i * 0.024), y + 0.015, 0.22] as [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const wingMark = b.decal(b.membrane ? b.root : b.root, WING_CARVING, {
=======
    const wingMark = b.decal(b.root, WING_CARVING, {
>>>>>>> REPLACE

<<<<<<< SEARCH
          at: eyeHit,
          dir: eyeHit.n,
=======
          at: eyeHit!,
          dir: eyeHit!.n,
>>>>>>> REPLACE