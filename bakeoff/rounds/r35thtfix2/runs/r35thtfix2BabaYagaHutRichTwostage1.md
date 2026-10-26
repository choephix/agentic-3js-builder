The errors occur because `Chain.tip` is nullable in the SDK type, even though these chains explicitly include tip joints.

<<<<<<< SEARCH
        legL.tip.at,
=======
        legL.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: legL.tip,
=======
        parent: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        legR.tip.at,
=======
        legR.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: legR.tip,
=======
        parent: legR.tip!,
>>>>>>> REPLACE