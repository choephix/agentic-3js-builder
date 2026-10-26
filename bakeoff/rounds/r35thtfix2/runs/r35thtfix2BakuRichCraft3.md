Cause: `neck` has three span joints and no tip joint because its `names` list matches the three path spans, so `neck.tip` is `null`.

<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.tip.at,
    dir: [0, -0.02, 1],
=======
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.joints[neck.joints.length - 1].at,
    dir: [0, -0.02, 1],
>>>>>>> REPLACE