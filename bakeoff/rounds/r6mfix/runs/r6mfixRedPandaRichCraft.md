The stone lathe is built before any joint exists, and the SDK needs a root joint to attach parts to, so I create the `hips` root joint before the stone and drop the later duplicate.

<<<<<<< SEARCH
  // ---------- stone & setting ----------
=======
  // root joint first: every part needs a joint to ride on
  const hips = b.joint("hips", { at: [0, BY, -0.2] });

  // ---------- stone & setting ----------
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hips = b.joint("hips", { at: [0, BY, -0.2] });
  const spinePts: V[] = [
=======
  const spinePts: V[] = [
>>>>>>> REPLACE