The floor-clutter `moon(...)` call passes radius `0.0` (an argument slip), so every moon outline point collapses to the origin and `extrude` sees fewer than 3 distinct points. That call is a stray decoration, so I'm replacing it with a real moon emblem on the book cover.

<<<<<<< SEARCH
  moon(at(-0.56, 0.05, 0.4, -7), -0.04, 0.003, 0.0, 0.0, 0.0, GOLD === "" ? GOLD : GOLD);
=======
  moon(at(-0.56, 0.05, 0.4, -7), -0.04, 0.109, 0.0, 0.04, 0.006, GOLD);
>>>>>>> REPLACE