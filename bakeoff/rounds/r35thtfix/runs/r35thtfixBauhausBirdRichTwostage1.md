Cause: several chain `.tip` properties are typed as `Joint | null`; the model uses them as guaranteed tip joints, so they need non-null assertions.

```text
<<<<<<< SEARCH
  const chest = spine.tip;
=======
  const chest = spine.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: chest,
=======
      parent: chest,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: legL.tip,
=======
      parent: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: legL.tip,
=======
      parent: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: legR.tip,
=======
      parent: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: legR.tip,
=======
      parent: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: neck.tip,
=======
      bone: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: legL.tip,
=======
        bone: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: legR.tip,
=======
        bone: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: s > 0 ? legL.tip : legR.tip,
=======
        bone: s > 0 ? legL.tip! : legR.tip!,
>>>>>>> REPLACE```