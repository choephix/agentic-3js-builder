Cause: nullable chain tips were passed as bones or dereferenced, and the crankshaft used a nonexistent fourth joint; several surface/sprout inputs also needed non-null assertions and `Vector3` points.

<<<<<<< SEARCH
        { bone: chain.tip },
=======
        { bone: chain.tip! },
>>>>>>> REPLACE

<<<<<<< SEARCH
      hub([side * 0.13, 1.02, z], 0.045, 0.035, CHARCOAL, crank.joints[Math.min(i, 3)]);
=======
      hub([side * 0.13, 1.02, z], 0.045, 0.035, CHARCOAL, crank.joints[Math.min(i, crank.joints.length - 1)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: mast.tip,
=======
      bone: mast.joints[mast.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.surface(body).around([0, 1.03, 1.2]).at(35, 8),
=======
    b.surface(body).around(new THREE.Vector3(0, 1.03, 1.2)).at(35, 8)!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.surface(body).around([0, 1.03, 1.2]).at(-35, 8),
=======
    b.surface(body).around(new THREE.Vector3(0, 1.03, 1.2)).at(-35, 8)!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  pin(feelerL.chain!.tip.at, 0.028, TURQUOISE, feelerL.chain!.tip);
=======
  pin(feelerL.chain!.tip!.at, 0.028, TURQUOISE, feelerL.chain!.tip!);
>>>>>>> REPLACE

<<<<<<< SEARCH
  pin(feelerR.chain!.tip.at, 0.028, TURQUOISE, feelerR.chain!.tip);
=======
  pin(feelerR.chain!.tip!.at, 0.028, TURQUOISE, feelerR.chain!.tip!);
>>>>>>> REPLACE