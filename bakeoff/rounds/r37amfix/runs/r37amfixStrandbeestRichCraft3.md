Cause: `nearestJoint()` and `chain.tip` are nullable, while `parent` and `bone` accept `JointRef | undefined`; assert these joints are present.

<<<<<<< SEARCH
          parent: thorax.nearestJoint
            ? thorax.nearestJoint(hip)
            : thorax.joints[Math.min(i, thorax.joints.length - 1)],
=======
          parent: thorax.nearestJoint(hip)!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.tip!,
>>>>>>> REPLACE