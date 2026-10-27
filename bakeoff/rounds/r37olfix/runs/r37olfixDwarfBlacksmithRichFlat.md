Cause: a nullable chain tip was passed as a bone, and the spark positions were inferred as `number[]` instead of SDK-compatible 3-tuples.

<<<<<<< SEARCH
  sphere(0.105, SKIN_LIGHT, armL.tip!.at, armL.tip, "fistL", [1.1, 0.9, 1.15]);
=======
  sphere(0.105, SKIN_LIGHT, armL.tip!.at, armL.tip!, "fistL", [1.1, 0.9, 1.15]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  sphere(0.105, SKIN_LIGHT, armR.tip!.at, armR.tip, "fistR", [1.1, 0.9, 1.15]);
=======
  sphere(0.105, SKIN_LIGHT, armR.tip!.at, armR.tip!, "fistR", [1.1, 0.9, 1.15]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const sparks = [
=======
  const sparks: [number, number, number][] = [
>>>>>>> REPLACE