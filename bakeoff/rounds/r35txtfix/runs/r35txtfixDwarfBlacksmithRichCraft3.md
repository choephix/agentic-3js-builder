Cause: the SDK types `Chain.tip` and `ChainPoint.bone` as nullable, so the existing module must assert those handles are present when passing them as `parent`/`bone` or dereferencing them.

```text
<<<<<<< SEARCH
      bone: armL.at(0.48).bone,
=======
      bone: armL.at(0.48).bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armR.at(0.48).bone,
=======
      bone: armR.at(0.48).bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legL.at(0.38).bone,
=======
      bone: legL.at(0.38).bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legR.at(0.38).bone,
=======
      bone: legR.at(0.38).bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = side > 0 ? armL.tip : armR.tip;
    const handPoint = hand.at.clone();
=======
    const hand = (side > 0 ? armL.tip : armR.tip)!;
    const handPoint = hand.at.clone();
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: hand,
=======
          parent: hand!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: hand,
=======
        parent: hand!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = side > 0 ? legL.tip : legR.tip;
    const footPoint = foot.at.clone();
=======
    const foot = (side > 0 ? legL.tip : legR.tip)!;
    const footPoint = foot.at.clone();
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: foot,
=======
          parent: foot!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: foot,
=======
      parent: foot!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      arm.tip.at,
=======
      arm.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      arm.tip,
=======
      arm.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      leg.tip,
=======
      leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip.at.x;
=======
      armR.tip!.at.x;
>>>>>>> REPLACE

<<<<<<< SEARCH
    armR.tip,
=======
    armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.tip!,
>>>>>>> REPLACE
```