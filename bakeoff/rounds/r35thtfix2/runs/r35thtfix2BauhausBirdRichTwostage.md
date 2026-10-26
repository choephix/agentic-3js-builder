The errors come from nullable chain endpoints (`tip`/`joints[0]`) being passed where the SDK requires a definite `JointRef`.

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
      bone: tail.joints[0],
=======
      bone: tail.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[0],
=======
      bone: tail.joints[0]!,
>>>>>>> REPLACE