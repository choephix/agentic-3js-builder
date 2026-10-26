Cause: the spiral decal on the hind leg passed a `Chain` (`hl`) to `b.decal` and called `hl.at(0.12, -s * 90)`, but a chain's `at` takes only `t` and a chain isn't a surface target; the leg's tube is a `Sweep`, so I keep that sweep and use it for both.

<<<<<<< SEARCH
    b.sweep(hl, [0.11, 0.075, 0.055, 0.05], { color: LEG, sides: 8 });
=======
    const hlTube = b.sweep(hl, [0.11, 0.075, 0.055, 0.05], { color: LEG, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(hl, SPIRAL, { at: hl.at(0.12, -s * 90).at, dir: [s, 0, 0], size: [0.17, 0.17] });
=======
    b.decal(hlTube, SPIRAL, { at: hlTube.at(0.12, s * 90).at, dir: [s, 0, 0], size: [0.17, 0.17] });
>>>>>>> REPLACE