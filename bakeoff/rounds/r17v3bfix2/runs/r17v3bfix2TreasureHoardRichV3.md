The cause: two `b.extrude` calls (`lidBody` and `lidEnd`) omitted the required `x` direction.

<<<<<<< SEARCH
    at: [0, 0.46, -0.58], thickness: 0.88, bevel: 0.01, color: LIDWOOD, bone: lid, name: "lidBody",
=======
    at: [0, 0.46, -0.58], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.88, bevel: 0.01, color: LIDWOOD, bone: lid, name: "lidBody",
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [s * 0.4505, 0.46, -0.58], thickness: 0.026, bevel: 0.006, color: GOLD, bone: lid, name: "lidEnd",
=======
      at: [s * 0.4505, 0.46, -0.58], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.026, bevel: 0.006, color: GOLD, bone: lid, name: "lidEnd",
>>>>>>> REPLACE