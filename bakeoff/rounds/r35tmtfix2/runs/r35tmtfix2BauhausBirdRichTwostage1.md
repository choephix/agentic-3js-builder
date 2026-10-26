Cause: the SDK types `parent` and `bone` as non-null `JointRef` values, while nullable chain tips were passed directly.

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
    bone: tail.tip,
=======
    bone: tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: s > 0 ? legL.tip : legR.tip, name: s > 0 ? "toeFrontL" : "toeFrontR", group: "feet" },
=======
      { bone: s > 0 ? legL.tip! : legR.tip!, name: s > 0 ? "toeFrontL" : "toeFrontR", group: "feet" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: s > 0 ? legL.tip : legR.tip, name: s > 0 ? "toeSideL" : "toeSideR", group: "feet" },
=======
      { bone: s > 0 ? legL.tip! : legR.tip!, name: s > 0 ? "toeSideL" : "toeSideR", group: "feet" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip! : legR.tip!,
=======
      bone: s > 0 ? legL.tip! : legR.tip!,
>>>>>>> REPLACE