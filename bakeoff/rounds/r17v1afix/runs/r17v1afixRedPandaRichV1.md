Cause: the front-leg IK target (the paw on the stone's sloped top) is at or just beyond the two 0.10 m segments' reach from the shoulder, so `limb` returns a straightened leg that stops short and the strict check throws.

<<<<<<< SEARCH
    const fl = limb(sh, pawT, [0.1, 0.1], [[s * 0.4, 0, -1]]);
    if (fl[2].distanceTo(new THREE.Vector3(...pawT)) > 1e-3) throw new Error("front leg too short");
=======
    const fl = limb(sh, pawT, [0.125, 0.125], [[s * 0.4, 0, -1]]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const hl = limb(hp, [hx, hg + 0.022, hz], [0.1, 0.1, 0.07], [[s * 0.3, 0, 1]], { sole: [0, 0, 1] });
=======
    const hl = limb(hp, [hx, hg + 0.022, hz], [0.11, 0.11, 0.08], [[s * 0.3, 0, 1]], { sole: [0, 0, 1] });
>>>>>>> REPLACE