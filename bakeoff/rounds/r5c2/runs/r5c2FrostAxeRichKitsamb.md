1. **Haft colour.** The purple haft clashed with the blue palette and muddied the leather wrap and fur. I changed it to a dark frost-navy wood so the wrap and banner read against it.
2. **Inlay border.** The glowing rune plate looked like a flat blue sticker. A gold bezel behind it makes it a set gem, which is the ornate fantasy-MOBA look.
3. **Blade clamp.** The blade root just butted against the socket. I added gold clamp plates there and moved the rivets onto them, so the head reads as one forged assembly.
4. **Collar gems.** I added glowing faceted ice gems front and back on the spear collar. They give the silhouette's focal point a second glowing accent beyond the blade and crystals.

<<<<<<< SEARCH
const WOOD = grain("#7a68a8", "#43386a", { size: 0.012, axis: "y", seed: 4 });
=======
const WOOD = grain("#3b4b7c", "#1c2748", { size: 0.012, axis: "y", seed: 4 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // glowing inlay + runes
=======
  // gold bezel behind the inlay gem
  b.extrude(
    [
      [0.085, 0],
      [0.15, 0.115],
      [0.275, 0.19, "sharp"],
      [0.355, 0, "sharp"],
      [0.275, -0.19, "sharp"],
      [0.15, -0.115],
    ],
    { at: AT_HEAD, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.031, bevel: 0.004, color: GOLD_P, bone: head, name: "bezel" },
  );

  // glowing inlay + runes
>>>>>>> REPLACE

<<<<<<< SEARCH
  // gold studs on the blade shoulders
=======
  // gold clamp plates where the blade meets the socket
  b.extrude(
    [
      [0.04, 0.22],
      [0.1, 0.17],
      [0.1, -0.17],
      [0.04, -0.22],
    ],
    { at: AT_HEAD, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.036, bevel: 0.005, color: GOLD_P, bone: head, name: "clamp" },
  );

  // gold studs on the blade shoulders
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [0.065, BL_Y + y, z * 0.013],
=======
        at: [0.07, BL_Y + y, z * 0.02],
>>>>>>> REPLACE

<<<<<<< SEARCH
  // snowflake emblems on the socket
=======
  // glowing ice gems on the spear collar
  for (const z of [1, -1])
    glow(
      b.part(new THREE.OctahedronGeometry(0.03, 0), ICE_C, {
        bone: head,
        at: [0, 1.525, z * 0.066],
        scale: [0.8, 1.35, 0.6],
        flat: true,
        name: z > 0 ? "gemFront" : "gemBack",
      }),
      0.9,
    );
  // snowflake emblems on the socket
>>>>>>> REPLACE