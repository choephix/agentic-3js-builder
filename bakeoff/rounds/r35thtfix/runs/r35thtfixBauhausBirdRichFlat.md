```ts
// Cause: Chain.tip is nullable, and `flat`/`section` were passed to overloads that do not accept those options on the affected helpers.

<<<<<<< SEARCH
      spine.tip.at,
=======
      spine.joints[spine.joints.length - 1].at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: neck.tip.at,
=======
    at: neck.joints[neck.joints.length - 1].at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: side > 0 ? legL.tip : legR.tip,
=======
      parent: side > 0 ? legL.joints[legL.joints.length - 1] : legR.joints[legR.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      toe.tip.at,
=======
      toe.joints[toe.joints.length - 1].at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      section: "circle",
=======
      section: "circle",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      section: "circle",
=======
      section: "circle",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    });
=======
    });
>>>>>>> REPLACE
```