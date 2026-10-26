Cause: several values were inferred as narrow literal unions, nullable joint/tip handles were passed without narrowing, and the stage-two additions referenced an undefined `PALETTE` alias.

<<<<<<< SEARCH
const C = {
  body: "#d86b32",
=======
const C = {
  body: "#d86b32",
>>>>>>> REPLACE

<<<<<<< SEARCH
} as const;

const fract = (x: number) => x - Math.floor(x);
=======
} as const;

const PALETTE = C;
const fract = (x: number) => x - Math.floor(x);
>>>>>>> REPLACE

<<<<<<< SEARCH
  let color = panel % 2 === 0 ? C.turquoise : C.deepTeal;
=======
  let color: string = panel % 2 === 0 ? C.turquoise : C.deepTeal;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const colors = [C.body, C.magenta, C.turquoise, C.cream];
=======
  const colors: string[] = [C.body, C.magenta, C.turquoise, C.cream];
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: wingL,
=======
      bone: wingL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: wingR,
=======
      bone: wingR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: leg.tip.at,
=======
        at: leg.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: leg.tip.at,
=======
      at: leg.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip.moved([-0.13, 0, 0]),
=======
    tail.tip!.moved([-0.13, 0, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip,
=======
    tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip.moved([0, 0.03, 0]),
=======
    tail.tip!.moved([0, 0.03, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip,
=======
    tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip.moved([0.13, 0, 0]),
=======
    tail.tip!.moved([0.13, 0, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip,
=======
    tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: neck.tip,
=======
      bone: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    neck.tip,
=======
    neck.tip!,
>>>>>>> REPLACE