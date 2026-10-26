```ts
Cause: the leg tip is nullable, chain paths require numeric arrays rather than Vector3 values, and the spike overload needs tuple-typed point arguments.

<<<<<<< SEARCH
    parent,
=======
    parent: NonNullable<typeof legL.tip>,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const footL = legL.tip;
  const footR = legR.tip;
=======
  const footL = legL.tip!;
  const footR = legR.tip!;
  const footLP: [number, number, number] = [footL.at.x, footL.at.y, footL.at.z];
  const footRP: [number, number, number] = [footR.at.x, footR.at.y, footR.at.z];
>>>>>>> REPLACE

<<<<<<< SEARCH
    footL.at,
=======
    footLP,
>>>>>>> REPLACE

<<<<<<< SEARCH
    footR.at,
=======
    footRP,
>>>>>>> REPLACE

<<<<<<< SEARCH
        footL.at,
=======
        footLP,
>>>>>>> REPLACE

<<<<<<< SEARCH
        footR.at,
=======
        footRP,
>>>>>>> REPLACE

<<<<<<< SEARCH
        [x, p[1], z],
        [x + (j - 1) * 0.025, p[1] + 0.075 + j * 0.014, z],
=======
        [x, p[1], z] as [number, number, number],
        [x + (j - 1) * 0.025, p[1] + 0.075 + j * 0.014, z] as [number, number, number],
>>>>>>> REPLACE
```