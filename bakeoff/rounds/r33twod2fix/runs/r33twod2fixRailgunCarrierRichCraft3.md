Cause: a leftover debug line builds a rod with the invalid colour `"#00000000"` and then reads `.mesh` on the returned Sweep, which has no such property. The line is useless, so I remove the whole loop.

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 0.0, 0.4], [s * 0.22, 0.0, 5.6], 0.2, "#00000000" as any, { bone: gun, sides: 4 } as any).mesh.visible = false;
  }
=======
>>>>>>> REPLACE