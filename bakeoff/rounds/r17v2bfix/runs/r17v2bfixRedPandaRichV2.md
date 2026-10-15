The pendant leaf `b.extrude` call had no `x` option, which `extrude` requires; I added `x: [1, 0, 0]` so the drawing faces front.

<<<<<<< SEARCH
      { at: [P.x, P.y, P.z + 0.007], thickness: 0.008, bevel: 0.002, smoothing: 1, color: GOLD, bone: chest, name: "pendant" },
=======
      { at: [P.x, P.y, P.z + 0.007], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, smoothing: 1, color: GOLD, bone: chest, name: "pendant" },
>>>>>>> REPLACE