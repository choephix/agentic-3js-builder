The cab's roof extrude passes `thickness: 0.0`, which `extrude` rejects because at least one end must be above 0; the fix removes that zero-thickness extrude, since the other roof pieces already cover the roof.

<<<<<<< SEARCH
  b.extrude(
    [
      [-1.4, 0],
      [1.4, 0],
      [1.2, 0.2],
      [-1.2, 0.2],
    ],
    { at: [0, 2.0, 2.5], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0, color: HULL, bone: body },
  );
=======
>>>>>>> REPLACE