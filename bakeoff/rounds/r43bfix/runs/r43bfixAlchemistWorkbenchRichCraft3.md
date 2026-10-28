The cause is that `glow()` was called on parts whose colour is a `cel(...)` paint, and painted parts can't glow. These are the herb-pot soil disc, `cyl(... cel("#7af08a") ...)` in the mortar, and the `lathe`/`cyl` calls where a glowing colour went through a paint. The `glow(lathe(pts, col, ...))` in `potion` is fine because `col` is a flat string. The one at line 221 is the mortar's green paste, which is passed as `cel("#7af08a")`. Changing it to a flat colour string fixes it.

<<<<<<< SEARCH
  glow(cyl(0.065, 0.065, 0.006, 8, cel("#7af08a"), -0.12, TOP + 0.075, 0.14), 0.7);
=======
  glow(cyl(0.065, 0.065, 0.006, 8, "#7af08a", -0.12, TOP + 0.075, 0.14), 0.7);
>>>>>>> REPLACE