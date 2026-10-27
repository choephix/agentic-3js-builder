The errors come from using nullable chain tips as parents, and from passing a string where `b.spike` requires an options object.

<<<<<<< SEARCH
      parent: torso.tip,
      names: ["neckBase", "neckTip"],
=======
      parent: torso.joints[2],
      names: ["neckBase", "neckTip"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    spike(at, at, 0.07, 0.022, "tailBarb");
=======
    spike(at, at, 0.07, 0.022, { color: STONE_DARK, name: "tailBarb" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    spike(at, at, 0.075, 0.028, "spineRidge");
=======
    spike(at, at, 0.075, 0.028, { color: STONE_DARK, name: "spineRidge" });
>>>>>>> REPLACE