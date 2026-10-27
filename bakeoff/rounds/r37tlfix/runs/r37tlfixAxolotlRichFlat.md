Cause: `chain.tip` and some chain-derived joints are typed as nullable, but the model guarantees a tip joint for these named chains; the nullable values were passed as parents/bones and then dereferenced without narrowing.

```text
<<<<<<< SEARCH
    parent: spine.tip,
    count: 2,
=======
    parent: spine.tip!,
    count: 2,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
    at: [0, 0.61, 0.43],
=======
    parent: neck.tip!,
    at: [0, 0.61, 0.43],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "handL"],
=======
      parent: spine.tip!,
      names: ["shoulderL", "elbowL", "handL"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "handR"],
=======
      parent: spine.tip!,
      names: ["shoulderR", "elbowR", "handR"],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
        at: chain.tip.at,
=======
        bone: chain.tip!,
        at: chain.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = chain.tip;
=======
    const hand = chain.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: hand,
        at: hand.at,
=======
        bone: hand,
        at: hand.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
        hand,
        [hand.at.x + x, hand.at.y - 0.025, hand.at.z + 0.055],
=======
        hand,
        [hand.at.x + x, hand.at.y - 0.025, hand.at.z + 0.055],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
      at: tail.tip.at,
=======
      bone: tail.tip!,
      at: tail.tip!.at,
>>>>>>> REPLACE
```