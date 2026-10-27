Cause: the branch chains had no tip joint because their `names` arrays only covered span joints, while several sweep/rod calls passed unsupported options such as `role`; the nullable `tip` handles therefore failed at runtime.

```text
<<<<<<< SEARCH
      names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "crown"],
=======
      names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "crown", "trunkTip"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      names: ["branchLBase", "branchLMid", "branchLTip"],
=======
      names: ["branchLBase", "branchLMid", "branchLTip", "branchLEnd"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      names: ["branchRBase", "branchRMid", "branchRTip"],
=======
      names: ["branchRBase", "branchRMid", "branchRTip", "branchREnd"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      names: ["branchBackBase", "branchBackMid", "branchBackTip"],
=======
      names: ["branchBackBase", "branchBackMid", "branchBackTip", "branchBackEnd"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      names: ["crownBranchBase", "crownBranchMid", "crownBranchTip"],
=======
      names: ["crownBranchBase", "crownBranchMid", "crownBranchTip", "crownBranchEnd"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: trunkPaint, caps: "round", role: "tentacle" },
=======
    { color: trunkPaint, caps: "round" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: trunkPaint, caps: "round", role: "tentacle" },
=======
    { color: trunkPaint, caps: "round" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: trunkPaint, caps: "round", role: "tentacle" },
=======
    { color: trunkPaint, caps: "round" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: trunkPaint,
    sides: 7,
    caps: "round",
    role: "spine",
=======
    color: trunkPaint,
    sides: 7,
    caps: "round",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: trunkPaint,
      sides: 7,
      caps: "round",
      role: "arm",
=======
      color: trunkPaint,
      sides: 7,
      caps: "round",
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: VEIN_HOT, caps: "round", sides: 6, role: "spine" },
=======
      { color: VEIN_HOT, caps: "round", sides: 6 },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: VEIN, sides: 6, caps: "round", role: "tentacle", name },
=======
      { color: VEIN, sides: 6, caps: "round", name },
>>>>>>> REPLACE
```