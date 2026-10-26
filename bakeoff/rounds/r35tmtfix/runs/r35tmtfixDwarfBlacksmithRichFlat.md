The errors come from using nullable chain tips (`neck.tip`) as parents/bones, and passing `null` to the `spike` overload; use a definite neck joint and a tapered two-point sweep for point-ended spikes.

<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.68, 0.08], dir: [0, 0, 1], role: "head", group: "head" });
=======
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.68, 0.08], dir: [0, 0, 1], role: "head", group: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([s * 0.19, 2.00, 0.07], [s * 0.15, 0.12, -0.01], null, 0.045, { color: GOLD, bone: head, name: `helmetHorn${s}` });
=======
    b.sweep(
      [[s * 0.19, 2.00, 0.07], [s * 0.15, 2.12, 0.06]],
      [0.045, 0],
      { color: GOLD, bone: head, caps: { start: "flat", end: "point" }, name: `helmetHorn${s}` },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike([1.12, 0.78, 0.02], [0.32, 0, 0], null, 0.13, { color: STEEL, bone: anvilBone, name: "anvilHorn" });
=======
  b.sweep(
    [[1.12, 0.78, 0.02], [1.44, 0.78, 0.02]],
    [0.13, 0],
    { color: STEEL, bone: anvilBone, caps: { start: "flat", end: "point" }, name: "anvilHorn" },
  );
>>>>>>> REPLACE