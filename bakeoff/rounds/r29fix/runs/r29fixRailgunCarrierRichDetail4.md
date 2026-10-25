The bumper stripe part passed the `STRIPES` texture object as its colour argument, but `part()` takes a colour string there and the texture goes in the `texture` option.

<<<<<<< SEARCH
  P(bx(2.6, 0.12, 0.1), STRIPES as any, chassis, [0, 1.0, 4.52], { texture: STRIPES, color: "#ffffff" });
=======
  P(bx(2.6, 0.12, 0.1), "#ffffff", chassis, [0, 1.0, 4.52], { texture: STRIPES });
>>>>>>> REPLACE