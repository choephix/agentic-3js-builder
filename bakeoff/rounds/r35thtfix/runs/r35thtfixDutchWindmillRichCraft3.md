Cause: surface queries return `Hit | null`; these placements need non-null assertions after confirming the intended surface hits exist.

```text
<<<<<<< SEARCH
  const doorHit = towerSurface.around([0, 0.44, 0]).at(0, 0);

  b.decal(tower, DOOR_TEXTURE, {
    at: doorHit.at,
    dir: doorHit.n,
=======
  const doorHit = towerSurface.around([0, 0.44, 0]).at(0, 0)!;

  b.decal(tower, DOOR_TEXTURE, {
    at: doorHit.at,
    dir: doorHit.n,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const plaqueHit = towerSurface.around([0, 1.18, 0]).at(0, 0);
  b.decal(tower, PLAQUE_TEXTURE, {
    at: plaqueHit.at,
    dir: plaqueHit.n,
=======
  const plaqueHit = towerSurface.around([0, 1.18, 0]).at(0, 0)!;
  b.decal(tower, PLAQUE_TEXTURE, {
    at: plaqueHit.at,
    dir: plaqueHit.n,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const ventHit = towerSurface.around([side * 0.1, 1.22, 0]).at(side * 68, 6);
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), WOOD_DARK, ventHit, {
=======
    const ventHit = towerSurface.around([side * 0.1, 1.22, 0]).at(side * 68, 6)!;
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), WOOD_DARK, ventHit, {
>>>>>>> REPLACE
```