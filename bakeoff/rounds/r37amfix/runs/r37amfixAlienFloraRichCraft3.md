Cause: nullable chain tips were passed as bone references, and `glow()` was applied to cel-painted parts, which the glow kit rejects.

```text
<<<<<<< SEARCH
      const node = b.part(new THREE.SphereGeometry(0.035 - j * 0.004, 7, 5), AQUA, {
=======
      const node = b.part(new THREE.SphereGeometry(0.035 - j * 0.004, 7, 5), GLOW_CYAN, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const vein = b.rod(leafAt, leafTip, 0.009, {
      color: VEIN,
=======
    const vein = b.rod(leafAt, leafTip, 0.009, {
      color: GLOW_CYAN,
>>>>>>> REPLACE

<<<<<<< SEARCH
      const v1 = b.rod(c, left, 0.0045, { color: AQUA, bone: leafAt.bone, name: `leafVeinL${i}_${k}` });
      const v2 = b.rod(c, right, 0.0045, { color: AQUA, bone: leafAt.bone, name: `leafVeinR${i}_${k}` });
=======
      const v1 = b.rod(c, left, 0.0045, { color: GLOW_CYAN, bone: leafAt.bone, name: `leafVeinL${i}_${k}` });
      const v2 = b.rod(c, right, 0.0045, { color: GLOW_CYAN, bone: leafAt.bone, name: `leafVeinR${i}_${k}` });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const crownBulb = b.part(new THREE.SphereGeometry(0.105, 12, 9), GLOW_PINK, {
=======
    const crownBulb = b.part(new THREE.SphereGeometry(0.105, 12, 9), GLOW_PINK, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: crown.tip,
=======
    bone: crown.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: MAGENTA,
=======
        color: GLOW_PINK,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: t.chain.tip,
=======
      bone: t.chain.tip!,
>>>>>>> REPLACE
```