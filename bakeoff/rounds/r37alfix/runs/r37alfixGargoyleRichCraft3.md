```ts
// Cause: chain.tip is nullable, and passing a nullable Joint as parent/bone makes overload resolution fail; assert each required tip is present and narrow the related handle.

<<<<<<< SEARCH
    const palm = arm.tip;
=======
    const palm = arm.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = leg.tip;
=======
    const foot = leg.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const wingArm = b.chain(`wing${s > 0 ? "L" : "R"}`, armPts, {
=======
    const wingArm = b.chain(`wing${s > 0 ? "L" : "R"}`, armPts, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(wingArm, [0.075, 0.035], {
=======
    b.sweep(wingArm, [0.075, 0.035], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: wingArm.tip, names: [`wingFingerC${s}`, `wingFingerCTip${s}`], role: "digit", group: "wings",
=======
      parent: wingArm.tip!, names: [`wingFingerC${s}`, `wingFingerCTip${s}`], role: "digit", group: "wings",
>>>>>>> REPLACE

<<<<<<< SEARCH
        wingArm.at(0.78).at,
=======
        wingArm.at(0.78).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: wingArm.joints[1], names: [`wingFingerB${s}`, `wingFingerBTip${s}`], role: "digit", group: "wings",
=======
      parent: wingArm.joints[1], names: [`wingFingerB${s}`, `wingFingerBTip${s}`], role: "digit", group: "wings",
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: wingArm.joints[0], names: [`wingFingerA${s}`, `wingFingerATip${s}`], role: "digit", group: "wings",
=======
      parent: wingArm.joints[0], names: [`wingFingerA${s}`, `wingFingerATip${s}`], role: "digit", group: "wings",
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = tail.at(t);
=======
    const p = tail.at(t);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.membrane(inner, finger1, {
=======
    b.membrane(inner, finger1, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const mossFrames = [
=======
  const mossFrames = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  ].map((p) => b.surface(b.root).nearest(p));
=======
  ].map((p) => b.surface(b.root).nearest(p)).filter((p): p is NonNullable<typeof p> => p !== null);
>>>>>>> REPLACE

<<<<<<< SEARCH
    mossFrames.filter(Boolean) as any,
=======
    mossFrames,
>>>>>>> REPLACE
```