The cause is the forearm spring coil: its `spiral` was given the same point for `center` and `from`, so the start sat on the axis. The fix is to put `center` on the piston line and start `from` 1.3 cm off it.

<<<<<<< SEARCH
      spiral(f0(e.clone().addScaledVector(fo, 0.07), sideF, 0.042).add(sideF.clone().multiplyScalar(0.013)), f0(e.clone().addScaledVector(fo, 0.07), sideF, 0.042).add(sideF.clone().multiplyScalar(0.013)), fo, { turns: 4, pitch: 0.016, r1: 0.013 }),
=======
      spiral(f0(e.clone().addScaledVector(fo, 0.07), sideF, 0.042), f0(e.clone().addScaledVector(fo, 0.07), sideF, 0.042).add(sideF.clone().multiplyScalar(0.013)), fo, { turns: 4, pitch: 0.016, r1: 0.013 }),
>>>>>>> REPLACE