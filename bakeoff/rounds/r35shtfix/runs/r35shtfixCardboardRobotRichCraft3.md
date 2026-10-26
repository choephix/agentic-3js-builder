`arm.tip` is typed `Joint | null`, but `bone:` does not accept null. Non-null assertions fix both lines.

<<<<<<< SEARCH
    b.rod([s * 0.492, y, 0], [s * 0.515, y, 0], 0.03, WHITE, { sides: 8, bone: arm.tip });
    b.rod([s * 0.5, y, 0], [s * 0.506, y, 0], 0.0315, RED, { sides: 8, bone: arm.tip });
=======
    b.rod([s * 0.492, y, 0], [s * 0.515, y, 0], 0.03, WHITE, { sides: 8, bone: arm.tip! });
    b.rod([s * 0.5, y, 0], [s * 0.506, y, 0], 0.0315, RED, { sides: 8, bone: arm.tip! });
>>>>>>> REPLACE