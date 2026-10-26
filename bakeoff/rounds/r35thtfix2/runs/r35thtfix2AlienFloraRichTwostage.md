Cause: `petalPaint` closes its arrow function with `};` but never closes the surrounding `paint(...)` call.

<<<<<<< SEARCH
  return base;
};
=======
  return base;
});
>>>>>>> REPLACE