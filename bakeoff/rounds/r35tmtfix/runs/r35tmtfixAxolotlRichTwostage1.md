Cause: `spine.tip` is `null` because the chain has one name per span and therefore no tip joint; use its final span joint as the head’s parent.

<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.76, 0.43],
=======
  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 0.76, 0.43],
>>>>>>> REPLACE