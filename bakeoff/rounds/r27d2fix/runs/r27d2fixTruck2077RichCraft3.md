The bumper line `box(2.8, 0.2, 0.1, HAZARD, "#ffffff" as any, 0, 0, 0);` passes a texture and a colour string where `box` expects a colour and then the x, y and z numbers, so `"#ffffff"` is read as `x` and the point becomes `["#ffffff", 0, 0]`. The `decal` call on the next line already draws the hazard stripes, so I removed the bad line.

<<<<<<< SEARCH
  box(2.8, 0.2, 0.1, HAZARD, "#ffffff" as any, 0, 0, 0);
=======
>>>>>>> REPLACE