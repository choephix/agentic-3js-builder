Cause: `b.lathe` returns a `Part`, which has `mesh` but no `meshes`, so the leftover `.meshes.length` read on the belt call throws.

<<<<<<< SEARCH
  ).meshes.length;
=======
  );
>>>>>>> REPLACE