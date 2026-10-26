Cause: `neck.tip` is nullable and was passed as a parent/position without narrowing; the mane loop also referenced `tube` without destructuring it.

<<<<<<< SEARCH
    const head = b.joint(`head${i + 1}`, {
      parent: neck.tip,
      at: neck.tip.at,
=======
    const neckTip = neck.joints[neck.joints.length - 1];
    const head = b.joint(`head${i + 1}`, {
      parent: neckTip,
      at: neckTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
  necks.forEach(({ head, jaw, spec }, i) => {
=======
  necks.forEach(({ head, jaw, tube, spec }, i) => {
>>>>>>> REPLACE