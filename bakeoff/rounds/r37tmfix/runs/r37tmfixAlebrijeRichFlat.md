Cause: the root joint’s `dir` tuple is inferred too broadly by the overload; use an explicit typed direction tuple.

<<<<<<< SEARCH
  const hips = b.joint("hips", {
    at: [0, 0.78, -0.25],
    dir: [0, 0, 1],
    role: "spine",
  });
=======
  const hips = b.joint("hips", {
    at: [0, 0.78, -0.25],
    dir: [0, 0, 1] as [number, number, number],
    role: "spine",
  });
>>>>>>> REPLACE