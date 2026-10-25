Cause: the gun-shield decal line calls `plane(...)` with the string `"#ffffff"` as its texture argument, so `options.texture` is a string and `userData` is undefined. The line is a leftover and does nothing useful, so I removed it.

<<<<<<< SEARCH
  plane(0.5, 0.2, "#ffffff" as any, [0, 2.4, 0.585], [0, 0, 1]).mesh.visible = false;
=======
>>>>>>> REPLACE