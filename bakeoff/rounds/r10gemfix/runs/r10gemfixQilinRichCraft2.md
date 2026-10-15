The hoof parts with `texture: HOOF_RUNE_TEX` were passed `CEL_GOLD` (a cel `Paint`) instead of a colour string tint.

```ts
<<<<<<< SEARCH
    // Split Cloven Hoof (Medial & Lateral Claws)
    for (const toeS of [1, -1]) {
      const toePos = pasternPt.clone().add(new THREE.Vector3(toeS * 0.020, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.022, 0.055, 6), CEL_GOLD, {
        bone: legF.tip ?? legF.joints[2],
        at: toePos,
        rotation: [-20, toeS * 10, 0],
        texture: HOOF_RUNE_TEX,
        group: `legF${side}`,
      });
    }
=======
    // Split Cloven Hoof (Medial & Lateral Claws)
    for (const toeS of [1, -1]) {
      const toePos = pasternPt.clone().add(new THREE.Vector3(toeS * 0.020, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.022, 0.055, 6), "#fcd34d", {
        bone: legF.tip ?? legF.joints[2],
        at: toePos,
        rotation: [-20, toeS * 10, 0],
        texture: HOOF_RUNE_TEX,
        group: `legF${side}`,
      });
    }
>>>>>>> REPLACE
<<<<<<< SEARCH
    // Split Cloven Hoof
    for (const toeS of [1, -1]) {
      const toePos = pasternPt.clone().add(new THREE.Vector3(toeS * 0.021, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.023, 0.055, 6), CEL_GOLD, {
        bone: legH.tip ?? legH.joints[2],
        at: toePos,
        rotation: [-20, toeS * 10, 0],
        texture: HOOF_RUNE_TEX,
        group: `legH${side}`,
      });
    }
=======
    // Split Cloven Hoof
    for (const toeS of [1, -1]) {
      const toePos = pasternPt.clone().add(new THREE.Vector3(toeS * 0.021, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.023, 0.055, 6), "#fcd34d", {
        bone: legH.tip ?? legH.joints[2],
        at: toePos,
        rotation: [-20, toeS * 10, 0],
        texture: HOOF_RUNE_TEX,
        group: `legH${side}`,
      });
    }
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(sashPath, (t) => [0.038 * (1 - 0.25 * t), 0.005], {
      bone: chest,
      color: CEL_RED_SILK,
      texture: SASH_TEX,
      group: "sash",
    });
=======
    b.sweep(sashPath, (t) => [0.038 * (1 - 0.25 * t), 0.005], {
      bone: chest,
      color: CEL_RED_SILK,
      group: "sash",
    });
>>>>>>> REPLACE
```