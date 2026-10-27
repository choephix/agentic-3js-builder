Cause: `Chain.tip` is nullable unless a tip joint is explicitly created, `spike` tip overloads need a typed point form, and `WOOD` was never declared.

```text
<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: spine.tip,
=======
  const head = b.joint("head", {
    parent: spine.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.18, 0.18, 0.26], [0.18, 0.11, 0.13], LEATHER_DARK, legL.tip, "bootL");
  box(b, [0.18, 0.18, 0.26], [-0.18, 0.11, 0.13], LEATHER_DARK, legR.tip, "bootR");
  box(b, [0.205, 0.07, 0.27], [0.18, 0.19, 0.14], LEATHER, legL.tip, "bootL.top");
  box(b, [0.205, 0.07, 0.27], [-0.18, 0.19, 0.14], LEATHER, legR.tip, "bootR.top");
  box(b, [0.19, 0.035, 0.285], [0.18, 0.22, 0.14], BRASS, legL.tip, "bootL.cuff");
  box(b, [0.19, 0.035, 0.285], [-0.18, 0.22, 0.14], BRASS, legR.tip, "bootR.cuff");
=======
  box(b, [0.18, 0.18, 0.26], [0.18, 0.11, 0.13], LEATHER_DARK, legL.joints[2], "bootL");
  box(b, [0.18, 0.18, 0.26], [-0.18, 0.11, 0.13], LEATHER_DARK, legR.joints[2], "bootR");
  box(b, [0.205, 0.07, 0.27], [0.18, 0.19, 0.14], LEATHER, legL.joints[2], "bootL.top");
  box(b, [0.205, 0.07, 0.27], [-0.18, 0.19, 0.14], LEATHER, legR.joints[2], "bootR.top");
  box(b, [0.19, 0.035, 0.285], [0.18, 0.22, 0.14], BRASS, legL.joints[2], "bootL.cuff");
  box(b, [0.19, 0.035, 0.285], [-0.18, 0.22, 0.14], BRASS, legR.joints[2], "bootR.cuff");
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(b, 0.014, [s * 0.18, 0.095, 0.04 + i * 0.06], BRASS_HI, s > 0 ? legL.tip : legR.tip, "boot.stud");
=======
    sphere(b, 0.014, [s * 0.18, 0.095, 0.04 + i * 0.06], BRASS_HI, s > 0 ? legL.joints[2] : legR.joints[2], "boot.stud");
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(b, 0.095, [wrist[0], wrist[1] - 0.03, wrist[2] + 0.05], SKIN, arm.tip, "hand");
=======
    sphere(b, 0.095, [wrist[0], wrist[1] - 0.03, wrist[2] + 0.05], SKIN, arm.joints[3], "hand");
>>>>>>> REPLACE

<<<<<<< SEARCH
        { color: SKIN, bone: arm.tip, name: "finger" },
=======
        { color: SKIN, bone: arm.joints[3], name: "finger" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(b, 0.018, [wrist[0] - s * 0.06, wrist[1] - 0.02, wrist[2] + 0.045], SKIN_SHADOW, arm.tip, "thumb");
=======
    sphere(b, 0.018, [wrist[0] - s * 0.06, wrist[1] - 0.02, wrist[2] + 0.045], SKIN_SHADOW, arm.joints[3], "thumb");
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([s * 0.08, 1.67, 0.285], [s * 0.22, 1.61, 0.33], null, 0.06, {
=======
    b.spike([s * 0.08, 1.67, 0.285], [s * 0.22, 1.61, 0.33], undefined, 0.06, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([0.88, 0.84, 0.38], [1.25, 0.84, 0.38], null, 0.12, {
=======
    b.spike([0.88, 0.84, 0.38], [1.25, 0.84, 0.38], undefined, 0.12, {
>>>>>>> REPLACE

<<<<<<< SEARCH
const TUNIC_DARK = "#1c3039";
=======
const TUNIC_DARK = "#1c3039";
const WOOD = "#704326";
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.18, 0.08, 0.22], [-0.76, 0.38, -0.22], WOOD ?? "#704326", hips, "bellows nozzle");
  b.rod([-1.20, 0.43, -0.22], [-0.98, 0.43, -0.22], 0.018, { color: WOOD ?? "#704326", bone: hips, name: "bellows handle" });
=======
  box(b, [0.18, 0.08, 0.22], [-0.76, 0.38, -0.22], WOOD, hips, "bellows nozzle");
  b.rod([-1.20, 0.43, -0.22], [-0.98, 0.43, -0.22], 0.018, { color: WOOD, bone: hips, name: "bellows handle" });
>>>>>>> REPLACE
```