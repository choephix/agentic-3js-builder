Cause: the wheel joint name is built from the z value (e.g. `-1.4`), and the `-` and `.` characters are not allowed in a joint name; only the `.` was replaced.

<<<<<<< SEARCH
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${z}`.replace(".", "_"), {
=======
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${z}`.replace(/\./g, "_").replace(/-/g, "n"), {
>>>>>>> REPLACE