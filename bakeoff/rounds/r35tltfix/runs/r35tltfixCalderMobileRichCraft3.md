Cause: `Chain.tip` and `Sprout.chain` are nullable in the SDK types, but these appendages are created with tip joints; non-null assertions are needed wherever their tips are used as bones.

```text
<<<<<<< SEARCH
      bone: armA.tip,
=======
      bone: armA.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armA.tip,
=======
    bone: armA.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: dropA.chain!.tip,
=======
    bone: dropA.chain!.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armB.tip,
=======
    bone: armB.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: dropC.chain!.tip,
=======
    bone: dropC.chain!.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armB.tip,
=======
      bone: armB.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: lowerArm.tip,
=======
    bone: lowerArm.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: dropD.chain!.tip,
=======
    bone: dropD.chain!.tip!,
>>>>>>> REPLACE
```