Cause: nullable frame/joint handles (`bone`/`tip`) were passed where the SDK requires a definite `JointRef`; the frame position already carries the needed bone.

<<<<<<< SEARCH
      bone: p0.bone,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p1.bone,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p2.bone,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p3.bone,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip, name: `sandFoot${label}${i}`, group: "feet" },
=======
      name: `sandFoot${label}${i}`, group: "feet" },
>>>>>>> REPLACE