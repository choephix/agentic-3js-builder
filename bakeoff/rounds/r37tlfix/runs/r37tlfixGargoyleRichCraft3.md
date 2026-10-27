The errors come from nullable `chain.tip` values; assert the constructed chains have tips before using them as parents, bones, or attachment frames.

```text
<<<<<<< SEARCH
    { parent: spine.tip, names: ["neck1", "neck2", "neckTip"], role: "neck" },
=======
    { parent: spine.tip!, names: ["neck1", "neck2", "neckTip"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const shoulderL = b.joint("shoulderL", { parent: spine.tip, at: [0.27, 1.4, 0.24], dir: [0.65, 0.15, 0.25], role: "wing" });
  const shoulderR = b.joint("shoulderR", { parent: spine.tip, at: [-0.27, 1.4, 0.24], dir: [-0.65, 0.15, 0.25], role: "wing" });
=======
  const shoulderL = b.joint("shoulderL", { parent: spine.tip!, at: [0.27, 1.4, 0.24], dir: [0.65, 0.15, 0.25], role: "wing" });
  const shoulderR = b.joint("shoulderR", { parent: spine.tip!, at: [-0.27, 1.4, 0.24], dir: [-0.65, 0.15, 0.25], role: "wing" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = s > 0 ? hindL.tip : hindR.tip;
=======
    const foot = (s > 0 ? hindL.tip : hindR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = s > 0 ? armL.tip : armR.tip;
=======
    const hand = (s > 0 ? armL.tip : armR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: s > 0 ? shoulderL : shoulderR, names: s > 0 ? ["wingLowerL1", "wingLowerL2", "wingLowerL3", "wingLowerLTip"] : ["wingLowerR1", "wingLowerR2", "wingLowerR3", "wingLowerRTip"], role: "wing" },
=======
      parent: s > 0 ? shoulderL : shoulderR, names: s > 0 ? ["wingLowerL1", "wingLowerL2", "wingLowerL3", "wingLowerLTip"] : ["wingLowerR1", "wingLowerR2", "wingLowerR3", "wingLowerRTip"], role: "wing" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.tip!,
>>>>>>> REPLACE
```