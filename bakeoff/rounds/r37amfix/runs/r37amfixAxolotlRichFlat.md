Cause: `body.tip` is nullable because the chain has one joint per span and no extra tip joint; passing it as `parent` supplies `null`.

<<<<<<< SEARCH
    parent: body.tip,
=======
    parent: body.joints[body.joints.length - 1],
>>>>>>> REPLACE