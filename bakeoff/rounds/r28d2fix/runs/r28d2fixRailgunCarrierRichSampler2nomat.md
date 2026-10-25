The stripe decal call passed the texture object (`STRIPE as any`) as the `color` argument of `b.part`, which only takes a colour string or paint; the texture belongs in the `texture:` option.

<<<<<<< SEARCH
    b.part(box(0.04, 0.12, 1.0), STRIPE as any, { bone: chassis, at: [s * 1.31, 1.18, 1.2], texture: STRIPE, color: "#ffffff" } as any);
=======
    b.part(box(0.04, 0.12, 1.0), "#ffffff", { bone: chassis, at: [s * 1.31, 1.18, 1.2], texture: STRIPE });
>>>>>>> REPLACE