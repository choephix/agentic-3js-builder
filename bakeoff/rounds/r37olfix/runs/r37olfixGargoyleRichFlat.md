Cause: nullable `Chain.tip` values were passed as parents/bones and dereferenced without narrowing; the SDK requires a definite `Joint`/`Chain`, so assert the known terminal joints with `!`.

```text
<<<<<<< SEARCH
    { parent: spine.tip, names: ["neck1", "neck2"], role: "neck" },
=======
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = s > 0 ? armL.tip : armR.tip;
    const foot = s > 0 ? legL.tip : legR.tip;
=======
    const hand = (s > 0 ? armL.tip : armR.tip)!;
    const foot = (s > 0 ? legL.tip : legR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
        [x, 0.90, 0.58],
        [0, -0.35, 0.94],
        0.16,
        0.027,
        { color: EDGE, bone: hand, name: `finger${s}_${i}`, group: "claws" },
=======
        [x, 0.90, 0.58],
        [0, -0.35, 0.94],
        0.16,
        0.027,
        { color: EDGE, bone: hand, name: `finger${s}_${i}`, group: "claws" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: tail.tip,
=======
    bone: tail.tip!,
>>>>>>> REPLACE
```