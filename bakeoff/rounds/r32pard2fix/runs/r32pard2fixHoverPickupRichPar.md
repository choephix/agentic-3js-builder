Cause: in `buildBed`, a stray leftover line calls `b.cards([], netTex)` with no options object, so `options.size` is read from `undefined`. The cargo net is already drawn by the two planes that follow, so I removed the call.

<<<<<<< SEARCH
  b.cards([THREE.Object3D].length ? [] : [], netTex);
=======
>>>>>>> REPLACE