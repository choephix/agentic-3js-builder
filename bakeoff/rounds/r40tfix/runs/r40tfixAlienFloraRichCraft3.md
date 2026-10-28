The module had no default-exported function, so the final `return` sat at top level, and `bead` was given a `PathPoint` where it needs a point (`at.at`).

<<<<<<< SEARCH
const b = createBuilder({ name: "lumenBloom" });
=======
export default function build() {
const b = createBuilder({ name: "lumenBloom" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(coilPath, 8, (at) => bead(at, 0.014, MAG, 1.4));
=======
  b.along(coilPath, 8, (at) => bead(at.at, 0.014, MAG, 1.4));
>>>>>>> REPLACE

<<<<<<< SEARCH
return b.root;
=======
return b.root;
}
>>>>>>> REPLACE