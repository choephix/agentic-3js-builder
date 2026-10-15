Cause: the leg chains are created in a loop over front and hind legs, and both name their tip joint `foot${S}`, so the second leg on each side collides with the first ("footL" already exists).

The fix gives the tip joints unique names, `footF${S}` for front legs and `footH${S}` for hind legs.

<<<<<<< SEARCH
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `foot${S}`]
        : [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`];
=======
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `footF${S}`]
        : [`hip${S}`, `knee${S}`, `hock${S}`, `footH${S}`];
>>>>>>> REPLACE