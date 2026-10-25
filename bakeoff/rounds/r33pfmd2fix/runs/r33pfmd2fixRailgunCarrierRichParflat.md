Cause: the cab's nose-wedge `b.extrude` call passes `thickness: 0`, but `extrude` requires a positive thickness (or a taper with at least one end above 0).

<<<<<<< SEARCH
  b.extrude([[0, 0], [0.45, 0], [0, 0.9]], { at: [-1.6, 1.1, 4.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0, color: P.hull, bone });
=======
  b.extrude([[0, 0], [0.45, 0], [0, 0.9]], { at: [-1.6, 1.1, 4.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.05, color: P.hull, bone });
>>>>>>> REPLACE