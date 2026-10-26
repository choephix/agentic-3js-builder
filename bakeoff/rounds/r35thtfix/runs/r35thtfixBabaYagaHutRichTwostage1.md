The errors come from `Chain.tip` being nullable in the SDK types; assert the explicitly named tip joints are present before using them as points or bones.

```text
<<<<<<< SEARCH
      b.spike(actualToe.tip, actualToe.tip, 0.11, 0.021, {
=======
      b.spike(actualToe.tip!, actualToe.tip!, 0.11, 0.021, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legL.tip,
=======
      bone: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: legL.tip.at,
=======
      at: legL.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(actualToe.tip, actualToe.tip, 0.11, 0.021, {
=======
      b.spike(actualToe.tip!, actualToe.tip!, 0.11, 0.021, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legR.tip,
=======
      bone: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: legR.tip.at,
=======
      at: legR.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: leg.tip.at,
=======
      at: leg.tip!.at,
>>>>>>> REPLACE
```