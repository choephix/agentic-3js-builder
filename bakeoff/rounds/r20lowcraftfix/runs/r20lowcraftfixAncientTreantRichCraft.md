`mossCover` calls `b.surface(target)`, but two call sites pass it a `Surface` (`b.surface(leg.joints[0])` and `b.surface(arm.joints[0])`), and `b.surface` rejects a Surface as input. Passing the joints directly fixes both.

<<<<<<< SEARCH
    mossCover(b.surface(leg.joints[0]), 6, 40 + (s > 0 ? 1 : 2));
=======
    mossCover(leg.joints[0], 6, 40 + (s > 0 ? 1 : 2));
>>>>>>> REPLACE

<<<<<<< SEARCH
    mossCover(b.surface(arm.joints[0]), 8, 60 + (s > 0 ? 1 : 2));
=======
    mossCover(arm.joints[0], 8, 60 + (s > 0 ? 1 : 2));
>>>>>>> REPLACE