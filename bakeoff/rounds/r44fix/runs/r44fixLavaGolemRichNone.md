The cause: `BASALT_LIGHT` was built with `mix(...)`, which returns an `Rgb` tuple, not a colour string or paint, so `color: BASALT_LIGHT` in `b.spike` fails the typecheck and throws at runtime. The fix is to make it a plain colour string.

<<<<<<< SEARCH
const BASALT_LIGHT = mix("#5b5568", "#7a7084", 0.5);
=======
const BASALT_LIGHT = "#686076";
>>>>>>> REPLACE