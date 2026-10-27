Cause: `b.rod` options do not accept the `flat` property; flat shading is controlled by the geometry/sweep settings rather than rod options.

<<<<<<< SEARCH
  return b.rod(a, z, radius, { color, name, flat: true });
=======
  return b.rod(a, z, radius, { color, name });
>>>>>>> REPLACE