Cause: in `buildLightTendrils`, `ringY`, `ringR` and `bottomMin` came from placeholder mount entries that are `[0,0,0]` arrays, so the tendril start `[x, ringY, z]` held a nested array instead of three numbers.

<<<<<<< SEARCH
  const ringY = M.tendrilRingY;
  const ringR = M.tendrilRingRadius;
  const bottomMin = M.tendrilBottomY;
=======
  const ringY = 2.3;
  const ringR = 0.25;
  const bottomMin = 0.7;
>>>>>>> REPLACE