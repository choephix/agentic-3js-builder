Cause: each leg chain has three span joints and no tip joint, so `leg.chain.tip` is `null` when used as a bone.

```text
<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[2],
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: CLAW,
        bone: leg.chain.tip,
=======
        color: CLAW,
        bone: leg.chain.joints[2],
>>>>>>> REPLACE
```