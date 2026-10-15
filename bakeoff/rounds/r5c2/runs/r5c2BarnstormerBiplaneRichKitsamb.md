1. **Removed the six grey "smoke puff" spheres.** They hung under the lower wing at the exhaust stacks, sat in shadow and read as loose grey rocks floating below the fuselage. They were also the only loose parts the report flagged. Nothing else in the scene depended on them.
2. **Turned the pilot's scarf into a ribbon that can be seen.** It was a flat strip edge-on to the side and three-quarter cameras, so it read as a thin line. It is now tall and thin, so the red-and-cream stripes show as a streamer from every angle, and I made it slightly longer and wider toward its tail.
3. **Added a small brass cap and rivets on the propeller hub.** I did not do this one: it adds more risk than value to a nose that already reads well, so I left the propeller as it is.

<<<<<<< SEARCH
    // exhaust smoke puffs trailing from the stacks
    for (const s of [1, -1])
      [[0.12, 0.84, 0.09], [-0.5, 0.78, 0.13], [-1.25, 0.7, 0.18]].forEach(([pz, py, pr]) =>
        part(ball(pr, 8, 6), "#fff6e2", { at: [s * 0.95, py, pz] }),
      );
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      (t) => [0.1 * (1 + 0.3 * t), 0.012],
=======
      (t) => [0.014, 0.12 * (1 + 0.45 * t)],
>>>>>>> REPLACE