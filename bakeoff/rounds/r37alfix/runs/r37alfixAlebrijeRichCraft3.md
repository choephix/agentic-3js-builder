Cause: chains’ `.tip` is nullable unless the chain explicitly includes a tip joint; the code also passed a nullable tip as a parent/bone and supplied an unsupported second argument to `Chain.at`.

```ts
<<<<<<< SEARCH
    { parent: neck.tip, names: ["neck", "neckTip"], role: "neck" },
=======
    { parent: spine.tip!, names: ["neck", "neckTip", "neckEnd"], role: "neck" },
>>>>>>> REPLACE
<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.34, 0.78], dir: [0, 0, 1], role: "head", group: "head" });
=======
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.34, 0.78], dir: [0, 0, 1], role: "head", group: "head" });
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip!,
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), GOLD, wing.at(0.5, 0), { group: "wingDetails" });
=======
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), GOLD, wing.at(0.5), { group: "wingDetails" });
>>>>>>> REPLACE
```