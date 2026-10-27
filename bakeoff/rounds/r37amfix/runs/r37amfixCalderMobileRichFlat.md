```ts
// Cause: Chain.at() returns a ChainPoint; use its `.at` Vector3 for geometry placement, and clone that Vector3 rather than the ChainPoint itself.

<<<<<<< SEARCH
    stringBlue.at(1),
=======
    stringBlue.at(1).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
  smallDisc(stringRed.at(1).clone().add(new THREE.Vector3(0.12, 0.02, 0.015)), 0.045, CREAM, [0, 0, 1], stringRed.joints[1]);
=======
  smallDisc(stringRed.at(1).at.clone().add(new THREE.Vector3(0.12, 0.02, 0.015)), 0.045, CREAM, [0, 0, 1], stringRed.joints[1]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    stringYellow.at(1),
=======
    stringYellow.at(1).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    stringYellow.at(1).clone().add(new THREE.Vector3(-0.04, 0.04, 0.02)),
=======
    stringYellow.at(1).at.clone().add(new THREE.Vector3(-0.04, 0.04, 0.02)),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const whiteAt = stringWhite.at(1);
=======
  const whiteAt = stringWhite.at(1).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
  disk(stringCenter.at(1), 0.145, 0.026, GREEN, [0.08, 0, 1], stringCenter.joints[1]);
=======
  disk(stringCenter.at(1).at, 0.145, 0.026, GREEN, [0.08, 0, 1], stringCenter.joints[1]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    stringCenter.at(1).clone().add(new THREE.Vector3(0.0, -0.03, 0.02)),
=======
    stringCenter.at(1).at.clone().add(new THREE.Vector3(0.0, -0.03, 0.02)),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leftEnd = leftUpper.at(1);
=======
  const leftEnd = leftUpper.at(1).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
  disk(leftEnd.clone().add(new THREE.Vector3(0.02, 0.02, 0)), 0.1, 0.02, ORANGE, [0.2, 0.9, 0.28], leftUpper.joints[2]);
=======
  disk(leftEnd.clone().add(new THREE.Vector3(0.02, 0.02, 0)), 0.1, 0.02, ORANGE, [0.2, 0.9, 0.28], leftUpper.joints[2]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rightEnd = rightUpper.at(1);
=======
  const rightEnd = rightUpper.at(1).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
  triangle(rightEnd.clone().add(new THREE.Vector3(-0.04, -0.03, 0)), 0.23, 0.28, BLUE, [0.08, 0.05, 1], rightUpper.joints[2]);
=======
  triangle(rightEnd.clone().add(new THREE.Vector3(-0.04, -0.03, 0)), 0.23, 0.28, BLUE, [0.08, 0.05, 1], rightUpper.joints[2]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leftLowerEnd = leftLower.at(1);
=======
  const leftLowerEnd = leftLower.at(1).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
    leftLowerEnd.clone().add(new THREE.Vector3(0.02, -0.02, 0.02)),
=======
    leftLowerEnd.clone().add(new THREE.Vector3(0.02, -0.02, 0.02)),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rightLowerEnd = rightLower.at(1);
=======
  const rightLowerEnd = rightLower.at(1).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
  disk(rightLowerEnd.clone().add(new THREE.Vector3(-0.05, 0.01, 0.02)), 0.12, 0.02, WHITE, [0.2, 0.3, 0.93], rightLower.joints[2]);
=======
  disk(rightLowerEnd.clone().add(new THREE.Vector3(-0.05, 0.01, 0.02)), 0.12, 0.02, WHITE, [0.2, 0.3, 0.93], rightLower.joints[2]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  diamond(rightLowerEnd.clone().add(new THREE.Vector3(0.08, -0.08, 0.03)), 0.16, 0.18, RED, [1, 0, 0], rightLower.joints[2]);
=======
  diamond(rightLowerEnd.clone().add(new THREE.Vector3(0.08, -0.08, 0.03)), 0.16, 0.18, RED, [1, 0, 0], rightLower.joints[2]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const forkAt = centerFork.at(0.9);
=======
  const forkAt = centerFork.at(0.9).at;
>>>>>>> REPLACE
```