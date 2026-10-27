Cause: nullable `ChainPoint.bone` values were passed explicitly as bones, and `b.surface` does not accept raw `Chain` objects as surface targets.

<<<<<<< SEARCH
        BONE,
        at.bone,
      );
=======
        BONE,
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
      BONE,
      tailTip.bone,
    );
=======
      BONE,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodySurface = b.surface([torso, necks]);
=======
  const bodySurface = b.surface([torsoTube, ...neckTubes]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(torso, (t) => 0.31 + 0.07 * Math.sin(Math.PI * t), {
    color: SCALE_PAINT,
    sides: 8,
    section: "circle",
    name: "armoredTorso",
  });
=======
  const torsoTube = b.sweep(torso, (t) => 0.31 + 0.07 * Math.sin(Math.PI * t), {
    color: SCALE_PAINT,
    sides: 8,
    section: "circle",
    name: "armoredTorso",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const necks: any[] = [];
  const heads: any[] = [];
  const jaws: any[] = [];
=======
  const necks: any[] = [];
  const neckTubes: any[] = [];
  const heads: any[] = [];
  const jaws: any[] = [];
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tube = b.sweep(neck, (t) => 0.17 - 0.045 * t, {
      color: NECK_PAINT,
      sides: 8,
      name: `${spec.key}Skin`,
    });
=======
    const tube = b.sweep(neck, (t) => 0.17 - 0.045 * t, {
      color: NECK_PAINT,
      sides: 8,
      name: `${spec.key}Skin`,
    });
    neckTubes.push(tube);
>>>>>>> REPLACE