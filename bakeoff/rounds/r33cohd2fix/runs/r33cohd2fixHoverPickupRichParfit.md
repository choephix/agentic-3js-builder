The cab shell's `box` helper was called with an SVG texture (`hazard`) in the colour slot, but `b.part` colours take only a string or a paint; textures go in the `texture:` option.

<<<<<<< SEARCH
    box(0.02, 0.1, 1.9, hazard, [s * 1.16, 1.12, 0.2], { texture: hazard });
=======
    box(0.02, 0.1, 1.9, "#ffffff", [s * 1.16, 1.12, 0.2], { texture: hazard });
>>>>>>> REPLACE