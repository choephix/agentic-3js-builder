`color` is passed inside `PartOptions` even though it is already the second `b.part` argument, and `ExtrudeOptions` has no `rotation` property.

<<<<<<< SEARCH
      at,
      dir,
      color,
    });
=======
      at,
      dir,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.006,
        rotation: [0, 0, angle],
        color: MID,
=======
        x: [Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180), 0],
        y: [-Math.sin(angle * Math.PI / 180), Math.cos(angle * Math.PI / 180), 0],
        thickness: 0.035,
        bevel: 0.006,
        color: MID,
>>>>>>> REPLACE