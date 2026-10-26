Cause: the SDK’s rod color overload requires a `Paint`, but `RUST` was declared as a plain string.

<<<<<<< SEARCH
  const RUST = "#763c26";
=======
  const RUST = mottle("#763c26", "#3b2018", { size: 0.12, contrast: 1.3, seed: 15 });
>>>>>>> REPLACE