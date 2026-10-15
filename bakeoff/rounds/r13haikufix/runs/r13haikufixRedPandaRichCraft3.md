Cause: the collar sweep uses `jade`, but the module only defines `JADE` (uppercase), so the lookup fails at runtime.

<<<<<<< SEARCH
  b.sweep(catmull(collar, { closed: true }), 0.013, { bone: spine.joints[3], color: jade });
=======
  b.sweep(catmull(collar, { closed: true }), 0.013, { bone: spine.joints[3], color: JADE });
>>>>>>> REPLACE