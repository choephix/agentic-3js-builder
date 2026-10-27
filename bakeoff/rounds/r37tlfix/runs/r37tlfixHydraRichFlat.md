Cause: `neck.tip` is nullable because the chain has no explicit tip joint; passing it as `parent` caused both the type error and runtime failure. Replace it with the chain itself, which is a valid `JointRef`.

<<<<<<< SEARCH
    const head = b.joint(`head${spec.id}`, {
      parent: neck.tip,
      at: spec.head,
=======
    const head = b.joint(`head${spec.id}`, {
      parent: neck,
      at: spec.head,
>>>>>>> REPLACE