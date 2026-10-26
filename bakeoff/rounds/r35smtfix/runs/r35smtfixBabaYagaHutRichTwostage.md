Cause: `b.cards([], leaf, {})` in `addHerbBundles` is a leftover stub with an empty frame list and no `size`, so `cards` fails on the missing option (the type error and the runtime crash); it adds nothing, so I remove it.

<<<<<<< SEARCH
    b.cards([], leaf, {});
=======
    void leaf;
>>>>>>> REPLACE