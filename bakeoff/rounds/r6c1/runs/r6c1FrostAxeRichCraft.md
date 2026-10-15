1. The bronze fittings render as muddy olive and make the root plates read as brown slabs. I'm switching them to a bright polished brass so they pop against the navy and ice.
2. The studs along the cutting edge float outside the blade and show as dark specks. I'm pulling them inside the blade outline and making them glow like frost beads.
3. The haft is too thin against the huge head, so the axe looks like a pole with a sign on it. I'm thickening the core, grip, bands and studs, and moving the rune strips out to match.
4. The fur collar reads as thin grey spikes. I'm making the cards bigger and leaning them out so it reads as a fluffy pelt.
5. The blade's lower edge is plain. I'm adding a few small icicles hanging from it to carry the frost-forged idea and break up the silhouette.

<<<<<<< SEARCH
const BRONZE = shade(metal("bronze", { polish: 0.35, tarnish: 0.25 }));
=======
const BRONZE = shade(metal("brass", { polish: 0.55, tarnish: 0.12 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    ],
    0.03,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    ],
    0.034,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
b.rod([0, 0.27, 0], [0, 0.6, 0], 0.037, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.042, 0.009, haft);
=======
b.rod([0, 0.27, 0], [0, 0.6, 0], 0.044, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.049, 0.009, haft);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [Math.sin(a) * 0.04, 0.43, Math.cos(a) * 0.04],
=======
      at: [Math.sin(a) * 0.046, 0.43, Math.cos(a) * 0.046],
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [0, 0.75, sgn * 0.0315],
=======
        at: [0, 0.75, sgn * 0.0365],
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.055, 0.11],
    lean: 55,
=======
    size: [0.08, 0.16],
    lean: 45,
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.05, 0.1],
    lean: 62,
=======
    size: [0.07, 0.14],
    lean: 52,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(new THREE.OctahedronGeometry(0.009), ICE_EDGE, {
        bone: head,
        at: H(0.36 + 0.07 * Math.cos(ang) - 0.0, 0.33 * Math.sin(ang) * 1.05, sgn * 0.0185),
      });
=======
      glow(
        b.part(new THREE.OctahedronGeometry(0.009), ICE_EDGE, {
          bone: head,
          at: H(0.33 + 0.085 * Math.cos(ang), 0.33 * Math.sin(ang) * 0.8, sgn * 0.02),
        }),
        0.9,
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
  crystal(H(0.27, 0.3), [0.9, 1, 0.3], 0.1, 0.018, ICE[2], { bone: head });
=======
  crystal(H(0.27, 0.3), [0.9, 1, 0.3], 0.1, 0.018, ICE[2], { bone: head });
  // Icicles hanging from the blade's lower edge
  [
    [0.425, -0.1, 0.07],
    [0.405, -0.2, 0.09],
    [0.36, -0.295, 0.075],
  ].forEach(([x, y, l], i) => {
    crystal(H(x, y + 0.01), [0.15, -1, 0], l, 0.013, ICE[(i + 2) % 4], { bone: head, strength: 0.9 });
  });
>>>>>>> REPLACE