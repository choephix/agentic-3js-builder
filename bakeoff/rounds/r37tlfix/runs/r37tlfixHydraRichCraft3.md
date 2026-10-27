```ts
// Cause: nullable chain.tip values were used as parent/bone references, and b.along callbacks accept only one inferred frame parameter.

<<<<<<< SEARCH
        bone: leg.tip,
        at: foot,
=======
        bone: leg,
        at: foot,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: neck.tip,
      at: [x, hy, hz],
=======
      parent: neck,
      at: [x, hy, hz],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.along(neckTube, 4, (p, j) =>
      b.spike(p, p, 0.10 + (j % 2) * 0.025, 0.028, { color: HORN, caps: "point" }),
    );
=======
    b.along(neckTube, 4, (p) =>
      b.spike(p, p, 0.10, 0.028, { color: HORN, caps: "point" }),
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: neck.tip,
      at: [x, hy, hz],
=======
      bone: neck,
      at: [x, hy, hz],
>>>>>>> REPLACE
```