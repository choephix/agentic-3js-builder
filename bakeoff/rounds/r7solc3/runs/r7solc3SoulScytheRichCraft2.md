1. **Close the blade properly.** Its perimeter faces are facing inward, making the blade look hollow from the side. Reverse those faces so the bevels form a solid weapon.
2. **Strengthen the physical connections.** Seat the pommel in the stone, attach the pennant bracket and pendant, and give the dragon’s jaw substantial hinge supports.
3. **Make the dragon’s expression clearer.** Enlarge and slightly lower the glowing eyes without changing the strong brow silhouette.
4. **Give the blade more dragonbone character.** Add overlapping, pointed bone scutes along the spine, leaving the inscriptions and luminous cutting bevel unobstructed.

<<<<<<< SEARCH
    [[0, 0.43, 0], [0, 0.34, 0.012], [0, 0.18, 0.01]],
=======
    [[0, 0.43, 0], [0, 0.34, 0.012], [0, 0.163, 0.01]],
>>>>>>> REPLACE

<<<<<<< SEARCH
  rod("Pennant crossbar", [-0.355, 2.46, -0.1], [-0.105, 2.46, -0.1], 0.013, gold);
=======
  rod(
    "Pennant socket bracket",
    [-0.035, 2.46, -0.047],
    [-0.18, 2.46, -0.1],
    0.022,
    darkMetal,
  );
  ball(
    "Pennant bracket fastening",
    [-0.065, 2.46, -0.066],
    [0.033, 0.031, 0.025],
    gold,
  );
  rod("Pennant crossbar", [-0.355, 2.46, -0.1], [-0.105, 2.46, -0.1], 0.013, gold);
>>>>>>> REPLACE

<<<<<<< SEARCH
        bladePoint(k, 0, 0.048),
      ],
      agedBone,
    );
=======
        bladePoint(k, 0, 0.048),
      ],
      agedBone,
      true,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
          bladePoint(k, 1, -0.047),
        ],
        C.teal,
      ),
=======
          bladePoint(k, 1, -0.047),
        ],
        C.teal,
        true,
      ),
>>>>>>> REPLACE

<<<<<<< SEARCH
      bladePoint(0, 0, -0.048),
    ],
    agedBone,
  );
=======
      bladePoint(0, 0, -0.048),
    ],
    agedBone,
    true,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Seated decals follow the actual ridged blade faces.
  const bladeSurface = b.surface(bladeFaces);

  // A recessed-looking vein follows the hollow bevel. Its dark bed is wider
=======
  // Seated decals follow the actual ridged blade faces.
  const bladeSurface = b.surface(bladeFaces);

  // Broad overlapping scutes make the spine read as ancient dragon armour,
  // rather than a single cut sheet. They occupy only the outer quarter;
  // the larger inscriptions remain on the exposed bone below.
  function scutePoint(
    segment: number,
    along: number,
    across: number,
    face: number,
    lift: number,
  ) {
    const a = bladePoint(segment, across, face * 0.2);
    const c = bladePoint(segment + 1, across, face * 0.2);
    const query: P = [
      a[0] + (c[0] - a[0]) * along,
      a[1] + (c[1] - a[1]) * along,
      face * 0.2,
    ];
    const hit = bladeSurface.nearest(query);
    return hit.moved([0, lift, 0]);
  }

  for (const face of [-1, 1]) {
    for (let segment = 0; segment < 5; segment++) {
      const broadEnd = segment === 0 ? 0.88 : 0.94;
      const bed = [
        scutePoint(segment, 0.12, 0.018, face, 0.003),
        scutePoint(segment, broadEnd, 0.018, face, 0.003),
        scutePoint(segment, 0.98, 0.16, face, 0.003),
        scutePoint(segment, 0.74, 0.285, face, 0.003),
        scutePoint(segment, 0.10, 0.22, face, 0.003),
      ];
      b.slab(bed, {
        thickness: 0.007,
        color: "#627d70",
        bone: root,
        name: `Dragon spine scute shadow ${face} ${segment}`,
      });

      const plate = [
        scutePoint(segment, 0.15, 0.028, face, 0.011),
        scutePoint(segment, broadEnd - 0.035, 0.028, face, 0.011),
        scutePoint(segment, 0.945, 0.155, face, 0.011),
        scutePoint(segment, 0.74, 0.26, face, 0.011),
        scutePoint(segment, 0.14, 0.205, face, 0.011),
      ];
      b.slab(plate, {
        thickness: 0.012,
        color: segment % 2 === 0 ? agedBone : bladeBone,
        bone: root,
        name: `Overlapping dragon spine scute ${face} ${segment}`,
      });

      const score = [
        scutePoint(segment, 0.23, 0.075, face, 0.02),
        scutePoint(segment, 0.64, 0.105, face, 0.02),
        scutePoint(segment, 0.80, 0.16, face, 0.02),
      ];
      b.sweep(score, [0.003, 0.003, 0.0005], {
        color: "#8d9b7d",
        bone: root,
        sides: 5,
        caps: "flat",
        name: `Scute carved growth line ${face} ${segment}`,
      });
    }
  }

  // A recessed-looking vein follows the hollow bevel. Its dark bed is wider
>>>>>>> REPLACE

<<<<<<< SEARCH
      [x, 2.73, 0.279],
      [0.123, 0.064],
=======
      [x, 2.725, 0.283],
      [0.14, 0.077],
>>>>>>> REPLACE

<<<<<<< SEARCH
    ball(
      `Dragon jaw hinge ${s}`,
      [-0.03 + s * 0.16, 2.452, 0.12],
      [0.044, 0.046, 0.037],
      gold,
    );
=======
    // The ascending jaw ramus meets the hinge, while the rear cheek
    // carries that hinge into the cranium. Neither disc floats beside it.
    b.frustumBox(
      [-0.03 + s * 0.091, 2.407, 0.151],
      [-0.03 + s * 0.16, 2.452, 0.12],
      [0.079, 0.065],
      [0.075, 0.067],
      {
        color: agedBone,
        bone: root,
        name: `Dragon ascending jaw ramus ${s}`,
      },
    );

    b.frustumBox(
      [-0.03 + s * 0.192, 2.62, 0.123],
      [-0.03 + s * 0.16, 2.466, 0.12],
      [0.069, 0.065],
      [0.058, 0.059],
      {
        color: bladeBone,
        bone: root,
        name: `Dragon rear cheek hinge support ${s}`,
      },
    );

    ball(
      `Dragon jaw hinge ${s}`,
      [-0.03 + s * 0.16, 2.452, 0.12],
      [0.044, 0.046, 0.037],
      gold,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  diamond("Socket pendant frame", [0, 2.256, 0.095], 0.105, 0.142, C.ink);
=======
  rod(
    "Socket pendant mounting stud",
    [0, 2.285, 0.034],
    [0, 2.285, 0.098],
    0.031,
    darkMetal,
  );
  diamond("Socket pendant frame", [0, 2.256, 0.095], 0.105, 0.142, C.ink);
>>>>>>> REPLACE