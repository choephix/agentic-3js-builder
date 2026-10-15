Geometry parts for the dais were being added before creating the root joint `hips`, which caused `nearestJoint` to throw.

## Edits

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // 1. Staged Pedestal / Altar Dais Base (stands firmly on y = 0)
  // ---------------------------------------------------------------------------
=======
  // ---------------------------------------------------------------------------
  // 1. Creature Skeleton (Phoenix Rig Architecture)
  // ---------------------------------------------------------------------------
  // Root Joint: Hips / Pelvis
  const hips = b.joint("hips", { at: [0, 0.92, -0.06], role: "spine" });

  // Spine joints
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.08, 0.02], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.26, 0.08], role: "spine" });

  // Neck joints (graceful S-curve)
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 1.42, 0.15], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 1.56, 0.20], role: "neck" });

  // Head joint
  const head = b.joint("head", {
    parent: neck2,
    at: [0, 1.68, 0.25],
    dir: [0, 0.08, 0.99],
    role: "head",
    group: "head",
  });

  // Jaw joint (hinge so the beak can open!)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.65, 0.29],
    dir: [0, -0.15, 0.98],
    role: "jaw",
    group: "head",
  });

  // Tail root joint
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.88, -0.22], role: "tail", group: "tail" });

  // ---------------------------------------------------------------------------
  // 2. Staged Pedestal / Altar Dais Base (stands firmly on y = 0)
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // 2. Creature Skeleton (Phoenix Rig Architecture)
  // ---------------------------------------------------------------------------
  // Root Joint: Hips / Pelvis
  const hips = b.joint("hips", { at: [0, 0.92, -0.06], role: "spine" });

  // Spine joints
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.08, 0.02], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.26, 0.08], role: "spine" });

  // Neck joints (graceful S-curve)
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 1.42, 0.15], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 1.56, 0.20], role: "neck" });

  // Head joint
  const head = b.joint("head", {
    parent: neck2,
    at: [0, 1.68, 0.25],
    dir: [0, 0.08, 0.99],
    role: "head",
    group: "head",
  });

  // Jaw joint (hinge so the beak can open!)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.65, 0.29],
    dir: [0, -0.15, 0.98],
    role: "jaw",
    group: "head",
  });

  // Tail root joint
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.88, -0.22], role: "tail", group: "tail" });
=======
>>>>>>> REPLACE