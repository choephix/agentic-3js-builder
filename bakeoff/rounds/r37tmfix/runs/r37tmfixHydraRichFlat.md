The errors come from nullable joint references (`tip`/`bone`) being passed where the SDK requires a definite joint; asserting those handles as non-null resolves the overload as well.

<<<<<<< SEARCH
        bone: leg.tip,
        at: ankle,
=======
        bone: leg.tip!,
        at: ankle,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
        name: `${legInfo.name}Claw${c + 2}`,
=======
        bone: leg.tip!,
        name: `${legInfo.name}Claw${c + 2}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: dorsal.bone,
        name: `neck${h + 1}Ridge${r}`,
=======
        bone: dorsal.bone!,
        name: `neck${h + 1}Ridge${r}`,
>>>>>>> REPLACE